import { addMonths } from "@/lib/date";
import { calculateRecommendedRent } from "@/lib/calculations";
import type {
  CheckType,
  InquiPassState,
  MockAccount,
  TenantPassport,
  UserProfile,
  VerificationCheck,
} from "@/lib/types";

const now = "2026-04-24T12:00:00.000Z";

const accounts: MockAccount[] = [
  {
    id: "account-tenant-demo",
    auth_user_id: "auth-tenant-demo",
    account_type: "tenant",
    full_name: "Marina Costa",
    email: "marina@demo.com",
    phone: "(11) 99999-0101",
    password: "123456",
    created_at: now,
  },
  {
    id: "account-agency-demo",
    auth_user_id: "auth-agency-demo",
    account_type: "agency",
    full_name: "Lucas Andrade",
    email: "imobiliaria@demo.com",
    phone: "(11) 97777-0202",
    password: "123456",
    company_name: "Norte Sul Imoveis",
    created_at: now,
  },
  {
    id: "account-admin-demo",
    auth_user_id: "auth-admin-demo",
    account_type: "admin",
    full_name: "Admin InquiPass",
    email: "admin@demo.com",
    phone: "(11) 96666-0303",
    password: "123456",
    created_at: now,
  },
];

const userProfile: UserProfile = {
  id: "profile-tenant-demo",
  auth_user_id: "auth-tenant-demo",
  account_type: "tenant",
  full_name: "Marina Costa",
  cpf: "123.456.789-00",
  birth_date: "1992-06-12",
  phone: "(11) 99999-0101",
  email: "marina@demo.com",
  marital_status: "Solteira",
  city: "Sao Paulo",
  state: "SP",
  current_address: "Rua Bela Cintra, 1200 - Sao Paulo, SP",
  profession: "Product Manager",
  lgpd_consent: true,
  created_at: now,
  updated_at: now,
};

const passport: TenantPassport = {
  id: "passport-tenant-demo",
  user_id: "profile-tenant-demo",
  status: "draft",
  completion_percentage: 68,
  issue_date: "2026-04-24",
  expiration_date: addMonths("2026-04-24", 6),
  public_token: "demo-marina-costa",
  recommended_rent: calculateRecommendedRent(9200),
  profile_level: "complete",
  created_at: now,
  updated_at: now,
};

const checkTypes: CheckType[] = ["identity", "cpf", "credit", "fraud", "income"];

const checks: VerificationCheck[] = checkTypes.map((checkType, index) => ({
  id: `check-${checkType}`,
  passport_id: passport.id,
  check_type: checkType,
  provider: "mock",
  status: index < 2 ? "verified" : "pending",
  score: index < 2 ? 92 - index : 0,
  raw_response: index < 2 ? { source: "mock", result: "approved" } : {},
  checked_at: index < 2 ? now : undefined,
}));

export function createInitialState(): InquiPassState {
  return {
    current_user_id: null,
    accounts,
    users_profile: [userProfile],
    tenant_passports: [passport],
    documents: [
      {
        id: "doc-rg-cnh",
        passport_id: passport.id,
        document_type: "rg_cnh",
        file_url: "mock://rg-cnh.pdf",
        file_name: "cnh-marina.pdf",
        status: "approved",
        created_at: now,
      },
      {
        id: "doc-residence",
        passport_id: passport.id,
        document_type: "residence_proof",
        file_url: "mock://residencia.pdf",
        file_name: "comprovante-residencia.pdf",
        status: "in_review",
        created_at: now,
      },
      {
        id: "doc-income",
        passport_id: passport.id,
        document_type: "income_proof",
        file_url: "mock://holerite.pdf",
        file_name: "holerite.pdf",
        status: "uploaded",
        created_at: now,
      },
    ],
    income_records: [
      {
        id: "income-tenant-demo",
        passport_id: passport.id,
        income_type: "CLT",
        declared_income: 9800,
        verified_income: 9200,
        company_name: "Atlas Tecnologia",
        activity_time: "3 anos",
        complementary_income: 700,
        proof_file_url: "mock://holerite.pdf",
        status: "pending",
        created_at: now,
      },
    ],
    rental_history: [
      {
        id: "history-tenant-demo",
        passport_id: passport.id,
        has_rented_before: true,
        previous_landlord_name: "Imobiliaria Jardim",
        previous_landlord_contact: "contato@jardim.com.br",
        rental_period: "2022 - 2025",
        rent_amount: 2600,
        paid_on_time: true,
        proof_file_url: "mock://recibos.pdf",
        notes: "Contrato encerrado sem pendencias informadas.",
        created_at: now,
      },
    ],
    references: [
      {
        id: "ref-1",
        passport_id: passport.id,
        name: "Renata Souza",
        relationship: "Gestora direta",
        email: "renata@atlas.com",
        phone: "(11) 98888-1212",
        status: "confirmed",
        notes: "Referencia profissional cadastrada para contato futuro.",
        created_at: now,
      },
    ],
    verification_checks: checks,
    share_access_logs: [
      {
        id: "access-demo-1",
        passport_id: passport.id,
        viewer_name: "Lucas Andrade",
        viewer_email: "imobiliaria@demo.com",
        viewer_company: "Norte Sul Imoveis",
        viewer_document: "12.345.678/0001-90",
        access_reason: "Analise inicial para locacao",
        ip_address: "127.0.0.1",
        created_at: now,
      },
    ],
  };
}
