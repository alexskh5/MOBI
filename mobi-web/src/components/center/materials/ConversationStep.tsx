//mobi-web/src/components/center/materials/ConversationStep.tsx

// import { useRef, useState } from "react";
// import {
//   X,
//   Mic,
//   ChevronDown,
//   Volume2,
// } from "lucide-react";

// import VoiceStyleModal from "./VoiceStyleModal";
// import StepMenu from "./StepMenu";

// function ConversationStep() {
//   const [showVoiceModal, setShowVoiceModal] =
//     useState(false);

//   const [voiceStyle, setVoiceStyle] =
//     useState("Friendly");

//   const textareaRefs =
//     useRef<(HTMLTextAreaElement | null)[]>([]);

//   const [topics, setTopics] = useState([
//     "",
//   ]);

//   const addTopic = () => {
//     setTopics([
//       ...topics,
//       "",
//     ]);
//   };

//   const removeTopic = (
//     indexToRemove: number
//   ) => {
//     if (topics.length === 1) return;

//     setTopics(
//       topics.filter(
//         (_, index) =>
//           index !== indexToRemove
//       )
//     );
//   };

//   const handleTopicChange = (
//     index: number,
//     value: string,
//     textarea: HTMLTextAreaElement
//   ) => {

//     const updated = [...topics];

//     updated[index] = value;

//     setTopics(updated);

//     textarea.style.height = "auto";
//     textarea.style.height =
//       `${textarea.scrollHeight}px`;

//   };

//   return (
//     <>
//       <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

//         {/* HEADER */}
//         <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">

//           <div className="flex items-center gap-3">
//             <div className="w-6 h-6 rounded-full bg-[#D88AD8]"></div>

//             <h3 className="font-semibold text-xl">
//               Conversation Step
//             </h3>
//           </div>

//           {/* MENU */}
//           <div className="flex items-center gap-3">

//             <button
//               type="button"
//               onClick={() => setShowVoiceModal(true)}
//               className="flex items-center gap-2 rounded-full border border-[#D58CE5] bg-[#F8EFF9] px-3 py-1 text-[#A85CB5] hover:bg-[#F3E5F5]"
//             >
//               <Mic size={16} />

//               <span className="text-sm font-medium">
//                 {voiceStyle}
//               </span>

//               <ChevronDown size={16} />
//             </button>

//             {/* MENU */}
//             <StepMenu
//               onMoveUp={() => console.log("Move Up")}
//               onMoveDown={() => console.log("Move Down")}
//               onDelete={() => console.log("Delete Step")}
//             />

//           </div>

//         </div>

//         {/* BODY */}
//         <div className="bg-[#E4C9E5]/70 p-6">

//           <label className="block text-sm font-medium mb-3">
//             Add question or topics here to initiate conversation
//           </label>

//           <div className="space-y-3 w-full">

//             {topics.map(
//               (topic, index) => (
//                 <div
//                   key={index}
//                   className="relative w-full"
//                 >

//                   <div className="relative">

//                     <textarea
//                       ref={(el) => {
//                         textareaRefs.current[index] = el;
//                       }}
//                       rows={1}
//                       value={topic}
//                       placeholder="Type here..."
//                       onChange={(e) =>
//                         handleTopicChange(
//                           index,
//                           e.target.value,
//                           e.target
//                         )
//                       }
//                       className="w-full resize-none overflow-hidden border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
//                     />

//                     {/* Remove Topic */}
//                     {topics.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeTopic(index)}
//                         className="absolute right-10 text-gray-400 hover:text-[#E37D4A]"
//                         style={{
//                           top: `${
//                             (textareaRefs.current[index]?.offsetHeight ?? 44) - 31
//                           }px`,
//                         }}
//                       >
//                         <X size={16} />
//                       </button>
//                     )}

//                     {/* Voice Preview */}
//                     <button
//                       type="button"
//                       className="absolute right-3 text-[#6B7280] hover:text-[#5B4B8A]"
//                       style={{
//                         top: `${
//                           (textareaRefs.current[index]?.offsetHeight ?? 44) - 34
//                         }px`,
//                       }}
//                     >
//                       <Volume2 size={22} />
//                     </button>

//                   </div>

//                 </div>
//               )
//             )}

//           </div>

//           <button
//             type="button"
//             onClick={addTopic}
//             className="mt-4 px-4 py-2 bg-white border border-[#AAB7DA] rounded-full text-sm hover:bg-gray-50"
//           >
//             + Add another
//           </button>

//         </div>

//       </div>
//       <VoiceStyleModal
//         isOpen={showVoiceModal}
//         onClose={() => setShowVoiceModal(false)}
//         selectedStyle={voiceStyle}
//         onSelectStyle={setVoiceStyle}
//         stepType="ask"
//       />
//     </>
//   );
// }

// export default ConversationStep;




//mobi-web/src/components/center/materials/ConversationStep.tsx


