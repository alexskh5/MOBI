// mobi-backend/src/controllers/activitySessionController.ts

import type {
  Request,
  Response,
} from "express";



import {
  finishActivitySession,
  getActivitySessionById,
  saveActivityAttempt,
  startActivitySession,
} from "../services/activity/activitySessionService";

import type {
  ActivitySessionSource,
  ActivitySessionStatus,
  AttemptResponseType,
  FeedbackType,
  MatchingMethod,
  RecommendedNextAction,
} from "../services/activity/activitySessionService";

import {
  selectNextActivity,
} from "../services/activity/activitySelectionService";

import {
  recordBanditSelection,
} from "../services/activity/thompsonSamplingService";

import {
  evaluateLearnerProgression,
} from "../services/activity/progressionService";

import {
  processLearnerResponse,
} from "../services/activity/activityRuntimeService";

import type {
  SessionOrchestratorContext,
} from "../services/activity/sessionOrchestratorService";
// import {
//   getOrCreateBanditState,
//   sampleThompsonScore,
//   updateBanditOutcome,
// } from "../services/activity/thompsonSamplingService";

/* =========================================================
   TEMPORARY CENTER ID

   Later, this must come from the authenticated Center,
   Therapist, Parent, or mobile user session.
========================================================= */

const CENTER_ID =
  "d5ae1649-0343-46d4-b433-575c97e064e1";

/* =========================================================
   SMALL HELPERS
========================================================= */

/*
  Express route parameters may be typed as string | string[].

  Our routes expect only one value, so this helper safely
  returns a string or null.
*/
function getRouteParam(
  value: string | string[] | undefined,
) {
  if (
    !value ||
    Array.isArray(value)
  ) {
    return null;
  }

  const trimmedValue =
    value.trim();

  return trimmedValue ||
    null;
}

/*
  Supabase errors are not always instances of Error.

  This helper gives the frontend a useful message for both
  JavaScript errors and Supabase error objects.
*/
function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (
      error as {
        message?: unknown;
      }
    ).message === "string"
  ) {
    return (
      error as {
        message: string;
      }
    ).message;
  }

  return "Unknown activity session error.";
}

/* =========================================================
   START ACTIVITY SESSION
========================================================= */

/*
  POST /api/activity-sessions/start

  Example body:

  {
    "learnerId": "LEARNER_UUID",
    "activityId": "ACTIVITY_UUID",
    "assignmentId": "ASSIGNMENT_UUID"
  }

  assignmentId is optional for manually opened or future
  adaptively selected activities.
*/
export async function startSession(
  req: Request,
  res: Response,
) {
  try {
    const {
      learnerId,
      activityId,
      assignmentId,
      sessionSource,
      selectionAlgorithm,
      selectionReason,
    } = req.body;

    /* =====================================================
       1. VALIDATE REQUIRED IDENTIFIERS
    ===================================================== */

    if (
      typeof learnerId !==
        "string" ||
      !learnerId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    if (
      typeof activityId !==
        "string" ||
      !activityId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid activity ID is required.",
      });
    }

    /* =====================================================
       2. VALIDATE OPTIONAL SESSION SOURCE
    ===================================================== */

    const allowedSessionSources:
      ActivitySessionSource[] = [
        "assigned_required",
        "assigned_recommended",
        "adaptive",
        "manual",
      ];

    let normalizedSessionSource:
      ActivitySessionSource =
        "manual";

    if (
      sessionSource !== undefined
    ) {
      if (
        typeof sessionSource !==
          "string" ||
        !allowedSessionSources.includes(
          sessionSource as ActivitySessionSource,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid activity session source.",
        });
      }

      normalizedSessionSource =
        sessionSource as ActivitySessionSource;
    }

    /* =====================================================
       3. START SESSION
    ===================================================== */

    const result =
      await startActivitySession({
        centerId:
          CENTER_ID,

        learnerId:
          learnerId.trim(),

        activityId:
          activityId.trim(),

        assignmentId:
          typeof assignmentId ===
            "string" &&
          assignmentId.trim()
            ? assignmentId.trim()
            : null,

        sessionSource:
          normalizedSessionSource,

        selectionAlgorithm:
          typeof selectionAlgorithm ===
            "string" &&
          selectionAlgorithm.trim()
            ? selectionAlgorithm.trim()
            : null,

        selectionReason:
          typeof selectionReason ===
            "object" &&
          selectionReason !== null &&
          !Array.isArray(
            selectionReason,
          )
            ? selectionReason
            : {},
      });

    return res.status(201).json({
      success: true,
      message:
        "Activity session started successfully.",
      ...result,
    });
  } catch (error) {
    console.error(
      "Start activity session error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to start the activity session.",
      error:
        getErrorMessage(error),
    });
  }
}

