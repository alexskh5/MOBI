import type {
  Request,
  Response,
} from "express";

import {
  getLearnerProgressOverview,
  type LearnerProgressPeriod,
} from "../services/progress/learnerProgressService";

import {
  getSpeechTrainingProgress,
} from "../services/progress/speechTrainingProgressService";


import {
  getSocialReadinessProgress,
} from "../services/progress/socialReadinessProgressService";


import {
  getPerActivityAnalysis,
} from "../services/progress/perActivityAnalysisService";

import {
  getRequestCenterId,
} from "../middleware/centerContext";

function getProgressCenterId(req: Request) {
  const centerId =
    getRequestCenterId(req);

  if (!centerId) {
    throw new Error(
      "A valid center login is required to view progress.",
    );
  }

  return centerId;
}

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown progress error.";
}

/* =========================================================
   GET LEARNER PROGRESS OVERVIEW
========================================================= */

export async function getProgressOverview(
  req: Request,
  res: Response,
) {
  try {
    const learnerId =
      typeof req.query.learnerId ===
        "string"
        ? req.query.learnerId.trim()
        : "";

    const periodRaw =
      typeof req.query.period ===
        "string"
        ? req.query.period.trim()
        : "week";

    const anchorDate =
      typeof req.query.anchorDate ===
        "string"
        ? req.query.anchorDate.trim()
        : undefined;

    if (!learnerId) {
      return res.status(400).json({
        success: false,
        message:
          "Learner ID is required.",
      });
    }

    const allowedPeriods:
      LearnerProgressPeriod[] = [
        "day",
        "week",
        "month",
        "year",
      ];

    if (
      !allowedPeriods.includes(
        periodRaw as LearnerProgressPeriod,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid progress period.",
      });
    }

    const overview =
      await getLearnerProgressOverview({
        centerId:
          getProgressCenterId(req),

        learnerId,

        period:
          periodRaw as
            LearnerProgressPeriod,

        anchorDate:
          anchorDate || undefined,
      });

    return res.status(200).json({
      success: true,
      overview,
    });
  } catch (error) {
    console.error(
      "Get learner progress overview error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch learner progress overview.",
      error:
        getErrorMessage(error),
    });
  }
}



/* =========================================================
   GET SPEECH TRAINING PROGRESS
========================================================= */

export async function getSpeechTraining(
  req: Request,
  res: Response,
) {
  try {
    const learnerId =
      typeof req.query.learnerId ===
        "string"
        ? req.query.learnerId.trim()
        : "";

    const periodRaw =
      typeof req.query.period ===
        "string"
        ? req.query.period.trim()
        : "week";

    const anchorDate =
      typeof req.query.anchorDate ===
        "string"
        ? req.query.anchorDate.trim()
        : undefined;

    if (!learnerId) {
      return res.status(400).json({
        success: false,
        message:
          "Learner ID is required.",
      });
    }

    const allowedPeriods:
      LearnerProgressPeriod[] = [
        "day",
        "week",
        "month",
        "year",
      ];

    if (
      !allowedPeriods.includes(
        periodRaw as LearnerProgressPeriod,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid progress period.",
      });
    }

    const speechTraining =
      await getSpeechTrainingProgress({
        centerId:
          getProgressCenterId(req),

        learnerId,

        period:
          periodRaw as
            LearnerProgressPeriod,

        anchorDate:
          anchorDate || undefined,
      });

    return res.status(200).json({
      success: true,

      speechTraining,
    });
  } catch (error) {
    console.error(
      "Get speech training progress error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to fetch speech training progress.",

      error:
        getErrorMessage(error),
    });
  }
}


/* =========================================================
   GET SOCIAL READINESS PROGRESS
========================================================= */

