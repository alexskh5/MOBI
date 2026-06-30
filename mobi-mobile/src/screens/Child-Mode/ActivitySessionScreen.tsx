import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {
  NavigationProp,
  RoutePropType,
} from '../../types';

import TeachSessionStepScreen from '../../components/Child-Mode/session/TeachSessionStepScreen';
import ShowChooseSessionStepScreen from '../../components/Child-Mode/session/ShowChooseSessionStepScreen';
import AskSessionStepScreen from '../../components/Child-Mode/session/AskSessionStepScreen';
import ConversationSessionStepScreen from '../../components/Child-Mode/session/ConversationSessionStepScreen';
import DoItSessionStepScreen from '../../components/Child-Mode/session/DoItSessionStepScreen';
import FeedbackSessionStepScreen from '../../components/Child-Mode/session/FeedbackSessionStepScreen';
import SessionVoiceControl from '../../components/Child-Mode/session/SessionVoiceControl';

import {
  ActivitySessionStep,
  RuntimeActivity,
  SessionStatus,
  SpeakerStatus,
  StepResult,
  getPromptText,
} from '../../components/Child-Mode/session/SessionTypes';

const bgImage = require('../../../assets/images/background.jpg');
const fallbackImage = require('../../../assets/images/cow.jpg');

export default function ActivitySessionScreen() {
  const navigation =
    useNavigation<NavigationProp<'ActivitySession'>>();

  const route =
    useRoute<RoutePropType<'ActivitySession'>>();

  const activity = route.params.activity as RuntimeActivity;

  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isSmallPhone = height < 700;

  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>('intro');

  const [speakerStatus, setSpeakerStatus] =
    useState<SpeakerStatus>('idle');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);

  const [selectedChoiceId, setSelectedChoiceId] =
    useState<number | null>(null);

  const [lastLearnerResponse, setLastLearnerResponse] =
    useState('');

  const [stepResults, setStepResults] =
    useState<StepResult[]>([]);

  const pulse = useRef(new Animated.Value(0)).current;
  const confettiFall = useRef(new Animated.Value(0)).current;

  const animationRef =
    useRef<Animated.CompositeAnimation | null>(null);

  const steps = useMemo(
    () => buildSessionSteps(activity),
    [activity],
  );

  const currentStep = steps[currentIndex];

  const progressPercent =
    ((currentIndex + 1) / steps.length) * 100;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  const lastResultCorrect =
    stepResults[stepResults.length - 1]?.is_correct ?? null;

  const contentMaxWidth = isTablet ? 720 : 520;

  const imageSize = {
    width: '100%',
    height: isLandscape
      ? Math.min(height * 0.34, 230)
      : isSmallPhone
      ? 190
      : 260,
  };

  useEffect(() => {
    if (speakerStatus === 'idle') {
      animationRef.current?.stop();
      pulse.setValue(0);
      return;
    }

    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: speakerStatus === 'appSpeaking' ? 520 : 380,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: speakerStatus === 'appSpeaking' ? 520 : 380,
          useNativeDriver: true,
        }),
      ]),
    );

    animationRef.current.start();

    return () => animationRef.current?.stop();
  }, [speakerStatus, pulse]);

  useEffect(() => {
    if (sessionStatus !== 'completed') return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiFall, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(confettiFall, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [sessionStatus, confettiFall]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1.45],
  });

  const confettiY = confettiFall.interpolate({
    inputRange: [0, 1],
    outputRange: [-70, 520],
  });

  const goToChildDashboard = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'ChildDashboard' }],
      }),
    );
  };

  const playPrompt = () => {
    setSpeakerStatus('appSpeaking');

    setTimeout(() => {
      setSpeakerStatus('idle');
    }, 2200);
  };

  const startSession = () => {
    setSessionStatus('active');
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setLastLearnerResponse('');

    setTimeout(playPrompt, 250);
  };

  const stopSession = () => {
    setShowExitModal(false);
    goToChildDashboard();
  };

  const handleMicPress = () => {
    if (!currentStep) return;

    if (speakerStatus === 'userSpeaking') {
      setSpeakerStatus('idle');

      const simulatedResponse =
        getSimulatedLearnerResponse(currentStep);

      setLastLearnerResponse(simulatedResponse);

      saveStepResult(
        currentStep,
        simulatedResponse,
      );

      return;
    }

    setSpeakerStatus('userSpeaking');
  };

  const saveStepResult = (
    step: ActivitySessionStep,
    learnerResponse: string,
  ) => {
    const result: StepResult = {
      step_id: step.id,
      step_order: step.step_order,
      step_type: step.step_type,

      prompt: getPromptText(step),

      learner_response: learnerResponse,

      selected_choice_id: selectedChoiceId,

      is_correct: evaluateAnswer(
        step,
        learnerResponse,
        selectedChoiceId,
      ),

      attempts: 1,

      started_at: new Date().toISOString(),
      answered_at: new Date().toISOString(),
    };

    setStepResults((current) => {
      const withoutSameStep = current.filter(
        (item) => item.step_id !== step.id,
      );

      return [
        ...withoutSameStep,
        result,
      ];
    });
  };

  const next = () => {
    if (isLast) {
      setSessionStatus('completed');
      return;
    }

    setCurrentIndex((value) => value + 1);

    setSelectedChoiceId(null);
    setLastLearnerResponse('');

    setTimeout(playPrompt, 250);
  };

  const previous = () => {
    if (isFirst) return;

    setCurrentIndex((value) => value - 1);

    setSelectedChoiceId(null);
    setLastLearnerResponse('');

    setTimeout(playPrompt, 250);
  };

  const statusText =
    speakerStatus === 'appSpeaking'
      ? 'MOBI is speaking...'
      : speakerStatus === 'userSpeaking'
      ? 'Listening... tap again to stop and send.'
      : 'Tap the microphone when ready.';

  if (sessionStatus === 'intro') {
    return (
      <ImageBackground
        source={bgImage}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.topBar}>
            <Pressable
              style={styles.iconButton}
              onPress={() => setShowExitModal(true)}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#1F1D28"
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.introContent}
          >
            <View
              style={[
                styles.introCard,
                {
                  maxWidth: contentMaxWidth,
                },
              ]}
            >
              <Text style={styles.introLabel}>
                Ready to learn?
              </Text>

              <Text style={styles.introTitle}>
                {activity.title}
              </Text>

              <Text style={styles.introDescription}>
                {activity.teach_prompt ||
                  'MOBI will guide the learner with simple prompts, visuals, and voice practice.'}
              </Text>

              <Image
                source={
                  activity.activity_image_url
                    ? { uri: activity.activity_image_url }
                    : fallbackImage
                }
                style={[
                  styles.introImage,
                  {
                    height: isSmallPhone ? 190 : 260,
                  },
                ]}
              />

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>
                    {activity.level || 'Beginner'}
                  </Text>
                </View>

                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>
                    {activity.difficulty || 'Guided'}
                  </Text>
                </View>

                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>
                    {steps.length} steps
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.startButton}
                onPress={startSession}
              >
                <Ionicons
                  name="play"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.startText}>
                  Start Session
                </Text>
              </Pressable>

              <Pressable
                style={styles.cancelIntroButton}
                onPress={() => setShowExitModal(true)}
              >
                <Text style={styles.cancelIntroText}>
                  Cancel Session
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          <ExitSessionModal
            visible={showExitModal}
            onCancel={() => setShowExitModal(false)}
            onStop={stopSession}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (sessionStatus === 'completed') {
    return (
      <ImageBackground
        source={bgImage}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <CompletedScreen
            confettiY={confettiY}
            activityTitle={activity.title}
            onPlayNext={goToChildDashboard}
            onSkip={goToChildDashboard}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconButton}
            onPress={() => setShowExitModal(true)}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#1F1D28"
            />
          </Pressable>

          <Text style={styles.stepCounter}>
            Step {currentIndex + 1} of {steps.length}
          </Text>

          <Pressable
            style={styles.replayTopButton}
            onPress={playPrompt}
          >
            <Ionicons
              name="volume-high"
              size={17}
              color="#8759D6"
            />

            <Text style={styles.replayTopText}>
              Replay
            </Text>
          </Pressable>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.activeContent}
        >
          <View
            style={[
              styles.screenContent,
              {
                maxWidth: contentMaxWidth,
              },
            ]}
          >
            <View style={styles.titleBlock}>
              <Text style={styles.pageTitle}>
                {activity.title}
              </Text>

              <Text style={styles.pageSubtitle}>
                {activity.category || 'Learning Session'}
              </Text>
            </View>

            <RenderCurrentSession
              step={currentStep}
              imageSize={imageSize}
              selectedChoiceId={selectedChoiceId}
              onSelectChoice={setSelectedChoiceId}
              lastLearnerResponse={lastLearnerResponse}
              onReplayPrompt={playPrompt}
              fallbackImage={fallbackImage}
              lastResultCorrect={lastResultCorrect}
            />

            <SessionVoiceControl
              speakerStatus={speakerStatus}
              scale={scale}
              statusText={statusText}
              onMicPress={handleMicPress}
              learnerResponse={lastLearnerResponse}
            />

            <View style={styles.navRow}>
              <Pressable
                disabled={isFirst}
                style={[
                  styles.previousButton,
                  isFirst && styles.disabledButton,
                ]}
                onPress={previous}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={isFirst ? '#AAA' : '#8759D6'}
                />

                <Text
                  style={[
                    styles.previousText,
                    isFirst && styles.disabledText,
                  ]}
                >
                  Previous
                </Text>
              </Pressable>

              <Pressable
                style={styles.nextButton}
                onPress={next}
              >
                <Text style={styles.nextText}>
                  {isLast ? 'Finish' : 'Next'}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <ExitSessionModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onStop={stopSession}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

