"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Player {
  id: string;
  name: string;
  team: string;
  avatar: string;
}

interface SpotlightData {
  playersToWatch: Player[];
  impactPlayers: Player[];
  consistentPerformers: Player[];
  updatedAt?: number;
}

interface PlayerProfilePost {
  playerName: string;
  image: string;
}

// ─── Team colours ──────────────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, { primary: string; accent: string }> = {
  RCB:  { primary: "#c8102e", accent: "#ffd700" },
  CSK:  { primary: "#f9cd05", accent: "#0081c8" },
  MI:   { primary: "#004b8d", accent: "#d4af37" },
  KKR:  { primary: "#3a225d", accent: "#f5c518" },
  SRH:  { primary: "#f26522", accent: "#cf460b" },
  RR:   { primary: "#ea1a85", accent: "#254aa5" },
  DC:   { primary: "#0078bc", accent: "#ef1c25" },
  PBKS: { primary: "#ed1b24", accent: "#a7a9ac" },
  GT:   { primary: "#1c2951", accent: "#c8a951" },
  LSG:  { primary: "#a72b5e", accent: "#44b8e0" },
};

function guessTeamFromAvatar(url: string): string {
  const map: Record<string, string> = {
    "/RR/": "RR", "/MI/": "MI", "/CSK/": "CSK", "/KKR/": "KKR",
    "/SRH/": "SRH", "/RCB/": "RCB", "/DC/": "DC", "/PBKS/": "PBKS",
    "/GT/": "GT", "/LSG/": "LSG",
  };
  for (const [key, team] of Object.entries(map)) {
    if (url.includes(key)) return team;
  }
  return "";
}

// ─── Section config ────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    key: "playersToWatch" as const,
    label: "Players to Watch",
    sub: "Rising stars to keep an eye on",
    accentColor: "#e91e8c",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
      </svg>
    ),
  },
  {
    key: "impactPlayers" as const,
    label: "Impact Players",
    sub: "Game changers who make the difference",
    accentColor: "#f97316",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    key: "consistentPerformers" as const,
    label: "Consistent Performers",
    sub: "Reliable performers with consistent records",
    accentColor: "#3b82f6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
];

// ─── Player Card ───────────────────────────────────────────────────────────────

