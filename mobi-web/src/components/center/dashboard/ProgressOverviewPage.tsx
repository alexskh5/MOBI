import type { ReactNode } from "react";

import {
    Layers3,
    Type,
    Clock3,
    PauseCircle,
    Smartphone,
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

/* =========================================================
   TYPES
   These types can later match the backend response.
========================================================= */

export interface ProgressMetricsData {
    activitiesCompleted: number;
    wordsPracticed: number;
    focusTime: string;
    inactivityTime: string;
    screenTimeUsed: string;
    screenTimeLimit: string;
}

export interface ProgressGraphPoint {
    period: string;
    speech: number;
    social: number;
}

export interface ProgressAnalysisData {
    summary: string;
    description: string;
}

interface ProgressOverviewPageProps {
    metrics: ProgressMetricsData;
    graphData: ProgressGraphPoint[];
    speechAnalysis: ProgressAnalysisData;
    socialAnalysis: ProgressAnalysisData;
}

/* =========================================================
   LOCAL HELPER COMPONENTS
   These remain in this file to avoid unnecessary files.
========================================================= */

interface MetricCardProps {
    icon: ReactNode;
    value: string | number;
    label: string;
    helperText?: string;
    className?: string;
}

const MetricCard = ({
    icon,
    value,
    label,
    helperText,
    className = "",
}: MetricCardProps) => {
    return (
        <article
            className={`
                flex
                min-h-[140px]
                min-w-0
                flex-col
                justify-between
                rounded-[24px]
                bg-white
                p-5
                shadow-sm
                transition
                duration-200
                hover:shadow-md
                ${className}
            `}
        >
            <div className="text-[#C687D9]">
                {icon}
            </div>

            <div className="mt-5 min-w-0">
                <p className="break-words text-2xl font-bold text-black">
                    {value}
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-700">
                    {label}
                </p>

                {helperText && (
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        </article>
    );
};

interface AnalysisCardProps {
    title: string;
    summary: string;
    description: string;
}

const AnalysisCard = ({
    title,
    summary,
    description,
}: AnalysisCardProps) => {
    return (
        <article
            className="
                min-w-0
                flex-1
                rounded-2xl
                bg-white
                p-5
                shadow-md
            "
        >
            <h3 className="text-xl font-bold text-black">
                {title}
            </h3>

            <p className="mt-3 text-sm font-medium leading-6 text-gray-700">
                {summary}
            </p>

            <p className="mt-4 text-sm leading-6 text-gray-600">
                {description}
            </p>
        </article>
    );
};

interface ProgressChartProps {
    data: ProgressGraphPoint[];
}

const ProgressChart = ({
    data,
}: ProgressChartProps) => {
    return (
        <div
            className="
                h-[320px]
                w-full
                min-w-0
                rounded-2xl
                border-2
                border-dashed
                border-gray-400
                bg-white/40
                p-3
                sm:h-[380px]
                sm:p-5
                lg:h-[420px]
            "
        >
            {data.length > 0 ? (
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <LineChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 20,
                            left: -10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#D1D5DB"
                        />

                        <XAxis
                            dataKey="period"
                            tick={{
                                fontSize: 13,
                                fill: "#6B7280",
                            }}
                            axisLine={{
                                stroke: "#9CA3AF",
                            }}
                            tickLine={false}
                        />

                        <YAxis
                            domain={[0, 100]}
                            tick={{
                                fontSize: 13,
                                fill: "#6B7280",
                            }}
                            axisLine={{
                                stroke: "#9CA3AF",
                            }}
                            tickLine={false}
                        />

                        <Tooltip
                            contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid #D1D5DB",
                                backgroundColor: "#FFFFFF",
                            }}
                            labelStyle={{
                                color: "#111827",
                                fontWeight: 600,
                                marginBottom: "6px",
                            }}
                        />

                        <Legend
                            verticalAlign="bottom"
                            wrapperStyle={{
                                paddingTop: "14px",
                                fontSize: "13px",
                            }}
                        />

                        <Line
                            type="monotone"
                            dataKey="social"
                            name="Social Readiness"
                            stroke="#9021C4"
                            strokeWidth={3}
                            dot={{
                                r: 4,
                                fill: "#FFFFFF",
                                stroke: "#9021C4",
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        />

                        <Line
                            type="monotone"
                            dataKey="speech"
                            name="Speech Training"
                            stroke="#DFA5C9"
                            strokeWidth={3}
                            dot={{
                                r: 4,
                                fill: "#FFFFFF",
                                stroke: "#DFA5C9",
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div
                    className="
                        flex
                        h-full
                        items-center
                        justify-center
                        px-6
                        text-center
                    "
                >
                    <p className="text-sm text-gray-500">
                        No progress data is available for the
                        selected period.
                    </p>
                </div>
            )}
        </div>
    );
};

/* =========================================================
   MAIN PAGE COMPONENT
========================================================= */

const ProgressOverviewPage = ({
    metrics,
    graphData,
    speechAnalysis,
    socialAnalysis,
}: ProgressOverviewPageProps) => {
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
            {/* PROGRESS METRICS                              */}
            {/* ============================================= */}

            <section className="w-full">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-black sm:text-3xl">
                        Progress Dashboard
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Overall learner progress based on the
                        selected period.
                    </p>
                </div>

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-3
                        2xl:grid-cols-5
                    "
                >
                    <MetricCard
                        icon={
                            <Layers3
                                size={26}
                                strokeWidth={1.8}
                            />
                        }
                        value={metrics.activitiesCompleted}
                        label="Activities Completed"
                    />

                    <MetricCard
                        icon={
                            <Type
                                size={26}
                                strokeWidth={1.8}
                            />
                        }
                        value={metrics.wordsPracticed}
                        label="Words Practiced"
                    />

                    <MetricCard
                        icon={
                            <Clock3
                                size={26}
                                strokeWidth={1.8}
                            />
                        }
                        value={metrics.focusTime}
                        label="Focus Time"
                    />

                    <MetricCard
                        icon={
                            <PauseCircle
                                size={26}
                                strokeWidth={1.8}
                            />
                        }
                        value={metrics.inactivityTime}
                        label="Inactivity Time"
                    />

                    <MetricCard
                        icon={
                            <Smartphone
                                size={26}
                                strokeWidth={1.8}
                            />
                        }
                        value={`${metrics.screenTimeUsed} / ${metrics.screenTimeLimit}`}
                        label="Screen Time"
                        helperText="Used vs. daily limit"
                        className="
                            sm:col-span-2
                            lg:col-span-1
                        "
                    />
                </div>
            </section>

            {/* ============================================= */}
            {/* SUMMARY                                      */}
            {/* ============================================= */}

            <section
                className="
                    w-full
                    rounded-[28px]
                    bg-[#EAC6EB]
                    p-4
                    sm:p-5
                    lg:p-6
                "
            >
                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-black">
                        Summary
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Overview of speech training and social
                        readiness performance.
                    </p>
                </div>

                <div
                    className="
                        grid
                        min-w-0
                        grid-cols-1
                        gap-5
                        xl:grid-cols-5
                    "
                >
                    {/* Graph */}

                    <div className="min-w-0 xl:col-span-3">
                        <ProgressChart data={graphData} />
                    </div>

                    {/* Analysis cards */}

                    <div
                        className="
                            flex
                            min-w-0
                            flex-col
                            gap-5
                            xl:col-span-2
                        "
                    >
                        <AnalysisCard
                            title="Speech and Vocabulary"
                            summary={speechAnalysis.summary}
                            description={
                                speechAnalysis.description
                            }
                        />

                        <AnalysisCard
                            title="Social Readiness"
                            summary={socialAnalysis.summary}
                            description={
                                socialAnalysis.description
                            }
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProgressOverviewPage;