import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Search,
  X,
} from "lucide-react";
import {
  useNavigate,
} from "react-router-dom";

import CenterLayout from "../../../layouts/CenterLayout";
import {
  createCenterStaff,
  deactivateCenterStaff,
  getCenterStaff,
  getDoctorLearners,
  getTherapistLearnerAssignments,
  saveTherapistLearnerAssignments,
  updateCenterStaff,
  type CenterStaff,
  type CenterStaffRole,
  type DoctorLearner,
  type TherapistAssignableLearner,
} from "../../../services/centerStaffApi";

type StaffForm = {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  specialty: string;
  email: string;
  temporaryPassword: string;
  phoneNumber: string;
  bio: string;
};

const emptyForm: StaffForm = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "",
  specialty: "",
  email: "",
  temporaryPassword: "MobiTemp123!",
  phoneNumber: "",
  bio: "",
};

function calculateAge(birthDate: string | null) {
  if (!birthDate) {
    return "-";
  }

  const birthday = new Date(birthDate);

  if (Number.isNaN(birthday.getTime())) {
    return "-";
  }

  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const birthdayThisYear = new Date(
    today.getFullYear(),
    birthday.getMonth(),
    birthday.getDate(),
  );

  if (today < birthdayThisYear) {
    age -= 1;
  }

  return String(age);
}

function staffToForm(staff: CenterStaff): StaffForm {
  return {
    firstName: staff.firstName,
    lastName: staff.lastName,
    birthDate: staff.birthDate ?? "",
    gender: staff.gender,
    specialty: staff.specialty,
    email: staff.email,
    temporaryPassword: "",
    phoneNumber: staff.phoneNumber,
    bio: staff.bio,
  };
}

