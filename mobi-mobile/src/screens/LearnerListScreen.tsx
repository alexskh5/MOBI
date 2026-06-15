// mobi-mobile/src/screens/LearnerListScreen.tsx
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Learner, NavigationProp } from '../types';

export default function LearnerListScreen() {
  const navigation = useNavigation<NavigationProp<'LearnerList'>>();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLearners = async () => {
    try {
      const response = await api.get('/learners');
      setLearners(response.data);
    } catch (error) {
      console.error('Fetch learners error:', error);
      Alert.alert('Error', 'Failed to load learners. Check your connection.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLearners();
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
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete learner');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLearners();
  };

  const renderLearnerCard = ({ item }: { item: Learner }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('LearnerDetail', { learner: item })}
    >
      <View style={styles.cardHeader}>
        {item.profile_picture_url ? (
          <Image source={{ uri: item.profile_picture_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.first_name[0]}{item.last_name[0]}
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
      
      <View style={styles.guardianInfo}>
        <Text style={styles.guardianText}>
          👤 Guardian: {item.guardian_first_name} {item.guardian_last_name}
        </Text>
        <Text style={styles.guardianText}>📞 {item.guardian_phone}</Text>
        <Text style={styles.guardianText}>✉️ {item.guardian_email}</Text>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditLearner', { learner: item })}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id, `${item.first_name} ${item.last_name}`)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading learners...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enrolled Learners</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('EnrollLearner')}
        >
          <Text style={styles.addButtonText}>+ Enroll New</Text>
        </Pressable>
      </View>

      {learners.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>No learners enrolled yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button above to enroll your first learner
          </Text>
        </View>
      ) : (
        <FlatList
          data={learners}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLearnerCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5FF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F5FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D1B4E',
  },
  addButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7C3AED20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7C3AED',
  },
  cardInfo: {
    flex: 1,
  },
  learnerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1B4E',
  },
  learnerDetails: {
    fontSize: 14,
    color: '#6B6280',
    marginTop: 4,
  },
  guardianInfo: {
    backgroundColor: '#F8F5FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  guardianText: {
    fontSize: 13,
    color: '#4A3B6E',
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#7C3AED',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D1B4E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B6280',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B6280',
  },
});