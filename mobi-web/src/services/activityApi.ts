//mobi-web/src/services/activityApi.ts
import {
  API_ROOT,
} from "./apiBase";
import {
  getAuthHeaders,
} from "./auth";

const API_BASE_URL = API_ROOT;
const ttsAudioCache = new Map<string, string>();
const ttsRequestCache = new Map<string, Promise<string>>();

export async function getActivities() {
  const response = await fetch(
    `${API_BASE_URL}/activities`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to submit activity for review.",
    );
  }

  return result;
}

export async function getActivityById(id: string) {
  const response = await fetch(
    `${API_BASE_URL}/activities/${id}`,
    {
      headers: getAuthHeaders(),
    },
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

export async function createActivity(payload: any) {
  const response = await fetch(`${API_BASE_URL}/activities`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throwApiError(
      result,
      "Failed to delete activity.",
    );
  }

  return result;
}

export async function archiveActivity(id: string) {
  const response = await fetch(`${API_BASE_URL}/activities/${id}/archive`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to archive activity",
    );
  }

  return result;
}

export async function getSubmittedActivities() {
  const response = await fetch(
    `${API_BASE_URL}/activities/reviews/submissions`,
    {
      headers: getAuthHeaders(),
    },
  );
  const result = await response.json().catch(() => null);

  if (!response.ok || !Array.isArray(result?.activities)) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to fetch submitted activities",
    );
  }

  return result.activities;
}

export async function approveSubmittedActivity(
  id: string,
  feedback = "",
) {
  const response = await fetch(
    `${API_BASE_URL}/activities/${id}/review/publish`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ feedback }),
    },
  );
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to approve activity",
    );
  }

  return result;
}

export async function declineSubmittedActivity(
  id: string,
  reason: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/activities/${id}/review/decline`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    },
  );
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to decline activity",
    );
  }

  return result;
}

export async function resubmitActivityForReview(
  id: string,
  payload: any,
) {
  const response = await fetch(
    `${API_BASE_URL}/activities/${id}/review/resubmit`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to resubmit activity",
    );
  }

  return result;
}

export type ActivityAssetCategory =
  | "thumbnail"
  | "step-media"
  | "prompt-audio"
  | "regulation";

export async function uploadActivityAsset(
  file: File,
  category: ActivityAssetCategory,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const response = await fetch(`${API_BASE_URL}/activities/assets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to upload activity asset",
    );
  }

  return result.asset;
}

export async function previewTTS({
  text,
  voice = "Kore",
  speed = 1,
  style = "friendly",
  emotion = "warm",
}: {
  text: string;
  voice?: string;
  speed?: number;
  style?: string;
  emotion?: string;
}) {
  const normalizedText = text.trim();

  if (!normalizedText) {
    throw new Error("Text is required.");
  }

  const cacheKey = JSON.stringify({
    text: normalizedText,
    voice,
    speed,
    style,
    emotion,
  });

  const cachedAudioUrl = ttsAudioCache.get(cacheKey);

  if (cachedAudioUrl) {
    const audio = new Audio(cachedAudioUrl);
    await audio.play();
    return {
      cached: true,
    };
  }

  let request = ttsRequestCache.get(cacheKey);

  if (!request) {
    request = generateTTSBlob({
        text: normalizedText,
        voice,
        speed,
        style,
        emotion,
    }).then((audioBlob) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      ttsAudioCache.set(cacheKey, audioUrl);
      return audioUrl;
    });

    ttsRequestCache.set(cacheKey, request);
  }

  try {
    const audioUrl = await request;
    const audio = new Audio(audioUrl);
    await audio.play();

    return {
      cached: false,
    };
  } finally {
    ttsRequestCache.delete(cacheKey);
  }
}

export async function generateTTSBlob({
  text,
  voice = "Kore",
  speed = 1,
  style = "friendly",
  emotion = "warm",
}: {
  text: string;
  voice?: string;
  speed?: number;
  style?: string;
  emotion?: string;
}) {
  const normalizedText = text.trim();

  if (!normalizedText) {
    throw new Error("Text is required.");
  }

  const response = await fetch(`${API_BASE_URL}/speech/tts`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: normalizedText,
      voice,
      speed,
      style,
      emotion,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate TTS");
  }

  return response.blob();
}

export function clearTTSPreviewCache() {
  ttsAudioCache.forEach((audioUrl) => {
    URL.revokeObjectURL(audioUrl);
  });

  ttsAudioCache.clear();
  ttsRequestCache.clear();
}

export async function previewTTSUncached({
  text,
  voice = "Kore",
  speed = 1,
  style = "friendly",
  emotion = "warm",
}: {
  text: string;
  voice?: string;
  speed?: number;
  style?: string;
  emotion?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/speech/tts`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice,
      speed,
      style,
      emotion,
    }),
  });

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
  const response = await fetch(
    `${API_BASE_URL}/activities/assignments`,
    {
      method: "POST",

      headers: {
        ...getAuthHeaders(),
        "Content-Type":
          "application/json",
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
