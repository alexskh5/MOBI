import type {
  LearnerSummary,
  OverallProgressCard,
  PeriodDashboardData,
  PeriodKey,
} from "./progressTypes";
import type { ProgressGraphPoint } from "./progressData";
import {
  BottomPager,
  EmptyCard,
  PageHeader,
  ProgressIcon,
  type AvailablePeriod,
} from "./ProgressShared";

type Props = {
  learner: LearnerSummary;
  data: PeriodDashboardData;
  graphData: ProgressGraphPoint[];
  selectedPeriod: PeriodKey;
  periods: AvailablePeriod[];
  onSelectPeriod: (period: PeriodKey, enabled: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export default function ProgressOverviewScreen({
  learner,
  data,
  graphData,
  selectedPeriod,
  periods,
  onSelectPeriod,
  onPrevious,
  onNext,
}: Props) {
  const periodLabel =
    periods.find((period) => period.key === selectedPeriod)?.label ?? "Day";

  return (
    <div className="w-full">
      <PageHeader
        title="Learner Monitoring"
        subtitle="Summary, progress graph, and AI-supported observations"
        selectedPeriod={selectedPeriod}
        periods={periods}
        onSelect={onSelectPeriod}
      />

      <section className="mt-4 overflow-hidden rounded-[22px] border border-[#c4aec7] bg-[rgba(239,223,240,0.94)]">
        <div className="flex flex-col gap-3 border-b border-[#c4aec7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4cfdf] text-[#c55a9d]">
              <ProgressIcon name="bar-chart" className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-extrabold leading-6 text-[#171217] sm:text-lg">
                {learner.firstName} {learner.lastName}, {learner.age} years old
              </h2>
              <p className="mt-0.5 text-[11px] font-bold text-[#806b83]">
                {periodLabel} overview
              </p>
            </div>
          </div>

          <p className="text-xs leading-5 text-[#292029] lg:max-w-xs lg:text-right">
            <strong className="font-extrabold">AI ANALYSIS</strong> of Child&apos;s
            Progress with MOBI
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 px-3 py-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {data.overall.map((card) => (
            <MetricCard key={card.label} card={card} />
          ))}
        </div>

        <div className="grid gap-3 px-4 pb-4 lg:grid-cols-[1.45fr_1fr]">
          <div className="min-w-0">
            <div className="mb-2.5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#171217]">
                  Progress Graph
                </h3>
                <p className="mt-0.5 text-[11px] text-[#7a6b7c]">
                  Speech training and social readiness trend
                </p>
              </div>

              <div className="flex items-center gap-3">
                <LegendItem color="#dfa5c9" label="Speech" />
                <LegendItem color="#9021c4" label="Social" />
              </div>
            </div>

            <div className="flex min-h-[260px] items-center justify-center rounded-[17px] border border-dashed border-[#bca8bf] bg-white/50 p-3">
              {graphData.length > 0 ? (
                <ResponsiveLineGraph data={graphData} />
              ) : (
                <div className="w-full">
                  <EmptyCard
                    message={`No graph data is available for this ${selectedPeriod}.`}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-2.5">
            <AnalysisCard
              icon="chat"
              title="Speech and Vocabulary"
              summary={`${data.speechTraining.totalCorrect} correct · ${data.speechTraining.totalNeedsPractice} needs practice`}
              description={data.speechTraining.mostImprovedSpeech}
            />

            <AnalysisCard
              icon="people"
              title="Social Readiness"
              summary={`Engagement: ${data.socialReadiness.engagementLevel}`}
              description={data.socialReadiness.aiSummary}
            />
          </div>
        </div>
      </section>

      <BottomPager
        pageNumber="1"
        onPrevious={onPrevious}
        onNext={onNext}
        previousDisabled
      />
    </div>
  );
}

function MetricCard({ card }: { card: OverallProgressCard }) {
  return (
    <article className="min-h-[108px] rounded-2xl bg-white p-3.5 shadow-[0_4px_16px_rgba(55,37,67,0.05)]">
      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f6eaf7] text-[#a76eb9]">
        <ProgressIcon name={card.icon} className="h-[19px] w-[19px]" />
      </div>

      <p className="mt-2 text-lg font-extrabold text-[#171217]">{card.value}</p>
      <p className="mt-0.5 text-[11px] font-extrabold leading-4 text-[#6e626f]">
        {card.label}
      </p>
      {card.subtitle && (
        <p className="mt-0.5 text-[10px] text-[#9a8e9b]">{card.subtitle}</p>
      )}
    </article>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-bold text-[#5f5360]">{label}</span>
    </div>
  );
}

function AnalysisCard({
  icon,
  title,
  summary,
  description,
}: {
  icon: "chat" | "people";
  title: string;
  summary: string;
  description: string;
}) {
  return (
    <article className="min-h-[132px] rounded-[17px] bg-white p-4 shadow-[0_4px_16px_rgba(55,37,67,0.05)]">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f6eaf7] text-[#a76eb9]">
          <ProgressIcon name={icon} className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-[#171217]">{title}</h3>
          <p className="mt-0.5 text-[10px] font-extrabold leading-4 text-[#9b6cae]">
            {summary}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-[#4f454f] sm:text-sm">
        {description}
      </p>
    </article>
  );
}

function ResponsiveLineGraph({ data }: { data: ProgressGraphPoint[] }) {
  const width = 700;
  const height = 240;
  const left = 42;
  const right = 16;
  const top = 18;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const denominator = Math.max(data.length - 1, 1);

  const points = data.map((item, index) => ({
    ...item,
    x: left + (plotWidth * index) / denominator,
    speechY: top + ((100 - item.speech) / 100) * plotHeight,
    socialY: top + ((100 - item.social) / 100) * plotHeight,
  }));

  const speechPath = points.map((point) => `${point.x},${point.speechY}`).join(" ");
  const socialPath = points.map((point) => `${point.x},${point.socialY}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Speech and social readiness progress graph"
    >
      {[100, 75, 50, 25, 0].map((value, index) => {
        const y = top + (plotHeight * index) / 4;
        return (
          <g key={value}>
            <text x={left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#8c7f8e">
              {value}
            </text>
            <line x1={left} x2={width - right} y1={y} y2={y} stroke="#d7cad9" strokeWidth="1" />
          </g>
        );
      })}

      <polyline
        points={speechPath}
        fill="none"
        stroke="#dfa5c9"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={socialPath}
        fill="none"
        stroke="#9021c4"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point) => (
        <g key={point.period}>
          <circle cx={point.x} cy={point.speechY} r="5" fill="#dfa5c9" stroke="#fff" strokeWidth="2" />
          <circle cx={point.x} cy={point.socialY} r="5" fill="#9021c4" stroke="#fff" strokeWidth="2" />
          <text x={point.x} y={height - 12} textAnchor="middle" fontSize="10" fill="#736776">
            {point.period}
          </text>
        </g>
      ))}
    </svg>
  );
}
