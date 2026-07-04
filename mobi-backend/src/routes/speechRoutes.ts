//mobi-backend/src/routes/speechRoutes.ts

import { Router } from "express";
import multer from "multer";
import path from "path";
import { evaluateSpeechText, transcribeSpeech, transcribeAndEvaluateSpeech, generateSpeechAudio } from "../controllers/speechController";

const router = Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/transcribe", upload.single("audio"), transcribeSpeech);

router.post("/evaluate", evaluateSpeechText);

router.post(
  "/transcribe-and-evaluate",
  upload.single("audio"),
  transcribeAndEvaluateSpeech
);



router.post("/tts", generateSpeechAudio);

export default router;