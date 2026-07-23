import { useEffect, useMemo, useState } from "react";
import type {
    ChangeEvent,
    MouseEvent,
} from "react";
import {
    Bell,
    CheckCircle2,
    FileText,
    MoreHorizontal,
    Pin,
    Search,
    Trash2,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CenterLayout from "../../../layouts/CenterLayout";

/* =========================================================
   TYPES
========================================================= */

type NotificationCategory =
    | "MOBI"
    | "Learning Activity";

type NotificationFilter =
    | "all"
    | "mobi"
    | "activity"
    | "recent";

interface CenterNotificationData {
    id: string;
    title: string;
    message: string;
    sender: string;
    category: NotificationCategory;

    createdAt: string;
    createdAtLabel: string;

    isRead: boolean;
    isPinned: boolean;
    requiresAction: boolean;

    avatarImage?: string | null;

    /*
     * Included only for activity-review notifications.
     */
    activityId?: string;
    activityTitle?: string;
    submittedBy?: string;
    submittedAt?: string;
    thumbnailUrl?: string;
}

/* =========================================================
   MOCK DATA

   Replace later with:
   GET /api/center/notifications
========================================================= */

const INITIAL_NOTIFICATIONS: CenterNotificationData[] = [
    {
        id: "notification-001",
        title: "Learning Activity Submitted",
        message:
            'Therapist Ruby Jane Villaester submitted "Play Activity" for center review.',
        sender: "Therapist Ruby Jane Villaester",
        category: "Learning Activity",

        createdAt: "2026-07-22T09:00:00+08:00",
        createdAtLabel: "Yesterday",

        isRead: false,
        isPinned: false,
        requiresAction: true,

        activityId:
            "9ad855a2-de56-43ed-b02e-beadd7cb7eb8",
        activityTitle: "Play Activity",
        submittedBy:
            "Therapist Ruby Jane Villaester",
        submittedAt: "Yesterday",
        thumbnailUrl:
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500",
    },
    {
        id: "notification-002",
        title: "Center Announcement",
        message:
            "The MOBI system will undergo scheduled maintenance this Friday at 8:00 PM.",
        sender: "MOBI",
        category: "MOBI",

        createdAt: "2026-07-21T14:30:00+08:00",
        createdAtLabel: "2 days ago",

        isRead: true,
        isPinned: false,
        requiresAction: false,

        avatarImage: null,
    },
    {
        id: "notification-003",
        title: "MOBI Update",
        message:
            "A new activity preview feature is now available for center administrators.",
        sender: "MOBI",
        category: "MOBI",

        createdAt: "2026-07-20T10:15:00+08:00",
        createdAtLabel: "3 days ago",

        isRead: false,
        isPinned: false,
        requiresAction: false,

        avatarImage: null,
    },
    {
        id: "notification-004",
        title: "Learning Activity Submitted",
        message:
            'Therapist John Lenon submitted "Animal Words" for review and publication.',
        sender: "Therapist John Lenon",
        category: "Learning Activity",

        createdAt: "2026-07-18T08:45:00+08:00",
        createdAtLabel: "5 days ago",

        isRead: true,
        isPinned: false,
        requiresAction: true,

        activityId:
            "9ad855a2-de56-43ed-b02e-beadd7cb7eb8",
        activityTitle: "Animal Words",
        submittedBy: "Therapist John Lenon",
        submittedAt: "5 days ago",
        thumbnailUrl:
            "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=500",
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
        value: "activity",
        label: "Learning Activities",
    },
    {
        value: "mobi",
        label: "From MOBI",
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
    notification: CenterNotificationData;
}) {
    if (notification.avatarImage) {
        return (
            <img
                src={notification.avatarImage}
                alt={notification.sender}
                className="h-11 w-11 rounded-full border border-[#CEBFD0] bg-white object-cover shadow-sm"
            />
        );
    }

    const isActivity =
        notification.category ===
        "Learning Activity";

    return (
        <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm ${
                isActivity
                    ? "border-[#D1B9D2] text-[#A65BB0]"
                    : "border-[#D9C9A5] text-[#D3AE4E]"
            }`}
            aria-label={`${notification.category} notification`}
        >
            {isActivity ? (
                <FileText size={21} />
            ) : (
                <Bell size={21} />
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/75 text-[#8C5C95] shadow-sm">
                <Bell size={30} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#2A242D]">
                No notifications found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
                There are no notifications matching
                your selected filter or search.
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

const Notifications = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] =
        useState<CenterNotificationData[]>(
            INITIAL_NOTIFICATIONS
        );

    const [
        showUnreadOnly,
        setShowUnreadOnly,
    ] = useState(false);

    const [activeFilter, setActiveFilter] =
        useState<NotificationFilter>("all");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [openMenuId, setOpenMenuId] =
        useState<string | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<CenterNotificationData | null>(
            null
        );

    const [actionMessage, setActionMessage] =
        useState("");

    /*
     * Close the three-dot options menu when the
     * user clicks somewhere else.
     */
    useEffect(() => {
        const handleDocumentClick = () => {
            setOpenMenuId(null);
        };

        document.addEventListener(
            "click",
            handleDocumentClick
        );

        return () => {
            document.removeEventListener(
                "click",
                handleDocumentClick
            );
        };
    }, []);

    /*
     * Automatically remove the temporary action message.
     */
    useEffect(() => {
        if (!actionMessage) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setActionMessage("");
        }, 2200);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [actionMessage]);

    const filteredNotifications = useMemo(() => {
        const normalizedSearch =
            searchTerm.trim().toLowerCase();

        const sevenDaysAgo = new Date();

        sevenDaysAgo.setDate(
            sevenDaysAgo.getDate() - 7
        );

        return [...notifications]
            .filter((notification) => {
                const searchableText = [
                    notification.title,
                    notification.message,
                    notification.sender,
                    notification.activityTitle,
                    notification.submittedBy,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    normalizedSearch.length === 0 ||
                    searchableText.includes(
                        normalizedSearch
                    );

                const matchesUnread =
                    !showUnreadOnly ||
                    !notification.isRead;

                let matchesCategory = true;

                if (activeFilter === "recent") {
                    matchesCategory =
                        new Date(
                            notification.createdAt
                        ).getTime() >=
                        sevenDaysAgo.getTime();
                }

                if (activeFilter === "mobi") {
                    matchesCategory =
                        notification.category ===
                        "MOBI";
                }

                if (
                    activeFilter === "activity"
                ) {
                    matchesCategory =
                        notification.category ===
                        "Learning Activity";
                }

                return (
                    matchesSearch &&
                    matchesUnread &&
                    matchesCategory
                );
            })
            .sort(
                (
                    firstNotification,
                    secondNotification
                ) => {
                    if (
                        firstNotification.isPinned !==
                        secondNotification.isPinned
                    ) {
                        return firstNotification.isPinned
                            ? -1
                            : 1;
                    }

                    return (
                        new Date(
                            secondNotification.createdAt
                        ).getTime() -
                        new Date(
                            firstNotification.createdAt
                        ).getTime()
                    );
                }
            );
    }, [
        activeFilter,
        notifications,
        searchTerm,
        showUnreadOnly,
    ]);

    const handleSearch = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTerm(event.target.value);
    };

    const handleMarkAsRead = (
        notificationId: string
    ) => {
        setNotifications(
            (currentNotifications) =>
                currentNotifications.map(
                    (notification) =>
                        notification.id ===
                        notificationId
                            ? {
                                  ...notification,
                                  isRead: true,
                              }
                            : notification
                )
        );

        /*
         * Backend later:
         *
         * PATCH /api/center/notifications/:notificationId/read
         */
    };

    const handleReviewActivity = (
        event: MouseEvent<HTMLButtonElement>,
        notification: CenterNotificationData
    ) => {
        event.stopPropagation();

        handleMarkAsRead(notification.id);

        if (!notification.activityId) {
            return;
        }

        navigate(
            `/center/materials/${notification.activityId}?from=notification&review=true`,
            {
                state: {
                    fromNotification: true,
                    reviewMode: true,
                    notificationId:
                        notification.id,
                },
            }
        );
    };

    const handleTogglePin = (
        notificationId: string
    ) => {
        const selectedNotification =
            notifications.find(
                (notification) =>
                    notification.id ===
                    notificationId
            );

        if (!selectedNotification) {
            return;
        }

        setNotifications(
            (currentNotifications) =>
                currentNotifications.map(
                    (notification) =>
                        notification.id ===
                        notificationId
                            ? {
                                  ...notification,
                                  isPinned:
                                      !notification.isPinned,
                              }
                            : notification
                )
        );

        setOpenMenuId(null);

        setActionMessage(
            selectedNotification.isPinned
                ? "Notification unpinned."
                : "Notification pinned to the top."
        );

        /*
         * Backend later:
         *
         * PATCH /api/center/notifications/:notificationId/pin
         *
         * Body:
         * {
         *     isPinned: boolean
         * }
         */
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setNotifications(
            (currentNotifications) =>
                currentNotifications.filter(
                    (notification) =>
                        notification.id !==
                        deleteTarget.id
                )
        );

        setDeleteTarget(null);
        setOpenMenuId(null);
        setActionMessage(
            "Notification deleted."
        );

        /*
         * Backend later:
         *
         * DELETE /api/center/notifications/:notificationId
         */
    };

    return (
        <CenterLayout>
            {(
                sidebarOpen,
                setSidebarOpen
            ) => (
                <div className="inter relative flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] bg-[#E4C9E5]/80 p-4 sm:p-6 lg:p-8">
                    {/* HEADER */}
                    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        {/* LEFT SIDE */}
                        <div className="flex items-center gap-4">
                            {!sidebarOpen && (
                                <button
                                    type="button"
                                    className="text-3xl leading-none"
                                    onClick={() =>
                                        setSidebarOpen(
                                            true
                                        )
                                    }
                                    aria-label="Open sidebar"
                                >
                                    ☰
                                </button>
                            )}

                            <h1 className="itim text-4xl font-medium sm:text-5xl">
                                Notifications
                            </h1>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
                            {/* SEARCH */}
                            <div className="flex w-full items-center rounded-xl bg-[#F5EEF6] px-4 py-3 shadow-md sm:px-5 xl:w-96">
                                <Search
                                    size={20}
                                    className="mr-3 shrink-0 text-gray-500"
                                />

                                <input
                                    type="search"
                                    placeholder="Search notifications"
                                    value={searchTerm}
                                    onChange={
                                        handleSearch
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
                                        className="ml-2 rounded-full p-1 text-gray-400 transition hover:bg-white hover:text-gray-700"
                                        aria-label="Clear notification search"
                                    >
                                        <X
                                            size={16}
                                        />
                                    </button>
                                )}
                            </div>

                            {/* UNREAD ONLY */}
                            <NotificationToggle
                                enabled={
                                    showUnreadOnly
                                }
                                onToggle={() =>
                                    setShowUnreadOnly(
                                        (
                                            currentValue
                                        ) =>
                                            !currentValue
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* DIVIDER */}
                    <div className="mb-5 border-b border-gray-500/70" />

                    {/* FILTER ROW */}
                    <div className="mb-5 overflow-x-auto">
                        <div className="flex min-w-max items-center gap-3">
                            {FILTER_OPTIONS.map(
                                (filter) => (
                                    <button
                                        key={
                                            filter.value
                                        }
                                        type="button"
                                        onClick={() =>
                                            setActiveFilter(
                                                filter.value
                                            )
                                        }
                                        className={`rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition ${
                                            activeFilter ===
                                            filter.value
                                                ? "bg-white text-[#965DEB]"
                                                : "bg-[#F5EEF6] text-gray-600 hover:bg-white"
                                        }`}
                                    >
                                        {
                                            filter.label
                                        }
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* NOTIFICATION CONTENT */}
                    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
                        {filteredNotifications.length ===
                        0 ? (
                            <EmptyState />
                        ) : (
                            <div className="w-full space-y-2 pb-4">
                                {filteredNotifications.map(
                                    (
                                        notification
                                    ) => {
                                        const isActivity =
                                            notification.category ===
                                            "Learning Activity";

                                        return (
                                            <article
                                                key={
                                                    notification.id
                                                }
                                                className="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-2"
                                            >
                                                {/* AVATAR */}
                                                <div className="flex justify-center pt-1">
                                                    <NotificationAvatar
                                                        notification={
                                                            notification
                                                        }
                                                    />
                                                </div>

                                                {/* CARD */}
                                                <div
                                                    role="button"
                                                    tabIndex={
                                                        0
                                                    }
                                                    onClick={() =>
                                                        handleMarkAsRead(
                                                            notification.id
                                                        )
                                                    }
                                                    onKeyDown={(
                                                        event
                                                    ) => {
                                                        if (
                                                            event.key ===
                                                                "Enter" ||
                                                            event.key ===
                                                                " "
                                                        ) {
                                                            event.preventDefault();

                                                            handleMarkAsRead(
                                                                notification.id
                                                            );
                                                        }
                                                    }}
                                                    className={`relative min-w-0 cursor-pointer rounded-[26px] border px-5 py-4 pr-24 shadow-md transition hover:-translate-y-[1px] hover:shadow-lg sm:px-6 sm:pr-28 ${
                                                        notification.isPinned
                                                            ? "border-[#B68BBF] bg-[#FFFAFF] ring-1 ring-[#D9BCDF]"
                                                            : notification.isRead
                                                              ? "border-white/70 bg-white/85"
                                                              : "border-white bg-white"
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        {/* BADGES */}
                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                            {notification.isPinned && (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFE3F2] px-2.5 py-1 text-[11px] font-bold text-[#744C7B]">
                                                                    <Pin
                                                                        size={
                                                                            13
                                                                        }
                                                                    />
                                                                    Pinned
                                                                </span>
                                                            )}

                                                            {isActivity &&
                                                                notification.requiresAction && (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2E6F5] px-2.5 py-1 text-[11px] font-bold text-[#82548C]">
                                                                        <CheckCircle2
                                                                            size={
                                                                                13
                                                                            }
                                                                        />
                                                                        Review
                                                                        required
                                                                    </span>
                                                                )}
                                                        </div>

                                                        {/* TITLE */}
                                                        <h2 className="text-sm font-bold text-[#221D24] sm:text-[15px]">
                                                            {
                                                                notification.title
                                                            }
                                                        </h2>

                                                        {/* MESSAGE */}
                                                        <p className="mt-1 pr-2 text-xs leading-5 text-gray-600 sm:text-sm">
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        {/* METADATA */}
                                                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                                                            <span>
                                                                {
                                                                    notification.sender
                                                                }
                                                            </span>

                                                            <span>
                                                                •
                                                            </span>

                                                            <span>
                                                                {
                                                                    notification.createdAtLabel
                                                                }
                                                            </span>
                                                        </div>

                                                        {/* ACTIVITY REVIEW ACTION */}
                                                        {isActivity &&
                                                            notification.requiresAction &&
                                                            notification.activityId && (
                                                                <div
                                                                    className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#F8F2FA] p-4 sm:flex-row sm:items-center sm:justify-between"
                                                                    onClick={(
                                                                        event
                                                                    ) =>
                                                                        event.stopPropagation()
                                                                    }
                                                                >
                                                                    <div className="min-w-0">
                                                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#94619D]">
                                                                            Learning
                                                                            Activity
                                                                        </p>

                                                                        <p className="mt-1 truncate text-sm font-bold text-gray-900">
                                                                            {notification.activityTitle ||
                                                                                notification.title}
                                                                        </p>

                                                                        <p className="mt-1 truncate text-xs text-gray-500">
                                                                            Submitted
                                                                            by{" "}
                                                                            {notification.submittedBy ||
                                                                                notification.sender}
                                                                        </p>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            event
                                                                        ) =>
                                                                            handleReviewActivity(
                                                                                event,
                                                                                notification
                                                                            )
                                                                        }
                                                                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#82548C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#704578]"
                                                                    >
                                                                        <FileText
                                                                            size={
                                                                                17
                                                                            }
                                                                        />
                                                                        Review
                                                                        Activity
                                                                    </button>
                                                                </div>
                                                            )}
                                                    </div>

                                                    {/* DATE AND OPTIONS */}
                                                    <div className="absolute right-3 top-3 flex items-center gap-1 sm:right-4">
                                                        <span className="hidden whitespace-nowrap text-[11px] text-gray-500 sm:inline">
                                                            {
                                                                notification.createdAtLabel
                                                            }
                                                        </span>

                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={(
                                                                    event
                                                                ) => {
                                                                    event.stopPropagation();

                                                                    setOpenMenuId(
                                                                        (
                                                                            currentId
                                                                        ) =>
                                                                            currentId ===
                                                                            notification.id
                                                                                ? null
                                                                                : notification.id
                                                                    );
                                                                }}
                                                                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-[#F3EAF4]"
                                                                aria-label={`Open options for ${notification.title}`}
                                                            >
                                                                <MoreHorizontal
                                                                    size={
                                                                        20
                                                                    }
                                                                />
                                                            </button>

                                                            {openMenuId ===
                                                                notification.id && (
                                                                <div
                                                                    className="absolute right-0 top-9 z-50 w-48 overflow-hidden rounded-xl border border-[#E5D9E7] bg-white py-1 shadow-xl"
                                                                    onClick={(
                                                                        event
                                                                    ) =>
                                                                        event.stopPropagation()
                                                                    }
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleTogglePin(
                                                                                notification.id
                                                                            )
                                                                        }
                                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#3C343F] transition hover:bg-[#F7F0F7]"
                                                                    >
                                                                        <Pin
                                                                            size={
                                                                                16
                                                                            }
                                                                        />

                                                                        {notification.isPinned
                                                                            ? "Unpin notification"
                                                                            : "Pin notification"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setDeleteTarget(
                                                                                notification
                                                                            );

                                                                            setOpenMenuId(
                                                                                null
                                                                            );
                                                                        }}
                                                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                        Delete
                                                                        notification
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* UNREAD INDICATOR */}
                                                    {!notification.isRead && (
                                                        <span
                                                            className="absolute bottom-4 right-6 h-2.5 w-2.5 rounded-full bg-[#D77DDE]"
                                                            title="Unread"
                                                        />
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </div>

                    {/* ACTION MESSAGE */}
                    {actionMessage && (
                        <div className="fixed right-4 top-4 z-[90] rounded-2xl border border-[#DFCDE3] bg-white px-4 py-3 text-sm font-semibold text-[#68466F] shadow-xl">
                            {actionMessage}
                        </div>
                    )}

                    {/* DELETE CONFIRMATION */}
                    {deleteTarget && (
                        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]">
                            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                                {/* MODAL HEADER */}
                                <div className="flex items-start justify-between gap-4 border-b border-[#EADFEB] px-6 py-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                            <Trash2
                                                size={
                                                    20
                                                }
                                            />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-[#241F26]">
                                                Delete
                                                notification?
                                            </h2>

                                            <p className="mt-1 text-sm leading-6 text-gray-500">
                                                This
                                                notification
                                                will be
                                                removed from
                                                your list.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeleteTarget(
                                                null
                                            )
                                        }
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-[#F4EBF5] hover:text-[#7A4B80]"
                                        aria-label="Close delete confirmation"
                                    >
                                        <X
                                            size={20}
                                        />
                                    </button>
                                </div>

                                {/* SELECTED NOTIFICATION */}
                                <div className="px-6 py-5">
                                    <div className="rounded-2xl bg-[#F8F2F8] p-4">
                                        <p className="text-sm font-bold text-[#2B252D]">
                                            {
                                                deleteTarget.title
                                            }
                                        </p>

                                        <p className="mt-1 text-sm leading-5 text-gray-600">
                                            {
                                                deleteTarget.message
                                            }
                                        </p>
                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-gray-500">
                                        Are you sure you
                                        want to delete this
                                        notification? This
                                        action cannot be
                                        undone.
                                    </p>
                                </div>

                                {/* MODAL ACTIONS */}
                                <div className="flex flex-col-reverse gap-3 border-t border-[#EADFEB] px-6 py-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeleteTarget(
                                                null
                                            )
                                        }
                                        className="rounded-xl border border-[#DDD0DF] px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-[#F7F1F7]"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleConfirmDelete
                                        }
                                        className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                                    >
                                        Delete
                                        notification
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

export default Notifications;