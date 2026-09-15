> # MOBI Backend + Adaptive Engine Context
>
> ## 1. Overall project concept
>
> **MOBI (Modernized Bridge Intervention)** is an AI-adaptive speech training and early social readiness system designed for minimally verbal children with autism who are suitable for structured mobile learning activities.
>
> MOBI is intended to support therapy and structured practice inside the participating therapy center. It is **not a diagnostic system and not a replacement for the therapist, doctor, or clinical judgment**.
>
> The system has six main user roles:
>
> - Super Admin
> - Center Admin
> - Therapist
> - Doctor
> - Parent / Guardian
> - Learner
>
> The backend architecture is currently:
>
> ```text
> React Web / React Native Mobile
>             ↓
> Express + TypeScript API
>             ↓
> Controllers
>             ↓
> Services
>             ↓
> Supabase / PostgreSQL
> ```
>
> The backend should remain the authority for adaptive rules, session logic, validation, activity selection, attempt evaluation, progression recommendations, and persistence.
>
> ---
>
> # 2. Main goal of the Adaptive Engine
>
> MOBI's adaptive engine should **personalize what happens next without making the final therapeutic decision**.
>
> It should answer questions such as:
>
> - Is this learner currently succeeding with the activity?
> - Was the learner's response a meaningful communication attempt even if it was not perfectly correct?
> - Was the result reliable enough to score?
> - Is the learner repeatedly struggling rather than failing only once?
> - Is the learner becoming inactive or disengaged?
> - Would another attempt be appropriate?
> - Should the system suggest a hint, repeat, break, easier activity, similar activity, or another activity?
> - Has enough evidence accumulated to recommend progression in the Speech Ladder?
>
> The adaptive engine must therefore evaluate **patterns**, not isolated events.
>
> ---
>
> # 3. Very important design principle: do NOT judge a child from one speech response
>
> This is one of the most important principles of MOBI.
>
> A minimally verbal child with autism may:
>
> - pronounce a word differently,
> - give an approximation,
> - respond slowly,
> - need several repetitions,
> - become distracted temporarily,
> - have variable attention from session to session,
> - use AAC, gesture, choice selection, or another communication method,
> - respond correctly once and incorrectly later,
> - have difficulty producing an exact transcription even if communicative intent is present.
>
> Therefore MOBI must **not treat one STT transcript as the truth about the learner's ability**.
>
> A result such as:
>
> ```text
> Child said one word incorrectly
>             ↓
> Automatically decrease level
> ```
>
> is NOT acceptable.
>
> Instead the system should use accumulated evidence:
>
> ```text
> Response
>    ↓
> STT confidence
>    ↓
> Matching methods
>    ↓
> Communication attempt?
>    ↓
> Correct / approximation / unscored?
>    ↓
> Previous attempts
>    ↓
> Recent success pattern
>    ↓
> Engagement + inactivity
>    ↓
> Activity history
>    ↓
> Learner profile
>    ↓
> Recommendation
> ```
>
> ---
>
> # 4. Response evaluation is deliberately multi-layered
>
> MOBI does not rely only on exact string matching.
>
> The attempt model currently supports information such as:
>
> ```text
> transcript
> normalized_transcript
> stt_confidence
> expected_answers
> accepted_variations
> matching_method
> matched_answer
> levenshtein_distance
> phonetic_match
> semantic_match
> communication_attempt
> should_score
> accepted
> is_correct
> approximation_detected
> target_achieved
> response_time_ms
> hint_used
> repeat_prompt_used
> one_more_try_used
> gaze_present_at_response
> inactivity_before_response_seconds
> ```
>
> Supported or planned matching concepts include:
>
> ```text
> exact_match
> accepted_variation
> phrase_contains
> token_match
> levenshtein
> levenshtein_approximation
> phonetic_match
> semantic_match
> choice_match
> action_observed
> not_evaluated
> ```
>
> This allows MOBI to distinguish:
>
> ```text
> "perfectly correct"
>
> from
>
> "reasonable approximation"
>
> from
>
> "meaningful communication attempt"
>
> from
>
> "not reliable enough to score"
>
> from
>
> "incorrect response"
> ```
>
> These should not all be treated identically.
>
> ---
>
> # 5. Confidence threshold
>
> MOBI has a configurable:
>
> ```text
> minimum_confidence
> ```
>
> Example current default:
>
> ```text
> 0.70
> ```
>
> A low-confidence STT result should not automatically become a wrong answer.
>
> Example:
>
> ```text
> transcript = "cat"
> confidence = 0.32
> ```
>
> should not necessarily result in:
>
> ```text
> is_correct = false
> ```
>
> because the speech recognizer itself may be uncertain.
>
> The backend should decide whether the response is:
>
> - scored,
> - accepted,
> - treated as an approximation,
> - or left unscored.
>
> ---
>
> # 6. Accepted variations
>
> Each activity step can contain:
>
> ```text
> expected_answers
> accepted_variations
> ```
>
> Therefore a therapist-created target may accept several valid forms rather than one exact sentence.
>
> Example:
>
> ```text
> Expected:
> apple
>
> Accepted variations:
> apple
> an apple
> it's apple
> ```
>
> This is especially important because MOBI should recognize communicative success rather than demand rigid wording.
>
> ---
>
> # 7. Levenshtein / approximate matching
>
> MOBI contains:
>
> ```text
> levenshtein_threshold
> ```
>
> Default currently around:
>
> ```text
> 2
> ```
>
> This can help recognize small textual differences produced by STT.
>
> However Levenshtein should be only **one signal**, not the sole evaluator.
>
> ---
>
> # 8. Phonetic and semantic matching
>
> The adaptive settings also contain:
>
> ```text
> phonetic_matching_enabled
> semantic_matching_enabled
> accepted_variations_enabled
> ```
>
> These provide additional evidence when exact transcription is insufficient.
>
> Again:
>
> ```text
> Exact match = strong evidence
> Accepted variation = strong evidence
> Approximate / phonetic = supporting evidence
> Semantic match = supporting evidence
> ```
>
> The engine should combine evidence cautiously instead of forcing every spoken response into simply correct/wrong.
>
> ---
>
> # 9. Communication attempts matter
>
> MOBI records:
>
> ```text
> communication_attempt
> ```
>
> because an attempt to communicate may still be clinically useful even when it is not scored as correct.
>
> This distinction is particularly important for minimally verbal learners.
>
> For reporting we therefore distinguish:
>
> ```text
> total_scored_attempts
> correct_attempts
> incorrect_attempts
> communication_attempts
> unscored_attempts
> ```
>
> ---
>
> # 10. Individual learner adaptation settings
>
> MOBI has a dedicated:
>
> ```text
> learner_adaptation_settings
> ```
>
> table.
>
> The purpose is to prevent a universal rule from being applied to every learner.
>
> Current settings include:
>
> ```text
> minimum_confidence
> levenshtein_threshold
> phonetic_matching_enabled
> accepted_variations_enabled
> semantic_matching_enabled
>
> attempts_window
> required_success_count
> required_success_percentage
> consecutive_successes_required
> minimum_activities_mastered
> therapist_approval_required
>
> default_max_attempts
> allow_skip
> one_more_try_enabled
> default_activity_minutes
>
> break_suggestion_minutes
> gaze_away_threshold_seconds
> slow_response_threshold_seconds
> declining_success_window
> ```
>
> These are intentionally learner-specific.
>
> Example:
>
> Learner A may tolerate:
>
> ```text
> 5 attempts
> ```
>
> while Learner B may become distressed from too much repetition and therefore use:
>
> ```text
> 2–3 attempts
> ```
>
> MOBI should support this difference rather than assuming more repetition is always better.
>
> ---
>
> # 11. Attempts Window
>
> One very important checker is:
>
> ```text
> attempts_window
> ```
>
> Example:
>
> ```text
> attempts_window = 5
> required_success_count = 4
> ```
>
> The system can evaluate:
>
> ```text
> Correct
> Correct
> Wrong
> Correct
> Correct
> ```
>
> Result:
>
> ```text
> 4/5 successful
> ```
>
> rather than judging the learner from the last response alone.
>
> ---
>
> # 12. Consecutive successes
>
> Another signal is:
>
> ```text
> consecutive_successes_required
> ```
>
> This answers a different question:
>
> > Is performance becoming consistently successful?
>
> For example:
>
> ```text
> correct
> correct
> correct
> ```
>
> provides different evidence from:
>
> ```text
> correct
> wrong
> correct
> wrong
> correct
> ```
>
> even if overall percentage becomes similar.
>
> ---
>
> # 13. Activity mastery is not based on one activity response
>
> MOBI also uses concepts such as:
>
> ```text
> minimum_activities_mastered
> required_success_percentage
> ```
>
> before Speech Ladder progression should even be considered.
>
> This prevents:
>
> ```text
> one good activity
>      ↓
> immediate progression
> ```
>
> ---
>
> # 14. Speech Ladder
>
> MOBI currently follows:
>
> ```text
> Sound
> ↓
> Syllable
> ↓
> Word
> ↓
> Phrase
> ↓
> Sentence
> ↓
> Conversation / Social Readiness
> ```
>
> The system may evaluate whether a learner appears ready for progression.
>
> But:
>
> **AI DOES NOT automatically change the Speech Ladder.**
>
> The correct workflow is:
>
> ```text
> Performance evidence
>       ↓
> Adaptive engine evaluation
>       ↓
> Progression recommendation
>       ↓
> Therapist reviews
>       ↓
> Therapist approves / declines / adjusts
>       ↓
> Speech Ladder changes
> ```
>
> Progression history is stored in:
>
> ```text
> learner_progression_history
> ```
>
> including:
>
> ```text
> from_speech_ladder
> to_speech_ladder
> progression_type
> recommendation_source
> activities_mastered
> average_success_rate
> therapist_decision
> therapist_notes
> decided_at
> ```
>
> This human-in-the-loop rule must remain.
>
> ---
>
> # 15. Engagement is also part of adaptation
>
> MOBI is not only a speech-scoring system.
>
> It also considers whether the learner can reasonably continue the session.
>
> We track:
>
> ```text
> inactivity_seconds
> gaze_present_seconds
> gaze_away_seconds
> gaze_detection_available
> response_time
> break_count
> break_suggested
> engagement_override_triggered
> engagement_override_reason
> ```
>
> Related thresholds include:
>
> ```text
> gaze_away_threshold_seconds
> slow_response_threshold_seconds
> break_suggestion_minutes
> declining_success_window
> ```
>
> Example:
>
> ```text
> learner success is declining
> +
> long response times
> +
> repeated gaze-away / inactivity
> ```
>
> should lead to a possible recommendation such as:
>
> ```text
> suggest break
> ```
>
> rather than simply:
>
> ```text
> make activity easier
> ```
>
> because struggling and disengagement are not necessarily the same thing.
>
> ---
>
> # 16. Adaptive activity selection
>
> MOBI's adaptive recommendation engine currently supports a hybrid model.
>
> The current selection algorithm implemented/tested is:
>
> ```text
> hybrid_thompson_personalized
> ```
>
> It combines:
>
> ### A. Thompson Sampling
>
> MOBI keeps per-learner/per-activity state in:
>
> ```text
> learner_activity_bandit_states
> ```
>
> containing:
>
> ```text
> alpha
> beta
> successful_sessions
> unsuccessful_sessions
> selection_count
> last_selected_at
> last_outcome_at
> ```
>
> This allows the system to learn which activities have historically worked well for that learner while still exploring alternatives.
>
> ### B. Learner preference/profile scoring
>
> The system also considers the learner's transactional profile:
>
> ```text
> preferred_communication_method
> requires_visual_support
> tablet_assistance_level
> typical_engagement_minutes
> sensory_preferences
> motivating_topics
> attention_areas
> current_speech_ladder
> ```
>
> Activity metadata includes:
>
> ```text
> speech_ladder_level
> delivery_mode
> attention_demand
> sensory_load
> movement_level
> interaction_mode
> topic_tags
> visual_support_level
> communication_mode
> assistance_level
> sensory_features
> activity_domain
> ```
>
> MOBI can therefore evaluate whether an activity matches characteristics such as:
>
> - learner's communication mode,
> - visual support needs,
> - assistance level,
> - motivating topics,
> - expected engagement duration,
> - sensory considerations,
> - current Speech Ladder.
>
> ---
>
> # 17. Why Thompson Sampling is not enough
>
> Thompson Sampling alone would mostly learn:
>
> > Which activity historically produced better results?
>
> But that does not fully consider the child's current needs.
>
> Therefore MOBI combines:
>
> ```text
> historical effectiveness
> +
> learner profile compatibility
> +
> current adaptive state
> ```
>
> rather than using only one probability score.
>
> A recent test used approximately:
>
> ```text
> Thompson weight = 0.75
> Learner preference weight = 0.25
> ```
>
> These should remain configurable rather than treated as universal clinical constants.
>
> ---
>
> # 18. Assigned activity takes priority where appropriate
>
> The recommendation engine must also respect therapist/center activity assignments.
>
> Activities can be:
>
> ```text
> required
> recommended
> adaptive fallback
> manual
> ```
>
> Relevant assignment information includes:
>
> ```text
> priority
> assignment_type
> is_required
> available_from
> available_until
> max_attempts_override
> estimated_minutes_override
> success_required_count_override
> allow_skip_override
> ```
>
> Therefore MOBI does not simply ignore therapist-selected activities and let AI choose whatever it wants.
>
> ---
>
> # 19. Adult confirmation before starting an adaptive recommendation
>
> A major workflow was recently fixed.
>
> Previously:
>
> ```text
> MOBI recommends activity A
> ↓
> user confirms
> ↓
> backend selects again
> ↓
> activity B might start
> ```
>
> That is wrong.
>
> Current intended flow:
>
> ```text
> MOBI recommends activity A
> ↓
> recommendation shown to adult
> ↓
> adult confirms activity A
> ↓
> backend validates activity A is still available
> ↓
> EXACT activity A starts
> ```
>
> Endpoint currently tested:
>
> ```text
> POST /api/learning-sessions/start-next
> ```
>
> using:
>
> ```json
> {
>   "learningSessionId": "...",
>   "recommendedActivityId": "..."
> }
> ```
>
> Backend validates the recommended activity before starting it.
>
> ---
>
> # 20. Learning Session architecture
>
> We introduced a higher-level:
>
> ```text
> learner_learning_sessions
> ```
>
> table.
>
> Concept:
>
> ```text
> LEARNING SESSION
>     |
>     +-- Activity Session 1
>     |
>     +-- Activity Session 2
>     |
>     +-- Activity Session 3
> ```
>
> `learner_learning_sessions` represents the complete learner learning period.
>
> `learner_activity_sessions` represents one activity performed inside that learning period.
>
> `learner_activity_attempts` represents individual responses/attempts inside an activity.
>
> Therefore:
>
> ```text
> learner_learning_sessions
>        1
>        |
>        | many
>        ↓
> learner_activity_sessions
>        1
>        |
>        | many
>        ↓
> learner_activity_attempts
> ```
>
> This distinction is very important and should be preserved.
>
> ---
>
> # 21. Prevent multiple simultaneous activities
>
> We recently added/tested protection against accidentally starting two activity sessions inside the same learning session.
>
> Expected backend behavior:
>
> ```text
> Learning Session
>     ↓
> Activity A = in_progress
>     ↓
> user attempts Start Next
>     ↓
> REJECT
> ```
>
> Current tested error:
>
> ```text
> "This learning session already has an activity in progress."
> ```
>
> This prevents duplicate active activities.
>
> ---
>
> # 22. Ending a Learning Session
>
> We implemented/tested:
>
> ```text
> POST /api/learning-sessions/end
> ```
>
> Supported reasons include:
>
> ```text
> completed
> parent_stopped
> therapist_stopped
> auto_inactivity
> screen_time_limit
> system_interrupted
> ```
>
> The learning session records:
>
> ```text
> total_duration_seconds
> total_activity_runs
> completed_activity_runs
> skipped_activity_runs
> total_inactivity_seconds
> total_break_count
> stopped_by
> stop_reason
> auto_stop_triggered
> auto_stop_reason
> ```
>
> A bug was also fixed so ending a learning session closes any currently active child activity session instead of leaving:
>
> ```text
> learner_learning_sessions = stopped
>
> while
>
> learner_activity_sessions = in_progress
> ```
>
> ---
>
> # 23. Learner transactional profile
>
> MOBI has:
>
> ```text
> learner_transactional_profiles
> ```
>
> This represents a current learner snapshot used by the adaptive engine.
>
> It includes:
>
> ```text
> latest_assessment_id
> suggested_speech_ladder
> current_speech_ladder
> communication_level
> preferred_communication_method
> requires_visual_support
> tablet_assistance_level
> typical_engagement_minutes
> sensory_preferences
> motivating_topics
> attention_areas
> therapist_notes
> therapist_confirmed
>
> total_sessions
> total_time_minutes
> activities_mastered
> overall_success_rate
> ```
>
> Instead of querying the entire learner history every time a recommendation is requested, this table provides the adaptive system with an efficient current-state representation.
>
> It should still be updated from the underlying session/assessment data rather than becoming an unrelated source of truth.
>
> ---
>
> # 24. Important database structure
>
> The Supabase/PostgreSQL database currently contains about 30 core tables.
>
> Main groups:
>
> ### Organization and users
>
> ```text
> subscription_plans
> centers
> center_admins
> therapists
> doctors
> center_parents
> learners
> parent_learners
> learner_therapists
> learner_doctors
> ```
>
> ### Enrollment / assessment
>
> ```text
> assessment_templates
> assessment_sections
> assessment_questions
> learner_assessments
> learner_assessment_responses
> learner_transactional_profiles
> ```
>
> ### Learning content
>
> ```text
> activities
> activity_steps
> learner_activity_assignments
> ```
>
> ### Adaptive engine
>
> ```text
> learner_adaptation_settings
> learner_activity_bandit_states
> learner_progression_history
> ```
>
> ### Runtime/session data
>
> ```text
> learner_learning_sessions
> learner_activity_sessions
> learner_activity_attempts
> ```
>
> ### Monitoring / collaboration
>
> ```text
> learner_progress_reports
> progress_report_feedback
> collaboration_notes
> scheduled_sessions
> system_notifications
> ```
>
> ---
>
> # 25. Why the database is separated into many tables
>
> Do NOT collapse these into one giant learner table.
>
> They represent different data lifecycles.
>
> Example:
>
> ```text
> learner
>    ↓
> many learning sessions
>
> learning session
>    ↓
> many activity sessions
>
> activity session
>    ↓
> many attempts
> ```
>
> Likewise:
>
> ```text
> learner
>    ↓
> many assessments
>    ↓
> many responses
> ```
>
> And:
>
> ```text
> learner
>    ↓
> current transactional profile
> ```
>
> Keeping these separate:
>
> - reduces duplicate data,
> - preserves history,
> - allows detailed reporting,
> - supports adaptive calculations,
> - improves maintainability,
> - and makes relationships explicit through foreign keys.
>
> ---
>
> # 26. Database snapshots are intentional
>
> Several runtime tables store **effective settings**.
>
> Example:
>
> ```text
> learner_learning_sessions.effective_session_settings
> learner_activity_sessions.effective_settings
> learner_activity_attempts.evaluation_settings
> ```
>
> This is intentional.
>
> If a therapist changes the learner's settings tomorrow, an old session should still show:
>
> > What settings were actually being used when this result was generated?
>
> This is important for auditability and accurate reporting.
>
> ---
>
> # 27. Progress made so far in the Adaptive Engine
>
> The following pieces have already been built or substantially implemented/tested:
>
> **Implemented / working foundation**
>
> ```text
> ✓ learner adaptation settings
>
> ✓ activity metadata for personalization
>
> ✓ transactional learner profile
>
> ✓ activity assignments
>
> ✓ activity sessions
>
> ✓ detailed activity attempts
>
> ✓ STT-aware attempt fields
>
> ✓ exact / variation / approximate / phonetic /
>   semantic matching architecture
>
> ✓ communication-attempt distinction
>
> ✓ activity performance summaries
>
> ✓ engagement and inactivity fields
>
> ✓ gaze-related fields
>
> ✓ break recommendation fields
>
> ✓ Thompson Sampling state
>
> ✓ learner preference scoring
>
> ✓ hybrid adaptive activity selection
>
> ✓ Speech Ladder filtering
>
> ✓ assigned-vs-adaptive activity selection
>
> ✓ progression evaluation service foundation
>
> ✓ therapist-controlled progression design
>
> ✓ progression history table
>
> ✓ higher-level Learning Session architecture
>
> ✓ first activity starts within Learning Session
>
> ✓ next adaptive activity recommendation
>
> ✓ adult confirmation of recommended activity
>
> ✓ prevention of multiple simultaneous active activities
>
> ✓ ending Learning Sessions
>
> ✓ closing active Activity Session when Learning Session ends
> ```
>
> We have successfully tested adaptive selection and received responses containing:
>
> ```text
> selectionAlgorithm:
> hybrid_thompson_personalized
> ```
>
> together with:
>
> ```text
> candidateSamples
> adaptationScores
> preferenceScores
> learnerPreferences
> learnerState
> selectionReason
> ```
>
> So the adaptive selection foundation is functioning.
>
> ---
>
> # 28. Important: current adaptive engine is NOT finished
>
> Codex should not interpret the existing code as fully complete.
>
> Major remaining work includes:
>
> ```text
> 1. Complete the end-to-end attempt evaluation flow.
>
> 2. Fully connect real STT input from mobile to learner_activity_attempts.
>
> 3. Verify exact / accepted variation / Levenshtein /
>    phonetic / semantic matching behavior.
>
> 4. Finalize rules deciding should_score vs unscored.
>
> 5. Finalize approximation handling.
>
> 6. Finalize communication-attempt handling.
>
> 7. Update activity-session aggregates after every attempt.
>
> 8. Finalize activity completion / mastery calculation.
>
> 9. Update Thompson alpha/beta after actual activity outcomes.
>
> 10. Update learner transactional profile from completed sessions.
>
> 11. Fully test progression recommendation thresholds.
>
> 12. Implement therapist approval/decline/adjust progression flow.
>
> 13. Connect progression decisions to current_speech_ladder.
>
> 14. Fully implement inactivity/gaze/break adaptive behavior.
>
> 15. Implement screen-time / auto-stop behavior.
>
> 16. Connect scheduled sessions where appropriate.
>
> 17. Generate/update progress reports from real session data.
>
> 18. Integrate doctor review/feedback.
>
> 19. Add proper authentication and replace development hard-coded IDs.
>
> 20. Add transactional safeguards / RPC where multi-table operations
>     require atomicity.
>
> 21. Add API validation, authorization, RLS/security review,
>     robust errors, and production logging.
>
> 22. End-to-end test Web + Mobile + Backend + Supabase.
> ```
>
> ---
>
> # 29. Important development rule for Codex
>
> When modifying the adaptive engine:
>
> **DO NOT simplify it into:**
>
> ```text
> STT says word = expected word → correct
> otherwise → wrong
> ```
>
> and DO NOT simplify progression into:
>
> ```text
> score >= X
> → automatically progress learner
> ```
>
> MOBI intentionally uses multiple signals because the target users are minimally verbal children with autism and performance can vary substantially between attempts and sessions.
>
> The desired philosophy is:
>
> ```text
> Gather evidence
>      ↓
> Evaluate conservatively
>      ↓
> Support the learner
>      ↓
> Adapt the activity
>      ↓
> Recommend
>      ↓
> Human professional retains final progression authority
> ```
>
> ---
>
> # 30. Desired behavior of MOBI
>
> MOBI should behave more like:
>
> > "The learner has shown a consistent pattern of success across several activities. Based on the configured thresholds, MOBI recommends progression from Word to Phrase. Therapist review is required."
>
> rather than:
>
> > "The child got the answer correct, therefore increase difficulty."
>
> And:
>
> > "Speech recognition confidence was low, but the response appeared to be a meaningful approximation. Do not penalize the learner yet."
>
> rather than:
>
> > "Transcript was different, therefore wrong."
>
> And:
>
> > "Success has declined while inactivity and response latency have increased. Suggest a break."
>
> rather than:
>
> > "The learner failed repeatedly, therefore regress."
>
> That distinction is central to MOBI.
>
> ---
>
> # 31. Current backend priority
>
> When continuing development, preserve the working architecture and finish the adaptive engine **incrementally**.
>
> Recommended order:
>
> ```text
> Attempt Evaluation
>        ↓
> Activity Session Aggregation
>        ↓
> Activity Completion / Mastery
>        ↓
> Bandit State Update
>        ↓
> Transactional Profile Update
>        ↓
> Next Activity Recommendation
>        ↓
> Progression Evaluation
>        ↓
> Therapist Approval
>        ↓
> Progress Reports / Analytics
> ```
>
> Avoid rewriting working modules unnecessarily. First inspect the existing services, database schema, routes, controllers, and types before proposing structural changes.
>
> The goal is to **complete the existing MOBI adaptive architecture**, not replace it with a generic adaptive-learning implementation.

