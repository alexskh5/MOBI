// mobi-mobile/src/screens/NotificationsScreen.tsx

import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import { NavigationProp } from '../types';

const logo =
  require('../../assets/images/mobi_logo.png');

const notifications = [
  {
    id: '1',
    title: 'MOBI System',
    message:
      'Continue building learning modules and therapy activities.',
    type: 'system',
    time: '2 hrs ago',
  },

  {
    id: '2',
    title: 'Parent Collaboration',
    message:
      'A parent shared learner progress updates with your center.',
    type: 'collaboration',
    time: '5 hrs ago',
  },

  {
    id: '3',
    title: 'Materials Review',
    message:
      'New therapy material was submitted for review.',
    type: 'materials',
    time: '1 day ago',
  },

  {
    id: '4',
    title: 'Upcoming Session',
    message:
      'You have scheduled learner sessions tomorrow.',
    type: 'schedule',
    time: '2 days ago',
  },
];

export default function NotificationsScreen() {

  const navigation =
    useNavigation<
      NavigationProp<'Notifications'>
    >();

  const route = useRoute();

  const [selectedTab, setSelectedTab] =
    useState('All');

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const tabs = [
    'All',
    'Materials',
    'Collaboration',
    'Schedule',
  ];

  const sidebarItems = [
    {
      label: 'Dashboard',
      icon: 'grid-outline',
      screen: 'Dashboard',
    },
    {
      label: 'Materials',
      icon: 'book-outline',
      screen: 'Materials',
    },
    {
      label: 'Notifications',
      icon: 'notifications-outline',
      screen: 'Notifications',
    },
    {
      label: 'Collaboration',
      icon: 'people-outline',
      screen: 'Collaboration',
    },
    {
      label: 'Schedule',
      icon: 'calendar-outline',
      screen: 'Schedule',
    },
    {
      label: 'Center Profile',
      icon: 'business-outline',
      screen: 'CenterProfile',
    },
  ];

  const filteredNotifications =
    selectedTab === 'All'
      ? notifications
      : notifications.filter((item) =>
          item.type
            .toLowerCase()
            .includes(
              selectedTab.toLowerCase()
            )
        );

  const renderNotification = ({
    item,
  }: any) => (

    <Pressable style={styles.card}>

      <View style={styles.cardLeft}>

        <View style={styles.iconCircle}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color="#B48BC7"
          />
        </View>

      </View>

      <View style={styles.cardContent}>

        <View style={styles.cardTopRow}>

          <Text style={styles.cardTitle}>
            {item.title}
          </Text>

          <Text style={styles.timeText}>
            {item.time}
          </Text>

        </View>

        <Text style={styles.cardMessage}>
          {item.message}
        </Text>

      </View>

    </Pressable>
  );

  return (

    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.mobileHeader}>

        <Pressable
          onPress={() =>
            setSidebarOpen(!sidebarOpen)
          }
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>
            ☰
          </Text>
        </Pressable>

        <View style={styles.headerCenter}>

          <Image
            source={logo}
            style={styles.logo}
          />

          <View>
            <Text style={styles.title}>
              Notifications
            </Text>

            <Text style={styles.subtitleSmall}>
              System updates & alerts
            </Text>
          </View>

        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() =>
            navigation.navigate(
              'CenterProfile'
            )
          }
        >
          <Text style={styles.profileIcon}>
            👤
          </Text>
        </Pressable>

      </View>

      {/* SIDEBAR */}

      {sidebarOpen && (
        <>
          <View style={styles.overlay}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() =>
                setSidebarOpen(false)
              }
            />
          </View>

          <View style={styles.sidebar}>

            <View
              style={styles.sidebarHeader}
            >
              <Image
                source={logo}
                style={styles.sidebarLogo}
              />

              <Text
                style={styles.sidebarTitle}
              >
                MOBI
              </Text>
            </View>

            {sidebarItems.map((item) => {

              const isActive =
                route.name.toString() ===
                item.screen;

              return (

                <Pressable
                  key={item.label}
                  style={[
                    styles.sidebarItem,
                    isActive &&
                      styles.activeSidebarItem,
                  ]}
                  onPress={() => {

                    setSidebarOpen(false);

                    navigation.navigate(
                      item.screen as never
                    );
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={
                      isActive
                        ? '#FFFFFF'
                        : '#555'
                    }
                  />

                  <Text
                    style={[
                      styles.sidebarText,
                      isActive &&
                        styles.activeSidebarText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* SEARCH */}

      <View style={styles.searchContainer}>

        <Ionicons
          name="search-outline"
          size={18}
          color="#777"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search notifications..."
          placeholderTextColor="#777"
        />

      </View>

      {/* TABS */}

      <View style={styles.tabsContainer}>

        {tabs.map((tab) => {

          const active =
            selectedTab === tab;

          return (

            <Pressable
              key={tab}
              style={[
                styles.tabButton,
                active &&
                  styles.activeTabButton,
              ]}
              onPress={() =>
                setSelectedTab(tab)
              }
            >
              <Text
                style={[
                  styles.tabText,
                  active &&
                    styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* LIST */}

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={
          false
        }
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4EAF5',
  },

  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5D8E5',
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEDDED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },

  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 14,
  },

  logo: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
  },

  subtitleSmall: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEDDED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIcon: {
    fontSize: 18,
  },

  searchContainer: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D8E5',
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#222',
  },

  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  activeTabButton: {
    backgroundColor: '#EBCBFF',
  },

  tabText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 13,
  },

  activeTabText: {
    color: '#9C5BCF',
    fontWeight: '800',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  cardLeft: {
    marginRight: 14,
    justifyContent: 'center',
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContent: {
    flex: 1,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#222',
    flex: 1,
    marginRight: 10,
  },

  timeText: {
    fontSize: 11,
    color: '#888',
  },

  cardMessage: {
    marginTop: 6,
    color: '#666',
    lineHeight: 20,
    fontSize: 13,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(0,0,0,0.25)',
    zIndex: 20,
  },

  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#FFFFFF',
    paddingTop: 70,
    paddingHorizontal: 18,
    zIndex: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  sidebarLogo: {
    width: 100,
    height: 70,
    resizeMode: 'contain',
    marginRight: 10,
  },

  sidebarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },

  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
  },

  activeSidebarItem: {
    backgroundColor: '#B48BC7',
  },

  sidebarText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#444',
  },

  activeSidebarText: {
    color: '#FFFFFF',
  },

});