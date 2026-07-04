import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  PeriodDashboardData,
  PeriodKey,
  SpeechAttempt,
  SpeechLevelProgress,
} from '../../../types';
import {
  AvailablePeriod,
  BottomPager,
  EmptyCard,
  formatList,
  InfoBox,
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

export default function SpeechTrainingResultScreen({
  data,
  selectedPeriod,
  periods,
  onSelectPeriod,
  onBack,
  onPrevious,
  onNext,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSearchQuery('');
  }, [selectedPeriod]);

  const filteredSpeechLevels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return data.speechTraining.levels;

    return data.speechTraining.levels
      .map((level) => {
        const attempts = level.attempts.filter((attempt) => {
          return (
            attempt.activityName.toLowerCase().includes(query) ||
            attempt.prompt.toLowerCase().includes(query) ||
            attempt.target.toLowerCase().includes(query) ||
            attempt.learnerResponse.toLowerCase().includes(query) ||
            (attempt.supportUsed || '').toLowerCase().includes(query) ||
            (attempt.isCorrect ? 'correct' : 'needs practice').includes(query)
          );
        });

        const matchesLevel = level.level.toLowerCase().includes(query);
        return matchesLevel ? level : { ...level, attempts };
      })
      .filter(
        (level) =>
          level.level.toLowerCase().includes(query) ||
          level.attempts.length > 0
      );
  }, [data, searchQuery]);

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

        <View style={styles.modulesPanel}>
          <InfoBox title="Correct vs Needs Practice">
            Correct: {data.speechTraining.totalCorrect}
            {'\n'}Needs practice: {data.speechTraining.totalNeedsPractice}
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
        </View>

        <BottomPager
          pageNumber="2"
          onPrevious={onPrevious}
          onNext={onNext}
        />
      </View>
    </ScrollView>
  );
}

function SpeechLevelCard({ item }: { item: SpeechLevelProgress }) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoBoxHeader}>
        <Text style={styles.infoBoxTitle}>{item.level}</Text>
        <Text style={styles.infoBoxValue}>{item.accuracy}</Text>
      </View>

      <Text style={styles.infoBoxBody}>
        Correct: {item.correct}
        {'\n'}Needs practice: {item.needsPractice}
      </Text>

      <Text style={styles.sectionTitle}>Attempt History</Text>

      {item.attempts.map((attempt) => (
        <SpeechAttemptCard key={attempt.id} attempt={attempt} />
      ))}
    </View>
  );
}

function SpeechAttemptCard({ attempt }: { attempt: SpeechAttempt }) {
  return (
    <View style={styles.answerGroup}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{attempt.activityName}</Text>

        <Text
          style={[
            styles.stepBadge,
            attempt.isCorrect ? styles.correctBadge : styles.wrongBadge,
          ]}
        >
          {attempt.isCorrect ? 'Correct' : 'Needs Practice'}
        </Text>
      </View>

      <Text style={styles.stepText}>Prompt: {attempt.prompt}</Text>
      <Text style={styles.stepText}>Target: {attempt.target}</Text>
      <Text style={styles.stepText}>Learner: {attempt.learnerResponse}</Text>

      {!attempt.isCorrect && attempt.supportUsed && (
        <View style={styles.supportRow}>
          <Ionicons name="help-circle-outline" size={13} color="#C45A5A" />
          <Text style={styles.stepExpected}>
            Support used: {attempt.supportUsed}
          </Text>
        </View>
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

  modulesPanel: {
    marginTop: 16,
    backgroundColor: 'rgba(238,205,238,0.96)',
    borderRadius: 26,
    padding: 18,
  },

  infoBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  infoBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  infoBoxTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    color: '#111',
  },

  infoBoxValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B48BC7',
  },

  infoBoxBody: {
    fontSize: 10,
    color: '#333',
    lineHeight: 15,
    marginTop: 6,
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 2,
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
  },

  answerGroup: {
    marginTop: 10,
    backgroundColor: '#F8F2F8',
    borderRadius: 12,
    padding: 10,
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

  supportRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  stepExpected: {
    flex: 1,
    fontSize: 10,
    color: '#C45A5A',
    fontWeight: '700',
  },
});
