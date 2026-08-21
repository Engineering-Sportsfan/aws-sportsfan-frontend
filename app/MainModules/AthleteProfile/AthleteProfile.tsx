"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Award,
  Share2,
  Users,
  BarChart3,
  Play,
  Heart,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Volume2,
  Video,
  FileText,
  TrendingUp,
  MapPin,
  Calendar,
  User,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getAthleteProfile,
  type AthleteProfile as AthleteProfileData,
} from "@/services/newAthlete.service";

// Fallback trend data shown when API data has no performanceTrend
const FALLBACK_TREND = [
  { year: "2021", distance: 87.58 },
  { year: "2022", distance: 88.13 },
  { year: "2023", distance: 88.17 },
  { year: "2024", distance: 89.45 },
  { year: "2025", distance: 90.23 },
  { year: "2026", distance: 88.94 },
];

interface Props {
  athleteId?: string;
  isClub?: boolean;
}

export default function AthleteProfile({ athleteId, isClub }: Props) {
  const [activeTab, setActiveTab] = useState<"drops" | "posts">("drops");
  const [isFollowing, setIsFollowing] = useState(false);
  const [cheerCount, setCheerCount] = useState(0);
  const [isCheered, setIsCheered] = useState(false);
  const [athlete, setAthlete] = useState<AthleteProfileData | null>(null);
  const [loading, setLoading] = useState(!!athleteId);
  const [error, setError] = useState<string | null>(null);
  const [cricketStatTab, setCricketStatTab] = useState<"batting" | "bowling">("batting");

  useEffect(() => {
    if (athlete) {
      const bStats = (athlete as any)?.analytics?.battingStats;
      const bowlStats = (athlete as any)?.analytics?.bowlingStats;
      if (!bStats && bowlStats) {
        setCricketStatTab("bowling");
      }
    }
  }, [athlete]);

  // Carousel refs
  const hubScrollRef = useRef<HTMLDivElement>(null);
  const medalScrollRef = useRef<HTMLDivElement>(null);
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const [isWelcomeVideoPlaying, setIsWelcomeVideoPlaying] = useState(false);
  const [showYouTubeEmbed, setShowYouTubeEmbed] = useState(false);

  useEffect(() => {
    if (!athleteId) return;
    setLoading(true);
    setError(null);
    getAthleteProfile(athleteId, isClub)
      .then((data) => {
        setAthlete(data);
        setCheerCount(data.fanImpactScore ?? 0);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [athleteId, isClub]);
  console.log("athleteData:", athlete);
  const scroll = useCallback((ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (!ref.current) return;
    const scrollAmount = 200;
    ref.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleCheer = () => {
    if (isCheered) {
      setCheerCount((prev) => prev - 1);
    } else {
      setCheerCount((prev) => prev + 1);
    }
    setIsCheered(!isCheered);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      const athleteName = athlete?.coreInfo?.name || "Athlete";
      const shareTitle = `${athleteName} Profile | Sportsfan360`;

      if (navigator.share) {
        navigator.share({
          title: shareTitle,
          text: `Check out the official athlete profile of ${athleteName} on Sportsfan360!`,
          url: shareUrl,
        }).catch((err) => console.log("Share failed:", err));
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert("Profile link copied to clipboard!");
      }
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-[#FF0055] mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="text-center space-y-3">
          <span className="text-4xl">⚠️</span>
          <p className="text-red-400 font-bold">{error}</p>
          <p className="text-gray-500 text-xs">Could not load athlete profile.</p>
        </div>
      </div>
    );
  }

  // ── Map actual DynamoDB nested paths to display values ───────────────────
  // Data shape: { coreInfo:{}, performance:{medalCabinet,stats,primaryEvent}, analytics:{} }

  const core = (athlete as any)?.coreInfo ?? {};
  const perf = (athlete as any)?.performance ?? {};
  const perfStats = perf?.stats ?? {};
  const analyticsData = (athlete as any)?.analytics ?? {};
  // console.log("core.welcomeVideoUrl: ", athlete?.coreInfo?.welcomeVideoUrl);

  // Welcome video — field lives on the top-level athlete object (not inside coreInfo)
  const welcomeVideoUrl: string | undefined =
    (athlete as any)?.welcomeVideoUrl ??
    core?.welcomeVideoUrl ??
    undefined;
  console.log("[WelcomeVideo] resolved URL:", welcomeVideoUrl);

  // ── YouTube helpers ─────────────────────────────────────────────────────
  const extractYouTubeId = (url: string): string | null => {
    try {
      // Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/shorts/ID
      const u = new URL(url);
      if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
      if (u.hostname.includes("youtube.com")) {
        return (
          u.searchParams.get("v") ||
          u.pathname.split("/").find((s, i, arr) =>
            (arr[i - 1] === "embed" || arr[i - 1] === "shorts") && s
          ) ||
          null
        );
      }
    } catch { }
    return null;
  };

  const youTubeId = welcomeVideoUrl ? extractYouTubeId(welcomeVideoUrl) : null;
  const isYouTube = !!youTubeId;
  const youTubeThumbnail = youTubeId
    ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`
    : null;

  // Core identity
  const name = core.name ?? (athlete as any)?.name ?? "Athlete Profile";
  const sport = perf.primaryEvent ?? analyticsData.sport ?? (athlete as any)?.sport ?? "";
  const sportId = athlete?.sportId ?? (athlete as any)?.coreInfo?.sportId ?? "";
  const isCricket = sportId === "cricket" || String(sport).toLowerCase().includes("cricket");
  const country = core.country ?? (athlete as any)?.country ?? "";
  const profileImage: string | null = core.profileImage
    ?? (athlete as any)?.profileImage
    ?? null;
  // Initials: first letter of first word + first letter of last word
  const nameInitials = (() => {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  })();
  const coverImage = core.coverImage ?? (athlete as any)?.coverImage;
  const isVerified = core.isVerified ?? (athlete as any)?.isVerified ?? true; // athletes are verified by default
  const worldRank = analyticsData?.stats?.worldRank ?? (athlete as any)?.worldRank;
  const fanCount = (athlete as any)?.fanCount ?? "–";
  const fanImpactScore = (athlete as any)?.fanImpactScore ?? 0;
  const fanImpactChange = (athlete as any)?.fanImpactChange ?? 0;

  const resolvedIsClub = !!(
    isClub ||
    athlete?.entityId?.startsWith("CLUB#") ||
    core?.role === "Club / Team"
  );

  // Age from dob
  const dobAge = (() => {
    const dob = core.dob ?? (athlete as any)?.dob;
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  })();

  // Medal cabinet from performance.medalCabinet[]{category, medal, event}
  const medalIconMap: Record<string, string> = {
    GOLD: "🥇", SILVER: "🥈", BRONZE: "🥉",
    gold: "🥇", silver: "🥈", bronze: "🥉",
  };
  const medalColorMap: Record<string, { color: string; text: string }> = {
    GOLD: { color: "from-yellow-400/20 to-amber-500/20", text: "text-yellow-400" },
    SILVER: { color: "from-slate-300/20 to-zinc-400/20", text: "text-slate-300" },
    BRONZE: { color: "from-amber-700/20 to-orange-800/20", text: "text-amber-600" },
    gold: { color: "from-yellow-400/20 to-amber-500/20", text: "text-yellow-400" },
    silver: { color: "from-slate-300/20 to-zinc-400/20", text: "text-slate-300" },
    bronze: { color: "from-amber-700/20 to-orange-800/20", text: "text-amber-600" },
  };
  const rawMedalCabinet: Array<{ category: string; medal: string; event?: string; year?: string }> =
    perf.medalCabinet ?? (athlete as any)?.medals ?? [];
  const medals = rawMedalCabinet.map((m) => ({
    title: m.category ?? "",
    year: m.year ?? "",
    icon: medalIconMap[m.medal] ?? "🏅",
    color: (medalColorMap[m.medal] ?? medalColorMap["GOLD"]).color,
    text: (medalColorMap[m.medal] ?? medalColorMap["GOLD"]).text,
  }));

  // Achievements from medal cabinet (unique category + medal combos)
  const achievements: string[] = rawMedalCabinet
    .filter((m) => m.medal === "GOLD" || m.medal === "gold")
    .slice(0, 4)
    .map((m) => m.category ?? "");

  // Performance trend — primary: record_highlight.progressData, fallback: analytics.seasonalData
  const recordHighlight = (athlete as any)?.record_highlight ?? {};
  const progressData: Array<{ year: string; value: number }> =
    recordHighlight.progressData ?? [];

  const rawSeasonalData: Array<{ year: string; value: number }> =
    analyticsData.seasonalData ?? (athlete as any)?.performanceTrend ?? [];

  const battingStats = (athlete as any)?.analytics?.battingStats ?? null;
  const bowlingStats = (athlete as any)?.analytics?.bowlingStats ?? null;

  const trendKey = isCricket ? (bowlingStats && !battingStats ? "Wickets" : "Runs") : "distance";

  // Build trendData: handle duplicate years by labeling them as attempts
  const buildTrendData = (raw: Array<{ year: string; value: number }>) => {
    const sorted = [...raw].sort((a, b) => String(a.year).localeCompare(String(b.year)));
    const yearCount: Record<string, number> = {};
    const yearIdx: Record<string, number> = {};
    sorted.forEach((d) => { yearCount[d.year] = (yearCount[d.year] ?? 0) + 1; });
    return sorted.map((d) => {
      const yr = String(d.year);
      if (yearCount[yr] > 1) {
        yearIdx[yr] = (yearIdx[yr] ?? 0) + 1;
        return { year: `${yr} #${yearIdx[yr]}`, [trendKey]: d.value };
      }
      return { year: yr, [trendKey]: d.value };
    });
  };

  const trendData =
    progressData.length > 0
      ? buildTrendData(progressData)
      : rawSeasonalData.length > 0
        ? buildTrendData(rawSeasonalData)
        : isCricket
          ? (bowlingStats && !battingStats
            ? [
              { year: "2021", Wickets: 18 },
              { year: "2022", Wickets: 25 },
              { year: "2023", Wickets: 30 },
              { year: "2024", Wickets: 42 },
              { year: "2025", Wickets: 35 },
              { year: "2026", Wickets: 48 },
            ]
            : [
              { year: "2021", Runs: 450 },
              { year: "2022", Runs: 680 },
              { year: "2023", Runs: 890 },
              { year: "2024", Runs: 1120 },
              { year: "2025", Runs: 950 },
              { year: "2026", Runs: 1250 },
            ])
          : FALLBACK_TREND;

  // Dynamic Y-axis domain with ~5% padding
  const trendValues = trendData.map((d) => (d as any)[trendKey]);
  const trendMin = trendValues.length > 0 ? Math.min(...trendValues) : 0;
  const trendMax = trendValues.length > 0 ? Math.max(...trendValues) : 10;
  const trendPad = Math.max((trendMax - trendMin) * 0.15, 0.5);
  const yDomain: [number, number] = [Math.floor((trendMin - trendPad) * 10) / 10, Math.ceil((trendMax + trendPad) * 10) / 10];

  // Season stats from analytics - medalData (array of seasons, pick current year)
  const medalDataArray: Array<Record<string, any>> = Array.isArray(analyticsData.medalData)
    ? analyticsData.medalData
    : analyticsData.medalData
      ? [analyticsData.medalData]
      : [];
  const currentYear = String(new Date().getFullYear());
  const currentMedalData =
    medalDataArray.find((s) => String(s.year) === currentYear) ??
    medalDataArray[medalDataArray.length - 1] ??
    null;
  // console.log("currentMedalData", currentMedalData);
  const season = currentMedalData
    ? {
      events: currentMedalData.events ?? "–",
      gold: currentMedalData.gold ?? "–",
      silver: currentMedalData.silver ?? "–",
      bronze: currentMedalData.bronze ?? "–",
      seasonBest: currentMedalData.seasonBest ?? perfStats.seasonBest ?? "–",
      averageThrow: currentMedalData.averageThrow ?? "–",
      currentStreak: currentMedalData.currentStreak ?? "–",
      year: currentMedalData.year ?? "–",
    }
    : {
      events: "–", gold: "–", silver: "–", bronze: "–",
      seasonBest: perfStats.seasonBest ?? analyticsData.heroStat ?? "–",
      averageThrow: perfStats.personalBest ?? analyticsData.afterCoach ?? "–",
      currentStreak: "–",
      year: "–",
    };

  // Quick Facts
  const quickFacts = resolvedIsClub
    ? [
        {
          label: "Captain",
          val: core.captain ?? (athlete as any)?.captain ?? "–",
          icon: <User className="w-4 h-4 text-orange-400" />,
        },
        {
          label: "Season Best",
          val: season?.seasonBest ?? "–",
          icon: <Award className="w-4 h-4 text-[#FFD700]" />,
        },
        {
          label: "Season Average",
          val: season?.averageThrow ?? "–",
          icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
        },
        {
          label: "Birthplace",
          val: core.birthplace ?? core.birthPlace ?? (athlete as any)?.birthplace ?? "–",
          icon: <MapPin className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Active Since",
          val: core.yearsActiveSince ? `${core.yearsActiveSince}` : (core.hand ?? "–"),
          icon: <Calendar className="w-4 h-4 text-cyan-400" />,
        },
        {
          label: "Coach",
          val: core.coachName ?? core.coach ?? (athlete as any)?.coach ?? "–",
          icon: <Award className="w-4 h-4 text-[#FFD700]" />,
        },
      ]
    : isCricket
      ? [
        {
          label: "Age",
          val: dobAge ? `${dobAge} yrs` : (core.age ? `${core.age}` : "–"),
          icon: <User className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Role",
          val: core.role ?? "–",
          icon: <Award className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Batting Style",
          val: core.battingStyle ?? "–",
          icon: <Zap className="w-4 h-4 text-orange-400" />,
        },
        {
          label: "Bowling Style",
          val: core.bowlingStyle ?? "–",
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
        },
        {
          label: "Captain",
          val: core.isCaptain ? "Yes" : "No",
          icon: <User className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Test Caps",
          val: core.testCaps ?? "–",
          icon: <Award className="w-4 h-4 text-[#FFD700]" />,
        },
        {
          label: "Format",
          val: athlete?.format ?? "–",
          icon: <Calendar className="w-4 h-4 text-cyan-400" />,
        },
      ]
    : [
        {
          label: "Age",
          val: dobAge ? `${dobAge} yrs` : (core.age ? `${core.age}` : "–"),
          icon: <User className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Height",
          val: core.heightCm ? `${core.heightCm} cm` : (core.height ?? "–"),
          icon: <TrendingUp className="w-4 h-4 text-orange-400" />,
        },
        {
          label: "Weight",
          val: core.weightKg ? `${core.weightKg} kg` : (core.weight ?? "–"),
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
        },
        {
          label: "Birthplace",
          val: core.birthplace ?? core.birthPlace ?? (athlete as any)?.birthplace ?? "–",
          icon: <MapPin className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Active Since",
          val: core.yearsActiveSince ? `${core.yearsActiveSince}` : (core.hand ?? "–"),
          icon: <Calendar className="w-4 h-4 text-cyan-400" />,
        },
        {
          label: "Coach",
          val: core.coachName ?? core.coach ?? (athlete as any)?.coach ?? "–",
          icon: <Award className="w-4 h-4 text-[#FFD700]" />,
        },
      ];

  const defaultHeadToHead = [
    { opponent: 'Sri Lanka', played: 46, won: 22, drawn: 17, lost: 7, lastResult: 'India won by 91 runs', lastMet: 'August 2026' },
    { opponent: 'Australia', played: 112, won: 45, drawn: 30, lost: 37, lastResult: 'Australia won by 10 wickets', lastMet: 'November 2024' },
    { opponent: 'England', played: 141, won: 37, drawn: 53, lost: 51, lastResult: 'India won by an innings and 64 runs', lastMet: 'March 2024' },
    { opponent: 'South Africa', played: 44, won: 16, drawn: 10, lost: 18, lastResult: 'India won by 7 wickets', lastMet: 'January 2024' }
  ];

  const headToHead = (athlete?.headToHeadData && athlete.headToHeadData.length > 0)
    ? athlete.headToHeadData
    : (resolvedIsClub ? defaultHeadToHead : []);

  // Athlete hub config
  const hubItems = [
    { title: "VOD & Interviews", badge: `${(athlete as any)?.vodCount ?? 0}`, icon: "📹", color: "from-pink-500/10 to-red-500/10" },
    { title: "AMS Sessions", badge: `${(athlete as any)?.amsCount ?? 0}`, icon: "🎙️", color: "from-purple-500/10 to-indigo-500/10" },
    { title: "Bookings", badge: `${(athlete as any)?.bookingCount ?? 0}`, icon: "📅", color: "from-blue-500/10 to-cyan-500/10" },
    { title: "Store", badge: `${(athlete as any)?.storeCount ?? 0}`, icon: "🛍️", color: "from-emerald-500/10 to-teal-500/10" },
    { title: "Auctions", badge: `${(athlete as any)?.auctionCount ?? 0}`, icon: "🔨", color: "from-amber-500/10 to-orange-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#08080c] text-white font-sans overflow-y-auto no-scrollbar pb-10">
      {/* Hide scrollbar CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}} />

      {/* Hero Header Area */}
      <div className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] overflow-hidden">
        {/* Cover Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: coverImage
              ? `linear-gradient(to bottom, rgba(8,8,12,0.4), #08080c), url('${coverImage}')`
              : `linear-gradient(to bottom, rgba(8,8,12,0.4), #08080c), url('/images/stadium-bg.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-black/50" />

        {/* Top Navbar overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 md:px-8">
          <div className="flex flex-col">
            <span className="text-[18px] md:text-[24px] font-black tracking-tight text-white flex items-center gap-1">
              SportsFan<span className="text-[#FF7A00]">360</span>
            </span>
            <span className="text-[10px] text-gray-400 -mt-1 font-medium tracking-wide">
              Where fans play...
            </span>
          </div>
        </div>

        {/* Athlete Name & Profile Circle */}
        <div className="absolute bottom-3 left-0 right-0 px-4 md:px-8">
          {/* Row 1: Avatar + Name info */}
          <div className="flex items-end gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-[72px] h-[72px] sm:w-[90px] sm:h-[90px] md:w-[120px] md:h-[120px] rounded-full p-[2.5px] bg-gradient-to-r from-[#FF7A00] to-[#FF0055] shadow-lg shadow-[#FF7A00]/20">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a2e] flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span
                      className="text-[22px] sm:text-[28px] md:text-[34px] font-black tracking-tight select-none"
                      style={{ background: 'linear-gradient(135deg, #FF7A00, #FF0055)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      {nameInitials}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-pink-500 rounded-full flex items-center justify-center border-2 border-[#08080c]">
                <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
              </div>
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-orange-500/40 rounded-full px-2 py-0.5 mb-1">
                <Award className="w-2.5 h-2.5 text-[#FFD700]" />
                <span className="text-[8px] sm:text-[9px] uppercase font-bold text-orange-400 tracking-wider">Verified Athlete</span>
              </div>
              <h1 className="text-lg sm:text-2xl md:text-4xl font-extrabold flex items-center gap-1.5 tracking-tight leading-tight truncate">
                <span className="truncate">{name}</span>
                {isVerified && (
                  <span className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-[#FF0055] rounded-full inline-flex items-center justify-center text-[9px] sm:text-[10px] text-white">
                    ✓
                  </span>
                )}
              </h1>
              {(country || sport) && (
                <p className="text-[10px] sm:text-xs text-gray-300 font-medium mt-0.5 truncate">
                  {[country, sport].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>

            {/* Fans count — desktop only */}
            <div className="hidden md:flex flex-col items-end shrink-0">
              <span className="block text-2xl font-black text-white leading-none">{fanCount}</span>
              <span className="text-[11px] text-gray-400 font-medium">Fans</span>
            </div>
          </div>

          {/* Row 2: badges + action buttons */}
          <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
            {/* Achievement badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {worldRank != null && (
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/5">
                  <span className="text-[9px] text-orange-400 font-semibold">World Rank</span>
                  <span className="text-[10px] text-white font-bold">#{worldRank}</span>
                </div>
              )}
              {achievements.slice(0, 2).map((ach, i) => (
                <div key={i} className="hidden sm:flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/5">
                  <span className="text-[9px] text-yellow-400 font-semibold">🏆 {ach}</span>
                </div>
              ))}
              {/* Mobile fans count */}
              <div className="flex md:hidden items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/5">
                <span className="text-[9px] text-gray-300 font-semibold">{fanCount} Fans</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 sm:px-5 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${isFollowing
                    ? "bg-gray-800 text-gray-300 border border-gray-700"
                    : "bg-gradient-to-r from-[#FF0055] to-[#FF4500] text-white"
                  }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>

              <button
                onClick={handleCheer}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1 border transition-all active:scale-95 ${isCheered
                    ? "bg-red-500/20 border-red-500 text-red-500"
                    : "border-[#FF0055] text-white hover:bg-[#FF0055]/10"
                  }`}
              >
                <span>Cheer</span>
                <Heart className={`w-3 h-3 fill-current ${isCheered ? "text-red-500" : "text-gray-300"}`} />
              </button>

              {/* Extracted Share Button */}
              <button
                onClick={handleShare} // Add your custom share function here
                className="px-3 sm:px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-blue-400 hover:text-white transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-gray-300 group-hover:text-white">Share</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 mt-4 md:mt-8 space-y-4 md:space-y-6">
        {/* Interactive Quick Links Menu */}
        {/* <div className="grid grid-cols-5 gap-2 bg-[#12121e]/80 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
          {[
            { label: "Ask Dolly", icon: "🐬", color: "from-[#00F0FF] to-[#0072FF]" },
            { label: "Fan Club", icon: <Users className="w-5 h-5 text-pink-400" />, color: "from-pink-500/20 to-purple-500/20" },
            { label: "Compare", icon: <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 text-sm">VS</span>, color: "from-red-500/20 to-amber-500/20" },
            { label: "Stats", icon: <BarChart3 className="w-5 h-5 text-emerald-400" />, color: "from-emerald-500/20 to-teal-500/20" },
            { label: "Share", icon: <Share2 className="w-5 h-5 text-blue-400" />, color: "from-blue-500/20 to-indigo-500/20" },
          ].map((item, idx) => (
            <button
              key={idx}
              className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-all group active:scale-95"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${item.color} border border-white/10 mb-2 group-hover:scale-110 transition-transform`}>
                {typeof item.icon === "string" ? <span className="text-xl">{item.icon}</span> : item.icon}
              </div>
              <span className="text-[10px] md:text-xs font-semibold text-gray-300 group-hover:text-white transition-colors text-center truncate w-full">
                {item.label}
              </span>
            </button>
          ))}
        </div> */}

        {/* Welcome Message Card */}
        <div className="bg-[#12121e]/80 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 backdrop-blur-md">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 md:gap-6 items-center">

            {/* Video Player - Order 1 on mobile, 2 on desktop */}
            <div className="w-full lg:col-span-7 xl:col-span-8 order-1 lg:order-2 relative rounded-xl md:rounded-2xl overflow-hidden aspect-video group border border-white/10 shadow-2xl bg-black/40">
              {welcomeVideoUrl ? (
                isYouTube ? (
                  // ── YouTube embed ──────────────────────────────────────────
                  showYouTubeEmbed ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0&modestbranding=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${name} Welcome Message`}
                    />
                  ) : (
                      // Show HQ thumbnail + play overlay until user clicks
                      <div
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => setShowYouTubeEmbed(true)}
                      >
                        <img
                          src={youTubeThumbnail ?? "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600"}
                          alt={`${name} Welcome Message`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Premium Glassmorphic Play Overlay */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border border-white/20">
                            <Play className="w-6 h-6 md:w-7 md:h-7 text-white fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                  )
                ) : (
                  // ── Native video (non-YouTube URL) ─────────────────────────
                    <div className="relative w-full h-full">
                      <video
                        ref={welcomeVideoRef}
                        src={welcomeVideoUrl}
                        className="w-full h-full object-cover"
                        playsInline
                        controls
                        onEnded={() => setIsWelcomeVideoPlaying(false)}
                        onPause={() => setIsWelcomeVideoPlaying(false)}
                        onPlay={() => setIsWelcomeVideoPlaying(true)}
                        onError={(e) => console.error("[WelcomeVideo] load error", e)}
                      />
                      {!isWelcomeVideoPlaying && (
                        <div
                          className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                          onClick={() => {
                            welcomeVideoRef.current?.play()
                              .then(() => setIsWelcomeVideoPlaying(true))
                              .catch(() => { });
                          }}
                        >
                          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-xl">
                            <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                          </div>
                        </div>
                      )}
                    </div>
                )
              ) : (
                // ── No video URL fallback ──────────────────────────────────
                  <div className="relative w-full h-full">
                    <img
                      src={athlete?.welcomeVideoThumbnail ?? "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600"}
                      alt={`${name} Fan Message`}
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-gray-300">
                        Video coming soon
                      </div>
                    </div>
                </div>
              )}

              {/* Modern Top-Right Stats Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/10 tracking-wide text-gray-200 shadow-lg">
                <span className="flex items-center gap-0.5">❤️ <span className="text-gray-300 font-medium">12.4K</span></span>
                <span className="w-px h-2.5 bg-white/20"></span>
                <span className="flex items-center gap-0.5">💬 <span className="text-gray-300 font-medium">832</span></span>
              </div>

              {/* Bottom Quote Banner (Hidden if video plays) */}
              {athlete?.welcomeVideoQuote && (!isYouTube ? !isWelcomeVideoPlaying : !showYouTubeEmbed) && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] md:text-xs text-white bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg">
                  <span className="font-medium italic line-clamp-1">"{athlete.welcomeVideoQuote}"</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0 ml-4">
                    - {name ? name.split(" ")[0] : "Athlete"}
                  </span>
                </div>
              )}
            </div>

            {/* Title / Description - Order 2 on mobile, 1 on desktop */}
            <div className="w-full lg:col-span-5 xl:col-span-4 space-y-3.5 order-2 lg:order-1 text-center lg:text-left px-1 md:px-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full mx-auto lg:mx-0">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-black tracking-widest text-pink-400">Welcome Message</span>
              </div>

              <h4 className="text-sm font-black tracking-tight leading-snug text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 drop-shadow-sm">
                {athlete?.welcomeMessage ?? `A special video message from ${name} to the fans!`}
              </h4>

              {/* Main Call To Action Trigger */}
              {welcomeVideoUrl && (!isYouTube ? !isWelcomeVideoPlaying : !showYouTubeEmbed) && (
              <button
                  className="flex items-center gap-2 bg-gradient-to-r from-[#FF0055] to-[#FF4500] hover:from-[#ff1a66] hover:to-[#ff5714] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-xl active:scale-95 transition-all w-full sm:w-max justify-center mx-auto lg:mx-0 text-white"
                  onClick={() => {
                    if (isYouTube) {
                      setShowYouTubeEmbed(true);
                    } else {
                      welcomeVideoRef.current?.play()
                        .then(() => setIsWelcomeVideoPlaying(true))
                        .catch((err) => console.error("[WelcomeVideo] play error:", err));
                    }
                  }}
              >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Watch Now
              </button>
              )}
            </div>

          </div>
        </div>

        {/* Quick Facts & Fan Power */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Facts */}
          <div className="lg:col-span-8 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🏥</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Quick Facts</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {quickFacts.map((fact, idx) => (
                <div key={idx} className="bg-black/35 rounded-2xl p-3 border border-white/5 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 shrink-0 mt-0.5">{fact.icon}</div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-gray-500 font-semibold uppercase">{fact.label}</span>
                    <span className="block text-xs font-bold text-white truncate">{fact.val}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements Badges */}
            {achievements.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/5">
                {achievements.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    🥇 {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Fan Power Card */}
          <div className="lg:col-span-4 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">😈</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Fan Power</h3>
                </div>
                <span className="w-5.5 h-5.5 rounded-full bg-white/5 inline-flex items-center justify-center text-xs text-gray-400 font-bold hover:bg-white/10 cursor-pointer">
                  i
                </span>
              </div>

              {/* Radial Progress Graphic */}
              <div className="relative flex flex-col items-center justify-center my-6">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="url(#fanPowerGrad)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={376.8}
                    strokeDashoffset={376.8 * (1 - Math.min(fanImpactScore, 100) / 100)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="fanPowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF0055" />
                      <stop offset="100%" stopColor="#FF7A00" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Score overlay */}
                <div className="absolute text-center">
                  <span className="block text-3xl font-black text-white leading-none">{fanImpactScore}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">/ 100</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <span className="block text-xs font-semibold text-gray-300">Fan Impact Score</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                {fanImpactChange >= 0 ? "▲" : "▼"} {Math.abs(fanImpactChange)}%{" "}
                <span className="text-gray-400 font-medium text-[10px]">this month</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2026 Season & Performance Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 2026 Season */}
          {!resolvedIsClub && (
            <div className="lg:col-span-5 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">2026 Season</h3>
                  <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isCricket ? (
                  <div>
                    {/* Tab selector for Batting/Bowling if both exist */}
                    {battingStats && bowlingStats && (
                      <div className="flex gap-2 mb-3 bg-black/30 p-1 rounded-xl border border-white/5">
                        <button
                          onClick={() => setCricketStatTab("batting")}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${cricketStatTab === "batting" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white"
                            }`}
                        >
                          Batting
                        </button>
                        <button
                          onClick={() => setCricketStatTab("bowling")}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${cricketStatTab === "bowling" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white"
                            }`}
                        >
                          Bowling
                        </button>
                      </div>
                    )}

                    {/* Batting Stats view */}
                    {(!bowlingStats || cricketStatTab === "batting") && battingStats && (
                      <div>
                        <div className="grid grid-cols-3 gap-2 mb-4 bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
                          <div>
                            <span className="block text-[10px] text-gray-400 font-medium">Matches</span>
                            <span className="text-base font-black text-white">{battingStats.matches ?? "–"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 font-medium">Runs</span>
                            <span className="text-base font-black text-white">{battingStats.runs ?? "–"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 font-medium">Average</span>
                            <span className="text-base font-black text-pink-400">{battingStats.avg ?? battingStats.average ?? "–"}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-semibold text-gray-300">Strike Rate</span>
                            <span className="text-xs font-bold text-white">{battingStats.sr ?? battingStats.strikeRate ?? "–"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-semibold text-gray-300">Highest Score</span>
                            <span className="text-xs font-bold text-white">{battingStats.hs ?? battingStats.highestScore ?? "–"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-semibold text-gray-300">100s / 50s</span>
                            <span className="text-xs font-bold text-white">
                              {battingStats.hundreds ?? 0} / {battingStats.fifties ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bowling Stats view */}
                    {(!battingStats || cricketStatTab === "bowling") && bowlingStats && (
                      <div>
                        <div className="grid grid-cols-3 gap-2 mb-4 bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
                          <div>
                            <span className="block text-[10px] text-gray-400 font-medium">Matches</span>
                            <span className="text-base font-black text-white">{bowlingStats.matches ?? "–"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 font-medium">Wickets</span>
                            <span className="text-base font-black text-white">{bowlingStats.wickets ?? "–"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 font-medium">Average</span>
                            <span className="text-base font-black text-pink-400">{bowlingStats.avg ?? bowlingStats.average ?? "–"}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-semibold text-gray-300">Economy</span>
                            <span className="text-xs font-bold text-white">{bowlingStats.econ ?? bowlingStats.economy ?? "–"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-semibold text-gray-300">Best Bowling (BBI)</span>
                            <span className="text-xs font-bold text-white">{bowlingStats.bbi ?? bowlingStats.bestBowling ?? "–"}</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-semibold text-gray-300">5W Hauls</span>
                            <span className="text-xs font-bold text-white">{bowlingStats.fiveW ?? bowlingStats.fiveWHauls ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                      {/* Main dashboard list */}
                      <div className="grid grid-cols-4 gap-2 mb-4 bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
                        <div>
                          <span className="block text-[10px] text-gray-400 font-medium">Events</span>
                          <span className="text-lg font-black text-white">{season?.events ?? "–"}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-400 font-medium">Gold</span>
                          <span className="text-lg font-black text-yellow-400">{season?.gold ?? "–"}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-400 font-medium">Silver</span>
                          <span className="text-lg font-black text-gray-300">{season?.silver ?? "–"}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-400 font-medium">Bronze</span>
                          <span className="text-lg font-black text-amber-600">{season?.bronze ?? "–"}</span>
                        </div>
                      </div>

                      {/* Extra season metrics */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-xs font-semibold text-gray-300">Season Best</span>
                          <span className="text-xs font-bold text-white">{season?.seasonBest ?? "–"}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-xs font-semibold text-gray-300">Season Average</span>
                          <span className="text-xs font-bold text-white">{season?.averageThrow ?? "–"}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-xs font-semibold text-gray-300">Current Streak</span>
                          <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                            {season?.currentStreak ?? "–"} 🔥
                          </span>
                        </div>
                      </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Performance Trend */}
          <div className={`${resolvedIsClub ? "lg:col-span-12" : "lg:col-span-7"} bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Performance Trend</h3>
              <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-[180px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0055" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF0055" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    stroke="#4B5563"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={yDomain}
                    stroke="#4B5563"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181829",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#FFF",
                    }}
                    labelStyle={{ fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ fontSize: "11px", color: "#FF0055" }}
                  />
                  <Area
                    type="monotone"
                    dataKey={trendKey}
                    stroke="#FF0055"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDistance)"
                    dot={{ fill: "#FF0055", stroke: "#FFF", strokeWidth: 1.5, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Personal Best Progress (meters)
            </div>
          </div>
        </div>

        {/* Head-to-Head Records Section (Clubs only) */}
        {resolvedIsClub && headToHead.length > 0 && (
          <div className="bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🥊</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Head-to-Head Records</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {headToHead.map((item: { opponent: string; played: number; won?: number; drawn?: number; lost?: number; lastResult?: string; lastMet?: string; }, idx: number) => {
                const won = item.won ?? 0;
                const drawn = item.drawn ?? 0;
                const lost = item.lost ?? 0;
                const played = item.played || (won + drawn + lost) || 1;
                
                const winPct = Math.round((won / played) * 100);
                const drawPct = Math.round((drawn / played) * 100);
                const lossPct = 100 - winPct - drawPct;

                const oppInitials = item.opponent
                  ?.trim()
                  .split(/\s+/)
                  .map((w: string) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "OP";

                return (
                  <div key={idx} className="bg-black/35 rounded-2xl p-4 border border-white/5 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7A00]/20 to-[#FF0055]/20 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-black text-orange-400 select-none">{oppInitials}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">{item.opponent}</h4>
                          <span className="text-[10px] text-gray-500 font-semibold uppercase">Opponent</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-base font-black text-white leading-none">{played}</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase">Played</span>
                      </div>
                    </div>

                    {/* Progress Bar Distribution */}
                    <div>
                      <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-white/5 mt-1 border border-white/5">
                        <div style={{ width: `${winPct}%` }} className="bg-emerald-500 h-full" title={`Won: ${won} (${winPct}%)`} />
                        <div style={{ width: `${drawPct}%` }} className="bg-slate-400 h-full" title={`Drawn: ${drawn} (${drawPct}%)`} />
                        <div style={{ width: `${lossPct}%` }} className="bg-red-500 h-full" title={`Lost: ${lost} (${lossPct}%)`} />
                      </div>
                      
                      {/* Legend and stats */}
                      <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          Won: {won} ({winPct}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                          Drawn: {drawn} ({drawPct}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                          Lost: {lost} ({lossPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Last Met & Result Info */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-between pt-2 border-t border-white/5 text-[10px] text-gray-300">
                      {item.lastMet && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Last Met:</span>
                          <span className="font-semibold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">{item.lastMet}</span>
                        </div>
                      )}
                      {item.lastResult && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Result:</span>
                          <span className="font-semibold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/10 line-clamp-1">{item.lastResult}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Neeraj's Corner & Athlete Hub Section */}
        {!resolvedIsClub && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Athlete's Corner */}
          <div className="lg:col-span-6 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">{name.split(" ")[0]}'s Corner</h3>
                <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mb-4 bg-black/40 p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => setActiveTab("drops")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "drops"
                    ? "bg-[#FF0055] text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                    }`}
                >
                  🎁 Drops
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "posts"
                    ? "bg-[#FF0055] text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                    }`}
                >
                  📝 Posts
                </button>
              </div>

              {/* Corner List */}
              <div className="space-y-3">
                {[
                  {
                    title: "Mental Toughness: Neeraj's Mindset",
                    type: "Audio",
                    duration: "15 min",
                    views: "189K",
                    time: "5d ago",
                    icon: <Volume2 className="w-4 h-4 text-pink-400" />,
                    bg: "bg-pink-500/10",
                  },
                  {
                    title: "Training Breakdown: Neeraj Chopra",
                    type: "Video",
                    duration: "10 min",
                    views: "234K",
                    time: "3d ago",
                    icon: <Video className="w-4 h-4 text-orange-400" />,
                    bg: "bg-orange-500/10",
                  },
                  {
                    title: "Neeraj's Competition Strategy",
                    type: "Document",
                    duration: "8 min read",
                    views: "156K",
                    time: "1w ago",
                    icon: <FileText className="w-4 h-4 text-emerald-400" />,
                    bg: "bg-emerald-500/10",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-black/30 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-[#FF0055] transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-medium">
                        <span>{item.duration}</span>
                        <span>•</span>
                        <span>👁️ {item.views}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] text-gray-500">{item.time}</span>
                      <button className="p-1 hover:bg-white/5 rounded-full">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Athlete Hub */}
          <div className="lg:col-span-6 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Athlete Hub</h3>
                <span className="bg-red-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  New
                </span>
              </div>
            </div>

            {/* Scrollable carousel on mobile, grid on sm+ */}
            <div className="relative">
              {/* Left arrow – mobile only */}
              <button
                onClick={() => scroll(hubScrollRef, "left")}
                className="sm:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Right arrow – mobile only */}
              <button
                onClick={() => scroll(hubScrollRef, "right")}
                className="sm:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div
                ref={hubScrollRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible"
              >
                {hubItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.color} border border-white/10 p-5 h-[120px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 hover:border-[#FF0055]/40 snap-start min-w-[160px] shrink-0 sm:min-w-0 sm:shrink`}
                  >
                    {/* Background glow */}
                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl group-hover:bg-[#FF0055]/20 transition-all duration-300" />

                    {/* Badge */}
                    <span className="absolute top-3 right-3 min-w-6 h-6 px-2 flex items-center justify-center rounded-full bg-[#FF0055] text-[10px] font-semibold text-white shadow-lg">
                      {item.badge}
                    </span>

                    <div className="relative flex h-full flex-col justify-between overflow-visible">
                      {/* Icon Wrapper - Uses flex layout instead of padding to keep the 12x12 proportions perfect */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-3xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        {item.icon}
                      </div>

                      {/* Text Content Area */}
                      <div className="mt-4 flex flex-col gap-1">
                        <h4 className="text-sm font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-[#FF0055]">
                          {item.title}
                        </h4>
                        {/* Optional description can safely go here later without breaking layout */}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}


        {/* Medal Cabinet */}
        {!resolvedIsClub && (
          <div className="bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Medal Cabinet</h3>
            <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            {/* Left arrow – mobile only */}
            <button
              onClick={() => scroll(medalScrollRef, "left")}
              className="sm:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Right arrow – mobile only */}
            <button
              onClick={() => scroll(medalScrollRef, "right")}
              className="sm:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div
              ref={medalScrollRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 md:grid-cols-6 sm:overflow-visible"
            >
              {medals.map((medal, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br ${medal.color} border border-white/5 text-center snap-start min-w-[120px] shrink-0 sm:min-w-0 sm:shrink`}
                >
                  <span className="text-2xl mb-1.5">{medal.icon}</span>
                  <span className={`block text-[10px] font-extrabold ${medal.text} leading-tight h-8 flex items-center justify-center`}>
                    {medal.title}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold mt-1">{medal.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
