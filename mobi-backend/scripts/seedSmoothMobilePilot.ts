import dotenv from "dotenv";

dotenv.config({ quiet: true });

import { supabase } from "../src/config/supabase";
import { enrollLearnerService } from "../src/services/learner/enrollmentService";

const CENTER_ADMIN_EMAIL = "mobi.centeradmin@test.com";
const THERAPIST_EMAIL = "sheena@sample.com";
const TEST_LEARNER_CODE = "MOBI-SMOOTH-01";
const TEMPLATE_CODE = "MOBI_LEARNER_INTAKE_PROFILE";
const TEMPLATE_VERSION = 1;

const image = {
  animals: "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=900",
  play: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900",
  food: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900",
  bubbles: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900",
  story: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
  emotion: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900",
  ball: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900",
};

type LadderLevel = "sound" | "syllable" | "word" | "phrase" | "sentence";
type StepType = "teach" | "ask" | "conversation" | "show_choose" | "feedback";

type StepSeed = {
  step_type: StepType;
  prompt: string;
  lesson?: string;
  question?: string;
  expected_answers?: string[];
  accepted_variations?: string[];
  topics?: string[];
  choices?: Array<{
    id: number;
    label: string;
    is_correct: boolean;
    image_url?: string;
  }>;
  correct_feedback?: string[];
  wrong_feedback?: string[];
  ai_voice_style?: unknown;
  manual_scoring_enabled?: boolean;
};

type ActivitySeed = {
  title: string;
  description: string;
  activity_type: string;
  speech_ladder_level: LadderLevel;
  thumbnail_url: string;
  attention_demand: "low" | "medium";
  sensory_load: "low" | "medium";
  movement_level: "none" | "light";
  interaction_mode: "speech" | "choice";
  topic_tags: string[];
  steps: StepSeed[];
};

function socialPrompt(prompt: string, expected: string[]): StepSeed {
  return {
    step_type: "conversation",
    prompt,
    topics: [prompt],
    expected_answers: expected,
    accepted_variations: expected,
    ai_voice_style: "Friendly",
  };
}

function feedback(target: string): StepSeed {
  return {
    step_type: "feedback",
    prompt: "Good trying.",
    correct_feedback: [`Nice work. You said ${target}.`],
    wrong_feedback: [`Good try. We can model ${target} together.`],
    ai_voice_style: {
      correct: "Warm Praise",
      wrong: "Gentle",
    },
  };
}

function makeSpeechActivity(input: {
  level: LadderLevel;
  label: string;
  target: string;
  expected: string[];
  description: string;
  imageUrl?: string;
  activityType?: string;
  social?: StepSeed;
}): ActivitySeed {
  const levelCopy: Record<LadderLevel, string> = {
    sound: "Sound-level imitation with visual support. Accept close approximations, gestures, AAC, or adult-marked correct responses.",
    syllable: "Syllable-level speech imitation using familiar and playful sound patterns.",
    word: "Single-word functional communication for requesting, labeling, and answering.",
    phrase: "Two-word phrase practice using greetings, actions, colors, adjectives, and requests.",
    sentence: "Sentence-level situation and request practice with meaningful approximations accepted.",
  };

  const teachPrompt =
    input.level === "sentence"
      ? input.description
      : `Listen first. ${input.target}.`;
  const askPrompt =
    input.level === "sentence"
      ? `Finish the sentence: ${input.target}`
      : `Try saying ${input.target}.`;

  return {
    title: `MOBI Pilot 2026: ${input.label}`,
    description: `${levelCopy[input.level]} ${input.description}`,
    activity_type: input.activityType ?? "Teach & Practice",
    speech_ladder_level: input.level,
    thumbnail_url: input.imageUrl ?? image.play,
    attention_demand: input.level === "sound" || input.level === "syllable" ? "low" : "medium",
    sensory_load: "low",
    movement_level: input.level === "sentence" ? "none" : "light",
    interaction_mode: "speech",
    topic_tags: ["mobi-pilot-2026", input.level],
    steps: [
      {
        step_type: "teach",
        prompt: teachPrompt,
        lesson: teachPrompt,
        ai_voice_style: input.level === "sentence" ? "Storytelling" : "Teaching",
      },
      {
        step_type: "ask",
        prompt: askPrompt,
        question: askPrompt,
        expected_answers: input.expected,
        accepted_variations: input.expected,
        ai_voice_style: "Patient",
        manual_scoring_enabled: true,
      },
      input.social ?? socialPrompt("Say hi to MOBI.", ["hi", "hello", "hi mobi"]),
      feedback(input.expected[0] ?? input.target),
    ],
  };
}

