import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";

const DraftMaterials = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const drafts = [
    {
      id: 1,
      title: "Saying Hello: Social Story",
      description:
        "Guide using first-person language to help children practice making eye contact and offering a friendly wave.",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500",
      type: "Story",
      lastEdited: "2 hours ago",
    },
    {
      id: 2,
      title: "Brushing Teeth Routine",
      description:
        "Teach brushing teeth through simple visual steps.",
      image:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=500",
      type: "Life Skills",
      lastEdited: "Yesterday",
    },
    {
      id: 3,
      title: "Learning Colors",
      description:
        "Identify primary colors through picture matching.",
      image:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500",
      type: "Teach & Practice",
      lastEdited: "3 days ago",
    },
  ];

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
                Draft Materials
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

          {/* Draft Cards */}
          <div className="grid grid-cols-4 gap-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                onClick={() =>
                  navigate("/center/materials/CreateActivity", {
                    state: {
                      mode: "draft",
                      draftId: draft.id,
                      draftData: draft,
                    },
                  })
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
                "
              >
                <img
                  src={draft.image}
                  alt={draft.title}
                  className="w-full h-48 object-cover shrink-0"
                />

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg leading-tight mb-2">
                    {draft.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 min-h-10 mt-2">
                    {draft.description}
                  </p>

                  <div className="mt-auto">
                    <p className="text-xs text-gray-500 mb-2">
                      Type: {draft.type}
                    </p>

                    <p className="text-xs font-semibold">
                      Draft
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      Last edited: {draft.lastEdited}
                    </p>

                    <div className="flex justify-end relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(
                            openMenu === draft.id ? null : draft.id
                          );
                        }}
                        className="text-2xl text-gray-500 hover:text-gray-700"
                      >
                        ⋯
                      </button>

                      {openMenu === draft.id && (
                        <div className="absolute right-0 bottom-8 w-40 bg-white rounded-xl shadow-lg py-2 z-50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              navigate("/center/materials/CreateActivity", {
                                state: {
                                  mode: "draft",
                                  draftId: draft.id,
                                  draftData: draft,
                                },
                              });

                              setOpenMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Continue Edit
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              const confirmDelete = window.confirm(
                                "Are you sure you want to delete this draft?"
                              );

                              if (!confirmDelete) return;

                              // TODO:
                              // Delete Draft
                              // Backend later:
                              // await deleteDraftActivity(draft.id)

                              setOpenMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                          >
                            Delete Draft
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CenterLayout>
  );
};

export default DraftMaterials;