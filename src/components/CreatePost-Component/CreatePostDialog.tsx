"use client";

import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

export default function CreatePostDialog({
  isOpen,
  onClose,
  onSubmit,
}: CreatePostDialogProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [sport, setSport] = useState<string>("");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
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

  const resetForm = () => {
    setContent("");
    setSport("");
    mediaList.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setMediaList([]);
    setMediaError("");
    setSubmitError("");
    setShowPoll(false);
    setPollOptions(["", ""]);
    setShowSchedule(false);
    setScheduledDate("");
    setScheduledTime("");
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
    if (!content.trim() && mediaList.length === 0 && !showPoll) return;
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

      await onSubmit(formData, userId, userName, userEmail);
      handleClose();
    } catch (err: any) {
      console.error("Failed to create post:", err);
      const serverMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create post. Please check media sizes and try again.";
      setSubmitError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141417] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04] flex items-center justify-center text-white text-xs font-bold">
              ✍️
            </span>
            <h3 className="text-base font-black text-white tracking-wide">
              Create Flipline Post
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-5 gap-4">
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
                { id: "cricket", label: "Cricket", emoji: "🏏" },
                { id: "football", label: "Football", emoji: "⚽" },
                { id: "athletics", label: "Athletics", emoji: "🏃" },
                // { id: "general", label: "General", emoji: "⚡" },
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
              <div className="flex-1 leading-relaxed">{submitError}</div>
              <button
                type="button"
                onClick={() => setSubmitError("")}
                className="text-red-400 hover:text-white cursor-pointer ml-1"
              >
                <X size={14} />
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

                  {/* Media Type & Size Badge */}
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
                  className="text-gray-400 hover:text-red-400 text-xs"
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
                      className="text-gray-500 hover:text-red-400 p-1"
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
            <div className="flex flex-col gap-3 bg-[#0e0e11] border border-amber-500/30 rounded-xl p-3.5 shadow-lg shadow-amber-500/5">
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
            {/* Upload limits notice displayed directly to user */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10.5px] text-gray-400 font-medium">
              <Info size={12} className="text-pink-400 shrink-0" />
              <span>
                Max video: <strong className="text-white">4.5 MB</strong> (~15s compressed clip) • Max image: <strong className="text-white">4.5 MB</strong>
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
                  title="Upload images (max 10MB) or videos (max 100MB)"
                >
                  <ImageIcon size={14} className="text-pink-400" />
                  <span>Media</span>
                </button>

                {/* <button
                  type="button"
                  onClick={() => setShowPoll((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    showPoll
                      ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                      : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                  }`}
                >
                  <BarChart2 size={14} className="text-blue-400" />
                  <span>Poll</span>
                </button> */}

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
                  (!content.trim() && mediaList.length === 0 && !showPoll) ||
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
                    <span>{showSchedule ? "Scheduling..." : "Posting..."}</span>
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
      </div>
    </div>,
    document.body
  );
}