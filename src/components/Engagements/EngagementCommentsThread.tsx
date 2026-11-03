"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
    const reactions = c.reactions && typeof c.reactions === "object" ? c.reactions : {};
    const reactionUids = Object.entries(reactions)
        .filter(([_, r]) => r === "heart" || r === "like" || r === true)
        .map(([uid]) => uid);
    const rawLikedBy = Array.isArray(c.likedBy) && c.likedBy.length > 0
        ? Array.from(new Set([...c.likedBy, ...reactionUids]))
        : reactionUids;
    const isLikedByUser = c.userReaction === "heart" || c.userLiked === true;
    const finalLikedBy = isLikedByUser && !rawLikedBy.includes("me") ? [...rawLikedBy, "me"] : rawLikedBy;
    const rawLikes = Math.max(
        Number(c.likesCount ?? c.heartCount ?? c.likes ?? 0),
        finalLikedBy.length
    );
    const rawId = String(c.id || c.commentId || c._id || "");
    const cleanId = rawId.replace(/^COMMENT#/, "").trim() || `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    return {
        id: cleanId,
        engagementId: String(c.engagementId || c.postId || ""),
        text: String(c.text || ""),
        userId: String(c.authorUid || c.userId || ""),
        userName: String(c.authorUsername || c.userName || c.username || "Fan"),
        userAvatar: c.authorAvatarUrl || c.userAvatar || c.avatarUrl || "",
        createdAt: Number(c.createdAt) || Date.now(),
        likes: rawLikes,
        likedBy: finalLikedBy,
        parentCommentId: c.parentId ? String(c.parentId).replace(/^COMMENT#/, "").trim() : (c.parentCommentId ? String(c.parentCommentId).replace(/^COMMENT#/, "").trim() : null),
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

const updateNode = (list: ThreadComment[], id: string, fn: (c: ThreadComment) => ThreadComment): ThreadComment[] => {
    const cleanTargetId = String(id).replace(/^COMMENT#/, "").trim();
    return list.map(c => {
        const cleanCid = String(c.id).replace(/^COMMENT#/, "").trim();
        if (cleanCid === cleanTargetId || c.id === id) {
            return fn(c);
        }
        return { ...c, replies: updateNode(c.replies || [], id, fn) };
    });
};

const removeNode = (list: ThreadComment[], id: string): ThreadComment[] => {
    const cleanTargetId = String(id).replace(/^COMMENT#/, "").trim();
    return list
        .filter(c => String(c.id).replace(/^COMMENT#/, "").trim() !== cleanTargetId && c.id !== id)
        .map(c => ({ ...c, replies: removeNode(c.replies || [], id) }));
};

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
    const effectiveUserId =
        propUserId ||
        userProfile?.actualUserId ||
        userProfile?.userId ||
        userProfile?.authUserId ||
        userProfile?.email ||
        (typeof window !== "undefined" ? localStorage.getItem("roar_user_id") || localStorage.getItem("sf_user_id") : null) ||
        "guest_fan";
    const realUserName =
        propUsername || userProfile?.username || userProfile?.name || (userProfile?.email ? userProfile.email.split("@")[0] : "");
    const effectiveUserName = realUserName || "SportsFan";
    const effectiveAvatar = currentAvatarUrl || userProfile?.avatarUrl || userProfile?.avatar || "";

    const myIdCandidates = useMemo(() => {
        const set = new Set<string>(["me"]);
        if (effectiveUserId) set.add(effectiveUserId);
        if (propUserId) set.add(propUserId);
        if (userProfile?.actualUserId) set.add(userProfile.actualUserId);
        if (userProfile?.userId) set.add(userProfile.userId);
        if (userProfile?.authUserId) set.add(userProfile.authUserId);
        if (userProfile?.email) set.add(userProfile.email.toLowerCase());
        if (userProfile?.username) set.add(userProfile.username.toLowerCase());
        if (effectiveUserName) set.add(effectiveUserName.toLowerCase());
        return set;
    }, [effectiveUserId, propUserId, userProfile, effectiveUserName]);

    const commentLikesKey = `sf_comment_likes_${effectiveUserId}`;
    const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(commentLikesKey);
                if (stored) return new Set<string>(JSON.parse(stored));
            } catch {}
        }
        return new Set<string>();
    });

    // Re-hydrate liked comment IDs when effectiveUserId or key changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(commentLikesKey);
                if (stored) {
                    const ids = JSON.parse(stored);
                    if (Array.isArray(ids)) {
                        setLikedCommentIds(prev => new Set([...prev, ...ids]));
                    }
                }
            } catch {}
        }
    }, [commentLikesKey]);

    // Active refs to guard polling intervals against stale React hook closures
    const likedCommentIdsRef = useRef<Set<string>>(likedCommentIds);
    useEffect(() => { likedCommentIdsRef.current = likedCommentIds; }, [likedCommentIds]);
    const myIdCandidatesRef = useRef(myIdCandidates);
    useEffect(() => { myIdCandidatesRef.current = myIdCandidates; }, [myIdCandidates]);
    const effectiveUserIdRef = useRef(effectiveUserId);
    useEffect(() => { effectiveUserIdRef.current = effectiveUserId; }, [effectiveUserId]);
    const lastLikeActionRef = useRef<Record<string, number>>({});

    const isCommentLiked = useCallback((c: ThreadComment): boolean => {
        const cleanId = String(c.id).replace(/^COMMENT#/, "").trim();
        if (likedCommentIds.has(c.id) || likedCommentIds.has(cleanId)) return true;
        const likedBy = c.likedBy || [];
        for (const uid of likedBy) {
            if (myIdCandidates.has(uid) || myIdCandidates.has(String(uid).toLowerCase())) {
                return true;
            }
        }
        return false;
    }, [likedCommentIds, myIdCandidates]);

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
    const prevReportedTotal = useRef<number | null>(null);

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

                // Sync server-confirmed likes to local Set
                setLikedCommentIds(prev => {
                    let changed = false;
                    const next = new Set(prev);
                    const scan = (nodes: ThreadComment[]) => {
                        for (const node of nodes) {
                            const cleanNid = String(node.id).replace(/^COMMENT#/, "").trim();
                            const justToggled = Date.now() - (lastLikeActionRef.current[cleanNid] || 0) < 4000;
                            if (!justToggled) {
                                const hasMyLike = (node.likedBy || []).some(uid => myIdCandidatesRef.current.has(uid) || myIdCandidatesRef.current.has(String(uid).toLowerCase()));
                                if (hasMyLike && !next.has(cleanNid)) {
                                    next.add(cleanNid);
                                    changed = true;
                                }
                            }
                            if (node.replies?.length) scan(node.replies);
                        }
                    };
                    scan(normalized);
                    if (changed && typeof window !== "undefined") {
                        try { localStorage.setItem(commentLikesKey, JSON.stringify(Array.from(next))); } catch {}
                    }
                    return next;
                });

                // Recursive patch node so nested replies at ANY depth never revert like counts to 0 and sync across users
                const patchNode = (node: ThreadComment): ThreadComment => {
                    const cleanCid = String(node.id).replace(/^COMMENT#/, "").trim();
                    const serverHasMyLike = (node.likedBy || []).some(uid =>
                        myIdCandidatesRef.current.has(uid) || myIdCandidatesRef.current.has(String(uid).toLowerCase())
                    );
                    const isLocallyLiked =
                        likedCommentIdsRef.current.has(node.id) ||
                        likedCommentIdsRef.current.has(cleanCid) ||
                        serverHasMyLike;

                    const hasPendingLocalLike = isLocallyLiked && !serverHasMyLike;
                    const finalLikes = Math.max(
                        (node.likes || 0) + (hasPendingLocalLike ? 1 : 0),
                        (isLocallyLiked || serverHasMyLike) ? 1 : 0
                    );
                    const finalLikedBy = (isLocallyLiked || serverHasMyLike) && !(node.likedBy || []).includes(effectiveUserIdRef.current)
                        ? [...(node.likedBy || []), effectiveUserIdRef.current]
                        : node.likedBy;

                    return {
                        ...node,
                        id: cleanCid,
                        likes: finalLikes,
                        likedBy: finalLikedBy,
                        replies: (node.replies || []).map(patchNode),
                    };
                };

                const patched = normalized.map(patchNode);
                const tree = buildTree(patched);
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
    }, [engagementId, roomId, postId, matchId, storageKey, commentLikesKey]);

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

    // Report recursive total count to parent only when count actually changes
    useEffect(() => {
        if (!loadedRef.current) return;
        const total = countTotal(comments);
        if (prevReportedTotal.current !== total) {
            prevReportedTotal.current = total;
            onCountRef.current?.(total);
        }
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
        const cleanCommentId = String(commentId).replace(/^COMMENT#/, "").trim();

        // Check current like status
        const findNode = (nodes: ThreadComment[]): ThreadComment | null => {
            for (const n of nodes) {
                const cleanNid = String(n.id).replace(/^COMMENT#/, "").trim();
                if (cleanNid === cleanCommentId || n.id === commentId) return n;
                if (n.replies?.length) {
                    const sub = findNode(n.replies);
                    if (sub) return sub;
                }
            }
            return null;
        };
        const targetNode = findNode(comments);
        const currentLiked = targetNode ? isCommentLiked(targetNode) : (likedCommentIds.has(cleanCommentId) || likedCommentIds.has(commentId));
        const nextLiked = !currentLiked;

        lastLikeActionRef.current[cleanCommentId] = Date.now();

        // 1. Instantly update likedCommentIds set and localStorage
        setLikedCommentIds(prev => {
            const next = new Set(prev);
            if (nextLiked) {
                next.add(cleanCommentId);
                next.add(commentId);
            } else {
                next.delete(cleanCommentId);
                next.delete(commentId);
            }
            if (typeof window !== "undefined") {
                try { localStorage.setItem(commentLikesKey, JSON.stringify(Array.from(next))); } catch {}
            }
            return next;
        });

        // 2. Optimistically update node in state
        const flip = (c: ThreadComment): ThreadComment => {
            const currentLikedBy = c.likedBy || [];
            const newLikedBy = nextLiked
                ? Array.from(new Set([...currentLikedBy, effectiveUserId, "me"]))
                : currentLikedBy.filter(u => !myIdCandidates.has(u) && !myIdCandidates.has(String(u).toLowerCase()));
            const newLikesCount = Math.max(0, c.likes + (nextLiked ? 1 : -1));
            return {
                ...c,
                likes: newLikesCount,
                likedBy: newLikedBy,
            };
        };
        setComments(prev => updateNode(prev, cleanCommentId, flip));

        // 3. Send to backend & sync confirmed server response
        try {
            let res: any;
            if (roomId && postId) {
                res = await axios.post(
                    `/api/roar/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(postId)}/comments/${encodeURIComponent(cleanCommentId)}/react`,
                    { reaction: "heart", userId: effectiveUserId },
                    { timeout: 8000 }
                );
            } else if (engagementId) {
                res = await axios.post(
                    `/api/engagements/${encodeURIComponent(engagementId)}/comments/${encodeURIComponent(cleanCommentId)}/like`,
                    { userId: effectiveUserId, matchId },
                    { timeout: 8000 }
                );
            }
            if (res?.data) {
                const sLikes = typeof res.data.likesCount === "number"
                    ? res.data.likesCount
                    : (typeof res.data.heartCount === "number"
                        ? res.data.heartCount
                        : (typeof res.data.likes === "number" ? res.data.likes : null));
                const sLikedBy = Array.isArray(res.data.likedBy) ? res.data.likedBy : null;
                if (sLikes !== null) {
                    setComments(prev => updateNode(prev, cleanCommentId, c => ({
                        ...c,
                        likes: nextLiked && sLikes === 0 ? 1 : sLikes,
                        ...(sLikedBy ? { likedBy: sLikedBy } : {}),
                    })));
                }
            }
            // Trigger quick background refresh so all clients get the synced state
            setTimeout(() => { loadComments(true); }, 300);
        } catch (err) {
            console.warn("[toggleLike] Server sync notice:", err);
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
        const isLiked = isCommentLiked(comment);
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
                                className={`flex items-center gap-1 transition-colors ${
                                    isLiked ? "text-[#e91e8c] font-bold" : "text-white/45 hover:text-white/80"
                                }`}
                                title={isLiked ? "Unlike" : "Like"}
                            >
                                <Heart
                                    size={isRoot ? 11 : 10}
                                    fill={isLiked ? "#e91e8c" : "none"}
                                    color={isLiked ? "#e91e8c" : "currentColor"}
                                    strokeWidth={isLiked ? 2.5 : 2}
                                />
                                <span className={isLiked ? "text-[#e91e8c] font-bold" : ""}>{comment.likes}</span>
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
        <div className="mt-2 pt-2.5 border-t border-white/10 flex flex-col gap-2">
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
