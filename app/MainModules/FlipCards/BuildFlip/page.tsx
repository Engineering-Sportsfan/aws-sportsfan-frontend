// "use client";

// import { useState } from "react";

// const SPORTS = [
//     "Cricket",
//     "Football",
//     "Athletics",
//     "Badminton",
//     "Boxing",
//     "Hockey",
//     "Wrestling",
//     "Tennis",
//     "Swimming",
//     "Shooting",
// ];

// export default function FlipFlexCard() {
//     const [sport, setSport] = useState("Cricket");
//     const [gender, setGender] = useState<"Male" | "Female">("Male");
//     const [playerName, setPlayerName] = useState("");
//     const [role, setRole] = useState("");
//     const [country] = useState("India");

//     const canContinue = playerName.trim().length > 0;

//     return (
//         <div className="w-full max-w-sm bg-[#0d0d12] rounded-3xl border border-white/10 overflow-hidden">
//             {/* Header */}
//             <div className="flex items-center justify-between px-5 py-2 border-b border-white/10">
//                 <div className="flex items-center gap-3">
//                     <img
//                         src="https://placehold.co/48x48/1a1a2e/ffffff?text=%F0%9F%A6%88"
//                         alt="FlipFlex"
//                         className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
//                     />
//                     <div>
//                         <div className="flex items-center gap-1.5">
//                             <span className="text-white font-bold text-lg">FlipFlex</span>
//                             <span className="text-orange-500 text-lg">⚡</span>
//                             <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//                                 AI
//                             </span>
//                         </div>
//                         <p className="text-gray-400 text-xs mt-0.5">
//                             AI athlete cards · Learn · Earn SXP
//                         </p>
//                     </div>
//                 </div>
//                 <button className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:text-white">
//                     ✕
//                 </button>
//             </div>

