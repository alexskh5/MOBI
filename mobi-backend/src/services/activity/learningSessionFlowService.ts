// mobi-backend/src/services/activity/learningSessionFlowService.ts

import {
  finishActivitySession,
} from "./activitySessionService";

import type {
  FinishActivitySessionInput,
} from "./activitySessionService";

import {
  selectNextActivity,
} from "./activitySelectionService";

import {
  endLearningSession,
} from "./learningSessionService";


export async function continueLearningSession(
  input: FinishActivitySessionInput & {
    learningSessionId: string;
  },
) {

  const {
    learningSessionId,
    ...finishInput
  } = input;

  /* =======================================================
     1. FINISH CURRENT ACTIVITY SESSION
  ======================================================= */

  const finishedActivity =
    await finishActivitySession(
      finishInput,
    );

  /* =======================================================
     2. ONLY RECOMMEND ANOTHER ACTIVITY WHEN THE CURRENT
        ACTIVITY WAS ACTUALLY COMPLETED

     skipped / stopped / interrupted should not
     automatically push the learner into another activity.
  ======================================================= */

  if (
    finishInput.status &&
    finishInput.status !== "completed"
  ) {
    return {
      finishedActivity,

      learningSessionId,

      nextActivity:
        null,

      shouldContinue:
        false,

      requiresAdultConfirmation:
        false,

      reason:
        "The activity session did not end as a normal completion.",
    };
  }

  /* =======================================================
     3. SELECT NEXT RECOMMENDED ACTIVITY
  ======================================================= */

  const nextActivity =
    await selectNextActivity({
      centerId:
        finishInput.centerId,

      learnerId:
        finishInput.learnerId,
    });

  /* =======================================================
     4. NO NEXT ACTIVITY AVAILABLE
  ======================================================= */

  if (!nextActivity) {
    return {
      finishedActivity,

      learningSessionId,

      nextActivity:
        null,

      shouldContinue:
        false,

      requiresAdultConfirmation:
        false,

      reason:
        "No eligible next activity is currently available.",
    };
  }

  /* =======================================================
     5. RETURN RECOMMENDATION

     IMPORTANT:
     We do NOT start the activity here.

     The parent/therapist must confirm Continue first.

     startNextActivityInLearningSession() already handles
     starting the selected/adaptive activity afterward.
  ======================================================= */

  return {
    finishedActivity,

    learningSessionId,

    nextActivity,

    shouldContinue:
      true,

    requiresAdultConfirmation:
      true,

    reason:
      "A next activity recommendation is available.",
  };
}