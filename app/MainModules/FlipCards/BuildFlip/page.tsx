


// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";

// /* ----------------------------- Types ----------------------------- */

// const SPORTS = [
//   "Cricket",
// //   "Football",
// //   "Athletics",
// //   "Badminton",
// //   "Boxing",
// //   "Hockey",
// //   "Wrestling",
// //   "Tennis",
// //   "Swimming",
// //   "Shooting",
// ];

// interface BattingStats {
//   matches: number | null;
//   innings: number | null;
//   runs: number | null;
//   average: number | null;
//   strikeRate: number | null;
//   hundreds: number | null;
//   fifties: number | null;
//   highScore: string | null;
// }

// interface BowlingStats {
//   matches: number | null;
//   innings: number | null;
//   wickets: number | null;
//   average: number | null;
//   economy: number | null;
//   strikeRate: number | null;
//   bestBowling: string | null;
// }

// interface RecordHighlight {
//   category: string;
//   result: string;
//   type: string;
//   typeFull: string;
//   opponent: string;
//   venue: string;
//   date: string;
//   aiInsight: string;
//   benchmarks: {
//     label: string;
//     value: string;
//     holder: string;
//     date: string;
//     venue: string;
//   }[];
// }

// interface CoreInfo {
//   playerId: string;
//   name: string;
//   country: string;
//   flag: string;
//   role: string;
//   battingStyle: string | null;
//   bowlingStyle: string | null;
//   dateOfBirth: string | null;
//   birthPlace: string | null;
//   heightCm: number | null;
//   jerseyNo: string | null;
//   debutDate: string | null;
//   profileImage: string | null;
//   bio: string;
// }

// interface PlayerData {
//   playerId: string;
//   sportId: string;
//   format: string;
//   coreInfo: CoreInfo;
//   record_highlight: RecordHighlight;
//   analytics: {
//     battingStats: BattingStats;
//     bowlingStats: BowlingStats;
//   };
// }

// /* -------------------------- Country theming -------------------------- */

// type Theme = {
//   bgFrom: string;
//   bgTo: string;
//   accent: string;
//   accentBorder: string;
//   accentBg: string;
//   overallBorder: string;
// };

// function getCountryTheme(country?: string | null): Theme {
//   const c = (country || "").trim().toLowerCase();

//   if (c === "india") {
//     return {
//       bgFrom: "from-[#0a1a3a]",
//       bgTo: "to-[#050a16]",
//       accent: "text-blue-400",
//       accentBorder: "border-blue-500",
//       accentBg: "bg-blue-500/10",
//       overallBorder: "border-blue-500",
//     };
//   }

//   if (c === "sri lanka") {
//     return {
//       bgFrom: "from-[#3a0a2a]",
//       bgTo: "to-[#0f0509]",
//       accent: "text-pink-400",
//       accentBorder: "border-pink-500",
//       accentBg: "bg-pink-500/10",
//       overallBorder: "border-pink-500",
//     };
//   }

//   // default / other countries
//   return {
//     bgFrom: "from-[#2a1a0a]",
//     bgTo: "to-[#0f0905]",
//     accent: "text-amber-500",
//     accentBorder: "border-amber-600",
//     accentBg: "bg-amber-600/10",
//     overallBorder: "border-amber-600",
//   };
// }

// /* -------------------------- Role → stat cards -------------------------- */

// interface StatItem {
//   label: string;
//   value: string;
//   color: string;
// }

// function isWicketKeeper(role: string) {
//   return role.toLowerCase().includes("keeper");
// }
// function isBowler(role: string) {
//   return role.toLowerCase().includes("bowl") && !role.toLowerCase().includes("all");
// }
// function isAllRounder(role: string) {
//   return role.toLowerCase().includes("all-rounder") || role.toLowerCase().includes("all rounder");
// }

// function fmt(value: number | string | null | undefined, suffix = ""): string {
//   if (value === null || value === undefined || value === "") return "—";
//   return `${value}${suffix}`;
// }

// function getStatsForRole(
//   role: string,
//   batting: BattingStats,
//   bowling: BowlingStats
// ): StatItem[] {
//   const battingStats: StatItem[] = [
//     { label: "Batting Avg", value: fmt(batting.average), color: "text-pink-500" },
//     { label: "Strike Rate", value: fmt(batting.strikeRate), color: "text-blue-400" },
//     { label: "Centuries", value: fmt(batting.hundreds), color: "text-amber-400" },
//     { label: "Fifties", value: fmt(batting.fifties), color: "text-emerald-400" },
//     { label: "High Score", value: fmt(batting.highScore), color: "text-gray-200" },
//     { label: "Matches", value: fmt(batting.matches), color: "text-gray-200" },
//   ];

//   const bowlingStats: StatItem[] = [
//     { label: "Wickets", value: fmt(bowling.wickets), color: "text-emerald-400" },
//     { label: "Economy", value: fmt(bowling.economy), color: "text-purple-400" },
//     { label: "Bowling Avg", value: fmt(bowling.average), color: "text-pink-500" },
//     { label: "Bowl. S/Rate", value: fmt(bowling.strikeRate), color: "text-blue-400" },
//     { label: "Best Bowling", value: fmt(bowling.bestBowling), color: "text-gray-200" },
//     { label: "Matches", value: fmt(bowling.matches), color: "text-gray-200" },
//   ];

//   if (isWicketKeeper(role)) {
//     // Wicketkeepers show batting stats
//     return battingStats;
//   }

//   if (isBowler(role)) {
//     return bowlingStats;
//   }

