import { useEffect, useMemo, useState } from "react";
import type {
  PeriodDashboardData,
  PeriodKey,
  SpeechAttempt,
  SpeechLevelProgress,
} from "./progressTypes";
import {
  BottomPager,
  EmptyCard,
  formatList,
  InfoBox,
  PageHeader,
  ProgressIcon,
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

export default function SpeechTrainingResultScreen({
  data,
  selectedPeriod,
  periods,
  onSelectPeriod,
  onBack,
  onPrevious,
  onNext,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSearchQuery("");
  }, [selectedPeriod]);

  const filteredSpeechLevels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data.speechTraining.levels;

    return data.speechTraining.levels
      .map((level) => {
        const attempts = level.attempts.filter((attempt) =>
          [
            attempt.activityName,
            attempt.prompt,
            attempt.target,
            attempt.learnerResponse,
            attempt.supportUsed ?? "",
            attempt.isCorrect ? "correct" : "needs practice",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query),
        );

        return level.level.toLowerCase().includes(query)
          ? level
          : { ...level, attempts };
      })
      .filter(
        (level) =>
          level.level.toLowerCase().includes(query) || level.attempts.length > 0,
      );
  }, [data, searchQuery]);

  return (
    <div className="w-full">
      <TopBackHeader onBack={onBack} />

      <PageHeader
        title="Speech Training Result"
        subtitle="Shows where each answer happened and why it needs practice"
        selectedPeriod={selectedPeriod}
        periods={periods}
        onSelect={onSelectPeriod}
      />

      <SearchBox
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search sound, word, activity, correct, needs practice"
      />

      <section className="mt-4 space-y-3 rounded-[26px] bg-[rgba(238,205,238,0.96)] p-4 sm:p-[18px]">
        <InfoBox title="Correct vs Needs Practice">
          {`Correct: ${data.speechTraining.totalCorrect}\nNeeds practice: ${data.speechTraining.totalNeedsPractice}`}
        </InfoBox>

        <InfoBox title="Most Missed Targets">
          {formatList(data.speechTraining.mostMissedTargets)}
        </InfoBox>

        <InfoBox title="Most Improved Speech">
          {data.speechTraining.mostImprovedSpeech}
        </InfoBox>

        {filteredSpeechLevels.length > 0 ? (
          filteredSpeechLevels.map((item) => (
            <SpeechLevelCard key={item.level} item={item} />
          ))
        ) : (
          <EmptyCard
            message={`No speech training result found for "${searchQuery}".`}
          />
        )}
      </section>

      <BottomPager pageNumber="2" onPrevious={onPrevious} onNext={onNext} />
    </div>
  );
}

function SpeechLevelCard({ item }: { item: SpeechLevelProgress }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(58,39,69,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-extrabold text-[#171217]">{item.level}</h3>
        <p className="text-sm font-extrabold text-[#a16bb4]">{item.accuracy}</p>
      </div>

      <p className="mt-2 text-xs leading-5 text-[#4f454f] sm:text-sm">
        Correct: {item.correct}
        <br />
        Needs practice: {item.needsPractice}
      </p>

      <h4 className="mt-5 text-sm font-extrabold text-[#171217]">
        Attempt History
      </h4>

      <div className="mt-2 space-y-2.5">
        {item.attempts.length > 0 ? (
          item.attempts.map((attempt) => (
            <SpeechAttemptCard key={attempt.id} attempt={attempt} />
          ))
        ) : (
          <p className="rounded-xl bg-[#f8f2f8] p-3 text-xs text-slate-500">
            No matching attempts in this level.
          </p>
        )}
      </div>
    </article>
  );
}

function SpeechAttemptCard({ attempt }: { attempt: SpeechAttempt }) {
  return (
    <div className="rounded-xl bg-[#f8f2f8] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h5 className="min-w-0 flex-1 text-xs font-extrabold text-[#171217] sm:text-sm">
          {attempt.activityName}
        </h5>

        <StatusBadge isCorrect={attempt.isCorrect} />
      </div>

      <div className="mt-2 space-y-1 text-xs leading-5 text-[#403744] sm:text-sm">
        <p><strong>Prompt:</strong> {attempt.prompt}</p>
        <p><strong>Target:</strong> {attempt.target}</p>
        <p><strong>Learner:</strong> {attempt.learnerResponse}</p>
      </div>

      {!attempt.isCorrect && attempt.supportUsed && (
        <div className="mt-2 flex items-start gap-1.5 text-[#c45a5a]">
          <ProgressIcon name="help" className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs font-bold leading-5 sm:text-sm">
            Support used: {attempt.supportUsed}
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ isCorrect }: { isCorrect: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
        isCorrect
          ? "bg-[#e7f6ea] text-[#4d8b57]"
          : "bg-[#fceaea] text-[#c45a5a]"
      }`}
    >
      {isCorrect ? "Correct" : "Needs Practice"}
    </span>
  );
}
