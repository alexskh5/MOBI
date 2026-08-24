// mobi-backend/src/services/activity/activitySessionService.ts

import { supabase } from "../../config/supabase";

import {
  updateBanditOutcome,
} from "./thompsonSamplingService";

import {
  evaluateLearnerProgression,
} from "./progressionService";

import {
  refreshLearnerTransactionalProgress,
} from "./transactionalProfileService";

import {
  calculateActivityMastery,
  calculateMaximumConsecutiveSuccesses,
} from "./masteryService";

/* =========================================================
   TYPES
========================================================= */

export type ActivitySessionSource =
  | "assigned_required"
  | "assigned_recommended"
  | "adaptive"
  | "manual";

export type ActivitySessionStatus =
  | "in_progress"
  | "completed"
  | "skipped"
  | "stopped"
  | "interrupted";

export type AttemptResponseType =
  | "speech"
  | "choice"
  | "action"
  | "conversation"
  | "system";

export type MatchingMethod =
  | "exact_match"
  | "accepted_variation"
  | "phrase_contains"
  | "token_match"
  | "levenshtein"
  | "levenshtein_approximation"
  | "phonetic_match"
  | "semantic_match"
  | "choice_match"
  | "action_observed"
  | "none"
  | "not_evaluated";

export type FeedbackType =
  | "correct"
  | "incorrect"
  | "encouragement"
  | "hint"
  | "max_attempts"
  | "skip"
  | "break"
  | "none";

export type RecommendedNextAction =
  | "continue_assigned"
  | "same_difficulty"
  | "increase_difficulty"
  | "decrease_difficulty"
  | "suggest_break"
  | "end_session"
  | "therapist_review";

/* =========================================================
   START SESSION INPUT
========================================================= */

export interface StartActivitySessionInput {
  centerId: string;
  learnerId: string;
  activityId: string;

  /*
    Present when the activity came from a therapist or
    center assignment.
  */
  assignmentId?: string | null;

  /*
    Used when there is no assignment.

    Assigned activities automatically determine their source
    using the assignment_type stored in the database.
  */
  sessionSource?: ActivitySessionSource;

  /*
    Future adaptive engine information.

    These remain optional for manually assigned activities.
  */
  selectionAlgorithm?: string | null;
  selectionReason?: Record<
    string,
    unknown
  >;
}

/* =========================================================
   SAVE ATTEMPT INPUT
========================================================= */

export interface SaveActivityAttemptInput {
  sessionId: string;
  activityStepId?: string | null;

  /*
    Attempt order across the complete activity session.

    Example:
    1, 2, 3, 4...
  */
  attemptOrder: number;

  /*
    Attempt number for this particular activity step.

    Example:
    First try = 1
    One More Try = 2
  */
  stepAttemptNumber?: number;

  responseType?: AttemptResponseType;

  expectedAnswers?: string[];
  acceptedVariations?: string[];

  expectedChoiceId?: string | null;
  selectedChoiceId?: string | null;

  transcript?: string | null;
  normalizedTranscript?: string | null;

  /*
    Leave null when the STT provider does not return a
    genuine confidence score.
  */
  sttConfidence?: number | null;
  sttProvider?: string | null;
  sttModel?: string | null;
  sttMetadata?: Record<
    string,
    unknown
  >;

  matchingMethod?: MatchingMethod | null;
  matchedAnswer?: string | null;

  levenshteinDistance?: number | null;
  phoneticMatch?: boolean | null;
  semanticMatch?: boolean | null;

  minimumConfidenceUsed?: number | null;
  levenshteinThresholdUsed?: number | null;

  phoneticMatchingEnabled?: boolean | null;
  semanticMatchingEnabled?: boolean | null;
  acceptedVariationsEnabled?: boolean | null;

  evaluationSettings?: Record<
    string,
    unknown
  >;

    communicationAttempt?: boolean;

    approximationDetected?: boolean;

    targetAchieved?: boolean;

    shouldScore?: boolean;

    accepted?: boolean;

    isCorrect?: boolean | null;

  score?: number | null;

  responseTimeMs?: number | null;

  hintUsed?: boolean;
  repeatPromptUsed?: boolean;
  oneMoreTryUsed?: boolean;

  wasSkipped?: boolean;
  skipReason?: string | null;

