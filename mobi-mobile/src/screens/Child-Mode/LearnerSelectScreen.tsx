import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../types';
import {
  getCurrentAuthUser,
  getMobileLearners,
  MobileLearner,
  setActiveLearner,
} from '../../services/api';

const bgImage = require('../../../assets/images/background.jpg');
const mobiLogo = require('../../../assets/images/mobi_logo.png');

function getDisplayName(learner: MobileLearner) {
  return (
    learner.nickname?.trim() ||
    `${learner.firstName ?? ''} ${learner.lastName ?? ''}`.trim() ||
    'Learner'
  );
}

function getInitials(learner: MobileLearner) {
  const name = getDisplayName(learner);
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function LearnerSelectScreen() {
  const navigation = useNavigation<NavigationProp<'LearnerSelect'>>();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [learners, setLearners] = useState<MobileLearner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const user = getCurrentAuthUser();

  useEffect(() => {
    let mounted = true;

    async function loadLearners() {
      try {
        const assignedLearners = await getMobileLearners();

        if (mounted) {
          setLearners(assignedLearners);
        }
      } catch (error) {
        Alert.alert(
          'Unable to Load Learners',
          error instanceof Error
            ? error.message
            : 'Please try again.',
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadLearners();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredLearners = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return learners;
    }

    return learners.filter((learner) => {
      const name = getDisplayName(learner).toLowerCase();
      const fullName = `${learner.firstName ?? ''} ${learner.lastName ?? ''}`.toLowerCase();
      const code = learner.learnerCode?.toLowerCase() ?? '';

      return (
        name.includes(query) ||
        fullName.includes(query) ||
        code.includes(query)
      );
    });
  }, [learners, searchQuery]);

  const selectLearner = (learner: MobileLearner) => {
    setActiveLearner(learner);

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'ChildDashboard' }],
      }),
    );
  };

  const handleLogout = () => {
    setActiveLearner(null);

    navigation.reset({
      index: 0,
      routes: [{ name: 'LogIn' }],
    });
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image source={mobiLogo} style={styles.logo} />

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#8B5EA4" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.title, isTablet && styles.tabletTitle]}>
            Who is learning today?
          </Text>
          <Text style={styles.subtitle}>
            {user?.firstName ? `Choose a learner assigned to ${user.firstName}.` : 'Choose an assigned learner.'}
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#8B5EA4" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search learner"
            placeholderTextColor="#8F8292"
            style={[styles.searchInput, { outlineWidth: 0 } as any]}
            autoCorrect={false}
          />
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#8B5EA4" />
            <Text style={styles.stateText}>Loading assigned learners...</Text>
          </View>
        ) : filteredLearners.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="people-outline" size={42} color="#8B5EA4" />
            <Text style={styles.emptyTitle}>No assigned learners found</Text>
            <Text style={styles.stateText}>
              Ask the center admin to assign learners to this therapist account.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredLearners}
            keyExtractor={(item) => item.id}
            numColumns={isTablet ? 3 : 2}
            columnWrapperStyle={styles.cardRow}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const level =
                item.currentSpeechLadder ||
                item.suggestedSpeechLadder ||
                'Needs setup';

              return (
                <Pressable
                  style={[
                    styles.learnerCard,
                    index % 2 === 1 && styles.altLearnerCard,
                  ]}
                  onPress={() => selectLearner(item)}
                >
                  {item.profilePhotoUrl ? (
                    <Image
                      source={{ uri: item.profilePhotoUrl }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.initialsAvatar}>
                      <Text style={styles.initialsText}>{getInitials(item)}</Text>
                    </View>
                  )}

                  <Text style={styles.learnerName} numberOfLines={2}>
                    {getDisplayName(item)}
                  </Text>
                  <Text style={styles.learnerMeta} numberOfLines={1}>
                    {level}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 92,
    height: 54,
    resizeMode: 'contain',
  },
  logoutButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5EA4',
  },
  titleBlock: {
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 31,
    fontWeight: '900',
    color: '#171019',
  },
  tabletTitle: {
    fontSize: 40,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#5F5363',
  },
  searchBox: {
    height: 46,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 10,
    color: '#171019',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 28,
  },
  cardRow: {
    gap: 14,
  },
  learnerCard: {
    flex: 1,
    minHeight: 190,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: '#FFF7EF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3D1B8',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 4,
  },
  altLearnerCard: {
    backgroundColor: '#F2F7FF',
    borderColor: '#C8DAF2',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginBottom: 13,
  },
  initialsAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginBottom: 13,
    backgroundColor: '#8B5EA4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
  },
  learnerName: {
    minHeight: 42,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 21,
    fontWeight: '900',
    color: '#171019',
  },
  learnerMeta: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '800',
    color: '#6A5C6F',
    textTransform: 'capitalize',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '900',
    color: '#171019',
    textAlign: 'center',
  },
  stateText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#5F5363',
    textAlign: 'center',
  },
});
