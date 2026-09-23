create table if not exists public.learner_doctors (
  id uuid primary key default gen_random_uuid()
);

alter table public.learner_doctors
  add column if not exists center_id uuid,
  add column if not exists learner_id uuid,
  add column if not exists doctor_id uuid,
  add column if not exists assigned_at timestamptz not null default now(),
  add column if not exists unassigned_at timestamptz,
  add column if not exists is_current boolean not null default true,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.learner_doctors learner_doctor
set center_id = learner.center_id
from public.learners learner
where learner_doctor.learner_id = learner.id
  and learner_doctor.center_id is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learner_doctors_center_id_fkey'
  ) then
    alter table public.learner_doctors
      add constraint learner_doctors_center_id_fkey
      foreign key (center_id)
      references public.centers(id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learner_doctors_learner_id_fkey'
  ) then
    alter table public.learner_doctors
      add constraint learner_doctors_learner_id_fkey
      foreign key (learner_id)
      references public.learners(id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learner_doctors_doctor_id_fkey'
  ) then
    alter table public.learner_doctors
      add constraint learner_doctors_doctor_id_fkey
      foreign key (doctor_id)
      references public.doctors(id)
      on delete cascade;
  end if;
end $$;

create index if not exists idx_learner_doctors_center_doctor
  on public.learner_doctors(center_id, doctor_id)
  where is_current = true;

create index if not exists idx_learner_doctors_center_learner
  on public.learner_doctors(center_id, learner_id)
  where is_current = true;

create unique index if not exists ux_learner_doctors_current
  on public.learner_doctors(center_id, learner_id, doctor_id)
  where is_current = true;
