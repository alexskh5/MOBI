// mobi-backend/src/services/speech/communicationEvaluationService.ts

import {
  evaluateSpeech,
} from "./evaluateSpeechService";

import type {
  CommunicationEvidence,
} from "../activity/sessionOrchestratorService";

/* =========================================================
   TYPES
========================================================= */

export interface EvaluateCommunicationInput {
  transcript: string;

  expectedAnswers:
    string[];

  acceptedVariations:
    string[];
}

/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(
  text: string,
) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   EVALUATE COMMUNICATION

   IMPORTANT:

   This service does NOT require perfect pronunciation.

   It uses the existing speech matching engine and converts
   the result into CommunicationEvidence that the adaptive
   session engine understands.
========================================================= */

export function evaluateCommunication(
  input: EvaluateCommunicationInput,
): CommunicationEvidence {

  const {
    transcript,
    expectedAnswers,
    acceptedVariations,
  } = input;

  const normalizedTranscript =
    normalizeText(
      transcript,
    );

  const evaluation =
    evaluateSpeech({
      transcript,

      expectedAnswers,

      acceptedVariations,
    });

  /*
    A learner can make a meaningful communication attempt
    without perfectly achieving the target.

    The existing speech evaluator already identifies
    communication_attempt separately from accepted.
  */

  const communicationAttempt =
    evaluation.communication_attempt ===
    true;

  const accepted =
    evaluation.accepted ===
    true;

  /*
    For this first integration:

    accepted = target achieved

    Later we can make this more detailed, for example:

    exact / accepted variation
      → full target achievement

    phonetic approximation
      → meaningful approximation

    semantic alternative
      → accepted semantic response

    without changing the Activity Runtime contract.
  */
  const targetAchieved =
    accepted;

  /*
    Confidence is intentionally left null for now.

    We should not invent confidence values for Soundex,
    Levenshtein, or exact matching.

    Later we can derive or store method-specific confidence
    separately when we have a defensible scoring rule.
  */

const approximationDetected =
  "approximation" in evaluation &&
  evaluation.approximation === true;


  return {
    communicationAttempt,

    targetAchieved,

    accepted,

    approximationDetected,


    transcript:
      transcript.trim().length > 0
        ? transcript
        : null,

    normalizedTranscript:
      normalizedTranscript.length > 0
        ? normalizedTranscript
        : null,

    matchingMethod:
      evaluation.method ??
      null,

    matchedAnswer:
      evaluation.matched_word ??
      null,

    confidence:
      null,
  };
}