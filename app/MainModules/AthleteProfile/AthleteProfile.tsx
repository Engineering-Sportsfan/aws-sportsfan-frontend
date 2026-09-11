"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  Shield,
  Activity,
  Trophy,
  Target,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getAthleteProfile,
  type AthleteProfile as AthleteProfileData,
} from "@/services/newAthlete.service";


interface Props {
  athleteId?: string;
  isClub?: boolean;
}

export default function AthleteProfile({ athleteId, isClub }: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"drops" | "posts">("drops");
  const [isFollowing, setIsFollowing] = useState(false);
  const [cheerCount, setCheerCount] = useState(0);
  const [isCheered, setIsCheered] = useState(false);
  const [athlete, setAthlete] = useState<AthleteProfileData | null>(null);
  const [loading, setLoading] = useState(!!athleteId);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeasonYear, setSelectedSeasonYear] = useState<string>("");

  useEffect(() => {
    if (athlete) {
      const bStats = (athlete as any)?.analytics?.battingStats;
      const bowlStats = (athlete as any)?.analytics?.bowlingStats;
      const role = String((athlete as any)?.coreInfo?.role || (athlete as any)?.role || "").toLowerCase();
      if ((!bStats && bowlStats) || role.includes("bowler")) {
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
      const athleteName = athlete?.coreInfo?.name || athlete?.name || "Athlete";
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
  const core = (athlete as any)?.coreInfo ?? {};
  const perf = (athlete as any)?.performance ?? {};
  const perfStats = perf?.stats ?? (athlete as any)?.stats ?? {};
  const analyticsData = (athlete as any)?.analytics ?? {};

  // Core identity
  const name = core.name ?? (athlete as any)?.name ?? "Athlete Profile";
  const firstName = name.trim().split(/\s+/)[0] || "Athlete";

  // Resolve sport and category
  const rawSportId = String(athlete?.sportId ?? core?.sportId ?? (athlete as any)?.sport ?? "athletics").toLowerCase();
  const rawSport = String(perf.primaryEvent ?? core.discipline ?? core.sport ?? analyticsData.sport ?? (athlete as any)?.sport ?? rawSportId).trim();

  const isCricket = rawSportId === "cricket" || rawSport.toLowerCase().includes("cricket");
  const isAthletics = rawSportId === "athletics" || rawSport.toLowerCase().includes("athletics") || rawSport.toLowerCase().includes("jump") || rawSport.toLowerCase().includes("javelin") || rawSport.toLowerCase().includes("track");
  const isFootball = rawSportId === "football" || rawSportId === "soccer" || rawSport.toLowerCase().includes("football") || rawSport.toLowerCase().includes("soccer");
  const isRacketSport = rawSportId === "badminton" || rawSportId === "tennis" || rawSport.toLowerCase().includes("badminton") || rawSport.toLowerCase().includes("tennis");

  // Formatted display sport tag
  const sportDisplay = (() => {
    if (isCricket) {
      return core.role ? `Cricket • ${core.role}` : (athlete?.format ? `Cricket (${athlete.format})` : "Cricket");
    }
    if (isAthletics) {
      const event = perf.primaryEvent || core.discipline || (athlete as any)?.primaryEvent;
      return event && event.toLowerCase() !== "athletics" ? `Athletics • ${event}` : "Athletics";
    }
    if (isFootball) {
      return core.role ? `Football • ${core.role}` : "Football";
    }
    if (isRacketSport) {
      const disc = perf.primaryEvent || core.discipline;
      return disc ? `${rawSportId.charAt(0).toUpperCase() + rawSportId.slice(1)} • ${disc}` : rawSportId.charAt(0).toUpperCase() + rawSportId.slice(1);
    }
    return rawSport.charAt(0).toUpperCase() + rawSport.slice(1);
  })();

  const country = core.country ?? core.nationality ?? (athlete as any)?.country ?? (athlete as any)?.nationality ?? "";
  const profileImage: string | null = core.profileImage ?? (athlete as any)?.profileImage ?? null;
  const coverImage = core.coverImage ?? (athlete as any)?.coverImage;
  const isVerified = core.isVerified ?? (athlete as any)?.isVerified ?? true;
  const rawWorldRank =
    analyticsData?.stats?.worldRank ??
    perfStats?.worldRank ??
    core?.worldRank ??
    (athlete as any)?.stats?.worldRank ??
    (athlete as any)?.worldRank ??
    (athlete as any)?.rank ??
    analyticsData?.worldRank;
  const worldRank = rawWorldRank != null && String(rawWorldRank).trim() !== ""
    ? String(rawWorldRank).trim().replace(/^#+/, "")
    : null;
  const fanCount = (athlete as any)?.fanCount ?? "–";
  const fanImpactScore = (athlete as any)?.fanImpactScore ?? 0;
  const fanImpactChange = (athlete as any)?.fanImpactChange ?? 0;

  // Initials for avatar fallback
  const nameInitials = (() => {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase() || "SF";
  })();

  const resolvedIsClub = !!(
    isClub ||
    athlete?.entityId?.startsWith("CLUB#") ||
    core?.role === "Club / Team"
  );

  // Age calculation from dateOfBirth / dob
  const rawDob = core.dateOfBirth ?? core.dob ?? (athlete as any)?.dateOfBirth ?? (athlete as any)?.dob;
  const dobAge = (() => {
    if (!rawDob) return null;
    const dobDate = new Date(rawDob);
    if (isNaN(dobDate.getTime())) return null;
    const diff = Date.now() - dobDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  })();

  // Bio / about / welcome message
  const athleteBio = athlete?.bio ?? core?.bio ?? (athlete as any)?.about ?? (athlete as any)?.welcomeMessage ?? "";

  // Welcome video URL resolution
  const welcomeVideoUrl: string | undefined =
    (athlete as any)?.welcomeVideoUrl ??
    core?.welcomeVideoUrl ??
    undefined;

  // ── YouTube helpers ─────────────────────────────────────────────────────
  const extractYouTubeId = (url: string): string | null => {
    try {
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

  const rawMedalCabinet: Array<{ category?: string; medal?: string; event?: string; year?: string; title?: string }> =
    perf.medalCabinet ?? (athlete as any)?.medals ?? [];

  const medals = rawMedalCabinet.map((m) => ({
    title: m.category ?? m.title ?? m.event ?? "Achievement",
    year: m.year ?? "",
    icon: (m.medal && medalIconMap[m.medal]) ?? "🏅",
    color: ((m.medal && medalColorMap[m.medal]) ?? medalColorMap["GOLD"]).color,
    text: ((m.medal && medalColorMap[m.medal]) ?? medalColorMap["GOLD"]).text,
  }));

  // Achievements from medals
  const achievements: string[] = rawMedalCabinet
    .filter((m) => !m.medal || m.medal === "GOLD" || m.medal === "gold")
    .slice(0, 4)
    .map((m) => m.category ?? m.title ?? m.event ?? "")
    .filter(Boolean);

  // Safe JSON parser for DynamoDB Group B attributes that may be stringified
  const safeJsonParse = (val: any, fallback: any = null) => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === "object") return val;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return fallback !== null ? fallback : val;
      }
    }
    return val;
  };

  // Performance trend — primary: record_highlight.progressData, fallback: analytics.seasonalData
  const recordHighlight = safeJsonParse((athlete as any)?.record_highlight, {});
  const progressData: Array<{ year: string; value: number }> =
    recordHighlight.progressData ?? [];

  const rawSeasonalData: Array<{ year: string; value: number; event?: string; rank?: number }> =
    safeJsonParse(analyticsData.seasonalData ?? (athlete as any)?.seasonalData ?? (athlete as any)?.performanceTrend, []);

  const battingStats = safeJsonParse((athlete as any)?.analytics?.battingStats ?? (athlete as any)?.battingStats, null);
  const bowlingStats = safeJsonParse((athlete as any)?.analytics?.bowlingStats ?? (athlete as any)?.bowlingStats, null);

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
        : [];

  const hasTrendData = trendData.length > 0;

  // Dynamic Y-axis domain with ~5% padding
  const trendValues = trendData.map((d) => Number((d as any)[trendKey]) || 0);
  const trendMin = trendValues.length > 0 ? Math.min(...trendValues) : 0;
  const trendMax = trendValues.length > 0 ? Math.max(...trendValues) : 10;
  const trendPad = Math.max((trendMax - trendMin) * 0.15, 0.5);
  const yDomain: [number, number] = [Math.floor((trendMin - trendPad) * 10) / 10, Math.ceil((trendMax + trendPad) * 10) / 10];

  // ── Season stats resolution (Year-wise from medalData / currentSeason) ───
  const rawCurrentSeason = safeJsonParse(
    (athlete as any)?.currentSeason ??
    perf?.currentSeason ??
    (athlete as any)?.season ??
    core?.currentSeason ??
    analyticsData?.currentSeason,
    {}
  );

  const rawConsistency = safeJsonParse(
    analyticsData.consistencyData ??
    (athlete as any)?.consistencyData ??
    perf?.consistencyData,
    []
  );

  const medalDataRaw = safeJsonParse(
    (athlete as any)?.medalData ??
    analyticsData.medalData ??
    (rawConsistency && !Array.isArray(rawConsistency) ? (rawConsistency as any).medalData : null) ??
    (analyticsData.consistencyData && !Array.isArray(analyticsData.consistencyData) ? (analyticsData.consistencyData as any).medalData : null) ??
    perf?.medalData,
    []
  );

  const statsRaw = safeJsonParse(
    analyticsData.stats ??
    (athlete as any)?.stats ??
    perfStats,
    {}
  );

  const medalDataArray: Array<Record<string, any>> = Array.isArray(medalDataRaw)
    ? medalDataRaw
    : medalDataRaw && typeof medalDataRaw === "object"
      ? [medalDataRaw]
      : [];

  const seasonalDataArray: Array<Record<string, any>> = Array.isArray(rawSeasonalData)
    ? rawSeasonalData
    : [];

  const hasSeasonData = (item: Record<string, any>) => {
    if (!item || typeof item !== "object") return false;
    const hasEvents = item.events != null && item.events !== "" && item.events !== "–" && item.events !== "null" && Number(item.events) > 0;
    const hasGold = item.gold != null && item.gold !== "" && item.gold !== "–" && item.gold !== "null" && Number(item.gold) > 0;
    const hasSilver = item.silver != null && item.silver !== "" && item.silver !== "–" && item.silver !== "null" && Number(item.silver) > 0;
    const hasBronze = item.bronze != null && item.bronze !== "" && item.bronze !== "–" && item.bronze !== "null" && Number(item.bronze) > 0;
    const hasSeasonBest = item.seasonBest != null && String(item.seasonBest).trim() !== "" && item.seasonBest !== "–" && item.seasonBest !== "null";
    const hasAvg = (item.seasonAverage != null && String(item.seasonAverage).trim() !== "" && item.seasonAverage !== "–" && item.seasonAverage !== "null") ||
                   (item.averageThrow != null && String(item.averageThrow).trim() !== "" && item.averageThrow !== "–" && item.averageThrow !== "null") ||
                   (item.personalBest != null && String(item.personalBest).trim() !== "" && item.personalBest !== "–" && item.personalBest !== "null") ||
                   (item.avg != null && String(item.avg).trim() !== "" && item.avg !== "–" && item.avg !== "null");
    const hasStreak = item.currentStreak != null && String(item.currentStreak).trim() !== "" && item.currentStreak !== "–" && item.currentStreak !== "null";
    const hasValue = item.value != null && String(item.value).trim() !== "" && item.value !== "null" && item.value !== "–" && !isNaN(Number(item.value)) && Number(item.value) > 0;

    return hasEvents || hasGold || hasSilver || hasBronze || hasSeasonBest || hasAvg || hasStreak || hasValue;
  };

  const availableSeasonYears = (() => {
    const fromMedals = medalDataArray
      .filter((m) => hasSeasonData(m))
      .map((m) => String(m.year ?? "").trim())
      .filter((y) => y && y !== "undefined" && y !== "null" && y !== "–");

    if (fromMedals.length > 0) {
      return Array.from(new Set(fromMedals)).sort((a, b) => b.localeCompare(a));
    }

    const fromSeasonal = seasonalDataArray
      .filter((s) => hasSeasonData(s))
      .map((s) => String(s.year ?? "").trim())
      .filter((y) => y && y !== "undefined" && y !== "null" && y !== "–");

    const fromProgress = progressData
      .filter((p) => hasSeasonData(p))
      .map((p) => String(p.year ?? "").trim())
      .filter((y) => y && y !== "undefined" && y !== "null" && y !== "–");

    const combined = Array.from(new Set([...fromSeasonal, ...fromProgress])).sort((a, b) => b.localeCompare(a));
    if (combined.length > 0) return combined;

    return [];
  })();

  const currentActiveYear =
    selectedSeasonYear && availableSeasonYears.includes(selectedSeasonYear)
      ? selectedSeasonYear
      : availableSeasonYears[0] || "";

  const activeMedalSeason =
    medalDataArray.find((s) => String(s.year) === currentActiveYear) ??
    (availableSeasonYears.length > 0 ? medalDataArray[0] : null) ??
    {};

  const activeSeasonalItem =
    seasonalDataArray.find((s) => String(s.year) === currentActiveYear) ??
    progressData.find((p) => String(p.year) === currentActiveYear) ??
    {};

  const isCurrentYearSelected =
    currentActiveYear === availableSeasonYears[0] ||
    availableSeasonYears.length <= 1;

  const sportUnit =
    (athlete as any)?.unit ||
    (athlete as any)?.coreInfo?.unit ||
    perf?.unit ||
    (isAthletics ? "m" : "");

  const formatWithUnit = (val: any) => {
    if (val === undefined || val === null || val === "" || val === "–" || val === "null" || val === "undefined") return "–";
    const str = String(val).trim();
    if (str === "–" || str === "null" || str === "undefined" || str === "") return "–";
    if (!sportUnit) return str;
    if (str.toLowerCase().endsWith(sportUnit.toLowerCase()) || str.toLowerCase().includes(sportUnit.toLowerCase())) {
      return str;
    }
    if (!isNaN(Number(str))) {
      return `${str} ${sportUnit}`;
    }
    return str;
  };

  const formatSeasonStat = (val: any) => {
    if (val === undefined || val === null || val === "" || val === "–" || val === "null" || val === "undefined") return "–";
    return String(val);
  };

  // Events calculation
  const calcEvents = (() => {
    if (activeMedalSeason.events != null && String(activeMedalSeason.events).trim() !== "" && activeMedalSeason.events !== "–" && activeMedalSeason.events !== "null") {
      return activeMedalSeason.events;
    }
    if (isCurrentYearSelected) {
      if (rawCurrentSeason?.events != null && String(rawCurrentSeason.events).trim() !== "" && rawCurrentSeason.events !== "–") return rawCurrentSeason.events;
      if (perfStats?.events != null && String(perfStats.events).trim() !== "" && perfStats.events !== "–") return perfStats.events;
      if ((athlete as any)?.events != null && String((athlete as any).events).trim() !== "" && (athlete as any).events !== "–") return (athlete as any).events;
    }
    const mGold = Number(activeMedalSeason.gold) || 0;
    const mSilver = Number(activeMedalSeason.silver) || 0;
    const mBronze = Number(activeMedalSeason.bronze) || 0;
    const sumMedals = mGold + mSilver + mBronze;
    if (sumMedals > 0) return sumMedals;
    const yrCount = seasonalDataArray.filter((s) => String(s.year) === currentActiveYear).length;
    if (yrCount > 0) return yrCount;
    return "–";
  })();

  // Gold calculation
  const calcGold = (() => {
    if (activeMedalSeason.gold != null && String(activeMedalSeason.gold).trim() !== "" && activeMedalSeason.gold !== "–" && activeMedalSeason.gold !== "null") {
      return activeMedalSeason.gold;
    }
    if (isCurrentYearSelected) {
      if (rawCurrentSeason?.gold != null && String(rawCurrentSeason.gold).trim() !== "" && rawCurrentSeason.gold !== "–") return rawCurrentSeason.gold;
      if (perfStats?.gold != null && String(perfStats.gold).trim() !== "" && perfStats.gold !== "–") return perfStats.gold;
      if (statsRaw?.gold != null && String(statsRaw.gold).trim() !== "" && statsRaw.gold !== "–") return statsRaw.gold;
      if (statsRaw?.totalGold != null && String(statsRaw.totalGold).trim() !== "" && statsRaw.totalGold !== "–") return statsRaw.totalGold;
      if (statsRaw?.olympicGold != null && String(statsRaw.olympicGold).trim() !== "" && statsRaw.olympicGold !== "–") return statsRaw.olympicGold;
      if ((athlete as any)?.gold != null && String((athlete as any).gold).trim() !== "" && (athlete as any).gold !== "–") return (athlete as any).gold;
    }
    return "–";
  })();

  // Silver calculation
  const calcSilver = (() => {
    if (activeMedalSeason.silver != null && String(activeMedalSeason.silver).trim() !== "" && activeMedalSeason.silver !== "–" && activeMedalSeason.silver !== "null") {
      return activeMedalSeason.silver;
    }
    if (isCurrentYearSelected) {
      if (rawCurrentSeason?.silver != null && String(rawCurrentSeason.silver).trim() !== "" && rawCurrentSeason.silver !== "–") return rawCurrentSeason.silver;
      if (perfStats?.silver != null && String(perfStats.silver).trim() !== "" && perfStats.silver !== "–") return perfStats.silver;
      if (statsRaw?.silver != null && String(statsRaw.silver).trim() !== "" && statsRaw.silver !== "–") return statsRaw.silver;
      if (statsRaw?.totalSilver != null && String(statsRaw.totalSilver).trim() !== "" && statsRaw.totalSilver !== "–") return statsRaw.totalSilver;
      if ((athlete as any)?.silver != null && String((athlete as any).silver).trim() !== "" && (athlete as any).silver !== "–") return (athlete as any).silver;
    }
    return "–";
  })();

  // Bronze calculation
  const calcBronze = (() => {
    if (activeMedalSeason.bronze != null && String(activeMedalSeason.bronze).trim() !== "" && activeMedalSeason.bronze !== "–" && activeMedalSeason.bronze !== "null") {
      return activeMedalSeason.bronze;
    }
    if (isCurrentYearSelected) {
      if (rawCurrentSeason?.bronze != null && String(rawCurrentSeason.bronze).trim() !== "" && rawCurrentSeason.bronze !== "–") return rawCurrentSeason.bronze;
      if (perfStats?.bronze != null && String(perfStats.bronze).trim() !== "" && perfStats.bronze !== "–") return perfStats.bronze;
      if (statsRaw?.bronze != null && String(statsRaw.bronze).trim() !== "" && statsRaw.bronze !== "–") return statsRaw.bronze;
      if (statsRaw?.totalBronze != null && String(statsRaw.totalBronze).trim() !== "" && statsRaw.totalBronze !== "–") return statsRaw.totalBronze;
      if ((athlete as any)?.bronze != null && String((athlete as any).bronze).trim() !== "" && (athlete as any).bronze !== "–") return (athlete as any).bronze;
    }
    return "–";
  })();

  // Season Best calculation
  const calcSeasonBest = (() => {
    if (activeMedalSeason.seasonBest != null && String(activeMedalSeason.seasonBest).trim() !== "" && activeMedalSeason.seasonBest !== "–" && activeMedalSeason.seasonBest !== "null") {
      return formatWithUnit(activeMedalSeason.seasonBest);
    }
    if (activeSeasonalItem.value != null && String(activeSeasonalItem.value).trim() !== "" && activeSeasonalItem.value !== "–") {
      return formatWithUnit(activeSeasonalItem.value);
    }
    if (isCurrentYearSelected) {
      if (rawCurrentSeason?.seasonBest != null && String(rawCurrentSeason.seasonBest).trim() !== "" && rawCurrentSeason.seasonBest !== "–" && rawCurrentSeason.seasonBest !== "null") {
        return formatWithUnit(rawCurrentSeason.seasonBest);
      }
      if (perfStats?.seasonBest != null && String(perfStats.seasonBest).trim() !== "" && perfStats.seasonBest !== "–" && perfStats.seasonBest !== "null") {
        return formatWithUnit(perfStats.seasonBest);
      }
      if ((athlete as any)?.seasonBest != null && String((athlete as any).seasonBest).trim() !== "" && (athlete as any).seasonBest !== "–" && (athlete as any).seasonBest !== "null") {
        return formatWithUnit((athlete as any).seasonBest);
      }
      if (analyticsData?.heroStat != null && String(analyticsData.heroStat).trim() !== "" && analyticsData.heroStat !== "–" && analyticsData.heroStat !== "null") {
        return formatWithUnit(analyticsData.heroStat);
      }
      if ((athlete as any)?.heroStat != null && String((athlete as any).heroStat).trim() !== "" && (athlete as any).heroStat !== "–" && (athlete as any).heroStat !== "null") {
        return formatWithUnit((athlete as any).heroStat);
      }
      if (statsRaw?.seasonBest != null && String(statsRaw.seasonBest).trim() !== "" && statsRaw.seasonBest !== "–" && statsRaw.seasonBest !== "null") {
        return formatWithUnit(statsRaw.seasonBest);
      }
      if (statsRaw?.personalBest != null && String(statsRaw.personalBest).trim() !== "" && statsRaw.personalBest !== "–" && statsRaw.personalBest !== "null") {
        return formatWithUnit(statsRaw.personalBest);
      }
      if (perfStats?.personalBest != null && String(perfStats.personalBest).trim() !== "" && perfStats.personalBest !== "–" && perfStats.personalBest !== "null") {
        return formatWithUnit(perfStats.personalBest);
      }
    }
    return "–";
  })();

  // Personal Best / Avg calculation
  const calcAvgOrPb = (() => {
    if (activeMedalSeason.seasonAverage != null && String(activeMedalSeason.seasonAverage).trim() !== "" && activeMedalSeason.seasonAverage !== "–" && activeMedalSeason.seasonAverage !== "null") {
      return formatWithUnit(activeMedalSeason.seasonAverage);
    }
    if (activeMedalSeason.averageThrow != null && String(activeMedalSeason.averageThrow).trim() !== "" && activeMedalSeason.averageThrow !== "–" && activeMedalSeason.averageThrow !== "null") {
      return formatWithUnit(activeMedalSeason.averageThrow);
    }
    if (activeMedalSeason.personalBest != null && String(activeMedalSeason.personalBest).trim() !== "" && activeMedalSeason.personalBest !== "–" && activeMedalSeason.personalBest !== "null") {
      return formatWithUnit(activeMedalSeason.personalBest);
    }
    if (activeMedalSeason.avg != null && String(activeMedalSeason.avg).trim() !== "" && activeMedalSeason.avg !== "–" && activeMedalSeason.avg !== "null") {
      return formatWithUnit(activeMedalSeason.avg);
    }
    if (activeMedalSeason.seasonAvg != null && String(activeMedalSeason.seasonAvg).trim() !== "" && activeMedalSeason.seasonAvg !== "–" && activeMedalSeason.seasonAvg !== "null") {
      return formatWithUnit(activeMedalSeason.seasonAvg);
    }
    if (isCurrentYearSelected) {
      if (rawCurrentSeason?.seasonAverage != null && String(rawCurrentSeason.seasonAverage).trim() !== "" && rawCurrentSeason.seasonAverage !== "–" && rawCurrentSeason.seasonAverage !== "null") {
        return formatWithUnit(rawCurrentSeason.seasonAverage);
      }
      if (rawCurrentSeason?.averageThrow != null && String(rawCurrentSeason.averageThrow).trim() !== "" && rawCurrentSeason.averageThrow !== "–" && rawCurrentSeason.averageThrow !== "null") {
        return formatWithUnit(rawCurrentSeason.averageThrow);
      }
      if (rawCurrentSeason?.personalBest != null && String(rawCurrentSeason.personalBest).trim() !== "" && rawCurrentSeason.personalBest !== "–" && rawCurrentSeason.personalBest !== "null") {
        return formatWithUnit(rawCurrentSeason.personalBest);
      }
      if (rawCurrentSeason?.avgThrow != null && String(rawCurrentSeason.avgThrow).trim() !== "" && rawCurrentSeason.avgThrow !== "–" && rawCurrentSeason.avgThrow !== "null") {
        return formatWithUnit(rawCurrentSeason.avgThrow);
      }
      if (perfStats?.seasonAverage != null && String(perfStats.seasonAverage).trim() !== "" && perfStats.seasonAverage !== "–" && perfStats.seasonAverage !== "null") {
        return formatWithUnit(perfStats.seasonAverage);
      }
      if (perfStats?.averageThrow != null && String(perfStats.averageThrow).trim() !== "" && perfStats.averageThrow !== "–" && perfStats.averageThrow !== "null") {
        return formatWithUnit(perfStats.averageThrow);
      }
      if (perfStats?.personalBest != null && String(perfStats.personalBest).trim() !== "" && perfStats.personalBest !== "–" && perfStats.personalBest !== "null") {
        return formatWithUnit(perfStats.personalBest);
      }
      if (analyticsData?.afterCoach != null && String(analyticsData.afterCoach).trim() !== "" && analyticsData.afterCoach !== "–" && analyticsData.afterCoach !== "null") {
        return formatWithUnit(analyticsData.afterCoach);
      }
      if ((athlete as any)?.afterCoach != null && String((athlete as any).afterCoach).trim() !== "" && (athlete as any).afterCoach !== "–" && (athlete as any).afterCoach !== "null") {
        return formatWithUnit((athlete as any).afterCoach);
      }
      if (statsRaw?.personalBest != null && String(statsRaw.personalBest).trim() !== "" && statsRaw.personalBest !== "–" && statsRaw.personalBest !== "null") {
        return formatWithUnit(statsRaw.personalBest);
      }
      if ((athlete as any)?.personalBest != null && String((athlete as any).personalBest).trim() !== "" && (athlete as any).personalBest !== "–" && (athlete as any).personalBest !== "null") {
        return formatWithUnit((athlete as any).personalBest);
      }
      if ((athlete as any)?.averageThrow != null && String((athlete as any).averageThrow).trim() !== "" && (athlete as any).averageThrow !== "–" && (athlete as any).averageThrow !== "null") {
        return formatWithUnit((athlete as any).averageThrow);
      }
      if (analyticsData?.heroStat != null && String(analyticsData.heroStat).trim() !== "" && analyticsData.heroStat !== "–" && analyticsData.heroStat !== "null") {
        return formatWithUnit(analyticsData.heroStat);
      }
    }
    return "–";
  })();

  // Current Streak calculation
  const calcCurrentStreak = (() => {
    if (activeMedalSeason.currentStreak != null && String(activeMedalSeason.currentStreak).trim() !== "" && activeMedalSeason.currentStreak !== "–" && activeMedalSeason.currentStreak !== "null") {
      return activeMedalSeason.currentStreak;
    }
    if (activeMedalSeason.streak != null && String(activeMedalSeason.streak).trim() !== "" && activeMedalSeason.streak !== "–" && activeMedalSeason.streak !== "null") {
      return activeMedalSeason.streak;
    }
    if (isCurrentYearSelected) {
      if (rawCurrentSeason?.currentStreak != null && String(rawCurrentSeason.currentStreak).trim() !== "" && rawCurrentSeason.currentStreak !== "–" && rawCurrentSeason.currentStreak !== "null") {
        return rawCurrentSeason.currentStreak;
      }
      if (perfStats?.currentStreak != null && String(perfStats.currentStreak).trim() !== "" && perfStats.currentStreak !== "–" && perfStats.currentStreak !== "null") {
        return perfStats.currentStreak;
      }
      if (statsRaw?.currentStreak != null && String(statsRaw.currentStreak).trim() !== "" && statsRaw.currentStreak !== "–" && statsRaw.currentStreak !== "null") {
        return statsRaw.currentStreak;
      }
      if ((athlete as any)?.currentStreak != null && String((athlete as any).currentStreak).trim() !== "" && (athlete as any).currentStreak !== "–" && (athlete as any).currentStreak !== "null") {
        return (athlete as any).currentStreak;
      }
      if (statsRaw?.olympicGold && Number(statsRaw.olympicGold) > 0) {
        return `${statsRaw.olympicGold} Olympic Gold`;
      }
      if (statsRaw?.totalGold && Number(statsRaw.totalGold) > 0) {
        return `${statsRaw.totalGold} Wins`;
      }
    }
    if (activeMedalSeason.gold && Number(activeMedalSeason.gold) > 0) {
      return `${activeMedalSeason.gold} Win${Number(activeMedalSeason.gold) > 1 ? "s" : ""}`;
    }
    return "–";
  })();

  const season = {
    events: formatSeasonStat(calcEvents),
    gold: formatSeasonStat(calcGold),
    silver: formatSeasonStat(calcSilver),
    bronze: formatSeasonStat(calcBronze),
    seasonBest: formatSeasonStat(calcSeasonBest),
    averageThrow: formatSeasonStat(calcAvgOrPb),
    currentStreak: formatSeasonStat(calcCurrentStreak),
    year: currentActiveYear,
  };

  // ── Consistency Data from analytics ──────────────────────────────────────
  const consistencyData: Array<{
    range: string;
    count?: number;
    throws?: number;
    attempts?: number;
    percentage?: number;
    peak?: boolean;
  }> = Array.isArray(rawConsistency) ? rawConsistency : [];

  const consistencyNote: string =
    analyticsData.consistencyNote ??
    (athlete as any)?.consistencyNote ??
    "";

  const peakZoneLabel: string =
    analyticsData.peakZoneLabel ??
    (athlete as any)?.peakZoneLabel ??
    "";

  const consistencyBarLabel: string =
    analyticsData.consistencyBarLabel ??
    (athlete as any)?.consistencyBarLabel ??
    "attempts";

  // ── Dynamic Sport-Aware Quick Facts ──────────────────────────────────────
  const quickFacts = (() => {
    if (resolvedIsClub) {
      return [
        {
          label: "Captain",
          val: core.captain ?? (athlete as any)?.captain ?? "–",
          icon: <User className="w-4 h-4 text-orange-400" />,
        },
        {
          label: "Head Coach",
          val: core.coachName ?? core.coach ?? (athlete as any)?.coach ?? "–",
          icon: <Award className="w-4 h-4 text-[#FFD700]" />,
        },
        {
          label: "Home Ground",
          val: core.birthplace ?? core.birthPlace ?? (athlete as any)?.birthplace ?? "–",
          icon: <MapPin className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Founded",
          val: core.yearsActiveSince ? `${core.yearsActiveSince}` : (core.hand ?? "–"),
          icon: <Calendar className="w-4 h-4 text-cyan-400" />,
        },
        {
          label: "Season Best",
          val: season?.seasonBest ?? "–",
          icon: <Trophy className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Season Avg",
          val: season?.averageThrow ?? "–",
          icon: <TrendingUp className="w-4 h-4 text-yellow-400" />,
        },
      ];
    }

    if (isCricket) {
      return [
        {
          label: "Age",
          val: dobAge ? `${dobAge} yrs` : (rawDob ? `Born ${rawDob}` : "–"),
          icon: <User className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Role",
          val: core.role ?? (athlete as any)?.role ?? "–",
          icon: <Award className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Batting Style",
          val: core.battingStyle ?? (athlete as any)?.battingStyle ?? "–",
          icon: <Zap className="w-4 h-4 text-orange-400" />,
        },
        {
          label: "Bowling Style",
          val: core.bowlingStyle ?? (athlete as any)?.bowlingStyle ?? "–",
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
        },
        {
          label: "Format",
          val: athlete?.format ?? core.format ?? "Test",
          icon: <Calendar className="w-4 h-4 text-cyan-400" />,
        },
        {
          label: "Debut Date",
          val: core.debutDate ?? (athlete as any)?.debutDate ?? "–",
          icon: <Calendar className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Test Caps",
          val: core.testCaps ?? (athlete as any)?.testCaps ?? "–",
          icon: <Award className="w-4 h-4 text-[#FFD700]" />,
        },
        {
          label: "Jersey No",
          val: core.jerseyNo ?? (athlete as any)?.jerseyNo ?? "–",
          icon: <Activity className="w-4 h-4 text-purple-400" />,
        },
        {
          label: "Captain",
          val: (core.isCaptain ?? (athlete as any)?.isCaptain) ? "Yes" : "No",
          icon: <Shield className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Birthplace",
          val: core.birthPlace ?? core.birthplace ?? (athlete as any)?.birthPlace ?? (athlete as any)?.birthplace ?? "–",
          icon: <MapPin className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Height",
          val: core.heightCm ? `${core.heightCm} cm` : (core.height ?? "–"),
          icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
        },
        {
          label: "Club / Team",
          val: core.currentClubId ?? (athlete as any)?.currentClubId ?? "–",
          icon: <Users className="w-4 h-4 text-amber-400" />,
        },
        {
          label: "World Rank",
          val: worldRank ? `#${worldRank}` : "–",
          icon: <Trophy className="w-4 h-4 text-[#FFD700]" />,
        },
      ].filter((f) => f.val && f.val !== "–");
    }

    if (isAthletics) {
      return [
        {
          label: "Age",
          val: dobAge ? `${dobAge} yrs` : (rawDob ? `Born ${rawDob}` : "–"),
          icon: <User className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Discipline",
          val: perf.primaryEvent ?? core.discipline ?? (athlete as any)?.primaryEvent ?? "Track & Field",
          icon: <Award className="w-4 h-4 text-[#FFD700]" />,
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
          label: "Coach",
          val: core.coachName ?? core.coach ?? (athlete as any)?.coachName ?? (athlete as any)?.coach ?? "–",
          icon: <Award className="w-4 h-4 text-[#FFD700]" />,
        },
        {
          label: "Birthplace",
          val: core.birthPlace ?? core.birthplace ?? (athlete as any)?.birthPlace ?? (athlete as any)?.birthplace ?? "–",
          icon: <MapPin className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Nationality",
          val: core.nationality ?? core.country ?? (athlete as any)?.nationality ?? (athlete as any)?.country ?? "–",
          icon: <MapPin className="w-4 h-4 text-cyan-400" />,
        },
        {
          label: "World Rank",
          val: worldRank ? `#${worldRank}` : "–",
          icon: <Trophy className="w-4 h-4 text-[#FFD700]" />,
        },
        {
          label: "Olympic Games",
          val: core.firstOlympicGames ?? (athlete as any)?.firstOlympicGames ?? "–",
          icon: <Trophy className="w-4 h-4 text-purple-400" />,
        },
      ].filter((f) => f.val && f.val !== "–");
    }

    if (isFootball) {
      return [
        {
          label: "Age",
          val: dobAge ? `${dobAge} yrs` : (rawDob ? `Born ${rawDob}` : "–"),
          icon: <User className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Position",
          val: core.role ?? core.position ?? (athlete as any)?.position ?? "–",
          icon: <Award className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Preferred Foot",
          val: core.preferredFoot ?? core.foot ?? core.hand ?? "–",
          icon: <Zap className="w-4 h-4 text-orange-400" />,
        },
        {
          label: "Club / Team",
          val: core.currentClubId ?? core.club ?? (athlete as any)?.club ?? "–",
          icon: <Users className="w-4 h-4 text-cyan-400" />,
        },
        {
          label: "Jersey No",
          val: core.jerseyNo ?? (athlete as any)?.jerseyNo ?? "–",
          icon: <Activity className="w-4 h-4 text-purple-400" />,
        },
        {
          label: "Height",
          val: core.heightCm ? `${core.heightCm} cm` : (core.height ?? "–"),
          icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Weight",
          val: core.weightKg ? `${core.weightKg} kg` : (core.weight ?? "–"),
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
        },
        {
          label: "Birthplace",
          val: core.birthPlace ?? core.birthplace ?? (athlete as any)?.birthPlace ?? (athlete as any)?.birthplace ?? "–",
          icon: <MapPin className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "World Rank",
          val: worldRank ? `#${worldRank}` : "–",
          icon: <Trophy className="w-4 h-4 text-[#FFD700]" />,
        },
      ].filter((f) => f.val && f.val !== "–");
    }

    if (isRacketSport) {
      return [
        {
          label: "Age",
          val: dobAge ? `${dobAge} yrs` : (rawDob ? `Born ${rawDob}` : "–"),
          icon: <User className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Playing Hand",
          val: core.hand ?? core.playingHand ?? "–",
          icon: <Zap className="w-4 h-4 text-orange-400" />,
        },
        {
          label: "Discipline",
          val: perf.primaryEvent ?? core.discipline ?? "Singles",
          icon: <Award className="w-4 h-4 text-[#FFD700]" />,
        },
        {
          label: "World Rank",
          val: worldRank ? `#${worldRank}` : "–",
          icon: <Trophy className="w-4 h-4 text-pink-400" />,
        },
        {
          label: "Height",
          val: core.heightCm ? `${core.heightCm} cm` : (core.height ?? "–"),
          icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Weight",
          val: core.weightKg ? `${core.weightKg} kg` : (core.weight ?? "–"),
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
        },
        {
          label: "Birthplace",
          val: core.birthPlace ?? core.birthplace ?? "–",
          icon: <MapPin className="w-4 h-4 text-emerald-400" />,
        },
        {
          label: "Coach",
          val: core.coachName ?? core.coach ?? "–",
          icon: <Award className="w-4 h-4 text-cyan-400" />,
        },
      ].filter((f) => f.val && f.val !== "–");
    }

    // Generic fallback for any other sports
    return [
      {
        label: "Age",
        val: dobAge ? `${dobAge} yrs` : (rawDob ? `Born ${rawDob}` : "–"),
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
        val: core.birthPlace ?? core.birthplace ?? (athlete as any)?.birthPlace ?? (athlete as any)?.birthplace ?? "–",
        icon: <MapPin className="w-4 h-4 text-emerald-400" />,
      },
      {
        label: "Coach",
        val: core.coachName ?? core.coach ?? (athlete as any)?.coachName ?? (athlete as any)?.coach ?? "–",
        icon: <Award className="w-4 h-4 text-[#FFD700]" />,
      },
      {
        label: "World Rank",
        val: worldRank ? `#${worldRank}` : "–",
        icon: <Trophy className="w-4 h-4 text-[#FFD700]" />,
      },
      {
        label: "Active Since",
        val: core.yearsActiveSince ? `${core.yearsActiveSince}` : (core.hand ?? "–"),
        icon: <Calendar className="w-4 h-4 text-cyan-400" />,
      },
    ].filter((f) => f.val && f.val !== "–");
  })();

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
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[18px] md:text-[24px] font-black tracking-tight text-white flex items-center gap-1">
                SportsFan<span className="text-[#FF7A00]">360</span>
              </span>
              <span className="text-[10px] text-gray-400 -mt-1 font-medium tracking-wide">
                Where fans play...
              </span>
            </div>
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
                <span className="text-[8px] sm:text-[9px] uppercase font-bold text-orange-400 tracking-wider">
                  {resolvedIsClub ? "Verified Club" : "Verified Athlete"}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl md:text-4xl font-extrabold flex items-center gap-1.5 tracking-tight leading-tight truncate">
                <span className="truncate">{name}</span>
                {isVerified && (
                  <span className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-[#FF0055] rounded-full inline-flex items-center justify-center text-[9px] sm:text-[10px] text-white">
                    ✓
                  </span>
                )}
              </h1>
              {(country || sportDisplay) && (
                <p className="text-[10px] sm:text-xs text-gray-300 font-medium mt-0.5 truncate flex items-center gap-1.5">
                  {country && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      {country}
                    </span>
                  )}
                  {country && sportDisplay && <span>•</span>}
                  {sportDisplay && (
                    <span className="text-orange-300 font-semibold">{sportDisplay}</span>
                  )}
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
              {worldRank && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md rounded-full px-3 py-1 border border-amber-500/40 shadow-sm">
                  <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">World Rank</span>
                  <span className="text-xs text-white font-extrabold">#{worldRank}</span>
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

              {/* Share Button */}
              <button
                onClick={handleShare}
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

        {/* Welcome Message / Athlete Bio Spotlight Card */}
        <div className="bg-[#12121e]/80 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 backdrop-blur-md">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 md:gap-6 items-center">

            {/* Video Player or Bio Showcase - Order 1 on mobile, 2 on desktop */}
            <div className="w-full lg:col-span-7 xl:col-span-8 order-1 lg:order-2 relative rounded-xl md:rounded-2xl overflow-hidden aspect-video group border border-white/10 shadow-2xl bg-black/40">
              {welcomeVideoUrl ? (
                isYouTube ? (
                  // ── YouTube embed ──
                  showYouTubeEmbed ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0&modestbranding=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${name} Welcome Message`}
                    />
                  ) : (
                      <div
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => setShowYouTubeEmbed(true)}
                      >
                        <img
                          src={youTubeThumbnail ?? profileImage ?? "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600"}
                          alt={`${name} Welcome Message`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border border-white/20">
                            <Play className="w-6 h-6 md:w-7 md:h-7 text-white fill-current translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                  )
                ) : (
                    // ── Native video ──
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
                  // ── Bio Showcase when no video ──
                  <div className="relative w-full h-full bg-gradient-to-br from-[#1c1c30] to-[#0d0d1a] p-5 sm:p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FF0055] animate-pulse" />
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Athlete Spotlight</span>
                      </div>
                      <span className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-gray-300 font-semibold">
                        {sportDisplay}
                      </span>
                    </div>

                    <div className="my-auto py-2">
                      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal line-clamp-4 sm:line-clamp-6">
                        {athleteBio || `${name} is an elite international ${sportDisplay} competitor representing ${country || "their nation"} at the highest levels of global sport.`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-gray-400">
                      <span>{country ? `Representing: ${country}` : "Official Profile"}</span>
                      <span className="text-pink-400 font-bold uppercase">SportsFan360 Verified</span>
                    </div>
                </div>
              )}

              {/* Modern Top-Right Stats Overlay */}
              {welcomeVideoUrl && (
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/10 tracking-wide text-gray-200 shadow-lg">
                  <span className="flex items-center gap-0.5">❤️ <span className="text-gray-300 font-medium">12.4K</span></span>
                  <span className="w-px h-2.5 bg-white/20"></span>
                  <span className="flex items-center gap-0.5">💬 <span className="text-gray-300 font-medium">832</span></span>
                </div>
              )}
            </div>

            {/* Title / Description - Order 2 on mobile, 1 on desktop */}
            <div className="w-full lg:col-span-5 xl:col-span-4 space-y-3.5 order-2 lg:order-1 text-center lg:text-left px-1 md:px-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full mx-auto lg:mx-0">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-black tracking-widest text-pink-400">
                  {welcomeVideoUrl ? "Welcome Message" : "About the Athlete"}
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 drop-shadow-sm">
                {athlete?.welcomeMessage || (athleteBio ? `The Journey of ${name}` : `Welcome to the official fan hub of ${name}!`)}
              </h4>

              {athleteBio && welcomeVideoUrl && (
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {athleteBio}
                </p>
              )}

              {/* Watch Video CTA if video exists */}
              {welcomeVideoUrl && (!isYouTube ? !isWelcomeVideoPlaying : !showYouTubeEmbed) && (
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-[#FF0055] to-[#FF4500] hover:from-[#ff1a66] hover:to-[#ff5714] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-xl active:scale-95 transition-all w-full sm:w-max justify-center mx-auto lg:mx-0 text-white cursor-pointer"
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
                  Watch Video Message
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
              <span className="text-base">⚡</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Quick Facts</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {quickFacts.map((fact, idx) => (
                <div key={idx} className="bg-black/35 rounded-2xl p-3 border border-white/5 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 shrink-0 mt-0.5">{fact.icon}</div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-gray-500 font-semibold uppercase">{fact.label}</span>
                    <span className="block text-xs font-bold text-white truncate" title={String(fact.val)}>
                      {fact.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements Badges */}
            {/* {achievements.length > 0 && (
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
            )} */}
          </div>

          {/* Fan Power Card */}
          <div className="lg:col-span-4 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔥</span>
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
          {/* 2026 Season Stats */}
          {!resolvedIsClub && (
            <div className="lg:col-span-5 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">
                    {season.year ? `${season.year} Season` : "Season Stats"}
                  </h3>
                  {availableSeasonYears.length > 1 && (
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar max-w-[220px]">
                      {availableSeasonYears.map((yr) => (
                        <button
                          key={yr}
                          onClick={() => setSelectedSeasonYear(yr)}
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${currentActiveYear === yr
                            ? "bg-pink-500 text-white shadow-sm"
                            : "text-gray-400 hover:text-white"
                            }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  )}
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
                    {(!bowlingStats || cricketStatTab === "batting") && battingStats ? (
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
                    ) : (bowlingStats && cricketStatTab === "bowling") || (bowlingStats && !battingStats) ? (
                      // Bowling Stats view
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
                      ) : (
                        // Cricket Profile Overview when no stats row is linked
                        <div className="space-y-2.5">
                          <div className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium">Playing Format</span>
                            <span className="text-xs font-bold text-white">{athlete?.format ?? core.format ?? "Test"}</span>
                          </div>
                          <div className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium">Player Role</span>
                            <span className="text-xs font-bold text-pink-400">{core.role ?? "Specialist"}</span>
                          </div>
                          <div className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium">Bowling Style</span>
                            <span className="text-xs font-bold text-orange-400">{core.bowlingStyle ?? "–"}</span>
                          </div>
                          <div className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium">Batting Style</span>
                            <span className="text-xs font-bold text-yellow-400">{core.battingStyle ?? "–"}</span>
                          </div>
                        </div>
                    )}
                  </div>
                ) : availableSeasonYears.length === 0 ? (
                  <div className="py-8 text-center bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-2xl block mb-2">📊</span>
                    <p className="text-xs text-gray-400 font-medium">No seasonal performance records available</p>
                  </div>
                ) : (
                  <>
                      {/* Main Athletics / Multi-sport dashboard */}
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
                          <span className="text-xs font-semibold text-gray-300">Personal Best / Avg</span>
                          <span className="text-xs font-bold text-white">{season?.averageThrow ?? "–"}</span>
                        </div>
                      </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Performance Trend Chart */}
          <div className={`${resolvedIsClub ? "lg:col-span-12" : "lg:col-span-7"} bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Performance Trend</h3>
              {/* <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button> */}
            </div>

            {hasTrendData ? (
              <>
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
                  {isCricket
                    ? (bowlingStats && !battingStats ? "Seasonal Wickets Progress" : "Seasonal Runs Progress")
                    : isAthletics
                      ? "Personal Best Progress (meters)"
                      : "Seasonal Performance Progress"}
                </div>
              </>
            ) : (
              <div className="w-full h-[180px] mt-2 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 text-pink-400" />
                </div>
                <p className="text-xs font-semibold text-gray-300">Performance Trend Not Available</p>
                <p className="text-[10px] text-gray-500 mt-1 max-w-[240px]">
                  Historical progression data has not been recorded yet for this {resolvedIsClub ? "club" : "athlete"}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Consistency & Performance Range Section (from analytics.consistencyData) */}
        {/* {!resolvedIsClub && consistencyData.length > 0 && (
          <div className="bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#FF0055]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">
                  {isAthletics ? "Performance & Consistency Range" : "Consistency Distribution"}
                </h3>
              </div>
              {peakZoneLabel && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                  Peak: {peakZoneLabel}
                </div>
              )}
            </div>

            {consistencyNote && (
              <p className="text-xs text-gray-400 mb-4">{consistencyNote}</p>
            )}

            <div className="w-full h-[200px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consistencyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis
                    dataKey="range"
                    stroke="#4B5563"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#4B5563"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[#181829] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
                            <p className="text-xs text-white font-bold">{item.range}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {item.throws ?? item.count ?? item.attempts ?? 0} {consistencyBarLabel}
                            </p>
                            {item.percentage != null && (
                              <p className="text-[11px] text-pink-400 font-semibold">{item.percentage}% of total</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {consistencyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.peak ? "#FF0055" : "#374151"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {peakZoneLabel && (
              <div className="mt-4 bg-gradient-to-r from-[#FF0055]/10 to-transparent border border-[#FF0055]/20 rounded-xl p-3 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF0055] animate-pulse shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">Peak Performance Zone</div>
                  <div className="text-xs text-white font-bold">{peakZoneLabel}</div>
                </div>
              </div>
            )}
          </div>
        )} */}

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

        {/* Athlete's Corner & Athlete Hub Section */}
        {!resolvedIsClub && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Athlete's Corner */}
            <div className="lg:col-span-6 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">{firstName}'s Corner</h3>
                  {/* <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button> */}
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
                      title: `Mental Toughness: ${firstName}'s Mindset`,
                      type: "Audio",
                      duration: "15 min",
                      views: "189K",
                      time: "5d ago",
                      icon: <Volume2 className="w-4 h-4 text-pink-400" />,
                      bg: "bg-pink-500/10",
                    },
                    {
                      title: `Training Breakdown: ${name}`,
                      type: "Video",
                      duration: "10 min",
                      views: "234K",
                      time: "3d ago",
                      icon: <Video className="w-4 h-4 text-orange-400" />,
                      bg: "bg-orange-500/10",
                    },
                    {
                      title: `${firstName}'s Competition Strategy`,
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
                <button
                  onClick={() => scroll(hubScrollRef, "left")}
                  className="sm:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

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
                      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl group-hover:bg-[#FF0055]/20 transition-all duration-300" />

                      <span className="absolute top-3 right-3 min-w-6 h-6 px-2 flex items-center justify-center rounded-full bg-[#FF0055] text-[10px] font-semibold text-white shadow-lg">
                        {item.badge}
                      </span>

                      <div className="relative flex h-full flex-col justify-between overflow-visible">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-3xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                          {item.icon}
                        </div>

                        <div className="mt-4 flex flex-col gap-1">
                          <h4 className="text-sm font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-[#FF0055]">
                            {item.title}
                          </h4>
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
        {!resolvedIsClub && medals.length > 0 && (
          <div className="bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Medal Cabinet</h3>
              {/* <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button> */}
            </div>

            <div className="relative">
              <button
                onClick={() => scroll(medalScrollRef, "left")}
                className="sm:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

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
