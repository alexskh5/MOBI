import type { Request, Response } from "express";

import { getRequestCenterId } from "../middleware/centerContext";
import {
  decideLearnerProgression,
  evaluateLearnerProgression,
  getLearnerProgressionHistory,
} from "../services/activity/progressionService";
import { normalizeSpeechLadderLevel } from "../services/activity/progressionRulesService";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function routeParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unknown progression error.";
}

export async function evaluateProgression(
  req: Request,
  res: Response,
) {
  try {
    const learnerId = routeParam(req.params.learnerId);

    if (!learnerId || !UUID_PATTERN.test(learnerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const progression = await evaluateLearnerProgression({
      centerId: getRequestCenterId(req)!,
      learnerId,
    });

    return res.status(200).json({ success: true, progression });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to evaluate learner progression.",
      error: errorMessage(error),
    });
  }
}

export async function getProgressionHistory(
  req: Request,
  res: Response,
) {
  try {
    const learnerId = routeParam(req.params.learnerId);

    if (!learnerId || !UUID_PATTERN.test(learnerId)) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const history = await getLearnerProgressionHistory(
      getRequestCenterId(req)!,
      learnerId,
    );

    return res.status(200).json({ success: true, history });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch learner progression history.",
      error: errorMessage(error),
    });
  }
}

export async function decideProgression(
  req: Request,
  res: Response,
) {
  try {
    const learnerId = routeParam(req.params.learnerId);
    const recommendationId = routeParam(
      req.params.recommendationId,
    );
    const therapistId = req.header("x-actor-id")?.trim() ?? "";
    const actorRole =
      req.header("x-actor-role")?.trim().toLowerCase() ?? "";

    if (
      !learnerId ||
      !recommendationId ||
      !UUID_PATTERN.test(learnerId) ||
      !UUID_PATTERN.test(recommendationId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid learner and recommendation IDs are required.",
      });
    }

    if (!UUID_PATTERN.test(therapistId) || actorRole !== "therapist") {
      return res.status(403).json({
        success: false,
        message:
          "A therapist actor context is required for progression decisions.",
      });
    }

    const decisionMap = {
      approve: "approved",
      decline: "declined",
      adjust: "adjusted",
    } as const;
    const rawDecision = req.body?.decision;
    const decision =
      typeof rawDecision === "string"
        ? decisionMap[rawDecision as keyof typeof decisionMap]
        : undefined;

    if (!decision) {
      return res.status(400).json({
        success: false,
        message: "Decision must be approve, decline, or adjust.",
      });
    }

    const adjustedSpeechLadder =
      decision === "adjusted"
        ? normalizeSpeechLadderLevel(
            req.body?.adjustedSpeechLadder,
          )
        : null;

    if (decision === "adjusted" && !adjustedSpeechLadder) {
      return res.status(400).json({
        success: false,
        message:
          "A valid adjusted Speech Ladder is required.",
      });
    }

    const result = await decideLearnerProgression({
      centerId: getRequestCenterId(req)!,
      learnerId,
      recommendationId,
      therapistId,
      decision,
      therapistNotes:
        typeof req.body?.therapistNotes === "string"
          ? req.body.therapistNotes.trim() || null
          : null,
      adjustedSpeechLadder,
    });

    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to save the progression decision.",
      error: errorMessage(error),
    });
  }
}
