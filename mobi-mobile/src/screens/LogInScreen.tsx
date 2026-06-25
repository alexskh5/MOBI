import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '../types';

const bgImage = require('../../assets/images/background.jpg');
const logo = require('../../assets/images/mobi_logo.png');

export default function LogInScreen() {
  const navigation = useNavigation<NavigationProp<'LogIn'>>();
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isSmallPhone = height < 700;

  const [email, setEmail] = useState('');
  const [magicCode, setMagicCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanMagicCode = magicCode.trim();

    if (cleanEmail === '') {
      Alert.alert('Missing Email', 'Please enter your registered email.');
      return;
    }

    if (cleanMagicCode === '') {
      Alert.alert('Missing Magic Code', 'Please enter your magic code.');
      return;
    }

    setIsLoading(true);

    try {
      // BACKEND READY:
      // Later, replace this timeout with:
      //
      // const response = await api.post('/auth/login', {
      //   email: cleanEmail,
      //   magic_code: cleanMagicCode,
      // });
      //
      // const user = response.data;
      // save token/user here if needed.
      //
      // Since therapist and learner both start in mobile child mode:
      // navigation.reset({ index: 0, routes: [{ name: 'ChildDashboard' }] });

      setTimeout(() => {
        setIsLoading(false);

        navigation.reset({
          index: 0,
          routes: [{ name: 'ChildDashboard' }],
        });
      }, 500);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Login Failed', 'Please check your email and magic code.');
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              isTablet && styles.tabletScrollContent,
            ]}
          >
            <Image
              source={logo}
              style={[
                styles.logo,
                isTablet && styles.tabletLogo,
                isSmallPhone && styles.smallPhoneLogo,
              ]}
            />

            <View
              style={[
                styles.card,
                isTablet && styles.tabletCard,
                isSmallPhone && styles.smallPhoneCard,
              ]}
            >
              
              <Text style={[styles.title, isTablet && styles.tabletTitle]}>
                Welcome Back
              </Text>

              <Text style={[styles.subtitle, isTablet && styles.tabletSubtitle]}>
                Log in using the account and magic code provided by your clinic.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>

                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={19} color="#B48BC7" />

                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@email.com"
                    placeholderTextColor="#9E8F9E"
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Magic Code</Text>

                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={19} color="#B48BC7" />

                  <TextInput
                    value={magicCode}
                    onChangeText={setMagicCode}
                    placeholder="Enter your magic code"
                    placeholderTextColor="#9E8F9E"
                    style={styles.input}
                    secureTextEntry={!showCode}
                    autoCapitalize="none"
                  />

                  <Pressable onPress={() => setShowCode(!showCode)}>
                    <Ionicons
                      name={showCode ? 'eye-off-outline' : 'eye-outline'}
                      size={19}
                      color="#9E8F9E"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginText}>LOG IN</Text>
                )}
              </Pressable>

              <Pressable>
                <Text style={styles.helpText}>
                  Please check your email for your magic code.
                </Text>
              </Pressable>

              <View style={styles.divider} />

              <View style={styles.infoBox}>
                <Text style={styles.aboutText}>
                  MOBI — Modernized Bridge Intervention supports children with autism
                  through guided speech, confidence-building, and adaptive learning activities.
                </Text>
              </View>

              <Text style={styles.footerText}>Want to be part of MOBI?</Text>

              <Pressable>
                <Text style={styles.linkText}>
                  Visit mobi.official.ph or register through our clinic.
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },

  tabletScrollContent: {
    paddingVertical: 50,
  },

  logo: {
    width: 155,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 18,
  },

  tabletLogo: {
    width: 190,
    height: 145,
    marginBottom: 24,
  },

  smallPhoneLogo: {
    width: 125,
    height: 95,
    marginBottom: 10,
  },

  card: {
    width: '100%',
    maxWidth: 410,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: '#EBC7EA',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
  },

  tabletCard: {
    maxWidth: 500,
    paddingHorizontal: 42,
    paddingTop: 44,
    paddingBottom: 38,
  },

  smallPhoneCard: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
  },

  title: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
    letterSpacing: 0.4,
  },

  tabletTitle: {
    fontSize: 40,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 28,
  },

  tabletSubtitle: {
    fontSize: 16,
    lineHeight: 23,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#555',
    marginBottom: 7,
    marginLeft: 4,
  },

  inputWrapper: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F2DDF2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E6CBE6',
  },

  input: {
    flex: 1,
    height: 54,
    marginLeft: 10,
    fontSize: 15,
    color: '#111',
  },

  loginButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#B48BC7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.65,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  helpText: {
    textAlign: 'center',
    color: '#5B4BCE',
    fontSize: 12,
    marginTop: 15,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#DDD',
    marginTop: 24,
    marginBottom: 22,
  },

  infoBox: {
    backgroundColor: '#FAF4FA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0E1F0',
  },

  aboutText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#111',
    fontWeight: '700',
    marginTop: 18,
  },

  linkText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#5B4BCE',
    lineHeight: 17,
    marginTop: 4,
    fontWeight: '600',
  },
});