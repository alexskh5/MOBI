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
  startActivitySession,  
  respondToActivitySession,
  skipActivitySessionStep,
  finishActivitySession,
  getNextRecommendedActivity,
} from '../../services/api';


const TEST_LEARNER_ID =
  "6cf9a9ff-2ad9-49ec-b71b-dec0451fd5bc";

const INTERACTIVE_STEP_TYPES =
  new Set([
    "ask",
    "conversation",
    "show_choose",
    "do_it",
  ]);

const bgImage = require('../../../assets/images/background.jpg');
const fallbackImage = require('../../../assets/images/cow.jpg');


type SessionStatus = 'intro' | 'active' | 'completed';
type SpeakerStatus = 'idle' | 'appSpeaking' | 'userSpeaking';

export default function ActivitySessionScreen() {
  const navigation = useNavigation<NavigationProp<'ActivitySession'>>();
  const route = useRoute<RoutePropType<'ActivitySession'>>();
  const { activity } = route.params as any;

  // for audio
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isRecordingBusy, setIsRecordingBusy] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [activeFeedbackText, setActiveFeedbackText] = useState("");

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

  const steps = fullActivity?.steps || fullActivity?.activity_steps || [];
  const currentStep = steps[currentStepIndex];
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
    finishingSession,
    setFinishingSession,
  ] = useState(false);

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
  };

  const getPromptText = (step?: any, customText?: string) =>
    customText ||
    step?.prompt ||
    step?.lesson ||
    step?.question ||
    "";

  const getVoiceStyle = (step?: any, customText?: string) =>
    typeof step?.ai_voice_style === "string"
      ? step.ai_voice_style
      : customText === step?.correct_feedback?.[0]
      ? step?.ai_voice_style?.correct || "Celebratory"
      : customText === step?.wrong_feedback?.[0]
      ? step?.ai_voice_style?.wrong || "Encouraging"
      : "Teaching";

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

  useEffect(() => {
    currentStepRef.current = currentStep;
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStep, currentStepIndex]);

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

  const handleExitSession = () => {
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

  const handleStartSession = async () => {
    try {
      const session =
        await startActivitySession({
          learnerId:
            TEST_LEARNER_ID,

          activityId:
            String(fullActivity.id),

          sessionSource:
            "manual",
        });

      console.log(
        "Started activity session:",
        session,
      );

      setActivitySessionId(
          session.session.id,
      );

      setSessionEffectiveSettings(
        session.effectiveSettings ?? {},
      );

      setSessionStatus("active");
      sessionStartedAtRef.current =
        Date.now();

      await playAppPrompt(steps[0]);

      if (!isInteractiveStep(steps[0])) {
        scheduleAutoAdvance();
      }
    } catch (error) {
      console.log(
        "Failed to start activity session:",
        error,
      );
    }
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
      setSpeakerStatus("appSpeaking");

      const audioUri = await generateTTSAudio({
        text,
        voice: "Kore",
        style: getVoiceStyle(step, customText),
        emotion: "Calm",
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
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

      await speakWithDeviceFallback(text);
    }
  };

  const speakWithDeviceFallback = async (text: string) => {
    if (!text.trim() || isSessionPausedRef.current) {
      setSpeakerStatus("idle");
      return;
    }

    setSpeakerStatus("appSpeaking");

    await new Promise<void>((resolve) => {
      let finished = false;
      const timeoutMs =
        Math.min(9000, Math.max(1800, text.length * 85));
      const timeoutId = setTimeout(() => {
        if (!finished) {
          finished = true;
          Speech.stop();
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
        setSpeakerStatus("idle");
        resolve();
      };

      Speech.speak(text, {
        language: "en-US",
        rate: 0.82,
        pitch: 1.0,
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
      const showFeedbackForResult = async (isCorrect: boolean | null) => {
        const feedbackStep = getNextFeedbackStep();

        if (!feedbackStep) return;

        const feedbackText =
          isCorrect === true
            ? feedbackStep.correct_feedback?.[0] || "Great job!"
            : feedbackStep.wrong_feedback?.[0] || "Good try.";

        setActiveFeedbackText(feedbackText);

        await playAppPrompt(
          feedbackStep,
          feedbackText
        );
      };
      const handleMicPress = async () => {

        console.log("MIC BUTTON PRESSED");
      if (isSessionPausedRef.current) return;
      if (isRecordingBusy) return;

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

            if (!activitySessionId) {
              return;
            }

            const {
              nextAttemptOrder,
              nextStepAttemptNumber,
            } = getNextAttemptNumbers();

            await respondToActivitySession({
              sessionId:
                activitySessionId,

              learnerId:
                TEST_LEARNER_ID,

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
                "",

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
                true,

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
            }).catch((saveError) => {
              console.log(
                "Unable to save STT fallback attempt:",
                saveError,
              );
            });

            commitAttemptNumbers({
              nextStepAttemptNumber,
              nextAttemptOrder,
            });

            setLastLearnerResponse(
              "Speech was not clear enough to transcribe.",
            );
            setLastResultCorrect(null);
            setActiveFeedbackText(
              "I heard you try. Let's keep going.",
            );

            await speakWithDeviceFallback(
              "I heard you try. Let's keep going.",
            );

            continueAfterResponse({
              targetAchieved: false,
              reachedMaximumAttempts: true,
            });

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
          TEST_LEARNER_ID,

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

    /*
      For this first integration, continue using the activity's
      existing feedback UI.

      We will make approximation / one-more-try feedback
      context-aware immediately after verifying the runtime.
    */
    await showFeedbackForResult(
      targetAchieved,
    );

    continueAfterResponse({
      targetAchieved,
      reachedMaximumAttempts,
    });

    return;
    }
    console.log("STARTING NEW RECORDING");
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
  if (soundRef.current) {
    await soundRef.current.unloadAsync();
    soundRef.current = null;
  }
  setSpeakerStatus("idle");
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
        TEST_LEARNER_ID,

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
          TEST_LEARNER_ID,

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

    try {
      const recommendation =
        await getNextRecommendedActivity(
          TEST_LEARNER_ID,
        );

      console.log(
        "Next adaptive recommendation:",
        recommendation,
      );

      setNextRecommendedActivity(
        recommendation.nextActivity ??
          null,
      );
    } catch (recommendationError) {
      console.log(
        "Failed to load next recommendation:",
        recommendationError,
      );

      setNextRecommendedActivity(null);
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
          TEST_LEARNER_ID,

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
    await showFeedbackForResult(runtimeCorrect);

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
          TEST_LEARNER_ID,

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
    speakerStatus === 'appSpeaking'
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
          <View style={styles.completedCard}>
            <Ionicons name="star" size={48} color="#8759D6" />

            <Text style={styles.completedTitle}>{completionTitle}</Text>

            <Text style={styles.completedText}>
              {completionText || `Great job finishing ${fullActivity.title}.`}
            </Text>

            <Pressable
              style={styles.startButton}
              onPress={() => navigation.navigate('ChildDashboard')}
            >
              <Text style={styles.startText}>Back to Dashboard</Text>
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
            onLongPress={handleExitSession}
            delayLongPress={800}
          >
            <Ionicons name="shield-checkmark" size={17} color="#6F5278" />
            <Text style={styles.adultHoldText}>
              Hold
            </Text>
          </Pressable>
        </View>

        <View style={styles.headerTextGroup}>
          <Text style={styles.pageTitle}>{fullActivity.title}</Text>
          <Text style={styles.pageSubtitle}>
            {currentStep?.step_type?.replace('_', ' ') || 'Activity'}
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
            />
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

  completedCard: {
    margin: 24,
    flex: 1,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
