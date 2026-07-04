// //mobi-web/src/components/center/materials/TeachStep.tsx

// import { useRef, useState } from "react";
// import {
//   Volume2,
//   Mic,
//   ChevronDown,
// } from "lucide-react";

// import VoiceStyleModal from "./VoiceStyleModal";
// import StepMenu from "./StepMenu";

// function TeachStep() {
//   const [showVoiceModal, setShowVoiceModal] =
//     useState(false);

//   const [voiceStyle, setVoiceStyle] =
//     useState("Teaching");

//   const [selectedFile, setSelectedFile] =
//     useState<File | null>(null);

//   const [previewUrl, setPreviewUrl] =
//     useState<string | null>(null);

//   const [lesson, setLesson] = useState("");

//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   const handleMediaUpload = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];

//     if (!file) return;

//     setSelectedFile(file);
//     setPreviewUrl(URL.createObjectURL(file));
//   };

//   const handleRemoveMedia = () => {
//     setSelectedFile(null);
//     setPreviewUrl(null);
//   };

//   const handleLessonChange = (
//     e: React.ChangeEvent<HTMLTextAreaElement>
//   ) => {
//     setLesson(e.target.value);

//     e.target.style.height = "auto";
//     e.target.style.height = `${e.target.scrollHeight}px`;
//   };

//   return (
//     <>
//       <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

//         {/* HEADER */}
//         <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">

//           <div className="flex items-center gap-3">

//             <div className="w-6 h-6 rounded-full bg-[#AAB7DA]" />

//             <h3 className="font-semibold text-xl">
//               Teach Step
//             </h3>

//           </div>

//           <div className="flex items-center gap-3">

//             <button
//               type="button"
//               onClick={() => setShowVoiceModal(true)}
//               className="flex items-center gap-2 rounded-full border border-[#D58CE5] bg-[#F8EFF9] px-3 py-1 text-[#A85CB5] hover:bg-[#F3E5F5] transition"
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

//           {/* MEDIA SECTION */}
//           <div className="mb-4">

//             <label className="block text-sm font-medium mb-2">
//               Add media as material for learning
//             </label>

//             <div className="bg-white border border-gray-300 h-64 flex items-center justify-center">

//               <input
//                 type="file"
//                 accept="image/*,video/*,audio/*"
//                 onChange={handleMediaUpload}
//                 className="hidden"
//                 id="teach-image-upload"
//               />

//               <label
//                 htmlFor="teach-image-upload"
//                 className="cursor-pointer"
//               >
//                 {selectedFile ? (
//                   <div className="relative flex items-center justify-center h-full">

//                     {selectedFile.type.startsWith("image/") && (
//                       <img
//                         src={previewUrl!}
//                         alt="Preview"
//                         className="max-h-56 object-contain"
//                       />
//                     )}

//                     {selectedFile.type.startsWith("video/") && (
//                       <video
//                         src={previewUrl!}
//                         controls
//                         className="max-h-56"
//                       />
//                     )}

//                     {selectedFile.type.startsWith("audio/") && (
//                       <audio
//                         src={previewUrl!}
//                         controls
//                       />
//                     )}

//                     {!selectedFile.type.startsWith("image/") &&
//                       !selectedFile.type.startsWith("video/") &&
//                       !selectedFile.type.startsWith("audio/") && (
//                         <div className="text-center">
//                           <p className="font-medium">
//                             {selectedFile.name}
//                           </p>

//                           <p className="text-gray-500 text-sm">
//                             {selectedFile.type || "Unknown file"}
//                           </p>
//                         </div>
//                       )}

//                     <button
//                       type="button"
//                       onClick={handleRemoveMedia}
//                       className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
//                     >
//                       ✕
//                     </button>

//                   </div>
//                 ) : (
//                   <div className="text-center">
//                     <p className="font-medium">
//                       Upload Media
//                     </p>

//                     <p className="text-sm text-gray-500">
//                       Click to browse files
//                     </p>
//                   </div>
//                 )}
//               </label>

//             </div>

//           </div>

//           <div>

//             <label className="block text-sm font-medium mb-2">
//               Teach a lesson (Required)
//             </label>

//             <div className="relative">
//               <textarea
//                 ref={textareaRef}
//                 value={lesson}
//                 onChange={handleLessonChange}
//                 placeholder="Type here..."
//                 rows={1}
//                 className="w-full resize-none overflow-hidden border border-gray-300 bg-white outline-none p-3 pr-12"
//               />

