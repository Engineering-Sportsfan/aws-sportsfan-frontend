"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Heart, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { handleGoBack as goBackWithScroll } from "@/utils/backButton";

type VideoDrop = {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  views: number;
  signals: number;
  likes?: number;
  likedBy?: string[];
  duration: string;
  durationSecs?: number;
  date?: string;
  room?: string;
  engagement: number;
  videoUrl?: string;
  mediaUrl?: string;
  thumbnail?: string;
  listens?: number;
};

interface Playlist {
  id: string;
  team360PostId: string;
  audioDrops: unknown[];
  videoDrops: VideoDrop[];
  createdAt: number;
  updatedAt: number;
}

interface ApiResponse {
  success: boolean;
  playlists: Playlist[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Helper to parse duration string (e.g., "4:32") to seconds
const parseDurationToSeconds = (duration: string): number => {
  const parts = duration.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  return 0;
};

// Helper to format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Unicode-safe Base64URL encoder
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

// Unicode-safe Base64URL decoder
const fromBase64Url = (str: string): string => {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64, "base64").toString("utf-8");
    }
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return decodeURIComponent(str);
  }
};

// Helper to encode playlistId and videoIndex safely for URLs
const encodeShortId = (playlistId: string, videoIndex: number): string => {
  return toBase64Url(`${playlistId}:${videoIndex}`);
};

// Helper to decode short ID back to playlistId and videoIndex, or Cloudinary path
const decodeShortId = (shortId: string): { playlistId: string; videoIndex: number; cloudinaryPath?: string } | null => {
  try {
    const decoded = fromBase64Url(shortId);
    if (decoded.startsWith('c:')) {
      return { playlistId: '', videoIndex: 0, cloudinaryPath: decoded.slice(2) };
    }
    const [playlistId, videoIndexStr] = decoded.split(':');
    if (playlistId && videoIndexStr !== undefined && !isNaN(parseInt(videoIndexStr, 10))) {
      return { playlistId, videoIndex: parseInt(videoIndexStr, 10) };
    }
    if (shortId.includes('_')) {
      const parts = shortId.split('_');
      const idx = parseInt(parts.pop() || '0', 10);
      const pId = parts.join('_');
      if (pId && !isNaN(idx)) {
        return { playlistId: pId, videoIndex: idx };
      }
    }
    return null;
  } catch {
    return null;
  }
};

// Helper to find video drop by URL from all playlists
const findVideoDropByUrl = (playlists: Playlist[], url: string): { drop: VideoDrop | null, playlist: Playlist | null, index: number } => {
  for (const playlist of playlists) {
    const index = playlist.videoDrops.findIndex(drop => drop.mediaUrl === url);
    if (index !== -1) {
      return { drop: playlist.videoDrops[index], playlist, index };
    }
  }
  return { drop: null, playlist: null, index: -1 };
};

