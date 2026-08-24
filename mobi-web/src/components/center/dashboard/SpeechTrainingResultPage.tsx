// mobi-web/src/components/center/dashboard/SpeechTrainingResultPage.tsx

import {
    Activity,
    MessageCircle,
    Target,
    AudioWaveform,
    CheckCircle2,
    Repeat2,
    Clock3,
    Layers3,
} from "lucide-react";

import type {
    SpeechTrainingProgress,
} from "../../../services/progress/speechTrainingApi";

/* =========================================================
   PROPS
========================================================= */

interface SpeechTrainingResultPageProps {
    data:
        SpeechTrainingProgress | null;
}

/* =========================================================
   HELPERS
========================================================= */

function formatResponseTime(
    milliseconds:
        number | null,
) {
    if (milliseconds === null) {
        return "No data";
    }

    if (milliseconds < 1000) {
        return `${milliseconds} ms`;
    }

    return `${(
        milliseconds / 1000
    ).toFixed(1)} s`;
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
    title,
    value,
    description,
    icon,
}: {
    title:
        string;

    value:
        string | number;

    description:
        string;

    icon:
        React.ReactNode;
}) {
    return (
        <article
            className="
                rounded-2xl
                bg-white
                p-5
                shadow-sm
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
                    <p
                        className="
                            text-sm
                            font-medium
                            text-gray-600
                        "
                    >
                        {title}
                    </p>

                    <p
                        className="
                            mt-1
                            text-2xl
                            font-bold
                            text-gray-900
                        "
                    >
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

            <p
                className="
                    mt-4
                    text-xs
                    leading-5
                    text-gray-500
                "
            >
                {description}
            </p>
        </article>
    );
}

/* =========================================================
   MAIN PAGE
========================================================= */

const SpeechTrainingResultPage = ({
    data,
}: SpeechTrainingResultPageProps) => {

    if (!data) {
        return (
            <div
                className="
                    flex
                    min-h-[320px]
                    items-center
                    justify-center
                    p-6
                "
            >
                <p className="text-sm text-gray-500">
                    No speech training progress data is
                    available for this learner and period.
                </p>
            </div>
        );
    }

    const displaySpeechLadder =
        data.currentSpeechLadder ??
        data.suggestedSpeechLadder ??
        "Not available";

    return (
        <div
            className="
                w-full
                min-w-0
                space-y-6
                px-4
                py-5
                sm:px-6
                sm:py-6
            "
        >
            {/* ============================================= */}
            {/* HEADER                                        */}
            {/* ============================================= */}

            <section>
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

                <p
                    className="
                        mt-1
                        text-sm
                        text-gray-600
                    "
                >
                    Speech training outcomes based on the
                    learner&apos;s recorded activities and
                    communication attempts for the selected
                    period.
                </p>
            </section>

            {/* ============================================= */}
            {/* SPEECH LADDER                                  */}
            {/* ============================================= */}

            <section
                className="
                    rounded-[28px]
                    bg-[#EAC6EB]
                    p-5
                "
            >
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
                        <p
                            className="
                                text-sm
                                font-medium
                                text-gray-600
                            "
                        >
                            Current Speech Ladder
                        </p>

                        <h3
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                text-gray-900
                            "
                        >
                            {displaySpeechLadder}
                        </h3>
                    </div>

                    {data.currentSpeechLadder === null &&
                        data.suggestedSpeechLadder && (
                            <span
                                className="
                                    w-fit
                                    rounded-full
                                    bg-white
                                    px-4
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-[#80588A]
                                "
                            >
                                Suggested level
                            </span>
                        )}
                </div>
            </section>

            {/* ============================================= */}
            {/* MAIN METRICS                                   */}
            {/* ============================================= */}

            <section
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-4
                "
            >
                <MetricCard
                    title="Activities Completed"
                    value={
                        data.metrics
                            .activitiesCompleted
                    }
                    description="Completed speech-training activities during the selected period."
                    icon={
                        <Activity size={22} />
                    }
                />

                <MetricCard
                    title="Communication Attempts"
                    value={
                        data.metrics
                            .communicationAttempts
                    }
                    description="Recorded attempts to communicate, including incomplete or approximate speech."
                    icon={
                        <MessageCircle
                            size={22}
                        />
                    }
                />

                <MetricCard
                    title="Target Achievements"
                    value={
                        data.metrics
                            .targetAchievements
                    }
                    description="Responses that successfully achieved the intended speech target."
                    icon={
                        <Target size={22} />
                    }
                />

                <MetricCard
                    title="Speech Approximations"
                    value={
                        data.metrics
                            .speechApproximations
                    }
                    description="Target-related attempts recognized even when pronunciation was incomplete."
                    icon={
                        <AudioWaveform
                            size={22}
                        />
                    }
                />
            </section>

            {/* ============================================= */}
            {/* RESPONSE BREAKDOWN                             */}
            {/* ============================================= */}

            <section
                className="
                    rounded-[28px]
                    bg-[#EAC6EB]
                    p-5
                "
            >
                <div className="mb-4">
                    <h3
                        className="
                            text-xl
                            font-bold
                            text-gray-900
                        "
                    >
                        Response Breakdown
                    </h3>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-600
                        "
                    >
                        Shows how speech responses were
                        recognized by MOBI.
                    </p>
                </div>

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                >
                    <MetricCard
                        title="Exact Matches"
                        value={
                            data.metrics
                                .exactMatches
                        }
                        description="Responses that directly matched the intended target."
                        icon={
                            <CheckCircle2
                                size={22}
                            />
                        }
                    />

                    <MetricCard
                        title="Accepted Variations"
                        value={
                            data.metrics
                                .acceptedVariations
                        }
                        description="Therapist-approved alternative responses accepted for the target."
                        icon={
                            <Layers3 size={22} />
                        }
                    />

                    <MetricCard
                        title="Phonetic Matches"
                        value={
                            data.metrics
                                .phoneticMatches
                        }
                        description="Responses recognized through phonetic similarity."
                        icon={
                            <AudioWaveform
                                size={22}
                            />
                        }
                    />

                    <MetricCard
                        title="No Response"
                        value={
                            data.metrics
                                .noResponseAttempts
                        }
                        description="Recorded response opportunities without a communication attempt."
                        icon={
                            <MessageCircle
                                size={22}
                            />
                        }
                    />
                </div>
            </section>

            {/* ============================================= */}
            {/* SUPPORT / PERFORMANCE                         */}
            {/* ============================================= */}

            <section
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-4
                "
            >
                <MetricCard
                    title="Total Attempts"
                    value={
                        data.metrics
                            .totalAttempts
                    }
                    description="Total recorded speech response attempts for this period."
                    icon={
                        <Layers3 size={22} />
                    }
                />

                <MetricCard
                    title="Average Response Time"
                    value={formatResponseTime(
                        data.metrics
                            .averageResponseTimeMs,
                    )}
                    description="Average recorded time before the learner responded."
                    icon={
                        <Clock3 size={22} />
                    }
                />

                <MetricCard
                    title="One More Try Used"
                    value={
                        data.metrics
                            .oneMoreTryUsedCount
                    }
                    description="Number of supportive additional opportunities provided by MOBI."
                    icon={
                        <Repeat2 size={22} />
                    }
                />

                <MetricCard
                    title="Activities Mastered"
                    value={
                        data.metrics
                            .activitiesMastered
                    }
                    description="Speech-training activities currently recorded as mastered for this learner."
                    icon={
                        <CheckCircle2
                            size={22}
                        />
                    }
                />
            </section>
        </div>
    );
};

export default SpeechTrainingResultPage;