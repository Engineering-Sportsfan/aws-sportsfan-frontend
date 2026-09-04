// MainModules/FlipCards/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowLeft } from "lucide-react";

type Stat = { label: string; value: string; color: string };

interface Player {
  id: string;
  name: string;
  shortName: string;
  country: string;
  gender: string;
  sport: string;
  role: string;
  overall: number;
  stats: Stat[];
  highlights: string[];
}

export interface PlayerStat {
  label: string;
  value: string;
  color: string;
}



const PLAYERS: Player[] = [
  {
    id: "india-team",
    name: "India",
    shortName: "India",
    country: "IN",
    gender: "Men's Team",
    sport: "Cricket",
    role: "National Team",
    overall: 121,
    stats: [
      { label: "Matches", value: "600", color: "#94a3b8" },
      { label: "Wins", value: "186", color: "#34d399" },
      { label: "Losses", value: "188", color: "#f87171" },
      { label: "Draws", value: "225", color: "#60a5fa" }, // incl. 1 tie
      { label: "Win %", value: "31.0", color: "#fbbf24" },
      { label: "ICC Rank", value: "#2", color: "#60a5fa" },
    ],
    highlights: [
      "WTC Final appearance 2025",
      "Series win vs Australia (BGT) 2024-25",
      "ICC #2 Test Team Ranking",
    ],
  },
  {
    id: "sri-lanka-team",
    name: "Sri Lanka",
    shortName: "Sri Lanka",
    country: "LK",
    gender: "Men's Team",
    sport: "Cricket",
    role: "National Team",
    overall: 96,
    stats: [
      { label: "Matches", value: "328", color: "#94a3b8" },
      { label: "Wins", value: "97", color: "#34d399" },
      { label: "Losses", value: "129", color: "#f87171" },
      { label: "Draws", value: "102", color: "#60a5fa" },
      { label: "Win %", value: "29.6", color: "#fbbf24" },
      { label: "ICC Rank", value: "#7", color: "#60a5fa" },
    ],
    highlights: [
      "Series win vs England 2024",
      "500th Test match milestone 2024",
      "ICC #7 Test Team Ranking",
    ],
  },
  {
    id: "kuldeep-yadav",
    name: "Kuldeep Yadav",
    shortName: "K. Yadav",
    country: "IN",
    gender: "Male",
    sport: "Cricket",
    role: "Bowling",
    overall: 85,
    stats: [
      { label: "Bowling Avg", value: "22.38", color: "#60a5fa" },
      { label: "Economy", value: "3.53", color: "#60a5fa" },
      { label: "Wickets", value: "80", color: "#fbbf24" },
      { label: "5W Hauls", value: "5", color: "#34d399" },
      { label: "Best Figures", value: "5/40", color: "#60a5fa" },
      { label: "Matches", value: "19", color: "#94a3b8" },
    ],
    highlights: [
      "7-wicket innings haul vs England, Dharamsala 2024",
      "Fastest Indian to 50 Test wickets (1871 balls)",
      "ICC Top-15 Bowling in Test rankings",
    ],
  },
  {
    id: "shubman-gill",
    name: "Shubman Gill",
    shortName: "S. Gill",
    country: "IN",
    gender: "Male",
    sport: "Cricket",
    role: "Batting",
    overall: 87,
    stats: [
      { label: "Batting Avg", value: "61.82", color: "#60a5fa" },
      { label: "Runs", value: "2985", color: "#60a5fa" },
      { label: "Centuries", value: "11", color: "#fbbf24" }, // incl. 4 in 2025 England series
      { label: "Wickets", value: "0", color: "#34d399" },
      { label: "Fours", value: "335", color: "#60a5fa" },
      { label: "Matches", value: "42", color: "#94a3b8" },
    ],
    highlights: [
      "Test Captain, India tour of England 2025",
      "Career-best 269 vs England, Edgbaston 2025",
      "754 runs in a single Test series (2025 vs England)",
    ],
  },
  {
    id: "yashasvi-jaiswal",
    name: "Yashasvi Jaiswal",
    shortName: "Y. Jaiswal",
    country: "IN",
    gender: "Male",
    sport: "Cricket",
    role: "Batting",
    overall: 86,
    stats: [
      { label: "Batting Avg", value: "48.43", color: "#60a5fa" },
      { label: "Runs", value: "2567", color: "#60a5fa" },
      { label: "Centuries", value: "7", color: "#fbbf24" },
      { label: "Double Centuries", value: "2", color: "#34d399" },
      { label: "Highest Score", value: "214*", color: "#60a5fa" },
      { label: "Matches", value: "30", color: "#94a3b8" },
      { label: "Strike Rate", value: "66.29", color: "#94a3b8" },

    ],
    highlights: [
      "209 & 214* vs England, back-to-back doubles, 2024",
      "Fastest Indian opener to 2000 Test runs",
      "Player of the Series vs England 2024",
    ],
  },
  {
    id: "rishabh-pant",
    name: "Rishabh Pant",
    shortName: "R. Pant",
    country: "IN",
    gender: "Male",
    sport: "Cricket",
    role: "Wicketkeeper - Batting",
    overall: 88,
    stats: [
      { label: "Batting Avg", value: "43.32", color: "#60a5fa" },
      { label: "Runs", value: "3596", color: "#60a5fa" },
      { label: "Centuries", value: "8", color: "#fbbf24" }, // approx, growing through 2025
      { label: "Sixes", value: "98", color: "#34d399" },
      { label: "Fours", value: "382", color: "#60a5fa" },
      { label: "Matches", value: "51", color: "#94a3b8" },
      { label: "Strike Rate", value: "73.91", color: "#94a3b8" },
    ],
    highlights: [
      "First keeper to score Test hundreds in England, Australia & South Africa",
      "Second-most Test centuries by an Indian keeper (behind Dhoni)",
      "ICC Top-15 Batting in Test rankings",
    ],
  },
];