export default function VideoDropCard() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id") || searchParams.get("cId");
  const cParam = searchParams.get("c"); // Cloudinary short path (e.g. q_auto/video.mp4 or public_id)
  const vParam = searchParams.get("v"); // Base64 token
  const urlParam = searchParams.get("url");
  const titleParam = searchParams.get("title");
  const playlistId = searchParams.get("playlistId") || searchParams.get("p");
  const videoIndex = parseInt(searchParams.get("videoIndex") || searchParams.get("i") || "0", 10);
  const shortId = searchParams.get("shortId"); // Parameter for short ID
  const [playing, setPlaying] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(true);
  const iconTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState(0);
  const [videoDrop, setVideoDrop] = useState<VideoDrop | null>(null);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(playlistId || null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(videoIndex || 0);
  const [activeId, setActiveId] = useState<string | null>(idParam || null);
  const [activeCloudinaryPath, setActiveCloudinaryPath] = useState<string | null>(cParam || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getActorId = useCallback(() => {
    if (user?.userId) return user.userId;
    if (user?.email) return user.email;
    return "guest";
  }, [user]);

  // Sync like state on video or ID change directly from backend data
  useEffect(() => {
    const videoKey = activeId || videoDrop?.id || idParam || urlParam || cParam;
    if (!videoKey) return;

    const actorId = getActorId();
    const initialLikes = Number(videoDrop?.likes ?? videoDrop?.likeCount ?? 0);

    setLikeCount(initialLikes);
    if (videoDrop?.likedBy && Array.isArray(videoDrop.likedBy) && videoDrop.likedBy.includes(actorId)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }

    // Live query like status from backend (DynamoDB/Firestore)
    axios
      .get(`/api/flipLong/like?id=${encodeURIComponent(videoKey)}&userId=${encodeURIComponent(actorId)}`)
      .then((res) => {
        if (res.data?.success) {
          if (typeof res.data.likes === "number") {
            setLikeCount(res.data.likes);
          }
          setIsLiked(Boolean(res.data.isLiked));
        }
      })
      .catch(() => {});
  }, [activeId, videoDrop?.id, videoDrop?.likes, videoDrop?.likedBy, idParam, urlParam, cParam, getActorId]);

  // Listen for global like events from other pages / tabs
  useEffect(() => {
    const handleVideoLiked = (e: any) => {
      const { id, likes, isLiked: nextIsLiked } = e.detail || {};
      const videoKey = activeId || videoDrop?.id || idParam || urlParam || cParam;
      if (id && videoKey && (id === videoKey || id.includes(videoKey) || videoKey.includes(id))) {
        if (typeof likes === "number") setLikeCount(likes);
        if (typeof nextIsLiked === "boolean") setIsLiked(nextIsLiked);
      }
    };
    window.addEventListener("fliplong-video-liked", handleVideoLiked);
    return () => {
      window.removeEventListener("fliplong-video-liked", handleVideoLiked);
    };
  }, [activeId, videoDrop?.id, idParam, urlParam, cParam]);

  const handleToggleLike = async () => {
    const videoKey = activeId || videoDrop?.id || idParam || urlParam || cParam;
    if (!videoKey) return;

    const actorId = getActorId();

    if (isLiked) {
      // ─── UNLIKE ───
      const nextCount = Math.max(0, likeCount - 1);
      setIsLiked(false);
      setLikeCount(nextCount);
      setToastMessage("Unliked");
      setTimeout(() => setToastMessage(null), 2000);

      window.dispatchEvent(
        new CustomEvent("fliplong-video-liked", {
          detail: { id: videoKey, likes: nextCount, isLiked: false },
        })
      );

      try {
        const res = await axios.post("/api/flipLong/like", {
          id: videoKey,
          videoId: videoKey,
          userId: actorId,
          action: "unlike",
        });
        if (res.data?.success && typeof res.data.likes === "number") {
          setLikeCount(res.data.likes);
        }
      } catch (err) {
        console.warn("Backend unlike sync notice:", err);
      }
    } else {
      // ─── LIKE ───
      const nextCount = likeCount + 1;
      setIsLiked(true);
      setLikeCount(nextCount);
      setToastMessage("Liked! ❤️");
      setTimeout(() => setToastMessage(null), 2000);

      window.dispatchEvent(
        new CustomEvent("fliplong-video-liked", {
          detail: { id: videoKey, likes: nextCount, isLiked: true },
        })
      );

      try {
        const res = await axios.post("/api/flipLong/like", {
          id: videoKey,
          videoId: videoKey,
          userId: actorId,
          action: "like",
        });
        if (res.data?.success && typeof res.data.likes === "number") {
          setLikeCount(res.data.likes);
        }
      } catch (err) {
        console.warn("Backend like sync notice:", err);
      }
    }
  };

  // Intelligent back navigation with scroll position restoration
  const handleGoBack = () => {
    goBackWithScroll(router);
  };

  useEffect(() => {
    fetchVideoData();
  }, [playlistId, videoIndex, urlParam, shortId, vParam, idParam, cParam]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch playlists, cricket-media, and flipLong in parallel using axios
      const [playlistRes, cricketRes, flipLongRes] = await Promise.allSettled([
        axios.get<ApiResponse>("/api/team360-playlist"),
        axios.get<{ success: boolean; mediaFiles: unknown[] }>("/api/cloudinary/cricket-media"),
        axios.get<{ success: boolean; videos: unknown[] }>("/api/flipLong"),
      ]);

      if (playlistRes.status === "rejected" && cricketRes.status === "rejected" && flipLongRes.status === "rejected") {
        setError("Failed to load video");
        setLoading(false);
        return;
      }

      const playlists = (playlistRes.status === "fulfilled" && playlistRes.value.data?.success)
        ? playlistRes.value.data.playlists
        : [];

      const cricketFiles = (cricketRes.status === "fulfilled" && cricketRes.value.data?.success && Array.isArray(cricketRes.value.data.mediaFiles))
        ? cricketRes.value.data.mediaFiles
        : [];

      const flipLongVideos = (flipLongRes.status === "fulfilled" && flipLongRes.value.data?.success && Array.isArray(flipLongRes.value.data.videos))
        ? flipLongRes.value.data.videos
        : [];

      if (playlistRes.status === "fulfilled" && (!playlistRes.value.data?.success || playlistRes.value.data.playlists.length === 0) && cricketFiles.length === 0 && flipLongVideos.length === 0 && !idParam && !cParam && !vParam && !urlParam) {
        setError("No playlists available");
        setLoading(false);
        return;
      }

      // Case 1: ID parameter provided (?id=...)
      if (idParam) {
        // 1a. Search in FlipLong videos
        const flipMatch = flipLongVideos.find(
          (v: any) => v.id === idParam || v.videoId === idParam || v.id === decodeURIComponent(idParam)
        );
        if (flipMatch) {
          setActiveId(flipMatch.id || flipMatch.videoId);
          setVideoDrop({
            id: flipMatch.id || flipMatch.videoId,
            title: flipMatch.title || "Video Track",
            description: flipMatch.description || "",
            views: 0,
            signals: 0,
            likes: flipMatch.likes || flipMatch.likeCount || 0,
            likedBy: flipMatch.likedBy || [],
            duration: flipMatch.duration || "0:00",
            durationSecs: flipMatch.durationSeconds || parseDurationToSeconds(flipMatch.duration || "0:00"),
            engagement: 0,
            mediaUrl: flipMatch.url || flipMatch.videoUrl || flipMatch.mediaUrl,
            videoUrl: flipMatch.url || flipMatch.videoUrl || flipMatch.mediaUrl,
            thumbnail: flipMatch.thumbnailUrl,
            date: flipMatch.createdAt ? formatDate(new Date(flipMatch.createdAt).getTime()) : "Recent",
            subtitle: "FlipLONG Drops"
          });
          setLoading(false);
          return;
        }

        // 1b. Search in cricket media
        const match = cricketFiles.find(
          (m: { id?: string; fileName?: string; title?: string }) =>
            m.id === idParam || m.fileName === idParam || m.id === decodeURIComponent(idParam)
        );
        if (match) {
          setActiveId(match.id);
          setVideoDrop({
            id: match.id,
            title: match.title || "Video Track",
            description: "",
            views: 0,
            signals: 0,
            duration: match.duration || "0:00",
            durationSecs: match.durationSeconds || 0,
            engagement: 0,
            mediaUrl: match.url,
            videoUrl: match.url,
            thumbnail: match.thumbnailUrl,
            date: match.createdAtFormatted || "Recent",
            subtitle: "Video Drops"
          });
          setLoading(false);
          return;
        }

        // 1b. Search in playlists by video drop ID
        for (const p of playlists) {
          const vIdx = p.videoDrops.findIndex((d: VideoDrop & { id?: string }) => d.id === idParam);
          if (vIdx !== -1) {
            const drop = p.videoDrops[vIdx];
            setActivePlaylistId(p.id);
            setActiveVideoIndex(vIdx);
            setActiveId(idParam);
            setVideoDrop({
              ...drop,
              videoUrl: drop.mediaUrl,
              durationSecs: parseDurationToSeconds(drop.duration),
              subtitle: "Video Drops",
              date: formatDate(p.createdAt),
              room: "Video Room",
              views: drop.listens || drop.views || 0
            });
            setLoading(false);
            return;
          }
        }
      }

      // Case 2: Cloudinary short path provided (?c=...)
      if (cParam) {
        const decodedC = decodeURIComponent(cParam);
        const cleanPath = decodedC.replace(/^\/+/, '');
        const fullUrl = cleanPath.startsWith("http")
          ? cleanPath
          : `https://res.cloudinary.com/dflnsufit/video/upload/${cleanPath}`;

        // Create human-readable title from filename
        const rawFileName = cleanPath.split('/').pop()?.replace(/\.[^/.]+$/, "") || "Video Track";
        const titleFromFilename = rawFileName
          .replace(/_[a-z0-9]{5,8}$/i, "") // strip trailing hash
          .replace(/[_-]+/g, " ")
          .trim();

        setActiveCloudinaryPath(cleanPath);
        setVideoDrop({
          title: titleParam ? decodeURIComponent(titleParam) : titleFromFilename,
          description: "",
          views: 0,
          signals: 0,
          duration: "0:00",
          durationSecs: 0,
          engagement: 0,
          mediaUrl: fullUrl,
          videoUrl: fullUrl,
          subtitle: "Video Drops"
        });
        setLoading(false);
        return;
      }

      // Case 3: Short ID provided (?shortId=...)
      if (shortId) {
        const decoded = decodeShortId(shortId);
        if (decoded?.cloudinaryPath) {
          const cleanPath = decoded.cloudinaryPath.replace(/^\/+/, '');
          const fullUrl = cleanPath.startsWith("http")
            ? cleanPath
            : `https://res.cloudinary.com/dflnsufit/video/upload/${cleanPath}`;

          const rawFileName = cleanPath.split('/').pop()?.replace(/\.[^/.]+$/, "") || "Video Track";
          const titleFromFilename = rawFileName
            .replace(/_[a-z0-9]{5,8}$/i, "")
            .replace(/[_-]+/g, " ")
            .trim();

          setActiveCloudinaryPath(cleanPath);
          setVideoDrop({
            title: titleParam ? decodeURIComponent(titleParam) : titleFromFilename,
            description: "",
            views: 0,
            signals: 0,
            duration: "0:00",
            durationSecs: 0,
            engagement: 0,
            mediaUrl: fullUrl,
            videoUrl: fullUrl,
            subtitle: "Video Drops"
          });
          setLoading(false);
          return;
        }

        if (decoded && playlists.length > 0) {
          const targetPlaylist = playlists.find(p => p.id === decoded.playlistId);
          if (targetPlaylist && targetPlaylist.videoDrops[decoded.videoIndex]) {
            const drop = targetPlaylist.videoDrops[decoded.videoIndex];
            const durationSecs = parseDurationToSeconds(drop.duration);
            setActivePlaylistId(targetPlaylist.id);
            setActiveVideoIndex(decoded.videoIndex);
            setVideoDrop({
              ...drop,
              videoUrl: drop.mediaUrl,
              durationSecs,
              subtitle: "Video Drops",
              date: formatDate(targetPlaylist.createdAt),
              room: "Video Room",
              views: drop.listens || drop.views || 0
            });
            setLoading(false);
            return;
          }
        }
      }

      // Case 4: Base64 video token provided (?v=...)
      if (vParam) {
        let mediaUrl = "";
        let videoTitle = "Video Track";
        try {
          const raw = fromBase64Url(vParam);
          if (raw.startsWith("{") && raw.endsWith("}")) {
            const parsed = JSON.parse(raw);
            mediaUrl = parsed.u || "";
            videoTitle = parsed.t || "Video Track";
          } else {
            mediaUrl = raw;
          }
        } catch {
          mediaUrl = vParam;
        }

        if (mediaUrl) {
          const { drop, playlist, index } = findVideoDropByUrl(playlists, mediaUrl);
          if (drop && playlist) {
            const durationSecs = parseDurationToSeconds(drop.duration);
            setActivePlaylistId(playlist.id);
            setActiveVideoIndex(index);
            setVideoDrop({
              ...drop,
              videoUrl: drop.mediaUrl,
              durationSecs,
              subtitle: "Video Drops",
              date: formatDate(playlist.createdAt),
              room: "Video Room",
              views: drop.listens || drop.views || 0
            });
          } else {
            setActivePlaylistId(null);
            setActiveVideoIndex(0);
            setVideoDrop({
              title: videoTitle,
              description: "",
              views: 0,
              signals: 0,
              duration: "0:00",
              durationSecs: 0,
              engagement: 0,
              mediaUrl: mediaUrl,
              videoUrl: mediaUrl,
              subtitle: "Video Drops"
            });
          }
          setLoading(false);
          return;
        }
      }

      // Case 5: Legacy URL parameter provided (?url=...)
      if (urlParam) {
        const decodedUrl = decodeURIComponent(urlParam);
        const { drop, playlist, index } = findVideoDropByUrl(playlists, decodedUrl);

        if (drop && playlist) {
          const durationSecs = parseDurationToSeconds(drop.duration);
          setActivePlaylistId(playlist.id);
          setActiveVideoIndex(index);
          setVideoDrop({
            ...drop,
            videoUrl: drop.mediaUrl,
            durationSecs,
            subtitle: "Video Drops",
            date: formatDate(playlist.createdAt),
            room: "Video Room",
            views: drop.listens || drop.views || 0
          });
        } else {
          // Check if Cloudinary URL to extract path
          const cloudMatch = decodedUrl.match(/res\.cloudinary\.com\/[^/]+\/video\/upload\/(?:v\d+\/)?(.+?)(?:\?.*)?$/);
          if (cloudMatch && cloudMatch[1]) {
            setActiveCloudinaryPath(cloudMatch[1]);
          }
          setActivePlaylistId(null);
          setActiveVideoIndex(0);
          setVideoDrop({
            title: titleParam ? decodeURIComponent(titleParam) : "Video Track",
            description: "",
            views: 0,
            signals: 0,
            duration: "0:00",
            durationSecs: 0,
            engagement: 0,
            mediaUrl: decodedUrl,
            videoUrl: decodedUrl,
            subtitle: "Video Drops"
          });
        }
        setLoading(false);
        return;
      }

      // Case 6: Playlist ID and index provided (or fallback)
      if (playlists.length > 0) {
        let targetPlaylist: Playlist | undefined;
        let targetIndex = videoIndex;

        if (playlistId) {
          targetPlaylist = playlists.find(p => p.id === playlistId);
        } else {
          targetPlaylist = playlists.find(p => p.videoDrops.length > 0) || playlists[0];
          targetIndex = 0;
        }

        if (targetPlaylist && targetPlaylist.videoDrops[targetIndex]) {
          const drop = targetPlaylist.videoDrops[targetIndex];
          const durationSecs = parseDurationToSeconds(drop.duration);
          setActivePlaylistId(targetPlaylist.id);
          setActiveVideoIndex(targetIndex);
          setVideoDrop({
            ...drop,
            videoUrl: drop.mediaUrl,
            durationSecs,
            subtitle: "Video Drops",
            date: formatDate(targetPlaylist.createdAt),
            room: "Video Room",
            views: drop.listens || drop.views || 0
          });
          setLoading(false);
          return;
        }
      }

      setError("No video drops available");
    } catch (err) {
      console.error("Error fetching video:", err);
      setError("Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  // Handle video metadata loading
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      if (!isNaN(duration) && duration > 0) {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        setVideoDrop(prev => prev ? {
          ...prev,
          duration: formattedDuration,
          durationSecs: duration
        } : null);
      }
    }
  };

  // Handle video error
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e);
    setVideoError(true);
    setPlaying(false);
  };

  // Handle native video play/pause events
  const handlePlayEvent = () => {
    setPlaying(true);
    if (iconTimeoutRef.current) {
      clearTimeout(iconTimeoutRef.current);
    }
    iconTimeoutRef.current = setTimeout(() => {
      setShowCenterIcon(false);
    }, 1200);
  };

  const handlePauseEvent = () => {
    setPlaying(false);
    setShowCenterIcon(true);
    if (iconTimeoutRef.current) {
      clearTimeout(iconTimeoutRef.current);
    }
  };

  // Trigger center icon animation / toggle visibility when touching or moving over video
  const triggerCenterIcon = () => {
    const isPaused = !videoRef.current || videoRef.current.paused;
    if (isPaused) {
      setShowCenterIcon(true);
      return;
    }

    setShowCenterIcon(true);
    if (iconTimeoutRef.current) {
      clearTimeout(iconTimeoutRef.current);
    }
    iconTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowCenterIcon(false);
      }
    }, 2000);
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setElapsed(videoRef.current.currentTime);
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    setPlaying(false);
    setElapsed(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setShowCenterIcon(true);
  };

  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (showSpeedMenu) {
      setShowSpeedMenu(false);
    }

    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setPlaying(true);
        setShowCenterIcon(true);
        if (iconTimeoutRef.current) clearTimeout(iconTimeoutRef.current);
        iconTimeoutRef.current = setTimeout(() => {
          setShowCenterIcon(false);
        }, 1200);
      }).catch(err => {
        console.error("Error playing video:", err);
        setVideoError(true);
      });
    } else {
      videoRef.current.pause();
      setPlaying(false);
      setShowCenterIcon(true);
      if (iconTimeoutRef.current) clearTimeout(iconTimeoutRef.current);
    }
  };

  // Handle playback speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  // Handle seek bar interaction
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetPct = clickX / rect.width;
    const duration = videoRef.current.duration || totalSecs;
    if (duration > 0) {
      const targetTime = targetPct * duration;
      videoRef.current.currentTime = targetTime;
      setElapsed(targetTime);
    }
  };

  // Build clean, compact, minimal share URL
  const buildShareUrl = (): string => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;

    // 1. If playlistId and videoIndex are available, build super short URL (~60 chars)
    if (activePlaylistId) {
      const url = new URL(`${origin}/MainModules/VideoDrop`);
      url.searchParams.set("playlistId", activePlaylistId);
      url.searchParams.set("videoIndex", activeVideoIndex.toString());
      return url.toString();
    }

    // 2. If shortId parameter was provided in searchParams
    if (shortId) {
      const url = new URL(`${origin}/MainModules/VideoDrop`);
      url.searchParams.set("shortId", shortId);
      return url.toString();
    }

    // 3. If matched ID is available
    if (activeId) {
      const url = new URL(`${origin}/MainModules/VideoDrop`);
      url.searchParams.set("id", activeId);
      return url.toString();
    }

    // 4. If Cloudinary relative path is available
    if (activeCloudinaryPath) {
      const shortToken = toBase64Url(`c:${activeCloudinaryPath}`);
      const url = new URL(`${origin}/MainModules/VideoDrop`);
      url.searchParams.set("shortId", shortToken);
      return url.toString();
    }

    const rawMedia = videoDrop?.mediaUrl || videoDrop?.videoUrl || "";

    // 5. If Cloudinary URL, encode as shortId token: c:<path>
    const cloudMatch = rawMedia.match(/res\.cloudinary\.com\/[^/]+\/video\/upload\/(?:v\d+\/)?(.+?)(?:\?.*)?$/);
    if (cloudMatch && cloudMatch[1]) {
      const shortToken = toBase64Url(`c:${cloudMatch[1]}`);
      const url = new URL(`${origin}/MainModules/VideoDrop`);
      url.searchParams.set("shortId", shortToken);
      return url.toString();
    }

    // 6. Standalone fallback: clean compact token 'v'
    if (rawMedia) {
      const token = toBase64Url(rawMedia);
      const url = new URL(`${origin}/MainModules/VideoDrop`);
      url.searchParams.set("v", token);
      return url.toString();
    }

    return window.location.href;
  };

  // Handle share (mobile-optimized Web Share + Clipboard fallback)
  const handleShare = async () => {
    if (!videoDrop) return;
    const shareTitle = videoDrop.title || "Video Drop on SportsFan360";
    const shareUrl = buildShareUrl();

    const triggerToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    };

    // Mobile Web Share API
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          return; // User dismissed native share sheet
        }
        console.warn("navigator.share failed, falling back to clipboard:", err);
      }
    }

    // Clipboard copy fallback: Copies purely the clean URL
    if (typeof window !== "undefined") {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = shareUrl;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
        triggerToast("Link copied to clipboard!");
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        triggerToast("Failed to copy link");
      }
    }
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (iconTimeoutRef.current) clearTimeout(iconTimeoutRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !videoDrop) {
    return (
      <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Video not found"}</p>
          <button
            onClick={handleGoBack}
            className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalSecs = videoDrop.durationSecs || parseDurationToSeconds(videoDrop.duration);
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
  const pct = totalSecs > 0 ? Math.round((elapsed / totalSecs) * 100) : 0;
  const engPct = playing ? pct : videoDrop.engagement;

  return (
    // <div className="flex justify-center bg-[#0d0d10] min-h-screen p-4 sm:p-6 lg:p-10">
    <div className="flex justify-center bg-[#0d0d10] min-h-dvh p-4 sm:p-6 lg:p-10 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      {/* Card - Fully responsive width */}
      <div className="w-full max-w-[360px] sm:max-w-[480px] md:max-w-[560px] lg:max-w-[640px] xl:max-w-[720px] bg-[#111114] rounded-[24px] overflow-hidden border border-[#222226]">

        {/* Topbar - Responsive padding */}
        <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 pt-4 pb-3 sm:pt-5 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleGoBack}
              data-nav="back"
              aria-label="Go Back"
              title="Go Back"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1e1e24] flex items-center justify-center border-none cursor-pointer hover:bg-[#2a2a30] transition"
            >
              <svg className="w-3 h-3 sm:w-[13px] sm:h-[13px]" viewBox="0 0 13 13" fill="none">
                <path d="M8.5 2L4 6.5L8.5 11" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <p className="text-[#777] text-[11px] sm:text-[12px] mt-0.5">{videoDrop.subtitle || "Video Drops"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Like Button */}
            <button
              onClick={handleToggleLike}
              title={isLiked ? "Liked" : "Like Video"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 cursor-pointer ${
                isLiked
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  : "bg-[#1e1e24] border-white/10 text-white/70 hover:text-white hover:bg-[#2a2a30]"
              }`}
            >
              <Heart
                size={14}
                className={isLiked ? "fill-current text-rose-500 scale-110" : ""}
              />
              <span className="text-xs font-bold">{likeCount}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              title="Share"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1e1e24] flex items-center justify-center border border-white/10 cursor-pointer hover:bg-[#2a2a30] transition active:scale-95"
            >
              <Share2 size={14} className="text-white/70 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Video Player - Responsive margins */}
        <div className="mx-3 sm:mx-4 md:mx-5 rounded-[14px] overflow-hidden bg-[#1a1a1e]">
          {/* Video area */}
          <div
            className="relative w-full bg-[#0e0e12] flex items-center justify-center cursor-pointer select-none"
            style={{ aspectRatio: "16/9" }}
            onClick={() => {
              if (showSpeedMenu) {
                setShowSpeedMenu(false);
                return;
              }
              togglePlay();
            }}
            onMouseMove={triggerCenterIcon}
            onTouchStart={triggerCenterIcon}
          >
            {videoDrop.thumbnail && !playing && !videoError && (
              <img src={videoDrop.thumbnail} alt={videoDrop.title} className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none" />
            )}

            {/* Video element */}
            {videoDrop.videoUrl && (
              <video
                ref={videoRef}
                src={videoDrop.videoUrl}
                className="absolute inset-0 w-full h-full object-fill"
                onLoadedMetadata={handleLoadedMetadata}
                onDurationChange={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlayEvent}
                onPause={handlePauseEvent}
                onEnded={handleVideoEnd}
                onError={handleVideoError}
                playsInline
                preload="metadata"
              />
            )}

            {/* Error message */}
            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <p className="text-white text-sm text-center px-4">
                  Unable to play video.<br />
                  The video format may not be supported.
                </p>
              </div>
            )}

            <button
              onClick={e => {
                e.stopPropagation();
                if (showSpeedMenu) setShowSpeedMenu(false);
                togglePlay();
              }}
              className={`relative z-10 w-[50px] h-[50px] sm:w-[56px] sm:h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:bg-black/80 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-2xl active:scale-95 ${
                showCenterIcon
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-110 pointer-events-none"
              }`}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <svg className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" viewBox="0 0 22 22" fill="none">
                  <rect x="6" y="4" width="3.5" height="14" rx="1.5" fill="#fff" />
                  <rect x="12.5" y="4" width="3.5" height="14" rx="1.5" fill="#fff" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] ml-0.5" viewBox="0 0 22 22" fill="none">
                  <path d="M8 5L18 11L8 17V5Z" fill="#fff" />
                </svg>
              )}
            </button>
          </div>

          {/* Progress Bar with Seek capability */}
          <div
            className="h-[5px] bg-[#2a2a2e] cursor-pointer relative group flex items-center"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-100"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Timestamps & Playback Speed Controls Bar */}
          <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] text-[#888] font-mono bg-[#141418]">
            <div className="flex items-center gap-1.5">
              <span className="text-white/90 font-semibold">{timeStr}</span>
              <span className="text-white/30">/</span>
              <span className="text-white/50">{videoDrop.duration}</span>
            </div>

            {/* Playback Speed selector */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeedMenu((prev) => !prev);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition text-[10px] sm:text-[11px] font-bold text-white border border-white/10 cursor-pointer shadow-sm"
                title="Playback Speed"
              >
                <span className="text-pink-400">⚡</span>
                <span>{playbackSpeed}x</span>
                <svg
                  className={`w-2.5 h-2.5 transition-transform duration-200 ${showSpeedMenu ? "rotate-180" : ""}`}
                  viewBox="0 0 10 6"
                  fill="none"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-full mb-2 bg-[#1a1a24] border border-white/15 rounded-xl shadow-2xl p-1 z-30 flex flex-col min-w-[76px] backdrop-blur-md">
                  <div className="px-2 py-1 text-[9px] uppercase font-bold text-gray-400 border-b border-white/5 mb-1">
                    Speed
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeedChange(s);
                      }}
                      className={`px-2.5 py-1 text-left text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                        playbackSpeed === s
                          ? "bg-pink-500 text-white"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackSpeed === s && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body - Responsive padding and text sizes */}
        {/* <div className="px-4 sm:px-5 md:px-6 pt-3.5 sm:pt-4 md:pt-5 pb-4 sm:pb-5 md:pb-6"> */}
        <div className="px-4 sm:px-5 md:px-6 pt-3.5 sm:pt-4 md:pt-5 pb-6 sm:pb-7 md:pb-8">
          <h1 className="text-white text-[12px] sm:text-[15px] md:text-[15px] lg:text-[15px] font-medium leading-snug mb-2 sm:mb-3">
            {videoDrop.title}
          </h1>
          <p className="text-[#777] text-[8px] sm:text-[13px] md:text-[14px] leading-relaxed mb-4 sm:mb-5">
            {videoDrop.description}
          </p>

          {/* Stats - Responsive grid and padding */}
          {/* <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
            {[
              { label: "Views", value: videoDrop.views.toLocaleString(), color: "#888888", green: false },
              { label: "Signals", value: videoDrop.signals.toLocaleString(), color: "#888888", green: false },
              { label: "Duration", value: videoDrop.duration, color: "#888888", green: true },
            ].map(s => (
              <div key={s.label} className="bg-[#1a1a1e] rounded-xl p-2 sm:p-2.5 md:p-3 flex flex-col gap-1 sm:gap-1.5">
                <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: s.color }}>
                  <svg className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" viewBox="0 0 13 13" fill="none">
                    {s.label === "Duration" ? (
                      <>
                        <circle cx="6.5" cy="6.5" r="5" stroke={s.color} strokeWidth="1.2" />
                        <path d="M6.5 4v2.5l1.5 1.5" stroke={s.color} strokeWidth="1.2" strokeLinecap="round" />
                      </>
                    ) : s.label === "Views" ? (
                      <>
                        <path d="M2 6.5C2 6.5 4 3 6.5 3S11 6.5 11 6.5 9 10 6.5 10 2 6.5 2 6.5z" stroke={s.color} strokeWidth="1.2" strokeLinejoin="round" />
                        <circle cx="6.5" cy="6.5" r="1.5" fill={s.color} />
                      </>
                    ) : (
                      <path d="M6.5 2C4.3 2 2.5 3.6 2.5 5.5c0 1 .5 2 1.4 2.7L3.5 10l2-.7c.3.1.6.2 1 .2C8.7 9.5 10.5 7.9 10.5 6S8.7 2 6.5 2z" stroke={s.color} strokeWidth="1.2" strokeLinejoin="round" />
                    )}
                  </svg>
                  {s.label}
                </div>
                <span className="text-[16px] sm:text-[18px] md:text-[20px] font-medium" style={{ color: s.green ? "#1a9e6a" : "#fff" }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div> */}

          {/* Meta - Responsive text and gap */}
          <div className="flex items-center gap-2 sm:gap-3.5 text-[11px] sm:text-[12px] text-[#666] mb-3 sm:mb-4">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <svg className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" viewBox="0 0 13 13" fill="none">
                <rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="#666" strokeWidth="1.2" />
                <path d="M1.5 5.5h10M4.5 1v3M8.5 1v3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {videoDrop.date || "Recent"}
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <svg className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="4.5" r="2.5" stroke="#666" strokeWidth="1.2" />
                <path d="M2 11c0-2 2-3 4.5-3s4.5 1 4.5 3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {videoDrop.room || "Video Room"}
            </div>
          </div>

          {/* Engagement bar */}
          <div className="mb-4 sm:mb-5">
            <div className="h-1 bg-[#222226] rounded-full overflow-hidden mb-1 sm:mb-1.5">
              <div
                className="h-full bg-[#888888] rounded-full transition-all duration-300"
                style={{ width: `${engPct}%` }}
              />
            </div>
            <p className="text-right text-[10px] sm:text-[11px] text-[#555]">{engPct}% engagement</p>
          </div>

          {/* Send Signal - Responsive button */}
          {/* <button className="w-full bg-[#1a1a1a] border border-[#888888] rounded-[12px] sm:rounded-[14px] py-[20px] pb-[30px] sm:py-[15px] md:py-[20px] flex items-center justify-center gap-1.5 sm:gap-2 text-[#888888] text-[13px] sm:text-[15px] md:text-[16px] font-medium hover:bg-[#222222] transition cursor-pointer"> */}
          {/* <button className="w-full bg-[#1a1a1a] mb-10 border border-[#888888] rounded-[12px] sm:rounded-[14px] py-[14px] sm:py-[15px] md:py-[16px] flex items-center justify-center gap-1.5 sm:gap-2 text-[#888888] text-[13px] sm:text-[15px] md:text-[16px] font-medium hover:bg-[#222222] transition cursor-pointer">
            <svg className="w-[14px] h-[14px] sm:w-[17px] sm:h-[17px]" viewBox="0 0 17 17" fill="none">
              <path d="M8.5 1.5C5.5 1.5 3 3.8 3 6.5c0 1.4.6 2.6 1.7 3.5L4 14l3.2-1.1c.4.1.8.1 1.3.1C11.5 13 14 10.7 14 8s-2.5-6.5-5.5-6.5z" stroke="#888888" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M6 8h5M8.5 5.5v5" stroke="#888888" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Send Signal
          </button> */}
        </div>
      </div>

      {/* Copied to clipboard Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1e1e24]/95 backdrop-blur-md border border-white/15 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 pointer-events-none transition-all duration-300">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}