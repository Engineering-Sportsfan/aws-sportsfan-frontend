import type { MomentEngagement } from "./momentEngagements";

const CREATION_TYPES = new Set([
  "ROAR_POST", "ROAR_DEBATE", "ROAR_PREDICTION", "ROAR_HOT_TAKE", "ROAR_MEMORY", "ROAR_RAW_REACTIONS", "ROAR_QUIZ",
]);

const typeOf = (a: any): string => String(a?.type || a?.metadata?.type || "").toUpperCase();
const strip = (s: string) => s.replace(/^ENGAGEMENT#/, "");
const engagementIdOf = (a: any): string => {
  const m = a?.metadata ?? {};
  return strip(String(m.engagementId || a?.engagementId || m.contentId || a?.contentId || ""));
};
const pickedOption = (a: any): string => {
  const m = a?.metadata ?? {};
  return String(m.choiceId ?? m.optionId ?? m.selectedOptionId ?? m.selectedChoiceId ?? m.answer ?? m.vote ?? "");
};

export type Category = "predictions" | "debates" | "community" | "athlete";

export interface MatchStats {
  matchId: string;
  interactions: number;
  predictionsTotal: number;
  predictionsCorrect: number;
  debates: number;
  reactions: number;
  sxp: number;
  sxpByCategory: Record<Category, number>;
  last: number;
}

function categoryOf(engType: string, actType: string): Category {
  const t = `${engType} ${actType}`.toLowerCase();
  if (t.includes("predict") || t.includes("poll") || t.includes("quiz")) return "predictions";
  if (t.includes("debate") || t.includes("hot_take") || t.includes("hottake") || t.includes("take")) return "debates";
  if (t.includes("follow") || t.includes("support") || t.includes("athlete") || t.includes("player")) return "athlete";
  return "community";
}

/** Activities (with an engagement of a match moment) grouped by match id. */
export function buildMatchStats(activities: any[], engagements: MomentEngagement[]): Map<string, MatchStats> {
  const byId = new Map<string, MomentEngagement>();
  for (const e of engagements) if (e.id) byId.set(String(e.id), e);

  const out = new Map<string, MatchStats>();
  const predSeen = new Map<string, Set<string>>();

  for (const a of activities || []) {
    const t = typeOf(a);
    if (t.includes("CREATE") || CREATION_TYPES.has(t)) continue;
    const eng: any = byId.get(engagementIdOf(a));
    const matchId = String(eng?.matchId ?? "");
    if (!eng || !matchId) continue;

    let s = out.get(matchId);
    if (!s) {
      s = {
        matchId, interactions: 0, predictionsTotal: 0, predictionsCorrect: 0, debates: 0, reactions: 0, sxp: 0, last: 0,
        sxpByCategory: { predictions: 0, debates: 0, community: 0, athlete: 0 },
      };
      out.set(matchId, s);
      predSeen.set(matchId, new Set());
    }
    const engType = String(eng.type ?? "");
    const pts = Number(a.points) || 0;
    s.interactions += 1;
    s.sxp += pts;
    s.last = Math.max(s.last, Number(a.createdAt) || 0);
    s.sxpByCategory[categoryOf(engType, t)] += pts;

    const lower = `${engType} ${t}`.toLowerCase();
    if (lower.includes("debate")) s.debates += 1;
    if (lower.includes("reaction")) s.reactions += 1;

    if (engType.toLowerCase() === "prediction" && !predSeen.get(matchId)!.has(String(eng.id))) {
      predSeen.get(matchId)!.add(String(eng.id));
      s.predictionsTotal += 1;
      const m = a?.metadata ?? {};
      const winning = String(eng.winningChoiceId ?? eng.outcomeWinningChoiceId ?? "");
      const picked = pickedOption(a);
      const flagged = m.isCorrect === true || m.correct === true || String(m.result ?? "").toLowerCase() === "correct";
      if (flagged || (winning && picked && picked === winning)) s.predictionsCorrect += 1;
    }
  }
  return out;
}

export function latestMatchId(stats: Map<string, MatchStats>): string | null {
  let best: MatchStats | null = null;
  for (const s of stats.values()) if (!best || s.last > best.last) best = s;
  return best?.matchId ?? null;
}

export interface EarnedBadge { id: string; label: string; color: string; icon: string; }

/**
 * Badges for a single match, derived from that match's activity.
 * Thresholds are a client-side heuristic until the backend returns real per-match badges.
 */
export function badgesForMatch(s: MatchStats): EarnedBadge[] {
  const out: EarnedBadge[] = [];
  if (s.predictionsTotal >= 2 && s.predictionsCorrect / s.predictionsTotal >= 0.6)
    out.push({ id: "sharp", label: "Sharp Predictor", color: "#ff7a2f", icon: "🎯" });
  if (s.debates >= 3) out.push({ id: "debate", label: "Debate Star", color: "#a855f7", icon: "💬" });
  if (s.interactions >= 10 || s.reactions >= 3) out.push({ id: "community", label: "Community Builder", color: "#22d3ee", icon: "👥" });
  return out;
}
