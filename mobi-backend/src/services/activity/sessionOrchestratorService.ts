/* =========================================================
   SESSION ORCHESTRATOR SERVICE

   PURPOSE:

   Coordinate the broader learner session flow.

   This service does NOT:
   - perform speech recognition
   - perform phonetic matching
   - calculate Thompson Sampling itself
   - generate clinical conclusions

   It coordinates the services that already handle those
   responsibilities.

   IMPORTANT MOBI RULES:

   1. Therapist/parent chooses the FIRST activity.

   2. After an activity ends, MOBI may recommend the NEXT
      activity.

   3. Assigned activities remain higher priority when
      appropriate.

   4. The user may always stop the session.

   5. Guided off-screen / "Do It" activities must not treat
      expected gaze-away as automatic disengagement.

   6. Communication attempts matter even when pronunciation
      is incomplete or approximate.
========================================================= */

/* =========================================================
   ORCHESTRATOR STATES
========================================================= */

export type LearningSessionOrchestratorState =
  | "idle"
  | "activity_ready"
  | "activity_running"
  | "waiting_for_response"
  | "waiting_for_offscreen_action"
  | "evaluating_response"
  | "adaptive_support"
  | "activity_completed"
  | "next_activity_ready"
  | "break_recommended"
  | "stopping"
  | "completed"
  | "stopped"
  | "auto_stopped"
  | "interrupted";

/* =========================================================
   ACTIVITY DELIVERY CONTEXT
========================================================= */

export type OrchestratorDeliveryMode =
  | "screen"
  | "guided_off_screen"
  | "mixed";

/* =========================================================
   ADAPTIVE SUPPORT ACTIONS
========================================================= */

export type AdaptiveSupportAction =
  | "continue"
  | "repeat_prompt"
  | "give_hint"
  | "one_more_try"
  | "reduce_prompt_demand"
  | "suggest_break"
  | "recommend_next_activity"
  | "allow_skip"
  | "end_session";

/* =========================================================
   COMMUNICATION EVIDENCE

   This is intentionally broader than correct/incorrect.

   Example:

   Expected:
   "ball"

   Learner says:
   "ba"

   That can still be a meaningful communication attempt.
========================================================= */

export interface CommunicationEvidence {
  communicationAttempt:
    boolean;

  targetAchieved:
    boolean;

  accepted:
    boolean;

    approximationDetected:
    boolean;

  transcript:
    string | null;

  normalizedTranscript:
    string | null;

  matchingMethod:
    string | null;

  matchedAnswer:
    string | null;

  confidence:
    number | null;
}

/* =========================================================
   ENGAGEMENT EVIDENCE
========================================================= */

export interface SessionEngagementEvidence {
  gazeDetectionAvailable:
    boolean;

  gazePresent:
    boolean | null;

  gazeAwaySeconds:
    number;

  inactivitySeconds:
    number;

  responseTimeMs:
    number | null;
}

/* =========================================================
   ACTIVITY CONTEXT
========================================================= */

export interface OrchestratorActivityContext {
  activityId:
    string;

  activityTitle:
    string | null;

  deliveryMode:
    OrchestratorDeliveryMode;

  allowSkip:
    boolean;

  maxAttempts:
    number;

  estimatedMinutes:
    number | null;

  /*
    The broader Speech Ladder stays separate from
    activity difficulty.
  */
  speechLadderLevel:
    string | null;

  /*
    We will add proper activity difficulty metadata later.
  */
  difficultyLevel:
    string | null;
}

/* =========================================================
   SESSION CONTEXT
========================================================= */

export interface SessionOrchestratorContext {
  learningSessionId:
    string;

  learnerId:
    string;

  centerId:
    string;

  state:
    LearningSessionOrchestratorState;

  currentActivity:
    OrchestratorActivityContext | null;

  currentAttemptNumber:
    number;

  totalActivitiesStarted:
    number;

  totalActivitiesCompleted:
    number;

  totalActivitiesSkipped:
    number;

  totalBreaks:
    number;
}

/* =========================================================
   ADAPTIVE DECISION RESULT
========================================================= */

export interface AdaptiveSupportDecision {
  nextState:
    LearningSessionOrchestratorState;

  action:
    AdaptiveSupportAction;

  reason:
    string;

  /*
    MOBI may recommend support, but the parent/therapist
    remains able to stop or skip when allowed.
  */
  requiresAdultConfirmation:
    boolean;

  /*
    Useful later for audit logs and reports.
  */
  evidence: {
    communication:
      CommunicationEvidence | null;

    engagement:
      SessionEngagementEvidence | null;
  };
}


/* =========================================================
   ACTIVITY RESPONSE
========================================================= */

export interface ActivityResponseInput {
  communication:
    CommunicationEvidence;

