import type {
  ActivityAdaptationPreferences,
  ActivityAttentionDemand,
  ActivityDeliveryMode,
  ActivityInteractionMode,
  ActivityMovementLevel,
  ActivitySensoryLoad,
} from "./adaptationPolicyService";

import type {
  LearnerPreferenceProfile,
} from "./learnerPreferenceService";

/* =========================================================
   TYPES
========================================================= */

export interface AdaptationScoringActivity {
  id: string;

  delivery_mode:
    | ActivityDeliveryMode
    | string
    | null;

  attention_demand:
    | ActivityAttentionDemand
    | string
    | null;

  sensory_load:
    | ActivitySensoryLoad
    | string
    | null;

  movement_level:
    | ActivityMovementLevel
    | string
    | null;

  interaction_mode:
    | ActivityInteractionMode
    | string
    | null;

  topic_tags:
    string[];

  visual_support_level:
    string | null;

  communication_mode:
    string | null;

  assistance_level:
    string | null;

  sensory_features:
    string[];

  estimated_minutes:
    | number
    | null;
}

export interface ActivityAdaptationScore {
  activityId: string;

  score: number;

  maximumPossibleScore: number;

  normalizedScore: number;

  matchedPreferences: string[];

  unmatchedPreferences: string[];
}

export interface ActivityPreferenceScore {
  activityId: string;

  score: number;

  maximumPossibleScore: number;

  normalizedScore: number;

  matchedPreferences: string[];

  cautions: string[];
}

/* =========================================================
   HELPER:
   PREFERENCE POSITION SCORE

   The policy arrays are intentionally ordered.

   Example:

   preferredAttentionDemand:
   ["low", "medium"]

   "low" is more preferred than "medium".

   This helper gives:

   first preference  = 2 points
   later preference  = 1 point
   not preferred     = 0 points
========================================================= */

function scoreOrderedPreference(
  value: string | null,
  preferredValues: string[],
) {
  if (!value) {
    return 0;
  }

  const index =
    preferredValues.indexOf(
      value,
    );

  if (index === -1) {
    return 0;
  }

  /*
    First item receives 2 points.

    Remaining accepted/preferred items receive 1 point.

    This keeps the scoring simple and explainable.
  */
  return index === 0
    ? 2
    : 1;
}

/* =========================================================
   SCORE ONE ACTIVITY
========================================================= */

