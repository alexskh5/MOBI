import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Trash2, X } from "lucide-react";
import TherapistLayout from "../../../layouts/TherapistLayout";

const ArchivedMaterials = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // TEMP DATA ONLY.
  // Later, backend should return only archived activities
  // created by the logged-in therapist.
  const archivedActivities = [
    {
      id: 1,
      title: "Greeting Practice",
      description:
        "Simple greeting activity for practicing hello, goodbye, and friendly responses.",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500",
      type: "Teach & Practice",
      archivedDate: "July 8, 2026",
      uploadedBy: "Anna Reyes",
    },
    {
      id: 2,
      title: "Waiting for My Turn",
      description:
        "Social readiness activity for practicing patience and turn-taking.",
      image:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500",
      type: "Turn Taking",
      archivedDate: "July 6, 2026",
      uploadedBy: "Anna Reyes",
    },
    {
      id: 3,
      title: "Color Matching",
      description:
        "Visual matching task for identifying and choosing correct colors.",
      image:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=500",
      type: "Show & Choose",
      archivedDate: "July 4, 2026",
      uploadedBy: "Anna Reyes",
    },
  ];

  return (
    <TherapistLayout>
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
                My Archived Materials
              </h1>
            </div>

            <button
              onClick={() => navigate("/therapist/materials")}
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

          {archivedActivities.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-lg font-semibold text-gray-600">
                No archived materials yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 overflow-y-auto no-scrollbar pr-2">
              {archivedActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() =>
                    navigate(`/therapist/materials/${activity.id}`)
                  }
                  className="
                    bg-white
                    rounded-3xl
                    shadow-md
                    overflow-hidden
                    cursor-pointer
                    hover:shadow-lg
                    transition
                    h-96
                    flex
                    flex-col
                    opacity-80
                    hover:opacity-100
                  "
                >
                  <div className="relative">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-48 object-cover shrink-0"
                    />

                    <div className="absolute inset-0 bg-black/20"></div>

                    <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                      Archived
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
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
                        Uploaded by: {activity.uploadedBy}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        Archived: {activity.archivedDate}
                      </p>

                      <div className="flex justify-end relative">
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

                                // TODO Backend:
                                // Restore only therapist's own archived activity.
                                // await restoreArchivedActivity(activity.id);

                                console.log("Restore:", activity.id);
                                setOpenMenu(null);
                              }}
                              className="flex w-full items-center gap-2 text-left px-4 py-2 hover:bg-gray-100"
                            >
                              <RotateCcw size={16} />
                              Restore
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                const confirmDelete = window.confirm(
                                  "Are you sure you want to permanently delete this archived activity?"
                                );

                                if (!confirmDelete) return;

                                // TODO Backend:
                                // Permanently delete only therapist's own archived activity.
                                // await deleteArchivedActivity(activity.id);

                                console.log("Delete archived:", activity.id);
                                setOpenMenu(null);
                              }}
                              className="flex w-full items-center gap-2 text-left px-4 py-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </TherapistLayout>
  );
};

export default ArchivedMaterials;