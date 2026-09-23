// MOBI/mobi-mobile/src/screens/Child-Mode/ActivitySessionScreen.tsx


import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Animated,
  ScrollView,
  useWindowDimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp, RoutePropType } from '../../types';
import { getActivityById } from '../../services/api';

import TeachSessionStepScreen from '../../components/Child-Mode/session/TeachSessionStepScreen';
import AskSessionStepScreen from '../../components/Child-Mode/session/AskSessionStepScreen';
import FeedbackSessionStepScreen from '../../components/Child-Mode/session/FeedbackSessionStepScreen';
import ConversationSessionStepScreen from '../../components/Child-Mode/session/ConversationSessionStepScreen';
import DoItSessionStepScreen from '../../components/Child-Mode/session/DoItSessionStepScreen';
import ShowChooseSessionStepScreen from '../../components/Child-Mode/session/ShowChooseSessionStepScreen';
import SessionVoiceControl from '../../components/Child-Mode/session/SessionVoiceControl';

// for audio
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { 
  transcribeAndEvaluateAudio, 
  generateTTSAudio, 
  getActivities,
  startActivitySession,  
  respondToActivitySession,
  skipActivitySessionStep,
  finishActivitySession,
  getNextRecommendedActivity,
  getActiveLearner,
} from '../../services/api';


const INTERACTIVE_STEP_TYPES =
  new Set([
    "ask",
    "conversation",
    "show_choose",
    "do_it",
  ]);

// Use the same backend voice engine as web preview whenever an activity does
// not yet have pre-generated audio. The microphone remains locked until the
// prompt finishes, so delayed speech cannot be recorded as the learner answer.
const USE_NETWORK_TTS_FOR_SESSION = true;

const PILOT_FEEDBACK_CORRECT = [
  "Nice talking.",
  "I heard you.",
  "That worked.",
  "Good try using your voice.",
];

const PILOT_FEEDBACK_TRY_AGAIN = [
  "Let's try one more time.",
  "Try it with me.",
  "You're close. One more try.",
  "I heard you try.",
];

const pickFeedbackLine = (
  options: string[],
  attemptNumber: number,
) => options[
  Math.max(0, attemptNumber - 1) %
  options.length
];

const bgImage = require('../../../assets/images/background.jpg');
const fallbackImage = require('../../../assets/images/cow.jpg');


type SessionStatus = 'intro' | 'active' | 'completed';
type SpeakerStatus = 'idle' | 'appSpeaking' | 'userSpeaking';

