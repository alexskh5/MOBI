//mobi-backend/src/controllers/activityController.ts

import { Request, Response } from "express";
import {
  createActivityWithSteps,
  getActivities,
  getActivityById,
} from "../services/activityService";

export async function createActivity(
  req: Request,
  res: Response,
) {
  try {
    /*
      TEMPORARY CENTER ID

      Later this should come from the authenticated
      Center Admin or Therapist account.

      For now, we use the same AMTC center ID used
      in your learner backend.
    */
    const CENTER_ID =
      "d5ae1649-0343-46d4-b433-575c97e064e1";

    /*
      The frontend should not decide which center owns
      the activity.

      The backend attaches center_id here so the activity
      can later be safely matched with learner assignments.
    */
    const activity =
      await createActivityWithSteps({
        ...req.body,

        center_id:
          CENTER_ID,
      });

    return res.status(201).json({
      message:
        "Activity created successfully",

      activity,
    });
  } catch (error: any) {
    console.error(
      "Create activity error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to create activity",

      error:
        error.message,
    });
  }
}

export async function listActivities(_req: Request, res: Response) {
  try {
    const activities = await getActivities();
    res.status(200).json(activities);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
}

export async function readActivity(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const activity = await getActivityById(id);
    res.status(200).json(activity);
  } catch (error: any) {
    res.status(404).json({
      message: "Activity not found",
      error: error.message,
    });
  }
}