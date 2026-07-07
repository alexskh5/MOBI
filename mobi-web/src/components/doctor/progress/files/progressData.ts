import type {
  PeriodDashboardData,
  PeriodKey,
  PeriodOption,
} from './progressTypes';

export const periodOptions: PeriodOption[] = [
  { key: 'day', label: 'Day', minDaysRequired: 1 },
  { key: 'week', label: 'Week', minDaysRequired: 7 },
  { key: 'month', label: 'Month', minDaysRequired: 30 },
  { key: 'year', label: 'Year', minDaysRequired: 365 },
];

// BACKEND READY:
// Replace later with learner.daysSinceFirstSession from your backend.
export const userUsageDays = 45;

export const dashboardData: Record<PeriodKey, PeriodDashboardData> = {
  day: {
    overall: [
      { label: 'Activities Completed', value: '2', icon: 'layers-outline' },
      { label: 'Words Practiced', value: '12', icon: 'text-outline' },
      { label: 'Focus Time', value: '15m', icon: 'time-outline' },
      { label: 'Inactivity Time', value: '3m', icon: 'pause-circle-outline' },
      {
        label: 'Screen Time',
        value: '15m / 1h 30m',
        subtitle: 'Used vs daily limit',
        icon: 'phone-portrait-outline',
      },
    ],
    speechTraining: {
      totalCorrect: 21,
      totalNeedsPractice: 6,
      mostMissedTargets: ['/ra/', 'thank you'],
      mostImprovedSpeech: 'Word recognition improved after repeated visual prompts.',
      levels: [
        {
          level: 'Sound',
          correct: 5,
          needsPractice: 1,
          accuracy: '83%',
          attempts: [
            {
              id: 1,
              level: 'Sound',
              activityName: 'Sound Imitation',
              prompt: 'Say /m/',
              target: '/m/',
              learnerResponse: '/m/',
              isCorrect: true,
            },
            {
              id: 2,
              level: 'Sound',
              activityName: 'Sound Imitation',
              prompt: 'Say /ra/',
              target: '/ra/',
              learnerResponse: '/la/',
              isCorrect: false,
              supportUsed: 'Verbal prompt',
            },
          ],
        },
        {
          level: 'Syllable',
          correct: 4,
          needsPractice: 1,
          accuracy: '80%',
          attempts: [
            {
              id: 3,
              level: 'Syllable',
              activityName: 'Syllable Practice',
              prompt: 'Say ma',
              target: 'ma',
              learnerResponse: 'ma',
              isCorrect: true,
            },
            {
              id: 4,
              level: 'Syllable',
              activityName: 'Syllable Practice',
              prompt: 'Say ra',
              target: 'ra',
              learnerResponse: 'la',
              isCorrect: false,
              supportUsed: 'Modeling',
            },
          ],
        },
        {
          level: 'Word',
          correct: 7,
          needsPractice: 2,
          accuracy: '78%',
          attempts: [
            {
              id: 5,
              level: 'Word',
              activityName: 'Vocabulary: Animals',
              prompt: 'What animal is this?',
              target: 'dog',
              learnerResponse: 'dog',
              isCorrect: true,
            },
            {
              id: 6,
              level: 'Word',
              activityName: 'Vocabulary: Animals',
              prompt: 'What is this animal?',
              target: 'cat',
              learnerResponse: 'dog',
              isCorrect: false,
              supportUsed: 'Visual cue',
            },
          ],
        },
        {
          level: 'Phrase',
          correct: 3,
          needsPractice: 1,
          accuracy: '75%',
          attempts: [
            {
              id: 7,
              level: 'Phrase',
              activityName: 'Requesting Practice',
              prompt: 'Ask for more.',
              target: 'more please',
              learnerResponse: 'more please',
              isCorrect: true,
            },
            {
              id: 8,
              level: 'Phrase',
              activityName: 'Requesting Practice',
              prompt: 'Ask for help.',
              target: 'help me',
              learnerResponse: 'help',
              isCorrect: false,
              supportUsed: 'Sentence starter',
            },
          ],
        },
        {
          level: 'Sentence',
          correct: 2,
          needsPractice: 1,
          accuracy: '67%',
          attempts: [
            {
              id: 9,
              level: 'Sentence',
              activityName: 'Introduce Yourself',
              prompt: 'Say your name.',
              target: 'My name is Lexi.',
              learnerResponse: 'My name is Lexi.',
              isCorrect: true,
            },
            {
              id: 10,
              level: 'Sentence',
              activityName: 'Polite Response',
              prompt: 'What do you say when someone helps you?',
              target: 'Thank you for helping me.',
              learnerResponse: 'Thank you',
              isCorrect: false,
              supportUsed: 'Prompted expansion',
            },
          ],
        },
      ],
    },
    socialReadiness: {
      conversationAttempts: '4',
      attempts: [
        {
          id: 1,
          activityName: 'Making Friends',
          prompt: 'What do you say when you meet someone?',
          learnerResponse: 'Hello',
          expectedResponse: 'Hello',
          appropriateness: 'Appropriate',
          turnTaking: 'Independent',
        },
        {
          id: 2,
          activityName: 'Making Friends',
          prompt: 'What do you say when someone helps you?',
          learnerResponse: 'Goodbye',
          expectedResponse: 'Thank you',
          appropriateness: 'Needs support',
          turnTaking: 'Prompted',
        },
        {
          id: 3,
          activityName: 'Greeting Practice',
          prompt: 'How are you today?',
          learnerResponse: 'I am happy',
          expectedResponse: 'I am happy',
          appropriateness: 'Appropriate',
          turnTaking: 'Independent',
        },
        {
          id: 4,
          activityName: 'Sharing Practice',
          prompt: 'Can I play with you?',
          learnerResponse: 'Play',
          expectedResponse: 'Yes, let us play',
          appropriateness: 'Partially appropriate',
          turnTaking: 'Prompted',
        },
      ],
      responseAppropriateness: 'Good',
      turnTaking: 'Developing',
      engagementLevel: 'High',
      aiSummary:
        'Lexi showed better social engagement during greetings and simple turn-taking. She still needs support in maintaining longer responses.',
    },
    activities: [
      {
        id: 1,
        activityName: 'Making Friends',
        correctAnswers: 8,
        wrongAnswers: 2,
        successRate: '80%',
        stepHistory: [
          {
            id: 1,
            stepOrder: 1,
            stepType: 'Ask',
            question: 'What do you say when you meet someone?',
            learnerAnswer: 'Hello',
            expectedAnswer: 'Hello',
            isCorrect: true,
          },
          {
            id: 2,
            stepOrder: 2,
            stepType: 'Conversation',
            question: 'What do you say when someone helps you?',
            learnerAnswer: 'Goodbye',
            expectedAnswer: 'Thank you',
            isCorrect: false,
          },
        ],
      },
      {
        id: 2,
        activityName: 'Vocabulary: Animals',
        correctAnswers: 6,
        wrongAnswers: 2,
        successRate: '75%',
        stepHistory: [
          {
            id: 1,
            stepOrder: 1,
            stepType: 'Show & Choose',
            question: 'Which one is a dog?',
            learnerAnswer: 'Dog',
            expectedAnswer: 'Dog',
            isCorrect: true,
          },
          {
            id: 2,
            stepOrder: 2,
            stepType: 'Ask',
            question: 'What animal says meow?',
            learnerAnswer: 'Dog',
            expectedAnswer: 'Cat',
            isCorrect: false,
          },
        ],
      },
    ],
  },

  week: {
    overall: [
      { label: 'Activities Completed', value: '14', icon: 'layers-outline' },
      { label: 'Words Practiced', value: '48', icon: 'text-outline' },
      { label: 'Focus Time', value: '1h 40m', icon: 'time-outline' },
      { label: 'Inactivity Time', value: '15m', icon: 'pause-circle-outline' },
      {
        label: 'Screen Time',
        value: '1h 40m / 7h',
        subtitle: 'Used vs weekly limit',
        icon: 'phone-portrait-outline',
      },
    ],
    speechTraining: {
      totalCorrect: 107,
      totalNeedsPractice: 28,
      mostMissedTargets: ['/r/', 'dinosaurs', 'thank you'],
      mostImprovedSpeech: 'Sentence-level responses improved with guided repetition.',
      levels: [
        {
          level: 'Sound',
          correct: 22,
          needsPractice: 4,
          accuracy: '85%',
          attempts: [
            {
              id: 1,
              level: 'Sound',
              activityName: 'Sound Imitation',
              prompt: 'Say /r/',
              target: '/r/',
              learnerResponse: '/l/',
              isCorrect: false,
              supportUsed: 'Verbal prompt',
            },
          ],
        },
        {
          level: 'Syllable',
          correct: 18,
          needsPractice: 5,
          accuracy: '78%',
          attempts: [
            {
              id: 2,
              level: 'Syllable',
              activityName: 'Syllable Practice',
              prompt: 'Say ra',
              target: 'ra',
              learnerResponse: 'la',
              isCorrect: false,
              supportUsed: 'Modeling',
            },
          ],
        },
        {
          level: 'Word',
          correct: 34,
          needsPractice: 8,
          accuracy: '81%',
          attempts: [
            {
              id: 3,
              level: 'Word',
              activityName: 'Vocabulary Practice',
              prompt: 'Say dinosaurs.',
              target: 'dinosaurs',
              learnerResponse: 'dinosaur',
              isCorrect: false,
              supportUsed: 'Repetition',
            },
          ],
        },
        {
          level: 'Phrase',
          correct: 20,
          needsPractice: 6,
          accuracy: '77%',
          attempts: [
            {
              id: 4,
              level: 'Phrase',
              activityName: 'Requesting Practice',
              prompt: 'Ask for help.',
              target: 'help me',
              learnerResponse: 'help',
              isCorrect: false,
              supportUsed: 'Sentence starter',
            },
          ],
        },
        {
          level: 'Sentence',
          correct: 13,
          needsPractice: 5,
          accuracy: '72%',
          attempts: [
            {
              id: 5,
              level: 'Sentence',
              activityName: 'Conversation Practice',
              prompt: 'Say thank you politely.',
              target: 'Thank you for helping me.',
              learnerResponse: 'Thank you',
              isCorrect: false,
              supportUsed: 'Prompted expansion',
            },
          ],
        },
      ],
    },
    socialReadiness: {
      conversationAttempts: '18',
      attempts: [
        {
          id: 1,
          activityName: 'Making Friends',
          prompt: 'How do you greet a friend?',
          learnerResponse: 'Hello',
          expectedResponse: 'Hello',
          appropriateness: 'Appropriate',
          turnTaking: 'Independent',
        },
        {
          id: 2,
          activityName: 'Sharing Practice',
          prompt: 'What do you say when you want a toy?',
          learnerResponse: 'More please',
          expectedResponse: 'Can I play?',
          appropriateness: 'Partially appropriate',
          turnTaking: 'Prompted',
        },
      ],
      responseAppropriateness: 'Good',
      turnTaking: 'Developing',
      engagementLevel: 'High',
      aiSummary:
        'Lexi showed gradual improvement in conversation attempts and turn-taking across the week.',
    },
    activities: [
      {
        id: 1,
        activityName: 'Making Friends',
        correctAnswers: 32,
        wrongAnswers: 7,
        successRate: '82%',
        stepHistory: [
          {
            id: 1,
            stepOrder: 1,
            stepType: 'Ask',
            question: 'How do you greet a friend?',
            learnerAnswer: 'Hello',
            expectedAnswer: 'Hello',
            isCorrect: true,
          },
        ],
      },
      {
        id: 2,
        activityName: 'Basic Choices',
        correctAnswers: 20,
        wrongAnswers: 5,
        successRate: '80%',
        stepHistory: [
          {
            id: 1,
            stepOrder: 1,
            stepType: 'Show & Choose',
            question: 'Choose the apple.',
            learnerAnswer: 'Apple',
            expectedAnswer: 'Apple',
            isCorrect: true,
          },
        ],
      },
    ],
  },

  month: {
    overall: [
      { label: 'Activities Completed', value: '38', icon: 'layers-outline' },
      { label: 'Words Practiced', value: '112', icon: 'text-outline' },
      { label: 'Focus Time', value: '6h 15m', icon: 'time-outline' },
      { label: 'Inactivity Time', value: '48m', icon: 'pause-circle-outline' },
      {
        label: 'Screen Time',
        value: '6h 15m / 30h',
        subtitle: 'Used vs monthly limit',
        icon: 'phone-portrait-outline',
      },
    ],
    speechTraining: {
      totalCorrect: 317,
      totalNeedsPractice: 71,
      mostMissedTargets: ['thank you', 'excuse me', 'dinosaurs'],
      mostImprovedSpeech: 'Word and phrase production improved consistently this month.',
      levels: [
        {
          level: 'Sound',
          correct: 70,
          needsPractice: 9,
          accuracy: '89%',
          attempts: [
            {
              id: 1,
              level: 'Sound',
              activityName: 'Sound Imitation',
              prompt: 'Say /m/',
              target: '/m/',
              learnerResponse: '/m/',
              isCorrect: true,
            },
          ],
        },
        {
          level: 'Syllable',
          correct: 62,
          needsPractice: 14,
          accuracy: '82%',
          attempts: [
            {
              id: 2,
              level: 'Syllable',
              activityName: 'Syllable Practice',
              prompt: 'Say la',
              target: 'la',
              learnerResponse: 'la',
              isCorrect: true,
            },
          ],
        },
        {
          level: 'Word',
          correct: 96,
          needsPractice: 21,
          accuracy: '82%',
          attempts: [
            {
              id: 3,
              level: 'Word',
              activityName: 'Vocabulary Practice',
              prompt: 'Say excuse me.',
              target: 'excuse me',
              learnerResponse: 'excuse',
              isCorrect: false,
              supportUsed: 'Repetition',
            },
          ],
        },
        {
          level: 'Phrase',
          correct: 54,
          needsPractice: 15,
          accuracy: '78%',
          attempts: [
            {
              id: 4,
              level: 'Phrase',
              activityName: 'Polite Phrases',
              prompt: 'Ask for help.',
              target: 'help me',
              learnerResponse: 'help me',
              isCorrect: true,
            },
          ],
        },
        {
          level: 'Sentence',
          correct: 35,
          needsPractice: 12,
          accuracy: '74%',
          attempts: [
            {
              id: 5,
              level: 'Sentence',
              activityName: 'Introduce Yourself',
              prompt: 'Say your name.',
              target: 'My name is Lexi.',
              learnerResponse: 'My name is Lexi.',
              isCorrect: true,
            },
          ],
        },
      ],
    },
    socialReadiness: {
      conversationAttempts: '52',
      attempts: [
        {
          id: 1,
          activityName: 'Making Friends',
          prompt: 'What do you say when someone asks your name?',
          learnerResponse: 'My name is Lexi',
          expectedResponse: 'My name is Lexi',
          appropriateness: 'Appropriate',
          turnTaking: 'Independent',
        },
        {
          id: 2,
          activityName: 'Turn-taking Practice',
          prompt: 'What do you say when it is your friend’s turn?',
          learnerResponse: 'Your turn',
          expectedResponse: 'Your turn',
          appropriateness: 'Appropriate',
          turnTaking: 'Independent',
        },
      ],
      responseAppropriateness: 'Improving',
      turnTaking: 'Developing',
      engagementLevel: 'High',
      aiSummary:
        'Lexi showed stronger social readiness this month. She responded better to conversation prompts, greetings, and guided turn-taking.',
    },
    activities: [
      {
        id: 1,
        activityName: 'Making Friends',
        correctAnswers: 86,
        wrongAnswers: 14,
        successRate: '86%',
        stepHistory: [
          {
            id: 1,
            stepOrder: 1,
            stepType: 'Conversation',
            question: 'What do you say when someone asks your name?',
            learnerAnswer: 'My name is Lexi',
            expectedAnswer: 'My name is Lexi',
            isCorrect: true,
          },
        ],
      },
      {
        id: 2,
        activityName: 'Turn-taking Practice',
        correctAnswers: 44,
        wrongAnswers: 9,
        successRate: '83%',
        stepHistory: [
          {
            id: 1,
            stepOrder: 1,
            stepType: 'Conversation',
            question: 'What do you say when it is your friend’s turn?',
            learnerAnswer: 'Your turn',
            expectedAnswer: 'Your turn',
            isCorrect: true,
          },
        ],
      },
    ],
  },

  year: {
    overall: [
      { label: 'Activities Completed', value: '0', icon: 'layers-outline' },
      { label: 'Words Practiced', value: '0', icon: 'text-outline' },
      { label: 'Focus Time', value: '0m', icon: 'time-outline' },
      { label: 'Inactivity Time', value: '0m', icon: 'pause-circle-outline' },
      {
        label: 'Screen Time',
        value: '0m / 0m',
        subtitle: 'No yearly data yet',
        icon: 'phone-portrait-outline',
      },
    ],
    speechTraining: {
      levels: [],
      totalCorrect: 0,
      totalNeedsPractice: 0,
      mostMissedTargets: [],
      mostImprovedSpeech: 'No yearly speech data yet.',
    },
    socialReadiness: {
      conversationAttempts: '0',
      attempts: [],
      responseAppropriateness: 'No data',
      turnTaking: 'No data',
      engagementLevel: 'No data',
      aiSummary: 'No yearly social readiness data yet.',
    },
    activities: [],
  },
};

