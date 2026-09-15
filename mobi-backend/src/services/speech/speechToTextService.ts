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
      model: "gpt-4o-mini-transcribe",
      language: "en",
      prompt:
        "This is a child speech therapy app. The child may say short English words, approximations, repeated words, stretched sounds, or imperfect pronunciation such as doooog, caaaw, mama, water, flag, dog, cow. Transcribe in English only.",
    }),
    STT_PROVIDER_TIMEOUT_MS,
    "STT provider timed out.",
  );

  return {
    transcript: transcription.text,
  };
}
