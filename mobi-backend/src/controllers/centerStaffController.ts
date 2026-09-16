import type {
  Request,
  Response,
} from "express";

import {
  getRequestCenterId,
} from "../middleware/centerContext";
import {
  createCenterStaff,
  deactivateCenterStaff,
  listCenterStaff,
  updateCenterStaff,
  type CenterStaffRole,
} from "../services/center/staffManagementService";
import {
  listLearnersForDoctor,
  listLearnersForTherapistAssignment,
  replaceTherapistLearnerAssignments,
} from "../services/center/therapistLearnerAssignmentService";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unknown staff management error.";
}

function roleFromParam(req: Request): CenterStaffRole | null {
  const role = String(req.params.role ?? "").toLowerCase();

  if (role === "therapist" || role === "doctor") {
    return role;
  }

  return null;
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function requireCenterAdmin(req: Request, res: Response) {
  const actorId = req.header("x-actor-id")?.trim() ?? "";
  const actorRole =
    req.header("x-actor-role")?.trim().toLowerCase() ?? "";

  if (
    actorRole !== "center_admin" ||
    !UUID_PATTERN.test(actorId)
  ) {
    res.status(403).json({
      success: false,
      message:
        "Only center administrators can manage center staff accounts.",
    });
    return false;
  }

  return true;
}

export async function getCenterStaff(
  req: Request,
  res: Response,
) {
  try {
    if (!requireCenterAdmin(req, res)) {
      return;
    }

    const role = roleFromParam(req);

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Staff role must be therapist or doctor.",
      });
    }

    const staff = await listCenterStaff({
      centerId: getRequestCenterId(req)!,
      role,
    });

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load center staff.",
      error: errorMessage(error),
    });
  }
}

export async function postCenterStaff(
  req: Request,
  res: Response,
) {
  try {
    if (!requireCenterAdmin(req, res)) {
      return;
    }

    const role = roleFromParam(req);

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Staff role must be therapist or doctor.",
      });
    }

    const staff = await createCenterStaff({
      centerId: getRequestCenterId(req)!,
      role,
      payload: req.body,
    });

    return res.status(201).json({
      success: true,
      staff,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to create center staff account.",
      error: errorMessage(error),
    });
  }
}

export async function patchCenterStaff(
  req: Request,
  res: Response,
) {
  try {
    if (!requireCenterAdmin(req, res)) {
      return;
    }

    const role = roleFromParam(req);
    const staffId = stringParam(req.params.staffId);

    if (!role || !UUID_PATTERN.test(staffId)) {
      return res.status(400).json({
        success: false,
        message:
          "A valid staff role and staff ID are required.",
      });
    }

    const staff = await updateCenterStaff({
      centerId: getRequestCenterId(req)!,
      role,
      staffId,
      payload: req.body,
    });

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to update center staff account.",
      error: errorMessage(error),
    });
  }
}

export async function deleteCenterStaff(
  req: Request,
  res: Response,
) {
  try {
    if (!requireCenterAdmin(req, res)) {
      return;
    }

    const role = roleFromParam(req);
    const staffId = stringParam(req.params.staffId);

    if (!role || !UUID_PATTERN.test(staffId)) {
      return res.status(400).json({
        success: false,
        message:
          "A valid staff role and staff ID are required.",
      });
    }

    const staff = await deactivateCenterStaff({
      centerId: getRequestCenterId(req)!,
      role,
      staffId,
    });

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Unable to deactivate center staff account.",
      error: errorMessage(error),
    });
  }
}

export async function getTherapistLearners(
  req: Request,
  res: Response,
) {
  try {
    if (!requireCenterAdmin(req, res)) {
      return;
    }

    const therapistId = stringParam(req.params.therapistId);

    if (!UUID_PATTERN.test(therapistId)) {
      return res.status(400).json({
        success: false,
        message: "A valid therapist ID is required.",
      });
    }

    const result =
      await listLearnersForTherapistAssignment({
        centerId: getRequestCenterId(req)!,
        therapistId,
      });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to load therapist learner assignments.",
      error: errorMessage(error),
    });
  }
}

export async function putTherapistLearners(
  req: Request,
  res: Response,
) {
  try {
    if (!requireCenterAdmin(req, res)) {
      return;
    }

    const therapistId = stringParam(req.params.therapistId);

    if (!UUID_PATTERN.test(therapistId)) {
      return res.status(400).json({
        success: false,
        message: "A valid therapist ID is required.",
      });
    }

    const learnerIds = Array.isArray(req.body?.learnerIds)
      ? req.body.learnerIds.filter(
          (value: unknown): value is string =>
            typeof value === "string" &&
            UUID_PATTERN.test(value),
        )
      : [];

    const result =
      await replaceTherapistLearnerAssignments({
        centerId: getRequestCenterId(req)!,
        therapistId,
        learnerIds,
      });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        "Unable to save therapist learner assignments.",
      error: errorMessage(error),
    });
  }
}

export async function getDoctorLearners(
  req: Request,
  res: Response,
) {
  try {
    if (!requireCenterAdmin(req, res)) {
      return;
    }

    const doctorId = stringParam(req.params.doctorId);

    if (!UUID_PATTERN.test(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "A valid doctor ID is required.",
      });
    }

    const result = await listLearnersForDoctor({
      centerId: getRequestCenterId(req)!,
      doctorId,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load doctor learners.",
      error: errorMessage(error),
    });
  }
}
