import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  MoreHorizontal,
  Search,
  Send,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import CenterLayout from "../../../layouts/CenterLayout";
import {
  deleteTherapist,
  getTherapists,
  sendTherapistAccessCode,
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
  created_at: string;
  updated_at?: string;
};

type SortOption =
  | "newest"
  | "lastname-asc"
  | "lastname-desc"
  | "specialization-asc"
  | "specialization-desc";

const STAFF_PER_PAGE = 10;

const Staff = () => {
  const navigate = useNavigate();

  const [staffs, setStaffs] = useState<TherapistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] =
    useState<TherapistRecord | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [deletingStaffId, setDeletingStaffId] =
    useState<string | null>(null);
  const [sendingCodeStaffId, setSendingCodeStaffId] =
    useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    async function loadStaff() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getTherapists();

        if (mounted) {
          setStaffs(result.therapists ?? []);
        }
      } catch (error: any) {
        if (mounted) {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load staff."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadStaff();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = staffs.filter((staff) => {
      if (!query) return true;

      return [
        staff.first_name,
        staff.middle_name,
        staff.last_name,
        staff.email,
        staff.specialization,
        staff.phone_number,
        staff.account_status,
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
  }, [staffs, searchQuery, sortOption]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStaff.length / STAFF_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentStaff = filteredStaff.slice(
    (currentPage - 1) * STAFF_PER_PAGE,
    currentPage * STAFF_PER_PAGE
  );

  const handleSendCode = async (
    staff: TherapistRecord,
  ) => {
    try {
      setSendingCodeStaffId(staff.id);
      setErrorMessage("");
      setSuccessMessage("");
      setOpenMenu(null);

      const result =
        await sendTherapistAccessCode(
          staff.id,
        );

      setStaffs((current) =>
        current.map((item) =>
          item.id === staff.id
            ? result.therapist
            : item,
        ),
      );

      setSuccessMessage(
        result.message ||
          "Therapist access code sent successfully.",
      );
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to send therapist access code.",
      );
    } finally {
      setSendingCodeStaffId(null);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) {
      return;
    }

    try {
      setDeletingStaffId(selectedStaff.id);
      setErrorMessage("");
      setSuccessMessage("");

      const result =
        await deleteTherapist(
          selectedStaff.id,
        );

      setStaffs((current) =>
        current.filter(
          (staff) =>
            staff.id !==
            selectedStaff.id,
        ),
      );

      setSuccessMessage(
        result.message ||
          "Staff member removed successfully.",
      );

      setSelectedStaff(null);
      setShowRemoveModal(false);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to remove staff.",
      );
    } finally {
      setDeletingStaffId(null);
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
                      Staff
                    </h1>

                    <span className="rounded-full bg-[#F1E7F3] px-2.5 py-1 text-xs font-semibold text-[#82548C]">
                      {staffs.length}
                    </span>
                  </div>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                    Manage therapists and clinical staff connected to your MOBI center.
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
                    placeholder="Search staff..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#9B6BA4] focus:ring-4 focus:ring-[#9B6BA4]/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/center/profile/AddStaff")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#82548C] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#704578]"
                >
                  <UserPlus size={17} />
                  Add Staff
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

          {errorMessage && (
            <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="shrink-0 opacity-70 hover:opacity-100"
                aria-label="Close error"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <span>{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="shrink-0 opacity-70 hover:opacity-100"
                aria-label="Close success message"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* MAIN CARD */}
          <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5ECF6] text-[#82548C]">
                  <Users size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Therapist & Staff Directory
                  </h2>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    These records come from your real therapists table.
                  </p>
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
                      label="Role / specialization A–Z"
                      onClick={() => {
                        setSortOption("specialization-asc");
                        setShowSortMenu(false);
                      }}
                    />
                    <SortOptionButton
                      label="Role / specialization Z–A"
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
              <LoadingState text="Loading staff..." />
            ) : currentStaff.length === 0 ? (
              <EmptyState
                title="No staff found"
                description={
                  searchQuery
                    ? "Try a different search."
                    : "Add a therapist or staff member to create the first record."
                }
              />
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[1040px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                        <th className="px-6 py-3.5">Staff member</th>
                        <th className="px-4 py-3.5">Email</th>
                        <th className="px-4 py-3.5">Role / specialization</th>
                        <th className="px-4 py-3.5">Access</th>
                        <th className="px-4 py-3.5">Invitation</th>
                        <th className="w-16 px-3 py-3.5" />
                      </tr>
                    </thead>

                    <tbody>
                      {currentStaff.map((staff) => (
                        <tr
                          key={staff.id}
                          className="border-b border-slate-100 transition last:border-b-0 hover:bg-[#FCF9FC]"
                        >
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/center/profile/${staff.id}/EditStaff`
                                )
                              }
                              className="text-left"
                            >
                              <p className="font-semibold text-slate-900">
                                {staff.first_name}{" "}
                                {staff.middle_name
                                  ? `${staff.middle_name} `
                                  : ""}
                                {staff.last_name}
                              </p>
                              <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                                ID: {staff.id}
                              </p>
                            </button>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-slate-400" />
                              {staff.email}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {staff.specialization || "—"}
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge status={staff.account_status} />
                          </td>

                          <td className="px-4 py-4">
                            <InvitationControl
                              staff={staff}
                              isSending={sendingCodeStaffId === staff.id}
                              onSend={() => void handleSendCode(staff)}
                            />
                          </td>

                          <td className="relative px-3 py-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === staff.id ? null : staff.id
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                              aria-label="Staff actions"
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {openMenu === staff.id && (
                              <div className="absolute right-8 top-12 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 text-left shadow-xl">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/center/profile/${staff.id}/EditStaff`
                                    )
                                  }
                                  className="block w-full px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                  View / Edit Staff
                                </button>

                                {staff.account_status !== "active" &&
                                  staff.account_status !== "suspended" && (
                                    <button
                                      type="button"
                                      disabled={sendingCodeStaffId === staff.id}
                                      onClick={() => void handleSendCode(staff)}
                                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-[#7456A3] hover:bg-[#F8F3FA] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      <Send size={14} />
                                      {staff.account_status === "not_invited"
                                        ? "Send Invitation"
                                        : "Resend Access Code"}
                                    </button>
                                  )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStaff(staff);
                                    setShowRemoveModal(true);
                                    setOpenMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 size={14} />
                                  Remove Staff
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE / TABLET CARDS */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {currentStaff.map((staff) => (
                    <article key={staff.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-900">
                            {staff.first_name}{" "}
                            {staff.middle_name
                              ? `${staff.middle_name} `
                              : ""}
                            {staff.last_name}
                          </h3>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {staff.specialization || "No specialization"}
                          </p>
                        </div>

                        <StatusBadge status={staff.account_status} />
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <p className="flex items-center gap-2 break-all text-sm text-slate-600">
                          <Mail size={14} className="shrink-0 text-slate-400" />
                          {staff.email}
                        </p>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                          Invitation
                        </p>
                        <InvitationControl
                          staff={staff}
                          isSending={sendingCodeStaffId === staff.id}
                          onSend={() => void handleSendCode(staff)}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/center/profile/${staff.id}/EditStaff`)
                          }
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
                        >
                          View / Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setShowRemoveModal(true);
                          }}
                          className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
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

          {showRemoveModal && selectedStaff && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
              <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Trash2 size={19} />
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    Remove staff member?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    This will remove{" "}
                    <strong className="text-slate-700">
                      {selectedStaff.first_name}{" "}
                      {selectedStaff.middle_name
                        ? `${selectedStaff.middle_name} `
                        : ""}
                      {selectedStaff.last_name}
                    </strong>{" "}
                    from the Center. Their current learner assignments will also
                    be removed from the therapist assignment table.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={deletingStaffId === selectedStaff.id}
                    onClick={() => {
                      setShowRemoveModal(false);
                      setSelectedStaff(null);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={deletingStaffId === selectedStaff.id}
                    onClick={() => void handleDeleteStaff()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={15} />
                    {deletingStaffId === selectedStaff.id
                      ? "Removing..."
                      : "Remove Staff"}
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


function formatAccessCodeSentAt(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

function InvitationControl({
  staff,
  isSending,
  onSend,
}: {
  staff: TherapistRecord;
  isSending: boolean;
  onSend: () => void;
}) {
  if (staff.account_status === "active") {
    return (
      <div>
        <p className="text-xs font-semibold text-emerald-700">
          Account activated
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Therapist can sign in to MOBI.
        </p>
      </div>
    );
  }

  if (staff.account_status === "suspended") {
    return (
      <div>
        <p className="text-xs font-semibold text-rose-600">
          Account suspended
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Access codes cannot be sent.
        </p>
      </div>
    );
  }

  const sentAt =
    formatAccessCodeSentAt(
      staff.access_code_sent_at,
    );

  return (
    <div>
      <button
        type="button"
        disabled={isSending}
        onClick={onSend}
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-[#DECBE3] bg-white px-3 text-xs font-semibold text-[#7456A3] transition hover:bg-[#F8F3FA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={14} />
        {isSending
          ? "Sending..."
          : staff.account_status === "not_invited"
            ? "Send Invitation"
            : "Resend Access Code"}
      </button>

      <p className="mt-1.5 text-[11px] text-slate-400">
        {staff.account_status === "not_invited"
          ? "No access code sent yet."
          : sentAt
            ? `Last code sent ${sentAt}.`
            : "Invitation has been sent."}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: TherapistAccountStatus }) {
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

function LoadingState({ text }: { text: string }) {
  return (
    <div className="p-10 text-center text-sm text-slate-500">{text}</div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5ECF6] text-[#82548C]">
        <UserCheck size={27} />
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

export default Staff;
