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
  getTherapistLearners,
  type TherapistLearnerRecord,
} from "../../../services/therapist/therapistApi";

type SortOption =
  | "lastname-asc"
  | "lastname-desc"
  | "age-asc"
  | "age-desc"
  | "level-asc"
  | "level-desc";

interface LearnerData {
  _id: string;
  learnerCode: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  age: number | null;
  gender: string;
  level: string;
  currentSpeechLadder: string | null;
  suggestedSpeechLadder: string | null;
  therapistConfirmed: boolean;
  profilePhotoUrl: string | null;
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

    firstName:
      learner.firstName,

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

const Learner = () => {
  const navigate =
    useNavigate();

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1);

  const [
    learners,
    setLearners,
  ] =
    useState<
      LearnerData[]
    >([]);

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

  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState("");

  const [
    sortOption,
    setSortOption,
  ] =
    useState<SortOption>(
      "lastname-asc",
    );

  const [
    showSortMenu,
    setShowSortMenu,
  ] =
    useState(false);

  /* =======================================================
     LOAD REAL ASSIGNED LEARNERS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function fetchLearners() {
      const role =
        localStorage.getItem(
          "mobi_staff_role",
        );

      const therapistId =
        localStorage.getItem(
          "mobi_staff_profile_id",
        );

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

        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const result =
          await getTherapistLearners(
            therapistId,
          );

        if (!mounted) {
          return;
        }

        const realLearners =
          (
            result.learners ??
            []
          ).map(
            toLearnerData,
          );

        setLearners(
          realLearners,
        );
      } catch (
        error: any
      ) {
        if (!mounted) {
          return;
        }

        console.error(
          "Error fetching therapist learners:",
          error,
        );

        setLearners([]);

        setErrorMessage(
          error
            ?.response
            ?.data
            ?.message ||
          error?.message ||
          "Unable to load your assigned learners.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void fetchLearners();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /* =======================================================
     SEARCH + SORT
  ======================================================= */

  const filteredLearners =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      const result =
        learners.filter(
          (learner) => {
            if (
              !normalizedSearch
            ) {
              return true;
            }

            const searchable =
              [
                learner.firstName,
                learner.middleName ??
                  "",
                learner.lastName,
                learner.learnerCode ??
                  "",
              ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(
              normalizedSearch,
            );
          },
        );

      return [
        ...result,
      ].sort(
        (
          first,
          second,
        ) => {
          if (
            sortOption ===
            "lastname-asc"
          ) {
            return first.lastName.localeCompare(
              second.lastName,
            );
          }

          if (
            sortOption ===
            "lastname-desc"
          ) {
            return second.lastName.localeCompare(
              first.lastName,
            );
          }

          if (
            sortOption ===
            "age-asc"
          ) {
            return (
              (
                first.age ??
                Number.MAX_SAFE_INTEGER
              ) -
              (
                second.age ??
                Number.MAX_SAFE_INTEGER
              )
            );
          }

          if (
            sortOption ===
            "age-desc"
          ) {
            return (
              (
                second.age ??
                -1
              ) -
              (
                first.age ??
                -1
              )
            );
          }

          if (
            sortOption ===
            "level-asc"
          ) {
            return first.level.localeCompare(
              second.level,
            );
          }

          return second.level.localeCompare(
            first.level,
          );
        },
      );
    }, [
      learners,
      searchTerm,
      sortOption,
    ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    sortOption,
  ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredLearners.length /
          learnersPerPage,
      ),
    );

  const startIndex =
    (
      currentPage - 1
    ) *
    learnersPerPage;

  const currentLearners =
    filteredLearners.slice(
      startIndex,
      startIndex +
        learnersPerPage,
    );

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
                  {
                    learners.length
                  }
                </span>
              </h1>
            </div>

            <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96 max-w-full">
              <Search
                size={20}
                className="text-gray-500 mr-3"
              />

              <input
                type="search"
                value={
                  searchTerm
                }
                onChange={(
                  event,
                ) =>
                  setSearchTerm(
                    event.target
                      .value,
                  )
                }
                placeholder="Search assigned learner"
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
                  {[
                    [
                      "lastname-asc",
                      "Last Name A-Z",
                    ],
                    [
                      "lastname-desc",
                      "Last Name Z-A",
                    ],
                    [
                      "age-asc",
                      "Age ↑",
                    ],
                    [
                      "age-desc",
                      "Age ↓",
                    ],
                    [
                      "level-asc",
                      "Speech Ladder A-Z",
                    ],
                    [
                      "level-desc",
                      "Speech Ladder Z-A",
                    ],
                  ].map(
                    ([
                      value,
                      label,
                    ]) => (
                      <button
                        key={
                          value
                        }
                        type="button"
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setSortOption(
                            value as SortOption,
                          );
                          setShowSortMenu(
                            false,
                          );
                        }}
                      >
                        {
                          label
                        }
                      </button>
                    ),
                  )}
                </div>
              )}
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
            <div className="bg-[#E4C9E5] rounded-xl p-6 border border-[#DFA5C9] shadow-md flex-1 overflow-auto">
              {loading ? (
                <p>
                  Loading assigned learners...
                </p>
              ) : learners.length ===
                0 ? (
                <div className="flex min-h-[320px] items-center justify-center text-center">
                  <div>
                    <p className="text-lg font-semibold">
                      No assigned learners
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Learners assigned to your Therapist account will appear here.
                    </p>
                  </div>
                </div>
              ) : filteredLearners.length ===
                0 ? (
                <div className="flex min-h-[320px] items-center justify-center text-center">
                  <div>
                    <p className="text-lg font-semibold">
                      No learner found
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Try a different search.
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full min-w-[920px] table-fixed text-md">
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
                    {currentLearners.map(
                      (
                        learner,
                      ) => (
                        <tr
                          key={
                            learner._id
                          }
                          className="border-b border-[#DFA5C9] hover:bg-[#EBCFE9] cursor-pointer [&>td]:py-3"
                          onClick={() =>
                            navigate(
                              `/therapist/dashboard/${learner._id}/progress`,
                              {
                                state: {
                                  learner,
                                  learnerCount:
                                    learners.length,
                                },
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
          {!loading &&
            filteredLearners.length >
              0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
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
