import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

export interface StartLearningSessionInput {
  centerId: string;
  learnerId: string;

  /*
    The therapist/parent chooses the first activity.

    MOBI does NOT automatically decide the first activity.
  */
  initialActivityId: string;

  startedBy:
    | "therapist"
    | "parent"
    | "center_admin"
    | "system";
}

export interface LearningSession {
  id: string;

  center_id: string;

  learner_id: string;

  status: string;

  started_by: string | null;

  initial_activity_id: string | null;

  effective_session_settings: Record<
    string,
    unknown
  >;

  started_at: string;

  ended_at: string | null;
}


export type LearningSessionEndReason =
  | "completed"
  | "parent_stopped"
  | "therapist_stopped"
  | "auto_inactivity"
  | "screen_time_limit"
  | "system_interrupted";


export interface EndLearningSessionInput {
  learningSessionId: string;

  endReason:
    LearningSessionEndReason;

  stoppedBy:
    | "parent"
    | "therapist"
    | "system";

  totalDurationSeconds: number;

  totalActivityRuns: number;

  completedActivityRuns: number;

  skippedActivityRuns: number;

  totalInactivitySeconds: number;

  totalBreakCount: number;
}

/* =========================================================
   START LEARNING SESSION
========================================================= */

export async function startLearningSession(
  input: StartLearningSessionInput,
): Promise<LearningSession> {

  const {
    centerId,
    learnerId,
    initialActivityId,
    startedBy,
  } = input;

  /*
    Snapshot learner adaptive settings.

    This preserves the settings that were active
    when the session began, even if the therapist
    changes them later.
  */

  const {
    data: adaptationSettings,
  } = await supabase
    .from(
      "learner_adaptation_settings",
    )
    .select("*")
    .eq(
      "center_id",
      centerId,
    )
    .eq(
      "learner_id",
      learnerId,
    )
    .maybeSingle();

  const {
    data: learningSession,
    error,
  } = await supabase
    .from(
      "learner_learning_sessions",
    )
    .insert({
      center_id:
        centerId,

      learner_id:
        learnerId,

      started_by:
        startedBy,

      initial_activity_id:
        initialActivityId,

      effective_session_settings:
        adaptationSettings ??
        {},
    })
    .select()
    .single();

  if (
    error ||
    !learningSession
  ) {
    console.error(
      "Unable to create learning session:",
      error,
    );

    throw new Error(
      "Unable to start learning session.",
    );
  }

  return learningSession;
}


/* =========================================================
   END LEARNING SESSION
========================================================= */

export async function endLearningSession(
  input: EndLearningSessionInput,
): Promise<LearningSession> {

  const {
    learningSessionId,
    endReason,
    stoppedBy,

    totalDurationSeconds,
    totalActivityRuns,
    completedActivityRuns,
    skippedActivityRuns,
    totalInactivitySeconds,
    totalBreakCount,
  } = input;

  /*
    Determine final session status.

    This keeps reporting consistent.
  */

  let status:
    | "completed"
    | "stopped"
    | "auto_stopped"
    | "interrupted";

  switch (endReason) {

    case "completed":
      status =
        "completed";
      break;

    case "auto_inactivity":
    case "screen_time_limit":
      status =
        "auto_stopped";
      break;

    case "system_interrupted":
      status =
        "interrupted";
      break;

    default:
      status =
        "stopped";
  }

  const {
    data: updatedSession,
    error,
  } = await supabase
    .from(
      "learner_learning_sessions",
    )
    .update({

      status,

      ended_at:
        new Date().toISOString(),

      total_duration_seconds:
        totalDurationSeconds,

      total_activity_runs:
        totalActivityRuns,

      completed_activity_runs:
        completedActivityRuns,

      skipped_activity_runs:
        skippedActivityRuns,

      total_inactivity_seconds:
        totalInactivitySeconds,

      total_break_count:
        totalBreakCount,

      stopped_by:
        stoppedBy,

      stop_reason:
        endReason,

      auto_stop_triggered:
        status ===
        "auto_stopped",

      auto_stop_reason:
        status ===
        "auto_stopped"
          ? endReason
          : null,

      updated_at:
        new Date().toISOString(),

    })
    .eq(
      "id",
      learningSessionId,
    )
    .select()
    .single();

  if (
    error ||
    !updatedSession
  ) {
    console.error(
      "Unable to end learning session:",
      error,
    );

    throw new Error(
      "Unable to end learning session.",
    );
  }

  return updatedSession;
}