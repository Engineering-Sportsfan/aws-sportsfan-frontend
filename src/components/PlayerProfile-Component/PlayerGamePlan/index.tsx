// components/PlayerProfile-Component/PlayerGamePlan/index.tsx
"use client";

import { useState } from "react";
import { Player } from "@/types/player";

interface Props {
  player: Player;
}

type Tab = "Drops" | "Videos" | "Live" | "Posts";
const TABS: Tab[] = ["Drops", "Videos", "Live", "Posts"];

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
      <span className="text-base md:text-lg font-bold text-white">{text}</span>
    </div>
  );
}

function TabIcon({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const stroke = isActive ? "#fff" : "#888888";
  if (tab === "Drops") return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-[#e91e8c]"}`} />;
  if (tab === "Videos") return (
    <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="7" width="15" height="10" rx="2" /><path d="m17 9 5 3-5 3V9z" />
    </svg>
  );
  if (tab === "Live") return (
    <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
  if (tab === "Posts") return <span className={`text-[14px] leading-none ${isActive ? "text-white" : "text-[#888888]"}`}>#</span>;
  return null;
}

export default function PlayerGamePlan({ player }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Drops");
  const { strengths, media } = player;

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pb-18">

      {/* ── Game Plan card ── */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Game Plan" />
        <p className="text-[13px] md:text-sm font-bold text-white mt-3 mb-2.5">Key Strengths</p>

        {/* 1-col mobile, 2-col tablet+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {strengths.map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#242424] rounded-xl px-3.5 py-3 md:py-3.5">
              <span className={`w-[9px] h-[9px] rounded-full shrink-0 ${i % 2 === 0 ? "bg-[#e91e8c]" : "bg-[#ff9800]"}`} />
              <span className="text-[13px] md:text-sm text-[#d8d8d8] font-medium">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Media card ── */}
      {/* <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">

        
        <div className="flex items-center gap-1 px-3 py-2.5 border-b border-[#2a2a2a]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[13px] md:text-sm font-bold border-0 cursor-pointer transition-colors duration-200
                  ${isActive ? "bg-[#e91e8c] text-white" : "bg-transparent text-[#888888] hover:text-[#cccccc]"}`}
              >
                <TabIcon tab={tab} isActive={isActive} />
                {tab}
              </button>
            );
          })}
        </div>


        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 p-3 md:p-4">
          {media.map((item, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-[#242424]">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover block"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50 flex items-center justify-center">
                  <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg width="13" height="13" fill="white" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-[12px] md:text-[13px] font-semibold text-white leading-[1.45]">{item.title}</p>
              <p className="text-[11px] md:text-xs text-[#777777]">{item.views} views · {item.time}</p>
            </div>
          ))}
        </div>
      </div> */}


      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">

        {/* Tab bar */}
        {/* <div className="flex items-center gap-1 px-3 py-2.5 border-b border-[#2a2a2a]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[13px] md:text-sm font-bold border-0 cursor-pointer transition-colors duration-200
            ${isActive ? "bg-[#e91e8c] text-white" : "bg-transparent text-[#888888] hover:text-[#cccccc]"}`}
              >
                <TabIcon tab={tab} isActive={isActive} />
                {tab}
              </button>
            );
          })}
        </div> */}
        <div className="overflow-x-auto overflow-y-hidden scrollbar-hide border-b border-[#2a2a2a]">
          <div className="flex items-center gap-1 px-3 py-2.5 min-w-max">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[13px] md:text-sm font-bold border-0 cursor-pointer transition-colors duration-200 whitespace-nowrap
            ${isActive ? "bg-[#e91e8c] text-white" : "bg-transparent text-[#888888] hover:text-[#cccccc]"}`}
                >
                  <TabIcon tab={tab} isActive={isActive} />
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "Videos" && media.length > 0 ? (
          /* Media thumbnail grid: 2-col mobile, 2-col tablet, 4-col desktop */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 p-3 md:p-4">
            {media.map((item, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-[#242424]">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover block"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50 flex items-center justify-center">
                    <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 backdrop-blur-sm">
                      <svg width="13" height="13" fill="white" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-[12px] md:text-[13px] font-semibold text-white leading-[1.45]">{item.title}</p>
                <p className="text-[11px] md:text-xs text-[#777777]">{item.views} views · {item.time}</p>
              </div>
            ))}
          </div>
        ) : (
          /* Coming Soon State */
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-10 h-10 lg:w-20 lg:h-20 mb-4 rounded-full bg-[#242424] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h3 className="text-white text-sm lg:text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-[#888888] text-sm max-w-sm">
              {activeTab === "Videos"
                ? "No videos available yet. Check back later for updates!"
                : `${activeTab} content is coming soon. Stay tuned!`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}