import type { Request, Response } from "express";
import {
  cancelCenterSchedule,
  listCenterSchedules,
  listTherapistSchedules,
  respondToTherapistSchedule,
  upsertCenterSchedule,
} from "../services/scheduleService";
import { getAuthUserFromAccessToken } from "../services/authService";

async function getVerifiedActor(req: Request) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    throw new Error("A valid login session is required.");
  }

  const user = await getAuthUserFromAccessToken(token);

  if (!user.centerId) {
    throw new Error("This account is not linked to a center.");
  }

  return user;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown schedule error.";
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

export async function getSchedules(req: Request, res: Response) {
  try {
    const actor = await getVerifiedActor(req);

    if (actor.role !== "center_admin" && actor.role !== "therapist") {
      return res.status(403).json({
        message: "Only center admins and therapists can view schedules.",
      });
    }

    const schedules =
      actor.role === "therapist"
        ? await listTherapistSchedules({
            centerId: actor.centerId!,
            therapistId: actor.actorId,
          })
        : await listCenterSchedules({ centerId: actor.centerId! });

    return res.status(200).json({ schedules });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load schedules.",
      error: errorMessage(error),
    });
  }
}

export async function postSchedule(req: Request, res: Response) {
  try {
    const actor = await getVerifiedActor(req);

    if (actor.role !== "center_admin") {
      return res.status(403).json({
        message: "Only center admins can create schedules.",
      });
    }

    const schedule = await upsertCenterSchedule({
      centerId: actor.centerId!,
      actorId: actor.actorId,
      payload: req.body,
    });

    return res.status(201).json({ schedule });
  } catch (error) {
    return res.status(400).json({
      message: "Unable to save schedule.",
      error: errorMessage(error),
    });
  }
}

export async function patchSchedule(req: Request, res: Response) {
  try {
    const actor = await getVerifiedActor(req);

    if (actor.role !== "center_admin") {
      return res.status(403).json({
        message: "Only center admins can edit schedules.",
      });
    }

    const schedule = await upsertCenterSchedule({
      centerId: actor.centerId!,
      actorId: actor.actorId,
      scheduleId: stringParam(req.params.scheduleId),
      payload: req.body,
    });

    return res.status(200).json({ schedule });
  } catch (error) {
    return res.status(400).json({
      message: "Unable to update schedule.",
      error: errorMessage(error),
    });
  }
}

export async function deleteSchedule(req: Request, res: Response) {
  try {
    const actor = await getVerifiedActor(req);

    if (actor.role !== "center_admin") {
      return res.status(403).json({
        message: "Only center admins can cancel schedules.",
      });
    }

    const schedule = await cancelCenterSchedule({
      centerId: actor.centerId!,
      scheduleId: stringParam(req.params.scheduleId),
    });

    return res.status(200).json({ schedule });
  } catch (error) {
    return res.status(400).json({
      message: "Unable to cancel schedule.",
      error: errorMessage(error),
    });
  }
}

export async function respondToSchedule(req: Request, res: Response) {
  try {
    const actor = await getVerifiedActor(req);

    if (actor.role !== "therapist") {
      return res.status(403).json({
        message: "Only therapists can respond to schedules.",
      });
    }

    const action = String(req.params.action ?? "");
    const statusByAction = {
      approve: "confirmed",
      "request-edit": "edit_requested",
      decline: "declined",
    } as const;
    const status =
      statusByAction[action as keyof typeof statusByAction];

    if (!status) {
      return res.status(400).json({ message: "Unsupported schedule action." });
    }

    const schedule = await respondToTherapistSchedule({
      centerId: actor.centerId!,
      therapistId: actor.actorId,
      scheduleId: stringParam(req.params.scheduleId),
      status,
      note:
        typeof req.body?.note === "string"
          ? req.body.note.trim()
          : "",
    });

    return res.status(200).json({ schedule });
  } catch (error) {
    return res.status(400).json({
      message: "Unable to respond to schedule.",
      error: errorMessage(error),
    });
  }
}
