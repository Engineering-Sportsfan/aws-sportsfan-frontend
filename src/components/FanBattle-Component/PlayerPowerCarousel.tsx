"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

// Types
interface PlayerCard {
  id: string;
  name: string;
  points: number;
  delta: number;
  prevPoints: number;
  rank: number;
  prevRank: number;
  isLive?: boolean;
  trend: "up" | "down";
  type?: "PLAYER" | "CLUB";
  avatar?: string;
  team?: string;
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

interface PlayerPowerCarouselProps {
  onShowAll: () => void;
  fetchRef?: React.MutableRefObject<(() => void) | null>;
}

// Module-level caches — persist across re-renders and re-mounts
interface CachedProfile {
  id: string;
  name: string;
  type: "PLAYER" | "CLUB";
  team: string;
  avatar?: string;
}
const profileCache = new Map<string, CachedProfile>();
const leaderboardCache = new Map<string, { data: LeaderboardEntry[]; ts: number }>();
const LEADERBOARD_TTL = 30_000;

// Icons
const LightningIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#00e676">
    <path d="M13 2L4.09 12.96H11L10 22L20.91 11.04H14L13 2Z" />
  </svg>
);

const TrendArrow: React.FC<{ trend: "up" | "down" }> = ({ trend }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke={trend === "up" ? "#00e676" : "#ef5350"}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="flex-shrink-0"
  >
    {trend === "up" ? (
      <path d="M7 17L17 7M17 7H9M17 7V15" />
    ) : (
      <path d="M7 7L17 17M17 17H9M17 17V9" />
    )}
  </svg>
);

const RankCircle: React.FC<{
  rank: number;
  prevRank: number;
  delta: number;
  size?: number;
}> = ({ rank, prevRank, delta, size = 52 }) => {
  let borderColor = "#2a2a2a";
  let textColor = "#9ca3af";
  let glowColor = "transparent";

  if (delta >= 15) {
    borderColor = "#00e676";
    textColor = "#00e676";
    glowColor = "rgba(0, 230, 118, 0.35)";
  } else if (rank > prevRank) {
    borderColor = "#ef5350";
    textColor = "#ef5350";
    glowColor = "rgba(239, 83, 80, 0.35)";
  }

  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        border: `3px solid ${borderColor}`,
        background: "#121212",
        boxShadow:
          glowColor !== "transparent"
            ? `0 0 10px 2px ${glowColor}, inset 0 0 6px ${glowColor}`
            : "none",
      }}
    >
      <span style={{ color: textColor, fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
        {rank}
      </span>
    </div>
  );
};

