// MainModules/FifaClubProfile/FifaClubProfileContent.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { FifaClub } from "@/types/fifaClub";
import FifaClubProfileHeader from "@/src/components/fifaclub-component/FifaClubProfileHeader";
import FifaClubProfileActions from "@/src/components/fifaclub-component/FifaClubProfileActions/page";
import FifaClubSeasonStats from "@/src/components/fifaclub-component/FifaClubSeasonStats";
import FifaClubGamePlan from "@/src/components/fifaclub-component/FifaClubGamePlan/page";


const ACCENT = "#16a34a";

export default function FifaClubProfileContent() {
  const searchParams = useSearchParams();
  const clubId    = searchParams.get("id");
  const tab       = searchParams.get("tab");
  const tournament = searchParams.get("tournament");

  const [club, setClub]       = useState<FifaClub | null>(null);
  const [loading, setLoading] = useState(true);

  const resolvedIdRef = useRef<string | null>(null);

  // ── Fetch club by ID ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!clubId) { setLoading(false); return; }
    if (resolvedIdRef.current === clubId) return;
    resolvedIdRef.current = clubId;

    setLoading(true);
    axios
      .get<{ success: boolean; data: FifaClub }>(`/api/fifa-clubs/${encodeURIComponent(clubId)}`)
      .then((res) => {
        if (res.data.success) setClub(res.data.data);
      })
      .catch((err) => {
        console.error("Failed to load club:", err);
      })
      .finally(() => setLoading(false));
  }, [clubId]);

  // ── Scroll to tab ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !club) return;
    if (!tab) return;
    const id =
      tab === "stats"      ? "fifaclub-stats-section"      :
      tab === "highlights" ? "fifaclub-highlights-section" : null;
    if (!id) return;
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [tab, loading, club]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!club && (loading || clubId)) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: ACCENT }} />
        <p className="text-white text-sm">Loading club data…</p>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (!club) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">No club data found</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 rounded text-white bg-[#16a34a]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] font-sans">

      {/* Top nav bar */}
      <div className="sticky top-0 z-50 flex items-center px-4 md:px-8 lg:px-12 py-3.5 bg-[#111111]/90 backdrop-blur-md border-b border-[#1f1f1f]">
        <button
          className="bg-transparent border-0 p-0 cursor-pointer text-[#e0e0e0] flex items-center hover:text-white transition-colors"
          onClick={() => window.history.back()}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M19 12H5" /><path d="M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="flex-1 flex flex-col items-center">
          <span className="text-[17px] md:text-xl font-bold text-white tracking-tight">
            FIFA Club Profile
          </span>
          <div className="h-[2px] w-10 rounded-full mt-0.5" style={{ background: ACCENT }} />
        </div>

        <div className="w-[22px]" />
      </div>

      <div className="w-full max-w-[1280px] mx-auto">

        {/* ── Mobile ── */}
        <div className="block lg:hidden">
          <div className="max-w-[640px] mx-auto">
            <FifaClubProfileHeader  club={club} />
            <FifaClubProfileActions club={club} />
            <FifaClubSeasonStats    club={club} />
            <FifaClubGamePlan       club={club} />
          </div>
        </div>

        {/* ── Desktop ── */}
        <div className="hidden lg:flex lg:items-start lg:gap-6 xl:gap-8 px-8 xl:px-12 py-6">

          {/* Left sticky panel */}
          <div className="sticky top-[65px] w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-65px)] [scrollbar-width:none]">
            <FifaClubProfileHeader  club={club} />
            <FifaClubProfileActions club={club} />
          </div>

          {/* Right scrollable panel */}
          <div className="flex-1 min-w-0 flex flex-col pb-10">
            <div id="fifaclub-stats-section">
              <FifaClubSeasonStats club={club} />
            </div>
            <div id="fifaclub-highlights-section">
              <FifaClubGamePlan    club={club} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}