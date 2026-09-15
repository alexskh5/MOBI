import { supabase } from "../../config/supabase";
import type {
  SelectedActivityResult,
} from "./activitySelectionService";

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

async function findOpenRecommendation(
  learningSessionId: string,
) {
  const { data, error } = await supabase
    .from("learner_activity_recommendations")
    .select("*")
    .eq("learning_session_id", learningSessionId)
    .in("status", ["pending", "starting"])
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  const now = Date.now();

  return (data ?? []).find(
    (recommendation) =>
      recommendation.status === "starting" ||
      Date.parse(recommendation.expires_at) > now,
  ) ?? null;
}

export async function savePendingActivityRecommendation(input: {
  learningSessionId: string;
  centerId: string;
  learnerId: string;
  selection: SelectedActivityResult;
}) {
  const existing = await findOpenRecommendation(
    input.learningSessionId,
  );

  if (existing) {
    return existing;
  }

  const now = new Date();

  const { error: expireError } = await supabase
    .from("learner_activity_recommendations")
    .update({
      status: "expired",
      updated_at: now.toISOString(),
    })
    .eq("learning_session_id", input.learningSessionId)
    .eq("status", "pending");

  if (expireError) {
    throw expireError;
  }

  const expiresAt = new Date(
    now.getTime() + 30 * 60 * 1000,
  ).toISOString();
  const { data, error } = await supabase
    .from("learner_activity_recommendations")
    .insert({
      learning_session_id: input.learningSessionId,
      center_id: input.centerId,
      learner_id: input.learnerId,
      activity_id: input.selection.activityId,
      assignment_id: input.selection.assignmentId,
      selection_source: input.selection.source,
      selection_algorithm: input.selection.selectionAlgorithm,
      selection_reason: input.selection.selectionReason,
      status: "pending",
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (isUniqueViolation(error)) {
      const concurrent = await findOpenRecommendation(
        input.learningSessionId,
      );

      if (concurrent) {
        return concurrent;
      }
    }

    throw error ?? new Error("Unable to save activity recommendation.");
  }

  return data;
}

export async function getActivityRecommendation(input: {
  recommendationId: string;
  learningSessionId: string;
  centerId: string;
  learnerId: string;
}) {
  const { data, error } = await supabase
    .from("learner_activity_recommendations")
    .select(`
      *,
      activity:activities!inner(*)
    `)
    .eq("id", input.recommendationId)
    .eq("learning_session_id", input.learningSessionId)
    .eq("center_id", input.centerId)
    .eq("learner_id", input.learnerId)
    .eq("activity.status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "The activity recommendation was not found.",
    );
  }

  if (
    data.status === "pending" &&
    Date.parse(data.expires_at) <= Date.now()
  ) {
    await supabase
      .from("learner_activity_recommendations")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("status", "pending");

    throw new Error(
      "The activity recommendation expired. Request a fresh recommendation.",
    );
  }

  return data;
}

export async function claimActivityRecommendation(input: {
  recommendationId: string;
  learningSessionId: string;
  centerId: string;
  learnerId: string;
}) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("learner_activity_recommendations")
    .update({
      status: "starting",
      updated_at: now,
    })
    .eq("id", input.recommendationId)
    .eq("learning_session_id", input.learningSessionId)
    .eq("center_id", input.centerId)
    .eq("learner_id", input.learnerId)
    .eq("status", "pending")
    .gt("expires_at", now)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "The activity recommendation is expired, already used, or being started.",
    );
  }

  return data;
}

export async function releaseActivityRecommendation(
  recommendationId: string,
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("learner_activity_recommendations")
    .update({
      status: "pending",
      updated_at: now,
    })
    .eq("id", recommendationId)
    .eq("status", "starting")
    .gt("expires_at", now)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return "pending" as const;
  }

  const { error: expireError } = await supabase
    .from("learner_activity_recommendations")
    .update({
      status: "expired",
      updated_at: now,
    })
    .eq("id", recommendationId)
    .eq("status", "starting")
    .lte("expires_at", now);

  if (expireError) {
    throw expireError;
  }

  return "expired" as const;
}

export async function markActivityRecommendationStarted(
  recommendationId: string,
  activitySessionId: string,
) {
  const { data, error } = await supabase.rpc(
    "complete_activity_recommendation",
    {
      p_recommendation_id: recommendationId,
      p_activity_session_id: activitySessionId,
    },
  );

  if (error || !data) {
    throw error ?? new Error("Unable to consume activity recommendation.");
  }

  return data;
}
