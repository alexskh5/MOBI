import { useMemo, useState } from "react";
import {
    FileText,
    MessageSquare,
    Search,
    Send,
    Stethoscope,
    UserPlus,
    UserRound,
    X,
} from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";

type Learner = {
    id: number;
    name: string;
    age: number;
    assignedDoctorId?: number;
};

type Doctor = {
    id: number;
    name: string;
    specialization: string;
};

type CollaborationRecord = {
    id: number;
    learnerId: number;
    doctorId?: number;
    type: "Report Sent" | "Feedback Received";
    title: string;
    date: string;
    sender: string;
    senderRole: "Center" | "Doctor";
    content: string;
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

const initialLearners: Learner[] = [
    {
        id: 1,
        name: "Lea Sarsoza",
        age: 6,
        assignedDoctorId: 1,
    },
    {
        id: 2,
        name: "Harry Potter",
        age: 7,
    },
    {
        id: 3,
        name: "Albus Severus",
        age: 5,
        assignedDoctorId: 2,
    },
    {
        id: 4,
        name: "George Weasley",
        age: 8,
    },
];

const initialRecords: CollaborationRecord[] = [
    {
        id: 1,
        learnerId: 1,
        doctorId: 1,
        type: "Report Sent",
        title: "MOBI Session Report",
        date: "May 3, 2026",
        sender: "Center Admin",
        senderRole: "Center",
        content:
            "Lea seemed distracted during the first part of the session, but she responded better after shorter prompts and sensory breaks. She completed the speech activity with guided support.",
    },
    {
        id: 2,
        learnerId: 1,
        doctorId: 1,
        type: "Feedback Received",
        title: "Clinical Feedback",
        date: "May 4, 2026",
        sender: "Dr. Jane R. Doe",
        senderRole: "Doctor",
        content:
            "Continue using short prompts and avoid long repeated tasks in one session. If Lea becomes distracted, pause first before giving another instruction.",
    },
    {
        id: 3,
        learnerId: 1,
        doctorId: 1,
        type: "Report Sent",
        title: "Weekly Progress Summary",
        date: "May 5, 2026",
        sender: "Center Admin",
        senderRole: "Center",
        content:
            "The weekly summary was sent for clinical review. It includes completed activities, speech ladder progress, focus time, inactivity time, and social readiness observations.",
    },
    {
        id: 4,
        learnerId: 3,
        doctorId: 2,
        type: "Feedback Received",
        title: "Clinical Feedback",
        date: "May 7, 2026",
        sender: "Dr. Marco D. Reyes",
        senderRole: "Doctor",
        content:
            "Albus may benefit from slower activity pacing and fewer repeated attempts per session to avoid frustration.",
    },
];

const Collaboration = () => {
    const [learners, setLearners] = useState<Learner[]>(initialLearners);
    const [records, setRecords] =
        useState<CollaborationRecord[]>(initialRecords);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLearnerId, setSelectedLearnerId] = useState<number | null>(
        null
    );

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);
    const [reportNote, setReportNote] = useState("");

    const selectedLearner = learners.find(
        (learner) => learner.id === selectedLearnerId
    );

    const assignedDoctor = doctors.find(
        (doctor) => doctor.id === selectedLearner?.assignedDoctorId
    );

    const filteredLearners = useMemo(() => {
        return learners.filter((learner) =>
            learner.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [learners, searchTerm]);

    const selectedLearnerRecords = useMemo(() => {
        if (!selectedLearnerId) return [];

        return records.filter(
            (record) => record.learnerId === selectedLearnerId
        );
    }, [records, selectedLearnerId]);

    const reportsSentCount = selectedLearnerRecords.filter(
        (record) => record.type === "Report Sent"
    ).length;

    const feedbackReceivedCount = selectedLearnerRecords.filter(
        (record) => record.type === "Feedback Received"
    ).length;

    const getDoctor = (doctorId?: number) => {
        return doctors.find((doctor) => doctor.id === doctorId);
    };

    const openAssignModal = () => {
        if (!selectedLearner) return;

        setSelectedDoctorId(selectedLearner.assignedDoctorId || doctors[0].id);
        setShowAssignModal(true);
    };

    const openReportModal = () => {
        if (!selectedLearner || !assignedDoctor) return;

        setReportNote("");
        setShowReportModal(true);
    };

    const handleAssignDoctor = () => {
        if (!selectedLearner) return;

        setLearners((prevLearners) =>
            prevLearners.map((learner) =>
                learner.id === selectedLearner.id
                    ? {
                          ...learner,
                          assignedDoctorId: selectedDoctorId,
                      }
                    : learner
            )
        );

        setShowAssignModal(false);
    };

    const handleSendReport = () => {
        if (!selectedLearner || !assignedDoctor) return;

        const newRecord: CollaborationRecord = {
            id: Date.now(),
            learnerId: selectedLearner.id,
            doctorId: assignedDoctor.id,
            type: "Report Sent",
            title: "MOBI Session Report",
            date: "Today",
            sender: "Center Admin",
            senderRole: "Center",
            content:
                reportNote.trim() ||
                `A MOBI session report for ${selectedLearner.name} was sent to ${assignedDoctor.name} for clinical review.`,
        };

        setRecords((prevRecords) => [...prevRecords, newRecord]);
        setReportNote("");
        setShowReportModal(false);
    };

    return (
        <CenterLayout>
            {(sidebarOpen, setSidebarOpen) => (
                <div className="bg-[#E4C9E5]/80 h-full min-h-0 rounded-[30px] p-4 sm:p-6 lg:p-8 inter flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 shrink-0">
                        {!sidebarOpen && (
                            <button
                                type="button"
                                className="text-3xl shrink-0"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Open sidebar"
                            >
                                ☰
                            </button>
                        )}

                        <h1 className="text-4xl sm:text-5xl font-medium itim">
                            Collaboration
                        </h1>
                    </div>

                    <div className="border-b border-gray-400/70 mb-6 shrink-0" />

                    {/* Main Content */}
                    <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6 flex-1 min-h-0 overflow-hidden">
                        {/* Learner List */}
                        <div className="bg-white/85 rounded-[24px] p-5 shadow-sm flex flex-col min-h-0 overflow-hidden">
                            <h2 className="text-xl font-bold mb-4 shrink-0">
                                Learners
                            </h2>

                            <div className="flex items-center bg-[#F5EEF6] px-4 py-3 rounded-xl shadow-sm mb-4 shrink-0">
                                <Search
                                    size={18}
                                    className="text-gray-500 mr-3 shrink-0"
                                />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search learner name"
                                    className="bg-transparent outline-none w-full text-sm"
                                />
                            </div>

                            <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
                                {filteredLearners.map((learner) => {
                                    const isSelected =
                                        learner.id === selectedLearnerId;

                                    const learnerDoctor = getDoctor(
                                        learner.assignedDoctorId
                                    );

                                    return (
                                        <button
                                            key={learner.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedLearnerId(learner.id)
                                            }
                                            className={`w-full text-left rounded-2xl p-3 transition ${
                                                isSelected
                                                    ? "bg-[#E4C9E5] shadow-sm"
                                                    : "hover:bg-[#F5EEF6]"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white border border-[#C9A8CF] flex items-center justify-center shrink-0">
                                                    <UserRound
                                                        size={20}
                                                        className="text-[#9B75A3]"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {learner.name}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        Age {learner.age}
                                                    </p>

                                                    <p
                                                        className={`text-sm mt-1 truncate ${
                                                            learnerDoctor
                                                                ? "text-[#F26B3A]"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {learnerDoctor
                                                            ? learnerDoctor.name
                                                            : "No doctor assigned"}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}

                                {filteredLearners.length === 0 && (
                                    <div className="text-center text-gray-500 py-10">
                                        No learner found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white/85 rounded-[24px] shadow-sm flex flex-col min-h-0 overflow-hidden">
                            {!selectedLearner ? (
                                <div className="flex-1 min-h-[420px] flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 rounded-full bg-[#F5EEF6] flex items-center justify-center mb-4">
                                        <MessageSquare
                                            size={30}
                                            className="text-[#9B75A3]"
                                        />
                                    </div>

                                    <h2 className="text-2xl font-bold mb-2">
                                        Select a learner
                                    </h2>

                                    <p className="text-gray-500 max-w-md">
                                        Choose a learner from the list to assign
                                        a doctor, send MOBI reports, and view
                                        clinical feedback.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex-1 min-h-0 overflow-y-auto">
                                    {/* Learner Header */}
                                    <div className="p-5 sm:p-6 border-b border-gray-200">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-bold">
                                                    {selectedLearner.name}
                                                </h2>

                                                <p className="text-gray-600 mt-1">
                                                    Age {selectedLearner.age}
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    type="button"
                                                    onClick={openAssignModal}
                                                    className="flex items-center justify-center gap-2 bg-[#F5EEF6] hover:bg-[#E4C9E5] px-4 py-3 rounded-xl font-semibold transition"
                                                >
                                                    <UserPlus size={18} />
                                                    {assignedDoctor
                                                        ? "Change Doctor"
                                                        : "Assign Doctor"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={openReportModal}
                                                    disabled={!assignedDoctor}
                                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition ${
                                                        assignedDoctor
                                                            ? "bg-[#F26B3A] text-white hover:bg-[#df5b2d]"
                                                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                    }`}
                                                >
                                                    <Send size={18} />
                                                    Send Report
                                                </button>
                                            </div>
                                        </div>

                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                            {/* Assigned Doctor */}
                                            <div className="rounded-2xl bg-[#F5EEF6] px-4 py-3 min-h-[115px] flex flex-col">
                                                <div className="flex items-center gap-2 text-[#9B75A3] h-6">
                                                    <Stethoscope size={16} />
                                                    <p className="font-semibold text-sm">
                                                        Assigned Doctor
                                                    </p>
                                                </div>

                                                <div className="h-9 flex items-center mt-2">
                                                    {assignedDoctor ? (
                                                        <p className="font-bold text-[#F26B3A] text-lg leading-tight">
                                                            {assignedDoctor.name}
                                                        </p>
                                                    ) : (
                                                        <p className="font-semibold text-orange-600 text-lg leading-tight">
                                                            Not assigned
                                                        </p>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-700 leading-tight">
                                                    {assignedDoctor
                                                        ? assignedDoctor.specialization
                                                        : "Assign a doctor first"}
                                                </p>
                                            </div>

                                            {/* Reports Sent */}
                                            <div className="rounded-2xl bg-[#F5EEF6] px-4 py-3 min-h-[115px] flex flex-col">
                                                <div className="flex items-center gap-2 text-[#9B75A3] h-6">
                                                    <FileText size={16} />
                                                    <p className="font-semibold text-sm">
                                                        Reports Sent
                                                    </p>
                                                </div>

                                                <div className="h-9 flex items-center mt-2">
                                                    <p className="text-3xl font-bold text-gray-900 leading-none">
                                                        {reportsSentCount}
                                                    </p>
                                                </div>

                                                <p className="text-sm text-gray-600 leading-tight">
                                                    Shared with doctor
                                                </p>
                                            </div>

                                            {/* Feedback Received */}
                                            <div className="rounded-2xl bg-[#F5EEF6] px-4 py-3 min-h-[115px] flex flex-col">
                                                <div className="flex items-center gap-2 text-[#9B75A3] h-6">
                                                    <MessageSquare size={16} />
                                                    <p className="font-semibold text-sm">
                                                        Feedback Received
                                                    </p>
                                                </div>

                                                <div className="h-9 flex items-center mt-2">
                                                    <p className="text-3xl font-bold text-gray-900 leading-none">
                                                        {feedbackReceivedCount}
                                                    </p>
                                                </div>

                                                <p className="text-sm text-gray-600 leading-tight">
                                                    Doctor responses
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Timeline */}
                                    <div className="p-5 sm:p-6">
                                        <div className="flex items-center justify-between gap-4 mb-5">
                                            <div>
                                                <h3 className="text-xl font-bold">
                                                    Collaboration Notes
                                                </h3>

                                                <p className="text-sm text-gray-500">
                                                    Reports and doctor feedback
                                                    are shown in order.
                                                </p>
                                            </div>
                                        </div>

                                        {selectedLearnerRecords.length > 0 ? (
                                            <div className="space-y-5">
                                                {selectedLearnerRecords.map(
                                                    (record) => {
                                                        const isDoctor =
                                                            record.senderRole ===
                                                            "Doctor";

                                                        return (
                                                            <div
                                                                key={record.id}
                                                                className={`flex ${
                                                                    isDoctor
                                                                        ? "justify-start"
                                                                        : "justify-end"
                                                                }`}
                                                            >
                                                                <div
                                                                    className={`max-w-[92%] lg:max-w-[76%] rounded-[22px] p-4 sm:p-5 shadow-sm ${
                                                                        isDoctor
                                                                            ? "bg-[#FFF7F3] border border-orange-100"
                                                                            : "bg-[#F8F3F9] border border-[#E4C9E5]"
                                                                    }`}
                                                                >
                                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                {isDoctor ? (
                                                                                    <Stethoscope
                                                                                        size={
                                                                                            18
                                                                                        }
                                                                                        className="text-[#F26B3A]"
                                                                                    />
                                                                                ) : (
                                                                                    <FileText
                                                                                        size={
                                                                                            18
                                                                                        }
                                                                                        className="text-[#9B75A3]"
                                                                                    />
                                                                                )}

                                                                                <h4 className="font-bold text-lg">
                                                                                    {
                                                                                        record.title
                                                                                    }
                                                                                </h4>
                                                                            </div>

                                                                            <p
                                                                                className={`text-sm font-semibold ${
                                                                                    isDoctor
                                                                                        ? "text-[#F26B3A]"
                                                                                        : "text-[#9B75A3]"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    record.sender
                                                                                }{" "}
                                                                                •{" "}
                                                                                {
                                                                                    record.type
                                                                                }
                                                                            </p>
                                                                        </div>

                                                                        <span className="text-sm text-gray-500 shrink-0">
                                                                            {
                                                                                record.date
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    <p className="text-gray-700 leading-relaxed">
                                                                        {
                                                                            record.content
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500">
                                                No reports or feedback yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assign Doctor Modal */}
                    {showAssignModal && selectedLearner && (
                        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                            <div className="bg-white rounded-[28px] w-full max-w-xl p-6 shadow-xl">
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Assign Doctor
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Select a doctor for{" "}
                                            <span className="font-semibold">
                                                {selectedLearner.name}
                                            </span>
                                            .
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAssignModal(false)
                                        }
                                        className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-3 mb-6 max-h-[360px] overflow-y-auto pr-1">
                                    {doctors.map((doctor) => (
                                        <button
                                            key={doctor.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedDoctorId(doctor.id)
                                            }
                                            className={`w-full text-left rounded-2xl border p-4 transition ${
                                                selectedDoctorId === doctor.id
                                                    ? "border-[#9B75A3] bg-[#F5EEF6]"
                                                    : "border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            <p className="font-bold">
                                                {doctor.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {doctor.specialization}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAssignModal(false)
                                        }
                                        className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleAssignDoctor}
                                        className="px-5 py-3 rounded-xl bg-[#F26B3A] hover:bg-[#df5b2d] text-white font-semibold"
                                    >
                                        Save Assignment
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Send Report Modal */}
                    {showReportModal && selectedLearner && assignedDoctor && (
                        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                            <div className="bg-white rounded-[28px] w-full max-w-xl p-6 shadow-xl">
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Send MOBI Report
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Send report for{" "}
                                            <span className="font-semibold">
                                                {selectedLearner.name}
                                            </span>{" "}
                                            to{" "}
                                            <span className="font-semibold">
                                                {assignedDoctor.name}
                                            </span>
                                            .
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowReportModal(false)
                                        }
                                        className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <label className="block text-sm font-semibold mb-2">
                                    Report note
                                </label>

                                <textarea
                                    value={reportNote}
                                    onChange={(event) =>
                                        setReportNote(event.target.value)
                                    }
                                    rows={6}
                                    placeholder="Write a short MOBI/session report summary..."
                                    className="w-full resize-none rounded-2xl border border-gray-200 p-4 outline-none focus:border-[#9B75A3]"
                                />

                                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowReportModal(false)
                                        }
                                        className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSendReport}
                                        className="px-5 py-3 rounded-xl bg-[#F26B3A] hover:bg-[#df5b2d] text-white font-semibold"
                                    >
                                        Send Report
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