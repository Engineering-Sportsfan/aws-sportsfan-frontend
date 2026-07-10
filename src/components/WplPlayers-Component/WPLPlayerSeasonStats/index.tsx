// // components/WPLPlayerProfile/WPLPlayerSeasonStats/index.tsx
// "use client";

// import { WPLPlayer } from "@/types/wplPlayer";
// import { useState } from "react";

// interface Props {
//   player: WPLPlayer;
// }

// function SectionLabel({ text }: { text: string }) {
//   return (
//     <div className="flex items-center gap-2">
//       <div className="w-[3px] h-5 bg-[#7c3aed] rounded-sm shrink-0" />
//       <span className="text-base md:text-lg font-bold text-white">{text}</span>
//     </div>
//   );
// }

// function StatBox({
//   value,
//   label,
//   highlight,
// }: {
//   value: string | number;
//   label: string;
//   highlight?: "pink" | "orange" | "dark";
// }) {
//   const bg =
//     highlight === "pink"
//       ? "bg-[#7c3aed]"
//       : highlight === "orange"
//       ? "bg-[#e08c00]"
//       : "bg-[#242424]";
//   const textColor =
//     highlight === "pink" || highlight === "orange"
//       ? "text-white"
//       : "text-white";
//   const subColor =
//     highlight === "pink" || highlight === "orange"
//       ? "text-white/80"
//       : "text-[#777777]";

//   const displayValue = value === 0 || value === "0" || value === "0.00" || value == null ? "—" : value;

//   return (
//     <div
//       className={`flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl ${bg}`}
//     >
//       <span className={`text-[20px] md:text-[26px] font-extrabold ${textColor} leading-none`}>
//         {displayValue}
//       </span>
//       <span className={`text-[11px] md:text-xs ${subColor} mt-1 font-medium`}>{label}</span>
//     </div>
//   );
// }

// function SecondaryStatBox({ value, label }: { value: string | number; label: string }) {
//   const displayValue = value === 0 || value === "0" || value === "0.00" || value == null ? "—" : value;
//   return (
//     <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//       <span className="text-[11px] md:text-xs text-[#777777] mb-1">{label}</span>
//       <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//         {displayValue}
//       </span>
//     </div>
//   );
// }

// export default function WPLPlayerSeasonStats({ player }: Props) {
//   const [showMore, setShowMore] = useState(false);

//   const hasBatting = player.runs > 0 || player.balls_faced > 0;
//   const hasBowling = player.wickets > 0 || player.balls_bowled > 0;
//   const isAllRounder = hasBatting && hasBowling;

//   return (
//     <div className="flex flex-col gap-4 px-4 md:px-6 pb-4">
//       {/* Season Stats */}
//       <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
//         <SectionLabel text="WPL Career Stats" />

//         {isAllRounder ? (
//           <>
//             {/* All-rounder: batting */}
//             <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-4 mb-2">
//               Batting
//             </p>
//             <div className="grid grid-cols-3 gap-2 md:gap-3">
//               <StatBox value={player.runs} label="Runs" highlight="pink" />
//               <StatBox value={player.strike_rate?.toFixed(2)} label="Strike Rate" highlight="orange" />
//               <StatBox value={player.batting_average?.toFixed(2)} label="Average" highlight="dark" />
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
//               <SecondaryStatBox value={player.balls_faced} label="Balls Faced" />
//               <SecondaryStatBox value={player.fours} label="Fours" />
//               <SecondaryStatBox value={player.sixes} label="Sixes" />
//               <SecondaryStatBox value={player.batting_dismissals} label="Dismissals" />
//             </div>