export default function ActivitySessionScreen() {
  const navigation = useNavigation<NavigationProp<'ActivitySession'>>();
  const route = useRoute<RoutePropType<'ActivitySession'>>();
  const { activity } = route.params as any;
  const activeLearner = getActiveLearner();
  const activeLearnerId = activeLearner?.id ?? "";

  // for audio
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isRecordingBusy, setIsRecordingBusy] = useState(false);
  const micPressBusyRef = useRef(false);
  const therapistAcceptBusyRef = useRef(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [activeFeedbackText, setActiveFeedbackText] = useState("");
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [
    activityReadyToFinish,
    setActivityReadyToFinish,
  ] = useState(false);

  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isSmallPhone = height < 700;

  const [fullActivity, setFullActivity] = useState<any>(activity);
  const [loading, setLoading] = useState(true);

  const [
    activitySessionId,
    setActivitySessionId,
  ] = useState<string | null>(null);

  const [
    sessionEffectiveSettings,
    setSessionEffectiveSettings,
  ] = useState<any>(null);

  const [
    totalAttemptOrder,
    setTotalAttemptOrder,
  ] = useState(0);
  const totalAttemptOrderRef = useRef(0);
  const sessionStartedAtRef = useRef<number | null>(null);
  const autoAdvanceTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStepRef = useRef<any>(null);
  const currentStepIndexRef = useRef(0);

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('intro');
  const [completionTitle, setCompletionTitle] =
    useState("Activity Complete!");
  const [completionText, setCompletionText] =
    useState("");
  const [speakerStatus, setSpeakerStatus] = useState<SpeakerStatus>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const attemptsRef = useRef(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const isSessionPausedRef = useRef(false);
  const [autoAdvanceLabel, setAutoAdvanceLabel] = useState("");

  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [lastLearnerResponse, setLastLearnerResponse] = useState('');
  const [lastResultCorrect, setLastResultCorrect] = useState<boolean | null>(null);

  const pulse = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const imageSize = {
    width: isTablet ? 380 : isSmallPhone ? 230 : 285,
    height: isTablet ? 250 : isSmallPhone ? 145 : 185,
  };

  const isRegulatoryActivity =
    String(
      fullActivity?.activity_type ??
      fullActivity?.category ??
      "",
    )
      .toLowerCase()
      .includes("regulat");

  const buildActivitySteps = (activityData: any) => {
    const activityRawSteps =
      activityData?.steps ||
      activityData?.activity_steps ||
      [];

    const activityIsRegulatory =
      String(
        activityData?.activity_type ??
        activityData?.category ??
        "",
      )
        .toLowerCase()
        .includes("regulat");

    if (
      Array.isArray(activityRawSteps) &&
      activityRawSteps.length > 0
    ) {
      return activityRawSteps;
    }

    if (!activityIsRegulatory) {
      return [];
    }

    return [
      {
        id: "regulatory-preview",
        step_order: 1,
        step_type: "teach",
        prompt:
          activityData?.description ||
          activityData?.teach_prompt ||
          activityData?.title ||
          "Regulation activity",
        lesson:
          activityData?.description ||
          "Follow the regulation activity with your therapist.",
        media:
          activityData?.thumbnail_url ||
          activityData?.activity_image_url
            ? [
                {
                  id: 1,
                  type: String(
                    activityData?.thumbnail_url ||
                    activityData?.activity_image_url,
                  )
                    .toLowerCase()
                    .match(/\.(mp4|mov|webm)(\?|$)/)
                    ? "video"
                    : "image",
                  url:
                    activityData?.thumbnail_url ||
                    activityData?.activity_image_url,
                  name:
                    activityData?.title ||
                    "Regulation media",
                },
              ]
            : [],
      },
    ];
  };

  const steps =
    buildActivitySteps(fullActivity);

  const renderedCurrentStep = steps[currentStepIndex];
  // During an adaptive activity switch, React may render the new activity a
  // moment after the backend session has already started. Runtime handlers
  // must use the synchronously activated step, not the previous render's step.
  const currentStep = currentStepRef.current ?? renderedCurrentStep;
  const currentStepManualScoringEnabled =
    currentStep?.manual_scoring_enabled === true ||
    currentStep?.metadata?.manual_scoring_enabled === true;
  const useSensoryFriendlyTheme =
    sessionEffectiveSettings?.visualTheme === 'sensory_friendly' ||
    sessionEffectiveSettings?.visualTheme === 'low_contrast' ||
    sessionEffectiveSettings?.lowContrastEnabled === true ||
    sessionEffectiveSettings?.softPastelEnabled === true ||
    sessionEffectiveSettings?.matteUiEnabled === true;

  const reduceMotionEnabled =
    sessionEffectiveSettings?.reduceMotionEnabled === true;

  const [
  nextRecommendedActivity,
  setNextRecommendedActivity,
  ] = useState<any>(null);
  const [
    recommendationOptions,
    setRecommendationOptions,
  ] = useState<any[]>([]);
  const [
    recommendationOptionIndex,
    setRecommendationOptionIndex,
  ] = useState(0);
  const [
    recommendationLoading,
    setRecommendationLoading,
  ] = useState(false);
  const [
    recommendationMessage,
    setRecommendationMessage,
  ] = useState("");
  const [
    startingNextActivity,
    setStartingNextActivity,
  ] = useState(false);
  const [
    lastCompletedActivityTitle,
    setLastCompletedActivityTitle,
  ] = useState("");
  const completedActivityIdsRef =
    useRef<Set<string>>(new Set());

  const [
    finishingSession,
    setFinishingSession,
  ] = useState(false);
  const [, setCanTherapistAcceptResponse] =
    useState(false);

  const getNextAttemptNumbers = () => {
    const nextAttemptOrder =
      totalAttemptOrderRef.current + 1;

    const nextStepAttemptNumber =
      attemptsRef.current + 1;

    return {
      nextAttemptOrder,
      nextStepAttemptNumber,
    };
  };

  const commitAttemptNumbers = ({
    nextAttemptOrder,
    nextStepAttemptNumber,
  }: {
    nextAttemptOrder: number;
    nextStepAttemptNumber: number;
  }) => {
    totalAttemptOrderRef.current =
      nextAttemptOrder;

    attemptsRef.current =
      nextStepAttemptNumber;

    setTotalAttemptOrder(
      nextAttemptOrder,
    );

    setAttempts(
      nextStepAttemptNumber,
    );
  };

  const resetStepAttemptNumbers = () => {
    attemptsRef.current = 0;
    setAttempts(0);
    setCanTherapistAcceptResponse(false);
  };

  const getPromptText = (step?: any, customText?: string) =>
    customText ||
    step?.prompt ||
    step?.lesson ||
    step?.question ||
    "";

  const getFeedbackLines = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
      return [value.trim()];
    }

    return [];
  };

  const getVoiceStyle = (step?: any, customText?: string) =>
    typeof step?.ai_voice_style === "string"
      ? step.ai_voice_style
      : customText && getFeedbackLines(step?.correct_feedback).includes(customText)
      ? step?.ai_voice_style?.correct || "Celebratory"
      : customText &&
        (
          getFeedbackLines(step?.wrong_feedback).includes(customText) ||
          getFeedbackLines(step?.max_attempts_feedback).includes(customText)
        )
      ? step?.ai_voice_style?.wrong || "Encouraging"
      : "Teaching";

  const getDeviceVoiceSettings = (step?: any, customText?: string) => {
    const style =
      String(getVoiceStyle(step, customText))
        .toLowerCase();

    const isFeedback =
      Boolean(customText);

    if (
      style.includes("celebr") ||
      style.includes("happy")
    ) {
      return {
        rate: 0.86,
        pitch: 1.12,
      };
    }

    if (
      style.includes("story") ||
      style.includes("narr")
    ) {
      return {
        rate: 0.78,
        pitch: 1.04,
      };
    }

    if (
      isFeedback ||
      style.includes("encourag") ||
      style.includes("gentle")
    ) {
      return {
        rate: 0.8,
        pitch: 1.06,
      };
    }

    return {
      rate: 0.82,
      pitch: 1.02,
    };
  };

  const isInteractiveStep = (step?: any) =>
    INTERACTIVE_STEP_TYPES.has(
      String(step?.step_type ?? ""),
    );

  const getMaxAttempts = () =>
    Number(
      sessionEffectiveSettings
        ?.maxAttempts ??
      fullActivity?.max_attempts ??
      3,
    );

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    setAutoAdvanceLabel("");
  };

  const stopAppAudio = async () => {
    Speech.stop();

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch {}

      try {
        await soundRef.current.unloadAsync();
      } catch {}

      soundRef.current = null;
    }

    setIsPromptLoading(false);
    setSpeakerStatus("idle");
  };

  useEffect(() => {
    currentStepRef.current = renderedCurrentStep;
    currentStepIndexRef.current = currentStepIndex;
  }, [renderedCurrentStep, currentStepIndex]);

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();
    };
  }, []);

  useEffect(() => {
    isSessionPausedRef.current = isSessionPaused;
  }, [isSessionPaused]);

  useEffect(() => {
    async function loadFullActivity() {
      try {
        const data = await getActivityById(String(activity.id));
        setFullActivity(data);
      } catch (error) {
        console.log('Failed to load full activity:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFullActivity();
  }, [activity.id]);

  useEffect(() => {
    const activitySteps =
      fullActivity?.steps ||
      fullActivity?.activity_steps ||
      [];

    if (!Array.isArray(activitySteps) || activitySteps.length === 0) {
      return;
    }

    if (!USE_NETWORK_TTS_FOR_SESSION) {
      return;
    }

    let cancelled = false;

    async function preloadAudio() {
      for (const step of activitySteps) {
        if (cancelled) {
          return;
        }

        const promptText =
          getPromptText(step);

        if (promptText) {
          await generateTTSAudio({
            text: promptText,
            voice: "Kore",
            style: getVoiceStyle(step),
            emotion: "Calm",
          }).catch((error) => {
            console.log("TTS preload skipped:", error);
          });
        }

        for (const feedbackText of [
          step?.correct_feedback?.[0],
          step?.wrong_feedback?.[0],
        ]) {
          if (!feedbackText || cancelled) {
            continue;
          }

          await generateTTSAudio({
            text: feedbackText,
            voice: "Kore",
            style: getVoiceStyle(step, feedbackText),
            emotion: "Calm",
          }).catch((error) => {
            console.log("Feedback TTS preload skipped:", error);
          });
        }
      }
    }

    preloadAudio();

    return () => {
      cancelled = true;
    };
  }, [fullActivity?.id]);

  useEffect(() => {
    if (speakerStatus === 'idle' || reduceMotionEnabled) {
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
      ])
    );

    animationRef.current.start();

    return () => {
      animationRef.current?.stop();
    };
  }, [pulse, reduceMotionEnabled, speakerStatus]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1.45],
  });

  const handleExitSession = async () => {
    await stopAppAudio();
    setShowExitModal(true);
  };

  const closeAdultControls = () => {
    setShowExitModal(false);
  };

  const confirmExitSession = async () => {
    setShowExitModal(false);

    if (sessionStatus === "active" && activitySessionId) {
      clearAutoAdvanceTimer();

      await cleanupRecording().catch((error) =>
        console.log(
          "Stop cleanup failed:",
          error,
        ),
      );

      await completeCurrentActivity({
        status: "stopped",
      });

      return;
    }

    navigation.navigate('ChildDashboard');
  };

  const pauseSession = async () => {
    clearAutoAdvanceTimer();
    isSessionPausedRef.current = true;
    setIsSessionPaused(true);

    await cleanupRecording().catch((error) =>
      console.log(
        "Pause cleanup failed:",
        error,
      ),
    );

    setShowExitModal(false);
  };

  const resumeSession = async () => {
    isSessionPausedRef.current = false;
    setIsSessionPaused(false);
    setShowExitModal(false);

    await playAppPrompt(
      currentStepRef.current,
    );

    if (!isInteractiveStep(currentStepRef.current)) {
      scheduleAutoAdvance();
    }
  };

  const resetActivityRunState = () => {
    clearAutoAdvanceTimer();
    totalAttemptOrderRef.current = 0;
    attemptsRef.current = 0;
    sessionStartedAtRef.current = null;
    currentStepIndexRef.current = 0;
    currentStepRef.current = null;

    setActivitySessionId(null);
    setSessionEffectiveSettings(null);
    setTotalAttemptOrder(0);
    setAttempts(0);
    setCurrentStepIndex(0);
    setSelectedChoiceId(null);
    setLastLearnerResponse("");
    setLastResultCorrect(null);
    setActiveFeedbackText("");
    setActivityReadyToFinish(false);
    setAutoAdvanceLabel("");
    setCanTherapistAcceptResponse(false);
    setIsSessionPaused(false);
    isSessionPausedRef.current = false;
  };

  const getSessionSourceFromSelection = (selection?: any) => {
    if (selection?.source === "assigned_required") {
      return "assigned_required";
    }

    if (selection?.source === "assigned_recommended") {
      return "assigned_recommended";
    }

    if (selection?.source === "adaptive_fallback") {
      return "adaptive";
    }

    return "manual";
  };

  const startActivityRun = async ({
    activityToStart,
    selection = null,
  }: {
    activityToStart: any;
    selection?: any;
  }) => {
    if (!activeLearnerId) {
      navigation.navigate("LearnerSelect");
      return;
    }

    try {
      await cleanupRecording().catch((error) => {
        console.log("Activity switch cleanup failed:", error);
      });

      resetActivityRunState();

      const activitySteps =
        buildActivitySteps(activityToStart);

      const session =
        await startActivitySession({
          learnerId:
            activeLearnerId,

          activityId:
            String(activityToStart.id),

          assignmentId:
            selection?.assignmentId ?? null,

          sessionSource:
            getSessionSourceFromSelection(selection),

          selectionAlgorithm:
            selection?.selectionAlgorithm ?? null,

          selectionReason:
            selection?.selectionReason ?? {},
        });

      console.log(
        "Started activity session:",
        session,
      );

      // Activate the new activity context synchronously before TTS playback or
      // learner input can run. This prevents the previous activity's prompt
      // and expected answers from leaking into an adaptive follow-up.
      currentStepIndexRef.current = 0;
      currentStepRef.current = activitySteps[0] ?? null;
      setCurrentStepIndex(0);
      setFullActivity(activityToStart);
      setActivitySessionId(
          session.session.id,
      );

      setSessionEffectiveSettings(
        session.effectiveSettings ?? {},
      );

      setSessionStatus("active");
      sessionStartedAtRef.current =
        Date.now();

      await playAppPrompt(activitySteps[0]);

      if (!isInteractiveStep(activitySteps[0])) {
        scheduleAutoAdvance();
      }
    } catch (error) {
      console.log(
        "Failed to start activity session:",
        error,
      );
    }
  };

  const handleStartSession = async () => {
    await startActivityRun({
      activityToStart: fullActivity,
    });
  };

  const playAppPrompt = async (stepToRead?: any, customText?: string) => {
    const step = stepToRead || currentStep;

    const text =
      getPromptText(step, customText) ||
      "Let's begin.";

    try {
      if (isSessionPausedRef.current) {
        return;
      }

      clearAutoAdvanceTimer();

      const correctFeedbackLines = getFeedbackLines(
        step?.correct_feedback,
      );
      const wrongFeedbackLines = getFeedbackLines(
        step?.wrong_feedback,
      );
      const maxAttemptsFeedbackLines = getFeedbackLines(
        step?.max_attempts_feedback,
      );

      const savedAudioUrl =
        customText &&
        maxAttemptsFeedbackLines.includes(customText)
          ? step?.feedback_audio_urls?.max_attempts
          : customText &&
            correctFeedbackLines.includes(customText)
          ? step?.feedback_audio_urls?.correct
          : customText &&
            wrongFeedbackLines.includes(customText)
          ? step?.feedback_audio_urls?.wrong
          : !customText
          ? step?.prompt_audio_url
          : null;

      if (savedAudioUrl) {
        setIsPromptLoading(false);
        setSpeakerStatus("appSpeaking");

        if (soundRef.current) {
          await stopAppAudio();
        }

        const { sound } = await Audio.Sound.createAsync({
          uri: savedAudioUrl,
        });

        soundRef.current = sound;

        await new Promise<void>((resolve) => {
          let resolved = false;

          const finishPlayback = () => {
            if (resolved) {
              return;
            }

            resolved = true;
            setSpeakerStatus("idle");
            sound.unloadAsync().catch(() => {});

            if (soundRef.current === sound) {
              soundRef.current = null;
            }

            resolve();
          };

          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) return;

            if (status.didJustFinish) {
              finishPlayback();
            }
          });

          sound.playAsync().catch((error) => {
            console.log("Saved prompt audio error:", error);
            finishPlayback();
          });
        });

        return;
      }

      if (!USE_NETWORK_TTS_FOR_SESSION) {
        await speakWithDeviceFallback(text, step, customText);
        return;
      }

      setIsPromptLoading(true);
      setSpeakerStatus("appSpeaking");

      const audioUri = await generateTTSAudio({
        text,
        voice: "Kore",
        style: getVoiceStyle(step, customText),
        emotion: "Calm",
      });

      if (soundRef.current) {
        await stopAppAudio();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });

      soundRef.current = sound;

      await new Promise<void>((resolve) => {
        let resolved = false;

        const finishPlayback = () => {
          if (resolved) {
            return;
          }

          resolved = true;
          setIsPromptLoading(false);
          setSpeakerStatus("idle");
          sound.unloadAsync().catch(() => {});

          if (soundRef.current === sound) {
            soundRef.current = null;
          }

          resolve();
        };

        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;

          if (status.didJustFinish) {
            finishPlayback();
          }
        });

        sound.playAsync().catch((error) => {
          console.log("TTS playAsync error:", error);
          finishPlayback();
        });
      });
    } catch (error) {
      console.log("TTS playback error:", error);
      setIsPromptLoading(false);

      await speakWithDeviceFallback(text, step, customText);
    }
  };

  const speakWithDeviceFallback = async (
    text: string,
    stepToRead?: any,
    customText?: string,
  ) => {
    if (!text.trim() || isSessionPausedRef.current) {
      setSpeakerStatus("idle");
      return;
    }

    setSpeakerStatus("appSpeaking");
    setIsPromptLoading(false);

    await new Promise<void>((resolve) => {
      let finished = false;
      const timeoutMs =
        Math.min(9000, Math.max(1800, text.length * 85));
      const timeoutId = setTimeout(() => {
        if (!finished) {
          finished = true;
          Speech.stop();
          setIsPromptLoading(false);
          setSpeakerStatus("idle");
          resolve();
        }
      }, timeoutMs);

      const finish = () => {
        if (finished) {
          return;
        }

        finished = true;
        clearTimeout(timeoutId);
        setIsPromptLoading(false);
        setSpeakerStatus("idle");
        resolve();
      };

      const voiceSettings =
        getDeviceVoiceSettings(
          stepToRead,
          customText,
        );

      Speech.speak(text, {
        language: "en-US",
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        onDone: finish,
        onStopped: finish,
        onError: finish,
      });
    });
  };

  const scheduleAutoAdvance = (
    label = "Moving to the next step...",
    delayMs = 900,
  ) => {
    if (isSessionPausedRef.current) {
      return;
    }

    clearAutoAdvanceTimer();
    setAutoAdvanceLabel(label);

    autoAdvanceTimeoutRef.current = setTimeout(() => {
      autoAdvanceTimeoutRef.current = null;
      setAutoAdvanceLabel("");
      goToNextStep().catch((error) => {
        console.log("Auto advance failed:", error);
      });
    }, delayMs);
  };

  const replayCurrentStepForRetry = (
    delayMs = 900,
  ) => {
    if (isSessionPausedRef.current) {
      return;
    }

    clearAutoAdvanceTimer();
    setAutoAdvanceLabel("Let's try again...");

    autoAdvanceTimeoutRef.current = setTimeout(() => {
      autoAdvanceTimeoutRef.current = null;
      setAutoAdvanceLabel("");
      setActiveFeedbackText("");

      playAppPrompt(
        currentStepRef.current,
      ).catch((error) => {
        console.log("Retry prompt failed:", error);
      });
    }, delayMs);
  };

  const continueAfterResponse = ({
    targetAchieved,
    reachedMaximumAttempts,
  }: {
    targetAchieved: boolean;
    reachedMaximumAttempts: boolean;
  }) => {
    if (targetAchieved || reachedMaximumAttempts) {
      scheduleAutoAdvance(
        targetAchieved
          ? "Nice work. Next step..."
          : "Let's move to the next step...",
        900,
      );
      return;
    }

    replayCurrentStepForRetry();
  };

  const getTherapistAcceptedTranscript = () => {
    const expected =
      Array.isArray(currentStep?.expected_answers)
        ? currentStep.expected_answers.find(
            (value: unknown) =>
              typeof value === "string" &&
              value.trim().length > 0,
          )
        : null;

    const variation =
      Array.isArray(currentStep?.accepted_variations)
        ? currentStep.accepted_variations.find(
            (value: unknown) =>
              typeof value === "string" &&
              value.trim().length > 0,
          )
        : null;

    return (
      expected ||
      variation ||
      "Therapist accepted response"
    );
  };

  const getManualResponsePayload = () => {
    if (currentStep?.step_type === "show_choose") {
      const correctChoice = Array.isArray(currentStep?.choices)
        ? currentStep.choices.find((choice: any) => choice?.is_correct === true)
        : null;

      return {
        responseType: "choice" as const,
        transcript:
          correctChoice?.label ||
          getTherapistAcceptedTranscript(),
        selectedChoiceId:
          correctChoice?.id ?? null,
        actionCompleted: null,
      };
    }

    if (currentStep?.step_type === "do_it") {
      return {
        responseType: "action" as const,
        transcript: "Therapist accepted completed action",
        selectedChoiceId: null,
        actionCompleted: true,
      };
    }

    return {
      responseType:
        currentStep?.step_type === "conversation"
          ? ("conversation" as const)
          : ("speech" as const),
      transcript:
        getTherapistAcceptedTranscript(),
      selectedChoiceId: null,
      actionCompleted: null,
    };
  };

  const scoreResponseByAdult = async (isCorrect: boolean) => {
    if (therapistAcceptBusyRef.current) {
      return;
    }

    if (
      isSessionPausedRef.current ||
      !activitySessionId ||
      !currentStep?.id
    ) {
      return;
    }

    therapistAcceptBusyRef.current = true;

    const {
      nextAttemptOrder,
      nextStepAttemptNumber,
    } = getNextAttemptNumbers();

    const manualResponse =
      getManualResponsePayload();

    try {
      const adaptiveResult =
        await respondToActivitySession({
          sessionId:
            activitySessionId,

          learnerId:
            activeLearnerId,

          attemptOrder:
            nextAttemptOrder,

          stepAttemptNumber:
            nextStepAttemptNumber,

          activityStepId:
            String(currentStep.id),

          responseType:
            manualResponse.responseType,

          transcript:
            manualResponse.transcript,

          selectedChoiceId:
            manualResponse.selectedChoiceId,

          actionCompleted:
            manualResponse.actionCompleted,

          adultScoringOverride:
            isCorrect ? "correct" : "incorrect",

          expectedAnswers:
            currentStep.expected_answers ??
            [],

          acceptedVariations:
            currentStep.accepted_variations ??
            [],

          responseTimeMs:
            null,

          gazeDetectionAvailable:
            false,

          gazePresent:
            null,

          gazeAwaySeconds:
            0,

          inactivitySeconds:
            0,

          reachedMaximumAttempts:
            isCorrect || nextStepAttemptNumber >= getMaxAttempts(),

          activityCompleted:
            false,

          therapistRequestedStop:
            false,

          parentRequestedStop:
            false,

          adaptiveSettings: {
            inactivityBreakSeconds:
              30,

            inactivityAutoStopSeconds:
              120,

            oneMoreTryEnabled:
              false,

            allowBreakSuggestion:
              true,
          },
        });

      commitAttemptNumbers({
        nextAttemptOrder,
        nextStepAttemptNumber,
      });

      setLastLearnerResponse(
        isCorrect
          ? "Adult marked this response correct"
          : "Adult marked this response incorrect",
      );
      setLastResultCorrect(isCorrect);
      setCanTherapistAcceptResponse(false);

      const reachedMaximumAttempts =
        !isCorrect && nextStepAttemptNumber >= getMaxAttempts();

      await showFeedbackForResult(
        isCorrect,
        reachedMaximumAttempts,
      );

      continueAfterResponse({
        targetAchieved:
          isCorrect,
        reachedMaximumAttempts:
          isCorrect || reachedMaximumAttempts,
      });
    } catch (error) {
      console.log(
        "Adult scoring override failed:",
        error,
      );
      setActiveFeedbackText(
        "Unable to save yet. Please check the backend connection, then try again.",
      );
    } finally {
      therapistAcceptBusyRef.current = false;
    }
  };

  const acceptResponseByTherapist = () =>
    scoreResponseByAdult(true);

  const rejectResponseByTherapist = () =>
    scoreResponseByAdult(false);

    
    const getNextFeedbackStep = () => {
      const nextStep = steps[currentStepIndex + 1];

      if (nextStep?.step_type === "feedback") {
        return nextStep;
      }

      return null;
    };

    // const showFeedbackForResult = (isCorrect: boolean | null) => {
    //   const feedbackStep = getNextFeedbackStep();

    //   if (!feedbackStep) return;

    //   const feedbackText =
    //     isCorrect === true
    //       ? feedbackStep.correct_feedback?.[0] || "Great job!"
    //       : feedbackStep.wrong_feedback?.[0] || "Good try.";

    //   setActiveFeedbackText(feedbackText);
    // };
      const showFeedbackForResult = async (
        isCorrect: boolean | null,
        reachedMaximumAttempts = false,
      ) => {
        const feedbackStep = getNextFeedbackStep();

        if (!feedbackStep) return;

        const authoredFeedback =
          reachedMaximumAttempts && isCorrect !== true
            ? getFeedbackLines(feedbackStep.max_attempts_feedback)
            : isCorrect === true
            ? getFeedbackLines(feedbackStep.correct_feedback)
            : getFeedbackLines(feedbackStep.wrong_feedback);

        const feedbackText =
          authoredFeedback.length > 0
            ? pickFeedbackLine(
                authoredFeedback,
                totalAttemptOrderRef.current + 1,
              )
            : pickFeedbackLine(
                isCorrect === true
                  ? PILOT_FEEDBACK_CORRECT
                  : PILOT_FEEDBACK_TRY_AGAIN,
                totalAttemptOrderRef.current + 1,
              );

        setActiveFeedbackText(feedbackText);

        await playAppPrompt(
          feedbackStep,
          feedbackText
        );
      };
      const handleMicPress = async () => {

        console.log("MIC BUTTON PRESSED");
      if (isSessionPausedRef.current) return;
      if (isRecordingBusy || micPressBusyRef.current) return;
      if (activityReadyToFinish) {
        await completeCurrentActivity({
          status: "completed",
        });
        return;
      }
      if (
        speakerStatus === "appSpeaking" ||
        isPromptLoading
      ) {
        setActiveFeedbackText(
          "Wait until MOBI is done speaking, then tap the microphone.",
        );
        return;
      }

      micPressBusyRef.current = true;
      setIsRecordingBusy(true);

      try {
        const activeRecording = recordingRef.current;

        if (activeRecording) {
          console.log("STOPPING RECORDING");
          setSpeakerStatus("idle");

          recordingRef.current = null;
          setRecording(null);

          await activeRecording.stopAndUnloadAsync();

          const uri = activeRecording.getURI();
          console.log("AUDIO URI:", uri);
          if (!uri || !currentStep) return;

          setActiveFeedbackText(
            "I'm listening to your answer...",
          );

          console.log("SENDING AUDIO TO STT");
          let speechResult: any;

          try {
            speechResult =
        await transcribeAndEvaluateAudio({
          audioUri: uri,

          expectedAnswers:
            currentStep.expected_answers ??
            [],

          acceptedVariations:
            currentStep.accepted_variations ??
            [],
        });
          } catch (sttError) {
            console.log("STT fallback used:", sttError);

            setLastLearnerResponse(
              "Speech was not transcribed.",
            );
            setLastResultCorrect(null);
            setCanTherapistAcceptResponse(true);
            setActiveFeedbackText(
              "I heard you try. Please try again, or the therapist can accept the response.",
            );

            await speakWithDeviceFallback(
              "I heard you try. Let's try again.",
            );

            return;
          }

    console.log(
      "Speech transcription:",
      speechResult,
    );

    /*
      We need an active backend session before the adaptive
      runtime can save this learner response.
    */
    if (!activitySessionId) {
      console.log(
        "No activity session ID is available.",
      );

      return;
    }

    /*
      attempt_order is unique across the whole activity session.

      stepAttemptNumber counts attempts only for the current step.
    */
    const {
      nextAttemptOrder,
      nextStepAttemptNumber,
    } = getNextAttemptNumbers();

    const maxAttempts =
      Number(
        sessionEffectiveSettings
          ?.maxAttempts ??
        fullActivity?.max_attempts ??
        3,
      );

    const reachedMaximumAttempts =
      nextStepAttemptNumber >=
      maxAttempts;

    /*
      Send the transcript into the real adaptive runtime.

      The backend will:
      - evaluate the communication
      - distinguish approximation from achieved target
      - decide adaptive support
      - save the attempt
    */
    const adaptiveResult =
      await respondToActivitySession({
        sessionId:
          activitySessionId,

        learnerId:
          activeLearnerId,

        attemptOrder:
          nextAttemptOrder,

        stepAttemptNumber:
          nextStepAttemptNumber,

        activityStepId:
          String(currentStep.id),

        responseType:
          currentStep.step_type === "conversation"
            ? "conversation"
            : "speech",

        transcript:
          speechResult.transcript,

        expectedAnswers:
          currentStep.expected_answers ??
          [],

        acceptedVariations:
          currentStep.accepted_variations ??
          [],

        responseTimeMs:
          null,

        /*
          Gaze integration comes later.

          Do not pretend gaze was available when it was not.
        */
        gazeDetectionAvailable:
          false,

        gazePresent:
          null,

        gazeAwaySeconds:
          0,

        inactivitySeconds:
          0,

        reachedMaximumAttempts,

        activityCompleted:
          false,

        therapistRequestedStop:
          false,

        parentRequestedStop:
          false,

        adaptiveSettings: {
          inactivityBreakSeconds:
            30,

          inactivityAutoStopSeconds:
            120,

          oneMoreTryEnabled:
            sessionEffectiveSettings
              ?.oneMoreTryEnabled ??
            true,

          allowBreakSuggestion:
            true,
        },
      });

    console.log(
      "Adaptive response:",
      adaptiveResult,
    );

    const nextState =
      adaptiveResult.adaptiveDecision
        ?.nextState;

    const shouldFinishActivity =
      nextState === "next_activity_ready" ||
      adaptiveResult.adaptiveDecision
        ?.action === "recommend_next_activity";

    if (shouldFinishActivity) {
      setActivityReadyToFinish(true);
    }

    commitAttemptNumbers({
      nextStepAttemptNumber,
      nextAttemptOrder,
    });

    setLastLearnerResponse(
      speechResult.transcript,
    );

    /*
      A target achievement is treated as the successful target
      response.

      An approximation remains meaningful communication, but
      does not falsely become a correct target response.
    */
    const targetAchieved =
      adaptiveResult.communication
        ?.targetAchieved ??
      false;

    setLastResultCorrect(
      targetAchieved,
    );
    setCanTherapistAcceptResponse(
      targetAchieved !== true,
    );

    /*
      For this first integration, continue using the activity's
      existing feedback UI.

      We will make approximation / one-more-try feedback
      context-aware immediately after verifying the runtime.
    */
    await showFeedbackForResult(
      targetAchieved,
      reachedMaximumAttempts,
    );

    if (shouldFinishActivity) {
      await completeCurrentActivity({
        status: "completed",
      });
      return;
    }

    continueAfterResponse({
      targetAchieved,
      reachedMaximumAttempts,
    });

    return;
    }
    console.log("STARTING NEW RECORDING");
    await stopAppAudio();

    const permission = await Audio.requestPermissionsAsync();
    console.log(
      "MIC PERMISSION:",
      permission.granted,
    );

    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const newRecording = new Audio.Recording();

    await newRecording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    await newRecording.startAsync();

    recordingRef.current = newRecording;
    setRecording(newRecording);
    setSpeakerStatus("userSpeaking");
  } catch (error) {
    console.log("Recording error:", error);

    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
      }
    } catch {}

    recordingRef.current = null;
    setRecording(null);
    setSpeakerStatus("idle");
  } finally {
    micPressBusyRef.current = false;
    setIsRecordingBusy(false);
  }
};

