import React from 'react';
import { StyleSheet, View } from 'react-native';

import SessionMediaHolder from './SessionMediaHolder';
import SessionStepHeader from './SessionStepHeader';

import {
  BaseStepProps,
  getPromptText,
} from './SessionTypes';

export default function ConversationSessionStepScreen({
  step,
  fallbackImage,
  onReplayPrompt,
}: BaseStepProps) {
  const promptText =
    step.topics && step.topics.length > 0
      ? step.topics[0]
      : getPromptText(step);

  return (
    <View style={styles.wrap}>
      <SessionStepHeader
        promptText={promptText}
        helperText="Tell MOBI what you know."
        onReplayPrompt={onReplayPrompt}
      />

      <SessionMediaHolder
        media={step.media}
        fallbackImage={fallbackImage}
        mode="compact"
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
