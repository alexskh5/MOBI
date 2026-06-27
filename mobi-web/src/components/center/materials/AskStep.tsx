import { useRef, useState } from "react";
import {
  X,
  Volume2,
  Mic,
  ChevronDown,
} from "lucide-react";

import VoiceStyleModal from "./VoiceStyleModal";
import StepMenu from "./StepMenu";

function AskStep() {
  const [showVoiceModal, setShowVoiceModal] =
    useState(false);

  const [voiceStyle, setVoiceStyle] =
    useState("Curious");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [question, setQuestion] =
    useState("");

  const [answers, setAnswers] =
    useState<string[]>([]);

  const [answerInput, setAnswerInput] =
    useState("");

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

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

  const handleQuestionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setQuestion(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height =
      `${e.target.scrollHeight}px`;
  };

  const handleAnswerKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (e.key !== "Enter") return;

    e.preventDefault();

    const value = answerInput.trim();

    if (!value) return;

    if (answers.includes(value)) return;

    setAnswers([...answers, value]);

    setAnswerInput("");

  };

  const removeAnswer = (
    answer: string
  ) => {

    setAnswers(
      answers.filter(
        item => item !== answer
      )
    );

  };

  return (
    <>
      <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

        {/* HEADER */}
        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">

          <div className="flex items-center gap-3">

            <div className="w-6 h-6 rounded-full bg-[#7B5A43]" />

            <h3 className="font-semibold text-xl">
              Ask Step
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

            {/* MENU */}
            <StepMenu
              onMoveUp={() => console.log("Move Up")}
              onMoveDown={() => console.log("Move Down")}
              onDelete={() => console.log("Delete Step")}
            />

          </div>

        </div>

        {/* BODY */}
        <div className="bg-[#E4C9E5]/70 p-6">

          {/* MEDIA SECTION */}

          <div className="mb-6">

            <label className="block text-sm font-medium mb-2">
              Add media as question material (Optional)
            </label>

            <div className="bg-white border border-gray-300 h-64 flex items-center justify-center">

              <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleMediaUpload}
                className="hidden"
                id="ask-media-upload"
              />

              <label
                htmlFor="ask-media-upload"
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

          {/* QUESTION */}

          <div className="mb-6">

            <label className="block text-sm font-medium mb-2">
              Ask a question (Required)
            </label>

            <div className="relative">

              <textarea
                ref={textareaRef}
                value={question}
                onChange={handleQuestionChange}
                placeholder="Type your question here..."
                rows={1}
                className="w-full resize-none overflow-hidden border border-gray-300 bg-white outline-none p-3 pr-12"
              />

              <button
                type="button"
                className="absolute right-3 text-[#6B7280] hover:text-[#5B4B8A] transition-colors"
                style={{
                  top: `${(textareaRef.current?.offsetHeight ?? 44) - 34}px`,
                }}
              >
                <Volume2 size={22} />
              </button>

            </div>

          </div>
          
          {/* EXPECTED ANSWERS */}

          <div>

            <label className="block text-sm font-medium mb-2">
              Expected Answer(s) (Required)
            </label>

            {/* Input */}

            <input
              type="text"
              value={answerInput}
              onChange={(e) =>
                setAnswerInput(e.target.value)
              }
              onKeyDown={handleAnswerKeyDown}
              placeholder="Type an answer then press Enter..."
              className="w-full border border-gray-300 bg-white p-3 outline-none"
            />

            <div className="flex flex-wrap gap-2 mt-3">

              {answers.map((answer) => (

                <div
                  key={answer}
                  className="flex items-center gap-2 rounded-full border border-[#D58CE5] bg-white px-3 py-2"
                >

                  <span>{answer}</span>

                  <button
                    type="button"
                    onClick={() => removeAnswer(answer)}
                    className="text-[#B25AC7] hover:text-red-500"
                  >
                    <X size={14} />
                  </button>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

      <VoiceStyleModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        selectedStyle={voiceStyle}
        onSelectStyle={setVoiceStyle}
        stepType="ask"
      />

    </>

  );
}

export default AskStep;