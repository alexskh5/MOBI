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

export async function getSuperAdminDashboard() {
  const response = await api.get("/super-admin/dashboard");
  return response.data;
}

export async function getSuperAdminCenter() {
  const response = await api.get("/super-admin/center");
  return response.data;
}

export async function getSuperAdminParents() {
  const response = await api.get("/super-admin/parents");
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
