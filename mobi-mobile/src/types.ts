// mobi-mobile/src/types.ts

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

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
  next_activity: string;
  teach_prompt: string;
  teach_tone: string;
  teach_image_url?: string;
  ask_prompt: string;
  max_attempts: number;
  hint1: string;
  hint2: string;
  hint3: string;
  correct_prompt: string;
  correct_tone: string;
  correct_image_url?: string;
  reward: string;
  support_prompt: string;
  support_tone: string;
  support_image_url?: string;
  failed_action: string;
  activity_image_url?: string;
  created_at: string;
};

export type ActivityFormData = {
  title: string;
  level: string;
  category: string;
  difficulty: string;
  target_answers: string;
  acceptable_answers: string;
  next_activity: string;
  teach_prompt: string;
  teach_tone: string;
  teach_image_url?: string;
  ask_prompt: string;
  max_attempts: number;
  hint1: string;
  hint2: string;
  hint3: string;
  correct_prompt: string;
  correct_tone: string;
  correct_image_url?: string;
  reward: string;
  support_prompt: string;
  support_tone: string;
  support_image_url?: string;
  failed_action: string;
  activity_image_url?: string;
};

export type RootStackParamList = {
  Dashboard: undefined;
  Materials: undefined;
  Collaboration: undefined;
  Schedule: undefined;
  LearnerList: undefined;

  EnrollLearner: undefined;

  LearnerDetail: { learner: Learner };
  EditLearner: { learner: Learner };

  LearnerActivity: undefined;

  ActivityDetail: { activity: Activity };
  EditActivity: { activity: Activity };

  CreateActivity: undefined;

  // Log in
  LogIn: undefined;

  // Child-Mode
  ChildDashboard: undefined;
  ActivitySession: {
    activity: Activity;
  };

  // Adult-Mode
  AdultDashboard: undefined;
  Notifications: undefined;
  Settings: undefined;
  CenterProfile: undefined;
  LearnerProfile: undefined;
};

export type LearningSummary = {
  activitiesCompleted: string;
  completedActivities: string[];
  newWords: string;
  learnedWords: string[];
  mostUsedWords: string[];
  learningTime: string;
  eyeGazeTime: string;
  inactivityTime: string;
};

export type PeriodKey = 'day' | 'week' | 'month' | 'year';

export type PeriodOption = {
  key: PeriodKey;
  label: string;
  minDaysRequired: number;
};

export type OverallProgressCard = {
  label: string;
  value: string;
  subtitle?: string;
  icon: string;
};

export type SpeechLevel =
  | 'Sound'
  | 'Syllable'
  | 'Word'
  | 'Phrase'
  | 'Sentence';

export type SpeechAttempt = {
  id: number;
  level: SpeechLevel;
  activityName: string;
  prompt: string;
  target: string;
  learnerResponse: string;
  isCorrect: boolean;
  supportUsed?: string;
};

export type SpeechLevelProgress = {
  level: SpeechLevel;
  correct: number;
  needsPractice: number;
  accuracy: string;
  attempts: SpeechAttempt[];
};

export type SpeechTrainingResult = {
  levels: SpeechLevelProgress[];
  totalCorrect: number;
  totalNeedsPractice: number;
  mostMissedTargets: string[];
  mostImprovedSpeech: string;
};

export type ConversationAttempt = {
  id: number;
  activityName: string;
  prompt: string;
  learnerResponse: string;
  expectedResponse: string;
  appropriateness: string;
  turnTaking: string;
};

export type SocialReadinessResult = {
  conversationAttempts: string;
  attempts: ConversationAttempt[];
  responseAppropriateness: string;
  turnTaking: string;
  engagementLevel: string;
  aiSummary: string;
};

export type ActivityStepHistory = {
  id: number;
  stepOrder: number;
  stepType:
    | 'Teach'
    | 'Show & Choose'
    | 'Ask'
    | 'Conversation'
    | 'Do It'
    | 'Feedback';
  question: string;
  learnerAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
};

export type ActivityProgressAnalysis = {
  id: number;
  activityName: string;
  correctAnswers: number;
  wrongAnswers: number;
  successRate: string;
  stepHistory: ActivityStepHistory[];
};

