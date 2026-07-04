// // mobi-backend/src/services/speech/textToSpeechService.ts


// import { openai } from "../../config/openai"; 

// type GenerateSpeechInput = {
//   text: string;
//   voice?: string;
//   speed?: number;
//   style?: string;
//   emotion?: string;

// };

// function buildInstructions(
//   style: string,
//   emotion: string
// ) {
//   const stylePrompts: Record<string, string> = {
//     Teaching:
//       "Speak like an experienced speech therapist teaching a young autistic child. Be clear, patient and easy to understand.",

//     Friendly:
//       "Speak warmly and naturally like a caring friend.",

//     Curious:
//       "Speak with curiosity to encourage the child to answer.",

//     Encouraging:
//       "You are a licensed pediatric speech therapist working with a 6-year-old autistic child. Speak warmly and gently. Smile while speaking. Celebrate small successes. Use natural pauses. Sound human. Never sound like a narrator. Avoid monotone delivery. Each sentence should feel encouraging and emotionally expressive.",

//     Celebratory:
//       "Celebrate success with genuine happiness while remaining calm and not overwhelming.",

//     Conversation:
//       "Speak naturally as if having a relaxed conversation with a young child.",
//   };

//   const emotionPrompts: Record<string, string> = {
//     Calm:
//       "You are a licensed pediatric speech therapist working with a 6-year-old autistic child. Speak warmly and gently. Smile while speaking. Celebrate small successes. Use natural pauses. Sound human. Never sound like a narrator. Avoid monotone delivery. Each sentence should feel encouraging and emotionally expressive.",

//     Gentle:
//       "You are a licensed pediatric speech therapist working with a 6-year-old autistic child. Speak warmly and gently. Smile while speaking. Celebrate small successes. Use natural pauses. Sound human. Never sound like a narrator. Avoid monotone delivery. Each sentence should feel encouraging and emotionally expressive.",

//     Happy:
//       "Sound cheerful and positive.",

//     Excited:
//       "Sound energetic but never overwhelming.",

//     Neutral:
//       "Maintain a neutral professional tone.",
//   };

//   return `
// ${stylePrompts[style] || ""}

// ${emotionPrompts[emotion] || ""}

// Pronounce words clearly.
// Leave short pauses between sentences.
// Avoid sounding robotic.
// `;
// }

// export async function generateSpeech({
//   text,
//   voice = "nova",
//   speed = 1.0,
//   style = "Teaching",
//   emotion = "Calm",
// }: GenerateSpeechInput) {
//   if (!text.trim()) {
//     throw new Error("Text is required.");
//   }

//   const instructions = buildInstructions(
//     style,
//     emotion
//   );

//   const response = await openai.audio.speech.create({
//     model: "gpt-4o-mini-tts",

//     voice,

//     input: text,

//     instructions,

//     speed,

//     response_format: "mp3",
//   });

//   const arrayBuffer = await response.arrayBuffer();

//   return Buffer.from(arrayBuffer);
// }




// mobi-backend/src/services/speech/textToSpeechService.ts

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("Missing GOOGLE_API_KEY in .env");
}

const ai = new GoogleGenAI({ apiKey });

const cacheDir = path.join(process.cwd(), "tts-cache");

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

type GenerateSpeechInput = {
  text: string;
  voice?: string;
  speed?: number;
  style?: string;
  emotion?: string;
};

function buildPrompt(text: string, style: string, emotion: string) {
  return `
Read this aloud exactly, but perform it in a ${emotion}, ${style} voice.

This is for MOBI, a speech therapy app for young autistic children.
Sound natural, warm, expressive, and child-friendly.
Use clear pronunciation and natural pauses.
Do not sound robotic or like a narrator.

Text:
"${text}"
`;
}

function createCacheKey({
  text,
  voice,
  style,
  emotion,
}: {
  text: string;
  voice: string;
  style: string;
  emotion: string;
}) {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        text: text.trim(),
        voice,
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

export async function generateSpeech({
  text,
  voice = "Kore",
  style = "Teaching",
  emotion = "Calm",
}: GenerateSpeechInput) {
  if (!text.trim()) {
    throw new Error("Text is required.");
  }

  const cacheKey = createCacheKey({
    text,
    voice,
    style,
    emotion,
  });

  const cachePath = path.join(cacheDir, `${cacheKey}.wav`);

  if (fs.existsSync(cachePath)) {
    console.log("TTS cache hit:", cacheKey);
    return fs.readFileSync(cachePath);
  }

  console.log("TTS cache miss. Generating:", cacheKey);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [
      {
        role: "user",
        parts: [{ text: buildPrompt(text, style, emotion) }],
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
  });

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