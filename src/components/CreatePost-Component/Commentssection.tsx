"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Reply, Trash2, ChevronDown, ChevronUp, Send, Loader2, Smile } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

// ─── Emoji Picker Data ────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
    {
        label: "😊 Smileys",
        emojis: [
            "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊",
            "😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋",
            "😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐",
            "😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤",
            "😴","😷","🤒","🤕","🤧","🥵","🥶","🥴","😵","🤯",
            "😎","🥸","🤓","🧐","😕","😟","🙁","😮","😯","😲",
            "😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱",
            "😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠",
        ],
    },
    {
        label: "👋 Gestures",
        emojis: [
            "👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌","🤞",
            "🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝","👍",
            "👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🙏",
            "✍","💅","🤳","💪","🦾","🦵","🦶","👂","🦻","👃",
        ],
    },
    {
        label: "❤️ Hearts",
        emojis: [
            "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
            "❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️",
            "✝️","☪️","🕉","✡️","🔯","🪯","☯️","☦️","🛐","⛎",
        ],
    },
    {
        label: "🎉 Celebration",
        emojis: [
            "🎉","🎊","🎈","🎁","🎀","🎗","🎟","🎫","🏆","🥇",
            "🥈","🥉","🏅","🎖","🎪","🎭","🎨","🎬","🎤","🎧",
            "🎼","🎵","🎶","🎷","🎸","🎹","🎺","🎻","🥁","🪘",
            "🪗","🪕","🎲","🎯","🎳","🎮","🕹","🎰","🧩","🪅",
        ],
    },
    {
        label: "🐶 Animals",
        emojis: [
            "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
            "🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧",
            "🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄",
            "🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷","🦂",
        ],
    },
    {
        label: "🍕 Food",
        emojis: [
            "🍎","🍊","🍋","🍇","🍓","🫐","🍈","🍑","🍒","🥭",
            "🍍","🥝","🍅","🥑","🫒","🍆","🥦","🥕","🌽","🍄",
            "🧄","🧅","🥔","🍞","🥐","🥖","🫓","🧀","🥚","🍳",
            "🧈","🥞","🧇","🥓","🍔","🍟","🌭","🫔","🌮","🌯",
            "🍕","🫕","🥙","🧆","🥚","🍿","🧂","🥫","🍱","🍘",
        ],
    },
    {
        label: "⚽ Sports",
        emojis: [
            "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱",
            "🪀","🏓","🏸","🏒","🥍","🏑","🏏","🪃","🥅","⛳",
            "🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷",
            "⛸","🥌","🎿","⛷","🏂","🪂","🏋","🤼","🤸","⛹",
        ],
    },
    {
        label: "🚀 Travel",
        emojis: [
            "🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐",
            "🛻","🚚","🚛","🚜","🏍","🛵","🛺","🚲","🛴","🛹",
            "🚁","🛸","🚀","✈️","🛩","🛫","🛬","⛵","🚢","🛳",
            "🚂","🚃","🚄","🚅","🚆","🚇","🚈","🚉","🚊","🚝",
        ],
    },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Comment {
    id: string;
    commentText: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    userEmail?: string;
    parentCommentId?: string;
    likes: number;
    likedBy: string[];
    replyCount?: number;
    createdAt: number;
    updatedAt: number;
}

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 8 }: { name: string; avatar?: string; size?: number }) {
    const sizeClass = `w-${size} h-${size}`;
    if (avatar) {
        return <img src={avatar} alt={name} className={`${sizeClass} rounded-full object-cover flex-shrink-0`} />;
    }
    const initials = name.slice(0, 2).toUpperCase();
    const colors = ["bg-pink-600", "bg-purple-600", "bg-blue-600", "bg-green-600", "bg-orange-600", "bg-red-600"];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <div
            className={`${sizeClass} ${color} rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold`}
            style={{ fontSize: size < 8 ? "10px" : "13px" }}
        >
            {initials}
        </div>
    );
}

