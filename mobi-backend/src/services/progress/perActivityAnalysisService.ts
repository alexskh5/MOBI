//mobi-backend/src/services/progress/perActivityAnalysisService.ts

import { supabase } from "../../config/supabase";

import {
  getProgressDateRange,
  type LearnerProgressPeriod,
} from "./learnerProgressService";

/* =========================================================
   INPUT
========================================================= */

export interface GetPerActivityAnalysisInput {
  centerId: string;

  learnerId: string;

  period: LearnerProgressPeriod;

  anchorDate?: string;
}

/* =========================================================
   STEP RESULT
========================================================= */

export interface PerActivityStepResult {
  id: string;

  stepNumber: number;

  stepType: string;

  question: string;

  learnerAnswer: string;

  expectedAnswer:
    string | null;

  status:
    | "correct"
    | "needs-practice"
    | "approximation"
    | "communication-attempt"
    | "no-response"
    | "skipped"
    | null;

  supportUsed:
    string | null;

  responseType: string | null;

  matchingMethod: string | null;

  shouldScore: boolean;

  communicationAttempt: boolean;

  approximationDetected: boolean;

  skipReason: string | null;
}

/* =========================================================
   ACTIVITY RESULT
========================================================= */

export interface PerActivityResult {
  id: string;

  activityTitle: string;

  activityDomain:
    string | null;

  correctAnswers: number;

  needsPractice: number;

  communicationAttempts: number;

  speechApproximations: number;

  targetAchievements: number;

  successRate: number;

  steps:
    PerActivityStepResult[];
}

/* =========================================================
   PAGE 4 RESULT
========================================================= */

export interface PerActivityAnalysisResult {
  learnerId: string;

  period:
    LearnerProgressPeriod;

  dateRange: {
    start: string;

    end: string;
  };

  activities:
    PerActivityResult[];
}

/* =========================================================
   GET PER ACTIVITY ANALYSIS
========================================================= */

