// // // \components\NewHomeComponents\Myroomsstatspreview.tsx

// // import { motion } from "framer-motion";
// // import { MessageCircle, Users, Flame, TrendingUp } from "lucide-react";
// // import type { Room } from "../NewROARComponent/types";

// // interface RoomCounts {
// //   post: number;
// //   debate: number;
// //   prediction: number;
// //   trivia: number;
// //   battle: number;
// // }

// // interface PresenceInfo {
// //   fanCount: number;
// //   totalJoinCount?: number;
// // }

// // const SPORT_ICON_BG: Record<string, string> = {
// //   cricket: "linear-gradient(135deg,#e91e8c,#dc2626)",
// //   football: "linear-gradient(135deg,#16a34a,#0d9488)",
// //   default: "linear-gradient(135deg,#7c3aed,#4f46e5)",
// // };

// // function formatCount(n: number) {
// //   if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
// //   return `${n}`;
// // }

// // /**
// //  * "MY ROOMS" list — mirrors image 4.
// //  * Excludes the always-on Open/Pulse room; only shows joinable match/community rooms.
// //  * `presenceByRoom` / `countsByRoom` should come from the same fetch already
// //  * used in RoomsHome (presence-preview + per-room counts endpoints).
// //  */
// // export function MyRoomsList({
// //   rooms,
// //   presenceByRoom,
// //   countsByRoom,
// //   openRoomId,
// //   onSeeAll,
// //   onEnter,
// // }: {
// //   rooms: Room[];
// //   presenceByRoom: Record<string, PresenceInfo>;
// //   countsByRoom: Record<string, RoomCounts>;
// //   openRoomId: string;
// //   onSeeAll: () => void;
// //   onEnter: (room: Room) => void;
// // }) {
// //   const visibleRooms = rooms.filter((r) => r.roomId !== openRoomId);

// //   return (
// //     <div className="w-full">
// //       <div className="flex items-center justify-between px-1 mb-2">
// //         <span className="text-[11px] font-extrabold text-white/50 tracking-wide">MY ROOMS</span>
// //         <button
// //           type="button"
// //           onClick={onSeeAll}
// //           className="text-[11px] font-bold bg-transparent border-none cursor-pointer"
// //           style={{ color: "#ff6b35" }}
// //         >
// //           See all
// //         </button>
// //       </div>

// //       <div className="flex flex-col gap-2">
// //         {visibleRooms.map((room) => {
// //           const sport = (room.sport ?? "default").toLowerCase();
// //           const presence = presenceByRoom[room.roomId];
// //           const counts = countsByRoom[room.roomId];
// //           const isLive = room.status === "live" || presence?.fanCount !== undefined && presence.fanCount > 0;
// //           const unread = counts ? counts.post + counts.debate : undefined;
// //           const iconBg = SPORT_ICON_BG[sport] ?? SPORT_ICON_BG.default;

// //           return (
// //             <motion.div
// //               key={room.roomId}
// //               whileTap={{ scale: 0.98 }}
// //               onClick={() => onEnter(room)}
// //               className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer"
// //               style={{
// //                 background: isLive
// //                   ? "linear-gradient(90deg,#8a1240,#c2410c)"
// //                   : "#121218",
// //                 border: isLive ? "none" : "1px solid rgba(255,255,255,0.08)",
// //               }}
// //             >
// //               <div
// //                 className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
// //                 style={{ background: iconBg }}
// //               >
// //                 <Flame size={16} className="text-white" />
// //               </div>

// //               <div className="flex-1 min-w-0">
// //                 <div className="flex items-center gap-1.5">
// //                   <p className="text-[13px] font-extrabold text-white truncate">{room.name}</p>
// //                   {isLive && (
// //                     <span className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-300 bg-black/20 px-1.5 py-0.5 rounded-full shrink-0">
// //                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
// //                       LIVE
// //                     </span>
// //                   )}
// //                 </div>
// //                 <p className="text-[11px] font-medium truncate" style={{ color: isLive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)" }}>
// //                   {room.description ?? (isLive
// //                     ? `${presence ? formatCount(presence.fanCount) : "—"} active`
// //                     : `${presence?.totalJoinCount ? formatCount(presence.totalJoinCount) : "—"} members${presence?.fanCount ? ` · ${presence.fanCount} active` : ""}`)}
// //                 </p>
// //               </div>

// //               {!isLive && unread !== undefined && unread > 0 && (
// //                 <span
// //                   className="flex items-center justify-center rounded-full text-white text-[10px] font-extrabold shrink-0"
// //                   style={{ minWidth: 20, height: 18, padding: "0 5px", background: "#e91e8c" }}
// //                 >
// //                   {unread}
// //                 </span>
// //               )}

// //               <button
// //                 type="button"
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   onEnter(room);
// //                 }}
// //                 className="shrink-0 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full border-none cursor-pointer"
// //                 style={{
// //                   background: isLive ? "rgba(0,0,0,0.25)" : "rgba(233,30,140,0.12)",
// //                   color: isLive ? "#fff" : "#ff6b35",
// //                 }}
// //               >
// //                 {isLive ? "Enter" : "Open"}
// //               </button>
// //             </motion.div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }

