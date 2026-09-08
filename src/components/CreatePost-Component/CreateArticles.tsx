//src\components\CreatePost-Component\CreateArticles.tsx

"use client";

import axios from "axios";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Eye,
  ArrowLeft,
  Send,
  Sparkles,
  Image as ImageIcon,
  Clock,
  User,
  Tag,
  AlertCircle,
  Loader2,
  Calendar,
  Info,
  Edit3,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

type FormState = {
  badge: BadgeType;
  title: string;
  author: string;
  description: string;
  readTime: string;
  views: string;
  tags: string[];
};

const EMPTY_FORM: FormState = {
  badge: "NEWS",
  title: "",
  author: "",
  description: "",
  readTime: "5 min read",
  views: "0 views",
  tags: [],
};

const BADGE_COLORS: Record<BadgeType, { bg: string; text: string; border: string }> = {
  FEATURE: {
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    border: "border-pink-500/30",
  },
  ANALYSIS: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  OPINION: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  NEWS: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
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

export default function CreateArticleDialog({ isOpen, onClose, onCreated }: Props) {
  const { user, getUserDisplayName } = useAuth();
  const currentUserName = getUserDisplayName?.() || user?.name || (user as any)?.username || "SportsFan";
  const userAvatar =
    (typeof window !== "undefined" ? localStorage.getItem("roar_avatar_url") : "") ||
    user?.avatar ||
    (user as any)?.avatarUrl ||
    (user as any)?.addfliplineAdminPhoto ||
    "";

  const [activeTab, setActiveTab] = useState<"create" | "scheduled">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const isSubmittingRef = useRef(false);

  // Scheduled articles queue state
  const [scheduledArticles, setScheduledArticles] = useState<any[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (currentUserName) {
      setForm((prev) => ({ ...prev, author: prev.author || currentUserName }));
    }
  }, [currentUserName]);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (existingMediaUrl) {
      setPreviewUrl(existingMediaUrl);
    } else {
      setPreviewUrl("");
    }
  }, [image, existingMediaUrl]);

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

