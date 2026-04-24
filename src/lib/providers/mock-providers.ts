import type {
  CreditProvider,
  FraudProvider,
  IdentityProvider,
  IncomeProvider,
  SignatureProvider,
} from "@/lib/providers/types";
import type { CheckType, VerificationCheck } from "@/lib/types";

function mockCheck(passportId: string, checkType: CheckType, score: number): VerificationCheck {
  return {
    id: `check-${passportId}-${checkType}`,
    passport_id: passportId,
    check_type: checkType,
    provider: "mock",
    status: "verified",
    score,
    raw_response: {
      provider: "mock",
      approved: true,
      note: "Resultado simulado para o MVP. Substituir pelo provider real.",
    },
    checked_at: new Date().toISOString(),
  };
}

export const mockIdentityProvider: IdentityProvider = {
  async verifyIdentity(passportId) {
    return mockCheck(passportId, "identity", 96);
  },
};

export const mockCpfProvider: IdentityProvider = {
  async verifyIdentity(passportId) {
    return mockCheck(passportId, "cpf", 94);
  },
};

export const mockCreditProvider: CreditProvider = {
  async verifyCredit(passportId) {
    return mockCheck(passportId, "credit", 82);
  },
};

export const mockIncomeProvider: IncomeProvider = {
  async verifyIncome(passportId) {
    return mockCheck(passportId, "income", 88);
  },
};

export const mockFraudProvider: FraudProvider = {
  async verifyFraudRisk(passportId) {
    return mockCheck(passportId, "fraud", 91);
  },
};

export const mockSignatureProvider: SignatureProvider = {
  async createConsentEnvelope(passportId) {
    return {
      envelopeId: `mock-clicksign-${passportId}`,
      status: "created",
    };
  },
};
