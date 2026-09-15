import dotenv from "dotenv";

dotenv.config({ quiet: true });

type Recommendation = {
  success?: boolean;
  nextActivity?: {
    activityId: string;
    assignmentId: string | null;
    source: string;
    selectionAlgorithm: string | null;
    selectionReason: Record<string, unknown>;
    activity: {
      id: string;
      title: string;
      speech_ladder_level?: string | null;
    };
  } | null;
};

type ActivityStep = {
  id: string;
  step_order?: number;
  step_type: string;
  expected_answers?: string[];
  accepted_variations?: string[];
  choices?: Array<{
    id: string | number;
    label?: string;
    is_correct?: boolean;
  }>;
  metadata?: {
    choices?: Array<{
      id: string | number;
      label?: string;
      is_correct?: boolean;
    }>;
  };
};

const baseUrl =
  process.env.MOBI_API_BASE_URL ??
  "http://localhost:5052";

const centerId =
  process.env.MOBI_PROOF_CENTER_ID ??
  "d5ae1649-0343-46d4-b433-575c97e064e1";

const learnerId =
  process.env.MOBI_PROOF_LEARNER_ID ??
  "6cf9a9ff-2ad9-49ec-b71b-dec0451fd5bc";

const actorId =
  process.env.MOBI_PROOF_ACTOR_ID ??
  centerId;

const actorRole =
  process.env.MOBI_PROOF_ACTOR_ROLE ??
  "center_admin";

const proofOutcome =
  process.env.MOBI_PROOF_OUTCOME === "failure"
    ? "failure"
    : "success";

const maxSessions =
  Math.max(
    1,
    Number(
      process.env.MOBI_PROOF_MAX_SESSIONS ??
      1,
    ),
  );

const headers = {
  "Content-Type": "application/json",
  "x-center-id": centerId,
  "x-actor-id": actorId,
  "x-actor-role": actorRole,
};

