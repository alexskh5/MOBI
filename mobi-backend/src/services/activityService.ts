// src/services/activityService.ts



import { supabase } from "../config/supabase";

export async function createActivityWithSteps(payload: any) {
  const { steps = [], ...activityData } = payload;

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .insert(activityData)
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
      metadata: step.metadata || {},
    }));

    const { error: stepsError } = await supabase
      .from("activity_steps")
      .insert(stepRows);

    if (stepsError) throw stepsError;
  }

  return activity;
}

export async function getActivities() {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getActivityById(id: string) {
  const { data, error } = await supabase
    .from("activities")
    .select("*, activity_steps(*)")
    .eq("id", id)
    .single();

  if (error) throw error;

  data.activity_steps = data.activity_steps.sort(
    (a: any, b: any) => a.step_order - b.step_order
  );

  return data;
}