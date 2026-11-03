"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart, Reply, Send, Trash2, ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
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

// ── Tree helpers (comments can be nested to any depth) ──

// Every comment in the tree, replies included, as a flat list (children detached).
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

// Builds the tree from parentCommentId links. Works whether the API sends a flat list,
// a one-level `replies` array, or fully nested replies. Newest top-level first, replies oldest first.
function buildTree(list: ThreadComment[]): ThreadComment[] {
    const flat = flatten(list);
    const byId = new Map<string, ThreadComment>();
    for (const c of flat) if (!byId.has(c.id)) byId.set(c.id, c);
    const nodes = Array.from(byId.values());

    const roots: ThreadComment[] = [];
    for (const c of nodes) {
        const parent = c.parentCommentId ? byId.get(c.parentCommentId) : undefined;
        if (parent && parent.id !== c.id) parent.replies = [...(parent.replies || []), c];
        else roots.push(c);
    }
    const sortReplies = (c: ThreadComment) => {
        c.replies = (c.replies || []).sort((a, b) => a.createdAt - b.createdAt);
        c.replies.forEach(sortReplies);
    };
    roots.forEach(sortReplies);
    return roots.sort((a, b) => b.createdAt - a.createdAt);
}

const countTotal = (list: ThreadComment[]): number =>
    list.reduce((acc, c) => acc + 1 + countTotal(c.replies || []), 0);

const updateNode = (list: ThreadComment[], id: string, fn: (c: ThreadComment) => ThreadComment): ThreadComment[] =>
    list.map(c => (c.id === id ? fn(c) : { ...c, replies: updateNode(c.replies || [], id, fn) }));

const removeNode = (list: ThreadComment[], id: string): ThreadComment[] =>
    list.filter(c => c.id !== id).map(c => ({ ...c, replies: removeNode(c.replies || [], id) }));

// Past this depth replies stop indenting further so deep threads still fit on a phone.
const MAX_INDENT_DEPTH = 4;

