//mobi-web/src/components/center/materials/FeedbackStep.tsx


import { useState } from "react";
import {
  // Mic,
  ChevronDown,
  Volume2,
} from "lucide-react";

import VoiceStyleModal from "./VoiceStyleModal";
import StepMenu from "./StepMenu";
import { previewTTS } from "../../../services/activityApi";

type FeedbackStepData = {
  correct_feedback: string[];
  wrong_feedback: string[];
  max_attempts_feedback: string[];
  correct_voice_style: string;
  wrong_voice_style: string;
};

type FeedbackStepProps = {
  stepKey: string;
  onChange: (stepKey: string, data: FeedbackStepData) => void;
};

function FeedbackStep({ stepKey, onChange }: FeedbackStepProps) {
  const [correctInput, setCorrectInput] = useState("");
  const [wrongInput, setWrongInput] = useState("");
  const [maxAttemptsInput, setMaxAttemptsInput] = useState("");

  const [showCorrectMenu, setShowCorrectMenu] = useState(false);
  const [showWrongMenu, setShowWrongMenu] = useState(false);

  const [showCorrectVoiceModal, setShowCorrectVoiceModal] = useState(false);
  const [showWrongVoiceModal, setShowWrongVoiceModal] = useState(false);

  const [correctVoiceStyle, setCorrectVoiceStyle] = useState("Celebratory");
  const [wrongVoiceStyle, setWrongVoiceStyle] = useState("Encouraging");

  const [generatingVoice, setGeneratingVoice] = useState<
  "correct" | "wrong" | "max" | null>(null);

  const correctOptions = [
    "Good Job!",
    "Excellent!",
    "Awesome!",
    "Well Done!",
  ];

  const wrongOptions = [
    "Try Again",
    "Almost!",
    "Let's Try Again",
    "Keep Going!",
  ];

  const updateParent = (
    correct = correctInput,
    wrong = wrongInput,
    max = maxAttemptsInput,
    correctStyle = correctVoiceStyle,
    wrongStyle = wrongVoiceStyle
  ) => {
    onChange(stepKey, {
      correct_feedback: correct ? [correct] : [],
      wrong_feedback: wrong ? [wrong] : [],
      max_attempts_feedback: max ? [max] : [],
      correct_voice_style: correctStyle,
      wrong_voice_style: wrongStyle,
    });
  };

  const handlePreviewFeedback = async (
  type: "correct" | "wrong" | "max"
) => {
  const text =
    type === "correct"
      ? correctInput
      : type === "wrong"
      ? wrongInput
      : maxAttemptsInput;

  const style =
    type === "correct"
      ? correctVoiceStyle
      : type === "wrong"
      ? wrongVoiceStyle
      : "Encouraging";

  const emotion =
    type === "correct"
      ? "happy and warm"
      : "gentle and reassuring";

  try {
    if (!text.trim()) {
      alert("Please type feedback first.");
      return;
    }

    setGeneratingVoice(type);

    await previewTTS({
      text,
      voice: "Kore",
      style,
      emotion,
    });
  } catch (error) {
    console.error(error);
    alert("Failed to preview voice.");
  } finally {
    setGeneratingVoice(null);
  }
};

  return (
    <>
      <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E56B2F]"></div>

            <h3 className="font-semibold text-xl">
              Feedback Step
            </h3>
          </div>

          <StepMenu
            onMoveUp={() => console.log("Move Up")}
            onMoveDown={() => console.log("Move Down")}
            onDelete={() => console.log("Delete Step")}
          />
        </div>

        {/* BODY */}
        <div className="bg-[#E4C9E5]/70 px-6 pt-6 pb-16">
          {/* CORRECT FEEDBACK */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium">
                Correct Feedback
              </label>

             {/* <button
                type="button"
                disabled={generatingVoice === "correct"}
                onClick={() => handlePreviewFeedback("correct")}
                className={`
                  absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300
                  ${
                    generatingVoice === "correct"
                      ? "text-[#A85CB5] animate-pulse scale-110"
                      : "text-gray-500 hover:text-[#5B4B8A]"
                  }
                `}
              >
                <Volume2 size={20} />
              </button> */}
            </div>

            <div className="relative mb-3">
              <button
                type="button"
                onClick={() => setShowCorrectMenu(!showCorrectMenu)}
                className="flex h-12 w-full items-center justify-between border border-[#D58CE5] bg-white px-4 hover:bg-[#FAF5FB]"
              >
                <span
                  className={
                    correctInput ? "text-black" : "text-gray-400"
                  }
                >
                  {correctInput || "Select a default feedback"}
                </span>

                <ChevronDown
                  size={18}
                  className={`transition ${
                    showCorrectMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showCorrectMenu && (
                <div className="absolute z-20 w-full overflow-hidden border border-gray-200 bg-white shadow-lg">
                  {correctOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCorrectInput(item);
                        updateParent(item, wrongInput, maxAttemptsInput);
                        setShowCorrectMenu(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm hover:bg-[#F8EFFA]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={correctInput}
                placeholder="Or type your own feedback..."
                onChange={(e) => {
                  setCorrectInput(e.target.value);
                  updateParent(e.target.value, wrongInput, maxAttemptsInput);
                }}
                className="w-full border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
              />

              <button
                  type="button"
                  disabled={generatingVoice === "correct"}
                  onClick={() => handlePreviewFeedback("correct")}
                  className={`
                    absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300
                    ${
                      generatingVoice === "correct"
                        ? "text-[#A85CB5] animate-pulse scale-110"
                        : "text-gray-500 hover:text-[#5B4B8A]"
                    }
                  `}
                >
                  <Volume2 size={20} />
                </button>
            </div>
          </div>

          {/* WRONG FEEDBACK */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium">
                Wrong Feedback
              </label>

              {/* <button
                  type="button"
                  disabled={generatingVoice === "wrong"}
                  onClick={() => handlePreviewFeedback("wrong")}
                  className={`
                    absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300
                    ${
                      generatingVoice === "wrong"
                        ? "text-[#A85CB5] animate-pulse scale-110"
                        : "text-gray-500 hover:text-[#5B4B8A]"
                    }
                  `}
                >
                  <Volume2 size={20} />
                </button> */}
            </div>

            <div className="relative mb-3">
              <button
                type="button"
                onClick={() => setShowWrongMenu(!showWrongMenu)}
                className="flex h-12 w-full items-center justify-between border border-[#D58CE5] bg-white px-4 hover:bg-[#FAF5FB]"
              >
                <span
                  className={
                    wrongInput ? "text-black" : "text-gray-400"
                  }
                >
                  {wrongInput || "Select a default feedback"}
                </span>

                <ChevronDown
                  size={18}
                  className={`transition ${
                    showWrongMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showWrongMenu && (
                <div className="absolute z-20 w-full overflow-hidden border border-gray-200 bg-white shadow-lg">
                  {wrongOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setWrongInput(item);
                        updateParent(correctInput, item, maxAttemptsInput);
                        setShowWrongMenu(false);
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm hover:bg-[#F8EFFA]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={wrongInput}
                placeholder="Or type your own feedback..."
                onChange={(e) => {
                  setWrongInput(e.target.value);
                  updateParent(correctInput, e.target.value, maxAttemptsInput);
                }}
                className="w-full border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
              />

              <button
                type="button"
                disabled={generatingVoice === "wrong"}
                onClick={() => handlePreviewFeedback("wrong")}
                className={`
                  absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300
                  ${
                    generatingVoice === "wrong"
                      ? "text-[#A85CB5] animate-pulse scale-110"
                      : "text-gray-500 hover:text-[#5B4B8A]"
                  }
                `}
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>

          {/* MAX ATTEMPTS FEEDBACK */}
          <div className="mb-8">
            <label className="text-sm font-medium">
              Max Attempts Feedback
            </label>

            <div className="relative mt-3">
              <input
                type="text"
                value={maxAttemptsInput}
                placeholder="Example: Good effort. Let's move on."
                onChange={(e) => {
                  setMaxAttemptsInput(e.target.value);
                  updateParent(correctInput, wrongInput, e.target.value);
                }}
                className="w-full border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
              />

              <button
                type="button"
                disabled={generatingVoice === "max"}
                onClick={() => handlePreviewFeedback("max")}
                className={`
                  absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300
                  ${
                    generatingVoice === "max"
                      ? "text-[#A85CB5] animate-pulse scale-110"
                      : "text-gray-500 hover:text-[#5B4B8A]"
                  }
                `}
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <VoiceStyleModal
        isOpen={showCorrectVoiceModal}
        onClose={() => setShowCorrectVoiceModal(false)}
        selectedStyle={correctVoiceStyle}
        onSelectStyle={(style) => {
          setCorrectVoiceStyle(style);
          updateParent(correctInput, wrongInput, maxAttemptsInput, style, wrongVoiceStyle);
        }}
        stepType="feedbackCorrect"
      />

      <VoiceStyleModal
        isOpen={showWrongVoiceModal}
        onClose={() => setShowWrongVoiceModal(false)}
        selectedStyle={wrongVoiceStyle}
        onSelectStyle={(style) => {
          setWrongVoiceStyle(style);
          updateParent(correctInput, wrongInput, maxAttemptsInput, correctVoiceStyle, style);
        }}
        stepType="feedbackWrong"
      />
    </>
  );
}

export default FeedbackStep;