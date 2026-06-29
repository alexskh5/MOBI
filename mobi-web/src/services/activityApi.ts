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