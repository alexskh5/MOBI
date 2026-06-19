import { Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CenterLayout from "../../../layouts/CenterLayout";

const AddStaff = () => {
    const navigate = useNavigate();

    const [editingStaffName, setEditingStaffName] = useState(false);
    const [staffName, setStaffName] = useState("Firstname Lastname");

    const [editingSpecialty, setEditingSpecialty] = useState(false);
    const [specialty, setSpecialty] = useState("Specialty");

    const [editingPhone, setEditingPhone] = useState(false);
    const [phone, setPhone] = useState(" ");

    const [editingEmail, setEditingEmail] = useState(false);
    const [email, setEmail] = useState(" ");

    const [editingPassword, setEditingPassword] = useState(false);
    const [password, setPassword] = useState(" ");

    const [editingBio, setEditingBio] = useState(false);
    const [bio, setBio] = useState(" ");

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] inter overflow-hidden">

            {/* COVER PHOTO */}
            <div className="relative h-72 w-full">

            {!sidebarOpen && (
                <button
                className="absolute top-8 left-8 text-3xl z-50 mt-2"
                onClick={() => setSidebarOpen(true)}
                >
                ☰
                </button>
            )}

            <div className="w-full h-full bg-white/20" />

            <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100">
                <Pencil size={18} />
            </button>

            </div>

          {/* PROFILE SECTION */}
          <div className="px-14 pb-6">

            <div className="flex justify-between items-start">

              <div className="flex gap-6 flex-1">

                {/* LOGO */}
                <div className="relative -mt-24">
                <div className="w-48 h-48 bg-white rounded-2xl shadow border overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl text-[#D9B8D9]">👤</span>
                    </div>
                </div>

                <button className="absolute bottom-3 right-3 hover:text-gray-600">
                    <Pencil size={16} />
                </button>
                </div>

                {/* CENTER INFO */}
                <div className="pt-4 flex-1 min-w-0">

                    <div className="flex items-center w-xl">
                    {editingStaffName ? (
                        <input
                        type="text"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            setEditingStaffName(false);
                            }
                        }}
                        autoFocus
                        className="flex-1 text-3xl font-bold bg-transparent border-b outline-none"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold">
                        {staffName}
                        </h1>
                    )}

                    {!editingStaffName && (
                        <button
                        onClick={() => setEditingStaffName(true)}
                        className="ml-4"
                        >
                        <Pencil size={18} />
                        </button>
                    )}
                    </div>

                    <div className="flex items-center mt-1 w-xl">
                    {editingSpecialty ? (
                        <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            setEditingSpecialty(false);
                            }
                        }}
                        autoFocus
                        className="flex-1 text-xl bg-transparent border-b outline-none"
                        />
                    ) : (
                        <p className="text-xl">
                        {specialty}
                        </p>
                    )}

                    {!editingSpecialty && (
                        <button
                        onClick={() => setEditingSpecialty(true)}
                        className="ml-3 hover:text-gray-600"
                        >
                        <Pencil size={16} />
                        </button>
                    )}
                    </div>

                </div>

              </div>

            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-2 gap-12 mt-10">

              {/* LEFT */}
              <div className="space-y-8">

                <div>
                  <label className="block font-semibold mb-2">
                    Phone number:
                  </label>

                <div className="bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center">

                {editingPhone ? (
                    <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        setEditingPhone(false);
                        }
                    }}
                    autoFocus
                    className="flex-1 bg-transparent outline-none"
                    />
                ) : (
                    <span>{phone}</span>
                )}

                {!editingPhone && (
                    <button
                    onClick={() => setEditingPhone(true)}
                    className="hover:text-gray-600"
                    >
                    <Pencil size={16} />
                    </button>
                )}

                </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Bio:
                  </label>

                    <div className="bg-white rounded-xl shadow p-4 relative">

                    {editingBio ? (
                        <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            setEditingBio(false);
                            }
                        }}
                        autoFocus
                        rows={4}
                        className="w-full h-24 resize-none bg-transparent outline-none"
                        />
                    ) : (
                        <p className="h-24">
                        {bio}
                        </p>
                    )}

                    {!editingBio && (
                        <button
                        onClick={() => setEditingBio(true)}
                        className="absolute right-4 bottom-4 hover:text-gray-600"
                        >
                        <Pencil size={16} />
                        </button>
                    )}

                    </div>
                </div>

              </div>

              {/* RIGHT */}
              <div className="space-y-8">

                <div>
                  <label className="block font-semibold mb-2">
                    Email:
                  </label>

                    <div className="bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center">

                    {editingEmail ? (
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            setEditingEmail(false);
                            }
                        }}
                        autoFocus
                        className="flex-1 bg-transparent outline-none"
                        />
                    ) : (
                        <span>{email}</span>
                    )}

                    {!editingEmail && (
                        <button
                        onClick={() => setEditingEmail(true)}
                        className="hover:text-gray-600"
                        >
                        <Pencil size={16} />
                        </button>
                    )}

                    </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Password:
                  </label>

                    <div className="bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center">

                    {editingPassword ? (
                        <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            setEditingPassword(false);
                            }
                        }}
                        autoFocus
                        className="flex-1 bg-transparent outline-none"
                        />
                    ) : (
                        <span>{password}</span>
                    )}

                    {!editingPassword && (
                        <button
                        onClick={() => setEditingPassword(true)}
                        className="hover:text-gray-600"
                        >
                        <Pencil size={16} />
                        </button>
                    )}

                    </div>
                </div>

              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-6 mt-10">

                <button
                onClick={() => navigate("/center/profile/doctors")}
                className="bg-white px-12 py-3 rounded-xl shadow hover:bg-[#e8e8e8] transition"
                >
                Cancel
                </button>

                <button
                    className="bg-[#cb9fc1] px-12 py-3 rounded-xl shadow hover:bg-[#ac81a2] transition"
                >
                    Add Staff
                </button>

            </div>

          </div>

        </div>
      )}
    </CenterLayout>
  );
};

export default AddStaff;