export function scoreActivityForAdaptation(
  activity: AdaptationScoringActivity,
  preferences: ActivityAdaptationPreferences,
): ActivityAdaptationScore {

  let score = 0;

  const matchedPreferences:
    string[] = [];

  const unmatchedPreferences:
    string[] = [];

  /*
    Maximum:

    delivery      = 2
    attention     = 2
    sensory       = 2
    movement      = 2
    interaction   = 2
    duration      = 1

    Total maximum = 11
  */
  const maximumPossibleScore =
    11;

  /* =======================================================
     1. DELIVERY MODE
  ======================================================= */

  const deliveryScore =
    scoreOrderedPreference(
      activity.delivery_mode,
      preferences.preferredDeliveryModes,
    );

  score +=
    deliveryScore;

  if (deliveryScore > 0) {
    matchedPreferences.push(
      "preferred_delivery_mode",
    );
  } else {
    unmatchedPreferences.push(
      "preferred_delivery_mode",
    );
  }

  /* =======================================================
     2. ATTENTION DEMAND
  ======================================================= */

  const attentionScore =
    scoreOrderedPreference(
      activity.attention_demand,
      preferences.preferredAttentionDemand,
    );

  score +=
    attentionScore;

  if (attentionScore > 0) {
    matchedPreferences.push(
      "preferred_attention_demand",
    );
  } else {
    unmatchedPreferences.push(
      "preferred_attention_demand",
    );
  }

  /* =======================================================
     3. SENSORY LOAD
  ======================================================= */

  const sensoryScore =
    scoreOrderedPreference(
      activity.sensory_load,
      preferences.preferredSensoryLoad,
    );

  score +=
    sensoryScore;

  if (sensoryScore > 0) {
    matchedPreferences.push(
      "preferred_sensory_load",
    );
  } else {
    unmatchedPreferences.push(
      "preferred_sensory_load",
    );
  }

  /* =======================================================
     4. MOVEMENT LEVEL
  ======================================================= */

  const movementScore =
    scoreOrderedPreference(
      activity.movement_level,
      preferences.preferredMovementLevels,
    );

  score +=
    movementScore;

  if (movementScore > 0) {
    matchedPreferences.push(
      "preferred_movement_level",
    );
  } else {
    unmatchedPreferences.push(
      "preferred_movement_level",
    );
  }

  /* =======================================================
     5. INTERACTION MODE
  ======================================================= */

  const interactionScore =
    scoreOrderedPreference(
      activity.interaction_mode,
      preferences.preferredInteractionModes,
    );

  score +=
    interactionScore;

  if (interactionScore > 0) {
    matchedPreferences.push(
      "preferred_interaction_mode",
    );
  } else {
    unmatchedPreferences.push(
      "preferred_interaction_mode",
    );
  }

  /* =======================================================
     6. DURATION
  ======================================================= */

  if (
    preferences.preferredMaximumMinutes ===
      null
  ) {
    /*
      No duration preference is active.

      Give the activity the duration point so normal/unknown
      states are not unfairly penalized.
    */
    score += 1;

    matchedPreferences.push(
      "duration_not_restricted",
    );
  } else if (
    typeof activity.estimated_minutes ===
      "number" &&
    activity.estimated_minutes <=
      preferences.preferredMaximumMinutes
  ) {
    score += 1;

    matchedPreferences.push(
      "preferred_duration",
    );
  } else {
    unmatchedPreferences.push(
      "preferred_duration",
    );
  }

  /* =======================================================
     7. NORMALIZED SCORE
  ======================================================= */

  const normalizedScore =
    Number(
      (
        score /
        maximumPossibleScore
      ).toFixed(4),
    );

  return {
    activityId:
      activity.id,

    score,

    maximumPossibleScore,

    normalizedScore,

    matchedPreferences,

    unmatchedPreferences,
  };
}


/* =========================================================
   SCORE ACTIVITY FOR LEARNER-SPECIFIC PREFERENCES

   IMPORTANT:

   This score is separate from the current-state adaptation
   score.

   It considers the learner's longer-term profile such as:
   - motivating topics
   - communication preference
   - visual support need
   - assistance need
   - sensory considerations
   - typical engagement duration
========================================================= */

