// mobi-backend/src/services/learner/transactionalProfileService.ts

import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

/*
  This is the structure of the assessment responses coming
  from the enrollment payload.

  questionId currently contains the stable question code:

  communication_method
  expressive_communication
  benefits_visual_supports
  etc.
*/
export interface IntakeResponse {
  questionId: string;

  value:
    | string
    | string[]
    | null;

  otherValue?: string | null;
}

/*
  Data that will be inserted into:

  learner_transactional_profiles
*/
export interface CreateTransactionalProfileData {
  learner_id: string;
  center_id: string;

  latest_assessment_id: string;

  suggested_speech_ladder:
    | string
    | null;

  current_speech_ladder:
    | string
    | null;

  communication_level:
    | string
    | null;

  preferred_communication_method:
    | string
    | null;

  requires_visual_support: boolean;

  tablet_assistance_level:
    | string
    | null;

  typical_engagement_minutes:
    | number
    | null;

  sensory_preferences:
    | string[]
    | null;

  motivating_topics:
    | string[]
    | null;

  attention_areas:
    | unknown[]
    | null;

  therapist_notes:
    | string
    | null;

  therapist_confirmed: boolean;
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

/*
  Finds one answer using its stable question code.

  Example:

  getResponseValue(
    responses,
    "communication_method"
  )

  might return:

  "combination"
*/
function getResponseValue(
  responses: IntakeResponse[],
  questionId: string,
) {
  return responses.find(
    (response) =>
      response.questionId ===
      questionId,
  )?.value ?? null;
}

/*
  Helper specifically for single-answer questions.

  Arrays are rejected because fields such as
  communication_level expect one value.
*/
function getStringResponse(
  responses: IntakeResponse[],
  questionId: string,
): string | null {
  const value =
    getResponseValue(
      responses,
      questionId,
    );

  return typeof value === "string"
    ? value
    : null;
}

/*
  Helper for multiple-answer questions.

  Examples:

  sensory_sensitivities
  motivating_topics
*/
function getArrayResponse(
  responses: IntakeResponse[],
  questionId: string,
): string[] {
  const value =
    getResponseValue(
      responses,
      questionId,
    );

  return Array.isArray(value)
    ? value
    : [];
}

/* =========================================================
   SPEECH LADDER SUGGESTION
========================================================= */

/*
  The frontend currently calculates this too.

  We intentionally calculate it again in the backend.

  WHY?

  The backend should eventually be the reliable source
  of system rules.

  A user could manually modify frontend JavaScript, so
  important adaptation logic should not depend only on
  frontend calculations.

  IMPORTANT:

  This is only a suggestion.

  It does NOT automatically become:
  current_speech_ladder

  A therapist still confirms the learner's level.
*/
function determineSuggestedSpeechLadder(
  expressiveCommunication:
    | string
    | null,
): string | null {
  switch (
    expressiveCommunication
  ) {
    case "no_speech":
      return "Sound";

    case "sounds_vocalizations":
      return "Sound";

    case "single_words":
      return "Word";

    case "two_word_combinations":
      return "Phrase";

    case "short_phrases":
      return "Phrase";

    case "sentences":
      return "Sentence";

    default:
      return null;
  }
}

/* =========================================================
   VISUAL SUPPORT
========================================================= */

/*
  The assessment question asks whether the learner benefits
  from visual supports.

  For MOBI adaptation:

  always
  sometimes
  rarely

  all mean that visual support may still be useful.

  Only "not_needed" becomes false.
*/
function determineVisualSupport(
  response: string | null,
): boolean {
  if (!response) {
    return false;
  }

  return response !== "not_needed";
}

/* =========================================================
   ENGAGEMENT DURATION
========================================================= */

/*
  The assessment stores engagement using categories:

  less_than_5
  5_to_10
  10_to_15
  more_than_15

  The transactional profile stores a number of minutes.

  We use a conservative value because MOBI activities should
  not initially exceed the learner's reported tolerance.

  These values can later be updated using actual session data.
*/
function determineEngagementMinutes(
  response: string | null,
): number | null {
  switch (response) {
    case "less_than_5":
      return 4;

    case "5_to_10":
      return 5;

    case "10_to_15":
      return 10;

    case "more_than_15":
      return 15;

    default:
      return null;
  }
}

/* =========================================================
   THERAPIST NOTES
========================================================= */

/*
  The assessment currently contains:

  Question 17:
  therapy_goals_priorities

  Question 18:
  additional_notes

  learner_transactional_profiles has one therapist_notes
  column, so we combine the available information here.

  The original responses still remain stored separately in
  learner_assessment_responses.
*/
function buildTherapistNotes(
  responses: IntakeResponse[],
): string | null {
  const goals =
    getStringResponse(
      responses,
      "therapy_goals_priorities",
    );

  const notes =
    getStringResponse(
      responses,
      "additional_notes",
    );

  const noteParts: string[] = [];

  if (goals?.trim()) {
    noteParts.push(
      `Therapy goals/priorities: ${goals.trim()}`,
    );
  }

  if (notes?.trim()) {
    noteParts.push(
      `Additional notes: ${notes.trim()}`,
    );
  }

  return noteParts.length > 0
    ? noteParts.join("\n\n")
    : null;
}

/* =========================================================
   BUILD TRANSACTIONAL PROFILE
========================================================= */

/*
  Converts the raw intake assessment into fields that MOBI
  can easily use for personalization and adaptation.

  This does NOT insert anything yet.

  It only builds the object.
*/
export function buildTransactionalProfileData(
  learnerId: string,
  centerId: string,
  assessmentId: string,
  responses: IntakeResponse[],
  attentionAreas: unknown[] = [],
): CreateTransactionalProfileData {
  const expressiveCommunication =
    getStringResponse(
      responses,
      "expressive_communication",
    );

  const communicationMethod =
    getStringResponse(
      responses,
      "communication_method",
    );

  const visualSupportResponse =
    getStringResponse(
      responses,
      "benefits_visual_supports",
    );

  const tabletAssistance =
    getStringResponse(
      responses,
      "tablet_assistance",
    );

  const structuredEngagement =
    getStringResponse(
      responses,
      "structured_engagement",
    );

  const sensoryPreferences =
    getArrayResponse(
      responses,
      "sensory_sensitivities",
    ).filter(
      (value) =>
        value !== "none",
    );

  const motivatingTopics =
    getArrayResponse(
      responses,
      "motivating_topics",
    );

  return {
    learner_id:
      learnerId,

    center_id:
      centerId,

    latest_assessment_id:
      assessmentId,

    /*
      System suggestion only.
    */
    suggested_speech_ladder:
      determineSuggestedSpeechLadder(
        expressiveCommunication,
      ),

    /*
      Do NOT automatically assign the system suggestion as
      the learner's confirmed level.

      The therapist will confirm this later.
    */
    current_speech_ladder:
      null,

    communication_level:
      expressiveCommunication,

    preferred_communication_method:
      communicationMethod,

    requires_visual_support:
      determineVisualSupport(
        visualSupportResponse,
      ),

    tablet_assistance_level:
      tabletAssistance,

    typical_engagement_minutes:
      determineEngagementMinutes(
        structuredEngagement,
      ),

    sensory_preferences:
      sensoryPreferences.length > 0
        ? sensoryPreferences
        : null,

    motivating_topics:
      motivatingTopics.length > 0
        ? motivatingTopics
        : null,

    attention_areas:
      attentionAreas.length > 0
        ? attentionAreas
        : null,

    therapist_notes:
      buildTherapistNotes(
        responses,
      ),

    /*
      False until the therapist explicitly confirms the
      learner's starting profile / Speech Ladder.
    */
    therapist_confirmed:
      false,
  };
}

/* =========================================================
   CREATE TRANSACTIONAL PROFILE
========================================================= */

/*
  Inserts the prepared profile into:

  learner_transactional_profiles

  We intentionally do NOT insert:

  total_sessions
  total_time_minutes
  activities_mastered
  overall_success_rate
  last_updated

  because the database should provide the initial/default
  values for those fields.
*/
export async function createTransactionalProfile(
  data: CreateTransactionalProfileData,
) {
  const {
    data: profile,
    error,
  } = await supabase
    .from(
      "learner_transactional_profiles",
    )
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(
      "Unable to create learner transactional profile:",
      error,
    );

    throw error;
  }

  return profile;
}