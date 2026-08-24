import { Router } from "express";
import {
  getDashboardController,
  getCenterAccountController,
  getParentAccountsController,
  getSubscriptionPlansController,
  getSystemNotificationsController,
  createSystemNotificationController,
  updateSystemNotificationController,
  deleteSystemNotificationController,
} from "../../controllers/super_admin/superAdmin.controller";

const router = Router();

router.get("/dashboard", getDashboardController);

router.get("/center", getCenterAccountController);

router.get("/parents", getParentAccountsController);

router.get("/subscriptions", getSubscriptionPlansController);

router.get("/notifications", getSystemNotificationsController);
router.post("/notifications", createSystemNotificationController);
router.patch("/notifications/:notificationId", updateSystemNotificationController);
router.delete("/notifications/:notificationId", deleteSystemNotificationController);

export default router;