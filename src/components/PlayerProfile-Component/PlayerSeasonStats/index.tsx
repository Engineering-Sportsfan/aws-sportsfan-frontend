// "use client";

// import { Player } from "@/types/player";
// import { useState } from "react";

// interface Props {
//   player: Player;
// }

// function SectionLabel({ text }: { text: string }) {
//   return (
//     <div className="flex items-center gap-2">
//       <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
//       <span className="text-base md:text-lg font-bold text-white">{text}</span>
//     </div>
//   );
// }

// export default function PlayerSeasonStats({ player }: Props) {
//   const { season, insights } = player;
//   const [showMoreStats, setShowMoreStats] = useState(false);
//   const isBowler =
//     player.overview?.specialization?.toLowerCase().includes("bowler");
//     const currentYear = new Date().getFullYear();

//   return (
//     <div className="flex flex-col gap-4 px-4 md:px-6 pb-4">

//       {/* ── IPL Season card ── */}
//       <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
//         <SectionLabel text={`IPL ${currentYear} Season`} />

//         {/* Top 3 highlight boxes */}

//         <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3">
//           {isBowler ? (
//             <>
//               <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e91e8c]">
//                 <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
//                   {season.wickets}
//                 </span>
//                 <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">
//                   Wickets
//                 </span>
//               </div>

//               <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e08c00]">
//                 <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
//                   {season.bowlingAvg}
//                 </span>
//                 <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">
//                   Bowling Avg
//                 </span>
//               </div>

//               <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#242424]">
//                 <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
//                   {season.economy}
//                 </span>
//                 <span className="text-[11px] md:text-xs text-[#777777] mt-1 font-medium">
//                   Economy
//                 </span>
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e91e8c]">
//                 <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
//                   {season.runs}
//                 </span>
//                 <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">
//                   Runs
//                 </span>
//               </div>

//               <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e08c00]">
//                 <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
//                   {season.strikeRate}
//                 </span>
//                 <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">
//                   Strike Rate
//                 </span>
//               </div>

//               <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#242424]">
//                 <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
//                   {season.average}
//                 </span>
//                 <span className="text-[11px] md:text-xs text-[#777777] mt-1 font-medium">
//                   Average
//                 </span>
//               </div>
//             </>
//           )}
//         </div>



//         {/* Secondary 2×2 → 4-col on tablet+ */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
//           {isBowler ? (
//             <>
//               <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                 <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                   Bowling SR
//                 </span>
//                 <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                   {season.bowlingSR}
//                 </span>
//               </div>

//               {/* <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                 <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                   Economy
//                 </span>
//                 <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                   {season.economy}
//                 </span>
//               </div> */}

//               <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                 <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                   Best Bowling
//                 </span>
//                 <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                   {season.bestBowling}
//                 </span>
//               </div>

//               <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                 <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                   3W/5W Hauls
//                 </span>
//                 <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                   {season.threeW_fiveW_Hauls}
//                 </span>
//               </div>
//             </>
//           ) : (
//             <>
//               <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                 <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                   50s / 100s
//                 </span>
//                 <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                   {/* {season.fifties} / {season.hundreds} */}
//                   {season.fiftiesAndHundreds}
//                 </span>
//               </div>

//               <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                 <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                   Highest Score
//                 </span>
//                 <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                   {season.highestScore}
//                 </span>
//               </div>

//               <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                 <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                   Fours
//                 </span>
//                 <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                   {season.fours}
//                 </span>
//               </div>

//               <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                 <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                   Sixes
//                 </span>
//                 <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                   {season.sixes}
//                 </span>
//               </div>
//             </>
//           )}
//         </div>


//         {showMoreStats && (
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
//             {isBowler ? (
//               <>
//                 {/* <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                   <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                     5W Hauls
//                   </span>
//                   <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                     {season.fiveWicketHauls}
//                   </span>
//                 </div> */}

//                 <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                   <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                     Fours Conceded
//                   </span>
//                   <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                     {season.foursConceded}
//                   </span>
//                 </div>

//                 <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                   <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                     Sixes Conceded
//                   </span>
//                   <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                     {season.sixesConceded}
//                   </span>
//                 </div>
//               </>
//             ) : (
//               <>
//                 {/* <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                   <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                     Not Outs
//                   </span>
//                   <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                     12
//                   </span>
//                 </div> */}

//                 {/* <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                   <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                     Ducks
//                   </span>
//                   <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                     2
//                   </span>
//                 </div> */}

//                 <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
//                   <span className="text-[11px] md:text-xs text-[#777777] mb-1">
//                     Boundaries
//                   </span>
//                   <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
//                     {season.fours + season.sixes}
//                   </span>
//                 </div>
//               </>
//             )}
//           </div>
//         )}

//         {/* Orange Cap award badge */}
//         <div className="flex items-center gap-3 mt-2.5 bg-[#e91e8c]/10 border border-[#e91e8c]/30 rounded-2xl px-3.5 py-3 md:px-4 md:py-3.5">
//           <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e91e8c] shrink-0">
//             <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
//               <circle cx="12" cy="8" r="6" />
//               <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
//             </svg>
//           </div>
//           <div>
//             <p className="text-[13px] md:text-sm font-bold text-white">🧡 {season.award}</p>
//             <p className="text-[12px] md:text-[13px] text-[#999999] mt-0.5">{season.awardSub}</p>
//           </div>
//         </div>

