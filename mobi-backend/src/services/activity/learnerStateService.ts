/* =========================================================
   LEARNER STATE SERVICE

   PURPOSE:

   Convert recent observable session signals into a simple
   adaptive state.

   IMPORTANT:

   These states are system adaptation signals only.
   They are NOT clinical diagnoses.

   Example:

   "frustration_risk"

   means recent interaction patterns suggest MOBI should
   respond more conservatively.

   It does NOT mean MOBI has diagnosed the learner as
   frustrated.
========================================================= */

/* =========================================================
   TYPES
========================================================= */

export type LearnerAdaptiveState =
  | "engaged"
  | "low_engagement"
  | "fatigue_risk"
  | "frustration_risk"
  | "unknown";

export interface LearnerStateAttempt {
  isCorrect: boolean | null;

  shouldScore: boolean;

  responseTimeMs?: number | null;

  wasSkipped?: boolean;
}

export interface EvaluateLearnerStateInput {
  /*
    Recent attempts only.

    Later, the mobile/session layer can supply the most
    recent attempts instead of the complete session.
  */
  recentAttempts?: LearnerStateAttempt[];

  /*
    Gaze evidence.

    VERY IMPORTANT:

    gazeDetectionAvailable = false

    must NEVER automatically mean low engagement.
  */
  gazeDetectionAvailable?: boolean;

  gazeAwaySeconds?: number;

  /*
    Amount of recent inactivity.

    This should represent the current/recent period,
    not necessarily lifetime session inactivity.
  */
  inactivitySeconds?: number;

  /* =======================================================
     THRESHOLDS

     These values should eventually come from the learner's
     effective adaptation settings.
  ======================================================= */

  gazeAwayThresholdSeconds?: number;

  slowResponseThresholdSeconds?: number;

  decliningSuccessWindow?: number;
}

export interface LearnerStateResult {
  state: LearnerAdaptiveState;

  reasons: string[];

  evidence: {
    recentAttemptCount: number;

    recentScoredAttemptCount: number;

    recentIncorrectCount: number;

    recentSkippedCount: number;

    recentSlowResponseCount: number;

    gazeDetectionAvailable: boolean;

    gazeAwaySeconds: number;

    inactivitySeconds: number;
  };
}

/* =========================================================
   EVALUATE LEARNER STATE
========================================================= */

export function evaluateLearnerState(
  input: EvaluateLearnerStateInput,
): LearnerStateResult {

  const recentAttempts =
    input.recentAttempts ?? [];

  const gazeDetectionAvailable =
    input.gazeDetectionAvailable ??
    false;

  const gazeAwaySeconds =
    Math.max(
      0,
      input.gazeAwaySeconds ?? 0,
    );

  const inactivitySeconds =
    Math.max(
      0,
      input.inactivitySeconds ?? 0,
    );

  const gazeAwayThresholdSeconds =
    Math.max(
      1,
      input.gazeAwayThresholdSeconds ??
      10,
    );

  const slowResponseThresholdSeconds =
    Math.max(
      1,
      input.slowResponseThresholdSeconds ??
      15,
    );

  const decliningSuccessWindow =
    Math.max(
      1,
      input.decliningSuccessWindow ??
      3,
    );

  /* =======================================================
     1. RECENT ATTEMPT EVIDENCE
  ======================================================= */

  const recentWindow =
    recentAttempts.slice(
      -decliningSuccessWindow,
    );

  const scoredAttempts =
    recentWindow.filter(
      (attempt) =>
        attempt.shouldScore,
    );

  const recentIncorrectCount =
    scoredAttempts.filter(
      (attempt) =>
        attempt.isCorrect === false,
    ).length;

  const recentSkippedCount =
    recentWindow.filter(
      (attempt) =>
        attempt.wasSkipped === true,
    ).length;

  const slowResponseThresholdMs =
    slowResponseThresholdSeconds *
    1000;

  const recentSlowResponseCount =
    recentWindow.filter(
      (attempt) =>
        typeof attempt.responseTimeMs ===
          "number" &&
        attempt.responseTimeMs >=
          slowResponseThresholdMs,
    ).length;

  /* =======================================================
     2. COLLECT COMMON EVIDENCE
  ======================================================= */

  const evidence = {
    recentAttemptCount:
      recentWindow.length,

    recentScoredAttemptCount:
      scoredAttempts.length,

    recentIncorrectCount,

    recentSkippedCount,

    recentSlowResponseCount,

    gazeDetectionAvailable,

    gazeAwaySeconds,

    inactivitySeconds,
  };

  /* =======================================================
     3. FRUSTRATION-RISK SIGNAL

     Conservative rule:

     Only use this state when we have enough recent scored
     attempts and most of them were incorrect.

     This is an adaptive signal, not a clinical conclusion.
  ======================================================= */

  const enoughAttemptsForTrend =
    scoredAttempts.length >=
    decliningSuccessWindow;

  const incorrectRatio =
    scoredAttempts.length > 0
      ? recentIncorrectCount /
        scoredAttempts.length
      : 0;

  if (
    enoughAttemptsForTrend &&
    incorrectRatio >= 0.6
  ) {
    return {
      state:
        "frustration_risk",

      reasons: [
        "recent_success_declining",
        "recent_incorrect_responses_high",
      ],

      evidence,
    };
  }

  /* =======================================================
     4. FATIGUE-RISK SIGNAL

     Several slow responses inside the recent attempt window
     can suggest that MOBI should reduce task demand or
     consider a break.

     We deliberately avoid claiming why the learner responded
     slowly.
  ======================================================= */

  if (
    recentWindow.length >= 2 &&
    recentSlowResponseCount >= 2
  ) {
    return {
      state:
        "fatigue_risk",

      reasons: [
        "multiple_slow_recent_responses",
      ],

      evidence,
    };
  }

  /* =======================================================
     5. LOW-ENGAGEMENT SIGNAL

     Gaze is used ONLY when gaze detection is actually
     available.

     No gaze detection ≠ low engagement.
  ======================================================= */

  const gazeAwayExceeded =
    gazeDetectionAvailable &&
    gazeAwaySeconds >=
      gazeAwayThresholdSeconds;

  const inactivityExceeded =
    inactivitySeconds >=
      slowResponseThresholdSeconds;

  if (
    gazeAwayExceeded ||
    inactivityExceeded
  ) {
    const reasons: string[] =
      [];

    if (gazeAwayExceeded) {
      reasons.push(
        "gaze_away_threshold_exceeded",
      );
    }

    if (inactivityExceeded) {
      reasons.push(
        "inactivity_threshold_exceeded",
      );
    }

    return {
      state:
        "low_engagement",

      reasons,

      evidence,
    };
  }

  /* =======================================================
     6. ENGAGED

     We only call the learner "engaged" when at least some
     usable interaction evidence exists.
  ======================================================= */

  const hasInteractionEvidence =
    recentWindow.length > 0 ||
    (
      gazeDetectionAvailable &&
      gazeAwaySeconds <
        gazeAwayThresholdSeconds
    );

  if (hasInteractionEvidence) {
    return {
      state:
        "engaged",

      reasons: [
        "no_adaptation_threshold_exceeded",
      ],

      evidence,
    };
  }

  /* =======================================================
     7. UNKNOWN

     Example:

     - no recent responses yet
     - camera unavailable
     - no meaningful inactivity information

     We do NOT guess.
  ======================================================= */

  return {
    state:
      "unknown",

    reasons: [
      "insufficient_current_engagement_evidence",
    ],

    evidence,
  };
}