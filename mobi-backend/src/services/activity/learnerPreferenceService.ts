import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

export interface LearnerPreferenceProfile {
  motivatingTopics: string[];

  sensoryPreferences: string[];

  preferredCommunicationMethod:
    string | null;

  tabletAssistanceLevel:
    string | null;

  requiresVisualSupport:
    boolean;

  typicalEngagementMinutes:
    number | null;
}

export interface GetLearnerPreferencesInput {
  centerId: string;

  learnerId: string;
}

/* =========================================================
   GET LEARNER PREFERENCES
========================================================= */

export async function getLearnerPreferences(
  input: GetLearnerPreferencesInput,
): Promise<LearnerPreferenceProfile> {

  const {
    centerId,
    learnerId,
  } = input;

  const {
    data: profile,
    error,
  } = await supabase
    .from(
      "learner_transactional_profiles",
    )
    .select(`
      motivating_topics,
      sensory_preferences,
      preferred_communication_method,
      tablet_assistance_level,
      requires_visual_support,
      typical_engagement_minutes
    `)
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
      "Unable to fetch learner preferences:",
      error,
    );

    throw error;
  }

  /*
    A missing transactional profile should not make
    adaptive activity selection fail completely.

    Return neutral preferences instead.
  */
  if (!profile) {
    return {
      motivatingTopics:
        [],

      sensoryPreferences:
        [],

      preferredCommunicationMethod:
        null,

      tabletAssistanceLevel:
        null,

      requiresVisualSupport:
        false,

      typicalEngagementMinutes:
        null,
    };
  }

  return {
    motivatingTopics:
      Array.isArray(
        profile.motivating_topics,
      )
        ? profile.motivating_topics.filter(
            (
              topic,
            ): topic is string =>
              typeof topic ===
              "string",
          )
        : [],

    sensoryPreferences:
      Array.isArray(
        profile.sensory_preferences,
      )
        ? profile.sensory_preferences.filter(
            (
              preference,
            ): preference is string =>
              typeof preference ===
              "string",
          )
        : [],

    preferredCommunicationMethod:
      typeof profile
        .preferred_communication_method ===
        "string"
        ? profile
            .preferred_communication_method
        : null,

    tabletAssistanceLevel:
      typeof profile
        .tablet_assistance_level ===
        "string"
        ? profile
            .tablet_assistance_level
        : null,

    requiresVisualSupport:
      profile.requires_visual_support ===
      true,

    typicalEngagementMinutes:
      typeof profile
        .typical_engagement_minutes ===
        "number"
        ? profile
            .typical_engagement_minutes
        : profile
            .typical_engagement_minutes !==
            null &&
          profile
            .typical_engagement_minutes !==
            undefined &&
          Number.isFinite(
            Number(
              profile
                .typical_engagement_minutes,
            ),
          )
        ? Number(
            profile
              .typical_engagement_minutes,
          )
        : null,
  };
}