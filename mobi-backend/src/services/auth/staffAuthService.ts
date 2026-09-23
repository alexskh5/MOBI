import {
  supabase,
  supabaseAuth,
} from "../../config/supabase";

import {
  activateDoctorService,
  getDoctorByEmailService,
  getDoctorByIdService,
  updateDoctorInvitationStateService,
  type DoctorRecord,
} from "../doctor/doctorService";

import {
  activateTherapistService,
  getTherapistByEmailService,
  getTherapistByIdService,
  updateTherapistInvitationStateService,
  type TherapistRecord,
} from "../therapist/therapistService";

/* =========================================================
   TYPES
========================================================= */

export type StaffRole =
  | "doctor"
  | "therapist";

type AuthUserSummary = {
  id: string;
  email?: string | null;
};

export class StaffAuthError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400,
  ) {
    super(message);
    this.name =
      "StaffAuthError";
    this.statusCode =
      statusCode;
  }
}

/* =========================================================
   CONSTANTS
========================================================= */

const ACCESS_CODE_VALIDITY_MS =
  10 * 60 * 1000;


export type PasswordUpdateFlow =
  | "initial"
  | "recovery"
  | "change";

type StaffSecurityRow = {
  id: string;
  center_id: string;
  auth_user_id: string | null;
  email: string;
  account_status:
    | "not_invited"
    | "invited"
    | "active"
    | "suspended";
  password_set_at: string | null;
  password_changed_at: string | null;
  password_reset_code_sent_at: string | null;
  [key: string]: unknown;
};

function getStaffTable(
  role: StaffRole,
) {
  return role === "doctor"
    ? "doctors"
    : "therapists";
}

async function getStaffSecurityRowByEmail(
  role: StaffRole,
  email: string,
  centerId: string,
): Promise<StaffSecurityRow | null> {
  const normalizedEmail =
    email.trim().toLowerCase();

  const {
    data,
    error,
  } = await supabase
    .from(getStaffTable(role))
    .select("*")
    .eq("center_id", centerId)
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    throw new StaffAuthError(
      `Unable to read the ${role} security profile: ${error.message}`,
      500,
    );
  }

  return (data as StaffSecurityRow | null) ?? null;
}

async function getStaffSecurityRowById(
  role: StaffRole,
  profileId: string,
  centerId: string,
): Promise<StaffSecurityRow | null> {
  const {
    data,
    error,
  } = await supabase
    .from(getStaffTable(role))
    .select("*")
    .eq("center_id", centerId)
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new StaffAuthError(
      `Unable to read the ${role} security profile: ${error.message}`,
      500,
    );
  }

  return (data as StaffSecurityRow | null) ?? null;
}

function assertStaffCanAuthenticate(
  profile: StaffSecurityRow,
) {
  if (profile.account_status === "suspended") {
    throw new StaffAuthError(
      "This account is suspended. Please contact the therapy center.",
      403,
    );
  }
}

function validateResetCodeWindow(
  sentAt: string | null,
) {
  if (!sentAt) {
    throw new StaffAuthError(
      "No active password-reset code was found. Please request a new code.",
      401,
    );
  }

  const timestamp = new Date(sentAt).getTime();

  if (Number.isNaN(timestamp)) {
    throw new StaffAuthError(
      "The current password-reset code is invalid. Please request a new code.",
      401,
    );
  }

  if (
    Date.now() - timestamp >
    ACCESS_CODE_VALIDITY_MS
  ) {
    throw new StaffAuthError(
      "This password-reset code has expired. Please request a new code.",
      401,
    );
  }
}

async function verifyAccessToken(
  accessToken: string,
) {
  const {
    data,
    error,
  } = await supabaseAuth.auth.getUser(
    accessToken,
  );

  if (error || !data.user) {
    throw new StaffAuthError(
      "Your session is no longer valid. Please sign in again.",
      401,
    );
  }

  return data.user;
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visible = localPart.slice(0, 1);
  const hidden = "*".repeat(
    Math.max(localPart.length - 1, 3),
  );

  return `${visible}${hidden}@${domain}`;
}

/* =========================================================
   AUTH USER LOOKUP
========================================================= */