const cleanupRecording = async () => {
  try {
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
    }
  } catch (e) {
    console.log("Cleanup recording:", e);
  }

  recordingRef.current = null;
  setRecording(null);
  await stopAppAudio();
};

const skipCurrentStepIfNeeded = async ({
  preserveStepAttemptCount = false,
}: {
  preserveStepAttemptCount?: boolean;
} = {}) => {
  if (
    !activitySessionId ||
    !currentStep?.id ||
    !INTERACTIVE_STEP_TYPES.has(
      String(currentStep.step_type),
    ) ||
    attemptsRef.current > 0
  ) {
    return true;
  }

  const {
    nextAttemptOrder,
    nextStepAttemptNumber,
  } = getNextAttemptNumbers();

  try {
    await skipActivitySessionStep({
      sessionId:
        activitySessionId,

      learnerId:
        activeLearnerId,

      activityStepId:
        String(currentStep.id),

      attemptOrder:
        nextAttemptOrder,

      stepAttemptNumber:
        nextStepAttemptNumber,

      skipReason:
        "Skipped from mobile Next button.",
    });

    if (preserveStepAttemptCount) {
      totalAttemptOrderRef.current =
        nextAttemptOrder;

      setTotalAttemptOrder(
        nextAttemptOrder,
      );
    } else {
      commitAttemptNumbers({
        nextAttemptOrder,
        nextStepAttemptNumber,
      });
    }

    return true;
  } catch (error) {
    console.log(
      "Skip current step failed:",
      error,
    );

    return false;
  }
};

