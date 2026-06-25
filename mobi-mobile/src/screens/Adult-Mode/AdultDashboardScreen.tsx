// src/screens/Adult-Mode/AdultDashboardScreen.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  NavigationProp,
  PeriodKey,
  PeriodOption,
  OverallProgressCard,
  SpeechLevelProgress,
  SpeechAttempt,
  ActivityStepHistory,
  ActivityProgressAnalysis,
  PeriodDashboardData,
  ConversationAttempt,
} from '../../types';

const bgImage = require('../../../assets/images/background.jpg');
const mobiLogo = require('../../../assets/images/mobi_logo.png');

const periodOptions: PeriodOption[] = [
  { key: 'day', label: 'Day', minDaysRequired: 1 },
  { key: 'week', label: 'Week', minDaysRequired: 7 },
  { key: 'month', label: 'Month', minDaysRequired: 30 },
  { key: 'year', label: 'Year', minDaysRequired: 365 },
];

// BACKEND READY:
// Replace later with learner.daysSinceFirstSession from your backend.
const userUsageDays = 45;

const dashboardData: Record<PeriodKey, PeriodDashboardData> = {
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

export default function AdultDashboardScreen() {
  const navigation = useNavigation<NavigationProp<'AdultDashboard'>>();
  const [page, setPage] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('day');
  const [activityIndex, setActivityIndex] = useState(0);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [speechSearchQuery, setSpeechSearchQuery] = useState('');
  const [socialSearchQuery, setSocialSearchQuery] = useState('');

  const [showExitModal, setShowExitModal] = useState(false);

  const availablePeriods = useMemo(
    () =>
      periodOptions.map((period) => ({
        ...period,
        enabled: userUsageDays >= period.minDaysRequired,
      })),
    []
  );

  const currentData = dashboardData[selectedPeriod];

  const filteredSpeechLevels = useMemo(() => {
    const query = speechSearchQuery.trim().toLowerCase();

    if (!query) return currentData.speechTraining.levels;

    return currentData.speechTraining.levels
      .map((level) => {
        const attempts = level.attempts.filter((attempt) => {
          return (
            attempt.activityName.toLowerCase().includes(query) ||
            attempt.prompt.toLowerCase().includes(query) ||
            attempt.target.toLowerCase().includes(query) ||
            attempt.learnerResponse.toLowerCase().includes(query) ||
            (attempt.supportUsed || '').toLowerCase().includes(query) ||
            (attempt.isCorrect ? 'correct' : 'needs practice').includes(query)
          );
        });

        const matchesLevel = level.level.toLowerCase().includes(query);

        return matchesLevel ? level : { ...level, attempts };
      })
      .filter(
        (level) =>
          level.level.toLowerCase().includes(query) || level.attempts.length > 0
      );
  }, [currentData, speechSearchQuery]);

  const filteredConversationAttempts = useMemo(() => {
    const query = socialSearchQuery.trim().toLowerCase();

    if (!query) return currentData.socialReadiness.attempts;

    return currentData.socialReadiness.attempts.filter((attempt) => {
      return (
        attempt.activityName.toLowerCase().includes(query) ||
        attempt.prompt.toLowerCase().includes(query) ||
        attempt.learnerResponse.toLowerCase().includes(query) ||
        attempt.expectedResponse.toLowerCase().includes(query) ||
        attempt.appropriateness.toLowerCase().includes(query) ||
        attempt.turnTaking.toLowerCase().includes(query)
      );
    });
  }, [currentData, socialSearchQuery]);

  const filteredActivities = useMemo(() => {
    const query = activitySearchQuery.trim().toLowerCase();

    if (!query) return currentData.activities;

    return currentData.activities.filter((activity) => {
      const matchesActivity =
        activity.activityName.toLowerCase().includes(query) ||
        activity.successRate.toLowerCase().includes(query);

      const matchesSteps = activity.stepHistory.some((step) => {
        return (
          step.stepType.toLowerCase().includes(query) ||
          step.question.toLowerCase().includes(query) ||
          step.learnerAnswer.toLowerCase().includes(query) ||
          step.expectedAnswer.toLowerCase().includes(query) ||
          (step.isCorrect ? 'correct' : 'needs practice').includes(query) ||
          (step.isCorrect ? 'correct' : 'wrong').includes(query)
        );
      });

      return matchesActivity || matchesSteps;
    });
  }, [currentData, activitySearchQuery]);

  const currentActivity: ActivityProgressAnalysis | undefined =
    filteredActivities[activityIndex];

  const handleSelectPeriod = (period: PeriodKey, enabled: boolean) => {
    if (!enabled) return;

    setSelectedPeriod(period);
    setActivityIndex(0);
    setActivitySearchQuery('');
    setSpeechSearchQuery('');
    setSocialSearchQuery('');
  };

const goToChildDashboard = () => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'ChildDashboard' }],
    })
  );
};

