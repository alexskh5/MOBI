import { supabase } from "../../config/supabase";

/* =========================================================
   GET CURRENT DOCTOR OF ONE LEARNER
========================================================= */

export async function getLearnerDoctorService(
  learnerId: string,
  centerId: string,
) {
  // Make sure learner belongs to the current center
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
    data: assignment,
    error: assignmentError,
  } = await supabase
    .from("learner_doctors")
    .select(`
      id,
      learner_id,
      doctor_id,
      external_doctor_name,
      collaboration_notes,
      is_current,
      assigned_at
    `)
    .eq("learner_id", learnerId)
    .eq("is_current", true)
    .maybeSingle();

  if (assignmentError) {
    throw assignmentError;
  }

  if (!assignment?.doctor_id) {
    return null;
  }

  const {
    data: doctor,
    error: doctorError,
  } = await supabase
    .from("doctors")
    .select(`
      id,
      first_name,
      middle_name,
      last_name,
      specialization,
      email,
      account_status
    `)
    .eq("id", assignment.doctor_id)
    .eq("center_id", centerId)
    .maybeSingle();

  if (doctorError) {
    throw doctorError;
  }

  if (!doctor) {
    return null;
  }

  return {
    assignmentId: assignment.id,
    learnerId: assignment.learner_id,
    assignedAt: assignment.assigned_at,

    doctor: {
      id: doctor.id,
      firstName: doctor.first_name,
      middleName: doctor.middle_name,
      lastName: doctor.last_name,
      specialization: doctor.specialization,
      email: doctor.email,
      accountStatus: doctor.account_status,
    },
  };
}


/* =========================================================
   ASSIGN / CHANGE DOCTOR
========================================================= */

export async function assignLearnerDoctorService(
  learnerId: string,
  doctorId: string,
  centerId: string,
) {
  /* ---------------------------------------------------------
     1. Validate learner
  --------------------------------------------------------- */

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

  /* ---------------------------------------------------------
     2. Validate doctor
  --------------------------------------------------------- */

  const {
    data: doctor,
    error: doctorError,
  } = await supabase
    .from("doctors")
    .select(`
      id,
      first_name,
      middle_name,
      last_name,
      specialization,
      email,
      account_status
    `)
    .eq("id", doctorId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (doctorError) {
    throw doctorError;
  }

  if (!doctor) {
    throw new Error("Doctor not found.");
  }

  /* ---------------------------------------------------------
     3. Mark previous current doctor as no longer current
  --------------------------------------------------------- */

  const {
    error: deactivateError,
  } = await supabase
    .from("learner_doctors")
    .update({
      is_current: false,
    })
    .eq("learner_id", learnerId)
    .eq("is_current", true);

  if (deactivateError) {
    throw deactivateError;
  }

  /* ---------------------------------------------------------
     4. Check if this learner-doctor relationship exists
  --------------------------------------------------------- */

  const {
    data: existingAssignment,
    error: existingError,
  } = await supabase
    .from("learner_doctors")
    .select("id")
    .eq("learner_id", learnerId)
    .eq("doctor_id", doctorId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  let assignment;

  if (existingAssignment) {
    const {
      data,
      error,
    } = await supabase
      .from("learner_doctors")
      .update({
        is_current: true,
        assigned_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        existingAssignment.id,
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    assignment = data;
  } else {
    const {
      data,
      error,
    } = await supabase
      .from("learner_doctors")
      .insert({
        learner_id: learnerId,
        doctor_id: doctorId,
        external_doctor_name: null,
        collaboration_notes: null,
        is_current: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    assignment = data;
  }

  return {
    assignment,

    doctor: {
      id: doctor.id,
      firstName: doctor.first_name,
      middleName: doctor.middle_name,
      lastName: doctor.last_name,
      specialization: doctor.specialization,
      email: doctor.email,
      accountStatus: doctor.account_status,
    },
  };
}