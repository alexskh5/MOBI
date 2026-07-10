import { useMemo, useState } from "react";

import {
    AlertCircle,
    MessageCircleMore,
    Search,
    X,
} from "lucide-react";

/* =========================================================
   TYPES
   Backend-ready and closer to AdultDashboardScreen content.
========================================================= */

export type SocialReadinessStatus =
    | "appropriate"
    | "partially-appropriate"
    | "needs-support";

export interface ConversationAttempt {
    id: string;
    activityTitle: string;
    prompt: string;
    learnerAnswer: string;
    expectedAnswer: string;
    status: SocialReadinessStatus;
    turnTaking: string;
    supportUsed?: string;
}

export interface SocialReadinessResultData {
    conversationAttempts: string | number;
    attempts: ConversationAttempt[];

    summary: {
        responseAppropriateness: string;
        turnTaking: string;
        engagementLevel: string;
        aiSummary: string;
    };
}

interface SocialReadinessResultPageProps {
    data?: SocialReadinessResultData;
}

/* =========================================================
   PLACEHOLDER DATA
   Replace this later with backend data passed through props.
========================================================= */

export const defaultSocialReadinessResultData: SocialReadinessResultData = {
    conversationAttempts: 4,

    attempts: [
        {
            id: "conversation-attempt-1",
            activityTitle: "Making Friends",
            prompt:
                "What do you say when you meet someone?",
            learnerAnswer: "Hello",
            expectedAnswer: "Hello",
            status: "appropriate",
            turnTaking: "Independent",
        },
        {
            id: "conversation-attempt-2",
            activityTitle: "Making Friends",
            prompt:
                "What do you say when someone helps you?",
            learnerAnswer: "Goodbye",
            expectedAnswer: "Thank you",
            status: "needs-support",
            turnTaking: "Prompted",
        },
        {
            id: "conversation-attempt-3",
            activityTitle: "Greeting Practice",
            prompt: "How are you today?",
            learnerAnswer: "I am happy",
            expectedAnswer: "I am happy",
            status: "appropriate",
            turnTaking: "Independent",
        },
        {
            id: "conversation-attempt-4",
            activityTitle: "Sharing Practice",
            prompt: "Can I play with you?",
            learnerAnswer: "Play",
            expectedAnswer: "Yes, let us play",
            status: "partially-appropriate",
            turnTaking: "Prompted",
        },
    ],

    summary: {
        responseAppropriateness: "Good",
        turnTaking: "Developing",
        engagementLevel: "High",
        aiSummary:
            "Lexi showed better social engagement during greetings and simple turn-taking. She still needs support in maintaining longer responses.",
    },
};

/* =========================================================
   LOCAL HELPER COMPONENTS
   Layout is maintained from the previous version.
========================================================= */

interface StatusBadgeProps {
    status: SocialReadinessStatus;
}

const StatusBadge = ({
    status,
}: StatusBadgeProps) => {
    const settings: Record<
        SocialReadinessStatus,
        {
            label: string;
            className: string;
        }
    > = {
        appropriate: {
            label: "Appropriate",
            className:
                "bg-[#F1E2F4] text-[#A66DB6]",
        },

        "partially-appropriate": {
            label: "Partially appropriate",
            className:
                "bg-[#F1E2F4] text-[#A66DB6]",
        },

        "needs-support": {
            label: "Needs support",
            className:
                "bg-[#F1E2F4] text-[#A66DB6]",
        },
    };

    const selectedStatus = settings[status];

    return (
        <span
            className={`
                inline-flex
                shrink-0
                items-center
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${selectedStatus.className}
            `}
        >
            {selectedStatus.label}
        </span>
    );
};

interface ConversationAttemptCardProps {
    attempt: ConversationAttempt;
}

const ConversationAttemptCard = ({
    attempt,
}: ConversationAttemptCardProps) => {
    return (
        <article
            className="
                min-w-0
                rounded-2xl
                bg-white
                p-5
                shadow-sm
                sm:p-6
            "
        >
            <div
                className="
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                "
            >
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                    {attempt.activityTitle}
                </h3>

                <StatusBadge status={attempt.status} />
            </div>

            <div
                className="
                    mt-3
                    space-y-1.5
                    text-sm
                    leading-6
                    text-gray-700
                "
            >
                <p>
                    <span className="font-medium">
                        Prompt:
                    </span>{" "}
                    {attempt.prompt}
                </p>

                <p>
                    <span className="font-medium">
                        Learner:
                    </span>{" "}
                    {attempt.learnerAnswer}
                </p>

                <p className="font-semibold text-red-500">
                    Expected: {attempt.expectedAnswer}
                </p>

                <p>
                    <span className="font-medium">
                        Turn-taking:
                    </span>{" "}
                    {attempt.turnTaking}
                </p>

                {attempt.supportUsed && (
                    <p className="font-semibold text-red-500">
                        Support used: {attempt.supportUsed}
                    </p>
                )}
            </div>
        </article>
    );
};

interface SocialSummaryCardProps {
    title: string;
    value: string;
    className?: string;
}

