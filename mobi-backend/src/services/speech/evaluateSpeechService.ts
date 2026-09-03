// mobi-backend/src/services/speech/evaluateSpeechService.ts
import { levenshteinDistance } from "./levenshtein";
import { phoneticMatch } from "./phonetic";

type EvaluateInput = {
  transcript: string;

  expectedAnswers: string[];

  acceptedVariations: string[];

  settings?: {
    levenshteinThreshold?: number;

    phoneticMatchingEnabled?: boolean;

    acceptedVariationsEnabled?: boolean;
  };
};

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(text: string) {
  return normalizeText(text).split(" ").filter(Boolean);
}

export function evaluateSpeech({
  transcript,
  expectedAnswers,
  acceptedVariations,
  settings = {},
}: EvaluateInput) {
  const spoken = normalizeText(transcript);
  const spokenWords = getWords(transcript);

  const levenshteinThreshold =
  typeof settings.levenshteinThreshold === "number"
    ? Math.max(0, settings.levenshteinThreshold)
    : 2;

  const phoneticMatchingEnabled =
    settings.phoneticMatchingEnabled !== false;

  const acceptedVariationsEnabled =
    settings.acceptedVariationsEnabled !== false;

  const expected = expectedAnswers.map(normalizeText);
  const variations =
    acceptedVariationsEnabled
      ? acceptedVariations.map(normalizeText)
      : [];

  const allAccepted = [...expected, ...variations];

  // 1. Exact full phrase match
  for (const answer of expected) {
    if (spoken === answer) {
      return {
        accepted: true,
        method: "exact_match",
        matched_word: answer,
        communication_attempt: true,
        should_score: true,
      };
    }
  }

  // 2. Accepted variation full phrase match
  for (const variation of variations) {
    if (spoken === variation) {
      return {
        accepted: true,
        method: "accepted_variation",
        matched_word: variation,
        communication_attempt: true,
        should_score: true,
      };
    }
  }

  // 3. Phrase contains match
for (const accepted of allAccepted) {
  if (spoken.includes(accepted)) {
    return {
      accepted: true,
      method: "phrase_contains",
      matched_word: accepted,
      communication_attempt: true,
      should_score: true,
    };
  }
}

  // 4. Token match for repeated words like "cow cow cow"
  for (const word of spokenWords) {
    for (const accepted of allAccepted) {
      if (word === accepted) {
        return {
          accepted: true,
          method: "token_match",
          matched_word: accepted,
          communication_attempt: true,
          should_score: true,
        };
      }
    }
  }

  
// 5. Levenshtein approximation
for (const word of spokenWords) {
  for (const answer of expected) {
    const distance =
      levenshteinDistance(
        word,
        answer,
      );

    /*
      Do not automatically mark close pronunciation
      as a fully achieved target.

      A close response is still meaningful evidence
      of a communication attempt.
    */
    const maximumDistance =
      answer.length <= 3
        ? Math.min(
            1,
            levenshteinThreshold,
          )
        : levenshteinThreshold;

    if (
      distance <=
        maximumDistance &&
      distance > 0
    ) {
      return {
        accepted:
          false,

        method:
          "levenshtein_approximation",

        distance,

        matched_word:
          answer,

        communication_attempt:
          true,

        should_score:
          false,

        approximation:
          true,
      };
    }
  }
}

  // 6. Phonetic match
  if (phoneticMatchingEnabled) {
    for (const word of spokenWords) {
      for (const answer of expected) {
        if (phoneticMatch(word, answer)) {
          return {
            accepted: true,
            method: "phonetic_match",
            matched_word: answer,
            communication_attempt: true,
            should_score: true,
          };
        }
      }
    }
  }

  return {
    accepted: false,
    method: "none",
    communication_attempt: spoken.length > 0,
    should_score: false,
  };
}