//             {/* Body */}
//             <div className="px-5 py-5 pb-20 space-y-2">
//                 {/* Sport */}
//                 <div>
//                     <p className="text-gray-400 text-xs font-semibold tracking-wider mb-3">
//                         SPORT
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                         {SPORTS.map((s) => {
//                             const active = s === sport;
//                             return (
//                                 <button
//                                     key={s}
//                                     onClick={() => setSport(s)}
//                                     className={
//                                         active
//                                             ? "px-4 py-2 rounded-full text-sm font-semibold text-pink-500 border border-pink-500 bg-pink-500/10"
//                                             : "px-4 py-2 rounded-full text-sm font-medium text-gray-300 border border-white/10 bg-white/5 hover:border-white/20"
//                                     }
//                                 >
//                                     {s}
//                                 </button>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 {/* Player Name */}
//                 <div>
//                     <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
//                         PLAYER NAME
//                     </p>
//                     <input
//                         type="text"
//                         value={playerName}
//                         onChange={(e) => setPlayerName(e.target.value)}
//                         placeholder="e.g. Virat Kohli, Ronaldo..."
//                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
//                     />
//                 </div>

//                 {/* Discipline / Role */}
//                 <div>
//                     <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
//                         DISCIPLINE / ROLE{" "}
//                         <span className="text-gray-600 font-normal normal-case">
//                             (optional)
//                         </span>
//                     </p>
//                     <input
//                         type="text"
//                         value={role}
//                         onChange={(e) => setRole(e.target.value)}
//                         placeholder="e.g. Batting, Bowling"
//                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
//                     />
//                 </div>

//                 {/* Gender / Country */}
//                 <div className="grid grid-cols-2 gap-3">
//                     <div>
//                         <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
//                             GENDER
//                         </p>
//                         <div className="flex gap-2">
//                             <button
//                                 onClick={() => setGender("Male")}
//                                 className={
//                                     gender === "Male"
//                                         ? "flex-1 py-3.5 rounded-xl text-sm font-semibold text-pink-500 border border-pink-500 bg-pink-500/10"
//                                         : "flex-1 py-3.5 rounded-xl text-sm font-medium text-gray-300 border border-white/10 bg-white/5"
//                                 }
//                             >
//                                 Male
//                             </button>
//                             <button
//                                 onClick={() => setGender("Female")}
//                                 className={
//                                     gender === "Female"
//                                         ? "flex-1 py-3.5 rounded-xl text-sm font-semibold text-pink-500 border border-pink-500 bg-pink-500/10"
//                                         : "flex-1 py-3.5 rounded-xl text-sm font-medium text-gray-300 border border-white/10 bg-white/5"
//                                 }
//                             >
//                                 Female
//                             </button>
//                         </div>
//                     </div>
//                     <div>
//                         <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
//                             COUNTRY
//                         </p>
//                         <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm">
//                             {country}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Submit */}
//                 <button
//                     disabled={!canContinue}
//                     className={
//                         canContinue
//                             ? "w-full py-4 rounded-xl bg-pink-600 text-white font-semibold text-sm hover:bg-pink-500 transition-colors"
//                             : "w-full py-4 rounded-xl bg-white/5 text-gray-500 font-semibold text-sm cursor-not-allowed"
//                     }
//                 >
//                     {canContinue ? "Generate Card" : "Enter player name to continue"}
//                 </button>
//             </div>
//         </div>
//     );
// }





"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* ----------------------------- Types ----------------------------- */

const SPORTS = [
  "Cricket",
//   "Football",
//   "Athletics",
//   "Badminton",
//   "Boxing",
//   "Hockey",
//   "Wrestling",
//   "Tennis",
//   "Swimming",
//   "Shooting",
];

interface BattingStats {
  matches: number | null;
  innings: number | null;
  runs: number | null;
  average: number | null;
  strikeRate: number | null;
  hundreds: number | null;
  fifties: number | null;
  highScore: string | null;
}

interface BowlingStats {
  matches: number | null;
  innings: number | null;
  wickets: number | null;
  average: number | null;
  economy: number | null;
  strikeRate: number | null;
  bestBowling: string | null;
}

interface RecordHighlight {
  category: string;
  result: string;
  type: string;
  typeFull: string;
  opponent: string;
  venue: string;
  date: string;
  aiInsight: string;
  benchmarks: {
    label: string;
    value: string;
    holder: string;
    date: string;
    venue: string;
  }[];
}

interface CoreInfo {
  playerId: string;
  name: string;
  country: string;
  flag: string;
  role: string;
  battingStyle: string | null;
  bowlingStyle: string | null;
  dateOfBirth: string | null;
  birthPlace: string | null;
  heightCm: number | null;
  jerseyNo: string | null;
  debutDate: string | null;
  profileImage: string | null;
  bio: string;
}

interface PlayerData {
  playerId: string;
  sportId: string;
  format: string;
  coreInfo: CoreInfo;
  record_highlight: RecordHighlight;
  analytics: {
    battingStats: BattingStats;
    bowlingStats: BowlingStats;
  };
}

/* -------------------------- Country theming -------------------------- */

type Theme = {
  bgFrom: string;
  bgTo: string;
  accent: string;
  accentBorder: string;
  accentBg: string;
  overallBorder: string;
};

function getCountryTheme(country?: string | null): Theme {
  const c = (country || "").trim().toLowerCase();

  if (c === "india") {
    return {
      bgFrom: "from-[#0a1a3a]",
      bgTo: "to-[#050a16]",
      accent: "text-blue-400",
      accentBorder: "border-blue-500",
      accentBg: "bg-blue-500/10",
      overallBorder: "border-blue-500",
    };
  }

  if (c === "sri lanka") {
    return {
      bgFrom: "from-[#3a0a2a]",
      bgTo: "to-[#0f0509]",
      accent: "text-pink-400",
      accentBorder: "border-pink-500",
      accentBg: "bg-pink-500/10",
      overallBorder: "border-pink-500",
    };
  }

  // default / other countries
  return {
    bgFrom: "from-[#2a1a0a]",
    bgTo: "to-[#0f0905]",
    accent: "text-amber-500",
    accentBorder: "border-amber-600",
    accentBg: "bg-amber-600/10",
    overallBorder: "border-amber-600",
  };
}

/* -------------------------- Role → stat cards -------------------------- */

interface StatItem {
  label: string;
  value: string;
  color: string;
}

function isWicketKeeper(role: string) {
  return role.toLowerCase().includes("keeper");
}
function isBowler(role: string) {
  return role.toLowerCase().includes("bowl") && !role.toLowerCase().includes("all");
}
function isAllRounder(role: string) {
  return role.toLowerCase().includes("all-rounder") || role.toLowerCase().includes("all rounder");
}

function fmt(value: number | string | null | undefined, suffix = ""): string {
  if (value === null || value === undefined || value === "") return "—";
  return `${value}${suffix}`;
}

function getStatsForRole(
  role: string,
  batting: BattingStats,
  bowling: BowlingStats
): StatItem[] {
  const battingStats: StatItem[] = [
    { label: "Batting Avg", value: fmt(batting.average), color: "text-pink-500" },
    { label: "Strike Rate", value: fmt(batting.strikeRate), color: "text-blue-400" },
    { label: "Centuries", value: fmt(batting.hundreds), color: "text-amber-400" },
    { label: "Fifties", value: fmt(batting.fifties), color: "text-emerald-400" },
    { label: "High Score", value: fmt(batting.highScore), color: "text-gray-200" },
    { label: "Matches", value: fmt(batting.matches), color: "text-gray-200" },
  ];

  const bowlingStats: StatItem[] = [
    { label: "Wickets", value: fmt(bowling.wickets), color: "text-emerald-400" },
    { label: "Economy", value: fmt(bowling.economy), color: "text-purple-400" },
    { label: "Bowling Avg", value: fmt(bowling.average), color: "text-pink-500" },
    { label: "Bowl. S/Rate", value: fmt(bowling.strikeRate), color: "text-blue-400" },
    { label: "Best Bowling", value: fmt(bowling.bestBowling), color: "text-gray-200" },
    { label: "Matches", value: fmt(bowling.matches), color: "text-gray-200" },
  ];

  if (isWicketKeeper(role)) {
    // Wicketkeepers show batting stats
    return battingStats;
  }

  if (isBowler(role)) {
    return bowlingStats;
  }

  if (isAllRounder(role)) {
    // Mix: batting + bowling
    return [
      { label: "Batting Avg", value: fmt(batting.average), color: "text-pink-500" },
      { label: "Strike Rate", value: fmt(batting.strikeRate), color: "text-blue-400" },
      { label: "Centuries", value: fmt(batting.hundreds), color: "text-amber-400" },
      { label: "Wickets", value: fmt(bowling.wickets), color: "text-emerald-400" },
      { label: "Economy", value: fmt(bowling.economy), color: "text-purple-400" },
      { label: "Matches", value: fmt(batting.matches ?? bowling.matches), color: "text-gray-200" },
    ];
  }

  // Default: Batter
  return battingStats;
}

function computeOverall(batting: BattingStats, bowling: BowlingStats): number {
  const battingScore = batting.average ? Math.min(batting.average * 1.1, 60) : 0;
  const bowlingScore = bowling.wickets ? Math.min(bowling.wickets * 0.08, 40) : 0;
  const base = 55 + battingScore * 0.4 + bowlingScore * 0.4;
  return Math.min(99, Math.round(base));
}

function getHighlights(data: PlayerData): string[] {
  const highlights: string[] = [];
  const rh = data.record_highlight;

  if (rh?.category && rh?.result) {
    highlights.push(`${rh.result} — ${rh.category}${rh.opponent ? ` vs ${rh.opponent}` : ""}`);
  }
  const personal = rh?.benchmarks?.find((b) => b.label === "Personal");
  if (personal) {
    highlights.push(`Personal best ${personal.value}${rh.opponent ? ` vs ${rh.opponent}` : ""}`);
  }
  if (rh?.typeFull) {
    highlights.push(rh.typeFull);
  }
  return highlights.slice(0, 3);
}

/* ------------------------------ Component ------------------------------ */

export default function FlipFlexCard() {
  const [sport, setSport] = useState("Cricket");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [playerName, setPlayerName] = useState("");
  const [role, setRole] = useState("");
  const [country] = useState("India");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [notFoundName, setNotFoundName] = useState<string | null>(null);

  const canContinue = playerName.trim().length > 0;
   const router = useRouter()

  async function handleGenerate() {
    if (!canContinue) return;
    setLoading(true);
    setError(null);
    setPlayerData(null);
    setNotFoundName(null);

    const slug = playerName.trim().toLowerCase().replace(/\s+/g, "_");

    try {
      // Example endpoints:
      //   /api/ms_players/ravindra_jadeja
      //   /api/players/kl_rahul
      const res = await fetch(`/api/ms_players/${slug}`);
      if (res.status === 404) {
        setNotFoundName(playerName.trim());
        return;
      }
      if (!res.ok) throw new Error(`Something went wrong (${res.status})`);
      const data: PlayerData = await res.json();
      setPlayerData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setPlayerData(null);
    setNotFoundName(null);
    setError(null);
  }

  function handleShare() {
    // Hook up to your share/reward flow here.
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "FlipFlex card", text: "Check out my athlete card!" }).catch(() => {});
    }
  }

  /* -------------------------- Player Not Found -------------------------- */
  if (notFoundName) {
    return (
      <div className="w-full max-w-sm mx-auto p-4">
        <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-[#0d0d12]">
          <button
            onClick={handleReset}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:text-white bg-white/5"
          >
            ✕
          </button>
          <div className="flex flex-col items-center text-center px-6 py-14">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-5">
              🔍
            </div>
            <p className="text-white font-bold text-lg leading-snug">
              {notFoundName}
            </p>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              Data is not available and will be added shortly.
            </p>
            <button
              onClick={handleReset}
              className="mt-7 px-6 py-3 rounded-xl bg-white/5 text-gray-200 font-semibold text-sm border border-white/10 hover:bg-white/10"
            >
              Try another player
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------- Result Card ---------------------------- */
  if (playerData) {
    const { coreInfo, analytics } = playerData;
    const theme = getCountryTheme(coreInfo.country);
    const stats = getStatsForRole(coreInfo.role, analytics.battingStats, analytics.bowlingStats);
    const overall = computeOverall(analytics.battingStats, analytics.bowlingStats);
    const highlights = getHighlights(playerData);
    const router = useRouter()

    return (
      <div className="w-full max-w-sm mx-auto p-4 space-y-3">
        <div
          className={`relative rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-b ${theme.bgFrom} ${theme.bgTo} px-5 pt-6 pb-8`}
        >
            
          {/* Close button -> back to form */}
          <button
            onClick={() => router.push("/MainModules/HomePage")}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm z-10"
          >
            ✕
          </button>

          {/* Top row */}
          <div className="flex items-start justify-between pr-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white font-bold text-sm">{coreInfo.flag}</span>
                <span
                  className={`px-3 py-1 rounded-full text-[8px] font-bold ${theme.accent} ${theme.accentBorder} border ${theme.accentBg}`}
                >
                  {sport.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-[8px] font-semibold text-gray-300 border border-white/15 bg-white/5">
                  {coreInfo.role.toLowerCase()}
                </span>
              </div>
              <h2 className="text-white text-4xl font-extrabold leading-tight">
                {coreInfo.name}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {gender} · {coreInfo.country}
              </p>
            </div>

            <div
              className={`flex flex-col items-center justify-center w-15 h-15 rounded-2xl border-2 ${theme.overallBorder} shrink-0`}
            >
              <span className="text-white text-2xl font-extrabold">{overall}</span>
              <span className={`text-[9px] font-bold tracking-wider ${theme.accent}`}>
                OVERALL
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 mt-8 border-t border-l border-white/10">
            {stats.map((s) => (
              <div
                key={s.label}
                className="text-center py-6 px-2 border-r border-b border-white/10"
              >
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-gray-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="mt-8">
              <p className="text-gray-400 text-xs font-semibold tracking-wider mb-3">
                CAREER HIGHLIGHTS
              </p>
              <ul className="space-y-3">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-200 text-sm">
                    <span className={`mt-1 text-xs ${theme.accent}`}>◆</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/10">
            <img
              src="https://placehold.co/20x20/1a1a2e/ffffff?text=%F0%9F%A6%88"
              alt="FlipFlex"
              className="w-5 h-5 rounded-full"
            />
            <span className="text-gray-500 text-xs">FlipFlex by Flip · SportsFan360</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pb-15">
          <button
            onClick={handleReset}
            className="flex-1 py-4 rounded-2xl bg-white/5 text-gray-300 font-semibold text-sm border border-white/10 hover:bg-white/10"
          >
            New Card
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center justify-center gap-1">
              Share Card <span className="text-base leading-none">↗</span>
            </span>
            {/* <span className="block text-[11px] font-medium opacity-90 mt-0.5">+50 SXP</span> */}
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------ Form View ------------------------------ */
  return (
    <div className="w-full max-w-sm bg-[#0d0d12] rounded-3xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/images/dollyavatar.png"
            alt="FlipFlex"
            className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-lg">FlipFlex</span>
              <span className="text-orange-500 text-lg">⚡</span>
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                AI
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">
              AI athlete cards · Learn · Earn SXP
            </p>
          </div>
        </div>
        {/* <button className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:text-white">
          ✕
        </button> */}
         <button
          onClick={() => router.push("/MainModules/HomePage")}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-5 pb-20 space-y-2">
        {/* Sport */}
        <div>
          <p className="text-gray-400 text-xs font-semibold tracking-wider mb-3">
            SPORT
          </p>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((s) => {
              const active = s === sport;
              return (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={
                    active
                      ? "px-4 py-2 rounded-full text-sm font-semibold text-pink-500 border border-pink-500 bg-pink-500/10"
                      : "px-4 py-2 rounded-full text-sm font-medium text-gray-300 border border-white/10 bg-white/5 hover:border-white/20"
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player Name */}
        <div>
          <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
            PLAYER NAME
          </p>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="e.g. Virat Kohli, Ronaldo..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Discipline / Role */}
        <div>
          <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
            DISCIPLINE / ROLE{" "}
            <span className="text-gray-600 font-normal normal-case">
              (optional)
            </span>
          </p>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Batting, Bowling"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Gender / Country */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
              GENDER
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setGender("Male")}
                className={
                  gender === "Male"
                    ? "flex-1 py-3.5 rounded-xl text-sm font-semibold text-pink-500 border border-pink-500 bg-pink-500/10"
                    : "flex-1 py-3.5 rounded-xl text-sm font-medium text-gray-300 border border-white/10 bg-white/5"
                }
              >
                Male
              </button>
              <button
                onClick={() => setGender("Female")}
                className={
                  gender === "Female"
                    ? "flex-1 py-3.5 rounded-xl text-sm font-semibold text-pink-500 border border-pink-500 bg-pink-500/10"
                    : "flex-1 py-3.5 rounded-xl text-sm font-medium text-gray-300 border border-white/10 bg-white/5"
                }
              >
                Female
              </button>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
              COUNTRY
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm">
              {country}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs pt-1">{error}</p>}

        {/* Submit */}
        <button
          disabled={!canContinue || loading}
          onClick={handleGenerate}
          className={
            canContinue && !loading
              ? "w-full py-4 rounded-xl bg-pink-600 text-white font-semibold text-sm hover:bg-pink-500 transition-colors"
              : "w-full py-4 rounded-xl bg-white/5 text-gray-500 font-semibold text-sm cursor-not-allowed"
          }
        >
          {loading
            ? "Generating card..."
            : canContinue
            ? "Generate Card"
            : "Enter player name to continue"}
        </button>
      </div>
    </div>
  );
}