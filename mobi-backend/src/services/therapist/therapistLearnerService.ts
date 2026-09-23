import { supabase } from "../../config/supabase";

import {
  createLearnerPhotoSignedUrl,
} from "../learner/storageService";

/* =========================================================
   GET LEARNERS ASSIGNED TO ONE THERAPIST
========================================================= */

export async function getTherapistLearnersService(
  therapistId: string,
  centerId: string,
) {
  /* =======================================================
     1. VERIFY THERAPIST BELONGS TO THIS CENTER
  ======================================================= */

  const {
    data: therapist,
    error: therapistError,
  } = await supabase
    .from("therapists")
    .select("id")
    .eq("id", therapistId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (therapistError) {
    throw therapistError;
  }

  if (!therapist) {
    throw new Error(
      "Therapist not found.",
    );
  }

  /* =======================================================
     2. GET CURRENT LEARNER ASSIGNMENTS
  ======================================================= */

  const {
    data: assignments,
    error: assignmentError,
  } = await supabase
    .from("learner_therapists")
    .select(`
      learner_id,
      collaboration_notes,
      assigned_at,
      is_current
    `)
    .eq(
      "therapist_id",
      therapistId,
    )
    .eq(
      "is_current",
      true,
    );

  if (assignmentError) {
    throw assignmentError;
  }

  if (!assignments?.length) {
    return [];
  }

  const learnerIds = [
    ...new Set(
      assignments
        .map(
          (assignment) =>
            assignment.learner_id,
        )
        .filter(Boolean),
    ),
  ];

  if (!learnerIds.length) {
    return [];
  }

  /* =======================================================
     3. GET REAL LEARNERS
  ======================================================= */

  const {
    data: learners,
    error: learnerError,
  } = await supabase
    .from("learners")
    .select(`
      id,
      learner_code,
      first_name,
      middle_name,
      last_name,
      nickname,
      birth_date,
      sex_at_birth,
      profile_picture_url,
      enrollment_status
    `)
    .eq(
      "center_id",
      centerId,
    )
    .in(
      "id",
      learnerIds,
    )
    .eq(
      "enrollment_status",
      "active",
    );

  if (learnerError) {
    throw learnerError;
  }

  if (!learners?.length) {
    return [];
  }

  /* =======================================================
     4. GET CURRENT SPEECH LADDER STATE
  ======================================================= */

  const {
    data: profiles,
    error: profileError,
  } = await supabase
    .from(
      "learner_transactional_profiles",
    )
    .select(`
      learner_id,
      current_speech_ladder,
      suggested_speech_ladder,
      therapist_confirmed
    `)
    .eq(
      "center_id",
      centerId,
    )
    .in(
      "learner_id",
      learnerIds,
    );

  if (profileError) {
    throw profileError;
  }

  const profileMap =
    new Map(
      (profiles ?? []).map(
        (profile) => [
          profile.learner_id,
          profile,
        ],
      ),
    );

  const assignmentMap =
    new Map(
      assignments.map(
        (assignment) => [
          assignment.learner_id,
          assignment,
        ],
      ),
    );

  /* =======================================================
     5. BUILD FRONTEND-FRIENDLY RESPONSE
  ======================================================= */

  return Promise.all(
    learners.map(
      async (learner) => {
        const profile =
          profileMap.get(
            learner.id,
          );

        const assignment =
          assignmentMap.get(
            learner.id,
          );

        let profilePhotoUrl:
          | string
          | null = null;

        if (
          learner.profile_picture_url
        ) {
          try {
            profilePhotoUrl =
              await createLearnerPhotoSignedUrl(
                learner.profile_picture_url,
              );
          } catch (error) {
            console.error(
              `Unable to create signed photo URL for therapist learner ${learner.id}:`,
              error,
            );
          }
        }

        return {
          id:
            learner.id,

          learnerCode:
            learner.learner_code,

          firstName:
            learner.first_name,

          middleName:
            learner.middle_name,

          lastName:
            learner.last_name,

          nickname:
            learner.nickname,

          birthDate:
            learner.birth_date,

          sexAtBirth:
            learner.sex_at_birth,

          profilePhotoUrl,

          enrollmentStatus:
            learner.enrollment_status,

          currentSpeechLadder:
            profile
              ?.current_speech_ladder ??
            null,

          suggestedSpeechLadder:
            profile
              ?.suggested_speech_ladder ??
            null,

          therapistConfirmed:
            profile
              ?.therapist_confirmed ??
            false,

          collaborationNotes:
            assignment
              ?.collaboration_notes ??
            null,

          assignedAt:
            assignment
              ?.assigned_at ??
            null,
        };
      },
    ),
  );
}
