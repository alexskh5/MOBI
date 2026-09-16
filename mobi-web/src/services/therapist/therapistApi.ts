import { api } from "../api";


export interface TherapistLearnerRecord {
  id: string;
  learnerCode: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nickname: string | null;
  birthDate: string | null;
  sexAtBirth: string | null;
  profilePhotoUrl: string | null;
  enrollmentStatus: string | null;
  currentSpeechLadder: string | null;
  suggestedSpeechLadder: string | null;
  therapistConfirmed: boolean;
  collaborationNotes: string | null;
  assignedAt: string | null;
}

export interface CreateTherapistInput {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  specialization?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
}

export async function createTherapist(
  input: CreateTherapistInput,
) {
  const response = await api.post(
    "/therapists",
    input,
  );

  return response.data;
}

export async function getTherapists() {
  const response = await api.get(
    "/therapists",
  );

  return response.data;
}


/* =========================================================
   GET CURRENT LEARNERS ASSIGNED TO THERAPIST
========================================================= */

export async function getTherapistLearners(
  therapistId: string,
) {
  const response = await api.get(
    `/therapists/${therapistId}/learners`,
  );

  return response.data as {
    success: boolean;
    message: string;
    learners: TherapistLearnerRecord[];
  };
}

/* =========================================================
   GET THERAPIST BY ID
========================================================= */

export async function getTherapistById(
  therapistId: string,
) {
  const response = await api.get(
    `/therapists/${therapistId}`,
  );

  return response.data;
}


/* =========================================================
   UPDATE THERAPIST
========================================================= */

export async function updateTherapist(
  therapistId: string,
  input: CreateTherapistInput,
) {
  const response = await api.put(
    `/therapists/${therapistId}`,
    input,
  );

  return response.data;
}



/* =========================================================
   SEND / RESEND THERAPIST ACCESS CODE
========================================================= */

export async function sendTherapistAccessCode(
  therapistId: string,
) {
  const response = await api.post(
    `/therapists/${therapistId}/access-code`,
  );

  return response.data;
}


/* =========================================================
   DELETE THERAPIST
========================================================= */

export async function deleteTherapist(
  therapistId: string,
) {
  const response = await api.delete(
    `/therapists/${therapistId}`,
  );

  return response.data;
}