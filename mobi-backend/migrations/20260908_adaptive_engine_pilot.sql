begin;

create extension if not exists pgcrypto;

alter table public.learner_adaptation_settings
  add column if not exists inactivity_auto_stop_seconds integer not null default 900,
  add column if not exists allow_hint boolean not null default true,
  add column if not exists allow_repeat_prompt boolean not null default true,
  add column if not exists thompson_sampling_weight numeric(4, 3) not null default 0.750;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learner_adaptation_settings_auto_stop_check'
  ) then
    alter table public.learner_adaptation_settings
      add constraint learner_adaptation_settings_auto_stop_check
      check (inactivity_auto_stop_seconds between 30 and 3600);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'learner_adaptation_settings_thompson_weight_check'
  ) then
    alter table public.learner_adaptation_settings
      add constraint learner_adaptation_settings_thompson_weight_check
      check (thompson_sampling_weight between 0.5 and 1);
  end if;
end
$$;

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

create table if not exists public.learner_activity_recommendations (
  id uuid primary key default gen_random_uuid(),
  learning_session_id uuid not null
    references public.learner_learning_sessions(id) on delete cascade,
  center_id uuid not null references public.centers(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  activity_id uuid not null references public.activities(id),
  assignment_id uuid references public.learner_activity_assignments(id),
  activity_session_id uuid references public.learner_activity_sessions(id),
  selection_recorded_at timestamptz,
  selection_source text not null,
  selection_algorithm text not null,
  selection_reason jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learner_activity_recommendations_status_check
    check (
      status in ('pending', 'starting', 'started', 'declined', 'expired')
  )
);

alter table public.learner_activity_recommendations
  add column if not exists selection_recorded_at timestamptz;

alter table public.learner_activity_sessions
  add column if not exists bandit_outcome_recorded_at timestamptz;

alter table public.learner_activity_recommendations
  drop constraint if exists learner_activity_recommendations_status_check;

alter table public.learner_activity_recommendations
  add constraint learner_activity_recommendations_status_check
  check (
    status in ('pending', 'starting', 'started', 'declined', 'expired')
  );

do $$
begin
  if exists (
    select 1
    from public.learner_learning_sessions
    where status = 'in_progress'
    group by center_id, learner_id
    having count(*) > 1
  ) then
    raise exception
      'Preflight failed: duplicate active learner learning sessions exist.';
  end if;

  if exists (
    select 1
    from public.learner_activity_sessions
    where status = 'in_progress'
      and learning_session_id is not null
    group by learning_session_id
    having count(*) > 1
  ) then
    raise exception
      'Preflight failed: duplicate active activity sessions exist.';
  end if;

  if exists (
    select 1
    from public.learner_activity_attempts
    group by session_id, attempt_order
    having count(*) > 1
  ) then
    raise exception
      'Preflight failed: duplicate activity attempt order values exist.';
  end if;

  if exists (
    select 1
    from public.learner_activity_attempts
    where activity_step_id is not null
    group by session_id, activity_step_id, step_attempt_number
    having count(*) > 1
  ) then
    raise exception
      'Preflight failed: duplicate step attempt values exist.';
  end if;

  if exists (
    select 1
    from public.learner_activity_bandit_states
    group by center_id, learner_id, activity_id
    having count(*) > 1
  ) then
    raise exception
      'Preflight failed: duplicate learner activity bandit states exist.';
  end if;

  if exists (
    select 1
    from public.learner_activity_recommendations
    where status in ('pending', 'starting')
    group by learning_session_id
    having count(*) > 1
  ) then
    raise exception
      'Preflight failed: duplicate open activity recommendations exist.';
  end if;
end
$$;

drop index if exists public.learner_activity_recommendations_pending_unique;

create unique index learner_activity_recommendations_pending_unique
  on public.learner_activity_recommendations(learning_session_id)
  where status in ('pending', 'starting');

create unique index if not exists learner_learning_sessions_one_active_per_learner
  on public.learner_learning_sessions(center_id, learner_id)
  where status = 'in_progress';

create unique index if not exists learner_activity_sessions_one_active_per_learning_session
  on public.learner_activity_sessions(learning_session_id)
  where status = 'in_progress' and learning_session_id is not null;

create unique index if not exists learner_activity_attempts_order_unique
  on public.learner_activity_attempts(session_id, attempt_order);

create unique index if not exists learner_activity_attempts_step_order_unique
  on public.learner_activity_attempts(
    session_id,
    activity_step_id,
    step_attempt_number
  )
  where activity_step_id is not null;

create unique index if not exists learner_activity_bandit_states_identity_unique
  on public.learner_activity_bandit_states(
    center_id,
    learner_id,
    activity_id
  );

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

do $$
begin
  if exists (
    select 1
    from public.learner_progression_history
    where therapist_decision is null
    group by center_id, learner_id, from_speech_ladder, to_speech_ladder
    having count(*) > 1
  ) then
    raise exception
      'Preflight failed: duplicate pending progression recommendations exist.';
  end if;
end
$$;

create unique index if not exists learner_progression_history_pending_unique
  on public.learner_progression_history(
    center_id,
    learner_id,
    from_speech_ladder,
    to_speech_ladder
  )
  where therapist_decision is null;

create or replace function public.complete_activity_recommendation(
  p_recommendation_id uuid,
  p_activity_session_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  recommendation public.learner_activity_recommendations%rowtype;
  activity_session public.learner_activity_sessions%rowtype;
  recorded_at timestamptz := now();
begin
  select *
  into recommendation
  from public.learner_activity_recommendations
  where id = p_recommendation_id
  for update;

  if not found then
    raise exception 'Activity recommendation was not found.';
  end if;

  if recommendation.status = 'started' then
    if recommendation.activity_session_id = p_activity_session_id then
      return to_jsonb(recommendation);
    end if;

    raise exception 'Activity recommendation was already used by another session.';
  end if;

  if recommendation.status <> 'starting' then
    raise exception 'Activity recommendation is not being started.';
  end if;

  select *
  into activity_session
  from public.learner_activity_sessions
  where id = p_activity_session_id
  for update;

  if not found
    or activity_session.learning_session_id is distinct from
      recommendation.learning_session_id
    or activity_session.center_id is distinct from recommendation.center_id
    or activity_session.learner_id is distinct from recommendation.learner_id
    or activity_session.activity_id is distinct from recommendation.activity_id
    or activity_session.status is distinct from 'in_progress'
  then
    raise exception 'Activity session does not match the recommendation.';
  end if;

  if recommendation.selection_recorded_at is null
    and recommendation.selection_algorithm in (
      'thompson_sampling',
      'hybrid_thompson_personalized'
    )
  then
    insert into public.learner_activity_bandit_states (
      center_id,
      learner_id,
      activity_id,
      alpha,
      beta,
      successful_sessions,
      unsuccessful_sessions,
      selection_count,
      last_selected_at,
      updated_at
    )
    values (
      recommendation.center_id,
      recommendation.learner_id,
      recommendation.activity_id,
      1,
      1,
      0,
      0,
      1,
      recorded_at,
      recorded_at
    )
    on conflict (center_id, learner_id, activity_id)
    do update
      set selection_count =
            public.learner_activity_bandit_states.selection_count + 1,
          last_selected_at = excluded.last_selected_at,
          updated_at = excluded.updated_at;
  end if;

  update public.learner_activity_recommendations
  set status = 'started',
      activity_session_id = p_activity_session_id,
      accepted_at = coalesce(accepted_at, recorded_at),
      selection_recorded_at = case
        when selection_algorithm in (
          'thompson_sampling',
          'hybrid_thompson_personalized'
        ) then coalesce(selection_recorded_at, recorded_at)
        else selection_recorded_at
      end,
      updated_at = recorded_at
  where id = recommendation.id
  returning * into recommendation;

  return to_jsonb(recommendation);
end;
$$;

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
    raise exception 'Only completed sessions with scored evidence update the bandit.';
  end if;

  if activity_session.bandit_outcome_recorded_at is not null then
    select *
    into bandit_state
    from public.learner_activity_bandit_states
    where center_id = p_center_id
      and learner_id = p_learner_id
      and activity_id = activity_session.activity_id;

    return jsonb_build_object(
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
    'alreadyRecorded', false,
    'state', to_jsonb(bandit_state)
  );
end;
$$;

create or replace function public.decide_learner_progression(
  p_center_id uuid,
  p_learner_id uuid,
  p_recommendation_id uuid,
  p_therapist_id uuid,
  p_decision text,
  p_therapist_notes text default null,
  p_adjusted_speech_ladder text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  recommendation public.learner_progression_history%rowtype;
  learner_profile public.learner_transactional_profiles%rowtype;
  target_ladder text;
begin
  if p_decision not in ('approved', 'declined', 'adjusted') then
    raise exception 'Invalid progression decision.';
  end if;

  if not exists (
    select 1
    from public.therapists
    where id = p_therapist_id
      and center_id = p_center_id
  ) then
    raise exception 'Therapist was not found in this center.';
  end if;

  select *
  into recommendation
  from public.learner_progression_history
  where id = p_recommendation_id
    and center_id = p_center_id
    and learner_id = p_learner_id
    and therapist_decision is null
  for update;

  if not found then
    raise exception 'Pending progression recommendation was not found.';
  end if;

  target_ladder := case
    when p_decision = 'approved' then recommendation.to_speech_ladder
    when p_decision = 'adjusted' then lower(trim(p_adjusted_speech_ladder))
    else null
  end;

  if target_ladder is not null
    and target_ladder not in (
      'sound',
      'syllable',
      'word',
      'phrase',
      'sentence',
      'conversation'
    )
  then
    raise exception 'Invalid adjusted Speech Ladder.';
  end if;

  if target_ladder is not null then
    select *
    into learner_profile
    from public.learner_transactional_profiles
    where center_id = p_center_id
      and learner_id = p_learner_id
    for update;

    if not found then
      raise exception 'Learner transactional profile was not found.';
    end if;

    if learner_profile.therapist_confirmed is not true
      or learner_profile.current_speech_ladder is null
      or lower(trim(learner_profile.current_speech_ladder)) <>
        lower(trim(recommendation.from_speech_ladder))
    then
      raise exception
        'Progression recommendation is stale and must be evaluated again.';
    end if;

    update public.learner_transactional_profiles
    set current_speech_ladder = target_ladder,
        therapist_confirmed = true,
        last_updated = now()
    where center_id = p_center_id
      and learner_id = p_learner_id;

  end if;

  update public.learner_progression_history
  set therapist_decision = p_decision,
      to_speech_ladder = coalesce(target_ladder, to_speech_ladder),
      therapist_id = p_therapist_id,
      decided_by_therapist_id = p_therapist_id,
      therapist_notes = nullif(trim(p_therapist_notes), ''),
      decided_at = now(),
      updated_at = now()
  where id = recommendation.id
  returning * into recommendation;

  return to_jsonb(recommendation);
end;
$$;

alter table public.learner_child_safety_settings enable row level security;
alter table public.learner_activity_recommendations enable row level security;
alter table public.learner_progression_history enable row level security;

commit;