/* =========================================================
   SAVE ONE ACTIVITY ATTEMPT
========================================================= */

/*
  POST /api/activity-sessions/:sessionId/attempts

  This endpoint will eventually be called by the mobile app
  after each learner response.

  Example speech attempt:

  {
    "activityStepId": "STEP_UUID",
    "attemptOrder": 1,
    "stepAttemptNumber": 1,
    "responseType": "speech",
    "expectedAnswers": ["cow"],
    "acceptedVariations": ["caw"],
    "transcript": "cow",
    "normalizedTranscript": "cow",
    "matchingMethod": "exact_match",
    "matchedAnswer": "cow",
    "communicationAttempt": true,
    "shouldScore": true,
    "accepted": true,
    "isCorrect": true,
    "responseTimeMs": 3200,
    "feedbackType": "correct",
    "feedbackText": "Very good!"
  }
*/
export async function saveAttempt(
  req: Request,
  res: Response,
) {
  try {
    const sessionId =
      getRouteParam(
        req.params.sessionId,
      );

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message:
          "A valid activity session ID is required.",
      });
    }

    const {
      activityStepId,

      attemptOrder,
      stepAttemptNumber,

      responseType,

      expectedAnswers,
      acceptedVariations,

      expectedChoiceId,
      selectedChoiceId,

      transcript,
      normalizedTranscript,

      sttConfidence,
      sttProvider,
      sttModel,
      sttMetadata,

      matchingMethod,
      matchedAnswer,

      levenshteinDistance,
      phoneticMatch,
      semanticMatch,

      minimumConfidenceUsed,
      levenshteinThresholdUsed,

      phoneticMatchingEnabled,
      semanticMatchingEnabled,
      acceptedVariationsEnabled,

      evaluationSettings,

      communicationAttempt,

        approximationDetected,

        targetAchieved,

        shouldScore,
        accepted,
        isCorrect,

      score,

      responseTimeMs,

      hintUsed,
      repeatPromptUsed,
      oneMoreTryUsed,

      wasSkipped,
      skipReason,

      gazePresentAtResponse,
      inactivityBeforeResponseSeconds,

      engagementData,

      feedbackType,
      feedbackText,
      feedbackAudioGenerated,
    } = req.body;

    /* =====================================================
       1. VALIDATE ATTEMPT ORDER
    ===================================================== */

    if (
      typeof attemptOrder !==
        "number" ||
      !Number.isInteger(
        attemptOrder,
      ) ||
      attemptOrder < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt order must be a positive integer.",
      });
    }

    if (
      stepAttemptNumber !==
        undefined &&
      (
        typeof stepAttemptNumber !==
          "number" ||
        !Number.isInteger(
          stepAttemptNumber,
        ) ||
        stepAttemptNumber < 1
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Step attempt number must be a positive integer.",
      });
    }

    /* =====================================================
       2. VALIDATE ENUM VALUES
    ===================================================== */

    const allowedResponseTypes:
      AttemptResponseType[] = [
        "speech",
        "choice",
        "action",
        "conversation",
        "system",
      ];

    if (
      responseType !== undefined &&
      (
        typeof responseType !==
          "string" ||
        !allowedResponseTypes.includes(
          responseType as AttemptResponseType,
        )
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid response type.",
      });
    }

    const allowedMatchingMethods:
      MatchingMethod[] = [
        "exact_match",
        "accepted_variation",
        "phrase_contains",
        "token_match",
        "levenshtein",
        "levenshtein_approximation",
        "phonetic_match",
        "semantic_match",
        "choice_match",
        "action_observed",
        "none",
        "not_evaluated",
      ];

    if (
      matchingMethod !== undefined &&
      matchingMethod !== null &&
      (
        typeof matchingMethod !==
          "string" ||
        !allowedMatchingMethods.includes(
          matchingMethod as MatchingMethod,
        )
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid matching method.",
      });
    }

    const allowedFeedbackTypes:
      FeedbackType[] = [
        "correct",
        "incorrect",
        "encouragement",
        "hint",
        "max_attempts",
        "skip",
        "break",
        "none",
      ];

    if (
      feedbackType !== undefined &&
      feedbackType !== null &&
      (
        typeof feedbackType !==
          "string" ||
        !allowedFeedbackTypes.includes(
          feedbackType as FeedbackType,
        )
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid feedback type.",
      });
    }

    /* =====================================================
       3. VALIDATE SCORING COMBINATION
    ===================================================== */

    if (
      shouldScore === true &&
      typeof isCorrect !==
        "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A scored attempt must include isCorrect as true or false.",
      });
    }

    if (
      wasSkipped === true &&
      isCorrect === true
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A skipped attempt cannot be marked correct.",
      });
    }

    /* =====================================================
       4. SAVE ATTEMPT
    ===================================================== */

    const attempt =
      await saveActivityAttempt({
        sessionId,

        activityStepId:
          typeof activityStepId ===
            "string" &&
          activityStepId.trim()
            ? activityStepId.trim()
            : null,

        attemptOrder,

        stepAttemptNumber:
          typeof stepAttemptNumber ===
            "number"
            ? stepAttemptNumber
            : 1,

        responseType:
          responseType as
            | AttemptResponseType
            | undefined,

        expectedAnswers:
          Array.isArray(
            expectedAnswers,
          )
            ? expectedAnswers.filter(
                (
                  value,
                ): value is string =>
                  typeof value ===
                  "string",
              )
            : [],

        acceptedVariations:
          Array.isArray(
            acceptedVariations,
          )
            ? acceptedVariations.filter(
                (
                  value,
                ): value is string =>
                  typeof value ===
                  "string",
              )
            : [],

        expectedChoiceId:
          typeof expectedChoiceId ===
            "string"
            ? expectedChoiceId
            : null,

        selectedChoiceId:
          typeof selectedChoiceId ===
            "string"
            ? selectedChoiceId
            : null,

        transcript:
          typeof transcript ===
            "string"
            ? transcript
            : null,

        normalizedTranscript:
          typeof normalizedTranscript ===
            "string"
            ? normalizedTranscript
            : null,

        sttConfidence:
          typeof sttConfidence ===
            "number"
            ? sttConfidence
            : null,

        sttProvider:
          typeof sttProvider ===
            "string"
            ? sttProvider
            : null,

        sttModel:
          typeof sttModel ===
            "string"
            ? sttModel
            : null,

        sttMetadata:
          typeof sttMetadata ===
            "object" &&
          sttMetadata !== null &&
          !Array.isArray(
            sttMetadata,
          )
            ? sttMetadata
            : {},

        matchingMethod:
          matchingMethod === null
            ? null
            : matchingMethod as
                | MatchingMethod
                | undefined,

        matchedAnswer:
          typeof matchedAnswer ===
            "string"
            ? matchedAnswer
            : null,

        levenshteinDistance:
          typeof levenshteinDistance ===
            "number"
            ? levenshteinDistance
            : null,

        phoneticMatch:
          typeof phoneticMatch ===
            "boolean"
            ? phoneticMatch
            : null,

        semanticMatch:
          typeof semanticMatch ===
            "boolean"
            ? semanticMatch
            : null,

        minimumConfidenceUsed:
          typeof minimumConfidenceUsed ===
            "number"
            ? minimumConfidenceUsed
            : null,

        levenshteinThresholdUsed:
          typeof levenshteinThresholdUsed ===
            "number"
            ? levenshteinThresholdUsed
            : null,

        phoneticMatchingEnabled:
          typeof phoneticMatchingEnabled ===
            "boolean"
            ? phoneticMatchingEnabled
            : null,

        semanticMatchingEnabled:
          typeof semanticMatchingEnabled ===
            "boolean"
            ? semanticMatchingEnabled
            : null,

        acceptedVariationsEnabled:
          typeof acceptedVariationsEnabled ===
            "boolean"
            ? acceptedVariationsEnabled
            : null,

        evaluationSettings:
          typeof evaluationSettings ===
            "object" &&
          evaluationSettings !== null &&
          !Array.isArray(
            evaluationSettings,
          )
            ? evaluationSettings
            : {},

        communicationAttempt:
          typeof communicationAttempt ===
            "boolean"
            ? communicationAttempt
            : false,
        
        approximationDetected:
            typeof approximationDetected ===
                "boolean"
                ? approximationDetected
                : false,

        targetAchieved:
            typeof targetAchieved ===
                "boolean"
                ? targetAchieved
                : false,

        shouldScore:
          typeof shouldScore ===
            "boolean"
            ? shouldScore
            : false,

        accepted:
          typeof accepted ===
            "boolean"
            ? accepted
            : false,

        isCorrect:
          typeof isCorrect ===
            "boolean"
            ? isCorrect
            : null,

        score:
          typeof score ===
            "number"
            ? score
            : null,

        responseTimeMs:
          typeof responseTimeMs ===
            "number"
            ? responseTimeMs
            : null,

        hintUsed:
          typeof hintUsed ===
            "boolean"
            ? hintUsed
            : false,

        repeatPromptUsed:
          typeof repeatPromptUsed ===
            "boolean"
            ? repeatPromptUsed
            : false,

        oneMoreTryUsed:
          typeof oneMoreTryUsed ===
            "boolean"
            ? oneMoreTryUsed
            : false,

        wasSkipped:
          typeof wasSkipped ===
            "boolean"
            ? wasSkipped
            : false,

        skipReason:
          typeof skipReason ===
            "string"
            ? skipReason
            : null,

        gazePresentAtResponse:
          typeof gazePresentAtResponse ===
            "boolean"
            ? gazePresentAtResponse
            : null,

        inactivityBeforeResponseSeconds:
          typeof inactivityBeforeResponseSeconds ===
            "number"
            ? inactivityBeforeResponseSeconds
            : null,

        engagementData:
          typeof engagementData ===
            "object" &&
          engagementData !== null &&
          !Array.isArray(
            engagementData,
          )
            ? engagementData
            : {},

        feedbackType:
          feedbackType === null
            ? null
            : feedbackType as
                | FeedbackType
                | undefined,

        feedbackText:
          typeof feedbackText ===
            "string"
            ? feedbackText
            : null,

        feedbackAudioGenerated:
          typeof feedbackAudioGenerated ===
            "boolean"
            ? feedbackAudioGenerated
            : false,
      });

    return res.status(201).json({
      success: true,
      message:
        "Learner activity attempt saved successfully.",
      attempt,
    });
  } catch (error) {
    console.error(
      "Save activity attempt error:",
      error,
    );

    /*
      A duplicate attempt_order usually means the mobile app
      retried an already-saved request.

      We will add request idempotency later. For now, the
      database unique constraint prevents duplicate rows.
    */
    return res.status(500).json({
      success: false,
      message:
        "Unable to save the learner activity attempt.",
      error:
        getErrorMessage(error),
    });
  }
}

