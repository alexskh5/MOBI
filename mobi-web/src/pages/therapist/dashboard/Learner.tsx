import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  Search,
} from "lucide-react";

import TherapistLayout from "../../../layouts/TherapistLayout";
import {
  getLearners,
  type LearnerListItem,
} from "../../../services/learner/learnerApi";

interface LearnerData {
  _id: string;
  learnerCode: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  age: string;
  gender: string;
  level: string;
}

function calculateAge(birthDate: string) {
  const birthday = new Date(birthDate);

  if (Number.isNaN(birthday.getTime())) {
    return "-";
  }

  const today = new Date();
  let age =
    today.getFullYear() -
    birthday.getFullYear();

  const hasNotHadBirthday =
    today.getMonth() < birthday.getMonth() ||
    (
      today.getMonth() === birthday.getMonth() &&
      today.getDate() < birthday.getDate()
    );

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return String(age);
}

function mapLearner(
  learner: LearnerListItem,
): LearnerData {
  return {
    _id: learner.id,
    firstName: learner.firstName,
    lastName: learner.lastName,
    age: calculateAge(learner.birthDate),
    gender: learner.sexAtBirth,
    level:
      learner.currentSpeechLadder ??
      learner.suggestedSpeechLadder ??
      "For review",
  };
}

const learnersPerPage = 10;

/* =========================================================
   HELPERS
========================================================= */

function calculateAge(
  birthDate:
    | string
    | null,
) {
  if (!birthDate) {
    return null;
  }

  const birth =
    new Date(
      `${birthDate}T00:00:00`,
    );

  if (
    Number.isNaN(
      birth.getTime(),
    )
  ) {
    return null;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age -= 1;
  }

  return Math.max(
    age,
    0,
  );
}

