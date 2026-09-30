"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Poll } from "@/types/Polls";
import { EngagementItem, EngagementType, QuizOption, MemeReactionType } from "@/types/engagements";
import { engagementService } from "@/services/engagement.service";
import {
  ArrowLeft,
  Heart,
  Share2,
  Sparkles,
  Trophy,
  Check,
  Zap,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Swords,
  HelpCircle,
  BarChart2,
  Target,
  ChevronRight,
  X,
  RefreshCw,
  Lock,
  Flame,
  MessageCircle,
  MoreVertical,
  Info,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LeaderboardOverlayModal from "@/src/components/NewHomeComponents/LeaderboardOverlayModal";
import ArenaEngagementModal from "./ArenaEngagementModal";
import axios from "axios";

// ─── Standard Points Constants ──────────────────────────────────────────────
const PARTICIPATION_POINTS = 2; // Every section awards strictly +2 SXPs for participation
const CORRECT_OPTION_BONUS = 10; // Quiz, Poll, Prediction correct answer awards +10 SXPs bonus

interface FlipArenaProps {
  selectedSport: string;
  activeTab?: "flipline" | "fliparena";
  setActiveTab?: (tab: "flipline" | "fliparena") => void;
  isPreview?: boolean;
}

// ─── Time Helper Utilities ──────────────────────────────────────────────────
function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hours > 0) {
    return `${hours}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getEngagementPostingTime(item: EngagementItem): number {
  const raw =
    (item as any).postingTime ||
    (item as any).postedAt ||
    (item.quizData as any)?.postingTime ||
    (item.pollData as any)?.postingTime ||
    (item.predictionData as any)?.postingTime ||
    (item.fanBattleData as any)?.postingTime ||
    item.quizData?.startTime ||
    item.quizData?.scheduledStartTime ||
    item.pollData?.startTime ||
    item.pollData?.scheduledStartTime ||
    item.predictionData?.startTime ||
    item.predictionData?.scheduledStartTime ||
    item.fanBattleData?.startTime ||
    item.fanBattleData?.scheduledStartTime ||
    item.startTime ||
    item.scheduledStartTime ||
    (item.memeData as any)?.createdAt ||
    item.createdAt ||
    0;

  if (typeof raw === "number") return raw;
  const parsed = new Date(raw).getTime();
  return isNaN(parsed) || parsed <= 0 ? (Number(item.createdAt) || 0) : parsed;
}

function getEngagementStartTime(item: EngagementItem): number {
  return getEngagementPostingTime(item);
}

function formatEngagementPostingTime(item: EngagementItem): string {
  const ts = getEngagementPostingTime(item) || Number(item.createdAt) || Date.now();
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "";

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return timeStr;

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return `Yesterday, ${timeStr}`;

  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
}

// ─── Single-Vote Local Persistence Helpers ──────────────────────────────────
function getStoredVote(type: string, itemId: string, userId?: string): any {
  if (typeof window === "undefined") return null;
  try {
    if (userId) {
      const u = localStorage.getItem(`sf_${type}_voted_${itemId}_${userId}`);
      if (u) return JSON.parse(u);
    }
    const d = localStorage.getItem(`sf_${type}_voted_${itemId}`);
    if (d) return JSON.parse(d);
  } catch { }
  return null;
}

function setStoredVote(type: string, itemId: string, data: any, userId?: string) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(`sf_${type}_voted_${itemId}`, serialized);
    if (userId) {
      localStorage.setItem(`sf_${type}_voted_${itemId}_${userId}`, serialized);
    }
  } catch { }
}

// ─── Direct Engagement Share URL Generator ───────────────────────────────────
function getEngagementShareUrl(item: EngagementItem): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const itemType = item.type || "quiz";
  return `${origin}/MainModules/FlipArena?itemId=${encodeURIComponent(item.id)}&type=${encodeURIComponent(itemType)}`;
}


// ─── Current User Identity Helper (Zero Hardcoding) ──────────────────────────
function resolveCurrentUser(user: any) {
  let cached: any = null;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) cached = JSON.parse(stored);
    } catch { }
  }
  const activeUserId =
    user?.userId ||
    (user as any)?.actualUserId ||
    user?.uid ||
    (user as any)?.id ||
    cached?.userId ||
    cached?.actualUserId ||
    cached?.uid ||
    cached?.id ||
    user?.email ||
    cached?.email ||
    '';

  const userEmail = user?.email || cached?.email || '';
  const userName =
    user?.name ||
    user?.displayName ||
    (user as any)?.userName ||
    cached?.name ||
    cached?.displayName ||
    (userEmail ? userEmail.split('@')[0] : 'SportsFan');
  const rawAvatar =
    user?.photoURL ||
    user?.avatarUrl ||
    (user as any)?.avatar ||
    cached?.photoURL ||
    cached?.avatarUrl ||
    cached?.avatar ||
    '';
  const userAvatar = typeof rawAvatar === 'string' && !rawAvatar.includes('dicebear') ? rawAvatar : '';

  return { activeUserId, userEmail, userName, userAvatar };
}

// ─── 1. Fan Battle Card Component (+2 SXPs Participation) ────────────────────
function DynamicFanBattleCard({
  item,
  userId,
  userName,
  userAvatar,
  userEmail,
  now,
  onToast,
  onEdit,
  isHighlighted = false,
  onOpenEngagedModal,
  isEngagedExpanded = false,
  totalEngagedOverride,
}: {
  item: EngagementItem;
  userId?: string;
    userName?: string;
    userAvatar?: string;
    userEmail?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
  onOpenEngagedModal?: (item: EngagementItem) => void;
  isEngagedExpanded?: boolean;
  totalEngagedOverride?: number;
}) {
  const initialStored = getStoredVote("fb", item.id, userId);
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(
    initialStored?.side || (item.userVote as "left" | "right") || null
  );
  const [loading, setLoading] = useState(false);
  const isVotingRef = useRef(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || 0);
  });

  useEffect(() => {
    if (totalEngagedOverride !== undefined) {
      setTotalEngaged(totalEngagedOverride);
    }
  }, [totalEngagedOverride]);

  const left = item.fanBattleData?.leftCompetitor || {
    code: "IN",
    name: "Virat Kohli",
    stat: "Avg 58.6 in Tests",
    votes: 0,
  };

  const right = item.fanBattleData?.rightCompetitor || {
    code: "PK",
    name: "Babar Azam",
    stat: "Avg 44.8 in Tests",
    votes: 0,
  };

  const [result, setResult] = useState<{
    leftPercentage: number;
    rightPercentage: number;
    totalVotes: number;
  } | null>(() => {
    const s = initialStored?.side || (item.userVote as "left" | "right");
    if (!s) return null;
    const lVotes = left.votes || 0;
    const rVotes = right.votes || 0;
    const total = lVotes + rVotes + 1;
    const leftV = lVotes + (s === "left" ? 1 : 0);
    const leftPct = Math.round((leftV / total) * 100);
    return {
      leftPercentage: leftPct,
      rightPercentage: 100 - leftPct,
      totalVotes: total,
    };
  });

  const startTime = getEngagementStartTime(item);
  const isScheduled = startTime > now;
  const timeToStartMs = Math.max(0, startTime - now);

  useEffect(() => {
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    const stored = getStoredVote("fb", item.id, userId);
    if (stored?.side) {
      setSelectedSide(stored.side);
      const total = (left.votes || 0) + (right.votes || 0) || 1;
      const leftV = (left.votes || 0) + (stored.side === "left" ? 1 : 0);
      const leftPct = Math.round((leftV / total) * 100);
      setResult({
        leftPercentage: leftPct,
        rightPercentage: 100 - leftPct,
        totalVotes: total,
      });
    }

    if (item.userVoted && item.userVote) {
      const side = item.userVote as "left" | "right";
      setSelectedSide(side);
      setStoredVote("fb", item.id, { side }, userId);
      const total = (left.votes || 0) + (right.votes || 0) || 1;
      const leftPct = Math.round(((left.votes || 0) / total) * 100);
      setResult({
        leftPercentage: leftPct,
        rightPercentage: 100 - leftPct,
        totalVotes: total,
      });
    } else if (userId) {
      engagementService.checkVoteStatus(item.id, userId).then((res) => {
        if (res.hasVoted && res.selectedOptionId) {
          const side = res.selectedOptionId as "left" | "right";
          setSelectedSide(side);
          setStoredVote("fb", item.id, { side }, userId);
          const total = (left.votes || 0) + (right.votes || 0) || 1;
          const leftPct = Math.round(((left.votes || 0) / total) * 100);
          setResult({
            leftPercentage: leftPct,
            rightPercentage: 100 - leftPct,
            totalVotes: total,
          });
        }
      });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, left.votes, right.votes]);

  const handleVote = async (side: "left" | "right") => {
    if (!userId || String(userId).toLowerCase().startsWith("anon")) {
      onToast("Please sign in to participate and earn SXPs!");
      return;
    }
    if (isScheduled) {
      onToast(`This battle starts in ${formatCountdown(timeToStartMs)}!`);
      return;
    }
    if (selectedSide || loading || isVotingRef.current || getStoredVote("fb", item.id, userId)) {
      onToast("You have already voted in this battle!");
      return;
    }

    isVotingRef.current = true;
    setSelectedSide(side);
    setLoading(true);
    setStoredVote("fb", item.id, { side }, userId);
    setTotalEngaged((prev) => prev + 1);

    try {
      const res: any = await engagementService.voteEngagement(item.id, side, userId, undefined, { userName, userAvatar, userEmail });
      const calculatedResult = {
        leftPercentage: res?.leftPercentage ?? (side === "left" ? 68 : 32),
        rightPercentage: res?.rightPercentage ?? (side === "right" ? 68 : 32),
        totalVotes: res?.totalVotes ?? (left.votes + right.votes + 1),
      };
      setResult(calculatedResult);
      onToast(`+${PARTICIPATION_POINTS} SXPs earned for voting in Fan Battle! ⚔️`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
        );
      }
    } catch (err: any) {
      const prevOption = (err?.response?.data?.selectedOptionId || side) as "left" | "right";
      const total = (left.votes || 0) + (right.votes || 0) + 1;
      const leftV = (left.votes || 0) + (prevOption === "left" ? 1 : 0);
      const leftPct = Math.round((leftV / total) * 100);
      setSelectedSide(prevOption);
      setResult({
        leftPercentage: leftPct,
        rightPercentage: 100 - leftPct,
        totalVotes: total,
      });
    } finally {
      setLoading(false);
      isVotingRef.current = false;
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    // setTotalEngaged((prev) => prev + 1);
    engagementService.shareEngagement(item.id).catch(() => { });

    const shareUrl = getEngagementShareUrl(item);
    const text = `⚔️ ${item.title} — ${left.name} vs ${right.name}! Vote now on SportsFan360:`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      onToast("Challenge link copied to clipboard! 📋");
    }
  };

  const formattedTime = formatEngagementPostingTime(item);

  return (
    <motion.div
      id={`engagement-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-[#FF3D57] border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative group transition-all duration-300 ${isHighlighted
        ? "ring-2 ring-[#FF3D57] shadow-[0_0_35px_rgba(255,61,87,0.35)] scale-[1.01]"
        : ""
        }`}
    >
      {isHighlighted && (
        <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-[#FF3D57]/20 to-orange-500/20 border border-[#FF3D57]/40 text-[10px] font-black text-rose-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#FF3D57] animate-pulse" />
            <span>SHARED BATTLE</span>
          </span>
          <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
        </div>
      )}
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="text-[#FF3D57]">⚔️ FAN BATTLE</span>
          {/* <span>•</span> */}
          {/* <span className="text-[#FF7B02] flex items-center gap-0.5">🔥 +2 SXPs / VOTE</span> */}
          {isScheduled && (
            <>
              <span>•</span>
              <span className="text-amber-400 flex items-center gap-1 font-mono">
                <Clock size={10} /> STARTS IN {formatCountdown(timeToStartMs)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedTime}</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{item.title}</p>

      {isScheduled && (
        <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 text-xs font-black text-amber-300">
          <Lock size={13} />
          <span>Event scheduled · Voting opens in {formatCountdown(timeToStartMs)}</span>
        </div>
      )}

      <div className="grid grid-cols-7 items-center gap-3 mb-4">
        {/* Left Competitor */}
        <button
          onClick={() => handleVote("left")}
          disabled={loading || selectedSide !== null || isScheduled}
          className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${isScheduled
            ? "opacity-50 cursor-not-allowed bg-white/[0.01] border-white/[0.05]"
            : selectedSide === "left"
              ? "bg-[#FF3D57]/10 border-[#FF3D57] shadow-[0_0_15px_rgba(255,61,87,0.15)]"
              : selectedSide === "right"
                ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] active:scale-[0.98]"
            }`}
        >
          <span className="text-2xl font-black block">{left.code}</span>
          <span className="text-xs font-black block mt-2 text-white">{left.name}</span>
          <span className="text-[9px] text-white/40 block mt-1 font-semibold">{left.stat}</span>
          {result && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-black block mt-2 text-[#FF3D57]"
            >
              {result.leftPercentage}% Voted {selectedSide === "left" && "✓"}
            </motion.span>
          )}
        </button>

        {/* VS Badge */}
        <div className="col-span-1 flex items-center justify-center">
          <span className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] font-black text-white/50 flex items-center justify-center">
            VS
          </span>
        </div>

        {/* Right Competitor */}
        <button
          onClick={() => handleVote("right")}
          disabled={loading || selectedSide !== null || isScheduled}
          className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${isScheduled
            ? "opacity-50 cursor-not-allowed bg-white/[0.01] border-white/[0.05]"
            : selectedSide === "right"
              ? "bg-[#FF7B02]/10 border-[#FF7B02] shadow-[0_0_15px_rgba(255,123,2,0.15)]"
              : selectedSide === "left"
                ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] active:scale-[0.98]"
            }`}
        >
          <span className="text-2xl font-black block">{right.code}</span>
          <span className="text-xs font-black block mt-2 text-white">{right.name}</span>
          <span className="text-[9px] text-white/40 block mt-1 font-semibold">{right.stat}</span>
          {result && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-black block mt-2 text-[#FF7B02]"
            >
              {result.rightPercentage}% Voted {selectedSide === "right" && "✓"}
            </motion.span>
          )}
        </button>
      </div>

      <button
        onClick={handleShare}
        className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] font-black text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer text-white/90"
      >
        <span>🫱🏼🫲🏾</span> Challenge a Friend
      </button>

      <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
              }`}
          >
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
            <span>{likesCount.toLocaleString()}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 size={13} />
            <span>{sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        {/* <span>{totalEngaged.toLocaleString()} engaged</span> */}
        <button
          onClick={() => onOpenEngagedModal?.(item)}
          className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
        >
          <span className="group-hover:underline">{totalEngaged.toLocaleString()} engaged</span>
          <ChevronRight
            size={12}
            className={`text-[#FF8A00] transition-transform duration-200 ${
              isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
            }`}
          />
        </button>

      </div>
    </motion.div>
  );
}

