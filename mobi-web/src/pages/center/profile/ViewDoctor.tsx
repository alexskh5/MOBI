import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";


interface DoctorData {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  specialty: string;
}

const Doctor = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const doctorsPerPage = 10;

  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);

  const [showSortMenu, setShowSortMenu] = useState(false);

//   const [sortOption, setSortOption] = useState("default");    UNCOMMENT RANI NYA DELETE NING IYA UBOS NA LINE NIGV BACKEND NA KAY ERROR MAN RN
  const [, setSortOption] = useState("default"); 

    // placeholder rani ni pero matic na count ang list puhon
    useEffect(() => {
    const fetchDoctors = async () => {
        try {
        const data: DoctorData[] = [
            {
            _id: "1",
            firstName: "Andres Lou",
            lastName: "Mulach",
            age: 28,
            gender: "Male",
            specialty: "Psychiatrist",
            },
            {
            _id: "2",
            firstName: "Maria",
            lastName: "Santos",
            age: 35,
            gender: "Female",
            specialty: "Occupational Therapist",
            },
            {
            _id: "3",
            firstName: "John",
            lastName: "Reyes",
            age: 40,
            gender: "Male",
            specialty: "Speech Therapist",
            },
            {
            _id: "4",
            firstName: "Sophia",
            lastName: "Garcia",
            age: 32,
            gender: "Female",
            specialty: "Behavioral Therapist",
            },
        ];

        setDoctors(data);
        setLoading(false);
        } catch (error) {
        console.error("Error fetching doctors:", error);
        setLoading(false);
        }
    };

    fetchDoctors();
    }, []);

    const totalPages = Math.ceil(
    doctors.length / doctorsPerPage
    );

    const startIndex =
    (currentPage - 1) * doctorsPerPage;

    const currentDoctors = doctors.slice(
    startIndex,
    startIndex + doctorsPerPage
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
                    Doctor{" "}
                    <span className="bg-white px-2 rounded-full text-md">
                    {doctors.length}
                    </span>
                </h1>
                </div>

                {/* insert search logic latur */}
                <div className="flex items-center bg-[#f3e9f4] px-5 py-3 rounded-xl shadow-sm w-120">
                <Search
                    size={20}
                    className="mr-3 text-gray-500"
                />

                <input
                    type="text"
                    placeholder="Search"
                    className="bg-transparent outline-none w-full text-lg"
                />
                </div>

            </div>

            <div className="border-b border-black mb-6"></div>
            
          {/* HEADER ACTIONS */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-medium">Click Doctor to view profile</p>

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
                        setSortOption("specialty-asc");
                        setShowSortMenu(false);

                        // TODO: Backend sort specialty A-Z
                    }}
                    >
                    Specialty A-Z
                    </button>

                    <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                        setSortOption("specialty-desc");
                        setShowSortMenu(false);

                        // TODO: Backend sort specialty Z-A
                    }}
                    >
                    Specialty Z-A
                    </button>
                    </div>
                )}
                </div>

                <button
                onClick={() => navigate("/center/profile/AddDoctor")}
                className="bg-white px-8 py-2 rounded-xl shadow"
                >
                + Add Doctor
                </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {/* TABLE */}
            <div className="bg-[#E4C9E5] rounded-xl p-6 border border-[#DFA5C9] shadow-md flex-1">
            {loading ? (
                <p>Loading Doctors...</p>
            ) : (
                <table className="w-full table-fixed text-md">
                <thead>
                    <tr className="text-left border-b border-[#DFA5C9] [&>th]:pb-4">
                    <th className="w-40">ID</th>
                    <th>FIRST NAME</th>
                    <th>LAST NAME</th>
                    <th className="w-32">AGE</th>
                    <th className="w-40">GENDER</th>
                    <th className="w-70">SPECIALTY</th>
                    <th className="w-12"></th>
                    </tr>
                </thead>

                <tbody>
                    {currentDoctors.map((Doctor) => (
                    <tr
                        key={Doctor._id}
                        className="border-b border-[#DFA5C9] hover:bg-[#EBCFE9] cursor-pointer [&>td]:py-2"
                        onClick={() =>
                        navigate(`/center/dashboard/${Doctor._id}`)
                        }
                    >
                        <td>{Doctor._id}</td>
                        <td>{Doctor.firstName}</td>
                        <td>{Doctor.lastName}</td>
                        <td>{Doctor.age}</td>
                        <td>{Doctor.gender}</td>
                        <td>{Doctor.specialty}</td>
                        <td className="relative text-center">
                        <button
                            className="text-xl font-bold"
                            onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(
                                openMenu === Doctor._id ? null : Doctor._id
                            );
                            }}
                        >
                            ⋯
                        </button>

                        {openMenu === Doctor._id && (
                        <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg py-2 z-50">
                            <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/center/profile/doctors/${Doctor._id}/EditDoctor`);
                            }}
                            >
                            Edit Doctor
                            </button>

                            <button
                            className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDoctor(Doctor);
                                setShowRemoveModal(true);
                                setOpenMenu(null);
                            }}
                            >
                            Remove Doctor
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
                    Remove Doctor
                </h2>

                <p className="text-center text-gray-700 mb-8">
                    Are you sure you want to remove
                    <br />
                    <span className="font-semibold">
                    {selectedDoctor?.firstName} {selectedDoctor?.lastName}
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
                        selectedDoctor?._id
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

export default Doctor;