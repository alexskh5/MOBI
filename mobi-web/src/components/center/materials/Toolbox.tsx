import { Link } from "react-router-dom";

interface ToolboxProps {
  onAddStep: (
    stepType: string
  ) => void;

  onSkillArea: () => void;
  onDescription: () => void;
  onThumbnail: () => void;
  onAIVoice: () => void;
  onAssignLearner: () => void;
}

function Toolbox({
    onAddStep,
    onSkillArea,
    onDescription,
    onThumbnail,
    onAIVoice,
    onAssignLearner,
  }: ToolboxProps) {
  return (
    <div className="inter bg-white border border-[#E59BE7] rounded-[30px] h-full flex flex-col">

      {/* FIXED TITLE */}
      <div className="p-3 border-b border-[#E59BE7] bg-white shrink-0 rounded-t-[30px] flex justify-center font-semibold">
        <h2 className="font-itim text-2xl">
          Toolbox Steps
        </h2>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">

        {/* INFO */}
        <div className="border-t border-[#E59BE7] px-4 py-3 text-xs text-gray-500">
          Drag steps on activity builder timeline.
          <br />
          For clarifications, read tutorial below.
        </div>

        {/* TEACHING STEPS */}
        <div className="border-t border-[#E59BE7] p-4">

          <p className="text-xs text-gray-500 mb-4">
            Teaching Steps
          </p>

          <div className="space-y-1">

            <button
              onClick={() =>
                onAddStep("Teach")
              }
              className="flex items-center gap-4 w-full text-left hover:bg-[#F8EEF8] p-2 rounded-xl transition"
            >
              <span className="w-6 h-6 rounded-full bg-[#AAB7DA] shrink-0"></span>

              <span className="font-semibold text-lg">
                Teach
              </span>
            </button>

            <button
              onClick={() =>
                onAddStep("Show & Choose")
              }
              className="flex items-center gap-4 w-full text-left hover:bg-[#F8EEF8] p-2 rounded-xl transition"
            >
              <span className="w-6 h-6 rounded-full bg-[#F6A609] shrink-0"></span>

              <span className="font-semibold text-lg">
                Show & Choose
              </span>
            </button>

          </div>

        </div>

        {/* INTERACTION STEPS */}
        <div className="border-t border-[#E59BE7] p-4">

          <p className="text-xs text-gray-500 mb-4">
            Interaction Steps
          </p>

          <div className="space-y-1">

            <button
              onClick={() =>
                onAddStep("Ask")
              }
              className="flex items-center gap-4 w-full text-left hover:bg-[#F8EEF8] p-2 rounded-xl transition"
            >
              <span className="w-6 h-6 rounded-full bg-[#7B5A43] shrink-0"></span>

              <span className="font-semibold text-lg">
                Ask
              </span>
            </button>

            <button
              onClick={() =>
                onAddStep("Conversation")
              }
              className="flex items-center gap-4 w-full text-left hover:bg-[#F8EEF8] p-2 rounded-xl transition"
            >
              <span className="w-6 h-6 rounded-full bg-[#E38AE5] shrink-0"></span>

              <span className="font-semibold text-lg">
                Conversation
              </span>
            </button>

            <button
              onClick={() =>
                onAddStep("Learn by Doing")
              }
              className="flex items-center gap-4 w-full text-left hover:bg-[#F8EEF8] p-2 rounded-xl transition"
            >
              <span className="w-6 h-6 rounded-full bg-[#B9D46B] shrink-0"></span>

              <span className="font-semibold text-lg">
                Do It
              </span>
            </button>

          </div>

        </div>

        {/* FEEDBACK */}
        <div className="border-t border-[#E59BE7] p-4">

          <p className="text-xs text-gray-500 mb-4">
            Feedback Step
          </p>

          <button
            onClick={() =>
              onAddStep("Feedback")
            }
            className="flex items-center gap-4 w-full text-left hover:bg-[#F8EEF8] p-2 rounded-xl transition"
          >
            <span className="w-6 h-6 rounded-full bg-[#E6672C] shrink-0"></span>

            <span className="font-semibold text-lg">
              Feedback
            </span>
          </button>

        </div>

        {/* OPTIONS */}
        <div className="border-t border-[#E59BE7] p-4">

          <div className="space-y-4 font-semibold">

            <button
              onClick={onSkillArea}
              className="block w-full text-left hover:text-purple-600 transition"
            >
              Skill area
            </button>

            <button
              onClick={onDescription}
              className="block w-full text-left hover:text-purple-600 transition"
            >
              Add description
            </button>

            <button
              onClick={onThumbnail}
              className="block w-full text-left hover:text-purple-600 transition"
            >
              Add thumbnail
            </button>

            <button 
              onClick={onAIVoice}
              className="block w-full text-left hover:text-purple-600 transition"
            >
              AI Voice
            </button>

            <button 
              onClick={onAssignLearner}
              className="block w-full text-left hover:text-purple-600 transition"
            >
              Assign to a learner/s
            </button>

          </div>

        </div>

      </div>

      {/* FIXED FOOTER */}
      <div className="border-t border-[#E59BE7] p-3 shrink-0 text-center">
        {/* insert later vid tutorial */}
        <Link
          to="/center/materials/tutorial"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
        >
          Read Build Activity Tutorial {" > "}
        </Link>

      </div>

    </div>
  );
}

export default Toolbox;