import PreviewMediaHolder from "./PreviewMediaHolder";
import PreviewStepHeader from "./PreviewStepHeader";
import { getFeedbackText } from "./previewTypes";
import type { PreviewStep } from "./previewTypes";

type Props = {
  step: PreviewStep;
  fallbackImage?: string;
  lastResultCorrect?: boolean | null;
  onReplayPrompt: () => void;
};

export default function FeedbackPreviewStep({
  step,
  fallbackImage,
  lastResultCorrect,
  onReplayPrompt,
}: Props) {
  const feedbackText = getFeedbackText(step, lastResultCorrect);

  return (
    <div className="flex w-full flex-col gap-4">
      <PreviewMediaHolder
        step={step}
        fallbackImage={fallbackImage}
        mode="compact"
      />

      <PreviewStepHeader
        promptText={feedbackText}
        helperText="Tap replay to hear it again."
        onReplayPrompt={onReplayPrompt}
      />
    </div>
  );
}