/*
  Supabase's OTP send response intentionally does not give us
  the auth user object. We use the Admin API on the BACKEND
  only to locate an auth.users record by email.
*/
export async function findAuthUserByEmail(
  email: string,
): Promise<AuthUserSummary | null> {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  let page = 1;
  const perPage = 1000;

  while (page <= 10) {
    const {
      data,
      error,
    } =
      await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

    if (error) {
      throw new StaffAuthError(
        `Unable to check authentication account: ${error.message}`,
        500,
      );
    }

    const user =
      data.users.find(
        (candidate) =>
          candidate.email
            ?.toLowerCase() ===
          normalizedEmail,
      ) ?? null;

    if (user) {
      return {
        id: user.id,
        email:
          user.email,
      };
    }

    if (
      data.users.length <
      perPage
    ) {
      break;
    }

    page += 1;
  }

  return null;
}

/* =========================================================
   ACCESS CODE TIME CHECK
========================================================= */

function validateAccessCodeWindow(
  accessCodeSentAt:
    | string
    | null,
) {
  if (!accessCodeSentAt) {
    throw new StaffAuthError(
      "No active access code was found. Please request a new code.",
      401,
    );
  }

  const sentAt =
    new Date(
      accessCodeSentAt,
    ).getTime();

  if (
    Number.isNaN(sentAt)
  ) {
    throw new StaffAuthError(
      "The current access code is invalid. Please request a new code.",
      401,
    );
  }

  const codeAge =
    Date.now() -
    sentAt;

  if (
    codeAge >
    ACCESS_CODE_VALIDITY_MS
  ) {
    throw new StaffAuthError(
      "This access code has expired. Please request a new code.",
      401,
    );
  }
}

/* =========================================================
   SEND / RESEND DOCTOR ACCESS CODE
========================================================= */

export async function sendDoctorAccessCodeService({
  doctorId,
  centerId,
  allowCreateUser,
}: {
  doctorId: string;
  centerId: string;
  allowCreateUser: boolean;
}) {
  const doctor =
    await getDoctorByIdService(
      doctorId,
      centerId,
    );

  if (
    doctor.account_status ===
    "suspended"
  ) {
    throw new StaffAuthError(
      "This doctor account is suspended. Access codes cannot be sent.",
      403,
    );
  }

  if (!doctor.email) {
    throw new StaffAuthError(
      "This doctor does not have an email address.",
    );
  }

  const {
    error: otpError,
  } =
    await supabaseAuth.auth.signInWithOtp({
      email:
        doctor.email,

      options: {
        shouldCreateUser:
          allowCreateUser,

        data: {
          mobi_role:
            "doctor",
          doctor_id:
            doctor.id,
          center_id:
            centerId,
        },
      },
    });

  if (otpError) {
    throw new StaffAuthError(
      otpError.message,
      otpError.status ??
        400,
    );
  }

  const authUser =
    await findAuthUserByEmail(
      doctor.email,
    );

  const sentAt =
    new Date().toISOString();

  const updatedDoctor =
    await updateDoctorInvitationStateService({
      doctorId:
        doctor.id,

      centerId,

      authUserId:
        authUser?.id ??
        doctor.auth_user_id,

      status:
        doctor.account_status ===
        "active"
          ? "active"
          : "invited",

      accessCodeSentAt:
        sentAt,
    });

  return {
    doctor:
      updatedDoctor,
    sentAt,
  };
}

/* =========================================================
   SEND / RESEND THERAPIST ACCESS CODE
========================================================= */

export async function sendTherapistAccessCodeService({
  therapistId,
  centerId,
  allowCreateUser,
}: {
  therapistId: string;
  centerId: string;
  allowCreateUser: boolean;
}) {
  const therapist =
    await getTherapistByIdService(
      therapistId,
      centerId,
    );

  if (
    therapist.account_status ===
    "suspended"
  ) {
    throw new StaffAuthError(
      "This therapist account is suspended. Access codes cannot be sent.",
      403,
    );
  }

  if (!therapist.email) {
    throw new StaffAuthError(
      "This therapist does not have an email address.",
    );
  }

  const {
    error: otpError,
  } =
    await supabaseAuth.auth.signInWithOtp({
      email:
        therapist.email,

      options: {
        shouldCreateUser:
          allowCreateUser,

        data: {
          mobi_role:
            "therapist",
          therapist_id:
            therapist.id,
          center_id:
            centerId,
        },
      },
    });

  if (otpError) {
    throw new StaffAuthError(
      otpError.message,
      otpError.status ??
        400,
    );
  }

  const authUser =
    await findAuthUserByEmail(
      therapist.email,
    );

  const sentAt =
    new Date().toISOString();

  const updatedTherapist =
    await updateTherapistInvitationStateService({
      therapistId:
        therapist.id,

      centerId,

      authUserId:
        authUser?.id ??
        therapist.auth_user_id,

      status:
        therapist.account_status ===
        "active"
          ? "active"
          : "invited",

      accessCodeSentAt:
        sentAt,
    });

  return {
    therapist:
      updatedTherapist,
    sentAt,
  };
}

