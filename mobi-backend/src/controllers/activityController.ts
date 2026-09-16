// mobi-backend/src/controllers/activityController.ts

import type {
  Request,
  Response,
} from "express";

import {
  archiveActivityById,
  createActivityWithSteps,
  deleteTherapistActivityService,
  getActivities,
  getActivityById,
  getTherapistMaterialsService,
  resolveActivityActor,
  restoreTherapistActivityService,
  submitTherapistActivityForReviewService,
  updateTherapistActivityService,
  type TherapistMaterialView,
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

function headerValue(
  req: Request,
  name: string,
) {
  const value =
    req.headers[name];

  if (
    Array.isArray(
      value,
    )
  ) {
    return value[0] ??
      null;
  }

  return typeof value ===
    "string"
    ? value
    : null;
}

function getTherapistId(
  req: Request,
) {
  return (
    headerValue(
      req,
      "x-mobi-staff-profile-id",
    ) ??
    (
      typeof req.body
        ?.therapistId ===
        "string"
        ? req.body
            .therapistId
        : null
    )
  );
}

/* =========================================================
   CREATE
========================================================= */

export async function createActivity(
  req: Request,
  res: Response,
) {
  try {
    const actor =
      await resolveActivityActor({
        role:
          headerValue(
            req,
            "x-mobi-staff-role",
          ),

        profileId:
          headerValue(
            req,
            "x-mobi-staff-profile-id",
          ),
      });

    const activity =
      await createActivityWithSteps(
        req.body,
        actor,
      );

    return res
      .status(201)
      .json({
        message:
          "Activity created successfully",
        activity,
      });
  } catch (
    error: any
  ) {
    console.error(
      "Create activity error:",
      error,
    );

    return res
      .status(500)
      .json({
        message:
          "Failed to create activity",
        error:
          error.message,
      });
  }
}


export async function listActivities(
  _req: Request,
  res: Response,
) {
  try {
    const activities =
      await getActivities();

    return res
      .status(200)
      .json(
        activities,
      );
  } catch (
    error: any
  ) {
    return res
      .status(500)
      .json({
        message:
          "Failed to fetch activities",
        error:
          error.message,
      });
  }
}
      For now, we use the same AMTC center ID used
      in your learner backend.
    */
    const activityAuthor = await getActivityAuthor(req);

/* =========================================================
   THERAPIST MATERIAL VIEWS
========================================================= */

export async function listTherapistMaterials(
  req: Request,
  res: Response,
) {
  try {
    const therapistId =
      Array.isArray(
        req.params
          .therapistId,
      )
        ? req.params
            .therapistId[0]
        : req.params
            .therapistId;

    const requestedView =
      typeof req.query
        .view ===
        "string"
        ? req.query.view
        : "mine";

    const allowed:
      TherapistMaterialView[] =
      [
        "mine",
        "all",
        "center",
        "drafts",
        "archived",
      ];

    if (
      !allowed.includes(
        requestedView as
          TherapistMaterialView,
      )
    ) {
      return res
        .status(400)
        .json({
          message:
            "Invalid Therapist material view.",
        });
    }

    const activities =
      await getTherapistMaterialsService({
        therapistId,

        view:
          requestedView as
            TherapistMaterialView,
      });

    return res
      .status(200)
      .json({
        success:
          true,

        activities,
      });
  } catch (
    error: any
  ) {
    console.error(
      "List Therapist materials error:",
      error,
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          "Failed to fetch Therapist materials.",

        error:
          error.message,
      });
  }
}

/* =========================================================
   READ ONE
========================================================= */

export async function readActivity(
  req: Request,
  res: Response,
) {
  try {
    const id =
      Array.isArray(
        req.params.id,
      )
        ? req.params.id[0]
        : req.params.id;

    const activity =
      await getActivityById(
        id,
      );

        center_id:
          activityAuthor.centerId,

        created_by_role:
          activityAuthor.role,

        created_by_therapist_id:
          activityAuthor.role === "therapist"
            ? activityAuthor.actorId
            : null,
      });
  }
}

/* =========================================================
   UPDATE THERAPIST ACTIVITY
========================================================= */

