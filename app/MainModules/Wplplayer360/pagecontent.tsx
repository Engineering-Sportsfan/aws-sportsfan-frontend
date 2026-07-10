





// "use client";

// import { useEffect, useRef, useCallback, useState } from "react";
// import { Search, MoreHorizontal, Heart, MessageCircle, Share2, Eye } from "lucide-react";
// import Link from "next/link";
// import axios from "axios";
// import { WPLPlayer } from "@/types/wplPlayer";

// // ── Types ──────────────────────────────────────────────────────────────────

// type WPLPlayerListApiResponse = {
//     success: boolean;
//     data: WPLPlayer[];
//     nextCursor?: string | null;
//     pageSize?: number;
// };

// // ── Helpers ────────────────────────────────────────────────────────────────

// function deriveRole(player: WPLPlayer): string {
//     const hasBat = player.runs > 0;
//     const hasBowl = player.wickets > 0;
//     if (hasBat && hasBowl) return "All-Rounder";
//     if (hasBowl) return "Bowler";
//     return "Batter";
// }

// function initials(name: string) {
//     return name
//         .split(" ")
//         .slice(0, 2)
//         .map((w) => w[0])
//         .join("")
//         .toUpperCase();
// }

// /** Seeded random so numbers are stable per player (not random on every render) */
// function seededRand(seed: string, min: number, max: number): number {
//     let h = 0;
//     for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
//     const norm = Math.abs(h) / 2147483647;
//     return Math.floor(norm * (max - min + 1)) + min;
// }

// function formatCount(n: number): string {
//     if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
//     return String(n);
// }

// /** Returns one of several WPL / cricket category tags per player */
// function deriveCategories(player: WPLPlayer): string[] {
//     const role = deriveRole(player);
//     const cats: string[] = ["WPL 2024"];
//     if (role === "All-Rounder") cats.push("All-Rounder");
//     else if (role === "Bowler") cats.push("Bowler");
//     else cats.push("Batter");

//     if (player.sixes > 5) cats.push("Power Hitter");
//     if (player.wickets > 8) cats.push("Strike Bowler");
//     if (player.strike_rate > 130) cats.push("Explosive");
//     if (player.economy < 7 && player.economy > 0) cats.push("Economy King");
//     return cats.slice(0, 3);
// }

// // ── Single player card — mirrors Player360 layout exactly ─────────────────

// function WPLPlayerCard({ player }: { player: WPLPlayer }) {
//     const role = deriveRole(player);
//     const seed = player.player_id;
//     const likes = seededRand(seed + "l", 120, 9800);
//     const comments = seededRand(seed + "c", 18, 640);
//     const views = seededRand(seed + "v", 500, 24000);
//     const shares = seededRand(seed + "s", 10, 320);
//     const minsAgo = seededRand(seed + "t", 5, 1380);
//     const categories = deriveCategories(player);

//     const timeLabel =
//         minsAgo < 60
//             ? `${minsAgo}m ago`
//             : minsAgo < 1440
//                 ? `${Math.floor(minsAgo / 60)}h ago`
//                 : `${Math.floor(minsAgo / 1440)}d ago`;

//     // Role → gradient for avatar ring
//     const avatarGrad =
//         role === "All-Rounder"
//             ? "from-amber-400 to-orange-500"
//             : role === "Bowler"
//                 ? "from-pink-500 to-rose-500"
//                 : "from-orange-500 to-pink-500";

//     return (
//         <div className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-[#121212] rounded-xl shadow-sm border border-white/8 overflow-hidden snap-start flex flex-col">

//             {/* ── Header — player avatar + name + timestamp + menu ── */}
//             <Link href={`/MainModules/WplPlayers?id=${player.player_id}`}>
//                 <div className="p-3 flex items-center justify-between">
//                     <div className="flex items-center gap-2">

//                         {/* Avatar with gradient ring */}
//                         <div className={`p-[2px] rounded-full bg-gradient-to-br ${avatarGrad} shrink-0`}>
//                             <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center">
//                                 <span className="text-white text-[11px] font-bold">
//                                     {initials(player.player_name)}
//                                 </span>
//                             </div>
//                         </div>

//                         <div>
//                             <h3 className="font-semibold text-white text-sm leading-tight">
//                                 {player.player_name}
//                             </h3>
//                             <p className="text-[10px] text-gray-400">{timeLabel}</p>
//                         </div>
//                     </div>

