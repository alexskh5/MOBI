const DEFAULT_API_ROOT =
  "http://localhost:5052";

const configuredApiUrl =
  import.meta.env.VITE_API_URL as string | undefined;

const configuredApiRoot =
  import.meta.env.VITE_API_ROOT as string | undefined;

export const API_ROOT =
  (configuredApiRoot ?? configuredApiUrl?.replace(/\/api\/?$/, "") ?? DEFAULT_API_ROOT)
    .replace(/\/$/, "");

export const API_BASE_URL =
  `${API_ROOT}/api`;
