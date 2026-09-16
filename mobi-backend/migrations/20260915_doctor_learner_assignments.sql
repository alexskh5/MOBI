create table if not exists public.learner_doctors (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz,
  is_current boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_learner_doctors_center_doctor
  on public.learner_doctors(center_id, doctor_id)
  where is_current = true;

create index if not exists idx_learner_doctors_center_learner
  on public.learner_doctors(center_id, learner_id)
  where is_current = true;

create unique index if not exists ux_learner_doctors_current
  on public.learner_doctors(center_id, learner_id, doctor_id)
  where is_current = true;
