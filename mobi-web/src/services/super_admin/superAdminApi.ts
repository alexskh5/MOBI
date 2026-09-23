import { api } from "../api";

export type ReceiverType =
  | "Center"
  | "Parents"
  | "Doctor"
  | "Therapist"
  | "All";

export type SystemNotificationPayload = {
  receivers: ReceiverType[];
  message: string;
};

export type CenterInvitationPayload = {
  centerEmail: string;
  centerName: string;
  centerOwnerName?: string;
  centerOwnerPhone?: string;
  centerOwnerEmail?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  attachmentFileName?: string;
};

export type CompleteCenterInvitationPayload = {
  magicCode: string;
  centerName?: string;
  centerEmail?: string;
  centerOwnerName?: string;
  centerOwnerPhone?: string;
  centerOwnerEmail?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  centerPhone?: string;
  centerWebsite?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  about?: string;
  password: string;
  confirmPassword: string;
};

export async function getSuperAdminDashboard() {
  const response = await api.get("/super-admin/dashboard");
  return response.data;
}

export async function getSuperAdminCenter() {
  const response = await api.get("/super-admin/center");
  return response.data;
}

export async function getSuperAdminCenters() {
  const response = await api.get("/super-admin/centers");
  return response.data;
}

export async function updateSuperAdminCenterStatus(
  centerId: string,
  status: "active" | "suspended"
) {
  const response = await api.patch(`/super-admin/centers/${centerId}/status`, {
    status,
  });

  return response.data;
}

export async function getSuperAdminParents() {
  const response = await api.get("/super-admin/parents");
  return response.data;
}

export async function createCenterInvitation(
  payload: CenterInvitationPayload
) {
  const response = await api.post("/super-admin/center-invitations", payload);
  return response.data;
}

export async function getCenterInvitation(code: string) {
  const response = await api.get("/super-admin/center-invitations/lookup", {
    params: {
      code,
    },
  });

  return response.data;
}

export async function completeCenterInvitation(
  payload: CompleteCenterInvitationPayload
) {
  const response = await api.post(
    "/super-admin/center-invitations/complete",
    payload
  );

  return response.data;
}

export async function getSuperAdminSubscriptions() {
  const response = await api.get("/super-admin/subscriptions");
  return response.data;
}

export async function getSuperAdminNotifications() {
  const response = await api.get("/super-admin/notifications");
  return response.data;
}

export async function createSuperAdminNotification(
  payload: SystemNotificationPayload
) {
  const response = await api.post("/super-admin/notifications", payload);
  return response.data;
}

export async function updateSuperAdminNotification(
  notificationId: string,
  payload: SystemNotificationPayload
) {
  const response = await api.patch(
    `/super-admin/notifications/${notificationId}`,
    payload
  );

  return response.data;
}

export async function deleteSuperAdminNotification(notificationId: string) {
  const response = await api.delete(
    `/super-admin/notifications/${notificationId}`
  );

  return response.data;
}