function showChooseActivity(): ActivitySeed {
  return {
    title: "MOBI Pilot 2026: Choose the Snack",
    description:
      "Choice-making fallback activity for learners who communicate by selecting, pointing, AAC, or gesture.",
    activity_type: "Check & Answer",
    speech_ladder_level: "word",
    thumbnail_url: image.food,
    attention_demand: "low",
    sensory_load: "low",
    movement_level: "none",
    interaction_mode: "choice",
    topic_tags: ["mobi-pilot-2026", "word", "choice", "aac"],
    steps: [
      {
        step_type: "teach",
        prompt: "You can choose what you want.",
        lesson: "Look and choose. You can tap your answer.",
        ai_voice_style: "Teaching",
      },
      {
        step_type: "show_choose",
        prompt: "Tap the snack.",
        question: "Which one is a snack?",
        choices: [
          { id: 1, label: "Snack", is_correct: true, image_url: image.food },
          { id: 2, label: "Ball", is_correct: false, image_url: image.ball },
        ],
        manual_scoring_enabled: true,
        ai_voice_style: "Curious",
      },
      feedback("snack"),
    ],
  };
}

function buildActivities(): ActivitySeed[] {
  const sound = [
    ["Animal Sound Moo", "moo", ["moo", "mo", "muh"], image.animals],
    ["Animal Sound Woof", "woof", ["woof", "wuf", "oof"], image.animals],
    ["Animal Sound Meow", "meow", ["meow", "miao", "ow"], image.animals],
    ["Animal Sound Quack", "quack", ["quack", "wak", "kwa"], image.animals],
    ["Animal Sound Roar", "roar", ["roar", "rawr", "ra"], image.animals],
    ["Vehicle Sound Beep", "beep", ["beep", "bip", "bee"], image.play],
    ["Train Sound Choo", "choo", ["choo", "chu", "oo"], image.play],
    ["Pop Sound", "pop", ["pop", "pa", "pah"], image.bubbles],
    ["Go Sound", "go", ["go", "guh", "oh"], image.play],
    ["Uh Oh Sound", "uh oh", ["uh oh", "uh", "oh"], image.play],
  ].map(([label, target, expected, imageUrl]) =>
    makeSpeechActivity({
      level: "sound",
      label: String(label),
      target: String(target),
      expected: expected as string[],
      imageUrl: String(imageUrl),
      description: "Use animal, vehicle, and play sounds to invite low-pressure vocal imitation.",
    }),
  );

  const syllable = [
    ["Repeat Ma Ma", "ma ma", ["ma ma", "mama", "ma"]],
    ["Repeat Pa Pa", "pa pa", ["pa pa", "papa", "pa"]],
    ["Repeat Ba Ba", "ba ba", ["ba ba", "baba", "ba"]],
    ["Repeat Da Da", "da da", ["da da", "dada", "da"]],
    ["Repeat Na Na", "na na", ["na na", "nana", "na"]],
    ["Repeat Wa Wa", "wa wa", ["wa wa", "wawa", "wa"]],
    ["Repeat Go Go", "go go", ["go go", "gogo", "go"]],
    ["Repeat Pop Pop", "pop pop", ["pop pop", "pop", "pa pa"]],
    ["Repeat Moo Moo", "moo moo", ["moo moo", "moo", "mo mo"]],
    ["Repeat Bye Bye", "bye bye", ["bye bye", "bye", "ba bye"]],
  ].map(([label, target, expected]) =>
    makeSpeechActivity({
      level: "syllable",
      label: String(label),
      target: String(target),
      expected: expected as string[],
      description: "Short repeated syllables support easy imitation and rhythm.",
      social: socialPrompt("Say bye bye.", ["bye", "bye bye"]),
    }),
  );

  const wordSeeds = [
    ["Word More", "more", ["more", "mo", "more please"], image.bubbles],
    ["Word Help", "help", ["help", "hep", "help me"], image.play],
    ["Word Stop", "stop", ["stop", "top", "stahp"], image.play],
    ["Word Go", "go", ["go", "go please", "guh"], image.play],
    ["Word Ball", "ball", ["ball", "ba", "bol"], image.ball],
    ["Word Bubbles", "bubbles", ["bubbles", "bubble", "bubba"], image.bubbles],
    ["Word Eat", "eat", ["eat", "eet", "food"], image.food],
    ["Word Drink", "drink", ["drink", "din", "water"], image.food],
    ["Word Open", "open", ["open", "ope", "open please"], image.play],
  ].map(([label, target, expected, imageUrl]) =>
    makeSpeechActivity({
      level: "word",
      label: String(label),
      target: String(target),
      expected: expected as string[],
      imageUrl: String(imageUrl),
      activityType: "Check & Answer",
      description: "Functional single words are used for requesting, protesting, labeling, and routines.",
      social: socialPrompt("Tell MOBI, good job.", ["good job", "job"]),
    }),
  );

  const phrase = [
    ["Greeting Hi MOBI", "hi MOBI", ["hi mobi", "hi", "hello mobi"]],
    ["Request More Bubbles", "more bubbles", ["more bubbles", "bubble please", "bubbles please", "more please"]],
    ["Action Bounce Ball", "bounce ball", ["bounce ball", "ball bounce", "bounce"]],
    ["Color Black Ball", "black ball", ["black ball", "ball black", "dark ball"]],
    ["Adjective Small Ball", "small ball", ["small ball", "little ball", "ball small"]],
    ["Request Help Me", "help me", ["help me", "help please", "i need help"]],
    ["Request Open Box", "open box", ["open box", "open please", "box open"]],
    ["Social My Turn", "my turn", ["my turn", "turn please", "my turn please"]],
    ["Social Your Turn", "your turn", ["your turn", "you turn", "your turn please"]],
    ["Goodbye Bye Friend", "bye friend", ["bye friend", "bye", "goodbye friend"]],
  ].map(([label, target, expected]) =>
    makeSpeechActivity({
      level: "phrase",
      label: String(label),
      target: String(target),
      expected: expected as string[],
      imageUrl: image.ball,
      activityType: "Check & Answer",
      description: "Two-word combinations include greetings, requests, actions, color plus noun, and adjective plus noun.",
      social: socialPrompt("Say, my turn.", ["my turn", "turn"]),
    }),
  );

  const sentence = [
    ["Hungry Request", "I want ___", ["i want food", "i want snack", "want food", "want snack"], "The child sees food and feels hungry.", image.food],
    ["Thirsty Request", "I want ___", ["i want drink", "i want water", "want drink", "want water"], "The child sees a cup and feels thirsty.", image.food],
    ["Need Help Request", "I need ___", ["i need help", "need help", "help me"], "The toy box is closed. The child needs help.", image.play],
    ["More Play Request", "I want ___", ["i want more", "i want more bubbles", "more bubbles"], "The bubbles stopped. The child wants to play again.", image.bubbles],
    ["Break Request", "I need ___", ["i need break", "need break", "break please"], "The activity feels hard. The child needs a short break.", image.story],
    ["Pain or Discomfort", "My ___ hurts", ["my tummy hurts", "tummy hurts", "stomach hurts"], "The child points to their tummy and looks uncomfortable.", image.story],
    ["Emotion Happy", "I feel ___", ["i feel happy", "happy", "i am happy"], "The child smiles while playing with a favorite toy.", image.emotion],
    ["Emotion Sad", "I feel ___", ["i feel sad", "sad", "i am sad"], "The child is looking down because playtime ended.", image.emotion],
    ["Social Answer Name", "My name is ___", ["my name is ari", "ari", "name ari"], "MOBI asks the child their name.", image.story],
    ["Comment It Is Fun", "It is ___", ["it is fun", "fun", "this is fun"], "The child is playing with a toy they like.", image.play],
  ].map(([label, target, expected, description, imageUrl]) =>
    makeSpeechActivity({
      level: "sentence",
      label: String(label),
      target: String(target),
      expected: expected as string[],
      imageUrl: String(imageUrl),
      activityType: "Story",
      description: String(description),
      social: socialPrompt("Answer: how are you?", ["good", "fine", "okay", "happy"]),
    }),
  );

  return [...sound, ...syllable, showChooseActivity(), ...wordSeeds, ...phrase, ...sentence];
}

