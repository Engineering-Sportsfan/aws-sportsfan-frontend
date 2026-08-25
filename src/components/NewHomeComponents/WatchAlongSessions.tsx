// // components\NewHomeComponents\WatchAlongSessions.tsx

// import { motion } from "framer-motion";
// import { ChevronRight } from "lucide-react";
// import Link from "next/link";

// export default function WatchAlongSessions() {
//   return (
//     <div className="w-full mt-5">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-[17px] font-extrabold text-white">Watch Along Sessions</h3>
//         <button
//           type="button"
//           className="flex items-center gap-0.5 text-[12px] font-bold"
//           style={{ color: "#E91E8C" }}
//         >
//           View all
//           <ChevronRight size={14} />
//         </button>
//       </div>

//       <div
//         className="rounded-2xl overflow-hidden p-4"
//         style={{ background: "linear-gradient(160deg,#2a0f3d,#12071f)" }}
//       >
//         <div className="flex gap-3.5">
//           <div className="relative w-[92px] h-[92px] rounded-2xl overflow-hidden shrink-0 border border-white/10">
//             <img
//               src="/images/with_ananad.png"
//               alt="indvssl"
//               className="w-full h-full object-cover"
//             />
//             {/* <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[9px] font-extrabold text-emerald-300 bg-black/50 px-1.5 py-0.5 rounded-full">
//               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//               LIVE
//             </span> */}
//           </div>

//           <div className="min-w-0">
//             <h4 className="text-[16px] font-extrabold text-white leading-tight mb-1">
//               Watch India vs Sri Lanka 
//             </h4>
//             <p className="text-[13px] font-bold text-violet-400 mb-2">With Anand Vasu</p>
//             <p className="text-[12px] text-white/50 leading-snug">
//               Join expert Anand Vasu and hundreds of fans. Live reactions, insights &amp; more!
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-1.5 mt-3">
//           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
//           <span className="text-[11px] font-semibold text-white/50">
//             Starts on 23 Aug 2026
//           </span>
//         </div>

//         {/* <div className="flex items-center justify-between mt-3">
//           <div className="flex items-center gap-1.5">
//             <div className="flex -space-x-2">
//               <img
//                 src="/images/avatars/fan-1.jpg"
//                 alt=""
//                 className="w-6 h-6 rounded-full border-2 border-[#1a0a2b] object-cover"
//               />
//               <img
//                 src="/images/avatars/fan-2.jpg"
//                 alt=""
//                 className="w-6 h-6 rounded-full border-2 border-[#1a0a2b] object-cover"
//               />
//               <img
//                 src="/images/avatars/fan-3.jpg"
//                 alt=""
//                 className="w-6 h-6 rounded-full border-2 border-[#1a0a2b] object-cover"
//               />
//             </div>
//             <span className="text-[11px] font-semibold text-white/50">1.2K</span>
//           </div>
//         </div> */}

//         <motion.button
//           whileTap={{ scale: 0.97 }}
//           className="w-full mt-3 py-3.5 rounded-full font-extrabold text-white text-[14px]"
//           style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
//         >
//           <Link href="/MainModules/WatchAlong/room/9caf8851-4ab2-4240-8e2d-b35238f3855c">
//             Join Session
//           </Link>

//         </motion.button>
//       </div>
//     </div>
//   );
// }





// components/NewHomeComponents/WatchAlongSessions.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface WatchAlongRoom {
  id: string;
  name: string;
  role: string;
  displayPicture?: string;
  isLive: boolean;
  isActive: boolean;
  startTime?: string;
  createdAt: number;
  totalJoinCount?: number;
}

