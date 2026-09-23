// mobi-mobile/src/services/api.ts

import {
  File,
  Paths,
} from "expo-file-system";

const API_BASE_URL = "http://192.168.254.130:5052";
const STT_TIMEOUT_MS = 9000;
const TTS_TIMEOUT_MS = 5500;

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

function getNetworkErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  if (
    message.toLowerCase().includes("network request failed")
  ) {
    return (
      `Cannot reach MOBI backend at ${API_BASE_URL}. ` +
      "Make sure the backend is running, your phone and Mac are on the same Wi-Fi, and Mac firewall is not blocking the backend port."
    );
  }

  return message;
}
export type AuthRole =
  | "super_admin"
  | "center_admin"
  | "therapist"  
  | "doctor"
  | "parent";

export type AuthUser = {
  id: string;
  actorId: string;
  role: AuthRole;
  email: string;
  firstName: string;
  lastName: string;
  centerId: string | null;
  centerName: string | null;
  accessToken: string;
  defaultWebRoute: string;
  defaultMobileRoute: "ChildDashboard" | "AdultDashboard";
};

export type MobileLearner = {
  id: string;
  learnerCode: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  nickname?: string | null;
  birthDate?: string | null;
  sexAtBirth?: string | null;
  profilePhotoUrl?: string | null;
  currentSpeechLadder?: string | null;
  suggestedSpeechLadder?: string | null;
};

let currentAuthUser: AuthUser | null = null;
let activeLearner: MobileLearner | null = null;

export function getCurrentAuthUser() {
  return currentAuthUser;
}

export function setCurrentAuthUser(user: AuthUser | null) {
  currentAuthUser = user;

  if (!user) {
    activeLearner = null;
  }
}

export function getActiveLearner() {
  return activeLearner;
}

export function setActiveLearner(learner: MobileLearner | null) {
  activeLearner = learner;
}

export function getActiveLearnerId() {
  return activeLearner?.id ?? "";
}

function getAuthHeaders() {
  const headers: Record<string, string> = {};

  if (currentAuthUser?.accessToken) {
    headers.Authorization =
      `Bearer ${currentAuthUser.accessToken}`;
  }

  if (currentAuthUser?.centerId) {
    headers["x-center-id"] =
      currentAuthUser.centerId;
  }

  if (currentAuthUser?.actorId) {
    headers["x-actor-id"] =
      currentAuthUser.actorId;
  }

  if (currentAuthUser?.role) {
    headers["x-actor-role"] =
      currentAuthUser.role;
  }

  return headers;
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          surface: "mobile",
        }),
      },
    );
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  const result = await response
    .json()
    .catch(() => null);

  if (!response.ok || !result?.user) {
    throw new Error(
      result?.message ||
        "Unable to log in.",
    );
  }

  setCurrentAuthUser(result.user);

  return result.user as AuthUser;
}

export async function getActivities() {
  const response = await fetch(
    `${API_BASE_URL}/activities`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  return response.json();
}

export async function getMobileLearners({
  search = "",
}: {
  search?: string;
} = {}) {
  const params = new URLSearchParams({
    page: "1",
    limit: "100",
    sortBy: "last_name",
    sortOrder: "asc",
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}/api/learners?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !Array.isArray(result?.learners)) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to load assigned learners.",
    );
  }

  return result.learners as MobileLearner[];
}

export async function getLearnerProfileSettings(
  learnerId: string,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/learners/${learnerId}/profile-settings`,
    {
      headers: getAuthHeaders(),
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.settings) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to load learner settings.",
    );
  }

  return result.settings;
}

export async function getLearnerProgressOverview({
  learnerId,
  period = "day",
}: {
  learnerId: string;
  period?: "day" | "week" | "month" | "year";
}) {
  const response = await fetch(
    `${API_BASE_URL}/api/progress/overview?learnerId=${encodeURIComponent(
      learnerId,
    )}&period=${encodeURIComponent(period)}`,
    {
      headers: getAuthHeaders(),
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.overview) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to load learner progress.",
    );
  }

  return result.overview;
}

export async function updateLearnerProfileSettings({
  learnerId,
  childSafetySettings,
}: {
  learnerId: string;
  childSafetySettings: {
    dailyScreenTimeLimitSeconds: number | null;
  };
}) {
  const response = await fetch(
    `${API_BASE_URL}/api/learners/${learnerId}/profile-settings`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        childSafetySettings,
      }),
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.settings) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to save learner settings.",
    );
  }

  return result.settings;
}

export async function getActivityById(id: string) {
  const response = await fetch(
    `${API_BASE_URL}/activities/${id}`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch activity");
  }

  return response.json();
}

export async function transcribeAndEvaluateAudio({
  audioUri,
  expectedAnswers,
  acceptedVariations,
}: {
  audioUri: string;
  expectedAnswers: string[];
  acceptedVariations: string[];
}) {
  const formData = new FormData();

  formData.append("audio", {
    uri: audioUri,
    name: "learner-answer.mp4",
    type: "audio/mp4",
  } as any);

  formData.append("expected_answers", JSON.stringify(expectedAnswers));
  formData.append("accepted_variations", JSON.stringify(acceptedVariations));

  const timeout =
    createTimeoutSignal(STT_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/speech/transcribe-and-evaluate`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
        signal: timeout.signal,
      },
    );
  } catch (error) {
    throw new Error(
      error instanceof Error &&
      error.name === "AbortError"
        ? "Speech recognition took too long."
        : getNetworkErrorMessage(error),
    );
  } finally {
    timeout.clear();
  }

  if (!response.ok) {
    throw new Error("Failed to transcribe and evaluate audio");
  }

  return response.json();
}

