// components/wt20-component/WT20Club360CardsSection/index.tsx
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Search, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { WT20Club } from "@/types/wt20Club";

// ── Types ──────────────────────────────────────────────────────────────────────

type WT20ClubListApiResponse = {
  success: boolean;
  data: WT20Club[];
  nextCursor?: string | null;
  count?: number;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function seededRand(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Math.floor((Math.abs(h) / 2147483647) * (max - min + 1)) + min;
}

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function clubHref(club: WT20Club): string {
  return `/MainModules/WT20ClubProfile?id=${encodeURIComponent(club.club_id)}`;
}

// Derive tag pills from WT20 stats
function deriveCategories(club: WT20Club): string[] {
  const cats: string[] = ["WT20 WC"];
  const winPct = Math.round(club.win_pct * 100);
  if (winPct >= 70)               cats.push("Dominant");
  if (winPct >= 50 && winPct < 70) cats.push("Consistent");
  if (club.icc_ranking <= 3)      cats.push("World-Class");
  if (club.apps >= 8)             cats.push("Veterans");
  if (club.best_tournament_finish?.toLowerCase().includes("champions"))
    cats.push("Champions");
  return cats.slice(0, 3);
}

// Form string → colored dots
function FormStrip({ form }: { form: string | null }) {
  if (!form) return null;
  const items = form.split("-");
  const colorMap: Record<string, string> = {
    W: "#4ade80", L: "#f87171", T: "#fbbf24", N: "#6b7280",
  };
  return (
    <div className="flex items-center gap-1">
      {items.map((r, i) => (
        <span
          key={i}
          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold text-black"
          style={{ background: colorMap[r] ?? "#6b7280" }}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

// ── Single card ────────────────────────────────────────────────────────────────

function WT20ClubCard({ club }: { club: WT20Club }) {
  const seed     = club.club_id;
  const likes    = seededRand(seed + "l", 200, 12000);
  const comments = seededRand(seed + "c", 30, 900);
  const views    = seededRand(seed + "v", 800, 32000);
  const shares   = seededRand(seed + "s", 20, 500);
  const minsAgo  = seededRand(seed + "t", 5, 1380);

  const categories = deriveCategories(club);
  const winPct     = Math.round(club.win_pct * 100);
  const href       = clubHref(club);
  const countryCode = club.club_id.replace("-W", "");

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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0f766e] to-[#134e4a] flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-extrabold tracking-tight">{countryCode}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm leading-tight">{club.country}</h3>
              <p className="text-[10px] text-gray-400">{timeLabel}</p>
            </div>
          </div>
          <MoreHorizontal size={18} className="text-gray-400" />
        </div>
      </Link>

      {/* Visual banner — cricket oval motif */}
      <Link href={href}>
        <div className="relative aspect-video bg-[#042f2e] overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 320 180"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id={`cbg-${club.club_id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#022c22" />
                <stop offset="50%"  stopColor="#042f2e" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <radialGradient id={`cglow-${club.club_id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#0d9488" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="320" height="180" fill={`url(#cbg-${club.club_id})`} />
            <rect width="320" height="180" fill={`url(#cglow-${club.club_id})`} />

            {/* Cricket oval outline */}
            <ellipse cx="160" cy="90" rx="110" ry="68" fill="none" stroke="#0d9488" strokeOpacity="0.18" strokeWidth="1.2" />
            {/* Inner circle (pitch area) */}
            <ellipse cx="160" cy="90" rx="60" ry="38" fill="none" stroke="#0d9488" strokeOpacity="0.12" strokeWidth="0.8" />
            {/* Pitch strip */}
            <rect x="145" y="55" width="30" height="70" rx="2" fill="none" stroke="#2dd4bf" strokeOpacity="0.15" strokeWidth="0.8" />
            {/* Crease lines */}
            <line x1="142" y1="70" x2="178" y2="70" stroke="#2dd4bf" strokeOpacity="0.22" strokeWidth="0.8" />
            <line x1="142" y1="110" x2="178" y2="110" stroke="#2dd4bf" strokeOpacity="0.22" strokeWidth="0.8" />
            {/* Wickets left */}
            <line x1="155" y1="63" x2="155" y2="74" stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="1.2" />
            <line x1="160" y1="62" x2="160" y2="73" stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="1.2" />
            <line x1="165" y1="63" x2="165" y2="74" stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="1.2" />
            {/* Wickets right */}
            <line x1="155" y1="106" x2="155" y2="117" stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="1.2" />
            <line x1="160" y1="107" x2="160" y2="118" stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="1.2" />
            <line x1="165" y1="106" x2="165" y2="117" stroke="#fbbf24" strokeOpacity="0.35" strokeWidth="1.2" />
            {/* Big club code watermark */}
            <text x="160" y="95" textAnchor="middle" dominantBaseline="middle"
              fontSize="54" fontWeight="900"
              fill="#0d9488" fillOpacity="0.10"
              fontFamily="system-ui, sans-serif" letterSpacing="-2"
            >
              {countryCode}
            </text>
            {/* Sparkle dots */}
            <circle cx="45"  cy="28"  r="1.2" fill="#2dd4bf" opacity="0.45" />
            <circle cx="275" cy="158" r="1.5" fill="#2dd4bf" opacity="0.35" />
            <circle cx="292" cy="32"  r="1"   fill="#99f6e4" opacity="0.4"  />
          </svg>

          {/* WT20 badge */}
          <div className="absolute top-2 left-2">
            <span className="text-[9px] bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              WT20 WC
            </span>
          </div>

          {/* ICC Rank badge */}
          <div className="absolute top-2 right-2">
            <span className="text-[9px] bg-black/60 backdrop-blur-sm text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full font-medium">
              #{club.icc_ranking} ICC
            </span>
          </div>

          {/* W / L / T pills */}
          <div className="absolute bottom-10 left-3 flex gap-1.5">
            <span className="text-[9px] bg-teal-900/70 border border-teal-500/30 text-teal-300 px-1.5 py-0.5 rounded font-bold">{club.won}W</span>
            <span className="text-[9px] bg-red-900/70  border border-red-500/30  text-red-300  px-1.5 py-0.5 rounded font-bold">{club.lost}L</span>
            {club.tied_so > 0 && (
              <span className="text-[9px] bg-yellow-900/70 border border-yellow-500/30 text-yellow-300 px-1.5 py-0.5 rounded font-bold">{club.tied_so}T</span>
            )}
          </div>

          {/* Name + meta overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 py-3">
            <p className="text-white font-bold text-sm leading-tight">{club.country}</p>
            <p className="text-teal-200/90 text-[10px] font-medium">{club.apps} WT20 apps · {club.matches} matches</p>
          </div>
        </div>
      </Link>

      {/* Country name */}
      <Link href={href}>
        <div className="px-3 pt-2 pb-1">
          <h4 className="font-semibold text-white text-sm leading-snug">{club.country}</h4>
        </div>
      </Link>

      {/* Recent form */}
      {club.recent_form && (
        <div className="px-3 pb-1 flex items-center gap-2">
          <span className="text-[10px] text-gray-500 shrink-0">Form</span>
          <FormStrip form={club.recent_form} />
        </div>
      )}

      {/* Category tags */}
      <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
        {categories.map((cat, i) => (
          <span key={i} className="border border-white/8 text-gray-300 text-[10px] px-2 py-0.5 rounded-xl bg-white/5">
            {cat}
          </span>
        ))}
        {winPct > 0 && (
          <span className="border border-teal-400/30 text-teal-200 text-[10px] px-2 py-0.5 rounded-xl bg-teal-500/8">
            {winPct}% win rate
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

function WT20ClubCardSkeleton() {
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

export default function WT20Club360CardsSection() {
  const [clubs, setClubs]             = useState<WT20Club[]>([]);
  const [loading, setLoading]         = useState(true);
  const [hasMore, setHasMore]         = useState(false);
  const [nextCursor, setNextCursor]   = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const hasFetched                    = useRef(false);

  const fetchClubs = useCallback(async (cursor?: string | null) => {
    const isLoadMore = Boolean(cursor);
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({ limit: "20" });
      if (cursor) params.set("after", cursor);

      const res = await axios.get<WT20ClubListApiResponse>(`/api/wt20-clubs?${params}`);

      if (res.data.success) {
        const incoming = res.data.data ?? [];
        const nc       = res.data.nextCursor ?? null;
        setClubs((prev) => (isLoadMore ? [...prev, ...incoming] : incoming));
        setNextCursor(nc);
        setHasMore(Boolean(nc));
      }
    } catch (err) {
      console.error("Failed to fetch WT20 clubs:", err);
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

  if (loading) return <WT20ClubCardSkeleton />;

  return (
    <div className="w-full py-4">
      {/* Header */}
      <div className="flex items-center justify-between lg:justify-start lg:gap-4 gap-3 mb-4">
        <h1 className="text-[18px] sm:text-[20px] font-semibold text-white whitespace-nowrap">
          WT20 Clubs 360
        </h1>

        <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-1.5 w-[160px] sm:w-[200px] md:w-[240px] focus-within:border-teal-400/70 transition">
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

      {/* Cards row */}
      <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory pb-4">
        {filtered.length > 0 ? (
          filtered.map((club) => (
            <WT20ClubCard key={club.club_id} club={club} />
          ))
        ) : (
          <div className="w-full text-center py-10">
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? `No clubs found matching '${searchTerm}'.`
                : "No WT20 clubs available."}
            </p>
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loadingMore && (
        <button
          onClick={() => fetchClubs(nextCursor)}
          className="mt-2 text-xs text-teal-400 underline underline-offset-2 hover:text-teal-300 transition-colors"
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