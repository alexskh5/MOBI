// // mobi-mobile/App.tsx
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';

// // Import screens
// import DashboardScreen from './src/screens/DashboardScreen';
// import MaterialsScreen from './src/screens/MaterialsScreen';
// import NotificationsScreen from './src/screens/NotificationsScreen';
// import CollaborationScreen from './src/screens/CollaborationScreen';
// import ScheduleScreen from './src/screens/ScheduleScreen';
// import LearnerDetailScreen from './src/screens/LearnerDetailScreen';
// import EditLearnerScreen from './src/screens/EditLearnerScreen';
// import ActivityDetailScreen from './src/screens/ActivityDetailScreen';
// import EditActivityScreen from './src/screens/EditActivityScreen';
// import CreateActivityScreen from './src/screens/CreateActivityScreen';
// import { RootStackParamList, MainTabParamList } from './src/types';

// const Stack = createNativeStackNavigator<RootStackParamList>();
// const Tab = createBottomTabNavigator<MainTabParamList>();

// function MainTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';
          
//           if (route.name === 'Dashboard') {
//             iconName = focused ? 'grid' : 'grid-outline';
//           } else if (route.name === 'Materials') {
//             iconName = focused ? 'book' : 'book-outline';
//           } else if (route.name === 'Notifications') {
//             iconName = focused ? 'notifications' : 'notifications-outline';
//           } else if (route.name === 'Collaboration') {
//             iconName = focused ? 'people' : 'people-outline';
//           } else if (route.name === 'Schedule') {
//             iconName = focused ? 'calendar' : 'calendar-outline';
//           }
          
//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#7C3AED',
//         tabBarInactiveTintColor: 'gray',
//         headerShown: false,
//       })}
//     >
//       <Tab.Screen name="Dashboard" component={DashboardScreen} />
//       <Tab.Screen name="Materials" component={MaterialsScreen} />
//       <Tab.Screen name="Notifications" component={NotificationsScreen} />
//       <Tab.Screen name="Collaboration" component={CollaborationScreen} />
//       <Tab.Screen name="Schedule" component={ScheduleScreen} />
//     </Tab.Navigator>
//   );
// }

// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <NavigationContainer>
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="Main" component={MainTabs} />
//           <Stack.Screen name="LearnerDetail" component={LearnerDetailScreen} />
//           <Stack.Screen name="EditLearner" component={EditLearnerScreen} />
//           <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
//           <Stack.Screen name="EditActivity" component={EditActivityScreen} />
//           <Stack.Screen name="CreateActivity" component={CreateActivityScreen} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </SafeAreaProvider>
//   );
// }



// mobi-mobile/App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './src/screens/DashboardScreen';
import MaterialsScreen from './src/screens/MaterialsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CollaborationScreen from './src/screens/CollaborationScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';

import LearnerDetailScreen from './src/screens/LearnerDetailScreen';
import EditLearnerScreen from './src/screens/EditLearnerScreen';
import EnrollLearnerScreen from './src/screens/EnrollLearnerScreen';

import ActivityDetailScreen from './src/screens/ActivityDetailScreen';
import EditActivityScreen from './src/screens/EditActivityScreen';
import CreateActivityScreen from './src/screens/CreateActivityScreen';

import CenterProfileScreen from './src/screens/CenterProfileScreen';

import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Materials" component={MaterialsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Collaboration" component={CollaborationScreen} />
          <Stack.Screen name="Schedule" component={ScheduleScreen} />

          <Stack.Screen
            name="EnrollLearner"
            component={EnrollLearnerScreen}
          />

          <Stack.Screen
            name="LearnerDetail"
            component={LearnerDetailScreen}
          />

          <Stack.Screen
            name="EditLearner"
            component={EditLearnerScreen}
          />

          <Stack.Screen
            name="ActivityDetail"
            component={ActivityDetailScreen}
          />

          <Stack.Screen
            name="EditActivity"
            component={EditActivityScreen}
          />

          <Stack.Screen
            name="CreateActivity"
            component={CreateActivityScreen}
          />

          <Stack.Screen
            name="CenterProfile"
            component={CenterProfileScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}