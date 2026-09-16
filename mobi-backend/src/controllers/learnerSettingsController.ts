import type { Request, Response } from "express";

import { getRequestCenterId } from "../middleware/centerContext";
import {
  createDefaultLearnerAdaptationSettings,
  getLearnerAdaptationSettings,
  updateLearnerAdaptationSettings,
  type UpdateAdaptationSettingsInput,
} from "../services/learner/adaptationSettingsService";
import {
  getLearnerChildSafetySettings,
  updateLearnerChildSafetySettings,
} from "../services/learner/childSafetySettingsService";
import {
  getLearnerSessionPreferences,
  updateLearnerSessionPreferences,
  type UpdateLearnerSessionPreferencesInput,
} from "../services/learner/sessionPreferenceService";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function learnerIdFromRequest(req: Request) {
  const value = req.params.learnerId;
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unknown learner settings error.";
}

function actorRoleFromRequest(req: Request) {
  return req.header("x-actor-role")?.trim().toLowerCase() ?? "";
}

function actorIdFromRequest(req: Request) {
  return req.header("x-actor-id")?.trim() ?? "";
}

function rolePermissions(actorRole: string) {
  const canModifyClinical =
    actorRole === "therapist" ||
    actorRole === "center_admin";

  const canModifyScreenTime =
    canModifyClinical ||
    actorRole === "parent";

  return {
    canViewSettings: [
      "center_admin",
      "therapist",
      "doctor",
      "parent",
    ].includes(actorRole),
    canModifyClinical,
    canModifyScreenTime,
  };
}

