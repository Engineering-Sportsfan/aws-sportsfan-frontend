"use client";

import React from "react";

export default function MiddlePanel() {
  return (
    <div className="flex-1 flex flex-col bg-[#0d0f14] min-w-0">
      {/* Stream Feed Area */}
      <div className="relative flex-1 bg-[#0a0c10] flex items-center justify-center border-b border-[#2a2d35]">
        {/* View Active Fans button */}
        <div className="absolute top-3 right-3">
          <button className="bg-[#1a1d24] hover:bg-[#252830] border border-[#3a3d46] text-white text-[11px] font-medium rounded-full px-4 py-1.5 transition-colors">
            View Active Fans
          </button>
        </div>

        {/* Stream placeholder */}
        <p className="text-[#4b5563] text-sm font-medium tracking-wide">
          [ Live Stream Feed — Fan View ]
        </p>

        {/* Host Cam PiP */}
        <div className="absolute bottom-4 right-4 w-36 h-24 bg-[#1a0a08] border border-[#4a2218] rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-2xl">
          <p className="text-white text-[13px] font-semibold">Host Cam</p>
          <p className="text-[#9ca3af] text-[10px]">PiP</p>
        </div>

        {/* Bottom action bar inside stream */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
          {/* Ask AI */}
          <button className="flex items-center gap-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[11px] font-semibold rounded-full px-4 py-2 transition-colors shadow-lg">
            <span className="text-[12px]">✦</span> Ask AI
          </button>

          {/* + */}
          <button className="w-8 h-8 bg-[#1e2128] hover:bg-[#252830] border border-[#3a3d46] text-white text-lg font-light rounded-full flex items-center justify-center transition-colors shadow-md">
            +
          </button>

          {/* Mic */}
          <button className="w-8 h-8 bg-[#1e2128] hover:bg-[#252830] border border-[#3a3d46] text-white text-sm rounded-full flex items-center justify-center transition-colors shadow-md">
            🎤
          </button>

          {/* Camera */}
          <button className="w-8 h-8 bg-[#1e2128] hover:bg-[#252830] border border-[#3a3d46] text-white text-sm rounded-full flex items-center justify-center transition-colors shadow-md">
            📷
          </button>

          {/* End Room */}
          <button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[11px] font-semibold rounded-full px-5 py-2 transition-colors shadow-lg">
            End Room
          </button>
        </div>
      </div>

      {/* Zone C — Chat & Social */}
      <BottomBar />
    </div>
  );
}

function BottomBar() {
  return (
    <div className="bg-[#111318] border-t border-[#2a2d35] px-4 pt-3 pb-3">
      <p className="text-[9px] font-bold tracking-widest text-[#6b7280] uppercase mb-2">
        Zone C — Chat &amp; Social
      </p>

      {/* Action buttons row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <ActionBtn icon="📌" label="Pin Message" />
        <ActionBtn icon="📢" label="Announcement" />
        <ActionBtn icon="🚩" label="Flag MoM" highlight />
        <ActionBtn icon="📋" label="Lower Third" />
        <ActionBtn icon="✏️" label="Annotate Stream" />
        <ActionBtn icon="⭐" label="Acknowledge Super Fan" wide />
      </div>

      {/* Pinned message */}
      <div className="flex items-center justify-between bg-[#0d1117] border border-[#1e4d2b] rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[#4ade80] text-[11px]">📌</span>
          <p className="text-[#4ade80] text-[11px] font-medium">
            Pinned: &apos;What is India&apos;s smash speed average?&apos; — Ask AI answered
          </p>
        </div>
        <button className="text-[#4ade80] text-[11px] font-semibold hover:text-white transition-colors">
          Unpin
        </button>
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  highlight,
  wide,
}: {
  icon: string;
  label: string;
  highlight?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-1.5 border text-[10px] font-medium rounded-md px-3 py-1.5 transition-colors
        ${wide ? "px-4" : ""}
        ${
          highlight
            ? "border-[#dc2626] text-[#f87171] bg-[#1a0808] hover:bg-[#220a0a]"
            : "border-[#2e3340] text-[#d1d5db] bg-[#1e2128] hover:bg-[#252830]"
        }`}
    >
      <span className="text-[11px]">{icon}</span>
      {label}
    </button>
  );
}