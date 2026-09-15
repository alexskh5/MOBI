import type { CommunicationEvidence } from "./sessionOrchestratorService";

function baseEvidence(): CommunicationEvidence {
  return {
    communicationAttempt: false,
    targetAchieved: false,
    accepted: false,
    approximationDetected: false,
    shouldScore: false,
    hasDefinedTarget: false,
    evaluationReliable: true,
    minimumConfidenceUsed: 0,
    transcript: null,
    normalizedTranscript: null,
    matchingMethod: "not_evaluated",
    matchedAnswer: null,
    confidence: null,
    levenshteinDistance: null,
    phoneticMatch: false,
    semanticMatch: false,
  };
}

export function evaluateChoiceResponse(input: {
  selectedChoiceId: string | null;
  expectedChoiceId: string | null;
}): CommunicationEvidence {
  const communicationAttempt = input.selectedChoiceId !== null;
  const hasDefinedTarget = input.expectedChoiceId !== null;
  const targetAchieved =
    communicationAttempt &&
    hasDefinedTarget &&
    input.selectedChoiceId === input.expectedChoiceId;

  return {
    ...baseEvidence(),
    communicationAttempt,
    hasDefinedTarget,
    targetAchieved,
    accepted: targetAchieved,
    shouldScore: communicationAttempt && hasDefinedTarget,
    matchingMethod: targetAchieved ? "choice_match" : "none",
    matchedAnswer: targetAchieved ? input.expectedChoiceId : null,
  };
}

export function evaluateActionResponse(
  actionCompleted: boolean | null,
): CommunicationEvidence {
  const communicationAttempt = actionCompleted !== null;
  const targetAchieved = actionCompleted === true;

  return {
    ...baseEvidence(),
    communicationAttempt,
    hasDefinedTarget: true,
    targetAchieved,
    accepted: targetAchieved,
    shouldScore: actionCompleted !== null,
    matchingMethod:
      actionCompleted !== null ? "action_observed" : "none",
  };
}
