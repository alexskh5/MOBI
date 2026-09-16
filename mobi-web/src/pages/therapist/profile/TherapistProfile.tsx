import {
  CheckCircle2,
  Edit3,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import TherapistLayout from "../../../layouts/TherapistLayout";
import centerLogo from "../../../assets/centerLogo.png";
import coverPhoto from "../../../assets/coverPhoto.png";

import {
  getTherapistById,
  updateTherapist,
} from "../../../services/therapist/therapistApi";

/* =========================================================
   TYPES
========================================================= */

interface TherapistRecord {
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
  account_status:
    | "not_invited"
    | "invited"
    | "active"
    | "suspended";
  access_code_sent_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TherapistForm {
  firstName: string;
  middleName: string;
  lastName: string;
  specialization: string;
  phoneNumber: string;
  bio: string;
}

/* =========================================================
   HELPERS
========================================================= */

function createForm(
  therapist: TherapistRecord,
): TherapistForm {
  return {
    firstName:
      therapist.first_name ?? "",

    middleName:
      therapist.middle_name ?? "",

    lastName:
      therapist.last_name ?? "",

    specialization:
      therapist.specialization ?? "",

    phoneNumber:
      therapist.phone_number ?? "",

    bio:
      therapist.bio ?? "",
  };
}

function formatStatus(
  status: TherapistRecord["account_status"],
) {
  return status
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

/* =========================================================
   PAGE
========================================================= */

const TherapistProfile = () => {
  const navigate =
    useNavigate();

  const [
    therapist,
    setTherapist,
  ] =
    useState<TherapistRecord | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<TherapistForm>({
      firstName: "",
      middleName: "",
      lastName: "",
      specialization: "",
      phoneNumber: "",
      bio: "",
    });

  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  /* =======================================================
     LOAD REAL LOGGED-IN THERAPIST
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const role =
        localStorage.getItem(
          "mobi_staff_role",
        );

      const therapistId =
        localStorage.getItem(
          "mobi_staff_profile_id",
        );

      if (
        role !== "therapist" ||
        !therapistId
      ) {
        navigate(
          "/login",
          {
            replace: true,
          },
        );

        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const result =
          await getTherapistById(
            therapistId,
          );

        const record =
          result?.therapist as
            | TherapistRecord
            | undefined;

        if (!record) {
          throw new Error(
            "MOBI could not load the Therapist profile.",
          );
        }

        if (!mounted) {
          return;
        }

        setTherapist(record);
        setForm(
          createForm(record),
        );
      } catch (
        error: any
      ) {
        if (!mounted) {
          return;
        }

        setErrorMessage(
          error
            ?.response
            ?.data
            ?.message ||
          error?.message ||
          "Unable to load your Therapist profile.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const fullName =
    useMemo(() => {
      if (!therapist) {
        return "Therapist";
      }

      return [
        therapist.first_name,
        therapist.middle_name,
        therapist.last_name,
      ]
        .filter(Boolean)
        .join(" ");
    }, [therapist]);

  const updateField = (
    field: keyof TherapistForm,
    value: string,
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  };

  const handleCancel = () => {
    if (therapist) {
      setForm(
        createForm(therapist),
      );
    }

    setEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSave =
    async () => {
      if (!therapist) {
        return;
      }

      const firstName =
        form.firstName.trim();

      const lastName =
        form.lastName.trim();

      if (
        !firstName ||
        !lastName
      ) {
        setErrorMessage(
          "First name and last name are required.",
        );

        return;
      }

      try {
        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        /*
          Email is intentionally kept unchanged here.

          Therapist login is OTP-based and email is linked to
          Supabase Authentication. Changing it should be handled
          later as a dedicated account-email workflow instead of
          silently editing only the therapists table.
        */
        const result =
          await updateTherapist(
            therapist.id,
            {
              firstName,

              middleName:
                form.middleName.trim() ||
                null,

              lastName,

              email:
                therapist.email,

              specialization:
                form.specialization.trim() ||
                null,

              phoneNumber:
                form.phoneNumber.trim() ||
                null,

              bio:
                form.bio.trim() ||
                null,
            },
          );

        const updated =
          result?.therapist as
            | TherapistRecord
            | undefined;

        if (!updated) {
          throw new Error(
            "MOBI did not return the updated Therapist profile.",
          );
        }

        setTherapist(
          updated,
        );

        setForm(
          createForm(updated),
        );

        setEditing(false);

        setSuccessMessage(
          "Profile updated successfully.",
        );
      } catch (
        error: any
      ) {
        setErrorMessage(
          error
            ?.response
            ?.data
            ?.message ||
          error?.message ||
          "Unable to update your profile.",
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <TherapistLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div className="h-full overflow-auto rounded-[30px] bg-[#E4C9E5]/80 inter">
          {/* COVER */}
          <div className="relative h-56 w-full overflow-hidden rounded-t-[30px] sm:h-64">
            {!sidebarOpen && (
              <button
                type="button"
                aria-label="Open sidebar"
                className="absolute left-8 top-8 z-20 text-3xl"
                onClick={() =>
                  setSidebarOpen(
                    true,
                  )
                }
              >
                ☰
              </button>
            )}

            <img
              src={coverPhoto}
              alt=""
              className="h-full w-full object-cover opacity-25"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-[#E4C9E5]/35" />
          </div>

          <div className="px-5 pb-8 sm:px-8 lg:px-14">
            {loading ? (
              <div className="flex min-h-[430px] items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#7456A3]" />

                  <p className="mt-3 text-sm text-slate-600">
                    Loading your profile...
                  </p>
                </div>
              </div>
            ) : !therapist ? (
              <div className="flex min-h-[430px] items-center justify-center">
                <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                  <p className="font-semibold text-red-700">
                    Unable to load Therapist profile
                  </p>

                  <p className="mt-2 text-sm text-red-600">
                    {errorMessage ||
                      "Please sign in again."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* PROFILE HEADER */}
                <div className="-mt-16 relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                      {therapist.profile_picture_url?.startsWith(
                        "http",
                      ) ? (
                        <img
                          src={
                            therapist.profile_picture_url
                          }
                          alt={
                            fullName
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={
                            centerLogo
                          }
                          alt="MOBI"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="pb-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7456A3] shadow-sm">
                          Therapist Profile
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                            therapist.account_status ===
                            "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          {formatStatus(
                            therapist.account_status,
                          )}
                        </span>
                      </div>

                      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        {fullName}
                      </h1>

                      <p className="mt-1 text-sm text-slate-600">
                        {therapist.specialization ||
                          "Therapist"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pb-1">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={
                            handleCancel
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                          <X
                            size={16}
                          />
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            void handleSave()
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#7456A3] px-4 text-sm font-semibold text-white transition hover:bg-[#64498f] disabled:opacity-60"
                        >
                          {saving ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Save
                              size={16}
                            />
                          )}

                          {saving
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(
                            true,
                          );
                          setErrorMessage(
                            "",
                          );
                          setSuccessMessage(
                            "",
                          );
                        }}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#7456A3] px-4 text-sm font-semibold text-white transition hover:bg-[#64498f]"
                      >
                        <Edit3
                          size={16}
                        />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* MESSAGES */}
                {errorMessage && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2
                      size={17}
                    />
                    {successMessage}
                  </div>
                )}

                {/* CONTENT */}
                <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  {/* EDITABLE PROFILE DETAILS */}
                  <section className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
                    <div className="mb-5">
                      <h2 className="text-lg font-semibold text-slate-900">
                        Professional Information
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Information shown across the MOBI professional workspace.
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <ProfileField
                        label="First name"
                        value={
                          form.firstName
                        }
                        editing={
                          editing
                        }
                        onChange={(
                          value,
                        ) =>
                          updateField(
                            "firstName",
                            value,
                          )
                        }
                      />

                      <ProfileField
                        label="Middle name"
                        value={
                          form.middleName
                        }
                        editing={
                          editing
                        }
                        optional
                        onChange={(
                          value,
                        ) =>
                          updateField(
                            "middleName",
                            value,
                          )
                        }
                      />

                      <ProfileField
                        label="Last name"
                        value={
                          form.lastName
                        }
                        editing={
                          editing
                        }
                        onChange={(
                          value,
                        ) =>
                          updateField(
                            "lastName",
                            value,
                          )
                        }
                      />

                      <ProfileField
                        label="Specialization / role"
                        value={
                          form.specialization
                        }
                        editing={
                          editing
                        }
                        optional
                        onChange={(
                          value,
                        ) =>
                          updateField(
                            "specialization",
                            value,
                          )
                        }
                      />

                      <ProfileField
                        label="Phone number"
                        value={
                          form.phoneNumber
                        }
                        editing={
                          editing
                        }
                        optional
                        onChange={(
                          value,
                        ) =>
                          updateField(
                            "phoneNumber",
                            value,
                          )
                        }
                      />
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Professional bio
                      </label>

                      {editing ? (
                        <textarea
                          rows={5}
                          value={
                            form.bio
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              "bio",
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="Add a short professional bio..."
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-[#A884B1] focus:ring-4 focus:ring-[#F0E6F2]"
                        />
                      ) : (
                        <div className="min-h-[112px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                          {therapist.bio ||
                            "No professional bio added yet."}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ACCOUNT DETAILS */}
                  <section className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
                    <div className="mb-5">
                      <h2 className="text-lg font-semibold text-slate-900">
                        Account Access
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Login details managed by your MOBI center account.
                      </p>
                    </div>

                    <AccountRow
                      icon={
                        <Mail
                          size={17}
                        />
                      }
                      label="Registered email"
                      value={
                        therapist.email
                      }
                      note="Email changes require an account update through the center."
                    />

                    <AccountRow
                      icon={
                        <LockKeyhole
                          size={17}
                        />
                      }
                      label="Sign-in method"
                      value="Email and permanent password"
                      note="Email verification codes are used for first-time activation, password recovery, and sensitive password changes."
                    />

                    <AccountRow
                      icon={
                        <UserRound
                          size={17}
                        />
                      }
                      label="Account status"
                      value={
                        formatStatus(
                          therapist.account_status,
                        )
                      }
                    />

                    <AccountRow
                      icon={
                        <Phone
                          size={17}
                        />
                      }
                      label="Contact number"
                      value={
                        therapist.phone_number ||
                        "Not provided"
                      }
                      last
                    />

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/professional/security",
                        )
                      }
                      className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#DCCBE0] bg-[#F8F2F9] px-4 text-sm font-semibold text-[#7456A3] transition hover:bg-[#F1E7F3]"
                    >
                      <LockKeyhole size={16} />
                      Change Password
                    </button>
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </TherapistLayout>
  );
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ProfileField({
  label,
  value,
  editing,
  onChange,
  optional = false,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (
    value: string,
  ) => void;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
        {optional && (
          <span className="ml-1 font-normal normal-case tracking-normal text-slate-400">
            (optional)
          </span>
        )}
      </label>

      {editing ? (
        <input
          type="text"
          value={
            value
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target.value,
            )
          }
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#A884B1] focus:ring-4 focus:ring-[#F0E6F2]"
        />
      ) : (
        <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800">
          {value ||
            "Not provided"}
        </div>
      )}
    </div>
  );
}

function AccountRow({
  icon,
  label,
  value,
  note,
  last = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note?: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 py-4 ${
        last
          ? ""
          : "border-b border-slate-200"
      }`}
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F2EAF4] text-[#7456A3]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-800">
          {value}
        </p>

        {note && (
          <p className="mt-1 text-[11px] leading-4 text-slate-400">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

export default TherapistProfile;
