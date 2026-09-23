import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateCommunication,
} from "../services/speech/communicationEvaluationService";
import {
  evaluateSpeech,
  normalizeSpeechText,
} from "../services/speech/evaluateSpeechService";
import {
  evaluateActionResponse,
  evaluateChoiceResponse,
} from "../services/activity/structuredResponseEvaluationService";
import {
  determineAttemptOutcome,
} from "../services/activity/attemptOutcomeService";
import {
  determineAdaptiveSupportAction,
} from "../services/activity/adaptivePolicyService";
import {
  getAdaptationPolicy,
} from "../services/activity/adaptationPolicyService";
import {
  createInitialSessionContext,
  decideAdaptiveAction,
  type CommunicationEvidence,
  type SessionOrchestratorContext,
} from "../services/activity/sessionOrchestratorService";
import {
  summarizeAttempts,
} from "../services/activity/attemptAggregationService";
import {
  calculateActivityMastery,
} from "../services/activity/masteryService";
import {
  evaluateLearnerState,
} from "../services/activity/learnerStateService";
import {
  calculateProgressionEvidence,
  getNextSpeechLadderLevel,
  normalizeSpeechLadderLevel,
} from "../services/activity/progressionRulesService";
import {
  getCenterDateRange,
  getUtcStartOfCenterDay,
} from "../services/time/centerTimeService";
import {
  areInteractiveStepsResolved,
  getNextInteractiveStep,
} from "../services/activity/activityStepFlowService";

function communication(
  overrides: Partial<CommunicationEvidence> = {},
): CommunicationEvidence {
  return {
    communicationAttempt: false,
    targetAchieved: false,
    accepted: false,
    approximationDetected: false,
    transcript: null,
    normalizedTranscript: null,
    matchingMethod: "none",
    matchedAnswer: null,
    confidence: null,
    shouldScore: false,
    hasDefinedTarget: true,
    evaluationReliable: true,
    minimumConfidenceUsed: 0.7,
    levenshteinDistance: null,
    phoneticMatch: false,
    semanticMatch: false,
    ...overrides,
  };
}

function runningContext(): SessionOrchestratorContext {
  return {
    ...createInitialSessionContext({
      learningSessionId: "learning-session",
      learnerId: "learner",
      centerId: "center",
    }),
    state: "waiting_for_response",
    currentActivity: {
      activityId: "activity",
      activityTitle: "Requesting",
      deliveryMode: "screen",
      allowSkip: true,
      maxAttempts: 3,
      estimatedMinutes: 5,
      speechLadderLevel: "word",
      difficultyLevel: null,
    },
  };
}

function responseInput(overrides: Record<string, unknown> = {}) {
  return {
    communication: communication(),
    engagement: {
      gazeDetectionAvailable: false,
      gazePresent: null,
      gazeAwaySeconds: 0,
      inactivitySeconds: 0,
      responseTimeMs: null,
    },
    reachedMaximumAttempts: false,
    activityCompleted: false,
    therapistRequestedStop: false,
    parentRequestedStop: false,
    screenTimeLimitReached: false,
    adaptiveSettings: {
      inactivityBreakSeconds: 600,
      inactivityAutoStopSeconds: 900,
      oneMoreTryEnabled: true,
      allowBreakSuggestion: true,
      allowHint: true,
      allowRepeatPrompt: true,
    },
    ...overrides,
  };
}

test("speech normalization preserves Unicode letters and removes punctuation", () => {
  assert.equal(normalizeSpeechText("  Kumusta, Ána!  "), "kumusta ána");
});

test("speech evaluation distinguishes targets, variations, and silence", () => {
  assert.deepEqual(
    evaluateSpeech({
      transcript: "",
      expectedAnswers: ["apple"],
      acceptedVariations: [],
    }),
    {
      accepted: false,
      method: "none",
      communication_attempt: false,
      should_score: false,
    },
  );

  assert.equal(
    evaluateSpeech({
      transcript: "Apple!",
      expectedAnswers: ["apple"],
      acceptedVariations: [],
    }).method,
    "exact_match",
  );

  assert.equal(
    evaluateSpeech({
      transcript: "yeah",
      expectedAnswers: ["yes"],
      acceptedVariations: ["yeah"],
    }).method,
    "accepted_variation",
  );
});

