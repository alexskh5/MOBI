import { supabase } from "../../config/supabase";

export type DoctorAccountStatus =
  | "not_invited"
  | "invited"
  | "active"
  | "suspended";

export interface DoctorInput {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  specialization?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
}

export interface DoctorRecord {
  id: string;
  center_id: string;
  auth_user_id: string | null;
  email: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  specialization: string | null;
  phone_number: string | null;
  profile_picture_url: string | null;
  bio: string | null;
  account_status: DoctorAccountStatus;
  access_code_sent_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

const DOCTOR_COLUMNS = `
  id,
  center_id,
  auth_user_id,
  email,
  first_name,
  middle_name,
  last_name,
  specialization,
  phone_number,
  profile_picture_url,
  bio,
  account_status,
  access_code_sent_at,
  last_login_at,
  created_at,
  updated_at
`;

export async function createDoctorService(
  centerId: string,
  input: DoctorInput,
) {
  const { data, error } = await supabase
    .from("doctors")
    .insert({
      center_id: centerId,
      first_name: input.firstName,
      middle_name: input.middleName ?? null,
      last_name: input.lastName,
      email: input.email.toLowerCase(),
      specialization: input.specialization ?? null,
      phone_number: input.phoneNumber ?? null,
      bio: input.bio ?? null,

      // Not entered by the Center:
      auth_user_id: null,
      profile_picture_url: null,

      // This is also the DB default, but being explicit makes the flow clear.
      account_status: "not_invited",
    })
    .select(DOCTOR_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DoctorRecord;
}

export async function getDoctorsService(
  centerId: string,
) {
  const { data, error } = await supabase
    .from("doctors")
    .select(DOCTOR_COLUMNS)
    .eq("center_id", centerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DoctorRecord[];
}

export async function getDoctorByIdService(
  doctorId: string,
  centerId: string,
) {
  const { data, error } = await supabase
    .from("doctors")
    .select(DOCTOR_COLUMNS)
    .eq("id", doctorId)
    .eq("center_id", centerId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DoctorRecord;
}

export async function getDoctorByEmailService(
  email: string,
  centerId: string,
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("doctors")
    .select(DOCTOR_COLUMNS)
    .eq("center_id", centerId)
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as DoctorRecord | null;
}

export async function updateDoctorService(
  doctorId: string,
  centerId: string,
  input: DoctorInput,
) {
  const { data, error } = await supabase
    .from("doctors")
    .update({
      first_name: input.firstName,
      middle_name: input.middleName ?? null,
      last_name: input.lastName,
      email: input.email.toLowerCase(),
      specialization: input.specialization ?? null,
      phone_number: input.phoneNumber ?? null,
      bio: input.bio ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", doctorId)
    .eq("center_id", centerId)
    .select(DOCTOR_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DoctorRecord;
}

export async function updateDoctorInvitationStateService({
  doctorId,
  centerId,
  authUserId,
  status,
  accessCodeSentAt,
}: {
  doctorId: string;
  centerId: string;
  authUserId?: string | null;
  status?: DoctorAccountStatus;
  accessCodeSentAt?: string | null;
}) {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (authUserId !== undefined) {
    patch.auth_user_id = authUserId;
  }

  if (status !== undefined) {
    patch.account_status = status;
  }

  if (accessCodeSentAt !== undefined) {
    patch.access_code_sent_at =
      accessCodeSentAt;
  }

  const { data, error } = await supabase
    .from("doctors")
    .update(patch)
    .eq("id", doctorId)
    .eq("center_id", centerId)
    .select(DOCTOR_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DoctorRecord;
}



export async function activateDoctorService({
  doctorId,
  centerId,
  authUserId,
}: {
  doctorId: string;
  centerId: string;
  authUserId: string;
}) {
  const now = new Date().toISOString();

  // Update the real Doctor account.
  const { error: updateError } = await supabase
    .from("doctors")
    .update({
      auth_user_id: authUserId,
      account_status: "active",
      last_login_at: now,
      updated_at: now,
    })
    .eq("id", doctorId)
    .eq("center_id", centerId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // Fetch the Doctor separately after updating.
  const activeDoctor = await getDoctorByIdService(
    doctorId,
    centerId,
  );

  // Safety check: make sure activation really happened.
  if (
    activeDoctor.account_status !== "active" ||
    activeDoctor.auth_user_id !== authUserId
  ) {
    throw new Error(
      "Doctor account could not be activated after authentication.",
    );
  }

  return activeDoctor;
}



export async function resetDoctorAuthLinkService(
  doctorId: string,
  centerId: string,
) {
  const { data, error } = await supabase
    .from("doctors")
    .update({
      auth_user_id: null,
      access_code_sent_at: null,
      account_status: "not_invited",
      updated_at: new Date().toISOString(),
    })
    .eq("id", doctorId)
    .eq("center_id", centerId)
    .select(DOCTOR_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DoctorRecord;
}

export async function deleteDoctorService(
  doctorId: string,
  centerId: string,
) {
  const { data, error } = await supabase
    .from("doctors")
    .delete()
    .eq("id", doctorId)
    .eq("center_id", centerId)
    .select(DOCTOR_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DoctorRecord;
}
