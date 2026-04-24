import {
  mockCpfProvider,
  mockCreditProvider,
  mockFraudProvider,
  mockIdentityProvider,
  mockIncomeProvider,
  mockSignatureProvider,
} from "@/lib/providers/mock-providers";

export const identityProvider = mockIdentityProvider;
export const cpfProvider = mockCpfProvider;
export const creditProvider = mockCreditProvider;
export const incomeProvider = mockIncomeProvider;
export const fraudProvider = mockFraudProvider;
export const signatureProvider = mockSignatureProvider;

export async function runVerificationSuite(passportId: string) {
  const [identity, cpf, credit, fraud, income] = await Promise.all([
    identityProvider.verifyIdentity(passportId),
    cpfProvider.verifyIdentity(passportId),
    creditProvider.verifyCredit(passportId),
    fraudProvider.verifyFraudRisk(passportId),
    incomeProvider.verifyIncome(passportId),
  ]);

  return [identity, cpf, credit, fraud, income];
}
