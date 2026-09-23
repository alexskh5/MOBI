// MOBI/mobi-backend/src/controllers/scheduleController.ts

import type { Request, Response } from "express";

import {
  ScheduleServiceError,
  getCenterSchedulesService,
  getTherapistSchedulesService,
  createScheduleService,
  cancelScheduleService,
  confirmTherapistScheduleService,
  requestScheduleRescheduleService,
  approveRescheduleRequestService,
  rejectRescheduleRequestService,
  confirmGuardianScheduleService,
  declineGuardianScheduleService,
  getCenterRescheduleRequestsService,
  updateCenterScheduleService,
  type SessionType,
  type DeliveryMode,
  type ScheduleCreatorRole,
} from "../services/scheduleService";

/*
|--------------------------------------------------------------------------
| Error helper
|--------------------------------------------------------------------------
*/

const handleScheduleError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
) => {
  console.error(fallbackMessage, error);

  if (error instanceof ScheduleServiceError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

/*
|--------------------------------------------------------------------------
| CENTER: Get schedules
|--------------------------------------------------------------------------
|
| GET /api/schedules/center/:centerId
|
| Optional query:
| ?start=2026-09-10T00:00:00.000Z
| ?end=2026-09-11T00:00:00.000Z
|--------------------------------------------------------------------------
*/

export const getCenterSchedules = async (
  req: Request,
  res: Response
) => {
  try {
    const { centerId } = req.params;

    const start =
      typeof req.query.start === "string"
        ? req.query.start
        : undefined;

    const end =
      typeof req.query.end === "string"
        ? req.query.end
        : undefined;

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: "Center ID is required.",
      });
    }

    const schedules =
      await getCenterSchedulesService(
        centerId,
        start,
        end
      );

    return res.status(200).json({
      success: true,
      message:
        "Center schedules fetched successfully.",
      data: schedules,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to fetch center schedules."
    );
  }
};

/*
|--------------------------------------------------------------------------
| THERAPIST: Get assigned schedules
|--------------------------------------------------------------------------
|
| GET /api/schedules/therapist/:therapistId
|--------------------------------------------------------------------------
*/

export const getTherapistSchedules =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { therapistId } = req.params;

      const start =
        typeof req.query.start === "string"
          ? req.query.start
          : undefined;

      const end =
        typeof req.query.end === "string"
          ? req.query.end
          : undefined;

      if (!therapistId) {
        return res.status(400).json({
          success: false,
          message:
            "Therapist ID is required.",
        });
      }

      const schedules =
        await getTherapistSchedulesService(
          therapistId,
          start,
          end
        );

      return res.status(200).json({
        success: true,
        message:
          "Therapist schedules fetched successfully.",
        data: schedules,
      });
    } catch (error) {
      return handleScheduleError(
        res,
        error,
        "Failed to fetch therapist schedules."
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Create schedule
|--------------------------------------------------------------------------
|
| POST /api/schedules
|--------------------------------------------------------------------------
*/

export const createSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      centerId,
      learnerId,
      therapistId,
      sessionType,
      deliveryMode,
      scheduledStart,
      scheduledEnd,
      notes,
      createdByRole,
      createdById,
      fallbackFromSessionId,
    } = req.body ?? {};

    /*
     * Required fields
     */
    if (
      !centerId ||
      !learnerId ||
      !sessionType ||
      !deliveryMode ||
      !scheduledStart ||
      !scheduledEnd ||
      !createdByRole
    ) {
      return res.status(400).json({
        success: false,
        message:
          "centerId, learnerId, sessionType, deliveryMode, scheduledStart, scheduledEnd, and createdByRole are required.",
      });
    }

    /*
     * Session type validation
     */
    const validSessionTypes:
      SessionType[] = [
        "speech_training",
        "social_readiness",
      ];

    if (
      !validSessionTypes.includes(
        sessionType as SessionType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid session type.",
      });
    }

    /*
     * Delivery mode validation
     */
    const validDeliveryModes:
      DeliveryMode[] = [
        "clinic",
        "home",
      ];

    if (
      !validDeliveryModes.includes(
        deliveryMode as DeliveryMode
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid delivery mode.",
      });
    }

    /*
     * Creator role validation
     */
    const validCreatorRoles:
      ScheduleCreatorRole[] = [
        "center_admin",
        "therapist",
        "system",
      ];

    if (
      !validCreatorRoles.includes(
        createdByRole as ScheduleCreatorRole
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid schedule creator role.",
      });
    }

    const schedule =
      await createScheduleService({
        centerId,
        learnerId,

        therapistId:
          therapistId || null,

        sessionType:
          sessionType as SessionType,

        deliveryMode:
          deliveryMode as DeliveryMode,

        scheduledStart,
        scheduledEnd,

        notes:
          typeof notes === "string"
            ? notes.trim() || null
            : null,

        createdByRole:
          createdByRole as ScheduleCreatorRole,

        createdById:
          createdById || null,

        fallbackFromSessionId:
          fallbackFromSessionId || null,
      });

    return res.status(201).json({
      success: true,
      message:
        deliveryMode === "clinic"
          ? "Clinic session scheduled successfully."
          : "Home practice scheduled successfully.",
      data: schedule,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to create schedule."
    );
  }
};

