import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  TextInput,
  ImageBackground,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Activity, NavigationProp } from '../../types';

const logo = require('../../../assets/images/mobi_logo.png');
const bgImage = require('../../../assets/images/background.jpg');
const locked = require('../../../assets/images/locked.png');

const sample1 = require('../../../assets/images/sample1.jpg');
const sample2 = require('../../../assets/images/sample2.jpg');
const sample3 = require('../../../assets/images/sample3.jpg');
const sample4 = require('../../../assets/images/sample4.jpg');

const ADULT_MAGIC_CODE = '1234';

const activities: Activity[] = [
  {
    id: 1,
    title: 'Animal Words',
    level: 'Beginner',
    category: 'Before words',
    difficulty: 'Easy',
    target_answers: 'cow',
    acceptable_answers: 'cow,cattle',
    next_activity: '',
    teach_prompt: 'Learning animal names and sounds through simple picture naming.',
    teach_tone: 'friendly',
    ask_prompt: 'What animal is in the picture?',
    max_attempts: 3,
    hint1: 'It says moo.',
    hint2: 'It gives milk.',
    hint3: 'It lives on a farm.',
    correct_prompt: 'Great job! That is a cow.',
    correct_tone: 'happy',
    reward: 'stars',
    support_prompt: 'Let us try again together.',
    support_tone: 'gentle',
    failed_action: 'repeat',
    activity_image_url: '',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Step-by-Step Brushing',
    level: 'Beginner',
    category: 'Daily routines',
    difficulty: 'Easy',
    target_answers: 'brush teeth',
    acceptable_answers: 'brush,teeth,toothbrush',
    next_activity: '',
    teach_prompt: 'Breaking down the sensory-heavy task of oral hygiene into simple steps.',
    teach_tone: 'friendly',
    ask_prompt: 'What are we doing?',
    max_attempts: 3,
    hint1: 'We use a toothbrush.',
    hint2: 'We clean our teeth.',
    hint3: 'We do this every morning.',
    correct_prompt: 'Correct! We are brushing teeth.',
    correct_tone: 'happy',
    reward: 'stars',
    support_prompt: 'Look at the toothbrush.',
    support_tone: 'gentle',
    failed_action: 'repeat',
    activity_image_url: '',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Turn-Taking Workshop',
    level: 'Intermediate',
    category: 'Getting ready to talk',
    difficulty: 'Medium',
    target_answers: 'my turn',
    acceptable_answers: 'turn,my turn,your turn',
    next_activity: '',
    teach_prompt: 'Video tutorials that use block-building to teach the “Your Turn, My Turn” concept.',
    teach_tone: 'friendly',
    ask_prompt: 'Whose turn is it?',
    max_attempts: 3,
    hint1: 'We share turns.',
    hint2: 'You go after your friend.',
    hint3: 'Say “my turn”.',
    correct_prompt: 'Nice! It is your turn.',
    correct_tone: 'happy',
    reward: 'stars',
    support_prompt: 'Try saying “my turn”.',
    support_tone: 'gentle',
    failed_action: 'repeat',
    activity_image_url: '',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Friends Below the Sea',
    level: 'Beginner',
    category: 'Before words',
    difficulty: 'Easy',
    target_answers: 'fish',
    acceptable_answers: 'fish,sea animal',
    next_activity: '',
    teach_prompt: 'Getting to know sea animals and practicing simple words.',
    teach_tone: 'friendly',
    ask_prompt: 'What sea animal do you see?',
    max_attempts: 3,
    hint1: 'It swims.',
    hint2: 'It lives in the water.',
    hint3: 'It is a fish.',
    correct_prompt: 'Yes! That is a fish.',
    correct_tone: 'happy',
    reward: 'stars',
    support_prompt: 'Let us say fish together.',
    support_tone: 'gentle',
    failed_action: 'repeat',
    activity_image_url: '',
    created_at: new Date().toISOString(),
  },
];

const categories = [
  "Recommended for Lexi’s needs",
  'Getting ready to talk',
  'Before words',
  'Daily routines',
];

const getLocalImage = (id: number) => {
  if (id === 1) return sample1;
  if (id === 2) return sample2;
  if (id === 3) return sample3;
  return sample4;
};

