import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import AskPreviewStep from "./AskPreviewStep";
import TeachPreviewStep from "./TeachPreviewStep";
import FeedbackPreviewStep from "./FeedbackPreviewStep";
import ShowChoosePreviewStep from "./ShowChoosePreviewStep";
import ConversationPreviewStep from "./ConversationPreviewStep";
import DoItPreviewStep from "./DoItPreviewStep";
import PreviewVoiceControl from "./PreviewVoiceControl";

import {
  formatStepType,
  getChoiceIsCorrect,
  getFeedbackText,
  getPromptText,
  normalizeStepType,
  stepNeedsVoiceResponse,
} from "./previewTypes";

import type {
  PreviewActivity,
  PreviewChoice,
  SpeakerStatus,
} from "./previewTypes";

type Props = {
  open: boolean;
  activity: PreviewActivity;
  fallbackImage?: string;
  onClose: () => void;
};

export default function ActivityPlayPreviewModal({
  open,
  activity,
  fallbackImage,
  onClose,
}: Props) {
  const steps = useMemo(() => {
    return [...(activity.activity_steps || [])].sort(
      (a, b) => a.step_order - b.step_order
    );
  }, [activity.activity_steps]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<
    string | number | null
  >(null);
  const [speakerStatus, setSpeakerStatus] = useState<SpeakerStatus>("idle");
  const [learnerResponse, setLearnerResponse] = useState("");
  const [lastResultCorrect, setLastResultCorrect] = useState<boolean | null>(
    null
  );

  const currentStep = steps[currentIndex];
  const currentType = normalizeStepType(currentStep?.step_type);
  const showVoiceControl = stepNeedsVoiceResponse(currentStep?.step_type);

  useEffect(() => {
    if (!open) return;

    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setSpeakerStatus("idle");
    setLearnerResponse("");
    setLastResultCorrect(null);
  }, [open, activity.id]);

  useEffect(() => {
    setSelectedChoiceId(null);
    setLearnerResponse("");
    setSpeakerStatus("idle");
    window.speechSynthesis?.cancel();
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (!open) return null;

  const goNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const getTextForSpeech = () => {
    if (!currentStep) return "";

    if (currentType === "feedback") {
      return getFeedbackText(currentStep, lastResultCorrect);
    }

    return getPromptText(currentStep);
  };

  const handleReplayPrompt = () => {
    const text = getTextForSpeech();

    if (!text) return;

    if (!("speechSynthesis" in window)) {
      setSpeakerStatus("speaking");

      setTimeout(() => {
        setSpeakerStatus("idle");
      }, 1200);

      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    utterance.onstart = () => setSpeakerStatus("speaking");
    utterance.onend = () => setSpeakerStatus("idle");
    utterance.onerror = () => setSpeakerStatus("idle");

    window.speechSynthesis.speak(utterance);
  };

  const handleMicPress = () => {
    if (!showVoiceControl) return;

    if (speakerStatus === "userSpeaking") {
      setSpeakerStatus("idle");
      setLearnerResponse("Sample voice response captured.");
      return;
    }

    setSpeakerStatus("userSpeaking");
    setLearnerResponse("");

    setTimeout(() => {
      setSpeakerStatus("idle");
      setLearnerResponse("Sample voice response captured.");
    }, 1200);
  };

  const handleSelectChoice = (choice: PreviewChoice) => {
    setSelectedChoiceId(choice.id);

    const result = getChoiceIsCorrect(choice);

    if (result !== null) {
      setLastResultCorrect(result);
    }
  };

  const renderStep = () => {
    if (!currentStep) {
      return (
        <div className="rounded-[24px] bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-500">
            No activity steps available.
          </p>
        </div>
      );
    }

    if (currentType === "choose") {
      return (
        <ShowChoosePreviewStep
          step={currentStep}
          selectedChoiceId={selectedChoiceId}
          onSelectChoice={handleSelectChoice}
          onReplayPrompt={handleReplayPrompt}
        />
      );
    }

    if (currentType === "teach") {
      return (
        <TeachPreviewStep
          step={currentStep}
          fallbackImage={fallbackImage}
          onReplayPrompt={handleReplayPrompt}
        />
      );
    }

    if (currentType === "feedback") {
      return (
        <FeedbackPreviewStep
          step={currentStep}
          fallbackImage={fallbackImage}
          lastResultCorrect={lastResultCorrect}
          onReplayPrompt={handleReplayPrompt}
        />
      );
    }

    if (currentType === "conversation") {
      return (
        <ConversationPreviewStep
          step={currentStep}
          fallbackImage={fallbackImage}
          onReplayPrompt={handleReplayPrompt}
        />
      );
    }

    if (currentType === "do") {
      return (
        <DoItPreviewStep
          step={currentStep}
          fallbackImage={fallbackImage}
          onReplayPrompt={handleReplayPrompt}
        />
      );
    }

    return (
      <AskPreviewStep
        step={currentStep}
        fallbackImage={fallbackImage}
        onReplayPrompt={handleReplayPrompt}
      />
    );
  };

  const statusText =
    speakerStatus === "speaking"
      ? "MOBI is speaking..."
      : speakerStatus === "userSpeaking"
      ? "Listening..."
      : "Tap the microphone to answer.";

    return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 px-4 py-5 backdrop-blur-sm">
        <div className="relative flex w-full max-w-5xl flex-col gap-5 rounded-[30px] bg-white p-5 shadow-2xl lg:flex-row lg:items-center lg:justify-between lg:p-6">
        <button
            onClick={onClose}
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5EEF6] text-[#7A5D7F] shadow-sm transition hover:bg-[#EBD7EC]"
        >
            <X size={19} />
        </button>

        <div className="w-full pr-12 lg:w-[40%] lg:pr-0">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#965DEB]">
            Mobile Activity Preview
            </p>

            <h2 className="itim text-4xl font-medium text-[#1F1D28]">
            {activity.title}
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600">
            Preview how this activity will appear on the learner’s mobile screen
            before assigning it.
            </p>

            <div className="mt-5 rounded-[22px] bg-[#F8F1FA] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Current Step
            </p>

            <p className="mt-1 text-lg font-black text-[#1F1D28]">
                Step {currentStep?.step_order || currentIndex + 1}:{" "}
                {formatStepType(currentStep?.step_type)}
            </p>

            <p className="mt-1 text-sm font-semibold text-[#7A5D7F]">
                {steps.length ? currentIndex + 1 : 0} of {steps.length}
            </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
            <button
                onClick={goPrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 rounded-2xl bg-[#F1E7FF] px-4 py-3 text-sm font-black text-[#8759D6] transition hover:bg-[#E6D6FF] disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft size={18} />
                Previous
            </button>

            <button
                onClick={goNext}
                disabled={currentIndex >= steps.length - 1}
                className="flex items-center gap-2 rounded-2xl bg-[#8759D6] px-4 py-3 text-sm font-black text-white transition hover:bg-[#7448C2] disabled:cursor-not-allowed disabled:opacity-40"
            >
                Next
                <ChevronRight size={18} />
            </button>
            </div>
        </div>

        <div className="flex w-full justify-center lg:w-[58%]">
            <div
                className="
                    relative
                    h-[760px]
                    max-h-[86vh]
                    w-[350px]
                    max-w-[88vw]
                    rounded-[44px]
                    bg-[#201827]
                    p-3
                    shadow-2xl
                "
            >
            <div className="absolute left-1/2 top-4 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-[#201827]" />

            <div className="h-full overflow-hidden rounded-[34px] bg-[#F7EFFB]">
                <div className="flex h-full flex-col">
                <div className="shrink-0 bg-[#EBD7F0] px-4 pb-3 pt-9">
                    <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-wide text-[#8759D6]">
                        MOBI Session
                        </p>

                        <h3 className="mt-1 max-w-[200px] truncate text-[16px] font-black text-[#1F1D28]">
                        {activity.title}
                        </h3>
                    </div>

                    <div className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#8759D6] shadow-sm">
                        {steps.length ? currentIndex + 1 : 0}/{steps.length}
                    </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-3.5">
                    {renderStep()}
                </div>

                {showVoiceControl && (
                    <div className="shrink-0 border-t border-[#E6C5E6] bg-[#F7EFFB] px-3.5 pb-3.5 pt-3">
                    <PreviewVoiceControl
                        speakerStatus={speakerStatus}
                        statusText={statusText}
                        learnerResponse={learnerResponse}
                        onMicPress={handleMicPress}
                    />
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
    );
}