// mobi-backend/src/controllers/learningSessionController.ts


import type {
  Request,
  Response,
} from "express";

import {
  startLearningSession,
  startNextActivityInLearningSession,
  endLearningSession,
} from "../services/activity/learningSessionService";

import {
  getRequestCenterId,
} from "../middleware/centerContext";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getAdultActor(req: Request) {
  const id = req.header("x-actor-id")?.trim() ?? "";
  const role = req.header("x-actor-role")?.trim().toLowerCase() ?? "";

  return UUID_PATTERN.test(id) &&
    ["parent", "therapist", "center_admin"].includes(role)
    ? {
        id,
        role: role as "parent" | "therapist" | "center_admin",
      }
    : null;
}

function isNonNegativeFiniteNumber(
  value: unknown,
  maximum: number,
  integer = false,
) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= maximum &&
    (!integer || Number.isInteger(value))
  );
}


/* =========================================================
   START LEARNING SESSION
========================================================= */

export async function startSession(
  req: Request,
  res: Response,
) {
  try {
    const {
      learnerId,
      initialActivityId,
      initialAssignmentId,
    } = req.body;
    const actor = getAdultActor(req);

    if (!actor) {
      return res.status(403).json({
        success: false,
        message:
          "A parent, therapist, or center administrator actor context is required.",
      });
    }

    if (
      typeof learnerId !== "string" ||
      !UUID_PATTERN.test(learnerId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    if (
      typeof initialActivityId !== "string" ||
      !UUID_PATTERN.test(initialActivityId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid initial activity ID is required.",
      });
    }

    if (
      initialAssignmentId !== undefined &&
      initialAssignmentId !== null &&
      (
        typeof initialAssignmentId !== "string" ||
        !UUID_PATTERN.test(initialAssignmentId.trim())
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Initial assignment ID must be a valid UUID.",
      });
    }

    const result =
      await startLearningSession({
        centerId: getRequestCenterId(req)!,

        learnerId:
          learnerId.trim(),

        initialActivityId:
          initialActivityId.trim(),

        initialAssignmentId:
          typeof initialAssignmentId === "string" &&
          UUID_PATTERN.test(initialAssignmentId.trim())
            ? initialAssignmentId.trim()
            : null,

        startedBy: actor.role,
      });

    return res.status(201).json({
      success: true,
      message:
        "Learning session started successfully.",
      ...result,
    });
  } catch (error) {
    console.error(
      "Start learning session error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to start learning session.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }


  
}



/* =========================================================
   START NEXT ACTIVITY AFTER ADULT CONFIRMATION
========================================================= */

export async function startNextLearningActivity(
  req: Request,
  res: Response,
) {
  try {
    const {
    learningSessionId,
    recommendationId,
    } = req.body;
    const actor = getAdultActor(req);

    if (!actor) {
      return res.status(403).json({
        success: false,
        message:
          "Adult confirmation is required before starting the recommended activity.",
      });
    }

    if (
      typeof learningSessionId !== "string" ||
      !UUID_PATTERN.test(learningSessionId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learningSessionId is required.",
      });
    }
    if (
        typeof recommendationId !==
            "string" ||
        !UUID_PATTERN.test(recommendationId.trim())
        ) {
        return res.status(400).json({
            success: false,
            message:
            "A valid recommendationId is required.",
        });
        }

    const result =
      await startNextActivityInLearningSession(
        learningSessionId.trim(),
        recommendationId.trim(),
        getRequestCenterId(req)!,
    );

    return res.status(
    result.started ? 201 : 200,
    ).json({
    success: true,
    ...result,
    });
  } catch (error) {
    console.error(
      "Start next learning activity error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to start the next learning activity.",

      error:
        error instanceof Error
          ? error.message
          : "Unknown learning session error.",
    });
  }
}


/* =========================================================
   END LEARNING SESSION
========================================================= */

