import { useRef } from "react";

interface ActivityDescriptionProps {
  description: string;
  setDescription: React.Dispatch<
    React.SetStateAction<string>
  >;
}

function ActivityDescription({
  description,
  setDescription,
}: ActivityDescriptionProps) {

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {

  setDescription(e.target.value);

  e.target.style.height = "auto";
  e.target.style.height =
    `${e.target.scrollHeight}px`;

};

  return (
    <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

      {/* HEADER */}
      <div className="bg-white px-6 py-4 border-b border-[#AAB7DA]">

      <h3 className="font-semibold text-xl">
        Add Description (Required)
      </h3>

    </div>

      {/* BODY */}
      <div className="p-6 bg-white">
 
      <textarea
        ref={textareaRef}
        value={description}
        onChange={handleDescriptionChange}
        placeholder="Type here..."
        rows={2}
        className="
          w-full
          bg-[#EADFF0]/70
          px-6
          py-4
          outline-none
          resize-none
          overflow-hidden
        "
      />

      </div>

    </div>
  );
}

export default ActivityDescription;