// components/FifaClub-Component/FifaClub360CardsSection/index.tsx
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Search, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { FifaClub } from "@/types/fifaClub";

// ── Types ──────────────────────────────────────────────────────────────────────

type FifaClubListApiResponse = {
  success: boolean;
  data: FifaClub[];
  nextCursor?: string | null;
  count?: number;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function seededRand(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const norm = Math.abs(h) / 2147483647;
  return Math.floor(norm * (max - min + 1)) + min;
}

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function clubHref(club: FifaClub): string {
  return `/MainModules/FifaClubProfile?id=${encodeURIComponent(club.club_id)}&tournament=${encodeURIComponent(club.tournament)}`;
}

// Win rate 0–100
function winRate(club: FifaClub): number {
  if (!club.matches_played) return 0;
  return Math.round((club.wins / club.matches_played) * 100);
}

// Tag pills derived from club stats
function deriveCategories(club: FifaClub): string[] {
  const cats: string[] = ["FIFA WC 2026"];
  if (club.wins >= 50)           cats.push("All-Time Great");
  if (winRate(club) >= 60)       cats.push("Dominant");
  if (club.goals_for >= 150)     cats.push("Attacking Force");
  if (club.goal_difference > 80) cats.push("Clinical");
  if (club.world_cup_apps >= 20) cats.push("Tournament Veteran");
  return cats.slice(0, 3);
}

// ── Single card ────────────────────────────────────────────────────────────────

function FifaClubCard({ club }: { club: FifaClub }) {
  const seed     = club.club_id;
  const likes    = seededRand(seed + "l", 200, 12000);
  const comments = seededRand(seed + "c", 30, 900);
  const views    = seededRand(seed + "v", 800, 32000);
  const shares   = seededRand(seed + "s", 20, 500);
  const minsAgo  = seededRand(seed + "t", 5, 1380);

  const categories = deriveCategories(club);
  const wr = winRate(club);
  const href = clubHref(club);

  const timeLabel =
    minsAgo < 60   ? `${minsAgo}m ago` :
    minsAgo < 1440 ? `${Math.floor(minsAgo / 60)}h ago` :
                     `${Math.floor(minsAgo / 1440)}d ago`;

  return (
    <div className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-[#121212] rounded-xl shadow-sm border border-white/8 overflow-hidden snap-start flex flex-col">

      {/* Header */}
      <Link href={href}>
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Club crest avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#16a34a] to-[#064e3b] flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-extrabold tracking-tight">{club.club_id}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm leading-tight">{club.country}</h3>
              <p className="text-[10px] text-gray-400">{timeLabel}</p>
            </div>
          </div>
          <MoreHorizontal size={18} className="text-gray-400" />
        </div>
      </Link>

      {/* Visual banner — pitch-style with club stats overlaid */}
      <Link href={href}>
        <div className="relative aspect-video bg-[#071a0f] overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 320 180"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id={`cbg-${club.club_id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#042310" />
                <stop offset="50%"  stopColor="#071a0f" />
                <stop offset="100%" stopColor="#053d20" />
              </linearGradient>
              <radialGradient id={`cglow-${club.club_id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#16a34a" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="320" height="180" fill={`url(#cbg-${club.club_id})`} />
            <rect width="320" height="180" fill={`url(#cglow-${club.club_id})`} />
            {/* Pitch lines */}
            <rect x="20" y="15" width="280" height="150" rx="3" fill="none" stroke="#16a34a" strokeOpacity="0.2" strokeWidth="1" />
            <line x1="160" y1="15" x2="160" y2="165" stroke="#16a34a" strokeOpacity="0.12" strokeWidth="1" />
            <circle cx="160" cy="90" r="32" fill="none" stroke="#16a34a" strokeOpacity="0.18" strokeWidth="1" />
            <circle cx="160" cy="90" r="2.5" fill="#16a34a" fillOpacity="0.35" />
            <rect x="20" y="58" width="50" height="64" fill="none" stroke="#16a34a" strokeOpacity="0.15" strokeWidth="0.8" />
            <rect x="250" y="58" width="50" height="64" fill="none" stroke="#16a34a" strokeOpacity="0.15" strokeWidth="0.8" />
            <rect x="14" y="74" width="9" height="32" fill="none" stroke="#4ade80" strokeOpacity="0.3" strokeWidth="1" />
            <rect x="297" y="74" width="9" height="32" fill="none" stroke="#4ade80" strokeOpacity="0.3" strokeWidth="1" />
            {/* Big club code */}
            <text x="160" y="95" textAnchor="middle" dominantBaseline="middle"
              fontSize="60" fontWeight="900"
              fill="#16a34a" fillOpacity="0.10"
              fontFamily="system-ui, sans-serif" letterSpacing="-3"
            >
              {club.club_id}
            </text>
            {/* Sparkle dots */}
            <circle cx="45"  cy="28"  r="1.2" fill="#4ade80" opacity="0.45" />
            <circle cx="275" cy="158" r="1.5" fill="#4ade80" opacity="0.35" />
            <circle cx="295" cy="32"  r="1"   fill="#86efac" opacity="0.4" />
          </svg>

          {/* FIFA badge */}
          <div className="absolute top-2 left-2">
            <span className="text-[9px] bg-gradient-to-r from-green-700 to-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              FIFA WC
            </span>
          </div>

          {/* Rank badge */}
          <div className="absolute top-2 right-2">
            <span className="text-[9px] bg-black/60 backdrop-blur-sm text-green-200 border border-green-400/30 px-2 py-0.5 rounded-full font-medium">
              #{club.fifa_rank} FIFA
            </span>
          </div>

          {/* Stat pills — W / D / L */}
          <div className="absolute bottom-10 left-3 flex gap-1.5">
            <span className="text-[9px] bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-bold">{club.wins}W</span>
            <span className="text-[9px] bg-yellow-900/70 border border-yellow-500/30 text-yellow-300 px-1.5 py-0.5 rounded font-bold">{club.draws}D</span>
            <span className="text-[9px] bg-red-900/70 border border-red-500/30 text-red-300 px-1.5 py-0.5 rounded font-bold">{club.losses}L</span>
          </div>

          {/* Name + meta overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 py-3">
            <p className="text-white font-bold text-sm leading-tight">{club.country}</p>
            <p className="text-green-200/90 text-[10px] font-medium">{club.world_cup_apps} WC apps · {club.matches_played} matches</p>
          </div>
        </div>
      </Link>

      {/* Country name */}
      <Link href={href}>
        <div className="px-3 pt-2 pb-1">
          <h4 className="font-semibold text-white text-sm leading-snug">{club.country}</h4>
        </div>
      </Link>

      {/* Category tags */}
      <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
        {categories.map((cat, i) => (
          <span key={i} className="border border-white/8 text-gray-300 text-[10px] px-2 py-0.5 rounded-xl bg-white/5">
            {cat}
          </span>
        ))}
        {wr > 0 && (
          <span className="border border-green-400/30 text-green-200 text-[10px] px-2 py-0.5 rounded-xl bg-green-500/8">
            {wr}% win rate
          </span>
        )}
      </div>

      {/* Stats row — same social-style layout as player cards */}
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

function FifaClubCardSkeleton() {
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
              <div className="w-9 h-9 rounded-full bg-gray-800" />
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

export default function FifaClub360CardsSection() {
  const [clubs, setClubs]           = useState<FifaClub[]>([]);
  const [loading, setLoading]       = useState(true);
  const [hasMore, setHasMore]       = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const hasFetched = useRef(false);

  const fetchClubs = useCallback(async (cursor?: string | null) => {
    const isLoadMore = Boolean(cursor);
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({ tournament: "FIFA World Cup", limit: "20" });
      if (cursor) params.set("after", cursor);

      const res = await axios.get<FifaClubListApiResponse>(
        `/api/fifa-clubs`
      );

      if (res.data.success) {
        const incoming = res.data.data ?? [];
        const nc = res.data.nextCursor ?? null;
        setClubs((prev) => (isLoadMore ? [...prev, ...incoming] : incoming));
        setNextCursor(nc);
        setHasMore(Boolean(nc));
      }
    } catch (err) {
      console.error("Failed to fetch FIFA clubs:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchClubs();
    }
  }, [fetchClubs]);

  const filtered = (() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.club_id.toLowerCase().includes(q)
    );
  })();

  if (loading) return <FifaClubCardSkeleton />;

  return (
    <div className="w-full py-4">
      {/* Header */}
      <div className="flex items-center justify-between lg:justify-start lg:gap-4 gap-3 mb-4">
        <h1 className="text-[18px] sm:text-[20px] font-semibold text-white whitespace-nowrap">
          FIFA Clubs 360
        </h1>

        <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-1.5 w-[160px] sm:w-[200px] md:w-[240px] focus-within:border-green-400/70 transition">
          <Search className="text-gray-400 shrink-0" size={16} />
          <input
            type="text"
            placeholder="Search clubs or countries…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-xs sm:text-sm text-white placeholder:text-gray-500 w-full ml-2"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory pb-4">
        {filtered.length > 0 ? (
          filtered.map((club) => (
            <FifaClubCard key={club.club_id} club={club} />
          ))
        ) : (
          <div className="w-full text-center py-10">
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? `No clubs found matching '${searchTerm}'.`
                : "No FIFA clubs available."}
            </p>
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loadingMore && (
        <button
          onClick={() => fetchClubs(nextCursor)}
          className="mt-2 text-xs text-green-400 underline underline-offset-2 hover:text-green-300 transition-colors"
        >
          Load more clubs
        </button>
      )}
      {loadingMore && (
        <p className="mt-2 text-xs text-gray-500">Loading more…</p>
      )}
    </div>
  );
}