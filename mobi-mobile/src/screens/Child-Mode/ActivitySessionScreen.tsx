// // MOBI/mobi-backend/src/screens/Child-Mode/ActivitySessionScreen.tsx

// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   Pressable,
//   ImageBackground,
//   Animated,
//   ScrollView,
//   useWindowDimensions,
//   Modal,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { NavigationProp, RoutePropType } from '../../types';

// const bgImage = require('../../../assets/images/background.jpg');
// const fallbackImage = require('../../../assets/images/cow.jpg');

// const waveBars = [18, 28, 36, 24, 42, 56, 48, 64, 74, 52, 45, 34, 26, 18];

// type SessionStatus = 'intro' | 'active' | 'completed';
// type SpeakerStatus = 'idle' | 'appSpeaking' | 'userSpeaking';

// export default function ActivitySessionScreen() {
//   const navigation = useNavigation<NavigationProp<'ActivitySession'>>();
//   const route = useRoute<RoutePropType<'ActivitySession'>>();
//   const { activity } = route.params;

//   const { width, height } = useWindowDimensions();
//   const isTablet = width >= 768;
//   const isSmallPhone = height < 700;

//   const [sessionStatus, setSessionStatus] = useState<SessionStatus>('intro');
//   const [speakerStatus, setSpeakerStatus] = useState<SpeakerStatus>('idle');
//   const [attempts, setAttempts] = useState(0);
//   const [showExitModal, setShowExitModal] = useState(false);

//   const pulse = useRef(new Animated.Value(0)).current;
//   const animationRef = useRef<Animated.CompositeAnimation | null>(null);

//   const imageSize = {
//     width: isTablet ? 380 : isSmallPhone ? 230 : 285,
//     height: isTablet ? 250 : isSmallPhone ? 145 : 185,
//   };

//   useEffect(() => {
//     if (speakerStatus === 'idle') {
//       animationRef.current?.stop();
//       pulse.setValue(0);
//       return;
//     }

//     animationRef.current = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulse, {
//           toValue: 1,
//           duration: speakerStatus === 'appSpeaking' ? 520 : 380,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulse, {
//           toValue: 0,
//           duration: speakerStatus === 'appSpeaking' ? 520 : 380,
//           useNativeDriver: true,
//         }),
//       ])
//     );

//     animationRef.current.start();

//     return () => {
//       animationRef.current?.stop();
//     };
//   }, [speakerStatus]);

//   const scale = pulse.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.55, 1.45],
//   });

//   const handleExitSession = () => {
//     setShowExitModal(true);
//   };

//   const confirmExitSession = () => {
//     setShowExitModal(false);

//     // BACKEND READY:
//     // Later save progress here before leaving.
//     // await api.post('/sessions/end', {
//     //   activity_id: activity.id,
//     //   attempts,
//     //   status: sessionStatus === 'intro' ? 'cancelled' : 'stopped',
//     // });

//     navigation.navigate('ChildDashboard');
//   };

//   const handleStartSession = () => {
//     setSessionStatus('active');
//     playAppPrompt();
//   };

//   const playAppPrompt = () => {
//     setSpeakerStatus('appSpeaking');

//     // BACKEND / AUDIO READY:
//     // Later replace with real TTS/audio playback.
//     setTimeout(() => {
//       setSpeakerStatus('idle');
//     }, 2200);
//   };

//   const handleMicPress = () => {
//     if (speakerStatus === 'userSpeaking') {
//       setSpeakerStatus('idle');
//       setAttempts((current) => current + 1);

//       // BACKEND READY:
//       // Later send recorded audio/transcript here.
//       return;
//     }

//     setSpeakerStatus('userSpeaking');
//   };

//   const currentStatusText =
//     speakerStatus === 'appSpeaking'
//       ? 'MOBI is speaking...'
//       : speakerStatus === 'userSpeaking'
//       ? 'Listening to you...'
//       : 'Tap the microphone when you are ready.';

//   const ExitSessionModal = () => (
//     <Modal visible={showExitModal} transparent animationType="fade">
//       <View style={styles.exitOverlay}>
//         <View style={styles.exitCard}>
//           <Text style={styles.exitTitle}>Stop Session?</Text>

