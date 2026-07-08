// mobi-web/src/constants/voiceDefaults.ts

export const STEP_VOICE_DEFAULTS = {
  teach: {
    style: "Teaching",
    emotion: "Calm",
  },
  ask: {
    style: "Curious",
    emotion: "Gentle",
  },
  show_choose: {
    style: "Friendly",
    emotion: "Encouraging",
  },
  conversation: {
    style: "Conversation",
    emotion: "Warm",
  },
  do_it: {
    style: "Coaching",
    emotion: "Motivating",
  },
  feedback_correct: {
    style: "Celebratory",
    emotion: "Happy",
  },
  feedback_wrong: {
    style: "Encouraging",
    emotion: "Gentle",
  },
  feedback_max_attempts: {
    style: "Reassuring",
    emotion: "Calm",
  },
};

export const VOICE_STYLE_PROMPTS = {
  Teaching:
    "Speak like a pediatric speech therapist teaching a young autistic child. Be clear, slow, patient, and easy to understand.",

  Curious:
    "Speak with gentle curiosity. Encourage the child to answer without pressure.",

  Friendly:
    "Speak warmly and naturally, like a kind and trusted helper.",

  Conversation:
    "Speak naturally as if having a relaxed conversation with a young child.",

  Coaching:
    "Speak like a supportive coach guiding the child through an action. Be motivating but calm.",

  Celebratory:
    "Celebrate success with genuine happiness, but stay calm and not overwhelming.",

  Encouraging:
    "Speak gently and supportively. Never sound disappointed. Help the child feel safe to try again.",

  Reassuring:
    "Speak calmly and comfortingly. Help the child move on without feeling wrong or pressured.",
};

export const VOICE_EMOTION_PROMPTS = {
  Calm:
    "Use a calm and relaxing tone.",
  Gentle:
    "Use a gentle and comforting tone.",
  Happy:
    "Sound cheerful and positive.",
  Warm:
    "Sound warm, friendly, and human.",
  Encouraging:
    "Sound supportive and patient.",
  Motivating:
    "Sound encouraging and action-oriented, but not too energetic.",
};