import { useRef, useState } from "react";
import {
  X,
  Mic,
  ChevronDown,
  Volume2,
} from "lucide-react";

import VoiceStyleModal from "./VoiceStyleModal";
import StepMenu from "./StepMenu";
import { previewTTS } from "../../../services/activityApi";

type ConversationStepData = {
  topics: string[];
  ai_voice_style: string;
};

type ConversationStepProps = {
  stepKey: string;
  onChange: (stepKey: string, data: ConversationStepData) => void;
};

function ConversationStep({
  stepKey,
  onChange,
}: ConversationStepProps) {
  const [showVoiceModal, setShowVoiceModal] =
    useState(false);

  const [voiceStyle, setVoiceStyle] =
    useState("Friendly");

  const textareaRefs =
    useRef<(HTMLTextAreaElement | null)[]>([]);

  const [topics, setTopics] = useState([""]);

  // for tts
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  const updateParent = (
    nextTopics = topics,
    nextVoiceStyle = voiceStyle
  ) => {
    onChange(stepKey, {
      topics: nextTopics.filter((topic) => topic.trim() !== ""),
      ai_voice_style: nextVoiceStyle,
    });
  };

  const addTopic = () => {
    const nextTopics = [...topics, ""];
    setTopics(nextTopics);
    updateParent(nextTopics);
  };

  const removeTopic = (indexToRemove: number) => {
    if (topics.length === 1) return;

    const nextTopics = topics.filter(
      (_, index) => index !== indexToRemove
    );

    setTopics(nextTopics);
    updateParent(nextTopics);
  };

  const handleTopicChange = (
    index: number,
    value: string,
    textarea: HTMLTextAreaElement
  ) => {
    const updated = [...topics];

    updated[index] = value;

    setTopics(updated);
    updateParent(updated);

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // tts function
  const handlePreviewTopic = async (index: number) => {
  const text = topics[index];

  try {
    if (!text.trim()) {
      alert("Please type a topic first.");
      return;
    }

    setGeneratingIndex(index);

    await previewTTS({
      text,
      voice: "Kore",
      style: voiceStyle,
      emotion: "friendly and natural",
    });
  } catch (error) {
    console.error(error);
    alert("Failed to preview voice.");
  } finally {
    setGeneratingIndex(null);
  }
};

  return (
    <>
      <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#D88AD8]"></div>

            <h3 className="font-semibold text-xl">
              Conversation Step
            </h3>
          </div>

          {/* MENU */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowVoiceModal(true)}
              className="flex items-center gap-2 rounded-full border border-[#D58CE5] bg-[#F8EFF9] px-3 py-1 text-[#A85CB5] hover:bg-[#F3E5F5]"
            >
              <Mic size={16} />

              <span className="text-sm font-medium">
                {voiceStyle}
              </span>

              <ChevronDown size={16} />
            </button>

            <StepMenu
              onMoveUp={() => console.log("Move Up")}
              onMoveDown={() => console.log("Move Down")}
              onDelete={() => console.log("Delete Step")}
            />
          </div>
        </div>

        {/* BODY */}
        <div className="bg-[#E4C9E5]/70 p-6">
          <label className="block text-sm font-medium mb-3">
            Add question or topics here to initiate conversation
          </label>

          <div className="space-y-3 w-full">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="relative w-full"
              >
                <div className="relative">
                  <textarea
                    ref={(el) => {
                      textareaRefs.current[index] = el;
                    }}
                    rows={1}
                    value={topic}
                    placeholder="Type here..."
                    onChange={(e) =>
                      handleTopicChange(
                        index,
                        e.target.value,
                        e.target
                      )
                    }
                    className="w-full resize-none overflow-hidden border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
                  />

                  {topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopic(index)}
                      className="absolute right-10 text-gray-400 hover:text-[#E37D4A]"
                      style={{
                        top: `${
                          (textareaRefs.current[index]?.offsetHeight ?? 44) - 31
                        }px`,
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={generatingIndex === index}
                    onClick={() => handlePreviewTopic(index)}
                    className={`
                      absolute right-3 transition-all duration-300
                      ${
                        generatingIndex === index
                          ? "text-[#A85CB5] animate-pulse scale-110"
                          : "text-[#6B7280] hover:text-[#5B4B8A]"
                      }
                    `}
                    style={{
                      top: `${
                        (textareaRefs.current[index]?.offsetHeight ?? 44) - 34
                      }px`,
                    }}
                  >
                    <Volume2 size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTopic}
            className="mt-4 px-4 py-2 bg-white border border-[#AAB7DA] rounded-full text-sm hover:bg-gray-50"
          >
            + Add another
          </button>
        </div>
      </div>

      <VoiceStyleModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        selectedStyle={voiceStyle}
        onSelectStyle={(style) => {
          setVoiceStyle(style);
          updateParent(topics, style);
        }}
        stepType="ask"
      />
    </>
  );
}

export default ConversationStep;