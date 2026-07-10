"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export interface LeaderboardUser {
  userId: string;
  userName: string;
  userEmail: string;
  totalPoints: number;
  rank: number;
}

interface LeaderboardContextType {
  leaderboard: LeaderboardUser[];
  currentUserRank: number | null;
  currentUserPoints: number | null;
  loading: boolean;
  refreshLeaderboard: () => Promise<void>;
  addLocalPoints: (points: number) => void;
}

// ── Module-level cache (survives re-renders, resets on page reload) ────────────
// Keyed by userId so switching accounts always gets fresh data.
interface CacheEntry {
  ts: number;
  points: number;
  rank: number;
}
const USER_CACHE = new Map<string, CacheEntry>();
const USER_CACHE_TTL = 60_000; // 1 minute

let leaderboardCache: { ts: number; data: LeaderboardUser[] } | null = null;
const LEADERBOARD_CACHE_TTL = 120_000; // 2 minutes

const normalizeLeaderboard = (rows: LeaderboardUser[]): LeaderboardUser[] =>
  [...rows]
    .sort((a, b) => {
      const pointDiff = (Number(b.totalPoints) || 0) - (Number(a.totalPoints) || 0);
      if (pointDiff !== 0) return pointDiff;

      const aRank = Number(a.rank) || Number.MAX_SAFE_INTEGER;
      const bRank = Number(b.rank) || Number.MAX_SAFE_INTEGER;
      return aRank - bRank;
    })
    .map((user, index) => ({
      ...user,
      totalPoints: Number(user.totalPoints) || 0,
      rank: index + 1,
    }));

const sameUserId = (a: string | number | undefined, b: string | number | undefined) =>
  a !== undefined && b !== undefined && String(a) === String(b);

// ─────────────────────────────────────────────────────────────────────────────

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(
  undefined
);

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, authReady } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUserPoints, setCurrentUserPoints] = useState<number | null>(
    null
  );
  // loading = true only while the fast-path (user points) is in flight
  const [loading, setLoading] = useState(false);

  // Prevent duplicate in-flight requests
  const userFetchInProgress = useRef(false);
  const leaderboardFetchInProgress = useRef(false);

  // ── Fetch just the current user's points (fast, single-row query) ───────────
  const fetchCurrentUser = useCallback(
    async (userId: string): Promise<CacheEntry | null> => {
      // Return cached value if still fresh
      const cached = USER_CACHE.get(userId);
      if (cached && Date.now() - cached.ts < USER_CACHE_TTL) {
        setCurrentUserPoints(cached.points);
        setCurrentUserRank(cached.rank);
        return cached;
      }

      // Guard against concurrent calls
      if (userFetchInProgress.current) return null;
      userFetchInProgress.current = true;

      try {
        const res = await axios.get(
          `/api/user-points?userId=${encodeURIComponent(userId)}`
        );
        if (res.data.success && res.data.user) {
          const entry: CacheEntry = {
            ts: Date.now(),
            points: res.data.user.totalPoints,
            rank: res.data.user.rank,
          };
          USER_CACHE.set(userId, entry);
          setCurrentUserPoints(entry.points);
          setCurrentUserRank(entry.rank);
          return entry;
        }
      } catch (error) {
        console.error("Error fetching current user points:", error);
      } finally {
        userFetchInProgress.current = false;
      }
      return null;
    },
    [] // stable — no external deps
  );

  // ── Fetch full leaderboard (heavier, runs in background) ───────────────────
  const fetchFullLeaderboard = useCallback(
    async (userId: string): Promise<LeaderboardUser[]> => {
      // Return cached leaderboard if still fresh
      if (
        leaderboardCache &&
        Date.now() - leaderboardCache.ts < LEADERBOARD_CACHE_TTL
      ) {
        setLeaderboard(leaderboardCache.data);
        const found = leaderboardCache.data.find((u) => sameUserId(u.userId, userId));
        if (found) {
          USER_CACHE.set(userId, {
            ts: Date.now(),
            points: found.totalPoints,
            rank: found.rank,
          });
          setCurrentUserPoints(found.totalPoints);
          setCurrentUserRank(found.rank);
        }
        return leaderboardCache.data;
      }

      if (leaderboardFetchInProgress.current) return [];
      leaderboardFetchInProgress.current = true;

      try {
        const res = await axios.get(`/api/user-points?limit=100`);
        if (res.data.success && res.data.leaderboard) {
          const data = normalizeLeaderboard(res.data.leaderboard);
          leaderboardCache = { ts: Date.now(), data };
          setLeaderboard(data);

          const found = data.find((u) => sameUserId(u.userId, userId));
          if (found) {
            USER_CACHE.set(userId, {
              ts: Date.now(),
              points: found.totalPoints,
              rank: found.rank,
            });
            setCurrentUserPoints(found.totalPoints);
            setCurrentUserRank(found.rank);
          }

          return data;
        }
      } catch (error) {
        console.error("Error fetching full leaderboard:", error);
      } finally {
        leaderboardFetchInProgress.current = false;
      }
      return [];
    },
    [] // stable
  );

  
  // ── Main orchestrator ───────────────────────────────────────────────────────
  const fetchGlobalLeaderboard = useCallback(async () => {
    const userId = user?.userId;

    if (!userId) {
      setLeaderboard([]);
      setCurrentUserRank(null);
      setCurrentUserPoints(null);
      return;
    }

    // ── Step 1: Fast-path — show user's own points ASAP ──────────────────────
    setLoading(true);
    try {
      await fetchCurrentUser(userId);
    } finally {
      // UI unblocks here; header displays points
      setLoading(false);
    }

    // ── Step 2: Lazy — load full leaderboard in the background ───────────────
    // Not awaited intentionally; doesn't block the header.
    fetchFullLeaderboard(userId);
  }, [user?.userId, fetchCurrentUser, fetchFullLeaderboard]);

  