export async function getLearnerProfileSettings(
  req: Request,
  res: Response,
) {
  try {
    const learnerId = learnerIdFromRequest(req);

    if (!learnerId || !UUID_PATTERN.test(learnerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const actorRole = actorRoleFromRequest(req);
    const permissions = rolePermissions(actorRole);

    if (!permissions.canViewSettings) {
      return res.status(403).json({
        success: false,
        message:
          "This user is not allowed to view learner settings.",
      });
    }

    const centerId = getRequestCenterId(req)!;

    const [
      adaptationSettings,
      childSafetySettings,
      sessionPreferences,
    ] = await Promise.all([
      getLearnerAdaptationSettings(learnerId, centerId).then(
        (settings) =>
          settings ??
          createDefaultLearnerAdaptationSettings(
            learnerId,
            centerId,
          ),
      ),
      getLearnerChildSafetySettings(learnerId, centerId),
      getLearnerSessionPreferences(learnerId, centerId),
    ]);

    return res.status(200).json({
      success: true,
      settings: {
        adaptationSettings,
        childSafetySettings,
        sessionPreferences,
        permissions,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch learner profile settings.",
      error: errorMessage(error),
    });
  }
}

export async function patchLearnerProfileSettings(
  req: Request,
  res: Response,
) {
  try {
    const learnerId = learnerIdFromRequest(req);

    if (!learnerId || !UUID_PATTERN.test(learnerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const actorId = actorIdFromRequest(req);
    const actorRole = actorRoleFromRequest(req);
    const permissions = rolePermissions(actorRole);

    if (
      !UUID_PATTERN.test(actorId) ||
      !permissions.canViewSettings
    ) {
      return res.status(403).json({
        success: false,
        message:
          "A valid actor context is required to update learner settings.",
      });
    }

    const centerId = getRequestCenterId(req)!;
    const requestedAdaptationSettings =
      req.body?.adaptationSettings;
    const requestedSessionPreferences =
      req.body?.sessionPreferences;
    const requestedChildSafetySettings =
      req.body?.childSafetySettings;

    if (
      (requestedAdaptationSettings ||
        requestedSessionPreferences) &&
      !permissions.canModifyClinical
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only therapists and center administrators can modify clinical learner settings.",
      });
    }

    const updates: Record<string, unknown> = {};

    if (requestedAdaptationSettings) {
      updates.adaptationSettings =
        await updateLearnerAdaptationSettings(
          learnerId,
          centerId,
          {
            ...(requestedAdaptationSettings as UpdateAdaptationSettingsInput),
            updated_by_therapist_id:
              actorRole === "therapist" ? actorId : null,
            last_updated_by_role:
              actorRole as "therapist" | "center_admin",
          },
        );
    }

    if (requestedSessionPreferences) {
      updates.sessionPreferences =
        await updateLearnerSessionPreferences(
          learnerId,
          centerId,
          requestedSessionPreferences as UpdateLearnerSessionPreferencesInput,
        );
    }

    if (
      requestedChildSafetySettings &&
      Object.prototype.hasOwnProperty.call(
        requestedChildSafetySettings,
        "dailyScreenTimeLimitSeconds",
      )
    ) {
      if (!permissions.canModifyScreenTime) {
        return res.status(403).json({
          success: false,
          message:
            "This user is not allowed to modify child screen-time settings.",
        });
      }

      const value =
        requestedChildSafetySettings.dailyScreenTimeLimitSeconds;

      if (value !== null && typeof value !== "number") {
        return res.status(400).json({
          success: false,
          message:
            "dailyScreenTimeLimitSeconds must be a number or null.",
        });
      }

      updates.childSafetySettings =
        await updateLearnerChildSafetySettings(
          learnerId,
          centerId,
          value,
        );
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No learner settings were provided to update.",
      });
    }

    return res.status(200).json({
      success: true,
      settings: {
        ...updates,
        permissions,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to update learner profile settings.",
      error: errorMessage(error),
    });
  }
}

export async function getAdaptationSettings(
  req: Request,
  res: Response,
) {
  try {
    const learnerId = learnerIdFromRequest(req);

    if (!learnerId || !UUID_PATTERN.test(learnerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const centerId = getRequestCenterId(req)!;
    const settings =
      (await getLearnerAdaptationSettings(learnerId, centerId)) ??
      (await createDefaultLearnerAdaptationSettings(
        learnerId,
        centerId,
      ));

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch learner adaptation settings.",
      error: errorMessage(error),
    });
  }
}

export async function patchAdaptationSettings(
  req: Request,
  res: Response,
) {
  try {
    const learnerId = learnerIdFromRequest(req);

    if (!learnerId || !UUID_PATTERN.test(learnerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const actorId = req.header("x-actor-id")?.trim() ?? "";
    const actorRole =
      req.header("x-actor-role")?.trim().toLowerCase() ?? "";

    if (
      !UUID_PATTERN.test(actorId) ||
      !["therapist", "center_admin"].includes(actorRole)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "A therapist or center administrator actor context is required.",
      });
    }

    const settings = await updateLearnerAdaptationSettings(
      learnerId,
      getRequestCenterId(req)!,
      {
        ...(req.body as UpdateAdaptationSettingsInput),
        updated_by_therapist_id:
          actorRole === "therapist" ? actorId : null,
        last_updated_by_role: actorRole as
          | "therapist"
          | "center_admin",
      },
    );

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to update learner adaptation settings.",
      error: errorMessage(error),
    });
  }
}

export async function getChildSafetySettings(
  req: Request,
  res: Response,
) {
  try {
    const learnerId = learnerIdFromRequest(req);

    if (!learnerId || !UUID_PATTERN.test(learnerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const settings = await getLearnerChildSafetySettings(
      learnerId,
      getRequestCenterId(req)!,
    );

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch learner child-safety settings.",
      error: errorMessage(error),
    });
  }
}

export async function patchChildSafetySettings(
  req: Request,
  res: Response,
) {
  try {
    const learnerId = learnerIdFromRequest(req);

    if (!learnerId || !UUID_PATTERN.test(learnerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const actorId = req.header("x-actor-id")?.trim() ?? "";
    const actorRole =
      req.header("x-actor-role")?.trim().toLowerCase() ?? "";

    if (
      !UUID_PATTERN.test(actorId) ||
      !["parent", "therapist", "center_admin"].includes(actorRole)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "A parent, therapist, or center administrator actor context is required.",
      });
    }

    const value = req.body?.dailyScreenTimeLimitSeconds;

    if (value !== null && typeof value !== "number") {
      return res.status(400).json({
        success: false,
        message:
          "dailyScreenTimeLimitSeconds must be a number or null.",
      });
    }

    const settings = await updateLearnerChildSafetySettings(
      learnerId,
      getRequestCenterId(req)!,
      value,
    );

    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to update learner child-safety settings.",
      error: errorMessage(error),
    });
  }
}