//                     <MoreHorizontal size={18} className="text-gray-400" />
//                 </div>
//             </Link>

//             {/* ── Image — cricket stadium placeholder + WPL overlay ── */}
//             <Link href={`/MainModules/WplPlayers?id=${player.player_id}`}>
//                 <div className="relative aspect-video bg-[#0d0d1a] overflow-hidden">
//                     {/* Placeholder: abstract cricket-themed SVG background */}
//                     <svg
//                         className="absolute inset-0 w-full h-full"
//                         viewBox="0 0 320 180"
//                         xmlns="http://www.w3.org/2000/svg"
//                         preserveAspectRatio="xMidYMid slice"
//                     >
//                         {/* Background gradient */}
//                         <defs>
//                             <linearGradient id={`bg-${player.player_id}`} x1="0" y1="0" x2="1" y2="1">
//                                 <stop offset="0%" stopColor="#2a0811" />
//                                 <stop offset="50%" stopColor="#141018" />
//                                 <stop offset="100%" stopColor="#1f0d12" />
//                             </linearGradient>
//                             <radialGradient id={`glow-${player.player_id}`} cx="50%" cy="60%" r="50%">
//                                 <stop offset="0%" stopColor="#fb923c" stopOpacity="0.28" />
//                                 <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
//                             </radialGradient>
//                         </defs>
//                         <rect width="320" height="180" fill={`url(#bg-${player.player_id})`} />
//                         <rect width="320" height="180" fill={`url(#glow-${player.player_id})`} />

//                         {/* Cricket pitch outline */}
//                         <ellipse cx="160" cy="155" rx="130" ry="40" fill="none" stroke="#fb923c" strokeOpacity="0.18" strokeWidth="1" />
//                         <ellipse cx="160" cy="155" rx="90" ry="27" fill="none" stroke="#fb7185" strokeOpacity="0.14" strokeWidth="1" />
//                         <rect x="148" y="100" width="24" height="65" rx="2" fill="none" stroke="#fbbf24" strokeOpacity="0.22" strokeWidth="0.8" />

//                         {/* Stumps */}
//                         <line x1="152" y1="118" x2="152" y2="138" stroke="#c4b5fd" strokeOpacity="0.5" strokeWidth="1.5" />
//                         <line x1="160" y1="118" x2="160" y2="138" stroke="#c4b5fd" strokeOpacity="0.5" strokeWidth="1.5" />
//                         <line x1="168" y1="118" x2="168" y2="138" stroke="#c4b5fd" strokeOpacity="0.5" strokeWidth="1.5" />
//                         <line x1="149" y1="120" x2="171" y2="120" stroke="#c4b5fd" strokeOpacity="0.5" strokeWidth="1" />

//                         {/* Decorative stars / sparkles */}
//                         <circle cx="40" cy="30" r="1" fill="#fbbf24" opacity="0.6" />
//                         <circle cx="80" cy="15" r="1.5" fill="#fda4af" opacity="0.5" />
//                         <circle cx="240" cy="20" r="1" fill="#fb923c" opacity="0.7" />
//                         <circle cx="280" cy="40" r="1.5" fill="#f9a8d4" opacity="0.4" />
//                         <circle cx="300" cy="10" r="1" fill="#fbbf24" opacity="0.5" />
//                         <circle cx="20" cy="60" r="1" fill="#fda4af" opacity="0.4" />
//                         <circle cx="310" cy="80" r="1.5" fill="#fb923c" opacity="0.5" />

//                         {/* Big initials in center */}
//                         <text
//                             x="160"
//                             y="88"
//                             textAnchor="middle"
//                             dominantBaseline="middle"
//                             fontSize="52"
//                             fontWeight="800"
//                             fill="#fb923c"
//                             fillOpacity="0.18"
//                             fontFamily="system-ui, sans-serif"
//                             letterSpacing="-2"
//                         >
//                             {initials(player.player_name)}
//                         </text>
//                     </svg>

//                     {/* WPL badge top-left */}
//                     <div className="absolute top-2 left-2">
//                         <span className="text-[9px] bg-gradient-to-r from-rose-600 to-orange-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shadow-[0_0_12px_rgba(251,146,60,0.25)]">
//                             WPL
//                         </span>
//                     </div>

