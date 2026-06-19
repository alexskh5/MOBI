// progress section, star icon

// june 19 friday to fix bfr meeting!!! : 
// navbar ilhanan where we are currently (bigger ba run ang icon)
// see all in progress and next pages
// graph bar
// ma change ang settings (pin, time)
// add routing to learner profile, then if center user, then center




// src/screens/Adult-Mode/AdultDashboardScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types';

const bgImage = require('../../../assets/images/background.jpg');
const mobiLogo = require('../../../assets/images/mobi_logo.png');

const analysisCards = [
  {
    id: 1,
    title: 'Speech and Vocabulary',
    status: 'Improving',
    icon: 'chatbubble-ellipses-outline',
    body:
      'Lexi has shown steady improvement in speech and vocabulary. She can now form simple sentences with less support and responds better to visual prompts.',
  },
  {
    id: 2,
    title: 'Social Readiness',
    status: 'Developing',
    icon: 'people-outline',
    body:
      'Lexi is gradually becoming more comfortable with social interaction. She is starting to recognize turn-taking and simple peer engagement cues.',
  },
  {
    id: 3,
    title: 'Learning Engagement',
    status: 'Strong',
    icon: 'sparkles-outline',
    body:
      'Lexi remained engaged during short guided activities. She responds best when activities are visual, repetitive, and paced slowly.',
  },
];

const progressStats = [
  { label: 'Activities', value: '3/5', icon: 'layers-outline' },
  { label: 'Words', value: '12', icon: 'text-outline' },
  { label: 'Focus Time', value: '15m', icon: 'time-outline' },
];

export default function AdultDashboardScreen() {
  const navigation = useNavigation<NavigationProp<'AdultDashboard'>>();
  const [page, setPage] = useState(0);

  const goNext = () => {
    if (page < 3) setPage(page + 1);
  };

  const goPrevious = () => {
    if (page > 1) setPage(page - 1);
    else setPage(0);
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        {page === 0 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Image source={mobiLogo} style={styles.logo} />

              <Pressable style={styles.profileButton} onPress={() => navigation.navigate('CenterProfile')}>
                <Ionicons name="person-circle" size={40} color="#B48BC7" />
              </Pressable>
            </View>

            <Text style={styles.childTitle}>Lexi’s Progress</Text>
            <Text style={styles.childSubtitle}>Today’s progress overview</Text>

            <View style={styles.statsRow}>
              {progressStats.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Ionicons name={stat.icon as any} size={18} color="#B48BC7" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.chartCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.mainTitle}>AI Analysis</Text>
                  <Text style={styles.subTitle}>Child progress with MOBI</Text>
                </View>

                <View style={styles.filterPill}>
                  <Text style={styles.filterText}>Per Day</Text>
                </View>
              </View>

              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, styles.speechDot]} />
                  <Text style={styles.legendText}>Speech</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.dot, styles.socialDot]} />
                  <Text style={styles.legendText}>Social</Text>
                </View>
              </View>

              <View style={styles.chartArea}>
                {[30, 55, 72, 125, 110, 135, 122].map((height, index) => (
                  <View key={index} style={styles.barGroup}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height,
                          backgroundColor: index % 2 === 0 ? '#70D8D8' : '#F48CB4',
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>{index + 1}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.aiPanel}>
              <View style={styles.aiHeaderRow}>
                <View>
                  <Text style={styles.panelTitle}>AI Insights</Text>
                  <Text style={styles.panelSubtitle}>Generated learning observations</Text>
                </View>

                <Pressable onPress={() => setPage(1)}>
                  <Text style={styles.seeAll}>See all</Text>
                </Pressable>
              </View>

              {analysisCards.slice(0, 2).map((card) => (
                <AnalysisCard key={card.id} card={card} />
              ))}
            </View>
          </ScrollView>
        )}

        {page === 1 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <TopBackHeader onBack={() => setPage(0)} />

            <Text style={styles.mainTitle}>AI Analysis</Text>
            <Text style={styles.subTitle}>Complete progress summary</Text>

            <View style={styles.largePurplePanel}>
              <Text style={styles.graphSummaryTitle}>Graph Summary</Text>

              {analysisCards.map((card) => (
                <AnalysisCard key={card.id} card={card} />
              ))}
            </View>

            <BottomPager pageNumber="1" onPrevious={goPrevious} onNext={goNext} />
          </ScrollView>
        )}

        {page === 2 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <TopBackHeader onBack={() => setPage(0)} />

            <Text style={styles.mainTitle}>Learning Progress</Text>
            <Text style={styles.subTitle}>Modules and engagement summary</Text>

            <View style={styles.modulesPanel}>
              <InfoBox title="Activities Completed" value="2">
                • Making Friends — 8 minutes{'\n'}
                • Vocabulary: Animals — 7 minutes
              </InfoBox>

              <InfoBox title="New Words Learned" value="2">
                • What’s your name?{'\n'}
                • Dinosaurs
              </InfoBox>

              <InfoBox title="Most Used Words">
                • Yes & No{'\n'}
                • All done{'\n'}
                • More please
              </InfoBox>

              <InfoBox title="Total Learning Time">15 minutes</InfoBox>
              <InfoBox title="Total Eye Gaze Time">10 minutes</InfoBox>
              <InfoBox title="Total Inactivity Time">3 minutes</InfoBox>
            </View>

            <BottomPager pageNumber="2" onPrevious={goPrevious} onNext={goNext} />
          </ScrollView>
        )}

        {page === 3 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <TopBackHeader onBack={() => setPage(0)} />

            <Text style={styles.mainTitle}>Per Activity Analysis</Text>
            <Text style={styles.subTitle}>Detailed activity observation</Text>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={13} color="#777" />
              <TextInput placeholder="Search" placeholderTextColor="#999" style={styles.searchInput} />
            </View>

            <View style={styles.bigWhiteReport}>
              <Text style={styles.bulletTitle}>Making Friends</Text>
              <Text style={styles.minutes}>7 minutes completed</Text>

              <ReportRow label="Success Rate" value="85%" />
              <ReportRow label="Engagement Level" value="High" />

              <Text style={styles.reportTitle}>AI Observation Summary</Text>
              <Text style={styles.reportBody}>
                Lexi demonstrated strong participation during the activity. She maintained attention,
                recognized greetings, and showed progress with turn-taking. Continued practice may improve response speed.
              </Text>

              <Pressable>
                <Text style={styles.nextActivity}>Next Activity →</Text>
              </Pressable>
            </View>

            <BottomPager pageNumber="4" onPrevious={goPrevious} onNext={goNext} />
          </ScrollView>
        )}

        <AdultBottomNav active="progress" navigation={navigation} />
      </SafeAreaView>
    </ImageBackground>
  );
}

