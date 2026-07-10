





// // MainModules/WPLPlayersProfile/WPLPlayerProfileContent.tsx
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { useWPLPlayerProfile } from "@/context/Wplplayerprofilecontext";
// import WPLPlayerProfileHeader from "@/src/components/WplPlayers-Component/WPLPlayerProfileHeader";
// import WPLPlayerProfileActions from "@/src/components/WplPlayers-Component/WPLPlayerProfileActions";
// import WPLPlayerSeasonStats from "@/src/components/WplPlayers-Component/WPLPlayerSeasonStats";
// import WPLPlayerGamePlan from "@/src/components/WplPlayers-Component/WPLPlayerGamePlan";
// import { WPLPlayer } from "@/types/wplPlayer";

// // ── Helpers ───────────────────────────────────────────────────────────────────

// function getTournamentLabel(tournament: string | null): string {
//     if (tournament === "womens_t20i") return "WT20I Player Profile";
//     return "WPL Player Profile";
// }

// function getTournamentAccent(tournament: string | null): string {
//     if (tournament === "womens_t20i") return "#0e7490";
//     return "#7c3aed";
// }

// // ── Tournament Toggle ─────────────────────────────────────────────────────────

// interface ToggleProps {
//     active: string;
//     available: string[];
//     onChange: (t: string) => void;
// }

// const TOGGLE_LABELS: Record<string, string> = {
//     womens_ipl: "WPL",
//     womens_t20i: "WT20I",
// };

// const TOGGLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
//     womens_ipl: {
//         bg: "#7c3aed",
//         border: "#7c3aed",
//         text: "#a78bfa",
//     },
//     womens_t20i: {
//         bg: "#0e7490",
//         border: "#0e7490",
//         text: "#67e8f9",
//     },
// };

// function TournamentToggle({ active, available, onChange }: ToggleProps) {
//     if (available.length < 2) return null;

//     return (
//         <div className="flex items-center justify-center gap-2 pt-2 pb-1">
//             {available.map((t) => {
//                 const isActive = t === active;
//                 const cfg = TOGGLE_COLORS[t] ?? { bg: "#555", border: "#555", text: "#aaa" };
//                 const label = TOGGLE_LABELS[t] ?? t;

//                 return (
//                     <button
//                         key={t}
//                         onClick={() => onChange(t)}
//                         style={
//                             isActive
//                                 ? { background: cfg.bg, borderColor: cfg.bg }
//                                 : { background: "transparent", borderColor: cfg.border, color: cfg.text }
//                         }
//                         className={`h-8 px-5 rounded-full text-sm font-bold border transition-all duration-200 cursor-pointer ${
//                             isActive ? "text-white" : "hover:opacity-80"
//                         }`}
//                     >
//                         {label}
//                     </button>
//                 );
//             })}
//         </div>
//     );
// }

// // ── Main component ────────────────────────────────────────────────────────────

// export default function WPLPlayerProfileContent() {
//     const searchParams = useSearchParams();
//     const playerId = searchParams.get("id");
//     const tab = searchParams.get("tab");
//     const urlTournament = searchParams.get("tournament"); // initial hint from URL

//     const {
//         player,
//         playerPair,
//         listData,
//         loading,
//         selectPlayer,
//         fetchWPLPlayerList,
//         fetchWPLPlayerById,
//     } = useWPLPlayerProfile();

//     // Which tournament is currently displayed — driven by toggle
//     const [activeTournament, setActiveTournament] = useState<string>(
//         urlTournament ?? "womens_ipl"
//     );

//     const resolvedIdRef = useRef<string | null>(null);

//     // ── Step 1: Load list on mount ────────────────────────────────────────────
//     useEffect(() => {
//         if (!listData) {
//             fetchWPLPlayerList();
//         }
//     }, []); // eslint-disable-line react-hooks/exhaustive-deps

//     // ── Step 2: Resolve the player ────────────────────────────────────────────
//     useEffect(() => {
//         if (!playerId) return;
//         if (!listData) return;

//         if (resolvedIdRef.current === playerId) return;
//         resolvedIdRef.current = playerId;

//         const inList = listData.players.find((p) => p.player_id === playerId);
//         if (inList) {
//             selectPlayer(playerId);
//         } else {
//             // fetchWPLPlayerById now always fetches both tournaments
//             fetchWPLPlayerById(playerId, urlTournament ?? undefined);
//         }
//     }, [playerId, listData]); // eslint-disable-line react-hooks/exhaustive-deps

