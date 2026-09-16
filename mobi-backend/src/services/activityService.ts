// mobi-backend/src/services/activityService.ts

import { supabase } from "../config/supabase";
import { assignActivityToLearners } from "./activity/activityAssignmentService";

const CENTER_ID =
  "d5ae1649-0343-46d4-b433-575c97e064e1";

export type ActivityActor =
  | {
      role: "center";
      centerId: string;
      therapistId: null;
      displayName: "Center Admin";
    }
  | {
      role: "therapist";
      centerId: string;
      therapistId: string;
      displayName: string;
    };

export type TherapistMaterialView =
  | "mine"
  | "all"
  | "center"
  | "drafts"
  | "archived";

/* =========================================================
   ACTOR RESOLUTION
========================================================= */

export async function resolveActivityActor({
  role,
  profileId,
}: {
  role?: string | null;
  profileId?: string | null;
}): Promise<ActivityActor> {
  if (role === "therapist") {
    if (!profileId) {
      throw new Error(
        "Therapist profile ID is required.",
      );
    }

    const {
      data: therapist,
      error,
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
      .eq("id", profileId)
      .eq("center_id", CENTER_ID)
      .maybeSingle();

    if (error) throw error;

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

    const displayName = [
      therapist.first_name,
      therapist.middle_name,
      therapist.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      role: "therapist",
      centerId:
        therapist.center_id,
      therapistId:
        therapist.id,
      displayName:
        displayName ||
        "Therapist",
    };
  }

  /*
    Center authentication is not wired yet, so calls that do not
    identify a Therapist continue using the existing AMTC Center
    behavior. This keeps Center Materials working while we finish
    the Therapist side.
  */
  return {
    role: "center",
    centerId:
      CENTER_ID,
    therapistId:
      null,
    displayName:
      "Center Admin",
  };
}

/* =========================================================
   OWNERSHIP CHECK
========================================================= */

async function getOwnedTherapistActivity(
  activityId: string,
  actor: ActivityActor,
) {
  if (
    actor.role !==
    "therapist"
  ) {
    throw new Error(
      "Therapist ownership is required for this action.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .eq(
      "center_id",
      actor.centerId,
    )
    .eq(
      "created_by_therapist_id",
      actor.therapistId,
    )
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(
      "Activity not found or you do not have permission to modify it.",
    );
  }

  return data;
}

/* =========================================================
   STEP HELPERS
========================================================= */

function makeStepRows(
  activityId: string,
  steps: any[],
) {
  return steps.map(
    (
      step: any,
      index: number,
    ) => ({
      activity_id:
        activityId,

      step_order:
        index + 1,

      step_type:
        step.step_type,

      instruction:
        step.instruction ||
        null,

      prompt:
        step.prompt ||
        null,

      media_url:
        step.media_url ||
        null,

      expected_answers:
        step.expected_answers ||
        [],

      accepted_variations:
        step.accepted_variations ||
        [],

      can_repeat:
        step.can_repeat ??
        true,

      can_give_hint:
        step.can_give_hint ??
        true,

      can_skip:
        step.can_skip ??
        true,

      ai_feedback_rules:
        step.ai_feedback_rules ||
        {},

      metadata: {
        lesson:
          step.lesson ||
          null,

        question:
          step.question ||
          null,

        media:
          step.media ||
          [],

        choices:
          step.choices ||
          [],

        topics:
          step.topics ||
          [],

        materials_needed:
          step.materials_needed ||
          [],

        correct_feedback:
          step.correct_feedback ||
          null,

        wrong_feedback:
          step.wrong_feedback ||
          null,

        max_attempts_feedback:
          step.max_attempts_feedback ||
          null,

        ai_voice_style:
          step.ai_voice_style ||
          null,
      },
    }),
  );
}

/* =========================================================
   CREATE
========================================================= */

export async function createActivityWithSteps(
  payload: any,
  actor?: ActivityActor,
) {
  const resolvedActor =
    actor ??
    (await resolveActivityActor({}));

  const {
    steps = [],
    learner_ids = [],
    access_scope = "center_library",
    activity_domain = "speech_training",
    ...activityData
  } = payload;

  let requestedStatus =
    typeof activityData.status ===
    "string"
      ? activityData.status
      : resolvedActor.role ===
          "therapist"
        ? "draft"
        : "published";

  if (
    resolvedActor.role ===
      "therapist" &&
    ![
      "draft",
      "pending_review",
    ].includes(
      requestedStatus,
    )
  ) {
    requestedStatus =
      "pending_review";
  }

  const insertRow = {
    ...activityData,

    center_id:
      resolvedActor.centerId,

    access_scope,

    activity_domain,

    status:
      requestedStatus,

    uploaded_by:
      resolvedActor.displayName,

    created_by_role:
      resolvedActor.role,

    created_by_therapist_id:
      resolvedActor.therapistId,

    archived_at:
      null,

    updated_at:
      new Date().toISOString(),
  };

  const {
    data: activity,
    error: activityError,
  } = await supabase
    .from("activities")
    .insert(insertRow)
    .select()
    .single();

  if (activityError) {
    throw activityError;
  }

  if (steps.length > 0) {
    const stepRows =
      makeStepRows(
        activity.id,
        steps,
      );

    const {
      error: stepsError,
    } = await supabase
      .from("activity_steps")
      .insert(stepRows);

    if (stepsError) {
      /*
        Avoid leaving a half-created activity if step creation fails.
      */
      await supabase
        .from("activities")
        .delete()
        .eq(
          "id",
          activity.id,
        );

      throw stepsError;
    }
  }

  /*
    Only published activities should immediately create learner
    assignments. Drafts and pending-review activities are not yet
    learner-ready.
  */
  if (
    learner_ids.length >
      0 &&
    requestedStatus ===
      "published"
  ) {
    await assignActivityToLearners({
      centerId:
        activity.center_id,

      activityId:
        activity.id,

      learnerIds:
        learner_ids,

      assignmentType:
        "recommended",
    });
  }

  return activity;
}

/* =========================================================
   GENERAL LIBRARY
========================================================= */

export async function getActivities() {
  const {
    data,
    error,
  } = await supabase
    .from("activities")
    .select("*")
    .eq(
      "center_id",
      CENTER_ID,
    )
    .is(
      "archived_at",
      null,
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      },
    );

  if (error) {
    throw error;
  }

  return data ?? [];
}