//                     {/* Role badge top-right */}
//                     <div className="absolute top-2 right-2">
//                         <span className="text-[9px] bg-black/60 backdrop-blur-sm text-amber-200 border border-orange-400/30 px-2 py-0.5 rounded-full font-medium">
//                             {role}
//                         </span>
//                     </div>

//                     {/* Player name overlay at bottom */}
//                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 py-3">
//                         <p className="text-white font-bold text-sm leading-tight">
//                             {player.player_name}
//                         </p>
//                         <p className="text-rose-200/90 text-[10px] font-medium">
//                             Women's Premier League
//                         </p>
//                     </div>
//                 </div>
//             </Link>

//             {/* ── Title / description ── */}
//             <Link href={`/MainModules/WplPlayers?id=${player.player_id}`}>
//                 <div className="px-3 pt-2 pb-1">
//                     <h4 className="font-semibold text-white text-sm leading-snug">
//                         {player.player_name} · {role} · WPL Season Highlights
//                     </h4>
//                 </div>
//             </Link>

//             {/* ── Category tags — mirrors Player360 tag row ── */}
//             <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
//                 {categories.map((cat, i) => (
//                     <span
//                         key={i}
//                         className="border border-white/8 text-gray-300 text-[10px] px-2 py-0.5 rounded-xl bg-white/5"
//                     >
//                         {cat}
//                     </span>
//                 ))}
//                 {player.jersey_no && (
//                     <span className="border border-orange-400/30 text-orange-200 text-[10px] px-2 py-0.5 rounded-xl bg-orange-500/8">
//                         #{player.jersey_no}
//                     </span>
//                 )}
//             </div>

//             {/* ── Stats row — likes / comments / views / share ── */}
//             <div className="px-3 pb-3 flex items-center gap-2 flex-wrap">
//                 <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
//                     {/* <Heart size={13} className="text-rose-400" /> */}
//                     <img
//                                                     src='/images/profile.png'
//                                                     alt="comments"
//                                                     className="w-5 h-5 object-cover"
//                                                     onError={(e) => {
//                                                         e.currentTarget.src = '/fallback-share.png';
//                                                     }}
//                                                 />
//                     <span className="text-xs text-gray-400">{formatCount(likes)}</span>
//                 </span>

//                 <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
//                     {/* <MessageCircle size={13} className="text-orange-400" /> */}
//                      <img
//                                                     src='/images/like.png'
//                                                     alt="likes"
//                                                     className="w-5 h-5 object-cover"
//                                                     onError={(e) => {
//                                                         e.currentTarget.src = '/fallback-share.png';
//                                                     }}
//                                                 />
//                     <span className="text-xs text-gray-400">{formatCount(comments)}</span>
//                 </span>

//                 <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
//                     {/* <Eye size={13} className="text-amber-300" /> */}
//                      <img
//                                                     src='/images/live.png'
//                                                     alt="likes"
//                                                     className="w-5 h-5 object-cover"
//                                                     onError={(e) => {
//                                                         e.currentTarget.src = '/fallback-share.png';
//                                                     }}
//                                                 />
//                     <span className="text-xs text-gray-400">{formatCount(views)}</span>
//                 </span>

//                 <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
//                     <Share2 size={13} className="text-gray-400" />
//                     <span className="text-xs text-gray-400">{formatCount(shares)}</span>
//                 </span>
//             </div>
//         </div>
//     );
// }

// // ── Skeleton ───────────────────────────────────────────────────────────────

// function WPLCardSkeleton() {
//     return (
//         <div className="w-full py-4">
//             <div className="flex items-center gap-3 mb-4">
//                 <div className="h-6 w-48 bg-[#1a1a1a] rounded-lg animate-pulse" />
//                 <div className="h-8 w-48 bg-[#1a1a1a] rounded-full animate-pulse" />
//             </div>
//             <div className="flex gap-4 overflow-hidden pb-4">
//                 {[1, 2, 3].map((i) => (
//                     <div
//                         key={i}
//                         className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-black border border-gray-800 rounded-xl overflow-hidden animate-pulse"
//                     >
//                         <div className="p-3 flex items-center gap-2">
//                             <div className="w-8 h-8 rounded-full bg-gray-800" />
//                             <div className="flex-1">
//                                 <div className="h-3 bg-gray-800 rounded w-28 mb-1" />
//                                 <div className="h-2 bg-gray-800 rounded w-16" />
//                             </div>
//                         </div>
//                         <div className="aspect-video bg-gray-900" />
//                         <div className="p-3 space-y-2">
//                             <div className="h-3 bg-gray-800 rounded w-full" />
//                             <div className="h-3 bg-gray-800 rounded w-3/4" />
//                             <div className="flex gap-2 mt-2">
//                                 <div className="h-5 w-14 bg-gray-800 rounded-xl" />
//                                 <div className="h-5 w-14 bg-gray-800 rounded-xl" />
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// // ── Main component ─────────────────────────────────────────────────────────

