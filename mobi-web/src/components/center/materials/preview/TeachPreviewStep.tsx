import PreviewMediaHolder from "./PreviewMediaHolder";
import PreviewStepHeader from "./PreviewStepHeader";
import { getPromptText } from "./previewTypes";
import type { PreviewStep } from "./previewTypes";

type Props = {
  step: PreviewStep;
  fallbackImage?: string;
  onReplayPrompt: () => void;
};

export default function TeachPreviewStep({
  step,
  fallbackImage,
  onReplayPrompt,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-4">
      <PreviewStepHeader
        promptText={step.lesson || getPromptText(step)}
        helperText="Look and listen carefully."
        onReplayPrompt={onReplayPrompt}
      />

      <PreviewMediaHolder step={step} fallbackImage={fallbackImage} />
    </div>
  );
}