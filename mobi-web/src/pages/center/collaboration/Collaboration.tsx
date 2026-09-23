import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    CalendarDays,
    Check,
    ChevronDown,
    MessageSquare,
    Pencil,
    Plus,
    Search,
    Stethoscope,
    Users,
    X,
} from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";
import {
    assignLearnerDoctor,
    assignLearnerTherapists,
    createLearnerCollaborationNote,
    getCollaborationDoctors,
    getCollaborationLearners,
    getCollaborationTherapists,
    getLearnerCollaborationNotes,
    getLearnerDoctor,
    getLearnerTherapists,
} from "../../../services/collaboration/collaborationApi";

type Learner = {
    id: string;
    name: string;
    age: number;
    assignedDoctorId?: string;
    assignedTherapistIds: string[];
};

type Doctor = {
    id: string;
    name: string;
    specialization: string;
};

type Therapist = {
    id: string;
    name: string;
    specialization: string;
};

type CollaborationRecord = {
    id: string;
    learnerId: string;
    doctorId?: string | null;
    therapistId?: string | null;
    category: string;
    title: string;
    createdAt: string;
    sender: string;
    senderRole: "Center" | "Doctor" | "Therapist";
    content: string;
};

type NoteFilter = "today" | "week" | "month";

const getInitials = (name: string) => {
    return name
        .replace(/[.,]/g, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
};

const formatRecordDate = (createdAt: string) => {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(createdAt));
};

const isWithinFilter = (
    createdAt: string,
    selectedFilter: NoteFilter
) => {
    const recordDate = new Date(createdAt);
    const now = new Date();
    const startDate = new Date(now);

    if (selectedFilter === "today") {
        startDate.setHours(0, 0, 0, 0);

        return recordDate >= startDate && recordDate <= now;
    }

    if (selectedFilter === "week") {
        const currentDay = now.getDay();
        const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

        startDate.setDate(now.getDate() - daysSinceMonday);
        startDate.setHours(0, 0, 0, 0);

        return recordDate >= startDate && recordDate <= now;
    }

    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return recordDate >= startDate && recordDate <= now;
};

const normalizeSenderRole = (
    role?: string | null
): CollaborationRecord["senderRole"] => {
    const normalizedRole =
        role?.trim().toLowerCase();

    if (normalizedRole === "doctor") {
        return "Doctor";
    }

    if (normalizedRole === "therapist") {
        return "Therapist";
    }

    return "Center";
};

const mapApiNoteToRecord = (
    note: any
): CollaborationRecord => ({
    id: String(note.id),
    learnerId: String(note.learnerId),
    doctorId: note.doctorId ?? null,
    therapistId: note.therapistId ?? null,
    category: note.category ?? "MOBI Session",
    title: note.title ?? "MOBI Session Note",
    createdAt: note.createdAt,
    sender: note.sender ?? "Center Admin",
    senderRole: normalizeSenderRole(
        note.senderRole
    ),
    content: note.content ?? "",
});

const calculateAge = (
    birthDate?: string | null
) => {
    if (!birthDate) {
        return 0;
    }

    const birth = new Date(birthDate);
    const today = new Date();

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
        age--;
    }

    return Math.max(age, 0);
};