//           <Text style={styles.exitMessage}>
//             Are you sure you want to stop this activity? Your progress will still be recorded.
//           </Text>

//           <Pressable
//             style={styles.continueButton}
//             onPress={() => setShowExitModal(false)}
//           >
//             <Text style={styles.continueText}>Continue Session</Text>
//           </Pressable>

//           <Pressable style={styles.stopButton} onPress={confirmExitSession}>
//             <Text style={styles.stopText}>Stop Session</Text>
//           </Pressable>
//         </View>
//       </View>
//     </Modal>
//   );

//   if (sessionStatus === 'intro') {
//     return (
//       <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
//         <SafeAreaView style={styles.container}>
//           <View style={styles.topBar}>
//             <Pressable style={styles.iconButton} onPress={handleExitSession}>
//               <Ionicons name="arrow-back" size={24} color="#111" />
//             </Pressable>
//           </View>

//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.introContent}
//           >
//             <View style={styles.introCard}>
//               <Text style={styles.introLabel}>Activity Preview</Text>

//               <Image
//                 source={
//                   activity.activity_image_url
//                     ? { uri: activity.activity_image_url }
//                     : fallbackImage
//                 }
//                 style={[styles.introImage, imageSize]}
//               />

//               <Text style={styles.introTitle}>{activity.title}</Text>

//               <Text style={styles.introDescription}>
//                 {activity.teach_prompt ||
//                   'This activity will guide the learner using simple prompts, visuals, and speech practice.'}
//               </Text>

//               <View style={styles.metaRow}>
//                 <View style={styles.metaPill}>
//                   <Text style={styles.metaText}>{activity.level}</Text>
//                 </View>

//                 <View style={styles.metaPill}>
//                   <Text style={styles.metaText}>{activity.difficulty}</Text>
//                 </View>
//               </View>

//               <Pressable style={styles.startButton} onPress={handleStartSession}>
//                 <Ionicons name="play" size={18} color="#FFFFFF" />
//                 <Text style={styles.startText}>Start Session</Text>
//               </Pressable>

//               <Pressable style={styles.cancelIntroButton} onPress={handleExitSession}>
//                 <Text style={styles.cancelIntroText}>Cancel Session</Text>
//               </Pressable>
//             </View>
//           </ScrollView>

//           <ExitSessionModal />
//         </SafeAreaView>
//       </ImageBackground>
//     );
//   }

//   return (
//     <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
//       <SafeAreaView style={styles.container}>
//         <View style={styles.topBar}>
//           <Pressable style={styles.iconButton} onPress={handleExitSession}>
//             <Ionicons name="arrow-back" size={24} color="#111" />
//           </Pressable>

//           <View style={styles.sessionBadge}>
//             <Text style={styles.sessionBadgeText}>Attempt {attempts + 1}</Text>
//           </View>
//         </View>

//         <View style={styles.headerTextGroup}>
//           <Text style={styles.pageTitle}>{activity.title}</Text>
//           <Text style={styles.pageSubtitle}>{activity.category}</Text>
//         </View>

//         <View style={styles.activityPanel}>
//           <Image
//             source={
//               activity.activity_image_url
//                 ? { uri: activity.activity_image_url }
//                 : fallbackImage
//             }
//             style={[styles.mainImage, imageSize]}
//           />

//           <Text style={styles.questionText}>
//             {activity.ask_prompt || 'What do you see in the picture?'}
//           </Text>

//           <Pressable style={styles.playPromptButton} onPress={playAppPrompt}>
//             <Ionicons name="volume-high-outline" size={17} color="#B48BC7" />
//             <Text style={styles.playPromptText}>Play prompt</Text>
//           </Pressable>

//           <View style={styles.waveContainer}>
//             {waveBars.map((heightValue, index) => (
//               <Animated.View
//                 key={index}
//                 style={[
//                   styles.waveBar,
//                   {
//                     height: heightValue,
//                     opacity: speakerStatus === 'idle' ? 0.25 : 0.8,
//                     transform: [
//                       {
//                         scaleY:
//                           speakerStatus === 'idle'
//                             ? 0.55
//                             : index % 2 === 0
//                             ? scale
//                             : 1,
//                       },
//                     ],
//                   },
//                 ]}
//               />
//             ))}
//           </View>

