// mobi-backend/src/services/speech/speechToTextService.ts
import fs from "fs";
import { getOpenAI } from "../../config/openai";

const STT_PROVIDER_TIMEOUT_MS = 12000;

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

export async function transcribeAudio(filePath: string) {
  const openai = await getOpenAI();

  const transcription = await withTimeout(
    openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      // Previous model: "gpt-4o-mini-transcribe".
      // Whisper is steadier for short, noisy pilot-test clips.
      model: "whisper-1",
      language: "en",
      prompt:
        "Child speech therapy app. Transcribe short English child speech, approximations, repeated words, stretched sounds, animal sounds, requests, greetings, and imperfect pronunciation. Examples: moo, woof, meow, bubble please, more bubbles please, hi Moby, I want bubbles. Transcribe in English only.",
    }),
    STT_PROVIDER_TIMEOUT_MS,
    "STT provider timed out.",
  );

  return {
    transcript: transcription.text,
  };
}