// // /**
// //  * "ROAR PULSE LIVE" summary bar — mirrors image 5.
// //  * Uses aggregate stats across all rooms (including the open/pulse room's own
// //  * live counters) — this is the only place the open room's data should surface,
// //  * as a single trending highlight rather than a full room card.
// //  */
// // export function RoarPulseLiveBar({
// //   liveRoomsCount,
// //   activeFansCount,
// //   postsPerMin,
// //   trendingLabel,
// //   onOpen,
// // }: {
// //   liveRoomsCount: number;
// //   activeFansCount: number;
// //   postsPerMin: number;
// //   trendingLabel: string;
// //   onOpen: () => void;
// // }) {
// //   const stats = [
// //     { label: "Live Rooms", value: liveRoomsCount, color: "#f43f5e", Icon: Flame },
// //     { label: "Active Fans", value: formatCount(activeFansCount), color: "#f59e0b", Icon: Users },
// //     { label: "Posts / min", value: postsPerMin, color: "#e91e8c", Icon: MessageCircle },
// //   ];

// //   return (
// //     <div className="rounded-2xl border border-white/[0.08] bg-[#121218] p-3">
// //       <div className="flex items-center justify-between mb-2.5 px-0.5">
// //         <div className="flex items-center gap-1.5">
// //           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
// //           <span className="text-[10px] font-extrabold text-white/50 tracking-wide">ROAR PULSE LIVE</span>
// //         </div>
// //         <button
// //           type="button"
// //           onClick={onOpen}
// //           className="text-[11px] font-bold bg-transparent border-none cursor-pointer"
// //           style={{ color: "#ff6b35" }}
// //         >
// //           Open ›
// //         </button>
// //       </div>

// //       <div className="grid grid-cols-4 gap-1.5">
// //         {stats.map(({ label, value, color, Icon }) => (
// //           <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-[#0a0a0f] py-2.5 px-1">
// //             <Icon size={14} style={{ color }} />
// //             <span className="text-[14px] font-extrabold leading-none" style={{ color }}>
// //               {value}
// //             </span>
// //             <span className="text-[8px] text-white/40 font-semibold text-center truncate w-full">{label}</span>
// //           </div>
// //         ))}

// //         <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#0a0a0f] py-2.5 px-1">
// //           <TrendingUp size={14} className="text-amber-300" />
// //           <span className="text-[10px] font-extrabold text-amber-300 leading-none text-center truncate w-full">
// //             {trendingLabel}
// //           </span>
// //           <span className="text-[8px] text-white/40 font-semibold">Trending</span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }






// // \components\NewHomeComponents\Myroomsstatspreview.tsx

// import { useState, useEffect, useMemo } from "react";
// import { motion } from "framer-motion";
// import axios from "axios";
// import { MessageCircle, Users, Flame, TrendingUp, AlertCircle } from "lucide-react";
// import type { Room } from "../NewROARComponent/types";

// interface RoomCounts {
//   post: number;
//   debate: number;
//   prediction: number;
//   trivia: number;
//   battle: number;
// }

// interface PresenceInfo {
//   fanCount: number;
//   totalJoinCount?: number;
// }

// const SPORT_ICON_BG: Record<string, string> = {
//   cricket: "linear-gradient(135deg,#e91e8c,#dc2626)",
//   football: "linear-gradient(135deg,#16a34a,#0d9488)",
//   default: "linear-gradient(135deg,#7c3aed,#4f46e5)",
// };

// function formatCount(n: number) {
//   if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
//   return `${n}`;
// }

// // ── Shared data hook ─────────────────────────────────────────────────────
// // Both MyRoomsList and RoarPulseLiveBar need the same room/presence/counts
// // data, so both pull from this hook rather than each doing their own fetch.
// //
// // Rooms are fetched via GET /api/roar/rooms (the same list endpoint
// // ROARApp.tsx's fetchRooms() uses to populate the `rooms` prop RoomsHome.tsx
// // receives) — no static room-id allowlist anymore, all rooms returned by
// // that endpoint are shown.
// //
// // status:
// //   "loading" — first fetch in flight, nothing to show yet
// //   "error"   — the fetch itself blew up (network/500/etc) — distinct from
// //               a legitimate empty result, so the UI can tell them apart
// //   "empty"   — fetch succeeded but resolved zero rooms
// //   "ready"   — fetch succeeded with at least one room
// function useRoomsPreviewData() {
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [presenceByRoom, setPresenceByRoom] = useState<Record<string, PresenceInfo>>({});
//   const [countsByRoom, setCountsByRoom] = useState<Record<string, RoomCounts>>({});
//   const [status, setStatus] = useState<"loading" | "error" | "empty" | "ready">("loading");

//   useEffect(() => {
//     let cancelled = false;
//     setStatus((prev) => (prev === "ready" ? prev : "loading"));

//     const fetchAll = async () => {
//       try {
//         const allRoomsRes = await axios.get(`/api/roar/rooms?t=${Date.now()}`).catch((err) => {
//           console.warn(
//             "[Myroomsstatspreview] GET /api/roar/rooms failed:",
//             err?.response?.status,
//             err?.response?.data ?? err?.message
//           );
//           return null;
//         });