const loadNextRecommendation = async () => {
  if (!activeLearnerId) {
    setNextRecommendedActivity(null);
    setRecommendationOptions([]);
    setRecommendationOptionIndex(0);
    setRecommendationMessage(
      "No learner profile is selected.",
    );
    return;
  }

  try {
    setRecommendationLoading(true);
    setRecommendationMessage(
      "Finding the best next activity...",
    );

    const recommendation =
      await getNextRecommendedActivity(
        activeLearnerId,
        String(fullActivity.id),
      );

    console.log(
      "Next adaptive recommendation:",
      recommendation,
    );

    const nextActivity =
      recommendation.nextActivity ?? null;

    const completedIds =
      completedActivityIdsRef.current;

    const fallbackActivities =
      await getActivities()
        .then((items: any[]) =>
          items
            .filter((item: any) =>
              item.status === "published" &&
              !item.archived_at &&
              item.id !== fullActivity.id &&
              !completedIds.has(String(item.id)) &&
              (
                !fullActivity?.speech_ladder_level ||
                String(item.speech_ladder_level ?? "")
                  .toLowerCase() ===
                  String(fullActivity.speech_ladder_level)
                    .toLowerCase()
              ) &&
              String(item.activity_type ?? "")
                .toLowerCase()
                .includes("regulat") === false
            )
            .slice(0, 8)
            .map((item: any) => ({
              activityId: item.id,
              assignmentId: null,
              source: "adaptive_fallback",
              selectionAlgorithm: "mobile_backup_queue",
              selectionReason: {
                reason:
                  "Backup option shown so the adult can skip the first recommendation without returning to the dashboard.",
              },
              activity: item,
            })),
        )
        .catch((error) => {
          console.log(
            "Failed to load backup recommendations:",
            error,
          );
          return [];
        });

    const combinedOptions = [
      nextActivity,
      ...fallbackActivities,
    ]
      .filter(Boolean)
      .filter((option: any, index, list) => {
        const id = String(
          option.activityId ??
          option.activity?.id ??
          "",
        );

        return (
          id &&
          id !== String(fullActivity.id) &&
          !completedIds.has(id) &&
          list.findIndex((item: any) =>
            String(
              item.activityId ??
              item.activity?.id ??
              "",
            ) === id
          ) === index
        );
      });

    const selectedOption =
      combinedOptions[0] ?? null;

    setRecommendationOptions(combinedOptions);
    setRecommendationOptionIndex(0);
    setNextRecommendedActivity(selectedOption);

    setRecommendationMessage(
      selectedOption
        ? getRecommendationReason(selectedOption)
        : "No next activity is available right now. The adult may end the session or try again.",
    );
  } catch (recommendationError) {
    console.log(
      "Failed to load next recommendation:",
      recommendationError,
    );

    setNextRecommendedActivity(null);
    setRecommendationOptions([]);
    setRecommendationOptionIndex(0);
    setRecommendationMessage(
      "MOBI could not load the next activity quickly. You can try again, or end for now so the child is not kept waiting.",
    );
  } finally {
    setRecommendationLoading(false);
  }
};