/* =========================================================
   THERAPIST MATERIAL VIEWS
========================================================= */

export async function getTherapistMaterialsService({
  therapistId,
  view,
}: {
  therapistId: string;
  view: TherapistMaterialView;
}) {
  const actor =
    await resolveActivityActor({
      role:
        "therapist",

      profileId:
        therapistId,
    });

  let query =
    supabase
      .from("activities")
      .select("*")
      .eq(
        "center_id",
        actor.centerId,
      );

  if (
    view === "archived"
  ) {
    query =
      query
        .eq(
          "created_by_therapist_id",
          therapistId,
        )
        .not(
          "archived_at",
          "is",
          null,
        );
  } else {
    query =
      query.is(
        "archived_at",
        null,
      );

    if (
      view === "mine"
    ) {
      query =
        query
          .eq(
            "created_by_therapist_id",
            therapistId,
          )
          .neq(
            "status",
            "draft",
          );
    }

    if (
      view === "drafts"
    ) {
      query =
        query
          .eq(
            "created_by_therapist_id",
            therapistId,
          )
          .eq(
            "status",
            "draft",
          );
    }

    if (
      view === "all"
    ) {
      query =
        query.eq(
          "status",
          "published",
        );
    }

    if (
      view === "center"
    ) {
      query =
        query.eq(
          "status",
          "published",
        );
    }
  }

  const {
    data,
    error,
  } =
    await query.order(
      "updated_at",
      {
        ascending:
          false,
        nullsFirst:
          false,
      },
    );

  if (error) {
    throw error;
  }

  const rows =
    data ?? [];

  if (
    view === "center"
  ) {
    return rows.filter(
      (activity: any) =>
        activity.created_by_role ===
          "center" ||
        (
          !activity.created_by_role &&
          !activity.created_by_therapist_id &&
          (
            !activity.uploaded_by ||
            String(
              activity.uploaded_by,
            )
              .trim()
              .toLowerCase() ===
              "center admin"
          )
        ),
    );
  }

  return rows;
}

