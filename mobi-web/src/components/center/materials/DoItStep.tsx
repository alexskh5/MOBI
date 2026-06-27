import { useRef, useState } from "react";
import {
  X,
  Volume2,
  Mic,
  ChevronDown,
} from "lucide-react";

import VoiceStyleModal from "./VoiceStyleModal";
import StepMenu from "./StepMenu";

function DoItStep() {
  const [showVoiceModal, setShowVoiceModal] =
    useState(false);

  const [voiceStyle, setVoiceStyle] =
    useState("Teaching");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const [instruction, setInstruction] =
    useState("");

  const [materialInput, setMaterialInput] =
    useState("");

  const [materials, setMaterials] =
    useState<string[]>([]);

  const handleMaterialKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (e.key !== "Enter") return;

    e.preventDefault();

    const value = materialInput.trim();

    if (!value) return;

    if (materials.includes(value)) return;

    setMaterials([
      ...materials,
      value,
    ]);

    setMaterialInput("");

  };

  const removeMaterial = (
    material: string
  ) => {

    setMaterials(
      materials.filter(
        item => item !== material
      )
    );

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

  const handleInstructionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {

    setInstruction(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height =
      `${e.target.scrollHeight}px`;

  };

  return (
    <>
      <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

        {/* HEADER */}
        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#AAB7DA]">

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#A8BE6B]"></div>

            <h3 className="font-semibold text-xl">
              Learn by Doing Step
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
          <div className="mb-4">

            <label className="block text-sm font-medium mb-2">
              Add media as instruction material (Optional)
            </label>

            <div className="bg-white border border-gray-300 h-64 flex items-center justify-center">

              <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleMediaUpload}
                className="hidden"
                id="teach-image-upload"
              />

              <label
                htmlFor="teach-image-upload"
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

          {/* INSTRUCTION */}
          <div className="mb-6">

            <label className="block text-sm font-medium mb-2">
              Add instruction for therapists or guardians to learn something by making the learner do it
            </label>

            <div className="relative">

              <textarea
                ref={textareaRef}
                value={instruction}
                onChange={handleInstructionChange}
                rows={1}
                placeholder="Type instruction here..."
                className="w-full resize-none overflow-hidden border border-[#AAB7DA] bg-white p-3 pr-12 outline-none"
              />

              <button
                type="button"
                className="absolute right-3 text-[#6B7280] hover:text-[#5B4B8A]"
                style={{
                  top: `${(textareaRef.current?.offsetHeight ?? 44) - 34}px`,
                }}
              >
                <Volume2 size={22} />
              </button>

            </div>

          </div>

          {/* MATERIALS */}
          <div>

            <label className="block text-sm font-medium mb-2">
              Materials Needed (Optional)
            </label>

            <input
              type="text"
              value={materialInput}
              onChange={(e) =>
                setMaterialInput(e.target.value)
              }
              onKeyDown={handleMaterialKeyDown}
              placeholder="Type a material then press Enter..."
              className="w-full border border-gray-300 bg-white p-3 outline-none"
            />

            <div className="mt-3 flex flex-wrap gap-2">

              {materials.map((material) => (

                <div
                  key={material}
                  className="flex items-center gap-2 rounded-full border border-[#D58CE5] bg-white px-3 py-2"
                >

                  <span>{material}</span>

                  <button
                    type="button"
                    onClick={() =>
                      removeMaterial(material)
                    }
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
        stepType="teach"
      />
    </>
  );
}

export default DoItStep;