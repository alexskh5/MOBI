// // mobi-mobile/src/services/api.ts
// import axios from "axios";

// // Replace with your computer's IP address
// // Run 'ipconfig getifaddr en0' on Mac to find IP
// const LOCAL_IP = "192.168.1.18"; // Replace with actual IP

// export const api = axios.create({
//   baseURL: `http://${LOCAL_IP}:5001/api`,
//   timeout: 10000,
// });

// // Add request interceptor for debugging
// api.interceptors.request.use(
//   (config) => {
//     console.log(`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
//     return config;
//   },
//   (error) => {
//     console.log("Request error:", error);
//     return Promise.reject(error);
//   }
// );

// api.interceptors.response.use(
//   (response) => {
//     console.log(`Response: ${response.status}`);
//     return response;
//   },
//   (error) => {
//     console.log("Error:", error.message);
//     return Promise.reject(error);
//   }
// );

// // if error run command ipconfig getifaddr en0 on device terminal to get ip address then replace



// mobi-mobile/src/services/api.ts

import * as FileSystem from "expo-file-system/legacy";

const API_BASE_URL = "http://192.168.1.20:5050";

export async function getActivities() {
  const response = await fetch(`${API_BASE_URL}/activities`);

  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  return response.json();
}

export async function getActivityById(id: string) {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch activity");
  }

  return response.json();
}

export async function transcribeAndEvaluateAudio({
  audioUri,
  expectedAnswers,
  acceptedVariations,
}: {
  audioUri: string;
  expectedAnswers: string[];
  acceptedVariations: string[];
}) {
  const formData = new FormData();

  formData.append("audio", {
    uri: audioUri,
    name: "learner-answer.mp4",
    type: "audio/mp4",
  } as any);

  formData.append("expected_answers", JSON.stringify(expectedAnswers));
  formData.append("accepted_variations", JSON.stringify(acceptedVariations));

  const response = await fetch(`${API_BASE_URL}/speech/transcribe-and-evaluate`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to transcribe and evaluate audio");
  }

  return response.json();
}

export async function generateTTSAudio({
  text,
  voice = "Kore",
  style = "Teaching",
  emotion = "Calm",
}: {
  text: string;
  voice?: string;
  style?: string;
  emotion?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/speech/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice,
      style,
      emotion,
      return_base64: true,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate speech.");
  }

  const data = await response.json();

  const fileUri =
    FileSystem.cacheDirectory +
    `mobi-tts-${Date.now()}.${data.file_extension || "wav"}`;

  await FileSystem.writeAsStringAsync(
    fileUri,
    data.audio_base64,
    {
      encoding: FileSystem.EncodingType.Base64,
    }
  );

  return fileUri;
}



/* =========================================================
   ADAPTIVE ACTIVITY SELECTION
========================================================= */

export interface RecommendedActivityResponse {
  success: boolean;

  nextActivity:
    | {
        activityId: string;

        assignmentId:
          string | null;

        source:
          string;

        selectionAlgorithm:
          string | null;

        selectionReason:
          Record<
            string,
            unknown
          >;

        activity: {
          id: string;

          title: string;

          description:
            string | null;

          activity_type:
            string;

          speech_ladder_level:
            string | null;

          delivery_mode:
            string;

          interaction_mode:
            string;

          max_attempts:
            number;

          estimated_minutes:
            number;

          allow_skip:
            boolean;

          success_required_count:
            number;

          thumbnail_url:
            string | null;
        };
      }
    | null;
}

/* =========================================================
   GET NEXT RECOMMENDED ACTIVITY
========================================================= */