//         if (cancelled) return;

//         const fetchedRooms: Room[] = allRoomsRes?.data?.success ? allRoomsRes.data.rooms ?? [] : [];
//         const roomIds = fetchedRooms.map((r) => r.roomId);
//         setRooms(fetchedRooms);

//         if (roomIds.length === 0) {
//           setPresenceByRoom({});
//           setCountsByRoom({});
//           setStatus("empty");
//           return;
//         }

//         const [presenceRes, countsResults] = await Promise.all([
//           axios.post("/api/roar/rooms/presence-preview", { roomIds }).catch((err) => {
//             console.warn(
//               "[Myroomsstatspreview] presence-preview failed:",
//               err?.response?.status,
//               err?.response?.data ?? err?.message
//             );
//             return null;
//           }),
//           Promise.all(
//             roomIds.map((id) =>
//               axios
//                 .get(`/api/roar/rooms/${id}/messages`, { params: { limit: 1 } })
//                 .then((r) => [id, r.data?.counts as RoomCounts | undefined] as const)
//                 .catch((err) => {
//                   console.warn(
//                     `[Myroomsstatspreview] GET /api/roar/rooms/${id}/messages failed:`,
//                     err?.response?.status,
//                     err?.response?.data ?? err?.message
//                   );
//                   return [id, undefined] as const;
//                 })
//             )
//           ),
//         ]);

//         if (cancelled) return;

//         if (presenceRes?.data?.success) {
//           setPresenceByRoom(presenceRes.data.rooms);
//         }

//         const nextCounts: Record<string, RoomCounts> = {};
//         countsResults.forEach(([id, counts]) => {
//           if (counts) nextCounts[id] = counts;
//         });
//         setCountsByRoom(nextCounts);

//         setStatus(fetchedRooms.length > 0 ? "ready" : "empty");
//       } catch (e) {
//         console.error("[Myroomsstatspreview] Failed to load rooms preview data:", e);
//         if (!cancelled) setStatus("error");
//       }
//     };

//     fetchAll();
//     const iv = setInterval(() => {
//       if (!document.hidden) fetchAll();
//     }, 30_000);
//     return () => { cancelled = true; clearInterval(iv); };
//   }, []);

//   return { rooms, presenceByRoom, countsByRoom, status };
// }

// function RoomRowSkeleton() {
//   return (
//     <div className="flex items-center gap-3 rounded-2xl p-3 border border-white/[0.06] bg-[#121218]">
//       <div className="w-10 h-10 rounded-xl bg-white/[0.06] shrink-0 animate-pulse" />
//       <div className="flex-1 min-w-0 flex flex-col gap-1.5">
//         <div className="h-3 w-2/3 rounded bg-white/[0.06] animate-pulse" />
//         <div className="h-2.5 w-1/2 rounded bg-white/[0.04] animate-pulse" />
//       </div>
//     </div>
//   );
// }

// function MyRoomsEmptyState({ isError }: { isError: boolean }) {
//   return (
//     <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#121218] py-6 px-4 text-center">
//       <AlertCircle size={18} className="text-white/25" />
//       <p className="text-[12px] font-bold text-white/50 m-0">
//         {isError ? "Couldn't load your rooms" : "No rooms yet"}
//       </p>
//       <p className="text-[10px] text-white/30 m-0">
//         {isError ? "Check your connection and try again." : "Join or start a room to see it here."}
//       </p>
//     </div>
//   );
// }

// /**
//  * "MY ROOMS" list — mirrors image 4.
//  * Excludes the always-on Open/Pulse room; only shows joinable match/community rooms.
//  * Self-sufficient: fetches its own room/presence/counts data internally, and
//  * renders explicit loading/empty/error states instead of rendering nothing.
//  */
// export function MyRoomsList({
//   openRoomId,
//   onSeeAll,
//   onEnter,
// }: {
//   openRoomId: string;
//   onSeeAll: () => void;
//   onEnter: (room: Room) => void;
// }) {
//   const { rooms, presenceByRoom, countsByRoom, status } = useRoomsPreviewData();
//   const visibleRooms = rooms.filter((r) => r.roomId !== openRoomId);

//   return (
//     <div className="w-full">
//       <div className="flex items-center justify-between px-1 mb-2">
//         <span className="text-[11px] font-extrabold text-white/50 tracking-wide">MY ROOMS</span>
//         <button
//           type="button"
//           onClick={onSeeAll}
//           className="text-[11px] font-bold bg-transparent border-none cursor-pointer"
//           style={{ color: "#ff6b35" }}
//         >
//           See all
//         </button>
//       </div>

//       {status === "loading" && (
//         <div className="flex flex-col gap-2">
//           <RoomRowSkeleton />
//           <RoomRowSkeleton />
//         </div>
//       )}

//       {(status === "empty" || status === "error") && (
//         <MyRoomsEmptyState isError={status === "error"} />
//       )}

