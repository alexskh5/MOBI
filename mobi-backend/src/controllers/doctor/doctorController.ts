import type {
  Request,
  Response,
} from "express";

import { supabase } from "../../config/supabase";

import {
  createDoctorService,
  deleteDoctorService,
  getDoctorByIdService,
  getDoctorsService,
  resetDoctorAuthLinkService,
  updateDoctorService,
} from "../../services/doctor/doctorService";

import {
  deleteDoctorAuthUserIfPresent,
  findAuthUserByEmail,
  sendDoctorAccessCodeService,
  StaffAuthError,
} from "../../services/auth/staffAuthService";

import {
  getDoctorPatientsService,
} from "../../services/doctor/doctorPatientService";

/* =========================================================
   TEMPORARY CENTER ID
========================================================= */

/*
  Same temporary approach as learnerController.ts.
  Later this comes from the authenticated Center account.
*/
const CENTER_ID =
  "d5ae1649-0343-46d4-b433-575c97e064e1";

/* =========================================================
   HELPERS
========================================================= */

function optionalText(
  value: unknown,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed || null;
}

function readDoctorInput(
  body: any,
) {
  return {
    firstName:
      typeof body.firstName ===
      "string"
        ? body.firstName.trim()
        : "",

    middleName:
      optionalText(
        body.middleName,
      ),

    lastName:
      typeof body.lastName ===
      "string"
        ? body.lastName.trim()
        : "",

    email:
      typeof body.email ===
      "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "",

    specialization:
      optionalText(
        body.specialization,
      ),

    phoneNumber:
      optionalText(
        body.phoneNumber,
      ),

    bio:
      optionalText(
        body.bio,
      ),
  };
}

function validateDoctorInput(
  input: ReturnType<
    typeof readDoctorInput
  >,
) {
  if (!input.firstName) {
    return "First name is required.";
  }

  if (!input.lastName) {
    return "Last name is required.";
  }

  if (!input.email) {
    return "Email address is required.";
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailPattern.test(
      input.email,
    )
  ) {
    return "Please enter a valid email address.";
  }

  return null;
}

function errorResponse(
  res: Response,
  error: unknown,
  fallbackMessage: string,
) {
  if (
    error instanceof
    StaffAuthError
  ) {
    return res
      .status(
        error.statusCode,
      )
      .json({
        success: false,
        message:
          error.message,
      });
  }

  const message =
    error instanceof Error
      ? error.message
      : fallbackMessage;

  return res
    .status(500)
    .json({
      success: false,
      message:
        fallbackMessage,
      error:
        message,
    });
}

/* =========================================================
   CREATE DOCTOR + SEND FIRST ACCESS CODE
========================================================= */

export const createDoctor =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const input =
        readDoctorInput(
          req.body,
        );

      const validationError =
        validateDoctorInput(
          input,
        );

      if (
        validationError
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              validationError,
          });
      }

      const doctor =
        await createDoctorService(
          CENTER_ID,
          input,
        );

      /*
        Account creation should still succeed if email delivery fails.
        The new row stays "not_invited", appears in the list,
        and the Center can press Send Invitation / Resend Access Code.
      */
      try {
        const invitation =
          await sendDoctorAccessCodeService({
            doctorId:
              doctor.id,

            centerId:
              CENTER_ID,

            allowCreateUser:
              true,
          });

        return res
          .status(201)
          .json({
            success: true,
            message:
              "Doctor added and access code sent successfully.",
            doctor:
              invitation.doctor,
            invitation: {
              sent: true,
              sentAt:
                invitation.sentAt,
            },
          });
      } catch (
        invitationError
      ) {
        console.error(
          "Doctor created but invitation failed:",
          invitationError,
        );

        return res
          .status(201)
          .json({
            success: true,
            message:
              "Doctor added, but the access email could not be sent. Use Send Invitation from the doctor list.",
            doctor,
            invitation: {
              sent: false,
              error:
                invitationError instanceof Error
                  ? invitationError.message
                  : "Unable to send access code.",
            },
          });
      }
    } catch (error) {
      console.error(
        "Create doctor error:",
        error,
      );

      return errorResponse(
        res,
        error,
        "Unable to add doctor.",
      );
    }
  };

/* =========================================================
   GET DOCTOR LIST
========================================================= */

export const getDoctors =
  async (
    _req: Request,
    res: Response,
  ) => {
    try {
      const doctors =
        await getDoctorsService(
          CENTER_ID,
        );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Doctors fetched successfully.",
          doctors,
        });
    } catch (error) {
      console.error(
        "Get doctors error:",
        error,
      );

      return errorResponse(
        res,
        error,
        "Unable to fetch doctors.",
      );
    }
  };

/* =========================================================
   GET DOCTOR PATIENTS
========================================================= */