const confirmExitAdultMode = () => {
  setShowExitModal(true);
};

  const goNext = () => {
    if (page < 3) setPage(page + 1);
  };

  const goPrevious = () => {
    if (page > 1) setPage(page - 1);
    else setPage(0);
  };

  const goNextActivity = () => {
    if (activityIndex < filteredActivities.length - 1) {
      setActivityIndex(activityIndex + 1);
    }
  };

  const goPreviousActivity = () => {
    if (activityIndex > 0) {
      setActivityIndex(activityIndex - 1);
    }
  };

  const handleActivitySearchChange = (text: string) => {
    setActivitySearchQuery(text);
    setActivityIndex(0);
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        {page === 0 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           <AdultHeader
              onHomePress={confirmExitAdultMode}
              onProfilePress={() => navigation.navigate('CenterProfile')}
            />

            <PageHeader
              title="Progress Dashboard"
              subtitle="Overall learner progress"
              selectedPeriod={selectedPeriod}
              periods={availablePeriods}
              onSelect={handleSelectPeriod}
            />

            <View style={styles.overallGrid}>
              {currentData.overall.map((card) => (
                <OverallCard key={card.label} card={card} />
              ))}
            </View>

            <View style={styles.summaryPanel}>
              <Text style={styles.panelTitle}>Summary</Text>
              <Text style={styles.panelSubtitle}>
                Overview of speech training and social readiness performance.
              </Text>

              <MiniSummary
                title="Speech Training"
                value={`${currentData.speechTraining.totalCorrect} correct / ${currentData.speechTraining.totalNeedsPractice} needs practice`}
                icon="chatbubble-ellipses-outline"
              />

              <MiniSummary
                title="Social Readiness"
                value={`Engagement: ${currentData.socialReadiness.engagementLevel}`}
                icon="people-outline"
              />
            </View>

            <BottomPager pageNumber="1" onPrevious={goPrevious} onNext={goNext} />
          </ScrollView>
        )}

        {page === 1 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <TopBackHeader onBack={() => setPage(0)} />

            <PageHeader
              title="Speech Training Result"
              subtitle="Shows where each answer happened and why it needs practice"
              selectedPeriod={selectedPeriod}
              periods={availablePeriods}
              onSelect={handleSelectPeriod}
            />

            <SearchBox
              value={speechSearchQuery}
              onChangeText={setSpeechSearchQuery}
              placeholder="Search sound, word, activity, correct, needs practice"
            />

            <View style={styles.modulesPanel}>
              <InfoBox title="Correct vs Needs Practice">
                Correct: {currentData.speechTraining.totalCorrect}
                {'\n'}Needs practice: {currentData.speechTraining.totalNeedsPractice}
              </InfoBox>

              <InfoBox title="Most Missed Targets">
                {formatList(currentData.speechTraining.mostMissedTargets)}
              </InfoBox>

              <InfoBox title="Most Improved Speech">
                {currentData.speechTraining.mostImprovedSpeech}
              </InfoBox>

              {filteredSpeechLevels.length > 0 ? (
                filteredSpeechLevels.map((item) => (
                  <SpeechLevelCard key={item.level} item={item} />
                ))
              ) : (
                <EmptyCard message={`No speech training result found for "${speechSearchQuery}".`} />
              )}
            </View>

            <BottomPager pageNumber="2" onPrevious={goPrevious} onNext={goNext} />
          </ScrollView>
        )}

        {page === 2 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <TopBackHeader onBack={() => setPage(0)} />

            <PageHeader
              title="Social Readiness Result"
              subtitle="Conversation, response, turn-taking, and engagement"
              selectedPeriod={selectedPeriod}
              periods={availablePeriods}
              onSelect={handleSelectPeriod}
            />

            <SearchBox
              value={socialSearchQuery}
              onChangeText={setSocialSearchQuery}
              placeholder="Search conversation attempts"
            />

            <View style={styles.modulesPanel}>
              <InfoBox
                title="Conversation Attempts"
                value={currentData.socialReadiness.conversationAttempts}
              />

              {filteredConversationAttempts.length > 0 ? (
                filteredConversationAttempts.map((attempt) => (
                  <ConversationAttemptCard key={attempt.id} attempt={attempt} />
                ))
              ) : (
                <EmptyCard message={`No conversation attempt found for "${socialSearchQuery}".`} />
              )}

              <InfoBox title="Response Appropriateness">
                {currentData.socialReadiness.responseAppropriateness}
              </InfoBox>

              <InfoBox title="Turn-taking">{currentData.socialReadiness.turnTaking}</InfoBox>
              <InfoBox title="Engagement Level">{currentData.socialReadiness.engagementLevel}</InfoBox>
              <InfoBox title="AI Social Readiness Summary">
                {currentData.socialReadiness.aiSummary}
              </InfoBox>
            </View>

            <BottomPager pageNumber="3" onPrevious={goPrevious} onNext={goNext} />
          </ScrollView>
        )}

        {page === 3 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <TopBackHeader onBack={() => setPage(0)} />

            <PageHeader
              title="Per Activity Analysis"
              subtitle="Correct/wrong answers and step-by-step answer history"
              selectedPeriod={selectedPeriod}
              periods={availablePeriods}
              onSelect={handleSelectPeriod}
            />

            <SearchBox
              value={activitySearchQuery}
              onChangeText={handleActivitySearchChange}
              placeholder="Search activity, answer, step, correct, wrong"
            />

            <View style={styles.activityPanel}>
              {currentActivity ? (
                <>
                  <Text style={styles.bulletTitle}>{currentActivity.activityName}</Text>

                  <View style={styles.activityMetricCard}>
                    <Text style={styles.reportLabel}>Correct Answers</Text>
                    <Text style={styles.reportValue}>{currentActivity.correctAnswers}</Text>
                  </View>

                  <View style={styles.activityMetricCard}>
                    <Text style={styles.reportLabel}>Needs Practice</Text>
                    <Text style={styles.reportValue}>{currentActivity.wrongAnswers}</Text>
                  </View>

                  <View style={styles.activityMetricCard}>
                    <Text style={styles.reportLabel}>Success Rate</Text>
                    <Text style={styles.reportValue}>{currentActivity.successRate}</Text>
                  </View>

                  <Text style={styles.sectionTitle}>Step-by-step Answer History</Text>

                  {currentActivity.stepHistory.map((step) => (
                    <StepHistoryCard key={step.id} step={step} />
                  ))}

                  <View style={styles.activityNavRow}>
                    <Pressable disabled={activityIndex === 0} onPress={goPreviousActivity}>
                      <Text
                        style={[
                          styles.activityNavText,
                          activityIndex === 0 && styles.disabledNextActivity,
                        ]}
                      >
                        ← Previous Activity
                      </Text>
                    </Pressable>

                    <Pressable
                      disabled={activityIndex >= filteredActivities.length - 1}
                      onPress={goNextActivity}
                    >
                      <Text
                        style={[
                          styles.activityNavText,
                          activityIndex >= filteredActivities.length - 1 &&
                            styles.disabledNextActivity,
                        ]}
                      >
                        {activityIndex >= filteredActivities.length - 1
                          ? 'No next activity'
                          : 'Next Activity →'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <EmptyCard message={`No activity found for "${activitySearchQuery}".`} />
              )}
            </View>

            <BottomPager pageNumber="4" onPrevious={goPrevious} onNext={goNext} />
          </ScrollView>
        )}

        <Modal transparent visible={showExitModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.exitModal}>
              <Text style={styles.exitTitle}>Exit Adult Mode?</Text>
              <Text style={styles.exitMessage}>
                Are you sure you want to exit? You will need to enter your PIN again to return to Adult Mode.
              </Text>

              <View style={styles.exitActions}>
                <Pressable style={styles.cancelButton} onPress={() => setShowExitModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={styles.exitButton}
                  onPress={() => {
                    setShowExitModal(false);
                    goToChildDashboard();
                  }}
                >
                  <Text style={styles.exitText}>Exit</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <AdultBottomNav active="progress" navigation={navigation} />
      </SafeAreaView>
    </ImageBackground>
  );
}

