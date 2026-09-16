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
  "/:learnerId/doctor",
  getLearnerDoctor,
);

router.put(
  "/:learnerId/doctor",
  assignLearnerDoctor,
);

router.get(
  "/:learnerId/notes",
  getLearnerCollaborationNotes,
);

router.post(
  "/:learnerId/notes",
  createLearnerCollaborationNote,
);


router.get(
  "/:learnerId/therapists",
  getLearnerTherapists,
);

router.put(
  "/:learnerId/therapists",
  assignLearnerTherapists,
);

/*
  GET /api/learners/:learnerId

  Returns the complete learner profile for the Center.
*/
router.get("/:learnerId", getLearnerById,);



export default router;