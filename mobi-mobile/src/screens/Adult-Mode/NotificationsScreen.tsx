import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types';

const bgImage = require('../../../assets/images/background.jpg');

type NotificationCategory =
  | 'MOBI'
  | 'COLLABORATION'
  | 'MATERIAL'
  | 'RECENT'
  | 'ALL';

type NotificationItem = {
  id: number;
  category: NotificationCategory;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    category: 'MOBI',
    title: 'Daily limit almost exceeded',
    body: 'Dear guardian/therapist, please be aware of the daily screen time limit.',
    time: 'Today, 3:00 PM',
    isRead: false,
  },
  {
    id: 2,
    category: 'MOBI',
    title: 'Finish previous activity',
    body: 'When the child seems ready again, you may revisit the previous activity.',
    time: 'Yesterday, 7:00 PM',
    isRead: false,
  },
  {
    id: 3,
    category: 'MATERIAL',
    title: 'Try this activity',
    body: 'This suggested activity may help the child apply learned words in real life.',
    time: '11/18/25 - 12:00 PM',
    isRead: true,
  },
  {
    id: 4,
    category: 'COLLABORATION',
    title: 'Therapist note added',
    body: 'A new observation note was added for Lexi’s recent learning session.',
    time: '11/18/25 - 10:30 AM',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp<'Notifications'>>();

  const [activeTab, setActiveTab] = useState<NotificationCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesTab =
        activeTab === 'ALL' ||
        activeTab === 'RECENT' ||
        item.category === activeTab;

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.body.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, notifications]);

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  const deleteNotification = (id: number) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to remove this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            setNotifications((current) =>
              current.filter((item) => item.id !== id)
            ),
        },
      ]
    );
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>NOTIFICATIONS</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={14} color="#777" />

          <TextInput
            placeholder="Search"
            placeholderTextColor="#777"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={15} color="#999" />
            </Pressable>
          )}
        </View>

        <View style={styles.panel}>
          <View style={styles.tabs}>
            {(['MOBI', 'COLLABORATION', 'MATERIAL', 'RECENT', 'ALL'] as NotificationCategory[]).map(
              (tab) => {
                const isActive = activeTab === tab;

                return (
                  <Pressable
                    key={tab}
                    style={[styles.tabButton, isActive && styles.activeTabButton]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                      {tab}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={34} color="#B48BC7" />
                <Text style={styles.emptyTitle}>No notifications found</Text>
                <Text style={styles.emptyText}>
                  Try another tab or search keyword.
                </Text>
              </View>
            ) : (
              filteredNotifications.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.notificationCard,
                    !item.isRead && styles.unreadCard,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <Text style={styles.mIcon}>M</Text>
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.notificationTitle}>{item.title}</Text>

                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.notificationBody}>{item.body}</Text>

                    <View style={styles.footerRow}>
                      <Text style={styles.notificationTime}>{item.time}</Text>

                      <View style={styles.cardIcons}>
                        <Pressable onPress={() => markAsRead(item.id)}>
                          <Ionicons
                            name={item.isRead ? 'eye-outline' : 'eye'}
                            size={15}
                            color="#777"
                          />
                        </Pressable>

                        <Pressable onPress={() => deleteNotification(item.id)}>
                          <Ionicons name="trash-outline" size={15} color="#C45A5A" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <AdultBottomNav active="notifications" navigation={navigation} />
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
    paddingHorizontal: 20,
  },

  title: {
    textAlign: 'center',
    marginTop: 38,
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    letterSpacing: 0.5,
  },

  searchBox: {
    marginTop: 14,
    alignSelf: 'center',
    width: 220,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    marginLeft: 6,
    color: '#111',
  },

  panel: {
    flex: 1,
    marginTop: 20,
    backgroundColor: 'rgba(238, 205, 238, 0.96)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 18,
    paddingBottom: 72,
  },

  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },

  tabButton: {
    paddingHorizontal: 7,
    paddingVertical: 7,
    borderRadius: 10,
  },

  activeTabButton: {
    backgroundColor: '#F2DDF2',
  },

  tabText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#777',
  },

  activeTabText: {
    color: '#B48BC7',
  },

  notificationCard: {
    minHeight: 84,
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 12,
    padding: 13,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F2E7F2',
  },

  unreadCard: {
    borderColor: '#B48BC7',
    backgroundColor: '#FFF9FF',
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF2EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  mIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F45B2F',
  },

  notificationContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111',
    flex: 1,
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#B48BC7',
    marginLeft: 6,
  },

  notificationBody: {
    fontSize: 9,
    color: '#333',
    marginTop: 4,
    lineHeight: 13,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  notificationTime: {
    fontSize: 8,
    color: '#777',
    flex: 1,
  },

  cardIcons: {
    flexDirection: 'row',
    gap: 10,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '800',
    color: '#111',
  },

  emptyText: {
    marginTop: 4,
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