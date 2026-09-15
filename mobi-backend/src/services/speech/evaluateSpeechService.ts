import { levenshteinDistance } from "./levenshtein";
import { phoneticMatch } from "./phonetic";

export type SpeechMatchingMethod =
  | "exact_match"
  | "accepted_variation"
  | "phrase_contains"
  | "token_match"
  | "levenshtein_approximation"
  | "phonetic_match"
  | "semantic_match"
  | "none";

export interface SpeechEvaluationResult {
  accepted: boolean;
  method: SpeechMatchingMethod;
  matched_word?: string;
  communication_attempt: boolean;
  should_score: boolean;
  approximation?: boolean;
  distance?: number;
  phonetic_match?: boolean;
  semantic_match?: boolean;
}

export interface EvaluateSpeechInput {
  transcript: string;
  expectedAnswers: string[];
  acceptedVariations: string[];
  settings?: {
    levenshteinThreshold?: number;
    phoneticMatchingEnabled?: boolean;
    semanticMatchingEnabled?: boolean;
    acceptedVariationsEnabled?: boolean;
  };
}

export function normalizeSpeechText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/['\u2019]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueNormalized(values: string[]) {
  return Array.from(
    new Set(
      values
        .map(normalizeSpeechText)
        .filter(Boolean),
    ),
  );
}

function getWords(text: string) {
  const normalized = normalizeSpeechText(text);
  return normalized ? normalized.split(" ") : [];
}

function normalizeSimplePlural(word: string) {
  if (word.length > 4 && word.endsWith("ies")) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.length > 3 && word.endsWith("s")) {
    return word.slice(0, -1);
  }

  return word;
}

function isSimplePluralVariant(
  spokenPhrase: string,
  acceptedPhrase: string,
) {
  const spokenWords = getWords(spokenPhrase);
  const acceptedWords = getWords(acceptedPhrase);

  if (
    spokenWords.length === 0 ||
    spokenWords.length !== acceptedWords.length
  ) {
    return false;
  }

  return spokenWords.every(
    (word, index) =>
      normalizeSimplePlural(word) ===
      normalizeSimplePlural(acceptedWords[index]),
  );
}

function containsTokenSequence(
  spokenWords: string[],
  acceptedPhrase: string,
) {
  const acceptedWords = getWords(acceptedPhrase);

  if (
    acceptedWords.length === 0 ||
    acceptedWords.length > spokenWords.length
  ) {
    return false;
  }

  return spokenWords.some((_, startIndex) =>
    acceptedWords.every(
      (word, offset) =>
        spokenWords[startIndex + offset] === word,
    ),
  );
}

const NEGATION_WORDS = new Set([
  "no",
  "not",
  "never",
  "dont",
  "doesnt",
  "didnt",
  "isnt",
  "wasnt",
  "cant",
  "cannot",
  "wont",
]);

const FILLER_WORDS = new Set([
  "a",
  "an",
  "the",
  "i",
  "me",
  "my",
  "you",
  "to",
  "for",
  "can",
  "could",
  "may",
  "want",
  "need",
  "say",
  "please",
  "it",
  "is",
  "am",
]);

const SEMANTIC_WORDS: Record<string, string> = {
  again: "more",
  angry: "mad",
  assist: "help",
  assistance: "help",
  bath: "bathe",
  bathing: "bathe",
  bye: "goodbye",
  crying: "sad",
  cry: "sad",
  finished: "done",
  finish: "done",
  glad: "happy",
  mad: "mad",
  okay: "yes",
  ok: "yes",
  smiling: "happy",
  smile: "happy",
  stop: "done",
  unhappy: "sad",
  yep: "yes",
  yeah: "yes",
};

function getSemanticWords(text: string) {
  return getWords(text)
    .filter((word) => !FILLER_WORDS.has(word))
    .map((word) => SEMANTIC_WORDS[word] ?? word);
}

function canUseContainedTarget(
  spokenWords: string[],
  acceptedPhrase: string,
) {
  const acceptedWords = getWords(acceptedPhrase);

  if (
    acceptedWords.length === 0 ||
    spokenWords.length > acceptedWords.length + 2 ||
    spokenWords.some((word) => NEGATION_WORDS.has(word))
  ) {
    return false;
  }

  return containsTokenSequence(spokenWords, acceptedPhrase);
}

