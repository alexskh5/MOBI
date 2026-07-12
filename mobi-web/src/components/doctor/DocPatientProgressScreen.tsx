import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DocSidebar from "./DocSidebar";
import {
  getDoctorPatientById,
  getDoctorPatientFullName,
} from "../../data/doctorPatients";
import {
  createDashboardDataForLearner,
  PerActivityAnalysisScreen,
  periodOptions,
  ProgressOverviewScreen,
  progressGraphDataByPeriod,
  SocialReadinessResultScreen,
  SpeechTrainingResultScreen,
  userUsageDays,
  type AvailablePeriod,
  type PeriodKey,
} from "./progress/files";

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

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6-6-6 6 6 6" />
    </svg>
  );
}

function DocPatientProgressScreen() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();

  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("week");
  const [pageIndex, setPageIndex] = useState(0);

  const patient = useMemo(
    () => getDoctorPatientById(patientId),
    [patientId],
  );

  const periods = useMemo<AvailablePeriod[]>(
    () =>
      periodOptions.map((option) => ({
        ...option,
        enabled: userUsageDays >= option.minDaysRequired,
      })),
    [],
  );

  const personalizedData = useMemo(
    () => createDashboardDataForLearner(patient?.firstName ?? "Learner"),
    [patient?.firstName],
  );

  if (!patient) {
    return (
      <div className="font-professional flex min-h-screen items-center justify-center bg-[#f7f5fa] px-5">
        <div className="w-full max-w-md rounded-2xl border border-[#e7e1ec] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0e9f8] text-2xl font-bold text-[#7f55b7]">
            ?
          </div>
          <h1 className="mt-5 text-xl font-bold text-[#332a3d]">Patient not found</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The selected patient does not exist in the current patient list.
          </p>
          <button
            type="button"
            onClick={() => navigate("/doctor/DocDashboardScreen")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#8257bd] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7047a8]"
          >
            <BackIcon />
            Return to patient list
          </button>
        </div>
      </div>
    );
  }

  const data = personalizedData[selectedPeriod];
  const graphData = progressGraphDataByPeriod[selectedPeriod];

  const handleSelectPeriod = (period: PeriodKey, enabled: boolean) => {
    if (!enabled) return;
    setSelectedPeriod(period);
  };

  const goPreviousPage = () => {
    setPageIndex((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNextPage = () => {
    setPageIndex((current) => Math.min(current + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToOverview = () => {
    setPageIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="font-professional min-h-screen bg-[#f7f5fa]">
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar"
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

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#342b3f]">Patient Progress</p>
            <p className="truncate text-xs text-slate-400">
              {getDoctorPatientFullName(patient)}
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7 xl:px-10">
          <button
            type="button"
            onClick={() => navigate("/doctor/DocDashboardScreen")}
            className="mb-2 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-[#eee8f5] hover:text-[#7549ad]"
          >
            <BackIcon />
            Back to patient list
          </button>

          {pageIndex === 0 && (
            <ProgressOverviewScreen
              learner={{
                firstName: patient.firstName,
                lastName: patient.lastName,
                age: patient.age,
              }}
              data={data}
              graphData={graphData}
              selectedPeriod={selectedPeriod}
              periods={periods}
              onSelectPeriod={handleSelectPeriod}
              onPrevious={goPreviousPage}
              onNext={goNextPage}
            />
          )}

          {pageIndex === 1 && (
            <SpeechTrainingResultScreen
              data={data}
              selectedPeriod={selectedPeriod}
              periods={periods}
              onSelectPeriod={handleSelectPeriod}
              onBack={goToOverview}
              onPrevious={goPreviousPage}
              onNext={goNextPage}
            />
          )}

          {pageIndex === 2 && (
            <SocialReadinessResultScreen
              data={data}
              selectedPeriod={selectedPeriod}
              periods={periods}
              onSelectPeriod={handleSelectPeriod}
              onBack={goToOverview}
              onPrevious={goPreviousPage}
              onNext={goNextPage}
            />
          )}

          {pageIndex === 3 && (
            <PerActivityAnalysisScreen
              data={data}
              selectedPeriod={selectedPeriod}
              periods={periods}
              onSelectPeriod={handleSelectPeriod}
              onBack={goToOverview}
              onPrevious={goPreviousPage}
              onNext={goNextPage}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default DocPatientProgressScreen;
