import dotenv from "dotenv";

dotenv.config({ quiet: true });

import {
  supabase,
} from "../src/config/supabase";
import {
  enrollLearnerService,
} from "../src/services/learner/enrollmentService";

const CENTER_ID =
  process.env.MOBI_TEST_CENTER_ID ??
  "d5ae1649-0343-46d4-b433-575c97e064e1";

const TEMPLATE_CODE =
  "MOBI_LEARNER_INTAKE_PROFILE";

const TEMPLATE_VERSION = 1;
const SEED_RUN_ID = Date.now();

type SeedLearner = {
  firstName: string;
  lastName: string;
  nickname: string;
  birthDate: string;
  sexAtBirth: string;
  gradeLevel: string;
  expressive: string;
  communicationMethod: string;
  visualSupport: string;
  tabletAssistance: string;
  engagement: string;
  sensory: string[];
  topics: string[];
  goals: string;
  notes: string;
};

const learners: SeedLearner[] = [
  {
    firstName: "Mika",
    lastName: "Reyes",
    nickname: "Mika",
    birthDate: "2019-04-12",
    sexAtBirth: "Female",
    gradeLevel: "Kindergarten",
    expressive: "single_words",
    communicationMethod: "speech_gestures",
    visualSupport: "always",
    tabletAssistance: "minimal_assistance",
    engagement: "5_to_10",
    sensory: ["visual", "auditory"],
    topics: ["animals", "music", "bubbles"],
    goals: "Increase spontaneous requesting and naming familiar objects.",
    notes: "Responds well to soft voice prompts and animal pictures.",
  },
  {
    firstName: "Theo",
    lastName: "Santos",
    nickname: "Theo",
    birthDate: "2018-09-20",
    sexAtBirth: "Male",
    gradeLevel: "Grade 1",
    expressive: "sounds_vocalizations",
    communicationMethod: "gestures",
    visualSupport: "always",
    tabletAssistance: "maximal_assistance",
    engagement: "less_than_5",
    sensory: ["tactile", "vestibular"],
    topics: ["cars", "spinning toys", "colors"],
    goals: "Build imitation of sounds and simple action requests.",
    notes: "Needs regulation breaks before seated work.",
  },
  {
    firstName: "Iya",
    lastName: "Cruz",
    nickname: "Iya",
    birthDate: "2017-01-07",
    sexAtBirth: "Female",
    gradeLevel: "Grade 2",
    expressive: "two_word_combinations",
    communicationMethod: "speech",
    visualSupport: "sometimes",
    tabletAssistance: "minimal_assistance",
    engagement: "10_to_15",
    sensory: ["auditory"],
    topics: ["princesses", "drawing", "food"],
    goals: "Practice two-word requests and turn-taking language.",
    notes: "May cover ears with loud audio. Keep feedback gentle.",
  },
  {
    firstName: "Nico",
    lastName: "Garcia",
    nickname: "Nico",
    birthDate: "2016-11-25",
    sexAtBirth: "Male",
    gradeLevel: "Grade 2",
    expressive: "short_phrases",
    communicationMethod: "speech",
    visualSupport: "sometimes",
    tabletAssistance: "minimal_assistance",
    engagement: "10_to_15",
    sensory: ["proprioceptive"],
    topics: ["basketball", "dinosaurs", "robots"],
    goals: "Improve phrase expansion and answering simple WH questions.",
    notes: "Benefits from movement before table activities.",
  },
  {
    firstName: "Sofia",
    lastName: "Lim",
    nickname: "Sofi",
    birthDate: "2020-06-03",
    sexAtBirth: "Female",
    gradeLevel: "Nursery",
    expressive: "no_speech",
    communicationMethod: "gestures",
    visualSupport: "always",
    tabletAssistance: "maximal_assistance",
    engagement: "less_than_5",
    sensory: ["visual", "tactile"],
    topics: ["songs", "snacks", "peekaboo"],
    goals: "Introduce functional choices and yes/no responses.",
    notes: "Uses reaching and leading adult by hand to communicate.",
  },
  {
    firstName: "Liam",
    lastName: "Tan",
    nickname: "Liam",
    birthDate: "2018-02-18",
    sexAtBirth: "Male",
    gradeLevel: "Kinder",
    expressive: "single_words",
    communicationMethod: "speech_gestures",
    visualSupport: "always",
    tabletAssistance: "minimal_assistance",
    engagement: "5_to_10",
    sensory: ["olfactory"],
    topics: ["trains", "numbers", "puzzles"],
    goals: "Increase naming and requesting with one to two words.",
    notes: "Strong interest in numbers can be used as reinforcement.",
  },
  {
    firstName: "Amara",
    lastName: "Velasco",
    nickname: "Mara",
    birthDate: "2015-08-09",
    sexAtBirth: "Female",
    gradeLevel: "Grade 3",
    expressive: "sentences",
    communicationMethod: "speech",
    visualSupport: "rarely",
    tabletAssistance: "minimal_assistance",
    engagement: "more_than_15",
    sensory: ["no_reported_sensitivity"],
    topics: ["stories", "science", "cats"],
    goals: "Practice social conversation and narrative retell.",
    notes: "Enjoys storytelling and can tolerate longer activities.",
  },
  {
    firstName: "Kian",
    lastName: "Flores",
    nickname: "Kian",
    birthDate: "2017-12-14",
    sexAtBirth: "Male",
    gradeLevel: "Grade 1",
    expressive: "two_word_combinations",
    communicationMethod: "speech",
    visualSupport: "sometimes",
    tabletAssistance: "minimal_assistance",
    engagement: "5_to_10",
    sensory: ["vestibular", "proprioceptive"],
    topics: ["jumping", "superheroes", "animals"],
    goals: "Improve requests, action words, and waiting turns.",
    notes: "Often seeks movement. Regulatory video before task may help.",
  },
  {
    firstName: "Elise",
    lastName: "Dela Cruz",
    nickname: "Ellie",
    birthDate: "2019-10-05",
    sexAtBirth: "Female",
    gradeLevel: "Kindergarten",
    expressive: "single_words",
    communicationMethod: "speech_gestures",
    visualSupport: "always",
    tabletAssistance: "minimal_assistance",
    engagement: "5_to_10",
    sensory: ["gustatory", "tactile"],
    topics: ["kitchen play", "dolls", "colors"],
    goals: "Expand food and play vocabulary using simple prompts.",
    notes: "Avoid sudden texture-related prompts when dysregulated.",
  },
  {
    firstName: "Rafael",
    lastName: "Mendoza",
    nickname: "Rafa",
    birthDate: "2016-03-22",
    sexAtBirth: "Male",
    gradeLevel: "Grade 2",
    expressive: "short_phrases",
    communicationMethod: "speech",
    visualSupport: "sometimes",
    tabletAssistance: "minimal_assistance",
    engagement: "10_to_15",
    sensory: ["auditory", "visual"],
    topics: ["space", "planets", "drawing"],
    goals: "Practice descriptive phrases and answering who/what questions.",
    notes: "Prefers calm visuals and low-volume audio.",
  },
  {
    firstName: "Yuna",
    lastName: "Ong",
    nickname: "Yuna",
    birthDate: "2020-01-30",
    sexAtBirth: "Female",
    gradeLevel: "Nursery",
    expressive: "sounds_vocalizations",
    communicationMethod: "gestures",
    visualSupport: "always",
    tabletAssistance: "maximal_assistance",
    engagement: "less_than_5",
    sensory: ["interoceptive"],
    topics: ["songs", "lights", "water play"],
    goals: "Support intentional communication and simple imitation.",
    notes: "Needs adult monitoring for fatigue and hunger cues.",
  },
  {
    firstName: "Miguel",
    lastName: "Aquino",
    nickname: "Miggy",
    birthDate: "2015-05-19",
    sexAtBirth: "Male",
    gradeLevel: "Grade 4",
    expressive: "sentences",
    communicationMethod: "speech",
    visualSupport: "not_needed",
    tabletAssistance: "minimal_assistance",
    engagement: "more_than_15",
    sensory: ["no_reported_sensitivity"],
    topics: ["Minecraft", "math", "jokes"],
    goals: "Improve topic maintenance and flexible conversation.",
    notes: "May perseverate on preferred topics; use clear transitions.",
  },
  {
    firstName: "Ari",
    lastName: "Navarro",
    nickname: "Ari",
    birthDate: "2018-07-27",
    sexAtBirth: "Male",
    gradeLevel: "Kinder",
    expressive: "single_words",
    communicationMethod: "speech_gestures",
    visualSupport: "always",
    tabletAssistance: "minimal_assistance",
    engagement: "5_to_10",
    sensory: ["visual", "vestibular"],
    topics: ["balls", "cars", "bubbles"],
    goals: "Practice functional words: more, help, stop, go.",
    notes: "Responds to predictable routines and visual choices.",
  },
  {
    firstName: "Bella",
    lastName: "Ramos",
    nickname: "Bella",
    birthDate: "2017-04-02",
    sexAtBirth: "Female",
    gradeLevel: "Grade 1",
    expressive: "two_word_combinations",
    communicationMethod: "speech",
    visualSupport: "sometimes",
    tabletAssistance: "minimal_assistance",
    engagement: "10_to_15",
    sensory: ["tactile"],
    topics: ["animals", "pretend play", "stickers"],
    goals: "Build turn-taking language and social greetings.",
    notes: "Benefits from reward stickers and short predictable tasks.",
  },
  {
    firstName: "Owen",
    lastName: "Villanueva",
    nickname: "Owen",
    birthDate: "2016-09-11",
    sexAtBirth: "Male",
    gradeLevel: "Grade 2",
    expressive: "short_phrases",
    communicationMethod: "speech",
    visualSupport: "sometimes",
    tabletAssistance: "minimal_assistance",
    engagement: "10_to_15",
    sensory: ["auditory", "proprioceptive"],
    topics: ["music", "drums", "vehicles"],
    goals: "Improve listening, following one-step directions, and requesting breaks.",
    notes: "Likes music but may need volume control.",
  },
];