// ─── Emoji Picker ─────────────────────────────────────────────────────────────
interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    const [activeCategory, setActiveCategory] = useState(0);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    return (
        <div
            ref={pickerRef}
            className="absolute bottom-full left-0 mb-2 z-50 w-72 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{
                background: "rgba(20, 20, 24, 0.98)",
                backdropFilter: "blur(20px)",
            }}
        >
            {/* Category Tabs */}
            <div className="flex items-center gap-0.5 px-2 pt-2 pb-1 border-b border-white/8 overflow-x-auto scrollbar-hide">
                {EMOJI_CATEGORIES.map((cat, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveCategory(i)}
                        title={cat.label}
                        className={`flex-shrink-0 text-base px-1.5 py-1 rounded-lg transition-colors ${
                            activeCategory === i
                                ? "bg-[#C9115F]/20 text-white"
                                : "text-white/40 hover:text-white/80 hover:bg-white/5"
                        }`}
                    >
                        {cat.emojis[0]}
                    </button>
                ))}
            </div>

            {/* Category Label */}
            <div className="px-3 pt-2 pb-1">
                <span className="text-white/30 text-xs font-medium">
                    {EMOJI_CATEGORIES[activeCategory].label}
                </span>
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-8 gap-0.5 px-2 pb-2 max-h-48 overflow-y-auto scrollbar-hide">
                {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(emoji)}
                        className="flex items-center justify-center w-8 h-8 text-xl rounded-lg hover:bg-white/10 transition-colors active:scale-90"
                        title={emoji}
                    >
                        {emoji}
                    </button>
                ))}
            </div>

            {/* Arrow pointer */}
            <div
                className="absolute left-6 -bottom-1.5 w-3 h-3 rotate-45 border-r border-b border-white/10"
                style={{ background: "rgba(20,20,24,0.98)" }}
            />
        </div>
    );
}