  gazePresentAtResponse?: boolean | null;

  inactivityBeforeResponseSeconds?:
    | number
    | null;

  engagementData?: Record<
    string,
    unknown
  >;

  feedbackType?: FeedbackType | null;
  feedbackText?: string | null;

  feedbackAudioGenerated?: boolean;
}

/* =========================================================
   FINISH SESSION INPUT
========================================================= */

export interface FinishActivitySessionInput {
  centerId: string;
  learnerId: string;
  sessionId: string;

  status?: Exclude<
    ActivitySessionStatus,
    "in_progress"
  >;

  totalDurationSeconds?: number;

  inactivitySeconds?: number;

  gazePresentSeconds?: number;
  gazeAwaySeconds?: number;
  gazeDetectionAvailable?: boolean;

  breakCount?: number;
  breakSuggested?: boolean;

  engagementOverrideTriggered?: boolean;
  engagementOverrideReason?: string | null;

  skippedBy?: string | null;
  skipReason?: string | null;

  stoppedBy?: string | null;
  stopReason?: string | null;

  recommendedNextAction?:
    | RecommendedNextAction
    | null;

  therapistSessionNotes?: string | null;
}

/* =========================================================
   HELPER: NORMALIZE SUPABASE RELATION
========================================================= */

/*
  Supabase sometimes types a joined relationship as either:

  object
  object[]

  This helper safely returns one object.
*/
function getOneRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

// /* =========================================================
//    HELPER: MAXIMUM CONSECUTIVE CORRECT ATTEMPTS
// ========================================================= */

// function calculateMaximumConsecutiveSuccesses(
//   attempts: Array<{
//     should_score: boolean;
//     is_correct: boolean | null;
//   }>,
// ) {
//   let currentStreak = 0;
//   let maximumStreak = 0;

//   for (const attempt of attempts) {
//     /*
//       Unscored attempts do not count as success or failure.

//       We currently leave the streak unchanged for unscored
//       communication attempts.
//     */
//     if (!attempt.should_score) {
//       continue;
//     }

//     if (attempt.is_correct === true) {
//       currentStreak += 1;

//       maximumStreak = Math.max(
//         maximumStreak,
//         currentStreak,
//       );
//     } else {
//       currentStreak = 0;
//     }
//   }

//   return maximumStreak;
// }

/* =========================================================
   START ACTIVITY SESSION
========================================================= */

