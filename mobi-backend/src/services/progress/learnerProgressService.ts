import { supabase } from "../../config/supabase";

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

  const anchor =
    anchorDate
      ? new Date(
          `${anchorDate}T12:00:00`,
        )
      : new Date();

  if (
    Number.isNaN(
      anchor.getTime(),
    )
  ) {
    throw new Error(
      "Invalid progress anchor date.",
    );
  }

  const start =
    new Date(anchor);

  const end =
    new Date(anchor);

  /* =======================================================
     PER DAY
  ======================================================= */

  if (
    period ===
    "day"
  ) {
    start.setHours(
      0,
      0,
      0,
      0,
    );

    end.setHours(
      23,
      59,
      59,
      999,
    );
  }

  /* =======================================================
     PER WEEK

     Monday → Sunday
  ======================================================= */

  else if (
    period ===
    "week"
  ) {
    const currentDay =
      start.getDay();

    /*
      JavaScript:

      Sunday = 0
      Monday = 1
      ...
      Saturday = 6

      Convert that into a Monday-based week.
    */
    const daysFromMonday =
      currentDay === 0
        ? 6
        : currentDay - 1;

    start.setDate(
      start.getDate() -
      daysFromMonday,
    );

    start.setHours(
      0,
      0,
      0,
      0,
    );

    end.setTime(
      start.getTime(),
    );

    end.setDate(
      end.getDate() +
      6,
    );

    end.setHours(
      23,
      59,
      59,
      999,
    );
  }

  /* =======================================================
     PER MONTH
  ======================================================= */

  else if (
    period ===
    "month"
  ) {
    start.setDate(1);

    start.setHours(
      0,
      0,
      0,
      0,
    );

    end.setMonth(
      end.getMonth() +
      1,
      0,
    );

    end.setHours(
      23,
      59,
      59,
      999,
    );
  }

  /* =======================================================
     PER YEAR
  ======================================================= */

  else {
    start.setMonth(
      0,
      1,
    );

    start.setHours(
      0,
      0,
      0,
      0,
    );

    end.setMonth(
      11,
      31,
    );

    end.setHours(
      23,
      59,
      59,
      999,
    );
  }

  return {
    start:
      start.toISOString(),

    end:
      end.toISOString(),
  };
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
      gaze_detection_available
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

        is_correct:
            boolean | null;

      response_type:
        string | null;
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
        response_type
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

  /*
    Screen time:

    For this first version we use activity-session duration.

    Later we will refine this using delivery_mode so
    guided_off_screen / Do It activities do not incorrectly
    count all elapsed time as screen exposure.
  */
  const screenTimeSeconds =
    sessions.reduce(
      (
        total,
        session,
      ) =>
        total +
        Number(
          session
            .total_duration_seconds ??
          0,
        ),
      0,
    );

  /* =======================================================
     5. GET LEARNER SCREEN-TIME LIMIT

     Leave null if no configured value exists yet.

     We will connect this to the actual parent screen-time
     setting after checking its current database location.
  ======================================================= */

  const screenTimeLimitSeconds:
    number | null =
      null;

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
    },
  };
}