// components\NewHomeComponents\IndiaHub.tsx

import { ChevronRight } from "lucide-react";

export default function IndiaHub() {
  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">India Hub</h3>
        <button
          type="button"
          className="flex items-center gap-0.5 text-[12px] font-bold"
          style={{ color: "#E91E8C" }}
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Indian Squad */}
        <div
          className="rounded-2xl p-4 min-h-[170px] flex flex-col justify-between"
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
    </div>
  );
}