//       {status === "ready" && (
//         <div className="flex flex-col gap-2">
//           {visibleRooms.map((room) => {
//             const sport = (room.sport ?? "default").toLowerCase();
//             const presence = presenceByRoom[room.roomId];
//             const counts = countsByRoom[room.roomId];
//             const isLive = room.status === "live" || (presence?.fanCount !== undefined && presence.fanCount > 0);
//             const unread = counts ? counts.post + counts.debate : undefined;
//             const iconBg = SPORT_ICON_BG[sport] ?? SPORT_ICON_BG.default;

//             return (
//               <motion.div
//                 key={room.roomId}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => onEnter(room)}
//                 className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer"
//                 style={{
//                   background: isLive
//                     ? "linear-gradient(90deg,#8a1240,#c2410c)"
//                     : "#121218",
//                   border: isLive ? "none" : "1px solid rgba(255,255,255,0.08)",
//                 }}
//               >
//                 <div
//                   className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
//                   style={{ background: iconBg }}
//                 >
//                   <Flame size={16} className="text-white" />
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-1.5">
//                     <p className="text-[13px] font-extrabold text-white">{room.name}</p>
//                     {isLive && (
//                       <span className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-300 bg-black/20 px-1.5 py-0.5 rounded-full shrink-0">
//                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
//                         LIVE
//                       </span>
//                     )}
//                   </div>
//                   {/* <p className="text-[11px] font-medium truncate" style={{ color: isLive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)" }}>
//                     {room.description ?? (isLive
//                       ? `${presence ? formatCount(presence.fanCount) : "—"} active`
//                       : `${presence?.totalJoinCount ? formatCount(presence.totalJoinCount) : "—"} members${presence?.fanCount ? ` · ${presence.fanCount} active` : ""}`)}
//                   </p> */}
//                 </div>

//                 {/* {!isLive && unread !== undefined && unread > 0 && (
//                   <span
//                     className="flex items-center justify-center rounded-full text-white text-[10px] font-extrabold shrink-0"
//                     style={{ minWidth: 20, height: 18, padding: "0 5px", background: "#e91e8c" }}
//                   >
//                     {unread}
//                   </span>
//                 )} */}

//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onEnter(room);
//                   }}
//                   className="shrink-0 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full border-none cursor-pointer"
//                   style={{
//                     background: isLive ? "rgba(0,0,0,0.25)" : "rgba(233,30,140,0.12)",
//                     color: isLive ? "#fff" : "#ff6b35",
//                   }}
//                 >
//                   {isLive ? "Enter" : "Open"}
//                 </button>
//               </motion.div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// /**
//  * "ROAR PULSE LIVE" summary bar — mirrors image 5.
//  * Derives its stats from the same live room/presence/counts data
//  * MyRoomsList uses, instead of taking hardcoded numbers as props.
//  */
// export function RoarPulseLiveBar({
//   onOpen,
// }: {
//   onOpen: () => void;
// }) {
//   const { rooms, presenceByRoom, countsByRoom, status } = useRoomsPreviewData();
//   const loaded = status === "ready" || status === "empty";

//   const stats = useMemo(() => {
//     const liveRoomsCount = rooms.filter(
//       (r) => (presenceByRoom[r.roomId]?.fanCount ?? 0) > 0
//     ).length;

//     const activeFansCount = rooms.reduce(
//       (sum, r) => sum + (presenceByRoom[r.roomId]?.fanCount ?? 0),
//       0
//     );

//     const totalPosts = rooms.reduce(
//       (sum, r) => sum + (countsByRoom[r.roomId]?.post ?? 0),
//       0
//     );
//     // Rough proxy until a real per-minute rate is tracked server-side —
//     // total posts across rooms scaled down over a 30-min assumed window.
//     const postsPerMin = Math.max(0, Math.round(totalPosts / 30));

//     const trendingRoom = rooms.reduce<{ room: Room | null; score: number }>(
//       (best, r) => {
//         const c = countsByRoom[r.roomId];
//         const score = c ? c.post + c.debate + c.prediction : 0;
//         return score > best.score ? { room: r, score } : best;
//       },
//       { room: null, score: -1 }
//     ).room;

//     return {
//       liveRoomsCount,
//       activeFansCount,
//       postsPerMin,
//       trendingLabel: trendingRoom ? trendingRoom.name : "—",
//     };
//   }, [rooms, presenceByRoom, countsByRoom]);

//   const displayStats = [
//     { label: "Live Rooms", value: loaded ? stats.liveRoomsCount : "···", color: "#f43f5e", Icon: Flame },
//     { label: "Active Fans", value: loaded ? formatCount(stats.activeFansCount) : "···", color: "#f59e0b", Icon: Users },
//     { label: "Posts / min", value: loaded ? stats.postsPerMin : "···", color: "#e91e8c", Icon: MessageCircle },
//   ];

//   return (
//     <div className="rounded-2xl border border-white/[0.08] bg-[#121218] p-3">
//       <div className="flex items-center justify-between mb-2.5 px-0.5">
//         <div className="flex items-center gap-1.5">
//           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//           <span className="text-[10px] font-extrabold text-white/50 tracking-wide">ROAR PULSE LIVE</span>
//         </div>
//         <button
//           type="button"
//           onClick={onOpen}
//           className="text-[11px] font-bold bg-transparent border-none cursor-pointer"
//           style={{ color: "#ff6b35" }}
//         >
//           Open ›
//         </button>
//       </div>

