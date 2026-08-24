// mobi-backend/src/services/learner/learnerListService.ts

import { supabase } from "../../config/supabase";

import {
  createLearnerPhotoSignedUrl,
} from "./storageService";

/* =========================================================
   TYPES
========================================================= */

/*
  Query options for the learner list.

  These will support:
  - pagination
  - search
  - sorting

  The frontend can later call:

  GET /api/learners?page=1&limit=10&search=lexi
*/
export interface LearnerListOptions {
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
   GET LEARNER LIST
========================================================= */

/*
  Returns lightweight learner summaries.

  IMPORTANT:

  We intentionally DO NOT return:
  - assessment responses
  - guardian information
  - full assessment details

  Those belong in:

  GET /api/learners/:learnerId

  This keeps the learner list endpoint fast.
*/
export async function getLearnerList(
  centerId: string,
  options: LearnerListOptions = {},
) {
  /* =======================================================
     1. NORMALIZE QUERY OPTIONS
  ======================================================= */

  const page =
    Math.max(
      options.page ?? 1,
      1,
    );

  const limit =
    Math.min(
      Math.max(
        options.limit ?? 10,
        1,
      ),
      100,
    );

  const search =
    options.search?.trim() ?? "";

  const sortBy =
    options.sortBy ??
    "created_at";

  const sortOrder =
    options.sortOrder ??
    "desc";

  /*
    Supabase pagination uses zero-based ranges.

    Example:

    page 1, limit 10
    → 0 to 9

    page 2, limit 10
    → 10 to 19
  */
  const from =
    (page - 1) * limit;

  const to =
    from + limit - 1;

  /* =======================================================
     2. BUILD LEARNER QUERY
  ======================================================= */

  /*
    We select only fields needed by the list page.

    learner_transactional_profiles gives us the current
    Speech Ladder / suggested Speech Ladder without loading
    the entire assessment.
  */
  let query =
    supabase
      .from("learners")
      .select(
        `
        id,
        learner_code,
        first_name,
        middle_name,
        last_name,
        nickname,
        birth_date,
        sex_at_birth,
        profile_picture_url,
        enrollment_status,
        enrollment_date,
        created_at,
        learner_transactional_profiles (
          suggested_speech_ladder,
          current_speech_ladder,
          therapist_confirmed
        )
      `,
        {
          count: "exact",
        },
      )
      .eq(
        "center_id",
        centerId,
      );

  /* =======================================================
     3. SEARCH
  ======================================================= */

  /*
    Search is performed against:

    first_name
    last_name
    learner_code

    Example:

    search=Khezy
    search=Mangubat
    search=LRN-178...
  */
  if (search) {
    query =
      query.or(
        [
          `first_name.ilike.%${search}%`,
          `last_name.ilike.%${search}%`,
          `learner_code.ilike.%${search}%`,
        ].join(","),
      );
  }

  /* =======================================================
     4. SORT AND PAGINATE
  ======================================================= */

  query =
    query
      .order(
        sortBy,
        {
          ascending:
            sortOrder === "asc",
        },
      )
      .range(
        from,
        to,
      );

  const {
    data,
    error,
    count,
  } = await query;

  if (error) {
    console.error(
      "Unable to fetch learner list:",
      error,
    );

    throw error;
  }

  /* =======================================================
     5. BUILD FRONTEND-FRIENDLY RESPONSE
  ======================================================= */

  /*
    Each learner may have an optional private profile image.

    We generate a signed URL only when needed.
  */
  const learners =
    await Promise.all(
      (data ?? []).map(
        async (learner: any) => {
          let profilePhotoUrl:
            | string
            | null = null;

          if (
            learner.profile_picture_url
          ) {
            try {
              profilePhotoUrl =
                await createLearnerPhotoSignedUrl(
                  learner.profile_picture_url,
                );
            } catch (error) {
              /*
                A photo failure should not prevent the whole
                learner list from loading.
              */
              console.error(
                `Unable to create signed photo URL for learner ${learner.id}:`,
                error,
              );
            }
          }

          /*
            Depending on Supabase relationship inference,
            this may be returned as either:

            object
            or
            array

            We normalize it here.
          */
          const rawProfile =
            learner
              .learner_transactional_profiles;

          const transactionalProfile =
            Array.isArray(rawProfile)
              ? rawProfile[0] ?? null
              : rawProfile ?? null;

          return {
            id:
              learner.id,

            learnerCode:
              learner.learner_code,

            firstName:
              learner.first_name,

            middleName:
              learner.middle_name,

            lastName:
              learner.last_name,

            nickname:
              learner.nickname,

            birthDate:
              learner.birth_date,

            sexAtBirth:
              learner.sex_at_birth,

            enrollmentStatus:
              learner.enrollment_status,

            enrollmentDate:
              learner.enrollment_date,

            profilePhotoUrl,

            suggestedSpeechLadder:
              transactionalProfile
                ?.suggested_speech_ladder ??
              null,

            currentSpeechLadder:
              transactionalProfile
                ?.current_speech_ladder ??
              null,

            therapistConfirmed:
              transactionalProfile
                ?.therapist_confirmed ??
              false,
          };
        },
      ),
    );

  /* =======================================================
     6. PAGINATION METADATA
  ======================================================= */

  const total =
    count ?? 0;

  const totalPages =
    total > 0
      ? Math.ceil(
          total / limit,
        )
      : 0;

  return {
    learners,

    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}