export default function ChildDashboardScreen() {
  const navigation = useNavigation<NavigationProp<'ChildDashboard'>>();

  const [showAdultModal, setShowAdultModal] = useState(false);
  const [magicCode, setMagicCode] = useState('');

  const handleOpenAdultMode = () => {
    if (magicCode === ADULT_MAGIC_CODE) {
      setShowAdultModal(false);
      setMagicCode('');
      navigation.navigate('AdultDashboard');
    } else {
      Alert.alert('Incorrect Code', 'Please enter the correct magic code.');
    }
  };

  const renderActivityCard = ({ item }: { item: Activity }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate('ActivitySession', {
          activity: item,
        })
      }
    >
      <Image
        source={
          item.activity_image_url
            ? { uri: item.activity_image_url }
            : getLocalImage(item.id)
        }
        style={styles.cardImage}
      />

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.teach_prompt}
        </Text>

        <Text style={styles.uploadedBy} numberOfLines={1}>
          {item.category} • {item.difficulty}
        </Text>

        <Text style={styles.timeText}>{item.level}</Text>
      </View>
    </Pressable>
  );

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Image source={logo} style={styles.logo} />

            <View>
              <Text style={styles.greeting}>Hi, Lexi!</Text>
              <Text style={styles.subGreeting}>We are happy to see you.</Text>
            </View>
          </View>

          <View style={styles.rightHeader}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={15} color="#333" />
              <TextInput
                placeholder="Search"
                placeholderTextColor="#111"
                style={styles.searchInput}
              />
              <Text style={styles.filterText}>Filter</Text>
            </View>

            <Pressable
              style={styles.lockButton}
              onPress={() => setShowAdultModal(true)}
            >
              <Image source={locked} style={styles.lockIcon} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pageContent}
        >
          {categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>

              <FlatList
                data={activities}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderActivityCard}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          ))}
        </ScrollView>

        <Modal
          visible={showAdultModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAdultModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.magicCard}>
              <TextInput
                value={magicCode}
                onChangeText={setMagicCode}
                placeholder="Please enter magic code"
                placeholderTextColor="#777"
                style={styles.magicInput}
                secureTextEntry
                keyboardType="number-pad"
              />

              <Pressable
                style={styles.openAdultButton}
                onPress={handleOpenAdultMode}
              >
                <Text style={styles.openAdultText}>OPEN ADULT MODE</Text>
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setShowAdultModal(false);
                  setMagicCode('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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

  header: {
    height: 58,
    paddingHorizontal: 31,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 72,
    height: 42,
    resizeMode: 'contain',
    marginRight: 8,
  },

  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    lineHeight: 25,
  },

  subGreeting: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111',
    marginTop: -1,
  },

  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchBox: {
    width: 240,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(246, 216, 244, 0.82)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },

  searchInput: {
    flex: 1,
    height: 30,
    paddingVertical: 0,
    paddingHorizontal: 5,
    fontSize: 12,
    color: '#111',
  },

  filterText: {
    fontSize: 10,
    color: '#777',
  },

  lockButton: {
    width: 32,
    height: 32,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  lockIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },

  pageContent: {
    paddingBottom: 30,
  },

  categorySection: {
    marginBottom: 16,
  },

  categoryTitle: {
    marginLeft: 32,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },

  horizontalList: {
    paddingLeft: 31,
    paddingRight: 24,
  },

  card: {
    width: 162,
    height: 184,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },

  cardImage: {
    width: '100%',
    height: 93,
    resizeMode: 'cover',
  },

  cardBody: {
    paddingHorizontal: 10,
    paddingTop: 7,
  },

  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },

  cardDescription: {
    fontSize: 9,
    color: '#333',
    lineHeight: 11,
  },

  uploadedBy: {
    fontSize: 8,
    fontWeight: '800',
    color: '#111',
    marginTop: 7,
  },

  timeText: {
    fontSize: 8,
    color: '#333',
    marginTop: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  magicCard: {
    width: 195,
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    paddingTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 8,
    alignItems: 'center',
  },

  magicInput: {
    width: '100%',
    height: 37,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 12,
    textAlign: 'center',
    color: '#111',
  },

  openAdultButton: {
    marginTop: 7,
  },

  openAdultText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555',
  },

  cancelButton: {
    marginTop: 8,
  },

  cancelText: {
    fontSize: 9,
    color: '#777',
  },
});