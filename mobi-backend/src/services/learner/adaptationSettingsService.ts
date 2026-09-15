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

  inactivity_auto_stop_seconds?: number;
  allow_hint?: boolean;
  allow_repeat_prompt?: boolean;
  thompson_sampling_weight?: number;

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
  const existingSettings =
    await getLearnerAdaptationSettings(
      learnerId,
      centerId,
    );

  const currentSettings =
    existingSettings ??
    await createDefaultLearnerAdaptationSettings(
      learnerId,
      centerId,
    );

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
    updates.inactivity_auto_stop_seconds !== undefined
  ) {
    allowedUpdates.inactivity_auto_stop_seconds =
      updates.inactivity_auto_stop_seconds;
  }

  if (updates.allow_hint !== undefined) {
    allowedUpdates.allow_hint = updates.allow_hint;
  }

  if (updates.allow_repeat_prompt !== undefined) {
    allowedUpdates.allow_repeat_prompt =
      updates.allow_repeat_prompt;
  }

  if (updates.thompson_sampling_weight !== undefined) {
    allowedUpdates.thompson_sampling_weight =
      updates.thompson_sampling_weight;
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
    Object.keys(allowedUpdates).every(
      (field) =>
        field === "updated_by_therapist_id" ||
        field === "last_updated_by_role",
    )
  ) {
    throw new Error(
      "No valid adaptation settings were provided.",
    );
  }

  const defaultSettings = {
    minimum_confidence: 0.7,
    levenshtein_threshold: 2,
    attempts_window: 5,
    required_success_count: 4,
    required_success_percentage: 80,
    consecutive_successes_required: 3,
    minimum_activities_mastered: 5,
    default_max_attempts: 3,
    default_activity_minutes: 5,
    break_suggestion_minutes: 10,
    gaze_away_threshold_seconds: 10,
    slow_response_threshold_seconds: 15,
    declining_success_window: 3,
    inactivity_auto_stop_seconds: 900,
    thompson_sampling_weight: 0.75,
    phonetic_matching_enabled: true,
    accepted_variations_enabled: true,
    semantic_matching_enabled: true,
    therapist_approval_required: true,
    allow_skip: true,
    one_more_try_enabled: true,
    allow_hint: true,
    allow_repeat_prompt: true,
  };
  const mergedSettings = {
    ...defaultSettings,
    ...(currentSettings ?? {}),
    ...allowedUpdates,
  };

  const assertNumberInRange = (
    field: keyof UpdateAdaptationSettingsInput,
    minimum: number,
    maximum: number,
    integer = false,
  ) => {
    const value = mergedSettings[field];

    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < minimum ||
      value > maximum ||
      (integer && !Number.isInteger(value))
    ) {
      throw new Error(
        `${String(field)} must be ${integer ? "an integer " : ""}between ${minimum} and ${maximum}.`,
      );
    }
  };

  assertNumberInRange("minimum_confidence", 0, 1);
  assertNumberInRange("levenshtein_threshold", 0, 5, true);
  assertNumberInRange("attempts_window", 1, 20, true);
  assertNumberInRange("required_success_count", 1, 20, true);
  assertNumberInRange("required_success_percentage", 0, 100);
  assertNumberInRange(
    "consecutive_successes_required",
    1,
    20,
    true,
  );
  assertNumberInRange(
    "minimum_activities_mastered",
    1,
    50,
    true,
  );
  assertNumberInRange("default_max_attempts", 1, 10, true);
  assertNumberInRange("default_activity_minutes", 1, 60, true);
  assertNumberInRange("break_suggestion_minutes", 1, 30);
  assertNumberInRange(
    "gaze_away_threshold_seconds",
    1,
    600,
    true,
  );
  assertNumberInRange(
    "slow_response_threshold_seconds",
    1,
    600,
    true,
  );
  assertNumberInRange("declining_success_window", 2, 20, true);
  assertNumberInRange(
    "inactivity_auto_stop_seconds",
    30,
    3600,
    true,
  );
  assertNumberInRange("thompson_sampling_weight", 0.5, 1);

  const booleanFields: Array<keyof UpdateAdaptationSettingsInput> = [
    "phonetic_matching_enabled",
    "accepted_variations_enabled",
    "semantic_matching_enabled",
    "therapist_approval_required",
    "allow_skip",
    "one_more_try_enabled",
    "allow_hint",
    "allow_repeat_prompt",
  ];

  for (const field of booleanFields) {
    if (typeof mergedSettings[field] !== "boolean") {
      throw new Error(`${String(field)} must be a boolean.`);
    }
  }

  if (mergedSettings.therapist_approval_required !== true) {
    throw new Error(
      "Speech Ladder progression must require therapist approval.",
    );
  }

  if (
    Number(mergedSettings.required_success_count) >
    Number(mergedSettings.attempts_window)
  ) {
    throw new Error(
      "required_success_count cannot exceed attempts_window.",
    );
  }

  if (
    Number(mergedSettings.consecutive_successes_required) >
    Number(mergedSettings.attempts_window)
  ) {
    throw new Error(
      "consecutive_successes_required cannot exceed attempts_window.",
    );
  }

  if (
    Number(mergedSettings.inactivity_auto_stop_seconds) <
    Number(mergedSettings.break_suggestion_minutes) * 60
  ) {
    throw new Error(
      "inactivity_auto_stop_seconds must be at least the break suggestion duration.",
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
