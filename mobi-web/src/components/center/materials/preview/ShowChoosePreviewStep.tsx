import { ImageIcon } from "lucide-react";
import PreviewStepHeader from "./PreviewStepHeader";

import {
  getChoices,
  getPromptText,
} from "./previewTypes";

import type {
  PreviewChoice,
  PreviewStep,
} from "./previewTypes";

type Props = {
  step: PreviewStep;
  selectedChoiceId: string | number | null;
  onSelectChoice: (choice: PreviewChoice) => void;
  onReplayPrompt: () => void;
};

export default function ShowChoosePreviewStep({
  step,
  selectedChoiceId,
  onSelectChoice,
  onReplayPrompt,
}: Props) {
  const choices = getChoices(step);

  return (
    <div className="flex w-full flex-col gap-3">
      <PreviewStepHeader
        promptText={step.question || getPromptText(step)}
        helperText="Listen to the question and tap your answer."
        onReplayPrompt={onReplayPrompt}
        compact
      />

      <div className="grid w-full grid-cols-2 gap-2.5">
        {choices.map((choice, index) => {
          const isSelected = selectedChoiceId === choice.id;
          const imageUrl = choice.image_url || choice.url;

          return (
            <button
              key={choice.id}
              onClick={() => onSelectChoice(choice)}
              className={`
                rounded-[22px] border-2 bg-white p-2.5 text-center shadow-md transition
                ${
                  isSelected
                    ? "border-[#A78BFA] bg-[#FCFAFF]"
                    : "border-white hover:border-[#E6D6FF]"
                }
              `}
            >
              <div className="flex h-[104px] w-full items-center justify-center overflow-hidden rounded-[18px] bg-[#F7F1FB]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Choice ${String.fromCharCode(65 + index)}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageIcon size={28} className="text-[#A78BFA]" />
                )}
              </div>

              <div
                className={`
                  mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-full border-[3px]
                  ${isSelected ? "border-[#8759D6]" : "border-[#D9B9FB]"}
                `}
              >
                {isSelected && (
                  <div className="h-3.5 w-3.5 rounded-full bg-[#8759D6]" />
                )}
              </div>

              <p className="mt-1.5 text-xs font-black text-[#1F1D28]">
                Choice {String.fromCharCode(65 + index)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}