

// import { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import axios from "axios";
// import type { Room } from "../types";

// const SPORT_GRADIENT: Record<string, string> = {
//   cricket:  "linear-gradient(135deg,#7c3aed,#4f46e5)",
//   football: "linear-gradient(135deg,#dc2626,#b45309)",
//   default:  "linear-gradient(135deg,#e91e8c,#ff6b35)",
// };

// const SPORT_IMAGE: Record<string, string> = {
//   cricket:  "/images/cricket3.png",
//   football: "/images/fifa2.png",
//   default:  "/images/fifa2.png",
// };

// const INFINITY_ROOM_ID = "vZFu6xEApNRd1aUbDuHW";

// // Temporary: only this room is shown, everything else is hidden.
// // Revert by restoring the old mock-room exclusion filter in `allRooms` below.
// // const ONLY_VISIBLE_ROOM_ID = "2yQvtie7nIcWXDA2iUDj && biDY0WLIZB7wBCaE2Ppx";
// const VISIBLE_ROOM_IDS = ["2yQvtie7nIcWXDA2iUDj", "biDY0WLIZB7wBCaE2Ppx"];


// interface ActiveFan {
//   uid: string;
//   username: string;
//   avatarUrl?: string | null;
//   badge?: string | null;
// }

// function StackedAvatars({
//   fans,
//   count,
//   loaded,
//   totalJoinCount,
// }: {
//   fans: ActiveFan[];
//   count: number;
//   loaded: boolean;
//   totalJoinCount?: number;
// }) {
//   const DOT_COLORS = ["#e91e8c", "#ff6b35", "#00e8c6"];
//   const hasFans = fans.length > 0;

//   const formatCount = (n: number) =>
//     n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

//   return (
//     <div className="flex flex-col gap-0.5">
//       {/* Row 1: Avatars + Active count */}
//       <div className="flex items-center gap-1.5">
//         <div className="flex">
//           {hasFans
//             ? fans.slice(0, 3).map((fan, i) => (
//                 <div
//                   key={fan.uid}
//                   className="w-6 h-6 rounded-full border-2 border-[#0e0e14] relative overflow-hidden flex items-center justify-center"
//                   style={{
//                     marginLeft: i === 0 ? 0 : -8,
//                     zIndex: 3 - i,
//                     background: fan.avatarUrl
//                       ? undefined
//                       : "linear-gradient(135deg,#e91e8c,#ff6b35)",
//                   }}
//                 >
//                   {fan.avatarUrl ? (
//                     <img
//                       src={fan.avatarUrl}
//                       alt={fan.username}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <span className="text-[9px] font-extrabold text-white">
//                       {fan.username?.[0]?.toUpperCase() || "?"}
//                     </span>
//                   )}
//                 </div>
//               ))
//             : DOT_COLORS.map((c, i) => (
//                 <div
//                   key={i}
//                   className="w-6 h-6 rounded-full border-2 border-[#0e0e14] relative"
//                   style={{
//                     background: c,
//                     marginLeft: i === 0 ? 0 : -8,
//                     zIndex: DOT_COLORS.length - i,
//                     opacity: loaded ? 1 : 0.35,
//                   }}
//                 />
//               ))}
//         </div>
//         {loaded ? (
//           <span className="text-xs font-semibold text-white/45">
//             <span className="text-xs font-bold text-white/90">+{count} </span>Active
//           </span>
//         ) : (
//           <span className="text-xs font-semibold text-white/25">···</span>
//         )}
//       </div>

//       {/* Row 2: Total members joined (only when loaded and > 0) */}
//       {loaded && totalJoinCount !== undefined && totalJoinCount > 0 && (
//         <div className="flex items-center gap-1.5">
//           <span className="text-xs font-semibold text-white/40">
//             Total members joined -
//           </span>
//           <span className="text-xs font-bold text-white/90">
//             {formatCount(totalJoinCount)}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

// function Thumbnail({ room, isInfinityRoom }: { room: Room; isInfinityRoom?: boolean }) {
//   const sport    = (room.sport ?? "default").toLowerCase();
//   const gradient = SPORT_GRADIENT[sport] ?? SPORT_GRADIENT.default;
//   const imgSrc   = isInfinityRoom
//     ? "/images/infinityroom.png"
//     : SPORT_IMAGE[sport] ?? SPORT_IMAGE.default;

//   return (
//     <div
//       className="w-[90px] h-[90px] min-w-[90px] rounded-2xl flex items-center justify-center text-3xl overflow-hidden relative shrink-0"
//       style={{ background: gradient }}
//     >
//       <img
//         src={imgSrc}
//         alt={room.name}
//         className="absolute inset-0 w-full h-full object-fit rounded-2xl"
//         onError={(e) => {
//           (e.currentTarget as HTMLImageElement).style.display = "none";
//         }}
//       />
//       <div className="absolute inset-0 bg-black/15 rounded-2xl" />
//     </div>
//   );
// }

// function SportBadge({ sport }: { sport: string }) {
//   const label = sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
//   const colors: Record<string, string> = {
//     cricket:  "rgba(124,58,237,0.25)",
//     football: "rgba(220,38,38,0.25)",
//     default:  "rgba(233,30,140,0.20)",
//   };
//   const bg = colors[sport.toLowerCase()] ?? colors.default;

//   return (
//     <span
//       className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
//       style={{ background: bg, color: "rgba(255,255,255,0.65)" }}
//     >
//       {label}
//     </span>
//   );
// }

// function RoomCard({
//   room,
//   index,
//   onJoin,
//   onToast,
//   presence,
// }: {
//   room: Room;
//   index: number;
//   onJoin: (r: Room) => void;
//   onToast: (m: string) => void;
//   presence?: { fanCount: number; fans: ActiveFan[]; totalJoinCount?: number };
// }) {
//   const isFuture =
//     room.scheduledStartTime !== undefined &&
//     room.scheduledStartTime > Date.now();

//   const sport = (room.sport ?? "default").toLowerCase();
//   const presenceLoaded = presence !== undefined;
//   const liveFanCount = presence?.fanCount ?? 0;
//   const liveFans = presence?.fans ?? [];
//   const totalJoinCount = presence?.totalJoinCount;

//   const isInfinityRoom = room.roomId === INFINITY_ROOM_ID;

//   const handleCardClick = () => {
//     if (isFuture) {
//       onToast("This room hasn't started yet.");
//       return;
//     }
//     onJoin(room);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 14 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.07 }}
//       className="flex gap-4 items-center py-3.5 border-b border-white/[0.06] cursor-pointer hover:bg-white/[0.02] transition-colors duration-150"
//       onClick={handleCardClick}
//     >
//       <Thumbnail room={room} isInfinityRoom={isInfinityRoom} />

//       <div className="flex-1 min-w-0">
//         {sport !== "default" && !isInfinityRoom && <SportBadge sport={sport} />}
//         <div className="flex items-center gap-2 mb-1 min-w-0">
//           <p className="text-[15px] font-extrabold text-white whitespace-normal">
//             {room.name}
//           </p>
//         </div>

//         <p className="text-xs text-white/45 mb-2 leading-snug line-clamp-2">
//           {room.description ?? "Roar conversations"}
//         </p>

//         {/* Hide avatars + active count for infinity room */}
//         {/* {!isInfinityRoom && ( */}
//           <div className="mb-2.5">
//             <StackedAvatars
//               fans={liveFans}
//               count={liveFanCount}
//               loaded={presenceLoaded}
//               totalJoinCount={totalJoinCount}
//             />
//           </div>
//         {/* )} */}

//         <motion.button
//           whileTap={{ scale: 0.96 }}
//           onClick={(e) => {
//             e.stopPropagation();
//             if (isFuture) { onToast("This room hasn't started yet."); return; }
//             onJoin(room);
//           }}
//           className={[
//             "w-full py-2.5 rounded-full text-[13px] font-bold transition-colors duration-150",
//             isFuture
//               ? "border border-white/20 text-white/30 cursor-not-allowed bg-transparent"
//               : "border border-white/20 text-white cursor-pointer bg-transparent hover:border-white/40",
//           ].join(" ")}
//         >
//           {isFuture ? "Coming Soon" : "Join Room"}
//         </motion.button>
//       </div>
//     </motion.div>
//   );
// }

// interface Props {
//   rooms: Room[];
//   onJoinRoom: (room: Room) => void;
//   onToast: (m: string) => void;
// }

