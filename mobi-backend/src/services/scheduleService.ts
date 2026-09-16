// MOBI/mobi-backend/src/services/scheduleService.ts

import { supabase } from "../config/supabase";

export type SessionType =
  | "speech_training"
  | "social_readiness";

export type DeliveryMode =
  | "clinic"
  | "home";

export type ScheduleStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled";

export type ScheduleCreatorRole =
  | "center_admin"
  | "therapist"
  | "system";

export type CreateScheduleInput = {
  centerId: string;
  learnerId: string;
  therapistId?: string | null;

  sessionType: SessionType;
  deliveryMode: DeliveryMode;

  scheduledStart: string;
  scheduledEnd: string;

  notes?: string | null;

  createdByRole: ScheduleCreatorRole;
  createdById?: string | null;

  fallbackFromSessionId?: string | null;
};

export class ScheduleServiceError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400
  ) {
    super(message);
    this.name = "ScheduleServiceError";
    this.statusCode = statusCode;
  }
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const ensureValidDateRange = (
  scheduledStart: string,
  scheduledEnd: string
) => {
  const start = new Date(scheduledStart);
  const end = new Date(scheduledEnd);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new ScheduleServiceError(
      "Invalid schedule date or time."
    );
  }

  if (end <= start) {
    throw new ScheduleServiceError(
      "Session end time must be after the start time."
    );
  }

  return {
    start,
    end,
  };
};

const verifyLearner = async (
  centerId: string,
  learnerId: string
) => {
  const { data, error } = await supabase
    .from("learners")
    .select("id, center_id")
    .eq("id", learnerId)
    .maybeSingle();

  if (error) {
    throw new ScheduleServiceError(
      error.message,
      500
    );
  }

  if (!data) {
    throw new ScheduleServiceError(
      "Learner not found.",
      404
    );
  }

  if (data.center_id !== centerId) {
    throw new ScheduleServiceError(
      "The learner does not belong to this center.",
      403
    );
  }

  return data;
};

const verifyTherapist = async (
  centerId: string,
  therapistId: string
) => {
  const { data, error } = await supabase
    .from("therapists")
    .select(
      "id, center_id, account_status"
    )
    .eq("id", therapistId)
    .maybeSingle();

  if (error) {
    throw new ScheduleServiceError(
      error.message,
      500
    );
  }

  if (!data) {
    throw new ScheduleServiceError(
      "Therapist not found.",
      404
    );
  }

  if (data.center_id !== centerId) {
    throw new ScheduleServiceError(
      "The therapist does not belong to this center.",
      403
    );
  }

  if (data.account_status === "suspended") {
    throw new ScheduleServiceError(
      "This therapist account is suspended."
    );
  }

  return data;
};

const verifyLearnerTherapistAssignment =
  async (
    learnerId: string,
    therapistId: string
  ) => {
    const { data, error } = await supabase
      .from("learner_therapists")
      .select("id")
      .eq("learner_id", learnerId)
      .eq("therapist_id", therapistId)
      .eq("is_current", true)
      .maybeSingle();

    if (error) {
      throw new ScheduleServiceError(
        error.message,
        500
      );
    }

    if (!data) {
      throw new ScheduleServiceError(
        "This therapist is not currently assigned to the learner."
      );
    }
  };