/* =========================================================
   REQUEST DOCTOR'S OWN LOGIN CODE
========================================================= */

export async function requestDoctorLoginCodeService({
  email,
  centerId,
}: {
  email: string;
  centerId: string;
}) {
  const doctor =
    await getDoctorByEmailService(
      email,
      centerId,
    );

  /*
    Generic acceptance prevents account enumeration.
  */
  if (!doctor) {
    return {
      accepted: true,
    };
  }

  const doctorSecurity =
    await getStaffSecurityRowById(
      "doctor",
      doctor.id,
      centerId,
    );

  if (doctorSecurity?.password_set_at) {
    throw new StaffAuthError(
      "This Doctor account is already activated. Sign in with your password or use Forgot password.",
      409,
    );
  }

  if (
    doctor.account_status ===
    "suspended"
  ) {
    throw new StaffAuthError(
      "This account is suspended. Please contact the therapy center.",
      403,
    );
  }

  const authUser =
    doctor.auth_user_id
      ? {
          id:
            doctor.auth_user_id,
        }
      : await findAuthUserByEmail(
          doctor.email,
        );

  await sendDoctorAccessCodeService({
    doctorId:
      doctor.id,

    centerId,

    allowCreateUser:
      !authUser,
  });

  return {
    accepted: true,
  };
}

/* =========================================================
   REQUEST THERAPIST'S OWN LOGIN CODE
========================================================= */

export async function requestTherapistLoginCodeService({
  email,
  centerId,
}: {
  email: string;
  centerId: string;
}) {
  const therapist =
    await getTherapistByEmailService(
      email,
      centerId,
    );

  /*
    Generic acceptance prevents account enumeration.
  */
  if (!therapist) {
    return {
      accepted: true,
    };
  }

  const therapistSecurity =
    await getStaffSecurityRowById(
      "therapist",
      therapist.id,
      centerId,
    );

  if (therapistSecurity?.password_set_at) {
    throw new StaffAuthError(
      "This Therapist account is already activated. Sign in with your password or use Forgot password.",
      409,
    );
  }

  if (
    therapist.account_status ===
    "suspended"
  ) {
    throw new StaffAuthError(
      "This account is suspended. Please contact the therapy center.",
      403,
    );
  }

  const authUser =
    therapist.auth_user_id
      ? {
          id:
            therapist.auth_user_id,
        }
      : await findAuthUserByEmail(
          therapist.email,
        );

  await sendTherapistAccessCodeService({
    therapistId:
      therapist.id,

    centerId,

    allowCreateUser:
      !authUser,
  });

  return {
    accepted: true,
  };
}

/* =========================================================
   STAFF LOGIN CODE REQUEST BY SELECTED ROLE

   The web login explicitly sends "doctor" or "therapist".
   This avoids guessing when one test email temporarily exists
   in both staff tables.
========================================================= */

export async function requestStaffLoginCodeService({
  email,
  centerId,
  role,
}: {
  email: string;
  centerId: string;
  role: StaffRole;
}) {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  if (role === "doctor") {
    return requestDoctorLoginCodeService({
      email:
        normalizedEmail,
      centerId,
    });
  }

  if (role === "therapist") {
    return requestTherapistLoginCodeService({
      email:
        normalizedEmail,
      centerId,
    });
  }

  throw new StaffAuthError(
    "Please select a valid professional role.",
    400,
  );
}

/* =========================================================
   VERIFY DOCTOR OTP + ACTIVATE ACCOUNT
========================================================= */