function RenderCurrentSession({
  step,
  imageSize,
  selectedChoiceId,
  onSelectChoice,
  lastLearnerResponse,
  onReplayPrompt,
  fallbackImage,
  lastResultCorrect,
}: {
  step: ActivitySessionStep;
  imageSize: {
    width: number | string;
    height: number;
  };
  selectedChoiceId: number | null;
  onSelectChoice: (id: number) => void;
  lastLearnerResponse: string;
  onReplayPrompt: () => void;
  fallbackImage: any;
  lastResultCorrect: boolean | null;
}) {
  switch (step.step_type) {
    case 'teach':
      return (
        <TeachSessionStepScreen
          step={step}
          imageSize={imageSize as any}
          lastLearnerResponse={lastLearnerResponse}
          onReplayPrompt={onReplayPrompt}
          fallbackImage={fallbackImage}
        />
      );

    case 'show_choose':
      return (
        <ShowChooseSessionStepScreen
          step={step}
          imageSize={imageSize as any}
          selectedChoiceId={selectedChoiceId}
          onSelectChoice={onSelectChoice}
          lastLearnerResponse={lastLearnerResponse}
          onReplayPrompt={onReplayPrompt}
        />
      );

    case 'ask':
      return (
        <AskSessionStepScreen
          step={step}
          imageSize={imageSize as any}
          lastLearnerResponse={lastLearnerResponse}
          onReplayPrompt={onReplayPrompt}
          fallbackImage={fallbackImage}
        />
      );

    case 'conversation':
      return (
        <ConversationSessionStepScreen
          step={step}
          imageSize={imageSize as any}
          lastLearnerResponse={lastLearnerResponse}
          onReplayPrompt={onReplayPrompt}
          fallbackImage={fallbackImage}
        />
      );

    case 'do_it':
      return (
        <DoItSessionStepScreen
          step={step}
          imageSize={imageSize as any}
          lastLearnerResponse={lastLearnerResponse}
          onReplayPrompt={onReplayPrompt}
          fallbackImage={fallbackImage}
        />
      );

    case 'feedback':
      return (
        <FeedbackSessionStepScreen
          step={step}
          imageSize={imageSize as any}
          lastLearnerResponse={lastLearnerResponse}
          onReplayPrompt={onReplayPrompt}
          fallbackImage={fallbackImage}
          lastResultCorrect={lastResultCorrect}
        />
      );

    default:
      return null;
  }
}

