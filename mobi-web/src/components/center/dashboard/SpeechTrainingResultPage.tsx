import {
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    Search,
    X,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Target,
} from "lucide-react";

/* =========================================================
   TYPES
   These types can later match the response from the backend.
========================================================= */

export type SpeechLadderLevel =
    | "Sound"
    | "Syllable"
    | "Word"
    | "Phrase"
    | "Sentence";

export type SpeechAttemptStatus =
    | "correct"
    | "needs-practice";

export interface SpeechAttempt {
    id: string;
    activityTitle: string;
    prompt: string;
    targetAnswer: string;
    learnerAnswer: string;
    status: SpeechAttemptStatus;
    supportUsed?: string;
}

export interface SpeechLevelResult {
    level: SpeechLadderLevel;
    attempts: SpeechAttempt[];
}

export interface SpeechTrainingResultData {
    mostMissedTargets: string[];
    mostImprovedSpeech: string;
    levels: SpeechLevelResult[];
}

interface SpeechTrainingResultPageProps {
    data?: SpeechTrainingResultData;
}

/* =========================================================
   PLACEHOLDER DATA
   Replace this later with the API result passed through props.
========================================================= */

export const defaultSpeechTrainingResultData: SpeechTrainingResultData = {
    mostMissedTargets: [
        "/ra/",
        "thank you",
    ],

    mostImprovedSpeech:
        "Word recognition improved after repeated visual prompts.",

    levels: [
        {
            level: "Sound",
            attempts: [
                {
                    id: "sound-attempt-1",
                    activityTitle: "Sound Imitation",
                    prompt: "Say /m/",
                    targetAnswer: "/m/",
                    learnerAnswer: "/m/",
                    status: "correct",
                },
                {
                    id: "sound-attempt-2",
                    activityTitle: "Sound Imitation",
                    prompt: "Say /ra/",
                    targetAnswer: "/ra/",
                    learnerAnswer: "/la/",
                    status: "needs-practice",
                    supportUsed: "Verbal prompt",
                },
                {
                    id: "sound-attempt-3",
                    activityTitle: "Beginning Sounds",
                    prompt: "Say the first sound in moon.",
                    targetAnswer: "/m/",
                    learnerAnswer: "/m/",
                    status: "correct",
                },
                {
                    id: "sound-attempt-4",
                    activityTitle: "Sound Matching",
                    prompt: "Repeat the sound /s/.",
                    targetAnswer: "/s/",
                    learnerAnswer: "/s/",
                    status: "correct",
                },
                {
                    id: "sound-attempt-5",
                    activityTitle: "Sound Imitation",
                    prompt: "Say /b/.",
                    targetAnswer: "/b/",
                    learnerAnswer: "/b/",
                    status: "correct",
                },
                {
                    id: "sound-attempt-6",
                    activityTitle: "Beginning Sounds",
                    prompt: "Say the first sound in fish.",
                    targetAnswer: "/f/",
                    learnerAnswer: "/f/",
                    status: "correct",
                },
            ],
        },
        {
            level: "Syllable",
            attempts: [
                {
                    id: "syllable-attempt-1",
                    activityTitle: "Syllable Practice",
                    prompt: "Say ma.",
                    targetAnswer: "ma",
                    learnerAnswer: "ma",
                    status: "correct",
                },
                {
                    id: "syllable-attempt-2",
                    activityTitle: "Syllable Practice",
                    prompt: "Say ra.",
                    targetAnswer: "ra",
                    learnerAnswer: "la",
                    status: "needs-practice",
                    supportUsed: "Modelling",
                },
                {
                    id: "syllable-attempt-3",
                    activityTitle: "Syllable Matching",
                    prompt: "Repeat ba.",
                    targetAnswer: "ba",
                    learnerAnswer: "ba",
                    status: "correct",
                },
                {
                    id: "syllable-attempt-4",
                    activityTitle: "Syllable Practice",
                    prompt: "Say moo.",
                    targetAnswer: "moo",
                    learnerAnswer: "moo",
                    status: "correct",
                },
                {
                    id: "syllable-attempt-5",
                    activityTitle: "Syllable Matching",
                    prompt: "Repeat pa.",
                    targetAnswer: "pa",
                    learnerAnswer: "pa",
                    status: "correct",
                },
            ],
        },
        {
            level: "Word",
            attempts: [
                {
                    id: "word-attempt-1",
                    activityTitle: "Vocabulary: Animals",
                    prompt: "What animal is this?",
                    targetAnswer: "dog",
                    learnerAnswer: "dog",
                    status: "correct",
                },
                {
                    id: "word-attempt-2",
                    activityTitle: "Vocabulary: Animals",
                    prompt: "What is this animal?",
                    targetAnswer: "cat",
                    learnerAnswer: "dog",
                    status: "needs-practice",
                    supportUsed: "Visual cue",
                },
                {
                    id: "word-attempt-3",
                    activityTitle: "Common Objects",
                    prompt: "What is this object?",
                    targetAnswer: "cup",
                    learnerAnswer: "cup",
                    status: "correct",
                },
                {
                    id: "word-attempt-4",
                    activityTitle: "Food Words",
                    prompt: "Name this fruit.",
                    targetAnswer: "apple",
                    learnerAnswer: "apple",
                    status: "correct",
                },
                {
                    id: "word-attempt-5",
                    activityTitle: "Vocabulary: Animals",
                    prompt: "What animal says moo?",
                    targetAnswer: "cow",
                    learnerAnswer: "cow",
                    status: "correct",
                },
                {
                    id: "word-attempt-6",
                    activityTitle: "Action Words",
                    prompt: "What is the child doing?",
                    targetAnswer: "running",
                    learnerAnswer: "run",
                    status: "needs-practice",
                    supportUsed: "Sentence modelling",
                },
                {
                    id: "word-attempt-7",
                    activityTitle: "Common Objects",
                    prompt: "Name the object used for writing.",
                    targetAnswer: "pencil",
                    learnerAnswer: "pencil",
                    status: "correct",
                },
                {
                    id: "word-attempt-8",
                    activityTitle: "Food Words",
                    prompt: "Name this food.",
                    targetAnswer: "bread",
                    learnerAnswer: "bread",
                    status: "correct",
                },
                {
                    id: "word-attempt-9",
                    activityTitle: "Action Words",
                    prompt: "What is the girl doing?",
                    targetAnswer: "jumping",
                    learnerAnswer: "jumping",
                    status: "correct",
                },
            ],
        },
        {
            level: "Phrase",
            attempts: [
                {
                    id: "phrase-attempt-1",
                    activityTitle: "Requesting Practice",
                    prompt: "Ask for more.",
                    targetAnswer: "more please",
                    learnerAnswer: "more please",
                    status: "correct",
                },
                {
                    id: "phrase-attempt-2",
                    activityTitle: "Requesting Practice",
                    prompt: "Ask for help.",
                    targetAnswer: "help me",
                    learnerAnswer: "help",
                    status: "needs-practice",
                    supportUsed: "Sentence starter",
                },
                {
                    id: "phrase-attempt-3",
                    activityTitle: "Describing Objects",
                    prompt: "Describe the red ball.",
                    targetAnswer: "red ball",
                    learnerAnswer: "red ball",
                    status: "correct",
                },
                {
                    id: "phrase-attempt-4",
                    activityTitle: "Choice Making",
                    prompt: "Choose the juice politely.",
                    targetAnswer: "juice please",
                    learnerAnswer: "juice please",
                    status: "correct",
                },
            ],
        },
        {
            level: "Sentence",
            attempts: [
                {
                    id: "sentence-attempt-1",
                    activityTitle: "Introduce Yourself",
                    prompt: "Say your name.",
                    targetAnswer: "My name is Lexi.",
                    learnerAnswer: "My name is Lexi.",
                    status: "correct",
                },
                {
                    id: "sentence-attempt-2",
                    activityTitle: "Polite Response",
                    prompt:
                        "What do you say when someone helps you?",
                    targetAnswer:
                        "Thank you for helping me.",
                    learnerAnswer: "Thank you",
                    status: "needs-practice",
                    supportUsed: "Prompted expansion",
                },
                {
                    id: "sentence-attempt-3",
                    activityTitle: "Daily Routine",
                    prompt:
                        "Tell what you do before going to school.",
                    targetAnswer:
                        "I eat breakfast before school.",
                    learnerAnswer:
                        "I eat breakfast before school.",
                    status: "correct",
                },
            ],
        },
    ],
};

