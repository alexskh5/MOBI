import { supabase } from "../../config/supabase";

export type VisualSessionTheme =
  | "default"
  | "sensory_friendly"
  | "low_contrast";

export type NamePromptingFrequency =
  | "never"
  | "start_only"
  | "as_needed"
  | "frequent";

export interface LearnerSessionPreferences {
  learner_id: string;
  center_id: string;
  visual_theme: VisualSessionTheme;
  low_contrast_enabled: boolean;
  soft_pastel_enabled: boolean;
  matte_ui_enabled: boolean;
  reduce_motion_enabled: boolean;
  name_prompting_enabled: boolean;
  name_prompting_frequency: NamePromptingFrequency;
  sensory_profile: Record<string, unknown>;
}

export interface UpdateLearnerSessionPreferencesInput {
  visual_theme?: VisualSessionTheme;
  low_contrast_enabled?: boolean;
  soft_pastel_enabled?: boolean;
  matte_ui_enabled?: boolean;
  reduce_motion_enabled?: boolean;
  name_prompting_enabled?: boolean;
  name_prompting_frequency?: NamePromptingFrequency;
  sensory_profile?: Record<string, unknown>;
}

const MISSING_TABLE_CODES = new Set([
  "42P01",
  "PGRST205",
]);

function isMissingPreferencesTable(error: unknown) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  return MISSING_TABLE_CODES.has(code);
}

function normalizeSensoryProfile(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

async function getAssessmentDerivedDefaults(
  learnerId: string,
  centerId: string,
) {
  const { data, error } = await supabase
    .from("learner_transactional_profiles")
    .select(
      `
        sensory_preferences,
        requires_visual_support,
        typical_engagement_minutes
      `,
    )
    .eq("learner_id", learnerId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to read assessment-derived learner preferences:",
      error,
    );
  }

  const sensoryPreferences = Array.isArray(
    data?.sensory_preferences,
  )
    ? data.sensory_preferences.filter(
        (item): item is string =>
          typeof item === "string",
      )
    : [];

  const hasVisualSensitivity = sensoryPreferences.some(
    (item) =>
      item.toLowerCase().includes("visual") ||
      item.toLowerCase().includes("light") ||
      item.toLowerCase().includes("screen") ||
      item.toLowerCase().includes("color"),
  );

  const needsSensoryFriendlyTheme =
    hasVisualSensitivity ||
    data?.requires_visual_support === true;

  return {
    visual_theme: needsSensoryFriendlyTheme
      ? "sensory_friendly"
      : "default",
    low_contrast_enabled: hasVisualSensitivity,
    soft_pastel_enabled: needsSensoryFriendlyTheme,
    matte_ui_enabled: needsSensoryFriendlyTheme,
    reduce_motion_enabled: hasVisualSensitivity,
    sensory_profile: {
      assessmentSensoryPreferences:
        sensoryPreferences,
      requiresVisualSupport:
        data?.requires_visual_support === true,
      typicalEngagementMinutes:
        data?.typical_engagement_minutes ?? null,
    },
  } satisfies Partial<LearnerSessionPreferences>;
}

async function getDefaultLearnerSessionPreferences(
  learnerId: string,
  centerId: string,
): Promise<LearnerSessionPreferences> {
  const assessmentDefaults =
    await getAssessmentDerivedDefaults(
      learnerId,
      centerId,
    );

  return {
    learner_id: learnerId,
    center_id: centerId,
    visual_theme:
      assessmentDefaults.visual_theme ??
      "default",
    low_contrast_enabled:
      assessmentDefaults.low_contrast_enabled ??
      false,
    soft_pastel_enabled:
      assessmentDefaults.soft_pastel_enabled ??
      false,
    matte_ui_enabled:
      assessmentDefaults.matte_ui_enabled ??
      false,
    reduce_motion_enabled:
      assessmentDefaults.reduce_motion_enabled ??
      false,
    name_prompting_enabled: true,
    name_prompting_frequency: "as_needed",
    sensory_profile:
      assessmentDefaults.sensory_profile ??
      {},
  };
}

