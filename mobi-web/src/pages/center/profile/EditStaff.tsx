import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Save,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import CenterLayout from "../../../layouts/CenterLayout";
import {
  getTherapistById,
  updateTherapist,
  type CreateTherapistInput,
} from "../../../services/therapist/therapistApi";

type TherapistAccountStatus =
  | "not_invited"
  | "invited"
  | "active"
  | "suspended";

type TherapistRecord = {
  id: string;
  center_id: string;
  auth_user_id?: string | null;
  email: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  specialization?: string | null;
  phone_number?: string | null;
  profile_picture_url?: string | null;
  bio?: string | null;
  account_status: TherapistAccountStatus;
  access_code_sent_at?: string | null;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type StaffForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  specialization: string;
  phoneNumber: string;
  bio: string;
};

const EMPTY_FORM: StaffForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  specialization: "",
  phoneNumber: "",
  bio: "",
};

const EditStaff = () => {
  const navigate = useNavigate();
  const params = useParams();

  const therapistId =
    params.therapistId ??
    params.staffId ??
    params.id;

  const [therapist, setTherapist] =
    useState<TherapistRecord | null>(
      null,
    );

  const [form, setForm] =
    useState<StaffForm>(
      EMPTY_FORM,
    );

  const [loading, setLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    if (!therapistId) {
      setErrorMessage(
        "Staff ID is missing from the route.",
      );
      setLoading(false);
      return;
    }

    const currentTherapistId = therapistId

    let mounted = true;

    async function loadTherapist() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result =
          await getTherapistById(
            currentTherapistId,
          );

        if (!mounted) return;

        const record =
          result.therapist as TherapistRecord;

        setTherapist(record);

        setForm({
          firstName:
            record.first_name ?? "",
          middleName:
            record.middle_name ?? "",
          lastName:
            record.last_name ?? "",
          email:
            record.email ?? "",
          specialization:
            record.specialization ?? "",
          phoneNumber:
            record.phone_number ?? "",
          bio:
            record.bio ?? "",
        });
      } catch (error: any) {
        if (!mounted) return;

        setErrorMessage(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to load staff.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadTherapist();

    return () => {
      mounted = false;
    };
  }, [therapistId]);

  const setField = (
    field:
      keyof StaffForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!therapistId) {
        return;
      }

      if (
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.email.trim()
      ) {
        setErrorMessage(
          "First name, last name, and email are required.",
        );
        return;
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          form.email.trim(),
        )
      ) {
        setErrorMessage(
          "Please enter a valid email address.",
        );
        return;
      }

      try {
        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        const payload:
          CreateTherapistInput = {
            firstName:
              form.firstName.trim(),
            middleName:
              form.middleName.trim() ||
              null,
            lastName:
              form.lastName.trim(),
            email:
              form.email
                .trim()
                .toLowerCase(),
            specialization:
              form.specialization.trim() ||
              null,
            phoneNumber:
              form.phoneNumber.trim() ||
              null,
            bio:
              form.bio.trim() ||
              null,
          };

        const result =
          await updateTherapist(
            therapistId,
            payload,
          );

        setTherapist(
          result.therapist,
        );

        setSuccessMessage(
          "Staff information updated successfully.",
        );
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to update staff.",
        );
      } finally {
        setIsSaving(false);
      }
    };

  const fullName = [
    form.firstName,
    form.middleName,
    form.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <CenterLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div className="min-h-full rounded-none bg-[#F8F5F9] p-4 font-sans sm:rounded-[26px] sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {/* HEADER */}
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                {!sidebarOpen && (
                  <button
                    type="button"
                    onClick={() =>
                      setSidebarOpen(
                        true,
                      )
                    }
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-50"
                    aria-label="Open sidebar"
                  >
                    ☰
                  </button>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#82548C]">
                    Center Management
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Edit Staff
                  </h1>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Update therapist and staff information for your MOBI center.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/center/profile/staff",
                  )
                }
                className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back to Staff
              </button>
            </header>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
                Loading staff...
              </div>
            ) : errorMessage &&
              !therapist ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
                {errorMessage}
              </div>
            ) : (
              <form
                onSubmit={
                  handleSubmit
                }
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* PROFILE SUMMARY */}
                <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-[#FBF8FC] to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1E7F3] text-[#82548C]">
                      <UsersRound size={22} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-slate-900">
                        {fullName ||
                          "Staff Member"}
                      </h2>

                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {form.specialization ||
                          "No specialization set"}
                      </p>
                    </div>
                  </div>

                  {therapist && (
                    <StatusBadge
                      status={
                        therapist.account_status
                      }
                    />
                  )}
                </div>

                {/* FORM BODY */}
                <div className="p-5 sm:p-6">
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-slate-900">
                      Staff Information
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Edit profile details used across staff management and Collaboration.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field
                      label="First Name"
                      required
                    >
                      <div className="relative">
                        <UserRound
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={
                            form.firstName
                          }
                          onChange={(
                            event,
                          ) =>
                            setField(
                              "firstName",
                              event
                                .target
                                .value,
                            )
                          }
                          className="profile-input pl-10"
                          required
                        />
                      </div>
                    </Field>

                    <Field label="Middle Name">
                      <input
                        value={
                          form.middleName
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "middleName",
                            event
                              .target
                              .value,
                          )
                        }
                        className="profile-input"
                      />
                    </Field>

                    <Field
                      label="Last Name"
                      required
                    >
                      <input
                        value={
                          form.lastName
                        }
                        onChange={(
                          event,
                        ) =>
                          setField(
                            "lastName",
                            event
                              .target
                              .value,
                          )
                        }
                        className="profile-input"
                        required
                      />
                    </Field>

                    <Field label="Role / Specialization">
                      <div className="relative">
                        <UsersRound
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={
                            form.specialization
                          }
                          onChange={(
                            event,
                          ) =>
                            setField(
                              "specialization",
                              event
                                .target
                                .value,
                            )
                          }
                          className="profile-input pl-10"
                          placeholder="e.g. Speech Therapist"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Email Address"
                      helper="This email identifies the therapist account. Login access is managed separately from this form."
                      required
                    >
                      <div className="relative">
                        <Mail
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-[22px] -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="email"
                          value={
                            form.email
                          }
                          onChange={(
                            event,
                          ) =>
                            setField(
                              "email",
                              event
                                .target
                                .value,
                            )
                          }
                          className="profile-input pl-10"
                          required
                        />
                      </div>
                    </Field>

                    <Field label="Phone Number">
                      <div className="relative">
                        <Phone
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="tel"
                          value={
                            form.phoneNumber
                          }
                          onChange={(
                            event,
                          ) =>
                            setField(
                              "phoneNumber",
                              event
                                .target
                                .value,
                            )
                          }
                          className="profile-input pl-10"
                        />
                      </div>
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Bio">
                        <textarea
                          value={
                            form.bio
                          }
                          onChange={(
                            event,
                          ) =>
                            setField(
                              "bio",
                              event
                                .target
                                .value,
                            )
                          }
                          rows={5}
                          className="profile-input min-h-[130px] resize-y py-3"
                          placeholder="Add professional background or notes..."
                        />
                      </Field>
                    </div>
                  </div>

                  {/* ACCOUNT ACCESS INFO */}
                  <div className="mt-6 rounded-2xl border border-[#E7DCEA] bg-[#FBF8FC] p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Account access
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      No password is stored or managed on this page. Therapist login access will use MOBI's secure authentication flow.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {errorMessage}
                    </div>
                  )}

                  {successMessage && (
                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                      {successMessage}
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/center/profile/staff",
                      )
                    }
                    className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSaving
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#82548C] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#704578] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />

                    {isSaving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <style>{`
            .profile-input {
              width: 100%;
              min-height: 44px;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              background: #ffffff;
              padding: 10px 12px;
              color: #1e293b;
              font-size: 14px;
              outline: none;
              transition: border-color 0.18s ease, box-shadow 0.18s ease;
            }

            .profile-input::placeholder {
              color: #94a3b8;
            }

            .profile-input:focus {
              border-color: #9B6BA4;
              box-shadow: 0 0 0 4px rgba(155, 107, 164, 0.10);
            }
          `}</style>
        </div>
      )}
    </CenterLayout>
  );
};

function Field({
  label,
  helper,
  required = false,
  children,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </span>

      {children}

      {helper && (
        <span className="mt-1.5 block text-xs leading-5 text-slate-500">
          {helper}
        </span>
      )}
    </label>
  );
}

function StatusBadge({
  status,
}: {
  status: TherapistAccountStatus;
}) {
  const config = {
    not_invited: {
      label: "Not Invited",
      classes:
        "bg-slate-100 text-slate-600",
    },
    invited: {
      label: "Invited",
      classes:
        "bg-[#F1EAF5] text-[#7456A3]",
    },
    active: {
      label: "Active",
      classes:
        "bg-emerald-50 text-emerald-700",
    },
    suspended: {
      label: "Suspended",
      classes:
        "bg-rose-50 text-rose-600",
    },
  }[status];

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

export default EditStaff;
