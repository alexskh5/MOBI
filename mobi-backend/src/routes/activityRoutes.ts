// src/routes/activityRoutes.ts

import { Router } from "express";
import {
  createActivity,
  listActivities,
  readActivity,
} from "../controllers/activityController";

const router = Router();

router.post("/", createActivity);
router.get("/", listActivities);
router.get("/:id", readActivity);

export default router;