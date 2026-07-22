import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  ImagePlus,
  Save,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";

/* =========================================================
   TYPES
========================================================= */

type EnrollmentStep =
  | "learner"
  | "guardian"
  | "assessment"
  | "review";

type QuestionType =
  | "yes_no"
  | "single"
  | "multi"
  | "frequency"
  | "support"
  | "short_text"
  | "long_text";

type AnswerValue = string | string[];

type ConditionOperator = "equals" | "includes" | "in";

interface SelectOption {
  label: string;
  value: string;
}

interface BranchCondition {
  questionId: string;
  operator: ConditionOperator;
  value: string | string[];
}

interface AssessmentQuestion {
  id: string;
  sectionId: string;
  prompt: string;
  helper?: string;
  type: QuestionType;
  options?: SelectOption[];
  required?: boolean;
  allowOther?: boolean;
  showIf?: BranchCondition[];
}

interface AssessmentSection {
  id: string;
  title: string;
  description: string;
}

interface LearnerForm {
  firstName: string;
  middleName: string;
  lastName: string;
  nickname: string;
  birthDate: string;
  sexAtBirth: string;
  primaryLanguage: string;
  otherLanguages: string;
  homeAddress: string;
  schoolName: string;
  gradeLevel: string;
  diagnosisStatus: string;
  diagnosisDetails: string;
  learnerBio: string;
}

interface GuardianForm {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  sameAddressAsLearner: boolean;
  homeAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  authorizedForUpdates: boolean;
}

interface ClinicForm {
  assignedDoctorId: string;
  otherDoctorName: string;
  assignedTherapistId: string;
  enrollmentDate: string;
  referralSource: string;
  clinicNotes: string;
}

interface EnrollmentForm {
  learner: LearnerForm;
  guardian: GuardianForm;
  clinic: ClinicForm;
}

interface ClinicalFlag {
  code: string;
  severity: "information" | "review" | "priority";
  title: string;
  description: string;
}

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5001/api";

const DRAFT_STORAGE_KEY = "mobi-learner-enrollment-draft-v2";

const getTodayInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const inputClassName =
  "block w-full min-w-0 max-w-full rounded-xl border border-[#DDCDE3] bg-white px-3 py-3 text-sm text-[#302936] outline-none transition placeholder:text-[#9B929F] focus:border-[#965DEB] focus:ring-4 focus:ring-[#965DEB]/10 sm:rounded-2xl sm:px-4";

const enrollmentSteps: {
  id: EnrollmentStep;
  label: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    id: "learner",
    label: "Learner",
    description: "Personal details",
    icon: UserRound,
  },
  {
    id: "guardian",
    label: "Guardian",
    description: "Contact and clinic",
    icon: UsersRound,
  },
  {
    id: "assessment",
    label: "Assessment",
    description: "Initial profile",
    icon: ClipboardList,
  },
  {
    id: "review",
    label: "Review",
    description: "Confirm enrollment",
    icon: ShieldCheck,
  },
];

const assessmentSections: AssessmentSection[] = [
  {
    id: "background",
    title: "Background",
    description:
      "Previous assessments, hearing information, and important developmental concerns.",
  },
  {
    id: "communication",
    title: "Communication",
    description:
      "How the learner currently communicates needs, choices, and ideas.",
  },
  {
    id: "understanding",
    title: "Understanding Language",
    description:
      "How the learner responds to words, questions, and instructions.",
  },
  {
    id: "speech-aac",
    title: "Speech and AAC",
    description:
      "Speech and alternative communication questions shown only when relevant.",
  },
  {
    id: "social-readiness",
    title: "Social Readiness",
    description:
      "Interaction, shared attention, imitation, play, and communication repair.",
  },
  {
    id: "supports-goals",
    title: "Supports and Goals",
    description:
      "Sensory needs, activity preferences, safety information, and family priorities.",
  },
];

const yesNoOptions: SelectOption[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Not sure", value: "not_sure" },
  { label: "Not yet observed", value: "not_observed" },
];

const frequencyOptions: SelectOption[] = [
  { label: "Never", value: "never" },
  { label: "Rarely", value: "rarely" },
  { label: "Sometimes", value: "sometimes" },
  { label: "Often", value: "often" },
  { label: "Consistently", value: "consistently" },
  { label: "Not sure", value: "not_sure" },
];

const supportOptions: SelectOption[] = [
  { label: "Independently", value: "independent" },
  { label: "With a verbal reminder", value: "verbal_prompt" },
  { label: "With a gesture", value: "gesture_prompt" },
  { label: "With a visual cue", value: "visual_prompt" },
  { label: "After a demonstration", value: "model_prompt" },
  {
    label: "With physical assistance",
    value: "physical_assistance",
  },
  { label: "Not yet observed", value: "not_observed" },
];

const doctorList = [
  { id: "doctor-1", name: "Dr. Andres Lou Mulach" },
  { id: "doctor-2", name: "Dr. Maria Santos" },
  { id: "doctor-3", name: "Dr. John Reyes" },
  { id: "doctor-4", name: "Dr. Sophia Garcia" },
  { id: "other", name: "Other doctor" },
];

const therapistList = [
  { id: "therapist-1", name: "Angela Cruz, RSLP" },
  { id: "therapist-2", name: "Beatrice Ramos, RSLP" },
  { id: "therapist-3", name: "Carla Mendoza, RSLP" },
];

const initialForm: EnrollmentForm = {
  learner: {
    firstName: "",
    middleName: "",
    lastName: "",
    nickname: "",
    birthDate: "",
    sexAtBirth: "",
    primaryLanguage: "",
    otherLanguages: "",
    homeAddress: "",
    schoolName: "",
    gradeLevel: "",
    diagnosisStatus: "",
    diagnosisDetails: "",
    learnerBio: "",
  },
  guardian: {
    fullName: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    sameAddressAsLearner: true,
    homeAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    authorizedForUpdates: true,
  },
  clinic: {
    assignedDoctorId: "",
    otherDoctorName: "",
    assignedTherapistId: "",
    enrollmentDate: getTodayInputValue(),
    referralSource: "",
    clinicNotes: "",
  },
};

/* =========================================================
   ASSESSMENT QUESTION BANK

   Keep these IDs stable. The backend should save answers
   using the question ID rather than the question text.
========================================================= */