const showAnotherRecommendation = () => {
  if (recommendationOptions.length <= 1) {
    setRecommendationMessage(
      "No other suggestion is ready yet. You can retry recommendations or end for now.",
    );
    return;
  }

  const nextIndex =
    (recommendationOptionIndex + 1) %
    recommendationOptions.length;

  const nextOption =
    recommendationOptions[nextIndex];

  setRecommendationOptionIndex(nextIndex);
  setNextRecommendedActivity(nextOption);
  setRecommendationMessage(
    getRecommendationReason(nextOption),
  );
};

const getRecommendationReason = (recommendation: any) => {
  if (recommendation?.source === "assigned_required") {
    return "Assigned activity first: this learner still has a required activity from the therapist.";
  }

  if (recommendation?.source === "assigned_recommended") {
    return "Assigned activity first: this is recommended by the therapist for this learner.";
  }

  const learnerState =
    recommendation?.selectionReason?.learnerState;

  if (learnerState === "needs_support") {
    return "Adaptive pick: MOBI selected a supportive activity based on the learner's recent attempts.";
  }

  if (learnerState === "ready_to_progress") {
    return "Adaptive pick: MOBI selected the next activity because the learner is doing well.";
  }

  return "Adaptive pick: MOBI matched this activity to the learner's current level and recent progress.";
};

const startRecommendedActivity = async () => {
  if (!nextRecommendedActivity || startingNextActivity) {
    return;
  }

  try {
    setStartingNextActivity(true);
    setRecommendationMessage(
      "Preparing the next activity...",
    );

    const selectedRecommendation =
      nextRecommendedActivity;

    const activityDetails =
      await getActivityById(
        String(
          selectedRecommendation.activityId ??
          selectedRecommendation.activity?.id,
        ),
      );

	    setNextRecommendedActivity(null);
	    setRecommendationOptions([]);
	    setRecommendationOptionIndex(0);
	    setRecommendationMessage("");
    setCompletionText("");
    setCompletionTitle("Activity Complete!");

    await startActivityRun({
      activityToStart: activityDetails,
      selection: selectedRecommendation,
    });
  } catch (error) {
    console.log(
      "Failed to start recommended activity:",
      error,
    );

    setRecommendationMessage(
      "The next activity could not start. Check the connection, then try again.",
    );
  } finally {
    setStartingNextActivity(false);
  }
};

