// src/screens/Adult-Mode/NotificationsScreen.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types';

const bgImage = require('../../../assets/images/background.jpg');
const mobiLogo = require('../../../assets/images/mobi_logo.png');

type NotificationCategory =
  | 'MOBI'
  | 'COLLABORATION'
  | 'MATERIAL'
  | 'RECENT'
  | 'ALL';

type NotificationItem = {
  id: number;
  category: Exclude<NotificationCategory, 'RECENT' | 'ALL'>;
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

  const [showExitModal, setShowExitModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<NotificationItem | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const goToChildDashboard = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'ChildDashboard' }],
      })
    );
  };

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((item) => {
      const matchesTab =
        activeTab === 'ALL' ||
        activeTab === 'RECENT' ||
        item.category === activeTab;

      const matchesSearch =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.body.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.time.toLowerCase().includes(query) ||
        (item.isRead ? 'read' : 'unread').includes(query);

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

  const markAsUnread = (id: number) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: false } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true }))
    );
  };

  const deleteNotification = () => {
    if (!notificationToDelete) return;

    setNotifications((current) =>
      current.filter((item) => item.id !== notificationToDelete.id)
    );
    setNotificationToDelete(null);
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
                onPress={() => setShowExitModal(true)}
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
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              Review MOBI alerts, materials, and collaboration updates.
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Ionicons name="notifications-outline" size={19} color="#B48BC7" />
              <Text style={styles.summaryValue}>{notifications.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>

            <View style={styles.summaryCard}>
              <Ionicons name="ellipse" size={16} color="#B48BC7" />
              <Text style={styles.summaryValue}>{unreadCount}</Text>
              <Text style={styles.summaryLabel}>Unread</Text>
            </View>

            <Pressable style={styles.markAllCard} onPress={markAllAsRead}>
              <Ionicons name="checkmark-done-outline" size={19} color="#FFFFFF" />
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={14} color="#777" />

            <TextInput
              placeholder="Search title, type, date, read, unread"
              placeholderTextColor="#777"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#999" />
              </Pressable>
            )}
          </View>

          <View style={styles.tabsScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {(['ALL', 'RECENT', 'MOBI', 'COLLABORATION', 'MATERIAL'] as NotificationCategory[]).map(
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
            </ScrollView>
          </View>

          <View style={styles.helperCard}>
            <Ionicons name="information-circle-outline" size={17} color="#B48BC7" />
            <Text style={styles.helperText}>
              Unread notifications have a purple dot. Use the “Mark as read” button after reviewing an update.
            </Text>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Notification List</Text>
              <Text style={styles.panelSubTitle}>
                {filteredNotifications.length} result{filteredNotifications.length === 1 ? '' : 's'}
              </Text>
            </View>

            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={36} color="#B48BC7" />
                <Text style={styles.emptyTitle}>No notifications found</Text>
                <Text style={styles.emptyText}>
                  Try another tab or search keyword.
                </Text>
              </View>
            ) : (
              filteredNotifications.map((item) => (
                <NotificationCard
                  key={item.id}
                  item={item}
                  onMarkAsRead={() => markAsRead(item.id)}
                  onMarkAsUnread={() => markAsUnread(item.id)}
                  onDelete={() => setNotificationToDelete(item)}
                />
              ))
            )}
          </View>
        </ScrollView>

        <ExitAdultModeModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onExit={() => {
            setShowExitModal(false);
            goToChildDashboard();
          }}
        />

        <DeleteNotificationModal
          visible={!!notificationToDelete}
          notification={notificationToDelete}
          onCancel={() => setNotificationToDelete(null)}
          onDelete={deleteNotification}
        />

        <AdultBottomNav active="notifications" navigation={navigation} />
      </SafeAreaView>
    </ImageBackground>
  );
}

