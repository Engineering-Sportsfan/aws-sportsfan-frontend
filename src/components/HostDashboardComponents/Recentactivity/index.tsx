
// import Link from "next/link";
// import React from "react";

// interface ActivityItem {
//   id: number;
//   icon: React.ReactNode;
//   iconBg: string;
//   title: string;
//   description: string;
//   time: string;
//   highlighted?: boolean;
// }

// const TrophyIcon = () => (
//   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
//     <path d="M12 2C9.243 2 7 4.243 7 7v1H4v2c0 2.757 2.243 5 5 5h.28A6.008 6.008 0 0 0 12 17.91V20h-2v2h8v-2h-2v-2.09A6.008 6.008 0 0 0 14.72 15H15c2.757 0 5-2.243 5-5V8h-3V7c0-2.757-2.243-5-5-5zm3 5v1H9V7a3 3 0 0 1 6 0zm3 3v1a3 3 0 0 1-2.816 2.99A5.96 5.96 0 0 0 15 13h-.28a5.98 5.98 0 0 0-.72-1H9c0 .34-.025.673-.72 1H8c-1.654 0-3-1.346-3-3v-1h2v1a5 5 0 0 0 10 0v-1h2z" />
//   </svg>
// );

// const ChatIcon = () => (
//   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-300">
//     <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
//   </svg>
// );

// const ChartIcon = () => (
//   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-400">
//     <path d="M3.5 18.5l6-6 4 4L22 6.92 20.59 5.5l-7.09 8-4-4L2 17l1.5 1.5z" />
//   </svg>
// );

// const activities: ActivityItem[] = [
//   {
//     id: 1,
//     icon: <TrophyIcon />,
//     iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
//     title: "Elite Host Badge Earned",
//     description: "Congratulations on your achievement!",
//     time: "Just now",
//     highlighted: true,
//   },
//   {
//     id: 2,
//     icon: <ChatIcon />,
//     iconBg: "bg-gradient-to-br from-slate-600 to-slate-700",
//     title: "Moderation Alert",
//     description: "1 message flagged in Room #47",
//     time: "2 min ago",
//   },
//   {
//     id: 3,
//     icon: <ChartIcon />,
//     iconBg: "bg-gradient-to-br from-teal-700 to-emerald-800",
//     title: "Revenue Milestone",
//     description: "Crossed ₹50,000 this month",
//     time: "1 hour ago",
//   },
// ];

// const ActivityCard: React.FC<{ item: ActivityItem }> = ({ item }) => (
//   <div
//     className={[
//       "flex items-start gap-4 rounded-2xl p-4 transition-all duration-200",
//       item.highlighted
//         ? "bg-gradient-to-r from-red-950/80 via-rose-950/60 to-transparent border border-red-800/40"
//         : "bg-[#1a1a1a] border border-white/5",
//     ].join(" ")}
//   >
//     {/* Icon */}
//     <div
//       className={[
//         "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
//         item.iconBg,
//       ].join(" ")}
//     >
//       {item.icon}
//     </div>

//     {/* Text */}
//     <div className="flex-1 min-w-0">
//       <p className="text-white font-semibold text-sm leading-snug truncate">
//         {item.title}
//       </p>
//       <p className="text-gray-400 text-xs mt-0.5 leading-snug">
//         {item.description}
//       </p>
//       <p className="text-gray-500 text-xs font-medium mt-2">{item.time}</p>
//     </div>
//   </div>
// );

// const PlusIcon = () => (
//   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
//     <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
//   </svg>
// );

// const RecentActivity: React.FC = () => {
//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
//       {/* Card container — mobile-first, max-width constrained */}
//       <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-3">
//         {/* Header */}
//         <h2 className="text-white text-xl font-bold px-1 mb-1">
//           Recent Activity
//         </h2>

//         {/* Activity list */}
//         <div className="flex flex-col gap-3">
//           {activities.map((item) => (
//             <ActivityCard key={item.id} item={item} />
//           ))}
//         </div>

