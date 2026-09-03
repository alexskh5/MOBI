import {
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  Bell,
  Building2,
  CheckCircle2,
  Menu,
  MoreHorizontal,
  Pin,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import DocSidebar from "../../components/doctor/DocSidebar";

/* =========================================================
   TYPES
   Static for now, but shaped for future backend responses.
========================================================= */

type NotificationSource =
  | "mobi"
  | "therapist"
  | "center";

type NotificationFilter =
  | "mobi"
  | "therapist"
  | "center"
  | "recent"
  | "all";

interface DoctorNotification {
  id: string;
  title: string;
  message: string;
  source: NotificationSource;
  createdAt: string;
  createdAtLabel: string;
  isRead: boolean;
  isPinned: boolean;
  avatarText?: string;
  avatarImage?: string | null;
}

/* =========================================================
   STATIC PREVIEW DATA
   Later replace this with:
   GET /doctor/notifications
========================================================= */

const INITIAL_NOTIFICATIONS: DoctorNotification[] = [
  {
    id: "notification-001",
    title: "MOBI (Modernized Bridge Intervention)",
    message: "Pick up where you left off.",
    source: "mobi",
    createdAt: "2026-06-22T09:00:00+08:00",
    createdAtLabel: "2 wks ago",
    isRead: false,
    isPinned: false,
    avatarText: "M",
    avatarImage: null,
  },
  {
    id: "notification-002",
    title: "Christina Muana Lorenzo, OT",
    message:
      "Has left a note for today's progress of learner Lexi Pantaleon.",
    source: "therapist",
    createdAt: "2026-06-21T14:30:00+08:00",
    createdAtLabel: "2 wks ago",
    isRead: false,
    isPinned: false,
    avatarText: "CL",
    avatarImage: null,
  },
  {
    id: "notification-003",
    title: "Abled Minds Therapy Center",
    message: "Has added a new patient to your portal.",
    source: "center",
    createdAt: "2026-06-20T11:15:00+08:00",
    createdAtLabel: "2 wks ago",
    isRead: true,
    isPinned: false,
    avatarText: "AM",
    avatarImage: null,
  },
];

const FILTER_OPTIONS: Array<{
  value: NotificationFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "recent", label: "Recent" },
  { value: "mobi", label: "MOBI" },
  { value: "therapist", label: "Therapists" },
  { value: "center", label: "Center" },
];

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function NotificationAvatar({
  notification,
}: {
  notification: DoctorNotification;
}) {
  if (notification.avatarImage) {
    return (
      <img
        src={notification.avatarImage}
        alt={notification.title}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }

  if (notification.source === "mobi") {
    return (
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3eff8] text-[#7456a3]"
        aria-label="MOBI notification"
      >
        <Bell size={18} />
      </div>
    );
  }

  if (notification.source === "center") {
    return (
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf7f0] text-[#4f9467]"
        aria-label="Center notification"
      >
        <Building2 size={18} />
      </div>
    );
  }

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff5eb] text-[#bd7a38]"
      aria-label="Therapist notification"
    >
      <UserRound size={18} />
    </div>
  );
}

