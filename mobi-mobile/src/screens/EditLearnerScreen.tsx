// mobi-mobile/src/screens/EditLearnerScreen.tsx

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
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import DateTimePicker from '@react-native-community/datetimepicker';

import * as ImagePicker from 'expo-image-picker';

import { Ionicons } from '@expo/vector-icons';

import { api } from '../services/api';

import {
  LearnerFormData,
  NavigationProp,
  RoutePropType,
} from '../types';

const logo = require('../../assets/images/mobi_logo.png');

export default function EditLearnerScreen() {

  const navigation =
    useNavigation<NavigationProp<'EditLearner'>>();

  const route =
    useRoute<RoutePropType<'EditLearner'>>();

  const learner = route.params?.learner;

  if (!learner) {
    return null;
  }

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(
      learner.profile_picture_url || null
    );

  const [formData, setFormData] =
    useState<LearnerFormData>({
      first_name: learner.first_name,
      last_name: learner.last_name,
      birthday: learner.birthday
        ? learner.birthday.split('T')[0]
        : '',
      diagnosis: learner.diagnosis,
      profile_picture_url:
        learner.profile_picture_url || '',
      bio_description:
        learner.bio_description || '',
      guardian_first_name:
        learner.guardian_first_name,
      guardian_last_name:
        learner.guardian_last_name,
      guardian_phone:
        learner.guardian_phone,
      guardian_email:
        learner.guardian_email,
    });

  const updateField = (
    field: keyof LearnerFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);

    if (selectedDate) {
      const formattedDate =
        selectedDate
          .toISOString()
          .split('T')[0];

      updateField(
        'birthday',
        formattedDate
      );
    }
  };

  const pickImage = async () => {

    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Needed',
        'Please allow gallery access.'
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled) {

      const imageUri =
        result.assets[0].uri;

      setSelectedImage(imageUri);

      updateField(
        'profile_picture_url',
        imageUri
      );
    }
  };

  const validateForm = () => {

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.birthday ||
      !formData.diagnosis
    ) {
      Alert.alert(
        'Missing Information',
        'Please complete all required learner fields.'
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
        `/learners/${learner.id}`,
        formData
      );

      Alert.alert(
        'Success',
        'Learner updated successfully.',
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
        error.response?.data?.message ||
          'Failed to update learner.'
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  return (

    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={{ flex: 1 }}
      >

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
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
                size={22}
                color="#333"
              />
            </Pressable>

            <View style={styles.headerCenter}>

              <Image
                source={logo}
                style={styles.logo}
              />

              <View>

                <Text style={styles.title}>
                  Edit Learner
                </Text>

                <Text style={styles.subtitle}>
                  Update learner profile
                </Text>

              </View>
            </View>
          </View>

          {/* PROFILE */}

          <View style={styles.profileCard}>

            <TouchableOpacity
              onPress={pickImage}
              style={styles.imageWrapper}
            >

              {selectedImage ? (
                <Image
                  source={{
                    uri: selectedImage,
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={styles.placeholder}
                >
                  <Ionicons
                    name="person-outline"
                    size={42}
                    color="#B48BC7"
                  />
                </View>
              )}

              <View style={styles.editBadge}>
                <Ionicons
                  name="camera-outline"
                  size={14}
                  color="#FFF"
                />
              </View>

            </TouchableOpacity>

            <Text style={styles.profileName}>
              {formData.first_name}{' '}
              {formData.last_name}
            </Text>

            <Text style={styles.profileDiagnosis}>
              {formData.diagnosis}
            </Text>

          </View>

          {/* LEARNER INFO */}

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Learner Information
            </Text>

            <View style={styles.row}>

              <View style={styles.halfField}>
                <Text style={styles.label}>
                  First Name
                </Text>

                <TextInput
                  style={styles.input}
                  value={formData.first_name}
                  onChangeText={(value) =>
                    updateField(
                      'first_name',
                      value
                    )
                  }
                />
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>
                  Last Name
                </Text>

                <TextInput
                  style={styles.input}
                  value={formData.last_name}
                  onChangeText={(value) =>
                    updateField(
                      'last_name',
                      value
                    )
                  }
                />
              </View>

            </View>

            <Text style={styles.label}>
              Birthday
            </Text>

            <Pressable
              onPress={() =>
                setShowDatePicker(true)
              }
              style={styles.input}
            >
              <Text style={styles.dateText}>
                {new Date(
                  formData.birthday
                ).toLocaleDateString(
                  'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={
                  formData.birthday
                    ? new Date(
                        formData.birthday
                      )
                    : new Date()
                }
                mode="date"
                maximumDate={new Date()}
                onChange={
                  handleDateChange
                }
              />
            )}

            <Text style={styles.label}>
              Diagnosis
            </Text>

            <TextInput
              style={styles.input}
              value={formData.diagnosis}
              onChangeText={(value) =>
                updateField(
                  'diagnosis',
                  value
                )
              }
            />

            <Text style={styles.label}>
              Bio Description
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
              ]}
              multiline
              numberOfLines={4}
              value={
                formData.bio_description
              }
              onChangeText={(value) =>
                updateField(
                  'bio_description',
                  value
                )
              }
            />

          </View>

          {/* GUARDIAN */}

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Guardian Information
            </Text>

            <View style={styles.row}>

              <View style={styles.halfField}>
                <Text style={styles.label}>
                  First Name
                </Text>

                <TextInput
                  style={styles.input}
                  value={
                    formData.guardian_first_name
                  }
                  onChangeText={(value) =>
                    updateField(
                      'guardian_first_name',
                      value
                    )
                  }
                />
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>
                  Last Name
                </Text>

                <TextInput
                  style={styles.input}
                  value={
                    formData.guardian_last_name
                  }
                  onChangeText={(value) =>
                    updateField(
                      'guardian_last_name',
                      value
                    )
                  }
                />
              </View>

            </View>

            <Text style={styles.label}>
              Phone Number
            </Text>

            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={
                formData.guardian_phone
              }
              onChangeText={(value) =>
                updateField(
                  'guardian_phone',
                  value
                )
              }
            />

            <Text style={styles.label}>
              Email Address
            </Text>

            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={
                formData.guardian_email
              }
              onChangeText={(value) =>
                updateField(
                  'guardian_email',
                  value
                )
              }
            />

          </View>

          {/* BUTTON */}

          <Pressable
            style={[
              styles.saveButton,
              isSubmitting &&
                styles.disabledButton,
            ]}
            disabled={isSubmitting}
            onPress={handleUpdate}
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
                    styles.saveButtonText
                  }
                >
                  Save Changes
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

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
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
    backgroundColor: '#F3EAF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 90,
    height: 45,
    resizeMode: 'contain',
    marginRight: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
  },

  subtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    padding: 24,
    marginBottom: 18,
  },

  imageWrapper: {
    position: 'relative',
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  placeholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F0E4F4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B48BC7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
    marginTop: 14,
  },

  profileDiagnosis: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
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

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  halfField: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    backgroundColor: '#F8F3F8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E8DCEB',
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  dateText: {
    fontSize: 15,
    color: '#222',
  },

  saveButton: {
    backgroundColor: '#B48BC7',
    borderRadius: 18,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },

});