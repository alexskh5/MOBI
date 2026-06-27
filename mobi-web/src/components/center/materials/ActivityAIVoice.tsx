import { useState } from "react";

const speedLevels = [
  "Slow",
  "Moderate",
  "Fast",
];

function ActivityAIVoice() {
  const [selectedSpeed, setSelectedSpeed] =
    useState(1);

  const [selectedGender, setSelectedGender] =
    useState("Girl");

  return (
    <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

      {/* HEADER */}
      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">

        <h3 className="font-semibold text-xl">
          AI Voice (Required)
        </h3>

      </div>

      {/* BODY */}
      <div className="bg-white p-6">

        <div className="grid grid-cols-2 gap-10">

          {/* SPEED */}
          <div>

            <p className="font-medium mb-6">
              Adjust talking speed
            </p>

            <div className="relative">

              <div className="absolute top-3 left-0 right-0 h-1 bg-gray-400 rounded-full"></div>

              <div className="grid grid-cols-3 relative">

                {speedLevels.map(
                  (speed, index) => (
                    <button
                      key={speed}
                      onClick={() =>
                        setSelectedSpeed(index)
                      }
                      className="flex flex-col items-center"
                    >

                      <div
                        className={`
                          w-5 h-5 rounded-full border-2 transition-all
                          ${
                            selectedSpeed === index
                              ? "bg-[#E59BE7] border-[#E59BE7]"
                              : "bg-white border-gray-400"
                          }
                        `}
                      />

                      <span
                        className={`
                          mt-3 text-sm
                          ${
                            selectedSpeed === index
                              ? "font-semibold text-[#C86AD9]"
                              : "text-gray-600"
                          }
                        `}
                      >
                        {speed}
                      </span>

                    </button>
                  )
                )}

              </div>

            </div>

          </div>

          {/* GENDER */}
          <div>

            <p className="font-medium mb-4">
              Choose gender
            </p>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  setSelectedGender("Girl")
                }
                className={`
                  px-6 py-2 rounded-full border
                  ${
                    selectedGender === "Girl"
                      ? "bg-[#E59BE7]/20 border-[#E59BE7]"
                      : "bg-white border-[#AAB7DA]"
                  }
                `}
              >
                Girl
              </button>

              <button
                onClick={() =>
                  setSelectedGender("Boy")
                }
                className={`
                  px-6 py-2 rounded-full border
                  ${
                    selectedGender === "Boy"
                      ? "bg-[#E59BE7]/20 border-[#E59BE7]"
                      : "bg-white border-[#AAB7DA]"
                  }
                `}
              >
                Boy
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ActivityAIVoice;