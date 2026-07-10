// MainModules/PlayersProfile/PlayerProfileContent.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import PlayerGamePlan from "@/src/components/PlayerProfile-Component/PlayerGamePlan/index";
import PlayerProfileActions from "@/src/components/PlayerProfile-Component/PlayerProfileActions/index";
import PlayerProfileHeader from "@/src/components/PlayerProfile-Component/PlayerProfileHeader/index";
import PlayerSeasonStats from "@/src/components/PlayerProfile-Component/PlayerSeasonStats/index";

import { Player } from "@/types/player";
import { usePlayerProfile360 } from "@/context/PlayerProfile360Context";

export default function PlayerProfileContent() {
  const searchParams = useSearchParams();
  const playerId = searchParams.get("id");
  const tab = searchParams.get("tab");

  const { data: Player360Data, loading, fetchPlayer360 } = usePlayerProfile360();

  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!playerId) return;
    if (fetchedIdRef.current === playerId) return;
    fetchedIdRef.current = playerId;
    fetchPlayer360(playerId);
  }, [playerId]);

  useEffect(() => {
    if (loading || !Player360Data) return;
    if (!tab) return;

    const id = tab === "highlights" ? "highlights-section" : tab === "stats" ? "stats-section" : null;
    if (!id) return;

    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => clearTimeout(timer);
  }, [tab, loading, Player360Data]);

  if (loading || (playerId && !Player360Data)) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        <p className="text-white">Loading player data...</p>
      </div>
    );
  }

  if (!Player360Data) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">No player data found</p>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const player: Player = {
    name: Player360Data.profile?.name || "",
    team: Player360Data.profile?.team || "",
    battingStyle: Player360Data.profile?.battingStyle || "",
    bowlingStyle: Player360Data.profile?.bowlingStyle || "",
    avatar: Player360Data.home?.[0]?.image || Player360Data.profile?.avatar || "",
    about: Player360Data.profile?.about || "",
    stats: {
      runs: Player360Data.profile?.stats?.runs || "0",
      sr: Player360Data.profile?.stats?.sr || "0",
      avg: Player360Data.profile?.stats?.avg || "0",
    },
    overview: {
      debut: Player360Data.profile?.overview?.iplDebut || "",
      specialization: Player360Data.profile?.overview?.specialization || "",
      dob: Player360Data.profile?.overview?.dob || "",
      matches: Player360Data.profile?.overview?.matches || "",
    },
    season: {
      year: Player360Data.season?.season?.year || "",
      runs: Player360Data.season?.season?.runs || "0",
      strikeRate: Player360Data.season?.season?.strikeRate || "0",
      average: Player360Data.season?.season?.average || "0",
      fiftiesAndHundreds: Player360Data.season?.season?.fiftiesAndHundreds || "0/0",
      highestScore: Player360Data.season?.season?.highestScore || "0",
      fours: Player360Data.season?.season?.fours || 0,
      sixes: Player360Data.season?.season?.sixes || 0,
      award: Player360Data.season?.season?.award || "",
      awardSub: Player360Data.season?.season?.awardSub || "",
      wickets: Player360Data.season?.season?.wickets || 0,
      bowlingAvg: Player360Data.season?.season?.bowlingAvg || "0",
      economy: Player360Data.season?.season?.economy || "0",
      bowlingSR: Player360Data.season?.season?.bowlingSR || "0",
      bestBowling: Player360Data.season?.season?.bestBowling || "0",
      threeW_fiveW_Hauls: Player360Data.season?.season?.threeW_fiveW_Hauls || 0,
      foursConceded: Player360Data.season?.season?.foursConceded || 0,
      sixesConceded: Player360Data.season?.season?.sixesConceded || 0,
    },
    insights: Player360Data.insights?.insights || [],
    strengths: Player360Data.insights?.strengths || [],
    media: Player360Data.media?.mediaItems || [],
  };

  const displayPlayer: Player = player;

  return (
    <div className="min-h-screen bg-[#111111] font-sans">
      <div className="sticky top-0 z-50 flex items-center px-4 md:px-8 lg:px-12 py-3.5 bg-[#111111]/90 backdrop-blur-md border-b border-[#1f1f1f]">
        <button
          className="bg-transparent border-0 p-0 cursor-pointer text-[#e0e0e0] flex items-center hover:text-white transition-colors"
          onClick={() => window.history.back()}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M19 12H5" />
            <path d="M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="flex-1 text-center text-[17px] md:text-xl font-bold text-white tracking-tight">
          Player Profile
        </span>
        <div className="w-[22px]" />
      </div>

      <div className="w-full max-w-[1280px] mx-auto">
        <div className="block lg:hidden">
          <div className="max-w-[640px] mx-auto">
            <PlayerProfileHeader player={displayPlayer} />
            <PlayerProfileActions player={displayPlayer} playerId={playerId || undefined} />
            <PlayerSeasonStats player={displayPlayer} />
            <PlayerGamePlan player={displayPlayer} />
          </div>
        </div>

        <div className="hidden lg:flex lg:items-start lg:gap-6 xl:gap-8 px-8 xl:px-12 py-6">
          <div className="sticky top-[65px] w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-65px)] [scrollbar-width:none]">
            <PlayerProfileHeader player={displayPlayer} />
            <PlayerProfileActions player={displayPlayer} playerId={playerId || undefined} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col pb-10">
            <div id="stats-section">
              <PlayerSeasonStats player={displayPlayer} />
            </div>
            <div id="highlights-section">
              <PlayerGamePlan player={displayPlayer} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}