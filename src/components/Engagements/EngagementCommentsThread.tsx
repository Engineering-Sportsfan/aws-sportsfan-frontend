"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
    engagementId?: string;
    roomId?: string;
    postId?: string;
    matchId?: string;
    accentColor?: string;
    currentAvatarUrl?: string;
    currentUserId?: string;
    currentUsername?: string;
    onFanProfile?: (fan: any) => void;
    onCommentCountChange?: (count: number) => void;
}

function timeAgo(ts?: number | string): string {
    if (!ts) return "now";
    const date = typeof ts === "number" ? ts : new Date(ts).getTime();
    if (isNaN(date)) return "now";
    const diff = Math.max(0, Date.now() - date);
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
}

// Maps API shapes (DynamoDB RealTimeChat, SocialAndContent, Firestore) -> UI shape
function normalize(c: any): ThreadComment {
    const rawLikes = Number(c.likesCount ?? c.heartCount ?? c.likes ?? 0);
    const rawLikedBy = Array.isArray(c.likedBy) ? c.likedBy : [];
    const isLikedByUser = c.userReaction === "heart";

    return {
        id: String(c.id || c.commentId || c._id || `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
        engagementId: String(c.engagementId || c.postId || ""),
        text: String(c.text || ""),
        userId: String(c.authorUid || c.userId || ""),
        userName: String(c.authorUsername || c.userName || c.username || "Fan"),
        userAvatar: c.authorAvatarUrl || c.userAvatar || c.avatarUrl || "",
        createdAt: Number(c.createdAt) || Date.now(),
        likes: rawLikes,
        likedBy: isLikedByUser && rawLikedBy.length === 0 ? ["me"] : rawLikedBy,
        parentCommentId: c.parentId ? String(c.parentId).replace(/^COMMENT#/, "").trim() : (c.parentCommentId || null),
        replies: Array.isArray(c.replies) ? c.replies.map(normalize) : [],
    };
}

// ── Recursive Tree helpers (support infinite nesting depth) ──

function flatten(list: ThreadComment[]): ThreadComment[] {
    const out: ThreadComment[] = [];
    const walk = (nodes: ThreadComment[]) => {
        for (const n of nodes) {
            out.push({ ...n, replies: [] });
            if (n.replies?.length) walk(n.replies);
        }
    };
    walk(list);
    return out;
}

// Builds the multi-level tree from parentCommentId links. Works for any nesting depth.
function buildTree(list: ThreadComment[]): ThreadComment[] {
    const flat = flatten(list);
    const byId = new Map<string, ThreadComment>();
    const userToCommentId = new Map<string, string>();

    for (const c of flat) {
        if (!byId.has(c.id)) {
            byId.set(c.id, { ...c, replies: [] });
        }
        if (!c.parentCommentId && c.userName) {
            userToCommentId.set(c.userName.toLowerCase(), c.id);
        }
    }
    const nodes = Array.from(byId.values());

    const roots: ThreadComment[] = [];
    for (const c of nodes) {
        let parent: ThreadComment | undefined;
        if (c.parentCommentId) {
            parent = byId.get(c.parentCommentId);
        } else {
            // @mention fallback if parentCommentId was not saved
            const match = (c.text || "").match(/^@([a-zA-Z0-9_.\s]+?)(?:\s|$)/);
            if (match) {
                const targetName = match[1].trim().toLowerCase();
                const priorId = userToCommentId.get(targetName);
                if (priorId && priorId !== c.id) {
                    parent = byId.get(priorId);
                }
            }
        }

        if (parent && parent.id !== c.id) {
            parent.replies = [...(parent.replies || []), c];
        } else {
            roots.push(c);
        }
    }

    const sortReplies = (c: ThreadComment) => {
        c.replies = (c.replies || []).sort((a, b) => a.createdAt - b.createdAt);
        c.replies.forEach(sortReplies);
    };
    roots.forEach(sortReplies);
    return roots.sort((a, b) => b.createdAt - a.createdAt);
}

export const countTotal = (list: ThreadComment[]): number =>
    list.reduce((acc, c) => acc + 1 + countTotal(c.replies || []), 0);

const updateNode = (list: ThreadComment[], id: string, fn: (c: ThreadComment) => ThreadComment): ThreadComment[] =>
    list.map(c => (c.id === id ? fn(c) : { ...c, replies: updateNode(c.replies || [], id, fn) }));

const removeNode = (list: ThreadComment[], id: string): ThreadComment[] =>
    list.filter(c => c.id !== id).map(c => ({ ...c, replies: removeNode(c.replies || [], id) }));

const MAX_INDENT_DEPTH = 6;

export default function EngagementCommentsThread({
    engagementId,
    roomId,
    postId,
    matchId,
    accentColor = "#e91e8c",
    currentAvatarUrl,
    currentUserId: propUserId,
    currentUsername: propUsername,
    onFanProfile,
    onCommentCountChange,
}: Props) {
    const { userProfile } = useUserProfile();
    const effectiveUserId = propUserId || userProfile?.actualUserId || userProfile?.email || "guest_fan";
    const realUserName =
        propUsername || userProfile?.username || userProfile?.name || (userProfile?.email ? userProfile.email.split("@")[0] : "");
    const effectiveUserName = realUserName || "SportsFan";
    const effectiveAvatar = currentAvatarUrl || userProfile?.avatarUrl || userProfile?.avatar || "";

    const [comments, setComments] = useState<ThreadComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    // The parent comment or reply that the user is replying to
    const [replyTo, setReplyTo] = useState<{ parentId: string; userName: string } | null>(null);
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

    const inputRef = useRef<HTMLInputElement>(null);
    const threadKey = engagementId ? `eng_${engagementId}` : `post_${roomId}_${postId}`;
    const storageKey = `sf_thread_comments_${threadKey}`;

    const onCountRef = useRef(onCommentCountChange);
    useEffect(() => { onCountRef.current = onCommentCountChange; });
    const loadedRef = useRef(false);

    // ── Load & Live Poll comments (runs every 2 seconds for instant updates) ──
    const loadComments = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            let res;
            if (roomId && postId) {
                res = await axios.get(
                    `/api/roar/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(postId)}/comments`,
                    { params: { limit: 100, _t: Date.now() }, timeout: 8000 }
                );
            } else if (engagementId) {
                res = await axios.get(
                    `/api/engagements/${encodeURIComponent(engagementId)}/comments`,
                    { params: { ...(matchId ? { matchId } : {}), limit: 100, _t: Date.now() }, timeout: 8000 }
                );
            } else {
                return;
            }

            const d = res.data;
            const list = Array.isArray(d) ? d
                : Array.isArray(d?.comments) ? d.comments
                : Array.isArray(d?.data) ? d.data
                : Array.isArray(d?.data?.comments) ? d.data.comments
                : null;

            if (list) {
                loadedRef.current = true;
                const normalized = list.map(normalize);
                const tree = buildTree(normalized);
                setComments(tree);
            }
        } catch {
            if (!silent) {
                try {
                    const cached = JSON.parse(localStorage.getItem(storageKey) || "[]");
                    if (Array.isArray(cached)) setComments(buildTree(cached.map(normalize)));
                } catch { /* ignore */ }
                loadedRef.current = true;
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [engagementId, roomId, postId, matchId, storageKey]);

    useEffect(() => {
        let cancelled = false;
        loadedRef.current = false;

        loadComments(false);

        // Poll every 2000ms (2 seconds) so other users' comments appear near-instantly
        const interval = setInterval(() => {
            if (!cancelled && !document.hidden) {
                loadComments(true);
            }
        }, 2000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [loadComments]);

    // Report recursive total count to parent on every change
    useEffect(() => {
        if (!loadedRef.current) return;
        const total = countTotal(comments);
        onCountRef.current?.(total);
        try { localStorage.setItem(storageKey, JSON.stringify(comments)); } catch { /* ignore */ }
    }, [comments, storageKey]);

    // Start a reply to any comment or nested reply at any depth
    const startReply = (parentId: string, userName: string) => {
        setReplyTo({ parentId, userName });
        setExpandedReplies(p => ({ ...p, [parentId]: true }));
        setInputText(`@${userName} `);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    // ── Send comment / reply ──
    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = inputText.trim();
        if (!text || submitting) return;

        setSubmitting(true);
        setSendError(null);
        const parentId = replyTo?.parentId || null;
        const tempId = `tmp_${Date.now()}`;
        const optimistic: ThreadComment = {
            id: tempId,
            engagementId: engagementId || postId || "",
            text,
            userId: effectiveUserId,
            userName: effectiveUserName,
            userAvatar: effectiveAvatar,
            createdAt: Date.now(),
            likes: 0,
            likedBy: [],
            parentCommentId: parentId,
            replies: [],
        };

        // Optimistically insert into tree immediately
        setComments(prev =>
            parentId
                ? updateNode(prev, parentId, c => ({ ...c, replies: [...(c.replies || []), optimistic] }))
                : [optimistic, ...prev]
        );
        if (parentId) setExpandedReplies(p => ({ ...p, [parentId]: true }));
        setInputText("");
        setReplyTo(null);

        try {
            let res;
            if (roomId && postId) {
                res = await axios.post(
                    `/api/roar/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(postId)}/comments`,
                    { text, parentId },
                    { timeout: 15000 }
                );
            } else if (engagementId) {
                res = await axios.post(
                    `/api/engagements/${encodeURIComponent(engagementId)}/comments`,
                    {
                        text,
                        parentId,
                        authorUid: effectiveUserId,
                        authorUsername: realUserName,
                        authorAvatarUrl: effectiveAvatar,
                        matchId,
                    },
                    { timeout: 15000 }
                );
            }

            const saved = res?.data?.comment ? normalize(res.data.comment) : null;
            if (saved) {
                setComments(prev =>
                    updateNode(prev, tempId, c => ({
                        ...saved,
                        parentCommentId: c.parentCommentId,
                        replies: c.replies,
                    }))
                );
            }
            // Trigger instant refresh
            loadComments(true);
        } catch (err: any) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.error;
            setSendError(
                status
                    ? `Comment not saved (${status}${serverMsg ? `: ${serverMsg}` : ""}). Please try again.`
                    : "Comment not saved: connection timed out. Please try again."
            );
            // rollback
            setComments(prev => removeNode(prev, tempId));
            setInputText(text);
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle like on comment at any depth
    const toggleLike = async (commentId: string) => {
        if (commentId.startsWith("tmp_")) return;
        const flip = (c: ThreadComment): ThreadComment => {
            const liked = (c.likedBy || []).includes(effectiveUserId) || (c.likedBy || []).includes("me");
            return {
                ...c,
                likes: Math.max(0, c.likes + (liked ? -1 : 1)),
                likedBy: liked
                    ? (c.likedBy || []).filter(u => u !== effectiveUserId && u !== "me")
                    : [...(c.likedBy || []), effectiveUserId],
            };
        };

        const applyFlip = () => setComments(prev => updateNode(prev, commentId, flip));
        applyFlip();

        try {
            if (roomId && postId) {
                await axios.post(
                    `/api/roar/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/react`,
                    { reaction: "heart" },
                    { timeout: 8000 }
                );
            } else if (engagementId) {
                await axios.post(
                    `/api/engagements/${encodeURIComponent(engagementId)}/comments/${encodeURIComponent(commentId)}/like`,
                    { userId: effectiveUserId, matchId },
                    { timeout: 8000 }
                );
            }
        } catch {
            applyFlip(); // revert if failed
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm("Delete this comment?")) return;
        setComments(prev => removeNode(prev, commentId));
        if (roomId && postId) {
            try {
                await axios.delete(
                    `/api/roar/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
                    { timeout: 8000 }
                );
            } catch { /* ignore */ }
        }
    };

    // ── Recursive Comment Renderer (Level 0, 1, 2, 3...) ──
    const renderComment = (comment: ThreadComment, depth: number = 0): React.ReactNode => {
        const isLiked = (comment.likedBy || []).includes(effectiveUserId) || (comment.likedBy || []).includes("me");
        const replies = comment.replies || [];
        // Default to TRUE so all replies show immediately after refresh, matching screenshot
        const open = expandedReplies[comment.id] !== false;
        const isRoot = depth === 0;
        const replyTotal = countTotal(replies);
        const isOwn = comment.userId === effectiveUserId || (comment.userName && comment.userName === effectiveUserName);

        // Highlight @mention tag in text
        const spaceIdx = (comment.text || "").indexOf(" ");
        const hasMention = (comment.text || "").startsWith("@") && spaceIdx > -1;
        const mentionPart = hasMention ? (comment.text || "").slice(0, spaceIdx) : "";
        const bodyPart = hasMention ? (comment.text || "").slice(spaceIdx) : (comment.text || "");

        return (
            <div
                key={comment.id}
                className={isRoot
                    ? "flex flex-col gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl p-2.5"
                    : "flex flex-col gap-1.5 bg-white/[0.02] p-2 rounded-lg"}
            >
                <div className="flex items-start gap-2">
                    <div className={`${isRoot ? "w-7 h-7" : "w-5 h-5"} rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/10`}>
                        {comment.userAvatar ? (
                            <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isRoot ? "text-[10px]" : "text-[9px]"} font-bold text-white ${isRoot ? "bg-gradient-to-br from-[#e91e8c] to-[#ff6b35]" : "bg-white/20"}`}>
                                {(comment.userName || "F").charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                                className={`${isRoot ? "text-[11px]" : "text-[10px]"} font-bold text-white truncate cursor-pointer hover:underline`}
                                onClick={() => onFanProfile?.({ username: comment.userName, avatarUrl: comment.userAvatar, authorUid: comment.userId })}
                            >
                                {comment.userName}
                            </span>
                            <span className="text-[9px] text-white/35 shrink-0">{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className={`${isRoot ? "text-[11px] text-white/85" : "text-[10px] text-white/80"} leading-relaxed break-words`}>
                            {hasMention && <strong className="text-[#e91e8c] font-semibold mr-1">{mentionPart}</strong>}
                            {bodyPart}
                        </p>
                        <div className={`flex items-center gap-3 ${isRoot ? "mt-1.5 text-[10px]" : "mt-1 text-[9px]"}`}>
                            <button
                                type="button"
                                onClick={() => toggleLike(comment.id)}
                                className={`flex items-center gap-1 ${isLiked ? "text-[#e91e8c] font-bold" : "text-white/45 hover:text-white/80"}`}
                                title={isLiked ? "Unlike" : "Like"}
                            >
                                <Heart size={isRoot ? 11 : 10} fill={isLiked ? "currentColor" : "none"} />
                                <span>{comment.likes}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => startReply(comment.id, comment.userName || "Fan")}
                                className="flex items-center gap-1 text-white/45 hover:text-white/80"
                                title="Reply to this comment"
                            >
                                <Reply size={isRoot ? 11 : 10} />
                                <span>Reply</span>
                            </button>
                            {isOwn && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-white/25 hover:text-red-400 ml-auto"
                                    title="Delete comment"
                                >
                                    <Trash2 size={isRoot ? 11 : 10} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reply count toggle button */}
                {replies.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setExpandedReplies(p => ({ ...p, [comment.id]: !open }))}
                        className="flex items-center gap-1 ml-7 text-[10px] text-[#e91e8c] hover:underline font-semibold"
                    >
                        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        <span>{open ? "Hide replies" : `View ${replyTotal} ${replyTotal === 1 ? "reply" : "replies"}`}</span>
                    </button>
                )}

                {/* Recursive nested replies list with guide line */}
                {open && replies.length > 0 && (
                    <div className={`flex flex-col gap-1.5 mt-1 ${depth < MAX_INDENT_DEPTH ? "ml-7 pl-2.5 border-l-2 border-[#e91e8c]/30" : "ml-0 pl-1.5 border-l border-[#e91e8c]/20"}`}>
                        {replies.map(reply => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2.5">
            {/* ── Comments Header ── */}
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/80 flex items-center gap-1.5 uppercase tracking-wide">
                    <MessageSquare size={13} className="text-[#e91e8c]" />
                    Comments ({countTotal(comments)})
                </span>
            </div>

            {/* ── Top Input Form ── */}
            <form onSubmit={handleSend} className="relative flex flex-col gap-1.5">
                {sendError && (
                    <div className="text-[10px] text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                        {sendError}
                    </div>
                )}
                {replyTo && (
                    <div className="flex items-center justify-between text-[10px] text-white/70 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        <span className="flex items-center gap-1">
                            <CornerDownRight size={11} className="text-[#e91e8c]" />
                            Replying to <strong className="text-white">@{replyTo.userName}</strong>
                        </span>
                        <button
                            type="button"
                            onClick={() => { setReplyTo(null); setInputText(""); }}
                            className="text-white/40 hover:text-white"
                        >
                            ✕ Cancel
                        </button>
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

            {/* ── Comments List ── */}
            {loading && comments.length === 0 ? (
                <div className="text-center py-2 text-[10px] text-white/40 italic">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-center py-3 text-[11px] text-white/40">No comments yet. Start the conversation!!</div>
            ) : (
                <div className="flex flex-col gap-2 mt-1">
                    {comments.map((comment) => renderComment(comment, 0))}
                </div>
            )}
        </div>
    );
}
