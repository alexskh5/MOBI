import { FileText, ImageIcon, Music, Video } from "lucide-react";
import { getStepMedia } from "./previewTypes";
import type { PreviewStep } from "./previewTypes";

type Props = {
  step: PreviewStep;
  fallbackImage?: string;
  mode?: "large" | "choice" | "compact";
};

export default function PreviewMediaHolder({
  step,
  fallbackImage,
  mode = "large",
}: Props) {
  const media = getStepMedia(step).filter((item) => item.url);

  const imageHeight =
    mode === "compact"
      ? "h-[120px]"
      : mode === "choice"
      ? "h-[105px]"
      : "h-[155px]";

  if (!media.length && fallbackImage) {
    return (
      <div className="flex w-full justify-center">
        <img
          src={fallbackImage}
          alt="Activity preview"
          className={`${imageHeight} w-[82%] rounded-[24px] bg-white object-cover`}
        />
      </div>
    );
  }

  if (!media.length) return null;

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {media.slice(0, 1).map((item, index) => {
        const type = (item.type || "image").toLowerCase();

        if (type === "image" && item.url) {
          return (
            <img
              key={item.id || `${item.url}-${index}`}
              src={item.url}
              alt={item.name || "Step media"}
              className={`${imageHeight} w-[82%] rounded-[24px] bg-white object-cover`}
            />
          );
        }

        return (
          <div
            key={item.id || `${item.url}-${index}`}
            className={`
              ${imageHeight} flex w-[82%] flex-col items-center justify-center
              rounded-[24px] border-2 border-dashed border-[#E6C5E6]
              bg-white px-4 text-center
            `}
          >
            {type === "video" ? (
              <Video size={34} className="text-[#B48BC7]" />
            ) : type === "audio" ? (
              <Music size={34} className="text-[#B48BC7]" />
            ) : type === "file" ? (
              <FileText size={34} className="text-[#B48BC7]" />
            ) : (
              <ImageIcon size={34} className="text-[#B48BC7]" />
            )}

            <p className="mt-2 text-xs font-black text-[#1F1D28]">
              {type === "video"
                ? "Video Material"
                : type === "audio"
                ? "Audio Material"
                : "File Material"}
            </p>

            <p className="mt-1 text-[10px] leading-3 text-gray-500">
              {item.name || "Media preview"}
            </p>
          </div>
        );
      })}
    </div>
  );
}