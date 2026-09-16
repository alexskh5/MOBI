// MOBI/mobi-backend/src/routes/scheduleRoutes.ts

import { Router } from "express";
import {
  getCenterSchedules,
  getTherapistSchedules,
  createSchedule,
  cancelSchedule,
  confirmTherapistSchedule,
  requestScheduleReschedule,
  approveRescheduleRequest,
  rejectRescheduleRequest,
  confirmGuardianSchedule,
  declineGuardianSchedule,
  getCenterRescheduleRequests,
  updateCenterSchedule,
} from "../controllers/scheduleController";

const router = Router();

// CENTER
// GET /api/schedules/center/:centerId
router.get(
  "/center/:centerId",
  getCenterSchedules
);

// THERAPIST
// GET /api/schedules/therapist/:therapistId
router.get(
  "/therapist/:therapistId",
  getTherapistSchedules
);

// CREATE SCHEDULE
// POST /api/schedules
router.post(
  "/",
  createSchedule
);

// CANCEL SCHEDULE
// PATCH /api/schedules/:scheduleId/cancel
router.patch(
  "/:scheduleId/cancel",
  cancelSchedule
);

// THERAPIST: Confirm assigned clinic session
router.patch(
  "/:scheduleId/therapist-confirm",
  confirmTherapistSchedule
);

// THERAPIST: Request reschedule
router.post(
  "/:scheduleId/reschedule-request",
  requestScheduleReschedule
);

// CENTER: Approve therapist reschedule request
router.patch(
  "/reschedule-requests/:requestId/approve",
  approveRescheduleRequest
);

// CENTER: Reject therapist reschedule request
router.patch(
  "/reschedule-requests/:requestId/reject",
  rejectRescheduleRequest
);

router.patch(
  "/:scheduleId/guardian-confirm",
  confirmGuardianSchedule
);

router.patch(
  "/:scheduleId/guardian-decline",
  declineGuardianSchedule
);

router.get(
  "/reschedule-requests/center/:centerId",
  getCenterRescheduleRequests,
);

router.patch(
  "/:scheduleId",
  updateCenterSchedule,
);

export default router;