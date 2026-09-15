import {
  API_BASE_URL,
} from "./apiBase";

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

const AUTH_STORAGE_KEY =
  "mobi.auth.user";

export function getStoredAuthUser() {
  const stored =
    window.localStorage.getItem(
      AUTH_STORAGE_KEY,
    );

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    window.localStorage.removeItem(
      AUTH_STORAGE_KEY,
    );
    return null;
  }
}

export function saveAuthUser(user: AuthUser) {
  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(user),
  );
}

export function clearAuthUser() {
  window.localStorage.removeItem(
    AUTH_STORAGE_KEY,
  );
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        surface: "web",
      }),
    },
  );

  const result = await response
    .json()
    .catch(() => null);

  if (!response.ok || !result?.user) {
    throw new Error(
      result?.message ||
        "Unable to log in.",
    );
  }

  const user = result.user as AuthUser;
  saveAuthUser(user);

  return user;
}

export function isAllowedRole(
  user: AuthUser | null,
  roles: AuthRole[],
) {
  return Boolean(
    user && roles.includes(user.role),
  );
}

export function getAuthHeaders() {
  const user = getStoredAuthUser();
  const headers: Record<string, string> = {};

  if (user?.accessToken) {
    headers.Authorization =
      `Bearer ${user.accessToken}`;
  }

  if (user?.centerId) {
    headers["x-center-id"] =
      user.centerId;
  }

  if (user?.actorId) {
    headers["x-actor-id"] =
      user.actorId;
  }

  if (user?.role) {
    headers["x-actor-role"] =
      user.role;
  }

  return headers;
}