function formatList(items: string[]) {
  if (!items || items.length === 0) return 'No data available';
  return items.map((item) => `• ${item}`).join('\n');
}

function AdultHeader({
  onHomePress,
  onProfilePress,
}: {
  onHomePress: () => void;
  onProfilePress: () => void;
}) {
  return (
    <View style={styles.header}>
      <Image source={mobiLogo} style={styles.logo} />

      <View style={styles.headerRight}>
        <Pressable
          style={({ pressed }) => [
            styles.headerIconButton,
            pressed && { opacity: 0.6 },
          ]}
          onPress={onHomePress}
          hitSlop={12}
        >
          <Ionicons name="home" size={25} color="#B48BC7" />
        </Pressable>

        <Pressable
          style={styles.profileButton}
          onPress={onProfilePress}
          hitSlop={12}
        >
          <Ionicons name="person-circle" size={40} color="#B48BC7" />
        </Pressable>
      </View>
    </View>
  );
}

function PageHeader({
  title,
  subtitle,
  selectedPeriod,
  periods,
  onSelect,
}: {
  title: string;
  subtitle: string;
  selectedPeriod: PeriodKey;
  periods: Array<PeriodOption & { enabled: boolean }>;
  onSelect: (period: PeriodKey, enabled: boolean) => void;
}) {
  return (
    <View style={styles.pageTitleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.mainTitle}>{title}</Text>
        <Text style={styles.subTitle}>{subtitle}</Text>
      </View>

      <PeriodDropdown
        selectedPeriod={selectedPeriod}
        periods={periods}
        onSelect={onSelect}
      />
    </View>
  );
}