function formatGender(
  value:
    | string
    | null,
) {
  if (!value) {
    return "Not set";
  }

  return value
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

function formatSpeechLadder(
  value:
    | string
    | null,
) {
  if (!value) {
    return "Not set";
  }

  return value
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

function toLearnerData(
  learner:
    TherapistLearnerRecord,
): LearnerData {
  return {
    _id:
      learner.id,

    learnerCode:
      learner.learnerCode,

  const [learners, setLearners] = useState<LearnerData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalLearners, setTotalLearners] = useState(0);

    middleName:
      learner.middleName,

    lastName:
      learner.lastName,

    age:
      calculateAge(
        learner.birthDate,
      ),

    gender:
      formatGender(
        learner.sexAtBirth,
      ),

    level:
      formatSpeechLadder(
        learner.currentSpeechLadder,
      ),

    currentSpeechLadder:
      learner.currentSpeechLadder,

    suggestedSpeechLadder:
      learner.suggestedSpeechLadder,

    therapistConfirmed:
      learner.therapistConfirmed,

    profilePhotoUrl:
      learner.profilePhotoUrl,
  };
}

/* =========================================================
   PAGE
========================================================= */

  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    let cancelled = false;

    const fetchLearners = async () => {
      try {
        setLoading(true);
        setError("");

        let sortBy:
          | "last_name"
          | "first_name"
          | "birth_date"
          | "created_at" =
          "created_at";

        let sortOrder:
          | "asc"
          | "desc" =
          "desc";

        switch (sortOption) {
          case "lastname-asc":
            sortBy = "last_name";
            sortOrder = "asc";
            break;
          case "lastname-desc":
            sortBy = "last_name";
            sortOrder = "desc";
            break;
          case "age-asc":
            sortBy = "birth_date";
            sortOrder = "desc";
            break;
          case "age-desc":
            sortBy = "birth_date";
            sortOrder = "asc";
            break;
          default:
            sortBy = "created_at";
            sortOrder = "desc";
        }

        const result = await getLearners({
          page: currentPage,
          limit: learnersPerPage,
          search,
          sortBy,
          sortOrder,
        });

        if (cancelled) {
          return;
        }

        setLearners(
          result.learners.map(mapLearner),
        );
        setTotalPages(
          result.pagination.totalPages,
        );
        setTotalLearners(
          result.pagination.total,
        );
      } catch (error) {
        console.error("Error fetching learners:", error);
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load learners.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }

    fetchLearners();

    return () => {
      cancelled = true;
    };
  }, [currentPage, search, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortOption]);

  return (
    <TherapistLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col">
          {/* TOP BAR */}
          <div className="flex justify-between items-center mb-6 gap-6">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  type="button"
                  className="text-3xl mr-4"
                  onClick={() =>
                    setSidebarOpen(
                      true,
                    )
                  }
                >
                  ☰
                </button>
              )}

              <h1 className="text-2xl font-medium">
                Learner{" "}
                <span className="bg-white px-2 rounded-full text-md">
                  {totalLearners}
                </span>
              </h1>
            </div>

            <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96 max-w-full">
              <Search
                size={20}
                className="text-gray-500 mr-3"
              />

              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="bg-transparent outline-none w-full"
              />
            </div>
          </div>

          <div className="border-b border-black mb-6" />

          {/* HEADER ACTIONS */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-medium">
              Assigned learners
            </p>

            <div className="relative">
              <button
                type="button"
                className="text-md"
                onClick={() =>
                  setShowSortMenu(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }
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
	                      }}
                    >
                      Last Name A-Z
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
	                      onClick={() => {
	                        setSortOption("lastname-desc");
	                        setShowSortMenu(false);
	                      }}
                    >
                      Last Name Z-A
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
	                      onClick={() => {
	                        setSortOption("age-asc");
	                        setShowSortMenu(false);
	                      }}
                    >
                      Age ↑
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
	                      onClick={() => {
	                        setSortOption("age-desc");
	                        setShowSortMenu(false);
	                      }}
                    >
                      Age ↓
                    </button>

                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
	                      onClick={() => {
	                        setSortOption("default");
	                        setShowSortMenu(false);
	                      }}
	                    >
	                      Newest
	                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {
                errorMessage
              }
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            {/* TABLE */}
            <div className="bg-[#E4C9E5] rounded-xl p-6 border border-[#DFA5C9] shadow-md flex-1">
	              {loading ? (
	                <p>Loading learners...</p>
	              ) : error ? (
	                <p className="text-red-700">{error}</p>
	              ) : learners.length === 0 ? (
	                <p>No assigned learners found.</p>
	              ) : (
                <table className="w-full table-fixed text-md">
                  <thead>
                    <tr className="text-left border-b border-[#DFA5C9] [&>th]:pb-4">
                      <th className="w-44">
                        LEARNER ID
                      </th>

                      <th>
                        FIRST NAME
                      </th>

                      <th>
                        LAST NAME
                      </th>

                      <th className="w-28">
                        AGE
                      </th>

                      <th className="w-36">
                        GENDER
                      </th>

                      <th className="w-40">
                        SPEECH LADDER
                      </th>
                    </tr>
                  </thead>

                  <tbody>
	                    {learners.map((learner) => (
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
                            )
                          }
                        >
                          <td className="truncate pr-4">
                            {
                              learner.learnerCode ??
                              "—"
                            }
                          </td>

                          <td>
                            {
                              learner.firstName
                            }
                          </td>

                          <td>
                            {
                              learner.lastName
                            }
                          </td>

                          <td>
                            {
                              learner.age ??
                              "—"
                            }
                          </td>

                          <td>
                            {
                              learner.gender
                            }
                          </td>

                          <td>
                            {
                              learner.level
                            }
                          </td>
                        </tr>
                      ),
                    )}
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
                disabled={totalPages <= 1 || currentPage === totalPages}
                className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
              >
                &gt;
              </button>
            </div>

            <p className="text-sm font-medium">
              {currentPage} of {Math.max(totalPages, 1)}
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
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        (
                          previous,
                        ) =>
                          Math.max(
                            previous -
                              1,
                            1,
                          ),
                      )
                    }
                    disabled={
                      currentPage ===
                      1
                    }
                    className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
                  >
                    &lt;
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        (
                          previous,
                        ) =>
                          Math.min(
                            previous +
                              1,
                            totalPages,
                          ),
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
                  >
                    &gt;
                  </button>
                </div>

                <p className="text-sm font-medium">
                  {
                    currentPage
                  }{" "}
                  of{" "}
                  {
                    totalPages
                  }
                </p>
              </div>
            )}
        </div>
      )}
    </TherapistLayout>
  );
};

export default Learner;
