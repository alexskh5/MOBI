import { supabase } from "../../config/supabase";
import {
  getUtcStartOfCenterDay,
} from "../time/centerTimeService";

export async function getDailyScreenTimeStatus(input: {
  centerId: string;
  learnerId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const { data: settings, error: settingsError } = await supabase
    .from("learner_child_safety_settings")
    .select("daily_screen_time_limit_seconds")
    .eq("center_id", input.centerId)
    .eq("learner_id", input.learnerId)
    .maybeSingle();

  if (settingsError) {
    if (
      settingsError.code === "PGRST205" ||
      settingsError.code === "42P01" ||
      settingsError.code === "42703"
    ) {
      return {
        limitSeconds: null,
        usedSeconds: 0,
        remainingSeconds: null,
        limitReached: false,
      };
    }

    throw settingsError;
  }

  const limitSeconds =
    typeof settings?.daily_screen_time_limit_seconds === "number"
      ? settings.daily_screen_time_limit_seconds
      : null;

  if (limitSeconds === null) {
    return {
      limitSeconds: null,
      usedSeconds: 0,
      remainingSeconds: null,
      limitReached: false,
    };
  }

  const dayStart = getUtcStartOfCenterDay(now);
  const dayStartIso = dayStart.toISOString();
  const { data: sessions, error: sessionsError } = await supabase
    .from("learner_activity_sessions")
    .select(`
      status,
      started_at,
      completed_at,
      total_duration_seconds,
      activity:activities!inner(
        delivery_mode
      )
    `)
    .eq("center_id", input.centerId)
    .eq("learner_id", input.learnerId)
    .lte("started_at", now.toISOString())
    .or(
      "started_at.gte." +
        dayStartIso +
        ",completed_at.gte." +
        dayStartIso +
        ",status.eq.in_progress",
    );

  if (sessionsError) {
    throw sessionsError;
  }

  const usedSeconds = (sessions ?? []).reduce(
    (total, session) => {
      const relation = session.activity;
      const activity = Array.isArray(relation)
        ? relation[0]
        : relation;

      if (activity?.delivery_mode === "guided_off_screen") {
        return total;
      }

      const startedAt = Date.parse(session.started_at);

      if (!Number.isFinite(startedAt)) {
        return total;
      }

      const crossesCenterMidnight = startedAt < dayStart.getTime();
      const completedAt = Date.parse(session.completed_at ?? "");
      const duration =
        session.status === "in_progress" || crossesCenterMidnight
          ? Math.max(
              0,
              Math.round(
                (
                  Math.min(
                    now.getTime(),
                    Number.isFinite(completedAt)
                      ? completedAt
                      : now.getTime(),
                  ) -
                  Math.max(dayStart.getTime(), startedAt)
                ) /
                  1000,
              ),
            )
          : Math.max(
              0,
              Number(session.total_duration_seconds ?? 0),
            );

      return total + duration;
    },
    0,
  );

  return {
    limitSeconds,
    usedSeconds,
    remainingSeconds: Math.max(0, limitSeconds - usedSeconds),
    limitReached: usedSeconds >= limitSeconds,
  };
}
