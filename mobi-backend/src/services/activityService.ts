//mobi-backend/src/services/speech/activityService.ts

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

      metadata: {
        lesson: step.lesson || null,
        question: step.question || null,
        media: step.media || [],
        choices: step.choices || [],
        topics: step.topics || [],
        materials_needed: step.materials_needed || [],
        correct_feedback: step.correct_feedback || null,
        wrong_feedback: step.wrong_feedback || null,
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

        ai_voice_style: metadata.ai_voice_style,

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