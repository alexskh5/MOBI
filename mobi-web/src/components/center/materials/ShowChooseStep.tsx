//mobi-web/src/components/center/materials/ShowChooseStep.tsx

// import { useRef, useState } from "react";
// import {
//   X,
//   Volume2,
//   Mic,
//   ChevronDown,
// } from "lucide-react";

// import VoiceStyleModal from "./VoiceStyleModal";
// import StepMenu from "./StepMenu";

// function ShowAndChooseStep() {
//   const [showVoiceModal, setShowVoiceModal] =
//     useState(false);

//   const [voiceStyle, setVoiceStyle] =
//     useState("Friendly");

//   const [question, setQuestion] =
//     useState("");

//   const textareaRef =
//    useRef<HTMLTextAreaElement>(null);

//   interface Choice {
//     image: string | null;
//     isCorrect: boolean;
//   }

//   const [choices, setChoices] = useState<Choice[]>([
//     {
//       image: null,
//       isCorrect: false,
//     },
//     {
//       image: null,
//       isCorrect: false,
//     },
//   ]);

//   const addChoice = () => {
//     setChoices([
//       ...choices,
//       {
//         image: null,
//         isCorrect: false,
//       },
//     ]);
//   };

//   const uploadChoiceImage = (
//     index: number,
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {

//     const file = e.target.files?.[0];

//     if (!file) return;

//     const updated = [...choices];

//     updated[index].image =
//       URL.createObjectURL(file);

//     setChoices(updated);

//   };

//   const setCorrectChoice = (
//     index: number
//   ) => {

//     const updated = choices.map(
//       (choice, i) => ({
//         ...choice,
//         isCorrect: i === index,
//       })
//     );

//     setChoices(updated);

//   };

//   const removeChoice = (
//     index: number
//   ) => {

//     if (choices.length <= 2) return;

//     setChoices(
//       choices.filter(
//         (_, i) => i !== index
//       )
//     );

//   };

//   const handleQuestionChange = (
//     e: React.ChangeEvent<HTMLTextAreaElement>
//   ) => {

//     setQuestion(e.target.value);

//     e.target.style.height = "auto";

//     e.target.style.height =
//       `${e.target.scrollHeight}px`;

//   };

//   return (
//     <>
//       <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

//         {/* HEADER */}
//         <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">

//           <div className="flex items-center gap-3">
//             <div className="w-6 h-6 rounded-full bg-[#F5A300]"></div>

//             <h3 className="font-semibold text-xl">
//               Show & Choose Step
//             </h3>
//           </div>

//           <div className="flex items-center gap-3">

//             <button
//               type="button"
//               onClick={() =>
//                 setShowVoiceModal(true)
//               }
//               className="flex items-center gap-2 rounded-full border border-[#D58CE5] bg-[#F8EFF9] px-3 py-1 text-[#A85CB5] hover:bg-[#F3E5F5]"
//             >

//               <Mic size={16} />

//               <span className="text-sm font-medium">
//                 {voiceStyle}
//               </span>

//               <ChevronDown size={16} />

//             </button>

//             {/* menu */}
//             <StepMenu
//               onMoveUp={() => console.log("Move Up")}
//               onMoveDown={() => console.log("Move Down")}
//               onDelete={() => console.log("Delete Step")}
//             />

//           </div>

//         </div>

//         {/* BODY */}
//         <div className="bg-[#E4C9E5]/70 p-6">

//           {/* QUESTION */}
//           <div className="relative">

//             <textarea
//               ref={textareaRef}
//               value={question}
//               onChange={handleQuestionChange}
//               rows={1}
//               placeholder="Type question here..."
//               className="w-full resize-none overflow-hidden border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
//             />

//             <button
//               type="button"
//               className="absolute right-3 text-[#6B7280] hover:text-[#5B4B8A]"
//               style={{
//                 top: `${(textareaRef.current?.offsetHeight ?? 44) - 34}px`,
//               }}
//             >
//               <Volume2 size={22} />
//             </button>

//           </div>

//           {/* IMAGE CHOICES */}
//           <div className=" ">

//             <label className="block text-sm font-medium mb-3">
//               Select the correct image by clicking the radio button.
//             </label>

//             <div className="grid grid-cols-2 gap-5">

//               {choices.map((choice, index) => (

//                 <div
//                   key={index}
//                   className="flex items-start gap-3"
//                 >

//                   {/* Correct Answer */}

//                   <input
//                     type="radio"
//                     checked={choice.isCorrect}
//                     onChange={() =>
//                       setCorrectChoice(index)
//                     }
//                     className="mt-3 h-4 w-4 accent-[#B25AC7]"
//                   />

//                   {/* Image Card */}

//                   <div className="flex-1">

//                     <div className="relative rounded-xl border border-[#AAB7DA] bg-white p-4">

//                       {choices.length > 2 && (

//                         <button
//                           type="button"
//                           onClick={() => removeChoice(index)}
//                           className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow text-red-500 hover:bg-red-50"
//                         >
//                           <X size={16} />
//                         </button>

//                       )}

//                       <input
//                         id={`choice-image-${index}`}
//                         type="file"
//                         accept="image/*"
//                         className="hidden"
//                         onChange={(e) =>
//                           uploadChoiceImage(index, e)
//                         }
//                       />

//                       {choice.image ? (

//                       <label
//                         htmlFor={`choice-image-${index}`}
//                         className="block cursor-pointer"
//                       >

//                         <img
//                           src={choice.image}
//                           alt="Choice"
//                           className="h-32 w-full rounded-lg object-contain pt-2 hover:opacity-90 transition"
//                         />

//                         <p className="mt-2 text-center text-xs text-gray-500">
//                           Click image to replace
//                         </p>

//                       </label>

//                       ) : (

//                         <label
//                           htmlFor={`choice-image-${index}`}
//                           className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2
//                           border-dashed border-gray-300 text-center hover:bg-gray-50"
//                         >

//                           <p className="font-medium">
//                             Upload Choice Image
//                           </p>

//                           <p className="text-sm text-gray-500">
//                             Click to browse files
//                           </p>

//                         </label>

//                       )}

//                     </div>

//                   </div>

//                 </div>

//               ))}

//             </div>

//             <button
//               type="button"
//               onClick={addChoice}
//               className="mt-5 rounded-full border border-[#AAB7DA] bg-white px-4 py-2 text-sm hover:bg-gray-50"
//             >
//               + Add Choice
//             </button>

//           </div>

//         </div>

//       </div>

//       <VoiceStyleModal
//         isOpen={showVoiceModal}
//         onClose={() =>
//           setShowVoiceModal(false)
//         }
//         selectedStyle={voiceStyle}
//         onSelectStyle={setVoiceStyle}
//         stepType="ask"
//       />
//     </>
//   );
// }

// export default ShowAndChooseStep;




// mobi-web/src/components/center/materials/ShowChooseStep.tsx

import { useRef, useState } from "react";
import {
  X,
  Volume2,
  Mic,
  ChevronDown,
} from "lucide-react";

import VoiceStyleModal from "./VoiceStyleModal";
import StepMenu from "./StepMenu";
import { previewTTS } from "../../../services/activityApi";

type Choice = {
  id: number;
  label: string;
  image_url?: string;
  is_correct: boolean;
};

type ShowChooseStepData = {
  question: string;
  choices: Choice[];
  ai_voice_style: string;
};

type ShowChooseStepProps = {
  stepKey: string;
  onChange: (stepKey: string, data: ShowChooseStepData) => void;
};

function ShowAndChooseStep({ stepKey, onChange }: ShowChooseStepProps) {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState("Friendly");
  const [question, setQuestion] = useState("");
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [choices, setChoices] = useState<Choice[]>([
    { id: 1, label: "Choice A", image_url: undefined, is_correct: false },
    { id: 2, label: "Choice B", image_url: undefined, is_correct: false },
  ]);

  const updateParent = (
    nextQuestion = question,
    nextChoices = choices,
    nextVoiceStyle = voiceStyle
  ) => {
    onChange(stepKey, {
      question: nextQuestion,
      choices: nextChoices,
      ai_voice_style: nextVoiceStyle,
    });
  };

  const addChoice = () => {
    const nextChoices = [
      ...choices,
      {
        id: choices.length + 1,
        label: `Choice ${String.fromCharCode(65 + choices.length)}`,
        image_url: undefined,
        is_correct: false,
      },
    ];

    setChoices(nextChoices);
    updateParent(question, nextChoices);
  };

  const uploadChoiceImage = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updated = [...choices];
    updated[index] = {
      ...updated[index],
      image_url: URL.createObjectURL(file),
    };

    setChoices(updated);
    updateParent(question, updated);
  };

  const setCorrectChoice = (index: number) => {
    const updated = choices.map((choice, i) => ({
      ...choice,
      is_correct: i === index,
    }));

    setChoices(updated);
    updateParent(question, updated);
  };

  const removeChoice = (index: number) => {
    if (choices.length <= 2) return;

    const nextChoices = choices
      .filter((_, i) => i !== index)
      .map((choice, i) => ({
        ...choice,
        id: i + 1,
        label: `Choice ${String.fromCharCode(65 + i)}`,
      }));

    setChoices(nextChoices);
    updateParent(question, nextChoices);
  };

  const handleQuestionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    setQuestion(value);
    updateParent(value, choices);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handlePreviewQuestion = async () => {
    try {
      if (!question.trim()) {
        alert("Please type a question first.");
        return;
      }

      setIsGeneratingVoice(true);

      await previewTTS({
        text: question,
        voice: "Kore",
        style: voiceStyle,
        emotion: "friendly and gentle",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to preview voice.");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  return (
    <>
      <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">
        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#F5A300]" />

            <h3 className="font-semibold text-xl">
              Show & Choose Step
            </h3>
          </div>

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

        <div className="bg-[#E4C9E5]/70 p-6">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={handleQuestionChange}
              rows={1}
              placeholder="Type question here..."
              className="w-full resize-none overflow-hidden border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
            />

            <button
              type="button"
              disabled={isGeneratingVoice}
              onClick={handlePreviewQuestion}
              className={`
                absolute right-3 transition-all duration-300
                ${
                  isGeneratingVoice
                    ? "text-[#A85CB5] animate-pulse scale-110"
                    : "text-[#6B7280] hover:text-[#5B4B8A]"
                }
              `}
              style={{
                top: `${(textareaRef.current?.offsetHeight ?? 44) - 34}px`,
              }}
            >
              <Volume2 size={22} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 mt-5">
              Select the correct image by clicking the radio button.
            </label>

            <div className="grid grid-cols-2 gap-5">
              {choices.map((choice, index) => (
                <div key={choice.id} className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={choice.is_correct}
                    onChange={() => setCorrectChoice(index)}
                    className="mt-3 h-4 w-4 accent-[#B25AC7]"
                  />

                  <div className="flex-1">
                    <div className="relative rounded-xl border border-[#AAB7DA] bg-white p-4">
                      {choices.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeChoice(index)}
                          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow text-red-500 hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      )}

                      <input
                        id={`choice-image-${stepKey}-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => uploadChoiceImage(index, e)}
                      />

                      {choice.image_url ? (
                        <label
                          htmlFor={`choice-image-${stepKey}-${index}`}
                          className="block cursor-pointer"
                        >
                          <img
                            src={choice.image_url}
                            alt="Choice"
                            className="h-32 w-full rounded-lg object-contain pt-2 hover:opacity-90 transition"
                          />

                          <p className="mt-2 text-center text-xs text-gray-500">
                            Click image to replace
                          </p>
                        </label>
                      ) : (
                        <label
                          htmlFor={`choice-image-${stepKey}-${index}`}
                          className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-center hover:bg-gray-50"
                        >
                          <p className="font-medium">
                            Upload Choice Image
                          </p>

                          <p className="text-sm text-gray-500">
                            Click to browse files
                          </p>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addChoice}
              className="mt-5 rounded-full border border-[#AAB7DA] bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              + Add Choice
            </button>
          </div>
        </div>
      </div>

      <VoiceStyleModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        selectedStyle={voiceStyle}
        onSelectStyle={(style) => {
          setVoiceStyle(style);
          updateParent(question, choices, style);
        }}
        stepType="ask"
      />
    </>
  );
}

export default ShowAndChooseStep;