/* =========================================================
   FINISH ACTIVITY SESSION
========================================================= */

/*
  POST /api/activity-sessions/:sessionId/finish

  Example body:

  {
    "learnerId": "LEARNER_UUID",
    "status": "completed",
    "totalDurationSeconds": 245,
    "inactivitySeconds": 12,
    "breakCount": 1
  }
*/
export async function finishSession(
  req: Request,
  res: Response,
) {
  try {
    const sessionId =
      getRouteParam(
        req.params.sessionId,
      );

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message:
          "A valid activity session ID is required.",
      });
    }

    const {
      learnerId,
      status,

      totalDurationSeconds,
      inactivitySeconds,

      gazePresentSeconds,
      gazeAwaySeconds,
      gazeDetectionAvailable,

      breakCount,
      breakSuggested,

      engagementOverrideTriggered,
      engagementOverrideReason,

      skippedBy,
      skipReason,

      stoppedBy,
      stopReason,

      recommendedNextAction,

      therapistSessionNotes,
    } = req.body;

    if (
      typeof learnerId !==
        "string" ||
      !learnerId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    const allowedFinishStatuses:
      Exclude<
        ActivitySessionStatus,
        "in_progress"
      >[] = [
        "completed",
        "skipped",
        "stopped",
        "interrupted",
      ];

    let normalizedStatus:
      Exclude<
        ActivitySessionStatus,
        "in_progress"
      > =
        "completed";

    if (status !== undefined) {
      if (
        typeof status !==
          "string" ||
        !allowedFinishStatuses.includes(
          status as Exclude<
            ActivitySessionStatus,
            "in_progress"
          >,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid activity session completion status.",
        });
      }

      normalizedStatus =
        status as Exclude<
          ActivitySessionStatus,
          "in_progress"
        >;
    }

    const allowedNextActions:
      RecommendedNextAction[] = [
        "continue_assigned",
        "same_difficulty",
        "increase_difficulty",
        "decrease_difficulty",
        "suggest_break",
        "end_session",
        "therapist_review",
      ];

    if (
      recommendedNextAction !==
        undefined &&
      recommendedNextAction !==
        null &&
      (
        typeof recommendedNextAction !==
          "string" ||
        !allowedNextActions.includes(
          recommendedNextAction as RecommendedNextAction,
        )
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid recommended next action.",
      });
    }

    const result =
      await finishActivitySession({
        centerId:
          CENTER_ID,

        learnerId:
          learnerId.trim(),

        sessionId,

        status:
          normalizedStatus,

        totalDurationSeconds:
          typeof totalDurationSeconds ===
            "number"
            ? totalDurationSeconds
            : 0,

        inactivitySeconds:
          typeof inactivitySeconds ===
            "number"
            ? inactivitySeconds
            : 0,

        gazePresentSeconds:
          typeof gazePresentSeconds ===
            "number"
            ? gazePresentSeconds
            : 0,

        gazeAwaySeconds:
          typeof gazeAwaySeconds ===
            "number"
            ? gazeAwaySeconds
            : 0,

        gazeDetectionAvailable:
          typeof gazeDetectionAvailable ===
            "boolean"
            ? gazeDetectionAvailable
            : false,

        breakCount:
          typeof breakCount ===
            "number"
            ? breakCount
            : 0,

        breakSuggested:
          typeof breakSuggested ===
            "boolean"
            ? breakSuggested
            : false,

        engagementOverrideTriggered:
          typeof engagementOverrideTriggered ===
            "boolean"
            ? engagementOverrideTriggered
            : false,

        engagementOverrideReason:
          typeof engagementOverrideReason ===
            "string"
            ? engagementOverrideReason
            : null,

        skippedBy:
          typeof skippedBy ===
            "string"
            ? skippedBy
            : null,

        skipReason:
          typeof skipReason ===
            "string"
            ? skipReason
            : null,

        stoppedBy:
          typeof stoppedBy ===
            "string"
            ? stoppedBy
            : null,

        stopReason:
          typeof stopReason ===
            "string"
            ? stopReason
            : null,

        recommendedNextAction:
          recommendedNextAction ===
            null
            ? null
            : recommendedNextAction as
                | RecommendedNextAction
                | undefined,

        therapistSessionNotes:
          typeof therapistSessionNotes ===
            "string"
            ? therapistSessionNotes
            : null,
      });

    return res.status(200).json({
      success: true,
      message:
        "Activity session finished successfully.",
      ...result,
    });
  } catch (error) {
    console.error(
      "Finish activity session error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to finish the activity session.",
      error:
        getErrorMessage(error),
    });
  }
}

