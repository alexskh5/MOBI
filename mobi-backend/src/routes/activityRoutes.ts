// mobi-backend/src/routes/activityRoutes.ts

import { Router } from "express";
import multer from "multer";

import {
  archiveActivity,
  createActivity,
  deleteTherapistActivity,
  listActivities,
  listTherapistMaterials,
  readActivity,
  uploadActivityAsset,
} from "../controllers/activityController";

import {
  assignActivity,
  cancelAssignment,
  getAssignedActivities,
  updateAssignment,
} from "../controllers/activityAssignmentController";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
});

/* =========================================================
   ACTIVITY CREATION AND LIST
========================================================= */

router.post(
  "/",
  createActivity,
);

router.post(
  "/assets",
  upload.single("file"),
  uploadActivityAsset,
);

router.patch(
  "/:id/archive",
  archiveActivity,
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
