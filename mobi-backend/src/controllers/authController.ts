import type {
  Request,
  Response,
} from "express";
import {
  loginWithSupabasePassword,
} from "../services/authService";
import type {
  LoginSurface,
} from "../services/authService";

const VALID_SURFACES = new Set<LoginSurface>([
  "web",
  "mobile",
]);

export async function login(req: Request, res: Response) {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email
        : "";

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    const surface =
      typeof req.body?.surface === "string" &&
      VALID_SURFACES.has(req.body.surface as LoginSurface)
        ? (req.body.surface as LoginSurface)
        : "web";

    const user = await loginWithSupabasePassword({
      email,
      password,
      surface,
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to log in.",
    });
  }
}
