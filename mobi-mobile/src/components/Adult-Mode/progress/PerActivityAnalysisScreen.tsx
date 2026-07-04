import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ActivityProgressAnalysis,
  ActivityStepHistory,
  PeriodDashboardData,
  PeriodKey,
} from '../../../types';
import {
  AvailablePeriod,
  BottomPager,
  EmptyCard,
  PageHeader,
  SearchBox,
  TopBackHeader,
} from './ProgressShared';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    setSearchQuery('');
    setActivityIndex(0);
  }, [selectedPeriod]);

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return data.activities;

    return data.activities.filter((activity) => {
      const matchesActivity =
        activity.activityName.toLowerCase().includes(query) ||
        activity.successRate.toLowerCase().includes(query);

      const matchesSteps = activity.stepHistory.some((step) => {
        return (
          step.stepType.toLowerCase().includes(query) ||
          step.question.toLowerCase().includes(query) ||
          step.learnerAnswer.toLowerCase().includes(query) ||
          step.expectedAnswer.toLowerCase().includes(query) ||
          (step.isCorrect ? 'correct' : 'needs practice').includes(query) ||
          (step.isCorrect ? 'correct' : 'wrong').includes(query)
        );
      });

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

  const goPreviousActivity = () => {
    setActivityIndex((current) => Math.max(current - 1, 0));
  };

  const goNextActivity = () => {
    setActivityIndex((current) =>
      Math.min(current + 1, filteredActivities.length - 1)
    );
  };

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contentShell}>
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

        <View style={styles.activityPanel}>
          {currentActivity ? (
            <>
              <Text style={styles.bulletTitle}>
                {currentActivity.activityName}
              </Text>

              <View style={styles.metricsRow}>
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
              </View>

              <Text style={styles.sectionTitle}>
                Step-by-step Answer History
              </Text>

              {currentActivity.stepHistory.map((step) => (
                <StepHistoryCard key={step.id} step={step} />
              ))}

              <View style={styles.activityNavRow}>
                <Pressable
                  disabled={activityIndex === 0}
                  onPress={goPreviousActivity}
                  hitSlop={8}
                >
                  <Text
                    style={[
                      styles.activityNavText,
                      activityIndex === 0 && styles.disabledNextActivity,
                    ]}
                  >
                    ← Previous Activity
                  </Text>
                </Pressable>

                <Pressable
                  disabled={activityIndex >= filteredActivities.length - 1}
                  onPress={goNextActivity}
                  hitSlop={8}
                >
                  <Text
                    style={[
                      styles.activityNavText,
                      activityIndex >= filteredActivities.length - 1 &&
                        styles.disabledNextActivity,
                    ]}
                  >
                    {activityIndex >= filteredActivities.length - 1
                      ? 'No next activity'
                      : 'Next Activity →'}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <EmptyCard message={`No activity found for "${searchQuery}".`} />
          )}
        </View>

        <BottomPager
          pageNumber="4"
          onPrevious={onPrevious}
          onNext={onNext}
          nextDisabled
        />
      </View>
    </ScrollView>
  );
}

function ActivityMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.activityMetricCard}>
      <Text style={styles.reportLabel}>{label}</Text>
      <Text style={styles.reportValue}>{value}</Text>
    </View>
  );
}

function StepHistoryCard({ step }: { step: ActivityStepHistory }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>
          Step {step.stepOrder} · {step.stepType}
        </Text>

        <Text
          style={[
            styles.stepBadge,
            step.isCorrect ? styles.correctBadge : styles.wrongBadge,
          ]}
        >
          {step.isCorrect ? 'Correct' : 'Needs Practice'}
        </Text>
      </View>

      <Text style={styles.stepText}>Question: {step.question}</Text>
      <Text style={styles.stepText}>Answer: {step.learnerAnswer}</Text>

      {!step.isCorrect && (
        <Text style={styles.stepExpected}>
          Expected: {step.expectedAnswer}
        </Text>
      )}
    </View>
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

  activityPanel: {
    marginTop: 16,
    backgroundColor: 'rgba(238,205,238,0.96)',
    borderRadius: 26,
    padding: 18,
  },

  bulletTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
  },

  metricsRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  activityMetricCard: {
    minWidth: 130,
    flexGrow: 1,
    flexBasis: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },

  reportLabel: {
    fontSize: 10,
    color: '#777',
  },

  reportValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#B48BC7',
    marginTop: 4,
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 2,
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
  },

  stepCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },

  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  stepTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#111',
    flex: 1,
  },

  stepBadge: {
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },

  correctBadge: {
    color: '#4D8B57',
    backgroundColor: '#E7F6EA',
  },

  wrongBadge: {
    color: '#C45A5A',
    backgroundColor: '#FCEAEA',
  },

  stepText: {
    marginTop: 6,
    fontSize: 10,
    color: '#333',
    lineHeight: 14,
  },

  stepExpected: {
    marginTop: 6,
    fontSize: 10,
    color: '#C45A5A',
    fontWeight: '700',
  },

  activityNavRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },

  activityNavText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B48BC7',
  },

  disabledNextActivity: {
    color: '#999',
  },
});