test("speech evaluation accepts simple singular and plural variants", () => {
  const result = evaluateSpeech({
    transcript: "More bubble, please.",
    expectedAnswers: [
      "more bubbles please",
      "more bubbles",
      "bubbles please",
    ],
    acceptedVariations: [
      "i want more bubbles",
      "more please",
    ],
  });

  assert.equal(result.accepted, true);
  assert.equal(result.should_score, true);
  assert.equal(result.method, "accepted_variation");
});

test("contained targets require word boundaries and reject common negation", () => {
  const contained = evaluateSpeech({
    transcript: "red apple",
    expectedAnswers: ["apple"],
    acceptedVariations: [],
  });
  const embedded = evaluateSpeech({
    transcript: "pineapple",
    expectedAnswers: ["apple"],
    acceptedVariations: [],
    settings: { levenshteinThreshold: 0 },
  });
  const negated = evaluateSpeech({
    transcript: "not apple",
    expectedAnswers: ["apple"],
    acceptedVariations: [],
  });
  const contractedNegation = evaluateSpeech({
    transcript: "don't apple",
    expectedAnswers: ["apple"],
    acceptedVariations: [],
  });

  assert.equal(contained.accepted, true);
  assert.equal(contained.method, "token_match");
  assert.equal(embedded.accepted, false);
  assert.equal(negated.accepted, false);
  assert.equal(negated.approximation, undefined);
  assert.equal(negated.should_score, true);
  assert.equal(contractedNegation.accepted, false);
  assert.equal(contractedNegation.approximation, undefined);
});

test("close and sound-alike child speech is accepted while still flagged as approximate", () => {
  const pronunciationApproximation = evaluateSpeech({
    transcript: "ba",
    expectedAnswers: ["ball"],
    acceptedVariations: [],
  });
  const phoneticApproximation = evaluateSpeech({
    transcript: "fone",
    expectedAnswers: ["phone"],
    acceptedVariations: [],
    settings: { levenshteinThreshold: 0 },
  });

  assert.equal(pronunciationApproximation.communication_attempt, true);
  assert.equal(pronunciationApproximation.approximation, true);
  assert.equal(pronunciationApproximation.accepted, true);
  assert.equal(pronunciationApproximation.should_score, true);
  assert.equal(phoneticApproximation.method, "phonetic_match");
  assert.equal(phoneticApproximation.accepted, true);
  assert.equal(phoneticApproximation.should_score, true);
});

test("semantic child speech matches common intent words", () => {
  const help = evaluateSpeech({
    transcript: "Can you help me?",
    expectedAnswers: ["help"],
    acceptedVariations: [],
  });

  const emotion = evaluateSpeech({
    transcript: "smiling face",
    expectedAnswers: ["happy face"],
    acceptedVariations: [],
  });

  assert.equal(help.accepted, true);
  assert.equal(help.method, "semantic_match");
  assert.equal(help.semantic_match, true);
  assert.equal(emotion.accepted, true);
  assert.equal(emotion.method, "semantic_match");
});

test("low-confidence speech is preserved but not scored", () => {
  const result = evaluateCommunication({
    transcript: "apple",
    expectedAnswers: ["apple"],
    acceptedVariations: [],
    sttConfidence: 0.4,
    settings: { minimumConfidence: 0.7 },
  });

  assert.equal(result.communicationAttempt, true);
  assert.equal(result.evaluationReliable, false);
  assert.equal(result.accepted, false);
  assert.equal(result.shouldScore, false);
});

