import fs from "fs";
import { openai } from "../../config/openai";

export async function transcribeAudio(filePath: string) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "gpt-4o-mini-transcribe",
    language: "en",
    prompt:
      "This is a child speech therapy app. The child may say short English words, approximations, repeated words, stretched sounds, or imperfect pronunciation such as doooog, caaaw, mama, water, flag, dog, cow. Transcribe in English only.",
  });

  return {
    transcript: transcription.text,
  };
}