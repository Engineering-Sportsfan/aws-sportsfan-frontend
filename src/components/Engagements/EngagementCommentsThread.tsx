"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart, MessageSquare, Reply, Send, Trash2, ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import axios from "axios";
import { useUserProfile } from "@/context/UserProfileContext";

export interface ThreadComment {
    id: string;
    engagementId: string;
    text: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    createdAt: number;
    likes: number;
    likedBy?: string[];
    parentCommentId?: string | null;
    replies?: ThreadComment[];
}

interface Props {
    engagementId: string;
    matchId?: string;
    accentColor?: string;
    onCommentCountChange?: (count: number) => void;
}

function timeAgo(ts: number): string {
    const diff = Math.max(0, Date.now() - ts);
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
}

// Maps API shape (authorUid / authorUsername / likesCount / parentId) -> UI shape
function normalize(c: any): ThreadComment {
    return {
        id: String(c.id || c.commentId || c._id),
        engagementId: c.engagementId,
        text: c.text || "",
        userId: String(c.authorUid || c.userId || ""),
        userName: c.authorUsername || c.userName || c.username || "Fan",
        userAvatar: c.authorAvatarUrl || c.userAvatar || c.avatarUrl || "",
        createdAt: Number(c.createdAt) || Date.now(),
        likes: Number(c.likesCount ?? c.likes) || 0,
        likedBy: Array.isArray(c.likedBy) ? c.likedBy : [],
        parentCommentId: c.parentId || c.parentCommentId || null,
        replies: Array.isArray(c.replies) ? c.replies.map(normalize) : [],
    };
}

const countTotal = (list: ThreadComment[]) =>
    list.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