const assessmentQuestions: AssessmentQuestion[] = [
  /* BACKGROUND */

  {
    id: "main_concerns",
    sectionId: "background",
    prompt:
      "Which areas are the main reasons for enrolling the learner?",
    helper: "Select all that apply.",
    type: "multi",
    required: true,
    allowOther: true,
    options: [
      {
        label: "Understanding spoken language",
        value: "understanding_language",
      },
      {
        label: "Expressing needs or ideas",
        value: "expressing_needs",
      },
      {
        label: "Speech sound production or clarity",
        value: "speech_clarity",
      },
      {
        label: "Social interaction and participation",
        value: "social_interaction",
      },
      {
        label: "Conversation skills",
        value: "conversation",
      },
      {
        label: "Pictures, signs, or a communication device",
        value: "aac",
      },
      {
        label: "Sensory or regulation support",
        value: "regulation",
      },
      {
        label: "Eating, chewing, or swallowing",
        value: "feeding",
      },
    ],
  },
  {
    id: "previous_assessment",
    sectionId: "background",
    prompt:
      "Has the learner previously completed a speech, language, developmental, or psychological assessment?",
    type: "yes_no",
    required: true,
  },
  {
    id: "previous_assessment_details",
    sectionId: "background",
    prompt:
      "Please provide the known assessment, diagnosis, clinic, or professional details.",
    helper: "You may leave unknown dates or details blank.",
    type: "long_text",
    showIf: [
      {
        questionId: "previous_assessment",
        operator: "equals",
        value: "yes",
      },
    ],
  },
  {
    id: "hearing_test",
    sectionId: "background",
    prompt: "Has the learner completed a formal hearing test?",
    type: "yes_no",
    required: true,
  },
  {
    id: "hearing_concern",
    sectionId: "background",
    prompt:
      "Do you currently have concerns about the learner's hearing or response to sounds?",
    type: "yes_no",
    required: true,
  },
  {
    id: "hearing_details",
    sectionId: "background",
    prompt:
      "Please describe the hearing concern, test result, or history of ear infections.",
    type: "long_text",
    showIf: [
      {
        questionId: "hearing_concern",
        operator: "in",
        value: ["yes", "not_sure"],
      },
    ],
  },
  {
    id: "skill_loss",
    sectionId: "background",
    prompt:
      "Has the learner stopped using any words, gestures, play skills, or social skills they previously used?",
    type: "yes_no",
    required: true,
  },
  {
    id: "skill_loss_details",
    sectionId: "background",
    prompt:
      "Which skills were lost, and approximately when did the change happen?",
    type: "long_text",
    required: true,
    showIf: [
      {
        questionId: "skill_loss",
        operator: "equals",
        value: "yes",
      },
    ],
  },

  /* COMMUNICATION */

  {
    id: "communication_methods",
    sectionId: "communication",
    prompt: "How does the learner currently communicate?",
    helper:
      "Select every method the learner uses, even if it is only used occasionally.",
    type: "multi",
    required: true,
    allowOther: true,
    options: [
      { label: "Body movements", value: "body_movements" },
      {
        label: "Facial expressions or gaze",
        value: "facial_gaze",
      },
      { label: "Reaching or pointing", value: "pointing" },
      {
        label: "Leading another person",
        value: "leading",
      },
      { label: "Gestures", value: "gestures" },
      { label: "Manual signs", value: "manual_signs" },
      {
        label: "Sounds or vocalizations",
        value: "vocalizations",
      },
      {
        label: "Word approximations",
        value: "word_approximations",
      },
      { label: "Spoken words", value: "spoken_words" },
      {
        label: "Spoken phrases or sentences",
        value: "spoken_phrases",
      },
      {
        label: "Pictures or communication cards",
        value: "pictures",
      },
      {
        label: "Communication board or application",
        value: "communication_board",
      },
      {
        label: "Speech-generating device",
        value: "speech_device",
      },
      {
        label: "Typing or writing",
        value: "typing_writing",
      },
    ],
  },
  {
    id: "preferred_communication_method",
    sectionId: "communication",
    prompt:
      "Which communication method appears easiest or most comfortable for the learner?",
    type: "single",
    required: true,
    allowOther: true,
    options: [
      { label: "Speech", value: "speech" },
      {
        label: "Gestures or signs",
        value: "gestures_signs",
      },
      { label: "Pictures", value: "pictures" },
      {
        label: "Communication device or application",
        value: "device",
      },
      {
        label: "Typing or writing",
        value: "typing_writing",
      },
      {
        label: "A combination of methods",
        value: "combination",
      },
      {
        label: "No clear preferred method yet",
        value: "unclear",
      },
    ],
  },
  {
    id: "request_help",
    sectionId: "communication",
    prompt: "How does the learner usually request help?",
    type: "support",
    required: true,
  },
  {
    id: "reject_or_stop",
    sectionId: "communication",
    prompt:
      "How does the learner communicate “no,” “stop,” or that they do not want something?",
    type: "support",
    required: true,
  },
  {
    id: "communicate_pain",
    sectionId: "communication",
    prompt:
      "How does the learner communicate pain, illness, or discomfort?",
    type: "support",
    required: true,
  },
  {
    id: "make_choices",
    sectionId: "communication",
    prompt:
      "How does the learner make a choice between two or more options?",
    type: "support",
    required: true,
  },
  {
    id: "communication_partners",
    sectionId: "communication",
    prompt:
      "With whom does the learner currently communicate successfully?",
    type: "multi",
    required: true,
    allowOther: true,
    options: [
      {
        label: "Parents or guardians",
        value: "parents",
      },
      { label: "Siblings", value: "siblings" },
      {
        label: "Other relatives",
        value: "relatives",
      },
      { label: "Teachers", value: "teachers" },
      { label: "Therapists", value: "therapists" },
      {
        label: "Other children",
        value: "children",
      },
      {
        label: "Unfamiliar adults",
        value: "unfamiliar_adults",
      },
    ],
  },

  /* UNDERSTANDING LANGUAGE */

  {
    id: "responds_to_name",
    sectionId: "understanding",
    prompt:
      "How often does the learner respond when their name is called?",
    helper:
      "Consider quiet and noisy environments and familiar and unfamiliar voices.",
    type: "frequency",
    required: true,
  },
  {
    id: "understands_familiar_words",
    sectionId: "understanding",
    prompt:
      "How often does the learner understand familiar people, objects, or action words?",
    type: "frequency",
    required: true,
  },
  {
    id: "follows_one_step",
    sectionId: "understanding",
    prompt:
      "How does the learner follow a familiar one-step instruction, such as “get your shoes”?",
    type: "support",
    required: true,
  },
  {
    id: "follows_new_one_step",
    sectionId: "understanding",
    prompt:
      "How does the learner follow a new one-step instruction?",
    type: "support",
    required: true,
  },
  {
    id: "follows_two_step",
    sectionId: "understanding",
    prompt:
      "How does the learner follow a two-step instruction?",
    type: "support",
    required: true,
  },
  {
    id: "understands_questions",
    sectionId: "understanding",
    prompt:
      "Which types of questions does the learner generally understand?",
    helper: "Select all that apply.",
    type: "multi",
    required: true,
    options: [
      {
        label: "Yes or no questions",
        value: "yes_no",
      },
      { label: "What questions", value: "what" },
      { label: "Who questions", value: "who" },
      { label: "Where questions", value: "where" },
      { label: "When questions", value: "when" },
      { label: "Why questions", value: "why" },
      {
        label: "Questions about past events",
        value: "past_events",
      },
      {
        label: "Questions about future events",
        value: "future_events",
      },
      {
        label: "Not yet consistently observed",
        value: "not_observed",
      },
    ],
  },
  {
    id: "visual_support_helpful",
    sectionId: "understanding",
    prompt:
      "Does the learner understand instructions better when pictures, gestures, or demonstrations are used?",
    type: "yes_no",
    required: true,
  },
  {
    id: "processing_time",
    sectionId: "understanding",
    prompt:
      "How much time does the learner usually need before responding to a question or instruction?",
    type: "single",
    required: true,
    options: [
      {
        label: "Responds immediately",
        value: "immediate",
      },
      {
        label: "A few seconds",
        value: "few_seconds",
      },
      {
        label: "Around 5–10 seconds",
        value: "five_to_ten_seconds",
      },
      {
        label: "More than 10 seconds",
        value: "more_than_ten_seconds",
      },
      {
        label: "Varies greatly by situation",
        value: "varies",
      },
      { label: "Not sure", value: "not_sure" },
    ],
  },

  /* SPEECH AND AAC */

  {
    id: "uses_spoken_speech",
    sectionId: "speech-aac",
    prompt:
      "Does the learner currently attempt or use spoken speech?",
    helper:
      "This includes sound attempts, word approximations, words, phrases, or sentences.",
    type: "yes_no",
    required: true,
  },
  {
    id: "spoken_language_level",
    sectionId: "speech-aac",
    prompt:
      "Which option best describes the learner's current spoken-language level?",
    type: "single",
    required: true,
    showIf: [
      {
        questionId: "uses_spoken_speech",
        operator: "equals",
        value: "yes",
      },
    ],
    options: [
      {
        label: "Mostly sounds or vocalizations",
        value: "sounds",
      },
      {
        label: "Syllables or word approximations",
        value: "syllables",
      },
      { label: "Single words", value: "words" },
      {
        label: "Two- to four-word phrases",
        value: "phrases",
      },
      {
        label: "Original sentences",
        value: "sentences",
      },
      {
        label: "Sentences and back-and-forth conversation",
        value: "conversation",
      },
    ],
  },
  {
    id: "imitates_sounds",
    sectionId: "speech-aac",
    prompt:
      "How often can the learner imitate a sound or word after hearing it?",
    type: "frequency",
    required: true,
    showIf: [
      {
        questionId: "uses_spoken_speech",
        operator: "equals",
        value: "yes",
      },
    ],
  },
  {
    id: "speech_clarity",
    sectionId: "speech-aac",
    prompt:
      "How much of the learner's speech can familiar people understand?",
    type: "single",
    required: true,
    showIf: [
      {
        questionId: "uses_spoken_speech",
        operator: "equals",
        value: "yes",
      },
    ],
    options: [
      {
        label: "Almost none",
        value: "almost_none",
      },
      {
        label: "A small amount",
        value: "small_amount",
      },
      { label: "About half", value: "about_half" },
      { label: "Most of it", value: "most" },
      {
        label: "Almost all of it",
        value: "almost_all",
      },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    id: "speech_consistency",
    sectionId: "speech-aac",
    prompt:
      "Does the same word sometimes sound different across attempts?",
    type: "yes_no",
    showIf: [
      {
        questionId: "uses_spoken_speech",
        operator: "equals",
        value: "yes",
      },
    ],
  },
  {
    id: "voice_fluency_concern",
    sectionId: "speech-aac",
    prompt:
      "Are there concerns about voice volume, hoarseness, speech rhythm, or stuttering?",
    type: "yes_no",
    showIf: [
      {
        questionId: "uses_spoken_speech",
        operator: "equals",
        value: "yes",
      },
    ],
  },
  {
    id: "uses_aac",
    sectionId: "speech-aac",
    prompt:
      "Does the learner use pictures, signs, a communication board, an application, a speech-generating device, typing, or writing to communicate?",
    helper:
      "These methods may be used together with speech and are sometimes called AAC.",
    type: "yes_no",
    required: true,
  },
  {
    id: "aac_methods",
    sectionId: "speech-aac",
    prompt:
      "Which alternative communication methods does the learner use?",
    type: "multi",
    required: true,
    allowOther: true,
    showIf: [
      {
        questionId: "uses_aac",
        operator: "equals",
        value: "yes",
      },
    ],
    options: [
      {
        label: "Manual signs",
        value: "manual_signs",
      },
      {
        label: "Photographs",
        value: "photographs",
      },
      {
        label: "Picture symbols or cards",
        value: "picture_symbols",
      },
      {
        label: "Communication board or book",
        value: "communication_board",
      },
      {
        label: "Communication application",
        value: "communication_app",
      },
      {
        label: "Speech-generating device",
        value: "speech_device",
      },
      {
        label: "Typing or writing",
        value: "typing_writing",
      },
    ],
  },
  {
    id: "aac_access",
    sectionId: "speech-aac",
    prompt:
      "How independently can the learner access and use their communication system?",
    type: "support",
    required: true,
    showIf: [
      {
        questionId: "uses_aac",
        operator: "equals",
        value: "yes",
      },
    ],
  },
  {
    id: "aac_available",
    sectionId: "speech-aac",
    prompt:
      "Is the communication system available across home, school, therapy, and community settings?",
    type: "yes_no",
    showIf: [
      {
        questionId: "uses_aac",
        operator: "equals",
        value: "yes",
      },
    ],
  },
  {
    id: "aac_evaluation_interest",
    sectionId: "speech-aac",
    prompt:
      "Would you like the clinic to evaluate whether pictures, signs, or a communication device may help the learner?",
    type: "yes_no",
    showIf: [
      {
        questionId: "uses_aac",
        operator: "in",
        value: ["no", "not_sure", "not_observed"],
      },
    ],
  },

  /* SOCIAL READINESS */

  {
    id: "initiates_interaction",
    sectionId: "social-readiness",
    prompt:
      "How often does the learner begin an interaction with another person?",
    type: "frequency",
    required: true,
  },
  {
    id: "responds_to_interaction",
    sectionId: "social-readiness",
    prompt:
      "How often does the learner respond when another person begins an interaction?",
    type: "frequency",
    required: true,
  },
  {
    id: "shared_attention",
    sectionId: "social-readiness",
    prompt:
      "How does the learner attend to something another person points to or shows them?",
    type: "support",
    required: true,
  },
  {
    id: "shares_interest",
    sectionId: "social-readiness",
    prompt:
      "How often does the learner show, bring, point to, or communicate about something interesting?",
    type: "frequency",
    required: true,
  },
  {
    id: "imitates_actions",
    sectionId: "social-readiness",
    prompt:
      "How does the learner imitate body movements or actions with objects?",
    type: "support",
    required: true,
  },
  {
    id: "turn_taking",
    sectionId: "social-readiness",
    prompt:
      "How does the learner participate in simple turn-taking?",
    type: "support",
    required: true,
  },
  {
    id: "shared_play",
    sectionId: "social-readiness",
    prompt:
      "How does the learner participate in shared or cooperative play?",
    type: "support",
    required: true,
  },
  {
    id: "communicates_emotions",
    sectionId: "social-readiness",
    prompt:
      "How does the learner communicate feelings or emotional needs?",
    type: "support",
    required: true,
  },
  {
    id: "repairs_misunderstanding",
    sectionId: "social-readiness",
    prompt:
      "When misunderstood, how does the learner try another way to communicate?",
    type: "support",
    required: true,
  },
  {
    id: "conversation_turns",
    sectionId: "social-readiness",
    prompt:
      "How many back-and-forth communication turns can the learner usually maintain?",
    type: "single",
    showIf: [
      {
        questionId: "spoken_language_level",
        operator: "in",
        value: ["phrases", "sentences", "conversation"],
      },
    ],
    options: [
      {
        label: "One response only",
        value: "one",
      },
      {
        label: "Two to three turns",
        value: "two_three",
      },
      {
        label: "Four to five turns",
        value: "four_five",
      },
      {
        label: "More than five turns",
        value: "more_than_five",
      },
      {
        label: "Varies depending on the topic",
        value: "varies",
      },
    ],
  },
  {
    id: "group_participation",
    sectionId: "social-readiness",
    prompt:
      "How does the learner participate in a small group activity?",
    type: "support",
    required: true,
  },

  /* SUPPORTS AND GOALS */

  {
    id: "sensory_needs",
    sectionId: "supports-goals",
    prompt:
      "Which sensory or environmental conditions affect the learner's participation?",
    helper: "Select all that apply.",
    type: "multi",
    allowOther: true,
    options: [
      {
        label: "Loud sounds",
        value: "loud_sounds",
      },
      {
        label: "Background noise",
        value: "background_noise",
      },
      {
        label: "Bright lights",
        value: "bright_lights",
      },
      {
        label: "Visual clutter",
        value: "visual_clutter",
      },
      {
        label: "Touch or clothing texture",
        value: "touch_texture",
      },
      {
        label: "Crowded spaces",
        value: "crowded_spaces",
      },
      {
        label: "Being close to other people",
        value: "physical_proximity",
      },
      {
        label: "Movement or balance",
        value: "movement",
      },
      {
        label: "No significant concern observed",
        value: "none_observed",
      },
    ],
  },
  {
    id: "preferred_supports",
    sectionId: "supports-goals",
    prompt:
      "Which supports usually help the learner participate?",
    type: "multi",
    required: true,
    allowOther: true,
    options: [
      {
        label: "Short and simple instructions",
        value: "short_instructions",
      },
      {
        label: "Pictures or a visual schedule",
        value: "visual_schedule",
      },
      {
        label: "Demonstration before trying",
        value: "demonstration",
      },
      {
        label: "Additional response time",
        value: "processing_time",
      },
      {
        label: "Movement or sensory breaks",
        value: "sensory_breaks",
      },
      {
        label: "Quiet environment",
        value: "quiet_environment",
      },
      {
        label: "Familiar person nearby",
        value: "familiar_person",
      },
      {
        label: "Choice between activities",
        value: "activity_choice",
      },
    ],
  },
  {
    id: "comfortable_duration",
    sectionId: "supports-goals",
    prompt:
      "How long can the learner comfortably participate in one structured activity?",
    type: "single",
    required: true,
    options: [
      {
        label: "Less than 3 minutes",
        value: "under_three",
      },
      {
        label: "3–5 minutes",
        value: "three_five",
      },
      {
        label: "6–10 minutes",
        value: "six_ten",
      },
      {
        label: "11–15 minutes",
        value: "eleven_fifteen",
      },
      {
        label: "More than 15 minutes",
        value: "over_fifteen",
      },
      {
        label: "Depends greatly on the activity",
        value: "depends",
      },
    ],
  },
  {
    id: "attempts_before_break",
    sectionId: "supports-goals",
    prompt:
      "How many attempts are usually comfortable before the learner needs help, a change, or a break?",
    type: "single",
    required: true,
    options: [
      { label: "1 attempt", value: "1" },
      { label: "2 attempts", value: "2" },
      { label: "3 attempts", value: "3" },
      {
        label: "4–5 attempts",
        value: "4_5",
      },
      {
        label: "Depends on the activity",
        value: "depends",
      },
    ],
  },
  {
    id: "distress_signs",
    sectionId: "supports-goals",
    prompt:
      "What signs show that the learner is becoming tired, frustrated, or overwhelmed?",
    helper:
      "Include signs that should tell MOBI or the therapist to pause an activity.",
    type: "long_text",
    required: true,
  },
  {
    id: "motivators",
    sectionId: "supports-goals",
    prompt:
      "What activities, topics, objects, or responses motivate the learner?",
    helper: "Select all that apply.",
    type: "multi",
    required: true,
    allowOther: true,
    options: [
      { label: "Music or songs", value: "music" },
      {
        label: "Videos or animation",
        value: "videos",
      },
      { label: "Toys or objects", value: "toys" },
      {
        label: "Movement activities",
        value: "movement",
      },
      {
        label: "Praise or encouragement",
        value: "praise",
      },
      {
        label: "Tokens or visual rewards",
        value: "tokens",
      },
      {
        label: "Quiet acknowledgment",
        value: "quiet_praise",
      },
      {
        label: "Access to a preferred activity",
        value: "preferred_activity",
      },
    ],
  },
  {
    id: "feeding_concern",
    sectionId: "supports-goals",
    prompt:
      "Do you have concerns about eating, chewing, drinking, or swallowing?",
    type: "yes_no",
    required: true,
  },
  {
    id: "feeding_red_flags",
    sectionId: "supports-goals",
    prompt:
      "Which feeding or swallowing concerns have you observed?",
    type: "multi",
    required: true,
    allowOther: true,
    showIf: [
      {
        questionId: "feeding_concern",
        operator: "in",
        value: ["yes", "not_sure"],
      },
    ],
    options: [
      {
        label: "Very limited food variety",
        value: "limited_variety",
      },
      {
        label: "Difficulty chewing",
        value: "chewing",
      },
      {
        label: "Frequent gagging",
        value: "gagging",
      },
      {
        label: "Coughing while eating or drinking",
        value: "coughing",
      },
      {
        label: "Choking or breathing difficulty",
        value: "choking",
      },
      {
        label: "Wet or gurgly voice after swallowing",
        value: "wet_voice",
      },
      {
        label: "Difficulty gaining or maintaining weight",
        value: "weight_concern",
      },
      {
        label: "Meals take an unusually long time",
        value: "long_meals",
      },
    ],
  },
  {
    id: "family_goals",
    sectionId: "supports-goals",
    prompt:
      "Which skills are the family's highest priorities?",
    helper: "Select up to five.",
    type: "multi",
    required: true,
    allowOther: true,
    options: [
      {
        label: "Communicate basic needs",
        value: "basic_needs",
      },
      {
        label: "Request help",
        value: "request_help",
      },
      {
        label: "Communicate pain or discomfort",
        value: "communicate_pain",
      },
      {
        label: "Understand instructions",
        value: "understand_instructions",
      },
      {
        label: "Produce clearer speech",
        value: "speech_clarity",
      },
      {
        label: "Use more words, signs, or symbols",
        value: "more_language",
      },
      {
        label: "Combine words, signs, or symbols",
        value: "combine_language",
      },
      {
        label: "Initiate interaction",
        value: "initiate_interaction",
      },
      {
        label: "Take turns",
        value: "turn_taking",
      },
      {
        label: "Participate in shared play",
        value: "shared_play",
      },
      {
        label: "Maintain conversation",
        value: "conversation",
      },
      {
        label: "Express emotions and request breaks",
        value: "emotional_communication",
      },
    ],
  },
  {
    id: "avoid_topics",
    sectionId: "supports-goals",
    prompt:
      "Are there any sounds, images, topics, words, activities, or rewards that MOBI should avoid?",
    type: "long_text",
  },
  {
    id: "additional_information",
    sectionId: "supports-goals",
    prompt:
      "Is there anything else the clinical team should know before meeting the learner?",
    type: "long_text",
  },
];

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function FormField({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-[#3F3545]">
        {label}

        {required && (
          <span className="ml-1 text-[#B94B74]">*</span>
        )}
      </label>

      {children}

      {helper && (
        <p className="mt-1.5 break-words text-xs leading-5 text-[#746B78]">
          {helper}
        </p>
      )}
    </div>
  );
}

function InfoNotice({
  children,
  type = "information",
}: {
  children: ReactNode;
  type?: "information" | "warning";
}) {
  return (
    <div
      className={`flex min-w-0 gap-3 rounded-2xl border px-4 py-3 text-sm leading-6 ${
        type === "warning"
          ? "border-[#E7C49F] bg-[#FFF8EE] text-[#765434]"
          : "border-[#DCCCE3] bg-[#F8F3FA] text-[#5B4E61]"
      }`}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function calculateAge(birthDate: string) {
  if (!birthDate) return null;

  const today = new Date();
  const birth = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(birth.getTime()) || birth > today) {
    return null;
  }

  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference =
    today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function hasAnswer(value: AnswerValue | undefined) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function conditionMatches(
  condition: BranchCondition,
  answers: Record<string, AnswerValue>,
) {
  const answer = answers[condition.questionId];

  if (answer === undefined) {
    return false;
  }

  if (condition.operator === "equals") {
    return answer === condition.value;
  }

  if (condition.operator === "includes") {
    return (
      Array.isArray(answer) &&
      typeof condition.value === "string" &&
      answer.includes(condition.value)
    );
  }

  if (condition.operator === "in") {
    return (
      !Array.isArray(answer) &&
      Array.isArray(condition.value) &&
      condition.value.includes(answer)
    );
  }

  return false;
}

function isQuestionVisible(
  question: AssessmentQuestion,
  answers: Record<string, AnswerValue>,
) {
  if (!question.showIf || question.showIf.length === 0) {
    return true;
  }

  return question.showIf.every((condition) =>
    conditionMatches(condition, answers),
  );
}

function getQuestionOptions(question: AssessmentQuestion) {
  let options: SelectOption[] = [];

  if (question.type === "yes_no") {
    options = yesNoOptions;
  } else if (question.type === "frequency") {
    options = frequencyOptions;
  } else if (question.type === "support") {
    options = supportOptions;
  } else {
    options = question.options ?? [];
  }

  if (
    question.allowOther &&
    !options.some((option) => option.value === "other")
  ) {
    return [
      ...options,
      {
        label: "Other",
        value: "other",
      },
    ];
  }

  return options;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AddLearner = () => {
  const navigate = useNavigate();

  const photoInputRef = useRef<HTMLInputElement | null>(
    null,
  );

  const [currentStep, setCurrentStep] =
    useState<EnrollmentStep>("learner");

  const [
    assessmentSectionIndex,
    setAssessmentSectionIndex,
  ] = useState(0);

  const [form, setForm] =
    useState<EnrollmentForm>(initialForm);

  const [answers, setAnswers] = useState<
    Record<string, AnswerValue>
  >({});

  const [otherAnswers, setOtherAnswers] = useState<
    Record<string, string>
  >({});

  const [profilePhoto, setProfilePhoto] =
    useState<File | null>(null);

  const [
    profilePhotoPreview,
    setProfilePhotoPreview,
  ] = useState("");

  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [draftLoaded, setDraftLoaded] =
    useState(false);

  const currentStepIndex = enrollmentSteps.findIndex(
    (step) => step.id === currentStep,
  );

  const learnerAge = useMemo(
    () => calculateAge(form.learner.birthDate),
    [form.learner.birthDate],
  );

  const learnerFullName = [
    form.learner.firstName,
    form.learner.middleName,
    form.learner.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const visibleQuestions = useMemo(
    () =>
      assessmentQuestions.filter((question) =>
        isQuestionVisible(question, answers),
      ),
    [answers],
  );

  const currentAssessmentSection =
    assessmentSections[assessmentSectionIndex];

  const currentSectionQuestions = useMemo(
    () =>
      visibleQuestions.filter(
        (question) =>
          question.sectionId ===
          currentAssessmentSection.id,
      ),
    [visibleQuestions, currentAssessmentSection.id],
  );

  const answeredQuestionCount = useMemo(
    () =>
      visibleQuestions.filter((question) =>
        hasAnswer(answers[question.id]),
      ).length,
    [answers, visibleQuestions],
  );

  const assessmentProgress =
    visibleQuestions.length > 0
      ? Math.round(
          (answeredQuestionCount /
            visibleQuestions.length) *
            100,
        )
      : 0;

  /* =======================================================
     DRAFT LOADING
  ======================================================= */

  useEffect(() => {
    try {
      const storedDraft = localStorage.getItem(
        DRAFT_STORAGE_KEY,
      );

      if (storedDraft) {
        const parsedDraft = JSON.parse(storedDraft);

        if (parsedDraft.form) {
          setForm(parsedDraft.form);
        }

        if (parsedDraft.answers) {
          setAnswers(parsedDraft.answers);
        }

        if (parsedDraft.otherAnswers) {
          setOtherAnswers(parsedDraft.otherAnswers);
        }
      }
    } catch (error) {
      console.error(
        "Unable to load enrollment draft:",
        error,
      );
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  /* =======================================================
     AUTO SAVE
  ======================================================= */

  useEffect(() => {
    if (!draftLoaded) return;

    const timeout = window.setTimeout(() => {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          form,
          answers,
          otherAnswers,
          updatedAt: new Date().toISOString(),
        }),
      );
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [form, answers, otherAnswers, draftLoaded]);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  /* =======================================================
     UPDATE FUNCTIONS
  ======================================================= */

  const updateLearner = (
    field: keyof LearnerForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      learner: {
        ...previous.learner,
        [field]: value,
      },
    }));
  };

  const updateGuardian = (
    field: keyof GuardianForm,
    value: string | boolean,
  ) => {
    setForm((previous) => ({
      ...previous,
      guardian: {
        ...previous.guardian,
        [field]: value,
      },
    }));
  };

  const updateClinic = (
    field: keyof ClinicForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      clinic: {
        ...previous.clinic,
        [field]: value,
      },
    }));
  };

  const updateSingleAnswer = (
    questionId: string,
    value: string,
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));

    if (value !== "other") {
      setOtherAnswers((previous) => {
        const updatedAnswers = { ...previous };
        delete updatedAnswers[questionId];

        return updatedAnswers;
      });
    }

    setFormError("");
  };

  const toggleMultipleAnswer = (
    questionId: string,
    value: string,
  ) => {
    setAnswers((previous) => {
      const currentValue = previous[questionId];

      const selectedValues = Array.isArray(currentValue)
        ? currentValue
        : [];

      const isSelected =
        selectedValues.includes(value);

      return {
        ...previous,
        [questionId]: isSelected
          ? selectedValues.filter(
              (selected) => selected !== value,
            )
          : [...selectedValues, value],
      };
    });

    setFormError("");
  };

  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError(
        "Please choose a valid image file.",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError(
        "The learner photo must be 5 MB or smaller.",
      );
      return;
    }

    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview);
    }

    setProfilePhoto(file);
    setProfilePhotoPreview(
      URL.createObjectURL(file),
    );
    setFormError("");
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateLearnerStep = () => {
    if (
      !form.learner.firstName.trim() ||
      !form.learner.lastName.trim() ||
      !form.learner.birthDate ||
      !form.learner.primaryLanguage.trim()
    ) {
      setFormError(
        "Please complete the learner's first name, last name, birthday, and primary language.",
      );
      return false;
    }

    if (learnerAge === null) {
      setFormError(
        "Please enter a valid learner birthday.",
      );
      return false;
    }

    if (
      form.learner.diagnosisStatus === "yes" &&
      !form.learner.diagnosisDetails.trim()
    ) {
      setFormError(
        "Please enter the known diagnosis or assessment details.",
      );
      return false;
    }

    setFormError("");
    return true;
  };

  const validateGuardianStep = () => {
    if (
      !form.guardian.fullName.trim() ||
      !form.guardian.relationship ||
      !form.guardian.phoneNumber.trim() ||
      !form.guardian.email.trim()
    ) {
      setFormError(
        "Please complete the guardian's name, relationship, phone number, and email.",
      );
      return false;
    }

    if (
      !form.guardian.sameAddressAsLearner &&
      !form.guardian.homeAddress.trim()
    ) {
      setFormError(
        "Please enter the guardian's home address.",
      );
      return false;
    }

    if (!form.clinic.assignedTherapistId) {
      setFormError(
        "Please assign a therapist before continuing.",
      );
      return false;
    }

    if (
      form.clinic.assignedDoctorId === "other" &&
      !form.clinic.otherDoctorName.trim()
    ) {
      setFormError(
        "Please enter the doctor's name.",
      );
      return false;
    }

    if (!form.guardian.authorizedForUpdates) {
      setFormError(
        "Guardian authorization is required before enrollment.",
      );
      return false;
    }

    setFormError("");
    return true;
  };

  const validateAssessmentSection = () => {
    const missingQuestion =
      currentSectionQuestions.find(
        (question) =>
          question.required &&
          !hasAnswer(answers[question.id]),
      );

    if (missingQuestion) {
      setFormError(
        `Please answer: “${missingQuestion.prompt}”`,
      );

      window.setTimeout(() => {
        document
          .getElementById(
            `question-${missingQuestion.id}`,
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 50);

      return false;
    }

    const familyGoals = answers.family_goals;

    if (
      currentAssessmentSection.id ===
        "supports-goals" &&
      Array.isArray(familyGoals) &&
      familyGoals.length > 5
    ) {
      setFormError(
        "Please select no more than five family priorities.",
      );
      return false;
    }

    setFormError("");
    return true;
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const moveToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    if (currentStep === "learner") {
      if (!validateLearnerStep()) return;

      setCurrentStep("guardian");
      moveToTop();
      return;
    }

    if (currentStep === "guardian") {
      if (!validateGuardianStep()) return;

      setCurrentStep("assessment");
      moveToTop();
      return;
    }

    if (currentStep === "assessment") {
      if (!validateAssessmentSection()) return;

      if (
        assessmentSectionIndex <
        assessmentSections.length - 1
      ) {
        setAssessmentSectionIndex(
          (previous) => previous + 1,
        );
      } else {
        setCurrentStep("review");
      }

      moveToTop();
    }
  };

  const handleBack = () => {
    setFormError("");

    if (currentStep === "guardian") {
      setCurrentStep("learner");
    } else if (currentStep === "assessment") {
      if (assessmentSectionIndex > 0) {
        setAssessmentSectionIndex(
          (previous) => previous - 1,
        );
      } else {
        setCurrentStep("guardian");
      }
    } else if (currentStep === "review") {
      setCurrentStep("assessment");
      setAssessmentSectionIndex(
        assessmentSections.length - 1,
      );
    }

    moveToTop();
  };

  const handleStepClick = (
    step: EnrollmentStep,
  ) => {
    const selectedIndex = enrollmentSteps.findIndex(
      (item) => item.id === step,
    );

    if (selectedIndex >= currentStepIndex) {
      return;
    }

    setFormError("");
    setCurrentStep(step);
    moveToTop();
  };

  const handleSaveDraft = () => {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        form,
        answers,
        otherAnswers,
        updatedAt: new Date().toISOString(),
      }),
    );

    setStatusMessage(
      "Enrollment draft saved successfully.",
    );

    window.setTimeout(() => {
      setStatusMessage("");
    }, 2500);
  };

  /* =======================================================
     CLINICAL FLAGS
  ======================================================= */

  const clinicalFlags = useMemo<ClinicalFlag[]>(
    () => {
      const flags: ClinicalFlag[] = [];

      if (
        answers.hearing_test === "no" ||
        answers.hearing_test === "not_sure"
      ) {
        flags.push({
          code: "HEARING_STATUS_REVIEW",
          severity: "review",
          title: "Hearing status requires review",
          description:
            "A hearing assessment or confirmation of hearing status may be needed before the communication profile is finalized.",
        });
      }

      if (
        answers.hearing_concern === "yes" ||
        answers.hearing_concern === "not_sure"
      ) {
        flags.push({
          code: "CURRENT_HEARING_CONCERN",
          severity: "review",
          title: "Current hearing concern",
          description:
            "The caregiver reported a possible hearing or sound-response concern.",
        });
      }

      if (answers.skill_loss === "yes") {
        flags.push({
          code: "REPORTED_SKILL_LOSS",
          severity: "priority",
          title:
            "Reported loss of previously used skills",
          description:
            "The clinical team should review the reported loss of communication, play, or social skills.",
        });
      }

      if (
        answers.communicate_pain ===
        "not_observed"
      ) {
        flags.push({
          code: "PAIN_COMMUNICATION_PRIORITY",
          severity: "priority",
          title:
            "Functional pain communication priority",
          description:
            "The learner may need an immediate functional method for communicating pain or discomfort.",
        });
      }

      const feedingFlags = Array.isArray(
        answers.feeding_red_flags,
      )
        ? answers.feeding_red_flags
        : [];

      if (
        feedingFlags.includes("choking") ||
        feedingFlags.includes("wet_voice") ||
        feedingFlags.includes("weight_concern")
      ) {
        flags.push({
          code: "FEEDING_SWALLOWING_REVIEW",
          severity: "priority",
          title: "Feeding or swallowing review",
          description:
            "The caregiver selected a response that should be reviewed by an appropriate clinician.",
        });
      } else if (
        answers.feeding_concern === "yes"
      ) {
        flags.push({
          code: "FEEDING_CONCERN",
          severity: "review",
          title: "Reported feeding concern",
          description:
            "The caregiver reported a concern related to eating, chewing, drinking, or swallowing.",
        });
      }

      if (
        answers.aac_evaluation_interest === "yes"
      ) {
        flags.push({
          code: "AAC_EVALUATION_REQUESTED",
          severity: "information",
          title: "AAC evaluation requested",
          description:
            "The caregiver would like the clinic to consider additional communication supports.",
        });
      }

      return flags;
    },
    [answers],
  );

  /* =======================================================
     SUBMISSION
  ======================================================= */

  const handleSubmitEnrollment = async () => {
    setIsSubmitting(true);
    setFormError("");

    const selectedDoctor = doctorList.find(
      (doctor) =>
        doctor.id ===
        form.clinic.assignedDoctorId,
    );

    const selectedTherapist = therapistList.find(
      (therapist) =>
        therapist.id ===
        form.clinic.assignedTherapistId,
    );

    const normalizedAnswers =
      visibleQuestions.map((question) => ({
        questionId: question.id,
        sectionId: question.sectionId,
        value: answers[question.id] ?? null,
        otherValue:
          otherAnswers[question.id] || null,
      }));

    const enrollmentPayload = {
      learner: {
        ...form.learner,
        calculatedAge: learnerAge,
      },

      guardian: {
        ...form.guardian,
        homeAddress:
          form.guardian.sameAddressAsLearner
            ? form.learner.homeAddress
            : form.guardian.homeAddress,
      },

      clinic: {
        ...form.clinic,

        assignedDoctorName:
          form.clinic.assignedDoctorId ===
          "other"
            ? form.clinic.otherDoctorName
            : selectedDoctor?.name ?? null,

        assignedTherapistName:
          selectedTherapist?.name ?? null,
      },

      assessment: {
        templateCode:
          "MOBI_PARENT_COMMUNICATION_INTAKE",
        templateVersion: 1,
        status:
          "submitted_for_clinical_review",
        respondentType: "parent_or_guardian",
        completedAt: new Date().toISOString(),
        answers: normalizedAnswers,
        clinicalFlags,
      },

      enrollmentStatus:
        "pending_clinical_review",
    };

    try {
      const requestBody = new FormData();

      requestBody.append(
        "payload",
        JSON.stringify(enrollmentPayload),
      );

      if (profilePhoto) {
        requestBody.append(
          "profile_photo",
          profilePhoto,
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/learners/enroll`,
        {
          method: "POST",
          body: requestBody,
        },
      );

      const result = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "The learner could not be enrolled.",
        );
      }

      localStorage.removeItem(
        DRAFT_STORAGE_KEY,
      );

      setStatusMessage(
        "Learner enrolled successfully.",
      );

      window.setTimeout(() => {
        navigate("/center/dashboard");
      }, 700);
    } catch (error) {
      console.error(
        "Enrollment submission failed:",
        error,
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "The learner could not be enrolled. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================================================
     QUESTION RENDERER
  ======================================================= */

  const renderAssessmentQuestion = (
    question: AssessmentQuestion,
  ) => {
    const answer = answers[question.id];
    const options = getQuestionOptions(question);

    if (
      question.type === "short_text" ||
      question.type === "long_text"
    ) {
      return (
        <div
          id={`question-${question.id}`}
          key={question.id}
          className="min-w-0 overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 sm:rounded-[22px] sm:p-6"
        >
          <div className="mb-4 min-w-0">
            <p className="break-words font-semibold leading-6 text-[#352D39]">
              {question.prompt}

              {question.required && (
                <span className="ml-1 text-[#B94B74]">
                  *
                </span>
              )}
            </p>

            {question.helper && (
              <p className="mt-1 break-words text-sm leading-6 text-[#766D7A]">
                {question.helper}
              </p>
            )}
          </div>

          {question.type === "long_text" ? (
            <textarea
              rows={4}
              value={
                typeof answer === "string"
                  ? answer
                  : ""
              }
              onChange={(event) =>
                updateSingleAnswer(
                  question.id,
                  event.target.value,
                )
              }
              placeholder="Enter details..."
              className={`${inputClassName} resize-y`}
            />
          ) : (
            <input
              type="text"
              value={
                typeof answer === "string"
                  ? answer
                  : ""
              }
              onChange={(event) =>
                updateSingleAnswer(
                  question.id,
                  event.target.value,
                )
              }
              placeholder="Enter answer..."
              className={inputClassName}
            />
          )}
        </div>
      );
    }

    const isMultiple =
      question.type === "multi";

    const selectedValues = Array.isArray(
      answer,
    )
      ? answer
      : [];

    const otherSelected = isMultiple
      ? selectedValues.includes("other")
      : answer === "other";

    return (
      <div
        id={`question-${question.id}`}
        key={question.id}
        className="min-w-0 overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 sm:rounded-[22px] sm:p-6"
      >
        <div className="mb-4 min-w-0">
          <p className="break-words font-semibold leading-6 text-[#352D39]">
            {question.prompt}

            {question.required && (
              <span className="ml-1 text-[#B94B74]">
                *
              </span>
            )}
          </p>

          {question.helper && (
            <p className="mt-1 break-words text-sm leading-6 text-[#766D7A]">
              {question.helper}
            </p>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
          {options.map((option) => {
            const isSelected = isMultiple
              ? selectedValues.includes(
                  option.value,
                )
              : answer === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (isMultiple) {
                    if (
                      question.id ===
                        "family_goals" &&
                      !isSelected &&
                      selectedValues.length >= 5
                    ) {
                      setFormError(
                        "Please select no more than five family priorities.",
                      );
                      return;
                    }

                    toggleMultipleAnswer(
                      question.id,
                      option.value,
                    );
                  } else {
                    updateSingleAnswer(
                      question.id,
                      option.value,
                    );
                  }
                }}
                className={`flex min-h-[50px] min-w-0 items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition sm:rounded-2xl sm:px-4 ${
                  isSelected
                    ? "border-[#965DEB] bg-[#F3EAFC] text-[#52316F] shadow-sm"
                    : "border-[#E1D7E5] bg-[#FCFAFD] text-[#4A424D] hover:border-[#C9AED7] hover:bg-[#F8F3FA]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border ${
                    isMultiple
                      ? "rounded-md"
                      : "rounded-full"
                  } ${
                    isSelected
                      ? "border-[#965DEB] bg-[#965DEB]"
                      : "border-[#CFC4D3] bg-white"
                  }`}
                >
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-white" />
                  )}
                </span>

                <span className="min-w-0 break-words leading-5">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {otherSelected && (
          <input
            type="text"
            value={
              otherAnswers[question.id] ?? ""
            }
            onChange={(event) =>
              setOtherAnswers((previous) => ({
                ...previous,
                [question.id]:
                  event.target.value,
              }))
            }
            placeholder="Please specify..."
            className={`${inputClassName} mt-3`}
          />
        )}
      </div>
    );
  };

  /* =======================================================
     LEARNER STEP
  ======================================================= */

  const renderLearnerStep = () => (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[26px] sm:p-7">
      <div className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="relative mx-auto h-24 w-24 shrink-0 sm:mx-0 sm:h-32 sm:w-32 lg:h-36 lg:w-36">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] border border-[#E0D2E5] bg-[#F6EFF8] sm:rounded-[26px]">
            {profilePhotoPreview ? (
              <img
                src={profilePhotoPreview}
                alt="Learner preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-12 w-12 text-[#C8AACB] sm:h-16 sm:w-16" />
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              photoInputRef.current?.click()
            }
            className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#E0D2E5] bg-white text-[#6E5579] shadow-md transition hover:bg-[#F5EFF8]"
            aria-label="Upload learner photo"
          >
            <ImagePlus className="h-5 w-5" />
          </button>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoChange}
          />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs sm:tracking-[0.18em]">
            Learner profile
          </p>

          <h2 className="mt-2 break-words text-xl font-semibold text-[#352D39] sm:text-2xl lg:text-3xl">
            {learnerFullName || "New learner"}
          </h2>

          <p className="mt-2 text-sm text-[#746B78]">
            {learnerAge !== null
              ? `${learnerAge} years old`
              : "Birthday has not been entered"}
          </p>

          <p className="mt-3 text-xs leading-5 text-[#8A818E]">
            Photo is optional. JPG, PNG, or WEBP
            up to 5 MB.
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        <FormField label="First name" required>
          <input
            value={form.learner.firstName}
            onChange={(event) =>
              updateLearner(
                "firstName",
                event.target.value,
              )
            }
            placeholder="First name"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Middle name">
          <input
            value={form.learner.middleName}
            onChange={(event) =>
              updateLearner(
                "middleName",
                event.target.value,
              )
            }
            placeholder="Middle name"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Last name" required>
          <input
            value={form.learner.lastName}
            onChange={(event) =>
              updateLearner(
                "lastName",
                event.target.value,
              )
            }
            placeholder="Last name"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Preferred name or nickname">
          <input
            value={form.learner.nickname}
            onChange={(event) =>
              updateLearner(
                "nickname",
                event.target.value,
              )
            }
            placeholder="Nickname"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Birthday" required>
          <input
            type="date"
            value={form.learner.birthDate}
            max={getTodayInputValue()}
            onChange={(event) =>
              updateLearner(
                "birthDate",
                event.target.value,
              )
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Sex at birth">
          <select
            value={form.learner.sexAtBirth}
            onChange={(event) =>
              updateLearner(
                "sexAtBirth",
                event.target.value,
              )
            }
            className={inputClassName}
          >
            <option value="">
              Select an option
            </option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="intersex">
              Intersex
            </option>
            <option value="not_disclosed">
              Prefer not to disclose
            </option>
          </select>
        </FormField>

        <FormField label="Primary language" required>
          <input
            value={form.learner.primaryLanguage}
            onChange={(event) =>
              updateLearner(
                "primaryLanguage",
                event.target.value,
              )
            }
            placeholder="Example: Cebuano"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Other languages used">
          <input
            value={form.learner.otherLanguages}
            onChange={(event) =>
              updateLearner(
                "otherLanguages",
                event.target.value,
              )
            }
            placeholder="Example: Filipino, English"
            className={inputClassName}
          />
        </FormField>

        <FormField label="School or learning center">
          <input
            value={form.learner.schoolName}
            onChange={(event) =>
              updateLearner(
                "schoolName",
                event.target.value,
              )
            }
            placeholder="School name"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Grade or learning level">
          <input
            value={form.learner.gradeLevel}
            onChange={(event) =>
              updateLearner(
                "gradeLevel",
                event.target.value,
              )
            }
            placeholder="Example: Kindergarten"
            className={inputClassName}
          />
        </FormField>

        <FormField label="Known diagnosis or assessment">
          <select
            value={
              form.learner.diagnosisStatus
            }
            onChange={(event) =>
              updateLearner(
                "diagnosisStatus",
                event.target.value,
              )
            }
            className={inputClassName}
          >
            <option value="">
              Select an option
            </option>
            <option value="yes">
              Diagnosis or assessment available
            </option>
            <option value="pending">
              Evaluation is in progress
            </option>
            <option value="no">
              No previous assessment
            </option>
            <option value="not_sure">
              Not sure
            </option>
          </select>
        </FormField>

        {form.learner.diagnosisStatus ===
          "yes" && (
          <FormField
            label="Diagnosis or assessment details"
            required
          >
            <input
              value={
                form.learner.diagnosisDetails
              }
              onChange={(event) =>
                updateLearner(
                  "diagnosisDetails",
                  event.target.value,
                )
              }
              placeholder="Example: Autism Spectrum Disorder, diagnosed 2025"
              className={inputClassName}
            />
          </FormField>
        )}
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <FormField label="Learner home address">
          <textarea
            rows={3}
            value={form.learner.homeAddress}
            onChange={(event) =>
              updateLearner(
                "homeAddress",
                event.target.value,
              )
            }
            placeholder="Complete home address"
            className={`${inputClassName} resize-y`}
          />
        </FormField>

        <FormField
          label="Learner background"
          helper="Add relevant interests, strengths, routines, or information that may help the clinical team."
        >
          <textarea
            rows={3}
            value={form.learner.learnerBio}
            onChange={(event) =>
              updateLearner(
                "learnerBio",
                event.target.value,
              )
            }
            placeholder="Brief learner background..."
            className={`${inputClassName} resize-y`}
          />
        </FormField>
      </div>
    </section>
  );

  /* =======================================================
     GUARDIAN STEP
  ======================================================= */

  const renderGuardianStep = () => (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[26px] sm:p-7">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs sm:tracking-[0.18em]">
            Parent or guardian
          </p>

          <h2 className="mt-2 text-lg font-semibold text-[#352D39] sm:text-xl">
            Contact information
          </h2>
        </div>

        <div className="space-y-5">
          <FormField label="Full name" required>
            <input
              value={form.guardian.fullName}
              onChange={(event) =>
                updateGuardian(
                  "fullName",
                  event.target.value,
                )
              }
              placeholder="Guardian full name"
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Relationship to learner"
            required
          >
            <select
              value={
                form.guardian.relationship
              }
              onChange={(event) =>
                updateGuardian(
                  "relationship",
                  event.target.value,
                )
              }
              className={inputClassName}
            >
              <option value="">
                Select relationship
              </option>
              <option value="mother">
                Mother
              </option>
              <option value="father">
                Father
              </option>
              <option value="grandparent">
                Grandparent
              </option>
              <option value="adult_sibling">
                Adult sibling
              </option>
              <option value="legal_guardian">
                Legal guardian
              </option>
              <option value="other">
                Other caregiver
              </option>
            </select>
          </FormField>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <FormField
              label="Phone number"
              required
            >
              <input
                type="tel"
                value={
                  form.guardian.phoneNumber
                }
                onChange={(event) =>
                  updateGuardian(
                    "phoneNumber",
                    event.target.value,
                  )
                }
                placeholder="+63"
                className={inputClassName}
              />
            </FormField>

            <FormField
              label="Email address"
              required
            >
              <input
                type="email"
                value={form.guardian.email}
                onChange={(event) =>
                  updateGuardian(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="guardian@email.com"
                className={inputClassName}
              />
            </FormField>
          </div>

          <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-[#E3D6E8] bg-[#FCFAFD] p-4">
            <input
              type="checkbox"
              checked={
                form.guardian
                  .sameAddressAsLearner
              }
              onChange={(event) =>
                updateGuardian(
                  "sameAddressAsLearner",
                  event.target.checked,
                )
              }
              className="mt-1 h-4 w-4 shrink-0 accent-[#965DEB]"
            />

            <span className="min-w-0">
              <span className="block break-words text-sm font-semibold text-[#463B4B]">
                Same address as the learner
              </span>

              <span className="mt-1 block break-words text-xs leading-5 text-[#756C79]">
                Uncheck this when the guardian has
                a different home address.
              </span>
            </span>
          </label>

          {!form.guardian
            .sameAddressAsLearner && (
            <FormField
              label="Guardian home address"
              required
            >
              <textarea
                rows={3}
                value={
                  form.guardian.homeAddress
                }
                onChange={(event) =>
                  updateGuardian(
                    "homeAddress",
                    event.target.value,
                  )
                }
                placeholder="Complete home address"
                className={`${inputClassName} resize-y`}
              />
            </FormField>
          )}

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <FormField label="Emergency contact name">
              <input
                value={
                  form.guardian
                    .emergencyContactName
                }
                onChange={(event) =>
                  updateGuardian(
                    "emergencyContactName",
                    event.target.value,
                  )
                }
                placeholder="Emergency contact"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Emergency contact number">
              <input
                type="tel"
                value={
                  form.guardian
                    .emergencyContactPhone
                }
                onChange={(event) =>
                  updateGuardian(
                    "emergencyContactPhone",
                    event.target.value,
                  )
                }
                placeholder="+63"
                className={inputClassName}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[26px] sm:p-7">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs sm:tracking-[0.18em]">
            Clinic assignment
          </p>

          <h2 className="mt-2 text-lg font-semibold text-[#352D39] sm:text-xl">
            Enrollment and clinical team
          </h2>
        </div>

        <div className="space-y-5">
          <FormField
            label="Assigned therapist"
            required
          >
            <select
              value={
                form.clinic
                  .assignedTherapistId
              }
              onChange={(event) =>
                updateClinic(
                  "assignedTherapistId",
                  event.target.value,
                )
              }
              className={inputClassName}
            >
              <option value="">
                Select therapist
              </option>

              {therapistList.map(
                (therapist) => (
                  <option
                    key={therapist.id}
                    value={therapist.id}
                  >
                    {therapist.name}
                  </option>
                ),
              )}
            </select>
          </FormField>

          <FormField label="Doctor">
            <select
              value={
                form.clinic.assignedDoctorId
              }
              onChange={(event) =>
                updateClinic(
                  "assignedDoctorId",
                  event.target.value,
                )
              }
              className={inputClassName}
            >
              <option value="">
                No doctor assigned yet
              </option>

              {doctorList.map((doctor) => (
                <option
                  key={doctor.id}
                  value={doctor.id}
                >
                  {doctor.name}
                </option>
              ))}
            </select>
          </FormField>

          {form.clinic.assignedDoctorId ===
            "other" && (
            <FormField
              label="Doctor's name"
              required
            >
              <input
                value={
                  form.clinic.otherDoctorName
                }
                onChange={(event) =>
                  updateClinic(
                    "otherDoctorName",
                    event.target.value,
                  )
                }
                placeholder="Enter doctor's full name"
                className={inputClassName}
              />
            </FormField>
          )}

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <FormField label="Enrollment date">
              <input
                type="date"
                value={
                  form.clinic.enrollmentDate
                }
                onChange={(event) =>
                  updateClinic(
                    "enrollmentDate",
                    event.target.value,
                  )
                }
                className={inputClassName}
              />
            </FormField>

            <FormField label="Referral source">
              <select
                value={
                  form.clinic.referralSource
                }
                onChange={(event) =>
                  updateClinic(
                    "referralSource",
                    event.target.value,
                  )
                }
                className={inputClassName}
              >
                <option value="">
                  Select source
                </option>
                <option value="parent">
                  Parent or guardian
                </option>
                <option value="doctor">
                  Doctor
                </option>
                <option value="school">
                  School
                </option>
                <option value="therapist">
                  Therapist
                </option>
                <option value="hospital">
                  Hospital
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </FormField>
          </div>

          <FormField label="Private clinic notes">
            <textarea
              rows={4}
              value={form.clinic.clinicNotes}
              onChange={(event) =>
                updateClinic(
                  "clinicNotes",
                  event.target.value,
                )
              }
              placeholder="Internal clinic notes..."
              className={`${inputClassName} resize-y`}
            />
          </FormField>

          <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-[#DCCCE3] bg-[#F8F3FA] p-4">
            <input
              type="checkbox"
              checked={
                form.guardian
                  .authorizedForUpdates
              }
              onChange={(event) =>
                updateGuardian(
                  "authorizedForUpdates",
                  event.target.checked,
                )
              }
              className="mt-1 h-4 w-4 shrink-0 accent-[#965DEB]"
            />

            <span className="min-w-0">
              <span className="block break-words text-sm font-semibold text-[#463B4B]">
                Guardian authorizes clinic
                communication
              </span>

              <span className="mt-1 block break-words text-xs leading-5 text-[#756C79]">
                The clinic may send enrollment,
                appointment, assessment, and
                progress-related updates.
              </span>
            </span>
          </label>
        </div>
      </section>
    </div>
  );

  /* =======================================================
     ASSESSMENT STEP
  ======================================================= */

  const renderAssessmentStep = () => (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="min-w-0 rounded-[22px] border border-[#E3D6E8] bg-white p-3 shadow-sm sm:p-4 xl:sticky xl:top-5 xl:h-fit">
        <div className="mb-4 px-1 sm:px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs sm:tracking-[0.18em]">
            Assessment progress
          </p>

          <div className="mt-3 flex items-end justify-between gap-3">
            <span className="text-2xl font-semibold text-[#48384F]">
              {assessmentProgress}%
            </span>

            <span className="text-xs text-[#807684]">
              {answeredQuestionCount}/
              {visibleQuestions.length}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEE5F1]">
            <div
              className="h-full rounded-full bg-[#965DEB] transition-all duration-300"
              style={{
                width: `${assessmentProgress}%`,
              }}
            />
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:block xl:space-y-1">
          {assessmentSections.map(
            (section, index) => {
              const isCurrent =
                index ===
                assessmentSectionIndex;

              const sectionQuestions =
                visibleQuestions.filter(
                  (question) =>
                    question.sectionId ===
                    section.id,
                );

              const completedCount =
                sectionQuestions.filter(
                  (question) =>
                    hasAnswer(
                      answers[question.id],
                    ),
                ).length;

              const isComplete =
                sectionQuestions.length > 0 &&
                completedCount ===
                  sectionQuestions.length;

              return (
                <button
                  type="button"
                  key={section.id}
                  onClick={() => {
                    if (
                      index <=
                      assessmentSectionIndex
                    ) {
                      setAssessmentSectionIndex(
                        index,
                      );
                      setFormError("");
                    }
                  }}
                  className={`min-w-0 rounded-xl px-2 py-2.5 text-left transition sm:rounded-2xl sm:px-3 sm:py-3 xl:w-full ${
                    isCurrent
                      ? "bg-[#F1E7F8] text-[#593878]"
                      : index <
                          assessmentSectionIndex
                        ? "text-[#574E5B] hover:bg-[#F8F4FA]"
                        : "cursor-default text-[#A29AA5]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        isCurrent
                          ? "border-[#965DEB] bg-[#965DEB] text-white"
                          : isComplete
                            ? "border-[#B79AC5] bg-[#F4ECF8] text-[#684A76]"
                            : "border-[#DDD3E1] bg-white"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block break-words text-xs font-semibold leading-4 sm:text-sm">
                        {section.title}
                      </span>

                      <span className="mt-0.5 hidden text-[11px] opacity-70 sm:block">
                        {completedCount}/
                        {sectionQuestions.length}{" "}
                        answered
                      </span>
                    </span>
                  </div>
                </button>
              );
            },
          )}
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-4 min-w-0 rounded-[22px] border border-[#E3D6E8] bg-white p-4 shadow-sm sm:mb-5 sm:rounded-[24px] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs sm:tracking-[0.18em]">
            Section {assessmentSectionIndex + 1} of{" "}
            {assessmentSections.length}
          </p>

          <h2 className="mt-2 break-words text-lg font-semibold text-[#352D39] sm:text-2xl">
            {currentAssessmentSection.title}
          </h2>

          <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-[#716875]">
            {
              currentAssessmentSection.description
            }
          </p>
        </div>

        {assessmentSectionIndex === 0 && (
          <div className="mb-4 sm:mb-5">
            <InfoNotice>
              This caregiver intake helps MOBI
              prepare a preliminary communication and
              social-readiness profile. It does not
              replace direct assessment or clinical
              review by the therapist or
              speech-language pathologist.
            </InfoNotice>
          </div>
        )}

        <div className="min-w-0 space-y-4">
          {currentSectionQuestions.map(
            renderAssessmentQuestion,
          )}
        </div>
      </section>
    </div>
  );

  /* =======================================================
     REVIEW STEP
  ======================================================= */

  const renderReviewStep = () => {
    const selectedDoctor = doctorList.find(
      (doctor) =>
        doctor.id ===
        form.clinic.assignedDoctorId,
    );

    const selectedTherapist =
      therapistList.find(
        (therapist) =>
          therapist.id ===
          form.clinic.assignedTherapistId,
      );

    return (
      <div className="min-w-0 space-y-4 sm:space-y-6">
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-5 shadow-sm sm:rounded-[24px]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#3F3545]">
                Learner
              </h2>

              <button
                type="button"
                onClick={() =>
                  setCurrentStep("learner")
                }
                className="shrink-0 text-sm font-semibold text-[#76508C] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F3EAF6]">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-8 w-8 text-[#B895BF]" />
                )}
              </div>

              <div className="min-w-0">
                <p className="break-words font-semibold text-[#352D39]">
                  {learnerFullName}
                </p>

                <p className="mt-1 text-sm text-[#766D7A]">
                  {learnerAge !== null
                    ? `${learnerAge} years old`
                    : "Age unavailable"}
                </p>

                <p className="mt-1 break-words text-sm text-[#766D7A]">
                  {
                    form.learner
                      .primaryLanguage
                  }
                </p>
              </div>
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-5 shadow-sm sm:rounded-[24px]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#3F3545]">
                Guardian
              </h2>

              <button
                type="button"
                onClick={() =>
                  setCurrentStep("guardian")
                }
                className="shrink-0 text-sm font-semibold text-[#76508C] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 min-w-0 space-y-2 text-sm">
              <p className="break-words font-semibold text-[#352D39]">
                {form.guardian.fullName}
              </p>

              <p className="capitalize text-[#766D7A]">
                {form.guardian.relationship.replace(
                  "_",
                  " ",
                )}
              </p>

              <p className="break-words text-[#766D7A]">
                {form.guardian.phoneNumber}
              </p>

              <p className="break-all text-[#766D7A]">
                {form.guardian.email}
              </p>
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-5 shadow-sm sm:rounded-[24px] md:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#3F3545]">
                Clinical team
              </h2>

              <button
                type="button"
                onClick={() =>
                  setCurrentStep("guardian")
                }
                className="shrink-0 text-sm font-semibold text-[#76508C] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 min-w-0 space-y-3 text-sm">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-[#8A818E]">
                  Therapist
                </p>

                <p className="mt-1 break-words font-medium text-[#403744]">
                  {selectedTherapist?.name ??
                    "Not assigned"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-[#8A818E]">
                  Doctor
                </p>

                <p className="mt-1 break-words font-medium text-[#403744]">
                  {form.clinic
                    .assignedDoctorId ===
                  "other"
                    ? form.clinic
                        .otherDoctorName
                    : selectedDoctor?.name ??
                      "Not assigned"}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-7">
          <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs sm:tracking-[0.18em]">
                Caregiver intake
              </p>

              <h2 className="mt-2 break-words text-lg font-semibold text-[#352D39] sm:text-xl">
                Assessment completion
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentStep("assessment");
                setAssessmentSectionIndex(0);
              }}
              className="text-left text-sm font-semibold text-[#76508C] hover:underline sm:text-right"
            >
              Review responses
            </button>
          </div>

          <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-2xl bg-[#F7F2F9] p-4">
              <p className="text-2xl font-semibold text-[#523B5C]">
                {assessmentProgress}%
              </p>

              <p className="mt-1 text-sm text-[#746B78]">
                Completed
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F2F9] p-4">
              <p className="text-2xl font-semibold text-[#523B5C]">
                {answeredQuestionCount}
              </p>

              <p className="mt-1 text-sm text-[#746B78]">
                Questions answered
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F2F9] p-4">
              <p className="text-2xl font-semibold text-[#523B5C]">
                {clinicalFlags.length}
              </p>

              <p className="mt-1 text-sm text-[#746B78]">
                Clinical review items
              </p>
            </div>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-7">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-5 w-5 shrink-0 text-[#76508C]" />

            <h2 className="font-semibold text-[#3F3545]">
              Clinical review items
            </h2>
          </div>

          {clinicalFlags.length === 0 ? (
            <div className="mt-5 flex min-w-0 items-start gap-3 rounded-2xl border border-[#CFE2D2] bg-[#F3FAF4] p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4D815A]" />

              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-[#3F6948]">
                  No automatic priority flags
                  detected
                </p>

                <p className="mt-1 break-words text-sm leading-6 text-[#5E7363]">
                  The therapist must still review
                  the caregiver responses and learner
                  baseline results.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {clinicalFlags.map((flag) => (
                <div
                  key={flag.code}
                  className={`min-w-0 rounded-2xl border p-4 ${
                    flag.severity === "priority"
                      ? "border-[#E8B9B9] bg-[#FFF4F4]"
                      : flag.severity === "review"
                        ? "border-[#E7CDAA] bg-[#FFF9F0]"
                        : "border-[#D8CBE1] bg-[#F8F3FA]"
                  }`}
                >
                  <p className="break-words text-sm font-semibold text-[#493E4D]">
                    {flag.title}
                  </p>

                  <p className="mt-1 break-words text-sm leading-6 text-[#706674]">
                    {flag.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <InfoNotice>
          Selecting <strong>Enroll learner</strong>{" "}
          creates the learner profile and submits the
          caregiver intake for therapist review. MOBI
          should not assign the final clinical level
          until the therapist reviews the intake and
          learner baseline session.
        </InfoNotice>
      </div>
    );
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#E4C9E5]/75 p-2 inter sm:min-h-full sm:rounded-[30px] sm:p-4 md:p-5 lg:p-7">
          {/* HEADER */}

          <header className="mb-4 min-w-0 rounded-2xl border border-white/60 bg-white/55 p-4 backdrop-blur-sm sm:mb-5 sm:rounded-[24px] sm:px-6">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                {!sidebarOpen && (
                  <button
                    type="button"
                    onClick={() =>
                      setSidebarOpen(true)
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm"
                    aria-label="Open sidebar"
                  >
                    ☰
                  </button>
                )}

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#826D8A] sm:text-xs sm:tracking-[0.2em]">
                    Learner enrollment
                  </p>

                  <h1 className="mt-1 break-words text-lg font-semibold text-[#352D39] sm:text-xl md:text-2xl">
                    Enroll a new learner
                  </h1>

                  <p className="mt-1 max-w-3xl break-words text-xs leading-5 text-[#706675] sm:text-sm sm:leading-6">
                    Create the learner profile and
                    complete the initial communication
                    and social-readiness intake.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D8C6DF] bg-white px-4 py-2.5 text-sm font-semibold text-[#604A69] shadow-sm transition hover:bg-[#F9F5FA] sm:w-auto"
              >
                <Save className="h-4 w-4" />
                Save draft
              </button>
            </div>
          </header>

          {/* RESPONSIVE STEPPER */}

          <div className="mb-4 min-w-0 rounded-2xl border border-white/60 bg-white/55 p-2 backdrop-blur-sm sm:mb-5 sm:rounded-[24px] sm:p-3">
            <div className="grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-4">
              {enrollmentSteps.map(
                (step, index) => {
                  const StepIcon = step.icon;

                  const isCurrent =
                    step.id === currentStep;

                  const isCompleted =
                    index < currentStepIndex;

                  return (
                    <button
                      type="button"
                      key={step.id}
                      onClick={() =>
                        handleStepClick(step.id)
                      }
                      className={`min-w-0 rounded-xl p-2.5 text-left transition sm:rounded-2xl sm:px-4 sm:py-3 ${
                        isCurrent
                          ? "bg-white text-[#523765] shadow-sm"
                          : isCompleted
                            ? "text-[#625568] hover:bg-white/60"
                            : "cursor-default text-[#918794]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 ${
                            isCurrent
                              ? "bg-[#965DEB] text-white"
                              : isCompleted
                                ? "bg-[#EADDF0] text-[#6C4F78]"
                                : "bg-white/60"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <StepIcon className="h-4 w-4" />
                          )}
                        </span>

                        <span className="min-w-0">
                          <span className="block break-words text-xs font-semibold leading-4 sm:text-sm">
                            {step.label}
                          </span>

                          <span className="mt-0.5 hidden break-words text-[11px] leading-4 opacity-70 sm:block">
                            {step.description}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* ERROR */}

          {formError && (
            <div className="mb-4 flex min-w-0 items-start gap-3 rounded-2xl border border-[#E2B5C2] bg-[#FFF5F7] px-4 py-3 text-sm text-[#7A3F50] shadow-sm sm:mb-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <p className="min-w-0 break-words">
                {formError}
              </p>
            </div>
          )}

          {/* STATUS */}

          {statusMessage && (
            <div className="mb-4 flex min-w-0 items-center gap-3 rounded-2xl border border-[#CDE0D0] bg-[#F3FAF4] px-4 py-3 text-sm text-[#42684A] shadow-sm sm:mb-5">
              <CheckCircle2 className="h-5 w-5 shrink-0" />

              <p className="min-w-0 break-words">
                {statusMessage}
              </p>
            </div>
          )}

          {/* CONTENT */}

          <main className="min-w-0">
            {currentStep === "learner" &&
              renderLearnerStep()}

            {currentStep === "guardian" &&
              renderGuardianStep()}

            {currentStep === "assessment" &&
              renderAssessmentStep()}

            {currentStep === "review" &&
              renderReviewStep()}
          </main>

          {/* ACTION BUTTONS */}

          <div className="mt-5 min-w-0 rounded-2xl border border-white/60 bg-white/50 p-3 backdrop-blur-sm sm:mt-6 sm:rounded-[22px] sm:p-4">
            <div className="flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/center/dashboard",
                    )
                  }
                  className="w-full rounded-xl border border-[#D9CDDD] bg-white px-5 py-3 text-sm font-semibold text-[#625767] shadow-sm transition hover:bg-[#F8F5F9] sm:w-auto"
                >
                  Cancel
                </button>

                {currentStep !== "learner" && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D9CDDD] bg-white px-5 py-3 text-sm font-semibold text-[#625767] shadow-sm transition hover:bg-[#F8F5F9] sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
              </div>

              {currentStep !== "review" ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#76508C] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#67437C] sm:w-auto"
                >
                  {currentStep ===
                    "assessment" &&
                  assessmentSectionIndex <
                    assessmentSections.length -
                      1
                    ? "Next section"
                    : currentStep ===
                        "assessment"
                      ? "Review enrollment"
                      : "Continue"}

                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleSubmitEnrollment
                  }
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#76508C] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#67437C] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting ? (
                    "Enrolling learner..."
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Enroll learner
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </CenterLayout>
  );
};

export default AddLearner;