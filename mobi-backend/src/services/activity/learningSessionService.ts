// mobi-backend/src/services/activity/learningSessionService.ts


import { supabase } from "../../config/supabase";

import {
  startActivitySession,
} from "./activitySessionService";


import {
  selectNextActivity,
} from "./activitySelectionService";

import {
  evaluateLearnerProgression,
} from "./progressionService";

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
/*
  Automatically start the first activity session.

  The therapist or parent already selected the first
  activity when the learning session was created.
*/

await startActivitySession({
  centerId,

  learnerId,

  activityId:
    initialActivityId,

  learningSessionId:
    learningSession.id,

  sessionSource:
    "manual",
});

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


/* =========================================================
   COMPLETE ACTIVITY WITHIN LEARNING SESSION
========================================================= */

export async function completeActivityInLearningSession(
  learningSessionId: string,
) {

  /* =======================================================
     1. LOAD LEARNING SESSION
  ======================================================= */

  const {
    data: learningSession,
    error,
  } = await supabase
    .from("learner_learning_sessions")
    .select("*")
    .eq("id", learningSessionId)
    .single();

  if (
    error ||
    !learningSession
  ) {
    throw new Error(
      "Learning session was not found.",
    );
  }

  const {
    center_id,
    learner_id,
  } = learningSession;

  /* =======================================================
   2. EVALUATE LEARNER PROGRESSION
  ======================================================= */

  const progression =
    await evaluateLearnerProgression({
      centerId:
        center_id,

      learnerId:
        learner_id,
    });

  /* =======================================================
   3. SELECT NEXT ACTIVITY
  ======================================================= */

  const nextActivity =
    await selectNextActivity({
      centerId: center_id,
      learnerId: learner_id,
    });

  return {
  learningSession,

  progression,

  nextActivity,
};

}



/* =========================================================
   START NEXT ACTIVITY AFTER ADULT CONFIRMATION
========================================================= */

export async function startNextActivityInLearningSession(
  learningSessionId: string,
) {

  /* =======================================================
     1. LOAD ACTIVE LEARNING SESSION
  ======================================================= */

  const {
    data: learningSession,
    error: learningSessionError,
  } = await supabase
    .from("learner_learning_sessions")
    .select("*")
    .eq("id", learningSessionId)
    .single();

  if (
    learningSessionError ||
    !learningSession
  ) {
    throw new Error(
      "Learning session was not found.",
    );
  }

  if (
    learningSession.status !==
    "in_progress"
  ) {
    throw new Error(
      "Only an active learning session can start another activity.",
    );
  }

  const centerId =
    learningSession.center_id;

  const learnerId =
    learningSession.learner_id;

  /* =======================================================
     2. RE-EVALUATE THE NEXT ACTIVITY

     We deliberately select again here instead of trusting
     an activity ID sent by mobile.

     This keeps adaptive selection controlled by backend
     rules and avoids using a stale recommendation.
  ======================================================= */

  const selection =
    await selectNextActivity({
      centerId,
      learnerId,
    });

  if (!selection) {
    return {
      started:
        false,

      learningSession,

      selection:
        null,

      activitySession:
        null,

      message:
        "No eligible next activity is currently available.",
    };
  }

  /* =======================================================
     3. MAP SELECTION SOURCE
  ======================================================= */

  let sessionSource:
    | "assigned_required"
    | "assigned_recommended"
    | "adaptive";

  if (
    selection.source ===
    "assigned_required"
  ) {
    sessionSource =
      "assigned_required";
  } else if (
    selection.source ===
    "assigned_recommended"
  ) {
    sessionSource =
      "assigned_recommended";
  } else {
    sessionSource =
      "adaptive";
  }

  /* =======================================================
     4. START ACTIVITY INSIDE THIS LEARNING SESSION
  ======================================================= */

  const activitySession =
    await startActivitySession({
      centerId,

      learnerId,

      activityId:
        selection.activityId,

      learningSessionId,

      assignmentId:
        selection.assignmentId,

      sessionSource,

      selectionAlgorithm:
        selection.selectionAlgorithm,

      selectionReason:
        selection.selectionReason,
    });

  return {
    started:
      true,

    learningSession,

    selection,

    activitySession,

    message:
      "Recommended activity session started successfully.",
  };
}