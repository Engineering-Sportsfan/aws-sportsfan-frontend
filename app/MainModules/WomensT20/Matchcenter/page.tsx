"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Trophy,
  MapPin,
  Star,
  Target,
  LineChart,
  Crosshair,
  Zap,
  Diamond,
  Flame,
  Medal,
  Activity,
  Shield,
  Info
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
// ─── Team Logos Map (served from /public/WomenT20/) ───────────────────────────
const TEAM_LOGOS: Record<string, string> = {
  IND: "/WomenT20/india.svg",
  AUS: "/WomenT20/australia.svg",
  ENG: "/WomenT20/england.svg",
  SA: "/WomenT20/south-africa.svg",
  NZ: "/WomenT20/new-zealand.svg",
  WI: "/WomenT20/west-indies.svg",
  PAK: "/WomenT20/pakistan.svg",
  BAN: "/WomenT20/bangladesh.svg",
  SL: "/WomenT20/sri-lanka.svg",
  IRE: "/WomenT20/ireland.svg",
  SCO: "/WomenT20/scotland.svg",
  NED: "/WomenT20/netherlands.svg",
};

interface TeamRow {
  rank: number;
  abbr: string;
  name: string;
  qualified: boolean;
  m: number;
  w: number;
  l: number;
  nr: number;
  pts: number;
  nrr: string;
}

interface PlayerRow {
  rank: number;
  player: string;
  team: string;
  m: number;
  runs?: number;
  wickets?: number;
  avg: string;
  sr?: string;
  econ?: string;
}

interface MatchCard {
  matchNo: number | string;
  date: string;
  day?: string;
  time?: string;
  teamA: string;
  teamAFull: string;
  teamB: string;
  teamBFull: string;
  venue?: string;
  status: "upcoming" | "live" | "completed";
  result?: string;
  scoreA?: string;
  scoreB?: string;
  oversA?: string;
  oversB?: string;
}

interface HighestScoreRow {
  rank: number;
  player: string;
  team: string;
  score: string;
  sr: string;
}

interface TodayMatch {
  teamA: string;
  teamAFull: string;
  teamB: string;
  teamBFull: string;
  time: string;
  venue: string;
  matchNo: number | string;
  totalMatches: number;
}

interface RecentMatch {
  teamA: string;
  teamB: string;
  result: string;
  scoreA?: string;
  scoreB?: string;
  oversA?: string;
  oversB?: string;
}

interface ExtraStatRow {
  rank: number;
  player: string;
  team: string;
  value: string | number;
  subValue?: string | number;
}

interface StatsData {
  teamLogos: Record<string, string>;
  pointsTable: {
    groupA: TeamRow[];
    groupB: TeamRow[];
  };
  mostRuns: PlayerRow[];
  mostWickets: PlayerRow[];
  todayMatch: TodayMatch | null;
  recentMatch: RecentMatch | null;
  upcomingMatches: MatchCard[];
  recentMatches: MatchCard[];
  highestScores: HighestScoreRow[];
  extraStats: {
    bestBowling: ExtraStatRow[];
    battingAvg: ExtraStatRow[];
    bowlingAvg: ExtraStatRow[];
    mostEcon: ExtraStatRow[];
    maxSixes: ExtraStatRow[];
    maxFours: ExtraStatRow[];
    boundaries: ExtraStatRow[];
  };
}

type TabId = "table" | "stats" | "matches" | "playoffs";

// ─── Generator for Empty Player Stats ─────────────────────────────────────────
const generateEmptyPlayers = (count: number, keys: any) =>
  Array.from({ length: count }).map((_, i) => ({
    rank: i + 1,
    player: `Player ${i + 1}`,
    team: "TBC",
    ...keys,
  }));

