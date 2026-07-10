// // components/WPLPlayerProfile/WPLPlayerGamePlan/index.tsx
// "use client";

// import { useState } from "react";
// import { WPLPlayer } from "@/types/wplPlayer";

// interface Props {
//   player: WPLPlayer;
// }

// type Tab = "Drops" | "Videos" | "Live" | "Posts";
// const TABS: Tab[] = ["Drops", "Videos", "Live", "Posts"];

// function SectionLabel({ text }: { text: string }) {
//   return (
//     <div className="flex items-center gap-2">
//       <div className="w-[3px] h-5 bg-[#7c3aed] rounded-sm shrink-0" />
//       <span className="text-base md:text-lg font-bold text-white">{text}</span>
//     </div>
//   );
// }

// function TabIcon({ tab, isActive }: { tab: Tab; isActive: boolean }) {
//   const stroke = isActive ? "#fff" : "#888888";
//   if (tab === "Drops") return (
//     <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-[#7c3aed]"}`} />
//   );
//   if (tab === "Videos") return (
//     <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
//       <rect x="2" y="7" width="15" height="10" rx="2" /><path d="m17 9 5 3-5 3V9z" />
//     </svg>
//   );
//   if (tab === "Live") return (
//     <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
//       <polygon points="5 3 19 12 5 21 5 3" />
//     </svg>
//   );
//   if (tab === "Posts") return (
//     <span className={`text-[14px] leading-none ${isActive ? "text-white" : "text-[#888888]"}`}>#</span>
//   );
//   return null;
// }

// export default function WPLPlayerGamePlan({ player }: Props) {
//   const [activeTab, setActiveTab] = useState<Tab>("Drops");

//   // Derive key strengths from stats
//   const strengths: string[] = [];
//   if (player.runs > 500) strengths.push("High Run Scorer");
//   if (player.strike_rate > 130) strengths.push("Aggressive Striker");
//   if (player.batting_average > 30) strengths.push("Consistent Batter");
//   if (player.wickets > 20) strengths.push("Wicket Taker");
//   if (player.economy > 0 && player.economy < 7) strengths.push("Economical Bowler");
//   if (player.bowling_average > 0 && player.bowling_average < 20) strengths.push("Effective Bowler");
//   if (player.fours > 50) strengths.push("Boundary Hitter");
//   if (player.sixes > 10) strengths.push("Six Hitter");
//   if (strengths.length === 0) strengths.push("Developing Player", "Team Contributor");

//   return (
//     <div className="flex flex-col gap-4 px-4 md:px-6 pb-18">
//       {/* Game Plan */}
//       <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
//         <SectionLabel text="Game Plan" />
//         <p className="text-[13px] md:text-sm font-bold text-white mt-3 mb-2.5">Key Strengths</p>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//           {strengths.map((s, i) => (
//             <div
//               key={i}
//               className="flex items-center gap-3 bg-[#242424] rounded-xl px-3.5 py-3 md:py-3.5"
//             >
//               <span
//                 className={`w-[9px] h-[9px] rounded-full shrink-0 ${
//                   i % 2 === 0 ? "bg-[#7c3aed]" : "bg-[#e91e8c]"
//                 }`}
//               />
//               <span className="text-[13px] md:text-sm text-[#d8d8d8] font-medium">{s}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Media */}
//       <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
//         {/* Tab bar */}
//         <div className="overflow-x-auto overflow-y-hidden scrollbar-hide border-b border-[#2a2a2a]">
//           <div className="flex items-center gap-1 px-3 py-2.5 min-w-max">
//             {TABS.map((tab) => {
//               const isActive = activeTab === tab;
//               return (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`flex items-center gap-1.5 h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[13px] md:text-sm font-bold border-0 cursor-pointer transition-colors duration-200 whitespace-nowrap
//                     ${isActive ? "bg-[#7c3aed] text-white" : "bg-transparent text-[#888888] hover:text-[#cccccc]"}`}
//                 >
//                   <TabIcon tab={tab} isActive={isActive} />
//                   {tab}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Coming soon state for all tabs */}
//         <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
//           <div className="w-10 h-10 lg:w-20 lg:h-20 mb-4 rounded-full bg-[#242424] flex items-center justify-center">
//             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.5">
//               <circle cx="12" cy="12" r="10" />
//               <path d="M12 8v4l3 3" />
//             </svg>
//           </div>
//           <h3 className="text-white text-sm lg:text-lg font-semibold mb-2">Coming Soon</h3>
//           <p className="text-[#888888] text-sm max-w-sm">
//             {activeTab === "Videos"
//               ? "No videos available yet. Check back later for updates!"
//               : `${activeTab} content is coming soon. Stay tuned!`}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }







