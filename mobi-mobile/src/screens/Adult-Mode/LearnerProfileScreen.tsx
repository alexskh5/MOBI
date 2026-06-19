import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types';

const bgImage = require('../../../assets/images/background.jpg');
const logo = require('../../../assets/images/mobi_logo.png');

export default function LearnerProfileScreen() {
  const navigation = useNavigation<NavigationProp<'LearnerProfile'>>();

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backButton} onPress={() => navigation.navigate('CenterProfile')}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </Pressable>

          <Image source={logo} style={styles.logo} />

          <View style={styles.childCard}>
            <Text style={styles.childName}>Lexi{'\n'}Pantaleon</Text>

            <View style={styles.catFace}>
              <Text style={styles.catEmoji}>🐱</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Edit Child’s Information</Text>
          <Field text="Full name: Lexi Pantaleon" />
          <Field text="Nickname: Nadaa" />
          <Field text="Birthdate: April 17, 2016" />
          <Field text="Gender: Female" />

          <Text style={styles.sectionLabel}>Edit Guardian’s Information</Text>
          <Field text="Account Name: Lucinda Barna" />
          <Field text="Account Username: lucindar" />
          <Field text="Role: Mother" />
          <Field text="Mail: @usermail.mail.com" />
        </ScrollView>

        <View style={styles.switchPanel}>
          <Text style={styles.switchTitle}>Switch Profile?</Text>

          <View style={styles.childRow}>
            {['Child 3', 'Child 4', 'Child 5', 'Child 2'].map((child, index) => (
              <View key={child} style={styles.childItem}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childEmoji}>{['🦝', '🐱', '🦊', '🐻'][index]}</Text>
                </View>
                <Text style={styles.childLabel}>{child}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Field({ text }: { text: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 160 },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 10,
  },
  logo: {
    alignSelf: 'center',
    marginTop: 12,
    width: 95,
    height: 60,
    resizeMode: 'contain',
  },
  childCard: {
    marginTop: 18,
    marginHorizontal: 24,
    height: 120,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  childName: { fontSize: 19, fontWeight: '800', color: '#7A4A3A' },
  catFace: { width: 105, height: 95, alignItems: 'center', justifyContent: 'center' },
  catEmoji: { fontSize: 78 },
  sectionLabel: {
    marginLeft: 28,
    marginTop: 18,
    marginBottom: 6,
    fontSize: 12,
  },
  field: {
    marginHorizontal: 28,
    marginBottom: 8,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(239,217,239,0.9)',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  fieldText: { fontSize: 10, color: '#8A7A8A', fontStyle: 'italic' },
  switchPanel: {
    position: 'absolute',
    left: -15,
    right: -15,
    bottom: -30,
    height: 145,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    backgroundColor: '#AFC0E4',
    alignItems: 'center',
    paddingTop: 28,
  },
  switchTitle: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  childRow: {
    flexDirection: 'row',
    gap: 12,
  },
  childItem: { alignItems: 'center' },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childEmoji: { fontSize: 30 },
  childLabel: { fontSize: 9, fontWeight: '700', marginTop: 4 },
});