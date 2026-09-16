import type {
  Request,
  Response,
} from "express";

import {
  createTherapistService,
  deleteTherapistService,
  getTherapistByIdService,
  getTherapistsService,
  updateTherapistService,
} from "../../services/therapist/therapistService";

import {
  findAuthUserByEmail,
  sendTherapistAccessCodeService,
  StaffAuthError,
} from "../../services/auth/staffAuthService";

import {
  getTherapistLearnersService,
} from "../../services/therapist/therapistLearnerService";


import {
  createTherapistCollaborationNoteService,
} from "../../services/collaboration/collaborationNoteService";

/* =========================================================
   TEMPORARY CENTER ID
========================================================= */

const CENTER_ID =
  "d5ae1649-0343-46d4-b433-575c97e064e1";


/* =========================================================
   HELPERS
========================================================= */

function optionalText(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}


function respondWithAuthError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof StaffAuthError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error:
      error instanceof Error
        ? error.message
        : fallbackMessage,
  });
}


/* =========================================================
   CREATE THERAPIST
========================================================= */

export const createTherapist = async (
  req: Request,
  res: Response,
) => {
  try {
    const firstName =
      typeof req.body.firstName === "string"
        ? req.body.firstName.trim()
        : "";

    const middleName =
      optionalText(req.body.middleName);

    const lastName =
      typeof req.body.lastName === "string"
        ? req.body.lastName.trim()
        : "";

    const email =
      typeof req.body.email === "string"
        ? req.body.email
            .trim()
            .toLowerCase()
        : "";

    const specialization =
      optionalText(
        req.body.specialization,
      );

    const phoneNumber =
      optionalText(
        req.body.phoneNumber,
      );

    const bio =
      optionalText(req.body.bio);

    if (!firstName) {
      return res.status(400).json({
        success: false,
        message:
          "First name is required.",
      });
    }

    if (!lastName) {
      return res.status(400).json({
        success: false,
        message:
          "Last name is required.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required.",
      });
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    const therapist =
      await createTherapistService(
        CENTER_ID,
        {
          firstName,
          middleName,
          lastName,
          email,
          specialization,
          phoneNumber,
          bio,
        },
      );

    return res.status(201).json({
      success: true,
      message:
        "Therapist added successfully.",
      therapist,
    });
  } catch (error) {
    console.error(
      "Create therapist error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add therapist.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};


/* =========================================================
   GET THERAPIST LIST
========================================================= */

export const getTherapists = async (
  _req: Request,
  res: Response,
) => {
  try {
    const therapists =
      await getTherapistsService(
        CENTER_ID,
      );

    return res.status(200).json({
      success: true,
      message:
        "Therapists fetched successfully.",
      therapists,
    });
  } catch (error) {
    console.error(
      "Get therapists error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch therapists.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};



/* =========================================================
   GET THERAPIST'S CURRENT LEARNERS
========================================================= */

export const getTherapistLearners = async (
  req: Request,
  res: Response,
) => {
  try {
    const therapistId =
      req.params.therapistId;

    if (
      !therapistId ||
      Array.isArray(
        therapistId,
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "A valid therapist ID is required.",
        });
    }

    const learners =
      await getTherapistLearnersService(
        therapistId,
        CENTER_ID,
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Therapist learners fetched successfully.",
        learners,
      });
  } catch (error) {
    console.error(
      "Get therapist learners error:",
      error,
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to fetch therapist learners.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
  }
};



/* =========================================================
   ADD COLLABORATION NOTE FOR AN ASSIGNED LEARNER
========================================================= */

export const createTherapistLearnerCollaborationNote =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const therapistId =
        req.params.therapistId;

      const learnerId =
        req.params.learnerId;

      if (
        !therapistId ||
        Array.isArray(
          therapistId,
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid therapist ID is required.",
          });
      }

      if (
        !learnerId ||
        Array.isArray(
          learnerId,
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid learner ID is required.",
          });
      }

      const title =
        typeof req.body.title ===
        "string"
          ? req.body.title
          : "";

      const content =
        typeof req.body.content ===
        "string"
          ? req.body.content
          : "";

      const category =
        typeof req.body.category ===
        "string"
          ? req.body.category
          : "Therapy Session";

      if (!content.trim()) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Progress note content is required.",
          });
      }

      const note =
        await createTherapistCollaborationNoteService(
          learnerId,
          CENTER_ID,
          therapistId,
          {
            title,
            content,
            category,
          },
        );

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Therapist collaboration note added successfully.",
          note,
        });
    } catch (error) {
      console.error(
        "Create Therapist collaboration note error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unknown error";

      const status =
        message.includes(
          "only add collaboration notes",
        )
          ? 403
          : message.includes(
              "not found",
            )
            ? 404
            : 500;

      return res
        .status(status)
        .json({
          success: false,
          message,
        });
    }
  };