//   if (isAllRounder(role)) {
//     // Mix: batting + bowling
//     return [
//       { label: "Batting Avg", value: fmt(batting.average), color: "text-pink-500" },
//       { label: "Strike Rate", value: fmt(batting.strikeRate), color: "text-blue-400" },
//       { label: "Centuries", value: fmt(batting.hundreds), color: "text-amber-400" },
//       { label: "Wickets", value: fmt(bowling.wickets), color: "text-emerald-400" },
//       { label: "Economy", value: fmt(bowling.economy), color: "text-purple-400" },
//       { label: "Matches", value: fmt(batting.matches ?? bowling.matches), color: "text-gray-200" },
//     ];
//   }

//   // Default: Batter
//   return battingStats;
// }

// function computeOverall(batting: BattingStats, bowling: BowlingStats): number {
//   const battingScore = batting.average ? Math.min(batting.average * 1.1, 60) : 0;
//   const bowlingScore = bowling.wickets ? Math.min(bowling.wickets * 0.08, 40) : 0;
//   const base = 55 + battingScore * 0.4 + bowlingScore * 0.4;
//   return Math.min(99, Math.round(base));
// }

// function getHighlights(data: PlayerData): string[] {
//   const highlights: string[] = [];
//   const rh = data.record_highlight;

//   if (rh?.category && rh?.result) {
//     highlights.push(`${rh.result} — ${rh.category}${rh.opponent ? ` vs ${rh.opponent}` : ""}`);
//   }
//   const personal = rh?.benchmarks?.find((b) => b.label === "Personal");
//   if (personal) {
//     highlights.push(`Personal best ${personal.value}${rh.opponent ? ` vs ${rh.opponent}` : ""}`);
//   }
//   if (rh?.typeFull) {
//     highlights.push(rh.typeFull);
//   }
//   return highlights.slice(0, 3);
// }

// /* ------------------------------ Component ------------------------------ */

// export default function FlipFlexCard() {
//   const [sport, setSport] = useState("Cricket");
//   const [gender, setGender] = useState<"Male" | "Female">("Male");
//   const [playerName, setPlayerName] = useState("");
//   const [role, setRole] = useState("");
//   const [country] = useState("India");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [playerData, setPlayerData] = useState<PlayerData | null>(null);
//   const [notFoundName, setNotFoundName] = useState<string | null>(null);

//   const canContinue = playerName.trim().length > 0;
//    const router = useRouter()

//   async function handleGenerate() {
//     if (!canContinue) return;
//     setLoading(true);
//     setError(null);
//     setPlayerData(null);
//     setNotFoundName(null);

//     const slug = playerName.trim().toLowerCase().replace(/\s+/g, "_");

//     try {
//       // Example endpoints:
//       //   /api/ms_players/ravindra_jadeja
//       //   /api/players/kl_rahul
//       const res = await fetch(`/api/ms_players/${slug}`);
//       if (res.status === 404) {
//         setNotFoundName(playerName.trim());
//         return;
//       }
//       if (!res.ok) throw new Error(`Something went wrong (${res.status})`);
//       const data: PlayerData = await res.json();
//       setPlayerData(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleReset() {
//     setPlayerData(null);
//     setNotFoundName(null);
//     setError(null);
//   }

//   function handleShare() {
//     // Hook up to your share/reward flow here.
//     if (typeof navigator !== "undefined" && navigator.share) {
//       navigator.share({ title: "FlipFlex card", text: "Check out my athlete card!" }).catch(() => {});
//     }
//   }

//   /* -------------------------- Player Not Found -------------------------- */
//   if (notFoundName) {
//     return (
//       <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pb-20 lg:pb-8">
//         <div className="w-full max-w-sm my-auto">
//           <div className="relative rounded-3xl border border-white/10 overflow-hidden bg-[#0d0d12] shadow-2xl">
//             <button
//               onClick={handleReset}
//               aria-label="Close"
//               className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:text-white bg-white/5 cursor-pointer"
//             >
//               ✕
//             </button>
//             <div className="flex flex-col items-center text-center px-6 py-14">
//               <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-5">
//                 🔍
//               </div>
//               <p className="text-white font-bold text-lg leading-snug">
//                 {notFoundName}
//               </p>
//               <p className="text-gray-400 text-sm mt-2 leading-relaxed">
//                 Data is not available and will be added shortly.
//               </p>
//               <button
//                 onClick={handleReset}
//                 className="mt-7 px-6 py-3 rounded-xl bg-white/5 text-gray-200 font-semibold text-sm border border-white/10 hover:bg-white/10 cursor-pointer"
//               >
//                 Try another player
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------------------- Result Card ---------------------------- */
//   if (playerData) {
//     const { coreInfo, analytics } = playerData;
//     const theme = getCountryTheme(coreInfo.country);
//     const stats = getStatsForRole(coreInfo.role, analytics.battingStats, analytics.bowlingStats);
//     const overall = computeOverall(analytics.battingStats, analytics.bowlingStats);
//     const highlights = getHighlights(playerData);

//     return (
//       <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pb-20 lg:pb-8">
//         <div className="w-full max-w-sm my-auto space-y-3">
//           <div
//             className={`relative rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-b ${theme.bgFrom} ${theme.bgTo} px-5 pt-6 pb-8 shadow-2xl`}
//           >
//             {/* Close button -> back to form */}
//             <button
//               onClick={() => router.push("/MainModules/HomePage")}
//               aria-label="Close"
//               className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm z-10 cursor-pointer"
//             >
//               ✕
//             </button>

