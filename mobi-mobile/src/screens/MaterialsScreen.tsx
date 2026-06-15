// // mobi-mobile/src/screens/MaterialsScreen.tsx
// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Pressable,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   RefreshControl,
//   TextInput,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { api } from '../services/api';
// import { Activity, NavigationProp } from '../types';

// export default function MaterialsScreen() {
//   const navigation = useNavigation<NavigationProp<'Main'>>();
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isSearching, setIsSearching] = useState(false);

//   const fetchActivities = async () => {
//     try {
//       const response = await api.get('/activities');
//       setActivities(response.data);
//       setFilteredActivities(response.data);
//     } catch (error) {
//       console.error('Fetch activities error:', error);
//       Alert.alert('Error', 'Failed to load activities.');
//     } finally {
//       setIsLoading(false);
//       setRefreshing(false);
//       setIsSearching(false);
//     }
//   };

//   const searchActivities = async (query: string) => {
//     if (!query.trim()) {
//       setFilteredActivities(activities);
//       return;
//     }
    
//     setIsSearching(true);
//     try {
//       const response = await api.get(`/activities/search?q=${encodeURIComponent(query)}`);
//       setFilteredActivities(response.data);
//     } catch (error) {
//       console.error('Search activities error:', error);
//       Alert.alert('Error', 'Failed to search activities');
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSearch = (text: string) => {
//     setSearchQuery(text);
//     searchActivities(text);
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchActivities();
//       setSearchQuery('');
//     }, [])
//   );

//   const handleDelete = (id: number, title: string) => {
//     Alert.alert(
//       'Delete Activity',
//       `Are you sure you want to delete "${title}"?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await api.delete(`/activities/${id}`);
//               fetchActivities();
//               Alert.alert('Success', 'Activity deleted successfully');
//             } catch (error) {
//               Alert.alert('Error', 'Failed to delete activity');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const getLevelColor = (level: string) => {
//     const colors: Record<string, string> = {
//       'SOUND': '#10B981',
//       'SYLLABLE': '#3B82F6',
//       'WORD': '#8B5CF6',
//       'PHRASE': '#F59E0B',
//       'SENTENCE': '#EF4444',
//       'CONVERSING': '#06B6D4',
//     };
//     return colors[level] || '#6B7280';
//   };

//   const renderActivityCard = ({ item }: { item: Activity }) => (
//     <Pressable
//       style={styles.card}
//       onPress={() => navigation.navigate('ActivityDetail', { activity: item })}
//     >
//       <View style={styles.cardHeader}>
//         <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) + '20' }]}>
//           <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>{item.level}</Text>
//         </View>
//         <Text style={styles.difficulty}>{item.difficulty}</Text>
//       </View>
      
//       <Text style={styles.activityTitle}>{item.title}</Text>
//       <Text style={styles.category}>{item.category}</Text>
      
//       <View style={styles.targetContainer}>
//         <Text style={styles.targetLabel}>Target:</Text>
//         <Text style={styles.targetText}>{item.target_answers}</Text>
//       </View>

//       <View style={styles.cardActions}>
//         <Pressable
//           style={[styles.actionButton, styles.editButton]}
//           onPress={() => navigation.navigate('EditActivity', { activity: item })}
//         >
//           <Text style={styles.actionButtonText}>Edit</Text>
//         </Pressable>
//         <Pressable
//           style={[styles.actionButton, styles.previewButton]}
//           onPress={() => navigation.navigate('ActivityDetail', { activity: item })}
//         >
//           <Text style={styles.actionButtonText}>Preview</Text>
//         </Pressable>
//         <Pressable
//           style={[styles.actionButton, styles.deleteButton]}
//           onPress={() => handleDelete(item.id, item.title)}
//         >
//           <Text style={styles.actionButtonText}>Delete</Text>
//         </Pressable>
//       </View>
//     </Pressable>
//   );

//   if (isLoading) {
//     return (
//       <SafeAreaView style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#7C3AED" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Learning Materials</Text>
//         <Pressable
//           style={styles.addButton}
//           onPress={() => navigation.navigate('CreateActivity')}
//         >
//           <Text style={styles.addButtonText}>+ Create Activity</Text>
//         </Pressable>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search activities by title, category, or level..."
//           placeholderTextColor="#999"
//           value={searchQuery}
//           onChangeText={handleSearch}
//         />
//         {searchQuery.length > 0 && (
//           <Pressable onPress={() => handleSearch('')} style={styles.clearButton}>
//             <Text style={styles.clearButtonText}>✕</Text>
//           </Pressable>
//         )}
//       </View>

//       {isSearching ? (
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color="#7C3AED" />
//           <Text style={styles.searchingText}>Searching...</Text>
//         </View>
//       ) : filteredActivities.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyEmoji}>
//             {searchQuery ? '🔍' : '📖'}
//           </Text>
//           <Text style={styles.emptyText}>
//             {searchQuery ? 'No activities found' : 'No activities yet'}
//           </Text>
//           <Text style={styles.emptySubtext}>
//             {searchQuery 
//               ? `Try a different search term`
//               : 'Tap the + button to create your first learning activity'}
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredActivities}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderActivityCard}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={fetchActivities} />
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F5FF' },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F5FF' },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E0EB' },
//   title: { fontSize: 28, fontWeight: '800', color: '#2D1B4E' },
//   addButton: { backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
//   addButtonText: { color: 'white', fontWeight: '700', fontSize: 14 },
//   searchContainer: { marginHorizontal: 20, marginVertical: 12, flexDirection: 'row', alignItems: 'center' },
//   searchInput: { flex: 1, backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E0EB' },
//   clearButton: { position: 'absolute', right: 12, padding: 8 },
//   clearButtonText: { fontSize: 16, color: '#999', fontWeight: '600' },
//   listContent: { padding: 20, gap: 16 },
//   card: { backgroundColor: 'white', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
//   cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   levelText: { fontSize: 12, fontWeight: '700' },
//   difficulty: { fontSize: 12, color: '#6B6280' },
//   activityTitle: { fontSize: 18, fontWeight: '800', color: '#2D1B4E', marginBottom: 4 },
//   category: { fontSize: 14, color: '#7C3AED', marginBottom: 8 },
//   targetContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
//   targetLabel: { fontSize: 13, fontWeight: '600', color: '#4A3B6E' },
//   targetText: { fontSize: 13, color: '#6B6280', flex: 1 },
//   cardActions: { flexDirection: 'row', gap: 8 },
//   actionButton: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
//   editButton: { backgroundColor: '#7C3AED' },
//   previewButton: { backgroundColor: '#10B981' },
//   deleteButton: { backgroundColor: '#EF4444' },
//   actionButtonText: { color: 'white', fontWeight: '600', fontSize: 13 },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
//   emptyEmoji: { fontSize: 64, marginBottom: 16 },
//   emptyText: { fontSize: 18, fontWeight: '700', color: '#2D1B4E', marginBottom: 8 },
//   emptySubtext: { fontSize: 14, color: '#6B6280', textAlign: 'center' },
//   searchingText: { marginTop: 12, color: '#6B6280' },
// });





