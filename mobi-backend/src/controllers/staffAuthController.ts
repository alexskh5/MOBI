import type {
  Request,
  Response,
} from "express";

import {
  getStaffSecurityStatusService,
  passwordLoginService,
  recordPasswordUpdateService,
  requestPasswordResetCodeService,
  requestStaffLoginCodeService,
  StaffAuthError,
  verifyPasswordResetCodeService,
  verifyStaffOtpService,
  type PasswordUpdateFlow,
  type StaffRole,
} from "../services/auth/staffAuthService";

/*
  TEMPORARY:
  Until Center authentication exists.
*/
const CENTER_ID =
  "d5ae1649-0343-46d4-b433-575c97e064e1";

function normalizeEmail(
  value: unknown,
) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function normalizeStaffRole(
  value: unknown,
): StaffRole | null {
  return value === "doctor" ||
    value === "therapist"
    ? value
    : null;
}

function normalizePasswordFlow(
  value: unknown,
): PasswordUpdateFlow | null {
  return value === "initial" ||
    value === "recovery" ||
    value === "change"
    ? value
    : null;
}

function getBearerToken(
  req: Request,
) {
  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return "";
  }

  return authorization
    .slice("Bearer ".length)
    .trim();
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

function respondWithError(
  res: Response,
  error: unknown,
  fallback: string,
) {
  if (error instanceof StaffAuthError) {
    return res
      .status(error.statusCode)
      .json({
        success: false,
        message: error.message,
      });
  }

  return res.status(500).json({
    success: false,
    message: fallback,
    error:
      error instanceof Error
        ? error.message
        : fallback,
  });
}

export const requestStaffLoginCode =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body.email,
        );

      const role =
        normalizeStaffRole(
          req.body.role,
        );

      if (!role) {
        return res.status(400).json({
          success: false,
          message:
            "Please select Doctor or Therapist before requesting an activation code.",
        });
      }

      if (!validEmail(email)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid registered email address.",
        });
      }

      await requestStaffLoginCodeService({
        email,
        centerId: CENTER_ID,
        role,
      });

      return res.status(200).json({
        success: true,
        message:
          "If this email belongs to an eligible MOBI professional account, an activation code has been sent.",
      });
    } catch (error) {
      console.error(
        "Request staff activation code error:",
        error,
      );

      return respondWithError(
        res,
        error,
        "Unable to request an activation code.",
      );
    }
  };

export const verifyStaffOtp =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body.email,
        );

      const role =
        normalizeStaffRole(
          req.body.role,
        );

      const code =
        typeof req.body.code === "string"
          ? req.body.code.replace(/\s+/g, "")
          : "";

      if (!role) {
        return res.status(400).json({
          success: false,
          message:
            "Please select Doctor or Therapist before activating the account.",
        });
      }

      if (!validEmail(email)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid registered email address.",
        });
      }

      if (!/^\d{8}$/.test(code)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter the 8-digit activation code sent to your email.",
        });
      }

      const result =
        await verifyStaffOtpService({
          email,
          token: code,
          centerId: CENTER_ID,
          role,
        });

      return res.status(200).json({
        success: true,
        message:
          result.requiresPasswordSetup
            ? "Account verified. Create your permanent password to finish setup."
            : "Account verified.",
        role: result.role,
        profile: result.profile,
        doctor: result.doctor,
        therapist: result.therapist,
        requiresPasswordSetup:
          result.requiresPasswordSetup,
        passwordSetAt:
          result.passwordSetAt,
        session: {
          access_token:
            result.session.access_token,
          refresh_token:
            result.session.refresh_token,
          expires_at:
            result.session.expires_at,
          expires_in:
            result.session.expires_in,
          token_type:
            result.session.token_type,
        },
      });
    } catch (error) {
      console.error(
        "Verify staff activation OTP error:",
        error,
      );

      return respondWithError(
        res,
        error,
        "Unable to verify the activation code.",
      );
    }
  };

