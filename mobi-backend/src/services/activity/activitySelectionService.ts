// mobi-backend/src/services/activity/activitySelectionService.ts

import { supabase } from "../../config/supabase";

import {
  getLearnerAssignedActivities,
} from "./activityAssignmentService";

import {
  getOrCreateBanditState,
  sampleThompsonScore,
} from "./thompsonSamplingService";

import {
  evaluateLearnerState,
} from "./learnerStateService";

import {
  getAdaptationPolicy,
} from "./adaptationPolicyService";

import {
  scoreActivitiesForAdaptation,
  scoreActivitiesForLearnerPreferences,
} from "./activityAdaptationScoringService";

import {
  getLearnerPreferences,
} from "./learnerPreferenceService";



/* =========================================================
   TYPES
========================================================= */

export type ActivitySelectionSource =
  | "assigned_required"
  | "assigned_recommended"
  | "adaptive_fallback";

export interface SelectNextActivityInput {
  centerId: string;
  learnerId: string;
}

export interface SelectedActivityResult {
  activityId: string;

  /*
    Present only when the selected activity came from
    learner_activity_assignments.
  */
  assignmentId: string | null;

  source: ActivitySelectionSource;

  /*
    For now this identifies the simple selection mechanism.

    Later we will add:

    thompson_sampling
    rule_based_progression
    engagement_override
  */
  selectionAlgorithm:
  | "assigned_priority"
  | "thompson_sampling"
  | "hybrid_thompson_personalized";

  selectionReason: Record<
    string,
    unknown
  >;

  activity: Record<
    string,
    unknown
  >;
}

/* =========================================================
   SELECT NEXT ACTIVITY
========================================================= */

