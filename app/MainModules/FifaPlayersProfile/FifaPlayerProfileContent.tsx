// // MainModules/FifaPlayersProfile/FifaPlayerProfileContent.tsx
// "use client";

// import { useEffect, useRef } from "react";
// import { useSearchParams } from "next/navigation";
// import { useFifaPlayerProfile } from "@/context/FifaPlayerProfileContext";
// import FifaPlayerProfileHeader  from "@/src/components/FifaPlayers-Component/FifaPlayerProfileHeader";
// import FifaPlayerProfileActions from "@/src/components/FifaPlayers-Component/FifaPlayerProfileActions";
// import FifaPlayerSeasonStats    from "@/src/components/FifaPlayers-Component/FifaPlayerSeasonStats";
// import FifaPlayerGamePlan       from "@/src/components/FifaPlayers-Component/FifaPlayerGamePlan";

// const ACCENT = "#16a34a";

// export default function FifaPlayerProfileContent() {
//     const searchParams = useSearchParams();
//     const playerId   = searchParams.get("id");
//     const tab        = searchParams.get("tab");
//     const tournament = searchParams.get("tournament"); // optional hint

//     const {
//         player,
//         listData,
//         loading,
//         selectPlayer,
//         fetchFifaPlayerList,
//         fetchFifaPlayerById,
//     } = useFifaPlayerProfile();

//     const resolvedIdRef = useRef<string | null>(null);

//     // ── Step 1: Load list on mount ────────────────────────────────────────────
//     useEffect(() => {
//         if (!listData) fetchFifaPlayerList();
//     }, []); // eslint-disable-line react-hooks/exhaustive-deps

//     // ── Step 2: Resolve player ────────────────────────────────────────────────
//     useEffect(() => {
//         if (!playerId) return;
//         if (!listData) return;
//         if (resolvedIdRef.current === playerId) return;
//         resolvedIdRef.current = playerId;

//         const inList = listData.players.find((p) => p.player_id === playerId);
//         if (inList) {
//             selectPlayer(playerId);
//         } else {
//             fetchFifaPlayerById(playerId, tournament ?? undefined);
//         }
//     }, [playerId, listData]); // eslint-disable-line react-hooks/exhaustive-deps

//     // ── Step 3: Scroll to tab ─────────────────────────────────────────────────
//     useEffect(() => {
//         if (loading || !player) return;
//         if (!tab) return;
//         const id =
//             tab === "stats"      ? "fifa-stats-section"      :
//             tab === "highlights" ? "fifa-highlights-section" : null;
//         if (!id) return;
//         const timer = setTimeout(() => {
//             document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
//         }, 100);
//         return () => clearTimeout(timer);
//     }, [tab, loading, player]);

//     // ── Loading ───────────────────────────────────────────────────────────────
//     if (!player && (loading || playerId)) {
//         return (
//             <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center gap-3">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: ACCENT }} />
//                 <p className="text-white text-sm">Loading player data…</p>
//             </div>
//         );
//     }

//     // ── Not found ─────────────────────────────────────────────────────────────
//     if (!player) {
//         return (
//             <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">
//                 <div className="text-center">
//                     <p className="text-red-400 mb-4">No player data found</p>
//                     <button
//                         onClick={() => (window.location.href = "/")}
//                         className="px-4 py-2 rounded text-white bg-[#16a34a]"
//                     >
//                         Go Home
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     // ── Render ────────────────────────────────────────────────────────────────
//     return (
//         <div className="min-h-screen bg-[#111111] font-sans">

//             {/* Top nav bar */}
//             <div className="sticky top-0 z-50 flex items-center px-4 md:px-8 lg:px-12 py-3.5 bg-[#111111]/90 backdrop-blur-md border-b border-[#1f1f1f]">
//                 <button
//                     className="bg-transparent border-0 p-0 cursor-pointer text-[#e0e0e0] flex items-center hover:text-white transition-colors"
//                     onClick={() => window.history.back()}
//                 >
//                     <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
//                         <path d="M19 12H5" /><path d="M12 5l-7 7 7 7" />
//                     </svg>
//                 </button>

//                 <div className="flex-1 flex flex-col items-center">
//                     <span className="text-[17px] md:text-xl font-bold text-white tracking-tight">
//                         FIFA Player Profile
//                     </span>
//                     <div className="h-[2px] w-10 rounded-full mt-0.5" style={{ background: ACCENT }} />
//                 </div>

//                 <div className="w-[22px]" />
//             </div>

//             <div className="w-full max-w-[1280px] mx-auto">

//                 {/* ── Mobile ── */}
//                 <div className="block lg:hidden">
//                     <div className="max-w-[640px] mx-auto">
//                         <FifaPlayerProfileHeader  player={player} />
//                         <FifaPlayerProfileActions player={player} />
//                         <FifaPlayerSeasonStats    player={player} />
//                         <FifaPlayerGamePlan       player={player} />
//                     </div>
//                 </div>

//                 {/* ── Desktop ── */}
//                 <div className="hidden lg:flex lg:items-start lg:gap-6 xl:gap-8 px-8 xl:px-12 py-6">