// mobi-mobile/src/screens/MaterialsScreen.tsx

import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import { api } from '../services/api';

import {
  Activity,
  NavigationProp,
} from '../types';

const logo = require('../../assets/images/mobi_logo.png');

const placeholderImage =
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200&auto=format&fit=crop';

export default function MaterialsScreen() {
  const navigation =
    useNavigation<NavigationProp<'Materials'>>();

  const route = useRoute();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] =
    useState<Activity[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [isSearching, setIsSearching] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');

      setActivities(response.data);

      setFilteredActivities(response.data);
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Error',
        'Failed to load activities.'
      );
    } finally {
      setIsLoading(false);

      setRefreshing(false);

      setIsSearching(false);
    }
  };

  const searchActivities = async (query: string) => {
    if (!query.trim()) {
      setFilteredActivities(activities);

      return;
    }

    setIsSearching(true);

    try {
      const response = await api.get(
        `/activities/search?q=${encodeURIComponent(
          query
        )}`
      );

      setFilteredActivities(response.data);
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Error',
        'Failed to search activities'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    searchActivities(text);
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivities();

      setSearchQuery('');
    }, [])
  );

  const handleDelete = (
    id: number,
    title: string
  ) => {
    Alert.alert(
      'Delete Activity',
      `Delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(
                `/activities/${id}`
              );

              fetchActivities();

              Alert.alert(
                'Success',
                'Activity deleted'
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to delete activity'
              );
            }
          },
        },
      ]
    );
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      SOUND: '#34C759',
      SYLLABLE: '#5B8DEF',
      WORD: '#9B6DFF',
      PHRASE: '#FFB648',
      SENTENCE: '#FF6B6B',
      CONVERSING: '#48C6EF',
    };

    return colors[level] || '#AAA';
  };

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

  const renderActivityCard = ({
    item,
  }: {
    item: Activity;
  }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate(
          'ActivityDetail',
          {
            activity: item,
          }
        )
      }
    >
      <Image
        source={{
          uri:
            item.activity_image_url ||
            placeholderImage,
        }}
        style={styles.cardImage}
      />

      <View style={styles.cardContent}>

        <View style={styles.cardTopRow}>

          <View
            style={[
              styles.levelChip,
              {
                backgroundColor:
                  getLevelColor(
                    item.level
                  ),
              },
            ]}
          >
            <Text style={styles.levelChipText}>
              {item.level}
            </Text>
          </View>

          <Text style={styles.difficultyText}>
            {item.difficulty}
          </Text>
        </View>

        <Text style={styles.cardTitle}>
          {item.title}
        </Text>

        <Text style={styles.cardCategory}>
          {item.category}
        </Text>

        <Text
          style={styles.cardDescription}
          numberOfLines={2}
        >
          {item.teach_prompt ||
            'Interactive therapy activity for speech development.'}
        </Text>

        <View style={styles.cardButtons}>

          <Pressable
            style={styles.previewButton}
            onPress={() =>
              navigation.navigate(
                'ActivityDetail',
                {
                  activity: item,
                }
              )
            }
          >
            <Ionicons
              name="play-outline"
              size={16}
              color="#FFF"
            />

            <Text
              style={
                styles.previewButtonText
              }
            >
              Preview
            </Text>
          </Pressable>

          <View style={styles.iconActions}>

            <Pressable
              style={styles.iconButton}
              onPress={() =>
                navigation.navigate(
                  'EditActivity',
                  {
                    activity: item,
                  }
                )
              }
            >
              <Ionicons
                name="create-outline"
                size={18}
                color="#7B4DB2"
              />
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={() =>
                handleDelete(
                  item.id,
                  item.title
                )
              }
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color="#D94B4B"
              />
            </Pressable>

          </View>
        </View>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.centerContainer}
      >
        <ActivityIndicator
          size="large"
          color="#B48BC7"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}

      <View style={styles.mobileHeader}>

        <Pressable
          onPress={() =>
            setSidebarOpen(
              !sidebarOpen
            )
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
              Materials
            </Text>

            <Text
              style={styles.subtitleSmall}
            >
              {
                filteredActivities.length
              }{' '}
              activities
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() =>
            navigation.navigate(
              'CenterProfile'
            )
          }
        >
          <Text style={styles.profileIcon}>
            👤
          </Text>
        </Pressable>
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
            </View>

            {sidebarItems.map(
              (item) => {
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
                      setSidebarOpen(
                        false
                      );

                      navigation.navigate(
                        item.screen as never
                      );
                    }}
                  >
                    <Ionicons
                      name={
                        item.icon as any
                      }
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
              }
            )}
          </View>
        </>
      )}

      {/* SEARCH */}

      <View style={styles.searchContainer}>

        <Ionicons
          name="search-outline"
          size={18}
          color="#777"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search materials..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {searchQuery.length > 0 && (
          <Pressable
            onPress={() =>
              handleSearch('')
            }
          >
            <Ionicons
              name="close-circle"
              size={18}
              color="#AAA"
            />
          </Pressable>
        )}
      </View>

      {/* ACTIONS */}

      <View style={styles.topActions}>

        <Pressable
          style={styles.createButton}
          onPress={() =>
            navigation.navigate(
              'CreateActivity'
            )
          }
        >
          <Ionicons
            name="add-outline"
            size={18}
            color="#FFF"
          />

          <Text
            style={
              styles.createButtonText
            }
          >
            Create Activity
          </Text>
        </Pressable>

        <Pressable
          style={styles.filterButton}
          onPress={() =>
            setFilterOpen(
              !filterOpen
            )
          }
        >
          <Ionicons
            name="options-outline"
            size={20}
            color="#444"
          />
        </Pressable>
      </View>

      {/* FILTER */}

      {filterOpen && (
        <View style={styles.filterMenu}>

          <Pressable
            style={styles.filterItem}
            onPress={() => {
              const sorted = [
                ...filteredActivities,
              ].sort((a, b) =>
                a.title.localeCompare(
                  b.title
                )
              );

              setFilteredActivities(
                sorted
              );

              setFilterOpen(false);
            }}
          >
            <Text
              style={styles.filterText}
            >
              Ascending
            </Text>
          </Pressable>

          <Pressable
            style={styles.filterItem}
            onPress={() => {
              const sorted = [
                ...filteredActivities,
              ].sort((a, b) =>
                b.title.localeCompare(
                  a.title
                )
              );

              setFilteredActivities(
                sorted
              );

              setFilterOpen(false);
            }}
          >
            <Text
              style={styles.filterText}
            >
              Descending
            </Text>
          </Pressable>

        </View>
      )}

      {/* CONTENT */}

      {isSearching ? (
        <View
          style={styles.centerContainer}
        >
          <ActivityIndicator
            size="large"
            color="#B48BC7"
          />
        </View>
      ) : filteredActivities.length ===
        0 ? (
        <View
          style={styles.emptyContainer}
        >

          <Ionicons
            name="book-outline"
            size={80}
            color="#D5BEE2"
          />

          <Text style={styles.emptyTitle}>
            No materials found
          </Text>

          <Text
            style={
              styles.emptyDescription
            }
          >
            Create your first therapy
            activity to begin building
            your learning library.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={
            renderActivityCard
          }
          contentContainerStyle={
            styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                fetchActivities
              }
            />
          }
          showsVerticalScrollIndicator={
            false
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3F8',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F3F8',
  },

  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
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
    fontSize: 20,
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

  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E4D5E4',
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#222',
  },

  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
  },

  createButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B48BC7',
    paddingVertical: 14,
    borderRadius: 14,
  },

  createButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },

  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4D5E4',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  cardImage: {
    width: '100%',
    height: 190,
  },

  cardContent: {
    padding: 16,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    marginBottom: 10,
  },

  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  levelChipText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },

  difficultyText: {
    fontSize: 12,
    color: '#777',
    fontWeight: '600',
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
  },

  cardCategory: {
    fontSize: 13,
    color: '#9A77B5',
    marginBottom: 10,
    fontWeight: '700',
  },

  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },

  cardButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginTop: 18,
  },

  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B48BC7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  previewButtonText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 6,
  },

  iconActions: {
    flexDirection: 'row',
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F7F1F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
    marginTop: 18,
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 24,
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
    marginBottom: 30,
  },

  sidebarLogo: {
    width: 120,
    height: 70,
    resizeMode: 'contain',
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

  filterMenu: {
    position: 'absolute',
    top: 170,
    right: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    width: 170,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 50,
  },

  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  filterText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});