// export default function RoomsHome({ rooms, onJoinRoom, onToast }: Props) {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   type PresenceByRoom = {
//     [roomId: string]: { fanCount: number; fans: ActiveFan[]; totalJoinCount?: number };
//   };
//   const [presenceByRoom, setPresenceByRoom] = useState<PresenceByRoom>({});

//   // Temporary: only ONLY_VISIBLE_ROOM_ID is shown, everything else is hidden.
//   const allRooms = rooms.filter(
//   (r) => VISIBLE_ROOM_IDS.includes(r.roomId)
// );

//   useEffect(() => {
//     const roomIds = allRooms.map((r) => r.roomId);
//     if (roomIds.length === 0) return;

//     let cancelled = false;
//     const fetchPreview = async () => {
//       try {
//         const res = await axios.post("/api/roar/rooms/presence-preview", { roomIds });
//         if (!cancelled && res.data?.success) setPresenceByRoom(res.data.rooms);
//       } catch (e) {
//         console.error("Presence preview failed:", e);
//       }
//     };

//     fetchPreview();
//     const iv = setInterval(() => {
//       if (!document.hidden) fetchPreview();
//     }, 30_000);
//     return () => { cancelled = true; clearInterval(iv); };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [rooms.length]);

//   return (
//     <div
//       style={{
//         position: "absolute", top: 0, left: 0, right: 0,
//         bottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
//         display: "flex", flexDirection: "column", overflow: "hidden",
//       }}
//       className="lg:!bottom-0"
//     >
//       {/* Header */}
//       <div
//         style={{
//           flexShrink: 0,
//           padding: "16px 16px 10px",
//           borderBottom: "1px solid rgba(255,255,255,0.06)",
//           background: "var(--bg-primary, #0e0e14)",
//         }}
//       >
//         <p className="text-[15px] font-bold text-white">Roar Rooms</p>
//       </div>

//       <div
//         ref={scrollRef}
//         onTouchStart={(e) => e.stopPropagation()}
//         style={{
//           flex: 1, minHeight: 0,
//           overflowY: "scroll", overflowX: "hidden",
//           WebkitOverflowScrolling: "touch" as any,
//           touchAction: "pan-y",
//           overscrollBehavior: "contain",
//           paddingLeft: 16, paddingRight: 16, paddingBottom: 32,
//         }}
//       >
//         {allRooms.map((room, i) => (
//           <RoomCard
//             key={room.roomId}
//             room={room}
//             index={i}
//             onJoin={onJoinRoom}
//             onToast={onToast}
//             presence={presenceByRoom[room.roomId]}
//           />
//         ))}
//         <div style={{ height: 86 }} />
//       </div>
//     </div>
//   );
// }



// import { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import { Share2, Download } from "lucide-react";
// import type { Room } from "../types";

// const SPORT_GRADIENT: Record<string, string> = {
//   cricket:  "linear-gradient(135deg,#7c3aed,#4f46e5)",
//   football: "linear-gradient(135deg,#dc2626,#b45309)",
//   default:  "linear-gradient(135deg,#e91e8c,#ff6b35)",
// };

// const SPORT_IMAGE: Record<string, string> = {
//   cricket:  "/images/cricket3.png",
//   football: "/images/fifa2.png",
//   default:  "/images/fifa2.png",
// };

// const INFINITY_ROOM_ID = "vZFu6xEApNRd1aUbDuHW";

// const VISIBLE_ROOM_IDS = ["2yQvtie7nIcWXDA2iUDj", "biDY0WLIZB7wBCaE2Ppx"];

// const SHARE_CARD_BG = "/images/roomprofilecard.png";

// interface ActiveFan {
//   uid: string;
//   username: string;
//   avatarUrl?: string | null;
//   badge?: string | null;
// }

// interface RoomCounts {
//   post: number;
//   debate: number;
//   prediction: number;
//   trivia: number;
//   battle: number;
// }

// const EMPTY_COUNTS: RoomCounts = { post: 0, debate: 0, prediction: 0, trivia: 0, battle: 0 };

// const SHARE_ACTIONS = [
//   { alt: "WhatsApp", src: "/images/share_whatsapp.png" },
//   { alt: "Threads", src: "/images/share_thread.png" },
//   { alt: "Instagram", src: "/images/share_insta.png" },
//   { alt: "LinkedIn", src: "/images/Share_linkedin.png" },
//   { alt: "X", src: "/images/Share_X.png" },
//   { alt: "Copy", src: "/images/share_copy_link.png" },
// ];

// function buildRoomShareUrl(room: Room) {
//   if (typeof window === "undefined") {
//     return `https://sportsfan-frontend.vercel.app/MainModules/ROAR?room=${room.roomId}`;
//   }
//   const url = new URL(`${window.location.origin}/MainModules/ROAR`);
//   url.searchParams.set("room", room.roomId);
//   return url.toString();
// }

// function buildRoomShareText(room: Room, counts: RoomCounts, shareUrl: string) {
//   return [
//     `🔥 ${room.name} is heating up on Sportsfan360!`,
//     "",
//     `✏️ Posts: ${counts.post}`,
//     `⚡ Debates: ${counts.debate}`,
//     `🔮 Predictions: ${counts.prediction}`,
//     `🧠 Trivia: ${counts.trivia}`,
//     `⚔️ Battles: ${counts.battle}`,
//   ].join("\n");
// }

// function shareFileName(room: Room) {
//   return `${room.name.replace(/\s+/g, "-").toLowerCase()}-stats.png`;
// }

// function generateRoomShareCard(
//   bgImg: HTMLImageElement,
//   room: Room,
//   counts: RoomCounts,
//   shareUrl: string
// ): Promise<Blob | null> {
//   return new Promise((resolve) => {
//     const canvas = document.createElement("canvas");
//     canvas.width = 1340;
//     canvas.height = 752;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return resolve(null);

//     try {
//       ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
//     } catch (e) {
//       console.error("[RoomsHome] Canvas draw failed:", e);
//       return resolve(null);
//     }

//     ctx.font = "bold 46px Arial";
//     ctx.fillStyle = "#ffffff";
//     ctx.textAlign = "center";
//     ctx.fillText(room.name, canvas.width / 2, 130);

//     const stats = [
//       { label: "POSTS", value: counts.post, x: 140, color: "#E91E8C" },
//       { label: "DEBATES", value: counts.debate, x: 400, color: "#60A5FA" },
//       { label: "PREDICTIONS", value: counts.prediction, x: 670, color: "#FBBF24" },
//       { label: "TRIVIA", value: counts.trivia, x: 970, color: "#22C55E" },
//       { label: "BATTLES", value: counts.battle, x: 1230, color: "#F97316" },
//     ];

//     stats.forEach(({ label, value, x, color }) => {
//       const y = 530;
//       ctx.font = "bold 72px Arial";
//       ctx.fillStyle = color;
//       ctx.textAlign = "center";
//       ctx.fillText(String(value), x, y);

//       ctx.font = "bold 20px Arial";
//       ctx.fillStyle = "#ffffff";
//       ctx.fillText(label, x, y + 40);
//     });

//     const centerX = canvas.width / 2;
//     ctx.textAlign = "center";

//     const wrapText = (text: string, maxWidth: number) => {
//       const words = text.split(" ");
//       const lines: string[] = [];
//       let current = "";
//       words.forEach((word) => {
//         const test = current ? `${current} ${word}` : word;
//         if (ctx.measureText(test).width > maxWidth && current) {
//           lines.push(current);
//           current = word;
//         } else {
//           current = test;
//         }
//       });
//       if (current) lines.push(current);
//       return lines;
//     };

//     ctx.font = "600 26px Arial";
//     ctx.fillStyle = "#ffffff";
//     const joinLine = `Join the room 👉 ${shareUrl}`;
//     const joinLines = wrapText(joinLine, canvas.width - 160);
//     let joinY = 650;
//     joinLines.forEach((line) => {
//       ctx.fillText(line, centerX, joinY);
//       joinY += 32;
//     });

//     ctx.font = "bold 24px Arial";
//     ctx.fillStyle = "#FF6B35";
//     ctx.fillText("#StartRoaring #Sportsfan360", centerX, joinY + 8);

//     canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
//   });
// }

