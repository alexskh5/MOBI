import { Router } from "express";

import {
  getStaffSecurityStatus,
  passwordLogin,
  recordPasswordUpdate,
  requestPasswordResetCode,
  requestStaffLoginCode,
  verifyPasswordResetCode,
  verifyStaffOtp,
} from "../controllers/staffAuthController";

const router = Router();

/*
  Registered in server.ts as:
  app.use("/api/staff-auth", staffAuthRoutes);
*/

/* First-time invitation / activation */
router.post(
  "/request-code",
  requestStaffLoginCode,
);

router.post(
  "/verify-otp",
  verifyStaffOtp,
);

/* Normal professional login */
router.post(
  "/password-login",
  passwordLogin,
);

/* Forgot-password recovery */
router.post(
  "/request-password-reset",
  requestPasswordResetCode,
);

router.post(
  "/verify-password-reset",
  verifyPasswordResetCode,
);

/* Authenticated account-security lifecycle */
router.get(
  "/security-status",
  getStaffSecurityStatus,
);

router.post(
  "/password-updated",
  recordPasswordUpdate,
);

export default router;
