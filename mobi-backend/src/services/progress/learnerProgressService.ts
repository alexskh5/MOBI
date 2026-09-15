import { supabase } from "../../config/supabase";
import { getCenterDateRange } from "../time/centerTimeService";

/* =========================================================
   PROGRESS FILTER TYPES
========================================================= */

export type LearnerProgressPeriod =
  | "day"
  | "week"
  | "month"
  | "year";

export interface GetLearnerProgressInput {
  centerId: string;

  learnerId: string;

  period:
    LearnerProgressPeriod;

  /*
    Optional anchor date.

    Example:

    period = "week"
    anchorDate = "2026-08-20"

    MOBI will calculate the week containing that date.

    If no date is supplied, today's date is used.
  */
  anchorDate?: string;
}

/* =========================================================
   DATE RANGE
========================================================= */

export interface ProgressDateRange {
  start:
    string;

  end:
    string;
}


/* =========================================================
   PAGE 1 — PROGRESS OVERVIEW RESULT
========================================================= */

export interface LearnerProgressOverview {
  learnerId: string;

  period:
    LearnerProgressPeriod;

  dateRange: {
    start: string;
    end: string;
  };

  metrics: {
    activitiesCompleted: number;

    communicationAttempts: number;

    targetAchievements: number;

    speechApproximations: number;

    observedEngagementSeconds: number;

    inactivitySeconds: number;

    screenTimeSeconds: number;

    screenTimeLimitSeconds:
      number | null;

    scoredAttempts: number;

    correctAttempts: number;

    incorrectAttempts: number;

    scoredSuccessRate: number | null;
  };
}

/* =========================================================
   BUILD DATE RANGE
========================================================= */

export function getProgressDateRange(
  period:
    LearnerProgressPeriod,

  anchorDate?: string,
): ProgressDateRange {
  return getCenterDateRange(period, anchorDate);
}



/* =========================================================
   GET LEARNER PROGRESS OVERVIEW
========================================================= */

export async function getLearnerProgressOverview(
  input: GetLearnerProgressInput,
): Promise<LearnerProgressOverview> {

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
      "Unable to verify learner for progress overview:",
      learnerError,
    );

    throw new Error(
      "Learner was not found in this center.",
    );
  }

  /* =======================================================
     2. GET ACTIVITY SESSIONS IN SELECTED PERIOD
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
      status,
      completed_at,
      total_duration_seconds,
      inactivity_seconds,
      gaze_present_seconds,
      gaze_detection_available,

      activity:activities!inner(
        id,
        delivery_mode
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
      "Unable to fetch learner sessions for progress overview:",
      sessionsError,
    );

    throw sessionsError;
  }

  const sessions =
    sessionsData ?? [];

  const activitySessionIds =
    sessions.map(
      (session) =>
        session.id,
    );

  /* =======================================================
     3. GET ATTEMPTS FROM THOSE SESSIONS
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

      response_type:
        string | null;

      should_score:
        boolean | null;

      is_correct:
        boolean | null;
    }> = [];

  if (
    activitySessionIds.length > 0
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
        response_type,
        should_score
      `)
      .in(
        "session_id",
        activitySessionIds,
      );

    if (attemptsError) {
      console.error(
        "Unable to fetch learner attempts for progress overview:",
        attemptsError,
      );

      throw attemptsError;
    }

    attempts =
      attemptsData ?? [];
  }

  /* =======================================================
     4. CALCULATE BASIC METRICS
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
            attempt.accepted ===
            true &&
            attempt.is_correct === true &&
            attempt.approximation_detected !==
            true
        );
        },
    ).length;

  const speechApproximations =
    attempts.filter(
      (attempt) =>
        attempt.approximation_detected ===
        true,
    ).length;

  const scoredAttempts = attempts.filter(
    (attempt) => attempt.should_score === true,
  );

  const correctAttempts = scoredAttempts.filter(
    (attempt) => attempt.is_correct === true,
  ).length;

  const incorrectAttempts = scoredAttempts.filter(
    (attempt) => attempt.is_correct === false,
  ).length;

  const scoredSuccessRate =
    scoredAttempts.length > 0
      ? Number(
          (
            (correctAttempts / scoredAttempts.length) *
            100
          ).toFixed(2),
        )
      : null;

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
    Gaze-present time is treated as an observed engagement
    indicator only when gaze detection was actually
    available.

    This is NOT interpreted as clinical "focus".
  */
  const observedEngagementSeconds =
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

  const screenTimeSeconds =
    sessions.reduce(
      (
        total,
        session,
      ) => {
        const activityRelation = session.activity;
        const activity = Array.isArray(activityRelation)
          ? activityRelation[0]
          : activityRelation;
        const deliveryMode =
          activity?.delivery_mode ?? "screen";

        if (deliveryMode === "guided_off_screen") {
          return total;
        }

        return total + Number(
          session.total_duration_seconds ?? 0,
        );
      },
      0,
    );

  /* =======================================================
     5. GET LEARNER SCREEN-TIME LIMIT

     Leave null if no configured value exists yet.

     We will connect this to the actual parent screen-time
     setting after checking its current database location.
  ======================================================= */

  const {
    data: childSafetySettings,
    error: childSafetySettingsError,
  } = await supabase
    .from("learner_child_safety_settings")
    .select("daily_screen_time_limit_seconds")
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .maybeSingle();

  if (childSafetySettingsError) {
    const optionalSettingsTableMissing =
      childSafetySettingsError.code === "PGRST205" ||
      childSafetySettingsError.code === "42P01" ||
      childSafetySettingsError.code === "42703";

    if (!optionalSettingsTableMissing) {
      console.error(
        "Unable to fetch learner screen-time settings:",
        childSafetySettingsError,
      );
    }
  }

  const screenTimeLimitSeconds =
    typeof childSafetySettings?.daily_screen_time_limit_seconds ===
      "number"
      ? childSafetySettings.daily_screen_time_limit_seconds
      : null;

  return {
    learnerId,

    period,

    dateRange,

    metrics: {
      activitiesCompleted,

      communicationAttempts,

      targetAchievements,

      speechApproximations,

      observedEngagementSeconds,

      inactivitySeconds,

      screenTimeSeconds,

      screenTimeLimitSeconds,

      scoredAttempts:
        scoredAttempts.length,

      correctAttempts,

      incorrectAttempts,

      scoredSuccessRate,
    },
  };
}