// ─── Pre-Tournament Static Data ───────────────────────────────────────────────
const STATIC_DATA: StatsData = {
  teamLogos: {},

  pointsTable: {
    groupA: [
      { rank: 1, abbr: "AUS", name: "Australia", qualified: false, m: 1, w: 1, l: 0, nr: 0, pts: 2, nrr: "+3.250" },
      { rank: 2, abbr: "SA", name: "South Africa", qualified: false, m: 1, w: 0, l: 1, nr: 0, pts: 0, nrr: "-3.250" },
      { rank: 3, abbr: "BAN", name: "Bangladesh", qualified: false, m: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: "+0.000" },
      { rank: 4, abbr: "IND", name: "India", qualified: false, m: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: "+0.000" },
      { rank: 5, abbr: "NED", name: "Netherlands", qualified: false, m: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: "+0.000" },
      { rank: 6, abbr: "PAK", name: "Pakistan", qualified: false, m: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: "+0.000" },
    ],
    groupB: [
      { rank: 1, abbr: "ENG", name: "England", qualified: false, m: 1, w: 1, l: 0, nr: 0, pts: 2, nrr: "+4.350" },
      { rank: 2, abbr: "SCO", name: "Scotland", qualified: false, m: 1, w: 1, l: 0, nr: 0, pts: 2, nrr: "+2.000" },
      { rank: 3, abbr: "IRE", name: "Ireland", qualified: false, m: 1, w: 0, l: 1, nr: 0, pts: 0, nrr: "-2.000" },
      { rank: 4, abbr: "SL", name: "Sri Lanka", qualified: false, m: 1, w: 0, l: 1, nr: 0, pts: 0, nrr: "-4.350" },
      { rank: 5, abbr: "NZ", name: "New Zealand", qualified: false, m: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: "+0.000" },
      { rank: 6, abbr: "WI", name: "West Indies", qualified: false, m: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: "+0.000" },
    ],
  },

  mostRuns: [
    { rank: 1, player: "Danni Wyatt-Hodge", team: "ENG", m: 1, runs: 105, avg: "-" },
    { rank: 2, player: "Amy Jones", team: "ENG", m: 1, runs: 53, avg: "53.00" },
    { rank: 3, player: "Nat Sciver-Brunt", team: "ENG", m: 1, runs: 46, avg: "-" },
    { rank: 4, player: "Nilakshi de Silva", team: "SL", m: 1, runs: 39, avg: "39.00" },
    { rank: 5, player: "H. Samarawickrama", team: "SL", m: 1, runs: 29, avg: "29.00" },
  ],
  mostWickets: [
    { rank: 1, player: "Freya Kemp", team: "ENG", m: 1, wickets: 4, avg: "5.50", econ: "5.50" },
    { rank: 2, player: "Charlie Dean", team: "ENG", m: 1, wickets: 2, avg: "9.00", econ: "6.00" },
    { rank: 3, player: "Sophie Ecclestone", team: "ENG", m: 1, wickets: 2, avg: "13.50", econ: "6.75" },
    { rank: 4, player: "Lauren Bell", team: "ENG", m: 1, wickets: 1, avg: "15.00", econ: "5.00" },
    { rank: 5, player: "Linsey Smith", team: "ENG", m: 1, wickets: 1, avg: "24.00", econ: "6.00" },
  ],

  todayMatch: {
    teamA: "WI", teamAFull: "West Indies",
    teamB: "NZ", teamBFull: "New Zealand",
    time: "11:00 PM",
    venue: "TBC",
    matchNo: "4",
    totalMatches: 33,
  },

  recentMatch: {
    teamA: "AUS", teamB: "SA", result: "AUS won by 65 runs", scoreA: "172/8", scoreB: "107"
  },

  upcomingMatches: [
    { matchNo: 4, date: "Today", teamA: "WI", teamAFull: "West Indies", teamB: "NZ", teamBFull: "New Zealand", time: "11:00 PM", status: "upcoming", venue: "TBC" },
    { matchNo: 5, date: "Tomorrow", teamA: "BAN", teamAFull: "Bangladesh", teamB: "NED", teamBFull: "Netherlands", time: "3:00 PM", status: "upcoming", venue: "TBC" },
    { matchNo: 6, date: "Tomorrow", teamA: "IND", teamAFull: "India", teamB: "PAK", teamBFull: "Pakistan", time: "7:00 PM", status: "upcoming", venue: "TBC" },
    { matchNo: 7, date: "Tue, 16 Jun", teamA: "NZ", teamAFull: "New Zealand", teamB: "SL", teamBFull: "Sri Lanka", time: "7:00 PM", status: "upcoming", venue: "TBC" },
    { matchNo: 8, date: "Tue, 16 Jun", teamA: "ENG", teamAFull: "England", teamB: "IRE", teamBFull: "Ireland", time: "11:00 PM", status: "upcoming", venue: "TBC" },
    { matchNo: 9, date: "Wed, 17 Jun", teamA: "AUS", teamAFull: "Australia", teamB: "BAN", teamBFull: "Bangladesh", time: "3:00 PM", status: "upcoming", venue: "TBC" },
    { matchNo: 10, date: "Wed, 17 Jun", teamA: "IND", teamAFull: "India", teamB: "NED", teamBFull: "Netherlands", time: "7:00 PM", status: "upcoming", venue: "TBC" },
  ],

  recentMatches: [
    { matchNo: 3, date: "Today", teamA: "AUS", teamAFull: "Australia", teamB: "SA", teamBFull: "South Africa", time: "Completed", status: "completed", venue: "TBC", result: "AU-W won by 65 runs", scoreA: "172/8 (20)", scoreB: "107 (16.4)" },
    { matchNo: 2, date: "Today", teamA: "SCO", teamAFull: "Scotland", teamB: "IRE", teamBFull: "Ireland", time: "Completed", status: "completed", venue: "TBC", result: "SCOW won by 40 runs", scoreA: "161/5 (20)", scoreB: "121 (19.1)" },
    { matchNo: 1, date: "Yesterday", teamA: "ENG", teamAFull: "England", teamB: "SL", teamBFull: "Sri Lanka", time: "Completed", status: "completed", venue: "TBC", result: "EN-W won by 87 runs", scoreA: "219/1 (20)", scoreB: "132 (20)" },
  ],

  highestScores: [
    { rank: 1, player: "Danni Wyatt-Hodge", team: "ENG", score: "105*", sr: "169.35" },
    { rank: 2, player: "Amy Jones", team: "ENG", score: "53", sr: "139.47" },
    { rank: 3, player: "Nat Sciver-Brunt", team: "ENG", score: "46*", sr: "209.09" },
    { rank: 4, player: "Nilakshi de Silva", team: "SL", score: "39", sr: "118.18" },
    { rank: 5, player: "H. Samarawickrama", team: "SL", score: "29", sr: "161.11" },
  ],

  extraStats: {
    battingAvg: [
        { rank: 1, player: "Amy Jones", team: "ENG", value: "53.00", subValue: 53 },
        { rank: 2, player: "Nilakshi de Silva", team: "SL", value: "39.00", subValue: 39 },
        { rank: 3, player: "H. Samarawickrama", team: "SL", value: "29.00", subValue: 29 },
        { rank: 4, player: "Beth Mooney", team: "AUS", value: "24.00", subValue: 24 },
        { rank: 5, player: "Saskia Horley", team: "SCO", value: "22.00", subValue: 22 },
    ],
    bowlingAvg: [
        { rank: 1, player: "Freya Kemp", team: "ENG", value: "5.50", subValue: 4 },
        { rank: 2, player: "Charlie Dean", team: "ENG", value: "9.00", subValue: 2 },
        { rank: 3, player: "Sophie Ecclestone", team: "ENG", value: "13.50", subValue: 2 },
        { rank: 4, player: "Lauren Bell", team: "ENG", value: "15.00", subValue: 1 },
        { rank: 5, player: "Linsey Smith", team: "ENG", value: "24.00", subValue: 1 },
    ],
    bestBowling: [
        { rank: 1, player: "Freya Kemp", team: "ENG", value: "4/22" },
        { rank: 2, player: "Charlie Dean", team: "ENG", value: "2/18" },
        { rank: 3, player: "Sophie Ecclestone", team: "ENG", value: "2/27" },
        { rank: 4, player: "Lauren Bell", team: "ENG", value: "1/15" },
        { rank: 5, player: "Linsey Smith", team: "ENG", value: "1/24" },
    ],
    mostEcon: [
        { rank: 1, player: "Lauren Bell", team: "ENG", value: "5.00", subValue: 1 },
        { rank: 2, player: "Freya Kemp", team: "ENG", value: "5.50", subValue: 4 },
        { rank: 3, player: "Charlie Dean", team: "ENG", value: "6.00", subValue: 2 },
        { rank: 4, player: "Linsey Smith", team: "ENG", value: "6.00", subValue: 1 },
        { rank: 5, player: "Sophie Ecclestone", team: "ENG", value: "6.75", subValue: 2 },
    ],
    maxSixes: [
        { rank: 1, player: "Amy Jones", team: "ENG", value: 1, subValue: 53 },
        { rank: 2, player: "Danni Wyatt-Hodge", team: "ENG", value: 1, subValue: 105 },
        { rank: 3, player: "H. Samarawickrama", team: "SL", value: 1, subValue: 29 },
        { rank: 4, player: "Nat Sciver-Brunt", team: "ENG", value: 1, subValue: 46 },
        { rank: 5, player: "Nilakshi de Silva", team: "SL", value: 1, subValue: 39 },
    ],
    maxFours: generateEmptyPlayers(5, { value: 0, subValue: 0 }),
    boundaries: generateEmptyPlayers(5, { value: 0 }),
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TeamLogo({ abbr, size = "md" }: { abbr: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-12 h-12", xl: "w-16 h-16" };
  const src = TEAM_LOGOS[abbr] ?? null;

  return (
    <div className={`${sizes[size]} flex-shrink-0 flex items-center justify-center bg-white/5 rounded-full overflow-hidden shadow-sm`}>
      {src ? (
        <img src={src} alt={abbr} className="w-full h-full object-contain p-1" />
      ) : (
        <span className="text-[9px] font-bold text-gray-500 uppercase">{abbr?.slice(0, 3) || "TBC"}</span>
      )}
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection({ todayMatch }: { todayMatch: TodayMatch }) {
  return (
    <div
      className="rounded-2xl border border-[#1e1e30] overflow-hidden mb-4 relative"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 60%), #0b0c1a",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 pt-4 pb-2">
        <span
          className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full"
          style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          Today • {todayMatch.time}
        </span>
        <span
          className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full text-gray-400"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Women's T20 • Match {todayMatch.matchNo} of {todayMatch.totalMatches}
        </span>
      </div>

      <div className="flex items-center justify-between px-2 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col items-center gap-2 w-20 sm:w-28 md:w-36 z-10">
          <div
            className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
            style={{ boxShadow: "0 0 40px rgba(56, 189, 248, 0.1)" }}
          >
            <img
              src={TEAM_LOGOS[todayMatch.teamA]}
              alt={todayMatch.teamA}
              className="w-11 h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
            />
          </div>
          <span className="text-white text-base sm:text-xl md:text-2xl font-black tracking-wide">{todayMatch.teamA}</span>
        </div>

        <div className="flex flex-col items-center gap-1 z-10 px-1">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-gray-400"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
          >
            VS
          </div>
          <p className="text-[10px] text-gray-500 text-center max-w-[140px] leading-relaxed hidden sm:block mt-2">
            {todayMatch.venue}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 w-20 sm:w-28 md:w-36 z-10">
          <div
            className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
            style={{ boxShadow: "0 0 40px rgba(236, 72, 153, 0.1)" }}
          >
            <img
              src={TEAM_LOGOS[todayMatch.teamB]}
              alt={todayMatch.teamB}
              className="w-11 h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
            />
          </div>
          <span className="text-white text-base sm:text-xl md:text-2xl font-black tracking-wide">{todayMatch.teamB}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Top Performers Section ───────────────────────────────────────────────────

function TopPerformersSection({ mostRuns, mostWickets }: { mostRuns: PlayerRow[]; mostWickets: PlayerRow[] }) {
  const [showAll, setShowAll] = useState(false);
  const [statTab, setStatTab] = useState<"runs" | "wickets">("runs");
  
  // FIXED: Access the first item in the array for the top performer cards
  // const top1Run = mostRuns;
  // const top1Wicket = mostWickets;
  const top1Run = mostRuns?.length ? mostRuns[0] : null;
const top1Wicket = mostWickets?.length ? mostWickets[0] : null;

  return (
    <div className="rounded-2xl border border-[#1e1e30] mb-4 overflow-hidden shadow-lg" style={{ background: "#0d0e1c" }}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#1e1e30] bg-[#111222]">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <Medal size={18} className="text-yellow-500" />
          Tournament Leaders
        </h2>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          {showAll ? "Show Less" : "Show All"}
          <ChevronRight size={14} className={`transition-transform duration-300 ${showAll ? "rotate-90" : ""}`} />
        </button>
      </div>

      {!showAll && top1Run && top1Wicket && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 p-2 sm:p-3">
          <div
            className="rounded-xl p-3 relative overflow-hidden transition-transform hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, rgba(30,58,138,0.6) 0%, rgba(15,23,42,0.8) 100%)",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at bottom right, rgba(59,130,246,0.6) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-2">
                <Target size={14} className="text-blue-400" />
                <span className="text-blue-400 text-[11px] font-bold tracking-widest uppercase">Most Runs</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <TeamLogo abbr={top1Run.team} size="sm" />
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate">{top1Run.player}</p>
                  <p className="text-blue-300/70 text-[10px] font-semibold">{top1Run.team}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-2xl font-black">{top1Run.runs}</span>
                <span className="text-blue-300/70 text-[10px] uppercase tracking-wider">Runs</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-3 relative overflow-hidden transition-transform hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, rgba(131,24,67,0.6) 0%, rgba(15,23,42,0.8) 100%)",
              border: "1px solid rgba(236,72,153,0.3)",
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at bottom right, rgba(236,72,153,0.6) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-2">
                <Crosshair size={14} className="text-pink-400" />
                <span className="text-pink-400 text-[11px] font-bold tracking-widest uppercase">Most Wickets</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <TeamLogo abbr={top1Wicket.team} size="sm" />
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate">{top1Wicket.player}</p>
                  <p className="text-pink-300/70 text-[10px] font-semibold">{top1Wicket.team}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-white text-2xl font-black">{top1Wicket.wickets}</span>
                <span className="text-pink-300/70 text-[10px] uppercase tracking-wider">Wickets</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAll && (
        <div>
          <div className="flex border-b border-[#1e1e30] bg-[#111222]">
            <button
              onClick={() => setStatTab("runs")}
              className={`flex items-center gap-2 flex-1 justify-center py-3 text-[11px] font-bold tracking-widest transition-colors relative ${statTab === "runs" ? "text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Target size={14} />
              MOST RUNS
              {statTab === "runs" && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-20 rounded-t-md bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
            </button>
            <button
              onClick={() => setStatTab("wickets")}
              className={`flex items-center gap-2 flex-1 justify-center py-3 text-[11px] font-bold tracking-widest transition-colors relative ${statTab === "wickets" ? "text-pink-400" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Crosshair size={14} />
              MOST WICKETS
              {statTab === "wickets" && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-20 rounded-t-md bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] border-collapse text-xs">
              <thead>
                <tr className="text-gray-500 bg-[#0b0c16] text-[10px] uppercase tracking-wider border-b border-[#1e1e30]">
                  <th className="py-2.5 px-4 text-left w-8">#</th>
                  <th className="py-2.5 px-4 text-left">Player</th>
                  <th className="py-2.5 px-4 text-center">MAT</th>
                  {statTab === "runs" ? (
                    <>
                      <th className="py-2.5 px-4 text-center">Runs</th>
                      <th className="py-2.5 px-4 text-center">Avg</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2.5 px-4 text-center">Wkts</th>
                      <th className="py-2.5 px-4 text-center">Econ</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(statTab === "runs" ? mostRuns : mostWickets).map((p, i) => (
                  <tr key={p.rank} className={`border-b border-[#13131f] hover:bg-white/[0.02] transition-colors ${i === 0 ? "bg-white/[0.01]" : ""}`}>
                    <td className={`py-3 px-4 font-black ${i === 0 ? (statTab === "runs" ? "text-blue-400" : "text-pink-400") : "text-gray-500"}`}>{p.rank}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <TeamLogo abbr={p.team} size="sm" />
                        <div className="min-w-0">
                          <p className={`whitespace-nowrap font-semibold ${i === 0 ? "text-white" : "text-gray-200"}`}>{p.player}</p>
                          <p className="text-gray-500 text-[10px] font-medium">{p.team}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400 font-medium">{p.m}</td>
                    {statTab === "runs" ? (
                      <>
                        <td className={`py-3 px-4 text-center font-bold ${i === 0 ? "text-blue-400" : "text-gray-300"}`}>{p.runs}</td>
                        <td className="py-3 px-4 text-center text-gray-500 font-medium">{p.avg}</td>
                      </>
                    ) : (
                      <>
                        <td className={`py-3 px-4 text-center font-bold ${i === 0 ? "text-pink-400" : "text-gray-300"}`}>{p.wickets}</td>
                        <td className="py-3 px-4 text-center text-gray-500 font-medium">{p.econ}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Points Table Tab ─────────────────────────────────────────────────────────

function PointsTableGroup({ title, rows }: { title: string; rows: TeamRow[] }) {
  return (
    <div className="mb-6 last:mb-0 bg-[#111222] rounded-xl border border-[#1e1e30] overflow-hidden">
      <div className="bg-[#1e1e30]/50 py-2 px-4 border-b border-[#1e1e30]">
        <h4 className="text-white text-xs font-bold uppercase tracking-widest">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] border-collapse text-sm">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-wider bg-[#0b0c16]/50">
              <th className="py-3 px-3 text-left w-8">#</th>
              <th className="py-3 px-3 text-left min-w-[140px]">Team</th>
              <th className="py-3 px-3 text-center">M</th>
              <th className="py-3 px-3 text-center">W</th>
              <th className="py-3 px-3 text-center">L</th>
              <th className="py-3 px-3 text-center">PTS</th>
              <th className="py-3 px-3 text-center">NRR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((team, idx) => (
              <tr
                key={team.abbr}
                className={`transition-colors hover:bg-white/[0.03] ${idx === 1 ? "border-b-2 border-b-[#2a2a3e]" : "border-b border-[#13131f] last:border-0"}`}
                style={team.qualified ? { borderLeft: "2px solid #38bdf8" } : { borderLeft: "2px solid transparent" }}
              >
                <td className={`py-3 px-3 font-bold text-xs ${team.qualified ? "text-sky-400" : "text-gray-600"}`}>{team.rank}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <TeamLogo abbr={team.abbr} size="sm" />
                    <span className={`font-semibold whitespace-nowrap text-xs ${team.qualified ? "text-white" : "text-gray-300"}`}>{team.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center text-gray-400 text-xs">{team.m}</td>
                <td className="py-3 px-3 text-center text-emerald-400 font-semibold text-xs">{team.w}</td>
                <td className="py-3 px-3 text-center text-rose-400 font-semibold text-xs">{team.l}</td>
                <td className="py-3 px-3 text-center text-white font-bold text-xs">{team.pts}</td>
                <td className={`py-3 px-3 text-center font-medium text-xs ${team.nrr !== "+0.000" && String(team.nrr).startsWith("+") ? "text-emerald-400" : "text-gray-400"}`}>
                  {team.nrr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PointsTableTab({ data }: { data: StatsData["pointsTable"] }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-white font-bold text-base">Group Standings</h3>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Top 2 Qualify</span>
      </div>
      <PointsTableGroup title="Group A" rows={data.groupA} />
      <PointsTableGroup title="Group B" rows={data.groupB} />
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title, subtitle, icon, data, valueLabel, subValueLabel, limit
}: {
  title: string; subtitle?: string; icon: React.ReactNode;
  data: { rank: number; player: string; team: string; mainValue: string | number; subValue?: string | number }[];
  valueLabel: string; subValueLabel?: string; limit?: number;
}) {
  const shownData = limit ? data.slice(0, limit) : data;
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden flex flex-col h-full shadow-md" style={{ background: "#111222", border: "1px solid #1e1e30" }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1e1e30] bg-[#1a1b2e]/50">
        {icon}
        <div>
          <span className="text-white font-bold text-[11px] uppercase tracking-wider">{title}</span>
          {subtitle && <p className="text-[9px] text-gray-500 uppercase tracking-widest">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-1">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-gray-500 text-[9px] uppercase tracking-widest border-b border-[#13131f] bg-[#0b0c16]/30">
              <th className="py-2 px-3 text-left w-6">#</th>
              <th className="py-2 px-3 text-left">Player</th>
              <th className="py-2 px-3 text-center">Team</th>
              <th className="py-2 px-3 text-right">{valueLabel}</th>
              {subValueLabel && <th className="py-2 px-3 text-right">{subValueLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {shownData.map((row, idx) => (
              <tr key={`${row.rank}-${idx}`} className="border-b border-[#13131f] hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-3">
                  {idx === 0 ? (
                    <div className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-[9px]">1</div>
                  ) : (
                    <span className="text-gray-600 font-bold text-[10px]">{row.rank}</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-gray-200 font-medium truncate max-w-[100px]">{row.player}</td>
                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center">
                    <TeamLogo abbr={row.team} size="sm" />
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right text-white font-bold">{row.mainValue}</td>
                {subValueLabel && <td className="py-2.5 px-3 text-right text-gray-500 font-medium">{row.subValue}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────

function StatsTab({ data }: { data: StatsData }) {
  const [viewAll, setViewAll] = useState(false);
  const limit = viewAll ? undefined : 5;

  type AnyStatRow = HighestScoreRow | ExtraStatRow;

  const mapData = (arr: AnyStatRow[] | undefined, mainKey: string, subKey?: string) =>
    (arr || []).map((item) => {
      const record = item as unknown as Record<string, string | number | undefined>;
      return {
        rank: item.rank,
        player: item.player,
        team: item.team,
        mainValue: record[mainKey] || record["value"] || 0,
        subValue: subKey ? (record[subKey] || record["subValue"]) : undefined,
      };
    });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-1">
        <h3 className="text-white font-bold text-base">Tournament Statistics</h3>
        <button
          onClick={() => setViewAll((v) => !v)}
          className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#38bdf8] hover:text-sky-300 transition-colors bg-sky-500/10 px-3 py-1.5 rounded-full"
        >
          {viewAll ? "Show Top 5" : "View Top 10"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Highest Individual Scores" subtitle="T20 WC 2026 • Top 10"
          icon={<Flame size={14} className="text-orange-500" />}
          data={mapData(data.highestScores, "score")} valueLabel="Score" limit={limit}
        />
        <StatCard
          title="Best Batting Average" subtitle="T20 WC 2026 • Min 4 Innings"
          icon={<LineChart size={14} className="text-blue-400" />}
          data={mapData(data.extraStats?.battingAvg, "value", "subValue")} valueLabel="Average" subValueLabel="Runs" limit={limit}
        />
        <StatCard
          title="Best Bowling Average" subtitle="T20 WC 2026 • Min 5 Wickets"
          icon={<Crosshair size={14} className="text-pink-400" />}
          data={mapData(data.extraStats?.bowlingAvg, "value", "subValue")} valueLabel="Average" subValueLabel="Wkts" limit={limit}
        />
        <StatCard
          title="Best Bowling Figures" subtitle="T20 WC 2026 • Top 10"
          icon={<Zap size={14} className="text-yellow-400" />}
          data={mapData(data.extraStats?.bestBowling, "value")} valueLabel="Figures" limit={limit}
        />
        <StatCard
          title="Most Economical Bowlers" subtitle="T20 WC 2026 • Min 8 Overs"
          icon={<Diamond size={14} className="text-cyan-400" />}
          data={mapData(data.extraStats?.mostEcon, "value", "subValue")} valueLabel="Economy" subValueLabel="Wkts" limit={limit}
        />
        <StatCard
          title="Maximum Sixes" subtitle="T20 WC 2026 • Top 10"
          icon={<Star size={14} className="text-rose-400" />}
          data={mapData(data.extraStats?.maxSixes, "value")} valueLabel="Sixes" limit={limit}
        />
      </div>
    </div>
  );
}

// ─── Matches Tab ──────────────────────────────────────────────────────────────

function MatchesTab({ upcomingMatches, recentMatches }: { upcomingMatches: MatchCard[]; recentMatches: MatchCard[] }) {
  const [subTab, setSubTab] = useState<"upcoming" | "recent">("upcoming");
  const [viewAll, setViewAll] = useState(false);

  const activeList = subTab === "upcoming" ? upcomingMatches : recentMatches;
  const shown = viewAll ? activeList : activeList.slice(0, 4);

  return (
    <div>
      <div className="flex border-b border-[#1e1e30] mb-4 bg-[#111222] rounded-t-xl overflow-hidden">
        <button
          onClick={() => { setSubTab("upcoming"); setViewAll(false); }}
          className={`flex-1 py-3 text-[11px] font-bold tracking-widest transition-colors relative ${subTab === "upcoming" ? "text-white bg-white/5" : "text-gray-500 hover:text-gray-300"}`}
        >
          UPCOMING
          {subTab === "upcoming" && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-16 bg-[#38bdf8] rounded-t-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />}
        </button>
        <button
          onClick={() => { setSubTab("recent"); setViewAll(false); }}
          className={`flex-1 py-3 text-[11px] font-bold tracking-widest transition-colors relative ${subTab === "recent" ? "text-white bg-white/5" : "text-gray-500 hover:text-gray-300"}`}
        >
          RECENT
          {subTab === "recent" && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-16 bg-[#38bdf8] rounded-t-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />}
        </button>
      </div>

      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-white font-bold text-sm">{subTab === "upcoming" ? "Upcoming" : "Recent"} Matches</h3>
        {activeList.length > 4 && (
          <button onClick={() => setViewAll((v) => !v)} className="text-[10px] font-bold tracking-widest uppercase text-[#38bdf8] hover:text-sky-300 transition-colors">
            {viewAll ? "Show Less" : "View All"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {shown.map((match, i) => (
          <div
            key={match.matchNo}
            className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 bg-[#111222] border border-[#1e1e30] rounded-xl hover:border-[#2a2a3e] transition-colors shadow-sm"
          >
            <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:gap-1 sm:w-28 flex-shrink-0 border-b sm:border-b-0 border-[#1e1e30] pb-2 sm:pb-0">
              <div>
                <p className="text-white font-bold text-sm">{match.date}</p>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider">{match.time}</p>
              </div>
              <span className="px-2 py-0.5 mt-1 rounded text-[9px] font-bold tracking-widest uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Match {match.matchNo}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 py-1">
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="min-w-0 text-right">
                  <p className="text-white font-bold text-sm sm:text-base">
                    {match.teamA}
                  </p>
                  <p className="text-gray-500 text-[10px] truncate max-w-[100px] hidden sm:block">{match.teamAFull}</p>
                  {subTab === "recent" && match.scoreA && <p className="text-gray-300 font-bold text-xs mt-0.5">{match.scoreA}</p>}
                </div>
                <TeamLogo abbr={match.teamA} size="lg" />
              </div>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-gray-600 flex-shrink-0"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
              >
                V
              </div>
              <div className="flex items-center gap-3 flex-1 justify-start">
                <TeamLogo abbr={match.teamB} size="lg" />
                <div className="min-w-0 text-left">
                  <p className="text-white font-bold text-sm sm:text-base">
                    {match.teamB}
                  </p>
                  <p className="text-gray-500 text-[10px] truncate max-w-[100px] hidden sm:block">{match.teamBFull}</p>
                  {subTab === "recent" && match.scoreB && <p className="text-gray-400 font-bold text-xs mt-0.5">{match.scoreB}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end justify-center sm:justify-start gap-1 sm:w-44 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1e1e30]">
              <p className="text-gray-500 text-[10px] text-center sm:text-right flex items-center gap-1">
                <MapPin size={10} /> {match.venue}
              </p>
              {subTab === "recent" && match.result && (
                <p className="text-[11px] font-bold text-[#38bdf8] text-center sm:text-right mt-1">{match.result}</p>
              )}
            </div>
          </div>
        ))}
        {shown.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[#1e1e30] rounded-xl bg-[#0d0e1c] text-gray-500 text-xs">
            <Activity size={28} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-gray-400">Tournament is just beginning.</p>
            <p className="mt-1">No completed matches available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Playoffs/Knockouts Redesigned UI ─────────────────────────────────────────

function BracketCard({
  title, date, team1, sub1, team2, sub2, isFinal = false
}: { title: string; date: string; team1: string; sub1: string; team2: string; sub2: string; isFinal?: boolean }) {
  return (
    <div className={`relative rounded-xl border border-[#23273e] bg-[#161a2b] p-4 flex flex-col justify-between w-full z-10 
      ${isFinal ? "h-[160px] shadow-[0_0_30px_rgba(56,189,248,0.1)] border-[#38bdf8]/30" : "h-[120px]"}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold tracking-wider ${isFinal ? "text-sky-400" : "text-[#d0246a]"}`}>{title}</span>
        <span className="text-[10px] text-gray-500">{date}</span>
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 py-1.5 border-b border-gray-700/50">
          <Shield className="text-sky-500/40" size={16} strokeWidth={1.5} />
          <div>
            <p className="text-white font-bold text-xs">{team1}</p>
            {sub1 && <p className="text-gray-500 text-[10px]">{sub1}</p>}
          </div>
        </div>
        <div className="absolute top-1/2 left-4 -translate-y-1/2 w-4 h-4 bg-[#161a2b] border border-gray-700/50 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-500 z-10">
          V
        </div>
        <div className="flex items-center gap-3 py-1.5 pt-2">
          <Shield className="text-sky-500/40" size={16} strokeWidth={1.5} />
          <div>
            <p className="text-white font-bold text-xs">{team2}</p>
            {sub2 && <p className="text-gray-500 text-[10px]">{sub2}</p>}
          </div>
        </div>
      </div>
      
      {isFinal && (
        <div className="absolute right-[-45px] top-1/2 -translate-y-1/2 hidden md:block">
           <Trophy className="text-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" size={64} strokeWidth={1} />
        </div>
      )}
    </div>
  );
}

function PlayoffsTab() {
  return (
    <div className="bg-[#0b0e17] rounded-[1.5rem] p-4 sm:p-6 shadow-2xl font-sans">
      {/* Header Pill */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-8">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/50 text-sky-400 text-[11px] font-bold tracking-wider bg-sky-500/10">
          <div className="w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_5px_#38bdf8]"></div>
          Knockout Stage
        </div>
        <span className="px-4 py-1.5 rounded-full border border-gray-700/50 text-gray-400 text-[10px] font-semibold bg-white/5 hidden sm:block">
          Women's T20 World Cup 2026
        </span>
      </div>

      {/* Title */}
      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        <Trophy size={48} className="mx-auto mb-3 text-gray-300 drop-shadow-md" strokeWidth={1} />
        <h2 className="text-3xl font-black text-white tracking-tight mb-1 drop-shadow-sm">KNOCKOUT STAGE</h2>
        <p className="text-gray-400 text-sm font-medium">Road to the Final</p>
      </div>

      {/* 3 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-[#1e2a5c] bg-[#111730] rounded-xl p-5 text-center flex flex-col justify-center shadow-lg transition-transform hover:scale-[1.02]">
          <p className="text-sky-400 font-bold text-xs mb-1.5">30 JUN</p>
          <h3 className="text-white text-lg font-black mb-2 tracking-wide">SEMI-FINAL 1</h3>
          <p className="text-gray-500 text-xs flex justify-center items-center gap-1"><MapPin size={12}/> TBC</p>
        </div>
        
        <div className="border border-[#5c1e3a] bg-[#301120] rounded-xl p-5 text-center flex flex-col justify-center shadow-lg transition-transform hover:scale-[1.02]">
          <p className="text-pink-400 font-bold text-xs mb-1.5">02 JUL</p>
          <h3 className="text-white text-lg font-black mb-2 tracking-wide">SEMI-FINAL 2</h3>
          <p className="text-gray-500 text-xs flex justify-center items-center gap-1"><MapPin size={12}/> TBC</p>
        </div>
        
        <div className="border border-[#2e2359] bg-[#1a1433] rounded-xl p-5 text-center flex flex-col justify-center shadow-lg transition-transform hover:scale-[1.02]">
          <p className="text-purple-400 font-bold text-xs mb-1.5">05 JUL</p>
          <h3 className="text-white text-lg font-black mb-2 tracking-wide">FINAL</h3>
          <p className="text-gray-500 text-xs flex justify-center items-center gap-1"><MapPin size={12}/> TBC</p>
        </div>
      </div>

      {/* Bracket Area */}
      <div className="border border-gray-800/60 bg-[#101322] rounded-2xl p-6 sm:p-8 relative overflow-x-auto">
        <div className="min-w-[600px] flex justify-between relative">
          
          {/* SVG Connector Lines (Absolute, fixed to the 2 columns) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
             {/* Line from SF1 Right to Center Node */}
             <path d="M 280 60 L 350 60 L 350 160 L 400 160" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
             {/* Line from SF2 Right to Center Node */}
             <path d="M 280 260 L 350 260 L 350 160 L 400 160" fill="none" stroke="#e81cff" strokeWidth="1.5" />
             
             {/* Center Connection Dot */}
             <circle cx="348" cy="160" r="7" fill="#101322" stroke="#6b7280" strokeWidth="1.5" />
             <text x="345.5" y="163" fill="#9ca3af" fontSize="8" fontWeight="bold">x</text>
          </svg>

          {/* Left Column: Semi Finals */}
          <div className="w-[280px] flex flex-col gap-20 relative z-10">
             <BracketCard 
               title="SEMI-FINAL 1" date="30 JUN" 
               team1="TEAM 1" sub1="Group A Winner" 
               team2="TEAM 2" sub2="Group B Runner-up" 
             />
             <BracketCard 
               title="SEMI-FINAL 2" date="02 JUL" 
               team1="TEAM 3" sub1="Group B Winner" 
               team2="TEAM 4" sub2="Group A Runner-up" 
             />
          </div>

          {/* Right Column: Final */}
          <div className="w-[300px] pr-8 flex flex-col justify-center relative z-10">
             <BracketCard 
               title="FINAL" date="05 JUL" 
               team1="SF 1 WINNER" sub1="" 
               team2="SF 2 WINNER" sub2="" 
               isFinal={true}
             />
          </div>
        </div>
      </div>

      <div className="text-center mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs">
         <Info size={14} /> All match dates are subject to change.
      </div>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ activeTab, onChange }: { activeTab: TabId; onChange: (id: TabId) => void }) {
  const tabs: { id: TabId; label: string; isNew?: boolean }[] = [
    { id: "table", label: "STANDINGS" },
    { id: "stats", label: "STATS" },
    { id: "matches", label: "MATCHES" },
    { id: "playoffs", label: "KNOCKOUTS", isNew: true },
  ];

  return (
    <div className="flex border-b border-[#1e1e30] bg-[#111222] sticky top-0 z-20 overflow-x-auto no-scrollbar">
      {tabs.map(({ id, label, isNew }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`relative flex-1 min-w-[80px] sm:min-w-[100px] py-3 sm:py-4 px-1 text-[9px] sm:text-[10px] font-bold tracking-widest transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === id ? "text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {label}
          {isNew && (
            <span className="text-[8px] bg-gradient-to-r from-[#38bdf8] to-[#818cf8] text-white px-1.5 rounded-sm leading-none py-0.5 font-black">WC</span>
          )}
          {activeTab === id && (
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-t-full"
              style={{ width: "40px", background: "#38bdf8", boxShadow: "0 -2px 10px rgba(56,189,248,0.8)" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WCT20Dashboard() {
  const [tab, setTab] = useState<TabId>("table");
  const data = STATIC_DATA;

  return (
    <div className="min-h-screen bg-[#070810]" style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}>
      <div className={`mx-auto px-2 py-3 sm:px-6 sm:py-6 transition-all duration-500 ${tab === "playoffs" ? "max-w-6xl" : "max-w-4xl"}`}>
        <Link href="/MainModules/HomePage" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 mb-5 transition-colors bg-white/5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/5">
          <ArrowLeft size={14} />
          <span>Back to Hub</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-0.5 shadow-lg">
            <div className="w-full h-full bg-[#0b0c16] rounded-full flex items-center justify-center">
              <Trophy size={18} className="text-blue-400" />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-black text-lg sm:text-2xl tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Women's T20 WC 2026
            </h1>
            <p className="text-sky-400 text-[10px] sm:text-xs font-semibold mt-1 tracking-wider uppercase">ICC Match Center</p>
          </div>
        </div>

        {data.todayMatch && (
          <HeroSection todayMatch={data.todayMatch} />
        )}

        <TopPerformersSection mostRuns={data.mostRuns} mostWickets={data.mostWickets} />

        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#0b0c16", border: "1px solid #1e1e30" }}>
          <TabBar activeTab={tab} onChange={setTab} />
          <div className="p-4 sm:p-5">
            {tab === "table"   && <PointsTableTab data={data.pointsTable} />}
            {tab === "stats"   && <StatsTab data={data} />}
            {tab === "matches" && <MatchesTab upcomingMatches={data.upcomingMatches} recentMatches={data.recentMatches} />}
            {tab === "playoffs" && <PlayoffsTab />}
          </div>
        </div>

        <p className="text-center text-gray-600 text-[10px] mt-6 uppercase tracking-widest font-medium">
          All times are in IST • Pre-Tournament Dashboard
        </p>
      </div>
    </div>
  );
}
