import { api } from "./api";

export type SessionType =
  | "speech_training"
  | "social_readiness";

export type DeliveryMode =
  | "clinic"
  | "home";

export type ScheduleStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled";

export type TherapistResponse =
  | "pending"
  | "confirmed"
  | "reschedule_requested"
  | "not_required";

export type GuardianResponse =
  | "pending"
  | "confirmed"
  | "declined"
  | "not_required";

export interface ScheduledSession {
  id: string;
  center_id: string;
  learner_id: string;
  therapist_id: string | null;

  session_type: SessionType;
  delivery_mode: DeliveryMode;

  scheduled_start: string;
  scheduled_end: string;

  status: ScheduleStatus;

  notes: string | null;

  created_by_role:
    | "center_admin"
    | "therapist"
    | "system";

  created_by_id: string | null;

  cancellation_reason: string | null;
  cancelled_at: string | null;
  completed_at: string | null;

  therapist_response: TherapistResponse;
  therapist_responded_at: string | null;

  guardian_response: GuardianResponse;
  guardian_responded_at: string | null;
  guardian_decline_reason: string | null;

  home_fallback_selected: boolean;
  fallback_from_session_id: string | null;

  created_at: string;
  updated_at: string;
}

/* =========================================================
   CENTER
========================================================= */

export async function getCenterSchedules(
  centerId: string,
  start?: string,
  end?: string,
) {
  const response = await api.get(
    `/schedules/center/${centerId}`,
    {
      params: {
        ...(start ? { start } : {}),
        ...(end ? { end } : {}),
      },
    },
  );

  return response.data as {
    success: boolean;
    message: string;
    data: ScheduledSession[];
  };
}

export interface CreateScheduleInput {
  centerId: string;
  learnerId: string;
  therapistId?: string | null;

  sessionType: SessionType;
  deliveryMode: DeliveryMode;

  scheduledStart: string;
  scheduledEnd: string;

  notes?: string | null;

  createdByRole:
    | "center_admin"
    | "therapist"
    | "system";

  createdById?: string | null;

  fallbackFromSessionId?: string | null;
}

export async function createSchedule(
  input: CreateScheduleInput,
) {
  const response = await api.post(
    "/schedules",
    input,
  );

  return response.data;
}

export async function cancelSchedule(
  scheduleId: string,
  centerId: string,
  reason?: string,
) {
  const response = await api.patch(
    `/schedules/${scheduleId}/cancel`,
    {
      centerId,
      reason:
        reason?.trim() || null,
    },
  );

  return response.data;
}

export async function approveRescheduleRequest(
  requestId: string,
  centerId: string,
  responseNote?: string,
) {
  const response = await api.patch(
    `/schedules/reschedule-requests/${requestId}/approve`,
    {
      centerId,
      responseNote:
        responseNote?.trim() || null,
    },
  );

  return response.data;
}

export async function rejectRescheduleRequest(
  requestId: string,
  centerId: string,
  responseNote?: string,
) {
  const response = await api.patch(
    `/schedules/reschedule-requests/${requestId}/reject`,
    {
      centerId,
      responseNote:
        responseNote?.trim() || null,
    },
  );

  return response.data;
}

/* =========================================================
   THERAPIST
========================================================= */

export async function getTherapistSchedules(
  therapistId: string,
  start?: string,
  end?: string,
) {
  const response = await api.get(
    `/schedules/therapist/${therapistId}`,
    {
      params: {
        ...(start ? { start } : {}),
        ...(end ? { end } : {}),
      },
    },
  );

  return response.data as {
    success: boolean;
    message: string;
    data: ScheduledSession[];
  };
}

export async function confirmTherapistSchedule(
  scheduleId: string,
  therapistId: string,
) {
  const response = await api.patch(
    `/schedules/${scheduleId}/therapist-confirm`,
    {
      therapistId,
    },
  );

  return response.data;
}

export async function requestTherapistReschedule(
  scheduleId: string,
  input: {
    therapistId: string;
    reason: string;
    proposedStart?: string | null;
    proposedEnd?: string | null;
  },
) {
  const response = await api.post(
    `/schedules/${scheduleId}/reschedule-request`,
    input,
  );

  return response.data;
}

/* =========================================================
   PARENT / GUARDIAN

   These are ready for the mobile integration later.
========================================================= */

export async function confirmGuardianSchedule(
  scheduleId: string,
  parentId: string,
) {
  const response = await api.patch(
    `/schedules/${scheduleId}/guardian-confirm`,
    {
      parentId,
    },
  );

  return response.data;
}

export async function declineGuardianSchedule(
  scheduleId: string,
  input: {
    parentId: string;
    reason?: string | null;
    continueAtHome?: boolean;
    homeStart?: string | null;
    homeEnd?: string | null;
  },
) {
  const response = await api.patch(
    `/schedules/${scheduleId}/guardian-decline`,
    input,
  );

  return response.data;
}

/* =========================================================
   DISPLAY DATA
========================================================= */

export interface ScheduleLearner {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  nickname?: string | null;
  profilePhotoUrl?: string | null;
}

export async function getScheduleLearners() {
  const response = await api.get(
    "/learners",
    {
      params: {
        page: 1,
        limit: 100,
        sortBy: "first_name",
        sortOrder: "asc",
      },
    },
  );

  return (response.data?.learners ??
    []) as ScheduleLearner[];
}

export interface ScheduleRescheduleRequest {
  id: string;
  scheduled_session_id: string;
  requested_by_therapist_id: string | null;

  reason: string;

  proposed_start: string | null;
  proposed_end: string | null;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

  center_response_note: string | null;
  reviewed_by_id: string | null;
  reviewed_at: string | null;

  created_at: string;
  updated_at: string;
}

export async function getCenterRescheduleRequests(
  centerId: string,
  status?: ScheduleRescheduleRequest["status"],
) {
  const response = await api.get(
    `/schedules/reschedule-requests/center/${centerId}`,
    {
      params: status
        ? { status }
        : {},
    },
  );

  return response.data as {
    success: boolean;
    message: string;
    data: ScheduleRescheduleRequest[];
  };
}

export async function updateCenterSchedule(
  scheduleId: string,
  input: {
    centerId: string;
    therapistId: string;
    scheduledStart: string;
    scheduledEnd: string;
    notes?: string | null;
  },
) {
  const response =
    await api.patch(
      `/schedules/${scheduleId}`,
      input,
    );

  return response.data;
}