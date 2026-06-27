import { useState } from "react";

const speechLevels = [
  "Sound",
  "Syllable",
  "Word",
  "Phrase",
  "Sentence",
  "Conversation",
];

function ActivitySpeechLadder() {
  const [selectedLevel, setSelectedLevel] =
    useState(0);

  return (
    <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

      {/* HEADER */}
      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">

        <h3 className="font-semibold text-xl">
          The activity belongs in the speech ladder:
          (Required)
        </h3>

        <button className="text-2xl">
          ⋯
        </button>

      </div>

      {/* BODY */}
      <div className="bg-white px-8 py-6">

        {/* LINE */}
        <div className="relative">

          <div className="absolute top-3 left-0 right-0 h-1 bg-gray-400 rounded-full"></div>

          <div className="grid grid-cols-6 relative">

            {speechLevels.map(
              (level, index) => (
                <button
                  key={level}
                  onClick={() =>
                    setSelectedLevel(index)
                  }
                  className="flex flex-col items-center"
                >

                  <div
                    className={`
                      w-6 h-6 rounded-full border-2 transition-all
                      ${
                        selectedLevel === index
                          ? "bg-[#E59BE7] border-[#E59BE7]"
                          : "bg-white border-gray-400"
                      }
                    `}
                  />

                  <span
                    className={`
                      mt-4 text-sm
                      ${
                        selectedLevel === index
                          ? "font-semibold text-[#C86AD9]"
                          : "text-gray-600"
                      }
                    `}
                  >
                    {level}
                  </span>

                </button>
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default ActivitySpeechLadder;