const refreshLeaderboard = useCallback(async () => {
  // Clear both caches so the next fetch always hits the network
  leaderboardCache = null;
  if (user?.userId) USER_CACHE.delete(user.userId);
  
  await fetchGlobalLeaderboard();
}, [user?.userId, fetchGlobalLeaderboard]);

const addLocalPoints = useCallback((points: number) => {
  const userId = user?.userId;
  if (!userId || !points) return;
  const delta = Number(points) || 0;

  setCurrentUserPoints((prev) => {
    const next = (Number(prev) || 0) + delta;
    const cached = USER_CACHE.get(userId);
    USER_CACHE.set(userId, {
      ts: Date.now(),
      points: next,
      rank: cached?.rank ?? currentUserRank ?? 0,
    });
    return next;
  });

  setLeaderboard((prev) =>
    prev.map((entry) =>
      sameUserId(entry.userId, userId)
        ? { ...entry, totalPoints: (Number(entry.totalPoints) || 0) + delta }
        : entry
    )
  );

  if (leaderboardCache) {
    leaderboardCache = {
      ts: Date.now(),
      data: leaderboardCache.data.map((entry) =>
        sameUserId(entry.userId, userId)
          ? { ...entry, totalPoints: (Number(entry.totalPoints) || 0) + delta }
          : entry
      ),
    };
  }
}, [currentUserRank, user?.userId]);

  // Only fires when auth is confirmed ready — avoids spurious calls with
  // undefined userId during the initial auth hydration.
  useEffect(() => {
    if (!authReady) return;
    fetchGlobalLeaderboard();
  }, [authReady, fetchGlobalLeaderboard]);

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        currentUserRank,
        currentUserPoints,
        loading,
        refreshLeaderboard,
        addLocalPoints,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error("useLeaderboard must be used within a LeaderboardProvider");
  }
  return context;
};
