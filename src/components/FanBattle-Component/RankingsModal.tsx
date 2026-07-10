// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";
// import Image from "next/image";

// // ─── Types ────────────────────────────────────────────────────────────────────
// type TabType = "live" | "lifetime" | "community";

// interface RankedAthlete {
//   id: string;
//   rank: number;
//   name: string;
//   sport: string;
//   points: number;
//   type: "PLAYER" | "CLUB";
//   avatar?: string;
//   avatarColor: string;
//   avatarInitial: string;
//   ringColor: string;
// }

// interface Battle {
//   id: string;
//   battleName: string;
//   battleType: "PLAYERS" | "CLUBS";
//   selectedPlayers: string[];
//   selectedClubs: string[];
//   invitedFriends: Array<{ email: string; name: string }>;
//   userId: string;
//   userName: string;
//   createdAt: number;
//   updatedAt: number;
// }

// interface LeaderboardEntry {
//   rank: number;
//   playerId: string;
//   playerName: string;
//   points: number;
//   votes: number;
// }

// // ─── FIX 1: Shared module-level profile cache ─────────────────────────────────
// interface CachedProfile {
//   id: string;
//   name: string;
//   type: "PLAYER" | "CLUB";
//   team: string;
//   avatar?: string;
// }
// const profileCache = new Map<string, CachedProfile>();

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const RING_COLORS = [
//   "#ff9800", "#2196f3", "#00e676", "#e91e8c",
//   "#7c4dff", "#00bfa5", "#f44336", "#ffeb3b",
// ];

// const AVATAR_COLORS = [
//   "#e65100", "#1565c0", "#2e7d32", "#6a1b9a",
//   "#ad1457", "#4527a0", "#00695c", "#f9a825",
// ];

// function colorFromName(name: string, palette: string[]): string {
//   const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
//   return palette[hash % palette.length];
// }

// // ─── Icons ────────────────────────────────────────────────────────────────────
// const LightningIcon = ({ color = "#ff6d00" }: { color?: string }) => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill={color}>
//     <path d="M13 2L4.09 12.96H11L10 22L20.91 11.04H14L13 2Z" />
//   </svg>
// );

// const SearchIcon = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
//     <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
//   </svg>
// );

// const ShareIcon = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
//     <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
//   </svg>
// );

// const CloseIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
//     <path d="M18 6L6 18M6 6l12 12" />
//   </svg>
// );

// // ─── Sub-components ───────────────────────────────────────────────────────────
// const Avatar: React.FC<{
//   color: string;
//   initial: string;
//   size?: number;
//   rank?: number;
//   ringColor?: string;
//   avatarSrc?: string;
// }> = ({ color, initial, size = 40, rank, ringColor, avatarSrc }) => (
//   <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
//     {ringColor ? (
//       <div
//         className="absolute inset-0 rounded-full"
//         style={{
//           background: `conic-gradient(${ringColor} 0% 75%, #2a2a2a 75% 100%)`,
//           padding: "2.5px",
//           borderRadius: "50%",
//         }}
//       >
//         <div
//           className="w-full h-full rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
//           style={{ backgroundColor: color, fontSize: size * 0.38 }}
//         >
//           {avatarSrc
//             ? <Image src={avatarSrc} alt={initial} width={size} height={size} className="w-full h-full object-cover" />
//             : initial}
//         </div>
//       </div>
//     ) : (
//       <div
//         className="w-full h-full rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
//         style={{ backgroundColor: color, fontSize: size * 0.38 }}
//       >
//         {avatarSrc
//           ? <Image src={avatarSrc} alt={initial} width={size} height={size} className="w-full h-full object-cover" />
//           : initial}
//       </div>
//     )}
//     {rank !== undefined && (
//       <div
//         className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold border border-[#121212]"
//         style={{ backgroundColor: rank <= 3 ? "#ff6d00" : "#3a3a3a", fontSize: 8 }}
//       >
//         {rank}
//       </div>
//     )}
//   </div>
// );

// const RankBadge: React.FC<{ rank: number }> = ({ rank }) => (
//   <span
//     className="text-[15px] font-black w-8 text-center flex-shrink-0"
//     style={{ color: rank <= 3 ? "#ffa726" : "#666" }}
//   >
//     #{rank}
//   </span>
// );

// const AthleteRow: React.FC<{ athlete: RankedAthlete }> = ({ athlete }) => {
//   const isTop3 = athlete.rank <= 3;
//   return (
//     <div
//       className={`flex items-center gap-3 px-4 py-3.5 border-b border-[#1e1e1e] ${
//         isTop3 ? "bg-[#161616]" : ""
//       }`}
//     >
//       <RankBadge rank={athlete.rank} />
//       <Avatar
//         color={athlete.avatarColor}
//         initial={athlete.avatarInitial}
//         size={42}
//         rank={athlete.rank}
//         ringColor={isTop3 ? athlete.ringColor : undefined}
//         avatarSrc={athlete.avatar}
//       />
//       <div className="flex-1 min-w-0">
//         <p className="text-white text-[13px] font-semibold truncate">{athlete.name}</p>
//         <div className="flex items-center gap-1 mt-0.5">
//           <span
//             className="w-1.5 h-1.5 rounded-full flex-shrink-0"
//             style={{ backgroundColor: athlete.ringColor }}
//           />
//           <span className="text-[#666] text-[11px]">{athlete.sport}</span>
//         </div>
//       </div>
//       <div className="flex items-center gap-1 flex-shrink-0">
//         <LightningIcon color="#ff6d00" />
//         <span className="text-[#ff6d00] text-[14px] font-black">
//           {athlete.points.toLocaleString()}
//         </span>
//       </div>
//     </div>
//   );
// };

// const SkeletonRow = () => (
//   <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1e1e1e] animate-pulse">
//     <div className="w-8 h-4 bg-[#1e1e1e] rounded" />
//     <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex-shrink-0" />
//     <div className="flex-1 space-y-1.5">
//       <div className="h-3 bg-[#1e1e1e] rounded w-2/3" />
//       <div className="h-2.5 bg-[#1e1e1e] rounded w-1/3" />
//     </div>
//     <div className="h-4 bg-[#1e1e1e] rounded w-14" />
//   </div>
// );

// // ─── Main Component ───────────────────────────────────────────────────────────
// interface RankingsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const RankingsModal: React.FC<RankingsModalProps> = ({ isOpen, onClose }) => {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState<TabType>("live");
//   const [search, setSearch] = useState("");
//   const [athletes, setAthletes] = useState<RankedAthlete[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const inflightProfileFetches = useRef<Map<string, Promise<void>>>(new Map());

//   const checkPermission = useCallback(
//     (battle: Battle): boolean => {
//       if (!user?.userId) return false;
//       if (battle.userId === user.userId) return true;
//       return !!battle.invitedFriends?.some((f) => f.email === user.email);
//     },
//     [user]
//   );

//   const fetchLeaderboardForBattle = useCallback(
//     async (battleId: string): Promise<LeaderboardEntry[]> => {
//       try {
//         const res = await axios.get(
//           `/api/battle/battle-vote?battleId=${battleId}&userId=${user?.userId || ""}`
//         );
//         return res.data.success ? res.data.leaderboard || [] : [];
//       } catch {
//         return [];
//       }
//     },
//     [user]
//   );

//   const fetchProfileIfNeeded = useCallback(
//     async (id: string, battleType: "PLAYERS" | "CLUBS"): Promise<void> => {
//       if (profileCache.has(id)) return;

//       if (inflightProfileFetches.current.has(id)) {
//         await inflightProfileFetches.current.get(id);
//         return;
//       }

//       const fetchPromise = (async () => {
//         try {
//           if (battleType === "PLAYERS") {
//             const res = await axios.get(`/api/player-profile/${id}`);
//             const p = res.data.profile || res.data.data || res.data;
//             profileCache.set(id, {
//               id,
//               name: p.name || "Unknown Player",
//               type: "PLAYER",
//               team: p.team || "IPL",
//               avatar: p.avatar,
//             });
//           } else {
//             const res = await axios.get(`/api/club-profile/${id}`);
//             if (res.data.success) {
//               const c = res.data.profile;
//               profileCache.set(id, {
//                 id,
//                 name: c.name || "Unknown Club",
//                 type: "CLUB",
//                 team: c.team || "IPL",
//                 avatar: c.avatar,
//               });
//             }
//           }
//         } catch {
//           // skip failed items silently
//         } finally {
//           inflightProfileFetches.current.delete(id);
//         }
//       })();

//       inflightProfileFetches.current.set(id, fetchPromise);
//       await fetchPromise;
//     },
//     []
//   );

//   const fetchRankings = useCallback(async () => {
//     if (!user?.userId) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const battlesRes = await axios.get(`/api/battle?userId=${user.userId}`);
//       if (!battlesRes.data.success || !battlesRes.data.battles) {
//         setAthletes([]);
//         setLoading(false);
//         return;
//       }

//       const accessibleBattles: Battle[] = battlesRes.data.battles.filter(checkPermission);
//       if (accessibleBattles.length === 0) {
//         setAthletes([]);
//         setLoading(false);
//         return;
//       }

//       // Collect unique IDs and their battle type
//       const idToBattleType = new Map<string, "PLAYERS" | "CLUBS">();
//       for (const battle of accessibleBattles) {
//         const ids =
//           battle.battleType === "PLAYERS" ? battle.selectedPlayers : battle.selectedClubs;
//         for (const id of ids) {
//           if (!idToBattleType.has(id)) {
//             idToBattleType.set(id, battle.battleType);
//           }
//         }
//       }

//       // Fetch only uncached profiles, all in parallel
//       await Promise.all(
//         Array.from(idToBattleType.entries()).map(([id, battleType]) =>
//           fetchProfileIfNeeded(id, battleType)
//         )
//       );

//       // Aggregate leaderboard points
//       const pointsMap = new Map<string, number>();
//       await Promise.all(
//         accessibleBattles.map(async (battle) => {
//           const entries = await fetchLeaderboardForBattle(battle.id);
//           for (const entry of entries) {
//             pointsMap.set(entry.playerId, (pointsMap.get(entry.playerId) || 0) + entry.points);
//           }
//         })
//       );

//       // Build ranked list from cache + fresh points
//       const rankedList: RankedAthlete[] = [];
      
//       for (const id of idToBattleType.keys()) {
//         const cached = profileCache.get(id);
//         if (cached) {
//           rankedList.push({
//             id: cached.id,
//             name: cached.name,
//             type: cached.type,
//             sport: cached.team,
//             points: pointsMap.get(id) || 0,
//             avatar: cached.avatar,
//             avatarColor: colorFromName(cached.name, AVATAR_COLORS),
//             avatarInitial: cached.name.charAt(0).toUpperCase(),
//             ringColor: colorFromName(cached.name, RING_COLORS),
//             rank: 0,
//           });
//         }
//       }

//       // Sort and assign ranks
//       const sortedRanked = rankedList
//         .sort((a, b) => b.points - a.points)
//         .map((item, i) => ({ ...item, rank: i + 1 }));

//       setAthletes(sortedRanked);
//       setLastUpdated(new Date());
//     } catch (err) {
//       console.error("RankingsModal fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [user, checkPermission, fetchLeaderboardForBattle, fetchProfileIfNeeded]);

//   // Pause polling when tab is hidden
//   useEffect(() => {
//     if (!isOpen) {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//       return;
//     }

//     setLoading(true);
//     fetchRankings();

//     const startPolling = () => {
//       if (intervalRef.current) return;
//       intervalRef.current = setInterval(fetchRankings, 30000);
//     };

//     const stopPolling = () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };

//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         stopPolling();
//       } else {
//         fetchRankings();
//         startPolling();
//       }
//     };

//     if (!document.hidden) {
//       startPolling();
//     }

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => {
//       stopPolling();
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//     };
//   }, [isOpen, fetchRankings]);

//   if (!isOpen) return null;

//   const filtered = athletes.filter(
//     (a) =>
//       a.name.toLowerCase().includes(search.toLowerCase()) ||
//       a.sport.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="absolute inset-0 z-50 flex flex-col bg-[#121212]">
//       {/* ── Top Bar ── */}
//       <div className="flex items-center justify-between px-4 pt-5 pb-3 bg-[#121212]">
//         <div>
//           <h2 className="text-white text-[18px] font-black leading-tight">
//             {activeTab === "community" ? "Live Community" : "Rankings"}
//           </h2>
//           <p className="text-[#555] text-[11px] mt-0.5">
//             {activeTab === "live"
//               ? lastUpdated
//                 ? `Updated ${lastUpdated.toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}`
//                 : "Live Rankings"
//               : activeTab === "lifetime"
//               ? "All-Time Rankings"
//               : "Community Chat"}
//           </p>
//         </div>
//         <button
//           onClick={onClose}
//           className="w-8 h-8 rounded-full bg-[#1e1e1e] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors"
//         >
//           <CloseIcon />
//         </button>
//       </div>

//       {/* ── Tabs ── */}
//       <div className="flex gap-0 px-4 mb-0 border-b border-[#1e1e1e]">
//         {(["live", "lifetime", "community"] as TabType[]).map((tab) => {
//           const label =
//             tab === "live" ? "Live" : tab === "lifetime" ? "Lifetime" : "Live Community";
//           const isActive = activeTab === tab;
//           return (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`relative flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold transition-colors ${
//                 isActive ? "text-white" : "text-[#555] hover:text-[#888]"
//               }`}
//             >
//               {(tab === "live" || tab === "community") && (
//                 <span
//                   className={`w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#00e676] ${
//                     isActive ? "animate-pulse" : "opacity-50"
//                   }`}
//                 />
//               )}
//               {label}
//               {isActive && (
//                 <span
//                   className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full"
//                   style={{ background: tab === "community" ? "#00e676" : "#ff6d00" }}
//                 />
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {/* ── Content ── */}
//       <div className="flex-1 overflow-y-auto">
//         {(activeTab === "live" || activeTab === "lifetime") && (
//           <>
//             {/* Search + Share */}
//             <div className="flex gap-2 px-4 py-3">
//               <div className="flex-1 flex items-center gap-2 bg-[#1a1a1a] border border-[#252525] rounded-xl px-3 py-2.5">
//                 <SearchIcon />
//                 <input
//                   type="text"
//                   placeholder="Search players or teams..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="flex-1 bg-transparent text-white text-[13px] placeholder-[#444] outline-none"
//                 />
//               </div>
//               {activeTab === "live" && (
//                 <button className="flex items-center gap-1.5 bg-[#ff6d00] hover:bg-[#e65100] transition-colors px-3 py-2 rounded-xl text-white text-[12px] font-bold">
//                   <ShareIcon />
//                   Share
//                 </button>
//               )}
//             </div>

//             {/* Count badge */}
//             {!loading && filtered.length > 0 && (
//               <div className="px-4 pb-2">
//                 <span className="text-[#555] text-[11px]">
//                   {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
//                   {activeTab === "live" && (
//                     <span className="ml-2 text-[#00e676]">● refreshes every 30s</span>
//                   )}
//                 </span>
//               </div>
//             )}

//             {/* List */}
//             <div className="pb-4">
//               {loading ? (
//                 Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
//               ) : filtered.length > 0 ? (
//                 filtered.map((a) => <AthleteRow key={a.id} athlete={a} />)
//               ) : (
//                 <div className="text-center py-12">
//                   <p className="text-3xl mb-3">🏆</p>
//                   <p className="text-[#555] text-[13px]">
//                     {search
//                       ? "No players match your search"
//                       : "No rankings yet — vote in battles to populate!"}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {/* Community tab */}
//         {activeTab === "community" && (
//           <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
//             <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
//               <span className="text-2xl">💬</span>
//             </div>
//             <p className="text-white font-bold text-sm mb-1">Community chat coming soon</p>
//             <p className="text-[#555] text-xs leading-relaxed">
//               Real-time fan chat will appear here once the API is connected.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RankingsModal;

















"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabType = "live" | "lifetime" | "community";

interface RankedAthlete {
  id: string;
  rank: number;
  name: string;
  sport: string;
  points: number;
  type: "PLAYER" | "CLUB";
  avatar?: string;
  avatarColor: string;
  avatarInitial: string;
  ringColor: string;
}

interface Battle {
  id: string;
  battleName: string;
  battleType: "PLAYERS" | "CLUBS";
  selectedPlayers: string[];
  selectedClubs: string[];
  invitedFriends: Array<{ email: string; name: string }>;
  userId: string;
  userName: string;
  createdAt: number;
  updatedAt: number;
}

interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  points: number;
  votes: number;
}

// ─── Shared module-level profile cache ────────────────────────────────────────
interface CachedProfile {
  id: string;
  name: string;
  type: "PLAYER" | "CLUB";
  team: string;
  avatar?: string;
}
const profileCache = new Map<string, CachedProfile>();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RING_COLORS = [
  "#ff9800", "#2196f3", "#00e676", "#e91e8c",
  "#7c4dff", "#00bfa5", "#f44336", "#ffeb3b",
];

const AVATAR_COLORS = [
  "#e65100", "#1565c0", "#2e7d32", "#6a1b9a",
  "#ad1457", "#4527a0", "#00695c", "#f9a825",
];

function colorFromName(name: string, palette: string[]): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const LightningIcon = ({ color = "#ff6d00" }: { color?: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={color}>
    <path d="M13 2L4.09 12.96H11L10 22L20.91 11.04H14L13 2Z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
const Avatar: React.FC<{
  color: string;
  initial: string;
  size?: number;
  rank?: number;
  ringColor?: string;
  avatarSrc?: string;
}> = ({ color, initial, size = 40, rank, ringColor, avatarSrc }) => (
  <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
    {ringColor ? (
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${ringColor} 0% 75%, #2a2a2a 75% 100%)`,
          padding: "2.5px",
          borderRadius: "50%",
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
          style={{ backgroundColor: color, fontSize: size * 0.38 }}
        >
          {avatarSrc
            ? <Image src={avatarSrc} alt={initial} width={size} height={size} className="w-full h-full object-cover" />
            : initial}
        </div>
      </div>
    ) : (
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
        style={{ backgroundColor: color, fontSize: size * 0.38 }}
      >
        {avatarSrc
          ? <Image src={avatarSrc} alt={initial} width={size} height={size} className="w-full h-full object-cover" />
          : initial}
      </div>
    )}
    {rank !== undefined && (
      <div
        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold border border-[#121212]"
        style={{ backgroundColor: rank <= 3 ? "#ff6d00" : "#3a3a3a", fontSize: 8 }}
      >
        {rank}
      </div>
    )}
  </div>
);

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => (
  <span
    className="text-[15px] font-black w-8 text-center flex-shrink-0"
    style={{ color: rank <= 3 ? "#ffa726" : "#666" }}
  >
    #{rank}
  </span>
);

const AthleteRow: React.FC<{ athlete: RankedAthlete }> = ({ athlete }) => {
  const isTop3 = athlete.rank <= 3;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 border-b border-[#1e1e1e] ${
        isTop3 ? "bg-[#161616]" : ""
      }`}
    >
      <RankBadge rank={athlete.rank} />
      <Avatar
        color={athlete.avatarColor}
        initial={athlete.avatarInitial}
        size={42}
        rank={athlete.rank}
        ringColor={isTop3 ? athlete.ringColor : undefined}
        avatarSrc={athlete.avatar}
      />
      <div className="flex-1 min-w-0">
        <p className="text-white text-[13px] font-semibold truncate">{athlete.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: athlete.ringColor }}
          />
          <span className="text-[#666] text-[11px]">{athlete.sport}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <LightningIcon color="#ff6d00" />
        <span className="text-[#ff6d00] text-[14px] font-black">
          {athlete.points.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1e1e1e] animate-pulse">
    <div className="w-8 h-4 bg-[#1e1e1e] rounded" />
    <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex-shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-[#1e1e1e] rounded w-2/3" />
      <div className="h-2.5 bg-[#1e1e1e] rounded w-1/3" />
    </div>
    <div className="h-4 bg-[#1e1e1e] rounded w-14" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
interface RankingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RankingsModal: React.FC<RankingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("live");
  const [search, setSearch] = useState("");
  const [athletes, setAthletes] = useState<RankedAthlete[]>([]);
  const [loading, setLoading] = useState(true);

  const inflightProfileFetches = useRef<Map<string, Promise<void>>>(new Map());

  const checkPermission = useCallback(
    (battle: Battle): boolean => {
      if (!user?.userId) return false;
      if (battle.userId === user.userId) return true;
      return !!battle.invitedFriends?.some((f) => f.email === user.email);
    },
    [user]
  );

  const fetchLeaderboardForBattle = useCallback(
    async (battleId: string): Promise<LeaderboardEntry[]> => {
      try {
        const res = await axios.get(
          `/api/battle/battle-vote?battleId=${battleId}&userId=${user?.userId || ""}`
        );
        return res.data.success ? res.data.leaderboard || [] : [];
      } catch {
        return [];
      }
    },
    [user]
  );

  const fetchProfileIfNeeded = useCallback(
    async (id: string, battleType: "PLAYERS" | "CLUBS"): Promise<void> => {
      if (profileCache.has(id)) return;

      if (inflightProfileFetches.current.has(id)) {
        await inflightProfileFetches.current.get(id);
        return;
      }

      const fetchPromise = (async () => {
        try {
          if (battleType === "PLAYERS") {
            const res = await axios.get(`/api/player-profile/${id}`);
            const p = res.data.profile || res.data.data || res.data;
            profileCache.set(id, {
              id,
              name: p.name || "Unknown Player",
              type: "PLAYER",
              team: p.team || "IPL",
              avatar: p.avatar,
            });
          } else {
            const res = await axios.get(`/api/club-profile/${id}`);
            if (res.data.success) {
              const c = res.data.profile;
              profileCache.set(id, {
                id,
                name: c.name || "Unknown Club",
                type: "CLUB",
                team: c.team || "IPL",
                avatar: c.avatar,
              });
            }
          }
        } catch {
          // skip failed items silently
        } finally {
          inflightProfileFetches.current.delete(id);
        }
      })();

      inflightProfileFetches.current.set(id, fetchPromise);
      await fetchPromise;
    },
    []
  );

  const fetchRankings = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch ALL battles for global rankings
      const battlesRes = await axios.get(`/api/battle`);
      if (!battlesRes.data.success || !battlesRes.data.battles) {
        setAthletes([]);
        setLoading(false);
        return;
      }

      // Include ALL battles for global rankings
      const accessibleBattles: Battle[] = battlesRes.data.battles;
      if (accessibleBattles.length === 0) {
        setAthletes([]);
        setLoading(false);
        return;
      }

      const idToBattleType = new Map<string, "PLAYERS" | "CLUBS">();
      for (const battle of accessibleBattles) {
        const ids =
          battle.battleType === "PLAYERS" ? battle.selectedPlayers : battle.selectedClubs;
        for (const id of ids) {
          if (!idToBattleType.has(id)) {
            idToBattleType.set(id, battle.battleType);
          }
        }
      }

      await Promise.all(
        Array.from(idToBattleType.entries()).map(([id, battleType]) =>
          fetchProfileIfNeeded(id, battleType)
        )
      );

      const pointsMap = new Map<string, number>();
      await Promise.all(
        accessibleBattles.map(async (battle) => {
          const entries = await fetchLeaderboardForBattle(battle.id);
          for (const entry of entries) {
            pointsMap.set(entry.playerId, (pointsMap.get(entry.playerId) || 0) + entry.points);
          }
        })
      );

      const rankedList: RankedAthlete[] = [];
      for (const id of idToBattleType.keys()) {
        const cached = profileCache.get(id);
        if (cached) {
          rankedList.push({
            id: cached.id,
            name: cached.name,
            type: cached.type,
            sport: cached.team,
            points: pointsMap.get(id) || 0,
            avatar: cached.avatar,
            avatarColor: colorFromName(cached.name, AVATAR_COLORS),
            avatarInitial: cached.name.charAt(0).toUpperCase(),
            ringColor: colorFromName(cached.name, RING_COLORS),
            rank: 0,
          });
        }
      }

      const sortedRanked = rankedList
        .sort((a, b) => b.points - a.points)
        .map((item, i) => ({ ...item, rank: i + 1 }));

      setAthletes(sortedRanked);
    } catch (err) {
      console.error("RankingsModal fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, checkPermission, fetchLeaderboardForBattle, fetchProfileIfNeeded]);

  // Fetch only when modal opens — no polling
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchRankings();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const filtered = athletes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.sport.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed top-[104px] md:top-[64px] lg:left-[84px] inset-x-0 bottom-0 z-40 flex flex-col bg-[#121212] pb-10">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 bg-[#121212]">
        <div>
          <h2 className="text-white text-[18px] font-black leading-tight">
            {activeTab === "community" ? "Live Community" : "Rankings"}
          </h2>
          <p className="text-[#555] text-[11px] mt-0.5">
            {activeTab === "live"
              ? "Live Rankings"
              : activeTab === "lifetime"
              ? "All-Time Rankings"
              : "Community Chat"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#1e1e1e] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-0 px-4 mb-0 border-b border-[#1e1e1e]">
        {(["live", "lifetime", "community"] as TabType[]).map((tab) => {
          const label =
            tab === "live" ? "Live" : tab === "lifetime" ? "Lifetime" : "Live Community";
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold transition-colors ${
                isActive ? "text-white" : "text-[#555] hover:text-[#888]"
              }`}
            >
              {(tab === "live" || tab === "community") && (
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#00e676] ${
                    isActive ? "animate-pulse" : "opacity-50"
                  }`}
                />
              )}
              {label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full"
                  style={{ background: tab === "community" ? "#00e676" : "#ff6d00" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {(activeTab === "live" || activeTab === "lifetime") && (
          <>
            {/* Search + Share */}
            <div className="flex gap-2 px-4 py-3">
              <div className="flex-1 flex items-center gap-2 bg-[#1a1a1a] border border-[#252525] rounded-xl px-3 py-2.5">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search players or teams..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white text-[13px] placeholder-[#444] outline-none"
                />
              </div>
              {activeTab === "live" && (
                <button className="flex items-center gap-1.5 bg-[#ff6d00] hover:bg-[#e65100] transition-colors px-3 py-2 rounded-xl text-white text-[12px] font-bold">
                  <ShareIcon />
                  Share
                </button>
              )}
            </div>

            {/* Count badge */}
            {!loading && filtered.length > 0 && (
              <div className="px-4 pb-2">
                <span className="text-[#555] text-[11px]">
                  {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
                </span>
              </div>
            )}

            {/* List */}
            <div className="pb-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length > 0 ? (
                filtered.map((a) => <AthleteRow key={a.id} athlete={a} />)
              ) : (
                <div className="text-center py-12">
                  <p className="text-3xl mb-3">🏆</p>
                  <p className="text-[#555] text-[13px]">
                    {search
                      ? "No players match your search"
                      : "No rankings yet — vote in battles to populate!"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Community tab */}
        {activeTab === "community" && (
          <div className="flex flex-col items-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-white font-bold text-sm mb-1">Community chat coming soon</p>
            <p className="text-[#555] text-xs leading-relaxed">
              Real-time fan chat will appear here once the API is connected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingsModal;