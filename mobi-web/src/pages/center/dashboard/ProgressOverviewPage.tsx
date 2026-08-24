// // mobi-web/src/components/center/dashboard/ProgressOverviewPage.tsx



// import {
//   Activity,
//   MessageCircle,
//   Target,
//   AudioWaveform,
//   Eye,
//   TimerOff,
//   Monitor,
//   Clock,
// } from "lucide-react";

// /* =========================================================
//    TYPES
// ========================================================= */

// interface ProgressMetrics {
//   activitiesCompleted:
//     number;

//   communicationAttempts:
//     number;

//   targetAchievements:
//     number;

//   speechApproximations:
//     number;

//   observedEngagementSeconds:
//     number;

//   inactivitySeconds:
//     number;

//   screenTimeSeconds:
//     number;

//   screenTimeLimitSeconds:
//     number | null;
// }

// interface GraphDataPoint {
//   period:
//     string;

//   speech:
//     number;

//   social:
//     number;
// }

// interface AnalysisData {
//   summary:
//     string;

//   description:
//     string;
// }

// interface ProgressOverviewPageProps {
//   metrics:
//     ProgressMetrics;

//   graphData?:
//     GraphDataPoint[];

//   speechAnalysis?:
//     AnalysisData;

//   socialAnalysis?:
//     AnalysisData;
// }

// /* =========================================================
//    HELPERS
// ========================================================= */

// function formatDuration(
//   totalSeconds:
//     number | null,
// ) {
//   if (
//     totalSeconds === null ||
//     totalSeconds <= 0
//   ) {
//     return totalSeconds === null
//       ? "Not set"
//       : "0m";
//   }

//   const hours =
//     Math.floor(
//       totalSeconds / 3600,
//     );

//   const minutes =
//     Math.floor(
//       (
//         totalSeconds % 3600
//       ) / 60,
//     );

//   const seconds =
//     totalSeconds % 60;

//   if (hours > 0) {
//     return `${hours}h ${minutes}m`;
//   }

//   if (minutes > 0) {
//     return `${minutes}m ${
//       seconds > 0
//         ? `${seconds}s`
//         : ""
//     }`.trim();
//   }

//   return `${seconds}s`;
// }

// /* =========================================================
//    METRIC CARD
// ========================================================= */

// function MetricCard({
//   title,
//   value,
//   description,
//   icon,
// }: {
//   title:
//     string;

//   value:
//     string | number;

//   description:
//     string;

//   icon:
//     React.ReactNode;
// }) {
//   return (
//     <div
//       className="
//         rounded-2xl
//         border
//         border-[#D7BCD9]
//         bg-white/70
//         p-5
//         shadow-sm
//       "
//     >
//       <div className="mb-4 flex items-start justify-between gap-4">
//         <div>
//           <p className="text-sm font-medium text-gray-600">
//             {title}
//           </p>

//           <p className="mt-1 text-2xl font-semibold text-gray-900">
//             {value}
//           </p>
//         </div>

//         <div
//           className="
//             flex
//             h-10
//             w-10
//             shrink-0
//             items-center
//             justify-center
//             rounded-xl
//             bg-[#F2E4F3]
//             text-[#8D5C96]
//           "
//         >
//           {icon}
//         </div>
//       </div>

//       <p className="text-sm leading-5 text-gray-600">
//         {description}
//       </p>
//     </div>
//   );
// }

// /* =========================================================
//    MAIN COMPONENT
// ========================================================= */

// const ProgressOverviewPage = ({
//   metrics,
//   graphData = [],
//   speechAnalysis,
//   socialAnalysis,
// }: ProgressOverviewPageProps) => {
//   return (
//     <div className="space-y-6 p-4 sm:p-6">

//       {/* ===================================================
//           OVERVIEW METRICS
//       =================================================== */}

//       <section>
//         <div className="mb-4">
//           <h3 className="text-xl font-semibold">
//             Progress Overview
//           </h3>

//           <p className="mt-1 text-sm text-gray-600">
//             Summary of the learner&apos;s recorded MOBI activity,
//             communication, and engagement data for the selected
//             period.
//           </p>
//         </div>

//         <div
//           className="
//             grid
//             grid-cols-1
//             gap-4
//             md:grid-cols-2
//             xl:grid-cols-4
//           "
//         >
//           <MetricCard
//             title="Activities Completed"
//             value={
//               metrics.activitiesCompleted
//             }
//             description="Completed learning activities during the selected period."
//             icon={
//               <Activity size={21} />
//             }
//           />

//           <MetricCard
//             title="Communication Attempts"
//             value={
//               metrics.communicationAttempts
//             }
//             description="Recorded learner attempts to communicate during structured activities."
//             icon={
//               <MessageCircle size={21} />
//             }
//           />

//           <MetricCard
//             title="Target Achievements"
//             value={
//               metrics.targetAchievements
//             }
//             description="Responses that successfully achieved the intended activity target."
//             icon={
//               <Target size={21} />
//             }
//           />

