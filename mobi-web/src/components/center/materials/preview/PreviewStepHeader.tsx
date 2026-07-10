import { Volume2 } from "lucide-react";

type Props = {
  promptText: string;
  helperText?: string;
  onReplayPrompt: () => void;
  compact?: boolean;
};

export default function PreviewStepHeader({
  promptText,
  helperText,
  onReplayPrompt,
  compact = false,
}: Props) {
  return (
    <div
      className={`
        w-full rounded-[22px] bg-white text-center shadow-md
        ${compact ? "px-3.5 py-3.5" : "px-4 py-4"}
      `}
    >
      <button
        onClick={onReplayPrompt}
        className="
          mx-auto mb-2 flex h-10 w-10 items-center justify-center
          rounded-full bg-[#F1E7FF] text-[#8759D6]
          transition hover:bg-[#E6D6FF]
        "
      >
        <Volume2 size={18} />
      </button>

      <p
        className={`
          font-black leading-snug text-[#1F1D28]
          ${compact ? "text-[15px]" : "text-[17px]"}
        `}
      >
        {promptText}
      </p>

      {helperText && (
        <p
          className={`
            mt-1.5 font-bold leading-4 text-gray-500
            ${compact ? "text-[11px]" : "text-xs"}
          `}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}