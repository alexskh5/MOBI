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

/* =========================================================
   TYPES
========================================================= */

interface LearnerData {
    _id: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    level: number;
}

type ProgressFilter =
    | "Per Day"
    | "Per Week"
    | "Per Month"
    | "Per Year";

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
        progressState?.learner ?? {
            _id: "1",
            firstName: "Lexi Rose",
            lastName: "Pantaleon",
            age: 8,
            gender: "Female",
            level: 4,
        };

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

    /* =====================================================
       TEMPORARY PAGE 1 DATA

       Later, these values should come from the backend based
       on the selected learner and selected period filter.
    ===================================================== */

    const progressMetrics = {
        activitiesCompleted: 2,
        wordsPracticed: 12,
        focusTime: "15m",
        inactivityTime: "3m",
        screenTimeUsed: "15m",
        screenTimeLimit: "1h 30m",
    };

    const progressGraphData = [
        {
            period: "Mon",
            speech: 45,
            social: 30,
        },
        {
            period: "Tue",
            speech: 55,
            social: 40,
        },
        {
            period: "Wed",
            speech: 50,
            social: 42,
        },
        {
            period: "Thu",
            speech: 65,
            social: 55,
        },
        {
            period: "Fri",
            speech: 70,
            social: 60,
        },
        {
            period: "Sat",
            speech: 75,
            social: 68,
        },
        {
            period: "Sun",
            speech: 82,
            social: 72,
        },
    ];

    const speechAnalysis = {
        summary: "Placeholder AI analysis.",
        description:
            "This section will summarize the learner's improvements in speech, vocabulary, sentence formation, and communication based on completed activities.",
    };

    const socialAnalysis = {
        summary: "Placeholder AI analysis.",
        description:
            "This section will summarize social interactions, eye contact, turn-taking, participation, and engagement observed during learning activities.",
    };

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
                        speechAnalysis={speechAnalysis}
                        socialAnalysis={socialAnalysis}
                    />
                );

            case 2:
                return (
                    <SpeechTrainingResultPage />
                );

            case 3:
                return (
                    <SocialReadinessResultPage />
                );

            case 4:
                return (
                    <PerActivityAnalysisPage />
                );

            default:
                return (
                    <ProgressOverviewPage
                        metrics={progressMetrics}
                        graphData={progressGraphData}
                        speechAnalysis={speechAnalysis}
                        socialAnalysis={socialAnalysis}
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
                                            {learner.firstName}{" "}
                                            {learner.lastName},{" "}
                                            {learner.age} years old
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
                                {renderCurrentPage()}
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