export async function endSession(
  req: Request,
  res: Response,
) {
  try {
    const {
      learningSessionId,
      endReason,

      totalDurationSeconds,
      totalActivityRuns,
      completedActivityRuns,
      skippedActivityRuns,
      totalInactivitySeconds,
      totalBreakCount,
    } = req.body;
    const actor = getAdultActor(req);

    if (!actor || actor.role === "center_admin") {
      return res.status(403).json({
        success: false,
        message:
          "A parent or therapist actor context is required to end a learner session.",
      });
    }

    /* =====================================================
       1. VALIDATE LEARNING SESSION ID
    ===================================================== */

    if (
      typeof learningSessionId !== "string" ||
      !UUID_PATTERN.test(learningSessionId.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learningSessionId is required.",
      });
    }

    /* =====================================================
       2. VALIDATE END REASON
    ===================================================== */

    const allowedEndReasons = [
      "completed",
      "parent_stopped",
      "therapist_stopped",
      "auto_inactivity",
      "screen_time_limit",
      "system_interrupted",
    ] as const;

    if (
      typeof endReason !== "string" ||
      !allowedEndReasons.includes(
        endReason as
          (typeof allowedEndReasons)[number],
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learning session end reason is required.",
      });
    }

    /* =====================================================
       3. VALIDATE STOPPED BY
    ===================================================== */

    if (
      (endReason === "parent_stopped" && actor.role !== "parent") ||
      (endReason === "therapist_stopped" && actor.role !== "therapist")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The end reason must match the identified adult actor.",
      });
    }

    const numericInputs = [
      ["totalDurationSeconds", totalDurationSeconds, 86_400, false],
      ["totalActivityRuns", totalActivityRuns, 1_000, true],
      ["completedActivityRuns", completedActivityRuns, 1_000, true],
      ["skippedActivityRuns", skippedActivityRuns, 1_000, true],
      ["totalInactivitySeconds", totalInactivitySeconds, 86_400, false],
      ["totalBreakCount", totalBreakCount, 1_000, true],
    ] as const;

    for (const [name, value, maximum, integer] of numericInputs) {
      if (
        value !== undefined &&
        !isNonNegativeFiniteNumber(value, maximum, integer)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${name} must be a non-negative ${integer ? "integer" : "finite number"} within the supported range.`,
        });
      }
    }

    const stoppedBy =
      endReason === "auto_inactivity" ||
      endReason === "screen_time_limit" ||
      endReason === "system_interrupted"
        ? "system" as const
        : actor.role;

    /* =====================================================
       4. END LEARNING SESSION
    ===================================================== */

    const learningSession =
      await endLearningSession({
        centerId: getRequestCenterId(req)!,

        learningSessionId:
          learningSessionId.trim(),

        endReason:
          endReason as
            (typeof allowedEndReasons)[number],

        stoppedBy:
          stoppedBy,

        totalDurationSeconds:
          typeof totalDurationSeconds === "number"
            ? Math.max(
                0,
                totalDurationSeconds,
              )
            : 0,

        totalActivityRuns:
          typeof totalActivityRuns === "number"
            ? Math.max(
                0,
                totalActivityRuns,
              )
            : 0,

        completedActivityRuns:
          typeof completedActivityRuns ===
            "number"
            ? Math.max(
                0,
                completedActivityRuns,
              )
            : 0,

        skippedActivityRuns:
          typeof skippedActivityRuns === "number"
            ? Math.max(
                0,
                skippedActivityRuns,
              )
            : 0,

        totalInactivitySeconds:
          typeof totalInactivitySeconds ===
            "number"
            ? Math.max(
                0,
                totalInactivitySeconds,
              )
            : 0,

        totalBreakCount:
          typeof totalBreakCount === "number"
            ? Math.max(
                0,
                totalBreakCount,
              )
            : 0,
      });

    return res.status(200).json({
      success: true,

      message:
        "Learning session ended successfully.",

      learningSession,
    });
  } catch (error) {
    console.error(
      "End learning session error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to end learning session.",

      error:
        error instanceof Error
          ? error.message
          : "Unknown learning session error.",
    });
  }
}
