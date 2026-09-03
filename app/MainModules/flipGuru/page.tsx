"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import Image from "next/image";

interface HubItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  iconBg: string;
  borderColor: string;
  glowColor: string;
  icon: React.ReactNode;
}

export default function FlipGuruPage() {
  const [liveMatchesCount, setLiveMatchesCount] = useState<number>(5);

  useEffect(() => {
    // Optionally fetch active matches count
    const fetchLiveCount = async () => {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        if (data.success && Array.isArray(data.matches)) {
          const live = data.matches.filter((m: any) => m.isLive).length;
          if (live > 0) setLiveMatchesCount(live);
        }
      } catch {
        // Fallback to default 5
      }
    };
    fetchLiveCount();
  }, []);

  const hubItems: HubItem[] = [
    {
      id: "player-profiles",
      title: "Player Profiles",
      subtitle: "Explore athlete stats & bios",
      href: "/MainModules/PlayersProfile",
      iconBg: "bg-[#241328]",
      borderColor: "border-purple-500/30",
      glowColor: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
      icon: (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-700 flex items-center justify-center text-white shadow-inner">
          <User size={18} className="text-purple-100 fill-purple-200/30" />
        </div>
      ),
    },
    {
      id: "match-center",
      title: "Match Center",
      subtitle: "Live scores & schedules",
      href: "/MainModules/NewMatchCenter",
      iconBg: "bg-[#101b2b]",
      borderColor: "border-blue-500/30",
      glowColor: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
      icon: (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 via-sky-500 to-blue-700 flex items-center justify-center text-white text-lg shadow-inner">
          ⚽
        </div>
      ),
    },
    {
      id: "record-explorer",
      title: "Record Explorer",
      subtitle: "All-time records & milestones",
      href: "/MainModules/RecordsExplorer",
      iconBg: "bg-[#261f12]",
      borderColor: "border-amber-500/30",
      glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
      icon: (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 flex items-center justify-center text-white text-lg shadow-inner">
          🏆
        </div>
      ),
    },
    {
      id: "flipflex-cards",
      title: "FlipFLEX Cards",
      subtitle: "AI-powered player cards",
      href: "/MainModules/FlipCards",
      iconBg: "bg-[#23152c]",
      borderColor: "border-pink-500/30",
      glowColor: "shadow-[0_0_20px_rgba(236,72,153,0.15)]",
      icon: (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-purple-700 flex items-center justify-center text-white text-lg shadow-inner">
          🧠
        </div>
      ),
    },
    {
      id: "flip-ai",
      title: "Flip AI",
      subtitle: "Ask & learn with AI",
      href: "/MainModules/AskAI",
      iconBg: "bg-[#0d231a]",
      borderColor: "border-emerald-500/30",
      glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
      icon: (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-700 flex items-center justify-center text-white text-lg shadow-inner">
          🐬
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-3.5 sm:px-6 pt-15 md:pt-4 pb-28 md:pb-12 flex flex-col justify-start">
      <div className="w-full max-w-xl mx-auto flex flex-col">
        {/* Section Header */}
        <h2 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-zinc-400/90 mb-3.5 pl-1">
          YOUR SPORTS KNOWLEDGE HUB
        </h2>

        {/* Hub Items List */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {hubItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group bg-[#111217] hover:bg-[#161822] border border-white/[0.07] hover:border-white/20 rounded-2xl p-3 sm:p-4 transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-[0.99] shadow-sm hover:shadow-xl"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Icon Squircle Box */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.iconBg} border ${item.borderColor} flex items-center justify-center shrink-0 ${item.glowColor} transition-transform duration-200 group-hover:scale-105`}
                >
                  {item.icon}
                </div>

                {/* Text Block */}
                <div className="min-w-0 flex flex-col justify-center">
                  <h3 className="text-[15px] sm:text-[16px] font-black text-white group-hover:text-pink-100 transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-gray-400 font-medium mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={18}
                className="text-gray-500 group-hover:text-gray-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
              />
            </Link>
          ))}
        </div>

        {/* Live Right Now Container */}
        <div className="mt-4 rounded-2xl border border-purple-900/40 bg-[#120f18] p-3.5 sm:p-4 shadow-lg">
          <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-3 pl-0.5">
            LIVE RIGHT NOW
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Live Matches */}
            <div className="bg-[#191622] border border-white/[0.04] rounded-xl py-3 px-1.5 sm:px-2 text-center flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-[#22c55e] leading-none">
                {liveMatchesCount}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 mt-1.5 whitespace-nowrap">
                Live Matches
              </span>
            </div>

            {/* Records Tracked */}
            <div className="bg-[#191622] border border-white/[0.04] rounded-xl py-3 px-1.5 sm:px-2 text-center flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-[#fbbf24] leading-none">
                240+
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 mt-1.5 whitespace-nowrap">
                Records Tracked
              </span>
            </div>

            {/* Player Profiles */}
            <div className="bg-[#191622] border border-white/[0.04] rounded-xl py-3 px-1.5 sm:px-2 text-center flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-[#ec4899] leading-none">
                1,800+
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 mt-1.5 whitespace-nowrap">
                Player Profiles
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