function PlayerCard({ player, accentColor, index }: { player: Player; accentColor: string; index: number }) {
  const teamCode = guessTeamFromAvatar(player.avatar);
  const teamColors = TEAM_COLORS[teamCode];
  const cardBg = teamColors ? teamColors.primary : "#1a1a2e";
  const [imgError, setImgError] = useState(false);
  const [fetchedImg, setFetchedImg] = useState<string | null>(null);

  useEffect(() => {
    if (!player.name) return;
    
    // Fetch real player headshot based on name
    axios.get(`/api/player-profile/home?search=${encodeURIComponent(player.name)}`)
      .then(res => {
        if (res.data.success && res.data.posts?.length > 0) {
          // Find exact or best match
          const posts = res.data.posts as PlayerProfilePost[];
          const match = posts.find((p) => 
            p.playerName.toLowerCase() === player.name.toLowerCase()
          ) || posts[0];
          
          if (match.image) {
            setFetchedImg(match.image);
          }
        }
      })
      .catch(() => {});
  }, [player.name]);

  const displayImg = fetchedImg || player.avatar;

  return (
    <Link
      href={`/MainModules/PlayersProfile?id=${player.id}&tab=highlights`}
      className="flex flex-col items-center gap-2 group cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Arch-shaped player image */}
      <div
        className="relative overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 w-[70px] lg:w-[86px] h-[88px] lg:h-[108px]"
        style={{
          borderRadius: "50% 50% 8px 8px",
          background: `linear-gradient(160deg, ${cardBg}cc, ${cardBg})`,
          boxShadow: `0 8px 32px ${cardBg}66, 0 2px 8px rgba(0,0,0,0.4)`,
          border: `1.5px solid ${accentColor}33`,
        }}
      >
        {/* Glow ring on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            borderRadius: "inherit",
            boxShadow: `inset 0 0 0 1.5px ${accentColor}88`,
          }}
        />

        {/* Subtle gradient overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${cardBg}cc, transparent)`,
          }}
        />

        {/* Player image */}
        {!imgError ? (
          <img
            src={displayImg}
            alt={player.name}
            className="w-full h-full object-cover object-top"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl font-black"
            style={{ color: accentColor + "99" }}
          >
            {player.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <div
          className="text-[9px] lg:text-[11px] font-bold text-white leading-tight tracking-wide line-clamp-2 h-[32px] max-w-[76px] lg:max-w-[90px]"
          title={player.name}
        >
          {player.name}
        </div>
        {/* Team badge */}
        {teamCode && (
          <div
            className="inline-block mt-0.5 text-[9px] font-black tracking-widest uppercase px-1.5 py-[1px] rounded-sm"
            style={{ color: teamColors?.accent || accentColor }}
          >
            {teamCode}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  label, sub, accentColor, icon, players,
}: {
  label: string;
  sub: string;
  accentColor: string;
  icon: React.ReactNode;
  players: Player[];
}) {
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl p-3 lg:p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #111118 0%, #0d0d14 100%)",
        border: `1px solid ${accentColor}22`,
        boxShadow: `0 0 40px ${accentColor}0a`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}30`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className="text-base font-black leading-tight tracking-tight text-[15px] whitespace-nowrap"
            style={{ fontFamily: "'Bebas Neue', 'Anton', sans-serif", letterSpacing: "0.03em", color: "#f0eff4" }}
          >
            {label}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2 lg:line-clamp-none h-[32px] lg:h-auto">{sub}</p>
        </div>
      </div>

      {/* Accent underline on header */}
      <div
        className="mb-5 h-px"
        style={{ background: `linear-gradient(90deg, ${accentColor}33, transparent)` }}
      />

      {/* Players grid */}
      {players.length > 0 ? (
        <div className="grid grid-cols-3 gap-x-1 gap-y-4">
          {players.map((player, i) => (
            <PlayerCard key={player.id} player={player} accentColor={accentColor} index={i} />
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-600 text-xs border border-dashed border-white/5 rounded-xl">
          No players added yet
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SpotlightSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex-1 rounded-2xl p-5 bg-[#111118] border border-white/5 animate-pulse">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/8" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-white/8 rounded" />
              <div className="h-2.5 w-48 bg-white/5 rounded" />
            </div>
          </div>
          <div className="h-px bg-white/5 mb-5" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex flex-col items-center gap-2">
                <div className="w-full aspect-[82/96] rounded-t-full bg-white/8" style={{ borderRadius: "50% 50% 8px 8px" }} />
                <div className="h-2.5 w-16 bg-white/8 rounded" />
                <div className="h-2 w-6 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function IPLSpotlight() {
  const [spotlight, setSpotlight] = useState<SpotlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Calculate index based on scroll position and card width
      // Since cards are 95% wide and snap-center, we can use a simpler approach
      // or check the children offsets.
      const children = scrollRef.current.children;
      if (children.length > 0) {
        let closestIndex = 0;
        let minDiff = Infinity;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement;
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const scrollCenter = scrollLeft + clientWidth / 2;
          const diff = Math.abs(childCenter - scrollCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        }
        setActiveIndex(closestIndex);
      }
    }
  };

  useEffect(() => {
    axios
      .get<{ success: boolean; data: SpotlightData }>("/api/ipl-pulse/spotlight")
      .then((res) => {
        if (res.data.success) setSpotlight(res.data.data);
        else setError("Failed to load spotlight data");
      })
      .catch(() => setError("Failed to load spotlight data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [loading]);

  if (loading) return <SpotlightSkeleton />;

  if (error || !spotlight) {
    return (
      <div className="rounded-2xl bg-[#111118] border border-red-500/20 p-8 text-center">
        <p className="text-red-400 text-sm">{error || "No spotlight data available"}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-xs text-gray-400 underline hover:text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="w-full">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-4">

          <h1 className="text-[20px] text-white font-bold">IPL Spotlight</h1>
        <div className="flex-1 h-px bg-white/8" />
        {spotlight.updatedAt && (
          <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
            Updated {new Date(spotlight.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* Three sections carousel on mobile, row on desktop */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none scrollbar-hide gap-4 pb-2"
      >
        {SECTIONS.map((sec) => (
          <div key={sec.key} className="flex-shrink-0 w-[95%] lg:w-auto lg:flex-1 snap-center">
            <SectionCard
              label={sec.label}
              sub={sec.sub}
              accentColor={sec.accentColor}
              icon={sec.icon}
              players={spotlight[sec.key] ?? []}
            />
          </div>
        ))}
      </div>

      {/* Dots indicator for mobile */}
      <div className="flex justify-center gap-1.5 mt-3 lg:hidden">
        {SECTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              activeIndex === i ? "w-4 bg-white" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
}