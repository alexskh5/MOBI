// mobi-backend/src/routes/activitySessionRoutes.ts

import { Router } from "express";

import {
  finishSession,
  getNextActivity,
  getSession,
  saveAttempt,
  startNextSession,
  startSession,
  testProgression,
  testActivityRuntime,
  respondToActivity,
} from "../controllers/activitySessionController";

const router = Router();

/* =========================================================
   START SESSION
========================================================= */

/*
  POST /api/activity-sessions/start

  Starts a new learner activity session.

  Example body:

  {
    "learnerId": "LEARNER_UUID",
    "activityId": "ACTIVITY_UUID",
    "assignmentId": "ASSIGNMENT_UUID"
  }

  assignmentId is optional for manual or future adaptive
  activity selection.
*/
router.post(
  "/start",
  startSession,
);

/* =========================================================
   SELECT AND START NEXT SESSION
========================================================= */

/*
  POST /api/activity-sessions/start-next

  Body:

  {
    "learnerId": "LEARNER_UUID"
  }

  The backend decides which activity should be played.
*/
router.post(
  "/start-next",
  startNextSession,
);

/*
  TEMPORARY DEVELOPMENT TEST.

  Remove this route after Thompson integration is verified.
*/
// router.post(
//   "/test-thompson",
//   testThompsonSampling,
// );


/* =========================================================
   PROCESS REAL LEARNER RESPONSE
========================================================= */

router.post(
  "/:sessionId/respond",
  respondToActivity,
);

/* =========================================================
   SAVE ONE ATTEMPT
========================================================= */

/*
  POST /api/activity-sessions/:sessionId/attempts

  Saves one learner response or attempt inside an active
  activity session.
*/
router.post(
  "/:sessionId/attempts",
  saveAttempt,
);

/* =========================================================
   FINISH SESSION
========================================================= */

/*
  POST /api/activity-sessions/:sessionId/finish

  Calculates and stores the session summary.

  Example body:

  {
    "learnerId": "LEARNER_UUID",
    "status": "completed",
    "totalDurationSeconds": 240
  }
*/
router.post(
  "/:sessionId/finish",
  finishSession,
);


/* =========================================================
   GET NEXT ACTIVITY
========================================================= */

/*
  GET /api/activity-sessions/next?learnerId=LEARNER_UUID

  Selection order for now:

  1. unfinished assigned activity
  2. matching Center Library activity
*/
router.get(
  "/next",
  getNextActivity,
);


/*
  TEMPORARY DEVELOPMENT TEST.

  Remove after progression logic is verified.
*/
router.post(
  "/test-progression",
  testProgression,
);


/* =========================================================
   TEMPORARY ACTIVITY RUNTIME TEST
========================================================= */

router.post(
  "/test-runtime",
  testActivityRuntime,
);

/* =========================================================
   GET ONE SESSION
========================================================= */

/*
  GET /api/activity-sessions/:sessionId?learnerId=LEARNER_UUID

  Returns the session together with its saved attempts.
*/
router.get(
  "/:sessionId",
  getSession,
);

export default router;