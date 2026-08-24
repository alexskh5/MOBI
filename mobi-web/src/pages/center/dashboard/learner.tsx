// // MOBI/mobi-web/src/pages/center/dashboard/learner.tsx

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Search } from "lucide-react";
// // import { useEffect, useState, useRef } from "react";
// import CenterLayout from "../../../layouts/CenterLayout";


// interface LearnerData {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   age: number;
//   gender: string;
//   level: number;
// }

// const Learner = () => {
//   const [currentPage, setCurrentPage] = useState(1);

//   const learnersPerPage = 10;

//   const navigate = useNavigate();

//   const [learners, setLearners] = useState<LearnerData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const [openMenu, setOpenMenu] = useState<string | null>(null);

//   const [showUnenrollModal, setShowUnenrollModal] = useState(false);
//   const [selectedLearner, setSelectedLearner] = useState<LearnerData | null>(null);

//   const [showSortMenu, setShowSortMenu] = useState(false);
// //   const [sortOption, setSortOption] = useState("default");    UNCOMMENT RANI NYA DELETE NING IYA UBOS NA LINE NIGV BACKEND NA KAY ERROR MAN RN
//   const [, setSortOption] = useState("default"); 

// //   placeholder rani et pero matic na count ang list ehu
//   useEffect(() => {
//     const fetchLearners = async () => {
//       try {
//         const data: LearnerData[] = [
//         { _id: "1", firstName: "Lexi Rose", lastName: "Pantaleon", age: 8, gender: "Female", level: 4 },
//         { _id: "2", firstName: "John", lastName: "Doe", age: 7, gender: "Male", level: 3 },
//         { _id: "3", firstName: "Sophia", lastName: "Garcia", age: 9, gender: "Female", level: 5 },
//         { _id: "4", firstName: "Ethan", lastName: "Santos", age: 6, gender: "Male", level: 2 },
//         { _id: "5", firstName: "Mia", lastName: "Reyes", age: 8, gender: "Female", level: 4 },
//         { _id: "6", firstName: "Lucas", lastName: "Cruz", age: 10, gender: "Male", level: 6 },
//         { _id: "7", firstName: "Emma", lastName: "Flores", age: 7, gender: "Female", level: 3 },
//         { _id: "8", firstName: "Noah", lastName: "Torres", age: 9, gender: "Male", level: 5 },
//         { _id: "9", firstName: "Olivia", lastName: "Mendoza", age: 8, gender: "Female", level: 4 },
//         { _id: "10", firstName: "Liam", lastName: "Villanueva", age: 7, gender: "Male", level: 3 },
//         { _id: "11", firstName: "Ava", lastName: "Ramos", age: 8, gender: "Female", level: 4 },
//         { _id: "12", firstName: "James", lastName: "Navarro", age: 9, gender: "Male", level: 5 },
//         ];

//         setLearners(data);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching learners:", error);
//         setLoading(false);
//       }
//     };

//     fetchLearners();
//   }, []);

//     const totalPages = Math.ceil(
//     learners.length / learnersPerPage
//     );

//     const startIndex =
//     (currentPage - 1) * learnersPerPage;

//     const currentLearners = learners.slice(
//     startIndex,
//     startIndex + learnersPerPage
//     );

//   return (
//     <CenterLayout>
//         {(sidebarOpen, setSidebarOpen) => (
//             <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col">
//             {/* TOP BAR */}
//             <div className="flex justify-between items-center mb-6">
//                 <div className="flex items-center gap-4">
//                 {!sidebarOpen && (
//                 <button
//                     className="text-3xl mr-4"
//                     onClick={() => setSidebarOpen(true)}
//                 >
//                     ☰
//                 </button>
//                 )}

//                 <h1 className="text-2xl font-medium">
//                     Learner{" "}
//                     <span className="bg-white px-2 rounded-full text-md">
//                     {learners.length}
//                     </span>
//                 </h1>
//                 </div>

//                 {/* insert search logic latur */}
//                 {/* <div className="flex items-center bg-[#f3e9f4] px-5 py-3 rounded-xl shadow-sm w-120">
//                 <Search
//                     size={20}
//                     className="mr-3 text-gray-500"
//                 />

//                 <input
//                     type="text"
//                     placeholder="Search"
//                     className="bg-transparent outline-none w-full text-lg"
//                 />
//                 </div> */}
//                 <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96">
//                     <Search
//                     size={20}
//                     className="text-gray-500 mr-3"
//                     />

