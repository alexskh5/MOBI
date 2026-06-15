// // mobi-mobile/src/screens/DashboardScreen.tsx
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
//   Image,
//   TextInput,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import { api } from '../services/api';
// import { Learner, NavigationProp } from '../types';

// export default function DashboardScreen() {
//   const navigation = useNavigation<NavigationProp<'Main'>>();
//   const [learners, setLearners] = useState<Learner[]>([]);
//   const [filteredLearners, setFilteredLearners] = useState<Learner[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isSearching, setIsSearching] = useState(false);

//   const fetchLearners = async () => {
//     try {
//       const response = await api.get('/learners');
//       setLearners(response.data);
//       setFilteredLearners(response.data);
//     } catch (error) {
//       console.error('Fetch learners error:', error);
//       Alert.alert('Error', 'Failed to load learners.');
//     } finally {
//       setIsLoading(false);
//       setRefreshing(false);
//       setIsSearching(false);
//     }
//   };

//   const searchLearners = async (query: string) => {
//     if (!query.trim()) {
//       setFilteredLearners(learners);
//       return;
//     }
    
//     setIsSearching(true);
//     try {
//       const response = await api.get(`/learners/search?q=${encodeURIComponent(query)}`);
//       setFilteredLearners(response.data);
//     } catch (error) {
//       console.error('Search learners error:', error);
//       Alert.alert('Error', 'Failed to search learners');
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSearch = (text: string) => {
//     setSearchQuery(text);
//     searchLearners(text);
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchLearners();
//       setSearchQuery('');
//     }, [])
//   );

//   const handleDelete = (id: number, name: string) => {
//     Alert.alert(
//       'Delete Learner',
//       `Are you sure you want to delete ${name}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await api.delete(`/learners/${id}`);
//               fetchLearners();
//               Alert.alert('Success', 'Learner deleted successfully');
//             } catch (error) {
//               Alert.alert('Error', 'Failed to delete learner');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const renderLearnerCard = ({ item }: { item: Learner }) => (
//     <Pressable
//       style={styles.card}
//       onPress={() => navigation.navigate('LearnerDetail', { learner: item })}
//     >
//       <View style={styles.cardHeader}>
//         {item.profile_picture_url ? (
//           <Image source={{ uri: item.profile_picture_url }} style={styles.avatar} />
//         ) : (
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>
//               {item.first_name[0]}{item.last_name[0]}
//             </Text>
//           </View>
//         )}
//         <View style={styles.cardInfo}>
//           <Text style={styles.learnerName}>
//             {item.first_name} {item.last_name}
//           </Text>
//           <Text style={styles.learnerDetails}>
//             Age: {item.age} • {item.diagnosis}
//           </Text>
//         </View>
//       </View>
      
//       <View style={styles.guardianInfo}>
//         <Text style={styles.guardianText}>
//           Guardian: {item.guardian_first_name} {item.guardian_last_name}
//         </Text>
//         <Text style={styles.guardianText}>Contact: {item.guardian_phone}</Text>
//       </View>

//       <View style={styles.cardActions}>
//         <Pressable
//           style={[styles.actionButton, styles.editButton]}
//           onPress={() => navigation.navigate('EditLearner', { learner: item })}
//         >
//           <Text style={styles.actionButtonText}>Edit</Text>
//         </Pressable>
//         <Pressable
//           style={[styles.actionButton, styles.deleteButton]}
//           onPress={() => handleDelete(item.id, `${item.first_name} ${item.last_name}`)}
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
//         <Text style={styles.title}>Enrolled Learners</Text>
//         <Pressable
//           style={styles.addButton}
//           onPress={() => navigation.navigate('EnrollLearner')}
//         >
//           <Text style={styles.addButtonText}>+ Enroll New</Text>
//         </Pressable>
//       </View>

//       {/* Search Bar */}
//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search learners by name, diagnosis, or guardian..."
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
//       ) : filteredLearners.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyEmoji}>
//             {searchQuery ? '🔍' : '📚'}
//           </Text>
//           <Text style={styles.emptyText}>
//             {searchQuery ? 'No learners found' : 'No learners enrolled yet'}
//           </Text>
//           <Text style={styles.emptySubtext}>
//             {searchQuery 
//               ? `Try a different search term`
//               : 'Tap the + button to enroll your first learner'}
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredLearners}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderLearnerCard}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={fetchLearners} />
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
//   cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#7C3AED20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
//   avatarText: { fontSize: 20, fontWeight: '700', color: '#7C3AED' },
//   cardInfo: { flex: 1 },
//   learnerName: { fontSize: 18, fontWeight: '800', color: '#2D1B4E' },
//   learnerDetails: { fontSize: 14, color: '#6B6280', marginTop: 4 },
//   guardianInfo: { backgroundColor: '#F8F5FF', padding: 12, borderRadius: 12, marginBottom: 12 },
//   guardianText: { fontSize: 13, color: '#4A3B6E', marginBottom: 2 },
//   cardActions: { flexDirection: 'row', gap: 10 },
//   actionButton: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
//   editButton: { backgroundColor: '#7C3AED' },
//   deleteButton: { backgroundColor: '#EF4444' },
//   actionButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
//   emptyEmoji: { fontSize: 64, marginBottom: 16 },
//   emptyText: { fontSize: 18, fontWeight: '700', color: '#2D1B4E', marginBottom: 8 },
//   emptySubtext: { fontSize: 14, color: '#6B6280', textAlign: 'center' },
//   searchingText: { marginTop: 12, color: '#6B6280' },
// });