export default function EngagementCommentsThread({ engagementId, matchId, accentColor = "#e91e8c", onCommentCountChange }: Props) {
    const { userProfile } = useUserProfile();
    const currentUserId = userProfile?.actualUserId || userProfile?.email || "guest_fan";
    const currentUserName = userProfile?.username || userProfile?.name || "SportsFan";
    const currentUserAvatar = userProfile?.avatarUrl || userProfile?.avatar || "";

    const [comments, setComments] = useState<ThreadComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<{ commentId: string; userName: string } | null>(null);
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

    const inputRef = useRef<HTMLInputElement>(null);
    const storageKey = `sf_eng_comments_${engagementId}`;

    // Keep latest callback in a ref so it never retriggers effects
    const onCountRef = useRef(onCommentCountChange);
    useEffect(() => { onCountRef.current = onCommentCountChange; });
    const loadedRef = useRef(false);

    // ── Load ONCE per engagement ──
    useEffect(() => {
        let cancelled = false;
        loadedRef.current = false;
        (async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/engagements/${encodeURIComponent(engagementId)}/comments`, {
                    params: matchId ? { matchId } : undefined,
                    timeout: 8000,
                });
                if (cancelled) return;
                if (res.data?.success && Array.isArray(res.data.comments)) {
                    loadedRef.current = true;
                    setComments(res.data.comments.map(normalize));
                }
            } catch {
                if (cancelled) return;
                try {
                    const cached = JSON.parse(localStorage.getItem(storageKey) || "[]");
                    if (Array.isArray(cached)) setComments(cached.map(normalize));
                } catch { /* ignore */ }
                loadedRef.current = true;
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [engagementId, matchId, storageKey]);

    // Report count to parent only when comments actually change (after first load)
    useEffect(() => {
        if (!loadedRef.current) return;
        onCountRef.current?.(countTotal(comments));
        try { localStorage.setItem(storageKey, JSON.stringify(comments)); } catch { /* ignore */ }
    }, [comments, storageKey]);

    // ── Send comment / reply ──
    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = inputText.trim();
        if (!text || submitting) return;

        setSubmitting(true);
        const parentId = replyTo?.commentId || null;
        const tempId = `tmp_${Date.now()}`;
        const optimistic: ThreadComment = {
            id: tempId, engagementId, text, userId: currentUserId, userName: currentUserName,
            userAvatar: currentUserAvatar, createdAt: Date.now(), likes: 0, likedBy: [],
            parentCommentId: parentId, replies: [],
        };

        setComments(prev =>
            parentId
                ? prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies || []), optimistic] } : c)
                : [optimistic, ...prev]
        );
        if (parentId) setExpandedReplies(p => ({ ...p, [parentId]: true }));
        setInputText("");
        setReplyTo(null);

        try {
            const res = await axios.post(
                `/api/engagements/${encodeURIComponent(engagementId)}/comments`,
                {
                    text,
                    parentId,
                    authorUid: currentUserId,
                    authorUsername: currentUserName,
                    authorAvatarUrl: currentUserAvatar,
                    matchId,
                },
                { timeout: 8000 }
            );
            const saved = res.data?.comment ? normalize(res.data.comment) : null;
            if (saved) {
                // swap temp -> real (no refetch, no flicker)
                setComments(prev => prev.map(c => {
                    if (c.id === tempId) return { ...saved, replies: c.replies };
                    if (c.id === parentId) return { ...c, replies: (c.replies || []).map(r => r.id === tempId ? saved : r) };
                    return c;
                }));
            }
        } catch {
            // rollback
            setComments(prev =>
                prev.filter(c => c.id !== tempId).map(c => ({ ...c, replies: (c.replies || []).filter(r => r.id !== tempId) }))
            );
            setInputText(text);
        } finally {
            setSubmitting(false);
        }
    };

    // NOTE: no comment-like / delete endpoints exist yet, so these are local-only.
    const toggleLike = (commentId: string, parentId?: string) => {
        const flip = (c: ThreadComment): ThreadComment => {
            const liked = (c.likedBy || []).includes(currentUserId);
            return {
                ...c,
                likes: Math.max(0, c.likes + (liked ? -1 : 1)),
                likedBy: liked ? (c.likedBy || []).filter(u => u !== currentUserId) : [...(c.likedBy || []), currentUserId],
            };
        };
        setComments(prev => prev.map(c => {
            if (!parentId && c.id === commentId) return flip(c);
            if (parentId && c.id === parentId) return { ...c, replies: (c.replies || []).map(r => r.id === commentId ? flip(r) : r) };
            return c;
        }));
    };

    const handleDelete = (commentId: string, parentId?: string) => {
        setComments(prev =>
            parentId
                ? prev.map(c => c.id === parentId ? { ...c, replies: (c.replies || []).filter(r => r.id !== commentId) } : c)
                : prev.filter(c => c.id !== commentId)
        );
    };

    return (
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/80 flex items-center gap-1.5 uppercase tracking-wide">
                    <MessageSquare size={13} className="text-[#e91e8c]" />
                    Comments ({countTotal(comments)})
                </span>
            </div>

            <form onSubmit={handleSend} className="relative flex flex-col gap-1.5">
                {replyTo && (
                    <div className="flex items-center justify-between text-[10px] text-white/70 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        <span className="flex items-center gap-1">
                            <CornerDownRight size={11} className="text-[#e91e8c]" />
                            Replying to <strong className="text-white">@{replyTo.userName}</strong>
                        </span>
                        <button type="button" onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white">✕ Cancel</button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={replyTo ? `Reply to @${replyTo.userName}...` : "Write a comment..."}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#e91e8c]"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || submitting}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] text-white text-xs font-bold flex items-center gap-1 disabled:opacity-40 shrink-0"
                    >
                        <Send size={12} /><span>Send</span>
                    </button>
                </div>
            </form>

            {loading && comments.length === 0 ? (
                <div className="text-center py-2 text-[10px] text-white/40 italic">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-center py-3 text-[11px] text-white/40">No comments yet. Start the conversation!</div>
            ) : (
                <div className="flex flex-col gap-2 mt-1">
                    {comments.map((comment) => {
                        const isLiked = (comment.likedBy || []).includes(currentUserId);
                        const replies = comment.replies || [];
                        const open = expandedReplies[comment.id] ?? false;
                        return (
                            <div key={comment.id} className="flex flex-col gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                                <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/10">
                                        {comment.userAvatar ? (
                                            <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-[#e91e8c] to-[#ff6b35]">
                                                {comment.userName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <span className="text-[11px] font-bold text-white truncate">{comment.userName}</span>
                                            <span className="text-[9px] text-white/35 shrink-0">{timeAgo(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-[11px] text-white/85 leading-relaxed break-words">{comment.text}</p>
                                        <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                                            <button type="button" onClick={() => toggleLike(comment.id)}
                                                className={`flex items-center gap-1 ${isLiked ? "text-[#e91e8c] font-bold" : "text-white/45 hover:text-white/80"}`}>
                                                <Heart size={11} fill={isLiked ? "currentColor" : "none"} /><span>{comment.likes}</span>
                                            </button>
                                            <button type="button"
                                                onClick={() => { setReplyTo({ commentId: comment.id, userName: comment.userName }); inputRef.current?.focus(); }}
                                                className="flex items-center gap-1 text-white/45 hover:text-white/80">
                                                <Reply size={11} /><span>Reply</span>
                                            </button>
                                            {comment.userId === currentUserId && (
                                                <button type="button" onClick={() => handleDelete(comment.id)} className="text-white/25 hover:text-red-400 ml-auto">
                                                    <Trash2 size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {replies.length > 0 && (
                                    <button type="button" onClick={() => setExpandedReplies(p => ({ ...p, [comment.id]: !open }))}
                                        className="flex items-center gap-1 ml-7 text-[10px] text-[#e91e8c] hover:underline font-semibold">
                                        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                        <span>{open ? "Hide replies" : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}</span>
                                    </button>
                                )}

                                {open && replies.length > 0 && (
                                    <div className="flex flex-col gap-1.5 ml-7 pl-2.5 border-l-2 border-[#e91e8c]/30 mt-1">
                                        {replies.map((reply) => {
                                            const rLiked = (reply.likedBy || []).includes(currentUserId);
                                            return (
                                                <div key={reply.id} className="flex items-start gap-2 bg-white/[0.02] p-2 rounded-lg">
                                                    <div className="w-5 h-5 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/10">
                                                        {reply.userAvatar ? (
                                                            <img src={reply.userAvatar} alt={reply.userName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white bg-white/20">
                                                                {reply.userName.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <span className="text-[10px] font-bold text-white truncate">{reply.userName}</span>
                                                            <span className="text-[9px] text-white/35 shrink-0">{timeAgo(reply.createdAt)}</span>
                                                        </div>
                                                        <p className="text-[10px] text-white/80 leading-relaxed break-words">{reply.text}</p>
                                                        <div className="flex items-center gap-3 mt-1 text-[9px]">
                                                            <button type="button" onClick={() => toggleLike(reply.id, comment.id)}
                                                                className={`flex items-center gap-1 ${rLiked ? "text-[#e91e8c] font-bold" : "text-white/45 hover:text-white/80"}`}>
                                                                <Heart size={10} fill={rLiked ? "currentColor" : "none"} /><span>{reply.likes}</span>
                                                            </button>
                                                            {reply.userId === currentUserId && (
                                                                <button type="button" onClick={() => handleDelete(reply.id, comment.id)} className="text-white/25 hover:text-red-400 ml-auto">
                                                                    <Trash2 size={10} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}