// function StackedAvatars({
//   fans,
//   count,
//   loaded,
//   totalJoinCount,
// }: {
//   fans: ActiveFan[];
//   count: number;
//   loaded: boolean;
//   totalJoinCount?: number;
// }) {
//   const DOT_COLORS = ["#e91e8c", "#ff6b35", "#00e8c6"];
//   const hasFans = fans.length > 0;

//   const formatCount = (n: number) =>
//     n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

//   return (
//     <div className="flex flex-col gap-0.5">
//       <div className="flex items-center gap-1.5">
//         <div className="flex">
//           {hasFans
//             ? fans.slice(0, 3).map((fan, i) => (
//                 <div
//                   key={fan.uid}
//                   className="w-6 h-6 rounded-full border-2 border-[#0e0e14] relative overflow-hidden flex items-center justify-center"
//                   style={{
//                     marginLeft: i === 0 ? 0 : -8,
//                     zIndex: 3 - i,
//                     background: fan.avatarUrl
//                       ? undefined
//                       : "linear-gradient(135deg,#e91e8c,#ff6b35)",
//                   }}
//                 >
//                   {fan.avatarUrl ? (
//                     <img
//                       src={fan.avatarUrl}
//                       alt={fan.username}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <span className="text-[9px] font-extrabold text-white">
//                       {fan.username?.[0]?.toUpperCase() || "?"}
//                     </span>
//                   )}
//                 </div>
//               ))
//             : DOT_COLORS.map((c, i) => (
//                 <div
//                   key={i}
//                   className="w-6 h-6 rounded-full border-2 border-[#0e0e14] relative"
//                   style={{
//                     background: c,
//                     marginLeft: i === 0 ? 0 : -8,
//                     zIndex: DOT_COLORS.length - i,
//                     opacity: loaded ? 1 : 0.35,
//                   }}
//                 />
//               ))}
//         </div>
//         {loaded ? (
//           <span className="text-xs font-semibold text-white/45">
//             <span className="text-xs font-bold text-white/90">+{count} </span>Active
//           </span>
//         ) : (
//           <span className="text-xs font-semibold text-white/25">···</span>
//         )}
//       </div>

//       {loaded && totalJoinCount !== undefined && totalJoinCount > 0 && (
//         <div className="flex items-center gap-1.5">
//           <span className="text-xs font-semibold text-white/40">
//             Total members joined -
//           </span>
//           <span className="text-xs font-bold text-white/90">
//             {formatCount(totalJoinCount)}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

// function Thumbnail({ room, isInfinityRoom }: { room: Room; isInfinityRoom?: boolean }) {
//   const sport    = (room.sport ?? "default").toLowerCase();
//   const gradient = SPORT_GRADIENT[sport] ?? SPORT_GRADIENT.default;
//   const imgSrc   = isInfinityRoom
//     ? "/images/infinityroom.png"
//     : SPORT_IMAGE[sport] ?? SPORT_IMAGE.default;

//   return (
//     <div
//       className="w-[90px] h-[90px] min-w-[90px] rounded-2xl flex items-center justify-center text-3xl overflow-hidden relative shrink-0"
//       style={{ background: gradient }}
//     >
//       <img
//         src={imgSrc}
//         alt={room.name}
//         className="absolute inset-0 w-full h-full object-fit rounded-2xl"
//         onError={(e) => {
//           (e.currentTarget as HTMLImageElement).style.display = "none";
//         }}
//       />
//       <div className="absolute inset-0 bg-black/15 rounded-2xl" />
//     </div>
//   );
// }

// function SportBadge({ sport }: { sport: string }) {
//   const label = sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
//   const colors: Record<string, string> = {
//     cricket:  "rgba(124,58,237,0.25)",
//     football: "rgba(220,38,38,0.25)",
//     default:  "rgba(233,30,140,0.20)",
//   };
//   const bg = colors[sport.toLowerCase()] ?? colors.default;

//   return (
//     <span
//       className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
//       style={{ background: bg, color: "rgba(255,255,255,0.65)" }}
//     >
//       {label}
//     </span>
//   );
// }

// function RoomCard({
//   room,
//   index,
//   onJoin,
//   onToast,
//   presence,
//   onShare,
//   sharingRoomId,
// }: {
//   room: Room;
//   index: number;
//   onJoin: (r: Room) => void;
//   onToast: (m: string) => void;
//   presence?: { fanCount: number; fans: ActiveFan[]; totalJoinCount?: number };
//   onShare: (room: Room) => void;
//   sharingRoomId?: string | null;
// }) {
//   const isFuture =
//     room.scheduledStartTime !== undefined &&
//     room.scheduledStartTime > Date.now();

//   const sport = (room.sport ?? "default").toLowerCase();
//   const presenceLoaded = presence !== undefined;
//   const liveFanCount = presence?.fanCount ?? 0;
//   const liveFans = presence?.fans ?? [];
//   const totalJoinCount = presence?.totalJoinCount;

//   const isInfinityRoom = room.roomId === INFINITY_ROOM_ID;

//   const handleCardClick = () => {
//     if (isFuture) {
//       onToast("This room hasn't started yet.");
//       return;
//     }
//     onJoin(room);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 14 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.07 }}
//       className="flex gap-4 items-center py-3.5 border-b border-white/[0.06] cursor-pointer hover:bg-white/[0.02] transition-colors duration-150"
//       onClick={handleCardClick}
//     >
//       <Thumbnail room={room} isInfinityRoom={isInfinityRoom} />

//       <div className="flex-1 min-w-0">
//         {sport !== "default" && !isInfinityRoom && <SportBadge sport={sport} />}
//         <div className="flex items-center gap-2 mb-1 min-w-0">
//           <p className="text-[15px] font-extrabold text-white whitespace-normal">
//             {room.name}
//           </p>
//         </div>

//         <p className="text-xs text-white/45 mb-2 leading-snug line-clamp-2">
//           {room.description ?? "Roar conversations"}
//         </p>

//         <div className="mb-2.5">
//           <StackedAvatars
//             fans={liveFans}
//             count={liveFanCount}
//             loaded={presenceLoaded}
//             totalJoinCount={totalJoinCount}
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <motion.button
//             whileTap={{ scale: 0.96 }}
//             onClick={(e) => {
//               e.stopPropagation();
//               if (isFuture) { onToast("This room hasn't started yet."); return; }
//               onJoin(room);
//             }}
//             className={[
//               "flex-1 py-2.5 rounded-full text-[13px] font-bold transition-colors duration-150",
//               isFuture
//                 ? "border border-white/20 text-white/30 cursor-not-allowed bg-transparent"
//                 : "border border-white/20 text-white cursor-pointer bg-transparent hover:border-white/40",
//             ].join(" ")}
//           >
//             {isFuture ? "Coming Soon" : "Join Room"}
//           </motion.button>

//           <motion.button
//             whileTap={{ scale: 0.9 }}
//             onClick={(e) => {
//               e.stopPropagation();
//               if (sharingRoomId === room.roomId) return;
//               onShare(room);
//             }}
//             disabled={sharingRoomId === room.roomId}
//             className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 shrink-0 bg-transparent hover:border-white/40 hover:text-white transition-colors duration-150 disabled:opacity-50"
//             title="Share room stats"
//           >
//             {sharingRoomId === room.roomId ? (
//               <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
//             ) : (
//               <Share2 size={14} />
//             )}
//           </motion.button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// interface Props {
//   rooms: Room[];
//   onJoinRoom: (room: Room) => void;
//   onToast: (m: string) => void;
// }

// export default function RoomsHome({ rooms, onJoinRoom, onToast }: Props) {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   type PresenceByRoom = {
//     [roomId: string]: { fanCount: number; fans: ActiveFan[]; totalJoinCount?: number };
//   };
//   const [presenceByRoom, setPresenceByRoom] = useState<PresenceByRoom>({});

//   const [shareRoom, setShareRoom] = useState<Room | null>(null);
//   const [shareCounts, setShareCounts] = useState<RoomCounts | null>(null);
//   const [shareLoading, setShareLoading] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [sharingRoomId, setSharingRoomId] = useState<string | null>(null);
//   const shareRequestTokenRef = useRef<symbol | null>(null);

//   const [cardBlob, setCardBlob] = useState<Blob | null>(null);
//   const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
//   const [cardGenerating, setCardGenerating] = useState(false);
//   const [cardFailed, setCardFailed] = useState(false);
//   const bgImageRef = useRef<HTMLImageElement | null>(null);
//   const bgLoadPromiseRef = useRef<Promise<HTMLImageElement> | null>(null);
//   const [nativeShareBusy, setNativeShareBusy] = useState(false);

