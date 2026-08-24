// mobi-backend/src/services/progress/socialReadinessProgressService.tsimport { supabase } from "../../config/supabase";


import { supabase } from "../../config/supabase";

import {
  getProgressDateRange,
  type LearnerProgressPeriod,
} from "./learnerProgressService";

/* =========================================================
   INPUT
========================================================= */

export interface GetSocialReadinessProgressInput {
  centerId: string;

  learnerId: string;

  period: LearnerProgressPeriod;

  anchorDate?: string;
}

/* =========================================================
   RESULT
========================================================= */

export interface SocialReadinessProgressResult {
  learnerId: string;

  period: LearnerProgressPeriod;

  dateRange: {
    start: string;
    end: string;
  };

  metrics: {
    activitiesCompleted: number;

    communicationAttempts: number;

    targetAchievements: number;

    participationResponses: number;

    engagementSeconds: number;

    inactivitySeconds: number;

    averageResponseTimeMs: number | null;

    activitiesMastered: number;
  };
}


/* =========================================================
   GET SOCIAL READINESS PROGRESS
========================================================= */

export async function getSocialReadinessProgress(
  input: GetSocialReadinessProgressInput,
): Promise<SocialReadinessProgressResult> {
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
      center_id
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
      "Unable to verify learner for social readiness progress:",
      learnerError,
    );

    throw new Error(
      "Learner was not found in this center.",
    );
  }

  /* =======================================================
     2. GET SOCIAL READINESS ACTIVITY SESSIONS
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
      inactivity_seconds,
      gaze_present_seconds,
      gaze_detection_available,
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
      "social_readiness",
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
      "Unable to fetch social readiness sessions:",
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
     3. GET ATTEMPTS
  ======================================================= */

  let attempts:
    Array<{
      response_type:
        string | null;

      communication_attempt:
        boolean | null;

      target_achieved:
        boolean | null;

      accepted:
        boolean | null;

      is_correct:
        boolean | null;

      approximation_detected:
        boolean | null;

      response_time_ms:
        number | null;
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
        response_type,
        communication_attempt,
        target_achieved,
        accepted,
        is_correct,
        approximation_detected,
        response_time_ms
      `)
      .in(
        "session_id",
        sessionIds,
      );

    if (attemptsError) {
      console.error(
        "Unable to fetch social readiness attempts:",
        attemptsError,
      );

      throw attemptsError;
    }

    attempts =
      attemptsData ?? [];
  }

  /* =======================================================
     4. CALCULATE METRICS
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
        if (
          attempt.target_achieved ===
          true
        ) {
          return true;
        }

        return (
          attempt.accepted === true &&
          attempt.is_correct === true &&
          attempt.approximation_detected !==
            true
        );
      },
    ).length;

  /*
    Participation responses include structured responses
    that are not limited to speech.

    Examples:
    - choice
    - action
    - conversation
  */
  const participationResponses =
    attempts.filter(
      (attempt) =>
        attempt.response_type ===
          "choice" ||
        attempt.response_type ===
          "action" ||
        attempt.response_type ===
          "conversation",
    ).length;

  const inactivitySeconds =
    sessions.reduce(
      (
        total,
        session,
      ) =>
        total +
        Number(
          session.inactivity_seconds ??
          0,
        ),
      0,
    );

  /*
    This is an observed engagement indicator only.

    It must not be interpreted as "eye contact".
  */
  const engagementSeconds =
    sessions.reduce(
      (
        total,
        session,
      ) => {
        if (
          session
            .gaze_detection_available !==
          true
        ) {
          return total;
        }

        return (
          total +
          Number(
            session
              .gaze_present_seconds ??
            0,
          )
        );
      },
      0,
    );

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

//   /* =======================================================
//      5. GET MASTERY COUNT

//      For now this uses the learner profile's recorded
//      activities_mastered total.

//      Later, if we want domain-specific mastery, we can
//      calculate it directly from activity mastery records.
//   ======================================================= */

//   const {
//     data: profile,
//     error: profileError,
//   } = await supabase
//     .from(
//       "learner_transactional_profiles",
//     )
//     .select(`
//       activities_mastered
//     `)
//     .eq(
//       "learner_id",
//       learnerId,
//     )
//     .eq(
//       "center_id",
//       centerId,
//     )
//     .maybeSingle();

//   if (profileError) {
//     console.error(
//       "Unable to fetch learner profile for social readiness progress:",
//       profileError,
//     );

//     throw profileError;
//   }

  return {
    learnerId,

    period,

    dateRange,

    metrics: {
      activitiesCompleted,

      communicationAttempts,

      targetAchievements,

      participationResponses,

      engagementSeconds,

      inactivitySeconds,

      averageResponseTimeMs,

      /*
  Domain-specific social-readiness mastery will be
  calculated later from mastery records linked to
  social_readiness activities.

  Do not reuse the learner's overall mastery count here.
*/
      activitiesMastered:
        0,
    },
  };
}