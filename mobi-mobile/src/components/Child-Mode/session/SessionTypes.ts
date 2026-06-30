export type SessionStatus = 'intro' | 'active' | 'completed';

export type SpeakerStatus = 'idle' | 'appSpeaking' | 'userSpeaking';

export type ActivitySessionStepType =
  | 'teach'
  | 'show_choose'
  | 'ask'
  | 'conversation'
  | 'do_it'
  | 'feedback';

export type MediaType = 'image' | 'video' | 'audio' | 'file';

export type SessionMedia = {
  id: number;
  type: MediaType;
  url?: string;
  name?: string;
};

export type ChoiceOption = {
  id: number;
  label: string;
  image_url?: string;
  is_correct: boolean;
};

export type ActivitySessionStep = {
  id: number;
  step_order: number;
  step_type: ActivitySessionStepType;

  prompt?: string;
  instruction?: string;
  lesson?: string;
  question?: string;

  media?: SessionMedia[];

  expected_answers?: string[];
  accepted_variations?: string[];

  choices?: ChoiceOption[];

  topics?: string[];

  materials_needed?: string[];

  correct_feedback?: string;
  wrong_feedback?: string;

  ai_voice_style?: string;

  can_repeat?: boolean;
  can_give_hint?: boolean;
  can_skip?: boolean;
};

export type StepResult = {
  step_id: number;
  step_order: number;
  step_type: ActivitySessionStepType;

  prompt: string;

  learner_response: string;
  selected_choice_id?: number | null;

  is_correct: boolean | null;

  attempts: number;

  started_at: string;
  answered_at: string;
};

export type RuntimeActivity = {
  id: number;
  title: string;

  level?: string;
  category?: string;
  difficulty?: string;

  activity_image_url?: string;

  teach_prompt?: string;
  ask_prompt?: string;

  target_answers?: string;
  acceptable_answers?: string;

  next_activity?: string;

  steps?: ActivitySessionStep[];
};

export type BaseStepProps = {
  step: ActivitySessionStep;

  imageSize: {
    width: number;
    height: number;
  };

  lastLearnerResponse: string;

  onReplayPrompt: () => void;

  fallbackImage?: any;
};

export function getPromptText(step: ActivitySessionStep) {
  return (
    step.prompt ||
    step.question ||
    step.lesson ||
    step.instruction ||
    step.correct_feedback ||
    step.wrong_feedback ||
    'Let us continue.'
  );
}
