// mobi-mobile/src/screens/ScheduleScreen.tsx

import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  ScrollView,
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

const unassignedStudents = [
  'Lea Sarsoza',
  'Harry Potter',
  'Albus Severus',
  'George Weasley',
];

const scheduleData = [
  {
    time: '8:00 AM',
    status: 'Occupied',
    learner: 'Lexi Pantaleon',
  },

  {
    time: '9:30 AM',
    status: 'Pending',
    learner: 'Jane Lee',
    highlight: true,
  },

  {
    time: '11:00 AM',
    status: 'Occupied',
    learner: 'Ron Weasley',
  },

  {
    break: true,
    label: '12:00 NN - LUNCH BREAK',
  },

  {
    time: '1:00 PM',
    status: 'Occupied',
    learner: 'Ginny Weasley',
  },

  {
    time: '2:00 PM',
    status: 'Occupied',
    learner: 'Lesley Baguio',
  },

  {
    time: '3:00 PM',
    status: 'Occupied',
    learner: 'Lesley Baguio',
  },

  {
    end: true,
    label: '5:00 PM - END OF DUTY',
  },
];

export default function ScheduleScreen() {

  const navigation =
    useNavigation<
      NavigationProp<'Schedule'>
    >();

  const route = useRoute();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

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
              Schedule
            </Text>

            <Text style={styles.subtitleSmall}>
              Session schedules & planning
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
          placeholder="Search schedule..."
          placeholderTextColor="#777"
        />

      </View>

      {/* TOP BUTTONS */}

      <View style={styles.topButtons}>

        <Pressable
          style={styles.addButton}
        >
          <Ionicons
            name="add-outline"
            size={18}
            color="#FFF"
          />

          <Text style={styles.addButtonText}>
            Add Schedule
          </Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color="#B94A4A"
          />
        </Pressable>

      </View>

      {/* CONTENT */}

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* THERAPIST */}

        <View style={styles.sectionCard}>

          <Text style={styles.sectionTitle}>
            Assigned Therapist
          </Text>

          <View style={styles.therapistRow}>

            <View style={styles.avatarCircle}>
              <Ionicons
                name="person-outline"
                size={16}
                color="#B48BC7"
              />
            </View>

            <Text style={styles.therapistName}>
              Ruby Jane, OT
            </Text>

            <Ionicons
              name="create-outline"
              size={18}
              color="#666"
              style={{ marginLeft: 'auto' }}
            />

          </View>

        </View>

        {/* STUDENTS */}

        <View style={styles.sectionCard}>

          <Text style={styles.sectionTitle}>
            Unassigned Students
          </Text>

          {unassignedStudents.map(
            (student) => (

              <View
                key={student}
                style={styles.studentRow}
              >

                <View
                  style={styles.avatarCircle}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color="#B48BC7"
                  />
                </View>

                <Text
                  style={styles.studentName}
                >
                  {student}
                </Text>

              </View>
            )
          )}

        </View>

        {/* SCHEDULE */}

        <View style={styles.scheduleCard}>

          <View style={styles.scheduleHeader}>

            <Text
              style={styles.scheduleDate}
            >
              June 01, 2026
            </Text>

            <Ionicons
              name="calendar-outline"
              size={20}
              color="#666"
            />

          </View>

          {scheduleData.map(
            (item, index) => {

              if (item.break || item.end) {
                return (
                  <Text
                    key={index}
                    style={styles.breakText}
                  >
                    {item.label}
                  </Text>
                );
              }

              return (

                <View
                  key={index}
                  style={styles.scheduleRow}
                >

                  <View
                    style={styles.timeColumn}
                  >

                    <Text
                      style={styles.timeText}
                    >
                      {item.time}
                    </Text>

                    <Text
                      style={[
                        styles.statusText,
                        item.status ===
                          'Pending' &&
                          styles.pendingText,
                      ]}
                    >
                      {item.status}
                    </Text>

                  </View>

                  <View
                    style={[
                      styles.sessionCard,
                      item.highlight &&
                        styles.highlightSession,
                    ]}
                  >

                    <View
                      style={
                        styles.sessionAvatar
                      }
                    >
                      <Ionicons
                        name="person-outline"
                        size={15}
                        color="#B48BC7"
                      />
                    </View>

                    <Text
                      style={
                        styles.sessionLearner
                      }
                    >
                      {item.learner}
                    </Text>

                  </View>

                </View>
              );
            }
          )}

        </View>

      </ScrollView>

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

  topButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 14,
  },

  addButton: {
    flex: 1,
    backgroundColor: '#B48BC7',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButtonText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 8,
  },

  deleteButton: {
    width: 54,
    height: 54,
    marginLeft: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D8E5',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 16,
  },

  therapistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  therapistName: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },

  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  studentName: {
    marginLeft: 12,
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
  },

  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3E8F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  scheduleDate: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    marginRight: 8,
    textTransform: 'uppercase',
  },

  scheduleRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  timeColumn: {
    width: 90,
    paddingTop: 8,
  },

  timeText: {
    fontWeight: '800',
    color: '#333',
    fontSize: 14,
  },

  statusText: {
    marginTop: 2,
    fontSize: 12,
    color: '#666',
  },

  pendingText: {
    color: '#D26AC2',
    fontWeight: '700',
  },

  sessionCard: {
    flex: 1,
    backgroundColor: '#F6EDF8',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  highlightSession: {
    backgroundColor: '#EDC5E9',
  },

  sessionAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  sessionLearner: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  breakText: {
    textAlign: 'center',
    color: '#AAA',
    marginVertical: 16,
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