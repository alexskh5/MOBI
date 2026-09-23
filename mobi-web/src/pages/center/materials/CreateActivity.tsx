// MOBI/mobi-web/src/pages/center/materials/CreateActivity.tsx
import { useEffect, useState, useRef } from "react";
import {
  Play,
  Undo2,
  Redo2,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { ACTIVITY_TEMPLATES } from "../../../data/ActivityTemplates";

import mobiLogo from "../../../assets/mobiLogo.png";

import Toolbox from "../../../components/center/materials/Toolbox";
import PreviewCard from "../../../components/center/materials/PreviewCard";

import TeachStep from "../../../components/center/materials/TeachStep";
import AskStep from "../../../components/center/materials/AskStep";
import FeedbackStep from "../../../components/center/materials/FeedbackStep";
import ConversationStep from "../../../components/center/materials/ConversationStep";
import DoItStep from "../../../components/center/materials/DoItStep";
import ShowChooseStep from "../../../components/center/materials/ShowChooseStep";

import ActivityDescription from "../../../components/center/materials/ActivityDescription";
import ActivityThumbnail from "../../../components/center/materials/ActivityThumbnail";
import ActivitySpeechLadder from "../../../components/center/materials/ActivitySpeechLadder";
import ActivityAIVoice from "../../../components/center/materials/ActivityAIVoice";
// import ActivityAssignLearnerMock from "../../../components/center/materials/ActivityAssignLearnerMock";
// import ActivityReadinessLadder from "../../../components/center/materials/ActivityReadinessLadder";
// newly added
import ActivityLimits from "../../../components/center/materials/ActivityLimits";
import StepDropZone from "../../../components/center/materials/StepDropZone";
import ActivityPlayPreviewModal from "../../../components/center/materials/preview/ActivityPlayPreviewModal";
import type {
  PreviewActivity,
  PreviewStep,
} from "../../../components/center/materials/preview/previewTypes";

import {
  createActivity,
  generateTTSBlob,
  uploadActivityAsset,
} from "../../../services/activityApi";

import ActivityAssignLearner from "../../../pages/center/materials/ActivityAssignLearner";

type BuilderStep = {
  id: string;
  type: string;
};

type StepSnapshot = {
  steps: BuilderStep[];
  data: Record<string, any>;
};

const ACTIVITY_DRAFT_STORAGE_KEY = "mobi-center-activity-drafts-v1";

function createTemplateSteps(template: string): BuilderStep[] {
  const templateSteps =
    ACTIVITY_TEMPLATES[
      template as keyof typeof ACTIVITY_TEMPLATES
    ] || [];

  return templateSteps.map((stepType, index) => ({
    id: `template-${index}-${stepType.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`,
    type: stepType,
  }));
}

function sanitizeStepDataForDraft(stepData: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(stepData).map(([stepKey, data]) => {
      const cleanData = { ...data };

      delete cleanData.media_file;
      delete cleanData.prompt_audio_file;
      delete cleanData.correct_audio_file;
      delete cleanData.wrong_audio_file;
      delete cleanData.max_attempts_audio_file;

      if (Array.isArray(cleanData.choices)) {
        cleanData.choices = cleanData.choices.map((choice: any) => {
          const {
            image_file,
            ...cleanChoice
          } = choice;

          return cleanChoice;
        });
      }

      return [stepKey, cleanData];
    }),
  );
}

