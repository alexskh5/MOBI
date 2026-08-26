import { Mic, MessageCircle, Square } from "lucide-react";
import type { SpeakerStatus } from "./previewTypes";

const waveBars = [14, 20, 27, 19, 34, 42, 36, 48, 56, 40, 32, 25, 20, 14];

type Props = {
  speakerStatus: SpeakerStatus;
  statusText: string;
  onMicPress: () => void;
  learnerResponse?: string;
};

export default function PreviewVoiceControl({
  speakerStatus,
  statusText,
  onMicPress,
  learnerResponse,
}: Props) {
  const isActive = speakerStatus === "userSpeaking";

  return (
    <div className="w-full rounded-[22px] bg-white px-3.5 py-3 text-center shadow-md">
      <button
        onClick={onMicPress}
        className={`
          mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full
          transition
          ${
            isActive
              ? "bg-[#8759D6] text-white"
              : "bg-[#F1E7FF] text-[#8759D6] hover:bg-[#E6D6FF]"
          }
        `}
      >
        {isActive ? <Square size={21} fill="white" /> : <Mic size={24} />}
      </button>

      <div className="mt-1 flex h-9 items-center justify-center">
        {waveBars.map((height, index) => (
          <div
            key={`${height}-${index}`}
            className={`
              mx-[2px] w-1 rounded-full bg-[#A78BFA]
              ${
                speakerStatus === "idle"
                  ? "opacity-25"
                  : "animate-pulse opacity-90"
              }
            `}
            style={{
              height,
              animationDelay: `${index * 70}ms`,
              transform:
                speakerStatus === "idle" ? "scaleY(0.55)" : "scaleY(1)",
            }}
          />
        ))}
      </div>

      <p className="mt-0.5 text-[11px] font-black text-gray-500">
        {statusText}
      </p>

      {learnerResponse && (
        <div className="mt-2 flex items-start gap-2 rounded-[16px] bg-[#F1E7FF] px-3 py-2 text-left">
          <MessageCircle
            size={14}
            className="mt-[2px] shrink-0 text-[#8759D6]"
          />

          <p className="text-[11px] font-extrabold leading-4 text-[#4B3A5A]">
            {learnerResponse}
          </p>
        </div>
      )}
    </div>
  );
}