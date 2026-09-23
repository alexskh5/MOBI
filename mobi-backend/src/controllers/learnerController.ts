// mobi-backend/src/controllers/learnerController.ts

import type {
  Request,
  Response,
} from "express";

import {
  enrollLearnerService,
} from "../services/learner/enrollmentService";

import {
  getLearnerProfile,
} from "../services/learner/learnerProfileService";

import {
  getLearnerList,
} from "../services/learner/learnerListService";
import {
  getAuthUserFromAccessToken,
} from "../services/authService";

async function getRequestCenterAuth(req: Request) {
  const authHeader =
    req.header("authorization") ?? "";

  const accessToken =
    authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

  if (!accessToken) {
    throw new Error("Please log in before using learner records.");
  }

  const authUser =
    await getAuthUserFromAccessToken(
      accessToken,
    );

  if (!authUser.centerId) {
    throw new Error("This account is not connected to a center.");
  }

  return authUser;
}
/* =========================================================
   ENROLL LEARNER CONTROLLER
========================================================= */

export const enrollLearner = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log(
      "Request body:",
      req.body,
    );

    console.log(
      "Uploaded files:",
      req.files,
    );

    /* =====================================================
       1. BASIC REQUEST VALIDATION
    ===================================================== */

    if (!req.body.payload) {
      return res.status(400).json({
        success: false,
        message:
          "Enrollment payload is required.",
      });
    }

    const payload =
      JSON.parse(req.body.payload);

    if (!payload.learner) {
      return res.status(400).json({
        success: false,
        message:
          "Learner information is required.",
      });
    }

    if (!payload.guardian) {
      return res.status(400).json({
        success: false,
        message:
          "Guardian information is required.",
      });
    }

    if (
      !payload.learnerIntakeProfile
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Learner intake profile is required.",
      });
    }

    /* =====================================================
       2. CENTER ID
    ===================================================== */

    const authUser =
      await getRequestCenterAuth(req);

    const CENTER_ID =
      authUser.centerId!;

    /* =====================================================
       3. CALL ENROLLMENT SERVICE
    ===================================================== */

    /* =====================================================
   FIND OPTIONAL LEARNER PROFILE PHOTO
===================================================== */

/*
  learnerRoutes.ts uses:

  upload.any()

  Therefore req.files is an array of Multer files.

  We specifically find the field sent by the frontend:

  profile_photo
*/
const uploadedFiles =
  req.files as
    | Express.Multer.File[]
    | undefined;

const profilePhoto =
  uploadedFiles?.find(
    (file) =>
      file.fieldname ===
      "profile_photo",
  ) ?? null;

    const result =
      await enrollLearnerService({
        payload,
        centerId:
          CENTER_ID,
        
          profilePhoto,
      });

    /* =====================================================
       4. SUCCESS RESPONSE
    ===================================================== */

    return res.status(201).json({
      success: true,

      message:
        "Learner enrollment saved successfully.",

      ...result,
    });
  } catch (error) {
    console.error(
      "Learner enrollment error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown enrollment error";

    return res.status(500).json({
      success: false,

      message:
        "Unable to enroll learner.",

      error:
        message,
    });
  }
};


/* =========================================================
   GET ONE LEARNER PROFILE
========================================================= */

