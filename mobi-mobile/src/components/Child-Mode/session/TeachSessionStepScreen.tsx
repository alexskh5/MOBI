import React from 'react';
import { StyleSheet, View } from 'react-native';

import SessionMediaHolder from './SessionMediaHolder';
import SessionStepHeader from './SessionStepHeader';

import {
  BaseStepProps,
  getPromptText,
} from './SessionTypes';

export default function TeachSessionStepScreen({
  step,
  fallbackImage,
  onReplayPrompt,
}: BaseStepProps) {
  return (
    <View style={styles.wrap}>
      <SessionStepHeader
        promptText={step.lesson || getPromptText(step)}
        helperText="Look and listen carefully."
        onReplayPrompt={onReplayPrompt}
      />

      <SessionMediaHolder
        media={step.media}
        fallbackImage={fallbackImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 16,
  },
});
