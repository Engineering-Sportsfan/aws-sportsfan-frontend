"use client";

import Link from "next/link";
import React from "react";

const FanBattleHeader: React.FC = () => {
  return (
    <div className="w-full bg-[#121212] px-4 pt-4 pb-4">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-5">
        <Link href="/MainModules/HomePage">
          <button className="flex items-center justify-center cursor-pointer w-8 h-8 rounded-full bg-[#1e1e1e] hover:bg-[#2a2a2a] transition-colors">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        </Link>
      </div>

    

      {/* Live Match Banner */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-[#2a1a2e] via-[#1e1028] to-[#1a1a2e] p-4 flex items-center justify-between border border-[#3a2040]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00e676] inline-block animate-pulse" />
            <span className="text-[#00e676] text-[11px] font-bold tracking-widest uppercase">
              Live Now
            </span>
          </div>
          <span className="text-white text-[13px] font-semibold">
            IPL 2026 • Match 24
          </span>
          <span className="text-[#b0b0b0] text-[12px]">RCB vs MI</span>
          <span className="text-white text-[13px] font-bold mt-0.5">
            178/4{" "}
            <span className="text-[#8a8a8a] font-normal text-[11px]">
              (18.2 ov)
            </span>
          </span>
        </div>

        <button className="bg-[#e91e8c] hover:bg-[#d81b80] active:bg-[#c2185b] transition-colors text-white text-[12px] sm:text-[13px] font-bold px-4 py-2.5 rounded-xl whitespace-nowrap shadow-lg shadow-pink-900/40">
          Play Along Live
        </button>
      </div>
    </div>
  );
};

export default FanBattleHeader;