interface ActivityLimitsProps {
  maxAttempts: number;
  setMaxAttempts: (value: number) => void;
  estimatedMinutes: number;
  setEstimatedMinutes: (value: number) => void;
}

function ActivityLimits({
  maxAttempts,
  setMaxAttempts,
  estimatedMinutes,
  setEstimatedMinutes,
}: ActivityLimitsProps) {
  return (
    <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">
      {/* HEADER */}
      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">
        <h3 className="font-semibold text-xl">
          Activity Limits (Required)
        </h3>
      </div>

      {/* BODY */}
      <div className="bg-white p-6">
        <div className="grid grid-cols-2 gap-10">
          {/* MAXIMUM ATTEMPTS */}
          <div>
            <p className="font-medium mb-4">
              Maximum Attempts
            </p>

            <input
              type="number"
              min={1}
              max={10}
              value={maxAttempts}
              onChange={(e) =>
                setMaxAttempts(Number(e.target.value))
              }
              className="
                w-full
                border border-[#AAB7DA]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#E59BE7]
                focus:ring-2
                focus:ring-[#E59BE7]/20
                transition
              "
            />

            <p className="text-sm text-gray-500 mt-3">
              How many times the child can try before moving on.
            </p>
          </div>

          {/* ESTIMATED MINUTES */}
          <div>
            <p className="font-medium mb-4">
              Estimated Minutes
            </p>

            <input
              type="number"
              min={1}
              max={60}
              value={estimatedMinutes}
              onChange={(e) =>
                setEstimatedMinutes(Number(e.target.value))
              }
              className="
                w-full
                border border-[#AAB7DA]
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#E59BE7]
                focus:ring-2
                focus:ring-[#E59BE7]/20
                transition
              "
            />

            <p className="text-sm text-gray-500 mt-3">
              Suggested time limit for this activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLimits;