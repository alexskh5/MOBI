import {
  Router,
} from "express";

import {
  getProgressOverview,
  getSpeechTraining,
  getSocialReadiness,
  getPerActivity,
} from "../controllers/progressController";

const router =
  Router();

/* =========================================================
   PAGE 1 — PROGRESS OVERVIEW
========================================================= */

/*
  Example:

  GET
  /api/progress/overview
  ?learnerId=LEARNER_UUID
  &period=week
  &anchorDate=2026-08-20
*/
router.get(
  "/overview",
  getProgressOverview,
);


/* =========================================================
   PAGE 2 — SPEECH TRAINING RESULT
========================================================= */

router.get(
  "/speech-training",
  getSpeechTraining,
);

/* =========================================================
   PAGE 3 — SOCIAL READINESS RESULT
========================================================= */

router.get(
  "/social-readiness",
  getSocialReadiness,
);


/* =========================================================
   PAGE 4 — PER ACTIVITY ANALYSIS
========================================================= */

router.get(
  "/per-activity",
  getPerActivity,
);

export default router;