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

import { useNavigation } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import * as Speech from 'expo-speech';

import * as ImagePicker from 'expo-image-picker';

import { api } from '../services/api';

import {
  ActivityFormData,
  NavigationProp,
} from '../types';

const speechLevels = [
  'SOUND',
  'SYLLABLE',
  'WORD',
  'PHRASE',
  'SENTENCE',
  'CONVERSING',
];

const categories = [
  'Family Vocabulary',
  'Daily Objects',
  'Food & Drinks',
  'Animals',
  'Body Parts',
  'Greetings',
  'Emotions',
  'Actions',
];

const difficulties = [
  'Level 1 - Beginner',
  'Level 2 - Intermediate',
  'Level 3 - Advanced',
];

const tones = [
  'Gentle',
  'Calm',
  'Cheerful',
  'Encouraging',
];

const rewards = [
  'Star',
  'Confetti',
  'Happy GIF',
  'None',
];

const failedActions = [
  'Repeat with next hint',
  'Choose easier activity',
  'Take short break',
  'Move to different activity',
];

export default function CreateActivityScreen() {

  const navigation =
    useNavigation<
      NavigationProp<'CreateActivity'>
    >();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [activityImage, setActivityImage] =
    useState<string | null>(null);

  const [teachImage, setTeachImage] =
    useState<string | null>(null);

  const [correctImage, setCorrectImage] =
    useState<string | null>(null);

  const [supportImage, setSupportImage] =
    useState<string | null>(null);
    const [targetInput, setTargetInput] =
  useState('');

const [acceptableInput, setAcceptableInput] =
  useState('');



  const [formData, setFormData] =
    useState<ActivityFormData>({
      title: '',
      level: 'SOUND',
      category: 'Family Vocabulary',
      difficulty: 'Level 1 - Beginner',

      target_answers: '',
      acceptable_answers: '',

      next_activity: '',

      teach_prompt: '',
      teach_tone: 'Gentle',
      teach_image_url: '',

      ask_prompt: '',

      max_attempts: 3,

      hint1: '',
      hint2: '',
      hint3: '',

      correct_prompt: '',
      correct_tone: 'Cheerful',
      correct_image_url: '',

      reward: 'Star',

      support_prompt: '',
      support_tone: 'Gentle',
      support_image_url: '',

      failed_action:
        'Repeat with next hint',

      activity_image_url: '',
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

  const playTTS = (text: string) => {
    if (!text.trim()) return;

    Speech.stop();

    Speech.speak(text, {
      language: 'en-US',
      rate: 0.9,
    });
  };

  const pickImage = async (
    setter: (uri: string) => void,
    field: keyof ActivityFormData
  ) => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      permission.status !== 'granted'
    ) {
      Alert.alert(
        'Permission Needed',
        'Please allow photo access.'
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

    if (!result.canceled) {

      const uri =
        result.assets[0].uri;

      setter(uri);

      updateField(field, uri);
    }
  };

  const validateForm = () => {

    if (!formData.title.trim()) {
      Alert.alert(
        'Missing Field',
        'Please enter activity title.'
      );

      return false;
    }

    if (
      !formData.target_answers.trim()
    ) {
      Alert.alert(
        'Missing Field',
        'Please enter target answers.'
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {

      await api.post(
        '/activities',
        formData
      );

      Alert.alert(
        'Success',
        'Activity created successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.goBack(),
          },
        ]
      );

    } catch (error: any) {

      console.error(error);

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          'Failed to create activity.'
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSelector = (
    options: string[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.selectorWrap}>
      {options.map((item) => {

        const active =
          selected === item;

        return (
          <Pressable
            key={item}
            style={[
              styles.selectorItem,
              active &&
                styles.selectorItemActive,
            ]}
            onPress={() =>
              onSelect(item)
            }
          >
            <Text
              style={[
                styles.selectorText,
                active &&
                  styles.selectorTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderPromptSection = (
    title: string,
    field:
      keyof ActivityFormData,
    value: string,
    toneField?:
      keyof ActivityFormData,
    imageUri?: string | null,
    setImage?: (uri: string) => void,
    imageField?:
      keyof ActivityFormData
  ) => (
    <View style={styles.section}>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {imageUri !== undefined &&
        setImage &&
        imageField && (

        <Pressable
          style={styles.imageUpload}
          onPress={() =>
            pickImage(
              setImage,
              imageField
            )
          }
        >

          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
            />
          ) : (
            <>
              <Ionicons
                name="image-outline"
                size={28}
                color="#B48BC7"
              />

              <Text
                style={styles.imageUploadText}
              >
                Upload Image
              </Text>
            </>
          )}
        </Pressable>
      )}

      <TextInput
        style={styles.textArea}
        multiline
        placeholder={`Enter ${title.toLowerCase()}`}
        value={value}
        onChangeText={(text) =>
          updateField(field, text)
        }
      />

      <View style={styles.audioActions}>

        <Pressable
          style={styles.audioButton}
          onPress={() =>
            playTTS(value)
          }
        >
          <Ionicons
            name="volume-high-outline"
            size={18}
            color="#7B4DB2"
          />

          <Text
            style={styles.audioButtonText}
          >
            Preview Voice
          </Text>
        </Pressable>

      </View>

      {toneField && (
        <>
          <Text style={styles.label}>
            Tone
          </Text>

          {renderSelector(
            tones,
            formData[
              toneField
            ] as string,
            (value) =>
              updateField(
                toneField,
                value
              )
          )}
        </>
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
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >

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

            <View>
              <Text style={styles.title}>
                Create Activity
              </Text>

              <Text
                style={styles.subtitle}
              >
                Build interactive speech
                learning material
              </Text>
            </View>
          </View>

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Cover Image
            </Text>

            <Pressable
              style={styles.imageUpload}
              onPress={() =>
                pickImage(
                  setActivityImage,
                  'activity_image_url'
                )
              }
            >
              {activityImage && (

  <Pressable
    style={styles.removeImageButton}
    onPress={() => {

      setActivityImage(null);

      updateField(
        'activity_image_url',
        ''
      );
    }}
  >
    <Ionicons
      name="trash-outline"
      size={16}
      color="#D94B4B"
    />

    <Text style={styles.removeImageText}>
      Remove Image
    </Text>
  </Pressable>

)}

              {activityImage ? (
                <Image
                  source={{
                    uri: activityImage,
                  }}
                  style={
                    styles.previewImage
                  }
                />
              ) : (
                <>
                  <Ionicons
                    name="image-outline"
                    size={30}
                    color="#B48BC7"
                  />

                  <Text
                    style={
                      styles.imageUploadText
                    }
                  >
                    Upload Activity Image
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.section}>

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

            {renderSelector(
              speechLevels,
              formData.level,
              (value) =>
                updateField(
                  'level',
                  value
                )
            )}

            <Text style={styles.label}>
              Category
            </Text>

            {renderSelector(
              categories,
              formData.category,
              (value) =>
                updateField(
                  'category',
                  value
                )
            )}

            <Text style={styles.label}>
              Difficulty
            </Text>

            {renderSelector(
              difficulties,
              formData.difficulty,
              (value) =>
                updateField(
                  'difficulty',
                  value
                )
            )}

            <Text style={styles.label}>
              Max Attempts
            </Text>

            <View style={styles.counterContainer}>

  <Pressable
    style={styles.counterButton}
    onPress={() => {
      if (formData.max_attempts > 1) {
        updateField(
          'max_attempts',
          formData.max_attempts - 1
        );
      }
    }}
  >
    <Ionicons
      name="remove"
      size={18}
      color="#7B4DB2"
    />
  </Pressable>

  <Text style={styles.counterValue}>
    {formData.max_attempts}
  </Text>

  <Pressable
    style={styles.counterButton}
    onPress={() => {
      if (formData.max_attempts < 5) {
        updateField(
          'max_attempts',
          formData.max_attempts + 1
        );
      }
    }}
  >
    <Ionicons
      name="add"
      size={18}
      color="#7B4DB2"
    />
  </Pressable>

</View>
          </View>

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Expected Responses
            </Text>

            <Text style={styles.label}>
  Target Answers
</Text>

<View style={styles.tagInputRow}>

  <TextInput
    style={styles.tagInput}
    placeholder="Add target answer"
    value={targetInput}
    onChangeText={setTargetInput}
  />

  <Pressable
    style={styles.addTagButton}
    onPress={() => {

      if (!targetInput.trim()) return;

      const current =
        formData.target_answers
          ? formData.target_answers.split(',')
          : [];

      const updated = [
        ...current,
        targetInput.trim(),
      ];

      updateField(
        'target_answers',
        updated.join(',')
      );

      setTargetInput('');
    }}
  >
    <Ionicons
      name="add"
      size={18}
      color="#FFF"
    />
  </Pressable>

</View>

<View style={styles.tagsWrap}>

  {formData.target_answers
    ?.split(',')
    .filter(Boolean)
    .map((item, index) => (

      <View
        key={index}
        style={styles.tag}
      >

        <Text style={styles.tagText}>
          {item.trim()}
        </Text>

        <Pressable
          onPress={() => {

            const updated =
              formData.target_answers
                .split(',')
                .filter(
                  (_, i) => i !== index
                );

            updateField(
              'target_answers',
              updated.join(',')
            );
          }}
        >
          <Ionicons
            name="close"
            size={14}
            color="#7B4DB2"
          />
        </Pressable>

      </View>
  ))}
</View>

            <Text style={styles.label}>
  Acceptable Answers
</Text>

<View style={styles.tagInputRow}>

  <TextInput
    style={styles.tagInput}
    placeholder="Add acceptable answer"
    value={acceptableInput}
    onChangeText={setAcceptableInput}
  />

  <Pressable
    style={styles.addTagButton}
    onPress={() => {

      if (!acceptableInput.trim()) return;

      const current =
        formData.acceptable_answers
          ? formData.acceptable_answers.split(',')
          : [];

      const updated = [
        ...current,
        acceptableInput.trim(),
      ];

      updateField(
        'acceptable_answers',
        updated.join(',')
      );

      setAcceptableInput('');
    }}
  >
    <Ionicons
      name="add"
      size={18}
      color="#FFF"
    />
  </Pressable>

</View>

<View style={styles.tagsWrap}>

  {formData.acceptable_answers
    ?.split(',')
    .filter(Boolean)
    .map((item, index) => (

      <View
        key={index}
        style={styles.tag}
      >

        <Text style={styles.tagText}>
          {item.trim()}
        </Text>

        <Pressable
          onPress={() => {

            const updated =
              formData.acceptable_answers
                .split(',')
                .filter(
                  (_, i) => i !== index
                );

            updateField(
              'acceptable_answers',
              updated.join(',')
            );
          }}
        >
          <Ionicons
            name="close"
            size={14}
            color="#7B4DB2"
          />
        </Pressable>

      </View>
  ))}
</View>

            <TextInput
              style={styles.input}
              placeholder="Next Activity"
              value={
                formData.next_activity
              }
              onChangeText={(text) =>
                updateField(
                  'next_activity',
                  text
                )
              }
            />
          </View>

          {renderPromptSection(
            'Teaching Prompt',
            'teach_prompt',
            formData.teach_prompt,
            'teach_tone',
            teachImage,
            setTeachImage,
            'teach_image_url'
          )}

          {renderPromptSection(
            'Question Prompt',
            'ask_prompt',
            formData.ask_prompt
          )}

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Hints
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Hint 1"
              value={formData.hint1}
              onChangeText={(text) =>
                updateField(
                  'hint1',
                  text
                )
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Hint 2"
              value={formData.hint2}
              onChangeText={(text) =>
                updateField(
                  'hint2',
                  text
                )
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Hint 3"
              value={formData.hint3}
              onChangeText={(text) =>
                updateField(
                  'hint3',
                  text
                )
              }
            />
          </View>

          {renderPromptSection(
            'Positive Feedback',
            'correct_prompt',
            formData.correct_prompt,
            'correct_tone',
            correctImage,
            setCorrectImage,
            'correct_image_url'
          )}

          <View style={styles.section}>

            <Text style={styles.label}>
              Reward
            </Text>

            {renderSelector(
              rewards,
              formData.reward,
              (value) =>
                updateField(
                  'reward',
                  value
                )
            )}
          </View>

          {renderPromptSection(
            'Support Response',
            'support_prompt',
            formData.support_prompt,
            'support_tone',
            supportImage,
            setSupportImage,
            'support_image_url'
          )}

          <View style={styles.section}>

            <Text style={styles.label}>
              Failed Attempt Action
            </Text>

            {renderSelector(
              failedActions,
              formData.failed_action,
              (value) =>
                updateField(
                  'failed_action',
                  value
                )
            )}
          </View>

          <Pressable
            style={styles.submitButton}
            onPress={handleSubmit}
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

                <Text
                  style={
                    styles.submitButtonText
                  }
                >
                  Create Activity
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
    paddingBottom: 50,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#222',
  },

  subtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },

  section: {
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
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginBottom: 10,
    marginTop: 8,
  },

  input: {
    backgroundColor: '#F8F3F8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#222',
    marginBottom: 12,
  },

  textArea: {
    backgroundColor: '#F8F3F8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#222',
    minHeight: 120,
    textAlignVertical: 'top',
  },

  selectorWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },

  selectorItem: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F3EDF7',
    marginRight: 8,
    marginBottom: 8,
  },

  selectorItemActive: {
    backgroundColor: '#B48BC7',
  },

  selectorText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  selectorTextActive: {
    color: '#FFF',
  },

  imageUpload: {
    height: 180,
    borderRadius: 18,
    backgroundColor: '#F8F3F8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  imageUploadText: {
    marginTop: 10,
    color: '#7B4DB2',
    fontWeight: '700',
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  audioActions: {
    flexDirection: 'row',
    marginTop: 12,
  },

  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EDF7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },

  audioButtonText: {
    marginLeft: 6,
    color: '#7B4DB2',
    fontWeight: '700',
    fontSize: 13,
  },

  submitButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#B48BC7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },

  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },


  counterContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#F8F3F8',
  borderRadius: 16,
  padding: 8,
},

counterButton: {
  width: 42,
  height: 42,
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  justifyContent: 'center',
  alignItems: 'center',
},

counterValue: {
  fontSize: 18,
  fontWeight: '800',
  color: '#222',
},

tagInputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},

tagInput: {
  flex: 1,
  backgroundColor: '#F8F3F8',
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 14,
  fontSize: 14,
  color: '#222',
},

addTagButton: {
  width: 50,
  height: 50,
  borderRadius: 14,
  backgroundColor: '#B48BC7',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 10,
},

tagsWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},

tag: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F3EDF7',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 18,
  marginRight: 8,
  marginBottom: 8,
},

tagText: {
  color: '#7B4DB2',
  fontWeight: '700',
  marginRight: 6,
},

removeImageButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 10,
},

removeImageText: {
  marginLeft: 6,
  color: '#D94B4B',
  fontWeight: '700',
},

});