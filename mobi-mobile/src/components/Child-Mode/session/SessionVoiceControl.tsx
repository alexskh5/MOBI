import React from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SpeakerStatus } from './SessionTypes';

const waveBars = [
  18, 26, 34, 24, 42, 54, 46,
  62, 72, 52, 42, 34, 26, 18,
];

type Props = {
  speakerStatus: SpeakerStatus;
  scale: Animated.AnimatedInterpolation<string | number>;
  statusText: string;
  onMicPress: () => void;
  learnerResponse?: string;
};

export default function SessionVoiceControl({
  speakerStatus,
  scale,
  statusText,
  onMicPress,
  learnerResponse,
}: Props) {
  return (
    <View style={styles.voiceCard}>
      <Pressable
        style={[
          styles.micButton,
          speakerStatus === 'userSpeaking' && styles.activeMicButton,
        ]}
        onPress={onMicPress}
      >
        <Ionicons
          name={speakerStatus === 'userSpeaking' ? 'stop' : 'mic'}
          size={34}
          color={speakerStatus === 'userSpeaking' ? '#FFFFFF' : '#8759D6'}
        />
      </Pressable>

      <View style={styles.waveContainer}>
        {waveBars.map((height, index) => (
          <Animated.View
            key={`${height}-${index}`}
            style={[
              styles.waveBar,
              {
                height,
                opacity: speakerStatus === 'idle' ? 0.25 : 0.85,
                transform: [
                  {
                    scaleY:
                      speakerStatus === 'idle'
                        ? 0.55
                        : index % 2 === 0
                        ? scale
                        : 1,
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.statusText}>
        {statusText}
      </Text>

      {!!learnerResponse && (
        <View style={styles.responsePill}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={15}
            color="#8759D6"
          />

          <Text style={styles.responseText}>
            {learnerResponse}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  voiceCard: {
    width: '100%',

    backgroundColor: '#FFFFFF',
    borderRadius: 28,

    paddingVertical: 20,
    paddingHorizontal: 18,

    alignItems: 'center',

    shadowColor: '#7B4BC5',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 4,
  },

  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,

    backgroundColor: '#F1E7FF',

    justifyContent: 'center',
    alignItems: 'center',
  },

  activeMicButton: {
    backgroundColor: '#8759D6',
  },

  waveContainer: {
    height: 48,

    marginTop: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  waveBar: {
    width: 4,
    marginHorizontal: 3,

    borderRadius: 10,
    backgroundColor: '#A78BFA',
  },

  statusText: {
    marginTop: 4,

    fontSize: 12,
    fontWeight: '900',
    color: '#6B7280',

    textAlign: 'center',
  },

  responsePill: {
    marginTop: 12,

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 18,

    backgroundColor: '#F1E7FF',

    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  responseText: {
    flex: 1,

    marginLeft: 7,

    fontSize: 12,
    fontWeight: '800',
    color: '#4B3A5A',

    lineHeight: 17,
  },
});
