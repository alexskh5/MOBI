// mobi-backend/src/services/learner/adaptationSettingsService.ts

import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

/*
  These are the editable learner-specific settings.

  All fields are optional because the PATCH endpoint will
  allow the frontend to update only the fields that changed.
*/
export interface UpdateAdaptationSettingsInput {
  minimum_confidence?: number;
  levenshtein_threshold?: number;

  phonetic_matching_enabled?: boolean;
  accepted_variations_enabled?: boolean;
  semantic_matching_enabled?: boolean;

  attempts_window?: number;
  required_success_count?: number;
  required_success_percentage?: number;
  consecutive_successes_required?: number;
  minimum_activities_mastered?: number;
  therapist_approval_required?: boolean;

  default_max_attempts?: number;
  allow_skip?: boolean;
  one_more_try_enabled?: boolean;
  default_activity_minutes?: number;
  break_suggestion_minutes?: number;

  gaze_away_threshold_seconds?: number;
  slow_response_threshold_seconds?: number;
  declining_success_window?: number;

  updated_by_therapist_id?: string | null;

  last_updated_by_role?:
    | "center_admin"
    | "therapist"
    | "system";
}

/* =========================================================
   GET LEARNER ADAPTATION SETTINGS
========================================================= */

/*
  Returns the adaptation settings belonging to one learner.

  The learner ID and center ID are both checked so one center
  cannot retrieve another center's learner settings.
*/
export async function getLearnerAdaptationSettings(
  learnerId: string,
  centerId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "learner_adaptation_settings",
    )
    .select("*")
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to fetch learner adaptation settings:",
      error,
    );

    throw error;
  }

  return data;
}

/* =========================================================
   CREATE DEFAULT LEARNER ADAPTATION SETTINGS
========================================================= */

/*
  Creates the default settings row for a learner.

  onConflict: "learner_id" prevents duplicate settings because
  learner_id is unique in learner_adaptation_settings.

  This function may safely be called after learner enrollment,
  even if a row already exists.
*/
export async function createDefaultLearnerAdaptationSettings(
  learnerId: string,
  centerId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "learner_adaptation_settings",
    )
    .upsert(
      {
        learner_id:
          learnerId,

        center_id:
          centerId,

        /*
          No other values are required here.

          PostgreSQL will apply the default values defined in
          the learner_adaptation_settings table.
        */
      },
      {
        onConflict:
          "learner_id",

        /*
          When the row already exists, do not overwrite the
          learner's customized settings with defaults.
        */
        ignoreDuplicates:
          true,
      },
    )
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to create default learner adaptation settings:",
      error,
    );

    throw error;
  }

  /*
    When ignoreDuplicates is true, Supabase may return null
    when the row already existed.

    In that situation, fetch and return the existing row.
  */
  if (!data) {
    return getLearnerAdaptationSettings(
      learnerId,
      centerId,
    );
  }

  return data;
}

/* =========================================================
   UPDATE LEARNER ADAPTATION SETTINGS
========================================================= */

/*
  Updates only the fields sent by the controller.

  The database constraints remain responsible for enforcing
  rules such as:

  - confidence must be between 0 and 1
  - required success count cannot exceed attempts window
  - percentages must be between 0 and 100
*/
export async function updateLearnerAdaptationSettings(
  learnerId: string,
  centerId: string,
  updates: UpdateAdaptationSettingsInput,
) {
  /*
    Never allow the caller to modify learner_id, center_id,
    created_at, or the settings row ID through this function.
  */
  const allowedUpdates:
    UpdateAdaptationSettingsInput =
      {};

  if (
    updates.minimum_confidence !==
    undefined
  ) {
    allowedUpdates.minimum_confidence =
      updates.minimum_confidence;
  }

  if (
    updates.levenshtein_threshold !==
    undefined
  ) {
    allowedUpdates.levenshtein_threshold =
      updates.levenshtein_threshold;
  }

  if (
    updates.phonetic_matching_enabled !==
    undefined
  ) {
    allowedUpdates.phonetic_matching_enabled =
      updates.phonetic_matching_enabled;
  }

  if (
    updates.accepted_variations_enabled !==
    undefined
  ) {
    allowedUpdates.accepted_variations_enabled =
      updates.accepted_variations_enabled;
  }

  if (
    updates.semantic_matching_enabled !==
    undefined
  ) {
    allowedUpdates.semantic_matching_enabled =
      updates.semantic_matching_enabled;
  }

  if (
    updates.attempts_window !==
    undefined
  ) {
    allowedUpdates.attempts_window =
      updates.attempts_window;
  }

  if (
    updates.required_success_count !==
    undefined
  ) {
    allowedUpdates.required_success_count =
      updates.required_success_count;
  }

  if (
    updates.required_success_percentage !==
    undefined
  ) {
    allowedUpdates.required_success_percentage =
      updates.required_success_percentage;
  }

  if (
    updates.consecutive_successes_required !==
    undefined
  ) {
    allowedUpdates.consecutive_successes_required =
      updates.consecutive_successes_required;
  }

  if (
    updates.minimum_activities_mastered !==
    undefined
  ) {
    allowedUpdates.minimum_activities_mastered =
      updates.minimum_activities_mastered;
  }

  if (
    updates.therapist_approval_required !==
    undefined
  ) {
    allowedUpdates.therapist_approval_required =
      updates.therapist_approval_required;
  }

  if (
    updates.default_max_attempts !==
    undefined
  ) {
    allowedUpdates.default_max_attempts =
      updates.default_max_attempts;
  }

  if (
    updates.allow_skip !==
    undefined
  ) {
    allowedUpdates.allow_skip =
      updates.allow_skip;
  }

  if (
    updates.one_more_try_enabled !==
    undefined
  ) {
    allowedUpdates.one_more_try_enabled =
      updates.one_more_try_enabled;
  }

  if (
    updates.default_activity_minutes !==
    undefined
  ) {
    allowedUpdates.default_activity_minutes =
      updates.default_activity_minutes;
  }

  if (
    updates.break_suggestion_minutes !==
    undefined
  ) {
    allowedUpdates.break_suggestion_minutes =
      updates.break_suggestion_minutes;
  }

  if (
    updates.gaze_away_threshold_seconds !==
    undefined
  ) {
    allowedUpdates.gaze_away_threshold_seconds =
      updates.gaze_away_threshold_seconds;
  }

  if (
    updates.slow_response_threshold_seconds !==
    undefined
  ) {
    allowedUpdates.slow_response_threshold_seconds =
      updates.slow_response_threshold_seconds;
  }

  if (
    updates.declining_success_window !==
    undefined
  ) {
    allowedUpdates.declining_success_window =
      updates.declining_success_window;
  }

  if (
    updates.updated_by_therapist_id !==
    undefined
  ) {
    allowedUpdates.updated_by_therapist_id =
      updates.updated_by_therapist_id;
  }

  if (
    updates.last_updated_by_role !==
    undefined
  ) {
    allowedUpdates.last_updated_by_role =
      updates.last_updated_by_role;
  }

  if (
    Object.keys(
      allowedUpdates,
    ).length === 0
  ) {
    throw new Error(
      "No valid adaptation settings were provided.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "learner_adaptation_settings",
    )
    .update(
      allowedUpdates,
    )
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to update learner adaptation settings:",
      error,
    );

    throw error;
  }

  /*
    A missing row may happen for learners enrolled before the
    adaptation table was introduced.
  */
  if (!data) {
    throw new Error(
      "Learner adaptation settings were not found.",
    );
  }

  return data;
}