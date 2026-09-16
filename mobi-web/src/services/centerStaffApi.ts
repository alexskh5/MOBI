import {
  API_BASE_URL,
} from "./apiBase";
import {
  getAuthHeaders,
} from "./auth";

export type CenterStaffRole = "therapist" | "doctor";

export type CenterStaff = {
  id: string;
  role: CenterStaffRole;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  gender: string;
  specialty: string;
  bio: string;
  email: string;
  phoneNumber: string;
  accountStatus: string;
  isActive: boolean;
  authUserId: string | null;
};

export type CenterStaffPayload = {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  specialty: string;
  email: string;
  temporaryPassword?: string;
  phoneNumber?: string;
  bio?: string;
};

export type TherapistAssignableLearner = {
  id: string;
  learnerCode: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  sexAtBirth: string;
  level: string | null;
  assigned: boolean;
};

export type DoctorLearner = Omit<
  TherapistAssignableLearner,
  "assigned"
> & {
  assignedAt?: string | null;
};

async function parseJson(response: Response) {
  return response.json().catch(() => null);
}

function errorFromResult(
  result: any,
  fallback: string,
) {
  return [result?.message, result?.error]
    .filter(Boolean)
    .join(" ") || fallback;
}

export async function getCenterStaff(role: CenterStaffRole) {
  const response = await fetch(
    `${API_BASE_URL}/center/staff/${role}`,
    {
      headers: getAuthHeaders(),
    },
  );
  const result = await parseJson(response);

  if (!response.ok || !Array.isArray(result?.staff)) {
    throw new Error(
      errorFromResult(result, "Unable to load center staff."),
    );
  }

  return result.staff as CenterStaff[];
}

export async function createCenterStaff(
  role: CenterStaffRole,
  payload: CenterStaffPayload,
) {
  const response = await fetch(
    `${API_BASE_URL}/center/staff/${role}`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const result = await parseJson(response);

  if (!response.ok || !result?.staff) {
    throw new Error(
      errorFromResult(result, "Unable to create staff account."),
    );
  }

  return result.staff as CenterStaff;
}

export async function updateCenterStaff(
  role: CenterStaffRole,
  staffId: string,
  payload: Partial<CenterStaffPayload> & {
    isActive?: boolean;
    accountStatus?: string;
  },
) {
  const response = await fetch(
    `${API_BASE_URL}/center/staff/${role}/${staffId}`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const result = await parseJson(response);

  if (!response.ok || !result?.staff) {
    throw new Error(
      errorFromResult(result, "Unable to update staff account."),
    );
  }

  return result.staff as CenterStaff;
}

export async function deactivateCenterStaff(
  role: CenterStaffRole,
  staffId: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/center/staff/${role}/${staffId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );
  const result = await parseJson(response);

  if (!response.ok || !result?.staff) {
    throw new Error(
      errorFromResult(result, "Unable to deactivate staff account."),
    );
  }

  return result.staff as CenterStaff;
}

export async function getTherapistLearnerAssignments(
  therapistId: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/center/staff/therapist/${therapistId}/learners`,
    {
      headers: getAuthHeaders(),
    },
  );
  const result = await parseJson(response);

  if (!response.ok || !Array.isArray(result?.learners)) {
    throw new Error(
      errorFromResult(
        result,
        "Unable to load therapist learner assignments.",
      ),
    );
  }

  return {
    assignedLearnerIds:
      (result.assignedLearnerIds ?? []) as string[],
    learners:
      result.learners as TherapistAssignableLearner[],
  };
}

export async function saveTherapistLearnerAssignments(
  therapistId: string,
  learnerIds: string[],
) {
  const response = await fetch(
    `${API_BASE_URL}/center/staff/therapist/${therapistId}/learners`,
    {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        learnerIds,
      }),
    },
  );
  const result = await parseJson(response);

  if (!response.ok || !Array.isArray(result?.learners)) {
    throw new Error(
      errorFromResult(
        result,
        "Unable to save therapist learner assignments.",
      ),
    );
  }

  return {
    assignedLearnerIds:
      (result.assignedLearnerIds ?? []) as string[],
    learners:
      result.learners as TherapistAssignableLearner[],
  };
}

export async function getDoctorLearners(doctorId: string) {
  const response = await fetch(
    `${API_BASE_URL}/center/staff/doctor/${doctorId}/learners`,
    {
      headers: getAuthHeaders(),
    },
  );
  const result = await parseJson(response);

  if (!response.ok || !Array.isArray(result?.learners)) {
    throw new Error(
      errorFromResult(result, "Unable to load doctor learners."),
    );
  }

  return result.learners as DoctorLearner[];
}
