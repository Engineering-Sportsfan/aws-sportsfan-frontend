"use client";

import { useState } from "react";
import { X, Repeat2, Quote, User, Loader2 } from "lucide-react";
import type { Post } from "@/types/PostPolls";

interface Props {
  open: boolean;
  onClose: () => void;
  post: Post;
  currentUserId: string;
  currentUserName: string;
  /** Called for a plain repost (no quote text) */
  onRepost: (postId: string) => Promise<void>;
  /** Called for a quote-repost with added text */
  onQuoteRepost: (postId: string, quoteText: string) => Promise<void>;
  /** Whether the current user has already reposted */
  hasReposted?: boolean;
}

const ProfilePlaceholder = ({ size = 36 }: { size?: number }) => (
  <div
    className="bg-gradient-to-br from-[#C9115F] to-[#e8185a] rounded-full flex items-center justify-center text-white shrink-0"
    style={{ width: size, height: size }}
  >
    <User style={{ width: size * 0.45, height: size * 0.45 }} />
  </div>
);

const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "now";
};

export default function RepostModal({
  open,
  onClose,
  post,
  currentUserId,
  currentUserName,
  onRepost,
  onQuoteRepost,
  hasReposted = false,
}: Props) {
  const [mode, setMode] = useState<"choose" | "quote">("choose");
  const [quoteText, setQuoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const MAX_CHARS = 280;

  if (!open) return null;

  const handleClose = () => {
    setMode("choose");
    setQuoteText("");
    onClose();
  };

  const handleRepost = async () => {
    if (!post.id) return;
    setLoading(true);
    try {
      await onRepost(post.id);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmit = async () => {
    if (!post.id || !quoteText.trim()) return;
    setLoading(true);
    try {
      await onQuoteRepost(post.id, quoteText.trim());
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-[#1a1a1e] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {mode === "choose" ? (
            /* ── Mode: Choose repost type ───────────────────────── */
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Repost</h3>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleRepost}
                disabled={loading || hasReposted}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors mb-2 ${
                  hasReposted
                    ? "opacity-50 cursor-not-allowed bg-white/5"
                    : "hover:bg-white/8 active:bg-white/12"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                  ) : (
                    <Repeat2 className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">
                    {hasReposted ? "Already reposted" : "Repost"}
                  </p>
                  <p className="text-white/40 text-xs">Share this post instantly</p>
                </div>
              </button>

              <button
                onClick={() => setMode("quote")}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/8 active:bg-white/12 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#C9115F]/15 flex items-center justify-center shrink-0">
                  <Quote className="w-4 h-4 text-[#C9115F]" />
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Quote</p>
                  <p className="text-white/40 text-xs">Share with your thoughts</p>
                </div>
              </button>
            </div>
          ) : (
            /* ── Mode: Quote composer ───────────────────────────── */
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/8">
                <button
                  onClick={() => setMode("choose")}
                  className="text-white/50 hover:text-white text-sm transition-colors"
                >
                  ← Back
                </button>
                <h3 className="text-white font-semibold text-sm">Quote post</h3>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Composer */}
              <div className="p-4 flex gap-3">
                <ProfilePlaceholder size={36} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">{currentUserName}</p>
                  <textarea
                    autoFocus
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Add your thoughts..."
                    rows={3}
                    className="w-full bg-transparent text-white text-sm placeholder-white/30 resize-none outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Quoted post preview */}
              <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ProfilePlaceholder size={24} />
                  <span className="text-white/70 text-xs font-medium">{post.userName}</span>
                  <span className="text-white/25 text-xs">·</span>
                  <span className="text-white/25 text-xs">{formatTimeAgo(post.createdAt)}</span>
                </div>
                {post.content && (
                  <p className="text-white/60 text-xs line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                )}
                {post.media && post.media.length > 0 && (
                  <div className="mt-2 rounded-lg overflow-hidden bg-black/30 aspect-video relative max-h-28">
                    {post.media[0].type === "image" ? (
                      <img
                        src={post.media[0].url}
                        alt="media"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/30 text-xs">
                        🎬 Video
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 pb-4">
                <span
                  className={`text-xs tabular-nums ${
                    quoteText.length > MAX_CHARS - 20 ? "text-red-400" : "text-white/30"
                  }`}
                >
                  {MAX_CHARS - quoteText.length}
                </span>
                <button
                  onClick={handleQuoteSubmit}
                  disabled={!quoteText.trim() || loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9115F] text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#a80e4e] transition-colors"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}