function MiniCard({ p, onClick }: { p: Player; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="text-left rounded-2xl p-4"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(59,130,246,0.25)",
      }}
    >
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] font-extrabold" style={{ color: "rgba(255,255,255,0.45)" }}>
          {p.country}
        </span>
        <span className="text-2xl font-black tabular-nums" style={{ color: "#3b82f6" }}>
          {p.overall}
        </span>
      </div>
      <p className="text-sm font-extrabold text-white mt-1 truncate">{p.shortName}</p>
      <p className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
        {p.role}
      </p>
    </motion.button>
  );
}

function StatCard({ player, onBack }: { player: Player; onBack: () => void }) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg,#0f1a2e,#0a1128)",
        border: "1px solid rgba(59,130,246,0.25)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "2px solid rgba(59,130,246,0.5)" }}
          >
            🏏
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-white font-extrabold text-[15px] leading-none">FlipFlex</p>
              <Zap size={13} className="text-amber-400" fill="currentColor" />
              <span
                className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(99,102,241,0.35)", color: "#a5b4fc" }}
              >
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              AI athlete cards · Learn · Earn SXP
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/MainModules/HomePage")}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-sm text-white">{player.country}</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-600 text-white tracking-wide">
                {player.sport.toUpperCase()}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {player.role}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white leading-tight">{player.name}</h2>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              {/* {player.gender} · India */}
            </p>
          </div>
          <div
            className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 border-blue-500 shrink-0"
            style={{ background: "rgba(59,130,246,0.12)" }}
          >
            <span className="text-xl font-black text-blue-400">{player.overall}</span>
            <span className="text-[8px] font-bold text-blue-400 tracking-wide">OVERALL</span>
          </div>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-3 gap-px mt-5 rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.2)" }}
        >
          {player.stats.map((s) => (
            <div key={s.label} className="py-3 flex flex-col items-center justify-center" style={{ background: "#0f1a2e" }}>
              <span className="text-lg font-extrabold" style={{ color: s.color }}>
                {s.value}
              </span>
              <span className="text-[10px] mt-0.5 text-center px-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="mt-5">
          <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            CAREER HIGHLIGHTS
          </p>
          <ul className="space-y-1.5">
            {player.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                <span className="text-blue-400 mt-1 text-[8px]">◆</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[10px] mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
          Mock data · Team India XI · SportsFan360
        </p>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-3 px-4 pb-10">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-white"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          Back
        </button>
        <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm">
          Share Card ↗
        </button>
      </div>
    </motion.div>
  );
}

export default function FlipCardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerFromQuery = searchParams.get("player");
  const [selectedId, setSelectedId] = useState<string | null>(playerFromQuery);
  const selected = PLAYERS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "linear-gradient(135deg,#0a1128 0%,#0f1a2e 100%)" }}>
      <AnimatePresence mode="wait">
        {selected ? (
          <StatCard key={selected.id} player={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto flex flex-col min-h-[calc(100vh-4rem)]"
          >
            {/* Header with Back Button */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => router.push("/MainModules/HomePage")}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/15 transition-all cursor-pointer border border-white/10 shrink-0 active:scale-95"
                aria-label="Back to HomePage"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-white leading-tight">Team India XI</h1>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Tap a player to see full Test stats
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {PLAYERS.map((p) => (
                <MiniCard key={p.id} p={p} onClick={() => setSelectedId(p.id)} />
              ))}
            </div>

            {/* Bottom Build FlipFlex Button */}
            <div className="mt-auto pt-4 pb-8 sticky bottom-8">
              <button
                onClick={() => router.push("/MainModules/FlipCards/BuildFlip")}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#FF3D57] to-[#FF7B02] hover:from-[#ff526a] hover:to-[#ff8a1c] text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer border border-white/20"
              >
                <Zap size={16} className="text-white fill-white" />
                <span>Build FlipFlex</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}