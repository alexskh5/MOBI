import { supabase } from "../../config/supabase";
import {
  calculateProgressionEvidence,
  getNextSpeechLadderLevel,
  normalizeSpeechLadderLevel,
  type SpeechLadderLevel,
} from "./progressionRulesService";

export interface EvaluateProgressionInput {
  centerId: string;
  learnerId: string;
}

export interface ProgressionRecommendation {
  recommendationId: string | null;
  currentSpeechLadder: string | null;
  recommendedSpeechLadder: SpeechLadderLevel | null;
  activitiesMastered: number;
  requiredActivities: number;
  averageSuccessRate: number;
  requiredSuccessRate: number;
  therapistApprovalRequired: true;
  eligibleForProgression: boolean;
  communicationAttemptRate: number;
  approximationRate: number;
  masteryPercentage: number;
  recommendationReason: string;
  recommendedNextAction: "remain" | "therapist_review";
}

export interface DecideProgressionInput {
  centerId: string;
  learnerId: string;
  recommendationId: string;
  therapistId: string;
  decision: "approved" | "declined" | "adjusted";
  therapistNotes?: string | null;
  adjustedSpeechLadder?: SpeechLadderLevel | null;
}

function roundPercentage(numerator: number, denominator: number) {
  return denominator > 0
    ? Number(((numerator / denominator) * 100).toFixed(2))
    : 0;
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

async function findPendingProgressionRecommendation(input: {
  centerId: string;
  learnerId: string;
  fromSpeechLadder: SpeechLadderLevel;
  toSpeechLadder: SpeechLadderLevel;
}) {
  const { data, error } = await supabase
    .from("learner_progression_history")
    .select("id")
    .eq("center_id", input.centerId)
    .eq("learner_id", input.learnerId)
    .eq("from_speech_ladder", input.fromSpeechLadder)
    .eq("to_speech_ladder", input.toSpeechLadder)
    .is("therapist_decision", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function persistPendingRecommendation(input: {
  centerId: string;
  learnerId: string;
  fromSpeechLadder: SpeechLadderLevel;
  toSpeechLadder: SpeechLadderLevel;
  activitiesMastered: number;
  averageSuccessRate: number;
  evidence: Record<string, unknown>;
}) {
  const existing = await findPendingProgressionRecommendation(input);

  if (existing) {
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("learner_progression_history")
    .insert({
      center_id: input.centerId,
      learner_id: input.learnerId,
      from_speech_ladder: input.fromSpeechLadder,
      to_speech_ladder: input.toSpeechLadder,
      progression_type: "progression",
      recommendation_source: "adaptive_engine",
      activities_mastered: input.activitiesMastered,
      average_success_rate: input.averageSuccessRate,
      evidence: input.evidence,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (isUniqueViolation(error)) {
      const concurrent = await findPendingProgressionRecommendation(input);

      if (concurrent) {
        return concurrent.id as string;
      }
    }

    throw error ?? new Error("Unable to save progression recommendation.");
  }

  return data.id as string;
}

export async function evaluateLearnerProgression(
  input: EvaluateProgressionInput,
): Promise<ProgressionRecommendation> {
  const { centerId, learnerId } = input;

  const { data: profile, error: profileError } = await supabase
    .from("learner_transactional_profiles")
    .select(
      "current_speech_ladder, suggested_speech_ladder, therapist_confirmed",
    )
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error("Learner profile was not found.");
  }

  const currentSpeechLadder = profile.current_speech_ladder ?? null;
  const normalizedSpeechLadder = normalizeSpeechLadderLevel(
    currentSpeechLadder,
  );
  const recommendedSpeechLadder = getNextSpeechLadderLevel(
    normalizedSpeechLadder,
  );

  const { data: settings, error: settingsError } = await supabase
    .from("learner_adaptation_settings")
    .select(
      "required_success_percentage, minimum_activities_mastered",
    )
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .maybeSingle();

  if (settingsError) {
    throw settingsError;
  }

  const requiredSuccessRate = Number(
    settings?.required_success_percentage ?? 80,
  );
  const requiredActivities = Number(
    settings?.minimum_activities_mastered ?? 5,
  );

  if (!normalizedSpeechLadder || profile.therapist_confirmed !== true) {
    return {
      recommendationId: null,
      currentSpeechLadder,
      recommendedSpeechLadder: null,
      activitiesMastered: 0,
      requiredActivities,
      averageSuccessRate: 0,
      requiredSuccessRate,
      therapistApprovalRequired: true,
      eligibleForProgression: false,
      communicationAttemptRate: 0,
      approximationRate: 0,
      masteryPercentage: 0,
      recommendationReason:
        "A therapist must confirm the learner's current Speech Ladder before progression can be evaluated.",
      recommendedNextAction: "remain",
    };
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("learner_activity_sessions")
    .select(`
      id,
      activity_id,
      success_rate,
      activity_mastered,
      completed_at,
      learner_activity_attempts (
        communication_attempt,
        approximation_detected
      )
    `)
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .eq("speech_ladder_level", normalizedSpeechLadder)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  if (sessionsError) {
    throw sessionsError;
  }

  const completedSessions = sessions ?? [];
  const progressionSessions = completedSessions.map((session) => ({
      activityId:
        typeof session.activity_id === "string"
          ? session.activity_id
          : null,
      successRate:
        session.success_rate === null
          ? null
          : Number(session.success_rate),
      completedAt:
        typeof session.completed_at === "string"
          ? session.completed_at
          : null,
      mastered: session.activity_mastered === true,
    }));
  const evidence = calculateProgressionEvidence(
    progressionSessions,
    requiredActivities,
    requiredSuccessRate,
  );
  const attempts = completedSessions.flatMap(
    (session) => session.learner_activity_attempts ?? [],
  );
  const communicationAttempts = attempts.filter(
    (attempt) => attempt.communication_attempt === true,
  ).length;
  const approximations = attempts.filter(
    (attempt) => attempt.approximation_detected === true,
  ).length;
  const eligibleForProgression =
    evidence.eligible && recommendedSpeechLadder !== null;
  const metrics = {
    requiredActivities,
    requiredSuccessRate,
    activitiesMastered: evidence.activitiesMastered,
    averageSuccessRate: evidence.averageSuccessRate,
    communicationAttemptRate: roundPercentage(
      communicationAttempts,
      attempts.length,
    ),
    approximationRate: roundPercentage(
      approximations,
      communicationAttempts,
    ),
  };

  let recommendationId: string | null = null;

  if (
    eligibleForProgression &&
    normalizedSpeechLadder &&
    recommendedSpeechLadder
  ) {
    recommendationId = await persistPendingRecommendation({
      centerId,
      learnerId,
      fromSpeechLadder: normalizedSpeechLadder,
      toSpeechLadder: recommendedSpeechLadder,
      activitiesMastered: evidence.activitiesMastered,
      averageSuccessRate: evidence.averageSuccessRate,
      evidence: metrics,
    });
  }

  const atHighestLevel = recommendedSpeechLadder === null;

  return {
    recommendationId,
    currentSpeechLadder,
    recommendedSpeechLadder,
    activitiesMastered: evidence.activitiesMastered,
    requiredActivities,
    averageSuccessRate: evidence.averageSuccessRate,
    requiredSuccessRate,
    therapistApprovalRequired: true,
    eligibleForProgression,
    communicationAttemptRate: metrics.communicationAttemptRate,
    approximationRate: metrics.approximationRate,
    masteryPercentage: evidence.masteryPercentage,
    recommendationReason: atHighestLevel
      ? "The learner is already at the highest Speech Ladder level. Continue collecting evidence without automatic progression."
      : eligibleForProgression
        ? `The learner met the configured pattern requirements for ${normalizedSpeechLadder} and is ready for therapist review.`
        : "The learner should continue receiving support at the current Speech Ladder level while more evidence is collected.",
    recommendedNextAction: eligibleForProgression
      ? "therapist_review"
      : "remain",
  };
}

export async function decideLearnerProgression(
  input: DecideProgressionInput,
) {
  const { data, error } = await supabase.rpc(
    "decide_learner_progression",
    {
      p_center_id: input.centerId,
      p_learner_id: input.learnerId,
      p_recommendation_id: input.recommendationId,
      p_therapist_id: input.therapistId,
      p_decision: input.decision,
      p_therapist_notes: input.therapistNotes ?? null,
      p_adjusted_speech_ladder:
        input.adjustedSpeechLadder ?? null,
    },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function getLearnerProgressionHistory(
  centerId: string,
  learnerId: string,
) {
  const { data, error } = await supabase
    .from("learner_progression_history")
    .select("*")
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