  engagement:
    SessionEngagementEvidence;

  reachedMaximumAttempts:
    boolean;

  activityCompleted:
    boolean;

  therapistRequestedStop:
    boolean;

  parentRequestedStop:
    boolean;

  /*
    Learner-specific adaptive settings.

    These should come from the snapshot stored when the
    broader learning session started.
  */
  adaptiveSettings: {
    inactivityBreakSeconds:
      number;

    inactivityAutoStopSeconds:
      number;

    oneMoreTryEnabled:
      boolean;

    allowBreakSuggestion:
      boolean;
  };
}


/* =========================================================
   INITIAL SESSION CONTEXT
========================================================= */

export function createInitialSessionContext(
  input: {
    learningSessionId:
      string;

    learnerId:
      string;

    centerId:
      string;
  },
): SessionOrchestratorContext {

  return {
    learningSessionId:
      input.learningSessionId,

    learnerId:
      input.learnerId,

    centerId:
      input.centerId,

    state:
      "idle",

    currentActivity:
      null,

    currentAttemptNumber:
      0,

    totalActivitiesStarted:
      0,

    totalActivitiesCompleted:
      0,

    totalActivitiesSkipped:
      0,

    totalBreaks:
      0,
  };
}

/* =========================================================
   DETERMINE WAITING STATE FROM ACTIVITY TYPE

   This is where "Do It" becomes context-aware.

   Screen activity:
     wait for screen/speech response

   Guided off-screen:
     wait for off-screen action

   Mixed:
     may still begin with normal response state and later
     switch based on the step type.
========================================================= */

export function getActivityWaitingState(
  deliveryMode:
    OrchestratorDeliveryMode,
): LearningSessionOrchestratorState {

  if (
    deliveryMode ===
    "guided_off_screen"
  ) {
    return "waiting_for_offscreen_action";
  }

  return "waiting_for_response";
}


/* =========================================================
   BEGIN ACTIVITY
========================================================= */

export function beginActivity(
  context: SessionOrchestratorContext,
  activity: OrchestratorActivityContext,
): SessionOrchestratorContext {

  return {
    ...context,

    state:
      "activity_running",

    currentActivity:
      activity,

    currentAttemptNumber:
      0,

    totalActivitiesStarted:
      context.totalActivitiesStarted + 1,
  };
}


/* =========================================================
   WAIT FOR LEARNER
========================================================= */

export function waitForLearnerResponse(
  context: SessionOrchestratorContext,
): SessionOrchestratorContext {

  if (!context.currentActivity) {
    return context;
  }

  return {
    ...context,

    state:
      getActivityWaitingState(
        context.currentActivity.deliveryMode,
      ),
  };
}





/* =========================================================
   DECIDE NEXT ADAPTIVE ACTION
========================================================= */

/* =========================================================
   DECIDE NEXT ADAPTIVE ACTION
========================================================= */

