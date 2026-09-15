import type {
  NextFunction,
  Request,
  Response,
} from "express";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getRequestCenterId(req: Request) {
  const value = req.header("x-center-id")?.trim() ?? "";
  return UUID_PATTERN.test(value) ? value : null;
}

export function getOptionalActorContext(req: Request) {
  const actorId = req.header("x-actor-id")?.trim() ?? "";
  const actorRole =
    req.header("x-actor-role")?.trim().toLowerCase() ?? "";

  if (!actorId || !actorRole) {
    return null;
  }

  return {
    actorId,
    actorRole,
  };
}

export function requireCenterContext(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!getRequestCenterId(req)) {
    return res.status(400).json({
      success: false,
      message:
        "A valid x-center-id request header is required.",
    });
  }

  return next();
}