export const getLearnerById = async (
  req: Request,
  res: Response,
) => {
  try {
    /* =====================================================
       1. GET AND VALIDATE LEARNER ID
    ===================================================== */

    /*
      Depending on the Express typings being used,
      route parameters may be typed as:

      string | string[]

      Our route expects exactly ONE learner UUID:

      GET /api/learners/:learnerId

      So we make sure it is actually a string before
      passing it to the learner profile service.
    */
    const learnerIdParam =
      req.params.learnerId;

    if (
      !learnerIdParam ||
      Array.isArray(learnerIdParam)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    /*
      After the check above, TypeScript now knows that
      learnerId is a string.
    */
    const learnerId: string =
      learnerIdParam;

    /* =====================================================
       2. CENTER ID
    ===================================================== */

    const authUser =
      await getRequestCenterAuth(req);

    const CENTER_ID =
      authUser.centerId!;

    /* =====================================================
       3. GET COMPLETE LEARNER PROFILE
    ===================================================== */

    const profile =
      await getLearnerProfile(
        learnerId,
        CENTER_ID,
      );

    /* =====================================================
       4. SUCCESS RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      learnerProfile:
        profile,
    });
  } catch (error) {
    console.error(
      "Get learner profile error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown learner profile error";

    return res.status(500).json({
      success: false,

      message:
        "Unable to fetch learner profile.",

      error:
        message,
    });
  }
};


/* =========================================================
   GET LEARNER LIST
========================================================= */

export const getLearners = async (
  req: Request,
  res: Response,
) => {
  try {
    /* =====================================================
       1. CENTER ID
    ===================================================== */

    const authUser =
      await getRequestCenterAuth(req);

    const CENTER_ID =
      authUser.centerId;

    /* =====================================================
       2. QUERY PARAMETERS
    ===================================================== */

    /*
      Express query parameters may not always be strings,
      so we safely normalize them before passing them to
      the service.
    */
    const page =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 10;

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : "";

    const sortByRaw =
      typeof req.query.sortBy === "string"
        ? req.query.sortBy
        : "created_at";

    const sortOrderRaw =
      typeof req.query.sortOrder === "string"
        ? req.query.sortOrder
        : "desc";

    /*
      Only allow known sortable columns.

      This prevents invalid column names from being passed
      into the Supabase query.
    */
    const allowedSortFields = [
      "last_name",
      "first_name",
      "birth_date",
      "created_at",
    ] as const;

    const sortBy =
      allowedSortFields.includes(
        sortByRaw as
          (typeof allowedSortFields)[number],
      )
        ? (
            sortByRaw as
              (typeof allowedSortFields)[number]
          )
        : "created_at";

    const sortOrder =
      sortOrderRaw === "asc"
        ? "asc"
        : "desc";

    /* =====================================================
       3. CALL SERVICE
    ===================================================== */

    const result =
      await getLearnerList(
        CENTER_ID,
        {
          page:
            Number.isFinite(page)
              ? page
              : 1,

          limit:
            Number.isFinite(limit)
              ? limit
              : 10,

          search,

          sortBy,

          sortOrder,

          actorId:
            authUser.actorId,

          actorRole:
            authUser.role,
        },
      );

    /* =====================================================
       4. RETURN RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      ...result,
    });
  } catch (error) {
    console.error(
      "Get learner list error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown learner list error";

    return res.status(500).json({
      success: false,

      message:
        "Unable to fetch learners.",

      error:
        message,
    });
  }
};

export const getLearnerDoctor = async (
  req: Request,
  res: Response,
) => {
  try {
    const learnerIdParam =
      req.params.learnerId;

    if (
      !learnerIdParam ||
      Array.isArray(learnerIdParam)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    const CENTER_ID =
      "d5ae1649-0343-46d4-b433-575c97e064e1";

    const result =
      await getLearnerDoctorService(
        learnerIdParam,
        CENTER_ID,
      );

    return res.status(200).json({
      success: true,
      doctorAssignment: result,
    });
  } catch (error) {
    console.error(
      "Get learner doctor error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch learner doctor.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};


/* =========================================================
   ASSIGN / CHANGE LEARNER DOCTOR

export const assignLearnerDoctor = async (
  req: Request,
  res: Response,
) => {
  try {
    const learnerIdParam =
      req.params.learnerId;

    if (
      !learnerIdParam ||
      Array.isArray(learnerIdParam)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    const doctorId =
      typeof req.body.doctorId ===
      "string"
        ? req.body.doctorId.trim()
        : "";

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor ID is required.",
      });
    }

    const CENTER_ID =
      "d5ae1649-0343-46d4-b433-575c97e064e1";

    const result =
      await assignLearnerDoctorService(
        learnerIdParam,
        doctorId,
        CENTER_ID,
      );

    return res.status(200).json({
      success: true,
      message:
        "Doctor assigned successfully.",
      ...result,
    });
  } catch (error) {
    console.error(
      "Assign learner doctor error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to assign doctor.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

/* =========================================================
   GET LEARNER COLLABORATION NOTES

export const getLearnerCollaborationNotes = async (
  req: Request,
  res: Response,
) => {
  try {
    const learnerId = req.params.learnerId;

    if (
      !learnerId ||
      Array.isArray(learnerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const CENTER_ID =
      "d5ae1649-0343-46d4-b433-575c97e064e1";

    const notes =
      await getLearnerCollaborationNotesService(
        learnerId,
        CENTER_ID,
      );

    return res.status(200).json({
      success: true,
      message: "Collaboration notes fetched successfully.",
      notes,
    });
  } catch (error) {
    console.error(
      "Get collaboration notes error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch collaboration notes.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};


/* =========================================================
   CREATE CENTER COLLABORATION NOTE

export const createLearnerCollaborationNote = async (
  req: Request,
  res: Response,
) => {
  try {
    const learnerId = req.params.learnerId;

    if (
      !learnerId ||
      Array.isArray(learnerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid learner ID is required.",
      });
    }

    const title =
      typeof req.body.title === "string"
        ? req.body.title
        : "";

    const content =
      typeof req.body.content === "string"
        ? req.body.content
        : "";

    const category =
      typeof req.body.category === "string"
        ? req.body.category
        : "MOBI Session";

    const CENTER_ID =
      "d5ae1649-0343-46d4-b433-575c97e064e1";

    const note =
      await createCenterCollaborationNoteService(
        learnerId,
        CENTER_ID,
        {
          title,
          content,
          category,
        },
      );

    return res.status(201).json({
      success: true,
      message: "Progress note added successfully.",
      note,
    });
  } catch (error) {
    console.error(
      "Create collaboration note error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to add progress note.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

/* =========================================================
   GET LEARNER THERAPISTS

export const getLearnerTherapists = async (
  req: Request,
  res: Response,
) => {
  try {
    const learnerId = req.params.learnerId;

    if (
      !learnerId ||
      Array.isArray(learnerId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    const CENTER_ID =
      "d5ae1649-0343-46d4-b433-575c97e064e1";

    const therapists =
      await getLearnerTherapistsService(
        learnerId,
        CENTER_ID,
      );

    return res.status(200).json({
      success: true,
      message:
        "Learner therapists fetched successfully.",
      therapists,
    });
  } catch (error) {
    console.error(
      "Get learner therapists error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch learner therapists.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};


/* =========================================================
   ASSIGN LEARNER THERAPISTS

export const assignLearnerTherapists = async (
  req: Request,
  res: Response,
) => {
  try {
    const learnerId = req.params.learnerId;

    if (
      !learnerId ||
      Array.isArray(learnerId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid learner ID is required.",
      });
    }

    const therapistIds =
      Array.isArray(
        req.body.therapistIds,
      )
        ? req.body.therapistIds.filter(
            (id: unknown) =>
              typeof id === "string" &&
              id.trim() !== "",
          )
        : [];

    const CENTER_ID =
      "d5ae1649-0343-46d4-b433-575c97e064e1";

    const therapists =
      await assignLearnerTherapistsService(
        learnerId,
        therapistIds,
        CENTER_ID,
      );

    return res.status(200).json({
      success: true,
      message:
        "Learner therapists updated successfully.",
      therapists,
    });
  } catch (error) {
    console.error(
      "Assign learner therapists error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update learner therapists.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};