export async function verifyDoctorOtpService({
  email,
  token,
  centerId,
}: {
  email: string;
  token: string;
  centerId: string;
}) {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const doctor =
    await getDoctorByEmailService(
      normalizedEmail,
      centerId,
    );

  if (!doctor) {
    throw new StaffAuthError(
      "Invalid email or access code.",
      401,
    );
  }

  if (
    doctor.account_status ===
    "suspended"
  ) {
    throw new StaffAuthError(
      "This account is suspended. Please contact the therapy center.",
      403,
    );
  }

  validateAccessCodeWindow(
    doctor.access_code_sent_at,
  );

  const {
    data,
    error,
  } =
    await supabaseAuth.auth.verifyOtp({
      email:
        normalizedEmail,

      token:
        token.trim(),

      type:
        "email",
    });

  if (
    error ||
    !data.user ||
    !data.session
  ) {
    throw new StaffAuthError(
      error?.message ??
        "Invalid or expired access code.",
      401,
    );
  }

  if (
    doctor.auth_user_id &&
    doctor.auth_user_id !==
      data.user.id
  ) {
    throw new StaffAuthError(
      "This email is linked to a different authentication account. Please contact the center administrator.",
      409,
    );
  }

  const activeDoctor =
    await activateDoctorService({
      doctorId:
        doctor.id,

      centerId,

      authUserId:
        data.user.id,
    });

  return {
    doctor:
      activeDoctor,
    session:
      data.session,
  };
}

/* =========================================================
   VERIFY THERAPIST OTP + ACTIVATE ACCOUNT
========================================================= */

export async function verifyTherapistOtpService({
  email,
  token,
  centerId,
}: {
  email: string;
  token: string;
  centerId: string;
}) {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const therapist =
    await getTherapistByEmailService(
      normalizedEmail,
      centerId,
    );

  if (!therapist) {
    throw new StaffAuthError(
      "Invalid email or access code.",
      401,
    );
  }

  if (
    therapist.account_status ===
    "suspended"
  ) {
    throw new StaffAuthError(
      "This account is suspended. Please contact the therapy center.",
      403,
    );
  }

  validateAccessCodeWindow(
    therapist.access_code_sent_at,
  );

  const {
    data,
    error,
  } =
    await supabaseAuth.auth.verifyOtp({
      email:
        normalizedEmail,

      token:
        token.trim(),

      type:
        "email",
    });

  if (
    error ||
    !data.user ||
    !data.session
  ) {
    throw new StaffAuthError(
      error?.message ??
        "Invalid or expired access code.",
      401,
    );
  }

  if (
    therapist.auth_user_id &&
    therapist.auth_user_id !==
      data.user.id
  ) {
    throw new StaffAuthError(
      "This email is linked to a different authentication account. Please contact the center administrator.",
      409,
    );
  }

  const activeTherapist =
    await activateTherapistService({
      therapistId:
        therapist.id,

      centerId,

      authUserId:
        data.user.id,
    });

  return {
    therapist:
      activeTherapist,
    session:
      data.session,
  };
}

/* =========================================================
   VERIFY STAFF OTP BY SELECTED ROLE
========================================================= */

export async function verifyStaffOtpService({
  email,
  token,
  centerId,
  role,
}: {
  email: string;
  token: string;
  centerId: string;
  role: StaffRole;
}) {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (role === "doctor") {
    const result =
      await verifyDoctorOtpService({
        email: normalizedEmail,
        token,
        centerId,
      });

    const securityProfile =
      await getStaffSecurityRowById(
        "doctor",
        result.doctor.id,
        centerId,
      );

    const profile =
      securityProfile ??
      (result.doctor as unknown as StaffSecurityRow);

    return {
      role: "doctor" as const,
      profile,
      doctor: profile,
      therapist: null,
      requiresPasswordSetup:
        !profile.password_set_at,
      passwordSetAt:
        profile.password_set_at,
      session: result.session,
    };
  }

  if (role === "therapist") {
    const result =
      await verifyTherapistOtpService({
        email: normalizedEmail,
        token,
        centerId,
      });

    const securityProfile =
      await getStaffSecurityRowById(
        "therapist",
        result.therapist.id,
        centerId,
      );

    const profile =
      securityProfile ??
      (result.therapist as unknown as StaffSecurityRow);

    return {
      role: "therapist" as const,
      profile,
      doctor: null,
      therapist: profile,
      requiresPasswordSetup:
        !profile.password_set_at,
      passwordSetAt:
        profile.password_set_at,
      session: result.session,
    };
  }

  throw new StaffAuthError(
    "Please select a valid professional role.",
    400,
  );
}

/* =========================================================
   PASSWORD LOGIN
========================================================= */