/* =========================================================
   GET ONE SESSION WITH ATTEMPTS
========================================================= */

/*
  GET
  /api/activity-sessions/:sessionId?learnerId=LEARNER_UUID
*/
export async function getSession(
  req: Request,
  res: Response,
) {
  try {
    const sessionId =
      getRouteParam(
        req.params.sessionId,
      );

    const learnerId =
      typeof req.query.learnerId ===
        "string"
        ? req.query.learnerId.trim()
        : "";

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message:
          "A valid activity session ID is required.",
      });
    }

    if (!learnerId) {
      return res.status(400).json({
        success: false,
        message:
          "Learner ID is required as a query parameter.",
      });
    }

    const session =
      await getActivitySessionById(
        sessionId,
        CENTER_ID,
        learnerId,
      );

    return res.status(200).json({
      success: true,
      activitySession:
        session,
    });
  } catch (error) {
    console.error(
      "Get activity session error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch the activity session.",
      error:
        getErrorMessage(error),
    });
  }
}

/* =========================================================
   GET NEXT ACTIVITY FOR LEARNER
========================================================= */

export async function getNextActivity(
  req: Request,
  res: Response,
) {
  try {
    /*
      learnerId is passed through the query string:

      GET /api/activity-sessions/next?learnerId=UUID
    */
    const learnerIdRaw =
      req.query.learnerId;

    if (
      typeof learnerIdRaw !== "string" ||
      !learnerIdRaw.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Learner ID is required as a query parameter.",
      });
    }

    const learnerId =
      learnerIdRaw.trim();

    /*
      TEMPORARY CENTER ID.

      Later this should come from the authenticated
      Center / Therapist / Parent session.
    */
    const CENTER_ID =
      "d5ae1649-0343-46d4-b433-575c97e064e1";

    const selection =
      await selectNextActivity({
        centerId:
          CENTER_ID,

        learnerId,
      });

    /*
      null is not an error.

      It simply means there is currently no eligible
      activity for this learner.
    */
    if (!selection) {
      return res.status(200).json({
        success: true,
        nextActivity:
          null,

        message:
          "No eligible activity is currently available.",
      });
    }

    return res.status(200).json({
      success: true,

      nextActivity:
        selection,
    });
  } catch (error) {
    console.error(
      "Get next activity error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to select the learner's next activity.",

      error:
        error instanceof Error
          ? error.message
          : "Unknown activity selection error",
    });
  }
}


