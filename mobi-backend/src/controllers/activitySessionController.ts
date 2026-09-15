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

import {
  continueLearningSession,
} from "../services/activity/learningSessionFlowService";
import {
  getRequestCenterId,
} from "../middleware/centerContext";
import {
  getDailyScreenTimeStatus,
} from "../services/activity/screenTimeService";
import {
  endLearningSession,
} from "../services/activity/learningSessionService";
import {
  getNextInteractiveStep,
  getStepResponseType,
  type InteractiveStepResponseType,
} from "../services/activity/activityStepFlowService";
// import {
//   getOrCreateBanditState,
//   sampleThompsonScore,
//   updateBanditOutcome,
// } from "../services/activity/thompsonSamplingService";

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

type LearnerResponseType = InteractiveStepResponseType;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isNonNegativeFiniteNumber(
  value: unknown,
  maximum: number,
) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= maximum
  );
}

function isPlainRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
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
          getRequestCenterId(req)!,

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

    if (!sessionId || !UUID_PATTERN.test(sessionId)) {
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

    if (!sessionId || !UUID_PATTERN.test(sessionId)) {
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
      !UUID_PATTERN.test(learnerId.trim())
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

    const numericInputs = [
      ["totalDurationSeconds", totalDurationSeconds, 86_400],
      ["inactivitySeconds", inactivitySeconds, 86_400],
      ["gazePresentSeconds", gazePresentSeconds, 86_400],
      ["gazeAwaySeconds", gazeAwaySeconds, 86_400],
      ["breakCount", breakCount, 1_000],
    ] as const;

    for (const [name, value, maximum] of numericInputs) {
      if (
        value !== undefined &&
        value !== null &&
        (
          !isNonNegativeFiniteNumber(value, maximum) ||
          (name === "breakCount" && !Number.isInteger(value))
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${name} must be a non-negative finite ${name === "breakCount" ? "integer" : "number"} within the supported range.`,
        });
      }
    }

    for (const [name, value] of [
      ["gazeDetectionAvailable", gazeDetectionAvailable],
      ["breakSuggested", breakSuggested],
      ["engagementOverrideTriggered", engagementOverrideTriggered],
    ] as const) {
      if (
        value !== undefined &&
        value !== null &&
        typeof value !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: `${name} must be a boolean when provided.`,
        });
      }
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

    // const result =
    //   await finishActivitySession({
    //     centerId:
    //       CENTER_ID,

    //     learnerId:
    //       learnerId.trim(),

    //     sessionId,

    //     status:
    //       normalizedStatus,

    //     totalDurationSeconds:
    //       typeof totalDurationSeconds ===
    //         "number"
    //         ? totalDurationSeconds
    //         : 0,

    //     inactivitySeconds:
    //       typeof inactivitySeconds ===
    //         "number"
    //         ? inactivitySeconds
    //         : 0,

    //     gazePresentSeconds:
    //       typeof gazePresentSeconds ===
    //         "number"
    //         ? gazePresentSeconds
    //         : 0,

    //     gazeAwaySeconds:
    //       typeof gazeAwaySeconds ===
    //         "number"
    //         ? gazeAwaySeconds
    //         : 0,

    //     gazeDetectionAvailable:
    //       typeof gazeDetectionAvailable ===
    //         "boolean"
    //         ? gazeDetectionAvailable
    //         : false,

    //     breakCount:
    //       typeof breakCount ===
    //         "number"
    //         ? breakCount
    //         : 0,

    //     breakSuggested:
    //       typeof breakSuggested ===
    //         "boolean"
    //         ? breakSuggested
    //         : false,

    //     engagementOverrideTriggered:
    //       typeof engagementOverrideTriggered ===
    //         "boolean"
    //         ? engagementOverrideTriggered
    //         : false,

    //     engagementOverrideReason:
    //       typeof engagementOverrideReason ===
    //         "string"
    //         ? engagementOverrideReason
    //         : null,

    //     skippedBy:
    //       typeof skippedBy ===
    //         "string"
    //         ? skippedBy
    //         : null,

    //     skipReason:
    //       typeof skipReason ===
    //         "string"
    //         ? skipReason
    //         : null,

    //     stoppedBy:
    //       typeof stoppedBy ===
    //         "string"
    //         ? stoppedBy
    //         : null,

    //     stopReason:
    //       typeof stopReason ===
    //         "string"
    //         ? stopReason
    //         : null,

    //     recommendedNextAction:
    //       recommendedNextAction ===
    //         null
    //         ? null
    //         : recommendedNextAction as
    //             | RecommendedNextAction
    //             | undefined,

    //     therapistSessionNotes:
    //       typeof therapistSessionNotes ===
    //         "string"
    //         ? therapistSessionNotes
    //         : null,
    //   });

const learningSessionId =
  typeof req.body.learningSessionId ===
    "string" &&
  req.body.learningSessionId.trim()
    ? req.body.learningSessionId.trim()
    : null;

if (
  learningSessionId &&
  !UUID_PATTERN.test(learningSessionId)
) {
  return res.status(400).json({
    success: false,
    message:
      "A valid learningSessionId is required.",
  });
}

const result =
  learningSessionId
    ? await continueLearningSession({
        learningSessionId,

        centerId:
          getRequestCenterId(req)!,

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
      })
    : await finishActivitySession({
        centerId:
          getRequestCenterId(req)!,

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
        "Activity session finished and next activity recommendation evaluated successfully.",
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

    if (!sessionId || !UUID_PATTERN.test(sessionId)) {
      return res.status(400).json({
        success: false,
        message:
          "A valid activity session ID is required.",
      });
    }

    if (!UUID_PATTERN.test(learnerId)) {
      return res.status(400).json({
        success: false,
        message:
          "Learner ID is required as a query parameter.",
      });
    }

    const session =
      await getActivitySessionById(
        sessionId,
        getRequestCenterId(req)!,
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
   SKIP ONE INTERACTIVE ACTIVITY STEP
========================================================= */

export async function skipActivityStep(
  req: Request,
  res: Response,
) {
  try {
    const sessionId = getRouteParam(req.params.sessionId);
    const activityStepId = getRouteParam(req.params.activityStepId);
    const learnerId =
      typeof req.body?.learnerId === "string"
        ? req.body.learnerId.trim()
        : "";
    const attemptOrder = req.body?.attemptOrder;
    const stepAttemptNumber = req.body?.stepAttemptNumber ?? 1;
    const skipReason =
      typeof req.body?.skipReason === "string"
        ? req.body.skipReason.trim() || null
        : null;
    const actorId = req.header("x-actor-id")?.trim() ?? "";
    const actorRole =
      req.header("x-actor-role")?.trim().toLowerCase() ?? "";

    if (
      !sessionId ||
      !activityStepId ||
      !UUID_PATTERN.test(sessionId) ||
      !UUID_PATTERN.test(activityStepId) ||
      !UUID_PATTERN.test(learnerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid session, learner, and activity step IDs are required.",
      });
    }

    if (
      !UUID_PATTERN.test(actorId) ||
      !["parent", "therapist", "center_admin"].includes(actorRole)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "A parent, therapist, or center administrator must confirm the step skip.",
      });
    }

    if (
      typeof attemptOrder !== "number" ||
      !Number.isInteger(attemptOrder) ||
      attemptOrder < 1 ||
      typeof stepAttemptNumber !== "number" ||
      !Number.isInteger(stepAttemptNumber) ||
      stepAttemptNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Attempt order values must be positive integers.",
      });
    }

    if (skipReason && skipReason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Skip reason must be at most 500 characters.",
      });
    }

    const session = await getActivitySessionById(
      sessionId,
      getRequestCenterId(req)!,
      learnerId,
    );

    if (session.status !== "in_progress") {
      return res.status(409).json({
        success: false,
        message: "Only an in-progress activity step can be skipped.",
      });
    }

    const activitySteps = Array.isArray(session.activity?.activity_steps)
      ? session.activity.activity_steps
      : [];
    const step = activitySteps.find(
      (candidate: { id?: unknown }) => candidate.id === activityStepId,
    );
    const savedAttempts = Array.isArray(session.attempts)
      ? session.attempts
      : [];
    const configuredMaximumAttempts = Number(
      session.effective_max_attempts ?? 3,
    );
    const maximumAttempts =
      Number.isInteger(configuredMaximumAttempts) &&
      configuredMaximumAttempts > 0
        ? configuredMaximumAttempts
        : 3;
    const expectedStep = getNextInteractiveStep(
      activitySteps,
      savedAttempts,
      maximumAttempts,
    );

    if (!step || !getStepResponseType(String(step.step_type ?? ""))) {
      return res.status(400).json({
        success: false,
        message: "The requested step is not an interactive activity step.",
      });
    }

    if (expectedStep?.id !== activityStepId) {
      return res.status(409).json({
        success: false,
        message:
          "Only the current therapist-authored interactive step can be skipped.",
        expectedActivityStepId: expectedStep?.id ?? null,
      });
    }

    if (
      session.effective_allow_skip !== true ||
      step.can_skip === false
    ) {
      return res.status(403).json({
        success: false,
        message: "Skipping is not enabled for this activity step.",
      });
    }

    const expectedAttemptOrder = savedAttempts.length + 1;
    const expectedStepAttemptNumber =
      savedAttempts.filter(
        (attempt: { activity_step_id?: unknown }) =>
          attempt.activity_step_id === activityStepId,
      ).length + 1;

    if (
      attemptOrder !== expectedAttemptOrder ||
      stepAttemptNumber !== expectedStepAttemptNumber
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Attempt order changed. Reload the activity session before retrying.",
        expectedAttemptOrder,
        expectedStepAttemptNumber,
      });
    }

    const attempt = await saveActivityAttempt({
      sessionId,
      activityStepId,
      attemptOrder,
      stepAttemptNumber,
      responseType: "system",
      expectedAnswers: Array.isArray(step.expected_answers)
        ? step.expected_answers.filter(
            (value: unknown): value is string =>
              typeof value === "string" && value.trim().length > 0,
          )
        : [],
      acceptedVariations: Array.isArray(step.accepted_variations)
        ? step.accepted_variations.filter(
            (value: unknown): value is string =>
              typeof value === "string" && value.trim().length > 0,
          )
        : [],
      communicationAttempt: false,
      approximationDetected: false,
      targetAchieved: false,
      shouldScore: false,
      accepted: false,
      isCorrect: null,
      wasSkipped: true,
      skipReason,
      feedbackType: "skip",
      engagementData: {
        skippedByActorId: actorId,
        skippedByRole: actorRole,
      },
    });
    const attemptsAfterSkip = [
      ...savedAttempts,
      {
        activity_step_id: activityStepId,
        was_skipped: true,
      },
    ];
    const nextStep = getNextInteractiveStep(
      activitySteps,
      attemptsAfterSkip,
      maximumAttempts,
    );

    return res.status(201).json({
      success: true,
      message: "Activity step skipped.",
      attempt,
      activityCompleted: nextStep === null,
      nextActivityStepId: nextStep?.id ?? null,
    });
  } catch (error) {
    console.error("Skip activity step error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to skip the activity step.",
      error: getErrorMessage(error),
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

    const selection =
      await selectNextActivity({
        centerId:
          getRequestCenterId(req)!,

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
          getRequestCenterId(req)!,

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
          getRequestCenterId(req)!,

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
            getRequestCenterId(req)!,
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
          responseType:
            "speech",

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

          isFinalActivityStep:
            false,

          therapistRequestedStop:
            false,

          parentRequestedStop:
            false,

          screenTimeLimitReached:
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

            allowHint:
              true,

            allowRepeatPrompt:
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
          getRequestCenterId(req)!,

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

    if (!sessionId || !UUID_PATTERN.test(sessionId)) {
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

      activityStepId,

      responseType,
      transcript = "",
      selectedChoiceId = null,
      actionCompleted = null,

      sttConfidence = null,
      sttProvider = null,
      sttModel = null,
      sttMetadata = {},

      responseTimeMs,

      gazeDetectionAvailable = false,
      gazePresent = null,
      gazeAwaySeconds = 0,
      inactivitySeconds = 0,

      therapistRequestedStop = false,
      parentRequestedStop = false,

    } = req.body;

    /* =====================================================
       1. VALIDATE REQUIRED INPUT
    ===================================================== */

    if (
      typeof learnerId !==
        "string" ||
      !UUID_PATTERN.test(learnerId.trim())
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
      typeof stepAttemptNumber !== "number" ||
      !Number.isInteger(stepAttemptNumber) ||
      stepAttemptNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Step attempt number must be a positive integer.",
      });
    }

    if (typeof transcript !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Transcript must be a string.",
      });
    }

    const allowedResponseTypes: LearnerResponseType[] = [
      "speech",
      "choice",
      "action",
      "conversation",
    ];

    if (
      responseType !== undefined &&
      (
        typeof responseType !== "string" ||
        !allowedResponseTypes.includes(
          responseType as LearnerResponseType,
        )
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid learner response type.",
      });
    }

    if (
      typeof activityStepId !== "string" ||
      !UUID_PATTERN.test(activityStepId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid activityStepId is required.",
      });
    }

    if (
      sttConfidence !== null &&
      (
        typeof sttConfidence !== "number" ||
        !Number.isFinite(sttConfidence) ||
        sttConfidence < 0 ||
        sttConfidence > 1
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "STT confidence must be between 0 and 1 when provided.",
      });
    }

    const numericInputs = [
      {
        value: responseTimeMs,
        maximum: 86_400_000,
        name: "responseTimeMs",
      },
      {
        value: gazeAwaySeconds,
        maximum: 86_400,
        name: "gazeAwaySeconds",
      },
      {
        value: inactivitySeconds,
        maximum: 86_400,
        name: "inactivitySeconds",
      },
    ];

    for (const input of numericInputs) {
      if (
        input.value !== undefined &&
        input.value !== null &&
        !isNonNegativeFiniteNumber(input.value, input.maximum)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${input.name} must be a non-negative finite number within the supported range.`,
        });
      }
    }

    const booleanInputs = [
      ["gazeDetectionAvailable", gazeDetectionAvailable],
      ["gazePresent", gazePresent],
      ["therapistRequestedStop", therapistRequestedStop],
      ["parentRequestedStop", parentRequestedStop],
    ] as const;

    for (const [name, value] of booleanInputs) {
      if (
        value !== undefined &&
        value !== null &&
        typeof value !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: `${name} must be a boolean when provided.`,
        });
      }
    }

    if (!isPlainRecord(sttMetadata)) {
      return res.status(400).json({
        success: false,
        message: "sttMetadata must be an object.",
      });
    }

    for (const [name, value] of [
      ["sttProvider", sttProvider],
      ["sttModel", sttModel],
    ] as const) {
      if (
        value !== null &&
        (
          typeof value !== "string" ||
          value.trim().length > 100
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${name} must be a string of at most 100 characters when provided.`,
        });
      }
    }

    /* =====================================================
       2. GET CURRENT ACTIVITY SESSION
    ===================================================== */

    const activitySession =
      await getActivitySessionById(
        sessionId,
        getRequestCenterId(req)!,
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

    const activitySteps =
      Array.isArray(session.activity?.activity_steps)
        ? session.activity.activity_steps
        : [];
    const activityStep = activitySteps.find(
      (step: { id?: unknown }) =>
        step.id === activityStepId.trim(),
    );

    if (!activityStep) {
      return res.status(400).json({
        success: false,
        message:
          "The activity step does not belong to this session.",
      });
    }

    const savedAttempts =
      Array.isArray(session.attempts)
        ? session.attempts
        : [];
    const configuredMaximumAttempts = Number(
      session.effective_max_attempts ?? 3,
    );
    const maximumAttempts =
      Number.isInteger(configuredMaximumAttempts) &&
      configuredMaximumAttempts > 0
        ? configuredMaximumAttempts
        : 3;
    const expectedInteractiveStep = getNextInteractiveStep(
      activitySteps,
      savedAttempts,
      maximumAttempts,
    );

    if (!expectedInteractiveStep) {
      return res.status(409).json({
        success: false,
        message:
          "All interactive activity steps are already resolved. Finish the activity session before continuing.",
      });
    }

    if (expectedInteractiveStep.id !== activityStepId.trim()) {
      return res.status(409).json({
        success: false,
        message:
          "Responses must follow the therapist-authored interactive step order.",
        expectedActivityStepId: expectedInteractiveStep.id,
      });
    }

    const expectedAttemptOrder =
      savedAttempts.length + 1;

    if (attemptOrder !== expectedAttemptOrder) {
      return res.status(409).json({
        success: false,
        message:
          `Expected attempt order ${expectedAttemptOrder}. Refresh the active session before retrying.`,
      });
    }

    const existingStepAttempts = savedAttempts.filter(
      (attempt: { activity_step_id?: unknown }) =>
        attempt.activity_step_id === activityStepId.trim(),
    ).length;
    const expectedStepAttemptNumber =
      existingStepAttempts + 1;

    if (stepAttemptNumber !== expectedStepAttemptNumber) {
      return res.status(409).json({
        success: false,
        message:
          `Expected step attempt number ${expectedStepAttemptNumber}. Refresh the active session before retrying.`,
      });
    }

    const expectedAnswers = Array.isArray(
      activityStep.expected_answers,
    )
      ? activityStep.expected_answers.filter(
          (value: unknown): value is string =>
            typeof value === "string" &&
            value.trim().length > 0,
        )
      : [];
    const acceptedVariations = Array.isArray(
      activityStep.accepted_variations,
    )
      ? activityStep.accepted_variations.filter(
          (value: unknown): value is string =>
            typeof value === "string" &&
            value.trim().length > 0,
        )
      : [];
    const stepType =
      typeof activityStep.step_type === "string"
        ? activityStep.step_type
        : "";
    const expectedResponseType = getStepResponseType(stepType);

    if (!expectedResponseType) {
      return res.status(400).json({
        success: false,
        message:
          "This activity step presents content and does not accept a learner response.",
      });
    }
    const normalizedResponseType =
      typeof responseType === "string"
        ? responseType
        : expectedResponseType;

    if (normalizedResponseType !== expectedResponseType) {
      return res.status(400).json({
        success: false,
        message:
          `This activity step requires a ${expectedResponseType} response.`,
      });
    }

    const metadata =
      activityStep.metadata &&
      typeof activityStep.metadata === "object"
        ? activityStep.metadata
        : {};
    const choices = Array.isArray(metadata.choices)
      ? metadata.choices
      : [];
    const expectedChoices = choices.filter(
      (choice: { is_correct?: unknown }) =>
        choice.is_correct === true,
    );
    const expectedChoice =
      expectedChoices.length === 1 ? expectedChoices[0] : null;
    const expectedChoiceId =
      expectedChoice?.id !== undefined &&
      expectedChoice?.id !== null
        ? String(expectedChoice.id)
        : null;
    const normalizedSelectedChoiceId =
      selectedChoiceId !== null &&
      selectedChoiceId !== undefined
        ? String(selectedChoiceId)
        : null;
    const validChoiceIds = new Set(
      choices
        .map((choice: { id?: unknown }) =>
          choice.id !== undefined && choice.id !== null
            ? String(choice.id)
            : null,
        )
        .filter(
          (value: string | null): value is string => value !== null,
        ),
    );

    if (
      expectedResponseType === "choice" &&
      (
        !expectedChoiceId ||
        !normalizedSelectedChoiceId ||
        expectedChoices.length !== 1 ||
        !validChoiceIds.has(normalizedSelectedChoiceId)
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The step must have exactly one therapist-defined correct choice, and the selected choice must belong to the step.",
      });
    }

    if (
      expectedResponseType === "action" &&
      typeof actionCompleted !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "actionCompleted must be confirmed for a guided action step.",
      });
    }

    const actionObserverId =
      req.header("x-actor-id")?.trim() ?? "";
    const actionObserverRole =
      req.header("x-actor-role")?.trim().toLowerCase() ?? "";
    const allowedActionObserverRoles = new Set([
      "parent",
      "therapist",
      "center_admin",
    ]);

    if (
      expectedResponseType === "action" &&
      (
        !UUID_PATTERN.test(actionObserverId) ||
        !allowedActionObserverRoles.has(actionObserverRole)
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "A parent, therapist, or center administrator must identify the observed action.",
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
          getRequestCenterId(req)!,

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

    const effectiveSettings =
      session.effective_settings ?? {};
    const breakSuggestionMinutes = Math.max(
      0,
      Number(effectiveSettings.breakSuggestionMinutes ?? 2),
    );
    const highestStepOrder = activitySteps
      .filter((step: { step_type?: unknown }) =>
        typeof step.step_type === "string" &&
        getStepResponseType(step.step_type) !== null,
      )
      .reduce(
      (highest: number, step: { step_order?: unknown }) =>
        Math.max(highest, Number(step.step_order ?? 0)),
      0,
    );
    const isFinalActivityStep =
      Number(activityStep.step_order ?? 0) === highestStepOrder;
    const screenTimeStatus =
      session.activity?.delivery_mode === "guided_off_screen"
        ? {
            limitSeconds: null,
            usedSeconds: 0,
            remainingSeconds: null,
            limitReached: false,
          }
        : await getDailyScreenTimeStatus({
            centerId: getRequestCenterId(req)!,
            learnerId: learnerId.trim(),
          });

    const runtimeResult =
      processLearnerResponse(
        context,
        {
          responseType:
            normalizedResponseType as
              | "speech"
              | "choice"
              | "action"
              | "conversation",

          transcript,

          selectedChoiceId:
            normalizedSelectedChoiceId,

          expectedChoiceId,

          actionCompleted:
            typeof actionCompleted === "boolean"
              ? actionCompleted
              : null,

          expectedAnswers:
            expectedAnswers.filter(
              (
                value: unknown,
              ): value is string =>
                typeof value ===
                "string",
            ),

          acceptedVariations:
            acceptedVariations,

          sttConfidence:
            expectedResponseType === "speech" ||
            expectedResponseType === "conversation"
              ? sttConfidence
              : null,

          evaluationSettings: {
            minimumConfidence:
              effectiveSettings.minimumConfidence,

            levenshteinThreshold:
              effectiveSettings.levenshteinThreshold,

            phoneticMatchingEnabled:
              effectiveSettings.phoneticMatchingEnabled,

            semanticMatchingEnabled:
              effectiveSettings.semanticMatchingEnabled,

            acceptedVariationsEnabled:
              effectiveSettings.acceptedVariationsEnabled,
          },

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
            expectedStepAttemptNumber >= maximumAttempts,

          isFinalActivityStep,

          therapistRequestedStop:
            therapistRequestedStop ===
            true,

          parentRequestedStop:
            parentRequestedStop ===
            true,

          screenTimeLimitReached:
            screenTimeStatus.limitReached,

          adaptiveSettings: {
            inactivityBreakSeconds:
              breakSuggestionMinutes * 60,

            inactivityAutoStopSeconds:
              Math.max(
                breakSuggestionMinutes * 60,
                Number(
                  effectiveSettings.inactivityAutoStopSeconds ??
                  900,
                ),
              ),

            oneMoreTryEnabled:
              effectiveSettings.oneMoreTryEnabled !== false,

            allowBreakSuggestion:
              breakSuggestionMinutes > 0,

            allowHint:
              effectiveSettings.allowHint !== false &&
              activityStep.can_give_hint !== false,

            allowRepeatPrompt:
              effectiveSettings.allowRepeatPrompt !== false &&
              activityStep.can_repeat !== false,
          },
        },
      );

    /* =====================================================
       5. MAP COMMUNICATION RESULT TO SAVED ATTEMPT
    ===================================================== */

    const communication =
      runtimeResult.communication;

    /*
    MOBI scoring rule:

    Correct target response:
        score as correct.

    Clear communication attempt that does not match the target:
        score as incorrect.

    Approximation:
        preserve as meaningful communication evidence,
        but do not score it as wrong.

    No response:
        do not score.
    */
    const shouldScore =
      communication.shouldScore;

    const isCorrect =
    shouldScore
        ? communication.targetAchieved
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

        activityStepId:
          activityStepId.trim(),

        attemptOrder,

        stepAttemptNumber:
          typeof stepAttemptNumber ===
            "number"
            ? stepAttemptNumber
            : 1,

        responseType:
          normalizedResponseType as AttemptResponseType,

        expectedAnswers,

        acceptedVariations,

        expectedChoiceId,

        selectedChoiceId:
          normalizedSelectedChoiceId,

        transcript:
          communication.transcript,

        normalizedTranscript:
          communication
            .normalizedTranscript,

        sttConfidence:
          communication.confidence,

        sttProvider:
          typeof sttProvider === "string"
            ? sttProvider
            : null,

        sttModel:
          typeof sttModel === "string"
            ? sttModel
            : null,

        sttMetadata:
          typeof sttMetadata === "object" &&
          sttMetadata !== null &&
          !Array.isArray(sttMetadata)
            ? sttMetadata
            : {},

        matchingMethod:
          communication
            .matchingMethod as
            | MatchingMethod
            | null,

        matchedAnswer:
          communication
            .matchedAnswer,

        levenshteinDistance:
          communication.levenshteinDistance,

        phoneticMatch:
          communication.phoneticMatch,

        semanticMatch:
          communication.semanticMatch,

        minimumConfidenceUsed:
          communication.minimumConfidenceUsed,

        levenshteinThresholdUsed:
          typeof session.effective_settings
            ?.levenshteinThreshold === "number"
            ? session.effective_settings
                .levenshteinThreshold
            : 2,

        phoneticMatchingEnabled:
          session.effective_settings
            ?.phoneticMatchingEnabled !== false,

        semanticMatchingEnabled:
          session.effective_settings
            ?.semanticMatchingEnabled !== false,

        acceptedVariationsEnabled:
          session.effective_settings
            ?.acceptedVariationsEnabled !== false,

        evaluationSettings: {
          minimumConfidence:
            communication.minimumConfidenceUsed,

          levenshteinThreshold:
            typeof effectiveSettings
              .levenshteinThreshold === "number"
              ? effectiveSettings
                  .levenshteinThreshold
              : 2,

          phoneticMatchingEnabled:
            effectiveSettings
              .phoneticMatchingEnabled !== false,

          semanticMatchingEnabled:
            effectiveSettings
              .semanticMatchingEnabled !== false,

          acceptedVariationsEnabled:
            effectiveSettings
              .acceptedVariationsEnabled !== false,
        },

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
          ...(expectedResponseType === "action"
            ? {
                actionObservation: {
                  observedByActorId: actionObserverId,
                  observedByRole: actionObserverRole,
                  completed: actionCompleted,
                },
              }
            : {}),
        },

        feedbackType,

        feedbackText:
          null,
      });

    let endedLearningSession = null;
    const systemAutoStop =
      runtimeResult.decision.nextState === "auto_stopped" &&
      session.learning_session_id;

    if (systemAutoStop) {
      endedLearningSession = await endLearningSession({
        centerId: getRequestCenterId(req)!,
        learningSessionId: session.learning_session_id,
        endReason: screenTimeStatus.limitReached
          ? "screen_time_limit"
          : "auto_inactivity",
        stoppedBy: "system",
        totalDurationSeconds: 0,
        totalActivityRuns: 0,
        completedActivityRuns: 0,
        skippedActivityRuns: 0,
        totalInactivitySeconds:
          typeof inactivitySeconds === "number"
            ? Math.max(0, inactivitySeconds)
            : 0,
        totalBreakCount: session.break_count ?? 0,
      });
    }

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

      screenTime:
        screenTimeStatus,

      learningSessionEnded:
        endedLearningSession,
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