// mobi-mobile/src/screens/DashboardScreen.tsx
// mobi-mobile/src/screens/DashboardScreen.tsx

// mobi-mobile/src/screens/DashboardScreen.tsx

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
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import { api } from '../services/api';
import { Learner, NavigationProp } from '../types';

// import Animated, {
//   FadeIn,
//   FadeOut,
//   SlideInLeft,
//   SlideOutLeft,
// } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';


const logo = require('../../assets/images/mobi_logo.png');

export default function DashboardScreen() {
  // const navigation = useNavigation<NavigationProp<'Main'>>();
const navigation = useNavigation<NavigationProp<'Dashboard'>>();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [filteredLearners, setFilteredLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const route = useRoute();

  const fetchLearners = async () => {
    try {
      const response = await api.get('/learners');
      setLearners(response.data);
      setFilteredLearners(response.data);
    } catch (error) {
      console.error('Fetch learners error:', error);
      Alert.alert('Error', 'Failed to load learners.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setIsSearching(false);
    }
  };

  const searchLearners = async (query: string) => {
    if (!query.trim()) {
      setFilteredLearners(learners);
      return;
    }

    setIsSearching(true);

    try {
      const response = await api.get(
        `/learners/search?q=${encodeURIComponent(query)}`
      );
      setFilteredLearners(response.data);
    } catch (error) {
      console.error('Search learners error:', error);
      Alert.alert('Error', 'Failed to search learners');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchLearners(text);
  };

  useFocusEffect(
    useCallback(() => {
      fetchLearners();
      setSearchQuery('');
    }, [])
  );

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Delete Learner',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/learners/${id}`);
              fetchLearners();
              Alert.alert('Success', 'Learner deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete learner');
            }
          },
        },
      ]
    );
  };

  const renderLearnerCard = ({ item }: { item: Learner }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('LearnerDetail', { learner: item })}
    >
      <View style={styles.cardTop}>
        {item.profile_picture_url ? (
          <Image source={{ uri: item.profile_picture_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.first_name[0]}
              {item.last_name[0]}
            </Text>
          </View>
        )}

        <View style={styles.cardInfo}>
          <Text style={styles.learnerName}>
            {item.first_name} {item.last_name}
          </Text>

          <Text style={styles.learnerDetails}>
            Age: {item.age} • {item.diagnosis}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Guardian: {item.guardian_first_name} {item.guardian_last_name}
        </Text>

        <Text style={styles.infoText}>
          Contact: {item.guardian_phone}
        </Text>
      </View>

      <View style={styles.cardActions}>

  <Pressable
    style={[styles.actionButton, styles.editButton]}
    onPress={() =>
      navigation.navigate(
        'EditLearner',
        { learner: item }
      )
    }
  >
    <Ionicons
      name="create-outline"
      size={15}
      color="#FFF"
      style={{ marginRight: 6 }}
    />

    <Text style={styles.editText}>
      Edit
    </Text>
  </Pressable>

  <Pressable
    style={[styles.actionButton, styles.deleteButton]}
    onPress={() =>
      handleDelete(
        item.id,
        `${item.first_name} ${item.last_name}`
      )
    }
  >
    <Ionicons
      name="trash-outline"
      size={15}
      color="#9C2C2C"
      style={{ marginRight: 6 }}
    />

    <Text style={styles.deleteText}>
      Delete
    </Text>
  </Pressable>

</View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#B48BC7" />
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mobileHeader}>
        <Pressable
          onPress={() => setSidebarOpen(!sidebarOpen)}
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Image source={logo} style={styles.logo} />

          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitleSmall}>
              {filteredLearners.length} enrolled learners
            </Text>
          </View>
        </View>

