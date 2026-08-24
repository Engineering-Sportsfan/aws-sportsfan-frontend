

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

interface RoomCounts {
  post: number;
  debate: number;
  prediction: number;
  trivia: number;
  battle: number;
}

const EMPTY_COUNTS: RoomCounts = { post: 0, debate: 0, prediction: 0, trivia: 0, battle: 0 };

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
        {/* <h4 className="text-[15px] font-extrabold text-white leading-tight">{card.title}</h4> */}
            <p className="text-[13px] font-extrabold text-white whitespace-normal">Pulse Room</p>

      </div>
                  <div className="text-[9px] font-bold text-white whitespace-normal">Your Space to Post and Talk About Any Sport</div>
      <p className="text-[11px] text-white/45 font-medium mb-3">
      · {card.messagesCount} Messages
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

// Same shape RoomsHome.tsx uses to total up a room's activity across all
// message types (post/debate/prediction/trivia/battle).
function totalMessages(counts?: RoomCounts) {
  if (!counts) return 0;
  return counts.post + counts.debate + counts.prediction + counts.trivia + counts.battle;
}

/* ---------------------------------- Exported component ---------------------------------- */

export default function RoarRooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [presenceByRoom, setPresenceByRoom] = useState<Record<string, PresenceInfo>>({});
  const [countsByRoom, setCountsByRoom] = useState<Record<string, RoomCounts>>({});
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
        console.log("home fetchged rooms", fetchedRooms);
        setRooms(fetchedRooms);

        if (fetchedRooms.length === 0) {
          setPresenceByRoom({});
          setCountsByRoom({});
          setStatus("empty");
          return;
        }

        const roomIds = fetchedRooms.map((r) => r.roomId);

        // Same two calls RoomsHome.tsx makes: presence-preview for fan
        // counts, and per-room /messages for the counts object used to
        // derive a total message count.
        const [presenceRes, countsResults] = await Promise.all([
          axios.post("/api/roar/rooms/presence-preview", { roomIds }).catch((err) => {
            console.warn("[RoarRooms] presence-preview failed:", err?.response?.status, err?.message);
            return null;
          }),
          Promise.all(
            fetchedRooms.map(async (room) => {
              try {
                const res = await axios.get(`/api/roar/rooms/${room.roomId}/messages`, {
                  params: { limit: 500 },
                });
                return [room.roomId, res.data?.counts ?? EMPTY_COUNTS] as const;
              } catch (e) {
                console.error("[RoarRooms] Failed to fetch room counts:", e);
                return [room.roomId, EMPTY_COUNTS] as const;
              }
            })
          ),
        ]);

        if (cancelled) return;

        if (presenceRes?.data?.success) {
          setPresenceByRoom(presenceRes.data.rooms ?? {});
        }

        const nextCounts: Record<string, RoomCounts> = {};
        countsResults.forEach(([roomId, counts]) => { nextCounts[roomId] = counts; });
        setCountsByRoom(nextCounts);

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
    const counts = countsByRoom[room.roomId];
    const msgCount = totalMessages(counts);
    const isLive = room.isActive || fanCount > 0;
    return {
      id: room.roomId,
      emoji: getSportEmoji(room.sport),
      title: room.name,
      fansCount: fanCount > 0 ? formatCount(fanCount) : "—",
      messagesCount: msgCount > 0 ? formatCount(msgCount) : "—",
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