export const passwordLogin =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body.email,
        );
      const role =
        normalizeStaffRole(
          req.body.role,
        );
      const password =
        typeof req.body.password === "string"
          ? req.body.password
          : "";

      if (!role) {
        return res.status(400).json({
          success: false,
          message:
            "Please select Doctor or Therapist before signing in.",
        });
      }

      if (!validEmail(email) || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required.",
        });
      }

      const result =
        await passwordLoginService({
          email,
          password,
          centerId: CENTER_ID,
          role,
        });

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        ...result,
        session: {
          access_token:
            result.session.access_token,
          refresh_token:
            result.session.refresh_token,
          expires_at:
            result.session.expires_at,
          expires_in:
            result.session.expires_in,
          token_type:
            result.session.token_type,
        },
      });
    } catch (error) {
      console.error(
        "Professional password login error:",
        error,
      );

      return respondWithError(
        res,
        error,
        "Unable to sign in.",
      );
    }
  };

export const requestPasswordResetCode =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body.email,
        );
      const role =
        normalizeStaffRole(
          req.body.role,
        );

      if (!role || !validEmail(email)) {
        return res.status(400).json({
          success: false,
          message:
            "Select your role and enter a valid registered email address.",
        });
      }

      await requestPasswordResetCodeService({
        email,
        centerId: CENTER_ID,
        role,
      });

      return res.status(200).json({
        success: true,
        message:
          "If this email belongs to an eligible MOBI professional account, a password-reset code has been sent.",
      });
    } catch (error) {
      console.error(
        "Request password reset code error:",
        error,
      );

      return respondWithError(
        res,
        error,
        "Unable to request a password-reset code.",
      );
    }
  };

export const verifyPasswordResetCode =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body.email,
        );
      const role =
        normalizeStaffRole(
          req.body.role,
        );
      const code =
        typeof req.body.code === "string"
          ? req.body.code.replace(/\s+/g, "")
          : "";

      if (!role || !validEmail(email)) {
        return res.status(400).json({
          success: false,
          message:
            "Select your role and enter a valid registered email address.",
        });
      }

      if (!/^\d{8}$/.test(code)) {
        return res.status(400).json({
          success: false,
          message:
            "Enter the 8-digit verification code sent to your email.",
        });
      }

      const result =
        await verifyPasswordResetCodeService({
          email,
          token: code,
          centerId: CENTER_ID,
          role,
        });

      return res.status(200).json({
        success: true,
        message:
          "Verification successful. You may now set a new password.",
        role: result.role,
        profile: result.profile,
        session: {
          access_token:
            result.session.access_token,
          refresh_token:
            result.session.refresh_token,
          expires_at:
            result.session.expires_at,
          expires_in:
            result.session.expires_in,
          token_type:
            result.session.token_type,
        },
      });
    } catch (error) {
      console.error(
        "Verify password reset code error:",
        error,
      );

      return respondWithError(
        res,
        error,
        "Unable to verify the password-reset code.",
      );
    }
  };

export const getStaffSecurityStatus =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const role =
        normalizeStaffRole(
          req.query.role,
        );
      const profileId =
        typeof req.query.profileId === "string"
          ? req.query.profileId
          : "";
      const accessToken =
        getBearerToken(req);

      if (!role || !profileId || !accessToken) {
        return res.status(401).json({
          success: false,
          message:
            "A valid professional session is required.",
        });
      }

      const security =
        await getStaffSecurityStatusService({
          role,
          profileId,
          centerId: CENTER_ID,
          accessToken,
        });

      return res.status(200).json({
        success: true,
        security,
      });
    } catch (error) {
      return respondWithError(
        res,
        error,
        "Unable to read account security status.",
      );
    }
  };

export const recordPasswordUpdate =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const role =
        normalizeStaffRole(
          req.body.role,
        );
      const profileId =
        typeof req.body.profileId === "string"
          ? req.body.profileId
          : "";
      const flow =
        normalizePasswordFlow(
          req.body.flow,
        );
      const accessToken =
        getBearerToken(req);

      if (
        !role ||
        !profileId ||
        !flow ||
        !accessToken
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid professional password-update session is required.",
        });
      }

      const result =
        await recordPasswordUpdateService({
          role,
          profileId,
          centerId: CENTER_ID,
          accessToken,
          flow,
        });

      return res.status(200).json({
        success: true,
        message:
          flow === "initial"
            ? "Password setup completed successfully."
            : "Password updated successfully.",
        ...result,
      });
    } catch (error) {
      console.error(
        "Record password update error:",
        error,
      );

      return respondWithError(
        res,
        error,
        "Unable to finish the password update.",
      );
    }
  };
