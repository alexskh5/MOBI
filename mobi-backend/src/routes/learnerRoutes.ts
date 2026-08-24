// src/routes/learnerRoutes.ts


import { Router } from "express";
import multer from "multer";
import {
  enrollLearner,
  getLearnerById,
  getLearners,
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

/*
  GET /api/learners/:learnerId

  Returns the complete learner profile for the Center.
*/
router.get("/:learnerId", getLearnerById,);



export default router;