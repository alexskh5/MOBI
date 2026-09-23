update activities
set speech_ladder_level = 'sentence'
where lower(trim(coalesce(speech_ladder_level, ''))) = 'conversation';

update learner_activity_sessions
set speech_ladder_level = 'sentence'
where lower(trim(coalesce(speech_ladder_level, ''))) = 'conversation';

update learner_transactional_profiles
set
  suggested_speech_ladder = case
    when lower(trim(coalesce(suggested_speech_ladder, ''))) = 'conversation'
      then 'sentence'
    else suggested_speech_ladder
  end,
  current_speech_ladder = case
    when lower(trim(coalesce(current_speech_ladder, ''))) = 'conversation'
      then 'sentence'
    else current_speech_ladder
  end;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'learner_transactional_profiles'
      and column_name = 'therapist_confirmed_speech_ladder'
  ) then
    execute $sql$
      update learner_transactional_profiles
      set therapist_confirmed_speech_ladder = case
        when lower(trim(coalesce(therapist_confirmed_speech_ladder, ''))) = 'conversation'
          then 'sentence'
        else therapist_confirmed_speech_ladder
      end
    $sql$;
  end if;
end $$;

alter table activities
  drop constraint if exists activities_speech_ladder_level_check;

alter table activities
  add constraint activities_speech_ladder_level_check
  check (
    speech_ladder_level is null
    or lower(trim(speech_ladder_level)) in (
      'sound',
      'syllable',
      'word',
      'phrase',
      'sentence'
    )
  );

alter table learner_activity_sessions
  drop constraint if exists learner_activity_sessions_speech_ladder_level_check;

alter table learner_activity_sessions
  add constraint learner_activity_sessions_speech_ladder_level_check
  check (
    speech_ladder_level is null
    or lower(trim(speech_ladder_level)) in (
      'sound',
      'syllable',
      'word',
      'phrase',
      'sentence'
    )
  );
