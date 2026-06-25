// src/screens/Adult-Mode/SettingsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  TextInput,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types';

const bgImage = require('../../../assets/images/background.jpg');
const mobiLogo = require('../../../assets/images/mobi_logo.png');

type SettingsTab = 'time' | 'pin';

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp<'Settings'>>();

  const [activeTab, setActiveTab] = useState<SettingsTab>('time');
  const [dailyLimit, setDailyLimit] = useState('01:30');
  const [pin, setPin] = useState('1234');

  const [editingTime, setEditingTime] = useState(false);
  const [editingPin, setEditingPin] = useState(false);
  const [showPinValue, setShowPinValue] = useState(false);

  const [showExitModal, setShowExitModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const goToChildDashboard = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'ChildDashboard' }],
      })
    );
  };

  const confirmExitAdultMode = () => {
    setShowExitModal(true);
  };

  const showSavedConfirmation = (message: string) => {
    setSavedMessage(message);
    setShowSavedModal(true);
  };

  const handleSaveTime = () => {
    setEditingTime(false);
    showSavedConfirmation('Daily limit updated successfully.');
  };

  const handleSavePin = () => {
    setEditingPin(false);
    setShowPinValue(false);
    showSavedConfirmation('Adult Mode PIN updated successfully.');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const performLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'LogIn' }],
    });
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        <View style={styles.header}>
          <Image source={mobiLogo} style={styles.logo} />

          <View style={styles.headerRight}>
            <Pressable
              style={({ pressed }) => [
                styles.headerIconButton,
                pressed && styles.pressedButton,
              ]}
              onPress={confirmExitAdultMode}
              hitSlop={12}
            >
              <Ionicons name="home" size={25} color="#B48BC7" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.profileButton,
                pressed && styles.pressedButton,
              ]}
              onPress={() => navigation.navigate('CenterProfile')}
              hitSlop={12}
            >
              <Ionicons name="person-circle" size={40} color="#B48BC7" />
            </Pressable>
          </View>
        </View>

        <View style={styles.pageHeader}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Manage Adult Mode access and child screen time.
          </Text>
        </View>

        <View style={styles.segmentedControl}>
          <Pressable
            style={[
              styles.segmentButton,
              activeTab === 'time' && styles.activeSegmentButton,
            ]}
            onPress={() => setActiveTab('time')}
          >
            <Ionicons
              name="alarm-outline"
              size={16}
              color={activeTab === 'time' ? '#B48BC7' : '#777'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'time' && styles.activeSegmentText,
              ]}
            >
              Daily Limit
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentButton,
              activeTab === 'pin' && styles.activeSegmentButton,
            ]}
            onPress={() => setActiveTab('pin')}
          >
            <Ionicons
              name="key-outline"
              size={16}
              color={activeTab === 'pin' ? '#B48BC7' : '#777'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'pin' && styles.activeSegmentText,
              ]}
            >
              Adult PIN
            </Text>
          </Pressable>
        </View>

        <View style={styles.settingsPanel}>
          {activeTab === 'time' && (
            <View>
              <View style={styles.cardHeader}>
                <View style={styles.iconBubble}>
                  <Ionicons name="time-outline" size={20} color="#B48BC7" />
                </View>

                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Daily Screen Time Limit</Text>
                  <Text style={styles.cardSubtitle}>
                    Set how long the child can use MOBI each day.
                  </Text>
                </View>
              </View>

              <View style={styles.valueCard}>
                {editingTime ? (
                  <TextInput
                    value={dailyLimit}
                    onChangeText={setDailyLimit}
                    style={styles.timeInput}
                    placeholder="01:30"
                    placeholderTextColor="#999"
                    keyboardType="numbers-and-punctuation"
                  />
                ) : (
                  <Text style={styles.timeText}>{dailyLimit}</Text>
                )}

                <Text style={styles.valueSubText}>hours & minutes per day</Text>
              </View>

              <View style={styles.infoNotice}>
                <Ionicons name="information-circle-outline" size={16} color="#B48BC7" />
                <Text style={styles.infoNoticeText}>
                  This value will later connect to backend screen-time tracking and daily usage logs.
                </Text>
              </View>

              <Pressable
                style={styles.primaryButton}
                onPress={editingTime ? handleSaveTime : () => setEditingTime(true)}
              >
                <Text style={styles.primaryButtonText}>
                  {editingTime ? 'Save Daily Limit' : 'Change Daily Limit'}
                </Text>
              </Pressable>
            </View>
          )}

          {activeTab === 'pin' && (
            <View>
              <View style={styles.cardHeader}>
                <View style={styles.iconBubble}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#B48BC7" />
                </View>

                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Adult Mode PIN</Text>
                  <Text style={styles.cardSubtitle}>
                    Protect the adult dashboard from child access.
                  </Text>
                </View>
              </View>

              <View style={styles.pinValueCard}>
                <View style={styles.pinLeft}>
                  <Text style={styles.inputLabel}>Current PIN</Text>

                  {editingPin ? (
                    <TextInput
                      value={pin}
                      onChangeText={setPin}
                      style={styles.pinInput}
                      keyboardType="number-pad"
                      secureTextEntry={!showPinValue}
                      maxLength={6}
                    />
                  ) : (
                    <Text style={styles.pinStars}>
                      {showPinValue ? pin : '••••••'}
                    </Text>
                  )}
                </View>

                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPinValue(!showPinValue)}
                >
                  <Ionicons
                    name={showPinValue ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color="#B48BC7"
                  />
                </Pressable>
              </View>

              <View style={styles.infoNotice}>
                <Ionicons name="lock-closed-outline" size={16} color="#B48BC7" />
                <Text style={styles.infoNoticeText}>
                  For backend, store only a hashed PIN or verification token, never the plain PIN.
                </Text>
              </View>

              <Pressable
                style={styles.primaryButton}
                onPress={editingPin ? handleSavePin : () => setEditingPin(true)}
              >
                <Text style={styles.primaryButtonText}>
                  {editingPin ? 'Save PIN' : 'Change PIN'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <Pressable style={styles.logoutCard} onPress={handleLogout}>
          <View style={styles.logoutLeft}>
            <View style={styles.logoutIconBubble}>
              <Ionicons name="log-out-outline" size={20} color="#C45A5A" />
            </View>

            <View>
              <Text style={styles.logoutTitle}>Log Out</Text>
              <Text style={styles.logoutSubtitle}>Return to the login screen.</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#999" />
        </Pressable>
        </ScrollView>

        <ExitAdultModeModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onExit={() => {
            setShowExitModal(false);
            goToChildDashboard();
          }}
        />

        <LogoutModal
          visible={showLogoutModal}
          onCancel={() => setShowLogoutModal(false)}
          onLogout={() => {
            setShowLogoutModal(false);
            performLogout();
          }}
        />

        <SavedModal
          visible={showSavedModal}
          message={savedMessage}
          onClose={() => setShowSavedModal(false)}
        />

        <AdultBottomNav active="settings" navigation={navigation} />
      </SafeAreaView>
    </ImageBackground>
  );
}

function ExitAdultModeModal({
  visible,
  onCancel,
  onExit,
}: {
  visible: boolean;
  onCancel: () => void;
  onExit: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.exitModal}>
          <View style={styles.modalIconCircle}>
            <Ionicons name="home" size={26} color="#B48BC7" />
          </View>

          <Text style={styles.exitTitle}>Exit Adult Mode?</Text>
          <Text style={styles.exitMessage}>
            Are you sure you want to exit? You will need to enter your PIN again to return to Adult Mode.
          </Text>

          <View style={styles.exitActions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.exitButton} onPress={onExit}>
              <Text style={styles.exitText}>Exit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}


function LogoutModal({
  visible,
  onCancel,
  onLogout,
}: {
  visible: boolean;
  onCancel: () => void;
  onLogout: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.exitModal}>
          <View style={styles.logoutModalIconCircle}>
            <Ionicons name="log-out-outline" size={26} color="#C45A5A" />
          </View>

          <Text style={styles.exitTitle}>Log Out?</Text>
          <Text style={styles.exitMessage}>
            Are you sure you want to log out? You will need to sign in again to access MOBI.
          </Text>

          <View style={styles.exitActions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.logoutConfirmButton} onPress={onLogout}>
              <Text style={styles.exitText}>Log Out</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SavedModal({
  visible,
  message,
  onClose,
}: {
  visible: boolean;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.savedModal}>
          <View style={styles.savedIconCircle}>
            <Ionicons name="checkmark" size={26} color="#4D8B57" />
          </View>

          <Text style={styles.exitTitle}>Saved</Text>
          <Text style={styles.exitMessage}>{message}</Text>

          <Pressable style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function AdultBottomNav({
  active,
  navigation,
}: {
  active: 'progress' | 'settings' | 'notifications';
  navigation: any;
}) {
  const navItems = [
    { key: 'progress', icon: 'star', route: 'AdultDashboard' },
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
              size={isActive ? 30 : 24}
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
    paddingHorizontal: 22,
  },

  scrollContent: {
    paddingBottom: 95,
  },

  header: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 99,
    elevation: 99,
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

  pageHeader: {
    marginTop: 22,
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },

  segmentedControl: {
    marginTop: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 5,
    flexDirection: 'row',
    elevation: 3,
  },

  segmentButton: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  activeSegmentButton: {
    backgroundColor: '#F7EAF7',
  },

  segmentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#777',
  },

  activeSegmentText: {
    color: '#B48BC7',
  },

  settingsPanel: {
    marginTop: 16,
    backgroundColor: 'rgba(238,205,238,0.96)',
    borderRadius: 26,
    padding: 18,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  cardHeaderText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111',
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#555',
    lineHeight: 14,
  },

  valueCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: 'center',
    elevation: 2,
  },

  timeText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#111',
  },

  timeInput: {
    fontSize: 42,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    width: 155,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#B48BC7',
  },

  valueSubText: {
    marginTop: 4,
    fontSize: 11,
    color: '#777',
  },

  infoNotice: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    elevation: 2,
  },

  infoNoticeText: {
    flex: 1,
    fontSize: 10,
    color: '#555',
    lineHeight: 15,
  },

  primaryButton: {
    marginTop: 16,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#B48BC7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  pinValueCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  pinLeft: {
    flex: 1,
  },

  inputLabel: {
    fontSize: 10,
    color: '#777',
    marginBottom: 6,
    fontWeight: '700',
  },

  pinStars: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111',
    letterSpacing: 2,
  },

  pinInput: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111',
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#B48BC7',
    width: 120,
  },

  eyeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7EAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
  },

  logoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logoutIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  logoutTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
  },

  logoutSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: '#777',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    elevation: 8,
  },

  savedModal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    elevation: 8,
    alignItems: 'center',
  },

  modalIconCircle: {
    alignSelf: 'center',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F7EAF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  savedIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E7F6EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  logoutModalIconCircle: {
    alignSelf: 'center',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FCEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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

  logoutConfirmButton: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#C45A5A',
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

  doneButton: {
    marginTop: 20,
    height: 40,
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#B48BC7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  doneButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  bottomNav: {
    position: 'absolute',
    left: 75,
    right: 75,
    bottom: 14,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 4,
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