// export default function WPLPlayer360CardsSection() {
//     const [players, setPlayers] = useState<WPLPlayer[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [hasMore, setHasMore] = useState(false);
//     const [nextCursor, setNextCursor] = useState<string | null>(null);
//     const [loadingMore, setLoadingMore] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const hasFetched = useRef(false);

//     const fetchPlayers = useCallback(async (cursor?: string | null) => {
//         const isLoadMore = Boolean(cursor);
//         if (isLoadMore) setLoadingMore(true);
//         else setLoading(true);

//         try {
//             const params = new URLSearchParams({ tournament: "womens_ipl", limit: "20" });
//             if (cursor) params.set("after", cursor);

//             const res = await axios.get<WPLPlayerListApiResponse>(
//                 `/api/player-stats?${params.toString()}`
//             );

//             if (res.data.success) {
//                 const incoming = res.data.data ?? [];
//                 const nc = res.data.nextCursor ?? null;
//                 setPlayers((prev) => (isLoadMore ? [...prev, ...incoming] : incoming));
//                 setNextCursor(nc);
//                 setHasMore(Boolean(nc));
//             }
//         } catch (err) {
//             console.error("Failed to fetch WPL players:", err);
//         } finally {
//             setLoading(false);
//             setLoadingMore(false);
//         }
//     }, []);

//     useEffect(() => {
//         if (!hasFetched.current) {
//             hasFetched.current = true;
//             fetchPlayers();
//         }
//     }, [fetchPlayers]);

//     const filtered = (() => {
//         const q = searchTerm.trim().toLowerCase();
//         if (!q) return players;
//         return players.filter((p) => p.player_name.toLowerCase().includes(q));
//     })();

//     const handleSearchChange = useCallback(
//         (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
//         []
//     );

//     if (loading) return <WPLCardSkeleton />;

//     return (
//         <div className="w-full py-4">
//             {/* ── Header ── */}
//             <div className="flex items-center justify-between lg:justify-start lg:gap-4 gap-3 mb-4">
//                 <h1 className="text-[18px] sm:text-[20px] font-semibold text-white whitespace-nowrap">
//                     WPL Players 360
//                 </h1>

//                 <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-1.5 w-[160px] sm:w-[200px] md:w-[240px] focus-within:border-orange-400/70 transition">
//                     <Search className="text-gray-400 shrink-0" size={16} />
//                     <input
//                         type="text"
//                         placeholder="Search players..."
//                         value={searchTerm}
//                         onChange={handleSearchChange}
//                         className="bg-transparent outline-none text-xs sm:text-sm text-white placeholder:text-gray-500 w-full ml-2"
//                     />
//                 </div>
//             </div>

//             {/* ── Cards ── */}
//             <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory pb-4">
//                 {filtered.length > 0 ? (
//                     filtered.map((player) => (
//                         <WPLPlayerCard key={player.player_id} player={player} />
//                     ))
//                 ) : (
//                     <div className="w-full text-center py-10">
//                         <p className="text-gray-400 text-sm">
//                             {searchTerm
//                                 ? `No players found matching '${searchTerm}'.`
//                                 : "No WPL players available."}
//                         </p>
//                     </div>
//                 )}
//             </div>

//             {/* ── Load more ── */}
//             {/* {hasMore && !searchTerm && (
//                 <div className="flex justify-center mt-2">
//                     <button
//                         onClick={() => fetchPlayers(nextCursor)}
//                         disabled={loadingMore}
//                         className="text-xs text-orange-100 border border-orange-400/30 px-4 py-1.5 rounded-full hover:bg-orange-500/10 transition disabled:opacity-50"
//                     >
//                         {loadingMore ? "Loading…" : "Load more players"}
//                     </button>
//                 </div>
//             )} */}
//         </div>
//     );
// }









