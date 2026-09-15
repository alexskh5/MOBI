// mobi-backend/src/services/speech/textToSpeechService.ts

import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  VOICE_STYLE_PROMPTS,
  VOICE_EMOTION_PROMPTS,
} from "../../constants/voicePrompts";


// ALWAYS UPDATE HERE INCASE A PROMPT IS BEING CHANGE
const PROMPT_VERSION = 2;

const cacheDir = path.join(process.cwd(), "tts-cache");
const TTS_PROVIDER_TIMEOUT_MS = 12000;

let ai: any;

async function getGoogleGenAI() {
  if (ai) {
    return ai;
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY in .env");
  }

  const { GoogleGenAI } = await import("@google/genai");
  ai = new GoogleGenAI({ apiKey });

  return ai;
}

function ensureCacheDir() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

type GenerateSpeechInput = {
  text: string;
  voice?: string;
  speed?: number;
  style?: string;
  emotion?: string;
};

function buildPrompt(
  text: string,
  style: string,
  emotion: string,
  speed: number
) {
  const stylePrompt =
    VOICE_STYLE_PROMPTS[
      style as keyof typeof VOICE_STYLE_PROMPTS
    ] ??
    VOICE_STYLE_PROMPTS.Teaching;

  const emotionPrompt =
    VOICE_EMOTION_PROMPTS[
      emotion as keyof typeof VOICE_EMOTION_PROMPTS
    ] ??
    VOICE_EMOTION_PROMPTS.Calm;

  const speedPrompt =
    speed < 0.95
      ? "Use a slower pace than usual with slightly longer pauses."
      : speed > 1.05
      ? "Use a slightly quicker pace while keeping every word clear and calm."
      : "Use a moderate, natural pace.";

  return `
You are MOBI's AI speech therapist.

MOBI is a speech and social readiness application designed for young autistic children.

Your speech should always feel:

• calm
• predictable
• emotionally safe
• warm
• encouraging
• easy to understand
• never robotic
• never sarcastic
• never rushed

General speaking rules:

• Speak naturally.
• Clearly pronounce every word.
• Use short pauses between sentences.
• Never exaggerate excitement.
• Never shout.
• Never add extra words.
• Never remove words.
• Read ONLY the provided text.
${style === "Storytelling" ? "• You may sound like a gentle story narrator." : "• Avoid sounding like a narrator."}
• Sound like a caring therapist.

Voice Style

${stylePrompt}

Emotion

${emotionPrompt}

Pace

${speedPrompt}

Now read EXACTLY this text:

"${text}"
`;
}

function createCacheKey({
  text,
  voice,
  speed,
  style,
  emotion,
}: {
  text: string;
  voice: string;
  speed: number;
  style: string;
  emotion: string;
}) {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        provider: "gemini",
        model: "gemini-2.5-flash-preview-tts",

        promptVersion: PROMPT_VERSION,

        text: text.trim(),

        voice,
        speed,

        style,
        emotion,
      })
    )
    .digest("hex");
}

function createWavBuffer(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  channels = 1,
  bitDepth = 16
) {
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  const dataSize = pcmBuffer.length;

  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeout,
  ]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

export async function generateSpeech({
  text,
  voice = "Kore",
  style = "Teaching",
  speed = 1.0,
  emotion = "Calm",
}: GenerateSpeechInput) {
  if (!text.trim()) {
    throw new Error("Text is required.");
  }

  ensureCacheDir();

  const cacheKey = createCacheKey({
    text,
    voice,
    speed,
    style,
    emotion,
});

  const cachePath = path.join(cacheDir, `${cacheKey}.wav`);

  if (fs.existsSync(cachePath)) {
    console.log("TTS cache hit:", cacheKey);
    return fs.readFileSync(cachePath);
  }

  console.log("TTS cache miss. Generating:", cacheKey);

  const ai = await getGoogleGenAI();

  const response = await withTimeout(
    ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(text, style, emotion, speed) }],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    }),
    TTS_PROVIDER_TIMEOUT_MS,
    "TTS provider timed out.",
  );

  const audioBase64 =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!audioBase64) {
    throw new Error("No audio returned from Gemini TTS.");
  }

  const pcmBuffer = Buffer.from(audioBase64, "base64");
  const wavBuffer = createWavBuffer(pcmBuffer);

  fs.writeFileSync(cachePath, wavBuffer);

  return wavBuffer;
}
