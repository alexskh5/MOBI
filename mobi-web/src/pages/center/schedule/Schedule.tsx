import { useMemo, useRef, useState } from "react";
import {
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  PencilLine,
  Trash2,
  X,
  UserRound,
  Save,
  Users,
} from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";

type Therapist = {
  id: string;
  name: string;
  role: string;
};

type Learner = {
  id: string;
  name: string;
};

type ScheduleStatus = "pending" | "confirmed" | "declined" | "cancelled";

type ScheduleItem = {
  id: string;
  dateKey: string;
  time: string;
  therapistId: string;
  learnerId: string;
  status: ScheduleStatus;
  notes?: string;
};

const therapists: Therapist[] = [
  { id: "t1", name: "Ruby Jane", role: "Occupational Therapist" },
  { id: "t2", name: "Mia Santos", role: "Speech Therapist" },
  { id: "t3", name: "Angela Cruz", role: "Behavior Therapist" },
  { id: "t4", name: "Carla Reyes", role: "Speech Therapist" },
  { id: "t5", name: "Nina Dela Cruz", role: "Occupational Therapist" },
];

const learners: Learner[] = [
  { id: "l1", name: "Lexi Pantaleon" },
  { id: "l2", name: "Jane Lee" },
  { id: "l3", name: "Ron Weasley" },
  { id: "l4", name: "Ginny Weasley" },
  { id: "l5", name: "Lesley Baguio" },
  { id: "l6", name: "Lea Sarsoza" },
  { id: "l7", name: "Harry Potter" },
  { id: "l8", name: "Albus Severus" },
  { id: "l9", name: "George Weasley" },
];

const pad = (value: number) => String(value).padStart(2, "0");

const getDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

const dateFromKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
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
  if (!time) return "No time set";

  const [hourValue, minute] = time.split(":");
  const hour = Number(hourValue);

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
};

