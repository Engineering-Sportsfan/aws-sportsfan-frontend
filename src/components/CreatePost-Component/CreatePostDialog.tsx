"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Image as ImageIcon,
  BarChart2,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  Clock,
  AlertCircle,
  Video as VideoIcon,
  Info,
  Edit3,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fliplineService, FlipCard } from "@/services/flipline.service";

const MAX_VIDEO_SIZE_MB = 4.5;
const MAX_IMAGE_SIZE_MB = 4.5;
const MAX_VIDEO_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

interface MediaItem {
  file: File;
  previewUrl: string;
  isVideo: boolean;
  sizeFormatted: string;
  sizeBytes: number;
}

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: FormData,
    userId: string,
    userName: string,
    userEmail?: string
  ) => Promise<void>;
}

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

function formatErrorMessage(err: any): string {
  if (!err) return "Failed to save post. Please check inputs and try again.";
  if (typeof err === "string") return err;

  // Axios error response data
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
    if (data.error && typeof data.error === "object") {
      try {
        const str = JSON.stringify(data.error);
        if (str !== "{}") return str;
      } catch {}
    }
    if (typeof data.message === "string") return data.message;
  }

  if (typeof err.message === "string") return err.message;
  if (typeof err.error === "string") return err.error;

  try {
    const json = JSON.stringify(err);
    if (json && json !== "{}") return json;
  } catch {}

  return "Failed to save post. Please check media sizes and try again.";
}

