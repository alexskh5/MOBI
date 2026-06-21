import { Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CenterLayout from "../../../layouts/CenterLayout";
import centerLogo from "../../../assets/centerLogo.png";
import coverPhoto from "../../../assets/coverPhoto.png";

const CenterProfile = () => {
    const navigate = useNavigate();

    const [editingCenterName, setEditingCenterName] = useState(false);
    const [centerName, setCenterName] = useState("ABLED MINDS THERAPY CENTER");

    const [editingAddress, setEditingAddress] = useState(false);
    const [address, setAddress] = useState("Tintay Talamban, Cebu City, 6000");

    const [editingPhone, setEditingPhone] = useState(false);
    const [phone, setPhone] = useState("09158872911");

    const [editingEmail, setEditingEmail] = useState(false);
    const [email, setEmail] = useState("abledminds@gmail.com");

    const [editingPassword, setEditingPassword] = useState(false);
    const [password, setPassword] = useState("password123");

    const [editingAbout, setEditingAbout] = useState(false);
    const [about, setAbout] = useState(
    "Therapists from Abled Minds supported the development of the MOBI App by helping validate its features and providing professional guidance to ensure it is effective for therapy and learning environments.");


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

            <img
                src={coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover opacity-25"
            />

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
                    <img
                    src={centerLogo}
                    alt="Center Logo"
                    className="w-full h-full object-cover"
                    />
                </div>

                <button className="absolute bottom-3 right-3 hover:text-gray-600">
                    <Pencil size={16} />
                </button>
                </div>

                {/* CENTER INFO */}
                <div className="pt-4 flex-1 min-w-0">

                    <div className="flex items-center w-xl">
                    {editingCenterName ? (
                        <input
                        type="text"
                        value={centerName}
                        onChange={(e) => setCenterName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            setEditingCenterName(false);
                            }
                        }}
                        autoFocus
                        className="flex-1 text-3xl font-bold bg-transparent border-b outline-none"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold">
                        {centerName}
                        </h1>
                    )}

                    {!editingCenterName && (
                        <button
                        onClick={() => setEditingCenterName(true)}
                        className="ml-4"
                        >
                        <Pencil size={18} />
                        </button>
                    )}
                    </div>

                    <div className="flex items-center mt-1 w-xl">
                    {editingAddress ? (
                        <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            setEditingAddress(false);
                            }
                        }}
                        autoFocus
                        className="flex-1 text-xl bg-transparent border-b outline-none"
                        />
                    ) : (
                        <p className="text-xl">
                        {address}
                        </p>
                    )}

                    {!editingAddress && (
                        <button
                        onClick={() => setEditingAddress(true)}
                        className="ml-3 hover:text-gray-600"
                        >
                        <Pencil size={16} />
                        </button>
                    )}
                    </div>

                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-6 mt-6">

                <button
                onClick={() => navigate("/center/profile/doctors")}
                className="bg-[#E0A9D4] px-6 py-2 rounded-xl shadow hover:bg-[#d899cb] transition duration-200"
                >
                View Doctor List
                </button>

                <button
                onClick={() => navigate("/center/profile/staff")}
                className="bg-[#E0A9D4] px-6 py-2 rounded-xl shadow hover:bg-[#d899cb] transition duration-200"
                >
                View Staff List
                </button>

              </div>

            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-2 gap-12 mt-10">

              {/* LEFT */}
              <div className="space-y-8">

                <div>
                  <label className="block font-semibold mb-2">
                    Center phone number:
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
                    Center about:
                  </label>

                    <div className="bg-white rounded-xl shadow p-4 relative">

                    {editingAbout ? (
                        <textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            setEditingAbout(false);
                            }
                        }}
                        autoFocus
                        rows={4}
                        className="w-full h-24 resize-none bg-transparent outline-none"
                        />
                    ) : (
                        <p className="h-24">
                        {about}
                        </p>
                    )}

                    {!editingAbout && (
                        <button
                        onClick={() => setEditingAbout(true)}
                        className="absolute right-4 bottom-4 hover:text-gray-600"
                        >
                        <Pencil size={16} />
                        </button>
                    )}

                    </div>
                </div>

                <button className="bg-[#E0A9D4] px-8 py-2 rounded-xl shadow hover:bg-[#d899cb] transition duration-200">
                Subscription Plan
                </button>

              </div>

              {/* RIGHT */}
              <div className="space-y-8">

                <div>
                  <label className="block font-semibold mb-2">
                    Center mail:
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
                    Center password:
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

          </div>

        </div>
      )}
    </CenterLayout>
  );
};

export default CenterProfile;