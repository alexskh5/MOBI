import { API_BASE_URL } from "./apiBase";
import { getAuthHeaders } from "./auth";

export type ScheduleStatus =
  | "pending"
  | "confirmed"
  | "edit_requested"
  | "declined"
  | "cancelled";

export type TherapySchedule = {
  id: string;
  centerId: string;
  learnerId: string;
  learnerName: string;
  learnerCode: string | null;
  therapistId: string;
  therapistName: string;
  therapistSpecialty: string;
  dateKey: string;
  time: string;
  durationMinutes: number;
  status: ScheduleStatus;
  notes: string;
  therapistResponseNote: string;
  assignedByCenterAdminId: string | null;
  createdAt: string;
  updatedAt: string;
};

async function parseJson(response: Response) {
  return response.json().catch(() => null);
}

function getError(result: any, fallback: string) {
  return [result?.message, result?.error].filter(Boolean).join(" ") || fallback;
}

export async function getSchedules() {
  const response = await fetch(`${API_BASE_URL}/schedules`, {
    headers: getAuthHeaders(),
  });
  const result = await parseJson(response);

  if (!response.ok || !Array.isArray(result?.schedules)) {
    throw new Error(getError(result, "Unable to load schedules."));
  }

  return result.schedules as TherapySchedule[];
}

export async function saveSchedule(
  payload: {
    learnerId: string;
    therapistId: string;
    dateKey: string;
    time: string;
    durationMinutes?: number;
    notes?: string;
  },
  scheduleId?: string,
) {
  const response = await fetch(
    scheduleId
      ? `${API_BASE_URL}/schedules/${scheduleId}`
      : `${API_BASE_URL}/schedules`,
    {
      method: scheduleId ? "PATCH" : "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const result = await parseJson(response);

  if (!response.ok || !result?.schedule) {
    throw new Error(getError(result, "Unable to save schedule."));
  }

  return result.schedule as TherapySchedule;
}

export async function cancelSchedule(scheduleId: string) {
  const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const result = await parseJson(response);

  if (!response.ok || !result?.schedule) {
    throw new Error(getError(result, "Unable to cancel schedule."));
  }

  return result.schedule as TherapySchedule;
}

export async function respondToSchedule(
  scheduleId: string,
  action: "approve" | "request-edit" | "decline",
  note = "",
) {
  const response = await fetch(
    `${API_BASE_URL}/schedules/${scheduleId}/${action}`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note }),
    },
  );
  const result = await parseJson(response);

  if (!response.ok || !result?.schedule) {
    throw new Error(getError(result, "Unable to respond to schedule."));
  }

  return result.schedule as TherapySchedule;
}
