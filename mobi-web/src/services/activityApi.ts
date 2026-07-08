// const API_BASE_URL = "http://localhost:5050";

// export async function getActivities() {
//   const response = await fetch(`${API_BASE_URL}/activities`);

//   if (!response.ok) {
//     throw new Error("Failed to fetch activities");
//   }

//   return response.json();
// }

// export async function getActivityById(id: string) {
//   const response = await fetch(`${API_BASE_URL}/activities/${id}`);

//   if (!response.ok) {
//     throw new Error("Failed to fetch activity");
//   }

//   return response.json();
// }

//mobi-web/src/services/activityApi.ts
const API_BASE_URL = "http://localhost:5050";

export async function getActivities() {
  const response = await fetch(`${API_BASE_URL}/activities`);

  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  return response.json();
}

export async function getActivityById(id: string) {
  const response = await fetch(`${API_BASE_URL}/activities/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch activity");
  }

  return response.json();
}

export async function createActivity(payload: any) {
  const response = await fetch(`${API_BASE_URL}/activities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create activity");
  }

  return response.json();
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
  const response = await fetch(`${API_BASE_URL}/speech/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice,
      style,
      emotion,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to preview TTS");
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  const audio = new Audio(audioUrl);
  await audio.play();

  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };
}