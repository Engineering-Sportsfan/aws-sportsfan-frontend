"use client";

import React from "react";

export default function TopHeader() {
  return (
    <header className="h-[52px] bg-[#0d0f14] border-b border-[#2a2d35] flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-4">
        <span className="text-white text-[13px] font-bold tracking-tight">
          LiveRoomControl
        </span>
        <div className="w-px h-5 bg-[#2a2d35]" />
        <button className="text-[#9ca3af] hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors">
          ← Host
        </button>
        <div className="w-px h-5 bg-[#2a2d35]" />
        <span className="text-white text-[13px] font-semibold">
          Live Room — Control Panel (Main)
        </span>
      </div>

      {/* Center: LIVE badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[#dc2626] px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-[11px] font-bold tracking-wide">
            LIVE
          </span>
        </div>
      </div>

      {/* Right: Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[#9ca3af] text-[11px]">
          <span className="text-white font-mono font-semibold">⏱ 34:52</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1e2128] border border-[#2e3340] px-3 py-1.5 rounded-lg">
          <span className="text-[11px] text-[#f97316]">👥</span>
          <span className="text-white text-[11px] font-semibold">1,204</span>
          <span className="text-[#6b7280] text-[10px]">watching</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0a2a1a] border border-[#166534] px-3 py-1.5 rounded-lg">
          <span className="text-[#4ade80] text-[11px] font-semibold">847</span>
          <span className="text-[#4ade80] text-[10px]">active</span>
        </div>
      </div>
    </header>
  );
}