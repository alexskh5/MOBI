import { supabase } from "../../config/supabase";

import {
  createLearnerPhotoSignedUrl,
} from "../learner/storageService";

export async function getDoctorPatientsService(
  doctorId: string,
  centerId: string,
) {
  /* =========================================================
     1. MAKE SURE DOCTOR BELONGS TO THIS CENTER
  ========================================================= */

  const {
    data: doctor,
    error: doctorError,
  } = await supabase
    .from("doctors")
    .select("id")
    .eq("id", doctorId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (doctorError) {
    throw doctorError;
  }

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  /* =========================================================
     2. GET CURRENT LEARNER ASSIGNMENTS
  ========================================================= */

  const {
    data: assignments,
    error: assignmentError,
  } = await supabase
    .from("learner_doctors")
    .select(`
      learner_id,
      collaboration_notes,
      assigned_at,
      is_current
    `)
    .eq("doctor_id", doctorId)
    .eq("is_current", true);

  if (assignmentError) {
    throw assignmentError;
  }

  if (!assignments?.length) {
    return [];
  }

  const learnerIds = [
    ...new Set(
      assignments.map(
        (assignment) =>
          assignment.learner_id,
      ),
    ),
  ];

  /* =========================================================
     3. GET REAL LEARNERS
  ========================================================= */

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
      profile_picture_url,
      enrollment_status
    `)
    .eq("center_id", centerId)
    .in("id", learnerIds);

  if (learnerError) {
    throw learnerError;
  }

  /* =========================================================
     4. GET SPEECH LADDER / TRANSACTIONAL PROFILE
  ========================================================= */

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
    .eq("center_id", centerId)
    .in("learner_id", learnerIds);

  if (profileError) {
    throw profileError;
  }

  /* =========================================================
     5. GET PRIMARY GUARDIANS
  ========================================================= */

  const {
    data: parentLinks,
    error: parentLinkError,
  } = await supabase
    .from("parent_learners")
    .select(`
      learner_id,
      parent_id,
      relationship
    `)
    .in("learner_id", learnerIds)
    .eq("is_primary_guardian", true);

  if (parentLinkError) {
    throw parentLinkError;
  }

  const parentIds = [
    ...new Set(
      (parentLinks ?? [])
        .map((link) => link.parent_id)
        .filter(Boolean),
    ),
  ];

  let parents: any[] = [];

  if (parentIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from("center_parents")
      .select(`
        id,
        first_name,
        middle_name,
        last_name
      `)
      .eq("center_id", centerId)
      .in("id", parentIds);

    if (error) {
      throw error;
    }

    parents = data ?? [];
  }

  /* =========================================================
     6. BUILD LOOKUP MAPS
  ========================================================= */

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

  const parentMap =
    new Map(
      parents.map(
        (parent) => [
          parent.id,
          parent,
        ],
      ),
    );

  const guardianLinkMap =
    new Map(
      (parentLinks ?? []).map(
        (link) => [
          link.learner_id,
          link,
        ],
      ),
    );

  /* =========================================================
     7. FRONTEND-FRIENDLY RESPONSE
  ========================================================= */

  return Promise.all(
    (learners ?? []).map(
      async (learner) => {
        const profile =
          profileMap.get(
            learner.id,
          );

        const assignment =
          assignmentMap.get(
            learner.id,
          );

        const guardianLink =
          guardianLinkMap.get(
            learner.id,
          );

        const guardian =
          guardianLink?.parent_id
            ? parentMap.get(
                guardianLink.parent_id,
              )
            : null;

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
              `Unable to create signed photo URL for learner ${learner.id}:`,
              error,
            );
          }
        }

        const guardianName =
          guardian
            ? [
                guardian.first_name,
                guardian.middle_name,
                guardian.last_name,
              ]
                .filter(Boolean)
                .join(" ")
            : null;

        return {
          id: learner.id,

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

          profilePhotoUrl,

          enrollmentStatus:
            learner.enrollment_status,

          currentSpeechLadder:
            profile?.current_speech_ladder ??
            null,

          suggestedSpeechLadder:
            profile?.suggested_speech_ladder ??
            null,

          therapistConfirmed:
            profile?.therapist_confirmed ??
            false,

          guardianName,

          guardianRelationship:
            guardianLink?.relationship ??
            null,

          collaborationNotes:
            assignment?.collaboration_notes ??
            null,

          assignedAt:
            assignment?.assigned_at ??
            null,
        };
      },
    ),
  );
}