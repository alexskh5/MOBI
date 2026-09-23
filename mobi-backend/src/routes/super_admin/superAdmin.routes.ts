import { Router } from "express";
import {
  getDashboardController,
  getCenterAccountController,
  getCenterAccountsController,
  updateCenterAccountStatusController,
  getParentAccountsController,
  createCenterInvitationController,
  getCenterInvitationController,
  completeCenterInvitationController,
  getSubscriptionPlansController,
  getSystemNotificationsController,
  createSystemNotificationController,
  updateSystemNotificationController,
  deleteSystemNotificationController,
} from "../../controllers/super_admin/superAdmin.controller";

const router = Router();

router.get("/dashboard", getDashboardController);

router.get("/center", getCenterAccountController);
router.get("/centers", getCenterAccountsController);
router.patch("/centers/:centerId/status", updateCenterAccountStatusController);

router.get("/parents", getParentAccountsController);

router.post("/center-invitations", createCenterInvitationController);
router.get("/center-invitations/lookup", getCenterInvitationController);
router.post("/center-invitations/complete", completeCenterInvitationController);

router.get("/subscriptions", getSubscriptionPlansController);

router.get("/notifications", getSystemNotificationsController);
router.post("/notifications", createSystemNotificationController);
router.patch("/notifications/:notificationId", updateSystemNotificationController);
router.delete("/notifications/:notificationId", deleteSystemNotificationController);

export default router;
