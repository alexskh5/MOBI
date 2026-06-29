// src/controllers/activityController.ts

import { Request, Response } from "express";
import {
  createActivityWithSteps,
  getActivities,
  getActivityById,
} from "../services/activityService";

export async function createActivity(req: Request, res: Response) {
  try {
    const activity = await createActivityWithSteps(req.body);

    res.status(201).json({
      message: "Activity created successfully",
      activity,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create activity",
      error: error.message,
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
    const activity = await getActivityById(req.params.id);
    res.status(200).json(activity);
  } catch (error: any) {
    res.status(404).json({
      message: "Activity not found",
      error: error.message,
    });
  }
}