/* =========================================================
   SELECT AND START NEXT ACTIVITY SESSION
========================================================= */

/*
  POST /api/activity-sessions/start-next

  Example body:

  {
    "learnerId": "LEARNER_UUID"
  }

  The frontend/mobile app does NOT need to know which
  activity should be played.

  The backend will:

  1. select the next activity
  2. prioritize assigned activities
  3. use adaptive fallback when no assignment exists
  4. start the learner activity session
*/
export async function startNextSession(
  req: Request,
  res: Response,
) {
  try {
    const {
      learnerId,
    } = req.body;

    /* =====================================================
       1. VALIDATE LEARNER
    ===================================================== */

    if (
      typeof learnerId !== "string" ||
      !learnerId.trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A valid learner ID is required.",
      });
    }

    const normalizedLearnerId =
      learnerId.trim();

    /* =====================================================
       2. SELECT NEXT ACTIVITY
    ===================================================== */

    const selection =
      await selectNextActivity({
        centerId:
          CENTER_ID,

        learnerId:
          normalizedLearnerId,
      });

    /*
      This is not a server error.

      It simply means there is currently no activity
      available for this learner.
    */
    if (!selection) {
      return res.status(200).json({
        success: true,

        sessionStarted:
          false,

        nextActivity:
          null,

        message:
          "No eligible activity is currently available.",
      });
    }

    /* =====================================================
       3. MAP SELECTION SOURCE TO SESSION SOURCE
    ===================================================== */

    let sessionSource:
      ActivitySessionSource;

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
      /*
        The current selector calls this:

        adaptive_fallback

        But learner_activity_sessions stores the broader:

        adaptive
      */
      sessionSource =
        "adaptive";
    }

    /* =====================================================
       4. START THE ACTIVITY SESSION
    ===================================================== */

    const sessionResult =
      await startActivitySession({
        centerId:
          CENTER_ID,

        learnerId:
          normalizedLearnerId,

        activityId:
          selection.activityId,

        assignmentId:
          selection.assignmentId,

        sessionSource,

        selectionAlgorithm:
          selection.selectionAlgorithm,

        selectionReason:
          selection.selectionReason,
      });

        /* =====================================================
       5. RECORD REAL THOMPSON SELECTION
    ===================================================== */

    /*
      Only record the selection after the learner session
      was successfully created.

      Assigned activities are not Thompson selections.
    */
    let banditSelection = null;

    if (
        selection.selectionAlgorithm ===
            "thompson_sampling" ||
        selection.selectionAlgorithm ===
            "hybrid_thompson_personalized"
    ) {
      try {
        banditSelection =
          await recordBanditSelection(
            CENTER_ID,
            normalizedLearnerId,
            selection.activityId,
          );
      } catch (banditError) {
        /*
          The learner session already exists.

          A bandit analytics failure should not cancel
          or invalidate the real learner session.
        */
        console.error(
          "Session started, but Thompson selection could not be recorded:",
          banditError,
        );
      }
    }

    /* =====================================================
       6. RETURN SELECTION + SESSION
    ===================================================== */

    return res.status(201).json({
        success: true,

        sessionStarted:
            true,

        message:
            "Next learner activity selected and session started successfully.",

        selection,

        banditSelection,

        ...sessionResult,
        });
  } catch (error) {
    console.error(
      "Start next activity session error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to select and start the learner's next activity.",

      error:
        getErrorMessage(error),
    });
  }
}



