// mobi-backend/src/routes/learningSessionRoutes.ts

import { Router } from "express";

import {
  startSession,
//   endSession,
  startNextLearningActivity,
} from "../controllers/learningSessionController";



const router = Router();

/* =========================================================
   START LEARNING SESSION
========================================================= */

router.post(
  "/start",
  startSession,
);

router.post(
  "/start-next",
  startNextLearningActivity,
);


// router.post(
//   "/:learningSessionId/end",
//   endSession,
// );


export default router;