// MOBI/mobi-web/src/pages/therapist/materials/CreateActivity.tsx

import { useEffect, useRef, useState } from "react";
import { Redo2, Undo2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

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
import ActivityAssignLearner from "../../../components/center/materials/ActivityAssignLearnerMock";
import ActivityLimits from "../../../components/center/materials/ActivityLimits";
import StepDropZone from "../../../components/center/materials/StepDropZone";

import {
  createActivity,
  getActivityById,
  updateActivity,
} from "../../../services/activityApi";
import { getTherapistById } from "../../../services/therapist/therapistApi";

function CreateActivity() {
  const location = useLocation();
  const navigate = useNavigate();

  const therapistId =
    localStorage.getItem(
      "mobi_staff_profile_id",
    );

  const [
    currentTherapistName,
    setCurrentTherapistName,
  ] = useState(
    "Therapist",
  );

  const existingActivityId =
    location.state?.activityId ||
    location.state?.draftId ||
    null;

  const [
    existingStatus,
    setExistingStatus,
  ] = useState<string | null>(
    null,
  );

  const [
    loadingExisting,
    setLoadingExisting,
  ] = useState(
    Boolean(
      existingActivityId,
    ),
  );

  const [title, setTitle] = useState("");

  const [
    selectedTemplate,
    setSelectedTemplate,
  ] = useState(
    location.state?.template ||
      "Teach & Practice"
  );

  const [description, setDescription] = useState("");

  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const [maxAttempts, setMaxAttempts] = useState(3);
  const [estimatedMinutes, setEstimatedMinutes] = useState(5);

  const [
    speechLadderLevel,
    setSpeechLadderLevel,
  ] = useState("word");

  const [stepData, setStepData] = useState<Record<string, any>>({});

  const [aiVoiceGender, setAiVoiceGender] = useState("girl");
  const [aiVoiceSpeed, setAiVoiceSpeed] = useState("moderate");

  const [highlightedSection, setHighlightedSection] = useState("");

  const [customSteps, setCustomSteps] = useState<string[]>([]);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [loadingExistingActivity, setLoadingExistingActivity] =
    useState(false);

  const speechLadderRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const activityLimitsRef = useRef<HTMLDivElement>(null);
  const aiVoiceRef = useRef<HTMLDivElement>(null);
  const assignLearnerRef = useRef<HTMLDivElement>(null);

  const steps =
    ACTIVITY_TEMPLATES[
      selectedTemplate as keyof typeof ACTIVITY_TEMPLATES
    ] || [];

  const updateStepData = (stepKey: string, data: any) => {
    setStepData((prev) => ({
      ...prev,
      [stepKey]: data,
    }));
  };

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

  const addStep = (stepType: string) => {
    setCustomSteps([...customSteps, stepType]);
  };

  const stepTypeToLabel = (
    stepType: string,
  ) => {
    const map:
      Record<string, string> = {
        teach: "Teach",
        ask: "Ask",
        feedback: "Feedback",
        conversation:
          "Conversation",
        do_it:
          "Learn by Doing",
        show_choose:
          "Show & Choose",
      };

    return (
      map[stepType] ||
      stepType
    );
  };

  const loadStepData =
    (
      activitySteps:
        any[],
      templateLength:
        number,
    ) => {
      const loaded:
        Record<
          string,
          any
        > = {};

      const extra:
        string[] = [];

      activitySteps.forEach(
        (
          step,
          index,
        ) => {
          const isTemplate =
            index <
            templateLength;

          const key =
            isTemplate
              ? `template-${index}`
              : `custom-${
                  index -
                  templateLength
                }`;

          loaded[key] = {
            lesson:
              step.lesson ||
              "",

            question:
              step.question ||
              "",

            instruction:
              step.instruction ||
              "",

            prompt:
              step.prompt ||
              "",

            media:
              step.media ||
              [],

            choices:
              step.choices ||
              [],

            topics:
              step.topics ||
              [],

            materials_needed:
              step.materials_needed ||
              [],

            expected_answers:
              step.expected_answers ||
              [],

            accepted_variations:
              step.accepted_variations ||
              [],

            correct_feedback:
              step.correct_feedback ||
              [],

            wrong_feedback:
              step.wrong_feedback ||
              [],

            max_attempts_feedback:
              step.max_attempts_feedback ||
              [],

            ai_voice_style:
              step.ai_voice_style ||
              null,
          };

          if (!isTemplate) {
            extra.push(
              stepTypeToLabel(
                step.step_type,
              ),
            );
          }
        },
      );

      setStepData(
        loaded,
      );

      setCustomSteps(
        extra,
      );
    };

  useEffect(() => {
    let mounted = true;

    async function loadTherapist() {
      if (!therapistId) {
        navigate(
          "/login",
          {
            replace: true,
          },
        );

        return;
      }

      try {
        const result =
          await getTherapistById(
            therapistId,
          );

        const therapist =
          result?.therapist;

        if (
          mounted &&
          therapist
        ) {
          setCurrentTherapistName(
            [
              therapist.first_name,
              therapist.middle_name,
              therapist.last_name,
            ]
              .filter(Boolean)
              .join(" ") ||
              "Therapist",
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Unable to load Therapist identity:",
          error,
        );
      }
    }

    void loadTherapist();

    return () => {
      mounted = false;
    };
  }, [
    navigate,
    therapistId,
  ]);

  useEffect(() => {
    if (
      !existingActivityId
    ) {
      return;
    }

    let mounted = true;

    async function loadExisting() {
      try {
        setLoadingExisting(
          true,
        );

        const activity =
          await getActivityById(
            existingActivityId,
          );

        if (!mounted) {
          return;
        }

        if (
          therapistId &&
          activity.created_by_therapist_id &&
          activity.created_by_therapist_id !==
            therapistId
        ) {
          throw new Error(
            "You can only edit your own Therapist-created activity.",
          );
        }

        const activityType =
          activity.activity_type ||
          "Teach & Practice";

        setSelectedTemplate(
          activityType,
        );

        setTitle(
          activity.title ||
          "",
        );

        setDescription(
          activity.description ||
          "",
        );

        setThumbnail(
          activity.thumbnail_url ||
          null,
        );

        setMaxAttempts(
          activity.max_attempts ??
          3,
        );

        setEstimatedMinutes(
          activity.estimated_minutes ??
          5,
        );

        setSpeechLadderLevel(
          activity.speech_ladder_level ||
          "word",
        );

        setAiVoiceGender(
          activity.ai_voice_gender ||
          "girl",
        );

        setAiVoiceSpeed(
          activity.ai_voice_speed ||
          "moderate",
        );

        setExistingStatus(
          activity.status ||
          null,
        );

        const templateSteps =
          ACTIVITY_TEMPLATES[
            activityType as keyof typeof ACTIVITY_TEMPLATES
          ] || [];

        loadStepData(
          activity.steps ||
            activity.activity_steps ||
            [],
          templateSteps.length,
        );
      } catch (
        error: any
      ) {
        console.error(
          error,
        );

        alert(
          error?.message ||
            "Unable to load activity.",
        );
      } finally {
        if (mounted) {
          setLoadingExisting(
            false,
          );
        }
      }
    }

    void loadExisting();

    return () => {
      mounted = false;
    };
  }, [
    existingActivityId,
    therapistId,
  ]);

  const buildFormattedSteps =
    () => {
      const allSteps = [
        ...steps,
        ...customSteps,
      ];

      return allSteps.map(
        (
          step,
          index,
        ) => {
          const stepKey =
            index <
            steps.length
              ? `template-${index}`
              : `custom-${
                  index -
                  steps.length
                }`;

          const savedStepData =
            stepData[
              stepKey
            ] || {};

          const stepTypeMap:
            Record<
              string,
              string
            > = {
              Teach:
                "teach",
              Ask:
                "ask",
              Feedback:
                "feedback",
              Conversation:
                "conversation",
              "Learn by Doing":
                "do_it",
              "Show & Choose":
                "show_choose",
            };

          return {
            step_order:
              index + 1,

            step_type:
              stepTypeMap[
                step
              ] ||
              step.toLowerCase(),

            instruction:
              step ===
              "Learn by Doing"
                ? savedStepData.instruction ||
                  ""
                : savedStepData.instruction ||
                  `${step} step`,

            materials_needed:
              step ===
              "Learn by Doing"
                ? savedStepData.materials_needed ||
                  []
                : savedStepData.materials_needed ||
                  [],

            prompt:
              savedStepData.prompt ||
              (
                step ===
                "Ask"
                  ? savedStepData.question ||
                    `Ask step for ${title}.`
                  : step ===
                    "Teach"
                    ? savedStepData.lesson ||
                      `Teach step for ${title}.`
                    : step ===
                      "Show & Choose"
                      ? savedStepData.question ||
                        `Show and choose step for ${title}.`
                      : step ===
                        "Learn by Doing"
                        ? savedStepData.instruction ||
                          `Learn by doing step for ${title}.`
                        : step ===
                          "Conversation"
                          ? savedStepData.topics?.[0] ||
                            `Conversation step for ${title}.`
                          : `This is a ${step} step for ${title}.`
              ),

            lesson:
              step ===
              "Teach"
                ? savedStepData.lesson ||
                  ""
                : undefined,

            question:
              step ===
                "Ask" ||
              step ===
                "Show & Choose"
                ? savedStepData.question ||
                  ""
                : undefined,

            expected_answers:
              savedStepData.expected_answers ||
              [],

            accepted_variations:
              savedStepData.accepted_variations ||
              [],

            choices:
              savedStepData.choices ||
              [],

            correct_feedback:
              savedStepData.correct_feedback ||
              [],

            wrong_feedback:
              savedStepData.wrong_feedback ||
              [],

            max_attempts_feedback:
              savedStepData.max_attempts_feedback ||
              [],

            topics:
              savedStepData.topics ||
              [],

            can_repeat:
              true,

            can_give_hint:
              true,

            can_skip:
              true,

            ai_voice_style:
              savedStepData.ai_voice_style ||
              null,

            ai_feedback_rules: {
              correct:
                savedStepData.correct_feedback ||
                [],

              wrong:
                savedStepData.wrong_feedback ||
                [],

              max_attempts_reached:
                savedStepData.max_attempts_feedback ||
                [],
            },
          };
        },
      );
    };

  const buildPayload =
    (
      status:
        "draft" |
        "pending_review",
    ) => ({
      title:
        title.trim(),

      description,

      activity_type:
        selectedTemplate,

      speech_ladder_level:
        speechLadderLevel,

      max_attempts:
        maxAttempts,

      estimated_minutes:
        estimatedMinutes,

      allow_skip:
        true,

      success_required_count:
        1,

      thumbnail_url:
        thumbnail,

      ai_voice_gender:
        aiVoiceGender,

      ai_voice_speed:
        aiVoiceSpeed,

      status,

      steps:
        buildFormattedSteps(),
    });

  const handleSaveDraft = async () => {
    try {
      if (!title.trim()) {
        alert(
          "Please add an activity title before saving.",
        );

        return;
      }

      const nextStatus:
        "draft" |
        "pending_review" =
        existingActivityId &&
        existingStatus !==
          "draft"
          ? "pending_review"
          : "draft";

      const payload =
        buildPayload(
          nextStatus,
        );

      if (
        existingActivityId
      ) {
        await updateActivity(
          existingActivityId,
          payload,
        );
      } else {
        await createActivity(
          payload,
        );
      }

      if (
        nextStatus ===
        "draft"
      ) {
        alert(
          "Draft saved.",
        );

        navigate(
          "/therapist/materials/DraftMaterials",
        );
      } else {
        alert(
          "Changes saved and sent back for Center review.",
        );

        navigate(
          "/therapist/materials",
        );
      }
    } catch (
      error: any
    ) {
      console.error(
        error,
      );

      alert(
        error?.message ||
          "Failed to save activity.",
      );
    }
  };

  const handleSubmitForReview = async () => {
    try {
      if (!title.trim()) {
        alert(
          "Please add an activity title.",
        );

        return;
      }

      const payload =
        buildPayload(
          "pending_review",
        );

      if (
        existingActivityId
      ) {
        await updateActivity(
          existingActivityId,
          payload,
        );
      } else {
        await createActivity(
          payload,
        );
      }

      alert(
        "Activity submitted for Center review!",
      );

      navigate(
        "/therapist/materials",
      );
    } catch (
      error: any
    ) {
      console.error(
        error,
      );

      alert(
        error?.message ||
          "Failed to submit activity for review.",
      );
    }
  };

  if (
    loadingExisting
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F7F7]">
        <p className="text-lg font-semibold text-gray-600">
          Loading activity...
        </p>
      </div>
    );
  }

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
            onClick={handleSaveDraft}
            className="text-gray-600 hover:text-gray-800"
          >
            {existingActivityId &&
            existingStatus !==
              "draft"
              ? "Save Changes"
              : "Save Draft"}
          </button>

          <button
            onClick={handleSubmitForReview}
            className="text-[#E37D4A]"
          >
            {isEditingExistingActivity
              ? "Publish Revision"
              : "Publish"}
          </button>
        </div>
      </header>

      {loadingExistingActivity && (
        <div className="bg-[#FFF8E8] px-10 py-3 text-sm font-semibold text-[#8A5B00]">
          Loading activity for revision...
        </div>
      )}

      {reviewFeedback && (
        <div className="mx-6 mt-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-bold text-red-700">
            Center admin feedback
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700">
            {reviewFeedback}
          </p>
        </div>
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
                "
              >
                <Undo2 size={20} />
              </button>

              <button
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

            {/* AUTOLOAD TEMPLATE STEPS */}
            <div className="space-y-6">
              {steps.map((step, index) => {
                switch (step) {
                  case "Teach":
                    return (
                      <TeachStep
                        key={index}
                        stepKey={`template-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Ask":
                    return (
                      <AskStep
                        key={index}
                        stepKey={`template-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Feedback":
                    return (
                      <FeedbackStep
                        key={index}
                        stepKey={`template-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Conversation":
                    return (
                      <ConversationStep
                        key={index}
                        stepKey={`template-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Learn by Doing":
                    return (
                      <DoItStep
                        key={index}
                        stepKey={`template-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Show & Choose":
                    return (
                      <ShowChooseStep
                        key={index}
                        stepKey={`template-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  default:
                    return null;
                }
              })}

              {/* CUSTOM ADDED STEPS */}
              {customSteps.map((step, index) => {
                switch (step) {
                  case "Teach":
                    return (
                      <TeachStep
                        key={index}
                        stepKey={`custom-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Ask":
                    return (
                      <AskStep
                        key={index}
                        stepKey={`custom-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Feedback":
                    return (
                      <FeedbackStep
                        key={index}
                        stepKey={`custom-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Conversation":
                    return (
                      <ConversationStep
                        key={index}
                        stepKey={`custom-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Learn by Doing":
                    return (
                      <DoItStep
                        key={index}
                        stepKey={`custom-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  case "Show & Choose":
                    return (
                      <ShowChooseStep
                        key={index}
                        stepKey={`custom-${index}`}
                        onChange={updateStepData}
                      />
                    );

                  default:
                    return null;
                }
              })}

              <StepDropZone />

              {/* ACTIVITY SETTINGS SECTIONS */}
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
                <ActivitySpeechLadder />
              </div>

              <div
                ref={descriptionRef}
                className={`
                  transition-all duration-500
                  ${
                    highlightedSection === "description"
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
                <ActivityAssignLearner />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="w-72 shrink-0 overflow-y-auto">
          <PreviewCard
            title={title}
            description={description}
            thumbnail={thumbnail}
            uploadedBy={currentTherapistName}
          />
        </div>
      </div>
    </div>
  );
}

export default CreateActivity;