export const getDoctorPatients =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const doctorId =
        req.params.doctorId;

      if (
        !doctorId ||
        Array.isArray(doctorId)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid doctor ID is required.",
          });
      }

      const patients =
        await getDoctorPatientsService(
          doctorId,
          CENTER_ID,
        );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Doctor patients fetched successfully.",
          patients,
        });
    } catch (error) {
      console.error(
        "Get doctor patients error:",
        error,
      );

      return errorResponse(
        res,
        error,
        "Unable to fetch doctor patients.",
      );
    }
  };

/* =========================================================
   GET ONE DOCTOR
========================================================= */

export const getDoctorById =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const doctorId =
        req.params.doctorId;

      if (
        !doctorId ||
        Array.isArray(
          doctorId,
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid doctor ID is required.",
          });
      }

      const doctor =
        await getDoctorByIdService(
          doctorId,
          CENTER_ID,
        );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Doctor fetched successfully.",
          doctor,
        });
    } catch (error) {
      console.error(
        "Get doctor error:",
        error,
      );

      return errorResponse(
        res,
        error,
        "Unable to fetch doctor.",
      );
    }
  };

/* =========================================================
   UPDATE DOCTOR
========================================================= */

export const updateDoctor =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const doctorId =
        req.params.doctorId;

      if (
        !doctorId ||
        Array.isArray(
          doctorId,
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid doctor ID is required.",
          });
      }

      const existingDoctor =
        await getDoctorByIdService(
          doctorId,
          CENTER_ID,
        );

      const input =
        readDoctorInput(
          req.body,
        );

      const validationError =
        validateDoctorInput(
          input,
        );

      if (
        validationError
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              validationError,
          });
      }

      const emailChanged =
        existingDoctor.email
          .toLowerCase() !==
        input.email.toLowerCase();

      if (
        emailChanged &&
        existingDoctor.account_status !==
          "not_invited"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email cannot be changed after an invitation has been sent. Remove and recreate the account if the email address is incorrect.",
          });
      }

      /*
        If invitation previously failed but an Auth user was still created,
        changing the email should remove that unused Auth identity first.
      */
      if (
        emailChanged &&
        existingDoctor.account_status ===
          "not_invited"
      ) {
        const oldAuthUser =
          existingDoctor.auth_user_id
            ? {
                id:
                  existingDoctor.auth_user_id,
              }
            : await findAuthUserByEmail(
                existingDoctor.email,
              );

        if (
          oldAuthUser?.id
        ) {
          const {
            error:
              deleteAuthError,
          } =
            await supabase.auth.admin.deleteUser(
              oldAuthUser.id,
            );

          if (
            deleteAuthError
          ) {
            throw new StaffAuthError(
              `Unable to reset the previous login email: ${deleteAuthError.message}`,
              500,
            );
          }
        }

        await resetDoctorAuthLinkService(
          doctorId,
          CENTER_ID,
        );
      }

      const doctor =
        await updateDoctorService(
          doctorId,
          CENTER_ID,
          input,
        );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Doctor updated successfully.",
          doctor,
        });
    } catch (error) {
      console.error(
        "Update doctor error:",
        error,
      );

      return errorResponse(
        res,
        error,
        "Unable to update doctor.",
      );
    }
  };

/* =========================================================
   SEND / RESEND ACCESS CODE
========================================================= */

export const sendDoctorAccessCode =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const doctorId =
        req.params.doctorId;

      if (
        !doctorId ||
        Array.isArray(
          doctorId,
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid doctor ID is required.",
          });
      }

      const doctor =
        await getDoctorByIdService(
          doctorId,
          CENTER_ID,
        );

      const existingAuthUser =
        doctor.auth_user_id
          ? true
          : Boolean(
              await findAuthUserByEmail(
                doctor.email,
              ),
            );

      const result =
        await sendDoctorAccessCodeService({
          doctorId,
          centerId:
            CENTER_ID,
          allowCreateUser:
            !existingAuthUser,
        });

      return res
        .status(200)
        .json({
          success: true,
          message:
            doctor.account_status ===
            "not_invited"
              ? "Invitation sent successfully."
              : "A new access code was sent successfully.",
          doctor:
            result.doctor,
          sentAt:
            result.sentAt,
        });
    } catch (error) {
      console.error(
        "Send doctor access code error:",
        error,
      );

      return errorResponse(
        res,
        error,
        "Unable to send access code.",
      );
    }
  };

/* =========================================================
   REMOVE DOCTOR
========================================================= */

export const deleteDoctor =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const doctorId =
        req.params.doctorId;

      if (
        !doctorId ||
        Array.isArray(
          doctorId,
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A valid doctor ID is required.",
          });
      }

      const removedDoctor =
        await deleteDoctorService(
          doctorId,
          CENTER_ID,
        );

      const authCleanup =
        await deleteDoctorAuthUserIfPresent(
          removedDoctor,
        );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Doctor removed successfully.",
          authCleanup,
        });
    } catch (error) {
      console.error(
        "Delete doctor error:",
        error,
      );

      return errorResponse(
        res,
        error,
        "Unable to remove doctor.",
      );
    }
  };
