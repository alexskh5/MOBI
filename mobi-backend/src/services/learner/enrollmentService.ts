// mobi-backend/src/services/learner/enrollmentService.ts

import {
  createLearner, updateLearnerProfilePicture
} from "./learnerService";

import {
    uploadLearnerProfilePhoto
} from "./storageService";

import {
  createParent,
  linkParentToLearner,
} from "./parentService";

import {
  createAssessment,
  findAssessmentTemplate,
  saveAssessmentResponses,
} from "./assessmentService";

import {
  buildTransactionalProfileData,
  createTransactionalProfile,
} from "./transactionalProfileService";

import { createDefaultLearnerAdaptationSettings,
} from "./adaptationSettingsService";

/* =========================================================
   TYPES
========================================================= */

interface EnrollmentPayload {
  learner: {
    firstName: string;
    middleName?: string | null;
    lastName: string;
    nickname?: string | null;
    birthDate: string;
    sexAtBirth: string;
    homeAddress?: string | null;
    schoolName?: string | null;
    gradeLevel?: string | null;
    learnerBio?: string | null;
  };

  guardian: {
    firstName: string;
    middleName?: string | null;
    lastName: string;
    relationship: string;
    phoneNumber?: string | null;
    email: string;
    homeAddress?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    authorizedForUpdates?: boolean;
  };

  learnerIntakeProfile: {
    templateCode: string;
    templateVersion: number;

    responses: {
      questionId: string;
      value: string | string[] | null;
      otherValue?: string | null;
    }[];

    preliminaryMeasurement?: {
      suggestedSpeechLadder?: string | null;
      attentionAreas?: unknown[];
    };

    status: string;
  };
}

interface EnrollLearnerServiceParams {
  payload: EnrollmentPayload;
  centerId: string;
  profilePhoto?: Express.Multer.File | null;
}

/* =========================================================
   ENROLL LEARNER SERVICE
========================================================= */

