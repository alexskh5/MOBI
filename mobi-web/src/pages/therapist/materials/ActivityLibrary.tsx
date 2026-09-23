import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Archive,
  ArrowUp,
  Search,
} from "lucide-react";
import {
  useNavigate,
} from "react-router-dom";

import TherapistLayout from "../../../layouts/TherapistLayout";
import {
  archiveActivity,
  deleteActivity,
  getTherapistMaterials,
  type ActivityRecord,
  type TherapistMaterialView,
} from "../../../services/activityApi";

const fallbackImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500";

const filterMap: Record<
  string,
  TherapistMaterialView
> = {
  Mine: "mine",
  All: "all",
  Center: "center",
};

function statusLabel(
  status: string,
) {
  return status
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

const ActivityLibrary = () => {
  const navigate =
    useNavigate();

  const [
    showActivityMenu,
    setShowActivityMenu,
  ] =
    useState(false);

  const [
    showFilterMenu,
    setShowFilterMenu,
  ] =
    useState(false);

  const [
    showSortMenu,
    setShowSortMenu,
  ] =
    useState(false);

  const [
    openMenu,
    setOpenMenu,
  ] =
    useState<
      string | null
    >(null);

  const [
    showBackToTop,
    setShowBackToTop,
  ] =
    useState(false);

  const [
    activities,
    setActivities,
  ] =
    useState<
      ActivityRecord[]
    >([]);

  const [
    draftCount,
    setDraftCount,
  ] =
    useState(0);

  const [
    sortBy,
    setSortBy,
  ] =
    useState(
      "Newest",
    );

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState("");

  const [
    filterBy,
    setFilterBy,
  ] =
    useState("Mine");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    actionMessage,
    setActionMessage,
  ] =
    useState("");

  const scrollContainerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const therapistId =
    localStorage.getItem(
      "mobi_staff_profile_id",
    );

  const role =
    localStorage.getItem(
      "mobi_staff_role",
    );

  useEffect(() => {
    if (
      role !==
        "therapist" ||
      !therapistId
    ) {
      navigate(
        "/login",
        {
          replace: true,
        },
      );
    }
  }, [
    navigate,
    role,
    therapistId,
  ]);

  async function loadMaterials() {
    if (!therapistId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        materialRows,
        drafts,
      ] =
        await Promise.all([
          getTherapistMaterials(
            therapistId,
            filterMap[
              filterBy
            ],
          ),

          getTherapistMaterials(
            therapistId,
            "drafts",
          ),
        ]);

      setActivities(
        materialRows,
      );

      setDraftCount(
        drafts.length,
      );
    } catch (
      error: any
    ) {
      setError(
        error?.message ||
          "Failed to load materials.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMaterials();
  }, [
    therapistId,
    filterBy,
  ]);

  useEffect(() => {
    const container =
      scrollContainerRef.current;

    if (!container) {
      return;
    }

    const handleScroll =
      () => {
        setShowBackToTop(
          container.scrollTop >
            250,
        );
      };

    container.addEventListener(
      "scroll",
      handleScroll,
    );

    return () =>
      container.removeEventListener(
        "scroll",
        handleScroll,
      );
  }, [
    loading,
  ]);

  const sortedActivities =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      const filtered =
        activities.filter(
          (activity) => {
            const uploadedBy =
              activity.uploaded_by ||
              "Center Admin";

            return (
              activity.title
                .toLowerCase()
                .includes(
                  search,
                ) ||
              activity.activity_type
                .toLowerCase()
                .includes(
                  search,
                ) ||
              (
                activity.description
                  ?.toLowerCase()
                  .includes(
                    search,
                  ) ??
                false
              ) ||
              uploadedBy
                .toLowerCase()
                .includes(
                  search,
                )
            );
          },
        );

      return [
        ...filtered,
      ].sort(
        (
          first,
          second,
        ) => {
          if (
            sortBy ===
            "Newest"
          ) {
            return (
              new Date(
                second.updated_at ||
                  second.created_at,
              ).getTime() -
              new Date(
                first.updated_at ||
                  first.created_at,
              ).getTime()
            );
          }

          if (
            sortBy ===
            "Oldest"
          ) {
            return (
              new Date(
                first.created_at,
              ).getTime() -
              new Date(
                second.created_at,
              ).getTime()
            );
          }

          if (
            sortBy ===
            "Title A-Z"
          ) {
            return first.title.localeCompare(
              second.title,
            );
          }

          if (
            sortBy ===
            "Title Z-A"
          ) {
            return second.title.localeCompare(
              first.title,
            );
          }

          return 0;
        },
      );
    }, [
      activities,
      searchTerm,
      sortBy,
    ]);

  const isMine = (
    activity:
      ActivityRecord,
  ) =>
    Boolean(
      therapistId &&
        activity.created_by_therapist_id ===
          therapistId,
    );

  const handleArchive =
    async (
      activity:
        ActivityRecord,
    ) => {
      try {
        setActionMessage("");

        await archiveActivity(
          activity.id,
        );

        setActivities(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                activity.id,
            ),
        );

        setActionMessage(
          "Activity archived.",
        );
      } catch (
        error: any
      ) {
        setError(
          error?.message ||
            "Unable to archive activity.",
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
          "Are you sure you want to permanently delete this activity?",
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteActivity(
          activity.id,
        );

        setActivities(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                activity.id,
            ),
        );

        setActionMessage(
          "Activity deleted.",
        );
      } catch (
        error: any
      ) {
        setError(
          error?.message ||
            "Unable to delete activity.",
        );
      } finally {
        setOpenMenu(
          null,
        );
      }
    };

  const scrollToTop =
    () => {
      scrollContainerRef.current?.scrollTo(
        {
          top: 0,
          behavior:
            "smooth",
        },
      );
    };

  return (
    <TherapistLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div className="relative flex h-full flex-col rounded-[30px] bg-[#E4C9E5]/80 p-8 inter">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-4">
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
                Materials
              </h1>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowActivityMenu(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#F5EEF6] px-5 py-2 shadow-md"
                >
                  <span className="text-xl font-bold">
                    +
                  </span>
                  Create Activity
                </button>

                {showActivityMenu && (
                  <div className="absolute left-0 z-50 mt-3 w-64 overflow-hidden rounded-3xl bg-white shadow-lg">
                    <div className="border-b px-6 py-4 italic text-gray-700">
                      Please choose activity type:
                    </div>

                    {[
                      "Teach & Practice",
                      "Check & Answer",
                      "Social Prompt",
                      "Story",
                      "Turn Taking",
                      "Life Skills",
                      "Entertainment",
                    ].map(
                      (
                        item,
                      ) => (
                        <button
                          key={
                            item
                          }
                          type="button"
                          onClick={() =>
                            navigate(
                              "/therapist/materials/CreateActivity",
                              {
                                state: {
                                  template:
                                    item,
                                },
                              },
                            )
                          }
                          className="block w-full px-6 py-2 text-left hover:bg-[#E4C9E5]"
                        >
                          {
                            item
                          }
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex w-72 max-w-full items-center rounded-xl bg-[#F5EEF6] px-5 py-3 shadow-md">
                <Search
                  size={20}
                  className="mr-3 text-gray-500"
                />

                <input
                  type="search"
                  placeholder="Search"
                  value={
                    searchTerm
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearchTerm(
                      event
                        .target
                        .value,
                    )
                  }
                  className="w-full bg-transparent outline-none"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowFilterMenu(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  className="rounded-xl bg-[#F5EEF6] px-6 py-3 shadow-md"
                >
                  Filter:{" "}
                  {filterBy}
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 z-50 mt-3 w-36 rounded-2xl bg-white py-3 shadow-lg">
                    {[
                      "Mine",
                      "All",
                      "Center",
                    ].map(
                      (
                        item,
                      ) => (
                        <button
                          key={
                            item
                          }
                          type="button"
                          onClick={() => {
                            setFilterBy(
                              item,
                            );
                            setShowFilterMenu(
                              false,
                            );
                          }}
                          className="block w-full px-5 py-2 text-left hover:bg-gray-100"
                        >
                          {
                            item
                          }
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/therapist/materials/ArchivedMaterials",
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-[#F5EEF6] px-5 py-3 shadow-md transition hover:bg-white"
              >
                <Archive
                  size={18}
                />
                Archive
              </button>
            </div>
          </div>

          <div className="mb-6 border-b border-gray-500" />

          <div className="mb-6 flex items-center justify-between">
            <p className="text-lg font-medium opacity-60">
              Click an activity to preview
            </p>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowSortMenu(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
              >
                Sort:{" "}
                {sortBy} ▾
              </button>

              {showSortMenu && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl bg-white py-2 shadow-lg">
                  {[
                    "Newest",
                    "Oldest",
                    "Title A-Z",
                    "Title Z-A",
                  ].map(
                    (
                      item,
                    ) => (
                      <button
                        key={
                          item
                        }
                        type="button"
                        onClick={() => {
                          setSortBy(
                            item,
                          );
                          setShowSortMenu(
                            false,
                          );
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        {
                          item
                        }
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {actionMessage && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {actionMessage}
            </div>
          )}

          {loading ? (
            <p className="text-center text-lg font-semibold">
              Loading activities...
            </p>
          ) : (
            <div
              ref={
                scrollContainerRef
              }
              className="flex-1 overflow-y-auto pr-2 no-scrollbar"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div
                  onClick={() =>
                    navigate(
                      "/therapist/materials/DraftMaterials",
                    )
                  }
                  className="flex h-96 cursor-pointer flex-col overflow-hidden rounded-3xl bg-white opacity-70 shadow-md transition hover:scale-[1.02] hover:opacity-100"
                >
                  <div className="relative">
                    <img
                      src={
                        fallbackImage
                      }
                      alt=""
                      className="h-48 w-full shrink-0 object-cover"
                    />

                    <div className="absolute inset-0 bg-black/20" />

                    <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-sm font-semibold">
                      Drafts:{" "}
                      {draftCount}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-lg font-bold">
                      My Draft Activities
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-[42px] text-sm text-gray-600">
                      Continue editing activities that have not been submitted for Center review.
                    </p>
                  </div>
                </div>

                {sortedActivities.map(
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
                      className="flex h-96 cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-lg"
                    >
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

                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold leading-tight">
                            {
                              activity.title
                            }
                          </h3>

                          <span className="rounded-full bg-[#F5EEF6] px-2 py-1 text-[10px] font-semibold text-[#7456A3]">
                            {statusLabel(
                              activity.status,
                            )}
                          </span>
                        </div>

                        <p className="mb-4 line-clamp-2 min-h-[42px] text-sm text-gray-600">
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
                              "Center Admin"}
                          </p>

                          <p className="mt-2 text-xs text-gray-500">
                            {new Date(
                              activity.updated_at ||
                                activity.created_at,
                            ).toLocaleDateString()}
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
                                {isMine(
                                  activity,
                                ) ? (
                                  <>
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
                                                "edit",
                                              activityId:
                                                activity.id,
                                            },
                                          },
                                        );

                                        setOpenMenu(
                                          null,
                                        );
                                      }}
                                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                    >
                                      Edit Activity
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(
                                        event,
                                      ) => {
                                        event.stopPropagation();
                                        void handleArchive(
                                          activity,
                                        );
                                      }}
                                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                    >
                                      Archive
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
                                      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                                    >
                                      Delete
                                    </button>
                                  </>
                                ) : (
                                  <p className="px-4 py-2 text-sm text-gray-500">
                                    View only
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              {sortedActivities.length ===
                0 && (
                <div className="flex min-h-[280px] items-center justify-center text-center">
                  <p className="text-lg font-semibold text-gray-600">
                    No matching activities found.
                  </p>
                </div>
              )}
            </div>
          )}

          {showBackToTop && (
            <button
              type="button"
              onClick={
                scrollToTop
              }
              className="absolute bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-lg transition hover:bg-[#F5EEF6]"
            >
              <ArrowUp
                size={20}
              />
            </button>
          )}
        </div>
      )}
    </TherapistLayout>
  );
};

export default ActivityLibrary;
