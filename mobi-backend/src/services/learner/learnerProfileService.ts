// mobi-backend/src/services/learner/learnerProfileService.ts

import { supabase } from "../../config/supabase";

import {
  createLearnerPhotoSignedUrl,
} from "./storageService";

/* =========================================================
   GET COMPLETE LEARNER PROFILE

   PURPOSE:
   Fetch one learner together with the related information
   needed by the Center dashboard.

   This includes:
   - learner basic information
   - guardian
   - latest assessment
   - assessment responses
   - transactional profile
   - temporary signed learner photo URL
========================================================= */

export async function getLearnerProfile(
  learnerId: string,
  centerId: string,
) {
  /* =======================================================
     1. GET LEARNER
  ======================================================= */

  /*
    We check both learner ID and center ID.

    This prevents one center from accidentally requesting
    a learner belonging to another center.
  */
  const {
    data: learner,
    error: learnerError,
  } = await supabase
    .from("learners")
    .select("*")
    .eq("id", learnerId)
    .eq("center_id", centerId)
    .single();

  if (learnerError) {
    console.error(
      "Unable to fetch learner:",
      learnerError,
    );

    throw learnerError;
  }

  /* =======================================================
     2. CREATE TEMPORARY PROFILE PHOTO URL
  ======================================================= */

  /*
    learners.profile_picture_url currently stores the
    Storage object path, not a public URL.

    Example:

    center-id/learner-id/profile-123456.jpg

    Because the bucket is private, we generate a temporary
    signed URL when the learner profile is requested.
  */
  let profilePhotoUrl: string | null =
    null;

  if (learner.profile_picture_url) {
    try {
      profilePhotoUrl =
        await createLearnerPhotoSignedUrl(
          learner.profile_picture_url,
        );
    } catch (error) {
      /*
        A photo problem should not prevent the entire learner
        profile from loading.

        We log the problem and simply return null for the
        display photo.
      */
      console.error(
        "Unable to generate learner photo URL:",
        error,
      );
    }
  }

  /* =======================================================
     3. GET GUARDIAN RELATIONSHIP
  ======================================================= */

  /*
    parent_learners connects:

    learner
       ↓
    parent_learners
       ↓
    center_parents

    We first retrieve the primary guardian relationship.
  */
  const {
    data: parentLink,
    error: parentLinkError,
  } = await supabase
    .from("parent_learners")
    .select(`
      id,
      relationship,
      is_primary_guardian,
      can_view_progress,
      can_guide_activities,
      parent_id
    `)
    .eq("learner_id", learnerId)
    .eq("is_primary_guardian", true)
    .maybeSingle();

  if (parentLinkError) {
    console.error(
      "Unable to fetch learner guardian relationship:",
      parentLinkError,
    );

    throw parentLinkError;
  }

  let guardian = null;

  if (parentLink?.parent_id) {
    const {
      data: parent,
      error: parentError,
    } = await supabase
      .from("center_parents")
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        email,
        phone_number,
        alternate_phone,
        home_address,
        profile_picture_url,
        emergency_contact_name,
        emergency_contact_phone,
        authorized_for_updates,
        account_status
      `)
      .eq("id", parentLink.parent_id)
      .eq("center_id", centerId)
      .single();

    if (parentError) {
      console.error(
        "Unable to fetch learner guardian:",
        parentError,
      );

      throw parentError;
    }

    guardian = {
      ...parent,

      relationship:
        parentLink.relationship,

      is_primary_guardian:
        parentLink.is_primary_guardian,

      can_view_progress:
        parentLink.can_view_progress,

      can_guide_activities:
        parentLink.can_guide_activities,
    };
  }

  /* =======================================================
     4. GET LATEST ASSESSMENT
  ======================================================= */

  /*
    A learner may eventually have several assessments.

    For the learner profile page we initially use the most
    recent assessment.
  */
  const {
    data: latestAssessment,
    error: assessmentError,
  } = await supabase
    .from("learner_assessments")
    .select(`
      id,
      learner_id,
      center_id,
      template_id,
      status,
      suggested_speech_ladder,
      therapist_confirmed_speech_ladder,
      reviewed_by,
      reviewed_at,
      notes,
      created_at
    `)
    .eq("learner_id", learnerId)
    .eq("center_id", centerId)
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(1)
    .maybeSingle();

  if (assessmentError) {
    console.error(
      "Unable to fetch latest learner assessment:",
      assessmentError,
    );

    throw assessmentError;
  }

  /* =======================================================
     5. GET LATEST ASSESSMENT RESPONSES
  ======================================================= */

  let assessmentResponses: unknown[] =
    [];

  if (latestAssessment?.id) {
    const {
      data: responses,
      error: responsesError,
    } = await supabase
      .from(
        "learner_assessment_responses",
      )
      .select(`
        id,
        assessment_id,
        question_id,
        answer_text,
        answer_values,
        other_value,
        created_at,
        assessment_questions (
          id,
          question_code,
          question_number,
          question_text,
          helper_text,
          question_type,
          adaptation_key
        )
      `)
      .eq(
        "assessment_id",
        latestAssessment.id,
      );

    if (responsesError) {
      console.error(
        "Unable to fetch learner assessment responses:",
        responsesError,
      );

      throw responsesError;
    }

    /*
      Sort using the nested question number.

      Supabase does not always return nested relation data in
      the exact order we want, so we sort it in Node.
    */
    assessmentResponses = (
      responses ?? []
    ).sort((a: any, b: any) => {
      const questionA =
        Array.isArray(
          a.assessment_questions,
        )
          ? a.assessment_questions[0]
          : a.assessment_questions;

      const questionB =
        Array.isArray(
          b.assessment_questions,
        )
          ? b.assessment_questions[0]
          : b.assessment_questions;

      return (
        (questionA?.question_number ??
          999) -
        (questionB?.question_number ??
          999)
      );
    });
  }

  /* =======================================================
     6. GET TRANSACTIONAL PROFILE
  ======================================================= */

  /*
    This is the learner's frequently-used adaptation profile.

    It contains summarized values such as:

    communication_level
    preferred_communication_method
    requires_visual_support
    tablet_assistance_level
    motivating_topics
    etc.
  */
  const {
    data: transactionalProfile,
    error: profileError,
  } = await supabase
    .from(
      "learner_transactional_profiles",
    )
    .select("*")
    .eq("learner_id", learnerId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Unable to fetch learner transactional profile:",
      profileError,
    );

    throw profileError;
  }

  /* =======================================================
     7. RETURN COMPLETE PROFILE
  ======================================================= */

  /*
    The frontend receives one clean object rather than
    having to call many endpoints for the initial learner
    profile page.
  */
  return {
    learner: {
      ...learner,

      /*
        This is temporary and safe to use in <img src="">.

        profile_picture_url remains the permanent Storage
        object path in the database.
      */
      profile_photo_url:
        profilePhotoUrl,
    },

    guardian,

    latestAssessment,

    assessmentResponses,

    transactionalProfile,
  };
}