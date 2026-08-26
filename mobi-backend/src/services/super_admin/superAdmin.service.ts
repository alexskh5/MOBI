import { supabase } from "../../config/supabase";

type ReceiverType = "Center" | "Parents" | "Doctor" | "Therapist" | "All";

export async function getSuperAdminDashboardData() {
  const { count: activeParents, error: parentsError } = await supabase
    .from("parent_accounts")
    .select("*", { count: "exact", head: true })
    .eq("status", "Active");

  if (parentsError) {
    throw new Error(parentsError.message);
  }

  // Placeholder for now because doctors/therapists tables are not connected yet.
  const activeDoctors = 3;
  const activeTherapists = 5;

  return {
    activeParents: activeParents || 0,
    activeDoctors,
    activeTherapists,
  };
}

export async function getCenterAccount() {
  const { data, error } = await supabase
    .from("centers")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getParentAccounts() {
  const { data, error } = await supabase
    .from("parent_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getSubscriptionPlans() {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getSystemNotifications() {
  const { data, error } = await supabase
    .from("system_notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function getPrimaryReceiver(receivers: ReceiverType[]) {
  if (receivers.includes("All")) return "All";
  return receivers[0];
}

export async function createSystemNotification(data: {
  receivers: ReceiverType[];
  message: string;
}) {
  const { data: notification, error } = await supabase
    .from("system_notifications")
    .insert({
      receiver: getPrimaryReceiver(data.receivers),
      receivers: data.receivers,
      message: data.message,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return notification;
}

export async function updateSystemNotification(
  notificationId: string,
  data: {
    receivers: ReceiverType[];
    message: string;
  }
) {
  const { data: notification, error } = await supabase
    .from("system_notifications")
    .update({
      receiver: getPrimaryReceiver(data.receivers),
      receivers: data.receivers,
      message: data.message,
    })
    .eq("id", notificationId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return notification;
}

export async function deleteSystemNotification(notificationId: string) {
  const { error } = await supabase
    .from("system_notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: notificationId,
  };
}