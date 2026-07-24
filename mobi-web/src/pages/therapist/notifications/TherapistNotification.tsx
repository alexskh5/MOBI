import {
  Bell,
  Building2,
  CalendarDays,
  MoreHorizontal,
  Pin,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import CenterLayout from "../../../layouts/CenterLayout";

/* =========================================================
   TYPES
========================================================= */

type NotificationSource = "mobi" | "center" | "schedule";

type NotificationFilter =
  | NotificationSource
  | "recent"
  | "all";

interface TherapistNotificationData {
  id: string;
  title: string;
  message: string;
  source: NotificationSource;
  createdAt: string;
  createdAtLabel: string;
  isRead: boolean;
  isPinned: boolean;
  avatarImage?: string | null;
}

/* =========================================================
   STATIC PREVIEW DATA

   Replace later with:
   GET /api/therapist/notifications
========================================================= */

const INITIAL_NOTIFICATIONS: TherapistNotificationData[] = [
  {
    id: "notification-001",
    title: "MOBI (Modernized Bridge Intervention)",
    message:
      "Your activity draft has been saved. You may continue editing it from My Materials.",
    source: "mobi",
    createdAt: "2026-07-21T09:00:00+08:00",
    createdAtLabel: "Today",
    isRead: false,
    isPinned: false,
    avatarImage: null,
  },
  {
    id: "notification-002",
    title: "Abled Minds Therapy Center",
    message:
      'Your activity "Animal Words" was approved and is now available for learner assignment.',
    source: "center",
    createdAt: "2026-07-20T14:30:00+08:00",
    createdAtLabel: "Yesterday",
    isRead: false,
    isPinned: false,
    avatarImage: null,
  },
  {
    id: "notification-003",
    title: "Upcoming Session",
    message:
      "You have a speech-training session with Lexi Pantaleon today at 2:30 PM.",
    source: "schedule",
    createdAt: "2026-07-20T11:15:00+08:00",
    createdAtLabel: "Yesterday",
    isRead: true,
    isPinned: false,
    avatarImage: null,
  },
  {
    id: "notification-004",
    title: "Modification Requested",
    message:
      'The center requested changes to "Saying Hello: Social Story." Review the comments before resubmitting.',
    source: "center",
    createdAt: "2026-07-18T10:20:00+08:00",
    createdAtLabel: "3 days ago",
    isRead: true,
    isPinned: false,
    avatarImage: null,
  },
  {
    id: "notification-005",
    title: "Schedule Updated",
    message:
      "Your session with Miguel Santos was moved to July 23, 2026 at 10:00 AM.",
    source: "schedule",
    createdAt: "2026-07-17T16:45:00+08:00",
    createdAtLabel: "4 days ago",
    isRead: true,
    isPinned: false,
    avatarImage: null,
  },
];

/* =========================================================
   FILTER OPTIONS
========================================================= */

const FILTER_OPTIONS: Array<{
  value: NotificationFilter;
  label: string;
}> = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "mobi",
    label: "From MOBI",
  },
  {
    value: "center",
    label: "Center",
  },
  {
    value: "schedule",
    label: "Schedule",
  },
  {
    value: "recent",
    label: "Recent",
  },
];

/* =========================================================
   NOTIFICATION AVATAR
========================================================= */

