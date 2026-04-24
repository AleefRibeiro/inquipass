import type { VerificationCheck } from "@/lib/types";

export interface IdentityProvider {
  verifyIdentity(passportId: string): Promise<VerificationCheck>;
}

export interface CreditProvider {
  verifyCredit(passportId: string): Promise<VerificationCheck>;
}

export interface IncomeProvider {
  verifyIncome(passportId: string): Promise<VerificationCheck>;
}

export interface SignatureProvider {
  createConsentEnvelope(passportId: string): Promise<{ envelopeId: string; status: "created" }>;
}

export interface FraudProvider {
  verifyFraudRisk(passportId: string): Promise<VerificationCheck>;
}