const completeCurrentActivity = async ({
  status = "completed",
}: {
  status?: "completed" | "stopped";
} = {}) => {
  if (sessionStatus === "completed") {
    return;
  }

  if (!activitySessionId) {
    console.log(
      "Cannot finish activity: no backend session ID.",
    );

    return;
  }

  if (finishingSession) {
    return;
  }

  try {
    setFinishingSession(true);

    console.log(
      "FINISHING BACKEND ACTIVITY SESSION:",
      activitySessionId,
    );

    const totalDurationSeconds =
      sessionStartedAtRef.current
        ? Math.max(
            1,
            Math.round(
              (Date.now() - sessionStartedAtRef.current) /
                1000,
            ),
          )
        : 1;

    const finishResult =
      await finishActivitySession({
        sessionId:
          activitySessionId,

        learnerId:
          activeLearnerId,

        status:
          status,

        /*
          Temporary values.

          Later these will use real session timers,
          inactivity tracking, and gaze information.
        */
        totalDurationSeconds,

        inactivitySeconds:
          0,

        gazePresentSeconds:
          0,

        gazeAwaySeconds:
          0,

        gazeDetectionAvailable:
          false,
      });

    console.log(
      "Finished activity session:",
      finishResult,
    );

    if (status === "completed") {
      completedActivityIdsRef.current.add(
        String(fullActivity.id),
      );
    }

    setLastCompletedActivityTitle(
      fullActivity.title,
    );

    setCompletionTitle(
      status === "completed"
        ? "Activity Complete!"
        : "Session Saved"
    );

    setCompletionText(
      status === "completed"
        ? `Great job finishing ${fullActivity.title}.`
        : "This session was saved. It will not count as mastered because the activity was stopped before all answers were completed."
    );

    setSessionStatus(
      "completed",
    );

    if (status === "completed") {
      await loadNextRecommendation();
    } else {
      setNextRecommendedActivity(null);
      setRecommendationMessage(
        "The activity was stopped. End the session for now or choose another activity from the dashboard when the learner is ready.",
      );
    }
  } catch (error) {
    console.log(
      "Failed to finish activity session:",
      error,
    );
  } finally {
    setFinishingSession(
      false,
    );
  }
};

  const goToNextStep = async () => {
    if (isSessionPausedRef.current) {
      return;
    }

    clearAutoAdvanceTimer();

    await cleanupRecording().catch((error) =>
      console.log(
        "Step cleanup failed:",
        error,
      ),
    );

    const skipSaved =
      await skipCurrentStepIfNeeded({
        preserveStepAttemptCount: true,
      }).catch((error) => {
        console.log(
          "Current step skip failed:",
          error,
        );

        return false;
      });

      setSelectedChoiceId(null);
      setLastLearnerResponse("");
      setLastResultCorrect(null);
      setActiveFeedbackText("");
      setCanTherapistAcceptResponse(false);

    let nextIndex =
      currentStepIndexRef.current + 1;

    while (
      nextIndex < steps.length &&
      steps[nextIndex]?.step_type === "feedback"
    ) {
      nextIndex++;
    }

    if (nextIndex < steps.length) {
      const nextStep =
        steps[nextIndex];

      currentStepIndexRef.current = nextIndex;
      currentStepRef.current = nextStep;
      setCurrentStepIndex(
        nextIndex,
      );

      resetStepAttemptNumbers();

      await playAppPrompt(
        nextStep,
      );

      if (!isInteractiveStep(nextStep)) {
        scheduleAutoAdvance();
      }
    } else {
      resetStepAttemptNumbers();

      await completeCurrentActivity({
        status:
          skipSaved === false
            ? "stopped"
            : "completed",
      });
    }
  };

  const goToPreviousStep = async () => {
  if (isSessionPausedRef.current) {
    return;
  }

  await cleanupRecording();

  if (currentStepIndex > 0) {
    setCurrentStepIndex((current) => current - 1);
  }
};

const handleChoiceSelect = async (id: number) => {
  if (isSessionPausedRef.current) {
    return;
  }

  if (!currentStep) {
    return;
  }

  const selectedChoice = currentStep.choices?.find(
    (choice: any) => choice.id === id
  );

  const isCorrect = selectedChoice?.is_correct ?? null;

  setSelectedChoiceId(id);
  setLastResultCorrect(isCorrect);

  if (!activitySessionId) {
    await showFeedbackForResult(isCorrect);
    return;
  }

  const {
    nextAttemptOrder,
    nextStepAttemptNumber,
  } = getNextAttemptNumbers();

  const reachedMaximumAttempts =
    nextStepAttemptNumber >=
    getMaxAttempts();

  try {
    const adaptiveResult =
      await respondToActivitySession({
        sessionId:
          activitySessionId,

        learnerId:
          activeLearnerId,

        attemptOrder:
          nextAttemptOrder,

        stepAttemptNumber:
          nextStepAttemptNumber,

        activityStepId:
          String(currentStep.id),

        responseType:
          "choice",

        transcript:
          selectedChoice?.label || "",

        selectedChoiceId:
          id,

        expectedAnswers:
          [],

        acceptedVariations:
          [],

        responseTimeMs:
          null,

        gazeDetectionAvailable:
          false,

        gazePresent:
          null,

        gazeAwaySeconds:
          0,

        inactivitySeconds:
          0,

        reachedMaximumAttempts:
          reachedMaximumAttempts,

        activityCompleted:
          false,

        therapistRequestedStop:
          false,

        parentRequestedStop:
          false,

        adaptiveSettings: {
          inactivityBreakSeconds:
            30,

          inactivityAutoStopSeconds:
            120,

          oneMoreTryEnabled:
            sessionEffectiveSettings
              ?.oneMoreTryEnabled ??
            true,

          allowBreakSuggestion:
            true,
        },
      });

    commitAttemptNumbers({
      nextStepAttemptNumber,
      nextAttemptOrder,
    });

    setLastLearnerResponse(
      selectedChoice?.label || "",
    );

    const runtimeCorrect =
      adaptiveResult.communication
        ?.targetAchieved ??
      isCorrect;

    setLastResultCorrect(runtimeCorrect);
    await showFeedbackForResult(
      runtimeCorrect,
      reachedMaximumAttempts,
    );

    continueAfterResponse({
      targetAchieved: runtimeCorrect === true,
      reachedMaximumAttempts,
    });
  } catch (error) {
    console.log("Choice response error:", error);
    await showFeedbackForResult(isCorrect);
  }
};