**MOBI is not an “AI checks if the child said the correct word” system. It is an evidence-based adaptive session engine.** It considers speech-recognition reliability, acceptable approximations, multiple attempts, recent performance patterns, activity mastery, learner-specific thresholds, communication attempts, response speed, inactivity, gaze/engagement, sensory and communication preferences, therapist assignments, and historical activity outcomes. Those signals affect support and activity recommendations, while **Speech Ladder progression remains subject to therapist confirmation**.

---

# 32. Pilot stabilization update (2026-09-08)

The backend implementation has now been tightened in the following areas:

- speech target containment rejects word-boundary and common-negation false
  positives, including apostrophe forms such as `don't`;
- exact matches with low STT confidence are preserved as unscored evidence;
- pronunciation and phonetic approximations remain communication evidence and
  are not promoted to correct answers;
- choice and observed action responses use therapist-authored step metadata;
- an observed incomplete action is not treated as silence;
- display-only `teach` and `feedback` steps reject response submissions;
- interactive step order and activity completion are backend-owned;
- allowed step skips require adult confirmation and are saved as unscored audit
  evidence rather than incorrect responses;
- attempt/session aggregates and mastery use only scoreable evidence;
- fatigue/frustration break signals remain visible even when the next activity
  is a required assignment;
- break recommendations take priority over immediately moving to another
  activity;