//           <Text style={styles.listenText}>{currentStatusText}</Text>

//           <Pressable
//             style={[
//               styles.micButton,
//               speakerStatus === 'userSpeaking' && styles.activeMicButton,
//             ]}
//             onPress={handleMicPress}
//           >
//             <Ionicons
//               name={speakerStatus === 'userSpeaking' ? 'stop' : 'mic'}
//               size={28}
//               color={speakerStatus === 'userSpeaking' ? '#FFFFFF' : '#B48BC7'}
//             />
//           </Pressable>
//         </View>

//         <ExitSessionModal />
//       </SafeAreaView>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   background: { flex: 1, width: '100%', height: '100%' },
//   container: { flex: 1 },

//   topBar: {
//     paddingHorizontal: 18,
//     paddingTop: 8,
//     paddingBottom: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
  
//   iconButton: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.12,
//     shadowRadius: 5,
//     elevation: 4,
//   },

//   sessionBadge: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//   },

//   sessionBadgeText: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: '#7B5B88',
//   },

//   introContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 22,
//     paddingBottom: 30,
//   },

//   introCard: {
//     backgroundColor: 'rgba(255,255,255,0.97)',
//     borderRadius: 26,
//     padding: 22,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.16,
//     shadowRadius: 8,
//     elevation: 6,
//   },

//   introLabel: {
//     fontSize: 12,
//     fontWeight: '900',
//     color: '#B48BC7',
//     marginBottom: 14,
//     textTransform: 'uppercase',
//   },

//   introImage: {
//     borderRadius: 18,
//     resizeMode: 'cover',
//   },

//   introTitle: {
//     marginTop: 18,
//     fontSize: 23,
//     fontWeight: '900',
//     color: '#111',
//     textAlign: 'center',
//   },

//   introDescription: {
//     marginTop: 10,
//     fontSize: 14,
//     color: '#333',
//     lineHeight: 20,
//     textAlign: 'center',
//   },

//   metaRow: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 16,
//   },

//   metaPill: {
//     backgroundColor: '#F2DDF2',
//     borderRadius: 14,
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//   },

//   metaText: {
//     fontSize: 11,
//     fontWeight: '800',
//     color: '#7B5B88',
//   },

//   startButton: {
//     width: '100%',
//     height: 52,
//     borderRadius: 18,
//     backgroundColor: '#B48BC7',
//     marginTop: 22,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   startText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '900',
//     marginLeft: 8,
//   },

//   cancelIntroButton: {
//     marginTop: 14,
//   },

//   cancelIntroText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#777',
//   },

//   headerTextGroup: {
//     paddingHorizontal: 22,
//     marginTop: 4,
//     marginBottom: 16,
//   },

//   pageTitle: {
//     fontSize: 24,
//     fontWeight: '900',
//     color: '#111',
//   },

//   pageSubtitle: {
//     marginTop: 3,
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#666',
//   },

//   activityPanel: {
//     flex: 1,
//     backgroundColor: 'rgba(238, 205, 238, 0.96)',
//     borderTopLeftRadius: 38,
//     borderTopRightRadius: 38,
//     paddingTop: 34,
//     paddingHorizontal: 22,
//     alignItems: 'center',
//   },

//   mainImage: {
//     borderRadius: 18,
//     resizeMode: 'cover',
//   },

//   questionText: {
//     marginTop: 22,
//     fontSize: 20,
//     fontWeight: '900',
//     color: '#111',
//     textAlign: 'center',
//   },

//   playPromptButton: {
//     marginTop: 14,
//     height: 36,
//     borderRadius: 18,
//     paddingHorizontal: 15,
//     backgroundColor: '#FFFFFF',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   playPromptText: {
//     marginLeft: 6,
//     fontSize: 12,
//     fontWeight: '800',
//     color: '#7B5B88',
//   },

//   waveContainer: {
//     marginTop: 28,
//     height: 88,
//     width: 245,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   waveBar: {
//     width: 4,
//     borderRadius: 10,
//     backgroundColor: '#B48BC7',
//     marginHorizontal: 3,
//   },