/*
  This service coordinates the complete learner enrollment.

  FLOW:

  1. Create learner
  2. Create guardian
  3. Link guardian to learner
  4. Find assessment template
  5. Create learner assessment
  6. Save assessment responses
  7. Create transactional profile

  The controller should only receive the HTTP request,
  validate the basic payload, call this service, and return
  the response.
*/
export async function enrollLearnerService({
  payload,
  centerId,
  profilePhoto,
}: EnrollLearnerServiceParams) {
  const learner =
    payload.learner;

  const guardian =
    payload.guardian;

  const intakeProfile =
    payload.learnerIntakeProfile;

  /* =====================================================
     1. CREATE LEARNER
  ===================================================== */

  const learnerData = {
    center_id:
      centerId,

    /*
      Temporary learner code generator.

      Later you can replace this with a dedicated generator.
    */
    learner_code:
      `LRN-${Date.now()}`,

    first_name:
      learner.firstName.trim(),

    middle_name:
      learner.middleName?.trim() ||
      null,

    last_name:
      learner.lastName.trim(),

    nickname:
      learner.nickname?.trim() ||
      null,

    birth_date:
      learner.birthDate,

    sex_at_birth:
      learner.sexAtBirth,

    home_address:
      learner.homeAddress?.trim() ||
      null,

    school_name:
      learner.schoolName?.trim() ||
      null,

    grade_level:
      learner.gradeLevel?.trim() ||
      null,

    learner_bio:
      learner.learnerBio?.trim() ||
      null,
  };

  const savedLearner =
    await createLearner(
      learnerData,
    );

    const adaptationSettings =
      await createDefaultLearnerAdaptationSettings(
        savedLearner.id,
        centerId,
      );

    /* =====================================================
   UPLOAD OPTIONAL PROFILE PHOTO
===================================================== */

/*
  The learner must exist first so we can organize the
  Storage object using the learner's UUID.

  If no photo was selected during enrollment, this entire
  block is skipped.
*/
let learnerWithPhoto =
  savedLearner;

if (profilePhoto) {
  /*
    Upload the actual file into the private Supabase
    Storage bucket.
  */
  const profilePhotoPath =
    await uploadLearnerProfilePhoto(
      profilePhoto,
      centerId,
      savedLearner.id,
    );

  /*
    Save the resulting Storage path in the learner record.
  */
  learnerWithPhoto =
    await updateLearnerProfilePicture(
      savedLearner.id,
      profilePhotoPath,
    );
}

  /* =====================================================
     2. CREATE GUARDIAN
  ===================================================== */

  const parentData = {
    center_id:
      centerId,

    first_name:
      guardian.firstName.trim(),

    middle_name:
      guardian.middleName?.trim() ||
      null,

    last_name:
      guardian.lastName.trim(),

    email:
      guardian.email
        .trim()
        .toLowerCase(),

    phone_number:
      guardian.phoneNumber?.trim() ||
      null,

    home_address:
      guardian.homeAddress?.trim() ||
      null,

    emergency_contact_name:
      guardian.emergencyContactName?.trim() ||
      null,

    emergency_contact_phone:
      guardian.emergencyContactPhone?.trim() ||
      null,

    authorized_for_updates:
      guardian.authorizedForUpdates ??
      true,
  };

  const savedParent =
    await createParent(
      parentData,
    );

  /* =====================================================
     3. LINK GUARDIAN TO LEARNER
  ===================================================== */

  const parentLearnerLink =
    await linkParentToLearner({
      parent_id:
        savedParent.id,

      learner_id:
        savedLearner.id,

      relationship:
        guardian.relationship,

      is_primary_guardian:
        true,

      can_view_progress:
        guardian.authorizedForUpdates ??
        true,

      can_guide_activities:
        true,
    });

  /* =====================================================
     4. FIND ASSESSMENT TEMPLATE
  ===================================================== */

  const assessmentTemplate =
    await findAssessmentTemplate(
      intakeProfile.templateCode,
      intakeProfile.templateVersion,
    );

  /* =====================================================
     5. CREATE LEARNER ASSESSMENT
  ===================================================== */

  const assessmentData = {
    learner_id:
      savedLearner.id,

    center_id:
      centerId,

    template_id:
      assessmentTemplate.id,

    status:
      intakeProfile.status,

    /*
      Store the backend-derived suggestion here later if
      you want one single source of truth.

      For now, this uses the current preliminary measurement.
    */
    suggested_speech_ladder:
      intakeProfile
        .preliminaryMeasurement
        ?.suggestedSpeechLadder ??
      null,

    therapist_confirmed_speech_ladder:
      null,

    reviewed_by:
      null,

    reviewed_at:
      null,

    notes:
      null,
  };

  const savedAssessment =
    await createAssessment(
      assessmentData,
    );

  /* =====================================================
     6. SAVE ALL ASSESSMENT RESPONSES
  ===================================================== */

  const savedAssessmentResponses =
    await saveAssessmentResponses(
      savedAssessment.id,
      assessmentTemplate.id,
      intakeProfile.responses,
    );

  /* =====================================================
     7. BUILD TRANSACTIONAL PROFILE
  ===================================================== */

  const transactionalProfileData =
    buildTransactionalProfileData(
      savedLearner.id,
      centerId,
      savedAssessment.id,
      intakeProfile.responses,
      intakeProfile
        .preliminaryMeasurement
        ?.attentionAreas ?? [],
    );

  /* =====================================================
     8. SAVE TRANSACTIONAL PROFILE
  ===================================================== */

  const savedTransactionalProfile =
    await createTransactionalProfile(
      transactionalProfileData,
    );

  /* =====================================================
     9. RETURN COMPLETE RESULT
  ===================================================== */

  return {
    learner:
      learnerWithPhoto,

    parent:
      savedParent,

    parentLearner:
      parentLearnerLink,

    assessment:
      savedAssessment,

    assessmentResponses:
      savedAssessmentResponses,

    transactionalProfile:
      savedTransactionalProfile,

    adaptationSettings,
  };
}