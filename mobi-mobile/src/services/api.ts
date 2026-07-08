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

const API_BASE_URL = "http://192.168.1.8:5050";

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