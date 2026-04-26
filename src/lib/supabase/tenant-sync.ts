import type { SupabaseClient } from "@supabase/supabase-js";
import { addMonths, todayISODate } from "@/lib/date";
import type {
  CheckType,
  DocumentRecord,
  IncomeRecord,
  RentalHistory,
  TenantPassport,
  TenantReference,
  UserProfile,
  VerificationCheck,
} from "@/lib/types";

export type TenantWorkspace = {
  profile: UserProfile;
  passport: TenantPassport;
  documents: DocumentRecord[];
  income?: IncomeRecord;
  rentalHistory?: RentalHistory;
  references: TenantReference[];
  checks: VerificationCheck[];
};

const CHECK_TYPES: CheckType[] = ["identity", "cpf", "credit", "fraud", "income"];

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numeric(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isoDate(value: unknown, fallback = "") {
  if (typeof value !== "string" || !value) {
    return fallback;
  }

  return value.includes("T") ? value.slice(0, 10) : value;
}

function timestamp(value: unknown) {
  return typeof value === "string" && value ? value : new Date().toISOString();
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function normalizeProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: text(row.id),
    auth_user_id: text(row.auth_user_id),
    account_type: "tenant",
    full_name: text(row.full_name),
    cpf: text(row.cpf),
    birth_date: isoDate(row.birth_date),
    phone: text(row.phone),
    email: text(row.email),
    marital_status: text(row.marital_status),
    city: text(row.city),
    state: text(row.state),
    current_address: text(row.current_address),
    profession: text(row.profession),
    lgpd_consent: Boolean(row.lgpd_consent),
    created_at: timestamp(row.created_at),
    updated_at: timestamp(row.updated_at),
  };
}

function normalizePassport(row: Record<string, unknown>): TenantPassport {
  return {
    id: text(row.id),
    user_id: text(row.user_id),
    status: (text(row.status) || "draft") as TenantPassport["status"],
    completion_percentage: numeric(row.completion_percentage),
    issue_date: isoDate(row.issue_date, todayISODate()),
    expiration_date: isoDate(row.expiration_date, addMonths(todayISODate(), 6)),
    public_token: text(row.public_token),
    recommended_rent: numeric(row.recommended_rent),
    profile_level: (text(row.profile_level) || "basic") as TenantPassport["profile_level"],
    created_at: timestamp(row.created_at),
    updated_at: timestamp(row.updated_at),
  };
}

function normalizeDocument(row: Record<string, unknown>): DocumentRecord {
  return {
    id: text(row.id),
    passport_id: text(row.passport_id),
    document_type: text(row.document_type),
    file_url: text(row.file_url),
    file_name: text(row.file_name),
    status: (text(row.status) || "pending") as DocumentRecord["status"],
    rejection_reason: text(row.rejection_reason) || undefined,
    created_at: timestamp(row.created_at),
  };
}

function normalizeIncome(row: Record<string, unknown>): IncomeRecord {
  return {
    id: text(row.id),
    passport_id: text(row.passport_id),
    income_type: (text(row.income_type) || "CLT") as IncomeRecord["income_type"],
    declared_income: numeric(row.declared_income),
    verified_income: numeric(row.verified_income),
    company_name: text(row.company_name),
    activity_time: text(row.activity_time),
    complementary_income: numeric(row.complementary_income),
    proof_file_url: text(row.proof_file_url) || undefined,
    status: (text(row.status) || "pending") as IncomeRecord["status"],
    created_at: timestamp(row.created_at),
  };
}

function normalizeHistory(row: Record<string, unknown>): RentalHistory {
  return {
    id: text(row.id),
    passport_id: text(row.passport_id),
    has_rented_before: Boolean(row.has_rented_before),
    previous_landlord_name: text(row.previous_landlord_name),
    previous_landlord_contact: text(row.previous_landlord_contact),
    rental_period: text(row.rental_period),
    rent_amount: numeric(row.rent_amount),
    paid_on_time: Boolean(row.paid_on_time),
    proof_file_url: text(row.proof_file_url) || undefined,
    notes: text(row.notes),
    created_at: timestamp(row.created_at),
  };
}

