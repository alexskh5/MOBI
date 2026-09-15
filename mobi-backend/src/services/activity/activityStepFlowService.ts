export type InteractiveStepResponseType =
  | "speech"
  | "choice"
  | "action"
  | "conversation";

export interface ActivityFlowStep {
  id?: unknown;
  step_order?: unknown;
  step_type?: unknown;
}

export interface ActivityFlowAttempt {
  activity_step_id?: unknown;
  response_type?: unknown;
  expected_answers?: unknown;
  accepted_variations?: unknown;
  evaluation_settings?: unknown;
  communication_attempt?: unknown;
  target_achieved?: unknown;
  was_skipped?: unknown;
}

export function getStepResponseType(
  stepType: string,
): InteractiveStepResponseType | null {
  switch (stepType) {
    case "ask":
      return "speech";
    case "show_choose":
      return "choice";
    case "do_it":
      return "action";
    case "conversation":
      return "conversation";
    default:
      return null;
  }
}

function hasSpeechTarget(attempt: ActivityFlowAttempt) {
  const evaluationSettings =
    typeof attempt.evaluation_settings === "object" &&
    attempt.evaluation_settings !== null &&
    !Array.isArray(attempt.evaluation_settings)
      ? attempt.evaluation_settings as Record<string, unknown>
      : {};
  const variationsEnabled =
    evaluationSettings.acceptedVariationsEnabled !== false;

  return (
    (Array.isArray(attempt.expected_answers) &&
      attempt.expected_answers.length > 0) ||
    (variationsEnabled &&
      Array.isArray(attempt.accepted_variations) &&
      attempt.accepted_variations.length > 0)
  );
}

export function isInteractiveStepResolved(
  step: ActivityFlowStep,
  attempts: ActivityFlowAttempt[],
  maximumAttempts: number,
) {
  const stepId = typeof step.id === "string" ? step.id : null;
  const stepType =
    typeof step.step_type === "string" ? step.step_type : "";
  const responseType = getStepResponseType(stepType);

  if (!stepId || !responseType) {
    return true;
  }

  const stepAttempts = attempts.filter(
    (attempt) => attempt.activity_step_id === stepId,
  );

  if (
    stepAttempts.some(
      (attempt) =>
        attempt.was_skipped === true ||
        attempt.target_achieved === true,
    )
  ) {
    return true;
  }

  const normalizedMaximumAttempts =
    Number.isInteger(maximumAttempts) && maximumAttempts > 0
      ? maximumAttempts
      : 3;

  if (stepAttempts.length >= normalizedMaximumAttempts) {
    return true;
  }

  return stepAttempts.some((attempt) => {
    if (attempt.communication_attempt !== true) {
      return false;
    }

    if (responseType === "conversation") {
      return true;
    }

    return responseType === "speech" && !hasSpeechTarget(attempt);
  });
}

export function getNextInteractiveStep<T extends ActivityFlowStep>(
  steps: T[],
  attempts: ActivityFlowAttempt[],
  maximumAttempts: number,
): T | null {
  const interactiveSteps = steps
    .filter(
      (step) =>
        typeof step.step_type === "string" &&
        getStepResponseType(step.step_type) !== null,
    )
    .sort(
      (a, b) =>
        Number(a.step_order ?? 0) - Number(b.step_order ?? 0),
    );

  return interactiveSteps.find(
    (step) =>
      !isInteractiveStepResolved(
        step,
        attempts,
        maximumAttempts,
      ),
  ) ?? null;
}

export function areInteractiveStepsResolved(
  steps: ActivityFlowStep[],
  attempts: ActivityFlowAttempt[],
  maximumAttempts: number,
) {
  return getNextInteractiveStep(
    steps,
    attempts,
    maximumAttempts,
  ) === null;
}
