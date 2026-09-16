import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

export type TherapistAccountStatus =
  | "not_invited"
  | "invited"
  | "active"
  | "suspended";

export interface TherapistInput {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  specialization?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
}

export interface TherapistRecord {
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
  account_status: TherapistAccountStatus;
  access_code_sent_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

const THERAPIST_COLUMNS = `
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

/* =========================================================
   CREATE THERAPIST
========================================================= */

export async function createTherapistService(
  centerId: string,
  input: TherapistInput,
) {
  const normalizedEmail =
    input.email
      .trim()
      .toLowerCase();

  const {
    data: existingTherapist,
    error: existingError,
  } = await supabase
    .from("therapists")
    .select("id")
    .eq("center_id", centerId)
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingTherapist) {
    throw new Error(
      "A therapist with this email already exists.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("therapists")
    .insert({
      center_id:
        centerId,

      first_name:
        input.firstName,

      middle_name:
        input.middleName ?? null,

      last_name:
        input.lastName,

      email:
        normalizedEmail,

      specialization:
        input.specialization ?? null,

      phone_number:
        input.phoneNumber ?? null,

      profile_picture_url:
        null,

      bio:
        input.bio ?? null,

      auth_user_id:
        null,

      account_status:
        "not_invited",
    })
    .select(
      THERAPIST_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return data as TherapistRecord;
}

/* =========================================================
   GET THERAPISTS
========================================================= */

export async function getTherapistsService(
  centerId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from("therapists")
    .select(
      THERAPIST_COLUMNS,
    )
    .eq("center_id", centerId)
    .order("first_name", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as TherapistRecord[];
}

/* =========================================================
   GET ONE THERAPIST
========================================================= */

export async function getTherapistByIdService(
  therapistId: string,
  centerId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from("therapists")
    .select(
      THERAPIST_COLUMNS,
    )
    .eq("id", therapistId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Therapist not found.",
    );
  }

  return data as TherapistRecord;
}

/* =========================================================
   GET THERAPIST BY EMAIL
   Used by staff OTP login.
========================================================= */

export async function getTherapistByEmailService(
  email: string,
  centerId: string,
) {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const {
    data,
    error,
  } = await supabase
    .from("therapists")
    .select(
      THERAPIST_COLUMNS,
    )
    .eq("center_id", centerId)
    .ilike(
      "email",
      normalizedEmail,
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data ?? null
  ) as TherapistRecord | null;
}

/* =========================================================
   UPDATE THERAPIST
========================================================= */

export async function updateTherapistService(
  therapistId: string,
  centerId: string,
  input: TherapistInput,
) {
  const {
    data: therapist,
    error: findError,
  } = await supabase
    .from("therapists")
    .select("id")
    .eq("id", therapistId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (!therapist) {
    throw new Error(
      "Therapist not found.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("therapists")
    .update({
      first_name:
        input.firstName,

      middle_name:
        input.middleName ?? null,

      last_name:
        input.lastName,

      email:
        input.email
          .trim()
          .toLowerCase(),

      specialization:
        input.specialization ?? null,

      phone_number:
        input.phoneNumber ?? null,

      bio:
        input.bio ?? null,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", therapistId)
    .eq("center_id", centerId)
    .select(
      THERAPIST_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return data as TherapistRecord;
}

/* =========================================================
   UPDATE THERAPIST INVITATION STATE
   Used after sending/resending an OTP.
========================================================= */

export async function updateTherapistInvitationStateService({
  therapistId,
  centerId,
  authUserId,
  status,
  accessCodeSentAt,
}: {
  therapistId: string;
  centerId: string;
  authUserId?: string | null;
  status?: TherapistAccountStatus;
  accessCodeSentAt?: string | null;
}) {
  const patch:
    Record<
      string,
      unknown
    > = {
      updated_at:
        new Date().toISOString(),
    };

  if (
    authUserId !==
    undefined
  ) {
    patch.auth_user_id =
      authUserId;
  }

  if (
    status !== undefined
  ) {
    patch.account_status =
      status;
  }

  if (
    accessCodeSentAt !==
    undefined
  ) {
    patch.access_code_sent_at =
      accessCodeSentAt;
  }

  const {
    data,
    error,
  } = await supabase
    .from("therapists")
    .update(patch)
    .eq(
      "id",
      therapistId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .select(
      THERAPIST_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return data as TherapistRecord;
}

/* =========================================================
   ACTIVATE THERAPIST AFTER SUCCESSFUL OTP
========================================================= */

export async function activateTherapistService({
  therapistId,
  centerId,
  authUserId,
}: {
  therapistId: string;
  centerId: string;
  authUserId: string;
}) {
  const now =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabase
    .from("therapists")
    .update({
      auth_user_id:
        authUserId,

      account_status:
        "active",

      last_login_at:
        now,

      updated_at:
        now,
    })
    .eq(
      "id",
      therapistId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .select(
      THERAPIST_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return data as TherapistRecord;
}

/* =========================================================
   RESET THERAPIST AUTH LINK
   Useful if email changes before invitation or auth is reset.
========================================================= */

export async function resetTherapistAuthLinkService(
  therapistId: string,
  centerId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from("therapists")
    .update({
      auth_user_id:
        null,

      access_code_sent_at:
        null,

      account_status:
        "not_invited",

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      therapistId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .select(
      THERAPIST_COLUMNS,
    )
    .single();

  if (error) {
    throw error;
  }

  return data as TherapistRecord;
}

/* =========================================================
   DELETE THERAPIST
========================================================= */

export async function deleteTherapistService(
  therapistId: string,
  centerId: string,
) {
  const {
    data: therapist,
    error: findError,
  } = await supabase
    .from("therapists")
    .select(
      THERAPIST_COLUMNS,
    )
    .eq(
      "id",
      therapistId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (!therapist) {
    throw new Error(
      "Therapist not found.",
    );
  }

  const {
    error: deleteError,
  } = await supabase
    .from("therapists")
    .delete()
    .eq(
      "id",
      therapistId,
    )
    .eq(
      "center_id",
      centerId,
    );

  if (deleteError) {
    throw deleteError;
  }

  return therapist as TherapistRecord;
}
