// mobi-backend/src/services/activity/learningSessionService.ts


import { supabase } from "../../config/supabase";

import {
  getActivitySessionById,
  startActivitySession,
} from "./activitySessionService";


import {
  selectNextActivity,
} from "./activitySelectionService";

import {
  evaluateLearnerProgression,
} from "./progressionService";
import {
  claimActivityRecommendation,
  getActivityRecommendation,
  markActivityRecommendationStarted,
  releaseActivityRecommendation,
} from "./activityRecommendationService";
import {
  getDailyScreenTimeStatus,
} from "./screenTimeService";

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

  initialAssignmentId?: string | null;

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
  centerId: string;

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
) {

  const {
    centerId,
    learnerId,
    initialActivityId,
    initialAssignmentId = null,
    startedBy,
  } = input;

  const {
    data: activeLearningSession,
    error: activeLearningSessionError,
  } = await supabase
    .from("learner_learning_sessions")
    .select("id")
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .eq("status", "in_progress")
    .maybeSingle();

  if (activeLearningSessionError) {
    throw activeLearningSessionError;
  }

  if (activeLearningSession) {
    throw new Error(
      "This learner already has an active learning session.",
    );
  }

  const screenTimeStatus = await getDailyScreenTimeStatus({
    centerId,
    learnerId,
  });

  if (screenTimeStatus.limitReached) {
    const { data: initialActivity, error: initialActivityError } =
      await supabase
        .from("activities")
        .select("delivery_mode")
        .eq("id", initialActivityId)
        .eq("center_id", centerId)
        .single();

    if (initialActivityError || !initialActivity) {
      throw new Error("The initial activity was not found.");
    }

    if (initialActivity.delivery_mode !== "guided_off_screen") {
      throw new Error(
        "The learner's daily screen-time limit has been reached.",
      );
    }
  }

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

  try {
    const initialActivitySession = await startActivitySession({
      centerId,
      learnerId,
      activityId: initialActivityId,
      learningSessionId: learningSession.id,
      assignmentId: initialAssignmentId,
      sessionSource: "manual",
    });

    return {
      learningSession,
      initialActivitySession,
    };
  } catch (activityStartError) {
    await supabase
      .from("learner_learning_sessions")
      .delete()
      .eq("id", learningSession.id)
      .eq("status", "in_progress");

    throw activityStartError;
  }
}


/* =========================================================
   END LEARNING SESSION
========================================================= */