/*
|--------------------------------------------------------------------------
| CENTER: Cancel schedule
|--------------------------------------------------------------------------
|
| PATCH /api/schedules/:scheduleId/cancel
|
| Body:
| {
|   "centerId": "...",
|   "reason": "Family requested cancellation"
| }
|--------------------------------------------------------------------------
*/

export const cancelSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const { scheduleId } = req.params;

    const {
      centerId,
      reason,
    } = req.body ?? {};

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message:
          "Schedule ID is required.",
      });
    }

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message:
          "Center ID is required.",
      });
    }

    const schedule =
      await cancelScheduleService(
        scheduleId,
        centerId,
        typeof reason === "string"
          ? reason
          : undefined
      );

    return res.status(200).json({
      success: true,
      message:
        "Session cancelled successfully.",
      data: schedule,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to cancel schedule."
    );
  }
};

/*
|--------------------------------------------------------------------------
| THERAPIST: Confirm assigned session
|--------------------------------------------------------------------------
|
| PATCH /api/schedules/:scheduleId/therapist-confirm
|--------------------------------------------------------------------------
*/

export const confirmTherapistSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const { scheduleId } = req.params;
    const { therapistId } = req.body ?? {};

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: "Schedule ID is required.",
      });
    }

    if (!therapistId) {
      return res.status(400).json({
        success: false,
        message: "Therapist ID is required.",
      });
    }

    const schedule =
      await confirmTherapistScheduleService(
        scheduleId,
        therapistId
      );

    return res.status(200).json({
      success: true,
      message:
        "Session confirmed by therapist successfully.",
      data: schedule,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to confirm session."
    );
  }
};

/*
|--------------------------------------------------------------------------
| THERAPIST: Request reschedule
|--------------------------------------------------------------------------
|
| POST /api/schedules/:scheduleId/reschedule-request
|--------------------------------------------------------------------------
*/

export const requestScheduleReschedule = async (
  req: Request,
  res: Response
) => {
  try {
    const { scheduleId } = req.params;

    const {
      therapistId,
      reason,
      proposedStart,
      proposedEnd,
    } = req.body ?? {};

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: "Schedule ID is required.",
      });
    }

    if (!therapistId) {
      return res.status(400).json({
        success: false,
        message: "Therapist ID is required.",
      });
    }

    if (
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A reason for rescheduling is required.",
      });
    }

    const result =
      await requestScheduleRescheduleService({
        scheduleId,
        therapistId,
        reason,
        proposedStart:
          typeof proposedStart === "string"
            ? proposedStart
            : null,
        proposedEnd:
          typeof proposedEnd === "string"
            ? proposedEnd
            : null,
      });

    return res.status(201).json({
      success: true,
      message:
        "Reschedule request submitted successfully.",
      data: result,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to submit reschedule request."
    );
  }
};

/*
|--------------------------------------------------------------------------
| CENTER: Approve reschedule request
|--------------------------------------------------------------------------
|
| PATCH /api/schedules/reschedule-requests/:requestId/approve
|--------------------------------------------------------------------------
*/

export const approveRescheduleRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const { requestId } = req.params;

    const {
      centerId,
      reviewedById,
      responseNote,
    } = req.body ?? {};

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message:
          "Reschedule request ID is required.",
      });
    }

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: "Center ID is required.",
      });
    }

    const result =
      await approveRescheduleRequestService({
        requestId,
        centerId,
        reviewedById:
          reviewedById || null,
        responseNote:
          typeof responseNote === "string"
            ? responseNote
            : null,
      });

    return res.status(200).json({
      success: true,
      message:
        "Reschedule request approved successfully.",
      data: result,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to approve reschedule request."
    );
  }
};