function baseActivity(activity: ActivitySeed, centerId: string) {
  return {
    title: activity.title,
    description: activity.description,
    activity_type: activity.activity_type,
    speech_ladder_level: activity.speech_ladder_level,
    max_attempts: 3,
    estimated_minutes: 4,
    allow_skip: true,
    success_required_count: 1,
    thumbnail_url: activity.thumbnail_url,
    ai_voice_gender: "girl",
    ai_voice_speed: "moderate",
    status: "published",
    uploaded_by: "Center Admin",
    center_id: centerId,
    access_scope: "center_library",
    delivery_mode: "screen",
    attention_demand: activity.attention_demand,
    sensory_load: activity.sensory_load,
    movement_level: activity.movement_level,
    interaction_mode: activity.interaction_mode,
    topic_tags: activity.topic_tags,
    visual_support_level: "high",
    communication_mode: "spoken_words",
    assistance_level: "some_assistance",
    sensory_features: ["soft_audio", "visual_support"],
    activity_domain: "speech_training",
    created_by_role: "center_admin",
    archived_at: null,
  };
}

function stepRow(activityId: string, step: StepSeed, index: number) {
  const isAnswerStep = step.step_type === "ask" || step.step_type === "show_choose";

  return {
    activity_id: activityId,
    step_order: index + 1,
    step_type: step.step_type,
    instruction: null,
    prompt: step.prompt,
    media_url: null,
    expected_answers: step.expected_answers || [],
    accepted_variations: step.accepted_variations || [],
    can_repeat: true,
    can_give_hint: true,
    can_skip: true,
    ai_feedback_rules:
      step.step_type === "feedback"
        ? {
            correct: step.correct_feedback || [],
            wrong: step.wrong_feedback || [],
            max_attempts_reached: [],
          }
        : {},
    metadata: {
      lesson: step.lesson || null,
      question: step.question || null,
      media: [],
      prompt_audio_url: null,
      feedback_audio_urls: null,
      choices: step.choices || [],
      topics: step.topics || [],
      materials_needed: [],
      correct_feedback: step.correct_feedback || null,
      wrong_feedback: step.wrong_feedback || null,
      ai_voice_style: step.ai_voice_style || null,
      manual_scoring_enabled: step.manual_scoring_enabled === true || isAnswerStep,
    },
  };
}

