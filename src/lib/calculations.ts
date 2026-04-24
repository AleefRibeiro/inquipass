import type {
  DocumentRecord,
  PassportSnapshot,
  ProfileLevel,
  UserProfile,
  VerificationCheck,
} from "@/lib/types";

const requiredProfileFields: Array<keyof UserProfile> = [
  "full_name",
  "cpf",
  "birth_date",
  "email",
  "phone",
  "marital_status",
  "profession",
  "city",
  "state",
  "current_address",
];

const requiredDocumentTypes = ["rg_cnh", "residence_proof", "income_proof"];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function calculateRecommendedRent(verifiedIncome: number) {
  return Math.round((Number(verifiedIncome) || 0) * 0.3);
}

export function calculateCompletion(snapshot: PassportSnapshot) {
  const profile = snapshot.profile;
  const profileReady =
    !!profile &&
    requiredProfileFields.every((field) => Boolean(profile[field])) &&
    profile.lgpd_consent;

  const requiredDocsReady = requiredDocumentTypes.every((type) =>
    snapshot.documents.some(
      (document) =>
        document.document_type === type &&
        ["uploaded", "in_review", "approved"].includes(document.status),
    ),
  );

  const incomeReady =
    !!snapshot.income &&
    snapshot.income.declared_income > 0 &&
    snapshot.income.verified_income > 0 &&
    Boolean(snapshot.income.company_name);

  const historyReady =
    !!snapshot.rentalHistory &&
    (snapshot.rentalHistory.has_rented_before
      ? Boolean(snapshot.rentalHistory.previous_landlord_name)
      : true);

  const referenceReady = snapshot.references.length > 0;
  const checksReady = snapshot.checks.length >= 5;
  const verifiedChecks = snapshot.checks.filter((check) => check.status === "verified").length;
  const checksCompletion = checksReady ? verifiedChecks / snapshot.checks.length : 0;

  const weighted =
    (profileReady ? 18 : 0) +
    (requiredDocsReady ? 18 : 0) +
    (incomeReady ? 20 : 0) +
    (historyReady ? 12 : 0) +
    (referenceReady ? 12 : 0) +
    checksCompletion * 20;

  return Math.min(100, Math.round(weighted));
}

export function getProfileLevel(completion: number, checks: VerificationCheck[]): ProfileLevel {
  const allVerified = checks.length > 0 && checks.every((check) => check.status === "verified");

  if (completion >= 90 && allVerified) {
    return "verified";
  }

  if (completion >= 70) {
    return "complete";
  }

  return "basic";
}

export function countApprovedDocuments(documents: DocumentRecord[]) {
  return documents.filter((document) => document.status === "approved").length;
}

export function documentLabel(type: string) {
  const labels: Record<string, string> = {
    rg_cnh: "RG ou CNH",
    residence_proof: "Comprovante de residencia",
    income_proof: "Comprovante de renda",
    previous_contract: "Contrato de aluguel anterior",
    rent_receipts: "Recibos de aluguel",
  };

  return labels[type] ?? type;
}

export function verificationLabel(type: string) {
  const labels: Record<string, string> = {
    identity: "Identidade",
    cpf: "CPF",
    credit: "Credito",
    fraud: "Antifraude",
    income: "Renda",
  };

  return labels[type] ?? type;
}
