// mobi-backend/src/services/progress/speechTrainingProgressService.ts



import { supabase } from "../../config/supabase";

import {
  getProgressDateRange,
  type LearnerProgressPeriod,
} from "./learnerProgressService";

/* =========================================================
   INPUT
========================================================= */

export interface GetSpeechTrainingProgressInput {
  centerId: string;

  learnerId: string;

  period:
    LearnerProgressPeriod;

  anchorDate?: string;
}

/* =========================================================
   RESULT TYPES
========================================================= */

export interface SpeechTrainingProgressResult {
  learnerId: string;

  period:
    LearnerProgressPeriod;

  dateRange: {
    start: string;
    end: string;
  };

  currentSpeechLadder:
    string | null;

  suggestedSpeechLadder:
    string | null;

  metrics: {
    activitiesCompleted:
      number;

    communicationAttempts:
      number;

    targetAchievements:
      number;

    speechApproximations:
      number;

    exactMatches:
      number;

    acceptedVariations:
      number;

    phoneticMatches:
      number;

    noResponseAttempts:
      number;

    totalAttempts:
      number;

    averageResponseTimeMs:
      number | null;

    oneMoreTryUsedCount:
      number;

    activitiesMastered:
      number;
  };
}



/* =========================================================
   GET SPEECH TRAINING PROGRESS
========================================================= */

export async function getSpeechTrainingProgress(
  input:
    GetSpeechTrainingProgressInput,
): Promise<SpeechTrainingProgressResult> {

  const {
    centerId,
    learnerId,
    period,
    anchorDate,
  } = input;

  const dateRange =
    getProgressDateRange(
      period,
      anchorDate,
    );

  /* =======================================================
     1. VERIFY LEARNER
  ======================================================= */

  const {
    data: learner,
    error: learnerError,
  } = await supabase
    .from("learners")
    .select(`
      id,
      center_id,
      enrollment_status
    `)
    .eq(
      "id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .single();

  if (
    learnerError ||
    !learner
  ) {
    console.error(
      "Unable to verify learner for speech progress:",
      learnerError,
    );

    throw new Error(
      "Learner was not found in this center.",
    );
  }

  /* =======================================================
     2. GET CURRENT SPEECH LADDER PROFILE
  ======================================================= */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from(
      "learner_transactional_profiles",
    )
    .select(`
      current_speech_ladder,
      suggested_speech_ladder,
      activities_mastered
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

  if (profileError) {
    console.error(
      "Unable to fetch learner speech profile:",
      profileError,
    );

    throw profileError;
  }

  /* =======================================================
     3. GET SPEECH-TRAINING ACTIVITY SESSIONS
  ======================================================= */

  const {
    data: sessionsData,
    error: sessionsError,
  } = await supabase
    .from(
      "learner_activity_sessions",
    )
    .select(`
      id,
      activity_id,
      status,
      started_at,
      completed_at,
      average_response_time_ms,

      activity:activities!inner(
        id,
        activity_domain
      )
    `)
    .eq(
      "center_id",
      centerId,
    )
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "activity.activity_domain",
      "speech_training",
    )
    .gte(
      "started_at",
      dateRange.start,
    )
    .lte(
      "started_at",
      dateRange.end,
    );

  if (sessionsError) {
    console.error(
      "Unable to fetch speech-training sessions:",
      sessionsError,
    );

    throw sessionsError;
  }

  const sessions =
    sessionsData ?? [];

  const sessionIds =
    sessions.map(
      (session) =>
        session.id,
    );

  /* =======================================================
     4. GET ATTEMPTS
  ======================================================= */

  let attempts:
    Array<{
        communication_attempt:
        boolean | null;

        target_achieved:
        boolean | null;

        approximation_detected:
        boolean | null;

        accepted:
        boolean | null;

        is_correct:
        boolean | null;

        matching_method:
        string | null;

        response_time_ms:
        number | null;

        one_more_try_used:
        boolean | null;
    }> = [];

  if (
    sessionIds.length > 0
  ) {
    const {
        data: attemptsData,
        error: attemptsError,
        } = await supabase
        .from(
            "learner_activity_attempts",
        )
        .select(`
            communication_attempt,
            target_achieved,
            approximation_detected,
            accepted,
            is_correct,
            matching_method,
            response_time_ms,
            one_more_try_used
        `)
        .in(
            "session_id",
            sessionIds,
        );

    if (attemptsError) {
      console.error(
        "Unable to fetch speech-training attempts:",
        attemptsError,
      );

      throw attemptsError;
    }

    attempts =
      attemptsData ?? [];
  }

  /* =======================================================
     5. CALCULATE METRICS
  ======================================================= */

  const activitiesCompleted =
    sessions.filter(
      (session) =>
        session.status ===
        "completed",
    ).length;

  const communicationAttempts =
    attempts.filter(
      (attempt) =>
        attempt.communication_attempt ===
        true,
    ).length;

  const targetAchievements =
    attempts.filter(
        (attempt) => {

        /*
            New MOBI attempts explicitly store target_achieved.
        */
        if (
            attempt.target_achieved ===
            true
        ) {
            return true;
        }

        /*
            Backward compatibility:

            Older attempts existed before target_achieved was
            added to the database.

            If the attempt was accepted/correct and was NOT
            recorded as an approximation, it represents a
            successful target response.
        */
        if (
            attempt.accepted ===
            true &&
            attempt.is_correct ===
            true &&
            attempt.approximation_detected !==
            true
        ) {
            return true;
        }

        return false;
        },
    ).length;

const speechApproximations =
  attempts.filter(
    (attempt) =>
      attempt.approximation_detected ===
      true,
  ).length;

  const exactMatches =
    attempts.filter(
      (attempt) =>
        attempt.matching_method ===
        "exact_match",
    ).length;

  const acceptedVariations =
    attempts.filter(
      (attempt) =>
        attempt.matching_method ===
        "accepted_variation",
    ).length;

  const phoneticMatches =
    attempts.filter(
      (attempt) =>
        attempt.matching_method ===
        "phonetic_match",
    ).length;

  const noResponseAttempts =
    attempts.filter(
      (attempt) =>
        attempt.communication_attempt !==
        true,
    ).length;

  const oneMoreTryUsedCount =
    attempts.filter(
      (attempt) =>
        attempt.one_more_try_used ===
        true,
    ).length;

  const responseTimes =
    attempts
      .map(
        (attempt) =>
          attempt.response_time_ms,
      )
      .filter(
        (
          value,
        ): value is number =>
          typeof value ===
          "number",
      );

  const averageResponseTimeMs =
    responseTimes.length > 0
      ? Math.round(
          responseTimes.reduce(
            (
              total,
              value,
            ) =>
              total +
              value,
            0,
          ) /
          responseTimes.length,
        )
      : null;

  /* =======================================================
     6. RETURN
  ======================================================= */

  return {
    learnerId,

    period,

    dateRange,

    currentSpeechLadder:
      profile
        ?.current_speech_ladder ??
      null,

    suggestedSpeechLadder:
      profile
        ?.suggested_speech_ladder ??
      null,

    metrics: {
      activitiesCompleted,

      communicationAttempts,

      targetAchievements,

      speechApproximations,

      exactMatches,

      acceptedVariations,

      phoneticMatches,

      noResponseAttempts,

      totalAttempts:
        attempts.length,

      averageResponseTimeMs,

      oneMoreTryUsedCount,

      activitiesMastered:
        Number(
          profile
            ?.activities_mastered ??
          0,
        ),
    },
  };
}