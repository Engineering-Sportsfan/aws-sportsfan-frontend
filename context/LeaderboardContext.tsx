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
  [...(Array.isArray(rows) ? rows : [])]
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
  a !== undefined && b !== undefined && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

const isLeaderboardMatch = (entry: any, u: any, uid: string) => {
  if (!entry) return false;
  const entryId = String(entry.userId || entry.actualUserId || entry.id || "").trim().toLowerCase();
  const entryEmail = String(entry.userEmail || entry.email || "").trim().toLowerCase();
  const entryName = String(entry.userName || entry.name || "").trim().toLowerCase();

  const targetId = String(uid || "").trim().toLowerCase();
  const targetActual = String(u?.actualUserId || "").trim().toLowerCase();
  const targetEmail = String(u?.email || "").trim().toLowerCase();
  const targetSanitizedEmail = targetEmail.replace(/[@.]/g, "_");
  const targetName = String(u?.name || "").trim().toLowerCase();

  if (targetId && (entryId === targetId || entryId === targetId.replace(/[@.]/g, "_"))) return true;
  if (targetActual && (entryId === targetActual || String(entry.actualUserId || "").trim().toLowerCase() === targetActual)) return true;
  if (targetEmail && (entryEmail === targetEmail || entryId === targetEmail || entryId === targetSanitizedEmail)) return true;
  if (targetName && entryName === targetName && entryName.length > 2) return true;
  return false;
};

const extractPoints = (data: any): number | null => {
  if (!data) return null;
  const val =
    data?.user?.totalPoints ??
    data?.user?.points ??
    data?.user?.score ??
    data?.user?.reputationScore ??
    data?.data?.totalPoints ??
    data?.data?.points ??
    data?.data?.score ??
    data?.totalPoints ??
    data?.points ??
    data?.score ??
    null;
  if (val != null && !isNaN(Number(val))) {
    return Number(val);
  }
  return null;
};

const extractRank = (data: any): number | null => {
  if (!data) return null;
  const val =
    data?.user?.rank ??
    data?.data?.rank ??
    data?.rank ??
    null;
  if (val != null && !isNaN(Number(val))) {
    return Number(val);
  }
  return null;
};

const resolveUserId = (u: any): string | null => {
  if (!u) {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("watchalong_user_id") ||
        localStorage.getItem("roar_username") ||
        null
      );
    }
    return null;
  }
  return (
    u.actualUserId ||
    u.userId ||
    (u.email ? u.email.replace(/[@.]/g, "_") : null) ||
    u.email ||
    null
  );
};

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
  const [currentUserPoints, setCurrentUserPoints] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_points") || localStorage.getItem("roar_user_points");
      if (stored && !isNaN(Number(stored)) && Number(stored) > 0) return Number(stored);
    }
    return null;
  });
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
        const params: Record<string, string> = { userId };
        if (user?.actualUserId && user.actualUserId !== userId) {
          params.actualUserId = user.actualUserId;
        }
        if (user?.email) {
          params.email = user.email;
        }

        const res = await axios.get("/api/user-points", { params });
        const pts = extractPoints(res.data);
        const rk = extractRank(res.data);

        if (pts !== null) {
          const entry: CacheEntry = {
            ts: Date.now(),
            points: pts,
            rank: rk ?? 0,
          };
          USER_CACHE.set(userId, entry);
          setCurrentUserPoints(pts);
          if (rk !== null) setCurrentUserRank(rk);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("user_points", String(pts));
            } catch {}
          }
          return entry;
        }

        // Fallback: check /api/roar/profile if user-points didn't return points
        try {
          const profileQuery = userId ? `?userId=${encodeURIComponent(userId)}` : "";
          const profileRes = await axios.get(`/api/roar/profile${profileQuery}`);
          if (profileRes.data?.success && profileRes.data?.user) {
            const profilePts =
              profileRes.data.user.totalPoints ??
              profileRes.data.user.points ??
              profileRes.data.user.reputationScore;
            if (profilePts != null && !isNaN(Number(profilePts))) {
              const numPts = Number(profilePts);
              const entry: CacheEntry = {
                ts: Date.now(),
                points: numPts,
                rank: 0,
              };
              USER_CACHE.set(userId, entry);
              setCurrentUserPoints(numPts);
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem("user_points", String(numPts));
                } catch {}
              }
              return entry;
            }
          }
        } catch {
          // ignore profile fallback error
        }
      } catch (error) {
        console.error("Error fetching current user points:", error);
      } finally {
        userFetchInProgress.current = false;
      }
      return null;
    },
    [user?.actualUserId, user?.email]
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
        const found = leaderboardCache.data.find((u) => isLeaderboardMatch(u, user, userId));
        if (found) {
          const pts = Number(found.totalPoints) || 0;
          const rk = Number(found.rank) || 0;
          USER_CACHE.set(userId, {
            ts: Date.now(),
            points: pts,
            rank: rk,
          });
          setCurrentUserPoints(pts);
          setCurrentUserRank(rk);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("user_points", String(pts));
            } catch {}
          }
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

          const found = data.find((u) => isLeaderboardMatch(u, user, userId));
          if (found) {
            const pts = Number(found.totalPoints) || 0;
            const rk = Number(found.rank) || 0;
            USER_CACHE.set(userId, {
              ts: Date.now(),
              points: pts,
              rank: rk,
            });
            setCurrentUserPoints(pts);
            setCurrentUserRank(rk);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("user_points", String(pts));
              } catch {}
            }
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
    [user]
  );

  
  // ── Main orchestrator ───────────────────────────────────────────────────────
  const fetchGlobalLeaderboard = useCallback(async () => {
    const userId = resolveUserId(user);

    if (!userId) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user_points") || localStorage.getItem("roar_user_points");
        if (stored && !isNaN(Number(stored)) && Number(stored) > 0) {
          setCurrentUserPoints(Number(stored));
        }
      }
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
  }, [user, fetchCurrentUser, fetchFullLeaderboard]);

  