function semanticWordsMatch(
  spokenWords: string[],
  targetWords: string[],
) {
  if (
    spokenWords.length === 0 ||
    targetWords.length === 0
  ) {
    return false;
  }

  if (targetWords.length === 1) {
    return spokenWords.includes(targetWords[0]);
  }

  let nextTargetIndex = 0;

  for (const spokenWord of spokenWords) {
    if (spokenWord === targetWords[nextTargetIndex]) {
      nextTargetIndex += 1;

      if (nextTargetIndex === targetWords.length) {
        return true;
      }
    }
  }

  return false;
}

function canUseSemanticTarget(
  transcript: string,
  acceptedPhrase: string,
) {
  const spokenWords = getWords(transcript);

  if (spokenWords.some((word) => NEGATION_WORDS.has(word))) {
    return false;
  }

  return semanticWordsMatch(
    getSemanticWords(transcript),
    getSemanticWords(acceptedPhrase),
  );
}

export function evaluateSpeech({
  transcript,
  expectedAnswers,
  acceptedVariations,
  settings = {},
}: EvaluateSpeechInput): SpeechEvaluationResult {
  const spoken = normalizeSpeechText(transcript);
  const spokenWords = getWords(transcript);

  const levenshteinThreshold =
    typeof settings.levenshteinThreshold === "number"
      ? Math.max(0, Math.floor(settings.levenshteinThreshold))
      : 2;
  const phoneticMatchingEnabled =
    settings.phoneticMatchingEnabled !== false;
  const semanticMatchingEnabled =
    settings.semanticMatchingEnabled !== false;
  const acceptedVariationsEnabled =
    settings.acceptedVariationsEnabled !== false;

  const expected = uniqueNormalized(expectedAnswers);
  const variations = acceptedVariationsEnabled
    ? uniqueNormalized(acceptedVariations)
    : [];
  const allAccepted = Array.from(
    new Set([...expected, ...variations]),
  );
  const hasDefinedTarget = allAccepted.length > 0;

  if (!spoken) {
    return {
      accepted: false,
      method: "none",
      communication_attempt: false,
      should_score: false,
    };
  }

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

  for (const accepted of allAccepted) {
    if (isSimplePluralVariant(spoken, accepted)) {
      return {
        accepted: true,
        method: "accepted_variation",
        matched_word: accepted,
        communication_attempt: true,
        should_score: true,
      };
    }
  }

  for (const accepted of allAccepted) {
    if (canUseContainedTarget(spokenWords, accepted)) {
      return {
        accepted: true,
        method:
          accepted.includes(" ")
            ? "phrase_contains"
            : "token_match",
        matched_word: accepted,
        communication_attempt: true,
        should_score: true,
      };
    }
  }

  if (semanticMatchingEnabled) {
    for (const accepted of allAccepted) {
      if (canUseSemanticTarget(transcript, accepted)) {
        return {
          accepted: true,
          method: "semantic_match",
          matched_word: accepted,
          communication_attempt: true,
          should_score: true,
          approximation: true,
          semantic_match: true,
        };
      }
    }
  }

  const approximationCandidates = Array.from(
    new Set([spoken, ...spokenWords]),
  );

  for (const candidate of approximationCandidates) {
    for (const answer of expected) {
      const distance = levenshteinDistance(candidate, answer);
      const maximumDistance =
        answer.length <= 3
          ? Math.min(1, levenshteinThreshold)
          : levenshteinThreshold;

      if (distance > 0 && distance <= maximumDistance) {
        return {
          accepted: true,
          method: "levenshtein_approximation",
          distance,
          matched_word: answer,
          communication_attempt: true,
          should_score: true,
          approximation: true,
        };
      }
    }
  }

  if (phoneticMatchingEnabled) {
    for (const word of spokenWords) {
      for (const answer of expected) {
        if (
          word !== answer &&
          word.length >= 2 &&
          answer.length >= 2 &&
          phoneticMatch(word, answer)
        ) {
          return {
            accepted: true,
            method: "phonetic_match",
            matched_word: answer,
            communication_attempt: true,
            should_score: true,
            approximation: true,
            phonetic_match: true,
          };
        }
      }
    }
  }

  return {
    accepted: false,
    method: "none",
    communication_attempt: true,
    should_score: hasDefinedTarget,
  };
}
