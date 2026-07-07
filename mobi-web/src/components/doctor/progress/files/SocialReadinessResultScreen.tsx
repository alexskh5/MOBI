import { useEffect, useMemo, useState } from "react";
import type {
  ConversationAttempt,
  PeriodDashboardData,
  PeriodKey,
} from "./progressTypes";
import {
  BottomPager,
  EmptyCard,
  InfoBox,
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

export default function SocialReadinessResultScreen({
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

  const filteredConversationAttempts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data.socialReadiness.attempts;

    return data.socialReadiness.attempts.filter((attempt) =>
      [
        attempt.activityName,
        attempt.prompt,
        attempt.learnerResponse,
        attempt.expectedResponse,
        attempt.appropriateness,
        attempt.turnTaking,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [data, searchQuery]);

  return (
    <div className="w-full">
      <TopBackHeader onBack={onBack} />

      <PageHeader
        title="Social Readiness Result"
        subtitle="Conversation, response, turn-taking, and engagement"
        selectedPeriod={selectedPeriod}
        periods={periods}
        onSelect={onSelectPeriod}
      />

      <SearchBox
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search conversation attempts"
      />

      <section className="mt-4 space-y-3 rounded-[26px] bg-[rgba(238,205,238,0.96)] p-4 sm:p-[18px]">
        <InfoBox
          title="Conversation Attempts"
          value={data.socialReadiness.conversationAttempts}
        />

        {filteredConversationAttempts.length > 0 ? (
          filteredConversationAttempts.map((attempt) => (
            <ConversationAttemptCard key={attempt.id} attempt={attempt} />
          ))
        ) : (
          <EmptyCard
            message={`No conversation attempt found for "${searchQuery}".`}
          />
        )}

        <InfoBox title="Response Appropriateness">
          {data.socialReadiness.responseAppropriateness}
        </InfoBox>

        <InfoBox title="Turn-taking">
          {data.socialReadiness.turnTaking}
        </InfoBox>

        <InfoBox title="Engagement Level">
          {data.socialReadiness.engagementLevel}
        </InfoBox>

        <InfoBox title="AI Social Readiness Summary">
          {data.socialReadiness.aiSummary}
        </InfoBox>
      </section>

      <BottomPager pageNumber="3" onPrevious={onPrevious} onNext={onNext} />
    </div>
  );
}

function ConversationAttemptCard({
  attempt,
}: {
  attempt: ConversationAttempt;
}) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-[0_5px_18px_rgba(58,39,69,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 text-sm font-extrabold text-[#171217]">
          {attempt.activityName}
        </h3>
        <span className="rounded-full bg-[#f7eaf7] px-2.5 py-1 text-[10px] font-extrabold text-[#a16bb4]">
          {attempt.appropriateness}
        </span>
      </div>

      <div className="mt-2 space-y-1 text-xs leading-5 text-[#403744] sm:text-sm">
        <p><strong>Prompt:</strong> {attempt.prompt}</p>
        <p><strong>Learner:</strong> {attempt.learnerResponse}</p>
        <p className="font-bold text-[#c45a5a]"><strong>Expected:</strong> {attempt.expectedResponse}</p>
        <p><strong>Turn-taking:</strong> {attempt.turnTaking}</p>
      </div>
    </article>
  );
}