//           <MetricCard
//             title="Speech Approximations"
//             value={
//               metrics.speechApproximations
//             }
//             description="Target-related speech attempts recognized even when pronunciation was incomplete."
//             icon={
//               <AudioWaveform size={21} />
//             }
//           />

//           <MetricCard
//             title="Observed Engagement Time"
//             value={formatDuration(
//               metrics.observedEngagementSeconds,
//             )}
//             description="Time supported by available gaze-presence engagement evidence."
//             icon={
//               <Eye size={21} />
//             }
//           />

//           <MetricCard
//             title="Inactivity Time"
//             value={formatDuration(
//               metrics.inactivitySeconds,
//             )}
//             description="Recorded inactivity during learner activity sessions."
//             icon={
//               <TimerOff size={21} />
//             }
//           />

//           <MetricCard
//             title="Session / Screen Time"
//             value={formatDuration(
//               metrics.screenTimeSeconds,
//             )}
//             description="Current recorded activity-session duration. Off-screen activity handling will be refined separately."
//             icon={
//               <Monitor size={21} />
//             }
//           />

//           <MetricCard
//             title="Daily Screen Time Limit"
//             value={formatDuration(
//               metrics.screenTimeLimitSeconds,
//             )}
//             description="Parent-configured learner screen-time limit when available."
//             icon={
//               <Clock size={21} />
//             }
//           />
//         </div>
//       </section>

//       {/* ===================================================
//           TREND GRAPH PLACEHOLDER
//       =================================================== */}

//       <section
//         className="
//           rounded-2xl
//           border
//           border-[#D7BCD9]
//           bg-white/60
//           p-5
//           shadow-sm
//         "
//       >
//         <div className="mb-5">
//           <h3 className="text-lg font-semibold">
//             Progress Trend
//           </h3>

//           <p className="mt-1 text-sm text-gray-600">
//             Speech training and early social readiness activity
//             trends for the selected period.
//           </p>
//         </div>

//         {graphData.length === 0 ? (
//           <div
//             className="
//               flex
//               min-h-44
//               items-center
//               justify-center
//               rounded-xl
//               border
//               border-dashed
//               border-[#D9C7DC]
//               bg-[#FAF6FB]
//               px-5
//               text-center
//             "
//           >
//             <p className="max-w-xl text-sm text-gray-500">
//               Trend data will appear here after the progress
//               timeline API is connected.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <div className="min-w-[620px]">
//               <div
//                 className="
//                   grid
//                   grid-cols-7
//                   gap-3
//                 "
//               >
//                 {graphData.map(
//                   (item) => (
//                     <div
//                       key={
//                         item.period
//                       }
//                       className="
//                         rounded-xl
//                         bg-[#F7EFF8]
//                         p-3
//                         text-center
//                       "
//                     >
//                       <p className="mb-2 text-sm font-semibold">
//                         {item.period}
//                       </p>

//                       <p className="text-xs text-gray-600">
//                         Speech
//                       </p>

//                       <p className="font-semibold">
//                         {item.speech}
//                       </p>

//                       <p className="mt-2 text-xs text-gray-600">
//                         Social
//                       </p>

//                       <p className="font-semibold">
//                         {item.social}
//                       </p>
//                     </div>
//                   ),
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </section>

//       {/* ===================================================
//           AI-ASSISTED ANALYSIS PLACEHOLDERS
//       =================================================== */}

//       <div
//         className="
//           grid
//           grid-cols-1
//           gap-5
//           xl:grid-cols-2
//         "
//       >
//         <section
//           className="
//             rounded-2xl
//             border
//             border-[#D7BCD9]
//             bg-white/60
//             p-5
//             shadow-sm
//           "
//         >
//           <h3 className="text-lg font-semibold">
//             Speech Training Summary
//           </h3>

//           {speechAnalysis ? (
//             <>
//               <p className="mt-3 font-medium text-[#7B4B84]">
//                 {
//                   speechAnalysis.summary
//                 }
//               </p>

//               <p className="mt-2 text-sm leading-6 text-gray-600">
//                 {
//                   speechAnalysis.description
//                 }
//               </p>
//             </>
//           ) : (
//             <p className="mt-3 text-sm leading-6 text-gray-500">
//               AI-assisted speech progress analysis will be added
//               after the factual progress metrics and trends are
//               fully connected.
//             </p>
//           )}
//         </section>

//         <section
//           className="
//             rounded-2xl
//             border
//             border-[#D7BCD9]
//             bg-white/60
//             p-5
//             shadow-sm
//           "
//         >
//           <h3 className="text-lg font-semibold">
//             Social Readiness Summary
//           </h3>

//           {socialAnalysis ? (
//             <>
//               <p className="mt-3 font-medium text-[#7B4B84]">
//                 {
//                   socialAnalysis.summary
//                 }
//               </p>

//               <p className="mt-2 text-sm leading-6 text-gray-600">
//                 {
//                   socialAnalysis.description
//                 }
//               </p>
//             </>
//           ) : (
//             <p className="mt-3 text-sm leading-6 text-gray-500">
//               AI-assisted social readiness analysis will appear
//               after social readiness activity outcomes are
//               available.
//             </p>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// };

// export default ProgressOverviewPage;