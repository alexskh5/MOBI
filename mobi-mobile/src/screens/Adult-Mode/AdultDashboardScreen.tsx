// src/screens/Adult-Mode/AdultDashboardScreen.tsx

import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NavigationProp, PeriodKey } from '../../types';

import PerActivityAnalysisScreen from '../../components/Adult-Mode/progress/PerActivityAnalysisScreen';
import ProgressOverviewScreen from '../../components/Adult-Mode/progress/ProgressOverviewScreen';
import SocialReadinessResultScreen from '../../components/Adult-Mode/progress/SocialReadinessResultScreen';
import SpeechTrainingResultScreen from '../../components/Adult-Mode/progress/SpeechTrainingResultScreen';
import {
  dashboardData,
  periodOptions,
  progressGraphDataByPeriod,
  userUsageDays,
} from '../../components/Adult-Mode/progress/progressData';

const bgImage = require('../../../assets/images/background.jpg');
const mobiLogo = require('../../../assets/images/mobi_logo.png');

const learner = {
  firstName: 'Lexi Rose',
  lastName: 'Pantaleon',
  age: 8,
};

export default function AdultDashboardScreen() {
  const navigation = useNavigation<NavigationProp<'AdultDashboard'>>();
  const { width } = useWindowDimensions();

  const [page, setPage] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('day');
  const [showExitModal, setShowExitModal] = useState(false);

  const availablePeriods = useMemo(
    () =>
      periodOptions.map((period) => ({
        ...period,
        enabled: userUsageDays >= period.minDaysRequired,
      })),
    []
  );

  const currentData = dashboardData[selectedPeriod];
  const currentGraphData = progressGraphDataByPeriod[selectedPeriod];

  const horizontalPadding = width >= 768 ? 32 : width < 360 ? 12 : 20;
  const bottomNavWidth = Math.min(Math.max(width * 0.62, 220), 360);

  const handleSelectPeriod = (period: PeriodKey, enabled: boolean) => {
    if (!enabled) return;
    setSelectedPeriod(period);
  };

  const goToChildDashboard = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'ChildDashboard' }],
      })
    );
  };

  const goPreviousPage = () => {
    setPage((currentPage) => Math.max(currentPage - 1, 0));
  };

  const goNextPage = () => {
    setPage((currentPage) => Math.min(currentPage + 1, 3));
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView
        style={[
          styles.container,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
        {page === 0 && (
          <>
            <AdultHeader
              onHomePress={() => setShowExitModal(true)}
              onProfilePress={() => navigation.navigate('CenterProfile')}
            />

            <View style={styles.screenBody}>
              <ProgressOverviewScreen
                learner={learner}
                data={currentData}
                graphData={currentGraphData}
                selectedPeriod={selectedPeriod}
                periods={availablePeriods}
                onSelectPeriod={handleSelectPeriod}
                onPrevious={goPreviousPage}
                onNext={goNextPage}
              />
            </View>
          </>
        )}

        {page === 1 && (
          <View style={styles.screenBody}>
            <SpeechTrainingResultScreen
              data={currentData}
              selectedPeriod={selectedPeriod}
              periods={availablePeriods}
              onSelectPeriod={handleSelectPeriod}
              onBack={() => setPage(0)}
              onPrevious={goPreviousPage}
              onNext={goNextPage}
            />
          </View>
        )}

        {page === 2 && (
          <View style={styles.screenBody}>
            <SocialReadinessResultScreen
              data={currentData}
              selectedPeriod={selectedPeriod}
              periods={availablePeriods}
              onSelectPeriod={handleSelectPeriod}
              onBack={() => setPage(0)}
              onPrevious={goPreviousPage}
              onNext={goNextPage}
            />
          </View>
        )}

        {page === 3 && (
          <View style={styles.screenBody}>
            <PerActivityAnalysisScreen
              data={currentData}
              selectedPeriod={selectedPeriod}
              periods={availablePeriods}
              onSelectPeriod={handleSelectPeriod}
              onBack={() => setPage(0)}
              onPrevious={goPreviousPage}
              onNext={goNextPage}
            />
          </View>
        )}

        <Modal transparent visible={showExitModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.exitModal}>
              <Text style={styles.exitTitle}>Exit Adult Mode?</Text>
              <Text style={styles.exitMessage}>
                Are you sure you want to exit? You will need to enter your PIN
                again to return to Adult Mode.
              </Text>

              <View style={styles.exitActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowExitModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={styles.exitButton}
                  onPress={() => {
                    setShowExitModal(false);
                    goToChildDashboard();
                  }}
                >
                  <Text style={styles.exitText}>Exit</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <AdultBottomNav
          active="progress"
          navigation={navigation}
          width={bottomNavWidth}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

function AdultHeader({
  onHomePress,
  onProfilePress,
}: {
  onHomePress: () => void;
  onProfilePress: () => void;
}) {
  return (
    <View style={styles.header}>
      <Image source={mobiLogo} style={styles.logo} />

      <View style={styles.headerRight}>
        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.headerIconButton,
            pressed && styles.pressedButton,
          ]}
          onPress={onHomePress}
          hitSlop={12}
          accessibilityLabel="Exit Adult Mode"
        >
          <Ionicons name="home" size={25} color="#B48BC7" />
        </Pressable>

        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.profileButton,
            pressed && styles.pressedButton,
          ]}
          onPress={onProfilePress}
          hitSlop={12}
          accessibilityLabel="Open profile"
        >
          <Ionicons name="person-circle" size={40} color="#B48BC7" />
        </Pressable>
      </View>
    </View>
  );
}

function AdultBottomNav({
  active,
  navigation,
  width,
}: {
  active: 'progress' | 'settings' | 'notifications';
  navigation: NavigationProp<'AdultDashboard'>;
  width: number;
}) {
  const navItems = [
    { key: 'progress', icon: 'star', route: 'AdultDashboard' },
    { key: 'settings', icon: 'settings', route: 'Settings' },
    { key: 'notifications', icon: 'notifications', route: 'Notifications' },
  ] as const;

  return (
    <View
      style={[
        styles.bottomNav,
        {
          width,
          left: '50%',
          marginLeft: -width / 2,
        },
      ]}
    >
      {navItems.map((item) => {
        const isActive = active === item.key;

        return (
          <Pressable
            key={item.key}
            style={[styles.navButton, isActive && styles.activeNavButton]}
            onPress={() => navigation.navigate(item.route)}
            accessibilityLabel={`Open ${item.key}`}
          >
            <Ionicons
              name={item.icon}
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
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
  },

  screenBody: {
    flex: 1,
    minHeight: 0,
  },

  header: {
    marginTop: 12,
    marginBottom: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    width: 76,
    height: 46,
    resizeMode: 'contain',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  pressedButton: {
    opacity: 0.65,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 14,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },

  navButton: {
    width: 46,
    height: 44,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  exitModal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    elevation: 8,
  },

  exitTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
  },

  exitMessage: {
    marginTop: 10,
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    textAlign: 'center',
  },

  exitActions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  exitButton: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#B48BC7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#555',
  },

  exitText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
