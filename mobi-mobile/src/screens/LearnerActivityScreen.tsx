import { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Speech from "expo-speech";
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import { api } from "../services/api";

type Activity = {
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

type SpeechResult = {
  transcript: string;
  transcriptConfidence: number;
  answerMatchScore: number;
  isCorrect: boolean;
  feedback: string;
};

export default function App() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [speechResult, setSpeechResult] = useState<SpeechResult | null>(null);

  const fetchActivities = async () => {
    try {
      const response = await api.get("/activities");
      setActivities(response.data);
    } catch (error) {
      console.log("Fetch error:", error);
      setMessage("Cannot connect to backend. Check IP, WiFi, and backend.");
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const speak = (text?: string) => {
    if (!text) return;
    Speech.stop();
    Speech.speak(text, {
      rate: 0.85,
      pitch: 1.05,
    });
  };

  const startRecording = async () => {
    setSpeechResult(null);
    setMessage("");

    const permission = await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {
      setMessage("Microphone permission is required.");
      return;
    }

    await recorder.prepareToRecordAsync();
    recorder.record();
    setMessage("Listening... speak now.");
  };

  const stopRecordingAndCheck = async () => {
    if (!selected) return;

    try {
      setIsChecking(true);

      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) {
        setMessage("No recording found.");
        return;
      }

      const formData = new FormData();

      formData.append("audio", {
        uri,
        name: "learner-response.m4a",
        type: "audio/m4a",
      } as any);

      formData.append("targetAnswers", selected.target_answers || "");
      formData.append("acceptableAnswers", selected.acceptable_answers || "");

      const response = await api.post("/speech/check", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result: SpeechResult = response.data;
      setSpeechResult(result);
      setMessage(result.feedback);

      if (result.isCorrect) {
        speak(selected.correct_prompt || result.feedback || "Great job!");
      } else {
        const hints = [selected.hint1, selected.hint2, selected.hint3].filter(Boolean);
        const hint = hints[attempt] || selected.support_prompt || result.feedback;

        setAttempt((prev) => prev + 1);
        speak(hint);
      }
    } catch (error) {
      console.log("Speech check error:", error);
      setMessage("Speech check failed. Check backend and OpenAI API key.");
    } finally {
      setIsChecking(false);
    }
  };

  if (selected) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              setSelected(null);
              setAttempt(0);
              setMessage("");
              setSpeechResult(null);
              Speech.stop();
            }}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <Text style={styles.level}>{selected.level} • {selected.category}</Text>
          <Text style={styles.title}>{selected.title}</Text>
          <Text style={styles.target}>Target: {selected.target_answers}</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Teach Step</Text>
            <Text style={styles.prompt}>{selected.teach_prompt || "No teaching prompt."}</Text>
            <Pressable style={styles.primaryButton} onPress={() => speak(selected.teach_prompt)}>
              <Text style={styles.buttonText}>Play Teach Prompt</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ask Step</Text>
            <Text style={styles.prompt}>{selected.ask_prompt || "No ask prompt."}</Text>
            <Pressable style={styles.primaryButton} onPress={() => speak(selected.ask_prompt)}>
              <Text style={styles.buttonText}>Play Ask Prompt</Text>
            </Pressable>
          </View>

          <View style={styles.responseBox}>
            <Text style={styles.sectionTitle}>Voice Response</Text>
            <Text style={styles.smallText}>
              Tap Start, say the target word, then tap Stop & Check.
            </Text>

            <Pressable style={styles.correctButton} onPress={startRecording}>
              <Text style={styles.buttonText}>Start Recording</Text>
            </Pressable>

            <Pressable
              style={styles.supportButton}
              onPress={stopRecordingAndCheck}
              disabled={isChecking}
            >
              <Text style={styles.buttonText}>
                {isChecking ? "Checking..." : "Stop & Check Answer"}
              </Text>
            </Pressable>

            {isChecking ? <ActivityIndicator style={{ marginTop: 16 }} /> : null}
          </View>

          {speechResult ? (
            <View style={styles.resultBox}>
              <Text style={styles.sectionTitle}>STT Result</Text>
              <Text style={styles.resultText}>Transcript: {speechResult.transcript}</Text>
              <Text style={styles.resultText}>
                Transcript Confidence: {(speechResult.transcriptConfidence * 100).toFixed(1)}%
              </Text>
              <Text style={styles.resultText}>
                Answer Match Score: {(speechResult.answerMatchScore * 100).toFixed(1)}%
              </Text>
              <Text style={styles.resultText}>
                Result: {speechResult.isCorrect ? "Correct" : "Needs Support"}
              </Text>
            </View>
          ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MOBI Learner</Text>
        <Text style={styles.subtitle}>Select an activity from PostgreSQL</Text>

        <FlatList
          data={activities}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: 14, paddingTop: 20 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                setSelected(item);
                setAttempt(0);
                setMessage("");
                setSpeechResult(null);
              }}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.smallText}>Target: {item.target_answers}</Text>
              <Text style={styles.badge}>{item.level}</Text>
            </Pressable>
          )}
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F5FF" },
  content: { padding: 20 },
  title: { fontSize: 30, fontWeight: "800", color: "#2D1B4E" },
  subtitle: { fontSize: 15, color: "#6B6280", marginTop: 6 },
  level: { color: "#7C3AED", fontWeight: "700", marginTop: 10 },
  target: { fontSize: 16, color: "#6B6280", marginTop: 8 },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginTop: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#2D1B4E" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2D1B4E",
    marginBottom: 10,
  },
  prompt: {
    fontSize: 20,
    color: "#2D1B4E",
    lineHeight: 28,
    marginBottom: 16,
  },
  smallText: { color: "#6B6280", marginTop: 6 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: "#EDE9FE",
    color: "#6D28D9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  correctButton: {
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
  },
  supportButton: {
    backgroundColor: "#F97316",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "white", fontWeight: "800" },
  responseBox: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginTop: 18,
  },
  resultBox: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginTop: 18,
  },
  resultText: {
    color: "#2D1B4E",
    marginTop: 6,
    fontWeight: "600",
  },
  message: {
    marginTop: 18,
    backgroundColor: "#EDE9FE",
    color: "#4C1D95",
    padding: 16,
    borderRadius: 18,
    fontWeight: "700",
  },
  backButton: { marginBottom: 20 },
  backText: { color: "#7C3AED", fontWeight: "800", fontSize: 16 },
});