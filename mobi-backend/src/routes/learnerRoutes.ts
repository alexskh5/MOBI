// src/routes/learnerRoutes.ts


import { Router } from "express";
import multer from "multer";
import {
  assignLearnerDoctor,
  enrollLearner,
  getLearnerById,
  getLearnerDoctor,
  getLearners,
  createLearnerCollaborationNote,
  getLearnerCollaborationNotes,
  assignLearnerTherapists,
  getLearnerTherapists,
} from "../controllers/learnerController";
import {
  getAdaptationSettings,
  getChildSafetySettings,
  getLearnerProfileSettings,
  patchAdaptationSettings,
  patchChildSafetySettings,
  patchLearnerProfileSettings,
} from "../controllers/learnerSettingsController";
import {
  requireCenterContext,
} from "../middleware/centerContext";
import {
  decideProgression,
  evaluateProgression,
  getProgressionHistory,
} from "../controllers/progressionController";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// router.get("/test", testLearner);

/*
  upload.any() temporarily accepts the profile image
  and the other multipart form fields.
*/
router.post("/enroll", upload.any(), enrollLearner);

/* =========================================================
   GET LEARNER LIST
========================================================= */
router.get("/", getLearners,);

router.get(
  "/:learnerId/profile-settings",
  requireCenterContext,
  getLearnerProfileSettings,
);

router.patch(
  "/:learnerId/profile-settings",
  requireCenterContext,
  patchLearnerProfileSettings,
);

router.get(
  "/:learnerId/adaptation-settings",
  requireCenterContext,
  getAdaptationSettings,
);

router.patch(
  "/:learnerId/adaptation-settings",
  requireCenterContext,
  patchAdaptationSettings,
);

router.get(
  "/:learnerId/child-safety-settings",
  requireCenterContext,
  getChildSafetySettings,
);

router.patch(
  "/:learnerId/child-safety-settings",
  requireCenterContext,
  patchChildSafetySettings,
);

router.post(
  "/:learnerId/progression/evaluate",
  requireCenterContext,
  evaluateProgression,
);

router.get(
  "/:learnerId/progression/history",
  requireCenterContext,
  getProgressionHistory,
);

router.post(
  "/:learnerId/progression/:recommendationId/decision",
  requireCenterContext,
  decideProgression,
);

/*
  GET /api/learners/:learnerId

  Returns the complete learner profile for the Center.
*/
router.get("/:learnerId", getLearnerById,);



export default router;
