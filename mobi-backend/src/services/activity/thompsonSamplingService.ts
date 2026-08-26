// mobi-backend/src/services/activity/thompsonSamplingService.ts

import { supabase } from "../../config/supabase";

/* =========================================================
   TYPES
========================================================= */

export interface BanditState {
  id: string;

  center_id: string;
  learner_id: string;
  activity_id: string;

  alpha: number;
  beta: number;

  successful_sessions: number;
  unsuccessful_sessions: number;

  selection_count: number;

  last_selected_at:
    | string
    | null;

  last_outcome_at:
    | string
    | null;

  created_at: string;
  updated_at: string;
}

export interface UpdateBanditOutcomeInput {
  centerId: string;
  learnerId: string;
  activityId: string;

  /*
    true:
      learner mastered the completed activity

    false:
      learner completed the activity but did not meet
      the mastery criteria
  */
  successful: boolean;
}

/* =========================================================
   HELPER: RANDOM NORMAL SAMPLE
========================================================= */

/*
  Box-Muller transform.

  We use this later to generate Gamma samples,
  which are then used to sample from a Beta distribution.
*/
function randomNormal() {
  let u = 0;
  let v = 0;

  while (u === 0) {
    u = Math.random();
  }

  while (v === 0) {
    v = Math.random();
  }

  return Math.sqrt(
    -2 * Math.log(u),
  ) *
    Math.cos(
      2 * Math.PI * v,
    );
}

/* =========================================================
   HELPER: SAMPLE GAMMA DISTRIBUTION
========================================================= */

/*
  Marsaglia and Tsang method.

  Thompson Sampling uses:

    Beta(alpha, beta)

  A Beta sample can be generated using two Gamma samples:

    X ~ Gamma(alpha, 1)
    Y ~ Gamma(beta, 1)

    Beta sample = X / (X + Y)
*/
function sampleGamma(
  shape: number,
): number {
  if (shape <= 0) {
    throw new Error(
      "Gamma shape must be greater than zero.",
    );
  }

  /*
    Handle shape < 1 using a standard transformation.
  */
  if (shape < 1) {
    const u =
      Math.random();

    return (
      sampleGamma(
        shape + 1,
      ) *
      Math.pow(
        u,
        1 / shape,
      )
    );
  }

  const d =
    shape - 1 / 3;

  const c =
    1 /
    Math.sqrt(
      9 * d,
    );

  while (true) {
    const x =
      randomNormal();

    let v =
      1 + c * x;

    if (v <= 0) {
      continue;
    }

    v =
      v * v * v;

    const u =
      Math.random();

    if (
      u <
      1 -
        0.0331 *
          x *
          x *
          x *
          x
    ) {
      return d * v;
    }

    if (
      Math.log(u) <
      0.5 * x * x +
        d *
          (
            1 -
            v +
            Math.log(v)
          )
    ) {
      return d * v;
    }
  }
}

/* =========================================================
   SAMPLE THOMPSON SCORE
========================================================= */

/*
  Returns a value between 0 and 1.

  Example:

    alpha = 5
    beta = 2

  may produce:

    0.82

  Another activity with:

    alpha = 2
    beta = 4

  may produce:

    0.31

  The adaptive selector will eventually choose the eligible
  activity with the highest sampled value.
*/
export function sampleThompsonScore(
  alpha: number,
  beta: number,
) {
  if (
    alpha <= 0 ||
    beta <= 0
  ) {
    throw new Error(
      "Alpha and beta must both be greater than zero.",
    );
  }

  const x =
    sampleGamma(alpha);

  const y =
    sampleGamma(beta);

  return x / (x + y);
}

/* =========================================================
   GET OR CREATE BANDIT STATE
========================================================= */