//                     <input
//                     type="text"
//                     placeholder="Search"
//                     className="bg-transparent outline-none w-full"
//                     />
//                 </div>

//             </div>

//             <div className="border-b border-black mb-6"></div>
            
//           {/* HEADER ACTIONS */}
//           <div className="flex justify-between items-center mb-6">
//             <p className="text-lg font-medium">Click Learner to view progress</p>

//             <div className="flex items-center gap-6">
//                 <div className="relative">
//                 <button
//                     className="text-md"
//                     onClick={() => setShowSortMenu(!showSortMenu)}
//                 >
//                     Sort List ▾
//                 </button>

//                 {showSortMenu && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
//                     <button
//                         className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                         onClick={() => {
//                         setSortOption("lastname-asc");
//                         setShowSortMenu(false);

//                         // TODO: Backend sort by last name A-Z
//                         }}
//                     >
//                         Last Name A-Z
//                     </button>

//                     <button
//                         className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                         onClick={() => {
//                         setSortOption("lastname-desc");
//                         setShowSortMenu(false);

//                         // TODO: Backend sort by last name Z-A
//                         }}
//                     >
//                         Last Name Z-A
//                     </button>

//                     <button
//                         className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                         onClick={() => {
//                         setSortOption("age-asc");
//                         setShowSortMenu(false);

//                         // TODO: Backend sort by youngest first
//                         }}
//                     >
//                         Age ↑
//                     </button>

//                     <button
//                         className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                         onClick={() => {
//                         setSortOption("age-desc");
//                         setShowSortMenu(false);

//                         // TODO: Backend sort by oldest first
//                         }}
//                     >
//                         Age ↓
//                     </button>

//                     <button
//                         className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                         onClick={() => {
//                         setSortOption("level-asc");
//                         setShowSortMenu(false);

//                         // TODO: Backend sort by level ascending
//                         }}
//                     >
//                         Level ↑
//                     </button>

//                     <button
//                         className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                         onClick={() => {
//                         setSortOption("level-desc");
//                         setShowSortMenu(false);

//                         // TODO: Backend sort by level descending
//                         }}
//                     >
//                         Level ↓
//                     </button>
//                     </div>
//                 )}
//             </div>

                

//               <button
//                 onClick={() => navigate("/center/dashboard/AddLearner")}
//                 className="bg-[#f4edf5] px-8 py-2 rounded-xl shadow"
//               >
//                 + Add Learner
//               </button>
//             </div>
//           </div>

//           <div className="flex-1 flex flex-col">
//             {/* TABLE */}
//             <div className="bg-[#E4C9E5] rounded-xl p-6 border border-[#DFA5C9] shadow-md flex-1">
//             {loading ? (
//                 <p>Loading learners...</p>
//             ) : (
//                 <table className="w-full table-fixed text-md">
//                 <thead>
//                     <tr className="text-left border-b border-[#DFA5C9] [&>th]:pb-4">
//                     <th className="w-40">ID</th>
//                     <th>FIRST NAME</th>
//                     <th>LAST NAME</th>
//                     <th className="w-32">AGE</th>
//                     <th className="w-40">GENDER</th>
//                     <th className="w-40">LEARNER LEVEL</th>
//                     <th className="w-12"></th>
//                     </tr>
//                 </thead>

//                 <tbody>
//                     {currentLearners.map((learner) => (
//                     <tr
//                         key={learner._id}
//                         className="border-b border-[#DFA5C9] hover:bg-[#EBCFE9] cursor-pointer [&>td]:py-2"
//                         onClick={() =>
//                         navigate(`/center/dashboard/${learner._id}/progress`, {
//                             state: {
//                                 learner,
//                                 learnerCount: learners.length,
//                             },
//                         })
//                         }
//                     >
//                         <td>{learner._id}</td>
//                         <td>{learner.firstName}</td>
//                         <td>{learner.lastName}</td>
//                         <td>{learner.age}</td>
//                         <td>{learner.gender}</td>
//                         <td>{learner.level}</td>
//                         <td className="relative text-center">
//                         <button
//                             className="text-xl font-bold"
//                             onClick={(e) => {
//                             e.stopPropagation();
//                             setOpenMenu(
//                                 openMenu === learner._id ? null : learner._id
//                             );
//                             }}
//                         >
//                             ⋯
//                         </button>

//                         {openMenu === learner._id && (
//                             <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-2 z-50">
//                             <button
//                                 className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                                 onClick={(e) => {
//                                 e.stopPropagation();
//                                 navigate(`/center/dashboard/${learner._id}/EditLearner`);
//                                 }}
//                             >
//                                 Edit Learner
//                             </button>