export async function passwordLoginService({
  email,
  password,
  centerId,
  role,
}: {
  email: string;
  password: string;
  centerId: string;
  role: StaffRole;
}) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const profile =
    await getStaffSecurityRowByEmail(
      role,
      normalizedEmail,
      centerId,
    );

  if (!profile) {
    throw new StaffAuthError(
      "Invalid email or password.",
      401,
    );
  }

  assertStaffCanAuthenticate(profile);

  if (!profile.password_set_at) {
    throw new StaffAuthError(
      "This account has not completed first-time activation. Choose Activate account and verify the code sent to your email.",
      403,
    );
  }

  const {
    data,
    error,
  } = await supabaseAuth.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user || !data.session) {
    throw new StaffAuthError(
      "Invalid email or password.",
      401,
    );
  }

  if (
    profile.auth_user_id &&
    profile.auth_user_id !== data.user.id
  ) {
    throw new StaffAuthError(
      "This professional profile is linked to a different authentication account. Please contact the center administrator.",
      409,
    );
  }

  const now = new Date().toISOString();

  const {
    data: updatedProfile,
    error: updateError,
  } = await supabase
    .from(getStaffTable(role))
    .update({
      auth_user_id: data.user.id,
      account_status: "active",
      last_login_at: now,
    })
    .eq("id", profile.id)
    .eq("center_id", centerId)
    .select("*")
    .single();

  if (updateError) {
    throw new StaffAuthError(
      `Unable to update account login state: ${updateError.message}`,
      500,
    );
  }

  return {
    role,
    profile: updatedProfile as StaffSecurityRow,
    doctor:
      role === "doctor"
        ? (updatedProfile as StaffSecurityRow)
        : null,
    therapist:
      role === "therapist"
        ? (updatedProfile as StaffSecurityRow)
        : null,
    requiresPasswordSetup: false,
    passwordSetAt:
      (updatedProfile as StaffSecurityRow).password_set_at,
    session: data.session,
  };
}

/* =========================================================
   PASSWORD RECOVERY CODE

   This deliberately uses Supabase email OTP with
   shouldCreateUser=false. Verifying the one-time code creates
   a short-lived authenticated session that is used only to set
   a replacement password.
========================================================= */

export async function requestPasswordResetCodeService({
  email,
  centerId,
  role,
}: {
  email: string;
  centerId: string;
  role: StaffRole;
}) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const profile =
    await getStaffSecurityRowByEmail(
      role,
      normalizedEmail,
      centerId,
    );

  /* Generic acceptance prevents account enumeration. */
  if (!profile) {
    return { accepted: true };
  }

  assertStaffCanAuthenticate(profile);

  if (!profile.password_set_at) {
    throw new StaffAuthError(
      "This account has not completed first-time activation yet. Use Activate account instead.",
      409,
    );
  }

  const {
    error: otpError,
  } = await supabaseAuth.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: false,
    },
  });

  if (otpError) {
    throw new StaffAuthError(
      otpError.message,
      otpError.status ?? 400,
    );
  }

  const sentAt = new Date().toISOString();

  const {
    error: updateError,
  } = await supabase
    .from(getStaffTable(role))
    .update({
      password_reset_code_sent_at: sentAt,
    })
    .eq("id", profile.id)
    .eq("center_id", centerId);

  if (updateError) {
    throw new StaffAuthError(
      `Unable to record the password-reset request: ${updateError.message}`,
      500,
    );
  }

  return {
    accepted: true,
    sentAt,
  };
}

export async function verifyPasswordResetCodeService({
  email,
  token,
  centerId,
  role,
}: {
  email: string;
  token: string;
  centerId: string;
  role: StaffRole;
}) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const profile =
    await getStaffSecurityRowByEmail(
      role,
      normalizedEmail,
      centerId,
    );

  if (!profile || !profile.password_set_at) {
    throw new StaffAuthError(
      "Invalid email or verification code.",
      401,
    );
  }

  assertStaffCanAuthenticate(profile);
  validateResetCodeWindow(
    profile.password_reset_code_sent_at,
  );

  const {
    data,
    error,
  } = await supabaseAuth.auth.verifyOtp({
    email: normalizedEmail,
    token: token.trim(),
    type: "email",
  });

  if (error || !data.user || !data.session) {
    throw new StaffAuthError(
      error?.message ??
        "Invalid or expired verification code.",
      401,
    );
  }

  if (
    profile.auth_user_id &&
    profile.auth_user_id !== data.user.id
  ) {
    throw new StaffAuthError(
      "This professional profile is linked to a different authentication account. Please contact the center administrator.",
      409,
    );
  }

  return {
    role,
    profile,
    session: data.session,
  };
}

