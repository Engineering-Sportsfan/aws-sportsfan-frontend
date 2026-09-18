"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Play,
  Film,
  Headphones,
  Clock,
  Calendar,
  Share2,
  Heart,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  List,
  Flame,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { handleGoBack } from "@/utils/backButton";

interface FlipLongVideoItem {
  id: string;
  videoId?: string;
  title: string;
  description?: string;
  url?: string;
  videoUrl?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  durationSeconds?: number;
  format?: string;
  resourceType?: "video" | "image";
  type?: "VIDEO" | "AUDIO";
  sport?: string;
  author?: string;
  likes?: number;
  likeCount?: number;
  likedBy?: string[];
  createdAt?: string;
  createdAtMs?: number;
}

interface MediaItem {
  id: string;
  title: string;
  fileName?: string;
  url: string;
  thumbnailUrl: string;
  resourceType: "image" | "video";
  duration?: string;
  durationSeconds?: number;
  format: string;
  likes?: number;
  likedBy?: string[];
  createdAt?: string;
}

interface PlaybookDrop {
  id: string;
  type: "AUDIO" | "VIDEO";
  title: string;
  duration: string;
  durationSecs: number;
  timestamp: string;
  createdAtMs: number;
  gradient: string;
  glowColor: string;
  badgeBg: string;
  badgeTextColor: string;
  mediaUrl: string;
  thumbnailUrl: string;
  author?: string;
  sport?: string;
  likes: number;
  likedBy: string[];
}

const STYLE_PRESETS = [
  {
    gradient: "linear-gradient(135deg, #3b0764 0%, #18022e 100%)",
    glowColor: "rgba(233, 30, 140, 0.45)",
    badgeBg: "rgba(233, 30, 140, 0.22)",
    badgeTextColor: "#FF52B5",
  },
  {
    gradient: "linear-gradient(135deg, #431407 0%, #1c0a02 100%)",
    glowColor: "rgba(249, 115, 22, 0.45)",
    badgeBg: "rgba(249, 115, 22, 0.22)",
    badgeTextColor: "#FFA07A",
  },
  {
    gradient: "linear-gradient(135deg, #082f49 0%, #031424 100%)",
    glowColor: "rgba(6, 182, 212, 0.45)",
    badgeBg: "rgba(6, 182, 212, 0.22)",
    badgeTextColor: "#00E5FF",
  },
  {
    gradient: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    glowColor: "rgba(16, 185, 129, 0.45)",
    badgeBg: "rgba(16, 185, 129, 0.22)",
    badgeTextColor: "#34D399",
  },
  {
    gradient: "linear-gradient(135deg, #4c0519 0%, #1f020a 100%)",
    glowColor: "rgba(244, 63, 94, 0.45)",
    badgeBg: "rgba(244, 63, 94, 0.22)",
    badgeTextColor: "#FB7185",
  },
];

// Helper to clean title
function cleanTitle(title: string): string {
  return (title || "").replace(/\s[a-z0-9]{5,8}$/i, "").trim();
}

