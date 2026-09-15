// mobi-backend/src/services/activity/learningSessionFlowService.ts

import { supabase } from "../../config/supabase";

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
  savePendingActivityRecommendation,
} from "./activityRecommendationService";


export async function continueLearningSession(
  input: FinishActivitySessionInput & {
    learningSessionId: string;
  },
) {

  const {
    learningSessionId,
    ...finishInput
  } = input;

  const {
    data: sessionLink,
    error: sessionLinkError,
  } = await supabase
    .from("learner_activity_sessions")
    .select(`
      id,
      learning_session_id,
      learning_session:learner_learning_sessions!inner(
        id,
        status
      )
    `)
    .eq("id", finishInput.sessionId)
    .eq("learning_session_id", learningSessionId)
    .eq("center_id", finishInput.centerId)
    .eq("learner_id", finishInput.learnerId)
    .eq("learning_session.status", "in_progress")
    .maybeSingle();

  if (sessionLinkError) {
    throw sessionLinkError;
  }

  if (!sessionLink) {
    throw new Error(
      "The activity session does not belong to this active learning session.",
    );
  }

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

  const recommendation =
    await savePendingActivityRecommendation({
      learningSessionId,
      centerId: finishInput.centerId,
      learnerId: finishInput.learnerId,
      selection: nextActivity,
    });
  const breakRecommended =
    nextActivity.selectionReason.breakRecommended === true;

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

    recommendation: {
      id: recommendation.id,
      activityId: recommendation.activity_id,
      expiresAt: recommendation.expires_at,
    },

    shouldContinue:
      true,

    breakRecommended,

    requiresAdultConfirmation:
      true,

    reason:
      breakRecommended
        ? "A break is recommended before the next activity. The adult may continue when the learner is ready."
        : "A next activity recommendation is available.",
  };
}
