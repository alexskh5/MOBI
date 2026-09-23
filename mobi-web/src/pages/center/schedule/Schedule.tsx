import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
  XCircle,
  PencilLine,
} from "lucide-react";

import CenterLayout from "../../../layouts/CenterLayout";
import { getCenterStaff } from "../../../services/centerStaffApi";
import { getLearners } from "../../../services/learner/learnerApi";
import {
  cancelSchedule,
  getSchedules,
  saveSchedule as saveScheduleApi,
  type TherapySchedule,
} from "../../../services/scheduleApi";

import {
  approveRescheduleRequest,
  cancelSchedule,
  createSchedule,
  getCenterRescheduleRequests,
  getCenterSchedules,
  getScheduleLearners,
  rejectRescheduleRequest,
  updateCenterSchedule,
} from "../../../services/scheduleApi";

import {
  getTherapists,
} from "../../../services/therapist/therapistApi";

import type {
  DeliveryMode,
  ScheduleLearner,
  ScheduledSession,
  ScheduleRescheduleRequest,
  SessionType,
} from "../../../services/scheduleApi";

/* =========================================================
   TEMPORARY CENTER ID

   Later:
   replace with authenticated Center identity.
========================================================= */

const CENTER_ID =
  "d5ae1649-0343-46d4-b433-575c97e064e1";

const MANILA_TIME_ZONE =
  "Asia/Manila";

/* =========================================================
   TYPES
========================================================= */

type TherapistRecord = {
  id: string;
  center_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  specialization?: string | null;
  account_status:
    | "not_invited"
    | "invited"
    | "active"
    | "suspended";
};

type CreateForm = {
  learnerId: string;
  therapistId: string;
  sessionType: SessionType;
  deliveryMode: DeliveryMode;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
};

const EMPTY_FORM: CreateForm = {
  learnerId: "",
  therapistId: "",
  sessionType: "speech_training",
  deliveryMode: "clinic",
  date: "",
  startTime: "",
  endTime: "",
  notes: "",
};

/* =========================================================
   DATE / TIME HELPERS
========================================================= */

const pad = (value: number) =>
  String(value).padStart(2, "0");

const getManilaParts = (
  date: Date,
) => {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          MANILA_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      },
    ).formatToParts(date);

  const read = (
    type: string,
  ) =>
    parts.find(
      (part) =>
        part.type === type,
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

  const parts =
    getManilaParts(date);

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const addDaysToDateKey = (
  dateKey: string,
  amount: number,
) => {
  const [year, month, day] =
    dateKey
      .split("-")
      .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  date.setUTCDate(
    date.getUTCDate() +
      amount,
  );

  return `${date.getUTCFullYear()}-${pad(
    date.getUTCMonth() + 1,
  )}-${pad(
    date.getUTCDate(),
  )}`;
};

const formatDateKey = (
  dateKey: string,
) =>
  new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        MANILA_TIME_ZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(
      `${dateKey}T00:00:00+08:00`,
    ),
  );

const formatTime = (
  iso: string,
) =>
  new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        MANILA_TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  ).format(
    new Date(iso),
  );

const localFormToIso = (
  date: string,
  time: string,
) =>
  new Date(
    `${date}T${time}:00+08:00`,
  ).toISOString();

