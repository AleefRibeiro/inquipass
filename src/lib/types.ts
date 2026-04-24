export type AccountType = "tenant" | "agency" | "admin";

export type PassportStatus = "draft" | "in_review" | "verified" | "expired";
export type DocumentStatus = "pending" | "uploaded" | "in_review" | "approved" | "rejected";
export type VerificationStatus = "pending" | "verified";
export type ProfileLevel = "basic" | "complete" | "verified";
export type IncomeType = "CLT" | "PJ" | "autonomo" | "aposentado" | "estudante" | "outro";

export type CheckType = "identity" | "cpf" | "credit" | "fraud" | "income";
export type ProviderName = "mock" | "serasa" | "quod" | "unico" | "clicksign" | "pluggy";

export interface MockAccount {
  id: string;
  auth_user_id: string;
  account_type: AccountType;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  company_name?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  auth_user_id: string;
  account_type: AccountType;
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email: string;
  marital_status: string;
  city: string;
  state: string;
  current_address: string;
  profession: string;
  lgpd_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantPassport {
  id: string;
  user_id: string;
  status: PassportStatus;
  completion_percentage: number;
  issue_date: string;
  expiration_date: string;
  public_token: string;
  recommended_rent: number;
  profile_level: ProfileLevel;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  passport_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  status: DocumentStatus;
  rejection_reason?: string;
  created_at: string;
}

export interface IncomeRecord {
  id: string;
  passport_id: string;
  income_type: IncomeType;
  declared_income: number;
  verified_income: number;
  company_name: string;
  activity_time: string;
  complementary_income: number;
  proof_file_url?: string;
  status: VerificationStatus;
  created_at: string;
}

export interface RentalHistory {
  id: string;
  passport_id: string;
  has_rented_before: boolean;
  previous_landlord_name: string;
  previous_landlord_contact: string;
  rental_period: string;
  rent_amount: number;
  paid_on_time: boolean;
  proof_file_url?: string;
  notes: string;
  created_at: string;
}

export interface TenantReference {
  id: string;
  passport_id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  status: "pending" | "requested" | "confirmed";
  notes: string;
  created_at: string;
}

export interface VerificationCheck {
  id: string;
  passport_id: string;
  check_type: CheckType;
  provider: ProviderName;
  status: VerificationStatus;
  score: number;
  raw_response: Record<string, unknown>;
  checked_at?: string;
}

export interface ShareAccessLog {
  id: string;
  passport_id: string;
  viewer_name: string;
  viewer_email: string;
  viewer_company: string;
  viewer_document: string;
  access_reason: string;
  ip_address?: string;
  created_at: string;
}

export interface InquiPassState {
  current_user_id: string | null;
  accounts: MockAccount[];
  users_profile: UserProfile[];
  tenant_passports: TenantPassport[];
  documents: DocumentRecord[];
  income_records: IncomeRecord[];
  rental_history: RentalHistory[];
  references: TenantReference[];
  verification_checks: VerificationCheck[];
  share_access_logs: ShareAccessLog[];
}

export interface PassportSnapshot {
  profile?: UserProfile;
  passport: TenantPassport;
  documents: DocumentRecord[];
  income?: IncomeRecord;
  rentalHistory?: RentalHistory;
  references: TenantReference[];
  checks: VerificationCheck[];
}
