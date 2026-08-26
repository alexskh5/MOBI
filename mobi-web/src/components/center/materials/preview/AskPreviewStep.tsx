import PreviewMediaHolder from "./PreviewMediaHolder";
import PreviewStepHeader from "./PreviewStepHeader";
import { getPromptText } from "./previewTypes";
import type { PreviewStep } from "./previewTypes";

type Props = {
  step: PreviewStep;
  fallbackImage?: string;
  onReplayPrompt: () => void;
};

export default function AskPreviewStep({
  step,
  fallbackImage,
  onReplayPrompt,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-4">
      <PreviewStepHeader
        promptText={step.question || getPromptText(step)}
        helperText="Say the answer using your own words."
        onReplayPrompt={onReplayPrompt}
      />

      <PreviewMediaHolder step={step} fallbackImage={fallbackImage} />
    </div>
  );
}