export async function getOrCreateBanditState(
  centerId: string,
  learnerId: string,
  activityId: string,
): Promise<BanditState> {
  /* =======================================================
     1. TRY EXISTING STATE
  ======================================================= */

  const {
    data: existingState,
    error: existingError,
  } = await supabase
    .from(
      "learner_activity_bandit_states",
    )
    .select("*")
    .eq(
      "center_id",
      centerId,
    )
    .eq(
      "learner_id",
      learnerId,
    )
    .eq(
      "activity_id",
      activityId,
    )
    .maybeSingle();

  if (existingError) {
    console.error(
      "Unable to fetch learner activity bandit state:",
      existingError,
    );

    throw existingError;
  }

  if (existingState) {
    return {
      ...existingState,

      /*
        Supabase/Postgres numeric columns may sometimes come
        back as strings, depending on typing.

        Normalize them here.
      */
      alpha:
        Number(
          existingState.alpha,
        ),

      beta:
        Number(
          existingState.beta,
        ),
    } as BanditState;
  }

  /* =======================================================
     2. CREATE NEUTRAL STATE

     Beta(1,1) = no preference / no learner evidence yet.
  ======================================================= */

  const {
    data: createdState,
    error: createError,
  } = await supabase
    .from(
      "learner_activity_bandit_states",
    )
    .insert({
      center_id:
        centerId,

      learner_id:
        learnerId,

      activity_id:
        activityId,

      alpha:
        1,

      beta:
        1,

      successful_sessions:
        0,

      unsuccessful_sessions:
        0,

      selection_count:
        0,
    })
    .select("*")
    .single();

  if (
    createError ||
    !createdState
  ) {
    console.error(
      "Unable to create learner activity bandit state:",
      createError,
    );

    throw (
      createError ??
      new Error(
        "Unable to create bandit state.",
      )
    );
  }

  return {
    ...createdState,

    alpha:
      Number(
        createdState.alpha,
      ),

    beta:
      Number(
        createdState.beta,
      ),
  } as BanditState;
}

/* =========================================================
   RECORD ACTIVITY SELECTION
========================================================= */

/*
  This is called when Thompson Sampling actually chooses an
  activity.

  Assigned activities should NOT increase this value because
  they were chosen by the therapist/center, not by Thompson.
*/
export async function recordBanditSelection(
  centerId: string,
  learnerId: string,
  activityId: string,
) {
  const state =
    await getOrCreateBanditState(
      centerId,
      learnerId,
      activityId,
    );

  const now =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabase
    .from(
      "learner_activity_bandit_states",
    )
    .update({
      selection_count:
        state.selection_count +
        1,

      last_selected_at:
        now,

      updated_at:
        now,
    })
    .eq(
      "id",
      state.id,
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "Unable to record Thompson activity selection:",
      error,
    );

    throw error;
  }

  return data;
}

/* =========================================================
   UPDATE THOMPSON STATE FROM SESSION OUTCOME
========================================================= */

/*
  IMPORTANT:

  Thompson state is updated at the ACTIVITY SESSION level.

  We do NOT update alpha/beta after every speech attempt.

  Successful completed activity:
      alpha += 1

  Completed but not mastered:
      beta += 1

  Skipped/interrupted/stopped activities should not call
  this function automatically.
*/
export async function updateBanditOutcome(
  input: UpdateBanditOutcomeInput,
) {
  const {
    centerId,
    learnerId,
    activityId,
    successful,
  } = input;

  const state =
    await getOrCreateBanditState(
      centerId,
      learnerId,
      activityId,
    );

  const nextAlpha =
    successful
      ? state.alpha + 1
      : state.alpha;

  const nextBeta =
    successful
      ? state.beta
      : state.beta + 1;

  const nextSuccessfulSessions =
    successful
      ? state.successful_sessions +
        1
      : state.successful_sessions;

  const nextUnsuccessfulSessions =
    successful
      ? state.unsuccessful_sessions
      : state.unsuccessful_sessions +
        1;

  const now =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabase
    .from(
      "learner_activity_bandit_states",
    )
    .update({
      alpha:
        nextAlpha,

      beta:
        nextBeta,

      successful_sessions:
        nextSuccessfulSessions,

      unsuccessful_sessions:
        nextUnsuccessfulSessions,

      last_outcome_at:
        now,

      updated_at:
        now,
    })
    .eq(
      "id",
      state.id,
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "Unable to update learner activity bandit state:",
      error,
    );

    throw error;
  }

  return {
    ...data,

    alpha:
      Number(
        data.alpha,
      ),

    beta:
      Number(
        data.beta,
      ),
  };
}