export async function getPerActivityAnalysis(
  input: GetPerActivityAnalysisInput,
): Promise<PerActivityAnalysisResult> {
  const {
    centerId,
    learnerId,
    period,
    anchorDate,
  } = input;

  const dateRange =
    getProgressDateRange(
      period,
      anchorDate,
    );

  /* =======================================================
     1. VERIFY LEARNER
  ======================================================= */

  const {
    data: learner,
    error: learnerError,
  } = await supabase
    .from("learners")
    .select(`
      id,
      center_id
    `)
    .eq(
      "id",
      learnerId,
    )
    .eq(
      "center_id",
      centerId,
    )
    .single();

  if (
    learnerError ||
    !learner
  ) {
    console.error(
      "Unable to verify learner for per-activity analysis:",
      learnerError,
    );

    throw new Error(
      "Learner was not found in this center.",
    );
  }

  /* =======================================================
     2. GET ACTIVITY SESSIONS FOR THE PERIOD
  ======================================================= */

  const {
    data: sessionsData,
    error: sessionsError,
  } = await supabase
    .from(
      "learner_activity_sessions",
    )
    .select(`
      id,
      activity_id,
      status,
      started_at,

      activity:activities!inner(
        id,
        title,
        activity_domain
      )
    `)
    .eq(
      "center_id",
      centerId,
    )
    .eq(
      "learner_id",
      learnerId,
    )
    .gte(
      "started_at",
      dateRange.start,
    )
    .lte(
      "started_at",
      dateRange.end,
    );

  if (sessionsError) {
    console.error(
      "Unable to fetch sessions for per-activity analysis:",
      sessionsError,
    );

    throw sessionsError;
  }

  const sessions =
    sessionsData ?? [];

  if (
    sessions.length === 0
  ) {
    return {
      learnerId,
      period,
      dateRange,
      activities: [],
    };
  }

  const sessionIds =
    sessions.map(
      (session) =>
        session.id,
    );

  /* =======================================================
     3. GET ATTEMPTS
  ======================================================= */

  const {
    data: attemptsData,
    error: attemptsError,
  } = await supabase
    .from(
      "learner_activity_attempts",
    )
    .select(`
      id,
      session_id,
      activity_step_id,
      attempt_order,
      response_type,
      transcript,
      expected_choice_id,
      selected_choice_id,
      expected_answers,
      matched_answer,
      communication_attempt,
      approximation_detected,
      target_achieved,
      accepted,
      is_correct,
      should_score,
      matching_method,
      hint_used,
      repeat_prompt_used,
      one_more_try_used,
      was_skipped,
      skip_reason
    `)
    .in(
      "session_id",
      sessionIds,
    )
    .order(
      "attempt_order",
      {
        ascending: true,
      },
    );

  if (attemptsError) {
    console.error(
      "Unable to fetch attempts for per-activity analysis:",
      attemptsError,
    );

    throw attemptsError;
  }

  const attempts =
    attemptsData ?? [];

  /* =======================================================
     4. GET ACTIVITY STEPS USED BY ATTEMPTS
  ======================================================= */

  const stepIds =
    Array.from(
      new Set(
        attempts
          .map(
            (attempt) =>
              attempt.activity_step_id,
          )
          .filter(
            (
              value,
            ): value is string =>
              typeof value ===
              "string",
          ),
      ),
    );

  const stepMap =
    new Map<
      string,
      {
        id: string;

        step_order:
          number;

        step_type:
          string;

        prompt:
          string | null;

        instruction:
          string | null;

        expected_answers:
          string[] | null;

        metadata:
          Record<
            string,
            unknown
          > | null;
      }
    >();

  if (
    stepIds.length > 0
  ) {
    const {
      data: stepsData,
      error: stepsError,
    } = await supabase
      .from(
        "activity_steps",
      )
      .select(`
        id,
        step_order,
        step_type,
        prompt,
        instruction,
        expected_answers,
        metadata
      `)
      .in(
        "id",
        stepIds,
      );

    if (stepsError) {
      console.error(
        "Unable to fetch activity steps for per-activity analysis:",
        stepsError,
      );

      throw stepsError;
    }

    for (
      const step of
      stepsData ?? []
    ) {
      stepMap.set(
        step.id,
        {
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

          expected_answers:
            step.expected_answers,

          metadata:
            typeof step.metadata ===
              "object" &&
            step.metadata !== null
              ? step.metadata as
                  Record<
                    string,
                    unknown
                  >
              : null,
        },
      );
    }
  }

  /* =======================================================
     5. GROUP SESSIONS BY ACTIVITY
  ======================================================= */

  const activityGroups =
    new Map<
      string,
      {
        activityId:
          string;

        activityTitle:
          string;

        activityDomain:
          string | null;

        sessionIds:
          string[];
      }
    >();

  for (
    const session of
    sessions
  ) {
    const activityRelation =
      session.activity;

    const activity =
      Array.isArray(
        activityRelation,
      )
        ? activityRelation[0]
        : activityRelation;

    if (!activity) {
      continue;
    }

    const existing =
      activityGroups.get(
        session.activity_id,
      );

    if (existing) {
      existing.sessionIds.push(
        session.id,
      );

      continue;
    }

    activityGroups.set(
      session.activity_id,
      {
        activityId:
          activity.id,

        activityTitle:
          activity.title,

        activityDomain:
          activity.activity_domain ??
          null,

        sessionIds: [
          session.id,
        ],
      },
    );
  }

  /* =======================================================
     6. BUILD PER-ACTIVITY RESULTS
  ======================================================= */

  const activities:
    PerActivityResult[] = [];

  for (
    const group of
    activityGroups.values()
  ) {
    const activityAttempts =
      attempts.filter(
        (attempt) =>
          group.sessionIds.includes(
            attempt.session_id,
          ),
      );

    const communicationAttempts =
      activityAttempts.filter(
        (attempt) =>
          attempt.communication_attempt ===
          true,
      ).length;

    const speechApproximations =
      activityAttempts.filter(
        (attempt) =>
          attempt.approximation_detected ===
          true,
      ).length;

    const targetAchievements =
      activityAttempts.filter(
        (attempt) => {
          if (
            attempt.target_achieved ===
            true
          ) {
            return true;
          }

          return (
            attempt.accepted ===
              true &&
            attempt.is_correct ===
              true &&
            attempt.approximation_detected !==
              true
          );
        },
      ).length;

    const scoredAttempts =
      activityAttempts.filter(
        (attempt) =>
          attempt.should_score === true &&
          typeof attempt.is_correct === "boolean",
      );

    const correctAnswers =
      scoredAttempts.filter(
        (attempt) =>
          attempt.is_correct ===
          true,
      ).length;

    const needsPractice =
      scoredAttempts.filter(
        (attempt) =>
          attempt.is_correct ===
          false,
      ).length;

    const successRate =
      scoredAttempts.length > 0
        ? Math.round(
            (
              correctAnswers /
              scoredAttempts.length
            ) *
            100,
          )
        : 0;

    /* =====================================================
       STEP HISTORY
    ===================================================== */

    const steps:
      PerActivityStepResult[] =
        activityAttempts.map(
          (attempt) => {
            const step =
              attempt.activity_step_id
                ? stepMap.get(
                    attempt.activity_step_id,
                  )
                : undefined;

            const metadata =
              step?.metadata ??
              {};

            const metadataQuestion =
              typeof metadata.question ===
                "string"
                ? metadata.question
                : null;

            const question =
              metadataQuestion ??
              step?.prompt ??
              step?.instruction ??
              "Learner response";

            const expectedAnswers =
              Array.isArray(
                attempt.expected_answers,
              )
                ? attempt.expected_answers
                : step
                    ?.expected_answers ??
                  [];

            const expectedAnswer =
              attempt.matched_answer ??
              attempt.expected_choice_id ??
              expectedAnswers[0] ??
              null;

            let learnerAnswer =
              "";

            if (attempt.was_skipped === true) {
              learnerAnswer = "Step skipped";
            } else if (
              typeof attempt.transcript ===
                "string" &&
              attempt.transcript.trim()
            ) {
              learnerAnswer =
                attempt.transcript;
            } else if (
              typeof attempt.selected_choice_id ===
                "string" &&
              attempt.selected_choice_id
            ) {
              learnerAnswer =
                `Choice ${attempt.selected_choice_id}`;
            } else if (
              attempt.response_type ===
              "action"
            ) {
              learnerAnswer =
                attempt.target_achieved === true
                  ? "Action completed"
                  : "Action not completed";
            } else {
              learnerAnswer =
                "No response recorded";
            }

            let status:
              | "correct"
              | "needs-practice"
              | "approximation"
              | "communication-attempt"
              | "no-response"
              | "skipped"
              | null =
              null;

            if (attempt.was_skipped === true) {
              status = "skipped";
            } else if (attempt.target_achieved === true) {
              status =
                "correct";
            } else if (attempt.approximation_detected === true) {
              status = "approximation";
            } else if (
              attempt.should_score === true &&
              attempt.is_correct === false
            ) {
              status =
                "needs-practice";
            } else if (attempt.communication_attempt === true) {
              status = "communication-attempt";
            } else if (attempt.response_type !== "system") {
              status = "no-response";
            }

            const supportUsedParts:
              string[] = [];

            if (
              attempt.hint_used ===
              true
            ) {
              supportUsedParts.push(
                "Hint",
              );
            }

            if (
              attempt.repeat_prompt_used ===
              true
            ) {
              supportUsedParts.push(
                "Repeated prompt",
              );
            }

            if (
              attempt.one_more_try_used ===
              true
            ) {
              supportUsedParts.push(
                "One More Try",
              );
            }

            return {
              id:
                attempt.id,

              stepNumber:
                step
                  ?.step_order ??
                attempt.attempt_order,

              stepType:
                step
                  ?.step_type ??
                attempt.response_type ??
                "Response",

              question,

              learnerAnswer,

              expectedAnswer,

              status,

              supportUsed:
                supportUsedParts.length >
                0
                  ? supportUsedParts.join(
                      ", ",
                    )
                  : null,

              responseType:
                attempt.response_type ?? null,

              matchingMethod:
                attempt.matching_method ?? null,

              shouldScore:
                attempt.should_score === true,

              communicationAttempt:
                attempt.communication_attempt === true,

              approximationDetected:
                attempt.approximation_detected === true,

              skipReason:
                typeof attempt.skip_reason === "string"
                  ? attempt.skip_reason
                  : null,
            };
          },
        );

    activities.push({
      id:
        group.activityId,

      activityTitle:
        group.activityTitle,

      activityDomain:
        group.activityDomain,

      correctAnswers,

      needsPractice,

      communicationAttempts,

      speechApproximations,

      targetAchievements,

      successRate,

      steps,
    });
  }

  /* =======================================================
     7. RETURN
  ======================================================= */

  return {
    learnerId,

    period,

    dateRange,

    activities,
  };
}