function normalizePreferenceRow(
  row: Record<string, unknown>,
  defaults: LearnerSessionPreferences,
): LearnerSessionPreferences {
  return {
    learner_id:
      String(row.learner_id ?? defaults.learner_id),
    center_id:
      String(row.center_id ?? defaults.center_id),
    visual_theme:
      row.visual_theme === "sensory_friendly" ||
      row.visual_theme === "low_contrast" ||
      row.visual_theme === "default"
        ? row.visual_theme
        : defaults.visual_theme,
    low_contrast_enabled:
      typeof row.low_contrast_enabled === "boolean"
        ? row.low_contrast_enabled
        : defaults.low_contrast_enabled,
    soft_pastel_enabled:
      typeof row.soft_pastel_enabled === "boolean"
        ? row.soft_pastel_enabled
        : defaults.soft_pastel_enabled,
    matte_ui_enabled:
      typeof row.matte_ui_enabled === "boolean"
        ? row.matte_ui_enabled
        : defaults.matte_ui_enabled,
    reduce_motion_enabled:
      typeof row.reduce_motion_enabled === "boolean"
        ? row.reduce_motion_enabled
        : defaults.reduce_motion_enabled,
    name_prompting_enabled:
      typeof row.name_prompting_enabled === "boolean"
        ? row.name_prompting_enabled
        : defaults.name_prompting_enabled,
    name_prompting_frequency:
      row.name_prompting_frequency === "never" ||
      row.name_prompting_frequency === "start_only" ||
      row.name_prompting_frequency === "as_needed" ||
      row.name_prompting_frequency === "frequent"
        ? row.name_prompting_frequency
        : defaults.name_prompting_frequency,
    sensory_profile: normalizeSensoryProfile(
      row.sensory_profile ??
        defaults.sensory_profile,
    ),
  };
}

export async function getLearnerSessionPreferences(
  learnerId: string,
  centerId: string,
) {
  const defaults =
    await getDefaultLearnerSessionPreferences(
      learnerId,
      centerId,
    );

  const { data, error } = await supabase
    .from("learner_session_preferences")
    .select("*")
    .eq("learner_id", learnerId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (error) {
    if (isMissingPreferencesTable(error)) {
      return defaults;
    }

    throw error;
  }

  if (!data) {
    return defaults;
  }

  return normalizePreferenceRow(
    data as Record<string, unknown>,
    defaults,
  );
}

export async function updateLearnerSessionPreferences(
  learnerId: string,
  centerId: string,
  updates: UpdateLearnerSessionPreferencesInput,
) {
  const current =
    await getLearnerSessionPreferences(
      learnerId,
      centerId,
    );

  const allowedUpdates:
    UpdateLearnerSessionPreferencesInput = {};

  if (updates.visual_theme !== undefined) {
    if (
      ![
        "default",
        "sensory_friendly",
        "low_contrast",
      ].includes(updates.visual_theme)
    ) {
      throw new Error(
        "visual_theme must be default, sensory_friendly, or low_contrast.",
      );
    }

    allowedUpdates.visual_theme =
      updates.visual_theme;
  }

  const booleanFields = [
    "low_contrast_enabled",
    "soft_pastel_enabled",
    "matte_ui_enabled",
    "reduce_motion_enabled",
    "name_prompting_enabled",
  ] as const;

  for (const field of booleanFields) {
    if (updates[field] !== undefined) {
      if (typeof updates[field] !== "boolean") {
        throw new Error(`${field} must be a boolean.`);
      }

      allowedUpdates[field] = updates[field];
    }
  }

  if (
    updates.name_prompting_frequency !== undefined
  ) {
    if (
      ![
        "never",
        "start_only",
        "as_needed",
        "frequent",
      ].includes(updates.name_prompting_frequency)
    ) {
      throw new Error(
        "name_prompting_frequency must be never, start_only, as_needed, or frequent.",
      );
    }

    allowedUpdates.name_prompting_frequency =
      updates.name_prompting_frequency;
  }

  if (updates.sensory_profile !== undefined) {
    allowedUpdates.sensory_profile =
      normalizeSensoryProfile(
        updates.sensory_profile,
      );
  }

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error(
      "No valid session preference settings were provided.",
    );
  }

  const { data, error } = await supabase
    .from("learner_session_preferences")
    .upsert(
      {
        ...current,
        ...allowedUpdates,
        learner_id: learnerId,
        center_id: centerId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "learner_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    if (isMissingPreferencesTable(error)) {
      throw new Error(
        "Learner session preferences table is missing. Run the latest Supabase migration first.",
      );
    }

    throw error;
  }

  return normalizePreferenceRow(
    data as Record<string, unknown>,
    current,
  );
}
