import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    ChevronLeft,
    ChevronRight,
    BarChart3,
    X,
    ChevronDown,
} from "lucide-react";

import TherapistLayout from "../../../layouts/TherapistLayout";

import ProgressOverviewPage from "../../../components/center/dashboard/ProgressOverviewPage";
import SpeechTrainingResultPage from "../../../components/center/dashboard/SpeechTrainingResultPage";
import SocialReadinessResultPage from "../../../components/center/dashboard/SocialReadinessResultPage";
import PerActivityAnalysisPage from "../../../components/center/dashboard/PerActivityAnalysisPage";

import {
    getProgressOverview,
    type LearnerProgressOverview,
    type ProgressPeriod,
} from "../../../services/progress/progressApi";

import {
    getSpeechTrainingProgress,
    type SpeechTrainingProgress,
} from "../../../services/progress/speechTrainingApi";

import {
    getSocialReadinessProgress,
    type SocialReadinessProgress,
} from "../../../services/progress/socialReadinessApi";

import {
    getPerActivityAnalysis,
    type PerActivityAnalysisProgress,
} from "../../../services/progress/perActivityApi";

/* =========================================================
   TYPES
========================================================= */

interface LearnerData {
    id?: string;
    _id: string;
    firstName: string;
    lastName: string;
    age?: number;
    gender?: string;
    level?: number;
}

type ProgressFilter =
    | "Per Day"
    | "Per Week"
    | "Per Month"
    | "Per Year";

function mapProgressFilter(
    filter: ProgressFilter,
): ProgressPeriod {
    switch (filter) {
        case "Per Day":
            return "day";

        case "Per Month":
            return "month";

        case "Per Year":
            return "year";

        case "Per Week":
        default:
            return "week";
    }
}

/* =========================================================
   MAIN PAGE
========================================================= */