function SourceBadge({
  source,
}: {
  source: NotificationSource;
}) {
  const label =
    source === "mobi"
      ? "MOBI"
      : source === "therapist"
        ? "Therapist"
        : "Center";

  const style =
    source === "mobi"
      ? "bg-[#f3eff8] text-[#7456a3]"
      : source === "therapist"
        ? "bg-[#fff5eb] text-[#bd7a38]"
        : "bg-[#edf7f0] text-[#4f9467]";

  return (
    <span
      className={`inline-flex min-h-[25px] items-center rounded-full px-2.5 text-[10px] font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#f3eff8] text-[#7456a3]">
        <Bell size={21} />
      </div>

      <h2 className="mt-4 text-[15px] font-semibold text-[#202027]">
        No notifications found
      </h2>

      <p className="mt-2 max-w-md text-[13px] leading-6 text-[#757580]">
        There are no notifications matching your current filter or search.
      </p>
    </div>
  );
}

/* =========================================================
   MAIN SCREEN
========================================================= */

function DocNotificationScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );

  const [notifications, setNotifications] =
    useState<DoctorNotification[]>(INITIAL_NOTIFICATIONS);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [activeFilter, setActiveFilter] =
    useState<NotificationFilter>("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<DoctorNotification | null>(null);

  const [actionMessage, setActionMessage] = useState("");

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...notifications]
      .filter((notification) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          `${notification.title} ${notification.message}`
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesFilter =
          activeFilter === "all"
            ? true
            : activeFilter === "recent"
              ? true
              : notification.source === activeFilter;

        return matchesSearch && matchesFilter;
      })
      .sort((first, second) => {
        if (first.isPinned !== second.isPinned) {
          return first.isPinned ? -1 : 1;
        }

        return (
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
        );
      });
  }, [notifications, searchTerm, activeFilter]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const handleSearch = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerm(event.target.value);
  };

  const showActionMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(""), 2200);
  };

  const handleTogglePin = (notificationId: string) => {
    const target = notifications.find(
      (notification) => notification.id === notificationId,
    );

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              isPinned: !notification.isPinned,
            }
          : notification,
      ),
    );

    setOpenMenuId(null);

    showActionMessage(
      target?.isPinned
        ? "Notification unpinned."
        : "Notification pinned to the top.",
    );

    /*
      Later backend call:
      PATCH /doctor/notifications/:notificationId/pin
      body: { isPinned: boolean }
    */
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => notification.id !== deleteTarget.id,
      ),
    );

    setDeleteTarget(null);
    setOpenMenuId(null);
    showActionMessage("Notification deleted.");

    /*
      Later backend call:
      DELETE /doctor/notifications/:notificationId
    */
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    );

    /*
      Later backend call:
      PATCH /doctor/notifications/:notificationId/read
    */
  };

  return (
    <div className="min-h-screen bg-[#f7f7f9] font-professional text-[#202027]">
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          />

          <DocSidebar setSidebarOpen={setSidebarOpen} />
        </>
      )}

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-[10px] border border-[#e8e8ed] bg-white text-[#666672] transition hover:bg-[#f3eff8] hover:text-[#7456a3] lg:flex"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu size={19} />
        </button>
      )}

      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarOpen ? "lg:pl-[280px]" : "lg:pl-0"
        }`}
      >
        {/* MOBILE HEADER */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e8e8ed] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#666672] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-[#202027]">
              Notifications
            </p>

            <p className="truncate text-[11px] text-[#9898a3]">
              {unreadCount} unread notification
              {unreadCount === 1 ? "" : "s"}
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-[42px] lg:py-[35px]">
          {/* PAGE HEADER */}
          <section className="mb-[30px]">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#7456a3]">
              Doctor Workspace
            </span>

            <h1 className="text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-[#202027]">
              Notifications
            </h1>

            <p className="mt-2 max-w-[680px] text-[14px] leading-[1.65] text-[#757580]">
              View updates from MOBI, therapists, and the therapy center.
            </p>
          </section>

          {/* MAIN PANEL */}
          <section className="overflow-visible rounded-[14px] border border-[#e8e8ed] bg-white">
            {/* PANEL HEADER */}
            <div className="flex flex-col gap-4 border-b border-[#eeeef2] px-5 py-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#7456a3]">
                  Inbox
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[20px] font-semibold text-[#202027]">
                    Your Notifications
                  </h2>

                  {unreadCount > 0 && (
                    <span className="inline-flex min-h-[26px] items-center rounded-full bg-[#f3eff8] px-2.5 text-[10px] font-semibold text-[#7456a3]">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <p className="mt-2 text-[13px] leading-5 text-[#757580]">
                  Select a notification to mark it as read.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                {/* SEARCH */}
                <div className="relative w-full sm:min-w-[300px] xl:w-[340px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9898a3]"
                  />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search notifications..."
                    className="h-[42px] w-full rounded-[9px] border border-[#e8e8ed] bg-[#fafafd] pl-10 pr-3 text-[13px] text-[#202027] outline-none transition placeholder:text-[#aaa9b3] focus:border-[#cfc4df] focus:bg-white"
                  />
                </div>

                {/* ON / OFF */}
                <div className="flex h-[42px] shrink-0 items-center rounded-[9px] border border-[#e8e8ed] bg-[#fafafd] p-1">
                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled(true)}
                    className={`h-full min-w-[60px] rounded-[7px] px-3 text-[11px] font-semibold transition ${
                      notificationsEnabled
                        ? "bg-white text-[#7456a3] shadow-sm"
                        : "text-[#9898a3] hover:text-[#666672]"
                    }`}
                  >
                    On
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled(false)}
                    className={`h-full min-w-[60px] rounded-[7px] px-3 text-[11px] font-semibold transition ${
                      !notificationsEnabled
                        ? "bg-white text-[#7456a3] shadow-sm"
                        : "text-[#9898a3] hover:text-[#666672]"
                    }`}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col gap-3 border-b border-[#eeeef2] bg-[#fafafd] px-5 py-3.5 sm:flex-row sm:items-center">
              <span className="text-[11px] font-semibold text-[#757580]">
                Show:
              </span>

              <div className="flex flex-wrap gap-1.5">
                {FILTER_OPTIONS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`min-h-[32px] rounded-[7px] px-3 text-[11px] font-semibold transition ${
                      activeFilter === filter.value
                        ? "border border-[#ded8e8] bg-white text-[#7456a3]"
                        : "border border-transparent text-[#757580] hover:bg-white hover:text-[#7456a3]"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTENT */}
            <div className="px-5 py-5">
              {!notificationsEnabled ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#f3eff8] text-[#7456a3]">
                    <Bell size={21} />
                  </div>

                  <h2 className="mt-4 text-[15px] font-semibold text-[#202027]">
                    Notifications are turned off
                  </h2>

                  <p className="mt-2 max-w-md text-[13px] leading-6 text-[#757580]">
                    Turn notifications back on to view updates from MOBI,
                    therapists, and the therapy center.
                  </p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-2.5">
                  {filteredNotifications.map((notification) => (
                    <article
                      key={notification.id}
                      className={`relative rounded-[12px] border transition ${
                        notification.isPinned
                          ? "border-[#d8cce5] bg-[#fdfbff]"
                          : notification.isRead
                            ? "border-[#eeeeF2] bg-white"
                            : "border-[#ded8e8] bg-[#fdfcff]"
                      }`}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          handleMarkAsRead(notification.id)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            handleMarkAsRead(notification.id);
                          }
                        }}
                        className="flex cursor-pointer items-start gap-3.5 px-4 py-4 pr-14 sm:px-5"
                      >
                        <NotificationAvatar
                          notification={notification}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`min-w-0 truncate text-[14px] text-[#202027] ${
                                notification.isRead
                                  ? "font-medium"
                                  : "font-semibold"
                              }`}
                            >
                              {notification.title}
                            </h3>

                            <SourceBadge
                              source={notification.source}
                            />

                            {notification.isPinned && (
                              <span className="inline-flex min-h-[25px] items-center gap-1 rounded-full bg-[#f3eff8] px-2.5 text-[10px] font-semibold text-[#7456a3]">
                                <Pin size={11} />
                                Pinned
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-[13px] leading-[1.6] text-[#666672]">
                            {notification.message}
                          </p>

                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="text-[11px] text-[#9898a3]">
                              {notification.createdAtLabel}
                            </span>

                            {!notification.isRead && (
                              <>
                                <span className="text-[#d5d5da]">•</span>
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#7456a3]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#7456a3]" />
                                  Unread
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* OPTIONS */}
                      <div className="absolute right-3 top-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId((currentId) =>
                              currentId === notification.id
                                ? null
                                : notification.id,
                            );
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#777781] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
                          aria-label={`Open options for ${notification.title}`}
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {openMenuId === notification.id && (
                          <div
                            className="absolute right-0 top-10 z-30 w-[190px] overflow-hidden rounded-[10px] border border-[#e8e8ed] bg-white py-1.5 shadow-[0_12px_28px_rgba(31,25,39,0.14)]"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleTogglePin(
                                  notification.id,
                                )
                              }
                              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12px] font-medium text-[#555560] transition hover:bg-[#f7f7f9]"
                            >
                              <Pin size={15} />
                              {notification.isPinned
                                ? "Unpin notification"
                                : "Pin notification"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(notification);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12px] font-medium text-[#a75555] transition hover:bg-[#faf0f0]"
                            >
                              <Trash2 size={15} />
                              Delete notification
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ACTION TOAST */}
      {actionMessage && (
        <div className="fixed right-4 top-4 z-[90] flex items-center gap-2 rounded-[10px] border border-[#d8cce5] bg-white px-4 py-3 text-[12px] font-semibold text-[#7456a3] shadow-[0_14px_36px_rgba(31,25,39,0.12)]">
          <CheckCircle2 size={15} />
          {actionMessage}
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-[2px]"
          onClick={() => setDeleteTarget(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[16px] border border-white/60 bg-white shadow-[0_22px_60px_rgba(31,25,39,0.16)]"
            role="dialog"
            aria-modal="true"
            aria-label="Delete notification"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#eeeef2] px-5 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#faf0f0] text-[#a75555]">
                  <Trash2 size={17} />
                </div>

                <div>
                  <h2 className="text-[18px] font-semibold text-[#202027]">
                    Delete Notification
                  </h2>

                  <p className="mt-1.5 text-[12px] leading-5 text-[#757580]">
                    This notification will be removed from your list.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#f6f6f8] text-[#71717a] transition hover:bg-[#f3eff8] hover:text-[#7456a3]"
                aria-label="Close delete confirmation"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-5">
              <div className="rounded-[10px] border border-[#eeeef2] bg-[#fafafd] p-4">
                <div className="flex items-center gap-2">
                  <SourceBadge source={deleteTarget.source} />

                  <span className="text-[11px] text-[#9898a3]">
                    {deleteTarget.createdAtLabel}
                  </span>
                </div>

                <h3 className="mt-3 text-[13px] font-semibold text-[#202027]">
                  {deleteTarget.title}
                </h3>

                <p className="mt-2 text-[12px] leading-5 text-[#666672]">
                  {deleteTarget.message}
                </p>
              </div>

              <p className="mt-4 text-[12px] leading-5 text-[#757580]">
                Are you sure you want to delete this notification?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#eeeef2] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="min-h-[40px] rounded-[8px] border border-[#e8e8ed] bg-white px-4 text-[12px] font-semibold text-[#666672] transition hover:bg-[#f7f7f9]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="min-h-[40px] rounded-[8px] border border-[#edcece] bg-[#faf0f0] px-4 text-[12px] font-semibold text-[#a75555] transition hover:bg-[#f7e7e7]"
              >
                Delete Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocNotificationScreen;
