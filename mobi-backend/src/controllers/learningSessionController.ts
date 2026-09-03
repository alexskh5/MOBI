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



/* =========================================================
   START LEARNING SESSION
========================================================= */

const CENTER_ID =
  "d5ae1649-0343-46d4-b433-575c97e064e1";

export async function startSession(
  req: Request,
  res: Response,
) {
  try {
    const {
      learnerId,
      initialActivityId,
      startedBy,
    } = req.body;

    if (
      typeof learnerId !== "string" ||
      !learnerId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    if (
      typeof initialActivityId !== "string" ||
      !initialActivityId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid initial activity ID is required.",
      });
    }

    const learningSession =
      await startLearningSession({
        centerId: CENTER_ID,

        learnerId:
          learnerId.trim(),

        initialActivityId:
          initialActivityId.trim(),

        startedBy:
          startedBy === "parent" ||
          startedBy === "therapist" ||
          startedBy === "center_admin"
            ? startedBy
            : "system",
      });

    return res.status(201).json({
      success: true,
      message:
        "Learning session started successfully.",
      learningSession,
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
    } = req.body;

    if (
      typeof learningSessionId !== "string" ||
      !learningSessionId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learningSessionId is required.",
      });
    }

    const result =
      await startNextActivityInLearningSession(
        learningSessionId.trim(),
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