function PeriodDropdown({
  selectedPeriod,
  periods,
  onSelect,
}: {
  selectedPeriod: PeriodKey;
  periods: Array<PeriodOption & { enabled: boolean }>;
  onSelect: (period: PeriodKey, enabled: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = periods.find((item) => item.key === selectedPeriod);

  return (
    <View style={styles.dropdownWrapper}>
      <Pressable style={styles.dropdownButton} onPress={() => setOpen(!open)}>
        <Text style={styles.dropdownButtonText}>{selected?.label}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={13} color="#B48BC7" />
      </Pressable>

      {open && (
        <View style={styles.dropdownMenu}>
          {periods.map((item) => {
            const isSelected = selectedPeriod === item.key;

            return (
              <Pressable
                key={item.key}
                disabled={!item.enabled}
                style={[
                  styles.dropdownItem,
                  isSelected && styles.activeDropdownItem,
                  !item.enabled && styles.disabledDropdownItem,
                ]}
                onPress={() => {
                  onSelect(item.key, item.enabled);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    isSelected && styles.activeDropdownItemText,
                    !item.enabled && styles.disabledDropdownItemText,
                  ]}
                >
                  {item.label}
                </Text>

                {!item.enabled && <Ionicons name="lock-closed-outline" size={11} color="#AAA" />}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function SearchBox({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search-outline" size={13} color="#777" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={styles.searchInput}
      />

      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={15} color="#999" />
        </Pressable>
      )}
    </View>
  );
}

function OverallCard({ card }: { card: OverallProgressCard }) {
  return (
    <View style={styles.overallCard}>
      <Ionicons name={card.icon as any} size={20} color="#B48BC7" />
      <Text style={styles.overallValue}>{card.value}</Text>
      <Text style={styles.overallLabel}>{card.label}</Text>
      {card.subtitle && <Text style={styles.overallSubtitle}>{card.subtitle}</Text>}
    </View>
  );
}

function MiniSummary({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <View style={styles.miniSummaryCard}>
      <Ionicons name={icon as any} size={18} color="#B48BC7" />
      <View style={{ flex: 1 }}>
        <Text style={styles.miniSummaryTitle}>{title}</Text>
        <Text style={styles.miniSummaryValue}>{value}</Text>
      </View>
    </View>
  );
}

function SpeechLevelCard({ item }: { item: SpeechLevelProgress }) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoBoxHeader}>
        <Text style={styles.infoBoxTitle}>{item.level}</Text>
        <Text style={styles.infoBoxValue}>{item.accuracy}</Text>
      </View>

      <Text style={styles.infoBoxBody}>
        Correct: {item.correct}
        {'\n'}Needs practice: {item.needsPractice}
      </Text>

      <Text style={styles.sectionTitle}>Attempt History</Text>

      {item.attempts.map((attempt) => (
        <SpeechAttemptCard key={attempt.id} attempt={attempt} />
      ))}
    </View>
  );
}

function SpeechAttemptCard({ attempt }: { attempt: SpeechAttempt }) {
  return (
    <View style={styles.answerGroup}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{attempt.activityName}</Text>

        <Text style={[styles.stepBadge, attempt.isCorrect ? styles.correctBadge : styles.wrongBadge]}>
          {attempt.isCorrect ? 'Correct' : 'Needs Practice'}
        </Text>
      </View>

      <Text style={styles.stepText}>Prompt: {attempt.prompt}</Text>
      <Text style={styles.stepText}>Target: {attempt.target}</Text>
      <Text style={styles.stepText}>Learner: {attempt.learnerResponse}</Text>

      {!attempt.isCorrect && attempt.supportUsed && (
        <Text style={styles.stepExpected}>Support used: {attempt.supportUsed}</Text>
      )}
    </View>
  );
}

function ConversationAttemptCard({ attempt }: { attempt: ConversationAttempt }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{attempt.activityName}</Text>
        <Text style={styles.conversationBadge}>{attempt.appropriateness}</Text>
      </View>

      <Text style={styles.stepText}>Prompt: {attempt.prompt}</Text>
      <Text style={styles.stepText}>Learner: {attempt.learnerResponse}</Text>
      <Text style={styles.stepExpected}>Expected: {attempt.expectedResponse}</Text>
      <Text style={styles.stepText}>Turn-taking: {attempt.turnTaking}</Text>
    </View>
  );
}

function StepHistoryCard({ step }: { step: ActivityStepHistory }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>
          Step {step.stepOrder} · {step.stepType}
        </Text>

        <Text style={[styles.stepBadge, step.isCorrect ? styles.correctBadge : styles.wrongBadge]}>
          {step.isCorrect ? 'Correct' : 'Needs Practice'}
        </Text>
      </View>

      <Text style={styles.stepText}>Question: {step.question}</Text>
      <Text style={styles.stepText}>Answer: {step.learnerAnswer}</Text>

      {!step.isCorrect && (
        <Text style={styles.stepExpected}>Expected: {step.expectedAnswer}</Text>
      )}
    </View>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <View style={styles.emptyDataCard}>
      <Ionicons name="information-circle-outline" size={18} color="#B48BC7" />
      <Text style={styles.emptyDataText}>{message}</Text>
    </View>
  );
}

function TopBackHeader({ onBack }: { onBack: () => void }) {
  return (
    <Pressable onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back" size={21} color="#111" />
    </Pressable>
  );
}

function InfoBox({ title, value, children }: any) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoBoxHeader}>
        <Text style={styles.infoBoxTitle}>{title}</Text>
        {value && <Text style={styles.infoBoxValue}>{value}</Text>}
      </View>

      {children && <Text style={styles.infoBoxBody}>{children}</Text>}
    </View>
  );
}

