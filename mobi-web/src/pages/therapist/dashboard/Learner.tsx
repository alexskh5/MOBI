import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import TherapistLayout from "../../../layouts/TherapistLayout";

interface LearnerData {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  level: number;
}

const Learner = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const learnersPerPage = 10;

  const navigate = useNavigate();

  const [learners, setLearners] = useState<LearnerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedLearner, setSelectedLearner] =
    useState<LearnerData | null>(null);

  const [showSortMenu, setShowSortMenu] = useState(false);

  // const [sortOption, setSortOption] = useState("default");
  // UNCOMMENT RANI NYA DELETE NING IYA UBOS NA LINE NIG BACKEND NA KAY ERROR MAN RN
  const [, setSortOption] = useState("default");

  // placeholder rani et pero matic na count ang list ehu
  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const data: LearnerData[] = [
          {
            _id: "1",
            firstName: "Lexi Rose",
            lastName: "Pantaleon",
            age: 8,
            gender: "Female",
            level: 4,
          },
          {
            _id: "2",
            firstName: "John",
            lastName: "Doe",
            age: 7,
            gender: "Male",
            level: 3,
          },
          {
            _id: "3",
            firstName: "Sophia",
            lastName: "Garcia",
            age: 9,
            gender: "Female",
            level: 5,
          },
          {
            _id: "4",
            firstName: "Ethan",
            lastName: "Santos",
            age: 6,
            gender: "Male",
            level: 2,
          },
          {
            _id: "5",
            firstName: "Mia",
            lastName: "Reyes",
            age: 8,
            gender: "Female",
            level: 4,
          },
          {
            _id: "6",
            firstName: "Lucas",
            lastName: "Cruz",
            age: 10,
            gender: "Male",
            level: 6,
          },
          {
            _id: "7",
            firstName: "Emma",
            lastName: "Flores",
            age: 7,
            gender: "Female",
            level: 3,
          },
          {
            _id: "8",
            firstName: "Noah",
            lastName: "Torres",
            age: 9,
            gender: "Male",
            level: 5,
          },
          {
            _id: "9",
            firstName: "Olivia",
            lastName: "Mendoza",
            age: 8,
            gender: "Female",
            level: 4,
          },
          {
            _id: "10",
            firstName: "Liam",
            lastName: "Villanueva",
            age: 7,
            gender: "Male",
            level: 3,
          },
          {
            _id: "11",
            firstName: "Ava",
            lastName: "Ramos",
            age: 8,
            gender: "Female",
            level: 4,
          },
          {
            _id: "12",
            firstName: "James",
            lastName: "Navarro",
            age: 9,
            gender: "Male",
            level: 5,
          },
        ];

        setLearners(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching learners:", error);
        setLoading(false);
      }
    };

    fetchLearners();
  }, []);

  const totalPages = Math.ceil(learners.length / learnersPerPage);

  const startIndex = (currentPage - 1) * learnersPerPage;

  const currentLearners = learners.slice(
    startIndex,
    startIndex + learnersPerPage
  );

  return (
    <TherapistLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col">
          {/* TOP BAR */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  className="text-3xl mr-4"
                  onClick={() => setSidebarOpen(true)}
                >
                  ☰
                </button>
              )}

              <h1 className="text-2xl font-medium">
                Learner{" "}
                <span className="bg-white px-2 rounded-full text-md">
                  {learners.length}
                </span>
              </h1>
            </div>

            <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96">
              <Search size={20} className="text-gray-500 mr-3" />

              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none w-full"
              />
            </div>
          </div>

          <div className="border-b border-black mb-6"></div>

          {/* HEADER ACTIONS */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-medium">
              Click Learner to view progress
            </p>

            <div className="flex items-center gap-6">
              <div className="relative">
                <button
                  className="text-md"
                  onClick={() => setShowSortMenu(!showSortMenu)}
                >
                  Sort List ▾
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSortOption("lastname-asc");
                        setShowSortMenu(false);

                        // TODO: Backend sort by last name A-Z
                      }}
                    >
                      Last Name A-Z
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSortOption("lastname-desc");
                        setShowSortMenu(false);

                        // TODO: Backend sort by last name Z-A
                      }}
                    >
                      Last Name Z-A
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSortOption("age-asc");
                        setShowSortMenu(false);

                        // TODO: Backend sort by youngest first
                      }}
                    >
                      Age ↑
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSortOption("age-desc");
                        setShowSortMenu(false);

                        // TODO: Backend sort by oldest first
                      }}
                    >
                      Age ↓
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSortOption("level-asc");
                        setShowSortMenu(false);

                        // TODO: Backend sort by level ascending
                      }}
                    >
                      Level ↑
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSortOption("level-desc");
                        setShowSortMenu(false);

                        // TODO: Backend sort by level descending
                      }}
                    >
                      Level ↓
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {/* TABLE */}
            <div className="bg-[#E4C9E5] rounded-xl p-6 border border-[#DFA5C9] shadow-md flex-1">
              {loading ? (
                <p>Loading learners...</p>
              ) : (
                <table className="w-full table-fixed text-md">
                  <thead>
                    <tr className="text-left border-b border-[#DFA5C9] [&>th]:pb-4">
                      <th className="w-40">ID</th>
                      <th>FIRST NAME</th>
                      <th>LAST NAME</th>
                      <th className="w-32">AGE</th>
                      <th className="w-40">GENDER</th>
                      <th className="w-40">LEARNER LEVEL</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentLearners.map((learner) => (
                      <tr
                        key={learner._id}
                        className="border-b border-[#DFA5C9] hover:bg-[#EBCFE9] cursor-pointer [&>td]:py-2"
                        onClick={() =>
                          navigate(
                            `/therapist/dashboard/${learner._id}/progress`,
                            {
                              state: {
                                learner,
                                learnerCount: learners.length,
                              },
                            }
                          )
                        }
                      >
                        <td>{learner._id}</td>
                        <td>{learner.firstName}</td>
                        <td>{learner.lastName}</td>
                        <td>{learner.age}</td>
                        <td>{learner.gender}</td>
                        <td>{learner.level}</td>
                        <td className="relative text-center">
                          <button
                            className="text-xl font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(
                                openMenu === learner._id
                                  ? null
                                  : learner._id
                              );
                            }}
                          >
                            ⋯
                          </button>

                          {openMenu === learner._id && (
                            <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-2 z-50">
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/therapist/dashboard/${learner._id}/EditLearner`
                                  );
                                }}
                              >
                                Edit Learner
                              </button>

                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLearner(learner);
                                  setShowUnenrollModal(true);
                                  setOpenMenu(null);
                                }}
                              >
                                Unenroll Learner
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
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
                className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
              >
                &gt;
              </button>
            </div>

            <p className="text-sm font-medium">
              {currentPage} of {totalPages}
            </p>
          </div>

          {showUnenrollModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-[#F4EAF5] rounded-3xl p-8 w-96 shadow-xl">
                <h2 className="text-2xl font-semibold mb-3 text-center">
                  Unenroll Learner
                </h2>

                <p className="text-center text-gray-700 mb-8">
                  Are you sure you want to unenroll
                  <br />
                  <span className="font-semibold">
                    {selectedLearner?.firstName}{" "}
                    {selectedLearner?.lastName}
                  </span>
                  ?
                </p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowUnenrollModal(false)}
                    className="px-6 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      setShowUnenrollModal(false);

                      // TODO: Backend unenroll function here

                      console.log(
                        "Unenrolled:",
                        selectedLearner?._id
                      );
                    }}
                    className="px-6 py-2 rounded-xl bg-[#DFA5C9] text-white hover:bg-[#d48cb8]"
                  >
                    Unenroll
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </TherapistLayout>
  );
};

export default Learner;