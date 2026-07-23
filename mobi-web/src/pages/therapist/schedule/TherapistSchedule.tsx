import { useMemo, useRef, useState } from "react";
import {
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Search,
    UserRound,
    X,
} from "lucide-react";

import TherapistLayout from "../../../layouts/TherapistLayout";

type ScheduleStatus =
    | "pending"
    | "confirmed"
    | "declined"
    | "cancelled";

type ScheduleItem = {
    id: string;
    dateKey: string;
    time: string;
    therapistId: string;
    learnerId: string;
    durationMinutes: number;
    status: ScheduleStatus;
    notes?: string;
    assignedBy?: string;
};

type Learner = {
    id: string;
    name: string;
};

const CURRENT_THERAPIST_ID = "therapist-anna-reyes";

const learners: Learner[] = [
    {
        id: "learner-lea-sarsoza",
        name: "Lea Sarsoza",
    },
    {
        id: "learner-albus-severus",
        name: "Albus Severus",
    },
];

const pad = (value: number) => {
    return String(value).padStart(2, "0");
};

const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${pad(
        date.getMonth() + 1
    )}-${pad(date.getDate())}`;
};

const dateFromKey = (dateKey: string) => {
    const [year, month, day] = dateKey
        .split("-")
        .map(Number);

    return new Date(year, month - 1, day);
};

const addDays = (date: Date, days: number) => {
    const nextDate = new Date(date);

    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
};

const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatTime = (time: string) => {
    if (!time) {
        return "No time set";
    }

    const [hourValue, minute] = time.split(":");
    const hour = Number(hourValue);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${period}`;
};

const getStatusLabel = (
    status: ScheduleStatus
) => {
    switch (status) {
        case "pending":
            return "Pending Approval";

        case "confirmed":
            return "Confirmed";

        case "declined":
            return "Declined";

        case "cancelled":
            return "Cancelled";

        default:
            return "Pending Approval";
    }
};

const getStatusStyle = (
    status: ScheduleStatus
) => {
    switch (status) {
        case "pending":
            return "text-amber-700";

        case "confirmed":
            return "text-emerald-700";

        case "declined":
            return "text-red-600";

        case "cancelled":
            return "text-gray-500";

        default:
            return "text-amber-700";
    }
};

const getStatusDotStyle = (
    status: ScheduleStatus
) => {
    switch (status) {
        case "pending":
            return "bg-amber-400";

        case "confirmed":
            return "bg-emerald-500";

        case "declined":
            return "bg-red-500";

        case "cancelled":
            return "bg-gray-400";

        default:
            return "bg-amber-400";
    }
};

