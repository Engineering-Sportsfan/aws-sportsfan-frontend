"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Search, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { FifaPlayer } from "@/types/fifaPlayer";

// ── Types ──────────────────────────────────────────────────────────────────────

type FifaPlayerListApiResponse = {
    success: boolean;
    data: FifaPlayer[];
    nextCursor?: string | null;
    count?: number;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const POSITION_LABELS: Record<string, string> = {
    GK: "Goalkeeper", DF: "Defender", MF: "Midfielder", FW: "Forward",
};

const POSITION_GRAD: Record<string, string> = {
    GK: "from-amber-400 to-orange-500",
    DF: "from-blue-500 to-blue-700",
    MF: "from-emerald-500 to-green-700",
    FW: "from-red-500 to-rose-600",
};

function initials(name: string) {
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function seededRand(seed: string, min: number, max: number): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    const norm = Math.abs(h) / 2147483647;
    return Math.floor(norm * (max - min + 1)) + min;
}

function formatCount(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function deriveCategories(player: FifaPlayer): string[] {
    const cats: string[] = ["FIFA WC 2022", POSITION_LABELS[player.position] ?? player.position];
    if (player.goals >= 3)            cats.push("Goal Scorer");
    if (player.assists >= 3)          cats.push("Playmaker");
    if (player.dribbles_completed >= 5) cats.push("Dribbler");
    return cats.slice(0, 3);
}

function playerHref(player: FifaPlayer): string {
    return `/MainModules/FifaPlayersProfile?id=${encodeURIComponent(player.player_id)}&tournament=${encodeURIComponent(player.tournament)}`;
}

// ── Single card ────────────────────────────────────────────────────────────────

function FifaPlayerCard({ player }: { player: FifaPlayer }) {
    const seed     = player.player_id;
    const likes    = seededRand(seed + "l", 120, 9800);
    const comments = seededRand(seed + "c", 18, 640);
    const views    = seededRand(seed + "v", 500, 24000);
    const shares   = seededRand(seed + "s", 10, 320);
    const minsAgo  = seededRand(seed + "t", 5, 1380);
    const categories = deriveCategories(player);
    const posLabel   = POSITION_LABELS[player.position] ?? player.position;
    const avatarGrad = POSITION_GRAD[player.position] ?? "from-gray-500 to-gray-700";

    const timeLabel =
        minsAgo < 60   ? `${minsAgo}m ago` :
        minsAgo < 1440 ? `${Math.floor(minsAgo / 60)}h ago` :
                         `${Math.floor(minsAgo / 1440)}d ago`;

    const href = playerHref(player);

    return (
        <div className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-[#121212] rounded-xl shadow-sm border border-white/8 overflow-hidden snap-start flex flex-col">

            {/* Header */}
            <Link href={href}>
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-[2px] rounded-full bg-gradient-to-br ${avatarGrad} shrink-0`}>
                            <div className="w-8 h-8 rounded-full bg-[#0a1f12] flex items-center justify-center">
                                <span className="text-white text-[11px] font-bold">{initials(player.player_name)}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white text-sm leading-tight">{player.player_name}</h3>
                            <p className="text-[10px] text-gray-400">{timeLabel}</p>
                        </div>
                    </div>
                    <MoreHorizontal size={18} className="text-gray-400" />
                </div>
            </Link>

            {/* Image placeholder — football pitch SVG */}
            <Link href={href}>
                <div className="relative aspect-video bg-[#0a1a0f] overflow-hidden">
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 320 180"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <defs>
                            <linearGradient id={`fbg-${player.player_id}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%"   stopColor="#052e16" />
                                <stop offset="50%"  stopColor="#0a1a0f" />
                                <stop offset="100%" stopColor="#064e3b" />
                            </linearGradient>
                            <radialGradient id={`fglow-${player.player_id}`} cx="50%" cy="50%" r="50%">
                                <stop offset="0%"   stopColor="#16a34a" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <rect width="320" height="180" fill={`url(#fbg-${player.player_id})`} />
                        <rect width="320" height="180" fill={`url(#fglow-${player.player_id})`} />

                        {/* Pitch outline */}
                        <rect x="20" y="15" width="280" height="150" rx="4" fill="none" stroke="#16a34a" strokeOpacity="0.25" strokeWidth="1" />
                        {/* Centre circle */}
                        <circle cx="160" cy="90" r="35" fill="none" stroke="#16a34a" strokeOpacity="0.2" strokeWidth="1" />
                        {/* Centre line */}
                        <line x1="160" y1="15" x2="160" y2="165" stroke="#16a34a" strokeOpacity="0.15" strokeWidth="1" />
                        {/* Centre spot */}
                        <circle cx="160" cy="90" r="2.5" fill="#16a34a" fillOpacity="0.4" />
                        {/* Left penalty box */}
                        <rect x="20" y="55" width="55" height="70" fill="none" stroke="#16a34a" strokeOpacity="0.18" strokeWidth="0.8" />
                        {/* Right penalty box */}
                        <rect x="245" y="55" width="55" height="70" fill="none" stroke="#16a34a" strokeOpacity="0.18" strokeWidth="0.8" />
                        {/* Left goal */}
                        <rect x="14" y="72" width="10" height="36" fill="none" stroke="#4ade80" strokeOpacity="0.35" strokeWidth="1" />
                        {/* Right goal */}
                        <rect x="296" y="72" width="10" height="36" fill="none" stroke="#4ade80" strokeOpacity="0.35" strokeWidth="1" />
                        {/* Stars */}
                        <circle cx="40"  cy="25"  r="1"   fill="#4ade80" opacity="0.5" />
                        <circle cx="280" cy="155" r="1.5" fill="#4ade80" opacity="0.4" />
                        <circle cx="300" cy="30"  r="1"   fill="#86efac" opacity="0.4" />
                        {/* Big initials */}
                        <text x="160" y="95" textAnchor="middle" dominantBaseline="middle"
                            fontSize="52" fontWeight="800"
                            fill="#16a34a" fillOpacity="0.15"
                            fontFamily="system-ui, sans-serif" letterSpacing="-2"
                        >
                            {initials(player.player_name)}
                        </text>
                    </svg>

                    {/* FIFA badge */}
                    <div className="absolute top-2 left-2">
                        <span className="text-[9px] bg-gradient-to-r from-green-700 to-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            FIFA WC
                        </span>
                    </div>

                    {/* Position badge */}
                    <div className="absolute top-2 right-2">
                        <span className="text-[9px] bg-black/60 backdrop-blur-sm text-green-200 border border-green-400/30 px-2 py-0.5 rounded-full font-medium">
                            {posLabel}
                        </span>
                    </div>

                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 py-3">
                        <p className="text-white font-bold text-sm leading-tight">{player.player_name}</p>
                        <p className="text-green-200/90 text-[10px] font-medium">{player.team} · {player.season}</p>
                    </div>
                </div>
            </Link>

            {/* Title */}
            <Link href={href}>
                <div className="px-3 pt-2 pb-1">
                    <h4 className="font-semibold text-white text-sm leading-snug">
                        {player.player_name}  
                        {/* {posLabel} · FIFA WC {player.season} */}
                    </h4>
                </div>
            </Link>

            {/* Category tags */}
            <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
                {categories.map((cat, i) => (
                    <span key={i} className="border border-white/8 text-gray-300 text-[10px] px-2 py-0.5 rounded-xl bg-white/5">
                        {cat}
                    </span>
                ))}
                {player.goals > 0 && (
                    <span className="border border-green-400/30 text-green-200 text-[10px] px-2 py-0.5 rounded-xl bg-green-500/8">
                        {player.goals}G {player.assists}A
                    </span>
                )}
            </div>

            {/* Stats row */}
            <div className="px-3 pb-3 flex items-center gap-2 flex-nowrap">
                <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
                    <img src="/images/profile.png" alt="followers" className="w-5 h-5 object-cover"
                        onError={(e) => { e.currentTarget.src = "/fallback-share.png"; }} />
                    <span className="text-xs text-gray-400">{formatCount(likes)}</span>
                </span>
                <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
                    <img src="/images/like.png" alt="likes" className="w-5 h-5 object-cover"
                        onError={(e) => { e.currentTarget.src = "/fallback-share.png"; }} />
                    <span className="text-xs text-gray-400">{formatCount(comments)}</span>
                </span>
                <span className="rounded-2xl px-2 py-1 flex items-center gap-1.5 bg-gray-950">
                    <img src="/images/live.png" alt="views" className="w-5 h-5 object-cover"
                        onError={(e) => { e.currentTarget.src = "/fallback-share.png"; }} />
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

// ── Skeleton ───────────────────────────────────────────────────────────────────

function FifaCardSkeleton() {
    return (
        <div className="w-full py-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-6 w-48 bg-[#1a1a1a] rounded-lg animate-pulse" />
                <div className="h-8 w-48 bg-[#1a1a1a] rounded-full animate-pulse" />
            </div>
            <div className="flex gap-4 overflow-hidden pb-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-black border border-gray-800 rounded-xl overflow-hidden animate-pulse">
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

// ── Main component ─────────────────────────────────────────────────────────────

export default function FifaPlayer360CardsSection() {
    const [players, setPlayers]       = useState<FifaPlayer[]>([]);
    const [loading, setLoading]       = useState(true);
    const [hasMore, setHasMore]       = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const hasFetched = useRef(false);

    const fetchPlayers = useCallback(async (cursor?: string | null) => {
        const isLoadMore = Boolean(cursor);
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const params = new URLSearchParams({ tournament: "mens_fifa_wc_2022", limit: "20" });
            if (cursor) params.set("after", cursor);

            const res = await axios.get<FifaPlayerListApiResponse>(
                `/api/fifa-player-stats?${params.toString()}`
            );

            if (res.data.success) {
                const incoming = res.data.data ?? [];
                const nc = res.data.nextCursor ?? null;
                setPlayers((prev) => (isLoadMore ? [...prev, ...incoming] : incoming));
                setNextCursor(nc);
                setHasMore(Boolean(nc));
            }
        } catch (err) {
            console.error("Failed to fetch FIFA players:", err);
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
        return players.filter(
            (p) =>
                p.player_name.toLowerCase().includes(q) ||
                p.team.toLowerCase().includes(q)
        );
    })();

    if (loading) return <FifaCardSkeleton />;

    return (
        <div className="w-full py-4">
            {/* Header */}
            <div className="flex items-center justify-between lg:justify-start lg:gap-4 gap-3 mb-4">
                <h1 className="text-[18px] sm:text-[20px] font-semibold text-white whitespace-nowrap">
                    FIFA Players 360
                </h1>

                <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-1.5 w-[160px] sm:w-[200px] md:w-[240px] focus-within:border-green-400/70 transition">
                    <Search className="text-gray-400 shrink-0" size={16} />
                    <input
                        type="text"
                        placeholder="Search players or teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none text-xs sm:text-sm text-white placeholder:text-gray-500 w-full ml-2"
                    />
                </div>
            </div>

            {/* Cards */}
            <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory pb-4">
                {filtered.length > 0 ? (
                    filtered.map((player) => (
                        <FifaPlayerCard key={player.player_id} player={player} />
                    ))
                ) : (
                    <div className="w-full text-center py-10">
                        <p className="text-gray-400 text-sm">
                            {searchTerm
                                ? `No players found matching '${searchTerm}'.`
                                : "No FIFA players available."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}