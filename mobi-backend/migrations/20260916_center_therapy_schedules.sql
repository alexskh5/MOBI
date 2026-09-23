create table if not exists public.center_therapy_schedules (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  therapist_id uuid not null references public.therapists(id) on delete cascade,
  schedule_date date not null,
  start_time time not null,
  duration_minutes integer not null default 45,
  status text not null default 'pending',
  notes text,
  therapist_response_note text,
  assigned_by_center_admin_id uuid,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.center_therapy_schedules
  drop constraint if exists center_therapy_schedules_status_check;

alter table public.center_therapy_schedules
  add constraint center_therapy_schedules_status_check
  check (
    status in (
      'pending',
      'confirmed',
      'edit_requested',
      'declined',
      'cancelled'
    )
  );

create index if not exists idx_center_therapy_schedules_center_date
  on public.center_therapy_schedules(center_id, schedule_date);

create index if not exists idx_center_therapy_schedules_therapist_date
  on public.center_therapy_schedules(center_id, therapist_id, schedule_date);
