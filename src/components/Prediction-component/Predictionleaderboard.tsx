"use client";

import { useState } from "react";
import { LeaderboardEntry } from "@/types/Polls";

const MOCK_FRIENDS: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "f1",
    username: "Priya_IPL",
    initials: "PI",
    avatarColor: "#0891b2",
    totalPoints: 760,
    correctPredictions: 11,
    totalPredictions: 16,
    rankChange: 1,
  },
  {
    rank: 2,
    userId: "f2",
    username: "Arjun_Bets",
    initials: "AB",
    avatarColor: "#16a34a",
    totalPoints: 640,
    correctPredictions: 9,
    totalPredictions: 16,
    rankChange: 0,
  },
];

const MOCK_MY_TEAM: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "t1",
    username: "TeamCaptain",
    initials: "TC",
    avatarColor: "#7c3aed",
    totalPoints: 880,
    correctPredictions: 13,
    totalPredictions: 16,
    rankChange: 0,
  },
];

const TABS = ["Global", "Friends", "My Team"] as const;
type Tab = (typeof TABS)[number];

// Helper to generate a consistent color from string
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

// ─── Medal icon ────────────────────────────────────────────────────────────────

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-base">🥇</span>;
  if (rank === 2) return <span className="text-base">🥈</span>;
  if (rank === 3) return <span className="text-base">🥉</span>;
  return null;
}

// ─── Single row ────────────────────────────────────────────────────────────────

function LeaderRow({ entry, currentUserRank }: { entry: LeaderboardEntry; currentUserRank?: number }) {
  const showRank = entry.rank <= 3;

  return (
    <div
      className={[
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
        entry.isCurrentUser
          ? "bg-[#e91e8c]/8 border border-[#e91e8c]/20"
          : "hover:bg-white/4",
      ].join(" ")}
    >
      {/* Rank */}
      <div className="w-7 flex-shrink-0 flex items-center justify-center">
        {showRank ? (
          <Medal rank={entry.rank} />
        ) : (
          <span className="text-xs text-white/30 font-mono">
            {entry.isCurrentUser && currentUserRank ? `#${currentUserRank}` : `#${entry.rank}`}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
        style={{ backgroundColor: entry.avatarColor }}
      >
        {entry.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={[
            "text-sm font-semibold truncate",
            entry.isCurrentUser ? "text-[#e879f9]" : "text-white",
          ].join(" ")}
        >
          {entry.username}
        </p>
        <p className="text-[11px] text-white/35 truncate">
          {entry.correctPredictions}/{entry.totalPredictions} correct
          {entry.streak ? ` · ${entry.streak}` : ""}
          {entry.isCurrentUser && entry.pointsToday
            ? ` · +${entry.pointsToday} today`
            : ""}
        </p>
      </div>

      {/* Points + rank change */}
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-black text-white">{entry.totalPoints}</p>
        {entry.rankChange !== undefined && entry.rankChange !== 0 && (
          <p
            className={[
              "text-[10px] font-semibold",
              entry.rankChange > 0 ? "text-emerald-400" : "text-red-400",
            ].join(" ")}
          >
            {entry.rankChange > 0 ? `▲ ${entry.rankChange}` : `▼ ${Math.abs(entry.rankChange)}`}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Leaderboard ──────────────────────────────────────────────────────────

export interface PredictionLeaderboardProps {
  initialTotalParticipants?: number;
  initialCurrentUserRank?: number;
  initialCurrentUserPoints?: number;
}

import { useEffect } from "react";

export default function PredictionLeaderboard({
  initialTotalParticipants = 0,
  initialCurrentUserRank = 0,
  initialCurrentUserPoints = 0,
}: PredictionLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Global");
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(initialTotalParticipants);
  const [currentUserData, setCurrentUserData] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        const json = await res.json();
        if (json.success && json.data) {
          interface RawLeaderboardEntry {
            userId: string;
            username: string;
            totalPoints: number;
            correctPredictions: number;
            totalPredictions: number;
            rank: number;
          }
          const mappedEntries = json.data.entries.map((e: RawLeaderboardEntry) => ({
            ...e,
            initials: e.username.substring(0, 2).toUpperCase(),
            avatarColor: stringToColor(e.userId),
          }));
          setGlobalEntries(mappedEntries);
          setTotalParticipants(json.data.totalParticipants);
          if (json.data.currentUser) {
            const current = json.data.currentUser;
            setCurrentUserData({
              ...current,
              initials: current.username.substring(0, 2).toUpperCase(),
              avatarColor: "#e91e8c",
              isCurrentUser: true,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const entries = activeTab === "Global" ? globalEntries : activeTab === "Friends" ? MOCK_FRIENDS : MOCK_MY_TEAM;
  const currentUser = activeTab === "Global" ? currentUserData : entries.find((e) => e.isCurrentUser);
  const topEntries = entries.filter((e) => !e.isCurrentUser).slice(0, 5);
  const hiddenCount = Math.max(0, entries.filter((e) => !e.isCurrentUser).length - topEntries.length);
  const currentUserRank = currentUser ? currentUser.rank : initialCurrentUserRank;

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-[#0d0d1a] border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-[#0a0a16]">
        <div>
          <h2 className="text-base font-bold text-white">Fan Prediction Board</h2>
          <p className="text-[11px] text-white/35 mt-0.5">
            {totalParticipants.toLocaleString()} participants · Updates live
          </p>
        </div>
        {(currentUserRank > 0) && (
          <div className="text-right">
            <p className="text-[11px] text-white/35">Your rank</p>
            <p className="text-sm font-black text-[#e879f9]">#{currentUserRank}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-3 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
              activeTab === tab
                ? "bg-[#e91e8c] text-white"
                : "bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/80",
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="px-2 pb-2 space-y-0.5 min-h-[150px]">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-white/30 text-sm">Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-white/30 text-sm">No predictions yet</div>
        ) : (
          <>
            {topEntries.map((entry) => (
              <LeaderRow key={entry.userId} entry={entry} currentUserRank={currentUserRank} />
            ))}
          </>
        )}

        {/* Hidden rows indicator */}
        {hiddenCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-7" />
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-white/8" />
              ))}
            </div>
            <p className="text-[11px] text-white/30">{hiddenCount} more fans</p>
          </div>
        )}

        {/* Divider */}
        {currentUser && <div className="my-1 border-t border-white/6" />}

        {/* Current user pinned at bottom */}
        {currentUser && (
          <LeaderRow entry={currentUser} currentUserRank={currentUserRank} />
        )}
      </div>
    </div>
  );
}