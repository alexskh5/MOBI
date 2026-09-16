import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  X,
} from "lucide-react";

import TherapistLayout from "../../../layouts/TherapistLayout";
import {
  deleteActivity,
  getTherapistMaterials,
  type ActivityRecord,
} from "../../../services/activityApi";

const fallbackImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500";

const DraftMaterials = () => {
  const navigate =
    useNavigate();

  const [
    drafts,
    setDrafts,
  ] =
    useState<
      ActivityRecord[]
    >([]);

  const [
    openMenu,
    setOpenMenu,
  ] =
    useState<
      string | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const therapistId =
    localStorage.getItem(
      "mobi_staff_profile_id",
    );

  useEffect(() => {
    if (!therapistId) {
      navigate(
        "/login",
        {
          replace: true,
        },
      );

      return;
    }

    let mounted = true;

    async function loadDrafts() {
      try {
        setLoading(true);

        const rows =
          await getTherapistMaterials(
            therapistId,
            "drafts",
          );

        if (mounted) {
          setDrafts(
            rows,
          );
        }
      } catch (
        error: any
      ) {
        if (mounted) {
          setErrorMessage(
            error?.message ||
              "Unable to load drafts.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadDrafts();

    return () => {
      mounted = false;
    };
  }, [
    navigate,
    therapistId,
  ]);

  const handleDelete =
    async (
      draft:
        ActivityRecord,
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this draft?",
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteActivity(
          draft.id,
        );

        setDrafts(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                draft.id,
            ),
        );
      } catch (
        error: any
      ) {
        setErrorMessage(
          error?.message ||
            "Unable to delete draft.",
        );
      } finally {
        setOpenMenu(
          null,
        );
      }
    };

  return (
    <TherapistLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div className="flex h-full flex-col rounded-[30px] bg-[#E4C9E5]/80 p-8 inter">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  type="button"
                  className="text-3xl"
                  onClick={() =>
                    setSidebarOpen(
                      true,
                    )
                  }
                >
                  ☰
                </button>
              )}

              <h1 className="text-5xl font-medium itim">
                My Draft Materials
              </h1>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/therapist/materials",
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EEF6] shadow-md transition hover:bg-[#EBD7EC]"
            >
              <X
                size={20}
                className="text-[#7A5D7F]"
              />
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <p className="text-center text-lg font-semibold">
              Loading drafts...
            </p>
          ) : drafts.length ===
            0 ? (
            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  No draft materials yet.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Save an activity as a draft and it will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 xl:grid-cols-4 no-scrollbar">
              {drafts.map(
                (
                  draft,
                ) => (
                  <div
                    key={
                      draft.id
                    }
                    onClick={() =>
                      navigate(
                        "/therapist/materials/CreateActivity",
                        {
                          state: {
                            mode:
                              "draft",
                            draftId:
                              draft.id,
                          },
                        },
                      )
                    }
                    className="flex h-96 cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-lg"
                  >
                    <img
                      src={
                        draft.thumbnail_url ||
                        fallbackImage
                      }
                      alt={
                        draft.title
                      }
                      className="h-48 w-full shrink-0 object-cover"
                    />

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-2 text-lg font-bold leading-tight">
                        {
                          draft.title
                        }
                      </h3>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-600">
                        {draft.description ||
                          "No description provided."}
                      </p>

                      <div className="mt-auto">
                        <p className="mb-2 text-xs text-gray-500">
                          Type:{" "}
                          {
                            draft.activity_type
                          }
                        </p>

                        <p className="text-xs font-semibold">
                          Draft
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          Created by:{" "}
                          {draft.uploaded_by ||
                            "Therapist"}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          Last edited:{" "}
                          {new Date(
                            draft.updated_at ||
                              draft.created_at,
                          ).toLocaleString()}
                        </p>

                        <div className="relative flex justify-end">
                          <button
                            type="button"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              setOpenMenu(
                                openMenu ===
                                  draft.id
                                  ? null
                                  : draft.id,
                              );
                            }}
                            className="text-2xl text-gray-500 hover:text-gray-700"
                          >
                            ⋯
                          </button>

                          {openMenu ===
                            draft.id && (
                            <div className="absolute bottom-8 right-0 z-50 w-40 rounded-xl bg-white py-2 shadow-lg">
                              <button
                                type="button"
                                onClick={(
                                  event,
                                ) => {
                                  event.stopPropagation();

                                  navigate(
                                    "/therapist/materials/CreateActivity",
                                    {
                                      state: {
                                        mode:
                                          "draft",
                                        draftId:
                                          draft.id,
                                      },
                                    },
                                  );

                                  setOpenMenu(
                                    null,
                                  );
                                }}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                              >
                                Continue Edit
                              </button>

                              <button
                                type="button"
                                onClick={(
                                  event,
                                ) => {
                                  event.stopPropagation();
                                  void handleDelete(
                                    draft,
                                  );
                                }}
                                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                              >
                                Delete Draft
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </TherapistLayout>
  );
};

export default DraftMaterials;