//             {/* All-rounder: bowling */}
//             <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-5 mb-2">
//               Bowling
//             </p>
//             <div className="grid grid-cols-3 gap-2 md:gap-3">
//               <StatBox value={player.wickets} label="Wickets" highlight="pink" />
//               <StatBox value={player.bowling_average?.toFixed(2)} label="Bowling Avg" highlight="orange" />
//               <StatBox value={player.economy?.toFixed(2)} label="Economy" highlight="dark" />
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
//               <SecondaryStatBox value={player.overs?.toFixed(1)} label="Overs" />
//               <SecondaryStatBox value={player.balls_bowled} label="Balls Bowled" />
//               <SecondaryStatBox value={player.runs_conceded} label="Runs Conceded" />
//             </div>
//           </>
//         ) : hasBowling ? (
//           <>
//             <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3">
//               <StatBox value={player.wickets} label="Wickets" highlight="pink" />
//               <StatBox value={player.bowling_average?.toFixed(2)} label="Bowling Avg" highlight="orange" />
//               <StatBox value={player.economy?.toFixed(2)} label="Economy" highlight="dark" />
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
//               <SecondaryStatBox value={player.overs?.toFixed(1)} label="Overs" />
//               <SecondaryStatBox value={player.balls_bowled} label="Balls Bowled" />
//               <SecondaryStatBox value={player.runs_conceded} label="Runs Conceded" />
//               <SecondaryStatBox value={player.runs} label="Runs (Bat)" />
//             </div>
//           </>
//         ) : (
//           <>
//             {/* Pure batter */}
//             <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3">
//               <StatBox value={player.runs} label="Runs" highlight="pink" />
//               <StatBox value={player.strike_rate?.toFixed(2)} label="Strike Rate" highlight="orange" />
//               <StatBox value={player.batting_average?.toFixed(2)} label="Average" highlight="dark" />
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
//               <SecondaryStatBox value={player.balls_faced} label="Balls Faced" />
//               <SecondaryStatBox value={player.fours} label="Fours" />
//               <SecondaryStatBox value={player.sixes} label="Sixes" />
//               <SecondaryStatBox value={player.batting_dismissals} label="Dismissals" />
//             </div>
//           </>
//         )}

//         {showMore && (
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
//             <SecondaryStatBox value={(player.fours + player.sixes)} label="Boundaries" />
//             {hasBowling && (
//               <>
//                 <SecondaryStatBox value={player.runs_conceded} label="Runs Conceded" />
//                 <SecondaryStatBox value={player.balls_bowled} label="Balls Bowled" />
//               </>
//             )}
//           </div>
//         )}

//         <button
//           onClick={() => setShowMore(!showMore)}
//           className="w-full mt-3 h-11 md:h-12 rounded-full bg-[#242424] text-[#d0d0d0] text-[13px] md:text-sm font-semibold border-0 cursor-pointer hover:bg-[#2e2e2e] transition-colors"
//         >
//           {showMore ? "View Less Stats" : "View More Stats"}
//         </button>
//       </div>

//       {/* Player Details */}
//       <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
//         <SectionLabel text="Player Details" />
//         <div className="grid grid-cols-2 gap-3 mt-3">
//           <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//             <span className="text-[20px] md:text-[24px] font-extrabold text-[#7c3aed] leading-tight">
//               WPL
//             </span>
//             <span className="text-[11px] md:text-xs text-[#777777] mt-1">Tournament</span>
//           </div>
//           <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//             <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-tight">
//               {player.format}
//             </span>
//             <span className="text-[11px] md:text-xs text-[#777777] mt-1">Format</span>
//           </div>
//           <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//             <span className="text-[15px] md:text-[18px] font-extrabold text-white leading-tight capitalize">
//               {player.gender}
//             </span>
//             <span className="text-[11px] md:text-xs text-[#777777] mt-1">Category</span>
//           </div>
//           <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//             <span className="text-[20px] md:text-[24px] font-extrabold text-[#e91e8c] leading-tight">
//               {player.jersey_no != null ? `#${player.jersey_no}` : "—"}
//             </span>
//             <span className="text-[11px] md:text-xs text-[#777777] mt-1">Jersey No.</span>
//           </div>
//         </div>
//       </div>