/*
|--------------------------------------------------------------------------
| CENTER: Reject reschedule request
|--------------------------------------------------------------------------
|
| PATCH /api/schedules/reschedule-requests/:requestId/reject
|--------------------------------------------------------------------------
*/

export const rejectRescheduleRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const { requestId } = req.params;

    const {
      centerId,
      reviewedById,
      responseNote,
    } = req.body ?? {};

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message:
          "Reschedule request ID is required.",
      });
    }

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: "Center ID is required.",
      });
    }

    const result =
      await rejectRescheduleRequestService({
        requestId,
        centerId,
        reviewedById:
          reviewedById || null,
        responseNote:
          typeof responseNote === "string"
            ? responseNote
            : null,
      });

    return res.status(200).json({
      success: true,
      message:
        "Reschedule request rejected successfully.",
      data: result,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to reject reschedule request."
    );
  }
};

/*
|--------------------------------------------------------------------------
| PARENT: Confirm clinic attendance
|--------------------------------------------------------------------------
|
| PATCH /api/schedules/:scheduleId/guardian-confirm
|--------------------------------------------------------------------------
*/

export const confirmGuardianSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const { scheduleId } = req.params;
    const { parentId } = req.body ?? {};

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: "Schedule ID is required.",
      });
    }

    if (!parentId) {
      return res.status(400).json({
        success: false,
        message: "Parent ID is required.",
      });
    }

    const schedule =
      await confirmGuardianScheduleService(
        scheduleId,
        parentId
      );

    return res.status(200).json({
      success: true,
      message:
        "Attendance confirmed successfully.",
      data: schedule,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to confirm attendance."
    );
  }
};

/*
|--------------------------------------------------------------------------
| PARENT: Can't attend clinic session
|--------------------------------------------------------------------------
|
| PATCH /api/schedules/:scheduleId/guardian-decline
|--------------------------------------------------------------------------
*/

export const declineGuardianSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const { scheduleId } = req.params;

    const {
      parentId,
      reason,
      continueAtHome,
      homeStart,
      homeEnd,
    } = req.body ?? {};

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: "Schedule ID is required.",
      });
    }

    if (!parentId) {
      return res.status(400).json({
        success: false,
        message: "Parent ID is required.",
      });
    }

    const result =
      await declineGuardianScheduleService({
        scheduleId,
        parentId,

        reason:
          typeof reason === "string"
            ? reason
            : null,

        continueAtHome:
          continueAtHome === true,

        homeStart:
          typeof homeStart === "string"
            ? homeStart
            : null,

        homeEnd:
          typeof homeEnd === "string"
            ? homeEnd
            : null,
      });

    return res.status(200).json({
      success: true,

      message:
        continueAtHome === true
          ? "Clinic attendance declined and home practice created successfully."
          : "Clinic attendance declined successfully.",

      data: result,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to decline attendance."
    );
  }
};

export const getCenterRescheduleRequests = async (
  req: Request,
  res: Response,
) => {
  try {
    const { centerId } =
      req.params;

    const status =
      typeof req.query.status ===
      "string"
        ? req.query.status
        : undefined;

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message:
          "Center ID is required.",
      });
    }

    const requests =
      await getCenterRescheduleRequestsService(
        centerId,
        status,
      );

    return res.status(200).json({
      success: true,
      message:
        "Reschedule requests fetched successfully.",
      data: requests,
    });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to fetch reschedule requests.",
    );
  }
};

export const updateCenterSchedule = async (
  req: Request,
  res: Response,
) => {
  try {
    const { scheduleId } =
      req.params;

    const {
      centerId,
      therapistId,
      scheduledStart,
      scheduledEnd,
      notes,
    } = req.body ?? {};

    if (
      !scheduleId ||
      !centerId
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Schedule ID and Center ID are required.",
        });
    }

    if (
      !therapistId ||
      !scheduledStart ||
      !scheduledEnd
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Therapist, start time, and end time are required.",
        });
    }

    const schedule =
      await updateCenterScheduleService(
        {
          scheduleId,
          centerId,
          therapistId,
          scheduledStart,
          scheduledEnd,
          notes:
            typeof notes ===
            "string"
              ? notes
              : null,
        },
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Session updated successfully.",
        data: schedule,
      });
  } catch (error) {
    return handleScheduleError(
      res,
      error,
      "Failed to update session.",
    );
  }
};
