export type PeriodKey = "day" | "week" | "month" | "year";

export interface PeriodOption {
  key: PeriodKey;
  label: string;
  minDaysRequired: number;
}

export interface OverallProgressCard {
  label: string;
  value: string;
  subtitle?: string;
  icon: string;
}

export interface SpeechAttempt {
  id: number | string;
  level: string;
  activityName: string;
  prompt: string;
  target: string;
  learnerResponse: string;
  isCorrect: boolean;
  supportUsed?: string;
}

export interface SpeechLevelProgress {
  level: string;
  correct: number;
  needsPractice: number;
  accuracy: string;
  attempts: SpeechAttempt[];
}

export interface ConversationAttempt {
  id: number | string;
  activityName: string;
  prompt: string;
  learnerResponse: string;
  expectedResponse: string;
  appropriateness: string;
  turnTaking: string;
}

export interface ActivityStepHistory {
  id: number | string;
  stepOrder: number;
  stepType: string;
  question: string;
  learnerAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
}

export interface ActivityProgressAnalysis {
  id: number | string;
  activityName: string;
  correctAnswers: number;
  wrongAnswers: number;
  successRate: string;
  stepHistory: ActivityStepHistory[];
}

export interface PeriodDashboardData {
  overall: OverallProgressCard[];
  speechTraining: {
    totalCorrect: number;
    totalNeedsPractice: number;
    mostMissedTargets: string[];
    mostImprovedSpeech: string;
    levels: SpeechLevelProgress[];
  };
  socialReadiness: {
    conversationAttempts: string;
    attempts: ConversationAttempt[];
    responseAppropriateness: string;
    turnTaking: string;
    engagementLevel: string;
    aiSummary: string;
  };
  activities: ActivityProgressAnalysis[];
}

export interface LearnerSummary {
  firstName: string;
  lastName: string;
  age: number;
}
