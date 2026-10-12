// src/components/CreatePost-Component/CreateFlipLONG.tsx
"use client";

import axios from "axios";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Video as VideoIcon,
  Clock,
  User,
  AlertCircle,
  Loader2,
  Calendar,
  Info,
  Edit3,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  Sparkles,
  Share2,
  Film,
  Flame,
  Layers,
  ArrowRight,
  Send,
  Sliders,
  Check,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFlipLongJob } from "@/hooks/useFlipLongJob";
import { ReelItem } from "@/types/fliplong";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type VideoFormState = {
  title: string;
  description: string;
  author: string;
  sport: string;
};

const EMPTY_VIDEO_FORM: VideoFormState = {
  title: "",
  description: "",
  author: "",
  sport: "general",
};

function formatCountdown(targetMs: number): string {
  const diffMs = targetMs - Date.now();
  if (diffMs <= 0) return "Publishing now";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remHours = diffHours % 24;
    return `in ${diffDays}d ${remHours > 0 ? `${remHours}h` : ""}`;
  }
  if (diffHours > 0) {
    const remMins = diffMins % 60;
    return `in ${diffHours}h ${remMins > 0 ? `${remMins}m` : ""}`;
  }
  if (diffMins > 0) {
    return `in ${diffMins} min${diffMins > 1 ? "s" : ""}`;
  }
  return "in < 1 min";
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatErrorMessage(err: any): string {
  if (!err) return "Failed to process video. Please check inputs and try again.";
  if (typeof err === "string") return err;

  const data = err?.response?.data;
  if (data) {
    if (typeof data === "string") {
      if (data.includes("<html") || data.includes("<!DOCTYPE")) {
        return "Server error: Received invalid response from server. Please try again.";
      }
      return data;
    }
    if (typeof data.error === "string") return data.error;
    if (data.error && typeof data.error.message === "string") return data.error.message;
    if (typeof data.message === "string") return data.message;
  }

  if (typeof err.message === "string") return err.message;
  if (typeof err.error === "string") return err.error;

  return "Error saving video. Please check inputs and try again.";
}

