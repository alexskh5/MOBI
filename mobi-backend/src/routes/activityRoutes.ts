// mobi-backend/src/routes/activityRoutes.ts

import { Router } from "express";

import {
  archiveTherapistActivity,
  createActivity,
  deleteTherapistActivity,
  listActivities,
  listTherapistMaterials,
  readActivity,
  restoreTherapistActivity,
  submitTherapistActivityForReview,
  updateTherapistActivity,
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

router.post(
  "/",
  createActivity,
);

router.get(
  "/",
  listActivities,
);

/* =========================================================
   THERAPIST MATERIALS

   Keep these above /:id.
========================================================= */

router.get(
  "/therapists/:therapistId/materials",
  listTherapistMaterials,
);

router.patch(
  "/:id",
  updateTherapistActivity,
);

router.patch(
  "/:id/submit-review",
  submitTherapistActivityForReview,
);

router.patch(
  "/:id/archive",
  archiveTherapistActivity,
);

router.patch(
  "/:id/restore",
  restoreTherapistActivity,
);

router.delete(
  "/:id",
  deleteTherapistActivity,
);

/* =========================================================
   ACTIVITY ASSIGNMENTS
========================================================= */

router.post(
  "/assignments",
  assignActivity,
);

router.get(
  "/learners/:learnerId/assignments",
  getAssignedActivities,
);

router.patch(
  "/learners/:learnerId/assignments/:assignmentId",
  updateAssignment,
);

router.patch(
  "/learners/:learnerId/assignments/:assignmentId/cancel",
  cancelAssignment,
);

/* =========================================================
   GET ONE ACTIVITY — KEEP LAST
========================================================= */

router.get(
  "/:id",
  readActivity,
);

export default router;
