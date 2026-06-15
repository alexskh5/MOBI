// mobi-mobile/src/screens/EnrollLearnerScreen.tsx
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
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import { LearnerFormData, NavigationProp } from '../types';

export default function EnrollLearnerScreen() {
  const navigation = useNavigation<NavigationProp<'EnrollLearner'>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<LearnerFormData>({
    first_name: '',
    last_name: '',
    birthday: '',
    diagnosis: '',
    profile_picture_url: '',
    bio_description: '',
    guardian_first_name: '',
    guardian_last_name: '',
    guardian_phone: '',
    guardian_email: '',
  });

  const updateField = (field: keyof LearnerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateField('birthday', formattedDate);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera roll permissions to select a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      updateField('profile_picture_url', imageUri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera permissions to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      updateField('profile_picture_url', imageUri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        ...(selectedImage ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: removePhoto }] : [])
      ],
      { cancelable: true }
    );
  };

  const removePhoto = () => {
    setSelectedImage(null);
    updateField('profile_picture_url', '');
  };

  const validateForm = (): boolean => {
    const required = [
      'first_name', 'last_name', 'birthday', 'diagnosis',
      'guardian_first_name', 'guardian_last_name', 'guardian_phone', 'guardian_email'
    ];
    
    for (const field of required) {
      if (!formData[field as keyof LearnerFormData]) {
        Alert.alert('Missing Field', `Please fill in ${field.replace('_', ' ')}`);
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.guardian_email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(formData.guardian_phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/learners', formData);
      Alert.alert(
        'Success',
        `${formData.first_name} ${formData.last_name} has been enrolled!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {

  console.error('Enroll error:', error);

  if (error.response?.status === 409) {
    Alert.alert(
      'Duplicate Learner',
      'This learner is already enrolled.'
    );

    return;
  }

  Alert.alert(
    'Error',
    'Failed to enroll learner.'
  );
}finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
            <Text style={styles.title}>Enroll New Learner</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learner Information</Text>
            
            <View style={styles.profilePictureContainer}>
              <Text style={styles.label}>Profile Picture</Text>
              <TouchableOpacity onPress={showImagePickerOptions} style={styles.imagePickerContainer}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>
  +
</Text>
                    <Text style={styles.imagePlaceholderSubtext}>Tap to add photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Tap to take photo or choose from gallery
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.first_name}
                  onChangeText={(value) => updateField('first_name', value)}
                  placeholder="Enter first name"
                />
              </View>
              
              <View style={styles.halfField}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.last_name}
                  onChangeText={(value) => updateField('last_name', value)}
                  placeholder="Enter last name"
                />
              </View>
            </View>

            <Pressable onPress={() => setShowDatePicker(true)}>
              <Text style={styles.label}>Birthday *</Text>
              <View style={styles.dateInput}>
                <Text style={formData.birthday ? styles.dateText : styles.placeholderText}>
                  {formData.birthday || 'Select birthday'}
                </Text>
              </View>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={formData.birthday ? new Date(formData.birthday) : new Date()}
                mode="date"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Diagnosis *</Text>
            <TextInput
              style={styles.input}
              value={formData.diagnosis}
              onChangeText={(value) => updateField('diagnosis', value)}
              placeholder="e.g., Minimally Verbal"
            />

            <Text style={styles.label}>Bio Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio_description}
              onChangeText={(value) => updateField('bio_description', value)}
              placeholder="Tell us about the learner..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guardian Information</Text>
            
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Guardian First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.guardian_first_name}
                  onChangeText={(value) => updateField('guardian_first_name', value)}
                  placeholder="Enter first name"
                />
              </View>
              
              <View style={styles.halfField}>
                <Text style={styles.label}>Guardian Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.guardian_last_name}
                  onChangeText={(value) => updateField('guardian_last_name', value)}
                  placeholder="Enter last name"
                />
              </View>
            </View>

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.guardian_phone}
              onChangeText={(value) => updateField('guardian_phone', value)}
              placeholder="09123 456 7890"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.guardian_email}
              onChangeText={(value) => updateField('guardian_email', value)}
              placeholder="guardian@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Pressable
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Enroll Learner</Text>
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
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE3EE',
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

  backButtonText: {
    fontSize: 18,
    color: '#444',
    fontWeight: '700',
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
  },

  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2230',
    marginBottom: 18,
  },

  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },

  imagePickerContainer: {
    marginTop: 8,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F4EDF7',
    borderWidth: 2,
    borderColor: '#D9C6E4',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imagePlaceholderText: {
    fontSize: 34,
    color: '#A07AB7',
    fontWeight: '700',
  },

  imagePlaceholderSubtext: {
    fontSize: 11,
    color: '#8A7894',
    marginTop: 6,
  },

  helperText: {
    marginTop: 10,
    fontSize: 12,
    color: '#8A7894',
    textAlign: 'center',
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
    color: '#4A4450',
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    backgroundColor: '#FAF8FB',
    borderWidth: 1,
    borderColor: '#E5DCE9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#222',
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  dateInput: {
    backgroundColor: '#FAF8FB',
    borderWidth: 1,
    borderColor: '#E5DCE9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  dateText: {
    fontSize: 15,
    color: '#222',
  },

  placeholderText: {
    fontSize: 15,
    color: '#999',
  },

  submitButton: {
    backgroundColor: '#B48BC7',
    marginHorizontal: 16,
    marginTop: 22,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#B48BC7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});