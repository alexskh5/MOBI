create table if not exists public.therapists (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid()
);

alter table public.therapists
  add column if not exists center_id uuid references public.centers(id) on delete cascade,
  add column if not exists auth_user_id uuid,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists birth_date date,
  add column if not exists gender text,
  add column if not exists specialty text,
  add column if not exists bio text,
  add column if not exists email text,
  add column if not exists phone_number text,
  add column if not exists account_status text not null default 'active',
  add column if not exists is_active boolean not null default true,
  add column if not exists invited_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.doctors
  add column if not exists center_id uuid references public.centers(id) on delete cascade,
  add column if not exists auth_user_id uuid,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists birth_date date,
  add column if not exists gender text,
  add column if not exists specialty text,
  add column if not exists bio text,
  add column if not exists email text,
  add column if not exists phone_number text,
  add column if not exists account_status text not null default 'active',
  add column if not exists is_active boolean not null default true,
  add column if not exists invited_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists therapists_auth_user_id_unique
  on public.therapists(auth_user_id)
  where auth_user_id is not null;

create unique index if not exists doctors_auth_user_id_unique
  on public.doctors(auth_user_id)
  where auth_user_id is not null;

create unique index if not exists therapists_center_email_unique
  on public.therapists(center_id, lower(email))
  where email is not null;

create unique index if not exists doctors_center_email_unique
  on public.doctors(center_id, lower(email))
  where email is not null;

create index if not exists therapists_center_idx
  on public.therapists(center_id);

create index if not exists doctors_center_idx
  on public.doctors(center_id);

update public.therapists
set account_status = case
  when account_status = 'inactive' or is_active is false then 'inactive'
  else 'active'
end
where account_status is distinct from 'active'
  and account_status is distinct from 'inactive';

update public.doctors
set account_status = case
  when account_status = 'inactive' or is_active is false then 'inactive'
  else 'active'
end
where account_status is distinct from 'active'
  and account_status is distinct from 'inactive';

update public.therapists
set is_active = account_status = 'active'
where is_active is distinct from (account_status = 'active');

update public.doctors
set is_active = account_status = 'active'
where is_active is distinct from (account_status = 'active');

alter table public.therapists
  drop constraint if exists therapists_account_status_check;

alter table public.therapists
  add constraint therapists_account_status_check
  check (account_status in ('active', 'inactive'));

alter table public.doctors
  drop constraint if exists doctors_account_status_check;

alter table public.doctors
  add constraint doctors_account_status_check
  check (account_status in ('active', 'inactive'));
