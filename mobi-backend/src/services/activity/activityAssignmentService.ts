// mobi-backend/src/services/activity/activityAssignmentService.ts

import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

export type AssignmentType =
  | "required"
  | "recommended";

export type AssignmentStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped"
  | "cancelled";

export type AssignedByRole =
  | "center_admin"
  | "therapist"
  | "system";

export interface CreateActivityAssignmentInput {
  centerId: string;
  learnerId: string;
  activityId: string;

  assignmentType?: AssignmentType;
  priority?: number;

  maxAttemptsOverride?: number | null;
  estimatedMinutesOverride?: number | null;
  allowSkipOverride?: boolean | null;

  assignedByRole?: AssignedByRole;
  assignedByUserId?: string | null;
}

export interface UpdateActivityAssignmentInput {
  assignmentType?: AssignmentType;
  priority?: number;
  status?: AssignmentStatus;

  maxAttemptsOverride?: number | null;
  estimatedMinutesOverride?: number | null;
  allowSkipOverride?: boolean | null;

  startedAt?: string | null;
  completedAt?: string | null;
}

/* =========================================================
   CREATE OR UPDATE ONE ASSIGNMENT
========================================================= */

/*
  One learner can only have one row for the same activity.

  Because the database has:

  unique(learner_id, activity_id)

  this function uses upsert so an existing assignment can be
  reactivated or updated instead of creating a duplicate row.
*/
export async function assignActivityToLearner(
  input: CreateActivityAssignmentInput,
) {
  const {
    centerId,
    learnerId,
    activityId,

    assignmentType = "recommended",
    priority = 1,

    maxAttemptsOverride = null,
    estimatedMinutesOverride = null,
    allowSkipOverride = null,

    assignedByRole = "center_admin",
    assignedByUserId = null,
  } = input;

  /* =======================================================
     1. VERIFY THAT THE LEARNER BELONGS TO THE CENTER
  ======================================================= */

  const {
    data: learner,
    error: learnerError,
  } = await supabase
    .from("learners")
    .select("id")
    .eq("id", learnerId)
    .eq("center_id", centerId)
    .single();

  if (learnerError || !learner) {
    console.error(
      "Unable to verify learner before assignment:",
      learnerError,
    );

    throw new Error(
      "Learner was not found in this center.",
    );
  }

  /* =======================================================
     2. VERIFY THAT THE ACTIVITY BELONGS TO THE CENTER
  ======================================================= */

  const {
    data: activity,
    error: activityError,
  } = await supabase
    .from("activities")
    .select("id, status")
    .eq("id", activityId)
    .eq("center_id", centerId)
    .single();

  if (activityError || !activity) {
    console.error(
      "Unable to verify activity before assignment:",
      activityError,
    );

    throw new Error(
      "Activity was not found in this center.",
    );
  }

  /*
    For now, only published activities should be assigned.

    Later you may allow draft assignment for internal testing,
    but published-only is safer for actual learners.
  */
  if (activity.status !== "published") {
    throw new Error(
      "Only published activities can be assigned.",
    );
  }

  /* =======================================================
     3. SAVE THE ASSIGNMENT
  ======================================================= */

  const {
    data,
    error,
  } = await supabase
    .from(
      "learner_activity_assignments",
    )
    .upsert(
      {
        center_id:
          centerId,

        learner_id:
          learnerId,

        activity_id:
          activityId,

        assignment_type:
          assignmentType,

        priority,

        /*
          Reassigning a previously completed or cancelled
          activity places it back into the pending queue.
        */
        status:
          "pending",

        max_attempts_override:
          maxAttemptsOverride,

        estimated_minutes_override:
          estimatedMinutesOverride,

        allow_skip_override:
          allowSkipOverride,

        assigned_by_role:
          assignedByRole,

        assigned_by_user_id:
          assignedByUserId,

        assigned_at:
          new Date().toISOString(),

        started_at:
          null,

        completed_at:
          null,
      },
      {
        onConflict:
          "learner_id,activity_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "Unable to assign activity to learner:",
      error,
    );

    throw error;
  }

  return data;
}

/* =========================================================
   ASSIGN ONE ACTIVITY TO MULTIPLE LEARNERS
========================================================= */

/*
  This is the function CreateActivity will eventually call
  when the center selects several learners.

  It processes learners one at a time so that the ownership
  and published-status checks are still applied safely.
*/
export async function assignActivityToLearners(
  input: {
    centerId: string;
    activityId: string;
    learnerIds: string[];

    assignmentType?: AssignmentType;
    priority?: number;

    maxAttemptsOverride?: number | null;
    estimatedMinutesOverride?: number | null;
    allowSkipOverride?: boolean | null;

    assignedByRole?: AssignedByRole;
    assignedByUserId?: string | null;
  },
) {
  const uniqueLearnerIds = [
    ...new Set(
      input.learnerIds.filter(Boolean),
    ),
  ];

  const assignments = [];

  for (
    const learnerId
    of uniqueLearnerIds
  ) {
    const assignment =
      await assignActivityToLearner({
        centerId:
          input.centerId,

        learnerId,

        activityId:
          input.activityId,

        assignmentType:
          input.assignmentType,

        priority:
          input.priority,

        maxAttemptsOverride:
          input.maxAttemptsOverride,

        estimatedMinutesOverride:
          input.estimatedMinutesOverride,

        allowSkipOverride:
          input.allowSkipOverride,

        assignedByRole:
          input.assignedByRole,

        assignedByUserId:
          input.assignedByUserId,
      });

    assignments.push(
      assignment,
    );
  }

  return assignments;
}

