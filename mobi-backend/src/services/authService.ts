import {
  supabaseAdmin,
  supabaseAuth,
} from "../config/supabase";

export type AuthRole =
  | "super_admin"
  | "center_admin"
  | "therapist"
  | "doctor"
  | "parent";

export type AuthUser = {
  id: string;
  actorId: string;
  role: AuthRole;
  email: string;
  firstName: string;
  lastName: string;
  centerId: string | null;
  centerName: string | null;
  accessToken: string;
  defaultWebRoute: string;
  defaultMobileRoute: "ChildDashboard" | "AdultDashboard";
};

export type LoginSurface = "web" | "mobile";

type AccountRow = {
  id: string;
  center_id: string;
  auth_user_id?: string | null;
  email: string;
  first_name: string;
  last_name: string;
  account_status?: string | null;
  is_active?: boolean | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isAccountAllowed(row: AccountRow) {
  if (row.is_active === false) {
    return false;
  }

  if (!row.account_status) {
    return true;
  }

  return row.account_status === "active";
}

function getDefaultWebRoute(role: AuthRole) {
  switch (role) {
    case "super_admin":
      return "/superadmin/SuperDashboardScreen";
    case "center_admin":
      return "/center/dashboard";
    case "therapist":
      return "/therapist/dashboard";
    case "doctor":
      return "/doctor/DocDashboardScreen";
    case "parent":
      return "/login";
  }
}

function getDefaultMobileRoute(role: AuthRole) {
  return role === "parent"
    ? "ChildDashboard"
    : "AdultDashboard";
}

async function getCenterName(centerId: string | null) {
  if (!centerId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("centers")
    .select("center_name")
    .eq("id", centerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.center_name ?? null;
}

async function findAccountInTable({
  table,
  authUserId,
  email,
}: {
  table: string;
  authUserId: string;
  email: string;
}) {
  const {
    data: accountByAuthId,
    error: authIdError,
  } = await supabaseAdmin
    .from(table)
    .select("*")
    .eq("auth_user_id", authUserId)
    .limit(1)
    .maybeSingle();

  if (authIdError) {
    throw new Error(authIdError.message);
  }

  if (accountByAuthId) {
    return accountByAuthId as AccountRow;
  }

  const {
    data: accountByEmail,
    error: emailError,
  } = await supabaseAdmin
    .from(table)
    .select("*")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  if (emailError) {
    throw new Error(emailError.message);
  }

  return accountByEmail as AccountRow | null;
}

async function findCenterAdminFallback(email: string) {
  const { data, error } = await supabaseAdmin
    .from("centers")
    .select("id, center_email, center_owner_name, center_name, is_active")
    .ilike("center_email", email)
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
    center_id: data.id,
    email: data.center_email,
    first_name: data.center_owner_name || data.center_name || "Center",
    last_name: "Admin",
    is_active: data.is_active,
  } satisfies AccountRow;
}

async function findRoleAccount({
  authUserId,
  email,
}: {
  authUserId: string;
  email: string;
}) {
  const roleTables: Array<{
    role: Exclude<AuthRole, "super_admin">;
    table: string;
  }> = [
    {
      role: "center_admin",
      table: "center_admins",
    },
    {
      role: "therapist",
      table: "therapists",
    },
    {
      role: "doctor",
      table: "doctors",
    },
    {
      role: "parent",
      table: "center_parents",
    },
  ];

  for (const entry of roleTables) {
    const account =
      entry.role === "center_admin"
        ? (await findAccountInTable({
            table: entry.table,
            authUserId,
            email,
          })) ?? (await findCenterAdminFallback(email))
        : await findAccountInTable({
            table: entry.table,
            authUserId,
            email,
          });

    if (account) {
      return {
        role: entry.role,
        account,
      };
    }
  }

  return null;
}

function isSuperAdmin(email: string) {
  const allowedEmails = (
    process.env.MOBI_SUPER_ADMIN_EMAILS ||
    process.env.MOBI_SUPER_ADMIN_EMAIL ||
    ""
  )
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  return allowedEmails.includes(email);
}

async function buildRoleAuthUser({
  authUserId,
  email,
  accessToken,
}: {
  authUserId: string;
  email: string;
  accessToken: string;
}) {
  if (isSuperAdmin(email)) {
    return {
      id: authUserId,
      actorId: authUserId,
      role: "super_admin",
      email,
      firstName: "Super",
      lastName: "Admin",
      centerId: null,
      centerName: null,
      accessToken,
      defaultWebRoute: getDefaultWebRoute("super_admin"),
      defaultMobileRoute: getDefaultMobileRoute("super_admin"),
    } satisfies AuthUser;
  }

  const roleAccount = await findRoleAccount({
    authUserId,
    email,
  });

  if (!roleAccount) {
    throw new Error("This login is not linked to a MOBI role yet.");
  }

  if (!isAccountAllowed(roleAccount.account)) {
    throw new Error("This MOBI account is not active yet.");
  }

  const centerName = await getCenterName(
    roleAccount.account.center_id,
  );

  return {
    id: roleAccount.account.id,
    actorId: roleAccount.account.id,
    role: roleAccount.role,
    email: roleAccount.account.email,
    firstName: roleAccount.account.first_name,
    lastName: roleAccount.account.last_name,
    centerId: roleAccount.account.center_id,
    centerName,
    accessToken,
    defaultWebRoute: getDefaultWebRoute(roleAccount.role),
    defaultMobileRoute: getDefaultMobileRoute(roleAccount.role),
  } satisfies AuthUser;
}

export async function getAuthUserFromAccessToken(
  accessToken: string,
) {
  const {
    data,
    error,
  } = await supabaseAdmin.auth.getUser(
    accessToken,
  );

  if (error || !data.user?.email) {
    throw new Error("A valid login session is required.");
  }

  return buildRoleAuthUser({
    authUserId: data.user.id,
    email: normalizeEmail(data.user.email),
    accessToken,
  });
}

export async function loginWithSupabasePassword({
  email,
  password,
  surface,
}: {
  email: string;
  password: string;
  surface: LoginSurface;
}) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user || !data.session?.access_token) {
    throw new Error(error?.message || "Invalid email or password.");
  }

  const user = await buildRoleAuthUser({
    authUserId: data.user.id,
    email: normalizedEmail,
    accessToken: data.session.access_token,
  });

  if (
    surface === "web" &&
    user.role === "parent"
  ) {
    throw new Error("Parent accounts can only log in on the mobile app.");
  }

  return user;
}
