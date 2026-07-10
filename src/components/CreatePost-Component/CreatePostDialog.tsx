"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Image, BarChart2, Plus, Trash2 } from "lucide-react";
import type { CreatePostPayload, MediaItem } from "@/types/PostPolls";
import { useAuth } from "@/context/AuthContext";

// ─── helpers 
const FALLBACK_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=AthleteFan";

function getVoterId(): string {
  if (typeof window === "undefined") return "guest";
  let id = sessionStorage.getItem("voterId");
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("voterId", id);
  }
  return id;
}

function formatTimeLeft(endsAt: number): string {
  const diff = endsAt - Date.now();
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

// ─── types 
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: FormData,  
    userId: string,
    userName: string,
    userEmail?: string
  ) => Promise<void>;
}

// ─── component 
export default function CreatePostDialog({ isOpen, onClose, onSubmit }: Props) {
  const { user, getUserDisplayName, getUserName } = useAuth();
  const [voterId] = useState<string>(getVoterId);

  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"none" | "media" | "poll">("none");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollEndsAt = Date.now() + 24 * 60 * 60 * 1000;

  // Derived author info from auth context
  const displayName = user ? getUserDisplayName() : "Fan";
  const handle = user ? `@${getUserName()}` : "@fan";
  const avatar = user
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`
    : FALLBACK_AVATAR;

  // auto-grow textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // reset on close
  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setMedia([]);
      setShowPoll(false);
      setPollOptions(["", ""]);
      setActiveTab("none");
    }
  }, [isOpen]);

  // lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── media ──────────────────────────────────────────────────────────────────
  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setMedia((prev) => [
          ...prev,
          { url, type: file.type.startsWith("video") ? "video" : "image", name: file.name },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const removeMedia = (idx: number) => setMedia((prev) => prev.filter((_, i) => i !== idx));

  // ── poll ───────────────────────────────────────────────────────────────────
  const togglePoll = () => {
    if (activeTab === "poll") { setShowPoll(false); setActiveTab("none"); }
    else { setShowPoll(true); setActiveTab("poll"); setMedia([]); }
  };

  const toggleMedia = () => {
    if (activeTab === "media") { setActiveTab("none"); }
    else { setActiveTab("media"); setShowPoll(false); fileInputRef.current?.click(); }
  };

  const updateOption = (idx: number, val: string) =>
    setPollOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));

  const addOption = () => { if (pollOptions.length < 4) setPollOptions((p) => [...p, ""]); };

  const removeOption = (idx: number) => {
    if (pollOptions.length <= 2) return;
    setPollOptions((p) => p.filter((_, i) => i !== idx));
  };

  // ── submit 
  const handleSubmit = async () => {
    if (!content.trim() && !media.length && !showPoll) return;
    setSubmitting(true);
    try {
      const userId = user?.userId || user?.email || voterId || "guest";
      const userName = displayName;
      const userEmail = user?.email;
      const formData = new FormData();
      formData.append("userName", displayName);
      formData.append("userHandle", handle);
      formData.append("userAvatar", avatar);
      formData.append("content", content.trim());
      formData.append("userId", userId);
      if (userEmail) formData.append("userEmail", userEmail);
    
    // Add poll if exists
    if (showPoll && pollOptions.filter(o => o.trim()).length >= 2) {
      formData.append("poll", JSON.stringify({ 
        options: pollOptions.filter(o => o.trim()) 
      }));
    }
    
    // Convert base64 media to File objects and append to FormData
    for (let i = 0; i < media.length; i++) {
      const mediaItem = media[i];
      // Convert base64 URL to Blob/File
      const response = await fetch(mediaItem.url);
      const blob = await response.blob();
      const file = new File([blob], mediaItem.name || `media-${i}.${blob.type.split('/')[1] || 'jpg'}`, { 
        type: blob.type 
      });
      formData.append("media", file);
    }

    // Call onSubmit with FormData instead of payload
    await onSubmit(formData, userId, userName, userEmail);
    onClose();
  } catch (error) {
    console.error("Submit error:", error);
  } finally {
    setSubmitting(false);
  }
};

  const canPost =
    (content.trim().length > 0 ||
      media.length > 0 ||
      (showPoll && pollOptions.filter((o) => o.trim()).length >= 2)) &&
    !submitting;

  if (!isOpen) return null;

  // ── shared inner content 
  const innerContent = (
    <>
      {/* drag handle (mobile only) */}
      <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>
        <h2 className="text-white font-bold text-base tracking-wide">Create Post</h2>
        <button
          onClick={handleSubmit}
          disabled={!canPost}
          className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
            canPost
              ? "bg-gradient-to-r from-[#C9115F] to-[#e8185a] text-white hover:opacity-90 active:scale-95"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          {submitting ? "Posting…" : "Post"}
        </button>
      </div>

      {/* scrollable body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* author row */}
        <div className="flex items-start gap-3 px-4 pt-4">
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#C9115F]/40 bg-zinc-800"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f0f]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{displayName}</p>
            <p className="text-white/40 text-xs">{user ? "FAN ACCOUNT" : "GUEST"}</p>
          </div>
        </div>

        {/* textarea */}
        <div className="px-4 pt-3">
          <textarea
            ref={textareaRef}
            value={content}
            maxLength={300}
            onChange={handleContentChange}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-transparent text-white text-base placeholder-white/25 resize-none outline-none leading-relaxed min-h-[80px]"
            style={{ caretColor: "#C9115F" }}
          />
        </div>

       {/* media preview */}
{media.length > 0 && (
  <div className="px-4 pb-3 flex flex-wrap gap-2">
    {media.map((item, idx) => (
      <div
        key={idx}
        className="relative rounded-xl overflow-hidden bg-zinc-800 group shrink-0"
        style={{ width: "200px", height: "200px" }}
      >
        {item.type === "image" ? (
          <img
            src={item.url}
            alt={item.name || `media-${idx}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <video 
            src={item.url} 
            className="w-full h-full object-cover" 
            controls={false} 
          />
        )}
        <button
          onClick={() => removeMedia(idx)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    ))}
    {media.length < 4 && (
      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-[#C9115F]/60 transition-colors shrink-0"
        style={{ width: "200px", height: "200px" }}
      >
        <Plus className="w-6 h-6 text-white/40" />
        <span className="text-white/30 text-xs">Add more</span>
      </button>
    )}
  </div>
)}

        {/* drop zone */}
        {activeTab === "media" && media.length === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mx-4 mb-3 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center py-10 cursor-pointer ${
              dragOver
                ? "border-[#C9115F] bg-[#C9115F]/10"
                : "border-white/15 hover:border-white/30"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
              <Image className="w-6 h-6 text-white/40" />
            </div>
            <p className="text-white/50 text-sm font-medium">Drop photos or videos here</p>
            <p className="text-white/25 text-xs mt-1">or tap to browse</p>
          </div>
        )}

        {/* poll builder */}
        {showPoll && (
          <div className="mx-4 mb-3 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold text-sm">Create Poll</p>
                <p className="text-white/40 text-xs mt-0.5">
                  Ends in {formatTimeLeft(pollEndsAt)}
                </p>
              </div>
              <button
                onClick={togglePoll}
                className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-3 h-3 text-white/60" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <div className="flex-1 relative">
                    <input
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      maxLength={80}
                      className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#C9115F]/60 focus:bg-white/10 transition-all"
                    />
                  </div>
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => removeOption(idx)}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {pollOptions.length < 4 && (
              <button
                onClick={addOption}
                className="mt-3 w-full py-2 rounded-xl border border-dashed border-white/15 text-white/40 text-sm hover:border-[#C9115F]/40 hover:text-[#C9115F] transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add option
              </button>
            )}

            <p className="text-white/25 text-xs mt-3 text-center">
              Poll automatically closes after 24 hours
            </p>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* action bar */}
      <div className="border-t border-white/10 px-4 py-3 flex items-center gap-2 shrink-0 bg-[#0f0f0f]">
        <button
          onClick={toggleMedia}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            activeTab === "media"
              ? "bg-[#C9115F]/20 text-[#C9115F]"
              : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white"
          }`}
          title="Add photo or video"
        >
          <Image className="w-5 h-5" />
        </button>

        <button
          onClick={togglePoll}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            activeTab === "poll"
              ? "bg-[#C9115F]/20 text-[#C9115F]"
              : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white"
          }`}
          title="Create poll"
        >
          <BarChart2 className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        {content.length > 0 && (
          <span
            className={`text-xs font-mono tabular-nums ${
              content.length > 270
                ? "text-red-400"
                : content.length > 220
                ? "text-yellow-400"
                : "text-white/30"
            }`}
          >
            {280 - content.length}
          </span>
        )}
      </div>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* ── Mobile: bottom sheet ── */}
      <div
        className={`
          md:hidden
          fixed bottom-0 left-0 right-0 z-50
          bg-[#0f0f0f] rounded-t-3xl shadow-2xl
          transition-transform duration-500 ease-out
          max-h-[100vh] pb-16 flex flex-col
          ${isOpen ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ boxShadow: "0 -4px 60px rgba(201,17,95,0.15)" }}
      >
        {innerContent}
      </div>

      {/* ── Desktop: centered modal ── */}
      <div
        className={`
          hidden md:flex
          fixed inset-0 z-50
          items-center justify-center
          p-4
        `}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className={`
            w-full max-w-lg
            bg-[#0f0f0f] rounded-2xl shadow-2xl
            flex flex-col max-h-[85vh]
            transition-all duration-300
            ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          `}
          style={{ boxShadow: "0 0 60px rgba(201,17,95,0.2)" }}
        >
          {innerContent}
        </div>
      </div>
    </>
  );
}