//                     {/* Left sticky panel */}
//                     <div className="sticky top-[65px] w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-65px)] [scrollbar-width:none]">
//                         <FifaPlayerProfileHeader  player={player} />
//                         <FifaPlayerProfileActions player={player} />
//                     </div>

//                     {/* Right scrollable panel */}
//                     <div className="flex-1 min-w-0 flex flex-col pb-10">
//                         <div id="fifa-stats-section">
//                             <FifaPlayerSeasonStats player={player} />
//                         </div>
//                         <div id="fifa-highlights-section">
//                             <FifaPlayerGamePlan    player={player} />
//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// }








// MainModules/FifaPlayersProfile/FifaPlayerProfileContent.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useFifaPlayerProfile } from "@/context/FifaPlayerProfileContext";
import FifaPlayerProfileHeader  from "@/src/components/FifaPlayers-Component/FifaPlayerProfileHeader";
import FifaPlayerProfileActions from "@/src/components/FifaPlayers-Component/FifaPlayerProfileActions";
import FifaPlayerSeasonStats    from "@/src/components/FifaPlayers-Component/FifaPlayerSeasonStats";
import FifaPlayerGamePlan       from "@/src/components/FifaPlayers-Component/FifaPlayerGamePlan";

const ACCENT = "#16a34a";

export default function FifaPlayerProfileContent() {
    const searchParams = useSearchParams();
    const playerId   = searchParams.get("id");
    const tab        = searchParams.get("tab");
    const tournament = searchParams.get("tournament");

    const {
        player,
        listData,
        loading,
        selectPlayer,
        fetchFifaPlayerList,
        fetchFifaPlayerById,
    } = useFifaPlayerProfile();

    // Track which playerId we've already resolved so we don't re-fetch
    const resolvedIdRef = useRef<string | null>(null);

    // ── Step 1: Kick off list load (needed for home-card fast path) ───────────
    useEffect(() => {
        if (!listData) fetchFifaPlayerList();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Step 2: Resolve player ────────────────────────────────────────────────
    // Two independent triggers:
    //   A) playerId arrives but no listData yet → fire direct fetch immediately
    //   B) listData arrives → check if player is in list; if yes selectPlayer,
    //      if no AND we haven't fetched directly yet → fire direct fetch
    //
    // This means global-search players (not in the 20) are fetched directly
    // without waiting for the list, and home-card players use the fast path.
    useEffect(() => {
        if (!playerId) return;
        if (resolvedIdRef.current === playerId) return;

        if (!listData) {
            // List not loaded yet — go straight to direct fetch so the
            // profile page doesn't sit on a spinner waiting for the list.
            resolvedIdRef.current = playerId;
            fetchFifaPlayerById(playerId, tournament ?? undefined);
            return;
        }

        resolvedIdRef.current = playerId;

        const inList = listData.players.find((p) => p.player_id === playerId);
        if (inList) {
            // Fast path: already in cache
            selectPlayer(playerId);
        } else {
            // Slow path: not one of the 20 home-card players — fetch directly
            fetchFifaPlayerById(playerId, tournament ?? undefined);
        }
    }, [playerId, listData]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Step 3: Scroll to tab ─────────────────────────────────────────────────
    useEffect(() => {
        if (loading || !player) return;
        if (!tab) return;
        const id =
            tab === "stats"      ? "fifa-stats-section"      :
            tab === "highlights" ? "fifa-highlights-section" : null;
        if (!id) return;
        const timer = setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return () => clearTimeout(timer);
    }, [tab, loading, player]);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (!player && (loading || playerId)) {
        return (
            <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: ACCENT }} />
                <p className="text-white text-sm">Loading player data…</p>
            </div>
        );
    }

    // ── Not found ─────────────────────────────────────────────────────────────
    if (!player) {
        return (
            <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-4">No player data found</p>
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

    // ── Render ────────────────────────────────────────────────────────────────
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
                        FIFA Player Profile
                    </span>
                    <div className="h-[2px] w-10 rounded-full mt-0.5" style={{ background: ACCENT }} />
                </div>

                <div className="w-[22px]" />
            </div>

            <div className="w-full max-w-[1280px] mx-auto">

                {/* ── Mobile ── */}
                <div className="block lg:hidden">
                    <div className="max-w-[640px] mx-auto">
                        <FifaPlayerProfileHeader  player={player} />
                        <FifaPlayerProfileActions player={player} />
                        <FifaPlayerSeasonStats    player={player} />
                        <FifaPlayerGamePlan       player={player} />
                    </div>
                </div>

                {/* ── Desktop ── */}
                <div className="hidden lg:flex lg:items-start lg:gap-6 xl:gap-8 px-8 xl:px-12 py-6">

                    {/* Left sticky panel */}
                    <div className="sticky top-[65px] w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-65px)] [scrollbar-width:none]">
                        <FifaPlayerProfileHeader  player={player} />
                        <FifaPlayerProfileActions player={player} />
                    </div>

                    {/* Right scrollable panel */}
                    <div className="flex-1 min-w-0 flex flex-col pb-10">
                        <div id="fifa-stats-section">
                            <FifaPlayerSeasonStats player={player} />
                        </div>
                        <div id="fifa-highlights-section">
                            <FifaPlayerGamePlan    player={player} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}