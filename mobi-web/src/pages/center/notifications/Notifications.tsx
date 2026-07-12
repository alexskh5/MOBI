import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import CenterLayout from "../../../layouts/CenterLayout";

// Components
import NotificationCard from "../../../components/center/notifications/NotificationCard";
import NotificationToggle from "../../../components/center/notifications/NotificationToggle";

interface Notification {
    id: string;
    title: string;
    message: string;
    sender: string;
    category: "MOBI" | "Learning Activity";
    time: string;
    isRead: boolean;
    requiresAction: boolean;

    // For learning activity notifications
    activityId?: string;
    activityTitle?: string;
    submittedBy?: string;
    submittedAt?: string;
    thumbnailUrl?: string;
}

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");

    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    const [expandedId, setExpandedId] = useState<string | null>(null);

    // =======================================================
    // TEMPORARY MOCK DATA
    // Replace this with backend data later.
    // =======================================================

    useEffect(() => {
        setNotifications([
            {
                id: "1",
                title: "Learning Activity Submitted",
                message:
                    "Therapist Ruby Jane Villaester submitted a learning activity for review.",
                sender: "Therapist Ruby Jane Villaester",
                category: "Learning Activity",
                time: "2 weeks ago",
                isRead: false,
                requiresAction: true,

                activityId: "9ad855a2-de56-43ed-b02e-beadd7cb7eb8",
                activityTitle: "PLAY ACTIVITY",
                submittedBy: "Therapist Ruby Jane Villaester",
                submittedAt: "2 weeks ago",
                thumbnailUrl:
                    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500",
            },
            {
                id: "2",
                title: "Center Announcement",
                message:
                    "The MOBI system will undergo maintenance this Friday.",
                sender: "MOBI",
                category: "MOBI",
                time: "3 days ago",
                isRead: true,
                requiresAction: false,
            },
            {
                id: "3",
                title: "MOBI Update",
                message:
                    "A new activity preview feature is now available for center admins.",
                sender: "MOBI",
                category: "MOBI",
                time: "1 day ago",
                isRead: false,
                requiresAction: false,
            },
        ]);

        setLoading(false);
    }, []);

    const filteredNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            const search = searchTerm.toLowerCase();

            const matchesSearch =
                notification.title.toLowerCase().includes(search) ||
                notification.message.toLowerCase().includes(search) ||
                notification.sender.toLowerCase().includes(search) ||
                notification.activityTitle?.toLowerCase().includes(search) ||
                notification.submittedBy?.toLowerCase().includes(search);

            const matchesUnread =
                !showUnreadOnly ||
                !notification.isRead;

            return matchesSearch && matchesUnread;
        });
    }, [
        notifications,
        searchTerm,
        showUnreadOnly,
    ]);

    const handleExpand = (id: string) => {
        setExpandedId((prev) =>
            prev === id ? null : id
        );
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? {
                        ...notification,
                        isRead: true,
                    }
                    : notification
            )
        );
    };

    return (
        <CenterLayout>
            {(sidebarOpen, setSidebarOpen) => (
                <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter flex flex-col">

                    <div className="flex justify-between items-center mb-6">

                        <div className="flex items-center gap-4">

                            {!sidebarOpen && (
                                <button
                                    className="text-3xl"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    ☰
                                </button>
                            )}

                            <h1 className="text-5xl font-medium itim">
                                Notifications
                            </h1>

                        </div>

                        <div className="flex items-center gap-5">

                            <div className="flex items-center bg-[#F5EEF6] px-5 py-3 rounded-xl shadow-md w-96">

                                <Search
                                    size={20}
                                    className="text-gray-500 mr-3"
                                />

                                <input
                                    type="text"
                                    placeholder="Search notifications"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="bg-transparent outline-none w-full"
                                />

                            </div>

                            <NotificationToggle
                                enabled={showUnreadOnly}
                                onToggle={() =>
                                    setShowUnreadOnly(!showUnreadOnly)
                                }
                            />

                        </div>

                    </div>

                    <div className="border-b border-gray-500 mb-6"></div>

                    <div className="mt-2 flex-1 overflow-y-auto no-scrollbar pr-2">

                        {loading && (
                            <p className="text-center text-lg font-semibold">
                                Loading notifications...
                            </p>
                        )}

                        {!loading && filteredNotifications.length === 0 && (
                            <p className="text-center text-lg font-semibold">
                                No notifications found.
                            </p>
                        )}

                        {!loading &&
                            filteredNotifications.map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    expanded={
                                        expandedId === notification.id
                                    }
                                    onClick={() =>
                                        handleExpand(notification.id)
                                    }
                                    onMarkAsRead={handleMarkAsRead}
                                />
                            ))}

                    </div>

                </div>
            )}
        </CenterLayout>
    );
};

export default Notifications;