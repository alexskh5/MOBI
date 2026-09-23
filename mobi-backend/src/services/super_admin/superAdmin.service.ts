import { supabase } from "../../config/supabase";
import { supabaseAdmin } from "../../config/supabase";

type ReceiverType = "Center" | "Parents" | "Doctor" | "Therapist" | "All";

type CenterInvitationPayload = {
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

type CompleteCenterInvitationPayload = {
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

async function countRows(
  table: string,
  filter?: (query: any) => any
): Promise<number> {
  let query = supabase.from(table).select("*", { count: "exact", head: true });

  if (filter) {
    query = filter(query);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

function formatStatus(value?: string | boolean | null) {
  if (typeof value === "boolean") {
    return value ? "Active" : "Suspended";
  }

  const normalized = String(value || "active").toLowerCase();

  return normalized === "active" ? "Active" : "Suspended";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function requireText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function validatePassword(password: string, confirmPassword: string) {
  if (!password || !confirmPassword) {
    throw new Error("Password and confirm password are required.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error("Password must include at least one capital letter.");
  }

  if (!/[0-9]/.test(password)) {
    throw new Error("Password must include at least one number.");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Password must include at least one special character.");
  }
}

function generateMagicCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 7; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

async function createUniqueMagicCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const magicCode = generateMagicCode();

    const { data, error } = await supabaseAdmin
      .from("center_invitations")
      .select("id")
      .ilike("magic_code", magicCode)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return magicCode;
    }
  }

  throw new Error("Unable to generate a unique magic code. Please try again.");
}

function getWebAppUrl() {
  return (
    process.env.MOBI_WEB_URL ||
    process.env.WEB_URL ||
    "http://127.0.0.1:5173"
  ).replace(/\/$/, "");
}

async function sendCenterInvitationEmail({
  to,
  centerName,
  magicCode,
  setupLink,
  attachmentFileName,
}: {
  to: string;
  centerName: string;
  magicCode: string;
  setupLink: string;
  attachmentFileName?: string | null;
}) {
  /*
    No production email provider is configured in this project yet.
    Keep the email body centralized so SMTP/Resend can be plugged in later.
  */
  console.log("MOBI center invitation email ready:", {
    to,
    subject: "You're invited to create your MOBI center account",
    centerName,
    magicCode,
    setupLink,
    attachmentFileName,
  });
}

export async function getSuperAdminDashboardData() {
  const [
    activeParents,
    activeDoctors,
    activeTherapists,
    activeCenters,
    totalCenters,
    totalLearners,
  ] = await Promise.all([
    countRows("center_parents", (query) => query.eq("account_status", "active")),
    countRows("doctors", (query) => query.eq("account_status", "active")),
    countRows("therapists", (query) => query.eq("account_status", "active")),
    countRows("centers", (query) => query.eq("is_active", true)),
    countRows("centers"),
    countRows("learners"),
  ]);

  const { data: centers, error: centersError } = await supabaseAdmin
    .from("centers")
    .select(
      "id, center_name, center_email, center_owner_name, contact_person_name, subscription_status, is_active, created_at"
    )
    .order("created_at", { ascending: false });

  if (centersError) {
    throw new Error(centersError.message);
  }

  const center = (centers || []).find((item) => item.is_active) ?? centers?.[0];
  const centerNamesById = new Map(
    (centers || []).map((item) => [
      item.id,
      item.center_name || "Unnamed center",
    ])
  );

  const { data: activities, error: activitiesError } = await supabase
    .from("activities")
    .select("id, title, description, created_at, updated_at, center_id, status")
    .eq("status", "published")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (activitiesError) {
    throw new Error(activitiesError.message);
  }

  const activityIds = (activities || []).map((activity) => activity.id);
  const usageCounts = new Map<string, number>();

  if (activityIds.length > 0) {
    const { data: sessions, error: sessionsError } = await supabase
      .from("learner_activity_sessions")
      .select("activity_id")
      .in("activity_id", activityIds);

    if (sessionsError) {
      throw new Error(sessionsError.message);
    }

    (sessions || []).forEach((session) => {
      usageCounts.set(
        session.activity_id,
        (usageCounts.get(session.activity_id) || 0) + 1
      );
    });
  }

  const centerName = center?.center_name || "MOBI Center";
  const mostUsedActivities = (activities || [])
    .map((activity) => ({
      id: activity.id,
      title: activity.title || "Untitled activity",
      centerName:
        centerNamesById.get(activity.center_id) || "Unknown center",
      usageCount: usageCounts.get(activity.id) || 0,
      description: activity.description || "No description added yet.",
      author: centerNamesById.get(activity.center_id) || "Unknown center",
      datePublished: activity.updated_at || activity.created_at,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 6)
    .map((activity, index) => ({
      ...activity,
      rank: index + 1,
    }));

  return {
    activeParents: activeParents || 0,
    activeDoctors,
    activeTherapists,
    activeCenters,
    totalCenters,
    inactiveCenters: Math.max((totalCenters || 0) - (activeCenters || 0), 0),
    totalLearners,
    center: center
      ? {
          id: center.id,
          centerName: center.center_name,
          email: center.center_email,
          status: formatStatus(center.is_active),
        }
      : null,
    mostUsedActivities,
    centers: (centers || []).map((item) => ({
      id: item.id,
      centerName: item.center_name || "Unnamed center",
      email: item.center_email || "",
      owner: item.center_owner_name || "",
      contactPerson: item.contact_person_name || "",
      plan: item.subscription_status || "No active plan",
      status: formatStatus(item.is_active),
      createdAt: item.created_at,
    })),
  };
}

export async function getCenterAccount() {
  const { data, error } = await supabase
    .from("centers")
    .select(
      "id, center_name, center_email, center_owner_name, contact_person_name, subscription_status, is_active, status"
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    center_name: data.center_name || "Unnamed center",
    contact_person: data.contact_person_name || data.center_owner_name || null,
    center_owner: data.center_owner_name || null,
    email: data.center_email || "",
    plan_detail: data.subscription_status || "No active plan",
    status: formatStatus(data.is_active),
  };
}

export async function getCenterAccounts() {
  const { data, error } = await supabaseAdmin
    .from("centers")
    .select(
      "id, center_name, center_email, center_owner_name, contact_person_name, subscription_status, is_active, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((center) => ({
    id: center.id,
    center_name: center.center_name || "Unnamed center",
    contact_person: center.contact_person_name || center.center_owner_name || null,
    center_owner: center.center_owner_name || null,
    email: center.center_email || "",
    plan_detail: center.subscription_status || "No active plan",
    status: formatStatus(center.is_active),
    created_at: center.created_at,
  }));
}

export async function updateCenterAccountStatus({
  centerId,
  status,
}: {
  centerId: string;
  status: "active" | "suspended";
}) {
  const isActive = status === "active";

  const { data, error } = await supabaseAdmin
    .from("centers")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", centerId)
    .select(
      "id, center_name, center_email, center_owner_name, contact_person_name, subscription_status, is_active, status"
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabaseAdmin
    .from("center_admins")
    .update({
      is_active: isActive,
      account_status: isActive ? "active" : "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("center_id", centerId);

  return {
    id: data.id,
    center_name: data.center_name || "Unnamed center",
    contact_person: data.contact_person_name || data.center_owner_name || null,
    center_owner: data.center_owner_name || null,
    email: data.center_email || "",
    plan_detail: data.subscription_status || "No active plan",
    status: formatStatus(data.is_active),
  };
}

export async function getParentAccounts() {
  const { data, error } = await supabase
    .from("center_parents")
    .select("id, first_name, last_name, email, account_status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const childCounts = new Map<string, number>();
  const parentIds = (data || []).map((parent) => parent.id);

  if (parentIds.length > 0) {
    const { data: parentLearners, error: parentLearnersError } = await supabase
      .from("parent_learners")
      .select("parent_id")
      .in("parent_id", parentIds);

    if (parentLearnersError) {
      throw new Error(parentLearnersError.message);
    }

    (parentLearners || []).forEach((link) => {
      childCounts.set(link.parent_id, (childCounts.get(link.parent_id) || 0) + 1);
    });
  }

  return (data || []).map((parent) => ({
    id: parent.id,
    first_name: parent.first_name || "",
    last_name: parent.last_name || "",
    email: parent.email || "",
    child_number: childCounts.get(parent.id) || 0,
    status: formatStatus(parent.account_status),
  }));
}

export async function createCenterInvitation(payload: CenterInvitationPayload) {
  const centerEmail = normalizeEmail(
    requireText(payload.centerEmail, "Center email")
  );
  const centerName = requireText(payload.centerName, "Center name");

  const { data: existingCenter, error: existingCenterError } = await supabaseAdmin
    .from("centers")
    .select("id")
    .ilike("center_email", centerEmail)
    .limit(1)
    .maybeSingle();

  if (existingCenterError) {
    throw new Error(existingCenterError.message);
  }

  if (existingCenter) {
    throw new Error("A center account already uses this email.");
  }

  const magicCode = await createUniqueMagicCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const setupLink = `${getWebAppUrl()}/invitation?code=${encodeURIComponent(
    magicCode
  )}`;

  const { data, error } = await supabaseAdmin
    .from("center_invitations")
    .insert({
      magic_code: magicCode,
      center_email: centerEmail,
      center_name: centerName,
      center_owner_name: optionalText(payload.centerOwnerName),
      center_owner_phone: optionalText(payload.centerOwnerPhone),
      center_owner_email: payload.centerOwnerEmail
        ? normalizeEmail(payload.centerOwnerEmail)
        : null,
      contact_person_name: optionalText(payload.contactPersonName),
      contact_person_phone: optionalText(payload.contactPersonPhone),
      contact_person_email: payload.contactPersonEmail
        ? normalizeEmail(payload.contactPersonEmail)
        : null,
      attachment_file_name: optionalText(payload.attachmentFileName),
      expires_at: expiresAt,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await sendCenterInvitationEmail({
    to: centerEmail,
    centerName,
    magicCode,
    setupLink,
    attachmentFileName: optionalText(payload.attachmentFileName),
  });

  return {
    id: data.id,
    centerEmail: data.center_email,
    centerName: data.center_name,
    magicCode: data.magic_code,
    expiresAt: data.expires_at,
    setupLink,
    status: data.status,
  };
}

export async function getCenterInvitationByCode(magicCodeInput: string) {
  const magicCode = requireText(magicCodeInput, "Magic code").toUpperCase();

  const { data, error } = await supabaseAdmin
    .from("center_invitations")
    .select("*")
    .ilike("magic_code", magicCode)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Invalid magic code.");
  }

  const isExpired = new Date(data.expires_at).getTime() < Date.now();

  if (data.status !== "pending" || isExpired) {
    if (isExpired && data.status === "pending") {
      await supabaseAdmin
        .from("center_invitations")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", data.id);
    }

    throw new Error("This magic code is expired or already used.");
  }

  return {
    id: data.id,
    magicCode: data.magic_code,
    centerEmail: data.center_email,
    centerName: data.center_name,
    centerOwnerName: data.center_owner_name,
    centerOwnerPhone: data.center_owner_phone,
    centerOwnerEmail: data.center_owner_email,
    contactPersonName: data.contact_person_name,
    contactPersonPhone: data.contact_person_phone,
    contactPersonEmail: data.contact_person_email,
    expiresAt: data.expires_at,
  };
}

export async function completeCenterInvitation(
  payload: CompleteCenterInvitationPayload
) {
  const invitation = await getCenterInvitationByCode(payload.magicCode);
  const centerEmail = normalizeEmail(
    payload.centerEmail || invitation.centerEmail
  );
  const centerName = requireText(
    payload.centerName || invitation.centerName,
    "Center name"
  );

  validatePassword(payload.password, payload.confirmPassword);

  const { data: existingCenter, error: existingCenterError } = await supabaseAdmin
    .from("centers")
    .select("id")
    .ilike("center_email", centerEmail)
    .limit(1)
    .maybeSingle();

  if (existingCenterError) {
    throw new Error(existingCenterError.message);
  }

  if (existingCenter) {
    throw new Error("A center account already uses this email.");
  }

  const ownerName =
    optionalText(payload.centerOwnerName) ||
    optionalText(invitation.centerOwnerName) ||
    centerName;
  const ownerEmail =
    (payload.centerOwnerEmail
      ? normalizeEmail(payload.centerOwnerEmail)
      : invitation.centerOwnerEmail) || centerEmail;

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: centerEmail,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        mobi_role: "center_admin",
        center_name: centerName,
      },
    });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Unable to create center login.");
  }

  const { data: center, error: centerError } = await supabaseAdmin
    .from("centers")
    .insert({
      center_email: centerEmail,
      center_name: centerName,
      center_owner_name: ownerName,
      center_owner_phone:
        optionalText(payload.centerOwnerPhone) ||
        optionalText(invitation.centerOwnerPhone),
      center_owner_email: ownerEmail,
      center_phone:
        optionalText(payload.centerPhone) ||
        optionalText(payload.centerOwnerPhone) ||
        optionalText(invitation.centerOwnerPhone),
      contact_person_name:
        optionalText(payload.contactPersonName) ||
        optionalText(invitation.contactPersonName),
      contact_person_phone:
        optionalText(payload.contactPersonPhone) ||
        optionalText(invitation.contactPersonPhone),
      contact_person_email:
        (payload.contactPersonEmail
          ? normalizeEmail(payload.contactPersonEmail)
          : invitation.contactPersonEmail) || null,
      contact_phone:
        optionalText(payload.contactPersonPhone) ||
        optionalText(invitation.contactPersonPhone),
      center_website: optionalText(payload.centerWebsite),
      address: optionalText(payload.address),
      city: optionalText(payload.city),
      province: optionalText(payload.province),
      postal_code: optionalText(payload.postalCode),
      about: optionalText(payload.about),
      center_code: invitation.magicCode,
      subscription_status: "active",
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (centerError || !center) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new Error(centerError?.message || "Unable to create center account.");
  }

  const nameParts = ownerName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || centerName;
  const lastName = nameParts.slice(1).join(" ") || "Admin";

  const { error: adminError } = await supabaseAdmin
    .from("center_admins")
    .insert({
      center_id: center.id,
      auth_user_id: authData.user.id,
      email: centerEmail,
      first_name: firstName,
      last_name: lastName,
      account_status: "active",
      is_active: true,
      invited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (adminError) {
    await supabaseAdmin.from("centers").delete().eq("id", center.id);
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new Error(adminError.message);
  }

  const { error: inviteUpdateError } = await supabaseAdmin
    .from("center_invitations")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      center_id: center.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invitation.id);

  if (inviteUpdateError) {
    throw new Error(inviteUpdateError.message);
  }

  return {
    centerId: center.id,
    centerName: center.center_name,
    centerEmail: center.center_email,
  };
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