export async function startActivitySession(
  input: StartActivitySessionInput,
) {
  const {
    centerId,
    learnerId,
    activityId,
    assignmentId = null,
    sessionSource = "manual",
    selectionAlgorithm = null,
    selectionReason = {},
  } = input;

  /* =======================================================
     1. VERIFY LEARNER
  ======================================================= */

  const {
    data: learner,
    error: learnerError,
  } = await supabase
    .from("learners")
    .select(`
      id,
      center_id,
      enrollment_status
    `)
    .eq("id", learnerId)
    .eq("center_id", centerId)
    .single();

  if (learnerError || !learner) {
    console.error(
      "Unable to verify learner before session:",
      learnerError,
    );

    throw new Error(
      "Learner was not found in this center.",
    );
  }

  if (
    learner.enrollment_status !==
    "active"
  ) {
    throw new Error(
      "Only active learners can start an activity session.",
    );
  }

  /* =======================================================
     2. GET ACTIVITY
  ======================================================= */

  const {
    data: activity,
    error: activityError,
  } = await supabase
    .from("activities")
    .select(`
      id,
      center_id,
      title,
      status,
      access_scope,
      speech_ladder_level,
      max_attempts,
      estimated_minutes,
      allow_skip,
      success_required_count
    `)
    .eq("id", activityId)
    .eq("center_id", centerId)
    .single();

  if (activityError || !activity) {
    console.error(
      "Unable to fetch activity before session:",
      activityError,
    );

    throw new Error(
      "Activity was not found in this center.",
    );
  }

  if (activity.status !== "published") {
    throw new Error(
      "Only published activities can be used in a learner session.",
    );
  }

  /* =======================================================
     3. GET OPTIONAL ASSIGNMENT
  ======================================================= */

  let assignment: {
    id: string;
    assignment_type:
      | "required"
      | "recommended";
    status: string;
    max_attempts_override:
      | number
      | null;
    estimated_minutes_override:
      | number
      | null;
    allow_skip_override:
      | boolean
      | null;
  } | null = null;

  if (assignmentId) {
    const {
      data: assignmentRow,
      error: assignmentError,
    } = await supabase
      .from(
        "learner_activity_assignments",
      )
      .select(`
        id,
        assignment_type,
        status,
        max_attempts_override,
        estimated_minutes_override,
        allow_skip_override
      `)
      .eq("id", assignmentId)
      .eq("center_id", centerId)
      .eq("learner_id", learnerId)
      .eq("activity_id", activityId)
      .single();

    if (
      assignmentError ||
      !assignmentRow
    ) {
      console.error(
        "Unable to verify activity assignment:",
        assignmentError,
      );

      throw new Error(
        "The activity assignment was not found for this learner.",
      );
    }

    if (
      assignmentRow.status ===
        "cancelled" ||
      assignmentRow.status ===
        "completed"
    ) {
      throw new Error(
        "This activity assignment is no longer available.",
      );
    }

    assignment =
      assignmentRow;
  }

  /*
    An assigned-only activity must have a valid assignment.
  */
  if (
    activity.access_scope ===
      "assigned_only" &&
    !assignment
  ) {
    throw new Error(
      "This activity is available only to explicitly assigned learners.",
    );
  }

  /* =======================================================
     4. GET LEARNER ADAPTATION SETTINGS
  ======================================================= */

  const {
    data: learnerSettings,
    error: settingsError,
  } = await supabase
    .from(
      "learner_adaptation_settings",
    )
    .select("*")
    .eq("learner_id", learnerId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (settingsError) {
    console.error(
      "Unable to fetch learner adaptation settings:",
      settingsError,
    );

    throw settingsError;
  }

  /* =======================================================
     5. RESOLVE EFFECTIVE SETTINGS

     Priority:
     assignment override
       ↓
     learner adaptation setting
       ↓
     activity default
  ======================================================= */

  const effectiveMaxAttempts =
    assignment
      ?.max_attempts_override ??
    learnerSettings
      ?.default_max_attempts ??
    activity.max_attempts ??
    3;

  const effectiveEstimatedMinutes =
    assignment
      ?.estimated_minutes_override ??
    learnerSettings
      ?.default_activity_minutes ??
    activity.estimated_minutes ??
    5;

  const effectiveAllowSkip =
    assignment
      ?.allow_skip_override ??
    learnerSettings?.allow_skip ??
    activity.allow_skip ??
    true;

  const resolvedSessionSource:
    ActivitySessionSource =
      assignment
        ? assignment.assignment_type ===
          "required"
          ? "assigned_required"
          : "assigned_recommended"
        : sessionSource;

  const effectiveSettings = {
    /*
      Activity progression configuration.
    */
    successRequiredCount:
      activity.success_required_count ??
      1,

    /*
      Speech evaluation configuration.
    */
    minimumConfidence:
      learnerSettings
        ?.minimum_confidence ??
      0.7,

    levenshteinThreshold:
      learnerSettings
        ?.levenshtein_threshold ??
      2,

    phoneticMatchingEnabled:
      learnerSettings
        ?.phonetic_matching_enabled ??
      true,

    acceptedVariationsEnabled:
      learnerSettings
        ?.accepted_variations_enabled ??
      true,

    semanticMatchingEnabled:
      learnerSettings
        ?.semantic_matching_enabled ??
      true,

    /*
      Progression configuration.
    */
    attemptsWindow:
      learnerSettings
        ?.attempts_window ??
      5,

    requiredSuccessCount:
      learnerSettings
        ?.required_success_count ??
      4,

    requiredSuccessPercentage:
      Number(
        learnerSettings
          ?.required_success_percentage ??
          80,
      ),

    consecutiveSuccessesRequired:
      learnerSettings
        ?.consecutive_successes_required ??
      3,

    minimumActivitiesMastered:
      learnerSettings
        ?.minimum_activities_mastered ??
      5,

    therapistApprovalRequired:
      learnerSettings
        ?.therapist_approval_required ??
      true,

    /*
      Session and engagement settings.
    */
    oneMoreTryEnabled:
      learnerSettings
        ?.one_more_try_enabled ??
      true,

    breakSuggestionMinutes:
      learnerSettings
        ?.break_suggestion_minutes ??
      10,

    gazeAwayThresholdSeconds:
      learnerSettings
        ?.gaze_away_threshold_seconds ??
      10,

    slowResponseThresholdSeconds:
      learnerSettings
        ?.slow_response_threshold_seconds ??
      15,

    decliningSuccessWindow:
      learnerSettings
        ?.declining_success_window ??
      3,
  };

  /* =======================================================
     6. CREATE SESSION
  ======================================================= */

  const {
    data: session,
    error: sessionError,
  } = await supabase
    .from(
      "learner_activity_sessions",
    )
    .insert({
      center_id:
        centerId,

      learner_id:
        learnerId,

      activity_id:
        activityId,

      assignment_id:
        assignment?.id ??
        null,

      session_source:
        resolvedSessionSource,

      speech_ladder_level:
        activity.speech_ladder_level ??
        null,

      effective_max_attempts:
        effectiveMaxAttempts,

      effective_estimated_minutes:
        effectiveEstimatedMinutes,

      effective_allow_skip:
        effectiveAllowSkip,

      effective_settings:
        effectiveSettings,

      status:
        "in_progress",

      selection_algorithm:
        selectionAlgorithm,

      selection_reason:
        selectionReason,
    })
    .select("*")
    .single();

  if (sessionError) {
    console.error(
      "Unable to start activity session:",
      sessionError,
    );

    throw sessionError;
  }

  /* =======================================================
     7. MARK ASSIGNMENT IN PROGRESS
  ======================================================= */

  if (
    assignment &&
    assignment.status === "pending"
  ) {
    const {
      error: assignmentUpdateError,
    } = await supabase
      .from(
        "learner_activity_assignments",
      )
      .update({
        status:
          "in_progress",

        started_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        assignment.id,
      )
      .eq(
        "center_id",
        centerId,
      )
      .eq(
        "learner_id",
        learnerId,
      );

    if (assignmentUpdateError) {
      console.error(
        "Session started, but assignment status could not be updated:",
        assignmentUpdateError,
      );

      /*
        The session already exists, so we do not throw here.

        Later we can move this workflow into a database
        transaction for complete atomicity.
      */
    }
  }

  return {
    session,

    activity: {
      id:
        activity.id,

      title:
        activity.title,

      speechLadderLevel:
        activity.speech_ladder_level,
    },

    assignment,

    effectiveSettings: {
      maxAttempts:
        effectiveMaxAttempts,

      estimatedMinutes:
        effectiveEstimatedMinutes,

      allowSkip:
        effectiveAllowSkip,

      ...effectiveSettings,
    },
  };
}

/* =========================================================
   SAVE ONE ACTIVITY ATTEMPT
========================================================= */

export async function saveActivityAttempt(
  input: SaveActivityAttemptInput,
) {
  const {
    sessionId,
    activityStepId = null,

    attemptOrder,
    stepAttemptNumber = 1,

    responseType = "speech",

    expectedAnswers = [],
    acceptedVariations = [],

    expectedChoiceId = null,
    selectedChoiceId = null,

    transcript = null,
    normalizedTranscript = null,

    sttConfidence = null,
    sttProvider = null,
    sttModel = null,
    sttMetadata = {},

    matchingMethod = null,
    matchedAnswer = null,

    levenshteinDistance = null,
    phoneticMatch = null,
    semanticMatch = null,

    minimumConfidenceUsed = null,
    levenshteinThresholdUsed = null,

    phoneticMatchingEnabled = null,
    semanticMatchingEnabled = null,
    acceptedVariationsEnabled = null,

    evaluationSettings = {},

    communicationAttempt = false,

    approximationDetected = false,

    targetAchieved = false,

    shouldScore = false,

    accepted = false,

    isCorrect = null,

    score = null,

    responseTimeMs = null,

    hintUsed = false,
    repeatPromptUsed = false,
    oneMoreTryUsed = false,

    wasSkipped = false,
    skipReason = null,

    gazePresentAtResponse = null,

    inactivityBeforeResponseSeconds =
      null,

    engagementData = {},

    feedbackType = null,
    feedbackText = null,

    feedbackAudioGenerated = false,
  } = input;

  /* =======================================================
     1. VALIDATE SESSION
  ======================================================= */

  const {
    data: session,
    error: sessionError,
  } = await supabase
    .from(
      "learner_activity_sessions",
    )
    .select(`
      id,
      status,
      activity_id
    `)
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    console.error(
      "Unable to verify activity session:",
      sessionError,
    );

    throw new Error(
      "Activity session was not found.",
    );
  }

  if (session.status !== "in_progress") {
    throw new Error(
      "Attempts can only be saved while the activity session is in progress.",
    );
  }

  /* =======================================================
     2. VERIFY OPTIONAL ACTIVITY STEP
  ======================================================= */

  if (activityStepId) {
    const {
      data: step,
      error: stepError,
    } = await supabase
      .from("activity_steps")
      .select(`
        id,
        activity_id
      `)
      .eq("id", activityStepId)
      .eq(
        "activity_id",
        session.activity_id,
      )
      .single();

    if (stepError || !step) {
      console.error(
        "Unable to verify activity step:",
        stepError,
      );

      throw new Error(
        "Activity step was not found in this session's activity.",
      );
    }
  }

  /* =======================================================
     3. VALIDATE SCORING
  ======================================================= */

  if (
    shouldScore &&
    typeof isCorrect !== "boolean"
  ) {
    throw new Error(
      "A scored attempt must have a correct or incorrect result.",
    );
  }

  if (
    wasSkipped &&
    isCorrect === true
  ) {
    throw new Error(
      "A skipped attempt cannot be marked as correct.",
    );
  }

  /* =======================================================
     4. SAVE ATTEMPT
  ======================================================= */

  const {
    data: attempt,
    error: attemptError,
  } = await supabase
    .from(
      "learner_activity_attempts",
    )
    .insert({
      session_id:
        sessionId,

      activity_step_id:
        activityStepId,

      attempt_order:
        attemptOrder,

      step_attempt_number:
        stepAttemptNumber,

      response_type:
        responseType,

      expected_answers:
        expectedAnswers,

      accepted_variations:
        acceptedVariations,

      expected_choice_id:
        expectedChoiceId,

      selected_choice_id:
        selectedChoiceId,

      transcript,

      normalized_transcript:
        normalizedTranscript,

      stt_confidence:
        sttConfidence,

      stt_provider:
        sttProvider,

      stt_model:
        sttModel,

      stt_metadata:
        sttMetadata,

      matching_method:
        matchingMethod,

      matched_answer:
        matchedAnswer,

      levenshtein_distance:
        levenshteinDistance,

      phonetic_match:
        phoneticMatch,

      semantic_match:
        semanticMatch,

      minimum_confidence_used:
        minimumConfidenceUsed,

      levenshtein_threshold_used:
        levenshteinThresholdUsed,

      phonetic_matching_enabled:
        phoneticMatchingEnabled,

      semantic_matching_enabled:
        semanticMatchingEnabled,

      accepted_variations_enabled:
        acceptedVariationsEnabled,

      evaluation_settings:
        evaluationSettings,

      communication_attempt:
        communicationAttempt,

    approximation_detected:
        approximationDetected,

    target_achieved:
        targetAchieved,

    should_score:
        shouldScore,

        accepted,

    is_correct:
        isCorrect,

      score,

      response_time_ms:
        responseTimeMs,

      hint_used:
        hintUsed,

      repeat_prompt_used:
        repeatPromptUsed,

      one_more_try_used:
        oneMoreTryUsed,

      was_skipped:
        wasSkipped,

      skip_reason:
        skipReason,

      gaze_present_at_response:
        gazePresentAtResponse,

      inactivity_before_response_seconds:
        inactivityBeforeResponseSeconds,

      engagement_data:
        engagementData,

      feedback_type:
        feedbackType,

      feedback_text:
        feedbackText,

      feedback_audio_generated:
        feedbackAudioGenerated,
    })
    .select("*")
    .single();

  if (attemptError) {
    console.error(
      "Unable to save learner activity attempt:",
      attemptError,
    );

    throw attemptError;
  }

  return attempt;
}

/* =========================================================
   GET SESSION WITH ATTEMPTS
========================================================= */

export async function getActivitySessionById(
  sessionId: string,
  centerId: string,
  learnerId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "learner_activity_sessions",
    )
    .select(`
      *,
      activities (
        id,
        title,
        description,
        activity_type,
        speech_ladder_level,
        thumbnail_url
      ),
      learner_activity_attempts (
        *
      )
    `)
    .eq("id", sessionId)
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .single();

  if (error) {
    console.error(
      "Unable to fetch activity session:",
      error,
    );

    throw error;
  }

  const attempts = (
    data.learner_activity_attempts ??
    []
  ).sort(
    (
      a: {
        attempt_order: number;
      },
      b: {
        attempt_order: number;
      },
    ) =>
      a.attempt_order -
      b.attempt_order,
  );

  return {
    ...data,

    activity:
      getOneRelation(
        data.activities,
      ),

    attempts,
  };
}