export function decideAdaptiveAction(
  context: SessionOrchestratorContext,
  input: ActivityResponseInput,
): AdaptiveSupportDecision {

  const currentActivity =
    context.currentActivity;

  const isGuidedOffScreen =
    currentActivity
      ?.deliveryMode ===
    "guided_off_screen";

  /* =======================================================
     1. ADULT STOP ALWAYS HAS HIGHEST PRIORITY
  ======================================================= */

  if (
    input.parentRequestedStop ||
    input.therapistRequestedStop
  ) {
    return {
      nextState:
        "stopping",

      action:
        "end_session",

      reason:
        "Adult requested to end the learning session.",

      requiresAdultConfirmation:
        false,

      evidence: {
        communication:
          input.communication,

        engagement:
          input.engagement,
      },
    };
  }

  /* =======================================================
     2. AUTO STOP AFTER PROLONGED INACTIVITY

     This uses the learner-specific setting.

     For guided off-screen activities, expected gaze-away
     alone must NOT trigger this rule. We rely on actual
     inactivity instead.
  ======================================================= */

  if (
    input.engagement.inactivitySeconds >=
    input.adaptiveSettings
      .inactivityAutoStopSeconds
  ) {
    return {
      nextState:
        "auto_stopped",

      action:
        "end_session",

      reason:
        "Learner-specific inactivity limit was reached.",

      requiresAdultConfirmation:
        false,

      evidence: {
        communication:
          input.communication,

        engagement:
          input.engagement,
      },
    };
  }

  /* =======================================================
     3. ACTIVITY COMPLETED
  ======================================================= */

  if (
    input.activityCompleted
  ) {
    return {
      nextState:
        "next_activity_ready",

      action:
        "recommend_next_activity",

      reason:
        "Current activity completed. MOBI can recommend the next activity.",

      requiresAdultConfirmation:
        true,

      evidence: {
        communication:
          input.communication,

        engagement:
          input.engagement,
      },
    };
  }

  /* =======================================================
     4. MAXIMUM ATTEMPTS REACHED

     Communication attempts still count positively in reports,
     but therapist-configured limits must still be respected.
  ======================================================= */

  if (
    input.reachedMaximumAttempts
  ) {
    return {
      nextState:
        "adaptive_support",

      action:
        currentActivity?.allowSkip
          ? "allow_skip"
          : "recommend_next_activity",

      reason:
        input.communication
          .communicationAttempt
          ? "Maximum attempts reached after meaningful communication attempts. Do not treat the learner's approximations as failure; move forward according to the activity settings."
          : "Maximum attempts reached without sufficient response. Move forward according to the activity settings.",

      requiresAdultConfirmation:
        true,

      evidence: {
        communication:
          input.communication,

        engagement:
          input.engagement,
      },
    };
  }

  /* =======================================================
     5. BREAK SUGGESTION

     For Do It / guided off-screen activities, gaze-away is
     expected, so this rule is based on actual inactivity.

     Screen activities may later use gaze + inactivity
     together in a richer engagement service.
  ======================================================= */

  if (
    input.adaptiveSettings
      .allowBreakSuggestion &&
    input.engagement.inactivitySeconds >=
      input.adaptiveSettings
        .inactivityBreakSeconds
  ) {
    return {
      nextState:
        "break_recommended",

      action:
        "suggest_break",

      reason:
        isGuidedOffScreen
          ? "Extended inactivity was detected during the guided off-screen activity."
          : "Extended inactivity was detected during the activity.",

      requiresAdultConfirmation:
        true,

      evidence: {
        communication:
          input.communication,

        engagement:
          input.engagement,
      },
    };
  }

  /* =======================================================
     6. TARGET ACHIEVED
  ======================================================= */

  if (
    input.communication.targetAchieved
  ) {
    return {
      nextState:
        getActivityWaitingState(
          currentActivity
            ?.deliveryMode ??
          "screen",
        ),

      action:
        "continue",

      reason:
        "Target response achieved.",

      requiresAdultConfirmation:
        false,

      evidence: {
        communication:
          input.communication,

        engagement:
          input.engagement,
      },
    };
  }

  
/* =======================================================
   7. TARGET-RELATED SPEECH APPROXIMATION

   Example:

     target = "ball"
     learner = "ba"

   The learner attempted a recognizable approximation of
   the target.

   This should be acknowledged positively without treating
   it as identical to exact target achievement.
======================================================= */

if (
  input.communication
    .communicationAttempt &&
  input.communication
    .approximationDetected
) {
  return {
    nextState:
      "adaptive_support",

    action:
      input.adaptiveSettings
        .oneMoreTryEnabled
        ? "one_more_try"
        : "continue",

    reason:
      "Target-related speech approximation detected. The communication attempt is acknowledged without requiring perfect pronunciation.",

    requiresAdultConfirmation:
      false,

    evidence: {
      communication:
        input.communication,

      engagement:
        input.engagement,
    },
  };
}

/* =======================================================
   8. OTHER COMMUNICATION ATTEMPT

   Example:

     target = "ball"
     learner = "cat"

   The learner DID communicate, so this should never be
   treated as silence or absence of communication.

   However, the response was not recognized as the current
   target or as an approximation of that target.
======================================================= */

if (
  input.communication.communicationAttempt
) {
  return {
    nextState:
      "adaptive_support",

    action:
      input.adaptiveSettings
        .oneMoreTryEnabled
        ? "one_more_try"
        : "continue",

    reason:
      "Communication attempt detected, but the response was not recognized as the current target. Provide another supportive opportunity.",

    requiresAdultConfirmation:
      false,

    evidence: {
      communication:
        input.communication,

      engagement:
        input.engagement,
    },
  };
}

  /* =======================================================
     9. NO COMMUNICATION ATTEMPT YET
  ======================================================= */

  if (
    input.adaptiveSettings
      .oneMoreTryEnabled
  ) {
    return {
      nextState:
        "adaptive_support",

      action:
        "one_more_try",

      reason:
        "No communication attempt detected yet. Provide another structured opportunity.",

      requiresAdultConfirmation:
        false,

      evidence: {
        communication:
          input.communication,

        engagement:
          input.engagement,
      },
    };
  }

  return {
    nextState:
      getActivityWaitingState(
        currentActivity
          ?.deliveryMode ??
        "screen",
      ),

    action:
      "continue",

    reason:
      "Continue the activity using the learner's configured support settings.",

    requiresAdultConfirmation:
      false,

    evidence: {
      communication:
        input.communication,

      engagement:
        input.engagement,
    },
  };
}