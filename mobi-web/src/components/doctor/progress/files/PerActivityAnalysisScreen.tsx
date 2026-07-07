import { useEffect, useMemo, useState } from "react";
import type {
  ActivityProgressAnalysis,
  ActivityStepHistory,
  PeriodDashboardData,
  PeriodKey,
} from "./progressTypes";
import {
  BottomPager,
  EmptyCard,
  PageHeader,
  SearchBox,
  TopBackHeader,
  type AvailablePeriod,
} from "./ProgressShared";

type Props = {
  data: PeriodDashboardData;
  selectedPeriod: PeriodKey;
  periods: AvailablePeriod[];
  onSelectPeriod: (period: PeriodKey, enabled: boolean) => void;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export default function PerActivityAnalysisScreen({
  data,
  selectedPeriod,
  periods,
  onSelectPeriod,
  onBack,
  onPrevious,
  onNext,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    setSearchQuery("");
    setActivityIndex(0);
  }, [selectedPeriod]);

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data.activities;

    return data.activities.filter((activity) => {
      const matchesActivity = [activity.activityName, activity.successRate]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesSteps = activity.stepHistory.some((step) =>
        [
          step.stepType,
          step.question,
          step.learnerAnswer,
          step.expectedAnswer,
          step.isCorrect ? "correct" : "needs practice wrong",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );

      return matchesActivity || matchesSteps;
    });
  }, [data, searchQuery]);

  useEffect(() => {
    if (activityIndex > filteredActivities.length - 1) {
      setActivityIndex(0);
    }
  }, [activityIndex, filteredActivities.length]);

  const currentActivity: ActivityProgressAnalysis | undefined =
    filteredActivities[activityIndex];

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setActivityIndex(0);
  };

  return (
    <div className="w-full">
      <TopBackHeader onBack={onBack} />

      <PageHeader
        title="Per Activity Analysis"
        subtitle="Correct/wrong answers and step-by-step answer history"
        selectedPeriod={selectedPeriod}
        periods={periods}
        onSelect={onSelectPeriod}
      />

      <SearchBox
        value={searchQuery}
        onChangeText={handleSearchChange}
        placeholder="Search activity, answer, step, correct, wrong"
      />

      <section className="mt-4 rounded-[26px] bg-[rgba(238,205,238,0.96)] p-4 sm:p-[18px]">
        {currentActivity ? (
          <>
            <h2 className="text-base font-extrabold text-[#171217] sm:text-lg">
              {currentActivity.activityName}
            </h2>

            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <ActivityMetricCard
                label="Correct Answers"
                value={String(currentActivity.correctAnswers)}
              />
              <ActivityMetricCard
                label="Needs Practice"
                value={String(currentActivity.wrongAnswers)}
              />
              <ActivityMetricCard
                label="Success Rate"
                value={currentActivity.successRate}
              />
            </div>

            <h3 className="mt-5 text-sm font-extrabold text-[#171217]">
              Step-by-step Answer History
            </h3>

            <div className="mt-2 space-y-3">
              {currentActivity.stepHistory.map((step) => (
                <StepHistoryCard key={step.id} step={step} />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={activityIndex === 0}
                onClick={() => setActivityIndex((current) => Math.max(current - 1, 0))}
                className="text-xs font-extrabold text-[#a16bb4] transition hover:text-[#8257bd] disabled:cursor-not-allowed disabled:text-slate-400 sm:text-sm"
              >
                ← Previous Activity
              </button>

              <button
                type="button"
                disabled={activityIndex >= filteredActivities.length - 1}
                onClick={() =>
                  setActivityIndex((current) =>
                    Math.min(current + 1, filteredActivities.length - 1),
                  )
                }
                className="text-xs font-extrabold text-[#a16bb4] transition hover:text-[#8257bd] disabled:cursor-not-allowed disabled:text-slate-400 sm:text-sm"
              >
                {activityIndex >= filteredActivities.length - 1
                  ? "No next activity"
                  : "Next Activity →"}
              </button>
            </div>
          </>
        ) : (
          <EmptyCard message={`No activity found for "${searchQuery}".`} />
        )}
      </section>

      <BottomPager
        pageNumber="4"
        onPrevious={onPrevious}
        onNext={onNext}
        nextDisabled
      />
    </div>
  );
}

function ActivityMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(58,39,69,0.07)]">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-[#a16bb4]">{value}</p>
    </article>
  );
}

function StepHistoryCard({ step }: { step: ActivityStepHistory }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(58,39,69,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="min-w-0 flex-1 text-xs font-extrabold text-[#171217] sm:text-sm">
          Step {step.stepOrder} · {step.stepType}
        </h4>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
            step.isCorrect
              ? "bg-[#e7f6ea] text-[#4d8b57]"
              : "bg-[#fceaea] text-[#c45a5a]"
          }`}
        >
          {step.isCorrect ? "Correct" : "Needs Practice"}
        </span>
      </div>

      <div className="mt-2 space-y-1 text-xs leading-5 text-[#403744] sm:text-sm">
        <p><strong>Question:</strong> {step.question}</p>
        <p><strong>Answer:</strong> {step.learnerAnswer}</p>
        {!step.isCorrect && (
          <p className="font-bold text-[#c45a5a]"><strong>Expected:</strong> {step.expectedAnswer}</p>
        )}
      </div>
    </article>
  );
}
