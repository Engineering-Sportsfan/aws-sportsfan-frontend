// import LiveRoomsCard from "@/src/components/HostDashboardComponents/Live&UpcomingRoms";
// import PerformanceOverview from "@/src/components/HostDashboardComponents/PerformanceOverview";
// import RecentActivity from "@/src/components/HostDashboardComponents/Recentactivity";



// export default function HostDashboard() {
//   return (
//    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
//   <PerformanceOverview />
//   <LiveRoomsCard />
//   <RecentActivity />
// </div>
//   );
// }


import LiveRoomsCard from "@/src/components/HostDashboardComponents/Live&UpcomingRooms";
import PerformanceOverview from "@/src/components/HostDashboardComponents/PerformanceOverview";
import RecentActivity from "@/src/components/HostDashboardComponents/Recentactivity";

export default function HostDashboard() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      {/* Top stats section */}
      <PerformanceOverview />

      {/* Side-by-side section */}
      {/* <div className="px-4 sm:px-6 lg:px-8 lg:-mt-10 pb-1 flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
        
        <div className="w-full lg:flex-[1.4]">
          <LiveRoomsCard />
        </div>

       
        <div className="w-full lg:flex-1">
          <RecentActivity />
        </div>
      </div> */}

      <div className="px-4 sm:px-6 lg:px-8 pb-1 flex flex-col lg:flex-row gap-4 md:gap-5 lg:gap-6 items-start">
        {/* Live & Upcoming Rooms — takes more space */}
        <div className="w-full lg:flex-[1]">
          <LiveRoomsCard />
        </div>

        {/* Recent Activity — narrower */}
        <div className="w-full lg:flex-1 -mt-60 lg:-mt-0 lg:mt-30">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}