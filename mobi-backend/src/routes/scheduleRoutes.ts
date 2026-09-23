import { Router } from "express";
import {
  deleteSchedule,
  getSchedules,
  patchSchedule,
  postSchedule,
  respondToSchedule,
} from "../controllers/scheduleController";

const router = Router();

router.get("/", getSchedules);
router.post("/", postSchedule);
router.patch("/:scheduleId", patchSchedule);
router.delete("/:scheduleId", deleteSchedule);
router.patch("/:scheduleId/:action", respondToSchedule);

export default router;
