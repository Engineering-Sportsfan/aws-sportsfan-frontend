//src\components\CreatePost-Component\CreateArticles.tsx

"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Eye, ArrowLeft, Send, Sparkles, Image as ImageIcon, Clock, User, Tag } from "lucide-react";
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

export default function CreateArticleDialog({ isOpen, onClose, onCreated }: Props) {
  const { user, getUserDisplayName } = useAuth();
  const currentUserName = getUserDisplayName?.() || user?.name || (user as any)?.username || "SportsFan";
  const userAvatar =
    (typeof window !== "undefined" ? localStorage.getItem("roar_avatar_url") : "") ||
    user?.avatar ||
    (user as any)?.avatarUrl ||
    (user as any)?.addfliplineAdminPhoto ||
    "";

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    } else {
      setPreviewUrl("");
    }
  }, [image]);

  if (!isOpen || !mounted) return null;

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
    setPreviewUrl("");
    setTagInput("");
    setShowPreview(false);
    onClose();
  };

  const getParagraphs = () => {
    return form.description
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  };

  const displayAuthor = form.author.trim() || currentUserName;

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    const paragraphs = getParagraphs();
    if (paragraphs.length === 0) {
      alert("Article description/content is required");
      return;
    }
    setLoading(true);
    try {
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
      }

      if (user?.userId) formData.append("userId", user.userId);
      if (user?.email) formData.append("email", user.email);
      if (userAvatar) formData.append("authorPhoto", userAvatar);

      const res = await axios.post("/api/cricket-articles", formData);

      if (res.data?.success || res.status === 201 || res.status === 200) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cricket-article-created"));
        }
        onCreated?.();
        resetAndClose();
      } else {
        alert(res.data?.error || "Error saving article");
      }
    } catch (error: any) {
      console.error("Save failed", error);
      alert(error?.response?.data?.error || "Error saving article");
    } finally {
      setLoading(false);
    }
  };

  const paragraphs = getParagraphs();
  const portalTarget = document.getElementById("sf360-app-root") ?? document.body;
  const isVideo = image?.type?.startsWith("video/");

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

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04] flex items-center justify-center text-white text-xs font-bold shadow-md">
              📰
            </span>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                {showPreview ? "Article Preview" : "Create New Article"}
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">
                {showPreview ? "Review your article before publishing" : "Draft and publish to Articles Hub"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showPreview
                  ? "bg-gradient-to-r from-[#C9115F] to-[#e85d04] text-white border-transparent shadow-md shadow-pink-500/20"
                  : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border-white/10"
              }`}
            >
              {showPreview ? (
                <>
                  <ArrowLeft size={13} />
                  <span className="flex whitespace-nowrap">Edit Form</span>
                </>
              ) : (
                <>
                  <Eye size={13} />
                  <span>Preview</span>
                </>
              )}
            </button>

            <button
              onClick={resetAndClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Body (Form OR Live Preview) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          {showPreview ? (
            /* ─────────────────────────────────────────────────────────────
               ARTICLE LIVE PREVIEW
               ───────────────────────────────────────────────────────────── */
            <div className="space-y-4 max-w-2xl mx-auto pb-4">
              {/* Badge + Meta */}
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

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {form.title.trim() || <span className="text-gray-600 italic">Untitled Article</span>}
              </h1>

              {/* Author & Timestamp bar */}
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
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-white text-xs truncate">
                    {displayAuthor}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500 text-[11px]">Just now</span>
                </div>
              </div>

              {/* Media Preview (Cover) */}
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

              {/* Tags */}
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

              {/* Article Content / Paragraphs */}
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
              {/* Badge + Title + Author + Read time */}
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

                <FormInput
                  label="Read Time"
                  name="readTime"
                  value={form.readTime}
                  onChange={handleChange}
                  placeholder="e.g., 5 min read"
                />

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

              {/* Article Content / Description Textarea (Single Spacious Box) */}
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

              {/* Tags */}
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

              {/* Image / Video Upload */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block font-semibold">
                  Article Cover Media (Image / Video) <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
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
                      onClick={() => setImage(null)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center text-xs transition cursor-pointer"
                      title="Remove media"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
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
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#C9115F] to-[#e85d04] hover:from-[#db1b6e] hover:to-[#f06e18] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20 active:scale-95"
              >
                {loading ? "Publishing..." : "Publish Article ↗"}
              </button>
            </>
          ) : (
            <>
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
                disabled={loading || !form.title.trim() || paragraphs.length === 0 || !image}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#C9115F] to-[#e85d04] hover:from-[#db1b6e] hover:to-[#f06e18] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20 active:scale-95"
              >
                {loading ? "Publishing..." : "Create Article ↗"}
              </button>

              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-3 rounded-xl font-bold text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </>
          )}
        </div>
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