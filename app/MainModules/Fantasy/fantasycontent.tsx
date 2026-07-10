"use client";

import ChallengesSection from "@/src/components/FanBattle-Component/Challengessection";
import FanBattleCard from "@/src/components/FanBattle-Component/Fanbattlearena";
import PlayerPowerCarousel from "@/src/components/FanBattle-Component/PlayerPowerCarousel";
import RankingsModal from "@/src/components/FanBattle-Component/RankingsModal";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import FantasyGamesHub from "../FantasyGames/page";
import { Sword, BarChart2, ArrowLeft, Gamepad2 } from "lucide-react";
import Link from "next/link";

const tabs = [
  { id: "fan-battle", label: "Fan Battle", icon: Sword, hasNew: true },
  { id: "predictions", label: "Prediction & Polls", icon: BarChart2, hasNew: true },
  { id: "fantasy", label: "Fantasy Games", icon: Gamepad2, hasNew: false },
];


export default function FanBattlePage() {
  const searchParams = useSearchParams();
  const [isRankingsOpen, setIsRankingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fan-battle");
  const powerCarouselRefetch = useRef<(() => void) | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#121212] flex items-start justify-center">
      <div className="w-full max-w-8xl mx-auto pt-8 pb-15">
        <Link
          href="/MainModules/HomePage"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition px-4"
        >
          <button className="flex items-center gap-2 text-gray-400 hover:text-white transition cursor-pointer">
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
        </Link>

        {/* Tabs Section */}
        <div className="mt-4 px-4">
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-3 pr-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <div key={tab.id} className="relative shrink-0 overflow-visible">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 rounded-full
                      text-sm font-bold tracking-wide transition-all duration-200
                      whitespace-nowrap
                      ${isActive
                        ? "text-white shadow-lg shadow-red-900/40"
                        : "bg-[#252525] text-white/50 hover:text-white/80 hover:bg-[#2e2e2e]"
                      }
                    `}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg, #e8404a 0%, #b5202a 60%, #7a1020 100%)",
                          }
                        : {}
                    }
                  >
                    <Icon
                      size={15}
                      className={isActive ? "text-white" : "text-white/40"}
                    />
                    <span>{tab.label}</span>
                  </button>

                  {/* Floating NEW badge */}
                  {tab.hasNew && (
                    <span
                      className="absolute -top-2.5 -right-2.5 z-10
                        w-7 h-7 flex items-center justify-center
                        rounded-full bg-[#FF3B5C] text-white
                        text-[8px] font-black tracking-wider uppercase
                        shadow-md shadow-pink-900/50 pointer-events-none"
                    >
                      NEW
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "fan-battle" && (
            <>
              <PlayerPowerCarousel onShowAll={() => setIsRankingsOpen(true)} 
                  fetchRef={powerCarouselRefetch} />
              <FanBattleCard onBattleComplete={() => powerCarouselRefetch.current?.()} />
            </>
          )}

          {activeTab === "predictions" && (
            <div className="flex flex-col items-center justify-center text-white/30">
              <ChallengesSection />
            </div>
          )}

          {activeTab === "fantasy" && (
            <div className="w-full">
              <FantasyGamesHub />
            </div>
          )}
        </div>
      </div>

      <RankingsModal
        isOpen={isRankingsOpen}
        onClose={() => setIsRankingsOpen(false)}
      />
    </div>
  );
}