//     // ── Step 3: Scroll to tab ─────────────────────────────────────────────────
//     useEffect(() => {
//         if (loading || !player) return;
//         if (!tab) return;

//         const id =
//             tab === "highlights" ? "wpl-highlights-section" :
//             tab === "stats" ? "wpl-stats-section" : null;
//         if (!id) return;

//         const timer = setTimeout(() => {
//             document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
//         }, 100);

//         return () => clearTimeout(timer);
//     }, [tab, loading, player]);

//     // ── Derive available tournaments from the pair ────────────────────────────
//     const availableTournaments: string[] = [];
//     if (playerPair?.womens_ipl) availableTournaments.push("womens_ipl");
//     if (playerPair?.womens_t20i) availableTournaments.push("womens_t20i");

//     // The player data for the active tournament
//     const activePlayer: WPLPlayer | null =
//         playerPair
//             ? (playerPair[activeTournament as keyof typeof playerPair] ?? player)
//             : player;

//     // Keep activeTournament valid if pair changes
//     useEffect(() => {
//         if (availableTournaments.length > 0 && !availableTournaments.includes(activeTournament)) {
//             setActiveTournament(availableTournaments[0]);
//         }
//     }, [availableTournaments.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

//     // ── Loading ───────────────────────────────────────────────────────────────
//     if (loading || (playerId && !activePlayer)) {
//         const accent = getTournamentAccent(activeTournament);
//         return (
//             <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center gap-3">
//                 <div
//                     className="animate-spin rounded-full h-12 w-12 border-b-2"
//                     style={{ borderColor: accent }}
//                 />
//                 <p className="text-white text-sm">Loading player data…</p>
//             </div>
//         );
//     }

//     // ── Not found ─────────────────────────────────────────────────────────────
//     if (!activePlayer) {
//         return (
//             <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">
//                 <div className="text-center">
//                     <p className="text-red-400 mb-4">No player data found</p>
//                     <button
//                         onClick={() => (window.location.href = "/")}
//                         className="px-4 py-2 rounded text-white"
//                         style={{ background: getTournamentAccent(activeTournament) }}
//                     >
//                         Go Home
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const navLabel = getTournamentLabel(activeTournament);
//     const accent = getTournamentAccent(activeTournament);

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
//                         <path d="M19 12H5" />
//                         <path d="M12 5l-7 7 7 7" />
//                     </svg>
//                 </button>

//                 <div className="flex-1 flex flex-col items-center">
//                     <span className="text-[17px] md:text-xl font-bold text-white tracking-tight">
//                         {navLabel}
//                     </span>
//                     <div
//                         className="h-[2px] w-10 rounded-full mt-0.5 transition-all duration-300"
//                         style={{ background: accent }}
//                     />
//                 </div>

//                 <div className="w-[22px]" />
//             </div>

//             <div className="w-full max-w-[1280px] mx-auto">

//                 {/* ── Mobile layout ── */}
//                 <div className="block lg:hidden">
//                     <div className="max-w-[640px] mx-auto">
//                         <WPLPlayerProfileHeader
//                             player={activePlayer}
//                             tournament={activeTournament}
//                             availableTournaments={availableTournaments}
//                             onTournamentChange={setActiveTournament}
//                         />
//                         <WPLPlayerProfileActions player={activePlayer} tournament={activeTournament} />
//                         <WPLPlayerSeasonStats player={activePlayer} tournament={activeTournament} />
//                         <WPLPlayerGamePlan player={activePlayer} tournament={activeTournament} />
//                     </div>
//                 </div>

//                 {/* ── Desktop layout ── */}
//                 <div className="hidden lg:flex lg:items-start lg:gap-6 xl:gap-8 px-8 xl:px-12 py-6">

//                     {/* Left sticky panel */}
//                     <div className="sticky top-[65px] w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-65px)] [scrollbar-width:none]">
//                         <WPLPlayerProfileHeader
//                             player={activePlayer}
//                             tournament={activeTournament}
//                             availableTournaments={availableTournaments}
//                             onTournamentChange={setActiveTournament}
//                         />
//                         <WPLPlayerProfileActions player={activePlayer} tournament={activeTournament} />
//                     </div>

