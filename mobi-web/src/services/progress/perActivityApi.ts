// mobi-web/src/services/progress/perActivityApi.ts

import {
  api,
} from "../api";

export type ProgressPeriod =
  | "day"
  | "week"
  | "month"
  | "year";

/* =========================================================
   STEP
========================================================= */

export interface PerActivityStepResult {
  id: string;

  stepNumber: number;

  stepType: string;

  question: string;

  learnerAnswer: string;

  expectedAnswer:
    string | null;

  status:
    | "correct"
    | "needs-practice"
    | null;

  supportUsed:
    string | null;
}

/* =========================================================
   ACTIVITY
========================================================= */

export interface PerActivityResult {
  id: string;

  activityTitle: string;

  activityDomain:
    string | null;

  correctAnswers: number;

  needsPractice: number;

  communicationAttempts: number;

  speechApproximations: number;

  targetAchievements: number;

  successRate: number;

  steps:
    PerActivityStepResult[];
}

/* =========================================================
   PAGE RESULT
========================================================= */

export interface PerActivityAnalysisProgress {
  learnerId: string;

  period:
    ProgressPeriod;

  dateRange: {
    start: string;
    end: string;
  };

  activities:
    PerActivityResult[];
}

/* =========================================================
   GET PER ACTIVITY ANALYSIS
========================================================= */

export async function getPerActivityAnalysis(
  params: {
    learnerId: string;

    period:
        ProgressPeriod;

    anchorDate?:
        string;
    },
) {
  const response =
    await api.get(
      "/progress/per-activity",
      {
        params,
      },
    );

  return response.data
    .perActivity as
      PerActivityAnalysisProgress;
}