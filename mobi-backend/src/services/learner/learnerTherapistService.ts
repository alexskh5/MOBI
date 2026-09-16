import { supabase } from "../../config/supabase";


/* =========================================================
   GET CURRENT THERAPISTS OF A LEARNER
========================================================= */

export async function getLearnerTherapistsService(
  learnerId: string,
  centerId: string,
) {
  const {
    data: learner,
    error: learnerError,
  } = await supabase
    .from("learners")
    .select("id")
    .eq("id", learnerId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (learnerError) {
    throw learnerError;
  }

  if (!learner) {
    throw new Error("Learner not found.");
  }

  const {
    data: assignments,
    error: assignmentError,
  } = await supabase
    .from("learner_therapists")
    .select(`
      id,
      learner_id,
      therapist_id,
      collaboration_notes,
      is_current,
      assigned_at
    `)
    .eq("learner_id", learnerId)
    .eq("is_current", true);

  if (assignmentError) {
    throw assignmentError;
  }

  const therapistIds =
    (assignments ?? []).map(
      (assignment) =>
        assignment.therapist_id,
    );

  if (therapistIds.length === 0) {
    return [];
  }

  const {
    data: therapists,
    error: therapistsError,
  } = await supabase
    .from("therapists")
    .select(`
      id,
      first_name,
      middle_name,
      last_name,
      email,
      specialization,
      account_status
    `)
    .eq("center_id", centerId)
    .in("id", therapistIds);

  if (therapistsError) {
    throw therapistsError;
  }

  return therapists ?? [];
}


/* =========================================================
   ASSIGN THERAPISTS TO LEARNER
========================================================= */

export async function assignLearnerTherapistsService(
  learnerId: string,
  therapistIds: string[],
  centerId: string,
) {
  const {
    data: learner,
    error: learnerError,
  } = await supabase
    .from("learners")
    .select("id")
    .eq("id", learnerId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (learnerError) {
    throw learnerError;
  }

  if (!learner) {
    throw new Error("Learner not found.");
  }


  /* =======================================================
     VALIDATE THERAPISTS
  ======================================================= */

  if (therapistIds.length > 0) {
    const {
      data: validTherapists,
      error: therapistError,
    } = await supabase
      .from("therapists")
      .select("id")
      .eq("center_id", centerId)
      .in("id", therapistIds);

    if (therapistError) {
      throw therapistError;
    }

    if (
      (validTherapists ?? []).length !==
      therapistIds.length
    ) {
      throw new Error(
        "One or more therapists are invalid.",
      );
    }
  }


  /* =======================================================
     MARK OLD ASSIGNMENTS INACTIVE
  ======================================================= */

  const {
    error: deactivateError,
  } = await supabase
    .from("learner_therapists")
    .update({
      is_current: false,
    })
    .eq("learner_id", learnerId)
    .eq("is_current", true);

  if (deactivateError) {
    throw deactivateError;
  }


  /* =======================================================
     REACTIVATE OR INSERT SELECTED THERAPISTS
  ======================================================= */

  for (const therapistId of therapistIds) {
    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("learner_therapists")
      .select("id")
      .eq("learner_id", learnerId)
      .eq("therapist_id", therapistId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      const {
        error: updateError,
      } = await supabase
        .from("learner_therapists")
        .update({
          is_current: true,
          assigned_at:
            new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      const {
        error: insertError,
      } = await supabase
        .from("learner_therapists")
        .insert({
          learner_id: learnerId,
          therapist_id: therapistId,
          is_current: true,
        });

      if (insertError) {
        throw insertError;
      }
    }
  }


  /* =======================================================
     RETURN CURRENT THERAPISTS
  ======================================================= */

  return getLearnerTherapistsService(
    learnerId,
    centerId,
  );
}