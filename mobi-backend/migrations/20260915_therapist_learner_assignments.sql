create table if not exists public.learner_therapists (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  therapist_id uuid not null references public.therapists(id) on delete cascade,
  is_current boolean not null default true,
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learner_therapists
  add column if not exists center_id uuid references public.centers(id) on delete cascade,
  add column if not exists learner_id uuid references public.learners(id) on delete cascade,
  add column if not exists therapist_id uuid references public.therapists(id) on delete cascade,
  add column if not exists is_current boolean not null default true,
  add column if not exists assigned_at timestamptz not null default now(),
  add column if not exists unassigned_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists learner_therapists_current_unique
  on public.learner_therapists(learner_id, therapist_id)
  where is_current = true;

create index if not exists learner_therapists_therapist_idx
  on public.learner_therapists(center_id, therapist_id)
  where is_current = true;

create index if not exists learner_therapists_learner_idx
  on public.learner_therapists(center_id, learner_id)
  where is_current = true;
