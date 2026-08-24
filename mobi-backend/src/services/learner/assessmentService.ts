// mobi-backend/src/services/learner/assessmentService.ts

import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

export interface CreateAssessmentData {
  learner_id: string;
  center_id: string;
  template_id: string;

  status: string;

  suggested_speech_ladder?: string | null;

  therapist_confirmed_speech_ladder?: string | null;

  reviewed_by?: string | null;

  reviewed_at?: string | null;

  notes?: string | null;
}

/* =========================================================
   FIND ASSESSMENT TEMPLATE
========================================================= */

/*
  The frontend sends a stable template code and version:

  MOBI_LEARNER_INTAKE_PROFILE
  version 1

  The database stores the real template using a UUID.

  This function converts:

  templateCode + templateVersion

  into:

  template_id
*/
export async function findAssessmentTemplate(
  templateCode: string,
  templateVersion: number,
) {
  const { data: template, error } =
    await supabase
      .from("assessment_templates")
      .select("id, template_code, version")
      .eq("template_code", templateCode)
      .eq("version", templateVersion)
      .single();

  if (error) {
    console.error(
      "Unable to find assessment template:",
      error,
    );

    throw error;
  }

  return template;
}

/* =========================================================
   CREATE ASSESSMENT
========================================================= */

export async function createAssessment(
  data: CreateAssessmentData,
) {
  const { data: assessment, error } =
    await supabase
      .from("learner_assessments")
      .insert(data)
      .select()
      .single();

  if (error) {
    console.error(
      "Unable to create learner assessment:",
      error,
    );

    throw error;
  }

  return assessment;
}



/* =========================================================
   TYPES — ASSESSMENT RESPONSES
========================================================= */

export interface AssessmentResponseInput {
  questionId: string;
  value: string | string[] | null;
  otherValue?: string | null;
}

/* =========================================================
   SAVE ASSESSMENT RESPONSES
========================================================= */

/*
  The frontend sends question codes such as:

    communication_method
    expressive_communication
    motivating_topics

  However, learner_assessment_responses.question_id requires
  the actual UUID from assessment_questions.

  Therefore this function:

  1. Gets the questions belonging to the template.
  2. Matches questionId from the frontend to question_code.
  3. Converts each answer into the database structure.
  4. Inserts all responses.
*/
export async function saveAssessmentResponses(
  assessmentId: string,
  templateId: string,
  responses: AssessmentResponseInput[],
) {
  /* -------------------------------------------------------
     1. GET DATABASE QUESTIONS
  ------------------------------------------------------- */

  const {
    data: questions,
    error: questionsError,
  } = await supabase
    .from("assessment_questions")
    .select("id, question_code")
    .eq("template_id", templateId)
    .eq("is_active", true);

  if (questionsError) {
    console.error(
      "Unable to load assessment questions:",
      questionsError,
    );

    throw questionsError;
  }

  /*
    Create an easy lookup:

    communication_method → UUID
    expressive_communication → UUID
    etc.
  */
  const questionMap = new Map(
    (questions ?? []).map((question) => [
      question.question_code,
      question.id,
    ]),
  );

  /* -------------------------------------------------------
     2. CONVERT FRONTEND RESPONSES
  ------------------------------------------------------- */

  const responseRows = responses.map(
    (response) => {
      const questionUuid =
        questionMap.get(response.questionId);

      /*
        Do not silently save an invalid question.

        If the frontend sends a question code that doesn't
        exist in this assessment template, stop enrollment.
      */
      if (!questionUuid) {
        throw new Error(
          `Assessment question not found: ${response.questionId}`,
        );
      }

      /*
        Multiple-choice questions such as sensory
        sensitivities and motivating topics send arrays.

        Single-choice and text questions send strings.
      */
      const isMultiple =
        Array.isArray(response.value);

      return {
        assessment_id: assessmentId,

        question_id: questionUuid,

        answer_text:
          !isMultiple &&
          typeof response.value === "string"
            ? response.value
            : null,

        answer_values:
          isMultiple
            ? response.value
            : [],

        other_value:
          response.otherValue ?? null,
      };
    },
  );

  /* -------------------------------------------------------
     3. INSERT RESPONSES
  ------------------------------------------------------- */

  const {
    data: savedResponses,
    error: insertError,
  } = await supabase
    .from("learner_assessment_responses")
    .insert(responseRows)
    .select();

  if (insertError) {
    console.error(
      "Unable to save assessment responses:",
      insertError,
    );

    throw insertError;
  }

  return savedResponses;
}