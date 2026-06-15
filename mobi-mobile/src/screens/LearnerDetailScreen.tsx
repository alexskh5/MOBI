// mobi-mobile/src/screens/LearnerDetailScreen.tsx

import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import {
  NavigationProp,
  RoutePropType,
} from '../types';

const logo = require('../../assets/images/mobi_logo.png');

export default function LearnerDetailScreen() {
  const navigation =
    useNavigation<NavigationProp<'LearnerDetail'>>();

  const route =
    useRoute<RoutePropType<'LearnerDetail'>>();

  const { learner } = route.params;

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#333"
            />
          </Pressable>

          <Image
            source={logo}
            style={styles.logo}
          />

          <Pressable
            style={styles.editHeaderButton}
            onPress={() =>
              navigation.navigate(
                'EditLearner',
                { learner }
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={20}
              color="#7B4DB2"
            />
          </Pressable>

        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>

          {learner.profile_picture_url ? (
            <Image
              source={{
                uri: learner.profile_picture_url,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatar}>

              <Text style={styles.avatarText}>
                {learner.first_name[0]}
                {learner.last_name[0]}
              </Text>

            </View>
          )}

          <Text style={styles.learnerName}>
            {learner.first_name} {learner.last_name}
          </Text>

          <Text style={styles.diagnosis}>
            {learner.diagnosis}
          </Text>

          <View style={styles.chipsRow}>

            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {learner.age} Years Old
              </Text>
            </View>

            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>
                Active Learner
              </Text>
            </View>

          </View>

        </View>

        {/* INFORMATION SECTION */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Learner Information
          </Text>

          <View style={styles.infoCard}>

            <View style={styles.infoRow}>
              <Text style={styles.label}>
                Birthday
              </Text>

              <Text style={styles.value}>
  {new Date(
    learner.birthday
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>
                Diagnosis
              </Text>

              <Text style={styles.value}>
                {learner.diagnosis}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>
                Registered
              </Text>

              <Text style={styles.value}>
                {new Date(
                  learner.created_at
                ).toLocaleDateString()}
              </Text>
            </View>

          </View>

        </View>

        {/* GUARDIAN SECTION */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Guardian Information
          </Text>

          <View style={styles.infoCard}>

            <View style={styles.infoRow}>
              <Text style={styles.label}>
                Full Name
              </Text>

              <Text style={styles.value}>
                {learner.guardian_first_name}{' '}
                {learner.guardian_last_name}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>
                Contact Number
              </Text>

              <Text style={styles.value}>
                {learner.guardian_phone}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>
                Email Address
              </Text>

              <Text style={styles.value}>
                {learner.guardian_email}
              </Text>
            </View>

          </View>

        </View>

        {/* PROGRESS SECTION */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Learning Progress
          </Text>

          <View style={styles.progressCard}>

            <View style={styles.progressRow}>

              <View style={styles.progressBox}>
                <Text style={styles.progressNumber}>
                  12
                </Text>

                <Text style={styles.progressLabel}>
                  Activities
                </Text>
              </View>

              <View style={styles.progressBox}>
                <Text style={styles.progressNumber}>
                  84%
                </Text>

                <Text style={styles.progressLabel}>
                  Accuracy
                </Text>
              </View>

              <View style={styles.progressBox}>
                <Text style={styles.progressNumber}>
                  WORD
                </Text>

                <Text style={styles.progressLabel}>
                  Current Level
                </Text>
              </View>

            </View>

          </View>

        </View>

        {/* BIO SECTION */}

        {learner.bio_description ? (
          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Notes
            </Text>

            <View style={styles.bioCard}>

              <Text style={styles.bioText}>
                {learner.bio_description}
              </Text>

            </View>

          </View>
        ) : null}

        {/* ACTION BUTTONS */}

        <View style={styles.actionContainer}>

          <Pressable
            style={styles.editButton}
            onPress={() =>
              navigation.navigate(
                'EditLearner',
                { learner }
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#FFF"
            />

            <Text style={styles.editButtonText}>
              Edit Learner
            </Text>
          </Pressable>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8F3F8',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5D8E5',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F2EAF5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 100,
    height: 45,
    resizeMode: 'contain',
  },

  editHeaderButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F2EAF5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 24,
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#EADAF3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#7B4DB2',
  },

  learnerName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#222',
    marginTop: 18,
  },

  diagnosis: {
    fontSize: 15,
    color: '#7B4DB2',
    marginTop: 6,
    fontWeight: '600',
  },

  chipsRow: {
    flexDirection: 'row',
    marginTop: 18,
  },

  chip: {
    backgroundColor: '#F3EDF7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  chipText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 12,
  },

  activeChip: {
    backgroundColor: '#B48BC7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  activeChipText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },

  section: {
    marginHorizontal: 16,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  infoRow: {
    paddingVertical: 6,
  },

  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontWeight: '600',
  },

  value: {
    fontSize: 15,
    color: '#222',
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12,
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressBox: {
    flex: 1,
    alignItems: 'center',
  },

  progressNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7B4DB2',
  },

  progressLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
  },

  bioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  bioText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 24,
  },

  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    marginTop: 10,
  },

  editButton: {
    backgroundColor: '#B48BC7',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  editButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },

});