//       {/* Coming Soon — Insights */}
//       <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
//         <SectionLabel text="Career Insights" />
//         <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
//           <div className="w-10 h-10 lg:w-16 lg:h-16 mb-4 rounded-full bg-[#242424] flex items-center justify-center">
//             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.5">
//               <circle cx="12" cy="12" r="10" />
//               <path d="M12 8v4l3 3" />
//             </svg>
//           </div>
//           <h3 className="text-white text-sm lg:text-base font-semibold mb-2">Coming Soon</h3>
//           <p className="text-[#888888] text-sm max-w-sm">
//             Detailed career insights for WPL players are coming soon. Stay tuned!
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }






// components/WPLPlayerProfile/WPLPlayerSeasonStats/index.tsx
"use client";

import { WPLPlayer } from "@/types/wplPlayer";
import { useState } from "react";

interface Props {
  player: WPLPlayer;
  tournament?: string | null;
}

// ── Tournament config ─────────────────────────────────────────────────────────

type TournamentConfig = {
  label: string;
  fullName: string;
  accentColor: string;
  highlightBg: string;   // Tailwind class for primary stat box bg
};

const TOURNAMENT_CONFIG: Record<string, TournamentConfig> = {
  womens_ipl: {
    label: "WPL",
    fullName: "Women's Premier League",
    accentColor: "#7c3aed",
    highlightBg: "bg-[#7c3aed]",
  },
  womens_t20i: {
    label: "WT20I",
    fullName: "Women's T20 International",
    accentColor: "#0e7490",
    highlightBg: "bg-[#0e7490]",
  },
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

function StatBox({
  value,
  label,
  highlight,
  highlightBg,
}: {
  value: string | number;
  label: string;
  highlight?: "primary" | "orange" | "dark";
  highlightBg: string;
}) {
  const bg =
    highlight === "primary" ? highlightBg :
    highlight === "orange"  ? "bg-[#e08c00]" :
    "bg-[#242424]";

  const displayValue = value === 0 || value === "0" || value === "0.00" || value == null ? "—" : value;

  return (
    <div className={`flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl ${bg}`}>
      <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
        {displayValue}
      </span>
      <span className="text-[11px] md:text-xs text-white/70 mt-1 font-medium">{label}</span>
    </div>
  );
}

function SecondaryStatBox({ value, label }: { value: string | number; label: string }) {
  const displayValue = value === 0 || value === "0" || value === "0.00" || value == null ? "—" : value;
  return (
    <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
      <span className="text-[11px] md:text-xs text-[#777777] mb-1">{label}</span>
      <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
        {displayValue}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WPLPlayerSeasonStats({ player, tournament }: Props) {
  const cfg = getConfig(tournament);
  const [showMore, setShowMore] = useState(false);

  const hasBatting   = player.runs > 0 || player.balls_faced > 0;
  const hasBowling   = player.wickets > 0 || player.balls_bowled > 0;
  const isAllRounder = hasBatting && hasBowling;

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pb-4">

      {/* Season Stats */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text={`${cfg.label} Career Stats`} accentColor={cfg.accentColor} />

        {isAllRounder ? (
          <>
            <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-4 mb-2">Batting</p>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <StatBox value={player.runs} label="Runs" highlight="primary" highlightBg={cfg.highlightBg} />
              <StatBox value={player.strike_rate?.toFixed(2)} label="Strike Rate" highlight="orange" highlightBg={cfg.highlightBg} />
              <StatBox value={player.batting_average?.toFixed(2)} label="Average" highlight="dark" highlightBg={cfg.highlightBg} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
              <SecondaryStatBox value={player.balls_faced} label="Balls Faced" />
              <SecondaryStatBox value={player.fours} label="Fours" />
              <SecondaryStatBox value={player.sixes} label="Sixes" />
              <SecondaryStatBox value={player.batting_dismissals} label="Dismissals" />
            </div>

            <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-5 mb-2">Bowling</p>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <StatBox value={player.wickets} label="Wickets" highlight="primary" highlightBg={cfg.highlightBg} />
              <StatBox value={player.bowling_average?.toFixed(2)} label="Bowling Avg" highlight="orange" highlightBg={cfg.highlightBg} />
              <StatBox value={player.economy?.toFixed(2)} label="Economy" highlight="dark" highlightBg={cfg.highlightBg} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
              <SecondaryStatBox value={player.overs?.toFixed(1)} label="Overs" />
              <SecondaryStatBox value={player.balls_bowled} label="Balls Bowled" />
              <SecondaryStatBox value={player.runs_conceded} label="Runs Conceded" />
            </div>
          </>
        ) : hasBowling ? (
          <>
            <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3">
              <StatBox value={player.wickets} label="Wickets" highlight="primary" highlightBg={cfg.highlightBg} />
              <StatBox value={player.bowling_average?.toFixed(2)} label="Bowling Avg" highlight="orange" highlightBg={cfg.highlightBg} />
              <StatBox value={player.economy?.toFixed(2)} label="Economy" highlight="dark" highlightBg={cfg.highlightBg} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
              <SecondaryStatBox value={player.overs?.toFixed(1)} label="Overs" />
              <SecondaryStatBox value={player.balls_bowled} label="Balls Bowled" />
              <SecondaryStatBox value={player.runs_conceded} label="Runs Conceded" />
              <SecondaryStatBox value={player.runs} label="Runs (Bat)" />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3">
              <StatBox value={player.runs} label="Runs" highlight="primary" highlightBg={cfg.highlightBg} />
              <StatBox value={player.strike_rate?.toFixed(2)} label="Strike Rate" highlight="orange" highlightBg={cfg.highlightBg} />
              <StatBox value={player.batting_average?.toFixed(2)} label="Average" highlight="dark" highlightBg={cfg.highlightBg} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
              <SecondaryStatBox value={player.balls_faced} label="Balls Faced" />
              <SecondaryStatBox value={player.fours} label="Fours" />
              <SecondaryStatBox value={player.sixes} label="Sixes" />
              <SecondaryStatBox value={player.batting_dismissals} label="Dismissals" />
            </div>
          </>
        )}

        {showMore && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
            <SecondaryStatBox value={player.fours + player.sixes} label="Boundaries" />
            {hasBowling && (
              <>
                <SecondaryStatBox value={player.runs_conceded} label="Runs Conceded" />
                <SecondaryStatBox value={player.balls_bowled} label="Balls Bowled" />
              </>
            )}
          </div>
        )}

        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full mt-3 h-11 md:h-12 rounded-full bg-[#242424] text-[#d0d0d0] text-[13px] md:text-sm font-semibold border-0 cursor-pointer hover:bg-[#2e2e2e] transition-colors"
        >
          {showMore ? "View Less Stats" : "View More Stats"}
        </button>
      </div>

      {/* Player Details */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Player Details" accentColor={cfg.accentColor} />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[20px] md:text-[24px] font-extrabold leading-tight" style={{ color: cfg.accentColor }}>
              {cfg.label}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Tournament</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-tight">
              {player.format}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Format</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[15px] md:text-[18px] font-extrabold text-white leading-tight capitalize">
              {player.gender}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Category</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[20px] md:text-[24px] font-extrabold text-[#e91e8c] leading-tight">
              {player.jersey_no != null ? `#${player.jersey_no}` : "—"}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Jersey No.</span>
          </div>
        </div>
      </div>

      {/* Coming Soon — Insights */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Career Insights" accentColor={cfg.accentColor} />
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-10 h-10 lg:w-16 lg:h-16 mb-4 rounded-full bg-[#242424] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
          </div>
          <h3 className="text-white text-sm lg:text-base font-semibold mb-2">Coming Soon</h3>
          <p className="text-[#888888] text-sm max-w-sm">
            Detailed career insights for {cfg.label} players are coming soon. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}