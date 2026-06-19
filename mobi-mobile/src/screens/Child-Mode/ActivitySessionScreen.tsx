import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ImageBackground,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp, RoutePropType } from '../../types';

const bgImage = require('../../../assets/images/background.jpg');
const cowImage = require('../../../assets/images/cow.jpg');

const waveBars = [18, 28, 36, 24, 42, 56, 48, 64, 74, 52, 45, 34, 26, 18];

export default function ActivitySessionScreen() {
  const navigation = useNavigation<NavigationProp<'ActivitySession'>>();
  const route = useRoute<RoutePropType<'ActivitySession'>>();
  const { activity } = route.params;

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1.35],
  });

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconButton}
            onPress={() => navigation.navigate('ChildDashboard')}
          >
            <Ionicons name="arrow-back" size={23} color="#111" />
          </Pressable>

          <Pressable style={styles.cameraButton}>
            <Ionicons name="videocam" size={23} color="#00BF63" />
          </Pressable>
        </View>

        <Text style={styles.pageTitle}>My words:</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{activity.title}</Text>

          <Text style={styles.infoDescription}>
            {activity.teach_prompt ||
              'Guide Lexi in this activity while the app adjusts to Lexi’s pace.'}
          </Text>
        </View>

        <View style={styles.activityPanel}>
          <Image
            source={
              activity.activity_image_url
                ? { uri: activity.activity_image_url }
                : cowImage
            }
            style={styles.mainImage}
          />

          <Text style={styles.questionText}>
            {activity.ask_prompt || 'What animal is in the picture?...'}
          </Text>

          <View style={styles.waveContainer}>
            {waveBars.map((height, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height,
                    transform: [
                      {
                        scaleY: index % 2 === 0 ? scale : 1,
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>

          <Text style={styles.listenText}>Listening...</Text>

          <Pressable style={styles.micButton}>
            <Ionicons name="mic" size={27} color="#D99AD9" />
          </Pressable>
        </View>
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

  topBar: {
    height: 40,
    paddingHorizontal: 18,
    paddingTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pageTitle: {
    marginLeft: 20,
    marginTop: 2,
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },

  infoCard: {
    width: 252,
    marginLeft: 29,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111',
    marginBottom: 5,
  },

  infoDescription: {
    fontSize: 9,
    color: '#333',
    lineHeight: 12,
  },

  activityPanel: {
    flex: 1,
    marginTop: 31,
    backgroundColor: 'rgba(238, 205, 238, 0.93)',
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    paddingTop: 62,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(190, 160, 190, 0.35)',
  },

  mainImage: {
    width: 262,
    height: 172,
    resizeMode: 'cover',
  },

  questionText: {
    marginTop: 19,
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
  },

  waveContainer: {
    marginTop: 35,
    height: 88,
    width: 230,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  waveBar: {
    width: 3,
    borderRadius: 10,
    backgroundColor: '#B998FF',
    marginHorizontal: 3,
    opacity: 0.75,
  },

  listenText: {
    marginTop: -5,
    fontSize: 11,
    fontWeight: '700',
    color: '#7F6BB2',
  },

  micButton: {
    position: 'absolute',
    right: 14,
    bottom: 15,
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});