const handleActionComplete = async () => {
  if (isSessionPausedRef.current) {
    return;
  }

  if (!currentStep) {
    return;
  }

  setLastLearnerResponse("I did it");
  setLastResultCorrect(true);

  if (!activitySessionId) {
    await showFeedbackForResult(true);
    return;
  }

  const {
    nextAttemptOrder,
    nextStepAttemptNumber,
  } = getNextAttemptNumbers();

  try {
    const adaptiveResult =
      await respondToActivitySession({
        sessionId:
          activitySessionId,

        learnerId:
          activeLearnerId,

        attemptOrder:
          nextAttemptOrder,

        stepAttemptNumber:
          nextStepAttemptNumber,

        activityStepId:
          String(currentStep.id),

        responseType:
          "action",

        transcript:
          "I did it",

        actionCompleted:
          true,

        expectedAnswers:
          [],

        acceptedVariations:
          [],

        responseTimeMs:
          null,

        gazeDetectionAvailable:
          false,

        gazePresent:
          null,

        gazeAwaySeconds:
          0,

        inactivitySeconds:
          0,

        reachedMaximumAttempts:
          false,

        activityCompleted:
          false,

        therapistRequestedStop:
          false,

        parentRequestedStop:
          false,

        adaptiveSettings: {
          inactivityBreakSeconds:
            30,

          inactivityAutoStopSeconds:
            120,

          oneMoreTryEnabled:
            sessionEffectiveSettings
              ?.oneMoreTryEnabled ??
            true,

          allowBreakSuggestion:
            true,
        },
      });

    commitAttemptNumbers({
      nextStepAttemptNumber,
      nextAttemptOrder,
    });

    const targetAchieved =
      adaptiveResult.communication
        ?.targetAchieved ??
      true;

    await showFeedbackForResult(
      targetAchieved,
    );

    continueAfterResponse({
      targetAchieved,
      reachedMaximumAttempts: true,
    });
  } catch (error) {
    console.log("Action response error:", error);
    await showFeedbackForResult(true);
  }
};

  const currentStatusText =
    activityReadyToFinish
      ? 'Activity complete. Preparing what comes next...'
      : isPromptLoading
      ? 'Preparing MOBI voice...'
      : speakerStatus === 'appSpeaking'
      ? 'MOBI is speaking...'
      : speakerStatus === 'userSpeaking'
      ? 'Listening to you...'
      : 'Tap the microphone when you are ready.';

  // const shouldShowVoiceControl =
  //   currentStep?.step_type === 'ask' ||
  //   currentStep?.step_type === 'conversation' ||
  //   currentStep?.step_type === 'do_it';

  const shouldShowVoiceControl =
  (
    currentStep?.step_type === 'ask' ||
    currentStep?.step_type === 'conversation'
  ) &&
  Array.isArray(
    currentStep?.expected_answers,
  ) &&
  currentStep.expected_answers.length > 0;

  const shouldShowManualAcceptButton =
    (
      currentStepManualScoringEnabled ||
      isInteractiveStep(currentStep)
    ) &&
    !isSessionPaused &&
    currentStep?.id &&
    INTERACTIVE_STEP_TYPES.has(
      String(currentStep.step_type),
    );

  const currentStepLabel =
    currentStep?.step_type === "conversation"
      ? "social prompt"
      : currentStep?.step_type?.replace('_', ' ') || 'Activity';
  
  const renderCurrentStep = () => {
    if (!currentStep) {
      return (
        <View style={styles.emptyStepCard}>
          <Text style={styles.emptyStepText}>No steps found for this activity.</Text>
        </View>
      );
    }

    const commonProps = {
      step: currentStep,
      fallbackImage,
      imageSize,
      lastLearnerResponse,
      onReplayPrompt: playAppPrompt,
    };

    switch (currentStep.step_type) {
      case 'teach':
        return <TeachSessionStepScreen {...commonProps} />;

      case 'ask':
        return <AskSessionStepScreen {...commonProps} />;

      // case 'feedback':
      //   return (
      //     <FeedbackSessionStepScreen
      //       {...commonProps}
      //       lastResultCorrect={lastResultCorrect}
      //     />
      //   );
      case 'feedback':
        return null;

      case 'conversation':
        return <ConversationSessionStepScreen {...commonProps} />;

      case 'do_it':
        return <DoItSessionStepScreen {...commonProps} />;

      case 'show_choose':
        return (
          <ShowChooseSessionStepScreen
            {...commonProps}
            selectedChoiceId={selectedChoiceId}
            onSelectChoice={handleChoiceSelect}
          />
        );

      default:
        if (isRegulatoryActivity) {
          return (
            <TeachSessionStepScreen
              {...commonProps}
            />
          );
        }

        return (
          <View style={styles.emptyStepCard}>
            <Text style={styles.emptyStepText}>
              Unsupported step type: {currentStep.step_type}
            </Text>
          </View>
        );
    }
  };

  const AdultControlModal = () => (
    <Modal visible={showExitModal} transparent animationType="fade">
      <View style={styles.exitOverlay}>
        <View style={styles.exitCard}>
          <Text style={styles.exitTitle}>
            Adult Controls
          </Text>

          <Text style={styles.exitMessage}>
            Pause or stop this activity only when the adult guiding the session decides it is needed.
          </Text>

          {sessionStatus === "active" ? (
            <Pressable
              style={styles.continueButton}
              onPress={
                isSessionPaused
                  ? resumeSession
                  : pauseSession
              }
            >
              <Text style={styles.continueText}>
                {isSessionPaused ? "Resume Session" : "Pause Session"}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            style={[
              styles.continueButton,
              styles.secondaryAdultButton,
            ]}
            onPress={closeAdultControls}
          >
            <Text style={styles.secondaryAdultText}>
              Keep Going
            </Text>
          </Pressable>

          <Pressable style={styles.stopButton} onPress={confirmExitSession}>
            <Text style={styles.stopText}>
              Stop and Save Session
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <ImageBackground
        source={bgImage}
        style={[
          styles.background,
          useSensoryFriendlyTheme && styles.sensoryBackground,
        ]}
        imageStyle={
          useSensoryFriendlyTheme
            ? styles.hiddenBackgroundImage
            : undefined
        }
        resizeMode="cover"
      >
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8759D6" />
          <Text style={styles.loadingText}>Loading activity...</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (sessionStatus === 'completed') {
    const recommendationActivity =
      nextRecommendedActivity?.activity ??
      null;

    return (
      <ImageBackground
        source={bgImage}
        style={[
          styles.background,
          useSensoryFriendlyTheme && styles.sensoryBackground,
        ]}
        imageStyle={
          useSensoryFriendlyTheme
            ? styles.hiddenBackgroundImage
            : undefined
        }
        resizeMode="cover"
      >
        <SafeAreaView style={styles.completedContainer}>
          <View style={styles.completedSummaryCard}>
            <Ionicons name="star" size={48} color="#8759D6" />

            <Text style={styles.completedTitle}>{completionTitle}</Text>

            <Text style={styles.completedText}>
              {completionText || `Great job finishing ${fullActivity.title}.`}
            </Text>
          </View>

          <View style={styles.recommendationDrawer}>
            <View style={styles.drawerHandle} />

            <Text style={styles.drawerEyebrow}>
              Up next for {activeLearner?.firstName || "learner"}
            </Text>

            <Text style={styles.drawerTitle}>
              Keep the session flowing
            </Text>

            <Text style={styles.drawerSubtitle}>
              {lastCompletedActivityTitle
                ? `After ${lastCompletedActivityTitle}, MOBI checks assignments, progress, and today's session limit before suggesting the next activity.`
                : "MOBI checks assignments, progress, and today's session limit before suggesting the next activity."}
            </Text>

            {recommendationLoading ? (
              <View style={styles.recommendationLoadingCard}>
                <ActivityIndicator size="small" color="#8759D6" />
                <Text style={styles.recommendationLoadingText}>
                  {recommendationMessage || "Finding the best next activity..."}
                </Text>
              </View>
            ) : recommendationActivity ? (
              <View style={styles.nextActivityCard}>
                <View style={styles.nextActivityIcon}>
                  <Ionicons
                    name={
                      nextRecommendedActivity?.source?.startsWith("assigned")
                        ? "clipboard"
                        : "sparkles"
                    }
                    size={22}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.nextActivityTextGroup}>
                  <Text style={styles.nextActivityLabel}>
                    {nextRecommendedActivity?.source?.startsWith("assigned")
                      ? "Assigned first"
                      : "Adaptive recommendation"}
                  </Text>

                  <Text style={styles.nextActivityTitle}>
                    {recommendationActivity.title}
                  </Text>

                  <Text style={styles.nextActivityReason}>
                    {recommendationMessage}
                  </Text>

                  <View style={styles.nextMetaRow}>
                    <Text style={styles.nextMetaPill}>
                      {recommendationActivity.speech_ladder_level || "level"}
                    </Text>
                    <Text style={styles.nextMetaPill}>
                      {recommendationActivity.estimated_minutes || 5} min
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.recommendationLoadingCard}>
                <Ionicons name="wifi" size={20} color="#8759D6" />
                <Text style={styles.recommendationLoadingText}>
                  {recommendationMessage ||
                    "No recommended activity is available right now."}
                </Text>
              </View>
            )}

	            <Pressable
	              style={[
	                styles.startNextButton,
                (!nextRecommendedActivity ||
                  recommendationLoading ||
                  startingNextActivity) &&
                  styles.disabledButton,
              ]}
              disabled={
                !nextRecommendedActivity ||
                recommendationLoading ||
                startingNextActivity
              }
              onPress={startRecommendedActivity}
            >
              {startingNextActivity ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="play" size={18} color="#FFFFFF" />
              )}
	              <Text style={styles.startNextText}>
	                {startingNextActivity ? "Starting..." : "Start Next Activity"}
	              </Text>
	            </Pressable>

	            {recommendationOptions.length > 1 ? (
	              <Pressable
	                style={styles.skipSuggestionButton}
	                onPress={showAnotherRecommendation}
	                disabled={
	                  recommendationLoading ||
	                  startingNextActivity
	                }
	              >
	                <Ionicons name="play-skip-forward" size={17} color="#6F5278" />
	                <Text style={styles.skipSuggestionText}>
	                  Show Another Suggestion
	                </Text>
	              </Pressable>
	            ) : null}

	            {!recommendationLoading && !nextRecommendedActivity ? (
              <Pressable
                style={styles.retryRecommendationButton}
                onPress={loadNextRecommendation}
              >
                <Text style={styles.retryRecommendationText}>
                  Try Recommendation Again
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              style={styles.endSessionButton}
              onPress={() => navigation.navigate('ChildDashboard')}
            >
              <Text style={styles.endSessionText}>
                End for Now
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (sessionStatus === 'intro') {
    return (
      <ImageBackground
        source={bgImage}
        style={[
          styles.background,
          useSensoryFriendlyTheme && styles.sensoryBackground,
        ]}
        imageStyle={
          useSensoryFriendlyTheme
            ? styles.hiddenBackgroundImage
            : undefined
        }
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.topBar}>
            <Pressable style={styles.iconButton} onPress={handleExitSession}>
              <Ionicons name="arrow-back" size={24} color="#111" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.introContent}
          >
            <View style={styles.introCard}>
              <Text style={styles.introLabel}>Activity Preview</Text>

              <Text style={styles.introTitle}>{fullActivity.title}</Text>

              <Text style={styles.introDescription}>
                {fullActivity.description ||
                  fullActivity.teach_prompt ||
                  'This activity will guide the learner using simple prompts, visuals, and speech practice.'}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>
                    {fullActivity.speech_ladder_level || fullActivity.level || 'word'}
                  </Text>
                </View>

                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>
                    {steps.length} step{steps.length === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>

              <Pressable style={styles.startButton} onPress={handleStartSession}>
                <Ionicons name="play" size={18} color="#FFFFFF" />
                <Text style={styles.startText}>Start Session</Text>
              </Pressable>

              <Pressable style={styles.cancelIntroButton} onPress={handleExitSession}>
                <Text style={styles.cancelIntroText}>Cancel Session</Text>
              </Pressable>
            </View>
          </ScrollView>

          <AdultControlModal />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={bgImage}
      style={[
        styles.background,
        useSensoryFriendlyTheme && styles.sensoryBackground,
      ]}
      imageStyle={
        useSensoryFriendlyTheme
          ? styles.hiddenBackgroundImage
          : undefined
      }
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeText}>
              Step {currentStepIndex + 1} of {steps.length}
            </Text>
          </View>

          <Pressable
            style={styles.adultHoldButton}
            onPress={handleExitSession}
          >
            <Ionicons name="shield-checkmark" size={17} color="#6F5278" />
            <Text style={styles.adultHoldText}>
              Stop
            </Text>
          </Pressable>
        </View>

        <View style={styles.headerTextGroup}>
          <Text style={styles.pageTitle}>{fullActivity.title}</Text>
          <Text style={styles.pageSubtitle}>
            {currentStepLabel}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.activityPanel,
            useSensoryFriendlyTheme &&
              styles.sensoryActivityPanel,
          ]}
        >
          {renderCurrentStep()}

          {activeFeedbackText ? (
            <View style={styles.feedbackBubble}>
              <Text style={styles.feedbackBubbleText}>
                {activeFeedbackText}
              </Text>
            </View>
          ) : null}

          {shouldShowVoiceControl && !isSessionPaused && (
            <SessionVoiceControl
              speakerStatus={speakerStatus}
              scale={scale}
              statusText={currentStatusText}
              onMicPress={handleMicPress}
              learnerResponse={lastLearnerResponse}
              disabled={
                isPromptLoading ||
                speakerStatus === "appSpeaking" ||
                activityReadyToFinish ||
                isSessionPaused
              }
            />
          )}

          {shouldShowManualAcceptButton &&
            !isSessionPaused && (
              <View style={styles.adultScoringRow}>
                <Pressable
                  style={styles.therapistAcceptButton}
                  onPress={acceptResponseByTherapist}
                >
                  <Ionicons name="checkmark" size={19} color="#FFFFFF" />
                  <Text style={styles.therapistAcceptText}>
                    Mark Correct
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.therapistRejectButton}
                  onPress={rejectResponseByTherapist}
                >
                  <Ionicons name="close" size={19} color="#FFFFFF" />
                  <Text style={styles.therapistAcceptText}>
                    Mark Incorrect
                  </Text>
                </Pressable>
              </View>
            )}

          {currentStep?.step_type === 'do_it' && !activeFeedbackText && !isSessionPaused && (
            <Pressable
              style={styles.doneActionButton}
              onPress={handleActionComplete}
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.doneActionText}>I did it</Text>
            </Pressable>
          )}

          {autoAdvanceLabel ? (
            <View style={styles.autoAdvancePill}>
              <ActivityIndicator size="small" color="#8759D6" />
              <Text style={styles.autoAdvanceText}>
                {autoAdvanceLabel}
              </Text>
            </View>
          ) : null}

          {isSessionPaused ? (
            <View style={styles.pausedNotice}>
              <Ionicons name="pause-circle" size={24} color="#8759D6" />
              <Text style={styles.pausedNoticeText}>
                Session paused
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <AdultControlModal />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  sensoryBackground: {
    backgroundColor: '#F4F1EC',
  },
  hiddenBackgroundImage: {
    opacity: 0,
  },
  container: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '800',
    color: '#4B3A5A',
  },

  topBar: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  sessionBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7B5B88',
    textTransform: 'capitalize',
  },

  adultHoldButton: {
    minWidth: 74,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(111,82,120,0.18)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  adultHoldText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6F5278',
  },

  introContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingBottom: 30,
  },

  introCard: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },

  introLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B48BC7',
    marginBottom: 14,
    textTransform: 'uppercase',
  },

  introTitle: {
    marginTop: 18,
    fontSize: 23,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
  },

  introDescription: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
  },

  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  metaPill: {
    backgroundColor: '#F2DDF2',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  metaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7B5B88',
  },

  startButton: {
    minWidth: 180,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#B48BC7',
    marginTop: 22,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  startText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 8,
  },

  cancelIntroButton: {
    marginTop: 14,
  },

  cancelIntroText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777',
  },

  headerTextGroup: {
    paddingHorizontal: 22,
    marginTop: 4,
    marginBottom: 16,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111',
  },

  pageSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'capitalize',
  },

  activityPanel: {
    flexGrow: 1,
    backgroundColor: 'rgba(238, 205, 238, 0.96)',
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingTop: 28,
    paddingHorizontal: 22,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 18,
  },

  sensoryActivityPanel: {
    backgroundColor: '#F8F5EF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  disabledButton: {
    opacity: 0.4,
  },

  autoAdvancePill: {
    minHeight: 44,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  autoAdvanceText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6F5278',
  },

  pausedNotice: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  pausedNoticeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#6F5278',
  },

  emptyStepCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },

  emptyStepText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#555',
    textAlign: 'center',
  },

  completedContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
  },

  completedSummaryCard: {
    marginTop: 18,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },

  completedTitle: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
  },

  completedText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
  },

  recommendationDrawer: {
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },

  drawerHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#DFC7E9',
    marginBottom: 12,
  },

  drawerEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9B73AB',
    textTransform: 'uppercase',
  },

  drawerTitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '900',
    color: '#161216',
  },

  drawerSubtitle: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: '#6C6070',
  },

  recommendationLoadingCard: {
    marginTop: 14,
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: '#F6EFF8',
    borderWidth: 1,
    borderColor: '#E8D3F0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  recommendationLoadingText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#5A4A61',
  },

  nextActivityCard: {
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: '#F7F1F8',
    borderWidth: 1,
    borderColor: '#E7C6F0',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },

  nextActivityIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#8759D6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextActivityTextGroup: {
    flex: 1,
  },

  nextActivityLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8C6298',
    textTransform: 'uppercase',
  },

  nextActivityTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '900',
    color: '#141014',
  },

  nextActivityReason: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: '#5F5364',
  },

  nextMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  nextMetaPill: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '900',
    color: '#72507B',
    textTransform: 'capitalize',
  },

  startNextButton: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: '#8759D6',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

	  startNextText: {
	    color: '#FFFFFF',
	    fontSize: 14,
	    fontWeight: '900',
	  },

	  skipSuggestionButton: {
	    marginTop: 10,
	    minHeight: 46,
	    borderRadius: 16,
	    backgroundColor: '#FFFFFF',
	    borderWidth: 1,
	    borderColor: '#E3C9EC',
	    paddingHorizontal: 14,
	    flexDirection: 'row',
	    alignItems: 'center',
	    justifyContent: 'center',
	    gap: 8,
	  },

	  skipSuggestionText: {
	    fontSize: 13,
	    fontWeight: '900',
	    color: '#6F5278',
	  },

	  retryRecommendationButton: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E3C9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryRecommendationText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6F5278',
  },

  endSessionButton: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },

  endSessionText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7A707E',
  },

  exitOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  exitCard: {
    width: '100%',
    maxWidth: 310,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },

  exitTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
  },

  exitMessage: {
    marginTop: 10,
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
    textAlign: 'center',
  },

  continueButton: {
    width: '100%',
    height: 45,
    borderRadius: 15,
    backgroundColor: '#B48BC7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  secondaryAdultButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7C6F0',
  },

  secondaryAdultText: {
    color: '#6F5278',
    fontSize: 13,
    fontWeight: '900',
  },

  stopButton: {
    marginTop: 14,
  },

  stopText: {
    color: '#D9534F',
    fontSize: 13,
    fontWeight: '800',
  },

  feedbackBubble: {
  width: "100%",
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: "#E7C6F0",
},

feedbackBubbleText: {
  fontSize: 16,
  fontWeight: "800",
  color: "#4B3A5A",
  textAlign: "center",
},

  adultScoringRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },

  therapistAcceptButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: '#5E8C61',
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  therapistRejectButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: '#A75B67',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  therapistAcceptText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  doneActionButton: {
    minWidth: 180,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#8759D6',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  doneActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