function AnalysisCard({ card }: { card: any }) {
  return (
    <View style={styles.analysisCard}>
      <View style={styles.analysisIcon}>
        <Ionicons name={card.icon} size={18} color="#B48BC7" />
      </View>

      <View style={styles.analysisContent}>
        <View style={styles.analysisTopRow}>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.statusBadge}>{card.status}</Text>
        </View>

        <Text style={styles.bodyText}>{card.body}</Text>
      </View>
    </View>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reportRow}>
      <Text style={styles.reportLabel}>{label}</Text>
      <Text style={styles.reportValue}>{value}</Text>
    </View>
  );
}

function TopBackHeader({ onBack }: { onBack: () => void }) {
  return (
    <Pressable onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back" size={21} color="#111" />
    </Pressable>
  );
}

function InfoBox({ title, value, children }: any) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoBoxHeader}>
        <Text style={styles.infoBoxTitle}>{title}</Text>
        {value && <Text style={styles.infoBoxValue}>{value}</Text>}
      </View>

      {children && <Text style={styles.infoBoxBody}>{children}</Text>}
    </View>
  );
}

function BottomPager({ pageNumber, onPrevious, onNext }: any) {
  return (
    <View style={styles.pagerRow}>
      <Pressable style={styles.pagerButton} onPress={onPrevious}>
        <Ionicons name="chevron-back" size={13} color="#888" />
      </Pressable>

      <Pressable style={styles.pagerButton} onPress={onNext}>
        <Ionicons name="chevron-forward" size={13} color="#888" />
      </Pressable>

      <Text style={styles.pageCount}>{pageNumber} of 4</Text>
    </View>
  );
}

