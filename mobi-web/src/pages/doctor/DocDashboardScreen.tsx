import {
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import DocSidebar from "../../components/doctor/DocSidebar";
import {
  doctorPatients,
  getDoctorPatientFullName,
  type DoctorPatient,
  type PatientStatus,
} from "../../data/doctorPatients";

type StatusFilter = "all" | PatientStatus;

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-4-4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="7" r="2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 14h1a4 4 0 0 1 4 4v3" />
    </svg>
  );
}

function ActiveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 12 2.5 2.5L16.5 9" />
    </svg>
  );
}

function SpeechIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 1 1-4-7.2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 3v6h-6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 8h5M8 16h4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
}

function SummaryCard({
  label,
  value,
  description,
  icon,
}: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-[#eae5ef] bg-white p-5 shadow-[0_8px_28px_rgba(49,34,71,0.045)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#332a3d]">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0e9f8] text-[#7f55b7]">
          {icon}
        </div>
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
    ? "h-14 w-14 text-base"
    : "h-11 w-11 text-sm";

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
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#ebe1f7] font-bold text-[#7549ad]`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: PatientStatus }) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
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

  return (
    <div className="min-h-screen bg-[#f7f5fa] font-professional">
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
          className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-xl border border-[#e5deeb] bg-white text-slate-600 shadow-md transition hover:bg-[#f3eef9] hover:text-[#8257bd] lg:flex"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <MenuIcon />
        </button>
      )}

      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarOpen ? "lg:pl-[280px]" : "lg:pl-0"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#ebe6f1] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-[#f1ebf8] hover:text-[#7549ad]"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>

          <div>
            <p className="text-sm font-bold text-[#342b3f]">
              My Patients
            </p>
            <p className="text-xs text-slate-400">Doctor dashboard</p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
          <section className="mb-7">
            <p className="font-accent mb-2 text-sm font-semibold text-[#8257bd]">
              Doctor workspace
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#302738] sm:text-3xl">
              My Patients
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View the learners assigned to you and access their speech
              training and social readiness progress.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              label="Total patients"
              value={patients.length}
              description="All learners currently assigned to you"
              icon={<UsersIcon />}
            />

            <SummaryCard
              label="Active patients"
              value={activePatients}
              description="Learners currently receiving intervention"
              icon={<ActiveIcon />}
            />

            <SummaryCard
              label="Social readiness"
              value={conversationPatients}
              description="Learners currently at conversation level"
              icon={<SpeechIcon />}
            />
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-[#e9e3ee] bg-white shadow-[0_10px_34px_rgba(50,35,72,0.045)]">
            <div className="border-b border-[#eee9f2] p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#332a3d]">
                    Patient list
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredPatients.length}{" "}
                    {filteredPatients.length === 1
                      ? "patient found"
                      : "patients found"}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                  <div className="relative w-full sm:min-w-[320px] xl:w-[390px]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <SearchIcon />
                    </div>

                    <input
                      type="search"
                      value={searchTerm}
                      onChange={handleSearch}
                      placeholder="Search patient, guardian, level..."
                      className="h-12 w-full rounded-xl border border-[#ddd6e5] bg-[#fcfbfd] pl-11 pr-4 text-sm text-[#332a3d] outline-none transition placeholder:text-slate-400 focus:border-[#9875c5] focus:bg-white focus:ring-4 focus:ring-[#9875c5]/10"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as StatusFilter,
                      )
                    }
                    className="h-12 rounded-xl border border-[#ddd6e5] bg-[#fcfbfd] px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-[#9875c5] focus:bg-white focus:ring-4 focus:ring-[#9875c5]/10"
                  >
                    <option value="all">All patients</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0e9f8] text-[#7f55b7]">
                  <UsersIcon />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#332a3d]">
                  No patients found
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No patient matches the current search or status
                  filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-5 rounded-xl bg-[#8257bd] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7047a8]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                      <tr className="bg-[#faf8fc] text-left">
                        {[
                          "Patient",
                          "Age",
                          "Current level",
                          "Guardian",
                          "Last session",
                          "Status",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-400"
                          >
                            {heading}
                          </th>
                        ))}
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr
                          key={patient.id}
                          className="border-t border-[#f0ebf3] transition hover:bg-[#fcfaff]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <PatientAvatar patient={patient} />

                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openPatientProgress(patient)
                                  }
                                  className="block max-w-[220px] truncate text-left text-sm font-bold text-[#332a3d] transition hover:text-[#8257bd] hover:underline"
                                >
                                  {getDoctorPatientFullName(patient)}
                                </button>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {patient.learnerCode}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-600">
                            {patient.age} years
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-lg bg-[#f0eaf8] px-2.5 py-1.5 text-xs font-semibold text-[#7049a5]">
                              {patient.speechLevel}
                            </span>
                          </td>

                          <td className="max-w-[190px] px-5 py-4 text-sm text-slate-600">
                            <span className="block truncate">
                              {patient.guardianName}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {patient.lastSession ?? "No session yet"}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={patient.status} />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                openPatientProgress(patient)
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-[#dcd3e7] bg-white px-3.5 py-2 text-xs font-bold text-[#7049a5] transition hover:border-[#a486c8] hover:bg-[#f5f0fa]"
                            >
                              View progress
                              <ArrowRightIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-[#eee9f2] md:hidden">
                  {filteredPatients.map((patient) => (
                    <article
                      key={patient.id}
                      className="p-4 transition hover:bg-[#fcfaff]"
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
                                className="block max-w-full truncate text-left text-base font-bold text-[#332a3d] transition hover:text-[#8257bd]"
                              >
                                {getDoctorPatientFullName(patient)}
                              </button>

                              <p className="mt-1 text-xs text-slate-400">
                                {patient.learnerCode} • {patient.age}{" "}
                                years old
                              </p>
                            </div>

                            <StatusBadge status={patient.status} />
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-[#faf8fc] p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Current level
                              </p>
                              <p className="mt-1 truncate text-sm font-semibold text-[#5d486f]">
                                {patient.speechLevel}
                              </p>
                            </div>

                            <div className="rounded-xl bg-[#faf8fc] p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Last session
                              </p>
                              <p className="mt-1 truncate text-sm font-semibold text-[#5d486f]">
                                {patient.lastSession ?? "No session"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 rounded-xl border border-[#eee9f2] p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              Guardian
                            </p>
                            <p className="mt-1 truncate text-sm font-medium text-slate-600">
                              {patient.guardianName}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openPatientProgress(patient)
                            }
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8257bd] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#7047a8] active:scale-[0.99]"
                          >
                            View patient progress
                            <ArrowRightIcon />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default DocDashboardScreen;