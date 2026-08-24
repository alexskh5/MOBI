// mobi-backend/src/services/activity/activityRuntimeService.ts

import {
  decideAdaptiveAction,
  type ActivityResponseInput,
  type AdaptiveSupportDecision,
  type SessionEngagementEvidence,
  type SessionOrchestratorContext,
} from "./sessionOrchestratorService";

import {
  evaluateCommunication,
} from "../speech/communicationEvaluationService";

/* =========================================================
   TYPES
========================================================= */

export interface ProcessLearnerResponseInput {
  /*
    Speech information coming from the learner response.
  */
  transcript:
    string;

  expectedAnswers:
    string[];

  /*
    Therapist-defined alternatives that MOBI may also
    accept.

    Later, AI may suggest these while the therapist creates
    the activity, but the therapist remains responsible for
    approving them.
  */
  acceptedVariations:
    string[];

  /*
    Engagement evidence collected during this response.
  */
  engagement:
    SessionEngagementEvidence;

  /*
    Activity/session state.
  */
  reachedMaximumAttempts:
    boolean;

  activityCompleted:
    boolean;

  therapistRequestedStop:
    boolean;

  parentRequestedStop:
    boolean;

  /*
    These values should eventually come from the
    learning-session snapshot of the learner's adaptive
    settings.
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

export interface ActivityRuntimeResult {
  decision:
    AdaptiveSupportDecision;

  updatedContext:
    SessionOrchestratorContext;

  /*
    Return the actual communication evidence too.

    This will later be saved into learner_activity_attempts
    and used by progress reports.
  */
  communication:
    ReturnType<
      typeof evaluateCommunication
    >;
}

/* =========================================================
   PROCESS ONE LEARNER RESPONSE

   One runtime cycle:

   transcript
        ↓
   communication evaluation
        ↓
   communication evidence
        ↓
   adaptive decision
        ↓
   updated session state
========================================================= */

export function processLearnerResponse(
  context:
    SessionOrchestratorContext,

  response:
    ProcessLearnerResponseInput,
): ActivityRuntimeResult {

  /* =======================================================
     1. EVALUATE COMMUNICATION

     Perfect pronunciation is NOT required.

     The existing evaluator may recognize:
     - exact answers
     - therapist-approved variations
     - token/phrase matches
     - Levenshtein similarity
     - phonetic / Soundex matches
  ======================================================= */

  const communication =
    evaluateCommunication({
      transcript:
        response.transcript,

      expectedAnswers:
        response.expectedAnswers,

      acceptedVariations:
        response.acceptedVariations,
    });

  /* =======================================================
     2. BUILD ORCHESTRATOR RESPONSE
  ======================================================= */

  const activityResponse:
    ActivityResponseInput = {

      communication,

      engagement:
        response.engagement,

      reachedMaximumAttempts:
        response.reachedMaximumAttempts,

      activityCompleted:
        response.activityCompleted,

      therapistRequestedStop:
        response.therapistRequestedStop,

      parentRequestedStop:
        response.parentRequestedStop,

      adaptiveSettings:
        response.adaptiveSettings,
    };

  /* =======================================================
     3. ASK SESSION ORCHESTRATOR WHAT SHOULD HAPPEN NEXT
  ======================================================= */

  const decision =
    decideAdaptiveAction(
      context,
      activityResponse,
    );

  /* =======================================================
     4. UPDATE RUNTIME CONTEXT
  ======================================================= */

  const updatedContext:
    SessionOrchestratorContext = {
      ...context,

      state:
        decision.nextState,

      /*
        Count this interaction cycle as another learner
        response opportunity.

        Later, actual per-step attempt counts will continue
        to be stored in learner_activity_attempts.
      */
      currentAttemptNumber:
        context.currentAttemptNumber +
        1,
    };

  /* =======================================================
     5. RETURN EVERYTHING NEEDED BY THE CLIENT / DATABASE
  ======================================================= */

  return {
    communication,

    decision,

    updatedContext,
  };
}