/* =========================================================
   FINISH ACTIVITY SESSION
========================================================= */

export async function finishActivitySession(
  input: FinishActivitySessionInput,
) {
  const {
    centerId,
    learnerId,
    sessionId,

    status = "completed",

    totalDurationSeconds = 0,

    inactivitySeconds = 0,

    gazePresentSeconds = 0,
    gazeAwaySeconds = 0,
    gazeDetectionAvailable = false,

    breakCount = 0,
    breakSuggested = false,

    engagementOverrideTriggered =
      false,

    engagementOverrideReason = null,

    skippedBy = null,
    skipReason = null,

    stoppedBy = null,
    stopReason = null,

    recommendedNextAction = null,

    therapistSessionNotes = null,
  } = input;

  /* =======================================================
     1. GET SESSION
  ======================================================= */

  const {
    data: session,
    error: sessionError,
  } = await supabase
    .from(
      "learner_activity_sessions",
    )
    .select(`
      id,
      activity_id,
      assignment_id,
      status,
      effective_settings
    `)
    .eq("id", sessionId)
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .single();

  if (sessionError || !session) {
    console.error(
      "Unable to fetch session before completion:",
      sessionError,
    );

    throw new Error(
      "Activity session was not found.",
    );
  }

  if (
    session.status !== "in_progress"
  ) {
    throw new Error(
      "Only an in-progress session can be finished.",
    );
  }

  /* =======================================================
     2. GET ATTEMPTS
  ======================================================= */

  const {
    data: attemptsData,
    error: attemptsError,
  } = await supabase
    .from(
      "learner_activity_attempts",
    )
    .select(`
      id,
      attempt_order,
      should_score,
      is_correct,
      communication_attempt,
      response_time_ms,
      was_skipped
    `)
    .eq("session_id", sessionId)
    .order(
      "attempt_order",
      {
        ascending: true,
      },
    );

  if (attemptsError) {
    console.error(
      "Unable to fetch attempts before session completion:",
      attemptsError,
    );

    throw attemptsError;
  }

  const attempts =
    attemptsData ?? [];

  /* =======================================================
     3. CALCULATE PERFORMANCE SUMMARY
  ======================================================= */

  const scoredAttempts =
    attempts.filter(
      (attempt) =>
        attempt.should_score,
    );

  const correctAttempts =
    scoredAttempts.filter(
      (attempt) =>
        attempt.is_correct === true,
    ).length;

  const incorrectAttempts =
    scoredAttempts.filter(
      (attempt) =>
        attempt.is_correct === false,
    ).length;

  const communicationAttempts =
    attempts.filter(
      (attempt) =>
        attempt.communication_attempt,
    ).length;

  const unscoredAttempts =
    attempts.filter(
      (attempt) =>
        !attempt.should_score,
    ).length;

  const successRate =
    scoredAttempts.length > 0
      ? Number(
          (
            (correctAttempts /
              scoredAttempts.length) *
            100
          ).toFixed(2),
        )
      : null;

  const consecutiveSuccesses =
    calculateMaximumConsecutiveSuccesses(
      attempts,
    );

  const responseTimes =
    attempts
      .map(
        (attempt) =>
          attempt.response_time_ms,
      )
      .filter(
        (
          responseTime,
        ): responseTime is number =>
          typeof responseTime ===
            "number" &&
          responseTime >= 0,
      );

  const totalResponseTimeMs =
    responseTimes.reduce(
      (total, responseTime) =>
        total + responseTime,
      0,
    );

  const averageResponseTimeMs =
    responseTimes.length > 0
      ? Math.round(
          totalResponseTimeMs /
            responseTimes.length,
        )
      : null;

  /* =======================================================
     4. DETERMINE SESSION MASTERY

     This is only session-level mastery.

     It does not automatically advance the learner's official
     Speech Ladder level.
  ======================================================= */

  const effectiveSettings =
    session.effective_settings ??
    {};

  const attemptsWindow =
    Number(
        effectiveSettings
        .attemptsWindow ??
        5,
    );
  const requiredSuccessCount =
    Number(
      effectiveSettings
        .requiredSuccessCount ??
        1,
    );

  const requiredSuccessPercentage =
    Number(
      effectiveSettings
        .requiredSuccessPercentage ??
        80,
    );

  const requiredConsecutiveSuccesses =
    Number(
      effectiveSettings
        .consecutiveSuccessesRequired ??
        1,
    );

    /*
    Mastery is evaluated using the learner's configured
    attempt window.

    Example:

    attemptsWindow = 5

    If the learner has 8 scored attempts, only the most
    recent 5 are used when deciding activity mastery.

    Whole-session totals are still preserved separately for
    reports and analytics.
  */
//   const masteryWindowAttempts =
//     scoredAttempts.slice(
//       -Math.max(
//         1,
//         attemptsWindow,
//       ),
//     );

//   const masteryWindowCorrect =
//     masteryWindowAttempts.filter(
//       (attempt) =>
//         attempt.is_correct === true,
//     ).length;

//   const masteryWindowSuccessRate =
//     masteryWindowAttempts.length > 0
//       ? Number(
//           (
//             (
//               masteryWindowCorrect /
//               masteryWindowAttempts.length
//             ) *
//             100
//           ).toFixed(2),
//         )
//       : null;

//   const masteryWindowConsecutiveSuccesses =
//     calculateMaximumConsecutiveSuccesses(
//       masteryWindowAttempts,
//     );

//   const activityMastered =
//     status === "completed" &&
//     masteryWindowSuccessRate !== null &&
//     masteryWindowCorrect >=
//       requiredSuccessCount &&
//     masteryWindowSuccessRate >=
//       requiredSuccessPercentage &&
//     masteryWindowConsecutiveSuccesses >=
//       requiredConsecutiveSuccesses;


const masteryResult =
  calculateActivityMastery({
    attempts,

    attemptsWindow,

    requiredSuccessCount,

    requiredSuccessPercentage,

    requiredConsecutiveSuccesses,

    sessionCompleted:
      status === "completed",
  });

const {
  masteryWindowAttempts,
  masteryWindowCorrect,
  masteryWindowSuccessRate,
  masteryWindowConsecutiveSuccesses,
  activityMastered,
} = masteryResult;

  /* =======================================================
     5. UPDATE SESSION
  ======================================================= */

  const completedAt =
    new Date().toISOString();

  const {
    data: completedSession,
    error: updateError,
  } = await supabase
    .from(
      "learner_activity_sessions",
    )
    .update({
      status,

      completed_at:
        completedAt,

      total_duration_seconds:
        Math.max(
          0,
          totalDurationSeconds,
        ),

      total_scored_attempts:
        scoredAttempts.length,

      correct_attempts:
        correctAttempts,

      incorrect_attempts:
        incorrectAttempts,

      communication_attempts:
        communicationAttempts,

      unscored_attempts:
        unscoredAttempts,

      success_rate:
        successRate,

      consecutive_successes:
        consecutiveSuccesses,

      activity_mastered:
        activityMastered,

      total_response_time_ms:
        totalResponseTimeMs,

      average_response_time_ms:
        averageResponseTimeMs,

      inactivity_seconds:
        Math.max(
          0,
          inactivitySeconds,
        ),

      gaze_present_seconds:
        Math.max(
          0,
          gazePresentSeconds,
        ),

      gaze_away_seconds:
        Math.max(
          0,
          gazeAwaySeconds,
        ),

      gaze_detection_available:
        gazeDetectionAvailable,

      break_count:
        Math.max(
          0,
          breakCount,
        ),

      break_suggested:
        breakSuggested,

      engagement_override_triggered:
        engagementOverrideTriggered,

      engagement_override_reason:
        engagementOverrideReason,

      skipped_by:
        skippedBy,

      skip_reason:
        skipReason,

      stopped_by:
        stoppedBy,

      stop_reason:
        stopReason,

      recommended_next_action:
        recommendedNextAction,

      therapist_session_notes:
        therapistSessionNotes,
    })
    .eq("id", sessionId)
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .select("*")
    .single();

  if (updateError) {
    console.error(
      "Unable to finish activity session:",
      updateError,
    );

    throw updateError;
  }

  /* =======================================================
     6. UPDATE RELATED ASSIGNMENT
  ======================================================= */

  if (session.assignment_id) {
    let assignmentStatus:
      | "completed"
      | "skipped"
      | "in_progress";

    if (status === "completed") {
      assignmentStatus =
        "completed";
    } else if (
      status === "skipped"
    ) {
      assignmentStatus =
        "skipped";
    } else {
      /*
        Stopped or interrupted sessions may be resumed later.
      */
      assignmentStatus =
        "in_progress";
    }

    const {
      error: assignmentError,
    } = await supabase
      .from(
        "learner_activity_assignments",
      )
      .update({
        status:
          assignmentStatus,

        completed_at:
          assignmentStatus ===
            "completed" ||
          assignmentStatus ===
            "skipped"
            ? completedAt
            : null,
      })
      .eq(
        "id",
        session.assignment_id,
      )
      .eq(
        "center_id",
        centerId,
      )
      .eq(
        "learner_id",
        learnerId,
      );

    if (assignmentError) {
      console.error(
        "Session finished, but assignment status could not be updated:",
        assignmentError,
      );
    }
  }

  /* =======================================================
     7. UPDATE THOMPSON SAMPLING OUTCOME
  ======================================================= */

  /*
    Thompson Sampling learns only from a genuinely completed
    activity session.

    completed + mastered
      → success evidence
      → alpha + 1

    completed + not mastered
      → unsuccessful evidence
      → beta + 1

    skipped / stopped / interrupted
      → no Thompson update

    This is important because fatigue, caregiver stopping,
    technical interruption, or a learner needing a break
    should not automatically be interpreted as the activity
    being ineffective.
  */
  let banditOutcome = null;

  if (status === "completed") {
    try {
      banditOutcome =
        await updateBanditOutcome({
          centerId,

          learnerId,

          activityId:
            session.activity_id,

          successful:
            activityMastered,
        });
    } catch (banditError) {
      /*
        The clinical/session record has already been saved.

        A Thompson update problem should therefore not erase
        or fail the completed learner session.

        We log it so it can be investigated.
      */
      console.error(
        "Session finished, but Thompson Sampling state could not be updated:",
        banditError,
      );
    }
  }

  /* =======================================================
   8. EVALUATE LEARNER PROGRESSION
======================================================= */

const progression =
  await evaluateLearnerProgression({
    centerId,
    learnerId,
  });

  /* =======================================================
   9. REFRESH LEARNER TRANSACTIONAL PROFILE
======================================================= */

/*
  The session has already been completed and saved.

  We now recalculate the learner's live dashboard summary
  from their actual session history.
*/
let transactionalProgress = null;

try {
  transactionalProgress =
    await refreshLearnerTransactionalProgress({
      centerId,
      learnerId,
    });
} catch (profileRefreshError) {
  /*
    A profile-summary refresh problem should NOT invalidate
    an activity session that was already successfully saved.

    We log the problem and allow the completed session
    response to continue.
  */
  console.error(
    "Session finished, but learner transactional progress could not be refreshed:",
    profileRefreshError,
  );
}

  return {
  session:
    completedSession,

  summary: {
    totalAttempts:
      attempts.length,

    totalScoredAttempts:
      scoredAttempts.length,

    correctAttempts,

    incorrectAttempts,

    communicationAttempts,

    unscoredAttempts,

    successRate,

    consecutiveSuccesses,

    totalResponseTimeMs,

    averageResponseTimeMs,

    // masteryWindowAttempts:
    //     masteryWindowAttempts.length,
    masteryWindowAttempts,

    masteryWindowCorrect,

    masteryWindowSuccessRate,

    masteryWindowConsecutiveSuccesses,

    activityMastered,
  },

  /*
    null means Thompson was intentionally not updated,
    for example when the activity was skipped,
    stopped, or interrupted.
  */
  banditOutcome,
  progression,
  transactionalProgress,
};
}