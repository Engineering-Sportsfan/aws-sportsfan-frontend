"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getMomentEngagements, type MomentEngagement } from "./momentEngagements";

const SHOW_FIRST = 3;

interface MatchInfo {
  id: string;
  team1?: string;
  team2?: string;
  tournament?: string;
  format?: string;
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
      for (const r of rows) {
        const id = String(r?.match_id ?? r?.id ?? "");
        if (id) map.set(id, { id, team1: r.team1 || r.home_team, team2: r.team2 || r.away_team, tournament: r.tournament, format: r.format });
      }
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
}) {
  const [list, setList] = useState<MomentEngagement[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [matches, setMatches] = useState<Map<string, MatchInfo> | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadMatches().then((m) => { if (!cancelled) setMatches(m); });
    return () => { cancelled = true; };
  }, []);

  // Shared 5-min cache with the Profile tiles / Contribution History: normally no new request.
  useEffect(() => {
    let cancelled = false;
    getMomentEngagements()
      .then((l) => { if (!cancelled) setList(l); })
      .catch(() => { if (!cancelled) setList([]); });
    return () => { cancelled = true; };
  }, []);

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
    return Array.from(acc.values()).sort((x, y) => y.last - x.last);
  }, [activities, list, matches]);

  if (loading || !list || !matches) return null;
  if (scores.length === 0) return null;

  const shown = showAll ? scores : scores.slice(0, SHOW_FIRST);
  const initial = (username || "F").trim().charAt(0).toUpperCase();

  return (
    <div style={{ padding: "22px 14px 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#fff" }}>
          <span style={{ color: "#ff9f1c", fontSize: 16 }}>🏆</span>
          My Score Card
        </span>
        {scores.length > SHOW_FIRST && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            style={{ background: "none", border: "none", color: "#3ea6ff", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}
          >
            {showAll ? "Show less" : "View all"}
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shown.map((s) => (
          <div key={s.matchId}>
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
            style={{
              background: "rgba(18,18,26,0.7)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 14,
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
                { v: String(s.interactions), l: "Interactions" },
                { v: `${s.predictionsCorrect}/${s.predictionsTotal}`, l: "Prediction" },
                { v: String(s.sxp), l: "SXP" },
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