//   listenText: {
//     marginTop: 2,
//     fontSize: 12,
//     fontWeight: '800',
//     color: '#7F6BB2',
//     textAlign: 'center',
//   },

//   micButton: {
//     position: 'absolute',
//     right: 22,
//     bottom: 22,
//     width: 58,
//     height: 58,
//     borderRadius: 29,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.16,
//     shadowRadius: 6,
//     elevation: 5,
//   },

//   activeMicButton: {
//     backgroundColor: '#B48BC7',
//   },

//   exitOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.42)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//   },

//   exitCard: {
//     width: '100%',
//     maxWidth: 310,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 20,
//     padding: 22,
//     alignItems: 'center',
//   },

//   exitTitle: {
//     fontSize: 20,
//     fontWeight: '900',
//     color: '#111',
//   },

//   exitMessage: {
//     marginTop: 10,
//     fontSize: 13,
//     color: '#555',
//     lineHeight: 19,
//     textAlign: 'center',
//   },

//   continueButton: {
//     width: '100%',
//     height: 45,
//     borderRadius: 15,
//     backgroundColor: '#B48BC7',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//   },

//   continueText: {
//     color: '#FFFFFF',
//     fontSize: 13,
//     fontWeight: '900',
//   },

//   stopButton: {
//     marginTop: 14,
//   },

//   stopText: {
//     color: '#D9534F',
//     fontSize: 13,
//     fontWeight: '800',
//   },
// });