//         <button
//           onClick={() => setShowMoreStats(!showMoreStats)}
//           className="w-full mt-3 h-11 md:h-12 rounded-full bg-[#242424] text-[#d0d0d0] text-[13px] md:text-sm font-semibold border-0 cursor-pointer hover:bg-[#2e2e2e] transition-colors"
//         >
//           {showMoreStats ? "View Less Stats" : "View More Stats"}
//         </button>
//       </div>

//       {/* ── Career Insights card ── */}
//       <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
//         <SectionLabel text="Career Insights" />

//         <div className="flex flex-col gap-2 mt-3">
//           {insights.map((ins, i) => (
//             <div key={i} className="flex items-start gap-3 bg-[#242424] rounded-xl p-3 md:p-4">
//               <div className="flex items-center justify-center w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full bg-[#e91e8c]/15 shrink-0 mt-0.5">
//                 <svg width="18" height="18" fill="none" stroke="#e91e8c" strokeWidth="2.2" viewBox="0 0 24 24">
//                   <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
//                   <polyline points="16 7 22 7 22 13" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-[13px] md:text-sm font-bold text-white">{ins.title}</p>
//                 <p className="text-[12px] md:text-[13px] text-[#999999] mt-1 leading-relaxed">{ins.description}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         <button className="w-full mt-3 h-11 md:h-12 rounded-full bg-[#242424] text-[#d0d0d0] text-[13px] md:text-sm font-semibold border-0 cursor-pointer hover:bg-[#2e2e2e] transition-colors">
//           View More
//         </button>
//       </div>
//     </div>
//   );
// }














// components/PlayerProfile-Component/PlayerSeasonStats/index.tsx

"use client";

import { Player } from "@/types/player";
import { useState } from "react";

interface Props {
  player: Player;
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
      <span className="text-base md:text-lg font-bold text-white">{text}</span>
    </div>
  );
}

