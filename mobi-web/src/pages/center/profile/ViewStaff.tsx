import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";


interface StaffData {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  role: string;
}

const Staff = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const staffsPerPage = 10;

  const navigate = useNavigate();

  const [staffs, setStaffs] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);

  const [showSortMenu, setShowSortMenu] = useState(false);

//   const [sortOption, setSortOption] = useState("default");    UNCOMMENT RANI NYA DELETE NING IYA UBOS NA LINE NIGV BACKEND NA KAY ERROR MAN RN
  const [, setSortOption] = useState("default"); 

    // placeholder rani ni pero matic na count ang list puhon
    useEffect(() => {
    const fetchStaffs = async () => {
        try {
        const data: StaffData[] = [
            {
            _id: "1",
            firstName: "Andres Lou",
            lastName: "Mulach",
            age: 28,
            gender: "Male",
            role: "Psychiatrist",
            },
            {
            _id: "2",
            firstName: "Maria",
            lastName: "Santos",
            age: 35,
            gender: "Female",
            role: "Occupational Therapist",
            },
            {
            _id: "3",
            firstName: "John",
            lastName: "Reyes",
            age: 40,
            gender: "Male",
            role: "Speech Therapist",
            },
            {
            _id: "4",
            firstName: "Sophia",
            lastName: "Garcia",
            age: 32,
            gender: "Female",
            role: "Behavioral Therapist",
            },
        ];

        setStaffs(data);
        setLoading(false);
        } catch (error) {
        console.error("Error fetching staffs:", error);
        setLoading(false);
        }
    };

    fetchStaffs();
    }, []);

    const totalPages = Math.ceil(
    staffs.length / staffsPerPage
    );

    const startIndex =
    (currentPage - 1) * staffsPerPage;

    const currentStaffs = staffs.slice(
    startIndex,
    startIndex + staffsPerPage
    );

  return (
    <CenterLayout>
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
                    Staff{" "}
                    <span className="bg-white px-2 rounded-full text-md">
                    {staffs.length}
                    </span>
                </h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Bar */}
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

                    {/* Close Page Button */}
                    <button
                        onClick={() => navigate("/center/profile")}
                        className="w-11 h-11 flex items-center justify-center bg-[#F5EEF6] rounded-xl shadow-md hover:bg-[#EBD7EC] transition"
                    >
                        <X
                        size={20}
                        className="text-[#7A5D7F]"
                        />
                    </button>
                </div>

            </div>

            <div className="border-b border-black mb-6"></div>
            
          {/* HEADER ACTIONS */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-medium">Click Staff to view profile</p>

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
                        setSortOption("role-asc");
                        setShowSortMenu(false);

                        // TODO: Backend sort specialty A-Z
                    }}
                    >
                    Role A-Z
                    </button>

                    <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                        setSortOption("role-desc");
                        setShowSortMenu(false);

                        // TODO: Backend sort specialty Z-A
                    }}
                    >
                    Role Z-A
                    </button>
                    </div>
                )}
                </div>

              <button
                onClick={() => navigate("/center/profile/AddStaff")}
                className="bg-[#f4edf5] px-8 py-2 rounded-xl shadow"
              >
                + Add Staff
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {/* TABLE */}
            <div className="bg-[#E4C9E5] rounded-xl p-6 border border-[#DFA5C9] shadow-md flex-1">
            {loading ? (
                <p>Loading Staffs...</p>
            ) : (
                <table className="w-full table-fixed text-md">
                <thead>
                    <tr className="text-left border-b border-[#DFA5C9] [&>th]:pb-4">
                    <th className="w-40">ID</th>
                    <th>FIRST NAME</th>
                    <th>LAST NAME</th>
                    <th className="w-32">AGE</th>
                    <th className="w-40">GENDER</th>
                    <th className="w-70">ROLE/POSITION</th>
                    <th className="w-12"></th>
                    </tr>
                </thead>

                <tbody>
                    {currentStaffs.map((Staff) => (
                    <tr
                        key={Staff._id}
                        className="border-b border-[#DFA5C9] hover:bg-[#EBCFE9] cursor-pointer [&>td]:py-2"
                        onClick={() =>
                        navigate(`/center/dashboard/${Staff._id}`)
                        }
                    >
                        <td>{Staff._id}</td>
                        <td>{Staff.firstName}</td>
                        <td>{Staff.lastName}</td>
                        <td>{Staff.age}</td>
                        <td>{Staff.gender}</td>
                        <td>{Staff.role}</td>
                        <td className="relative text-center">
                        <button
                            className="text-xl font-bold"
                            onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(
                                openMenu === Staff._id ? null : Staff._id
                            );
                            }}
                        >
                            ⋯
                        </button>

                        {openMenu === Staff._id && (
                            <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-2 z-50">
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/center/profile/${Staff._id}/EditStaff`);
                                }}
                            >
                                Edit Staff
                            </button>

                            <button
                            className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStaff(Staff);
                                setShowRemoveModal(true);
                                setOpenMenu(null);
                            }}
                            >
                            Remove Staff
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
                    setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                    )
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
          
            {showRemoveModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-[#F4EAF5] rounded-3xl p-8 w-96 shadow-xl">
                
                <h2 className="text-2xl font-semibold mb-3 text-center">
                    Remove Staff
                </h2>

                <p className="text-center text-gray-700 mb-8">
                    Are you sure you want to remove
                    <br />
                    <span className="font-semibold">
                    {selectedStaff?.firstName} {selectedStaff?.lastName}
                    </span>
                    ?
                </p>

                <div className="flex justify-center gap-4">
                    <button
                    onClick={() => setShowRemoveModal(false)}
                    className="px-6 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100"
                    >
                    Cancel
                    </button>

                    <button
                    onClick={() => {
                        setShowRemoveModal(false);

                        // TODO: Backend remove function here

                        console.log(
                        "Removed:",
                        selectedStaff?._id
                        );
                    }}
                    className="px-6 py-2 rounded-xl bg-[#DFA5C9] text-white hover:bg-[#d48cb8]"
                    >
                    Remove
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

export default Staff;