//             {/* Top row */}
//             <div className="flex items-start justify-between pr-10">
//               <div>
//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="text-white font-bold text-sm">{coreInfo.flag}</span>
//                   <span
//                     className={`px-3 py-1 rounded-full text-[8px] font-bold ${theme.accent} ${theme.accentBorder} border ${theme.accentBg}`}
//                   >
//                     {sport.toUpperCase()}
//                   </span>
//                   <span className="px-3 py-1 rounded-full text-[8px] font-semibold text-gray-300 border border-white/15 bg-white/5">
//                     {coreInfo.role.toLowerCase()}
//                   </span>
//                 </div>
//                 <h2 className="text-white text-4xl font-extrabold leading-tight">
//                   {coreInfo.name}
//                 </h2>
//                 <p className="text-gray-400 text-sm mt-1">
//                   {gender} · {coreInfo.country}
//                 </p>
//               </div>

//               <div
//                 className={`flex flex-col items-center justify-center w-15 h-15 rounded-2xl border-2 ${theme.overallBorder} shrink-0`}
//               >
//                 <span className="text-white text-2xl font-extrabold">{overall}</span>
//                 <span className={`text-[9px] font-bold tracking-wider ${theme.accent}`}>
//                   OVERALL
//                 </span>
//               </div>
//             </div>

//             {/* Stats grid */}
//             <div className="grid grid-cols-3 mt-8 border-t border-l border-white/10">
//               {stats.map((s) => (
//                 <div
//                   key={s.label}
//                   className="text-center py-6 px-2 border-r border-b border-white/10"
//                 >
//                   <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
//                   <div className="text-gray-400 text-xs mt-1">{s.label}</div>
//                 </div>
//               ))}
//             </div>

//             {/* Highlights */}
//             {highlights.length > 0 && (
//               <div className="mt-8">
//                 <p className="text-gray-400 text-xs font-semibold tracking-wider mb-3">
//                   CAREER HIGHLIGHTS
//                 </p>
//                 <ul className="space-y-3">
//                   {highlights.map((h, i) => (
//                     <li key={i} className="flex items-start gap-2 text-gray-200 text-sm">
//                       <span className={`mt-1 text-xs ${theme.accent}`}>◆</span>
//                       <span>{h}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Footer */}
//             <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/10">
//               <img
//                 src="https://placehold.co/20x20/1a1a2e/ffffff?text=%F0%9F%A6%88"
//                 alt="FlipFlex"
//                 className="w-5 h-5 rounded-full"
//               />
//               <span className="text-gray-500 text-xs">FlipFLEX by Flip · SportsFan360</span>
//             </div>
//           </div>

//           {/* Action buttons */}
//           <div className="flex items-center gap-3">
//             <button
//               onClick={handleReset}
//               className="flex-1 py-4 rounded-2xl bg-white/5 text-gray-300 font-semibold text-sm border border-white/10 hover:bg-white/10 cursor-pointer"
//             >
//               New Card
//             </button>
//             <button
//               onClick={handleShare}
//               className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
//             >
//               <span className="flex items-center justify-center gap-1">
//                 Share Card <span className="text-base leading-none">↗</span>
//               </span>
//               {/* <span className="block text-[11px] font-medium opacity-90 mt-0.5">+50 SXP</span> */}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ------------------------------ Form View ------------------------------ */
//   return (
//     <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pb-20 lg:pb-8">
//       <div className="w-full max-w-sm my-auto bg-[#0d0d12] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
//         {/* Header */}
//         <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10">
//           <div className="flex items-center gap-3">
//             <img
//               src="/images/dollyavatar.png"
//               alt="FlipFlex"
//               className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
//             />
//             <div>
//               <div className="flex items-center gap-1.5">
//                 <span className="text-white font-bold text-lg">FlipFLEX</span>
//                 <span className="text-orange-500 text-lg">⚡</span>
//                 <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//                   AI
//                 </span>
//               </div>
//               <p className="text-gray-400 text-xs mt-0.5">
//                 AI athlete cards · Learn · Earn SXP
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => router.push("/MainModules/HomePage")}
//             className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer"
//             style={{ background: "rgba(255,255,255,0.08)" }}
//           >
//             ✕
//           </button>
//         </div>

//         {/* Body */}
//         <div className="px-5 py-5 pb-6 space-y-2">
//           {/* Sport */}
//           <div>
//             <p className="text-gray-400 text-xs font-semibold tracking-wider mb-3">
//               SPORT
//             </p>
//             <div className="flex flex-wrap gap-2">
//               {SPORTS.map((s) => {
//                 const active = s === sport;
//                 return (
//                   <button
//                     key={s}
//                     onClick={() => setSport(s)}
//                     className={
//                       active
//                         ? "px-4 py-2 rounded-full text-sm font-semibold text-pink-500 border border-pink-500 bg-pink-500/10"
//                         : "px-4 py-2 rounded-full text-sm font-medium text-gray-300 border border-white/10 bg-white/5 hover:border-white/20"
//                     }
//                   >
//                     {s}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Player Name */}
//           <div>
//             <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
//               PLAYER NAME
//             </p>
//             <input
//               type="text"
//               value={playerName}
//               onChange={(e) => setPlayerName(e.target.value)}
//               placeholder="e.g. Virat Kohli, Ronaldo..."
//               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
//             />
//           </div>

//           {/* Discipline / Role */}
//           <div>
//             <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
//               DISCIPLINE / ROLE{" "}
//               <span className="text-gray-600 font-normal normal-case">
//                 (optional)
//               </span>
//             </p>
//             <input
//               type="text"
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               placeholder="e.g. Batting, Bowling"
//               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
//             />
//           </div>

