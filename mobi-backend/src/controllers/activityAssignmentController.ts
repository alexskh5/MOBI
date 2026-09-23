// mobi-backend/src/controllers/activityAssignmentController.ts

import type {
  Request,
  Response,
} from "express";

import {
  assignActivityToLearners,
  cancelActivityAssignment,
  getLearnerAssignedActivities,
  updateActivityAssignment,
} from "../services/activity/activityAssignmentService";

import type {
  AssignedByRole,
  AssignmentStatus,
} from "../services/activity/activityAssignmentService";

import {
  getOptionalActorContext,
  getRequestCenterId,
} from "../middleware/centerContext";

function requireCenterId(req: Request) {
  const centerId =
    getRequestCenterId(req);

  if (!centerId) {
    throw new Error(
      "A valid center login is required to manage activity assignments.",
    );
  }

  return centerId;
}

function getAssignmentActor(req: Request) {
  const actor =
    getOptionalActorContext(req);

  const allowedRoles: AssignedByRole[] = [
    "center_admin",
    "therapist",
    "system",
  ];

  return {
    actorId:
      actor?.actorId ?? null,
    actorRole:
      actor &&
      allowedRoles.includes(
        actor.actorRole as AssignedByRole,
      )
        ? (actor.actorRole as AssignedByRole)
        : "center_admin",
  };
}

/* =========================================================
   ASSIGN ONE ACTIVITY TO MULTIPLE LEARNERS
========================================================= */

export async function assignActivity(
  req: Request,
  res: Response,
) {
  try {
    const centerId =
      requireCenterId(req);
    const actor =
      getAssignmentActor(req);

    const {
      activityId,
      learnerIds,

      assignmentType,
      priority,

      maxAttemptsOverride,
      estimatedMinutesOverride,
      allowSkipOverride,
    } = req.body;

    if (
      !activityId ||
      typeof activityId !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid activity ID is required.",
      });
    }

    if (
      !Array.isArray(learnerIds) ||
      learnerIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one learner must be selected.",
      });
    }

    /*
      Make sure every learner ID is a non-empty string.
    */
    const validLearnerIds =
      learnerIds.filter(
        (learnerId): learnerId is string =>
          typeof learnerId === "string" &&
          learnerId.trim().length > 0,
      );

    if (
      validLearnerIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid learner IDs were provided.",
      });
    }

    const assignments =
      await assignActivityToLearners({
        centerId:
          centerId,

        activityId,

        learnerIds:
          validLearnerIds,

        assignmentType:
          assignmentType === "required"
            ? "required"
            : "recommended",

        priority:
          typeof priority === "number"
            ? priority
            : 1,

        maxAttemptsOverride:
          typeof maxAttemptsOverride ===
          "number"
            ? maxAttemptsOverride
            : null,

        estimatedMinutesOverride:
          typeof estimatedMinutesOverride ===
          "number"
            ? estimatedMinutesOverride
            : null,

        allowSkipOverride:
          typeof allowSkipOverride ===
          "boolean"
            ? allowSkipOverride
            : null,

        assignedByRole:
          actor.actorRole,

        assignedByUserId:
          actor.actorId,
      });

    return res.status(201).json({
      success: true,
      message:
        "Activity assigned successfully.",
      assignments,
    });
  } catch (error) {
    console.error(
      "Assign activity error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to assign the activity.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown assignment error",
    });
  }
}

/* =========================================================
   GET ASSIGNED ACTIVITIES FOR ONE LEARNER
========================================================= */

export async function getAssignedActivities(
  req: Request,
  res: Response,
) {
  try {
    const centerId =
      requireCenterId(req);

    const learnerIdParam =
      req.params.learnerId;

    if (
      !learnerIdParam ||
      Array.isArray(learnerIdParam)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    const statusesRaw =
      typeof req.query.status === "string"
        ? req.query.status
        : "";

    /*
      Example query:

      ?status=pending,in_progress
    */
    const allowedStatuses: AssignmentStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "skipped",
  "cancelled",
];

const statuses: AssignmentStatus[] =
  statusesRaw
    ? statusesRaw
        .split(",")
        .map((status) =>
          status.trim(),
        )
        .filter(
          (
            status,
          ): status is AssignmentStatus =>
            allowedStatuses.includes(
              status as AssignmentStatus,
            ),
        )
    : [
        "pending",
        "in_progress",
      ];

    const assignments =
      await getLearnerAssignedActivities(
        learnerIdParam,
        centerId,
        statuses,
      );

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get assigned activities error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch assigned activities.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown assignment error",
    });
  }
}

/* =========================================================
   UPDATE ASSIGNMENT
========================================================= */

export async function updateAssignment(
  req: Request,
  res: Response,
) {
  try {
    const centerId =
      requireCenterId(req);

    const assignmentIdParam =
      req.params.assignmentId;

    const learnerIdParam =
      req.params.learnerId;

    if (
      !assignmentIdParam ||
      Array.isArray(assignmentIdParam) ||
      !learnerIdParam ||
      Array.isArray(learnerIdParam)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid learner and assignment IDs are required.",
      });
    }

    const {
      assignmentType,
      priority,
      status,

      maxAttemptsOverride,
      estimatedMinutesOverride,
      allowSkipOverride,

      startedAt,
      completedAt,
    } = req.body;

    const assignment =
      await updateActivityAssignment(
        assignmentIdParam,
        learnerIdParam,
        centerId,
        {
          assignmentType,
          priority,
          status,

          maxAttemptsOverride,
          estimatedMinutesOverride,
          allowSkipOverride,

          startedAt,
          completedAt,
        },
      );

    return res.status(200).json({
      success: true,
      message:
        "Activity assignment updated successfully.",
      assignment,
    });
  } catch (error) {
    console.error(
      "Update assignment error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update the activity assignment.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown assignment error",
    });
  }
}

/* =========================================================
   CANCEL ASSIGNMENT
========================================================= */

export async function cancelAssignment(
  req: Request,
  res: Response,
) {
  try {
    const centerId =
      requireCenterId(req);

    const assignmentIdParam =
      req.params.assignmentId;

    const learnerIdParam =
      req.params.learnerId;

    if (
      !assignmentIdParam ||
      Array.isArray(assignmentIdParam) ||
      !learnerIdParam ||
      Array.isArray(learnerIdParam)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid learner and assignment IDs are required.",
      });
    }

    const assignment =
      await cancelActivityAssignment(
        assignmentIdParam,
        learnerIdParam,
        centerId,
      );

    return res.status(200).json({
      success: true,
      message:
        "Activity assignment cancelled successfully.",
      assignment,
    });
  } catch (error) {
    console.error(
      "Cancel assignment error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to cancel the activity assignment.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown assignment error",
    });
  }
}
