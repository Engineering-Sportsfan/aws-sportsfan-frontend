// components\NewHomeComponents\IndiaHub.tsx

import { ChevronRight } from "lucide-react";
import { useRouter } from 'next/navigation'; // Note: 'next/navigation'

export default function IndiaHub({ sport = "mixed" }: { sport?: string }) {
  const router = useRouter();

  const isMixed = sport === "mixed" || sport === "athletics";
  const capitalizedSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  const title = isMixed ? "India Hub" : `${capitalizedSport} Hub`;

  // Custom data based on sport
  const isCricket = sport.toLowerCase() === "cricket";
  const isFootball = sport.toLowerCase() === "football";

  // Gradient themes
  let cardBgStyle = "linear-gradient(160deg,#12213f,#0a1226)"; // default mixed dark blue
  let borderStyle = "border border-white/[0.06]";
  let accentTextColor = "text-emerald-400";
  let badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";

  if (isCricket) {
    cardBgStyle = "linear-gradient(160deg,#041a0f,#020d08)";
    borderStyle = "border border-emerald-500/15";
    accentTextColor = "text-emerald-400";
    badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  } else if (isFootball) {
    cardBgStyle = "linear-gradient(160deg,#061b2c,#030d16)";
    borderStyle = "border border-blue-500/15";
    accentTextColor = "text-blue-400";
    badgeStyle = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  } else if (!isMixed) {
    cardBgStyle = "linear-gradient(160deg,#170a2b,#0c0517)";
    borderStyle = "border border-violet-500/15";
    accentTextColor = "text-violet-400";
    badgeStyle = "bg-violet-500/10 text-violet-400 border border-violet-500/20";
  }

  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">{title}</h3>
        <button
          type="button"
          onClick={() => router.push('/MainModules/AthleteHomePage')}
          className="flex items-center gap-0.5 text-[12px] font-bold"
          style={{ color: "#E91E8C" }}
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      {isMixed ? (
        <div className="grid grid-cols-2 gap-3">
          {/* Indian Squad */}
          <div
            onClick={() => router.push('/MainModules/AthleteHomePage')}
            className="rounded-2xl hover:cursor-pointer p-4 min-h-[170px] flex flex-col justify-between"
            style={{ background: "linear-gradient(160deg,#12213f,#0a1226)" }}
          >
            <div>
              <h4 className="text-[13px] font-extrabold text-white mb-1">INDIAN SQUAD</h4>
              <p className="text-[11px] text-white/45 font-medium">View all athletes</p>
            </div>
            <p className="text-4xl font-black text-white/90 leading-none">IN</p>
          </div>

          {/* AI Profiles */}
          <div
            className="relative rounded-2xl p-4 min-h-[170px] flex flex-col justify-between"
            style={{ background: "linear-gradient(160deg,#2a1245,#170a2b)" }}
          >
            <span className="absolute top-3.5 right-3.5 text-[10px] font-extrabold text-white bg-violet-500/60 px-2.5 py-1 rounded-full">
              AI
            </span>
            <div>
              <h4 className="text-[13px] font-extrabold text-white mb-1">AI PROFILES</h4>
              <p className="text-[11px] text-white/45 font-medium">Created in seconds</p>
            </div>
            <span className="text-3xl leading-none">🤖</span>
          </div>

          {/* Medal Center */}
          <div
            className="rounded-2xl p-4 min-h-[170px] flex flex-col justify-between"
            style={{ background: "linear-gradient(160deg,#3a2408,#1c1204)" }}
          >
            <div>
              <h4 className="text-[13px] font-extrabold text-white mb-1">MEDAL CENTER</h4>
              <p className="text-[11px] text-white/45 font-medium">Live Tally &amp; Chances</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl font-black text-emerald-400 leading-none">#3</span>
              <span className="text-[12px] font-bold text-white/70 flex items-center gap-1">
                🥇 7
              </span>
              <span className="text-[12px] font-bold text-white/70 flex items-center gap-1">
                🥈 5
              </span>
              <span className="text-[12px] font-bold text-white/70 flex items-center gap-1">
                🥉 11
              </span>
            </div>
          </div>

          {/* Match Center */}
          <div
            className="rounded-2xl p-4 min-h-[170px] flex flex-col justify-between"
            style={{ background: "linear-gradient(160deg,#0c3323,#061a14)" }}
          >
            <div>
              <h4 className="text-[13px] font-extrabold text-white mb-1">MATCH CENTER</h4>
              <p className="text-[11px] text-white/45 font-medium">Live Scores, Stats &amp; Updates</p>
            </div>
            <span className="text-3xl leading-none">🏆</span>
          </div>
        </div>
      ) : (
        /* Sport-Specific 2-card Hub matching screenshot layout */
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Sport Squad */}
          <div
            onClick={() => router.push('/MainModules/AthleteHomePage')}
            className={`rounded-[24px] hover:cursor-pointer p-4 min-h-[170px] flex flex-col justify-between transition-all duration-200 ${borderStyle}`}
            style={{ background: cardBgStyle }}
          >
            <div>
              <h4 className="text-[13px] font-extrabold text-white tracking-wide mb-1">
                {capitalizedSport.toUpperCase()} SQUAD
              </h4>
              <p className="text-[11px] text-white/50 mb-3.5">
                {isCricket
                  ? "Rohit · Kohli · Bumrah"
                  : isFootball
                  ? "Ronaldo · Messi · Neymar"
                  : "Champions & Challengers"}
              </p>
              
              {/* Squad circles */}
              <div className="flex gap-1.5 items-center">
                {isCricket ? (
                  <>
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px] border border-emerald-500/35">VK</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px] border border-emerald-500/35">RS</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px] border border-emerald-500/35">JB</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px] border border-emerald-500/35">RJ</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px] border border-emerald-500/35">KL</span>
                  </>
                ) : isFootball ? (
                  <>
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px] border border-blue-500/35">CR</span>
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px] border border-blue-500/35">LM</span>
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px] border border-blue-500/35">NJ</span>
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px] border border-blue-500/35">MB</span>
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px] border border-blue-500/35">HA</span>
                  </>
                ) : (
                  <>
                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-[9px] border border-violet-500/35">A1</span>
                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-[9px] border border-violet-500/35">A2</span>
                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-[9px] border border-violet-500/35">A3</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-bold text-white bg-white/10 px-1.5 py-0.5 rounded leading-none">IN</span>
              <p className="text-[10px] text-white/40 font-medium truncate">
                {isCricket ? "India vs SL · Test" : isFootball ? "Champions Cup Match" : "India National Event"}
              </p>
            </div>
          </div>

          {/* Card 2: Game Center */}
          <div
            className={`relative rounded-[24px] p-4 min-h-[170px] flex flex-col justify-between transition-all duration-200 ${borderStyle}`}
            style={{ background: cardBgStyle }}
          >
            <div className="flex justify-between items-start w-full">
              <h4 className="text-[13px] font-extrabold text-white tracking-wide">GAME CENTER</h4>
              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider leading-none uppercase ${badgeStyle}`}>
                LIVE
              </span>
            </div>

            <div className="my-auto">
              <p className="text-[10px] text-white/40 mb-1 truncate">
                {isCricket
                  ? "IND vs SL · Galle Test · Day 2"
                  : isFootball
                  ? "FC Porto vs Benfica · Liga"
                  : "India vs World · Final"}
              </p>
              
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${accentTextColor} leading-none`}>
                  {isCricket ? "IN 284/6" : isFootball ? "POR 2 - 1 SLB" : "IN Leads"}
                </span>
                <span className="text-[10px] text-white/40 font-bold">
                  {isCricket ? "87.2 overs" : isFootball ? "85'" : "Round 2"}
                </span>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-2 mt-2">
              <p className="text-[9px] font-bold text-white/40 tracking-wider">
                {isCricket ? "RR 3.26 | CRR 4.8 | 15 AUG" : isFootball ? "Estádio do Dragão | LIVE" : "Final Standings | LIVE"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}