//       {status === "error" ? (
//         <div className="flex items-center justify-center gap-1.5 py-3">
//           <AlertCircle size={13} className="text-white/25" />
//           <span className="text-[10px] text-white/35 font-semibold">Couldn't load live stats</span>
//         </div>
//       ) : (
//         <div className="grid grid-cols-4 gap-1.5">
//           {displayStats.map(({ label, value, color, Icon }) => (
//             <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-[#0a0a0f] py-2.5 px-1">
//               <Icon size={14} style={{ color }} />
//               <span className="text-[14px] font-extrabold leading-none" style={{ color }}>
//                 {value}
//               </span>
//               <span className="text-[8px] text-white/40 font-semibold text-center truncate w-full">{label}</span>
//             </div>
//           ))}

//           <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#0a0a0f] py-2.5 px-1">
//             <TrendingUp size={14} className="text-amber-300" />
//             <span className="text-[10px] font-extrabold text-amber-300 leading-none text-center truncate w-full">
//               {loaded ? stats.trendingLabel : "···"}
//             </span>
//             <span className="text-[8px] text-white/40 font-semibold">Trending</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




// // components\NewHomeComponents\RoarRooms.tsx

// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { ChevronRight } from "lucide-react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import type { Room } from "../NewROARComponent/types";

// interface PresenceInfo {
//   fanCount: number;
//   totalJoinCount?: number;
// }

// export type RoarRoomCard = {
//   id: string;
//   emoji: string;
//   title: string; // "India vs Korea (Hockey)"
//   fansCount: string; // "18.4K"
//   messagesCount: string; // "32K"
//   avatarUrls: string[]; // first 3 shown
//   moreLabel?: string; // "+more"
//   ctaLabel: string;
//   onJoin: () => void;
// };

// function RoarRoomCardView({ card }: { card: RoarRoomCard }) {
//   return (
//     <div className="shrink-0 w-[220px] rounded-2xl bg-[#12101c] border border-white/[0.06] p-4 flex flex-col">
//       <div className="flex items-center gap-2.5 mb-3">
//         <span className="text-xl leading-none shrink-0">{card.emoji}</span>
//         <h4 className="text-[15px] font-extrabold text-white leading-tight">{card.title}</h4>
//       </div>

//       <p className="text-[11px] text-white/45 font-medium mb-3">
//         {card.fansCount} Fans · {card.messagesCount} Messages
//       </p>

//       <div className="flex items-center gap-1.5 mb-4">
//         <div className="flex -space-x-2">
//           {card.avatarUrls.slice(0, 3).map((url, i) => (
//             <img
//               key={i}
//               src={url}
//               alt=""
//               className="w-6 h-6 rounded-full border-2 border-[#12101c] object-cover"
//             />
//           ))}
//         </div>
//         {card.moreLabel && (
//           <span className="text-[11px] font-semibold text-white/40">{card.moreLabel}</span>
//         )}
//       </div>

//       <motion.button
//         whileTap={{ scale: 0.97 }}
//         onClick={card.onJoin}
//         className="w-full py-3 rounded-full font-extrabold text-white text-[13px]"
//         style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
//       >
//         {card.ctaLabel}
//       </motion.button>
//     </div>
//   );
// }

// /* ---------------------------------- Skeleton card ---------------------------------- */

// function RoarRoomCardSkeleton() {
//   return (
//     <div className="shrink-0 w-[220px] rounded-2xl bg-[#12101c] border border-white/[0.06] p-4 flex flex-col gap-3">
//       <div className="h-5 w-3/4 rounded bg-white/[0.07] animate-pulse" />
//       <div className="h-3 w-1/2 rounded bg-white/[0.05] animate-pulse" />
//       <div className="h-3 w-2/3 rounded bg-white/[0.04] animate-pulse" />
//       <div className="mt-auto h-10 w-full rounded-full bg-white/[0.07] animate-pulse" />
//     </div>
//   );
// }

// /* ---------------------------------- Helpers ---------------------------------- */

// const SPORT_EMOJI: Record<string, string> = {
//   cricket: "🏏",
//   football: "⚽",
//   hockey: "🏑",
//   badminton: "🏸",
//   athletics: "🏃",
//   shooting: "🎯",
//   wrestling: "🤼",
//   boxing: "🥊",
//   swimming: "🏊",
//   default: "🔥",
// };

// function getSportEmoji(sport?: string) {
//   if (!sport) return SPORT_EMOJI.default;
//   return SPORT_EMOJI[sport.toLowerCase()] ?? SPORT_EMOJI.default;
// }

// function formatCount(n: number) {
//   if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
//   if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
//   return `${n}`;
// }

// /* ---------------------------------- Exported component ---------------------------------- */

// export default function RoarRooms() {
//   const router = useRouter();
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [presenceByRoom, setPresenceByRoom] = useState<Record<string, PresenceInfo>>({});
//   const [status, setStatus] = useState<"loading" | "error" | "empty" | "ready">("loading");

