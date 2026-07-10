interface NotificationToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

const NotificationToggle = ({
    enabled,
    onToggle,
}: NotificationToggleProps) => {
    return (
        <div className="flex items-center gap-3">

            <span className="text-sm font-medium text-gray-700">
                Unread Only
            </span>

            <button
                onClick={onToggle}
                className={`
                    relative
                    w-14
                    h-8
                    rounded-full
                    transition-colors
                    duration-300
                    ${
                        enabled
                            ? "bg-[#9021C4]"
                            : "bg-gray-300"
                    }
                `}
            >
                <span
                    className={`
                        absolute
                        top-1
                        left-1
                        h-6
                        w-6
                        rounded-full
                        bg-white
                        shadow-md
                        transition-transform
                        duration-300
                        ${
                            enabled
                                ? "translate-x-6"
                                : "translate-x-0"
                        }
                    `}
                />
            </button>

        </div>
    );
};

export default NotificationToggle;