import { Request, Response } from "express";
import { getAuthUserFromAccessToken } from "../../services/authService";
import {
  getSuperAdminDashboardData,
  getCenterAccount,
  getCenterAccounts,
  updateCenterAccountStatus,
  getParentAccounts,
  getSubscriptionPlans,
  getSystemNotifications,
  createCenterInvitation,
  getCenterInvitationByCode,
  completeCenterInvitation,
  createSystemNotification,
  updateSystemNotification,
  deleteSystemNotification,
} from "../../services/super_admin/superAdmin.service";

type ReceiverType = "Center" | "Parents" | "Doctor" | "Therapist" | "All";

type NotificationParams = {
  notificationId: string;
};

const allowedReceivers: ReceiverType[] = [
  "Center",
  "Parents",
  "Doctor",
  "Therapist",
  "All",
];

async function requireSuperAdmin(req: Request) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  if (!token) {
    throw new Error("A valid super admin login is required.");
  }

  const user = await getAuthUserFromAccessToken(token);

  if (user.role !== "super_admin") {
    throw new Error("Only super admins can perform this action.");
  }

  return user;
}

function validateReceivers(receivers: unknown) {
  if (!Array.isArray(receivers) || receivers.length === 0) {
    return "Please select at least one receiver.";
  }

  const hasInvalidReceiver = receivers.some(
    (receiver) => !allowedReceivers.includes(receiver as ReceiverType)
  );

  if (hasInvalidReceiver) {
    return "Invalid receiver selected.";
  }

  return "";
}

function normalizeReceivers(receivers: unknown): ReceiverType[] {
  if (!Array.isArray(receivers)) {
    return [];
  }

  const uniqueReceivers = Array.from(new Set(receivers)) as ReceiverType[];

  if (uniqueReceivers.includes("All")) {
    return ["All"];
  }

  return uniqueReceivers;
}

export async function getDashboardController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await getSuperAdminDashboardData();

    res.status(200).json({
      success: true,
      message: "Super admin dashboard data fetched successfully.",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard data.",
    });
  }
}

export async function getCenterAccountController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await getCenterAccount();

    res.status(200).json({
      success: true,
      message: "Center account fetched successfully.",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch center account.",
    });
  }
}

export async function getCenterAccountsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await requireSuperAdmin(req);

    const data = await getCenterAccounts();

    res.status(200).json({
      success: true,
      message: "Center accounts fetched successfully.",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch center accounts.",
    });
  }
}

export async function updateCenterAccountStatusController(
  req: Request<{ centerId: string }>,
  res: Response
): Promise<void> {
  try {
    await requireSuperAdmin(req);

    const status = req.body?.status === "active" ? "active" : "suspended";

    const data = await updateCenterAccountStatus({
      centerId: req.params.centerId,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Center account status updated successfully.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update center account.",
    });
  }
}

export async function getParentAccountsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await getParentAccounts();

    res.status(200).json({
      success: true,
      message: "Parent accounts fetched successfully.",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch parent accounts.",
    });
  }
}

export async function createCenterInvitationController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await requireSuperAdmin(req);

    const data = await createCenterInvitation(req.body);

    res.status(201).json({
      success: true,
      message: "Center invitation created successfully.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create center invitation.",
    });
  }
}

export async function getCenterInvitationController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const magicCode =
      typeof req.query.code === "string"
        ? req.query.code
        : "";

    const data = await getCenterInvitationByCode(magicCode);

    res.status(200).json({
      success: true,
      message: "Center invitation fetched successfully.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch center invitation.",
    });
  }
}

export async function completeCenterInvitationController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await completeCenterInvitation(req.body);

    res.status(201).json({
      success: true,
      message: "Center account created successfully.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to complete center invitation.",
    });
  }
}

export async function getSubscriptionPlansController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await getSubscriptionPlans();

    res.status(200).json({
      success: true,
      message: "Subscription plans fetched successfully.",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subscription plans.",
    });
  }
}

export async function getSystemNotificationsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await getSystemNotifications();

    res.status(200).json({
      success: true,
      message: "System notifications fetched successfully.",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch system notifications.",
    });
  }
}

export async function createSystemNotificationController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { receivers, message } = req.body;

    const receiverError = validateReceivers(receivers);

    if (receiverError) {
      res.status(400).json({
        success: false,
        message: receiverError,
      });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({
        success: false,
        message: "Notification message is required.",
      });
      return;
    }

    const data = await createSystemNotification({
      receivers: normalizeReceivers(receivers),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: "System notification created successfully.",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create system notification.",
    });
  }
}

export async function updateSystemNotificationController(
  req: Request<NotificationParams>,
  res: Response
): Promise<void> {
  try {
    const notificationId = req.params.notificationId;
    const { receivers, message } = req.body;

    if (!notificationId) {
      res.status(400).json({
        success: false,
        message: "Notification ID is required.",
      });
      return;
    }

    const receiverError = validateReceivers(receivers);

    if (receiverError) {
      res.status(400).json({
        success: false,
        message: receiverError,
      });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({
        success: false,
        message: "Notification message is required.",
      });
      return;
    }

    const data = await updateSystemNotification(notificationId, {
      receivers: normalizeReceivers(receivers),
      message: message.trim(),
    });

    res.status(200).json({
      success: true,
      message: "System notification updated successfully.",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update system notification.",
    });
  }
}

export async function deleteSystemNotificationController(
  req: Request<NotificationParams>,
  res: Response
): Promise<void> {
  try {
    const notificationId = req.params.notificationId;

    if (!notificationId) {
      res.status(400).json({
        success: false,
        message: "Notification ID is required.",
      });
      return;
    }

    const data = await deleteSystemNotification(notificationId);

    res.status(200).json({
      success: true,
      message: "System notification deleted successfully.",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete system notification.",
    });
  }
}
