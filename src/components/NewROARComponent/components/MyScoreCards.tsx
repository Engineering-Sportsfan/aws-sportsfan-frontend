"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMomentEngagements, type MomentEngagement } from "./momentEngagements";
import { buildMatchStats, type MatchStats } from "./matchScorecard";

interface MatchInfo {
  id: string;
  team1?: string;
  team2?: string;
  tournament?: string;
  format?: string;
  /** Match start time (ms) when the API provides one; field names are best guesses. */
  ts?: number;
  /** Position in the /api/matches response (newest first). */
  order?: number;
}

// /api/matches is fetched once per 10 minutes and shared by every card.
const MATCHES_TTL_MS = 10 * 60 * 1000;
let matchesCache: { at: number; map: Map<string, MatchInfo> } | null = null;
let matchesInflight: Promise<Map<string, MatchInfo>> | null = null;

function loadMatches(): Promise<Map<string, MatchInfo>> {
  if (matchesCache && Date.now() - matchesCache.at < MATCHES_TTL_MS) return Promise.resolve(matchesCache.map);
  if (matchesInflight) return matchesInflight;
  matchesInflight = axios
    .get("/api/matches", { timeout: 15000 })
    .then((res) => {
      const d = res.data;
      const rows: any[] = d?.data || d?.matches || (Array.isArray(d) ? d : []);
      const map = new Map<string, MatchInfo>();
      rows.forEach((r, order) => {
        const id = String(r?.match_id ?? r?.id ?? "");
        const rawTs = r?.start_time ?? r?.startTime ?? r?.match_date ?? r?.matchDate ?? r?.date ?? r?.scheduled_at ?? r?.created_at ?? r?.createdAt;
        const ts = typeof rawTs === "number" ? (rawTs < 1e12 ? rawTs * 1000 : rawTs) : rawTs ? Date.parse(String(rawTs)) : NaN;
        if (id) map.set(id, { id, team1: r.team1 || r.home_team, team2: r.team2 || r.away_team, tournament: r.tournament, format: r.format, ts: Number.isFinite(ts) ? ts : undefined, order });
      });
      matchesCache = { at: Date.now(), map };
      return map;
    })
    .catch(() => new Map<string, MatchInfo>()) // fall back to names derived from engagements
    .finally(() => { matchesInflight = null; });
  return matchesInflight;
}

const CREATION_TYPES = new Set([
  "ROAR_POST", "ROAR_DEBATE", "ROAR_PREDICTION", "ROAR_HOT_TAKE", "ROAR_MEMORY", "ROAR_RAW_REACTIONS", "ROAR_QUIZ",
]);

