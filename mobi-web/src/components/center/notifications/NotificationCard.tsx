import type { MouseEvent } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Notification {
    id: string;
    title: string;
    message: string;
    sender: string;
    category: "MOBI" | "Learning Activity";
    time: string;
    isRead: boolean;
    requiresAction: boolean;

    activityId?: string;
    activityTitle?: string;
    submittedBy?: string;
    submittedAt?: string;
    thumbnailUrl?: string;
}

interface NotificationCardProps {
    notification: Notification;
    expanded: boolean;
    onClick: () => void;
    onMarkAsRead: (id: string) => void;
}

const NotificationCard = ({
    notification,
    expanded,
    onClick,
    onMarkAsRead,
}: NotificationCardProps) => {
    const navigate = useNavigate();

    const isLearningActivity =
        notification.category === "Learning Activity";

    const handleMarkAsRead = (
        event: MouseEvent<HTMLButtonElement>
    ) => {
        event.stopPropagation();

        onMarkAsRead(notification.id);
    };

    const handleReviewActivity = (
        event: MouseEvent<HTMLButtonElement>
    ) => {
        event.stopPropagation();

        onMarkAsRead(notification.id);

        if (!notification.activityId) return;

        navigate(`/center/materials/${notification.activityId}?from=notification&review=true`);
    };

    return (
        <div
            className="
                bg-white
                rounded-3xl
                shadow-md
                mb-5
                overflow-hidden
                transition-all
                duration-300
            "
        >
            <button
                onClick={onClick}
                className="
                    w-full
                    flex
                    items-center
                    justify-between
                    px-6
                    py-5
                    text-left
                "
            >
                <div className="flex items-start gap-4 flex-1">

                    {/* Notification Icon */}
                    <div
                        className="
                            h-12
                            w-12
                            rounded-full
                            bg-[#E4C9E5]
                            flex
                            items-center
                            justify-center
                            text-xl
                            shrink-0
                        "
                    >
                        🔔
                    </div>

                    {/* Notification Details */}
                    <div className="flex-1">

                        <div className="flex items-center gap-3">

                            <h2 className="font-bold text-lg">
                                {notification.title}
                            </h2>

                            {!notification.isRead && (
                                <span
                                    className="
                                        h-2
                                        w-2
                                        rounded-full
                                        bg-purple-600
                                    "
                                />
                            )}

                        </div>

                        <p className="text-sm text-gray-700 mt-1">
                            {notification.message}
                        </p>

                        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">

                            <span>{notification.sender}</span>

                            <span>•</span>

                            <span>{notification.time}</span>

                        </div>

                    </div>

                </div>

                <div className="ml-6">

                    {expanded ? (
                        <ChevronUp size={22} />
                    ) : (
                        <ChevronDown size={22} />
                    )}

                </div>

            </button>

            {expanded && (
                <div
                    className="
                        border-t
                        border-gray-200
                        px-6
                        py-6
                        animate-in
                        fade-in
                    "
                >
                    {isLearningActivity ? (
                        <div className="flex gap-6">

                            {/* Activity Thumbnail */}

                            <div
                                className="
                                    w-64
                                    h-40
                                    rounded-2xl
                                    bg-gray-200
                                    flex
                                    items-center
                                    justify-center
                                    text-gray-500
                                    shrink-0
                                    overflow-hidden
                                "
                            >
                                {notification.thumbnailUrl ? (
                                    <img
                                        src={notification.thumbnailUrl}
                                        alt={
                                            notification.activityTitle ||
                                            notification.title
                                        }
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    "Thumbnail"
                                )}
                            </div>

                            {/* Activity Details */}

                            <div className="flex-1">

                                <p className="text-sm text-purple-600 font-semibold">
                                    Learning Activity
                                </p>

                                <h2 className="text-2xl font-bold mt-1">
                                    {notification.activityTitle ||
                                        notification.title}
                                </h2>

                                <p className="text-gray-600 mt-3">
                                    This learning activity has been submitted for review.
                                    Please review the activity before approving it for
                                    publication in the library.
                                </p>

                                <div className="mt-5 space-y-1 text-sm text-gray-600">

                                    <p>
                                        <span className="font-semibold">
                                            Submitted by:
                                        </span>{" "}
                                        {notification.submittedBy ||
                                            notification.sender}
                                    </p>

                                    <p>
                                        <span className="font-semibold">
                                            Submitted:
                                        </span>{" "}
                                        {notification.submittedAt ||
                                            notification.time}
                                    </p>

                                </div>

                                {/* Buttons */}

                                <div className="flex gap-4 mt-8">

                                    <button
                                        onClick={handleReviewActivity}
                                        className="
                                            bg-[#9021C4]
                                            text-white
                                            px-6
                                            py-3
                                            rounded-xl
                                            hover:bg-[#7b18a8]
                                            transition
                                        "
                                    >
                                        Review Activity
                                    </button>

                                    <button
                                        onClick={handleMarkAsRead}
                                        disabled={notification.isRead}
                                        className="
                                            bg-white
                                            border
                                            border-[#9021C4]
                                            text-[#9021C4]
                                            px-6
                                            py-3
                                            rounded-xl
                                            hover:bg-[#F5EEF6]
                                            transition
                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        {notification.isRead
                                            ? "Read"
                                            : "Mark as Read"}
                                    </button>

                                </div>

                            </div>

                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-600">
                                {notification.message}
                            </p>

                            <div className="mt-5 space-y-1 text-sm text-gray-600">

                                <p>
                                    <span className="font-semibold">
                                        From:
                                    </span>{" "}
                                    {notification.sender}
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Time:
                                    </span>{" "}
                                    {notification.time}
                                </p>

                            </div>

                            <div className="flex gap-4 mt-8">

                                <button
                                    onClick={handleMarkAsRead}
                                    disabled={notification.isRead}
                                    className="
                                        bg-white
                                        border
                                        border-[#9021C4]
                                        text-[#9021C4]
                                        px-6
                                        py-3
                                        rounded-xl
                                        hover:bg-[#F5EEF6]
                                        transition
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    {notification.isRead
                                        ? "Read"
                                        : "Mark as Read"}
                                </button>

                            </div>
                        </div>
                    )}

                </div>
            )}

        </div>
    );
};

export default NotificationCard;