/* =========================================================
   AUTHENTICATED SECURITY STATUS
========================================================= */

export async function getStaffSecurityStatusService({
  role,
  profileId,
  centerId,
  accessToken,
}: {
  role: StaffRole;
  profileId: string;
  centerId: string;
  accessToken: string;
}) {
  const user =
    await verifyAccessToken(
      accessToken,
    );

  const profile =
    await getStaffSecurityRowById(
      role,
      profileId,
      centerId,
    );

  if (!profile) {
    throw new StaffAuthError(
      "Professional account not found.",
      404,
    );
  }

  assertStaffCanAuthenticate(profile);

  if (
    !profile.auth_user_id ||
    profile.auth_user_id !== user.id
  ) {
    throw new StaffAuthError(
      "This session does not belong to the selected professional account.",
      403,
    );
  }

  return {
    role,
    profileId: profile.id,
    email: profile.email,
    maskedEmail: maskEmail(profile.email),
    accountStatus: profile.account_status,
    passwordSetAt: profile.password_set_at,
    passwordChangedAt: profile.password_changed_at,
    requiresPasswordSetup:
      !profile.password_set_at,
  };
}

/* =========================================================
   RECORD A SUCCESSFUL PASSWORD UPDATE

   The password itself never reaches this backend. The browser
   updates the authenticated Supabase user directly, then this
   endpoint records only lifecycle metadata after validating the
   Supabase access token and matching auth_user_id.
========================================================= */

export async function recordPasswordUpdateService({
  role,
  profileId,
  centerId,
  accessToken,
  flow,
}: {
  role: StaffRole;
  profileId: string;
  centerId: string;
  accessToken: string;
  flow: PasswordUpdateFlow;
}) {
  const user =
    await verifyAccessToken(
      accessToken,
    );

  const profile =
    await getStaffSecurityRowById(
      role,
      profileId,
      centerId,
    );

  if (!profile) {
    throw new StaffAuthError(
      "Professional account not found.",
      404,
    );
  }

  assertStaffCanAuthenticate(profile);

  if (
    !profile.auth_user_id ||
    profile.auth_user_id !== user.id
  ) {
    throw new StaffAuthError(
      "This session does not belong to the selected professional account.",
      403,
    );
  }

  const now = new Date().toISOString();

  const updates: Record<string, string | null> = {
    password_changed_at: now,
  };

  if (!profile.password_set_at || flow === "initial") {
    updates.password_set_at =
      profile.password_set_at ?? now;
  }

  if (flow === "recovery") {
    updates.password_reset_code_sent_at = null;
  }

  const {
    data: updatedProfile,
    error,
  } = await supabase
    .from(getStaffTable(role))
    .update(updates)
    .eq("id", profileId)
    .eq("center_id", centerId)
    .select("*")
    .single();

  if (error) {
    throw new StaffAuthError(
      `Unable to record the password update: ${error.message}`,
      500,
    );
  }

  return {
    role,
    profile: updatedProfile as StaffSecurityRow,
    passwordSetAt:
      (updatedProfile as StaffSecurityRow).password_set_at,
    passwordChangedAt:
      (updatedProfile as StaffSecurityRow).password_changed_at,
    requiresPasswordSetup: false,
  };
}

/* =========================================================
   CLEAN UP DOCTOR AUTH USER WHEN CENTER REMOVES DOCTOR
========================================================= */

export async function deleteDoctorAuthUserIfPresent(
  doctor: DoctorRecord,
) {
  let authUserId =
    doctor.auth_user_id;

  if (
    !authUserId &&
    doctor.email
  ) {
    const authUser =
      await findAuthUserByEmail(
        doctor.email,
      );

    authUserId =
      authUser?.id ??
      null;
  }

  if (!authUserId) {
    return {
      deleted: false,
    };
  }

  const {
    error,
  } =
    await supabase.auth.admin.deleteUser(
      authUserId,
    );

  if (error) {
    return {
      deleted: false,
      warning:
        error.message,
    };
  }

  return {
    deleted: true,
  };
}