export async function endLearningSession(
  input: EndLearningSessionInput,
): Promise<LearningSession> {

  const {
    centerId,
    learningSessionId,
    endReason,
    stoppedBy,

    totalInactivitySeconds,
    totalBreakCount,
  } = input;

  const {
    data: learningSession,
    error: learningSessionError,
  } = await supabase
    .from("learner_learning_sessions")
    .select("*")
    .eq("id", learningSessionId)
    .eq("center_id", centerId)
    .single();

  if (learningSessionError || !learningSession) {
    throw new Error("Learning session was not found in this center.");
  }

  if (learningSession.status !== "in_progress") {
    throw new Error("Only an active learning session can be ended.");
  }

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



  /* =========================================================
   CLOSE ANY ACTIVE ACTIVITY SESSION
========================================================= */

const activeActivityStopReason =
  endReason === "therapist_stopped"
    ? "learning_session_ended_by_therapist"
    : endReason === "parent_stopped"
      ? "learning_session_ended_by_parent"
      : endReason === "auto_inactivity"
        ? "learning_session_auto_inactivity"
        : endReason === "screen_time_limit"
          ? "learning_session_screen_time_limit"
          : endReason === "system_interrupted"
            ? "learning_session_system_interrupted"
            : "learning_session_completed";

const activeActivityStatus =
  endReason === "system_interrupted"
    ? "interrupted"
    : "stopped";

const endedAt = new Date();
const { data: activeActivity, error: activeActivityLookupError } =
  await supabase
    .from("learner_activity_sessions")
    .select("id, started_at")
    .eq("learning_session_id", learningSessionId)
    .eq("center_id", centerId)
    .eq("learner_id", learningSession.learner_id)
    .eq("status", "in_progress")
    .maybeSingle();

if (activeActivityLookupError) {
  throw activeActivityLookupError;
}

if (activeActivity && endReason === "completed") {
  throw new Error(
    "Finish the active activity before completing the learning session.",
  );
}

if (activeActivity) {
  const activeStartedAt = Date.parse(activeActivity.started_at);
  const activeDurationSeconds = Number.isFinite(activeStartedAt)
    ? Math.max(
        0,
        Math.round((endedAt.getTime() - activeStartedAt) / 1000),
      )
    : 0;
  const { error: activeActivityError } = await supabase
    .from("learner_activity_sessions")
    .update({
      status: activeActivityStatus,
      completed_at: endedAt.toISOString(),
      total_duration_seconds: activeDurationSeconds,
      stopped_by: stoppedBy,
      stop_reason: activeActivityStopReason,
    })
    .eq("id", activeActivity.id)
    .eq("status", "in_progress");

  if (activeActivityError) {
    console.error(
      "Unable to close active activity while ending learning session:",
      activeActivityError,
    );

    throw new Error(
      "Unable to close the active activity session.",
    );
  }
}

  const {
    data: activitySessions,
    error: activitySessionsError,
  } = await supabase
    .from("learner_activity_sessions")
    .select(`
      status,
      inactivity_seconds,
      break_count
    `)
    .eq("learning_session_id", learningSessionId)
    .eq("center_id", centerId)
    .eq("learner_id", learningSession.learner_id);

  if (activitySessionsError) {
    throw activitySessionsError;
  }

  const childSessions = activitySessions ?? [];
  const learningStartedAt = Date.parse(learningSession.started_at);
  const derivedDurationSeconds = Math.max(
    0,
    Number.isFinite(learningStartedAt)
      ? Math.round(
          (endedAt.getTime() - learningStartedAt) / 1000,
        )
      : 0,
  );
  const derivedInactivitySeconds = childSessions.reduce(
    (total, session) => {
      const value = Number(session.inactivity_seconds ?? 0);
      return total + (Number.isFinite(value) && value >= 0 ? value : 0);
    },
    0,
  );
  const derivedBreakCount = childSessions.reduce(
    (total, session) => {
      const value = Number(session.break_count ?? 0);
      return total + (Number.isFinite(value) && value >= 0 ? value : 0);
    },
    0,
  );
  const derivedActivityRuns = childSessions.length;
  const derivedCompletedRuns = childSessions.filter(
    (session) => session.status === "completed",
  ).length;
  const derivedSkippedRuns = childSessions.filter(
    (session) => session.status === "skipped",
  ).length;


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
        endedAt.toISOString(),

      total_duration_seconds:
        derivedDurationSeconds,

      total_activity_runs:
        derivedActivityRuns,

      completed_activity_runs:
        derivedCompletedRuns,

      skipped_activity_runs:
        derivedSkippedRuns,

      total_inactivity_seconds:
        Math.max(
          derivedInactivitySeconds,
          totalInactivitySeconds,
        ),

      total_break_count:
        Math.max(derivedBreakCount, totalBreakCount),

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
    .eq("center_id", centerId)
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
  recommendationId: string,
  requestCenterId: string,
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
    .eq("center_id", requestCenterId)
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

  let recommendation = await getActivityRecommendation({
    recommendationId,
    learningSessionId,
    centerId,
    learnerId,
  });

  if (
    recommendation.status === "started" &&
    typeof recommendation.activity_session_id === "string"
  ) {
    const existingActivitySession = await getActivitySessionById(
      recommendation.activity_session_id,
      centerId,
      learnerId,
    );

    return {
      started: false,
      alreadyStarted: true,
      learningSession,
      recommendation,
      activitySession: {
        session: existingActivitySession,
      },
      message:
        "The recommended activity session was already started.",
    };
  }

  if (recommendation.status === "starting") {
    const { data: recoverableSession, error: recoveryError } =
      await supabase
        .from("learner_activity_sessions")
        .select("id, activity_id")
        .eq("learning_session_id", learningSessionId)
        .eq("center_id", centerId)
        .eq("learner_id", learnerId)
        .eq("status", "in_progress")
        .maybeSingle();

    if (recoveryError) {
      throw recoveryError;
    }

    if (
      recoverableSession &&
      recoverableSession.activity_id === recommendation.activity_id
    ) {
      const completedRecommendation =
        await markActivityRecommendationStarted(
          recommendationId,
          recoverableSession.id,
        );
      const existingActivitySession = await getActivitySessionById(
        recoverableSession.id,
        centerId,
        learnerId,
      );

      return {
        started: false,
        alreadyStarted: true,
        recovered: true,
        learningSession,
        recommendation: completedRecommendation,
        activitySession: {
          session: existingActivitySession,
        },
        message:
          "The recommended activity session was recovered and is already active.",
      };
    }

    const claimAgeMilliseconds =
      Date.now() - Date.parse(recommendation.updated_at ?? "");

    if (
      !Number.isFinite(claimAgeMilliseconds) ||
      claimAgeMilliseconds < 30_000
    ) {
      throw new Error(
        "The activity recommendation is currently being started. Retry shortly.",
      );
    }

    await releaseActivityRecommendation(recommendationId);
    recommendation = await getActivityRecommendation({
      recommendationId,
      learningSessionId,
      centerId,
      learnerId,
    });
  }

  if (recommendation.status !== "pending") {
    throw new Error(
      "The activity recommendation is not available to start.",
    );
  }

    /* =======================================================
   2. PREVENT MULTIPLE ACTIVE ACTIVITY SESSIONS
======================================================= */

const {
  data: activeActivitySession,
  error: activeActivitySessionError,
} = await supabase
  .from("learner_activity_sessions")
  .select(`
    id,
    activity_id,
    status
  `)
  .eq(
    "learning_session_id",
    learningSessionId,
  )
  .eq(
    "learner_id",
    learnerId,
  )
  .eq(
    "center_id",
    centerId,
  )
  .eq(
    "status",
    "in_progress",
  )
  .maybeSingle();

if (activeActivitySessionError) {
  console.error(
    "Unable to check active activity session:",
    activeActivitySessionError,
  );

  throw activeActivitySessionError;
}

if (activeActivitySession) {
  throw new Error(
    "This learning session already has an activity in progress.",
  );
}

  const activityRelation = recommendation.activity;
  const activity = Array.isArray(activityRelation)
    ? activityRelation[0]
    : activityRelation;
  const selection = {
    activityId: recommendation.activity_id as string,
    assignmentId:
      typeof recommendation.assignment_id === "string"
        ? recommendation.assignment_id
        : null,
    source: recommendation.selection_source as
      | "assigned_required"
      | "assigned_recommended"
      | "adaptive_fallback",
    selectionAlgorithm: recommendation.selection_algorithm as
      | "assigned_priority"
      | "thompson_sampling"
      | "hybrid_thompson_personalized",
    selectionReason:
      recommendation.selection_reason ?? {},
    activity,
  };

  const screenTimeStatus = await getDailyScreenTimeStatus({
    centerId,
    learnerId,
  });

  if (
    screenTimeStatus.limitReached &&
    activity?.delivery_mode !== "guided_off_screen"
  ) {
    throw new Error(
      "The learner's daily screen-time limit has been reached. Choose an off-screen activity or end the session.",
    );
  }

  /* =======================================================
     3. MAP SELECTION SOURCE
  ======================================================= */

  const sessionSource =
    selection.source === "assigned_required"
      ? "assigned_required" as const
      : selection.source === "assigned_recommended"
        ? "assigned_recommended" as const
        : "adaptive" as const;

  await claimActivityRecommendation({
    recommendationId,
    learningSessionId,
    centerId,
    learnerId,
  });

  /* =======================================================
     4. START ACTIVITY INSIDE THIS LEARNING SESSION
  ======================================================= */

  let activitySession;

  try {
    activitySession = await startActivitySession({
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
  } catch (activityStartError) {
    try {
      await releaseActivityRecommendation(recommendationId);
    } catch (releaseError) {
      console.error(
        "Unable to release the activity recommendation after start failure:",
        releaseError,
      );
    }

    throw activityStartError;
  }

  let completedRecommendation;

  try {
    completedRecommendation = await markActivityRecommendationStarted(
      recommendationId,
      activitySession.session.id,
    );
  } catch (recommendationError) {
    const refreshedRecommendation = await getActivityRecommendation({
      recommendationId,
      learningSessionId,
      centerId,
      learnerId,
    });

    if (
      refreshedRecommendation.status === "started" &&
      refreshedRecommendation.activity_session_id ===
        activitySession.session.id
    ) {
      completedRecommendation = refreshedRecommendation;
    } else {
      const { error: cleanupError } = await supabase
        .from("learner_activity_sessions")
        .delete()
        .eq("id", activitySession.session.id)
        .eq("status", "in_progress");

      if (
        activitySession.assignment?.status === "pending" &&
        selection.assignmentId
      ) {
        await supabase
          .from("learner_activity_assignments")
          .update({
            status: "pending",
            started_at: null,
          })
          .eq("id", selection.assignmentId)
          .eq("center_id", centerId)
          .eq("learner_id", learnerId)
          .eq("status", "in_progress");
      }

      await releaseActivityRecommendation(recommendationId);

      if (cleanupError) {
        throw new Error(
          "The activity started but could not be linked to its recommendation. Manual session recovery is required.",
        );
      }

      throw recommendationError;
    }
  }

  return {
    started:
      true,

    learningSession,

    selection,

    recommendation:
      completedRecommendation,

    activitySession,

    message:
      "Recommended activity session started successfully.",
  };
}