export async function selectNextActivity(
  input: SelectNextActivityInput,
): Promise<SelectedActivityResult | null> {
  const {
    centerId,
    learnerId,
  } = input;

  /* =======================================================
     1. VERIFY LEARNER
  ======================================================= */

  console.log("========== SELECT NEXT ==========");
console.log("centerId:", centerId);
console.log("learnerId:", learnerId);

  const {
    data: learner,
    error: learnerError,
  } = await supabase
    .from("learners")
    .select(`
      id,
      center_id,
      enrollment_status
    `)
    .eq(
      "id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .single();

console.log("learner:", learner);
console.log("learnerError:", learnerError);

  if (
    learnerError ||
    !learner
  ) {
    console.error(
      "Unable to verify learner before activity selection:",
      learnerError,
    );
    
    throw new Error(
      "Learner was not found in this center.",
    );
  }

  if (
    learner.enrollment_status !==
    "active"
  ) {
    throw new Error(
      "Only active learners can receive activities.",
    );
  }

  /* =======================================================
     2. CHECK ASSIGNED ACTIVITIES FIRST
  ======================================================= */

  /*
    The assignment service already returns:

    required assignments first
      ↓
    recommended assignments
      ↓
    priority
      ↓
    assigned date

    Therefore the first item is the highest-priority
    available assigned activity.
  */
  const assignments =
    await getLearnerAssignedActivities(
      learnerId,
      centerId,
      [
        "pending",
        "in_progress",
      ],
    );

  if (
    assignments.length > 0
  ) {
    const assignment =
      assignments[0];

    const activity =
      assignment.activity;

    if (activity?.id) {
      const source:
        ActivitySelectionSource =
          assignment.assignment_type ===
          "required"
            ? "assigned_required"
            : "assigned_recommended";

      return {
        activityId:
          activity.id,

        assignmentId:
          assignment.id,

        source,

        selectionAlgorithm:
          "assigned_priority",

        selectionReason: {
          reason:
            "The learner has an unfinished assigned activity.",

          assignmentType:
            assignment.assignment_type,

          priority:
            assignment.priority,

          assignmentStatus:
            assignment.status,
        },

        activity,
      };
    }
  }

  /* =======================================================
     3. NO ASSIGNMENT FOUND

     GET LEARNER'S CURRENT SPEECH LEVEL
  ======================================================= */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from(
      "learner_transactional_profiles",
    )
    .select(`
      current_speech_ladder,
      suggested_speech_ladder
    `)
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .maybeSingle();

  if (profileError) {
    console.error(
      "Unable to fetch learner profile during activity selection:",
      profileError,
    );

    throw profileError;
  }

  /*
    Prefer the therapist-confirmed/current level.

    If no level has been confirmed yet, use the
    preliminary suggested level.
  */
  const learnerSpeechLevel =
    profile
      ?.current_speech_ladder ??
    profile
      ?.suggested_speech_ladder ??
    null;

  /* =======================================================
     4. GET LEARNER ADAPTATION SETTINGS
  ======================================================= */

  const {
    data: learnerAdaptationSettings,
    error: learnerAdaptationSettingsError,
  } = await supabase
    .from(
      "learner_adaptation_settings",
    )
    .select(`
      gaze_away_threshold_seconds,
      slow_response_threshold_seconds,
      declining_success_window
    `)
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .maybeSingle();

  if (
    learnerAdaptationSettingsError
  ) {
    console.error(
      "Unable to fetch learner adaptation settings during activity selection:",
      learnerAdaptationSettingsError,
    );

    throw learnerAdaptationSettingsError;
  }

  /* =======================================================
     4. GET RECENT LEARNER STATE EVIDENCE
  ======================================================= */

  const {
    data: recentSessions,
    error: recentSessionsError,
  } = await supabase
    .from(
      "learner_activity_sessions",
    )
    .select(`
      id,
      completed_at,
      inactivity_seconds,
      gaze_away_seconds,
      gaze_detection_available,
      average_response_time_ms,
      correct_attempts,
      incorrect_attempts,
      total_scored_attempts
    `)
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .neq(
      "status",
      "in_progress",
    )
    .order(
      "completed_at",
      {
        ascending: false,
      },
    )
    .limit(3);

  if (recentSessionsError) {
    console.error(
      "Unable to fetch recent learner sessions during activity selection:",
      recentSessionsError,
    );

    throw recentSessionsError;
  }

  const recentSessionRows =
    recentSessions ?? [];

  /*
    Convert recent session summaries into lightweight
    attempt-like evidence for the learner-state classifier.

    Later, mobile/session integration can provide more
    detailed real-time attempt evidence.
  */
  const recentAttempts =
    recentSessionRows.map(
      (session) => {
        const scoredCount =
          Number(
            session.total_scored_attempts ??
              0,
          );

        const incorrectCount =
          Number(
            session.incorrect_attempts ??
              0,
          );

        return {
          shouldScore:
            scoredCount > 0,

          isCorrect:
            scoredCount > 0
              ? incorrectCount === 0
              : null,

          responseTimeMs:
            typeof session.average_response_time_ms ===
              "number"
              ? session.average_response_time_ms
              : null,

          wasSkipped:
            false,
        };
      },
    );

  const latestSession =
    recentSessionRows[0] ??
    null;

  const learnerState =
    evaluateLearnerState({
      recentAttempts,

      gazeDetectionAvailable:
        latestSession
          ?.gaze_detection_available ??
        false,

      gazeAwaySeconds:
        Number(
          latestSession
            ?.gaze_away_seconds ??
            0,
        ),

      inactivitySeconds:
        Number(
          latestSession
            ?.inactivity_seconds ??
            0,
        ),

    gazeAwayThresholdSeconds:
    Number(
        learnerAdaptationSettings
        ?.gaze_away_threshold_seconds ??
        10,
    ),

    slowResponseThresholdSeconds:
    Number(
        learnerAdaptationSettings
        ?.slow_response_threshold_seconds ??
        15,
    ),

    decliningSuccessWindow:
    Number(
        learnerAdaptationSettings
        ?.declining_success_window ??
        3,
    ),
    });

const adaptationPolicy =
    getAdaptationPolicy(
      learnerState.state,
    );

    /* =======================================================
   GET LONG-TERM LEARNER PREFERENCES
======================================================= */

const learnerPreferences =
  await getLearnerPreferences({
    centerId,
    learnerId,
  });

  /*
  SAFETY RULE:

  Thompson Sampling may choose between activities only after
  MOBI knows the learner's current or suggested Speech Ladder
  level.

  We must NOT allow a missing level to make every activity
  eligible because that could expose a learner to activities
  above or below their appropriate starting point.
*/
    if (!learnerSpeechLevel) {
    return null;
    }

//   /* =======================================================
//      4. FIND BASIC CENTER LIBRARY FALLBACK

//      This is temporary.

//      Later, this eligible activity pool will be passed into
//      Thompson Sampling instead of simply picking the oldest
//      matching activity.
//   ======================================================= */

//   let activityQuery =
//     supabase
//       .from("activities")
//       .select(`
//         id,
//         title,
//         description,
//         activity_type,
//         speech_ladder_level,
//         max_attempts,
//         estimated_minutes,
//         allow_skip,
//         success_required_count,
//         thumbnail_url,
//         ai_voice_gender,
//         ai_voice_speed,
//         access_scope,
//         status,
//         created_at
//       `)
//       .eq(
//         "center_id",
//         centerId,
//       )
//       .eq(
//         "status",
//         "published",
//       )
//       .eq(
//         "access_scope",
//         "center_library",
//       );

//   /*
//     If a learner level exists, restrict the temporary
//     fallback to the same Speech Ladder level.

//     This keeps the first implementation conservative.
//   */
//   if (learnerSpeechLevel) {
//     activityQuery =
//       activityQuery.eq(
//         "speech_ladder_level",
//         learnerSpeechLevel.toLowerCase(),
//       );
//   }

//   const {
//     data: fallbackActivities,
//     error: activitiesError,
//   } =
//     await activityQuery
//       .order(
//         "created_at",
//         {
//           ascending: true,
//         },
//       )
//       .limit(1);

//   if (activitiesError) {
//     console.error(
//       "Unable to fetch fallback activities:",
//       activitiesError,
//     );

//     throw activitiesError;
//   }

//   const fallbackActivity =
//     fallbackActivities?.[0];

//   /*
//     Returning null is valid.

//     It means:

//     - no unfinished assigned activity
//     - no eligible center-library activity

//     The controller/mobile app can then show that there is
//     currently no activity available.
//   */
//   if (!fallbackActivity) {
//     return null;
//   }

//   return {
//     activityId:
//       fallbackActivity.id,

//     assignmentId:
//       null,

//     source:
//       "adaptive_fallback",

//     selectionAlgorithm:
//       "basic_fallback",

//     selectionReason: {
//       reason:
//         "No unfinished assigned activity was available, so a center-library activity matching the learner's current Speech Ladder level was selected.",

//       learnerSpeechLevel,
//     },

//     activity:
//       fallbackActivity,
//   };

      /* =======================================================
     4. BUILD ELIGIBLE ADAPTIVE ACTIVITY POOL

     Rules determine WHICH activities are safe/eligible.

     Thompson Sampling only chooses BETWEEN activities that
     already passed these rules.
  ======================================================= */

  const {
    data: eligibleActivities,
    error: activitiesError,
  } = await supabase
    .from("activities")
    .select(`
        id,
        title,
        description,
        activity_type,
        speech_ladder_level,

        delivery_mode,
        attention_demand,
        sensory_load,
        movement_level,
        interaction_mode,

        topic_tags,
        visual_support_level,
        communication_mode,
        assistance_level,
        sensory_features,

        max_attempts,
        estimated_minutes,
        allow_skip,
        success_required_count,

        thumbnail_url,

        ai_voice_gender,
        ai_voice_speed,

        access_scope,
        status,
        created_at
    `)
    .eq(
      "center_id",
      centerId,
    )
    .eq(
      "status",
      "published",
    )
    .eq(
      "access_scope",
      "center_library",
    )
    .eq(
      "speech_ladder_level",
      learnerSpeechLevel.toLowerCase(),
    );

  if (activitiesError) {
    console.error(
      "Unable to fetch Thompson-eligible activities:",
      activitiesError,
    );

    throw activitiesError;
  }

  /*
    No eligible activities is a valid result.

    This means:

    - no unfinished assignment exists
    - no published center-library activity exists
      for the learner's current Speech Ladder level
  */
  if (
    !eligibleActivities ||
    eligibleActivities.length === 0
  ) {
    return null;
  }

  /* =======================================================
     5. SCORE ACTIVITIES FOR CURRENT LEARNER STATE
  ======================================================= */

  const scoredActivities =
    scoreActivitiesForAdaptation(
      eligibleActivities,
      adaptationPolicy,
    );

  /*
    Keep activities that have at least some adaptation fit.

    Because the scoring system is preference-based rather
    than a hard safety filter, we fall back to the entire
    scored pool if no activity receives a positive score.
  */
const adaptationEligibleActivities =
  adaptationPolicy
    .minimumNormalizedScore ===
      null
    ? scoredActivities
    : scoredActivities.filter(
        (item) =>
          item.adaptationScore
            .normalizedScore >=
          adaptationPolicy
            .minimumNormalizedScore!,
      );

  const finalEligibleActivities =
    adaptationEligibleActivities.length >
    0
      ? adaptationEligibleActivities
      : scoredActivities;

/* =======================================================
   SCORE ADAPTATION-ELIGIBLE ACTIVITIES FOR
   LEARNER-SPECIFIC PREFERENCES
======================================================= */

const preferenceScoredActivities =
  scoreActivitiesForLearnerPreferences(
    finalEligibleActivities.map(
      (candidate) =>
        candidate.activity,
    ),
    learnerPreferences,
  );

const finalPersonalizedActivities =
  finalEligibleActivities.map(
    (candidate) => {
      const preferenceCandidate =
        preferenceScoredActivities.find(
          (item) =>
            item.activity.id ===
            candidate.activity.id,
        );

      return {
        ...candidate,

        preferenceScore:
          preferenceCandidate
            ?.preferenceScore ??
          null,
      };
    },
  );


  if (
  finalPersonalizedActivities.length ===
  0
) {
  return null;
}

  /* =======================================================
     5. THOMPSON SAMPLING

     Each learner has an independent Beta(alpha, beta)
     state for every eligible activity.

     Example:

       Animal Words
       alpha = 5
       beta = 2

       Colors
       alpha = 2
       beta = 2

     We sample once from each Beta distribution.

     The activity with the highest sampled value wins.
  ======================================================= */

let selectedActivity:
  (typeof finalPersonalizedActivities)[number] |
  null =
    null;

  let highestFinalScore =
  -1;

let selectedThompsonSample =
  -1;

let selectedPreferenceScore =
  0;

  const candidateSamples: Array<{
    activityId: string;
    alpha: number;
    beta: number;
    thompsonScore: number;
    preferenceScore: number;
    finalSelectionScore: number;
}> = [];

  for (
    const candidate
    of finalPersonalizedActivities
) {
    const activity =
        candidate.activity;
    /*
      Brand-new learner/activity combinations automatically
      begin at Beta(1,1).

      Existing combinations reuse what MOBI has learned from
      that learner's previous completed sessions.
    */
    const banditState =
      await getOrCreateBanditState(
        centerId,
        learnerId,
        activity.id,
      );

    const sampledScore =
      sampleThompsonScore(
        banditState.alpha,
        banditState.beta,
      );
    
    /*
  Learner preference contributes a bounded amount to the
  final recommendation.

  Thompson remains the dominant signal so MOBI can continue
  learning from real learner outcomes and exploring new
  activities.

  75% = learned Thompson estimate
  25% = current learner-profile fit
    */
    const normalizedPreferenceScore =
    candidate.preferenceScore
        ?.normalizedScore ??
    0.5;

    const finalSelectionScore =
    sampledScore * 0.75 +
    normalizedPreferenceScore * 0.25;

    candidateSamples.push({
  activityId:
    activity.id,

  alpha:
    banditState.alpha,

  beta:
    banditState.beta,

  thompsonScore:
    sampledScore,

  preferenceScore:
    normalizedPreferenceScore,

  finalSelectionScore,
});

    if (
  finalSelectionScore >
  highestFinalScore
) {
  highestFinalScore =
    finalSelectionScore;

  selectedThompsonSample =
    sampledScore;

  selectedPreferenceScore =
    normalizedPreferenceScore;

  selectedActivity =
    candidate;
}
  }

  /*
    This should normally never happen because we already
    confirmed that eligibleActivities contains at least one
    item, but keeping the guard makes the service defensive.
  */
  if (!selectedActivity) {
    return null;
  }

  /* =======================================================
     6. RETURN THOMPSON SELECTION

     IMPORTANT:

     We intentionally DO NOT increment selection_count here.

     selectNextActivity() can also be called through GET /next
     simply to inspect the recommendation.

     We will increment selection_count only after
     startNextSession successfully creates a real learner
     session.
  ======================================================= */

  return {
    activityId:
      selectedActivity.activity.id,

    assignmentId:
      null,

    source:
      "adaptive_fallback",

    selectionAlgorithm:
      "hybrid_thompson_personalized",

    selectionReason: {
  reason:
  "No unfinished assigned activity was available. MOBI filtered activities using the learner's Speech Ladder and current adaptive state, then combined Thompson Sampling with learner-profile preference scoring to select the next activity.",
  
  learnerSpeechLevel,

  eligibleActivityCount:
    eligibleActivities.length,

  adaptationEligibleActivityCount:
    finalEligibleActivities.length,

  learnerState:
    learnerState.state,

  learnerStateReasons:
    learnerState.reasons,

  adaptationPolicyReasons:
    adaptationPolicy.reasons,

  minimumAdaptationScore:
    adaptationPolicy.minimumNormalizedScore,

  selectedThompsonSample,

    selectedPreferenceScore,

    selectedFinalScore:
    highestFinalScore,

    selectionWeights: {
    thompson:
        0.75,

    learnerPreference:
        0.25,
    },

  /*
    Thompson Sampling values.

    These are useful during development for verifying
    which candidates Thompson compared.
  */
  candidateSamples,

  /*
    Current-state adaptation scores.

    Example:

    low engagement
      → low attention
      → lower sensory demand
      → movement preference
  */
  adaptationScores:
    finalEligibleActivities.map(
      (candidate) => ({
        activityId:
          candidate.activity.id,

        score:
          candidate.adaptationScore
            .score,

        normalizedScore:
          candidate.adaptationScore
            .normalizedScore,

        matchedPreferences:
          candidate.adaptationScore
            .matchedPreferences,

        unmatchedPreferences:
          candidate.adaptationScore
            .unmatchedPreferences,
      }),
    ),

  /*
    Long-term learner preference profile.
  */
  learnerPreferences,

  /*
    Learner-specific personalization scores.

    These consider things such as:

    - motivating topics
    - communication preference
    - visual support
    - assistance level
    - typical engagement duration
    - sensory cautions
  */
  preferenceScores:
    finalPersonalizedActivities.map(
      (candidate) => ({
        activityId:
          candidate.activity.id,

        score:
          candidate.preferenceScore
            ?.score ??
          0,

        normalizedScore:
          candidate.preferenceScore
            ?.normalizedScore ??
          0,

        matchedPreferences:
          candidate.preferenceScore
            ?.matchedPreferences ??
          [],

        cautions:
          candidate.preferenceScore
            ?.cautions ??
          [],
      }),
    ),
},

    activity:
      selectedActivity.activity,
  };
}