test("disabled variations do not create a target by themselves", () => {
  const result = evaluateCommunication({
    transcript: "yeah",
    expectedAnswers: [],
    acceptedVariations: ["yeah"],
    settings: { acceptedVariationsEnabled: false },
  });

  assert.equal(result.hasDefinedTarget, false);
  assert.equal(result.communicationAttempt, true);
  assert.equal(result.shouldScore, false);
});

test("structured responses preserve wrong choices and incomplete actions", () => {
  const choice = evaluateChoiceResponse({
    selectedChoiceId: "choice-b",
    expectedChoiceId: "choice-a",
  });
  const action = evaluateActionResponse(false);

  assert.equal(choice.communicationAttempt, true);
  assert.equal(choice.shouldScore, true);
  assert.equal(choice.targetAchieved, false);
  assert.equal(action.communicationAttempt, true);
  assert.equal(action.shouldScore, true);
  assert.equal(action.targetAchieved, false);
  assert.equal(action.matchingMethod, "action_observed");
});

test("attempt outcomes and policy distinguish approximation from silence", () => {
  const approximation = determineAttemptOutcome({
    communication: communication({
      communicationAttempt: true,
      approximationDetected: true,
    }),
    hasDefinedTarget: true,
  });
  const silence = determineAttemptOutcome({
    communication: communication(),
    hasDefinedTarget: true,
  });

  assert.equal(approximation, "target_approximation");
  assert.equal(silence, "no_communication");
  assert.equal(
    determineAdaptiveSupportAction(approximation, {
      oneMoreTryEnabled: true,
      allowHint: true,
      allowRepeatPrompt: true,
    }),
    "one_more_try",
  );
  assert.equal(
    determineAdaptiveSupportAction(silence, {
      oneMoreTryEnabled: true,
      allowHint: true,
      allowRepeatPrompt: true,
    }),
    "repeat_prompt",
  );
});

test("session safety events override completion and adaptive support", () => {
  const context = runningContext();
  const adultStop = decideAdaptiveAction(
    context,
    responseInput({
      parentRequestedStop: true,
      activityCompleted: true,
      screenTimeLimitReached: true,
    }),
  );
  const screenLimit = decideAdaptiveAction(
    context,
    responseInput({
      screenTimeLimitReached: true,
      activityCompleted: true,
    }),
  );
  const autoStop = decideAdaptiveAction(
    context,
    responseInput({
      engagement: {
        gazeDetectionAvailable: false,
        gazePresent: null,
        gazeAwaySeconds: 0,
        inactivitySeconds: 900,
        responseTimeMs: null,
      },
    }),
  );
  const breakBeforeNextActivity = decideAdaptiveAction(
    context,
    responseInput({
      activityCompleted: true,
      engagement: {
        gazeDetectionAvailable: false,
        gazePresent: null,
        gazeAwaySeconds: 0,
        inactivitySeconds: 600,
        responseTimeMs: null,
      },
    }),
  );

  assert.equal(adultStop.reason, "Adult requested to end the learning session.");
  assert.equal(screenLimit.nextState, "auto_stopped");
  assert.equal(autoStop.action, "end_session");
  assert.equal(breakBeforeNextActivity.action, "suggest_break");
  assert.equal(getAdaptationPolicy("fatigue_risk").suggestBreak, true);
});

test("unavailable gaze detection never creates low-engagement evidence", () => {
  const state = evaluateLearnerState({
    gazeDetectionAvailable: false,
    gazeAwaySeconds: 1_000,
    inactivitySeconds: 0,
  });

  assert.equal(state.state, "unknown");
});

