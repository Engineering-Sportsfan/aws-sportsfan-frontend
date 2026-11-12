"use client";

import { useEffect, useRef, useState } from "react";
import axios, { isAxiosError } from "axios";

export interface EngagementStats {
  participations: number;
  likes: number;
  comments: number;
  shares: number;
}

export type CategoryKey = "predictions" | "debates" | "polls" | "takes" | "trivia" | "reactions";
export type CategoryStats = Record<CategoryKey, number>;
const ZERO_CATS: CategoryStats = { predictions: 0, debates: 0, polls: 0, takes: 0, trivia: 0, reactions: 0 };

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
  type?: string;
}

interface EngagementListResponse {
  engagements?: EngagementListItem[];
}

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; stats: EngagementStats; cats: CategoryStats };

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

const CATEGORY_TILES: { key: CategoryKey; label: string; color: string }[] = [
  { key: "predictions", label: "Predictions", color: "#fbbf24" },
  { key: "debates", label: "Debates", color: "#60a5fa" },
  { key: "polls", label: "Polls", color: "#38bdf8" },
  { key: "takes", label: "Takes", color: "#22d3ee" },
  { key: "trivia", label: "Trivia", color: "#34d399" },
  { key: "reactions", label: "Reactions", color: "#fb923c" },
];

/** Engagement `type` -> category tile. Participation counts per type come from the same telemetry as the totals. */
const categoryOfType = (t: string | undefined): Exclude<CategoryKey, "reactions"> | null => {
  const v = String(t ?? "").toLowerCase();
  if (v === "prediction") return "predictions";
  if (v === "debate") return "debates";
  if (v === "poll") return "polls";
  if (v === "express") return "takes";
  if (v === "quiz" || v === "question" || v === "trivia") return "trivia";
  return null;
};

const aliases = (s: string | null | undefined): string[] => {
  const v = String(s ?? "").trim().toLowerCase().replace(/^user#/, "");
  return [v, v.replace(/[@.]/g, "_"), v.replace(/@/g, "_")].filter(Boolean);
};

const n = (v: number | undefined): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

// ── sessionStorage cache (every access wrapped; storage can be unavailable) ──
interface CacheEntry {
  at: number;
  stats: EngagementStats;
  cats?: CategoryStats;
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

function writeCache(key: string, stats: EngagementStats, cats: CategoryStats): void {
  try {
    const entry: CacheEntry = { at: Date.now(), stats, cats };
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
  onCategoryClick,
}: {
  identifiers: ReadonlyArray<string | null | undefined>;
  onParticipationsClick?: () => void;
  onCategoryClick?: (key: CategoryKey) => void;
}) {
  const idsRef = useRef(identifiers);
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const ids = idsRef.current;
    const email = ids.find((x) => !!x && String(x).includes("@")) ?? ids.find(Boolean) ?? "";
    const cacheKey = `engagementStats:v2:${String(email).toLowerCase()}`;
    let cancelled = false;

    console.log(`${TAG} mount`, { identifiers: ids, cacheKey });

    const cached = readCache(cacheKey);
    if (cached) {
      const ageMs = Date.now() - cached.at;
      console.log(`${TAG} cache hit`, { ageMs, fresh: ageMs < CACHE_TTL_MS, stats: cached.stats });
      setState({ status: "ready", stats: cached.stats, cats: cached.cats ?? ZERO_CATS });
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
        const typeById = new Map<string, string | undefined>();
        for (const e of items) if (e.id) typeById.set(e.id, e.type);
        console.log(`${TAG} engagementIds.length`, engagementIds.length, `(of ${items.length} listed)`);

        if (engagementIds.length === 0) {
          writeCache(cacheKey, ZERO, ZERO_CATS);
          if (!cancelled) setState({ status: "ready", stats: ZERO, cats: ZERO_CATS });
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
        const cats: CategoryStats = { ...ZERO_CATS };
        for (const [engId, m] of Object.entries(match?.engagements ?? {})) {
          const cat = categoryOfType(typeById.get(engId));
          if (cat) cats[cat] += n(m.participations);
          cats.reactions += n(m.likes) + n(m.socialLikes) + n(m.comments) + n(m.socialComments);
          totals.participations += n(m.participations);
          totals.likes += n(m.likes) + n(m.socialLikes);
          totals.comments += n(m.comments) + n(m.socialComments);
          totals.shares += n(m.shares);
        }
        console.log(`${TAG} totals`, totals);

        writeCache(cacheKey, totals, cats);
        if (!cancelled) setState({ status: "ready", stats: totals, cats });
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

  const skeleton = (
    <div
      style={{
        height: 24, width: 40, margin: "8px auto 0", borderRadius: 6,
        background: "rgba(255,255,255,0.12)", animation: "engagement-pulse 1.2s ease-in-out infinite",
      }}
    />
  );

  return (
    <>
      <style>{`
        .engagement-cats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 14px; }
        .engagement-tiles { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 480px) {
          .engagement-cats { display: flex; overflow-x: auto; }
          .engagement-cats > div { flex: 0 0 96px; }
          .engagement-tiles { gap: 6px !important; }
          .engagement-tiles > div { padding: 10px 4px !important; min-width: 0; }
          .engagement-tiles .engagement-tile-label { font-size: 8px !important; letter-spacing: 0.02em !important; }
          .engagement-tiles .engagement-tile-value { font-size: 18px !important; }
        }
        @keyframes engagement-pulse { 0%,100% { opacity: .35 } 50% { opacity: .7 } }
      `}</style>

      {/* Row 1: participation categories (tap to open Contribution History on that tab) */}
      <div className="engagement-cats">
        {CATEGORY_TILES.map(({ key, label, color }) => (
          <div
            key={key}
            role="button"
            tabIndex={0}
            aria-label={`View ${label}`}
            onClick={() => onCategoryClick?.(key)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onCategoryClick?.(key); }}
            style={{
              background: "rgba(18,18,26,0.7)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "12px 6px", textAlign: "center", cursor: onCategoryClick ? "pointer" : "default",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color }}>
              {label}
            </div>
            {loading ? skeleton : (
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 6 }}>
                {state.status === "ready" ? state.cats[key].toLocaleString() : "–"}
              </div>
            )}
          </div>
        ))}
      </div>

    <div className="engagement-tiles" style={{ display: "grid", gap: 8, marginTop: 14 }}>
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
          <div className="engagement-tile-label" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color }}>
            {label}
          </div>
          {loading ? (
            <div
              style={{
                height: 24, width: 40, maxWidth: "70%", margin: "8px auto 0", borderRadius: 6,
                background: "rgba(255,255,255,0.12)", animation: "engagement-pulse 1.2s ease-in-out infinite",
              }}
            />
          ) : (
            <div className="engagement-tile-value" style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 6 }}>
              {state.status === "ready" ? state.stats[key].toLocaleString() : "–"}
            </div>
          )}
        </div>
        );
      })}
    </div>
    </>
  );
}
