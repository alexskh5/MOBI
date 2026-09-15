# MOBI Adaptive Engine Continuation

## System Goal

MOBI is an AI-adaptive speech training and early social-readiness system for
minimally verbal children with autism. It supports learners without diagnosing
them or reducing communication to simple correct/incorrect scoring.

Communication attempts, approximations, low-confidence STT, inactivity,
sensory needs, breaks, and caregiver decisions must be handled respectfully.
Speech Ladder changes always require therapist approval.

## Current Status

The backend Adaptive Engine and Progress stabilization pass is implemented and
focused tests pass. It is code-ready for staging migration review, but it must
not yet be considered pilot-ready with real learner data. The migration,
authenticated identity, staging integration tests, and therapist-led safety
review are still required.

Do not discard pre-existing user changes in:

- src/controllers/learningSessionController.ts
- src/routes/learningSessionRoutes.ts
- src/services/activity/learningSessionService.ts
- ../mobi-mobile/src/services/api.ts
- ../mobi-web/src/routes/AppRoutes.tsx

## Changes Completed In The Stabilization Pass

- Improved speech normalization and matching.
- Prevented empty-answer and unsafe substring matches.
- Changed phonetic matches into unscored approximation evidence.
- Added STT confidence handling.
- Made the evaluator authoritative for should_score.
- Fixed target-awareness mismatch between scoring and adaptive decisions.
- Added attempt aggregation after every saved response.
- Added configurable hint, repeat, inactivity, and Thompson-weight settings.
- Added child screen-time settings and screen-time checking.
- Excluded guided off-screen activities from screen-time usage.
- Added backend center context through the x-center-id header.
- Removed public raw-attempt and standalone activity-session routes.
- Started support for speech, conversation, choice, and action responses.
- Added short-lived backend-owned next-activity recommendations.
- Added therapist-gated Speech Ladder recommendations and decisions.
- Added domain-specific speech/social mastery calculations.
- Added richer per-activity progress statuses.
- Added a combined live progress-report endpoint.
- Started a database migration:
  migrations/20260908_adaptive_engine_pilot.sql
- Made interactive step order and activity completion backend-owned.
- Added an adult-confirmed, unscored, auditable current-step skip route.
- Made observed incomplete actions participation evidence instead of silence.
- Made break recommendations outrank immediate continuation.
- Preserved fatigue/frustration break signals for assigned activities.
- Counted active and cross-midnight screen use in the AMTC calendar day.
- Preserved elapsed screen time when an active activity is stopped.
- Made recommendation acceptance and Thompson updates idempotent through RPCs.
- Added stale-progression and therapist-center checks to progression decisions.
- Added focused tests in src/tests/adaptiveEngine.test.ts.
- Added AdaptiveEngineApiContract.md for mobile/web integration.

## First Task After Refresh

1. Run `git status --short` and preserve the existing user changes listed above.
2. Run `npm run test:adaptive` and `git diff --check`.
3. Review `migrations/20260908_adaptive_engine_pilot.sql` with a database
   backup and apply it only to staging.
4. Run the migration preflight and inspect any duplicate-row exception instead
   of deleting evidence automatically.
5. Run staging end-to-end and concurrency tests using the flow documented in
   `AdaptiveEngineApiContract.md`.
6. Do not connect real learner data or call the system pilot-ready until the
   security and staging gates below pass.

## Remaining Required Work

- Apply and review the migration in staging; it has not been applied anywhere by
  Codex.
- Replace temporary actor/center headers with authenticated server-derived
  identity and verify learner-role relationships.
- Add database-backed integration tests for RPC idempotency, simultaneous
  recommendation starts, attempt conflicts, progression approval, and RLS.
- Verify screen-time and calendar behavior against staging timestamps around
  AMTC midnight.
- Connect and adjust mobile/web clients to AdaptiveEngineApiContract.md.
- Verify device retry/offline reconciliation by reloading saved attempts after a
  409 response-order conflict.
- Conduct therapist review of prompts, hint/repeat behavior, break thresholds,
  action observation, and all activity metadata used by the pilot.
- Keep semantic matching disabled from correctness decisions until a reviewed
  therapist-controlled design and validation set exist.
- Define therapist-authored difficulty metadata and transition rules before
  claiming calibrated difficulty adaptation; the current engine adapts support
  and activity fit using Speech Ladder, demand, sensory, engagement, and
  preference metadata.
- Add production-grade structured logging and monitoring for post-save bandit,
  progression, and profile-refresh failures.

## Important API Direction

Official session flow should be:

1. POST /api/learning-sessions/start
2. POST /api/activity-sessions/:sessionId/respond
3. POST /api/activity-sessions/:sessionId/finish
4. Adult confirms returned recommendationId
5. POST /api/learning-sessions/start-next
6. POST /api/learning-sessions/end

Adaptive and progress routes currently require `x-center-id`.

Progression decisions additionally require temporary `x-actor-id` and
`x-actor-role: therapist` headers. These headers are pilot context only and
are not secure authentication.

## Verification Status

- Syntax transpilation passes across all backend TypeScript files.
- Focused strict TypeScript checks pass for the changed adaptive, session,
  settings, progress, route, and controller entry points.
- `npm run test:adaptive` passes 14 focused regression tests.
- `git diff --check` passed before the final documentation update and should be
  rerun after any further edit.
- Full-project `tsc` still hangs silently; no process was left running.
- The Supabase migration has not been applied.
- End-to-end backend/Supabase/mobile testing has not been performed.

Therefore, the next engineering phase is staging migration and integration
verification. Frontend integration may follow against the documented contract,
but real learner pilot use remains blocked by authentication and staging safety
validation.
