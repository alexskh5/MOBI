import { Router } from "express";

import {
  finishSession,
  getNextActivity,
  getSession,
  respondToActivity,
  skipActivityStep,
  startNextSession,
  startSession,
} from "../controllers/activitySessionController";
import {
  requireCenterContext,
} from "../middleware/centerContext";

const router = Router();

router.use(requireCenterContext);

router.get("/next", getNextActivity);
router.post("/start", startSession);
router.post("/start-next", startNextSession);

/*
  Mobile still uses these compatibility routes for activity
  selection and child sessions. Learning sessions remain the
  auditable parent flow, while activity sessions hold each
  concrete child activity run.
*/
router.post("/:sessionId/respond", respondToActivity);
router.post(
  "/:sessionId/steps/:activityStepId/skip",
  skipActivityStep,
);
router.post("/:sessionId/finish", finishSession);
router.get("/:sessionId", getSession);

export default router;