function normalizeReference(row: Record<string, unknown>): TenantReference {
  return {
    id: text(row.id),
    passport_id: text(row.passport_id),
    name: text(row.name),
    relationship: text(row.relationship),
    email: text(row.email),
    phone: text(row.phone),
    status: (text(row.status) || "pending") as TenantReference["status"],
    notes: text(row.notes),
    created_at: timestamp(row.created_at),
  };
}

function normalizeCheck(row: Record<string, unknown>): VerificationCheck {
  return {
    id: text(row.id),
    passport_id: text(row.passport_id),
    check_type: (text(row.check_type) || "identity") as CheckType,
    provider: (text(row.provider) || "mock") as VerificationCheck["provider"],
    status: (text(row.status) || "pending") as VerificationCheck["status"],
    score: numeric(row.score),
    raw_response: objectValue(row.raw_response),
    checked_at: text(row.checked_at) || undefined,
  };
}

function buildPendingChecks(passportId: string): VerificationCheck[] {
  return CHECK_TYPES.map((checkType) => ({
    id: `remote-${passportId}-${checkType}`,
    passport_id: passportId,
    check_type: checkType,
    provider: "mock",
    status: "pending",
    score: 0,
    raw_response: {},
  }));
}

export async function fetchTenantWorkspace(
  supabase: SupabaseClient,
  authUserId: string,
): Promise<TenantWorkspace | null> {
  const { data: rawProfile, error: profileError } = await supabase
    .from("users_profile")
    .select("*")
    .eq("auth_user_id", authUserId)
    .eq("account_type", "tenant")
    .maybeSingle();

  if (profileError || !rawProfile) {
    return null;
  }

  const profile = normalizeProfile(rawProfile as Record<string, unknown>);

  let { data: rawPassport } = await supabase
    .from("tenant_passports")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!rawPassport) {
    const { data: createdPassport } = await supabase
      .from("tenant_passports")
      .insert({
        user_id: profile.id,
        status: "draft",
        completion_percentage: 0,
        issue_date: todayISODate(),
        expiration_date: addMonths(todayISODate(), 6),
        recommended_rent: 0,
        profile_level: "basic",
      })
      .select("*")
      .single();

    rawPassport = createdPassport ?? null;
  }

  if (!rawPassport) {
    return null;
  }

  const passport = normalizePassport(rawPassport as Record<string, unknown>);

  const [
    { data: rawDocuments },
    { data: rawIncome },
    { data: rawHistory },
    { data: rawReferences },
    { data: rawChecks },
  ] = await Promise.all([
    supabase.from("documents").select("*").eq("passport_id", passport.id).order("created_at", { ascending: true }),
    supabase.from("income_records").select("*").eq("passport_id", passport.id).maybeSingle(),
    supabase.from("rental_history").select("*").eq("passport_id", passport.id).maybeSingle(),
    supabase.from("references").select("*").eq("passport_id", passport.id).order("created_at", { ascending: true }),
    supabase
      .from("verification_checks")
      .select("*")
      .eq("passport_id", passport.id)
      .order("checked_at", { ascending: false, nullsFirst: false }),
  ]);

  return {
    profile,
    passport,
    documents: (rawDocuments ?? []).map((row) => normalizeDocument(row as Record<string, unknown>)),
    income: rawIncome ? normalizeIncome(rawIncome as Record<string, unknown>) : undefined,
    rentalHistory: rawHistory ? normalizeHistory(rawHistory as Record<string, unknown>) : undefined,
    references: (rawReferences ?? []).map((row) => normalizeReference(row as Record<string, unknown>)),
    checks:
      rawChecks && rawChecks.length > 0
        ? rawChecks.map((row) => normalizeCheck(row as Record<string, unknown>))
        : buildPendingChecks(passport.id),
  };
}
