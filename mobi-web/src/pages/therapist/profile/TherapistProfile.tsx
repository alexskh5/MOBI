import { Pencil } from "lucide-react";
import { useState } from "react";

import TherapistLayout from "../../../layouts/TherapistLayout";
import centerLogo from "../../../assets/centerLogo.png";
import coverPhoto from "../../../assets/coverPhoto.png";

const TherapistProfile = () => {
  const [editingName, setEditingName] = useState(false);
  const [therapistName, setTherapistName] = useState("ANNA REYES");

  const [editingRole, setEditingRole] = useState(false);
  const [role, setRole] = useState("Speech-Language Therapist");

  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState("09158872911");

  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState("anna.reyes@gmail.com");

  const [editingPassword, setEditingPassword] = useState(false);
  const [password, setPassword] = useState("password123");

  const [editingSpecialization, setEditingSpecialization] = useState(false);
  const [specialization, setSpecialization] = useState(
    "Speech training, early communication support, and social readiness activities for children with autism."
  );

  return (
    <TherapistLayout>
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
                {/* PROFILE PHOTO */}
                <div className="relative -mt-24">
                  <div className="w-48 h-48 bg-white rounded-2xl shadow border overflow-hidden">
                    <img
                      src={centerLogo}
                      alt="Therapist Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <button className="absolute bottom-3 right-3 hover:text-gray-600">
                    <Pencil size={16} />
                  </button>
                </div>

                {/* THERAPIST INFO */}
                <div className="pt-4 flex-1 min-w-0">
                  <div className="flex items-center w-xl">
                    {editingName ? (
                      <input
                        type="text"
                        value={therapistName}
                        onChange={(e) => setTherapistName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingName(false);
                          }
                        }}
                        autoFocus
                        className="flex-1 text-3xl font-bold bg-transparent border-b outline-none"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold">
                        {therapistName}
                      </h1>
                    )}

                    {!editingName && (
                      <button
                        onClick={() => setEditingName(true)}
                        className="ml-4"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center mt-1 w-xl">
                    {editingRole ? (
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingRole(false);
                          }
                        }}
                        autoFocus
                        className="flex-1 text-xl bg-transparent border-b outline-none"
                      />
                    ) : (
                      <p className="text-xl">{role}</p>
                    )}

                    {!editingRole && (
                      <button
                        onClick={() => setEditingRole(true)}
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
                    Specialization:
                  </label>

                  <div className="bg-white rounded-xl shadow p-4 relative">
                    {editingSpecialization ? (
                      <textarea
                        value={specialization}
                        onChange={(e) =>
                          setSpecialization(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            setEditingSpecialization(false);
                          }
                        }}
                        autoFocus
                        rows={3}
                        className="w-full h-20 resize-none bg-transparent outline-none"
                      />
                    ) : (
                      <p className="h-20">{specialization}</p>
                    )}

                    {!editingSpecialization && (
                      <button
                        onClick={() => setEditingSpecialization(true)}
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
          </div>
        </div>
      )}
    </TherapistLayout>
  );
};

export default TherapistProfile;