//           {/* Gender / Country */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
//                 GENDER
//               </p>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setGender("Male")}
//                   className={
//                     gender === "Male"
//                       ? "flex-1 py-3.5 rounded-xl text-sm font-semibold text-pink-500 border border-pink-500 bg-pink-500/10"
//                       : "flex-1 py-3.5 rounded-xl text-sm font-medium text-gray-300 border border-white/10 bg-white/5"
//                   }
//                 >
//                   Male
//                 </button>
//                 <button
//                   onClick={() => setGender("Female")}
//                   className={
//                     gender === "Female"
//                       ? "flex-1 py-3.5 rounded-xl text-sm font-semibold text-pink-500 border border-pink-500 bg-pink-500/10"
//                       : "flex-1 py-3.5 rounded-xl text-sm font-medium text-gray-300 border border-white/10 bg-white/5"
//                   }
//                 >
//                   Female
//                 </button>
//               </div>
//             </div>
//             <div>
//               <p className="text-gray-400 text-xs font-semibold tracking-wider mb-2">
//                 COUNTRY
//               </p>
//               <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm">
//                 {country}
//               </div>
//             </div>
//           </div>

//           {error && <p className="text-red-400 text-xs pt-1">{error}</p>}

//           {/* Submit */}
//           <button
//             disabled={!canContinue || loading}
//             onClick={handleGenerate}
//             className={
//               canContinue && !loading
//                 ? "w-full py-4 rounded-xl bg-pink-600 text-white font-semibold text-sm hover:bg-pink-500 transition-colors cursor-pointer"
//                 : "w-full py-4 rounded-xl bg-white/5 text-gray-500 font-semibold text-sm cursor-not-allowed"
//             }
//           >
//             {loading
//               ? "Generating card..."
//               : canContinue
//               ? "Generate Card"
//               : "Enter player name to continue"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }









"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlayerSearch } from "@/hooks/usePlayerSearch";
import { Sparkles, RefreshCw, Share2, Check } from "lucide-react";

/* ----------------------------- Types ----------------------------- */

const SPORTS = [
  "Cricket",
  "Athletics",
  "Football",
  "Badminton",
  "Tennis",
  "Basketball",
];

interface StatItem {
  label: string;
  value: string;
  color: string;
}

interface NormalizedCard {
  id: string;
  name: string;
  country: string;
  flag: string;
  sport: string;
  role: string;
  gender: string;
  overall: number;
  stats: StatItem[];
  highlights: string[];
  theme: {
    bgFrom: string;
    bgTo: string;
    accent: string;
    accentBorder: string;
    accentBg: string;
    overallBorder: string;
  };
  profileImage?: string | null;
  source: "database" | "ai-generated";
}

/* -------------------------- Country Theming -------------------------- */

function getCountryTheme(country?: string | null) {
  const c = (country || "").trim().toLowerCase();

  if (c.includes("india") || c === "in" || c === "ind") {
    return {
      bgFrom: "from-[#0a1a3a]",
      bgTo: "to-[#050a16]",
      accent: "text-blue-400",
      accentBorder: "border-blue-500",
      accentBg: "bg-blue-500/10",
      overallBorder: "border-blue-500",
    };
  }

  if (c.includes("sri lanka") || c.includes("west indies")) {
    return {
      bgFrom: "from-[#3a0a2a]",
      bgTo: "to-[#0f0509]",
      accent: "text-pink-400",
      accentBorder: "border-pink-500",
      accentBg: "bg-pink-500/10",
      overallBorder: "border-pink-500",
    };
  }

  if (c.includes("australia") || c.includes("south africa")) {
    return {
      bgFrom: "from-[#0a2a1a]",
      bgTo: "to-[#050f09]",
      accent: "text-emerald-400",
      accentBorder: "border-emerald-500",
      accentBg: "bg-emerald-500/10",
      overallBorder: "border-emerald-500",
    };
  }

  return {
    bgFrom: "from-[#2a1a0a]",
    bgTo: "to-[#0f0905]",
    accent: "text-amber-500",
    accentBorder: "border-amber-600",
    accentBg: "bg-amber-600/10",
    overallBorder: "border-amber-600",
  };
}

function getFlagEmoji(countryOrCode?: string | null): string {
  if (!countryOrCode) return "🌐";
  const c = countryOrCode.toLowerCase().trim();
  if (c === "in" || c.includes("india")) return "🇮🇳";
  if (c === "au" || c.includes("australia")) return "🇦🇺";
  if (c === "gb" || c === "eng" || c.includes("england")) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  if (c === "pk" || c.includes("pakistan")) return "🇵🇰";
  if (c === "lk" || c.includes("sri lanka")) return "🇱🇰";
  if (c === "za" || c.includes("south africa")) return "🇿🇦";
  if (c === "nz" || c.includes("new zealand")) return "🇳🇿";
  if (c === "us" || c.includes("usa") || c.includes("united states")) return "🇺🇸";
  if (c.includes("kenya")) return "🇰🇪";
  if (c.includes("jamaica")) return "🇯🇲";
  if (c.includes("portugal")) return "🇵🇹";
  if (c.includes("argentina")) return "🇦🇷";
  return "🏆";
}

function fmt(val: unknown, suffix = ""): string {
  if (val === null || val === undefined || val === "" || val === "–") return "—";
  return `${val}${suffix}`;
}

function getStatValueFontSize(val: string): string {
  const len = (val || "").trim().length;
  if (len <= 4) return "text-xl sm:text-2xl";
  if (len <= 7) return "text-base sm:text-lg";
  if (len <= 11) return "text-xs sm:text-sm";
  if (len <= 18) return "text-[11px] sm:text-xs leading-tight";
  return "text-[9.5px] sm:text-[10px] leading-snug";
}

/* ------------------ Schema Normalizer (Matches Both JSONs) ------------------ */