async function resolveCenterAndTherapist() {
  const { data: admin, error: adminError } = await supabase
    .from("center_admins")
    .select("center_id")
    .eq("email", CENTER_ADMIN_EMAIL)
    .eq("is_active", true)
    .single();

  if (adminError || !admin?.center_id) {
    throw adminError ?? new Error("Center admin account was not found.");
  }

  const { data: therapist, error: therapistError } = await supabase
    .from("therapists")
    .select("id")
    .eq("email", THERAPIST_EMAIL)
    .eq("center_id", admin.center_id)
    .eq("is_active", true)
    .single();

  if (therapistError || !therapist?.id) {
    throw therapistError ?? new Error("Therapist account was not found.");
  }

  return {
    centerId: admin.center_id as string,
    therapistId: therapist.id as string,
  };
}

async function getQuestionCodes() {
  const { data: template, error: templateError } = await supabase
    .from("assessment_templates")
    .select("id")
    .eq("template_code", TEMPLATE_CODE)
    .eq("version", TEMPLATE_VERSION)
    .single();

  if (templateError || !template) {
    throw templateError ?? new Error("Assessment template not found.");
  }

  const { data: questions, error: questionError } = await supabase
    .from("assessment_questions")
    .select("question_code")
    .eq("template_id", template.id)
    .eq("is_active", true);

  if (questionError) {
    throw questionError;
  }

  return new Set((questions ?? []).map((question: any) => question.question_code));
}

