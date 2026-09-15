import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ quiet: true });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

const CENTER_ID = "d5ae1649-0343-46d4-b433-575c97e064e1";
const TEST_LEARNER_ID = "6cf9a9ff-2ad9-49ec-b71b-dec0451fd5bc";

const activities = [
  {
    title: "MOBI Pilot: Say Animal Names",
    description:
      "Practice naming familiar animals with clear visual support and a simple spoken answer.",
    activity_type: "Teach & Practice",
    speech_ladder_level: "word",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=900",
    steps: [
      {
        step_type: "teach",
        prompt: "This is a dog. Dog.",
        lesson: "Look at the animal. This is a dog. Say dog.",
        media_url:
          "https://images.unsplash.com/photo-1552053831-71594a27632d?w=900",
        ai_voice_style: "Teaching",
      },
      {
        step_type: "ask",
        prompt: "What animal is this?",
        question: "What animal is this?",
        media_url:
          "https://images.unsplash.com/photo-1552053831-71594a27632d?w=900",
        expected_answers: ["dog"],
        accepted_variations: ["doggy", "puppy"],
        ai_voice_style: "Curious",
      },
      {
        step_type: "feedback",
        prompt: "Good job trying.",
        correct_feedback: ["Great job. You said dog."],
        wrong_feedback: ["Good try. Let's say dog together."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Encouraging",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: Ask for Help",
    description:
      "Practice a functional request phrase children can use when they need support.",
    activity_type: "Check & Answer",
    speech_ladder_level: "phrase",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900",
    steps: [
      {
        step_type: "teach",
        prompt: "When something is hard, you can say, help me please.",
        lesson:
          "Sometimes we need help. You can say: help me please.",
        ai_voice_style: "Gentle",
      },
      {
        step_type: "ask",
        prompt: "What can you say when you need help?",
        question: "What can you say when you need help?",
        expected_answers: ["help me please", "help me", "please help"],
        accepted_variations: ["i need help", "help please"],
        ai_voice_style: "Patient",
      },
      {
        step_type: "feedback",
        prompt: "Thank you for trying.",
        correct_feedback: ["Nice asking. Help me please."],
        wrong_feedback: ["That's okay. Try saying, help me please."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Supportive",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: Choose the Happy Face",
    description:
      "Identify a happy expression using a simple two-choice visual task.",
    activity_type: "Check & Answer",
    speech_ladder_level: "word",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900",
    steps: [
      {
        step_type: "teach",
        prompt: "A happy face has a smile.",
        lesson: "Look for the face with a smile. That face is happy.",
        ai_voice_style: "Teaching",
      },
      {
        step_type: "show_choose",
        prompt: "Tap the happy face.",
        question: "Which one is happy?",
        choices: [
          {
            id: 1,
            label: "Happy",
            image_url:
              "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=700",
            is_correct: true,
          },
          {
            id: 2,
            label: "Not happy",
            image_url:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700",
            is_correct: false,
          },
        ],
        ai_voice_style: "Curious",
      },
      {
        step_type: "feedback",
        prompt: "Good looking.",
        correct_feedback: ["Yes. That face is happy."],
        wrong_feedback: ["Good try. Look for the smile."],
        ai_voice_style: {
          correct: "Celebratory",
          wrong: "Gentle",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: Brush Teeth Steps",
    description:
      "Practice a daily living routine using short guided instructions.",
    activity_type: "Life Skills",
    speech_ladder_level: "phrase",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=900",
    steps: [
      {
        step_type: "teach",
        prompt: "We brush teeth to keep our mouth clean.",
        lesson:
          "First, get the toothbrush. Next, add toothpaste. Then brush gently.",
        media_url:
          "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=900",
        ai_voice_style: "Teaching",
      },
      {
        step_type: "do_it",
        prompt: "Show brushing your teeth.",
        instruction:
          "Pretend to brush your teeth. Move the toothbrush gently.",
        materials_needed: ["Toothbrush", "Toothpaste"],
        ai_voice_style: "Coaching",
      },
      {
        step_type: "feedback",
        prompt: "Good practicing.",
        correct_feedback: ["Nice work practicing brushing."],
        wrong_feedback: ["That's okay. We can try the steps again."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Supportive",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: The Calm Balloon Story",
    description:
      "A short calming story with narration, followed by one simple comprehension question.",
    activity_type: "Story",
    speech_ladder_level: "sentence",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
    steps: [
      {
        step_type: "teach",
        prompt:
          "Mia held a blue balloon. She took a slow breath. The balloon went up. Mia smiled and felt calm.",
        lesson:
          "Mia held a blue balloon. She took a slow breath. The balloon went up. Mia smiled and felt calm.",
        media_url:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900",
        ai_voice_style: "Storytelling",
      },
      {
        step_type: "ask",
        prompt: "What color was Mia's balloon?",
        question: "What color was Mia's balloon?",
        expected_answers: ["blue"],
        accepted_variations: ["a blue balloon", "it was blue"],
        ai_voice_style: "Curious",
      },
      {
        step_type: "feedback",
        prompt: "Thank you for listening.",
        correct_feedback: ["Yes. Mia had a blue balloon."],
        wrong_feedback: ["Good listening. The balloon was blue."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Gentle",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: My Turn, Your Turn",
    description:
      "Practice turn-taking language with a predictable conversation prompt.",
    activity_type: "Turn Taking",
    speech_ladder_level: "phrase",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900",
    steps: [
      {
        step_type: "teach",
        prompt:
          "When we play together, we can say my turn and your turn.",
        lesson:
          "First I play. Then you play. We can say: my turn, your turn.",
        ai_voice_style: "Friendly",
      },
      {
        step_type: "conversation",
        prompt: "Say, my turn.",
        topics: ["Say, my turn."],
        expected_answers: ["my turn"],
        accepted_variations: ["it's my turn", "my turn please"],
        ai_voice_style: "Patient",
      },
      {
        step_type: "feedback",
        prompt: "Good turn taking.",
        correct_feedback: ["Nice turn taking. My turn."],
        wrong_feedback: ["Good try. Let's say, my turn."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Encouraging",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: Request More Bubbles",
    description:
      "Practice requesting more with a motivating play routine and short phrase.",
    activity_type: "Check & Answer",
    speech_ladder_level: "phrase",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900",
    steps: [
      {
        step_type: "teach",
        prompt: "When you want to keep playing, you can say, more bubbles please.",
        lesson:
          "Look at the bubbles. If you want more, say: more bubbles please.",
        media_url:
          "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900",
        ai_voice_style: "Friendly",
      },
      {
        step_type: "ask",
        prompt: "What can you say when you want more bubbles?",
        question: "What can you say when you want more bubbles?",
        expected_answers: ["more bubbles please", "more bubbles", "bubbles please"],
        accepted_variations: ["i want more bubbles", "more please"],
        ai_voice_style: "Patient",
      },
      {
        step_type: "feedback",
        prompt: "Good asking.",
        correct_feedback: ["Nice asking. More bubbles please."],
        wrong_feedback: ["Good try. Say, more bubbles please."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Supportive",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: Clap Hands",
    description:
      "Follow a simple one-step instruction with movement and adult support.",
    activity_type: "Teach & Practice",
    speech_ladder_level: "word",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900",
    steps: [
      {
        step_type: "teach",
        prompt: "Listen first. Clap hands.",
        lesson: "When you hear clap hands, put your hands together.",
        ai_voice_style: "Teaching",
      },
      {
        step_type: "do_it",
        prompt: "Clap hands.",
        instruction: "Clap your hands one time.",
        ai_voice_style: "Coaching",
      },
      {
        step_type: "feedback",
        prompt: "Good listening.",
        correct_feedback: ["Great listening. You clapped hands."],
        wrong_feedback: ["That's okay. Try clap hands with me."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Gentle",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: Yes or No Snack",
    description:
      "Practice answering yes or no to a simple preference question.",
    activity_type: "Check & Answer",
    speech_ladder_level: "word",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900",
    steps: [
      {
        step_type: "teach",
        prompt: "You can answer yes or no.",
        lesson: "If you want it, say yes. If you do not want it, say no.",
        media_url:
          "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900",
        ai_voice_style: "Teaching",
      },
      {
        step_type: "ask",
        prompt: "Do you want a snack?",
        question: "Do you want a snack?",
        expected_answers: ["yes", "no"],
        accepted_variations: ["yes please", "no thank you", "no thanks"],
        ai_voice_style: "Curious",
      },
      {
        step_type: "feedback",
        prompt: "Thank you for answering.",
        correct_feedback: ["Good answer."],
        wrong_feedback: ["Good try. You can say yes or no."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Supportive",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: Match Sad and Happy",
    description:
      "Identify basic emotions using a simple two-choice visual activity.",
    activity_type: "Check & Answer",
    speech_ladder_level: "word",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900",
    steps: [
      {
        step_type: "teach",
        prompt: "Happy can look like a smile. Sad can look like a frown.",
        lesson: "Look at the faces. Happy has a smile. Sad has a frown.",
        ai_voice_style: "Teaching",
      },
      {
        step_type: "show_choose",
        prompt: "Tap the sad face.",
        question: "Which face is sad?",
        choices: [
          {
            id: 1,
            label: "Happy",
            image_url:
              "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=700",
            is_correct: false,
          },
          {
            id: 2,
            label: "Sad",
            image_url:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700",
            is_correct: true,
          },
        ],
        ai_voice_style: "Curious",
      },
      {
        step_type: "feedback",
        prompt: "Good looking.",
        correct_feedback: ["Yes. That face is sad."],
        wrong_feedback: ["Good try. Look for the frown."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Gentle",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: Wash Hands Steps",
    description:
      "Practice a daily living routine with short, predictable steps.",
    activity_type: "Life Skills",
    speech_ladder_level: "phrase",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=900",
    steps: [
      {
        step_type: "teach",
        prompt: "We wash hands to keep them clean.",
        lesson:
          "First wet hands. Then use soap. Rub hands. Rinse. Dry hands.",
        media_url:
          "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=900",
        ai_voice_style: "Teaching",
      },
      {
        step_type: "do_it",
        prompt: "Show washing hands.",
        instruction: "Pretend to wash your hands.",
        materials_needed: ["Soap", "Water", "Towel"],
        ai_voice_style: "Coaching",
      },
      {
        step_type: "feedback",
        prompt: "Good practicing.",
        correct_feedback: ["Nice work practicing washing hands."],
        wrong_feedback: ["That's okay. We can try the steps again."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Supportive",
        },
      },
    ],
  },
  {
    title: "MOBI Pilot: Waiting for My Turn Story",
    description:
      "A short narration-first story about waiting, turn-taking, and calm behavior.",
    activity_type: "Story",
    speech_ladder_level: "sentence",
    activity_domain: "speech_training",
    thumbnail_url:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900",
    steps: [
      {
        step_type: "teach",
        prompt:
          "Leo wanted the red car. Ana was playing with it. Leo waited. He took one slow breath. Then Ana said, your turn. Leo smiled and played.",
        lesson:
          "Leo wanted the red car. Ana was playing with it. Leo waited. He took one slow breath. Then Ana said, your turn. Leo smiled and played.",
        ai_voice_style: "Storytelling",
      },
      {
        step_type: "ask",
        prompt: "What did Leo do while waiting?",
        question: "What did Leo do while waiting?",
        expected_answers: ["he waited", "waited", "took a breath", "slow breath"],
        accepted_variations: ["he took a slow breath", "he was waiting"],
        ai_voice_style: "Curious",
      },
      {
        step_type: "feedback",
        prompt: "Thank you for listening.",
        correct_feedback: ["Yes. Leo waited and took a slow breath."],
        wrong_feedback: ["Good listening. Leo waited for his turn."],
        ai_voice_style: {
          correct: "Warm Praise",
          wrong: "Gentle",
        },
      },
    ],
  },
];

function baseActivity(activity: (typeof activities)[number]) {
  return {
    title: activity.title,
    description: activity.description,
    activity_type: activity.activity_type,
    speech_ladder_level: activity.speech_ladder_level,
    max_attempts: 3,
    estimated_minutes: 5,
    allow_skip: true,
    success_required_count: 1,
    thumbnail_url: activity.thumbnail_url,
    ai_voice_gender: "girl",
    ai_voice_speed: "moderate",
    status: "published",
    uploaded_by: "Center Admin",
    center_id: CENTER_ID,
    access_scope: "center_library",
    delivery_mode: "screen",
    attention_demand: "medium",
    sensory_load: "low",
    movement_level:
      activity.activity_type === "Life Skills" ? "active" : "light",
    interaction_mode:
      activity.activity_type === "Check & Answer" ? "choice" : "speech",
    topic_tags: ["mobi-pilot"],
    visual_support_level: "standard",
    communication_mode: "spoken_words",
    assistance_level: "some_assistance",
    sensory_features: [],
    activity_domain: activity.activity_domain,
    created_by_role: "center_admin",
    archived_at: null,
  };
}

function stepRow(activityId: string, step: any, index: number) {
  return {
    activity_id: activityId,
    step_order: index + 1,
    step_type: step.step_type,
    instruction: step.instruction || null,
    prompt: step.prompt || null,
    media_url: step.media_url || null,
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
      media: step.media_url
        ? [
            {
              id: `${index + 1}-media`,
              type: "image",
              url: step.media_url,
              name: "Pilot visual",
            },
          ]
        : [],
      prompt_audio_url: null,
      feedback_audio_urls: null,
      choices: step.choices || [],
      topics: step.topics || [],
      materials_needed: step.materials_needed || [],
      correct_feedback: step.correct_feedback || null,
      wrong_feedback: step.wrong_feedback || null,
      ai_voice_style: step.ai_voice_style || null,
    },
  };
}

async function seedPilotActivities() {
  const titles = activities.map((activity) => activity.title);

  const { data: existingActivities, error: existingError } = await supabase
    .from("activities")
    .select("id, title")
    .eq("center_id", CENTER_ID)
    .in("title", titles);

  if (existingError) {
    throw existingError;
  }

  const existingActivityByTitle = new Map(
    (existingActivities || []).map((activity) => [
      activity.title,
      activity.id,
    ]),
  );

  const createdActivityIds: string[] = [];

  for (const activity of activities) {
    const existingActivityId =
      existingActivityByTitle.get(activity.title);

    if (existingActivityId) {
      const {
        count: existingStepCount,
        error: stepCountError,
      } = await supabase
        .from("activity_steps")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("activity_id", existingActivityId);

      if (stepCountError) {
        throw stepCountError;
      }

      if ((existingStepCount ?? 0) === 0) {
        const { error: repairStepsError } = await supabase
          .from("activity_steps")
          .insert(
            activity.steps.map((step, index) =>
              stepRow(existingActivityId, step, index),
            ),
          );

        if (repairStepsError) {
          throw repairStepsError;
        }

        console.log(`Repaired steps: ${activity.title}`);
      } else {
        console.log(`Kept existing: ${activity.title}`);
      }

      createdActivityIds.push(existingActivityId);
      continue;
    }

    const { data: createdActivity, error: activityError } = await supabase
      .from("activities")
      .insert(baseActivity(activity))
      .select("id, title")
      .single();

    if (activityError || !createdActivity) {
      throw activityError || new Error(`Unable to create ${activity.title}`);
    }

    const { error: stepsError } = await supabase
      .from("activity_steps")
      .insert(
        activity.steps.map((step, index) =>
          stepRow(createdActivity.id, step, index),
        ),
      );

    if (stepsError) {
      throw stepsError;
    }

    createdActivityIds.push(createdActivity.id);
    console.log(`Seeded: ${createdActivity.title}`);
  }

  const desiredAssignments = createdActivityIds.slice(0, 6).map((activityId, index) => ({
    center_id: CENTER_ID,
    learner_id: TEST_LEARNER_ID,
    activity_id: activityId,
    assigned_by_role: "center_admin",
    priority: index + 1,
    is_required: index === 0,
    status: "pending",
    assignment_type: index === 0 ? "required" : "recommended",
  }));

  const { data: existingAssignments, error: existingAssignmentsError } =
    await supabase
      .from("learner_activity_assignments")
      .select("activity_id")
      .eq("center_id", CENTER_ID)
      .eq("learner_id", TEST_LEARNER_ID)
      .in("activity_id", createdActivityIds);

  if (existingAssignmentsError) {
    throw existingAssignmentsError;
  }

  const assignedActivityIds = new Set(
    (existingAssignments || []).map((assignment) => assignment.activity_id),
  );

  const assignmentsToInsert = desiredAssignments.filter(
    (assignment) => !assignedActivityIds.has(assignment.activity_id),
  );

  if (assignmentsToInsert.length > 0) {
    const { error: assignmentError } = await supabase
      .from("learner_activity_assignments")
      .insert(assignmentsToInsert);

    if (assignmentError) {
      throw assignmentError;
    }
  }

  console.log(
    `Pilot library ready with ${createdActivityIds.length} activities. Added ${assignmentsToInsert.length} new assignments.`,
  );
}

if (process.argv[1]?.endsWith("seedPilotActivities.ts")) {
  seedPilotActivities().catch((error) => {
    console.error("Unable to seed pilot activities:", error);
    process.exit(1);
  });
}
