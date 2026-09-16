import { api } from "../api";

/* =========================================================
   GET REAL LEARNERS
========================================================= */

export async function getCollaborationLearners() {
  const response = await api.get(
    "/learners",
    {
      params: {
        page: 1,
        limit: 100,
        sortBy: "first_name",
        sortOrder: "asc",
      },
    },
  );

  return response.data;
}


/* =========================================================
   GET REAL DOCTORS
========================================================= */

export async function getCollaborationDoctors() {
  const response = await api.get(
    "/doctors",
  );

  return response.data;
}


/* =========================================================
   GET CURRENT DOCTOR OF ONE LEARNER
========================================================= */

export async function getLearnerDoctor(
  learnerId: string,
) {
  const response = await api.get(
    `/learners/${learnerId}/doctor`,
  );

  return response.data;
}


/* =========================================================
   ASSIGN / CHANGE DOCTOR
========================================================= */

export async function assignLearnerDoctor(
  learnerId: string,
  doctorId: string,
) {
  const response = await api.put(
    `/learners/${learnerId}/doctor`,
    {
      doctorId,
    },
  );

  return response.data;
}

/* =========================================================
   GET REAL PROGRESS NOTES
========================================================= */

export async function getLearnerCollaborationNotes(
  learnerId: string,
) {
  const response = await api.get(
    `/learners/${learnerId}/notes`,
  );

  return response.data;
}


/* =========================================================
   ADD REAL PROGRESS NOTE
========================================================= */

export async function createLearnerCollaborationNote(
  learnerId: string,
  input: {
    title: string;
    content: string;
    category?: string;
  },
) {
  const response = await api.post(
    `/learners/${learnerId}/notes`,
    input,
  );

  return response.data;
}

/* =========================================================
   THERAPISTS
========================================================= */

export async function getCollaborationTherapists() {
  const response = await api.get(
    "/therapists",
  );

  return response.data;
}


/* =========================================================
   GET LEARNER THERAPISTS
========================================================= */

export async function getLearnerTherapists(
  learnerId: string,
) {
  const response = await api.get(
    `/learners/${learnerId}/therapists`,
  );

  return response.data;
}


/* =========================================================
   ASSIGN LEARNER THERAPISTS
========================================================= */

export async function assignLearnerTherapists(
  learnerId: string,
  therapistIds: string[],
) {
  const response = await api.put(
    `/learners/${learnerId}/therapists`,
    {
      therapistIds,
    },
  );

  return response.data;
}

/* =========================================================
   ADD REAL THERAPIST COLLABORATION NOTE
========================================================= */

export async function createTherapistCollaborationNote(
  therapistId: string,
  learnerId: string,
  input: {
    title: string;
    content: string;
    category?: string;
  },
) {
  const response = await api.post(
    `/therapists/${therapistId}/learners/${learnerId}/notes`,
    input,
  );

  return response.data;
}

