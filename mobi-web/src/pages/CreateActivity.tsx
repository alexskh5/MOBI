import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const speechLevels = ["SOUND", "SYLLABLE", "WORD", "PHRASE", "SENTENCE", "CONVERSING"];

const categories = [
  "Family Vocabulary",
  "Daily Objects",
  "Food & Drinks",
  "Animals",
  "Body Parts",
  "Greetings",
  "Emotions",
  "Actions",
  "Needs & Requests",
  "Social Responses",
  "Following Instructions",
  "Yes/No Responses",
];

const difficulties = [
  "Level 1 - Beginner",
  "Level 2 - Intermediate",
  "Level 3 - Advanced",
];

const tones = ["Gentle", "Calm", "Cheerful", "Encouraging"];

const failedActions = [
  "Repeat with next hint",
  "Choose easier activity",
  "Take short break",
  "Move to different activity",
];

export default function CreateActivity() {
  const [form, setForm] = useState({
    title: "",
    level: "SOUND",
    category: "Family Vocabulary",
    difficulty: "Level 1 - Beginner",
    targetAnswers: "",
    acceptableAnswers: "",
    nextActivity: "",
    teachPrompt: "",
    teachTone: "Gentle",
    askPrompt: "",
    maxAttempts: "3",
    hint1: "",
    hint2: "",
    hint3: "",
    correctPrompt: "",
    correctTone: "Cheerful",
    reward: "Star",
    supportPrompt: "That’s okay. Let’s try another one.",
    supportTone: "Gentle",
    failedAction: "Repeat with next hint",
  });

  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const speak = (text: string) => {
    if (!text.trim()) {
      alert("No prompt to preview.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support speech preview.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Please enter an activity title.");
      return;
    }

    if (!form.targetAnswers.trim()) {
      alert("Please enter at least one target answer.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.post("/activities", form);
      console.log("Saved activity:", response.data);
      alert("Activity saved to database successfully!");
    } catch (error) {
      console.error("Save activity error:", error);
      alert("Failed to save activity. Make sure backend is running.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
  <button
    type="button"
    onClick={() => navigate("/dashboard")}
    className="mb-4 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
  >
    ← Back to Dashboard
  </button>

  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
    Create Activity
  </h1>

  <p className="text-gray-500 mt-1">
    Build a structured MOBI activity using the Speech Ladder model.
  </p>
</div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <Section title="1. Basic Details">
              <Input
                label="Activity Title"
                placeholder="Example: Say Mama"
                value={form.title}
                onChange={(value) => updateForm("title", value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Speech Ladder Level"
                  value={form.level}
                  options={speechLevels}
                  onChange={(value) => updateForm("level", value)}
                />

                <Select
                  label="Category"
                  value={form.category}
                  options={categories}
                  onChange={(value) => updateForm("category", value)}
                />

                <Select
                  label="Difficulty"
                  value={form.difficulty}
                  options={difficulties}
                  onChange={(value) => updateForm("difficulty", value)}
                />
              </div>
            </Section>

            <Section title="2. Expected Response">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="Target Answers"
                  placeholder="Example: mama, mommy"
                  value={form.targetAnswers}
                  onChange={(value) => updateForm("targetAnswers", value)}
                  helper="Separate multiple answers with commas."
                />

                <Textarea
                  label="Acceptable Answers / Synonyms"
                  placeholder="Example: mom, mother"
                  value={form.acceptableAnswers}
                  onChange={(value) => updateForm("acceptableAnswers", value)}
                  helper="Used for flexible intent matching."
                />
              </div>
            </Section>

            <Section title="3. Learning Progression Optional">
              <Input
                label="Recommended Next Activity if Mastered"
                placeholder="Example: I want mama - Phrase"
                value={form.nextActivity}
                onChange={(value) => updateForm("nextActivity", value)}
                helper="Optional recommendation for the next learning step after mastery."
              />
            </Section>

            <Section title="4. Teach Step">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Upload Teaching Media
                </label>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports image, video, or audio. File upload will be connected to Firebase Storage later.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
                <Textarea
                  label="Teaching Prompt for TTS"
                  placeholder="Example: This is mama. Say mama."
                  value={form.teachPrompt}
                  onChange={(value) => updateForm("teachPrompt", value)}
                />

                <Select
                  label="TTS Tone"
                  value={form.teachTone}
                  options={tones}
                  onChange={(value) => updateForm("teachTone", value)}
                />
              </div>
            </Section>

            <Section title="5. Ask Step">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4">
                <Textarea
                  label="Question Prompt for TTS"
                  placeholder="Example: Can you say mama?"
                  value={form.askPrompt}
                  onChange={(value) => updateForm("askPrompt", value)}
                />

                <Select
                  label="Max Attempts"
                  value={form.maxAttempts}
                  options={["1", "2", "3"]}
                  onChange={(value) => updateForm("maxAttempts", value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Hint / Model Prompt 1"
                  placeholder="This is mama."
                  value={form.hint1}
                  onChange={(value) => updateForm("hint1", value)}
                />

                <Input
                  label="Hint / Model Prompt 2"
                  placeholder="Say ma-ma."
                  value={form.hint2}
                  onChange={(value) => updateForm("hint2", value)}
                />

                <Input
                  label="Hint / Model Prompt 3"
                  placeholder="Let’s try together: mama."
                  value={form.hint3}
                  onChange={(value) => updateForm("hint3", value)}
                />
              </div>
            </Section>

            <Section title="6. Feedback & Adaptive Behavior">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px] gap-4">
                <Textarea
                  label="Correct Feedback Prompt"
                  placeholder="Example: Great job! You said mama."
                  value={form.correctPrompt}
                  onChange={(value) => updateForm("correctPrompt", value)}
                />

                <Select
                  label="Tone"
                  value={form.correctTone}
                  options={tones}
                  onChange={(value) => updateForm("correctTone", value)}
                />

                <Select
                  label="Reward"
                  value={form.reward}
                  options={["Star", "Confetti", "Happy GIF", "None"]}
                  onChange={(value) => updateForm("reward", value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_240px] gap-4">
                <Textarea
                  label="Needs Support Prompt"
                  placeholder="That’s okay. Let’s try another one."
                  value={form.supportPrompt}
                  onChange={(value) => updateForm("supportPrompt", value)}
                />

                <Select
                  label="Tone"
                  value={form.supportTone}
                  options={tones}
                  onChange={(value) => updateForm("supportTone", value)}
                />

                <Select
                  label="After Failed Attempts"
                  value={form.failedAction}
                  options={failedActions}
                  onChange={(value) => updateForm("failedAction", value)}
                />
              </div>
            </Section>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
              >
                {isSaving ? "Saving..." : "Save Activity"}
              </button>
            </div>
          </div>

          <aside className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit xl:sticky xl:top-8">
            <h2 className="text-lg font-bold text-gray-800">Activity Preview</h2>
            <p className="text-sm text-gray-500 mt-1">
              Quick summary of what the learner will experience.
            </p>

            <div className="mt-6 space-y-4">
              <PreviewRow label="Title" value={form.title || "Untitled Activity"} />
              <PreviewRow label="Level" value={form.level} />
              <PreviewRow label="Category" value={form.category} />
              <PreviewRow label="Difficulty" value={form.difficulty} />
              <PreviewRow label="Target" value={form.targetAnswers || "No target yet"} />
              <PreviewRow label="Next Activity" value={form.nextActivity || "None"} />
            </div>

            <div className="mt-6 rounded-2xl bg-purple-50 p-4">
              <p className="text-sm font-bold text-purple-700">Learner Flow</p>
              <ol className="text-sm text-purple-900 mt-3 space-y-2 list-decimal list-inside">
                <li>Teach using media and TTS</li>
                <li>Ask learner to respond</li>
                <li>Evaluate answer using STT</li>
                <li>Give hint, feedback, or adapt</li>
              </ol>
            </div>

            <div className="mt-6 space-y-3">
              <PreviewButton label="Listen to Teach Prompt" onClick={() => speak(form.teachPrompt)} className="bg-purple-600 hover:bg-purple-700" />
              <PreviewButton label="Listen to Ask Prompt" onClick={() => speak(form.askPrompt)} className="bg-blue-600 hover:bg-blue-700" />
              <PreviewButton label="Listen to Correct Feedback" onClick={() => speak(form.correctPrompt)} className="bg-green-600 hover:bg-green-700" />
              <PreviewButton label="Listen to Needs Support Prompt" onClick={() => speak(form.supportPrompt)} className="bg-orange-500 hover:bg-orange-600" />

              <button
                type="button"
                onClick={stopSpeech}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Stop Voice Preview
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  helper,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  );
}

function Textarea({
  label,
  placeholder,
  value,
  onChange,
  helper,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        className="mt-2 min-h-28 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <select
        className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function PreviewButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 font-semibold text-white ${className}`}
    >
      {label}
    </button>
  );
}