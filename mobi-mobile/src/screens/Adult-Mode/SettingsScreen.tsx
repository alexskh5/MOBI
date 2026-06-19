import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types';

const bgImage = require('../../../assets/images/background.jpg');

type SettingsTab = 'time' | 'pin';

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp<'Settings'>>();

  const [activeTab, setActiveTab] = useState<SettingsTab>('time');

  const [dailyLimit, setDailyLimit] = useState('01:30');
  const [pin, setPin] = useState('1234');

  const [editingTime, setEditingTime] = useState(false);
  const [editingPin, setEditingPin] = useState(false);
  const [showPinValue, setShowPinValue] = useState(false);

  const handleSaveTime = () => {
    setEditingTime(false);
    Alert.alert('Saved', 'Daily limit updated.');
  };

  const handleSavePin = () => {
    setEditingPin(false);
    setShowPinValue(false);
    Alert.alert('Saved', 'Adult mode PIN updated.');
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>SETTINGS</Text>

        <View style={styles.settingsCard}>
          <Pressable style={styles.rowTitle} onPress={() => setActiveTab('time')}>
            <Ionicons
              name="alarm-outline"
              size={28}
              color={activeTab === 'time' ? '#B48BC7' : '#aaa'}
            />

            <Text
              style={[
                styles.rowTitleText,
                activeTab === 'time' && styles.activeSettingText,
              ]}
            >
              Daily Limit
            </Text>
          </Pressable>

          {activeTab === 'time' && (
            <View style={styles.timeCard}>
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

              <Text style={styles.timeSub}>hours & minutes{'\n'}per day.</Text>

              <Pressable
                style={styles.changeButton}
                onPress={editingTime ? handleSaveTime : () => setEditingTime(true)}
              >
                <Text style={styles.changeText}>
                  {editingTime ? 'Save' : 'Change'}
                </Text>
              </Pressable>
            </View>
          )}

          <View style={styles.divider} />

          <Pressable style={styles.settingRow} onPress={() => setActiveTab('pin')}>
            <Ionicons
              name="key-outline"
              size={27}
              color={activeTab === 'pin' ? '#B48BC7' : '#aaa'}
            />

            <Text
              style={[
                styles.settingLabel,
                activeTab === 'pin' && styles.activeSettingText,
              ]}
            >
              Adult Mode Pin
            </Text>
          </Pressable>

          {activeTab === 'pin' && (
            <View style={styles.pinCard}>
              <View style={styles.pinLeft}>
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
                    {showPinValue ? pin : 'xxxxxxxx'}
                  </Text>
                )}

                <Pressable onPress={() => setShowPinValue(!showPinValue)}>
                  <Text style={styles.seePin}>
                    {showPinValue ? 'Hide pin' : 'See pin'}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.pinChangeButton}
                onPress={editingPin ? handleSavePin : () => setEditingPin(true)}
              >
                <Text style={styles.changeText}>
                  {editingPin ? 'Save' : 'Change'}
                </Text>
              </Pressable>
            </View>
          )}

          <View style={styles.divider} />

          <Pressable
            style={styles.settingRow}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'LogIn' }],
              })
            }
          >
            <Ionicons name="log-out-outline" size={27} color="#aaa" />
            <Text style={styles.settingLabel}>Log Out</Text>
          </Pressable>
        </View>

        <AdultBottomNav active="settings" navigation={navigation} />
      </SafeAreaView>
    </ImageBackground>
  );
}

function AdultBottomNav({
  active,
  navigation,
}: {
  active: 'progress' | 'settings' | 'notifications' | 'home';
  navigation: any;
}) {
  const navItems = [
    {
      key: 'progress',
      icon: 'star',
      route: 'AdultDashboard',
    },
    {
      key: 'home',
      icon: 'home',
      route: 'ChildDashboard',
    },
    {
      key: 'settings',
      icon: 'settings',
      route: 'Settings',
    },
    {
      key: 'notifications',
      icon: 'notifications',
      route: 'Notifications',
    },
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

  title: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 21,
    fontWeight: '800',
    color: '#111',
  },

  settingsCard: {
    marginTop: 45,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 45,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
  },

  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  rowTitleText: {
    fontSize: 14,
    marginLeft: 13,
    color: '#111',
  },

  activeSettingText: {
    color: '#B48BC7',
    fontWeight: '800',
  },

  timeCard: {
    backgroundColor: '#EFD9EF',
    borderRadius: 8,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    paddingBottom: 20,
  },

  timeText: {
    fontSize: 38,
    color: '#111',
  },

  timeInput: {
    fontSize: 38,
    color: '#111',
    textAlign: 'center',
    width: 150,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#B48BC7',
  },

  timeSub: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    color: '#111',
  },

  changeButton: {
    marginTop: 12,
    backgroundColor: '#E6C5E6',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 13,
  },

  changeText: {
    color: '#9A7A9A',
    fontSize: 12,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#999',
    marginVertical: 16,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
  },

  settingLabel: {
    fontSize: 14,
    marginLeft: 13,
    color: '#111',
  },

  pinCard: {
    backgroundColor: '#EFD9EF',
    borderRadius: 8,
    padding: 16,
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pinLeft: {
    flex: 1,
  },

  pinStars: {
    fontSize: 12,
    color: '#111',
  },

  pinInput: {
    fontSize: 14,
    color: '#111',
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#B48BC7',
    width: 95,
  },

  seePin: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
    color: '#111',
  },

  pinChangeButton: {
    backgroundColor: '#E6C5E6',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 13,
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