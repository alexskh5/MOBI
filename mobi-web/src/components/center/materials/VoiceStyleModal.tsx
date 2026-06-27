import { useState } from "react";
import {
  X,
  BookOpen,
  Smile,
  Sparkles,
  Leaf,
  HeartHandshake,
  CircleHelp,
  BadgeCheck,
  Trophy,
  Heart,
  Play,
  ChevronDown,
  Volume2,
  Gauge,
  UserRound,
} from "lucide-react";

interface VoiceStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStyle: string;
  onSelectStyle: (style: string) => void;
  stepType:
    | "teach"
    | "ask"
    | "feedbackCorrect"
    | "feedbackWrong";
}

function VoiceStyleModal({
  isOpen,
  onClose,
  selectedStyle,
  onSelectStyle,
  stepType,
}: VoiceStyleModalProps) {
  if (!isOpen) return null;

  const voiceStyles = {
    teach: [
      {
        title: "Teaching",
        description:
          "Clear, patient, and instructional. Ideal for introducing new concepts.",
        icon: BookOpen,
      },
      {
        title: "Friendly",
        description:
          "Warm and conversational to keep learners comfortable.",
        icon: Smile,
      },
      {
        title: "Cheerful",
        description:
          "Energetic and engaging to capture attention.",
        icon: Sparkles,
      },
      {
        title: "Calm",
        description:
          "Soft and soothing for learners needing a relaxed pace.",
        icon: Leaf,
      },
      {
        title: "Gentle",
        description:
          "Slow, reassuring, and encouraging.",
        icon: HeartHandshake,
      },
    ],

    ask: [
      {
        title: "Curious",
        description:
          "Sounds like asking a genuine question.",
        icon: CircleHelp,
      },
      {
        title: "Friendly",
        description:
          "Warm and inviting.",
        icon: Smile,
      },
      {
        title: "Neutral",
        description:
          "Simple and direct.",
        icon: Volume2,
      },
      {
        title: "Patient",
        description:
          "Allows the learner time to think.",
        icon: HeartHandshake,
      },
    ],

    feedbackCorrect: [
      {
        title: "Celebratory",
        description:
          "Excited and rewarding.",
        icon: Trophy,
      },
      {
        title: "Proud",
        description:
          "Shows genuine happiness.",
        icon: BadgeCheck,
      },
      {
        title: "Motivating",
        description:
          "Encourages continued effort.",
        icon: Sparkles,
      },
      {
        title: "Warm Praise",
        description:
          "Positive but not overly energetic.",
        icon: Heart,
      },
    ],

    feedbackWrong: [
      {
        title: "Encouraging",
        description:
          "Gently encourages another try.",
        icon: HeartHandshake,
      },
      {
        title: "Supportive",
        description:
          "Makes the learner feel safe.",
        icon: Heart,
      },
      {
        title: "Patient",
        description:
          "Never sounds frustrated.",
        icon: Smile,
      },
      {
        title: "Gentle",
        description:
          "Soft and reassuring.",
        icon: Leaf,
      },
    ],
  };

  const styles = voiceStyles[stepType];

  const selected =
    styles.find(
      (style) => style.title === selectedStyle
    ) || styles[0];

  const SelectedIcon = selected.icon;

  const [showStyleMenu, setShowStyleMenu] =
    useState(false);
    
  const [useActivityDefault, setUseActivityDefault] =
    useState(true); 

  // temporary rani since dat ifetch man niya ang naset didto globally as ai voice setting sa ubos
  const [voice, setVoice] = useState("Girl");
  const [speed, setSpeed] = useState("Moderate");

  const [showVoiceMenu, setShowVoiceMenu] =
    useState(false);

  const [showSpeedMenu, setShowSpeedMenu] =
    useState(false);

  return (
    <div className="inter fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-3xl rounded-[28px] bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-8 py-6">
          <h2 className="text-[32px] font-semibold">
            Voice Settings
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition"
          >
            <X size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">

          {/* Activity Default */}
          <button
            type="button"
            onClick={() =>
              setUseActivityDefault(!useActivityDefault)
            }
            className="w-full rounded-2xl border border-[#F0DDF5] bg-[#F8EFFA] p-5 text-left transition hover:bg-[#F5E8F8]"
          >

            <div className="flex gap-4">

              <div
                className={`mt-1 flex h-6 w-6 items-center justify-center rounded-md border transition ${
                  useActivityDefault
                    ? "border-[#C46DD8] bg-[#C46DD8] text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {useActivityDefault && "✓"}
              </div>

              <div>

                <h3 className="font-semibold text-lg">
                  Use Activity Default
                </h3>

                <p className="text-gray-500">
                  This step will use the AI voice settings
                  configured for this activity.
                </p>

              </div>

            </div>

          </button>

          <div className="my-8 border-t border-gray-200" />

          {/* Inherited Settings */}

          <div className="grid grid-cols-3 gap-5">

            {/* Voice */}
            <div>

              <p className="font-medium mb-2">
                Speed
                <span className="text-gray-500 font-normal">
                  {" "}
                  (from activity)
                </span>
              </p>

              <div className="relative">

                <button
                  type="button"
                  disabled={useActivityDefault}
                  onClick={() =>
                    setShowVoiceMenu(!showVoiceMenu)
                  }
                  className={`h-12 w-full rounded-xl border px-4 flex items-center justify-between transition ${
                    useActivityDefault
                      ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-[#D58CE5] bg-white hover:bg-[#FAF5FB]"
                  }`}
                >

                  <div className="flex items-center gap-2">
                    <UserRound size={18} />
                    <span>{voice}</span>
                  </div>

                  {!useActivityDefault && (
                    <ChevronDown size={18} />
                  )}

                </button>

                {!useActivityDefault && showVoiceMenu && (

                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">

                    {["Girl", "Boy"].map((item) => (

                      <button
                        key={item}
                        onClick={() => {

                          setVoice(item);

                          setShowVoiceMenu(false);

                        }}
                        className="block w-full px-4 py-3 text-left hover:bg-[#F8EFFA]"
                      >
                        {item}
                      </button>

                    ))}

                  </div>

                )}

              </div>

            </div>

            {/* Speed */}

            <div>

              <p className="font-medium mb-2">
                Speed
                <span className="text-gray-500 font-normal">
                  {" "}
                  (from activity)
                </span>
              </p>

              <div className="relative">

                <button
                  type="button"
                  disabled={useActivityDefault}
                  onClick={() =>
                    setShowSpeedMenu(!showSpeedMenu)
                  }
                  className={`h-12 w-full rounded-xl border px-4 flex items-center justify-between transition ${
                    useActivityDefault
                      ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-[#D58CE5] bg-white hover:bg-[#FAF5FB]"
                  }`}
                >

                  <div className="flex items-center gap-2">
                    <Gauge size={18} />
                    <span>{speed}</span>
                  </div>

                  {!useActivityDefault && (
                    <ChevronDown size={18} />
                  )}

                </button>

                {!useActivityDefault && showSpeedMenu && (

                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">

                    {[
                      "Slow",
                      "Moderate",
                      "Fast",
                    ].map((item) => (

                      <button
                        key={item}
                        onClick={() => {

                          setSpeed(item);

                          setShowSpeedMenu(false);

                        }}
                        className="block w-full px-4 py-3 text-left hover:bg-[#F8EFFA]"
                      >
                        {item}
                      </button>

                    ))}

                  </div>

                )}

              </div>

            </div>

            {/* Voice Style */}

            <div className="relative">

              <p className="font-medium mb-2">
                Voice Style
                <span className="text-gray-500 font-normal">
                  {" "}
                  (for this step)
                </span>
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowStyleMenu(!showStyleMenu)
                }
                className="w-full h-12 rounded-xl border border-[#D58CE5] px-4 flex items-center justify-between bg-white hover:bg-[#FAF5FB]"
              >

                <span>{selected.title}</span>

                <ChevronDown
                  size={18}
                  className={`transition ${
                    showStyleMenu ? "rotate-180" : ""
                  }`}
                />

              </button>

              {showStyleMenu && (

                <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">

                  {styles.map((style) => (

                    <button
                      key={style.title}
                      onClick={() => {

                        onSelectStyle(style.title);

                        setShowStyleMenu(false);

                      }}
                      className={`block w-full px-4 py-3 text-left transition ${
                        selectedStyle === style.title
                          ? "bg-[#F8EFFA] text-[#B25AC7] font-medium"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {style.title}
                    </button>

                  ))}

                </div>

              )}

            </div>

          </div>

          {/* details */}
          <div className="mt-8 rounded-2xl bg-[#F8EFFA] border border-[#F0DDF5] p-5">

            <div className="flex gap-4">

              <SelectedIcon
                size={22}
                className="mt-1 text-[#B25AC7]"
              />

              <div>

                <h3 className="font-semibold text-lg">
                  {selected.title}
                </h3>

                <p className="mt-1 text-gray-500">
                  {selected.description}
                </p>

              </div>

            </div>

          </div>

          {/* Footer */}

          <div className="mt-8 flex items-center justify-between">

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[#D58CE5] px-5 py-3 text-[#B25AC7] hover:bg-[#F8EFFA] transition"
            >
              <Play size={18} />

              <span className="font-medium">
                Preview Voice
              </span>
            </button>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#B25AC7] px-6 py-3 font-medium text-white hover:bg-[#A14AB9] transition"
              >
                Save
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default VoiceStyleModal;