//         {/* CTA Button */}
//         <div className="mt-6">
//             <Link href="/MainModules/HostDashboard/CreateRoomContent" className="w-full">
//           <button
//             className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-semibold text-base tracking-wide shadow-xl
//               bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500
//               hover:from-orange-400 hover:via-pink-400 hover:to-rose-400
//               active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black"
//           >
//             <PlusIcon />
//             Create New Room
//           </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RecentActivity;





import Link from "next/link";
import React from "react";

interface ActivityItem {
  id: number;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  highlighted?: boolean;
}

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
    <path d="M12 2C9.243 2 7 4.243 7 7v1H4v2c0 2.757 2.243 5 5 5h.28A6.008 6.008 0 0 0 12 17.91V20h-2v2h8v-2h-2v-2.09A6.008 6.008 0 0 0 14.72 15H15c2.757 0 5-2.243 5-5V8h-3V7c0-2.757-2.243-5-5-5zm3 5v1H9V7a3 3 0 0 1 6 0zm3 3v1a3 3 0 0 1-2.816 2.99A5.96 5.96 0 0 0 15 13h-.28a5.98 5.98 0 0 0-.72-1H9c0 .34-.025.673-.72 1H8c-1.654 0-3-1.346-3-3v-1h2v1a5 5 0 0 0 10 0v-1h2z" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-300">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-400">
    <path d="M3.5 18.5l6-6 4 4L22 6.92 20.59 5.5l-7.09 8-4-4L2 17l1.5 1.5z" />
  </svg>
);

const activities: ActivityItem[] = [
  {
    id: 1,
    icon: <TrophyIcon />,
    iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
    title: "Elite Host Badge Earned",
    description: "Congratulations on your achievement!",
    time: "Just now",
    highlighted: true,
  },
  {
    id: 2,
    icon: <ChatIcon />,
    iconBg: "bg-gradient-to-br from-slate-600 to-slate-700",
    title: "Moderation Alert",
    description: "1 message flagged in Room #47",
    time: "2 min ago",
  },
  {
    id: 3,
    icon: <ChartIcon />,
    iconBg: "bg-gradient-to-br from-teal-700 to-emerald-800",
    title: "Revenue Milestone",
    description: "Crossed ₹50,000 this month",
    time: "1 hour ago",
  },
];

const ActivityCard: React.FC<{ item: ActivityItem }> = ({ item }) => (
  <div
    className={[
      "flex items-start gap-4 rounded-2xl p-4 transition-all duration-200",
      item.highlighted
        ? "bg-gradient-to-r from-red-950/80 via-rose-950/60 to-transparent border border-red-800/40"
        : "bg-[#1a1a1a] border border-white/5",
    ].join(" ")}
  >
    {/* Icon */}
    <div
      className={[
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
        item.iconBg,
      ].join(" ")}
    >
      {item.icon}
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <p className="text-white font-semibold text-sm leading-snug truncate">
        {item.title}
      </p>
      <p className="text-gray-400 text-xs mt-0.5 leading-snug">
        {item.description}
      </p>
      <p className="text-gray-500 text-xs font-medium mt-2">{item.time}</p>
    </div>
  </div>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
  </svg>
);

const RecentActivity: React.FC = () => {
  return (
   
    <div className="w-full pb-18 lg:pb-5">
      {/* Card container — no extra height constraints */}
      <div className="w-full flex flex-col gap-3">
        {/* Header */}
        <h2 className="text-white text-xl font-bold px-1 mb-1">
          Recent Activity
        </h2>

        {/* Activity list */}
        <div className="flex flex-col gap-3">
          {activities.map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-6">
          <Link href="/MainModules/HostDashboard/CreateRoomContent" className="w-full">
            <button
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-semibold text-base tracking-wide shadow-xl
              bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500
              hover:from-orange-400 hover:via-pink-400 hover:to-rose-400
              active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              <PlusIcon />
              Create New Room
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;