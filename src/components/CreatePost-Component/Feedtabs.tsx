"use client";

import { useState } from "react";
import { Users, Flame, Clock, Sparkles } from "lucide-react";

type Tab = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const TABS: Tab[] = [
  { id: "for-you", label: "For You", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "following", label: "Following", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "trending", label: "Trending", icon: <Flame className="w-3.5 h-3.5" /> },
  { id: "latest", label: "Latest", icon: <Clock className="w-3.5 h-3.5" /> },
];

interface FeedTabsProps {
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export default function FeedTabs({ defaultTab = "for-you", onChange }: FeedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className="w-full border-b border-white/8 mb-4">
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium
                whitespace-nowrap transition-colors duration-200 shrink-0
                ${isActive
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
                }
              `}
            >
              {/* Icon */}
              <span className={isActive ? "text-[#C9115F]" : "text-white/30"}>
                {tab.icon}
              </span>

              {/* Label */}
              {tab.label}

              {/* Active underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9115F] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}