function LiveCountdown({
  target,
  render,
}: {
  target: number;
  render: (msLeft: number) => React.ReactNode;
}) {
  const [msLeft, setMsLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const id = setInterval(() => {
      setMsLeft(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);
  return <>{render(msLeft)}</>;
}

// ─── 2. Quiz Card Component (+2 SXPs Participation, +10 SXPs Correct) ────────
function DynamicQuizCard({
  item,
  userId,
  userName,
  userAvatar,
  userEmail,
  now,
  onToast,
  onEdit,
  isHighlighted = false,
  onOpenEngagedModal,
  isEngagedExpanded = false,
  onQuestionChange,
  totalEngagedOverride,
  onOpenLeaderboard,
}: {
  item: EngagementItem;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
  onOpenEngagedModal?: (item: EngagementItem) => void;
  isEngagedExpanded?: boolean;
  onQuestionChange?: (index: number, questionId: string) => void;
  totalEngagedOverride?: number;
  onOpenLeaderboard?: () => void;
}) {
  const rawQuestions =
    item.quizData?.questions && item.quizData.questions.length > 0
      ? item.quizData.questions
      : [
        {
          id: "q_1",
          question: item.quizData?.question || item.title || "Live Cricket Quiz",
          options: item.quizData?.options || [
            { id: "A", text: "Option A" },
            { id: "B", text: "Option B" },
            { id: "C", text: "Option C" },
            { id: "D", text: "Option D" },
          ],
          correctOptionId: item.quizData?.correctOptionId || "A",
          explanation: item.quizData?.explanation || "SportsFan360 Quiz",
        },
      ];

  const totalQuestions = rawQuestions.length;

  const initialFinish = getStoredVote("quiz_finish", item.id, userId);
  const [quizFinished, setQuizFinished] = useState<boolean>(Boolean(initialFinish?.finished));
  const [totalScore, setTotalScore] = useState<number>(() => {
    if (initialFinish?.score !== undefined) return Number(initialFinish.score);
    let sum = 0;
    rawQuestions.forEach((q, idx) => {
      const qK = `quiz_q_${q?.id || idx}`;
      const ans = getStoredVote(qK, item.id, userId);
      if (ans) {
        sum += (ans.earnedPoints || (PARTICIPATION_POINTS + (ans.isCorrect ? CORRECT_OPTION_BONUS : 0)));
      }
    });
    return sum;
  });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const currentQ = rawQuestions[Math.min(currentQIndex, totalQuestions - 1)];

  useEffect(() => {
    if (currentQ) {
      onQuestionChange?.(currentQIndex, currentQ.id || `q_${currentQIndex}`);
    }
  }, [currentQIndex, currentQ?.id, onQuestionChange]);
  const correctOptionId = currentQ?.correctOptionId || (currentQ as any)?.answer || "A";
  const frequencyMinutes = Number(
    item.quizData?.frequencyMinutes !== undefined && item.quizData?.frequencyMinutes !== null
      ? item.quizData.frequencyMinutes
      : 0
  );
  const frequencyMs = frequencyMinutes * 60 * 1000;

  // Key uniquely per question ID to avoid state leaks
  const currentQKey = `quiz_q_${currentQ?.id || currentQIndex}`;
  const initialQ = getStoredVote(currentQKey, item.id, userId);

  const checkIsOptionCorrect = useCallback((optId: string, q: any) => {
    if (!q) return false;
    const target = String(q.correctOptionId || q.answer || "").trim().toUpperCase();
    const chosen = q.options?.find((o: any) => o.id === optId || o.text === optId);
    if (chosen?.isCorrect === true) return true;
    if (String(optId).trim().toUpperCase() === target) return true;
    if (chosen && String(chosen.text || "").trim().toUpperCase() === target) return true;
    return false;
  }, []);

  const calculateQuizProgress = useCallback(() => {
    let answeredQCount = 0;
    let correctQCount = 0;
    let earnedSum = 0;

    rawQuestions.forEach((q, idx) => {
      const qK = `quiz_q_${q?.id || idx}`;
      const ans = getStoredVote(qK, item.id, userId);
      if (ans) {
        answeredQCount++;
        if (ans.isCorrect) {
          correctQCount++;
        }
        earnedSum += (ans.earnedPoints || (PARTICIPATION_POINTS + (ans.isCorrect ? CORRECT_OPTION_BONUS : 0)));
      }
    });

    const maxPossible = totalQuestions * (PARTICIPATION_POINTS + CORRECT_OPTION_BONUS);
    return {
      answeredCount: answeredQCount,
      correctCount: correctQCount,
      earnedScore: earnedSum,
      possibleScore: maxPossible,
      isFullyCompleted: answeredQCount >= totalQuestions,
    };
  }, [rawQuestions, item.id, userId, totalQuestions]);

  const [selectedId, setSelectedId] = useState<string | null>(
    initialQ?.selectedId || (totalQuestions === 1 && item.userVoted && item.userVote ? item.userVote : null)
  );
  const [answered, setAnswered] = useState<boolean>(Boolean(initialQ || (totalQuestions === 1 && item.userVoted)));
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    initialQ
      ? initialQ.isCorrect
      : totalQuestions === 1 && item.userVoted && item.userVote
        ? checkIsOptionCorrect(item.userVote, currentQ)
        : null
  );

  const isAnsweringRef = useRef(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);

  const hasAlreadyEngaged = useMemo(() => {
    if (item.userVoted) return true;
    if (getStoredVote("quiz_engaged", item.id, userId)) return true;
    if (getStoredVote("quiz_finish", item.id, userId)) return true;
    return rawQuestions.some((q, idx) =>
      Boolean(getStoredVote(`quiz_q_${q?.id || idx}`, item.id, userId))
    );
  }, [item.id, item.userVoted, userId, rawQuestions]);

  const hasEngagedRef = useRef<boolean>(hasAlreadyEngaged);

  useEffect(() => {
    if (hasAlreadyEngaged) {
      hasEngagedRef.current = true;
    }
  }, [hasAlreadyEngaged]);

  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || 0);
  });

  useEffect(() => {
    if (totalEngagedOverride !== undefined) {
      setTotalEngaged(totalEngagedOverride);
    } else if (item.totalEngaged !== undefined) {
      setTotalEngaged((prev) => Math.max(prev, Number(item.totalEngaged) || 0));
    }
  }, [totalEngagedOverride, item.totalEngaged]);

  const startTime = getEngagementStartTime(item);
  const isScheduled = startTime > now;
  const timeToStartMs = Math.max(0, startTime - now);

  const elapsedSinceStart = Math.max(0, now - startTime);
  const unlockedQuestionCount = isScheduled
    ? 0
    : frequencyMinutes <= 0
      ? totalQuestions
      : Math.min(totalQuestions, Math.floor(elapsedSinceStart / (frequencyMs || 1)) + 1);
  const msToNextQuestionSlot =
    isScheduled || frequencyMinutes <= 0
      ? 0
      : Math.max(0, frequencyMs - (elapsedSinceStart % frequencyMs));
  const isNextQuestionLocked =
    frequencyMinutes > 0 &&
    answered &&
    currentQIndex + 1 >= unlockedQuestionCount &&
    currentQIndex + 1 < totalQuestions;

  // Handle timeout / partial expiration notification
  const isExpired = Boolean(item.expiresAt && Number(item.expiresAt) > 0 && now > Number(item.expiresAt));
  const partialNotifiedRef = useRef(false);

  useEffect(() => {
    if (isExpired && hasAlreadyEngaged && !quizFinished && !partialNotifiedRef.current) {
      partialNotifiedRef.current = true;
      const progress = calculateQuizProgress();
      if (progress.answeredCount > 0) {
        const partialMsg = `Quiz Time Expired! You answered ${progress.answeredCount}/${totalQuestions} questions and earned +${progress.earnedScore} SXPs. Tap to view your final score.`;
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("sf360:new-notification", {
              detail: {
                title: "FlipARENA",
                body: partialMsg,
                ctaLabel: "View Score",
                ctaTarget: `/MainModules/FlipArena?itemId=${item.id}&type=quiz`,
                type: "fliparena.quiz_expired_partial",
              },
            })
          );
        }
      }
    }
  }, [isExpired, hasAlreadyEngaged, quizFinished, calculateQuizProgress, totalQuestions, item.id]);

  useEffect(() => {
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    const finish = getStoredVote("quiz_finish", item.id, userId);
    if (finish?.finished) {
      setQuizFinished(true);
      if (finish.score !== undefined) setTotalScore(Number(finish.score));
    }

    const qKey = `quiz_q_${currentQ?.id || currentQIndex}`;
    const ans = getStoredVote(qKey, item.id, userId);
    if (ans) {
      setSelectedId(ans.selectedId);
      setAnswered(true);
      setIsCorrect(
        ans.isCorrect !== undefined
          ? ans.isCorrect
          : checkIsOptionCorrect(ans.selectedId, currentQ)
      );
    } else if (totalQuestions === 1 && item.userVoted && item.userVote) {
      setSelectedId(item.userVote);
      setAnswered(true);
      const isRight = checkIsOptionCorrect(item.userVote, currentQ);
      setIsCorrect(isRight);
      setStoredVote(qKey, item.id, { selectedId: item.userVote, isCorrect: isRight }, userId);
    } else {
      setSelectedId(null);
      setAnswered(false);
      setIsCorrect(null);
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, checkIsOptionCorrect, currentQ, currentQIndex, totalQuestions]);

  const handleOptionSelect = async (optId: string) => {
    if (!userId || String(userId).toLowerCase().startsWith("anon")) {
      onToast("Please sign in to participate and earn SXPs!");
      return;
    }
    if (answered || isScheduled || isAnsweringRef.current) return;
    isAnsweringRef.current = true;
    const qKey = `quiz_q_${currentQ?.id || currentQIndex}`;
    const existing = getStoredVote(qKey, item.id, userId);
    if (existing) {
      isAnsweringRef.current = false;
      return;
    }

    setSelectedId(optId);
    setAnswered(true);

    const isFirstQuizEngagement = !hasEngagedRef.current;
    if (isFirstQuizEngagement) {
      hasEngagedRef.current = true;
      setStoredVote("quiz_engaged", item.id, true, userId);
      setTotalEngaged((prev) => prev + 1);
    }

    const isRight = checkIsOptionCorrect(optId, currentQ);
    setIsCorrect(isRight);

    // +2 for every question answered, +10 more if correct
    const earnedPoints = PARTICIPATION_POINTS + (isRight ? CORRECT_OPTION_BONUS : 0);
    const nextTotal = totalScore + earnedPoints;
    setTotalScore(nextTotal);

    setStoredVote(
      qKey,
      item.id,
      { selectedId: optId, isCorrect: isRight, earnedPoints },
      userId
    );

    const currentAnsweredCount = rawQuestions.filter((q, idx) => {
      if (idx === currentQIndex) return true;
      return Boolean(getStoredVote(`quiz_q_${q?.id || idx}`, item.id, userId));
    }).length;

    const currentCorrectCount = rawQuestions.filter((q, idx) => {
      if (idx === currentQIndex) return isRight;
      return Boolean(getStoredVote(`quiz_q_${q?.id || idx}`, item.id, userId)?.isCorrect);
    }).length;

    const totalPossible = totalQuestions * (PARTICIPATION_POINTS + CORRECT_OPTION_BONUS);

    // Multi-quiz full completion check
    if (totalQuestions === 1 || currentQIndex === totalQuestions - 1 || currentAnsweredCount >= totalQuestions) {
      setQuizFinished(true);
      setStoredVote("quiz_finish", item.id, {
        finished: true,
        score: nextTotal,
        answeredCount: currentAnsweredCount,
        correctCount: currentCorrectCount,
        possibleScore: totalPossible,
      }, userId);
      setStoredVote("quiz_engaged", item.id, true, userId);

      // Single summary push notification on completion
      const summaryMsg = `Quiz Completed! You scored ${nextTotal}/${totalPossible} SXPs (${currentCorrectCount}/${totalQuestions} correct). Check your rank on the Leaderboard!`;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf360:new-notification", {
            detail: {
              title: "FlipARENA",
              body: summaryMsg,
              ctaLabel: "View Leaderboard",
              ctaTarget: `/MainModules/FlipArena?itemId=${item.id}&type=quiz&tab=leaderboard`,
              type: "fliparena.quiz_completed",
            },
          })
        );
      }
    }

    try {
      const res: any = await engagementService.voteEngagement(
        item.id,
        optId,
        userId,
        currentQ?.id,
        { isFirstQuizEngagement, questionIndex: currentQIndex, totalQuestions }
      );
      const earned = Number(res?.pointsAwarded ?? earnedPoints);
      if (typeof window !== "undefined" && earned > 0) {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: earned } })
        );
      }
      onToast(
        isRight
          ? `🎉 Correct! +${earned} SXPs (+${PARTICIPATION_POINTS} played, +${CORRECT_OPTION_BONUS} bonus)`
          : `💡 +${earned} SXPs for participating!`
      );
    } catch (err: any) {
      const prevOpt = err?.response?.data?.selectedOptionId || optId;
      const right = checkIsOptionCorrect(prevOpt, currentQ);
      setSelectedId(prevOpt);
      setIsCorrect(right);
    } finally {
      isAnsweringRef.current = false;
    }
  };

  const handleNextQuestion = () => {
    if (isNextQuestionLocked) {
      onToast(`Next question unlocks in ${formatCountdown(msToNextQuestionSlot)}!`);
      return;
    }
    if (currentQIndex < totalQuestions - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = rawQuestions[nextIdx];
      onQuestionChange?.(nextIdx, nextQ?.id || `q_${nextIdx}`);
      const ans = getStoredVote(`quiz_q_${nextQ?.id || nextIdx}`, item.id, userId);
      if (ans) {
        setSelectedId(ans.selectedId);
        setAnswered(true);
        setIsCorrect(ans.isCorrect);
      } else {
        setSelectedId(null);
        setAnswered(false);
        setIsCorrect(null);
      }
    } else {
      setQuizFinished(true);
      const p = calculateQuizProgress();
      setStoredVote("quiz_finish", item.id, { finished: true, score: totalScore, correctCount: p.correctCount, answeredCount: p.answeredCount }, userId);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      const prevQ = rawQuestions[prevIdx];
      onQuestionChange?.(prevIdx, prevQ?.id || `q_${prevIdx}`);
      const ans = getStoredVote(`quiz_q_${prevQ?.id || prevIdx}`, item.id, userId);
      if (ans) {
        setSelectedId(ans.selectedId);
        setAnswered(true);
        setIsCorrect(ans.isCorrect);
      } else {
        setSelectedId(null);
        setAnswered(false);
        setIsCorrect(null);
      }
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    engagementService.shareEngagement(item.id).catch(() => { });

    const shareUrl = getEngagementShareUrl(item);
    const text = `🧠 Quiz: "${item.title}" — Can you answer all questions? Play on SportsFan360:`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      onToast("Quiz link copied to clipboard! 📋");
    }
  };

  const formattedTime = formatEngagementPostingTime(item);
  const currentProgress = calculateQuizProgress();

  return (
    <motion.div
      layout={false}
      id={`engagement-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-purple-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
        ? "ring-2 ring-purple-500 shadow-[0_0_35px_rgba(168,85,247,0.35)] scale-[1.01]"
        : ""
        }`}
    >
      {isHighlighted && (
        <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 text-[10px] font-black text-purple-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-purple-400 animate-pulse" />
            <span>SHARED QUIZ</span>
          </span>
          <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
        </div>
      )}
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <div className="flex items-center gap-1.5 uppercase">
          <span className="text-purple-400">🧠 QUIZ</span>
          {isScheduled && (
            <>
              <span>•</span>
              <span className="text-amber-400 font-mono flex items-center gap-1">
                <Clock size={10} /> STARTS IN {formatCountdown(timeToStartMs)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Quiz Header & Completion summary banner */}
      {quizFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-[#15181D] to-purple-900/40 border border-purple-500/40 text-center space-y-2.5 shadow-xl mb-3"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">🏆</span>
            <h4 className="text-sm font-black text-white">Quiz Completed!</h4>
          </div>
          <p className="text-[11.5px] text-purple-200 font-medium leading-snug">
            You scored <strong className="text-amber-400 font-extrabold">{totalScore}/{currentProgress.possibleScore} SXPs</strong> ({currentProgress.correctCount}/{totalQuestions} correct). Check your rank on the Leaderboard!
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => onOpenLeaderboard?.()}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-[11px] flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Trophy size={13} className="text-black" />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => setCurrentQIndex(0)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-[11px] active:scale-95 transition-all cursor-pointer"
            >
              Review Questions
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between gap-2 mb-1.5">
        {totalQuestions > 1 && (
          <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full shrink-0">
            Q {currentQIndex + 1}/{totalQuestions}
          </span>
        )}
      </div>

      {totalQuestions > 1 && (
        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${((currentQIndex + (answered ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
      )}

      {isScheduled ? (
        <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center my-3 space-y-2">
          <Clock size={24} className="mx-auto text-purple-400 animate-pulse" />
          <h4 className="text-sm font-black text-white">Quiz Scheduled</h4>
          <p className="text-xs text-white/70">
            Question #1 unlocks in{" "}
            <LiveCountdown
              target={startTime}
              render={(ms) => <strong className="text-amber-400 font-mono">{formatCountdown(ms)}</strong>}
            />
          </p>
          <span className="text-[10px] text-white/40 block">
            {frequencyMinutes > 0
              ? `Questions unlock every ${frequencyMinutes} minutes`
              : "Questions unlock immediately"}
          </span>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{currentQ?.question}</p>

          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            {currentQ?.options?.map((opt: QuizOption) => {
              const letter = opt.id;
              const isThisCorrect = checkIsOptionCorrect(letter, currentQ);
              const isSelected = selectedId === letter || selectedId === opt.text;

              let cardStyle = "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white/90";
              if (answered) {
                if (isThisCorrect) {
                  cardStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-black";
                } else if (isSelected && !isThisCorrect) {
                  cardStyle = "bg-red-500/15 border-red-500 text-red-400";
                } else {
                  cardStyle = "opacity-35 border-white/[0.04]";
                }
              }

              return (
                <button
                  key={letter}
                  onClick={() => handleOptionSelect(letter)}
                  disabled={answered}
                  className={`rounded-xl p-3 border font-bold text-xs text-left transition-all cursor-pointer flex items-center justify-between ${cardStyle}`}
                >
                  <span className="whitespace-normal pr-1">
                    <span className="text-white/40 mr-1.5 font-bold">{letter}.</span>
                    {opt.text}
                  </span>
                  {answered && isThisCorrect && <Check size={14} className="text-emerald-400 shrink-0" />}
                  {answered && isSelected && !isThisCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-3">
              <div
                className={`text-[11px] font-black text-center p-2 rounded-xl border flex items-center justify-center gap-1.5 ${isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
              >
                <span>{isCorrect ? "🎉" : "💡"}</span>
                <span>
                  {isCorrect
                    ? `Correct! +${CORRECT_OPTION_BONUS} SXPs Bonus (+${PARTICIPATION_POINTS + CORRECT_OPTION_BONUS} SXP Total)`
                    : `+${PARTICIPATION_POINTS} SXPs for participating · The correct answer is ${correctOptionId}`}
                </span>
              </div>

              {totalQuestions > 1 && (
                <div className={`grid ${currentQIndex > 0 && currentQIndex < totalQuestions - 1 ? "grid-cols-2" : "grid-cols-1"} gap-2.5 w-full mt-2`}>
                  {currentQIndex > 0 && (
                    <button
                      onClick={handlePrevQuestion}
                      className="w-full py-2.5 rounded-xl bg-black text-white hover:bg-white/10 border border-white/20 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <ArrowLeft size={13} />
                      <span>Previous</span>
                    </button>
                  )}

                  {currentQIndex < totalQuestions - 1 && (
                    <>
                      {isNextQuestionLocked ? (
                        <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between text-xs font-bold text-white/80">
                          <span className="flex items-center gap-1.5 text-purple-300">
                            <Clock size={13} /> Next #{currentQIndex + 2} in:
                          </span>
                          <span className="font-mono text-amber-400 font-extrabold text-sm">
                            {formatCountdown(msToNextQuestionSlot)}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 border border-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
                        >
                          <span>Next</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}

      <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
              }`}
          >
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
            <span>{likesCount.toLocaleString()}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 size={13} />
            <span>{sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        <button
          onClick={() => onOpenEngagedModal?.(item)}
          className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
        >
          <span className="group-hover:underline">{totalEngaged.toLocaleString()} engaged</span>
          <ChevronRight
            size={12}
            className={`text-[#FF8A00] transition-transform duration-200 ${
              isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
            }`}
          />
        </button>
      </div>
    </motion.div>
  );
}

// ─── 3. Poll Card Component (+2 SXPs Participation, +10 SXPs Correct Option) ──
function DynamicPollCard({
  item,
  userId,
  userName,
  userAvatar,
  userEmail,
  now,
  onToast,
  onEdit,
  isHighlighted = false,
  onOpenEngagedModal,
  isEngagedExpanded = false,
  totalEngagedOverride,
}: {
  item: EngagementItem;
  userId?: string;
    userName?: string;
    userAvatar?: string;
    userEmail?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
  onOpenEngagedModal?: (item: EngagementItem) => void;
  isEngagedExpanded?: boolean;
  totalEngagedOverride?: number;
}) {
  const initialVote = getStoredVote("poll", item.id, userId);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialVote?.selectedId || item.userVote || null
  );
  const [voted, setVoted] = useState<boolean>(Boolean(initialVote || item.userVoted));
  const [loading, setLoading] = useState(false);
  const isVotingRef = useRef(false);

  // Bonus awarded state backed by localStorage
  const bonusClaimKey = `sf_poll_bonus_claimed_${item.id}_${userId || "anon"}`;
  const [bonusAwarded, setBonusAwarded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(bonusClaimKey) === "true";
  });
  const [serverIsCorrect, setServerIsCorrect] = useState<boolean | null>(null);

  const [options, setOptions] = useState(
    item.pollData?.options || [
      { id: "1", text: "Jasprit Bumrah 🏏", votes: 420 },
      { id: "2", text: "Maheesh Theekshana 🌀", votes: 195 },
      { id: "3", text: "Ravindra Jadeja 🍌", votes: 240 },
    ]
  );
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || 0);
  });

  useEffect(() => {
    if (totalEngagedOverride !== undefined) {
      setTotalEngaged(totalEngagedOverride);
    }
  }, [totalEngagedOverride]);

  const startTime = getEngagementStartTime(item);
  const isScheduled = startTime > now;
  const timeToStartMs = Math.max(0, startTime - now);

  const durationMins = Number(item.pollData?.durationMinutes || item.pollData?.timerMinutes || 10);
  const expiresAt = item.pollData?.expiresAt || (startTime + durationMins * 60 * 1000);
  const isExpired = now >= expiresAt;
  const timeRemainingMs = Math.max(0, expiresAt - now);

  const totalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0) || 1;
  const correctAnswer = item.pollData?.correctAnswer || item.pollData?.answer || "";

  const checkIsOptionWinner = useCallback(
    (opt: any) => {
      if (!correctAnswer || !opt) return false;
      const ca = correctAnswer.trim().toLowerCase();
      const optText = String(opt.text || opt.label || "").trim().toLowerCase();
      const optId = String(opt.id || "").trim().toLowerCase();
      return (
        optText === ca ||
        optId === ca ||
        (optText && ca && (optText.includes(ca) || ca.includes(optText))) ||
        opt.isCorrect === true
      );
    },
    [correctAnswer]
  );

  const chosenOpt = options.find((o) => o.id === selectedId || o.text === selectedId);
  const userWon = Boolean(chosenOpt && checkIsOptionWinner(chosenOpt));

  // Sync vote status on mount
  useEffect(() => {
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    const stored = getStoredVote("poll", item.id, userId);
    if (stored?.selectedId) {
      setSelectedId(stored.selectedId);
      setVoted(true);
    }

    if (item.userVoted && item.userVote) {
      setSelectedId(item.userVote);
      setVoted(true);
      setStoredVote("poll", item.id, { selectedId: item.userVote }, userId);
    }

    if (userId) {
      engagementService
        .checkVoteStatus(item.id, userId)
        .then((res) => {
          if (res.hasVoted && res.selectedOptionId) {
            setSelectedId(res.selectedOptionId);
            setVoted(true);
            setStoredVote("poll", item.id, { selectedId: res.selectedOptionId }, userId);
          }
          if (res.isCorrect !== undefined) {
            setServerIsCorrect(res.isCorrect);
          }
          if (res.accuracyBonusAwarded || res.wonBonusPoints === 10) {
            setServerIsCorrect(true);
            setBonusAwarded(true);
            localStorage.setItem(bonusClaimKey, "true");
          }
          // Only dispatch points if newly awarded right now by the server
          if (res.newlyAwarded === true) {
            onToast(`🏆 Correct Answer! +${CORRECT_OPTION_BONUS} SXPs Accuracy Bonus Awarded! 🎉`);
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
              );
            }
          }
        })
        .catch(() => { });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, bonusClaimKey, onToast]);

  // Evaluate & Claim +10 Bonus after Timer Ends (strictly once per item/user)
  const bonusClaimTriggeredRef = useRef(false);
  useEffect(() => {
    if (!isExpired || !voted || bonusAwarded || bonusClaimTriggeredRef.current) return;
    if (localStorage.getItem(bonusClaimKey) === "true") {
      setBonusAwarded(true);
      return;
    }

    if (userId) {
      bonusClaimTriggeredRef.current = true;
      engagementService
        .checkVoteStatus(item.id, userId)
        .then((res) => {
          if (res?.newlyAwarded === true || (res?.accuracyBonusAwarded && !bonusAwarded)) {
            setBonusAwarded(true);
            setServerIsCorrect(true);
            localStorage.setItem(bonusClaimKey, "true");
            if (res?.newlyAwarded === true) {
              onToast(`🏆 Correct Answer! +${CORRECT_OPTION_BONUS} SXPs Accuracy Bonus Awarded! 🎉`);
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
                );
              }
            }
          } else if (res?.isCorrect && !res?.accuracyBonusAwarded) {
            fetch(`/api/engagements/${item.id}/vote`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "claim_bonus",
                userId,
                selectedOptionId: selectedId,
              }),
            })
              .then((r) => r.json())
              .then((claimRes) => {
                if (claimRes?.newlyAwarded === true || claimRes?.wonBonusPoints === 10) {
                  setBonusAwarded(true);
                  setServerIsCorrect(true);
                  localStorage.setItem(bonusClaimKey, "true");
                  if (claimRes?.newlyAwarded === true) {
                    onToast(`🏆 Correct Answer! +${CORRECT_OPTION_BONUS} SXPs Accuracy Bonus Awarded! 🎉`);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
                      );
                    }
                  }
                }
              })
              .catch(() => { });
          }
        })
        .catch(() => { });
    }
  }, [isExpired, voted, bonusAwarded, item.id, userId, selectedId, bonusClaimKey, onToast]);

  const handleVote = async (optId: string) => {
    if (!userId || String(userId).toLowerCase().startsWith("anon")) {
      onToast("Please sign in to participate and earn SXPs!");
      return;
    }
    if (isScheduled) {
      onToast(`Poll unlocks in ${formatCountdown(timeToStartMs)}!`);
      return;
    }
    if (isExpired) {
      onToast("This poll has ended!");
      return;
    }
    if (voted || loading || isVotingRef.current || getStoredVote("poll", item.id, userId)) {
      onToast("You have already voted on this poll!");
      return;
    }

    isVotingRef.current = true;
    setSelectedId(optId);
    setVoted(true);
    setLoading(true);
    setStoredVote("poll", item.id, { selectedId: optId }, userId);
    setTotalEngaged((prev) => prev + 1);

    try {
      const res: any = await engagementService.voteEngagement(item.id, optId, userId, undefined, { userName, userAvatar, userEmail });
      if (res?.success && res.options) {
        setOptions(res.options);
      } else {
        setOptions((prev) =>
          prev.map((o) => (o.id === optId ? { ...o, votes: (o.votes || 0) + 1 } : o))
        );
      }
      onToast(`+${PARTICIPATION_POINTS} SXPs earned for voting! 📊`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
        );
      }
    } catch (err: any) {
      const prevOpt = err?.response?.data?.selectedOptionId || optId;
      setSelectedId(prevOpt);
      setOptions((prev) =>
        prev.map((o) => (o.id === prevOpt ? { ...o, votes: (o.votes || 0) + 1 } : o))
      );
    } finally {
      setLoading(false);
      isVotingRef.current = false;
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    // setTotalEngaged((prev) => prev + 1);
    engagementService.shareEngagement(item.id).catch(() => { });

    const shareUrl = getEngagementShareUrl(item);
    const text = `📊 Vote on this poll: "${item.pollData?.question || item.title}" on SportsFan360:`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      onToast("Poll link copied to clipboard! 📋");
    }
  };

  const formattedTime = formatEngagementPostingTime(item);

  return (
    <motion.div
      id={`engagement-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-blue-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
        ? "ring-2 ring-blue-500 shadow-[0_0_35px_rgba(59,130,246,0.35)] scale-[1.01]"
        : ""
        }`}
    >
      {isHighlighted && (
        <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 text-[10px] font-black text-blue-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-blue-400 animate-pulse" />
            <span>SHARED POLL</span>
          </span>
          <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
        </div>
      )}
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <div className="flex items-center gap-1.5 uppercase">
          <span className="text-blue-400 font-black">📊 POLL</span>
          {isScheduled ? (
            <>
              <span>•</span>
              <span className="text-amber-400 font-mono flex items-center gap-1">
                <Clock size={10} /> OPENS IN {formatCountdown(timeToStartMs)}
              </span>
            </>
          ) : isExpired ? (
            <>
              <span>•</span>
              <span className="text-rose-400 font-mono">🔒 CLOSED</span>
            </>
          ) : (
            <>
              <span>•</span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <Clock size={10} /> CLOSES IN {formatCountdown(timeRemainingMs)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedTime}</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{item.pollData?.question || item.title}</p>

      {isScheduled ? (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center my-2 space-y-1">
          <Clock size={20} className="mx-auto text-blue-400 animate-pulse" />
          <h4 className="text-xs font-black text-white">Poll Scheduled</h4>
          <p className="text-[11px] text-white/60">
            Voting opens in <strong className="text-amber-400 font-mono">{formatCountdown(timeToStartMs)}</strong>
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {/* Winner Celebration Status Banner */}
          {isExpired && voted && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
              {userWon || bonusAwarded || serverIsCorrect ? (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-xs font-black text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <span className="flex items-center gap-1.5">
                    <span>🎉</span>
                    <span>Correct Answer! You earned +10 SXPs Bonus (+12 SXPs Total)</span>
                  </span>
                  <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                    +10 SXPs
                  </span>
                </div>
              ) : correctAnswer ? (
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
                  <span>
                    Poll closed
                    {/* Winning answer: <strong className="text-emerald-400">{correctAnswer}</strong> */}
                  </span>
                  <span className="text-[10px] text-white/40 shrink-0">+2 SXPs participation</span>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Active Poll Participation Notice */}
          {voted && !isExpired && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-black text-center text-blue-400 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl mb-3 flex items-center justify-center gap-1.5"
            >
              <span>🔒</span>
              <span>+2 SXPs earned!</span>
            </motion.div>
          )}

          {options.map((opt) => {
            const isSelected = selectedId === opt.id || selectedId === opt.text;
            const percentage =
              opt.percentage !== undefined
                ? opt.percentage
                : Math.round(((opt.votes || 0) / totalVotes) * 100);

            const isWinner = checkIsOptionWinner(opt);

            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={voted || isExpired || loading}
                className={`w-full relative rounded-xl border overflow-hidden p-3.5 flex items-center justify-between text-xs font-extrabold text-left transition-all cursor-pointer ${isWinner && isExpired
                  ? "border-emerald-500/80 bg-emerald-500/[0.1] shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : isSelected
                    ? "border-blue-500/60 bg-blue-500/[0.07]"
                    : isExpired
                      ? "opacity-60 border-white/[0.05] bg-white/[0.01]"
                      : "border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03]"
                  }`}
              >
                {(voted || isExpired) && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`absolute left-0 top-0 bottom-0 z-0 ${isWinner && isExpired ? "bg-emerald-500/20" : isSelected ? "bg-blue-500/20" : "bg-white/[0.04]"
                      }`}
                  />
                )}
                <span className="relative z-10 text-white/90 font-bold flex items-center gap-1.5">
                  {opt.text}
                  {isWinner && isExpired && (
                    <span className="text-emerald-400 text-[10px] font-black">🏆 Correct Answer</span>
                  )}
                </span>
                {(voted || isExpired) && (
                  <span
                    className={`relative z-10 text-[11px] font-black ${isWinner && isExpired ? "text-emerald-400" : isSelected ? "text-blue-400" : "text-white/60"
                      }`}
                  >
                    {percentage}% {isSelected && "✓"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
              }`}
          >
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
            <span>{likesCount.toLocaleString()}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 size={13} />
            <span>{sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        {/* <span>{totalEngaged.toLocaleString()} engaged</span> */}
        <button
          onClick={() => onOpenEngagedModal?.(item)}
          className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
        >
          <span className="group-hover:underline">{totalEngaged.toLocaleString()} engaged</span>
          <ChevronRight
            size={12}
            className={`text-[#FF8A00] transition-transform duration-200 ${
              isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
            }`}
          />
        </button>
      </div>
    </motion.div>
  );
}

// ─── 4. Prediction Card Component (+2 SXPs Participation, +10 SXPs Correct) ───
function DynamicPredictionCard({
  item,
  userId,
  userName,
  userAvatar,
  userEmail,
  now,
  onToast,
  onEdit,
  isHighlighted = false,
  onOpenEngagedModal,
  isEngagedExpanded = false,
  totalEngagedOverride,
}: {
  item: EngagementItem;
  userId?: string;
    userName?: string;
    userAvatar?: string;
    userEmail?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
  onOpenEngagedModal?: (item: EngagementItem) => void;
  isEngagedExpanded?: boolean;
  totalEngagedOverride?: number;
}) {
  const pred = item.predictionData || {
    question: "India win the 1st Galle Test?",
    leftChoice: { id: "left", text: "Yes, India win", code: "IN", votes: 640 },
    rightChoice: { id: "right", text: "SL hold / win", code: "LK", votes: 260 },
    coinStake: 25,
    totalVotes: 900,
    status: "open",
  };

  const initialVote = getStoredVote("pred", item.id, userId);
  const [selectedChoice, setSelectedChoice] = useState<"left" | "right" | null>(
    initialVote?.choice || (item.userVote as "left" | "right") || null
  );
  const [predicted, setPredicted] = useState<boolean>(Boolean(initialVote || item.userVoted));
  const [loading, setLoading] = useState(false);
  const isPredictingRef = useRef(false);

  // Bonus awarded state backed by localStorage
  const bonusClaimKey = `sf_pred_bonus_claimed_${item.id}_${userId || "anon"}`;
  const [bonusAwarded, setBonusAwarded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(bonusClaimKey) === "true";
  });
  const [serverIsCorrect, setServerIsCorrect] = useState<boolean | null>(null);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || 0);
  });

  useEffect(() => {
    if (totalEngagedOverride !== undefined) {
      setTotalEngaged(totalEngagedOverride);
    }
  }, [totalEngagedOverride]);
  const startTime = getEngagementStartTime(item);
  const isScheduled = startTime > now;
  const timeToStartMs = Math.max(0, startTime - now);

  const durationMins = Number(item.predictionData?.durationMinutes || item.predictionData?.timerMinutes || 30);
  const expiresAt = item.predictionData?.expiresAt || (startTime + durationMins * 60 * 1000);
  const isExpired = now >= expiresAt;
  const timeRemainingMs = Math.max(0, expiresAt - now);

  const calcPredictionResult = useCallback(
    (
      choice?: "left" | "right" | string | null,
      serverLeftPct?: number,
      serverRightPct?: number
    ) => {
      // 1. If server explicitly returned valid percentages, respect them
      if (
        typeof serverLeftPct === "number" &&
        typeof serverRightPct === "number" &&
        !isNaN(serverLeftPct) &&
        !isNaN(serverRightPct)
      ) {
        return {
          leftPercentage: Math.round(serverLeftPct),
          rightPercentage: Math.round(serverRightPct),
          coinsLocked: initialVote?.coinsLocked || pred.coinStake || 25,
        };
      }

      // 2. If prediction data explicitly specifies percentages
      if (
        typeof (pred as any).leftPercentage === "number" &&
        typeof (pred as any).rightPercentage === "number" &&
        !isNaN((pred as any).leftPercentage) &&
        !isNaN((pred as any).rightPercentage)
      ) {
        return {
          leftPercentage: Math.round((pred as any).leftPercentage),
          rightPercentage: Math.round((pred as any).rightPercentage),
          coinsLocked: initialVote?.coinsLocked || pred.coinStake || 25,
        };
      }

      // 3. Calculate dynamically from real vote counts
      const lVotesRaw = Number(pred.leftChoice?.votes || 0);
      const rVotesRaw = Number(pred.rightChoice?.votes || 0);
      const userChoice = choice || selectedChoice;

      const addLeft = userChoice === "left" && !item.userVoted ? 1 : 0;
      const addRight = userChoice === "right" && !item.userVoted ? 1 : 0;

      const lVotes = lVotesRaw + addLeft;
      const rVotes = rVotesRaw + addRight;
      const total = lVotes + rVotes;

      if (total > 0) {
        const leftPct = Math.round((lVotes / total) * 100);
        return {
          leftPercentage: leftPct,
          rightPercentage: 100 - leftPct,
          coinsLocked: initialVote?.coinsLocked || pred.coinStake || 25,
        };
      }

      return {
        leftPercentage: 50,
        rightPercentage: 50,
        coinsLocked: initialVote?.coinsLocked || pred.coinStake || 25,
      };
    },
    [pred, initialVote?.coinsLocked, item.userVoted, selectedChoice]
  );

  const [result, setResult] = useState<{
    leftPercentage: number;
    rightPercentage: number;
    coinsLocked: number;
  } | null>(() => {
    const c = initialVote?.choice || (item.userVote as "left" | "right");
    if (!c && !isExpired) return null;

    if (
      typeof initialVote?.leftPercentage === "number" &&
      typeof initialVote?.rightPercentage === "number"
    ) {
      return {
        leftPercentage: Math.round(initialVote.leftPercentage),
        rightPercentage: Math.round(initialVote.rightPercentage),
        coinsLocked: initialVote.coinsLocked || pred.coinStake || 25,
      };
    }

    if (
      typeof (pred as any).leftPercentage === "number" &&
      typeof (pred as any).rightPercentage === "number"
    ) {
      return {
        leftPercentage: Math.round((pred as any).leftPercentage),
        rightPercentage: Math.round((pred as any).rightPercentage),
        coinsLocked: initialVote?.coinsLocked || pred.coinStake || 25,
      };
    }

    const lVotes = Number(pred.leftChoice?.votes || 0) + (c === "left" && !item.userVoted ? 1 : 0);
    const rVotes = Number(pred.rightChoice?.votes || 0) + (c === "right" && !item.userVoted ? 1 : 0);
    const total = lVotes + rVotes;
    if (total > 0) {
      const leftPct = Math.round((lVotes / total) * 100);
      return {
        leftPercentage: leftPct,
        rightPercentage: 100 - leftPct,
        coinsLocked: initialVote?.coinsLocked || pred.coinStake || 25,
      };
    }

    return {
      leftPercentage: 50,
      rightPercentage: 50,
      coinsLocked: initialVote?.coinsLocked || pred.coinStake || 25,
    };
  });

  const winningTarget =
    pred.winningChoiceId ||
    pred.correctAnswer ||
    pred.answer ||
    item.predictionData?.correctAnswer ||
    item.predictionData?.winningChoiceId ||
    "";

  const checkIsChoiceWinner = useCallback(
    (choice: "left" | "right" | string | null): boolean => {
      if (!choice || !winningTarget) return false;
      const target = winningTarget.trim().toLowerCase();
      const c = String(choice).trim().toLowerCase();
      const leftText = String(pred.leftChoice?.text || "").trim().toLowerCase();
      const leftCode = String(pred.leftChoice?.code || "").trim().toLowerCase();
      const rightText = String(pred.rightChoice?.text || "").trim().toLowerCase();
      const rightCode = String(pred.rightChoice?.code || "").trim().toLowerCase();

      const isTargetLeft =
        target === "left" ||
        (!!leftText && target === leftText) ||
        (!!leftCode && target === leftCode) ||
        (!!leftText && leftText.includes(target) && target.length > 2);

      const isTargetRight =
        target === "right" ||
        (!!rightText && target === rightText) ||
        (!!rightCode && target === rightCode) ||
        (!!rightText && rightText.includes(target) && target.length > 2);

      const isUserLeft =
        c === "left" ||
        (!!leftText && c === leftText) ||
        (!!leftCode && c === leftCode);

      const isUserRight =
        c === "right" ||
        (!!rightText && c === rightText) ||
        (!!rightCode && c === rightCode);

      if (isTargetLeft && isUserLeft) return true;
      if (isTargetRight && isUserRight) return true;
      return c === target;
    },
    [winningTarget, pred.leftChoice?.text, pred.leftChoice?.code, pred.rightChoice?.text, pred.rightChoice?.code]
  );

  const userWon = Boolean(predicted && checkIsChoiceWinner(selectedChoice));

  // Sync vote status on mount
  useEffect(() => {
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    const stored = getStoredVote("pred", item.id, userId);
    if (stored?.choice) {
      setSelectedChoice(stored.choice);
      setPredicted(true);
      const computed = calcPredictionResult(
        stored.choice,
        stored.leftPercentage,
        stored.rightPercentage
      );
      setResult(computed);
    }

    if (item.userVoted && item.userVote) {
      const choice = item.userVote as "left" | "right";
      setSelectedChoice(choice);
      setPredicted(true);
      const computed = calcPredictionResult(choice);
      setStoredVote(
        "pred",
        item.id,
        {
          choice,
          coinsLocked: pred.coinStake || 25,
          leftPercentage: computed.leftPercentage,
          rightPercentage: computed.rightPercentage,
        },
        userId
      );
      setResult(computed);
    } else if (isExpired && !selectedChoice) {
      const finalResult = calcPredictionResult(null);
      setResult(finalResult);
    }

    if (userId) {
      engagementService
        .checkVoteStatus(item.id, userId)
        .then((res) => {
          if (res.hasVoted && res.selectedOptionId) {
            const choice = res.selectedOptionId as "left" | "right";
            setSelectedChoice(choice);
            setPredicted(true);
            const computed = calcPredictionResult(
              choice,
              res.leftPercentage,
              res.rightPercentage
            );
            setStoredVote(
              "pred",
              item.id,
              {
                choice,
                coinsLocked: pred.coinStake || 25,
                leftPercentage: computed.leftPercentage,
                rightPercentage: computed.rightPercentage,
              },
              userId
            );
            setResult(computed);
          }
          if (res.isCorrect !== undefined) {
            setServerIsCorrect(res.isCorrect);
          }
          if (res.accuracyBonusAwarded || res.wonBonusPoints === 10) {
            setServerIsCorrect(true);
            setBonusAwarded(true);
            localStorage.setItem(bonusClaimKey, "true");
          }
          // Only dispatch points if newly awarded right now by the server
          if (res.newlyAwarded === true) {
            onToast(`🎯 Prediction Won! +${CORRECT_OPTION_BONUS} SXPs Accuracy Bonus Awarded! 🏆`);
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
              );
            }
          }
        })
        .catch(() => { });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, pred.coinStake, bonusClaimKey, onToast, calcPredictionResult, isExpired, selectedChoice]);

  // Evaluate & Claim +10 Bonus after Timer Ends (strictly once per item/user)
  const predBonusClaimTriggeredRef = useRef(false);
  useEffect(() => {
    if (!isExpired || !predicted || bonusAwarded || predBonusClaimTriggeredRef.current) return;
    if (localStorage.getItem(bonusClaimKey) === "true") {
      setBonusAwarded(true);
      return;
    }

    if (userId) {
      predBonusClaimTriggeredRef.current = true;
      engagementService
        .checkVoteStatus(item.id, userId)
        .then((res) => {
          if (res?.newlyAwarded === true || (res?.accuracyBonusAwarded && !bonusAwarded)) {
            setBonusAwarded(true);
            setServerIsCorrect(true);
            localStorage.setItem(bonusClaimKey, "true");
            if (res?.newlyAwarded === true) {
              onToast(`🎯 Prediction Won! +${CORRECT_OPTION_BONUS} SXPs Accuracy Bonus Awarded! 🏆`);
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
                );
              }
            }
          } else if (res?.isCorrect && !res?.accuracyBonusAwarded) {
            fetch(`/api/engagements/${item.id}/vote`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "claim_bonus",
                userId,
                selectedOptionId: selectedChoice,
              }),
            })
              .then((r) => r.json())
              .then((claimRes) => {
                if (claimRes?.newlyAwarded === true || claimRes?.wonBonusPoints === 10) {
                  setBonusAwarded(true);
                  setServerIsCorrect(true);
                  localStorage.setItem(bonusClaimKey, "true");
                  if (claimRes?.newlyAwarded === true) {
                    onToast(`🎯 Prediction Won! +${CORRECT_OPTION_BONUS} SXPs Accuracy Bonus Awarded! 🏆`);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
                      );
                    }
                  }
                }
              })
              .catch(() => { });
          }
        })
        .catch(() => { });
    }
  }, [isExpired, predicted, bonusAwarded, item.id, userId, selectedChoice, bonusClaimKey, onToast]);

  const handlePredict = async (choice: "left" | "right") => {
    if (!userId || String(userId).toLowerCase().startsWith("anon")) {
      onToast("Please sign in to participate and earn SXPs!");
      return;
    }
    if (isScheduled) {
      onToast(`Prediction unlocks in ${formatCountdown(timeToStartMs)}!`);
      return;
    }
    if (isExpired) {
      onToast("This prediction has closed!");
      return;
    }
    if (predicted || loading || isPredictingRef.current || getStoredVote("pred", item.id, userId)) {
      onToast("You have already made your prediction!");
      return;
    }

    isPredictingRef.current = true;
    setSelectedChoice(choice);
    setPredicted(true);
    setLoading(true);
    setStoredVote("pred", item.id, { choice, coinsLocked: pred.coinStake || 25 }, userId);
    setTotalEngaged((prev) => prev + 1);

    try {
      const res: any = await engagementService.voteEngagement(item.id, choice, userId);
      const computedResult = calcPredictionResult(
        choice,
        res?.leftPercentage,
        res?.rightPercentage
      );
      if (res?.coinsLocked) {
        computedResult.coinsLocked = res.coinsLocked;
      }
      setResult(computedResult);
      setStoredVote(
        "pred",
        item.id,
        {
          choice,
          coinsLocked: computedResult.coinsLocked,
          leftPercentage: computedResult.leftPercentage,
          rightPercentage: computedResult.rightPercentage,
        },
        userId
      );
      onToast(`+${PARTICIPATION_POINTS} SXPs earned for prediction! 🎯`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
        );
      }
    } catch (err: any) {
      const prevChoice = (err?.response?.data?.selectedOptionId || choice) as "left" | "right";
      setSelectedChoice(prevChoice);
      const fallbackResult = calcPredictionResult(prevChoice);
      setResult(fallbackResult);
      setStoredVote(
        "pred",
        item.id,
        {
          choice: prevChoice,
          coinsLocked: fallbackResult.coinsLocked,
          leftPercentage: fallbackResult.leftPercentage,
          rightPercentage: fallbackResult.rightPercentage,
        },
        userId
      );
    } finally {
      setLoading(false);
      isPredictingRef.current = false;
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    // setTotalEngaged((prev) => prev + 1);
    engagementService.shareEngagement(item.id).catch(() => { });

    const shareUrl = getEngagementShareUrl(item);
    const text = `🎯 Predict: "${pred.question || item.title}" on SportsFan360:`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      onToast("Prediction link copied to clipboard! 📋");
    }
  };

  const formattedTime = formatEngagementPostingTime(item);

  return (
    <motion.div
      id={`engagement-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-amber-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
        ? "ring-2 ring-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.35)] scale-[1.01]"
        : ""
        }`}
    >
      {isHighlighted && (
        <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-[10px] font-black text-amber-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-amber-400 animate-pulse" />
            <span>SHARED PREDICTION</span>
          </span>
          <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
        </div>
      )}
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <div className="flex items-center gap-1.5 uppercase">
          <span className="text-amber-400">🎯 PREDICTION</span>
          {isScheduled ? (
            <>
              <span>•</span>
              <span className="text-amber-400 font-mono flex items-center gap-1">
                <Clock size={10} /> OPENS IN {formatCountdown(timeToStartMs)}
              </span>
            </>
          ) : isExpired ? (
            <>
              <span>•</span>
              <span className="text-rose-400 font-mono">🔒 CLOSED</span>
            </>
          ) : (
            <>
              <span>•</span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <Clock size={10} /> CLOSES IN {formatCountdown(timeRemainingMs)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedTime}</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{pred.question || item.title}</p>

      {isScheduled ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center my-2 space-y-1">
          <Clock size={20} className="mx-auto text-amber-400 animate-pulse" />
          <h4 className="text-xs font-black text-white">Prediction Scheduled</h4>
          <p className="text-[11px] text-white/60">
            Predictions open in <strong className="text-amber-400 font-mono">{formatCountdown(timeToStartMs)}</strong>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 mb-4">
          <button
            onClick={() => handlePredict("left")}
            disabled={predicted || isExpired || loading}
            className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${selectedChoice === "left"
              ? "bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-400"
              : predicted || isExpired
                ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white"
              }`}
          >
            <span className="text-xs font-black">{pred.leftChoice.text}</span>
            <span className="text-[10px] font-black mt-1 text-white/50">
              {/* {result ? `${result.leftPercentage}%` : "2X multiplier"} */}
              {result ? `${result.leftPercentage}%` : null}
            </span>
          </button>

          <button
            onClick={() => handlePredict("right")}
            disabled={predicted || isExpired || loading}
            className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${selectedChoice === "right"
              ? "bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-400"
              : predicted || isExpired
                ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white"
              }`}
          >
            <span className="text-xs font-black">{pred.rightChoice.text}</span>
            <span className="text-[10px] font-black mt-1 text-white/50">
              {/* {result ? `${result.rightPercentage}%` : "5X multiplier"} */}
              {result ? `${result.rightPercentage}%` : null}
            </span>
          </button>
        </div>
      )}

      {predicted && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
          {isExpired ? (
            userWon || bonusAwarded || serverIsCorrect ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-xs font-black text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <span className="flex items-center gap-1.5">
                  <span>🎉</span>
                  <span>Prediction Won! You earned +10 SXPs Bonus (+12 SXPs Total)</span>
                </span>
                <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                  +10 SXPs
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
                <span>
                  Prediction closed
                  {/* <strong className="text-amber-400">{winningTarget || "Ended"}</strong> */}
                </span>
                <span className="text-[10px] text-white/40 shrink-0">+2 SXPs participation</span>
              </div>
            )
          ) : (
            <div className="text-[11px] font-black text-center text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-center gap-1.5">
              <span>🔒</span>
              <span>+2 SXPs earned!</span>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
              }`}
          >
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
            <span>{likesCount.toLocaleString()}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 size={13} />
            <span>{sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        {/* <span>{totalEngaged.toLocaleString()} engaged</span> */}
        <button
          onClick={() => onOpenEngagedModal?.(item)}
          className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
        >
          <span className="group-hover:underline">{totalEngaged.toLocaleString()} engaged</span>
          <ChevronRight
            size={12}
            className={`text-[#FF8A00] transition-transform duration-200 ${
              isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
            }`}
          />
        </button>
      </div>
    </motion.div>
  );
}

// ─── 5. Meme Card Component (5 Heat Rating Tiers +2 SXPs Participation) ───────
function DynamicMemeCard({
  item,
  userId,
  userName,
  userAvatar,
  userEmail,
  now,
  onToast,
  onEdit,
  onDelete,
  isHighlighted = false,
  onOpenEngagedModal,
  isEngagedExpanded = false,
  totalEngagedOverride,
}: {
  item: EngagementItem;
  userId?: string;
    userName?: string;
    userAvatar?: string;
    userEmail?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  onDelete?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
  onOpenEngagedModal?: (item: EngagementItem) => void;
  isEngagedExpanded?: boolean;
  totalEngagedOverride?: number;
}) {
  const { user } = useAuth();
  const currentUserId = userId || user?.userId || (user as any)?.actualUserId || user?.email;
  const currentUserEmail = user?.email || (user as any)?.userEmail || "";
  const currentUserName = user?.name || (user as any)?.userName || (user as any)?.displayName || "";

  const meme = item.memeData || {
    imageUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80",
    caption: item.subtitle || item.title || "Matchday meme energy!",
    authorName: "SportsFan",
    authorHandle: "@SportsFan",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    heatPercentage: 0,
    totalVotes: 0,
    reactions: { mild: 0, funny: 0, hot: 0, fire: 0, nuclear: 0 },
    commentsCount: 0,
    sharesCount: 0,
  };

  // Check if current user is the author who posted this meme
  const isAuthor = Boolean(
    (currentUserId && (
      item.creatorId === currentUserId ||
      (item as any).userId === currentUserId ||
      (item as any).creatorId === currentUserId
    )) ||
    (currentUserEmail && (
      (item.creatorEmail && item.creatorEmail.toLowerCase() === currentUserEmail.toLowerCase()) ||
      ((item as any).userEmail && (item as any).userEmail.toLowerCase() === currentUserEmail.toLowerCase()) ||
      ((item as any).creatorEmail && (item as any).creatorEmail.toLowerCase() === currentUserEmail.toLowerCase())
    )) ||
    (currentUserName && (
      (item.creatorName && item.creatorName.toLowerCase() === currentUserName.toLowerCase()) ||
      (meme.authorName && meme.authorName.toLowerCase() === currentUserName.toLowerCase())
    )) ||
    (user as any)?.role === "admin"
  );

  const initialStored = getStoredVote("meme", item.id, userId);
  const [selectedRating, setSelectedRating] = useState<MemeReactionType>(
    (initialStored?.reaction as MemeReactionType) || (item.userVote as MemeReactionType) || "hot"
  );
  const [voted, setVoted] = useState<boolean>(Boolean(initialStored || item.userVoted));
  const [loading, setLoading] = useState(false);
  const isRatingRef = useRef(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || Number(meme.sharesCount) || 0);
  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || Number(meme.totalVotes) || 0);
  });

  useEffect(() => {
    if (totalEngagedOverride !== undefined) {
      setTotalEngaged(totalEngagedOverride);
    }
  }, [totalEngagedOverride]);
  const [heatPct, setHeatPct] = useState<number>(meme.heatPercentage !== undefined ? Number(meme.heatPercentage) : (Number(item.memeData?.heatPercentage) || 0));
  const [totalMemeVotes, setTotalMemeVotes] = useState<number>(meme.totalVotes !== undefined ? Number(meme.totalVotes) : (Number(item.memeData?.totalVotes) || 0));
  const [reactions, setReactions] = useState(meme.reactions || { mild: 0, funny: 0, hot: 0, fire: 0, nuclear: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    const stored = getStoredVote("meme", item.id, userId);
    if (stored?.reaction) {
      setSelectedRating(stored.reaction);
      setVoted(true);
    }

    if (item.userVoted && item.userVote) {
      setSelectedRating(item.userVote as MemeReactionType);
      setVoted(true);
      setStoredVote("meme", item.id, { reaction: item.userVote }, userId);
    }

    if (userId) {
      engagementService
        .checkVoteStatus(item.id, userId)
        .then((res) => {
          if (res.hasVoted && res.selectedOptionId) {
            setSelectedRating(res.selectedOptionId as MemeReactionType);
            setVoted(true);
            setStoredVote("meme", item.id, { reaction: res.selectedOptionId }, userId);
          }
        })
        .catch(() => { });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId]);

  useEffect(() => {
    if (item.memeData?.reactions) {
      setReactions(item.memeData.reactions);
    }
    if (item.memeData?.heatPercentage !== undefined) {
      setHeatPct(Number(item.memeData.heatPercentage));
    }
    if (item.memeData?.totalVotes !== undefined) {
      setTotalMemeVotes(Number(item.memeData.totalVotes));
    }
  }, [item.memeData]);

  const handleRateMeme = async (ratingToSubmit?: MemeReactionType) => {
    if (!currentUserId || String(currentUserId).toLowerCase().startsWith("anon")) {
      onToast("Please sign in to participate and earn SXPs!");
      return;
    }
    const finalRating = ratingToSubmit || selectedRating || "hot";
    if (voted || loading || isRatingRef.current || getStoredVote("meme", item.id, userId)) {
      onToast("You already voted on this meme!");
      return;
    }

    isRatingRef.current = true;
    setSelectedRating(finalRating);
    setVoted(true);
    setLoading(true);
    setStoredVote("meme", item.id, { reaction: finalRating }, userId);
    setTotalMemeVotes((prev) => prev + 1);
    setTotalEngaged((prev) => prev + 1);

    setReactions((prev) => {
      const updated = { ...prev, [finalRating]: (prev[finalRating] || 0) + 1 };
      const sum = Object.values(updated).reduce((a, b) => a + b, 0);
      const score = updated.mild * 20 + updated.funny * 40 + updated.hot * 60 + updated.fire * 80 + updated.nuclear * 100;
      if (sum > 0) setHeatPct(Math.min(100, Math.max(10, Math.round(score / sum))));
      return updated;
    });

    try {
      const res: any = await engagementService.voteEngagement(item.id, finalRating, userId, undefined, { userName, userAvatar, userEmail });
      if (res?.heatPercentage !== undefined) setHeatPct(res.heatPercentage);
      if (res?.totalVotes !== undefined) setTotalMemeVotes(res.totalVotes);
      if (res?.reactions) setReactions(res.reactions);

      onToast(`🔥 Voted ${finalRating.toUpperCase()}! +${PARTICIPATION_POINTS} SXPs earned!`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
        );
      }
    } catch (err: any) {
      const prevOption = err?.response?.data?.selectedOptionId || finalRating;
      setSelectedRating(prevOption as MemeReactionType);
    } finally {
      setLoading(false);
      isRatingRef.current = false;
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    // setTotalEngaged((prev) => prev + 1);
    engagementService.shareEngagement(item.id).catch(() => { });

    const shareUrl = getEngagementShareUrl(item);
    const text = `🔥 Check out this meme: "${item.title}" on SportsFan360 Meme Arena:`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      onToast("Meme link copied to clipboard! 📋");
    }
  };

  const ratingTiers: {
    id: MemeReactionType;
    label: string;
    flameColor: string;
    bgSelected: string;
    borderSelected: string;
  }[] = [
      {
        id: "mild",
        label: "Mild",
        flameColor: "text-slate-400",
        bgSelected: "bg-slate-500/20",
        borderSelected: "border-slate-400",
      },
      {
        id: "funny",
        label: "Funny",
        flameColor: "text-pink-400",
        bgSelected: "bg-pink-500/25",
        borderSelected: "border-pink-500",
      },
      {
        id: "hot",
        label: "Hot",
        flameColor: "text-amber-400",
        bgSelected: "bg-amber-500/25",
        borderSelected: "border-amber-500",
      },
      {
        id: "fire",
        label: "Fire",
        flameColor: "text-orange-500",
        bgSelected: "bg-gradient-to-b from-orange-500/30 to-red-500/20",
        borderSelected: "border-orange-500",
      },
      {
        id: "nuclear",
        label: "Nuclear",
        flameColor: "text-fuchsia-400",
        bgSelected: "bg-gradient-to-b from-fuchsia-500/35 to-pink-500/25",
        borderSelected: "border-fuchsia-500",
      },
    ];

  return (
    <motion.div
      id={`engagement-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-orange-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-3.5 sm:p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
        ? "ring-2 ring-orange-500 shadow-[0_0_35px_rgba(249,115,22,0.35)] scale-[1.01]"
        : ""
        }`}
    >
      {isHighlighted && (
        <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 text-[10px] font-black text-orange-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-orange-400 animate-pulse" />
            <span>SHARED MEME</span>
          </span>
          <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
        </div>
      )}
      {/* Standard Header Row */}
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <div className="flex items-center gap-1.5 uppercase">
          <span className="text-orange-400 flex items-center gap-1">🔥 MEME</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{formatEngagementPostingTime(item)}</span>
          {isAuthor && (onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Meme options"
              >
                <MoreVertical size={13} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 w-36 bg-[#161a26] border border-white/10 rounded-xl py-1 shadow-2xl z-30 text-xs">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(item);
                      }}
                      className="w-full px-3 py-1.5 text-left text-white/80 hover:bg-white/10 hover:text-white flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <Pencil size={12} /> Edit Meme
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(item);
                      }}
                      className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete Meme
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meme Title / Headline */}
      {item.title && (
        <p className="text-xs font-semibold text-white/80 mb-2 leading-relaxed">
          {item.title}
        </p>
      )}

      {/* Meme Visual Image Frame */}
      <div className="relative w-full rounded-xl overflow-hidden border border-white/[0.08] mb-3.5 bg-black/60 shadow-inner group">
        <img
          src={meme.imageUrl}
          alt={item.title || "Sports meme"}
          className="w-full max-h-[380px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
          onError={(e: any) => {
            e.target.src = "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80";
          }}
        />
        {meme.caption && meme.caption !== item.title && (
          <div className="p-2.5 bg-[#0a0d16]/95 border-t border-white/[0.06] text-[11px] font-bold text-white/80 text-center">
            {meme.caption}
          </div>
        )}
      </div>

      {/* "How Hot Is This Meme?" Section */}
      <div className="mb-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-white flex items-center gap-1.5">
            <span>How Hot Is This Meme?</span>
          </span>
          {voted && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check size={10} /> Vote Recorded
            </span>
          )}
        </div>

        {/* 5-Tier Flame Reaction Selector */}
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-black/40 border border-white/[0.06] rounded-xl w-full">
          {ratingTiers.map((tier) => {
            const isSelected = selectedRating === tier.id;
            const tierVotes = Number(reactions?.[tier.id] || 0);
            const tierPct = totalMemeVotes > 0 ? Math.round((tierVotes / totalMemeVotes) * 100) : 0;

            return (
              <button
                key={tier.id}
                type="button"
                disabled={voted || loading}
                onClick={() => {
                  if (voted || loading) return;
                  setSelectedRating(tier.id);
                }}
                className={`py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all border min-w-0 w-full relative overflow-hidden ${voted ? "cursor-default" : "cursor-pointer hover:bg-white/[0.05]"
                  } ${isSelected
                    ? `${tier.bgSelected} ${tier.borderSelected} shadow-md scale-[1.02] sm:scale-[1.03]`
                    : "bg-white/[0.02] border-transparent text-white/50"
                  }`}
              >
                <Flame
                  size={16}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${tier.flameColor} transition-transform duration-200 ${isSelected ? "scale-110 sm:scale-125 animate-bounce" : "opacity-60"
                    }`}
                  fill={isSelected ? "currentColor" : "none"}
                />
                <span
                  className={`text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-black tracking-tight text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-0.5 ${isSelected ? tier.flameColor : "text-white/70"
                    }`}
                  title={tier.label}
                >
                  {tier.label}
                </span>

                {/* Vote Count & Percentage Badge after voting */}
                {voted && (
                  <div className="flex flex-col items-center w-full mt-0.5">
                    <span
                      className={`text-[8px] xs:text-[8.5px] sm:text-[9px] font-black px-1 leading-none text-center truncate max-w-full ${isSelected ? "text-white font-extrabold" : "text-white/60"
                        }`}
                    >
                      {tierVotes.toLocaleString()}
                    </span>
                    <span className={`text-[7px] xs:text-[7.5px] sm:text-[8px] font-bold leading-none mt-0.5 ${isSelected ? tier.flameColor : "text-white/40"}`}>
                      {tierPct}%
                    </span>
                    {/* Visual mini vote share indicator */}
                    <div className="w-full bg-white/[0.08] h-1 rounded-full overflow-hidden mt-1 px-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isSelected ? "bg-orange-500" : "bg-white/30"
                          }`}
                        style={{ width: `${tierPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>


      {/* Action Buttons Row */}
      <div className={voted ? "w-full" : "grid grid-cols-3 gap-2"}>
        <button
          onClick={() => handleRateMeme(selectedRating)}
          disabled={voted || loading}
          className={`${voted ? "w-full" : "col-span-2"} py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95 ${voted
            ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
            : "bg-gradient-to-r from-[#FF3D57] to-[#FF7B02] hover:opacity-95 text-white shadow-orange-500/20"
            }`}
        >
          {voted ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span>Voted {selectedRating.toUpperCase()} (+2 SXPs)</span>
            </>
          ) : (
            <>
              <Flame size={14} className="animate-pulse" />
              <span>Vote {selectedRating.charAt(0).toUpperCase() + selectedRating.slice(1)}</span>
            </>
          )}
        </button>
      </div>

      {/* Engagement Footer */}
      <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
              }`}
          >
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
            <span>{likesCount.toLocaleString()}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <Share2 size={13} />
          </button>
        </div>
        {/* <span>{totalEngaged.toLocaleString()} engaged</span> */}
        <button
          onClick={() => onOpenEngagedModal?.(item)}
          className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
        >
          <span className="group-hover:underline">{totalEngaged.toLocaleString()} engaged</span>
          <ChevronRight
            size={12}
            className={`text-[#FF8A00] transition-transform duration-200 ${
              isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
            }`}
          />
        </button>
      </div>
    </motion.div>
  );
}


// ─── Engaged Users Dialog Modal ──────────────────────────────────────────────
interface EngagedOptionData {
  id: string;
  text: string;
  count: number;
  voters: Array<{
    userId: string;
    userName: string;
    userAvatar?: string | null;
    selectedOptionId: string;
    votedAt?: number;
  }>;
}

// Filter helper to strictly exclude unregistered/anonymous IP-based voters
function isValidRegisteredVoter(voter: any): boolean {
  if (!voter) return false;
  const id = String(voter.userId || voter.actualUserId || voter.id || "").trim().toLowerCase();
  const name = String(voter.userName || voter.username || voter.name || "").trim().toLowerCase();
  const email = String((voter as any).userEmail || voter.email || "").trim().toLowerCase();

  // Exclude anonymous / unregistered tokens
  if (id.startsWith("anon_") || id.startsWith("anon-") || id.startsWith("anon") || id === "anonymous") return false;
  if (name.startsWith("anon_") || name.startsWith("anon-") || name.startsWith("anon") || name === "anonymous") return false;
  if (email.startsWith("anon_") || email.startsWith("anon-") || email.startsWith("anon") || email === "anonymous") return false;

  // Exclude raw IP strings (e.g. IPv6 colons or proxy commas)
  if (id.includes(":") || name.includes(":") || id.includes(",") || name.includes(",")) return false;

  return true;
}

function EngagedUsersInlineList({
  item,
  questionId,
  questionIndex,
  onSyncCount,
}: {
  item: EngagementItem | null;
  questionId?: string;
  questionIndex?: number;
  onSyncCount?: (count: number) => void;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<EngagedOptionData[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [userAvatarMap, setUserAvatarMap] = useState<Map<string, string>>(new Map());
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!item) return;

    setLoading(true);
    setPage(1); // Reset page on new item or question
    const qParam = questionId ? `?questionId=${encodeURIComponent(questionId)}` : "";
    axios
      .get(`/api/engagements/${item.id}/voters${qParam}`)
      .then((res) => {
        if (res.data?.success) {
          let opts: EngagedOptionData[] = [];
          if (res.data.questions && Array.isArray(res.data.questions)) {
            const targetQ = questionId
              ? res.data.questions.find((q: any) => q.questionId === questionId || q.id === questionId)
              : res.data.questions[questionIndex || 0] || res.data.questions[0];
            opts = targetQ?.options || [];
          } else if (res.data.options) {
            if (questionId && res.data.options.some((o: any) => o.questionId)) {
              opts = res.data.options.filter((o: any) => o.questionId === questionId);
            } else {
              opts = res.data.options || [];
            }
          }

          // Filter out unregistered/anonymous voters from each option
          const cleanOpts = opts.map((opt) => {
            const validVoters = (opt.voters || []).filter((v: any) => isValidRegisteredVoter(v));
            return {
              ...opt,
              voters: validVoters,
              count: validVoters.length,
            };
          });

          setOptions(cleanOpts);
          const total = cleanOpts.reduce((acc, o) => acc + (o.voters?.length || 0), 0);
          setTotalVoters(total);
        }
      })
      .catch((err) => {
        console.warn("Failed to load voters:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [item, questionId, questionIndex]);

  // Fetch fresh user avatars from /api/users
  useEffect(() => {
    if (!item) return;

    const buildMap = (list: any[]) => {
      const map = new Map<string, string>();
      const add = (key: any, img: any) => {
        if (!key || !img || typeof img !== "string") return;
        const clean = img.trim();
        if (!clean || clean === "null" || clean === "undefined") return;
        if (clean.includes("dicebear.com")) return;
        const k = String(key).trim().toLowerCase();
        const noPrefix = k.replace(/^user#/i, "");
        map.set(k, clean);
        map.set(noPrefix, clean);
        if (k.includes("@")) map.set(k.replace(/@/g, "_"), clean);
      };

      list.forEach((u) => {
        if (!u) return;
        const img =
          u.avatarUrl || u.photoURL || u.picture || u.image ||
          u.avatar || u.profilePicture || u.userAvatar;
        if (!img) return;
        add(u.userId, img);
        add(u.actualUserId, img);
        add(u.id, img);
        add(u.email, img);
        add(u.userEmail, img);
        add(u.username, img);
        add(u.userName, img);
        add(u.name, img);
      });
      return map;
    };

    const fetchAvatars = async () => {
      try {
        const res = await axios.get("/api/users", { withCredentials: true });
        const list =
          res.data?.users ||
          res.data?.data?.users ||
          res.data?.data ||
          res.data?.allUsers ||
          (Array.isArray(res.data) ? res.data : []);
        setUserAvatarMap(buildMap(list));
      } catch {
        // silent fail
      }
    };
    fetchAvatars();
  }, [item]);

  // Check if current user has voted on this item
  const currentUserVoted = useMemo(() => {
    if (!user || !item) return false;
    const uid = user.userId || (user as any)?.actualUserId || user.email;
    if (!uid || String(uid).toLowerCase().startsWith("anon")) return false;

    if (item.type === "quiz") {
      const qId = questionId || item.quizData?.questions?.[questionIndex || 0]?.id || `q_${questionIndex || 0}`;
      return Boolean(getStoredVote(`quiz_q_${qId}`, item.id, uid) || getStoredVote("quiz_engaged", item.id, uid));
    } else if (item.type === "fan_battle") {
      return Boolean(getStoredVote("fb", item.id, uid));
    } else if (item.type === "poll") {
      return Boolean(getStoredVote("poll", item.id, uid));
    } else if (item.type === "prediction") {
      return Boolean(getStoredVote("pred", item.id, uid));
    } else if (item.type === "meme") {
      return Boolean(getStoredVote("meme", item.id, uid));
    }
    return Boolean(item.userVoted);
  }, [item, user, questionId, questionIndex]);

  // Combined list of voters strictly filtering out anonymous entries
  const allVoters = useMemo(() => {
    const raw = options
      .flatMap((opt) => (opt.voters || []).map((v) => ({ ...v, optionId: opt.id, optionText: opt.text })))
      .filter((v) => isValidRegisteredVoter(v));

    if (currentUserVoted && user) {
      const uid = String(user.userId || (user as any)?.actualUserId || user.email || "");
      if (isValidRegisteredVoter({ userId: uid, userName: user.name, userEmail: user.email })) {
        const alreadyIn = raw.some(
          (v) =>
            v.userId === uid ||
            (user.email && v.userId?.toLowerCase() === user.email.toLowerCase()) ||
            (user.name && v.userName?.toLowerCase() === user.name.toLowerCase())
        );

        if (!alreadyIn && uid) {
          raw.unshift({
            userId: uid,
            userName: user.name || (user as any)?.userName || user.email?.split("@")[0] || "You",
            userAvatar: (user as any)?.avatarUrl || user.photoURL || (user as any)?.picture || null,
            selectedOptionId: "",
            optionId: "",
            optionText: "",
            votedAt: Date.now(),
          });
        }
      }
    }

    return raw;
  }, [options, currentUserVoted, user]);

  const finalVotersCount = allVoters.length;

  useEffect(() => {
    if (!loading) {
      onSyncCount?.(finalVotersCount);
    }
  }, [finalVotersCount, loading, onSyncCount]);

  if (!item) return null;

  // Resolve the freshest avatar for a voter
  const resolveAvatar = (voter: EngagedOptionData["voters"][number]): string => {
    const isMe =
      user?.userId === voter.userId ||
      (user as any)?.actualUserId === voter.userId ||
      (user?.email && voter.userId === user.email);

    if (isMe && typeof window !== "undefined") {
      const local = localStorage.getItem("roar_avatar_url");
      if (local && !local.includes("dicebear.com")) return local;
    }
    if (voter.userAvatar) return voter.userAvatar;

    const candidates = [
      voter.userId,
      voter.userName,
      (voter as any).userEmail,
    ].filter(Boolean) as string[];

    for (const c of candidates) {
      const k = String(c).trim().toLowerCase();
      const found =
        userAvatarMap.get(k) ||
        userAvatarMap.get(k.replace(/^user#/i, "")) ||
        userAvatarMap.get(k.replace(/@/g, "_"));
      if (found) return found;
    }
    return "";
  };

  const displayedVoters = allVoters.slice(0, page * itemsPerPage);
  const hasMore = displayedVoters.length < allVoters.length;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore) {
      setPage((p) => p + 1);
    }
  };

  const getBadgeColor = (id: string) => {
    const upper = id.toUpperCase();
    if (upper === "A" || upper === "LEFT" || upper === "1") return "text-purple-400 border-purple-400/60 bg-purple-500/10";
    if (upper === "B" || upper === "RIGHT" || upper === "2") return "text-emerald-400 border-emerald-400/60 bg-emerald-500/10";
    if (upper === "C" || upper === "3") return "text-blue-400 border-blue-400/60 bg-blue-500/10";
    if (upper === "D" || upper === "4") return "text-[#FF3D57] border-[#FF3D57]/60 bg-[#FF3D57]/10";
    return "text-amber-400 border-amber-400/60 bg-amber-500/10";
  };

  const getMemeReactionInfo = (reactionStr: string) => {
    const clean = String(reactionStr || "").trim().toLowerCase();
    if (clean === "mild" || clean === "m" || clean === "1") {
      return { id: "mild", label: "Mild", flameColor: "text-slate-400", badgeClasses: "text-slate-400 border-slate-400/40 bg-slate-500/15" };
    }
    if (clean === "funny" || clean === "fun" || clean === "f" || clean === "2") {
      return { id: "funny", label: "Funny", flameColor: "text-pink-400", badgeClasses: "text-pink-400 border-pink-500/40 bg-pink-500/15" };
    }
    if (clean === "hot" || clean === "h" || clean === "3") {
      return { id: "hot", label: "Hot", flameColor: "text-amber-400", badgeClasses: "text-amber-400 border-amber-500/40 bg-amber-500/15" };
    }
    if (clean === "fire" || clean === "4") {
      return { id: "fire", label: "Fire", flameColor: "text-orange-500", badgeClasses: "text-orange-500 border-orange-500/40 bg-orange-500/15" };
    }
    if (clean === "nuclear" || clean === "n" || clean === "5") {
      return { id: "nuclear", label: "Nuclear", flameColor: "text-fuchsia-400", badgeClasses: "text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-500/15" };
    }
    return { id: "hot", label: "Hot", flameColor: "text-amber-400", badgeClasses: "text-amber-400 border-amber-500/40 bg-amber-500/15" };
  };

  // Accurately resolve chosen option for a voter (e.g. D for option D, or Flame for Meme)
  const resolveVoterOption = (voter: any): { id: string; badgeClasses: string; isMeme?: boolean; flameColor?: string } => {
    const isMe =
      user?.userId === voter.userId ||
      (user as any)?.actualUserId === voter.userId ||
      (user?.email && voter.userId === user.email);

    let chosen = "";
    if (isMe) {
      if (item.type === "quiz") {
        const qId = questionId || item.quizData?.questions?.[questionIndex || 0]?.id || `q_${questionIndex || 0}`;
        const stored = getStoredVote(`quiz_q_${qId}`, item.id, user?.userId || (user as any)?.actualUserId || user?.email);
        if (stored?.selectedId) chosen = stored.selectedId;
      } else if (item.type === "fan_battle") {
        const stored = getStoredVote("fb", item.id, user?.userId);
        if (stored?.side) chosen = stored.side;
      } else if (item.type === "poll") {
        const stored = getStoredVote("poll", item.id, user?.userId);
        if (stored?.selectedId) chosen = stored.selectedId;
      } else if (item.type === "prediction") {
        const stored = getStoredVote("pred", item.id, user?.userId);
        if (stored?.choice) chosen = stored.choice;
      } else if (item.type === "meme") {
        const stored = getStoredVote("meme", item.id, user?.userId);
        if (stored?.reaction) chosen = stored.reaction;
      }
    }

    if (!chosen) {
      chosen = voter.reaction || voter.selectedOptionId || voter.optionId || voter.choice || voter.side || "";
    }

    // Special handling for memes: return flame icon info
    if (item.type === "meme") {
      const memeInfo = getMemeReactionInfo(chosen);
      return {
        id: memeInfo.id,
        isMeme: true,
        flameColor: memeInfo.flameColor,
        badgeClasses: memeInfo.badgeClasses,
      };
    }

    // Match text to option ID if needed
    if (chosen && item.type === "quiz" && item.quizData?.questions) {
      const qObj = questionId
        ? item.quizData.questions.find((q: any) => q.id === questionId || q.questionId === questionId)
        : item.quizData.questions[questionIndex || 0] || item.quizData.questions[0];
      if (qObj?.options) {
        const matched = qObj.options.find(
          (o: any) =>
            o.text?.trim().toLowerCase() === chosen.trim().toLowerCase() ||
            o.id?.trim().toLowerCase() === chosen.trim().toLowerCase()
        );
        if (matched?.id) chosen = matched.id;
      }
    }

    const displayId = (chosen || "A").trim().charAt(0).toUpperCase();
    
    // In quiz, correct option is green, remaining options are red
    let badgeClasses = "";
    if (item.type === "quiz") {
      const qObj = questionId
        ? item.quizData?.questions?.find((q: any) => q.id === questionId || q.questionId === questionId)
        : item.quizData?.questions?.[questionIndex || 0] || item.quizData?.questions?.[0];
      
      const correctTarget = (
        qObj?.correctOptionId ||
        (qObj as any)?.answer ||
        item.quizData?.correctOptionId ||
        ""
      ).trim().toUpperCase();

      const isThisOptionCorrect =
        displayId === correctTarget ||
        Boolean(
          qObj?.options &&
          qObj.options.some(
            (o: any) =>
              o.id?.trim().toUpperCase() === displayId &&
              (o.isCorrect === true || o.text?.trim().toUpperCase() === correctTarget)
          )
        );

      if (isThisOptionCorrect) {
        badgeClasses = "text-emerald-400 border-emerald-400/60 bg-emerald-500/10";
      } else {
        badgeClasses = "text-[#FF3D57] border-[#FF3D57]/60 bg-[#FF3D57]/10";
      }
    } else {
      badgeClasses = getBadgeColor(displayId);
    }

    return {
      id: displayId,
      badgeClasses,
    };
  };

  const totalQuestions = item.quizData?.questions?.length || 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full max-w-lg mx-auto bg-gradient-to-b from-[#24131c]/90 to-[#0d111c]/95 rounded-2xl overflow-hidden mt-2 mb-2 border border-white/10 shadow-2xl relative"
      >
        {/* Header - Minimized Text */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.04]">
          <h3 className="text-xs font-bold text-white/80 flex items-center gap-1.5">
            <span>{loading ? (Number(item.totalEngaged) || finalVotersCount) : finalVotersCount} engaged</span>
            {item.type === "quiz" && totalQuestions > 1 && (
              <span className="text-[9px] text-[#FF8A00] font-extrabold bg-[#FF8A00]/15 px-1.5 py-0.5 rounded-full border border-[#FF8A00]/30">
                Q{(questionIndex ?? 0) + 1}/{totalQuestions}
              </span>
            )}
          </h3>
        </div>

        {/* Voters List Body - Minimized Text & Clean Spacing */}
        <div
          className="max-h-[220px] overflow-y-auto px-4 pb-2.5 space-y-0"
          onScroll={handleScroll}
        >
          {loading ? (
            <div className="py-4 flex flex-col items-center justify-center gap-1.5 text-white/40 text-[11px] font-medium">
              <div className="w-5 h-5 rounded-full border-2 border-[#FF8A00] border-t-transparent animate-spin" />
              <span>Loading fans...</span>
            </div>
          ) : allVoters.length === 0 ? (
            <div className="py-4 flex flex-col items-center justify-center text-center text-[11px] font-medium text-white/40 space-y-1">
              <Users size={18} className="mx-auto text-white/20 mb-1" />
              <p>No fans opted yet.</p>
            </div>
          ) : (
            <>
              {displayedVoters.map((voter, idx) => {
                const initialLetter = voter.userName ? voter.userName.charAt(0).toUpperCase() : "F";
                const avatarUrl = resolveAvatar(voter);
                const { id: displayId, badgeClasses, isMeme, flameColor } = resolveVoterOption(voter);
                const rawName = voter.userName || "Fan";
                const displayName = rawName.includes("_gmail_com")
                  ? rawName.replace(/_gmail_com/gi, "")
                  : rawName;

                return (
                  <div
                    key={`${voter.userId}-${idx}`}
                    onClick={() => {
                      window.location.href = `/MainModules/Profile?userId=${encodeURIComponent(
                        voter.userId
                      )}`;
                    }}
                    className="py-1.5 border-b border-white/[0.04] flex items-center justify-between gap-3 transition-all cursor-pointer group last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={voter.userName}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-6.5 h-6.5 rounded-full object-cover border border-white/10 shrink-0"
                          onError={(e: any) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        style={{ display: avatarUrl ? "none" : "flex" }}
                        className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 border border-white/10 items-center justify-center text-white font-black text-[10px] shrink-0"
                      >
                        {initialLetter}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-[12px] font-semibold text-white/90 group-hover:text-amber-400 transition-colors break-words break-all whitespace-normal leading-tight">
                          {displayName}
                        </h4>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-center">
                      {isMeme ? (
                        <div className={`w-6 h-6 flex items-center justify-center rounded-md border ${badgeClasses} shadow-sm shrink-0`}>
                          <Flame size={13} className={`${flameColor} shrink-0`} fill="currentColor" />
                        </div>
                      ) : (
                        <div className={`w-5.5 h-5.5 flex items-center justify-center rounded border ${badgeClasses} text-[10px] font-black shrink-0`}>
                          {displayId}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {hasMore && (
                <div className="py-2.5 flex flex-col items-center justify-center gap-1 text-white/40 text-[9px] font-bold">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#FF8A00] border-t-transparent animate-spin" />
                  <span>Loading more...</span>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


// ─── Main FlipArena Component ───────────────────────────────────────────────
export default function FlipArena({
  selectedSport,
  activeTab = "fliparena",
  setActiveTab,
  isPreview = true,
}: FlipArenaProps) {
  const { user } = useAuth();
  const currentUser = resolveCurrentUser(user);
  const activeUserId = currentUser.activeUserId;
  const [engagements, setEngagements] = useState<EngagementItem[]>([]);
  const [loadingEngagements, setLoadingEngagements] = useState(true);
  const [filter, setFilter] = useState<"all" | "quiz" | "poll" | "battle" | "prediction" | "meme">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [engagedModalItem, setEngagedModalItem] = useState<EngagementItem | null>(null);
  const [quizActiveQuestion, setQuizActiveQuestion] = useState<Record<string, { index: number; id: string }>>({});
  const [syncedEngagedCounts, setSyncedEngagedCounts] = useState<Record<string, number>>({});

  const handleSyncEngagedCount = useCallback((itemId: string, count: number) => {
    setSyncedEngagedCounts((prev) => {
      if (prev[itemId] === count) return prev;
      return { ...prev, [itemId]: count };
    });
  }, []);

  const handleQuizQuestionChange = useCallback((itemId: string, index: number, id: string) => {
    setQuizActiveQuestion((prev) => {
      if (prev[itemId]?.index === index && prev[itemId]?.id === id) return prev;
      return {
        ...prev,
        [itemId]: { index, id },
      };
    });
  }, []);

  const handleOpenEngagedModal = (item: EngagementItem) => {
    if (engagedModalItem?.id === item.id) {
      setEngagedModalItem(null); // Toggle off if already open
    } else {
      setEngagedModalItem(item); // Open new
    }
  };

  // 1-second live clock for all countdowns and frequency unlocks
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<EngagementType>("quiz");
  const [editingItem, setEditingItem] = useState<EngagementItem | null>(null);

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const isFetchingEngagementsRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const fetchEngagements = useCallback(async () => {
    if (isFetchingEngagementsRef.current || Date.now() - lastFetchTimeRef.current < 2000) {
      return;
    }
    isFetchingEngagementsRef.current = true;
    lastFetchTimeRef.current = Date.now();
    setLoadingEngagements(true);
    try {
      let liveItems = await engagementService.getEngagements({
        sport: selectedSport && selectedSport !== "mixed" && selectedSport !== "all" ? selectedSport : undefined,
        status: "active",
        userId: activeUserId,
      });

      // Fallback 1: If sport-filtered query returned 0 items, fetch across all sports
      if ((!liveItems || liveItems.length === 0) && selectedSport && selectedSport !== "mixed" && selectedSport !== "all") {
        liveItems = await engagementService.getEngagements({
          status: "active",
          userId: activeUserId,
        });
      }

      // Fallback 2: If status="active" was too restrictive, fetch without status constraint
      if (!liveItems || liveItems.length === 0) {
        liveItems = await engagementService.getEngagements({
          userId: activeUserId,
        });
      }

      if (liveItems && liveItems.length > 0) {
        setEngagements(liveItems);
      } else {
        setEngagements([]);
      }
    } catch (err) {
      console.warn("Could not fetch live engagements:", err);
      setEngagements([]);
    } finally {
      setLoadingEngagements(false);
      isFetchingEngagementsRef.current = false;
    }
  }, [selectedSport, activeUserId]);

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  useEffect(() => {
    const handleGlobalCreated = () => {
      lastFetchTimeRef.current = 0;
      engagementService.invalidateCache();
      fetchEngagements();
    };
    window.addEventListener("arena-engagement-created", handleGlobalCreated);
    return () => window.removeEventListener("arena-engagement-created", handleGlobalCreated);
  }, [fetchEngagements]);

  const handleOpenCreate = (type: EngagementType = "quiz") => {
    setEditingItem(null);
    setModalType(type);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: EngagementItem) => {
    setEditingItem(item);
    setModalType(item.type);
    setModalOpen(true);
  };

  const handleDeleteEngagement = async (item: EngagementItem) => {
    const isMeme = item.type === "meme";
    const label = isMeme ? "meme" : "event";
    if (!confirm(`Are you sure you want to delete this ${label} "${item.title || item.subtitle || "Untitled"}"?`)) {
      return;
    }
    try {
      await engagementService.deleteEngagement(item.id);
      setEngagements((prev) => prev.filter((it) => it.id !== item.id));
      showToast(`${isMeme ? "Meme" : "Event"} deleted successfully! 🗑️`);
      engagementService.invalidateCache();
    } catch (err) {
      console.error("Failed to delete engagement item:", err);
      showToast("Failed to delete item. Please try again.");
    }
  };

  const handleItemSaved = (savedItem: EngagementItem, isEdit: boolean) => {
    setEngagements((prev) => {
      if (isEdit) {
        return prev.map((it) => (it.id === savedItem.id ? savedItem : it));
      }
      return [savedItem, ...prev];
    });

    engagementService.invalidateCache();
    fetchEngagements();

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
      );
      window.dispatchEvent(new CustomEvent("arena-engagement-created", { detail: savedItem }));
    }

    if (!isEdit) {
      showToast(
        savedItem.type === "meme"
          ? `Meme dropped into the Arena! 🔥 +${PARTICIPATION_POINTS} SXPs earned`
          : `Event published! +${PARTICIPATION_POINTS} SXPs earned 🚀`
      );
    } else {
      showToast("Event updated successfully!");
    }
  };

  useEffect(() => {
    fetch("/api/polls")
      .then((res) => res.json())
      .then((json) => {
        setPolls(Array.isArray(json?.data) ? json.data : []);
        setLoadingPolls(false);
      })
      .catch((err) => {
        console.error("Failed to fetch polls in FlipArena:", err);
        setPolls([]);
        setLoadingPolls(false);
      });
  }, []);

  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  // Auto-detect and open shared item from URL (e.g. ?itemId=quiz_123 or ?quizId=... or ?engagementId=... or #quiz_123)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const sharedId =
      urlParams.get("itemId") ||
      urlParams.get("quizId") ||
      urlParams.get("engagementId") ||
      urlParams.get("cardId") ||
      urlParams.get("id") ||
      (window.location.hash ? window.location.hash.replace("#", "").replace(/^engagement-/, "") : null);
    const sharedType = urlParams.get("type");
    const tabParam = urlParams.get("tab");

    if (tabParam === "leaderboard") {
      setShowLeaderboardModal(true);
    }

    if (sharedId) {
      setHighlightedItemId(sharedId);

      // Auto-set matching tab filter if type parameter is provided
      if (sharedType) {
        const typeClean = sharedType.toLowerCase().trim();
        if (typeClean === "quiz") setFilter("quiz");
        else if (typeClean === "poll") setFilter("poll");
        else if (typeClean === "fan_battle" || typeClean === "battle") setFilter("battle");
        else if (typeClean === "prediction") setFilter("prediction");
        else if (typeClean === "meme") setFilter("meme");
        else setFilter("all");
      }

      // If item is not in local engagements list yet, fetch it individually
      engagementService.getEngagementById(sharedId).then((singleItem) => {
        if (singleItem) {
          setEngagements((prev) => {
            if (prev.some((x) => x.id === singleItem.id)) return prev;
            return [singleItem, ...prev];
          });

          // If no type was specified in URL, align filter to the fetched item's type
          if (!sharedType && singleItem.type) {
            const t = singleItem.type.toLowerCase().trim();
            if (t === "quiz") setFilter("quiz");
            else if (t === "poll") setFilter("poll");
            else if (t === "fan_battle") setFilter("battle");
            else if (t === "prediction") setFilter("prediction");
            else if (t === "meme") setFilter("meme");
          }

          showToast(`🎯 Opened shared ${singleItem.type ? singleItem.type.toUpperCase() : "item"}: "${singleItem.title || 'Event'}"`);
        }
      }).catch((err) => {
        console.warn("Could not fetch shared engagement item:", err);
      });
    }
  }, [showToast]);

  // Smoothly scroll and center the spotlighted card once rendered in the DOM
  useEffect(() => {
    if (!highlightedItemId) return;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const targetEl = document.getElementById(`engagement-${highlightedItemId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        clearInterval(interval);
      } else if (attempts > 25) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [highlightedItemId, engagements]);

  const filteredEngagements = useMemo(() => {
    return engagements
      .filter((item) => {
        if (!item || !item.title || !item.type) return false;

        // Always include the highlighted shared item even if filter differs
        if (highlightedItemId && item.id === highlightedItemId) return true;

        const itemType = (item.type || "").toLowerCase().trim();
        if (filter === "all") return true;
        if (filter === "battle") return itemType === "fan_battle";
        if (filter === "quiz") return itemType === "quiz";
        if (filter === "poll") return itemType === "poll";
        if (filter === "prediction") return itemType === "prediction";
        if (filter === "meme") return itemType === "meme";

        return true;
      })
      .sort((a, b) => {
        // Highlighted shared item always sorted to the very top
        if (highlightedItemId) {
          if (a.id === highlightedItemId) return -1;
          if (b.id === highlightedItemId) return 1;
        }

        return getEngagementPostingTime(b) - getEngagementPostingTime(a);
      });
  }, [engagements, filter, highlightedItemId]);

  return (
    <div className="w-full bg-[#070b14] min-h-screen text-white flex flex-col font-sans pb-16 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#161e2e] border border-white/20 text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-lg"
          >
            <Zap size={14} className="text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPreview && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = "/MainModules/HomePage")}
              className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight">FlipARENA 🏟️</h1>
                <span className="text-[9px] font-black bg-gradient-to-r from-pink-500 to-orange-500 text-white px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold text-white/40">🏏 Cricket</span>
                <span className="text-[9px] font-bold text-white/40">⚽ Football</span>
                <span className="text-[9px] font-bold text-white/40">🏃 Athletics</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isPreview && (
        <div className="px-4 mb-4 mt-4">
          <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner">
            <button
              onClick={() => (window.location.href = "/MainModules/FlipLine")}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer border-none"
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <span className="text-sm">⚡</span> FlipLINE
            </button>
            <button
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer border-none"
              style={{
                background: "linear-gradient(90deg, #FF3D57, #FF7B02)",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(255, 61, 87, 0.25)",
              }}
            >
              <span className="text-sm">🏟️</span> FlipARENA
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05] mt-2 gap-2 flex-wrap">
        <div>
          <h2 className="text-base font-black tracking-tight">Today's Arena</h2>
          <p className="text-[10px] text-white/35 mt-0.5">Earn +2 SXPs participation · +10 SXPs for correct answers</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-400 hover:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            title="Open Leaderboards"
          >
            <Trophy size={13} className="text-amber-400" />
            <span>Leaderboard</span>
          </button>
          <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05] overflow-x-auto">
            {(["all", "quiz", "poll", "battle", "prediction", "meme"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0"
                style={{
                  backgroundColor: filter === tab ? "rgba(255,255,255,0.08)" : "transparent",
                  color: filter === tab ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              >
                {tab === "all" ? "All" : tab === "meme" ? "Meme" : tab}
              </button>
            ))}
          </div>


        </div>
      </div>

      <div className="px-4 space-y-5 mt-2 flex flex-col items-center w-full max-w-lg mx-auto">
        {loadingEngagements && engagements.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/40 text-xs font-bold">
            <div className="w-6 h-6 border-2 border-[#FF3D57] border-t-transparent rounded-full animate-spin" />
            <span>Loading live arena battles...</span>
          </div>
        ) : filteredEngagements.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-white/40 border border-white/[0.06] rounded-2xl bg-[#0e111a] p-8 w-full max-w-lg space-y-3">
            <p>No events found for this filter.</p>
            <button
              onClick={() =>
                handleOpenCreate(
                  filter === "all"
                    ? "quiz"
                    : filter === "battle"
                      ? "fan_battle"
                      : filter === "prediction"
                        ? "prediction"
                        : filter === "meme"
                          ? "meme"
                          : filter
                )
              }
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-pink-500/20 cursor-pointer"
            >
              <Plus size={13} /> Create First {filter === "all" ? "Event" : filter.toUpperCase()} (+2 SXPs)
            </button>
          </div>
        ) : (
          <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
            <AnimatePresence mode="popLayout">
              {filteredEngagements.map((item) => {
                const isItemHighlighted = highlightedItemId === item.id;
                
                // Determine the correct Card Component
                let CardComponent = null;
                if (item.type === "fan_battle") CardComponent = DynamicFanBattleCard;
                else if (item.type === "quiz") CardComponent = DynamicQuizCard;
                else if (item.type === "poll") CardComponent = DynamicPollCard;
                else if (item.type === "prediction") CardComponent = DynamicPredictionCard;
                else if (item.type === "meme") CardComponent = DynamicMemeCard;

                if (!CardComponent) return null;

                return (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="w-full max-w-lg mx-auto flex flex-col items-center"
                  >
                    <CardComponent
                      item={item}
                      userId={activeUserId}
                      userName={currentUser.userName}
                      userAvatar={currentUser.userAvatar}
                      userEmail={currentUser.userEmail}
                      now={now}
                      onToast={showToast}
                      onEdit={handleOpenEdit}
                      onDelete={item.type === "meme" ? handleDeleteEngagement : undefined}
                      isHighlighted={isItemHighlighted}
                      onOpenEngagedModal={handleOpenEngagedModal}
                      isEngagedExpanded={engagedModalItem?.id === item.id}
                      totalEngagedOverride={syncedEngagedCounts[item.id]}
                      onQuestionChange={item.type === "quiz" ? (index: number, qId: string) => handleQuizQuestionChange(item.id, index, qId) : undefined}
                      onOpenLeaderboard={() => setShowLeaderboardModal(true)}
                    />
                    
                    {/* Inline Engaged Users List */}
                    {engagedModalItem?.id === item.id && (
                      <EngagedUsersInlineList
                        item={engagedModalItem}
                        questionId={quizActiveQuestion[item.id]?.id}
                        questionIndex={quizActiveQuestion[item.id]?.index}
                        onSyncCount={(count) => handleSyncEngagedCount(item.id, count)}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {isPreview && (
          <div className="w-full max-w-lg mt-4 px-2">
            <button
              onClick={() => (window.location.href = "/MainModules/FlipArena")}
              className="w-full py-[11px] rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                View Full FlipARENA
              </span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <LeaderboardOverlayModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
      />

      <ArenaEngagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={modalType}
        editingItem={editingItem}
        onSaved={handleItemSaved}
        onToast={showToast}
      />

      {/* Engaged Users Modal was here, now moved inline below each card */}

    </div>
  );
}