function formatStartTime(startTime?: string) {
  if (!startTime) return null;
  const date = new Date(startTime);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WatchAlongSessions() {
  const [rooms, setRooms] = useState<WatchAlongRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // add this near the top of the component, alongside other useState/useEffect
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000); // recheck every 15s
    return () => clearInterval(interval);
  }, []);

  function hasReachedStartTime(room: WatchAlongRoom) {
    if (!room.startTime) return false;
    const start = new Date(room.startTime).getTime();
    if (isNaN(start)) return false;
    return now >= start;
  }

  function canJoin(room: WatchAlongRoom) {
    return room.isLive || hasReachedStartTime(room);
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchRooms() {
      try {
        setLoading(true);
        const res = await axios.get("/api/watch-along?limit=20");
        if (cancelled) return;

        const allRooms: WatchAlongRoom[] = res.data.rooms || [];
        const activeRooms = allRooms.filter((r) => r.isActive !== false);

        // Live rooms first, then soonest-starting upcoming, then rest by recency
        const sorted = [...activeRooms].sort((a, b) => {
          if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;

          const aTime = a.startTime ? new Date(a.startTime).getTime() : null;
          const bTime = b.startTime ? new Date(b.startTime).getTime() : null;
          if (aTime && bTime) return aTime - bTime;
          if (aTime) return -1;
          if (bTime) return 1;

          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        setRooms(sorted);
      } catch (err) {
        console.error("Failed to load watch along sessions", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRooms();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && (error || rooms.length === 0)) {
    return null;
  }

  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">Watch Along Sessions</h3>
        <Link href="/MainModules/WatchAlong">
          <button
            type="button"
            className="flex items-center gap-0.5 text-[12px] font-bold"
            style={{ color: "#E91E8C" }}
          >
            View all
            <ChevronRight size={14} />
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-hidden">
          <WatchAlongSkeleton />
          <WatchAlongSkeleton />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="rounded-2xl overflow-hidden p-4 shrink-0 w-[280px]"
              style={{ background: "linear-gradient(160deg,#2a0f3d,#12071f)" }}
            >
              <div className="flex gap-3.5">
                {/* <div className="relative w-[92px] h-[92px] rounded-2xl overflow-hidden shrink-0 border border-white/10">
                  <img
                    src={room.displayPicture || "/images/with_ananad.png"}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  {room.isLive && (
                    <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[9px] font-extrabold text-emerald-300 bg-black/50 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div> */}

                <div className="flex gap-3.5">
                  <div className="w-[92px] shrink-0">
                    <div className="relative w-[92px] h-[92px] rounded-2xl overflow-hidden border border-white/10">
                      <img
                        src={room.displayPicture || "/images/with_ananad.png"}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      {room.isLive && (
                        <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[9px] font-extrabold text-emerald-300 bg-black/50 px-1.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${room.isLive ? "bg-emerald-400" : "bg-white/30"
                          }`}
                      />
                      {/* <span className="text-[10px] font-semibold text-white/50 whitespace-normal">
                        {room.isLive
                          ? "Live now"
                          : formatStartTime(room.startTime)
                            ? `Starts ${formatStartTime(room.startTime)}`
                            : "Starting soon"}
                      </span> */}
                      <span className="text-[10px] font-semibold text-white/50 whitespace-normal">
                        {canJoin(room)
                          ? "Live now"
                          : formatStartTime(room.startTime)
                            ? `Starts ${formatStartTime(room.startTime)}`
                            : "Starting soon"}
                      </span>
                    </div>

                    {typeof room.totalJoinCount === "number" && room.totalJoinCount > 0 && (
                      <span className="block text-[10px] font-semibold text-white/50 mt-1 truncate">
                        {room.totalJoinCount} joined
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-[16px] font-extrabold text-white leading-tight mb-1 whitespace-normal">
                      {room.name}
                    </h4>
                    {room.role && (
                      <p className="text-[13px] font-bold text-violet-400 mb-2 truncate">
                        With {room.role}
                      </p>
                    )}
                    <p className="text-[12px] text-white/50 leading-snug line-clamp-3">
                      Join {room.role || "our expert"} and hundreds of fans. Live reactions, insights &amp; more!
                    </p>
                  </div>
                </div>

              </div>



              {/* <Link href={`/MainModules/WatchAlong/room/${room.id}`}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-3 py-3.5 rounded-full font-extrabold text-white text-[14px]"
                  style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
                >
                  {room.isLive ? "Join Live Session" : "Join Session"}
                </motion.button>
              </Link> */}
              {canJoin(room) && (
                <Link href={`/MainModules/WatchAlong/room/${room.id}`}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="w-full mt-3 py-3.5 rounded-full font-extrabold text-white text-[14px]"
                    style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
                  >
                    Join Live Session
                  </motion.button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WatchAlongSkeleton() {
  return (
    <div className="rounded-2xl p-4 shrink-0 w-[280px] bg-white/5 animate-pulse">
      <div className="flex gap-3.5">
        <div className="w-[92px] h-[92px] rounded-2xl bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-3 bg-white/10 rounded w-full" />
          <div className="h-3 bg-white/10 rounded w-5/6" />
        </div>
      </div>
      <div className="h-3 bg-white/10 rounded w-1/3 mt-3" />
      <div className="h-12 bg-white/10 rounded-full w-full mt-3" />
    </div>
  );
}