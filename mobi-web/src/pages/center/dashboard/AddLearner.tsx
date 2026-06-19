import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useState } from "react";
import CenterLayout from "../../../layouts/CenterLayout";

const AddLearner = () => {
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("Firstname Lastname");
  const [editingAge, setEditingAge] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [age, setAge] = useState("Age");
  const [doctor, setDoctor] = useState("Doctor");

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col">

          {/* HEADER */}
          <div className="flex items-center mt-2 mb-6">
            {!sidebarOpen && (
              <button
                className="text-3xl mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
            )}

            <h1 className="text-xl font-medium">
              Please enter learners' information
            </h1>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white/30 border border-[#DFA5C9] rounded-[30px] p-10 shadow-md max-w-5xl mx-auto w-full">

            {/* PROFILE SECTION */}
            <div className="flex gap-8 mb-10">

              {/* PHOTO */}
                <div className="relative w-48 h-48">
                <div className="w-full h-full bg-white rounded-2xl shadow flex items-center justify-center">
                    <span className="text-8xl text-[#D9B8D9]">👤</span>
                </div>

                <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-100">
                    <Pencil size={16} />
                </button>
                <input type="file" hidden />
                </div>

              {/* BASIC INFO */}
              <div className="flex flex-col justify-center flex-1">

                <div className="flex items-center gap-2 mb-3">
                {editingName ? (
                    <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        setEditingName(false);
                        }
                    }}
                    autoFocus
                    className="text-4xl font-bold bg-transparent border-b outline-none"
                    />
                ) : (
                    <h2 className="text-4xl font-bold">
                    {name}
                    </h2>
                )}
                {!editingName && (
                <button
                    onClick={() => setEditingName(true)}
                    className="ml-4 hover:text-gray-600"
                >
                    <Pencil size={18} />
                </button>
                )}
                </div>

                <div className="flex items-center mb-4">
                {editingAge ? (
                    <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        setEditingAge(false);
                        }
                    }}
                    autoFocus
                    className="text-2xl bg-transparent border-b outline-none"
                    />
                ) : (
                    <p className="text-2xl">
                    {age}
                    </p>
                )}

                {!editingAge && (
                    <button
                    onClick={() => setEditingAge(true)}
                    className="ml-4 hover:text-gray-600"
                    >
                    <Pencil size={16} />
                    </button>
                )}
                </div>

                <div className="flex items-center">
                {editingDoctor ? (
                    <input
                    type="text"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        setEditingDoctor(false);
                        }
                    }}
                    autoFocus
                    className="font-semibold text-lg bg-transparent border-b outline-none"
                    />
                ) : (
                    <p className="font-semibold text-lg">
                    {doctor}
                    </p>
                )}

                {!editingDoctor && (
                    <button
                    onClick={() => setEditingDoctor(true)}
                    className="ml-4 hover:text-gray-600"
                    >
                    <Pencil size={16} />
                    </button>
                )}
                </div>
              </div>
            </div>

            {/* FORM GRID */}
            <div className="grid grid-cols-2 gap-8">

              {/* LEFT SIDE */}
              <div className="space-y-6">

                <div>
                  <label className="block font-semibold mb-2">
                    Learner Birthday:
                  </label>

                <input
                type="date"
                className="w-full bg-white rounded-xl shadow px-4 py-3 outline-none"
                />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Learner's Bio:
                  </label>

                  <textarea
                    rows={6}
                    placeholder="Enter learner bio..."
                    className="w-full bg-white rounded-xl shadow px-4 py-3 outline-none resize-none"
                  />
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-6">

                <div>
                  <label className="block font-semibold mb-2">
                    Guardian Full Name:
                  </label>

                  <input
                    type="text"
                    className="w-full bg-white rounded-xl shadow px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Guardian Phone Number:
                  </label>

                  <input
                    type="text"
                    className="w-full bg-white rounded-xl shadow px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Guardian Email:
                  </label>

                  <input
                    type="email"
                    className="w-full bg-white rounded-xl shadow px-4 py-3 outline-none"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-center gap-6 mt-8">

            <button
            onClick={() => navigate("/center/dashboard")}
            className="bg-white px-12 py-3 rounded-xl shadow hover:bg-gray-100 transition"
            >
            Cancel
            </button>

            <button
            onClick={() => console.log("Add Learner")} 
            className="bg-white px-12 py-3 rounded-xl shadow text-red-500 hover:bg-gray-100 transition"
            >
            Add Learner
            </button>

          </div>

        </div>
      )}
    </CenterLayout>
  );
};

export default AddLearner;