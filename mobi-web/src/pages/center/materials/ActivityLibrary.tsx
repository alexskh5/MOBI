import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CenterLayout from "../../../layouts/CenterLayout";

interface ActivityData {
  _id: string;
  title: string;
  description: string;
  uploadedBy: string;
  date: string;
  image: string;
}

const ActivityLibrary = () => {
  const navigate = useNavigate();

  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const activitiesPerPage = 4;

  const activities: ActivityData[] = [
    {
      _id: "1",
      title: "Saying Hello: Social Story",
      description:
        "Guide using first-person language to help children practice making eye contact and offering a friendly wave when meeting new peers.",
      uploadedBy: "Center Admin",
      date: "2 wks ago",
      image:
        "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500",
    },
    {
      _id: "2",
      title: "Screen Time Limit",
      description:
        'Why our brains and eyes need breaks from "glowing screens." Taking controls on screen time.',
      uploadedBy: "Alias Dumbledore, ST",
      date: "2 wks ago",
      image:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500",
    },
    {
      _id: "3",
      title: "Step-by-Step Brushing",
      description:
        "Breaking down the sensory-heavy task of oral hygiene into 6 steps to reduce anxiety and increase independence.",
      uploadedBy: "Ruby Villaester, OT",
      date: "2 wks ago",
      image:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=500",
    },
    {
      _id: "4",
      title: "Turn-Taking Workshop",
      description:
        'Video tutorials that use block-building to teach the "Your Turn, My Turn" concept.',
      uploadedBy: "Severus Snape, OT",
      date: "2 wks ago",
      image:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500",
    },
  ];

  const totalPages = Math.ceil(
    activities.length / activitiesPerPage
  );

  const startIndex =
    (currentPage - 1) * activitiesPerPage;

  const currentActivities = activities.slice(
    startIndex,
    startIndex + activitiesPerPage
  );

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col">
          {/* HEADER */}
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
                    setShowActivityMenu(
                      !showActivityMenu
                    )
                  }
                  className="bg-[#F5EEF6] shadow-md px-5 py-2 rounded-xl flex items-center gap-2"
                >
                  <span className="text-xl font-bold">
                    +
                  </span>
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
                            state: {
                              template: item,
                            },
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

            {/* SEARCH + FILTER */}
            <div className="flex items-center gap-5">
              <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96">
                <Search
                  size={20}
                  className="text-gray-500 mr-3"
                />

                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent outline-none w-full"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    setShowFilterMenu(
                      !showFilterMenu
                    )
                  }
                  className="bg-[#F5EEF6] px-6 py-3 rounded-xl shadow-md"
                >
                  Filter
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 mt-3 w-40 bg-white rounded-2xl shadow-lg py-3 z-50">
                    {[
                      "By me",
                      "Anyone",
                      "Ascending",
                      "Descending",
                    ].map((item) => (
                      <button
                        key={item}
                        className="block w-full text-left px-5 py-2 hover:bg-gray-100"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-500 mb-10"></div>

          {/* CARDS */}
          <div className="grid grid-cols-4 gap-4 flex-1">
            {currentActivities.map((activity) => (
              <div
                key={activity._id}
                className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-40 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-bold text-lg leading-tight mb-2">
                    {activity.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-4 mb-4">
                    {activity.description}
                  </p>

                  <p className="text-xs font-semibold">
                    Uploaded by:{" "}
                    {activity.uploadedBy}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    {activity.date}
                  </p>

                  <div className="flex justify-end">
                    <button className="text-2xl text-gray-500">
                      ⋯
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center gap-6 mt-8">
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
              disabled={currentPage === 1}
              className="bg-[#E9DCEB] px-4 py-2 rounded-xl shadow"
            >
              &lt;
            </button>

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
              className="bg-[#E9DCEB] px-4 py-2 rounded-xl shadow"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </CenterLayout>
  );
};

export default ActivityLibrary;