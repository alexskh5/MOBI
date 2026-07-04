// MOBI/mobi-mobile/src/components/Child-Mode/session/SessionStepHeader.tsx


import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  promptText: string;
  helperText?: string;
  onReplayPrompt: () => void;
  compact?: boolean;
};

export default function SessionStepHeader({
  promptText,
  helperText,
  onReplayPrompt,
  compact = false,
}: Props) {
  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <Pressable
        style={styles.soundButton}
        onPress={onReplayPrompt}
      >
        <Ionicons
          name="volume-high"
          size={compact ? 20 : 24}
          color="#8759D6"
        />
      </Pressable>

      <Text
        style={[
          styles.promptText,
          compact && styles.compactPromptText,
        ]}
      >
        {promptText}
      </Text>

      {!!helperText && (
        <Text
          style={[
            styles.helperText,
            compact && styles.compactHelperText,
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',

    backgroundColor: '#FFFFFF',
    borderRadius: 28,

    paddingVertical: 24,
    paddingHorizontal: 20,

    alignItems: 'center',

    shadowColor: '#7B4BC5',
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 4,
  },

  compactCard: {
    paddingVertical: 18,
    borderRadius: 24,
  },

  soundButton: {
    width: 54,
    height: 54,
    borderRadius: 27,

    backgroundColor: '#F1E7FF',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 12,
  },

  promptText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F1D28',

    textAlign: 'center',
    lineHeight: 30,
  },

  compactPromptText: {
    fontSize: 19,
    lineHeight: 25,
  },

  helperText: {
    marginTop: 8,

    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',

    textAlign: 'center',
    lineHeight: 18,
  },

  compactHelperText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