const TherapistSchedule = () => {
    const dateInputRef =
        useRef<HTMLInputElement | null>(null);

    const [selectedDate, setSelectedDate] =
        useState<Date>(new Date());

    const [searchTerm, setSearchTerm] =
        useState("");

    const [approvalTarget, setApprovalTarget] =
        useState<ScheduleItem | null>(null);

    const [actionMessage, setActionMessage] =
        useState("");

    const selectedDateKey =
        getDateKey(selectedDate);

    const [schedules, setSchedules] =
        useState<ScheduleItem[]>(() => {
            const today = new Date();
            const todayKey = getDateKey(today);

            const tomorrowKey = getDateKey(
                addDays(today, 1)
            );

            return [
                {
                    id: "schedule-001",
                    dateKey: todayKey,
                    time: "08:00",
                    therapistId:
                        CURRENT_THERAPIST_ID,
                    learnerId:
                        "learner-lea-sarsoza",
                    durationMinutes: 45,
                    status: "confirmed",
                    notes:
                        "Speech warm-up followed by guided word practice.",
                    assignedBy:
                        "Abled Minds Therapy Center",
                },
                {
                    id: "schedule-002",
                    dateKey: todayKey,
                    time: "09:30",
                    therapistId:
                        CURRENT_THERAPIST_ID,
                    learnerId:
                        "learner-albus-severus",
                    durationMinutes: 40,
                    status: "pending",
                    notes:
                        "Word-level activity focusing on familiar objects.",
                    assignedBy:
                        "Abled Minds Therapy Center",
                },
                {
                    id: "schedule-003",
                    dateKey: todayKey,
                    time: "11:00",
                    therapistId:
                        CURRENT_THERAPIST_ID,
                    learnerId:
                        "learner-lea-sarsoza",
                    durationMinutes: 50,
                    status: "pending",
                    notes:
                        "Practice greetings, turn-taking, and simple conversation.",
                    assignedBy:
                        "Abled Minds Therapy Center",
                },
                {
                    id: "schedule-004",
                    dateKey: todayKey,
                    time: "13:30",
                    therapistId:
                        CURRENT_THERAPIST_ID,
                    learnerId:
                        "learner-albus-severus",
                    durationMinutes: 45,
                    status: "cancelled",
                    notes:
                        "Session cancelled by the center.",
                    assignedBy:
                        "Abled Minds Therapy Center",
                },
                {
                    id: "schedule-005",
                    dateKey: tomorrowKey,
                    time: "10:00",
                    therapistId:
                        CURRENT_THERAPIST_ID,
                    learnerId:
                        "learner-lea-sarsoza",
                    durationMinutes: 50,
                    status: "pending",
                    notes:
                        "Continue practicing social greetings and responses.",
                    assignedBy:
                        "Abled Minds Therapy Center",
                },
            ];
        });

    const getLearner = (
        learnerId: string
    ) => {
        return learners.find(
            (learner) =>
                learner.id === learnerId
        );
    };

    const schedulesForSelectedDate =
        useMemo(() => {
            return schedules
                .filter(
                    (schedule) =>
                        schedule.therapistId ===
                            CURRENT_THERAPIST_ID &&
                        schedule.dateKey ===
                            selectedDateKey
                )
                .sort(
                    (
                        firstSchedule,
                        secondSchedule
                    ) =>
                        firstSchedule.time.localeCompare(
                            secondSchedule.time
                        )
                );
        }, [schedules, selectedDateKey]);

    const filteredSchedules =
        useMemo(() => {
            const normalizedSearch =
                searchTerm
                    .trim()
                    .toLowerCase();

            return schedulesForSelectedDate.filter(
                (schedule) => {
                    const learner =
                        getLearner(
                            schedule.learnerId
                        );

                    const searchableText = [
                        formatTime(
                            schedule.time
                        ),
                        learner?.name ?? "",
                        `${schedule.durationMinutes} minutes`,
                        schedule.notes ?? "",
                        schedule.assignedBy ??
                            "",
                        getStatusLabel(
                            schedule.status
                        ),
                    ]
                        .join(" ")
                        .toLowerCase();

                    return searchableText.includes(
                        normalizedSearch
                    );
                }
            );
        }, [
            schedulesForSelectedDate,
            searchTerm,
        ]);

    const openDatePicker = () => {
        const input =
            dateInputRef.current as
                | (HTMLInputElement & {
                      showPicker?: () => void;
                  })
                | null;

        if (input?.showPicker) {
            input.showPicker();
            return;
        }

        input?.click();
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const goToPreviousDay = () => {
        setSelectedDate(
            (currentDate) =>
                addDays(currentDate, -1)
        );
    };

    const goToNextDay = () => {
        setSelectedDate(
            (currentDate) =>
                addDays(currentDate, 1)
        );
    };

    const openApprovalModal = (
        schedule: ScheduleItem
    ) => {
        if (schedule.status !== "pending") {
            return;
        }

        setApprovalTarget(schedule);
    };

    const closeApprovalModal = () => {
        setApprovalTarget(null);
    };

    const handleApproveSchedule = () => {
        if (!approvalTarget) {
            return;
        }

        setSchedules(
            (currentSchedules) =>
                currentSchedules.map(
                    (schedule) =>
                        schedule.id ===
                        approvalTarget.id
                            ? {
                                  ...schedule,
                                  status:
                                      "confirmed",
                              }
                            : schedule
                )
        );

        setApprovalTarget(null);

        setActionMessage(
            "Schedule approved successfully."
        );

        window.setTimeout(() => {
            setActionMessage("");
        }, 2500);

        /*
         * Later backend call:
         *
         * PATCH /api/therapist/schedules/:scheduleId/approve
         *
         * The backend should verify:
         * 1. The schedule belongs to the logged-in therapist.
         * 2. The schedule is still pending.
         * 3. The therapist is allowed to approve it.
         */
    };

    return (
        <TherapistLayout>
            {(
                sidebarOpen,
                setSidebarOpen
            ) => (
                <div className="inter relative flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] bg-[#E4C9E5]/80 p-4 sm:p-6 lg:p-8">
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
                                Schedule
                            </h1>
                        </div>

                        {/* SEARCH */}
                        <div className="flex w-full items-center rounded-xl border border-white/80 bg-[#F8F3F8] px-4 py-2.5 xl:w-[360px]">
                            <Search
                                size={19}
                                className="mr-3 shrink-0 text-gray-400"
                            />

                            <input
                                type="search"
                                placeholder="Search schedule"
                                value={
                                    searchTerm
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearchTerm(
                                        event.target
                                            .value
                                    )
                                }
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
                                    className="ml-2 rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-700"
                                    aria-label="Clear search"
                                >
                                    <X
                                        size={15}
                                    />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="my-5 border-b border-gray-400/50" />

                    {/* PAGE CONTENT */}
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <section className="overflow-hidden rounded-[20px] bg-white">
                            {/* DATE HEADER */}
                            <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                        {formatFullDate(
                                            selectedDate
                                        )}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {
                                            schedulesForSelectedDate.length
                                        }{" "}
                                        session
                                        {schedulesForSelectedDate.length ===
                                        1
                                            ? ""
                                            : "s"}
                                    </p>
                                </div>

                                {/* DATE CONTROLS */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                                        <button
                                            type="button"
                                            onClick={
                                                openDatePicker
                                            }
                                            className="flex h-10 items-center gap-2 border-r border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                                        >
                                            <CalendarDays
                                                size={
                                                    17
                                                }
                                            />

                                            <span className="hidden sm:inline">
                                                Calendar
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={
                                                goToPreviousDay
                                            }
                                            className="flex h-10 w-10 items-center justify-center border-r border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                                            aria-label="Previous day"
                                        >
                                            <ChevronLeft
                                                size={
                                                    18
                                                }
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={
                                                goToNextDay
                                            }
                                            className="flex h-10 w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                                            aria-label="Next day"
                                        >
                                            <ChevronRight
                                                size={
                                                    18
                                                }
                                            />
                                        </button>
                                    </div>

                                    <input
                                        ref={
                                            dateInputRef
                                        }
                                        type="date"
                                        value={
                                            selectedDateKey
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            if (
                                                !event
                                                    .target
                                                    .value
                                            ) {
                                                return;
                                            }

                                            setSelectedDate(
                                                dateFromKey(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            );
                                        }}
                                        className="sr-only"
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            goToToday
                                        }
                                        className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        Today
                                    </button>
                                </div>
                            </div>

                            {/* TABLE HEADER */}
                            <div className="hidden border-y border-gray-100 bg-[#FAF8FA] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid md:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_145px_minmax(0,1fr)_110px] md:gap-4">
                                <span>
                                    Time
                                </span>

                                <span>
                                    Learner
                                </span>

                                <span>
                                    Duration
                                </span>

                                <span>
                                    Status
                                </span>

                                <span>
                                    Notes
                                </span>

                                <span className="text-right">
                                    Action
                                </span>
                            </div>

                            {/* SCHEDULE ROWS */}
                            {filteredSchedules.length >
                            0 ? (
                                <div>
                                    {filteredSchedules.map(
                                        (
                                            schedule
                                        ) => {
                                            const learner =
                                                getLearner(
                                                    schedule.learnerId
                                                );

                                            return (
                                                <article
                                                    key={
                                                        schedule.id
                                                    }
                                                    className="border-b border-gray-100 bg-white px-5 py-4 transition last:border-b-0 hover:bg-gray-50/70 md:grid md:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_145px_minmax(0,1fr)_110px] md:items-center md:gap-4"
                                                >
                                                    {/* TIME */}
                                                    <div className="mb-3 md:mb-0">
                                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                                                            Time
                                                        </p>

                                                        <p className="text-sm font-bold text-gray-900">
                                                            {formatTime(
                                                                schedule.time
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* LEARNER */}
                                                    <div className="mb-3 min-w-0 md:mb-0">
                                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                                                            Learner
                                                        </p>

                                                        <p className="truncate text-sm font-semibold text-gray-900">
                                                            {learner?.name ??
                                                                "Unknown learner"}
                                                        </p>
                                                    </div>

                                                    {/* DURATION */}
                                                    <div className="mb-3 min-w-0 md:mb-0">
                                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                                                            Duration
                                                        </p>

                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {
                                                                schedule.durationMinutes
                                                            }{" "}
                                                            minutes
                                                        </p>
                                                    </div>

                                                    {/* STATUS */}
                                                    <div className="mb-3 md:mb-0">
                                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                                                            Status
                                                        </p>

                                                        <div className="inline-flex items-center gap-2">
                                                            <span
                                                                className={`h-2 w-2 shrink-0 rounded-full ${getStatusDotStyle(
                                                                    schedule.status
                                                                )}`}
                                                            />

                                                            <span
                                                                className={`text-sm font-semibold ${getStatusStyle(
                                                                    schedule.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    schedule.status
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* NOTES */}
                                                    <div className="mb-4 min-w-0 md:mb-0">
                                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                                                            Notes
                                                        </p>

                                                        <p className="line-clamp-2 text-sm leading-5 text-gray-500">
                                                            {schedule.notes ||
                                                                "No notes added"}
                                                        </p>
                                                    </div>

                                                    {/* ACTION */}
                                                    <div className="flex justify-start md:justify-end">
                                                        {schedule.status ===
                                                        "pending" ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openApprovalModal(
                                                                        schedule
                                                                    )
                                                                }
                                                                className="flex items-center justify-center gap-1.5 rounded-lg border border-[#D9C7DD] bg-white px-3 py-2 text-sm font-semibold text-[#82548C] transition hover:bg-[#F7F1F8]"
                                                                aria-label={`Approve ${
                                                                    learner?.name ??
                                                                    "learner"
                                                                }'s session`}
                                                            >
                                                                <Check
                                                                    size={
                                                                        16
                                                                    }
                                                                />

                                                                Approve
                                                            </button>
                                                        ) : schedule.status ===
                                                          "confirmed" ? (
                                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                                                                <CheckCircle2
                                                                    size={
                                                                        17
                                                                    }
                                                                />

                                                                Approved
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">
                                                                No
                                                                action
                                                            </span>
                                                        )}
                                                    </div>
                                                </article>
                                            );
                                        }
                                    )}
                                </div>
                            ) : (
                                <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EEF6] text-[#82548C]">
                                        <CalendarDays
                                            size={
                                                26
                                            }
                                        />
                                    </div>

                                    <h3 className="mt-4 text-xl font-bold text-gray-900">
                                        No assigned
                                        sessions
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                                        You do not have
                                        any assigned
                                        sessions matching
                                        this date or
                                        search.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* SUCCESS MESSAGE */}
                    {actionMessage && (
                        <div
                            role="status"
                            className="fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg"
                        >
                            <CheckCircle2
                                size={18}
                            />

                            {actionMessage}
                        </div>
                    )}

                    {/* APPROVAL MODAL */}
                    {approvalTarget && (
                        <div
                            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-[2px]"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="approve-session-title"
                        >
                            <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl">
                                {/* MODAL HEADER */}
                                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#95609F]">
                                            Schedule
                                            approval
                                        </p>

                                        <h2
                                            id="approve-session-title"
                                            className="mt-1 text-xl font-bold text-gray-900"
                                        >
                                            Approve this
                                            session?
                                        </h2>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            closeApprovalModal
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                        aria-label="Close approval modal"
                                    >
                                        <X
                                            size={
                                                19
                                            }
                                        />
                                    </button>
                                </div>

                                {/* SESSION DETAILS */}
                                <div className="px-6 py-5">
                                    <div className="border-b border-gray-100 pb-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5EEF6] text-[#82548C]">
                                                <UserRound
                                                    size={
                                                        18
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-bold text-gray-900">
                                                    {getLearner(
                                                        approvalTarget.learnerId
                                                    )
                                                        ?.name ??
                                                        "Unknown learner"}
                                                </p>

                                                <p className="mt-2 text-sm font-medium text-[#82548C]">
                                                    {formatFullDate(
                                                        dateFromKey(
                                                            approvalTarget.dateKey
                                                        )
                                                    )}{" "}
                                                    at{" "}
                                                    {formatTime(
                                                        approvalTarget.time
                                                    )}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {
                                                        approvalTarget.durationMinutes
                                                    }{" "}
                                                    minutes
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-5 text-sm leading-6 text-gray-600">
                                        Approving confirms
                                        that you are
                                        available and
                                        accepting this
                                        assigned session.
                                    </p>

                                    {approvalTarget.assignedBy && (
                                        <div className="mt-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Assigned
                                                by
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {
                                                    approvalTarget.assignedBy
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {approvalTarget.notes && (
                                        <div className="mt-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Session
                                                notes
                                            </p>

                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                {
                                                    approvalTarget.notes
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* MODAL ACTIONS */}
                                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={
                                            closeApprovalModal
                                        }
                                        className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleApproveSchedule
                                        }
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#82548C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#704578]"
                                    >
                                        <Check
                                            size={
                                                17
                                            }
                                        />

                                        Confirm Approval
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

export default TherapistSchedule;