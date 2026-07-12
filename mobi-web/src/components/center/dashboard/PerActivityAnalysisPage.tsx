import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Search,
    Target,
    TrendingUp,
    X,
} from "lucide-react";

/* =========================================================
   TYPES
   Backend-ready:
   Feedback steps may exist in the backend, but this page
   only shows answerable/evaluable steps.
========================================================= */

export type ActivityStepStatus =
    | "correct"
    | "needs-practice";

export interface ActivityStepHistory {
    id: string;
    stepNumber: number;
    stepType: string;
    question: string;
    learnerAnswer: string;
    expectedAnswer?: string;
    status?: ActivityStepStatus;
    supportUsed?: string;
}

export interface ActivityAnalysis {
    id: string;
    activityTitle: string;
    correctAnswers: number;
    needsPractice: number;
    successRate: number;
    steps: ActivityStepHistory[];
}

export interface PerActivityAnalysisData {
    activities: ActivityAnalysis[];
}

interface PerActivityAnalysisPageProps {
    data?: PerActivityAnalysisData;
}

/* =========================================================
   PLACEHOLDER DATA
   Replace this later with backend data passed through props.
   Feedback step is included here on purpose to prove that
   the UI will automatically hide it.
========================================================= */

export const defaultPerActivityAnalysisData: PerActivityAnalysisData = {
    activities: [
        {
            id: "activity-making-friends",
            activityTitle: "Making Friends",
            correctAnswers: 8,
            needsPractice: 2,
            successRate: 80,
            steps: [
                {
                    id: "making-friends-step-1",
                    stepNumber: 1,
                    stepType: "Ask",
                    question:
                        "What do you say when you meet someone?",
                    learnerAnswer: "Hello",
                    expectedAnswer: "Hello",
                    status: "correct",
                },
                {
                    id: "making-friends-step-2",
                    stepNumber: 2,
                    stepType: "Conversation",
                    question:
                        "What do you say when someone helps you?",
                    learnerAnswer: "Goodbye",
                    expectedAnswer: "Thank you",
                    status: "needs-practice",
                    supportUsed: "Verbal prompt",
                },
                {
                    id: "making-friends-step-3",
                    stepNumber: 3,
                    stepType: "Feedback",
                    question:
                        "System feedback was given to guide the learner.",
                    learnerAnswer: "Feedback shown",
                },
            ],
        },
        {
            id: "activity-greeting-practice",
            activityTitle: "Greeting Practice",
            correctAnswers: 5,
            needsPractice: 1,
            successRate: 83,
            steps: [
                {
                    id: "greeting-step-1",
                    stepNumber: 1,
                    stepType: "Teach",
                    question:
                        "Listen to the greeting: Good morning.",
                    learnerAnswer: "Listened",
                    status: "correct",
                },
                {
                    id: "greeting-step-2",
                    stepNumber: 2,
                    stepType: "Ask",
                    question:
                        "What do you say when you see your teacher in the morning?",
                    learnerAnswer: "Good morning",
                    expectedAnswer: "Good morning",
                    status: "correct",
                },
                {
                    id: "greeting-step-3",
                    stepNumber: 3,
                    stepType: "Conversation",
                    question: "How are you today?",
                    learnerAnswer: "Happy",
                    expectedAnswer: "I am happy",
                    status: "needs-practice",
                    supportUsed: "Sentence starter",
                },
            ],
        },
        {
            id: "activity-animal-words",
            activityTitle: "Animal Words",
            correctAnswers: 7,
            needsPractice: 2,
            successRate: 78,
            steps: [
                {
                    id: "animal-words-step-1",
                    stepNumber: 1,
                    stepType: "Teach",
                    question:
                        "Look at the picture and listen to the word dog.",
                    learnerAnswer: "Listened",
                    status: "correct",
                },
                {
                    id: "animal-words-step-2",
                    stepNumber: 2,
                    stepType: "Ask",
                    question: "What animal is this?",
                    learnerAnswer: "Dog",
                    expectedAnswer: "Dog",
                    status: "correct",
                },
                {
                    id: "animal-words-step-3",
                    stepNumber: 3,
                    stepType: "Ask",
                    question: "What animal says meow?",
                    learnerAnswer: "Dog",
                    expectedAnswer: "Cat",
                    status: "needs-practice",
                    supportUsed: "Visual cue",
                },
            ],
        },
    ],
};

/* =========================================================
   LOCAL HELPER COMPONENTS
========================================================= */

interface StatusBadgeProps {
    status?: ActivityStepStatus;
}