//                             <button
//                             className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 setSelectedLearner(learner);
//                                 setShowUnenrollModal(true);
//                                 setOpenMenu(null);
//                             }}
//                             >
//                             Unenroll Learner
//                             </button>
//                             </div>
//                         )}
//                         </td>
//                     </tr>
//                     ))}
//                 </tbody>
//                 </table>
//             )}
//             </div>
//             </div>
            

//             {/* PAGINATION */}
//             <div className="flex justify-between items-center mt-4">
//             <div className="flex gap-2">
//                 <button
//                 onClick={() =>
//                     setCurrentPage((prev) =>
//                     Math.max(prev - 1, 1)
//                     )
//                 }
//                 disabled={currentPage === 1}
//                 className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
//                 >
//                 &lt;
//                 </button>

//                 <button
//                 onClick={() =>
//                     setCurrentPage((prev) =>
//                     Math.min(prev + 1, totalPages)
//                     )
//                 }
//                 disabled={currentPage === totalPages}
//                 className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
//                 >
//                 &gt;
//                 </button>
//             </div>

//             <p className="text-sm font-medium">
//                 {currentPage} of {totalPages}
//             </p>
//             </div>
          
//             {showUnenrollModal && (
//             <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
//                 <div className="bg-[#F4EAF5] rounded-3xl p-8 w-96 shadow-xl">
                
//                 <h2 className="text-2xl font-semibold mb-3 text-center">
//                     Unenroll Learner
//                 </h2>

//                 <p className="text-center text-gray-700 mb-8">
//                     Are you sure you want to unenroll
//                     <br />
//                     <span className="font-semibold">
//                     {selectedLearner?.firstName} {selectedLearner?.lastName}
//                     </span>
//                     ?
//                 </p>

//                 <div className="flex justify-center gap-4">
//                     <button
//                     onClick={() => setShowUnenrollModal(false)}
//                     className="px-6 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100"
//                     >
//                     Cancel
//                     </button>

//                     <button
//                     onClick={() => {
//                         setShowUnenrollModal(false);

//                         // TODO: Backend unenroll function here

//                         console.log(
//                         "Unenrolled:",
//                         selectedLearner?._id
//                         );
//                     }}
//                     className="px-6 py-2 rounded-xl bg-[#DFA5C9] text-white hover:bg-[#d48cb8]"
//                     >
//                     Unenroll
//                     </button>
//                 </div>
//                 </div>
//             </div>
//             )}

//         </div>
//       )}
//     </CenterLayout>
//   );
// };

// export default Learner;




// MOBI/mobi-web/src/pages/center/dashboard/learner.tsx

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

import CenterLayout from "../../../layouts/CenterLayout";

import {
  getLearners,
} from "../../../services/learner/learnerApi";

import type {
  LearnerListItem,
} from "../../../services/learner/learnerApi";

/* =========================================================
   TYPES
========================================================= */

/*
  These are the sorting options used by this page.

  They are converted into backend query parameters inside
  fetchLearners().
*/
type SortOption =
  | "default"
  | "lastname-asc"
  | "lastname-desc"
  | "age-asc"
  | "age-desc";

/* =========================================================
   CONFIGURATION
========================================================= */

const LEARNERS_PER_PAGE = 10;

/* =========================================================
   HELPERS
========================================================= */

/*
  The database stores birth_date instead of age.

  This is better because age changes every year while the
  birth date remains permanent.

  The frontend calculates the learner's current age whenever
  the list is displayed.
*/
function calculateAge(
  birthDate: string,
): number | null {
  if (!birthDate) {
    return null;
  }

  const today =
    new Date();

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

  return age;
}

/*
  Converts database values such as:

  female
  male
  not_disclosed

  into display-friendly text.
*/
function formatSexAtBirth(
  value: string,
) {
  switch (value) {
    case "female":
      return "Female";

    case "male":
      return "Male";

    case "intersex":
      return "Intersex";

    case "not_disclosed":
      return "Not disclosed";

    default:
      return value || "—";
  }
}

