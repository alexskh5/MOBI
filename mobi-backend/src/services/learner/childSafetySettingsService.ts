import { supabase } from "../../config/supabase";

const MISSING_TABLE_CODES = new Set([
  "42P01",
  "PGRST205",
]);

function isMissingSafetyTable(error: unknown) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  return MISSING_TABLE_CODES.has(code);
}

export async function getLearnerChildSafetySettings(
  learnerId: string,
  centerId: string,
) {
  const { data, error } = await supabase
    .from("learner_child_safety_settings")
    .select("*")
    .eq("learner_id", learnerId)
    .eq("center_id", centerId)
    .maybeSingle();

  if (error) {
    if (isMissingSafetyTable(error)) {
      return null;
    }

    throw error;
  }

  return data;
}

export async function updateLearnerChildSafetySettings(
  learnerId: string,
  centerId: string,
  dailyScreenTimeLimitSeconds: number | null,
) {
  if (
    dailyScreenTimeLimitSeconds !== null &&
    (
      !Number.isInteger(dailyScreenTimeLimitSeconds) ||
      dailyScreenTimeLimitSeconds < 300 ||
      dailyScreenTimeLimitSeconds > 28_800
    )
  ) {
    throw new Error(
      "Daily screen time must be between 5 minutes and 8 hours, or null to disable the limit.",
    );
  }

  const { data, error } = await supabase
    .from("learner_child_safety_settings")
    .upsert(
      {
        learner_id: learnerId,
        center_id: centerId,
        daily_screen_time_limit_seconds:
          dailyScreenTimeLimitSeconds,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "learner_id",
      },
    )
    .select("*")
    .single();

  if (error) {
    if (isMissingSafetyTable(error)) {
      throw new Error(
        "Learner child-safety settings table is missing. Run the latest Supabase migration first.",
      );
    }

    throw error;
  }

  return data;
}