// components/WPLPlayerProfile/WPLPlayerGamePlan/index.tsx
"use client";

import { useState } from "react";
import { WPLPlayer } from "@/types/wplPlayer";

interface Props {
  player: WPLPlayer;
  tournament?: string | null;
}

type Tab = "Drops" | "Videos" | "Live" | "Posts";
const TABS: Tab[] = ["Drops", "Videos", "Live", "Posts"];

// ── Tournament config ─────────────────────────────────────────────────────────

type TournamentConfig = {
  label: string;
  accentColor: string;
  activeBg: string;  // Tailwind bg for active tab button
};

const TOURNAMENT_CONFIG: Record<string, TournamentConfig> = {
  womens_ipl:  { label: "WPL",   accentColor: "#7c3aed", activeBg: "bg-[#7c3aed]" },
  womens_t20i: { label: "WT20I", accentColor: "#0e7490", activeBg: "bg-[#0e7490]" },
};

function getConfig(tournament?: string | null): TournamentConfig {
  return TOURNAMENT_CONFIG[tournament ?? ""] ?? TOURNAMENT_CONFIG.womens_ipl;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ text, accentColor }: { text: string; accentColor: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[3px] h-5 rounded-sm shrink-0" style={{ background: accentColor }} />
      <span className="text-base md:text-lg font-bold text-white">{text}</span>
    </div>
  );
}

function TabIcon({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const stroke = isActive ? "#fff" : "#888888";
  if (tab === "Drops")  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-[#7c3aed]"}`} />;
  if (tab === "Videos") return (
    <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="7" width="15" height="10" rx="2" /><path d="m17 9 5 3-5 3V9z" />
    </svg>
  );
  if (tab === "Live")   return (
    <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
  if (tab === "Posts")  return <span className={`text-[14px] leading-none ${isActive ? "text-white" : "text-[#888888]"}`}>#</span>;
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WPLPlayerGamePlan({ player, tournament }: Props) {
  const cfg = getConfig(tournament);
  const [activeTab, setActiveTab] = useState<Tab>("Drops");

  // Derive key strengths from stats
  const strengths: string[] = [];
  if (player.runs > 500)                              strengths.push("High Run Scorer");
  if (player.strike_rate > 130)                       strengths.push("Aggressive Striker");
  if (player.batting_average > 30)                    strengths.push("Consistent Batter");
  if (player.wickets > 20)                            strengths.push("Wicket Taker");
  if (player.economy > 0 && player.economy < 7)       strengths.push("Economical Bowler");
  if (player.bowling_average > 0 && player.bowling_average < 20) strengths.push("Effective Bowler");
  if (player.fours > 50)                              strengths.push("Boundary Hitter");
  if (player.sixes > 10)                              strengths.push("Six Hitter");
  if (strengths.length === 0) strengths.push("Developing Player", "Team Contributor");

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pb-18">

      {/* Game Plan */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Game Plan" accentColor={cfg.accentColor} />
        <p className="text-[13px] md:text-sm font-bold text-white mt-3 mb-2.5">Key Strengths</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {strengths.map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#242424] rounded-xl px-3.5 py-3 md:py-3.5">
              <span
                className="w-[9px] h-[9px] rounded-full shrink-0"
                style={{ background: i % 2 === 0 ? cfg.accentColor : "#e91e8c" }}
              />
              <span className="text-[13px] md:text-sm text-[#d8d8d8] font-medium">{s}</span>
            </div>
          ))}
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
                  className={`flex items-center gap-1.5 h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[13px] md:text-sm font-bold border-0 cursor-pointer transition-colors duration-200 whitespace-nowrap
                    ${isActive ? `${cfg.activeBg} text-white` : "bg-transparent text-[#888888] hover:text-[#cccccc]"}`}
                >
                  <TabIcon tab={tab} isActive={isActive} />
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coming soon */}
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-10 h-10 lg:w-20 lg:h-20 mb-4 rounded-full bg-[#242424] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
          </div>
          <h3 className="text-white text-sm lg:text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-[#888888] text-sm max-w-sm">
            {activeTab === "Videos"
              ? "No videos available yet. Check back later for updates!"
              : `${activeTab} content is coming soon. Stay tuned!`}
          </p>
        </div>
      </div>
    </div>
  );
}