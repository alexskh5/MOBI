import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CenterLayout from "../../../layouts/CenterLayout";
import { createTherapist } from "../../../services/therapist/therapistApi";

function getApiErrorMessage(error: unknown) {
    const possibleError = error as {
        response?: {
            data?: {
                message?: string;
                error?: string;
            };
        };
        message?: string;
    };

    return (
        possibleError?.response?.data?.error ||
        possibleError?.response?.data?.message ||
        possibleError?.message ||
        "Unable to add staff. Please try again."
    );
}

const AddStaff = () => {
    const navigate = useNavigate();

    const [editingStaffName, setEditingStaffName] = useState(false);
    const [staffName, setStaffName] = useState("");

    const [editingSpecialty, setEditingSpecialty] = useState(false);
    const [specialty, setSpecialty] = useState("");

    const [editingPhone, setEditingPhone] = useState(false);
    const [phone, setPhone] = useState("");

    const [editingEmail, setEditingEmail] = useState(false);
    const [email, setEmail] = useState("");

    const [editingBio, setEditingBio] = useState(false);
    const [bio, setBio] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const displayName = useMemo(
        () => staffName.trim() || "Firstname Lastname",
        [staffName]
    );

    const displaySpecialty = useMemo(
        () => specialty.trim() || "Specialty",
        [specialty]
    );

    const handleAddStaff = async () => {
        if (isSaving) {
            return;
        }

        setFormError("");

        const normalizedName = staffName.trim();
        const nameParts = normalizedName
            .split(/\s+/)
            .filter(Boolean);

        if (nameParts.length < 2) {
            setFormError(
                "Please enter at least the therapist's first name and last name."
            );
            return;
        }

        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setFormError("Email address is required.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            setFormError("Please enter a valid email address.");
            return;
        }

        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];

        const middleName =
            nameParts.length > 2
                ? nameParts.slice(1, -1).join(" ")
                : null;

        try {
            setIsSaving(true);

            await createTherapist({
                firstName,
                middleName,
                lastName,
                email: normalizedEmail,
                specialization: specialty.trim() || null,
                phoneNumber: phone.trim() || null,
                bio: bio.trim() || null,
            });

            window.alert("Staff therapist added successfully.");

            navigate("/center/profile/staff");
        } catch (error) {
            console.error("Add therapist error:", error);
            setFormError(getApiErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CenterLayout>
            {(sidebarOpen, setSidebarOpen) => (
                <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] inter overflow-hidden">
                    {/* COVER PHOTO */}
                    <div className="relative h-72 w-full">
                        {!sidebarOpen && (
                            <button
                                type="button"
                                className="absolute top-8 left-8 text-3xl z-50 mt-2"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Open sidebar"
                            >
                                ☰
                            </button>
                        )}

                        <div className="w-full h-full bg-white/20" />

                        <button
                            type="button"
                            className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                            aria-label="Edit cover photo"
                        >
                            <Pencil size={18} />
                        </button>
                    </div>

                    {/* PROFILE SECTION */}
                    <div className="px-14 pb-6">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-6 flex-1">
                                {/* PROFILE */}
                                <div className="relative -mt-24">
                                    <div className="w-48 h-48 bg-white rounded-2xl shadow border overflow-hidden">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-8xl text-[#D9B8D9]">
                                                👤
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="absolute bottom-3 right-3 hover:text-gray-600"
                                        aria-label="Edit profile photo"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </div>

                                {/* STAFF INFO */}
                                <div className="pt-4 flex-1 min-w-0">
                                    <div className="flex items-center w-xl">
                                        {editingStaffName ? (
                                            <input
                                                type="text"
                                                value={staffName}
                                                onChange={(event) =>
                                                    setStaffName(
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key ===
                                                        "Enter"
                                                    ) {
                                                        setEditingStaffName(
                                                            false
                                                        );
                                                    }
                                                }}
                                                placeholder="Firstname Middlename Lastname"
                                                autoFocus
                                                className="flex-1 text-3xl font-bold bg-transparent border-b outline-none"
                                            />
                                        ) : (
                                            <h1 className="text-3xl font-bold">
                                                {displayName}
                                            </h1>
                                        )}

                                        {!editingStaffName && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingStaffName(true)
                                                }
                                                className="ml-4"
                                                aria-label="Edit staff name"
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
                                                onChange={(event) =>
                                                    setSpecialty(
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key ===
                                                        "Enter"
                                                    ) {
                                                        setEditingSpecialty(
                                                            false
                                                        );
                                                    }
                                                }}
                                                placeholder="Speech-Language Pathologist"
                                                autoFocus
                                                className="flex-1 text-xl bg-transparent border-b outline-none"
                                            />
                                        ) : (
                                            <p className="text-xl">
                                                {displaySpecialty}
                                            </p>
                                        )}

                                        {!editingSpecialty && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingSpecialty(true)
                                                }
                                                className="ml-3 hover:text-gray-600"
                                                aria-label="Edit specialization"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ERROR */}
                        {formError && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {formError}
                            </div>
                        )}

                        {/* DETAILS */}
                        <div className="grid grid-cols-1 gap-8 mt-10 lg:grid-cols-2 lg:gap-12">
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
                                                onChange={(event) =>
                                                    setPhone(
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key ===
                                                        "Enter"
                                                    ) {
                                                        setEditingPhone(
                                                            false
                                                        );
                                                    }
                                                }}
                                                placeholder="09XXXXXXXXX"
                                                autoFocus
                                                className="flex-1 bg-transparent outline-none"
                                            />
                                        ) : (
                                            <span
                                                className={
                                                    phone.trim()
                                                        ? ""
                                                        : "text-gray-400"
                                                }
                                            >
                                                {phone.trim() ||
                                                    "Add phone number"}
                                            </span>
                                        )}

                                        {!editingPhone && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingPhone(true)
                                                }
                                                className="hover:text-gray-600"
                                                aria-label="Edit phone number"
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
                                                onChange={(event) =>
                                                    setBio(
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key ===
                                                            "Enter" &&
                                                        !event.shiftKey
                                                    ) {
                                                        event.preventDefault();
                                                        setEditingBio(false);
                                                    }
                                                }}
                                                placeholder="Add therapist bio..."
                                                autoFocus
                                                rows={4}
                                                className="w-full h-24 resize-none bg-transparent outline-none"
                                            />
                                        ) : (
                                            <p
                                                className={`h-24 ${
                                                    bio.trim()
                                                        ? ""
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {bio.trim() ||
                                                    "Add therapist bio"}
                                            </p>
                                        )}

                                        {!editingBio && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingBio(true)
                                                }
                                                className="absolute right-4 bottom-4 hover:text-gray-600"
                                                aria-label="Edit bio"
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
                                        Email:{" "}
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <div className="bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center">
                                        {editingEmail ? (
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(event) =>
                                                    setEmail(
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key ===
                                                        "Enter"
                                                    ) {
                                                        setEditingEmail(
                                                            false
                                                        );
                                                    }
                                                }}
                                                placeholder="therapist@email.com"
                                                autoFocus
                                                className="flex-1 bg-transparent outline-none"
                                            />
                                        ) : (
                                            <span
                                                className={
                                                    email.trim()
                                                        ? ""
                                                        : "text-gray-400"
                                                }
                                            >
                                                {email.trim() ||
                                                    "Add email address"}
                                            </span>
                                        )}

                                        {!editingEmail && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingEmail(true)
                                                }
                                                className="hover:text-gray-600"
                                                aria-label="Edit email"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2">
                                        Account access:
                                    </label>

                                    <div className="bg-white rounded-xl shadow px-4 py-3">
                                        <p className="font-medium text-gray-700">
                                            No password is created by the
                                            Center.
                                        </p>

                                        <p className="mt-1 text-sm leading-5 text-gray-500">
                                            The therapist account will be
                                            created as not invited. MOBI staff
                                            access can be connected to the
                                            access-code login flow afterward.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex justify-end gap-6 mt-10">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/center/profile/staff")
                                }
                                disabled={isSaving}
                                className="bg-white px-12 py-3 rounded-xl shadow hover:bg-[#e8e8e8] transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleAddStaff}
                                disabled={isSaving}
                                className="bg-[#cb9fc1] px-12 py-3 rounded-xl shadow hover:bg-[#ac81a2] transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? "Adding..." : "Add Staff"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CenterLayout>
    );
};

export default AddStaff;