/* =========================================================
   GET ONE THERAPIST
========================================================= */

export const getTherapistById = async (
  req: Request,
  res: Response,
) => {
  try {
    const therapistId =
      req.params.therapistId;

    if (
      !therapistId ||
      Array.isArray(therapistId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid therapist ID is required.",
      });
    }

    const therapist =
      await getTherapistByIdService(
        therapistId,
        CENTER_ID,
      );

    return res.status(200).json({
      success: true,
      message:
        "Therapist fetched successfully.",
      therapist,
    });
  } catch (error) {
    console.error(
      "Get therapist error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch therapist.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

/* =========================================================
   UPDATE THERAPIST
========================================================= */

export const updateTherapist = async (
  req: Request,
  res: Response,
) => {
  try {
    const therapistId =
      req.params.therapistId;

    if (
      !therapistId ||
      Array.isArray(therapistId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid therapist ID is required.",
      });
    }

    const firstName =
      typeof req.body.firstName === "string"
        ? req.body.firstName.trim()
        : "";

    const middleName =
      optionalText(req.body.middleName);

    const lastName =
      typeof req.body.lastName === "string"
        ? req.body.lastName.trim()
        : "";

    const email =
      typeof req.body.email === "string"
        ? req.body.email
            .trim()
            .toLowerCase()
        : "";

    const specialization =
      optionalText(
        req.body.specialization,
      );

    const phoneNumber =
      optionalText(
        req.body.phoneNumber,
      );

    const bio =
      optionalText(req.body.bio);

    if (
      !firstName ||
      !lastName ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, and email are required.",
      });
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    const therapist =
      await updateTherapistService(
        therapistId,
        CENTER_ID,
        {
          firstName,
          middleName,
          lastName,
          email,
          specialization,
          phoneNumber,
          bio,
        },
      );

    return res.status(200).json({
      success: true,
      message:
        "Therapist updated successfully.",
      therapist,
    });
  } catch (error) {
    console.error(
      "Update therapist error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update therapist.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};



/* =========================================================
   SEND / RESEND THERAPIST ACCESS CODE
========================================================= */

export const sendTherapistAccessCode = async (
  req: Request,
  res: Response,
) => {
  try {
    const therapistId =
      req.params.therapistId;

    if (
      !therapistId ||
      Array.isArray(therapistId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid therapist ID is required.",
      });
    }

    const therapist =
      await getTherapistByIdService(
        therapistId,
        CENTER_ID,
      );

    const existingAuthUser =
      therapist.auth_user_id
        ? true
        : Boolean(
            await findAuthUserByEmail(
              therapist.email,
            ),
          );

    const result =
      await sendTherapistAccessCodeService({
        therapistId,
        centerId: CENTER_ID,
        allowCreateUser:
          !existingAuthUser,
      });

    return res.status(200).json({
      success: true,
      message:
        therapist.account_status ===
        "not_invited"
          ? "Therapist invitation sent successfully."
          : "A new therapist access code was sent successfully.",
      therapist:
        result.therapist,
      sentAt:
        result.sentAt,
    });
  } catch (error) {
    console.error(
      "Send therapist access code error:",
      error,
    );

    return respondWithAuthError(
      res,
      error,
      "Unable to send therapist access code.",
    );
  }
};


/* =========================================================
   DELETE THERAPIST
========================================================= */

export const deleteTherapist = async (
  req: Request,
  res: Response,
) => {
  try {
    const therapistId =
      req.params.therapistId;

    if (
      !therapistId ||
      Array.isArray(therapistId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid therapist ID is required.",
      });
    }

    const therapist =
      await deleteTherapistService(
        therapistId,
        CENTER_ID,
      );

    return res.status(200).json({
      success: true,
      message:
        "Therapist removed successfully.",
      therapist,
    });
  } catch (error) {
    console.error(
      "Delete therapist error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove therapist.",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};