import { useMemo, useState } from "react";
import {
    CalendarDays,
    Check,
    ChevronDown,
    MessageSquare,
    Plus,
    Search,
    Stethoscope,
    Users,
    X,
} from "lucide-react";

import TherapistLayout from "../../../layouts/TherapistLayout";

type Learner = {
    id: number;
    name: string;
    age: number;
    assignedDoctorId?: number;
    assignedTherapistIds: number[];
};

type Doctor = {
    id: number;
    name: string;
    specialization: string;
};

type Therapist = {
    id: number;
    name: string;
    specialization: string;
};

type NoteCategory =
    | "Clinical"
    | "MOBI Session"
    | "Therapy Session";

type SenderRole = "Center" | "Doctor" | "Therapist";

type CollaborationRecord = {
    id: number;
    learnerId: number;
    doctorId?: number;
    therapistId?: number;
    category: NoteCategory;
    title: string;
    createdAt: string;
    sender: string;
    senderRole: SenderRole;
    content: string;
};

type NoteFilter = "today" | "week" | "month";

const currentTherapist: Therapist = {
    id: 1,
    name: "Anna Reyes, SLP",
    specialization: "Speech-Language Therapist",
};

const doctors: Doctor[] = [
    {
        id: 1,
        name: "Dr. Jane R. Doe",
        specialization: "Developmental Pediatrician",
    },
    {
        id: 2,
        name: "Dr. Marco D. Reyes",
        specialization: "Child Psychologist",
    },
    {
        id: 3,
        name: "Dr. Andrea L. Cruz",
        specialization: "Behavioral Specialist",
    },
];

const therapists: Therapist[] = [
    currentTherapist,
    {
        id: 2,
        name: "Villa R. Reese, ST",
        specialization: "Speech Therapist",
    },
    {
        id: 3,
        name: "Maria D. Santos, BT",
        specialization: "Behavioral Therapist",
    },
];

const initialLearners: Learner[] = [
    {
        id: 1,
        name: "Lea Sarsoza",
        age: 6,
        assignedDoctorId: 1,
        assignedTherapistIds: [1, 2],
    },
    {
        id: 2,
        name: "Harry Potter",
        age: 7,
        assignedTherapistIds: [3],
    },
    {
        id: 3,
        name: "Albus Severus",
        age: 5,
        assignedDoctorId: 2,
        assignedTherapistIds: [1],
    },
    {
        id: 4,
        name: "George Weasley",
        age: 8,
        assignedTherapistIds: [],
    },
];

const createDateDaysAgo = (daysAgo: number) => {
    const date = new Date();

    date.setDate(date.getDate() - daysAgo);
    date.setHours(10, 0, 0, 0);

    return date.toISOString();
};

const initialRecords: CollaborationRecord[] = [
    {
        id: 1,
        learnerId: 1,
        doctorId: 1,
        category: "Clinical",
        title: "Clinical Progress Note",
        createdAt: createDateDaysAgo(10),
        sender: "Dr. Jane R. Doe",
        senderRole: "Doctor",
        content:
            "Lea practiced following simple directions and used short verbal requests during play activities. She showed improved attention during sensory breaks and participated well in peer interaction exercises.",
    },
    {
        id: 2,
        learnerId: 1,
        category: "MOBI Session",
        title: "MOBI Session Note",
        createdAt: createDateDaysAgo(6),
        sender: "Center Admin",
        senderRole: "Center",
        content:
            "Lea completed AI-guided speech activities focused on emotion recognition and turn-taking skills. She responded positively to adaptive prompts and demonstrated progress in initiating simple social greetings.",
    },
    {
        id: 3,
        learnerId: 1,
        therapistId: 1,
        category: "Therapy Session",
        title: "Occupational Therapy Note",
        createdAt: createDateDaysAgo(3),
        sender: "Anna Reyes, SLP",
        senderRole: "Therapist",
        content:
            "Lea participated in turn-taking and sensory regulation activities. She completed the first two activities independently and needed verbal support during the final activity.",
    },
    {
        id: 4,
        learnerId: 1,
        doctorId: 1,
        category: "Clinical",
        title: "Clinical Follow-up",
        createdAt: createDateDaysAgo(0),
        sender: "Dr. Jane R. Doe",
        senderRole: "Doctor",
        content:
            "Continue using short prompts and allow a brief sensory break when Lea becomes distracted. Gradually increase activity difficulty when she consistently completes the current level.",
    },
    {
        id: 5,
        learnerId: 3,
        doctorId: 2,
        category: "Clinical",
        title: "Clinical Progress Note",
        createdAt: createDateDaysAgo(5),
        sender: "Dr. Marco D. Reyes",
        senderRole: "Doctor",
        content:
            "Albus may benefit from slower activity pacing and fewer repeated attempts per session to avoid frustration.",
    },
    {
        id: 6,
        learnerId: 3,
        therapistId: 1,
        category: "Therapy Session",
        title: "Occupational Therapy Note",
        createdAt: createDateDaysAgo(1),
        sender: "Anna Reyes, SLP",
        senderRole: "Therapist",
        content:
            "Albus completed a short matching activity and followed two-step instructions with guided support. He benefited from a short movement break before continuing.",
    },
];

