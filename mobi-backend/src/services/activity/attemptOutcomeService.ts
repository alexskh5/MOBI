// mobi-backend/src/services/activity/attemptOutcomeService.ts

import type {
  CommunicationEvidence,
} from "./sessionOrchestratorService";

/* =========================================================
   ATTEMPT OUTCOME

   This is the standardized interpretation of what happened
   during one learner response.

   IMPORTANT:

   An attempt outcome is NOT the same thing as a clinical
   conclusion.

   It only describes the evidence observed during the
   current activity response.
========================================================= */

export type AttemptOutcome =
  | "target_achieved"
  | "target_approximation"
  | "other_communication"
  | "no_communication"
  | "not_evaluable";

/* =========================================================
   INPUT
========================================================= */

export interface DetermineAttemptOutcomeInput {
  communication:
    CommunicationEvidence;

  /*
    Some activity steps do not have a defined correct
    speech target.

    Example:
    - open conversation
    - some social-readiness prompts
    - guided actions

    Those responses should not automatically become
    incorrect simply because expectedAnswers is empty.
  */
  hasDefinedTarget:
    boolean;
}

/* =========================================================
   DETERMINE ATTEMPT OUTCOME
========================================================= */

export function determineAttemptOutcome(
  input: DetermineAttemptOutcomeInput,
): AttemptOutcome {

  const {
    communication,
    hasDefinedTarget,
  } = input;

  /* =======================================================
     1. NO COMMUNICATION
  ======================================================= */

  if (
    !communication.communicationAttempt
  ) {
    return "no_communication";
  }

  /* =======================================================
     2. STEP HAS NO DEFINED TARGET

     The learner communicated, but there is no predefined
     target against which the response should be marked
     correct or incorrect.

     This is important for open-ended social communication.
  ======================================================= */

  if (!hasDefinedTarget) {
    return "not_evaluable";
  }

  /* =======================================================
     3. TARGET ACHIEVED
  ======================================================= */

  if (
    communication.targetAchieved
  ) {
    return "target_achieved";
  }

  /* =======================================================
     4. TARGET-RELATED APPROXIMATION

     Example:

     Target:
       "ball"

     Learner:
       "ba"

     This remains meaningful communication evidence without
     falsely recording full target achievement.
  ======================================================= */

  if (
    communication.approximationDetected
  ) {
    return "target_approximation";
  }

  /* =======================================================
     5. OTHER COMMUNICATION

     Example:

     Target:
       "ball"

     Learner:
       "cat"

     The learner clearly communicated, but the response was
     neither the target nor a recognized approximation.
  ======================================================= */

  return "other_communication";
}