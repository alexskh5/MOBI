import {
  supabaseAdmin,
} from "../../config/supabase";

export type CenterStaffRole = "therapist" | "doctor";

export interface StaffPayload {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  specialty: string;
  email: string;
  temporaryPassword?: string;
  phoneNumber?: string | null;
  bio?: string | null;
}

const ROLE_TABLES: Record<CenterStaffRole, string> = {
  therapist: "therapists",
  doctor: "doctors",
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getTableForRole(role: CenterStaffRole) {
  const table = ROLE_TABLES[role];

  if (!table) {
    throw new Error("Staff role must be therapist or doctor.");
  }

  return table;
}

function requireText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required.`);
  }

  return value.trim();
}

function validateBirthDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("A valid birthday is required.");
  }

  return value;
}

function mapStaffRow(row: Record<string, any>, role: CenterStaffRole) {
  return {
    id: row.id,
    role,
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    birthDate: row.birth_date ?? null,
    gender: row.gender ?? "",
    specialty: row.specialty ?? "",
    bio: row.bio ?? "",
    email: row.email ?? "",
    phoneNumber: row.phone_number ?? "",
    accountStatus: row.account_status ?? "active",
    isActive: row.is_active !== false,
    authUserId: row.auth_user_id ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

async function ensureUniqueEmail({
  centerId,
  role,
  email,
  excludingId,
}: {
  centerId: string;
  role: CenterStaffRole;
  email: string;
  excludingId?: string;
}) {
  for (const checkedRole of ["therapist", "doctor"] as const) {
    let query = supabaseAdmin
      .from(getTableForRole(checkedRole))
      .select("id")
      .eq("center_id", centerId)
      .ilike("email", email)
      .limit(1);

    if (excludingId && checkedRole === role) {
      query = query.neq("id", excludingId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      throw new Error("This email is already used by a center staff account.");
    }
  }
}

async function createAuthUser({
  email,
  temporaryPassword,
  role,
}: {
  email: string;
  temporaryPassword: string;
  role: CenterStaffRole;
}) {
  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        mobi_role: role,
      },
    });

  if (error || !data.user) {
    throw new Error(
      error?.message ??
        "Unable to create staff login account.",
    );
  }

  return data.user.id;
}

function buildStaffRecord({
  centerId,
  payload,
  authUserId,
}: {
  centerId: string;
  payload: StaffPayload;
  authUserId?: string;
}) {
  return {
    center_id: centerId,
    first_name: requireText(payload.firstName, "First name"),
    last_name: requireText(payload.lastName, "Last name"),
    birth_date: validateBirthDate(
      requireText(payload.birthDate, "Birthday"),
    ),
    gender: requireText(payload.gender, "Gender"),
    specialty: requireText(payload.specialty, "Specialty"),
    email: normalizeEmail(
      requireText(payload.email, "Email"),
    ),
    phone_number: payload.phoneNumber?.trim() || null,
    bio: payload.bio?.trim() || null,
    ...(authUserId ? { auth_user_id: authUserId } : {}),
    account_status: "active",
    is_active: true,
    invited_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function listCenterStaff({
  centerId,
  role,
}: {
  centerId: string;
  role: CenterStaffRole;
}) {
  const { data, error } = await supabaseAdmin
    .from(getTableForRole(role))
    .select("*")
    .eq("center_id", centerId)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapStaffRow(row, role),
  );
}

export async function createCenterStaff({
  centerId,
  role,
  payload,
}: {
  centerId: string;
  role: CenterStaffRole;
  payload: StaffPayload;
}) {
  const email = normalizeEmail(
    requireText(payload.email, "Email"),
  );
  const temporaryPassword = requireText(
    payload.temporaryPassword,
    "Temporary password",
  );

  await ensureUniqueEmail({
    centerId,
    role,
    email,
  });

  const authUserId = await createAuthUser({
    email,
    temporaryPassword,
    role,
  });

  const record = buildStaffRecord({
    centerId,
    payload: {
      ...payload,
      email,
    },
    authUserId,
  });

  const { data, error } = await supabaseAdmin
    .from(getTableForRole(role))
    .insert(record)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapStaffRow(data, role);
}

export async function updateCenterStaff({
  centerId,
  role,
  staffId,
  payload,
}: {
  centerId: string;
  role: CenterStaffRole;
  staffId: string;
  payload: Partial<StaffPayload> & {
    isActive?: boolean;
    accountStatus?: string;
  };
}) {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.firstName !== undefined) {
    updates.first_name = requireText(
      payload.firstName,
      "First name",
    );
  }

  if (payload.lastName !== undefined) {
    updates.last_name = requireText(
      payload.lastName,
      "Last name",
    );
  }

  if (payload.birthDate !== undefined) {
    updates.birth_date = validateBirthDate(
      requireText(payload.birthDate, "Birthday"),
    );
  }

  if (payload.gender !== undefined) {
    updates.gender = requireText(payload.gender, "Gender");
  }

  if (payload.specialty !== undefined) {
    updates.specialty = requireText(
      payload.specialty,
      "Specialty",
    );
  }

  if (payload.email !== undefined) {
    const email = normalizeEmail(
      requireText(payload.email, "Email"),
    );

    await ensureUniqueEmail({
      centerId,
      role,
      email,
      excludingId: staffId,
    });

    updates.email = email;
  }

  if (payload.phoneNumber !== undefined) {
    updates.phone_number =
      payload.phoneNumber?.trim() || null;
  }

  if (payload.bio !== undefined) {
    updates.bio = payload.bio?.trim() || null;
  }

  if (payload.isActive !== undefined) {
    updates.is_active = payload.isActive;
    updates.account_status = payload.isActive
      ? "active"
      : "inactive";
  }

  if (payload.accountStatus !== undefined) {
    updates.account_status =
      payload.accountStatus === "inactive"
        ? "inactive"
        : "active";
    updates.is_active = updates.account_status === "active";
  }

  const { data, error } = await supabaseAdmin
    .from(getTableForRole(role))
    .update(updates)
    .eq("id", staffId)
    .eq("center_id", centerId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Staff account was not found.");
  }

  return mapStaffRow(data, role);
}

export async function deactivateCenterStaff({
  centerId,
  role,
  staffId,
}: {
  centerId: string;
  role: CenterStaffRole;
  staffId: string;
}) {
  return updateCenterStaff({
    centerId,
    role,
    staffId,
    payload: {
      isActive: false,
      accountStatus: "inactive",
    },
  });
}