const SocialSummaryCard = ({
    title,
    value,
    className = "",
}: SocialSummaryCardProps) => {
    return (
        <div
            className={`
                min-w-0
                rounded-2xl
                bg-white
                p-5
                shadow-sm
                sm:p-6
                ${className}
            `}
        >
            <h3 className="font-bold text-gray-900">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-700">
                {value}
            </p>
        </div>
    );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const SocialReadinessResultPage = ({
    data = defaultSocialReadinessResultData,
}: SocialReadinessResultPageProps) => {
    const [searchQuery, setSearchQuery] =
        useState("");

    const filteredAttempts = useMemo(() => {
        const normalizedQuery =
            searchQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return data.attempts;
        }

        return data.attempts.filter((attempt) => {
            const statusText =
                attempt.status === "appropriate"
                    ? "appropriate"
                    : attempt.status ===
                        "partially-appropriate"
                      ? "partially appropriate"
                      : "needs support";

            const searchableText = [
                attempt.activityTitle,
                attempt.prompt,
                attempt.learnerAnswer,
                attempt.expectedAnswer,
                attempt.turnTaking,
                attempt.supportUsed ?? "",
                statusText,
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                normalizedQuery,
            );
        });
    }, [data.attempts, searchQuery]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <div
            className="
                w-full
                min-w-0
                px-4
                py-5
                sm:px-6
                sm:py-6
            "
        >
            {/* Page title */}

            <div>
                <h2
                    className="
                        text-2xl
                        font-bold
                        text-gray-900
                        sm:text-3xl
                    "
                >
                    Social Readiness Result
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Conversation, response, turn-taking, and
                    engagement.
                </p>
            </div>

            {/* Search */}

            <div className="relative mt-5">
                <Search
                    size={18}
                    className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-gray-500
                    "
                />

                <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                        setSearchQuery(
                            event.target.value,
                        )
                    }
                    placeholder="Search conversation attempts"
                    aria-label="Search conversation attempts"
                    className="
                        h-12
                        w-full
                        rounded-2xl
                        border
                        border-transparent
                        bg-white
                        py-3
                        pl-12
                        pr-12
                        text-sm
                        text-gray-800
                        shadow-sm
                        outline-none
                        transition
                        placeholder:text-gray-400
                        hover:border-[#D8ACDF]
                        focus:border-[#C486D1]
                        focus:ring-2
                        focus:ring-[#C486D1]/20
                    "
                />

                {searchQuery.length > 0 && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        aria-label="Clear social-readiness search"
                        className="
                            absolute
                            right-3
                            top-1/2
                            flex
                            h-7
                            w-7
                            -translate-y-1/2
                            items-center
                            justify-center
                            rounded-full
                            text-gray-500
                            transition
                            hover:bg-[#F3E7F4]
                            hover:text-gray-800
                        "
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Social-readiness result container */}

            <section
                className="
                    mt-5
                    rounded-[28px]
                    bg-[#EAC6EB]
                    p-4
                    sm:p-5
                    lg:p-6
                "
            >
                {/* Conversation-attempt count */}

                <div
                    className="
                        flex
                        min-h-[80px]
                        items-center
                        justify-between
                        gap-4
                        rounded-2xl
                        bg-white
                        px-5
                        py-4
                        shadow-sm
                        sm:px-6
                    "
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#F5E8F6]
                                text-[#B77AC8]
                            "
                        >
                            <MessageCircleMore
                                size={22}
                                strokeWidth={1.8}
                            />
                        </div>

                        <p className="font-bold text-gray-900">
                            Conversation Attempts
                        </p>
                    </div>

                    <p className="text-xl font-bold text-[#B77AC8]">
                        {data.conversationAttempts}
                    </p>
                </div>

                {/* Conversation attempt cards */}

                {filteredAttempts.length > 0 ? (
                    <div
                        className="
                            mt-5
                            grid
                            grid-cols-1
                            gap-4
                            xl:grid-cols-2
                        "
                    >
                        {filteredAttempts.map((attempt) => (
                            <ConversationAttemptCard
                                key={attempt.id}
                                attempt={attempt}
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        className="
                            mt-5
                            flex
                            min-h-[220px]
                            flex-col
                            items-center
                            justify-center
                            rounded-2xl
                            bg-white
                            px-6
                            text-center
                        "
                    >
                        <AlertCircle
                            size={34}
                            className="text-[#B77AC8]"
                        />

                        <h3 className="mt-3 font-bold text-gray-900">
                            No conversation attempts found
                        </h3>

                        <p className="mt-1 max-w-md text-sm leading-6 text-gray-600">
                            Try searching for another activity,
                            response, expected answer, status, or
                            turn-taking result.
                        </p>

                        <button
                            type="button"
                            onClick={clearSearch}
                            className="
                                mt-4
                                rounded-xl
                                bg-[#F1D8F3]
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-[#795083]
                                transition
                                hover:bg-[#E8C5EB]
                            "
                        >
                            Clear search
                        </button>
                    </div>
                )}

                {/* Overall social-readiness summary */}

                <div
                    className="
                        mt-5
                        grid
                        grid-cols-1
                        gap-4
                        lg:grid-cols-3
                    "
                >
                    <SocialSummaryCard
                        title="Response Appropriateness"
                        value={
                            data.summary
                                .responseAppropriateness
                        }
                    />

                    <SocialSummaryCard
                        title="Turn-taking"
                        value={data.summary.turnTaking}
                    />

                    <SocialSummaryCard
                        title="Engagement Level"
                        value={
                            data.summary.engagementLevel
                        }
                    />
                </div>

                <div className="mt-4">
                    <SocialSummaryCard
                        title="AI Social Readiness Summary"
                        value={data.summary.aiSummary}
                    />
                </div>
            </section>
        </div>
    );
};

export default SocialReadinessResultPage;