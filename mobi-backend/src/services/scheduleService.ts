import { supabaseAdmin } from "../config/supabase";

export type ScheduleStatus =
  | "pending"
  | "confirmed"
  | "edit_requested"
  | "declined"
  | "cancelled";

type ScheduleRow = {
  id: string;
  center_id: string;
  learner_id: string;
  therapist_id: string;
  schedule_date: string;
  start_time: string;
  duration_minutes: number;
  status: ScheduleStatus;
  notes: string | null;
  therapist_response_note: string | null;
  assigned_by_center_admin_id: string | null;
  created_at: string;
  updated_at: string;
};

type TherapistSummary = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  specialty?: string | null;
};

type LearnerSummary = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  learner_code?: string | null;
};

function normalizeTime(value: string) {
  return value.length === 5 ? `${value}:00` : value;
}

async function decorateSchedules(rows: ScheduleRow[]) {
  const therapistIds = Array.from(
    new Set(rows.map((row) => row.therapist_id).filter(Boolean)),
  );
  const learnerIds = Array.from(
    new Set(rows.map((row) => row.learner_id).filter(Boolean)),
  );

  const [therapistResult, learnerResult] = await Promise.all([
    therapistIds.length
      ? supabaseAdmin
          .from("therapists")
          .select("id, first_name, last_name, specialty")
          .in("id", therapistIds)
      : Promise.resolve({ data: [], error: null }),
    learnerIds.length
      ? supabaseAdmin
          .from("learners")
          .select("id, first_name, last_name, learner_code")
          .in("id", learnerIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (therapistResult.error) throw therapistResult.error;
  if (learnerResult.error) throw learnerResult.error;

  const therapistById = new Map<string, TherapistSummary>(
    (therapistResult.data ?? []).map((therapist: any) => [
      therapist.id,
      therapist as TherapistSummary,
    ]),
  );
  const learnerById = new Map<string, LearnerSummary>(
    (learnerResult.data ?? []).map((learner: any) => [
      learner.id,
      learner as LearnerSummary,
    ]),
  );

  return rows.map((row) => {
    const therapist = therapistById.get(row.therapist_id);
    const learner = learnerById.get(row.learner_id);

    return {
      id: row.id,
      centerId: row.center_id,
      learnerId: row.learner_id,
      learnerName: learner
        ? `${learner.first_name ?? ""} ${learner.last_name ?? ""}`.trim()
        : "Unknown learner",
      learnerCode: learner?.learner_code ?? null,
      therapistId: row.therapist_id,
      therapistName: therapist
        ? `${therapist.first_name ?? ""} ${therapist.last_name ?? ""}`.trim()
        : "Unknown therapist",
      therapistSpecialty: therapist?.specialty ?? "",
      dateKey: row.schedule_date,
      time: String(row.start_time).slice(0, 5),
      durationMinutes: row.duration_minutes,
      status: row.status,
      notes: row.notes ?? "",
      therapistResponseNote: row.therapist_response_note ?? "",
      assignedByCenterAdminId: row.assigned_by_center_admin_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function listCenterSchedules({
  centerId,
}: {
  centerId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("center_therapy_schedules")
    .select("*")
    .eq("center_id", centerId)
    .order("schedule_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return decorateSchedules((data ?? []) as ScheduleRow[]);
}

export async function listTherapistSchedules({
  centerId,
  therapistId,
}: {
  centerId: string;
  therapistId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("center_therapy_schedules")
    .select("*")
    .eq("center_id", centerId)
    .eq("therapist_id", therapistId)
    .order("schedule_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return decorateSchedules((data ?? []) as ScheduleRow[]);
}

export async function upsertCenterSchedule({
  centerId,
  actorId,
  scheduleId,
  payload,
}: {
  centerId: string;
  actorId: string;
  scheduleId?: string;
  payload: any;
}) {
  const row = {
    center_id: centerId,
    learner_id: payload.learnerId,
    therapist_id: payload.therapistId,
    schedule_date: payload.dateKey,
    start_time: normalizeTime(payload.time),
    duration_minutes: Number(payload.durationMinutes ?? 45),
    status: "pending" as ScheduleStatus,
    notes: payload.notes ?? null,
    therapist_response_note: null,
    assigned_by_center_admin_id: actorId,
    responded_at: null,
    updated_at: new Date().toISOString(),
  };

  const query = scheduleId
    ? supabaseAdmin
        .from("center_therapy_schedules")
        .update(row)
        .eq("id", scheduleId)
        .eq("center_id", centerId)
    : supabaseAdmin.from("center_therapy_schedules").insert(row);

  const { data, error } = await query.select("*").single();

  if (error) throw error;
  const [schedule] = await decorateSchedules([data as ScheduleRow]);
  return schedule;
}

export async function cancelCenterSchedule({
  centerId,
  scheduleId,
}: {
  centerId: string;
  scheduleId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("center_therapy_schedules")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", scheduleId)
    .eq("center_id", centerId)
    .select("*")
    .single();

  if (error) throw error;
  const [schedule] = await decorateSchedules([data as ScheduleRow]);
  return schedule;
}

export async function respondToTherapistSchedule({
  centerId,
  therapistId,
  scheduleId,
  status,
  note,
}: {
  centerId: string;
  therapistId: string;
  scheduleId: string;
  status: Extract<
    ScheduleStatus,
    "confirmed" | "edit_requested" | "declined"
  >;
  note?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("center_therapy_schedules")
    .update({
      status,
      therapist_response_note: note ?? null,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", scheduleId)
    .eq("center_id", centerId)
    .eq("therapist_id", therapistId)
    .eq("status", "pending")
    .select("*")
    .single();

  if (error) throw error;
  const [schedule] = await decorateSchedules([data as ScheduleRow]);
  return schedule;
}
