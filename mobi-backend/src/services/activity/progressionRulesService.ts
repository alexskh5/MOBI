export const SPEECH_LADDER_LEVELS = [
  "sound",
  "syllable",
  "word",
  "phrase",
  "sentence",
  "conversation",
] as const;

export type SpeechLadderLevel =
  (typeof SPEECH_LADDER_LEVELS)[number];

export interface ProgressionSessionEvidence {
  activityId: string | null;
  successRate: number | null;
  completedAt: string | null;
  mastered: boolean;
}

export function normalizeSpeechLadderLevel(
  value: string | null | undefined,
): SpeechLadderLevel | null {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");

  if (normalized === "social readiness") {
    return "conversation";
  }

  return SPEECH_LADDER_LEVELS.find(
    (level) => level === normalized,
  ) ?? null;
}

export function getNextSpeechLadderLevel(
  currentLevel: SpeechLadderLevel | null,
) {
  if (!currentLevel) {
    return null;
  }

  const index = SPEECH_LADDER_LEVELS.indexOf(currentLevel);
  return SPEECH_LADDER_LEVELS[index + 1] ?? null;
}

export function calculateProgressionEvidence(
  sessions: ProgressionSessionEvidence[],
  requiredActivities: number,
  requiredSuccessRate: number,
) {
  const latestByActivity = new Map<
    string,
    ProgressionSessionEvidence
  >();

  for (const session of sessions) {
    if (!session.activityId) {
      continue;
    }

    const existing = latestByActivity.get(session.activityId);
    const completedAt = Date.parse(session.completedAt ?? "");
    const existingCompletedAt = Date.parse(
      existing?.completedAt ?? "",
    );

    if (
      !existing ||
      (Number.isFinite(completedAt) &&
        (!Number.isFinite(existingCompletedAt) ||
          completedAt > existingCompletedAt))
    ) {
      latestByActivity.set(session.activityId, session);
    }
  }

  const latestMasteredSessions = Array.from(
    latestByActivity.values(),
  ).filter((session) => session.mastered);
  const validRates = latestMasteredSessions
    .map((session) => session.successRate)
    .filter(
      (rate): rate is number =>
        typeof rate === "number" && Number.isFinite(rate),
    );
  const activitiesMastered = latestMasteredSessions.length;
  const averageSuccessRate =
    validRates.length > 0
      ? Number(
          (
            validRates.reduce((total, rate) => total + rate, 0) /
            validRates.length
          ).toFixed(2),
        )
      : 0;

  return {
    activitiesMastered,
    averageSuccessRate,
    masteryPercentage:
      requiredActivities > 0
        ? Number(
            Math.min(
              100,
              (activitiesMastered / requiredActivities) * 100,
            ).toFixed(2),
          )
        : 0,
    eligible:
      activitiesMastered >= requiredActivities &&
      averageSuccessRate >= requiredSuccessRate,
  };
}
