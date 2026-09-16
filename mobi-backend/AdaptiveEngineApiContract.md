# MOBI Adaptive Engine API Contract

## Status

This contract describes the backend behavior to which the mobile and web
clients should be adapted after the pilot migration is applied and verified.
It does not make the temporary request headers secure authentication.

## Temporary Request Context

All adaptive, session, learner-settings, and progress routes require:

```http
x-center-id: CENTER_UUID
```

Adult-confirmed actions additionally require:

```http
x-actor-id: ACTOR_UUID
x-actor-role: parent | therapist | center_admin
```

Progression decisions require `x-actor-role: therapist`. The database also
checks that the therapist belongs to the request center.

These headers must be replaced by authenticated server-derived identity before
pilot access is exposed outside a controlled environment.

## Official Session Flow

### 1. Start a learning session

`POST /api/learning-sessions/start`

Adult actor headers are required.

```json
{
  "learnerId": "UUID",
  "initialActivityId": "UUID",
  "initialAssignmentId": "UUID or null"
}
```

The adult chooses the first activity. The backend creates the learning session
and its first activity session. `startedBy` is derived from the actor context;
the client must not supply it.

### 2. Load the activity session

`GET /api/activity-sessions/:sessionId?learnerId=UUID`

The response contains the activity, therapist-authored steps, effective setting
snapshot, and saved attempts. Clients should derive the next `attemptOrder` and
`stepAttemptNumber` from this state after a retry or conflict.

### 3. Submit one learner response

`POST /api/activity-sessions/:sessionId/respond`

Common fields:

```json
{
  "learnerId": "UUID",
  "activityStepId": "UUID",
  "attemptOrder": 1,
  "stepAttemptNumber": 1,
  "responseType": "speech | conversation | choice | action",
  "responseTimeMs": 1800,
  "gazeDetectionAvailable": false,
  "gazePresent": null,
  "gazeAwaySeconds": 0,
  "inactivitySeconds": 0
}
```

Response-specific fields:

```text
speech/conversation: transcript, sttConfidence, sttProvider, sttModel, sttMetadata
choice:              selectedChoiceId
action:              actionCompleted plus adult actor headers
```

Backend-owned rules:

- `ask`, `conversation`, `show_choose`, and `do_it` map to their required
  response types.
- `teach` and `feedback` are display-only and reject learner responses.
- Interactive steps must follow therapist-authored order.
- Expected answers, accepted variations, the correct choice, scoring, matching,
  target achievement, and activity completion are derived by the backend.
- Low-confidence speech, approximations, and missing responses are preserved;
  they are not automatically recorded as incorrect.
- A wrong choice or observed incomplete action remains communication or
  participation evidence and may receive support without being called silence.
- The response returns `communication`, `adaptiveDecision`, the saved `attempt`,
  current `screenTime`, and any automatic learning-session stop result.

Important `adaptiveDecision.action` values include:

```text
continue
repeat_prompt
give_hint
one_more_try
suggest_break
allow_skip
recommend_next_activity
end_session
```

An adult may skip only the current step when both the activity and step allow
it:

`POST /api/activity-sessions/:sessionId/steps/:activityStepId/skip`

```json
{
  "learnerId": "UUID",
  "attemptOrder": 2,
  "stepAttemptNumber": 1,
  "skipReason": "Optional neutral note"
}
```

This requires adult actor headers and saves an unscored, auditable skip attempt.
It does not record the learner as incorrect.

### 4. Finish the current activity

`POST /api/activity-sessions/:sessionId/finish`

```json
{
  "learningSessionId": "UUID",
  "learnerId": "UUID",
  "status": "completed | skipped | stopped | interrupted",
  "totalDurationSeconds": 245,
  "inactivitySeconds": 12,
  "gazePresentSeconds": 100,
  "gazeAwaySeconds": 20,
  "gazeDetectionAvailable": true,
  "breakCount": 1,
  "breakSuggested": false
}
```

`completed` is accepted only after every interactive step is resolved by target
achievement, an open communication response, an adult-confirmed allowed step
skip, or the configured maximum attempts. Mastery and all aggregates are
backend-derived. The entire activity may instead end with `status: "skipped"`
when the learner or adult chooses not to continue.

For a normal completion, the response can include a short-lived
`recommendation.id`. `breakRecommended: true` means the learner should be
offered a break before the adult chooses whether to continue. Skipped, stopped,
and interrupted activities do not automatically produce another activity.

### 5. Start the recommended activity

`POST /api/learning-sessions/start-next`

Adult actor headers are required.

```json
{
  "learningSessionId": "UUID",
  "recommendationId": "UUID"
}
```

Recommendation consumption is idempotent. Concurrent calls cannot create two
active activities, and Thompson selection count is recorded exactly once only
after an activity session is successfully linked.

### 6. End the learning session

`POST /api/learning-sessions/end`

Parent or therapist actor headers are required. `stoppedBy` is backend-derived.
A learning session cannot be marked completed while an activity remains active.
Stopping an active activity preserves its elapsed duration for screen-time
accounting.

## Settings

```text
GET/PATCH /api/learners/:learnerId/adaptation-settings
GET/PATCH /api/learners/:learnerId/child-safety-settings
```

Adaptation changes require therapist or center-admin actor context. Daily screen
time changes allow parent, therapist, or center-admin context. Speech Ladder
progression cannot disable therapist approval.

The screen-time payload is:

```json
{ "dailyScreenTimeLimitSeconds": 3600 }
```

Use `null` to disable the configured limit. Guided off-screen activities do not
consume screen-time allowance; mixed activities are counted conservatively.

## Progress And Progression

```text
GET /api/progress/overview
GET /api/progress/speech-training
GET /api/progress/social-readiness
GET /api/progress/per-activity
GET /api/progress/report
```

Common query fields are `learnerId`, `period=day|week|month|year`, and optional
`anchorDate=YYYY-MM-DD`. Calendar ranges use the configured center UTC offset.

```text
POST /api/learners/:learnerId/progression/evaluate
GET  /api/learners/:learnerId/progression/history
POST /api/learners/:learnerId/progression/:recommendationId/decision
```

Decision payload:

```json
{
  "decision": "approve | decline | adjust",
  "adjustedSpeechLadder": "word",
  "therapistNotes": "Optional notes"
}
```

Only therapist-confirmed current Speech Ladder levels are evaluated. Evidence
uses the latest completed result for each distinct activity. Approval is atomic,
rejects stale recommendations, and never changes the official level without a
therapist decision.

## Retry Behavior

- `409` response-order conflicts mean the client should reload the activity
  session and reconcile the saved attempts.
- Starting an already consumed recommendation returns its existing activity
  session.
- A recent `starting` recommendation must be retried shortly; stale claims are
  recoverable.
- The database prevents duplicate active learning sessions, active child
  sessions, attempts, recommendations, and bandit state rows.
