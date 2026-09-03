// mobi-backend/src/services/activity/adaptivePolicyService.ts

import type {
  AdaptiveSupportAction,
} from "./sessionOrchestratorService";

import type {
  AttemptOutcome,
} from "./attemptOutcomeService";

/* =========================================================
   ADAPTIVE POLICY

   PURPOSE

   Convert an AttemptOutcome into the support action that
   MOBI should recommend.

   IMPORTANT

   This is NOT the session orchestrator.

   This file contains only the learner-support policy.

   The session orchestrator decides WHEN policy should be
   consulted.

   This service decides WHAT support should be recommended.
========================================================= */

export interface AdaptivePolicySettings {

  oneMoreTryEnabled:
    boolean;

  allowHint:
    boolean;

  allowRepeatPrompt:
    boolean;
}

export function determineAdaptiveSupportAction(
  outcome: AttemptOutcome,
  settings: AdaptivePolicySettings,
): AdaptiveSupportAction {

  switch (outcome) {

    case "target_achieved":
      return "continue";

    case "target_approximation":

      if (
        settings.oneMoreTryEnabled
      ) {
        return "one_more_try";
      }

      return "continue";

    case "other_communication":

      if (
        settings.allowHint
      ) {
        return "give_hint";
      }

      if (
        settings.oneMoreTryEnabled
      ) {
        return "one_more_try";
      }

      return "continue";

    case "no_communication":

      if (
        settings.allowRepeatPrompt
      ) {
        return "repeat_prompt";
      }

      if (
        settings.oneMoreTryEnabled
      ) {
        return "one_more_try";
      }

      return "continue";

    case "not_evaluable":
      return "continue";

    default:
      return "continue";
  }
}