/* =========================================================
   TEMPORARY TEST:
   ACTIVITY RUNTIME / COMMUNICATION ADAPTATION

   Remove after runtime integration is fully verified.
========================================================= */

export async function testActivityRuntime(
  req: Request,
  res: Response,
) {
  try {
    const {
      transcript,
      expectedAnswers,
      acceptedVariations = [],
    } = req.body;

    if (
      typeof transcript !== "string" ||
      !Array.isArray(expectedAnswers)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "transcript and expectedAnswers are required.",
      });
    }

    /*
      Temporary mock session context.

      We are NOT creating a database session here.

      We only want to verify:

      transcript
        ↓
      communication evaluation
        ↓
      adaptive runtime
        ↓
      adaptive decision
    */
    const context:
      SessionOrchestratorContext = {
        learningSessionId:
          "runtime-test-session",

        learnerId:
          "runtime-test-learner",

        centerId:
          "runtime-test-center",

        state:
          "waiting_for_response",

        currentActivity: {
          activityId:
            "runtime-test-activity",

          activityTitle:
            "Ball Test",

          deliveryMode:
            "screen",

          allowSkip:
            true,

          maxAttempts:
            3,

          estimatedMinutes:
            5,

          speechLadderLevel:
            "word",

          difficultyLevel:
            null,
        },

        currentAttemptNumber:
          0,

        totalActivitiesStarted:
          1,

        totalActivitiesCompleted:
          0,

        totalActivitiesSkipped:
          0,

        totalBreaks:
          0,
      };

    const result =
      processLearnerResponse(
        context,
        {
          transcript,

          expectedAnswers,

          acceptedVariations,

          engagement: {
            gazeDetectionAvailable:
              true,

            gazePresent:
              true,

            gazeAwaySeconds:
              0,

            inactivitySeconds:
              0,

            responseTimeMs:
              1800,
          },

          reachedMaximumAttempts:
            false,

          activityCompleted:
            false,

          therapistRequestedStop:
            false,

          parentRequestedStop:
            false,

          adaptiveSettings: {
            inactivityBreakSeconds:
              30,

            inactivityAutoStopSeconds:
              120,

            oneMoreTryEnabled:
              true,

            allowBreakSuggestion:
              true,
          },
        },
      );

    return res.status(200).json({
      success: true,

      transcript,

      expectedAnswers,

      acceptedVariations,

      communication:
        result.communication,

      decision:
        result.decision,

      updatedContext:
        result.updatedContext,
    });
  } catch (error: any) {
    console.error(
      "Activity runtime test error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to test activity runtime.",
      error:
        error.message,
    });
  }
}


