// interface NotificationTabsProps {
//     selectedTab: string;
//     onSelectTab: (tab: string) => void;
// }

// const tabs = [
//     "All",
//     "MOBI",
//     "Collaboration",
//     "Learning Activity",
// ];

// const NotificationTabs = ({
//     selectedTab,
//     onSelectTab,
// }: NotificationTabsProps) => {
//     return (
//         <div className="flex items-center gap-4 flex-wrap mb-6">
//             {tabs.map((tab) => (
//                 <button
//                     key={tab}
//                     onClick={() => onSelectTab(tab)}
//                     className={`
//                         px-5
//                         py-2
//                         rounded-full
//                         transition
//                         text-sm
//                         font-medium
//                         ${
//                             selectedTab === tab
//                                 ? "bg-[#9021C4] text-white shadow-md"
//                                 : "bg-white text-gray-700 hover:bg-[#F5EEF6]"
//                         }
//                     `}
//                 >
//                     {tab}
//                 </button>
//             ))}
//         </div>
//     );
// };

// export default NotificationTabs;