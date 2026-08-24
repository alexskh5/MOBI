import type {
  LearnerAdaptiveState,
} from "./learnerStateService";

/* =========================================================
   TYPES
========================================================= */

export type ActivityDeliveryMode =
  | "screen"
  | "guided_off_screen"
  | "mixed";

export type ActivityAttentionDemand =
  | "low"
  | "medium"
  | "high";

export type ActivitySensoryLoad =
  | "low"
  | "medium"
  | "high";

export type ActivityMovementLevel =
  | "none"
  | "light"
  | "active";

export type ActivityInteractionMode =
  | "speech"
  | "choice"
  | "movement"
  | "conversation"
  | "mixed";

export interface ActivityAdaptationPreferences {
  /*
    These are PREFERENCES, not absolute guarantees.

    Later, activitySelectionService can score activities
    against these preferences before Thompson Sampling.
  */

  preferredDeliveryModes:
    ActivityDeliveryMode[];

  preferredAttentionDemand:
    ActivityAttentionDemand[];

  preferredSensoryLoad:
    ActivitySensoryLoad[];

  preferredMovementLevels:
    ActivityMovementLevel[];

  preferredInteractionModes:
    ActivityInteractionMode[];

  /*
    Optional duration preference.

    null means do not apply a duration preference.
  */
  preferredMaximumMinutes:
    number | null;

/*
  Minimum activity-fit score required before an activity
  enters Thompson Sampling.

  null means do not restrict the pool by adaptation score.
*/
minimumNormalizedScore:
  number | null;

  /*
    Whether MOBI should consider suggesting a break
    instead of immediately continuing with another activity.
  */
  suggestBreak:
    boolean;

  /*
    Helpful for logs/debugging and later therapist-facing
    explanations.
  */
  reasons:
    string[];
}

/* =========================================================
   GET ADAPTATION POLICY
========================================================= */

export function getAdaptationPolicy(
  learnerState: LearnerAdaptiveState,
): ActivityAdaptationPreferences {

  /* =======================================================
     LOW ENGAGEMENT

     Prefer:
     - lower attention demand
     - shorter activities
     - some movement
     - mixed or guided off-screen interaction
     - lower sensory load
  ======================================================= */

  if (
    learnerState ===
    "low_engagement"
  ) {
    return {
      preferredDeliveryModes: [
        "guided_off_screen",
        "mixed",
        "screen",
      ],

      preferredAttentionDemand: [
        "low",
        "medium",
      ],

      preferredSensoryLoad: [
        "low",
        "medium",
      ],

      preferredMovementLevels: [
        "light",
        "active",
        "none",
      ],

      preferredInteractionModes: [
        "movement",
        "mixed",
        "choice",
        "speech",
      ],

    preferredMaximumMinutes:
    5,

    minimumNormalizedScore:
    0.7,

    suggestBreak:
    false,

      reasons: [
        "prefer_lower_attention_demand",
        "prefer_shorter_activity",
        "prefer_some_movement",
        "prefer_lower_sensory_load",
      ],
    };
  }

  /* =======================================================
     FATIGUE RISK

     Prefer:
     - short activities
     - low attention demand
     - low sensory load
     - lighter interaction
     - break may be appropriate
  ======================================================= */

  if (
    learnerState ===
    "fatigue_risk"
  ) {
    return {
      preferredDeliveryModes: [
        "mixed",
        "guided_off_screen",
        "screen",
      ],

      preferredAttentionDemand: [
        "low",
        "medium",
      ],

      preferredSensoryLoad: [
        "low",
        "medium",
      ],

      preferredMovementLevels: [
        "light",
        "none",
      ],

      preferredInteractionModes: [
        "choice",
        "movement",
        "mixed",
        "speech",
      ],

      preferredMaximumMinutes:
        3,

    minimumNormalizedScore:
        0.65,

      suggestBreak:
        true,

      reasons: [
        "prefer_short_activity",
        "prefer_lower_attention_demand",
        "prefer_lower_sensory_load",
        "break_may_be_appropriate",
      ],
    };
  }

  /* =======================================================
     FRUSTRATION RISK

     Prefer:
     - lower demand
     - lower sensory load
     - familiar/simple interaction modes
     - avoid escalating task complexity
  ======================================================= */

  if (
    learnerState ===
    "frustration_risk"
  ) {
    return {
      preferredDeliveryModes: [
        "screen",
        "mixed",
        "guided_off_screen",
      ],

      preferredAttentionDemand: [
        "low",
        "medium",
      ],

      preferredSensoryLoad: [
        "low",
        "medium",
      ],

      preferredMovementLevels: [
        "none",
        "light",
      ],

      preferredInteractionModes: [
        "choice",
        "speech",
        "mixed",
        "movement",
      ],

      preferredMaximumMinutes:
        5,

    minimumNormalizedScore:
  0.65,

      suggestBreak:
        true,

      reasons: [
        "avoid_high_task_demand",
        "prefer_lower_sensory_load",
        "prefer_simple_interaction",
        "avoid_automatic_difficulty_increase",
      ],
    };
  }

  /* =======================================================
     ENGAGED

     Normal activity pool.

     We intentionally keep all values available.

     Thompson Sampling should be free to learn which activity
     performs best for this learner when no adaptation
     threshold is currently exceeded.
  ======================================================= */

  if (
    learnerState ===
    "engaged"
  ) {
    return {
      preferredDeliveryModes: [
        "screen",
        "mixed",
        "guided_off_screen",
      ],

      preferredAttentionDemand: [
        "low",
        "medium",
        "high",
      ],

      preferredSensoryLoad: [
        "low",
        "medium",
        "high",
      ],

      preferredMovementLevels: [
        "none",
        "light",
        "active",
      ],

      preferredInteractionModes: [
        "speech",
        "choice",
        "movement",
        "conversation",
        "mixed",
      ],

      preferredMaximumMinutes:
        null,

      minimumNormalizedScore:
        null,

      suggestBreak:
        false,

      reasons: [
        "normal_adaptive_selection",
      ],
    };
  }

  /* =======================================================
     UNKNOWN

     MOBI does not have enough evidence to infer the learner's
     current adaptive state.

     Therefore, do not aggressively filter the activity pool.
  ======================================================= */

  return {
    preferredDeliveryModes: [
      "screen",
      "mixed",
      "guided_off_screen",
    ],

    preferredAttentionDemand: [
      "low",
      "medium",
      "high",
    ],

    preferredSensoryLoad: [
      "low",
      "medium",
      "high",
    ],

    preferredMovementLevels: [
      "none",
      "light",
      "active",
    ],

    preferredInteractionModes: [
      "speech",
      "choice",
      "movement",
      "conversation",
      "mixed",
    ],

    preferredMaximumMinutes:
      null,

    minimumNormalizedScore:
        null,

    suggestBreak:
      false,

    reasons: [
      "insufficient_state_evidence_use_normal_pool",
    ],
  };
}