const Progress = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const scrollableContentRef =
        useRef<HTMLDivElement>(null);

    const progressState = state as {
        learner?: LearnerData;
    } | null;

    const learner =
        progressState?.learner ??
        null;

    const learnerId =
        learner?.id ??
        learner?._id ??
        "";

    const [currentPage, setCurrentPage] =
        useState(1);

    const [filter, setFilter] =
        useState<ProgressFilter>("Per Week");

    const [filterMenuOpen, setFilterMenuOpen] =
        useState(false);

    const filterDropdownRef =
        useRef<HTMLDivElement>(null);

    const filterOptions: ProgressFilter[] = [
        "Per Day",
        "Per Week",
        "Per Month",
        "Per Year",
    ];

    /*
     * Page 1 — Progress Overview
     * Page 2 — Speech Training Result
     * Page 3 — Social Readiness Result
     * Page 4 — Per Activity Analysis
     */
    const totalPages = 4;

    const [
        overview,
        setOverview,
    ] = useState<LearnerProgressOverview | null>(null);

    const [
        speechTraining,
        setSpeechTraining,
    ] = useState<SpeechTrainingProgress | null>(null);

    const [
        socialReadiness,
        setSocialReadiness,
    ] = useState<SocialReadinessProgress | null>(null);

    const [
        perActivityAnalysis,
        setPerActivityAnalysis,
    ] = useState<PerActivityAnalysisProgress | null>(null);

    const [
        progressLoading,
        setProgressLoading,
    ] = useState(true);

    const [
        progressError,
        setProgressError,
    ] = useState("");

    const progressMetrics = {
        activitiesCompleted:
            overview?.metrics.activitiesCompleted ??
            0,

        communicationAttempts:
            overview?.metrics.communicationAttempts ??
            0,

        targetAchievements:
            overview?.metrics.targetAchievements ??
            0,

        speechApproximations:
            overview?.metrics.speechApproximations ??
            0,

        observedEngagementSeconds:
            overview?.metrics.observedEngagementSeconds ??
            0,

        inactivitySeconds:
            overview?.metrics.inactivitySeconds ??
            0,

        screenTimeSeconds:
            overview?.metrics.screenTimeSeconds ??
            0,

        screenTimeLimitSeconds:
            overview?.metrics.screenTimeLimitSeconds ??
            null,
    };

    const progressGraphData: Array<{
        period: string;
        speech: number;
        social: number;
    }> = [];

    /* =====================================================
       PAGE NAVIGATION
    ===================================================== */

    const handlePreviousPage = () => {
        setCurrentPage((previousPage) =>
            Math.max(previousPage - 1, 1),
        );
    };

    const handleNextPage = () => {
        setCurrentPage((previousPage) =>
            Math.min(
                previousPage + 1,
                totalPages,
            ),
        );
    };

    /*
     * When the user switches to another progress page,
     * return the scrollable card content to the top.
     */
    useEffect(() => {
        scrollableContentRef.current?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [currentPage]);

    useEffect(() => {
        let cancelled = false;

        async function loadProgress() {
            if (!learnerId) {
                setOverview(null);
                setSpeechTraining(null);
                setSocialReadiness(null);
                setPerActivityAnalysis(null);
                setProgressError("No learner was selected.");
                setProgressLoading(false);
                return;
            }

            try {
                setProgressLoading(true);
                setProgressError("");

                const period =
                    mapProgressFilter(filter);

                const [
                    overviewResult,
                    speechTrainingResult,
                    socialReadinessResult,
                    perActivityResult,
                ] = await Promise.all([
                    getProgressOverview({
                        learnerId,
                        period,
                    }),
                    getSpeechTrainingProgress({
                        learnerId,
                        period,
                    }),
                    getSocialReadinessProgress({
                        learnerId,
                        period,
                    }),
                    getPerActivityAnalysis({
                        learnerId,
                        period,
                    }),
                ]);

                if (cancelled) {
                    return;
                }

                setOverview(overviewResult);
                setSpeechTraining(speechTrainingResult);
                setSocialReadiness(socialReadinessResult);
                setPerActivityAnalysis(perActivityResult);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load therapist learner progress:",
                    error,
                );

                setOverview(null);
                setSpeechTraining(null);
                setSocialReadiness(null);
                setPerActivityAnalysis(null);
                setProgressError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load learner progress.",
                );
            } finally {
                if (!cancelled) {
                    setProgressLoading(false);
                }
            }
        }

        loadProgress();

        return () => {
            cancelled = true;
        };
    }, [
        learnerId,
        filter,
    ]);

    useEffect(() => {
        const handleOutsideClick = (
            event: MouseEvent,
        ) => {
            if (
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(
                    event.target as Node,
                )
            ) {
                setFilterMenuOpen(false);
            }
        };

        const handleEscape = (
            event: KeyboardEvent,
        ) => {
            if (event.key === "Escape") {
                setFilterMenuOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick,
        );

        document.addEventListener(
            "keydown",
            handleEscape,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick,
            );

            document.removeEventListener(
                "keydown",
                handleEscape,
            );
        };
    }, []);

    /* =====================================================
       PAGE CONTENT
    ===================================================== */

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 1:
                return (
                    <ProgressOverviewPage
                        metrics={progressMetrics}
                        graphData={progressGraphData}
                    />
                );

            case 2:
                return (
                    <SpeechTrainingResultPage
                        data={speechTraining}
                    />
                );

            case 3:
                return (
                    <SocialReadinessResultPage
                        progress={socialReadiness ?? undefined}
                    />
                );

            case 4:
                return (
                    <PerActivityAnalysisPage
                        progress={perActivityAnalysis ?? undefined}
                    />
                );

            default:
                return (
                    <ProgressOverviewPage
                        metrics={progressMetrics}
                        graphData={progressGraphData}
                    />
                );
        }
    };

    return (
        <TherapistLayout>
            {(sidebarOpen, setSidebarOpen) => (
                <div
                    className="
                        inter
                        flex
                        h-full
                        min-h-0
                        flex-col
                        rounded-[30px]
                        bg-[#E4C9E5]/80
                        p-4
                        sm:p-6
                        lg:p-8
                    "
                >
                    {/* ============================================= */}
                    {/* PROGRESS PAGE HEADER                          */}
                    {/* ============================================= */}

                    <div
                        className="
                            mb-6
                            flex
                            shrink-0
                            flex-col
                            gap-4
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >
                        <div className="flex min-w-0 items-center gap-4">
                            {!sidebarOpen && (
                                <button
                                    type="button"
                                    aria-label="Open sidebar"
                                    onClick={() =>
                                        setSidebarOpen(true)
                                    }
                                    className="
                                        mr-1
                                        shrink-0
                                        text-3xl
                                        sm:mr-4
                                    "
                                >
                                    ☰
                                </button>
                            )}

                            <h1
                                className="
                                    itim
                                    truncate
                                    text-3xl
                                    font-medium
                                    sm:text-4xl
                                    xl:text-5xl
                                "
                            >
                                Learner Monitoring
                            </h1>
                        </div>

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-3
                                sm:gap-5
                            "
                        >
                            {/* Filter */}

                            <div className="flex items-center gap-3">
                                <span className="text-base sm:text-lg">
                                    Filter
                                </span>

                                <div
                                    ref={filterDropdownRef}
                                    className="relative"
                                >
                                    {/* Selected filter button */}

                                    <button
                                        type="button"
                                        aria-haspopup="listbox"
                                        aria-expanded={filterMenuOpen}
                                        onClick={() =>
                                            setFilterMenuOpen(
                                                (previous) => !previous,
                                            )
                                        }
                                        className="
                                            flex
                                            min-w-[164px]
                                            items-center
                                            justify-between
                                            gap-5
                                            rounded-xl
                                            bg-[#F5EEF6]
                                            px-6
                                            py-3
                                            text-left
                                            shadow-md
                                            outline-none
                                            transition
                                            hover:bg-white
                                            focus:ring-2
                                            focus:ring-[#C88FD2]/30
                                        "
                                    >
                                        <span>{filter}</span>

                                        <ChevronDown
                                            size={18}
                                            className={`
                                                shrink-0
                                                text-gray-500
                                                transition-transform
                                                duration-200
                                                ${
                                                    filterMenuOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }
                                            `}
                                        />
                                    </button>

                                    {/* Custom options menu */}

                                    {filterMenuOpen && (
                                        <div
                                            role="listbox"
                                            aria-label="Progress period"
                                            className="
                                                absolute
                                                right-0
                                                top-full
                                                z-50
                                                mt-2
                                                w-full
                                                min-w-[180px]
                                                overflow-hidden
                                                rounded-2xl
                                                border
                                                border-[#E8D7EA]
                                                bg-white
                                                py-2
                                                shadow-xl
                                            "
                                        >
                                            {filterOptions.map((option) => {
                                                const isSelected =
                                                    filter === option;

                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={isSelected}
                                                        onClick={() => {
                                                            setFilter(option);
                                                            setFilterMenuOpen(false);
                                                        }}
                                                        className={`
                                                            flex
                                                            w-full
                                                            items-center
                                                            px-6
                                                            py-3
                                                            text-left
                                                            text-base
                                                            transition
                                                            ${
                                                                isSelected
                                                                    ? "bg-[#F4EAF5] font-semibold text-[#895795]"
                                                                    : "text-gray-900 hover:bg-[#F8F1F9]"
                                                            }
                                                        `}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Close */}

                            <button
                                type="button"
                                aria-label="Close learner progress"
                                onClick={() =>
                                    navigate(
                                        "/therapist/dashboard",
                                    )
                                }
                                className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#F5EEF6]
                                    shadow-md
                                    transition
                                    hover:bg-white
                                "
                            >
                                <X
                                    size={20}
                                    className="text-[#7A5D7F]"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Header divider */}

                    <div
                        className="
                            mb-4
                            shrink-0
                            border-b
                            border-gray-400
                        "
                    />

                    {/* ============================================= */}
                    {/* MAIN LEARNER PROGRESS CARD                    */}
                    {/* ============================================= */}

                    <div className="flex min-h-0 flex-1">
                        <div
                            className="
                                flex
                                h-full
                                min-h-0
                                w-full
                                flex-col
                                overflow-hidden
                                rounded-2xl
                                border
                                border-gray-400
                                bg-[#EFDFF0]
                            "
                        >
                            {/* ===================================== */}
                            {/* FIXED LEARNER HEADER                  */}
                            {/* ===================================== */}

                            <div
                                className="
                                    shrink-0
                                    border-b
                                    border-gray-400
                                    bg-[#EFDFF0]
                                    px-4
                                    py-3
                                    sm:px-6
                                "
                            >
                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-3
                                        lg:flex-row
                                        lg:items-center
                                        lg:justify-between
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            min-w-0
                                            items-center
                                            gap-4
                                            sm:gap-5
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-pink-200
                                            "
                                        >
                                            <BarChart3
                                                size={28}
                                                className="text-pink-500"
                                            />
                                        </div>

                                        <h2
                                            className="
                                                min-w-0
                                                text-xl
                                                font-semibold
                                                sm:text-2xl
                                            "
                                        >
                                            {learner
                                                ? `${learner.firstName} ${learner.lastName}${learner.age ? `, ${learner.age} years old` : ""}`
                                                : "No learner selected"}
                                        </h2>
                                    </div>

                                    <div className="text-left lg:text-right">
                                        <h2 className="text-base font-bold sm:text-lg">
                                            <span className="uppercase">
                                                AI Analysis
                                            </span>

                                            <span className="font-normal">
                                                {" "}
                                                of Child&apos;s
                                                Progress with MOBI
                                            </span>
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            {/* ===================================== */}
                            {/* SCROLLABLE CURRENT PAGE CONTENT      */}
                            {/* ===================================== */}

                            <div
                                ref={scrollableContentRef}
                                className="
                                    min-h-0
                                    flex-1
                                    overflow-x-hidden
                                    overflow-y-auto
                                    scroll-smooth
                                "
                            >
                                {progressLoading ? (
                                    <div className="p-8 text-center text-lg font-semibold text-[#6F5278]">
                                        Loading learner progress...
                                    </div>
                                ) : progressError ? (
                                    <div className="p-8 text-center text-lg font-semibold text-red-600">
                                        {progressError}
                                    </div>
                                ) : (
                                    renderCurrentPage()
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* FOOTER                                        */}
                    {/* ============================================= */}

                    <div
                        className="
                            flex
                            shrink-0
                            flex-col
                            gap-3
                            pt-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <p className="text-sm text-gray-700">
                            Child&apos;s progress is also visible
                            to parents through the MOBI mobile
                            application.
                        </p>

                        <div
                            className="
                                flex
                                shrink-0
                                items-center
                                justify-end
                                gap-5
                            "
                        >
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    aria-label="Previous progress page"
                                    onClick={
                                        handlePreviousPage
                                    }
                                    disabled={
                                        currentPage === 1
                                    }
                                    className="
                                        flex
                                        h-8
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-[#F5EEF6]
                                        shadow-md
                                        transition
                                        hover:bg-white
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <button
                                    type="button"
                                    aria-label="Next progress page"
                                    onClick={handleNextPage}
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    className="
                                        flex
                                        h-8
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-white
                                        shadow-md
                                        transition
                                        hover:bg-[#F5EEF6]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            <span
                                className="
                                    whitespace-nowrap
                                    text-base
                                    font-semibold
                                "
                            >
                                {currentPage} of{" "}
                                {totalPages}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </TherapistLayout>
    );
};

export default Progress;