const typeOf = (a: any): string => String(a?.type || a?.metadata?.type || "").toUpperCase();
const stripPrefix = (s: string) => s.replace(/^ENGAGEMENT#/, "");

function engagementIdOf(a: any): string {
  const m = a?.metadata ?? {};
  return stripPrefix(String(m.engagementId || a?.engagementId || m.contentId || a?.contentId || ""));
}

/** The option the user picked, if the activity records it. Field names are best guesses. */
function pickedOption(a: any): string {
  const m = a?.metadata ?? {};
  return String(m.choiceId ?? m.optionId ?? m.selectedOptionId ?? m.selectedChoiceId ?? m.answer ?? m.vote ?? "");
}

/** Readable match name ("New Zealand vs India") from any engagement of that match. Never the raw id. */
function matchTitle(items: MomentEngagement[], extra: string[] = []): string {
  for (const e of items) {
    const fd: any = (e as any).followData;
    if (fd?.team1Name && fd?.team2Name) return `${fd.team1Name} vs ${fd.team2Name}`;
  }
  for (const e of items) {
    const rd: any = (e as any).matchResultData;
    if (rd?.team1Name && rd?.team2Name) return `${rd.team1Name} vs ${rd.team2Name}`;
  }
  // Predictions/polls/debates carry "Team A vs Team B · 1st Innings · Over 3.2" in the subtitle.
  for (const e of items) {
    const sub = String((e as any).subtitle ?? "").split("·")[0].trim();
    if (/\bvs\b/i.test(sub)) return sub;
  }
  for (const e of items) {
    const t = String((e as any).title ?? "");
    if (/\bvs\b/i.test(t) && t.length < 60) return t;
  }
  for (const t of extra) if (t) return t;
  return "Match";
}

/** Tournament and format for a match, from whichever of its engagements carries them. Field names partly guessed. */
function matchMeta(items: MomentEngagement[]): { tournament: string; format: string } {
  const pick = (...vals: unknown[]) => vals.map((v) => String(v ?? "").trim()).find(Boolean) ?? "";
  let tournament = "";
  let format = "";
  for (const e of items as any[]) {
    const fd = e.followData ?? {};
    const rd = e.matchResultData ?? {};
    if (!tournament) {
      tournament = pick(e.tournament, e.tournamentName, e.series, e.seriesName, e.competition,
        fd.tournament, fd.tournamentName, fd.seriesName, rd.tournament, rd.tournamentName, rd.seriesName);
    }
    if (!format) {
      // followData.matchLabel holds e.g. "T20 INTERNATIONAL" / "ODI".
      format = pick(e.matchFormat, e.format, fd.matchFormat, fd.format, fd.matchLabel, rd.matchFormat, rd.matchLabel);
    }
    if (tournament && format) break;
  }
  return { tournament, format };
}

interface Score {
  matchId: string;
  title: string;
  tournament: string;
  format: string;
  interactions: number;
  predictionsTotal: number;
  predictionsCorrect: number;
  sxp: number;
  last: number;
}

export function MyScoreCards({
  activities,
  loading,
  username,
  avatarSrc,
  teams = [],
  favPlayer,
  maxItems,
  onViewAll,
  layout = "row",
}: {
  /** Raw activity-log entries ({ type, points, metadata, createdAt }). */
  activities: any[];
  loading?: boolean;
  username?: string;
  avatarSrc?: string | null;
  /** First teams/sports (image preferred, label as fallback). */
  teams?: { label: string; image?: string }[];
  /** Favourite player name; the row is hidden when empty. */
  favPlayer?: string;
  /** Show only the latest N matches (all when omitted). */
  maxItems?: number;
  /** When set and there are more matches than maxItems, a "View all" button calls this. */
  onViewAll?: () => void;
  /** "row": horizontal swipe row; "list": vertical list. */
  layout?: "row" | "list";
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState<MomentEngagement[] | null>(null);
  const [matches, setMatches] = useState<Map<string, MatchInfo> | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadMatches().then((m) => { if (!cancelled) setMatches(m); });
    return () => { cancelled = true; };
  }, []);

  // Shared 5-min cache with the Profile tiles / Contribution History: normally no new request.
  // A failed/timed-out request used to become [] and hide this section until a refresh, so retry with backoff.
  const [listFailed, setListFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    getMomentEngagements()
      .then((l) => { if (!cancelled) { setList(l); setListFailed(false); } })
      .catch(() => {
        if (cancelled) return;
        if (attempt < 3) timer = setTimeout(() => setAttempt((n) => n + 1), 1500 * (attempt + 1));
        else setListFailed(true);
      });
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [attempt]);

  const scores = useMemo<Score[]>(() => {
    if (!list) return [];
    const byId = new Map<string, MomentEngagement>();
    const byMatch = new Map<string, MomentEngagement[]>();
    for (const e of list) {
      if (e.id) byId.set(String(e.id), e);
      const mid = String((e as any).matchId ?? "");
      if (mid) (byMatch.get(mid) ?? byMatch.set(mid, []).get(mid)!).push(e);
    }

    const acc = new Map<string, Score & { predSeen: Set<string> }>();
    for (const a of activities || []) {
      const t = typeOf(a);
      if (t.includes("CREATE") || CREATION_TYPES.has(t)) continue;
      const eng = byId.get(engagementIdOf(a));
      const matchId = String((eng as any)?.matchId ?? "");
      if (!eng || !matchId) continue; // only match-moment engagements, grouped by match id

      let s = acc.get(matchId);
      if (!s) {
        const mi = matches?.get(matchId); // authoritative: /api/matches
        const derivedMeta = matchMeta(byMatch.get(matchId) ?? []);
        s = {
          matchId,
          title: mi?.team1 && mi?.team2
            ? `${mi.team1} vs ${mi.team2}`
            : matchTitle(byMatch.get(matchId) ?? [], [
                String(a?.metadata?.matchTitle ?? a?.metadata?.matchName ?? a?.metadata?.match ?? ""),
              ]),
          tournament: mi?.tournament || derivedMeta.tournament,
          format: mi?.format || derivedMeta.format,
          interactions: 0, predictionsTotal: 0, predictionsCorrect: 0, sxp: 0, last: 0,
          predSeen: new Set<string>(),
        };
        acc.set(matchId, s);
      }
      s.interactions += 1;
      s.sxp += Number(a.points) || 0;
      s.last = Math.max(s.last, Number(a.createdAt) || 0);

      if (String(eng.type).toLowerCase() === "prediction" && !s.predSeen.has(String(eng.id))) {
        s.predSeen.add(String(eng.id));
        s.predictionsTotal += 1;
        const m = a?.metadata ?? {};
        const winning = String((eng as any).winningChoiceId ?? (eng as any).outcomeWinningChoiceId ?? "");
        const picked = pickedOption(a);
        const flagged = m.isCorrect === true || m.correct === true || String(m.result ?? "").toLowerCase() === "correct";
        if (flagged || (winning && picked && picked === winning)) s.predictionsCorrect += 1;
      }
    }
    // Latest match first: by match date, else by /api/matches order (newest first), else by last activity.
    return Array.from(acc.values()).sort((x, y) => {
      const mx = matches?.get(x.matchId);
      const my = matches?.get(y.matchId);
      if (mx?.ts != null && my?.ts != null && mx.ts !== my.ts) return my.ts - mx.ts;
      if (mx?.order != null && my?.order != null && mx.order !== my.order) return mx.order - my.order;
      return y.last - x.last;
    });
  }, [activities, list, matches]);

  // SXP per match comes from /api/user-points?matchId= (the user's matchPoints), not from summing the activity log.
  const [matchPoints, setMatchPoints] = useState<Record<string, number>>({});
  // Interactions and Prediction come from /api/user/match-kpis (same values as the FanScorecard page).
  const [kpiByMatch, setKpiByMatch] = useState<Record<string, { cardsEngaged: number | null; pCorrect: number | null; pTotal: number | null; totalSxp: number | null }>>({});
  // Matches whose match-kpis call failed: show the API value instead of waiting forever.
  const [kpiFailed, setKpiFailed] = useState<Record<string, boolean>>({});
  const idsKey = scores.slice(0, maxItems ?? scores.length).map((s) => s.matchId).join("|");
  useEffect(() => {
    if (!idsKey) return;
    let off = false;
    const norm = (v: unknown) => String(v ?? "").replace(/^USER#/, "").toLowerCase();
    const mine = new Set([user?.actualUserId, user?.userId, user?.email, user?.email?.replace(/[@.]/g, "_")].filter(Boolean).map(norm));
    const uid = user?.actualUserId || user?.userId || user?.email || "";
    for (const id of idsKey.split("|")) {
      const kpiUserId = user?.actualUserId || user?.userId?.replace(/[@.]/g, "_") || user?.email?.replace(/[@.]/g, "_") || uid;
      axios.get("/api/user/match-kpis", { params: { matchId: id, userId: kpiUserId, recompute: "true" }, timeout: 90000 })
        .then((r) => {
          if (off) return;
          if (!r.data?.success) { console.warn("[SXP-CARD] match-kpis not successful", id, kpiUserId, r.data); setKpiFailed((p) => ({ ...p, [id]: true })); return; }
          const k = r.data?.kpis;
          const pred = k?.prediction;
          setKpiByMatch((p) => ({
            ...p,
            [id]: {
              // Raw KPI fields; the local-stats fallbacks are applied at render, exactly like FanScorecard/[id].
              cardsEngaged: k?.participation?.cardsEngaged != null ? Number(k.participation.cardsEngaged) : null,
              pCorrect: (pred?.correct ?? pred?.won) != null ? Number(pred?.correct ?? pred?.won) : null,
              pTotal: (pred?.attempted ?? pred?.resolved) != null ? Number(pred?.attempted ?? pred?.resolved) : null,
              totalSxp: r.data?.totalMatchSxp != null ? Number(r.data.totalMatchSxp) || 0 : null,
            },
          }));
        })
        .catch((e) => {
          console.warn("[SXP-CARD] match-kpis FAILED", id, kpiUserId, e?.code || e?.message);
          if (!off) setKpiFailed((p) => ({ ...p, [id]: true }));
        });
      axios.get("/api/user-points", { params: { limit: 100, matchId: id, ...(uid ? { userId: uid } : {}) }, timeout: 15000 })
        .then((r) => {
          if (off) return;
          const rows: any[] = r.data?.leaderboard || [];
          const me = rows.find((x) => mine.has(norm(x?.userId)));
          // userMatchPoints can be 0 when the backend can't match the id, so prefer the user's own leaderboard row.
          const pts = Number(me?.matchPoints ?? r.data?.userMatchPoints ?? 0) || 0;
          setMatchPoints((p) => ({ ...p, [id]: pts }));
        })
        .catch(() => {});
    }
    return () => { off = true; };
  }, [idsKey, user?.actualUserId, user?.userId, user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  // SXP shown = exactly what FanScorecard/[id] shows: the highest of the API's matchPoints, the KPI total and the local activity sum.
  const localStatsByMatch = useMemo(() => (list ? buildMatchStats(activities || [], list) : new Map<string, MatchStats>()), [activities, list]);
  const localSxpByMatch = useMemo(() => {
    const m = new Map<string, number>();
    localStatsByMatch.forEach((v, k) => m.set(k, Number(v.sxp) || 0));
    return m;
  }, [localStatsByMatch]);
  // Interactions / Prediction: same rules as FanScorecard/[id]: KPI value, else the local activity stats.
  const kpiReady = (id: string) => kpiByMatch[id] != null || !!kpiFailed[id];
  const interactionsFor = (id: string): string | null => {
    if (!kpiReady(id)) return null;
    return String(kpiByMatch[id]?.cardsEngaged ?? localStatsByMatch.get(id)?.interactions ?? 0);
  };
  const predictionFor = (id: string): string | null => {
    if (!kpiReady(id)) return null;
    const k = kpiByMatch[id];
    const l = localStatsByMatch.get(id);
    return `${k?.pCorrect ?? l?.predictionsCorrect ?? 0}/${k?.pTotal ?? l?.predictionsTotal ?? 0}`;
  };
  const sxpFor = (id: string): string | null => {
    const api = matchPoints[id];
    const kpi = kpiByMatch[id]?.totalSxp;
    // Wait for the recomputed KPI total (the API's matchPoints alone can be stale), so the value never jumps.
    if (kpi == null && !kpiFailed[id]) return null;
    if (api == null && kpi == null) return null;
    return String(Math.max(api ?? 0, kpi ?? 0, localSxpByMatch.get(id) ?? 0));
  };

  // DEBUG: compare with the [SXP-DETAIL] log from FanScorecard/[id].
  useEffect(() => {
    for (const id of Object.keys({ ...matchPoints, ...kpiByMatch })) {
      console.log("[SXP-CARD]", id, {
        shownSxp: sxpFor(id),
        apiUserPointsMatchPoints: matchPoints[id] ?? null,
        kpiTotalMatchSxp: kpiByMatch[id]?.totalSxp ?? null,
        localActivitySxp: localSxpByMatch.get(id) ?? 0,
      });
    }
  }, [matchPoints, kpiByMatch, localSxpByMatch]); // eslint-disable-line react-hooks/exhaustive-deps

  if (listFailed) {
    return (
      <div style={{ padding: "22px 14px 8px" }}>
        <button
          type="button"
          onClick={() => { setListFailed(false); setAttempt(0); }}
          style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#3ea6ff", fontSize: 13, fontWeight: 600, padding: "10px 14px", cursor: "pointer", width: "100%" }}
        >
          Couldn&apos;t load My Fan Score Card. Tap to retry
        </button>
      </div>
    );
  }
  const Title = (
    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff" }}>
      <span style={{ color: "#ff9f1c", fontSize: 16 }}>🏆</span>
      My Fan Score Card
    </span>
  );
  // Still loading: skeleton cards (never hide the section while data is on its way).
  if (loading || !list || !matches) {
    return (
      <div style={{ padding: "22px 14px 8px" }}>
        <div style={{ marginBottom: 12 }}>{Title}</div>
        <div style={{ display: "flex", gap: 12, overflow: "hidden" }}>
          {[0, 1].map((i) => (
            <div key={i} className="animate-pulse" style={{ flex: "0 0 86%", maxWidth: 360, borderRadius: 16, background: "rgba(255,255,255,0.06)", padding: 14 }}>
              <div style={{ height: 14, width: "55%", borderRadius: 6, background: "rgba(255,255,255,0.08)", marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                <div style={{ height: 14, width: "40%", borderRadius: 6, background: "rgba(255,255,255,0.1)" }} />
              </div>
              <div style={{ height: 56, borderRadius: 12, background: "rgba(255,255,255,0.08)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (scores.length === 0) {
    return (
      <div style={{ padding: "22px 14px 8px" }}>
        <div style={{ marginBottom: 12 }}>{Title}</div>
        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(18,18,26,0.7)", padding: 18, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
          No match activity yet. Join a match to build your Fan Score Card.
        </div>
      </div>
    );
  }

  const shown = maxItems ? scores.slice(0, maxItems) : scores;
  const showAll = layout === "list";
  const initial = (username || "F").trim().charAt(0).toUpperCase();

  return (
    <div style={{ padding: "22px 14px 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff" }}>
          <span style={{ color: "#ff9f1c", fontSize: 16 }}>🏆</span>
          My Fan Score Card
        </span>
        {onViewAll && scores.length > shown.length && (
          <button
            type="button"
            onClick={onViewAll}
            style={{ background: "none", border: "none", color: "#3ea6ff", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}
          >
            View all
          </button>
        )}
      </div>

      <div
        className="hide-scrollbar"
        style={
          showAll
            ? { display: "flex", flexDirection: "column", gap: 12 }
            : {
                display: "flex", flexDirection: "row", gap: 12, overflowX: "auto",
                scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 4, touchAction: "pan-x pan-y",
              }
        }
      >
        {shown.map((s) => (
          <div
            key={s.matchId}
            style={showAll ? undefined : { flex: "0 0 86%", maxWidth: 360, minWidth: 0, scrollSnapAlign: "start" }}
          >
            {/* Tournament / series and format sit above the card, outside it. */}
            <div style={{ margin: "0 2px 6px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{s.title}</div>
              {(s.tournament || s.format) && (
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  {[s.tournament, s.format].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          <div
            role="link"
            tabIndex={0}
            onClick={() => router.push(`/MainModules/FanScorecard/${encodeURIComponent(s.matchId)}`)}
            onKeyDown={(e) => { if (e.key === "Enter") router.push(`/MainModules/FanScorecard/${encodeURIComponent(s.matchId)}`); }}
            style={{
              background: "rgba(18,18,26,0.7)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 14, cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 52, height: 52, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                  background: "linear-gradient(135deg,#9333ea,#4f46e5)", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20,
                }}
              >
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#22d3ee", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {username || "You"}
                </div>
                {/* My Teams & Sports, then the favourite player's name (nothing if not set) */}
                {teams.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                    {teams.map((b, i) =>
                      b.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={`${b.label}-${i}`} src={b.image} alt={b.label} title={b.label}
                          style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.25)" }} />
                      ) : (
                        <span key={`${b.label}-${i}`} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)" }}>{b.label}</span>
                      )
                    )}
                  </div>
                )}
                {favPlayer && favPlayer.trim() && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
                    {favPlayer.trim()}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
              {[
                { v: interactionsFor(s.matchId) ?? "–", l: "Interactions" },
                { v: predictionFor(s.matchId) ?? "–", l: "Prediction" },
                { v: sxpFor(s.matchId) ?? "–", l: "SXP" },
              ].map((c, i) => (
                <div
                  key={c.l}
                  style={{
                    flex: 1, textAlign: "center", padding: "10px 4px",
                    borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{c.v}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{c.l}</div>
                </div>
              ))}
            </div>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
}
