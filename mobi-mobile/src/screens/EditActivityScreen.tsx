import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';

import { Ionicons } from '@expo/vector-icons';

import {
  api,
} from '../services/api';

import {
  ActivityFormData,
  NavigationProp,
  RoutePropType,
} from '../types';

const speechLevels = [
  'SOUND',
  'SYLLABLE',
  'WORD',
  'PHRASE',
  'SENTENCE',
  'CONVERSING',
];

const difficulties = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

const tones = [
  'Gentle',
  'Calm',
  'Cheerful',
  'Encouraging',
];

export default function EditActivityScreen() {

  const navigation =
    useNavigation<NavigationProp<'EditActivity'>>();

  const route =
    useRoute<RoutePropType<'EditActivity'>>();

  const { activity } = route.params;

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formData, setFormData] =
    useState<ActivityFormData>({

      title: activity.title,
      level: activity.level,
      category: activity.category,
      difficulty: activity.difficulty,

      target_answers:
        activity.target_answers,

      acceptable_answers:
        activity.acceptable_answers || '',

      next_activity:
        activity.next_activity || '',

      teach_prompt:
        activity.teach_prompt,

      teach_tone:
        activity.teach_tone,

      ask_prompt:
        activity.ask_prompt,

      max_attempts:
        activity.max_attempts,

      hint1:
        activity.hint1 || '',

      hint2:
        activity.hint2 || '',

      hint3:
        activity.hint3 || '',

      correct_prompt:
        activity.correct_prompt,

      correct_tone:
        activity.correct_tone,

      reward:
        activity.reward,

      support_prompt:
        activity.support_prompt,

      support_tone:
        activity.support_tone,

      failed_action:
        activity.failed_action,

      activity_image_url:
        activity.activity_image_url || '',

      teach_image_url:
        activity.teach_image_url || '',

      correct_image_url:
        activity.correct_image_url || '',

      support_image_url:
        activity.support_image_url || '',
    });

  const updateField = (
    field: keyof ActivityFormData,
    value: any
  ) => {

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async (
    field: keyof ActivityFormData
  ) => {

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

    if (!result.canceled) {

      updateField(
        field,
        result.assets[0].uri
      );
    }
  };

  const removeImage = (
    field: keyof ActivityFormData
  ) => {

    updateField(field, '');
  };

  const validateForm = () => {

    if (!formData.title.trim()) {

      Alert.alert(
        'Missing Title',
        'Please enter activity title.'
      );

      return false;
    }

    if (
      !formData.target_answers.trim()
    ) {

      Alert.alert(
        'Missing Target Answers',
        'Please enter target answers.'
      );

      return false;
    }

    return true;
  };

  const handleUpdate = async () => {

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {

      await api.put(
        `/activities/${activity.id}`,
        formData
      );

      Alert.alert(
        'Success',
        'Activity updated successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );

    } catch (error: any) {

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to update activity'
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  const renderChipOptions = (
    options: string[],
    selected: string,
    field: keyof ActivityFormData
  ) => (

    <View style={styles.chipWrap}>
      {options.map((option) => (

        <Pressable
          key={option}
          style={[
            styles.chip,
            selected === option &&
              styles.selectedChip,
          ]}
          onPress={() =>
            updateField(field, option)
          }
        >
          <Text
            style={[
              styles.chipText,
              selected === option &&
                styles.selectedChipText,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderImagePicker = (
    title: string,
    field: keyof ActivityFormData
  ) => (

    <View style={styles.sectionCard}>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {formData[field] ? (

        <>
          <Image
            source={{
              uri:
                formData[field] as string,
            }}
            style={styles.imagePreview}
          />

          <View style={styles.imageButtons}>

            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                pickImage(field)
              }
            >
              <Text style={styles.secondaryButtonText}>
                Replace
              </Text>
            </Pressable>

            <Pressable
              style={styles.removeButton}
              onPress={() =>
                removeImage(field)
              }
            >
              <Text style={styles.removeButtonText}>
                Remove
              </Text>
            </Pressable>

          </View>
        </>

      ) : (

        <Pressable
          style={styles.uploadBox}
          onPress={() =>
            pickImage(field)
          }
        >
          <Ionicons
            name="image-outline"
            size={40}
            color="#B48BC7"
          />

          <Text style={styles.uploadText}>
            Upload Image
          </Text>
        </Pressable>
      )}
    </View>
  );

  return (

    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >

          {/* HEADER */}

          <View style={styles.header}>

            <Pressable
              style={styles.backButton}
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

            <Text style={styles.headerTitle}>
              Edit Activity
            </Text>

          </View>

          {/* BASIC */}

          <View style={styles.sectionCard}>

            <Text style={styles.sectionTitle}>
              Basic Information
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Activity Title"
              value={formData.title}
              onChangeText={(text) =>
                updateField(
                  'title',
                  text
                )
              }
            />

            <Text style={styles.label}>
              Speech Level
            </Text>

            {renderChipOptions(
              speechLevels,
              formData.level,
              'level'
            )}

            <Text style={styles.label}>
              Difficulty
            </Text>

            {renderChipOptions(
              difficulties,
              formData.difficulty,
              'difficulty'
            )}

            <Text style={styles.label}>
              Category
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Category"
              value={formData.category}
              onChangeText={(text) =>
                updateField(
                  'category',
                  text
                )
              }
            />

          </View>

          {/* TARGET ANSWERS */}

          <View style={styles.sectionCard}>

            <Text style={styles.sectionTitle}>
              Expected Responses
            </Text>

            <Text style={styles.helperText}>
              Separate answers using commas.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Target Answers"
              value={
                formData.target_answers
              }
              onChangeText={(text) =>
                updateField(
                  'target_answers',
                  text
                )
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Acceptable Answers"
              value={
                formData.acceptable_answers
              }
              onChangeText={(text) =>
                updateField(
                  'acceptable_answers',
                  text
                )
              }
            />

          </View>

          {/* MAX ATTEMPTS */}

          <View style={styles.sectionCard}>

            <Text style={styles.sectionTitle}>
              Max Attempts
            </Text>

            <View style={styles.stepperRow}>

              <Pressable
                style={styles.stepButton}
                onPress={() =>
                  updateField(
                    'max_attempts',
                    Math.max(
                      1,
                      formData.max_attempts - 1
                    )
                  )
                }
              >
                <Text style={styles.stepText}>
                  −
                </Text>
              </Pressable>

              <Text style={styles.attemptValue}>
                {formData.max_attempts}
              </Text>

              <Pressable
                style={styles.stepButton}
                onPress={() =>
                  updateField(
                    'max_attempts',
                    Math.min(
                      5,
                      formData.max_attempts + 1
                    )
                  )
                }
              >
                <Text style={styles.stepText}>
                  +
                </Text>
              </Pressable>

            </View>

          </View>

          {/* PROMPTS */}

          <View style={styles.sectionCard}>

            <Text style={styles.sectionTitle}>
              Teach Prompt
            </Text>

            <TextInput
              style={styles.largeInput}
              multiline
              value={formData.teach_prompt}
              onChangeText={(text) =>
                updateField(
                  'teach_prompt',
                  text
                )
              }
            />

            <Text style={styles.label}>
              Tone
            </Text>

            {renderChipOptions(
              tones,
              formData.teach_tone,
              'teach_tone'
            )}

          </View>

          <View style={styles.sectionCard}>

            <Text style={styles.sectionTitle}>
              Ask Prompt
            </Text>

            <TextInput
              style={styles.largeInput}
              multiline
              value={formData.ask_prompt}
              onChangeText={(text) =>
                updateField(
                  'ask_prompt',
                  text
                )
              }
            />

          </View>

          {/* IMAGES */}

          {renderImagePicker(
            'Activity Image',
            'activity_image_url'
          )}

          {renderImagePicker(
            'Teach Image',
            'teach_image_url'
          )}

          {renderImagePicker(
            'Correct Feedback Image',
            'correct_image_url'
          )}

          {renderImagePicker(
            'Support Feedback Image',
            'support_image_url'
          )}

          {/* SAVE */}

          <Pressable
            style={styles.saveButton}
            onPress={handleUpdate}
            disabled={isSubmitting}
          >

            {isSubmitting ? (

              <ActivityIndicator
                color="#FFF"
              />

            ) : (

              <>
                <Ionicons
                  name="save-outline"
                  size={18}
                  color="#FFF"
                />

                <Text style={styles.saveButtonText}>
                  Update Activity
                </Text>
              </>
            )}

          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#222',
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
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginTop: 12,
    marginBottom: 10,
  },

  helperText: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#FAF7FB',
    borderWidth: 1,
    borderColor: '#E7DDEA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#222',
    marginBottom: 12,
  },

  largeInput: {
    backgroundColor: '#FAF7FB',
    borderWidth: 1,
    borderColor: '#E7DDEA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: '#222',
    minHeight: 120,
    textAlignVertical: 'top',
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  chip: {
    backgroundColor: '#F1E8F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  selectedChip: {
    backgroundColor: '#B48BC7',
  },

  chipText: {
    color: '#7B4DB2',
    fontWeight: '700',
    fontSize: 13,
  },

  selectedChipText: {
    color: '#FFF',
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F1E8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepText: {
    fontSize: 28,
    color: '#7B4DB2',
    fontWeight: '700',
  },

  attemptValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#222',
    marginHorizontal: 30,
  },

  uploadBox: {
    height: 180,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D8C2E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#7B4DB2',
  },

  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 18,
  },

  imageButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#EEE5F4',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 8,
  },

  secondaryButtonText: {
    color: '#7B4DB2',
    fontWeight: '700',
  },

  removeButton: {
    flex: 1,
    backgroundColor: '#F6DCDC',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#B34040',
    fontWeight: '700',
  },

  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B48BC7',
    paddingVertical: 18,
    borderRadius: 18,
    marginTop: 10,
  },

  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },

});