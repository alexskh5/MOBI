begin;

create extension if not exists pgcrypto;

create table if not exists public.learner_child_safety_settings (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  center_id uuid not null references public.centers(id) on delete cascade,
  daily_screen_time_limit_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learner_child_safety_settings_learner_unique unique (learner_id),
  constraint learner_child_safety_settings_limit_check
    check (
      daily_screen_time_limit_seconds is null
      or daily_screen_time_limit_seconds between 300 and 28800
    )
);

create index if not exists learner_child_safety_settings_center_idx
  on public.learner_child_safety_settings(center_id, learner_id);

create table if not exists public.learner_activity_bandit_states (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  alpha numeric not null default 1,
  beta numeric not null default 1,
  successful_sessions integer not null default 0,
  unsuccessful_sessions integer not null default 0,
  selection_count integer not null default 0,
  last_selected_at timestamptz,
  last_outcome_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learner_activity_bandit_states_identity_unique
    unique (center_id, learner_id, activity_id),
  constraint learner_activity_bandit_states_alpha_beta_check
    check (alpha > 0 and beta > 0),
  constraint learner_activity_bandit_states_counts_check
    check (
      successful_sessions >= 0
      and unsuccessful_sessions >= 0
      and selection_count >= 0
    )
);

alter table public.learner_activity_sessions
  add column if not exists bandit_outcome_recorded_at timestamptz;

create table if not exists public.learner_progression_history (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  center_id uuid not null references public.centers(id) on delete cascade,
  from_speech_ladder text not null,
  to_speech_ladder text not null,
  progression_type text not null default 'progression',
  recommendation_source text not null default 'adaptive_engine',
  activities_mastered integer not null default 0,
  average_success_rate numeric(5, 2) not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  therapist_decision text,
  therapist_id uuid,
  decided_by_therapist_id uuid,
  therapist_notes text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.learner_progression_history
  add column if not exists evidence jsonb not null default '{}'::jsonb,
  add column if not exists therapist_id uuid,
  add column if not exists decided_by_therapist_id uuid,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.learner_progression_history
  alter column therapist_decision drop not null,
  alter column decided_at drop not null,
  alter column decided_at drop default;

create unique index if not exists learner_progression_history_pending_unique
  on public.learner_progression_history(
    center_id,
    learner_id,
    from_speech_ladder,
    to_speech_ladder
  )
  where therapist_decision is null;

create or replace function public.record_activity_bandit_outcome(
  p_center_id uuid,
  p_learner_id uuid,
  p_activity_session_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  activity_session public.learner_activity_sessions%rowtype;
  bandit_state public.learner_activity_bandit_states%rowtype;
  recorded_at timestamptz := now();
begin
  select *
  into activity_session
  from public.learner_activity_sessions
  where id = p_activity_session_id
    and center_id = p_center_id
    and learner_id = p_learner_id
  for update;

  if not found then
    raise exception 'Activity session was not found.';
  end if;

  if activity_session.status <> 'completed'
    or coalesce(activity_session.total_scored_attempts, 0) <= 0
  then
    return jsonb_build_object(
      'recorded', false,
      'reason', 'session_not_completed_or_unscored'
    );
  end if;

  if activity_session.bandit_outcome_recorded_at is not null then
    select *
    into bandit_state
    from public.learner_activity_bandit_states
    where center_id = p_center_id
      and learner_id = p_learner_id
      and activity_id = activity_session.activity_id;

    return jsonb_build_object(
      'recorded', false,
      'alreadyRecorded', true,
      'state', to_jsonb(bandit_state)
    );
  end if;

  insert into public.learner_activity_bandit_states (
    center_id,
    learner_id,
    activity_id,
    alpha,
    beta,
    successful_sessions,
    unsuccessful_sessions,
    selection_count,
    last_outcome_at,
    updated_at
  )
  values (
    p_center_id,
    p_learner_id,
    activity_session.activity_id,
    case when activity_session.activity_mastered then 2 else 1 end,
    case when activity_session.activity_mastered then 1 else 2 end,
    case when activity_session.activity_mastered then 1 else 0 end,
    case when activity_session.activity_mastered then 0 else 1 end,
    0,
    recorded_at,
    recorded_at
  )
  on conflict (center_id, learner_id, activity_id)
  do update
    set alpha = public.learner_activity_bandit_states.alpha +
          case when activity_session.activity_mastered then 1 else 0 end,
        beta = public.learner_activity_bandit_states.beta +
          case when activity_session.activity_mastered then 0 else 1 end,
        successful_sessions =
          public.learner_activity_bandit_states.successful_sessions +
          case when activity_session.activity_mastered then 1 else 0 end,
        unsuccessful_sessions =
          public.learner_activity_bandit_states.unsuccessful_sessions +
          case when activity_session.activity_mastered then 0 else 1 end,
        last_outcome_at = excluded.last_outcome_at,
        updated_at = excluded.updated_at
  returning * into bandit_state;

  update public.learner_activity_sessions
  set bandit_outcome_recorded_at = recorded_at
  where id = activity_session.id;

  return jsonb_build_object(
    'recorded', true,
    'alreadyRecorded', false,
    'state', to_jsonb(bandit_state)
  );
end;
$$;

alter table public.learner_child_safety_settings enable row level security;
alter table public.learner_activity_bandit_states enable row level security;
alter table public.learner_progression_history enable row level security;

commit;