function buildSessionSteps(activity: RuntimeActivity): ActivitySessionStep[] {
  if (activity.steps && activity.steps.length > 0) {
    return activity.steps
      .map((step, index) => ({
        ...step,
        step_order: step.step_order || index + 1,
      }))
      .sort((a, b) => a.step_order - b.step_order);
  }

  return [
    {
      id: 1,
      step_order: 1,
      step_type: 'teach',
      lesson: activity.teach_prompt || 'Let us learn about this.',
      prompt: activity.teach_prompt || 'Let us learn about this.',
      media: [
        {
          id: 1,
          type: 'image',
          url: activity.activity_image_url,
        },
      ],
    },
    {
      id: 2,
      step_order: 2,
      step_type: 'show_choose',
      question: 'Which one is the correct answer?',
      prompt: 'Which one is the correct answer?',
      choices: [
        {
          id: 1,
          label: 'Choice A',
          image_url: activity.activity_image_url,
          is_correct: true,
        },
        {
          id: 2,
          label: 'Choice B',
          is_correct: false,
        },
      ],
    },
    {
      id: 3,
      step_order: 3,
      step_type: 'ask',
      question: activity.ask_prompt || 'What is this?',
      prompt: activity.ask_prompt || 'What is this?',
      expected_answers: splitAnswers(activity.target_answers),
      accepted_variations: splitAnswers(activity.acceptable_answers),
      media: [
        {
          id: 1,
          type: 'image',
          url: activity.activity_image_url,
        },
      ],
    },
    {
      id: 4,
      step_order: 4,
      step_type: 'do_it',
      instruction: 'Can you do the action?',
      prompt: 'Can you do the action?',
      materials_needed: ['Activity picture'],
      media: [
        {
          id: 1,
          type: 'image',
          url: activity.activity_image_url,
        },
      ],
    },
    {
      id: 5,
      step_order: 5,
      step_type: 'conversation',
      prompt: 'Let us talk about what you learned.',
      topics: ['Tell me what you know about this.'],
      media: [
        {
          id: 1,
          type: 'image',
          url: activity.activity_image_url,
        },
      ],
    },
    {
      id: 6,
      step_order: 6,
      step_type: 'feedback',
      correct_feedback: 'Great job!',
      wrong_feedback: "That's okay. Let us try again next time.",
      prompt: 'Great job!',
    },
  ];
}