export default function CenterStaffDirectory({
  role,
}: {
  role: CenterStaffRole;
}) {
  const navigate = useNavigate();
  const isDoctor = role === "doctor";
  const title = isDoctor ? "Doctors" : "Staff";
  const singular = isDoctor ? "Doctor" : "Therapist";

  const [staff, setStaff] = useState<CenterStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] =
    useState<CenterStaff | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [removingStaff, setRemovingStaff] =
    useState<CenterStaff | null>(null);
  const [
    assigningTherapist,
    setAssigningTherapist,
  ] = useState<CenterStaff | null>(null);
  const [
    assignableLearners,
    setAssignableLearners,
  ] = useState<TherapistAssignableLearner[]>([]);
  const [
    selectedLearnerIds,
    setSelectedLearnerIds,
  ] = useState<string[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [viewingDoctor, setViewingDoctor] =
    useState<CenterStaff | null>(null);
  const [doctorLearners, setDoctorLearners] = useState<
    DoctorLearner[]
  >([]);
  const [doctorLearnersLoading, setDoctorLearnersLoading] =
    useState(false);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");
      setStaff(await getCenterStaff(role));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load staff.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStaff();
  }, [role]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return staff;
    }

    return staff.filter((member) =>
      [
        member.firstName,
        member.lastName,
        member.email,
        member.specialty,
        member.gender,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, staff]);

  const assignmentGroups = useMemo(() => {
    const selectedSet = new Set(selectedLearnerIds);
    const query = assignmentSearch.trim().toLowerCase();
    const learnerMatches = (learner: TherapistAssignableLearner) =>
      [
        learner.firstName,
        learner.lastName,
        learner.learnerCode,
        learner.level ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const assigned = assignableLearners
      .filter((learner) => selectedSet.has(learner.id))
      .sort((first, second) =>
        `${first.lastName} ${first.firstName}`.localeCompare(
          `${second.lastName} ${second.firstName}`,
        ),
      );
    const available = assignableLearners
      .filter((learner) => !selectedSet.has(learner.id))
      .filter((learner) => !query || learnerMatches(learner))
      .sort((first, second) =>
        `${first.lastName} ${first.firstName}`.localeCompare(
          `${second.lastName} ${second.firstName}`,
        ),
      );

    return {
      assigned,
      available,
    };
  }, [
    assignableLearners,
    assignmentSearch,
    selectedLearnerIds,
  ]);

  const openCreateForm = () => {
    setEditingStaff(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (member: CenterStaff) => {
    setEditingStaff(member);
    setForm(staffToForm(member));
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStaff(null);
    setForm(emptyForm);
  };

  const saveStaff = async () => {
    try {
      setSaving(true);
      setError("");

      if (editingStaff) {
        const updated = await updateCenterStaff(
          role,
          editingStaff.id,
          {
            firstName: form.firstName,
            lastName: form.lastName,
            birthDate: form.birthDate,
            gender: form.gender,
            specialty: form.specialty,
            email: form.email,
            phoneNumber: form.phoneNumber,
            bio: form.bio,
          },
        );

        setStaff((current) =>
          current.map((member) =>
            member.id === updated.id ? updated : member,
          ),
        );
      } else {
        const created = await createCenterStaff(role, form);
        setStaff((current) => [created, ...current]);
      }

      closeForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save staff account.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!removingStaff) {
      return;
    }

    try {
      setError("");
      const updated = await deactivateCenterStaff(
        role,
        removingStaff.id,
      );

      setStaff((current) =>
        current.map((member) =>
          member.id === updated.id ? updated : member,
        ),
      );
      setRemovingStaff(null);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to deactivate staff account.",
      );
    }
  };

  const openAssignmentModal = async (member: CenterStaff) => {
    setAssigningTherapist(member);
    setAssignmentSearch("");
    setAssignmentLoading(true);
    setError("");

    try {
      const result = await getTherapistLearnerAssignments(
        member.id,
      );
      setAssignableLearners(result.learners);
      setSelectedLearnerIds(result.assignedLearnerIds);
    } catch (assignmentError) {
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Unable to load therapist assignments.",
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  const toggleLearner = (learnerId: string) => {
    setSelectedLearnerIds((current) =>
      current.includes(learnerId)
        ? current.filter((id) => id !== learnerId)
        : [...current, learnerId],
    );
  };

  const saveAssignments = async () => {
    if (!assigningTherapist) {
      return;
    }

    try {
      setAssignmentSaving(true);
      setError("");
      const result = await saveTherapistLearnerAssignments(
        assigningTherapist.id,
        selectedLearnerIds,
      );
      setAssignableLearners(result.learners);
      setSelectedLearnerIds(result.assignedLearnerIds);
      setAssigningTherapist(null);
    } catch (assignmentError) {
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Unable to save therapist assignments.",
      );
    } finally {
      setAssignmentSaving(false);
    }
  };

  const openDoctorLearnersModal = async (member: CenterStaff) => {
    setViewingDoctor(member);
    setDoctorLearners([]);
    setDoctorLearnersLoading(true);
    setError("");

    try {
      setDoctorLearners(await getDoctorLearners(member.id));
    } catch (doctorLearnersError) {
      setError(
        doctorLearnersError instanceof Error
          ? doctorLearnersError.message
          : "Unable to load doctor learners.",
      );
    } finally {
      setDoctorLearnersLoading(false);
    }
  };

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  className="text-3xl mr-4"
                  onClick={() => setSidebarOpen(true)}
                  type="button"
                >
                  ☰
                </button>
              )}

              <h1 className="text-2xl font-medium">
                {title}{" "}
                <span className="bg-white px-2 rounded-full text-md">
                  {staff.length}
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96">
                <Search size={20} className="text-gray-500 mr-3" />
                <input
                  type="text"
                  placeholder={`Search ${title.toLowerCase()}`}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="bg-transparent outline-none w-full"
                />
              </div>

              <button
                type="button"
                onClick={() => navigate("/center/profile")}
                className="w-11 h-11 flex items-center justify-center bg-[#F5EEF6] rounded-xl shadow-md hover:bg-[#EBD7EC] transition"
              >
                <X size={20} className="text-[#7A5D7F]" />
              </button>
            </div>
          </div>

          <div className="border-b border-black mb-6" />

          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-medium">
              Manage invited {title.toLowerCase()} for this center.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="bg-white px-8 py-2 rounded-xl shadow"
            >
              + Add {singular}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="flex-1 flex flex-col">
            <div className="bg-[#E4C9E5] rounded-xl p-6 border border-[#DFA5C9] shadow-md flex-1">
              {loading ? (
                <p>Loading {title.toLowerCase()}...</p>
              ) : filteredStaff.length === 0 ? (
                <p>No {title.toLowerCase()} found.</p>
              ) : (
                <table className="w-full table-fixed text-md">
                  <thead>
                    <tr className="text-left border-b border-[#DFA5C9] [&>th]:pb-4">
                      <th>FIRST NAME</th>
                      <th>LAST NAME</th>
                      <th>AGE</th>
                      <th>GENDER</th>
                      <th>SPECIALTY</th>
                      <th>STATUS</th>
                      <th className="w-72" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-[#DFA5C9] hover:bg-[#EBCFE9] [&>td]:py-3"
                      >
                        <td>{member.firstName}</td>
                        <td>{member.lastName}</td>
                        <td>{calculateAge(member.birthDate)}</td>
                        <td>{member.gender || "-"}</td>
                        <td>{member.specialty || "-"}</td>
                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              member.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-right">
                          {isDoctor ? (
                            <button
                              type="button"
                              onClick={() =>
                                openDoctorLearnersModal(member)
                              }
                              className="px-3 py-1 bg-white rounded-lg mr-2"
                            >
                              View Learners
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openAssignmentModal(member)}
                              className="px-3 py-1 bg-white rounded-lg mr-2"
                            >
                              Assign Learners
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditForm(member)}
                            className="px-3 py-1 bg-white rounded-lg mr-2"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemovingStaff(member)}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-[#F8F2F8] rounded-3xl p-7 w-[760px] max-h-[88vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {editingStaff ? "Edit" : "Add"} {singular}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Temporary password is for testing only.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="h-9 w-9 rounded-full bg-white"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["firstName", "First name", "text"],
                    ["lastName", "Last name", "text"],
                    ["birthDate", "Birthday", "date"],
                    ["specialty", "Specialty", "text"],
                    ["email", "Active email", "email"],
                    ["phoneNumber", "Phone number optional", "text"],
                  ].map(([key, label, type]) => (
                    <label key={key} className="text-sm font-medium">
                      {label}
                      <input
                        type={type}
                        value={form[key as keyof StaffForm]}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                      />
                    </label>
                  ))}

                  <label className="text-sm font-medium">
                    Gender
                    <select
                      value={form.gender}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          gender: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 bg-white"
                    >
                      <option value="">Select gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </label>

                  {!editingStaff && (
                    <label className="text-sm font-medium">
                      Temporary password
                      <input
                        type="text"
                        value={form.temporaryPassword}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            temporaryPassword: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                      />
                    </label>
                  )}

                  <label className="col-span-2 text-sm font-medium">
                    Bio optional
                    <textarea
                      value={form.bio}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          bio: event.target.value,
                        }))
                      }
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 resize-none"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-5 py-2 rounded-xl bg-white border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveStaff}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#B48BC7] text-white disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {removingStaff && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-[#F4EAF5] rounded-3xl p-8 w-96 shadow-xl">
                <h2 className="text-2xl font-semibold mb-3 text-center">
                  Deactivate {singular}
                </h2>
                <p className="text-center text-gray-700 mb-8">
                  This will remove access for{" "}
                  <span className="font-semibold">
                    {removingStaff.firstName} {removingStaff.lastName}
                  </span>
                  .
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setRemovingStaff(null)}
                    className="px-6 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeactivate}
                    className="px-6 py-2 rounded-xl bg-[#DFA5C9] text-white hover:bg-[#d48cb8]"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          )}

          {assigningTherapist && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-[#F8F2F8] rounded-3xl p-7 w-[760px] max-h-[88vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      Assign Learners
                    </h2>
                    <p className="text-sm text-gray-600">
                      {assigningTherapist.firstName}{" "}
                      {assigningTherapist.lastName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssigningTherapist(null)}
                    className="h-9 w-9 rounded-full bg-white"
                  >
                    ×
                  </button>
                </div>

                {assignmentLoading ? (
                  <p>Loading learners...</p>
                ) : assignableLearners.length === 0 ? (
                  <p>No active learners available.</p>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center bg-white px-4 py-3 rounded-2xl border border-[#E6D6E8]">
                      <Search
                        size={18}
                        className="text-gray-500 mr-3"
                      />
                      <input
                        type="text"
                        value={assignmentSearch}
                        onChange={(event) =>
                          setAssignmentSearch(event.target.value)
                        }
                        placeholder="Search available learners by name, code, or level"
                        className="bg-transparent outline-none w-full"
                      />
                    </div>

                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          Assigned learners
                        </h3>
                        <span className="text-sm text-gray-600">
                          {assignmentGroups.assigned.length} selected
                        </span>
                      </div>

                      {assignmentGroups.assigned.length === 0 ? (
                        <div className="rounded-2xl bg-white/70 border border-dashed border-[#D9BFDE] px-4 py-4 text-sm text-gray-600">
                          No learners assigned yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {assignmentGroups.assigned.map((learner) => (
                            <div
                              key={learner.id}
                              className="rounded-2xl bg-white px-4 py-3 border border-[#D9BFDE]"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">
                                    {learner.firstName}{" "}
                                    {learner.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {learner.learnerCode} ·{" "}
                                    {calculateAge(
                                      learner.birthDate,
                                    )}{" "}
                                    years old ·{" "}
                                    {learner.level ?? "For review"}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleLearner(learner.id)
                                  }
                                  className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          Available learners
                        </h3>
                        <span className="text-sm text-gray-600">
                          {assignmentGroups.available.length} shown
                        </span>
                      </div>

                      {assignmentGroups.available.length === 0 ? (
                        <div className="rounded-2xl bg-white/70 border border-dashed border-[#D9BFDE] px-4 py-4 text-sm text-gray-600">
                          No available learners match this search.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {assignmentGroups.available.map((learner) => (
                            <div
                              key={learner.id}
                              className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3"
                            >
                              <div>
                                <p className="font-semibold">
                                  {learner.firstName}{" "}
                                  {learner.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {learner.learnerCode} ·{" "}
                                  {calculateAge(learner.birthDate)}{" "}
                                  years old ·{" "}
                                  {learner.level ?? "For review"}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleLearner(learner.id)
                                }
                                className="px-4 py-2 rounded-xl bg-[#B48BC7] text-white"
                              >
                                Assign
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setAssigningTherapist(null)}
                    className="px-5 py-2 rounded-xl bg-white border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveAssignments}
                    disabled={assignmentSaving}
                    className="px-5 py-2 rounded-xl bg-[#B48BC7] text-white disabled:opacity-60"
                  >
                    {assignmentSaving ? "Saving..." : "Save Assignments"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {viewingDoctor && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-[#F8F2F8] rounded-3xl p-7 w-[680px] max-h-[88vh] overflow-y-auto shadow-xl">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      Doctor Learners
                    </h2>
                    <p className="text-sm text-gray-600">
                      {viewingDoctor.firstName}{" "}
                      {viewingDoctor.lastName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingDoctor(null)}
                    className="h-9 w-9 rounded-full bg-white"
                  >
                    ×
                  </button>
                </div>

                {doctorLearnersLoading ? (
                  <p>Loading learners...</p>
                ) : doctorLearners.length === 0 ? (
                  <div className="rounded-2xl bg-white/80 border border-dashed border-[#D9BFDE] px-4 py-5 text-gray-700">
                    No learners are assigned to this doctor yet. Use
                    the learner profile doctor assignment once it is
                    connected.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {doctorLearners.map((learner) => (
                      <div
                        key={learner.id}
                        className="rounded-2xl bg-white px-4 py-3"
                      >
                        <p className="font-semibold">
                          {learner.firstName} {learner.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {learner.learnerCode} ·{" "}
                          {calculateAge(learner.birthDate)} years old ·{" "}
                          {learner.level ?? "For review"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setViewingDoctor(null)}
                    className="px-5 py-2 rounded-xl bg-white border border-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </CenterLayout>
  );
}
