import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

type Activity = {
  id: number;
  title: string;
  level: string;
  category: string;
  difficulty: string;
  target_answers: string;
  acceptable_answers: string;
  teach_prompt: string;
  teach_tone: string;
  ask_prompt: string;
  max_attempts: number;
  hint1: string;
  hint2: string;
  hint3: string;
  correct_prompt: string;
  correct_tone: string;
  reward: string;
  support_prompt: string;
  support_tone: string;
  failed_action: string;
};

export default function ActivityPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [step, setStep] = useState<"teach" | "ask" | "correct" | "support">(
    "teach"
  );

  useEffect(() => {
    const fetchActivity = async () => {
      const response = await api.get("/activities");
      const found = response.data.find(
        (item: Activity) => String(item.id) === String(id)
      );
      setActivity(found || null);
    };

    fetchActivity();
  }, [id]);

  const speak = (text: string) => {
    if (!text?.trim()) {
      alert("No prompt to preview.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <p>Loading activity...</p>
      </div>
    );
  }

  const currentText =
    step === "teach"
      ? activity.teach_prompt
      : step === "ask"
      ? activity.ask_prompt
      : step === "correct"
      ? activity.correct_prompt
      : activity.support_prompt;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/activities")}
          className="mb-6 rounded-xl border bg-white px-4 py-2 text-gray-700"
        >
          ← Back to Library
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <main className="bg-white rounded-3xl shadow-sm border p-6 md:p-8">
            <p className="text-sm font-semibold text-purple-600">
              {activity.level} • {activity.category}
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mt-2">
              {activity.title}
            </h1>

            <p className="text-gray-500 mt-2">
              Target Answer: {activity.target_answers}
            </p>

            <div className="mt-8 rounded-3xl bg-purple-50 p-8 text-center">
              <p className="text-sm uppercase tracking-wide text-purple-500 font-bold">
                {step.toUpperCase()} STEP
              </p>

              <h2 className="text-2xl font-bold text-purple-900 mt-4">
                {currentText || "No prompt added."}
              </h2>

              <button
                onClick={() => speak(currentText)}
                className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
              >
                Play TTS Prompt
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setStep("teach")}
                className="rounded-xl bg-gray-100 px-4 py-2 font-semibold"
              >
                Teach
              </button>
              <button
                onClick={() => setStep("ask")}
                className="rounded-xl bg-gray-100 px-4 py-2 font-semibold"
              >
                Ask
              </button>
              <button
                onClick={() => setStep("correct")}
                className="rounded-xl bg-green-100 px-4 py-2 font-semibold text-green-700"
              >
                Correct Feedback
              </button>
              <button
                onClick={() => setStep("support")}
                className="rounded-xl bg-orange-100 px-4 py-2 font-semibold text-orange-700"
              >
                Needs Support
              </button>
            </div>
          </main>

          <aside className="bg-white rounded-3xl shadow-sm border p-6 h-fit">
            <h2 className="font-bold text-gray-800">Activity Settings</h2>

            <div className="mt-5 space-y-4 text-sm">
              <Info label="Difficulty" value={activity.difficulty} />
              <Info label="Max Attempts" value={String(activity.max_attempts)} />
              <Info label="Hints" value={[activity.hint1, activity.hint2, activity.hint3].filter(Boolean).join(" → ") || "No hints"} />
              <Info label="Reward" value={activity.reward} />
              <Info label="Failed Action" value={activity.failed_action} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b pb-3">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}