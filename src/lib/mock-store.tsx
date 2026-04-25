"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateCompletion, calculateRecommendedRent, getProfileLevel } from "@/lib/calculations";
import { todayISODate, addMonths } from "@/lib/date";
import { createInitialState } from "@/lib/sample-data";
import { runVerificationSuite } from "@/lib/providers";
import type {
  AccountType,
  CheckType,
  DocumentStatus,
  IncomeRecord,
  InquiPassState,
  MockAccount,
  PassportSnapshot,
  RentalHistory,
  ShareAccessLog,
  TenantPassport,
  TenantReference,
  UserProfile,
} from "@/lib/types";

const STORAGE_KEY = "inquipass:mvp:v1";

type RegisterInput = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  account_type: AccountType;
  company_name?: string;
};

function id(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function cloneState(state: InquiPassState): InquiPassState {
  return JSON.parse(JSON.stringify(state)) as InquiPassState;
}

function readState() {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = createInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(stored) as InquiPassState;
  } catch {
    const initial = createInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function buildSnapshot(state: InquiPassState, passportId: string): PassportSnapshot | undefined {
  const passport = state.tenant_passports.find((item) => item.id === passportId);
  if (!passport) {
    return undefined;
  }

  return {
    passport,
    profile: state.users_profile.find((profile) => profile.id === passport.user_id),
    documents: state.documents.filter((document) => document.passport_id === passport.id),
    income: state.income_records.find((income) => income.passport_id === passport.id),
    rentalHistory: state.rental_history.find((history) => history.passport_id === passport.id),
    references: state.references.filter((reference) => reference.passport_id === passport.id),
    checks: state.verification_checks.filter((check) => check.passport_id === passport.id),
  };
}

function recompute(state: InquiPassState): InquiPassState {
  const next = cloneState(state);

  next.tenant_passports = next.tenant_passports.map((passport) => {
    const snapshot = buildSnapshot(next, passport.id);
    if (!snapshot) {
      return passport;
    }

    const income = snapshot.income;
    const completion = calculateCompletion(snapshot);
    const recommendedRent = calculateRecommendedRent(income?.verified_income ?? 0);

    return {
      ...passport,
      completion_percentage: completion,
      recommended_rent: recommendedRent,
      profile_level: getProfileLevel(completion, snapshot.checks),
      updated_at: new Date().toISOString(),
    };
  });

  return next;
}

function persist(state: InquiPassState) {
  const computed = recompute(state);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(computed));
  window.dispatchEvent(new CustomEvent("inquipass-store-updated"));
  return computed;
}

export function useInquiPassStore() {
  const [state, setState] = useState<InquiPassState | null>(null);

  useEffect(() => {
    const onChange = () => setState(readState());
    queueMicrotask(onChange);

    window.addEventListener("storage", onChange);
    window.addEventListener("inquipass-store-updated", onChange);

    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("inquipass-store-updated", onChange);
    };
  }, []);

  const update = (recipe: (draft: InquiPassState) => void) => {
    const current = cloneState(state ?? readState());
    recipe(current);
    const next = persist(current);
    setState(next);
    return next;
  };

  const activeAccount = useMemo(
    () => state?.accounts.find((account) => account.id === state.current_user_id),
    [state],
  );

  const activeProfile = useMemo(() => {
    if (!state || !activeAccount) {
      return undefined;
    }

    return state.users_profile.find((profile) => profile.auth_user_id === activeAccount.auth_user_id);
  }, [activeAccount, state]);

  const activePassport = useMemo(() => {
    if (!state || !activeProfile) {
      return undefined;
    }

    return state.tenant_passports.find((passport) => passport.user_id === activeProfile.id);
  }, [activeProfile, state]);

  const activeSnapshot = useMemo(() => {
    if (!state || !activePassport) {
      return undefined;
    }

    return buildSnapshot(state, activePassport.id);
  }, [activePassport, state]);

  return {
    state,
    ready: state !== null,
    activeAccount,
    activeProfile,
    activePassport,
    activeSnapshot,
    demoCredentials: [
      "Inquilino: marina@demo.com / 123456",
      "Imobiliaria: imobiliaria@demo.com / 123456",
      "Admin: admin@demo.com / 123456",
    ],
    resetDemo() {
      const initial = createInitialState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setState(initial);
    },
    login(email: string, password: string) {
      let success = false;
      let accountType: AccountType | undefined;

      update((draft) => {
        const account = draft.accounts.find(
          (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password,
        );

        if (account) {
          draft.current_user_id = account.id;
          success = true;
          accountType = account.account_type;
        }
      });

      return { success, accountType };
    },
    adoptAuthenticatedAccount(input: {
      auth_user_id: string;
      account_type: AccountType;
      full_name: string;
      email: string;
      phone?: string;
      company_name?: string;
    }) {
      update((draft) => {
        const existing = draft.accounts.find(
          (account) =>
            account.auth_user_id === input.auth_user_id ||
            account.email.toLowerCase() === input.email.toLowerCase(),
        );

        if (existing) {
          Object.assign(existing, {
            auth_user_id: input.auth_user_id,
            account_type: input.account_type,
            full_name: input.full_name,
            email: input.email,
            phone: input.phone ?? existing.phone,
            company_name: input.company_name ?? existing.company_name,
          });
          draft.current_user_id = existing.id;
          return;
        }

        const account: MockAccount = {
          id: id("account"),
          auth_user_id: input.auth_user_id,
          account_type: input.account_type,
          full_name: input.full_name,
          email: input.email,
          phone: input.phone ?? "",
          password: "",
          company_name: input.company_name,
          created_at: new Date().toISOString(),
        };

        draft.accounts.push(account);
        draft.current_user_id = account.id;
      });
    },
    logout() {
      update((draft) => {
        draft.current_user_id = null;
      });
    },
    register(input: RegisterInput) {
      let account: MockAccount | undefined;

      update((draft) => {
        const authId = id("auth");
        account = {
          id: id("account"),
          auth_user_id: authId,
          account_type: input.account_type,
          full_name: input.full_name,
          email: input.email,
          phone: input.phone,
          password: input.password,
          company_name: input.company_name,
          created_at: new Date().toISOString(),
        };

        draft.accounts.push(account);
        draft.current_user_id = account.id;

        if (input.account_type === "tenant") {
          const profile: UserProfile = {
            id: id("profile"),
            auth_user_id: authId,
            account_type: "tenant",
            full_name: input.full_name,
            cpf: "",
            birth_date: "",
            phone: input.phone,
            email: input.email,
            marital_status: "",
            city: "",
            state: "",
            current_address: "",
            profession: "",
            lgpd_consent: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const passport: TenantPassport = {
            id: id("passport"),
            user_id: profile.id,
            status: "draft",
            completion_percentage: 0,
            issue_date: todayISODate(),
            expiration_date: addMonths(todayISODate(), 6),
            public_token: id("share").replace("share-", ""),
            recommended_rent: 0,
            profile_level: "basic",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          draft.users_profile.push(profile);
          draft.tenant_passports.push(passport);
          (["identity", "cpf", "credit", "fraud", "income"] as CheckType[]).forEach((checkType) => {
            draft.verification_checks.push({
              id: id("check"),
              passport_id: passport.id,
              check_type: checkType,
              provider: "mock",
              status: "pending",
              score: 0,
              raw_response: {},
            });
          });
        }
      });

      return account;
    },
    updateProfile(values: Partial<UserProfile>) {
      update((draft) => {
        if (!activeProfile) {
          return;
        }

        draft.users_profile = draft.users_profile.map((profile) =>
          profile.id === activeProfile.id
            ? { ...profile, ...values, updated_at: new Date().toISOString() }
            : profile,
        );
      });
    },
    upsertDocument(values: {
      passport_id: string;
      document_type: string;
      file_name: string;
      file_url: string;
      status?: DocumentStatus;
    }) {
      update((draft) => {
        const existing = draft.documents.find(
          (document) =>
            document.passport_id === values.passport_id &&
            document.document_type === values.document_type,
        );

        if (existing) {
          Object.assign(existing, {
            file_name: values.file_name,
            file_url: values.file_url,
            status: values.status ?? "uploaded",
            rejection_reason: undefined,
          });
          return;
        }

        draft.documents.push({
          id: id("doc"),
          passport_id: values.passport_id,
          document_type: values.document_type,
          file_name: values.file_name,
          file_url: values.file_url,
          status: values.status ?? "uploaded",
          created_at: new Date().toISOString(),
        });
      });
    },
    updateDocumentStatus(documentId: string, status: DocumentStatus, rejection_reason?: string) {
      update((draft) => {
        draft.documents = draft.documents.map((document) =>
          document.id === documentId ? { ...document, status, rejection_reason } : document,
        );
      });
    },
    updateIncome(passportId: string, values: Partial<IncomeRecord>) {
      update((draft) => {
        const existing = draft.income_records.find((income) => income.passport_id === passportId);

        if (existing) {
          Object.assign(existing, values);
          return;
        }

        draft.income_records.push({
          id: id("income"),
          passport_id: passportId,
          income_type: "CLT",
          declared_income: 0,
          verified_income: 0,
          company_name: "",
          activity_time: "",
          complementary_income: 0,
          status: "pending",
          created_at: new Date().toISOString(),
          ...values,
        });
      });
    },
    updateHistory(passportId: string, values: Partial<RentalHistory>) {
      update((draft) => {
        const existing = draft.rental_history.find((history) => history.passport_id === passportId);

        if (existing) {
          Object.assign(existing, values);
          return;
        }

        draft.rental_history.push({
          id: id("history"),
          passport_id: passportId,
          has_rented_before: false,
          previous_landlord_name: "",
          previous_landlord_contact: "",
          rental_period: "",
          rent_amount: 0,
          paid_on_time: true,
          notes: "",
          created_at: new Date().toISOString(),
          ...values,
        });
      });
    },
    addReference(passportId: string, values: Omit<TenantReference, "id" | "passport_id" | "created_at">) {
      update((draft) => {
        const count = draft.references.filter((reference) => reference.passport_id === passportId).length;
        if (count >= 3) {
          return;
        }

        draft.references.push({
          id: id("ref"),
          passport_id: passportId,
          created_at: new Date().toISOString(),
          ...values,
        });
      });
    },
    removeReference(referenceId: string) {
      update((draft) => {
        draft.references = draft.references.filter((reference) => reference.id !== referenceId);
      });
    },
    async simulateVerifications(passportId: string) {
      const checks = await runVerificationSuite(passportId);

      update((draft) => {
        draft.verification_checks = draft.verification_checks.map((check) => {
          const result = checks.find((item) => item.check_type === check.check_type);
          return result ?? check;
        });
      });
    },
    markIncomeVerified(passportId: string) {
      update((draft) => {
        const income = draft.income_records.find((item) => item.passport_id === passportId);
        if (income) {
          income.status = "verified";
          income.verified_income = income.verified_income || income.declared_income;
        }
      });
    },
    markPassportVerified(passportId: string) {
      update((draft) => {
        draft.tenant_passports = draft.tenant_passports.map((passport) =>
          passport.id === passportId ? { ...passport, status: "verified" } : passport,
        );
      });
    },
    ensureShareToken(passportId: string) {
      let token = "";
      update((draft) => {
        draft.tenant_passports = draft.tenant_passports.map((passport) => {
          if (passport.id !== passportId) {
            return passport;
          }

          token = passport.public_token || id("share").replace("share-", "");
          return { ...passport, public_token: token };
        });
      });
      return token;
    },
    registerAccess(values: Omit<ShareAccessLog, "id" | "created_at">) {
      update((draft) => {
        draft.share_access_logs.unshift({
          id: id("access"),
          created_at: new Date().toISOString(),
          ...values,
        });
      });
    },
    getSnapshot(passportId: string) {
      if (!state) {
        return undefined;
      }

      return buildSnapshot(state, passportId);
    },
    getPassportByToken(token: string) {
      return state?.tenant_passports.find((passport) => passport.public_token === token);
    },
    getProfileByPassport(passportId: string) {
      const passport = state?.tenant_passports.find((item) => item.id === passportId);
      return state?.users_profile.find((profile) => profile.id === passport?.user_id);
    },
  };
}
