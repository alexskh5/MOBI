import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
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

/* =========================================================
   ICONS
========================================================= */

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m20 20-4-4"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function PinIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14 4 6 6-3 1-4 4-1 5-2-2-2-2 5-1 4-4 1-3-6-6-3 2Z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6l12 12M18 6 6 18"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 21h4"
      />
    </svg>
  );
}

function CenterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20V8l8-4 8 4v12"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 20v-7h8v7M8 9h.01M12 9h.01M16 9h.01"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 21a7 7 0 0 1 14 0"
      />
    </svg>
  );
}

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
        className="h-10 w-10 rounded-full border border-[#cebfd0] bg-white object-cover shadow-sm"
      />
    );
  }

  const content: ReactNode =
    notification.source === "mobi" ? (
      <BellIcon />
    ) : notification.source === "therapist" ? (
      <PersonIcon />
    ) : (
      <CenterIcon />
    );

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm ${
        notification.source === "mobi"
          ? "border-[#d9c9a5] text-[#d3ae4e]"
          : notification.source === "therapist"
            ? "border-[#d1b9d2] text-[#c28ac2]"
            : "border-[#bfe0d9] text-[#47b9ab]"
      }`}
      aria-label={`${notification.title} avatar`}
    >
      {content}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-[#8c5c95] shadow-sm">
        <BellIcon />
      </div>

      <h2 className="mt-5 text-lg font-bold text-[#2a242d]">
        No notifications found
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        There are no notifications matching the current filter or search.
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<DoctorNotification | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  const menuContainerRef = useRef<HTMLDivElement | null>(null);

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

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
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
    setActionMessage(
      target?.isPinned
        ? "Notification unpinned."
        : "Notification pinned to the top.",
    );
    window.setTimeout(() => setActionMessage(""), 2200);

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
    setActionMessage("Notification deleted.");
    window.setTimeout(() => setActionMessage(""), 2200);

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
    <div className="min-h-screen bg-white font-professional">
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
          className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-xl border border-[#e5deeb] bg-white text-slate-600 shadow-md transition hover:bg-[#f3eef9] hover:text-[#8257bd] lg:flex"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <MenuIcon />
        </button>
      )}

      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarOpen ? "lg:pl-[280px]" : "lg:pl-0"
        }`}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e7dce8] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-[#f4e9f5]"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[#201c23]">
              Notifications
            </p>
            <p className="truncate text-xs text-slate-500">
              {unreadCount} unread notification
              {unreadCount === 1 ? "" : "s"}
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 lg:px-7 lg:py-5 xl:px-9">
          <section className="min-h-[calc(100vh-40px)] overflow-hidden rounded-[30px] bg-[#ead8ec] shadow-[0_12px_36px_rgba(75,43,78,0.08)]">
            {/* Heading row */}
            <div className="flex flex-col gap-4 border-b border-[#d1bdd3] px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-9">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                    Notifications
                  </h1>

                  <p className="mt-1 text-sm text-slate-600 lg:hidden">
                    {unreadCount} unread
                  </p>
                </div>

                {/* On / Off control */}
                <div className="inline-flex h-10 w-fit overflow-hidden rounded-xl bg-white/80 shadow-[0_3px_8px_rgba(67,43,70,0.18)]">
                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled(true)}
                    className={`min-w-[58px] px-4 text-sm font-semibold transition ${
                      notificationsEnabled
                        ? "bg-[#db83df] text-black shadow-sm"
                        : "text-[#3a333c] hover:bg-white"
                    }`}
                  >
                    On
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled(false)}
                    className={`min-w-[58px] px-4 text-sm font-semibold transition ${
                      !notificationsEnabled
                        ? "bg-[#db83df] text-black shadow-sm"
                        : "text-[#3a333c] hover:bg-white"
                    }`}
                  >
                    Off
                  </button>
                </div>
              </div>

              <div className="relative w-full lg:max-w-[440px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                  <SearchIcon />
                </div>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search notification"
                  className="h-12 w-full rounded-xl border border-white/70 bg-white/80 pl-11 pr-4 text-sm text-[#2d2730] shadow-[0_3px_8px_rgba(67,43,70,0.18)] outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-4 focus:ring-white/35"
                />
              </div>
            </div>

            {/* Filter tabs */}
            <div className="px-4 sm:px-6">
              <div className="mx-auto max-w-[710px] overflow-x-auto rounded-b-[18px] bg-white">
                <div className="flex min-w-max items-center justify-center">
                  {(
                    [
                      ["mobi", "From MOBI"],
                      ["therapist", "Therapist"],
                      ["center", "Center"],
                      ["recent", "Recent"],
                      ["all", "All"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setActiveFilter(value)}
                      className={`min-w-[120px] px-5 py-4 text-sm font-medium transition ${
                        activeFilter === value
                          ? "text-[#ff6900]"
                          : "text-slate-500 hover:bg-[#fbf7fb] hover:text-[#7b4e82]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification list */}
            <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
              {!notificationsEnabled ? (
                <div className="mx-auto flex min-h-[380px] max-w-2xl flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/75 text-[#8c5c95] shadow-sm">
                    <BellIcon />
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-[#2a242d]">
                    Notifications are turned off
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Turn notifications back on to view updates from MOBI,
                    therapists, and your center.
                  </p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="mx-auto max-w-[1060px] space-y-3">
                  {filteredNotifications.map((notification) => (
                    <article
                      key={notification.id}
                      className="relative grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3"
                    >
                      {/* Avatar positioned beside the card like the prototype */}
                      <div className="flex justify-center">
                        <NotificationAvatar
                          notification={notification}
                        />
                      </div>

                      <div
                        onClick={() =>
                          handleMarkAsRead(notification.id)
                        }
                        className={`relative min-w-0 cursor-pointer rounded-[28px] border px-6 py-4 pr-20 shadow-[0_3px_5px_rgba(68,51,70,0.28)] transition hover:-translate-y-[1px] hover:shadow-[0_5px_10px_rgba(68,51,70,0.24)] ${
                          notification.isPinned
                            ? "border-[#b68bbf] bg-[#fffaff] ring-1 ring-[#d9bcdf]"
                            : notification.isRead
                              ? "border-white/75 bg-white/88"
                              : "border-white bg-white"
                        }`}
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          <div className="min-w-0 flex-1">
                            {notification.isPinned && (
                              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#efe3f2] px-2.5 py-1 text-[11px] font-bold text-[#744c7b]">
                                <PinIcon className="h-3.5 w-3.5" />
                                Pinned
                              </div>
                            )}
                            <h2 className="truncate text-sm font-bold text-[#221d24] sm:text-[15px]">
                              {notification.title}
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="absolute right-4 top-3 flex items-center gap-3">
                          <span className="whitespace-nowrap text-[11px] text-slate-500">
                            {notification.createdAtLabel}
                          </span>

                          <div
                            ref={menuContainerRef}
                            className="relative"
                          >
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
                              className="flex h-8 w-8 items-center justify-center rounded-full text-black transition hover:bg-[#f3eaf4]"
                              aria-label={`Open options for ${notification.title}`}
                            >
                              <MoreIcon />
                            </button>

                            {openMenuId === notification.id && (
                              <div
                                className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-[#e5d9e7] bg-white py-1 shadow-[0_12px_26px_rgba(44,27,48,0.18)]"
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
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#3c343f] transition hover:bg-[#f7f0f7]"
                                >
                                  <PinIcon />
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
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  <TrashIcon />
                                  Delete notification
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {!notification.isRead && (
                          <span
                            className="absolute bottom-4 right-6 h-2.5 w-2.5 rounded-full bg-[#d77dde]"
                            title="Unread"
                          />
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

      {actionMessage && (
        <div className="fixed right-4 top-4 z-[90] rounded-2xl border border-[#dfcde3] bg-white px-4 py-3 text-sm font-semibold text-[#68466f] shadow-xl">
          {actionMessage}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#eadfeb] px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <TrashIcon />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#241f26]">
                    Delete notification?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    This notification will be removed from your list.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#f4ebf5] hover:text-[#7a4b80]"
                aria-label="Close delete confirmation"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl bg-[#f8f2f8] p-4">
                <p className="text-sm font-bold text-[#2b252d]">
                  {deleteTarget.title}
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  {deleteTarget.message}
                </p>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Are you sure you want to delete this notification?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#eadfeb] px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-[#ddd0df] px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-[#f7f1f7]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Delete notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocNotificationScreen;
