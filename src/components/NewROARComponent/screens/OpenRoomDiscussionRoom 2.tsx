// src/components/NewROARComponent/screens/OpenRoomDiscussionRoom.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { usePostHog } from "posthog-js/react";
import { useUserProfile } from "@/context/UserProfileContext";
import AvatarWithBadge from "../components/AvatarWithBadge";
import ReactionPicker, { type Reaction } from "../components/ReactionPicker";
import ReactionsDialog from "../components/ReactionsDialog";
import ActiveFansDialog from "../components/ActiveFansDialog";
import { roarApi } from "@/lib/roarApi";
import {
    Image, ChevronLeft, Flame, TrendingUp, Zap, History, PenTool,
    Brain, Users, Volume2, VolumeX, Share2, Send, ChevronDown, ChevronUp,
    Clock, MoreVertical, Trash2, MessageSquare, Hash,
} from "lucide-react";
import EmojiPicker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { RADIAL_OPTS } from "../constants";
import VotersDialog from "../components/VotersDialog";
import DollyPanel, { type DollyHistorySession } from "../components/DollyPanel";

const REQUEST_TIMEOUT_MS = 12000;
const PRESENCE_TIMEOUT_MS = 20000;

// ── Sound effects ──
const SOUND_FILES: Record<"join" | "comment" | "post", string> = {
    join: "/sounds/join.mp3",
    comment: "/sounds/comment.mp3",
    post: "/sounds/post.mp3",
};

interface Channel {
    channelId: string;
    name: string;
    slug: string;
    icon: string;
    isActive: boolean;
    order: number;
}

interface Props {
    onBack: () => void;
    onToast: (m: string) => void;
    roomId?: string;
    roomName?: string;
    onPostClick?: (post: any) => void;
    onCompose?: (type: string | null) => void;
    currentAvatarUrl?: string;
    currentUserId?: string;
    onRegisterRefresh?: (fn: () => void) => void;
    onRegisterReplyUpdate?: (fn: (postId: string, count: number) => void) => void;
    onFanProfile?: (fan: any) => void;
    onRegisterInjectPost?: (fn: (post: any) => void) => void;
    onRegisterOptimisticSwap?: (fn: (tempId: string, realMsg?: any) => void) => void;
    onChannelChange?: (channelId: string | null) => void;
}

const QUICK_REACT_OPTS = [
    { id: "qr_wicket", label: "Wicket!", emoji: "🎯", sport: "cricket" },
    { id: "qr_six", label: "Six!!", emoji: "💪", sport: "cricket" },
    { id: "qr_four", label: "Four!", emoji: "🏏", sport: "cricket" },
    { id: "qr_catch", label: "Catch!", emoji: "🧤", sport: "cricket" },
    { id: "qr_goal", label: "Goal!!", emoji: "⚽", sport: "football" },
    { id: "qr_redcard", label: "Red Card!", emoji: "🟥", sport: "football" },
    { id: "qr_frango", label: "Frango!", emoji: "🐔", sport: "football" },
    { id: "qr_yellowcard", label: "Yellow Card!", emoji: "🟨", sport: "football" },
    { id: "qr_wave", label: "Wave!", emoji: "🌊", sport: "both" },
];

function displayUsername(raw: string | undefined | null): string {
    if (!raw) return "RoarUser";
    const trimmed = raw.trim();
    if (!trimmed) return "RoarUser";
    if (!trimmed.includes("_")) return trimmed;
    const spaced = trimmed.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
    if (!spaced) return "RoarUser";
    return spaced.split(" ").map((word) => (/[A-Z]/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))).join(" ");
}

const typeBadgeClass = (type: string) => {
    const base = "text-[8px] font-extrabold px-1.5 py-0.5 rounded";
    if (type === "prediction") return `${base} bg-[rgba(255,215,0,0.15)] text-[#fbbf24] border border-[rgba(255,215,0,0.25)]`;
    if (type === "post") return `${base} bg-[rgba(233,30,140,0.12)] text-[#E91E8C] border border-[rgba(233,30,140,0.2)]`;
    if (type === "hottake") return `${base} bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.25)]`;
    if (type === "debate") return `${base} bg-[rgba(233,30,140,0.15)] text-[#e91e8c] border border-[rgba(233,30,140,0.25)]`;
    if (type === "raw_reactions") return `${base} bg-[rgba(0,232,198,0.15)] text-[#00e8c6] border border-[rgba(0,232,198,0.25)]`;
    return `${base} bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.1)]`;
};

const commentAccentColor = (type: string) => {
    if (type === "prediction") return "#22c55e";
    if (type === "hottake") return "#f87171";
    if (type === "raw_reactions") return "#00e8c6";
    return "#e91e8c";
};

function ActiveFansStack({
    fans, count, totalJoinCount, onClick,
}: {
    fans: { uid: string; username: string; avatarUrl?: string | null }[];
    count: number;
    totalJoinCount?: number;
    onClick: () => void;
}) {
    if (count === 0 && !totalJoinCount) return null;
    const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-0 bg-transparent border-none cursor-pointer py-0.5 px-0 hover:bg-white/5 transition-colors rounded flex-shrink-0"
        >
            <span className="text-[9px] font-semibold text-white/50 whitespace-nowrap">
                Members{" "}
                <span className="text-white font-bold">{formatCount(count)} active</span>
                {totalJoinCount !== undefined && totalJoinCount > 0 && (
                    <>
                        {" / "}
                        <span className="text-white font-bold">{formatCount(totalJoinCount)}</span> total joined
                    </>
                )}
            </span>
        </button>
    );
}

function useVisibilityInterval(callback: () => void, delay: number) {
    const savedCallback = useRef(callback);
    useEffect(() => { savedCallback.current = callback; }, [callback]);
    useEffect(() => {
        let id: ReturnType<typeof setInterval>;
        const start = () => { id = setInterval(() => { if (!document.hidden) savedCallback.current(); }, delay); };
        const handleVisibility = () => { clearInterval(id); if (!document.hidden) { savedCallback.current(); start(); } };
        start();
        document.addEventListener("visibilitychange", handleVisibility);
        return () => { clearInterval(id); document.removeEventListener("visibilitychange", handleVisibility); };
    }, [delay]);
}

