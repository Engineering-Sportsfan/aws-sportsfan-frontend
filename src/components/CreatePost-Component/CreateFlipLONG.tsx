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
  Upload,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFlipLongJob, notifyProcessingComplete } from "@/hooks/useFlipLongJob";
import { ReelItem } from "@/types/fliplong";

export type FlowStep = "upload" | "submitted" | "review" | "published";

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
    markMasterPublished,
    markReelPublished,
    clearActiveJob,
    discardCurrentAndReset,
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
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
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

  // Flow step management matching reference image 5 steps:
  // Step 1: upload -> Step 2: submitted -> Step 3: in-app notification -> Step 4: review -> Step 5: published
  const [flowStep, setFlowStep] = useState<FlowStep>("upload");
  const [instructions, setInstructions] = useState<string>("");
  const [selectedReelIndices, setSelectedReelIndices] = useState<number[]>([]);

  // Video playback preview state for reels
  const [activePlayingReel, setActivePlayingReel] = useState<number | null>(null);

  // Automatically adapt flowStep when job or videoData changes
  useEffect(() => {
    if (publishedMaster) {
      setFlowStep("published");
    } else if (videoData?.status === "success" && videoData?.denoised_video) {
      setFlowStep("review");
    } else if (activeJob && !activeJob.isMasterPublished && (isUploading || isProcessing || activeJob.status !== "success")) {
      // If user is returning while video is being prepared/submitted
      setFlowStep((prev) => (prev === "upload" ? "submitted" : prev));
    }
  }, [publishedMaster, videoData, activeJob, isUploading, isProcessing]);

  // Sync selected reels when reels arrive
  useEffect(() => {
    if (videoData?.reels && videoData.reels.length > 0) {
      // By default select all reels
      setSelectedReelIndices(videoData.reels.map((_, i) => i));
    }
  }, [videoData?.reels]);

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
      if (activeJob.isMasterPublished) {
        setPublishedMaster(true);
      }
      if (activeJob.publishedReelIndices && Array.isArray(activeJob.publishedReelIndices)) {
        setPublishedReels((prev) => Array.from(new Set([...prev, ...activeJob.publishedReelIndices!])));
      }
    }
  }, [activeJob, currentUserName]);

  // Check if video processing is completed (Step 1 upload & Step 2 processing)
  const isVideoDone = videoData?.status === "success" && Boolean(videoData?.denoised_video);

  // Send notification when video processing completes
  useEffect(() => {
    if (isVideoDone && activeVideoId) {
      notifyProcessingComplete({
        videoId: activeVideoId,
        title: videoData?.main_title || videoForm.title || activeJob?.title,
        userEmail: activeJob?.userEmail || user?.email,
        userId: activeJob?.userId || currentUserId,
        author: videoForm.author || currentUserName,
      });
    }
  }, [
    isVideoDone,
    activeVideoId,
    videoData?.main_title,
    videoForm.title,
    activeJob?.title,
    activeJob?.userEmail,
    activeJob?.userId,
    user?.email,
    currentUserId,
    videoForm.author,
    currentUserName,
  ]);

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
    setFlowStep("upload");
    setInstructions("");
    setSelectedReelIndices([]);
  };

  const handleClose = () => {
    resetFormState();
    setShowDiscardConfirm(false);
    onClose();
  };

  // ─── Upload New Video & Database Cleanup ─────────────────────────────────
  const handleUploadNewVideoClick = () => {
    // Check if there is an active video job or processed results that have unposted items
    const hasUnpostedContent =
      (Boolean(activeJob) || isProcessing || isUploading || (videoData?.status === "success" && Boolean(videoData?.denoised_video))) &&
      (!publishedMaster || (videoData?.reels && videoData.reels.length > publishedReels.length));

    if (hasUnpostedContent) {
      setShowDiscardConfirm(true);
    } else {
      executeUploadNewVideo();
    }
  };

  const executeUploadNewVideo = async () => {
    setShowDiscardConfirm(false);
    setIsDiscarding(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await discardCurrentAndReset({ isMasterPublished: publishedMaster });
      resetFormState();
      setActiveTab("pipeline");
      setFlowStep("upload");
      setSubmitSuccess("Unposted video & reels removed from database. Ready to upload a new video!");
    } catch (err: any) {
      setSubmitError(formatErrorMessage(err));
    } finally {
      setIsDiscarding(false);
    }
  };

  // ─── 1. Start AI Video Pipeline Upload (Step 1 -> Step 2) ──────────────────
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
      const fullDescription = [
        videoForm.description.trim(),
        instructions.trim() ? `Instructions: ${instructions.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      // Advance directly to Step 2: Submitted screen
      setFlowStep("submitted");

      await startDirectUpload(videoFile, {
        title: videoForm.title.trim(),
        description: fullDescription,
        author: videoForm.author.trim() || currentUserName,
        sport: videoForm.sport || "general",
        duration: videoDuration,
        durationSec: videoDurationSec,
        userId: currentUserId,
        userEmail: user?.email || "",
      });

      setSubmitSuccess("Video submitted! Your video is being prepared for publishing.");
    } catch (err: any) {
      setFlowStep("upload");
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
        markMasterPublished(true);
        setFlowStep("published");
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
      markReelPublished(index);
      setSubmitSuccess(`Reel "${reel.title}" published directly to FlipLine! ⚡`);
    } catch (err: any) {
      setSubmitError(formatErrorMessage(err));
    } finally {
      setPublishingReelIdx(null);
    }
  };

  // ─── 4. Multi-Select Approve & Publish Selected Reels (Matching Step 4 in reference) ──
  const handlePublishSelectedReels = async () => {
    if (!videoData?.reels || videoData.reels.length === 0) return;
    const indicesToPublish = selectedReelIndices.length > 0 ? selectedReelIndices : videoData.reels.map((_, i) => i);
    try {
      setSubmittingFlipLong(true);
      await approveReels(indicesToPublish);

      // Publish each selected reel to FlipLine feed
      for (const i of indicesToPublish) {
        if (!publishedReels.includes(i) && videoData.reels[i]) {
          await publishReelToFlipLine(videoData.reels[i], i, {
            sport: videoForm.sport || "general",
            author: videoForm.author || currentUserName,
            authorPhoto: userAvatar,
            userId: user?.userId || (user as any)?.uid || "",
            email: user?.email || "",
          });
          markReelPublished(i);
        }
      }

      setPublishedReels((prev) => Array.from(new Set([...prev, ...indicesToPublish])));
      indicesToPublish.forEach((idx) => markReelPublished(idx));
      setSubmitSuccess(`${indicesToPublish.length} selected Reels published to FlipLine! ⚡`);
    } catch (err: any) {
      setSubmitError(formatErrorMessage(err));
    } finally {
      setSubmittingFlipLong(false);
    }
  };

  // ─── Legacy Multi-Select Approve & Publish All Reels ────────────────────────
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
          markReelPublished(i);
        }
      }

      setPublishedReels(allIndices);
      allIndices.forEach((idx) => markReelPublished(idx));
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

          <div className="flex items-center gap-2 shrink-0">
            {/* Upload New Video Button in Header */}
            {(Boolean(activeJob) || isVideoDone || isProcessing || isUploading) && (
              <button
                type="button"
                onClick={handleUploadNewVideoClick}
                disabled={isDiscarding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600 hover:to-indigo-600 text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-400 shadow-md shadow-purple-500/10 active:scale-95 disabled:opacity-50"
                title="Upload a new video (deletes unposted content from database)"
              >
                {isDiscarding ? (
                  <Loader2 size={13} className="animate-spin text-purple-300" />
                ) : (
                  <Upload size={13} className="text-purple-300 group-hover:text-white" />
                )}
                <span>+ Upload New Video</span>
              </button>
            )}

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5 shrink-0"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            TAB 1: UPLOAD, AI PROCESSING PIPELINE & REELS STUDIO
            ───────────────────────────────────────────────────────────────── */}
        {/* ─────────────────────────────────────────────────────────────────
            TAB 1: FLIPLONG 5-STEP VIDEO PIPELINE (Matching Reference Flow)
            ───────────────────────────────────────────────────────────────── */}
        {activeTab === "pipeline" && (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0 space-y-4 max-w-xl mx-auto w-full">
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

            {submitSuccess && flowStep !== "submitted" && flowStep !== "published" && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                <div className="flex-1 leading-relaxed">{submitSuccess}</div>
                <button type="button" onClick={() => setSubmitSuccess("")} className="text-emerald-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Editing Scheduled Video Banner */}
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

            {/* ═══════════════════════════════════════════════════════════════
                STEP 1: UPLOAD VIDEO (Column 1 of reference image)
                ═══════════════════════════════════════════════════════════════ */}
            {flowStep === "upload" && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Title Badge Header */}
                <div className="space-y-1">
                  <span className="text-[11px] font-black tracking-widest text-gray-400 uppercase">
                    CREATE
                  </span>
                  <h2 className="text-3xl font-black italic tracking-wide bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                    FLIPLONG
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Share your in-depth insights, analysis and stories with fans.
                  </p>
                </div>

                {/* Video Title Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">
                      Video Title <span className="text-pink-500">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-gray-500">
                      {videoForm.title.length}/150
                    </span>
                  </div>
                  <input
                    type="text"
                    name="title"
                    maxLength={150}
                    value={videoForm.title}
                    onChange={handleChangeVideo}
                    placeholder="e.g. India Storm Into Asian Games T20 Final"
                    className="w-full bg-[#111322] border border-white/10 focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Instructions (Optional) Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">
                      Instructions <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[11px] font-mono text-gray-500">
                      {instructions.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Add any context, key points or instructions for the team..."
                    className="w-full bg-[#111322] border border-white/10 focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/40 rounded-xl p-3 text-xs text-white placeholder:text-gray-500 outline-none transition-all resize-none shadow-inner leading-relaxed"
                  />
                </div>

                {/* Select Video Section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Select Video <span className="text-pink-500">*</span>
                  </label>

                  {videoFile ? (
                    <div className="rounded-2xl border border-white/15 bg-[#121426] p-3 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 flex items-center justify-center">
                          {videoPreviewUrl ? (
                            <video src={videoPreviewUrl} className="w-full h-full object-cover" />
                          ) : (
                            <VideoIcon size={20} className="text-purple-400" />
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play size={14} className="text-white fill-white ml-0.5" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{videoFile.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                            {formatFileSize(videoFile.size)} • {videoDuration}
                          </p>
                        </div>
                      </div>

                      {/* Choose Another Video Button */}
                      <label className="w-full py-2.5 rounded-xl border border-white/15 hover:border-purple-400/50 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                        <Upload size={14} className="text-purple-300" />
                        <span>Choose Another Video</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            if (file) {
                              setVideoFile(file);
                              setExistingVideoUrl("");
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-white/15 hover:border-pink-500/50 rounded-2xl p-6 bg-[#121426]/70 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-[#121426]">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-2">
                        <Upload size={20} />
                      </div>
                      <span className="text-xs font-bold text-white">Click or Drag to Select Video</span>
                      <span className="text-[11px] text-gray-400 mt-1">MP4, MOV, WebM • Max size 2 GB</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          if (file) {
                            setVideoFile(file);
                            setExistingVideoUrl("");
                          }
                        }}
                      />
                    </label>
                  )}

                  {/* Format Notice Pill */}
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                    <Info size={13} className="text-purple-400 shrink-0" />
                    <span>Supported formats: MP4, MOV, WebM • Max size: 2 GB</span>
                  </div>
                </div>

                {/* Submit Video Primary Action */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleStartUpload}
                    disabled={isUploading || !videoForm.title.trim() || !videoFile}
                    className="w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 shadow-pink-500/25"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting Video ({uploadProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Submit Video</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-start gap-2 text-[11px] text-gray-400 px-1 text-center justify-center">
                    <Info size={13} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      Your video will be uploaded and prepared in the background. You&apos;ll be notified when it&apos;s ready.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                STEP 2: SUBMITTED CONFIRMATION (Column 2 of reference image)
                ═══════════════════════════════════════════════════════════════ */}
            {flowStep === "submitted" && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-200">
                {/* 3D Clapperboard & Green Checkmark Illustration */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="w-28 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-2xl shadow-purple-500/30 transform -rotate-6">
                    <div className="w-full h-full bg-[#121428] rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-4 bg-purple-500/30 border-b border-purple-400/30 flex items-center justify-around px-1">
                        <span className="w-2 h-full bg-white/30 transform skew-x-12" />
                        <span className="w-2 h-full bg-white/30 transform skew-x-12" />
                        <span className="w-2 h-full bg-white/30 transform skew-x-12" />
                      </div>
                      <Play size={24} className="text-white fill-white mt-2" />
                    </div>
                  </div>

                  {/* Green Check Circle Badge */}
                  <div className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-4 border-[#0a0c16] flex items-center justify-center text-white shadow-xl shadow-emerald-500/40">
                    <Check size={22} strokeWidth={3.5} />
                  </div>
                </div>

                {/* Headings & Notice */}
                <div className="space-y-3 max-w-sm">
                  <h3 className="text-2xl font-black text-white tracking-wide">
                    Video Submitted!
                  </h3>
                  <p className="text-sm text-gray-300 font-medium">
                    Your video is being prepared for publishing.
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    You&apos;ll get a notification when it&apos;s ready. You can continue using SportsFan360 in the meantime.
                  </p>
                </div>

                {/* Continue to Home Action */}
                <div className="w-full pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all cursor-pointer bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] shadow-purple-500/25"
                  >
                    Continue to Home
                  </button>

                  {/* Direct shortcut to review if completed */}
                  {isVideoDone && (
                    <button
                      type="button"
                      onClick={() => setFlowStep("review")}
                      className="text-xs text-purple-300 hover:text-white underline font-semibold transition-colors pt-1"
                    >
                      Video is ready! Review now ↗
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                STEP 4: REVIEW & PUBLISH (Column 4 of reference image)
                ═══════════════════════════════════════════════════════════════ */}
            {flowStep === "review" && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-wide">
                      Review Your Video
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      Everything looks good? Publish to FlipLONG and share short reels to FlipLINE.
                    </p>
                  </div>
                </div>

                {/* Master Video Preview Player */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/90 shadow-2xl">
                  {videoData?.denoised_video || videoPreviewUrl ? (
                    <video
                      src={videoData?.denoised_video || videoPreviewUrl}
                      controls
                      className="w-full max-h-[260px] object-contain rounded-2xl bg-black"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-500 text-xs">
                      No video preview available
                    </div>
                  )}
                  {videoDuration && videoDuration !== "0:00" && (
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/80 text-white border border-white/20">
                      {videoDuration}
                    </span>
                  )}
                </div>

                {/* Editable Title */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Video Title</span>
                      <Edit3 size={12} className="text-pink-400" />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={videoForm.title}
                    onChange={handleChangeVideo}
                    className="w-full bg-[#111322] border border-white/10 focus:border-pink-500 rounded-xl px-3.5 py-2 text-sm text-white font-bold outline-none transition-all"
                  />
                  <div className="flex items-center gap-2 pt-0.5">
                    {userAvatar ? (
                      <img src={userAvatar} alt="avatar" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <User size={13} className="text-gray-400" />
                    )}
                    <span className="text-[11px] text-gray-400">By {videoForm.author || currentUserName}</span>
                  </div>
                </div>

                {/* Editable Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">Description</label>
                    <span className="text-[11px] font-mono text-gray-500">
                      {videoForm.description.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={500}
                    name="description"
                    value={videoForm.description}
                    onChange={handleChangeVideo}
                    placeholder="Add a deep dive into the highlights..."
                    className="w-full bg-[#111322] border border-white/10 focus:border-pink-500 rounded-xl p-2.5 text-xs text-white placeholder:text-gray-500 outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Publish to FlipLONG Primary Action */}
                <button
                  type="button"
                  onClick={handlePublishMasterVideo}
                  disabled={submittingFlipLong}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 shadow-pink-500/25"
                >
                  {submittingFlipLong ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Publishing to FlipLONG...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Publish to FlipLONG</span>
                    </>
                  )}
                </button>

                {/* Short Reels for FlipLINE Section */}
                {videoData?.reels && videoData.reels.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          Short Reels for FlipLINE ({videoData.reels.length})
                        </h4>
                        <p className="text-[11px] text-gray-400">Select the clips you want to publish as reels.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedReelIndices.length === videoData.reels.length) {
                            setSelectedReelIndices([]);
                          } else {
                            setSelectedReelIndices(videoData.reels.map((_, i) => i));
                          }
                        }}
                        className="text-[11px] font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                      >
                        {selectedReelIndices.length === videoData.reels.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    {/* Reels Grid / Cards with Checkbox Toggle */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {videoData.reels.map((reel, idx) => {
                        const isSelected = selectedReelIndices.includes(idx);
                        const isPublished = publishedReels.includes(idx);

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedReelIndices((prev) =>
                                prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                              );
                            }}
                            className={`relative rounded-xl overflow-hidden aspect-[9/14] border-2 cursor-pointer transition-all bg-black group flex flex-col justify-end p-1.5 ${
                              isSelected
                                ? "border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                : "border-white/15 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <video src={reel.mp4} className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            {/* Top Checkbox Badge */}
                            <div className="absolute top-1.5 right-1.5">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/50"
                                    : "bg-black/60 border border-white/30 text-transparent"
                                }`}
                              >
                                <Check size={12} strokeWidth={3} />
                              </div>
                            </div>

                            {/* Reel Title & Duration pill */}
                            <div className="relative z-10 space-y-0.5">
                              <span className="text-[10px] font-bold text-white line-clamp-1">
                                {reel.title || `Clip #${idx + 1}`}
                              </span>
                              <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-mono bg-black/70 text-gray-300">
                                0:{idx === 0 ? "43" : idx === 1 ? "38" : "28"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Publish Selected Reels Button */}
                    <button
                      type="button"
                      onClick={handlePublishSelectedReels}
                      disabled={submittingFlipLong || selectedReelIndices.length === 0}
                      className="w-full py-3 rounded-2xl font-bold text-xs text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-400 bg-purple-600/20 hover:bg-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      <Upload size={14} />
                      <span>Publish Selected Reels ({selectedReelIndices.length})</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                STEP 5: PUBLISHED CONFIRMATION (Column 5 of reference image)
                ═══════════════════════════════════════════════════════════════ */}
            {flowStep === "published" && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-5 animate-in zoom-in-95 duration-200">
                {/* Big Green Checkmark with Celebration Rays */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "3s" }} />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-4 border-[#0a0c16] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/50">
                    <Check size={36} strokeWidth={3.5} />
                  </div>
                </div>

                {/* Headings */}
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-2xl font-black text-white tracking-wide">
                    Published!
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Your video is now live on FlipLONG and your selected reels are live on FlipLINE.
                  </p>
                </div>

                {/* Video Card Preview */}
                <div className="w-full rounded-2xl bg-[#121426] border border-white/10 p-3 flex items-center gap-3 text-left">
                  <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 flex items-center justify-center">
                    {videoData?.denoised_video || videoPreviewUrl ? (
                      <video src={videoData?.denoised_video || videoPreviewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <VideoIcon size={20} className="text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {videoForm.title || "FlipLONG Video Drop"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 mt-0.5">
                      <Play size={10} className="fill-purple-400" />
                      <span>Watch on FlipLONG</span>
                    </span>
                  </div>
                </div>

                {/* Reels Published Preview */}
                {selectedReelIndices.length > 0 && videoData?.reels && (
                  <div className="w-full space-y-1.5 text-left">
                    <span className="text-xs font-bold text-gray-300">
                      Reels Published ({selectedReelIndices.length})
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedReelIndices.map((idx) => {
                        const r = videoData.reels[idx];
                        if (!r) return null;
                        return (
                          <div
                            key={idx}
                            className="relative w-14 h-18 rounded-xl overflow-hidden bg-black border border-purple-500/50"
                          >
                            <video src={r.mp4} className="w-full h-full object-cover" />
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                              <Check size={8} strokeWidth={3} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="w-full pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all cursor-pointer bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] shadow-purple-500/25 flex items-center justify-center gap-2"
                  >
                    <Play size={14} className="fill-white" />
                    <span>View on FlipLONG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2.5 rounded-xl font-semibold text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Go to Home
                  </button>
                </div>
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



        {/* ─── DISCARD & UPLOAD NEW VIDEO CONFIRMATION MODAL ─── */}
        {showDiscardConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-[#101222] border border-red-500/30 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-white animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload New Video?</h3>
                  <p className="text-xs text-gray-400">Database cleanup & new video upload</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 leading-relaxed space-y-1">
                <p>
                  Any currently processed video and generated AI reels that have <strong>not been published anywhere</strong> will be deleted from the database.
                </p>
                {publishedMaster && (
                  <p className="text-emerald-300 font-medium">
                    ✓ Your published master video is already live on FlipLONG and will be preserved.
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                You will be able to upload a new video immediately and will continue to see that new video until you again click to upload a new video.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  disabled={isDiscarding}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Keep Current Video
                </button>

                <button
                  type="button"
                  onClick={executeUploadNewVideo}
                  disabled={isDiscarding}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isDiscarding ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Deleting & Resetting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>Delete & Upload New Video</span>
                    </>
                  )}
                </button>
              </div>
            </div>
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