//   useEffect(() => {
//     let cancelled = false;

//     const fetchAll = async () => {
//       try {
//         const roomsRes = await axios
//           .get(`/api/roar/rooms?t=${Date.now()}`)
//           .catch((err) => {
//             console.warn("[RoarRooms] GET /api/roar/rooms failed:", err?.response?.status, err?.message);
//             return null;
//           });

//         if (cancelled) return;

//         const fetchedRooms: Room[] = roomsRes?.data?.success ? roomsRes.data.rooms ?? [] : [];
//         setRooms(fetchedRooms);

//         if (fetchedRooms.length === 0) {
//           setPresenceByRoom({});
//           setStatus("empty");
//           return;
//         }

//         const roomIds = fetchedRooms.map((r) => r.roomId);
//         const presenceRes = await axios
//           .post("/api/roar/rooms/presence-preview", { roomIds })
//           .catch((err) => {
//             console.warn("[RoarRooms] presence-preview failed:", err?.response?.status, err?.message);
//             return null;
//           });

//         if (cancelled) return;

//         if (presenceRes?.data?.success) {
//           setPresenceByRoom(presenceRes.data.rooms ?? {});
//         }

//         setStatus("ready");
//       } catch (e) {
//         console.error("[RoarRooms] Failed to load rooms:", e);
//         if (!cancelled) setStatus("error");
//       }
//     };

//     fetchAll();
//     const iv = setInterval(() => { if (!document.hidden) fetchAll(); }, 30_000);
//     return () => { cancelled = true; clearInterval(iv); };
//   }, []);

//   // Navigate straight to this room's ROAR view via the ?room= query param,
//   // so the room the person tapped is the one that opens (instead of landing
//   // on ROAR's default/first room and relying on the localStorage auto-join
//   // flag, which the destination page may or may not read on mount).
//   const handleEnterRoom = (room: Room) => {
//     try { localStorage.setItem("roar_auto_join_room_id", room.roomId); } catch { /* ignore */ }
//     router.push(`/MainModules/ROAR?room=${room.roomId}`);
//   };

//   const liveCards: RoarRoomCard[] = rooms.map((room) => {
//     const presence = presenceByRoom[room.roomId];
//     const fanCount = presence?.fanCount ?? room.fanCount ?? 0;
//     const isLive = room.isActive || fanCount > 0;
//     return {
//       id: room.roomId,
//       emoji: getSportEmoji(room.sport),
//       title: room.name,
//       fansCount: fanCount > 0 ? formatCount(fanCount) : "—",
//       messagesCount: "—",
//       avatarUrls: [],
//       ctaLabel: isLive ? "Enter" : "Join",
//       onJoin: () => handleEnterRoom(room),
//     };
//   });

//   return (
//     <div className="w-full mt-5">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-[17px] font-extrabold text-white">Roar Rooms</h3>
//         <button
//           type="button"
//           className="flex items-center gap-0.5 text-[12px] font-bold"
//           style={{ color: "#E91E8C" }}
//           onClick={() => router.push("/MainModules/ROAR")}
//         >
//           View all
//           <ChevronRight size={14} />
//         </button>
//       </div>

//       <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
//         {status === "loading" && (
//           <>
//             <div className="snap-start"><RoarRoomCardSkeleton /></div>
//             <div className="snap-start"><RoarRoomCardSkeleton /></div>
//             <div className="snap-start"><RoarRoomCardSkeleton /></div>
//           </>
//         )}

//         {(status === "empty" || status === "error") && (
//           <div className="w-full rounded-2xl border border-white/[0.08] bg-[#12101c] py-6 px-4 text-center">
//             <p className="text-[12px] font-bold text-white/50 m-0">
//               {status === "error" ? "Couldn't load rooms" : "No rooms live right now"}
//             </p>
//             <p className="text-[10px] text-white/30 mt-1 m-0">
//               {status === "error" ? "Check your connection and try again." : "Check back soon for live action!"}
//             </p>
//           </div>
//         )}

//         {status === "ready" && liveCards.map((c) => (
//           <div key={c.id} className="snap-start">
//             <RoarRoomCardView card={c} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }




// // components\NewHomeComponents\RoarRooms.tsx

// import { motion } from "framer-motion";
// import { ChevronRight } from "lucide-react";
// import { useRouter } from "next/navigation";

// export type RoarRoomCard = {
//   id: string;
//   emoji: string;
//   title: string;
//   fansCount: string;
//   messagesCount: string;
//   avatarUrls: string[];
//   moreLabel?: string;
//   ctaLabel: string;
//   onJoin: () => void;
// };

// /* ---- DUMMY STATIC ROOM — replace these with your real values ---- */
// const STATIC_ROOM = {
//   roomId: "/MainModules/WatchAlong/room/acc569cd-831b-4f3c-ab7d-cf862b11be6a",       // <-- your real room path/id
//   name: "India vs Sri Lanka (Test - Day 4)",         // <-- title
//   sport: "cricket",
//   imageUrl: "/images/ind_vs_sl_room_dp.png", // <-- your real image path
//   fanCount: 1840,
// };
// /* ------------------------------------------------------------------ */

