import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import TherapistLayout from "../../../layouts/TherapistLayout";
import {
  deleteActivity,
  getTherapistMaterials,
  restoreActivity,
  type ActivityRecord,
} from "../../../services/activityApi";

const fallbackImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500";

const ArchivedMaterials = () => {
  const navigate =
    useNavigate();

  const [
    archivedActivities,
    setArchivedActivities,
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

    async function loadArchived() {
      try {
        setLoading(true);

        const rows =
          await getTherapistMaterials(
            therapistId,
            "archived",
          );

        if (mounted) {
          setArchivedActivities(
            rows,
          );
        }
      } catch (
        error: any
      ) {
        if (mounted) {
          setErrorMessage(
            error?.message ||
              "Unable to load archived materials.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadArchived();

    return () => {
      mounted = false;
    };
  }, [
    navigate,
    therapistId,
  ]);

  const handleRestore =
    async (
      activity:
        ActivityRecord,
    ) => {
      try {
        await restoreActivity(
          activity.id,
        );

        setArchivedActivities(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                activity.id,
            ),
        );
      } catch (
        error: any
      ) {
        setErrorMessage(
          error?.message ||
            "Unable to restore activity.",
        );
      } finally {
        setOpenMenu(
          null,
        );
      }
    };

  const handleDelete =
    async (
      activity:
        ActivityRecord,
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete this archived activity?",
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteActivity(
          activity.id,
        );

        setArchivedActivities(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                activity.id,
            ),
        );
      } catch (
        error: any
      ) {
        setErrorMessage(
          error?.message ||
            "Unable to delete archived activity.",
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
                My Archived Materials
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
              Loading archived materials...
            </p>
          ) : archivedActivities.length ===
            0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-lg font-semibold text-gray-600">
                No archived materials yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 xl:grid-cols-4 no-scrollbar">
              {archivedActivities.map(
                (
                  activity,
                ) => (
                  <div
                    key={
                      activity.id
                    }
                    onClick={() =>
                      navigate(
                        `/therapist/materials/${activity.id}`,
                      )
                    }
                    className="flex h-96 cursor-pointer flex-col overflow-hidden rounded-3xl bg-white opacity-80 shadow-md transition hover:opacity-100 hover:shadow-lg"
                  >
                    <div className="relative">
                      <img
                        src={
                          activity.thumbnail_url ||
                          fallbackImage
                        }
                        alt={
                          activity.title
                        }
                        className="h-48 w-full shrink-0 object-cover"
                      />

                      <div className="absolute inset-0 bg-black/20" />

                      <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-semibold">
                        Archived
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-2 text-lg font-bold leading-tight">
                        {
                          activity.title
                        }
                      </h3>

                      <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-600">
                        {activity.description ||
                          "No description provided."}
                      </p>

                      <div className="mt-auto">
                        <p className="mb-2 text-xs text-gray-500">
                          Type:{" "}
                          {
                            activity.activity_type
                          }
                        </p>

                        <p className="text-xs font-semibold">
                          Uploaded by:{" "}
                          {activity.uploaded_by ||
                            "Therapist"}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          Archived:{" "}
                          {activity.archived_at
                            ? new Date(
                                activity.archived_at,
                              ).toLocaleString()
                            : "—"}
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
                                  activity.id
                                  ? null
                                  : activity.id,
                              );
                            }}
                            className="text-2xl text-gray-500 hover:text-gray-700"
                          >
                            ⋯
                          </button>

                          {openMenu ===
                            activity.id && (
                            <div className="absolute bottom-8 right-0 z-50 w-44 rounded-xl bg-white py-2 shadow-lg">
                              <button
                                type="button"
                                onClick={(
                                  event,
                                ) => {
                                  event.stopPropagation();
                                  void handleRestore(
                                    activity,
                                  );
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                              >
                                <RotateCcw
                                  size={16}
                                />
                                Restore
                              </button>

                              <button
                                type="button"
                                onClick={(
                                  event,
                                ) => {
                                  event.stopPropagation();
                                  void handleDelete(
                                    activity,
                                  );
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50"
                              >
                                <Trash2
                                  size={16}
                                />
                                Delete
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

export default ArchivedMaterials;