export type PeriodDashboardData = {
  overall: OverallProgressCard[];
  speechTraining: SpeechTrainingResult;
  socialReadiness: SocialReadinessResult;
  activities: ActivityProgressAnalysis[];
};

export type NavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;

export type RoutePropType<T extends keyof RootStackParamList> =
  RouteProp<RootStackParamList, T>;




















// // mobi-mobile/src/types.ts
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RouteProp } from '@react-navigation/native';

// export type Learner = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   birthday: string;
//   age: number;
//   diagnosis: string;
//   profile_picture_url?: string;
//   bio_description?: string;
//   guardian_first_name: string;
//   guardian_last_name: string;
//   guardian_phone: string;
//   guardian_email: string;
//   created_at: string;
//   updated_at: string;
// };

// export type LearnerFormData = {
//   first_name: string;
//   last_name: string;
//   birthday: string;
//   diagnosis: string;
//   profile_picture_url?: string;
//   bio_description?: string;
//   guardian_first_name: string;
//   guardian_last_name: string;
//   guardian_phone: string;
//   guardian_email: string;
// };


// export type Activity = {
//   id: number;
//   title: string;
//   level: string;
//   category: string;
//   difficulty: string;
//   target_answers: string;
//   acceptable_answers: string;
//   next_activity: string;
//   teach_prompt: string;
//   teach_tone: string;
//   teach_image_url?: string;
//   ask_prompt: string;
//   max_attempts: number;
//   hint1: string;
//   hint2: string;
//   hint3: string;
//   correct_prompt: string;
//   correct_tone: string;
//   correct_image_url?: string;
//   reward: string;
//   support_prompt: string;
//   support_tone: string;
//   support_image_url?: string;
//   failed_action: string;
//   activity_image_url?: string;
//   created_at: string;
// };

// export type ActivityFormData = {
//   title: string;
//   level: string;
//   category: string;
//   difficulty: string;
//   target_answers: string;
//   acceptable_answers: string;
//   next_activity: string;
//   teach_prompt: string;
//   teach_tone: string;
//   teach_image_url?: string;
//   ask_prompt: string;
//   max_attempts: number;
//   hint1: string;
//   hint2: string;
//   hint3: string;
//   correct_prompt: string;
//   correct_tone: string;
//   correct_image_url?: string;
//   reward: string;
//   support_prompt: string;
//   support_tone: string;
//   support_image_url?: string;
//   failed_action: string;
//   activity_image_url?: string;
// };



// export type RootStackParamList = {
//   Dashboard: undefined;
//   Materials: undefined;
//   Collaboration: undefined;
//   Schedule: undefined;
//   LearnerList: undefined;

//   EnrollLearner: undefined;

//   LearnerDetail: { learner: Learner };
//   EditLearner: { learner: Learner };

//   LearnerActivity: undefined;

//   ActivityDetail: { activity: Activity };
//   EditActivity: { activity: Activity };

//   CreateActivity: undefined;
  
//   // Log in
//   LogIn: undefined;

//   // ChilD-Mode
//   ChildDashboard: undefined;
//   ActivitySession: {
//     activity: Activity;
//   }

//   // Adult-Mode
//   AdultDashboard: undefined;
//   Notifications: undefined;
//   Settings: undefined;
//   CenterProfile: undefined;
//   LearnerProfile: undefined;
  
// };

// export type LearningSummary = {
//   activitiesCompleted: string;
//   completedActivities: string[];
//   newWords: string;
//   learnedWords: string[];
//   mostUsedWords: string[];
//   learningTime: string;
//   eyeGazeTime: string;
//   inactivityTime: string;
// };

// export type PeriodKey = 'day' | 'week' | 'month' | 'year';

// export type PeriodOption = {
//   key: PeriodKey;
//   label: string;
//   minDaysRequired: number;
// };

// export type OverallProgressCard = {
//   label: string;
//   value: string;
//   subtitle?: string;
//   icon: string;
// };

// export type SpeechLevel =
//   | 'Sound'
//   | 'Syllable'
//   | 'Word'
//   | 'Phrase'
//   | 'Sentence';

