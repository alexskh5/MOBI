import React from 'react';
import { StyleSheet, View } from 'react-native';

import SessionMediaHolder from './SessionMediaHolder';
import SessionStepHeader from './SessionStepHeader';

import {
  BaseStepProps,
  getPromptText,
} from './SessionTypes';

type Props = BaseStepProps & {
  lastResultCorrect?: boolean | null;
};

export default function FeedbackSessionStepScreen({
  step,
  fallbackImage,
  lastResultCorrect,
  onReplayPrompt,
}: Props) {
  const feedbackText =
    lastResultCorrect === false
      ? step.wrong_feedback || getPromptText(step)
      : step.correct_feedback || getPromptText(step);

  return (
    <View style={styles.wrap}>
      <SessionMediaHolder
        media={step.media}
        fallbackImage={fallbackImage}
        mode="compact"
      />

      <SessionStepHeader
        promptText={feedbackText}
        helperText="Tap replay to hear it again."
        onReplayPrompt={onReplayPrompt}
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
