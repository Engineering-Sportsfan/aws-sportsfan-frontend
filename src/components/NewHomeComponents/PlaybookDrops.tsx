"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  createdAt?: string;
}

interface PlaybookDrop {
  id: string;
  type: "AUDIO" | "VIDEO";
  title: string;
  duration: string;
  timestamp: string;
  gradient: string;
  glowColor: string;
  badgeBg: string;
  badgeTextColor: string;
  mediaUrl: string;
  thumbnailUrl: string;
  createdAtMs?: number;
}

const STYLE_PRESETS = [
  {
    gradient: "linear-gradient(to bottom, #2b0b2e 0%, #0d0614 100%)",
    glowColor: "rgba(233, 30, 140, 0.4)",
    badgeBg: "rgba(233, 30, 140, 0.2)",
    badgeTextColor: "#FF52B5",
  },
  {
    gradient: "linear-gradient(to bottom, #3b1c0b 0%, #120805 100%)",
    glowColor: "rgba(249, 115, 22, 0.4)",
    badgeBg: "rgba(249, 115, 22, 0.2)",
    badgeTextColor: "#FFA07A",
  },
  {
    gradient: "linear-gradient(to bottom, #0b1f3b 0%, #030814 100%)",
    glowColor: "rgba(6, 182, 212, 0.4)",
    badgeBg: "rgba(6, 182, 212, 0.2)",
    badgeTextColor: "#00E5FF",
  },
];

function cleanTitle(title: string): string {
  return (title || "").replace(/\s[a-z0-9]{5,8}$/i, "");
}

function formatTimestamp(isoDate?: string | number): string {
  if (!isoDate) return "";
  const date = typeof isoDate === "number" ? new Date(isoDate) : new Date(isoDate);
  if (isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function mapFlipLongToDrop(v: FlipLongVideoItem, index: number): PlaybookDrop {
  const preset = STYLE_PRESETS[index % STYLE_PRESETS.length];
  const mediaUrl = v.videoUrl || v.url || v.mediaUrl || "";
  return {
    id: v.id || v.videoId || `fliplong-${index}`,
    type: "VIDEO",
    title: cleanTitle(v.title || "Untitled Video"),
    duration: v.duration || "0:00",
    timestamp: formatTimestamp(v.createdAt || v.createdAtMs),
    mediaUrl,
    thumbnailUrl: v.thumbnailUrl || "",
    createdAtMs: v.createdAtMs || (v.createdAt ? new Date(v.createdAt).getTime() : Date.now()),
    ...preset,
  };
}

function mapCloudinaryToDrop(item: MediaItem, index: number): PlaybookDrop {
  const preset = STYLE_PRESETS[index % STYLE_PRESETS.length];
  const isVideo = item.resourceType === "video";

  return {
    id: item.id,
    type: isVideo ? "VIDEO" : "AUDIO",
    title: cleanTitle(item.title),
    duration: item.duration || "0:00",
    timestamp: formatTimestamp(item.createdAt),
    mediaUrl: item.url,
    thumbnailUrl: item.thumbnailUrl,
    createdAtMs: item.createdAt ? new Date(item.createdAt).getTime() : 0,
    ...preset,
  };
}

export default function PlaybookDrops() {
  const router = useRouter();
  const [drops, setDrops] = useState<PlaybookDrop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    try {
      // Parallel fetch from both FlipLong DynamoDB/Firestore and Cloudinary media
      const [flipLongRes, cloudinaryRes] = await Promise.allSettled([
        fetch("/api/flipLong").then((r) => r.json()),
        fetch("/api/cloudinary/cricket-media").then((r) => r.json()),
      ]);

      const allDrops: PlaybookDrop[] = [];
      const seenUrls = new Set<string>();

      // 1. Add FlipLong videos (user uploaded)
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

      // Re-apply style presets evenly across full drop collection
      const styledDrops = allDrops.map((drop, i) => ({
        ...drop,
        ...STYLE_PRESETS[i % STYLE_PRESETS.length],
      }));

      setDrops(styledDrops);
    } catch (err) {
      console.error("Failed to load playbook drops:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();

    // Listen for custom event when new video is created in CreateArticles dialog
    const handleVideoCreated = () => {
      fetchMedia();
    };

    window.addEventListener("fliplong-video-created", handleVideoCreated);
    return () => {
      window.removeEventListener("fliplong-video-created", handleVideoCreated);
    };
  }, [fetchMedia]);

// Helper to encode payload into URL-safe Base64
const toBase64Url = (str: string): string => {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "utf-8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return encodeURIComponent(str);
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

  if (loading) {
    return (
      <div className="w-full mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[17px] font-extrabold text-white">FlipLONG Drops</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="shrink-0 w-[210px] rounded-[24px] bg-white/5 overflow-hidden"
              style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <div className="w-full h-[160px] bg-white/[0.06] animate-pulse" />
              <div className="w-full min-h-[62px] p-4 flex flex-col justify-center gap-2 bg-[#121622]">
                <div className="h-3 w-4/5 rounded bg-white/10 animate-pulse" />
                <div className="h-2.5 w-1/3 rounded bg-white/[0.06] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (drops.length === 0) return null;

  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">FlipLONG Drops</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            onClick={() => handleCardClick(drop)}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 w-[210px] rounded-[24px] overflow-hidden flex flex-col snap-start cursor-pointer transition-shadow"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              className="w-full h-[160px] relative flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: drop.gradient }}
            >
              {drop.thumbnailUrl && (
                <img
                  src={drop.thumbnailUrl}
                  alt={drop.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
              )}

              <span
                className="absolute top-4 left-4 z-10 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ background: drop.badgeBg, color: drop.badgeTextColor }}
              >
                {drop.type}
              </span>

              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                  }}
                >
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="text-white fill-white ml-0.5">
                    <path d="M13 8L1 15V1L13 8Z" />
                  </svg>
                </div>
              </div>

              {/* Duration badge, bottom-right of the thumbnail */}
              <span
                className="absolute bottom-2.5 right-2.5 z-10 text-[10px] font-bold text-white px-2 py-0.5 rounded-md leading-none"
                style={{ background: "rgba(0, 0, 0, 0.6)" }}
              >
                {drop.duration}
              </span>
            </div>

            <div className="w-full min-h-[62px] bg-[#121622] p-4 flex flex-col justify-start gap-1.5">
              <h4 className="text-[10.5px] font-bold text-white leading-[1.3] text-left">
                {drop.title}
              </h4>

              {drop.timestamp && (
                <div className="w-full flex justify-start">
                  <span className="text-[10.5px] font-semibold text-white/30 leading-none">
                    {drop.timestamp}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}