async function readJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${baseUrl}${path}`,
    {
      ...init,
      headers: {
        ...headers,
        ...(init.headers ?? {}),
      },
    },
  );

  const body = await response.text();

  let parsed: unknown = null;

  try {
    parsed = body ? JSON.parse(body) : null;
  } catch {
    parsed = body;
  }

  if (!response.ok) {
    throw new Error(
      `${init.method ?? "GET"} ${path} failed with ${response.status}: ${body}`,
    );
  }

  return parsed as T;
}

function summarizeRecommendation(
  label: string,
  recommendation: Recommendation,
) {
  const next =
    recommendation.nextActivity;

  console.log(`\n${label}`);

  if (!next) {
    console.log("  No eligible recommendation.");
    return;
  }

  const reason =
    next.selectionReason ?? {};

  console.log(`  Activity: ${next.activity.title}`);
  console.log(`  Activity ID: ${next.activityId}`);
  console.log(`  Source: ${next.source}`);
  console.log(`  Algorithm: ${next.selectionAlgorithm}`);
  console.log(`  Learner state: ${String(reason.learnerState ?? "n/a")}`);
  console.log(`  Eligible activities: ${String(reason.eligibleActivityCount ?? "n/a")}`);
  console.log(`  Selected final score: ${String(reason.selectedFinalScore ?? "n/a")}`);
  console.log(`  Selected Thompson sample: ${String(reason.selectedThompsonSample ?? "n/a")}`);

  const candidateSamples =
    Array.isArray(reason.candidateSamples)
      ? reason.candidateSamples
      : [];

  if (candidateSamples.length > 0) {
    console.log("  Candidate alpha/beta scores:");

    for (const candidate of candidateSamples) {
      const row =
        candidate as Record<string, unknown>;

      console.log(
        `    - ${String(row.activityId)} alpha=${String(row.alpha)} beta=${String(row.beta)} final=${String(row.finalSelectionScore)}`,
      );
    }
  }
}

function getInteractiveStep(
  steps: ActivityStep[],
) {
  return steps.find((step) =>
    ["ask", "conversation", "show_choose", "do_it"].includes(
      step.step_type,
    ),
  ) ?? null;
}

async function completeRecommendedSession(
  recommendation: NonNullable<Recommendation["nextActivity"]>,
) {
  const start =
    await readJson<{
      session: { id: string };
    }>(
      "/api/activity-sessions/start",
      {
        method: "POST",
        body: JSON.stringify({
          learnerId,
          activityId: recommendation.activityId,
          assignmentId: recommendation.assignmentId,
          sessionSource:
            recommendation.source === "adaptive_fallback"
              ? "adaptive"
              : recommendation.source,
          selectionAlgorithm:
            recommendation.selectionAlgorithm,
          selectionReason:
            recommendation.selectionReason,
        }),
      },
    );

  const activity =
    await readJson<{
      steps?: ActivityStep[];
      activity_steps?: ActivityStep[];
    }>(
      `/activities/${recommendation.activityId}`,
    );

  const steps =
    activity.steps ??
    activity.activity_steps ??
    [];

  const interactiveStep =
    getInteractiveStep(steps);

  if (interactiveStep) {
    const choices =
      interactiveStep.choices ??
      interactiveStep.metadata?.choices ??
      [];

    const correctChoice =
      choices.find((choice) => choice.is_correct === true) ??
      null;

    const responseType =
      interactiveStep.step_type === "show_choose"
        ? "choice"
        : interactiveStep.step_type === "do_it"
          ? "action"
          : interactiveStep.step_type === "conversation"
            ? "conversation"
            : "speech";

    const transcript =
      proofOutcome === "success"
        ? interactiveStep.expected_answers?.[0] ??
          correctChoice?.label ??
          "I did it"
        : "__incorrect_proof_response__";

    await readJson(
      `/api/activity-sessions/${start.session.id}/respond`,
      {
        method: "POST",
        body: JSON.stringify({
          learnerId,
          attemptOrder: 1,
          stepAttemptNumber: 1,
          activityStepId: interactiveStep.id,
          responseType,
          transcript,
          selectedChoiceId:
            proofOutcome === "success"
              ? correctChoice?.id ?? null
              : null,
          actionCompleted:
            responseType === "action"
              ? proofOutcome === "success"
              : null,
          sttConfidence: 0.95,
          sttProvider: "adaptive-proof",
          sttModel: "script",
          responseTimeMs: 1200,
        }),
      },
    );
  }

  await readJson(
    `/api/activity-sessions/${start.session.id}/finish`,
    {
      method: "POST",
      body: JSON.stringify({
        learnerId,
        status: "completed",
        totalDurationSeconds: 8,
      }),
    },
  );

  return start.session.id;
}

async function run() {
  console.log("MOBI adaptive recommendation proof");
  console.log(`Learner: ${learnerId}`);
  console.log(`Outcome to simulate: ${proofOutcome}`);
  console.log(`Maximum proof sessions: ${maxSessions}`);

  let sawAdaptiveFallback = false;

  for (let index = 1; index <= maxSessions; index += 1) {
    const before =
      await readJson<Recommendation>(
        `/api/activity-sessions/next?learnerId=${encodeURIComponent(learnerId)}`,
      );

    summarizeRecommendation(
      `Before completed session ${index}`,
      before,
    );

    if (!before.nextActivity) {
      return;
    }

    if (before.nextActivity.source === "adaptive_fallback") {
      sawAdaptiveFallback = true;
    } else {
      console.log(
        "  Note: assigned activities correctly take priority before adaptive fallback.",
      );
    }

    const sessionId =
      await completeRecommendedSession(
        before.nextActivity,
      );

    console.log(
      `\nCompleted proof session ${index}: ${sessionId}`,
    );

    const after =
      await readJson<Recommendation>(
        `/api/activity-sessions/next?learnerId=${encodeURIComponent(learnerId)}`,
      );

    summarizeRecommendation(
      `After completed session ${index}`,
      after,
    );

    if (sawAdaptiveFallback) {
      return;
    }
  }

  if (!sawAdaptiveFallback) {
    console.log(
      "\nAdaptive fallback was not reached yet because assigned activities still have priority. Increase MOBI_PROOF_MAX_SESSIONS only if you intentionally want the proof script to complete more assigned activities first.",
    );
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
