import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  Check,
  Edit3,
  Mail,
  Menu,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DocSidebar from "../../components/doctor/DocSidebar";
import {
  getDoctorById,
  updateDoctor,
  type DoctorFormPayload,
  type DoctorRecord,
} from "../../services/doctor/doctorApi";

function getDoctorFullName(doctor: DoctorRecord) {
  return [doctor.first_name, doctor.middle_name, doctor.last_name]
    .filter(Boolean)
    .join(" ");
}

function getDoctorInitials(doctor: DoctorRecord) {
  const first = doctor.first_name?.charAt(0) ?? "";
  const last = doctor.last_name?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || "DR";
}

function formatDateTime(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDate(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  }).format(date);
}

function getStatusLabel(status: DoctorRecord["account_status"]) {
  switch (status) {
    case "active":
      return "Active";
    case "invited":
      return "Invited";
    case "suspended":
      return "Suspended";
    default:
      return "Not Invited";
  }
}

function StatusBadge({ status }: { status: DoctorRecord["account_status"] }) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-full px-2.5 text-[10px] font-semibold ${
        active
          ? "bg-[#edf7f0] text-[#4f9467]"
          : status === "suspended"
            ? "bg-[#faf0f0] text-[#a75555]"
            : "bg-[#f3eff8] text-[#7456a3]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-[#4f9467]"
            : status === "suspended"
              ? "bg-[#a75555]"
              : "bg-[#7456a3]"
        }`}
      />
      {getStatusLabel(status)}
    </span>
  );
}

function ContactItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-[12px] border border-[#e8e8ed] bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f3eff8] text-[#7456a3]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#9898a3]">{label}</p>
        <p className="mt-1 break-words text-[13px] font-semibold leading-5 text-[#303038]">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[10px] border border-[#eeeef2] bg-[#fafafd] px-3.5 py-3.5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-white text-[#7456a3]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#9898a3]">
          {label}
        </p>
        <div className="mt-1 break-words text-[13px] font-medium leading-5 text-[#3f3f48]">
          {value}
        </div>
      </div>
    </div>
  );
}

function ProfileField({
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
      <span className="text-[12px] font-semibold text-[#555560]">
        {label}
        {required && <span className="ml-1 text-[#7456a3]">*</span>}
      </span>
      {children}
      {helper && (
        <span className="mt-1.5 block text-[10px] leading-4 text-[#9898a3]">
          {helper}
        </span>
      )}
    </label>
  );
}

function DocProfileScreen() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );

  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [form, setForm] = useState<DoctorFormPayload>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    specialization: "",
    phoneNumber: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [confirmSave, setConfirmSave] = useState(false);

  const fullName = useMemo(
    () => (doctor ? getDoctorFullName(doctor) : ""),
    [doctor],
  );

  useEffect(() => {
    let mounted = true;

    async function loadDoctorProfile() {
      try {
        setLoading(true);
        setLoadError("");

        const role = localStorage.getItem("mobi_staff_role");
        const doctorId = localStorage.getItem("mobi_staff_profile_id");

        if (role !== "doctor" || !doctorId) {
          navigate("/login", { replace: true });
          return;
        }

        const result = await getDoctorById(doctorId);
        if (!mounted) return;

        const record = result.doctor as DoctorRecord;
        if (!record) {
          throw new Error("Doctor profile was not returned by the server.");
        }

        setDoctor(record);
        setForm({
          firstName: record.first_name ?? "",
          middleName: record.middle_name ?? "",
          lastName: record.last_name ?? "",
          email: record.email ?? "",
          specialization: record.specialization ?? "",
          phoneNumber: record.phone_number ?? "",
          bio: record.bio ?? "",
        });
      } catch (error: any) {
        if (!mounted) return;
        setLoadError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load your doctor profile.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadDoctorProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const openEditModal = () => {
    if (!doctor) return;

    setForm({
      firstName: doctor.first_name ?? "",
      middleName: doctor.middle_name ?? "",
      lastName: doctor.last_name ?? "",
      email: doctor.email ?? "",
      specialization: doctor.specialization ?? "",
      phoneNumber: doctor.phone_number ?? "",
      bio: doctor.bio ?? "",
    });

    setSaveError("");
    setSaveMessage("");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setIsEditOpen(false);
    setConfirmSave(false);
    setSaveError("");
    setSaveMessage("");
  };

  const setField = (field: keyof DoctorFormPayload, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const requestSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setSaveError("First name, last name, and email address are required.");
      return;
    }

    setSaveError("");
    setConfirmSave(true);
  };

  const saveProfile = async () => {
    if (!doctor) return;

    try {
      setIsSaving(true);
      setSaveError("");
      setSaveMessage("");

      const result = await updateDoctor(doctor.id, {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        email: doctor.email,
        specialization: form.specialization.trim(),
        phoneNumber: form.phoneNumber.trim(),
        bio: form.bio.trim(),
      });

      const updated = result.doctor as DoctorRecord;
      setDoctor(updated);
      setForm({
        firstName: updated.first_name ?? "",
        middleName: updated.middle_name ?? "",
        lastName: updated.last_name ?? "",
        email: updated.email ?? "",
        specialization: updated.specialization ?? "",
        phoneNumber: updated.phone_number ?? "",
        bio: updated.bio ?? "",
      });

      setConfirmSave(false);
      setSaveMessage("Profile updated successfully.");

      window.setTimeout(() => {
        setIsEditOpen(false);
        setSaveMessage("");
      }, 700);
    } catch (error: any) {
      setConfirmSave(false);
      setSaveError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f9] font-professional">
        <div className="rounded-[14px] border border-[#e8e8ed] bg-white px-8 py-7 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#e4dced] border-t-[#7456a3]" />
          <p className="mt-4 text-[13px] font-semibold text-[#555560]">
            Loading your doctor profile...
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f9] px-4 font-professional">
        <div className="w-full max-w-md rounded-[14px] border border-[#edcece] bg-white p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#faf0f0] text-[#a75555]">
            <X size={19} />
          </div>
          <h1 className="mt-4 text-[18px] font-semibold text-[#202027]">
            Unable to load profile
          </h1>
          <p className="mt-2 text-[12px] leading-5 text-[#757580]">
            {loadError || "Your doctor account could not be found."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 min-h-[40px] rounded-[8px] bg-[#7456a3] px-4 text-[12px] font-semibold text-white transition hover:bg-[#5f4588]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9] font-professional text-[#202027]">
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          />
          <DocSidebar setSidebarOpen={setSidebarOpen} />
        </>
      )}

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-[10px] border border-[#e8e8ed] bg-white text-[#666672] transition hover:bg-[#f3eff8] hover:text-[#7456a3] lg:flex"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu size={19} />
        </button>
      )}

      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarOpen ? "lg:pl-[280px]" : "lg:pl-0"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e8e8ed] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#666672] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-[#202027]">
              My Profile
            </p>
            <p className="truncate text-[11px] text-[#9898a3]">
              Your verified MOBI account
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-[42px] lg:py-[35px]">
          <section className="mb-[30px]">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
              Doctor Workspace
            </span>
            <h1 className="text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-[#202027]">
              My Profile
            </h1>
            <p className="mt-2 max-w-[680px] text-[14px] leading-[1.65] text-[#757580]">
              View and manage the professional information connected to your verified MOBI doctor account.
            </p>
          </section>

          <section className="overflow-hidden rounded-[14px] border border-[#e8e8ed] bg-white">
            <div className="relative h-[118px] overflow-hidden bg-gradient-to-r from-[#e8d9ef] via-[#f5eef7] to-[#edf0f5] sm:h-[132px]">
              <div className="absolute -left-12 -top-20 h-52 w-52 rounded-full bg-white/40 blur-2xl" />
              <div className="absolute right-10 top-3 h-36 w-36 rounded-full bg-[#d8c7e4]/40 blur-2xl" />
            </div>

            <div className="px-5 pb-6 sm:px-6 lg:px-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="-mt-14 shrink-0">
                    <div className="flex h-[118px] w-[118px] items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-[#f3eff8] text-3xl font-bold text-[#7456a3] shadow-[0_4px_14px_rgba(31,25,39,0.12)] sm:h-[126px] sm:w-[126px]">
                      {doctor.profile_picture_url ? (
                        <img
                          src={doctor.profile_picture_url}
                          alt={fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{getDoctorInitials(doctor)}</span>
                      )}
                    </div>
                    <p className="mt-2.5 w-[126px] text-center text-[10px] leading-4 text-[#9898a3]">
                      Verified doctor account
                    </p>
                  </div>

                  <div className="min-w-0 pb-1 sm:pb-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="truncate text-[24px] font-bold tracking-[-0.02em] text-[#202027] sm:text-[27px]">
                        Dr. {fullName}
                      </h2>
                      <StatusBadge status={doctor.account_status} />
                    </div>

                    <p className="mt-1.5 text-[14px] font-semibold text-[#7456a3]">
                      {doctor.specialization || "Doctor"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#757580]">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={14} />
                        {doctor.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        MOBI Doctor Portal
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openEditModal}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 self-start rounded-[8px] bg-[#7456a3] px-4 text-[12px] font-semibold text-white transition hover:bg-[#5f4588] sm:self-end"
                >
                  <Edit3 size={15} />
                  Edit Profile
                </button>
              </div>

              <div className="mt-4 rounded-[9px] border border-[#eeeef2] bg-[#fafafd] px-3.5 py-3">
                <p className="text-[11px] leading-5 text-[#757580]">
                  The information on this page is loaded from the Doctor account created by your therapy center. Your login email remains linked to your MOBI authentication account.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ContactItem
                label="Contact Number"
                value={doctor.phone_number || "Not provided"}
                icon={<Phone size={18} />}
              />
              <ContactItem
                label="Email Address"
                value={doctor.email}
                icon={<Mail size={18} />}
              />
              <ContactItem
                label="Specialization"
                value={doctor.specialization || "Not provided"}
                icon={<Stethoscope size={18} />}
              />
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[14px] border border-[#e8e8ed] bg-white p-5 sm:p-6">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
                Professional Information
              </span>
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-[#202027]">
                Doctor Details
              </h2>
              <p className="mt-1.5 text-[12px] leading-5 text-[#757580]">
                Information currently stored in your MOBI doctor profile.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow
                  label="First Name"
                  value={doctor.first_name}
                  icon={<UserRound size={17} />}
                />
                <DetailRow
                  label="Last Name"
                  value={doctor.last_name}
                  icon={<UserRound size={17} />}
                />
                <DetailRow
                  label="Middle Name"
                  value={doctor.middle_name || "Not provided"}
                  icon={<UserRound size={17} />}
                />
                <DetailRow
                  label="Account Status"
                  value={<StatusBadge status={doctor.account_status} />}
                  icon={<ShieldCheck size={17} />}
                />
              </div>
            </article>

            <article className="rounded-[14px] border border-[#e8e8ed] bg-white p-5 sm:p-6">
              <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
                Account Activity
              </span>
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-[#202027]">
                MOBI Access
              </h2>
              <p className="mt-1.5 text-[12px] leading-5 text-[#757580]">
                Authentication and account activity recorded by MOBI.
              </p>

              <div className="mt-5 space-y-3">
                <DetailRow
                  label="Last Login"
                  value={formatDateTime(doctor.last_login_at)}
                  icon={<CalendarDays size={17} />}
                />
                <DetailRow
                  label="Account Created"
                  value={formatDate(doctor.created_at)}
                  icon={<CalendarDays size={17} />}
                />
                <DetailRow
                  label="Authentication"
                  value={
                    doctor.auth_user_id
                      ? "Linked to Supabase Auth"
                      : "Not yet linked"
                  }
                  icon={<ShieldCheck size={17} />}
                />
              </div>

              <button
                type="button"
                onClick={() => navigate("/professional/security")}
                className="mt-4 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#d9cce1] bg-[#faf7fc] px-4 text-[12px] font-semibold text-[#7456a3] transition hover:bg-[#f3eff8]"
              >
                <ShieldCheck size={15} />
                Change Password
              </button>
            </article>
          </section>

          <section className="mt-5 rounded-[14px] border border-[#e8e8ed] bg-white p-5 sm:p-6">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
              Professional Summary
            </span>
            <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-[#202027]">
              About the Doctor
            </h2>
            <p className="mt-4 max-w-5xl whitespace-pre-wrap text-[13px] leading-7 text-[#555560]">
              {doctor.bio || "No professional summary has been added yet."}
            </p>
          </section>
        </div>
      </main>

      {isEditOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-3 py-5 backdrop-blur-[2px] sm:px-5">
          <div
            className="flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[16px] border border-white/60 bg-white shadow-[0_22px_60px_rgba(31,25,39,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-label="Edit doctor profile"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eeeef2] px-5 py-5 sm:px-7">
              <div>
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
                  Profile Settings
                </span>
                <h2 className="text-[20px] font-semibold text-[#202027]">
                  Edit Doctor Profile
                </h2>
                <p className="mt-1.5 text-[12px] leading-5 text-[#757580]">
                  Update the professional details stored in your MOBI doctor account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#f6f6f8] text-[#71717a] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
                aria-label="Close profile editor"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={requestSave} className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-6 px-5 py-6 sm:px-7">
                <section>
                  <h3 className="text-[14px] font-semibold text-[#202027]">
                    Personal Information
                  </h3>
                  <p className="mt-1 text-[11px] text-[#9898a3]">
                    Your professional identity in MOBI.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ProfileField label="First Name" required>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(event) => setField("firstName", event.target.value)}
                        className="doctor-profile-input"
                        required
                      />
                    </ProfileField>

                    <ProfileField label="Middle Name">
                      <input
                        type="text"
                        value={form.middleName}
                        onChange={(event) => setField("middleName", event.target.value)}
                        className="doctor-profile-input"
                      />
                    </ProfileField>

                    <ProfileField label="Last Name" required>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(event) => setField("lastName", event.target.value)}
                        className="doctor-profile-input"
                        required
                      />
                    </ProfileField>

                    <ProfileField label="Specialization">
                      <input
                        type="text"
                        value={form.specialization}
                        onChange={(event) => setField("specialization", event.target.value)}
                        className="doctor-profile-input"
                      />
                    </ProfileField>
                  </div>
                </section>

                <div className="border-t border-[#eeeef2]" />

                <section>
                  <h3 className="text-[14px] font-semibold text-[#202027]">
                    Contact Information
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ProfileField
                      label="Email Address"
                      helper="Your login email is tied to your MOBI authentication account and cannot be changed here."
                    >
                      <input
                        type="email"
                        value={doctor.email}
                        readOnly
                        disabled
                        className="doctor-profile-input cursor-not-allowed opacity-70"
                      />
                    </ProfileField>

                    <ProfileField label="Contact Number">
                      <input
                        type="tel"
                        value={form.phoneNumber}
                        onChange={(event) => setField("phoneNumber", event.target.value)}
                        className="doctor-profile-input"
                      />
                    </ProfileField>
                  </div>
                </section>

                <div className="border-t border-[#eeeef2]" />

                <section>
                  <h3 className="text-[14px] font-semibold text-[#202027]">
                    Professional Summary
                  </h3>
                  <div className="mt-4">
                    <ProfileField
                      label="About the Doctor"
                      helper="Add a concise professional summary relevant to your role in MOBI."
                    >
                      <textarea
                        value={form.bio}
                        onChange={(event) => setField("bio", event.target.value)}
                        rows={6}
                        className="doctor-profile-textarea"
                      />
                    </ProfileField>
                  </div>
                </section>

                {saveError && (
                  <div className="rounded-[9px] border border-[#edcece] bg-[#faf0f0] px-3.5 py-3 text-[11px] font-medium leading-5 text-[#a75555]">
                    {saveError}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-3 border-t border-[#eeeef2] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                  {saveMessage && (
                    <p className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#4f9467]">
                      <Check size={15} />
                      {saveMessage}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={isSaving}
                    className="min-h-[40px] rounded-[8px] border border-[#e8e8ed] bg-white px-4 text-[12px] font-semibold text-[#666672] transition hover:bg-[#f7f7f9] disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="min-h-[40px] rounded-[8px] bg-[#7456a3] px-4 text-[12px] font-semibold text-white transition hover:bg-[#5f4588] disabled:cursor-wait disabled:opacity-60"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmSave && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-[3px]">
          <div className="w-full max-w-md overflow-hidden rounded-[16px] border border-white/60 bg-white shadow-[0_22px_60px_rgba(31,25,39,0.18)]">
            <div className="px-5 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#f3eff8] text-[#7456a3]">
                <Check size={17} />
              </div>
              <h2 className="mt-4 text-[18px] font-semibold text-[#202027]">
                Save Profile Changes?
              </h2>
              <p className="mt-2 text-[12px] leading-5 text-[#757580]">
                These changes will be saved to your real MOBI doctor account.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#eeeef2] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmSave(false)}
                disabled={isSaving}
                className="min-h-[40px] rounded-[8px] border border-[#e8e8ed] bg-white px-4 text-[12px] font-semibold text-[#666672] transition hover:bg-[#f7f7f9] disabled:opacity-60"
              >
                Review Again
              </button>

              <button
                type="button"
                onClick={() => void saveProfile()}
                disabled={isSaving}
                className="min-h-[40px] rounded-[8px] bg-[#7456a3] px-4 text-[12px] font-semibold text-white transition hover:bg-[#5f4588] disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .doctor-profile-input {
          margin-top: 0.5rem;
          height: 44px;
          width: 100%;
          border-radius: 9px;
          border: 1px solid #e8e8ed;
          background: #fafafd;
          padding: 0 13px;
          color: #202027;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }

        .doctor-profile-input:focus {
          border-color: #cfc4df;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(116, 86, 163, 0.08);
        }

        .doctor-profile-textarea {
          margin-top: 0.5rem;
          width: 100%;
          resize: vertical;
          border-radius: 10px;
          border: 1px solid #e8e8ed;
          background: #fafafd;
          padding: 12px 13px;
          color: #202027;
          font-size: 13px;
          line-height: 1.6;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }

        .doctor-profile-textarea:focus {
          border-color: #cfc4df;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(116, 86, 163, 0.08);
        }
      `}</style>
    </div>
  );
}

export default DocProfileScreen;
