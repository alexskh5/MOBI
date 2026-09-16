import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

export interface CreateCollaborationNoteInput {
  title: string;
  content: string;
  category?: string;
}


/* =========================================================
   VALIDATE LEARNER
========================================================= */

async function validateLearner(
  learnerId: string,
  centerId: string,
) {
  const {
    data: learner,
    error,
  } = await supabase
    .from("learners")
    .select("id")
    .eq("id", learnerId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!learner) {
    throw new Error(
      "Learner not found.",
    );
  }

  return learner;
}


/* =========================================================
   GET LEARNER COLLABORATION NOTES
========================================================= */

export async function getLearnerCollaborationNotesService(
  learnerId: string,
  centerId: string,
) {
  await validateLearner(
    learnerId,
    centerId,
  );

  const {
    data,
    error,
  } = await supabase
    .from("collaboration_notes")
    .select(`
      id,
      center_id,
      learner_id,
      sender_role,
      sender_doctor_id,
      sender_therapist_id,
      sender_name,
      category,
      title,
      content,
      created_at,
      updated_at
    `)
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (note) => ({
      id: note.id,
      learnerId:
        note.learner_id,

      doctorId:
        note.sender_doctor_id,

      therapistId:
        note.sender_therapist_id,

      category:
        note.category,

      title:
        note.title,

      createdAt:
        note.created_at,

      sender:
        note.sender_name,

      senderRole:
        note.sender_role,

      content:
        note.content,
    }),
  );
}


/* =========================================================
   CREATE CENTER PROGRESS NOTE
========================================================= */

export async function createCenterCollaborationNoteService(
  learnerId: string,
  centerId: string,
  input: CreateCollaborationNoteInput,
) {
  await validateLearner(
    learnerId,
    centerId,
  );

  const title =
    input.title.trim() ||
    "MOBI Session Note";

  const content =
    input.content.trim();

  if (!content) {
    throw new Error(
      "Progress note content is required.",
    );
  }

  const category =
    input.category?.trim() ||
    "MOBI Session";

  const {
    data,
    error,
  } = await supabase
    .from("collaboration_notes")
    .insert({
      center_id:
        centerId,

      learner_id:
        learnerId,

      sender_role:
        "center",

      sender_doctor_id:
        null,

      sender_therapist_id:
        null,

      sender_name:
        "Center Admin",

      category,

      title,

      content,
    })
    .select(`
      id,
      learner_id,
      sender_role,
      sender_doctor_id,
      sender_therapist_id,
      sender_name,
      category,
      title,
      content,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw error;
  }

  return {
    id:
      data.id,

    learnerId:
      data.learner_id,

    doctorId:
      data.sender_doctor_id,

    therapistId:
      data.sender_therapist_id,

    category:
      data.category,

    title:
      data.title,

    createdAt:
      data.created_at,

    sender:
      data.sender_name,

    senderRole:
      data.sender_role,

    content:
      data.content,
  };
}

/* =========================================================
   CREATE THERAPIST PROGRESS NOTE

   The Therapist must:
   - belong to the same Center
   - currently be assigned to the learner
========================================================= */

export async function createTherapistCollaborationNoteService(
  learnerId: string,
  centerId: string,
  therapistId: string,
  input: CreateCollaborationNoteInput,
) {
  await validateLearner(
    learnerId,
    centerId,
  );

  const {
    data: therapist,
    error: therapistError,
  } = await supabase
    .from("therapists")
    .select(`
      id,
      center_id,
      first_name,
      middle_name,
      last_name,
      account_status
    `)
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

  if (
    therapist.account_status ===
    "suspended"
  ) {
    throw new Error(
      "This Therapist account is suspended.",
    );
  }

  const {
    data: assignment,
    error: assignmentError,
  } = await supabase
    .from("learner_therapists")
    .select("id")
    .eq("learner_id", learnerId)
    .eq("therapist_id", therapistId)
    .eq("is_current", true)
    .maybeSingle();

  if (assignmentError) {
    throw assignmentError;
  }

  if (!assignment) {
    throw new Error(
      "You can only add collaboration notes for learners currently assigned to you.",
    );
  }

  const title =
    input.title.trim() ||
    "Therapy Session Note";

  const content =
    input.content.trim();

  if (!content) {
    throw new Error(
      "Progress note content is required.",
    );
  }

  const category =
    input.category?.trim() ||
    "Therapy Session";

  const therapistName = [
    therapist.first_name,
    therapist.middle_name,
    therapist.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const {
    data,
    error,
  } = await supabase
    .from("collaboration_notes")
    .insert({
      center_id:
        centerId,

      learner_id:
        learnerId,

      sender_role:
        "therapist",

      sender_doctor_id:
        null,

      sender_therapist_id:
        therapistId,

      sender_name:
        therapistName ||
        "Therapist",

      category,

      title,

      content,
    })
    .select(`
      id,
      learner_id,
      sender_role,
      sender_doctor_id,
      sender_therapist_id,
      sender_name,
      category,
      title,
      content,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw error;
  }

  return {
    id:
      data.id,

    learnerId:
      data.learner_id,

    doctorId:
      data.sender_doctor_id,

    therapistId:
      data.sender_therapist_id,

    category:
      data.category,

    title:
      data.title,

    createdAt:
      data.created_at,

    sender:
      data.sender_name,

    senderRole:
      data.sender_role,

    content:
      data.content,
  };
}

