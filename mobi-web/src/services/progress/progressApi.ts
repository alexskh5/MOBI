// mobi-web/src/services/progress/progressApi.ts


import {
  api,
} from "../api";

/* =========================================================
   TYPES
========================================================= */

export type ProgressPeriod =
  | "day"
  | "week"
  | "month"
  | "year";

/* =========================================================
   PAGE 1 — PROGRESS OVERVIEW
========================================================= */

export interface ProgressOverviewMetrics {
  activitiesCompleted:
    number;

  communicationAttempts:
    number;

  targetAchievements:
    number;

  speechApproximations:
    number;

  observedEngagementSeconds:
    number;

  inactivitySeconds:
    number;

  screenTimeSeconds:
    number;

  screenTimeLimitSeconds:
    number | null;
}

export interface LearnerProgressOverview {
  learnerId:
    string;

  period:
    ProgressPeriod;

  dateRange: {
    start:
      string;

    end:
      string;
  };

  metrics:
    ProgressOverviewMetrics;
}

interface ProgressOverviewResponse {
  success:
    boolean;

  overview:
    LearnerProgressOverview;
}

/* =========================================================
   PAGE 2 — SPEECH TRAINING
========================================================= */

export interface SpeechTrainingMetrics {
  activitiesCompleted:
    number;

  communicationAttempts:
    number;

  targetAchievements:
    number;

  speechApproximations:
    number;

  exactMatches:
    number;

  acceptedVariations:
    number;

  phoneticMatches:
    number;

  noResponseAttempts:
    number;

  totalAttempts:
    number;

  averageResponseTimeMs:
    number | null;

  oneMoreTryUsedCount:
    number;

  activitiesMastered:
    number;
}

export interface SpeechTrainingProgress {
  learnerId:
    string;

  period:
    ProgressPeriod;

  dateRange: {
    start:
      string;

    end:
      string;
  };

  currentSpeechLadder:
    string | null;

  suggestedSpeechLadder:
    string | null;

  metrics:
    SpeechTrainingMetrics;
}

interface SpeechTrainingResponse {
  success:
    boolean;

  speechTraining:
    SpeechTrainingProgress;
}

/* =========================================================
   GET PROGRESS OVERVIEW
========================================================= */

export async function getProgressOverview(
  input: {
    learnerId:
      string;

    period:
      ProgressPeriod;

    anchorDate?:
      string;
  },
) {
  const response =
    await api.get<ProgressOverviewResponse>(
      "/progress/overview",
      {
        params: {
          learnerId:
            input.learnerId,

          period:
            input.period,

          anchorDate:
            input.anchorDate,
        },
      },
    );

  return response.data.overview;
}

/* =========================================================
   GET SPEECH TRAINING PROGRESS
========================================================= */

export async function getSpeechTrainingProgress(
  input: {
    learnerId:
      string;

    period:
      ProgressPeriod;

    anchorDate?:
      string;
  },
) {
  const response =
    await api.get<SpeechTrainingResponse>(
      "/progress/speech-training",
      {
        params: {
          learnerId:
            input.learnerId,

          period:
            input.period,

          anchorDate:
            input.anchorDate,
        },
      },
    );

  return response.data.speechTraining;
}