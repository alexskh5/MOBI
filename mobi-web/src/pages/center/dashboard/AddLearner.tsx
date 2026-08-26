// MOBI/mobi-web/src/pages/center/dashboard/AddLearner.tsx

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  ImagePlus,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";
import {
  enrollLearner,
} from "../../../services/learner/learnerApi";

import type {
  EnrollLearnerRequest,
} from "../../../services/learner/learnerApi";

/* =========================================================
   TYPES
========================================================= */

type EnrollmentStep =
  | "learner"
  | "guardian"
  | "doctor"
  | "profile"
  | "enroll";

type QuestionType =
  | "single"
  | "multiple"
  | "short_text"
  | "long_text";

type AnswerValue = string | string[];

interface SelectOption {
  label: string;
  value: string;
}

interface ProfileQuestion {
  id: string;
  number: number;
  sectionId: string;
  prompt: string;
  helper?: string;
  type: QuestionType;
  options?: SelectOption[];
  required?: boolean;
  allowOther?: boolean;
  exclusiveOption?: string;
}

interface ProfileSection {
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
  homeAddress: string;
  schoolName: string;
  gradeLevel: string;
  learnerBio: string;
}

interface GuardianForm {
    firstName: string;
    middleName: string;
    lastName: string;
    relationship: string;
    phoneNumber: string;
    email: string;
    sameAddressAsLearner: boolean;
    homeAddress: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    authorizedForUpdates: boolean;
}

interface DoctorForm {
  doctorId: string;
  otherDoctorName: string;
  collaborationNotes: string;
}

interface EnrollmentForm {
  learner: LearnerForm;
  guardian: GuardianForm;
  doctor: DoctorForm;
}

interface AttentionArea {
  code: string;
  title: string;
  description: string;
}

/* =========================================================
   CONFIGURATION
========================================================= */

/*
  Version 4 is used because the guardian name structure changed
  from one fullName field to separate name fields.

  Using a new key prevents an old saved draft from causing
  undefined field errors.
*/
const DRAFT_STORAGE_KEY =
  "mobi-learner-intake-draft-v4";

const inputClassName =
  "block w-full min-w-0 max-w-full rounded-xl border border-[#DDCDE3] bg-white px-3 py-3 text-sm text-[#302936] outline-none transition placeholder:text-[#9B929F] focus:border-[#76508C] focus:ring-4 focus:ring-[#76508C]/10 sm:rounded-2xl sm:px-4";

const steps: {
  id: EnrollmentStep;
  label: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    id: "learner",
    label: "Learner",
    description: "Personal information",
    icon: UserRound,
  },
  {
    id: "guardian",
    label: "Guardian",
    description: "Contact information",
    icon: UsersRound,
  },
  {
    id: "doctor",
    label: "Doctor",
    description: "Doctor assignment",
    icon: Stethoscope,
  },
  {
    id: "profile",
    label: "Learner Profile",
    description: "Current skill measurement",
    icon: ClipboardList,
  },
  {
    id: "enroll",
    label: "Enroll",
    description: "Review and confirm",
    icon: CheckCircle2,
  },
];

const profileSections: ProfileSection[] = [
  {
    id: "communication",
    title: "Communication",
    description:
      "How the learner currently communicates and expresses wants or needs.",
  },
  {
    id: "language-understanding",
    title: "Language Understanding",
    description:
      "How the learner responds to their name, instructions, familiar words, and visual supports.",
  },
  {
    id: "social-communication",
    title: "Social Communication",
    description:
      "How the learner initiates, responds, takes turns, and stays engaged.",
  },
  {
    id: "learning-accessibility",
    title: "Learning & Accessibility",
    description:
      "The learner's tablet experience, required assistance, and sensory considerations.",
  },
  {
    id: "interests",
    title: "Interests",
    description:
      "Topics that may help make MOBI activities relevant and motivating.",
  },
  {
    id: "therapist-notes",
    title: "Therapist Notes",
    description:
      "Current therapy priorities and any additional information needed by the team.",
  },
];

/*
  Placeholder data only.

  Later replace this with doctors fetched from your backend:

  GET /api/center/doctors
*/
const doctorList = [
  {
    id: "doctor-1",
    name: "Dr. Andres Lou Mulach",
  },
  {
    id: "doctor-2",
    name: "Dr. Maria Santos",
  },
  {
    id: "doctor-3",
    name: "Dr. John Reyes",
  },
  {
    id: "doctor-4",
    name: "Dr. Sophia Garcia",
  },
  {
    id: "other",
    name: "Other doctor",
  },
];

const initialForm: EnrollmentForm = {
  learner: {
    firstName: "",
    middleName: "",
    lastName: "",
    nickname: "",
    birthDate: "",
    sexAtBirth: "",
    homeAddress: "",
    schoolName: "",
    gradeLevel: "",
    learnerBio: "",
  },

  guardian: {
    firstName: "",
    middleName: "",
    lastName: "",

    relationship: "",
    phoneNumber: "",
    email: "",

    sameAddressAsLearner: true,
    homeAddress: "",

    emergencyContactName: "",
    emergencyContactPhone: "",

    authorizedForUpdates: true,
  },

  doctor: {
    doctorId: "",
    otherDoctorName: "",
    collaborationNotes: "",
  },
};

/* =========================================================
   EXACT LEARNER INTAKE PROFILE QUESTIONS
========================================================= */

