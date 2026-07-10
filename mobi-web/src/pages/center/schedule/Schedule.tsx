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
      return "bg-yellow-100 text-yellow-700";
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "declined":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-yellow-100 text-yellow-700";
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
        <div className="inter flex h-full flex-col overflow-hidden rounded-[30px] bg-[#E4C9E5]/80 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  className="text-3xl"
                  onClick={() => setSidebarOpen(true)}
                >
                  ☰
                </button>
              )}

              <h1 className="itim text-4xl font-medium sm:text-5xl">
                Schedule
              </h1>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto] xl:w-auto xl:grid-cols-[360px_auto]">
              <div className="flex items-center rounded-xl bg-[#F5EEF6] px-4 py-3 shadow-md">
                <Search size={20} className="mr-3 text-gray-500" />

                <input
                  type="text"
                  placeholder="Search schedule"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none sm:text-base"
                />
              </div>

              <button
                onClick={openAddSchedule}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#9021C4] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#7D1AAC] sm:text-base"
              >
                <Plus size={18} />
                Add Session
              </button>
            </div>
          </div>

          <div className="my-5 border-b border-gray-400/60" />

          <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              className={`grid gap-5 ${
                editingSchedule
                  ? "xl:grid-cols-[minmax(0,1fr)_380px]"
                  : "grid-cols-1"
              }`}
            >
              <section className="rounded-3xl border border-white bg-white/65 p-4 shadow-sm sm:p-5">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {formatFullDate(selectedDate)}
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-gray-500">
                      {schedulesForSelectedDate.length} session
                      {schedulesForSelectedDate.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={openDatePicker}
                      className="flex items-center gap-2 rounded-xl border border-[#D8B7DD] bg-white px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-[#F8EFF9]"
                    >
                      <CalendarDays size={18} />
                      Calendar
                    </button>

                    <input
                      ref={dateInputRef}
                      type="date"
                      value={selectedDateKey}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        setSelectedDate(dateFromKey(event.target.value));
                      }}
                      className="sr-only"
                    />

                    <button
                      onClick={goToPreviousDay}
                      className="rounded-xl border border-[#D8B7DD] bg-white p-3 shadow-sm transition hover:bg-[#F8EFF9]"
                      aria-label="Previous day"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      onClick={goToNextDay}
                      className="rounded-xl border border-[#D8B7DD] bg-white p-3 shadow-sm transition hover:bg-[#F8EFF9]"
                      aria-label="Next day"
                    >
                      <ChevronRight size={20} />
                    </button>

                    <button
                      onClick={goToToday}
                      className="rounded-xl border border-[#D8B7DD] bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:bg-[#F8EFF9]"
                    >
                      Today
                    </button>
                  </div>
                </div>

                <div className="hidden rounded-2xl bg-[#F5EEF6] px-4 py-3 text-sm font-bold text-gray-600 md:grid md:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)_150px_minmax(0,1fr)_155px]">
                  <span>Time</span>
                  <span>Therapist</span>
                  <span>Learner</span>
                  <span>Status</span>
                  <span>Notes</span>
                  <span className="text-right">Actions</span>
                </div>

                <div className="mt-3 space-y-3">
                  {filteredSchedules.length > 0 ? (
                    filteredSchedules.map((schedule) => {
                      const therapist = getTherapist(schedule.therapistId);
                      const learner = getLearner(schedule.learnerId);
                      const isEditing = editingExistingId === schedule.id;

                      return (
                        <article
                          key={schedule.id}
                          className={`rounded-2xl border p-4 shadow-sm transition md:grid md:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)_150px_minmax(0,1fr)_155px] md:items-center md:gap-3 ${
                            isEditing
                              ? "border-[#9021C4] bg-[#F6E8FA]"
                              : "border-white bg-white"
                          }`}
                        >
                          <div className="mb-3 md:mb-0">
                            <p className="text-xs font-bold uppercase text-gray-400 md:hidden">
                              Time
                            </p>

                            <p className="font-bold text-gray-900">
                              {formatTime(schedule.time)}
                            </p>
                          </div>

                          <div className="mb-3 flex items-center gap-2 md:mb-0">
                            <UserRound
                              size={20}
                              className="shrink-0 text-[#9021C4]"
                            />

                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase text-gray-400 md:hidden">
                                Therapist
                              </p>

                              <p className="truncate font-semibold text-gray-900">
                                {therapist?.name ?? "No therapist selected"}
                              </p>

                              <p className="truncate text-xs text-gray-500">
                                {therapist?.role ?? "Therapist role"}
                              </p>
                            </div>
                          </div>

                          <div className="mb-3 flex items-center gap-2 md:mb-0">
                            <Users
                              size={20}
                              className="shrink-0 text-[#9021C4]"
                            />

                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase text-gray-400 md:hidden">
                                Learner
                              </p>

                              <p className="truncate font-semibold text-gray-900">
                                {learner?.name ?? "No learner selected"}
                              </p>
                            </div>
                          </div>

                          <div className="mb-3 md:mb-0">
                            <p className="text-xs font-bold uppercase text-gray-400 md:hidden">
                              Status
                            </p>

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                                schedule.status
                              )}`}
                            >
                              {getStatusLabel(schedule.status)}
                            </span>
                          </div>

                          <div className="mb-4 md:mb-0">
                            <p className="text-xs font-bold uppercase text-gray-400 md:hidden">
                              Notes
                            </p>

                            <p className="max-h-10 overflow-hidden text-sm text-gray-600">
                              {schedule.notes || "No notes added"}
                            </p>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditSchedule(schedule)}
                              className="flex items-center gap-1 rounded-xl bg-[#F5EEF6] px-3 py-2 text-sm font-semibold text-[#9021C4] transition hover:bg-[#EAD5EF]"
                            >
                              <PencilLine size={16} />
                              Edit
                            </button>

                            <button
                              onClick={() => deleteSchedule(schedule.id)}
                              className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D8B7DD] bg-white/70 p-8 text-center">
                      <CalendarDays size={44} className="mb-3 text-[#9021C4]" />

                      <h3 className="text-2xl font-bold text-gray-900">
                        Schedule is empty
                      </h3>

                      <p className="mt-2 max-w-md text-gray-500">
                        No sessions are assigned for this date yet. Add a
                        session to assign a therapist, learner, date, and time.
                      </p>

                      <button
                        onClick={openAddSchedule}
                        className="mt-5 flex items-center gap-2 rounded-xl bg-[#9021C4] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-[#7D1AAC]"
                      >
                        <Plus size={18} />
                        Add Session
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {editingSchedule && (
                <aside className="rounded-3xl border border-white bg-[#FDFBFD] p-5 shadow-lg xl:sticky xl:top-0 xl:self-start">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        {editingExistingId ? "Edit Schedule" : "Add Schedule"}
                      </p>

                      <h3 className="text-2xl font-bold text-gray-900">
                        Assign Session
                      </h3>
                    </div>

                    <button
                      onClick={closeEditor}
                      className="rounded-xl bg-[#F5EEF6] p-2 transition hover:bg-[#EAD5EF]"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Date
                      </label>

                      <input
                        type="date"
                        value={editingSchedule.dateKey}
                        onChange={(event) =>
                          updateEditingSchedule({
                            dateKey: event.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-[#D8B7DD] bg-white px-4 py-3 outline-none focus:border-[#9021C4]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
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
                        className="w-full rounded-xl border border-[#D8B7DD] bg-white px-4 py-3 outline-none focus:border-[#9021C4]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Assigned Therapist
                      </label>

                      <div className="mb-2 flex items-center rounded-xl border border-[#D8B7DD] bg-white px-3 py-2">
                        <Search size={17} className="mr-2 text-gray-400" />

                        <input
                          type="text"
                          placeholder="Search therapist"
                          value={therapistSearch}
                          onChange={(event) =>
                            setTherapistSearch(event.target.value)
                          }
                          className="w-full bg-transparent text-sm outline-none"
                        />
                      </div>

                      <div className="max-h-48 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {filteredTherapists.length > 0 ? (
                          filteredTherapists.map((therapist) => {
                            const isSelected =
                              editingSchedule.therapistId === therapist.id;

                            return (
                              <button
                                key={therapist.id}
                                onClick={() =>
                                  updateEditingSchedule({
                                    therapistId: therapist.id,
                                  })
                                }
                                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                                  isSelected
                                    ? "border-[#9021C4] bg-[#F6E8FA]"
                                    : "border-[#E7D8EA] bg-white hover:bg-[#F8EFF9]"
                                }`}
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5EEF6] text-[#9021C4]">
                                  <UserRound size={20} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-bold text-gray-900">
                                    {therapist.name}
                                  </p>

                                  <p className="truncate text-xs text-gray-500">
                                    {therapist.role}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <p className="rounded-xl bg-[#F5EEF6] px-4 py-3 text-sm font-semibold text-gray-500">
                            No therapist found.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Learner
                      </label>

                      <div className="mb-2 flex items-center rounded-xl border border-[#D8B7DD] bg-white px-3 py-2">
                        <Search size={17} className="mr-2 text-gray-400" />

                        <input
                          type="text"
                          placeholder="Search learner"
                          value={learnerSearch}
                          onChange={(event) =>
                            setLearnerSearch(event.target.value)
                          }
                          className="w-full bg-transparent text-sm outline-none"
                        />
                      </div>

                      <div className="max-h-48 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {filteredLearners.length > 0 ? (
                          filteredLearners.map((learner) => {
                            const isSelected =
                              editingSchedule.learnerId === learner.id;

                            return (
                              <button
                                key={learner.id}
                                onClick={() =>
                                  updateEditingSchedule({
                                    learnerId: learner.id,
                                  })
                                }
                                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                                  isSelected
                                    ? "border-[#9021C4] bg-[#F6E8FA]"
                                    : "border-[#E7D8EA] bg-white hover:bg-[#F8EFF9]"
                                }`}
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5EEF6] text-[#9021C4]">
                                  <Users size={20} />
                                </div>

                                <p className="truncate font-semibold text-gray-900">
                                  {learner.name}
                                </p>
                              </button>
                            );
                          })
                        ) : (
                          <p className="rounded-xl bg-[#F5EEF6] px-4 py-3 text-sm font-semibold text-gray-500">
                            No learner found.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Notes
                      </label>

                      <textarea
                        value={editingSchedule.notes ?? ""}
                        onChange={(event) =>
                          updateEditingSchedule({
                            notes: event.target.value,
                          })
                        }
                        placeholder="Add session notes here..."
                        rows={4}
                        className="w-full resize-none rounded-xl border border-[#D8B7DD] bg-white px-4 py-3 outline-none focus:border-[#9021C4]"
                      />
                    </div>

                    {editorError && (
                      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-500">
                        {editorError}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={saveSchedule}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#9021C4] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-[#7D1AAC]"
                      >
                        <Save size={18} />
                        Save Schedule
                      </button>

                      <button
                        onClick={closeEditor}
                        className="rounded-xl bg-[#F5EEF6] px-5 py-3 font-semibold text-gray-700 transition hover:bg-[#EAD5EF]"
                      >
                        Cancel
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