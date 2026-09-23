//mobi-backend/src/controllers/activityController.ts

import { Request, Response } from "express";
import {
  archiveActivityById,
  createActivityWithSteps,
  getActivities,
  getActivityById,
  getSubmittedActivities,
  declineSubmittedActivity,
  publishSubmittedActivity,
  resubmitTherapistActivity,
} from "../services/activityService";
import {
  AuthUser,
  getAuthUserFromAccessToken,
} from "../services/authService";
import {
  ActivityAssetCategory,
  uploadActivityAsset as uploadActivityAssetToStorage,
} from "../services/activityStorageService";

async function getActivityAuthor(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    throw new Error("A valid login session is required.");
  }

  const authUser = await getAuthUserFromAccessToken(token);

  if (
    authUser.role !== "center_admin" &&
    authUser.role !== "therapist"
  ) {
    throw new Error("Only center admins and therapists can manage activities.");
  }

  if (!authUser.centerId) {
    throw new Error("This account is not linked to a center.");
  }

  return authUser;
}

export async function createActivity(
  req: Request,
  res: Response,
) {
  try {
    /*
      TEMPORARY CENTER ID

      Later this should come from the authenticated
      Center Admin or Therapist account.

      For now, we use the same AMTC center ID used
      in your learner backend.
    */
    const activityAuthor = await getActivityAuthor(req);

    /*
      The frontend should not decide which center owns
      the activity.

      The backend attaches center_id here so the activity
      can later be safely matched with learner assignments.
    */
    const activity =
      await createActivityWithSteps({
        ...req.body,

        center_id:
          activityAuthor.centerId,

        created_by_role:
          activityAuthor.role,

        created_by_therapist_id:
          activityAuthor.role === "therapist"
            ? activityAuthor.actorId
            : null,
      });

    return res.status(201).json({
      message:
        "Activity created successfully",

      activity,
    });
  } catch (error: any) {
    console.error(
      "Create activity error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to create activity",

      error:
        error.message,
    });
  }
}

export async function uploadActivityAsset(
  req: Request,
  res: Response,
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please choose a file to upload.",
      });
    }

    const category = req.body.category || "step-media";

    if (
      ![
        "thumbnail",
        "step-media",
        "prompt-audio",
        "regulation",
      ].includes(category)
    ) {
      return res.status(400).json({
        message: "Unsupported activity asset category.",
      });
    }

    const activityAuthor = await getActivityAuthor(req);
    const asset = await uploadActivityAssetToStorage({
      file: req.file,
      centerId: activityAuthor.centerId!,
      category: category as ActivityAssetCategory,
    });

    return res.status(201).json({ asset });
  } catch (error: any) {
    console.error("Upload activity asset error:", error);

    const status =
      error.message?.includes("valid login") ||
      error.message?.includes("Only center admins")
        ? 403
        : 500;

    return res.status(status).json({
      message: "Failed to upload activity asset",
      error: error.message,
    });
  }
}

export async function listActivities(req: Request, res: Response) {
  try {
    const activityAuthor = await getActivityAuthor(req);
    const activities = await getActivities(activityAuthor.centerId!);
    res.status(200).json(activities);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
}

export async function listSubmittedActivityReviews(
  req: Request,
  res: Response,
) {
  try {
    const activityAuthor = await getActivityAuthor(req);

    if (activityAuthor.role !== "center_admin") {
      return res.status(403).json({
        message:
          "Only center admins can review therapist-submitted activities.",
      });
    }

    const activities = await getSubmittedActivities(
      activityAuthor.centerId!,
    );

    return res.status(200).json({
      activities,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch submitted activities",
      error: error.message,
    });
  }
}

export async function approveActivityReview(
  req: Request,
  res: Response,
) {
  try {
    const activityAuthor = await getActivityAuthor(req);

    if (activityAuthor.role !== "center_admin") {
      return res.status(403).json({
        message:
          "Only center admins can approve therapist-submitted activities.",
      });
    }

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const activity = await publishSubmittedActivity({
      activityId: id,
      centerId: activityAuthor.centerId!,
      reviewedBy: activityAuthor.actorId,
      feedback:
        typeof req.body?.feedback === "string"
          ? req.body.feedback.trim()
          : null,
    });

    return res.status(200).json({
      message: "Activity approved and published.",
      activity,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "Failed to approve activity",
      error: error.message,
    });
  }
}

export async function declineActivityReview(
  req: Request,
  res: Response,
) {
  try {
    const activityAuthor = await getActivityAuthor(req);

    if (activityAuthor.role !== "center_admin") {
      return res.status(403).json({
        message:
          "Only center admins can decline therapist-submitted activities.",
      });
    }

    const reason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!reason) {
      return res.status(400).json({
        message: "A decline reason is required.",
      });
    }

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const activity = await declineSubmittedActivity({
      activityId: id,
      centerId: activityAuthor.centerId!,
      reviewedBy: activityAuthor.actorId,
      reason,
    });

    return res.status(200).json({
      message: "Activity declined with feedback.",
      activity,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "Failed to decline activity",
      error: error.message,
    });
  }
}

export async function resubmitActivityReview(
  req: Request,
  res: Response,
) {
  try {
    const activityAuthor = await getActivityAuthor(req);

    if (activityAuthor.role !== "therapist") {
      return res.status(403).json({
        message: "Only therapists can resubmit declined activities.",
      });
    }

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const activity = await resubmitTherapistActivity({
      activityId: id,
      centerId: activityAuthor.centerId!,
      therapistId: activityAuthor.actorId,
      payload: req.body,
    });

    return res.status(200).json({
      message:
        activity.status === "published"
          ? "Activity published."
          : "Activity resubmitted for center review.",
      activity,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "Failed to resubmit activity",
      error: error.message,
    });
  }
}

export async function readActivity(req: Request, res: Response) {
  try {
    const activityAuthor = await getActivityAuthor(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const activity = await getActivityById(id, activityAuthor.centerId!);
    res.status(200).json(activity);
  } catch (error: any) {
    res.status(404).json({
      message: "Activity not found",
      error: error.message,
    });
  }
}

export async function archiveActivity(req: Request, res: Response) {
  try {
    const activityAuthor = await getActivityAuthor(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const activity = await archiveActivityById(
      id,
      activityAuthor.centerId!,
    );

    return res.status(200).json({
      message: "Activity archived successfully",
      activity,
    });
  } catch (error: any) {
    console.error("Archive activity error:", error);

    return res.status(500).json({
      message: "Failed to archive activity",
      error: error.message,
    });
  }
}
