// mobi-backend/src/routes/activityRoutes.ts

import { Router } from "express";

import {
  createActivity,
  listActivities,
  readActivity,
} from "../controllers/activityController";

import {
  assignActivity,
  cancelAssignment,
  getAssignedActivities,
  updateAssignment,
} from "../controllers/activityAssignmentController";

const router = Router();

/* =========================================================
   ACTIVITY CREATION AND LIST
========================================================= */

/*
  POST /activities

  Creates an activity together with its activity steps.
*/
router.post(
  "/",
  createActivity,
);

/*
  GET /activities

  Returns the activity library.
*/
router.get(
  "/",
  listActivities,
);

/* =========================================================
   ACTIVITY ASSIGNMENTS
========================================================= */

/*
  POST /activities/assignments

  Assigns one existing activity to one or more learners.

  Example request body:

  {
    "activityId": "ACTIVITY_UUID",
    "learnerIds": [
      "LEARNER_UUID_1",
      "LEARNER_UUID_2"
    ],
    "assignmentType": "recommended",
    "priority": 1
  }
*/
router.post(
  "/assignments",
  assignActivity,
);

/*
  GET /activities/learners/:learnerId/assignments

  Returns the learner's pending and in-progress assignments.

  Optional query:

  ?status=pending,in_progress

  Other possible values:

  completed
  skipped
  cancelled
*/
router.get(
  "/learners/:learnerId/assignments",
  getAssignedActivities,
);

/*
  PATCH
  /activities/learners/:learnerId/assignments/:assignmentId

  Updates assignment type, priority, limits, or status.

  Example request body:

  {
    "status": "in_progress",
    "startedAt": "2026-08-04T12:00:00.000Z"
  }
*/
router.patch(
  "/learners/:learnerId/assignments/:assignmentId",
  updateAssignment,
);

/*
  PATCH
  /activities/learners/:learnerId/assignments/:assignmentId/cancel

  Cancels the assignment without deleting its history.
*/
router.patch(
  "/learners/:learnerId/assignments/:assignmentId/cancel",
  cancelAssignment,
);

/* =========================================================
   GET ONE ACTIVITY

   Keep this route LAST.

   If /:id were placed above /assignments, Express could
   interpret the word "assignments" as an activity ID.
========================================================= */

/*
  GET /activities/:id
*/
router.get(
  "/:id",
  readActivity,
);

export default router;