/* =========================================================
   LOCAL HELPER COMPONENTS
   These stay in this file to avoid creating too many files.
========================================================= */

interface SummaryCardProps {
    icon: ReactNode;
    title: string;
    children: ReactNode;
}

const SummaryCard = ({
    icon,
    title,
    children,
}: SummaryCardProps) => {
    return (
        <div
            className="
                min-w-0
                rounded-2xl
                bg-white
                p-5
                shadow-sm
            "
        >
            <div className="flex items-start gap-3">
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

                <div className="min-w-0">
                    <h3 className="font-bold text-gray-900">
                        {title}
                    </h3>

                    <div className="mt-2 text-sm leading-6 text-gray-700">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StatusBadgeProps {
    status: SpeechAttemptStatus;
}

const StatusBadge = ({
    status,
}: StatusBadgeProps) => {
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

interface SpeechAttemptCardProps {
    attempt: SpeechAttempt;
}

const SpeechAttemptCard = ({
    attempt,
}: SpeechAttemptCardProps) => {
    return (
        <article
            className="
                rounded-2xl
                bg-[#F8F1F8]
                p-4
            "
        >
            <div
                className="
                    flex
                    flex-col
                    gap-2
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                "
            >
                <h5 className="font-bold text-gray-900">
                    {attempt.activityTitle}
                </h5>

                <StatusBadge status={attempt.status} />
            </div>

            <div className="mt-3 space-y-1.5 text-sm leading-5 text-gray-700">
                <p>
                    <span className="font-medium">Prompt:</span>{" "}
                    {attempt.prompt}
                </p>

                <p>
                    <span className="font-medium">Target:</span>{" "}
                    {attempt.targetAnswer}
                </p>

                <p>
                    <span className="font-medium">Learner:</span>{" "}
                    {attempt.learnerAnswer}
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

interface SpeechLevelCardProps {
    result: SpeechLevelResult;
}

const SpeechLevelCard = ({
    result,
}: SpeechLevelCardProps) => {
    const correctCount = result.attempts.filter(
        (attempt) => attempt.status === "correct",
    ).length;

    const needsPracticeCount = result.attempts.filter(
        (attempt) =>
            attempt.status === "needs-practice",
    ).length;

    const totalAttempts =
        correctCount + needsPracticeCount;

    const successRate =
        totalAttempts > 0
            ? Math.round(
                  (correctCount / totalAttempts) * 100,
              )
            : 0;

    return (
        <section
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
                    items-start
                    justify-between
                    gap-4
                "
            >
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {result.level}
                    </h3>

                    <div className="mt-2 text-sm leading-6 text-gray-700">
                        <p>Correct: {correctCount}</p>

                        <p>
                            Needs practice:{" "}
                            {needsPracticeCount}
                        </p>
                    </div>
                </div>

                <p className="text-xl font-bold text-[#B77AC8]">
                    {successRate}%
                </p>
            </div>

            <div className="mt-6">
                <h4 className="text-lg font-bold text-gray-900">
                    Attempt History
                </h4>

                <div className="mt-4 space-y-4">
                    {result.attempts.map((attempt) => (
                        <SpeechAttemptCard
                            key={attempt.id}
                            attempt={attempt}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

/* =========================================================
   MAIN PAGE COMPONENT
========================================================= */

const SpeechTrainingResultPage = ({
    data = defaultSpeechTrainingResultData,
}: SpeechTrainingResultPageProps) => {
    const [searchQuery, setSearchQuery] =
        useState("");

    const totalCorrect = useMemo(
        () =>
            data.levels.reduce(
                (total, level) =>
                    total +
                    level.attempts.filter(
                        (attempt) =>
                            attempt.status === "correct",
                    ).length,
                0,
            ),
        [data.levels],
    );

    const totalNeedsPractice = useMemo(
        () =>
            data.levels.reduce(
                (total, level) =>
                    total +
                    level.attempts.filter(
                        (attempt) =>
                            attempt.status ===
                            "needs-practice",
                    ).length,
                0,
            ),
        [data.levels],
    );

    const filteredLevels = useMemo(() => {
        const normalizedQuery =
            searchQuery.trim().toLowerCase();

        if (!normalizedQuery) {
            return data.levels;
        }

        return data.levels
            .map((level) => {
                const levelMatches =
                    level.level
                        .toLowerCase()
                        .includes(normalizedQuery);

                if (levelMatches) {
                    return level;
                }

                const matchingAttempts =
                    level.attempts.filter((attempt) => {
                        const searchableText = [
                            attempt.activityTitle,
                            attempt.prompt,
                            attempt.targetAnswer,
                            attempt.learnerAnswer,
                            attempt.supportUsed ?? "",
                            attempt.status === "correct"
                                ? "correct"
                                : "needs practice",
                        ]
                            .join(" ")
                            .toLowerCase();

                        return searchableText.includes(
                            normalizedQuery,
                        );
                    });

                return {
                    ...level,
                    attempts: matchingAttempts,
                };
            })
            .filter(
                (level) => level.attempts.length > 0,
            );
    }, [data.levels, searchQuery]);

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
                    Speech Training Result
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Shows where each answer happened and why it
                    needs practice.
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
                    placeholder="Search sound, word, activity, correct, needs practice"
                    aria-label="Search speech training results"
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

                {searchQuery && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        aria-label="Clear speech result search"
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

            {/* Summary */}

            <section
                className="
                    mt-5
                    rounded-[28px]
                    bg-[#EAC6EB]
                    p-4
                    sm:p-5
                "
            >
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        lg:grid-cols-3
                    "
                >
                    <SummaryCard
                        icon={
                            <CheckCircle2
                                size={22}
                                strokeWidth={1.8}
                            />
                        }
                        title="Correct vs Needs Practice"
                    >
                        <p>Correct: {totalCorrect}</p>

                        <p>
                            Needs practice:{" "}
                            {totalNeedsPractice}
                        </p>
                    </SummaryCard>

                    <SummaryCard
                        icon={
                            <Target
                                size={22}
                                strokeWidth={1.8}
                            />
                        }
                        title="Most Missed Targets"
                    >
                        {data.mostMissedTargets.length > 0 ? (
                            <ul className="space-y-1">
                                {data.mostMissedTargets.map(
                                    (target) => (
                                        <li key={target}>
                                            • {target}
                                        </li>
                                    ),
                                )}
                            </ul>
                        ) : (
                            <p>No missed targets recorded.</p>
                        )}
                    </SummaryCard>

                    <SummaryCard
                        icon={
                            <TrendingUp
                                size={22}
                                strokeWidth={1.8}
                            />
                        }
                        title="Most Improved Speech"
                    >
                        <p>{data.mostImprovedSpeech}</p>
                    </SummaryCard>
                </div>

                {/* Speech ladder */}

                <div className="mt-5">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                            Speech Ladder
                        </h3>

                        <p className="mt-1 text-sm text-gray-600">
                            Results from sound through sentence
                            training.
                        </p>
                    </div>

                    {filteredLevels.length > 0 ? (
                        <div className="space-y-5">
                            {filteredLevels.map((levelResult) => (
                                <SpeechLevelCard
                                    key={levelResult.level}
                                    result={levelResult}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className="
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

                            <h4 className="mt-3 font-bold text-gray-900">
                                No speech results found
                            </h4>

                            <p className="mt-1 text-sm text-gray-600">
                                Try searching for another level,
                                activity, target, answer, or result.
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
                </div>
            </section>
        </div>
    );
};

export default SpeechTrainingResultPage;