function responsesFor(learner: SeedLearner) {
  return [
    {
      questionId: "expressive_communication",
      value: learner.expressive,
    },
    {
      questionId: "communication_method",
      value: learner.communicationMethod,
    },
    {
      questionId: "benefits_visual_supports",
      value: learner.visualSupport,
    },
    {
      questionId: "tablet_assistance",
      value: learner.tabletAssistance,
    },
    {
      questionId: "structured_engagement",
      value: learner.engagement,
    },
    {
      questionId: "sensory_sensitivities",
      value: learner.sensory,
    },
    {
      questionId: "motivating_topics",
      value: learner.topics,
    },
    {
      questionId: "therapy_goals_priorities",
      value: learner.goals,
    },
    {
      questionId: "additional_notes",
      value: learner.notes,
    },
  ];
}

async function getExistingQuestionCodes() {
  const { data: template, error: templateError } = await supabase
    .from("assessment_templates")
    .select("id")
    .eq("template_code", TEMPLATE_CODE)
    .eq("version", TEMPLATE_VERSION)
    .single();

  if (templateError) {
    throw templateError;
  }

  const { data: questions, error: questionError } = await supabase
    .from("assessment_questions")
    .select("question_code")
    .eq("template_id", template.id)
    .eq("is_active", true);

  if (questionError) {
    throw questionError;
  }

  return new Set(
    (questions ?? []).map((question) => question.question_code),
  );
}

