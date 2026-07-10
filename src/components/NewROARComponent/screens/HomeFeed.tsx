// components/NewROARComponent/screens/HomeFeed.tsx

import { usePostHog } from "posthog-js/react";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import { roarApi } from "@/lib/roarApi";
import { emitSxpActivityRefresh } from "@/lib/sxpEvents";
import AvatarWithBadge from "../components/AvatarWithBadge";
import VotersDialog from "../components/VotersDialog";
import ReactionPicker, { type Reaction } from "../components/ReactionPicker";
import ReactionsDialog from "../components/ReactionsDialog";
import { SplitBar } from "../components/shared";
import { FEED_POSTS, BADGE_LABELS } from "../constants";
import { fmt, clamp, formatTimeAgo } from "../utils";
import { useUserProfile } from "@/context/UserProfileContext";
import {
  Heart, Share2, Flame, TrendingUp, Zap, History, PenTool,
  MessageSquare, Trash2, Brain, Users, CheckCircle2, XCircle,
  ChevronLeft, ImageIcon, Send, BarChart2, Clock,
} from "lucide-react";
import type { Room } from "../types";
import { url } from "inspector";

const PAGE_SIZE = 15;
const QUICK_REACT_VIDEO_MAP: Record<string, string> = {
  six: "/QUICK_REACT_VIDEO/six.mp4",
  four: "/QUICK_REACT_VIDEO/four.mp4",
  wicket: "/QUICK_REACT_VIDEO/wicket.mp4",
  // boundary intentionally omitted — falls back to mediaUrls
};
const COMPOSE_ACTIONS = [
  { id: "post", label: "Post", Icon: PenTool },
  { id: "prediction", label: "Predict", Icon: TrendingUp },
  { id: "debate", label: "Debate", Icon: Zap },
];

function displayUsername(raw: string | undefined | null): string {
  if (!raw) return "RoarUser";
  const trimmed = raw.trim();
  if (!trimmed) return "RoarUser";
  if (!trimmed.includes("_")) return trimmed;

  const spaced = trimmed.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
  if (!spaced) return "RoarUser";

  return spaced
    .split(" ")
    .map((word) => (/[A-Z]/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

type ShareableRoarPost = {
  id?: string | number;
  text?: string;
  authorUsername?: string;
  fan?: { username?: string };
};

const buildRoarPostShareUrl = (post: ShareableRoarPost) => {
  if (typeof window === "undefined") return "";
  const targetUrl = new URL(`${window.location.origin}/MainModules/ROAR`);
  if (post?.id) targetUrl.searchParams.set("post", String(post.id));
  return targetUrl.toString();
};

const buildRoarPostShareText = (post: ShareableRoarPost) => {
  const shareUrl = buildRoarPostShareUrl(post);
  const author = post?.fan?.username || post?.authorUsername || "a Sportsfan";
  return [`Check out this ROAR post by ${author}`, post?.text || "Join the conversation on Sportsfan ROAR.", `View post: ${shareUrl}`].filter(Boolean).join("\n");
};

const copyToClipboard = async (text: string) => {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    try {
      const input = document.createElement("textarea");
      input.value = text; input.style.position = "fixed"; input.style.opacity = "0";
      document.body.appendChild(input); input.focus(); input.select();
      const ok = document.execCommand("copy"); document.body.removeChild(input); return ok;
    } catch { return false; }
  }
};

interface QuizCardProps {
  item: any; index: number; activeUsername: string; currentAvatarUrl?: string;
  onPostClick?: (post: any) => void; onToast: (m: string) => void;
  renderCardActions: (item: any) => React.ReactNode;
}

function QuizCard({ item, index, activeUsername, currentAvatarUrl, onPostClick, onToast, renderCardActions }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(item.quizUserAnswer ?? null);
  const [revealedCorrect, setRevealedCorrect] = useState<string | null>(item.quizCorrectOption ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [participants, setParticipants] = useState<number>(item.quizParticipants ?? 0);
  const hasAnswered = selectedOption !== null;
  const quizOptions: { label: string; text: string }[] = item.quizOptions ?? [];
  const { userProfile } = useUserProfile();
  const resolvedAvatarUrl = currentAvatarUrl || userProfile?.avatarUrl || userProfile?.avatar || undefined;

  const handleOptionClick = useCallback(async (label: string) => {
    if (hasAnswered || submitting) return;
    setSubmitting(true); setSelectedOption(label);
    try {
      const res = await axios.post(`/api/roar/posts/${item.id}/quiz-answer`, { selectedOption: label });
      if (res.data?.success || res.data?.message === "Already answered") {
        setRevealedCorrect(res.data.correctOption);
        setParticipants(res.data.quizParticipants ?? participants + 1);
        if (res.data.isCorrect) onToast("Correct! +2 points awarded");
        else onToast(`Wrong! Correct answer was ${res.data.correctOption}`);
      }
    } catch { setSelectedOption(null); onToast("Failed to submit answer"); }
    finally { setSubmitting(false); }
  }, [hasAnswered, submitting, item.id, participants, onToast]);

  const getOptionStyle = (label: string): React.CSSProperties => {
    const isCorrect = hasAnswered && revealedCorrect === label;
    const isWrong = hasAnswered && selectedOption === label && revealedCorrect !== null && !isCorrect;
    const base: React.CSSProperties = { padding: "11px 14px", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, transition: "all 0.18s" };
    if (!hasAnswered) return { ...base, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1 };
    if (isCorrect) return { ...base, background: "rgba(0,232,198,0.12)", border: "1px solid rgba(0,232,198,0.4)", cursor: "default" };
    if (isWrong) return { ...base, background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.35)", cursor: "default" };
    return { ...base, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", cursor: "default", opacity: 0.45 };
  };

  const getLabelColor = (label: string) => {
    if (!hasAnswered) return "#4A4A62";
    if (revealedCorrect === label) return "#00E8C6";
    if (selectedOption === label && revealedCorrect !== label) return "#F44336";
    return "#4A4A62";
  };

  return (
    <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="glass-card" style={{ padding: "16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#E91E8C,#FF6B35,#00E8C6)", borderRadius: "28px 28px 0 0" }} />
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase", background: "rgba(0,232,198,0.12)", color: "#00E8C6", border: "1px solid rgba(0,232,198,0.25)" }}>🧠 Flash Quiz</span>
        {hasAnswered && revealedCorrect && <span style={{ fontSize: 10, fontWeight: 700, color: selectedOption === revealedCorrect ? "#00E8C6" : "#F44336", marginLeft: "auto" }}>{selectedOption === revealedCorrect ? "✓ Correct!" : "✗ Wrong"}</span>}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <AvatarWithBadge username={item.fan.username} badge={item.fan.badge} size="sm" avatarUrl={item.fan.avatarUrl} />
        <div><p style={{ fontWeight: 700, fontSize: 13 }}>{item.fan.username}</p><p style={{ fontSize: 10, color: "var(--text-secondary)" }}>{BADGE_LABELS[item.fan.badge]} · {item.fan.team} • {formatTimeAgo(item.createdAt)}</p></div>
      </div>
      <p style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.5, marginBottom: 14, color: "#F5F5FA", cursor: "pointer" }} onClick={() => onPostClick && onPostClick(item)}>{item.quizQuestion || item.text}</p>
      {quizOptions.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {quizOptions.map((opt) => {
            const isCorrect = hasAnswered && revealedCorrect === opt.label;
            const isWrong = hasAnswered && selectedOption === opt.label && revealedCorrect !== opt.label && revealedCorrect !== null;
            return (
              <motion.div key={opt.label} whileTap={!hasAnswered && !submitting ? { scale: 0.97 } : {}} style={getOptionStyle(opt.label)} onClick={(e) => { e.stopPropagation(); handleOptionClick(opt.label); }}>
                <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.04em", color: getLabelColor(opt.label), minWidth: 14, flexShrink: 0 }}>{opt.label}</span>
                {hasAnswered && isCorrect && <CheckCircle2 size={13} color="#00E8C6" style={{ flexShrink: 0 }} />}
                {hasAnswered && isWrong && <XCircle size={13} color="#F44336" style={{ flexShrink: 0 }} />}
                <span style={{ fontSize: 12, fontWeight: 500, color: isCorrect ? "#00E8C6" : isWrong ? "#F44336" : hasAnswered ? "rgba(255,255,255,0.35)" : "#9494AD", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.text || `Option ${opt.label}`}</span>
              </motion.div>
            );
          })}
        </div>
      )}
      {!hasAnswered && <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontStyle: "italic" }}>Tap an option to answer</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Users size={13} color="#9494AD" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#9494AD" }}>{participants > 0 ? `${participants.toLocaleString()} fan${participants === 1 ? "" : "s"} participated` : "Be the first to answer!"}</span>
      </div>
      {renderCardActions(item)}
    </motion.div>
  );
}

// ── Inline Comment Input ─────────────────────────────────────────────────────
interface InlineCommentInputProps {
  postId: string;
  onSubmit: (postId: string, text: string) => Promise<void>;
  onOpenFull: () => void;
  accentColor?: string;
  placeholder?: string;
}

function InlineCommentInput({
  postId, onSubmit, onOpenFull,
  accentColor = "var(--accent-magenta)",
  placeholder = "Add your take...",
}: InlineCommentInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 120); }, []);

  const handleSend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try { await onSubmit(postId, trimmed); setText(""); }
    finally { setSending(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: "auto", marginTop: 10 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 10px", borderRadius: 16,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${accentColor}40`,
      }}>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSend(e as any); }}
          placeholder={placeholder}
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 13, fontWeight: 500 }}
        />
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onOpenFull(); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", padding: "0 2px" }}
        >
          All
        </button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            background: text.trim() ? `linear-gradient(135deg,${accentColor},#ff6b35)` : "rgba(255,255,255,0.08)",
            border: "none", borderRadius: "50%", width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: text.trim() ? "pointer" : "default",
            transition: "background 0.2s", flexShrink: 0,
          }}
        >
          <Send size={14} color={text.trim() ? "#fff" : "rgba(255,255,255,0.3)"} />
        </motion.button>
      </div>
    </motion.div>
  );
}