function normalizeAnyAthlete(
  raw: any,
  fallbackSport: string,
  fallbackGender: string,
  source: "database" | "ai-generated" = "database"
): NormalizedCard {
  const profile = raw?.profile || raw;
  const core = profile?.coreInfo || profile;
  const analytics = profile?.analytics || {};
  const perf = profile?.performance || {};
  const record = profile?.record_highlight || {};
  const aiStats = profile?.stats || {};
  const overview = profile?.overview || {};

  const name = core?.name || profile?.name || "Athlete";
  const sportId = (profile?.sportId || profile?.sport || fallbackSport || "Cricket").toLowerCase();
  const country = core?.country || profile?.country || "India";
  const flag = getFlagEmoji(core?.flag || profile?.country || country);
  const gender = core?.gender || fallbackGender || "Men";

  /* -------------------------------------------------------------
   * 1. CRICKET (e.g. Abhishek Sharma)
   * ------------------------------------------------------------- */
  if (sportId.includes("cricket")) {
    const role = core?.role || profile?.role || "All-rounder";
    const rLower = role.toLowerCase();

    const batting = analytics?.battingStats || profile?.battingStats || {};
    const bowling = analytics?.bowlingStats || profile?.bowlingStats || {};

    const runs = batting.runs ?? aiStats.runs;
    const avg = batting.average ?? batting.avg ?? aiStats.avg;
    const sr = batting.strikeRate ?? batting.sr ?? aiStats.sr;
    const wkt = bowling.wickets ?? aiStats.wickets;
    const econ = bowling.economy ?? aiStats.econ;
    const hs = batting.highScore ?? aiStats.highScore;
    const hundreds = batting.hundreds ?? aiStats.hundreds;
    const fifties = batting.fifties ?? aiStats.fifties;
    const matches = batting.matches || bowling.matches || overview.matches;

    // Build role-tailored stats grid
    let stats: StatItem[] = [];
    if (rLower.includes("bowl") && !rLower.includes("all")) {
      stats = [
        { label: "Wickets", value: fmt(wkt), color: "text-emerald-400" },
        { label: "Economy", value: fmt(econ), color: "text-purple-400" },
        { label: "Bowling Avg", value: fmt(bowling.average), color: "text-pink-500" },
        { label: "Best Bowling", value: fmt(bowling.bestBowling), color: "text-amber-400" },
        { label: "Strike Rate", value: fmt(bowling.strikeRate), color: "text-blue-400" },
        { label: "Matches", value: fmt(matches), color: "text-gray-200" },
      ];
    } else if (rLower.includes("all")) {
      stats = [
        { label: "Runs", value: fmt(runs), color: "text-amber-400" },
        { label: "Batting Avg", value: fmt(avg), color: "text-pink-500" },
        { label: "Strike Rate", value: fmt(sr), color: "text-blue-400" },
        { label: "Wickets", value: fmt(wkt), color: "text-emerald-400" },
        { label: "High Score", value: fmt(hs), color: "text-rose-400" },
        { label: "Matches", value: fmt(matches), color: "text-gray-200" },
      ];
    } else {
      stats = [
        { label: "Runs", value: fmt(runs), color: "text-amber-400" },
        { label: "Batting Avg", value: fmt(avg), color: "text-pink-500" },
        { label: "Strike Rate", value: fmt(sr), color: "text-blue-400" },
        { label: "Centuries", value: fmt(hundreds), color: "text-amber-400" },
        { label: "Fifties", value: fmt(fifties), color: "text-emerald-400" },
        { label: "Matches", value: fmt(matches), color: "text-gray-200" },
      ];
    }

    // Dynamic Cricket Overall Rating (0-99)
    const avgNum = parseFloat(String(avg)) || 0;
    const srNum = parseFloat(String(sr)) || 0;
    const wktNum = parseFloat(String(wkt)) || 0;
    let overall = 78;
    if (avgNum > 45 || srNum > 160 || wktNum > 50) overall = 93;
    else if (avgNum > 30 || srNum > 140 || wktNum > 15) overall = 88;
    else if (avgNum > 25) overall = 84;

    // Career Highlights
    const highlights: string[] = [];
    if (record?.result && record?.category) {
      highlights.push(`${record.result} — ${record.category}${record.opponent ? ` vs ${record.opponent}` : ""}`);
    }
    if (batting?.sixes && batting?.fours) {
      highlights.push(`${batting.sixes} Sixes · ${batting.fours} Fours in ${matches || 0} Matches`);
    }
    if (record?.aiInsight) {
      highlights.push(record.aiInsight);
    } else if (core?.bio) {
      highlights.push(core.bio.slice(0, 120) + "...");
    }

    return {
      id: profile.playerId || profile.id || name.toLowerCase().replace(/\s+/g, "_"),
      name,
      country,
      flag,
      sport: (profile.tournament || profile.format || "CRICKET").toUpperCase(),
      role,
      gender,
      overall,
      stats,
      highlights: highlights.slice(0, 3),
      theme: getCountryTheme(country),
      profileImage: core?.profileImage || profile?.profileImage || profile?.avatar || null,
      source,
    };
  }

  /* -------------------------------------------------------------
   * 2. MULTI-SPORT ATHLETE (e.g. Neeraj Chopra)
   * ------------------------------------------------------------- */
   /* -------------------------------------------------------------
   * 2. MULTI-SPORT ATHLETE (e.g. Usain Bolt, Neeraj Chopra)
   * ------------------------------------------------------------- */
  const eventName = record?.event || analytics?.sport || perf?.primaryEvent || overview?.specialization || "Athletics";
  const roleName = perf?.category || record?.typeFull || core?.role || overview?.specialization || "Athlete";

  const aStats = analytics?.stats || {};
  const rawStats = profile?.stats || {};
  const overviewData = profile?.overview || {};

  // 1. Personal Best (e.g. 9.58s (100m))
  const pb = analytics?.heroStat || aStats?.personalBest || rawStats?.personalBest || perf?.stats?.personalBest || record?.result || "World Class";

  // 2. Olympic Gold
  const olympicGoldRaw = aStats?.olympicGold ?? rawStats?.olympicGold ?? (perf?.medalCabinet?.filter((m: any) => m.medal === "GOLD" && m.category?.includes("Olympic")).length || 0);
  const olympicGold = parseInt(String(olympicGoldRaw || 0), 10);

  // 3. Total Medals (Must ALWAYS be >= Olympic Gold so you never get 0 when gold is 8)
  let parsedTotalMedals = parseInt(String(aStats?.totalMedals ?? rawStats?.totalMedals ?? 0), 10);
  const cabinetGold = perf?.medalCabinet?.filter((m: any) => m.medal === "GOLD").length || 0;
  const cabinetSilver = perf?.medalCabinet?.filter((m: any) => m.medal === "SILVER").length || 0;
  let totalMedals = Math.max(parsedTotalMedals, cabinetGold + cabinetSilver, olympicGold);

  // If still 0, check bio for medal mentions (e.g. "22 world and olympic medals")
  if (totalMedals === 0 && core?.bio) {
    const medalMatch = core.bio.match(/(\d+)\s*(?:olympic|world|gold|total)?\s*medals/i);
    if (medalMatch) totalMedals = parseInt(medalMatch[1], 10);
  }

  // 4. World Rank
  let worldRank = aStats?.worldRank || rawStats?.worldRank || perf?.stats?.worldRank || "";
  let cleanRank = "—";
  if (worldRank && !String(worldRank).includes("–") && !String(worldRank).includes("—")) {
    cleanRank = String(worldRank).startsWith("#") ? String(worldRank) : `#${String(worldRank).replace(/^#/, "")}`;
  } else if (olympicGold > 0 || totalMedals > 0) {
    cleanRank = "#1 (Peak)";
  }

  // 5. Best Year (Never show dash '—')
  let bestYear = aStats?.bestYear || rawStats?.bestYear || record?.date?.split("-")[0] || null;
  if (!bestYear || bestYear === "–" || bestYear === "-" || bestYear === "null") {
    // Find peak year mentioned in PB, career highlights, or bio (e.g. 2008, 2009, 2012)
    const contentToSearch = `${pb} ${overviewData.debut || ""} ${(profile?.highlights || []).join(" ")} ${core?.bio || ""}`;
    const yearMatches = contentToSearch.match(/\b(19\d{2}|20\d{2})\b/g);
    if (yearMatches && yearMatches.length > 0) {
      bestYear = yearMatches[0];
    } else {
      bestYear = "Peak Era";
    }
  }

  // 6. Specialty / Discipline (NEVER duplicate Personal Best)
  let specialty = overviewData.specialization || record?.event || roleName || "Sprint";
  if (String(specialty).toLowerCase().trim() === String(pb).toLowerCase().trim() || specialty.includes(":") || specialty.includes("s")) {
    specialty = roleName !== "Throws" ? roleName : "Sprint";
  }

  // Overall Score Calculation (0-99)
  let athleteOverall = 88;
  if (olympicGold >= 4 || cleanRank.includes("1")) athleteOverall = 99;
  else if (olympicGold > 0 || totalMedals >= 5) athleteOverall = 96;
  else if (totalMedals > 0) athleteOverall = 92;

  const multiStats: StatItem[] = [
    { label: "Personal Best", value: fmt(pb), color: "text-amber-400" },
    { label: "Olympic Gold", value: olympicGold > 0 ? String(olympicGold) : "—", color: "text-yellow-400" },
    { label: "World Rank", value: cleanRank, color: "text-emerald-400" },
    { label: "Total Medals", value: totalMedals > 0 ? String(totalMedals) : "Elite", color: "text-sky-400" },
    { label: "Best Year", value: fmt(bestYear), color: "text-purple-400" },
    { label: "Specialty", value: fmt(specialty), color: "text-rose-400" },
  ];

  const multiHighlights: string[] = [];
  if (record?.result && (record?.typeFull || record?.type)) {
    multiHighlights.push(`${record.result} — ${record.typeFull || record.type}${record.city ? ` (${record.city})` : ""}`);
  }
  if (analytics?.achievementLabel) {
    multiHighlights.push(analytics.achievementLabel);
  }
  if (record?.aiInsight) {
    multiHighlights.push(record.aiInsight);
  } else if (core?.bio) {
    multiHighlights.push(core.bio.slice(0, 120) + "...");
  }

  return {
    id: profile.athlete_id || profile.athleteId || profile.id || name.toLowerCase().replace(/\s+/g, "_"),
    name,
    country,
    flag,
    sport: eventName.toUpperCase(),
    role: roleName,
    gender,
    overall: athleteOverall,
    stats: multiStats,
    highlights: multiHighlights.slice(0, 3),
    theme: getCountryTheme(country),
    profileImage: core?.profileImage || profile?.profileImage || profile?.avatar || null,
    source,
  };
}

