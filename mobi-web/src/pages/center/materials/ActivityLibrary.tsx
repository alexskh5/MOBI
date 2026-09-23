// MOBI/mobi-web/src/pages/center/materials/ActivityLibrary.tsx

import { useState, useEffect, useRef } from "react";
import { Search, ArrowUp, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CenterLayout from "../../../layouts/CenterLayout";
import {
  approveSubmittedActivity,
  archiveActivity,
  declineSubmittedActivity,
  getActivities,
  getSubmittedActivities,
} from "../../../services/activityApi";

interface ActivityData {
  id: string;
  title: string;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
  thumbnail_url: string | null;
  activity_type: string;
  status?: string | null;
  archived_at?: string | null;
  decline_reason?: string | null;
  review_feedback?: string | null;
  submitted_at?: string | null;
}

const ACTIVITY_DRAFT_STORAGE_KEY = "mobi-center-activity-drafts-v1";

const fallbackImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500";

const ActivityLibrary = () => {
  const navigate = useNavigate();

  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [submittedActivities, setSubmittedActivities] = useState<
    ActivityData[]
  >([]);
  const [sortBy, setSortBy] = useState("Newest");
  const [searchTerm, setSearchTerm] = useState("");

  /*
    Center admin default view:
    Mine = activities uploaded by Center Admin
    All = all approved/published activities
    Therapist = activities uploaded by therapists
  */
  const [filterBy, setFilterBy] = useState("Mine");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // TEMP ONLY.
  // Later this should come from logged-in center admin account/auth.
  const currentUser = {
    id: "center-admin-1",
    name: "Center Admin",
    role: "center_admin",
  };

  const filterOptions = ["Mine", "All", "Therapist"];

  const draftCount = (() => {
    try {
      const drafts = JSON.parse(
        localStorage.getItem(ACTIVITY_DRAFT_STORAGE_KEY) || "[]",
      );

      return Array.isArray(drafts) ? drafts.length : 0;
    } catch {
      return 0;
    }
  })();

  const regulatoryCount = activities.filter(
    (activity) =>
      activity.activity_type === "Regulatory Activity" &&
      !activity.archived_at,
  ).length;

  /*
  const [drafts, setDrafts] = useState<ActivityData[]>([]);

  useEffect(() => {
    async function loadDrafts() {
      const data = await getDraftActivities();
      setDrafts(data);
    }

    loadDrafts();
  }, []);

  const draftCount = drafts.length;
  */

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);
        setError("");
        const data = await getActivities();
        setActivities(data);

        try {
          setSubmittedActivities(await getSubmittedActivities());
        } catch (submissionError) {
          console.warn(
            "Unable to load therapist submissions.",
            submissionError,
          );
          setSubmittedActivities([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load activities.");
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      setShowBackToTop(container.scrollTop > 250);
    };

    container.addEventListener("scroll", handleScroll);

    return () =>
      container.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const filteredActivities = activities.filter((activity) => {
    if (activity.activity_type === "Regulatory Activity") {
      return false;
    }

    if (
      activity.archived_at ||
      activity.status === "draft" ||
      activity.status === "pending_review" ||
      activity.status === "declined" ||
      (activity.status && activity.status !== "published")
    ) {
      return false;
    }

    const search = searchTerm.toLowerCase();
    const uploadedBy = activity.uploaded_by || "Center Admin";

    const matchesSearch =
      activity.title.toLowerCase().includes(search) ||
      activity.activity_type.toLowerCase().includes(search) ||
      (activity.description?.toLowerCase().includes(search) ?? false) ||
      uploadedBy.toLowerCase().includes(search);

    if (!matchesSearch) return false;

    if (filterBy === "Mine") {
      return uploadedBy === currentUser.name;
    }

    if (filterBy === "Therapist") {
      return uploadedBy !== "Center Admin";
    }

    return true;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    switch (sortBy) {
      case "Newest":
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );

      case "Oldest":
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );

      case "Title A-Z":
        return a.title.localeCompare(b.title);

      case "Title Z-A":
        return b.title.localeCompare(a.title);

      default:
        return 0;
    }
  });

  const canModifyActivity = (activity: ActivityData) => {
    const uploadedBy = activity.uploaded_by || "Center Admin";
    return uploadedBy === currentUser.name;
  };

  const handleArchiveActivity = async (activity: ActivityData) => {
    const confirmArchive = window.confirm(
      "Archive this published activity? It will be removed from the active library but not deleted.",
    );

    if (!confirmArchive) {
      return;
    }

    try {
      await archiveActivity(activity.id);
      setActivities((currentActivities) =>
        currentActivities.map((item) =>
          item.id === activity.id
            ? {
                ...item,
                archived_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      setOpenMenu(null);
    } catch (error) {
      console.error(error);
      alert("Failed to archive activity.");
    }
  };

  const handleApproveSubmission = async (activity: ActivityData) => {
    const feedback = window.prompt(
      "Optional feedback for therapist before publishing:",
      "",
    );

    try {
      const result = await approveSubmittedActivity(
        activity.id,
        feedback ?? "",
      );
      setSubmittedActivities((current) =>
        current.filter((item) => item.id !== activity.id),
      );
      if (result?.activity) {
        setActivities((current) => [result.activity, ...current]);
      }
      alert("Activity approved and published.");
    } catch (error) {
      console.error(error);
      alert("Failed to approve activity.");
    }
  };

  const handleDeclineSubmission = async (activity: ActivityData) => {
    const reason = window.prompt(
      "Write the reason so the therapist knows what to revise:",
      "",
    );

    if (!reason?.trim()) {
      return;
    }

    try {
      await declineSubmittedActivity(activity.id, reason.trim());
      setSubmittedActivities((current) =>
        current.filter((item) => item.id !== activity.id),
      );
      alert("Activity declined with feedback.");
    } catch (error) {
      console.error(error);
      alert("Failed to decline activity.");
    }
  };

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col relative">
          <div className="flex justify-between items-center mb-6">
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
                Materials
              </h1>

              <div className="relative ml-4">
                <button
                  onClick={() =>
                    setShowActivityMenu(!showActivityMenu)
                  }
                  className="bg-[#F5EEF6] shadow-md px-5 py-2 rounded-xl flex items-center gap-2"
                >
                  <span className="text-xl font-bold">+</span>
                  Create Activity
                </button>

                {showActivityMenu && (
                  <div className="absolute left-0 mt-3 w-64 bg-white rounded-3xl shadow-lg z-50 overflow-hidden">
                    <div className="px-6 py-4 italic text-gray-700 border-b">
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
                      "Regulatory Activity",
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          if (item === "Regulatory Activity") {
                            navigate("/center/materials/regulatory");
                            return;
                          }

                          navigate(
                            "/center/materials/CreateActivity",
                            {
                              state: { template: item },
                            },
                          );
                        }}
                        className="block w-full text-left px-6 py-2 hover:bg-[#E4C9E5]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96">
                <Search
                  size={20}
                  className="text-gray-500 mr-3"
                />

                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="bg-transparent outline-none w-full"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    setShowFilterMenu(!showFilterMenu)
                  }
                  className="bg-[#F5EEF6] px-6 py-3 rounded-xl shadow-md"
                >
                  Filter: {filterBy}
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 mt-3 w-36 bg-white rounded-2xl shadow-lg py-3 z-50">
                    {filterOptions.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setFilterBy(item);
                          setShowFilterMenu(false);

                          // TODO Backend:
                          // Mine      -> show activities uploaded by center admin
                          // All       -> show all published/approved activities
                          // Therapist -> show activities uploaded by therapists
                        }}
                        className="block w-full text-left px-5 py-2 hover:bg-gray-100"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  navigate("/center/materials/ArchivedMaterials")
                }
                className="bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md flex items-center gap-2 hover:bg-white transition"
              >
                <Archive size={18} />
                Archive
              </button>
            </div>
          </div>

          <div className="border-b border-gray-500 mb-6"></div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-medium opacity-60">
              Click an activity to preview
            </p>

            <div className="relative">
              <button
                onClick={() =>
                  setShowSortMenu(!showSortMenu)
                }
                className="text-md"
              >
                Sort: {sortBy} ▾
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                  {[
                    "Newest",
                    "Oldest",
                    "Title A-Z",
                    "Title Z-A",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setSortBy(item);
                        setShowSortMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading && (
            <p className="text-center text-lg font-semibold">
              Loading activities...
            </p>
          )}

          {error && (
            <p className="text-center text-red-600 font-semibold">
              {error}
            </p>
          )}

          {!loading && !error && submittedActivities.length > 0 && (
            <section className="mb-6 rounded-3xl bg-white/80 p-5 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Therapist Submissions
                  </h2>
                  <p className="text-sm text-gray-600">
                    Review submitted materials before they enter the
                    learner library.
                  </p>
                </div>
                <span className="rounded-full bg-[#F5EEF6] px-4 py-2 text-sm font-semibold">
                  {submittedActivities.length} pending
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {submittedActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-[#E5C7E9] bg-white p-4"
                  >
                    <div
                      onClick={() =>
                        navigate(`/center/materials/${activity.id}`, {
                          state: { reviewMode: true },
                        })
                      }
                      className="cursor-pointer"
                    >
                      <img
                        src={activity.thumbnail_url || fallbackImage}
                        alt={activity.title}
                        className="mb-3 h-28 w-full rounded-xl object-cover"
                      />
                      <h3 className="font-bold leading-tight">
                        {activity.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {activity.description ||
                          "No description provided."}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        Submitted by{" "}
                        {activity.uploaded_by || "Therapist"}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleApproveSubmission(activity)
                        }
                        className="flex-1 rounded-xl bg-[#8B5FBF] px-3 py-2 text-sm font-semibold text-white"
                      >
                        Publish
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeclineSubmission(activity)
                        }
                        className="flex-1 rounded-xl border border-[#8B5FBF] bg-white px-3 py-2 text-sm font-semibold text-[#8B5FBF]"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loading && !error && sortedActivities.length === 0 && (
            <p className="text-center text-lg font-semibold">
              No matching activities found.
            </p>
          )}

          {!loading && !error && (
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto no-scrollbar pr-2"
            >
              <div className="grid grid-cols-4 gap-4">
                {/* Drafts Card - center admin can access own drafts */}
                <div
                  onClick={() =>
                    navigate("/center/materials/DraftMaterials")
                  }
                  className="
                    bg-white
                    rounded-3xl
                    shadow-md
                    overflow-hidden
                    cursor-pointer
                    opacity-60
                    hover:opacity-100
                    hover:scale-[1.02]
                    transition
                    h-100
                    flex
                    flex-col
                  "
                >
                  <div className="relative">
                    <img
                      src={fallbackImage}
                      className="w-full h-48 object-cover shrink-0"
                    />

                    <div className="absolute inset-0 bg-black/20"></div>

                    <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                      Drafts: {draftCount}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-lg">
                      My Draft Activities
                    </h3>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-[42px]">
                      Continue editing your activities that haven&apos;t
                      been published yet.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() =>
                    navigate("/center/materials/regulatory")
                  }
                  className="
                    bg-white
                    rounded-3xl
                    shadow-md
                    overflow-hidden
                    cursor-pointer
                    hover:shadow-lg
                    hover:scale-[1.02]
                    transition
                    h-100
                    flex
                    flex-col
                  "
                >
                  <div className="relative flex h-48 shrink-0 items-center justify-center bg-[#F5EEF6]">
                    <div className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-sm font-semibold">
                      Items: {regulatoryCount}
                    </div>

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-md">
                      ▶
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-lg font-bold">
                      Regulatory Activities
                    </h3>

                    <p className="mt-2 min-h-[42px] text-sm text-gray-600 line-clamp-2">
                      Upload calming, movement, yoga, and warm-up media for therapist-guided regulation.
                    </p>
                  </div>
                </div>

                {sortedActivities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() =>
                      navigate(`/center/materials/${activity.id}`)
                    }
                    className="
                      bg-white
                      rounded-3xl
                      shadow-md
                      overflow-hidden
                      hover:shadow-lg
                      transition
                      cursor-pointer
                      h-100
                      flex
                      flex-col
                    "
                  >
                    <img
                      src={activity.thumbnail_url || fallbackImage}
                      alt={activity.title}
                      className="w-full h-48 object-cover shrink-0"
                    />

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-lg leading-tight mb-2">
                        {activity.title}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-2 min-h-[42px] mb-4">
                        {activity.description ||
                          "No description provided."}
                      </p>

                      <div className="mt-auto">
                        <p className="text-xs text-gray-500 mb-2">
                          Type: {activity.activity_type}
                        </p>

                        <p className="text-xs font-semibold">
                          Uploaded by:{" "}
                          {activity.uploaded_by || "Center Admin"}
                        </p>

                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(
                            activity.created_at
                          ).toLocaleDateString()}
                        </p>

                        <div className="flex justify-end relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(
                                openMenu === activity.id
                                  ? null
                                  : activity.id
                              );
                            }}
                            className="text-2xl text-gray-500 hover:text-gray-700"
                          >
                            ⋯
                          </button>

                          {openMenu === activity.id && (
                            <div className="absolute right-0 bottom-8 w-44 bg-white rounded-xl shadow-lg py-2 z-50">
                              {canModifyActivity(activity) ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleArchiveActivity(activity);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                  >
                                    Archive
                                  </button>

                                  <p className="px-4 py-2 text-xs text-gray-500">
                                    Published activities cannot be edited or deleted.
                                  </p>
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
                ))}
              </div>
            </div>
          )}

          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="
                absolute
                bottom-8
                right-8
                h-12
                w-12
                rounded-full
                bg-white
                shadow-lg
                hover:bg-[#F5EEF6]
                transition
                flex
                items-center
                justify-center
                text-xl
              "
            >
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      )}
    </CenterLayout>
  );
};

export default ActivityLibrary;