//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth < 768);
//     check();
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);

//   const loadBgImage = (): Promise<HTMLImageElement> => {
//     if (bgImageRef.current) return Promise.resolve(bgImageRef.current);
//     if (bgLoadPromiseRef.current) return bgLoadPromiseRef.current;

//     bgLoadPromiseRef.current = new Promise((resolve, reject) => {
//       const img = new window.Image();
//       img.crossOrigin = "anonymous";
//       img.onload = () => {
//         bgImageRef.current = img;
//         resolve(img);
//       };
//       img.onerror = () => {
//         console.error(`[RoomsHome] Failed to load ${SHARE_CARD_BG}`);
//         reject(new Error("bg-load-failed"));
//       };
//       img.src = SHARE_CARD_BG;
//     });
//     return bgLoadPromiseRef.current;
//   };

//   const allRooms = rooms.filter((r) => VISIBLE_ROOM_IDS.includes(r.roomId));

//   useEffect(() => {
//     const roomIds = allRooms.map((r) => r.roomId);
//     if (roomIds.length === 0) return;

//     let cancelled = false;
//     const fetchPreview = async () => {
//       try {
//         const res = await axios.post("/api/roar/rooms/presence-preview", { roomIds });
//         if (!cancelled && res.data?.success) setPresenceByRoom(res.data.rooms);
//       } catch (e) {
//         console.error("Presence preview failed:", e);
//       }
//     };

//     fetchPreview();
//     const iv = setInterval(() => {
//       if (!document.hidden) fetchPreview();
//     }, 30_000);
//     return () => { cancelled = true; clearInterval(iv); };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [rooms.length]);

//   useEffect(() => {
//     document.body.style.overflow = shareRoom ? "hidden" : "unset";
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [shareRoom]);

//   useEffect(() => {
//     return () => {
//       if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
//     };
//   }, [cardPreviewUrl]);

//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       return true;
//     } catch {
//       try {
//         const el = document.createElement("textarea");
//         el.value = text;
//         el.style.position = "fixed";
//         el.style.opacity = "0";
//         document.body.appendChild(el);
//         el.focus();
//         el.select();
//         const ok = document.execCommand("copy");
//         document.body.removeChild(el);
//         return ok;
//       } catch {
//         return false;
//       }
//     }
//   };

//   const fetchRoomCounts = async (room: Room): Promise<RoomCounts> => {
//     try {
//       const res = await axios.get(`/api/roar/rooms/${room.roomId}/messages`, {
//         params: { limit: 1 },
//       });
//       return res.data?.counts ?? EMPTY_COUNTS;
//     } catch (e) {
//       console.error("Failed to fetch room stats for share:", e);
//       return EMPTY_COUNTS;
//     }
//   };