function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatTimestamp(isoDate?: string | number): string {
  if (!isoDate) return "Recently";
  const date = typeof isoDate === "number" ? new Date(isoDate) : new Date(isoDate);
  if (isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mapFlipLongToDrop(v: FlipLongVideoItem, index: number): PlaybookDrop {
  const preset = STYLE_PRESETS[index % STYLE_PRESETS.length];
  const mediaUrl = v.videoUrl || v.url || v.mediaUrl || "";
  const duration = v.duration || "0:00";
  const durationSecs = v.durationSeconds || parseDurationToSeconds(duration);
  const createdAtMs = v.createdAtMs || (v.createdAt ? new Date(v.createdAt).getTime() : Date.now());
  const cleanId = v.id || v.videoId || `fliplong-${index}`;

  return {
    id: cleanId,
    type: "VIDEO",
    title: cleanTitle(v.title || "Untitled Drop"),
    duration,
    durationSecs,
    timestamp: formatTimestamp(v.createdAt || v.createdAtMs),
    createdAtMs,
    mediaUrl,
    thumbnailUrl: v.thumbnailUrl || "",
    author: v.author || "SportsFan Creator",
    sport: v.sport || "Cricket",
    likes: Number(v.likes || v.likeCount || 0),
    likedBy: Array.isArray(v.likedBy) ? v.likedBy : [],
    ...preset,
  };
}

function mapCloudinaryToDrop(item: MediaItem, index: number): PlaybookDrop {
  const preset = STYLE_PRESETS[index % STYLE_PRESETS.length];
  const isVideo = item.resourceType === "video";
  const duration = item.duration || "0:00";
  const durationSecs = item.durationSeconds || parseDurationToSeconds(duration);
  const createdAtMs = item.createdAt ? new Date(item.createdAt).getTime() : 0;

  return {
    id: item.id,
    type: isVideo ? "VIDEO" : "AUDIO",
    title: cleanTitle(item.title || "Untitled Media"),
    duration,
    durationSecs,
    timestamp: formatTimestamp(item.createdAt),
    createdAtMs,
    mediaUrl: item.url,
    thumbnailUrl: item.thumbnailUrl || "",
    author: "Official Broadcast",
    sport: "Cricket",
    likes: Number(item.likes || 0),
    likedBy: Array.isArray(item.likedBy) ? item.likedBy : [],
    ...preset,
  };
}

export default function FlipLongPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [drops, setDrops] = useState<PlaybookDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "VIDEO" | "AUDIO">("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "duration_desc" | "duration_asc" | "title" | "likes">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Like system state (in-memory, driven by database)
  const [likedDrops, setLikedDrops] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper to obtain user ID
  const getActorId = useCallback(() => {
    if (user?.userId) return user.userId;
    if (user?.email) return user.email;
    return "guest";
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2400);
  };

  const fetchMedia = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [flipLongRes, cloudinaryRes] = await Promise.allSettled([
        fetch("/api/flipLong").then((r) => r.json()),
        fetch("/api/cloudinary/cricket-media").then((r) => r.json()),
      ]);

      const allDrops: PlaybookDrop[] = [];
      const seenUrls = new Set<string>();

      // 1. Add FlipLong videos
      if (flipLongRes.status === "fulfilled" && flipLongRes.value?.success && Array.isArray(flipLongRes.value.videos)) {
        flipLongRes.value.videos.forEach((video: FlipLongVideoItem, idx: number) => {
          const drop = mapFlipLongToDrop(video, idx);
          if (drop.mediaUrl && !seenUrls.has(drop.mediaUrl)) {
            seenUrls.add(drop.mediaUrl);
            allDrops.push(drop);
          }
        });
      }

      // 2. Add Cloudinary cricket media
      if (cloudinaryRes.status === "fulfilled" && cloudinaryRes.value?.success && Array.isArray(cloudinaryRes.value.mediaFiles)) {
        cloudinaryRes.value.mediaFiles.forEach((item: MediaItem, idx: number) => {
          const drop = mapCloudinaryToDrop(item, allDrops.length + idx);
          if (drop.mediaUrl && !seenUrls.has(drop.mediaUrl)) {
            seenUrls.add(drop.mediaUrl);
            allDrops.push(drop);
          }
        });
      }

      const styledDrops = allDrops.map((drop, i) => ({
        ...drop,
        ...STYLE_PRESETS[i % STYLE_PRESETS.length],
      }));

      // Initialize like counts and sync with likedBy from DB
      const actorId = getActorId();
      const initialLikeCounts: Record<string, number> = {};
      const newLikedDrops = new Set<string>();

      styledDrops.forEach((d) => {
        initialLikeCounts[d.id] = Number(d.likes || 0);
        if (d.likedBy && d.likedBy.includes(actorId)) {
          newLikedDrops.add(d.id);
        }
      });

      setDrops(styledDrops);
      setLikeCounts(initialLikeCounts);
      setLikedDrops(newLikedDrops);

      if (isManualRefresh) showToast("Updated drop list");
    } catch (err) {
      console.error("Failed to load drops:", err);
      showToast("Failed to refresh drops");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getActorId]);

  useEffect(() => {
    fetchMedia();

    const handleVideoCreated = () => {
      fetchMedia();
    };

    const handleVideoLiked = (e: any) => {
      const { id, likes, isLiked } = e.detail || {};
      if (id) {
        if (typeof likes === "number") {
          setLikeCounts((prev) => ({ ...prev, [id]: likes }));
        }
        if (isLiked === true) {
          setLikedDrops((prev) => new Set([...Array.from(prev), id]));
        } else if (isLiked === false) {
          setLikedDrops((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    };

    window.addEventListener("fliplong-video-created", handleVideoCreated);
    window.addEventListener("fliplong-video-liked", handleVideoLiked);
    return () => {
      window.removeEventListener("fliplong-video-created", handleVideoCreated);
      window.removeEventListener("fliplong-video-liked", handleVideoLiked);
    };
  }, [fetchMedia]);

  // Handle Like / Unlike toggle action
  const handleLike = async (drop: PlaybookDrop, e: React.MouseEvent) => {
    e.stopPropagation();
    const actorId = getActorId();
    const isCurrentlyLiked = likedDrops.has(drop.id);
    const currentCount = likeCounts[drop.id] ?? drop.likes ?? 0;

    if (isCurrentlyLiked) {
      // ─── UNLIKE ───
      const newCount = Math.max(0, currentCount - 1);
      setLikedDrops((prev) => {
        const next = new Set(prev);
        next.delete(drop.id);
        return next;
      });
      setLikeCounts((prev) => ({ ...prev, [drop.id]: newCount }));
      showToast("Unliked");

      window.dispatchEvent(
        new CustomEvent("fliplong-video-liked", {
          detail: { id: drop.id, likes: newCount, isLiked: false },
        })
      );

      try {
        const res = await fetch("/api/flipLong/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: drop.id,
            videoId: drop.id,
            userId: actorId,
            action: "unlike",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && typeof data.likes === "number") {
            setLikeCounts((prev) => ({ ...prev, [drop.id]: data.likes }));
          }
        }
      } catch (err) {
        console.warn("Backend unlike sync notice:", err);
      }
    } else {
      // ─── LIKE ───
      const newCount = currentCount + 1;
      setLikedDrops((prev) => {
        const next = new Set(prev);
        next.add(drop.id);
        return next;
      });
      setLikeCounts((prev) => ({ ...prev, [drop.id]: newCount }));
      showToast("Liked! ❤️");

      window.dispatchEvent(
        new CustomEvent("fliplong-video-liked", {
          detail: { id: drop.id, likes: newCount, isLiked: true },
        })
      );

      try {
        const res = await fetch("/api/flipLong/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: drop.id,
            videoId: drop.id,
            userId: actorId,
            action: "like",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && typeof data.likes === "number") {
            setLikeCounts((prev) => ({ ...prev, [drop.id]: data.likes }));
          }
        }
      } catch (err) {
        console.warn("Backend like sync notice:", err);
      }
    }
  };

  const handleCardClick = (drop: PlaybookDrop) => {
    const isAudio = drop.type === "AUDIO";
    if (isAudio) {
      router.push(
        `/MainModules/AudioDrop?url=${encodeURIComponent(drop.mediaUrl)}&title=${encodeURIComponent(drop.title)}`
      );
    } else if (drop.id) {
      router.push(`/MainModules/VideoDrop?id=${encodeURIComponent(drop.id)}`);
    } else {
      const cloudMatch = drop.mediaUrl.match(/res\.cloudinary\.com\/[^/]+\/video\/upload\/(?:v\d+\/)?(.+?)(?:\?.*)?$/);
      if (cloudMatch && cloudMatch[1]) {
        router.push(`/MainModules/VideoDrop?c=${encodeURIComponent(cloudMatch[1])}`);
      } else {
        router.push(`/MainModules/VideoDrop?url=${encodeURIComponent(drop.mediaUrl)}&title=${encodeURIComponent(drop.title)}`);
      }
    }
  };

  const handleShare = async (drop: PlaybookDrop, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== "undefined"
      ? drop.type === "AUDIO"
        ? `${window.location.origin}/MainModules/AudioDrop?url=${encodeURIComponent(drop.mediaUrl)}&title=${encodeURIComponent(drop.title)}`
        : `${window.location.origin}/MainModules/VideoDrop?id=${encodeURIComponent(drop.id)}`
      : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: drop.title,
          text: `Check out this FlipLONG drop on SportsFan 360!`,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard!");
    } catch {
      showToast("Unable to copy link");
    }
  };

  const handleBack = () => {
    handleGoBack(router);
  };

  // Filter & Sort drops
  const filteredDrops = useMemo(() => {
    return drops
      .filter((drop) => {
        if (typeFilter !== "ALL" && drop.type !== typeFilter) return false;
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = drop.title.toLowerCase().includes(query);
        const matchesAuthor = drop.author?.toLowerCase().includes(query);
        const matchesSport = drop.sport?.toLowerCase().includes(query);
        return matchesTitle || matchesAuthor || matchesSport;
      })
      .sort((a, b) => {
        if (sortBy === "likes") {
          const aL = likeCounts[a.id] ?? a.likes ?? 0;
          const bL = likeCounts[b.id] ?? b.likes ?? 0;
          return bL - aL;
        }
        if (sortBy === "newest") return b.createdAtMs - a.createdAtMs;
        if (sortBy === "oldest") return a.createdAtMs - b.createdAtMs;
        if (sortBy === "duration_desc") return b.durationSecs - a.durationSecs;
        if (sortBy === "duration_asc") return a.durationSecs - b.durationSecs;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [drops, searchQuery, typeFilter, sortBy, likeCounts]);

  // Featured Spotlight Drop (first video or first item)
  const featuredDrop = useMemo(() => {
    if (drops.length === 0) return null;
    return drops.find((d) => d.type === "VIDEO") || drops[0];
  }, [drops]);

  const videoCount = useMemo(() => drops.filter((d) => d.type === "VIDEO").length, [drops]);
  const audioCount = useMemo(() => drops.filter((d) => d.type === "AUDIO").length, [drops]);

  return (
    <div className="min-h-screen bg-[#07090E] text-white pb-24 overflow-x-hidden selection:bg-rose-500/30">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1b2234]/95 text-white px-4 py-2.5 rounded-full border border-white/15 shadow-2xl backdrop-blur-md text-xs font-medium"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#07090E]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              data-nav="back"
              aria-label="Back"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  FlipLONG Drops
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-400 border border-rose-500/30">
                  <Sparkles className="w-3 h-3 text-rose-400" />
                  {drops.length} Drops
                </span>
              </div>
              <p className="text-[11px] text-white/50 hidden sm:block">
                Exclusive creator insights, locker-room clips & audio playbooks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMedia(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-xs font-semibold text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-rose-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* Featured Hero Spotlight Banner */}
        {featuredDrop && !searchQuery && typeFilter === "ALL" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
            onClick={() => handleCardClick(featuredDrop)}
            style={{
              background: "linear-gradient(135deg, #180928 0%, #0c0517 50%, #07090e 100%)",
            }}
          >
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity duration-500">
              {featuredDrop.thumbnailUrl && (
                <img
                  src={featuredDrop.thumbnailUrl}
                  alt={featuredDrop.title}
                  className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 blur-[2px]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/80 to-transparent" />
            </div>

            <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                    <Flame className="w-3 h-3 fill-current" />
                    Featured Spotlight
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 backdrop-blur-sm border border-white/10">
                    {featuredDrop.type}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight drop-shadow-md">
                  {featuredDrop.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/60">
                  <span className="flex items-center gap-1.5 text-white/80">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    {featuredDrop.duration}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/40" />
                    {featuredDrop.timestamp}
                  </span>
                  {featuredDrop.author && (
                    <>
                      <span>•</span>
                      <span className="text-white/70">{featuredDrop.author}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Now</span>
                </motion.button>

                {/* Like Button */}
                <button
                  onClick={(e) => handleLike(featuredDrop, e)}
                  className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-full border transition-all duration-200 cursor-pointer ${
                    likedDrops.has(featuredDrop.id)
                      ? "bg-rose-500/25 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20"
                      : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
                  }`}
                  title={likedDrops.has(featuredDrop.id) ? "Liked" : "Like Drop"}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform ${
                      likedDrops.has(featuredDrop.id) ? "fill-current text-rose-500 scale-110" : ""
                    }`}
                  />
                  <span className="text-xs font-bold">
                    {likeCounts[featuredDrop.id] ?? featuredDrop.likes ?? 0}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={(e) => handleShare(featuredDrop, e)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
                  title="Share Drop"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters & Control Toolbar */}
        <div className="bg-[#101420] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drops by title, athlete, or topic..."
                className="w-full pl-10 pr-9 py-2 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-rose-500/50 rounded-xl text-xs font-medium text-white placeholder-white/40 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  typeFilter === "ALL"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                    : "bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.09]"
                }`}
              >
                All Drops ({drops.length})
              </button>

              <button
                onClick={() => setTypeFilter("VIDEO")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  typeFilter === "VIDEO"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                    : "bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.09]"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Videos ({videoCount})</span>
              </button>

              <button
                onClick={() => setTypeFilter("AUDIO")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  typeFilter === "AUDIO"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                    : "bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.09]"
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Audio ({audioCount})</span>
              </button>
            </div>
          </div>

          {/* Secondary Controls: Sorting & View Mode */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-semibold flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#171d2e] border border-white/10 text-white/80 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:border-rose-500/50 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="likes">Most Liked</option>
                <option value="oldest">Oldest First</option>
                <option value="duration_desc">Longest Duration</option>
                <option value="duration_asc">Shortest Duration</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-white/40 font-medium mr-1 hidden sm:inline">
                Showing {filteredDrops.length} of {drops.length}
              </span>

              <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === "list" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden animate-pulse"
              >
                <div className="w-full h-44 bg-white/[0.05]" />
                <div className="p-4 space-y-3 bg-[#111624]">
                  <div className="h-3.5 bg-white/10 rounded w-4/5" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDrops.length === 0 && (
          <div className="text-center py-16 px-4 bg-[#101420]/50 rounded-3xl border border-white/[0.06] max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-white/40">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Drops Found</h3>
            <p className="text-xs text-white/50 mb-5">
              {searchQuery
                ? `We couldn't find any drops matching "${searchQuery}".`
                : "No drops available for the selected category."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("ALL");
              }}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Grid View */}
        {!loading && filteredDrops.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredDrops.map((drop, idx) => {
              const isLiked = likedDrops.has(drop.id);
              const count = likeCounts[drop.id] ?? drop.likes ?? 0;

              return (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                  onClick={() => handleCardClick(drop)}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="group relative rounded-2xl overflow-hidden bg-[#111624] border border-white/[0.08] hover:border-white/25 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Media Thumbnail Box */}
                  <div
                    className="w-full h-44 relative flex items-center justify-center overflow-hidden shrink-0"
                    style={{ background: drop.gradient }}
                  >
                    {drop.thumbnailUrl && (
                      <img
                        src={drop.thumbnailUrl}
                        alt={drop.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-108 group-hover:opacity-90 transition-all duration-500"
                      />
                    )}

                    {/* Media Type Badge */}
                    <span
                      className="absolute top-3 left-3 z-10 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md"
                      style={{ background: drop.badgeBg, color: drop.badgeTextColor }}
                    >
                      {drop.type}
                    </span>

                    {/* Like Heart Button in Thumbnail Corner */}
                    {/* <button
                      onClick={(e) => handleLike(drop, e)}
                      className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                        isLiked
                          ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/40 scale-105"
                          : "bg-black/50 hover:bg-black/80 text-white/80 hover:text-white"
                      }`}
                      title={isLiked ? "Liked" : "Like Drop"}
                    >
                      <Heart
                        size={12}
                        className={isLiked ? "fill-current text-white scale-110" : "text-white/80"}
                      />
                      <span className="text-[10px] font-bold leading-none">{count}</span>
                    </button> */}

                    {/* Centered Play Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-80 group-hover:opacity-100 group-hover:bg-black/35 transition-all">
                      <div
                        className="w-12 h-12 rounded-full border border-white/25 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500/90 group-hover:border-rose-400 transition-all shadow-xl"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.12)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Duration Tag */}
                    <span
                      className="absolute bottom-2.5 right-2.5 z-10 text-[10px] font-bold text-white px-2 py-0.5 rounded-md leading-none backdrop-blur-md flex items-center gap-1 shadow-sm"
                      style={{ background: "rgba(0, 0, 0, 0.7)" }}
                    >
                      <Clock className="w-2.5 h-2.5 text-white/60" />
                      {drop.duration}
                    </span>
                  </div>

                  {/* Card Content with Uniform Clamped Height */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 bg-[#111624]">
                    <div>
                      <h3
                        className="text-xs font-bold text-white leading-snug line-clamp-2 overflow-hidden text-ellipsis group-hover:text-rose-300 transition-colors h-[34px]"
                        title={drop.title}
                      >
                        {drop.title}
                      </h3>
                    </div>

                    <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10.5px] text-white/40">
                      <span className="truncate max-w-[120px]">
                        {drop.timestamp}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleLike(drop, e)}
                          className={`flex items-center gap-1 transition-colors cursor-pointer ${
                            isLiked ? "text-rose-400 font-bold" : "text-white/40 hover:text-rose-400"
                          }`}
                          title={isLiked ? "Liked" : "Like"}
                        >
                          <Heart size={12} className={isLiked ? "fill-current text-rose-500" : ""} />
                          <span>{count}</span>
                        </button>

                        <button
                          onClick={(e) => handleShare(drop, e)}
                          className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {!loading && filteredDrops.length > 0 && viewMode === "list" && (
          <div className="space-y-3">
            {filteredDrops.map((drop, idx) => {
              const isLiked = likedDrops.has(drop.id);
              const count = likeCounts[drop.id] ?? drop.likes ?? 0;

              return (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.2) }}
                  onClick={() => handleCardClick(drop)}
                  whileHover={{ scale: 1.005 }}
                  className="group p-3.5 rounded-2xl bg-[#111624] border border-white/[0.08] hover:border-white/25 shadow-md flex items-center justify-between gap-4 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div
                      className="w-24 h-16 rounded-xl relative overflow-hidden shrink-0 flex items-center justify-center shadow-md"
                      style={{ background: drop.gradient }}
                    >
                      {drop.thumbnailUrl && (
                        <img
                          src={drop.thumbnailUrl}
                          alt={drop.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-rose-500 group-hover:scale-110 transition-all">
                          <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                        {drop.duration}
                      </span>
                    </div>

                    {/* Title & Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                          style={{ background: drop.badgeBg, color: drop.badgeTextColor }}
                        >
                          {drop.type}
                        </span>
                        <span className="text-[11px] text-white/40">•</span>
                        <span className="text-[11px] text-white/40">{drop.timestamp}</span>
                      </div>

                      <h3
                        className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1 truncate"
                        title={drop.title}
                      >
                        {drop.title}
                      </h3>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleLike(drop, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isLiked
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-400 font-bold"
                          : "bg-white/[0.04] hover:bg-white/[0.1] border-white/10 text-white/70 hover:text-white"
                      }`}
                      title={isLiked ? "Liked" : "Like Drop"}
                    >
                      <Heart
                        size={13}
                        className={isLiked ? "fill-current text-rose-500 scale-110" : ""}
                      />
                      <span className="text-xs">{count}</span>
                    </button>

                    <button
                      onClick={(e) => handleShare(drop, e)}
                      className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors cursor-pointer"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 group-hover:bg-rose-500 text-white font-semibold text-xs transition-colors">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
