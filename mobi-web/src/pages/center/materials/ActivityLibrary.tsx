// MOBI/mobi-web/src/pages/center/materials/ActivityLibrary.tsx
import { useState, useEffect, useRef } from "react";
import { Search, ArrowUp, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CenterLayout from "../../../layouts/CenterLayout";
import { getActivities } from "../../../services/activityApi";

interface ActivityData {
  id: string;
  title: string;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
  thumbnail_url: string | null;
  activity_type: string;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500";

const ActivityLibrary = () => {
  const navigate = useNavigate();

  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // const [currentPage, setCurrentPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [sortBy, setSortBy] = useState("Newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // const activitiesPerPage = currentPage === 1 ? 3 : 4;

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
        const data = await getActivities();
        setActivities(data);
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

  // =======================================================
  // TEMPORARY DRAFT DATA
  // Replace this once the backend returns draft activities.
  // =======================================================

  const draftCount = 3;

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
  const filteredActivities = activities.filter((activity) => {
    const search = searchTerm.toLowerCase();

    return (
      activity.title.toLowerCase().includes(search) ||
      activity.activity_type.toLowerCase().includes(search) ||
      (activity.description?.toLowerCase().includes(search) ?? false) ||
      (activity.uploaded_by?.toLowerCase().includes(search) ?? false)
    );
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

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col">
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

              <h1 className="text-5xl font-medium itim">Materials</h1>

              <div className="relative ml-4">
                <button
                  onClick={() => setShowActivityMenu(!showActivityMenu)}
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
                      "Conversation",
                      "Story",
                      "Turn Taking",
                      "Life Skills",
                      "Entertainment",
                    ].map((item) => (
                      <button
                        key={item}
                        onClick={() =>
                          navigate("/center/materials/CreateActivity", {
                            state: { template: item },
                          })
                        }
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
                <Search size={20} className="text-gray-500 mr-3" />

                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none w-full"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="bg-[#F5EEF6] px-6 py-3 rounded-xl shadow-md"
                >
                  Filter
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 mt-3 w-36 bg-white rounded-2xl shadow-lg py-3 z-50">
                    {[
                      "All",
                      "Center",
                      "Therapist",
                    ].map(
                      (item) => (
                        <button
                          key={item}
                          onClick={() => {

                            // =======================================================
                            // TODO (Backend):
                            // Filter activities by uploader.
                            //
                            // All Activities      -> Show every published activity.
                            // My Activities       -> Show activities created by the
                            //                        currently logged-in user.
                            // Therapist Activities -> Show activities uploaded by
                            //                         therapists only.
                            // =======================================================

                            setShowFilterMenu(false);
                          }}
                          className="block w-full text-left px-5 py-2 hover:bg-gray-100"
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/center/materials/ArchivedMaterials")}
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
                onClick={() => setShowSortMenu(!showSortMenu)}
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
            <p className="text-center text-red-600 font-semibold">{error}</p>
          )}

          {!loading && !error && sortedActivities.length === 0 && (
            <p className="text-center text-lg font-semibold">
              No matching activities found.
            </p>
          )}

          {!loading && !error && activities.length > 0 && (

              <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto no-scrollbar pr-2"
              >

                  <div className="grid grid-cols-4 gap-4">

                  {/* Drafts Card */}
                    <div
                        onClick={() => navigate("/center/materials/DraftMaterials")}
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
                        "                >
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
                                Draft Activities
                            </h3>

                            <p className="text-sm text-gray-600 mt-2 line-clamp-2 min-h-[42px]">
                                Continue editing activities that haven't been published yet.
                            </p>

                        </div>
                    </div>
              

                  {sortedActivities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => navigate(`/center/materials/${activity.id}`)}
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
                          {activity.description || "No description provided."}
                        </p>

                        <div className="mt-auto">

                          <p className="text-xs text-gray-500 mb-2">
                            Type: {activity.activity_type}
                          </p>

                          <p className="text-xs font-semibold">
                            Uploaded by: {activity.uploaded_by || "Center Admin"}
                          </p>

                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>

                          <div className="flex justify-end">

                          {/* 3dots */}
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
                              <div className="absolute right-0 bottom-8 w-36 bg-white rounded-xl shadow-lg py-2 z-50">

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    // TODO: Edit Activity

                                    setOpenMenu(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                  Edit Activity
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    // TODO: Archive Activity

                                    setOpenMenu(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                  Archive
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    // TODO: Delete Activity

                                    setOpenMenu(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>

                              </div>
                            )}

                          </div>

                        </div>

                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center gap-6 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white px-4 py-2 rounded-xl shadow disabled:opacity-60"
              >
                &lt;
              </button>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="bg-white px-4 py-2 rounded-xl shadow disabled:opacity-60"
              >
                &gt;
              </button>
            </div>
          )} */}
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