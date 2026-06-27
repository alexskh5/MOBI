interface ActivityThumbnailProps {
  thumbnail: string | null;
  setThumbnail: React.Dispatch<
    React.SetStateAction<string | null>
  >;
}

function ActivityThumbnail({
  thumbnail,
  setThumbnail,
}: ActivityThumbnailProps) {

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl =
      URL.createObjectURL(file);

    setThumbnail(imageUrl);
  };

  const handleRemoveImage = () => {
    setThumbnail(null);
  };

  return (
    <div className="inter border border-[#AAB7DA] rounded-[25px] overflow-hidden">

      {/* HEADER */}
      <div className="bg-white px-6 py-4 border-b border-[#AAB7DA]">

        <h3 className="font-semibold text-xl">
          Add Thumbnail (Optional)
        </h3>

      </div>

      {/* BODY */}
      <div className="p-6 bg-white">

        <div className="bg-[#c9c4de]/20 border border-[#AAB7DA] h-64 flex items-center justify-center">

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="thumbnail-upload"
          />

          <label
            htmlFor="thumbnail-upload"
            className="cursor-pointer"
          >

            {thumbnail ? (
              <div className="relative">

                <img
                  src={thumbnail}
                  alt="Thumbnail"
                  className="max-h-56 object-contain"
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveImage();
                  }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>

              </div>
            ) : (
              <div className="text-center">

                <p className="font-medium">
                  Upload Thumbnail
                </p>

                <p className="text-sm text-gray-500">
                  Click to browse files
                </p>

              </div>
            )}

          </label>

        </div>

      </div>

    </div>
  );
}

export default ActivityThumbnail;