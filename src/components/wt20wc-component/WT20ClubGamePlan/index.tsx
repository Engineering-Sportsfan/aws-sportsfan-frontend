// components/wt20-component/WT20ClubGamePlan/index.tsx
"use client";

import { useState } from "react";
import { WT20Club } from "@/types/wt20Club";

interface Props {
  club: WT20Club;
}

const ACCENT = "#0d9488";

type Tab = "Drops" | "Videos" | "Live" | "Posts";
const TABS: Tab[] = ["Drops", "Videos", "Live", "Posts"];

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[3px] h-5 rounded-sm shrink-0" style={{ background: ACCENT }} />
      <span className="text-base md:text-lg font-bold text-white">{text}</span>
    </div>
  );
}

function TabIcon({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const stroke = isActive ? "#fff" : "#888888";
  if (tab === "Drops")  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-[#0d9488]"}`} />;
  if (tab === "Videos") return (
    <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="7" width="15" height="10" rx="2" /><path d="m17 9 5 3-5 3V9z" />
    </svg>
  );
  if (tab === "Live") return (
    <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
  if (tab === "Posts") return <span className={`text-[14px] leading-none ${isActive ? "text-white" : "text-[#888888]"}`}>#</span>;
  return null;
}

export default function WT20ClubGamePlan({ club }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Drops");

  // Derive strengths from cricket stats
  const winPct = Math.round(club.win_pct * 100);
  const strengths: string[] = [];

  if (winPct >= 70)                    strengths.push("Dominant Force");
  if (winPct >= 55 && winPct < 70)    strengths.push("Consistent Performer");
  if (winPct < 40)                     strengths.push("Building Momentum");
  if (club.icc_ranking <= 2)           strengths.push("World-Class Side");
  if (club.icc_ranking <= 5)           strengths.push("Elite ICC Ranking");
  if (club.rating_points >= 270)       strengths.push("Top-Rated T20I Team");
  if (club.apps >= 8)                  strengths.push("Tournament Veterans");
  else if (club.apps >= 5)             strengths.push("Experienced Campaigners");
  if (club.matches >= 40)              strengths.push("Battle-Hardened");
  if (club.best_tournament_finish?.toLowerCase().includes("champions"))
    strengths.push("World Champions");
  if (club.best_tournament_finish?.toLowerCase().includes("runners"))
    strengths.push("Tournament Finalists");
  if (club.tied_so > 0)               strengths.push("Nerves of Steel (SO wins)");
  if (strengths.length === 0)          strengths.push("T20 Competitor", "International Pedigree");

  // Performance bars
  const countable = club.matches - club.no_result;
  const lossPct   = countable > 0 ? Math.round((club.lost / countable) * 100) : 0;
  const tiedPct   = countable > 0 ? Math.round((club.tied_so / countable) * 100) : 0;
  const nrPct     = club.matches > 0 ? Math.round((club.no_result / club.matches) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pb-18">

      {/* Team Strengths */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Team Profile" />
        <p className="text-[13px] md:text-sm font-bold text-white mt-3 mb-2.5">Key Strengths</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {strengths.map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#242424] rounded-xl px-3.5 py-3 md:py-3.5">
              <span
                className="w-[9px] h-[9px] rounded-full shrink-0"
                style={{ background: i % 2 === 0 ? ACCENT : "#f59e0b" }}
              />
              <span className="text-[13px] md:text-sm text-[#d8d8d8] font-medium">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance breakdown */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Performance Breakdown" />
        <div className="mt-4 space-y-3">
          {[
            { label: "Win Rate",    pct: winPct,  color: "#0d9488" },
            { label: "Loss Rate",   pct: lossPct, color: "#dc2626" },
            { label: "Tied / SO",   pct: tiedPct, color: "#d97706" },
            ...(nrPct > 0 ? [{ label: "No Result", pct: nrPct, color: "#6b7280" }] : []),
          ].map(({ label, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-[#888888] font-medium">{label}</span>
                <span className="text-[11px] text-white font-bold">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#2a2a2a] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ICC Ranking context */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#242424] flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#777777]">ICC Ranking</p>
            <p className="text-2xl font-extrabold text-[#2dd4bf] leading-tight">#{club.icc_ranking}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#777777]">Rating Points</p>
            <p className="text-2xl font-extrabold text-white leading-tight">{club.rating_points}</p>
          </div>
        </div>
      </div>

      {/* Media tabs */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden scrollbar-hide border-b border-[#2a2a2a]">
          <div className="flex items-center gap-1 px-3 py-2.5 min-w-max">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[13px] md:text-sm font-bold border-0 cursor-pointer transition-colors duration-200 whitespace-nowrap ${
                    isActive ? "text-white" : "bg-transparent text-[#888888] hover:text-[#cccccc]"
                  }`}
                  style={isActive ? { background: ACCENT } : {}}
                >
                  <TabIcon tab={tab} isActive={isActive} />
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-10 h-10 lg:w-20 lg:h-20 mb-4 rounded-full bg-[#242424] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
          </div>
          <h3 className="text-white text-sm lg:text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-[#888888] text-sm max-w-sm">
            {activeTab === "Videos"
              ? "No videos available yet. Check back later!"
              : `${activeTab} content is coming soon. Stay tuned!`}
          </p>
        </div>
      </div>
    </div>
  );
}