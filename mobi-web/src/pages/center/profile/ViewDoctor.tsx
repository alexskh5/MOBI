import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  MailCheck,
  MoreHorizontal,
  Search,
  Send,
  Stethoscope,
  Trash2,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import CenterLayout from "../../../layouts/CenterLayout";
import {
  deleteDoctor,
  getDoctors,
  sendDoctorAccessCode,
  type DoctorAccountStatus,
  type DoctorRecord,
} from "../../../services/doctor/doctorApi";

type SortOption =
  | "newest"
  | "lastname-asc"
  | "lastname-desc"
  | "specialization-asc"
  | "specialization-desc";

type Notice = {
  type: "success" | "warning" | "error";
  message: string;
};

const ACCESS_CODE_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const DOCTORS_PER_PAGE = 10;

const Doctor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRecord | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [deletingDoctorId, setDeletingDoctorId] = useState<string | null>(null);
  const [sendingCodeDoctorId, setSendingCodeDoctorId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const state = location.state as { doctorNotice?: Notice } | null;

    if (state?.doctorNotice) {
      setNotice(state.doctorNotice);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDoctors() {
      try {
        setLoading(true);
        const result = await getDoctors();

        if (mounted) {
          setDoctors(result.doctors ?? []);
        }
      } catch (error: any) {
        if (mounted) {
          setNotice({
            type: "error",
            message:
              error?.response?.data?.message ||
              error?.message ||
              "Unable to load doctors.",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadDoctors();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = doctors.filter((doctor) => {
      if (!query) return true;

      return [
        doctor.first_name,
        doctor.middle_name,
        doctor.last_name,
        doctor.email,
        doctor.specialization,
        doctor.phone_number,
        doctor.account_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    return [...filtered].sort((a, b) => {
      if (sortOption === "lastname-asc") {
        return a.last_name.localeCompare(b.last_name);
      }

      if (sortOption === "lastname-desc") {
        return b.last_name.localeCompare(a.last_name);
      }

      if (sortOption === "specialization-asc") {
        return (a.specialization ?? "").localeCompare(b.specialization ?? "");
      }

      if (sortOption === "specialization-desc") {
        return (b.specialization ?? "").localeCompare(a.specialization ?? "");
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }, [doctors, searchQuery, sortOption]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDoctors.length / DOCTORS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentDoctors = filteredDoctors.slice(
    (currentPage - 1) * DOCTORS_PER_PAGE,
    currentPage * DOCTORS_PER_PAGE
  );

  const handleSendCode = async (doctor: DoctorRecord) => {
    try {
      setSendingCodeDoctorId(doctor.id);
      setNotice(null);

      const result = await sendDoctorAccessCode(doctor.id);

      setDoctors((current) =>
        current.map((item) =>
          item.id === doctor.id ? result.doctor : item
        )
      );

      setNotice({
        type: "success",
        message: result.message,
      });
    } catch (error: any) {
      setNotice({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to send access code.",
      });
    } finally {
      setSendingCodeDoctorId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoctor) return;

    try {
      setDeletingDoctorId(selectedDoctor.id);

      const result = await deleteDoctor(selectedDoctor.id);

      setDoctors((current) =>
        current.filter((item) => item.id !== selectedDoctor.id)
      );

      setNotice({
        type: "success",
        message: result.message,
      });

      setSelectedDoctor(null);
      setShowRemoveModal(false);
    } catch (error: any) {
      setNotice({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to remove doctor.",
      });
    } finally {
      setDeletingDoctorId(null);
    }
  };

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="min-h-full rounded-none bg-[#F8F5F9] p-4 font-sans sm:rounded-[26px] sm:p-6 lg:p-8">
          {/* PAGE HEADER */}
          <header className="mb-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex items-start gap-3">
                {!sidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
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

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Doctors
                    </h1>

                    <span className="rounded-full bg-[#F1E7F3] px-2.5 py-1 text-xs font-semibold text-[#82548C]">
                      {doctors.length}
                    </span>
                  </div>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                    Manage doctor profiles, account access, and temporary MOBI login codes.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 sm:w-[280px]">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search doctors..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#9B6BA4] focus:ring-4 focus:ring-[#9B6BA4]/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/center/profile/AddDoctor")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#82548C] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#704578]"
                >
                  <UserPlus size={17} />
                  Add Doctor
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/center/profile")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-11 sm:px-0"
                  aria-label="Back to center profile"
                >
                  <ArrowLeft size={17} />
                  <span className="sm:hidden">Back</span>
                </button>
              </div>
            </div>
          </header>

          {notice && (
            <NoticeBanner notice={notice} onClose={() => setNotice(null)} />
          )}

          {/* MAIN CARD */}
          <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5ECF6] text-[#82548C]">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Doctor Accounts
                    </h2>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      Access codes are valid in MOBI for 10 minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowSortMenu((current) => !current)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sort
                  <ChevronDown size={15} />
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 top-12 z-40 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
                    <SortOptionButton
                      label="Newest added"
                      onClick={() => {
                        setSortOption("newest");
                        setShowSortMenu(false);
                      }}
                    />
                    <SortOptionButton
                      label="Last name A–Z"
                      onClick={() => {
                        setSortOption("lastname-asc");
                        setShowSortMenu(false);
                      }}
                    />
                    <SortOptionButton
                      label="Last name Z–A"
                      onClick={() => {
                        setSortOption("lastname-desc");
                        setShowSortMenu(false);
                      }}
                    />
                    <SortOptionButton
                      label="Specialization A–Z"
                      onClick={() => {
                        setSortOption("specialization-asc");
                        setShowSortMenu(false);
                      }}
                    />
                    <SortOptionButton
                      label="Specialization Z–A"
                      onClick={() => {
                        setSortOption("specialization-desc");
                        setShowSortMenu(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <LoadingState text="Loading doctors..." />
            ) : currentDoctors.length === 0 ? (
              <EmptyState
                icon={<UserCheck size={27} />}
                title="No doctors found"
                description={
                  searchQuery
                    ? "Try a different search."
                    : "Add a doctor to create the first account."
                }
              />
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[960px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                        <th className="px-6 py-3.5">Doctor</th>
                        <th className="px-4 py-3.5">Email</th>
                        <th className="px-4 py-3.5">Specialization</th>
                        <th className="px-4 py-3.5">Access</th>
                        <th className="px-4 py-3.5">Invitation</th>
                        <th className="w-16 px-3 py-3.5" />
                      </tr>
                    </thead>

                    <tbody>
                      {currentDoctors.map((doctor) => {
                        const accessState = getAccessState(doctor, now);

                        return (
                          <tr
                            key={doctor.id}
                            className="border-b border-slate-100 transition last:border-b-0 hover:bg-[#FCF9FC]"
                          >
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/center/profile/doctors/${doctor.id}/EditDoctor`
                                  )
                                }
                                className="text-left"
                              >
                                <p className="font-semibold text-slate-900">
                                  {doctor.first_name}{" "}
                                  {doctor.middle_name
                                    ? `${doctor.middle_name} `
                                    : ""}
                                  {doctor.last_name}
                                </p>
                                <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                                  ID: {doctor.id}
                                </p>
                              </button>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-slate-400" />
                                {doctor.email}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                              {doctor.specialization || "—"}
                            </td>

                            <td className="px-4 py-4">
                              <StatusBadge status={doctor.account_status} />
                            </td>

                            <td className="px-4 py-4">
                              <InvitationControl
                                doctor={doctor}
                                accessState={accessState}
                                sending={sendingCodeDoctorId === doctor.id}
                                onSend={() => void handleSendCode(doctor)}
                              />
                            </td>

                            <td className="relative px-3 py-4 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenu(
                                    openMenu === doctor.id ? null : doctor.id
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                                aria-label="Doctor actions"
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              {openMenu === doctor.id && (
                                <ActionMenu
                                  onEdit={() =>
                                    navigate(
                                      `/center/profile/doctors/${doctor.id}/EditDoctor`
                                    )
                                  }
                                  onRemove={() => {
                                    setSelectedDoctor(doctor);
                                    setShowRemoveModal(true);
                                    setOpenMenu(null);
                                  }}
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE / TABLET CARDS */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {currentDoctors.map((doctor) => {
                    const accessState = getAccessState(doctor, now);

                    return (
                      <article key={doctor.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/center/profile/doctors/${doctor.id}/EditDoctor`
                              )
                            }
                            className="min-w-0 text-left"
                          >
                            <h3 className="truncate font-bold text-slate-900">
                              {doctor.first_name}{" "}
                              {doctor.middle_name
                                ? `${doctor.middle_name} `
                                : ""}
                              {doctor.last_name}
                            </h3>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {doctor.specialization || "No specialization"}
                            </p>
                          </button>

                          <StatusBadge status={doctor.account_status} />
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                          <p className="flex items-center gap-2 break-all text-sm text-slate-600">
                            <Mail size={14} className="shrink-0 text-slate-400" />
                            {doctor.email}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <InvitationControl
                            doctor={doctor}
                            accessState={accessState}
                            sending={sendingCodeDoctorId === doctor.id}
                            onSend={() => void handleSendCode(doctor)}
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/center/profile/doctors/${doctor.id}/EditDoctor`
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setShowRemoveModal(true);
                              }}
                              className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() =>
              setCurrentPage((current) => Math.max(1, current - 1))
            }
            onNext={() =>
              setCurrentPage((current) => Math.min(totalPages, current + 1))
            }
          />

          {showRemoveModal && selectedDoctor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
              <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Trash2 size={19} />
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    Remove doctor?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    This will remove{" "}
                    <strong className="text-slate-700">
                      {selectedDoctor.first_name} {selectedDoctor.last_name}
                    </strong>{" "}
                    from the Center and attempt to remove the linked authentication account.
                  </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <button
                    type="button"
                    disabled={deletingDoctorId === selectedDoctor.id}
                    onClick={() => setShowRemoveModal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={deletingDoctorId === selectedDoctor.id}
                    onClick={() => void handleDelete()}
                    className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                  >
                    {deletingDoctorId === selectedDoctor.id
                      ? "Removing..."
                      : "Remove Doctor"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </CenterLayout>
  );
};

function getAccessState(doctor: DoctorRecord, now: number) {
  if (!doctor.access_code_sent_at) {
    return {
      cooldownSeconds: 0,
      label: "No access code sent yet.",
    };
  }

  const sentAt = new Date(doctor.access_code_sent_at).getTime();
  const age = Math.max(0, now - sentAt);

  const cooldownSeconds = Math.max(
    0,
    Math.ceil((RESEND_COOLDOWN_MS - age) / 1000)
  );

  if (age >= ACCESS_CODE_EXPIRY_MS) {
    return {
      cooldownSeconds,
      label: "Previous code has expired.",
    };
  }

  const minutesLeft = Math.max(
    1,
    Math.ceil((ACCESS_CODE_EXPIRY_MS - age) / 60000)
  );

  return {
    cooldownSeconds,
    label: `Code valid for about ${minutesLeft} more min.`,
  };
}

function InvitationControl({
  doctor,
  accessState,
  sending,
  onSend,
}: {
  doctor: DoctorRecord;
  accessState: { cooldownSeconds: number; label: string };
  sending: boolean;
  onSend: () => void;
}) {
  if (doctor.account_status === "active") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
        <MailCheck size={15} />
        Account activated
      </div>
    );
  }

  if (doctor.account_status === "suspended") {
    return <span className="text-xs text-slate-400">Access disabled</span>;
  }

  return (
    <div>
      <button
        type="button"
        disabled={sending || accessState.cooldownSeconds > 0}
        onClick={onSend}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#D8C8DB] bg-white px-3 text-xs font-semibold text-[#74566F] transition hover:bg-[#F8F2F8] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={13} />
        {sending
          ? "Sending..."
          : accessState.cooldownSeconds > 0
            ? `Resend in ${accessState.cooldownSeconds}s`
            : doctor.account_status === "not_invited"
              ? "Send Invitation"
              : "Resend Access Code"}
      </button>

      <p className="mt-1.5 text-[11px] leading-4 text-slate-400">
        {accessState.label}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: DoctorAccountStatus }) {
  const config = {
    not_invited: {
      label: "Not Invited",
      classes: "bg-slate-100 text-slate-600",
    },
    invited: {
      label: "Invited",
      classes: "bg-[#F1EAF5] text-[#7456A3]",
    },
    active: {
      label: "Active",
      classes: "bg-emerald-50 text-emerald-700",
    },
    suspended: {
      label: "Suspended",
      classes: "bg-rose-50 text-rose-600",
    },
  }[status];

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

function NoticeBanner({
  notice,
  onClose,
}: {
  notice: Notice;
  onClose: () => void;
}) {
  const classes =
    notice.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : notice.type === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div
      className={`mb-5 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-medium ${classes}`}
    >
      <span>{notice.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 opacity-70 hover:opacity-100"
        aria-label="Close notice"
      >
        <X size={15} />
      </button>
    </div>
  );
}

function SortOptionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

function ActionMenu({
  onEdit,
  onRemove,
}: {
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="absolute right-8 top-12 z-50 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 text-left shadow-xl">
      <button
        type="button"
        onClick={onEdit}
        className="block w-full px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
      >
        Edit Doctor
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
      >
        <Trash2 size={13} />
        Remove
      </button>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="p-10 text-center text-sm text-slate-500">{text}</div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5ECF6] text-[#82548C]">
        {icon}
      </div>
      <h3 className="mt-3 font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-slate-500">
        Page {currentPage} of {totalPages}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={onPrevious}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={onNext}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Doctor;