const checkScheduleConflicts = async ({
  centerId,
  learnerId,
  therapistId,
  deliveryMode,
  scheduledStart,
  scheduledEnd,
  excludeScheduleId,
}: {
  centerId: string;
  learnerId: string;
  therapistId?: string | null;
  deliveryMode: DeliveryMode;
  scheduledStart: string;
  scheduledEnd: string;
  excludeScheduleId?: string;
}) => {
  let query = supabase
    .from("scheduled_sessions")
    .select(
      `
      id,
      learner_id,
      therapist_id,
      delivery_mode,
      scheduled_start,
      scheduled_end,
      status
      `
    )
    .eq("center_id", centerId)
    .neq("status", "cancelled")
    .lt(
      "scheduled_start",
      scheduledEnd
    )
    .gt(
      "scheduled_end",
      scheduledStart
    );

  if (excludeScheduleId) {
    query = query.neq(
      "id",
      excludeScheduleId
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new ScheduleServiceError(
      error.message,
      500
    );
  }

  const schedules = data ?? [];

  /*
   * Learner conflict:
   * A learner should not have two active
   * scheduled sessions at the same time.
   */
  const learnerConflict =
    schedules.find(
      (schedule) =>
        schedule.learner_id === learnerId
    );

  if (learnerConflict) {
    throw new ScheduleServiceError(
      "The learner already has another session during this time."
    );
  }

  /*
   * Therapist conflict:
   *
   * Only CLINIC sessions reserve the
   * therapist's appointment time.
   *
   * Home Practice does not block the
   * therapist's clinic schedule.
   */
  if (
    deliveryMode === "clinic" &&
    therapistId
  ) {
    const therapistConflict =
      schedules.find(
        (schedule) =>
          schedule.therapist_id ===
            therapistId &&
          schedule.delivery_mode ===
            "clinic"
      );

    if (therapistConflict) {
      throw new ScheduleServiceError(
        "The therapist already has another clinic session during this time."
      );
    }
  }
};

/*
|--------------------------------------------------------------------------
| CENTER: View schedules
|--------------------------------------------------------------------------
*/

export const getCenterSchedulesService =
  async (
    centerId: string,
    start?: string,
    end?: string
  ) => {
    let query = supabase
      .from("scheduled_sessions")
      .select("*")
      .eq("center_id", centerId)
      .order(
        "scheduled_start",
        { ascending: true }
      );

    if (start) {
      query = query.gte(
        "scheduled_start",
        start
      );
    }

    if (end) {
      query = query.lte(
        "scheduled_start",
        end
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new ScheduleServiceError(
        error.message,
        500
      );
    }

    return data ?? [];
  };

/*
|--------------------------------------------------------------------------
| THERAPIST: View assigned schedules
|--------------------------------------------------------------------------
*/

export const getTherapistSchedulesService =
  async (
    therapistId: string,
    start?: string,
    end?: string
  ) => {
    let query = supabase
      .from("scheduled_sessions")
      .select("*")
      .eq(
        "therapist_id",
        therapistId
      )
      .order(
        "scheduled_start",
        { ascending: true }
      );

    if (start) {
      query = query.gte(
        "scheduled_start",
        start
      );
    }

    if (end) {
      query = query.lte(
        "scheduled_start",
        end
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new ScheduleServiceError(
        error.message,
        500
      );
    }

    return data ?? [];
  };

/*
|--------------------------------------------------------------------------
| Create schedule
|--------------------------------------------------------------------------
*/

export const createScheduleService =
  async (
    input: CreateScheduleInput
  ) => {
    const {
      centerId,
      learnerId,
      therapistId = null,
      sessionType,
      deliveryMode,
      scheduledStart,
      scheduledEnd,
      notes = null,
      createdByRole,
      createdById = null,
      fallbackFromSessionId = null,
    } = input;

    if (
      ![
        "speech_training",
        "social_readiness",
      ].includes(sessionType)
    ) {
      throw new ScheduleServiceError(
        "Invalid session type."
      );
    }

    if (
      !["clinic", "home"].includes(
        deliveryMode
      )
    ) {
      throw new ScheduleServiceError(
        "Invalid delivery mode."
      );
    }

    if (
      ![
        "center_admin",
        "therapist",
        "system",
      ].includes(createdByRole)
    ) {
      throw new ScheduleServiceError(
        "Invalid schedule creator role."
      );
    }

    ensureValidDateRange(
      scheduledStart,
      scheduledEnd
    );

    /*
     * Therapist-created schedules are
     * allowed only for Home Practice.
     *
     * Clinic scheduling remains controlled
     * by the Center.
     */
    if (
      createdByRole === "therapist" &&
      deliveryMode === "clinic"
    ) {
      throw new ScheduleServiceError(
        "Therapists cannot directly create clinic appointments."
      );
    }

    /*
     * Clinic session must always have
     * an assigned therapist.
     */
    if (
      deliveryMode === "clinic" &&
      !therapistId
    ) {
      throw new ScheduleServiceError(
        "A clinic session requires an assigned therapist."
      );
    }

    await verifyLearner(
      centerId,
      learnerId
    );

    /*
     * If a therapist is included,
     * verify the real staff record and
     * current learner assignment.
     */
    if (therapistId) {
      await verifyTherapist(
        centerId,
        therapistId
      );

      await verifyLearnerTherapistAssignment(
        learnerId,
        therapistId
      );
    }

    await checkScheduleConflicts({
      centerId,
      learnerId,
      therapistId,
      deliveryMode,
      scheduledStart,
      scheduledEnd,
    });

    /*
     * Clinic:
     * Therapist + Guardian need to respond.
     *
     * Home Practice:
     * No therapist appointment approval
     * is required.
     */
    const therapistResponse =
      deliveryMode === "clinic"
        ? "pending"
        : "not_required";

    const guardianResponse =
      deliveryMode === "clinic"
        ? "pending"
        : "not_required";

    const status: ScheduleStatus =
      deliveryMode === "clinic"
        ? "scheduled"
        : "confirmed";

    const { data, error } =
      await supabase
        .from("scheduled_sessions")
        .insert({
          center_id: centerId,
          learner_id: learnerId,
          therapist_id: therapistId,

          session_type: sessionType,
          delivery_mode: deliveryMode,

          scheduled_start:
            scheduledStart,
          scheduled_end:
            scheduledEnd,

          status,

          therapist_response:
            therapistResponse,
          guardian_response:
            guardianResponse,

          home_fallback_selected:
            Boolean(
              fallbackFromSessionId
            ),

          fallback_from_session_id:
            fallbackFromSessionId,

          notes,

          created_by_role:
            createdByRole,
          created_by_id:
            createdById,
        })
        .select()
        .single();

    if (error) {
      throw new ScheduleServiceError(
        error.message,
        500
      );
    }

    return data;
  };

/*
|--------------------------------------------------------------------------
| Cancel schedule
|--------------------------------------------------------------------------
*/

export const cancelScheduleService =
  async (
    scheduleId: string,
    centerId: string,
    reason?: string
  ) => {
    const { data: existing, error } =
      await supabase
        .from("scheduled_sessions")
        .select(
          "id, center_id, status"
        )
        .eq("id", scheduleId)
        .maybeSingle();

    if (error) {
      throw new ScheduleServiceError(
        error.message,
        500
      );
    }

    if (!existing) {
      throw new ScheduleServiceError(
        "Schedule not found.",
        404
      );
    }

    if (
      existing.center_id !== centerId
    ) {
      throw new ScheduleServiceError(
        "You cannot modify a schedule from another center.",
        403
      );
    }

    if (
      existing.status === "completed"
    ) {
      throw new ScheduleServiceError(
        "A completed session cannot be cancelled."
      );
    }

    if (
      existing.status === "cancelled"
    ) {
      throw new ScheduleServiceError(
        "This session is already cancelled."
      );
    }

    const now =
      new Date().toISOString();

    const { data, error: updateError } =
      await supabase
        .from("scheduled_sessions")
        .update({
          status: "cancelled",
          cancellation_reason:
            reason?.trim() ||
            "Cancelled by center",
          cancelled_at: now,
          updated_at: now,
        })
        .eq("id", scheduleId)
        .select()
        .single();

    if (updateError) {
      throw new ScheduleServiceError(
        updateError.message,
        500
      );
    }

    return data;
  };

/*
|--------------------------------------------------------------------------
| THERAPIST: Confirm assigned clinic session
|--------------------------------------------------------------------------
*/

export const confirmTherapistScheduleService =
  async (
    scheduleId: string,
    therapistId: string
  ) => {
    const { data: schedule, error } =
      await supabase
        .from("scheduled_sessions")
        .select(`
          id,
          therapist_id,
          delivery_mode,
          status,
          therapist_response,
          guardian_response
        `)
        .eq("id", scheduleId)
        .maybeSingle();

    if (error) {
      throw new ScheduleServiceError(
        error.message,
        500
      );
    }

    if (!schedule) {
      throw new ScheduleServiceError(
        "Schedule not found.",
        404
      );
    }

    if (
      schedule.therapist_id !== therapistId
    ) {
      throw new ScheduleServiceError(
        "This session is not assigned to this therapist.",
        403
      );
    }

    if (
      schedule.delivery_mode !== "clinic"
    ) {
      throw new ScheduleServiceError(
        "Home practice does not require therapist confirmation."
      );
    }

    if (
      schedule.status === "cancelled"
    ) {
      throw new ScheduleServiceError(
        "A cancelled session cannot be confirmed."
      );
    }

    if (
      schedule.status === "completed"
    ) {
      throw new ScheduleServiceError(
        "A completed session cannot be confirmed."
      );
    }

    if (
      schedule.therapist_response ===
      "confirmed"
    ) {
      throw new ScheduleServiceError(
        "This session is already confirmed by the therapist."
      );
    }

    const now =
      new Date().toISOString();

    /*
     * Overall schedule becomes confirmed only
     * when BOTH Therapist and Guardian have
     * confirmed.
     */
    const nextStatus =
      schedule.guardian_response ===
      "confirmed"
        ? "confirmed"
        : schedule.status;

    const { data, error: updateError } =
      await supabase
        .from("scheduled_sessions")
        .update({
          therapist_response:
            "confirmed",
          therapist_responded_at: now,
          status: nextStatus,
          updated_at: now,
        })
        .eq("id", scheduleId)
        .select()
        .single();

    if (updateError) {
      throw new ScheduleServiceError(
        updateError.message,
        500
      );
    }

    return data;
  };

/*
|--------------------------------------------------------------------------
| THERAPIST: Request reschedule
|--------------------------------------------------------------------------
*/

export const requestScheduleRescheduleService =
  async ({
    scheduleId,
    therapistId,
    reason,
    proposedStart,
    proposedEnd,
  }: {
    scheduleId: string;
    therapistId: string;
    reason: string;
    proposedStart?: string | null;
    proposedEnd?: string | null;
  }) => {
    const cleanReason = reason.trim();

    if (!cleanReason) {
      throw new ScheduleServiceError(
        "Please provide a reason for the reschedule request."
      );
    }

    /*
     * If Therapist proposes a new time,
     * both start and end must be provided.
     */
    if (
      Boolean(proposedStart) !==
      Boolean(proposedEnd)
    ) {
      throw new ScheduleServiceError(
        "Please provide both proposed start and end time."
      );
    }

    if (
      proposedStart &&
      proposedEnd
    ) {
      ensureValidDateRange(
        proposedStart,
        proposedEnd
      );
    }

    const { data: schedule, error } =
      await supabase
        .from("scheduled_sessions")
        .select(`
          id,
          therapist_id,
          delivery_mode,
          status,
          therapist_response
        `)
        .eq("id", scheduleId)
        .maybeSingle();

    if (error) {
      throw new ScheduleServiceError(
        error.message,
        500
      );
    }

    if (!schedule) {
      throw new ScheduleServiceError(
        "Schedule not found.",
        404
      );
    }

    if (
      schedule.therapist_id !==
      therapistId
    ) {
      throw new ScheduleServiceError(
        "This session is not assigned to this therapist.",
        403
      );
    }

    if (
      schedule.delivery_mode !== "clinic"
    ) {
      throw new ScheduleServiceError(
        "Home practice does not require clinic rescheduling."
      );
    }

    if (
      schedule.status === "cancelled"
    ) {
      throw new ScheduleServiceError(
        "A cancelled session cannot be rescheduled."
      );
    }

    if (
      schedule.status === "completed"
    ) {
      throw new ScheduleServiceError(
        "A completed session cannot be rescheduled."
      );
    }

    /*
     * Check if this session already has
     * a pending request.
     */
    const {
      data: existingRequest,
      error: existingRequestError,
    } = await supabase
      .from(
        "schedule_reschedule_requests"
      )
      .select("id")
      .eq(
        "scheduled_session_id",
        scheduleId
      )
      .eq("status", "pending")
      .maybeSingle();

    if (existingRequestError) {
      throw new ScheduleServiceError(
        existingRequestError.message,
        500
      );
    }

    if (existingRequest) {
      throw new ScheduleServiceError(
        "A reschedule request is already pending for this session."
      );
    }

    /*
     * Create separate history record.
     */
    const {
      data: request,
      error: requestError,
    } = await supabase
      .from(
        "schedule_reschedule_requests"
      )
      .insert({
        scheduled_session_id:
          scheduleId,

        requested_by_therapist_id:
          therapistId,

        reason: cleanReason,

        proposed_start:
          proposedStart || null,

        proposed_end:
          proposedEnd || null,

        status: "pending",
      })
      .select()
      .single();

    if (requestError) {
      throw new ScheduleServiceError(
        requestError.message,
        500
      );
    }

    const now =
      new Date().toISOString();

    const {
      data: updatedSchedule,
      error: updateError,
    } = await supabase
      .from("scheduled_sessions")
      .update({
        therapist_response:
          "reschedule_requested",

        therapist_responded_at:
          now,

        updated_at: now,
      })
      .eq("id", scheduleId)
      .select()
      .single();

    if (updateError) {
      /*
       * Clean up the request if updating
       * the actual schedule failed.
       */
      await supabase
        .from(
          "schedule_reschedule_requests"
        )
        .delete()
        .eq("id", request.id);

      throw new ScheduleServiceError(
        updateError.message,
        500
      );
    }

    return {
      schedule: updatedSchedule,
      rescheduleRequest: request,
    };
  };

  /*
|--------------------------------------------------------------------------
| CENTER: Approve therapist reschedule request
|--------------------------------------------------------------------------
*/

export const approveRescheduleRequestService =
  async ({
    requestId,
    centerId,
    reviewedById = null,
    responseNote = null,
  }: {
    requestId: string;
    centerId: string;
    reviewedById?: string | null;
    responseNote?: string | null;
  }) => {
    /*
     * Get the pending request first.
     */
    const { data: request, error } =
      await supabase
        .from("schedule_reschedule_requests")
        .select(`
          id,
          scheduled_session_id,
          proposed_start,
          proposed_end,
          status
        `)
        .eq("id", requestId)
        .maybeSingle();

    if (error) {
      throw new ScheduleServiceError(
        error.message,
        500
      );
    }

    if (!request) {
      throw new ScheduleServiceError(
        "Reschedule request not found.",
        404
      );
    }

    if (request.status !== "pending") {
      throw new ScheduleServiceError(
        "This reschedule request has already been reviewed."
      );
    }

    /*
     * For approval, the Therapist must have
     * proposed an actual replacement time.
     */
    if (
      !request.proposed_start ||
      !request.proposed_end
    ) {
      throw new ScheduleServiceError(
        "This request does not contain a proposed schedule."
      );
    }

    ensureValidDateRange(
      request.proposed_start,
      request.proposed_end
    );

    /*
     * Get the original session.
     */
    const {
      data: schedule,
      error: scheduleError,
    } = await supabase
      .from("scheduled_sessions")
      .select(`
        id,
        center_id,
        learner_id,
        therapist_id,
        delivery_mode,
        scheduled_start,
        scheduled_end,
        status
      `)
      .eq(
        "id",
        request.scheduled_session_id
      )
      .maybeSingle();

    if (scheduleError) {
      throw new ScheduleServiceError(
        scheduleError.message,
        500
      );
    }

    if (!schedule) {
      throw new ScheduleServiceError(
        "Scheduled session not found.",
        404
      );
    }

    if (schedule.center_id !== centerId) {
      throw new ScheduleServiceError(
        "You cannot review a request from another center.",
        403
      );
    }

    if (schedule.status === "cancelled") {
      throw new ScheduleServiceError(
        "A cancelled session cannot be rescheduled."
      );
    }

    if (schedule.status === "completed") {
      throw new ScheduleServiceError(
        "A completed session cannot be rescheduled."
      );
    }

    /*
     * Make sure the proposed replacement time
     * does not conflict with another session.
     */
    await checkScheduleConflicts({
      centerId,
      learnerId: schedule.learner_id,
      therapistId: schedule.therapist_id,
      deliveryMode:
        schedule.delivery_mode as DeliveryMode,
      scheduledStart:
        request.proposed_start,
      scheduledEnd:
        request.proposed_end,
      excludeScheduleId: schedule.id,
    });

    const now = new Date().toISOString();

    /*
     * Since the Therapist proposed this exact
     * replacement time, approving it counts as
     * Therapist confirmation of the new time.
     *
     * Guardian response goes back to pending
     * because the appointment time changed.
     */
    const {
      data: updatedSchedule,
      error: updateScheduleError,
    } = await supabase
      .from("scheduled_sessions")
      .update({
        scheduled_start:
          request.proposed_start,

        scheduled_end:
          request.proposed_end,

        status: "scheduled",

        therapist_response:
          "confirmed",

        therapist_responded_at:
          now,

        guardian_response:
          "pending",

        guardian_responded_at:
          null,

        guardian_decline_reason:
          null,

        home_fallback_selected:
          false,

        updated_at: now,
      })
      .eq("id", schedule.id)
      .select()
      .single();

    if (updateScheduleError) {
      throw new ScheduleServiceError(
        updateScheduleError.message,
        500
      );
    }

    /*
     * Mark request as approved.
     */
    const {
      data: reviewedRequest,
      error: requestUpdateError,
    } = await supabase
      .from(
        "schedule_reschedule_requests"
      )
      .update({
        status: "approved",

        center_response_note:
          responseNote?.trim() || null,

        reviewed_by_id:
          reviewedById,

        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", request.id)
      .select()
      .single();

    if (requestUpdateError) {
      /*
       * Attempt to restore the original time
       * if marking the request fails.
       */
      await supabase
        .from("scheduled_sessions")
        .update({
          scheduled_start:
            schedule.scheduled_start,

          scheduled_end:
            schedule.scheduled_end,

          therapist_response:
            "reschedule_requested",

          therapist_responded_at:
            null,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", schedule.id);

      throw new ScheduleServiceError(
        requestUpdateError.message,
        500
      );
    }

    return {
      schedule: updatedSchedule,
      rescheduleRequest:
        reviewedRequest,
    };
  };

/*
|--------------------------------------------------------------------------
| CENTER: Reject therapist reschedule request
|--------------------------------------------------------------------------
*/

export const rejectRescheduleRequestService =
  async ({
    requestId,
    centerId,
    reviewedById = null,
    responseNote = null,
  }: {
    requestId: string;
    centerId: string;
    reviewedById?: string | null;
    responseNote?: string | null;
  }) => {
    const { data: request, error } =
      await supabase
        .from(
          "schedule_reschedule_requests"
        )
        .select(`
          id,
          scheduled_session_id,
          status
        `)
        .eq("id", requestId)
        .maybeSingle();

    if (error) {
      throw new ScheduleServiceError(
        error.message,
        500
      );
    }

    if (!request) {
      throw new ScheduleServiceError(
        "Reschedule request not found.",
        404
      );
    }

    if (request.status !== "pending") {
      throw new ScheduleServiceError(
        "This reschedule request has already been reviewed."
      );
    }

    const {
      data: schedule,
      error: scheduleError,
    } = await supabase
      .from("scheduled_sessions")
      .select(
        "id, center_id, status"
      )
      .eq(
        "id",
        request.scheduled_session_id
      )
      .maybeSingle();

    if (scheduleError) {
      throw new ScheduleServiceError(
        scheduleError.message,
        500
      );
    }

    if (!schedule) {
      throw new ScheduleServiceError(
        "Scheduled session not found.",
        404
      );
    }

    if (schedule.center_id !== centerId) {
      throw new ScheduleServiceError(
        "You cannot review a request from another center.",
        403
      );
    }

    const now =
      new Date().toISOString();

    /*
     * Rejecting keeps the ORIGINAL schedule.
     *
     * Therapist response becomes pending again,
     * because they now need to respond to the
     * original appointment.
     */
    const {
      data: reviewedRequest,
      error: requestUpdateError,
    } = await supabase
      .from(
        "schedule_reschedule_requests"
      )
      .update({
        status: "rejected",

        center_response_note:
          responseNote?.trim() || null,

        reviewed_by_id:
          reviewedById,

        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", request.id)
      .select()
      .single();

    if (requestUpdateError) {
      throw new ScheduleServiceError(
        requestUpdateError.message,
        500
      );
    }

    const {
      data: updatedSchedule,
      error: scheduleUpdateError,
    } = await supabase
      .from("scheduled_sessions")
      .update({
        therapist_response:
          "pending",

        therapist_responded_at:
          null,

        updated_at: now,
      })
      .eq("id", schedule.id)
      .select()
      .single();

    if (scheduleUpdateError) {
      throw new ScheduleServiceError(
        scheduleUpdateError.message,
        500
      );
    }

    return {
      schedule: updatedSchedule,
      rescheduleRequest:
        reviewedRequest,
    };
  };

/*
|--------------------------------------------------------------------------
| PARENT: Verify parent ↔ learner relationship
|--------------------------------------------------------------------------
*/

const verifyParentLearnerRelationship = async (
  parentId: string,
  learnerId: string
) => {
  const { data, error } = await supabase
    .from("parent_learners")
    .select("parent_id, learner_id")
    .eq("parent_id", parentId)
    .eq("learner_id", learnerId)
    .maybeSingle();

  if (error) {
    throw new ScheduleServiceError(
      error.message,
      500
    );
  }

  if (!data) {
    throw new ScheduleServiceError(
      "This parent is not linked to this learner.",
      403
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| PARENT: Confirm clinic attendance
|--------------------------------------------------------------------------
*/

export const confirmGuardianScheduleService = async (
  scheduleId: string,
  parentId: string
) => {
  const { data: schedule, error } = await supabase
    .from("scheduled_sessions")
    .select(`
      id,
      learner_id,
      delivery_mode,
      status,
      therapist_response,
      guardian_response
    `)
    .eq("id", scheduleId)
    .maybeSingle();

  if (error) {
    throw new ScheduleServiceError(
      error.message,
      500
    );
  }

  if (!schedule) {
    throw new ScheduleServiceError(
      "Scheduled session not found.",
      404
    );
  }

  /*
   * Make sure this parent actually belongs
   * to the learner in this schedule.
   */
  await verifyParentLearnerRelationship(
    parentId,
    schedule.learner_id
  );

  if (schedule.delivery_mode !== "clinic") {
    throw new ScheduleServiceError(
      "Attendance confirmation is only required for clinic sessions."
    );
  }

  if (schedule.status === "cancelled") {
    throw new ScheduleServiceError(
      "A cancelled session cannot be confirmed."
    );
  }

  if (schedule.status === "completed") {
    throw new ScheduleServiceError(
      "A completed session cannot be confirmed."
    );
  }

  if (schedule.guardian_response === "confirmed") {
    throw new ScheduleServiceError(
      "Attendance has already been confirmed."
    );
  }

  const now = new Date().toISOString();

  /*
   * The overall schedule becomes confirmed only
   * when BOTH Therapist and Guardian confirmed.
   */
  const nextStatus =
    schedule.therapist_response === "confirmed"
      ? "confirmed"
      : "scheduled";

  const { data: updatedSchedule, error: updateError } =
    await supabase
      .from("scheduled_sessions")
      .update({
        guardian_response: "confirmed",
        guardian_responded_at: now,
        guardian_decline_reason: null,
        status: nextStatus,
        updated_at: now,
      })
      .eq("id", schedule.id)
      .select()
      .single();

  if (updateError) {
    throw new ScheduleServiceError(
      updateError.message,
      500
    );
  }

  return updatedSchedule;
};

/*
|--------------------------------------------------------------------------
| PARENT: Decline clinic attendance
|--------------------------------------------------------------------------
|
| If continueAtHome = true:
| - Original clinic session stays as a clinic record
| - guardian_response becomes "declined"
| - A NEW home-practice schedule is created
| - New home schedule links back through fallback_from_session_id
|--------------------------------------------------------------------------
*/

export const declineGuardianScheduleService = async ({
  scheduleId,
  parentId,
  reason = null,
  continueAtHome = false,
  homeStart = null,
  homeEnd = null,
}: {
  scheduleId: string;
  parentId: string;
  reason?: string | null;
  continueAtHome?: boolean;
  homeStart?: string | null;
  homeEnd?: string | null;
}) => {
  const { data: schedule, error } = await supabase
    .from("scheduled_sessions")
    .select(`
      id,
      center_id,
      learner_id,
      therapist_id,
      session_type,
      scheduled_start,
      scheduled_end,
      status,
      notes,
      delivery_mode,
      therapist_response,
      guardian_response,
      home_fallback_selected
    `)
    .eq("id", scheduleId)
    .maybeSingle();

  if (error) {
    throw new ScheduleServiceError(error.message, 500);
  }

  if (!schedule) {
    throw new ScheduleServiceError(
      "Scheduled session not found.",
      404
    );
  }

  /*
   * Verify Parent exists and belongs to the same center.
   */
  const { data: parent, error: parentError } =
    await supabase
      .from("center_parents")
      .select("id, center_id")
      .eq("id", parentId)
      .maybeSingle();

  if (parentError) {
    throw new ScheduleServiceError(
      parentError.message,
      500
    );
  }

  if (!parent) {
    throw new ScheduleServiceError(
      "Parent account not found.",
      404
    );
  }

  if (parent.center_id !== schedule.center_id) {
    throw new ScheduleServiceError(
      "This parent does not belong to this center.",
      403
    );
  }

  /*
   * Verify Parent ↔ Learner relationship.
   */
  await verifyParentLearnerRelationship(
    parentId,
    schedule.learner_id
  );

  if (schedule.delivery_mode !== "clinic") {
    throw new ScheduleServiceError(
      "Only clinic sessions can be declined for attendance."
    );
  }

  if (schedule.status === "cancelled") {
    throw new ScheduleServiceError(
      "A cancelled session cannot be declined."
    );
  }

  if (schedule.status === "completed") {
    throw new ScheduleServiceError(
      "A completed session cannot be declined."
    );
  }

  const now = new Date().toISOString();

  let homeFallback: any = null;

  /*
   * HOME PRACTICE FALLBACK
   */
  if (continueAtHome) {
    /*
     * Prevent duplicate fallback sessions.
     */
    const { data: existingFallback, error: fallbackCheckError } =
      await supabase
        .from("scheduled_sessions")
        .select("id")
        .eq("fallback_from_session_id", schedule.id)
        .eq("delivery_mode", "home")
        .neq("status", "cancelled")
        .maybeSingle();

    if (fallbackCheckError) {
      throw new ScheduleServiceError(
        fallbackCheckError.message,
        500
      );
    }

    if (existingFallback) {
      throw new ScheduleServiceError(
        "A home practice fallback already exists for this session."
      );
    }

    /*
     * Parent may provide another preferred home-practice time.
     *
     * If none is supplied, use the original clinic time as
     * the recommended home-practice window.
     */
    if (
      (homeStart && !homeEnd) ||
      (!homeStart && homeEnd)
    ) {
      throw new ScheduleServiceError(
        "Home practice start and end time must both be provided."
      );
    }

    const fallbackStart =
      homeStart || schedule.scheduled_start;

    const fallbackEnd =
      homeEnd || schedule.scheduled_end;

    ensureValidDateRange(
      fallbackStart,
      fallbackEnd
    );

    /*
     * Ignore the declined clinic record itself when checking
     * learner conflicts, but still block conflicts with any
     * OTHER active schedule.
     */
    await checkScheduleConflicts({
      centerId: schedule.center_id,
      learnerId: schedule.learner_id,
      therapistId: null,
      deliveryMode: "home",
      scheduledStart: fallbackStart,
      scheduledEnd: fallbackEnd,
      excludeScheduleId: schedule.id,
    });

    const {
      data: createdFallback,
      error: createFallbackError,
    } = await supabase
      .from("scheduled_sessions")
      .insert({
        center_id: schedule.center_id,
        learner_id: schedule.learner_id,

        /*
         * Home practice does not reserve Therapist time.
         */
        therapist_id: null,

        session_type: schedule.session_type,

        scheduled_start: fallbackStart,
        scheduled_end: fallbackEnd,

        status: "confirmed",

        notes:
          schedule.notes ||
          "Home practice fallback from declined clinic session.",

        created_by_role: "system",
        created_by_id: parentId,

        delivery_mode: "home",

        therapist_response: "not_required",
        guardian_response: "not_required",

        home_fallback_selected: true,

        fallback_from_session_id: schedule.id,

        updated_at: now,
      })
      .select()
      .single();

    if (createFallbackError) {
      throw new ScheduleServiceError(
        createFallbackError.message,
        500
      );
    }

    homeFallback = createdFallback;
  }

  /*
   * Preserve original clinic record.
   *
   * We DO NOT turn the original clinic appointment into
   * a home session.
   *
   * We also return status to "scheduled" because the
   * Center may still need to cancel or reschedule the
   * clinic appointment after seeing the Parent decline.
   */
  const {
    data: updatedSchedule,
    error: updateError,
  } = await supabase
    .from("scheduled_sessions")
    .update({
      guardian_response: "declined",
      guardian_responded_at: now,

      guardian_decline_reason:
        reason?.trim() || null,

      home_fallback_selected:
        continueAtHome,

      status: "scheduled",

      updated_at: now,
    })
    .eq("id", schedule.id)
    .select()
    .single();

  if (updateError) {
    /*
     * If we created the fallback but updating the original
     * clinic appointment failed, remove the fallback so
     * we don't leave inconsistent records.
     */
    if (homeFallback?.id) {
      await supabase
        .from("scheduled_sessions")
        .delete()
        .eq("id", homeFallback.id);
    }

    throw new ScheduleServiceError(
      updateError.message,
      500
    );
  }

  return {
    schedule: updatedSchedule,
    homeFallback,
  };
};

/*
|--------------------------------------------------------------------------
| CENTER: Get therapist reschedule requests
|--------------------------------------------------------------------------
*/

export const getCenterRescheduleRequestsService = async (
  centerId: string,
  status?: string,
) => {
  const { data: centerSchedules, error: scheduleError } =
    await supabase
      .from("scheduled_sessions")
      .select("id")
      .eq("center_id", centerId);

  if (scheduleError) {
    throw new ScheduleServiceError(
      scheduleError.message,
      500,
    );
  }

  const scheduleIds =
    (centerSchedules ?? []).map(
      (schedule) => schedule.id,
    );

  if (scheduleIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("schedule_reschedule_requests")
    .select("*")
    .in(
      "scheduled_session_id",
      scheduleIds,
    )
    .order("created_at", {
      ascending: false,
    });

  if (status) {
    query = query.eq(
      "status",
      status,
    );
  }

  const { data, error } =
    await query;

  if (error) {
    throw new ScheduleServiceError(
      error.message,
      500,
    );
  }

  return data ?? [];
};

export const updateCenterScheduleService = async ({
  scheduleId,
  centerId,
  therapistId,
  scheduledStart,
  scheduledEnd,
  notes,
}: {
  scheduleId: string;
  centerId: string;
  therapistId: string;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string | null;
}) => {
  ensureValidDateRange(
    scheduledStart,
    scheduledEnd,
  );

  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from("scheduled_sessions")
    .select("*")
    .eq("id", scheduleId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (existingError) {
    throw new ScheduleServiceError(
      existingError.message,
      500,
    );
  }

  if (!existing) {
    throw new ScheduleServiceError(
      "Scheduled session not found.",
      404,
    );
  }

  if (
    existing.status === "cancelled"
  ) {
    throw new ScheduleServiceError(
      "A cancelled session cannot be edited.",
    );
  }

  if (
    existing.status === "completed"
  ) {
    throw new ScheduleServiceError(
      "A completed session cannot be edited.",
    );
  }

  /*
   * For now Center Edit is for clinic appointments.
   * Home Practice can still be cancelled/re-created if needed.
   */
  if (
    existing.delivery_mode !==
    "clinic"
  ) {
    throw new ScheduleServiceError(
      "Only clinic appointments can be rescheduled from the Center schedule.",
    );
  }

  if (!therapistId) {
    throw new ScheduleServiceError(
      "Clinic sessions require a Therapist.",
    );
  }

  /*
   * Validate Therapist and learner assignment.
   */
  await verifyTherapist(
    centerId,
    therapistId,
  );

  await verifyLearnerTherapistAssignment(
    existing.learner_id,
    therapistId,
  );

  /*
   * Re-check:
   * - learner overlap
   * - therapist clinic overlap
   *
   * Ignore the schedule being edited.
   */
  await checkScheduleConflicts({
    centerId,
    learnerId:
      existing.learner_id,
    therapistId,
    deliveryMode: "clinic",
    scheduledStart,
    scheduledEnd,
    excludeScheduleId:
      scheduleId,
  });

  const scheduleChanged =
    existing.scheduled_start !==
      scheduledStart ||
    existing.scheduled_end !==
      scheduledEnd ||
    existing.therapist_id !==
      therapistId;

  const now =
    new Date().toISOString();

  const updatePayload: any = {
    therapist_id:
      therapistId,

    scheduled_start:
      scheduledStart,

    scheduled_end:
      scheduledEnd,

    notes:
      notes?.trim() || null,

    updated_at:
      now,
  };

  /*
   * If time or Therapist changed, both people need
   * to confirm the new appointment again.
   *
   * Editing notes only does NOT reset confirmations.
   */
  if (scheduleChanged) {
    updatePayload.status =
      "scheduled";

    updatePayload.therapist_response =
      "pending";

    updatePayload.therapist_responded_at =
      null;

    updatePayload.guardian_response =
      "pending";

    updatePayload.guardian_responded_at =
      null;

    updatePayload.guardian_decline_reason =
      null;

    updatePayload.home_fallback_selected =
      false;
  }

  const {
    data: updatedSchedule,
    error: updateError,
  } = await supabase
    .from("scheduled_sessions")
    .update(updatePayload)
    .eq("id", scheduleId)
    .eq("center_id", centerId)
    .select()
    .single();

  if (updateError) {
    throw new ScheduleServiceError(
      updateError.message,
      500,
    );
  }

  /*
   * Any old pending Therapist request becomes stale
   * once the Center directly changes the appointment.
   */
  if (scheduleChanged) {
    const {
      error: requestError,
    } = await supabase
      .from(
        "schedule_reschedule_requests",
      )
      .update({
        status: "cancelled",
        reviewed_at: now,
        updated_at: now,
      })
      .eq(
        "scheduled_session_id",
        scheduleId,
      )
      .eq("status", "pending");

    if (requestError) {
      console.error(
        "Unable to cancel stale reschedule request:",
        requestError,
      );
    }
  }

  return updatedSchedule;
};