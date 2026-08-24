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
  AssignmentStatus,
} from "../services/activity/activityAssignmentService";
/*
  Temporary Center ID.

  Later, this must come from the logged-in Center or
  Therapist account.
*/
const CENTER_ID =
  "d5ae1649-0343-46d4-b433-575c97e064e1";

/* =========================================================
   ASSIGN ONE ACTIVITY TO MULTIPLE LEARNERS
========================================================= */

export async function assignActivity(
  req: Request,
  res: Response,
) {
  try {
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
          CENTER_ID,

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
          "center_admin",

        assignedByUserId:
          null,
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
        CENTER_ID,
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
        CENTER_ID,
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
        CENTER_ID,
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