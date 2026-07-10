

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import CreateBattle from "./CreateBattle";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { emitSxpActivityRefresh } from "@/lib/sxpEvents";
import { Pencil, Users } from "lucide-react";

interface PlayerProfile {
  id: string;
  name: string;
  playerName?: string;
  jerseyNumber?: string | number;
  role?: string;
  runs?: number | string;
  strikeRate?: number | string;
  age?: number | string;
  medals?: number;
  team?: string;
  specialization?: string;
  type?: "PLAYER" | "CLUB";
  wins?: number | string;
  losses?: number | string;
  points?: number | string;
  city?: string;
  avatar?: string;
  about?: string;
  overview?: {
    captain: string;
    coach: string;
    owner: string;
    venue: string;
  };
  stats?: {
    runs: string;
    sr: string;
    avg: string;
  };
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

interface BattleSession {
  id?: string;
  battleId: string;
  userId: string;
  status: string;
  userName?: string;
  userEmail?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  points: number;
  votes: number;
}

interface ExtendedPlayer extends PlayerProfile {
  jerseyColor?: {
    from: string;
    to: string;
    stroke: string;
    glow: string;
    innerStroke: string;
  };
}

const getJerseyColor = (playerName: string, team?: string) => {
  const colors = [
    { from: "#dc2626", to: "#7f1d1d", stroke: "#ef4444", glow: "rgba(220,38,38,0.45)", innerStroke: "#fca5a5" },
    { from: "#1d4ed8", to: "#1e3a8a", stroke: "#3b82f6", glow: "rgba(29,78,216,0.45)", innerStroke: "#93c5fd" },
    { from: "#0891b2", to: "#164e63", stroke: "#06b6d4", glow: "rgba(8,145,178,0.45)", innerStroke: "#a5f3fc" },
    { from: "#ca8a04", to: "#713f12", stroke: "#eab308", glow: "rgba(202,138,4,0.45)", innerStroke: "#fde047" },
    { from: "#7c3aed", to: "#3b0764", stroke: "#8b5cf6", glow: "rgba(124,58,237,0.45)", innerStroke: "#c4b5fd" },
    { from: "#059669", to: "#064e3b", stroke: "#10b981", glow: "rgba(5,150,105,0.45)", innerStroke: "#6ee7b7" },
    { from: "#db2777", to: "#831843", stroke: "#ec4899", glow: "rgba(219,39,119,0.45)", innerStroke: "#f9a8d4" },
    { from: "#ea580c", to: "#7c2d12", stroke: "#f97316", glow: "rgba(234,88,12,0.45)", innerStroke: "#fdba74" },
  ];
  const hash = playerName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getJerseys = [
  { team: "Chennai Super Kings", path: "/images/CSK1.png" },
  { team: "Delhi Capitals", path: "/images/DC1.png" },
  { team: "Kolkata Knight Riders", path: "/images/KKR1.png" },
  { team: "Mumbai Indians", path: "/images/MI1.png" },
  { team: "Punjab Kings", path: "/images/PBKS1.png" },
  { team: "Royal Challengers Bengaluru", path: "/images/RCB1.png" },
  { team: "Rajasthan Royals", path: "/images/RR1.png" },
  { team: "Sunrisers Hyderabad", path: "/images/SH1.png" },
  { team: "Gujarat Titans", path: "/images/GT1.png" },
  { team: "Lucknow Super Giants", path: "/images/LSG1.png" },
];

// ── Toast 
function Toast({ message, type }: { message: string; type: "success" | "skip" | "error" }) {
  const bg =
    type === "success" ? "rgba(74,222,128,0.15)" :
      type === "skip" ? "rgba(248,113,113,0.15)" :
        "rgba(255,255,255,0.08)";
  const border =
    type === "success" ? "#4ade80" :
      type === "skip" ? "#f87171" :
        "#6b7280";
  const icon = type === "success" ? "⚡ " : type === "skip" ? "✗ " : "ℹ ";
  return (
    <div
      className="fixed top-6 left-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold tracking-wide shadow-2xl"
      style={{
        transform: "translateX(-50%)",
        background: bg,
        border: `1px solid ${border}`,
        color: border,
        backdropFilter: "blur(12px)",
        animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {icon}{message}
    </div>
  );
}

// ── Leaderboard Modal 
function LeaderboardModal({
  battleName,
  leaderboard,
  votedPlayerIds,
  onClose,
}: {
  battleName: string;
  leaderboard: LeaderboardEntry[];
  votedPlayerIds: string[];
  onClose: () => void;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-3xl pb-8 pt-5 px-5"
        style={{
          background: "linear-gradient(180deg, #130820 0%, #0c0c1a 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-lg">Leaderboard</h2>
            <p className="text-gray-500 text-xs mt-0.5">{battleName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            ✕
          </button>
        </div>
        {leaderboard.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-gray-400 text-sm">No votes yet — be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {leaderboard.map((entry) => {
              const hasVoted = votedPlayerIds.includes(entry.playerId);
              const color = getJerseyColor(entry.playerName);
              return (
                <div
                  key={entry.playerId}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: entry.rank <= 3
                      ? `linear-gradient(90deg, ${color.from}22, transparent)`
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${entry.rank <= 3 ? color.stroke + "44" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <span className="text-xl w-7 text-center">
                    {entry.rank <= 3 ? medals[entry.rank - 1] : `${entry.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm truncate">{entry.playerName}</p>
                      {hasVoted && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "#4ade8022", color: "#4ade80", border: "1px solid #4ade8044" }}>
                          Voted
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-[10px] mt-0.5">{entry.votes} vote{entry.votes !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-base" style={{ color: entry.rank <= 3 ? color.stroke : "#9ca3af" }}>
                      {entry.points}
                    </p>
                    <p className="text-gray-700 text-[9px] font-bold tracking-wider">PTS</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── How Fan Battle Works Modal 
function HowFanBattleWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 pb-15"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden relative flex flex-col"
        style={{
          background: "linear-gradient(180deg, #1a0d2e 0%, #0c0c1a 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          maxHeight: "85vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-20 flex flex-col items-center pt-6 pb-4 px-5 flex-shrink-0"
          style={{
            background: "linear-gradient(180deg, #1a0d2e 0%, #1a0d2e 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.3)" }}>
            <span style={{ fontSize: 22 }}>📱</span>
          </div>
          <h2 className="text-white text-lg sm:text-xl font-bold text-center">How Fan Battle Works</h2>
          <p className="text-gray-400 text-xs sm:text-sm text-center mt-1 leading-snug px-2">
            Engage with player cards to support your favorites and influence the game!
          </p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors z-30"
          style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
        >
          ✕
        </button>
        <div
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) rgba(0,0,0,0.2)" }}
        >
          <div className="flex flex-col gap-3">
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4"
              style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)" }}>
                  <span className="text-sm sm:text-base">→</span>
                </div>
                <span className="font-bold text-xs sm:text-sm" style={{ color: "#10b981" }}>Swipe Right →</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {["Like the player and add them to your favorites", "Boost their Power Points +15", "See more similar players"].map((text) => (
                  <li key={text} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#10b981" }} />
                    <span className="flex-1">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <span className="text-sm sm:text-base text-gray-400">←</span>
                </div>
                <span className="font-bold text-xs sm:text-sm text-gray-300">Swipe Left ←</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {["Skip to the next player", "No points awarded", "Help us learn your preferences"].map((text) => (
                  <li key={text} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-gray-600" />
                    <span className="flex-1">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4"
              style={{ background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.2)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">✨</span>
                <p className="text-xs font-bold" style={{ color: "#ec4899" }}>Pro Tip</p>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Swipe right on players you love to help them climb the leaderboard! Each vote gives +15 Power Points.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}

// ── Battle Result Screen ───────────────────────────────────────────────────────
function BattleResultScreen({
  battleName,
  votedCount,
  skippedCount,
  pointsGiven,
  hasNextBattle,
  nextBattle,
  nextBattleIndex,
  totalBattles,
  nextItemCount,
  onPlayNext,
  onCreateBattle,
  isLoggedIn,
}: {
  battleName: string;
  votedCount: number;
  skippedCount: number;
  pointsGiven: number;
  hasNextBattle: boolean;
  nextBattle?: Battle;
  nextBattleIndex?: number;
  totalBattles?: number;
  nextItemCount?: number;
  onPlayNext: () => void;
  onCreateBattle: () => void;
  isLoggedIn: boolean;
}) {
  const { user } = useAuth();
  const { leaderboard, currentUserRank, currentUserPoints, loading } = useLeaderboard();

  if (!hasNextBattle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070f] px-4">
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 bg-[#0f1520] rounded-2xl px-5 py-6"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-white text-xl font-bold">Battle complete!</h2>
              <p className="text-gray-500 text-xs mt-1 truncate max-w-[220px]">{battleName}</p>
            </div>
            <div className="w-full grid grid-cols-3 gap-2">
              {[
                { label: "VOTED", value: votedCount, color: "#4ade80" },
                { label: "SKIPPED", value: skippedCount, color: "#9ca3af" },
                { label: "PTS GIVEN", value: `+${pointsGiven}`, color: "#60a5fa" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col items-center justify-center rounded-xl py-3"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-lg font-bold" style={{ color }}>{value}</span>
                  <span className="text-[9px] font-bold tracking-widest mt-0.5 text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inline Leaderboard for completion screen */}
          <div className="rounded-2xl w-full p-5 bg-[#0f1520] border border-white/5 text-left">
            <h3 className="text-white text-sm font-bold mb-4">Global Leaderboard</h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
              {loading && leaderboard.length === 0 ? (
                <div className="text-gray-500 text-center py-4 text-[10px] italic">Loading...</div>
              ) : leaderboard.length > 0 ? (
                <>
                  {leaderboard.slice(0, 5).map((lbUser) => (
                    <div key={lbUser.userId} className={`flex items-center justify-between p-2 rounded-xl border ${lbUser.userId === user?.userId ? 'bg-[#ff6d00]/10 border-[#ff6d00]/30' : 'bg-[#1a1a2e]/50 border-white/5'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold w-5 text-center text-[10px] ${lbUser.rank <= 3 ? 'text-[#ffa726]' : 'text-gray-500'}`}>#{lbUser.rank}</span>
                        <span className="text-white text-xs font-medium truncate max-w-[100px]">{lbUser.userName}</span>
                      </div>
                      <span className="text-[#ff6d00] font-bold text-xs">{lbUser.totalPoints} <span className="text-[9px] text-gray-600">PTS</span></span>
                    </div>
                  ))}
                  {user?.userId && !leaderboard.slice(0, 5).some(u => u.userId === user.userId) && (
                    <>
                      <div className="flex justify-center py-0.5"><div className="h-2 w-px bg-white/10" /></div>
                      {leaderboard.find(u => u.userId === user.userId) && (
                        (() => {
                          const lbUser = leaderboard.find(u => u.userId === user.userId)!;
                          return (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-[#ff6d00]/10 border border-[#ff6d00]/30">
                              <div className="flex items-center gap-2">
                                <span className="font-bold w-5 text-center text-[10px] text-gray-500">#{lbUser.rank}</span>
                                <span className="text-white text-xs font-medium max-w-[100px]">{lbUser.userName}</span>
                              </div>
                              <span className="text-[#ff6d00] font-bold text-xs">{lbUser.totalPoints} <span className="text-[9px] text-gray-600">PTS</span></span>
                            </div>
                          );
                        })()
                      )}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 bg-[#0f1520] rounded-2xl px-5 py-6"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5" />
                <path d="M12 7v5l3 3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold text-base">All battles played!</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                You&apos;ve completed all available battles. Check back soon for new ones!
              </p>
            </div>
            <div className="w-full h-px bg-[#1e2535]" />
            <div className="w-full flex flex-col gap-2.5">
              {isLoggedIn && (
                <button
                  onClick={onCreateBattle}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(90deg, #e91e8c, #ff6b35)" }}>
                  Create a battle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070f] px-4 py-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col items-center gap-4 bg-[#0f1520] rounded-2xl px-5 py-6"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-bold">Battle complete!</h2>
            <p className="text-gray-500 text-xs mt-1 truncate max-w-[220px]">{battleName}</p>
          </div>
          <div className="w-full grid grid-cols-3 gap-2">
            {[
              { label: "VOTED", value: votedCount, color: "#4ade80" },
              { label: "SKIPPED", value: skippedCount, color: "#9ca3af" },
              { label: "PTS GIVEN", value: `+${pointsGiven}`, color: "#60a5fa" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center justify-center rounded-xl py-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-lg font-bold" style={{ color }}>{value}</span>
                <span className="text-[9px] font-bold tracking-widest mt-0.5 text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inline Leaderboard for transition screen */}
        <div className="rounded-2xl w-full p-4 bg-[#0f1520] border border-white/5 text-left">
          <h3 className="text-white text-[11px] font-bold mb-3 uppercase tracking-wider text-gray-500">Standings</h3>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
            {loading && leaderboard.length === 0 ? (
              <div className="text-gray-500 text-center py-2 text-[10px] italic">Loading...</div>
            ) : leaderboard.length > 0 ? (
              <>
                {leaderboard.slice(0, 3).map((lbUser) => (
                  <div key={lbUser.userId} className={`flex items-center justify-between p-2 rounded-xl border ${lbUser.userId === user?.userId ? 'bg-[#ff6d00]/10 border-[#ff6d00]/30' : 'bg-[#1a1a2e]/50 border-white/5'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold w-5 text-center text-[10px] ${lbUser.rank <= 3 ? 'text-[#ffa726]' : 'text-gray-500'}`}>#{lbUser.rank}</span>
                      <span className="text-white text-xs font-medium truncate max-w-[100px]">{lbUser.userName}</span>
                    </div>
                    <span className="text-[#ff6d00] font-bold text-xs">{lbUser.totalPoints}</span>
                  </div>
                ))}
                {user?.userId && !leaderboard.slice(0, 3).some(u => u.userId === user.userId) && (
                  <>
                    <div className="flex justify-center py-0.5"><div className="h-1.5 w-px bg-white/10" /></div>
                    {leaderboard.find(u => u.userId === user.userId) && (
                      (() => {
                        const lbUser = leaderboard.find(u => u.userId === user.userId)!;
                        return (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-[#ff6d00]/10 border border-[#ff6d00]/30">
                            <div className="flex items-center gap-2">
                              <span className="font-bold w-5 text-center text-[10px] text-gray-500">#{lbUser.rank}</span>
                              <span className="text-white text-xs font-medium max-w-[100px]">{lbUser.userName}</span>
                            </div>
                            <span className="text-[#ff6d00] font-bold text-xs">{lbUser.totalPoints}</span>
                          </div>
                        );
                      })()
                    )}
                  </>
                )}
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 bg-[#0f1520] rounded-2xl px-5 py-6"
          style={{ border: "1px solid rgba(236,72,153,0.25)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-widest text-gray-600">
              NEXT UP · BATTLE {nextBattleIndex} OF {totalBattles}
            </p>
            <h3 className="text-white font-bold text-base mt-1">
              {nextBattle?.battleName
                ? nextBattle.battleName.charAt(0).toUpperCase() + nextBattle.battleName.slice(1)
                : "Next Battle"}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {nextItemCount} {nextBattle?.battleType === "CLUBS" ? "clubs" : "players"}
            </p>
          </div>
          <div className="w-full h-px bg-[#1e2535]" />
          <div className="w-full flex flex-col gap-2.5">
            <button
              onClick={onPlayNext}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(90deg, #e91e8c, #ff6b35)" }}>
              Start battle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Already Played Screen ──────────────────────────────────────────────────────
function AlreadyPlayedScreen({
  onCreateBattle,
  isLoggedIn,
}: {
  onCreateBattle: () => void;
  isLoggedIn: boolean;
}) {
  const { user } = useAuth();
  const { leaderboard, currentUserRank, currentUserPoints, loading } = useLeaderboard();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070f] px-4 py-10">
      <div className="text-center w-full max-w-lg">
        <div className="w-20 h-20 rounded-full bg-[#1a1a2e] flex items-center justify-center mx-auto mb-4"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-white text-xl font-bold mb-2">You&apos;ve played all battles!</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Check back soon for new battles, or create your own to challenge friends.
        </p>

        {/* Inline Leaderboard */}
        <div className="rounded-2xl w-full p-5 mb-8 bg-[#0f1520] border border-white/5 text-left">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-white text-base font-bold">Global Leaderboard</h3>
            {currentUserRank && currentUserRank > 0 && (
              <div className="text-[10px] bg-[#ff6d00]/20 text-[#ff6d00] border border-[#ff6d00]/30 px-2 py-1 rounded-full font-bold">
                RANK #{currentUserRank}
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {loading && leaderboard.length === 0 ? (
              <div className="text-gray-500 text-center py-4 text-xs italic">Loading rankings...</div>
            ) : leaderboard.length > 0 ? (
              <>
                {leaderboard.slice(0, 10).map((lbUser) => (
                  <div
                    key={lbUser.userId}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                      lbUser.userId === user?.userId ? 'bg-[#ff6d00]/10 border border-[#ff6d00]/30' : 'bg-[#1a1a2e]/50 border border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold w-6 text-center text-xs ${lbUser.rank <= 3 ? 'text-[#ffa726]' : 'text-gray-500'}`}>
                        #{lbUser.rank}
                      </span>
                      <span className="text-white text-sm font-medium max-w-[120px]">{lbUser.userName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#ff6d00] font-bold text-sm">{lbUser.totalPoints}</span>
                      <span className="text-gray-600 text-[10px]">PTS</span>
                    </div>
                  </div>
                ))}
                
                {/* Show current user if not in top 10 */}
                {user?.userId && !leaderboard.slice(0, 10).some(u => u.userId === user.userId) && (
                  <>
                    <div className="flex justify-center py-1">
                      <div className="h-4 w-px bg-white/10" />
                    </div>
                    {leaderboard.find(u => u.userId === user.userId) ? (
                      (() => {
                        const lbUser = leaderboard.find(u => u.userId === user.userId)!;
                        return (
                          <div
                            className="flex items-center justify-between p-2.5 rounded-xl transition-colors bg-[#ff6d00]/10 border border-[#ff6d00]/30"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold w-6 text-center text-xs text-gray-500">
                                #{lbUser.rank}
                              </span>
                              <span className="text-white text-sm font-medium truncate max-w-[120px]">{lbUser.userName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[#ff6d00] font-bold text-sm">{lbUser.totalPoints}</span>
                              <span className="text-gray-600 text-[10px]">PTS</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : currentUserRank && currentUserRank > 10 ? (
                      <div
                        className="flex items-center justify-between p-2.5 rounded-xl transition-colors bg-[#ff6d00]/10 border border-[#ff6d00]/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold w-6 text-center text-xs text-gray-500">
                            #{currentUserRank}
                          </span>
                          <span className="text-white text-sm font-medium truncate max-w-[120px]">{user.name || "You"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#ff6d00] font-bold text-sm">{currentUserPoints || 0}</span>
                          <span className="text-gray-600 text-[10px]">PTS</span>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-gray-600 text-xs">
                No rankings available yet.
              </div>
            )}
          </div>
        </div>

        {isLoggedIn && (
          <button
            onClick={onCreateBattle}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-pink-500/20"
            style={{ background: "linear-gradient(90deg, #e91e8c, #ff6b35)" }}
          >
            Create a Battle
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FanBattleCard({ onBattleComplete }: { onBattleComplete?: () => void }) {
  const { user, loading: authLoading, getUserDisplayName } = useAuth();
  const { refreshLeaderboard } = useLeaderboard();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayNumber, setDisplayNumber] = useState<number | string>("--");
  const [isScanning, setIsScanning] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // ── battles: all accessible; playableBattles: not yet interacted with ─────
  const [battles, setBattles] = useState<Battle[]>([]);
  const [playableBattles, setPlayableBattles] = useState<Battle[]>([]);
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
  const [currentItems, setCurrentItems] = useState<ExtendedPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const [votedPlayerIds, setVotedPlayerIds] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "skip" | "error" } | null>(null);

  const [showBattleResult, setShowBattleResult] = useState(false);
  const [battleStats, setBattleStats] = useState({ voted: 0, skipped: 0, pointsGiven: 0 });
  // Snapshot of the battle name at completion time (before removal from list)
  const [completedBattleName, setCompletedBattleName] = useState("");

  // Track in-flight vote promises so result waits for the last one
  const pendingVotePromises = useRef<Promise<void>[]>([]);

  const startX = useRef(0);
  const isDraggingRef = useRef(false);
  const dragXRef = useRef(0);
  const lockAxis = useRef<"h" | "v" | null>(null);
  const scanInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: "success" | "skip" | "error") => {
    setToast({ message, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 2200);
  };

  const checkPermission = useCallback(
    (battle: Battle): boolean => {
      if (battle.userId === "admin_001") return true;
      if (!user?.userId) return false;
      if (battle.userId === user.userId) return true;
      return !!battle.invitedFriends?.some((f) => f.email === user.email);
    },
    [user]
  );

  const fetchLeaderboard = useCallback(async (battleId: string) => {
    try {
      const res = await axios.get(
        `/api/battle/battle-vote?battleId=${battleId}&userId=${user?.userId || ""}`
      );
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard || []);
        setVotedPlayerIds(new Set(res.data.votedPlayerIds || []));
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  }, [user]);



 useEffect(() => {
  if (authLoading) return;

  const fetchBattles = async () => {
    try {
      setLoading(true);

      // Fetch all battles
      const battlesRes = await axios.get(`/api/battle`);

      if (!battlesRes.data.success || !battlesRes.data.battles) {
        setBattles([]);
        setPlayableBattles([]);
        setLoading(false);
        return;
      }

      const accessible: Battle[] = battlesRes.data.battles.filter(checkPermission);
      
      // Fetch completed battle sessions for the user
      let completedBattleIds: string[] = [];
      if (user?.userId) {
        try {
          // Fetch all completed sessions for this user
          const sessionsRes = await axios.get(`/api/battle/battle-session?userId=${user.userId}`);
          if (sessionsRes.data.success && sessionsRes.data.data) {
            // If the API returns an array of sessions
            const sessions = Array.isArray(sessionsRes.data.data) ? sessionsRes.data.data : [sessionsRes.data.data];
            completedBattleIds = sessions
              .filter((session: BattleSession) => session.status === "completed")
              .map((session: BattleSession) => session.battleId);
          }
        } catch (err) {
          console.error("Error fetching completed battles:", err);
        }
      }

      // Filter out completed battles
      const completedSet = new Set(completedBattleIds.map(id => String(id).trim()));
      const unplayed = accessible.filter((b) => {
        const bid = String(b.id).trim();
        return !completedSet.has(bid);
      });

      console.log("Accessible Battle IDs (normalized):", accessible.map(b => String(b.id).trim()));
      console.log("Completed Battle IDs (normalized):", Array.from(completedSet));
      console.log("All battles:", accessible.length);
      console.log("Unplayed battles:", unplayed.length);
      
      if (unplayed.length > 0) {
        console.log("First Unplayed Battle ID:", unplayed[0].id);
      }

      setBattles(accessible);
      setPlayableBattles(unplayed);

      if (unplayed.length > 0) {
        await fetchItemsForBattle(unplayed[0]);
        await fetchLeaderboard(unplayed[0].id);
      } else {
        setCurrentItems([]);
      }
    } catch (err) {
      console.error("Error fetching battles:", err);
      setBattles([]);
      setPlayableBattles([]);
    } finally {
      setLoading(false);
    }
  };

  fetchBattles();
}, [user, authLoading, checkPermission]);

const fetchItemsForBattle = async (battle: Battle) => {
  const isClubBattle = battle.battleType === "CLUBS";
  const ids = isClubBattle ? battle.selectedClubs : battle.selectedPlayers;
  if (!ids || ids.length === 0) { setCurrentItems([]); return; }
  try {
    const promises = ids.map(async (id) => {
      try {
        if (isClubBattle) {
          const response = await axios.get(`/api/club-profile/${id}`);
          if (response.data.success) {
            const club = response.data.profile;
            const entity: ExtendedPlayer = {
              id, type: "CLUB",
              name: club.name || "Unknown Club",
              team: club.team || "IPL",
              city: club.overview?.venue || "",
              avatar: club.avatar || "",
              role: "IPL Franchise",
              wins: club.stats?.runs || "0",
              losses: club.stats?.avg || "0",
              points: club.stats?.sr || "0",
              jerseyNumber: "CLB",
              about: club.about,
              overview: club.overview,
              stats: club.stats,
            };
            entity.jerseyColor = getJerseyColor(entity.name, entity.team);
            return entity;
          }
          return null;
        } else {
          const response = await axios.get(`/api/player-profile/${id}`);
          const jerseyRes = await axios.get(`/api/player-profile/seasonstats?playerProfilesId=${id}`);
          const playerData = response.data.profile || response.data.data || response.data;
          const jerseyData = jerseyRes.data.seasons || jerseyRes.data.data || jerseyRes.data;
          const jerseyInfo = jerseyData?.[0]?.season?.jerseyNo || null;
          const player: ExtendedPlayer = {
            id, type: "PLAYER",
            name: playerData.name || "Unknown",
            playerName: playerData.name,
            jerseyNumber: jerseyInfo || playerData.jerseyNumber || "--",
            role: playerData.specialization || playerData.overview?.specialization || playerData.bowlingStyle || "Player",
            runs: parseInt(playerData.stats?.runs) || 0,
            strikeRate: parseFloat(playerData.stats?.sr) || 0,
            age: parseInt(playerData.overview?.dob) || 25,
            medals: 0,
            team: playerData.team || "IPL Team",
            specialization: playerData.specialization || playerData.overview?.specialization || "All-rounder",
          };
          player.jerseyColor = getJerseyColor(player.name, player.team);
          return player;
        }
      } catch (err) {
        console.error(`Error fetching ${isClubBattle ? "club" : "player"} ${id}:`, err);
        return null;
      }
    });
    const items = (await Promise.all(promises)).filter(Boolean) as ExtendedPlayer[];
    setCurrentItems(items);
    setCurrentIndex(0);
    setBattleStats({ voted: 0, skipped: 0, pointsGiven: 0 });
    pendingVotePromises.current = [];
  } catch (err) {
    console.error("Error in fetchItemsForBattle:", err);
    setCurrentItems([]);
  }
};

const recordVote = useCallback(
  (item: ExtendedPlayer, direction: "left" | "right"): Promise<void> => {
    if (!user?.userId || !playableBattles[currentBattleIndex]) return Promise.resolve();
    const battleId = playableBattles[currentBattleIndex].id;

    if (direction === "right" && votedPlayerIds.has(item.id)) {
      showToast("Already voted for this item!", "error");
      return Promise.resolve();
    }

    const promise = (async () => {
      try {
        const res = await axios.post("/api/battle/battle-vote", {
          battleId,
          playerId: item.id,
          playerName: item.name,
          userId: user.userId,
          userEmail: user.email || "",
          userName: user.name || getUserDisplayName() || "User",
          direction,
        });

        if (res.data.success) {
          if (direction === "right") {
            const pts = res.data.playerPointsAwarded || 15;
            showToast(`+${pts} pts for ${item.name}!`, "success");
            emitSxpActivityRefresh();
            setVotedPlayerIds((prev) => new Set([...prev, item.id]));
            setBattleStats((prev) => ({
              voted: prev.voted + 1,
              skipped: prev.skipped,
              pointsGiven: prev.pointsGiven + pts,
            }));
            fetchLeaderboard(battleId);
          } else {
            showToast(`Skipped ${item.name}`, "skip");
            setBattleStats((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
          }
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data?.alreadyVoted) {
          showToast("Already voted for this item!", "error");
        } else {
          showToast("Error recording vote", "error");
        }
      }
    })();

    pendingVotePromises.current.push(promise);
    return promise;
  },
  [user, playableBattles, currentBattleIndex, votedPlayerIds, fetchLeaderboard, refreshLeaderboard, getUserDisplayName]
);



const switchToNextBattle = useCallback(async () => {
  await Promise.allSettled(pendingVotePromises.current);

  // Mark current battle as completed
  const currentBattle = playableBattles[currentBattleIndex];
  if (currentBattle && user?.userId) {
    try {
      await axios.post("/api/battle/battle-session", {
        battleId: currentBattle.id,
        userId: user.userId,
        userName: user.name || getUserDisplayName(),
        userEmail: user.email || "",
      });
      onBattleComplete?.();
      console.log("Battle marked as completed:", currentBattle.id);
    } catch (err) {
      console.error("Error marking battle as completed:", err);
    }
  }
 await refreshLeaderboard();
  const justFinishedName = playableBattles[currentBattleIndex]?.battleName || "Battle";
  setCompletedBattleName(justFinishedName);
  setPlayableBattles((prev) => prev.filter((_, i) => i !== currentBattleIndex));
  setShowBattleResult(true);
}, [currentBattleIndex, playableBattles, user, getUserDisplayName, refreshLeaderboard]);

// ── Play next: next battle is now at currentBattleIndex after removal ──────
const handlePlayNextBattle = useCallback(() => {
  // After removal in switchToNextBattle, the next battle is at currentBattleIndex
  // (the list shifted left, so no increment needed)
  const next = playableBattles[currentBattleIndex];
  if (next) {
    fetchItemsForBattle(next);
    fetchLeaderboard(next.id);
    setCurrentIndex(0);
    setShowBattleResult(false);
  }
}, [currentBattleIndex, playableBattles, fetchLeaderboard]);

const currentItem = currentItems[currentIndex];
const color = currentItem?.jerseyColor || getJerseyColor("Default");

const startScan = useCallback(
  (index: number) => {
    if (!currentItems[index]) return;
    setIsScanning(true);
    let count = 0;
    if (scanInterval.current) clearInterval(scanInterval.current);
    scanInterval.current = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 99) + 1);
      count++;
      if (count >= 18) {
        clearInterval(scanInterval.current!);
        setDisplayNumber(currentItems[index].jerseyNumber || "--");
        setIsScanning(false);
      }
    }, 60);
  },
  [currentItems]
);

useEffect(() => {
  if (currentItem && currentItem.type === "PLAYER") {
    setDisplayNumber(currentItem.jerseyNumber || "--");
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
    scanTimeout.current = setTimeout(() => startScan(currentIndex), 300);
    const interval = setInterval(() => startScan(currentIndex), 3000);
    return () => {
      clearInterval(interval);
      if (scanInterval.current) clearInterval(scanInterval.current);
      if (scanTimeout.current) clearTimeout(scanTimeout.current);
    };
  } else if (currentItem && currentItem.type === "CLUB") {
    setDisplayNumber("🏆");
    setIsScanning(false);
  }
}, [currentIndex, currentItem, startScan]);

const animateSwipe = useCallback(
  (dir: "left" | "right") => {
    if (isAnimatingOut || !currentItems.length) return;
    const currentPlayer = currentItems[currentIndex];
    const isLastCard = currentIndex + 1 >= currentItems.length;

    setSwipeDir(dir);
    setIsAnimatingOut(true);
    setIsDragging(false);
    setDragX(0);

    const votePromise = currentPlayer ? recordVote(currentPlayer, dir) : Promise.resolve();

    setTimeout(() => {
      setIsAnimatingOut(false);
      setSwipeDir(null);
      dragXRef.current = 0;

      if (!isLastCard) {
        setCurrentIndex((p) => p + 1);
      } else {
        // Last card: wait for final vote then show result
        votePromise.finally(() => {
          switchToNextBattle();
        });
      }
    }, 300);
  },
  [isAnimatingOut, currentIndex, currentItems, recordVote, switchToNextBattle]
);

// ── Touch events ───────────────────────────────────────────────────────────
useEffect(() => {
  const card = cardRef.current;
  if (!card) return;
  let touchStartX = 0;
  let touchStartY = 0;
  const handleTouchStart = (e: TouchEvent) => {
    if (isAnimatingOut) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDraggingRef.current = true;
    lockAxis.current = null;
    dragXRef.current = 0;
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current || isAnimatingOut) return;
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    if (!lockAxis.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      lockAxis.current = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    }
    if (lockAxis.current === "h") {
      e.preventDefault();
      dragXRef.current = deltaX;
      setDragX(deltaX);
      setIsDragging(true);
    }
  };
  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    const deltaX = dragXRef.current;
    if (lockAxis.current === "h" && Math.abs(deltaX) > 50 && !isAnimatingOut) {
      if (deltaX < 0) animateSwipe("left");
      else if (deltaX > 0) animateSwipe("right");
    }
    setIsDragging(false);
    setDragX(0);
    dragXRef.current = 0;
    isDraggingRef.current = false;
    lockAxis.current = null;
  };
  const handleTouchCancel = () => {
    setIsDragging(false);
    setDragX(0);
    dragXRef.current = 0;
    isDraggingRef.current = false;
    lockAxis.current = null;
  };
  card.addEventListener("touchstart", handleTouchStart, { passive: true });
  card.addEventListener("touchmove", handleTouchMove, { passive: false });
  card.addEventListener("touchend", handleTouchEnd);
  card.addEventListener("touchcancel", handleTouchCancel);
  return () => {
    card.removeEventListener("touchstart", handleTouchStart);
    card.removeEventListener("touchmove", handleTouchMove);
    card.removeEventListener("touchend", handleTouchEnd);
    card.removeEventListener("touchcancel", handleTouchCancel);
  };
}, [animateSwipe, isAnimatingOut]);

const handlePointerDown = (e: React.PointerEvent) => {
  if (isAnimatingOut) return;
  startX.current = e.clientX;
  isDraggingRef.current = true;
  dragXRef.current = 0;
  setIsDragging(true);
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
};
const handlePointerMove = (e: React.PointerEvent) => {
  if (!isDraggingRef.current || isAnimatingOut) return;
  const deltaX = e.clientX - startX.current;
  dragXRef.current = deltaX;
  setDragX(deltaX);
};
const handlePointerUp = (e: React.PointerEvent) => {
  if (!isDraggingRef.current) return;
  const deltaX = dragXRef.current;
  if (Math.abs(deltaX) > 50 && !isAnimatingOut) {
    if (deltaX < 0) animateSwipe("left");
    else if (deltaX > 0) animateSwipe("right");
  }
  setIsDragging(false);
  setDragX(0);
  dragXRef.current = 0;
  isDraggingRef.current = false;
};

const getCardTransform = (): React.CSSProperties => {
  if (isAnimatingOut) {
    return {
      transform: `translateX(${swipeDir === "left" ? -500 : 500}px) rotate(${swipeDir === "left" ? -15 : 15}deg)`,
      opacity: 0,
      transition: "transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1), opacity 0.25s ease",
    };
  }
  if (isDragging && dragX !== 0) {
    const rotate = dragX * 0.03;
    return { transform: `translateX(${dragX}px) rotate(${rotate}deg)`, transition: "none", cursor: "grabbing" };
  }
  return {
    transform: "translateX(0px) rotate(0deg)", opacity: 1,
    transition: "transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), opacity 0.2s ease",
    cursor: "grab",
  };
};

const likeOpacity = dragX > 30 ? Math.min((dragX - 30) / 70, 1) : 0;
const skipOpacity = dragX < -30 ? Math.min((-dragX - 30) / 70, 1) : 0;
const alreadyVoted = currentItem ? votedPlayerIds.has(currentItem.id) : false;

// ── Guards ─────────────────────────────────────────────────────────────────
if (showCreate) return <CreateBattle onClose={() => setShowCreate(false)} />;

if (loading || authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
        <p className="text-gray-400">Loading battles...</p>
      </div>
    </div>
  );
}

if (battles.length === 0) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070f] px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-[#1a1a2e] flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚔️</span>
        </div>
        <h2 className="text-white text-xl font-bold mb-2">No Battles Available</h2>
        <p className="text-gray-400 text-sm mb-6">
          {!user?.userId
            ? "Sign in to create battles and challenge friends!"
            : "Create a battle to start voting and competing!"}
        </p>
        {user?.userId && (
          <button onClick={() => setShowCreate(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold">
            Create Your First Battle
          </button>
        )}
      </div>
    </div>
  );
}

// ── All battles played — shown on refresh OR after finishing last battle ───
// showBattleResult must be checked BEFORE this so the result screen
// still renders after the last battle is removed from playableBattles
if (!showBattleResult && playableBattles.length === 0) {
  return (
    <AlreadyPlayedScreen
      onCreateBattle={() => setShowCreate(true)}
      isLoggedIn={!!user?.userId}
    />
  );
}

// ── Battle result screen ───────────────────────────────────────────────────
if (showBattleResult) {
  // After removal in switchToNextBattle, next battle is now at currentBattleIndex
  const nextBattle = playableBattles[currentBattleIndex];
  const hasNext = !!nextBattle;
  const nextItemCount = nextBattle
    ? (nextBattle.battleType === "CLUBS" ? nextBattle.selectedClubs : nextBattle.selectedPlayers).length
    : 0;

  return (
    <BattleResultScreen
      battleName={completedBattleName}
      votedCount={battleStats.voted}
      skippedCount={battleStats.skipped}
      pointsGiven={battleStats.pointsGiven}
      hasNextBattle={hasNext}
      nextBattle={nextBattle}
      nextBattleIndex={hasNext ? currentBattleIndex + 1 : undefined}
      totalBattles={playableBattles.length + 1} // +1 since current was already removed
      nextItemCount={nextItemCount}
      onPlayNext={handlePlayNextBattle}
      onCreateBattle={() => {
        setShowBattleResult(false);
        setShowCreate(true);
      }}
      isLoggedIn={!!user?.userId}
    />
  );
}

if (!currentItems.length || !currentItem) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
        <p className="text-gray-400">Loading items...</p>
      </div>
    </div>
  );
}

// ── Main card UI ───────────────────────────────────────────────────────────
return (
  <div className="min-h-screen flex flex-col items-center justify-start bg-[#07070f] py-6 px-4 select-none overflow-hidden">
    {toast && <Toast message={toast.message} type={toast.type} />}
    {showHowItWorks && <HowFanBattleWorksModal onClose={() => setShowHowItWorks(false)} />}
    {showLeaderboard && (
      <LeaderboardModal
        battleName={playableBattles[currentBattleIndex]?.battleName || "Battle"}
        leaderboard={leaderboard}
        votedPlayerIds={Array.from(votedPlayerIds)}
        onClose={() => setShowLeaderboard(false)}
      />
    )}

    <div className="w-full max-w-sm flex flex-col items-start sm:items-center justify-between gap-3 sm:gap-0 mb-5">
      <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
        <p className="text-gray-500 text-lg sm:text-2xl font-bold mt-0.5 flex-1 sm:flex-none truncate">
          {playableBattles[currentBattleIndex]?.battleName
            ? playableBattles[currentBattleIndex].battleName.charAt(0).toUpperCase() +
            playableBattles[currentBattleIndex].battleName.slice(1)
            : "Swipe to support"}
        </p>
        <button
          onClick={() => setShowHowItWorks(true)}
          className="flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-pink-400 transition-colors flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, fontWeight: 700 }}
          aria-label="How Fan Battle Works"
        >
          i
        </button>
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <button
          onClick={() => setShowCreate(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-pink-500 border border-pink-600 bg-transparent text-xs sm:text-sm font-medium hover:bg-pink-600/10 hover:shadow-[0_0_10px_rgba(236,72,153,0.4)] transition-all duration-200"
        >
          <Pencil className="w-3 h-3" />
          <span>Create</span>
        </button>
        <button
          onClick={() => { }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-pink-500 border border-pink-600 bg-transparent text-xs sm:text-sm font-medium hover:bg-pink-600/10 hover:shadow-[0_0_10px_rgba(236,72,153,0.4)] transition-all duration-200"
        >
          <Users className="w-3 h-3" />
          <span>Invite</span>
        </button>
      </div>
    </div>

    {playableBattles.length > 1 && (
      <div className="w-full max-w-sm mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Battle {currentBattleIndex + 1} of {playableBattles.length}</span>
          <span>{currentIndex + 1}/{currentItems.length} items</span>
        </div>
        <div className="w-full h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-orange-500 rounded-full transition-all duration-300"
            style={{
              width: `${((currentBattleIndex * currentItems.length + currentIndex + 1) /
                (playableBattles.length * currentItems.length)) * 100}%`,
            }}
          />
        </div>
      </div>
    )}

    <div className="w-full max-w-sm relative" style={{ perspective: "1200px" }}>
      <div className="absolute inset-0 rounded-2xl"
        style={{ background: "#0c091a", border: "1px solid rgba(255,255,255,0.05)", transform: "scale(0.94) translateY(12px)", zIndex: 0 }} />
      <div className="absolute inset-0 rounded-2xl"
        style={{ background: "#0a0814", border: "1px solid rgba(255,255,255,0.04)", transform: "scale(0.97) translateY(6px)", zIndex: 1 }} />

      <div
        ref={cardRef}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(150deg, #130820 0%, #0c0c1a 45%, #150a0a 100%)",
          border: `1px solid ${color.stroke}44`,
          boxShadow: `0 0 60px ${color.glow}, 0 24px 60px rgba(0,0,0,0.7), inset 0 0 50px rgba(0,0,0,0.5)`,
          zIndex: 2,
          minHeight: 410,
          willChange: "transform",
          touchAction: "pan-y pinch-zoom",
          ...getCardTransform(),
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {["top-3 left-3 border-t-2 border-l-2", "top-3 right-3 border-t-2 border-r-2",
          "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"].map((cls, i) => (
            <div key={i} className={`absolute w-5 h-5 ${cls} rounded-sm`} style={{ borderColor: `${color.stroke}70` }} />
          ))}
        <div className="absolute left-4 top-1/2 w-1.5 h-1.5 rounded-full" style={{ background: `${color.stroke}55` }} />
        <div className="absolute right-4 top-1/2 w-1.5 h-1.5 rounded-full" style={{ background: `${color.stroke}55` }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color.stroke}cc, transparent)` }} />

        {alreadyVoted && (
          <div className="absolute top-3 left-1/2 z-20 px-3 py-1 rounded-full text-[10px] font-bold"
            style={{ transform: "translateX(-50%)", background: "rgba(74,222,128,0.15)", border: "1px solid #4ade8066", color: "#4ade80" }}>
            ✓ Voted
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-start pl-7 pointer-events-none z-10"
          style={{ opacity: likeOpacity, transition: isDragging ? "none" : "opacity 0.15s" }}>
          <div className="font-black text-2xl tracking-widest border-4 rounded-xl px-4 py-2"
            style={{ borderColor: "#4ade80", color: "#4ade80", transform: "rotate(-14deg)", textShadow: "0 0 12px rgba(74,222,128,0.5)" }}>
            +15 PTS
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-end pr-7 pointer-events-none z-10"
          style={{ opacity: skipOpacity, transition: isDragging ? "none" : "opacity 0.15s" }}>
          <div className="font-black text-2xl tracking-widest border-4 rounded-xl px-4 py-2"
            style={{ borderColor: "#f87171", color: "#f87171", transform: "rotate(14deg)", textShadow: "0 0 12px rgba(248,113,113,0.5)" }}>
            SKIP
          </div>
        </div>

        <div className="flex flex-col items-center pt-8 pb-5 px-5">
          <div className="relative flex items-center justify-center mb-4" style={{ width: 250, height: 250 }}>
            <div className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at center, ${color.glow} 0%, transparent 68%)`, filter: "blur(16px)", transform: "scale(1.4)" }} />
            {currentItem?.type === "CLUB" ? (
              <img src={currentItem.avatar || "/images/default-club.png"} alt={currentItem.name}
                className="w-[200px] h-[200px] object-contain relative z-10 rounded-2xl" draggable={false} />
            ) : (
              <>
                <img
                  src={getJerseys.find((j) => j.team === currentItem?.team)?.path || "/images/MI1.png"}
                  alt={currentItem?.team || "Jersey"}
                  className="w-[320px] h-[320px] object-contain relative z-10"
                  draggable={false}
                />
                <div className="absolute inset-0 flex items-center justify-center pt-5 z-20 pointer-events-none">
                  <span className="text-white font-bold font-mono"
                    style={{
                      fontSize: isScanning ? "30px" : "36px",
                      opacity: isScanning ? 0.6 : 1,
                      filter: isScanning ? "blur(0.8px)" : "none",
                      transition: isScanning ? "none" : "all 0.2s",
                      textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    }}>
                    {displayNumber}
                  </span>
                </div>
                {isScanning && (
                  <div className="absolute left-2 right-2 h-px pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent, ${color.stroke}cc, transparent)`, animation: "scanLine 0.18s linear infinite", top: "50%" }} />
                )}
              </>
            )}
          </div>

          <h2 className="text-white text-lg font-bold text-center leading-snug">{currentItem.name}</h2>
          <p className="text-gray-500 text-xs mt-1 text-center">{currentItem.team || "IPL"}</p>
          <div className="flex items-center gap-2 mt-3 mb-4">
            <span className="text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-sm"
              style={{ background: `linear-gradient(90deg, ${color.from}, ${color.to})` }}>
              {currentItem.role || currentItem.specialization || (currentItem.type === "CLUB" ? "IPL FRANCHISE" : "PLAYER")}
            </span>
            <span className="text-gray-500 text-xs">
              • {currentItem.type === "CLUB" ? "Indian Premier League" : "India Cricket"}
            </span>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 mb-3">
            {currentItem?.type === "CLUB" ? (
              <>
                <div className="flex flex-col items-center justify-center rounded-xl py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-white text-sm font-bold leading-tight">{currentItem.stats?.runs || "0"}</span>
                  <span className="text-gray-600 text-[9px] font-bold tracking-widest mt-0.5">RUNS</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-white text-sm font-bold leading-tight">{currentItem.stats?.sr || "0"}</span>
                  <span className="text-gray-600 text-[9px] font-bold tracking-widest mt-0.5">STRIKE RATE</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-white text-sm font-bold leading-tight">{currentItem.stats?.avg || "0"}</span>
                  <span className="text-gray-600 text-[9px] font-bold tracking-widest mt-0.5">AVERAGE</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center rounded-xl py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-white text-sm font-bold leading-tight">{currentItem.runs?.toLocaleString() || "0"}</span>
                  <span className="text-gray-600 text-[9px] font-bold tracking-widest mt-0.5">RUNS</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-white text-sm font-bold leading-tight">
                    {typeof currentItem.strikeRate === "number"
                      ? currentItem.strikeRate.toFixed(1)
                      : currentItem.strikeRate || "0.0"}
                  </span>
                  <span className="text-gray-600 text-[9px] font-bold tracking-widest mt-0.5">STRIKE RATE</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-white text-sm font-bold leading-tight">{currentItem.age || 25}</span>
                  <span className="text-gray-600 text-[9px] font-bold tracking-widest mt-0.5">AGE</span>
                </div>
              </>
            )}
          </div>

          {currentItem?.type === "CLUB" && currentItem.overview && (
            <div className="w-full mt-2 p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-gray-400 text-[10px] text-center">
                🏟️ {currentItem.overview.venue} | 👤 {currentItem.overview.captain}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="w-full max-w-sm mt-4 flex items-center justify-between px-5 py-3.5 rounded-2xl"
      style={{ background: "#0e0e18", border: "1px solid rgba(255,255,255,0.06)" }}>
      <button onClick={() => animateSwipe("left")}
        className="flex items-center gap-2 text-gray-400 text-xs font-medium hover:text-white transition-colors group">
        <span className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-700 group-hover:border-gray-500 transition-colors text-sm"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          ←
        </span>
        Skip
      </button>
      <div className="text-center">
        <p className="text-[10px] text-gray-600 font-bold tracking-widest">SWIPE RIGHT</p>
        <p className="text-xs font-black" style={{ color: color.stroke }}>+15 PTS</p>
      </div>
      <button
        onClick={() => animateSwipe("right")}
        className="flex items-center gap-2 text-xs font-semibold transition-colors"
        style={{ color: alreadyVoted ? "#6b7280" : color.stroke }}
        disabled={alreadyVoted}
      >
        {alreadyVoted ? "Voted ✓" : "Like"}
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
          style={{
            background: alreadyVoted
              ? "rgba(107,114,128,0.3)"
              : `linear-gradient(135deg, ${color.from}, ${color.to})`,
            boxShadow: alreadyVoted ? "none" : `0 0 14px ${color.glow}`,
          }}>
          →
        </span>
      </button>
    </div>

    <p className="text-gray-700 text-[9px] tracking-widest mt-3 uppercase">
      Swipe right to give +15 pts • Left to skip
    </p>

    <div className="flex gap-1.5 mt-2.5">
      {currentItems.map((item, i) => (
        <button
          key={item.id}
          onClick={() => !isAnimatingOut && setCurrentIndex(i)}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === currentIndex ? 18 : 6,
            height: 6,
            background: votedPlayerIds.has(item.id)
              ? "#4ade80"
              : i === currentIndex
                ? (item.jerseyColor?.stroke || "#f472b6")
                : "rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </div>

    <style>{`
        @keyframes scanLine { 0% { top: 22%; } 50% { top: 78%; } 100% { top: 22%; } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.92); } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
  </div>
);
}