export async function getSocialReadiness(
  req: Request,
  res: Response,
) {
  try {
    const learnerId =
      typeof req.query.learnerId ===
        "string"
        ? req.query.learnerId.trim()
        : "";

    const periodRaw =
      typeof req.query.period ===
        "string"
        ? req.query.period.trim()
        : "week";

    const anchorDate =
      typeof req.query.anchorDate ===
        "string"
        ? req.query.anchorDate.trim()
        : undefined;

    if (!learnerId) {
      return res.status(400).json({
        success: false,
        message:
          "Learner ID is required.",
      });
    }

    const allowedPeriods:
      LearnerProgressPeriod[] = [
        "day",
        "week",
        "month",
        "year",
      ];

    if (
      !allowedPeriods.includes(
        periodRaw as LearnerProgressPeriod,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid progress period.",
      });
    }

    const socialReadiness =
      await getSocialReadinessProgress({
        centerId:
          getProgressCenterId(req),

        learnerId,

        period:
          periodRaw as
            LearnerProgressPeriod,

        anchorDate:
          anchorDate || undefined,
      });

    return res.status(200).json({
      success: true,
      socialReadiness,
    });
  } catch (error) {
    console.error(
      "Get social readiness progress error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch social readiness progress.",
      error:
        getErrorMessage(error),
    });
  }
}


/* =========================================================
   GET PER ACTIVITY ANALYSIS
========================================================= */

export async function getPerActivity(
  req: Request,
  res: Response,
) {
  try {
    const learnerId =
      typeof req.query.learnerId ===
        "string"
        ? req.query.learnerId.trim()
        : "";

    const periodRaw =
      typeof req.query.period ===
        "string"
        ? req.query.period.trim()
        : "week";

    const anchorDate =
      typeof req.query.anchorDate ===
        "string"
        ? req.query.anchorDate.trim()
        : undefined;

    if (!learnerId) {
      return res.status(400).json({
        success: false,
        message:
          "Learner ID is required.",
      });
    }

    const allowedPeriods:
      LearnerProgressPeriod[] = [
        "day",
        "week",
        "month",
        "year",
      ];

    if (
      !allowedPeriods.includes(
        periodRaw as LearnerProgressPeriod,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid progress period.",
      });
    }

    const perActivity =
      await getPerActivityAnalysis({
        centerId:
          getProgressCenterId(req),

        learnerId,

        period:
          periodRaw as LearnerProgressPeriod,

        anchorDate:
          anchorDate || undefined,
      });

    return res.status(200).json({
      success: true,
      perActivity,
    });
  } catch (error) {
    console.error(
      "Get per-activity analysis error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch per-activity analysis.",
      error:
        getErrorMessage(error),
    });
  }
}

/* =========================================================
   GET COMPLETE LIVE PROGRESS REPORT
========================================================= */

export async function getProgressReport(
  req: Request,
  res: Response,
) {
  try {
    const learnerId =
      typeof req.query.learnerId === "string"
        ? req.query.learnerId.trim()
        : "";
    const periodRaw =
      typeof req.query.period === "string"
        ? req.query.period.trim()
        : "week";
    const anchorDate =
      typeof req.query.anchorDate === "string"
        ? req.query.anchorDate.trim()
        : undefined;
    const allowedPeriods: LearnerProgressPeriod[] = [
      "day",
      "week",
      "month",
      "year",
    ];

    if (!learnerId) {
      return res.status(400).json({
        success: false,
        message: "Learner ID is required.",
      });
    }

    if (
      !allowedPeriods.includes(
        periodRaw as LearnerProgressPeriod,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress period.",
      });
    }

    const commonInput = {
      centerId: getProgressCenterId(req),
      learnerId,
      period: periodRaw as LearnerProgressPeriod,
      anchorDate: anchorDate || undefined,
    };
    const [
      overview,
      speechTraining,
      socialReadiness,
      perActivity,
    ] = await Promise.all([
      getLearnerProgressOverview(commonInput),
      getSpeechTrainingProgress(commonInput),
      getSocialReadinessProgress(commonInput),
      getPerActivityAnalysis(commonInput),
    ]);

    return res.status(200).json({
      success: true,
      report: {
        learnerId,
        period: commonInput.period,
        dateRange: overview.dateRange,
        generatedAt: new Date().toISOString(),
        overview,
        speechTraining,
        socialReadiness,
        perActivity,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to generate learner progress report.",
      error: getErrorMessage(error),
    });
  }
}
