

"use client";

import ChallengesSection from "@/src/components/FanBattle-Component/Challengessection";
import FanBattleCard from "@/src/components/FanBattle-Component/Fanbattlearena";
import FanBattleHeader from "@/src/components/FanBattle-Component/Fanbattleheader";
import PlayerPowerCarousel from "@/src/components/FanBattle-Component/PlayerPowerCarousel";
import RankingsModal from "@/src/components/FanBattle-Component/RankingsModal";
import React, { useState } from "react";

const tabs = [
  { id: "fan-battle", label: "Fan Battle", hasNew: true },
  { id: "predictions", label: "Predictions & Polls", hasNew: true },
  { id: "fantasy", label: "Fantasy Games", hasNew: false },
];

export default function FanBattlePage() {
  const [isRankingsOpen, setIsRankingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fan-battle");

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#121212] flex items-start justify-center">
      <div className="w-full max-w-6xl mx-auto pt-8 pb-15">
        {/* Component 1: Header + Hero + Live Banner */}
        {/* <FanBattleHeader /> */}

        {/* Tabs Section */}
        <div className="mt-6 px-4">
          {/* Tab Bar */}
          <div className="relative flex items-center gap-1 border-b border-white/10">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                    }`}
                >
                  {tab.label}

                  {/* NEW badge */}
                  {tab.hasNew && (
                    <span className="flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-sm bg-[#FF3B5C] text-white leading-none">
                      NEW
                    </span>
                  )}

                  {/* Active underline indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF3B5C] to-[#FF8C42] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "fan-battle" && (
            <>
              {/* Component 2: Player Power Points Carousel */}
              <PlayerPowerCarousel onShowAll={() => setIsRankingsOpen(true)} />
              <FanBattleCard />
              {/* Component 3: Challenges + Daily + Performance */}
            
            </>
          )}

          {activeTab === "predictions" && (
            <div className="flex flex-col items-center justify-center py-24 text-white/30">
                <ChallengesSection />
            </div>
          )}

          {activeTab === "fantasy" && (
            <div className="flex flex-col items-center justify-center py-24 text-white/30">
              <span className="text-5xl mb-4">🏆</span>
              <p className="text-lg font-semibold">Fantasy Games</p>
              <p className="text-sm mt-1">Coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Rankings Modal */}
      <RankingsModal
        isOpen={isRankingsOpen}
        onClose={() => setIsRankingsOpen(false)}
      />
    </div>
  );
}