export type ProgressGraphPoint = {
  period: string;
  speech: number;
  social: number;
};

export const progressGraphDataByPeriod: Record<
  PeriodKey,
  ProgressGraphPoint[]
> = {
  day: [
    { period: '8 AM', speech: 42, social: 30 },
    { period: '10 AM', speech: 55, social: 38 },
    { period: '12 PM', speech: 50, social: 44 },
    { period: '2 PM', speech: 68, social: 56 },
    { period: '4 PM', speech: 76, social: 64 },
  ],
  week: [
    { period: 'Mon', speech: 45, social: 30 },
    { period: 'Tue', speech: 55, social: 40 },
    { period: 'Wed', speech: 50, social: 42 },
    { period: 'Thu', speech: 65, social: 55 },
    { period: 'Fri', speech: 70, social: 60 },
    { period: 'Sat', speech: 75, social: 68 },
    { period: 'Sun', speech: 82, social: 72 },
  ],
  month: [
    { period: 'W1', speech: 48, social: 36 },
    { period: 'W2', speech: 61, social: 49 },
    { period: 'W3', speech: 72, social: 58 },
    { period: 'W4', speech: 84, social: 70 },
  ],
  year: [],
};


/**
 * Static preview helper. It keeps the uploaded demo values while replacing
 * the sample learner name with the patient currently opened by the doctor.
 * Replace this with the patient progress API response later.
 */
export function createDashboardDataForLearner(
  firstName: string,
): Record<PeriodKey, PeriodDashboardData> {
  const safeName = firstName.trim() || 'Learner';
  const serialized = JSON.stringify(dashboardData).replaceAll('Lexi', safeName);
  return JSON.parse(serialized) as Record<PeriodKey, PeriodDashboardData>;
}
