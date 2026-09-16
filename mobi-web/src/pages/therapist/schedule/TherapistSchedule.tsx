import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowRightLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import TherapistLayout from "../../../layouts/TherapistLayout";

import {
  confirmTherapistSchedule,
  getScheduleLearners,
  getTherapistSchedules,
  requestTherapistReschedule,
} from "../../../services/scheduleApi";

import type {
  ScheduleLearner,
  ScheduledSession,
} from "../../../services/scheduleApi";

/* =========================================================
   PHILIPPINE TIME HELPERS
========================================================= */

const MANILA_TIME_ZONE = "Asia/Manila";

const pad = (value: number) =>
  String(value).padStart(2, "0");

const getManilaParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: MANILA_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    },
  ).formatToParts(date);

  const read = (type: string) =>
    parts.find(
      (part) => part.type === type,
    )?.value ?? "";

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
  };
};

const getManilaDateKey = (
  value: string | Date,
) => {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  const parts = getManilaParts(date);

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const getManilaDateTimeInput = (
  iso: string,
) => {
  const parts =
    getManilaParts(new Date(iso));

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

const manilaInputToIso = (
  value: string,
) => {
  if (!value) {
    return null;
  }

  return new Date(
    `${value}:00+08:00`,
  ).toISOString();
};

const addDaysToDateKey = (
  dateKey: string,
  amount: number,
) => {
  const [year, month, day] =
    dateKey.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  date.setUTCDate(
    date.getUTCDate() + amount,
  );

  return `${date.getUTCFullYear()}-${pad(
    date.getUTCMonth() + 1,
  )}-${pad(date.getUTCDate())}`;
};

const formatDateKey = (
  dateKey: string,
) => {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: MANILA_TIME_ZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(`${dateKey}T00:00:00+08:00`),
  );
};

const formatTime = (iso: string) => {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: MANILA_TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  ).format(new Date(iso));
};

const getDurationMinutes = (
  schedule: ScheduledSession,
) => {
  const start =
    new Date(
      schedule.scheduled_start,
    ).getTime();

  const end =
    new Date(
      schedule.scheduled_end,
    ).getTime();

  return Math.max(
    Math.round(
      (end - start) / 60000,
    ),
    0,
  );
};

/* =========================================================
   DISPLAY HELPERS
========================================================= */

const getLearnerName = (
  learner?: ScheduleLearner,
) => {
  if (!learner) {
    return "Learner";
  }

  return [
    learner.firstName,
    learner.middleName,
    learner.lastName,
  ]
    .filter(Boolean)
    .join(" ");
};

const getInitials = (
  learner?: ScheduleLearner,
) => {
  if (!learner) {
    return "L";
  }

  return [
    learner.firstName,
    learner.lastName,
  ]
    .filter(Boolean)
    .map((name) =>
      String(name)
        .trim()
        .charAt(0)
        .toUpperCase(),
    )
    .join("");
};

const getSessionTypeLabel = (
  type: ScheduledSession["session_type"],
) => {
  return type === "social_readiness"
    ? "Social Readiness"
    : "Speech Training";
};

const getResponseLabel = (
  schedule: ScheduledSession,
) => {
  if (schedule.status === "cancelled") {
    return "Cancelled";
  }

  if (schedule.status === "completed") {
    return "Completed";
  }

  if (
    schedule.guardian_response ===
    "declined"
  ) {
    return "Guardian declined";
  }

  if (
    schedule.therapist_response ===
    "reschedule_requested"
  ) {
    return "Reschedule requested";
  }

  if (
    schedule.status === "confirmed"
  ) {
    return "Confirmed";
  }

  if (
    schedule.therapist_response ===
    "confirmed" &&
    schedule.guardian_response ===
      "pending"
  ) {
    return "Awaiting guardian";
  }

  if (
    schedule.therapist_response ===
    "pending"
  ) {
    return "Needs response";
  }

  return "Scheduled";
};