/* =========================================================
   TEST LEARNER PROGRESSION

   TEMPORARY DEVELOPMENT ENDPOINT.

   POST /api/activity-sessions/test-progression

   Body:
   {
     "learnerId": "LEARNER_UUID"
   }
========================================================= */

export async function testProgression(
  req: Request,
  res: Response,
) {
  try {
    const {
      learnerId,
    } = req.body;

    if (
      typeof learnerId !== "string" ||
      !learnerId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    const progression =
      await evaluateLearnerProgression({
        centerId:
          CENTER_ID,

        learnerId:
          learnerId.trim(),
      });

    return res.status(200).json({
      success: true,

      progression,
    });
  } catch (error) {
    console.error(
      "Progression test error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to evaluate learner progression.",

      error:
        getErrorMessage(error),
    });
  }
}

/* =========================================================
   PROCESS REAL LEARNER RESPONSE

   POST /api/activity-sessions/:sessionId/respond

   Backend flow:

   transcript
      ↓
   communication evaluation
      ↓
   adaptive runtime decision
      ↓
   save attempt
      ↓
   return communication + decision + saved attempt
========================================================= */

export async function respondToActivity(
  req: Request,
  res: Response,
) {
  try {
    const sessionId =
      getRouteParam(
        req.params.sessionId,
      );

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message:
          "A valid activity session ID is required.",
      });
    }

    const {
      learnerId,

      attemptOrder,
      stepAttemptNumber = 1,

      transcript,
      expectedAnswers,
      acceptedVariations = [],

      responseTimeMs,

      gazeDetectionAvailable = false,
      gazePresent = null,
      gazeAwaySeconds = 0,
      inactivitySeconds = 0,

      reachedMaximumAttempts = false,
      activityCompleted = false,

      therapistRequestedStop = false,
      parentRequestedStop = false,

      adaptiveSettings,
    } = req.body;

    /* =====================================================
       1. VALIDATE REQUIRED INPUT
    ===================================================== */

    if (
      typeof learnerId !==
        "string" ||
      !learnerId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    if (
      typeof attemptOrder !==
        "number" ||
      !Number.isInteger(
        attemptOrder,
      ) ||
      attemptOrder < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt order must be a positive integer.",
      });
    }

    if (
      typeof transcript !==
        "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Transcript is required.",
      });
    }

    if (
      !Array.isArray(
        expectedAnswers,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "expectedAnswers must be an array.",
      });
    }

    /* =====================================================
       2. GET CURRENT ACTIVITY SESSION
    ===================================================== */

    const activitySession =
      await getActivitySessionById(
        sessionId,
        CENTER_ID,
        learnerId.trim(),
      );

    if (!activitySession) {
      return res.status(404).json({
        success: false,
        message:
          "Activity session was not found.",
      });
    }

    /*
      getActivitySessionById may return attempts too.

      We only need the session row here.
    */
    const session =
      "session" in activitySession
        ? activitySession.session
        : activitySession;

    if (
      session.status !==
      "in_progress"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Responses can only be processed for an in-progress activity session.",
      });
    }

    /* =====================================================
       3. BUILD ORCHESTRATOR CONTEXT
    ===================================================== */

    const context:
      SessionOrchestratorContext = {

        learningSessionId:
          session.learning_session_id ??
          "activity-only-session",

        learnerId:
          learnerId.trim(),

        centerId:
          CENTER_ID,

        state:
          "waiting_for_response",

        currentActivity: {
          activityId:
            session.activity_id,

          activityTitle:
            session.activity
              ?.title ??
            null,

          deliveryMode:
            session.activity
              ?.delivery_mode ??
            "screen",

          allowSkip:
            session.effective_allow_skip ??
            true,

          maxAttempts:
            session.effective_max_attempts ??
            3,

          estimatedMinutes:
            session.effective_estimated_minutes ??
            null,

          speechLadderLevel:
            session.speech_ladder_level ??
            null,

          difficultyLevel:
            null,
        },

        currentAttemptNumber:
          attemptOrder - 1,

        totalActivitiesStarted:
          1,

        totalActivitiesCompleted:
          0,

        totalActivitiesSkipped:
          0,

        totalBreaks:
          session.break_count ??
          0,
      };

    /* =====================================================
       4. PROCESS RESPONSE THROUGH RUNTIME
    ===================================================== */

    const effectiveAdaptiveSettings =
      adaptiveSettings &&
      typeof adaptiveSettings ===
        "object"
        ? adaptiveSettings
        : {
            inactivityBreakSeconds:
              30,

            inactivityAutoStopSeconds:
              120,

            oneMoreTryEnabled:
              true,

            allowBreakSuggestion:
              true,
          };

    const runtimeResult =
      processLearnerResponse(
        context,
        {
          transcript,

          expectedAnswers:
            expectedAnswers.filter(
              (
                value,
              ): value is string =>
                typeof value ===
                "string",
            ),

          acceptedVariations:
            Array.isArray(
              acceptedVariations,
            )
              ? acceptedVariations.filter(
                  (
                    value,
                  ): value is string =>
                    typeof value ===
                    "string",
                )
              : [],

          engagement: {
            gazeDetectionAvailable:
              typeof gazeDetectionAvailable ===
                "boolean"
                ? gazeDetectionAvailable
                : false,

            gazePresent:
              typeof gazePresent ===
                "boolean"
                ? gazePresent
                : null,

            gazeAwaySeconds:
              typeof gazeAwaySeconds ===
                "number"
                ? gazeAwaySeconds
                : 0,

            inactivitySeconds:
              typeof inactivitySeconds ===
                "number"
                ? inactivitySeconds
                : 0,

            responseTimeMs:
              typeof responseTimeMs ===
                "number"
                ? responseTimeMs
                : null,
          },

          reachedMaximumAttempts:
            reachedMaximumAttempts ===
            true,

          activityCompleted:
            activityCompleted ===
            true,

          therapistRequestedStop:
            therapistRequestedStop ===
            true,

          parentRequestedStop:
            parentRequestedStop ===
            true,

          adaptiveSettings: {
            inactivityBreakSeconds:
              Number(
                effectiveAdaptiveSettings
                  .inactivityBreakSeconds ??
                  30,
              ),

            inactivityAutoStopSeconds:
              Number(
                effectiveAdaptiveSettings
                  .inactivityAutoStopSeconds ??
                  120,
              ),

            oneMoreTryEnabled:
              effectiveAdaptiveSettings
                .oneMoreTryEnabled !==
              false,

            allowBreakSuggestion:
              effectiveAdaptiveSettings
                .allowBreakSuggestion !==
              false,
          },
        },
      );

    /* =====================================================
       5. MAP COMMUNICATION RESULT TO SAVED ATTEMPT
    ===================================================== */

    const communication =
      runtimeResult.communication;

    const shouldScore =
      communication.targetAchieved;

    const isCorrect =
      communication.targetAchieved
        ? true
        : null;

    const feedbackType:
      FeedbackType =
        communication.targetAchieved
          ? "correct"
          : communication
              .approximationDetected
            ? "encouragement"
            : communication
                .communicationAttempt
              ? "encouragement"
              : "none";

    const savedAttempt =
      await saveActivityAttempt({
        sessionId,

        attemptOrder,

        stepAttemptNumber:
          typeof stepAttemptNumber ===
            "number"
            ? stepAttemptNumber
            : 1,

        responseType:
          "speech",

        expectedAnswers,

        acceptedVariations,

        transcript:
          communication.transcript,

        normalizedTranscript:
          communication
            .normalizedTranscript,

        matchingMethod:
          communication
            .matchingMethod as
            | MatchingMethod
            | null,

        matchedAnswer:
          communication
            .matchedAnswer,

        communicationAttempt:
          communication
            .communicationAttempt,

        approximationDetected:
          communication
            .approximationDetected,

        targetAchieved:
          communication
            .targetAchieved,

        shouldScore,

        accepted:
          communication.accepted,

        isCorrect,

        responseTimeMs:
          typeof responseTimeMs ===
            "number"
            ? responseTimeMs
            : null,

        oneMoreTryUsed:
          runtimeResult.decision
            .action ===
          "one_more_try",

        gazePresentAtResponse:
          typeof gazePresent ===
            "boolean"
            ? gazePresent
            : null,

        inactivityBeforeResponseSeconds:
          typeof inactivitySeconds ===
            "number"
            ? inactivitySeconds
            : null,

        engagementData: {
          gazeDetectionAvailable,
          gazeAwaySeconds,
        },

        feedbackType,

        feedbackText:
          null,
      });

    /* =====================================================
       6. RETURN ONE COMPLETE RUNTIME CYCLE
    ===================================================== */

    return res.status(201).json({
      success: true,

      message:
        "Learner response evaluated, adapted, and saved successfully.",

      communication,

      adaptiveDecision:
        runtimeResult.decision,

      updatedContext:
        runtimeResult.updatedContext,

      attempt:
        savedAttempt,
    });
  } catch (error) {
    console.error(
      "Respond to activity error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process the learner response.",
      error:
        getErrorMessage(error),
    });
  }
}