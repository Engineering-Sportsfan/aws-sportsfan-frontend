"use client";
import { useState } from "react";

type TabIconProps = {
  tab: string;
  isActive: boolean;
};

const TABS = ["Drops", "Posts", "Live", "Videos"];

function TabIcon({ tab, isActive }: TabIconProps) {
  const icons = {
    Videos: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    Photos: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <circle cx="8.5" cy="8.5" r="2.5" />
        <path d="M21 15l-5-5-6 6-3-3-5 5" />
      </svg>
    ),
    News: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16v16H4z" />
        <path d="M8 8h8M8 12h6M8 16h4" />
      </svg>
    ),
    Stats: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3" />
        <path d="M12 2v8M8 6l4-4 4 4" />
      </svg>
    ),
  };

  return (
    <span className={isActive ? "text-white" : "text-[#888888]"}>
      {icons[tab as keyof typeof icons]}
    </span>
  );
}

export default function MediaTabsComponent() {
  const [activeTab, setActiveTab] = useState<string>("Videos");

  return (
    <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden ">
      {/* Tab Bar - Scrollable on mobile */}
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide border-b border-[#2a2a2a]">
        <div className="flex items-center gap-1 px-3 py-2.5 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 h-[34px] md:h-[38px] px-2 md:px-4 rounded-full text-[13px] md:text-sm font-bold border-0 cursor-pointer transition-colors duration-200 whitespace-nowrap
                  ${isActive ? "bg-[#e91e8c] text-white" : "bg-transparent text-[#888888] hover:text-[#cccccc]"}`}
              >
                <TabIcon tab={tab} isActive={isActive} />
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coming Soon State for all tabs */}
      <div className="flex flex-col items-center justify-center py-8 lg:py-8 px-4 text-center">
        <div className="w-10 h-10 lg:w-20 lg:h-20 mb-4 rounded-full bg-[#242424] flex items-center justify-center">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#888888" 
            strokeWidth="1.5"
            className="lg:w-8 lg:h-8"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <h3 className="text-white text-sm lg:text-lg font-semibold mb-2">Coming Soon</h3>
        <p className="text-[#888888] text-xs lg:text-sm max-w-sm">
          {activeTab} content is coming soon. Stay tuned!
        </p>
      </div>
    </div>
  );
}