async function archiveExistingPilotLearners() {
  const { data: existingLearners, error } = await supabase
    .from("learners")
    .select("id, learner_code, first_name, last_name")
    .eq("center_id", CENTER_ID);

  if (error) {
    throw error;
  }

  const seededNames = new Set(
    learners.map((learner) =>
      `${learner.firstName} ${learner.lastName}`.toLowerCase(),
    ),
  );

  const dummyLearnerIds = (existingLearners ?? [])
    .filter((learner) => {
      const code = String(learner.learner_code ?? "").toLowerCase();
      const name = `${learner.first_name ?? ""} ${learner.last_name ?? ""}`
        .trim()
        .toLowerCase();

      return (
        code.startsWith("pilot-") ||
        code.startsWith("mobi-pilot-") ||
        code.includes("test") ||
        code.includes("dummy") ||
        seededNames.has(name)
      );
    })
    .map((learner) => learner.id);

  if (dummyLearnerIds.length === 0) {
    console.log("No previous pilot/test learners found to archive.");
    return;
  }

  const { error: updateError } = await supabase
    .from("learners")
    .update({
      enrollment_status: "inactive",
      updated_at: new Date().toISOString(),
    })
    .in("id", dummyLearnerIds);

  if (updateError) {
    throw updateError;
  }

  console.log(`Deactivated ${dummyLearnerIds.length} previous pilot/test learners.`);
}

