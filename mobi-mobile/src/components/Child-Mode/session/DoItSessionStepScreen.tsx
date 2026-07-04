// MOBI/mobi-mobile/src/components/Child-Mode/session/DoItSessionStepScreen.tsx

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import SessionMediaHolder from './SessionMediaHolder';
import SessionStepHeader from './SessionStepHeader';

import {
  BaseStepProps,
  getPromptText,
} from './SessionTypes';

export default function DoItSessionStepScreen({
  step,
  fallbackImage,
  onReplayPrompt,
}: BaseStepProps) {
  return (
    <View style={styles.wrap}>
      <SessionStepHeader
        promptText={step.instruction || getPromptText(step)}
        helperText="Do the action, then tap the microphone."
        onReplayPrompt={onReplayPrompt}
      />

      <SessionMediaHolder
        media={step.media}
        fallbackImage={fallbackImage}
      />

      {step.materials_needed && step.materials_needed.length > 0 && (
        <View style={styles.materialCard}>
          <Text style={styles.materialTitle}>
            Materials needed
          </Text>

          {step.materials_needed.map((item, index) => (
            <Text
              key={`${item}-${index}`}
              style={styles.materialText}
            >
              • {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 16,
  },

  materialCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 22,

    padding: 16,

    shadowColor: '#7B4BC5',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 3,
  },

  materialTitle: {
    marginBottom: 6,

    fontSize: 12,
    fontWeight: '900',

    color: '#1F1D28',
  },

  materialText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',

    lineHeight: 18,
  },
});
