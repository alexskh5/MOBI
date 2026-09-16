import {
  Router,
} from "express";

import {
  deleteCenterStaff,
  getCenterStaff,
  getDoctorLearners,
  getTherapistLearners,
  patchCenterStaff,
  postCenterStaff,
  putTherapistLearners,
} from "../controllers/centerStaffController";
import {
  requireCenterContext,
} from "../middleware/centerContext";

const router = Router();

router.use(requireCenterContext);

router.get(
  "/therapist/:therapistId/learners",
  getTherapistLearners,
);

router.put(
  "/therapist/:therapistId/learners",
  putTherapistLearners,
);

router.get("/doctor/:doctorId/learners", getDoctorLearners);

router.get("/:role", getCenterStaff);
router.post("/:role", postCenterStaff);
router.patch("/:role/:staffId", patchCenterStaff);
router.delete("/:role/:staffId", deleteCenterStaff);

export default router;
