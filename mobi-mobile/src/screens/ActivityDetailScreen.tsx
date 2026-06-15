import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import * as Speech from 'expo-speech';

import {
  Activity,
  NavigationProp,
  RoutePropType,
} from '../types';

export default function ActivityDetailScreen() {

  const navigation =
    useNavigation<NavigationProp<'ActivityDetail'>>();

  const route =
    useRoute<RoutePropType<'ActivityDetail'>>();

  const { activity } = route.params;

  const playSpeech = (text: string) => {

    if (!text) return;

    Speech.stop();

    Speech.speak(text, {
      rate: 0.9,
      pitch: 1,
      language: 'en-US',
    });
  };

  const getLevelColor = (level: string) => {

    const colors: Record<string, string> = {
      SOUND: '#34C759',
      SYLLABLE: '#5B8DEF',
      WORD: '#9B6DFF',
      PHRASE: '#FFB648',
      SENTENCE: '#FF6B6B',
      CONVERSING: '#48C6EF',
    };

    return colors[level] || '#AAA';
  };

  const renderTags = (text?: string) => {

    if (!text) return null;

    return (
      <View style={styles.tagsWrap}>
        {text
          .split(',')
          .filter(Boolean)
          .map((item, index) => (
            <View
              key={index}
              style={styles.tag}
            >
              <Text style={styles.tagText}>
                {item.trim()}
              </Text>
            </View>
        ))}
      </View>
    );
  };

  const SectionCard = ({
    title,
    children,
  }: any) => (
    <View style={styles.sectionCard}>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <Pressable
            style={styles.headerButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#333"
            />
          </Pressable>

          <Pressable
            style={styles.editButton}
            onPress={() =>
              navigation.navigate(
                'EditActivity',
                { activity }
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#FFF"
            />

            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </Pressable>
        </View>

        {/* COVER IMAGE */}

        {activity.activity_image_url ? (
          <Image
            source={{
              uri:
                activity.activity_image_url,
            }}
            style={styles.coverImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="image-outline"
              size={50}
              color="#C9B5D7"
            />
          </View>
        )}

        {/* TOP DETAILS */}

        <View style={styles.topSection}>

          <View
            style={[
              styles.levelChip,
              {
                backgroundColor:
                  getLevelColor(
                    activity.level
                  ),
              },
            ]}
          >
            <Text style={styles.levelChipText}>
              {activity.level}
            </Text>
          </View>

          <Text style={styles.title}>
            {activity.title}
          </Text>

          <Text style={styles.category}>
            {activity.category}
          </Text>

          <Text style={styles.difficulty}>
            {activity.difficulty}
          </Text>
        </View>

        {/* TARGET ANSWERS */}

        <SectionCard title="Expected Responses">

          <Text style={styles.label}>
            Target Answers
          </Text>

          {renderTags(
            activity.target_answers
          )}

          <Text
            style={[
              styles.label,
              { marginTop: 16 },
            ]}
          >
            Acceptable Answers
          </Text>

          {renderTags(
            activity.acceptable_answers
          )}

        </SectionCard>

        {/* PROMPTS */}

        <SectionCard title="Teaching Prompt">

          {activity.teach_image_url && (
            <Image
              source={{
                uri:
                  activity.teach_image_url,
              }}
              style={styles.promptImage}
            />
          )}

          <Text style={styles.promptText}>
            {activity.teach_prompt ||
              'No prompt added'}
          </Text>

          <View style={styles.promptBottom}>

            <Text style={styles.toneText}>
              Tone: {activity.teach_tone}
            </Text>

            <Pressable
              style={styles.playButton}
              onPress={() =>
                playSpeech(
                  activity.teach_prompt
                )
              }
            >
              <Ionicons
                name="volume-high-outline"
                size={18}
                color="#FFF"
              />

              <Text style={styles.playButtonText}>
                Play
              </Text>
            </Pressable>
          </View>
        </SectionCard>

        <SectionCard title="Ask Prompt">

          <Text style={styles.promptText}>
            {activity.ask_prompt ||
              'No ask prompt added'}
          </Text>

          <Pressable
            style={styles.playButton}
            onPress={() =>
              playSpeech(
                activity.ask_prompt
              )
            }
          >
            <Ionicons
              name="volume-high-outline"
              size={18}
              color="#FFF"
            />

            <Text style={styles.playButtonText}>
              Play
            </Text>
          </Pressable>

        </SectionCard>

        {/* HINTS */}

        {(activity.hint1 ||
          activity.hint2 ||
          activity.hint3) && (
          <SectionCard title="Hints">

            {activity.hint1 && (
              <Text style={styles.hintText}>
                • {activity.hint1}
              </Text>
            )}

            {activity.hint2 && (
              <Text style={styles.hintText}>
                • {activity.hint2}
              </Text>
            )}

            {activity.hint3 && (
              <Text style={styles.hintText}>
                • {activity.hint3}
              </Text>
            )}

          </SectionCard>
        )}

        {/* FEEDBACK */}

        <SectionCard title="Correct Feedback">

          {activity.correct_image_url && (
            <Image
              source={{
                uri:
                  activity.correct_image_url,
              }}
              style={styles.promptImage}
            />
          )}

          <Text style={styles.promptText}>
            {activity.correct_prompt}
          </Text>

          <Text style={styles.toneText}>
            Tone: {activity.correct_tone}
          </Text>
        </SectionCard>

        <SectionCard title="Support Feedback">

          {activity.support_image_url && (
            <Image
              source={{
                uri:
                  activity.support_image_url,
              }}
              style={styles.promptImage}
            />
          )}

          <Text style={styles.promptText}>
            {activity.support_prompt}
          </Text>

          <Text style={styles.toneText}>
            Tone: {activity.support_tone}
          </Text>
        </SectionCard>

        {/* OTHER INFO */}

        <SectionCard title="Activity Information">

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Max Attempts
            </Text>

            <Text style={styles.infoValue}>
              {activity.max_attempts}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Reward
            </Text>

            <Text style={styles.infoValue}>
              {activity.reward || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Failed Action
            </Text>

            <Text style={styles.infoValue}>
              {activity.failed_action ||
                'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Next Activity
            </Text>

            <Text style={styles.infoValue}>
              {activity.next_activity ||
                'N/A'}
            </Text>
          </View>

        </SectionCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8F3F8',
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B48BC7',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  editButtonText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 6,
  },

  coverImage: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    marginBottom: 20,
  },

  placeholderImage: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    backgroundColor: '#EFE6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  topSection: {
    alignItems: 'center',
    marginBottom: 24,
  },

  levelChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 12,
  },

  levelChipText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
    textAlign: 'center',
  },

  category: {
    marginTop: 6,
    fontSize: 15,
    color: '#9A77B5',
    fontWeight: '700',
  },

  difficulty: {
    marginTop: 4,
    color: '#777',
    fontSize: 13,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginBottom: 10,
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E8F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },

  tagText: {
    color: '#7B4DB2',
    fontWeight: '700',
    fontSize: 13,
  },

  promptImage: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    marginBottom: 14,
  },

  promptText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 16,
  },

  promptBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  toneText: {
    fontSize: 13,
    color: '#777',
    fontWeight: '600',
  },

  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#B48BC7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },

  playButtonText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 6,
  },

  hintText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '700',
  },

  infoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },

});