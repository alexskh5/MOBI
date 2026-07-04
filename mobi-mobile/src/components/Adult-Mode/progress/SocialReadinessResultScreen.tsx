import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ConversationAttempt,
  PeriodDashboardData,
  PeriodKey,
} from '../../../types';
import {
  AvailablePeriod,
  BottomPager,
  EmptyCard,
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

export default function SocialReadinessResultScreen({
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

  const filteredConversationAttempts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return data.socialReadiness.attempts;

    return data.socialReadiness.attempts.filter((attempt) => {
      return (
        attempt.activityName.toLowerCase().includes(query) ||
        attempt.prompt.toLowerCase().includes(query) ||
        attempt.learnerResponse.toLowerCase().includes(query) ||
        attempt.expectedResponse.toLowerCase().includes(query) ||
        attempt.appropriateness.toLowerCase().includes(query) ||
        attempt.turnTaking.toLowerCase().includes(query)
      );
    });
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

        <View style={styles.modulesPanel}>
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
        </View>

        <BottomPager
          pageNumber="3"
          onPrevious={onPrevious}
          onNext={onNext}
        />
      </View>
    </ScrollView>
  );
}

function ConversationAttemptCard({
  attempt,
}: {
  attempt: ConversationAttempt;
}) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{attempt.activityName}</Text>
        <Text style={styles.conversationBadge}>
          {attempt.appropriateness}
        </Text>
      </View>

      <Text style={styles.stepText}>Prompt: {attempt.prompt}</Text>
      <Text style={styles.stepText}>Learner: {attempt.learnerResponse}</Text>
      <Text style={styles.stepExpected}>
        Expected: {attempt.expectedResponse}
      </Text>
      <Text style={styles.stepText}>Turn-taking: {attempt.turnTaking}</Text>
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

  stepCard: {
    marginBottom: 12,
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

  conversationBadge: {
    fontSize: 8,
    fontWeight: '900',
    color: '#B48BC7',
    backgroundColor: '#F7EAF7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
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
});