export default function CreateFlipLONGDialog({ isOpen, onClose, onCreated }: Props) {
  const { user, getUserDisplayName } = useAuth();

  // Extract real user details dynamically from authenticated user data
  const getRealUserDisplayName = useCallback((): string => {
    if (getUserDisplayName) {
      const name = getUserDisplayName();
      if (name && name.trim() && name.toLowerCase() !== "fan" && !name.toLowerCase().startsWith("fan_")) {
        return name.trim();
      }
    }
    if (user?.name && user.name.trim()) return user.name.trim();
    if ((user as any)?.username && (user as any).username.trim()) return (user as any).username.trim();
    if ((user as any)?.firstName) {
      const full = [(user as any).firstName, (user as any).lastName].filter(Boolean).join(" ").trim();
      if (full) return full;
    }
    if (user?.email && user.email.includes("@")) {
      return user.email.split("@")[0].trim();
    }
    if (typeof window !== "undefined") {
      const authUserStr = localStorage.getItem("auth_user");
      if (authUserStr) {
        try {
          const parsed = JSON.parse(authUserStr);
          if (parsed.name) return parsed.name;
          if (parsed.email) return parsed.email.split("@")[0];
        } catch {}
      }
      const roarUser = localStorage.getItem("roar_username") || localStorage.getItem("sf360_user_name");
      if (roarUser && roarUser.trim()) return roarUser.trim();
    }
    return "";
  }, [user, getUserDisplayName]);

  const getRealUserAvatar = useCallback((): string => {
    if (user?.avatar) return user.avatar;
    if ((user as any)?.photoURL) return (user as any).photoURL;
    if ((user as any)?.avatarUrl) return (user as any).avatarUrl;
    if ((user as any)?.addfliplineAdminPhoto) return (user as any).addfliplineAdminPhoto;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("roar_avatar_url") || localStorage.getItem("sf360_user_avatar");
      if (stored) return stored;
    }
    return "";
  }, [user]);

  const getRealUserId = useCallback((): string => {
    return (
      user?.userId ||
      (user as any)?.uid ||
      (user as any)?.id ||
      (user as any)?.actualUserId ||
      user?.email ||
      ""
    );
  }, [user]);

  const currentUserName = getRealUserDisplayName();
  const userAvatar = getRealUserAvatar();
  const currentUserId = getRealUserId();

  // Tab State: Upload/Pipeline vs Scheduled Queue
  const [activeTab, setActiveTab] = useState<"pipeline" | "scheduled">("pipeline");

  // Hook for AI Pipeline & Background Job Persistence
  const {
    activeJob,
    activeVideoId,
    videoData,
    isUploading,
    uploadProgress,
    isProcessing,
    error: jobError,
    startDirectUpload,
    approveReels,
    publishReelToFlipLine,
    clearActiveJob,
    checkStatus,
  } = useFlipLongJob();

  // Video Form State
  const [videoForm, setVideoForm] = useState<VideoFormState>(EMPTY_VIDEO_FORM);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<string>("0:00");
  const [videoDurationSec, setVideoDurationSec] = useState<number>(0);

  // Common UI State
  const [submittingFlipLong, setSubmittingFlipLong] = useState(false);
  const [publishingReelIdx, setPublishingReelIdx] = useState<number | null>(null);
  const [publishedReels, setPublishedReels] = useState<number[]>([]);
  const [publishedMaster, setPublishedMaster] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string>("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const isSubmittingRef = useRef(false);

  // Scheduled queue state
  const [scheduledVideos, setScheduledVideos] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Video playback preview state for reels
  const [activePlayingReel, setActivePlayingReel] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    if (currentUserName) {
      setVideoForm((prev) => ({ ...prev, author: prev.author || currentUserName }));
    }
  }, [currentUserName]);

  // Sync active job metadata if present
  useEffect(() => {
    if (activeJob) {
      setVideoForm((prev) => ({
        title: prev.title || activeJob.title,
        description: prev.description || activeJob.description,
        author: prev.author || activeJob.author || currentUserName,
        sport: prev.sport || activeJob.sport || "general",
      }));
    }
  }, [activeJob, currentUserName]);

  // Extract duration from selected video file
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);

      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const sec = Math.round(v.duration) || 0;
        setVideoDurationSec(sec);
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        setVideoDuration(`${m}:${s.toString().padStart(2, "0")}`);
      };
      v.src = url;

      return () => URL.revokeObjectURL(url);
    } else if (existingVideoUrl) {
      setVideoPreviewUrl(existingVideoUrl);
    } else {
      setVideoPreviewUrl("");
      setVideoDuration("0:00");
      setVideoDurationSec(0);
    }
  }, [videoFile, existingVideoUrl]);

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDefaultTimeString = (offsetMinutes = 30) => {
    const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const applySchedulePreset = (minutesFromNow: number) => {
    const target = new Date(Date.now() + minutesFromNow * 60 * 1000);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    setScheduledDate(`${y}-${m}-${d}`);
    const hh = String(target.getHours()).padStart(2, "0");
    const mm = String(target.getMinutes()).padStart(2, "0");
    setScheduledTime(`${hh}:${mm}`);
  };

  const applyTomorrowPreset = (hour: number, minute: number) => {
    const target = new Date(Date.now() + 24 * 60 * 60 * 1000);
    target.setHours(hour, minute, 0, 0);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    setScheduledDate(`${y}-${m}-${d}`);
    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    setScheduledTime(`${hh}:${mm}`);
  };

  const getScheduledTs = (): number | null => {
    if (!scheduledDate || !scheduledTime) return null;
    const [year, month, day] = scheduledDate.split("-").map(Number);
    const [hours, minutes] = scheduledTime.split(":").map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) return null;
    const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return d.getTime();
  };

  const scheduledTs = showSchedule ? getScheduledTs() : null;
  const isPastTime = scheduledTs !== null && scheduledTs <= Date.now();

  // Load scheduled videos for current user
  const fetchUserScheduledVideos = useCallback(async () => {
    const userId = user?.userId || (user as any)?.uid || (user as any)?.id || "";
    const userEmail = user?.email || (user as any)?.emailAddress || "";
    const author = user?.name || (user as any)?.username || "";

    try {
      setLoadingScheduled(true);
      const params = new URLSearchParams({ scheduledOnly: "true" });
      if (userId) params.append("userId", userId);
      if (userEmail) params.append("email", userEmail);
      if (author) params.append("author", author);

      const res = await axios.get<{ success: boolean; videos: any[] }>(`/api/flipLong?${params.toString()}`);
      const now = Date.now();
      const videosList = Array.isArray(res.data?.videos) ? res.data.videos : [];

      const futureItems = videosList.filter((item) => {
        const schedTime = Number(item.scheduledAt) || Number(item.scheduledTimeMs);
        return (item.isScheduled === true || item.isScheduled === "true" || (schedTime && schedTime > 0)) && schedTime > now;
      });

      futureItems.sort((a, b) => {
        const aTime = Number(a.scheduledAt || a.scheduledTimeMs || a.timeMs || 0);
        const bTime = Number(b.scheduledAt || b.scheduledTimeMs || b.timeMs || 0);
        return aTime - bTime;
      });

      setScheduledVideos(futureItems);
    } catch (err) {
      console.error("Failed to load scheduled FlipLONG videos", err);
    } finally {
      setLoadingScheduled(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchUserScheduledVideos();
    }
  }, [isOpen, fetchUserScheduledVideos]);

  const handleChangeVideo = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setVideoForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFormState = () => {
    setVideoForm({ ...EMPTY_VIDEO_FORM, author: currentUserName });
    setVideoFile(null);
    setExistingVideoUrl("");
    setVideoPreviewUrl("");
    setVideoDuration("0:00");
    setVideoDurationSec(0);
    setShowSchedule(false);
    setScheduledDate("");
    setScheduledTime("");
    setSubmitError("");
    setSubmitSuccess("");
    setEditingVideoId(null);
    setPublishedMaster(false);
    setPublishedReels([]);
    setActivePlayingReel(null);
  };

  const handleClose = () => {
    resetFormState();
    onClose();
  };

  // ─── 1. Start AI Video Pipeline Upload ────────────────────────────────────
  const handleStartUpload = async () => {
    if (!videoForm.title.trim()) {
      setSubmitError("Video Title is required");
      return;
    }

    if (!videoFile) {
      setSubmitError("Please select a video file to upload");
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");

    try {
      await startDirectUpload(videoFile, {
        title: videoForm.title.trim(),
        description: videoForm.description.trim(),
        author: videoForm.author.trim() || currentUserName,
        sport: videoForm.sport || "general",
        duration: videoDuration,
        durationSec: videoDurationSec,
      });

      setSubmitSuccess("Video successfully uploaded to AI Pipeline! Processing in background.");
    } catch (err: any) {
      setSubmitError(formatErrorMessage(err));
    }
  };

  // ─── 2. Publish Master Denoised Video to FlipLong ─────────────────────────
  const handlePublishMasterVideo = async () => {
    if (isSubmittingRef.current) return;
    const finalUrl = videoData?.denoised_video || existingVideoUrl;

    if (!finalUrl) {
      setSubmitError("No processed video URL available to publish");
      return;
    }

    if (!videoForm.title.trim()) {
      setSubmitError("Video Title is required");
      return;
    }

    if (showSchedule && (isPastTime || !scheduledTs)) {
      setSubmitError("Please select a valid future date and time for scheduling.");
      return;
    }

    isSubmittingRef.current = true;
    setSubmittingFlipLong(true);
    setSubmitError("");

    try {
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const dateStr = new Date(now).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const payload: Record<string, any> = {
        title: videoForm.title.trim(),
        description: videoForm.description.trim() || videoData?.summary || "",
        author: videoForm.author.trim() || currentUserName,
        sport: (videoForm.sport || "general").toLowerCase(),
        duration: videoDuration || "0:00",
        videoUrl: finalUrl,
        mediaUrl: finalUrl,
        url: finalUrl,
        userId: user?.userId || (user as any)?.uid || "",
        email: user?.email || "",
        authorPhoto: userAvatar || "",
      };

      if (showSchedule && scheduledTs && scheduledTs > now) {
        const schedTimeStr = new Date(scheduledTs).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const schedDateStr = new Date(scheduledTs).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        payload.isScheduled = true;
        payload.scheduledAt = scheduledTs;
        payload.scheduledTimeMs = scheduledTs;
        payload.day = schedDateStr;
        payload.time = schedTimeStr;
        payload.timeMs = scheduledTs;
        payload.createdAt = now;
      } else {
        payload.isScheduled = false;
        payload.day = dateStr;
        payload.time = timeStr;
        payload.timeMs = now;
        payload.createdAt = now;
      }

      let res;
      if (editingVideoId) {
        res = await axios.put("/api/flipLong", { id: editingVideoId, ...payload });
      } else {
        res = await axios.post("/api/flipLong", payload);
      }

      if (res.data?.success || res.status === 201 || res.status === 200) {
        setPublishedMaster(true);
        setSubmitSuccess(
          showSchedule
            ? "FlipLONG video scheduled successfully!"
            : "FlipLONG master video published live!"
        );
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("fliplong-video-created"));
        }
        onCreated?.();
        await fetchUserScheduledVideos();
      } else {
        setSubmitError(formatErrorMessage(res.data?.error || "Failed to publish video"));
      }
    } catch (err: any) {
      console.error("Publish FlipLong failed:", err);
      setSubmitError(formatErrorMessage(err));
    } finally {
      setSubmittingFlipLong(false);
      isSubmittingRef.current = false;
    }
  };

  // ─── 3. Publish Single Reel to FlipLine ──────────────────────────────────
  const handlePublishReelToFlipLine = async (reel: ReelItem, index: number) => {
    try {
      setPublishingReelIdx(index);
      setSubmitError("");

      await publishReelToFlipLine(reel, index, {
        sport: videoForm.sport || "general",
        author: videoForm.author || currentUserName,
        authorPhoto: userAvatar,
        userId: user?.userId || (user as any)?.uid || "",
        email: user?.email || "",
      });

      setPublishedReels((prev) => [...prev, index]);
      setSubmitSuccess(`Reel "${reel.title}" published directly to FlipLine! ⚡`);
    } catch (err: any) {
      setSubmitError(formatErrorMessage(err));
    } finally {
      setPublishingReelIdx(null);
    }
  };

  // ─── 4. Multi-Select Approve & Publish All Reels ────────────────────────
  const handleApproveAllReels = async () => {
    if (!videoData?.reels || videoData.reels.length === 0) return;
    try {
      setSubmittingFlipLong(true);
      const allIndices = videoData.reels.map((_, i) => i);
      await approveReels(allIndices);

      // Publish each to FlipLine feed
      for (let i = 0; i < videoData.reels.length; i++) {
        if (!publishedReels.includes(i)) {
          await publishReelToFlipLine(videoData.reels[i], i, {
            sport: videoForm.sport || "general",
            author: videoForm.author || currentUserName,
            authorPhoto: userAvatar,
            userId: user?.userId || (user as any)?.uid || "",
            email: user?.email || "",
          });
        }
      }

      setPublishedReels(allIndices);
      setSubmitSuccess("All AI Reels approved and published to FlipLine!");
    } catch (err: any) {
      setSubmitError(formatErrorMessage(err));
    } finally {
      setSubmittingFlipLong(false);
    }
  };

  // ─── 5. Scheduled Item Edit & Delete ─────────────────────────────────────
  const handleEditScheduledItem = (item: any) => {
    const itemId = item.id || item.videoId;
    setEditingVideoId(itemId);
    setVideoForm({
      title: item.title || "",
      description: item.description || "",
      author: item.author || currentUserName,
      sport: item.sport || "general",
    });
    setExistingVideoUrl(item.url || item.videoUrl || item.mediaUrl || "");
    setVideoFile(null);
    setVideoDuration(item.duration || "0:00");
    setActiveTab("pipeline");

    setShowSchedule(true);
    const schedTs = Number(item.scheduledAt) || Number(item.scheduledTimeMs) || item.timeMs;
    if (schedTs) {
      const d = new Date(schedTs);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      setScheduledDate(`${y}-${m}-${dayStr}`);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      setScheduledTime(`${hh}:${mm}`);
    }
  };

  const handleDeleteScheduledItem = async (item: any) => {
    const itemId = item.id || item.videoId;
    if (!confirm("Are you sure you want to delete this scheduled FlipLONG video?")) return;

    try {
      setDeletingId(itemId);
      const res = await axios.delete(`/api/flipLong?id=${encodeURIComponent(itemId)}`);
      if (res.data?.success || res.status === 200) {
        setScheduledVideos((prev) => prev.filter((a) => (a.id || a.videoId) !== itemId));
        if (editingVideoId === itemId) {
          resetFormState();
        }
      }
    } catch (err) {
      console.error("Failed to delete scheduled video:", err);
      alert("Failed to delete scheduled video.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen || !mounted) return null;

  const portalTarget = document.getElementById("sf360-app-root") ?? document.body;
  const isVideoDone = videoData?.status === "success" && Boolean(videoData?.denoised_video);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
      {/* Backdrop */}
      <div onClick={handleClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />

      {/* Modal Container */}
      <div className="relative z-10 rounded-t-3xl bg-[#0a0c16] border border-white/10 border-b-0 max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        {/* Drag Handle */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#0e101f] shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Title Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/40 text-purple-300 text-xs font-black tracking-wide shadow-inner">
              <Film size={14} className="text-purple-400" />
              <span>FlipLONG Video & AI Reels Pipeline</span>
            </div>

            {/* Navigation Tabs */}
            <button
              type="button"
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                activeTab === "pipeline"
                  ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20"
                  : "bg-white/5 text-gray-400 hover:text-white border-white/5"
              }`}
            >
              <span>{editingVideoId ? "Edit Video" : "Upload & AI Pipeline"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("scheduled");
                fetchUserScheduledVideos();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                activeTab === "scheduled"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/10"
                  : "bg-white/5 text-gray-400 hover:text-white border-white/5"
              }`}
            >
              <Clock size={12} className={scheduledVideos.length > 0 ? "text-amber-400 animate-pulse" : "text-gray-400"} />
              <span>Scheduled</span>
              {scheduledVideos.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-black">
                  {scheduledVideos.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5 shrink-0"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            TAB 1: UPLOAD, AI PROCESSING PIPELINE & REELS STUDIO
            ───────────────────────────────────────────────────────────────── */}
        {activeTab === "pipeline" && (
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 space-y-4 max-w-3xl mx-auto w-full">
            {/* Feedback Alerts */}
            {submitError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs animate-in fade-in">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                <div className="flex-1 leading-relaxed">{submitError}</div>
                <button type="button" onClick={() => setSubmitError("")} className="text-red-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {submitSuccess && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                <div className="flex-1 leading-relaxed">{submitSuccess}</div>
                <button type="button" onClick={() => setSubmitSuccess("")} className="text-emerald-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Editing Scheduled Banner */}
            {editingVideoId && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs">
                <div className="flex items-center gap-2">
                  <Edit3 size={15} className="text-purple-400" />
                  <span>Editing scheduled FlipLONG video</span>
                </div>
                <button
                  type="button"
                  onClick={resetFormState}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px]"
                >
                  Cancel Edit
                </button>
              </div>
            )}

            {/* ─── STAGE 1: ACTIVE UPLOAD OR AI PROCESSING PROGRESS CARD ─── */}
            {(isUploading || isProcessing || (activeJob && !isVideoDone)) && (
              <div className="rounded-2xl p-4.5 bg-gradient-to-br from-[#121426] to-[#181028] border border-purple-500/30 shadow-xl shadow-purple-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                      <Sparkles size={16} className="animate-spin" style={{ animationDuration: "3s" }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>AI Video Processing in Progress</span>
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {isUploading
                          ? `Uploading direct to cloud: ${uploadProgress}%...`
                          : "Transcribing audio, removing noise & generating viral 9:16 reels."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => activeVideoId && checkStatus(activeVideoId)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-purple-300 transition-colors"
                    title="Refresh status"
                  >
                    <RefreshCw size={13} className={isProcessing ? "animate-spin" : ""} />
                  </button>
                </div>

                {/* Direct Upload Progress Bar */}
                {isUploading && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
                      <span>Uploading File Payload</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* AI Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                      uploadProgress === 100 || isProcessing
                        ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                        : "bg-white/5 border-white/10 text-gray-400"
                    }`}
                  >
                    <CheckCircle2 size={15} className={uploadProgress === 100 ? "text-purple-400" : "text-gray-500"} />
                    <span>1. Cloud Upload</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                      isProcessing
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-sm"
                        : "bg-white/5 border-white/10 text-gray-400"
                    }`}
                  >
                    <Loader2 size={15} className={isProcessing ? "animate-spin text-purple-400" : "text-gray-500"} />
                    <span>2. Whisper & Denoise</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                      isProcessing
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-sm"
                        : "bg-white/5 border-white/10 text-gray-400"
                    }`}
                  >
                    <Flame size={15} className={isProcessing ? "text-amber-400 animate-pulse" : "text-gray-500"} />
                    <span>3. Viral Reels (9:16)</span>
                  </div>
                </div>

                {/* Safe to Close Banner */}
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/25 flex items-start gap-2 text-[11px] text-purple-300 leading-relaxed">
                  <Info size={14} className="shrink-0 mt-0.5 text-purple-400" />
                  <div>
                    <strong>You can safely close this modal or browse other pages!</strong>
                    <br />
                    AI processing happens in the cloud (~2–5 mins). When you return, your processed video and reels will be ready here.
                  </div>
                </div>
              </div>
            )}

            {/* ─── STAGE 2: VIDEO FORM (If not currently processing or done) ─── */}
            {!isProcessing && !isVideoDone && (
              <div className="space-y-4">
                {/* Title */}
                <FormInput
                  label="Video Title *"
                  name="title"
                  value={videoForm.title}
                  onChange={handleChangeVideo}
                  placeholder="Enter video drop title (e.g., Ind vs Sl Match Review & Analysis)..."
                />

                {/* Sport & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1 font-semibold">Sport Category</label>
                    <select
                      name="sport"
                      value={videoForm.sport}
                      onChange={handleChangeVideo}
                      className="w-full bg-[#11131f] border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-all cursor-pointer"
                    >
                      <option value="general">📢 General</option>
                      <option value="cricket">🏏 Cricket</option>
                      <option value="football">⚽ Football</option>
                      <option value="athletics">🏃 Athletics</option>
                    </select>
                  </div>

                  <div>
                    <FormInput
                      label="Author Name (Watermark)"
                      name="author"
                      value={videoForm.author}
                      onChange={handleChangeVideo}
                      placeholder={currentUserName || "Your Name"}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">
                    Video Context / Summary <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={videoForm.description}
                    onChange={handleChangeVideo}
                    placeholder="Provide context, key highlights, or insights for this video drop..."
                    rows={3}
                    className="w-full bg-[#11131f] border border-white/10 focus:border-purple-500 rounded-xl p-3 text-sm text-white placeholder:text-gray-500 outline-none resize-y transition-all leading-relaxed"
                  />
                </div>

                {/* Video File Upload */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block font-semibold">
                    Upload Video File * <span className="text-gray-500 font-normal">(MP4, WebM, MOV)</span>
                  </label>

                  <div className="border border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl p-4 bg-[#11131f]/70 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setVideoFile(file);
                        setExistingVideoUrl("");
                      }}
                      className="w-full bg-transparent text-white file:mr-3 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-purple-600 file:to-indigo-600 file:text-white hover:file:opacity-90 text-xs cursor-pointer"
                    />

                    {videoFile && (
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                        <span>
                          Size: <strong className="text-white">{formatFileSize(videoFile.size)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Duration: <strong className="text-white">{videoDuration}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {videoPreviewUrl && (
                    <div className="mt-3 relative rounded-2xl overflow-hidden border border-white/10 bg-black/70 shadow-lg group">
                      <video src={videoPreviewUrl} controls className="w-full max-h-[220px] object-contain rounded-2xl bg-black" />
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          setExistingVideoUrl("");
                        }}
                        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center text-xs transition cursor-pointer border border-white/10"
                        title="Remove video"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Schedule Option */}
                {showSchedule && (
                  <ScheduleConfigBox
                    scheduledDate={scheduledDate}
                    setScheduledDate={setScheduledDate}
                    scheduledTime={scheduledTime}
                    setScheduledTime={setScheduledTime}
                    onCancel={() => setShowSchedule(false)}
                    onPresetMinutes={applySchedulePreset}
                    onPresetTomorrow={applyTomorrowPreset}
                    scheduledTs={scheduledTs}
                    isPastTime={isPastTime}
                    getTodayDateString={getTodayDateString}
                  />
                )}
              </div>
            )}

            {/* ─── STAGE 3: PROCESSED RESULTS & REELS STUDIO (When done) ─── */}
            {isVideoDone && videoData && (
              <div className="space-y-6 pt-1">
                {/* 1. Master Processed FlipLong Video Card */}
                <div className="rounded-2xl p-4 bg-[#111322] border border-purple-500/30 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-purple-400" />
                        <span>Denoised Master Video</span>
                      </span>
                      <span className="text-xs text-gray-400 font-medium">Ready for FlipLong</span>
                    </div>

                    <button
                      type="button"
                      onClick={clearActiveJob}
                      className="text-xs text-gray-500 hover:text-red-400 font-medium transition-colors"
                      title="Clear and start new video"
                    >
                      Start New Upload
                    </button>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/80">
                    <video
                      src={videoData.denoised_video}
                      controls
                      className="w-full max-h-[300px] object-contain rounded-xl bg-black"
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">
                      {videoData.main_title || videoForm.title || "Processed Video Drop"}
                    </h3>
                    {videoData.summary && (
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{videoData.summary}</p>
                    )}
                  </div>

                  {/* Publish FlipLong Button */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSchedule((prev) => !prev)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                        showSchedule
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                      }`}
                    >
                      <Clock size={13} className="text-amber-400" />
                      <span>{showSchedule ? "Scheduled" : "Schedule"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePublishMasterVideo}
                      disabled={submittingFlipLong || (showSchedule && (isPastTime || !scheduledTs))}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-50 ${
                        publishedMaster
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : showSchedule
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20"
                      }`}
                    >
                      {submittingFlipLong ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Publishing to FlipLONG...</span>
                        </>
                      ) : publishedMaster ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Published to FlipLONG Feed ✅</span>
                        </>
                      ) : showSchedule ? (
                        <>
                          <Clock size={13} />
                          <span>Schedule FlipLONG Video</span>
                        </>
                      ) : (
                        <>
                          <Film size={13} />
                          <span>Publish Master to FlipLONG Feed ↗</span>
                        </>
                      )}
                    </button>
                  </div>

                  {showSchedule && (
                    <div className="pt-2">
                      <ScheduleConfigBox
                        scheduledDate={scheduledDate}
                        setScheduledDate={setScheduledDate}
                        scheduledTime={scheduledTime}
                        setScheduledTime={setScheduledTime}
                        onCancel={() => setShowSchedule(false)}
                        onPresetMinutes={applySchedulePreset}
                        onPresetTomorrow={applyTomorrowPreset}
                        scheduledTs={scheduledTs}
                        isPastTime={isPastTime}
                        getTodayDateString={getTodayDateString}
                      />
                    </div>
                  )}
                </div>

                {/* 2. Generated Viral Reels (9:16 Shorts) for FlipLine */}
                {videoData.reels && videoData.reels.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                          <Zap size={13} />
                        </div>
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          AI Viral Reels ({videoData.reels.length})
                        </h4>
                        <span className="text-[10.5px] text-pink-300 font-semibold bg-pink-500/15 px-2 py-0.5 rounded-md border border-pink-500/30">
                          Direct to FlipLine ⚡
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleApproveAllReels}
                        disabled={submittingFlipLong}
                        className="text-[11px] font-bold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 size={12} />
                        <span>Publish All Reels</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {videoData.reels.map((reel, idx) => {
                        const isPublishing = publishingReelIdx === idx;
                        const isReelPublished = publishedReels.includes(idx) || reel.is_approved;
                        const isPlaying = activePlayingReel === idx;

                        return (
                          <div
                            key={idx}
                            className="flex flex-col rounded-2xl bg-[#0f1120] border border-white/10 hover:border-pink-500/40 p-3 transition-all shadow-md group relative overflow-hidden"
                          >
                            {/* Reel Player (9:16 aspect preview) */}
                            <div className="relative rounded-xl overflow-hidden bg-black/90 aspect-[9/16] max-h-[260px] flex items-center justify-center border border-white/10 mb-2.5">
                              <video
                                src={reel.mp4}
                                controls={isPlaying}
                                className="w-full h-full object-cover"
                              />
                              {!isPlaying && (
                                <button
                                  type="button"
                                  onClick={() => setActivePlayingReel(idx)}
                                  className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all cursor-pointer"
                                >
                                  <div className="w-10 h-10 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                    <Play size={16} className="ml-0.5" />
                                  </div>
                                </button>
                              )}
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-black/70 text-white border border-white/20">
                                Reel #{idx + 1}
                              </span>
                            </div>

                            {/* Reel Meta */}
                            <div className="flex-1 min-w-0 mb-3 space-y-1">
                              <h5 className="text-xs font-bold text-white line-clamp-1">
                                {reel.title}
                              </h5>
                              {reel.caption && (
                                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                                  {reel.caption}
                                </p>
                              )}
                              {reel.reason && (
                                <p className="text-[10px] text-pink-400/80 italic line-clamp-1">
                                  💡 {reel.reason}
                                </p>
                              )}
                            </div>

                            {/* Direct Publish to FlipLine Button */}
                            <button
                              type="button"
                              onClick={() => handlePublishReelToFlipLine(reel, idx)}
                              disabled={isPublishing}
                              className={`w-full py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                                isReelPublished
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-500/20"
                              }`}
                            >
                              {isPublishing ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />
                                  <span>Publishing to FlipLine...</span>
                                </>
                              ) : isReelPublished ? (
                                <>
                                  <CheckCircle2 size={12} className="text-emerald-400" />
                                  <span>Posted to FlipLine ✅</span>
                                </>
                              ) : (
                                <>
                                  <Send size={11} />
                                  <span>Post to FlipLine ⚡</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Full Highlights Reel */}
                {videoData.highlights && videoData.highlights.mp4 && (
                  <div className="p-3.5 rounded-2xl bg-[#0f1120] border border-amber-500/30 flex flex-col sm:flex-row items-center gap-3.5">
                    <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                      <video src={videoData.highlights.mp4} controls className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                          Full Highlights
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{videoData.highlights.title}</h5>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mt-0.5">
                        {videoData.highlights.caption || videoData.highlights.reason}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        videoData.highlights &&
                        handlePublishReelToFlipLine(
                          {
                            title: videoData.highlights.title,
                            caption: videoData.highlights.caption,
                            reason: videoData.highlights.reason,
                            start_time: 0,
                            end_time: 0,
                            is_approved: true,
                            mp4: videoData.highlights.mp4,
                          },
                          999
                        )
                      }
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors shrink-0 cursor-pointer"
                    >
                      Post Highlight to FlipLine ⚡
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            TAB 2: SCHEDULED FLIPLONG VIDEOS QUEUE
            ───────────────────────────────────────────────────────────────── */}
        {activeTab === "scheduled" && (
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Your Pending Scheduled FlipLONG Videos
                </span>
                <span className="text-[11px] text-gray-500">({scheduledVideos.length})</span>
              </div>
              <button
                type="button"
                onClick={fetchUserScheduledVideos}
                disabled={loadingScheduled}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} className={loadingScheduled ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingScheduled ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                <Loader2 size={24} className="animate-spin text-amber-400" />
                <span className="text-xs font-medium">Loading scheduled videos...</span>
              </div>
            ) : scheduledVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <Film size={22} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">No Scheduled Videos</h4>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  When you schedule FlipLONG video drops for a future date & time, they will appear here and automatically publish when due.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("pipeline");
                    setShowSchedule(true);
                    if (!scheduledDate) setScheduledDate(getTodayDateString());
                    if (!scheduledTime) setScheduledTime(getDefaultTimeString(30));
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  + Upload & Schedule Video
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledVideos.map((item) => {
                  const targetTs = Number(item.scheduledAt) || Number(item.scheduledTimeMs) || item.timeMs;
                  const countdown = formatCountdown(targetTs);
                  const itemId = item.id || item.videoId;
                  const isDeleting = deletingId === itemId;

                  return (
                    <div
                      key={itemId}
                      className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[#0e101d] border border-white/10 hover:border-purple-500/40 transition-all shadow-md group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider border bg-purple-500/20 text-purple-300 border-purple-500/40 flex items-center gap-1">
                            <VideoIcon size={11} />
                            <span>FLIPLONG VIDEO</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                            <Clock size={10} />
                            <span>{countdown}</span>
                          </span>
                        </div>

                        <span className="text-[11px] font-medium text-gray-400">
                          {new Date(targetTs).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        {(item.thumbnailUrl || item.url || item.videoUrl) && (
                          <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/60 shrink-0">
                            {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-950/40 text-purple-400">
                                <Film size={20} />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                              {typeof item.description === "string" ? item.description : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => handleEditScheduledItem(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-white/10 hover:border-purple-500/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteScheduledItem(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── ACTION BAR FOR INITIAL UPLOAD STAGE ─── */}
        {activeTab === "pipeline" && !isProcessing && !isVideoDone && (
          <div className="shrink-0 px-5 py-3.5 border-t border-white/5 bg-[#0a0c16] flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!showSchedule) {
                  if (!scheduledDate) setScheduledDate(getTodayDateString());
                  if (!scheduledTime) setScheduledTime(getDefaultTimeString(30));
                }
                setShowSchedule((prev) => !prev);
              }}
              className={`px-4 py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                showSchedule
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
              }`}
            >
              <Clock size={14} className="text-amber-400" />
              <span>{showSchedule ? "Scheduled" : "Schedule"}</span>
            </button>

            <button
              type="button"
              onClick={handleStartUpload}
              disabled={isUploading || !videoForm.title.trim() || !videoFile}
              className="flex-1 py-3 rounded-xl font-bold text-xs text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-lg active:scale-95 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25"
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Uploading to Cloud ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Upload & Run AI Pipeline (Whisper + Reels) ↗</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    portalTarget
  );
}

function FormInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block font-semibold">{label}</label>
      <input
        {...props}
        className="w-full bg-[#11131f] border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-white placeholder:text-gray-500 text-sm outline-none transition-all"
      />
    </div>
  );
}

function ScheduleConfigBox({
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  onCancel,
  onPresetMinutes,
  onPresetTomorrow,
  scheduledTs,
  isPastTime,
  getTodayDateString,
}: {
  scheduledDate: string;
  setScheduledDate: (d: string) => void;
  scheduledTime: string;
  setScheduledTime: (t: string) => void;
  onCancel: () => void;
  onPresetMinutes: (mins: number) => void;
  onPresetTomorrow: (h: number, m: number) => void;
  scheduledTs: number | null;
  isPastTime: boolean;
  getTodayDateString: () => string;
}) {
  return (
    <div className="flex flex-col gap-3 bg-[#11131f] border border-amber-500/30 rounded-xl p-3.5 shadow-lg shadow-amber-500/5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-amber-400" />
          <span>Schedule Video Publication (Auto-publish)</span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-red-400 text-xs font-medium cursor-pointer"
        >
          Cancel Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-semibold text-gray-400">Publish Date</label>
          <input
            type="date"
            min={getTodayDateString()}
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full bg-[#18181b] border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white outline-none [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-semibold text-gray-400">Publish Time</label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full bg-[#18181b] border border-white/10 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white outline-none [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] text-gray-500 font-medium mr-0.5">Presets:</span>
        {[
          { label: "+15m", action: () => onPresetMinutes(15) },
          { label: "+1h", action: () => onPresetMinutes(60) },
          { label: "+3h", action: () => onPresetMinutes(180) },
          { label: "Tomorrow 9 AM", action: () => onPresetTomorrow(9, 0) },
          { label: "Tomorrow 6 PM", action: () => onPresetTomorrow(18, 0) },
        ].map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={preset.action}
            className="px-2 py-1 rounded-md bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 text-[10.5px] font-semibold transition-all cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {scheduledTs && (
        <div
          className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 border ${
            isPastTime
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-amber-500/10 border-amber-500/25 text-amber-300"
          }`}
        >
          <Clock size={13} className="shrink-0" />
          <span>
            {isPastTime
              ? "⚠️ Selected time is in the past. Please choose a future time."
              : `Will go live on ${new Date(scheduledTs).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}`}
          </span>
        </div>
      )}
    </div>
  );
}