function NotificationCard({
  item,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: {
  item: NotificationItem;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.notificationCard, !item.isRead && styles.unreadCard]}>
      <View style={styles.cardTopRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.mIcon}>M</Text>
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.categoryBadge}>{item.category}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.notificationBody}>{item.body}</Text>

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, item.isRead ? styles.readBadge : styles.unreadBadge]}>
          <Ionicons
            name={item.isRead ? 'checkmark-circle-outline' : 'ellipse'}
            size={12}
            color={item.isRead ? '#4D8B57' : '#B48BC7'}
          />
          <Text style={[styles.statusText, item.isRead ? styles.readText : styles.unreadText]}>
            {item.isRead ? 'Read' : 'Unread'}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        {item.isRead ? (
          <Pressable style={styles.secondaryActionButton} onPress={onMarkAsUnread}>
            <Ionicons name="mail-unread-outline" size={14} color="#B48BC7" />
            <Text style={styles.secondaryActionText}>Mark unread</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primaryActionButton} onPress={onMarkAsRead}>
            <Ionicons name="checkmark-done-outline" size={14} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Mark as read</Text>
          </Pressable>
        )}

        <Pressable style={styles.deleteActionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={14} color="#C45A5A" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </Pressable>
      </View>
    </View>
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

function DeleteNotificationModal({
  visible,
  notification,
  onCancel,
  onDelete,
}: {
  visible: boolean;
  notification: NotificationItem | null;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.exitModal}>
          <View style={styles.deleteIconCircle}>
            <Ionicons name="trash-outline" size={26} color="#C45A5A" />
          </View>

          <Text style={styles.exitTitle}>Delete Notification?</Text>
          <Text style={styles.exitMessage}>
            {notification
              ? `Remove “${notification.title}” from your notification list?`
              : 'Remove this notification from your list?'}
          </Text>

          <View style={styles.exitActions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.deleteConfirmButton} onPress={onDelete}>
              <Text style={styles.exitText}>Delete</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 20,
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
    marginTop: 20,
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

  summaryRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    elevation: 3,
  },

  summaryValue: {
    marginTop: 7,
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 10,
    color: '#777',
    fontWeight: '700',
  },

  markAllCard: {
    flex: 1.25,
    backgroundColor: '#B48BC7',
    borderRadius: 18,
    padding: 13,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  markAllText: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  searchBox: {
    marginTop: 14,
    height: 40,
    borderRadius: 16,
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
    fontSize: 11,
    marginLeft: 6,
    color: '#111',
  },

  tabsScrollWrap: {
    marginTop: 14,
  },

  tabs: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 5,
    flexDirection: 'row',
    gap: 6,
  },

  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  activeTabButton: {
    backgroundColor: '#F7EAF7',
  },

  tabText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#777',
  },

  activeTabText: {
    color: '#B48BC7',
  },

  helperCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    gap: 8,
    elevation: 2,
  },

  helperText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: '#555',
  },

  panel: {
    marginTop: 16,
    backgroundColor: 'rgba(238, 205, 238, 0.96)',
    borderRadius: 26,
    padding: 18,
    elevation: 4,
  },

  panelHeader: {
    marginBottom: 12,
  },

  panelTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
  },

  panelSubTitle: {
    marginTop: 2,
    fontSize: 10,
    color: '#777',
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 13,
    padding: 14,
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

  cardTopRow: {
    flexDirection: 'row',
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
    fontWeight: '900',
    color: '#111',
    flex: 1,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B48BC7',
    marginLeft: 6,
  },

  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  categoryBadge: {
    fontSize: 8,
    fontWeight: '900',
    color: '#B48BC7',
    backgroundColor: '#F7EAF7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },

  notificationTime: {
    fontSize: 8,
    color: '#777',
    flex: 1,
  },

  notificationBody: {
    fontSize: 10,
    color: '#333',
    marginTop: 10,
    lineHeight: 15,
  },

  statusRow: {
    marginTop: 12,
    flexDirection: 'row',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  readBadge: {
    backgroundColor: '#E7F6EA',
  },

  unreadBadge: {
    backgroundColor: '#F7EAF7',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },

  readText: {
    color: '#4D8B57',
  },

  unreadText: {
    color: '#B48BC7',
  },

  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },

  primaryActionButton: {
    flex: 1,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#B48BC7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  primaryActionText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  secondaryActionButton: {
    flex: 1,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#F7EAF7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  secondaryActionText: {
    fontSize: 10,
    color: '#B48BC7',
    fontWeight: '900',
  },

  deleteActionButton: {
    width: 92,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#FCEAEA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  deleteActionText: {
    fontSize: 10,
    color: '#C45A5A',
    fontWeight: '900',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '900',
    color: '#111',
  },

  emptyText: {
    marginTop: 4,
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

  deleteIconCircle: {
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

  deleteConfirmButton: {
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
