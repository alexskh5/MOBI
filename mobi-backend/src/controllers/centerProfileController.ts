import type { Request, Response } from "express";
import { getRequestCenterId } from "../middleware/centerContext";
import {
  getCenterProfile,
  updateCenterProfile,
} from "../services/center/centerProfileService";

export async function getCurrentCenterProfile(req: Request, res: Response) {
  try {
    const profile = await getCenterProfile(getRequestCenterId(req)!);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load center profile.",
    });
  }
}

export async function patchCurrentCenterProfile(req: Request, res: Response) {
  try {
    const profile = await updateCenterProfile(
      getRequestCenterId(req)!,
      req.body ?? {},
    );

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update center profile.",
    });
  }
}
