import { api } from "../api";

export type DoctorAccountStatus =
  | "not_invited"
  | "invited"
  | "active"
  | "suspended";

export interface DoctorRecord {
  id: string;
  center_id: string;
  auth_user_id: string | null;
  email: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  specialization: string | null;
  phone_number: string | null;
  profile_picture_url: string | null;
  bio: string | null;
  account_status: DoctorAccountStatus;
  access_code_sent_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}


export interface DoctorPatientRecord {
  id: string;
  learnerCode: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nickname: string | null;
  birthDate: string | null;
  profilePhotoUrl: string | null;
  enrollmentStatus: string | null;
  currentSpeechLadder: string | null;
  suggestedSpeechLadder: string | null;
  therapistConfirmed: boolean;
  guardianName: string | null;
  guardianRelationship: string | null;
  collaborationNotes: string | null;
  assignedAt: string | null;
}

export interface DoctorFormPayload {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  specialization: string;
  phoneNumber: string;
  bio: string;
}

export async function createDoctor(
  payload: DoctorFormPayload,
) {
  const response =
    await api.post(
      "/doctors",
      payload,
    );

  return response.data;
}

export async function getDoctors() {
  const response =
    await api.get(
      "/doctors",
    );

  return response.data;
}

export async function getDoctorById(
  doctorId: string,
) {
  const response =
    await api.get(
      `/doctors/${doctorId}`,
    );

  return response.data;
}


export async function getDoctorPatients(
  doctorId: string,
) {
  const response =
    await api.get(
      `/doctors/${doctorId}/patients`,
    );

  return response.data;
}

export async function updateDoctor(
  doctorId: string,
  payload: DoctorFormPayload,
) {
  const response =
    await api.patch(
      `/doctors/${doctorId}`,
      payload,
    );

  return response.data;
}

export async function sendDoctorAccessCode(
  doctorId: string,
) {
  const response =
    await api.post(
      `/doctors/${doctorId}/access-code`,
    );

  return response.data;
}

export async function deleteDoctor(
  doctorId: string,
) {
  const response =
    await api.delete(
      `/doctors/${doctorId}`,
    );

  return response.data;
}