const StatusBadge = ({
    status,
}: StatusBadgeProps) => {
    if (!status) {
        return null;
    }

    const isCorrect = status === "correct";

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
                ${
                    isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                }
            `}
        >
            {isCorrect ? "Correct" : "Needs Practice"}
        </span>
    );
};

interface ActivityMetricCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
}

const ActivityMetricCard = ({
    label,
    value,
    icon,
}: ActivityMetricCardProps) => {
    return (
        <div
            className="
                min-h-[120px]
                min-w-0
                rounded-2xl
                bg-white
                p-5
                shadow-sm
            "
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-600">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#B77AC8]">
                        {value}
                    </p>
                </div>

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
                    {icon}
                </div>
            </div>
        </div>
    );
};

interface ActivityStepCardProps {
    step: ActivityStepHistory;
}

const ActivityStepCard = ({
    step,
}: ActivityStepCardProps) => {
    return (
        <article
            className="
                min-w-0
                rounded-2xl
                bg-white
                p-5
                shadow-sm
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
                <h4 className="font-bold text-gray-900">
                    Step {step.stepNumber} · {step.stepType}
                </h4>

                <StatusBadge status={step.status} />
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
                        Question:
                    </span>{" "}
                    {step.question}
                </p>

                <p>
                    <span className="font-medium">
                        Answer:
                    </span>{" "}
                    {step.learnerAnswer}
                </p>

                {step.expectedAnswer &&
                    step.status === "needs-practice" && (
                        <p className="font-semibold text-red-500">
                            Expected: {step.expectedAnswer}
                        </p>
                    )}

                {step.supportUsed && (
                    <p className="font-semibold text-red-500">
                        Support used: {step.supportUsed}
                    </p>
                )}
            </div>
        </article>
    );
};

/* =========================================================
   MAIN PAGE COMPONENT
========================================================= */

const PerActivityAnalysisPage = ({
    data = defaultPerActivityAnalysisData,
}: PerActivityAnalysisPageProps) => {
    const [searchQuery, setSearchQuery] =
        useState("");

    const [currentActivityIndex, setCurrentActivityIndex] =
        useState(0);

    /*
     * Feedback is not shown because it is not correct/wrong.
     * Backend can still store feedback steps; this UI simply
     * excludes them from answer analysis.
     */
    const activitiesWithoutFeedback = useMemo(() => {
        return data.activities.map((activity) => ({
            ...activity,
            steps: activity.steps.filter(
                (step) =>
                    step.stepType
                        .trim()
                        .toLowerCase() !== "feedback",
            ),
        }));
    }, [data.activities]);

    /*
     * When the activity title matches the search, all answerable
     * step history remains visible.
     *
     * When only a step matches, the activity remains visible
     * with only the matching answerable steps.
     */
    const filteredActivities = useMemo(() => {
        const normalizedQuery =
            searchQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return activitiesWithoutFeedback;
        }

        return activitiesWithoutFeedback
            .map((activity) => {
                const activitySummaryText = [
                    activity.activityTitle,
                    activity.correctAnswers,
                    activity.needsPractice,
                    activity.successRate,
                    "correct answers",
                    "needs practice",
                    "wrong",
                    "success rate",
                ]
                    .join(" ")
                    .toLowerCase();

                const activityMatches =
                    activitySummaryText.includes(
                        normalizedQuery,
                    );

                if (activityMatches) {
                    return activity;
                }

                const matchingSteps =
                    activity.steps.filter((step) => {
                        const statusText =
                            step.status === "correct"
                                ? "correct"
                                : step.status ===
                                    "needs-practice"
                                  ? "needs practice wrong"
                                  : "";

                        const searchableStepText = [
                            step.stepNumber,
                            step.stepType,
                            step.question,
                            step.learnerAnswer,
                            step.expectedAnswer ?? "",
                            step.supportUsed ?? "",
                            statusText,
                        ]
                            .join(" ")
                            .toLowerCase();

                        return searchableStepText.includes(
                            normalizedQuery,
                        );
                    });

                if (matchingSteps.length === 0) {
                    return null;
                }

                return {
                    ...activity,
                    steps: matchingSteps,
                };
            })
            .filter(
                (
                    activity,
                ): activity is ActivityAnalysis =>
                    activity !== null,
            );
    }, [activitiesWithoutFeedback, searchQuery]);

    useEffect(() => {
        setCurrentActivityIndex(0);
    }, [searchQuery]);

    useEffect(() => {
        if (
            currentActivityIndex >
            filteredActivities.length - 1
        ) {
            setCurrentActivityIndex(0);
        }
    }, [
        currentActivityIndex,
        filteredActivities.length,
    ]);

    const selectedActivity =
        filteredActivities[currentActivityIndex];

    const hasPreviousActivity =
        currentActivityIndex > 0;

    const hasNextActivity =
        currentActivityIndex <
        filteredActivities.length - 1;

    const handlePreviousActivity = () => {
        setCurrentActivityIndex((previousIndex) =>
            Math.max(previousIndex - 1, 0),
        );
    };

    const handleNextActivity = () => {
        setCurrentActivityIndex((previousIndex) =>
            Math.min(
                previousIndex + 1,
                filteredActivities.length - 1,
            ),
        );
    };

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
            {/* Page heading */}

            <div>
                <h2
                    className="
                        text-2xl
                        font-bold
                        text-gray-900
                        sm:text-3xl
                    "
                >
                    Per Activity Analysis
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Correct and needs-practice answers with
                    step-by-step response history.
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
                        setSearchQuery(event.target.value)
                    }
                    placeholder="Search activity, answer, step, correct, needs practice"
                    aria-label="Search per activity analysis"
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
                        aria-label="Clear activity search"
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

            {/* Selected activity */}

            {selectedActivity ? (
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
                    {/* Activity heading */}

                    <div
                        className="
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {selectedActivity.activityTitle}
                            </h3>

                            <p className="mt-1 text-sm text-gray-600">
                                Activity{" "}
                                {currentActivityIndex + 1} of{" "}
                                {filteredActivities.length}
                            </p>
                        </div>
                    </div>

                    {/* Activity summary metrics with old icons */}

                    <div
                        className="
                            mt-5
                            grid
                            grid-cols-1
                            gap-4
                            md:grid-cols-3
                        "
                    >
                        <ActivityMetricCard
                            label="Correct Answers"
                            value={
                                selectedActivity.correctAnswers
                            }
                            icon={
                                <CheckCircle2
                                    size={22}
                                    strokeWidth={1.8}
                                />
                            }
                        />

                        <ActivityMetricCard
                            label="Needs Practice"
                            value={
                                selectedActivity.needsPractice
                            }
                            icon={
                                <Target
                                    size={22}
                                    strokeWidth={1.8}
                                />
                            }
                        />

                        <ActivityMetricCard
                            label="Success Rate"
                            value={`${selectedActivity.successRate}%`}
                            icon={
                                <TrendingUp
                                    size={22}
                                    strokeWidth={1.8}
                                />
                            }
                        />
                    </div>

                    {/* Step history */}

                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            Step-by-step Answer History
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            Review the learner&apos;s response
                            recorded during each answerable activity
                            step.
                        </p>

                        {selectedActivity.steps.length > 0 ? (
                            <div className="mt-4 space-y-4">
                                {selectedActivity.steps.map((step) => (
                                    <ActivityStepCard
                                        key={step.id}
                                        step={step}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                className="
                                    mt-4
                                    rounded-2xl
                                    bg-white
                                    p-6
                                    text-center
                                    text-sm
                                    text-gray-600
                                "
                            >
                                No answerable step history is
                                available for this activity.
                            </div>
                        )}
                    </div>

                    {/* Previous and next activity */}

                    <div
                        className="
                            mt-6
                            flex
                            flex-col
                            gap-3
                            border-t
                            border-[#D5AEDD]
                            pt-5
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <button
                            type="button"
                            onClick={
                                handlePreviousActivity
                            }
                            disabled={
                                !hasPreviousActivity
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-[#8D6597]
                                transition
                                hover:bg-white/60
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            <ChevronLeft size={17} />

                            Previous Activity
                        </button>

                        <button
                            type="button"
                            onClick={handleNextActivity}
                            disabled={!hasNextActivity}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-[#A568B5]
                                transition
                                hover:bg-white/60
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            {hasNextActivity
                                ? "Next Activity"
                                : "No next activity"}

                            <ChevronRight size={17} />
                        </button>
                    </div>
                </section>
            ) : (
                <div
                    className="
                        mt-5
                        flex
                        min-h-[300px]
                        flex-col
                        items-center
                        justify-center
                        rounded-[28px]
                        bg-[#EAC6EB]
                        px-6
                        text-center
                    "
                >
                    <AlertCircle
                        size={38}
                        className="text-[#B77AC8]"
                    />

                    <h3 className="mt-4 text-lg font-bold text-gray-900">
                        No activities found
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-gray-600">
                        Try searching for another activity,
                        answer, step type, result, or support
                        used.
                    </p>

                    <button
                        type="button"
                        onClick={clearSearch}
                        className="
                            mt-5
                            rounded-xl
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-[#795083]
                            shadow-sm
                            transition
                            hover:bg-[#F8EFF9]
                        "
                    >
                        Clear search
                    </button>
                </div>
            )}
        </div>
    );
};

export default PerActivityAnalysisPage;