const getStatusLabel = (status: ScheduleStatus) => {
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

const getStatusStyle = (status: ScheduleStatus) => {
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

const getStatusDotStyle = (status: ScheduleStatus) => {
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

const Schedule = () => {
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const selectedDateKey = getDateKey(selectedDate);

  const [searchTerm, setSearchTerm] = useState("");
  const [therapistSearch, setTherapistSearch] = useState("");
  const [learnerSearch, setLearnerSearch] = useState("");

  const [editingSchedule, setEditingSchedule] =
    useState<ScheduleItem | null>(null);

  const [editingExistingId, setEditingExistingId] =
    useState<string | null>(null);

  const [editorError, setEditorError] = useState("");

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    const todayKey = getDateKey(new Date());

    return [
      {
        id: "s1",
        dateKey: todayKey,
        time: "08:00",
        therapistId: "t1",
        learnerId: "l1",
        status: "confirmed",
        notes: "Speech warm-up and guided practice.",
      },
      {
        id: "s2",
        dateKey: todayKey,
        time: "09:30",
        therapistId: "t1",
        learnerId: "l2",
        status: "pending",
        notes: "Word activity session.",
      },
      {
        id: "s3",
        dateKey: todayKey,
        time: "11:00",
        therapistId: "t2",
        learnerId: "l3",
        status: "pending",
        notes: "Social readiness activity.",
      },
      {
        id: "s4",
        dateKey: todayKey,
        time: "13:00",
        therapistId: "t3",
        learnerId: "l4",
        status: "confirmed",
        notes: "Conversation practice.",
      },
    ];
  });

  const getTherapist = (therapistId: string) => {
    return therapists.find((therapist) => therapist.id === therapistId);
  };

  const getLearner = (learnerId: string) => {
    return learners.find((learner) => learner.id === learnerId);
  };

  const schedulesForSelectedDate = useMemo(() => {
    return schedules
      .filter((schedule) => schedule.dateKey === selectedDateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [schedules, selectedDateKey]);

  const filteredSchedules = useMemo(() => {
    return schedulesForSelectedDate.filter((schedule) => {
      const therapist = getTherapist(schedule.therapistId);
      const learner = getLearner(schedule.learnerId);

      const searchableText = `${formatTime(schedule.time)} ${
        therapist?.name ?? ""
      } ${therapist?.role ?? ""} ${learner?.name ?? ""} ${
        schedule.notes ?? ""
      } ${getStatusLabel(schedule.status)}`.toLowerCase();

      return searchableText.includes(searchTerm.toLowerCase());
    });
  }, [schedulesForSelectedDate, searchTerm]);

  const filteredTherapists = useMemo(() => {
    return therapists
      .filter((therapist) => {
        const searchableText = `${therapist.name} ${therapist.role}`.toLowerCase();
        return searchableText.includes(therapistSearch.toLowerCase());
      })
      .sort((a, b) => {
        if (!editingSchedule) return 0;

        if (a.id === editingSchedule.therapistId) return -1;
        if (b.id === editingSchedule.therapistId) return 1;

        return a.name.localeCompare(b.name);
      });
  }, [therapistSearch, editingSchedule]);

  const filteredLearners = useMemo(() => {
    return learners
      .filter((learner) => {
        return learner.name.toLowerCase().includes(learnerSearch.toLowerCase());
      })
      .sort((a, b) => {
        if (!editingSchedule) return 0;

        if (a.id === editingSchedule.learnerId) return -1;
        if (b.id === editingSchedule.learnerId) return 1;

        return a.name.localeCompare(b.name);
      });
  }, [learnerSearch, editingSchedule]);

  const openDatePicker = () => {
    const input = dateInputRef.current as
      | (HTMLInputElement & { showPicker?: () => void })
      | null;

    if (input?.showPicker) {
      input.showPicker();
    } else {
      input?.click();
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const goToPreviousDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const openAddSchedule = () => {
    setEditorError("");
    setEditingExistingId(null);
    setTherapistSearch("");
    setLearnerSearch("");

    setEditingSchedule({
      id: `schedule-${Date.now()}`,
      dateKey: selectedDateKey,
      time: "",
      therapistId: "",
      learnerId: "",
      status: "pending",
      notes: "",
    });
  };

  const openEditSchedule = (schedule: ScheduleItem) => {
    setEditorError("");
    setEditingExistingId(schedule.id);
    setTherapistSearch("");
    setLearnerSearch("");
    setEditingSchedule({ ...schedule });
  };

  const closeEditor = () => {
    setEditingSchedule(null);
    setEditingExistingId(null);
    setEditorError("");
    setTherapistSearch("");
    setLearnerSearch("");
  };

  const updateEditingSchedule = (updates: Partial<ScheduleItem>) => {
    setEditingSchedule((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        ...updates,
      };
    });
  };

  const saveSchedule = () => {
    if (!editingSchedule) return;

    if (
      !editingSchedule.dateKey ||
      !editingSchedule.time ||
      !editingSchedule.therapistId ||
      !editingSchedule.learnerId
    ) {
      setEditorError("Please select a date, time, therapist, and learner.");
      return;
    }

    const hasConflict = schedules.some((schedule) => {
      const isSameSchedule = schedule.id === editingExistingId;

      if (isSameSchedule) return false;

      const sameDateAndTime =
        schedule.dateKey === editingSchedule.dateKey &&
        schedule.time === editingSchedule.time;

      const sameTherapist =
        schedule.therapistId === editingSchedule.therapistId;

      const sameLearner = schedule.learnerId === editingSchedule.learnerId;

      return sameDateAndTime && (sameTherapist || sameLearner);
    });

    if (hasConflict) {
      setEditorError(
        "This time already has the same therapist or learner assigned."
      );
      return;
    }

    setSchedules((prev) => {
      if (editingExistingId) {
        return prev.map((schedule) =>
          schedule.id === editingExistingId ? editingSchedule : schedule
        );
      }

      return [...prev, editingSchedule];
    });

    setSelectedDate(dateFromKey(editingSchedule.dateKey));

    console.log("Automatic notification should be sent:", {
      therapistId: editingSchedule.therapistId,
      learnerId: editingSchedule.learnerId,
      schedule: editingSchedule,
    });

    closeEditor();
  };

  const deleteSchedule = (scheduleId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this schedule?"
    );

    if (!confirmed) return;

    setSchedules((prev) =>
      prev.filter((schedule) => schedule.id !== scheduleId)
    );

    if (editingExistingId === scheduleId) {
      closeEditor();
    }
  };

  return (
    <CenterLayout>
        {(sidebarOpen, setSidebarOpen) => (
            <div className="inter flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] bg-[#E4C9E5]/80 p-4 sm:p-6 lg:p-8">
                {/* PAGE HEADER */}
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
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

                    <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                        {/* SEARCH */}
                        <div className="flex w-full items-center rounded-xl border border-white/80 bg-[#F8F3F8] px-4 py-2.5 xl:w-[360px]">
                            <Search
                                size={19}
                                className="mr-3 shrink-0 text-gray-400"
                            />

                            <input
                                type="text"
                                placeholder="Search schedule"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                className="w-full bg-transparent text-sm outline-none sm:text-base"
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    className="ml-2 rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-700"
                                    aria-label="Clear search"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        {/* ADD SESSION */}
                        <button
                            type="button"
                            onClick={openAddSchedule}
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#82548C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#704578] sm:text-base"
                        >
                            <Plus size={18} />
                            Add Session
                        </button>
                    </div>
                </div>

                <div className="my-5 border-b border-gray-400/50" />

                {/* PAGE CONTENT */}
                <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div
                        className={`grid gap-5 ${
                            editingSchedule
                                ? "xl:grid-cols-[minmax(0,1fr)_360px]"
                                : "grid-cols-1"
                        }`}
                    >
                        {/* SCHEDULE LIST */}
                        <section className="overflow-hidden rounded-[20px] bg-white">
                            {/* DATE HEADER */}
                            <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                        {formatFullDate(selectedDate)}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {schedulesForSelectedDate.length} session
                                        {schedulesForSelectedDate.length === 1
                                            ? ""
                                            : "s"}
                                    </p>
                                </div>

                                {/* DATE CONTROLS */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white">
                                        <button
                                            type="button"
                                            onClick={openDatePicker}
                                            className="flex h-10 items-center gap-2 border-r border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                                        >
                                            <CalendarDays size={17} />
                                            <span className="hidden sm:inline">
                                                Calendar
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={goToPreviousDay}
                                            className="flex h-10 w-10 items-center justify-center border-r border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                                            aria-label="Previous day"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={goToNextDay}
                                            className="flex h-10 w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                                            aria-label="Next day"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        value={selectedDateKey}
                                        onChange={(event) => {
                                            if (!event.target.value) {
                                                return;
                                            }

                                            setSelectedDate(
                                                dateFromKey(event.target.value)
                                            );
                                        }}
                                        className="sr-only"
                                    />

                                    <button
                                        type="button"
                                        onClick={goToToday}
                                        className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        Today
                                    </button>
                                </div>
                            </div>

                            {/* TABLE HEADER */}
                            <div className="hidden border-y border-gray-100 bg-[#FAF8FA] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 md:grid md:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_145px_minmax(0,1fr)_90px] md:gap-4">
                                <span>Time</span>
                                <span>Therapist</span>
                                <span>Learner</span>
                                <span>Status</span>
                                <span>Notes</span>
                                <span className="text-right">Actions</span>
                            </div>

                            {/* SCHEDULE ROWS */}
                            {filteredSchedules.length > 0 ? (
                                <div>
                                    {filteredSchedules.map((schedule) => {
                                        const therapist = getTherapist(
                                            schedule.therapistId
                                        );

                                        const learner = getLearner(
                                            schedule.learnerId
                                        );

                                        const isEditing =
                                            editingExistingId === schedule.id;

                                        return (
                                            <article
                                                key={schedule.id}
                                                className={`border-b border-gray-100 px-5 py-4 transition last:border-b-0 md:grid md:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_145px_minmax(0,1fr)_90px] md:items-center md:gap-4 ${
                                                    isEditing
                                                        ? "bg-[#FBF6FC]"
                                                        : "bg-white hover:bg-gray-50/70"
                                                }`}
                                            >
                                                {/* TIME */}
                                                <div className="mb-3 md:mb-0">
                                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                                                        Time
                                                    </p>

                                                    <p className="text-sm font-bold text-gray-900">
                                                        {formatTime(schedule.time)}
                                                    </p>
                                                </div>

                                                {/* THERAPIST */}
                                                <div className="mb-3 min-w-0 md:mb-0">
                                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                                                        Therapist
                                                    </p>

                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {therapist?.name ??
                                                            "No therapist selected"}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-xs text-gray-500">
                                                        {therapist?.role ??
                                                            "Therapist role"}
                                                    </p>
                                                </div>

                                                {/* LEARNER */}
                                                <div className="mb-3 min-w-0 md:mb-0">
                                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 md:hidden">
                                                        Learner
                                                    </p>

                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {learner?.name ??
                                                            "No learner selected"}
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

                                                {/* ACTIONS */}
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditSchedule(
                                                                schedule
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#F1E7F3] hover:text-[#82548C]"
                                                        aria-label="Edit session"
                                                        title="Edit session"
                                                    >
                                                        <PencilLine size={17} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteSchedule(
                                                                schedule.id
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                        aria-label="Delete session"
                                                        title="Delete session"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EEF6] text-[#82548C]">
                                        <CalendarDays size={26} />
                                    </div>

                                    <h3 className="mt-4 text-xl font-bold text-gray-900">
                                        No sessions scheduled
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                                        There are no sessions assigned for this
                                        date.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={openAddSchedule}
                                        className="mt-5 flex items-center gap-2 rounded-xl bg-[#82548C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#704578]"
                                    >
                                        <Plus size={17} />
                                        Add Session
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* ADD / EDIT PANEL */}
                        {editingSchedule && (
                            <aside className="overflow-hidden rounded-[24px] bg-white xl:sticky xl:top-0 xl:self-start">
                                {/* EDITOR HEADER */}
                                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-5">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#95609F]">
                                            {editingExistingId
                                                ? "Edit session"
                                                : "New session"}
                                        </p>

                                        <h3 className="mt-1 text-xl font-bold text-gray-900">
                                            Assign Session
                                        </h3>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={closeEditor}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                        aria-label="Close session editor"
                                    >
                                        <X size={19} />
                                    </button>
                                </div>

                                <div className="space-y-5 px-5 py-5">
                                    {/* DATE AND TIME */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Date
                                            </label>

                                            <input
                                                type="date"
                                                value={editingSchedule.dateKey}
                                                onChange={(event) =>
                                                    updateEditingSchedule({
                                                        dateKey:
                                                            event.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#82548C] focus:ring-2 focus:ring-[#82548C]/10"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Time
                                            </label>

                                            <input
                                                type="time"
                                                value={editingSchedule.time}
                                                onChange={(event) =>
                                                    updateEditingSchedule({
                                                        time: event.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#82548C] focus:ring-2 focus:ring-[#82548C]/10"
                                            />
                                        </div>
                                    </div>

                                    {/* THERAPIST */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Assigned Therapist
                                        </label>

                                        <div className="mb-2 flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                                            <Search
                                                size={16}
                                                className="mr-2 shrink-0 text-gray-400"
                                            />

                                            <input
                                                type="text"
                                                placeholder="Search therapist"
                                                value={therapistSearch}
                                                onChange={(event) =>
                                                    setTherapistSearch(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full bg-transparent text-sm outline-none"
                                            />
                                        </div>

                                        <div className="max-h-48 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            {filteredTherapists.length > 0 ? (
                                                filteredTherapists.map(
                                                    (therapist) => {
                                                        const isSelected =
                                                            editingSchedule.therapistId ===
                                                            therapist.id;

                                                        return (
                                                            <button
                                                                key={
                                                                    therapist.id
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    updateEditingSchedule(
                                                                        {
                                                                            therapistId:
                                                                                therapist.id,
                                                                        }
                                                                    )
                                                                }
                                                                className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                                                                    isSelected
                                                                        ? "bg-[#F7F1F8]"
                                                                        : "hover:bg-gray-50"
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                                        isSelected
                                                                            ? "bg-[#82548C] text-white"
                                                                            : "bg-[#F4EEF5] text-[#82548C]"
                                                                    }`}
                                                                >
                                                                    <UserRound
                                                                        size={16}
                                                                    />
                                                                </span>

                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                                        {
                                                                            therapist.name
                                                                        }
                                                                    </p>

                                                                    <p className="truncate text-xs text-gray-500">
                                                                        {
                                                                            therapist.role
                                                                        }
                                                                    </p>
                                                                </div>

                                                                {isSelected && (
                                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#82548C]" />
                                                                )}
                                                            </button>
                                                        );
                                                    }
                                                )
                                            ) : (
                                                <p className="px-4 py-4 text-center text-sm text-gray-500">
                                                    No therapist found.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* LEARNER */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Learner
                                        </label>

                                        <div className="mb-2 flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                                            <Search
                                                size={16}
                                                className="mr-2 shrink-0 text-gray-400"
                                            />

                                            <input
                                                type="text"
                                                placeholder="Search learner"
                                                value={learnerSearch}
                                                onChange={(event) =>
                                                    setLearnerSearch(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full bg-transparent text-sm outline-none"
                                            />
                                        </div>

                                        <div className="max-h-48 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            {filteredLearners.length > 0 ? (
                                                filteredLearners.map(
                                                    (learner) => {
                                                        const isSelected =
                                                            editingSchedule.learnerId ===
                                                            learner.id;

                                                        return (
                                                            <button
                                                                key={learner.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    updateEditingSchedule(
                                                                        {
                                                                            learnerId:
                                                                                learner.id,
                                                                        }
                                                                    )
                                                                }
                                                                className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                                                                    isSelected
                                                                        ? "bg-[#F7F1F8]"
                                                                        : "hover:bg-gray-50"
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                                        isSelected
                                                                            ? "bg-[#82548C] text-white"
                                                                            : "bg-[#F4EEF5] text-[#82548C]"
                                                                    }`}
                                                                >
                                                                    <Users
                                                                        size={16}
                                                                    />
                                                                </span>

                                                                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
                                                                    {learner.name}
                                                                </p>

                                                                {isSelected && (
                                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#82548C]" />
                                                                )}
                                                            </button>
                                                        );
                                                    }
                                                )
                                            ) : (
                                                <p className="px-4 py-4 text-center text-sm text-gray-500">
                                                    No learner found.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* NOTES */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Notes
                                        </label>

                                        <textarea
                                            value={
                                                editingSchedule.notes ?? ""
                                            }
                                            onChange={(event) =>
                                                updateEditingSchedule({
                                                    notes: event.target.value,
                                                })
                                            }
                                            placeholder="Add optional session notes..."
                                            rows={4}
                                            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#82548C] focus:ring-2 focus:ring-[#82548C]/10"
                                        />
                                    </div>

                                    {editorError && (
                                        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                            {editorError}
                                        </p>
                                    )}

                                    {/* ACTIONS */}
                                    <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row xl:flex-col-reverse">
                                        <button
                                            type="button"
                                            onClick={closeEditor}
                                            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={saveSchedule}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#82548C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#704578]"
                                        >
                                            <Save size={17} />

                                            {editingExistingId
                                                ? "Save Changes"
                                                : "Add Session"}
                                        </button>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </div>
        )}
    </CenterLayout>
);
};

export default Schedule;