function splitAnswers(value?: string) {
  if (!value) return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function evaluateAnswer(
  step: ActivitySessionStep,
  learnerResponse: string,
  selectedChoiceId: number | null,
) {
  if (
    step.step_type === 'teach' ||
    step.step_type === 'do_it' ||
    step.step_type === 'feedback'
  ) {
    return null;
  }

  if (step.step_type === 'show_choose') {
    const selectedChoice = step.choices?.find(
      (choice) => choice.id === selectedChoiceId,
    );

    return selectedChoice ? selectedChoice.is_correct : null;
  }

  const correctAnswers = [
    ...(step.expected_answers || []),
    ...(step.accepted_variations || []),
  ].map((item) => item.toLowerCase());

  if (correctAnswers.length === 0) return null;

  return correctAnswers.some((answer) =>
    learnerResponse.toLowerCase().includes(answer),
  );
}

function getSimulatedLearnerResponse(step: ActivitySessionStep) {
  if (step.step_type === 'show_choose') {
    return 'Selected an answer.';
  }

  if (
    step.expected_answers &&
    step.expected_answers.length > 0
  ) {
    return step.expected_answers[0];
  }

  if (step.step_type === 'conversation') {
    return 'Learner response saved.';
  }

  if (step.step_type === 'do_it') {
    return 'Action completed.';
  }

  return 'Response saved.';
}

function CompletedScreen({
  confettiY,
  activityTitle,
  onPlayNext,
  onSkip,
}: {
  confettiY: Animated.AnimatedInterpolation<string | number>;
  activityTitle: string;
  onPlayNext: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={styles.completedContainer}>
      <Animated.View
        style={[
          styles.confettiLayer,
          {
            transform: [
              {
                translateY: confettiY,
              },
            ],
          },
        ]}
      >
        <Text style={styles.confettiText}>
          âœ¦  â˜…  âœ¦  â˜…  âœ¦
        </Text>

        <Text style={styles.confettiText}>
          â˜…  âœ¦  â˜…  âœ¦  â˜…
        </Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.completedScroll}
      >
        <View style={styles.completedCard}>
          <View style={styles.completedIcon}>
            <Ionicons
              name="star"
              size={54}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.completedTitle}>
            Great job!
          </Text>

          <Text style={styles.completedMessage}>
            You finished {activityTitle}.
          </Text>

          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationLabel}>
              AI Recommended Next
            </Text>

            <Text style={styles.recommendationTitle}>
              Greeting Practice
            </Text>

            <Text style={styles.recommendationText}>
              Recommended based on the learner's current progress.
            </Text>

            <Pressable
              style={styles.playRecommendedButton}
              onPress={onPlayNext}
            >
              <Ionicons
                name="play"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.playRecommendedText}>
                Play Next Activity
              </Text>
            </Pressable>

            <Pressable
              style={styles.skipButton}
              onPress={onSkip}
            >
              <Text style={styles.skipText}>
                Skip and return to dashboard
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ExitSessionModal({
  visible,
  onCancel,
  onStop,
}: {
  visible: boolean;
  onCancel: () => void;
  onStop: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.exitOverlay}>
        <View style={styles.exitCard}>
          <Text style={styles.exitTitle}>
            Stop Session?
          </Text>

          <Text style={styles.exitMessage}>
            Are you sure you want to stop this activity? Your progress will still be recorded.
          </Text>

          <Pressable
            style={styles.continueButton}
            onPress={onCancel}
          >
            <Text style={styles.continueText}>
              Continue Session
            </Text>
          </Pressable>

          <Pressable
            style={styles.stopButton}
            onPress={onStop}
          >
            <Text style={styles.stopText}>
              Stop Session
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
  },

  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 16,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#7B4BC5',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  stepCounter: {
    flex: 1,

    textAlign: 'center',

    fontSize: 14,
    fontWeight: '900',
    color: '#1F1D28',
  },

  replayTopButton: {
    height: 42,

    borderRadius: 21,

    backgroundColor: '#F1E7FF',

    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  replayTopText: {
    marginLeft: 6,

    fontSize: 12,
    fontWeight: '900',
    color: '#8759D6',
  },

  progressWrap: {
    paddingHorizontal: 24,
  },

  progressTrack: {
    height: 8,

    borderRadius: 99,

    backgroundColor: '#EDE9FE',

    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',

    borderRadius: 99,

    backgroundColor: '#8759D6',
  },

  activeContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,

    alignItems: 'center',
  },

  screenContent: {
    width: '100%',
    gap: 16,
  },

  titleBlock: {
    alignItems: 'center',
    marginBottom: 2,
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1F1D28',

    textAlign: 'center',
    lineHeight: 36,
  },

  pageSubtitle: {
    marginTop: 5,

    fontSize: 14,
    fontWeight: '800',
    color: '#6B7280',

    textAlign: 'center',
  },

  introContent: {
    flexGrow: 1,

    paddingHorizontal: 22,
    paddingBottom: 34,

    alignItems: 'center',
    justifyContent: 'center',
  },

  introCard: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 34,

    padding: 22,

    alignItems: 'center',

    shadowColor: '#7B4BC5',
    shadowOpacity: 0.11,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 6,
  },

  introLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#8759D6',

    textTransform: 'uppercase',
  },

  introTitle: {
    marginTop: 8,

    fontSize: 30,
    fontWeight: '900',
    color: '#1F1D28',

    textAlign: 'center',
  },

  introDescription: {
    marginTop: 8,

    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',

    lineHeight: 20,
    textAlign: 'center',
  },

  introImage: {
    width: '100%',

    marginTop: 18,

    borderRadius: 28,

    resizeMode: 'contain',

    backgroundColor: '#F7F1FB',
  },

  metaRow: {
    marginTop: 18,

    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },

  metaPill: {
    backgroundColor: '#F1E7FF',

    borderRadius: 14,

    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  metaText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8759D6',
  },

  startButton: {
    width: '100%',
    height: 54,

    marginTop: 22,

    borderRadius: 20,

    backgroundColor: '#8759D6',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  startText: {
    marginLeft: 8,

    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  cancelIntroButton: {
    marginTop: 14,
  },

  cancelIntroText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
  },

  navRow: {
    width: '100%',

    flexDirection: 'row',
    gap: 12,
  },

  previousButton: {
    flex: 1,

    height: 54,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',

    shadowColor: '#7B4BC5',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 3,
  },

  nextButton: {
    flex: 1,

    height: 54,

    borderRadius: 20,

    backgroundColor: '#8759D6',

    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',

    shadowColor: '#7B4BC5',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  disabledButton: {
    opacity: 0.55,
  },

  previousText: {
    marginLeft: 4,

    fontSize: 14,
    fontWeight: '900',
    color: '#8759D6',
  },

  nextText: {
    marginRight: 4,

    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  disabledText: {
    color: '#AAA',
  },

  completedContainer: {
    flex: 1,
  },

  confettiLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,

    zIndex: 1,

    alignItems: 'center',
  },

  confettiText: {
    fontSize: 26,
    color: '#8759D6',
    marginVertical: 8,
  },

  completedScroll: {
    flexGrow: 1,

    paddingHorizontal: 22,
    paddingVertical: 30,

    justifyContent: 'center',
    alignItems: 'center',
  },

  completedCard: {
    width: '100%',
    maxWidth: 520,

    backgroundColor: '#FFFFFF',

    borderRadius: 34,

    padding: 24,

    alignItems: 'center',

    shadowColor: '#7B4BC5',
    shadowOpacity: 0.11,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 6,
  },

  completedIcon: {
    width: 110,
    height: 110,

    borderRadius: 55,

    backgroundColor: '#F1E7FF',

    justifyContent: 'center',
    alignItems: 'center',
  },

  completedTitle: {
    marginTop: 18,

    fontSize: 30,
    fontWeight: '900',
    color: '#1F1D28',
  },

  completedMessage: {
    marginTop: 8,

    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',

    textAlign: 'center',
    lineHeight: 20,
  },

  recommendationCard: {
    width: '100%',

    marginTop: 22,

    backgroundColor: '#F7F1FB',

    borderRadius: 24,

    padding: 18,
  },

  recommendationLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8759D6',

    textTransform: 'uppercase',
  },

  recommendationTitle: {
    marginTop: 5,

    fontSize: 20,
    fontWeight: '900',
    color: '#1F1D28',
  },

  recommendationText: {
    marginTop: 6,

    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',

    lineHeight: 18,
  },

  playRecommendedButton: {
    height: 50,

    marginTop: 16,

    borderRadius: 18,

    backgroundColor: '#8759D6',

    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  playRecommendedText: {
    marginLeft: 7,

    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  skipButton: {
    marginTop: 14,

    alignItems: 'center',
  },

  skipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
  },

  exitOverlay: {
    flex: 1,

    backgroundColor: 'rgba(31, 29, 40, 0.42)',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 24,
  },

  exitCard: {
    width: '100%',
    maxWidth: 330,

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    padding: 22,

    alignItems: 'center',
  },

  exitTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F1D28',
  },

  exitMessage: {
    marginTop: 10,

    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',

    lineHeight: 19,
    textAlign: 'center',
  },

  continueButton: {
    width: '100%',
    height: 46,

    marginTop: 20,

    borderRadius: 16,

    backgroundColor: '#8759D6',

    justifyContent: 'center',
    alignItems: 'center',
  },

  continueText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  stopButton: {
    marginTop: 14,
  },

  stopText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#D9534F',
  },
});