/* =========================================================
   GET ONE ACTIVITY
========================================================= */

export async function getActivityById(
  id: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from("activities")
    .select(
      "*, activity_steps(*)",
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  const sortedSteps =
    (
      data.activity_steps ??
      []
    )
      .sort(
        (
          a: any,
          b: any,
        ) =>
          a.step_order -
          b.step_order,
      )
      .map(
        (step: any) => {
          const metadata =
            step.metadata ||
            {};

          return {
            id:
              step.id,

            step_order:
              step.step_order,

            step_type:
              step.step_type,

            prompt:
              step.prompt,

            instruction:
              step.instruction,

            lesson:
              metadata.lesson,

            question:
              metadata.question,

            media:
              metadata.media ||
              [],

            choices:
              metadata.choices ||
              [],

            topics:
              metadata.topics ||
              [],

            materials_needed:
              metadata.materials_needed ||
              [],

            expected_answers:
              step.expected_answers ||
              [],

            accepted_variations:
              step.accepted_variations ||
              [],

            correct_feedback:
              metadata.correct_feedback,

            wrong_feedback:
              metadata.wrong_feedback,

            max_attempts_feedback:
              metadata.max_attempts_feedback,

            ai_voice_style:
              metadata.ai_voice_style,

            ai_feedback_rules:
              step.ai_feedback_rules ||
              {},

            can_repeat:
              step.can_repeat,

            can_give_hint:
              step.can_give_hint,

            can_skip:
              step.can_skip,
          };
        },
      );

  return {
    ...data,
    steps:
      sortedSteps,
    activity_steps:
      sortedSteps,
  };
}

/* =========================================================
   UPDATE THERAPIST ACTIVITY
========================================================= */

export async function updateTherapistActivityService({
  activityId,
  therapistId,
  payload,
}: {
  activityId: string;
  therapistId: string;
  payload: any;
}) {
  const actor =
    await resolveActivityActor({
      role:
        "therapist",
      profileId:
        therapistId,
    });

  const existing =
    await getOwnedTherapistActivity(
      activityId,
      actor,
    );

  const {
    steps,
    learner_ids: _ignoredLearners,
    created_by_role:
      _ignoredRole,
    created_by_therapist_id:
      _ignoredCreator,
    uploaded_by:
      _ignoredUploader,
    center_id:
      _ignoredCenter,
    archived_at:
      _ignoredArchive,
    ...activityData
  } = payload;

  let nextStatus =
    typeof activityData.status ===
    "string"
      ? activityData.status
      : existing.status;

  if (
    ![
      "draft",
      "pending_review",
    ].includes(
      nextStatus,
    )
  ) {
    nextStatus =
      "pending_review";
  }

  const {
    data: updated,
    error: updateError,
  } = await supabase
    .from("activities")
    .update({
      ...activityData,

      status:
        nextStatus,

      uploaded_by:
        actor.displayName,

      created_by_role:
        "therapist",

      created_by_therapist_id:
        therapistId,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      activityId,
    )
    .eq(
      "center_id",
      actor.centerId,
    )
    .eq(
      "created_by_therapist_id",
      therapistId,
    )
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  if (
    Array.isArray(
      steps,
    )
  ) {
    const {
      error:
        deleteStepsError,
    } = await supabase
      .from(
        "activity_steps",
      )
      .delete()
      .eq(
        "activity_id",
        activityId,
      );

    if (
      deleteStepsError
    ) {
      throw deleteStepsError;
    }

    if (
      steps.length >
      0
    ) {
      const {
        error:
          insertStepsError,
      } = await supabase
        .from(
          "activity_steps",
        )
        .insert(
          makeStepRows(
            activityId,
            steps,
          ),
        );

      if (
        insertStepsError
      ) {
        throw insertStepsError;
      }
    }
  }

  return updated;
}

/* =========================================================
   SUBMIT FOR REVIEW
========================================================= */

export async function submitTherapistActivityForReviewService({
  activityId,
  therapistId,
}: {
  activityId: string;
  therapistId: string;
}) {
  const actor =
    await resolveActivityActor({
      role:
        "therapist",
      profileId:
        therapistId,
    });

  await getOwnedTherapistActivity(
    activityId,
    actor,
  );

  const {
    data,
    error,
  } = await supabase
    .from("activities")
    .update({
      status:
        "pending_review",

      archived_at:
        null,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      activityId,
    )
    .eq(
      "created_by_therapist_id",
      therapistId,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   ARCHIVE / RESTORE
========================================================= */

export async function archiveTherapistActivityService({
  activityId,
  therapistId,
}: {
  activityId: string;
  therapistId: string;
}) {
  const actor =
    await resolveActivityActor({
      role:
        "therapist",
      profileId:
        therapistId,
    });

  await getOwnedTherapistActivity(
    activityId,
    actor,
  );

  const {
    data,
    error,
  } = await supabase
    .from("activities")
    .update({
      archived_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      activityId,
    )
    .eq(
      "created_by_therapist_id",
      therapistId,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function restoreTherapistActivityService({
  activityId,
  therapistId,
}: {
  activityId: string;
  therapistId: string;
}) {
  const actor =
    await resolveActivityActor({
      role:
        "therapist",
      profileId:
        therapistId,
    });

  await getOwnedTherapistActivity(
    activityId,
    actor,
  );

  const {
    data,
    error,
  } = await supabase
    .from("activities")
    .update({
      archived_at:
        null,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      activityId,
    )
    .eq(
      "created_by_therapist_id",
      therapistId,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   SAFE DELETE
========================================================= */

export async function deleteTherapistActivityService({
  activityId,
  therapistId,
}: {
  activityId: string;
  therapistId: string;
}) {
  const actor =
    await resolveActivityActor({
      role:
        "therapist",
      profileId:
        therapistId,
    });

  await getOwnedTherapistActivity(
    activityId,
    actor,
  );

  /*
    Do not permanently remove an activity that has already been
    assigned. Keeping activity history is important for reports.
  */
  const {
    count:
      assignmentCount,
    error:
      assignmentError,
  } = await supabase
    .from(
      "learner_activity_assignments",
    )
    .select(
      "id",
      {
        count:
          "exact",
        head:
          true,
      },
    )
    .eq(
      "activity_id",
      activityId,
    );

  if (assignmentError) {
    throw assignmentError;
  }

  if (
    (
      assignmentCount ??
      0
    ) > 0
  ) {
    throw new Error(
      "This activity already has learner assignment history. Archive it instead of permanently deleting it.",
    );
  }

  const {
    error:
      stepsError,
  } = await supabase
    .from(
      "activity_steps",
    )
    .delete()
    .eq(
      "activity_id",
      activityId,
    );

  if (stepsError) {
    throw stepsError;
  }

  const {
    error:
      activityError,
  } = await supabase
    .from("activities")
    .delete()
    .eq(
      "id",
      activityId,
    )
    .eq(
      "created_by_therapist_id",
      therapistId,
    );

  if (activityError) {
    throw activityError;
  }

  return {
    id:
      activityId,
  };
}