export async function generateTTSAudio({
  text,
  voice = "Kore",
  style = "Teaching",
  emotion = "Calm",
}: {
  text: string;
  voice?: string;
  style?: string;
  emotion?: string;
}) {
  const normalizedText =
    text.trim();

  const cacheSource =
    JSON.stringify({
      text: normalizedText,
      voice,
      style,
      emotion,
    });

  let cacheHash = 0;

  for (let index = 0; index < cacheSource.length; index += 1) {
    cacheHash =
      (cacheHash * 31 + cacheSource.charCodeAt(index)) >>> 0;
  }

  const cachedFile = new File(
    Paths.cache,
    `mobi-tts-${cacheHash.toString(16)}.wav`,
  );

  if (cachedFile.exists) {
    return cachedFile.uri;
  }

  const timeout =
    createTimeoutSignal(TTS_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/speech/tts`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: normalizedText,
        voice,
        style,
        emotion,
        return_base64: true,
      }),
      signal: timeout.signal,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error &&
      error.name === "AbortError"
        ? "Speech audio took too long."
        : getNetworkErrorMessage(error),
    );
  } finally {
    timeout.clear();
  }

  if (!response.ok) {
    throw new Error("Failed to generate speech.");
  }

  const data = await response.json();

  const file =
    data.file_extension === "wav"
      ? cachedFile
      : new File(
          Paths.cache,
          `mobi-tts-${cacheHash.toString(16)}.${data.file_extension || "wav"}`,
        );

  file.write(
    data.audio_base64,
    {
      encoding: "base64",
    },
  );

  return file.uri;
}



/* =========================================================
   ADAPTIVE ACTIVITY SELECTION
========================================================= */

export interface RecommendedActivityResponse {
  success: boolean;

  nextActivity:
    | {
        activityId: string;

        assignmentId:
          string | null;

        source:
          string;

        selectionAlgorithm:
          string | null;

        selectionReason:
          Record<
            string,
            unknown
          >;

        activity: {
          id: string;

          title: string;

          description:
            string | null;

          activity_type:
            string;

          speech_ladder_level:
            string | null;

          delivery_mode:
            string;

          interaction_mode:
            string;

          max_attempts:
            number;

          estimated_minutes:
            number;

          allow_skip:
            boolean;

          success_required_count:
            number;

          thumbnail_url:
            string | null;
        };
      }
    | null;
}

/* =========================================================
   GET NEXT RECOMMENDED ACTIVITY
========================================================= */

export async function getNextRecommendedActivity(
  learnerId:
    string,
  excludeActivityId?: string,
) {
  const timeout =
    createTimeoutSignal(6500);

  const response =
    await fetch(
      `${API_BASE_URL}/api/activity-sessions/next?learnerId=${encodeURIComponent(
        learnerId,
      )}${excludeActivityId ? `&excludeActivityId=${encodeURIComponent(excludeActivityId)}` : ""}`,
      {
        headers: getAuthHeaders(),
        signal: timeout.signal,
      },
    ).finally(timeout.clear);

  if (!response.ok) {
    throw new Error(
      "Failed to get recommended activity.",
    );
  }

  return response.json() as
    Promise<RecommendedActivityResponse>;
}

/* =========================================================
   START ACTIVITY SESSION
========================================================= */

export async function startActivitySession({
  learnerId,
  activityId,
  assignmentId = null,
  sessionSource = "manual",
  selectionAlgorithm = null,
  selectionReason = {},
}: {
  learnerId:
    string;

  activityId:
    string;

  assignmentId?:
    string | null;

  sessionSource?:
    | "assigned_required"
    | "assigned_recommended"
    | "adaptive"
    | "manual";

  selectionAlgorithm?:
    string | null;

  selectionReason?:
    Record<
      string,
      unknown
    >;
}) {
  const response =
    await fetch(
      `${API_BASE_URL}/api/activity-sessions/start`,
      {
        method:
          "POST",

        headers: {
          ...getAuthHeaders(),
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            learnerId,

            activityId,

            assignmentId,

            sessionSource,

            selectionAlgorithm,

            selectionReason,
          }),
      },
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to start activity session.",
    );
  }

  return result;
}

/* =========================================================
   RESPOND INSIDE ACTIVE ACTIVITY SESSION
========================================================= */

export async function respondToActivitySession({
  sessionId,
  learnerId,

  attemptOrder,
  stepAttemptNumber,
  activityStepId,

  responseType = "speech",
  transcript,
  selectedChoiceId = null,
  actionCompleted = null,
  adultScoringOverride = null,

  expectedAnswers,
  acceptedVariations,

  responseTimeMs,

  gazeDetectionAvailable = false,
  gazePresent = null,
  gazeAwaySeconds = 0,
  inactivitySeconds = 0,

  reachedMaximumAttempts = false,
  activityCompleted = false,

  therapistRequestedStop = false,
  parentRequestedStop = false,

  adaptiveSettings,
}: {
  sessionId:
    string;

  learnerId:
    string;

  attemptOrder:
    number;

  stepAttemptNumber:
    number;

  activityStepId:
    string;

  responseType?:
    | "speech"
    | "choice"
    | "action"
    | "conversation";

  transcript:
    string;

  selectedChoiceId?:
    string | number | null;

  actionCompleted?:
    boolean | null;

  adultScoringOverride?:
    | "correct"
    | "incorrect"
    | null;

  expectedAnswers:
    string[];

  acceptedVariations:
    string[];

  responseTimeMs:
    number | null;

  gazeDetectionAvailable?:
    boolean;

  gazePresent?:
    boolean | null;

  gazeAwaySeconds?:
    number;

  inactivitySeconds?:
    number;

  reachedMaximumAttempts?:
    boolean;

  activityCompleted?:
    boolean;

  therapistRequestedStop?:
    boolean;

  parentRequestedStop?:
    boolean;

  adaptiveSettings: {
    inactivityBreakSeconds:
      number;

    inactivityAutoStopSeconds:
      number;

    oneMoreTryEnabled:
      boolean;

    allowBreakSuggestion:
      boolean;
  };
}) {
  const response =
    await fetch(
      `${API_BASE_URL}/api/activity-sessions/${sessionId}/respond`,
      {
        method:
          "POST",

        headers: {
          ...getAuthHeaders(),
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            learnerId,

            attemptOrder,

            stepAttemptNumber,

            activityStepId,

            responseType,

            transcript,

            selectedChoiceId,

            actionCompleted,

            adultScoringOverride,

            expectedAnswers,

            acceptedVariations,

            responseTimeMs,

            gazeDetectionAvailable,

            gazePresent,

            gazeAwaySeconds,

            inactivitySeconds,

            reachedMaximumAttempts,

            activityCompleted,

            therapistRequestedStop,

            parentRequestedStop,

            adaptiveSettings,
          }),
      },
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to process learner response.",
    );
  }

  return result;
}

export async function skipActivitySessionStep({
  sessionId,
  learnerId,
  activityStepId,
  attemptOrder,
  stepAttemptNumber,
  skipReason = "Skipped during mobile session testing.",
}: {
  sessionId: string;
  learnerId: string;
  activityStepId: string;
  attemptOrder: number;
  stepAttemptNumber: number;
  skipReason?: string;
}) {
  const response =
    await fetch(
      `${API_BASE_URL}/api/activity-sessions/${sessionId}/steps/${activityStepId}/skip`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          learnerId,
          attemptOrder,
          stepAttemptNumber,
          skipReason,
        }),
      },
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to skip activity step.",
    );
  }

  return result;
}

/* =========================================================
   FINISH ACTIVITY SESSION
========================================================= */

export async function finishActivitySession({
  sessionId,
  learnerId,
  status = "completed",

  totalDurationSeconds = 0,
  inactivitySeconds = 0,

  gazePresentSeconds = 0,
  gazeAwaySeconds = 0,
  gazeDetectionAvailable = false,

  breakCount = 0,
  breakSuggested = false,

  stoppedBy = null,
  stopReason = null,

  recommendedNextAction = null,
}: {
  sessionId:
    string;

  learnerId:
    string;

  status?:
    | "completed"
    | "skipped"
    | "stopped"
    | "interrupted";

  totalDurationSeconds?:
    number;

  inactivitySeconds?:
    number;

  gazePresentSeconds?:
    number;

  gazeAwaySeconds?:
    number;

  gazeDetectionAvailable?:
    boolean;

  breakCount?:
    number;

  breakSuggested?:
    boolean;

  stoppedBy?:
    string | null;

  stopReason?:
    string | null;

  recommendedNextAction?:
    | "continue_assigned"
    | "same_difficulty"
    | "increase_difficulty"
    | "decrease_difficulty"
    | "suggest_break"
    | "end_session"
    | "therapist_review"
    | null;
}) {
  const response =
    await fetch(
      `${API_BASE_URL}/api/activity-sessions/${sessionId}/finish`,
      {
        method:
          "POST",

        headers: {
          ...getAuthHeaders(),
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            learnerId,

            status,

            totalDurationSeconds,

            inactivitySeconds,

            gazePresentSeconds,

            gazeAwaySeconds,

            gazeDetectionAvailable,

            breakCount,

            breakSuggested,

            stoppedBy,

            stopReason,

            recommendedNextAction,
          }),
      },
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Failed to finish activity session.",
    );
  }

  return result;
}