export default function EngagementCommentsThread({ engagementId, matchId, accentColor = "#e91e8c", onCommentCountChange }: Props) {
    const { userProfile } = useUserProfile();
    const currentUserId = userProfile?.actualUserId || userProfile?.email || "guest_fan";
    // Real name only: "" when the profile has not loaded, so the placeholder is never sent to (and saved by) the server
    const realUserName =
        userProfile?.username || userProfile?.name || (userProfile?.email ? userProfile.email.split("@")[0] : "");
    const currentUserName = realUserName || "SportsFan";
    const currentUserAvatar = userProfile?.avatarUrl || userProfile?.avatar || "";

    const [comments, setComments] = useState<ThreadComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    // The comment (or reply) the next message is posted under.
    const [replyTo, setReplyTo] = useState<{ parentId: string; userName: string } | null>(null);
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

    const inputRef = useRef<HTMLInputElement>(null);
    const storageKey = `sf_eng_comments_${engagementId}`;

    // Keep latest callback in a ref so it never retriggers effects
    const onCountRef = useRef(onCommentCountChange);
    useEffect(() => { onCountRef.current = onCommentCountChange; });
    const loadedRef = useRef(false);

    // ── Load & Live Poll comments for engagement ──
    useEffect(() => {
        let cancelled = false;
        loadedRef.current = false;

        const loadComments = async (silent = false) => {
            if (!silent) setLoading(true);
            try {
                const url = `/api/engagements/${encodeURIComponent(engagementId)}/comments`;
                let res;
                try {
                    res = await axios.get(url, { params: { ...(matchId ? { matchId } : {}), _t: Date.now() }, timeout: 8000 });
                } catch (firstErr) {
                    if (!matchId) throw firstErr;
                    res = await axios.get(url, { params: { _t: Date.now() }, timeout: 8000 });
                }
                if (cancelled) return;
                const d = res.data;
                const list = Array.isArray(d) ? d
                    : Array.isArray(d?.comments) ? d.comments
                    : Array.isArray(d?.data) ? d.data
                    : Array.isArray(d?.data?.comments) ? d.data.comments
                    : null;
                if (list) {
                    loadedRef.current = true;
                    setComments(list.map(normalize));
                }
            } catch (err) {
                if (cancelled) return;
                if (!silent) {
                    try {
                        const cached = JSON.parse(localStorage.getItem(storageKey) || "[]");
                        if (Array.isArray(cached)) setComments(cached.map(normalize));
                    } catch { /* ignore */ }
                    loadedRef.current = true;
                }
            } finally {
                if (!cancelled && !silent) setLoading(false);
            }
        };

        loadComments(false);

        const interval = setInterval(() => {
            loadComments(true);
        }, 4000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [engagementId, matchId, storageKey]);

    // Report count to parent only when comments actually change (after first load)
    useEffect(() => {
        if (!loadedRef.current) return;
        onCountRef.current?.(countTotal(comments));
        try { localStorage.setItem(storageKey, JSON.stringify(comments)); } catch { /* ignore */ }
    }, [comments, storageKey]);

    // Start a reply to any comment, at any depth.
    const startReply = (parentId: string, userName: string) => {
        setReplyTo({ parentId, userName });
        setExpandedReplies(p => ({ ...p, [parentId]: true }));
        setTimeout(() => inputRef.current?.focus(), 0);
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
            id: tempId, engagementId, text, userId: currentUserId, userName: currentUserName,
            userAvatar: currentUserAvatar, createdAt: Date.now(), likes: 0, likedBy: [],
            parentCommentId: parentId, replies: [],
        };

        setComments(prev =>
            parentId
                ? updateNode(prev, parentId, c => ({ ...c, replies: [...(c.replies || []), optimistic] }))
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
                    authorUsername: realUserName,
                    authorAvatarUrl: currentUserAvatar,
                    matchId,
                },
                // The route does several sequential database writes, so allow longer than a read
                { timeout: 20000 }
            );
            const saved = res.data?.comment ? normalize(res.data.comment) : null;
            if (saved) {
                // swap temp -> real (no refetch, no flicker)
                setComments(prev => updateNode(prev, tempId, c => ({ ...saved, parentCommentId: c.parentCommentId, replies: c.replies })));
            }
        } catch (err: any) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.error;
            console.warn("Comment send failed:", status ?? err?.code, serverMsg ?? err?.message, err);
            setSendError(
                status
                    ? `Comment not saved (${status}${serverMsg ? `: ${serverMsg}` : ""}). Please try again.`
                    : "Comment not saved: the server took too long to answer. Please try again."
            );
            // rollback
            setComments(prev => removeNode(prev, tempId));
            setInputText(text);
        } finally {
            setSubmitting(false);
        }
    };

    // Optimistic flip, then persisted via the comment-like endpoint (reverted if it fails).
    const toggleLike = async (commentId: string) => {
        if (commentId.startsWith("tmp_")) return; // not saved yet
        const flip = (c: ThreadComment): ThreadComment => {
            const liked = (c.likedBy || []).includes(currentUserId);
            return {
                ...c,
                likes: Math.max(0, c.likes + (liked ? -1 : 1)),
                likedBy: liked ? (c.likedBy || []).filter(u => u !== currentUserId) : [...(c.likedBy || []), currentUserId],
            };
        };
        const applyFlip = () => setComments(prev => updateNode(prev, commentId, flip));

        applyFlip();
        try {
            await axios.post(
                `/api/engagements/${encodeURIComponent(engagementId)}/comments/${encodeURIComponent(commentId)}/like`,
                { userId: currentUserId, matchId },
                { timeout: 8000 }
            );
        } catch {
            applyFlip(); // flipping again restores the previous state
        }
    };

    // NOTE: no engagement-comment DELETE endpoint is known, so delete is local-only.
    const handleDelete = (commentId: string) => {
        setComments(prev => removeNode(prev, commentId));
    };

    // One comment and, recursively, everything under it.
    const renderComment = (comment: ThreadComment, depth: number): React.ReactNode => {
        const isLiked = (comment.likedBy || []).includes(currentUserId);
        const replies = comment.replies || [];
        const open = expandedReplies[comment.id] ?? false;
        const isRoot = depth === 0;
        const replyTotal = countTotal(replies);

        return (
            <div
                key={comment.id}
                className={isRoot
                    ? "flex flex-col gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl p-2.5"
                    : "flex flex-col gap-1.5 bg-white/[0.02] p-2 rounded-lg"}
            >
                <div className="flex items-start gap-2">
                    <div className={`${isRoot ? "w-6 h-6" : "w-5 h-5"} rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/10`}>
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
                            <span className={`${isRoot ? "text-[11px]" : "text-[10px]"} font-bold text-white truncate`}>{comment.userName}</span>
                            <span className="text-[9px] text-white/35 shrink-0">{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className={`${isRoot ? "text-[11px] text-white/85" : "text-[10px] text-white/80"} leading-relaxed break-words`}>{comment.text}</p>
                        <div className={`flex items-center gap-3 ${isRoot ? "mt-1.5 text-[10px]" : "mt-1 text-[9px]"}`}>
                            <button type="button" onClick={() => toggleLike(comment.id)}
                                className={`flex items-center gap-1 ${isLiked ? "text-[#e91e8c] font-bold" : "text-white/45 hover:text-white/80"}`}>
                                <Heart size={isRoot ? 11 : 10} fill={isLiked ? "currentColor" : "none"} /><span>{comment.likes}</span>
                            </button>
                            <button type="button"
                                onClick={() => startReply(comment.id, comment.userName || "Fan")}
                                className="flex items-center gap-1 text-white/45 hover:text-white/80">
                                <Reply size={isRoot ? 11 : 10} /><span>Reply</span>
                            </button>
                            {comment.userId === currentUserId && (
                                <button type="button" onClick={() => handleDelete(comment.id)} className="text-white/25 hover:text-red-400 ml-auto">
                                    <Trash2 size={isRoot ? 11 : 10} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {replies.length > 0 && (
                    <button type="button" onClick={() => setExpandedReplies(p => ({ ...p, [comment.id]: !open }))}
                        className="flex items-center gap-1 ml-7 text-[10px] text-[#e91e8c] hover:underline font-semibold">
                        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        <span>{open ? "Hide replies" : `View ${replyTotal} ${replyTotal === 1 ? "reply" : "replies"}`}</span>
                    </button>
                )}

                {open && replies.length > 0 && (
                    // Each level indents and gets its own guide line, up to MAX_INDENT_DEPTH
                    <div className={`flex flex-col gap-1.5 mt-1 ${depth < MAX_INDENT_DEPTH ? "ml-7 pl-2.5 border-l-2 border-[#e91e8c]/30" : "ml-0 pl-1.5 border-l border-[#e91e8c]/20"}`}>
                        {replies.map(reply => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/80 flex items-center gap-1.5 uppercase tracking-wide">
                    {/* <MessageSquare size={13} className="text-[#e91e8c]" />
                    Comments ({countTotal(comments)}) */}
                </span>
            </div>

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

            {loading && comments.length === 0 ? (
                <div className="text-center py-2 text-[10px] text-white/40 italic">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-center py-3 text-[11px] text-white/40">No comments yet. Start the conversation!!</div>
            ) : (
                <div className="flex flex-col gap-2 mt-1">
                    {comments.map((comment) => {
                        const isLiked = (comment.likedBy || []).includes(currentUserId);
                        const replies = comment.replies || [];
                        const open = expandedReplies[comment.id] !== false;
                        return (
                            <div key={comment.id} className="flex flex-col gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                                <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/10">
                                        {comment.userAvatar ? (
                                            <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-[#e91e8c] to-[#ff6b35]">
                                                {(comment.userName || "F").charAt(0).toUpperCase()}
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
                                                onClick={() => startReply(comment.id, comment.userName || "Fan")}
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
                                                                {(reply.userName || "F").charAt(0).toUpperCase()}
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
                                                            {/* Reply on a reply: stored under the root comment, @mentions this reply's author */}
                                                            <button type="button"
                                                                onClick={() => startReply(comment.id, reply.userName || "Fan")}
                                                                className="flex items-center gap-1 text-white/45 hover:text-white/80">
                                                                <Reply size={10} /><span>Reply</span>
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