function AdultBottomNav({ active, navigation }: any) {
  const navItems = [
    { key: 'progress', icon: 'star', route: 'AdultDashboard' },
    { key: 'home', icon: 'home', route: 'ChildDashboard' },
    { key: 'settings', icon: 'settings', route: 'Settings' },
    { key: 'notifications', icon: 'notifications', route: 'Notifications' },
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = active === item.key;

        return (
          <Pressable
            key={item.key}
            style={[styles.navButton, isActive && styles.activeNavButton]}
            onPress={() => navigation.navigate(item.route)}
          >
            <Ionicons
              name={item.icon as any}
              size={isActive ? 28 : 23}
              color={isActive ? '#B48BC7' : '#999'}
            />

            {isActive && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 85 },

  header: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: { width: 76, height: 46, resizeMode: 'contain' },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  childTitle: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 19,
    fontWeight: '900',
    color: '#111',
  },

  childSubtitle: {
    textAlign: 'center',
    marginTop: 3,
    fontSize: 10,
    color: '#777',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#F2DDF2',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 3,
  },

  statValue: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
  },

  statLabel: {
    marginTop: 2,
    fontSize: 9,
    color: '#777',
  },

  chartCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    elevation: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  mainTitle: { fontSize: 18, fontWeight: '900', color: '#111' },
  subTitle: { fontSize: 10, color: '#777', marginTop: 2 },

  filterPill: {
    backgroundColor: '#F2DDF2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },

  filterText: { fontSize: 9, fontWeight: '800', color: '#B48BC7' },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 22,
    marginTop: 14,
  },

  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  speechDot: { backgroundColor: '#70D8D8' },
  socialDot: { backgroundColor: '#F48CB4' },
  legendText: { fontSize: 9, color: '#555' },

  chartArea: {
    height: 165,
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },

  barGroup: { alignItems: 'center', justifyContent: 'flex-end' },
  chartBar: { width: 20, borderRadius: 10 },
  barLabel: { fontSize: 8, color: '#777', marginTop: 5 },

  aiPanel: {
    marginTop: 16,
    backgroundColor: 'rgba(238,205,238,0.96)',
    borderRadius: 28,
    padding: 18,
  },

  aiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  panelTitle: { fontSize: 17, fontWeight: '900', color: '#111' },
  panelSubtitle: { fontSize: 9, color: '#777', marginTop: 2 },
  seeAll: { fontSize: 10, fontWeight: '800', color: '#B48BC7' },

  analysisCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    elevation: 3,
  },

  analysisIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2DDF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  analysisContent: { flex: 1 },
  analysisTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 12, fontWeight: '900', color: '#111', flex: 1 },
  statusBadge: {
    fontSize: 8,
    fontWeight: '800',
    color: '#B48BC7',
    backgroundColor: '#F2DDF2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bodyText: {
    marginTop: 7,
    fontSize: 10,
    color: '#333',
    lineHeight: 15,
  },

  backButton: { marginTop: 16, marginBottom: 18 },

  largePurplePanel: {
    marginTop: 16,
    backgroundColor: 'rgba(238,205,238,0.96)',
    borderRadius: 26,
    padding: 18,
  },

  graphSummaryTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
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

  infoBoxHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBoxTitle: { fontSize: 11, fontWeight: '900', color: '#111' },
  infoBoxValue: { fontSize: 12, fontWeight: '900', color: '#B48BC7' },
  infoBoxBody: { fontSize: 10, color: '#333', lineHeight: 15, marginTop: 6 },

  searchBox: {
    marginTop: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchInput: { flex: 1, fontSize: 10, marginLeft: 6 },

  bigWhiteReport: {
    marginTop: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    elevation: 4,
  },

  bulletTitle: { fontSize: 16, fontWeight: '900', color: '#111' },
  minutes: { fontSize: 10, color: '#777', marginTop: 3, marginBottom: 16 },
  reportRow: {
    marginTop: 12,
    backgroundColor: '#F8F2F8',
    borderRadius: 12,
    padding: 12,
  },
  reportLabel: { fontSize: 10, color: '#777' },
  reportValue: { fontSize: 16, fontWeight: '900', color: '#B48BC7' },
  reportTitle: { fontSize: 13, fontWeight: '900', marginTop: 18 },
  reportBody: { fontSize: 10, color: '#333', lineHeight: 15, marginTop: 8 },
  nextActivity: {
    marginTop: 18,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '900',
    color: '#B48BC7',
  },

  pagerRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pagerButton: {
    width: 32,
    height: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#AAA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFF',
  },

  pageCount: {
    marginLeft: 'auto',
    fontSize: 10,
    color: '#777',
  },

  bottomNav: {
    position: 'absolute',
    left: 55,
    right: 55,
    bottom: 14,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 5,
  },

  navButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeNavButton: {
    backgroundColor: '#F2DDF2',
    borderRadius: 12,
  },

  activeDot: {
    position: 'absolute',
    bottom: 3,
    width: 18,
    height: 3,
    borderRadius: 4,
    backgroundColor: '#B48BC7',
  },
});