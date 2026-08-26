//mobi-web/src/services/lerner/learnerApi.ts

/* =========================================================
   MOBI LEARNER API SERVICE

   File:
   mobi-web/src/services/learner/learnerApi.ts

   PURPOSE:
   This file handles HTTP communication between the
   MOBI web application and the learner backend routes.

   React pages should focus on:
   - form state
   - validation
   - user interface

   This service should handle:
   - API URLs
   - FormData
   - fetch requests
   - response parsing
   - backend error messages
========================================================= */

/*
  The API URL is read from your frontend environment file.

  Example .env:

  VITE_API_URL=http://localhost:5050/api

  The fallback is useful during local development.
*/
const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5050/api";

/* =========================================================
   TYPES
========================================================= */

/*
  The enrollment payload remains flexible for now because
  the learner, guardian, doctor, and assessment structures
  are still being completed in the backend.

  We can replace this with stricter interfaces once the
  complete enrollment API is finalized.
*/
export interface EnrollLearnerRequest {
  learner: Record<string, unknown>;

  guardian: Record<string, unknown>;

  doctor: Record<string, unknown>;

  learnerIntakeProfile: Record<
    string,
    unknown
  >;

  enrollmentStatus: string;
}

/*
  This describes the successful response expected from:

  POST /api/learners/enroll

  Some properties are optional because the backend currently
  only returns the learner. Later, it can also return the
  guardian, doctor assignment, assessment, and profile.
*/
export interface EnrollLearnerResponse {
  success: boolean;

  message?: string;

  learner?: Record<string, unknown>;

  parent?: Record<string, unknown>;

  parentLearner?: Record<
    string,
    unknown
  >;

  doctorAssignment?: Record<
    string,
    unknown
  >;

  assessment?: Record<
    string,
    unknown
  >;

  transactionalProfile?: Record<
    string,
    unknown
  >;
}

/* =========================================================
   ERROR RESPONSE TYPE
========================================================= */

/*
  This represents the standard error shape that the backend
  should return.

  Example:

  {
    "success": false,
    "message": "Email already exists."
  }
*/
interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

/* =========================================================
   RESPONSE PARSER
========================================================= */

/*
  This safely reads JSON from the backend.

  It prevents the frontend from crashing if Express returns
  an empty response or a non-JSON response.
*/
async function parseJsonResponse<T>(
  response: Response,
): Promise<T | null> {
  const contentType =
    response.headers.get(
      "content-type",
    );

  if (
    !contentType?.includes(
      "application/json",
    )
  ) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/* =========================================================
   ENROLL LEARNER
========================================================= */

/*
  Enrolls a learner together with the optional profile photo.

  The backend route currently expects multipart/form-data:

  req.body.payload
  req.files

  Therefore, the payload must be converted into JSON and
  appended to FormData.
*/
export async function enrollLearner(
  payload: EnrollLearnerRequest,
  profilePhoto?: File | null,
): Promise<EnrollLearnerResponse> {
  const requestBody = new FormData();

  /*
    Express receives this through:

    req.body.payload
  */
  requestBody.append(
    "payload",
    JSON.stringify(payload),
  );

  /*
    Multer receives this through req.files.

    The field name must remain "profile_photo" because this
    is the field name currently used by AddLearner.tsx and
    expected by the backend enrollment process.
  */
  if (profilePhoto) {
    requestBody.append(
      "profile_photo",
      profilePhoto,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/learners/enroll`,
      {
        method: "POST",

        /*
          Do not manually set Content-Type here.

          The browser automatically creates the correct
          multipart/form-data boundary for FormData.
        */
        body: requestBody,
      },
    );
  } catch (error) {
    /*
      This usually means:
      - backend is not running
      - wrong port
      - wrong API URL
      - network failure
      - CORS configuration issue
    */
    console.error(
      "Unable to connect to learner enrollment API:",
      error,
    );

    throw new Error(
      "Unable to connect to the MOBI server. Please check that the backend is running.",
    );
  }

  const result =
    await parseJsonResponse<
      EnrollLearnerResponse &
        ApiErrorResponse
    >(response);

  if (!response.ok) {
    /*
      Prefer a useful message from the backend.

      Fall back to a generic message if the backend returned
      no valid JSON response.
    */
    throw new Error(
      result?.message ||
        result?.error ||
        "The learner could not be enrolled.",
    );
  }

  if (!result) {
    throw new Error(
      "The server returned an invalid enrollment response.",
    );
  }

  return result;
}

/* =========================================================
   LEARNER LIST TYPES
========================================================= */

/*
  This matches the learner summary returned by:

  GET /api/learners

  Notice that we keep the actual database/backend fields
  here instead of changing them to fit the table.

  The Learner page can then calculate things such as:
  - age
  - display gender
  - numeric learner level
*/
export interface LearnerListItem {
  id: string;

  learnerCode: string;

  firstName: string;

  middleName: string | null;

  lastName: string;

  nickname: string | null;

  birthDate: string;

  sexAtBirth: string;

  enrollmentStatus: string;

  enrollmentDate: string;

  profilePhotoUrl: string | null;

  suggestedSpeechLadder:
    | string
    | null;

  currentSpeechLadder:
    | string
    | null;

  therapistConfirmed: boolean;
}

/*
  Pagination metadata returned by the backend.
*/
export interface LearnerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/*
  Complete response from:

  GET /api/learners
*/
export interface GetLearnersResponse {
  success: boolean;

  learners: LearnerListItem[];

  pagination: LearnerPagination;

  message?: string;
}

/*
  Supported learner-list parameters.

  These match the backend controller we created.
*/
export interface GetLearnersParams {
  page?: number;

  limit?: number;

  search?: string;

  sortBy?:
    | "last_name"
    | "first_name"
    | "birth_date"
    | "created_at";

  sortOrder?:
    | "asc"
    | "desc";
}

/* =========================================================
   GET LEARNERS
========================================================= */

/*
  Fetches the learners belonging to the current center.

  Example generated request:

  GET /api/learners?page=1&limit=10&search=Phoebe
*/
export async function getLearners(
  params: GetLearnersParams = {},
): Promise<GetLearnersResponse> {
  const searchParams =
    new URLSearchParams();

  if (params.page) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.limit) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  if (params.search?.trim()) {
    searchParams.set(
      "search",
      params.search.trim(),
    );
  }

  if (params.sortBy) {
    searchParams.set(
      "sortBy",
      params.sortBy,
    );
  }

  if (params.sortOrder) {
    searchParams.set(
      "sortOrder",
      params.sortOrder,
    );
  }

  const queryString =
    searchParams.toString();

  const url =
    `${API_BASE_URL}/learners${
      queryString
        ? `?${queryString}`
        : ""
    }`;

  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    console.error(
      "Unable to connect to learner list API:",
      error,
    );

    throw new Error(
      "Unable to connect to the MOBI server. Please check that the backend is running.",
    );
  }

  const result =
    await parseJsonResponse<
      GetLearnersResponse &
        ApiErrorResponse
    >(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Unable to load learners.",
    );
  }

  if (!result) {
    throw new Error(
      "The server returned an invalid learner list response.",
    );
  }

  return result;
}