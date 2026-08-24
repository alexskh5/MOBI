import PreviewMediaHolder from "./PreviewMediaHolder";
import PreviewStepHeader from "./PreviewStepHeader";
import { getPromptText } from "./previewTypes";
import type { PreviewStep } from "./previewTypes";

type Props = {
  step: PreviewStep;
  fallbackImage?: string;
  onReplayPrompt: () => void;
};

export default function DoItPreviewStep({
  step,
  fallbackImage,
  onReplayPrompt,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-4">
      <PreviewStepHeader
        promptText={step.instruction || getPromptText(step)}
        helperText="Do the action, then tap the microphone."
        onReplayPrompt={onReplayPrompt}
      />

      <PreviewMediaHolder step={step} fallbackImage={fallbackImage} />

      {step.materials_needed && step.materials_needed.length > 0 && (
        <div className="rounded-[22px] bg-white p-4 shadow-md">
          <p className="mb-2 text-xs font-black text-[#1F1D28]">
            Materials needed
          </p>

          <div className="space-y-1">
            {step.materials_needed.map((item, index) => (
              <p
                key={`${item}-${index}`}
                className="text-xs font-bold leading-5 text-gray-500"
              >
                • {item}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}