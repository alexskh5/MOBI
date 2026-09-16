// MOBI/mobi-web/src/pages/center/materials/DraftMaterials.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";

const ACTIVITY_DRAFT_STORAGE_KEY = "mobi-center-activity-drafts-v1";

type ActivityDraft = {
  id: string;
  title: string;
  description: string;
  selectedTemplate: string;
  thumbnail: string | null;
  updatedAt: string;
  builderSteps: {
    id: string;
    type: string;
  }[];
  stepData: Record<string, any>;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500";

function readDrafts(): ActivityDraft[] {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(ACTIVITY_DRAFT_STORAGE_KEY) || "[]",
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatLastEdited(updatedAt: string) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString();
}

const DraftMaterials = () => {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ActivityDraft[]>([]);

  useEffect(() => {
    setDrafts(readDrafts());
  }, []);

  const continueDraft = (draft: ActivityDraft) => {
    navigate("/center/materials/CreateActivity", {
      state: {
        mode: "draft",
        draftId: draft.id,
        draftData: draft,
      },
    });
  };

  const deleteDraft = (draftId: string) => {
    const confirmDelete = window.confirm(
      "Delete this draft? Published activities are protected, but drafts can still be removed.",
    );

    if (!confirmDelete) return;

    const nextDrafts = drafts.filter((draft) => draft.id !== draftId);

    localStorage.setItem(
      ACTIVITY_DRAFT_STORAGE_KEY,
      JSON.stringify(nextDrafts),
    );

    setDrafts(nextDrafts);
    setOpenMenu(null);
  };

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

          {drafts.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-[24px] bg-white/70 p-8 text-center">
              <div>
                <h2 className="itim text-4xl text-[#1F1D28]">
                  No saved drafts yet
                </h2>

                <p className="mt-2 text-gray-600">
                  Drafts you save from the activity builder will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => continueDraft(draft)}
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
                    src={draft.thumbnail || fallbackImage}
                    alt={draft.title}
                    className="w-full h-48 object-cover shrink-0"
                  />

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg leading-tight mb-2">
                      {draft.title || "Untitled Activity Draft"}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 min-h-10 mt-2">
                      {draft.description || "No description yet."}
                    </p>

                    <div className="mt-auto">
                      <p className="text-xs text-gray-500 mb-2">
                        Type: {draft.selectedTemplate}
                      </p>

                      <p className="text-xs font-semibold">
                        Draft
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        Last edited: {formatLastEdited(draft.updatedAt)}
                      </p>

                      <div className="flex justify-end relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(
                              openMenu === draft.id ? null : draft.id,
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
                                continueDraft(draft);
                              }}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              Continue Draft
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDraft(draft.id);
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
          )}
        </div>
      )}
    </CenterLayout>
  );
};

export default DraftMaterials;