function formatArticleErrorMessage(err: any): string {
  if (!err) return "Failed to save article. Please check inputs and try again.";
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

  return "Error saving article. Please check inputs and try again.";
}

  const scheduledTs = showSchedule ? getScheduledTs() : null;
  const isPastTime = scheduledTs !== null && scheduledTs <= Date.now();

  // Load scheduled articles for current user
  const fetchUserScheduledArticles = useCallback(async () => {
    const userId = user?.userId || (user as any)?.uid || (user as any)?.id || "";
    const userEmail = user?.email || (user as any)?.emailAddress || "";
    const author = user?.name || (user as any)?.username || "";

    try {
      setLoadingScheduled(true);
      const params = new URLSearchParams({ scheduledOnly: "true" });
      if (userId) params.append("userId", userId);
      if (userEmail) params.append("email", userEmail);
      if (author) params.append("author", author);

      const res = await axios.get<{ success: boolean; articles: any[] }>(
        `/api/cricket-articles?${params.toString()}`
      );
      const articles = Array.isArray(res.data?.articles) ? res.data.articles : [];
      const now = Date.now();
      // Strictly enforce future scheduled rule: past items are live and excluded
      const futureArticles = articles.filter((a) => {
        const schedTime = Number(a.scheduledAt) || Number(a.scheduledTimeMs);
        return (a.isScheduled === true || a.isScheduled === "true" || (schedTime && schedTime > 0)) && schedTime > now;
      });
      setScheduledArticles(futureArticles);
    } catch (err) {
      console.error("Failed to load scheduled articles", err);
    } finally {
      setLoadingScheduled(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchUserScheduledArticles();
    }
  }, [isOpen, fetchUserScheduledArticles]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !form.tags.includes(newTag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
        setTagInput("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetAndClose = () => {
    setForm({ ...EMPTY_FORM, author: currentUserName });
    setImage(null);
    setExistingMediaUrl("");
    setPreviewUrl("");
    setTagInput("");
    setShowPreview(false);
    setShowSchedule(false);
    setScheduledDate("");
    setScheduledTime("");
    setSubmitError("");
    setLoading(false);
    setEditingArticleId(null);
    setActiveTab("create");
    isSubmittingRef.current = false;
    onClose();
  };

  const handleEditScheduledArticle = (art: any) => {
    const artId = art.id || art.articleId;
    setEditingArticleId(artId);

    const desc = Array.isArray(art.description)
      ? art.description.join("\n\n")
      : typeof art.description === "string"
      ? art.description
      : "";

    setForm({
      badge: (art.badge as BadgeType) || "NEWS",
      title: art.title || "",
      author: art.author || currentUserName,
      description: desc,
      readTime: art.readTime || "5 min read",
      views: art.views || "0 views",
      tags: Array.isArray(art.tags) ? art.tags : [],
    });

    if (art.image) {
      setExistingMediaUrl(art.image);
    } else {
      setExistingMediaUrl("");
    }
    setImage(null);

    setShowSchedule(true);
    const schedTs = Number(art.scheduledAt) || Number(art.scheduledTimeMs) || art.timeMs;
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

    setActiveTab("create");
    setShowPreview(false);
  };

  const handleCancelEdit = () => {
    setForm({ ...EMPTY_FORM, author: currentUserName });
    setImage(null);
    setExistingMediaUrl("");
    setPreviewUrl("");
    setEditingArticleId(null);
    setShowSchedule(false);
    setScheduledDate("");
    setScheduledTime("");
  };

  const handleDeleteScheduledArticle = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled article?")) return;
    try {
      setDeletingArticleId(articleId);
      const res = await axios.delete(`/api/cricket-articles/${articleId}`);
      if (res.data?.success || res.status === 200) {
        setScheduledArticles((prev) => prev.filter((a) => (a.id || a.articleId) !== articleId));
        if (editingArticleId === articleId) {
          handleCancelEdit();
        }
      }
    } catch (err) {
      console.error("Failed to delete article:", err);
      alert("Failed to delete scheduled article. Please try again.");
    } finally {
      setDeletingArticleId(null);
    }
  };

  const getParagraphs = () => {
    return form.description
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  };

  const displayAuthor = form.author.trim() || currentUserName;

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;

    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    const paragraphs = getParagraphs();
    if (paragraphs.length === 0) {
      alert("Article description/content is required");
      return;
    }

    if (showSchedule && (isPastTime || !scheduledTs)) {
      setSubmitError("Please select a valid future date and time for scheduling.");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
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

      const formData = new FormData();
      formData.append("badge", form.badge);
      formData.append("title", form.title.trim());
      formData.append("author", displayAuthor);
      formData.append("readTime", form.readTime.trim() || "5 min read");
      formData.append("views", form.views.trim() || "0 views");
      formData.append("description", JSON.stringify(paragraphs));
      formData.append("tags", JSON.stringify(form.tags));

      if (image) {
        formData.append("file", image);
      } else if (existingMediaUrl) {
        formData.append("existingImage", existingMediaUrl);
      }

      if (user?.userId) formData.append("userId", user.userId);
      if (user?.email) formData.append("email", user.email);
      if (userAvatar) formData.append("authorPhoto", userAvatar);

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

      let res;
      if (editingArticleId) {
        // Update existing scheduled article
        res = await axios.put(`/api/cricket-articles/${editingArticleId}`, formData);
      } else {
        // Create new article
        res = await axios.post("/api/cricket-articles", formData);
      }

      if (res.data?.success || res.status === 201 || res.status === 200) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cricket-article-created"));
        }
        onCreated?.();
        await fetchUserScheduledArticles();
        resetAndClose();
      } else {
        setSubmitError(formatArticleErrorMessage(res.data?.error || res.data || "Error saving article"));
      }
    } catch (error: any) {
      console.error("Save failed", error);
      const serverMsg = formatArticleErrorMessage(error);
      setSubmitError(serverMsg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  if (!isOpen || !mounted) return null;

  const paragraphs = getParagraphs();
  const portalTarget = document.getElementById("sf360-app-root") ?? document.body;
  const isVideo = image?.type?.startsWith("video/") || /\.(mp4|mov|webm|m4v|mkv|avi)$/i.test(existingMediaUrl);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={resetAndClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Main Bottom Sheet Container */}
      <div className="relative z-10 rounded-t-3xl bg-[#0c0e18] border border-white/10 border-b-0 max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header with Navigation Tabs */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#101221] shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("create");
                setShowPreview(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-[#C9115F] to-[#e85d04] text-white border-transparent shadow-md shadow-pink-500/20"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/5"
              }`}
            >
              <span>📰</span>
              <span>{editingArticleId ? "Edit Article" : "Create Article"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("scheduled");
                setShowPreview(false);
                fetchUserScheduledArticles();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                activeTab === "scheduled"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/10"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/5"
              }`}
            >
              <Clock size={13} className={scheduledArticles.length > 0 ? "text-amber-400 animate-pulse" : "text-gray-400"} />
              <span>Scheduled</span>
              {scheduledArticles.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-black">
                  {scheduledArticles.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
          >
            <X size={15} />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: CREATE / EDIT ARTICLE FORM (OR PREVIEW)
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "create" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
              {/* Editing Banner */}
              {editingArticleId && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs mb-4 max-w-2xl mx-auto">
                  <div className="flex items-center gap-2">
                    <Edit3 size={15} className="shrink-0 text-amber-400" />
                    <span>Editing scheduled article</span>
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

              {showPreview ? (
                /* ─────────────────────────────────────────────────────────────
                   ARTICLE LIVE PREVIEW
                   ───────────────────────────────────────────────────────────── */
                <div className="space-y-4 max-w-2xl mx-auto pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        BADGE_COLORS[form.badge].bg
                      } ${BADGE_COLORS[form.badge].text} ${BADGE_COLORS[form.badge].border}`}
                    >
                      {form.badge}
                    </span>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-500" />
                        {form.readTime || "5 min read"}
                      </span>
                      <span>•</span>
                      <span>{form.views || "0 views"}</span>
                    </div>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {form.title.trim() || <span className="text-gray-600 italic">Untitled Article</span>}
                  </h1>

                  <div className="flex items-center gap-2.5 pb-2 border-b border-white/5 text-xs text-gray-400">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={displayAuthor}
                        className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                        {(displayAuthor || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="font-bold text-white text-xs truncate">
                        {displayAuthor}
                      </span>
                      <span className="text-gray-500">•</span>
                      {showSchedule && scheduledTs ? (
                        <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                          <Clock size={11} />
                          Scheduled for{" "}
                          {new Date(scheduledTs).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">Just now</span>
                      )}
                    </div>
                  </div>

                  {previewUrl ? (
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 w-full flex items-center justify-center shadow-lg max-h-[380px]">
                      {isVideo ? (
                        <video src={previewUrl} controls className="w-full max-h-[380px] object-contain rounded-2xl" />
                      ) : (
                        <img
                          src={previewUrl}
                          alt="Article cover"
                          className="w-full h-auto max-h-[380px] object-contain rounded-2xl"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 flex flex-col items-center justify-center text-gray-500 gap-2">
                      <ImageIcon size={28} className="opacity-40" />
                      <span className="text-xs">No cover image/video selected yet</span>
                    </div>
                  )}

                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {form.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 bg-white/5 border border-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          <Tag size={10} className="text-pink-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3.5 pt-2 text-sm text-gray-300 leading-relaxed font-normal">
                    {paragraphs.length > 0 ? (
                      paragraphs.map((p, idx) => (
                        <p key={idx} className="whitespace-pre-wrap">
                          {p}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-600 italic">No description or paragraphs written yet.</p>
                    )}
                  </div>
                </div>
              ) : (
                /* ─────────────────────────────────────────────────────────────
                   ARTICLE EDIT FORM
                   ───────────────────────────────────────────────────────────── */
                <div className="space-y-4 max-w-2xl mx-auto">
                  {submitError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs animate-in fade-in">
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                      <div className="flex-1 leading-relaxed">
                        {typeof submitError === "string" ? submitError : formatArticleErrorMessage(submitError)}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1 font-semibold">Category</label>
                      <select
                        name="badge"
                        value={form.badge}
                        onChange={handleChange}
                        className="w-full bg-[#11131f] border border-white/10 focus:border-pink-500 rounded-xl px-3 py-2 text-white text-sm outline-none transition-all cursor-pointer"
                      >
                        <option value="NEWS">NEWS</option>
                        <option value="FEATURE">FEATURE</option>
                        <option value="ANALYSIS">ANALYSIS</option>
                        <option value="OPINION">OPINION</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <FormInput
                        label="Article Title *"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Enter article title..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <FormInput
                        label="Author"
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                        placeholder={currentUserName || "Your Name"}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-gray-400 font-semibold">
                        Article Description / Paragraphs *
                      </label>
                      <span className="text-[11px] text-gray-500">
                        {paragraphs.length} paragraph{paragraphs.length === 1 ? "" : "s"} detected
                      </span>
                    </div>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Write your article content here. Separate paragraphs by pressing Enter..."
                      rows={8}
                      className="w-full bg-[#11131f] border border-white/10 focus:border-pink-500 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-500 outline-none resize-y transition-all leading-relaxed"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      💡 Tip: Press Enter twice to create new paragraphs.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1 font-semibold">Article Tags</label>
                    <div className="w-full bg-[#11131f] border border-white/10 focus-within:border-pink-500 rounded-xl px-3 py-2.5">
                      {form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {form.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="flex items-center gap-1.5 bg-pink-500/15 border border-pink-500/30 text-pink-300 px-2.5 py-1 rounded-full text-xs font-semibold"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="hover:text-white transition-colors text-xs ml-0.5 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type tag and press Enter..."
                        className="w-full bg-transparent border-none text-white text-xs outline-none placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block font-semibold">
                      Article Cover Media (Image / Video) <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        setImage(e.target.files?.[0] ?? null);
                        setExistingMediaUrl("");
                      }}
                      className="w-full bg-[#11131f] border border-white/10 rounded-xl px-3 py-2 text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-[#C9115F] file:to-[#e85d04] file:text-white hover:file:opacity-90 text-xs cursor-pointer"
                    />
                    {previewUrl && (
                      <div className="mt-3 relative w-36 h-24 rounded-xl overflow-hidden border border-white/10 bg-black/40 group">
                        {isVideo ? (
                          <video src={previewUrl} className="w-full h-full object-cover" />
                        ) : (
                          <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setExistingMediaUrl("");
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center text-xs transition cursor-pointer"
                          title="Remove media"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Schedule Article Section */}
                  {showSchedule && (
                    <div className="flex flex-col gap-3 bg-[#11131f] border border-amber-500/30 rounded-xl p-3.5 shadow-lg shadow-amber-500/5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-amber-400" />
                          <span>Schedule Article (Auto-publish)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSchedule(false)}
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
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="shrink-0 px-5 py-3.5 border-t border-white/5 bg-[#0c0e18] flex items-center gap-3">
              {showPreview ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-xs bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || (showSchedule && (isPastTime || !scheduledTs))}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-lg active:scale-95 ${
                      showSchedule
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/20"
                        : "bg-gradient-to-r from-[#C9115F] to-[#e85d04] hover:from-[#db1b6e] hover:to-[#f06e18] shadow-pink-500/20"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{editingArticleId ? "Updating..." : showSchedule ? "Scheduling..." : "Publishing..."}</span>
                      </>
                    ) : editingArticleId ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Update Scheduled Article</span>
                      </>
                    ) : showSchedule ? (
                      <>
                        <Clock size={14} />
                        <span>Schedule Article</span>
                      </>
                    ) : (
                      <span>Publish Article ↗</span>
                    )}
                  </button>
                </>
              ) : (
                <>
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
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                        : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                    }`}
                  >
                    <Clock size={14} className="text-amber-400" />
                    <span>{showSchedule ? "Scheduled" : "Schedule"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="flex-1 py-3 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Eye size={14} className="text-pink-400" />
                    <span>Preview Article</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      loading ||
                      !form.title.trim() ||
                      paragraphs.length === 0 ||
                      (showSchedule && (isPastTime || !scheduledTs))
                    }
                    className={`flex-1 py-3 rounded-xl font-bold text-xs text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-lg active:scale-95 ${
                      showSchedule
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/20"
                        : "bg-gradient-to-r from-[#C9115F] to-[#e85d04] hover:from-[#db1b6e] hover:to-[#f06e18] shadow-pink-500/20"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{editingArticleId ? "Updating..." : showSchedule ? "Scheduling..." : "Publishing..."}</span>
                      </>
                    ) : editingArticleId ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Update Article</span>
                      </>
                    ) : showSchedule ? (
                      <>
                        <Clock size={14} />
                        <span>Schedule Article</span>
                      </>
                    ) : (
                      <span>Create Article ↗</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: SCHEDULED ARTICLES QUEUE
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "scheduled" && (
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Your Pending Scheduled Articles
                </span>
                <span className="text-[11px] text-gray-500">
                  ({scheduledArticles.length})
                </span>
              </div>
              <button
                type="button"
                onClick={fetchUserScheduledArticles}
                disabled={loadingScheduled}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="Refresh scheduled articles"
              >
                <RefreshCw size={12} className={loadingScheduled ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingScheduled ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                <Loader2 size={24} className="animate-spin text-amber-400" />
                <span className="text-xs font-medium">Loading scheduled articles...</span>
              </div>
            ) : scheduledArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                  <Clock size={22} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">No Scheduled Articles</h4>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  When you schedule articles for a future date & time, they will appear here. Once published, they automatically move to the live Articles Hub.
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
                  + Schedule an Article Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledArticles.map((art) => {
                  const targetTs = Number(art.scheduledAt) || Number(art.scheduledTimeMs) || art.timeMs;
                  const countdown = formatCountdown(targetTs);
                  const artId = art.id || art.articleId;
                  const isDeleting = deletingArticleId === artId;
                  const badgeKey = (art.badge as BadgeType) || "NEWS";
                  const badgeStyle = BADGE_COLORS[badgeKey] || BADGE_COLORS.NEWS;

                  const descriptionText = Array.isArray(art.description)
                    ? art.description.join(" ")
                    : typeof art.description === "string"
                    ? art.description
                    : "";

                  return (
                    <div
                      key={artId}
                      className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[#0e101d] border border-white/10 hover:border-amber-500/40 transition-all shadow-md group"
                    >
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                          >
                            {badgeKey}
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

                      {/* Title & Excerpt */}
                      <div className="flex gap-3">
                        {art.image && (
                          <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/60 shrink-0">
                            <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                            {art.title}
                          </h4>
                          {descriptionText && (
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                              {descriptionText}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => handleEditScheduledArticle(art)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteScheduledArticle(artId)}
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
        className="w-full bg-[#11131f] border border-white/10 focus:border-pink-500 rounded-xl px-3 py-2 text-white placeholder:text-gray-500 text-sm outline-none transition-all"
      />
    </div>
  );
}