const profileQuestions: ProfileQuestion[] = [
  /* -------------------------------------------------------
     SECTION 1 — COMMUNICATION
  ------------------------------------------------------- */

  {
    id: "communication_method",
    number: 1,
    sectionId: "communication",
    prompt:
      "How does the learner usually communicate?",
    type: "single",
    required: true,
    options: [
      {
        label: "Spoken words",
        value: "spoken_words",
      },
      {
        label: "Gestures",
        value: "gestures",
      },
      {
        label: "Pointing",
        value: "pointing",
      },
      {
        label: "AAC / Communication board",
        value: "aac_communication_board",
      },
      {
        label: "Combination of the above",
        value: "combination",
      },
    ],
  },

  {
    id: "expressive_communication",
    number: 2,
    sectionId: "communication",
    prompt:
      "Which best describes the learner's current expressive communication?",
    helper:
      "This response may help suggest a starting point in the Speech Ladder for therapist review.",
    type: "single",
    required: true,
    options: [
      {
        label: "No speech yet",
        value: "no_speech",
      },
      {
        label: "Sounds / Vocalizations",
        value: "sounds_vocalizations",
      },
      {
        label: "Single words",
        value: "single_words",
      },
      {
        label: "Two-word combinations",
        value: "two_word_combinations",
      },
      {
        label: "Short phrases",
        value: "short_phrases",
      },
      {
        label: "Sentences",
        value: "sentences",
      },
    ],
  },

  {
    id: "imitates_sounds_words",
    number: 3,
    sectionId: "communication",
    prompt:
      "Does the learner imitate sounds or words?",
    type: "single",
    required: true,
    options: [
      {
        label: "Consistently",
        value: "consistently",
      },
      {
        label: "Sometimes",
        value: "sometimes",
      },
      {
        label: "Rarely",
        value: "rarely",
      },
      {
        label: "Not yet",
        value: "not_yet",
      },
    ],
  },

  {
    id: "expresses_wants_needs",
    number: 4,
    sectionId: "communication",
    prompt:
      "How does the learner usually express wants or needs?",
    type: "single",
    required: true,
    options: [
      {
        label: "Independently",
        value: "independently",
      },
      {
        label: "With prompting",
        value: "with_prompting",
      },
      {
        label: "Through gestures",
        value: "through_gestures",
      },
      {
        label: "Through AAC",
        value: "through_aac",
      },
      {
        label:
          "Unable to communicate wants consistently",
        value: "unable_consistently",
      },
    ],
  },

  /* -------------------------------------------------------
     SECTION 2 — LANGUAGE UNDERSTANDING
  ------------------------------------------------------- */

  {
    id: "responds_to_name",
    number: 5,
    sectionId: "language-understanding",
    prompt:
      "How often does the learner respond when their name is called?",
    type: "single",
    required: true,
    options: [
      {
        label: "Always",
        value: "always",
      },
      {
        label: "Often",
        value: "often",
      },
      {
        label: "Sometimes",
        value: "sometimes",
      },
      {
        label: "Rarely",
        value: "rarely",
      },
    ],
  },

  {
    id: "follows_one_step",
    number: 6,
    sectionId: "language-understanding",
    prompt:
      "How well does the learner follow simple one-step instructions?",
    type: "single",
    required: true,
    options: [
      {
        label: "Independently",
        value: "independently",
      },
      {
        label: "With prompting",
        value: "with_prompting",
      },
      {
        label: "Occasionally",
        value: "occasionally",
      },
      {
        label: "Not yet",
        value: "not_yet",
      },
    ],
  },

  {
    id: "understands_familiar_words",
    number: 7,
    sectionId: "language-understanding",
    prompt:
      "How well does the learner understand familiar words?",
    type: "single",
    required: true,
    options: [
      {
        label: "Consistently",
        value: "consistently",
      },
      {
        label: "Sometimes",
        value: "sometimes",
      },
      {
        label: "Rarely",
        value: "rarely",
      },
      {
        label: "Not yet",
        value: "not_yet",
      },
    ],
  },

  {
    id: "benefits_visual_supports",
    number: 8,
    sectionId: "language-understanding",
    prompt:
      "Does the learner benefit from visual supports?",
    type: "single",
    required: true,
    options: [
      {
        label: "Always",
        value: "always",
      },
      {
        label: "Sometimes",
        value: "sometimes",
      },
      {
        label: "Rarely",
        value: "rarely",
      },
      {
        label: "Not needed",
        value: "not_needed",
      },
    ],
  },

  /* -------------------------------------------------------
     SECTION 3 — SOCIAL COMMUNICATION
  ------------------------------------------------------- */

  {
    id: "initiates_interaction",
    number: 9,
    sectionId: "social-communication",
    prompt:
      "How often does the learner initiate interaction with others?",
    type: "single",
    required: true,
    options: [
      {
        label: "Frequently",
        value: "frequently",
      },
      {
        label: "Sometimes",
        value: "sometimes",
      },
      {
        label: "Rarely",
        value: "rarely",
      },
      {
        label: "Not yet",
        value: "not_yet",
      },
    ],
  },

  {
    id: "responds_to_interaction",
    number: 10,
    sectionId: "social-communication",
    prompt:
      "How often does the learner respond when others initiate interaction?",
    type: "single",
    required: true,
    options: [
      {
        label: "Consistently",
        value: "consistently",
      },
      {
        label: "Sometimes",
        value: "sometimes",
      },
      {
        label: "Rarely",
        value: "rarely",
      },
      {
        label: "Not yet",
        value: "not_yet",
      },
    ],
  },

  {
    id: "turn_taking",
    number: 11,
    sectionId: "social-communication",
    prompt:
      "Which best describes the learner's turn-taking skills?",
    type: "single",
    required: true,
    options: [
      {
        label: "Independently",
        value: "independently",
      },
      {
        label: "With reminders",
        value: "with_reminders",
      },
      {
        label: "Occasionally",
        value: "occasionally",
      },
      {
        label: "Not yet",
        value: "not_yet",
      },
    ],
  },

  {
    id: "structured_engagement",
    number: 12,
    sectionId: "social-communication",
    prompt:
      "How long does the learner usually remain engaged in a structured activity?",
    type: "single",
    required: true,
    options: [
      {
        label: "Less than 5 minutes",
        value: "less_than_5",
      },
      {
        label: "5–10 minutes",
        value: "5_to_10",
      },
      {
        label: "10–15 minutes",
        value: "10_to_15",
      },
      {
        label: "More than 15 minutes",
        value: "more_than_15",
      },
    ],
  },

  /* -------------------------------------------------------
     SECTION 4 — LEARNING & ACCESSIBILITY
  ------------------------------------------------------- */

  {
    id: "tablet_assistance",
    number: 13,
    sectionId: "learning-accessibility",
    prompt:
      "How much assistance does the learner need during tablet activities?",
    type: "single",
    required: true,
    options: [
      {
        label: "Independent",
        value: "independent",
      },
      {
        label: "Minimal assistance",
        value: "minimal_assistance",
      },
      {
        label: "Moderate assistance",
        value: "moderate_assistance",
      },
      {
        label: "Full assistance",
        value: "full_assistance",
      },
    ],
  },

  {
    id: "tablet_familiarity",
    number: 14,
    sectionId: "learning-accessibility",
    prompt:
      "Is the learner familiar with using a tablet?",
    type: "single",
    required: true,
    options: [
      {
        label: "Very familiar",
        value: "very_familiar",
      },
      {
        label: "Some experience",
        value: "some_experience",
      },
      {
        label: "First time",
        value: "first_time",
      },
    ],
  },

  {
    id: "sensory_sensitivities",
    number: 15,
    sectionId: "learning-accessibility",
    prompt:
      "Does the learner have sensory sensitivities that should be considered?",
    helper: "Select all that apply.",
    type: "multiple",
    required: true,
    allowOther: true,
    exclusiveOption: "none",
    options: [
      {
        label: "Loud sounds",
        value: "loud_sounds",
      },
      {
        label: "Bright lights",
        value: "bright_lights",
      },
      {
        label: "Fast-moving visuals",
        value: "fast_moving_visuals",
      },
      {
        label: "None",
        value: "none",
      },
    ],
  },

  /* -------------------------------------------------------
     SECTION 5 — INTERESTS
  ------------------------------------------------------- */

  {
    id: "motivating_topics",
    number: 16,
    sectionId: "interests",
    prompt:
      "Which topics are most motivating or interesting to the learner?",
    helper: "Select all that apply.",
    type: "multiple",
    required: true,
    allowOther: true,
    options: [
      {
        label: "Animals",
        value: "animals",
      },
      {
        label: "Vehicles",
        value: "vehicles",
      },
      {
        label: "Music",
        value: "music",
      },
      {
        label: "Food",
        value: "food",
      },
      {
        label: "Nature",
        value: "nature",
      },
      {
        label: "Letters",
        value: "letters",
      },
      {
        label: "Numbers",
        value: "numbers",
      },
      {
        label: "Colors",
        value: "colors",
      },
      {
        label: "Shapes",
        value: "shapes",
      },
      {
        label: "Toys",
        value: "toys",
      },
    ],
  },

  /* -------------------------------------------------------
     SECTION 6 — THERAPIST NOTES
  ------------------------------------------------------- */

  {
    id: "therapy_goals_priorities",
    number: 17,
    sectionId: "therapist-notes",
    prompt: "Therapy goals or priorities",
    type: "long_text",
  },

  {
    id: "additional_notes",
    number: 18,
    sectionId: "therapist-notes",
    prompt: "Additional notes",
    type: "long_text",
  },
];