<Pressable
  style={styles.profileButton}
  onPress={() => navigation.navigate('CenterProfile')}
>
  <Text style={styles.profileIcon}>👤</Text>
</Pressable>
      </View>

      {/* {sidebarOpen && (
  <View style={styles.sidebar}>

    <Pressable
      onPress={() => navigation.navigate('Dashboard')}
    >
      <Text style={[styles.navItem, styles.activeNav]}>
        Dashboard
      </Text>
    </Pressable>

    <Pressable
      onPress={() => navigation.navigate('Materials')}
    >
      <Text style={styles.navItem}>
        Materials
      </Text>
    </Pressable>

    <Pressable
      onPress={() => navigation.navigate('Notifications')}
    >
      <Text style={styles.navItem}>
        Notifications
      </Text>
    </Pressable>

    <Pressable
      onPress={() => navigation.navigate('Collaboration')}
    >
      <Text style={styles.navItem}>
        Collaboration
      </Text>
    </Pressable>

    <Pressable
      onPress={() => navigation.navigate('Schedule')}
    >
      <Text style={styles.navItem}>
        Schedule
      </Text>
    </Pressable>

    <Pressable
      onPress={() => navigation.navigate('CenterProfile')}
    >
      <Text style={styles.navItem}>
        Center Profile
      </Text>
    </Pressable>

  </View>
)} */}
{sidebarOpen && (
  <>
    {/* Overlay */}
    <View style={styles.overlay}>
  <Pressable
    style={{ flex: 1 }}
    onPress={() => setSidebarOpen(false)}
  />
</View>

    {/* Sidebar */}
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Image source={logo} style={styles.sidebarLogo} />

        <Text style={styles.sidebarTitle}>
          MOBI
        </Text>
      </View>

      {sidebarItems.map((item) => {
        const isActive =
  route.name.toString() === item.screen;

        return (
          <Pressable
            key={item.label}
            style={[
              styles.sidebarItem,
              isActive && styles.activeSidebarItem,
            ]}
            onPress={() => {
              setSidebarOpen(false);
              navigation.navigate(item.screen as never);
            }}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={isActive ? '#FFFFFF' : '#555'}
            />

            <Text
              style={[
                styles.sidebarText,
                isActive && styles.activeSidebarText,
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search learners..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => handleSearch('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* <View style={styles.topActions}>

  <Pressable
    style={styles.enrollButton}
    onPress={() => navigation.navigate('EnrollLearner')}
  >
    <Text style={styles.enrollButtonText}>
      Enroll Learner
    </Text>
  </Pressable>

  <Pressable
  style={styles.filterButton}
  onPress={() =>
    setFilterOpen(!filterOpen)
  }
>
  <Text style={styles.filterIcon}>
    ⇅
  </Text>
</Pressable>

</View> */}

<View style={styles.topActions}>

  <Pressable
    style={styles.enrollButton}
    onPress={() =>
      navigation.navigate(
        'EnrollLearner'
      )
    }
  >
    <Text style={styles.plusIcon}>
      +
    </Text>

    <Text style={styles.enrollButtonText}>
      Enroll Learner
    </Text>
  </Pressable>

  <Pressable
    style={styles.filterButton}
    onPress={() =>
      setFilterOpen(!filterOpen)
    }
  >
    <Text style={styles.filterIcon}>
      ⇅
    </Text>
  </Pressable>

</View>

{filterOpen && (
  <View style={styles.filterMenu}>

    <Pressable
      style={styles.filterItem}
      onPress={() => {
        const sorted = [
          ...filteredLearners,
        ].sort((a, b) =>
          a.first_name.localeCompare(
            b.first_name
          )
        );

        setFilteredLearners(
          sorted
        );

        setFilterOpen(false);
      }}
    >
      <Text style={styles.filterText}>
        A-Z
      </Text>
    </Pressable>

    <Pressable
      style={styles.filterItem}
      onPress={() => {
        const sorted = [
          ...filteredLearners,
        ].sort((a, b) =>
          b.first_name.localeCompare(
            a.first_name
          )
        );

        setFilteredLearners(
          sorted
        );

        setFilterOpen(false);
      }}
    >
      <Text style={styles.filterText}>
        Z-A
      </Text>
    </Pressable>

    <Pressable
      style={styles.filterItem}
      onPress={() => {
        const sorted = [
          ...filteredLearners,
        ].sort(
          (a, b) => a.age - b.age
        );

        setFilteredLearners(
          sorted
        );

        setFilterOpen(false);
      }}
    >
      <Text style={styles.filterText}>
        Youngest
      </Text>
    </Pressable>

    <Pressable
      style={styles.filterItem}
      onPress={() => {
        const sorted = [
          ...filteredLearners,
        ].sort(
          (a, b) => b.age - a.age
        );

        setFilteredLearners(
          sorted
        );

        setFilterOpen(false);
      }}
    >
      <Text style={styles.filterText}>
        Oldest
      </Text>
    </Pressable>

  </View>
)}
      {isSearching ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#B48BC7" />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      ) : filteredLearners.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
  name={searchQuery ? 'search-outline' : 'school-outline'}
  size={72}
  color="#CBB6D9"
/>

          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No learners found' : 'No learners enrolled yet'}
          </Text>

          <Text style={styles.emptyDescription}>            {searchQuery
              ? 'Try another search term'
              : 'Tap + to enroll your first learner'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLearners}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLearnerCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchLearners} />
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
    marginRight: 12,
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

  // sidebar: {
  //   backgroundColor: '#FFFFFF',
  //   marginHorizontal: 16,
  //   marginTop: 10,
  //   borderRadius: 18,
  //   padding: 18,
  //   shadowColor: '#000',
  //   shadowOpacity: 0.08,
  //   shadowRadius: 6,
  //   elevation: 3,
  // },

  // navItem: {
  //   fontSize: 15,
  //   fontWeight: '700',
  //   color: '#333',
  //   marginBottom: 16,
  // },

  // activeNav: {
  //   color: '#B48BC7',
  // },

  searchContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
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
    fontSize: 15,
    color: '#222',
  },

  clearButton: {
    padding: 6,
  },

  clearButtonText: {
    fontSize: 16,
    color: '#777',
  },

  

  
topActions: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 16,
  marginBottom: 14,
},

enrollButton: {
  flex: 1,
  backgroundColor: '#B48BC7',
  paddingVertical: 14,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
},

plusIcon: {
  color: '#FFF',
  fontSize: 20,
  fontWeight: '800',
  marginRight: 6,
},

enrollButtonText: {
  color: '#FFF',
  fontSize: 15,
  fontWeight: '700',
},

filterButton: {
  width: 50,
  height: 50,
  borderRadius: 14,
  backgroundColor: '#FFF',
  marginLeft: 10,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E4D5E4',
},

filterIcon: {
  fontSize: 18,
  color: '#444',
},

filterMenu: {
  position: 'absolute',
  top: 205,
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

listContent: {
  paddingHorizontal: 16,
  paddingBottom: 30,
  paddingTop: 10,
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

card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  padding: 16,
  marginBottom: 14,
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
},

cardTop: {
  flexDirection: 'row',
  alignItems: 'center',
},

avatar: {
  width: 54,
  height: 54,
  borderRadius: 27,
  backgroundColor: '#F0E4F4',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},

avatarText: {
  fontSize: 18,
  fontWeight: '800',
  color: '#B48BC7',
},

cardInfo: {
  flex: 1,
},

learnerName: {
  fontSize: 17,
  fontWeight: '800',
  color: '#222',
},

learnerDetails: {
  fontSize: 13,
  color: '#666',
  marginTop: 4,
},

infoBox: {
  marginTop: 14,
  backgroundColor: '#F8F3F8',
  borderRadius: 14,
  padding: 12,
},

infoText: {
  fontSize: 13,
  color: '#444',
  marginBottom: 2,
},

cardActions: {
  flexDirection: 'row',
  marginTop: 14,
},

actionButton: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
},

editButton: {
  backgroundColor: '#B48BC7',
  marginRight: 8,
},

deleteButton: {
  backgroundColor: '#F4D7D7',
},

editText: {
  color: '#FFFFFF',
  fontWeight: '700',
  fontSize: 13,
},

deleteText: {
  color: '#9C2C2C',
  fontWeight: '700',
  fontSize: 13,
},

emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 40,
},

overlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.25)',
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

emptyTitle: {
  fontSize: 20,
  fontWeight: '800',
  color: '#222',
  marginTop: 18,
  marginBottom: 8,
},

emptyDescription: {
  fontSize: 14,
  color: '#777',
  textAlign: 'center',
  lineHeight: 22,
  paddingHorizontal: 20,
},

searchingText: {
  marginTop: 12,
  color: '#777',
},
});