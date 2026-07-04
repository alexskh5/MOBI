import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  OverallProgressCard,
  PeriodDashboardData,
  PeriodKey,
} from '../../../types';
import {
  AvailablePeriod,
  BottomPager,
  EmptyCard,
  PageHeader,
} from './ProgressShared';
import { ProgressGraphPoint } from './progressData';

type LearnerSummary = {
  firstName: string;
  lastName: string;
  age: number;
};

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
  const { width } = useWindowDimensions();
  const isTablet = width >= 720;
  const isVeryNarrow = width < 360;

  const metricLayout: 'full' | 'phone' | 'tablet' = isVeryNarrow
  ? 'full'
  : isTablet
  ? 'tablet'
  : 'phone';

  const periodLabel =
    periods.find((period) => period.key === selectedPeriod)?.label ?? 'Day';

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contentShell}>
        <PageHeader
          title="Learner Monitoring"
          subtitle="Summary, progress graph, and AI-supported observations"
          selectedPeriod={selectedPeriod}
          periods={periods}
          onSelect={onSelectPeriod}
        />

        <View style={styles.monitoringCard}>
          <View style={[styles.learnerHeader, isTablet && styles.learnerHeaderTablet]}>
            <View style={styles.learnerIdentity}>
              <View style={styles.chartIconBox}>
                <Ionicons
                  name="bar-chart-outline"
                  size={23}
                  color="#C55A9D"
                />
              </View>

              <View style={styles.learnerTextWrap}>
                <Text style={styles.learnerName} numberOfLines={2}>
                  {learner.firstName} {learner.lastName}, {learner.age} years old
                </Text>
                <Text style={styles.periodCaption}>{periodLabel} overview</Text>
              </View>
            </View>

            <Text style={[styles.aiHeading, isTablet && styles.aiHeadingTablet]}>
              <Text style={styles.aiHeadingStrong}>AI ANALYSIS</Text>
              {' of Child\'s Progress with MOBI'}
            </Text>
          </View>

          <View style={styles.metricsGrid}>
            {data.overall.map((card) => (
                <MetricCard
                key={card.label}
                card={card}
                layout={metricLayout}
                />
            ))}
          </View>

          <View
            style={[
              styles.overviewBody,
              isTablet && styles.overviewBodyTablet,
            ]}
          >
            <View
              style={[
                styles.graphColumn,
                isTablet && styles.graphColumnTablet,
              ]}
            >
              <View style={styles.sectionHeadingRow}>
                <View>
                  <Text style={styles.sectionTitle}>Progress Graph</Text>
                  <Text style={styles.sectionSubtitle}>
                    Speech training and social readiness trend
                  </Text>
                </View>

                <View style={styles.legendRow}>
                  <LegendItem color="#DFA5C9" label="Speech" />
                  <LegendItem color="#9021C4" label="Social" />
                </View>
              </View>

              <View style={styles.graphCard}>
                {graphData.length > 0 ? (
                  <ResponsiveLineGraph data={graphData} />
                ) : (
                  <EmptyCard
                    message={`No graph data is available for this ${selectedPeriod}.`}
                  />
                )}
              </View>
            </View>

            <View
              style={[
                styles.analysisColumn,
                isTablet && styles.analysisColumnTablet,
              ]}
            >
              <AnalysisCard
                icon="chatbubble-ellipses-outline"
                title="Speech and Vocabulary"
                summary={`${data.speechTraining.totalCorrect} correct · ${data.speechTraining.totalNeedsPractice} needs practice`}
                description={data.speechTraining.mostImprovedSpeech}
              />

              <AnalysisCard
                icon="people-outline"
                title="Social Readiness"
                summary={`Engagement: ${data.socialReadiness.engagementLevel}`}
                description={data.socialReadiness.aiSummary}
              />
            </View>
          </View>
        </View>

        <BottomPager
          pageNumber="1"
          onPrevious={onPrevious}
          onNext={onNext}
          previousDisabled
        />
      </View>
    </ScrollView>
  );
}

