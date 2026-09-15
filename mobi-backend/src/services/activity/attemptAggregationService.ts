import { calculateMaximumConsecutiveSuccesses } from "./masteryService";

export interface AggregatableAttempt {
  should_score: boolean;
  is_correct: boolean | null;
  communication_attempt?: boolean | null;
  response_time_ms?: number | null;
}

export interface AttemptAggregateSummary {
  totalAttempts: number;
  totalScoredAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  communicationAttempts: number;
  unscoredAttempts: number;
  successRate: number | null;
  consecutiveSuccesses: number;
  totalResponseTimeMs: number;
  averageResponseTimeMs: number | null;
}

export function summarizeAttempts(
  attempts: AggregatableAttempt[],
): AttemptAggregateSummary {
  const scoredAttempts = attempts.filter(
    (attempt) => attempt.should_score === true,
  );
  const correctAttempts = scoredAttempts.filter(
    (attempt) => attempt.is_correct === true,
  ).length;
  const incorrectAttempts = scoredAttempts.filter(
    (attempt) => attempt.is_correct === false,
  ).length;
  const communicationAttempts = attempts.filter(
    (attempt) => attempt.communication_attempt === true,
  ).length;
  const responseTimes = attempts
    .map((attempt) => attempt.response_time_ms)
    .filter(
      (value): value is number =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0,
    );
  const totalResponseTimeMs = responseTimes.reduce(
    (total, value) => total + value,
    0,
  );

  return {
    totalAttempts: attempts.length,
    totalScoredAttempts: scoredAttempts.length,
    correctAttempts,
    incorrectAttempts,
    communicationAttempts,
    unscoredAttempts: attempts.length - scoredAttempts.length,
    successRate:
      scoredAttempts.length > 0
        ? Number(
            (
              (correctAttempts / scoredAttempts.length) *
              100
            ).toFixed(2),
          )
        : null,
    consecutiveSuccesses:
      calculateMaximumConsecutiveSuccesses(attempts),
    totalResponseTimeMs,
    averageResponseTimeMs:
      responseTimes.length > 0
        ? Math.round(totalResponseTimeMs / responseTimes.length)
        : null,
  };
}
