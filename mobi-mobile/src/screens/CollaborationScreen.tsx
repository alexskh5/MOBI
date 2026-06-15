// mobi-mobile/src/screens/CollaborationScreen.tsx

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

const learners = [
  'Lea Sarsoza',
  'Harry Potter',
  'Albus Severus',
  'George Weasley',
];

const notes = [
  {
    id: 1,
    type: 'Clinical',
    date: 'May 2, 2026',
    author: 'Dr. Jane R. Doe',
    note:
      'Lea practiced following simple directions and showed improved participation during sensory activities.',
  },

  {
    id: 2,
    type: 'MOBI Session',
    date: 'May 3, 2026',
    author: 'John Lenon, OT',
    note:
      'Lea completed AI-guided speech activities focused on turn-taking and social interaction.',
  },

  {
    id: 3,
    type: 'MOBI Session',
    date: 'May 5, 2026',
    author: 'Villa R. Reese, ST',
    note:
      'Lea demonstrated progress initiating simple greetings and responding positively to adaptive prompts.',
  },
];

export default function CollaborationScreen() {

  const navigation =
    useNavigation<
      NavigationProp<'Collaboration'>
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
              Collaboration
            </Text>

            <Text style={styles.subtitleSmall}>
              Therapist & Doctor notes
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
          placeholder="Search collaboration notes..."
          placeholderTextColor="#777"
        />

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

        {/* LEARNERS */}

        <View style={styles.sectionCard}>

          <Text style={styles.sectionTitle}>
            Learners
          </Text>

          {learners.map((learner) => (

            <Pressable
              key={learner}
              style={styles.learnerItem}
            >

              <View style={styles.avatarCircle}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color="#B48BC7"
                />
              </View>

              <Text
                style={styles.learnerName}
              >
                {learner}
              </Text>

            </Pressable>
          ))}

        </View>

        {/* ASSIGNED STAFF */}

        <View style={styles.sectionCard}>

          <View style={styles.staffHeader}>
            <Text style={styles.sectionTitle}>
              Assigned Doctor
            </Text>

            <Ionicons
              name="add-outline"
              size={18}
              color="#666"
            />
          </View>

          <View style={styles.staffItem}>

            <View style={styles.avatarCircle}>
              <Ionicons
                name="person-outline"
                size={16}
                color="#B48BC7"
              />
            </View>

            <Text style={styles.staffName}>
              Dr. Jane R. Doe
            </Text>

          </View>

          <View
            style={[
              styles.staffHeader,
              { marginTop: 20 },
            ]}
          >
            <Text style={styles.sectionTitle}>
              Assigned Therapist
            </Text>

            <Ionicons
              name="add-outline"
              size={18}
              color="#666"
            />
          </View>

          <View style={styles.staffItem}>

            <View style={styles.avatarCircle}>
              <Ionicons
                name="person-outline"
                size={16}
                color="#B48BC7"
              />
            </View>

            <Text style={styles.staffName}>
              John Lenon, OT
            </Text>

          </View>

          <View style={styles.staffItem}>

            <View style={styles.avatarCircle}>
              <Ionicons
                name="person-outline"
                size={16}
                color="#B48BC7"
              />
            </View>

            <Text style={styles.staffName}>
              Villa R. Reese, ST
            </Text>

          </View>

        </View>

        {/* NOTES */}

        <View style={styles.notesContainer}>

          <View style={styles.notesHeader}>

            <Text style={styles.notesTitle}>
              Progress Notes
            </Text>

            <View style={styles.notesTabs}>

              <Pressable
                style={styles.activeNotesTab}
              >
                <Text
                  style={
                    styles.activeNotesTabText
                  }
                >
                  This Week
                </Text>
              </Pressable>

            </View>

          </View>

          {notes.map((item) => (

            <View
              key={item.id}
              style={styles.noteCard}
            >

              <View
                style={styles.noteTopRow}
              >

                <View>

                  <Text
                    style={styles.noteType}
                  >
                    {item.type}
                  </Text>

                  <Text
                    style={styles.noteDate}
                  >
                    {item.date}
                  </Text>

                </View>

              </View>

              <View
                style={styles.noteAuthorRow}
              >

                <View
                  style={
                    styles.noteAvatarCircle
                  }
                >
                  <Ionicons
                    name="person-outline"
                    size={15}
                    color="#B48BC7"
                  />
                </View>

                <Text
                  style={styles.noteAuthor}
                >
                  {item.author}
                </Text>

              </View>

              <Text style={styles.noteText}>
                {item.note}
              </Text>

            </View>
          ))}

          <Text style={styles.endText}>
            Nothing follows
          </Text>

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

  scrollContent: {
    padding: 20,
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
    marginBottom: 14,
  },

  learnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  learnerName: {
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

  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  staffName: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },

  notesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  notesTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
  },

  notesTabs: {
    flexDirection: 'row',
  },

  activeNotesTab: {
    backgroundColor: '#EBCBFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  activeNotesTabText: {
    color: '#9C5BCF',
    fontWeight: '800',
    fontSize: 12,
  },

  noteCard: {
    backgroundColor: '#FAF5FC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  noteTopRow: {
    marginBottom: 10,
  },

  noteType: {
    color: '#B96A4B',
    fontWeight: '700',
    fontSize: 12,
  },

  noteDate: {
    marginTop: 2,
    fontWeight: '800',
    color: '#333',
    fontSize: 13,
  },

  noteAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  noteAvatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3E8F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  noteAuthor: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  noteText: {
    color: '#555',
    lineHeight: 22,
    fontSize: 14,
  },

  endText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#AAA',
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