//mobi-backend/src/services/activityService.ts

import { supabase } from "../config/supabase";
import { assignActivityToLearners } from "./activity/activityAssignmentService";

export async function createActivityWithSteps(payload: any) {
  const {
    steps = [],

    learner_ids = [],

    access_scope = "center_library",

    activity_domain = "speech_training",

    ...activityData
  } = payload;

  const {
  data: activity,
  error: activityError,
  } = await supabase
    .from("activities")
    .insert({
      ...activityData,

      /*
        access_scope was extracted above because we also need
        it for application logic.

        We explicitly put it back into the database insert.
      */
      access_scope,
      
      activity_domain,

      submitted_at:
        activityData.status === "pending_review"
          ? new Date().toISOString()
          : activityData.submitted_at ?? null,

    })
    .select()
    .single();

  if (activityError) throw activityError;

  if (steps.length > 0) {
    const stepRows = steps.map((step: any, index: number) => ({
      activity_id: activity.id,
      step_order: index + 1,
      step_type: step.step_type,

      instruction: step.instruction || null,
      prompt: step.prompt || null,
      media_url: step.media_url || null,

      expected_answers: step.expected_answers || [],
      accepted_variations: step.accepted_variations || [],

      can_repeat: step.can_repeat ?? true,
      can_give_hint: step.can_give_hint ?? true,
      can_skip: step.can_skip ?? true,

      ai_feedback_rules: step.ai_feedback_rules || {},

      metadata: {
        lesson: step.lesson || null,
        question: step.question || null,
        manual_scoring_enabled:
          step.manual_scoring_enabled === true,
        media: step.media || [],
        prompt_audio_url: step.prompt_audio_url || null,
        feedback_audio_urls: step.feedback_audio_urls || null,
        choices: step.choices || [],
        topics: step.topics || [],
        materials_needed: step.materials_needed || [],
        correct_feedback: step.correct_feedback || null,
        wrong_feedback: step.wrong_feedback || null,
        max_attempts_feedback: step.max_attempts_feedback || null,
        ai_voice_style: step.ai_voice_style || null,
      },
    }));

    const { error: stepsError } = await supabase
      .from("activity_steps")
      .insert(stepRows);

    if (stepsError) throw stepsError;
}

/* ======================================================
   ASSIGN TO SELECTED LEARNERS
====================================================== */

if (learner_ids.length > 0) {
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

export async function getActivities(centerId?: string) {
  let query = supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });

  if (centerId) {
    query = query.eq("center_id", centerId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getSubmittedActivities(centerId: string) {
  const baseQuery = () =>
    supabase
      .from("activities")
      .select("*")
      .eq("center_id", centerId)
      .eq("status", "pending_review")
      .is("archived_at", null);

  const { data, error } = await baseQuery()
    .order("submitted_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (!error) {
    return data;
  }

  const canFallback =
    error.message?.includes("submitted_at") ||
    error.message?.includes("schema cache") ||
    error.code === "42703" ||
    error.code === "PGRST204";

  if (!canFallback) {
    throw error;
  }

  const fallback = await baseQuery().order("created_at", {
    ascending: false,
  });

  if (fallback.error) {
    throw fallback.error;
  }

  return fallback.data;
}

export async function publishSubmittedActivity({
  activityId,
  centerId,
  reviewedBy,
  feedback,
}: {
  activityId: string;
  centerId: string;
  reviewedBy: string;
  feedback?: string | null;
}) {
  const { data, error } = await supabase
    .from("activities")
    .update({
      status: "published",
      reviewed_by_center_admin_id: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_feedback: feedback || null,
      decline_reason: null,
    })
    .eq("id", activityId)
    .eq("center_id", centerId)
    .eq("status", "pending_review")
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function declineSubmittedActivity({
  activityId,
  centerId,
  reviewedBy,
  reason,
}: {
  activityId: string;
  centerId: string;
  reviewedBy: string;
  reason: string;
}) {
  const { data, error } = await supabase
    .from("activities")
    .update({
      status: "declined",
      reviewed_by_center_admin_id: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_feedback: reason,
      decline_reason: reason,
    })
    .eq("id", activityId)
    .eq("center_id", centerId)
    .eq("status", "pending_review")
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function resubmitTherapistActivity({
  activityId,
  centerId,
  therapistId,
  payload,
}: {
  activityId: string;
  centerId: string;
  therapistId: string;
  payload: any;
}) {
  const { steps = [], learner_ids: _learnerIds = [], ...activityData } =
    payload;

  const { data: existing, error: existingError } = await supabase
    .from("activities")
    .select("id, status, created_by_therapist_id")
    .eq("id", activityId)
    .eq("center_id", centerId)
    .single();

  if (existingError) throw existingError;

  if (existing.created_by_therapist_id !== therapistId) {
    throw new Error("Only the therapist who created this activity can revise it.");
  }

  if (!["declined", "draft", "pending_review", "published"].includes(existing.status)) {
    throw new Error("Only draft, declined, pending, or published activities can be revised.");
  }

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .update({
      ...activityData,
      status: activityData.status || "published",
      submitted_at:
        activityData.status === "pending_review"
          ? new Date().toISOString()
          : activityData.submitted_at ?? null,
      reviewed_at:
        activityData.status === "pending_review"
          ? null
          : activityData.reviewed_at ?? null,
      reviewed_by_center_admin_id:
        activityData.status === "pending_review"
          ? null
          : activityData.reviewed_by_center_admin_id ?? null,
      review_feedback: null,
      decline_reason: null,
    })
    .eq("id", activityId)
    .eq("center_id", centerId)
    .select()
    .single();

  if (activityError) throw activityError;

  const { error: deleteStepsError } = await supabase
    .from("activity_steps")
    .delete()
    .eq("activity_id", activityId);

  if (deleteStepsError) throw deleteStepsError;

  if (steps.length > 0) {
    const stepRows = steps.map((step: any, index: number) => ({
      activity_id: activityId,
      step_order: index + 1,
      step_type: step.step_type,
      instruction: step.instruction || null,
      prompt: step.prompt || null,
      media_url: step.media_url || null,
      expected_answers: step.expected_answers || [],
      accepted_variations: step.accepted_variations || [],
      can_repeat: step.can_repeat ?? true,
      can_give_hint: step.can_give_hint ?? true,
      can_skip: step.can_skip ?? true,
      ai_feedback_rules: step.ai_feedback_rules || {},
      metadata: {
        lesson: step.lesson || null,
        question: step.question || null,
        manual_scoring_enabled:
          step.manual_scoring_enabled === true,
        media: step.media || [],
        prompt_audio_url: step.prompt_audio_url || null,
        feedback_audio_urls: step.feedback_audio_urls || null,
        choices: step.choices || [],
        topics: step.topics || [],
        materials_needed: step.materials_needed || [],
        correct_feedback: step.correct_feedback || null,
        wrong_feedback: step.wrong_feedback || null,
        max_attempts_feedback: step.max_attempts_feedback || null,
        ai_voice_style: step.ai_voice_style || null,
      },
    }));

    const { error: stepsError } = await supabase
      .from("activity_steps")
      .insert(stepRows);

    if (stepsError) throw stepsError;
  }

  return activity;
}

export async function getActivityById(id: string, centerId?: string) {
  let query = supabase
    .from("activities")
    .select("*, activity_steps(*)")
    .eq("id", id);

  if (centerId) {
    query = query.eq("center_id", centerId);
  }

  const { data, error } = await query.single();

  if (error) throw error;

  const sortedSteps = (data.activity_steps || [])
    .sort((a: any, b: any) => a.step_order - b.step_order)
    .map((step: any) => {
      const metadata = step.metadata || {};

      return {
        id: step.id,
        step_order: step.step_order,
        step_type: step.step_type,

        prompt: step.prompt,
        instruction: step.instruction,

        lesson: metadata.lesson,
        question: metadata.question,

        media: metadata.media || [],
        choices: metadata.choices && metadata.choices.length > 0
                  ? metadata.choices
                  : step.step_type === "show_choose"
                  ? [
                      {
                        id: 1,
                        label: "Choice A",
                        image_url: null,
                        is_correct: true,
                      },
                      {
                        id: 2,
                        label: "Choice B",
                        image_url: null,
                        is_correct: false,
                      },
                    ]
                  : [],
        topics: metadata.topics || [],
        materials_needed: metadata.materials_needed || [],

        expected_answers: step.expected_answers || [],
        accepted_variations: step.accepted_variations || [],

        correct_feedback: metadata.correct_feedback,
        wrong_feedback: metadata.wrong_feedback,
        max_attempts_feedback:
          metadata.max_attempts_feedback ??
          step.ai_feedback_rules?.max_attempts_reached ??
          null,

        ai_voice_style: metadata.ai_voice_style,
        prompt_audio_url: metadata.prompt_audio_url,
        feedback_audio_urls: metadata.feedback_audio_urls,
        manual_scoring_enabled:
          metadata.manual_scoring_enabled === true,

        can_repeat: step.can_repeat,
        can_give_hint: step.can_give_hint,
        can_skip: step.can_skip,
      };
    });

  return {
    ...data,
    steps: sortedSteps,
    activity_steps: sortedSteps,
  };
}

export async function archiveActivityById(
  id: string,
  centerId: string,
) {
  const { data, error } = await supabase
    .from("activities")
    .update({
      archived_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("center_id", centerId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