async function main() {
  const questionCodes = await getExistingQuestionCodes();

  await archiveExistingPilotLearners();

  for (const [index, learner] of learners.entries()) {
    const allResponses = responsesFor(learner);
    const responses = allResponses.filter((response) =>
      questionCodes.has(response.questionId),
    );

    const missingQuestions = allResponses
      .filter((response) => !questionCodes.has(response.questionId))
      .map((response) => response.questionId);

    if (missingQuestions.length > 0) {
      console.log(
        `Skipping unavailable assessment questions for ${learner.firstName}: ${missingQuestions.join(", ")}`,
      );
    }

    const payload = {
      learner: {
        firstName: learner.firstName,
        middleName: null,
        lastName: learner.lastName,
        nickname: learner.nickname,
        birthDate: learner.birthDate,
        sexAtBirth: learner.sexAtBirth.toLowerCase(),
        homeAddress: "Cebu City",
        schoolName: "MOBI Pilot School",
        gradeLevel: learner.gradeLevel,
        learnerBio: `MOBI pilot learner profile for ${learner.nickname}.`,
      },
      guardian: {
        firstName: `Guardian${index + 1}`,
        middleName: null,
        lastName: learner.lastName,
        relationship: "Parent",
        phoneNumber: `0917000${String(index + 1).padStart(4, "0")}`,
        email: `${learner.firstName}.${learner.lastName}.${index + 1}.${SEED_RUN_ID}@mobi-pilot.test`
          .toLowerCase()
          .replace(/\s+/g, ""),
        homeAddress: "Cebu City",
        emergencyContactName: `Emergency ${learner.lastName}`,
        emergencyContactPhone: `0928000${String(index + 1).padStart(4, "0")}`,
        authorizedForUpdates: true,
      },
      learnerIntakeProfile: {
        templateCode: TEMPLATE_CODE,
        templateVersion: TEMPLATE_VERSION,
        responses,
        preliminaryMeasurement: {
          suggestedSpeechLadder: null,
          attentionAreas: [
            "communication",
            "regulation",
            learner.expressive,
          ],
        },
        status: "completed_for_therapist_review",
      },
      enrollmentStatus: "completed_for_therapist_review",
    };

    const result = await enrollLearnerService({
      payload,
      centerId: CENTER_ID,
      profilePhoto: null,
    });

    await supabase
      .from("learners")
      .update({
        learner_code: `MOBI-PILOT-${String(index + 1).padStart(2, "0")}`,
      })
      .eq("id", result.learner.id);

    console.log(
      `Seeded ${learner.firstName} ${learner.lastName} (${index + 1}/${learners.length})`,
    );
  }

  console.log("Seeded 15 realistic MOBI pilot learners.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
