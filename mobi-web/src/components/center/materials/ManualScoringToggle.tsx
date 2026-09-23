type ManualScoringToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

function ManualScoringToggle({
  enabled,
  onChange,
}: ManualScoringToggleProps) {
  return (
    <label className="mt-4 flex items-start gap-3 rounded-2xl border border-[#D8C5E0] bg-white/80 p-4">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-[#A85CB5]"
      />

      <span>
        <span className="block text-sm font-semibold text-[#4A3D50]">
          Let adult mark this step correct
        </span>

        <span className="mt-1 block text-xs leading-5 text-[#766D7A]">
          During mobile sessions, the therapist or guardian can accept the
          learner's response even if speech recognition is slow or imperfect.
        </span>
      </span>
    </label>
  );
}

export default ManualScoringToggle;