test("attempt aggregation and mastery ignore unscored evidence", () => {
  const attempts = [
    { should_score: true, is_correct: true, communication_attempt: true },
    { should_score: false, is_correct: null, communication_attempt: true },
    { should_score: true, is_correct: true, communication_attempt: true },
    { should_score: true, is_correct: false, communication_attempt: true },
  ];
  const aggregate = summarizeAttempts(attempts);
  const mastery = calculateActivityMastery({
    attempts,
    attemptsWindow: 3,
    requiredSuccessCount: 2,
    requiredSuccessPercentage: 60,
    requiredConsecutiveSuccesses: 2,
    sessionCompleted: true,
  });

  assert.equal(aggregate.totalScoredAttempts, 3);
  assert.equal(aggregate.unscoredAttempts, 1);
  assert.equal(aggregate.successRate, 66.67);
  assert.equal(mastery.masteryWindowAttempts, 3);
  assert.equal(mastery.masteryWindowConsecutiveSuccesses, 2);
  assert.equal(mastery.activityMastered, true);
});

test("interactive steps remain backend-ordered until resolved", () => {
  const steps = [
    { id: "teach", step_order: 1, step_type: "teach" },
    { id: "ask-one", step_order: 2, step_type: "ask" },
    { id: "feedback", step_order: 3, step_type: "feedback" },
    { id: "ask-two", step_order: 4, step_type: "ask" },
  ];
  const unresolvedAttempts = [
    {
      activity_step_id: "ask-one",
      expected_answers: ["ball"],
      communication_attempt: true,
      target_achieved: false,
    },
  ];
  const resolvedAttempts = [
    ...unresolvedAttempts,
    ...unresolvedAttempts,
    ...unresolvedAttempts,
    {
      activity_step_id: "ask-two",
      expected_answers: [],
      communication_attempt: true,
      target_achieved: false,
    },
  ];

  assert.equal(
    getNextInteractiveStep(steps, unresolvedAttempts, 3)?.id,
    "ask-one",
  );
  assert.equal(
    getNextInteractiveStep(
      steps,
      [{ activity_step_id: "ask-one", was_skipped: true }],
      3,
    )?.id,
    "ask-two",
  );
  assert.equal(
    getNextInteractiveStep(steps, unresolvedAttempts.concat(
      unresolvedAttempts,
      unresolvedAttempts,
    ), 3)?.id,
    "ask-two",
  );
  assert.equal(
    areInteractiveStepsResolved(steps, resolvedAttempts, 3),
    true,
  );
});

test("progression uses only the latest result for each distinct activity", () => {
  const evidence = calculateProgressionEvidence(
    [
      {
        activityId: "activity-a",
        successRate: 100,
        mastered: true,
        completedAt: "2026-09-01T00:00:00.000Z",
      },
      {
        activityId: "activity-a",
        successRate: 40,
        mastered: false,
        completedAt: "2026-09-02T00:00:00.000Z",
      },
      {
        activityId: "activity-b",
        successRate: 90,
        mastered: true,
        completedAt: "2026-09-03T00:00:00.000Z",
      },
    ],
    2,
    80,
  );

  assert.equal(evidence.activitiesMastered, 1);
  assert.equal(evidence.averageSuccessRate, 90);
  assert.equal(evidence.eligible, false);
  assert.equal(normalizeSpeechLadderLevel("Social-Readiness"), "sentence");
  assert.equal(getNextSpeechLadderLevel("word"), "phrase");
  assert.equal(getNextSpeechLadderLevel("sentence"), null);
});

test("center calendar ranges use the configured fixed offset", () => {
  assert.deepEqual(
    getCenterDateRange("day", "2026-09-08", new Date(), 480),
    {
      start: "2026-09-07T16:00:00.000Z",
      end: "2026-09-08T15:59:59.999Z",
    },
  );
  assert.deepEqual(
    getCenterDateRange("week", "2026-09-08", new Date(), 480),
    {
      start: "2026-09-06T16:00:00.000Z",
      end: "2026-09-13T15:59:59.999Z",
    },
  );
  assert.equal(
    getUtcStartOfCenterDay(
      new Date("2026-09-08T17:00:00.000Z"),
      480,
    ).toISOString(),
    "2026-09-08T16:00:00.000Z",
  );
  assert.throws(
    () => getCenterDateRange("day", "2026-02-31", new Date(), 480),
    /Invalid progress anchor date/,
  );
});
