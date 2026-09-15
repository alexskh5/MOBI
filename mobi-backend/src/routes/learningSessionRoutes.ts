// mobi-backend/src/routes/learningSessionRoutes.ts

import { Router } from "express";

import {
  requireCenterContext,
} from "../middleware/centerContext";

import {
  startSession,
  endSession,
  startNextLearningActivity,
} from "../controllers/learningSessionController";



const router = Router();

router.use(requireCenterContext);

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


router.post(
  "/end",
  endSession,
);

// router.post(
//   "/:learningSessionId/end",
//   endSession,
// );


export default router;