//               <button
//                 type="button"
//                 className="absolute right-3 text-[#6B7280] hover:text-[#5B4B8A] transition-colors"
//                 style={{
//                   top: `${(textareaRef.current?.offsetHeight ?? 44) - 34}px`,
//                 }}
//               >
//                 <Volume2 size={22} />
//               </button>
//             </div>

//           </div>

//         </div>

//       </div>

//       <VoiceStyleModal
//         isOpen={showVoiceModal}
//         onClose={() => setShowVoiceModal(false)}
//         selectedStyle={voiceStyle}
//         onSelectStyle={setVoiceStyle}
//         stepType="teach"
//       />

//     </>
//   );
// }

// export default TeachStep;






//mobi-web/src/components/center/materials/TeachStep.tsx

import { useRef, useState } from "react";
import {
  Volume2,
  Mic,
  ChevronDown,
} from "lucide-react";

import VoiceStyleModal from "./VoiceStyleModal";
import StepMenu from "./StepMenu";
import { previewTTS } from "../../../services/activityApi";

type TeachStepData = {
  lesson: string;
  ai_voice_style: string;
};

type TeachStepProps = {
  stepKey: string;
  onChange: (stepKey: string, data: TeachStepData) => void;
};

function TeachStep({ stepKey, onChange }: TeachStepProps) {
  const [showVoiceModal, setShowVoiceModal] =
    useState(false);

  const [voiceStyle, setVoiceStyle] =
    useState("Teaching");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [lesson, setLesson] = useState("");

  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateParent = (nextLesson = lesson) => {
    onChange(stepKey, {
      lesson: nextLesson,
      ai_voice_style: voiceStyle,
    });
  };
  const handleMediaUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleLessonChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    setLesson(value);
    updateParent(value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handlePreviewLesson = async () => {
  try {
    if (!lesson.trim()) {
      alert("Please type a lesson first.");
      return;
    }

    setIsGeneratingVoice(true);

    await previewTTS({
      text: lesson,
      voice: "Kore",
      style: voiceStyle,
      emotion: "gentle",
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
            <div className="w-6 h-6 rounded-full bg-[#AAB7DA]" />

            <h3 className="font-semibold text-xl">
              Teach Step
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowVoiceModal(true)}
              className="flex items-center gap-2 rounded-full border border-[#D58CE5] bg-[#F8EFF9] px-3 py-1 text-[#A85CB5] hover:bg-[#F3E5F5] transition"
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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Add media as material for learning
            </label>

            <div className="bg-white border border-gray-300 h-64 flex items-center justify-center">
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleMediaUpload}
                className="hidden"
                id={`teach-image-upload-${stepKey}`}
              />

              <label
                htmlFor={`teach-image-upload-${stepKey}`}
                className="cursor-pointer"
              >
                {selectedFile ? (
                  <div className="relative flex items-center justify-center h-full">
                    {selectedFile.type.startsWith("image/") && (
                      <img
                        src={previewUrl!}
                        alt="Preview"
                        className="max-h-56 object-contain"
                      />
                    )}

                    {selectedFile.type.startsWith("video/") && (
                      <video
                        src={previewUrl!}
                        controls
                        className="max-h-56"
                      />
                    )}

                    {selectedFile.type.startsWith("audio/") && (
                      <audio
                        src={previewUrl!}
                        controls
                      />
                    )}

                    {!selectedFile.type.startsWith("image/") &&
                      !selectedFile.type.startsWith("video/") &&
                      !selectedFile.type.startsWith("audio/") && (
                        <div className="text-center">
                          <p className="font-medium">
                            {selectedFile.name}
                          </p>

                          <p className="text-gray-500 text-sm">
                            {selectedFile.type || "Unknown file"}
                          </p>
                        </div>
                      )}

                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-medium">
                      Upload Media
                    </p>

                    <p className="text-sm text-gray-500">
                      Click to browse files
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Teach a lesson (Required)
            </label>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={lesson}
                onChange={handleLessonChange}
                placeholder="Type here..."
                rows={1}
                className="w-full resize-none overflow-hidden border border-gray-300 bg-white outline-none p-3 pr-12"
              />

              <button
                type="button"
                disabled={isGeneratingVoice}
                onClick={handlePreviewLesson}
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
          </div>
        </div>
      </div>

      <VoiceStyleModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        selectedStyle={voiceStyle}
        onSelectStyle={(style) => {
          setVoiceStyle(style);
          onChange(stepKey, {
            lesson,
            ai_voice_style: style,
          });
        }}
        stepType="teach"
      />
    </>
  );
}

export default TeachStep;