// mobi-web/src/services/progress/speechTrainingApi.ts


import { api } from "../api";

export type ProgressPeriod =
  | "day"
  | "week"
  | "month"
  | "year";

export interface SpeechTrainingProgress {
  learnerId: string;

  period: ProgressPeriod;

  dateRange: {
    start: string;
    end: string;
  };

  currentSpeechLadder: string | null;

  suggestedSpeechLadder: string | null;

  metrics: {
    activitiesCompleted: number;

    communicationAttempts: number;

    targetAchievements: number;

    speechApproximations: number;

    exactMatches: number;

    acceptedVariations: number;

    phoneticMatches: number;

    noResponseAttempts: number;

    totalAttempts: number;

    averageResponseTimeMs: number | null;

    oneMoreTryUsedCount: number;

    activitiesMastered: number;
  };
}

export async function getSpeechTrainingProgress(params: {
  learnerId: string;
  period: ProgressPeriod;
}) {
  const response = await api.get(
    "/progress/speech-training",
    {
      params,
    },
  );

  return response.data
    .speechTraining as SpeechTrainingProgress;
}