//   const downloadBlob = (blob: Blob, filename: string) => {
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = filename;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleShare = async (room: Room) => {
//     const requestId = Symbol();
//     shareRequestTokenRef.current = requestId;

//     setShareRoom(room);
//     setShareCounts(null);
//     setCopied(false);
//     setCardBlob(null);
//     setCardFailed(false);
//     if (cardPreviewUrl) { URL.revokeObjectURL(cardPreviewUrl); setCardPreviewUrl(null); }

//     setShareLoading(true);
//     setSharingRoomId(room.roomId);
//     setCardGenerating(true);

//     try {
//       const [counts, bgImg] = await Promise.all([
//         fetchRoomCounts(room),
//         loadBgImage().catch(() => null),
//       ]);

//       if (shareRequestTokenRef.current !== requestId) return;
//       setShareCounts(counts);
//       setShareLoading(false);

//       if (!bgImg) {
//         setCardFailed(true);
//         setCardGenerating(false);
//         return;
//       }

//       const roomShareUrl = buildRoomShareUrl(room);
//       const blob = await generateRoomShareCard(bgImg, room, counts, roomShareUrl);
//       if (shareRequestTokenRef.current !== requestId) return;

//       if (blob) {
//         setCardBlob(blob);
//         setCardPreviewUrl(URL.createObjectURL(blob));
//       } else {
//         setCardFailed(true);
//       }
//     } finally {
//       if (shareRequestTokenRef.current === requestId) {
//         setCardGenerating(false);
//         setSharingRoomId(null);
//       }
//     }
//   };

//   const closeShare = () => {
//     shareRequestTokenRef.current = null;
//     setShareRoom(null);
//     setShareCounts(null);
//     setShareLoading(false);
//     setCopied(false);
//     setCardGenerating(false);
//     setCardFailed(false);
//     setCardBlob(null);
//     if (cardPreviewUrl) { URL.revokeObjectURL(cardPreviewUrl); setCardPreviewUrl(null); }
//   };

//   const shareUrl = shareRoom ? buildRoomShareUrl(shareRoom) : "";
//   const shareText = shareRoom && shareCounts ? buildRoomShareText(shareRoom, shareCounts, shareUrl) : "";

//   /**
//    * Primary share action: hands the actual stats IMAGE to the OS share sheet.
//    */
//   const handleNativeImageShare = async () => {
//     if (!shareRoom || !cardBlob) return;

//     // Simple guard — same pattern as RoarJourneySection's working mobile share.
//     // If a share is already in progress, ignore this click entirely so we never
//     // call navigator.share() twice concurrently (that throws InvalidStateError).
//     if (nativeShareBusy) return;

//     setNativeShareBusy(true);
//     try {
//       const file = new File([cardBlob], shareFileName(shareRoom), { type: "image/png" });

//       if (
//         typeof navigator !== "undefined" &&
//         navigator.canShare?.({ files: [file] })
//       ) {
//         try {
//           await navigator.share({
//             files: [file],
//             title: shareRoom.name,
//             text: `Check out ${shareRoom.name} on Sportsfan360 👉 ${shareUrl}`,
//           });
//           return;
//         } catch (shareErr: any) {
//           if (shareErr?.name === "AbortError") return; // user cancelled — not an error
//           console.error("[RoomsHome] navigator.share threw:", shareErr);
//         }
//       }

//       // Fallback: download so the user can attach it manually.
//       downloadBlob(cardBlob, shareFileName(shareRoom));
//       onToast("Image saved! Attach it in your chat to share.");
//     } finally {
//       setNativeShareBusy(false);
//     }
//   };

//   const openPlatformWithTextAndImage = (openUrl: () => void, toastMsg: string) => {
//     if (cardBlob && shareRoom) {
//       downloadBlob(cardBlob, shareFileName(shareRoom));
//       onToast(toastMsg);
//     }
//     openUrl();
//   };

//   const handleShareToWhatsApp = () => {
//     if (!shareText) return;
//     openPlatformWithTextAndImage(
//       () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank"),
//       "Image saved — attach it in the WhatsApp chat!"
//     );
//   };
//   const handleShareToThreads = () => {
//     if (!shareText) return;
//     openPlatformWithTextAndImage(
//       () => window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, "_blank"),
//       "Image saved — attach it in your Threads post!"
//     );
//   };
//   const handleShareToInstagram = async () => {
//     if (!shareText) return;
//     await copyToClipboard(shareText);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1600);
//     if (cardBlob && shareRoom) downloadBlob(cardBlob, shareFileName(shareRoom));
//     onToast("Caption copied & image saved — attach it on Instagram!");
//     window.open("https://www.instagram.com/", "_blank");
//   };
//   const handleShareToLinkedIn = () => {
//     if (!shareUrl) return;
//     openPlatformWithTextAndImage(
//       () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank"),
//       "Image saved — attach it in your LinkedIn post!"
//     );
//   };
//   const handleShareToX = () => {
//     if (!shareText) return;
//     openPlatformWithTextAndImage(
//       () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank"),
//       "Image saved — attach it in your post!"
//     );
//   };
//   const handleCopyLink = async () => {
//     if (!shareText) return;
//     const ok = await copyToClipboard(shareText);
//     if (ok) {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1600);
//       onToast("Copied to clipboard!");
//     }
//   };
//   const handleDownloadImage = () => {
//     if (!cardBlob || !shareRoom) return;
//     downloadBlob(cardBlob, shareFileName(shareRoom));
//     onToast("Image saved!");
//   };

//   const handlerMap: Record<string, () => void> = {
//     WhatsApp: handleShareToWhatsApp,
//     Threads: handleShareToThreads,
//     Instagram: handleShareToInstagram,
//     LinkedIn: handleShareToLinkedIn,
//     X: handleShareToX,
//     Copy: handleCopyLink,
//   };

//   const canNativeShare =
//     typeof navigator !== "undefined" &&
//     !!navigator.share &&
//     !!cardBlob &&
//     navigator.canShare?.({ files: [new File([cardBlob], "x.png", { type: "image/png" })] }) === true;

//   return (
//     <div
//       style={{
//         position: "absolute", top: 0, left: 0, right: 0,
//         bottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
//         display: "flex", flexDirection: "column", overflow: "hidden",
//       }}
//       className="lg:!bottom-0"
//     >
//       {/* Header */}
//       <div
//         style={{
//           flexShrink: 0,
//           padding: "16px 16px 10px",
//           borderBottom: "1px solid rgba(255,255,255,0.06)",
//           background: "var(--bg-primary, #0e0e14)",
//         }}
//       >
//         <p className="text-[15px] font-bold text-white">Roar Rooms</p>
//       </div>

//       <div
//         ref={scrollRef}
//         onTouchStart={(e) => e.stopPropagation()}
//         style={{
//           flex: 1, minHeight: 0,
//           overflowY: "scroll", overflowX: "hidden",
//           WebkitOverflowScrolling: "touch" as any,
//           touchAction: "pan-y",
//           overscrollBehavior: "contain",
//           paddingLeft: 16, paddingRight: 16, paddingBottom: 32,
//         }}
//       >
//         {allRooms.map((room, i) => (
//           <RoomCard
//             key={room.roomId}
//             room={room}
//             index={i}
//             onJoin={onJoinRoom}
//             onToast={onToast}
//             presence={presenceByRoom[room.roomId]}
//             onShare={handleShare}
//             sharingRoomId={sharingRoomId}
//           />
//         ))}
//         <div style={{ height: 86 }} />
//       </div>

//       {/* ── Share Modal ── */}
//       <AnimatePresence>
//         {shareRoom && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={closeShare}
//               style={{
//                 position: "fixed",
//                 inset: 0,
//                 zIndex: 200,
//                 background: "rgba(0,0,0,0.75)",
//                 backdropFilter: "blur(4px)",
//               }}
//             />

//             {/* Dialog */}
//             <motion.div
//               initial={{ opacity: 0, y: 20, scale: 0.95 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: 20, scale: 0.95 }}
//               transition={{ type: "spring", damping: 28, stiffness: 320 }}
//               onClick={(e) => e.stopPropagation()}
//               className="fixed z-[210] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[84vw] max-w-[260px] bg-[#1a1a1e] rounded-xl border border-white/10 p-2.5 shadow-2xl max-h-[80vh] overflow-y-auto box-border"
//             >
//               {/* Modal Header */}
//               <div className="flex items-center justify-between gap-2 mb-2">
//                 <p className="text-white text-xs font-bold m-0 min-w-0 truncate">
//                   Share {shareRoom.name}
//                 </p>
//                 <button
//                   type="button"
//                   onClick={closeShare}
//                   className="w-5 h-5 rounded-full bg-white/[0.06] border-none text-white/60 text-[10px] cursor-pointer flex items-center justify-center shrink-0"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {/* Image preview */}
//               <div className="rounded-lg overflow-hidden border border-white/10 bg-[#0a0a14] mb-2 relative aspect-[1340/752] flex items-center justify-center">
//                 {cardGenerating && (
//                   <p className="text-[9px] text-white/40 text-center px-3">Generating stats card…</p>
//                 )}
//                 {!cardGenerating && cardPreviewUrl && (
//                   <img src={cardPreviewUrl} alt={`${shareRoom.name} stats`} className="w-full h-full object-cover" />
//                 )}
//                 {!cardGenerating && !cardPreviewUrl && cardFailed && (
//                   <p className="text-[9px] text-white/40 text-center px-3">
//                     Couldn't render the image — share text below.
//                   </p>
//                 )}
//               </div>

//               {/* Stats readout (kept for accessibility / quick glance) */}
//               {shareLoading ? (
//                 <p className="text-[9px] text-white/40 text-center py-1.5 mb-1.5">
//                   Loading stats…
//                 </p>
//               ) : shareCounts && (
//                 <div className="grid grid-cols-3 gap-1 mb-2">
//                   {[
//                     { label: "Posts", value: shareCounts.post, color: "#e91e8c" },
//                     { label: "Debates", value: shareCounts.debate, color: "#60a5fa" },
//                     { label: "Predictions", value: shareCounts.prediction, color: "#fbbf24" },
//                     { label: "Trivia", value: shareCounts.trivia, color: "#22c55e" },
//                     { label: "Battles", value: shareCounts.battle, color: "#f97316" },
//                   ].map((s) => (
//                     <div
//                       key={s.label}
//                       className="bg-[#0a0a14] border border-white/[0.06] rounded-md py-1 px-0.5 text-center min-w-0"
//                     >
//                       <div
//                         className="font-extrabold leading-none"
//                         style={{ fontSize: "clamp(11px, 3.5vw, 14px)", color: s.color }}
//                       >
//                         {s.value}
//                       </div>
//                       <div className="text-[6px] text-white/45 uppercase font-bold tracking-wide mt-0.5 truncate">
//                         {s.label}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Primary native-share action — this is what attaches the IMAGE in WhatsApp/etc */}
//               {cardBlob && (
//                 <motion.button
//                   whileTap={{ scale: 0.97 }}
//                   onClick={handleNativeImageShare}
//                   disabled={nativeShareBusy}
//                   className="w-full mb-2 py-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 text-white disabled:opacity-60"
//                   style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
//                 >
//                   <Share2 size={11} />
//                   {nativeShareBusy ? "Sharing…" : canNativeShare ? "Share Image" : "Download Image"}
//                 </motion.button>
//               )}

//               {/* Platform icon fallbacks (text link + auto-downloaded image to attach manually) */}
//               {/* <div
//                 className="grid grid-cols-3 gap-1.5 mb-0.5"
//                 style={{
//                   opacity: shareLoading ? 0.4 : 1,
//                   pointerEvents: shareLoading ? "none" : "auto",
//                 }}
//               > */}
//                 {/* {SHARE_ACTIONS.map(({ alt, src }) => (
//                   <button
//                     key={alt}
//                     type="button"
//                     onClick={handlerMap[alt]}
//                     className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-0 min-w-0"
//                   >
//                     <div className="w-7 h-7 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
//                       <img
//                         src={src}
//                         alt={alt}
//                         className="w-full h-full object-cover rounded-full"
//                       />
//                     </div>
//                     <span className="text-[6px] text-white/35 font-medium whitespace-nowrap">
//                       {alt}
//                     </span>
//                   </button>
//                 ))} */}
//               {/* </div> */}

//               {/* {cardBlob && (
//                 <button
//                   type="button"
//                   onClick={handleDownloadImage}
//                   className="w-full mt-1.5 py-1 flex items-center justify-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-md text-white/50 text-[9px] font-medium cursor-pointer"
//                 >
//                   <Download size={9} />
//                   Save image
//                 </button>
//               )} */}

//               {copied && (
//                 <motion.p
//                   initial={{ opacity: 0, y: -6 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="text-[9px] text-emerald-400 text-center font-semibold mt-1.5 mb-0"
//                 >
//                   ✓ Copied!
//                 </motion.p>
//               )}

//               <button
//                 type="button"
//                 onClick={closeShare}
//                 className="mt-2 py-1 w-full bg-white/[0.04] border border-white/[0.06] rounded-md text-white/40 text-[9px] font-medium cursor-pointer"
//               >
//                 Close
//               </button>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }





import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Share2, Download, MessageCircle, Zap, PenLine, ArrowRight, BarChart3 } from "lucide-react";
import type { Room } from "../types";

const SPORT_GRADIENT: Record<string, string> = {
  cricket:  "linear-gradient(135deg,#7c3aed,#4f46e5)",
  football: "linear-gradient(135deg,#dc2626,#b45309)",
  default:  "linear-gradient(135deg,#e91e8c,#ff6b35)",
};

const SPORT_IMAGE: Record<string, string> = {
  cricket:  "/images/cricket3.png",
  football: "/images/fifa2.png",
  default:  "/images/fifa2.png",
};

const INFINITY_ROOM_ID = "vZFu6xEApNRd1aUbDuHW";