// ─── Comment Row ──────────────────────────────────────────────────────────────
function CommentRow({
    comment, currentUserId, onLike, onDelete, onReply, isReply = false, parentCommentId,
}: {
    comment: Comment;
    currentUserId: string;
    onLike: (commentId: string, isReply: boolean, parentCommentId?: string) => void;
    onDelete: (commentId: string, parentCommentId?: string) => void;
    onReply: (commentId: string, userName: string) => void;
    isReply?: boolean;
    parentCommentId?: string;
}) {
    const isLiked = comment.likedBy?.includes(currentUserId);
    const isOwner = comment.userId === currentUserId;

    return (
        <div className={`flex gap-3 ${isReply ? "pl-10" : ""}`}>
            <Avatar name={comment.userName} avatar={comment.userAvatar} size={isReply ? 6 : 8} />
            <div className="flex-1 min-w-0">
                <div className="bg-white/5 rounded-2xl px-3 py-2.5">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-sm font-semibold leading-tight truncate">{comment.userName}</span>
                        <span className="text-white/30 text-xs flex-shrink-0">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed break-words">{comment.commentText}</p>
                </div>
                <div className="flex items-center gap-4 mt-1 px-1">
                    <button
                        onClick={() => onLike(comment.id, isReply, parentCommentId)}
                        className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? "text-[#C9115F]" : "text-white/40 hover:text-white/70"}`}
                    >
                        <Heart className="w-3.5 h-3.5" fill={isLiked ? "currentColor" : "none"} />
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                    </button>
                    {!isReply && (
                        <button
                            onClick={() => onReply(comment.id, comment.userName)}
                            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                        >
                            <Reply className="w-3.5 h-3.5" />
                            Reply
                        </button>
                    )}
                    {isOwner && (
                        <button
                            onClick={() => onDelete(comment.id, parentCommentId)}
                            className="flex items-center gap-1 text-xs text-white/25 hover:text-red-400 transition-colors ml-auto"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Comment Thread ───────────────────────────────────────────────────────────
function CommentThread({
    comment, currentUserId, replies, onLike, onDelete, onReply, onLoadReplies,
}: {
    comment: Comment;
    currentUserId: string;
    replies: Comment[];
    onLike: (commentId: string, isReply: boolean, parentCommentId?: string) => void;
    onDelete: (commentId: string, parentCommentId?: string) => void;
    onReply: (commentId: string, userName: string) => void;
    onLoadReplies: (commentId: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const hasReplies = (comment.replyCount || 0) > 0;

    const handleToggleReplies = () => {
        if (!expanded && replies.length === 0) onLoadReplies(comment.id);
        setExpanded((v) => !v);
    };

    return (
        <div className="flex flex-col gap-2">
            <CommentRow
                comment={comment}
                currentUserId={currentUserId}
                onLike={onLike}
                onDelete={onDelete}
                onReply={onReply}
            />
            {hasReplies && (
                <button
                    onClick={handleToggleReplies}
                    className="flex items-center gap-1.5 ml-9 text-xs text-[#C9115F] hover:text-[#e8185a] transition-colors w-fit"
                >
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded
                        ? "Hide"
                        : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
                </button>
            )}
            {expanded && replies.length > 0 && (
                <div className="flex flex-col gap-3 mt-1">
                    {replies.map((reply) => (
                        <CommentRow
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            onLike={onLike}
                            onDelete={onDelete}
                            onReply={onReply}
                            isReply
                            parentCommentId={comment.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
    contentId: string;
    contentType: "article" | "post";
    contentTitle?: string;
    className?: string;
    onCommentAdded?: () => void;
    onCommentDeleted?: () => void;
    onCommentCountLoaded?: (count: number) => void;
}

export default function CommentsSection({
    contentId,
    contentType,
    contentTitle,
    className = "",
    onCommentAdded,
    onCommentDeleted,
    onCommentCountLoaded,
}: Props) {
    const { user, getUserDisplayName, user: authUser } = useAuth();

    const [comments, setComments] = useState<Comment[]>([]);
    const [replies, setReplies] = useState<Record<string, Comment[]>>({});
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [text, setText] = useState("");
    const [replyTo, setReplyTo] = useState<{ commentId: string; userName: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const lastDocIdRef = useRef<string | null>(null);
    const countReportedRef = useRef(false);

    const currentUserId = authUser?.userId || authUser?.email || "";
    const displayName = user ? getUserDisplayName() : "Guest";

    // ── Insert emoji at cursor position ───────────────────────────────────────
    const handleEmojiSelect = useCallback((emoji: string) => {
        const input = inputRef.current;
        if (!input) {
            setText((prev) => prev + emoji);
            setShowEmojiPicker(false);
            return;
        }

        const start = input.selectionStart ?? text.length;
        const end = input.selectionEnd ?? text.length;
        const newText = text.slice(0, start) + emoji + text.slice(end);
        setText(newText);
        setShowEmojiPicker(false);

        // Restore cursor position after the inserted emoji
        requestAnimationFrame(() => {
            input.focus();
            const newPos = start + emoji.length;
            input.setSelectionRange(newPos, newPos);
        });
    }, [text]);

    const fetchComments = useCallback(async (reset = false, signal?: AbortSignal) => {
        setLoading(true);
        try {
            if (reset) lastDocIdRef.current = null;
            const cursor = lastDocIdRef.current ? `&lastDocId=${lastDocIdRef.current}` : "";
            const url = `/api/comments?contentId=${contentId}&contentType=${contentType}&limit=20${cursor}`;
            const res = await axios.get(url, { signal });
            const data = res.data;

            if (data.success) {
                const newComments: Comment[] = data.comments ?? [];
                setComments((prev) => {
                    const next = reset ? newComments : [...prev, ...newComments];
                    if (reset && !countReportedRef.current) {
                        countReportedRef.current = true;
                        const total = data.pagination?.total ?? next.length;
                        onCommentCountLoaded?.(total);
                    }
                    return next;
                });
                setHasMore(data.pagination?.hasMore ?? false);
                if (newComments.length > 0) {
                    lastDocIdRef.current = newComments[newComments.length - 1].id;
                }
            }
        } catch (error: unknown) {
            if (axios.isCancel(error) || (error instanceof Error && error.name === "CanceledError")) return;
            console.error("[CommentsSection] fetch failed:", error);
        } finally {
            setLoading(false);
        }
    }, [contentId, contentType, onCommentCountLoaded]);

    useEffect(() => {
        const controller = new AbortController();
        lastDocIdRef.current = null;
        countReportedRef.current = false;
        fetchComments(true, controller.signal);
        return () => controller.abort();
    }, [contentId, contentType]);

    const fetchReplies = useCallback(async (commentId: string) => {
        try {
            const res = await axios.get(`/api/comments?parentCommentId=${commentId}&limit=20`);
            const data = res.data;
            if (data.success) {
                setReplies((prev) => ({ ...prev, [commentId]: data.comments }));
            }
        } catch (error) {
            console.error("[CommentsSection] fetch replies failed:", error);
        }
    }, []);

    const postComment = useCallback(async (commentData: {
        commentText: string;
        userId: string;
        userName: string;
        userEmail?: string;
        parentCommentId?: string;
    }) => {
        const res = await axios.post(`/api/comments`, {
            ...commentData,
            contentType,
            contentId,
            contentTitle: contentTitle || "",
        });
        const data = res.data;

        if (data.success) {
            const newComment = data.comment;
            if (commentData.parentCommentId) {
                setReplies((prev) => ({
                    ...prev,
                    [commentData.parentCommentId!]: [
                        ...(prev[commentData.parentCommentId!] || []),
                        newComment,
                    ],
                }));
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === commentData.parentCommentId
                            ? { ...c, replyCount: (c.replyCount || 0) + 1 }
                            : c
                    )
                );
            } else {
                setComments((prev) => [newComment, ...prev]);
                onCommentAdded?.();
            }
        }
        return data;
    }, [contentId, contentType, contentTitle, onCommentAdded]);

    const toggleLike = useCallback(async (
        commentId: string, userId: string, isReply: boolean, parentCommentId?: string
    ) => {
        try {
            const res = await axios.post(`/api/comments/${commentId}/like`, { userId });
            const data = res.data;
            if (data.success) {
                const updated = data.comment;
                if (isReply && parentCommentId) {
                    setReplies((prev) => ({
                        ...prev,
                        [parentCommentId]: prev[parentCommentId]?.map((c) =>
                            c.id === commentId ? updated : c
                        ) || [],
                    }));
                } else {
                    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
                }
            }
        } catch (error) {
            console.error("[CommentsSection] like failed:", error);
        }
    }, []);

    const deleteComment = useCallback(async (
        commentId: string, userId: string, parentCommentId?: string
    ) => {
        try {
            const res = await axios.delete(`/api/comments/${commentId}`, { data: { userId } });
            const data = res.data;
            if (data.success) {
                if (parentCommentId) {
                    setReplies((prev) => ({
                        ...prev,
                        [parentCommentId]: prev[parentCommentId]?.filter((c) => c.id !== commentId) || [],
                    }));
                    setComments((prev) =>
                        prev.map((c) =>
                            c.id === parentCommentId
                                ? { ...c, replyCount: Math.max(0, (c.replyCount || 0) - 1) }
                                : c
                        )
                    );
                } else {
                    setComments((prev) => prev.filter((c) => c.id !== commentId));
                    onCommentDeleted?.();
                }
            }
        } catch (error) {
            console.error("[CommentsSection] delete failed:", error);
        }
    }, [onCommentDeleted]);

    const handleReply = (commentId: string, userName: string) => {
        setReplyTo({ commentId, userName });
        setText(`@${userName} `);
        inputRef.current?.focus();
    };

    const handleSubmit = async () => {
        if (!text.trim() || !user) return;
        setSubmitting(true);
        try {
            await postComment({
                commentText: text.trim(),
                userId: user.userId || user.email,
                userName: getUserDisplayName(),
                userEmail: user.email,
                parentCommentId: replyTo?.commentId,
            });
            setText("");
            setReplyTo(null);
        } catch (err) {
            console.error("[CommentsSection] submit failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = (commentId: string, isReply: boolean, parentCommentId?: string) => {
        if (!user) return;
        toggleLike(commentId, user.userId || user.email, isReply, parentCommentId);
    };

    const handleDelete = async (commentId: string, parentCommentId?: string) => {
        if (!user) return;
        await deleteComment(commentId, user.userId || user.email, parentCommentId);
    };

    return (
        <div className={`flex w-full max-w-full flex-col gap-4 overflow-visible ${className}`}>
            {/* ── Input Row ─────────────────────────────────────────────────── */}
            <div className="flex items-start gap-2 w-full min-w-0">
                <Avatar name={displayName} size={8} />
                <div className="flex-1 min-w-0 relative">
                    {replyTo && (
                        <div className="flex items-center gap-1 mb-1 text-xs text-[#C9115F]">
                            <Reply className="w-3 h-3" />
                            Replying to @{replyTo.userName}
                            <button
                                onClick={() => { setReplyTo(null); setText(""); }}
                                className="ml-1 text-white/30 hover:text-white/60"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-1 bg-white/8 rounded-2xl border border-white/10 focus-within:border-[#C9115F]/50 transition-colors overflow-visible pr-1 w-full min-w-0">
                        <input
                            ref={inputRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                                // Close picker on Escape
                                if (e.key === "Escape") setShowEmojiPicker(false);
                            }}
                            placeholder={user ? "Add a comment…" : "Sign in to comment"}
                            disabled={!user || submitting}
                            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none disabled:opacity-50"
                        />

                        {/* Emoji Trigger */}
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker((v) => !v)}
                            disabled={!user}
                            className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${
                                showEmojiPicker
                                    ? "bg-[#C9115F]/20 text-[#C9115F]"
                                    : "hover:bg-white/10 text-white/30 hover:text-white/60"
                            }`}
                            title="Add emoji"
                        >
                            <Smile className="w-4 h-4" />
                        </button>

                        {/* Send */}
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim() || !user || submitting}
                            className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 enabled:hover:bg-[#C9115F]/20 enabled:text-[#C9115F] text-white/30"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    {/* Emoji Picker Popover */}
                    {showEmojiPicker && (
                        <EmojiPicker
                            onSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}
                </div>
            </div>

            {/* ── Comments List ─────────────────────────────────────────────── */}
            {loading && comments.length === 0 ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-white/25 text-sm text-center py-2">No comments yet. Be the first!</p>
            ) : (
                <div className="flex flex-col gap-4 w-full max-w-full overflow-visible">
                    {comments.map((comment) => (
                        <CommentThread
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            replies={replies[comment.id] || []}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            onReply={handleReply}
                            onLoadReplies={fetchReplies}
                        />
                    ))}
                    {hasMore && (
                        <button
                            onClick={() => fetchComments(false)}
                            disabled={loading}
                            className="text-white/40 text-sm hover:text-white/70 transition-colors text-center py-1"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                                "Load more comments"
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}