"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Search, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { WPLPlayer } from "@/types/wplPlayer";

// ── Types ──────────────────────────────────────────────────────────────────

type WPLPlayerListApiResponse = {
    success: boolean;
    data: WPLPlayer[];
    nextCursor?: string | null;
    pageSize?: number;
};

// ── Helpers 

function deriveRole(player: WPLPlayer): string {
    const hasBat = player.runs > 0;
    const hasBowl = player.wickets > 0;
    if (hasBat && hasBowl) return "All-Rounder";
    if (hasBowl) return "Bowler";
    return "Batter";
}

function initials(name: string) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

function seededRand(seed: string, min: number, max: number): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    const norm = Math.abs(h) / 2147483647;
    return Math.floor(norm * (max - min + 1)) + min;
}

function formatCount(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

function deriveCategories(player: WPLPlayer): string[] {
    const role = deriveRole(player);
    const cats: string[] = ["Women's T20 WC 2026"];
    if (role === "All-Rounder") cats.push("All-Rounder");
    else if (role === "Bowler") cats.push("Bowler");
    else cats.push("Batter");
    if (player.sixes > 5) cats.push("Power Hitter");
    if (player.wickets > 8) cats.push("Strike Bowler");
    if (player.strike_rate > 130) cats.push("Explosive");
    if (player.economy < 7 && player.economy > 0) cats.push("Economy King");
    return cats.slice(0, 3);
}

// ── Player href builder ────────────────────────────────────────────────────
// Always links with tournament=womens_ipl so the profile page knows which
// tournament to default to when it fetches both variants in parallel.

function playerHref(player: WPLPlayer): string {
    return `/MainModules/WplPlayers?id=${encodeURIComponent(player.player_id)}&tournament=womens_ipl`;
}

// ── Single player card ─────────────────────────────────────────────────────

function WPLPlayerCard({ player }: { player: WPLPlayer }) {
    const role = deriveRole(player);
    const seed = player.player_id;
    const likes    = seededRand(seed + "l", 120, 9800);
    const comments = seededRand(seed + "c", 18, 640);
    const views    = seededRand(seed + "v", 500, 24000);
    const shares   = seededRand(seed + "s", 10, 320);
    const minsAgo  = seededRand(seed + "t", 5, 1380);
    const categories = deriveCategories(player);

    const timeLabel =
        minsAgo < 60
            ? `${minsAgo}m ago`
            : minsAgo < 1440
                ? `${Math.floor(minsAgo / 60)}h ago`
                : `${Math.floor(minsAgo / 1440)}d ago`;

    const avatarGrad =
        role === "All-Rounder"
            ? "from-amber-400 to-orange-500"
            : role === "Bowler"
                ? "from-pink-500 to-rose-500"
                : "from-orange-500 to-pink-500";

    const href = playerHref(player);

    return (
        <div className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-[#121212] rounded-xl shadow-sm border border-white/8 overflow-hidden snap-start flex flex-col">

            {/* ── Header ── */}
            <Link href={href}>
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-[2px] rounded-full bg-gradient-to-br ${avatarGrad} shrink-0`}>
                            <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center">
                                <span className="text-white text-[11px] font-bold">
                                    {initials(player.player_name)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white text-sm leading-tight">
                                {player.player_name}
                            </h3>
                            <p className="text-[10px] text-gray-400">{timeLabel}</p>
                        </div>
                    </div>

                    <MoreHorizontal size={18} className="text-gray-400" />
                </div>
            </Link>

            {/* ── Image ── */}
            <Link href={href}>
                <div className="relative aspect-video bg-[#0d0d1a] overflow-hidden">
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 320 180"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            <linearGradient id={`bg-${player.player_id}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#2a0811" />
                                <stop offset="50%" stopColor="#141018" />
                                <stop offset="100%" stopColor="#1f0d12" />
                            </linearGradient>
                            <radialGradient id={`glow-${player.player_id}`} cx="50%" cy="60%" r="50%">
                                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.28" />
                                <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <rect width="320" height="180" fill={`url(#bg-${player.player_id})`} />
                        <rect width="320" height="180" fill={`url(#glow-${player.player_id})`} />
                        <ellipse cx="160" cy="155" rx="130" ry="40" fill="none" stroke="#fb923c" strokeOpacity="0.18" strokeWidth="1" />
                        <ellipse cx="160" cy="155" rx="90"  ry="27"  fill="none" stroke="#fb7185" strokeOpacity="0.14" strokeWidth="1" />
                        <rect x="148" y="100" width="24" height="65" rx="2" fill="none" stroke="#fbbf24" strokeOpacity="0.22" strokeWidth="0.8" />
                        <line x1="152" y1="118" x2="152" y2="138" stroke="#c4b5fd" strokeOpacity="0.5" strokeWidth="1.5" />
                        <line x1="160" y1="118" x2="160" y2="138" stroke="#c4b5fd" strokeOpacity="0.5" strokeWidth="1.5" />
                        <line x1="168" y1="118" x2="168" y2="138" stroke="#c4b5fd" strokeOpacity="0.5" strokeWidth="1.5" />
                        <line x1="149" y1="120" x2="171" y2="120" stroke="#c4b5fd" strokeOpacity="0.5" strokeWidth="1" />
                        <circle cx="40"  cy="30" r="1"   fill="#fbbf24" opacity="0.6" />
                        <circle cx="80"  cy="15" r="1.5" fill="#fda4af" opacity="0.5" />
                        <circle cx="240" cy="20" r="1"   fill="#fb923c" opacity="0.7" />
                        <circle cx="280" cy="40" r="1.5" fill="#f9a8d4" opacity="0.4" />
                        <circle cx="300" cy="10" r="1"   fill="#fbbf24" opacity="0.5" />
                        <circle cx="20"  cy="60" r="1"   fill="#fda4af" opacity="0.4" />
                        <circle cx="310" cy="80" r="1.5" fill="#fb923c" opacity="0.5" />
                        <text
                            x="160" y="88"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="52"
                            fontWeight="800"
                            fill="#fb923c"
                            fillOpacity="0.18"
                            fontFamily="system-ui, sans-serif"
                            letterSpacing="-2"
                        >
                            {initials(player.player_name)}
                        </text>
                    </svg>

                 
                    
                    {/* Role badge */}
                    <div className="absolute top-2 right-2">
                        <span className="text-[9px] bg-black/60 backdrop-blur-sm text-amber-200 border border-orange-400/30 px-2 py-0.5 rounded-full font-medium">
                            {role}
                        </span>
                    </div>

                    {/* Name overlay */}
                    {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 py-3">
                        <p className="text-white font-bold text-sm leading-tight">
                            {player.player_name}
                        </p>
                            <p className="text-rose-200/90 text-[10px] font-medium">
                                Women's T20 WC
                            </p>
                    </div> */}
                </div>
            </Link>

            {/* ── Title ── */}
            <Link href={href}>
                <div className="px-3 pt-2 pb-1">
                    <h4 className="font-semibold text-white text-sm leading-snug">
                        {player.player_name} 
                    </h4>
                </div>
            </Link>

            {/* ── Category tags ── */}
            <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
                {categories.map((cat, i) => (
                    <span
                        key={i}
                        className="border border-white/8 text-gray-300 text-[10px] px-2 py-0.5 rounded-xl bg-white/5"
                    >
                        {cat}
                    </span>
                ))}
                {player.jersey_no && (
                    <span className="border border-orange-400/30 text-orange-200 text-[10px] px-2 py-0.5 rounded-xl bg-orange-500/8">
                        #{player.jersey_no}
                    </span>
                )}
            </div>

            {/* ── Stats row ── */}
            <div className="px-3 pb-3 flex items-center gap-2 flex-nowrap">
                <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
                    <img
                        src="/images/profile.png"
                        alt="followers"
                        className="w-5 h-5 object-cover"
                        onError={(e) => { e.currentTarget.src = "/fallback-share.png"; }}
                    />
                    <span className="text-xs text-gray-400">{formatCount(likes)}</span>
                </span>

                <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
                    <img
                        src="/images/like.png"
                        alt="likes"
                        className="w-5 h-5 object-cover"
                        onError={(e) => { e.currentTarget.src = "/fallback-share.png"; }}
                    />
                    <span className="text-xs text-gray-400">{formatCount(comments)}</span>
                </span>

                <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
                    <img
                        src="/images/live.png"
                        alt="views"
                        className="w-5 h-5 object-cover"
                        onError={(e) => { e.currentTarget.src = "/fallback-share.png"; }}
                    />
                    <span className="text-xs text-gray-400">{formatCount(views)}</span>
                </span>

                <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
                    <Share2 size={13} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{formatCount(shares)}</span>
                </span>
            </div>
        </div>
    );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function WPLCardSkeleton() {
    return (
        <div className="w-full py-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-48 bg-[#1a1a1a] rounded-lg animate-pulse" />
                <div className="h-8 w-48 bg-[#1a1a1a] rounded-full animate-pulse" />
            </div>
            <div className="flex gap-4 overflow-hidden pb-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-black border border-gray-800 rounded-xl overflow-hidden animate-pulse"
                    >
                        <div className="p-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-800" />
                            <div className="flex-1">
                                <div className="h-3 bg-gray-800 rounded w-28 mb-1" />
                                <div className="h-2 bg-gray-800 rounded w-16" />
                            </div>
                        </div>
                        <div className="aspect-video bg-gray-900" />
                        <div className="p-3 space-y-2">
                            <div className="h-3 bg-gray-800 rounded w-full" />
                            <div className="h-3 bg-gray-800 rounded w-3/4" />
                            <div className="flex gap-2 mt-2">
                                <div className="h-5 w-14 bg-gray-800 rounded-xl" />
                                <div className="h-5 w-14 bg-gray-800 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function WPLPlayer360CardsSection() {
    const [players, setPlayers] = useState<WPLPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const hasFetched = useRef(false);

    const fetchPlayers = useCallback(async (cursor?: string | null) => {
        const isLoadMore = Boolean(cursor);
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const params = new URLSearchParams({ tournament: "womens_ipl", limit: "20" });
            if (cursor) params.set("after", cursor);

            const res = await axios.get<WPLPlayerListApiResponse>(
                `/api/player-stats?${params.toString()}`
            );

            if (res.data.success) {
                const incoming = res.data.data ?? [];
                const nc = res.data.nextCursor ?? null;
                setPlayers((prev) => (isLoadMore ? [...prev, ...incoming] : incoming));
                setNextCursor(nc);
                setHasMore(Boolean(nc));
            }
        } catch (err) {
            console.error("Failed to fetch women's T20 WC players:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            fetchPlayers();
        }
    }, [fetchPlayers]);

    const filtered = (() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return players;
        return players.filter((p) => p.player_name.toLowerCase().includes(q));
    })();

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
        []
    );

    if (loading) return <WPLCardSkeleton />;

    return (
        <div className="w-full py-2">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between lg:justify-start lg:gap-4 gap-3 mb-4">
                <h1 className="text-[18px] sm:text-[20px] font-semibold text-white whitespace-nowrap">
                    Women's T20WC Players 360
                </h1>

                <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-1.5 w-[160px] sm:w-[200px] md:w-[240px] focus-within:border-orange-400/70 transition">
                    <Search className="text-gray-400 shrink-0" size={16} />
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-transparent outline-none text-xs sm:text-sm text-white placeholder:text-gray-500 w-full ml-2"
                    />
                </div>
            </div>

            {/* ── Cards ── */}
            <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory pb-4">
                {filtered.length > 0 ? (
                    filtered.map((player) => (
                        <WPLPlayerCard key={player.player_id} player={player} />
                    ))
                ) : (
                    <div className="w-full text-center py-10">
                        <p className="text-gray-400 text-sm">
                            {searchTerm
                                ? `No players found matching '${searchTerm}'.`
                                : "No Women's T20WC players available."}
                        </p>
                    </div>
                )}
            </div>

            {/* Load more — uncomment when needed */}
            {/* {hasMore && !searchTerm && (
                <div className="flex justify-center mt-2">
                    <button
                        onClick={() => fetchPlayers(nextCursor)}
                        disabled={loadingMore}
                        className="text-xs text-orange-100 border border-orange-400/30 px-4 py-1.5 rounded-full hover:bg-orange-500/10 transition disabled:opacity-50"
                    >
                        {loadingMore ? "Loading…" : "Load more players"}
                    </button>
                </div>
            )} */}
        </div>
    );
}