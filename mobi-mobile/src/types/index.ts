// src/types/index.ts (or src/types.ts)
// mobi-mobile/src/types.ts
export type Learner = {
  id: number;
  first_name: string;
  last_name: string;
  birthday: string;
  age: number;
  diagnosis: string;
  profile_picture_url?: string;
  bio_description?: string;
  guardian_first_name: string;
  guardian_last_name: string;
  guardian_phone: string;
  guardian_email: string;
  created_at: string;
  updated_at: string;
};

export type LearnerFormData = {
  first_name: string;
  last_name: string;
  birthday: string;
  diagnosis: string;
  profile_picture_url?: string;
  bio_description?: string;
  guardian_first_name: string;
  guardian_last_name: string;
  guardian_phone: string;
  guardian_email: string;
};

export type Activity = {
  id: number;
  title: string;
  level: string;
  category: string;
  difficulty: string;
  target_answers: string;
  acceptable_answers: string;
  teach_prompt: string;
  ask_prompt: string;
  hint1: string;
  hint2: string;
  hint3: string;
  correct_prompt: string;
  support_prompt: string;
};

export type SpeechResult = {
  transcript: string;
  transcriptConfidence: number;
  answerMatchScore: number;
  isCorrect: boolean;
  feedback: string;
};

export type RootStackParamList = {
  LearnerList: undefined;
  EnrollLearner: undefined;
  LearnerDetail: { learner: Learner };
  EditLearner: { learner: Learner };
  LearnerActivity: undefined;
};