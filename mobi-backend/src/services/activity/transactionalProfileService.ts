import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

export interface RefreshTransactionalProfileInput {
  centerId: string;
  learnerId: string;
}

/* =========================================================
   REFRESH LEARNER TRANSACTIONAL PROGRESS

   PURPOSE:

   Recalculate the learner's live progress summary from the
   actual saved session history.

   We RECALCULATE instead of simply doing:

   total_sessions + 1

   because recalculation is safer if:
   - an API request is retried
   - session data is corrected
   - a previous session is removed during development
========================================================= */

export async function refreshLearnerTransactionalProgress(
  input: RefreshTransactionalProfileInput,
) {
  const {
    centerId,
    learnerId,
  } = input;

  /* =======================================================
     1. VERIFY TRANSACTIONAL PROFILE EXISTS
  ======================================================= */

  const {
    data: existingProfile,
    error: profileError,
  } = await supabase
    .from(
      "learner_transactional_profiles",
    )
    .select(`
      id,
      learner_id,
      center_id
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
      "Unable to fetch learner transactional profile:",
      profileError,
    );

    throw profileError;
  }

  if (!existingProfile) {
    throw new Error(
      "Learner transactional profile was not found.",
    );
  }

  /* =======================================================
     2. GET FINISHED SESSION HISTORY

     We exclude in_progress because it has not produced a
     final outcome yet.
  ======================================================= */

  const {
    data: sessions,
    error: sessionsError,
  } = await supabase
    .from(
      "learner_activity_sessions",
    )
    .select(`
      id,
      activity_id,
      status,
      total_duration_seconds,
      success_rate,
      activity_mastered
    `)
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .neq(
      "status",
      "in_progress",
    );

  if (sessionsError) {
    console.error(
      "Unable to fetch learner session history:",
      sessionsError,
    );

    throw sessionsError;
  }

  const finishedSessions =
    sessions ?? [];

  /* =======================================================
     3. TOTAL SESSIONS
  ======================================================= */

  const totalSessions =
    finishedSessions.length;

  /* =======================================================
     4. TOTAL LEARNING TIME
  ======================================================= */

  const totalDurationSeconds =
    finishedSessions.reduce(
      (
        total,
        session,
      ) =>
        total +
        Math.max(
          0,
          Number(
            session.total_duration_seconds ??
              0,
          ),
        ),
      0,
    );

  const totalTimeMinutes =
    Math.round(
      totalDurationSeconds /
        60,
    );

  /* =======================================================
     5. DISTINCT MASTERED ACTIVITIES

     Repeating and mastering the same activity several times
     must still count as ONE mastered activity.
  ======================================================= */

  const masteredActivityIds =
    new Set(
      finishedSessions
        .filter(
          (session) =>
            session.activity_mastered ===
            true,
        )
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

  const activitiesMastered =
    masteredActivityIds.size;

  /* =======================================================
     6. OVERALL SUCCESS RATE

     Only sessions with an actual numeric success rate are
     included.

     Skipped/interrupted sessions with no scored responses
     therefore do not become artificial 0% scores.
  ======================================================= */

  const sessionsWithSuccessRate =
    finishedSessions.filter(
      (session) =>
        session.success_rate !==
          null &&
        session.success_rate !==
          undefined &&
        Number.isFinite(
          Number(
            session.success_rate,
          ),
        ),
    );

  const overallSuccessRate =
    sessionsWithSuccessRate.length >
    0
      ? Number(
          (
            sessionsWithSuccessRate.reduce(
              (
                total,
                session,
              ) =>
                total +
                Number(
                  session.success_rate,
                ),
              0,
            ) /
            sessionsWithSuccessRate.length
          ).toFixed(2),
        )
      : null;

  /* =======================================================
     7. UPDATE TRANSACTIONAL PROFILE
  ======================================================= */

  const {
    data: updatedProfile,
    error: updateError,
  } = await supabase
    .from(
      "learner_transactional_profiles",
    )
    .update({
      total_sessions:
        totalSessions,

      total_time_minutes:
        totalTimeMinutes,

      activities_mastered:
        activitiesMastered,

      overall_success_rate:
        overallSuccessRate,

      last_updated:
        new Date().toISOString(),
    })
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .select("*")
    .single();

  if (updateError) {
    console.error(
      "Unable to update learner transactional progress:",
      updateError,
    );

    throw updateError;
  }

  /* =======================================================
     8. RETURN UPDATED SUMMARY
  ======================================================= */

  return {
    profile:
      updatedProfile,

    progressSummary: {
      totalSessions,

      totalTimeMinutes,

      activitiesMastered,

      overallSuccessRate,
    },
  };
}