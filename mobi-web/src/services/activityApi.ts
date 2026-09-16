// mobi-web/src/services/activityApi.ts

const API_BASE_URL =
  "http://localhost:5050";

export type TherapistMaterialView =
  | "mine"
  | "all"
  | "center"
  | "drafts"
  | "archived";

export interface ActivityRecord {
  id: string;
  center_id?: string | null;
  title: string;
  description: string | null;
  activity_type: string;
  speech_ladder_level?: string | null;
  max_attempts?: number | null;
  estimated_minutes?: number | null;
  allow_skip?: boolean | null;
  success_required_count?: number | null;
  thumbnail_url: string | null;
  ai_voice_gender?: string | null;
  ai_voice_speed?: string | null;
  access_scope?: string | null;
  activity_domain?: string | null;
  status: string;
  uploaded_by: string | null;
  created_by_role?: "center" | "therapist" | null;
  created_by_therapist_id?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  steps?: any[];
  activity_steps?: any[];
}

function staffHeaders() {
  const role =
    localStorage.getItem(
      "mobi_staff_role",
    );

  const profileId =
    localStorage.getItem(
      "mobi_staff_profile_id",
    );

  const headers:
    Record<string, string> =
    {};

  if (role) {
    headers[
      "x-mobi-staff-role"
    ] = role;
  }

  if (profileId) {
    headers[
      "x-mobi-staff-profile-id"
    ] = profileId;
  }

  return headers;
}

async function readJson(
  response: Response,
) {
  return response
    .json()
    .catch(() => null);
}

function throwApiError(
  result: any,
  fallback: string,
) {
  throw new Error(
    result?.message ||
      result?.error ||
      fallback,
  );
}

export async function getActivities() {
  const response =
    await fetch(
      `${API_BASE_URL}/activities`,
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to fetch activities",
    );
  }

  return result as
    ActivityRecord[];
}

export async function getTherapistMaterials(
  therapistId: string,
  view:
    TherapistMaterialView,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/activities/therapists/${therapistId}/materials?view=${encodeURIComponent(
        view,
      )}`,
      {
        headers: {
          ...staffHeaders(),
        },
      },
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to fetch Therapist materials.",
    );
  }

  return (
    result?.activities ??
    []
  ) as ActivityRecord[];
}

export async function getActivityById(
  id: string,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/activities/${id}`,
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to fetch activity",
    );
  }

  return result as
    ActivityRecord;
}

export async function createActivity(
  payload: any,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/activities`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",

          ...staffHeaders(),
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to create activity",
    );
  }

  return result;
}

export async function updateActivity(
  activityId: string,
  payload: any,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/activities/${activityId}`,
      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          ...staffHeaders(),
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to update activity.",
    );
  }

  return result;
}

export async function submitActivityForReview(
  activityId: string,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/activities/${activityId}/submit-review`,
      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          ...staffHeaders(),
        },
      },
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to submit activity for review.",
    );
  }

  return result;
}

export async function archiveActivity(
  activityId: string,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/activities/${activityId}/archive`,
      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          ...staffHeaders(),
        },
      },
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to archive activity.",
    );
  }

  return result;
}

export async function restoreActivity(
  activityId: string,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/activities/${activityId}/restore`,
      {
        method:
          "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          ...staffHeaders(),
        },
      },
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to restore activity.",
    );
  }

  return result;
}

export async function deleteActivity(
  activityId: string,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/activities/${activityId}`,
      {
        method:
          "DELETE",

        headers: {
          ...staffHeaders(),
        },
      },
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to delete activity.",
    );
  }

  return result;
}

export async function previewTTS({
  text,
  voice = "Kore",
  style = "friendly",
  emotion = "warm",
}: {
  text: string;
  voice?: string;
  style?: string;
  emotion?: string;
}) {
  const response =
    await fetch(
      `${API_BASE_URL}/speech/tts`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            text,
            voice,
            style,
            emotion,
          }),
      },
    );

  if (!response.ok) {
    const error =
      await response
        .json()
        .catch(
          () => null,
        );

    throw new Error(
      error?.message ||
        "Failed to preview TTS",
    );
  }

  const audioBlob =
    await response.blob();

  const audioUrl =
    URL.createObjectURL(
      audioBlob,
    );

  const audio =
    new Audio(
      audioUrl,
    );

  await audio.play();

  audio.onended =
    () => {
      URL.revokeObjectURL(
        audioUrl,
      );
    };
}

/* =========================================================
   ASSIGN ACTIVITY TO LEARNERS
========================================================= */

export interface AssignActivityRequest {
  activityId: string;
  learnerIds: string[];
  assignmentType?:
    | "required"
    | "recommended";
  priority?: number;
  maxAttemptsOverride?:
    | number
    | null;
  estimatedMinutesOverride?:
    | number
    | null;
  allowSkipOverride?:
    | boolean
    | null;
}

export async function assignActivityToLearners(
  payload:
    AssignActivityRequest,
) {
  const response =
    await fetch(
      `${API_BASE_URL}/activities/assignments`,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const result =
    await readJson(
      response,
    );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to assign activity to learners.",
    );
  }

  return result;
}
