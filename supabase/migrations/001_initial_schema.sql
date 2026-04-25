create extension if not exists "pgcrypto";

create table if not exists public.users_profile (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('tenant', 'agency', 'admin')),
  full_name text not null,
  cpf text,
  birth_date date,
  phone text,
  email text,
  marital_status text,
  city text,
  state text,
  current_address text,
  profession text,
  lgpd_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_passports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'verified', 'expired')),
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  issue_date date,
  expiration_date date,
  public_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  recommended_rent numeric(12, 2) not null default 0,
  profile_level text not null default 'basic' check (profile_level in ('basic', 'complete', 'verified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.tenant_passports(id) on delete cascade,
  document_type text not null,
  file_url text not null,
  file_name text,
  status text not null default 'pending' check (status in ('pending', 'uploaded', 'in_review', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.income_records (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.tenant_passports(id) on delete cascade,
  income_type text not null,
  declared_income numeric(12, 2) not null default 0,
  verified_income numeric(12, 2) not null default 0,
  company_name text,
  activity_time text,
  complementary_income numeric(12, 2) not null default 0,
  proof_file_url text,
  status text not null default 'pending' check (status in ('pending', 'verified')),
  created_at timestamptz not null default now()
);

create table if not exists public.rental_history (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.tenant_passports(id) on delete cascade,
  has_rented_before boolean not null default false,
  previous_landlord_name text,
  previous_landlord_contact text,
  rental_period text,
  rent_amount numeric(12, 2) not null default 0,
  paid_on_time boolean not null default true,
  proof_file_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public."references" (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.tenant_passports(id) on delete cascade,
  name text not null,
  relationship text,
  email text,
  phone text,
  status text not null default 'pending' check (status in ('pending', 'requested', 'confirmed')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_checks (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.tenant_passports(id) on delete cascade,
  check_type text not null check (check_type in ('identity', 'cpf', 'credit', 'fraud', 'income')),
  provider text not null,
  status text not null default 'pending' check (status in ('pending', 'verified')),
  score integer not null default 0,
  raw_response jsonb not null default '{}'::jsonb,
  checked_at timestamptz
);

create table if not exists public.share_access_logs (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.tenant_passports(id) on delete cascade,
  viewer_name text not null,
  viewer_email text not null,
  viewer_company text not null,
  viewer_document text,
  access_reason text not null,
  ip_address inet,
  created_at timestamptz not null default now()
);

alter table public.users_profile enable row level security;
alter table public.tenant_passports enable row level security;
alter table public.documents enable row level security;
alter table public.income_records enable row level security;
alter table public.rental_history enable row level security;
alter table public."references" enable row level security;
alter table public.verification_checks enable row level security;
alter table public.share_access_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users_profile
    where auth_user_id = auth.uid()
      and account_type = 'admin'
  );
$$;

create or replace function public.owns_passport(passport uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_passports tp
    join public.users_profile up on up.id = tp.user_id
    where tp.id = passport
      and up.auth_user_id = auth.uid()
  );
$$;

create or replace function public.agency_can_view(passport uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_profile up
    join public.share_access_logs sal on lower(sal.viewer_email) = lower(up.email)
    where up.auth_user_id = auth.uid()
      and up.account_type = 'agency'
      and sal.passport_id = passport
  );
$$;

drop policy if exists "profiles_select_own_or_admin" on public.users_profile;
drop policy if exists "profiles_update_own_or_admin" on public.users_profile;
drop policy if exists "profiles_insert_own" on public.users_profile;
drop policy if exists "passports_select_allowed" on public.tenant_passports;
drop policy if exists "passports_insert_own" on public.tenant_passports;
drop policy if exists "passports_update_own_or_admin" on public.tenant_passports;
drop policy if exists "documents_select_guarded" on public.documents;
drop policy if exists "documents_insert_own" on public.documents;
drop policy if exists "documents_update_own_or_admin" on public.documents;
drop policy if exists "income_select_allowed" on public.income_records;
drop policy if exists "income_write_own_or_admin" on public.income_records;
drop policy if exists "history_select_allowed" on public.rental_history;
drop policy if exists "history_write_own_or_admin" on public.rental_history;
drop policy if exists "references_select_allowed" on public."references";
drop policy if exists "references_write_own_or_admin" on public."references";
drop policy if exists "checks_select_allowed" on public.verification_checks;
drop policy if exists "checks_write_own_or_admin" on public.verification_checks;
drop policy if exists "share_logs_insert_public" on public.share_access_logs;
drop policy if exists "share_logs_select_allowed" on public.share_access_logs;

create policy "profiles_select_own_or_admin"
on public.users_profile for select
using (auth_user_id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.users_profile for update
using (auth_user_id = auth.uid() or public.is_admin())
with check (auth_user_id = auth.uid() or public.is_admin());

create policy "profiles_insert_own"
on public.users_profile for insert
with check (auth_user_id = auth.uid());

create policy "passports_select_allowed"
on public.tenant_passports for select
using (
  public.owns_passport(id)
  or public.agency_can_view(id)
  or public.is_admin()
);

create policy "passports_insert_own"
on public.tenant_passports for insert
with check (
  exists (
    select 1 from public.users_profile up
    where up.id = user_id and up.auth_user_id = auth.uid()
  )
);

create policy "passports_update_own_or_admin"
on public.tenant_passports for update
using (public.owns_passport(id) or public.is_admin())
with check (public.owns_passport(id) or public.is_admin());

create policy "documents_select_guarded"
on public.documents for select
using (public.owns_passport(passport_id) or public.is_admin());

create policy "documents_insert_own"
on public.documents for insert
with check (public.owns_passport(passport_id));

create policy "documents_update_own_or_admin"
on public.documents for update
using (public.owns_passport(passport_id) or public.is_admin())
with check (public.owns_passport(passport_id) or public.is_admin());

create policy "income_select_allowed"
on public.income_records for select
using (public.owns_passport(passport_id) or public.agency_can_view(passport_id) or public.is_admin());

create policy "income_write_own_or_admin"
on public.income_records for all
using (public.owns_passport(passport_id) or public.is_admin())
with check (public.owns_passport(passport_id) or public.is_admin());

create policy "history_select_allowed"
on public.rental_history for select
using (public.owns_passport(passport_id) or public.agency_can_view(passport_id) or public.is_admin());

create policy "history_write_own_or_admin"
on public.rental_history for all
using (public.owns_passport(passport_id) or public.is_admin())
with check (public.owns_passport(passport_id) or public.is_admin());

create policy "references_select_allowed"
on public."references" for select
using (public.owns_passport(passport_id) or public.agency_can_view(passport_id) or public.is_admin());

create policy "references_write_own_or_admin"
on public."references" for all
using (public.owns_passport(passport_id) or public.is_admin())
with check (public.owns_passport(passport_id) or public.is_admin());

create policy "checks_select_allowed"
on public.verification_checks for select
using (public.owns_passport(passport_id) or public.agency_can_view(passport_id) or public.is_admin());

create policy "checks_write_own_or_admin"
on public.verification_checks for all
using (public.owns_passport(passport_id) or public.is_admin())
with check (public.owns_passport(passport_id) or public.is_admin());

create policy "share_logs_insert_public"
on public.share_access_logs for insert
with check (true);

create policy "share_logs_select_allowed"
on public.share_access_logs for select
using (
  public.owns_passport(passport_id)
  or public.agency_can_view(passport_id)
  or public.is_admin()
);

insert into storage.buckets (id, name, public)
values ('passport-documents', 'passport-documents', false)
on conflict (id) do nothing;