/*
  Your planned learner table uses a numeric learner level.

  MOBI's actual backend uses Speech Ladder names.

  Therefore we convert:

  Sound        = Level 1
  Syllable     = Level 2
  Word         = Level 3
  Phrase       = Level 4
  Sentence     = Level 5
  Conversation = Level 6
*/
function speechLadderToLevel(
  speechLadder:
    | string
    | null,
): number | null {
  switch (
    speechLadder?.toLowerCase()
  ) {
    case "sound":
      return 1;

    case "syllable":
      return 2;

    case "word":
      return 3;

    case "phrase":
      return 4;

    case "sentence":
      return 5;

    case "conversation":
      return 6;

    default:
      return null;
  }
}

/*
  Therapist-confirmed level has priority.

  Until the therapist confirms the level, we temporarily
  display the system's suggested Speech Ladder.

  This is DISPLAY ONLY.

  It does not change current_speech_ladder in the database.
*/
function getDisplayLearnerLevel(
  learner: LearnerListItem,
): number | null {
  const speechLadder =
    learner.currentSpeechLadder ??
    learner.suggestedSpeechLadder;

  return speechLadderToLevel(
    speechLadder,
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Learner = () => {
  const navigate =
    useNavigate();

  /* =======================================================
     DATA
  ======================================================= */

  const [
    learners,
    setLearners,
  ] = useState<
    LearnerListItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    totalLearners,
    setTotalLearners,
  ] = useState(0);

  /* =======================================================
     SEARCH
  ======================================================= */

  /*
    searchInput changes immediately while typing.

    debouncedSearch is updated after a small delay so we
    don't request the backend on every single keystroke.
  */
  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  /* =======================================================
     SORT
  ======================================================= */

  const [
    showSortMenu,
    setShowSortMenu,
  ] = useState(false);

  const [
    sortOption,
    setSortOption,
  ] = useState<SortOption>(
    "default",
  );

  /* =======================================================
     ROW MENU
  ======================================================= */

  const [
    openMenu,
    setOpenMenu,
  ] = useState<
    string | null
  >(null);

  /* =======================================================
     UNENROLL MODAL
  ======================================================= */

  const [
    showUnenrollModal,
    setShowUnenrollModal,
  ] = useState(false);

  const [
    selectedLearner,
    setSelectedLearner,
  ] = useState<
    LearnerListItem | null
  >(null);

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        setDebouncedSearch(
          searchInput.trim(),
        );

        /*
          Any new search should begin from page 1.
        */
        setCurrentPage(1);
      }, 350);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [searchInput]);

  /* =======================================================
     LOAD LEARNERS
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    const fetchLearners =
      async () => {
        try {
          setLoading(true);
          setError("");

          /* -----------------------------------------------
             MAP UI SORT TO BACKEND SORT
          ----------------------------------------------- */

          let sortBy:
            | "last_name"
            | "birth_date"
            | "created_at" =
            "created_at";

          let sortOrder:
            | "asc"
            | "desc" =
            "desc";

          switch (sortOption) {
            case "lastname-asc":
              sortBy =
                "last_name";

              sortOrder =
                "asc";
              break;

            case "lastname-desc":
              sortBy =
                "last_name";

              sortOrder =
                "desc";
              break;

            /*
              Age ascending means:

              youngest → oldest

              A younger person has a later birth date.

              So:
              Age ↑ = birth_date DESC
            */
            case "age-asc":
              sortBy =
                "birth_date";

              sortOrder =
                "desc";
              break;

            /*
              Age descending means:

              oldest → youngest

              An older person has an earlier birth date.

              So:
              Age ↓ = birth_date ASC
            */
            case "age-desc":
              sortBy =
                "birth_date";

              sortOrder =
                "asc";
              break;

            default:
              sortBy =
                "created_at";

              sortOrder =
                "desc";
          }

          const result =
            await getLearners({
              page:
                currentPage,

              limit:
                LEARNERS_PER_PAGE,

              search:
                debouncedSearch,

              sortBy,

              sortOrder,
            });

          /*
            Prevent an older request from changing state
            after this component/effect has already changed.
          */
          if (cancelled) {
            return;
          }

          setLearners(
            result.learners,
          );

          setTotalPages(
            result.pagination
              .totalPages,
          );

          setTotalLearners(
            result.pagination.total,
          );
        } catch (fetchError) {
          if (cancelled) {
            return;
          }

          console.error(
            "Error fetching learners:",
            fetchError,
          );

          setLearners([]);

          setTotalPages(0);

          setTotalLearners(0);

          setError(
            fetchError instanceof
              Error
              ? fetchError.message
              : "Unable to load learners.",
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    fetchLearners();

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    debouncedSearch,
    sortOption,
  ]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  /*
    The backend already performs pagination.

    Therefore we do NOT use:

      learners.slice(...)

    anymore.

    `learners` already contains only the current page.
  */
  const currentLearners =
    useMemo(
      () => learners,
      [learners],
    );

  /* =======================================================
     SORT HANDLER
  ======================================================= */

  const handleSortChange = (
    option: SortOption,
  ) => {
    setSortOption(option);

    setShowSortMenu(false);

    /*
      Return to the first page after changing sort.
    */
    setCurrentPage(1);
  };

  /* =======================================================
     UNENROLL

     Backend endpoint will be added later.
  ======================================================= */

  const handleUnenroll =
    () => {
      if (!selectedLearner) {
        return;
      }

      /*
        TODO:

        Later call:

        PATCH /api/learners/:learnerId/unenroll

        We should change enrollment_status instead of
        permanently deleting the learner record.
      */
      console.log(
        "Unenroll learner:",
        selectedLearner.id,
      );

      setShowUnenrollModal(
        false,
      );

      setSelectedLearner(
        null,
      );
    };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <CenterLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col">

          {/* =================================================
              TOP BAR
          ================================================= */}

          <div className="flex justify-between items-center mb-6">

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
                  aria-label="Open sidebar"
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

            {/* ===============================================
                SEARCH

                Searches:
                - first name
                - last name
                - learner code

                through the backend.
            =============================================== */}

            <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96">

              <Search
                size={20}
                className="text-gray-500 mr-3"
              />

              <input
                type="text"
                value={
                  searchInput
                }
                onChange={(event) =>
                  setSearchInput(
                    event.target
                      .value,
                  )
                }
                placeholder="Search"
                className="bg-transparent outline-none w-full"
              />

            </div>

          </div>

          <div className="border-b border-black mb-6" />

          {/* =================================================
              HEADER ACTIONS
          ================================================= */}

          <div className="flex justify-between items-center mb-6">

            <p className="text-lg font-medium">
              Click Learner to view progress
            </p>

            <div className="flex items-center gap-6">

              {/* =============================================
                  SORT
              ============================================= */}

              <div className="relative">

                <button
                  type="button"
                  className="text-md"
                  onClick={() =>
                    setShowSortMenu(
                      (
                        previous,
                      ) =>
                        !previous,
                    )
                  }
                >
                  Sort List ▾
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">

                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() =>
                        handleSortChange(
                          "lastname-asc",
                        )
                      }
                    >
                      Last Name A-Z
                    </button>

                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() =>
                        handleSortChange(
                          "lastname-desc",
                        )
                      }
                    >
                      Last Name Z-A
                    </button>

                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() =>
                        handleSortChange(
                          "age-asc",
                        )
                      }
                    >
                      Age ↑
                    </button>

                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() =>
                        handleSortChange(
                          "age-desc",
                        )
                      }
                    >
                      Age ↓
                    </button>

                    {/*
                      LEVEL SORT

                      We are temporarily not showing the old
                      Level ↑ / Level ↓ options.

                      WHY?

                      Learner level is now derived from:

                      learner_transactional_profiles

                      and the current list endpoint sorts
                      directly on the learners table.

                      We should add proper Speech Ladder
                      sorting to the backend before exposing
                      these options again rather than sorting
                      only the current page incorrectly.
                    */}

                  </div>
                )}

              </div>

              {/* =============================================
                  ADD LEARNER
              ============================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/center/dashboard/AddLearner",
                  )
                }
                className="bg-[#f4edf5] px-8 py-2 rounded-xl shadow"
              >
                + Add Learner
              </button>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              TABLE CONTAINER
          ================================================= */}

          <div className="flex-1 flex flex-col">

            <div className="bg-[#E4C9E5] rounded-xl p-6 border border-[#DFA5C9] shadow-md flex-1">

              {loading ? (
                <p>
                  Loading learners...
                </p>
              ) : currentLearners.length ===
                0 ? (
                <div className="flex h-full min-h-52 items-center justify-center">

                  <p className="text-gray-600">
                    {debouncedSearch
                      ? "No learners found for this search."
                      : "No learners enrolled yet."}
                  </p>

                </div>
              ) : (
                <table className="w-full table-fixed text-md">

                  {/* =========================================
                      TABLE HEADER

                      Kept according to your planned UI.
                  ========================================= */}

                  <thead>
                    <tr className="text-left border-b border-[#DFA5C9] [&>th]:pb-4">

                      <th className="w-40">
                        ID
                      </th>

                      <th>
                        FIRST NAME
                      </th>

                      <th>
                        LAST NAME
                      </th>

                      <th className="w-32">
                        AGE
                      </th>

                      <th className="w-40">
                        GENDER
                      </th>

                      <th className="w-40">
                        LEARNER LEVEL
                      </th>

                      <th className="w-12" />

                    </tr>
                  </thead>

                  {/* =========================================
                      TABLE BODY
                  ========================================= */}

                  <tbody>

                    {currentLearners.map(
                      (learner) => {
                        const age =
                          calculateAge(
                            learner.birthDate,
                          );

                        const level =
                          getDisplayLearnerLevel(
                            learner,
                          );

                        return (
                          <tr
                            key={
                              learner.id
                            }
                            className="border-b border-[#DFA5C9] hover:bg-[#EBCFE9] cursor-pointer [&>td]:py-2"
                            onClick={() =>
                              navigate(
                                `/center/dashboard/${learner.id}/progress`,
                                {
                                  state: {
                                    learner,

                                    learnerCount:
                                      totalLearners,
                                  },
                                },
                              )
                            }
                          >

                            {/* ID */}

                            <td className="pr-3 truncate">
                              {
                                learner.learnerCode
                              }
                            </td>

                            {/* FIRST NAME */}

                            <td>
                              <div className="flex items-center gap-3">

                                {/*
                                  Optional learner profile image.

                                  This does not change your
                                  planned columns; it simply
                                  appears beside first name.
                                */}

                                {learner.profilePhotoUrl && (
                                  <img
                                    src={
                                      learner.profilePhotoUrl
                                    }
                                    alt=""
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                )}

                                <span>
                                  {
                                    learner.firstName
                                  }
                                </span>

                              </div>
                            </td>

                            {/* LAST NAME */}

                            <td>
                              {
                                learner.lastName
                              }
                            </td>

                            {/* AGE */}

                            <td>
                              {age ?? "—"}
                            </td>

                            {/* GENDER */}

                            <td>
                              {formatSexAtBirth(
                                learner.sexAtBirth,
                              )}
                            </td>

                            {/* LEARNER LEVEL */}

                            <td>
                              {level ?? "—"}
                            </td>

                            {/* =================================
                                ROW ACTIONS
                            ================================= */}

                            <td className="relative text-center">

                              <button
                                type="button"
                                className="text-xl font-bold"
                                onClick={(
                                  event,
                                ) => {
                                  event.stopPropagation();

                                  setOpenMenu(
                                    openMenu ===
                                      learner.id
                                      ? null
                                      : learner.id,
                                  );
                                }}
                              >
                                ⋯
                              </button>

                              {openMenu ===
                                learner.id && (
                                <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-2 z-50">

                                  <button
                                    type="button"
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    onClick={(
                                      event,
                                    ) => {
                                      event.stopPropagation();

                                      navigate(
                                        `/center/dashboard/${learner.id}/EditLearner`,
                                      );
                                    }}
                                  >
                                    Edit Learner
                                  </button>

                                  <button
                                    type="button"
                                    className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                                    onClick={(
                                      event,
                                    ) => {
                                      event.stopPropagation();

                                      setSelectedLearner(
                                        learner,
                                      );

                                      setShowUnenrollModal(
                                        true,
                                      );

                                      setOpenMenu(
                                        null,
                                      );
                                    }}
                                  >
                                    Unenroll Learner
                                  </button>

                                </div>
                              )}

                            </td>

                          </tr>
                        );
                      },
                    )}

                  </tbody>

                </table>
              )}

            </div>

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

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
                  loading ||
                  currentPage === 1
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
                  loading ||
                  totalPages === 0 ||
                  currentPage >=
                    totalPages
                }
                className="px-4 py-2 bg-white rounded-lg disabled:opacity-50"
              >
                &gt;
              </button>

            </div>

            <p className="text-sm font-medium">
              {totalPages === 0
                ? "0 of 0"
                : `${currentPage} of ${totalPages}`}
            </p>

          </div>

          {/* =================================================
              UNENROLL MODAL
          ================================================= */}

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
                    {
                      selectedLearner?.firstName
                    }{" "}
                    {
                      selectedLearner?.lastName
                    }
                  </span>

                  ?
                </p>

                <div className="flex justify-center gap-4">

                  <button
                    type="button"
                    onClick={() => {
                      setShowUnenrollModal(
                        false,
                      );

                      setSelectedLearner(
                        null,
                      );
                    }}
                    className="px-6 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleUnenroll
                    }
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
    </CenterLayout>
  );
};

export default Learner;