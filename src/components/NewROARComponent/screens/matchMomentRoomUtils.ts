// Pure helpers for MatchMomentRoom (no React). Kept separate so the rules are easy to test/change.

export const MATCH_MOMENT_ROOM_ID = "room_1794564790526_juxls71";

export type RoomTab = "auction" | "live" | "matches";

export interface MatchInfo {
  matchId: string;
  title: string;
  short: string;
  format: string;
  stage: string;
  venue: string;
  /** Match start, ISO with IST offset. */
  startsAt: string;
}

// ── Match metadata (API cards don't carry teams/venue, so it's keyed by matchId here) ──
export const MATCH_INFO: Record<string, MatchInfo> = {
  "AUS-NZ-2026-TEST1-D3": {
    matchId: "AUS-NZ-2026-TEST1-D3",
    title: "Australia vs New Zealand",
    short: "AUS v NZ",
    format: "Test",
    stage: "1st Test · Day 3",
    venue: "TBC",
    startsAt: "2026-12-11T05:00:00+05:30",
  },
  "INDAW-ENGAW-2026-ODI2": {
    matchId: "INDAW-ENGAW-2026-ODI2",
    title: "India Women vs England Women",
    short: "IND-W v ENG-W",
    format: "ODI",
    stage: "2nd ODI",
    venue: "TBC",
    startsAt: "2026-12-11T14:00:00+05:30",
  },
  "IND-SL-2026-ODI1": {
    matchId: "IND-SL-2026-ODI1",
    title: "India vs Sri Lanka",
    short: "IND v SL",
    format: "ODI",
    stage: "1st ODI",
    venue: "TBC",
    startsAt: "2026-12-13T14:00:00+05:30",
  },
};

const SET_A = ["AUS-NZ-2026-TEST1-D3", "INDAW-ENGAW-2026-ODI2"];
const SET_B = ["IND-SL-2026-ODI1"];
const SET_CUTOFF_MS = new Date("2026-12-13T00:00:00+05:30").getTime();

/** The one place the "which matches are visible" rule lives. */
export function getActiveMatchSet(now: Date = new Date()): string[] {
  return now.getTime() < SET_CUTOFF_MS ? SET_A : SET_B;
}

/** Dev only: ?demoNow=<ISO with offset>. Used ONLY to feed getActiveMatchSet. */
export function getDemoNow(search?: string): Date | null {
  try {
    const q = search ?? (typeof window !== "undefined" ? window.location.search : "");
    const raw = new URLSearchParams(q).get("demoNow");
    if (!raw) return null;
    const d = new Date(raw.replace(" ", "+"));
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function matchInfoFor(matchId: string): MatchInfo {
  return (
    MATCH_INFO[matchId] ?? {
      matchId,
      title: matchId,
      short: "",
      format: "",
      stage: "",
      venue: "",
      startsAt: "",
    }
  );
}

// ── Card helpers ──
export type CardFilter = "all" | "prediction" | "debate" | "poll" | "question" | "express";

export const AUCTION_FILTERS: CardFilter[] = ["all", "poll"];
export const MATCH_FILTERS: CardFilter[] = ["all", "poll", "question", "express"];

export const hasAuctionId = (e: any): boolean => !!String(e?.auctionId ?? "").trim();

export const cleanMatchId = (e: any): string => String(e?.matchId ?? "").replace(/^MATCH#/, "").trim();

/** Absolute time (ms) a card was posted. */
export const cardTime = (e: any): number => {
  const raw = e?.postingTime || e?.createdAt || e?.startTime || e?.scheduledStartTime || 0;
  const n = typeof raw === "number" ? raw : new Date(raw).getTime();
  return Number.isFinite(n) ? n : 0;
};

/** Auction day number parsed from questionId like "Q-93993-D15-3" -> 15. */
export function auctionDay(e: any): number {
  const m = /-D(\d{1,2})-/i.exec(String(e?.questionId ?? ""));
  return m ? parseInt(m[1], 10) : 0;
}

export function filterByType<T extends { type?: string }>(list: T[], filter: CardFilter): T[] {
  return filter === "all" ? list : list.filter((e) => String(e.type ?? "").toLowerCase() === filter);
}

export function countByType(list: { type?: string }[], filter: CardFilter): number {
  return filterByType(list, filter).length;
}

export interface DayGroup {
  day: number;
  label: string; // "D15 · 23 Dec"
  title: string;
  phase: string;
  cards: any[];
}

/** Groups auction cards by day (D01..D15, ascending); cards inside a day ordered by questionId card number. */
export function groupByAuctionDay(list: any[]): DayGroup[] {
  const map = new Map<number, any[]>();
  for (const e of list) {
    const d = auctionDay(e);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(e);
  }
  const cardNo = (e: any) => parseInt(/-D\d{1,2}-(\d+)$/i.exec(String(e?.questionId ?? ""))?.[1] ?? "0", 10);
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([day, cards]) => {
      cards.sort((a, b) => cardNo(a) - cardNo(b) || cardTime(a) - cardTime(b));
      const first = cards[0];
      // Journey runs 9 Dec (D01) .. 23 Dec (D15)
      const label = day > 0 ? `D${String(day).padStart(2, "0")} · ${8 + day} Dec` : "Other";
      const title = String(first?.anchorTrigger ?? "").split(" · ")[0] || "Auction";
      return { day, label, title, phase: String(first?.matchPhase ?? ""), cards };
    });
}

export interface MomentGroup {
  key: string;
  label: string;
  phase: string;
  cards: any[];
}

/** Groups one match's cards into moments (by anchorTrigger, else matchPhase), oldest moment first. */
export function groupByMoment(list: any[]): MomentGroup[] {
  const map = new Map<string, any[]>();
  for (const e of list) {
    const key = String(e?.anchorTrigger ?? e?.matchPhase ?? "").trim() || "Moments";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return [...map.entries()]
    .map(([key, cards]) => {
      cards.sort((a, b) => cardTime(a) - cardTime(b));
      return {
        key,
        label: key.split(" · ")[0],
        phase: String(cards[0]?.matchPhase ?? ""),
        cards,
      };
    })
    .sort((a, b) => cardTime(a.cards[0]) - cardTime(b.cards[0]));
}

export function groupByMatchId(list: any[]): Map<string, any[]> {
  const map = new Map<string, any[]>();
  for (const e of list) {
    const id = cleanMatchId(e);
    if (!id) continue;
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(e);
  }
  for (const arr of map.values()) arr.sort((a, b) => cardTime(a) - cardTime(b));
  return map;
}

/** Absolute IST date/time, e.g. "11 Dec 2026, 2:00 pm IST". */
export function formatIST(msOrIso: number | string | undefined | null): string {
  if (!msOrIso) return "";
  const d = new Date(msOrIso);
  if (Number.isNaN(d.getTime())) return "";
  const s = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return `${s} IST`;
}