//                     {/* Right scrollable panel */}
//                     <div className="flex-1 min-w-0 flex flex-col pb-10">
//                         <div id="wpl-stats-section">
//                             <WPLPlayerSeasonStats player={activePlayer} tournament={activeTournament} />
//                         </div>
//                         <div id="wpl-highlights-section">
//                             <WPLPlayerGamePlan player={activePlayer} tournament={activeTournament} />
//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// }







// MainModules/WPLPlayersProfile/WPLPlayerProfileContent.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWPLPlayerProfile } from "@/context/Wplplayerprofilecontext";
import WPLPlayerProfileHeader from "@/src/components/WplPlayers-Component/WPLPlayerProfileHeader";
import WPLPlayerProfileActions from "@/src/components/WplPlayers-Component/WPLPlayerProfileActions";
import WPLPlayerSeasonStats from "@/src/components/WplPlayers-Component/WPLPlayerSeasonStats";
import WPLPlayerGamePlan from "@/src/components/WplPlayers-Component/WPLPlayerGamePlan";
import { WPLPlayer } from "@/types/wplPlayer";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTournamentLabel(tournament: string | null): string {
    if (tournament === "womens_t20i") return "WT20I Player Profile";
    return "WPL Player Profile";
}

function getTournamentAccent(tournament: string | null): string {
    if (tournament === "womens_t20i") return "#0e7490";
    return "#7c3aed";
}

// ── Tournament Toggle ─────────────────────────────────────────────────────────

interface ToggleProps {
    active: string;
    available: string[];
    onChange: (t: string) => void;
}

const TOGGLE_LABELS: Record<string, string> = {
    womens_ipl: "WPL",
    womens_t20i: "WT20I",
};

const TOGGLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    womens_ipl: { bg: "#7c3aed", border: "#7c3aed", text: "#a78bfa" },
    womens_t20i: { bg: "#0e7490", border: "#0e7490", text: "#67e8f9" },
};

