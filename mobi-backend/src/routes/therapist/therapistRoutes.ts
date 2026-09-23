import { Router } from "express";

import {
  createTherapist,
  createTherapistLearnerCollaborationNote,
  deleteTherapist,
  getTherapistById,
  getTherapistLearners,
  getTherapists,
  sendTherapistAccessCode,
  updateTherapist,
} from "../../controllers/therapist/therapistController";

const router = Router();


router.post(
  "/",
  createTherapist,
);


router.get(
  "/",
  getTherapists,
);



router.post(
  "/:therapistId/access-code",
  sendTherapistAccessCode,
);


router.get(
  "/:therapistId/learners",
  getTherapistLearners,
);



router.post(
  "/:therapistId/learners/:learnerId/notes",
  createTherapistLearnerCollaborationNote,
);

router.get(
  "/:therapistId",
  getTherapistById,
);

router.put(
  "/:therapistId",
  updateTherapist,
);

router.delete(
  "/:therapistId",
  deleteTherapist,
);


export default router;