export function scoreActivityForLearnerPreferences(
  activity: AdaptationScoringActivity,
  learnerPreferences: LearnerPreferenceProfile,
): ActivityPreferenceScore {

  let score = 0;

  const matchedPreferences:
    string[] = [];

  const cautions:
    string[] = [];

  /*
    Maximum possible positive score:

    motivating topic       = 2
    communication match    = 1
    visual support match   = 1
    assistance match       = 1
    duration fit           = 1

    Total = 6

    Sensory overlap is treated as a caution/penalty rather
    than a positive preference because profile values such
    as "loud_sounds" may represent sensitivities.
  */
  const maximumPossibleScore =
    6;

  /* =======================================================
     1. MOTIVATING TOPICS
  ======================================================= */

  const normalizedActivityTopics =
    (activity.topic_tags ?? [])
      .map(
        (topic) =>
          topic.trim().toLowerCase(),
      );

  const normalizedMotivatingTopics =
    learnerPreferences
      .motivatingTopics
      .map(
        (topic) =>
          topic.trim().toLowerCase(),
      );

  const hasMotivatingTopicMatch =
    normalizedActivityTopics.some(
      (topic) =>
        normalizedMotivatingTopics.includes(
          topic,
        ),
    );

  if (hasMotivatingTopicMatch) {
    score += 2;

    matchedPreferences.push(
      "motivating_topic_match",
    );
  }

  /* =======================================================
     2. COMMUNICATION MODE
  ======================================================= */

  if (
    learnerPreferences
      .preferredCommunicationMethod &&
    activity.communication_mode ===
      learnerPreferences
        .preferredCommunicationMethod
  ) {
    score += 1;

    matchedPreferences.push(
      "preferred_communication_match",
    );
  }

  /* =======================================================
     3. VISUAL SUPPORT
  ======================================================= */

  if (
    learnerPreferences
      .requiresVisualSupport
  ) {
    if (
      activity.visual_support_level ===
        "high" ||
      activity.visual_support_level ===
        "standard"
    ) {
      score += 1;

      matchedPreferences.push(
        "visual_support_match",
      );
    }
  } else {
    /*
      If visual support is not specifically required,
      we do not penalize any visual support level.
    */
    score += 1;

    matchedPreferences.push(
      "visual_support_not_restricted",
    );
  }

  /* =======================================================
     4. ASSISTANCE LEVEL
  ======================================================= */

  if (
    learnerPreferences
      .tabletAssistanceLevel &&
    activity.assistance_level ===
      learnerPreferences
        .tabletAssistanceLevel
  ) {
    score += 1;

    matchedPreferences.push(
      "assistance_level_match",
    );
  }

  /* =======================================================
     5. TYPICAL ENGAGEMENT DURATION
  ======================================================= */

  if (
    learnerPreferences
      .typicalEngagementMinutes ===
      null
  ) {
    score += 1;

    matchedPreferences.push(
      "engagement_duration_not_restricted",
    );
  } else if (
    typeof activity.estimated_minutes ===
      "number" &&
    activity.estimated_minutes <=
      learnerPreferences
        .typicalEngagementMinutes
  ) {
    score += 1;

    matchedPreferences.push(
      "engagement_duration_match",
    );
  }

  /* =======================================================
     6. SENSORY CONSIDERATIONS

     We deliberately treat learner sensory profile values
     conservatively.

     If an activity advertises the same sensory feature as
     one listed in the learner profile, MOBI records a
     caution and slightly reduces the preference score.

     Example:

     learner profile:
       loud_sounds

     activity:
       sensory_features = ["loud_sounds"]

     This does NOT assume the learner likes loud sounds.
  ======================================================= */

  const normalizedSensoryFeatures =
    (activity.sensory_features ?? [])
      .map(
        (feature) =>
          feature.trim().toLowerCase(),
      );

  const normalizedLearnerSensory =
    learnerPreferences
      .sensoryPreferences
      .map(
        (feature) =>
          feature.trim().toLowerCase(),
      );

  const sensoryConflicts =
    normalizedSensoryFeatures.filter(
      (feature) =>
        normalizedLearnerSensory.includes(
          feature,
        ),
    );

  if (
    sensoryConflicts.length > 0
  ) {
    score = Math.max(
      0,
      score - 1,
    );

    cautions.push(
      "sensory_profile_overlap",
    );
  }

  const normalizedScore =
    Number(
      (
        score /
        maximumPossibleScore
      ).toFixed(4),
    );

  return {
    activityId:
      activity.id,

    score,

    maximumPossibleScore,

    normalizedScore,

    matchedPreferences,

    cautions,
  };
}


/* =========================================================
   SCORE MULTIPLE ACTIVITIES
========================================================= */

export function scoreActivitiesForAdaptation<
  T extends AdaptationScoringActivity,
>(
  activities: T[],
  preferences:
    ActivityAdaptationPreferences,
) {
  return activities
    .map(
      (activity) => ({
        activity,

        adaptationScore:
          scoreActivityForAdaptation(
            activity,
            preferences,
          ),
      }),
    )
    .sort(
      (a, b) =>
        b.adaptationScore.score -
        a.adaptationScore.score,
    );
}


/* =========================================================
   SCORE MULTIPLE ACTIVITIES FOR LEARNER PREFERENCES
========================================================= */

export function scoreActivitiesForLearnerPreferences<
  T extends AdaptationScoringActivity,
>(
  activities: T[],
  learnerPreferences:
    LearnerPreferenceProfile,
) {
  return activities
    .map(
      (activity) => ({
        activity,

        preferenceScore:
          scoreActivityForLearnerPreferences(
            activity,
            learnerPreferences,
          ),
      }),
    )
    .sort(
      (a, b) =>
        b.preferenceScore.score -
        a.preferenceScore.score,
    );
}