export async function updateTherapistActivity(
  req: Request,
  res: Response,
) {
  try {
    const activityId =
      Array.isArray(
        req.params.id,
      )
        ? req.params.id[0]
        : req.params.id;

    const therapistId =
      getTherapistId(
        req,
      );

    if (!therapistId) {
      return res
        .status(400)
        .json({
          message:
            "Therapist profile ID is required.",
        });
    }

    const activity =
      await updateTherapistActivityService({
        activityId,
        therapistId,
        payload:
          req.body,
      });

    return res
      .status(200)
      .json({
        success:
          true,
        message:
          "Activity updated successfully.",
        activity,
      });
  } catch (
    error: any
  ) {
    console.error(
      "Update Therapist activity error:",
      error,
    );

    return res
      .status(500)
      .json({
        success:
          false,
        message:
          error.message ||
          "Failed to update activity.",
      });
  }
}

/* =========================================================
   SUBMIT FOR REVIEW
========================================================= */

export async function submitTherapistActivityForReview(
  req: Request,
  res: Response,
) {
  try {
    const activityId =
      Array.isArray(
        req.params.id,
      )
        ? req.params.id[0]
        : req.params.id;

    const therapistId =
      getTherapistId(
        req,
      );

    if (!therapistId) {
      return res
        .status(400)
        .json({
          message:
            "Therapist profile ID is required.",
        });
    }

    const activity =
      await submitTherapistActivityForReviewService({
        activityId,
        therapistId,
      });

    return res
      .status(200)
      .json({
        success:
          true,
        message:
          "Activity submitted for Center review.",
        activity,
      });
  } catch (
    error: any
  ) {
    return res
      .status(500)
      .json({
        success:
          false,
        message:
          error.message ||
          "Failed to submit activity.",
      });
  }
}

/* =========================================================
   ARCHIVE
========================================================= */

export async function archiveTherapistActivity(
  req: Request,
  res: Response,
) {
  try {
    const activityId =
      Array.isArray(
        req.params.id,
      )
        ? req.params.id[0]
        : req.params.id;

    const therapistId =
      getTherapistId(
        req,
      );

    if (!therapistId) {
      return res
        .status(400)
        .json({
          message:
            "Therapist profile ID is required.",
        });
    }

    const activity =
      await archiveTherapistActivityService({
        activityId,
        therapistId,
      });

    return res
      .status(200)
      .json({
        success:
          true,
        message:
          "Activity archived successfully.",
        activity,
      });
  } catch (
    error: any
  ) {
    return res
      .status(500)
      .json({
        success:
          false,
        message:
          error.message ||
          "Failed to archive activity.",
      });
  }
}


export async function restoreTherapistActivity(
  req: Request,
  res: Response,
) {
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

export async function listActivities(_req: Request, res: Response) {
  try {
    const activityId =
      Array.isArray(
        req.params.id,
      )
        ? req.params.id[0]
        : req.params.id;

    const therapistId =
      getTherapistId(
        req,
      );

    if (!therapistId) {
      return res
        .status(400)
        .json({
          message:
            "Therapist profile ID is required.",
        });
    }

    const activity =
      await restoreTherapistActivityService({
        activityId,
        therapistId,
      });

    return res
      .status(200)
      .json({
        success:
          true,
        message:
          "Activity restored successfully.",
        activity,
      });
  } catch (
    error: any
  ) {
    return res
      .status(500)
      .json({
        success:
          false,
        message:
          error.message ||
          "Failed to restore activity.",
      });
  }
}

/* =========================================================
   DELETE
========================================================= */

export async function deleteTherapistActivity(
  req: Request,
  res: Response,
) {
  try {
    const activityId =
      Array.isArray(
        req.params.id,
      )
        ? req.params.id[0]
        : req.params.id;

    const therapistId =
      getTherapistId(
        req,
      );

    if (!therapistId) {
      return res
        .status(400)
        .json({
          message:
            "Therapist profile ID is required.",
        });
    }

    const result =
      await deleteTherapistActivityService({
        activityId,
        therapistId,
      });

    return res
      .status(200)
      .json({
        success:
          true,
        message:
          "Activity deleted successfully.",
        activity:
          result,
      });
  } catch (
    error: any
  ) {
    return res
      .status(500)
      .json({
        success:
          false,
        message:
          error.message ||
          "Failed to delete activity.",
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