export async function getNextRecommendedActivity(
  learnerId:
    string,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/api/activity-sessions/next?learnerId=${encodeURIComponent(
        learnerId,
      )}`,
    );

  if (!response.ok) {
    throw new Error(
      "Failed to get recommended activity.",
    );
  }

  return response.json() as
    Promise<RecommendedActivityResponse>;
}

/* =========================================================
   START ACTIVITY SESSION
========================================================= */

export async function startActivitySession({
  learnerId,
  activityId,
  assignmentId = null,
  sessionSource = "manual",
  selectionAlgorithm = null,
  selectionReason = {},
}: {
  learnerId:
    string;

  activityId:
    string;

  assignmentId?:
    string | null;

  sessionSource?:
    | "assigned_required"
    | "assigned_recommended"
    | "adaptive"
    | "manual";

  selectionAlgorithm?:
    string | null;

  selectionReason?:
    Record<
      string,
      unknown
    >;
}) {
  const response =
    await fetch(
      `${API_BASE_URL}/api/activity-sessions/start`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            learnerId,

            activityId,

            assignmentId,

            sessionSource,

            selectionAlgorithm,

            selectionReason,
          }),
      },
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to start activity session.",
    );
  }

  return result;
}

/* =========================================================
   RESPOND INSIDE ACTIVE ACTIVITY SESSION
========================================================= */

export async function respondToActivitySession({
  sessionId,
  learnerId,

  attemptOrder,
  stepAttemptNumber,

  transcript,

  expectedAnswers,
  acceptedVariations,

  responseTimeMs,

  gazeDetectionAvailable = false,
  gazePresent = null,
  gazeAwaySeconds = 0,
  inactivitySeconds = 0,

  reachedMaximumAttempts = false,
  activityCompleted = false,

  therapistRequestedStop = false,
  parentRequestedStop = false,

  adaptiveSettings,
}: {
  sessionId:
    string;

  learnerId:
    string;

  attemptOrder:
    number;

  stepAttemptNumber:
    number;

  transcript:
    string;

  expectedAnswers:
    string[];

  acceptedVariations:
    string[];

  responseTimeMs:
    number | null;

  gazeDetectionAvailable?:
    boolean;

  gazePresent?:
    boolean | null;

  gazeAwaySeconds?:
    number;

  inactivitySeconds?:
    number;

  reachedMaximumAttempts?:
    boolean;

  activityCompleted?:
    boolean;

  therapistRequestedStop?:
    boolean;

  parentRequestedStop?:
    boolean;

  adaptiveSettings: {
    inactivityBreakSeconds:
      number;

    inactivityAutoStopSeconds:
      number;

    oneMoreTryEnabled:
      boolean;

    allowBreakSuggestion:
      boolean;
  };
}) {
  const response =
    await fetch(
      `${API_BASE_URL}/api/activity-sessions/${sessionId}/respond`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            learnerId,

            attemptOrder,

            stepAttemptNumber,

            transcript,

            expectedAnswers,

            acceptedVariations,

            responseTimeMs,

            gazeDetectionAvailable,

            gazePresent,

            gazeAwaySeconds,

            inactivitySeconds,

            reachedMaximumAttempts,

            activityCompleted,

            therapistRequestedStop,

            parentRequestedStop,

            adaptiveSettings,
          }),
      },
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to process learner response.",
    );
  }

  return result;
}

/* =========================================================
   FINISH ACTIVITY SESSION
========================================================= */

export async function finishActivitySession({
  sessionId,
  learnerId,
  status = "completed",

  totalDurationSeconds = 0,
  inactivitySeconds = 0,

  gazePresentSeconds = 0,
  gazeAwaySeconds = 0,
  gazeDetectionAvailable = false,

  breakCount = 0,
  breakSuggested = false,

  stoppedBy = null,
  stopReason = null,

  recommendedNextAction = null,
}: {
  sessionId:
    string;

  learnerId:
    string;

  status?:
    | "completed"
    | "skipped"
    | "stopped"
    | "interrupted";

  totalDurationSeconds?:
    number;

  inactivitySeconds?:
    number;

  gazePresentSeconds?:
    number;

  gazeAwaySeconds?:
    number;

  gazeDetectionAvailable?:
    boolean;

  breakCount?:
    number;

  breakSuggested?:
    boolean;

  stoppedBy?:
    string | null;

  stopReason?:
    string | null;

  recommendedNextAction?:
    | "continue_assigned"
    | "same_difficulty"
    | "increase_difficulty"
    | "decrease_difficulty"
    | "suggest_break"
    | "end_session"
    | "therapist_review"
    | null;
}) {
  const response =
    await fetch(
      `${API_BASE_URL}/api/activity-sessions/${sessionId}/finish`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            learnerId,

            status,

            totalDurationSeconds,

            inactivitySeconds,

            gazePresentSeconds,

            gazeAwaySeconds,

            gazeDetectionAvailable,

            breakCount,

            breakSuggested,

            stoppedBy,

            stopReason,

            recommendedNextAction,
          }),
      },
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to finish activity session.",
    );
  }

  return result;
}