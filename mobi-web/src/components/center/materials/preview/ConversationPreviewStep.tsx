import PreviewMediaHolder from "./PreviewMediaHolder";
import PreviewStepHeader from "./PreviewStepHeader";
import { getPromptText } from "./previewTypes";
import type { PreviewStep } from "./previewTypes";

type Props = {
  step: PreviewStep;
  fallbackImage?: string;
  onReplayPrompt: () => void;
};

export default function ConversationPreviewStep({
  step,
  fallbackImage,
  onReplayPrompt,
}: Props) {
  const promptText =
    step.topics && step.topics.length > 0
      ? step.topics[0]
      : getPromptText(step);

  return (
    <div className="flex w-full flex-col gap-4">
      <PreviewStepHeader
        promptText={promptText}
        helperText="Tell MOBI what you know."
        onReplayPrompt={onReplayPrompt}
      />

      <PreviewMediaHolder
        step={step}
        fallbackImage={fallbackImage}
        mode="compact"
      />
    </div>
  );
}