const getStatusStyle = (
  schedule: ScheduledSession,
) => {
  if (schedule.status === "cancelled") {
    return {
      dot: "bg-gray-400",
      text: "text-gray-500",
      bg: "bg-gray-50",
    };
  }

  if (schedule.status === "completed") {
    return {
      dot: "bg-slate-500",
      text: "text-slate-600",
      bg: "bg-slate-50",
    };
  }

  if (
    schedule.guardian_response ===
    "declined"
  ) {
    return {
      dot: "bg-rose-400",
      text: "text-rose-700",
      bg: "bg-rose-50",
    };
  }

  if (
    schedule.therapist_response ===
    "reschedule_requested"
  ) {
    return {
      dot: "bg-violet-400",
      text: "text-violet-700",
      bg: "bg-violet-50",
    };
  }

  if (
    schedule.status === "confirmed"
  ) {
    return {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
    };
  }

  if (
    schedule.therapist_response ===
    "confirmed"
  ) {
    return {
      dot: "bg-blue-400",
      text: "text-blue-700",
      bg: "bg-blue-50",
    };
  }

  return {
    dot: "bg-amber-400",
    text: "text-amber-700",
    bg: "bg-amber-50",
  };
};

const getErrorMessage = (
  error: any,
  fallback: string,
) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const TherapistSchedule = () => {
  const dateInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const therapistId =
    localStorage.getItem(
      "mobi_staff_profile_id",
    ) ?? "";

  const [selectedDateKey, setSelectedDateKey] =
    useState(() =>
      getManilaDateKey(new Date()),
    );

  const [searchTerm, setSearchTerm] =
    useState("");

  const [schedules, setSchedules] =
    useState<ScheduledSession[]>([]);

  const [learners, setLearners] =
    useState<ScheduleLearner[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [pageError, setPageError] =
    useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  const [actionScheduleId, setActionScheduleId] =
    useState<string | null>(null);

  const [
    rescheduleTarget,
    setRescheduleTarget,
  ] =
    useState<ScheduledSession | null>(
      null,
    );

  const [
    rescheduleReason,
    setRescheduleReason,
  ] = useState("");

  const [
    proposedStart,
    setProposedStart,
  ] = useState("");

  const [
    proposedEnd,
    setProposedEnd,
  ] = useState("");

  const [
    rescheduleError,
    setRescheduleError,
  ] = useState("");

  /* =======================================================
     LOAD REAL DATA
  ======================================================= */

  const loadScheduleData =
    useCallback(
      async (
        showMainLoader = false,
      ) => {
        if (!therapistId) {
          setPageError(
            "Your Therapist account could not be identified. Please sign in again.",
          );

          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        try {
          if (showMainLoader) {
            setIsLoading(true);
          } else {
            setIsRefreshing(true);
          }

          setPageError("");

          const [
            scheduleResponse,
            learnerResponse,
          ] = await Promise.all([
            getTherapistSchedules(
              therapistId,
            ),
            getScheduleLearners(),
          ]);

          setSchedules(
            scheduleResponse.data ?? [],
          );

          setLearners(
            learnerResponse ?? [],
          );
        } catch (error: any) {
          console.error(
            "Unable to load Therapist schedule:",
            error,
          );

          setPageError(
            getErrorMessage(
              error,
              "Unable to load your schedule right now.",
            ),
          );
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [therapistId],
    );

  useEffect(() => {
    void loadScheduleData(true);
  }, [loadScheduleData]);

  /* =======================================================
     LOOKUPS
  ======================================================= */

  const learnerMap = useMemo(() => {
    return new Map(
      learners.map((learner) => [
        learner.id,
        learner,
      ]),
    );
  }, [learners]);

  const schedulesForSelectedDate =
    useMemo(() => {
      return schedules
        .filter(
          (schedule) =>
            getManilaDateKey(
              schedule.scheduled_start,
            ) === selectedDateKey,
        )
        .sort(
          (first, second) =>
            new Date(
              first.scheduled_start,
            ).getTime() -
            new Date(
              second.scheduled_start,
            ).getTime(),
        );
    }, [
      schedules,
      selectedDateKey,
    ]);

  const filteredSchedules =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return schedulesForSelectedDate;
      }

      return schedulesForSelectedDate.filter(
        (schedule) => {
          const learner =
            learnerMap.get(
              schedule.learner_id,
            );

          const searchableText = [
            getLearnerName(learner),
            getSessionTypeLabel(
              schedule.session_type,
            ),
            schedule.delivery_mode,
            getResponseLabel(schedule),
            schedule.notes ?? "",
            formatTime(
              schedule.scheduled_start,
            ),
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query,
          );
        },
      );
    }, [
      learnerMap,
      schedulesForSelectedDate,
      searchTerm,
    ]);

  const confirmedCount =
    schedulesForSelectedDate.filter(
      (schedule) =>
        schedule.status ===
          "confirmed" ||
        schedule.therapist_response ===
          "confirmed",
    ).length;

  const needsResponseCount =
    schedulesForSelectedDate.filter(
      (schedule) =>
        schedule.status !==
          "cancelled" &&
        schedule.status !==
          "completed" &&
        schedule.therapist_response ===
          "pending",
    ).length;

  /* =======================================================
     DATE CONTROLS
  ======================================================= */

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
    setSelectedDateKey(
      getManilaDateKey(new Date()),
    );
  };

  const goToPreviousDay = () => {
    setSelectedDateKey(
      (current) =>
        addDaysToDateKey(
          current,
          -1,
        ),
    );
  };

  const goToNextDay = () => {
    setSelectedDateKey(
      (current) =>
        addDaysToDateKey(
          current,
          1,
        ),
    );
  };

  /* =======================================================
     CONFIRM SESSION
  ======================================================= */

  const handleConfirm =
    async (
      schedule: ScheduledSession,
    ) => {
      if (!therapistId) {
        return;
      }

      try {
        setActionScheduleId(
          schedule.id,
        );

        setPageError("");

        await confirmTherapistSchedule(
          schedule.id,
          therapistId,
        );

        setActionMessage(
          "Availability confirmed.",
        );

        await loadScheduleData();

        window.setTimeout(() => {
          setActionMessage("");
        }, 2500);
      } catch (error: any) {
        setPageError(
          getErrorMessage(
            error,
            "Unable to confirm this session.",
          ),
        );
      } finally {
        setActionScheduleId(null);
      }
    };

  /* =======================================================
     RESCHEDULE MODAL
  ======================================================= */

  const openRescheduleModal = (
    schedule: ScheduledSession,
  ) => {
    setRescheduleTarget(schedule);

    setRescheduleReason("");

    setProposedStart(
      getManilaDateTimeInput(
        schedule.scheduled_start,
      ),
    );

    setProposedEnd(
      getManilaDateTimeInput(
        schedule.scheduled_end,
      ),
    );

    setRescheduleError("");
  };

  const closeRescheduleModal = () => {
    if (actionScheduleId) {
      return;
    }

    setRescheduleTarget(null);
    setRescheduleReason("");
    setProposedStart("");
    setProposedEnd("");
    setRescheduleError("");
  };

  const submitReschedule =
    async () => {
      if (
        !rescheduleTarget ||
        !therapistId
      ) {
        return;
      }

      if (!rescheduleReason.trim()) {
        setRescheduleError(
          "Please provide a reason for the schedule change.",
        );

        return;
      }

      const startIso =
        proposedStart
          ? manilaInputToIso(
              proposedStart,
            )
          : null;

      const endIso =
        proposedEnd
          ? manilaInputToIso(
              proposedEnd,
            )
          : null;

      if (
        (startIso && !endIso) ||
        (!startIso && endIso)
      ) {
        setRescheduleError(
          "Please provide both the proposed start and end time.",
        );

        return;
      }

      if (
        startIso &&
        endIso &&
        new Date(startIso) >=
          new Date(endIso)
      ) {
        setRescheduleError(
          "The proposed end time must be after the start time.",
        );

        return;
      }

      try {
        setActionScheduleId(
          rescheduleTarget.id,
        );

        setRescheduleError("");

        await requestTherapistReschedule(
          rescheduleTarget.id,
          {
            therapistId,
            reason:
              rescheduleReason.trim(),
            proposedStart: startIso,
            proposedEnd: endIso,
          },
        );

        setRescheduleTarget(null);

        setActionMessage(
          "Reschedule request sent to the Center.",
        );

        await loadScheduleData();

        window.setTimeout(() => {
          setActionMessage("");
        }, 2800);
      } catch (error: any) {
        setRescheduleError(
          getErrorMessage(
            error,
            "Unable to submit the reschedule request.",
          ),
        );
      } finally {
        setActionScheduleId(null);
      }
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <TherapistLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div className="inter relative flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] bg-[#E4C9E5]/80 p-4 sm:p-6 lg:p-8">
          {/* HEADER */}
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-start gap-4">
              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(true)
                  }
                  className="mt-1 text-3xl leading-none text-gray-800"
                  aria-label="Open sidebar"
                >
                  ☰
                </button>
              )}

              <div>
                <h1 className="itim text-4xl font-medium text-gray-900 sm:text-5xl">
                  Schedule
                </h1>

                <p className="mt-1.5 text-sm text-gray-600">
                  Review your assigned MOBI
                  sessions and respond to
                  clinic appointments.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <div className="flex min-w-0 flex-1 items-center rounded-xl border border-white/80 bg-[#F8F3F8] px-4 py-2.5 xl:w-[330px]">
                <Search
                  size={18}
                  className="mr-3 shrink-0 text-gray-400"
                />

                <input
                  type="search"
                  placeholder="Search learner or session"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm("")
                    }
                    className="ml-2 rounded-md p-1 text-gray-400 transition hover:bg-white hover:text-gray-700"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadScheduleData()
                }
                disabled={isRefreshing}
                className="flex h-[42px] items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/75 px-4 text-sm font-semibold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>
            </div>
          </div>

          <div className="my-5 border-b border-gray-400/40" />

          {/* CONTENT */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* DATE + SMALL SUMMARY */}
            <section className="mb-4 rounded-[20px] border border-white/80 bg-white/75 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#82548C]">
                    Assigned sessions
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {formatDateKey(
                      selectedDateKey,
                    )}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
                    <span>
                      {
                        schedulesForSelectedDate.length
                      }{" "}
                      total
                    </span>

                    <span>
                      {confirmedCount} responded
                    </span>

                    <span>
                      {needsResponseCount} need
                      your response
                    </span>
                  </div>
                </div>

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
                        size={16}
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
                      className="flex h-10 w-10 items-center justify-center border-r border-gray-200 text-gray-500 transition hover:bg-gray-50"
                      aria-label="Previous day"
                    >
                      <ChevronLeft
                        size={18}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={
                        goToNextDay
                      }
                      className="flex h-10 w-10 items-center justify-center text-gray-500 transition hover:bg-gray-50"
                      aria-label="Next day"
                    >
                      <ChevronRight
                        size={18}
                      />
                    </button>
                  </div>

                  <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedDateKey}
                    onChange={(event) => {
                      if (
                        event.target.value
                      ) {
                        setSelectedDateKey(
                          event.target.value,
                        );
                      }
                    }}
                    className="sr-only"
                  />

                  <button
                    type="button"
                    onClick={goToToday}
                    className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Today
                  </button>
                </div>
              </div>
            </section>

            {/* ERROR */}
            {pageError && (
              <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
                <p className="text-sm font-medium text-rose-700">
                  {pageError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setPageError("")
                  }
                  className="shrink-0 text-rose-400 hover:text-rose-700"
                  aria-label="Dismiss error"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* SCHEDULE */}
            <section className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
              {/* TABLE HEADER */}
              <div className="hidden border-b border-gray-100 bg-[#FBF9FB] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 lg:grid lg:grid-cols-[115px_minmax(170px,1fr)_minmax(160px,1fr)_180px_185px] lg:gap-5">
                <span>Time</span>
                <span>Learner</span>
                <span>Session</span>
                <span>Status</span>
                <span className="text-right">
                  Action
                </span>
              </div>

              {isLoading ? (
                <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
                  <LoaderCircle
                    size={28}
                    className="animate-spin text-[#82548C]"
                  />

                  <p className="mt-3 text-sm font-medium text-gray-500">
                    Loading your schedule...
                  </p>
                </div>
              ) : filteredSchedules.length ===
                0 ? (
                <div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EEF6] text-[#82548C]">
                    <CalendarDays
                      size={25}
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-gray-900">
                    No assigned sessions
                  </h3>

                  <p className="mt-1.5 max-w-sm text-sm leading-6 text-gray-500">
                    You do not have a
                    session matching this
                    date or search.
                  </p>
                </div>
              ) : (
                <div>
                  {filteredSchedules.map(
                    (schedule) => {
                      const learner =
                        learnerMap.get(
                          schedule.learner_id,
                        );

                      const style =
                        getStatusStyle(
                          schedule,
                        );

                      const isBusy =
                        actionScheduleId ===
                        schedule.id;

                      const isActive =
                        schedule.status !==
                          "cancelled" &&
                        schedule.status !==
                          "completed";

                      const canConfirm =
                        isActive &&
                        schedule.delivery_mode ===
                          "clinic" &&
                        schedule.therapist_response ===
                          "pending";

                      const canRequestChange =
                        isActive &&
                        schedule.delivery_mode ===
                          "clinic" &&
                        schedule.guardian_response !==
                          "declined" &&
                        schedule.therapist_response !==
                          "reschedule_requested";

                      return (
                        <article
                          key={
                            schedule.id
                          }
                          className="border-b border-gray-100 px-5 py-4 last:border-b-0 hover:bg-[#FCFBFC] lg:grid lg:grid-cols-[115px_minmax(170px,1fr)_minmax(160px,1fr)_180px_185px] lg:items-center lg:gap-5"
                        >
                          {/* TIME */}
                          <div className="mb-4 lg:mb-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 lg:hidden">
                              Time
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-gray-900 lg:mt-0">
                              <Clock3
                                size={15}
                                className="text-[#95609F]"
                              />

                              {formatTime(
                                schedule.scheduled_start,
                              )}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {
                                getDurationMinutes(
                                  schedule,
                                )
                              }{" "}
                              min
                            </p>
                          </div>

                          {/* LEARNER */}
                          <div className="mb-4 flex min-w-0 items-center gap-3 lg:mb-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E4D6E7] bg-[#F8F3F8] text-xs font-bold text-[#82548C]">
                              {getInitials(
                                learner,
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 lg:hidden">
                                Learner
                              </p>

                              <p className="truncate text-sm font-semibold text-gray-900">
                                {getLearnerName(
                                  learner,
                                )}
                              </p>

                              {learner?.nickname && (
                                <p className="mt-0.5 truncate text-xs text-gray-400">
                                  Goes by{" "}
                                  {
                                    learner.nickname
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          {/* SESSION */}
                          <div className="mb-4 min-w-0 lg:mb-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 lg:hidden">
                              Session
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-gray-800 lg:mt-0">
                              {getSessionTypeLabel(
                                schedule.session_type,
                              )}
                            </p>

                            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                              {schedule.delivery_mode ===
                              "home" ? (
                                <Home
                                  size={
                                    13
                                  }
                                />
                              ) : (
                                <MapPin
                                  size={
                                    13
                                  }
                                />
                              )}

                              {schedule.delivery_mode ===
                              "home"
                                ? "Home Practice"
                                : "Clinic"}
                            </div>

                            {schedule.notes && (
                              <p className="mt-1.5 line-clamp-1 text-xs text-gray-400">
                                {
                                  schedule.notes
                                }
                              </p>
                            )}
                          </div>

                          {/* STATUS */}
                          <div className="mb-4 lg:mb-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 lg:hidden">
                              Status
                            </p>

                            <div
                              className={`mt-1 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 lg:mt-0 ${style.bg}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${style.dot}`}
                              />

                              <span
                                className={`text-xs font-semibold ${style.text}`}
                              >
                                {getResponseLabel(
                                  schedule,
                                )}
                              </span>
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            {canConfirm && (
                              <button
                                type="button"
                                disabled={
                                  isBusy
                                }
                                onClick={() =>
                                  void handleConfirm(
                                    schedule,
                                  )
                                }
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#82548C] px-3.5 text-xs font-semibold text-white transition hover:bg-[#704578] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isBusy ? (
                                  <LoaderCircle
                                    size={
                                      14
                                    }
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Check
                                    size={
                                      14
                                    }
                                  />
                                )}

                                Confirm
                              </button>
                            )}

                            {canRequestChange && (
                              <button
                                type="button"
                                disabled={
                                  isBusy
                                }
                                onClick={() =>
                                  openRescheduleModal(
                                    schedule,
                                  )
                                }
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D9C7DD] bg-white px-3 text-xs font-semibold text-[#82548C] transition hover:bg-[#F8F3F8] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <ArrowRightLeft
                                  size={
                                    14
                                  }
                                />
                                Request change
                              </button>
                            )}

                            {!canConfirm &&
                              !canRequestChange && (
                                <span className="text-xs font-medium text-gray-400">
                                  {schedule.therapist_response ===
                                  "reschedule_requested"
                                    ? "Waiting for Center"
                                    : schedule.guardian_response ===
                                        "declined"
                                      ? "Center will follow up"
                                      : schedule.status ===
                                          "completed"
                                        ? "Session completed"
                                        : schedule.status ===
                                            "cancelled"
                                          ? "No action required"
                                          : "No action required"}
                                </span>
                              )}
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </div>

          {/* SUCCESS TOAST */}
          {actionMessage && (
            <div
              role="status"
              className="fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg"
            >
              <CheckCircle2
                size={17}
              />

              {actionMessage}
            </div>
          )}

          {/* RESCHEDULE MODAL */}
          {rescheduleTarget && (
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reschedule-title"
            >
              <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[22px] border border-gray-100 bg-white shadow-2xl">
                {/* MODAL HEADER */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#95609F]">
                      Schedule request
                    </p>

                    <h2
                      id="reschedule-title"
                      className="mt-1 text-xl font-bold text-gray-900"
                    >
                      Request a change
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      The Center will review
                      your request before the
                      appointment is changed.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeRescheduleModal
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* CURRENT SESSION */}
                <div className="mx-6 mt-5 rounded-xl border border-[#E8DEE9] bg-[#FAF7FA] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#82548C]">
                      <UserRound
                        size={17}
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {getLearnerName(
                          learnerMap.get(
                            rescheduleTarget.learner_id,
                          ),
                        )}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {formatDateKey(
                          getManilaDateKey(
                            rescheduleTarget.scheduled_start,
                          ),
                        )}{" "}
                        ·{" "}
                        {formatTime(
                          rescheduleTarget.scheduled_start,
                        )}{" "}
                        –{" "}
                        {formatTime(
                          rescheduleTarget.scheduled_end,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FORM */}
                <div className="space-y-5 px-6 py-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Reason{" "}
                      <span className="text-rose-500">
                        *
                      </span>
                    </label>

                    <textarea
                      rows={3}
                      value={
                        rescheduleReason
                      }
                      onChange={(event) =>
                        setRescheduleReason(
                          event.target.value,
                        )
                      }
                      placeholder="Briefly explain why you need a schedule change."
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#82548C] focus:ring-2 focus:ring-[#82548C]/10"
                    />
                  </div>

                  <div>
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700">
                        Suggested new time
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-gray-400">
                        Optional. The Center
                        makes the final
                        scheduling decision.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                          Start
                        </label>

                        <input
                          type="datetime-local"
                          value={
                            proposedStart
                          }
                          onChange={(
                            event,
                          ) =>
                            setProposedStart(
                              event.target
                                .value,
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#82548C] focus:ring-2 focus:ring-[#82548C]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                          End
                        </label>

                        <input
                          type="datetime-local"
                          value={
                            proposedEnd
                          }
                          onChange={(
                            event,
                          ) =>
                            setProposedEnd(
                              event.target
                                .value,
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#82548C] focus:ring-2 focus:ring-[#82548C]/10"
                        />
                      </div>
                    </div>
                  </div>

                  {rescheduleError && (
                    <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {
                        rescheduleError
                      }
                    </p>
                  )}
                </div>

                {/* MODAL ACTIONS */}
                <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeRescheduleModal
                    }
                    disabled={
                      Boolean(
                        actionScheduleId,
                      )
                    }
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void submitReschedule()
                    }
                    disabled={
                      Boolean(
                        actionScheduleId,
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#82548C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#704578] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionScheduleId ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <ArrowRightLeft
                        size={16}
                      />
                    )}

                    Send Request
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