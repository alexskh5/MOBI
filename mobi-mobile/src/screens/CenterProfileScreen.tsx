// mobi-mobile/src/screens/CenterProfileScreen.tsx

import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';

import { Ionicons } from '@expo/vector-icons';

import { NavigationProp } from '../types';

const logo =
  require('../../assets/images/mobi_logo.png');

export default function CenterProfileScreen() {

  const navigation =
    useNavigation<
      NavigationProp<'CenterProfile'>
    >();

  const route = useRoute();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [coverImage, setCoverImage] =
    useState(
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200&auto=format&fit=crop'
    );

  const [profileImage, setProfileImage] =
    useState(
      'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    );

  const [centerName, setCenterName] =
    useState(
      'Abled Minds Therapy Center'
    );

  const [location, setLocation] =
    useState(
      'Tintay Talamban, Cebu City'
    );

  const [phone, setPhone] =
    useState('09158872911');

  const [email, setEmail] =
    useState(
      'abledminds@gmail.com'
    );

  const [password, setPassword] =
    useState('123456');

  const [about, setAbout] =
    useState(
      'Therapists from Abled Minds supported the development of the MOBI App by helping validate its features and providing professional guidance.'
    );

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

  const pickProfileImage =
    async () => {

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

      if (!result.canceled) {
        setProfileImage(
          result.assets[0].uri
        );
      }
    };

  const pickCoverImage =
    async () => {

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

      if (!result.canceled) {
        setCoverImage(
          result.assets[0].uri
        );
      }
    };

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
              Center Profile
            </Text>

            <Text
              style={styles.subtitleSmall}
            >
              Therapy center information
            </Text>
          </View>

        </View>

        <View style={styles.profileButton}>
          <Text style={styles.profileIcon}>
            👤
          </Text>
        </View>

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

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* COVER IMAGE */}

        <View style={styles.coverContainer}>

          <Image
            source={{ uri: coverImage }}
            style={styles.coverImage}
          />

          <Pressable
            style={styles.coverEditButton}
            onPress={pickCoverImage}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#333"
            />
          </Pressable>

        </View>

        {/* PROFILE */}

        <View style={styles.profileSection}>

          <View
            style={styles.profileImageContainer}
          >

            <Image
              source={{
                uri: profileImage,
              }}
              style={styles.profileImage}
            />

            <Pressable
              style={
                styles.profileEditButton
              }
              onPress={
                pickProfileImage
              }
            >
              <Ionicons
                name="camera-outline"
                size={16}
                color="#333"
              />
            </Pressable>

          </View>

          <View style={styles.nameSection}>

            <Text
              style={styles.label}
            >
              Center Name
            </Text>

            <TextInput
              value={centerName}
              onChangeText={
                setCenterName
              }
              style={
                styles.mainInput
              }
              placeholder="Center Name"
              placeholderTextColor="#888"
            />

            <Text
              style={[
                styles.label,
                {
                  marginTop: 14,
                },
              ]}
            >
              Location
            </Text>

            <TextInput
              value={location}
              onChangeText={
                setLocation
              }
              style={
                styles.mainInput
              }
              placeholder="Location"
              placeholderTextColor="#888"
            />

          </View>

        </View>

        {/* BUTTONS */}

        <View style={styles.topButtons}>

          <Pressable
            style={styles.actionButton}
          >
            <Text
              style={styles.actionButtonText}
            >
              View Doctor List
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
          >
            <Text
              style={styles.actionButtonText}
            >
              View Staff List
            </Text>
          </Pressable>

        </View>

        {/* FORM */}

        <View style={styles.formContainer}>

          <View style={styles.inputGroup}>

            <Text style={styles.label}>
              Center Phone Number
            </Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Phone Number"
              placeholderTextColor="#888"
            />

          </View>

          <View style={styles.inputGroup}>

            <Text style={styles.label}>
              Center Email
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#888"
            />

          </View>

          <View style={styles.inputGroup}>

            <Text style={styles.label}>
              Center Password
            </Text>

            <TextInput
              value={password}
              onChangeText={
                setPassword
              }
              style={styles.input}
              secureTextEntry
              placeholder="Password"
              placeholderTextColor="#888"
            />

          </View>

          <View style={styles.inputGroup}>

            <Text style={styles.label}>
              About Center
            </Text>

            <TextInput
              value={about}
              onChangeText={setAbout}
              style={styles.textArea}
              multiline
              textAlignVertical="top"
              placeholder="Center description"
              placeholderTextColor="#888"
            />

          </View>

          <Pressable
            style={styles.saveButton}
          >
            <Ionicons
              name="save-outline"
              size={18}
              color="#FFF"
            />

            <Text
              style={styles.saveButtonText}
            >
              Save Changes
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

  coverContainer: {
    position: 'relative',
  },

  coverImage: {
    width: '100%',
    height: 220,
  },

  coverEditButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileSection: {
    paddingHorizontal: 20,
    marginTop: -55,
  },

  profileImageContainer: {
    alignSelf: 'flex-start',
    position: 'relative',
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
    borderWidth: 5,
    borderColor: '#F4EAF5',
    backgroundColor: '#FFF',
  },

  profileEditButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  nameSection: {
    marginTop: 18,
  },

  mainInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E4D5E4',
  },

  topButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },

  actionButton: {
    flex: 1,
    backgroundColor: '#DDA7DB',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  actionButtonText: {
    color: '#3A2B45',
    fontWeight: '700',
    fontSize: 14,
  },

  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 50,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E4D5E4',
  },

  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 130,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#E4D5E4',
  },

  saveButton: {
    marginTop: 10,
    backgroundColor: '#B48BC7',
    paddingVertical: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 8,
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