const getDuration = (
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
      (end - start) /
        60000,
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

const getTherapistName = (
  therapist?: TherapistRecord,
) => {
  if (!therapist) {
    return "Not assigned";
  }

  return [
    therapist.first_name,
    therapist.middle_name,
    therapist.last_name,
  ]
    .filter(Boolean)
    .join(" ");
};

const getInitials = (
  first?: string | null,
  last?: string | null,
) =>
  [first, last]
    .filter(Boolean)
    .map((value) =>
      String(value)
        .trim()
        .charAt(0)
        .toUpperCase(),
    )
    .join("") || "M";

const getSessionLabel = (
  type: SessionType,
) =>
  type ===
  "social_readiness"
    ? "Social Readiness"
    : "Speech Training";

const getScheduleStatus = (
  schedule: ScheduledSession,
) => {
  if (
    schedule.status ===
    "cancelled"
  ) {
    return "Cancelled";
  }

  if (
    schedule.status ===
    "completed"
  ) {
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
    return "Change requested";
  }

  if (
    schedule.status ===
    "confirmed"
  ) {
    return "Confirmed";
  }

  if (
    schedule.therapist_response ===
      "confirmed" &&
    schedule.guardian_response ===
      "pending"
  ) {
    return "Guardian pending";
  }

  if (
    schedule.therapist_response ===
      "pending"
  ) {
    return "Therapist pending";
  }

  return "Scheduled";
};

const getStatusStyle = (
  schedule: ScheduledSession,
) => {
  if (
    schedule.status ===
    "cancelled"
  ) {
    return "bg-slate-100 text-slate-500";
  }

  if (
    schedule.status ===
    "completed"
  ) {
    return "bg-slate-100 text-slate-700";
  }

  if (
    schedule.guardian_response ===
    "declined"
  ) {
    return "bg-rose-50 text-rose-700";
  }

  if (
    schedule.therapist_response ===
    "reschedule_requested"
  ) {
    return "bg-violet-50 text-violet-700";
  }

  if (
    schedule.status ===
    "confirmed"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  return "bg-amber-50 text-amber-700";
};

const getErrorMessage = (
  error: any,
  fallback: string,
) =>
  error?.response?.data
    ?.message ||
  error?.response?.data
    ?.error ||
  error?.message ||
  fallback;

/* =========================================================
   COMPONENT
========================================================= */

const Schedule = () => {
  const dateInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    selectedDateKey,
    setSelectedDateKey,
  ] = useState(() =>
    getManilaDateKey(
      new Date(),
    ),
  );

  const [
    schedules,
    setSchedules,
  ] =
    useState<
      ScheduledSession[]
    >([]);

  const [
    requests,
    setRequests,
  ] =
    useState<
      ScheduleRescheduleRequest[]
    >([]);

  const [
    learners,
    setLearners,
  ] =
    useState<
      ScheduleLearner[]
    >([]);

  const [
    therapists,
    setTherapists,
  ] =
    useState<
      TherapistRecord[]
    >([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* =======================================================
     ADD SESSION
  ======================================================= */

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    createForm,
    setCreateForm,
  ] =
    useState<CreateForm>(
      EMPTY_FORM,
    );

  const [
    createError,
    setCreateError,
  ] = useState("");

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  /* =======================================================
     CANCEL SESSION
  ======================================================= */

  const [
    cancelTarget,
    setCancelTarget,
  ] =
    useState<
      ScheduledSession | null
    >(null);

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const [
    isCancelling,
    setIsCancelling,
  ] = useState(false);

  // edit session

  const [
    editTarget,
    setEditTarget,
  ] =
  useState<ScheduledSession | null>(
    null,
  );



  /* =======================================================
     REQUEST REVIEW
  ======================================================= */

  const [
    reviewRequest,
    setReviewRequest,
  ] =
    useState<
      ScheduleRescheduleRequest | null
    >(null);

  const [
    reviewAction,
    setReviewAction,
  ] =
    useState<
      "approve" | "reject" | null
    >(null);

  const [
    reviewNote,
    setReviewNote,
  ] = useState("");

  const [
    reviewError,
    setReviewError,
  ] = useState("");

  const [
    isReviewing,
    setIsReviewing,
  ] = useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData =
    useCallback(
      async (
        mainLoader = false,
      ) => {
        try {
          if (mainLoader) {
            setIsLoading(
              true,
            );
          } else {
            setIsRefreshing(
              true,
            );
          }

          setPageError("");

          const [
            schedulesResponse,
            requestsResponse,
            learnerResponse,
            therapistResponse,
          ] =
            await Promise.all(
              [
                getCenterSchedules(
                  CENTER_ID,
                ),

                getCenterRescheduleRequests(
                  CENTER_ID,
                  "pending",
                ),

                getScheduleLearners(),

                getTherapists(),
              ],
            );

          setSchedules(
            schedulesResponse.data ??
              [],
          );

          setRequests(
            requestsResponse.data ??
              [],
          );

          setLearners(
            learnerResponse ?? [],
          );

          setTherapists(
            therapistResponse
              ?.therapists ??
              [],
          );
        } catch (
          error: any
        ) {
          console.error(
            "Unable to load Center schedule:",
            error,
          );

          setPageError(
            getErrorMessage(
              error,
              "Unable to load scheduling information.",
            ),
          );
        } finally {
          setIsLoading(
            false,
          );

          setIsRefreshing(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    void loadData(true);
  }, [loadData]);

  /* =======================================================
     LOOKUP MAPS
  ======================================================= */

  const learnerMap =
    useMemo(
      () =>
        new Map(
          learners.map(
            (learner) => [
              learner.id,
              learner,
            ],
          ),
        ),
      [learners],
    );

  const therapistMap =
    useMemo(
      () =>
        new Map(
          therapists.map(
            (therapist) => [
              therapist.id,
              therapist,
            ],
          ),
        ),
      [therapists],
    );

  const scheduleMap =
    useMemo(
      () =>
        new Map(
          schedules.map(
            (schedule) => [
              schedule.id,
              schedule,
            ],
          ),
        ),
      [schedules],
    );

  /* =======================================================
     FILTERS
  ======================================================= */

  const selectedSchedules =
    useMemo(() => {
      return schedules
        .filter(
          (schedule) =>
            getManilaDateKey(
              schedule.scheduled_start,
            ) ===
            selectedDateKey,
        )
        .sort(
          (
            first,
            second,
          ) =>
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

  const visibleSchedules =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return selectedSchedules;
      }

      return selectedSchedules.filter(
        (schedule) => {
          const learner =
            learnerMap.get(
              schedule.learner_id,
            );

          const therapist =
            schedule.therapist_id
              ? therapistMap.get(
                  schedule.therapist_id,
                )
              : undefined;

          const text = [
            getLearnerName(
              learner,
            ),
            getTherapistName(
              therapist,
            ),
            therapist
              ?.specialization ??
              "",
            getSessionLabel(
              schedule.session_type,
            ),
            schedule.delivery_mode,
            getScheduleStatus(
              schedule,
            ),
            schedule.notes ??
              "",
          ]
            .join(" ")
            .toLowerCase();

          return text.includes(
            query,
          );
        },
      );
    }, [
      searchTerm,
      selectedSchedules,
      learnerMap,
      therapistMap,
    ]);

  const pendingResponseCount =
    selectedSchedules.filter(
      (schedule) =>
        schedule.status ===
          "scheduled" &&
        (schedule
          .therapist_response ===
          "pending" ||
          schedule
            .guardian_response ===
            "pending"),
    ).length;

  /* =======================================================
     DATE CONTROLS
  ======================================================= */

  const goToday = () =>
    setSelectedDateKey(
      getManilaDateKey(
        new Date(),
      ),
    );

  const previousDay = () =>
    setSelectedDateKey(
      (current) =>
        addDaysToDateKey(
          current,
          -1,
        ),
    );

  const nextDay = () =>
    setSelectedDateKey(
      (current) =>
        addDaysToDateKey(
          current,
          1,
        ),
    );

  const openDatePicker =
    () => {
      const input =
        dateInputRef.current as
          | (HTMLInputElement & {
              showPicker?: () => void;
            })
          | null;

      if (
        input?.showPicker
      ) {
        input.showPicker();
      } else {
        input?.click();
      }
    };

  /* =======================================================
     CREATE SESSION
  ======================================================= */

  const openCreate = () => {
    setCreateError("");

    setCreateForm({
      ...EMPTY_FORM,
      date:
        selectedDateKey,
    });

    setShowCreateModal(
      true,
    );
  };

  const openEdit = (
    schedule: ScheduledSession,
  ) => {
    const start =
      getManilaParts(
        new Date(
          schedule.scheduled_start,
        ),
      );

    const end =
      getManilaParts(
        new Date(
          schedule.scheduled_end,
        ),
      );

    setEditTarget(schedule);

    setCreateError("");

    setCreateForm({
      learnerId:
        schedule.learner_id,

      therapistId:
        schedule.therapist_id ??
        "",

      sessionType:
        schedule.session_type,

      deliveryMode:
        schedule.delivery_mode,

      date: `${start.year}-${start.month}-${start.day}`,

      startTime: `${start.hour}:${start.minute}`,

      endTime: `${end.hour}:${end.minute}`,

      notes:
        schedule.notes ?? "",
    });

    setShowCreateModal(true);
  };

  const closeCreate = () => {
    if (isCreating) return;

    setShowCreateModal(
      false,
    );

    setEditTarget(null);

    setCreateForm(
      EMPTY_FORM,
    );

    setCreateError("");
  };

  const updateCreateForm = <
    Key extends keyof CreateForm,
  >(
    key: Key,
    value: CreateForm[Key],
  ) => {
    setCreateForm(
      (current) => ({
        ...current,
        [key]: value,
      }),
    );
  };

  const submitCreate =
    async () => {
      if (
        !createForm.learnerId
      ) {
        setCreateError(
          "Please select a learner.",
        );
        return;
      }

      if (
        createForm.deliveryMode ===
          "clinic" &&
        !createForm.therapistId
      ) {
        setCreateError(
          "Clinic sessions require an assigned Therapist.",
        );
        return;
      }

      if (
        !createForm.date ||
        !createForm.startTime ||
        !createForm.endTime
      ) {
        setCreateError(
          "Please complete the date, start time, and end time.",
        );
        return;
      }

      const startIso =
        localFormToIso(
          createForm.date,
          createForm.startTime,
        );

      const endIso =
        localFormToIso(
          createForm.date,
          createForm.endTime,
        );

      if (
        new Date(startIso) >=
        new Date(endIso)
      ) {
        setCreateError(
          "End time must be after the start time.",
        );
        return;
      }

      try {
        setIsCreating(true);

        setCreateError("");

        if (editTarget) {
          await updateCenterSchedule(
            editTarget.id,
            {
              centerId:
                CENTER_ID,

              therapistId:
                createForm.therapistId,

              scheduledStart:
                startIso,

              scheduledEnd:
                endIso,

              notes:
                createForm.notes.trim() ||
                null,
            },
          );

          setSuccessMessage(
            "Session updated successfully.",
          );
        } else {
          await createSchedule({
            centerId:
              CENTER_ID,

            learnerId:
              createForm.learnerId,

            therapistId:
              createForm
                .therapistId ||
              null,

            sessionType:
              createForm.sessionType,

            deliveryMode:
              createForm.deliveryMode,

            scheduledStart:
              startIso,

            scheduledEnd:
              endIso,

            notes:
              createForm.notes.trim() ||
              null,

            createdByRole:
              "center_admin",
          });

          setSuccessMessage(
            createForm.deliveryMode ===
              "clinic"
              ? "Clinic session scheduled."
              : "Home practice scheduled.",
          );
        }

        setSelectedDateKey(
          createForm.date,
        );

        setShowCreateModal(
          false,
        );

        setEditTarget(null);

        setCreateForm(
          EMPTY_FORM,
        );

        await loadData();

        window.setTimeout(
          () =>
            setSuccessMessage(
              "",
            ),
          2500,
        );
      } catch (
        error: any
      ) {
        setCreateError(
          getErrorMessage(
            error,
            editTarget
              ? "Unable to update this session."
              : "Unable to create this session.",
          ),
        );
      } finally {
        setIsCreating(
          false,
        );
      }
    };

  /* =======================================================
     CANCEL SESSION
  ======================================================= */

  const submitCancellation =
    async () => {
      if (!cancelTarget) {
        return;
      }

      try {
        setIsCancelling(
          true,
        );

        setPageError("");

        await cancelSchedule(
          cancelTarget.id,
          CENTER_ID,
          cancellationReason,
        );

        setCancelTarget(
          null,
        );

        setCancellationReason(
          "",
        );

        setSuccessMessage(
          "Session cancelled.",
        );

        await loadData();

        window.setTimeout(
          () =>
            setSuccessMessage(
              "",
            ),
          2500,
        );
      } catch (
        error: any
      ) {
        setPageError(
          getErrorMessage(
            error,
            "Unable to cancel this session.",
          ),
        );
      } finally {
        setIsCancelling(
          false,
        );
      }
    };

  /* =======================================================
     REVIEW REQUEST
  ======================================================= */

  const openReview = (
    request:
      ScheduleRescheduleRequest,
    action:
      | "approve"
      | "reject",
  ) => {
    setReviewRequest(
      request,
    );

    setReviewAction(
      action,
    );

    setReviewNote("");

    setReviewError("");
  };

  const closeReview = () => {
    if (isReviewing) return;

    setReviewRequest(
      null,
    );

    setReviewAction(
      null,
    );

    setReviewNote("");

    setReviewError("");
  };

  const submitReview =
    async () => {
      if (
        !reviewRequest ||
        !reviewAction
      ) {
        return;
      }

      try {
        setIsReviewing(
          true,
        );

        setReviewError("");

        if (
          reviewAction ===
          "approve"
        ) {
          await approveRescheduleRequest(
            reviewRequest.id,
            CENTER_ID,
            reviewNote,
          );

          setSuccessMessage(
            "Schedule change approved.",
          );
        } else {
          await rejectRescheduleRequest(
            reviewRequest.id,
            CENTER_ID,
            reviewNote,
          );

          setSuccessMessage(
            "Schedule change declined.",
          );
        }

        closeReview();

        await loadData();

        window.setTimeout(
          () =>
            setSuccessMessage(
              "",
            ),
          2500,
        );
      } catch (
        error: any
      ) {
        setReviewError(
          getErrorMessage(
            error,
            "Unable to review this request.",
          ),
        );
      } finally {
        setIsReviewing(
          false,
        );
      }
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <CenterLayout>
      {(
        sidebarOpen,
        setSidebarOpen,
      ) => (
        <div className="min-h-full rounded-none bg-[#F8F5F9] p-4 font-sans sm:rounded-[26px] sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* HEADER */}
            <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-3">
                {!sidebarOpen && (
                  <button
                    type="button"
                    onClick={() =>
                      setSidebarOpen(
                        true,
                      )
                    }
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-50"
                    aria-label="Open sidebar"
                  >
                    ☰
                  </button>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#82548C]">
                    Center Management
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Schedule
                  </h1>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Manage clinic
                    appointments and
                    home practice for
                    enrolled learners.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex h-11 min-w-0 items-center rounded-xl border border-slate-200 bg-white px-3 sm:w-[320px]">
                  <Search
                    size={17}
                    className="mr-2.5 shrink-0 text-slate-400"
                  />

                  <input
                    value={
                      searchTerm
                    }
                    onChange={(
                      event,
                    ) =>
                      setSearchTerm(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Search schedule"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm(
                          "",
                        )
                      }
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-50"
                    >
                      <X
                        size={
                          14
                        }
                      />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    openCreate
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#82548C] px-5 text-sm font-semibold text-white transition hover:bg-[#704578]"
                >
                  <Plus
                    size={17}
                  />
                  Add Session
                </button>
              </div>
            </header>

            {/* DATE / SUMMARY */}
            <section className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {formatDateKey(
                      selectedDateKey,
                    )}
                  </h2>

                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                    <span>
                      {
                        selectedSchedules.length
                      }{" "}
                      sessions
                    </span>

                    <span>
                      {
                        pendingResponseCount
                      }{" "}
                      awaiting
                      response
                    </span>

                    <span
                      className={
                        requests.length >
                        0
                          ? "font-semibold text-[#82548C]"
                          : ""
                      }
                    >
                      {
                        requests.length
                      }{" "}
                      pending
                      change
                      request
                      {requests.length ===
                      1
                        ? ""
                        : "s"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={
                        openDatePicker
                      }
                      className="flex h-10 items-center gap-2 border-r border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <CalendarDays
                        size={
                          16
                        }
                      />
                      <span className="hidden sm:inline">
                        Calendar
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={
                        previousDay
                      }
                      className="flex h-10 w-10 items-center justify-center border-r border-slate-200 text-slate-500 hover:bg-slate-50"
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
                        nextDay
                      }
                      className="flex h-10 w-10 items-center justify-center text-slate-500 hover:bg-slate-50"
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
                      event,
                    ) => {
                      if (
                        event.target
                          .value
                      ) {
                        setSelectedDateKey(
                          event.target
                            .value,
                        );
                      }
                    }}
                    className="sr-only"
                  />

                  <button
                    type="button"
                    onClick={
                      goToday
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Today
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void loadData()
                    }
                    disabled={
                      isRefreshing
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    aria-label="Refresh schedule"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        isRefreshing
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>
                </div>
              </div>
            </section>

            {pageError && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span className="flex-1">
                  {pageError}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPageError(
                      "",
                    )
                  }
                >
                  <X
                    size={
                      15
                    }
                  />
                </button>
              </div>
            )}

            {/* MAIN SCHEDULE */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  Sessions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Finalized and
                  pending appointments
                  for the selected
                  date.
                </p>
              </div>

              <div className="hidden grid-cols-[100px_minmax(150px,1fr)_minmax(160px,1fr)_150px_145px_90px] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 lg:grid">
                <span>Time</span>
                <span>Learner</span>
                <span>
                  Therapist
                </span>
                <span>Session</span>
                <span>Status</span>
                <span className="text-right">
                  Action
                </span>
              </div>

              {isLoading ? (
                <div className="flex min-h-[310px] flex-col items-center justify-center">
                  <LoaderCircle
                    size={27}
                    className="animate-spin text-[#82548C]"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Loading
                    schedule...
                  </p>
                </div>
              ) : visibleSchedules.length ===
                0 ? (
                <div className="flex min-h-[310px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EEF6] text-[#82548C]">
                    <CalendarDays
                      size={24}
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    No sessions
                    scheduled
                  </h3>

                  <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                    There are no
                    sessions matching
                    this date or
                    search.
                  </p>

                  <button
                    type="button"
                    onClick={
                      openCreate
                    }
                    className="mt-4 flex items-center gap-2 rounded-xl bg-[#82548C] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Plus
                      size={
                        16
                      }
                    />
                    Add Session
                  </button>
                </div>
              ) : (
                visibleSchedules.map(
                  (schedule) => {
                    const learner =
                      learnerMap.get(
                        schedule.learner_id,
                      );

                    const therapist =
                      schedule
                        .therapist_id
                        ? therapistMap.get(
                            schedule.therapist_id,
                          )
                        : undefined;

                    return (
                      <article
                        key={
                          schedule.id
                        }
                        className="border-b border-slate-100 px-5 py-4 last:border-b-0 lg:grid lg:grid-cols-[100px_minmax(150px,1fr)_minmax(160px,1fr)_150px_145px_90px] lg:items-center lg:gap-4"
                      >
                        <div className="mb-3 lg:mb-0">
                          <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                            <Clock3
                              size={
                                14
                              }
                              className="text-[#95609F]"
                            />

                            {formatTime(
                              schedule.scheduled_start,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {getDuration(
                              schedule,
                            )}{" "}
                            min
                          </p>
                        </div>

                        <div className="mb-3 flex min-w-0 items-center gap-2.5 lg:mb-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5EEF6] text-xs font-bold text-[#82548C]">
                            {getInitials(
                              learner
                                ?.firstName,
                              learner
                                ?.lastName,
                            )}
                          </div>

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {getLearnerName(
                              learner,
                            )}
                          </p>
                        </div>

                        <div className="mb-3 min-w-0 lg:mb-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {getTherapistName(
                              therapist,
                            )}
                          </p>

                          {therapist?.specialization && (
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {
                                therapist.specialization
                              }
                            </p>
                          )}
                        </div>

                        <div className="mb-3 lg:mb-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {getSessionLabel(
                              schedule.session_type,
                            )}
                          </p>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            {schedule.delivery_mode ===
                            "home" ? (
                              <Home
                                size={
                                  12
                                }
                              />
                            ) : (
                              <MapPin
                                size={
                                  12
                                }
                              />
                            )}

                            {schedule.delivery_mode ===
                            "home"
                              ? "Home Practice"
                              : "Clinic"}
                          </p>
                        </div>

                        <div className="mb-3 lg:mb-0">
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1.5 text-xs font-semibold ${getStatusStyle(
                              schedule,
                            )}`}
                          >
                            {getScheduleStatus(
                              schedule,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-1">
                          {schedule.status !==
                            "cancelled" &&
                          schedule.status !==
                            "completed" &&
                          schedule.delivery_mode ===
                            "clinic" && (
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(schedule)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#F5EEF6] hover:text-[#82548C]"
                              title="Edit session"
                              aria-label="Edit session"
                            >
                              <PencilLine size={15} />
                            </button>
                          )}

                          {schedule.status !==
                            "cancelled" &&
                          schedule.status !==
                            "completed" && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelTarget(
                                  schedule,
                                );

                                setCancellationReason(
                                  "",
                                );
                              }}
                              className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                      </article>
                    );
                  },
                )
              )}
            </section>

            {/* PENDING REQUESTS */}
            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Schedule
                    Requests
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Review time
                    changes requested
                    by Therapists.
                  </p>
                </div>

                {requests.length >
                  0 && (
                  <span className="rounded-full bg-[#F5EEF6] px-2.5 py-1 text-xs font-bold text-[#82548C]">
                    {
                      requests.length
                    }
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">
                  Loading
                  requests...
                </div>
              ) : requests.length ===
                0 ? (
                <div className="px-5 py-8 text-center">
                  <CheckCircle2
                    size={24}
                    className="mx-auto text-emerald-500"
                  />

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    No pending
                    requests
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Therapist
                    schedule-change
                    requests will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {requests.map(
                    (request) => {
                      const session =
                        scheduleMap.get(
                          request.scheduled_session_id,
                        );

                      const learner =
                        session
                          ? learnerMap.get(
                              session.learner_id,
                            )
                          : undefined;

                      const therapist =
                        request.requested_by_therapist_id
                          ? therapistMap.get(
                              request.requested_by_therapist_id,
                            )
                          : session
                              ?.therapist_id
                            ? therapistMap.get(
                                session.therapist_id,
                              )
                            : undefined;

                      return (
                        <article
                          key={
                            request.id
                          }
                          className="px-5 py-4"
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {getTherapistName(
                                    therapist,
                                  )}
                                </p>

                                <span className="text-xs text-slate-400">
                                  requested
                                  a change
                                  for
                                </span>

                                <p className="text-sm font-semibold text-[#82548C]">
                                  {getLearnerName(
                                    learner,
                                  )}
                                </p>
                              </div>

                              {session && (
                                <p className="mt-1.5 text-xs text-slate-500">
                                  Current:{" "}
                                  {formatDateKey(
                                    getManilaDateKey(
                                      session.scheduled_start,
                                    ),
                                  )}{" "}
                                  ·{" "}
                                  {formatTime(
                                    session.scheduled_start,
                                  )}{" "}
                                  –{" "}
                                  {formatTime(
                                    session.scheduled_end,
                                  )}
                                </p>
                              )}

                              {request.proposed_start &&
                                request.proposed_end && (
                                  <p className="mt-1 text-sm font-semibold text-slate-700">
                                    Proposed:{" "}
                                    {formatDateKey(
                                      getManilaDateKey(
                                        request.proposed_start,
                                      ),
                                    )}{" "}
                                    ·{" "}
                                    {formatTime(
                                      request.proposed_start,
                                    )}{" "}
                                    –{" "}
                                    {formatTime(
                                      request.proposed_end,
                                    )}
                                  </p>
                                )}

                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {
                                  request.reason
                                }
                              </p>
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openReview(
                                    request,
                                    "reject",
                                  )
                                }
                                className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                              >
                                <XCircle
                                  size={
                                    14
                                  }
                                />
                                Decline
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openReview(
                                    request,
                                    "approve",
                                  )
                                }
                                className="flex h-9 items-center gap-1.5 rounded-lg bg-[#82548C] px-3.5 text-xs font-semibold text-white transition hover:bg-[#704578]"
                              >
                                <Check
                                  size={
                                    14
                                  }
                                />
                                Approve
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </div>

          {/* SUCCESS */}
          {successMessage && (
            <div className="fixed right-4 top-4 z-[110] flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg">
              <CheckCircle2
                size={17}
              />
              {
                successMessage
              }
            </div>
          )}

          {/* CREATE MODAL */}
          {showCreateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[2px]">
              <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[22px] border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#82548C]">
                      {editTarget
                        ? "Edit Session"
                        : "New Session"}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {editTarget
                        ? "Update Appointment"
                        : "Schedule Learning"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Create a
                      clinic
                      appointment or
                      home-practice
                      schedule.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeCreate
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    <X
                      size={
                        18
                      }
                    />
                  </button>
                </div>

                <div className="space-y-5 px-6 py-5">
                  {/* MODE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Delivery
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={Boolean(editTarget)}
                        onClick={() =>
                          updateCreateForm(
                            "deliveryMode",
                            "clinic",
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          createForm.deliveryMode ===
                          "clinic"
                            ? "border-[#82548C] bg-[#F8F3F8]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={
                              16
                            }
                            className="text-[#82548C]"
                          />

                          <span className="text-sm font-semibold text-slate-800">
                            Clinic
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Therapist-led
                          appointment at
                          the center.
                        </p>
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(editTarget)}
                        onClick={() =>
                          updateCreateForm(
                            "deliveryMode",
                            "home",
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          createForm.deliveryMode ===
                          "home"
                            ? "border-[#82548C] bg-[#F8F3F8]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Home
                            size={
                              16
                            }
                            className="text-[#82548C]"
                          />

                          <span className="text-sm font-semibold text-slate-800">
                            Home
                            Practice
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Guided MOBI
                          practice
                          completed at
                          home.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* LEARNER */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Learner
                      </label>

                      <select
                        value={createForm.learnerId}
                        disabled={Boolean(editTarget)}
                        onChange={(
                          event,
                        ) =>
                          updateCreateForm(
                            "learnerId",
                            event.target
                              .value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-[#82548C]"
                      >
                        <option value="">
                          Select
                          learner
                        </option>

                        {learners.map(
                          (
                            learner,
                          ) => (
                            <option
                              key={
                                learner.id
                              }
                              value={
                                learner.id
                              }
                            >
                              {getLearnerName(
                                learner,
                              )}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* TYPE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Training
                        Type
                      </label>

                      <select
                        value={
                          createForm.sessionType
                        }
                        disabled={Boolean(editTarget)}
                        onChange={(
                          event,
                        ) =>
                          updateCreateForm(
                            "sessionType",
                            event.target
                              .value as SessionType,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-[#82548C]"
                      >
                        <option value="speech_training">
                          Speech
                          Training
                        </option>

                        <option value="social_readiness">
                          Social
                          Readiness
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* THERAPIST */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Therapist{" "}
                      {createForm.deliveryMode ===
                      "home" && (
                        <span className="font-normal text-slate-400">
                          (optional)
                        </span>
                      )}
                    </label>

                    <select
                      value={
                        createForm.therapistId
                      }
                      onChange={(
                        event,
                      ) =>
                        updateCreateForm(
                          "therapistId",
                          event.target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-[#82548C]"
                    >
                      <option value="">
                        {createForm.deliveryMode ===
                        "clinic"
                          ? "Select assigned Therapist"
                          : "No Therapist assigned"}
                      </option>

                      {therapists
                        .filter(
                          (
                            therapist,
                          ) =>
                            therapist.account_status !==
                            "suspended",
                        )
                        .map(
                          (
                            therapist,
                          ) => (
                            <option
                              key={
                                therapist.id
                              }
                              value={
                                therapist.id
                              }
                            >
                              {getTherapistName(
                                therapist,
                              )}
                              {therapist.specialization
                                ? ` — ${therapist.specialization}`
                                : ""}
                            </option>
                          ),
                        )}
                    </select>

                    {createForm.deliveryMode ===
                      "home" && (
                      <p className="mt-1.5 text-xs leading-5 text-slate-400">
                        Home practice
                        does not reserve
                        Therapist clinic
                        time.
                      </p>
                    )}
                  </div>

                  {/* DATE / TIME */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Date
                      </label>

                      <input
                        type="date"
                        value={
                          createForm.date
                        }
                        onChange={(
                          event,
                        ) =>
                          updateCreateForm(
                            "date",
                            event.target
                              .value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#82548C]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Start
                      </label>

                      <input
                        type="time"
                        value={
                          createForm.startTime
                        }
                        onChange={(
                          event,
                        ) =>
                          updateCreateForm(
                            "startTime",
                            event.target
                              .value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#82548C]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        End
                      </label>

                      <input
                        type="time"
                        value={
                          createForm.endTime
                        }
                        onChange={(
                          event,
                        ) =>
                          updateCreateForm(
                            "endTime",
                            event.target
                              .value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#82548C]"
                      />
                    </div>
                  </div>

                  {/* NOTES */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Notes{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      rows={3}
                      value={
                        createForm.notes
                      }
                      onChange={(
                        event,
                      ) =>
                        updateCreateForm(
                          "notes",
                          event.target
                            .value,
                        )
                      }
                      placeholder="Add a short scheduling note."
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#82548C]"
                    />
                  </div>

                  {createError && (
                    <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {
                        createError
                      }
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeCreate
                    }
                    disabled={
                      isCreating
                    }
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void submitCreate()
                    }
                    disabled={
                      isCreating
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#82548C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#704578] disabled:opacity-60"
                  >
                    {isCreating ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <CalendarDays
                        size={16}
                      />
                    )}

                    {editTarget
                      ? "Save Changes"
                      : "Schedule Session"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CANCEL MODAL */}
          {cancelTarget && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]">
              <div className="w-full max-w-md rounded-[20px] border border-slate-200 bg-white shadow-2xl">
                <div className="px-6 py-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Cancel
                    Session?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    The appointment
                    will remain in
                    MOBI's schedule
                    history as
                    cancelled.
                  </p>

                  <textarea
                    rows={3}
                    value={
                      cancellationReason
                    }
                    onChange={(
                      event,
                    ) =>
                      setCancellationReason(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Reason for cancellation (optional)"
                    className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#82548C]"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      setCancelTarget(
                        null,
                      )
                    }
                    disabled={
                      isCancelling
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
                  >
                    Keep Session
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void submitCancellation()
                    }
                    disabled={
                      isCancelling
                    }
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isCancelling && (
                      <LoaderCircle
                        size={15}
                        className="animate-spin"
                      />
                    )}
                    Cancel
                    Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REVIEW REQUEST MODAL */}
          {reviewRequest &&
            reviewAction && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]">
                <div className="w-full max-w-lg rounded-[20px] border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#82548C]">
                        Therapist
                        Request
                      </p>

                      <h2 className="mt-1 text-lg font-bold text-slate-900">
                        {reviewAction ===
                        "approve"
                          ? "Approve Schedule Change"
                          : "Decline Schedule Change"}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={
                        closeReview
                      }
                      className="text-slate-400"
                    >
                      <X
                        size={
                          18
                        }
                      />
                    </button>
                  </div>

                  <div className="px-6 py-5">
                    <p className="text-sm leading-6 text-slate-600">
                      {
                        reviewRequest.reason
                      }
                    </p>

                    {reviewRequest.proposed_start &&
                      reviewRequest.proposed_end && (
                        <div className="mt-4 rounded-xl bg-[#F8F5F9] px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Proposed
                            schedule
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatDateKey(
                              getManilaDateKey(
                                reviewRequest.proposed_start,
                              ),
                            )}{" "}
                            ·{" "}
                            {formatTime(
                              reviewRequest.proposed_start,
                            )}{" "}
                            –{" "}
                            {formatTime(
                              reviewRequest.proposed_end,
                            )}
                          </p>
                        </div>
                      )}

                    <label className="mb-2 mt-5 block text-sm font-semibold text-slate-700">
                      Center Note{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      rows={3}
                      value={
                        reviewNote
                      }
                      onChange={(
                        event,
                      ) =>
                        setReviewNote(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Add a short response for the Therapist."
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#82548C]"
                    />

                    {reviewError && (
                      <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {
                          reviewError
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                    <button
                      type="button"
                      onClick={
                        closeReview
                      }
                      disabled={
                        isReviewing
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void submitReview()
                      }
                      disabled={
                        isReviewing
                      }
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                        reviewAction ===
                        "approve"
                          ? "bg-[#82548C] hover:bg-[#704578]"
                          : "bg-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {isReviewing ? (
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />
                      ) : reviewAction ===
                        "approve" ? (
                        <Check
                          size={
                            15
                          }
                        />
                      ) : (
                        <XCircle
                          size={
                            15
                          }
                        />
                      )}

                      {reviewAction ===
                      "approve"
                        ? "Approve"
                        : "Decline"}
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

export default Schedule;