- guided off-screen activity time is excluded from screen-time use;
- active and cross-midnight screen sessions are included in center-local daily
  screen-time calculations;
- stopped active sessions preserve elapsed duration so screen time cannot reset
  to zero;
- progression uses the latest completed result per distinct activity and only a
  therapist-confirmed current Speech Ladder;
- progression approval is therapist-only, atomic, and stale-evidence protected;
- activity recommendation consumption, Thompson selection count, and Thompson
  outcome updates have idempotent database functions;
- strict request validation now covers IDs, attempts, response types, telemetry,
  settings, and temporary adult actor context;
- focused adaptive regression tests are available through
  `npm run test:adaptive`;
- the frontend/mobile integration contract is documented in
  `AdaptiveEngineApiContract.md`.

The migration in `migrations/20260908_adaptive_engine_pilot.sql` has **not**
been applied. The backend is therefore code-ready for staging migration review,
not yet pilot-ready with real learner data.

Before pilot use, the team must still:

1. apply and review the migration in a staging Supabase project;
2. run end-to-end tests against real staging rows for speech, choice, action,
   retry, concurrent start, screen-time, progress, and progression decisions;
3. replace `x-center-id`, `x-actor-id`, and `x-actor-role` with authenticated,
   server-derived center and role context;
4. connect the mobile client to `AdaptiveEngineApiContract.md` and verify
   offline/retry behavior on representative devices;
5. conduct therapist-led usability and safety review with non-identifying pilot
   scenarios before involving learners;
6. keep semantic matching out of correctness decisions until it has a reviewed,
   therapist-controlled specification and validation set.

The current selector adapts activity fit using Speech Ladder, attention demand,
sensory load, movement, interaction mode, engagement state, preferences, and
historical outcomes. A separate calibrated `difficulty` model has not yet been
defined. MOBI should not claim explicit difficulty-level adjustment until
therapists define that metadata and its permitted transition rules.
