// \components\NewHomeComponents\Myroomsstatspreview.tsx

import { motion } from "framer-motion";
import { MessageCircle, Users, Flame, TrendingUp } from "lucide-react";
import type { Room } from "../NewROARComponent/types";

interface RoomCounts {
  post: number;
  debate: number;
  prediction: number;
  trivia: number;
  battle: number;
}

interface PresenceInfo {
  fanCount: number;
  totalJoinCount?: number;
}

const SPORT_ICON_BG: Record<string, string> = {
  cricket: "linear-gradient(135deg,#e91e8c,#dc2626)",
  football: "linear-gradient(135deg,#16a34a,#0d9488)",
  default: "linear-gradient(135deg,#7c3aed,#4f46e5)",
};

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

/**
 * "MY ROOMS" list — mirrors image 4.
 * Excludes the always-on Open/Pulse room; only shows joinable match/community rooms.
 * `presenceByRoom` / `countsByRoom` should come from the same fetch already
 * used in RoomsHome (presence-preview + per-room counts endpoints).
 */
export function MyRoomsList({
  rooms,
  presenceByRoom,
  countsByRoom,
  openRoomId,
  onSeeAll,
  onEnter,
}: {
  rooms: Room[];
  presenceByRoom: Record<string, PresenceInfo>;
  countsByRoom: Record<string, RoomCounts>;
  openRoomId: string;
  onSeeAll: () => void;
  onEnter: (room: Room) => void;
}) {
  const visibleRooms = rooms.filter((r) => r.roomId !== openRoomId);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[11px] font-extrabold text-white/50 tracking-wide">MY ROOMS</span>
        <button
          type="button"
          onClick={onSeeAll}
          className="text-[11px] font-bold bg-transparent border-none cursor-pointer"
          style={{ color: "#ff6b35" }}
        >
          See all
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {visibleRooms.map((room) => {
          const sport = (room.sport ?? "default").toLowerCase();
          const presence = presenceByRoom[room.roomId];
          const counts = countsByRoom[room.roomId];
          const isLive = room.status === "live" || presence?.fanCount !== undefined && presence.fanCount > 0;
          const unread = counts ? counts.post + counts.debate : undefined;
          const iconBg = SPORT_ICON_BG[sport] ?? SPORT_ICON_BG.default;

          return (
            <motion.div
              key={room.roomId}
              whileTap={{ scale: 0.98 }}
              onClick={() => onEnter(room)}
              className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer"
              style={{
                background: isLive
                  ? "linear-gradient(90deg,#8a1240,#c2410c)"
                  : "#121218",
                border: isLive ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: iconBg }}
              >
                <Flame size={16} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-extrabold text-white truncate">{room.name}</p>
                  {isLive && (
                    <span className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-300 bg-black/20 px-1.5 py-0.5 rounded-full shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium truncate" style={{ color: isLive ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)" }}>
                  {room.description ?? (isLive
                    ? `${presence ? formatCount(presence.fanCount) : "—"} active`
                    : `${presence?.totalJoinCount ? formatCount(presence.totalJoinCount) : "—"} members${presence?.fanCount ? ` · ${presence.fanCount} active` : ""}`)}
                </p>
              </div>

              {!isLive && unread !== undefined && unread > 0 && (
                <span
                  className="flex items-center justify-center rounded-full text-white text-[10px] font-extrabold shrink-0"
                  style={{ minWidth: 20, height: 18, padding: "0 5px", background: "#e91e8c" }}
                >
                  {unread}
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnter(room);
                }}
                className="shrink-0 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full border-none cursor-pointer"
                style={{
                  background: isLive ? "rgba(0,0,0,0.25)" : "rgba(233,30,140,0.12)",
                  color: isLive ? "#fff" : "#ff6b35",
                }}
              >
                {isLive ? "Enter" : "Open"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * "ROAR PULSE LIVE" summary bar — mirrors image 5.
 * Uses aggregate stats across all rooms (including the open/pulse room's own
 * live counters) — this is the only place the open room's data should surface,
 * as a single trending highlight rather than a full room card.
 */
export function RoarPulseLiveBar({
  liveRoomsCount,
  activeFansCount,
  postsPerMin,
  trendingLabel,
  onOpen,
}: {
  liveRoomsCount: number;
  activeFansCount: number;
  postsPerMin: number;
  trendingLabel: string;
  onOpen: () => void;
}) {
  const stats = [
    { label: "Live Rooms", value: liveRoomsCount, color: "#f43f5e", Icon: Flame },
    { label: "Active Fans", value: formatCount(activeFansCount), color: "#f59e0b", Icon: Users },
    { label: "Posts / min", value: postsPerMin, color: "#e91e8c", Icon: MessageCircle },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#121218] p-3">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-extrabold text-white/50 tracking-wide">ROAR PULSE LIVE</span>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="text-[11px] font-bold bg-transparent border-none cursor-pointer"
          style={{ color: "#ff6b35" }}
        >
          Open ›
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {stats.map(({ label, value, color, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-[#0a0a0f] py-2.5 px-1">
            <Icon size={14} style={{ color }} />
            <span className="text-[14px] font-extrabold leading-none" style={{ color }}>
              {value}
            </span>
            <span className="text-[8px] text-white/40 font-semibold text-center truncate w-full">{label}</span>
          </div>
        ))}

        <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#0a0a0f] py-2.5 px-1">
          <TrendingUp size={14} className="text-amber-300" />
          <span className="text-[10px] font-extrabold text-amber-300 leading-none text-center truncate w-full">
            {trendingLabel}
          </span>
          <span className="text-[8px] text-white/40 font-semibold">Trending</span>
        </div>
      </div>
    </div>
  );
}