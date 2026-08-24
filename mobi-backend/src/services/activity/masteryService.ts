/* =========================================================
   TYPES
========================================================= */

export interface MasteryAttempt {
  should_score: boolean;
  is_correct: boolean | null;
}

export interface CalculateActivityMasteryInput {
  attempts: MasteryAttempt[];

  attemptsWindow: number;

  requiredSuccessCount: number;

  requiredSuccessPercentage: number;

  requiredConsecutiveSuccesses: number;

  sessionCompleted: boolean;
}

export interface ActivityMasteryResult {
  masteryWindowAttempts: number;

  masteryWindowCorrect: number;

  masteryWindowSuccessRate:
    | number
    | null;

  masteryWindowConsecutiveSuccesses:
    number;

  activityMastered: boolean;
}

/* =========================================================
   HELPER:
   MAXIMUM CONSECUTIVE CORRECT ATTEMPTS
========================================================= */

export function calculateMaximumConsecutiveSuccesses(
  attempts: MasteryAttempt[],
) {
  let currentStreak = 0;
  let maximumStreak = 0;

  for (const attempt of attempts) {
    /*
      Ignore unscored attempts.

      They should not count as either a success
      or a failure for mastery.
    */
    if (!attempt.should_score) {
      continue;
    }

    if (
      attempt.is_correct === true
    ) {
      currentStreak += 1;

      maximumStreak =
        Math.max(
          maximumStreak,
          currentStreak,
        );
    } else {
      currentStreak = 0;
    }
  }

  return maximumStreak;
}

/* =========================================================
   CALCULATE ACTIVITY MASTERY
========================================================= */

export function calculateActivityMastery(
  input: CalculateActivityMasteryInput,
): ActivityMasteryResult {

  const {
    attempts,
    attemptsWindow,
    requiredSuccessCount,
    requiredSuccessPercentage,
    requiredConsecutiveSuccesses,
    sessionCompleted,
  } = input;

  /*
    Only scored attempts participate
    in mastery evaluation.
  */
  const scoredAttempts =
    attempts.filter(
      (attempt) =>
        attempt.should_score,
    );

  /*
    Use only the configured latest
    attempt window.

    Example:

    attemptsWindow = 5

    If 8 scored attempts exist,
    only the latest 5 are used.
  */
  const masteryWindow =
    scoredAttempts.slice(
      -Math.max(
        1,
        attemptsWindow,
      ),
    );

  const masteryWindowCorrect =
    masteryWindow.filter(
      (attempt) =>
        attempt.is_correct === true,
    ).length;

  const masteryWindowSuccessRate =
    masteryWindow.length > 0
      ? Number(
          (
            (
              masteryWindowCorrect /
              masteryWindow.length
            ) *
            100
          ).toFixed(2),
        )
      : null;

  const masteryWindowConsecutiveSuccesses =
    calculateMaximumConsecutiveSuccesses(
      masteryWindow,
    );

  const activityMastered =
    sessionCompleted &&
    masteryWindowSuccessRate !==
      null &&
    masteryWindowCorrect >=
      requiredSuccessCount &&
    masteryWindowSuccessRate >=
      requiredSuccessPercentage &&
    masteryWindowConsecutiveSuccesses >=
      requiredConsecutiveSuccesses;

  return {
    masteryWindowAttempts:
      masteryWindow.length,

    masteryWindowCorrect,

    masteryWindowSuccessRate,

    masteryWindowConsecutiveSuccesses,

    activityMastered,
  };
}