/* =========================================================
   REUSABLE UI
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
          <span className="ml-1 text-[#B94B74]">
            *
          </span>
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

function InformationBox({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#DCCCE3] bg-[#F8F3FA] px-4 py-3 text-sm leading-6 text-[#5B4E61]">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

      <div className="min-w-0 break-words">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getTodayInputValue() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(now.getDate()).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

function calculateAge(birthDate: string) {
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  const birth = new Date(
    `${birthDate}T00:00:00`,
  );

  if (
    Number.isNaN(birth.getTime()) ||
    birth > today
  ) {
    return null;
  }

  let age =
    today.getFullYear() - birth.getFullYear();

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

function hasAnswer(
  answer: AnswerValue | undefined,
) {
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return (
    typeof answer === "string" &&
    answer.trim().length > 0
  );
}

function getQuestionOptions(
  question: ProfileQuestion,
) {
  const options = question.options ?? [];

  if (
    question.allowOther &&
    !options.some(
      (option) => option.value === "other",
    )
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

  const pageTopRef =
    useRef<HTMLDivElement | null>(null);

  const profileSectionTopRef =
    useRef<HTMLDivElement | null>(null);

  const photoInputRef =
    useRef<HTMLInputElement | null>(null);

  const [currentStep, setCurrentStep] =
    useState<EnrollmentStep>("learner");

  const [
    currentProfileSectionIndex,
    setCurrentProfileSectionIndex,
  ] = useState(0);

  const [form, setForm] =
    useState<EnrollmentForm>(initialForm);

  const [answers, setAnswers] = useState<
    Record<string, AnswerValue>
  >({});

  const [otherAnswers, setOtherAnswers] =
    useState<Record<string, string>>({});

  const [profilePhoto, setProfilePhoto] =
    useState<File | null>(null);

  const [
    profilePhotoPreview,
    setProfilePhotoPreview,
  ] = useState("");

  const [formError, setFormError] =
    useState("");

  const [statusMessage, setStatusMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [draftLoaded, setDraftLoaded] =
    useState(false);

  const currentStepIndex = steps.findIndex(
    (step) => step.id === currentStep,
  );

  const currentProfileSection =
    profileSections[
      currentProfileSectionIndex
    ];

  const currentSectionQuestions =
    useMemo(
      () =>
        profileQuestions.filter(
          (question) =>
            question.sectionId ===
            currentProfileSection.id,
        ),
      [currentProfileSection.id],
    );

  const learnerAge = useMemo(
    () =>
      calculateAge(
        form.learner.birthDate,
      ),
    [form.learner.birthDate],
  );

  const learnerFullName = [
    form.learner.firstName,
    form.learner.middleName,
    form.learner.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const guardianFullName = [
    form.guardian.firstName,
    form.guardian.middleName,
    form.guardian.lastName,
  ]
    .map((namePart) => namePart.trim())
    .filter(Boolean)
    .join(" ");

  const answeredQuestionCount =
    useMemo(
      () =>
        profileQuestions.filter(
          (question) =>
            hasAnswer(
              answers[question.id],
            ),
        ).length,
      [answers],
    );

  const requiredQuestionCount =
    useMemo(
      () =>
        profileQuestions.filter(
          (question) =>
            question.required,
        ).length,
      [],
    );

  const answeredRequiredCount =
    useMemo(
      () =>
        profileQuestions.filter(
          (question) =>
            question.required &&
            hasAnswer(
              answers[question.id],
            ),
        ).length,
      [answers],
    );

  const profileProgress =
    requiredQuestionCount > 0
      ? Math.round(
          (answeredRequiredCount /
            requiredQuestionCount) *
            100,
        )
      : 0;

  /* =======================================================
     SMART SCROLLING
  ======================================================= */

  const scrollToPageTop = () => {
    window.requestAnimationFrame(() => {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const scrollToProfileTop = () => {
    window.requestAnimationFrame(() => {
      profileSectionTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  /* =======================================================
     DRAFT
  ======================================================= */

  useEffect(() => {
    try {
      const storedDraft =
        localStorage.getItem(
          DRAFT_STORAGE_KEY,
        );

      if (storedDraft) {
        const parsedDraft =
          JSON.parse(storedDraft);

        if (parsedDraft.form) {
          setForm(parsedDraft.form);
        }

        if (parsedDraft.answers) {
          setAnswers(
            parsedDraft.answers,
          );
        }

        if (parsedDraft.otherAnswers) {
          setOtherAnswers(
            parsedDraft.otherAnswers,
          );
        }
      }
    } catch (error) {
      console.error(
        "Unable to load learner draft:",
        error,
      );
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            form,
            answers,
            otherAnswers,
            updatedAt:
              new Date().toISOString(),
          }),
        );
      }, 500);

    return () =>
      window.clearTimeout(timeout);
  }, [
    form,
    answers,
    otherAnswers,
    draftLoaded,
  ]);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) {
        URL.revokeObjectURL(
          profilePhotoPreview,
        );
      }
    };
  }, [profilePhotoPreview]);

  /* =======================================================
     FORM UPDATES
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

    setFormError("");
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

    setFormError("");
  };

  const updateDoctor = (
    field: keyof DoctorForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      doctor: {
        ...previous.doctor,
        [field]: value,
      },
    }));

    setFormError("");
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
        const updated = {
          ...previous,
        };

        delete updated[questionId];

        return updated;
      });
    }

    setFormError("");
  };

  const toggleMultipleAnswer = (
    question: ProfileQuestion,
    value: string,
  ) => {
    setAnswers((previous) => {
      const currentAnswer =
        previous[question.id];

      const selectedValues =
        Array.isArray(currentAnswer)
          ? currentAnswer
          : [];

      const isSelected =
        selectedValues.includes(value);

      let updatedValues: string[];

      /*
        Example:
        Selecting "None" removes all other
        sensory sensitivity selections.
      */
      if (
        question.exclusiveOption &&
        value ===
          question.exclusiveOption
      ) {
        updatedValues = isSelected
          ? []
          : [value];
      } else {
        const withoutExclusive =
          question.exclusiveOption
            ? selectedValues.filter(
                (selected) =>
                  selected !==
                  question.exclusiveOption,
              )
            : selectedValues;

        updatedValues = isSelected
          ? withoutExclusive.filter(
              (selected) =>
                selected !== value,
            )
          : [
              ...withoutExclusive,
              value,
            ];
      }

      return {
        ...previous,
        [question.id]:
          updatedValues,
      };
    });

    setFormError("");
  };

  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError(
        "Please choose a valid image file.",
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setFormError(
        "The learner photo must be 5 MB or smaller.",
      );
      return;
    }

    if (profilePhotoPreview) {
      URL.revokeObjectURL(
        profilePhotoPreview,
      );
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
      !form.learner.sexAtBirth
    ) {
      setFormError(
        "Please complete the learner's first name, last name, birthday, and sex at birth.",
      );

      return false;
    }

    if (learnerAge === null) {
      setFormError(
        "Please enter a valid learner birthday.",
      );

      return false;
    }

    setFormError("");

    return true;
  };

  const validateGuardianStep = () => {
  /*
    Middle name remains optional.

    First name and last name are required because the
    center_parents table marks both columns as NOT NULL.
  */
  if (
    !form.guardian.firstName.trim() ||
    !form.guardian.lastName.trim() ||
    !form.guardian.relationship ||
    !form.guardian.phoneNumber.trim() ||
    !form.guardian.email.trim()
  ) {
    setFormError(
      "Please complete the guardian's first name, last name, relationship, phone number, and email address.",
    );

    return false;
  }

  /*
    When the guardian does not use the learner's address,
    a separate guardian address must be provided.
  */
  if (
    !form.guardian.sameAddressAsLearner &&
    !form.guardian.homeAddress.trim()
  ) {
    setFormError(
      "Please enter the guardian's home address.",
    );

    return false;
  }

  /*
    Enrollment requires permission for clinic communication.
  */
  if (
    !form.guardian.authorizedForUpdates
  ) {
    setFormError(
      "Guardian authorization is required before enrollment.",
    );

    return false;
  }

  setFormError("");

  return true;
};

  const validateDoctorStep = () => {
    if (!form.doctor.doctorId) {
      setFormError(
        "Please select the learner's doctor.",
      );

      return false;
    }

    if (
      form.doctor.doctorId ===
        "other" &&
      !form.doctor.otherDoctorName.trim()
    ) {
      setFormError(
        "Please enter the doctor's name.",
      );

      return false;
    }

    setFormError("");

    return true;
  };

  const validateCurrentProfileSection =
    () => {
      const missingQuestion =
        currentSectionQuestions.find(
          (question) =>
            question.required &&
            !hasAnswer(
              answers[question.id],
            ),
        );

      if (missingQuestion) {
        setFormError(
          `Please answer Question ${missingQuestion.number}: “${missingQuestion.prompt}”`,
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

      setFormError("");

      return true;
    };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNext = () => {
    if (currentStep === "learner") {
      if (!validateLearnerStep()) {
        return;
      }

      setCurrentStep("guardian");
      scrollToPageTop();
      return;
    }

    if (currentStep === "guardian") {
      if (!validateGuardianStep()) {
        return;
      }

      setCurrentStep("doctor");
      scrollToPageTop();
      return;
    }

    if (currentStep === "doctor") {
      if (!validateDoctorStep()) {
        return;
      }

      setCurrentStep("profile");

      setCurrentProfileSectionIndex(
        0,
      );

      scrollToPageTop();
      return;
    }

    if (currentStep === "profile") {
      if (
        !validateCurrentProfileSection()
      ) {
        return;
      }

      if (
        currentProfileSectionIndex <
        profileSections.length - 1
      ) {
        setCurrentProfileSectionIndex(
          (previous) => previous + 1,
        );

        /*
          Automatically scroll to Question 1
          of the next profile section.
        */
        window.setTimeout(() => {
          scrollToProfileTop();
        }, 50);
      } else {
        setCurrentStep("enroll");
        scrollToPageTop();
      }
    }
  };

  const handleBack = () => {
    setFormError("");

    if (currentStep === "guardian") {
      setCurrentStep("learner");
    } else if (
      currentStep === "doctor"
    ) {
      setCurrentStep("guardian");
    } else if (
      currentStep === "profile"
    ) {
      if (
        currentProfileSectionIndex > 0
      ) {
        setCurrentProfileSectionIndex(
          (previous) => previous - 1,
        );

        window.setTimeout(() => {
          scrollToProfileTop();
        }, 50);

        return;
      }

      setCurrentStep("doctor");
    } else if (
      currentStep === "enroll"
    ) {
      setCurrentStep("profile");

      setCurrentProfileSectionIndex(
        profileSections.length - 1,
      );
    }

    scrollToPageTop();
  };

  const handleStepClick = (
    step: EnrollmentStep,
  ) => {
    const targetIndex =
      steps.findIndex(
        (item) => item.id === step,
      );

    if (
      targetIndex >= currentStepIndex
    ) {
      return;
    }

    setCurrentStep(step);
    setFormError("");
    scrollToPageTop();
  };

  

  /* =======================================================
     PRELIMINARY PROFILE MEASUREMENT

     These are suggestions for therapist review.
     They do not automatically change the learner's
     final Speech Ladder level.
  ======================================================= */

  const suggestedSpeechLadder =
    useMemo(() => {
      const expressiveLevel =
        answers.expressive_communication;

      switch (expressiveLevel) {
        case "no_speech":
          return "Sound";

        case "sounds_vocalizations":
          return "Sound";

        case "single_words":
          return "Word";

        case "two_word_combinations":
          return "Phrase";

        case "short_phrases":
          return "Phrase";

        case "sentences":
          return "Sentence";

        default:
          return "For therapist review";
      }
    }, [answers.expressive_communication]);

  const attentionAreas =
    useMemo<AttentionArea[]>(() => {
      const areas: AttentionArea[] =
        [];

      if (
        answers.imitates_sounds_words ===
          "rarely" ||
        answers.imitates_sounds_words ===
          "not_yet"
      ) {
        areas.push({
          code: "SOUND_IMITATION",
          title: "Sound and word imitation",
          description:
            "The learner may need more support with imitating sounds or words.",
        });
      }

      if (
        answers.expresses_wants_needs ===
          "with_prompting" ||
        answers.expresses_wants_needs ===
          "unable_consistently"
      ) {
        areas.push({
          code: "FUNCTIONAL_COMMUNICATION",
          title: "Functional communication",
          description:
            "The learner may need more support expressing wants and needs consistently.",
        });
      }

      if (
        answers.responds_to_name ===
          "sometimes" ||
        answers.responds_to_name ===
          "rarely"
      ) {
        areas.push({
          code: "RESPONSE_TO_NAME",
          title: "Response to name",
          description:
            "The learner's response to their name may require additional attention.",
        });
      }

      if (
        answers.follows_one_step ===
          "occasionally" ||
        answers.follows_one_step ===
          "not_yet"
      ) {
        areas.push({
          code: "ONE_STEP_DIRECTIONS",
          title: "Following instructions",
          description:
            "The learner may need more support following simple one-step instructions.",
        });
      }

      if (
        answers
          .understands_familiar_words ===
          "rarely" ||
        answers
          .understands_familiar_words ===
          "not_yet"
      ) {
        areas.push({
          code: "FAMILIAR_WORDS",
          title: "Understanding familiar words",
          description:
            "Understanding familiar words may need additional attention.",
        });
      }

      if (
        answers.initiates_interaction ===
          "rarely" ||
        answers.initiates_interaction ===
          "not_yet"
      ) {
        areas.push({
          code: "INTERACTION_INITIATION",
          title: "Initiating interaction",
          description:
            "The learner may need support beginning interactions with others.",
        });
      }

      if (
        answers.responds_to_interaction ===
          "rarely" ||
        answers.responds_to_interaction ===
          "not_yet"
      ) {
        areas.push({
          code: "INTERACTION_RESPONSE",
          title: "Responding to interaction",
          description:
            "The learner may need support responding when others initiate interaction.",
        });
      }

      if (
        answers.turn_taking ===
          "occasionally" ||
        answers.turn_taking ===
          "not_yet"
      ) {
        areas.push({
          code: "TURN_TAKING",
          title: "Turn-taking",
          description:
            "Turn-taking may need additional practice and support.",
        });
      }

      if (
        answers.structured_engagement ===
        "less_than_5"
      ) {
        areas.push({
          code: "ACTIVITY_ENGAGEMENT",
          title: "Structured activity engagement",
          description:
            "Activities may need to begin with shorter durations and planned breaks.",
        });
      }

      if (
        answers.tablet_assistance ===
          "moderate_assistance" ||
        answers.tablet_assistance ===
          "full_assistance"
      ) {
        areas.push({
          code: "TABLET_ASSISTANCE",
          title: "Tablet assistance",
          description:
            "The learner may require additional support during tablet activities.",
        });
      }

      if (
        answers.tablet_familiarity ===
        "first_time"
      ) {
        areas.push({
          code: "TABLET_FAMILIARITY",
          title: "Tablet familiarization",
          description:
            "The learner may benefit from a guided introduction before beginning activities.",
        });
      }

      const sensitivities =
        Array.isArray(
          answers.sensory_sensitivities,
        )
          ? answers.sensory_sensitivities
          : [];

      if (
        sensitivities.length > 0 &&
        !sensitivities.includes("none")
      ) {
        areas.push({
          code: "SENSORY_ACCOMMODATIONS",
          title: "Sensory accommodations",
          description:
            "MOBI activities should consider the learner's selected sensory sensitivities.",
        });
      }

      return areas;
    }, [answers]);

  /* =======================================================
     SUBMISSION
  ======================================================= */

  const handleEnroll = async () => {
    setIsSubmitting(true);
    setFormError("");

    const selectedDoctor =
      doctorList.find(
        (doctor) =>
          doctor.id ===
          form.doctor.doctorId,
      );

    const normalizedResponses =
      profileQuestions.map(
        (question) => ({
          questionId: question.id,
          questionNumber:
            question.number,
          sectionId:
            question.sectionId,
          value:
            answers[question.id] ??
            null,
          otherValue:
            otherAnswers[
              question.id
            ] || null,
        }),
      );

    const payload: EnrollLearnerRequest = {
      learner: {
        ...form.learner,
        calculatedAge: learnerAge,
      },

      guardian: {
        firstName:
          form.guardian.firstName.trim(),

        middleName:
          form.guardian.middleName.trim() || null,

        lastName:
          form.guardian.lastName.trim(),

        relationship:
          form.guardian.relationship,

        phoneNumber:
          form.guardian.phoneNumber.trim(),

        email:
          form.guardian.email.trim().toLowerCase(),

        sameAddressAsLearner:
          form.guardian.sameAddressAsLearner,

        homeAddress:
          form.guardian.sameAddressAsLearner
            ? form.learner.homeAddress.trim() ||
              null
            : form.guardian.homeAddress.trim(),

        emergencyContactName:
          form.guardian.emergencyContactName.trim() ||
          null,

        emergencyContactPhone:
          form.guardian.emergencyContactPhone.trim() ||
          null,

        authorizedForUpdates:
          form.guardian.authorizedForUpdates,
      },

      doctor: {
        doctorId:
          form.doctor.doctorId,

        doctorName:
          form.doctor.doctorId ===
          "other"
            ? form.doctor
                .otherDoctorName
            : selectedDoctor?.name ??
              null,

        collaborationNotes:
          form.doctor
            .collaborationNotes,
      },

      learnerIntakeProfile: {
        templateCode:
          "MOBI_LEARNER_INTAKE_PROFILE",

        templateVersion: 1,

        responses:
          normalizedResponses,

        preliminaryMeasurement: {
          suggestedSpeechLadder,
          attentionAreas,
        },

        status:
          "completed_for_therapist_review",
      },

      enrollmentStatus: "active",

      /*
        Do not send an enrollment date field.

        The backend/database should automatically set:

        created_at DEFAULT now()
      */
    };

    try {
      // const requestBody =
      //   new FormData();

      // requestBody.append(
      //   "payload",
      //   JSON.stringify(payload),
      // );

      // if (profilePhoto) {
      //   requestBody.append(
      //     "profile_photo",
      //     profilePhoto,
      //   );
      // }

      /*
        learnerApi.ts handles:
        - FormData creation
        - JSON payload
        - optional learner photo
        - POST request
      */

      const result = await enrollLearner(
        payload,
        profilePhoto,
      );

      console.log(
        "Learner enrollment response:",
        result,
      );

      localStorage.removeItem(
        DRAFT_STORAGE_KEY,
      );

      setStatusMessage(
        "Learner enrolled successfully.",
      );

      window.setTimeout(() => {
        navigate(
          "/center/dashboard",
        );
      }, 700);
    } catch (error) {
      console.error(
        "Learner enrollment failed:",
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

  const renderQuestion = (
    question: ProfileQuestion,
  ) => {
    const answer =
      answers[question.id];

    if (
      question.type ===
        "short_text" ||
      question.type ===
        "long_text"
    ) {
      return (
        <article
          id={`question-${question.id}`}
          key={question.id}
          className="min-w-0 scroll-mt-5 overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[22px] sm:p-6"
        >
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0E5F3] text-xs font-bold text-[#76508C]">
              {question.number}
            </span>

            <div className="min-w-0 flex-1">
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
          </div>

          <div className="mt-4">
            {question.type ===
            "long_text" ? (
              <textarea
                rows={5}
                value={
                  typeof answer ===
                  "string"
                    ? answer
                    : ""
                }
                onChange={(event) =>
                  updateSingleAnswer(
                    question.id,
                    event.target
                      .value,
                  )
                }
                placeholder="Enter notes..."
                className={`${inputClassName} resize-y`}
              />
            ) : (
              <input
                type="text"
                value={
                  typeof answer ===
                  "string"
                    ? answer
                    : ""
                }
                onChange={(event) =>
                  updateSingleAnswer(
                    question.id,
                    event.target
                      .value,
                  )
                }
                placeholder="Enter answer..."
                className={
                  inputClassName
                }
              />
            )}
          </div>
        </article>
      );
    }

    const options =
      getQuestionOptions(question);

    const isMultiple =
      question.type === "multiple";

    const selectedValues =
      Array.isArray(answer)
        ? answer
        : [];

    const otherSelected =
      isMultiple
        ? selectedValues.includes(
            "other",
          )
        : answer === "other";

    return (
      <article
        id={`question-${question.id}`}
        key={question.id}
        className="min-w-0 scroll-mt-5 overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[22px] sm:p-6"
      >
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0E5F3] text-xs font-bold text-[#76508C]">
            {question.number}
          </span>

          <div className="min-w-0 flex-1">
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
        </div>

        <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
          {options.map((option) => {
            const isSelected =
              isMultiple
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
                    toggleMultipleAnswer(
                      question,
                      option.value,
                    );
                  } else {
                    updateSingleAnswer(
                      question.id,
                      option.value,
                    );
                  }
                }}
                className={`flex min-h-[52px] min-w-0 items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition sm:rounded-2xl sm:px-4 ${
                  isSelected
                    ? "border-[#76508C] bg-[#F2E9F7] text-[#52316F] shadow-sm"
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
                      ? "border-[#76508C] bg-[#76508C]"
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
              otherAnswers[
                question.id
              ] ?? ""
            }
            onChange={(event) =>
              setOtherAnswers(
                (previous) => ({
                  ...previous,
                  [question.id]:
                    event.target.value,
                }),
              )
            }
            placeholder="Please specify..."
            className={`${inputClassName} mt-3`}
          />
        )}
      </article>
    );
  };

  /* =========================================================
     STEP 1 — LEARNER
  ========================================================= */

  const renderLearnerStep = () => (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[26px] sm:p-7">
      <div className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="relative mx-auto h-24 w-24 shrink-0 sm:mx-0 sm:h-32 sm:w-32">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] border border-[#E0D2E5] bg-[#F6EFF8] sm:rounded-[26px]">
            {profilePhotoPreview ? (
              <img
                src={
                  profilePhotoPreview
                }
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
            onChange={
              handlePhotoChange
            }
          />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs">
            Learner personal
            information
          </p>

          <h2 className="mt-2 break-words text-xl font-semibold text-[#352D39] sm:text-2xl lg:text-3xl">
            {learnerFullName ||
              "New learner"}
          </h2>

          <p className="mt-2 text-sm text-[#746B78]">
            {learnerAge !== null
              ? `${learnerAge} years old`
              : "Birthday has not been entered"}
          </p>

          <p className="mt-3 text-xs leading-5 text-[#8A818E]">
            The learner photo is
            optional.
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        <FormField
          label="First name"
          required
        >
          <input
            value={
              form.learner.firstName
            }
            onChange={(event) =>
              updateLearner(
                "firstName",
                event.target.value,
              )
            }
            placeholder="First name"
            className={
              inputClassName
            }
          />
        </FormField>

        <FormField label="Middle name">
          <input
            value={
              form.learner.middleName
            }
            onChange={(event) =>
              updateLearner(
                "middleName",
                event.target.value,
              )
            }
            placeholder="Middle name"
            className={
              inputClassName
            }
          />
        </FormField>

        <FormField
          label="Last name"
          required
        >
          <input
            value={
              form.learner.lastName
            }
            onChange={(event) =>
              updateLearner(
                "lastName",
                event.target.value,
              )
            }
            placeholder="Last name"
            className={
              inputClassName
            }
          />
        </FormField>

        <FormField label="Preferred name or nickname">
          <input
            value={
              form.learner.nickname
            }
            onChange={(event) =>
              updateLearner(
                "nickname",
                event.target.value,
              )
            }
            placeholder="Nickname"
            className={
              inputClassName
            }
          />
        </FormField>

        <FormField
          label="Birthday"
          required
        >
          <input
            type="date"
            value={
              form.learner.birthDate
            }
            max={
              getTodayInputValue()
            }
            onChange={(event) =>
              updateLearner(
                "birthDate",
                event.target.value,
              )
            }
            className={
              inputClassName
            }
          />
        </FormField>

        <FormField
          label="Sex at birth"
          required
        >
          <select
            value={
              form.learner.sexAtBirth
            }
            onChange={(event) =>
              updateLearner(
                "sexAtBirth",
                event.target.value,
              )
            }
            className={
              inputClassName
            }
          >
            <option value="">
              Select an option
            </option>

            <option value="female">
              Female
            </option>

            <option value="male">
              Male
            </option>

            <option value="intersex">
              Intersex
            </option>

            <option value="not_disclosed">
              Prefer not to disclose
            </option>
          </select>
        </FormField>

        <FormField label="School or learning center">
          <input
            value={
              form.learner.schoolName
            }
            onChange={(event) =>
              updateLearner(
                "schoolName",
                event.target.value,
              )
            }
            placeholder="School or center"
            className={
              inputClassName
            }
          />
        </FormField>

        <FormField label="Grade or learning level">
          <input
            value={
              form.learner.gradeLevel
            }
            onChange={(event) =>
              updateLearner(
                "gradeLevel",
                event.target.value,
              )
            }
            placeholder="Example: Kindergarten"
            className={
              inputClassName
            }
          />
        </FormField>
      </div>

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <FormField label="Learner home address">
          <textarea
            rows={4}
            value={
              form.learner.homeAddress
            }
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
          helper="Add brief information about routines, strengths, interests, or anything helpful for the clinical team."
        >
          <textarea
            rows={4}
            value={
              form.learner.learnerBio
            }
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

  /* =========================================================
     STEP 2 — GUARDIAN
  ========================================================= */

  const renderGuardianStep = () => (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[26px] sm:p-7">
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs">
          Guardian information
        </p>

        <h2 className="mt-2 text-lg font-semibold text-[#352D39] sm:text-xl">
          Parent or guardian contact
        </h2>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <FormField
  label="Guardian first name"
  required
>
  <input
    type="text"
    value={form.guardian.firstName}
    onChange={(event) =>
      updateGuardian(
        "firstName",
        event.target.value,
      )
    }
    placeholder="First name"
    autoComplete="given-name"
    className={inputClassName}
  />
</FormField>

<FormField label="Guardian middle name">
  <input
    type="text"
    value={form.guardian.middleName}
    onChange={(event) =>
      updateGuardian(
        "middleName",
        event.target.value,
      )
    }
    placeholder="Middle name"
    autoComplete="additional-name"
    className={inputClassName}
  />
</FormField>

<FormField
  label="Guardian last name"
  required
>
  <input
    type="text"
    value={form.guardian.lastName}
    onChange={(event) =>
      updateGuardian(
        "lastName",
        event.target.value,
      )
    }
    placeholder="Last name"
    autoComplete="family-name"
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
            className={
              inputClassName
            }
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

        <FormField
          label="Phone number"
          required
        >
          <input
            type="tel"
            value={form.guardian.phoneNumber}
            onChange={(event) =>
              updateGuardian(
                "phoneNumber",
                event.target.value,
              )
            }
            placeholder="+63"
            autoComplete="tel"
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
            autoComplete="email"
            className={inputClassName}
          />
        </FormField>

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
            className={
              inputClassName
            }
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
            className={
              inputClassName
            }
          />
        </FormField>
      </div>

      <div className="mt-5 space-y-4">
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
            className="mt-1 h-4 w-4 shrink-0 accent-[#76508C]"
          />

          <span className="min-w-0">
            <span className="block break-words text-sm font-semibold text-[#463B4B]">
              Same address as the
              learner
            </span>

            <span className="mt-1 block break-words text-xs leading-5 text-[#756C79]">
              Uncheck this when the
              guardian has a different
              address.
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
              rows={4}
              value={
                form.guardian
                  .homeAddress
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
            className="mt-1 h-4 w-4 shrink-0 accent-[#76508C]"
          />

          <span className="min-w-0">
            <span className="block break-words text-sm font-semibold text-[#463B4B]">
              Guardian authorizes
              clinic communication
            </span>

            <span className="mt-1 block break-words text-xs leading-5 text-[#756C79]">
              The center may send
              schedule, profile, activity,
              and progress-related
              updates.
            </span>
          </span>
        </label>
      </div>
    </section>
  );

  /* =========================================================
     STEP 3 — DOCTOR
  ========================================================= */

  const renderDoctorStep = () => {
    const selectedDoctor =
      doctorList.find(
        (doctor) =>
          doctor.id ===
          form.doctor.doctorId,
      );

    return (
      <section className="mx-auto min-w-0 max-w-3xl overflow-hidden rounded-2xl border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[26px] sm:p-7">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F0E5F3] text-[#76508C]">
            <Stethoscope className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs">
              Learner doctor
            </p>

            <h2 className="mt-1 break-words text-lg font-semibold text-[#352D39] sm:text-xl">
              Select the doctor assigned
              to this learner
            </h2>

            <p className="mt-2 break-words text-sm leading-6 text-[#746B78]">
              This doctor will later be
              connected to learner reports
              and center collaboration.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <FormField
            label="Assigned doctor"
            required
          >
            <select
              value={
                form.doctor.doctorId
              }
              onChange={(event) =>
                updateDoctor(
                  "doctorId",
                  event.target.value,
                )
              }
              className={
                inputClassName
              }
            >
              <option value="">
                Select doctor
              </option>

              {doctorList.map(
                (doctor) => (
                  <option
                    key={doctor.id}
                    value={doctor.id}
                  >
                    {doctor.name}
                  </option>
                ),
              )}
            </select>
          </FormField>

          {form.doctor.doctorId ===
            "other" && (
            <FormField
              label="Doctor's full name"
              required
            >
              <input
                value={
                  form.doctor
                    .otherDoctorName
                }
                onChange={(event) =>
                  updateDoctor(
                    "otherDoctorName",
                    event.target.value,
                  )
                }
                placeholder="Enter doctor's full name"
                className={
                  inputClassName
                }
              />
            </FormField>
          )}

          <FormField
            label="Collaboration notes"
            helper="Optional notes about referrals, report sharing, or coordination with the doctor."
          >
            <textarea
              rows={5}
              value={
                form.doctor
                  .collaborationNotes
              }
              onChange={(event) =>
                updateDoctor(
                  "collaborationNotes",
                  event.target.value,
                )
              }
              placeholder="Enter collaboration notes..."
              className={`${inputClassName} resize-y`}
            />
          </FormField>

          {selectedDoctor &&
            selectedDoctor.id !==
              "other" && (
              <div className="rounded-2xl border border-[#DDD0E2] bg-[#F8F3FA] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8A7392]">
                  Selected doctor
                </p>

                <p className="mt-2 break-words font-semibold text-[#403744]">
                  {
                    selectedDoctor.name
                  }
                </p>
              </div>
            )}
        </div>
      </section>
    );
  };

  /* =========================================================
     STEP 4 — LEARNER INTAKE PROFILE
  ========================================================= */

  const renderProfileStep = () => (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="min-w-0 rounded-[22px] border border-[#E3D6E8] bg-white p-3 shadow-sm sm:p-4 xl:sticky xl:top-4 xl:h-fit">
        <div className="mb-4 px-1 sm:px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs">
            Profile progress
          </p>

          <div className="mt-3 flex items-end justify-between gap-3">
            <span className="text-2xl font-semibold text-[#48384F]">
              {profileProgress}%
            </span>

            <span className="text-xs text-[#807684]">
              {answeredQuestionCount}/
              {profileQuestions.length}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEE5F1]">
            <div
              className="h-full rounded-full bg-[#76508C] transition-all duration-300"
              style={{
                width: `${profileProgress}%`,
              }}
            />
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:block xl:space-y-1">
          {profileSections.map(
            (section, index) => {
              const sectionQuestions =
                profileQuestions.filter(
                  (question) =>
                    question.sectionId ===
                    section.id,
                );

              const completedQuestions =
                sectionQuestions.filter(
                  (question) =>
                    hasAnswer(
                      answers[
                        question.id
                      ],
                    ),
                ).length;

              const requiredQuestions =
                sectionQuestions.filter(
                  (question) =>
                    question.required,
                );

              const sectionComplete =
                requiredQuestions.length ===
                  0
                  ? index <
                    currentProfileSectionIndex
                  : requiredQuestions.every(
                      (question) =>
                        hasAnswer(
                          answers[
                            question.id
                          ],
                        ),
                    );

              const isCurrent =
                index ===
                currentProfileSectionIndex;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    if (
                      index <=
                      currentProfileSectionIndex
                    ) {
                      setCurrentProfileSectionIndex(
                        index,
                      );

                      setFormError("");

                      window.setTimeout(
                        () => {
                          scrollToProfileTop();
                        },
                        50,
                      );
                    }
                  }}
                  className={`min-w-0 rounded-xl px-2 py-2.5 text-left transition sm:rounded-2xl sm:px-3 sm:py-3 xl:w-full ${
                    isCurrent
                      ? "bg-[#F1E7F8] text-[#593878]"
                      : index <
                          currentProfileSectionIndex
                        ? "text-[#574E5B] hover:bg-[#F8F4FA]"
                        : "cursor-default text-[#A29AA5]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        isCurrent
                          ? "border-[#76508C] bg-[#76508C] text-white"
                          : sectionComplete
                            ? "border-[#B79AC5] bg-[#F4ECF8] text-[#684A76]"
                            : "border-[#DDD3E1] bg-white"
                      }`}
                    >
                      {sectionComplete ? (
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
                        {completedQuestions}/
                        {sectionQuestions.length}
                      </span>
                    </span>
                  </div>
                </button>
              );
            },
          )}
        </div>
      </aside>

      <section
        ref={profileSectionTopRef}
        className="min-w-0 scroll-mt-4"
      >
        <div className="mb-4 min-w-0 rounded-[22px] border border-[#E3D6E8] bg-white p-4 shadow-sm sm:mb-5 sm:rounded-[24px] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs">
            Section{" "}
            {currentProfileSectionIndex +
              1}{" "}
            of {profileSections.length}
          </p>

          <h2 className="mt-2 break-words text-lg font-semibold text-[#352D39] sm:text-2xl">
            {
              currentProfileSection.title
            }
          </h2>

          <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-[#716875]">
            {
              currentProfileSection.description
            }
          </p>
        </div>

        {currentProfileSectionIndex ===
          0 && (
          <div className="mb-4 sm:mb-5">
            <InformationBox>
              The Learner Intake Profile
              measures the learner's current
              abilities and support needs. It
              does not diagnose autism and
              does not replace the therapist's
              professional judgment.
            </InformationBox>
          </div>
        )}

        <div className="min-w-0 space-y-4">
          {currentSectionQuestions.map(
            renderQuestion,
          )}
        </div>
      </section>
    </div>
  );

  /* =========================================================
     STEP 5 — REVIEW AND ENROLL
  ========================================================= */

  const renderEnrollStep = () => {
    const selectedDoctor =
      doctorList.find(
        (doctor) =>
          doctor.id ===
          form.doctor.doctorId,
      );

    const doctorName =
      form.doctor.doctorId ===
      "other"
        ? form.doctor.otherDoctorName
        : selectedDoctor?.name ??
          "Not selected";

    return (
      <div className="min-w-0 space-y-4 sm:space-y-6">
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#3F3545]">
                Learner
              </h2>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(
                    "learner",
                  );
                  scrollToPageTop();
                }}
                className="shrink-0 text-sm font-semibold text-[#76508C] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F3EAF6]">
                {profilePhotoPreview ? (
                  <img
                    src={
                      profilePhotoPreview
                    }
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
                  {form.learner
                    .schoolName ||
                    "No school entered"}
                </p>
              </div>
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#3F3545]">
                Guardian
              </h2>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(
                    "guardian",
                  );
                  scrollToPageTop();
                }}
                className="shrink-0 text-sm font-semibold text-[#76508C] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 min-w-0 space-y-2 text-sm">
             <p className="break-words font-semibold text-[#352D39]">
                {guardianFullName || "Guardian name unavailable"}
              </p>

              <p className="capitalize text-[#766D7A]">
                {form.guardian.relationship.replace(
                  "_",
                  " ",
                )}
              </p>

              <p className="break-words text-[#766D7A]">
                {
                  form.guardian
                    .phoneNumber
                }
              </p>

              <p className="break-all text-[#766D7A]">
                {form.guardian.email}
              </p>
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-5 shadow-sm md:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-[#3F3545]">
                Doctor
              </h2>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(
                    "doctor",
                  );
                  scrollToPageTop();
                }}
                className="shrink-0 text-sm font-semibold text-[#76508C] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-[#8A818E]">
                Assigned doctor
              </p>

              <p className="mt-2 break-words font-semibold text-[#403744]">
                {doctorName}
              </p>
            </div>
          </section>
        </div>

        <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-7">
          <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7392] sm:text-xs">
                Learner Intake Profile
              </p>

              <h2 className="mt-2 break-words text-lg font-semibold text-[#352D39] sm:text-xl">
                Preliminary measurement
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(
                  "profile",
                );

                setCurrentProfileSectionIndex(
                  0,
                );

                scrollToPageTop();
              }}
              className="text-left text-sm font-semibold text-[#76508C] hover:underline sm:text-right"
            >
              Review answers
            </button>
          </div>

          <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#F7F2F9] p-4">
              <p className="text-2xl font-semibold text-[#523B5C]">
                {profileProgress}%
              </p>

              <p className="mt-1 text-sm text-[#746B78]">
                Required questions
                completed
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F2F9] p-4">
              <p className="text-2xl font-semibold text-[#523B5C]">
                {suggestedSpeechLadder}
              </p>

              <p className="mt-1 text-sm text-[#746B78]">
                Suggested Speech Ladder
                starting point
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F2F9] p-4">
              <p className="text-2xl font-semibold text-[#523B5C]">
                {attentionAreas.length}
              </p>

              <p className="mt-1 text-sm text-[#746B78]">
                Areas that may need
                attention
              </p>
            </div>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#E3D6E8] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-7">
          <div className="flex items-center gap-3">
            <HeartHandshake className="h-5 w-5 shrink-0 text-[#76508C]" />

            <h2 className="font-semibold text-[#3F3545]">
              Areas for therapist review
            </h2>
          </div>

          {attentionAreas.length ===
          0 ? (
            <div className="mt-5 flex min-w-0 items-start gap-3 rounded-2xl border border-[#CFE2D2] bg-[#F3FAF4] p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4D815A]" />

              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-[#3F6948]">
                  No automatic attention
                  areas were identified
                </p>

                <p className="mt-1 break-words text-sm leading-6 text-[#5E7363]">
                  The therapist should still
                  review all responses before
                  confirming the learner's
                  starting activities.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              {attentionAreas.map(
                (area) => (
                  <div
                    key={area.code}
                    className="min-w-0 rounded-2xl border border-[#E2D3E7] bg-[#FBF8FC] p-4"
                  >
                    <p className="break-words text-sm font-semibold text-[#493E4D]">
                      {area.title}
                    </p>

                    <p className="mt-1 break-words text-sm leading-6 text-[#706674]">
                      {
                        area.description
                      }
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        <InformationBox>
          The suggested Speech Ladder
          starting point and attention areas
          are preliminary. The therapist
          remains responsible for confirming
          the learner's level and selecting
          appropriate MOBI activities.
        </InformationBox>
      </div>
    );
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <CenterLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div
          ref={pageTopRef}
          className="min-h-full w-full min-w-0 scroll-mt-2 overflow-x-hidden bg-[#E4C9E5]/75 p-2 inter sm:rounded-[30px] sm:p-4 md:p-5 lg:p-7"
        >
          {/* HEADER */}

          <header className="mb-4 min-w-0 rounded-2xl border border-white/60 bg-white/55 p-4 backdrop-blur-sm sm:mb-5 sm:rounded-[24px] sm:px-6">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                {!sidebarOpen && (
                  <button
                    type="button"
                    onClick={() =>
                      setSidebarOpen(
                        true,
                      )
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm"
                    aria-label="Open sidebar"
                  >
                    ☰
                  </button>
                )}

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#826D8A] sm:text-xs">
                    Learner enrollment
                  </p>

                  <h1 className="mt-1 break-words text-lg font-semibold text-[#352D39] sm:text-xl md:text-2xl">
                    Enroll a new learner
                  </h1>

                  <p className="mt-1 max-w-3xl break-words text-xs leading-5 text-[#706675] sm:text-sm sm:leading-6">
                    Add the learner,
                    guardian, doctor, and
                    current Learner Intake
                    Profile.
                  </p>
                </div>
              </div>

              
            </div>
          </header>

          {/* STEPPER */}

          <div className="mb-4 min-w-0 rounded-2xl border border-white/60 bg-white/55 p-2 backdrop-blur-sm sm:mb-5 sm:rounded-[24px] sm:p-3">
            <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
              {steps.map(
                (step, index) => {
                  const StepIcon =
                    step.icon;

                  const isCurrent =
                    step.id ===
                    currentStep;

                  const isCompleted =
                    index <
                    currentStepIndex;

                  return (
                    <button
                      type="button"
                      key={step.id}
                      onClick={() =>
                        handleStepClick(
                          step.id,
                        )
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
                              ? "bg-[#76508C] text-white"
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
                            {
                              step.description
                            }
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
            {currentStep ===
              "learner" &&
              renderLearnerStep()}

            {currentStep ===
              "guardian" &&
              renderGuardianStep()}

            {currentStep ===
              "doctor" &&
              renderDoctorStep()}

            {currentStep ===
              "profile" &&
              renderProfileStep()}

            {currentStep ===
              "enroll" &&
              renderEnrollStep()}
          </main>

          {/* ACTIONS */}

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

                {currentStep !==
                  "learner" && (
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

              {currentStep !==
              "enroll" ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#76508C] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#67437C] sm:w-auto"
                >
                  {currentStep ===
                  "profile"
                    ? currentProfileSectionIndex <
                      profileSections.length -
                        1
                      ? "Next section"
                      : "Review enrollment"
                    : "Continue"}

                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={
                    isSubmitting
                  }
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