const refreshLeaderboard = useCallback(async () => {
  // Clear both caches so the next fetch always hits the network
  leaderboardCache = null;
  const userId = resolveUserId(user);
  if (userId) USER_CACHE.delete(userId);
  
  await fetchGlobalLeaderboard();
}, [user, fetchGlobalLeaderboard]);

const addLocalPoints = useCallback((points: number) => {
  const userId = resolveUserId(user);
  if (!points) return;
  const delta = Number(points) || 0;

  setCurrentUserPoints((prev) => {
    const next = (Number(prev) || 0) + delta;
    if (userId) {
      const cached = USER_CACHE.get(userId);
      USER_CACHE.set(userId, {
        ts: Date.now(),
        points: next,
        rank: cached?.rank ?? currentUserRank ?? 0,
      });
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("user_points", String(next));
      } catch {}
    }
    return next;
  });

  if (userId) {
    setLeaderboard((prev) =>
      prev.map((entry) =>
        isLeaderboardMatch(entry, user, userId)
          ? { ...entry, totalPoints: (Number(entry.totalPoints) || 0) + delta }
          : entry
      )
    );

    if (leaderboardCache) {
      leaderboardCache = {
        ts: Date.now(),
        data: leaderboardCache.data.map((entry) =>
          isLeaderboardMatch(entry, user, userId)
            ? { ...entry, totalPoints: (Number(entry.totalPoints) || 0) + delta }
            : entry
        ),
      };
    }
  }
}, [currentUserRank, user]);

  // Listen for external points updates (e.g. from quizzes, predictions, or posts)
  useEffect(() => {
    const handlePointsUpdate = (e: any) => {
      const delta = Number(e?.detail?.points || e?.detail?.delta || 0);
      if (delta > 0) {
        addLocalPoints(delta);
      } else if (e?.detail?.totalPoints != null) {
        const total = Number(e.detail.totalPoints);
        setCurrentUserPoints(total);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("user_points", String(total));
          } catch {}
        }
      }
    };

    window.addEventListener("roar-points-updated", handlePointsUpdate);
    return () => {
      window.removeEventListener("roar-points-updated", handlePointsUpdate);
    };
  }, [addLocalPoints]);

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