function CreateActivity() {
  const location = useLocation();
  const draftData = location.state?.draftData || null;

  const navigate = useNavigate();

  const [title, setTitle] =
    useState(draftData?.title || "");

  const [selectedTemplate] =
    useState(
      draftData?.selectedTemplate ||
        location.state?.template ||
        "Teach & Practice"
    );

  const [description, setDescription] =
    useState(draftData?.description || "");

  const [thumbnail, setThumbnail] =
    useState<string | null>(draftData?.thumbnail || null);

  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);

      // newly added 
  const [maxAttempts, setMaxAttempts] = useState(draftData?.maxAttempts || 3);
  const [estimatedMinutes, setEstimatedMinutes] = useState(draftData?.estimatedMinutes || 5); 
  const [stepData, setStepData] = useState<Record<string, any>>(
    draftData?.stepData || {},
  );
  const [aiVoiceGender, setAiVoiceGender] = useState(draftData?.aiVoiceGender || "girl");
  const [aiVoiceSpeed, setAiVoiceSpeed] = useState(draftData?.aiVoiceSpeed || "moderate");
  const [speechLadderLevel, setSpeechLadderLevel] =
    useState(draftData?.speechLadderLevel || "sound");

  /*
  Activity assignment state.

  selectedLearners:
  Stores the UUIDs of learners selected for this activity.

  assignmentType:
  center_library = activity remains generally available
  assigned_only = activity is intended only for selected learners
*/
  const [selectedLearners, setSelectedLearners] =
    useState<string[]>(draftData?.selectedLearners || []);

  const [assignmentType, setAssignmentType] =
    useState<
      "center_library" | "assigned_only"
    >(draftData?.assignmentType || "center_library");

  const [draftId, setDraftId] =
    useState<string | null>(location.state?.draftId || draftData?.id || null);

  const [isSavingDraft, setIsSavingDraft] =
    useState(false);

  const saveDraftInFlightRef =
    useRef(false);

  const [isPublishing, setIsPublishing] =
    useState(false);

  const publishInFlightRef =
    useRef(false);

  const [previewActivity, setPreviewActivity] =
    useState<PreviewActivity | null>(null);

    
  const updateStepData = (stepKey: string, data: any) => {
  setStepData((prev) => ({
    ...prev,
    [stepKey]: data,
  }));
};

  const [builderSteps, setBuilderSteps] =
    useState<BuilderStep[]>(() =>
      draftData?.builderSteps?.length
        ? draftData.builderSteps
        : createTemplateSteps(selectedTemplate),
    );

  const [stepHistory, setStepHistory] =
    useState<{
      past: StepSnapshot[];
      future: StepSnapshot[];
    }>({
      past: [],
      future: [],
    });

  const speechLadderRef =
    useRef<HTMLDivElement>(null);

  const descriptionRef =
    useRef<HTMLDivElement>(null);

  const thumbnailRef =
    useRef<HTMLDivElement>(null);

  const activityLimitsRef =
    useRef<HTMLDivElement>(null);

  const aiVoiceRef =
    useRef<HTMLDivElement>(null);

  const assignLearnerRef =
    useRef<HTMLDivElement>(null);

  // const readinessRef =
  //   useRef<HTMLDivElement>(null);

  const scrollToSection = (
    ref: React.RefObject<HTMLDivElement | null>,
    section: string
  ) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setHighlightedSection(section);

    setTimeout(() => {
      setHighlightedSection("");
    }, 1500);
  };

  const [highlightedSection, setHighlightedSection] =
    useState("");

  const [pendingAddedStepKey, setPendingAddedStepKey] =
    useState<string | null>(null);

  const stepRefs =
    useRef<Record<string, HTMLDivElement | null>>({});

  const commitStepChange = (
    updater: (currentSteps: BuilderStep[]) => BuilderStep[],
    nextStepData = stepData,
  ) => {
    setBuilderSteps((currentSteps) => {
      const nextSteps = updater(currentSteps);

      if (nextSteps === currentSteps) {
        return currentSteps;
      }

      setStepHistory((currentHistory) => ({
        past: [
          ...currentHistory.past,
          {
            steps: currentSteps,
            data: stepData,
          },
        ],
        future: [],
      }));

      setStepData(nextStepData);

      return nextSteps;
    });
  };

  const addStep = (
    stepType: string
  ) => {
    const nextStep = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: stepType,
    };

    commitStepChange((currentSteps) => [
      ...currentSteps,
      nextStep,
    ]);
    setPendingAddedStepKey(nextStep.id);
  };

  const moveStep = (
    stepId: string,
    direction: "up" | "down",
  ) => {
    commitStepChange((currentSteps) => {
      const index = currentSteps.findIndex(
        (step) => step.id === stepId,
      );

      const targetIndex =
        direction === "up" ? index - 1 : index + 1;

      if (
        index < 0 ||
        targetIndex < 0 ||
        targetIndex >= currentSteps.length
      ) {
        return currentSteps;
      }

      const nextSteps = [...currentSteps];
      const [movedStep] = nextSteps.splice(index, 1);
      nextSteps.splice(targetIndex, 0, movedStep);

      setPendingAddedStepKey(stepId);

      return nextSteps;
    });
  };

  const deleteStep = (stepId: string) => {
    const confirmDelete = window.confirm(
      "Remove this step from the activity?",
    );

    if (!confirmDelete) {
      return;
    }

    const nextStepData = (() => {
      const {
        [stepId]: _removed,
        ...remainingData
      } = stepData;

      return remainingData;
    })();

    commitStepChange(
      (currentSteps) =>
        currentSteps.filter((step) => step.id !== stepId),
      nextStepData,
    );
  };

  const undoStepChange = () => {
    setStepHistory((currentHistory) => {
      const previousSnapshot =
        currentHistory.past[currentHistory.past.length - 1];

      if (!previousSnapshot) {
        return currentHistory;
      }

      setBuilderSteps(previousSnapshot.steps);
      setStepData(previousSnapshot.data);

      return {
        past: currentHistory.past.slice(0, -1),
        future: [
          {
            steps: builderSteps,
            data: stepData,
          },
          ...currentHistory.future,
        ],
      };
    });
  };

  const redoStepChange = () => {
    setStepHistory((currentHistory) => {
      const nextSteps = currentHistory.future[0];

      if (!nextSteps) {
        return currentHistory;
      }

      setBuilderSteps(nextSteps.steps);
      setStepData(nextSteps.data);

      return {
        past: [
          ...currentHistory.past,
          {
            steps: builderSteps,
            data: stepData,
          },
        ],
        future: currentHistory.future.slice(1),
      };
    });
  };

  useEffect(() => {
    if (!pendingAddedStepKey) {
      return;
    }

    stepRefs.current[pendingAddedStepKey]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setHighlightedSection(pendingAddedStepKey);

    const timeout = window.setTimeout(() => {
      setHighlightedSection("");
      setPendingAddedStepKey(null);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [builderSteps, pendingAddedStepKey]);

  const uploadOptionalAsset = async (
    file: File | null | undefined,
    category: "thumbnail" | "step-media" | "prompt-audio",
  ) => {
    if (!file) {
      return null;
    }

    return uploadActivityAsset(file, category);
  };

  const getVoiceName = () =>
    aiVoiceGender === "boy" ||
    aiVoiceGender === "Boy"
      ? "Puck"
      : "Kore";

  const getVoiceSpeedValue = () => {
    if (aiVoiceSpeed === "slow") return 0.85;
    if (aiVoiceSpeed === "fast") return 1.12;
    return 1;
  };

  const generateAndUploadPromptAudio = async ({
    text,
    style,
    filename,
  }: {
    text?: string | null;
    style?: string | null;
    filename: string;
  }) => {
    const cleanText = String(text || "").trim();

    if (!cleanText) {
      return null;
    }

    const audioBlob = await generateTTSBlob({
      text: cleanText,
      voice: getVoiceName(),
      speed: getVoiceSpeedValue(),
      style: style || "Teaching",
      emotion: "Calm",
    });

    const audioFile = new File(
      [audioBlob],
      `${filename}.wav`,
      {
        type: audioBlob.type || "audio/wav",
      },
    );

    return uploadActivityAsset(
      audioFile,
      "prompt-audio",
    );
  };

  const getStepPromptForTTS = (step: any) =>
    step.prompt ||
    step.question ||
    step.instruction ||
    step.lesson ||
    "";

  const uploadStepAssets = async (step: any) => {
    const uploadedMedia =
      await uploadOptionalAsset(step.media_file, "step-media");

    const uploadedPromptAudio =
      await uploadOptionalAsset(step.prompt_audio_file, "prompt-audio") ||
      await generateAndUploadPromptAudio({
        text: getStepPromptForTTS(step),
        style: typeof step.ai_voice_style === "string"
          ? step.ai_voice_style
          : "Teaching",
        filename: `step-${step.step_order || Date.now()}-prompt`,
      });

    const feedbackAudioUrls = {
      correct:
        (await uploadOptionalAsset(step.correct_audio_file, "prompt-audio"))
          ?.url ||
        (await generateAndUploadPromptAudio({
          text: Array.isArray(step.correct_feedback)
            ? step.correct_feedback[0]
            : step.correct_feedback,
          style:
            step.correct_voice_style ||
            step.ai_voice_style?.correct ||
            "Celebratory",
          filename: `step-${step.step_order || Date.now()}-correct`,
        }))?.url ||
        null,
      wrong:
        (await uploadOptionalAsset(step.wrong_audio_file, "prompt-audio"))
          ?.url ||
        (await generateAndUploadPromptAudio({
          text: Array.isArray(step.wrong_feedback)
            ? step.wrong_feedback[0]
            : step.wrong_feedback,
          style:
            step.wrong_voice_style ||
            step.ai_voice_style?.wrong ||
            "Encouraging",
          filename: `step-${step.step_order || Date.now()}-wrong`,
        }))?.url ||
        null,
      max_attempts:
        (await uploadOptionalAsset(
          step.max_attempts_audio_file,
          "prompt-audio",
        ))?.url ||
        (await generateAndUploadPromptAudio({
          text: Array.isArray(step.max_attempts_feedback)
            ? step.max_attempts_feedback[0]
            : step.max_attempts_feedback,
          style: "Encouraging",
          filename: `step-${step.step_order || Date.now()}-max-attempts`,
        }))?.url ||
        null,
    };

    const choices = await Promise.all(
      (step.choices || []).map(async (choice: any) => {
        const uploadedChoiceImage = await uploadOptionalAsset(
          choice.image_file,
          "step-media",
        );

        const {
          image_file,
          ...choiceData
        } = choice;

        return {
          ...choiceData,
          image_url:
            uploadedChoiceImage?.url ||
            choice.image_url ||
            null,
        };
      }),
    );

    const {
      media_file,
      prompt_audio_file,
      correct_audio_file,
      wrong_audio_file,
      max_attempts_audio_file,
      ...cleanStep
    } = step;

    return {
      ...cleanStep,
      media_url:
        uploadedMedia?.url ||
        cleanStep.media_url ||
        null,
      media: uploadedMedia
        ? [uploadedMedia]
        : cleanStep.media || [],
      prompt_audio_url:
        uploadedPromptAudio?.url ||
        cleanStep.prompt_audio_url ||
        null,
      feedback_audio_urls: feedbackAudioUrls,
      choices,
    };
  };

  const formatBuilderSteps = (): PreviewStep[] => {
    const stepTypeMap: Record<string, string> = {
      Teach: "teach",
      Ask: "ask",
      Feedback: "feedback",
      Conversation: "conversation",
      "Learn by Doing": "do_it",
      "Show & Choose": "show_choose",
    };

    return builderSteps.map((step, index) => {
      const savedStepData = stepData[step.id] || {};

      const correctFeedback =
        step.type === "Feedback"
          ? savedStepData.correct_feedback?.[0] || ""
          : "";

      const wrongFeedback =
        step.type === "Feedback"
          ? savedStepData.wrong_feedback?.[0] || ""
          : "";

      return {
        id: step.id,
        step_order: index + 1,
        step_type: stepTypeMap[step.type] || step.type.toLowerCase(),

        instruction:
          step.type === "Learn by Doing"
            ? savedStepData.instruction || ""
            : `${step.type} step`,

        materials_needed:
          step.type === "Learn by Doing"
            ? savedStepData.materials_needed || []
            : [],

        prompt:
          step.type === "Ask"
            ? savedStepData.question || ""
            : step.type === "Teach"
            ? savedStepData.lesson || ""
            : step.type === "Show & Choose"
            ? savedStepData.question || ""
            : step.type === "Learn by Doing"
            ? savedStepData.instruction || ""
            : step.type === "Conversation"
            ? savedStepData.topics?.[0] || ""
            : correctFeedback || wrongFeedback || "",

        lesson:
          step.type === "Teach" ? savedStepData.lesson || "" : undefined,

        question:
          step.type === "Ask" || step.type === "Show & Choose"
            ? savedStepData.question || ""
            : undefined,

        expected_answers:
          step.type === "Ask" ? savedStepData.expected_answers || [] : [],

        accepted_variations:
          step.type === "Ask" ? savedStepData.accepted_variations || [] : [],

        choices:
          step.type === "Show & Choose" ? savedStepData.choices || [] : [],

        correct_feedback: correctFeedback,
        wrong_feedback: wrongFeedback,

        max_attempts_feedback:
          step.type === "Feedback" ? savedStepData.max_attempts_feedback || [] : [],

        topics:
          step.type === "Conversation" ? savedStepData.topics || [] : [],

        can_repeat: true,
        can_give_hint: true,
        can_skip: true,
        manual_scoring_enabled:
          savedStepData.manual_scoring_enabled === true,

        ai_voice_style:
          step.type === "Feedback"
            ? {
                correct: savedStepData.correct_voice_style || "Celebratory",
                wrong: savedStepData.wrong_voice_style || "Encouraging",
              }
            : savedStepData.ai_voice_style || null,

        ai_feedback_rules: {
          correct:
            step.type === "Feedback" ? savedStepData.correct_feedback || [] : [],
          wrong:
            step.type === "Feedback" ? savedStepData.wrong_feedback || [] : [],
          max_attempts_reached:
            step.type === "Feedback" ? savedStepData.max_attempts_feedback || [] : [],
        },

        media_file:
          savedStepData.media_file || null,

        media_url:
          savedStepData.media_url || null,

        media:
          savedStepData.media || [],

        prompt_audio_file:
          savedStepData.prompt_audio_file || null,

        prompt_audio_url:
          savedStepData.prompt_audio_url || null,

        correct_audio_file:
          savedStepData.correct_audio_file || null,

        wrong_audio_file:
          savedStepData.wrong_audio_file || null,

        max_attempts_audio_file:
          savedStepData.max_attempts_audio_file || null,
      } as PreviewStep;
    });
  };

  const validateActivity = () => {
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push("Add an activity title.");
    }

    if (!description.trim()) {
      errors.push("Add an activity description.");
    }

    if (!builderSteps.length) {
      errors.push("Add at least one activity step.");
    }

    if (maxAttempts < 1) {
      errors.push("Max attempts must be at least 1.");
    }

    if (estimatedMinutes < 1) {
      errors.push("Estimated minutes must be at least 1.");
    }

    builderSteps.forEach((step, index) => {
      const savedStepData = stepData[step.id] || {};
      const label = `Step ${index + 1} (${step.type})`;

      if (step.type === "Teach" && !savedStepData.lesson?.trim()) {
        errors.push(`${label}: add the lesson text.`);
      }

      if (step.type === "Ask") {
        if (!savedStepData.question?.trim()) {
          errors.push(`${label}: add the question.`);
        }

        if (!savedStepData.expected_answers?.length) {
          errors.push(`${label}: add at least one expected answer.`);
        }
      }

      if (step.type === "Show & Choose") {
        const choices = savedStepData.choices || [];

        if (!savedStepData.question?.trim()) {
          errors.push(`${label}: add the question.`);
        }

        if (choices.length < 2) {
          errors.push(`${label}: add at least two choices.`);
        }

        if (choices.filter((choice: any) => choice.is_correct).length !== 1) {
          errors.push(`${label}: select exactly one correct choice.`);
        }
      }

      if (
        step.type === "Learn by Doing" &&
        !savedStepData.instruction?.trim()
      ) {
        errors.push(`${label}: add the instruction.`);
      }

      if (
        step.type === "Conversation" &&
        !(savedStepData.topics || []).some((topic: string) => topic.trim())
      ) {
        errors.push(`${label}: add at least one social prompt.`);
      }

      if (step.type === "Feedback") {
        if (!savedStepData.correct_feedback?.length) {
          errors.push(`${label}: add correct-answer feedback.`);
        }

        if (!savedStepData.wrong_feedback?.length) {
          errors.push(`${label}: add try-again feedback.`);
        }
      }
    });

    return errors;
  };

  const buildActivityPayload = async (status: "published") => {
    const formattedSteps = formatBuilderSteps();

    const uploadedThumbnail =
      await uploadOptionalAsset(thumbnailFile, "thumbnail");

    const uploadedSteps = await Promise.all(
      formattedSteps.map(uploadStepAssets),
    );

    const finalSteps = uploadedSteps.map((step, index) => ({
      ...step,
      step_order: index + 1,
    }));

    return {
      title: title.trim(),
      description,
      activity_type: selectedTemplate,
      speech_ladder_level: speechLadderLevel,
      max_attempts: maxAttempts,
      estimated_minutes: estimatedMinutes,
      allow_skip: true,
      success_required_count: 1,
      thumbnail_url: uploadedThumbnail?.url || thumbnail,
      ai_voice_gender: aiVoiceGender,
      ai_voice_speed: aiVoiceSpeed,
      status,
      uploaded_by: "Center Admin",
      delivery_mode: "screen",
      attention_demand: "medium",
      sensory_load: "medium",
      movement_level: "light",
      interaction_mode: "choice",
      topic_tags: [],
      visual_support_level: "standard",
      communication_mode: "spoken_words",
      assistance_level: "some_assistance",
      sensory_features: [],
      access_scope: assignmentType,
      learner_ids: selectedLearners,
      steps: finalSteps,
    };
  };

  const handleSaveDraft = () => {
    if (isSavingDraft || isPublishing || saveDraftInFlightRef.current) {
      return;
    }

    saveDraftInFlightRef.current = true;
    setIsSavingDraft(true);

    try {
      const nextDraftId =
        draftId ||
        `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const draft = {
        id: nextDraftId,
        title: title.trim() || "Untitled Activity Draft",
        description,
        selectedTemplate,
        thumbnail,
        maxAttempts,
        estimatedMinutes,
        aiVoiceGender,
        aiVoiceSpeed,
        selectedLearners,
        assignmentType,
        builderSteps,
        stepData: sanitizeStepDataForDraft(stepData),
        updatedAt: new Date().toISOString(),
      };

      const existingDrafts = JSON.parse(
        localStorage.getItem(ACTIVITY_DRAFT_STORAGE_KEY) || "[]",
      );

      const nextDrafts = Array.isArray(existingDrafts)
        ? [
            draft,
            ...existingDrafts.filter((item: any) => item.id !== nextDraftId),
          ]
        : [draft];

      localStorage.setItem(
        ACTIVITY_DRAFT_STORAGE_KEY,
        JSON.stringify(nextDrafts),
      );

      setDraftId(nextDraftId);
      alert("Draft saved. You can continue it from Draft Materials.");
    } catch (error) {
      console.error(error);
      alert("Failed to save draft.");
    } finally {
      saveDraftInFlightRef.current = false;
      setIsSavingDraft(false);
    }
  };

  const handlePreviewActivity = () => {
    const errors = validateActivity();

    if (errors.length > 0) {
      alert(`Please complete these before preview:\n\n${errors.join("\n")}`);
      return;
    }

    setPreviewActivity({
      id: draftId || "builder-preview",
      title: title.trim(),
      description,
      thumbnail_url: thumbnail,
      activity_steps: formatBuilderSteps(),
    });
  };

  const handlePublish = async () => {
    if (isPublishing || publishInFlightRef.current) {
      return;
    }

    const errors = validateActivity();

    if (errors.length > 0) {
      alert(`Please complete these before publish:\n\n${errors.join("\n")}`);
      return;
    }

    publishInFlightRef.current = true;
    setIsPublishing(true);

    try {
      const payload = await buildActivityPayload("published");
      await createActivity(payload);

      if (draftId) {
        const existingDrafts = JSON.parse(
          localStorage.getItem(ACTIVITY_DRAFT_STORAGE_KEY) || "[]",
        );

        const nextDrafts = Array.isArray(existingDrafts)
          ? existingDrafts.filter((item: any) => item.id !== draftId)
          : [];

        localStorage.setItem(
          ACTIVITY_DRAFT_STORAGE_KEY,
          JSON.stringify(nextDrafts),
        );
      }

      alert(
        selectedLearners.length > 0
          ? `Activity published and assigned to ${selectedLearners.length} learner(s)!`
          : "Activity published successfully!",
      );

      navigate("/center/materials");
    } catch (error) {
      console.error(error);
      alert("Failed to publish activity.");
    } finally {
      publishInFlightRef.current = false;
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-screen bg-[#F7F7F7] flex flex-col">

      {/* HEADER */}
      <header className="bg-white shadow-md border-b border-gray-300 px-10 py-4 flex items-center justify-between shrink-0">

        <div className="flex items-center gap-5">
          <img
            src={mobiLogo}
            alt="MOBI Logo"
            className="w-16 h-16 object-contain"
          />

          <div className="flex items-center gap-2">

            <span className="font-itim text-4xl">
              Build:
            </span>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              maxLength={60}
              placeholder="Add Activity Title"
              className="
                font-itim
                text-4xl
                bg-transparent
                outline-none
                placeholder:text-[#C7B8D3]
                w-80
                text-[#9021c4]
              "
            />

          </div>
        </div>

        <div className="flex items-center gap-10 font-itim text-2xl">
          <button
            onClick={() =>
              navigate(-1)
            }
          >
            Exit
          </button>

          <button
            type="button"
            onClick={handlePreviewActivity}
            className="flex items-center gap-2 text-[#7A5D7F]"
          >
            <Play size={22} />
            Preview
          </button>

          <button
            type="button"
            disabled={isSavingDraft || isPublishing}
            onClick={handleSaveDraft}
            className="text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            disabled={isPublishing || isSavingDraft}
            onClick={handlePublish}
            className="text-[#E37D4A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>

      </header>

      {previewActivity && (
        <ActivityPlayPreviewModal
          open={Boolean(previewActivity)}
          activity={previewActivity}
          fallbackImage={thumbnail || undefined}
          onClose={() => setPreviewActivity(null)}
        />
      )}

      {/* BODY */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">

        {/* LEFT TOOLBOX */}
        <div className="w-72 shrink-0 overflow-y-auto">

          <Toolbox
            onAddStep={addStep}
            onSkillArea={() =>
              scrollToSection(
                speechLadderRef,
                "skill"
              )
            }
            onDescription={() =>
              scrollToSection(
                descriptionRef,
                "description"
              )
            }
            onThumbnail={() =>
              scrollToSection(
                thumbnailRef,
                "thumbnail"
              )
            }
            onActivityLimits={() =>
              scrollToSection(
                activityLimitsRef,
                "limits"
              )
            }
            onAIVoice={() =>
              scrollToSection(
                aiVoiceRef,
                "voice"
              )
            }
            onAssignLearner={() =>
              scrollToSection(
                assignLearnerRef,
                "learner"
              )
            }
          />

        </div>

        {/* CENTER TIMELINE */}
        <div className="flex-1 overflow-y-auto pr-2">

          <div className="flex items-center justify-between mb-6">

            <h2 className="itim text-5xl">
              Activity Timeline
            </h2>

            <div className="mr-4 flex items-center gap-2">

              <button
                type="button"
                disabled={stepHistory.past.length === 0}
                onClick={undoStepChange}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#D8D8D8]
                  bg-white
                  text-gray-500
                  transition
                  hover:bg-[#F8EFFA]
                  hover:text-[#A85CB5]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Undo2 size={20} />
              </button>

              <button
                type="button"
                disabled={stepHistory.future.length === 0}
                onClick={redoStepChange}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#D8D8D8]
                  bg-white
                  text-gray-500
                  transition
                  hover:bg-[#F8EFFA]
                  hover:text-[#A85CB5]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <Redo2 size={20} />
              </button>

            </div>

          </div>

          <div className="bg-white border border-[#E59BE7] rounded-[30px] p-6">

            <div className="flex items-center gap-3 mb-8">

              <h3 className="font-itim text-3xl">
                Template: {selectedTemplate}
              </h3>

              <button>
                ✎
              </button>

            </div>

            {/* autoload step template */}
            <div className="space-y-6">

              {builderSteps.map((step, index) => {
                const stepKey = step.id;
                let stepComponent = null;

                const stepControls = {
                  onMoveUp: () => moveStep(step.id, "up"),
                  onMoveDown: () => moveStep(step.id, "down"),
                  onDelete: () => deleteStep(step.id),
                };

                switch (step.type) {

                  case "Teach":
                    stepComponent = (
                      <TeachStep
                        stepKey={stepKey}
                        variant={
                          selectedTemplate === "Story" ? "story" : "teach"
                        }
                        initialData={stepData[stepKey]}
                        onChange={updateStepData}
                        {...stepControls}
                      />
                    );
                    break;

                  case "Ask":
                    stepComponent = (
                      <AskStep
                        stepKey={stepKey}
                        initialData={stepData[stepKey]}
                        onChange={updateStepData}
                        {...stepControls}
                      />
                    );
                    break;

                  case "Feedback":
                    stepComponent = (
                      <FeedbackStep
                      stepKey={stepKey}
                      initialData={stepData[stepKey]}
                      onChange={updateStepData}
                      {...stepControls}
                    />
                    );
                    break;

                  case "Conversation":
                    stepComponent = (
                      <ConversationStep
                        stepKey={stepKey}
                        initialData={stepData[stepKey]}
                        onChange={updateStepData}
                        {...stepControls}
                      />
                    );
                    break;

                  case "Learn by Doing":
                    stepComponent = (
                      <DoItStep
                        stepKey={stepKey}
                        initialData={stepData[stepKey]}
                        onChange={updateStepData}
                        {...stepControls}
                      />
                    );
                    break;

                  case "Show & Choose":
                    stepComponent = (
                      <ShowChooseStep
                        stepKey={stepKey}
                        initialData={stepData[stepKey]}
                        onChange={updateStepData}
                        {...stepControls}
                      />
                    );
                    break;

                  default:
                    return null;
                }

                return (
                  <div
                    key={stepKey}
                    ref={(element) => {
                      stepRefs.current[stepKey] = element;
                    }}
                    className={`
                      transition-all duration-500
                      ${
                        highlightedSection === stepKey
                          ? "rounded-[30px] shadow-[0_0_25px_rgba(229,155,231,0.5)]"
                          : ""
                      }
                    `}
                  >
                    {stepComponent}
                  </div>
                );
              })}

              <StepDropZone onDropStep={addStep} />

              {/* other tools */}
              <div
                ref={speechLadderRef}
                className={`
                  transition-all duration-500
                  ${
                    highlightedSection === "skill"
                      ? "shadow-[0_0_25px_rgba(229,155,231,0.5)] rounded-[30px]"
                      : ""
                  }
                `}
              >
                <ActivitySpeechLadder
                  value={speechLadderLevel}
                  onChange={setSpeechLadderLevel}
                />
              </div>

              <div
                ref={descriptionRef}
                className={`
                  transition-all duration-500
                  ${
                    highlightedSection ===
                    "description"
                      ? "shadow-[0_0_25px_rgba(229,155,231,0.5)] rounded-[30px]"
                      : ""
                  }
                `}
              >
                <ActivityDescription
                  description={description}
                  setDescription={setDescription}
                />
              </div>

              <div
                ref={thumbnailRef}
                className={`
                  transition-all duration-500
                  ${
                    highlightedSection === "thumbnail"
                      ? "shadow-[0_0_25px_rgba(229,155,231,0.5)] rounded-[30px]"
                      : ""
                  }
                `}
              >
                <ActivityThumbnail
                  thumbnail={thumbnail}
                  setThumbnail={setThumbnail}
                  setThumbnailFile={setThumbnailFile}
                />
              </div>

              <div
                ref={activityLimitsRef}
                className={`
                  transition-all duration-500
                  ${
                    highlightedSection === "limits"
                      ? "shadow-[0_0_25px_rgba(229,155,231,0.5)] rounded-[30px]"
                      : ""
                  }
                `}
              >
                <ActivityLimits
                  maxAttempts={maxAttempts}
                  setMaxAttempts={setMaxAttempts}
                  estimatedMinutes={estimatedMinutes}
                  setEstimatedMinutes={setEstimatedMinutes}
                />
              </div>

              <div
                ref={aiVoiceRef}
                className={`
                  transition-all duration-500
                  ${
                    highlightedSection === "voice"
                      ? "shadow-[0_0_25px_rgba(229,155,231,0.5)] rounded-[30px]"
                      : ""
                  }
                `}
              >
                <ActivityAIVoice
                    selectedGender={aiVoiceGender}
                    setSelectedGender={setAiVoiceGender}
                    selectedSpeed={aiVoiceSpeed}
                    setSelectedSpeed={setAiVoiceSpeed}
                  />
              </div>

              <div
                ref={assignLearnerRef}
                className={`
                  transition-all duration-500
                  ${
                    highlightedSection === "learner"
                      ? "shadow-[0_0_25px_rgba(229,155,231,0.5)] rounded-[30px]"
                      : ""
                  }
                `}
              >
                <ActivityAssignLearner
                  selectedLearners={selectedLearners}
                  setSelectedLearners={setSelectedLearners}
                  assignmentType={assignmentType}
                  setAssignmentType={setAssignmentType}
                />
              </div>
{/* 
              <div ref={readinessRef}>
                <ActivityReadinessLadder />
              </div> */}

            </div>

          </div>

        </div>

        {/* RIGHT PREVIEW */}
        <div className="w-72 shrink-0 overflow-y-auto">

        <PreviewCard
          title={title}
          description={description}
          thumbnail={thumbnail}
          uploadedBy="Center Admin"
        />

        </div>

      </div>

    </div>
  );
}

export default CreateActivity;
