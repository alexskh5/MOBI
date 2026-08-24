import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

export interface EvaluateProgressionInput {
  centerId: string;
  learnerId: string;
}

export interface ProgressionRecommendation {
  currentSpeechLadder: string | null;

  activitiesMastered: number;

  requiredActivities: number;

  averageSuccessRate: number;

  requiredSuccessRate: number;

  therapistApprovalRequired: boolean;

  eligibleForProgression: boolean;

  recommendedNextAction:
    | "remain"
    | "therapist_review";
}

/* =========================================================
   EVALUATE LEARNER PROGRESSION
========================================================= */

export async function evaluateLearnerProgression(
  input: EvaluateProgressionInput,
): Promise<ProgressionRecommendation> {

  const {
    centerId,
    learnerId,
  } = input;

  /* =======================================================
     1. GET LEARNER PROFILE
  ======================================================= */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("learner_transactional_profiles")
    .select(`
      current_speech_ladder,
      suggested_speech_ladder
    `)
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .maybeSingle();

  if (profileError) {
  throw profileError;
}

if (!profile) {
    throw new Error(
      "Learner profile was not found.",
    );
  }

  const currentSpeechLadder =
    profile.current_speech_ladder ??
    profile.suggested_speech_ladder ??
    null;

  /*
    Database activity/session ladder levels are stored in
    lowercase, while profile values may use display casing
    such as "Word".

    Normalize only for database comparisons.
  */
  const normalizedSpeechLadder = 
    currentSpeechLadder
        ?.trim()
        .toLowerCase() ??
    null;

  /* =======================================================
     2. GET LEARNER ADAPTATION SETTINGS
  ======================================================= */

  const {
    data: settings,
    error: settingsError,
  } = await supabase
    .from("learner_adaptation_settings")
    .select(`
      required_success_percentage,
      minimum_activities_mastered,
      therapist_approval_required
    `)
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .maybeSingle();

  if (settingsError) {
    throw settingsError;
  }

  const requiredSuccessRate =
    Number(
      settings?.required_success_percentage ??
      80,
    );

  const requiredActivities =
    Number(
      settings?.minimum_activities_mastered ??
      5,
    );

  const therapistApprovalRequired =
    settings?.therapist_approval_required ??
    true;

  /* =======================================================
     3. GET MASTERED SESSIONS
  ======================================================= */

  const {
    data: sessions,
    error: sessionsError,
  } = await supabase
    .from("learner_activity_sessions")
    .select(`
        activity_id,
        success_rate,
        activity_mastered
    `)
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .eq(
      "speech_ladder_level",
      normalizedSpeechLadder,
    )
    .eq(
      "activity_mastered",
      true,
    );

  if (sessionsError) {
    throw sessionsError;
  }

  const masteredSessions =
    sessions ?? [];

    /*
    Progression requires DIFFERENT mastered activities,
    not repeated mastery of the same activity.
  */
  const masteredActivityIds =
    new Set(
      masteredSessions
        .map(
          (session) =>
            session.activity_id,
        )
        .filter(
          (
            activityId,
          ): activityId is string =>
            typeof activityId ===
              "string" &&
            activityId.length > 0,
        ),
    );

  /* =======================================================
     4. CALCULATE PROGRESSION METRICS
  ======================================================= */

  const activitiesMastered =
    masteredActivityIds.size;

  const averageSuccessRate =
    activitiesMastered > 0
      ? Number(
          (
            masteredSessions.reduce(
              (total, session) =>
                total +
                Number(
                  session.success_rate ??
                    0,
                ),
              0,
            ) /
            activitiesMastered
          ).toFixed(2),
        )
      : 0;

  const eligibleForProgression =
    activitiesMastered >=
      requiredActivities &&
    averageSuccessRate >=
      requiredSuccessRate;

  /* =======================================================
     5. RETURN RECOMMENDATION
  ======================================================= */

  return {
    currentSpeechLadder,

    activitiesMastered,

    requiredActivities,

    averageSuccessRate,

    requiredSuccessRate,

    therapistApprovalRequired,

    eligibleForProgression,

    recommendedNextAction:
      eligibleForProgression
        ? therapistApprovalRequired
          ? "therapist_review"
          : "remain"
        : "remain",
  };
}