function MetricCard({
  card,
  layout,
}: {
  card: OverallProgressCard;
  layout: 'full' | 'phone' | 'tablet';
}) {
  return (
    <View
      style={[
        styles.metricCard,
        layout === 'full' && styles.metricCardFull,
        layout === 'phone' && styles.metricCardPhone,
        layout === 'tablet' && styles.metricCardTablet,
      ]}
    >
      <View style={styles.metricIconBox}>
        <Ionicons
          name={card.icon as never}
          size={19}
          color="#A76EB9"
        />
      </View>

      <Text style={styles.metricValue}>
        {card.value}
      </Text>

      <Text style={styles.metricLabel}>
        {card.label}
      </Text>

      {!!card.subtitle && (
        <Text style={styles.metricSubtitle}>
          {card.subtitle}
        </Text>
      )}
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function AnalysisCard({
  icon,
  title,
  summary,
  description,
}: {
  icon: string;
  title: string;
  summary: string;
  description: string;
}) {
  return (
    <View style={styles.analysisCard}>
      <View style={styles.analysisTopRow}>
        <View style={styles.analysisIconBox}>
          <Ionicons name={icon as never} size={19} color="#A76EB9" />
        </View>

        <View style={styles.analysisTitleWrap}>
          <Text style={styles.analysisTitle}>{title}</Text>
          <Text style={styles.analysisSummary}>{summary}</Text>
        </View>
      </View>

      <Text style={styles.analysisDescription}>{description}</Text>
    </View>
  );
}

function ResponsiveLineGraph({ data }: { data: ProgressGraphPoint[] }) {
  const [chartWidth, setChartWidth] = useState(0);

  const chartHeight = 220;
  const plotLeft = 34;
  const plotRight = 10;
  const plotTop = 16;
  const plotBottom = 34;
  const plotHeight = chartHeight - plotTop - plotBottom;

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (Math.abs(nextWidth - chartWidth) > 1) {
      setChartWidth(nextWidth);
    }
  };

  const points = useMemo(() => {
    if (!chartWidth || data.length === 0) return [];

    const plotWidth = Math.max(chartWidth - plotLeft - plotRight, 1);
    const denominator = Math.max(data.length - 1, 1);

    return data.map((item, index) => ({
      ...item,
      x: plotLeft + (plotWidth * index) / denominator,
      speechY: plotTop + ((100 - item.speech) / 100) * plotHeight,
      socialY: plotTop + ((100 - item.social) / 100) * plotHeight,
    }));
  }, [chartWidth, data, plotHeight]);

  return (
    <View style={styles.chartCanvas} onLayout={onLayout}>
      {[100, 75, 50, 25, 0].map((value, index) => {
        const top = plotTop + (plotHeight * index) / 4;

        return (
          <React.Fragment key={value}>
            <Text style={[styles.yAxisLabel, { top: top - 7 }]}>{value}</Text>
            <View
              style={[
                styles.gridLine,
                {
                  top,
                  left: plotLeft,
                  right: plotRight,
                },
              ]}
            />
          </React.Fragment>
        );
      })}

      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1];

        return (
          <React.Fragment key={`${point.period}-${next.period}`}>
            <LineSegment
              x1={point.x}
              y1={point.speechY}
              x2={next.x}
              y2={next.speechY}
              color="#DFA5C9"
            />
            <LineSegment
              x1={point.x}
              y1={point.socialY}
              x2={next.x}
              y2={next.socialY}
              color="#9021C4"
            />
          </React.Fragment>
        );
      })}

      {points.map((point) => (
        <React.Fragment key={point.period}>
          <View
            style={[
              styles.chartDot,
              {
                left: point.x - 4,
                top: point.speechY - 4,
                backgroundColor: '#DFA5C9',
              },
            ]}
          />
          <View
            style={[
              styles.chartDot,
              {
                left: point.x - 4,
                top: point.socialY - 4,
                backgroundColor: '#9021C4',
              },
            ]}
          />
          <Text
            numberOfLines={1}
            style={[
              styles.xAxisLabel,
              {
                left: point.x - 25,
                top: chartHeight - 24,
              },
            ]}
          >
            {point.period}
          </Text>
        </React.Fragment>
      ))}
    </View>
  );
}

function LineSegment({
  x1,
  y1,
  x2,
  y2,
  color,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;

  return (
    <View
      style={[
        styles.lineSegment,
        {
          width: length,
          left: centerX - length / 2,
          top: centerY - 1.5,
          backgroundColor: color,
          transform: [{ rotateZ: `${angle}deg` }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 92,
  },

  contentShell: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
  },

  monitoringCard: {
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#C4AEC7',
    backgroundColor: 'rgba(239, 223, 240, 0.94)',
  },

  learnerHeader: {
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#C4AEC7',
    gap: 11,
  },

  learnerHeaderTablet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  learnerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  chartIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4CFDF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  learnerTextWrap: {
    flex: 1,
  },

  learnerName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    color: '#171217',
  },

  periodCaption: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '700',
    color: '#806B83',
  },

  aiHeading: {
    fontSize: 11,
    lineHeight: 16,
    color: '#292029',
  },

  aiHeadingTablet: {
    maxWidth: 300,
    textAlign: 'right',
  },

  aiHeadingStrong: {
    fontWeight: '900',
  },

  metricsGrid: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  metricCard: {
    flexGrow: 1,
    minWidth: 0,
    minHeight: 108,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 13,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
        width: 0,
        height: 2,
    },

    elevation: 2,
  },

    metricCardFull: {
    flexBasis: '100%',
    },

    metricCardPhone: {
    flexBasis: '46%',
    },

    metricCardTablet: {
    flexBasis: '30%',
    },

  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F6EAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricValue: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: '900',
    color: '#171217',
  },

  metricLabel: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    color: '#6E626F',
  },

  metricSubtitle: {
    marginTop: 2,
    fontSize: 8,
    color: '#9A8E9B',
  },

  overviewBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },

  overviewBodyTablet: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  graphColumn: {
    width: '100%',
  },

  graphColumnTablet: {
    flex: 1.45,
    width: undefined,
  },

  analysisColumn: {
    gap: 10,
  },

  analysisColumnTablet: {
    flex: 1,
  },

  sectionHeadingRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#171217',
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 9,
    color: '#7A6B7C',
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#5F5360',
  },

  graphCard: {
    minHeight: 250,
    borderRadius: 17,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#BCA8BF',
    backgroundColor: 'rgba(255,255,255,0.48)',
    padding: 10,
    justifyContent: 'center',
  },

  chartCanvas: {
    position: 'relative',
    width: '100%',
    height: 220,
  },

  gridLine: {
    position: 'absolute',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D7CAD9',
  },

  yAxisLabel: {
    position: 'absolute',
    left: 0,
    width: 28,
    textAlign: 'right',
    fontSize: 8,
    color: '#8C7F8E',
  },

  xAxisLabel: {
    position: 'absolute',
    width: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#736776',
  },

  lineSegment: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
  },

  chartDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  analysisCard: {
    flex: 1,
    minHeight: 132,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  analysisTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  analysisIconBox: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#F6EAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  analysisTitleWrap: {
    flex: 1,
  },

  analysisTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#171217',
  },

  analysisSummary: {
    marginTop: 2,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '800',
    color: '#9B6CAE',
  },

  analysisDescription: {
    marginTop: 10,
    fontSize: 10,
    lineHeight: 15,
    color: '#4F454F',
  },
});
