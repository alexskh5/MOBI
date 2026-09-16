import {
  evaluateSpeech,
  normalizeSpeechText,
} from "./evaluateSpeechService";

import type {
  CommunicationEvidence,
} from "../activity/sessionOrchestratorService";

export interface EvaluateCommunicationInput {
  transcript: string;
  expectedAnswers: string[];
  acceptedVariations: string[];
  sttConfidence?: number | null;
  settings?: {
    minimumConfidence?: number;
    levenshteinThreshold?: number;
    phoneticMatchingEnabled?: boolean;
    semanticMatchingEnabled?: boolean;
    acceptedVariationsEnabled?: boolean;
  };
}

export function evaluateCommunication(
  input: EvaluateCommunicationInput,
): CommunicationEvidence {
  const {
    transcript,
    expectedAnswers,
    acceptedVariations,
    sttConfidence = null,
    settings,
  } = input;

  const normalizedTranscript = normalizeSpeechText(transcript);
  const acceptedVariationsEnabled =
    settings?.acceptedVariationsEnabled !== false;
  const normalizedTargets = [
    ...expectedAnswers,
    ...(acceptedVariationsEnabled ? acceptedVariations : []),
  ]
    .map(normalizeSpeechText)
    .filter(Boolean);
  const hasDefinedTarget = normalizedTargets.length > 0;

  const minimumConfidence =
    typeof settings?.minimumConfidence === "number"
      ? Math.min(1, Math.max(0, settings.minimumConfidence))
      : 0.7;
  const normalizedConfidence =
    typeof sttConfidence === "number" &&
    Number.isFinite(sttConfidence)
      ? Math.min(1, Math.max(0, sttConfidence))
      : null;
  const evaluationReliable =
    normalizedConfidence === null ||
    normalizedConfidence >= minimumConfidence;

  const evaluation = evaluateSpeech({
    transcript,
    expectedAnswers,
    acceptedVariations,
    settings,
  });

  const communicationAttempt =
    evaluation.communication_attempt === true;
  const accepted =
    evaluationReliable && evaluation.accepted === true;
  const targetAchieved = accepted;
  const approximationDetected =
    evaluationReliable && evaluation.approximation === true;
  const shouldScore =
    evaluationReliable && evaluation.should_score === true;

  return {
    communicationAttempt,
    targetAchieved,
    accepted,
    approximationDetected,
    shouldScore,
    hasDefinedTarget,
    evaluationReliable,
    minimumConfidenceUsed: minimumConfidence,
    transcript: transcript.trim() ? transcript : null,
    normalizedTranscript: normalizedTranscript || null,
    matchingMethod: evaluation.method,
    matchedAnswer: evaluation.matched_word ?? null,
    confidence: normalizedConfidence,
    levenshteinDistance: evaluation.distance ?? null,
    phoneticMatch: evaluation.phonetic_match === true,
    semanticMatch: evaluation.semantic_match === true,
  };
}
