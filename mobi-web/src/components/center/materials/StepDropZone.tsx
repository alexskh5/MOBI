type StepDropZoneProps = {
  onDropStep: (stepType: string) => void;
};

function StepDropZone({
  onDropStep,
}: StepDropZoneProps) {
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        const stepType = event.dataTransfer.getData("text/plain");

        if (stepType) {
          onDropStep(stepType);
        }
      }}
      className="
        inter
        border
        border-dashed
        border-[#EAD0E9]
        rounded-[30px]
        bg-white
        h-28
        flex
        items-center
        justify-center
        text-gray-600
        text-xl
        transition
        hover:bg-[#F8EFFA]
      "
    >
      Drag and Drop steps from toolbox here
    </div>
  );
}

export default StepDropZone;
