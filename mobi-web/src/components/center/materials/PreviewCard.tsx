interface PreviewCardProps {
  title: string;
  description: string;
  thumbnail: string | null;
}

function PreviewCard({
  title,
  description,
  thumbnail,
}: PreviewCardProps) {

  return (
    <div className="inter bg-white border border-[#E59BE7] rounded-[30px] overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-3 border-b border-[#E59BE7]">
        <h2 className="font-itim text-3xl itim">
          Preview
        </h2>
      </div>

      {/* IMAGE */}
      <div className="h-48 bg-[#E4C9E5]/50 flex items-center justify-center overflow-hidden">

        {thumbnail ? (
          <img
            src={thumbnail}
            alt="Thumbnail Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">
            Thumbnail Preview
          </span>
        )}

      </div>

      {/* CONTENT */}
      <div className="p-5">

        <h3 className="font-bold text-xl mb-3">
          {title || "Untitled Activity"}
        </h3>

        <p
          className="
            text-sm
            text-gray-600
            mb-5
            line-clamp-3
          "
        >
          {description ||
            "Activity description will appear here..."}
        </p>

        <p className="text-xs font-semibold">
          Uploaded by: Center Admin
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Just now
        </p>

      </div>

    </div>
  );
}

export default PreviewCard;