interface Props {
  onJoinRoom: (room?: any) => void; onLeaderboard: () => void; onFanProfile: (fan?: any) => void;
  onToast: (m: string) => void; extraItems: any[]; showBanner: boolean; onDismissBanner: () => void;
  userBadge: string; rooms?: Room[]; dbPosts?: any[]; onPostClick?: (post: any) => void;
  onVote?: (id: string, vote: string | null) => void;
  onLike?: (id: string) => void; // kept for compat; prefer onReact
  onReact?: (id: string, reaction: Reaction | null) => void; // NEW
  onDeletePost?: (id: string) => void; userSports?: string[]; onQuickCompose?: (t: string) => void;
  currentUsername?: string; currentUserId?: string; currentAvatarUrl?: string; onBack?: () => void;
  onQuickComment?: (postId: string, text: string) => Promise<void>;
  onHandlePost?: (payload: any) => Promise<void>;
}

export default function HomeFeed({
  onJoinRoom, onLeaderboard, onFanProfile, onToast, extraItems, showBanner, onDismissBanner,
  userBadge, rooms = [], dbPosts = [], onPostClick, onVote, onLike, onReact, onDeletePost,
  userSports = [], onQuickCompose, currentUsername: propUsername, currentUserId: propCurrentUserId, currentAvatarUrl, onBack,
  onQuickComment, onHandlePost,
}: Props) {
  const [votes, setVotes] = useState<Record<string, boolean | string | null>>({});
  const [localLikes, setLocalLikes] = useState<Record<string, { userLiked: boolean; likeCount: number; reaction: Reaction | null }>>({});
  const localLikesRef = useRef<Record<string, { userLiked: boolean; likeCount: number; reaction: Reaction | null }>>({});
  const pendingReactRef = useRef<Record<string, boolean>>({});
  const [lastActionAt, setLastActionAt] = useState<Record<string, number>>({});
  const [pcts, setPcts] = useState<Record<string, number>>({});
  const [sharePost, setSharePost] = useState<ShareableRoarPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [attachedUrl, setAttachedUrl] = useState<string | null>(null);
  const [attachedType, setAttachedType] = useState<"image" | "video" | null>(null);
  const [selectedActionId, setSelectedActionId] = useState("post");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inlineCommentPostId, setInlineCommentPostId] = useState<string | null>(null);
  const [votersPostId, setVotersPostId] = useState<string | null>(null);
  const [resolvingPostId, setResolvingPostId] = useState<string | null>(null);
  const [resolvedPredictions, setResolvedPredictions] = useState<Record<string, { resolvedAt: number; correctVote: string; closedAt: number }>>({});
  const sendingRef = useRef(false);

  const [reactionsPostId, setReactionsPostId] = useState<string | null>(null);

  // ── Pagination (pages 2+, owned entirely by HomeFeed) ─────────────────────
  // `dbPosts` (page 1, 15 posts) comes from the parent and is re-fetched on
  // a poll there, so it's parent-owned and stays untouched. Everything
  // beyond page 1 is fetched here directly against /api/roar/posts and
  // appended. Keeping these two arrays separate means the parent's 5s poll
  // replacing `dbPosts` wholesale never disturbs pages already loaded, and
  // our `lastCreatedAt` cursor is always derived from OUR last-fetched
  // item, not from whatever `dbPosts` happens to contain at poll time.
  const [morePosts, setMorePosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const cursorRef = useRef<number | null>(null); // lastCreatedAt for the next page
  const loadingMoreRef = useRef(false); // mirrors loadingMore for the observer callback (avoids stale closure)
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const dbPostsRef = useRef<any[]>([]);
  useEffect(() => { dbPostsRef.current = dbPosts; }, [dbPosts]);

  // Seed the cursor from page 1 once dbPosts first arrives, so the very
  // first "load more" continues immediately after the parent's initial 15
  // rather than re-fetching from the top.
  // const cursorSeededRef = useRef(false);
  // useEffect(() => {
  //   if (cursorSeededRef.current || dbPosts.length === 0) return;
  //   // const last = dbPosts[dbPosts.length - 1];
  //   // cursorRef.current = last?.createdAt ?? null;
  //   // cursorSeededRef.current = true;
  //   // // If page 1 came back under PAGE_SIZE, there's nothing more to fetch.
  //   // if (dbPosts.length < PAGE_SIZE) setHasMore(false);
  //    // Sort ascending so the cursor always points to the oldest post
  //   // in page 1, regardless of the optimistic prepend order.
  //   const sorted = [...dbPosts].sort((a, b) =>
  //     (a.createdAt ?? 0) - (b.createdAt ?? 0));
  //   cursorRef.current = sorted[0]?.createdAt ?? null;
  //   cursorSeededRef.current = true;
  //   if (dbPosts.length < PAGE_SIZE) setHasMore(false);
  // }, [dbPosts]);

  const cursorSeededRef = useRef(false);
  const lastDbPostsLengthRef = useRef(0);
  useEffect(() => {
    if (dbPosts.length === 0) return;
    const lengthDelta = dbPosts.length - lastDbPostsLengthRef.current;
    const shouldReseed = !cursorSeededRef.current || lengthDelta > 1;
    lastDbPostsLengthRef.current = dbPosts.length;
    if (!shouldReseed) return;
    const sorted = [...dbPosts].sort((a, b) =>
      (a.createdAt ?? 0) - (b.createdAt ?? 0));
    cursorRef.current = sorted[0]?.createdAt ?? null;
    cursorSeededRef.current = true;
    if (dbPosts.length < PAGE_SIZE) setHasMore(false);
  }, [dbPosts]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || cursorRef.current === null) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await axios.get("/api/roar/posts", {
        params: { limit: PAGE_SIZE, lastCreatedAt: cursorRef.current },
      });
      if (res.data?.success) {
        const newPosts: any[] = res.data.posts ?? [];
        setMorePosts(prev => {
          // De-dupe defensively in case a post already appeared on page 1
          // (e.g. it was created between the parent's poll ticks).
          // const seenIds = new Set([...dbPosts, ...prev].map(p => p.postId ?? p.id));
          const seenIds = new Set([...dbPostsRef.current, ...prev].map(p => p.postId ?? p.id));
          const fresh = newPosts.filter(p => !seenIds.has(p.postId));
          return [...prev, ...fresh];
        });
        if (newPosts.length > 0) {
          cursorRef.current = newPosts[newPosts.length - 1].createdAt ?? cursorRef.current;
        }
        setHasMore(Boolean(res.data.pagination?.hasMore));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more posts:", err);
      // Leave hasMore as-is so the observer can retry on next intersection
      // rather than permanently giving up after one network blip.
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore]);

  // IntersectionObserver on a sentinel placed after the last rendered post.
  // No "load more" button and no end-of-feed text — just the spinner that
  // already renders below the feed while loadingMore is true (see JSX).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMorePosts();
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "200px", // start fetching slightly before the sentinel is fully on-screen
        threshold: 0,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMorePosts]);

  useEffect(() => { localLikesRef.current = localLikes; }, [localLikes]);
  const { userProfile } = useUserProfile();
  const activeUsername = propUsername || userProfile?.username || userProfile?.name || "RoarUser";
  const resolvedAvatarUrl = currentAvatarUrl || userProfile?.avatarUrl || userProfile?.avatar || undefined;
  const currentUserId = propCurrentUserId || userProfile?.actualUserId;
  const currentUserIdCandidates = [
    currentUserId,
    userProfile?.actualUserId,
    (userProfile as { userId?: string })?.userId,
    (userProfile as { uid?: string })?.uid,
    (userProfile as { email?: string })?.email,
  ].filter(Boolean).map(String);
  const isCurrentUserAuthor = (item: { authorUid?: unknown; authorEmail?: unknown; fan?: { authorUid?: unknown } }) => {
    const authorCandidates = [item.authorUid, item.fan?.authorUid, item.authorEmail].filter(Boolean).map(String);
    return authorCandidates.some(id => currentUserIdCandidates.includes(id));
  };

  const phog = usePostHog();

  const openShareDialog = (post: ShareableRoarPost) => {
    setSharePost(post);
    setCopied(false);
    if (phog) { phog.capture("content_shared", { post_id: post.id }); }
  };
  const closeShareDialog = () => { setSharePost(null); setCopied(false); };
  const handleShareToWhatsApp = () => { if (!sharePost) return; window.open(`https://wa.me/?text=${encodeURIComponent(buildRoarPostShareText(sharePost))}`, "_blank"); };
  const handleShareToThreads = () => { if (!sharePost) return; window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildRoarPostShareText(sharePost))}`, "_blank"); };
  const handleShareToInstagram = async () => { if (!sharePost) return; await copyToClipboard(buildRoarPostShareText(sharePost)); setCopied(true); setTimeout(() => setCopied(false), 1600); window.open("https://www.instagram.com/", "_blank"); };
  const handleShareToLinkedIn = () => { if (!sharePost) return; window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildRoarPostShareUrl(sharePost))}`, "_blank"); };
  const handleShareToX = () => { if (!sharePost) return; window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildRoarPostShareText(sharePost))}`, "_blank"); };
  const handleCopyLink = async () => {
    if (!sharePost) return;
    const ok = await copyToClipboard(buildRoarPostShareText(sharePost));
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); onToast("Link copied to clipboard!"); }
  };

  const shareButtons = (size: string) => (
    <>
      {[
        { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
        { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
        { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
        { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
        { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
        { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
      ].map(({ handler, src, alt }) => (
        <button key={alt} onClick={handler} className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`} type="button">
          <Image src={src} alt={alt} width={36} height={36} className="w-full h-full object-cover rounded-full" />
        </button>
      ))}
    </>
  );

  useEffect(() => {
    const allIncoming = [...dbPosts, ...morePosts];
    if (allIncoming.length === 0) return;
    const nowMs = Date.now();
    setVotes(prev => {
      const next = { ...prev };
      allIncoming.forEach(p => {
        const id = p.postId; if (nowMs - (lastActionAt[id] || 0) < 8000) return;
        if (p.userVote === "agree") next[id] = true;
        else if (p.userVote === "disagree") next[id] = false;
        else if (typeof p.userVote === "string") next[id] = p.userVote;
        else next[id] = null;
      });
      return next;
    });
    setLocalLikes(prev => {
      const next = { ...prev };
      allIncoming.forEach(p => {
        const id = p.postId; if (nowMs - (lastActionAt[id] || 0) < 8000) return;
        next[id] = {
          userLiked: p.userLiked ?? false,
          likeCount: p.likeCount ?? 0,
          reaction: (p.userReaction as Reaction) ?? null,
        };
      });
      return next;
    });
  }, [dbPosts, morePosts, lastActionAt]);

  const vote = (id: string, agree: boolean, initialAgreePercent: number, initialUserVote: string | null, isDbPost?: boolean, closed?: boolean, voteValue?: string) => {
    if (closed) {
      onToast("This prediction is closed");
      return;
    }
    const cv = votes[id];
    if (cv === true || cv === false || typeof cv === "string" || initialUserVote) return;
    const nextVote = voteValue || (agree ? "agree" : "disagree");
    setVotes(v => ({ ...v, [id]: nextVote === "agree" ? true : nextVote === "disagree" ? false : nextVote }));
    setLastActionAt(p => ({ ...p, [id]: Date.now() }));
    setPcts(p => ({ ...p, [id]: clamp(initialAgreePercent + (agree ? 3 : -3), 1, 99) }));
    if (isDbPost && onVote) onVote(id, nextVote);
    const item = dbPosts.find(x => x.id === id);
    if (phog) {
      phog.capture("poll_voted", {
        poll_id: id,
        poll_type: item?.type || "prediction",
        option_id: nextVote,
        room_id: item?.roomId || "",
        room_name: rooms.find(r => r.roomId === item?.roomId)?.name || ""
      });
    }
    setInlineCommentPostId(id);
  };

  const handleReact = useCallback(async (itemId: string, reaction: Reaction | null, isDbPost?: boolean) => {
    if (pendingReactRef.current[itemId]) return;

    const prev = localLikesRef.current[itemId] ?? { userLiked: false, likeCount: 0, reaction: null };
    const wasLiked = prev.reaction !== null;
    const sameReaction = prev.reaction === reaction;

    const newReaction = sameReaction ? null : reaction;
    const newLiked = newReaction !== null;
    const countDelta = newLiked && !wasLiked ? 1 : (!newLiked && wasLiked ? -1 : 0);
    const optimisticState = {
      userLiked: newLiked,
      likeCount: Math.max(0, prev.likeCount + countDelta),
      reaction: newReaction,
    };

    setLocalLikes(p => ({ ...p, [itemId]: optimisticState }));
    setLastActionAt(p => ({ ...p, [itemId]: Date.now() }));

    if (isDbPost) {
      pendingReactRef.current[itemId] = true;
      try {
        const res = reaction === null || sameReaction
          ? await roarApi.unreactPost(itemId)
          : await roarApi.reactPost(itemId, reaction);

        if ("likeCount" in res && typeof res.likeCount === "number") {
          setLocalLikes(p => ({
            ...p,
            [itemId]: { ...optimisticState, likeCount: res.likeCount as number },
          }));
        }

        onReact?.(itemId, newReaction);
      } catch {
        setLocalLikes(p => ({ ...p, [itemId]: prev }));
        onToast("Failed to save reaction");
      } finally {
        pendingReactRef.current[itemId] = false;
      }
    }
  }, [onReact, onLike, onToast]);

  const handleInlineCommentSubmit = async (postId: string, text: string) => {
    try {
      const dbPost = [...dbPosts, ...morePosts].find(p => p.postId === postId);
      const res = await axios.post(`/api/roar/posts/${postId}/comments`, {
        text, roomId: dbPost?.roomId,
      });
      if (res.data?.success) {
        onToast("Comment posted!");
        if (onQuickComment) await onQuickComment(postId, text);
      } else { onToast("Failed to post comment"); }
    } catch { onToast("Failed to post comment"); }
    setInlineCommentPostId(null);
  };

  const resolvePrediction = async (postId: string, correctVote: string) => {
    try {
      setResolvingPostId(postId);
      const res = await axios.post(`/api/roar/posts/${postId}/resolve`, { correctVote });
      if (res.data?.success) {
        const resolvedAt = res.data.post?.resolvedAt ?? Date.now();
        setResolvedPredictions(prev => ({ ...prev, [postId]: { resolvedAt, correctVote, closedAt: res.data.post?.closedAt ?? resolvedAt } }));
        onToast(`Prediction resolved. ${res.data.correctCount ?? 0} correct fans awarded.`);
      } else {
        onToast("Failed to resolve prediction");
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      onToast(message || "Failed to resolve prediction");
    } finally {
      setResolvingPostId(null);
    }
  };

  const getPredictionVoteValue = (optionIndex: number) => (
    optionIndex === 0 ? "agree" : optionIndex === 1 ? "disagree" : `option_${optionIndex}`
  );

  const getPredictionOptionLabel = (voteValue: string | undefined, options: string[]) => {
    if (!voteValue) return "";
    if (voteValue === "agree") return options[0] || "Option 1";
    if (voteValue === "disagree") return options[1] || "Option 2";
    const optionIndex = Number(voteValue.replace("option_", ""));
    return Number.isFinite(optionIndex) ? (options[optionIndex] || voteValue) : voteValue;
  };

  const formatPredictionCloseLabel = (item: { resolvedAt?: number; closesAt?: number; closedAt?: number }) => {
    if (item.resolvedAt) return "Resolved";
    if (!item.closesAt) return "Open";
    const remaining = item.closesAt - Date.now();
    if (remaining <= 0 || item.closedAt) return "Closed";
    const mins = Math.ceil(remaining / 60000);
    if (mins < 60) return `${mins}m left`;
    const hours = Math.ceil(mins / 60);
    return `${hours}h left`;
  };

  const triggerUpload = (type: "image" | "video") => {
    setAttachedType(type);
    if (fileInputRef.current) { fileInputRef.current.accept = type === "image" ? "image/*" : "video/*"; fileInputRef.current.click(); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setUploading(true); onToast("Uploading media...");
      const fd = new FormData(); fd.append("file", file);
      const res = await axios.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.url) { setAttachedUrl(res.data.url); onToast("Media uploaded!"); }
    } catch { onToast("Upload failed"); setAttachedType(null); }
    finally { setUploading(false); if (e.target) e.target.value = ""; }
  };

  // const sendQuickPost = async () => {
  //   const text = input.trim();
  //   if (!text && !attachedUrl) return;
  //   try {
  //     await axios.post("/api/roar/posts", { type: "post", text: text || "Shared media", sport: "cricket", mediaUrls: attachedUrl ? [attachedUrl] : undefined });
  //     onToast("Post is live!"); setInput(""); setAttachedUrl(null); setAttachedType(null);
  //   } catch { onToast("Failed to post"); }
  // };


  const sendQuickPost = async () => {
    const text = input.trim();
    if (!text && !attachedUrl) return;
    if (sendingRef.current) return;
    sendingRef.current = true;

    setInput(""); setAttachedUrl(null); setAttachedType(null);

    try {
      if (onHandlePost) {
        await onHandlePost({
          type: selectedActionId === "post" ? "post" : selectedActionId,
          text: text || "Shared media",
          sport: "cricket",
          mediaUrls: attachedUrl ? [attachedUrl] : undefined,
        });
      } else {
        await axios.post("/api/roar/posts", {
          type: "post",
          text: text || "Shared media",
          sport: "cricket",
          mediaUrls: attachedUrl ? [attachedUrl] : undefined,
        });
        onToast("Post is live!");
      }
    } catch {
      onToast("Failed to post");
    } finally {
      sendingRef.current = false;
    }
  };

  // Cache: postId → top reaction types (up to 3), fetched once per session
  const topReactionsCache = useRef<Record<string, string[]>>({});
  const [topReactionsMap, setTopReactionsMap] = useState<Record<string, string[]>>({});

  const fetchTopReactions = useCallback(async (postId: string) => {
    if (topReactionsCache.current[postId] !== undefined) return; // already fetched or in-flight
    topReactionsCache.current[postId] = []; // mark in-flight
    try {
      const res = await axios.get(`/api/roar/posts/${postId}/reactions?limit=100`);
      const reactors: { reaction: string }[] = res.data?.reactors ?? [];
      // Tally counts per reaction type
      const counts: Record<string, number> = {};
      reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] ?? 0) + 1; });
      const top = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([type]) => type);
      topReactionsCache.current[postId] = top;
      setTopReactionsMap(prev => ({ ...prev, [postId]: top }));
    } catch {
      topReactionsCache.current[postId] = [];
    }
  }, []);

  const renderCardActions = (item: any) => {
    const lo = localLikes[item.id];
    const currentReaction: Reaction | null = lo !== undefined ? lo.reaction : ((item.userReaction as Reaction) ?? null);
    const likeCount = lo !== undefined ? lo.likeCount : (item.likeCount ?? 0);
    const isAuthor = isCurrentUserAuthor(item);

    return (
      <div style={{ display: "flex", gap: 14, marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, alignItems: "center" }}>

        <div onClick={e => e.stopPropagation()}>
          <ReactionPicker
            currentReaction={currentReaction}
            count={likeCount}
            onReact={(r) => handleReact(item.id, r, item.isDbPost)}
            postId={item.id}
            roomId={item.roomId}
            roomName={rooms.find(r => r.roomId === item.roomId)?.name || ""}
          />
        </div>

        <button onClick={e => { e.stopPropagation(); onPostClick?.(item); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#9494ad", fontSize: 13, fontWeight: 600 }}>
          <MessageSquare size={16} /><span>{item.replies || 0}</span>
        </button>

        <button onClick={e => { e.stopPropagation(); openShareDialog(item); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#9494ad", fontSize: 13, fontWeight: 600 }}>
          <Share2 size={16} />
        </button>

        {/* {likeCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={e => { e.stopPropagation(); setReactionsPostId(item.id); }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700,
              marginLeft: "auto",
            }}
            title="See who reacted"
          >
            <BarChart2 size={13} />
            <span>Reactions</span>
          </motion.button>
        )} */}


        {likeCount > 0 && (() => {
          const REACTION_EMOJI: Record<string, string> = {
            heart: "❤️", fire: "🔥", mindblown: "🤯", goat: "🐐", clap: "👏", nochance: "🙅",
            // likesection route uses these names:
            laugh: "😂", sad: "😢", thumb: "👍",
          };

          // Use cached top reactions; trigger a fetch if not yet loaded
          const topReactions = topReactionsMap[item.id] ?? [];
          if (topReactions.length === 0 && !topReactionsCache.current[item.id]) {
            fetchTopReactions(item.id); // fire-and-forget; re-render when done
          }

          // While fetch is in-flight, fall back to current user's reaction so
          // the button isn't empty
          const displayReactions = topReactions.length > 0
            ? topReactions
            : currentReaction ? [currentReaction] : [];

          if (displayReactions.length === 0) return null;

          return (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={e => { e.stopPropagation(); setReactionsPostId(item.id); }}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "none", border: "none", cursor: "pointer",
                marginLeft: "auto", padding: 0,
              }}
              title="See who reacted"
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {displayReactions.map((type, idx) => (
                  <div
                    key={type}
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      border: "1.5px solid rgba(0,0,0,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, lineHeight: 1,
                      marginLeft: idx === 0 ? 0 : -6,
                      zIndex: displayReactions.length - idx,
                      position: "relative",
                    }}
                  >
                    {REACTION_EMOJI[type] ?? "❤️"}
                  </div>
                ))}
              </div>
              {/* <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", marginLeft: 3 }}>
                {likeCount}
              </span> */}
            </motion.button>
          );
        })()}

        {isAuthor && (
          <button
            onClick={e => { e.stopPropagation(); if (window.confirm("Delete this post?")) onDeletePost?.(item.id); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", cursor: "pointer", color: "#f87171",
              marginLeft: isAuthor && likeCount > 0 ? 0 : "auto",
              padding: 4, borderRadius: "50%",
            }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    );
  };

  const mapDbPost = (p: any) => {
    const ag = p.agreeCount ?? 0; const di = p.disagreeCount ?? 0; const tot = ag + di;
    return {
      id: p.postId, type: p.type, sport: p.sport || "cricket",
      authorUid: p.authorUid,
      authorEmail: p.authorEmail,
      fan: { username: displayUsername(p.authorUsername), authorUid: p.authorUid, badge: p.authorBadge || "RISING_FAN", team: p.sport === "cricket" ? "India" : "MCFC", avatarUrl: p.authorAvatarUrl || p.avatarUrl || (p.authorUid && p.authorUid === currentUserId ? resolvedAvatarUrl : undefined) },
      text: p.text, agreePercent: tot > 0 ? Math.round((ag / tot) * 100) : 50,
      agreeCount: ag, disagreeCount: di, fanCount: tot + (p.type === "hot_take" ? 47 : 1240),
      replies: p.replyCount ?? 0, following: false, isLive: false,
      match: p.matchId || (p.type === "prediction" ? (p.sport === "cricket" ? "IND vs AUS · 3rd Test" : "ISL 2025") : undefined),
      isDbPost: true, userVote: p.userVote, sideA: p.sideA, sideB: p.sideB, predictionOptions: Array.isArray(p.predictionOptions) ? p.predictionOptions : [p.sideA, p.sideB].filter(Boolean), memCtx: p.memCtx,
      mediaUrls: p.mediaUrls, memGifUrl: p.memGifUrl, memTag: p.memTag,
      likeCount: p.likeCount ?? 0, userLiked: p.userLiked ?? false,
      userReaction: p.userReaction ?? null,
      closesAt: p.closesAt, closedAt: p.closedAt, resolvedAt: p.resolvedAt,
      predictionOptionCounts: p.predictionOptionCounts ?? {},
      correctVote: p.correctVote, accuracyAwarded: p.accuracyAwarded,
      fireCount: p.fireCount ?? p.fire_count ?? 0,
      heartCount: p.heartCount ?? p.heart_count ?? 0,
      mindblownCount: p.mindblownCount ?? p.mind_blown_count ?? p.mindBlownCount ?? 0,
      goatCount: p.goatCount ?? p.goat_count ?? 0,
      clapCount: p.clapCount ?? p.clap_count ?? 0,
      nochanceCount: p.nochanceCount ?? p.no_chance_count ?? p.noChanceCount ?? 0,
      createdAt: p.createdAt,
      quizQuestion: p.quizQuestion, quizOptions: p.quizOptions, quizCorrectOption: p.quizCorrectOption,
      quizUserAnswer: p.quizUserAnswer, quizTimer: p.quizTimer, quizPoints: p.quizPoints, quizParticipants: p.quizParticipants ?? 0,
      authorUsername: p.authorUsername,
    };
  };

  // const mappedDbPosts = dbPosts.map(mapDbPost);
  // const mappedMorePosts = morePosts.map(mapDbPost);

  // const allPosts = [...mappedDbPosts, ...mappedMorePosts, ...extraItems, ...FEED_POSTS];
  const mappedDbPosts = useMemo(() => dbPosts.map(mapDbPost), [dbPosts, currentUserId, resolvedAvatarUrl]);
  const mappedMorePosts = useMemo(() => morePosts.map(mapDbPost), [morePosts, currentUserId, resolvedAvatarUrl]);
  const allPosts = useMemo(
    () => [...mappedDbPosts, ...mappedMorePosts, ...extraItems, ...FEED_POSTS],
    [mappedDbPosts, mappedMorePosts, extraItems]
  );

  const shareRoomLink = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "SF360 Infinity Room", url: window.location.href });
    } else { copyToClipboard(window.location.href); onToast("Link copied!"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden", position: "relative" }}>

      {/* Share dialog */}
      {sharePost && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
          <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-semibold">Share</p>
              <button type="button" onClick={closeShareDialog} className="text-gray-400 hover:text-white"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
            </div>
            <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
            {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
          </div>
          <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
            <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-semibold">Share ROAR Post</p>
                <button type="button" onClick={closeShareDialog} className="text-gray-400 hover:text-white"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                <p className="text-white text-sm font-semibold line-clamp-2">{sharePost.text || "ROAR Post"}</p>
                <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildRoarPostShareUrl(sharePost)}</p>
              </div>
              <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">{shareButtons("w-9 h-9")}</div>
              {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
            </div>
          </div>
        </>
      )}

      {/* ── HEADER ── */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px", background: "rgba(14,14,20,0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)", zIndex: 30 }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", padding: 0, marginRight: 10 }}>
          <ChevronLeft size={26} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "0.04em", color: "#fff", margin: 0, lineHeight: 1.1 }}>SF360 Infinity Room</p>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <span className="live-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--live-green)", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "var(--live-green)" }}>LIVE</span>
          </div>
        </div>
        <button type="button" onClick={shareRoomLink} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center" }}>
          <Share2 size={18} />
        </button>
      </div>

      {/* ── POSTS FEED ── */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden",
          WebkitOverflowScrolling: "touch" as any, touchAction: "pan-y", padding: "12px 16px 0",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 24 }}>
          {allPosts.map((item, i) => {

            if (item.type === "quiz") {
              return <QuizCard key={item.id} item={item} index={i} activeUsername={activeUsername} currentAvatarUrl={resolvedAvatarUrl} onPostClick={onPostClick} onToast={onToast} renderCardActions={renderCardActions} />;
            }

            if (item.type === "hot_take" || item.type === "prediction" || item.type === "post") {
              const mediaUrls = QUICK_REACT_VIDEO_MAP[item.memTag]
                ? [QUICK_REACT_VIDEO_MAP[item.memTag]]
                : item.mediaUrls ?? [];
              const pct = pcts[item.id] ?? item.agreePercent ?? 50;
              const userVote = votes[item.id];
              const liveTotal = (item.agreeCount ?? 0) + (item.disagreeCount ?? 0);
              const agrPct = liveTotal > 0 ? Math.round(((item.agreeCount ?? 0) / liveTotal) * 100) : pct;
              const disAgrPct = liveTotal > 0 ? Math.round(((item.disagreeCount ?? 0) / liveTotal) * 100) : 100 - pct;
              const localResolution = resolvedPredictions[item.id];
              const resolvedAt = item.resolvedAt ?? localResolution?.resolvedAt;
              const closedAt = item.closedAt ?? localResolution?.closedAt;
              const predictionClosed = item.type === "prediction" && Boolean(resolvedAt || closedAt || (item.closesAt && item.closesAt <= Date.now()));
              const predictionOptions = item.type === "prediction" && Array.isArray(item.predictionOptions) && item.predictionOptions.length >= 2
                ? item.predictionOptions
                : [item.sideA || "Option 1", item.sideB || "Option 2"];
              const optionCounts = item.predictionOptionCounts ?? {};
              const predictionTotal = liveTotal + Object.values(optionCounts).reduce((sum: number, count: unknown) => sum + (Number(count) || 0), 0);
              const predictionPct = (count: number) => predictionTotal > 0 ? Math.round((count / predictionTotal) * 100) : 0;
              const predAgrPct = predictionPct(item.agreeCount ?? 0);
              const predDisAgrPct = predictionPct(item.disagreeCount ?? 0);
              const correctVote = item.correctVote ?? localResolution?.correctVote;
              const correctVoteLabel = getPredictionOptionLabel(correctVote, predictionOptions);
              const isAuthor = isCurrentUserAuthor(item);
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card" style={{ padding: 16, cursor: "pointer" }} onClick={() => onPostClick?.(item)}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase", background: item.type === "hot_take" ? "rgba(239,68,68,0.12)" : item.type === "post" ? "rgba(233,30,140,0.12)" : "rgba(255,107,53,0.12)", color: item.type === "hot_take" ? "#f87171" : item.type === "post" ? "var(--accent-magenta)" : "var(--accent-orange)", border: `1px solid ${item.type === "hot_take" ? "rgba(239,68,68,0.2)" : item.type === "post" ? "rgba(233,30,140,0.2)" : "rgba(255,107,53,0.2)"}` }}>{item.type === "hot_take" ? "🔥 Hot Take" : item.type === "post" ? "✏️ Post" : "📊 Prediction"}</span>
                    {item.type !== "post" && <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: item.sport === "cricket" ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)", color: item.sport === "cricket" ? "#22c55e" : "#60a5fa", border: `1px solid ${item.sport === "cricket" ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.2)"}`, textTransform: "uppercase" }}>{item.sport === "cricket" ? "🏏 Cricket" : "⚽ Football"}</span>}
                    {item.type === "prediction" && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: predictionClosed ? "rgba(244,67,54,0.12)" : "rgba(34,197,94,0.1)", color: predictionClosed ? "#f87171" : "#22c55e", border: `1px solid ${predictionClosed ? "rgba(244,67,54,0.25)" : "rgba(34,197,94,0.22)"}` }}>
                        <Clock size={11} /> {formatPredictionCloseLabel({ ...item, resolvedAt, closedAt })}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}
                    onClick={(e) => { e.stopPropagation(); onFanProfile?.(item.fan); }}>
                    <AvatarWithBadge username={item.fan.username} badge={item.fan.badge} size="sm" avatarUrl={item.fan.avatarUrl} />
                    <div><p style={{ fontWeight: 700, fontSize: 13 }}>{item.fan.username}</p><p style={{ fontSize: 10, color: "var(--text-secondary)" }}>{BADGE_LABELS[item.fan.badge]} · {item.fan.team} • {formatTimeAgo(item.createdAt)}</p></div>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.5, marginBottom: 12 }}>{item.text}</p>
                  {mediaUrls.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                      {/* {mediaUrls.map(url: string, idx: number) => url.endsWith(".mp4") || url.includes("/video/upload/") ? <video key={idx} src={url} controls style={{ width: "100%", maxHeight: 300, borderRadius: 12, objectFit: "cover" }} onClick={e => e.stopPropagation()} /> : <img key={idx} src={url} alt="" style={{ width: "100%", maxHeight: 300, borderRadius: 12, objectFit: "cover" }} />)} */}
                      {mediaUrls.map((url: string, idx: number) => url.endsWith(".mp4") || url.includes("/video/upload/")
                        ? <video key={idx} src={url} controls style={{ width: "100%", maxHeight: 300, borderRadius: 12, objectFit: "cover" }} onClick={e => e.stopPropagation()} />
                        : <img key={idx} src={url} alt="" style={{ width: "100%", maxHeight: 300, borderRadius: 12, objectFit: "cover" }} />
                      )}
                    </div>
                  )}
                  {item.match && <p style={{ fontSize: 11, color: "var(--accent-magenta)", marginBottom: 8, fontWeight: 600 }}>{item.match}</p>}
                  {item.type === "hot_take" && (
                    <>
                      <div style={{ marginBottom: 10 }}><SplitBar left={pct} /></div>
                      <p style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500, marginBottom: 12 }}>{fmt(item.fanCount ?? 0)} fans · {item.replies ?? 0} replies</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[{ agree: true, label: "Agree", pctVal: agrPct, active: userVote === true, color: "var(--accent-magenta)" }, { agree: false, label: "Disagree", pctVal: disAgrPct, active: userVote === false, color: "var(--accent-orange)" }].map(({ agree, label, pctVal, active, color }) => (
                          <motion.button key={label} whileTap={predictionClosed ? {} : { scale: 0.93 }} disabled={predictionClosed} onClick={e => { e.stopPropagation(); vote(item.id, agree, item.agreePercent, item.userVote, item.isDbPost, predictionClosed); }} style={{ flex: 1, padding: 10, borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: predictionClosed ? "not-allowed" : "pointer", border: `2.5px solid ${color}`, background: active ? color : "rgba(255,255,255,0.02)", color: active ? "white" : color, boxShadow: active ? `0 0 16px ${color}60` : "none", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: predictionClosed && !active ? 0.45 : 1 }}>
                            {active ? `✓ ${agree ? "Agreed" : "Disagreed"}` : label}
                            <span style={{ fontSize: 11, fontWeight: 800, background: active ? "rgba(255,255,255,0.2)" : `${color}22`, borderRadius: 999, padding: "1px 7px" }}>{pctVal}%</span>
                          </motion.button>
                        ))}
                      </div>
                      {renderCardActions(item)}
                    </>
                  )}
                  {item.type === "prediction" && (
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        {predictionOptions.slice(0, 2).map((label: string, optionIndex: number) => {
                          const agree = optionIndex === 0;
                          const voteValue = optionIndex === 0 ? "agree" : "disagree";
                          const active = optionIndex === 0 ? userVote === true : userVote === false;
                          const pctVal = optionIndex === 0 ? predAgrPct : predDisAgrPct;
                          return (
                            <motion.button key={label} whileTap={predictionClosed ? {} : { scale: 0.93 }} disabled={predictionClosed} onClick={e => { e.stopPropagation(); vote(item.id, agree, item.agreePercent, item.userVote, item.isDbPost, predictionClosed, voteValue); }} style={{ flex: 1, padding: 10, borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: predictionClosed ? "not-allowed" : "pointer", border: `2.5px solid ${active ? "#ff6b35" : "#8b8b8b"}`, background: active ? "rgba(255,107,53,0.24)" : "rgba(255,255,255,0.02)", color: active ? "#fff" : "#d1d1d1", boxShadow: active ? "0 0 16px rgba(255,107,53,0.35)" : "none", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: predictionClosed && !active ? 0.45 : 1 }}>
                              {label}
                              <span style={{ fontSize: 11, fontWeight: 800, background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", borderRadius: 999, padding: "1px 7px" }}>{pctVal}%</span>
                            </motion.button>
                          );
                        })}
                      </div>
                      {predictionOptions.length > 2 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                          {predictionOptions.slice(2).map((label: string, idx: number) => {
                            const voteValue = `option_${idx + 2}`;
                            const active = userVote === voteValue;
                            const pctVal = predictionPct(optionCounts[voteValue] ?? 0);
                            return (
                              <button key={`${label}-${idx}`} type="button" disabled={predictionClosed} onClick={(e) => { e.stopPropagation(); vote(item.id, false, item.agreePercent, item.userVote, item.isDbPost, predictionClosed, voteValue); }} style={{ flex: "1 1 calc(50% - 4px)", minWidth: 0, padding: "9px 10px", borderRadius: 999, border: `2px solid ${active ? "#ff6b35" : "#8b8b8b"}`, color: active ? "#fff" : "#d1d1d1", background: active ? "rgba(255,107,53,0.24)" : "rgba(255,255,255,0.02)", boxShadow: active ? "0 0 16px rgba(255,107,53,0.35)" : "none", fontSize: 13, fontWeight: 700, textAlign: "center", opacity: predictionClosed && !active ? 0.45 : 1, cursor: predictionClosed ? "not-allowed" : "pointer" }}>
                                {label}
                                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", borderRadius: 999, padding: "1px 7px" }}>{pctVal}%</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {predictionClosed && !resolvedAt && isAuthor && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                          {predictionOptions.map((label: string, optionIndex: number) => (
                            <button key={`resolve-${label}-${optionIndex}`} type="button" disabled={resolvingPostId === item.id} onClick={(e) => { e.stopPropagation(); resolvePrediction(item.id, getPredictionVoteValue(optionIndex)); }} style={{ flex: "1 1 calc(50% - 4px)", minWidth: 0, padding: "9px 10px", borderRadius: 12, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 12, fontWeight: 800, cursor: resolvingPostId === item.id ? "wait" : "pointer" }}>
                              Resolve: {label}
                            </button>
                          ))}
                        </div>
                      )}
                      {resolvedAt && (
                        <p style={{ fontSize: 11, color: "#22c55e", fontWeight: 800, marginBottom: 8 }}>
                          Correct answer: {correctVoteLabel}
                        </p>
                      )}
                      <AnimatePresence>
                        {inlineCommentPostId === item.id && (
                          <InlineCommentInput
                            key={`ic-${item.id}`}
                            postId={item.id}
                            onSubmit={handleInlineCommentSubmit}
                            onOpenFull={() => { setInlineCommentPostId(null); onPostClick?.(item); }}
                            accentColor="#22c55e"
                            placeholder="Share your thoughts on this..."
                          />
                        )}
                      </AnimatePresence>
                      {renderCardActions(item)}
                    </div>
                  )}
                  {item.type === "post" && renderCardActions(item)}
                </motion.div>
              );
            }

            if (item.type === "debate") {
              const userVote = votes[item.id];
              const sv = item.userVote;
              const hasVoted = userVote === true || userVote === false || (userVote === undefined && (sv === "agree" || sv === "disagree"));
              const votedA = userVote === true || (userVote === undefined && sv === "agree");
              const votedB = userVote === false || (userVote === undefined && sv === "disagree");
              const liveTotal = (item.agreeCount ?? 0) + (item.disagreeCount ?? 0);
              const agrPct = liveTotal > 0 ? Math.round(((item.agreeCount ?? 0) / liveTotal) * 100) : 50;
              const disAgrPct = 100 - agrPct;
              const isAuthor = isCurrentUserAuthor(item);

              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card" style={{ padding: 16, cursor: "pointer" }} onClick={() => onPostClick?.(item)}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase", background: "rgba(233,30,140,0.12)", color: "var(--accent-magenta)", border: "1px solid rgba(233,30,140,0.25)" }}>⚡ Debate</span>
                    {hasVoted && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: "rgba(233,30,140,0.08)", color: "var(--accent-magenta)", border: "1px solid rgba(233,30,140,0.2)" }}>🗳️ Already Voted</span>}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }} onClick={(e) => { e.stopPropagation(); onFanProfile?.(item.fan); }}>
                    <AvatarWithBadge username={item.fan.username} badge={item.fan.badge} size="sm" avatarUrl={item.fan.avatarUrl} />
                    <div><p style={{ fontWeight: 700, fontSize: 13 }}>{item.fan.username}</p><p style={{ fontSize: 10, color: "var(--text-secondary)" }}>{BADGE_LABELS[item.fan.badge]} · {item.fan.team} • {formatTimeAgo(item.createdAt)}</p></div>
                  </div>
                  {item.text && <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginBottom: 12, color: "var(--text-primary)" }}>{item.text}</p>}
                  <div style={{ display: "flex", gap: 8, alignItems: "stretch", marginBottom: 10 }}>
                    {[{ agree: true, side: item.sideA || "Side A", color: "var(--accent-magenta)", bg: "rgba(233,30,140,0.08)", border: "rgba(233,30,140,0.3)", voted: votedA }, { agree: false, side: item.sideB || "Side B", color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", voted: votedB }].map(({ agree, side, color, bg, border, voted }, idx) => (
                      <React.Fragment key={String(agree)}>
                        {idx === 1 && <div key="vs" style={{ display: "flex", alignItems: "center", padding: "0 4px" }}><span className="font-display" style={{ fontSize: 16, color: "var(--text-muted)" }}>VS</span></div>}
                        <motion.button key={String(agree)} onClick={e => { e.stopPropagation(); if (!hasVoted) vote(item.id, agree, item.agreePercent || 50, item.userVote, item.isDbPost); }} disabled={hasVoted} style={{ flex: 1, padding: 12, borderRadius: 14, textAlign: "center", background: voted ? color : bg, border: `2px solid ${voted ? color : border}`, color: voted ? "white" : "var(--text-primary)", cursor: hasVoted ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: hasVoted && !voted ? 0.35 : 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{voted ? "✓ " : ""}{side}</p>
                        </motion.button>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", borderRadius: 999, overflow: "hidden", height: 6, background: "rgba(255,255,255,0.06)" }}>
                      <div style={{ width: `${agrPct}%`, background: "var(--accent-magenta)", transition: "width 0.4s" }} />
                      <div style={{ width: `${disAgrPct}%`, background: "#60a5fa", transition: "width 0.4s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-magenta)" }}>{agrPct}%</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{fmt(liveTotal)} votes</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>{disAgrPct}%</span>
                    </div>
                  </div>

                  {isAuthor && liveTotal > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={e => { e.stopPropagation(); setVotersPostId(item.id); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        width: "100%", marginBottom: 10,
                        padding: "9px 14px", borderRadius: 12,
                        background: "rgba(233,30,140,0.07)",
                        border: "1px solid rgba(233,30,140,0.22)",
                        cursor: "pointer", color: "var(--accent-magenta, #e91e8c)",
                        fontSize: 12, fontWeight: 700,
                        transition: "background 0.18s",
                      }}
                    >
                      <BarChart2 size={14} />
                      <span>View Votes</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, background: "rgba(233,30,140,0.15)", borderRadius: 999, padding: "1px 8px" }}>
                        {liveTotal}
                      </span>
                    </motion.button>
                  )}

                  <p style={{ fontSize: 11, fontWeight: hasVoted ? 600 : 400, color: hasVoted ? "var(--accent-magenta)" : "var(--text-muted)", marginBottom: 8, fontStyle: hasVoted ? "normal" : "italic" }}>{hasVoted ? "🗳️ You've already voted · thanks!" : "Tap a side to vote · results reveal after voting"}</p>

                  <AnimatePresence>
                    {inlineCommentPostId === item.id && (
                      <InlineCommentInput
                        key={`ic-${item.id}`}
                        postId={item.id}
                        onSubmit={handleInlineCommentSubmit}
                        onOpenFull={() => { setInlineCommentPostId(null); onPostClick?.(item); }}
                        accentColor="var(--accent-magenta)"
                        placeholder="Share your thoughts on this debate..."
                      />
                    )}
                  </AnimatePresence>
                  {renderCardActions(item)}
                </motion.div>
              );
            }

            if (item.type === "raw_reactions") {
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card" style={{ padding: 16, cursor: "pointer" }} onClick={() => onPostClick?.(item)}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase", background: "rgba(0,232,198,0.1)", color: "var(--teal)", border: "1px solid rgba(0,232,198,0.25)" }}>🕰 Raw Reactions</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <AvatarWithBadge username={item.fan.username} badge={item.fan.badge} size="sm" avatarUrl={item.fan.avatarUrl} />
                    <div><p style={{ fontWeight: 700, fontSize: 13 }}>{item.fan.username}</p><p style={{ fontSize: 10, color: "var(--text-secondary)" }}>{BADGE_LABELS[item.fan.badge]} • {formatTimeAgo(item.createdAt)}</p></div>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.55, marginBottom: item.memCtx ? 8 : 0 }}>{item.text}</p>
                  {item.memCtx && <p style={{ fontSize: 12, color: "var(--teal)", fontStyle: "italic", borderLeft: "2px solid var(--teal)", paddingLeft: 10, marginTop: 6 }}>{item.memCtx}</p>}
                  {item.memGifUrl && <img src={item.memGifUrl} alt="" style={{ width: "100%", maxHeight: 180, borderRadius: 10, objectFit: "cover", marginTop: 8 }} />}
                  {item.memTag && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", marginTop: 6, display: "inline-block" }}>#{item.memTag}</span>}
                  <p style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500, marginTop: 10 }}>{fmt(item.fanCount ?? 0)} fans · {item.replies ?? 0} replies</p>
                  {renderCardActions(item)}
                </motion.div>
              );
            }

            return null;
          })}

          {/* ── Infinite-scroll sentinel + spinner ──────────────────────────────
              No "load more" button, no end-of-feed text. The sentinel sits
              right after the last post; once it's near the viewport the
              IntersectionObserver above fires loadMorePosts(). The spinner
              only shows while a fetch is actually in flight — otherwise this
              div is just an empty trigger and nothing is visible. */}
          {hasMore && (
            <div ref={sentinelRef} style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
              {loadingMore && (
                <div
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.1)",
                    borderTop: "3px solid #E91E8C",
                    animation: "roar-spin 0.8s linear infinite",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM COMPOSER ── */}
      <div style={{ flexShrink: 0, zIndex: 40, background: "rgba(14,14,20,0.98)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.07)", paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        <div className="flex gap-1.5 py-1 px-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {COMPOSE_ACTIONS.map(({ id, label, Icon }) => {
            const isActive = id === selectedActionId;
            return (
              <button key={id} type="button" onClick={() => { if (id === "post") { setSelectedActionId("post"); } else { setSelectedActionId(id); onQuickCompose?.(id); setSelectedActionId("post"); } }} className={["flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all duration-150 cursor-pointer shrink-0", isActive ? "border-[rgba(233,30,140,0.35)] bg-[rgba(233,30,140,0.12)] text-white" : "border-transparent bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.6)]"].join(" ")}>
                <Icon size={13} />{label}
              </button>
            );
          })}
        </div>
        {attachedUrl && (
          <div className="px-3 py-2 mx-3 mb-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex justify-between items-center">
            <div className="flex items-center gap-2">
              {attachedType === "image" ? <img src={attachedUrl} className="w-10 h-10 rounded-lg object-cover" alt="Attached" /> : <video src={attachedUrl} className="w-10 h-10 rounded-lg object-cover" />}
              <span className="text-xs text-[var(--text-secondary)]">Media attached</span>
            </div>
            <button type="button" onClick={() => { setAttachedUrl(null); setAttachedType(null); }} className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer">✕</button>
          </div>
        )}
        <div className="flex gap-2 items-center px-3 pt-1 pb-2">
          <button type="button" onClick={() => triggerUpload("image")} disabled={uploading} className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer flex items-center p-1 shrink-0">
            <ImageIcon size={20} />
          </button>
          <div className="flex-1 relative">
            {input === "" && !uploading && (
              <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                <span className="text-sm font-medium text-[rgba(255,255,255,0.35)]">Drop your take...</span>
              </div>
            )}
            <input type="text" disabled={uploading} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendQuickPost()} className="w-full h-11 rounded-[22px] bg-[var(--bg-secondary)] border border-[var(--border)] pl-4 pr-4 text-white text-base outline-none" />
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={sendQuickPost} disabled={uploading} className={["w-11 h-11 rounded-full border-none text-white text-lg font-bold flex items-center justify-center cursor-pointer shrink-0", "bg-[linear-gradient(135deg,#e91e8c,#ff6b35)]", uploading ? "opacity-50" : "opacity-100"].join(" ")}>↑</motion.button>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <VotersDialog
        postId={votersPostId ?? ""}
        isOpen={votersPostId !== null}
        onClose={() => setVotersPostId(null)}
      />

      <ReactionsDialog
        postId={reactionsPostId ?? ""}
        isOpen={reactionsPostId !== null}
        onClose={() => setReactionsPostId(null)}
        onFanProfile={onFanProfile}
      />

      <style dangerouslySetInnerHTML={{ __html: `@keyframes roar-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` }} />
    </div>
  );
}

