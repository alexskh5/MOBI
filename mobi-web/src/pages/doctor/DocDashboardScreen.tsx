import {
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  MessageCircleMore,
  Search,
  SlidersHorizontal,
  UserRound,
  Users,
  X,
} from "lucide-react";
import DocSidebar from "../../components/doctor/DocSidebar";
import {
  doctorPatients,
  getDoctorPatientFullName,
  type DoctorPatient,
  type PatientStatus,
} from "../../data/doctorPatients";

type StatusFilter = "all" | PatientStatus;

interface SummaryCardProps {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
  tone: "purple" | "green" | "orange";
}

function SummaryCard({
  label,
  value,
  description,
  icon,
  tone,
}: SummaryCardProps) {
  const toneClasses = {
    purple: {
      icon: "bg-[#f3eff8] text-[#7456a3]",
    },
    green: {
      icon: "bg-[#edf7f0] text-[#4f9467]",
    },
    orange: {
      icon: "bg-[#fff5eb] text-[#bd7a38]",
    },
  };

  return (
    <article className="min-h-[136px] rounded-[14px] border border-[#e8e8ed] bg-white p-5 transition hover:-translate-y-px hover:border-[#dedce4]">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] ${toneClasses[tone].icon}`}
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-[#757580]">{label}</span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <strong className="text-[28px] font-bold leading-none tracking-[-0.02em] text-[#202027]">
          {value}
        </strong>

        <p className="max-w-[155px] text-right text-[10px] leading-[1.45] text-[#9898a3]">
          {description}
        </p>
      </div>
    </article>
  );
}

function PatientAvatar({
  patient,
  large = false,
}: {
  patient: DoctorPatient;
  large?: boolean;
}) {
  const initials =
    `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();

  const sizeClass = large
    ? "h-12 w-12 text-sm"
    : "h-9 w-9 text-[10px]";

  if (patient.profilePicture) {
    return (
      <img
        src={patient.profilePicture}
        alt={getDoctorPatientFullName(patient)}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#f3eff8] font-bold text-[#7456a3]`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: PatientStatus }) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex min-h-[27px] items-center gap-1.5 rounded-full px-2.5 text-[9px] font-semibold ${
        active
          ? "bg-[#edf7f0] text-[#4f9467]"
          : "bg-[#f3f3f5] text-[#777781]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#4f9467]" : "bg-[#9a9aa3]"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function DocDashboardScreen() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );

  // Static for now. Later, replace this with GET /doctor/patients.
  const [patients] = useState<DoctorPatient[]>(doctorPatients);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return patients
      .filter((patient) => {
        const matchesStatus =
          statusFilter === "all" || patient.status === statusFilter;

        const searchableContent = [
          getDoctorPatientFullName(patient),
          patient.learnerCode,
          patient.guardianName,
          patient.speechLevel,
          patient.diagnosis,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          normalizedSearch.length === 0 ||
          searchableContent.includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      })
      .sort((firstPatient, secondPatient) =>
        getDoctorPatientFullName(firstPatient).localeCompare(
          getDoctorPatientFullName(secondPatient),
        ),
      );
  }, [patients, searchTerm, statusFilter]);

  const activePatients = patients.filter(
    (patient) => patient.status === "active",
  ).length;

  const conversationPatients = patients.filter(
    (patient) => patient.speechLevel === "Conversation",
  ).length;

  const openPatientProgress = (patient: DoctorPatient) => {
    navigate(`/doctor/patients/${patient.id}`);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

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
        {/* MOBILE HEADER */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e8e8ed] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#666672] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-sm font-semibold text-[#202027]">
              My Patients
            </p>
            <p className="text-[10px] text-[#9898a3]">
              Doctor workspace
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-[42px] lg:py-[35px]">
          {/* PAGE HEADER */}
          <section className="mb-[30px]">
            <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-[#7456a3]">
              Doctor Workspace
            </span>

            <h1 className="m-0 text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-[#202027]">
              My Patients
            </h1>

            <p className="mt-2 max-w-[650px] text-[13px] leading-[1.6] text-[#757580]">
              Review the learners assigned to you and access their speech
              training and early social readiness progress.
            </p>
          </section>

          {/* SUMMARY */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              label="Total Patients"
              value={patients.length}
              description="All learners currently assigned to your account"
              icon={<Users size={20} />}
              tone="purple"
            />

            <SummaryCard
              label="Active Patients"
              value={activePatients}
              description="Learners currently receiving intervention"
              icon={<CheckCircle2 size={20} />}
              tone="green"
            />

            <SummaryCard
              label="Social Readiness"
              value={conversationPatients}
              description="Learners currently at conversation level"
              icon={<MessageCircleMore size={20} />}
              tone="orange"
            />
          </section>

          {/* PATIENT PANEL */}
          <section className="mt-6 overflow-hidden rounded-[14px] border border-[#e8e8ed] bg-white">
            {/* PANEL HEADER */}
            <div className="flex flex-col gap-4 border-b border-[#eeeef2] px-5 py-[21px] xl:flex-row xl:items-center xl:justify-between">
              <div>
                <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-[#7456a3]">
                  Assigned Learners
                </span>

                <h2 className="m-0 text-[18px] font-semibold tracking-[-0.015em] text-[#202027]">
                  Patient List
                </h2>

                <p className="mt-1.5 text-[11px] leading-[1.5] text-[#757580]">
                  {filteredPatients.length}{" "}
                  {filteredPatients.length === 1
                    ? "patient matches"
                    : "patients match"}{" "}
                  your current filters.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2.5 sm:flex-row xl:w-auto">
                <div className="relative w-full sm:min-w-[300px] xl:w-[340px]">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a3]"
                  />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search patient, guardian, level..."
                    className="h-[38px] w-full rounded-[9px] border border-[#e8e8ed] bg-[#fafafd] pl-9 pr-3 text-[11px] text-[#202027] outline-none transition placeholder:text-[#aaa9b3] focus:border-[#cfc4df] focus:bg-white"
                  />
                </div>

                <div className="relative">
                  <SlidersHorizontal
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a3]"
                  />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as StatusFilter,
                      )
                    }
                    className="h-[38px] min-w-[145px] appearance-none rounded-[9px] border border-[#e8e8ed] bg-[#fafafd] pl-9 pr-8 text-[11px] font-medium text-[#666672] outline-none transition focus:border-[#cfc4df] focus:bg-white"
                  >
                    <option value="all">All patients</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#f3eff8] text-[#7456a3]">
                  <Users size={21} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#202027]">
                  No patients found
                </h3>

                <p className="mt-1.5 max-w-md text-[11px] leading-5 text-[#757580]">
                  No assigned patient matches the current search or
                  status filter.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 min-h-[36px] rounded-[8px] border border-[#ded8e8] bg-white px-3.5 text-[10px] font-semibold text-[#7456a3] transition hover:bg-[#f3eff8]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                      <tr className="bg-[#fafafd] text-left">
                        {[
                          "Patient",
                          "Age",
                          "Current Level",
                          "Guardian",
                          "Last Session",
                          "Status",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-3 text-[9px] font-bold uppercase tracking-[0.07em] text-[#9898a3]"
                          >
                            {heading}
                          </th>
                        ))}

                        <th className="px-5 py-3 text-right text-[9px] font-bold uppercase tracking-[0.07em] text-[#9898a3]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr
                          key={patient.id}
                          className="border-t border-[#eeeef2] transition hover:bg-[#faf9fc]"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <PatientAvatar patient={patient} />

                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openPatientProgress(patient)
                                  }
                                  className="block max-w-[220px] truncate text-left text-[11px] font-semibold text-[#202027] transition hover:text-[#7456a3]"
                                >
                                  {getDoctorPatientFullName(patient)}
                                </button>

                                <p className="mt-1 text-[9px] text-[#9898a3]">
                                  {patient.learnerCode}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 text-[10px] text-[#757580]">
                            {patient.age} years
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="inline-flex rounded-[6px] bg-[#f3eff8] px-2 py-1 text-[9px] font-semibold text-[#7456a3]">
                              {patient.speechLevel}
                            </span>
                          </td>

                          <td className="max-w-[190px] px-5 py-3.5 text-[10px] text-[#757580]">
                            <span className="block truncate">
                              {patient.guardianName}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-[10px] text-[#757580]">
                            {patient.lastSession ?? "No session yet"}
                          </td>

                          <td className="px-5 py-3.5">
                            <StatusBadge status={patient.status} />
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                openPatientProgress(patient)
                              }
                              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-[8px] border border-[#ded8e8] bg-white px-2.5 text-[9px] font-semibold text-[#7456a3] transition hover:border-[#cfc4df] hover:bg-[#f3eff8]"
                            >
                              View Progress
                              <ArrowRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="divide-y divide-[#eeeef2] md:hidden">
                  {filteredPatients.map((patient) => (
                    <article
                      key={patient.id}
                      className="p-4 transition hover:bg-[#faf9fc]"
                    >
                      <div className="flex items-start gap-3">
                        <PatientAvatar patient={patient} large />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  openPatientProgress(patient)
                                }
                                className="block max-w-full truncate text-left text-sm font-semibold text-[#202027] transition hover:text-[#7456a3]"
                              >
                                {getDoctorPatientFullName(patient)}
                              </button>

                              <p className="mt-1 text-[9px] text-[#9898a3]">
                                {patient.learnerCode} • {patient.age} years
                                old
                              </p>
                            </div>

                            <StatusBadge status={patient.status} />
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2.5">
                            <div className="rounded-[10px] border border-[#eeeef2] bg-[#fafafd] p-3">
                              <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#9898a3]">
                                Current Level
                              </p>

                              <p className="mt-1 truncate text-[10px] font-semibold text-[#5f4588]">
                                {patient.speechLevel}
                              </p>
                            </div>

                            <div className="rounded-[10px] border border-[#eeeef2] bg-[#fafafd] p-3">
                              <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#9898a3]">
                                Last Session
                              </p>

                              <p className="mt-1 truncate text-[10px] font-semibold text-[#666672]">
                                {patient.lastSession ?? "No session"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2.5 rounded-[10px] border border-[#eeeef2] bg-white p-3">
                            <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#9898a3]">
                              Guardian
                            </p>

                            <p className="mt-1 truncate text-[10px] font-medium text-[#666672]">
                              {patient.guardianName}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openPatientProgress(patient)
                            }
                            className="mt-3 inline-flex min-h-[36px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#7456a3] px-4 text-[10px] font-semibold text-white transition hover:bg-[#5f4588] active:translate-y-px"
                          >
                            View Patient Progress
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* SMALL CONTEXT NOTE */}
          <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-[#e8e8ed] bg-white px-3.5 py-3 text-[#757580]">
            <UserRound
              size={15}
              className="mt-0.5 shrink-0 text-[#7456a3]"
            />

            <p className="m-0 text-[9px] leading-[1.55]">
              Patient access is limited to learners currently assigned to
              your doctor account.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocDashboardScreen;
