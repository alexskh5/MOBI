//mobi-backend/src/controller/speechController.ts
import { Request, Response } from "express";
import fs from "fs";
import { transcribeAudio } from "../services/speech/speechToTextService";
import { evaluateSpeech } from "../services/speech/evaluateSpeechService";
import { generateSpeech } from "../services/speech/textToSpeechService";

type MulterRequest = Request & {

  file?: Express.Multer.File;

};

export async function transcribeSpeech(req: MulterRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No audio file uploaded.",
      });
    }
    console.log(req.file);
    const result = await transcribeAudio(req.file.path);

    fs.unlinkSync(req.file.path);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("STT error:", error);

    return res.status(500).json({
      message: "Failed to transcribe audio.",
      error: error.message,
    });
  }
}

export async function evaluateSpeechText(req: Request, res: Response) {
  try {
    const { transcript, expected_answers, accepted_variations } = req.body;

    const result = evaluateSpeech({
      transcript,
      expectedAnswers: expected_answers || [],
      acceptedVariations: accepted_variations || [],
    });

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to evaluate speech.",
      error: error.message,
    });
  }
}

export async function transcribeAndEvaluateSpeech(
  req: MulterRequest,
  res: Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No audio file uploaded.",
      });
    }

    const {
      expected_answers,
      accepted_variations,
    } = req.body;

    // 1. Speech → Text
    const transcription = await transcribeAudio(req.file.path);

    fs.unlinkSync(req.file.path);

    // 2. Evaluate
    const evaluation = evaluateSpeech({
      transcript: transcription.transcript,
      expectedAnswers: JSON.parse(expected_answers || "[]"),
      acceptedVariations: JSON.parse(
        accepted_variations || "[]"
      ),
    });

    // 3. Return both
    return res.status(200).json({
      transcript: transcription.transcript,
      ...evaluation,
    });

  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: "Evaluation failed.",
      error: error.message,
    });
  }
}

export async function generateSpeechAudio(req: Request, res: Response) {
  try {
    const {
        text,
        voice,
        speed,
        style,
        emotion,
      } = req.body;

    const audioBuffer = await generateSpeech({
        text,
        voice: voice || "nova",
        speed: speed || 1.0,
        style: style || "Teaching",
        emotion: emotion || "Calm",
      });

    // res.setHeader("Content-Type", "audio/mpeg");
    // res.setHeader("Content-Disposition", "inline; filename=tts-preview.mp3");
    // return res.status(200).send(audioBuffer);

    if (req.body.return_base64) {
      return res.status(200).json({
        audio_base64: audioBuffer.toString("base64"),
        mime_type: "audio/wav",
        file_extension: "wav",
      });
    }

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", "inline; filename=tts-preview.wav");

    return res.status(200).send(audioBuffer);
    
  } catch (error: any) {
    console.error("TTS error:", error);

    return res.status(500).json({
      message: "Failed to generate speech.",
      error: error.message,
    });
  }
}