export default function OpenRoomDiscussionRoom({
    onBack, onToast, roomId, roomName, onPostClick, onCompose,
    currentAvatarUrl, currentUserId, onRegisterRefresh, onRegisterReplyUpdate,
    onFanProfile, onRegisterInjectPost, onRegisterOptimisticSwap, onChannelChange,
}: Props) {
    const phog = usePostHog();
    const { userProfile } = useUserProfile();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showQuickCompose, setShowQuickCompose] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<"post" | "debate" | "prediction" | "hottake" | "raw_reactions">("post");
    const [uploading, setUploading] = useState(false);
    const [attachedUrl, setAttachedUrl] = useState<string | null>(null);
    const [attachedType, setAttachedType] = useState<"image" | "video" | null>(null);
    const [userUsername, setUserUsername] = useState("RoarUser");
    const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
    const [selectedActionId, setSelectedActionId] = useState("post");
    const [liveCount, setLiveCount] = useState<number>(0);
    const [totalJoinCount, setTotalJoinCount] = useState<number>(0);
    const [activeFans, setActiveFans] = useState<{ uid: string; username: string; avatarUrl?: string | null; badge?: string | null }[]>([]);
    const [activeFansOpen, setActiveFansOpen] = useState(false);
    const [roomCounts, setRoomCounts] = useState({ post: 0, debate: 0, prediction: 0, trivia: 0, battle: 0 });
    const [activeFilter, setActiveFilter] = useState<"all" | "post" | "debate" | "prediction" | "trivia" | "battle">("all");
    const [localReactions, setLocalReactions] = useState<Record<string, { reaction: Reaction | null; heartCount: number }>>({});
    const localReactionsRef = useRef(localReactions);
    const pendingReactRef = useRef<Record<string, boolean>>({});
    const [reactionsMsgId, setReactionsMsgId] = useState<string | null>(null);
    const [votersMsgId, setVotersMsgId] = useState<string | null>(null);
    const [votersMode, setVotersMode] = useState<"debate" | "prediction">("prediction");
    const [openInlinePostId, setOpenInlinePostId] = useState<string | null>(null);
    const [explicitlyClosedPostIds, setExplicitlyClosedPostIds] = useState<Set<string>>(new Set());
    const [postCooldown, setPostCooldown] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const sendingRef = useRef(false);
    const latestCreatedAtRef = useRef<number | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainInputRef = useRef<HTMLInputElement>(null);
    const [morePosts, setMorePosts] = useState<any[]>([]);
    const [hasMoreMsgs, setHasMoreMsgs] = useState(true);
    const [loadingMoreMsgs, setLoadingMoreMsgs] = useState(false);
    const loadingMoreMsgsRef = useRef(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [pinnedPost, setPinnedPost] = useState<any>(null);
    const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [sharePost, setSharePost] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [celebration, setCelebration] = useState<{ memTag: string } | null>(null);
    const [newlyPostedIds, setNewlyPostedIds] = useState<Set<string>>(new Set());
    const [videoEndedIds, setVideoEndedIds] = useState<Set<string>>(new Set());
    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        try { return localStorage.getItem("roar_sound_enabled") !== "false"; } catch { return true; }
    });
    const soundEnabledRef = useRef(soundEnabled);
    const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const topReactionsCache = useRef<Record<string, string[]>>({});
    const [topReactionsMap, setTopReactionsMap] = useState<Record<string, string[]>>({});
    const lastLocalReactAtRef = useRef<Record<string, number>>({});
    const [notifToast, setNotifToast] = useState<{ message: string; type: "like" | "comment"; } | null>(null);
    const [dollyOpen, setDollyOpen] = useState(false);
    const [dollyQuestion, setDollyQuestion] = useState("");
    const [dollyAsking, setDollyAsking] = useState(false);
    const [dollyReplies, setDollyReplies] = useState<{ id: string; question: string; answer: string; createdAt: number }[]>([]);
    const [dollyLoaded, setDollyLoaded] = useState(false);
    // const [dollyHistory, setDollyHistory] = useState<DollyHistorySession[]>([]);
    // const [dollyHistoryLoading, setDollyHistoryLoading] = useState(false);
    // const [dollyActiveRoomId, setDollyActiveRoomId] = useState<string | undefined>(roomId);
    // const [dollyActiveRoomName, setDollyActiveRoomName] = useState<string | undefined>(roomName);
    // const [dollyRepliesLoading, setDollyRepliesLoading] = useState(false);
    // const dollyFetchTokenRef = useRef<symbol | null>(null);
    // const dollyActiveRoomIdRef = useRef<string | undefined>(roomId);

    const [dollyHistory, setDollyHistory] = useState<DollyHistorySession[]>([]);
    const [dollyHistoryLoading, setDollyHistoryLoading] = useState(false);
    const [dollyHistoryLoadingMore, setDollyHistoryLoadingMore] = useState(false);
    const dollyHistoryCursorRef = useRef<number | undefined>(undefined);
    const dollyHistoryExhaustedRef = useRef(false);
    const [dollyActiveSessionId, setDollyActiveSessionId] = useState<string | undefined>(undefined);
    const [dollyActiveRoomName, setDollyActiveRoomName] = useState<string | undefined>(roomName);
    const [dollyRepliesLoading, setDollyRepliesLoading] = useState(false);
    const dollyFetchTokenRef = useRef<symbol | null>(null);
    const dollyActiveSessionIdRef = useRef<string | undefined>(undefined);

    // ── SOUND ──
    const audioCache = useRef<Partial<Record<keyof typeof SOUND_FILES, HTMLAudioElement>>>({});

    const playSound = useCallback((key: keyof typeof SOUND_FILES) => {
        if (!soundEnabledRef.current) return;
        try {
            let audio = audioCache.current[key];
            if (!audio) {
                audio = new Audio(SOUND_FILES[key]);
                audio.volume = 0.5;
                audioCache.current[key] = audio;
            }
            audio.currentTime = 0;
            audio.play().catch(() => { });
        } catch { /* ignore */ }
    }, []);

    // ── AUTHOR CHECK (for delete) ──
    const currentUserIdCandidates = [
        currentUserId,
        userProfile?.actualUserId,
        (userProfile as { userId?: string })?.userId,
        (userProfile as { uid?: string })?.uid,
        (userProfile as { email?: string })?.email,
    ].filter(Boolean).map(String);

    const isCurrentUserAuthor = (post: { authorUid?: unknown; authorEmail?: unknown; fan?: { authorUid?: unknown } }) => {
        const authorCandidates = [post.authorUid, post.fan?.authorUid, post.authorEmail].filter(Boolean).map(String);
        return authorCandidates.some(id => currentUserIdCandidates.includes(id));
    };

    // ── CHANNELS STATE ──
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [channelsLoading, setChannelsLoading] = useState(true);

    useEffect(() => {
        onChannelChange?.(selectedChannelId);
    }, [selectedChannelId, onChannelChange]);

    // ── CHANNEL MENTION STATE ──
    const [showChannelMentionPopup, setShowChannelMentionPopup] = useState(false);
    const [channelMentionUsers, setChannelMentionUsers] = useState<Channel[]>([]);
    const [channelMentionIndex, setChannelMentionIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);

    const channelsFetchTokenRef = useRef<symbol | null>(null);

    // ── Fetch Channels ──
    const fetchChannels = useCallback(async () => {
        if (!roomId) return;
        const requestId = Symbol();
        channelsFetchTokenRef.current = requestId;
        setChannelsLoading(true);
        try {
            const res = await axios.get(`/api/roar/rooms/${roomId}/channels`, { timeout: REQUEST_TIMEOUT_MS });
            if (channelsFetchTokenRef.current !== requestId) return; // stale response, ignore
            const fetchedChannels = res.data?.channels ?? [];
            setChannels(fetchedChannels);
            setSelectedChannelId(prev => prev ?? (fetchedChannels[0]?.channelId ?? null));
        } catch (error) {
            if (channelsFetchTokenRef.current !== requestId) return;
            console.error("Failed to fetch channels:", error);
            setChannels([]);
        } finally {
            if (channelsFetchTokenRef.current === requestId) setChannelsLoading(false);
        }
    }, [roomId]);

    // ── Load channels on mount ──
    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    // ── Channel selection handler ──
    const handleChannelSelect = (channelId: string) => {
        if (selectedChannelId === channelId) return;
        setSelectedChannelId(channelId);
        // Reset posts when channel changes
        latestCreatedAtRef.current = null;
        setPosts([]);
        setMorePosts([]);
        setHasMoreMsgs(true);
        setLoading(true);
    };

    // ── Channel mention handler ──
    const handleChannelMentionInputChange = (value: string, cursorPos: number) => {
        setCursorPosition(cursorPos);
        const before = value.slice(0, cursorPos);
        const hashIndex = before.lastIndexOf("#");

        if (hashIndex !== -1) {
            const afterHash = before.slice(hashIndex + 1);
            // Check if there's a space after the # (meaning it's not a valid mention anymore)
            if (!afterHash.includes(" ")) {
                const filtered = afterHash.trim() === ""
                    ? channels.slice(0, 8)
                    : channels.filter(ch =>
                        ch.name.toLowerCase().includes(afterHash.toLowerCase()) ||
                        ch.slug.toLowerCase().includes(afterHash.toLowerCase())
                    ).slice(0, 8);
                setChannelMentionUsers(filtered);
                setShowChannelMentionPopup(filtered.length > 0);
                setChannelMentionIndex(0);
                return;
            }
        }
        setShowChannelMentionPopup(false);
        setChannelMentionUsers([]);
    };

    // ── Insert channel mention (switches channel, doesn't add to message) ──
    const insertChannelMention = (channel: Channel) => {
        // Remove the #channel text from input
        const before = input.slice(0, cursorPosition);
        const hashIndex = before.lastIndexOf("#");
        // Remove everything from # to cursor position
        const newText = `${input.slice(0, hashIndex)}${input.slice(cursorPosition)}`;
        setInput(newText);
        setShowChannelMentionPopup(false);
        setChannelMentionUsers([]);

        // Switch to the selected channel
        if (channel.channelId !== selectedChannelId) {
            handleChannelSelect(channel.channelId);
            onToast(`Switched to #${channel.name} channel`);
        }

        setTimeout(() => {
            if (mainInputRef.current) {
                const p = hashIndex;
                mainInputRef.current.focus();
                mainInputRef.current.setSelectionRange(p, p);
            }
        }, 10);
    };

    // ── Handle channel mention keydown ──
    const handleChannelMentionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): boolean => {
        if (!showChannelMentionPopup || channelMentionUsers.length === 0) return false;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setChannelMentionIndex(p => (p + 1) % channelMentionUsers.length);
            return true;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setChannelMentionIndex(p => (p - 1 + channelMentionUsers.length) % channelMentionUsers.length);
            return true;
        }
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            if (channelMentionUsers[channelMentionIndex]) {
                insertChannelMention(channelMentionUsers[channelMentionIndex]);
            }
            return true;
        }
        if (e.key === "Escape") {
            setShowChannelMentionPopup(false);
            setChannelMentionUsers([]);
            // Remove the # from input
            const before = input.slice(0, cursorPosition);
            const hashIndex = before.lastIndexOf("#");
            if (hashIndex !== -1) {
                const newText = `${input.slice(0, hashIndex)}${input.slice(cursorPosition)}`;
                setInput(newText);
            }
            return true;
        }
        return false;
    };

    useEffect(() => {
        soundEnabledRef.current = soundEnabled;
    }, [soundEnabled]);

    useEffect(() => {
        if (phog && roomId) {
            phog.capture("enter_room", { room_id: roomId, room_name: roomName || "" });
        }
    }, [phog, roomId, roomName]);

    // useEffect(() => {
    //     dollyActiveRoomIdRef.current = dollyActiveRoomId;
    // }, [dollyActiveRoomId]);
    useEffect(() => {
        dollyActiveSessionIdRef.current = dollyActiveSessionId;
    }, [dollyActiveSessionId]);

    useEffect(() => () => { if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current); }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) setShowEmojiPicker(false);
        };
        if (showEmojiPicker) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker]);

    useEffect(() => {
        if (openMenuPostId) {
            const handler = (e: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuPostId(null);
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
        }
    }, [openMenuPostId]);

    const fetchTopReactions = useCallback(async (msgId: string) => {
        if (topReactionsCache.current[msgId] !== undefined) return;
        topReactionsCache.current[msgId] = [];
        try {
            const url = `/api/roar/posts/${msgId}/reactions${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`;
            const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
            const reactors: { reaction: string }[] = res.data?.reactors ?? [];
            const counts: Record<string, number> = {};
            reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] ?? 0) + 1; });
            const top = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([type]) => type);
            topReactionsCache.current[msgId] = top;
            setTopReactionsMap(prev => ({ ...prev, [msgId]: top }));
        } catch { topReactionsCache.current[msgId] = []; }
    }, [roomId]);

    const mapMessage = useCallback((m: any, existing?: any) => {
        const isPending = pendingReactRef.current[m.msgId];
        return {
            id: m.msgId,
            authorUid: m.authorUid,
            authorEmail: m.authorEmail,
            fan: {
                username: displayUsername(m.authorUsername),
                authorUid: m.authorUid,
                badge: m.authorBadge,
                avatarUrl: m.authorUid === currentUserId ? (userAvatarUrl || m.authorAvatarUrl || m.avatarUrl) : (m.authorAvatarUrl || m.avatarUrl)
            },
            text: m.text,
            fireCount: m.fireCount ?? 0,
            heartCount: m.heartCount ?? 0,
            mindblownCount: m.mindblownCount ?? 0,
            goatCount: m.goatCount ?? 0,
            clapCount: m.clapCount ?? 0,
            nochanceCount: m.noChanceCount ?? 0,
            userReaction: isPending ? (existing?.userReaction ?? null) : (m.userReaction ?? null),
            replyCount: Math.max(m.replyCount ?? 0, existing?.replyCount ?? 0),
            agreeCount: m.agreeCount ?? 0,
            disagreeCount: m.disagreeCount ?? 0,
            userVote: (existing?.userVote && !m.userVote) ? existing.userVote : (m.userVote ?? existing?.userVote ?? null),
            sideA: m.sideA ?? null,
            sideB: m.sideB ?? null,
            predictionOptions: Array.isArray(m.predictionOptions) ? m.predictionOptions : [m.sideA, m.sideB].filter(Boolean),
            predictionOptionCounts: m.predictionOptionCounts ?? {},
            closesAt: m.closesAt ?? null,
            closedAt: m.closedAt ?? null,
            resolvedAt: m.resolvedAt ?? null,
            correctVote: m.correctVote ?? null,
            accuracyAwarded: m.accuracyAwarded ?? false,
            timeAgo: new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) + " · " + new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            createdAt: m.createdAt,
            type: m.type,
            mediaUrls: m.mediaUrls,
            quizQuestion: m.quizQuestion,
            quizOptions: m.quizOptions,
            quizCorrectOption: m.quizCorrectOption,
            quizUserAnswer: m.quizUserAnswer ?? null,
            quizTimer: m.quizTimer,
            quizPoints: m.quizPoints,
            quizParticipants: m.quizParticipants ?? 0,
            memGifUrl: m.memGifUrl ?? null,
            memTag: m.memTag ?? null,
            questions: (() => {
                const q = m.questions;
                if (Array.isArray(q)) return q;
                if (typeof q === "string") { try { return JSON.parse(q); } catch { return []; } }
                return [];
            })(),
            matchTitle: m.matchTitle ?? null,
            triviaQuestions: Array.isArray(m.triviaQuestions) ? m.triviaQuestions : [],
            userTriviaAnswers: m.userTriviaAnswers ?? {},
            matchStartAt: m.matchStartAt ?? null,
            matchEndAt: m.matchEndAt ?? null,
            triviaParticipants: m.triviaParticipants ?? {},
            battleQuestions: Array.isArray(m.battleQuestions) ? m.battleQuestions : [],
            battleVoteCounts: m.battleVoteCounts ?? {},
            userPredictionVotes: m.userPredictionVotes ?? {},
            channelId: m.channelId,
            channelSlug: m.channelSlug,
        };
    }, [currentUserId, userAvatarUrl]);

    const handleVote = useCallback(async (postId: string, voteType: string) => {
        if (!roomId) return;
        setPosts(prev => prev.map(post => {
            if (post.id !== postId) return post;
            let ag = post.agreeCount ?? 0, di = post.disagreeCount ?? 0;
            const predictionOptionCounts = { ...(post.predictionOptionCounts ?? {}) };
            if (voteType === "agree") ag += 1;
            else if (voteType === "disagree") di += 1;
            else predictionOptionCounts[voteType] = (predictionOptionCounts[voteType] ?? 0) + 1;
            return { ...post, userVote: voteType, agreeCount: ag, disagreeCount: di, predictionOptionCounts };
        }));
        try {
            await axios.post(`/api/roar/rooms/${roomId}/messages/${postId}/vote`, { vote: voteType }, { timeout: REQUEST_TIMEOUT_MS });
        } catch {
            onToast("Failed to submit vote");
        }
    }, [roomId, onToast]);

    // ── Fetch messages WITH channel filter ──
    const fetchMsgs = useCallback(async () => {
        if (!roomId) return;
        try {
            let url = latestCreatedAtRef.current
                ? `/api/roar/rooms/${roomId}/messages?since=${latestCreatedAtRef.current}&t=${Date.now()}`
                : `/api/roar/rooms/${roomId}/messages?t=${Date.now()}`;

            // ALWAYS filter by selected channel ID
            if (selectedChannelId) {
                url += `&channelId=${encodeURIComponent(selectedChannelId)}`;
            } else if (channels.length > 0) {
                // If no channel selected, default to the first channel
                const defaultChannelId = channels[0].channelId;
                setSelectedChannelId(defaultChannelId);
                url += `&channelId=${encodeURIComponent(defaultChannelId)}`;
            }

            const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
            if (res.data?.success) {
                if (res.data.counts) setRoomCounts(res.data.counts);
                const incoming: any[] = res.data.messages ?? [];
                if (latestCreatedAtRef.current === null) {
                    setPosts(prev => {
                        const prevMap = Object.fromEntries(prev.map(p => [p.id, p]));
                        return [...res.data.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((m: any) => mapMessage(m, prevMap[m.msgId]));
                    });
                    if (incoming.length > 0) latestCreatedAtRef.current = Math.max(...incoming.map(m => m.createdAt));
                } else if (incoming.length > 0) {
                    latestCreatedAtRef.current = Math.max(...incoming.map((m: any) => m.createdAt));
                    setPosts(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const fresh = incoming.filter((m: any) => !existingIds.has(m.msgId)).map((m: any) => ({ ...mapMessage(m), timeAgo: "now" }));
                        if (fresh.length > 0) playSound("post");
                        return fresh.length > 0 ? [...prev, ...fresh] : prev;
                    });
                }
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [roomId, mapMessage, selectedChannelId, channels, playSound]);

    // ── Load more messages WITH channel filter ──
    const loadMoreMsgs = useCallback(async () => {
        if (!roomId || loadingMoreMsgsRef.current || !hasMoreMsgs) return;
        const combined = [...posts, ...morePosts];
        if (combined.length === 0) return;
        const oldestCreatedAt = combined.reduce((min, p) => (p.createdAt < min ? p.createdAt : min), combined[0].createdAt);
        loadingMoreMsgsRef.current = true; setLoadingMoreMsgs(true);
        try {
            let url = `/api/roar/rooms/${roomId}/messages?limit=15&lastCreatedAt=${oldestCreatedAt}`;
            if (selectedChannelId) {
                url += `&channelId=${encodeURIComponent(selectedChannelId)}`;
            }
            const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
            if (res.data?.success) {
                const newMsgs: any[] = res.data.messages ?? [];
                setMorePosts(prev => {
                    const seenIds = new Set([...posts, ...prev].map(p => p.id ?? p.msgId));
                    const fresh = newMsgs.filter(m => !seenIds.has(m.msgId)).map(m => mapMessage(m));
                    return [...fresh, ...prev];
                });
                setHasMoreMsgs(Boolean(res.data.pagination?.hasMore));
            } else { setHasMoreMsgs(false); }
        } catch (e) { console.error("Failed to load more messages:", e); }
        finally { loadingMoreMsgsRef.current = false; setLoadingMoreMsgs(false); }
    }, [roomId, hasMoreMsgs, posts, morePosts, mapMessage, selectedChannelId]);

    const refreshActiveFans = useCallback(async () => {
        if (!roomId) return;
        try {
            const res = await axios.get(`/api/roar/rooms/${roomId}/presence`, { timeout: PRESENCE_TIMEOUT_MS });
            if (res.data?.success) {
                setActiveFans(res.data.fans ?? []);
                setLiveCount(res.data.fanCount ?? 0);
                if (res.data.totalJoinCount !== undefined) setTotalJoinCount(res.data.totalJoinCount);
                setPinnedPost(res.data.pinnedPost ?? null);
            }
        } catch (e) { console.error("Active fans fetch failed:", e); }
    }, [roomId]);

    // ── Fetch reaction updates WITH channel filter ──
    const fetchReactionUpdates = useCallback(async () => {
        if (!roomId) return;
        try {
            let url = `/api/roar/rooms/${roomId}/messages?t=${Date.now()}`;
            if (selectedChannelId) {
                url += `&channelId=${encodeURIComponent(selectedChannelId)}`;
            }
            const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
            if (res.data?.success) {
                const incoming: any[] = res.data.messages ?? [];
                const isLocked = (id: string) => {
                    const t = lastLocalReactAtRef.current[id];
                    return t !== undefined && Date.now() - t < 6000;
                };
                setPosts(prev => prev.map(p => {
                    const updated = incoming.find((m: any) => m.msgId === p.id);
                    if (!updated) return p;
                    const isPending = pendingReactRef.current[p.id] || isLocked(p.id);
                    return {
                        ...p,
                        heartCount: isPending ? p.heartCount : (updated.heartCount ?? p.heartCount),
                        userReaction: isPending ? p.userReaction : (updated.userReaction ?? null),
                        replyCount: Math.max(p.replyCount ?? 0, updated.replyCount ?? 0),
                        agreeCount: updated.agreeCount ?? p.agreeCount,
                        disagreeCount: updated.disagreeCount ?? p.disagreeCount,
                        userVote: (p.userVote && !updated.userVote) ? p.userVote : (updated.userVote ?? p.userVote ?? null),
                    };
                }));
                setMorePosts(prev => prev.map(p => {
                    const updated = incoming.find((m: any) => m.msgId === p.id);
                    if (!updated) return p;
                    return {
                        ...p,
                        replyCount: Math.max(p.replyCount ?? 0, updated.replyCount ?? 0),
                        agreeCount: updated.agreeCount ?? p.agreeCount,
                        disagreeCount: updated.disagreeCount ?? p.disagreeCount,
                        userVote: (p.userVote && !updated.userVote) ? p.userVote : (updated.userVote ?? p.userVote ?? null),
                    };
                }));
                setLocalReactions(prev => {
                    const next = { ...prev };
                    incoming.forEach((m: any) => {
                        if (!pendingReactRef.current[m.msgId] && !isLocked(m.msgId)) {
                            next[m.msgId] = { reaction: m.userReaction ?? null, heartCount: m.heartCount ?? 0 };
                        }
                    });
                    return next;
                });
            }
        } catch { }
    }, [roomId, selectedChannelId]);

    // const loadDollyHistory = useCallback(async () => {
    //     setDollyHistoryLoading(true);
    //     try {
    //         const res = await axios.get("/api/roar/dolly/rooms", { timeout: REQUEST_TIMEOUT_MS });
    //         const rooms: any[] = res.data?.rooms ?? [];
    //         const mapped: DollyHistorySession[] = rooms
    //             .filter(r => r.roomId !== roomId)
    //             .map(r => ({
    //                 roomId: r.roomId,
    //                 title: r.title,
    //                 subtitle: r.lastQuestion || "No questions yet",
    //                 dateLabel: new Date(r.lastAskedAt).toLocaleDateString([], { month: "short", day: "numeric" }),
    //                 sport: r.sport,
    //             }));
    //         setDollyHistory([
    //             { roomId: roomId!, title: roomName || "This match", subtitle: "", dateLabel: "Today", isLive: true },
    //             ...mapped,
    //         ]);
    //     } catch { setDollyHistory(roomId ? [{ roomId, title: roomName || "This match", subtitle: "", dateLabel: "Today", isLive: true }] : []); }
    //     finally { setDollyHistoryLoading(false); }
    // }, [roomId, roomName]);

    const loadDollyHistory = useCallback(async () => {
        if (!roomId) return;
        setDollyHistoryLoading(true);
        dollyHistoryCursorRef.current = undefined;
        dollyHistoryExhaustedRef.current = false;
        try {
            const res = await axios.get(`/api/roar/rooms/${roomId}/dolly/sessions`, { timeout: REQUEST_TIMEOUT_MS });
            const sessions = res.data?.sessions ?? [];
            setDollyHistory(sessions.map((s: any) => ({
                sessionId: s.sessionId, roomId: roomId!, title: s.title, subtitle: "", dateLabel: s.dateLabel,
            })));
            dollyHistoryCursorRef.current = res.data?.nextBefore;
            if (sessions.length === 0) dollyHistoryExhaustedRef.current = true;
        } catch { setDollyHistory([]); }
        finally { setDollyHistoryLoading(false); }
    }, [roomId]);

    const loadMoreDollyHistory = useCallback(async () => {
        if (!roomId || dollyHistoryExhaustedRef.current || dollyHistoryLoadingMore) return;
        setDollyHistoryLoadingMore(true);
        try {
            const before = dollyHistoryCursorRef.current;
            const res = await axios.get(`/api/roar/rooms/${roomId}/dolly/sessions`, {
                params: before ? { before } : undefined, timeout: REQUEST_TIMEOUT_MS,
            });
            const sessions = res.data?.sessions ?? [];
            if (sessions.length === 0) { dollyHistoryExhaustedRef.current = true; }
            else {
                setDollyHistory(prev => [...prev, ...sessions.map((s: any) => ({
                    sessionId: s.sessionId, roomId: roomId!, title: s.title, subtitle: "", dateLabel: s.dateLabel,
                }))]);
                dollyHistoryCursorRef.current = res.data?.nextBefore;
            }
        } catch { /* leave as-is */ }
        finally { setDollyHistoryLoadingMore(false); }
    }, [roomId, dollyHistoryLoadingMore]);

    const ensureDollySession = useCallback(async (): Promise<string | null> => {
        if (dollyActiveSessionId) return dollyActiveSessionId;
        if (!roomId) return null;
        try {
            const res = await axios.post(`/api/roar/rooms/${roomId}/dolly/sessions`, {}, { timeout: REQUEST_TIMEOUT_MS });
            const newId = res.data?.sessionId;
            if (newId) { setDollyActiveSessionId(newId); dollyActiveSessionIdRef.current = newId; }
            return newId ?? null;
        } catch { onToast("Failed to start conversation"); return null; }
    }, [dollyActiveSessionId, roomId, onToast]);

    useEffect(() => {
        if (dollyOpen) loadDollyHistory();
    }, [roomId, dollyOpen, loadDollyHistory]);

    useEffect(() => {
        if (!roomId) return;
        const join = async () => {
            try {
                await axios.post(`/api/roar/rooms/${roomId}/presence`, undefined, { timeout: PRESENCE_TIMEOUT_MS });
                refreshActiveFans();
            } catch (e) { console.error("Join failed:", e); }
        };
        join();
        const heartbeat = setInterval(() => { if (!document.hidden) join(); }, 30000);
        const fanRefresh = setInterval(() => { if (!document.hidden) refreshActiveFans(); }, 120000);
        const leave = () => { navigator.sendBeacon(`/api/roar/rooms/${roomId}/presence/leave`); };
        window.addEventListener("beforeunload", leave);
        return () => {
            axios.delete(`/api/roar/rooms/${roomId}/presence`).catch(() => { });
            clearInterval(heartbeat);
            clearInterval(fanRefresh);
            window.removeEventListener("beforeunload", leave);
        };
    }, [roomId, refreshActiveFans]);

    useEffect(() => {
        try {
            setUserUsername(userProfile?.username || localStorage.getItem("roar_username") || "RoarUser");
            setUserAvatarUrl(currentAvatarUrl || userProfile?.avatarUrl || userProfile?.avatar || localStorage.getItem("roar_avatar_url") || undefined);
        } catch { }
    }, [currentAvatarUrl, userProfile]);

    // useEffect(() => {
    //     if (!roomId) { setDollyReplies([]); setDollyLoaded(true); return; }
    //     const requestId = Symbol();
    //     dollyFetchTokenRef.current = requestId;
    //     setDollyActiveRoomId(roomId);
    //     setDollyActiveRoomName(roomName);
    //     setDollyLoaded(false);
    //     axios.get(`/api/roar/rooms/${roomId}/dolly`, { timeout: REQUEST_TIMEOUT_MS })
    //         .then(res => {
    //             if (dollyFetchTokenRef.current !== requestId) return;
    //             setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
    //         })
    //         .catch(() => { if (dollyFetchTokenRef.current === requestId) setDollyReplies([]); })
    //         .finally(() => { if (dollyFetchTokenRef.current === requestId) setDollyLoaded(true); });
    // }, [roomId, roomName]);
    useEffect(() => {
        setDollyActiveSessionId(undefined);
        dollyActiveSessionIdRef.current = undefined;
        setDollyActiveRoomName(roomName);
        setDollyReplies([]);
        setDollyLoaded(true);
    }, [roomId, roomName]);

    useEffect(() => { onRegisterRefresh?.(fetchMsgs); }, [fetchMsgs, onRegisterRefresh]);
    useEffect(() => {
        onRegisterReplyUpdate?.((postId, count) => {
            setPosts(p => p.map(x => x.id === postId ? { ...x, replyCount: count } : x));
        });
    }, [onRegisterReplyUpdate]);

    const injectPost = useCallback((post: any) => {
        setPosts(p => [...p, post]);
        playSound("post");
        setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
    }, [playSound]);

    const optimisticSwap = useCallback((tempId: string, realMsg?: any) => {
        if (!realMsg) { setPosts(p => p.filter(x => x.id !== tempId)); return; }
        setPosts(p => p.map(x => x.id === tempId ? { ...mapMessage(realMsg), timeAgo: "now" } : x));
    }, [mapMessage]);

    useEffect(() => { onRegisterInjectPost?.(injectPost); }, [injectPost, onRegisterInjectPost]);
    useEffect(() => { onRegisterOptimisticSwap?.(optimisticSwap); }, [optimisticSwap, onRegisterOptimisticSwap]);

    useEffect(() => {
        latestCreatedAtRef.current = null;
        setPosts([]);
        setMorePosts([]);
        setHasMoreMsgs(true);
        setLoading(true);
        setRoomCounts({ post: 0, debate: 0, prediction: 0, trivia: 0, battle: 0 });
        setPinnedPost(null);
        setLocalReactions({});
        topReactionsCache.current = {};
        setTopReactionsMap({});
        setOpenInlinePostId(null);
        setActiveFilter("all");
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;
        fetchMsgs();
    }, [fetchMsgs, roomId, selectedChannelId]);

    useVisibilityInterval(fetchMsgs, 15000);
    useVisibilityInterval(fetchReactionUpdates, 5000);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) loadMoreMsgs(); }, { root: listRef.current, rootMargin: "200px 0px 0px 0px", threshold: 0 });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadMoreMsgs]);

    useEffect(() => {
        if (!loading && listRef.current)
            setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 50);
    }, [loading]);

    useEffect(() => {
        const newCount = posts.length;
        if (newCount > posts.length && listRef.current) {
            setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
        }
    }, [posts.length]);

    const startPostCooldown = useCallback(() => {
        setPostCooldown(10);
        if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = setInterval(() => {
            setPostCooldown(prev => {
                if (prev <= 1) {
                    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const renameDollySession = useCallback(async (sessionId: string, newTitle: string) => {
    if (!roomId) return;
    setDollyHistory(prev => prev.map(s => s.sessionId === sessionId ? { ...s, title: newTitle } : s));
    try {
        await axios.patch(`/api/roar/rooms/${roomId}/dolly/${sessionId}`, { customTitle: newTitle }, { timeout: REQUEST_TIMEOUT_MS });
    } catch {
        onToast("Failed to rename conversation");
        loadDollyHistory();
    }
}, [roomId, onToast, loadDollyHistory]);

const handleNewDollyChat = useCallback(() => {
    dollyFetchTokenRef.current = Symbol();
    setDollyQuestion("");
    setDollyReplies([]);
    setDollyActiveSessionId(undefined);
    dollyActiveSessionIdRef.current = undefined;
}, []);

const deleteDollySession = useCallback(async (sessionId: string) => {
    if (!roomId) return;
    setDollyHistory(prev => prev.filter(s => s.sessionId !== sessionId));
    if (dollyActiveSessionId === sessionId) handleNewDollyChat();
    try {
        await axios.delete(`/api/roar/rooms/${roomId}/dolly/${sessionId}`, { timeout: REQUEST_TIMEOUT_MS });
    } catch {
        onToast("Failed to delete conversation");
        loadDollyHistory();
    }
}, [roomId, dollyActiveSessionId, handleNewDollyChat, onToast, loadDollyHistory]);

    const handleBack = (e: React.PointerEvent | React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onBack(); };

    const handleReact = useCallback(async (msgId: string, reaction: Reaction | null) => {
        if (!roomId || pendingReactRef.current[msgId]) return;
        const post = posts.find(p => p.id === msgId);
        const prev = localReactionsRef.current[msgId] ?? { reaction: post?.userReaction ?? null, heartCount: post?.heartCount ?? 0 };
        const sameReaction = prev.reaction === reaction;
        const newReaction = sameReaction ? null : reaction;
        const wasActive = prev.reaction !== null;
        const newActive = newReaction !== null;
        const countDelta = newActive && !wasActive ? 1 : (!newActive && wasActive ? -1 : 0);
        const optimisticState = { reaction: newReaction, heartCount: Math.max(0, prev.heartCount + countDelta) };
        setLocalReactions(p => ({ ...p, [msgId]: optimisticState }));
        lastLocalReactAtRef.current[msgId] = Date.now();
        pendingReactRef.current[msgId] = true;
        const failsafe = setTimeout(() => { pendingReactRef.current[msgId] = false; }, REQUEST_TIMEOUT_MS + 3000);
        try {
            const res: any = newReaction === null ? await roarApi.unreactPost(msgId, roomId) : await roarApi.reactPost(msgId, newReaction, roomId);
            if (res && typeof res.likeCount === "number") {
                setLocalReactions(p => ({ ...p, [msgId]: { ...optimisticState, heartCount: res.likeCount } }));
                lastLocalReactAtRef.current[msgId] = Date.now();
            }
        } catch { setLocalReactions(p => ({ ...p, [msgId]: prev })); onToast("Failed to save reaction"); }
        finally { clearTimeout(failsafe); pendingReactRef.current[msgId] = false; }
    }, [roomId, posts, onToast]);

    // ── Delete post ──
    const handleDeletePost = useCallback(async (postId: string) => {
        if (!roomId) return;
        setOpenMenuPostId(null);
        if (!window.confirm("Delete this post?")) return;
        try {
            await axios.delete(`/api/roar/rooms/${roomId}/messages/${postId}`, { timeout: REQUEST_TIMEOUT_MS });
            setPosts(prev => prev.filter(x => x.id !== postId));
            setMorePosts(prev => prev.filter(x => x.id !== postId));
        } catch {
            onToast("Failed to delete post");
        }
    }, [roomId, onToast]);

    // ── Send message with channelId ──
    const send = async () => {
        if (!roomId || postCooldown > 0 || sendingRef.current) return;
        const text = input.trim();
        if (!text && !attachedUrl) {
            onToast("Please enter a message");
            return;
        }

        // Clean any #channel mentions from the text (they should have been removed)
        const cleanText = text.replace(/^#\w+\s*/, '').trim();
        const finalText = cleanText || text;

        if (!finalText && !attachedUrl) {
            onToast("Please enter a message");
            return;
        }

        sendingRef.current = true; setIsSending(true);
        const failsafe = setTimeout(() => { sendingRef.current = false; setIsSending(false); }, REQUEST_TIMEOUT_MS + 3000);
        const clientMsgId = `${currentUserId || "anon"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        try {
            const payload: any = {
                text: finalText || "Shared media",
                type: mode,
                mediaUrls: attachedUrl ? [attachedUrl] : undefined,
                clientMsgId,
            };

            // ALWAYS include the selected channel ID when posting
            if (selectedChannelId) {
                payload.channelId = selectedChannelId;
            } else if (channels.length > 0) {
                // If no channel selected, use the first one
                payload.channelId = channels[0].channelId;
            } else {
                // No channels available - can't post
                onToast("No channels available. Please create a channel first.");
                sendingRef.current = false;
                setIsSending(false);
                return;
            }

            const res = await axios.post(
                `/api/roar/rooms/${roomId}/messages`,
                payload,
                { timeout: REQUEST_TIMEOUT_MS }
            );
            if (res.data?.success) {
                const m = res.data.message;
                // Only add to posts if it belongs to the current channel
                if (m.channelId === selectedChannelId) {
                    setPosts(p => [...p, {
                        id: m.msgId,
                        authorUid: m.authorUid,
                        authorEmail: m.authorEmail,
                        fan: { username: displayUsername(m.authorUsername), authorUid: m.authorUid, badge: m.authorBadge, avatarUrl: m.authorAvatarUrl || m.avatarUrl || (m.authorUsername === userUsername ? userAvatarUrl : undefined) },
                        text: m.text,
                        fireCount: m.fireCount ?? 0,
                        heartCount: m.heartCount ?? 0,
                        mindblownCount: m.mindblownCount ?? 0,
                        goatCount: m.goatCount ?? 0,
                        clapCount: m.clapCount ?? 0,
                        nochanceCount: m.noChanceCount ?? 0,
                        userReaction: null,
                        replyCount: 0,
                        agreeCount: 0,
                        disagreeCount: 0,
                        userVote: null,
                        sideA: m.sideA ?? null,
                        sideB: m.sideB ?? null,
                        timeAgo: "now",
                        createdAt: m.createdAt || Date.now(),
                        type: m.type,
                        mediaUrls: m.mediaUrls,
                        quizQuestion: m.quizQuestion,
                        quizOptions: m.quizOptions,
                        quizCorrectOption: m.quizCorrectOption,
                        quizUserAnswer: m.quizUserAnswer ?? null,
                        quizTimer: m.quizTimer,
                        quizPoints: m.quizPoints,
                        quizParticipants: m.quizParticipants ?? 0,
                        memGifUrl: m.memGifUrl ?? null,
                        memTag: m.memTag ?? null,
                        channelId: m.channelId || selectedChannelId,
                    }]);
                    setInput(""); setAttachedUrl(null); setAttachedType(null);
                    playSound("post");
                    startPostCooldown();
                    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
                }
            }
        } catch { onToast("Failed to send message"); }
        finally { clearTimeout(failsafe); sendingRef.current = false; setIsSending(false); }
    };

    // ── Quick react with channelId ──
    const handleQuickReactPost = async (opt: typeof QUICK_REACT_OPTS[0]) => {
        if (!roomId) return;
        setShowQuickCompose(false);
        const memTag = opt.id.replace("qr_", "");
        const tempId = `temp-qr-${Date.now()}`;
        const optimisticMsg: any = {
            id: tempId,
            fan: { username: displayUsername(userUsername), authorUid: "", badge: "", avatarUrl: userAvatarUrl },
            text: opt.label,
            fireCount: 0, heartCount: 0, mindblownCount: 0, goatCount: 0, clapCount: 0, nochanceCount: 0,
            userReaction: null, replyCount: 0, agreeCount: 0, disagreeCount: 0, userVote: null,
            sideA: null, sideB: null, timeAgo: "Sending...", createdAt: Date.now(),
            type: "post", mediaUrls: [], quizQuestion: null, quizOptions: null,
            quizCorrectOption: null, quizUserAnswer: null, quizTimer: null, quizPoints: null,
            quizParticipants: 0, memGifUrl: null, memTag: memTag, status: "sending"
        };
        setPosts(p => [...p, optimisticMsg]);
        try {
            const payload: any = {
                text: opt.label,
                type: "post",
                memTag,
            };
            // ALWAYS include the selected channel ID
            if (selectedChannelId) {
                payload.channelId = selectedChannelId;
            } else if (channels.length > 0) {
                payload.channelId = channels[0].channelId;
            } else {
                onToast("No channels available. Please create a channel first.");
                setPosts(p => p.filter(post => post.id !== tempId));
                return;
            }

            const res = await axios.post(`/api/roar/rooms/${roomId}/messages`, payload, { timeout: REQUEST_TIMEOUT_MS });
            if (res.data?.success) {
                const m = res.data.message;
                // Only keep in posts if it belongs to current channel
                if (m.channelId === selectedChannelId) {
                    setPosts(p => {
                        if (p.some(post => post.id === m.msgId)) return p.filter(post => post.id !== tempId);
                        return p.map(post => post.id === tempId ? { ...post, id: m.msgId, authorUid: m.authorUid, authorEmail: m.authorEmail, status: "sent", timeAgo: "now", createdAt: m.createdAt || Date.now(), memGifUrl: m.memGifUrl, channelId: m.channelId } : post);
                    });
                    setNewlyPostedIds(prev => new Set([...prev, m.msgId]));
                    playSound("post");
                    if (["wicket", "six", "four", "goal", "redcard", "catch", "frango", "yellowcard"].includes(memTag)) {
                        setCelebration({ memTag });
                    }
                    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
                    onToast(`${opt.emoji} ${opt.label} posted!`);
                } else {
                    setPosts(p => p.filter(post => post.id !== tempId));
                    onToast("Post created but not in current channel view");
                }
            } else {
                setPosts(p => p.filter(post => post.id !== tempId));
                onToast(res.data?.error || "Failed to post");
            }
        } catch {
            setPosts(p => p.filter(post => post.id !== tempId));
            onToast("Failed to post");
        }
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
            const res = await axios.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 });
            if (res.data?.url) { setAttachedUrl(res.data.url); onToast("Media uploaded!"); }
        } catch { onToast("Upload failed"); setAttachedType(null); }
        finally { setUploading(false); if (e.target) e.target.value = ""; }
    };

    const shareRoomLink = () => {
        if (typeof navigator !== "undefined" && navigator.share) navigator.share({ title: "SF360 Infinity Room", url: window.location.href });
        else { navigator.clipboard.writeText(window.location.href).then(() => onToast("Link copied!")); }
    };

    const toggleSound = () => {
        setSoundEnabled(prev => {
            const next = !prev;
            localStorage.setItem("roar_sound_enabled", String(next));
            return next;
        });
    };

    const composeIconMap: Record<string, React.ReactNode> = {
        hot_take: <Flame size={13} stroke="url(#dr-pink-orange-grad)" fill="url(#dr-pink-orange-grad)" />,
        prediction: <TrendingUp size={13} stroke="url(#dr-pink-orange-grad)" />,
        debate: <Zap size={13} stroke="url(#dr-pink-orange-grad)" fill="url(#dr-pink-orange-grad)" />,
        memory: <History size={13} stroke="url(#dr-pink-orange-grad)" />,
        post: <PenTool size={13} stroke="url(#dr-pink-orange-grad)" />,
        quiz: <Brain size={13} stroke="url(#dr-pink-orange-grad)" />,
    };

    const REACTION_EMOJI: Record<string, string> = {
        fire: "🔥", heart: "❤️", mindblown: "🤯", goat: "🐐", clap: "👏",
        nochance: "🙅", laugh: "😂", sad: "😢", thumb: "👍",
    };

    const allVisiblePosts = React.useMemo(() => {
        const seen = new Set<string>();
        return [...morePosts, ...posts].filter(p => {
            if (p.type === "predictions_live") return false;
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        });
    }, [morePosts, posts]);

    // ── Filter posts by channel first, then by category ──
    const filteredPosts = React.useMemo(() => {
        let postsToFilter = allVisiblePosts;

        // Filter by selected channel
        if (selectedChannelId) {
            postsToFilter = postsToFilter.filter(p => p.channelId === selectedChannelId);
        }

        // Then apply category filter
        if (activeFilter === "all") {
            return postsToFilter;
        }

        return postsToFilter.filter(p => {
            if (activeFilter === "post") return p.type === "post" || !p.type;
            return p.type === activeFilter;
        });
    }, [allVisiblePosts, selectedChannelId, activeFilter]);

    const renderReactionPicker = (p: any) => {
        const lo = localReactions[p.id];
        const currentReaction: Reaction | null = lo !== undefined ? lo.reaction : (p.userReaction ?? null);
        const heartCount = lo !== undefined ? lo.heartCount : (p.heartCount ?? 0);
        return (
            <div onClick={e => e.stopPropagation()}>
                <ReactionPicker
                    currentReaction={currentReaction}
                    count={heartCount}
                    onReact={(r) => handleReact(p.id, r)}
                    postId={p.id}
                    roomId={roomId}
                    roomName={roomName}
                />
            </div>
        );
    };

    const renderReactionsTrigger = (p: any) => {
        const lo = localReactions[p.id];
        const heartCount = lo !== undefined ? lo.heartCount : (p.heartCount ?? 0);
        if (heartCount === 0) return null;
        const topReactions = topReactionsMap[p.id] ?? [];
        if (topReactions.length === 0 && !topReactionsCache.current[p.id]) fetchTopReactions(p.id);
        const currentReaction = lo?.reaction ?? p.userReaction ?? null;
        const displayReactions = topReactions.length > 0 ? topReactions : currentReaction ? [currentReaction] : [];
        if (displayReactions.length === 0) return null;
        return (
            <motion.button whileTap={{ scale: 0.93 }} onClick={e => { e.stopPropagation(); setReactionsMsgId(p.id); }} style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", marginLeft: "auto", padding: 0 }} title="See who reacted">
                <div style={{ display: "flex" }}>
                    {displayReactions.map((type, i) => (
                        <div key={type} style={{ width: 18, height: 18, borderRadius: "50%", background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, marginLeft: i === 0 ? 0 : -5, zIndex: displayReactions.length - i, position: "relative" }}>
                            {REACTION_EMOJI[type] ?? "❤️"}
                        </div>
                    ))}
                </div>
            </motion.button>
        );
    };

    // Get current channel name for display
    const currentChannelName = channels.find(c => c.channelId === selectedChannelId)?.name || 'Unknown';


    // ── Derive sport from the selected channel (name or slug) ──
    const currentChannelSport = React.useMemo<"cricket" | "football" | null>(() => {
        const ch = channels.find(c => c.channelId === selectedChannelId);
        if (!ch) return null;
        const key = `${ch.name} ${ch.slug}`.toLowerCase();
        if (key.includes("cricket")) return "cricket";
        if (key.includes("football") || key.includes("soccer")) return "football";
        return null;
    }, [channels, selectedChannelId]);

    // ── Quick-react options filtered to the active channel's sport ──
    const visibleQuickReactOpts = React.useMemo(() => {
        if (!currentChannelSport) return QUICK_REACT_OPTS; // fallback: show all if we can't tell
        return QUICK_REACT_OPTS.filter(
            (q) => q.sport === currentChannelSport || q.sport === "both"
        );
    }, [currentChannelSport]);

    // ── Get placeholder text based on selected channel ──
    const getPlaceholder = () => {
        if (postCooldown > 0) {
            return `Wait ${postCooldown}s before posting …`;
        }
        if (uploading) {
            return "Uploading media...";
        }
        if (selectedChannelId && currentChannelName !== 'Unknown') {
            return `Message to #${currentChannelName}...`;
        }
        return "Type # to switch channel...";
    };

    return (
        <div className="flex flex-col w-full bg-[#0e0e14]" style={{ height: "100%", overflow: "hidden" }}>
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <linearGradient id="dr-pink-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e91e8c" /><stop offset="100%" stopColor="#ff6b35" />
                </linearGradient>
            </svg>

            {/* ── HEADER ── */}
            <div className="shrink-0 px-2 py-1 bg-[rgba(14,14,20,0.98)] backdrop-blur-[20px] border-b border-[var(--border)]" style={{ overflow: "visible", position: "relative", zIndex: 40 }}>
                <div className="flex justify-between items-center gap-1">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                        <div className="text-left pt-0 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                                <ActiveFansStack
                                    fans={activeFans}
                                    count={liveCount}
                                    totalJoinCount={totalJoinCount}
                                    onClick={() => { refreshActiveFans(); setActiveFansOpen(true); }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            type="button"
                            onClick={toggleSound}
                            className="flex-shrink-0 rounded-[6px] cursor-pointer text-[rgba(255,255,255,0.75)] flex items-center justify-center hover:bg-white/5 transition-colors"
                            style={{ width: "26px", height: "26px" }}
                            title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
                        >
                            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                        </button>
                        <button
                            type="button"
                            onClick={shareRoomLink}
                            className="flex-shrink-0 rounded-[6px] cursor-pointer text-[rgba(255,255,255,0.75)] flex items-center justify-center hover:bg-white/5 transition-colors"
                            style={{ width: "26px", height: "26px" }}
                        >
                            <Share2 size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CHANNELS SECTION ── */}
            {!channelsLoading && channels.length > 0 && (
                <div className="shrink-0 px-2 py-1 bg-[rgba(14,14,20,0.98)] border-b border-[var(--border)] overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    <div className="flex items-center gap-1.5">

                        <img src="/images/categoryiconbg.png" alt="category-icon" className="w-4 h-4 object-cover" />

                        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                            {channels.map((channel) => (
                                <button
                                    key={channel.channelId}
                                    type="button"
                                    onClick={() => handleChannelSelect(channel.channelId)}
                                    className={`flex items-center gap-1 px-2.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all duration-150 flex-shrink-0 ${selectedChannelId === channel.channelId
                                        ? "bg-gradient-to-r from-[#e91e8c] to-[#ff6b35] text-white shadow-lg shadow-pink-500/20"
                                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-white/5"
                                        }`}
                                >
                                    {/* <span className="text-[12px]">{channel.icon || "💬"}</span> */}
                                    # {channel.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {channelsLoading && (
                <div className="shrink-0 px-2 py-1.5 bg-[rgba(14,14,20,0.98)] border-b border-[var(--border)]">
                    <div className="flex items-center gap-1.5">
                        <Hash size={12} className="text-white/20" />
                        <span className="text-[9px] text-white/30">Loading channels...</span>
                    </div>
                </div>
            )}

            {/* ── PINNED POST ── */}
            {pinnedPost && (
                <div className="shrink-0 px-3 py-0.5 bg-[rgba(233,30,140,0.08)] border-b border-[rgba(233,30,140,0.18)] flex items-center gap-1.5 cursor-pointer">
                    <span className="text-[9px] shrink-0">📌</span>
                    <p className="m-0 text-[10px] text-white/85 whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                        <span className="font-bold text-[#e91e8c]">Pinned: </span>
                        {pinnedPost.text}
                    </p>
                    <ChevronDown size={12} className="text-white/35 shrink-0 -rotate-90" />
                </div>
            )}

            {/* ── CATEGORY FILTERS ── */}
            <div className="flex justify-start gap-1 py-1 px-2 overflow-x-auto shrink-0 border-b border-[var(--border)]" style={{ scrollbarWidth: "none" }}>
                {(["all", "post", "debate", "prediction", "trivia", "battle"] as const).map((f) => {
                    const isActive = activeFilter === f;
                    const count = f === "post" ? roomCounts.post : f === "debate" ? roomCounts.debate : f === "prediction" ? roomCounts.prediction : f === "trivia" ? roomCounts.trivia : f === "battle" ? roomCounts.battle : 0;
                    const color = f === "post" ? "#e91e8c" : f === "debate" ? "#60a5fa" : f === "prediction" ? "#fbbf24" : f === "trivia" ? "#22c55e" : f === "battle" ? "#E91E8C" : "#fff";
                    const label = f === "all" ? "All" : f === "post" ? "Posts" : f === "debate" ? "Debates" : f === "prediction" ? "Predictions" : f === "trivia" ? "Trivia" : "Battles";
                    return (
                        <button key={f} type="button" onClick={() => setActiveFilter(f)}
                            className="flex items-center gap-1 px-2 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 transition-all duration-150"
                            style={{ background: isActive ? `${color}22` : "rgba(255,255,255,0.05)", border: `1.5px solid ${isActive ? `${color}70` : "rgba(255,255,255,0.1)"}`, color: isActive ? color : "rgba(255,255,255,0.5)" }}
                        >
                            {f !== "all" && <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} />}
                            {label}
                            {f !== "all" && !isActive && count > 0 && (
                                <span className="text-[8px] font-extrabold px-1 rounded-full" style={{ background: `${color}28`, color }}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── MESSAGES LIST ── */}
            <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 flex flex-col gap-0 min-h-0">
                {loading || !dollyLoaded ? (
                    <div className="text-center text-[var(--text-muted)] py-6 text-xs">Loading messages...</div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center text-[var(--text-muted)] py-6 text-xs">
                        {channels.length > 0 && selectedChannelId ? (
                            <>No messages in <strong className="text-white">{currentChannelName}</strong> channel yet. Start the conversation!</>
                        ) : (
                            <>No messages yet. Start the conversation!</>
                        )}
                    </div>
                ) : (
                    filteredPosts.map((p) => {
                        const defaultPayload = { id: p.id, text: p.text, fan: p.fan, timeAgo: p.timeAgo, createdAt: p.createdAt, type: p.type || "post", isDbPost: true, roomId, mediaUrls: p.mediaUrls };
                        const replyCount = p.replyCount || 0;
                        const defaultOpen = replyCount > 0;
                        const isOpen = openInlinePostId === p.id || (defaultOpen && !explicitlyClosedPostIds.has(p.id));
                        const accent = commentAccentColor(p.type || "post");

                        return (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
                                className="cursor-pointer" style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                                onClick={() => onPostClick?.(defaultPayload)}
                            >
                                {/* Post Header */}
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, minWidth: 0 }} onClick={e => e.stopPropagation()}>
                                    <div style={{ flexShrink: 0, cursor: "pointer" }} onClick={e => { e.stopPropagation(); onFanProfile?.(p.fan); }}>
                                        <AvatarWithBadge username={p.fan.username} badge={p.fan.badge} size="sm" avatarUrl={p.fan.avatarUrl} />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: 700, fontSize: 10, color: "#fff", whiteSpace: "nowrap", cursor: "pointer" }} onClick={e => { e.stopPropagation(); onFanProfile?.(p.fan); }}>
                                            {p.fan.username}
                                        </span>
                                        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)", whiteSpace: "nowrap" }}>{p.timeAgo}</span>
                                        {p.type && (
                                            <span className={typeBadgeClass(p.type)}>
                                                {p.type === "post" ? "POST" : p.type === "hottake" ? "HOT TAKE" : p.type === "prediction" ? "PREDICTION" : p.type === "debate" ? "DEBATE" : p.type === "raw_reactions" ? "RAW REACTIONS" : p.type.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* ── Post menu (delete own posts) ── */}
                                    {isCurrentUserAuthor(p) && (
                                        <div style={{ position: "relative", flexShrink: 0 }} ref={openMenuPostId === p.id ? menuRef : undefined}>
                                            <button
                                                onClick={e => { e.stopPropagation(); setOpenMenuPostId(openMenuPostId === p.id ? null : p.id); }}
                                                style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 3, borderRadius: "50%" }}
                                            >
                                                <MoreVertical size={14} />
                                            </button>
                                            <AnimatePresence>
                                                {openMenuPostId === p.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                        transition={{ duration: 0.12 }}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{ position: "absolute", top: "calc(100% + 3px)", right: 0, zIndex: 30, background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden", minWidth: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
                                                    >
                                                        <button
                                                            onClick={() => handleDeletePost(p.id)}
                                                            style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: "none", border: "none", cursor: "pointer", color: "#f87171", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
                                                        >
                                                            <Trash2 size={12} /> Delete
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* Post Text */}
                                <p className="leading-snug text-white" style={{ fontSize: 10 }}>{p.text}</p>


                                {p.type === "prediction" && (() => {
                                    const predictionOptions = Array.isArray(p.predictionOptions) && p.predictionOptions.length >= 2
                                        ? p.predictionOptions : [p.sideA || "Option 1", p.sideB || "Option 2"];
                                    const optionCounts = p.predictionOptionCounts ?? {};
                                    const total = (p.agreeCount ?? 0) + (p.disagreeCount ?? 0) +
                                        Object.values(optionCounts).reduce((s: number, c: unknown) => s + (Number(c) || 0), 0);
                                    const pct = (c: number) => total > 0 ? Math.round((c / total) * 100) : 0;
                                    const closed = Boolean(p.resolvedAt || p.closedAt || (p.closesAt && p.closesAt <= Date.now()));
                                    const hasVoted = p.userVote === "agree" || p.userVote === "disagree" ||
                                        (typeof p.userVote === "string" && p.userVote.startsWith("option_"));

                                    return (
                                        <div style={{ marginTop: 6 }}>
                                            <div style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                                                {predictionOptions.slice(0, 2).map((label: string, i: number) => {
                                                    const voteVal = i === 0 ? "agree" : "disagree";
                                                    const active = p.userVote === voteVal;
                                                    const count = i === 0 ? (p.agreeCount ?? 0) : (p.disagreeCount ?? 0);
                                                    return (
                                                        <button key={label} disabled={hasVoted || closed}
                                                            onClick={(e) => { e.stopPropagation(); if (!hasVoted && !closed) handleVote(p.id, voteVal); }}
                                                            style={{
                                                                flex: 1, padding: 6, fontSize: 10, fontWeight: 700, borderRadius: 0,
                                                                border: `2px solid ${active ? "#ff6b35" : "#8b8b8b"}`,
                                                                background: active ? "rgba(255,107,53,0.24)" : "rgba(255,255,255,0.02)",
                                                                color: active ? "#fff" : "#d1d1d1", cursor: hasVoted || closed ? "default" : "pointer",
                                                                opacity: hasVoted && !active ? 0.4 : 1
                                                            }}>
                                                            {label} <span style={{ fontSize: 9, fontWeight: 800, marginLeft:6 }}>{pct(count)}%</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {closed && p.resolvedAt && p.correctVote && (
                                                <p style={{ fontSize: 10, color: "#22c55e", fontWeight: 800 }}>
                                                    Correct answer: {p.correctVote === "agree" ? predictionOptions[0] : p.correctVote === "disagree" ? predictionOptions[1] : p.correctVote}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()}

                                {p.type === "debate" && (() => {
                                    const liveTotal = (p.agreeCount ?? 0) + (p.disagreeCount ?? 0);
                                    const agrPct = liveTotal > 0 ? Math.round(((p.agreeCount ?? 0) / liveTotal) * 100) : 50;
                                    const hasVoted = p.userVote === "agree" || p.userVote === "disagree";
                                    const sideA = p.sideA || "Side A", sideB = p.sideB || "Side B";
                                    return (
                                        <div style={{ marginTop: 6 }}>
                                            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                                                {[{ label: sideA, val: "agree" }, { label: sideB, val: "disagree" }].map(({ label, val }) => {
                                                    const active = p.userVote === val;
                                                    return (
                                                        <button key={val} disabled={hasVoted}
                                                            onClick={(e) => { e.stopPropagation(); if (!hasVoted) handleVote(p.id, val); }}
                                                            style={{
                                                                flex: 1, padding: 6, fontSize: 10, fontWeight: 700, borderRadius: 0,
                                                                border: `2px solid ${active ? "#e91e8c" : "#8b8b8b"}`,
                                                                background: active ? "#e91e8c" : "rgba(255,255,255,0.02)",
                                                                color: active ? "#fff" : "#d1d1d1", cursor: hasVoted ? "default" : "pointer",
                                                                opacity: hasVoted && !active ? 0.4 : 1
                                                            }}>
                                                            {active ? "✓ " : ""}{label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{agrPct}% / {100 - agrPct}% · {liveTotal} votes</div>
                                        </div>
                                    );
                                })()}

                                {/* Media */}
                                {p.mediaUrls?.length > 0 && (
                                    <div className="flex flex-col gap-1.5 mt-1.5">
                                        {p.mediaUrls.map((url: string, i: number) =>
                                            url.endsWith(".mp4") || url.includes("/video/upload/")
                                                ? <video key={i} src={url} controls className="w-full max-h-[160px] rounded-lg object-cover" onClick={e => e.stopPropagation()} />
                                                : <img key={i} src={url} alt="" className="w-full max-h-[120px] rounded-lg object-cover" />
                                        )}
                                    </div>
                                )}

                                {/* Action Bar */}
                                <div style={{ marginTop: 0 }}>
                                    <div style={{ display: "flex", gap: 6, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 4, alignItems: "center" }}>
                                        {renderReactionPicker(p)}
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (isOpen) {
                                                    if (openInlinePostId === p.id) setOpenInlinePostId(null);
                                                    setExplicitlyClosedPostIds(prev => { const next = new Set(prev); next.add(p.id); return next; });
                                                } else {
                                                    setOpenInlinePostId(p.id);
                                                    setExplicitlyClosedPostIds(prev => { const next = new Set(prev); next.delete(p.id); return next; });
                                                }
                                            }}
                                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: isOpen ? accent : "#9494ad", fontSize: 11, fontWeight: 600, transition: "color 0.15s", padding: 0 }}
                                        >
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                            <span style={{ fontSize: 9 }}>{replyCount}</span>
                                            {isOpen ? <ChevronUp size={10} style={{ opacity: 0.7 }} /> : <ChevronDown size={10} style={{ opacity: 0.5 }} />}
                                        </button>
                                        <button onClick={e => { e.stopPropagation(); /* share logic */ }} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#9494ad", fontSize: 11, fontWeight: 600 }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                            </svg>
                                        </button>
                                        {renderReactionsTrigger(p)}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}

                {hasMoreMsgs && !loading && (
                    <div ref={sentinelRef} style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                        {loadingMoreMsgs && <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #E91E8C", animation: "dr-spin 0.8s linear infinite" }} />}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `@keyframes dr-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` }} />

            {/* ── QUICK COMPOSE BUTTONS ── */}
            {!showQuickCompose && !dollyOpen && (
                <div className="flex justify-start gap-1 py-1 px-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    {RADIAL_OPTS.map((q) => {
                        const isActive = q.id === selectedActionId;
                        return (
                            <div key={q.id} className="flex items-center gap-1 shrink-0">
                                <button type="button"
                                    onClick={() => { setSelectedActionId(q.id); onCompose?.(q.id); if (q.id !== "post") setSelectedActionId("post"); }}
                                    className={["flex items-center justify-start gap-1 px-2.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all duration-150 cursor-pointer shrink-0", isActive ? "border-[rgba(233,30,140,0.35)] bg-[rgba(233,30,140,0.12)]" : "border-transparent bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.6)]"].join(" ")}
                                >
                                    {composeIconMap[q.id] || <span>{q.emoji}</span>}
                                    <span>{q.label}</span>
                                </button>
                                {q.id === "debate" && postCooldown > 0 && (
                                    <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1.5 bg-red-500/15 border border-red-500/40 text-red-400 text-[9px] font-bold" title="Posting cooldown">
                                        {postCooldown}s
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── COMPOSE INPUT ── */}
            <div className="shrink-0 px-2.5 pt-1 pb-1.5 bg-[rgba(14,14,20,0.98)] backdrop-blur-[20px] border-t border-[var(--border)] flex flex-col gap-1">
                {selectedActionId === "post" && !dollyOpen && (
                    <>
                        <AnimatePresence>
                            {showQuickCompose && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} style={{ overflow: "hidden" }}>
                                    <div style={{ paddingBottom: 3, paddingTop: 0 }}>
                                        <p style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Quick Post</p>
                                        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 0.5, scrollbarWidth: "none" }}>
                                            {visibleQuickReactOpts.map((q) => (
                                                <motion.button key={q.id} type="button" whileTap={{ scale: 0.93 }} onClick={() => handleQuickReactPost(q)}
                                                    style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, padding: "1.5px 8px", borderRadius: 999, border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.12)", color: "#fff", fontSize: 9, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                                                    <span style={{ fontSize: 10 }}>{q.emoji}</span>
                                                    <span>{q.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {attachedUrl && (
                            <div className="px-2 py-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    {attachedType === "image" ? <img src={attachedUrl} className="w-7 h-7 rounded-lg object-cover" alt="Attached" /> : <video src={attachedUrl} className="w-7 h-7 rounded-lg object-cover" />}
                                    <span className="text-[10px] text-[var(--text-secondary)]">Media attached</span>
                                </div>
                                <button type="button" onClick={() => { setAttachedUrl(null); setAttachedType(null); }} className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer text-xs">✕</button>
                            </div>
                        )}

                        {showEmojiPicker && (
                            <div ref={emojiPickerRef} className="w-full overflow-hidden rounded-xl border border-white/10" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between px-3 py-1 bg-[#1a1a24] border-b border-white/10">
                                    <span className="text-[10px] font-semibold text-white/40">Pick an emoji</span>
                                    <button type="button" onClick={() => setShowEmojiPicker(false)} className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 border-none cursor-pointer text-white text-xs font-bold leading-none">✕</button>
                                </div>
                                <div className="max-h-[180px] overflow-y-auto w-full [&>em-emoji-picker]:w-full">
                                    <EmojiPicker data={data} theme="dark" onEmojiSelect={(emoji: any) => { setInput(prev => prev + emoji.native); }} previewPosition="none" skinTonePosition="none" perLine={7} />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center w-full gap-0.5 ml-1">
                            <button type="button" onClick={() => triggerUpload("image")} disabled={uploading} className="bg-transparent border-none -ml-1.5 text-white/40 cursor-pointer flex items-center justify-center p-1 shrink-0">
                                {/* <Image size={16} /> */}
                                <img src="/images/gallerybg.png" alt="gallery" className="w-5 h-5 object-cover" />
                            </button>

                            <button type="button" onClick={() => { setShowQuickCompose(prev => !prev); setShowEmojiPicker(false); }}
                                className="bg-transparent border-none cursor-pointer flex items-center justify-center p-1 shrink-0"
                                style={{ color: showQuickCompose ? "#e91e8c" : "rgba(255,255,255,0.4)", fontSize: 18, fontWeight: 300, lineHeight: 1, width: 24, height: 24, borderRadius: "50%", background: showQuickCompose ? "rgba(233,30,140,0.12)" : "transparent", border: showQuickCompose ? "1px solid rgba(233,30,140,0.3)" : "1px solid transparent", transition: "all 0.15s" }}
                            >
                                {showQuickCompose ? "✕" : "🎭"}
                            </button>

                            <button type="button" onClick={() => { setShowEmojiPicker(prev => !prev); setShowQuickCompose(false); }}
                                className="bg-transparent border-none cursor-pointer -ml-0.5 flex items-center justify-center p-1 shrink-0 text-[16px] leading-none"
                                style={{ color: showEmojiPicker ? "#e91e8c" : "rgba(255,255,255,0.4)" }}
                            >
                                😊
                            </button>

                            <div className="flex-1 relative min-w-0">
                                {/* Channel Mention Popup */}
                                {showChannelMentionPopup && channelMentionUsers.length > 0 && (
                                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#181c24] border border-[rgba(255,255,255,0.1)] rounded-lg overflow-hidden shadow-lg z-50 max-h-[200px] overflow-y-auto">
                                        {channelMentionUsers.map((channel, idx) => (
                                            <button
                                                key={channel.channelId}
                                                type="button"
                                                onClick={() => insertChannelMention(channel)}
                                                onMouseEnter={() => setChannelMentionIndex(idx)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${idx === channelMentionIndex
                                                    ? "bg-[rgba(233,30,140,0.15)]"
                                                    : "hover:bg-white/5"
                                                    }`}
                                            >
                                                {/* <span className="text-[16px]">{channel.icon || "💬"}</span> */}
                                                <div className="flex flex-col">
                                                    {/* <span className="text-sm font-semibold text-white">{channel.name}</span> */}
                                                    <span className="text-[10px] text-gray-400">#{channel.slug}</span>
                                                </div>
                                                {selectedChannelId === channel.channelId && (
                                                    <span className="ml-auto text-[10px] text-emerald-400 font-bold">✓ Active</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {input === "" && !uploading && postCooldown === 0 && (
                                    <div className="absolute left-2.5 top-0 bottom-0 flex items-center pointer-events-none">
                                        <span className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>
                                            {getPlaceholder()}
                                        </span>
                                    </div>
                                )}
                                <input
                                    ref={mainInputRef}
                                    type="text"
                                    disabled={uploading || postCooldown > 0}
                                    value={input}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setInput(value);
                                        handleChannelMentionInputChange(value, e.target.selectionStart || value.length);
                                    }}
                                    onKeyDown={e => {
                                        // Handle channel mention first
                                        if (handleChannelMentionKeyDown(e)) return;
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            send();
                                        }
                                    }}
                                    placeholder={postCooldown > 0 ? `Wait ${postCooldown}s before posting …` : ""}
                                    className="w-full h-8 rounded-[16px] bg-[var(--bg-secondary)] border border-[var(--border)] pl-2.5 pr-2.5 text-white text-xs outline-none"
                                    style={{ opacity: postCooldown > 0 ? 0.5 : 1 }}
                                />
                            </div>

                            <motion.button whileTap={{ scale: 0.96 }} onClick={send} disabled={uploading || isSending || postCooldown > 0}
                                className="w-6 h-6 rounded-full border-none -mr-1 text-white text-base font-bold flex items-center justify-center cursor-pointer shrink-0 bg-gradient-to-br from-[#e91e8c] to-[#ff6b35]"
                                style={{ opacity: uploading ? 0.5 : 1 }}
                            >
                                ↑
                            </motion.button>
                        </div>
                    </>
                )}
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {/* ── DIALOGS ── */}
            <VotersDialog postId={votersMsgId ?? ""} isOpen={votersMsgId !== null} onClose={() => setVotersMsgId(null)} roomId={roomId} mode={votersMode} />
            <ReactionsDialog postId={reactionsMsgId ?? ""} isOpen={reactionsMsgId !== null} onClose={() => setReactionsMsgId(null)} onFanProfile={onFanProfile} roomId={roomId} />
            <ActiveFansDialog roomId={roomId} isOpen={activeFansOpen} onClose={() => setActiveFansOpen(false)} onFanProfile={onFanProfile} prefetchedFans={activeFans} prefetchedCount={liveCount} />

            {/* <DollyPanel
                isOpen={dollyOpen}
                onOpen={() => { setDollyOpen(true); loadDollyHistory(); }}
                onClose={() => setDollyOpen(false)}
                activeRoomId={dollyActiveRoomId}
                activeRoomName={dollyActiveRoomName}
                question={dollyQuestion}
                setQuestion={setDollyQuestion}
                asking={dollyAsking}
                onAsk={async () => {
                    const q = dollyQuestion.trim();
                    const targetRoomId = dollyActiveRoomId ?? roomId;
                    if (!q || dollyAsking || !targetRoomId) return;
                    setDollyAsking(true);
                    const tempId = `temp-dolly-${Date.now()}`;
                    setDollyReplies(prev => [...prev, { id: tempId, question: q, answer: "", createdAt: Date.now() }]);
                    setDollyQuestion("");
                    try {
                        const res = await axios.post(`/api/roar/rooms/${targetRoomId}/dolly`, { question: q }, { timeout: 30000 });
                        if (res.data?.success && dollyActiveRoomIdRef.current === targetRoomId) {
                            setDollyReplies(prev => prev.map(d => d.id === tempId ? res.data.reply : d));
                        }
                    } catch {
                        if (dollyActiveRoomIdRef.current === targetRoomId) {
                            setDollyReplies(prev => prev.map(d => d.id === tempId ? { ...d, answer: "Something went wrong — try again." } : d));
                        }
                    } finally { setDollyAsking(false); }
                }}
                replies={dollyReplies}
                loadingReplies={dollyRepliesLoading}
                history={dollyHistory}
                loadingHistory={dollyHistoryLoading}
                onSelectHistorySession={async (session) => {
                    if (session.roomId === dollyActiveRoomId) return;
                    const requestId = Symbol();
                    dollyFetchTokenRef.current = requestId;
                    setDollyActiveRoomId(session.roomId);
                    setDollyActiveRoomName(session.title);
                    setDollyRepliesLoading(true);
                    try {
                        const res = await axios.get(`/api/roar/rooms/${session.roomId}/dolly`, { timeout: REQUEST_TIMEOUT_MS });
                        if (dollyFetchTokenRef.current !== requestId) return;
                        setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
                    } catch { if (dollyFetchTokenRef.current === requestId) setDollyReplies([]); }
                    finally { if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false); }
                }}
                onNewChat={() => {
                    const requestId = Symbol();
                    dollyFetchTokenRef.current = requestId;
                    setDollyActiveRoomId(roomId);
                    setDollyActiveRoomName(roomName);
                    setDollyQuestion("");
                    setDollyReplies([]);
                    if (!roomId) { setDollyReplies([]); return; }
                    setDollyRepliesLoading(true);
                    axios.get(`/api/roar/rooms/${roomId}/dolly`, { timeout: REQUEST_TIMEOUT_MS })
                        .then(res => {
                            if (dollyFetchTokenRef.current !== requestId) return;
                            setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
                        })
                        .catch(() => { if (dollyFetchTokenRef.current === requestId) setDollyReplies([]); })
                        .finally(() => { if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false); });
                }}
                constrainedToParent={false}
            /> */}

            <DollyPanel
                isOpen={dollyOpen}
                onOpen={() => { setDollyOpen(true); loadDollyHistory(); }}
                onClose={() => setDollyOpen(false)}
                activeSessionId={dollyActiveSessionId}
                activeRoomName={dollyActiveRoomName}
                onNewChat={handleNewDollyChat}
                question={dollyQuestion}
                setQuestion={setDollyQuestion}
                onRenameSession={renameDollySession}
                onDeleteSession={deleteDollySession}
                asking={dollyAsking}
                onAsk={async () => {
                    const q = dollyQuestion.trim();
                    if (!q || dollyAsking) return;
                    setDollyAsking(true);
                    const sessionId = await ensureDollySession();
                    if (!sessionId) { setDollyAsking(false); return; }
                    const tempId = `temp-dolly-${Date.now()}`;
                    setDollyReplies(prev => [...prev, { id: tempId, question: q, answer: "", createdAt: Date.now() }]);
                    setDollyQuestion("");
                    try {
                        const res = await axios.post(`/api/roar/rooms/${roomId}/dolly/${sessionId}`, { question: q }, { timeout: 30000 });
                        if (res.data?.success && dollyActiveSessionIdRef.current === sessionId) {
                            setDollyReplies(prev => prev.map(d => d.id === tempId ? res.data.reply : d));
                        }
                    } catch {
                        if (dollyActiveSessionIdRef.current === sessionId) {
                            setDollyReplies(prev => prev.map(d => d.id === tempId ? { ...d, answer: "Something went wrong — try again." } : d));
                        }
                    } finally { setDollyAsking(false); }
                }}
                replies={dollyReplies}
                loadingReplies={dollyRepliesLoading}
                history={dollyHistory}
                loadingHistory={dollyHistoryLoading}
                loadingMoreHistory={dollyHistoryLoadingMore}
                onLoadMoreHistory={loadMoreDollyHistory}
                onSelectHistorySession={async (session) => {
                    if (session.sessionId === dollyActiveSessionId) return;
                    const requestId = Symbol();
                    dollyFetchTokenRef.current = requestId;
                    setDollyActiveSessionId(session.sessionId);
                    dollyActiveSessionIdRef.current = session.sessionId;
                    setDollyRepliesLoading(true);
                    try {
                        const res = await axios.get(`/api/roar/rooms/${roomId}/dolly/${session.sessionId}`, { timeout: REQUEST_TIMEOUT_MS });
                        if (dollyFetchTokenRef.current !== requestId) return;
                        setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
                    } catch { if (dollyFetchTokenRef.current === requestId) setDollyReplies([]); }
                    finally { if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false); }
                }}
                // onNewChat={() => {
                //     dollyFetchTokenRef.current = Symbol();
                //     setDollyQuestion("");
                //     setDollyReplies([]);
                //     setDollyActiveSessionId(undefined);
                //     dollyActiveSessionIdRef.current = undefined;
                // }}
                
                constrainedToParent={false}
            />

        </div>
    );
}