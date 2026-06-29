// MOBI/mobi-web/src/pages/center/materials/CreateActivity.tsx
import { useState, useRef } from "react";
import {
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
import ActivityAssignLearner from "../../../components/center/materials/ActivityAssignLearner";
// import ActivityReadinessLadder from "../../../components/center/materials/ActivityReadinessLadder";
// newly added
import ActivityLimits from "../../../pages/center/materials/ActivityLimits";
import StepDropZone from "../../../components/center/materials/StepDropZone";

import { createActivity } from "../../../services/activityApi";

function CreateActivity() {
  const location = useLocation();

  const navigate = useNavigate();

  const [title, setTitle] =
    useState("");

  const [selectedTemplate] =
    useState(
      location.state?.template || "Teach & Practice"
    );

  const [description, setDescription] =
    useState("");

  const [thumbnail, setThumbnail] =
    useState<string | null>(null);

      // newly added 
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [estimatedMinutes, setEstimatedMinutes] = useState(5); 

  const steps =
    ACTIVITY_TEMPLATES[
      selectedTemplate as keyof typeof ACTIVITY_TEMPLATES
    ];

  const speechLadderRef =
    useRef<HTMLDivElement>(null);

  const descriptionRef =
    useRef<HTMLDivElement>(null);

  const thumbnailRef =
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

  const [customSteps, setCustomSteps] =
    useState<string[]>([]);

  const addStep = (
    stepType: string
  ) => {
    setCustomSteps([
      ...customSteps,
      stepType,
    ]);
  };

  const handlePublish = async () => {
  try {
    if (!title.trim()) {
      alert("Please add an activity title.");
      return;
    }

    const allSteps = [...steps, ...customSteps];

    const formattedSteps = allSteps.map((step) => {
      const stepTypeMap: Record<string, string> = {
        Teach: "teach",
        Ask: "ask",
        Feedback: "feedback",
        Conversation: "conversation",
        "Learn by Doing": "do_it",
        "Show & Choose": "show_choose",
      };

      return {
        step_type: stepTypeMap[step] || step.toLowerCase(),
        instruction: `${step} step`,
        prompt: `This is a ${step} step for ${title}.`,
        expected_answers: step === "Ask" ? ["sample answer"] : [],
        accepted_variations: step === "Ask" ? ["sample", "answer"] : [],
        can_repeat: true,
        can_give_hint: true,
        can_skip: true,
        ai_feedback_rules: {
          correct: "Great job!",
          almost: "Nice try. Let's say it again.",
          incorrect: "That's okay. Let's try again gently.",
          max_attempts_reached: "Good effort. Let's move on.",
        },
      };
    });

    const payload = {
      title,
      description,
      activity_type: selectedTemplate,
      speech_ladder_level: "word",
      max_attempts: maxAttempts,
      estimated_minutes: estimatedMinutes,
      allow_skip: true,
      success_required_count: 1,
      thumbnail_url: thumbnail,
      ai_voice_gender: "girl",
      ai_voice_speed: "moderate",
      status: "published",
      uploaded_by: "Center Admin",
      steps: formattedSteps,
    };

    await createActivity(payload);

    alert("Activity published successfully!");
    navigate("/center/materials");
  } catch (error) {
    console.error(error);
    alert("Failed to publish activity.");
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
          <span
            className="
              text-gray-500
              text-lg
              italic
            "
          >
            Changes are saved automatically
          </span>

          <button
            onClick={() =>
              navigate(-1)
            }
          >
            Exit
          </button>

          <button
            onClick={handlePublish}
            className="text-[#E37D4A]"
          >
            Publish
          </button>
        </div>

      </header>

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

            {/* autoload step template */}
            <div className="space-y-6">

              {steps.map((step, index) => {

                switch (step) {

                  case "Teach":
                    return (
                      <TeachStep
                        key={index}
                      />
                    );

                  case "Ask":
                    return (
                      <AskStep
                        key={index}
                      />
                    );

                  case "Feedback":
                    return (
                      <FeedbackStep
                        key={index}
                      />
                    );

                  case "Conversation":
                    return (
                      <ConversationStep
                        key={index}
                      />
                    );

                  case "Learn by Doing":
                    return (
                      <DoItStep
                        key={index}
                      />
                    );

                  case "Show & Choose":
                    return (
                      <ShowChooseStep
                        key={index}
                      />
                    );

                  default:
                    return null;
                }
              })}

              {customSteps.map((step, index) => {
                switch (step) {

                  case "Teach":
                    return (
                      <TeachStep
                        key={index}
                      />
                    );

                  case "Ask":
                    return (
                      <AskStep
                        key={index}
                      />
                    );

                  case "Feedback":
                    return (
                      <FeedbackStep
                        key={index}
                      />
                    );

                  case "Conversation":
                    return (
                      <ConversationStep
                        key={index}
                      />
                    );

                  case "Learn by Doing":
                    return (
                      <DoItStep
                        key={index}
                      />
                    );

                  case "Show & Choose":
                    return (
                      <ShowChooseStep
                        key={index}
                      />
                    );

                  default:
                    return null;
                }
              })}

              <StepDropZone />

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
                <ActivitySpeechLadder />
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
                />

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
                <ActivityAIVoice />
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
        />

        </div>

      </div>

    </div>
  );
}

export default CreateActivity;