function BottomPager({ pageNumber, onPrevious, onNext }: any) {
  return (
    <View style={styles.pagerRow}>
      <Pressable style={styles.pagerButton} onPress={onPrevious}>
        <Ionicons name="chevron-back" size={13} color="#888" />
      </Pressable>

      <Pressable style={styles.pagerButton} onPress={onNext}>
        <Ionicons name="chevron-forward" size={13} color="#888" />
      </Pressable>

      <Text style={styles.pageCount}>{pageNumber} of 4</Text>
    </View>
  );
}

function AdultBottomNav({ active, navigation }: any) {
  const navItems = [
    { key: 'progress', icon: 'star', route: 'AdultDashboard' },
    { key: 'settings', icon: 'settings', route: 'Settings' },
    { key: 'notifications', icon: 'notifications', route: 'Notifications' },
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = active === item.key;

        return (
          <Pressable
            key={item.key}
            style={[styles.navButton, isActive && styles.activeNavButton]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Ionicons
              name={item.icon as any}
              size={isActive ? 28 : 23}
              color={isActive ? '#B48BC7' : '#999'}
            />

            {isActive && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 85 },

  header: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: { width: 76, height: 46, resizeMode: 'contain' },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  pageTitleRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    zIndex: 20,
  },

  mainTitle: { fontSize: 21, fontWeight: '900', color: '#111' },
  subTitle: { fontSize: 11, color: '#777', marginTop: 3, lineHeight: 15 },

 // dropdownWrapper: { position: 'relative', zIndex: 100, elevation: 100 },

  dropdownButton: {
    minWidth: 92,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#F7EAF7',
    borderWidth: 1,
    borderColor: '#E8CFE8',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownButtonText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B48BC7',
  },

  // dropdownMenu: {
  //   position: 'absolute',
  //   top: 36,
  //   right: 0,
  //   width: 112,
  //   backgroundColor: '#FFFFFF',
  //   borderRadius: 14,
  //   paddingVertical: 6,
  //   shadowColor: '#000',
  //   shadowOpacity: 0.16,
  //   shadowRadius: 8,
  //   elevation: 20,
  //   zIndex: 999,
  // },

  dropdownItem: {
    minHeight: 34,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activeDropdownItem: { backgroundColor: '#F7EAF7' },
  disabledDropdownItem: { opacity: 0.55 },
  dropdownItemText: { fontSize: 10, fontWeight: '800', color: '#555' },
  activeDropdownItemText: { color: '#B48BC7' },
  disabledDropdownItemText: { color: '#AAA' },

  overallGrid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  overallCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    elevation: 3,
  },

  overallValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
  },

  overallLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#777',
    fontWeight: '700',
  },

  overallSubtitle: {
    marginTop: 2,
    fontSize: 8,
    color: '#999',
  },

  summaryPanel: {
    marginTop: 16,
    backgroundColor: 'rgba(238,205,238,0.96)',
    borderRadius: 26,
    padding: 18,
  },

  panelTitle: { fontSize: 17, fontWeight: '900', color: '#111' },
  panelSubtitle: { fontSize: 9, color: '#777', marginTop: 2 },

  miniSummaryCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 2,
  },

  miniSummaryTitle: { fontSize: 11, fontWeight: '900', color: '#111' },
  miniSummaryValue: { fontSize: 10, color: '#555', marginTop: 3 },

  modulesPanel: {
    marginTop: 16,
    backgroundColor: 'rgba(238,205,238,0.96)',
    borderRadius: 26,
    padding: 18,
  },

  infoBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  infoBoxHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBoxTitle: { fontSize: 11, fontWeight: '900', color: '#111' },
  infoBoxValue: { fontSize: 12, fontWeight: '900', color: '#B48BC7' },
  infoBoxBody: { fontSize: 10, color: '#333', lineHeight: 15, marginTop: 6 },

  answerGroup: {
    marginTop: 10,
    backgroundColor: '#F8F2F8',
    borderRadius: 12,
    padding: 10,
  },

  activityPanel: {
    marginTop: 16,
    backgroundColor: 'rgba(238,205,238,0.96)',
    borderRadius: 26,
    padding: 18,
  },

  activityMetricCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },

  bulletTitle: { fontSize: 16, fontWeight: '900', color: '#111' },
  reportLabel: { fontSize: 10, color: '#777' },
  reportValue: { fontSize: 17, fontWeight: '900', color: '#B48BC7', marginTop: 4 },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 2,
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
  },

  stepCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },

  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stepTitle: { fontSize: 11, fontWeight: '900', color: '#111', flex: 1 },

  stepBadge: {
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },

  conversationBadge: {
    fontSize: 8,
    fontWeight: '900',
    color: '#B48BC7',
    backgroundColor: '#F7EAF7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },

  correctBadge: { color: '#4D8B57', backgroundColor: '#E7F6EA' },
  wrongBadge: { color: '#C45A5A', backgroundColor: '#FCEAEA' },

  stepText: {
    marginTop: 6,
    fontSize: 10,
    color: '#333',
    lineHeight: 14,
  },

  stepExpected: {
    marginTop: 6,
    fontSize: 10,
    color: '#C45A5A',
    fontWeight: '700',
  },

  emptyDataCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 2,
  },

  emptyDataText: {
    flex: 1,
    fontSize: 10,
    color: '#777',
    lineHeight: 15,
  },

  searchBox: {
    marginTop: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchInput: { flex: 1, fontSize: 10, marginLeft: 6 },

  backButton: { marginTop: 16, marginBottom: 8 },

  activityNavRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  activityNavText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B48BC7',
  },

  disabledNextActivity: { color: '#999' },

  pagerRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pagerButton: {
    width: 32,
    height: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#AAA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFF',
  },

  pageCount: {
    marginLeft: 'auto',
    fontSize: 10,
    color: '#777',
  },

  bottomNav: {
    position: 'absolute',
    left: 75,
    right: 75,
    bottom: 14,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 5,
  },

  navButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeNavButton: {
    backgroundColor: '#F2DDF2',
    borderRadius: 12,
  },

  activeDot: {
    position: 'absolute',
    bottom: 3,
    width: 18,
    height: 3,
    borderRadius: 4,
    backgroundColor: '#B48BC7',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  exitModal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    elevation: 8,
  },

  exitTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
  },

  exitMessage: {
    marginTop: 10,
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    textAlign: 'center',
  },

  exitActions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  exitButton: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#B48BC7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#555',
  },

  exitText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
