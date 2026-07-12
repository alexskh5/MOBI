import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";

interface ArchivedActivity {
  id: number;
  title: string;
  description: string;
  image: string;
  type: string;
  archivedAt: string;
  archivedBy: string;
}

const ArchivedMaterials = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // =======================================================
  // TEMPORARY ARCHIVED DATA
  // Replace this later once backend returns archived activities.
  // =======================================================
  const [archivedActivities, setArchivedActivities] = useState<
    ArchivedActivity[]
  >([
    {
      id: 1,
      title: "Animal Words Practice",
      description:
        "Practice saying simple animal words with visual prompts and guided repetition.",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500",
      type: "Teach & Practice",
      archivedAt: "2 hours ago",
      archivedBy: "Center Admin",
    },
    {
      id: 2,
      title: "Greeting Friends",
      description:
        "Help learners practice saying hello, waving, and responding during simple social interactions.",
      image:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=500",
      type: "Conversation",
      archivedAt: "Yesterday",
      archivedBy: "Therapist",
    },
    {
      id: 3,
      title: "Color Matching Activity",
      description:
        "Identify and match common colors using child-friendly picture choices.",
      image:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500",
      type: "Check & Answer",
      archivedAt: "3 days ago",
      archivedBy: "Center Admin",
    },
  ]);

  const handleRestore = (activityId: number) => {
    const confirmRestore = window.confirm(
      "Restore this activity back to Materials?"
    );

    if (!confirmRestore) return;

    // =======================================================
    // TODO (Backend):
    // Restore archived activity.
    //
    // Example later:
    // await restoreActivity(activityId);
    //
    // Backend should update activity status:
    // archived -> published
    // =======================================================

    setArchivedActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId)
    );

    setOpenMenu(null);
  };

  const handlePermanentDelete = (activityId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this archived activity? This action cannot be undone."
    );

    if (!confirmDelete) return;

    // =======================================================
    // TODO (Backend):
    // Permanently delete archived activity.
    //
    // Example later:
    // await deleteActivityPermanently(activityId);
    // =======================================================

    setArchivedActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId)
    );

    setOpenMenu(null);
  };

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="inter bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 flex flex-col">
          {/* Header */}
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

          {/* Archived Cards */}
          {archivedActivities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg font-semibold text-gray-600">
                No archived activities yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {archivedActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => {
                    // Optional:
                    // Open preview when clicking the card itself.
                    // navigate(`/center/materials/${activity.id}`);
                  }}
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
                    src={activity.image}
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
                      {activity.description}
                    </p>

                    <div className="mt-auto">
                      <p className="text-xs text-gray-500 mb-2">
                        Type: {activity.type}
                      </p>

                      <p className="text-xs font-semibold">
                        Archived
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        Archived: {activity.archivedAt}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Archived by: {activity.archivedBy}
                      </p>
                    </div>
                  </div>

                  {/* 3 dots menu */}
                  <div className="absolute bottom-3 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(
                          openMenu === activity.id ? null : activity.id
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

                            // =======================================================
                            // TODO:
                            // Open archived activity preview.
                            //
                            // If same preview page can support archived activities:
                            // navigate(`/center/materials/${activity.id}`);
                            // =======================================================

                            navigate(`/center/materials/${activity.id}`);
                            setOpenMenu(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Preview
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(activity.id);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Restore
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePermanentDelete(activity.id);
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          Delete Permanently
                        </button>
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