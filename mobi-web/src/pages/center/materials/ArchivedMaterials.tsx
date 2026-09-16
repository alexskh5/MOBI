import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";
import { getActivities } from "../../../services/activityApi";

interface ArchivedActivity {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  activity_type: string;
  uploaded_by: string | null;
  archived_at: string | null;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500";

const ArchivedMaterials = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [archivedActivities, setArchivedActivities] = useState<
    ArchivedActivity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArchivedActivities() {
      try {
        setLoading(true);
        const data = await getActivities();

        setArchivedActivities(
          data.filter(
            (activity: ArchivedActivity) =>
              activity.archived_at &&
              activity.activity_type !== "Regulatory Activity",
          ),
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load archived activities.");
      } finally {
        setLoading(false);
      }
    }

    loadArchivedActivities();
  }, []);

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="inter bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  className="text-3xl"
                  onClick={() => setSidebarOpen(true)}
                >
                  ☰
                </button>
              )}

              <h1 className="text-5xl font-medium itim">
                Archived Materials
              </h1>
            </div>

            <button
              onClick={() => navigate("/center/materials")}
              className="
                w-11
                h-11
                flex
                items-center
                justify-center
                bg-[#F5EEF6]
                rounded-xl
                shadow-md
                hover:bg-[#EBD7EC]
                transition
              "
            >
              <X size={20} className="text-[#7A5D7F]" />
            </button>
          </div>

          {loading && (
            <p className="text-center text-lg font-semibold">
              Loading archived activities...
            </p>
          )}

          {error && (
            <p className="text-center text-red-600 font-semibold">
              {error}
            </p>
          )}

          {!loading && !error && archivedActivities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg font-semibold text-gray-600">
                No archived activities yet.
              </p>
            </div>
          ) : null}

          {!loading && !error && archivedActivities.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {archivedActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => navigate(`/center/materials/${activity.id}`)}
                  className="
                    bg-white
                    rounded-3xl
                    shadow-md
                    overflow-visible
                    cursor-pointer
                    hover:shadow-lg
                    transition
                    h-96
                    flex
                    flex-col
                    relative
                  "
                >
                  <img
                    src={activity.thumbnail_url || fallbackImage}
                    alt={activity.title}
                    className="
                      w-full
                      h-48
                      object-cover
                      shrink-0
                      grayscale
                      opacity-80
                      rounded-t-3xl
                    "
                  />

                  <div className="p-4 pb-10 flex flex-col flex-1">
                    <h3 className="font-bold text-lg leading-tight mb-2">
                      {activity.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 min-h-10 mt-2">
                      {activity.description || "No description provided."}
                    </p>

                    <div className="mt-auto">
                      <p className="text-xs text-gray-500 mb-2">
                        Type: {activity.activity_type}
                      </p>

                      <p className="text-xs font-semibold">
                        Archived
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        Archived:{" "}
                        {activity.archived_at
                          ? new Date(activity.archived_at).toLocaleString()
                          : "Recently"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded by: {activity.uploaded_by || "Center Admin"}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(
                          openMenu === activity.id ? null : activity.id,
                        );
                      }}
                      className="text-2xl text-gray-500 hover:text-gray-700"
                    >
                      ⋯
                    </button>

                    {openMenu === activity.id && (
                      <div className="absolute right-0 bottom-8 w-44 bg-white rounded-xl shadow-lg py-2 z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/center/materials/${activity.id}`);
                            setOpenMenu(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Preview
                        </button>

                        <p className="px-4 py-2 text-xs text-gray-500">
                          Archived published activities are kept for records.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </CenterLayout>
  );
};

export default ArchivedMaterials;
