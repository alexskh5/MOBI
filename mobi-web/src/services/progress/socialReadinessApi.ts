// mobi-web/src/services/progress/socialReadinessApi.ts


import {
  api,
} from "../api";

export type ProgressPeriod =
  | "day"
  | "week"
  | "month"
  | "year";

/* =========================================================
   SOCIAL READINESS PROGRESS
========================================================= */

export interface SocialReadinessProgress {
  learnerId: string;

  period:
    ProgressPeriod;

  dateRange: {
    start:
      string;

    end:
      string;
  };

  metrics: {
    activitiesCompleted:
      number;

    communicationAttempts:
      number;

    targetAchievements:
      number;

    participationResponses:
      number;

    engagementSeconds:
      number;

    inactivitySeconds:
      number;

    averageResponseTimeMs:
      number | null;

    activitiesMastered:
      number;
  };
}

/* =========================================================
   GET SOCIAL READINESS PROGRESS
========================================================= */

export async function getSocialReadinessProgress(
  params: {
    learnerId:
      string;

    period:
      ProgressPeriod;
  },
) {
  const response =
    await api.get(
      "/progress/social-readiness",
      {
        params,
      },
    );

  return response.data
    .socialReadiness as
      SocialReadinessProgress;
}