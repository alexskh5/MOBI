import { Router } from "express";
import { requireCenterContext } from "../middleware/centerContext";
import {
  getCurrentCenterProfile,
  patchCurrentCenterProfile,
} from "../controllers/centerProfileController";

const router = Router();

router.use(requireCenterContext);

router.get("/profile", getCurrentCenterProfile);
router.patch("/profile", patchCurrentCenterProfile);

export default router;