export default function PlayerSeasonStats({ player }: Props) {
  const { season, insights } = player;
  const [showMoreStats, setShowMoreStats] = useState(false);

  const specialization = player.overview?.specialization?.toLowerCase() ?? "";
  const isBowler = specialization.includes("bowler");
  const isAllRounder =
    specialization.includes("all-rounder") ||
    specialization.includes("allrounder") ||
    specialization.includes("all rounder");

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pb-4">

      {/* ── IPL Season card ── */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text={`IPL ${currentYear} Season`} />

        {/* ── ALL-ROUNDER: show both batting & bowling ── */}
        {isAllRounder ? (
          <>
            {/* Batting sub-header */}
            <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-4 mb-2">
              Batting
            </p>

            {/* Batting top 3 */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e91e8c]">
                <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                  {season.runs}
                </span>
                <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">
                  Runs
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e08c00]">
                <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                  {season.strikeRate}
                </span>
                <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">
                  Strike Rate
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#242424]">
                <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                  {season.average}
                </span>
                <span className="text-[11px] md:text-xs text-[#777777] mt-1 font-medium">
                  Average
                </span>
              </div>
            </div>

            {/* Batting secondary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[11px] md:text-xs text-[#777777] mb-1">50s / 100s</span>
                <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                  {season.fiftiesAndHundreds}
                </span>
              </div>

              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[11px] md:text-xs text-[#777777] mb-1">Highest Score</span>
                <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                  {season.highestScore}
                </span>
              </div>

              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[11px] md:text-xs text-[#777777] mb-1">Fours</span>
                <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                  {season.fours}
                </span>
              </div>

              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[11px] md:text-xs text-[#777777] mb-1">Sixes</span>
                <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                  {season.sixes}
                </span>
              </div>
            </div>

            {/* Bowling sub-header */}
            <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-5 mb-2">
              Bowling
            </p>

            {/* Bowling top 3 */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e91e8c]">
                <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                  {season.wickets}
                </span>
                <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">
                  Wickets
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e08c00]">
                <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                  {season.bowlingAvg}
                </span>
                <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">
                  Bowling Avg
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#242424]">
                <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                  {season.economy}
                </span>
                <span className="text-[11px] md:text-xs text-[#777777] mt-1 font-medium">
                  Economy
                </span>
              </div>
            </div>

            {/* Bowling secondary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[11px] md:text-xs text-[#777777] mb-1">Bowling SR</span>
                <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                  {season.bowlingSR}
                </span>
              </div>

              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[11px] md:text-xs text-[#777777] mb-1">Best Bowling</span>
                <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                  {season.bestBowling}
                </span>
              </div>

              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[11px] md:text-xs text-[#777777] mb-1">3W/5W Hauls</span>
                <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                  {season.threeW_fiveW_Hauls}
                </span>
              </div>
            </div>

            {/* All-rounder "show more" extras */}
            {showMoreStats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
                <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                  <span className="text-[11px] md:text-xs text-[#777777] mb-1">Boundaries</span>
                  <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                    {season.fours + season.sixes}
                  </span>
                </div>

                <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                  <span className="text-[11px] md:text-xs text-[#777777] mb-1">Fours Conceded</span>
                  <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                    {season.foursConceded}
                  </span>
                </div>

                <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                  <span className="text-[11px] md:text-xs text-[#777777] mb-1">Sixes Conceded</span>
                  <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                    {season.sixesConceded}
                  </span>
                </div>
              </div>
            )}
          </>

        ) : (
          <>
            {/* ── BATTER or BOWLER (original logic) ── */}

            {/* Top 3 highlight boxes */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3">
              {isBowler ? (
                <>
                  <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e91e8c]">
                    <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                      {season.wickets}
                    </span>
                    <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">Wickets</span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e08c00]">
                    <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                      {season.bowlingAvg}
                    </span>
                    <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">Bowling Avg</span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#242424]">
                    <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                      {season.economy}
                    </span>
                    <span className="text-[11px] md:text-xs text-[#777777] mt-1 font-medium">Economy</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e91e8c]">
                    <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                      {season.runs}
                    </span>
                    <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">Runs</span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e08c00]">
                    <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                      {season.strikeRate}
                    </span>
                    <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">Strike Rate</span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#242424]">
                    <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                      {season.average}
                    </span>
                    <span className="text-[11px] md:text-xs text-[#777777] mt-1 font-medium">Average</span>
                  </div>
                </>
              )}
            </div>

            {/* Secondary 2×2 → 4-col on tablet+ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
              {isBowler ? (
                <>
                  <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                    <span className="text-[11px] md:text-xs text-[#777777] mb-1">Bowling SR</span>
                    <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                      {season.bowlingSR}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                    <span className="text-[11px] md:text-xs text-[#777777] mb-1">Best Bowling</span>
                    <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                      {season.bestBowling}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                    <span className="text-[11px] md:text-xs text-[#777777] mb-1">3W/5W Hauls</span>
                    <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                      {season.threeW_fiveW_Hauls}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                    <span className="text-[11px] md:text-xs text-[#777777] mb-1">50s / 100s</span>
                    <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                      {season.fiftiesAndHundreds}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                    <span className="text-[11px] md:text-xs text-[#777777] mb-1">Highest Score</span>
                    <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                      {season.highestScore}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                    <span className="text-[11px] md:text-xs text-[#777777] mb-1">Fours</span>
                    <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                      {season.fours}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                    <span className="text-[11px] md:text-xs text-[#777777] mb-1">Sixes</span>
                    <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                      {season.sixes}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Show More extras */}
            {showMoreStats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
                {isBowler ? (
                  <>
                    <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                      <span className="text-[11px] md:text-xs text-[#777777] mb-1">Fours Conceded</span>
                      <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                        {season.foursConceded}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                      <span className="text-[11px] md:text-xs text-[#777777] mb-1">Sixes Conceded</span>
                      <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                        {season.sixesConceded}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                    <span className="text-[11px] md:text-xs text-[#777777] mb-1">Boundaries</span>
                    <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                      {season.fours + season.sixes}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Award badge — always shown */}
        {/* <div className="flex items-center gap-3 mt-2.5 bg-[#e91e8c]/10 border border-[#e91e8c]/30 rounded-2xl px-3.5 py-3 md:px-4 md:py-3.5">
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e91e8c] shrink-0">
            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] md:text-sm font-bold text-white">🧡 {season.award}</p>
            <p className="text-[12px] md:text-[13px] text-[#999999] mt-0.5">{season.awardSub}</p>
          </div>
        </div> */}

        <button
          onClick={() => setShowMoreStats(!showMoreStats)}
          className="w-full mt-3 h-11 md:h-12 rounded-full bg-[#242424] text-[#d0d0d0] text-[13px] md:text-sm font-semibold border-0 cursor-pointer hover:bg-[#2e2e2e] transition-colors"
        >
          {showMoreStats ? "View Less Stats" : "View More Stats"}
        </button>
      </div>

      {/* ── Career Insights card ── */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Career Insights" />

        <div className="flex flex-col gap-2 mt-3">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#242424] rounded-xl p-3 md:p-4">
              <div className="flex items-center justify-center w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full bg-[#e91e8c]/15 shrink-0 mt-0.5">
                <svg width="18" height="18" fill="none" stroke="#e91e8c" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] md:text-sm font-bold text-white">{ins.title}</p>
                <p className="text-[12px] md:text-[13px] text-[#999999] mt-1 leading-relaxed">{ins.description}</p>
              </div>
            </div>
          ))}
        </div>

      {insights.length > 1 && 
        <button className="w-full mt-3 h-11 md:h-12 rounded-full bg-[#242424] text-[#d0d0d0] text-[13px] md:text-sm font-semibold border-0 cursor-pointer hover:bg-[#2e2e2e] transition-colors">
          View More
        </button>
        }
      </div>
    </div>
  );
}