// function RoarRoomCardView({ card }: { card: RoarRoomCard }) {
//   return (
//     <div className="shrink-0 w-[220px] rounded-2xl bg-[#12101c] border border-white/[0.06] p-4 flex flex-col">
//       <div className="flex items-center gap-2.5 mb-3">
//         <span className="text-xl leading-none shrink-0">{card.emoji}</span>
//         <h4 className="text-[15px] font-extrabold text-white leading-tight">{card.title}</h4>
//       </div>

//       {/* <p className="text-[11px] text-white/45 font-medium mb-3">
//         {card.fansCount} Fans · {card.messagesCount} Messages
//       </p> */}

//       <div className="flex items-center gap-1.5 mb-4">
//         <div className="flex -space-x-2">
//           {card.avatarUrls.slice(0, 3).map((url, i) => (
//             <img
//               key={i}
//               src={url}
//               alt=""
//               className="w-6 h-6 rounded-full border-2 border-[#12101c] object-cover"
//             />
//           ))}
//         </div>
//         {card.moreLabel && (
//           <span className="text-[11px] font-semibold text-white/40">{card.moreLabel}</span>
//         )}
//       </div>

//       <motion.button
//         whileTap={{ scale: 0.97 }}
//         onClick={card.onJoin}
//         className="w-full py-3 rounded-full font-extrabold text-white text-[13px]"
//         style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
//       >
//         {card.ctaLabel}
//       </motion.button>
//     </div>
//   );
// }

// const SPORT_EMOJI: Record<string, string> = {
//   cricket: "🏏",
//   football: "⚽",
//   hockey: "🏑",
//   badminton: "🏸",
//   athletics: "🏃",
//   shooting: "🎯",
//   wrestling: "🤼",
//   boxing: "🥊",
//   swimming: "🏊",
//   default: "🔥",
// };

// function getSportEmoji(sport?: string) {
//   if (!sport) return SPORT_EMOJI.default;
//   return SPORT_EMOJI[sport.toLowerCase()] ?? SPORT_EMOJI.default;
// }

// function formatCount(n: number) {
//   if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
//   if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
//   return `${n}`;
// }

// export default function RoarRooms() {
//   const router = useRouter();

//   const handleEnterRoom = (roomId: string) => {
//     try { localStorage.setItem("roar_auto_join_room_id", roomId); } catch { /* ignore */ }
//     router.push(`${roomId}`);
//   };

//   const card: RoarRoomCard = {
//     id: STATIC_ROOM.roomId,
//     emoji: getSportEmoji(STATIC_ROOM.sport),
//     title: STATIC_ROOM.name,
//     fansCount: formatCount(STATIC_ROOM.fanCount),
//     messagesCount: "—",
//     avatarUrls: [],
//     ctaLabel: "Join Room",
//     onJoin: () => handleEnterRoom(STATIC_ROOM.roomId),
//   };

//   return (
//     <div className="w-full mt-5">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-[17px] font-extrabold text-white">Roar Rooms</h3>
//         <button
//           type="button"
//           className="flex items-center gap-0.5 text-[12px] font-bold"
//           style={{ color: "#E91E8C" }}
//           onClick={() => router.push("/MainModules/ROAR")}
//         >
//           View all
//           <ChevronRight size={14} />
//         </button>
//       </div>

//       <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
//         <div className="snap-start">
//           <RoarRoomCardView card={card} />
//         </div>
//       </div>
//     </div>
//   );
// }




// components\NewHomeComponents\RoarRooms.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { Room } from "../NewROARComponent/types";

interface PresenceInfo {
  fanCount: number;
  totalJoinCount?: number;
}

export type RoarRoomCard = {
  id: string;
  emoji: string;
  title: string; // "India vs Korea (Hockey)"
  fansCount: string; // "18.4K"
  messagesCount: string; // "32K"
  avatarUrls: string[]; // first 3 shown
  moreLabel?: string; // "+more"
  ctaLabel: string;
  onJoin: () => void;
};

