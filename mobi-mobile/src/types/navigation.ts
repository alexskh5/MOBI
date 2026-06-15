// src/types/navigation.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Learner } from './index'; // Changed from './types' to './index'

// Define all screens and their parameters
export type RootStackParamList = {
  LearnerList: undefined;
  EnrollLearner: undefined;
  LearnerDetail: { learner: Learner };
  EditLearner: { learner: Learner };
  LearnerActivity: undefined;
};

// Navigation prop type for each screen
export type LearnerListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LearnerList'
>;

export type EnrollLearnerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EnrollLearner'
>;

export type LearnerDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LearnerDetail'
>;

export type EditLearnerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditLearner'
>;

export type LearnerActivityScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LearnerActivity'
>;

// Route prop types for screens that receive parameters
export type LearnerDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'LearnerDetail'
>;

export type EditLearnerScreenRouteProp = RouteProp<
  RootStackParamList,
  'EditLearner'
>;