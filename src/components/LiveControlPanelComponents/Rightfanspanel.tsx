"use client";

import React from "react";

type Fan = {
  name: string;
  pts: number;
  initial: string;
  color: string;
};

const topFans: Fan[] = [
  { name: "Rahul_123", pts: 2840, initial: "R", color: "#f97316" },
  { name: "cricket_queen", pts: 2210, initial: "C", color: "#06b6d4" },
  { name: "badminton_dev", pts: 1980, initial: "B", color: "#8b5cf6" },
];

export default function RightFansPanel() {
  return (
    <div className="flex flex-col bg-[#111318] border-l border-t border-[#2a2d35] px-4 py-3 gap-4">
      {/* Top Fans */}
      <div>
        <p className="text-[10px] font-semibold text-[#9ca3af] mb-2">
          Top Fans — Live
        </p>
        <div className="flex flex-col gap-2">
          {topFans.map((fan, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-[#1a1d24] border border-[#2a2d35] rounded-lg px-3 py-2"
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                style={{ backgroundColor: fan.color }}
              >
                {fan.initial}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-white text-[11px] font-medium truncate">
                  {fan.name}
                </p>
                <p className="text-[#6b7280] text-[9px]">
                  {fan.pts.toLocaleString()} pts
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Super Fan Queue */}
      <div>
        <p className="text-[9px] font-bold tracking-widest text-[#6b7280] uppercase mb-2">
          Super Fan Queue
        </p>
        <div className="bg-[#1a1d24] border border-[#2a2d35] rounded-lg p-3 flex flex-col gap-3">
          {/* Fan info */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#f97316] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              R
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-white text-[11px] font-semibold">Rahul_123</p>
              <span className="bg-[#1e3a5f] border border-[#2563eb] text-[#60a5fa] text-[8px] font-bold px-1.5 py-0.5 rounded">
                VIP
              </span>
            </div>
          </div>

          {/* Quote */}
          <p className="text-[#d1d5db] text-[11px] leading-relaxed">
            &apos;Coach, how is India countering Denmark&apos;s net play?&apos;
          </p>

          {/* Acknowledge button */}
          <button className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white text-[11px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
            Acknowledge ▶
          </button>
        </div>
      </div>
    </div>
  );
}