const VISIBLE_ROOM_IDS = ["2yQvtie7nIcWXDA2iUDj", "biDY0WLIZB7wBCaE2Ppx"];

const SHARE_CARD_BG = "/images/roomprofilecard.png";

interface ActiveFan {
  uid: string;
  username: string;
  avatarUrl?: string | null;
  badge?: string | null;
}

interface RoomCounts {
  post: number;
  debate: number;
  prediction: number;
  trivia: number;
  battle: number;
}

const EMPTY_COUNTS: RoomCounts = { post: 0, debate: 0, prediction: 0, trivia: 0, battle: 0 };

const SHARE_ACTIONS = [
  { alt: "WhatsApp", src: "/images/share_whatsapp.png" },
  { alt: "Threads", src: "/images/share_thread.png" },
  { alt: "Instagram", src: "/images/share_insta.png" },
  { alt: "LinkedIn", src: "/images/Share_linkedin.png" },
  { alt: "X", src: "/images/Share_X.png" },
  { alt: "Copy", src: "/images/share_copy_link.png" },
];

function buildRoomShareUrl(room: Room) {
  if (typeof window === "undefined") {
    return `https://sportsfan-frontend.vercel.app/MainModules/ROAR?room=${room.roomId}`;
  }
  const url = new URL(`${window.location.origin}/MainModules/ROAR`);
  url.searchParams.set("room", room.roomId);
  return url.toString();
}

function buildRoomShareText(room: Room, counts: RoomCounts, shareUrl: string) {
  return [
    `🔥 ${room.name} is heating up on Sportsfan360!`,
    "",
    `✏️ Posts: ${counts.post}`,
    `⚡ Debates: ${counts.debate}`,
    `🔮 Predictions: ${counts.prediction}`,
    `🧠 Trivia: ${counts.trivia}`,
    `⚔️ Battles: ${counts.battle}`,
    "",
    `Join the room 👉 ${shareUrl}`,
    "#StartRoaring #Sportsfan360",
  ].join("\n");
}

function shareFileName(room: Room) {
  return `${room.name.replace(/\s+/g, "-").toLowerCase()}-stats.png`;
}

function generateRoomShareCard(
  bgImg: HTMLImageElement,
  room: Room,
  counts: RoomCounts
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1340;
    canvas.height = 752;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve(null);

    try {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.error("[RoomsHome] Canvas draw failed:", e);
      return resolve(null);
    }

    ctx.font = "bold 46px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(room.name, canvas.width / 2, 130);

    const stats = [
      { label: "POSTS", value: counts.post, x: 140, color: "#E91E8C" },
      { label: "DEBATES", value: counts.debate, x: 400, color: "#60A5FA" },
      { label: "PREDICTIONS", value: counts.prediction, x: 670, color: "#FBBF24" },
      { label: "TRIVIA", value: counts.trivia, x: 970, color: "#22C55E" },
      { label: "BATTLES", value: counts.battle, x: 1230, color: "#F97316" },
    ];

    stats.forEach(({ label, value, x, color }) => {
      const y = 530;
      ctx.font = "bold 72px Arial";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(String(value), x, y);

      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, x, y + 40);
    });

    canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
  });
}