// export type SpeechLevelProgress = {
//   level: 'Sound' | 'Syllable' | 'Word' | 'Phrase' | 'Sentence';
//   correct: number;
//   wrong: number;
//   accuracy: string;
//   correctItems: string[];
//   wrongItems: string[];
// };


// export type SpeechTrainingResult = {
//   levels: SpeechLevelProgress[];
//   totalCorrect: number;
//   totalWrong: number;
//   mostMissedWords: string[];
//   mostImprovedSpeech: string;
// };

// export type SocialReadinessResult = {
//   conversationAttempts: string;
//   attempts: ConversationAttempt[];
//   responseAppropriateness: string;
//   turnTaking: string;
//   engagementLevel: string;
//   aiSummary: string;
// };

// export type ActivityStepHistory = {
//   id: number;
//   stepOrder: number;
//   stepType:
//     | 'Teach'
//     | 'Show & Choose'
//     | 'Ask'
//     | 'Conversation'
//     | 'Do It'
//     | 'Feedback';
//   question: string;
//   learnerAnswer: string;
//   expectedAnswer: string;
//   isCorrect: boolean;
// };

// export type ActivityProgressAnalysis = {
//   id: number;
//   activityName: string;
//   correctAnswers: number;
//   wrongAnswers: number;
//   successRate: string;
//   stepHistory: ActivityStepHistory[];
// };

// export type PeriodDashboardData = {
//   overall: OverallProgressCard[];
//   speechTraining: SpeechTrainingResult;
//   socialReadiness: SocialReadinessResult;
//   activities: ActivityProgressAnalysis[];
// };

// export type ConversationAttempt = {
//   id: number;
//   activityName: string;
//   prompt: string;
//   learnerResponse: string;
//   expectedResponse: string;
//   appropriateness: string;
//   turnTaking: string;
// };






// export type NavigationProp<T extends keyof RootStackParamList> = NativeStackNavigationProp<RootStackParamList, T>;
// export type RoutePropType<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;



// export type MainTabParamList = {
//   Dashboard: undefined;
//   Materials: undefined;
//   Notifications: undefined;
//   Collaboration: undefined;
//   Schedule: undefined;
// };


// export type Activity = {
//   id: number;
//   title: string;
//   level: string;
//   category: string;
//   difficulty: string;
//   target_answers: string;
//   acceptable_answers: string;
//   next_activity: string;
//   teach_prompt: string;
//   teach_tone: string;
//   teach_audio_url?: string;
//   ask_prompt: string;
//   max_attempts: number;
//   hint1: string;
//   hint2: string;
//   hint3: string;
//   correct_prompt: string;
//   correct_tone: string;
//   correct_audio_url?: string;
//   reward: string;
//   support_prompt: string;
//   support_tone: string;
//   support_audio_url?: string;
//   failed_action: string;
//   created_at: string;
// };

// export type ActivityFormData = {
//   title: string;
//   level: string;
//   category: string;
//   difficulty: string;
//   target_answers: string;
//   acceptable_answers: string;
//   next_activity: string;
//   teach_prompt: string;
//   teach_tone: string;
//   ask_prompt: string;
//   max_attempts: number;
//   hint1: string;
//   hint2: string;
//   hint3: string;
//   correct_prompt: string;
//   correct_tone: string;
//   reward: string;
//   support_prompt: string;
//   support_tone: string;
//   failed_action: string;
// };


// export type RootStackParamList = {
//   LearnerList: undefined;
//   EnrollLearner: undefined;
//   LearnerDetail: { learner: Learner };
//   EditLearner: { learner: Learner };
//   LearnerActivity: undefined;
// };

// export type MainTabParamList = {
//   Dashboard: undefined;
//   Materials: undefined;
//   Notifications: undefined;
//   Collaboration: undefined;
//   Schedule: undefined;
// };

// export type NavigationProp<T extends keyof RootStackParamList> = NativeStackNavigationProp<RootStackParamList, T>;
// export type RoutePropType<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;


// mobi-mobile/src/types.ts - Update Activity and ActivityFormData