function TournamentToggle({ active, available, onChange }: ToggleProps) {
    if (available.length < 2) return null;

    return (
        <div className="flex items-center justify-center gap-2 pt-2 pb-1">
            {available.map((t) => {
                const isActive = t === active;
                const cfg = TOGGLE_COLORS[t] ?? { bg: "#555", border: "#555", text: "#aaa" };
                const label = TOGGLE_LABELS[t] ?? t;

                return (
                    <button
                        key={t}
                        onClick={() => onChange(t)}
                        style={
                            isActive
                                ? { background: cfg.bg, borderColor: cfg.bg }
                                : { background: "transparent", borderColor: cfg.border, color: cfg.text }
                        }
                        className={`h-8 px-5 rounded-full text-sm font-bold border transition-all duration-200 cursor-pointer ${
                            isActive ? "text-white" : "hover:opacity-80"
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WPLPlayerProfileContent() {
    const searchParams = useSearchParams();
    const playerId = searchParams.get("id");
    const tab = searchParams.get("tab");
    const urlTournament = searchParams.get("tournament");

    const {
        player,
        playerPair,
        listData,
        loading,
        selectPlayer,
        fetchWPLPlayerList,
        fetchWPLPlayerById,
    } = useWPLPlayerProfile();

    const [activeTournament, setActiveTournament] = useState<string>(
        urlTournament ?? "womens_ipl"
    );

    const resolvedIdRef = useRef<string | null>(null);

    // ── Step 1: Load list on mount ────────────────────────────────────────────
    useEffect(() => {
        if (!listData) {
            fetchWPLPlayerList();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Step 2: Resolve the player ────────────────────────────────────────────
    useEffect(() => {
        if (!playerId) return;
        if (!listData) return;
        if (resolvedIdRef.current === playerId) return;
        resolvedIdRef.current = playerId;

        const inList = listData.players.find((p) => p.player_id === playerId);
        if (inList) {
            // Fast path: render immediately from cache
            selectPlayer(playerId);
            // Background fetch: discover both tournaments so toggle can appear
            // This does NOT block the UI — player is already visible
            fetchWPLPlayerById(playerId, urlTournament ?? undefined);
        } else {
            // Slow path (global search): fetch both tournaments, then render
            fetchWPLPlayerById(playerId, urlTournament ?? undefined);
        }
    }, [playerId, listData]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Step 3: Scroll to tab ─────────────────────────────────────────────────
    useEffect(() => {
        if (loading || !player) return;
        if (!tab) return;

        const id =
            tab === "highlights" ? "wpl-highlights-section" :
            tab === "stats"      ? "wpl-stats-section"      : null;
        if (!id) return;

        const timer = setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        return () => clearTimeout(timer);
    }, [tab, loading, player]);

    // ── Derive available tournaments from pair ────────────────────────────────
    const availableTournaments: string[] = [];
    if (playerPair?.womens_ipl)  availableTournaments.push("womens_ipl");
    if (playerPair?.womens_t20i) availableTournaments.push("womens_t20i");

    // Active player data — follows the toggle selection
    const activePlayer: WPLPlayer | null =
        playerPair
            ? (playerPair[activeTournament as keyof typeof playerPair] ?? player)
            : player;

    // Keep activeTournament valid when pair resolves
    useEffect(() => {
        if (
            availableTournaments.length > 0 &&
            !availableTournaments.includes(activeTournament)
        ) {
            setActiveTournament(availableTournaments[0]);
        }
    }, [availableTournaments.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Loading — only block UI on slow path (no player yet) ─────────────────
    // For card-clicked players, `player` is set immediately by selectPlayer()
    // so we never show the spinner. For global search, we wait for fetchWPLPlayerById.
    if (!player && (loading || playerId)) {
        const accent = getTournamentAccent(activeTournament);
        return (
            <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center gap-3">
                <div
                    className="animate-spin rounded-full h-12 w-12 border-b-2"
                    style={{ borderColor: accent }}
                />
                <p className="text-white text-sm">Loading player data…</p>
            </div>
        );
    }

    // ── Not found ─────────────────────────────────────────────────────────────
    if (!activePlayer) {
        return (
            <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-4">No player data found</p>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="px-4 py-2 rounded text-white"
                        style={{ background: getTournamentAccent(activeTournament) }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const navLabel = getTournamentLabel(activeTournament);
    const accent   = getTournamentAccent(activeTournament);

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
                        <path d="M19 12H5" />
                        <path d="M12 5l-7 7 7 7" />
                    </svg>
                </button>

                <div className="flex-1 flex flex-col items-center">
                    <span className="text-[17px] md:text-xl font-bold text-white tracking-tight">
                        {navLabel}
                    </span>
                    <div
                        className="h-[2px] w-10 rounded-full mt-0.5 transition-all duration-300"
                        style={{ background: accent }}
                    />
                </div>

                <div className="w-[22px]" />
            </div>

            <div className="w-full max-w-[1280px] mx-auto">

                {/* ── Mobile layout ── */}
                <div className="block lg:hidden">
                    <div className="max-w-[640px] mx-auto">
                        <WPLPlayerProfileHeader
                            player={activePlayer}
                            tournament={activeTournament}
                            availableTournaments={availableTournaments}
                            onTournamentChange={setActiveTournament}
                        />
                        <WPLPlayerProfileActions player={activePlayer} tournament={activeTournament} />
                        <WPLPlayerSeasonStats player={activePlayer} tournament={activeTournament} />
                        <WPLPlayerGamePlan player={activePlayer} tournament={activeTournament} />
                    </div>
                </div>

                {/* ── Desktop layout ── */}
                <div className="hidden lg:flex lg:items-start lg:gap-6 xl:gap-8 px-8 xl:px-12 py-6">

                    {/* Left sticky panel */}
                    <div className="sticky top-[65px] w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto max-h-[calc(100vh-65px)] [scrollbar-width:none]">
                        <WPLPlayerProfileHeader
                            player={activePlayer}
                            tournament={activeTournament}
                            availableTournaments={availableTournaments}
                            onTournamentChange={setActiveTournament}
                        />
                        <WPLPlayerProfileActions player={activePlayer} tournament={activeTournament} />
                    </div>

                    {/* Right scrollable panel */}
                    <div className="flex-1 min-w-0 flex flex-col pb-10">
                        <div id="wpl-stats-section">
                            <WPLPlayerSeasonStats player={activePlayer} tournament={activeTournament} />
                        </div>
                        <div id="wpl-highlights-section">
                            <WPLPlayerGamePlan player={activePlayer} tournament={activeTournament} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}