function NotificationAvatar({
  notification,
}: {
  notification: TherapistNotificationData;
}) {
  if (notification.avatarImage) {
    return (
      <img
        src={notification.avatarImage}
        alt={notification.title}
        className="h-11 w-11 rounded-full border border-[#cebfd0] bg-white object-cover shadow-sm"
      />
    );
  }

  const avatarStyle =
    notification.source === "mobi"
      ? "border-[#d9c9a5] text-[#d3ae4e]"
      : notification.source === "center"
        ? "border-[#bfe0d9] text-[#47b9ab]"
        : "border-[#d1b9d2] text-[#b875bd]";

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm ${avatarStyle}`}
      aria-label={`${notification.title} notification`}
    >
      {notification.source === "mobi" ? (
        <Bell size={21} />
      ) : notification.source === "center" ? (
        <Building2 size={21} />
      ) : (
        <CalendarDays size={21} />
      )}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/75 text-[#8c5c95] shadow-sm">
        <Bell size={30} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-[#2a242d]">
        No notifications found
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
        There are no notifications matching the selected filter or search.
      </p>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
interface NotificationToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

const NotificationToggle = ({
    enabled,
    onToggle,
}: NotificationToggleProps) => {
    return (
        <div className="flex shrink-0 items-center gap-3">
            <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                Unread Only
            </span>

            <button
                type="button"
                onClick={onToggle}
                aria-label={
                    enabled
                        ? "Show all notifications"
                        : "Show unread notifications only"
                }
                aria-pressed={enabled}
                className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 ${
                    enabled
                        ? "bg-[#9021C4]"
                        : "bg-gray-300"
                }`}
            >
                <span
                    className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                        enabled
                            ? "translate-x-6"
                            : "translate-x-0"
                    }`}
                />
            </button>
        </div>
    );
};

const TherapistNotification = () => {
  const [notifications, setNotifications] = useState<
    TherapistNotificationData[]
  >(INITIAL_NOTIFICATIONS);

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const [activeFilter, setActiveFilter] =
    useState<NotificationFilter>("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(
    null,
  );

  const [deleteTarget, setDeleteTarget] =
    useState<TherapistNotificationData | null>(null);

  const [actionMessage, setActionMessage] = useState("");

  /* Close the options menu when clicking outside. */
  useEffect(() => {
    const handleDocumentClick = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener(
        "click",
        handleDocumentClick,
      );
    };
  }, []);

  /* Hide the temporary message automatically. */
  useEffect(() => {
    if (!actionMessage) return;

    const timeoutId = window.setTimeout(() => {
      setActionMessage("");
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [actionMessage]);

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return [...notifications]
        .filter((notification) => {
        const searchableText =
            `${notification.title} ${notification.message}`.toLowerCase();

        const matchesSearch =
            normalizedSearch.length === 0 ||
            searchableText.includes(normalizedSearch);

        const matchesUnread =
            !showUnreadOnly || !notification.isRead;

        let matchesCategory = true;

        if (activeFilter === "recent") {
            matchesCategory =
            new Date(notification.createdAt).getTime() >=
            sevenDaysAgo.getTime();
        } else if (activeFilter !== "all") {
            matchesCategory =
            notification.source === activeFilter;
        }

        return matchesSearch && matchesUnread && matchesCategory;
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
    }, [
    activeFilter,
    notifications,
    searchTerm,
    showUnreadOnly,
    ]);

  const handleSearch = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerm(event.target.value);
  };

  const handleMarkAsRead = (
    notificationId: string,
  ) => {
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

      PATCH /api/therapist/notifications/:notificationId/read
    */
  };

  const handleTogglePin = (
    notificationId: string,
  ) => {
    const selectedNotification = notifications.find(
      (notification) =>
        notification.id === notificationId,
    );

    if (!selectedNotification) return;

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
      selectedNotification.isPinned
        ? "Notification unpinned."
        : "Notification pinned to the top.",
    );

    /*
      Later backend call:

      PATCH /api/therapist/notifications/:notificationId/pin

      Body:
      {
        isPinned: boolean
      }
    */
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) =>
          notification.id !== deleteTarget.id,
      ),
    );

    setDeleteTarget(null);
    setOpenMenuId(null);
    setActionMessage("Notification deleted.");

    /*
      Later backend call:

      DELETE /api/therapist/notifications/:notificationId
    */
  };

    return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col relative">
          {/* HEADER */}
            <div className="flex items-center justify-between gap-6 mb-6">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">
                {!sidebarOpen && (
                <button
                    type="button"
                    className="text-3xl leading-none"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sidebar"
                >
                    ☰
                </button>
                )}

                <h1 className="text-5xl font-medium itim">
                Notifications
                </h1>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-5">
                {/* SEARCH */}
                <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96">
                <Search
                    size={20}
                    className="text-gray-500 mr-3 shrink-0"
                />

                <input
                    type="search"
                    placeholder="Search notifications"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="bg-transparent outline-none w-full"
                />
                </div>

                {/* UNREAD ONLY TOGGLE */}
                <NotificationToggle
                enabled={showUnreadOnly}
                onToggle={() =>
                    setShowUnreadOnly((currentValue) => !currentValue)
                }
                />
            </div>
            </div>

            {/* DIVIDER */}
            <div className="border-b border-gray-500 mb-6" />

        {/* FILTER ROW */}
        <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max items-center gap-3">
            {FILTER_OPTIONS.map((filter) => (
            <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition ${
                activeFilter === filter.value
                    ? "bg-white text-[#965DEB]"
                    : "bg-[#F5EEF6] text-gray-600 hover:bg-white"
                }`}
            >
                {filter.label}
            </button>
            ))}
        </div>
        </div>

        {/* NOTIFICATION CONTENT */}
        <div className="no-scrollbar flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
            <EmptyState />
        ) : (
            <div className="w-full space-y-2">
            {filteredNotifications.map((notification) => (
                  <article
                    key={notification.id}
                    className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2"
                  >
                    {/* AVATAR */}
                    <div className="flex justify-center">
                      <NotificationAvatar
                        notification={notification}
                      />
                    </div>

                    {/* NOTIFICATION CARD */}
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
                          event.preventDefault();

                          handleMarkAsRead(
                            notification.id,
                          );
                        }
                      }}
                      className={`relative min-w-0 cursor-pointer rounded-[26px] border px-6 py-4 pr-28 shadow-md transition hover:-translate-y-[1px] hover:shadow-lg ${
                        notification.isPinned
                          ? "border-[#b68bbf] bg-[#fffaff] ring-1 ring-[#d9bcdf]"
                          : notification.isRead
                            ? "border-white/70 bg-white/85"
                            : "border-white bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        {notification.isPinned && (
                          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#efe3f2] px-2.5 py-1 text-[11px] font-bold text-[#744c7b]">
                            <Pin size={13} />
                            Pinned
                          </div>
                        )}

                        <h2 className="truncate text-sm font-bold text-[#221d24] sm:text-[15px]">
                          {notification.title}
                        </h2>

                        <p className="mt-1 pr-2 text-xs leading-5 text-gray-600 sm:text-sm">
                          {notification.message}
                        </p>
                      </div>

                      {/* DATE AND OPTIONS */}
                      <div className="absolute right-4 top-3 flex items-center gap-2">
                        <span className="whitespace-nowrap text-[11px] text-gray-500">
                          {notification.createdAtLabel}
                        </span>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              setOpenMenuId(
                                (currentId) =>
                                  currentId ===
                                  notification.id
                                    ? null
                                    : notification.id,
                              );
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-[#f3eaf4]"
                            aria-label={`Open options for ${notification.title}`}
                          >
                            <MoreHorizontal size={20} />
                          </button>

                          {openMenuId ===
                            notification.id && (
                            <div
                              className="absolute right-0 top-9 z-50 w-48 overflow-hidden rounded-xl border border-[#e5d9e7] bg-white py-1 shadow-xl"
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
                                <Pin size={16} />

                                {notification.isPinned
                                  ? "Unpin notification"
                                  : "Pin notification"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget(
                                    notification,
                                  );

                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                Delete notification
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* UNREAD INDICATOR */}
                      {!notification.isRead && (
                        <span
                          className="absolute bottom-4 right-6 h-2.5 w-2.5 rounded-full bg-[#d77dde]"
                          title="Unread"
                        />
                      )}
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>

        {/* TEMPORARY ACTION MESSAGE */}
        {actionMessage && (
          <div className="fixed right-4 top-4 z-[90] rounded-2xl border border-[#dfcde3] bg-white px-4 py-3 text-sm font-semibold text-[#68466f] shadow-xl">
            {actionMessage}
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteTarget && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* MODAL HEADER */}
              <div className="flex items-start justify-between gap-4 border-b border-[#eadfeb] px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Trash2 size={20} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#241f26]">
                      Delete notification?
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      This notification will be removed from
                      your list.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-[#f4ebf5] hover:text-[#7a4b80]"
                  aria-label="Close delete confirmation"
                >
                  <X size={20} />
                </button>
              </div>

              {/* SELECTED NOTIFICATION */}
              <div className="px-6 py-5">
                <div className="rounded-2xl bg-[#f8f2f8] p-4">
                  <p className="text-sm font-bold text-[#2b252d]">
                    {deleteTarget.title}
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    {deleteTarget.message}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-6 text-gray-500">
                  Are you sure you want to delete this
                  notification? This action cannot be undone.
                </p>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#eadfeb] px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-[#ddd0df] px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-[#f7f1f7]"
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
        )}
    </CenterLayout>
  );
};

export default TherapistNotification;