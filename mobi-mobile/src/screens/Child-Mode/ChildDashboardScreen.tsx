import React, { useMemo, useState } from 'react';
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
  useWindowDimensions,
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

const filterOptions = [
  { id: 'all', label: 'All options', value: 'all' },
  { id: 'option1', label: 'Option 1', value: 'option1' },
  { id: 'option2', label: 'Option 2', value: 'option2' },
  { id: 'option3', label: 'Option 3', value: 'option3' },
  { id: 'option4', label: 'Option 4', value: 'option4' },
];

const getLocalImage = (id: number) => {
  if (id === 1) return sample1;
  if (id === 2) return sample2;
  if (id === 3) return sample3;
  return sample4;
};

export default function ChildDashboardScreen() {
  const navigation = useNavigation<NavigationProp<'ChildDashboard'>>();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isSmallPhone = width < 380;

  const [showAdultModal, setShowAdultModal] = useState(false);
  const [magicCode, setMagicCode] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const cardWidth = isTablet ? 220 : isSmallPhone ? 150 : 165;
  const cardHeight = isTablet ? 230 : 190;

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesSearch =
        query === '' ||
        activity.title.toLowerCase().includes(query) ||
        activity.category.toLowerCase().includes(query) ||
        activity.level.toLowerCase().includes(query) ||
        activity.difficulty.toLowerCase().includes(query) ||
        activity.teach_prompt.toLowerCase().includes(query);

      // BACKEND READY:
      // Replace this with real filter logic later.
      // Example: selectedFilter.value === activity.difficulty
      const matchesFilter =
        selectedFilter.value === 'all' ||
        selectedFilter.value === 'option1' ||
        selectedFilter.value === 'option2' ||
        selectedFilter.value === 'option3' ||
        selectedFilter.value === 'option4';

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

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
      style={[
        styles.card,
        {
          width: cardWidth,
          height: cardHeight,
        },
      ]}
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
        style={[styles.cardImage, { height: isTablet ? 120 : 96 }]}
      />

      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, isTablet && styles.tabletCardTitle]} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={[styles.cardDescription, isTablet && styles.tabletCardDescription]} numberOfLines={3}>
          {item.teach_prompt}
        </Text>

        <Text style={styles.uploadedBy} numberOfLines={1}>
          {item.category} • {item.difficulty}
        </Text>

        <Text style={styles.timeText}>{item.level}</Text>
      </View>
    </Pressable>
  );

  const renderCategorySection = (category: string) => {
    const data =
      category === "Recommended for Lexi’s needs"
        ? filteredActivities
        : filteredActivities.filter((item) => item.category === category);

    if (data.length === 0) return null;

    return (
      <View key={category} style={styles.categorySection}>
        <Text style={[styles.categoryTitle, isTablet && styles.tabletCategoryTitle]}>
          {category}
        </Text>

        <FlatList
          data={data}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderActivityCard}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isSmallPhone && styles.smallHeader]}>
          <View style={styles.leftHeader}>
            <Image source={logo} style={[styles.logo, isSmallPhone && styles.smallLogo]} />

            <View style={styles.greetingGroup}>
              <Text style={[styles.greeting, isSmallPhone && styles.smallGreeting]}>
                Hi, Lexi!
              </Text>
              <Text style={[styles.subGreeting, isSmallPhone && styles.smallSubGreeting]}>
                We are happy to see you.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.lockButton}
            onPress={() => setShowAdultModal(true)}
          >
            <Image source={locked} style={styles.lockIcon} />
          </Pressable>
        </View>

        <View style={styles.controlsRow}>
          <View style={[
              styles.searchBox,
              isSearchFocused && styles.searchBoxFocused,
            ]}>
            <Ionicons name="search-outline" size={17} />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search activities"
              //placeholderTextColor="#777"
              style={[
                styles.searchInput,
                {
                  outlineWidth: 0,
                } as any,
              ]}
              autoCorrect={false}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />

            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={17} color="#999" />
              </Pressable>
            )}
          </View>

          <Pressable
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.filterText}>{selectedFilter.label}</Text>
            <Ionicons name="chevron-down" size={14} color="#777" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.pageContent,
            isTablet && styles.tabletPageContent,
          ]}
        >
          {categories.map(renderCategorySection)}

          {filteredActivities.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={34} color="#B48BC7" />
              <Text style={styles.emptyTitle}>No activities found</Text>
              <Text style={styles.emptyText}>
                Try searching another activity or changing the filter.
              </Text>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={showFilterModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <Pressable
            style={styles.filterOverlay}
            onPress={() => setShowFilterModal(false)}
          >
            <View style={styles.filterModalCard}>
              <Text style={styles.filterModalTitle}>Filter Activities</Text>

              {filterOptions.map((option) => {
                const isSelected = selectedFilter.value === option.value;

                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.filterOption,
                      isSelected && styles.selectedFilterOption,
                    ]}
                    onPress={() => {
                      setSelectedFilter(option);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        isSelected && styles.selectedFilterOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#B48BC7" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>

        <Modal
          visible={showAdultModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAdultModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.magicCard}>
              <Text style={styles.magicTitle}>Adult Mode</Text>
              <Text style={styles.magicSubtitle}>
                Enter the magic code to continue.
              </Text>

              <TextInput
                value={magicCode}
                onChangeText={setMagicCode}
                placeholder="Magic code"
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
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallHeader: {
    paddingHorizontal: 14,
  },

  leftHeader: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 74,
    height: 45,
    resizeMode: 'contain',
    marginRight: 8,
  },

  smallLogo: {
    width: 60,
    height: 38,
  },

  greetingGroup: {
    flex: 1,
    minWidth: 0,
  },

  greeting: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111',
  },

  smallGreeting: {
    fontSize: 19,
  },

  subGreeting: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
    marginTop: 1,
  },

  smallSubGreeting: {
    fontSize: 10,
  },

  lockButton: {
    width: 42,
    height: 42,
    marginLeft: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },

  lockIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  controlsRow: {
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 18,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  searchBox: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },

  searchBoxFocused: {
    borderWidth: 2,
    borderColor: '#C69AD9',
    backgroundColor: '#FFFFFF',

    shadowColor: '#C69AD9',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  searchInput: {
    flex: 1,
    height: 42,
    paddingVertical: 0,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#111',
  },

  filterButton: {
    height: 42,
    maxWidth: 125,
    borderRadius: 14,
    backgroundColor: '#F2DDF2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  filterText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#7B5B88',
    marginRight: 4,
  },

  pageContent: {
    paddingTop: 4,
    paddingBottom: 34,
  },

  tabletPageContent: {
    paddingTop: 10,
  },

  categorySection: {
    marginBottom: 22,
  },

  categoryTitle: {
    marginLeft: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
  },

  tabletCategoryTitle: {
    fontSize: 20,
  },

  horizontalList: {
    paddingLeft: 18,
    paddingRight: 18,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },

  cardImage: {
    width: '100%',
    resizeMode: 'cover',
  },

  cardBody: {
    flex: 1,
    paddingHorizontal: 11,
    paddingTop: 8,
    paddingBottom: 8,
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111',
    marginBottom: 5,
  },

  tabletCardTitle: {
    fontSize: 15,
  },

  cardDescription: {
    fontSize: 10,
    color: '#333',
    lineHeight: 13,
  },

  tabletCardDescription: {
    fontSize: 12,
    lineHeight: 16,
  },

  uploadedBy: {
    fontSize: 8,
    fontWeight: '800',
    color: '#111',
    marginTop: 'auto',
  },

  timeText: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '900',
    color: '#111',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },

  filterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  filterModalCard: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  filterModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
    marginBottom: 12,
  },

  filterOption: {
    height: 44,
    borderRadius: 13,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#FAF4FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedFilterOption: {
    backgroundColor: '#F2DDF2',
  },

  filterOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },

  selectedFilterOptionText: {
    color: '#7B5B88',
    fontWeight: '900',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  magicCard: {
    width: '100%',
    maxWidth: 290,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },

  magicTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
  },

  magicSubtitle: {
    marginTop: 5,
    marginBottom: 15,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  magicInput: {
    width: '100%',
    height: 44,
    backgroundColor: '#F2DDF2',
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 14,
    textAlign: 'center',
    color: '#111',
  },

  openAdultButton: {
    width: '100%',
    height: 42,
    borderRadius: 14,
    backgroundColor: '#B48BC7',
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  openAdultText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  cancelButton: {
    marginTop: 12,
  },

  cancelText: {
    fontSize: 11,
    color: '#777',
    fontWeight: '700',
  },
});