/* =========================================================
   GET ASSIGNMENTS FOR ONE LEARNER
========================================================= */

/*
  Returns the learner's assigned activities together with the
  activity details needed by the future mobile session screen.

  Pending required activities appear first, followed by
  recommended activities and then their priority value.
*/
export async function getLearnerAssignedActivities(
  learnerId: string,
  centerId: string,
  statuses: AssignmentStatus[] = [
    "pending",
    "in_progress",
  ],
) {
  let query = supabase
    .from(
      "learner_activity_assignments",
    )
    .select(`
      id,
      center_id,
      learner_id,
      activity_id,
      assignment_type,
      priority,
      status,
      max_attempts_override,
      estimated_minutes_override,
      allow_skip_override,
      assigned_by_role,
      assigned_by_user_id,
      assigned_at,
      started_at,
      completed_at,
      updated_at,
      activities (
        id,
        title,
        description,
        activity_type,
        speech_ladder_level,
        max_attempts,
        estimated_minutes,
        allow_skip,
        success_required_count,
        thumbnail_url,
        ai_voice_gender,
        ai_voice_speed,
        access_scope,
        status
      )
    `)
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    );

  if (statuses.length > 0) {
    query = query.in(
      "status",
      statuses,
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    console.error(
      "Unable to fetch learner assigned activities:",
      error,
    );

    throw error;
  }

  /*
    We sort in Node because assignment_type has a custom order:

    required before recommended
  */
  const sortedAssignments = (
    data ?? []
  ).sort((a: any, b: any) => {
    const assignmentTypeOrder: Record<
      AssignmentType,
      number
    > = {
      required: 0,
      recommended: 1,
    };

    const typeDifference =
      assignmentTypeOrder[
        a.assignment_type as AssignmentType
      ] -
      assignmentTypeOrder[
        b.assignment_type as AssignmentType
      ];

    if (typeDifference !== 0) {
      return typeDifference;
    }

    if (
      a.priority !==
      b.priority
    ) {
      return (
        a.priority -
        b.priority
      );
    }

    return new Date(
      a.assigned_at,
    ).getTime() -
      new Date(
        b.assigned_at,
      ).getTime();
  });

  /*
    Resolve the final limits for this specific learner.

    Current order:

    assignment override
      ↓
    activity default

    We will add learner adaptation settings into this resolver
    when we build the mobile session preparation service.
  */
  return sortedAssignments.map(
    (assignment: any) => {
      const activity = Array.isArray(
        assignment.activities,
      )
        ? assignment.activities[0]
        : assignment.activities;

      return {
        ...assignment,

        activity,

        effectiveSettings: {
          maxAttempts:
            assignment.max_attempts_override ??
            activity?.max_attempts ??
            3,

          estimatedMinutes:
            assignment.estimated_minutes_override ??
            activity?.estimated_minutes ??
            5,

          allowSkip:
            assignment.allow_skip_override ??
            activity?.allow_skip ??
            true,
        },
      };
    },
  );
}

/* =========================================================
   UPDATE ASSIGNMENT
========================================================= */

export async function updateActivityAssignment(
  assignmentId: string,
  learnerId: string,
  centerId: string,
  updates: UpdateActivityAssignmentInput,
) {
  const allowedUpdates:
    Record<string, unknown> =
      {};

  if (
    updates.assignmentType !==
    undefined
  ) {
    allowedUpdates.assignment_type =
      updates.assignmentType;
  }

  if (
    updates.priority !==
    undefined
  ) {
    allowedUpdates.priority =
      updates.priority;
  }

  if (
    updates.status !==
    undefined
  ) {
    allowedUpdates.status =
      updates.status;
  }

  if (
    updates.maxAttemptsOverride !==
    undefined
  ) {
    allowedUpdates.max_attempts_override =
      updates.maxAttemptsOverride;
  }

  if (
    updates.estimatedMinutesOverride !==
    undefined
  ) {
    allowedUpdates.estimated_minutes_override =
      updates.estimatedMinutesOverride;
  }

  if (
    updates.allowSkipOverride !==
    undefined
  ) {
    allowedUpdates.allow_skip_override =
      updates.allowSkipOverride;
  }

  if (
    updates.startedAt !==
    undefined
  ) {
    allowedUpdates.started_at =
      updates.startedAt;
  }

  if (
    updates.completedAt !==
    undefined
  ) {
    allowedUpdates.completed_at =
      updates.completedAt;
  }

  if (
    Object.keys(
      allowedUpdates,
    ).length === 0
  ) {
    throw new Error(
      "No valid assignment updates were provided.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "learner_activity_assignments",
    )
    .update(
      allowedUpdates,
    )
    .eq(
      "id",
      assignmentId,
    )
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to update activity assignment:",
      error,
    );

    throw error;
  }

  if (!data) {
    throw new Error(
      "Activity assignment was not found.",
    );
  }

  return data;
}

/* =========================================================
   CANCEL OR UNASSIGN
========================================================= */

/*
  We do not delete assignment history.

  Cancelling preserves who assigned the activity and when it
  was assigned, which is useful for clinical transparency.
*/
export async function cancelActivityAssignment(
  assignmentId: string,
  learnerId: string,
  centerId: string,
) {
  return updateActivityAssignment(
    assignmentId,
    learnerId,
    centerId,
    {
      status:
        "cancelled",

      completedAt:
        null,
    },
  );
}