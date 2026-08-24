export type SpeakerStatus = "idle" | "speaking" | "userSpeaking";

export type PreviewMedia = {
  id?: string | number;
  type?: string;
  url?: string | null;
  name?: string | null;
};

export type PreviewChoice = {
  id: string | number;
  image_url?: string | null;
  url?: string | null;
  label?: string | null;
  text?: string | null;
  is_correct?: boolean | null;
  correct?: boolean | null;
};

export type PreviewStep = {
  id: string;
  step_order: number;
  step_type: string;

  instruction?: string | null;
  prompt?: string | null;
  question?: string | null;
  lesson?: string | null;

  correct_feedback?: string | null;
  wrong_feedback?: string | null;

  expected_answers?: string[] | null;
  accepted_variations?: string[] | null;

  media?: PreviewMedia[] | null;
  choices?: PreviewChoice[] | null;
  topics?: string[] | null;
  materials_needed?: string[] | null;

  image_url?: string | null;
  media_url?: string | null;
};

export type PreviewActivity = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  activity_steps?: PreviewStep[];
};

export function normalizeStepType(stepType?: string) {
  const type = (stepType || "")
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .trim();

  if (type.includes("choose")) return "choose";
  if (type.includes("feedback")) return "feedback";
  if (type.includes("conversation")) return "conversation";
  if (type.includes("teach")) return "teach";
  if (type.includes("do")) return "do";
  if (type.includes("ask")) return "ask";

  return "ask";
}

export function formatStepType(stepType?: string) {
  const type = normalizeStepType(stepType);

  if (type === "choose") return "Choose";
  if (type === "feedback") return "Feedback";
  if (type === "conversation") return "Conversation";
  if (type === "teach") return "Teach";
  if (type === "do") return "Do It";
  if (type === "ask") return "Ask";

  return "Step";
}

export function stepNeedsVoiceResponse(stepType?: string) {
  const type = normalizeStepType(stepType);

  return type === "ask" || type === "conversation" || type === "do";
}

export function getPromptText(step: PreviewStep) {
  return (
    step.prompt ||
    step.question ||
    step.instruction ||
    step.lesson ||
    step.correct_feedback ||
    step.wrong_feedback ||
    "Listen carefully and follow the activity."
  );
}

export function getStepMedia(step: PreviewStep): PreviewMedia[] {
  const media: PreviewMedia[] = [];

  if (step.media?.length) {
    media.push(...step.media);
  }

  if (step.image_url) {
    media.push({
      id: `${step.id}-image`,
      type: "image",
      url: step.image_url,
      name: "Step image",
    });
  }

  if (step.media_url) {
    media.push({
      id: `${step.id}-media`,
      type: "image",
      url: step.media_url,
      name: "Step media",
    });
  }

  return media;
}

export function getChoices(step: PreviewStep): PreviewChoice[] {
  if (step.choices?.length) {
    return step.choices;
  }

  if (step.expected_answers?.length) {
    return step.expected_answers.slice(0, 4).map((answer, index) => ({
      id: `${step.id}-choice-${index}`,
      label: answer,
      text: answer,
      is_correct: index === 0,
    }));
  }

  return [0, 1, 2, 3].map((index) => ({
    id: `${step.id}-empty-choice-${index}`,
  }));
}

export function getChoiceIsCorrect(choice?: PreviewChoice | null) {
  if (!choice) return null;

  if (typeof choice.is_correct === "boolean") return choice.is_correct;
  if (typeof choice.correct === "boolean") return choice.correct;

  return null;
}

export function getFeedbackText(
  step: PreviewStep,
  lastResultCorrect?: boolean | null
) {
  if (lastResultCorrect === false) {
    return step.wrong_feedback || getPromptText(step);
  }

  return step.correct_feedback || getPromptText(step);
}