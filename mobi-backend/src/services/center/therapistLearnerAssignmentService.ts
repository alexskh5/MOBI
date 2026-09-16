import {
  supabaseAdmin,
} from "../../config/supabase";

export async function getTherapistLearnerAssignments({
  centerId,
  therapistId,
}: {
  centerId: string;
  therapistId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("learner_therapists")
    .select("learner_id")
    .eq("center_id", centerId)
    .eq("therapist_id", therapistId)
    .eq("is_current", true);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row: any) => row.learner_id)
    .filter(Boolean);
}

export async function listLearnersForTherapistAssignment({
  centerId,
  therapistId,
}: {
  centerId: string;
  therapistId: string;
}) {
  const [assignedLearnerIds, learnerResult] =
    await Promise.all([
      getTherapistLearnerAssignments({
        centerId,
        therapistId,
      }),
      supabaseAdmin
        .from("learners")
        .select(
          `
            id,
            learner_code,
            first_name,
            last_name,
            birth_date,
            sex_at_birth,
            enrollment_status,
            learner_transactional_profiles (
              current_speech_ladder,
              suggested_speech_ladder
            )
          `,
        )
        .eq("center_id", centerId)
        .eq("enrollment_status", "active")
        .order("last_name", { ascending: true })
        .order("first_name", { ascending: true }),
    ]);

  if (learnerResult.error) {
    throw learnerResult.error;
  }

  const assignedSet = new Set(assignedLearnerIds);

  const learners = (learnerResult.data ?? []).map((learner: any) => {
    const profile = Array.isArray(
      learner.learner_transactional_profiles,
    )
      ? learner.learner_transactional_profiles[0]
      : learner.learner_transactional_profiles;

    return {
      id: learner.id,
      learnerCode: learner.learner_code,
      firstName: learner.first_name,
      lastName: learner.last_name,
      birthDate: learner.birth_date,
      sexAtBirth: learner.sex_at_birth,
      level:
        profile?.current_speech_ladder ??
        profile?.suggested_speech_ladder ??
        null,
      assigned: assignedSet.has(learner.id),
    };
  });

  return {
    assignedLearnerIds,
    learners,
  };
}

export async function replaceTherapistLearnerAssignments({
  centerId,
  therapistId,
  learnerIds,
}: {
  centerId: string;
  therapistId: string;
  learnerIds: string[];
}) {
  const uniqueLearnerIds = Array.from(
    new Set(learnerIds.filter(Boolean)),
  );

  if (uniqueLearnerIds.length > 0) {
    const { data: validLearners, error: learnerError } =
      await supabaseAdmin
        .from("learners")
        .select("id")
        .eq("center_id", centerId)
        .eq("enrollment_status", "active")
        .in("id", uniqueLearnerIds);

    if (learnerError) {
      throw learnerError;
    }

    if ((validLearners ?? []).length !== uniqueLearnerIds.length) {
      throw new Error(
        "One or more selected learners are not active in this center.",
      );
    }
  }

  const { error: deactivateError } = await supabaseAdmin
    .from("learner_therapists")
    .update({
      is_current: false,
      unassigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("center_id", centerId)
    .eq("therapist_id", therapistId)
    .eq("is_current", true);

  if (deactivateError) {
    throw deactivateError;
  }

  if (uniqueLearnerIds.length > 0) {
    const now = new Date().toISOString();
    const rows = uniqueLearnerIds.map((learnerId) => ({
      center_id: centerId,
      therapist_id: therapistId,
      learner_id: learnerId,
      is_current: true,
      assigned_at: now,
      unassigned_at: null,
      updated_at: now,
    }));

    const { error: insertError } = await supabaseAdmin
      .from("learner_therapists")
      .insert(rows);

    if (insertError) {
      throw insertError;
    }
  }

  return listLearnersForTherapistAssignment({
    centerId,
    therapistId,
  });
}

export async function listLearnersForDoctor({
  centerId,
  doctorId,
}: {
  centerId: string;
  doctorId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("learner_doctors")
    .select(
      `
        learner_id,
        assigned_at,
        learners!inner (
          id,
          learner_code,
          first_name,
          last_name,
          birth_date,
          sex_at_birth,
          enrollment_status,
          learner_transactional_profiles (
            current_speech_ladder,
            suggested_speech_ladder
          )
        )
      `,
    )
    .eq("center_id", centerId)
    .eq("doctor_id", doctorId)
    .eq("is_current", true)
    .eq("learners.enrollment_status", "active")
    .order("assigned_at", { ascending: false });

  if (error) {
    const maybeMissingTable =
      error.code === "42P01" || error.code === "PGRST205";

    if (maybeMissingTable) {
      return {
        learners: [],
      };
    }

    throw error;
  }

  const learners = (data ?? []).map((row: any) => {
    const learner = Array.isArray(row.learners)
      ? row.learners[0]
      : row.learners;
    const profile = Array.isArray(
      learner?.learner_transactional_profiles,
    )
      ? learner.learner_transactional_profiles[0]
      : learner?.learner_transactional_profiles;

    return {
      id: learner.id,
      learnerCode: learner.learner_code,
      firstName: learner.first_name,
      lastName: learner.last_name,
      birthDate: learner.birth_date,
      sexAtBirth: learner.sex_at_birth,
      level:
        profile?.current_speech_ladder ??
        profile?.suggested_speech_ladder ??
        null,
      assignedAt: row.assigned_at,
    };
  });

  return {
    learners,
  };
}
