import { supabaseAdmin } from "../../config/supabase";

export type CenterProfileUpdate = {
  centerName?: string;
  centerEmail?: string;
  centerPhone?: string;
  centerWebsite?: string;
  centerOwnerName?: string;
  centerOwnerPhone?: string;
  centerOwnerEmail?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  about?: string;
};

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim().toLowerCase()
    : null;
}

function mapCenterProfile(row: any) {
  return {
    id: row.id,
    centerName: row.center_name || "",
    centerEmail: row.center_email || "",
    centerPhone: row.center_phone || "",
    centerWebsite: row.center_website || "",
    centerOwnerName: row.center_owner_name || "",
    centerOwnerPhone: row.center_owner_phone || "",
    centerOwnerEmail: row.center_owner_email || "",
    contactPersonName: row.contact_person_name || "",
    contactPersonPhone: row.contact_person_phone || row.contact_phone || "",
    contactPersonEmail: row.contact_person_email || "",
    address: row.address || "",
    city: row.city || "",
    province: row.province || "",
    postalCode: row.postal_code || "",
    about: row.about || "",
    subscriptionStatus: row.subscription_status || "No active plan",
    isActive: row.is_active === true,
  };
}

const centerProfileSelect = [
  "id",
  "center_name",
  "center_email",
  "center_phone",
  "center_website",
  "center_owner_name",
  "center_owner_phone",
  "center_owner_email",
  "contact_person_name",
  "contact_person_phone",
  "contact_person_email",
  "contact_phone",
  "address",
  "city",
  "province",
  "postal_code",
  "about",
  "subscription_status",
  "is_active",
].join(", ");

export async function getCenterProfile(centerId: string) {
  const { data, error } = await supabaseAdmin
    .from("centers")
    .select(centerProfileSelect)
    .eq("id", centerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Center profile was not found.");
  }

  return mapCenterProfile(data);
}

export async function updateCenterProfile(
  centerId: string,
  updates: CenterProfileUpdate,
) {
  const payload = {
    center_name: optionalText(updates.centerName),
    center_email: normalizeEmail(updates.centerEmail),
    center_phone: optionalText(updates.centerPhone),
    center_website: optionalText(updates.centerWebsite),
    center_owner_name: optionalText(updates.centerOwnerName),
    center_owner_phone: optionalText(updates.centerOwnerPhone),
    center_owner_email: normalizeEmail(updates.centerOwnerEmail),
    contact_person_name: optionalText(updates.contactPersonName),
    contact_person_phone: optionalText(updates.contactPersonPhone),
    contact_person_email: normalizeEmail(updates.contactPersonEmail),
    contact_phone: optionalText(updates.contactPersonPhone),
    address: optionalText(updates.address),
    city: optionalText(updates.city),
    province: optionalText(updates.province),
    postal_code: optionalText(updates.postalCode),
    about: optionalText(updates.about),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("centers")
    .update(payload)
    .eq("id", centerId)
    .select(centerProfileSelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCenterProfile(data);
}
