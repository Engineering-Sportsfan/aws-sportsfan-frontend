"use client";

import React from "react";

export default function LeftSidebar() {
  return (
    <aside className="w-[130px] min-h-screen bg-[#111318] flex flex-col px-3 py-4 gap-5 border-r border-[#2a2d35]">
      {/* Zone A — Controls */}
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-bold tracking-widest text-[#6b7280] uppercase">
          Zone A — Controls
        </p>
        <button className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white text-[11px] font-semibold rounded-md py-2 px-2 transition-colors">
          Control Panel
        </button>
        <button className="w-full bg-[#1e2128] hover:bg-[#252830] border border-[#2e3340] text-white text-[11px] font-medium rounded-md py-2 px-2 transition-colors">
          Leaderboard
        </button>
        <button className="w-full bg-[#1e2128] hover:bg-[#252830] border border-[#2e3340] text-white text-[11px] font-medium rounded-md py-2 px-2 transition-colors">
          Live Analytics
        </button>
        <button className="w-full bg-[#1e2128] hover:bg-[#252830] border border-[#2e3340] text-white text-[11px] font-medium rounded-md py-2 px-2 transition-colors">
          Content Bank
        </button>
      </div>

      {/* Room Actions */}
      <div className="flex flex-col gap-2">
        <p className="text-[9px] font-bold tracking-widest text-[#6b7280] uppercase">
          Room Actions
        </p>
        <button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[10px] font-semibold rounded-md py-2 px-2 transition-colors flex items-center justify-center gap-1">
          <span className="text-[9px]">⏸</span> Pause Room (BRB)
        </button>
        <button className="w-full bg-[#1e4080] hover:bg-[#1a3870] text-white text-[11px] font-medium rounded-md py-2 px-2 transition-colors">
          Pause Interactions
        </button>
        <button className="w-full bg-[#92400e] hover:bg-[#7c3a0d] text-[#fbbf24] text-[11px] font-medium rounded-md py-2 px-2 transition-colors">
          Pause Live Chat
        </button>
      </div>

      {/* Revenue */}
      <div className="flex flex-col gap-1 mt-1">
        <p className="text-[10px] text-[#9ca3af]">
          Revenue <span className="text-white font-semibold">Engaged</span>
        </p>
        <p className="text-[20px] font-bold text-[#4ade80]">₹42K</p>
        <p className="text-[16px] font-bold text-[#4ade80]">74%</p>
      </div>

      {/* Mod Alerts */}
      <div className="flex flex-col gap-2 mt-1">
        <p className="text-[9px] font-bold tracking-widest text-[#6b7280] uppercase">
          Mod Alerts
        </p>
        <button className="w-full bg-[#450a0a] hover:bg-[#5a0d0d] border border-[#dc2626] text-[#f87171] text-[10px] font-semibold rounded-md py-2 px-2 transition-colors flex items-center justify-center gap-1">
          <span>⚠</span> 1 pending
        </button>
      </div>
    </aside>
  );
}