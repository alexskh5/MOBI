import { useState } from "react";
import {
  Mic,
  ChevronDown,
  Volume2,
} from "lucide-react";

import VoiceStyleModal from "./VoiceStyleModal";
import StepMenu from "./StepMenu";

function FeedbackStep() {
  const [correctInput, setCorrectInput] =
    useState("");

  const [wrongInput, setWrongInput] =
    useState("");

  const [showCorrectMenu, setShowCorrectMenu] =
    useState(false);

  const [showWrongMenu, setShowWrongMenu] =
    useState(false);

  const [showCorrectVoiceModal, setShowCorrectVoiceModal] =
    useState(false);

  const [showWrongVoiceModal, setShowWrongVoiceModal] =
    useState(false);

  const [correctVoiceStyle, setCorrectVoiceStyle] =
    useState("Celebratory");

  const [wrongVoiceStyle, setWrongVoiceStyle] =
    useState("Encouraging");


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

          {/* MENU */}
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

              <button
                type="button"
                onClick={() =>
                  setShowCorrectVoiceModal(true)
                }
                className="flex items-center gap-2 rounded-full border border-[#D58CE5] bg-[#F8EFF9] px-3 py-1 text-[#A85CB5]"
              >
                <Mic size={16} />

                <span className="text-sm">
                  {correctVoiceStyle}
                </span>

                <ChevronDown size={16} />
              </button>

            </div>

            <div className="relative mb-3">

              <button
                type="button"
                onClick={() =>
                  setShowCorrectMenu(!showCorrectMenu)
                }
                className="flex h-12 w-full items-center justify-between border border-[#D58CE5] bg-white px-4 hover:bg-[#FAF5FB]"
              >

                <span
                  className={
                    correctInput
                      ? "text-black"
                      : "text-gray-400"
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
                onChange={(e) =>
                  setCorrectInput(e.target.value)
                }
                className="w-full border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <Volume2 size={20}/>
              </button>

            </div>

          </div>

          {/* WRONG FEEDBACK */}
          <div className="mb-8">

            <div className="mb-3 flex items-center justify-between">

              <label className="text-sm font-medium">
                Wrong Feedback
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowWrongVoiceModal(true)
                }
                className="flex items-center gap-2 rounded-full border border-[#D58CE5] bg-[#F8EFF9] px-3 py-1 text-[#A85CB5]"
              >
                <Mic size={16} />

                <span className="text-sm">
                  {wrongVoiceStyle}
                </span>

                <ChevronDown size={16} />
              </button>

            </div>

            <div className="relative mb-3">

              <button
                type="button"
                onClick={() =>
                  setShowWrongMenu(!showWrongMenu)
                }
                className="flex h-12 w-full items-center justify-between border border-[#D58CE5] bg-white px-4 hover:bg-[#FAF5FB]"
              >

                <span
                  className={
                    wrongInput
                      ? "text-black"
                      : "text-gray-400"
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
                onChange={(e) =>
                  setWrongInput(e.target.value)
                }
                className="w-full border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <Volume2 size={20}/>
              </button>

            </div>

          </div>

        </div>

      </div>
      <VoiceStyleModal
        isOpen={showCorrectVoiceModal}
        onClose={() =>
          setShowCorrectVoiceModal(false)
        }
        selectedStyle={correctVoiceStyle}
        onSelectStyle={setCorrectVoiceStyle}
        stepType="feedbackCorrect"
      />

      <VoiceStyleModal
        isOpen={showWrongVoiceModal}
        onClose={() =>
          setShowWrongVoiceModal(false)
        }
        selectedStyle={wrongVoiceStyle}
        onSelectStyle={setWrongVoiceStyle}
        stepType="feedbackWrong"
      />
     </> 
  );
}

export default FeedbackStep;