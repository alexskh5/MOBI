import { api } from "../api";

export type StaffRole =
  | "doctor"
  | "therapist";

export type StaffAccountStatus =
  | "not_invited"
  | "invited"
  | "active"
  | "suspended";

export type PasswordUpdateFlow =
  | "initial"
  | "recovery"
  | "change";

export interface StaffProfile {
  id: string;
  center_id?: string;
  auth_user_id?: string | null;
  email: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  specialization?: string | null;
  phone_number?: string | null;
  profile_picture_url?: string | null;
  bio?: string | null;
  account_status: StaffAccountStatus;
  access_code_sent_at?: string | null;
  last_login_at?: string | null;
  password_set_at?: string | null;
  password_changed_at?: string | null;
  password_reset_code_sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StaffSessionResponse {
  success: true;
  message: string;
  role: StaffRole;
  profile: StaffProfile;
  doctor?: StaffProfile | null;
  therapist?: StaffProfile | null;
  requiresPasswordSetup?: boolean;
  passwordSetAt?: string | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
    expires_in?: number;
    token_type?: string;
  };
}

export interface StaffSecurityStatus {
  role: StaffRole;
  profileId: string;
  email: string;
  maskedEmail: string;
  accountStatus: StaffAccountStatus;
  passwordSetAt: string | null;
  passwordChangedAt: string | null;
  requiresPasswordSetup: boolean;
}

export async function passwordLogin(
  email: string,
  password: string,
  role: StaffRole,
) {
  const response = await api.post(
    "/staff-auth/password-login",
    {
      email,
      password,
      role,
    },
  );

  return response.data as StaffSessionResponse;
}

export async function verifyStaffOtp(
  email: string,
  code: string,
  role: StaffRole,
) {
  const response = await api.post(
    "/staff-auth/verify-otp",
    {
      email,
      code,
      role,
    },
  );

  return response.data as StaffSessionResponse;
}

export async function requestStaffLoginCode(
  email: string,
  role: StaffRole,
) {
  const response = await api.post(
    "/staff-auth/request-code",
    {
      email,
      role,
    },
  );

  return response.data as {
    success: boolean;
    message: string;
  };
}

export async function requestPasswordResetCode(
  email: string,
  role: StaffRole,
) {
  const response = await api.post(
    "/staff-auth/request-password-reset",
    {
      email,
      role,
    },
  );

  return response.data as {
    success: boolean;
    message: string;
  };
}

export async function verifyPasswordResetCode(
  email: string,
  code: string,
  role: StaffRole,
) {
  const response = await api.post(
    "/staff-auth/verify-password-reset",
    {
      email,
      code,
      role,
    },
  );

  return response.data as StaffSessionResponse;
}

export async function getStaffSecurityStatus(
  role: StaffRole,
  profileId: string,
  accessToken: string,
) {
  const response = await api.get(
    "/staff-auth/security-status",
    {
      params: {
        role,
        profileId,
      },
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    },
  );

  return response.data as {
    success: true;
    security: StaffSecurityStatus;
  };
}

export async function recordPasswordUpdate(
  role: StaffRole,
  profileId: string,
  flow: PasswordUpdateFlow,
  accessToken: string,
) {
  const response = await api.post(
    "/staff-auth/password-updated",
    {
      role,
      profileId,
      flow,
    },
    {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    },
  );

  return response.data as {
    success: true;
    message: string;
    role: StaffRole;
    passwordSetAt: string | null;
    passwordChangedAt: string | null;
    requiresPasswordSetup: false;
  };
}
