import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SessionStepHeader from './SessionStepHeader';

import {
  BaseStepProps,
  getPromptText,
} from './SessionTypes';

type Props = BaseStepProps & {
  selectedChoiceId: number | null;
  onSelectChoice: (id: number) => void;
};

export default function ShowChooseSessionStepScreen({
  step,
  selectedChoiceId,
  onSelectChoice,
  onReplayPrompt,
}: Props) {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isSmallPhone = height < 700;

  const choices = step.choices || [];
  const cardWidth = isLandscape ? '31.5%' : choices.length > 2 ? '47%' : '48%';
  const imageHeight = isLandscape
    ? Math.min(height * 0.24, 150)
    : isSmallPhone
    ? 125
    : 165;

  return (
    <View style={styles.wrap}>
      <SessionStepHeader
        promptText={step.question || getPromptText(step)}
        helperText="Listen to the question and tap your answer."
        onReplayPrompt={onReplayPrompt}
        compact={isSmallPhone}
      />

      <View style={styles.choiceGrid}>
        {choices.map((choice, index) => {
          const isSelected = selectedChoiceId === choice.id;

          return (
            <Pressable
              key={choice.id}
              style={[
                styles.choiceCard,
                {
                  width: cardWidth,
                },
                isSelected && styles.selectedChoiceCard,
              ]}
              onPress={() => onSelectChoice(choice.id)}
            >
              <View
                style={[
                  styles.choiceImageWrap,
                  {
                    height: imageHeight,
                  },
                ]}
              >
                {choice.image_url ? (
                  <Image
                    source={{ uri: choice.image_url }}
                    style={styles.choiceImage}
                  />
                ) : (
                  <Ionicons
                    name="image-outline"
                    size={34}
                    color="#A78BFA"
                  />
                )}
              </View>

              <View
                style={[
                  styles.choiceCircle,
                  isSelected && styles.selectedChoiceCircle,
                ]}
              >
                {isSelected && (
                  <View style={styles.innerCircle} />
                )}
              </View>

              <Text style={styles.choiceLabel}>
                Choice {String.fromCharCode(65 + index)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 16,
  },

  choiceGrid: {
    width: '100%',

    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },

  choiceCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 28,

    padding: 12,

    alignItems: 'center',

    borderWidth: 2,
    borderColor: '#FFFFFF',

    shadowColor: '#7B4BC5',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 4,
  },

  selectedChoiceCard: {
    borderColor: '#A78BFA',
    backgroundColor: '#FCFAFF',
  },

  choiceImageWrap: {
    width: '100%',

    borderRadius: 22,

    backgroundColor: '#F7F1FB',

    justifyContent: 'center',
    alignItems: 'center',

    overflow: 'hidden',
  },

  choiceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  choiceCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,

    marginTop: 12,

    borderWidth: 3,
    borderColor: '#D9B9FB',

    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedChoiceCircle: {
    borderColor: '#8759D6',
  },

  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,

    backgroundColor: '#8759D6',
  },

  choiceLabel: {
    marginTop: 8,

    fontSize: 14,
    fontWeight: '900',
    color: '#1F1D28',

    textAlign: 'center',
  },
});
