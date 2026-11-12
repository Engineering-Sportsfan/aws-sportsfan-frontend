"use client";

import { useEffect, useRef, useState } from "react";
import axios, { isAxiosError } from "axios";

export interface EngagementStats {
  participations: number;
  likes: number;
  comments: number;
  shares: number;
}

interface EngagementMetrics {
  participations?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  socialLikes?: number;
  socialComments?: number;
}

interface OverviewUser {
  userId?: string;
  email?: string;
  username?: string;
  engagements?: Record<string, EngagementMetrics>;
}

interface OverviewResponse {
  success?: boolean;
  users?: OverviewUser[];
}

interface EngagementListItem {
  id?: string;
  matchId?: string;
  momentId?: string;
  loopId?: string;
}

interface EngagementListResponse {
  engagements?: EngagementListItem[];
}

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; stats: EngagementStats };

const TAG = "[EngagementStats]";
const LIST_URL = "/api/engagements?excludeFlipArena=true&source=match_moment&allEnvs=true&limit=500";
const OVERVIEW_URL = "/api/admin/core-engine/overview";
const TIMEOUT_MS = 30000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const ZERO: EngagementStats = { participations: 0, likes: 0, comments: 0, shares: 0 };

const TILES: { key: keyof EngagementStats; label: string; color: string }[] = [
  { key: "participations", label: "Participations", color: "#10d98f" },
  { key: "likes", label: "Likes", color: "#f472b6" },
  { key: "comments", label: "Comments", color: "#22d3ee" },
  { key: "shares", label: "Shares", color: "#c084fc" },
];

const aliases = (s: string | null | undefined): string[] => {
  const v = String(s ?? "").trim().toLowerCase().replace(/^user#/, "");
  return [v, v.replace(/[@.]/g, "_"), v.replace(/@/g, "_")].filter(Boolean);
};

const n = (v: number | undefined): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

// ── sessionStorage cache (every access wrapped; storage can be unavailable) ──
interface CacheEntry {
  at: number;
  stats: EngagementStats;
}

function readCache(key: string): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (typeof parsed?.at !== "number" || !parsed.stats) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(key: string, stats: EngagementStats): void {
  try {
    const entry: CacheEntry = { at: Date.now(), stats };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

function describeError(err: unknown): void {
  if (isAxiosError(err)) {
    console.error(`${TAG} request failed`, {
      status: err.response?.status ?? err.code,
      body: err.response?.data ?? err.message,
      url: err.config?.url,
    });
  } else {
    console.error(`${TAG} request failed`, err);
  }
}

/**
 * Engagement totals for one user, built from the existing endpoints:
 *   1. GET  /api/engagements?...            -> engagement ids
 *   2. POST /api/admin/core-engine/overview -> per-user telemetry
 * `identifiers` = email / uid / userId / username of the viewed user.
 * Fetches once on mount; a cached value (5 min) renders first, then it refreshes in the background.
 */
export function EngagementStatTiles({
  identifiers,
  onParticipationsClick,
}: {
  identifiers: ReadonlyArray<string | null | undefined>;
  onParticipationsClick?: () => void;
}) {
  const idsRef = useRef(identifiers);
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const ids = idsRef.current;
    const email = ids.find((x) => !!x && String(x).includes("@")) ?? ids.find(Boolean) ?? "";
    const cacheKey = `engagementStats:${String(email).toLowerCase()}`;
    let cancelled = false;

    console.log(`${TAG} mount`, { identifiers: ids, cacheKey });

    const cached = readCache(cacheKey);
    if (cached) {
      const ageMs = Date.now() - cached.at;
      console.log(`${TAG} cache hit`, { ageMs, fresh: ageMs < CACHE_TTL_MS, stats: cached.stats });
      setState({ status: "ready", stats: cached.stats });
    }

    (async () => {
      try {
        // 1) engagement ids
        const list = await axios.get<EngagementListResponse>(LIST_URL, { timeout: TIMEOUT_MS });
        const items = list.data?.engagements ?? [];
        const engagementIds = items
          .filter((e) => (e.matchId && e.matchId !== "GLOBAL") || e.momentId || e.loopId)
          .map((e) => e.id)
          .filter((id): id is string => typeof id === "string" && id.length > 0);
        console.log(`${TAG} engagementIds.length`, engagementIds.length, `(of ${items.length} listed)`);

        if (engagementIds.length === 0) {
          writeCache(cacheKey, ZERO);
          if (!cancelled) setState({ status: "ready", stats: ZERO });
          return;
        }

        // 2) telemetry
        const started = Date.now();
        const res = await axios.post<OverviewResponse>(OVERVIEW_URL, { engagementIds }, { timeout: TIMEOUT_MS });
        const users = res.data?.users ?? [];
        console.log(`${TAG} overview`, { status: res.status, elapsedMs: Date.now() - started, usersLength: users.length });

        // 3) match the user
        const me = new Set(ids.flatMap((k) => aliases(k)));
        const match = users.find((u) =>
          [u.userId, u.email, u.username].some((k) => !!k && aliases(k).some((a) => me.has(a)))
        );
        console.log(`${TAG} matched`, !!match, { me: Array.from(me) });
        if (!match) {
          console.log(
            `${TAG} no match - first 5 users' userId`,
            users.slice(0, 5).map((u) => u.userId)
          );
        }

        // 4) sum
        const totals: EngagementStats = { participations: 0, likes: 0, comments: 0, shares: 0 };
        for (const m of Object.values(match?.engagements ?? {})) {
          totals.participations += n(m.participations);
          totals.likes += n(m.likes) + n(m.socialLikes);
          totals.comments += n(m.comments) + n(m.socialComments);
          totals.shares += n(m.shares);
        }
        console.log(`${TAG} totals`, totals);

        writeCache(cacheKey, totals);
        if (!cancelled) setState({ status: "ready", stats: totals });
      } catch (err) {
        describeError(err);
        // Keep a cached value on screen if we have one; otherwise show "–".
        if (!cancelled && !cached) setState({ status: "error" });
      }
    })();

    return () => {
      cancelled = true;
    };
    // Fetch once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = state.status === "loading";

  return (
    <div className="engagement-tiles" style={{ display: "grid", gap: 8, marginTop: 14 }}>
      <style>{`
        .engagement-tiles { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 480px) { .engagement-tiles { grid-template-columns: repeat(2, 1fr); } }
        @keyframes engagement-pulse { 0%,100% { opacity: .35 } 50% { opacity: .7 } }
      `}</style>
      {TILES.map(({ key, label, color }) => {
        const clickable = key === "participations" && !!onParticipationsClick;
        return (
        <div
          key={key}
          {...(clickable
            ? {
                role: "button",
                tabIndex: 0,
                "aria-label": "View contribution history",
                onClick: onParticipationsClick,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") onParticipationsClick?.();
                },
              }
            : {})}
          style={{
            background: "rgba(18,18,26,0.7)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "12px 10px", textAlign: "center",
            cursor: clickable ? "pointer" : "default",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color }}>
            {label}
          </div>
          {loading ? (
            <div
              style={{
                height: 24, width: 48, margin: "8px auto 0", borderRadius: 6,
                background: "rgba(255,255,255,0.12)", animation: "engagement-pulse 1.2s ease-in-out infinite",
              }}
            />
          ) : (
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 6 }}>
              {state.status === "ready" ? state.stats[key].toLocaleString() : "–"}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}