function RoarRoomCardView({ card }: { card: RoarRoomCard }) {
  return (
    <div className="shrink-0 w-[220px] rounded-2xl bg-[#12101c] border border-white/[0.06] p-4 flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-xl leading-none shrink-0">{card.emoji}</span>
        <h4 className="text-[15px] font-extrabold text-white leading-tight">{card.title}</h4>
      </div>

      <p className="text-[11px] text-white/45 font-medium mb-3">
        {card.fansCount} Fans · {card.messagesCount} Messages
      </p>

      <div className="flex items-center gap-1.5 mb-4">
        <div className="flex -space-x-2">
          {card.avatarUrls.slice(0, 3).map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-6 h-6 rounded-full border-2 border-[#12101c] object-cover"
            />
          ))}
        </div>
        {card.moreLabel && (
          <span className="text-[11px] font-semibold text-white/40">{card.moreLabel}</span>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={card.onJoin}
        className="w-full py-3 rounded-full font-extrabold text-white text-[13px]"
        style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
      >
        {card.ctaLabel}
      </motion.button>
    </div>
  );
}

/* ---------------------------------- Skeleton card ---------------------------------- */

function RoarRoomCardSkeleton() {
  return (
    <div className="shrink-0 w-[220px] rounded-2xl bg-[#12101c] border border-white/[0.06] p-4 flex flex-col gap-3">
      <div className="h-5 w-3/4 rounded bg-white/[0.07] animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-white/[0.05] animate-pulse" />
      <div className="h-3 w-2/3 rounded bg-white/[0.04] animate-pulse" />
      <div className="mt-auto h-10 w-full rounded-full bg-white/[0.07] animate-pulse" />
    </div>
  );
}

/* ---------------------------------- Helpers ---------------------------------- */

const SPORT_EMOJI: Record<string, string> = {
  cricket: "🏏",
  football: "⚽",
  hockey: "🏑",
  badminton: "🏸",
  athletics: "🏃",
  shooting: "🎯",
  wrestling: "🤼",
  boxing: "🥊",
  swimming: "🏊",
  default: "🔥",
};

function getSportEmoji(sport?: string) {
  if (!sport) return SPORT_EMOJI.default;
  return SPORT_EMOJI[sport.toLowerCase()] ?? SPORT_EMOJI.default;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

/* ---------------------------------- Exported component ---------------------------------- */

export default function RoarRooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [presenceByRoom, setPresenceByRoom] = useState<Record<string, PresenceInfo>>({});
  const [status, setStatus] = useState<"loading" | "error" | "empty" | "ready">("loading");

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const roomsRes = await axios
          .get(`/api/roar/rooms?t=${Date.now()}`)
          .catch((err) => {
            console.warn("[RoarRooms] GET /api/roar/rooms failed:", err?.response?.status, err?.message);
            return null;
          });

        if (cancelled) return;

        const fetchedRooms: Room[] = roomsRes?.data?.success ? roomsRes.data.rooms ?? [] : [];
        setRooms(fetchedRooms);

        if (fetchedRooms.length === 0) {
          setPresenceByRoom({});
          setStatus("empty");
          return;
        }

        const roomIds = fetchedRooms.map((r) => r.roomId);
        const presenceRes = await axios
          .post("/api/roar/rooms/presence-preview", { roomIds })
          .catch((err) => {
            console.warn("[RoarRooms] presence-preview failed:", err?.response?.status, err?.message);
            return null;
          });

        if (cancelled) return;

        if (presenceRes?.data?.success) {
          setPresenceByRoom(presenceRes.data.rooms ?? {});
        }

        setStatus("ready");
      } catch (e) {
        console.error("[RoarRooms] Failed to load rooms:", e);
        if (!cancelled) setStatus("error");
      }
    };

    fetchAll();
    const iv = setInterval(() => { if (!document.hidden) fetchAll(); }, 30_000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // Navigate straight to this room's ROAR view via the ?room= query param,
  // so the room the person tapped is the one that opens (instead of landing
  // on ROAR's default/first room and relying on the localStorage auto-join
  // flag, which the destination page may or may not read on mount).
  const handleEnterRoom = (room: Room) => {
    try { localStorage.setItem("roar_auto_join_room_id", room.roomId); } catch { /* ignore */ }
    router.push(`/MainModules/ROAR?room=${room.roomId}`);
  };

  const liveCards: RoarRoomCard[] = rooms.map((room) => {
    const presence = presenceByRoom[room.roomId];
    const fanCount = presence?.fanCount ?? room.fanCount ?? 0;
    const isLive = room.isActive || fanCount > 0;
    return {
      id: room.roomId,
      emoji: getSportEmoji(room.sport),
      title: room.name,
      fansCount: fanCount > 0 ? formatCount(fanCount) : "—",
      messagesCount: "—",
      avatarUrls: [],
      ctaLabel: isLive ? "Enter" : "Join",
      onJoin: () => handleEnterRoom(room),
    };
  });

  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">Roar Rooms</h3>
        <button
          type="button"
          className="flex items-center gap-0.5 text-[12px] font-bold"
          style={{ color: "#E91E8C" }}
          onClick={() => router.push("/MainModules/ROAR")}
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {status === "loading" && (
          <>
            <div className="snap-start"><RoarRoomCardSkeleton /></div>
            <div className="snap-start"><RoarRoomCardSkeleton /></div>
            <div className="snap-start"><RoarRoomCardSkeleton /></div>
          </>
        )}

        {(status === "empty" || status === "error") && (
          <div className="w-full rounded-2xl border border-white/[0.08] bg-[#12101c] py-6 px-4 text-center">
            <p className="text-[12px] font-bold text-white/50 m-0">
              {status === "error" ? "Couldn't load rooms" : "No rooms live right now"}
            </p>
            <p className="text-[10px] text-white/30 mt-1 m-0">
              {status === "error" ? "Check your connection and try again." : "Check back soon for live action!"}
            </p>
          </div>
        )}

        {status === "ready" && liveCards.map((c) => (
          <div key={c.id} className="snap-start">
            <RoarRoomCardView card={c} />
          </div>
        ))}
      </div>
    </div>
  );
}