/* ------------------------------ Main Component ------------------------------ */

export default function BuildFlipPage() {
  const router = useRouter();
  const { generatePlayer, generating, statusMessage } = usePlayerSearch();

  const [sport, setSport] = useState("Cricket");
  const [playerName, setPlayerName] = useState("");
  const [role, setRole] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [country] = useState("Auto-detected");

  const [checkingDb, setCheckingDb] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [builtCard, setBuiltCard] = useState<NormalizedCard | null>(null);
  const [copied, setCopied] = useState(false);

  const canContinue = playerName.trim().length > 1;

  async function handleGenerate() {
    if (!canContinue || checkingDb || generating) return;
    setError(null);
    setCheckingDb(true);

    const rawName = playerName.trim();
    const slugUnderscore = rawName.toLowerCase().replace(/\s+/g, "_");
    const slugHyphen = rawName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      /* -------------------------------------------------------------
       * STEP 1: Check if player ALREADY exists in DB (CRICKET or ATHLETE)
       * ------------------------------------------------------------- */
      let existingData = null;

      const endpoints = [
        `/api/ms_players/${slugUnderscore}`,
        `/api/ms_players/${slugHyphen}`,
        `/api/athleteProfile/${slugUnderscore}`,
        `/api/athleteProfile/${slugHyphen}`,
      ];

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const data = await res.json();
            // Make sure it's a valid existing profile document
            if (data && !data.error && (data.coreInfo || data.name || data.playerId || data.athlete_id || data.athleteId)) {
              existingData = data;
              break;
            }
          }
        } catch {
          // continue checking next endpoint
        }
      }

      // If found in database -> Display immediately without calling AI!
      if (existingData) {
        setCheckingDb(false);
        const card = normalizeAnyAthlete(existingData, sport, gender, "database");
        setBuiltCard(card);
        return;
      }

      /* -------------------------------------------------------------
       * STEP 2: NOT in database -> Generate via AI Pipeline (<30s)
       * ------------------------------------------------------------- */
      let genData: any = null;
      let isOk = false;

      try {
        const generateRes = await fetch("/api/player-profile/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: rawName, sport: sport.toLowerCase() }),
        });
        isOk = generateRes.ok;
        const text = await generateRes.text();
        try {
          genData = text ? JSON.parse(text) : null;
        } catch {
          genData = null;
        }
      } catch (networkErr) {
        console.error("[BuildFlip] Network error connecting to generate:", networkErr);
        throw new Error("Unable to reach the generation service. Please check your connection and try again.");
      }

      if (!isOk || !genData || !genData.success) {
        const rawReason = String(genData?.message || genData?.reason || "").toLowerCase();
        if (
          rawReason.includes("not a real") ||
          rawReason.includes("cannot confirm") ||
          rawReason.includes("could not confirm") ||
          rawReason.includes("not found") ||
          rawReason.includes("rejected")
        ) {
          throw new Error("Athlete not found. Please verify the athlete's name or try a different player.");
        }
        throw new Error("Unable to generate athlete card right now. Please try again shortly.");
      }

      const generatedProfile = genData.profile || genData;
      setCheckingDb(false);
      const card = normalizeAnyAthlete(generatedProfile, sport, gender, "ai-generated");
      setBuiltCard(card);
    } catch (err: any) {
      console.error("[BuildFlip] Generation error:", err);
      setCheckingDb(false);

      const raw = String(err?.message || "").trim();
      const lower = raw.toLowerCase();

      let friendly = "Unable to generate athlete card right now. Please try again shortly.";

      if (
        lower.includes("not found") ||
        lower.includes("not a real") ||
        lower.includes("cannot confirm") ||
        lower.includes("could not confirm") ||
        lower.includes("verify") ||
        lower.includes("spelling")
      ) {
        friendly = "Athlete not found. Please check spelling or try another player.";
      } else if (
        lower.includes("connection") ||
        lower.includes("reach")
      ) {
        friendly = "Connection issue. Please check your network and try again.";
      }

      setError(friendly);
    }
  }


  function handleReset() {
    setBuiltCard(null);
    setPlayerName("");
    setRole("");
    setError(null);
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  /* ---------------------- 1. GENERATING / CHECKING VIEW ---------------------- */
  if (checkingDb || generating) {
    return (
      <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d0d14] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-purple-500/15 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl font-black text-white tracking-wide">
            {checkingDb ? "Checking Database..." : `Building ${playerName}'s FlipCard`}
          </h2>

          <p className="text-xs text-purple-400 font-semibold mt-2 min-h-[36px] flex items-center justify-center px-2">
            {checkingDb ? "Looking up official sports database..." : statusMessage || "AI web-grounded research in progress..."}
          </p>

          <div className="w-full bg-white/5 border border-white/10 rounded-full h-1.5 mt-6 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 via-rose-500 to-amber-400 h-full rounded-full animate-pulse w-3/4" />
          </div>

          <p className="text-[11px] text-white/40 mt-3 font-medium">
            {checkingDb ? "Instant database lookup" : "AI Web-Grounded Verification (<30s)"}
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------- 2. RESULT FLIPCARD ---------------------------- */
  if (builtCard) {
    const { theme } = builtCard;

    return (
      <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pb-20 lg:pb-8">
        <div className="w-full max-w-sm my-auto space-y-3">
          <div
            className={`relative rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-b ${theme.bgFrom} ${theme.bgTo} px-5 pt-6 pb-8 shadow-2xl`}
          >
            {/* Close button -> back to form */}
            <button
              onClick={() => {
                setBuiltCard(null);
                setError(null);
              }}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-300 hover:text-white bg-white/10 backdrop-blur-sm z-10 cursor-pointer"
            >
              ✕
            </button>

            {/* Top row */}
            <div className="flex items-start justify-between pr-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white font-bold text-sm">{builtCard.flag}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[8px] font-bold ${theme.accent} ${theme.accentBorder} border ${theme.accentBg}`}
                  >
                    {builtCard.sport}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[8px] font-semibold text-gray-300 border border-white/15 bg-white/5">
                    {builtCard.role.toLowerCase()}
                  </span>
                </div>
                <h2 className="text-white text-3xl font-extrabold leading-tight">
                  {builtCard.name}
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  {builtCard.gender} · {builtCard.country}
                </p>
              </div>

              {/* Overall Score */}
              <div
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border-2 ${theme.overallBorder} shrink-0`}
              >
                <span className="text-white text-2xl font-extrabold">{builtCard.overall}</span>
                <span className={`text-[8px] font-bold tracking-wider ${theme.accent}`}>
                  OVERALL
                </span>
              </div>
            </div>

            {/* 6-Tile Stats Grid */}
            <div className="grid grid-cols-3 mt-7 border-t border-l border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              {builtCard.stats.map((s) => {
                const valStr = String(s.value ?? "—").trim();
                const fontSize = getStatValueFontSize(valStr);

                return (
                  <div
                    key={s.label}
                    className="flex flex-col justify-center items-center text-center px-1.5 py-3 min-h-[78px] sm:min-h-[84px] border-r border-b border-white/10 overflow-hidden"
                  >
                    <div
                      className={`w-full font-extrabold tracking-tight break-words line-clamp-2 px-0.5 ${fontSize} ${s.color}`}
                      title={valStr}
                    >
                      {valStr}
                    </div>
                    <div className="text-gray-400 text-[10px] sm:text-[10.5px] mt-1 tracking-tight font-medium truncate w-full px-0.5">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Career Highlights */}
            {builtCard.highlights.length > 0 && (
              <div className="mt-6">
                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mb-2">
                  CAREER HIGHLIGHTS
                </p>
                <ul className="space-y-2">
                  {builtCard.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-200 text-xs leading-relaxed">
                      <span className={`mt-1 text-[10px] ${theme.accent}`}>◆</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 mt-6 pt-3 border-t border-white/10">
              <span className="text-xs">🐬</span>
              <span className="text-gray-400 text-[11px] font-semibold">
                FlipFLEX by Flip · SportsFan360 {builtCard.source === "database" ? "Verified" : "AI Generated"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 rounded-2xl bg-white/5 text-gray-300 font-semibold text-xs border border-white/10 hover:bg-white/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>New Card</span>
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-orange-500 text-white font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/20"
            >
              {copied ? <Check size={14} /> : <Share2 size={13} />}
              <span>{copied ? "Link Copied!" : "Share Card"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------- 3. FORM VIEW ------------------------------- */
  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pb-20 lg:pb-8">
      <div className="w-full max-w-sm my-auto bg-[#0d0d12] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/images/dollyavatar.png"
              alt="FlipFlex"
              className="w-11 h-11 rounded-full border-2 border-purple-500 object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold text-base">FlipFLEX</span>
                <span className="text-orange-500 text-base">⚡</span>
                <span className="bg-purple-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                  AI
                </span>
              </div>
              <p className="text-gray-400 text-[11px] mt-0.5">
                Instant AI athlete cards in &lt;30s
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/MainModules/HomePage")}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-3">
          {/* Sport Selector */}
          <div>
            <p className="text-gray-400 text-[11px] font-bold tracking-wider uppercase mb-2">
              SPORT
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SPORTS.map((s) => {
                const active = s === sport;
                return (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={
                      active
                        ? "px-3 py-1.5 rounded-full text-xs font-semibold text-purple-300 border border-purple-500 bg-purple-500/20 cursor-pointer"
                        : "px-3 py-1.5 rounded-full text-xs font-medium text-gray-300 border border-white/10 bg-white/5 hover:border-white/20 cursor-pointer"
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
            <p className="text-gray-400 text-[11px] font-bold tracking-wider uppercase mb-1.5">
              PLAYER / ATHLETE NAME
            </p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Abhishek Sharma, Neeraj Chopra..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>

          {/* Discipline / Role */}
          <div>
            <p className="text-gray-400 text-[11px] font-bold tracking-wider uppercase mb-1.5">
              DISCIPLINE / ROLE{" "}
              <span className="text-gray-500 font-normal normal-case">
                (optional)
              </span>
            </p>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Batting, Bowling, Javelin..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Gender & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-400 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                GENDER
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setGender("Male")}
                  className={
                    gender === "Male"
                      ? "flex-1 py-2.5 rounded-xl text-xs font-semibold text-purple-300 border border-purple-500 bg-purple-500/20"
                      : "flex-1 py-2.5 rounded-xl text-xs font-medium text-gray-300 border border-white/10 bg-white/5"
                  }
                >
                  Male
                </button>
                <button
                  onClick={() => setGender("Female")}
                  className={
                    gender === "Female"
                      ? "flex-1 py-2.5 rounded-xl text-xs font-semibold text-purple-300 border border-purple-500 bg-purple-500/20"
                      : "flex-1 py-2.5 rounded-xl text-xs font-medium text-gray-300 border border-white/10 bg-white/5"
                  }
                >
                  Female
                </button>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-bold tracking-wider uppercase mb-1.5">
                COUNTRY
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white/60 text-xs flex items-center h-[38px] truncate">
                {country}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-rose-400 text-xs pt-1 font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            disabled={!canContinue || checkingDb || generating}
            onClick={handleGenerate}
            className={
              canContinue && !checkingDb && !generating
                ? "w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2"
                : "w-full py-3.5 rounded-xl bg-white/5 text-gray-500 font-semibold text-sm cursor-not-allowed"
            }
          >
            <Sparkles size={16} />
            <span>
              {canContinue
                ? "Generate FlipCard"
                : "Enter player name to continue"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