const Collaboration = () => {
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const [learners, setLearners] =
        useState<Learner[]>([]);

    const [doctors, setDoctors] =
        useState<Doctor[]>([]);

    const [therapists, setTherapists] =
        useState<Therapist[]>([]);

    const [records, setRecords] =
        useState<CollaborationRecord[]>([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [selectedLearnerId, setSelectedLearnerId] =
        useState<string | null>(null);

    const [selectedFilter, setSelectedFilter] =
        useState<NoteFilter>("month");

    const [showDoctorModal, setShowDoctorModal] = useState(false);

    const [showTherapistModal, setShowTherapistModal] =
        useState(false);

    const [showNoteModal, setShowNoteModal] = useState(false);

    const [selectedDoctorId, setSelectedDoctorId] =
        useState<string>("");

    const [isSavingDoctor, setIsSavingDoctor] =
        useState(false);

    const [isSavingTherapists, setIsSavingTherapists] =
        useState(false);

    const [isSavingNote, setIsSavingNote] =
        useState(false);

    const [isLoadingNotes, setIsLoadingNotes] =
        useState(false);

    const [selectedTherapistIds, setSelectedTherapistIds] =
        useState<string[]>([]);

    const [noteTitle, setNoteTitle] =
        useState("MOBI Session Note");

    const [noteContent, setNoteContent] = useState("");


    useEffect(() => {
        let isMounted = true;

        async function loadCollaborationData() {
            try {
                const [
                    learnerResult,
                    doctorResult,
                    therapistResult,
                ] = await Promise.all([
                    getCollaborationLearners(),
                    getCollaborationDoctors(),
                    getCollaborationTherapists(),
                ]);

                if (!isMounted) {
                    return;
                }

                const mappedDoctors: Doctor[] =
                    (doctorResult.doctors ?? []).map(
                        (doctor: any) => ({
                            id: doctor.id,
                            name: [
                                doctor.first_name ?? doctor.firstName,
                                doctor.middle_name ?? doctor.middleName,
                                doctor.last_name ?? doctor.lastName,
                            ]
                                .filter(Boolean)
                                .join(" "),
                            specialization:
                                doctor.specialization ??
                                "No specialization",
                        })
                    );

                setDoctors(mappedDoctors);

                const mappedTherapists: Therapist[] =
                    (therapistResult.therapists ?? []).map(
                        (therapist: any) => ({
                            id: String(therapist.id),
                            name: [
                                therapist.first_name ?? therapist.firstName,
                                therapist.middle_name ?? therapist.middleName,
                                therapist.last_name ?? therapist.lastName,
                            ]
                                .filter(Boolean)
                                .join(" "),
                            specialization:
                                therapist.specialization ??
                                "No specialization",
                        })
                    );

                setTherapists(mappedTherapists);

                const mappedLearners: Learner[] =
                    await Promise.all(
                        (learnerResult.learners ?? []).map(
                            async (learner: any) => {
                                let assignedDoctorId:
                                    | string
                                    | undefined;

                                let assignedTherapistIds:
                                    string[] = [];

                                const [
                                    doctorAssignmentResult,
                                    therapistAssignmentResult,
                                ] = await Promise.allSettled([
                                    getLearnerDoctor(
                                        learner.id
                                    ),
                                    getLearnerTherapists(
                                        learner.id
                                    ),
                                ]);

                                if (
                                    doctorAssignmentResult.status ===
                                    "fulfilled"
                                ) {
                                    assignedDoctorId =
                                        doctorAssignmentResult.value
                                            .doctorAssignment
                                            ?.doctor
                                            ?.id;
                                } else {
                                    console.error(
                                        `Unable to load doctor for learner ${learner.id}:`,
                                        doctorAssignmentResult.reason
                                    );
                                }

                                if (
                                    therapistAssignmentResult.status ===
                                    "fulfilled"
                                ) {
                                    assignedTherapistIds =
                                        (
                                            therapistAssignmentResult
                                                .value
                                                .therapists ?? []
                                        ).map(
                                            (therapist: any) =>
                                                String(
                                                    therapist.id
                                                )
                                        );
                                } else {
                                    console.error(
                                        `Unable to load therapists for learner ${learner.id}:`,
                                        therapistAssignmentResult.reason
                                    );
                                }

                                return {
                                    id: learner.id,
                                    name: [
                                        learner.firstName,
                                        learner.middleName,
                                        learner.lastName,
                                    ]
                                        .filter(Boolean)
                                        .join(" "),
                                    age: calculateAge(
                                        learner.birthDate
                                    ),
                                    assignedDoctorId,
                                    assignedTherapistIds,
                                };
                            }
                        )
                    );

                if (isMounted) {
                    setLearners(mappedLearners);
                }
            } catch (error) {
                console.error(
                    "Unable to load collaboration data:",
                    error
                );
            }
        }

        loadCollaborationData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadLearnerNotes() {
            if (!selectedLearnerId) {
                setRecords([]);
                return;
            }

            try {
                setIsLoadingNotes(true);

                const result =
                    await getLearnerCollaborationNotes(
                        selectedLearnerId
                    );

                if (!isMounted) {
                    return;
                }

                const mappedNotes: CollaborationRecord[] =
                    (result.notes ?? []).map(
                        mapApiNoteToRecord
                    );

                setRecords(mappedNotes);
            } catch (error) {
                console.error(
                    "Unable to load collaboration notes:",
                    error
                );

                if (isMounted) {
                    setRecords([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingNotes(false);
                }
            }
        }

        loadLearnerNotes();

        return () => {
            isMounted = false;
        };
    }, [selectedLearnerId]);

    const selectedLearner = learners.find(
        (learner) => learner.id === selectedLearnerId
    );

    const assignedDoctor = doctors.find(
        (doctor) =>
            doctor.id === selectedLearner?.assignedDoctorId
    );

    const assignedTherapists = therapists.filter((therapist) =>
        selectedLearner?.assignedTherapistIds.includes(therapist.id)
    );

    const filteredLearners = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return learners
            .filter((learner) =>
                learner.name
                    .toLowerCase()
                    .includes(normalizedSearch)
            )
            .sort((firstLearner, secondLearner) =>
                firstLearner.name.localeCompare(secondLearner.name)
            );
    }, [learners, searchTerm]);

    const selectedLearnerRecords = useMemo(() => {
        if (!selectedLearnerId) {
            return [];
        }

        return records
            .filter(
                (record) =>
                    record.learnerId === selectedLearnerId
            )
            .sort(
                (firstRecord, secondRecord) =>
                    new Date(firstRecord.createdAt).getTime() -
                    new Date(secondRecord.createdAt).getTime()
            );
    }, [records, selectedLearnerId]);

    const visibleRecords = useMemo(() => {
        return selectedLearnerRecords.filter((record) =>
            isWithinFilter(record.createdAt, selectedFilter)
        );
    }, [selectedLearnerRecords, selectedFilter]);

    const openDoctorModal = () => {
        if (!selectedLearner) {
            return;
        }

        setSelectedDoctorId(
            selectedLearner.assignedDoctorId ??
                doctors[0]?.id ??
                ""
        );

        setShowDoctorModal(true);
    };

    const openTherapistModal = () => {
        if (!selectedLearner) {
            return;
        }

        setSelectedTherapistIds(
            selectedLearner.assignedTherapistIds
        );

        setShowTherapistModal(true);
    };

    const openNoteModal = () => {
        if (!selectedLearner) {
            return;
        }

        setNoteTitle("MOBI Session Note");
        setNoteContent("");
        setShowNoteModal(true);
    };

    const handleAssignDoctor = async () => {
        if (
            !selectedLearner ||
            !selectedDoctorId
        ) {
            return;
        }

        try {
            setIsSavingDoctor(true);

            await assignLearnerDoctor(
                selectedLearner.id,
                selectedDoctorId
            );

            setLearners((previousLearners) =>
                previousLearners.map((learner) =>
                    learner.id === selectedLearner.id
                        ? {
                              ...learner,
                              assignedDoctorId:
                                  selectedDoctorId,
                          }
                        : learner
                )
            );

            setShowDoctorModal(false);
        } catch (error) {
            console.error(
                "Unable to assign doctor:",
                error
            );

            window.alert(
                "Unable to assign doctor. Please try again."
            );
        } finally {
            setIsSavingDoctor(false);
        }
    };

    const toggleTherapistSelection = (therapistId: string) => {
        setSelectedTherapistIds((previousIds) => {
            if (previousIds.includes(therapistId)) {
                return previousIds.filter(
                    (id) => id !== therapistId
                );
            }

            return [...previousIds, therapistId];
        });
    };

    const handleAssignTherapists = async () => {
        if (!selectedLearner) {
            return;
        }

        try {
            setIsSavingTherapists(true);

            const result =
                await assignLearnerTherapists(
                    selectedLearner.id,
                    selectedTherapistIds
                );

            const savedTherapistIds =
                (result.therapists ?? []).map(
                    (therapist: any) =>
                        String(therapist.id)
                );

            setLearners((previousLearners) =>
                previousLearners.map((learner) =>
                    learner.id === selectedLearner.id
                        ? {
                              ...learner,
                              assignedTherapistIds:
                                  savedTherapistIds,
                          }
                        : learner
                )
            );

            setSelectedTherapistIds(
                savedTherapistIds
            );

            setShowTherapistModal(false);
        } catch (error) {
            console.error(
                "Unable to assign therapists:",
                error
            );

            window.alert(
                "Unable to assign therapists. Please try again."
            );
        } finally {
            setIsSavingTherapists(false);
        }
    };

    const handleAddNote = async () => {
        if (
            !selectedLearner ||
            !noteContent.trim()
        ) {
            return;
        }

        try {
            setIsSavingNote(true);

            const result =
                await createLearnerCollaborationNote(
                    selectedLearner.id,
                    {
                        title:
                            noteTitle.trim() ||
                            "MOBI Session Note",
                        content:
                            noteContent.trim(),
                        category:
                            "MOBI Session",
                    }
                );

            const savedNote =
                mapApiNoteToRecord(
                    result.note
                );

            setRecords(
                (previousRecords) => [
                    ...previousRecords,
                    savedNote,
                ]
            );

            setSelectedFilter("today");
            setNoteTitle(
                "MOBI Session Note"
            );
            setNoteContent("");
            setShowNoteModal(false);
        } catch (error) {
            console.error(
                "Unable to add progress note:",
                error
            );

            window.alert(
                "Unable to add progress note. Please try again."
            );
        } finally {
            setIsSavingNote(false);
        }
    };

    return (
        <CenterLayout>
            {(sidebarOpen, setSidebarOpen) => (
                <div className="inter relative flex h-full flex-col overflow-hidden rounded-[30px] bg-[#E4C9E5]/80 p-4 sm:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-4">
                    {!sidebarOpen && (
                        <button
                        type="button"
                        className="text-3xl leading-none"
                        onClick={() =>
                            setSidebarOpen(true)
                        }
                        aria-label="Open sidebar"
                        >
                        ☰
                        </button>
                    )}

                    <h1 className="itim text-4xl font-medium sm:text-5xl">
                        Collaboration
                    </h1>
                    </div>

                    {/* SEARCH */}
                    <div className="flex w-full items-center rounded-xl bg-[#F5EEF6] px-4 py-3 shadow-md xl:w-[380px]">
                    <Search
                        size={20}
                        className="mr-3 shrink-0 text-gray-500"
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Search learner"
                        className="w-full bg-transparent text-sm outline-none sm:text-base"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearchTerm("")
                            }
                            className="ml-2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Clear learner search"
                        >
                            <X size={16} />
                        </button>
                    )}
                    </div>
                </div>

                {/* DIVIDER */}
                <div className="my-5 border-b border-gray-400/60" />


                    {/* MAIN CONTENT */}
                    <div className="grid flex-1 grid-cols-1 gap-5 lg:min-h-0 lg:grid-cols-[250px_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[280px_minmax(0,1fr)]">
                        {/* LEARNERS */}
                        <aside className="flex min-h-[280px] flex-col overflow-hidden rounded-[22px] bg-white shadow-sm lg:min-h-0">
                            {/* LEARNER LIST HEADER */}
                            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Learners
                                </h2>

                                <span className="rounded-full bg-[#F5EEF6] px-2.5 py-1 text-xs font-semibold text-[#82548C]">
                                    {filteredLearners.length}
                                </span>
                            </div>

                            {/* LEARNER LIST */}
                            <div className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]">
                                {filteredLearners.length > 0 ? (
                                    <div className="space-y-1">
                                        {filteredLearners.map((learner) => {
                                            const isSelected =
                                                learner.id === selectedLearnerId;

                                            const learnerDoctor = doctors.find(
                                                (doctor) =>
                                                    doctor.id ===
                                                    learner.assignedDoctorId
                                            );

                                            const learnerTherapists =
                                                therapists.filter(
                                                    (therapist) =>
                                                        learner.assignedTherapistIds.includes(
                                                            therapist.id
                                                        )
                                                );

                                            return (
                                                <div
                                                    key={learner.id}
                                                    className={`overflow-hidden rounded-xl border transition ${
                                                        isSelected
                                                            ? "border-[#D8BCDD] bg-[#FAF6FB]"
                                                            : "border-transparent bg-white hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {/* COMPACT LEARNER ROW */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedLearnerId(
                                                                isSelected
                                                                    ? null
                                                                    : learner.id
                                                            )
                                                        }
                                                        aria-expanded={isSelected}
                                                        className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition ${
                                                            isSelected
                                                                ? "text-[#70437A]"
                                                                : "text-gray-800"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                                                                isSelected
                                                                    ? "border-white bg-white text-[#82548C]"
                                                                    : "border-[#DCC7E0] bg-[#FAF7FA] text-[#82548C]"
                                                            }`}
                                                        >
                                                            {getInitials(
                                                                learner.name
                                                            )}
                                                        </span>

                                                        <span className="min-w-0 flex-1 truncate text-base font-semibold">
                                                            {learner.name}
                                                        </span>

                                                        <ChevronDown
                                                            size={15}
                                                            className={`shrink-0 text-gray-400 transition-transform ${
                                                                isSelected
                                                                    ? "rotate-180"
                                                                    : ""
                                                            }`}
                                                        />
                                                    </button>

                                                    {/* COMPACT CARE TEAM */}
                                                    {isSelected && (
                                                        <div className="border-t border-[#E8DCE9] px-2.5 pb-2.5 pt-2">
                                                            {/* ASSIGNED DOCTOR */}
                                                            <div>
                                                                <div className="mb-1.5 flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#95609F]">
                                                                        <Stethoscope
                                                                            size={12}
                                                                        />
                                                                        Doctor
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            openDoctorModal
                                                                        }
                                                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#82548C] transition hover:bg-[#EAD8EC]"
                                                                        aria-label={
                                                                            learnerDoctor
                                                                                ? "Edit assigned doctor"
                                                                                : "Assign doctor"
                                                                        }
                                                                        title={
                                                                            learnerDoctor
                                                                                ? "Edit assigned doctor"
                                                                                : "Assign doctor"
                                                                        }
                                                                    >
                                                                        {learnerDoctor ? (
                                                                            <Pencil
                                                                                size={14}
                                                                            />
                                                                        ) : (
                                                                            <Plus
                                                                                size={15}
                                                                            />
                                                                        )}
                                                                    </button>
                                                                </div>

                                                                {learnerDoctor ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#DCC7E0] bg-white text-[9px] font-bold text-[#82548C]">
                                                                            {getInitials(
                                                                                learnerDoctor.name
                                                                            )}
                                                                        </span>

                                                                        <div className="min-w-0">
                                                                            <p className="truncate text-sm font-semibold leading-5 text-gray-800">
                                                                                {
                                                                                    learnerDoctor.name
                                                                                }
                                                                            </p>

                                                                            <p className="truncate text-xs leading-4 text-gray-500">
                                                                                {
                                                                                    learnerDoctor.specialization
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            openDoctorModal
                                                                        }
                                                                        className="text-xs font-semibold text-[#82548C] hover:underline"
                                                                    >
                                                                        Assign a doctor
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="my-2 border-t border-gray-200" />

                                                            {/* ASSIGNED THERAPISTS */}
                                                            <div>
                                                                <div className="mb-1.5 flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#95609F]">
                                                                        <Users
                                                                            size={12}
                                                                        />
                                                                        Therapists
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            openTherapistModal
                                                                        }
                                                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#82548C] transition hover:bg-[#EAD8EC]"
                                                                        aria-label={
                                                                            learnerTherapists.length >
                                                                            0
                                                                                ? "Edit assigned therapists"
                                                                                : "Assign therapists"
                                                                        }
                                                                        title={
                                                                            learnerTherapists.length >
                                                                            0
                                                                                ? "Edit assigned therapists"
                                                                                : "Assign therapists"
                                                                        }
                                                                    >
                                                                        {learnerTherapists.length >
                                                                        0 ? (
                                                                            <Pencil
                                                                                size={14}
                                                                            />
                                                                        ) : (
                                                                            <Plus
                                                                                size={15}
                                                                            />
                                                                        )}
                                                                    </button>
                                                                </div>

                                                                {learnerTherapists.length >
                                                                0 ? (
                                                                    <div className="space-y-1.5">
                                                                        {learnerTherapists.map(
                                                                            (
                                                                                therapist
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        therapist.id
                                                                                    }
                                                                                    className="flex items-center gap-2"
                                                                                >
                                                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#DCC7E0] bg-white text-[9px] font-bold text-[#82548C]">
                                                                                        {getInitials(
                                                                                            therapist.name
                                                                                        )}
                                                                                    </span>

                                                                                    <div className="min-w-0">
                                                                                        <p className="truncate text-sm font-semibold leading-5 text-gray-800">
                                                                                            {
                                                                                                therapist.name
                                                                                            }
                                                                                        </p>

                                                                                        <p className="truncate text-xs leading-4 text-gray-500">
                                                                                            {
                                                                                                therapist.specialization
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            openTherapistModal
                                                                        }
                                                                        className="text-xs font-semibold text-[#82548C] hover:underline"
                                                                    >
                                                                        Assign therapists
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
                                        <Search
                                            size={24}
                                            className="mb-3 text-gray-300"
                                        />

                                        <p className="font-semibold text-gray-600">
                                            No learner found
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            No learner matches your search.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* MAIN COLLABORATION CARD */}
                        <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[22px] bg-white shadow-sm lg:min-h-0">
                            {!selectedLearner ? (
                                <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5EEF6]">
                                        <MessageSquare
                                            size={26}
                                            className="text-[#82548C]"
                                        />
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        Select a learner
                                    </h2>

                                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                                        Click a learner from the list to view their progress notes,
                                        assigned doctor, and therapists.
                                    </p>
                                </div>
                            ) : (
                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    {/* UNIFIED NOTES HEADER */}
                                    <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div className="min-w-0">
                                                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                                    Progress Notes
                                                </h2>

                                                <p className="mt-1 truncate text-sm text-gray-500">
                                                    <span className="font-semibold text-gray-700">
                                                        {selectedLearner.name}
                                                    </span>

                                                    <span className="mx-2 text-gray-300">•</span>

                                                    {selectedLearner.age} years old
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* NOTE DATE FILTER */}
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowFilterMenu((previous) => !previous)
                                                        }
                                                        className={`flex h-10 items-center justify-center gap-1 rounded-xl border px-3 transition ${
                                                            showFilterMenu
                                                                ? "border-[#82548C] bg-[#F5EEF6] text-[#82548C]"
                                                                : "border-gray-200 bg-white text-gray-500 hover:border-[#C9A8CF] hover:text-[#82548C]"
                                                        }`}
                                                        aria-label="Filter progress notes"
                                                        aria-expanded={showFilterMenu}
                                                        title="Filter progress notes"
                                                    >
                                                        <CalendarDays size={18} />
                                                        <ChevronDown
                                                            size={14}
                                                            className={`transition-transform ${
                                                                showFilterMenu ? "rotate-180" : ""
                                                            }`}
                                                        />
                                                    </button>

                                                    {showFilterMenu && (
                                                        <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                                                            {[
                                                                {
                                                                    value: "today",
                                                                    label: "Today",
                                                                },
                                                                {
                                                                    value: "week",
                                                                    label: "This Week",
                                                                },
                                                                {
                                                                    value: "month",
                                                                    label: "This Month",
                                                                },
                                                            ].map((filter) => {
                                                                const isActive =
                                                                    selectedFilter === filter.value;

                                                                return (
                                                                    <button
                                                                        key={filter.value}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedFilter(
                                                                                filter.value as NoteFilter
                                                                            );
                                                                            setShowFilterMenu(false);
                                                                        }}
                                                                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                                                                            isActive
                                                                                ? "bg-[#F5EEF6] font-semibold text-[#82548C]"
                                                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                                        }`}
                                                                    >
                                                                        <span>{filter.label}</span>

                                                                        {isActive && <Check size={16} />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={openNoteModal}
                                                    className="flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#82548C] px-4 py-2 font-semibold text-white transition hover:bg-[#704578]"
                                                >
                                                    <Plus size={18} />
                                                    Add Note
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                

                                        {/* SIMPLE TIMELINE */}
                                        <div className="px-5 py-5 sm:px-6">
                                            {isLoadingNotes ? (
                                                <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center">
                                                    <MessageSquare
                                                        size={28}
                                                        className="mx-auto mb-3 text-gray-400"
                                                    />

                                                    <p className="font-semibold text-gray-700">
                                                        Loading notes...
                                                    </p>
                                                </div>
                                            ) : visibleRecords.length >
                                            0 ? (
                                                <div className="space-y-4">
                                                    {visibleRecords.map(
                                                        (record) => {
                                                            const isDoctor =
                                                                record.senderRole ===
                                                                "Doctor";

                                                            return (
                                                                <div
                                                                    key={
                                                                        record.id
                                                                    }
                                                                    className="grid gap-2 md:grid-cols-[115px_minmax(0,1fr)] md:gap-4"
                                                                >
                                                                    <div className="pt-2">
                                                                        <p className="text-sm font-medium text-[#F26B3A]">
                                                                            {
                                                                                record.category
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-sm font-semibold text-gray-900">
                                                                            {formatRecordDate(
                                                                                record.createdAt
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    <article
                                                                        className={`px-5 py-4 ${
                                                                            isDoctor
                                                                                ? "bg-[#EAB2E7]/75"
                                                                                : "bg-[#E8DCE9]"
                                                                        }`}
                                                                    >
                                                                        <div className="mb-3 flex items-center gap-3">
                                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white bg-white text-xs font-bold text-[#82548C]">
                                                                                {getInitials(
                                                                                    record.sender
                                                                                )}
                                                                            </div>

                                                                            <div className="min-w-0">
                                                                                <p className="truncate font-semibold text-gray-900">
                                                                                    {
                                                                                        record.sender
                                                                                    }

                                                                                    {record.senderRole ===
                                                                                        "Center" &&
                                                                                        ", You"}
                                                                                </p>

                                                                                <p className="text-xs text-gray-600">
                                                                                    {
                                                                                        record.title
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <p className="leading-relaxed text-gray-800">
                                                                            {
                                                                                record.content
                                                                            }
                                                                        </p>
                                                                    </article>
                                                                </div>
                                                            );
                                                        }
                                                    )}

                                                    <div className="flex items-center justify-center gap-3 py-4 text-sm text-gray-400">
                                                        <span className="h-px w-16 border-t border-dashed border-gray-300 sm:w-24" />

                                                        Nothing follows

                                                        <span className="h-px w-16 border-t border-dashed border-gray-300 sm:w-24" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center">
                                                    <MessageSquare
                                                        size={28}
                                                        className="mx-auto mb-3 text-gray-400"
                                                    />

                                                    <p className="font-semibold text-gray-700">
                                                        No notes found
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        There are no
                                                        progress notes
                                                        for this period.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                
                            )}
                        </section>
                    </div>

                    {/* DOCTOR MODAL */}
                    {showDoctorModal && selectedLearner && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                            <div className="w-full max-w-xl rounded-[26px] bg-white p-5 shadow-xl sm:p-6">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Assign Doctor
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Select the assigned doctor
                                            for{" "}
                                            <span className="font-semibold">
                                                {
                                                    selectedLearner.name
                                                }
                                            </span>
                                            .
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDoctorModal(false)
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mb-6 max-h-[360px] space-y-2 overflow-y-auto">
                                    {doctors.map((doctor) => (
                                        <button
                                            key={doctor.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedDoctorId(
                                                    doctor.id
                                                )
                                            }
                                            className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                                                selectedDoctorId ===
                                                doctor.id
                                                    ? "border-[#82548C] bg-[#F5EEF6]"
                                                    : "border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DCC7E0] bg-white text-xs font-bold text-[#82548C]">
                                                {getInitials(
                                                    doctor.name
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold">
                                                    {doctor.name}
                                                </p>

                                                <p className="truncate text-sm text-gray-500">
                                                    {
                                                        doctor.specialization
                                                    }
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col justify-end gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDoctorModal(false)
                                        }
                                        className="rounded-xl bg-gray-100 px-5 py-3 font-semibold hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleAssignDoctor}
                                        disabled={
                                            !selectedDoctorId ||
                                            isSavingDoctor
                                        }
                                        className={`rounded-xl px-5 py-3 font-semibold text-white transition ${
                                            !selectedDoctorId ||
                                            isSavingDoctor
                                                ? "cursor-not-allowed bg-gray-300"
                                                : "bg-[#82548C] hover:bg-[#704578]"
                                        }`}
                                    >
                                        {isSavingDoctor
                                            ? "Saving..."
                                            : "Save Doctor"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* THERAPIST MODAL */}
                    {showTherapistModal && selectedLearner && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                            <div className="w-full max-w-xl rounded-[26px] bg-white p-5 shadow-xl sm:p-6">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Assign Therapists
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Select one or more
                                            therapists for{" "}
                                            <span className="font-semibold">
                                                {
                                                    selectedLearner.name
                                                }
                                            </span>
                                            .
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowTherapistModal(
                                                false
                                            )
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mb-6 max-h-[360px] space-y-2 overflow-y-auto">
                                    {therapists.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-gray-300 px-5 py-8 text-center">
                                            <Users
                                                size={24}
                                                className="mx-auto mb-2 text-gray-300"
                                            />
                                            <p className="font-semibold text-gray-700">
                                                No therapists available
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Add a therapist from Center Profile → Staff first.
                                            </p>
                                        </div>
                                    ) : (
                                    therapists.map((therapist) => {
                                        const isSelected =
                                            selectedTherapistIds.includes(
                                                therapist.id
                                            );

                                        return (
                                            <button
                                                key={therapist.id}
                                                type="button"
                                                onClick={() =>
                                                    toggleTherapistSelection(
                                                        therapist.id
                                                    )
                                                }
                                                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                                                    isSelected
                                                        ? "border-[#82548C] bg-[#F5EEF6]"
                                                        : "border-gray-200 hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DCC7E0] bg-white text-xs font-bold text-[#82548C]">
                                                    {getInitials(
                                                        therapist.name
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-semibold">
                                                        {
                                                            therapist.name
                                                        }
                                                    </p>

                                                    <p className="truncate text-sm text-gray-500">
                                                        {
                                                            therapist.specialization
                                                        }
                                                    </p>
                                                </div>

                                                <div
                                                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                                                        isSelected
                                                            ? "border-[#82548C] bg-[#82548C]"
                                                            : "border-gray-300 bg-white"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <span className="text-xs font-bold text-white">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                    )}
                                </div>

                                <div className="flex flex-col justify-end gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowTherapistModal(
                                                false
                                            )
                                        }
                                        className="rounded-xl bg-gray-100 px-5 py-3 font-semibold hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleAssignTherapists
                                        }
                                        disabled={
                                            isSavingTherapists
                                        }
                                        className={`rounded-xl px-5 py-3 font-semibold text-white transition ${
                                            isSavingTherapists
                                                ? "cursor-not-allowed bg-gray-300"
                                                : "bg-[#82548C] hover:bg-[#704578]"
                                        }`}
                                    >
                                        {isSavingTherapists
                                            ? "Saving..."
                                            : "Save Therapists"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ADD NOTE MODAL */}
                    {showNoteModal && selectedLearner && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                            <div className="w-full max-w-xl rounded-[26px] bg-white p-5 shadow-xl sm:p-6">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Add Progress Note
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Add a note for{" "}
                                            <span className="font-semibold">
                                                {
                                                    selectedLearner.name
                                                }
                                            </span>
                                            .
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNoteModal(false)
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <label className="mb-2 block text-sm font-semibold">
                                    Note title
                                </label>

                                <input
                                    type="text"
                                    value={noteTitle}
                                    onChange={(event) =>
                                        setNoteTitle(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter note title"
                                    className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#82548C]"
                                />

                                <label className="mb-2 block text-sm font-semibold">
                                    Progress note
                                </label>

                                <textarea
                                    value={noteContent}
                                    onChange={(event) =>
                                        setNoteContent(
                                            event.target.value
                                        )
                                    }
                                    rows={6}
                                    placeholder="Write observations, learner progress, concerns, or recommendations..."
                                    className="w-full resize-none rounded-2xl border border-gray-200 p-4 outline-none focus:border-[#82548C]"
                                />

                                <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNoteModal(false)
                                        }
                                        className="rounded-xl bg-gray-100 px-5 py-3 font-semibold hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleAddNote}
                                        disabled={
                                            !noteContent.trim() ||
                                            isSavingNote
                                        }
                                        className={`rounded-xl px-5 py-3 font-semibold text-white transition ${
                                            noteContent.trim() &&
                                            !isSavingNote
                                                ? "bg-[#82548C] hover:bg-[#704578]"
                                                : "cursor-not-allowed bg-gray-300"
                                        }`}
                                    >
                                        {isSavingNote
                                            ? "Saving..."
                                            : "Add Note"}
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

export default Collaboration;