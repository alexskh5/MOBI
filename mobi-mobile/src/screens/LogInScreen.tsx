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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types';

const bgImage = require('../../assets/images/background.jpg');
const logo = require('../../assets/images/mobi_logo.png');

export default function LogInScreen() {
  const navigation = useNavigation<NavigationProp<'LogIn'>>();

  const [email, setEmail] = useState('');
  const [magicCode, setMagicCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // temporary
  const handleLogin = () => {
    if (email.trim() === "") {  
      Alert.alert('Your missing an email.');
      return;
    }
    if (magicCode.trim() === "") {  
      Alert.alert('Your missing the magic code.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('ChildDashboard');
    }, 500);
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Image source={logo} style={styles.logo} />

          <View style={styles.card}>
            <Text style={styles.title}>LOG IN</Text>

            <Text style={styles.subtitle}>
              MOBI is happy to see you again!{'\n'}
              Continue learning with us!
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Please enter your email"
              placeholderTextColor="#9E8F9E"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              value={magicCode}
              onChangeText={setMagicCode}
              placeholder="Please enter magic code"
              placeholderTextColor="#9E8F9E"
              style={styles.input}
              secureTextEntry
            />

            <Pressable
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginText}>
                {isLoading ? 'LOGGING IN...' : 'LOG IN'}
              </Text>
            </Pressable>

            <Pressable>
              <Text style={styles.helpText}>
                Please check your mail for magic code.
              </Text>
            </Pressable>

            <View style={styles.divider} />

            <Text style={styles.aboutText}>
              MOBI — Modernized Bridge Intervention in every step for empowering children
              with autism to grow in speech, confidence, and connection through fun,
              adaptive learning experiences.
            </Text>

            <Text style={styles.footerText}>
              Want to be part of us?
            </Text>

            <Pressable>
              <Text style={styles.linkText}>
                Check us out at mobi.official.ph or visit COMI and register through our clinic!
              </Text>
            </Pressable>
          </View>
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

  container: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    width: 130,
    height: 105,
    resizeMode: 'contain',
    marginBottom: 12,
  },

  card: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 34,
    paddingTop: 30,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: '#EBC7EA',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 5,
  },

  title: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '900',
    color: '#111',
    marginBottom: 18,
    letterSpacing: 0.5,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 10,
    color: '#111',
    lineHeight: 14,
    marginBottom: 26,
  },

  input: {
    height: 39,
    borderRadius: 10,
    backgroundColor: '#EFD9EF',
    paddingHorizontal: 16,
    marginBottom: 13,
    fontSize: 11,
    color: '#111',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  loginButton: {
    height: 34,
    borderRadius: 16,
    backgroundColor: '#ED9BE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  disabledButton: {
    opacity: 0.65,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  helpText: {
    textAlign: 'center',
    color: '#324CFF',
    fontSize: 10,
    marginTop: 12,
    fontStyle: 'italic',
  },

  divider: {
    height: 1,
    backgroundColor: '#111',
    opacity: 0.75,
    marginTop: 20,
    marginBottom: 24,
  },

  aboutText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#111',
    lineHeight: 13,
    fontStyle: 'italic',
  },

  footerText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#111',
    marginTop: 18,
  },

  linkText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#324CFF',
    lineHeight: 13,
  },
});