const NOTE_FILTER_OPTIONS: Array<{
    value: NoteFilter;
    label: string;
}> = [
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
];

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
        const daysSinceMonday =
            currentDay === 0 ? 6 : currentDay - 1;

        startDate.setDate(
            now.getDate() - daysSinceMonday
        );

        startDate.setHours(0, 0, 0, 0);

        return recordDate >= startDate && recordDate <= now;
    }

    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return recordDate >= startDate && recordDate <= now;
};

const TherapistCollaboration = () => {
    const [learners] = useState<Learner[]>(
        initialLearners
    );

    const [records, setRecords] =
        useState<CollaborationRecord[]>(
            initialRecords
        );

    const [searchTerm, setSearchTerm] =
        useState("");

    const [selectedLearnerId, setSelectedLearnerId] =
        useState<number | null>(null);

    const [selectedFilter, setSelectedFilter] =
        useState<NoteFilter>("month");

    const [showFilterMenu, setShowFilterMenu] =
        useState(false);

    const [showNoteModal, setShowNoteModal] =
        useState(false);

    const [noteTitle, setNoteTitle] =
        useState("Therapy Session Note");

    const [noteContent, setNoteContent] =
        useState("");

    /*
     * Only learners assigned to the currently signed-in
     * therapist are displayed.
     *
     * Later, replace currentTherapist.id with the therapist ID
     * returned by authentication/backend.
     */
    const assignedLearners = useMemo(() => {
        return learners.filter((learner) =>
            learner.assignedTherapistIds.includes(
                currentTherapist.id
            )
        );
    }, [learners]);

    const filteredLearners = useMemo(() => {
        const normalizedSearch = searchTerm
            .trim()
            .toLowerCase();

        return assignedLearners
            .filter((learner) =>
                learner.name
                    .toLowerCase()
                    .includes(normalizedSearch)
            )
            .sort((firstLearner, secondLearner) =>
                firstLearner.name.localeCompare(
                    secondLearner.name
                )
            );
    }, [assignedLearners, searchTerm]);

    const selectedLearner =
        assignedLearners.find(
            (learner) =>
                learner.id === selectedLearnerId
        );

    const selectedLearnerRecords = useMemo(() => {
        if (!selectedLearnerId) {
            return [];
        }

        return records
            .filter(
                (record) =>
                    record.learnerId ===
                    selectedLearnerId
            )
            .sort(
                (firstRecord, secondRecord) =>
                    new Date(
                        firstRecord.createdAt
                    ).getTime() -
                    new Date(
                        secondRecord.createdAt
                    ).getTime()
            );
    }, [records, selectedLearnerId]);

    const visibleRecords = useMemo(() => {
        return selectedLearnerRecords.filter(
            (record) =>
                isWithinFilter(
                    record.createdAt,
                    selectedFilter
                )
        );
    }, [
        selectedLearnerRecords,
        selectedFilter,
    ]);

    const handleSelectLearner = (
        learnerId: number
    ) => {
        setSelectedLearnerId(
            (currentLearnerId) =>
                currentLearnerId === learnerId
                    ? null
                    : learnerId
        );

        setShowFilterMenu(false);
    };

    const openNoteModal = () => {
        if (!selectedLearner) {
            return;
        }

        setNoteTitle("Therapy Session Note");
        setNoteContent("");
        setShowFilterMenu(false);
        setShowNoteModal(true);
    };

    const closeNoteModal = () => {
        setShowNoteModal(false);
        setNoteTitle("Therapy Session Note");
        setNoteContent("");
    };

    const handleAddNote = () => {
        if (
            !selectedLearner ||
            !noteContent.trim()
        ) {
            return;
        }

        const newRecord: CollaborationRecord = {
            id: Date.now(),
            learnerId: selectedLearner.id,
            therapistId: currentTherapist.id,
            category: "Therapy Session",
            title:
                noteTitle.trim() ||
                "Therapy Session Note",
            createdAt: new Date().toISOString(),
            sender: currentTherapist.name,
            senderRole: "Therapist",
            content: noteContent.trim(),
        };

        setRecords((previousRecords) => [
            ...previousRecords,
            newRecord,
        ]);

        setSelectedFilter("today");
        closeNoteModal();
    };

    return (
        <TherapistLayout>
            {(sidebarOpen, setSidebarOpen) => (
                <div className="inter relative flex h-full flex-col overflow-hidden rounded-[30px] bg-[#E4C9E5]/80 p-4 sm:p-6 lg:p-8">
                    {/* PAGE HEADER */}
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-4">
                            {!sidebarOpen && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSidebarOpen(
                                            true
                                        )
                                    }
                                    className="text-3xl leading-none"
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
                                    setSearchTerm(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Search learner"
                                className="w-full bg-transparent text-sm outline-none sm:text-base"
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchTerm(
                                            ""
                                        )
                                    }
                                    className="ml-2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    aria-label="Clear learner search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="my-5 border-b border-gray-400/60" />

                    {/* MAIN CONTENT */}
                    <div className="grid flex-1 grid-cols-1 gap-5 lg:min-h-0 lg:grid-cols-[250px_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[280px_minmax(0,1fr)]">
                        {/* LEARNER LIST */}
                        <aside className="flex min-h-[280px] flex-col overflow-hidden rounded-[22px] bg-white shadow-sm lg:min-h-0">
                            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
                                <h2 className="text-lg font-bold text-gray-900">
                                    My Learners
                                </h2>

                                <span className="rounded-full bg-[#F5EEF6] px-2.5 py-1 text-xs font-semibold text-[#82548C]">
                                    {filteredLearners.length}
                                </span>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]">
                                {filteredLearners.length >
                                0 ? (
                                    <div className="space-y-1">
                                        {filteredLearners.map(
                                            (learner) => {
                                                const isSelected =
                                                    learner.id ===
                                                    selectedLearnerId;

                                                const learnerDoctor =
                                                    doctors.find(
                                                        (
                                                            doctor
                                                        ) =>
                                                            doctor.id ===
                                                            learner.assignedDoctorId
                                                    );

                                                const learnerTherapists =
                                                    therapists.filter(
                                                        (
                                                            therapist
                                                        ) =>
                                                            learner.assignedTherapistIds.includes(
                                                                therapist.id
                                                            )
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            learner.id
                                                        }
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
                                                                handleSelectLearner(
                                                                    learner.id
                                                                )
                                                            }
                                                            aria-expanded={
                                                                isSelected
                                                            }
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
                                                                size={
                                                                    15
                                                                }
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
                                                                {/* DOCTOR */}
                                                                <div>
                                                                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#95609F]">
                                                                        <Stethoscope
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        Doctor
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
                                                                                    {learnerDoctor.name}
                                                                                </p>

                                                                                <p className="truncate text-xs leading-4 text-gray-500">
                                                                                    {learnerDoctor.specialization}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-[11px] text-gray-500">
                                                                            No
                                                                            doctor
                                                                            assigned
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="my-2 border-t border-gray-200" />

                                                                {/* THERAPISTS */}
                                                                <div>
                                                                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#95609F]">
                                                                        <Users
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        Therapists
                                                                    </div>

                                                                    {learnerTherapists.length >
                                                                    0 ? (
                                                                        <div className="space-y-1.5">
                                                                            {learnerTherapists.map(
                                                                                (
                                                                                    therapist
                                                                                ) => {
                                                                                    const isCurrentTherapist =
                                                                                        therapist.id ===
                                                                                        currentTherapist.id;

                                                                                    return (
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
                                                                                                    {therapist.name}

                                                                                                    {isCurrentTherapist && " • You"}
                                                                                                </p>

                                                                                                <p className="truncate text-xs leading-4 text-gray-500">
                                                                                                    {therapist.specialization}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-xs text-gray-500">
                                                                            No
                                                                            therapist
                                                                            assigned
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
                                        <Search
                                            size={24}
                                            className="mb-3 text-gray-300"
                                        />

                                        <p className="font-semibold text-gray-600">
                                            No learner
                                            found
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            No assigned
                                            learner matches
                                            your search.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* COLLABORATION NOTES */}
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
                                        Click an assigned
                                        learner from the list
                                        to view their progress
                                        notes and care team.
                                    </p>
                                </div>
                            ) : (
                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    {/* NOTES HEADER */}
                                    <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div className="min-w-0">
                                                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                                    Progress
                                                    Notes
                                                </h2>

                                                <p className="mt-1 truncate text-sm text-gray-500">
                                                    <span className="font-semibold text-gray-700">
                                                        {
                                                            selectedLearner.name
                                                        }
                                                    </span>

                                                    <span className="mx-2 text-gray-300">
                                                        •
                                                    </span>

                                                    {
                                                        selectedLearner.age
                                                    }{" "}
                                                    years old
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* DATE FILTER */}
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowFilterMenu(
                                                                (
                                                                    previous
                                                                ) =>
                                                                    !previous
                                                            )
                                                        }
                                                        className={`flex h-10 items-center justify-center gap-1 rounded-xl border px-3 transition ${
                                                            showFilterMenu
                                                                ? "border-[#82548C] bg-[#F5EEF6] text-[#82548C]"
                                                                : "border-gray-200 bg-white text-gray-500 hover:border-[#C9A8CF] hover:text-[#82548C]"
                                                        }`}
                                                        aria-label="Filter progress notes"
                                                        aria-expanded={
                                                            showFilterMenu
                                                        }
                                                        title="Filter progress notes"
                                                    >
                                                        <CalendarDays
                                                            size={
                                                                18
                                                            }
                                                        />

                                                        <ChevronDown
                                                            size={
                                                                14
                                                            }
                                                            className={`transition-transform ${
                                                                showFilterMenu
                                                                    ? "rotate-180"
                                                                    : ""
                                                            }`}
                                                        />
                                                    </button>

                                                    {showFilterMenu && (
                                                        <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                                                            {NOTE_FILTER_OPTIONS.map(
                                                                (
                                                                    filter
                                                                ) => {
                                                                    const isActive =
                                                                        selectedFilter ===
                                                                        filter.value;

                                                                    return (
                                                                        <button
                                                                            key={
                                                                                filter.value
                                                                            }
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedFilter(
                                                                                    filter.value
                                                                                );

                                                                                setShowFilterMenu(
                                                                                    false
                                                                                );
                                                                            }}
                                                                            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                                                                                isActive
                                                                                    ? "bg-[#F5EEF6] font-semibold text-[#82548C]"
                                                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                                            }`}
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    filter.label
                                                                                }
                                                                            </span>

                                                                            {isActive && (
                                                                                <Check
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ADD NOTE */}
                                                <button
                                                    type="button"
                                                    onClick={
                                                        openNoteModal
                                                    }
                                                    className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#82548C] px-4 font-semibold text-white transition hover:bg-[#704578]"
                                                >
                                                    <Plus
                                                        size={
                                                            18
                                                        }
                                                    />
                                                    Add Note
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* NOTES TIMELINE */}
                                    <div className="px-5 py-5 sm:px-6">
                                        {visibleRecords.length >
                                        0 ? (
                                            <div className="space-y-4">
                                                {visibleRecords.map(
                                                    (
                                                        record
                                                    ) => {
                                                        const isDoctor =
                                                            record.senderRole ===
                                                            "Doctor";

                                                        const isCurrentTherapistNote =
                                                            record.senderRole ===
                                                                "Therapist" &&
                                                            record.therapistId ===
                                                                currentTherapist.id;

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

                                                                                {isCurrentTherapistNote &&
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

                                                    Nothing
                                                    follows

                                                    <span className="h-px w-16 border-t border-dashed border-gray-300 sm:w-24" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center">
                                                <MessageSquare
                                                    size={
                                                        28
                                                    }
                                                    className="mx-auto mb-3 text-gray-400"
                                                />

                                                <p className="font-semibold text-gray-700">
                                                    No notes
                                                    found
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    There
                                                    are no
                                                    progress
                                                    notes for
                                                    this
                                                    period.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ADD NOTE MODAL */}
                    {showNoteModal &&
                        selectedLearner && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                                <div className="w-full max-w-xl rounded-[26px] bg-white p-5 shadow-xl sm:p-6">
                                    <div className="mb-5 flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                Add Progress
                                                Note
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Add a therapy
                                                note for{" "}
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
                                            onClick={
                                                closeNoteModal
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-gray-100"
                                            aria-label="Close add note modal"
                                        >
                                            <X
                                                size={
                                                    20
                                                }
                                            />
                                        </button>
                                    </div>

                                    <label className="mb-2 block text-sm font-semibold">
                                        Note title
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            noteTitle
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setNoteTitle(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter note title"
                                        className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#82548C]"
                                    />

                                    <label className="mb-2 block text-sm font-semibold">
                                        Progress note
                                    </label>

                                    <textarea
                                        value={
                                            noteContent
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setNoteContent(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        rows={6}
                                        placeholder="Write observations, learner progress, concerns, or recommendations..."
                                        className="w-full resize-none rounded-2xl border border-gray-200 p-4 outline-none transition focus:border-[#82548C]"
                                    />

                                    <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={
                                                closeNoteModal
                                            }
                                            className="rounded-xl bg-gray-100 px-5 py-3 font-semibold transition hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={
                                                handleAddNote
                                            }
                                            disabled={
                                                !noteContent.trim()
                                            }
                                            className={`rounded-xl px-5 py-3 font-semibold text-white transition ${
                                                noteContent.trim()
                                                    ? "bg-[#82548C] hover:bg-[#704578]"
                                                    : "cursor-not-allowed bg-gray-300"
                                            }`}
                                        >
                                            Add Note
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            )}
        </TherapistLayout>
    );
};

export default TherapistCollaboration;