function learnerResponses() {
  return [
    ["communication_method", "combination"],
    ["expressive_communication", "sounds_vocalizations"],
    ["imitates_sounds_words", "sometimes"],
    ["expresses_wants_needs", "through_gestures"],
    ["responds_to_name", "inconsistent"],
    ["follows_one_step", "with_reminders"],
    ["understands_familiar_words", "sometimes"],
    ["benefits_visual_supports", "always"],
    ["initiates_interaction", "rarely"],
    ["turn_taking", "with_reminders"],
    ["structured_engagement", "5_to_10"],
    ["tablet_assistance", "minimal_assistance"],
    ["tablet_familiarity", "some_experience"],
    ["sensory_sensitivities", ["auditory", "visual", "proprioceptive"]],
    ["motivating_topics", ["animals", "bubbles", "toys", "food", "colors"]],
    ["daily_living_participation", ["adls", "play", "education", "social_participation"]],
    [
      "primary_concerns",
      "Limited functional words, frustration when not understood, difficulty asking for help, and inconsistent response to name.",
    ],
    [
      "therapy_goals_priorities",
      "Increase functional requesting, accept AAC/gesture approximations, and build simple social greetings.",
    ],
    [
      "additional_notes",
      "Use soft audio, visual choices, short wait time, adult manual scoring fallback, and regulation breaks.",
    ],
  ].map(([questionId, value]) => ({ questionId, value: value as any }));
}