function StackedAvatars({
  fans,
  count,
  loaded,
  totalJoinCount,
}: {
  fans: ActiveFan[];
  count: number;
  loaded: boolean;
  totalJoinCount?: number;
}) {
  const DOT_COLORS = ["#e91e8c", "#ff6b35", "#00e8c6"];
  const hasFans = fans.length > 0;

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <div className="flex">
          {hasFans
            ? fans.slice(0, 3).map((fan, i) => (
                <div
                  key={fan.uid}
                  className="w-5 h-5 rounded-full border-2 border-[#0e0e14] relative overflow-hidden flex items-center justify-center"
                  style={{
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: 3 - i,
                    background: fan.avatarUrl
                      ? undefined
                      : "linear-gradient(135deg,#e91e8c,#ff6b35)",
                  }}
                >
                  {fan.avatarUrl ? (
                    <img
                      src={fan.avatarUrl}
                      alt={fan.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] font-extrabold text-white">
                      {fan.username?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
              ))
            : DOT_COLORS.map((c, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-[#0e0e14] relative"
                  style={{
                    background: c,
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: DOT_COLORS.length - i,
                    opacity: loaded ? 1 : 0.35,
                  }}
                />
              ))}
        </div>
        {loaded ? (
          <span className="text-[10px] font-semibold text-white/45">
            <span className="text-[10px] font-bold text-white/90">+{count} </span>Active
          </span>
        ) : (
          <span className="text-xs font-semibold text-white/25">···</span>
        )}
      </div>

      {loaded && totalJoinCount !== undefined && totalJoinCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-white/40">
            Total members joined -
          </span>
          <span className="text-[10px] font-bold text-white/90">
            {formatCount(totalJoinCount)}
          </span>
        </div>
      )}
    </div>
  );
}

function RoomThumbnail({ room, isInfinityRoom }: { room: Room; isInfinityRoom?: boolean }) {
  const sport    = (room.sport ?? "default").toLowerCase();
  const gradient = SPORT_GRADIENT[sport] ?? SPORT_GRADIENT.default;
  const imgSrc   = isInfinityRoom
    ? "/images/infinityroom.png"
    : SPORT_IMAGE[sport] ?? SPORT_IMAGE.default;

  return (
    <div
      className="w-[110px] h-[110px] min-w-[110px] rounded-xl relative overflow-hidden shrink-0"
      style={{ background: gradient }}
    >
      <img
        src={imgSrc}
        alt={room.name}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />

      {/* "ROAR ROOM" stamp overlay */}
      <div className="absolute left-0 right-0 bottom-1.5 flex justify-center leading-none select-none px-1">
        <span
          className="text-[9px] font-black italic tracking-tight text-center"
          style={{
            background: "linear-gradient(90deg,#E91E8C,#FF6B35)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          ★ ROAR ROOM ★
        </span>
      </div>
    </div>
  );
}

function SportBadge({ sport }: { sport: string }) {
  const label = sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
  const colors: Record<string, string> = {
    cricket:  "rgba(124,58,237,0.30)",
    football: "rgba(220,38,38,0.30)",
    default:  "rgba(233,30,140,0.25)",
  };
  const bg = colors[sport.toLowerCase()] ?? colors.default;

  return (
    <span
      className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block"
      style={{ background: bg, color: "rgba(255,255,255,0.85)" }}
    >
      {label}
    </span>
  );
}

function RoomStatsRow({ counts }: { counts?: RoomCounts }) {
  const stats = [
    { label: "Debates", value: counts?.debate ?? 0, Icon: MessageCircle },
    { label: "Predictions", value: counts?.prediction ?? 0, Icon: Zap },
    { label: "Posts", value: counts?.post ?? 0, Icon: PenLine },
    { label: "Shares", value: counts?.battle ?? 0, Icon: Share2 },
  ];

  return (
    <div className="grid grid-cols-4 gap-1 rounded-xl border border-white/[0.08] py-3 px-1">
      {stats.map(({ label, value, Icon }) => (
        <div key={label} className="flex flex-col items-center gap-1 min-w-0">
          <div className="flex items-center gap-1">
            <Icon size={13} className="text-white/50 shrink-0" />
            <span className="text-[15px] font-extrabold text-white leading-none">
              {counts ? value : "···"}
            </span>
          </div>
          <span className="text-[10px] text-white/40 font-medium truncate">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function RoomCard({
  room,
  index,
  onJoin,
  onToast,
  presence,
  onShare,
  sharingRoomId,
  counts,
}: {
  room: Room;
  index: number;
  onJoin: (r: Room) => void;
  onToast: (m: string) => void;
  presence?: { fanCount: number; fans: ActiveFan[]; totalJoinCount?: number };
  onShare: (room: Room) => void;
  sharingRoomId?: string | null;
  counts?: RoomCounts;
}) {
  const isFuture =
    room.scheduledStartTime !== undefined &&
    room.scheduledStartTime > Date.now();

  const sport = (room.sport ?? "default").toLowerCase();
  const presenceLoaded = presence !== undefined;
  const liveFanCount = presence?.fanCount ?? 0;
  const liveFans = presence?.fans ?? [];
  const totalJoinCount = presence?.totalJoinCount;

  const isInfinityRoom = room.roomId === INFINITY_ROOM_ID;

  const handleCardClick = () => {
    if (isFuture) {
      onToast("This room hasn't started yet.");
      return;
    }
    onJoin(room);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="mb-4 rounded-2xl border border-white/[0.08] bg-[#121218] overflow-hidden cursor-pointer hover:border-white/[0.14] transition-colors duration-150 p-3.5"
      onClick={handleCardClick}
    >
      {/* Top: image left, badge/title/description/avatars right */}
      <div className="flex gap-3 items-start">
        <RoomThumbnail room={room} isInfinityRoom={isInfinityRoom} />

        <div className="flex-1 min-w-0">
          {sport !== "default" && !isInfinityRoom && (
            <div className="mb-1">
              <SportBadge sport={sport} />
            </div>
          )}

          <p className="text-[12px] font-extrabold text-white leading-tight mb-1">
            {room.name}
          </p>

          <p className="text-[8px] text-white/45 mb-2 leading-snug line-clamp-2">
            {room.description ?? "Roar conversations"}
          </p>

          <StackedAvatars
            fans={liveFans}
            count={liveFanCount}
            loaded={presenceLoaded}
            totalJoinCount={totalJoinCount}
          />
        </div>
      </div>

      {/* Stats row — full width below */}
      <div className="mt-3">
        <RoomStatsRow counts={counts} />
      </div>

      {/* Buttons — full width below stats */}
      <div className="flex items-center gap-2 mt-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={(e) => {
            e.stopPropagation();
            if (sharingRoomId === room.roomId) return;
            onShare(room);
          }}
          disabled={sharingRoomId === room.roomId}
          className="flex-[0.42] py-2.5 rounded-full border border-white/15 bg-[#1a1a1e] text-white/85 text-[12px] font-bold flex items-center justify-center gap-1.5 hover:border-white/30 transition-colors duration-150 disabled:opacity-50"
        >
          {sharingRoomId === room.roomId ? (
            <div className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
          ) : (
            <BarChart3 size={13} />
          )}
          Share Stats
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={(e) => {
            e.stopPropagation();
            if (isFuture) { onToast("This room hasn't started yet."); return; }
            onJoin(room);
          }}
          className={[
            "flex-[0.58] py-2.5 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors duration-150 text-white",
            isFuture ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
          style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
        >
          {isFuture ? "Coming Soon" : "Join Room"}
          {!isFuture && <ArrowRight size={13} />}
        </motion.button>
      </div>
    </motion.div>
  );
}

interface Props {
  rooms: Room[];
  onJoinRoom: (room: Room) => void;
  onToast: (m: string) => void;
}

export default function RoomsHome({ rooms, onJoinRoom, onToast }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  type PresenceByRoom = {
    [roomId: string]: { fanCount: number; fans: ActiveFan[]; totalJoinCount?: number };
  };
  const [presenceByRoom, setPresenceByRoom] = useState<PresenceByRoom>({});
  const [countsByRoom, setCountsByRoom] = useState<Record<string, RoomCounts>>({});

  const [shareRoom, setShareRoom] = useState<Room | null>(null);
  const [shareCounts, setShareCounts] = useState<RoomCounts | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingRoomId, setSharingRoomId] = useState<string | null>(null);
  const shareRequestTokenRef = useRef<symbol | null>(null);

  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [cardGenerating, setCardGenerating] = useState(false);
  const [cardFailed, setCardFailed] = useState(false);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bgLoadPromiseRef = useRef<Promise<HTMLImageElement> | null>(null);
  const [nativeShareBusy, setNativeShareBusy] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const loadBgImage = (): Promise<HTMLImageElement> => {
    if (bgImageRef.current) return Promise.resolve(bgImageRef.current);
    if (bgLoadPromiseRef.current) return bgLoadPromiseRef.current;

    bgLoadPromiseRef.current = new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        bgImageRef.current = img;
        resolve(img);
      };
      img.onerror = () => {
        console.error(`[RoomsHome] Failed to load ${SHARE_CARD_BG}`);
        reject(new Error("bg-load-failed"));
      };
      img.src = SHARE_CARD_BG;
    });
    return bgLoadPromiseRef.current;
  };

  const allRooms = rooms.filter((r) => VISIBLE_ROOM_IDS.includes(r.roomId));

  useEffect(() => {
    const roomIds = allRooms.map((r) => r.roomId);
    if (roomIds.length === 0) return;

    let cancelled = false;
    const fetchPreview = async () => {
      try {
        const res = await axios.post("/api/roar/rooms/presence-preview", { roomIds });
        if (!cancelled && res.data?.success) setPresenceByRoom(res.data.rooms);
      } catch (e) {
        console.error("Presence preview failed:", e);
      }
    };

    fetchPreview();
    const iv = setInterval(() => {
      if (!document.hidden) fetchPreview();
    }, 30_000);
    return () => { cancelled = true; clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.length]);

  useEffect(() => {
    document.body.style.overflow = shareRoom ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [shareRoom]);

  useEffect(() => {
    return () => {
      if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
    };
  }, [cardPreviewUrl]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.focus();
        el.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(el);
        return ok;
      } catch {
        return false;
      }
    }
  };

  const fetchRoomCounts = async (room: Room): Promise<RoomCounts> => {
    try {
      const res = await axios.get(`/api/roar/rooms/${room.roomId}/messages`, {
        params: { limit: 1 },
      });
      return res.data?.counts ?? EMPTY_COUNTS;
    } catch (e) {
      console.error("Failed to fetch room stats for share:", e);
      return EMPTY_COUNTS;
    }
  };

  // Powers the always-visible stats row on each room card (separate from the
  // share-modal fetch, which re-fetches fresh counts at share time).
  useEffect(() => {
    const roomIds = allRooms.map((r) => r.roomId);
    if (roomIds.length === 0) return;

    let cancelled = false;
    const fetchAllCounts = async () => {
      const results = await Promise.all(
        allRooms.map(async (room) => {
          const counts = await fetchRoomCounts(room);
          return [room.roomId, counts] as const;
        })
      );
      if (cancelled) return;
      setCountsByRoom((prev) => {
        const next = { ...prev };
        results.forEach(([roomId, counts]) => { next[roomId] = counts; });
        return next;
      });
    };

    fetchAllCounts();
    const iv = setInterval(() => {
      if (!document.hidden) fetchAllCounts();
    }, 30_000);
    return () => { cancelled = true; clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.length]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async (room: Room) => {
    const requestId = Symbol();
    shareRequestTokenRef.current = requestId;

    setShareRoom(room);
    setShareCounts(null);
    setCopied(false);
    setCardBlob(null);
    setCardFailed(false);
    if (cardPreviewUrl) { URL.revokeObjectURL(cardPreviewUrl); setCardPreviewUrl(null); }

    setShareLoading(true);
    setSharingRoomId(room.roomId);
    setCardGenerating(true);

    try {
      const [counts, bgImg] = await Promise.all([
        fetchRoomCounts(room),
        loadBgImage().catch(() => null),
      ]);

      if (shareRequestTokenRef.current !== requestId) return;
      setShareCounts(counts);
      setShareLoading(false);

      if (!bgImg) {
        setCardFailed(true);
        setCardGenerating(false);
        return;
      }

      const blob = await generateRoomShareCard(bgImg, room, counts);
      if (shareRequestTokenRef.current !== requestId) return;

      if (blob) {
        setCardBlob(blob);
        setCardPreviewUrl(URL.createObjectURL(blob));
      } else {
        setCardFailed(true);
      }
    } finally {
      if (shareRequestTokenRef.current === requestId) {
        setCardGenerating(false);
        setSharingRoomId(null);
      }
    }
  };

  const closeShare = () => {
    shareRequestTokenRef.current = null;
    setShareRoom(null);
    setShareCounts(null);
    setShareLoading(false);
    setCopied(false);
    setCardGenerating(false);
    setCardFailed(false);
    setCardBlob(null);
    if (cardPreviewUrl) { URL.revokeObjectURL(cardPreviewUrl); setCardPreviewUrl(null); }
  };

  const shareUrl = shareRoom ? buildRoomShareUrl(shareRoom) : "";
  const shareText = shareRoom && shareCounts ? buildRoomShareText(shareRoom, shareCounts, shareUrl) : "";

  /**
   * Primary share action: hands the actual stats IMAGE to the OS share sheet.
   */
  const handleNativeImageShare = async () => {
    if (!shareRoom || !cardBlob) return;

    // Simple guard — same pattern as RoarJourneySection's working mobile share.
    // If a share is already in progress, ignore this click entirely so we never
    // call navigator.share() twice concurrently (that throws InvalidStateError).
    if (nativeShareBusy) return;

    setNativeShareBusy(true);
    try {
      const file = new File([cardBlob], shareFileName(shareRoom), { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: shareRoom.name,
            text: `Check out ${shareRoom.name} on Sportsfan360 👉 ${shareUrl}`,
          });
          return;
        } catch (shareErr: any) {
          if (shareErr?.name === "AbortError") return; // user cancelled — not an error
          console.error("[RoomsHome] navigator.share threw:", shareErr);
        }
      }

      // Fallback: download so the user can attach it manually.
      downloadBlob(cardBlob, shareFileName(shareRoom));
      onToast("Image saved! Attach it in your chat to share.");
    } finally {
      setNativeShareBusy(false);
    }
  };

  const openPlatformWithTextAndImage = (openUrl: () => void, toastMsg: string) => {
    if (cardBlob && shareRoom) {
      downloadBlob(cardBlob, shareFileName(shareRoom));
      onToast(toastMsg);
    }
    openUrl();
  };

  const handleShareToWhatsApp = () => {
    if (!shareText) return;
    openPlatformWithTextAndImage(
      () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank"),
      "Image saved — attach it in the WhatsApp chat!"
    );
  };
  const handleShareToThreads = () => {
    if (!shareText) return;
    openPlatformWithTextAndImage(
      () => window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, "_blank"),
      "Image saved — attach it in your Threads post!"
    );
  };
  const handleShareToInstagram = async () => {
    if (!shareText) return;
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    if (cardBlob && shareRoom) downloadBlob(cardBlob, shareFileName(shareRoom));
    onToast("Caption copied & image saved — attach it on Instagram!");
    window.open("https://www.instagram.com/", "_blank");
  };
  const handleShareToLinkedIn = () => {
    if (!shareUrl) return;
    openPlatformWithTextAndImage(
      () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank"),
      "Image saved — attach it in your LinkedIn post!"
    );
  };
  const handleShareToX = () => {
    if (!shareText) return;
    openPlatformWithTextAndImage(
      () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank"),
      "Image saved — attach it in your post!"
    );
  };
  const handleCopyLink = async () => {
    if (!shareText) return;
    const ok = await copyToClipboard(shareText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      onToast("Copied to clipboard!");
    }
  };
  const handleDownloadImage = () => {
    if (!cardBlob || !shareRoom) return;
    downloadBlob(cardBlob, shareFileName(shareRoom));
    onToast("Image saved!");
  };

  const handlerMap: Record<string, () => void> = {
    WhatsApp: handleShareToWhatsApp,
    Threads: handleShareToThreads,
    Instagram: handleShareToInstagram,
    LinkedIn: handleShareToLinkedIn,
    X: handleShareToX,
    Copy: handleCopyLink,
  };

  const canNativeShare =
    typeof navigator !== "undefined" &&
    !!navigator.share &&
    !!cardBlob &&
    navigator.canShare?.({ files: [new File([cardBlob], "x.png", { type: "image/png" })] }) === true;

  return (
    <div
      style={{
        position: "absolute", top: 0, left: 0, right: 0,
        bottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}
      className="lg:!bottom-0"
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: "16px 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "var(--bg-primary, #0e0e14)",
        }}
      >
        <p className="text-[15px] font-bold text-white">Roar Rooms</p>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          flex: 1, minHeight: 0,
          overflowY: "scroll", overflowX: "hidden",
          WebkitOverflowScrolling: "touch" as any,
          touchAction: "pan-y",
          overscrollBehavior: "contain",
          paddingLeft: 16, paddingRight: 16, paddingBottom: 32,
        }}
      >
        {allRooms.map((room, i) => (
          <RoomCard
            key={room.roomId}
            room={room}
            index={i}
            onJoin={onJoinRoom}
            onToast={onToast}
            presence={presenceByRoom[room.roomId]}
            onShare={handleShare}
            sharingRoomId={sharingRoomId}
            counts={countsByRoom[room.roomId]}
          />
        ))}
        <div style={{ height: 86 }} />
      </div>

      {/* ── Share Modal ── */}
      <AnimatePresence>
        {shareRoom && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeShare}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 200,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed z-[210] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[84vw] max-w-[260px] bg-[#1a1a1e] rounded-xl border border-white/10 p-2.5 shadow-2xl max-h-[80vh] overflow-y-auto box-border"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-white text-xs font-bold m-0 min-w-0 truncate">
                  Share {shareRoom.name}
                </p>
                <button
                  type="button"
                  onClick={closeShare}
                  className="w-5 h-5 rounded-full bg-white/[0.06] border-none text-white/60 text-[10px] cursor-pointer flex items-center justify-center shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Image preview */}
              <div className="rounded-lg overflow-hidden border border-white/10 bg-[#0a0a14] mb-2 relative aspect-[1340/752] flex items-center justify-center">
                {cardGenerating && (
                  <p className="text-[9px] text-white/40 text-center px-3">Generating stats card…</p>
                )}
                {!cardGenerating && cardPreviewUrl && (
                  <img src={cardPreviewUrl} alt={`${shareRoom.name} stats`} className="w-full h-full object-cover" />
                )}
                {!cardGenerating && !cardPreviewUrl && cardFailed && (
                  <p className="text-[9px] text-white/40 text-center px-3">
                    Couldn't render the image — share text below.
                  </p>
                )}
              </div>

              {/* Stats readout (kept for accessibility / quick glance) */}
              {shareLoading ? (
                <p className="text-[9px] text-white/40 text-center py-1.5 mb-1.5">
                  Loading stats…
                </p>
              ) : shareCounts && (
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {[
                    { label: "Posts", value: shareCounts.post, color: "#e91e8c" },
                    { label: "Debates", value: shareCounts.debate, color: "#60a5fa" },
                    { label: "Predictions", value: shareCounts.prediction, color: "#fbbf24" },
                    { label: "Trivia", value: shareCounts.trivia, color: "#22c55e" },
                    { label: "Battles", value: shareCounts.battle, color: "#f97316" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-[#0a0a14] border border-white/[0.06] rounded-md py-1 px-0.5 text-center min-w-0"
                    >
                      <div
                        className="font-extrabold leading-none"
                        style={{ fontSize: "clamp(11px, 3.5vw, 14px)", color: s.color }}
                      >
                        {s.value}
                      </div>
                      <div className="text-[6px] text-white/45 uppercase font-bold tracking-wide mt-0.5 truncate">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Primary native-share action — this is what attaches the IMAGE in WhatsApp/etc */}
               {cardBlob && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNativeImageShare}
                  disabled={nativeShareBusy}
                  className="w-full mb-2 py-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1.5 text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
                >
                  <Share2 size={11} />
                  {nativeShareBusy ? "Sharing…" : canNativeShare ? "Share Image" : "Download Image"}
                </motion.button>
              )}

              {/* Platform icon fallbacks (text link + auto-downloaded image to attach manually) */}
             {/* <div
                className="grid grid-cols-3 gap-1.5 mb-0.5"
                style={{
                  opacity: shareLoading ? 0.4 : 1,
                  pointerEvents: shareLoading ? "none" : "auto",
                }}
              >
                {SHARE_ACTIONS.map(({ alt, src }) => (
                  <button
                    key={alt}
                    type="button"
                    onClick={handlerMap[alt]}
                    className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-0 min-w-0"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-[6px] text-white/35 font-medium whitespace-nowrap">
                      {alt}
                    </span>
                  </button>
                ))}
              </div> */}

              {/* {cardBlob && (
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="w-full mt-1.5 py-1 flex items-center justify-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-md text-white/50 text-[9px] font-medium cursor-pointer"
                >
                  <Download size={9} />
                  Save image
                </button>
              )} */}

              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[9px] text-emerald-400 text-center font-semibold mt-1.5 mb-0"
                >
                  ✓ Copied!
                </motion.p>
              )}

              {/* <button
                type="button"
                onClick={closeShare}
                className="mt-2 py-1 w-full bg-white/[0.04] border border-white/[0.06] rounded-md text-white/40 text-[9px] font-medium cursor-pointer"
              >
                Close
              </button> */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}