const PowerCard: React.FC<{ item: PlayerCard }> = ({ item }) => (
  <div className="relative flex-shrink-0 w-[155px] rounded-2xl bg-[#1a1a1a] border border-[#252525] p-3.5 flex flex-col gap-2.5">
    {item.isLive && (
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#1f0a0a] border border-[#4a1a1a] rounded-full px-1.5 py-0.5 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e53935] animate-pulse" />
        <span className="text-[#e53935] text-[8px] font-bold tracking-widest uppercase">
          Live
        </span>
      </div>
    )}

    {item.type === "CLUB" && item.avatar && (
      <div className="absolute top-2 right-2 z-10 flex flex-col items-center">
        <img
          src={item.avatar}
          alt={item.name}
          className="w-10 h-10 rounded-full object-cover border border-[#252525]"
        />
        <div className="flex items-center gap-1 mt-1">
          <LightningIcon />
          <span className="text-[#00e676] text-[11px] font-bold">
            {item.points.toLocaleString()}
          </span>
        </div>
      </div>
    )}

    <div className="flex items-center gap-2.5">
      <RankCircle rank={item.rank} prevRank={item.prevRank} delta={item.delta} size={52} />
      <div className="flex flex-col min-w-0">
        {item.type !== "CLUB" && item.name && (
          <span className="text-white text-[11px] font-bold leading-tight line-clamp-2">
            {item.name}
          </span>
        )}
        {item.type !== "CLUB" && (
          <div className="flex items-center gap-1 mt-0.5">
            <LightningIcon />
            <span className="text-[#00e676] text-[13px] font-bold">
              {item.points.toLocaleString()}
            </span>
          </div>
        )}
        <span className="text-[#555] text-[8px] mt-0.5 truncate">{item.team}</span>
      </div>
    </div>

    <div className="flex items-center gap-1">
      <TrendArrow trend={item.trend} />
      <span
        className="text-[11px] font-semibold"
        style={{ color: item.trend === "up" ? "#00e676" : "#ef5350" }}
      >
        {item.trend === "up" ? "+" : ""}
        {Math.abs(item.delta)}
      </span>
      <span className="text-[#555] text-[10px]">from {item.prevPoints.toLocaleString()}</span>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[155px] rounded-2xl bg-[#1a1a1a] border border-[#252525] p-3.5 animate-pulse">
    <div className="flex items-center gap-2.5">
      <div className="w-[52px] h-[52px] rounded-full bg-[#252525] flex-shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3 bg-[#252525] rounded w-full" />
        <div className="h-2.5 bg-[#252525] rounded w-2/3" />
        <div className="h-2 bg-[#252525] rounded w-1/2" />
      </div>
    </div>
    <div className="h-2.5 bg-[#252525] rounded mt-3 w-3/4" />
  </div>
);

// Main Component
const PlayerPowerCarousel: React.FC<PlayerPowerCarouselProps> = ({ onShowAll, fetchRef }) => {
  const { user } = useAuth();
  const [powerItems, setPowerItems] = useState<PlayerCard[]>([]);
  const [loading, setLoading] = useState(true);

  const previousPointsRef = useRef<Map<string, number>>(new Map());
  const previousRanksRef = useRef<Map<string, number>>(new Map());
  const isFirstFetch = useRef(true);
  const inflightProfileFetches = useRef<Map<string, Promise<void>>>(new Map());

  const fetchLeaderboardForBattle = useCallback(
    async (battleId: string): Promise<LeaderboardEntry[]> => {
      // Return from cache if still fresh
      const cached = leaderboardCache.get(battleId);
      if (cached && Date.now() - cached.ts < LEADERBOARD_TTL) {
        return cached.data;
      }
      try {
        const res = await axios.get(
          `/api/battle/battle-vote?battleId=${battleId}&userId=${user?.userId || ""}`
        );
        if (res.data.success) {
          const data = res.data.leaderboard || [];
          leaderboardCache.set(battleId, { data, ts: Date.now() });
          return data;
        }
        return [];
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
        return inflightProfileFetches.current.get(id);
      }

      const fetchPromise = (async () => {
        try {
          if (battleType === "PLAYERS") {
            const response = await axios.get(`/api/player-profile/${id}`);
            const playerData = response.data.profile || response.data.data || response.data;
            profileCache.set(id, {
              id,
              name: playerData.name || "Unknown Player",
              type: "PLAYER",
              team: playerData.team || "IPL",
              avatar: undefined,
            });
          } else {
            const response = await axios.get(`/api/club-profile/${id}`);
            if (response.data.success) {
              const club = response.data.profile;
              profileCache.set(id, {
                id,
                name: club.name || "Unknown Club",
                type: "CLUB",
                team: club.team || "IPL",
                avatar: club.avatar,
              });
            }
          }
        } catch {
          // silently skip missing profiles
        } finally {
          inflightProfileFetches.current.delete(id);
        }
      })();

      inflightProfileFetches.current.set(id, fetchPromise);
      return fetchPromise;
    },
    []
  );

  const fetchPowerData = useCallback(async () => {
    try {
      if (isFirstFetch.current) {
        setLoading(true);
      }

      const battlesResponse = await axios.get(`/api/battle`);

      if (!battlesResponse.data.success || !battlesResponse.data.battles) {
        setPowerItems([]);
        setLoading(false);
        isFirstFetch.current = false;
        return;
      }

      const accessibleBattles: Battle[] = battlesResponse.data.battles;

      if (accessibleBattles.length === 0) {
        setPowerItems([]);
        setLoading(false);
        isFirstFetch.current = false;
        return;
      }

      // Collect unique IDs
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

      // Fetch profiles (cached after first load)
      await Promise.all(
        Array.from(idToBattleType.entries()).map(([id, battleType]) =>
          fetchProfileIfNeeded(id, battleType)
        )
      );

      // Fetch leaderboards (TTL cached)
      const pointsMap = new Map<string, number>();
      await Promise.all(
        accessibleBattles.map(async (battle) => {
          const leaderboard = await fetchLeaderboardForBattle(battle.id);
          for (const entry of leaderboard) {
            pointsMap.set(entry.playerId, (pointsMap.get(entry.playerId) || 0) + entry.points);
          }
        })
      );

      // Build items + sort top 20
      const itemsWithPoints = Array.from(idToBattleType.keys())
        .map((id) => {
          const cached = profileCache.get(id);
          if (!cached) return null;
          return { ...cached, points: pointsMap.get(id) || 0 };
        })
        .filter((item): item is CachedProfile & { points: number } => item !== null);

      itemsWithPoints.sort((a, b) => b.points - a.points);
      const top20 = itemsWithPoints.slice(0, 20);

      const items: PlayerCard[] = top20.map((item, index) => {
        const rank = index + 1;
        const points = item.points;
        const prevPoints = previousPointsRef.current.get(item.id) || points;
        const prevRank = previousRanksRef.current.get(item.id) || rank;
        const delta = points - prevPoints;

        return {
          id: item.id,
          name: item.name,
          points,
          delta: Math.abs(delta),
          prevPoints,
          rank,
          prevRank,
          isLive: delta >= 15,
          trend: delta >= 0 ? "up" : "down",
          type: item.type,
          avatar: item.avatar,
          team: item.team,
        };
      });

      const newPrevPoints = new Map<string, number>();
      const newPrevRanks = new Map<string, number>();
      items.forEach((item) => {
        newPrevPoints.set(item.id, item.points);
        newPrevRanks.set(item.id, item.rank);
      });
      previousPointsRef.current = newPrevPoints;
      previousRanksRef.current = newPrevRanks;

      setPowerItems(items);
      isFirstFetch.current = false;
    } catch (err) {
      console.error("Error fetching power data:", err);
      setPowerItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchLeaderboardForBattle, fetchProfileIfNeeded]);

  // Fetch once on mount
  useEffect(() => {
    fetchPowerData();
  }, [fetchPowerData]);

  // Expose refetch function to parent via fetchRef
  useEffect(() => {
    if (fetchRef) {
      fetchRef.current = () => {
        leaderboardCache.clear();
        fetchPowerData();
      };
    }
  }, [fetchRef, fetchPowerData]);

  const Header = () => (
    <div className="flex items-start justify-between mb-1">
      <div>
        <h2 className="text-white text-[15px] font-bold leading-tight">Power Rankings</h2>
        <p className="text-[#e53935] text-[11px] mt-0.5 leading-snug max-w-[220px]">
          Top 20 Players & Clubs by Power Points
        </p>
      </div>
      <button
        onClick={onShowAll}
        className="text-[#ff5722] text-[14px] font-bold hover:text-[#ff8a50] transition-colors whitespace-nowrap mt-1 flex-shrink-0 underline underline-offset-4"
      >
        Show All
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full bg-[#121212] px-4 pb-4">
        <Header />
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (powerItems.length === 0) {
    return (
      <div className="w-full bg-[#121212] px-4 pb-4">
        <Header />
        <div className="text-center py-8">
          <p className="text-[#555] text-sm">No power data available yet</p>
          <p className="text-[#666] text-xs mt-1">
            Create battles and vote to see power points!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#121212] px-4 pb-4">
      <Header />
      <p className="text-[#555] text-[11px] mb-3 leading-relaxed">
        Players and Clubs earn Power Points when fans vote for them in battles on SportsFan360.
      </p>

      <div className="overflow-hidden relative w-full pb-1">
        <style>{`
          @keyframes infinite-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: infinite-scroll 45s linear infinite;
            width: max-content;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="flex gap-3 animate-scroll">
          {[...powerItems, ...powerItems].map((item, index) => (
            <PowerCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerPowerCarousel;