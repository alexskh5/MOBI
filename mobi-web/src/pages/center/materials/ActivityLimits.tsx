interface ActivityLimitsProps {
    maxAttempts: number;
    setMaxAttempts: (values: number) => void;
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
        <div className="bg-white border border-[#AFC0E8] rounded-[18px] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#AFC0E8] font-bold">
        Activity Limits (Required)
      </div>

      <div className="p-5 grid grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-2">
            Maximum Attempts
          </label>

          <input
            type="number"
            min={1}
            max={10}
            value={maxAttempts}
            onChange={(e) =>
              setMaxAttempts(Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none"
          />

          <p className="text-sm text-gray-500 mt-2">
            How many times the child can try before moving on.
          </p>
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Estimated Minutes
          </label>

          <input
            type="number"
            min={1}
            max={60}
            value={estimatedMinutes}
            onChange={(e) =>
              setEstimatedMinutes(Number(e.target.value))
            }
            className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none"
          />

          <p className="text-sm text-gray-500 mt-2">
            Suggested time limit for this activity.
          </p>
        </div>
      </div>
    </div>
    );
}
export default ActivityLimits;