async function getOrCreateLearner(centerId: string) {
  const { data: existing, error: existingError } = await supabase
    .from("learners")
    .select("id")
    .eq("center_id", centerId)
    .eq("learner_code", TEST_LEARNER_CODE)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    await supabase
      .from("learners")
      .update({ enrollment_status: "active", updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    return existing.id as string;
  }

  const questionCodes = await getQuestionCodes();
  const responses = learnerResponses().filter((response) =>
    questionCodes.has(response.questionId),
  );

  const result = await enrollLearnerService({
    centerId,
    profilePhoto: null,
    payload: {
      learner: {
        firstName: "Ari",
        middleName: null,
        lastName: "Pilot",
        nickname: "Ari",
        birthDate: "2018-07-27",
        sexAtBirth: "male",
        homeAddress: "Cebu City",
        schoolName: "MOBI Pilot School",
        gradeLevel: "Kinder",
        learnerBio: "Pilot learner for smooth mobile adaptive session testing.",
      },
      guardian: {
        firstName: "Mara",
        middleName: null,
        lastName: "Pilot",
        relationship: "Parent",
        phoneNumber: "09170001001",
        email: "ari.guardian@mobi-pilot.test",
        homeAddress: "Cebu City",
        emergencyContactName: "Rafa Pilot",
        emergencyContactPhone: "09280001001",
        authorizedForUpdates: true,
      },
      learnerIntakeProfile: {
        templateCode: TEMPLATE_CODE,
        templateVersion: TEMPLATE_VERSION,
        responses,
        preliminaryMeasurement: {
          suggestedSpeechLadder: null,
          attentionAreas: ["functional_requesting", "speech_imitation", "visual_support"],
        },
        status: "completed_for_therapist_review",
      },
    },
  });

  await supabase
    .from("learners")
    .update({
      learner_code: TEST_LEARNER_CODE,
      enrollment_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", result.learner.id);

  return result.learner.id as string;
}

async function configureLearner(centerId: string, learnerId: string) {
  await supabase
    .from("learner_transactional_profiles")
    .update({
      suggested_speech_ladder: "Sound",
      current_speech_ladder: "sound",
      communication_level: "sounds_vocalizations",
      preferred_communication_method: "combination",
      requires_visual_support: true,
      tablet_assistance_level: "minimal_assistance",
      typical_engagement_minutes: 8,
      sensory_preferences: ["auditory", "visual", "proprioceptive"],
      motivating_topics: ["animals", "bubbles", "toys", "food", "colors"],
      therapist_notes:
        "Pilot learner: accept approximations, AAC, gestures, and adult manual scoring when speech recognition is delayed.",
      therapist_confirmed: true,
      last_updated: new Date().toISOString(),
    })
    .eq("center_id", centerId)
    .eq("learner_id", learnerId);

  await supabase.from("learner_child_safety_settings").upsert(
    {
      center_id: centerId,
      learner_id: learnerId,
      daily_screen_time_limit_seconds: 45 * 60,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "center_id,learner_id" },
  );
}

async function assignTherapist(centerId: string, therapistId: string, learnerId: string) {
  await supabase
    .from("learner_therapists")
    .update({
      is_current: false,
      unassigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .eq("is_current", true);

  const { data: existing, error: existingError } = await supabase
    .from("learner_therapists")
    .select("id")
    .eq("center_id", centerId)
    .eq("therapist_id", therapistId)
    .eq("learner_id", learnerId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("learner_therapists")
      .update({
        is_current: true,
        assigned_at: new Date().toISOString(),
        unassigned_at: null,
        updated_at: new Date().toISOString(),
        collaboration_notes: "Pilot mobile adaptive session test learner.",
      })
      .eq("id", existing.id);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from("learner_therapists").insert({
    center_id: centerId,
    therapist_id: therapistId,
    learner_id: learnerId,
    is_current: true,
    assigned_at: new Date().toISOString(),
    unassigned_at: null,
    updated_at: new Date().toISOString(),
    collaboration_notes: "Pilot mobile adaptive session test learner.",
  });

  if (error) {
    throw error;
  }
}

async function seedActivities(centerId: string) {
  const activities = buildActivities();
  const titles = activities.map((activity) => activity.title);

  const { data: existingActivities, error: existingError } = await supabase
    .from("activities")
    .select("id, title")
    .eq("center_id", centerId)
    .in("title", titles);

  if (existingError) {
    throw existingError;
  }

  const existingByTitle = new Map(
    (existingActivities ?? []).map((activity: any) => [activity.title, activity.id]),
  );
  const activityIds: string[] = [];

  for (const activity of activities) {
    let activityId = existingByTitle.get(activity.title) as string | undefined;

    if (activityId) {
      const { error } = await supabase
        .from("activities")
        .update({ ...baseActivity(activity, centerId), updated_at: new Date().toISOString() })
        .eq("id", activityId);

      if (error) {
        throw error;
      }

      await supabase.from("activity_steps").delete().eq("activity_id", activityId);
    } else {
      const { data: created, error } = await supabase
        .from("activities")
        .insert(baseActivity(activity, centerId))
        .select("id")
        .single();

      if (error || !created?.id) {
        throw error ?? new Error("Activity insert failed.");
      }

      activityId = created.id;
    }

    const { error: stepError } = await supabase
      .from("activity_steps")
      .insert(activity.steps.map((step, index) => stepRow(activityId!, step, index)));

    if (stepError) {
      throw stepError;
    }

    activityIds.push(activityId);
  }

  return activityIds;
}

async function assignActivities(
  centerId: string,
  learnerId: string,
  therapistId: string,
  activityIds: string[],
) {
  const assignedActivityIds = activityIds.filter((_, index) =>
    [0, 1, 10, 11, 20, 21, 30, 31, 40, 41].includes(index),
  );

  await supabase
    .from("learner_activity_assignments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("center_id", centerId)
    .eq("learner_id", learnerId)
    .in("status", ["pending", "in_progress"]);

  const rows = assignedActivityIds.map((activityId, index) => ({
    center_id: centerId,
    learner_id: learnerId,
    activity_id: activityId,
    assigned_by_role: "therapist",
    assigned_by_therapist_id: therapistId,
    assigned_by_user_id: therapistId,
    priority: index + 1,
    is_required: index < 5,
    status: "pending",
    assignment_type: index < 5 ? "required" : "recommended",
    assigned_at: new Date().toISOString(),
    completed_at: null,
  }));

  const { error } = await supabase.from("learner_activity_assignments").insert(rows);

  if (error) {
    throw error;
  }
}

async function main() {
  const { centerId, therapistId } = await resolveCenterAndTherapist();
  const learnerId = await getOrCreateLearner(centerId);

  await configureLearner(centerId, learnerId);
  await assignTherapist(centerId, therapistId, learnerId);

  const activityIds = await seedActivities(centerId);
  await assignActivities(centerId, learnerId, therapistId, activityIds);

  console.log(
    JSON.stringify(
      {
        centerAdmin: CENTER_ADMIN_EMAIL,
        therapist: THERAPIST_EMAIL,
        learnerCode: TEST_LEARNER_CODE,
        learnerName: "Ari Pilot",
        learnerId,
        activityCount: activityIds.length,
        assignedActivityCount: 10,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Unable to seed smooth mobile pilot data:", error);
  process.exit(1);
});
