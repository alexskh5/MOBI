create table if not exists public.learner_session_preferences (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  center_id uuid not null references public.centers(id) on delete cascade,
  visual_theme text not null default 'default'
    check (visual_theme in ('default', 'sensory_friendly', 'low_contrast')),
  low_contrast_enabled boolean not null default false,
  soft_pastel_enabled boolean not null default false,
  matte_ui_enabled boolean not null default false,
  reduce_motion_enabled boolean not null default false,
  name_prompting_enabled boolean not null default true,
  name_prompting_frequency text not null default 'as_needed'
    check (name_prompting_frequency in ('never', 'start_only', 'as_needed', 'frequent')),
  sensory_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (learner_id)
);

create index if not exists learner_session_preferences_center_idx
  on public.learner_session_preferences(center_id);

insert into public.learner_session_preferences (
  learner_id,
  center_id,
  visual_theme,
  low_contrast_enabled,
  soft_pastel_enabled,
  matte_ui_enabled,
  reduce_motion_enabled,
  sensory_profile
)
select
  profile.learner_id,
  profile.center_id,
  case
    when coalesce(profile.requires_visual_support, false)
      or exists (
        select 1
        from unnest(coalesce(profile.sensory_preferences, array[]::text[])) as preference
        where lower(preference) like '%visual%'
          or lower(preference) like '%light%'
          or lower(preference) like '%screen%'
          or lower(preference) like '%color%'
      )
    then 'sensory_friendly'
    else 'default'
  end,
  exists (
    select 1
    from unnest(coalesce(profile.sensory_preferences, array[]::text[])) as preference
    where lower(preference) like '%visual%'
      or lower(preference) like '%light%'
      or lower(preference) like '%screen%'
      or lower(preference) like '%color%'
  ),
  coalesce(profile.requires_visual_support, false),
  coalesce(profile.requires_visual_support, false),
  exists (
    select 1
    from unnest(coalesce(profile.sensory_preferences, array[]::text[])) as preference
    where lower(preference) like '%visual%'
      or lower(preference) like '%light%'
      or lower(preference) like '%screen%'
      or lower(preference) like '%color%'
  ),
  jsonb_build_object(
    'assessmentSensoryPreferences',
    coalesce(profile.sensory_preferences, array[]::text[]),
    'requiresVisualSupport',
    coalesce(profile.requires_visual_support, false),
    'typicalEngagementMinutes',
    profile.typical_engagement_minutes
  )
from public.learner_transactional_profiles profile
on conflict (learner_id) do nothing;