// MOBI/mobi-backend/src/screens/Child-Mode/ActivitySessionScreen.tsx


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
import { transcribeAndEvaluateAudio, generateTTSAudio } from '../../services/api';

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

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('intro');
  const [speakerStatus, setSpeakerStatus] = useState<SpeakerStatus>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);

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
      ])
    );

    animationRef.current.start();

    return () => {
      animationRef.current?.stop();
    };
  }, [speakerStatus]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1.45],
  });

  const handleExitSession = () => {
    setShowExitModal(true);
  };

  const confirmExitSession = () => {
    setShowExitModal(false);
    navigation.navigate('ChildDashboard');
  };

  const handleStartSession = () => {
    setSessionStatus("active");
    playAppPrompt(steps[0]);
  };

  const playAppPrompt = async (stepToRead?: any, customText?: string) => {
    try {
      setSpeakerStatus("appSpeaking");

      const step = stepToRead || currentStep;

      const text =
        customText ||
        step?.prompt ||
        step?.lesson ||
        step?.question ||
        "Let's begin.";

      const audioUri = await generateTTSAudio({
        text,
        voice: "Kore",
        style:
          typeof step?.ai_voice_style === "string"
            ? step.ai_voice_style
            : customText === step?.correct_feedback?.[0]
            ? step?.ai_voice_style?.correct || "Celebratory"
            : customText === step?.wrong_feedback?.[0]
            ? step?.ai_voice_style?.wrong || "Encouraging"
            : "Teaching",
        emotion: "Calm",
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;

        if (status.didJustFinish) {
          setSpeakerStatus("idle");
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.log("TTS playback error:", error);
      setSpeakerStatus("idle");
    }
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
  if (isRecordingBusy) return;

  setIsRecordingBusy(true);

  try {
    const activeRecording = recordingRef.current;

    if (activeRecording) {
      setSpeakerStatus("idle");

      recordingRef.current = null;
      setRecording(null);

      await activeRecording.stopAndUnloadAsync();

      const uri = activeRecording.getURI();
      if (!uri || !currentStep) return;

      const result = await transcribeAndEvaluateAudio({
        audioUri: uri,
        expectedAnswers: currentStep.expected_answers || [],
        acceptedVariations: currentStep.accepted_variations || [],
      });

      setAttempts((current) => current + 1);
      setLastLearnerResponse(result.transcript);
      setLastResultCorrect(result.accepted);
      await showFeedbackForResult(result.accepted);

      console.log("Speech result:", result);
      return;
    }

    const permission = await Audio.requestPermissionsAsync();
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

  const goToNextStep = async () => {
    await cleanupRecording();

    setSelectedChoiceId(null);
    setLastLearnerResponse("");
    setLastResultCorrect(null);
    setActiveFeedbackText("");
    setAttempts(0);

    let nextIndex = currentStepIndex + 1;

    while (
      nextIndex < steps.length &&
      steps[nextIndex]?.step_type === "feedback"
    ) {
      nextIndex++;
    }

    if (nextIndex < steps.length) {
      setCurrentStepIndex(nextIndex);
      playAppPrompt(steps[nextIndex]);
    } else {
      setSessionStatus("completed");
    }
  };

  const goToPreviousStep = async () => {
  await cleanupRecording();

  if (currentStepIndex > 0) {
    setCurrentStepIndex((current) => current - 1);
  }
};
  const currentStatusText =
    speakerStatus === 'appSpeaking'
      ? 'MOBI is speaking...'
      : speakerStatus === 'userSpeaking'
      ? 'Listening to you...'
      : 'Tap the microphone when you are ready.';

  const shouldShowVoiceControl =
    currentStep?.step_type === 'ask' ||
    currentStep?.step_type === 'conversation' ||
    currentStep?.step_type === 'do_it';

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
            onSelectChoice={(id) => {
              setSelectedChoiceId(id);
              const selectedChoice = currentStep.choices?.find(
                (choice: any) => choice.id === id
              );
              // setLastResultCorrect(selectedChoice?.is_correct ?? null);
              const isCorrect = selectedChoice?.is_correct ?? null;
              setLastResultCorrect(isCorrect);
              showFeedbackForResult(isCorrect);
            }}
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

  const ExitSessionModal = () => (
    <Modal visible={showExitModal} transparent animationType="fade">
      <View style={styles.exitOverlay}>
        <View style={styles.exitCard}>
          <Text style={styles.exitTitle}>Stop Session?</Text>

          <Text style={styles.exitMessage}>
            Are you sure you want to stop this activity? Your progress will still be recorded.
          </Text>

          <Pressable
            style={styles.continueButton}
            onPress={() => setShowExitModal(false)}
          >
            <Text style={styles.continueText}>Continue Session</Text>
          </Pressable>

          <Pressable style={styles.stopButton} onPress={confirmExitSession}>
            <Text style={styles.stopText}>Stop Session</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8759D6" />
          <Text style={styles.loadingText}>Loading activity...</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (sessionStatus === 'completed') {
    return (
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <SafeAreaView style={styles.container}>
          <View style={styles.completedCard}>
            <Ionicons name="star" size={48} color="#8759D6" />

            <Text style={styles.completedTitle}>Activity Complete!</Text>

            <Text style={styles.completedText}>
              Great job finishing {fullActivity.title}.
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
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
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

          <ExitSessionModal />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={handleExitSession}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>

          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeText}>
              Step {currentStepIndex + 1} of {steps.length}
            </Text>
          </View>
        </View>

        <View style={styles.headerTextGroup}>
          <Text style={styles.pageTitle}>{fullActivity.title}</Text>
          <Text style={styles.pageSubtitle}>
            {currentStep?.step_type?.replace('_', ' ') || 'Activity'}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.activityPanel}
        >
          {renderCurrentStep()}

          {activeFeedbackText ? (
            <View style={styles.feedbackBubble}>
              <Text style={styles.feedbackBubbleText}>
                {activeFeedbackText}
              </Text>
            </View>
          ) : null}

          {shouldShowVoiceControl && (
            <SessionVoiceControl
              speakerStatus={speakerStatus}
              scale={scale}
              statusText={currentStatusText}
              onMicPress={handleMicPress}
              learnerResponse={lastLearnerResponse}
            />
          )}

          <View style={styles.navigationRow}>
            <Pressable
              style={[
                styles.navButton,
                currentStepIndex === 0 && styles.disabledButton,
              ]}
              disabled={currentStepIndex === 0}
              onPress={goToPreviousStep}
            >
              <Text style={styles.navButtonText}>Previous</Text>
            </Pressable>

            <Pressable style={styles.navButtonPrimary} onPress={goToNextStep}>
              <Text style={styles.navButtonPrimaryText}>
                {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <ExitSessionModal />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
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

  navigationRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },

  navButton: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  navButtonPrimary: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#8759D6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  navButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#8759D6',
  },

  navButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  disabledButton: {
    opacity: 0.4,
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
});