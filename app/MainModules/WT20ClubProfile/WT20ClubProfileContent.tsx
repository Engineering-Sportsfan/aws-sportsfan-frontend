// MainModules/WT20ClubProfile/WT20ClubProfileContent.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { WT20Club } from "@/types/wt20Club";
import WT20ClubProfileHeader from "@/src/components/wt20wc-component/WT20ClubProfileHeader";
import WT20ClubProfileActions from "@/src/components/wt20wc-component/WT20ClubProfileActions";
import WT20ClubSeasonStats from "@/src/components/wt20wc-component/WT20ClubSeasonStats";
import WT20ClubGamePlan from "@/src/components/wt20wc-component/WT20ClubGamePlan";

const ACCENT = "#0d9488";

export default function WT20ClubProfileContent() {
  const searchParams = useSearchParams();
  const clubId = searchParams.get("id");
  const tab    = searchParams.get("tab");

  const [club, setClub]       = useState<WT20Club | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedIdRef         = useRef<string | null>(null);

  // ── Fetch club ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!clubId) { setLoading(false); return; }
    if (resolvedIdRef.current === clubId) return;
    resolvedIdRef.current = clubId;

    setLoading(true);
    axios
      .get<{ success: boolean; data: WT20Club }>(`/api/wt20-clubs/${encodeURIComponent(clubId)}`)
      .then((res) => { if (res.data.success) setClub(res.data.data); })
      .catch((err) => console.error("Failed to load WT20 club:", err))
      .finally(() => setLoading(false));
  }, [clubId]);

  // ── Scroll to tab ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !club || !tab) return;
    const id =
      tab === "stats"      ? "wt20club-stats-section"      :
      tab === "highlights" ? "wt20club-highlights-section" : null;
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
    return () => clearTimeout(t);
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
          <button onClick={() => (window.location.href = "/")}
            className="px-4 py-2 rounded text-white" style={{ background: ACCENT }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] font-sans">

      {/* Top nav */}
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
            WT20 Club Profile
          </span>
          <div className="h-[2px] w-10 rounded-full mt-0.5" style={{ background: ACCENT }} />
        </div>

        <div className="w-[22px]" />
      </div>

      <div className="w-full max-w-[1280px] mx-auto">

        {/* ── Mobile ── */}
        <div className="block lg:hidden">
          <div className="max-w-[640px] mx-auto">
            <WT20ClubProfileHeader  club={club} />
            <WT20ClubProfileActions club={club} />
            <WT20ClubSeasonStats    club={club} />
            <WT20ClubGamePlan       club={club} />
          </div>
        </div>

        {/* ── Desktop ── */}
        <div className="hidden lg:flex lg:items-start lg:gap-6 xl:gap-8 px-8 xl:px-12 py-6">
          {/* Left sticky */}
          <div className="sticky top-[65px] w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-65px)] [scrollbar-width:none]">
            <WT20ClubProfileHeader  club={club} />
            <WT20ClubProfileActions club={club} />
          </div>

          {/* Right scrollable */}
          <div className="flex-1 min-w-0 flex flex-col pb-10">
            <div id="wt20club-stats-section">
              <WT20ClubSeasonStats club={club} />
            </div>
            <div id="wt20club-highlights-section">
              <WT20ClubGamePlan    club={club} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}