export default function CreatePostDialog({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostDialogProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"create" | "scheduled">("create");
  const [content, setContent] = useState("");
  const [sport, setSport] = useState<string>("");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [existingMediaPreview, setExistingMediaPreview] = useState<string>("");
  const [existingMediaType, setExistingMediaType] = useState<"image" | "video" | "">("");
  const [mediaError, setMediaError] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scheduled management state
  const [scheduledPosts, setScheduledPosts] = useState<FlipCard[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [editingPost, setEditingPost] = useState<FlipCard | null>(null);
  const [deletingSk, setDeletingSk] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Load current user's scheduled posts
  const fetchUserScheduledPosts = useCallback(async () => {
    const userId = user?.userId || (user as any)?.uid || (user as any)?.id || "";
    const userEmail = user?.email || (user as any)?.emailAddress || "";
    const author = user?.name || (user as any)?.username || "";

    try {
      setLoadingScheduled(true);
      const posts = await fliplineService.fetchScheduledPosts(userId, userEmail, author);
      const now = Date.now();
      // Strictly enforce future scheduled rule: past items are considered published and excluded
      const futurePosts = posts.filter((p) => {
        const schedTime = Number(p.scheduledAt) || Number(p.scheduledTimeMs);
        return (p.isScheduled || (schedTime && schedTime > 0)) && schedTime > now;
      });
      setScheduledPosts(futurePosts);
    } catch (err) {
      console.error("Failed to load scheduled posts", err);
    } finally {
      setLoadingScheduled(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchUserScheduledPosts();
    }
  }, [isOpen, fetchUserScheduledPosts]);

  const resetForm = () => {
    setContent("");
    setSport("");
    mediaList.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaList([]);
    setExistingMediaPreview("");
    setExistingMediaType("");
    setMediaError("");
    setSubmitError("");
    setShowPoll(false);
    setPollOptions(["", ""]);
    setShowSchedule(false);
    setScheduledDate("");
    setScheduledTime("");
    setSubmitting(false);
    setEditingPost(null);
    setActiveTab("create");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEditScheduledPost = (post: FlipCard) => {
    setEditingPost(post);
    setContent(post.content || "");
    setSport(post.sport || post.channel || "cricket");
    setShowSchedule(true);

    const schedTs = Number(post.scheduledAt) || Number(post.scheduledTimeMs) || post.timeMs;
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

    if (post.image) {
      setExistingMediaPreview(post.image);
      setExistingMediaType("image");
    } else if (post.videoUrl) {
      setExistingMediaPreview(post.videoUrl);
      setExistingMediaType("video");
    } else {
      setExistingMediaPreview("");
      setExistingMediaType("");
    }

    if ((post as any).poll && Array.isArray((post as any).poll.options)) {
      setShowPoll(true);
      setPollOptions((post as any).poll.options.map((o: any) => o.text || ""));
    } else {
      setShowPoll(false);
      setPollOptions(["", ""]);
    }

    setActiveTab("create");
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDeleteScheduledPost = async (sk: string) => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) return;
    try {
      setDeletingSk(sk);
      const success = await fliplineService.deleteScheduledPost(sk);
      if (success) {
        setScheduledPosts((prev) => prev.filter((p) => p.sk !== sk));
        if (editingPost?.sk === sk) {
          resetForm();
        }
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete scheduled post. Please try again.");
    } finally {
      setDeletingSk(null);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError("");
    setSubmitError("");

    if (e.target.files && e.target.files.length > 0) {
      const incomingFiles = Array.from(e.target.files);
      const newItems: MediaItem[] = [];
      const errorList: string[] = [];

      incomingFiles.forEach((file) => {
        const isVideo =
          file.type.startsWith("video/") ||
          /\.(mp4|mov|webm|m4v|mkv|avi)$/i.test(file.name);
        const isImage =
          file.type.startsWith("image/") ||
          /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);

        const sizeInMb = file.size / (1024 * 1024);

        if (isVideo) {
          if (file.size > MAX_VIDEO_BYTES) {
            errorList.push(
              `"${file.name}" (${sizeInMb.toFixed(1)} MB) exceeds the ${MAX_VIDEO_SIZE_MB} MB limit. Please compress or trim the video (max ~15s / 4.5 MB) before uploading.`
            );
            return;
          }
        } else if (isImage) {
          if (file.size > MAX_IMAGE_BYTES) {
            errorList.push(
              `"${file.name}" (${sizeInMb.toFixed(1)} MB) exceeds the ${MAX_IMAGE_SIZE_MB} MB image limit.`
            );
            return;
          }
        }

        const formattedSize =
          file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(0)} KB`
            : `${sizeInMb.toFixed(1)} MB`;

        newItems.push({
          file,
          previewUrl: URL.createObjectURL(file),
          isVideo,
          sizeFormatted: formattedSize,
          sizeBytes: file.size,
        });
      });

      if (errorList.length > 0) {
        setMediaError(errorList.join(" | "));
      }

      if (newItems.length > 0) {
        setMediaList((prev) => [...prev, ...newItems]);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    if (mediaList[index]?.previewUrl) {
      URL.revokeObjectURL(mediaList[index].previewUrl);
    }
    setMediaList((prev) => prev.filter((_, i) => i !== index));
    if (mediaList.length <= 1) {
      setMediaError("");
    }
  };

  const handlePollOptionChange = (index: number, val: string) => {
    setPollOptions((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions((prev) => [...prev, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sport) return;
    if (!content.trim() && mediaList.length === 0 && !existingMediaPreview && !showPoll) return;
    if (showSchedule && (isPastTime || !scheduledTs)) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      const userId = user?.userId || (user as any)?.uid || (user as any)?.id || "anon";
      const userName = user?.name || (user as any)?.username || "SportsFan";
      const userEmail = user?.email || (user as any)?.emailAddress;

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

      formData.append("userId", userId);
      formData.append("author", userName);
      formData.append("userName", userName);
      formData.append("handle", `@${userName.replace(/\s+/g, "").toLowerCase()}`);
      formData.append("userHandle", `@${userName.replace(/\s+/g, "").toLowerCase()}`);
      formData.append("content", content.trim());
      formData.append("sport", sport);
      formData.append("type", "post");
      formData.append("source", "FlipLine");
      formData.append("likes", "0");
      formData.append("isKey", "false");

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

        formData.append("isScheduled", "true");
        formData.append("scheduledAt", String(scheduledTs));
        formData.append("scheduledTimeMs", String(scheduledTs));
        formData.append("day", schedDateStr);
        formData.append("time", schedTimeStr);
        formData.append("timeMs", String(scheduledTs));
        formData.append("createdAt", String(now));
      } else {
        formData.append("isScheduled", "false");
        formData.append("day", dateStr);
        formData.append("time", timeStr);
        formData.append("timeMs", String(now));
        formData.append("createdAt", String(now));
      }

      if (userEmail) {
        formData.append("email", userEmail);
        formData.append("userEmail", userEmail);
      }
      const adminPhoto = (user as any)?.addfliplineAdminPhoto || user?.avatar || (user as any)?.avatarUrl;
      if (adminPhoto) {
        formData.append("adminPhoto", adminPhoto);
        formData.append("authorPhoto", adminPhoto);
      }

      mediaList.forEach((item) => {
        formData.append("media", item.file);
      });

      if (existingMediaPreview && mediaList.length === 0) {
        if (existingMediaType === "video") {
          formData.append("existingVideo", existingMediaPreview);
        } else {
          formData.append("existingImage", existingMediaPreview);
        }
      }

      if (showPoll) {
        const validOptions = pollOptions.filter((opt) => opt.trim() !== "");
        if (validOptions.length >= 2) {
          const pollData = {
            options: validOptions.map((text, i) => ({
              id: `opt_${i + 1}`,
              text: text.trim(),
              votes: 0,
            })),
            totalVotes: 0,
            endsAt: Date.now() + 24 * 60 * 60 * 1000,
            createdAt: Date.now(),
          };
          formData.append("poll", JSON.stringify(pollData));
        }
      }

      // If we are updating an existing scheduled post
      if (editingPost && editingPost.sk) {
        formData.append("sk", editingPost.sk);
        await fliplineService.updateScheduledPost(editingPost.sk, formData);
        await fetchUserScheduledPosts();
        handleClose();
      } else {
        // Creating a new post
        await onSubmit(formData, userId, userName, userEmail);
        await fetchUserScheduledPosts();
        handleClose();
      }
    } catch (err: any) {
      console.error("Failed to create/update post:", err);
      const serverMsg = formatErrorMessage(err);
      setSubmitError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141417] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Navigation Tabs */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-[#16171b]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-[#C9115F] to-[#e85d04] text-white border-transparent shadow-md shadow-pink-500/20"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/5"
              }`}
            >
              <span>✍️</span>
              <span>{editingPost ? "Edit Post" : "Create Post"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("scheduled");
                fetchUserScheduledPosts();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                activeTab === "scheduled"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/10"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/5"
              }`}
            >
              <Clock size={13} className={scheduledPosts.length > 0 ? "text-amber-400 animate-pulse" : "text-gray-400"} />
              <span>Scheduled</span>
              {scheduledPosts.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-black">
                  {scheduledPosts.length}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: CREATE / EDIT POST FORM
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "create" && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-5 gap-4">
            {/* Editing Notification Banner */}
            {editingPost && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                <div className="flex items-center gap-2">
                  <Edit3 size={15} className="shrink-0 text-amber-400" />
                  <span>
                    Editing scheduled post ({editingPost.sport || "general"})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] cursor-pointer"
                >
                  Cancel Edit
                </button>
              </div>
            )}

            {/* Sport Selector Pills */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-gray-400">
                  Select Sport <span className="text-pink-500 font-bold">*</span>
                </span>
                {!sport && (
                  <span className="text-[10.5px] text-amber-400/90 font-medium">
                    Required to post
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: "general", label: "General", emoji: "📢" },
                  { id: "cricket", label: "Cricket", emoji: "🏏" },
                  { id: "football", label: "Football", emoji: "⚽" },
                  { id: "athletics", label: "Athletics", emoji: "🏃" },
                ].map((s) => {
                  const isSelected = sport === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSport(s.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                        isSelected
                          ? "bg-gradient-to-r from-[#C9115F] to-[#e85d04] text-white border-transparent shadow-md shadow-pink-500/20 ring-2 ring-pink-500/30 scale-[1.02]"
                          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/10"
                      }`}
                    >
                      <span className="text-xs">{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in the sports world?"
              rows={4}
              className="w-full bg-[#0c0c0e] border border-white/10 focus:border-pink-500 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-500 outline-none resize-none transition-colors min-h-[100px] shrink-0"
              autoFocus
            />

            {/* Validation & Error Alerts */}
            {mediaError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                <div className="flex-1 leading-relaxed">{mediaError}</div>
                <button
                  type="button"
                  onClick={() => setMediaError("")}
                  className="text-red-400 hover:text-white cursor-pointer ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {submitError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                <div className="flex-1 leading-relaxed">
                  {typeof submitError === "string" ? submitError : formatErrorMessage(submitError)}
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError("")}
                  className="text-red-400 hover:text-white cursor-pointer ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Existing Media Preview (when editing) */}
            {existingMediaPreview && mediaList.length === 0 && (
              <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/70 flex items-center justify-center max-h-[180px]">
                {existingMediaType === "video" ? (
                  <video src={existingMediaPreview} controls className="w-full h-full object-contain bg-black" />
                ) : (
                  <img src={existingMediaPreview} alt="Attached media" className="w-full h-full object-contain" />
                )}
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-semibold text-white/90 border border-white/10">
                  Current Media
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExistingMediaPreview("");
                    setExistingMediaType("");
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title="Remove current media"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Media Previews Grid */}
            {mediaList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {mediaList.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/70 flex items-center justify-center"
                  >
                    {item.isVideo ? (
                      <video
                        src={item.previewUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt="Media preview"
                        className="w-full h-full object-cover"
                      />
                    )}

                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-white/90 border border-white/10 flex items-center gap-1 pointer-events-none">
                      {item.isVideo ? (
                        <>
                          <VideoIcon size={11} className="text-amber-400" />
                          <span>Video · {item.sizeFormatted}</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={11} className="text-pink-400" />
                          <span>{item.sizeFormatted}</span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                      title="Remove media"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Poll Builder */}
            {showPoll && (
              <div className="flex flex-col gap-2.5 bg-[#0e0e11] border border-pink-500/20 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-pink-400 uppercase tracking-wider">
                  <span>Poll Options (24 Hours)</span>
                  <button
                    type="button"
                    onClick={() => setShowPoll(false)}
                    className="text-gray-400 hover:text-red-400 text-xs cursor-pointer"
                  >
                    Remove Poll
                  </button>
                </div>
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-[#18181b] border border-white/10 focus:border-pink-500 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600"
                      maxLength={50}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(idx)}
                        className="text-gray-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 font-bold py-1 mt-1 cursor-pointer w-fit"
                  >
                    <Plus size={14} />
                    <span>Add Option</span>
                  </button>
                )}
              </div>
            )}

            {/* Schedule Post Section */}
            {showSchedule && (
              <div className="flex flex-col gap-3 bg-[#0e0e11] border border-amber-500/30 rounded-xl p-3.5 shadow-lg shadow-amber-500/5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-400" />
                    <span>Schedule Post (Auto-publish)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSchedule(false)}
                    className="text-gray-400 hover:text-red-400 text-xs font-medium cursor-pointer"
                  >
                    Cancel Schedule
                  </button>
                </div>

                {/* Date & Time Input Row */}
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

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-gray-500 font-medium mr-0.5">Presets:</span>
                  {[
                    { label: "+15m", action: () => applySchedulePreset(15) },
                    { label: "+1h", action: () => applySchedulePreset(60) },
                    { label: "+3h", action: () => applySchedulePreset(180) },
                    { label: "Tomorrow 9 AM", action: () => applyTomorrowPreset(9, 0) },
                    { label: "Tomorrow 6 PM", action: () => applyTomorrowPreset(18, 0) },
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

                {/* Live Preview Info Banner */}
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
            )}

            {/* Action Bar */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-white/5 mt-auto">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10.5px] text-gray-400 font-medium">
                <Info size={12} className="text-pink-400 shrink-0" />
                <span>
                  Max video: <strong className="text-white">4.5 MB</strong> (~15s clip) • Max image: <strong className="text-white">4.5 MB</strong>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-all cursor-pointer hover:border-pink-500/40"
                    title="Upload images or videos"
                  >
                    <ImageIcon size={14} className="text-pink-400" />
                    <span>Media</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!showSchedule) {
                        if (!scheduledDate) setScheduledDate(getTodayDateString());
                        if (!scheduledTime) setScheduledTime(getDefaultTimeString(30));
                      }
                      setShowSchedule((prev) => !prev);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      showSchedule
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                        : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                    }`}
                  >
                    <Clock size={14} className="text-amber-400" />
                    <span>{showSchedule ? "Scheduled" : "Schedule"}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !sport ||
                    (!content.trim() && mediaList.length === 0 && !existingMediaPreview && !showPoll) ||
                    (showSchedule && (isPastTime || !scheduledTs))
                  }
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 cursor-pointer shrink-0 ${
                    showSchedule
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/20"
                      : "bg-gradient-to-r from-[#C9115F] to-[#e85d04] hover:from-[#db1b6e] hover:to-[#f06e18] shadow-pink-500/20"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{editingPost ? "Saving..." : showSchedule ? "Scheduling..." : "Posting..."}</span>
                    </>
                  ) : editingPost ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Update Scheduled Post</span>
                    </>
                  ) : showSchedule ? (
                    <>
                      <Clock size={13} />
                      <span>Schedule Post</span>
                    </>
                  ) : (
                    <span>Post</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: SCHEDULED POSTS QUEUE
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "scheduled" && (
          <div className="flex flex-col flex-1 overflow-y-auto p-5 gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Your Pending Scheduled Posts
                </span>
                <span className="text-[11px] text-gray-500">
                  ({scheduledPosts.length})
                </span>
              </div>
              <button
                type="button"
                onClick={fetchUserScheduledPosts}
                disabled={loadingScheduled}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="Refresh scheduled posts"
              >
                <RefreshCw size={12} className={loadingScheduled ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingScheduled ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                <Loader2 size={24} className="animate-spin text-amber-400" />
                <span className="text-xs font-medium">Loading scheduled queue...</span>
              </div>
            ) : scheduledPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                  <Clock size={22} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">No Scheduled Posts</h4>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  When you schedule posts for a future date & time, they will appear here. Once published, they automatically move to the live feed.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("create");
                    setShowSchedule(true);
                    if (!scheduledDate) setScheduledDate(getTodayDateString());
                    if (!scheduledTime) setScheduledTime(getDefaultTimeString(30));
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  + Schedule a Post Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledPosts.map((post) => {
                  const targetTs = Number(post.scheduledAt) || Number(post.scheduledTimeMs) || post.timeMs;
                  const countdown = formatCountdown(targetTs);
                  const isDeleting = deletingSk === post.sk;

                  return (
                    <div
                      key={post.sk || post.id}
                      className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[#0c0c0e] border border-white/10 hover:border-amber-500/40 transition-all shadow-md group"
                    >
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center gap-1">
                            <span>{post.sportEmoji || "🏆"}</span>
                            <span>{post.sport || post.channel || "General"}</span>
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

                      {/* Content Preview */}
                      {post.content && (
                        <p className="text-xs text-gray-200 line-clamp-3 leading-relaxed font-normal">
                          {post.content}
                        </p>
                      )}

                      {/* Media Thumbnail */}
                      {(post.image || post.videoUrl) && (
                        <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/60">
                          {post.videoUrl ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/80 text-amber-400 text-xs">
                              <VideoIcon size={16} />
                            </div>
                          ) : (
                            <img src={post.image} alt="Media preview" className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => handleEditScheduledPost(post)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => post.sk && handleDeleteScheduledPost(post.sk)}
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
      </div>
    </div>,
    document.body
  );
}