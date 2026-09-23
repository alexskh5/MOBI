create table if not exists public.center_invitations (
  id uuid primary key default gen_random_uuid(),
  magic_code text not null unique,
  center_email text not null,
  center_name text not null,
  center_owner_name text,
  center_owner_phone text,
  center_owner_email text,
  contact_person_name text,
  contact_person_phone text,
  contact_person_email text,
  attachment_file_name text,
  status text not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  center_id uuid references public.centers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint center_invitations_status_check
    check (status in ('pending', 'accepted', 'expired', 'cancelled'))
);

create table if not exists public.center_admins (
  id uuid primary key default gen_random_uuid()
);

alter table public.center_admins
  add column if not exists center_id uuid references public.centers(id) on delete cascade,
  add column if not exists auth_user_id uuid,
  add column if not exists email text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists account_status text not null default 'active',
  add column if not exists is_active boolean not null default true,
  add column if not exists invited_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists center_admins_auth_user_id_unique
  on public.center_admins(auth_user_id)
  where auth_user_id is not null;

create unique index if not exists center_admins_center_email_unique
  on public.center_admins(center_id, lower(email))
  where email is not null;

create index if not exists center_invitations_magic_code_idx
  on public.center_invitations(lower(magic_code));

create index if not exists center_invitations_status_expires_idx
  on public.center_invitations(status, expires_at);

alter table public.center_invitations
  add column if not exists attachment_file_name text;
