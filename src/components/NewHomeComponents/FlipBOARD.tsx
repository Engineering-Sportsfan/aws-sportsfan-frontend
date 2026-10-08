"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Flame,
  Zap,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Share2,
  Heart,
  Bookmark,
  Bell,
  ArrowRight,
  ChevronRight,
  X,
  Sparkles,
  Radio,
  ExternalLink,
  Send,
  Loader2,
  Bot,
  Users,
  MessageSquare,
  HelpCircle,
  Plus,
  Award,
  Swords,
  TrendingUp,
  Volume2,
} from "lucide-react";
import {
  welcomeMessageService,
  RadarCardItem,
  AgendaEventItem,
  MorningBriefStory,
  WelcomeConfig,
  resolveDynamicAgendaEvents,
  cleanAiResponse,
  formatEventDisplayDateTime,
  getIndiaDateString,
  isTodayInIndia,
} from "@/services/welcomeMessage.service";
import ArenaEngagementModal from "./ArenaEngagementModal";
import CreatePostDialog from "../CreatePost-Component/CreatePostDialog";
import axios from "axios";
import type { EngagementType, EngagementItem } from "@/types/engagements";
import { useAuth } from "@/context/AuthContext";
import { engagementService } from "@/services/engagement.service";

export type { RadarCardItem, AgendaEventItem, MorningBriefStory, WelcomeConfig };

/**
 * Cleanly renders formatted text, bold highlights, and bullet points from AI answers
 */
function formatAiAnswerText(text: string | null) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-[12.5px] leading-relaxed">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1" />;
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*");
        const cleanLine = isBullet ? trimmed.replace(/^[•\-*]\s*/, "") : trimmed;
        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

        return (
          <div key={lIdx} className={`flex ${isBullet ? "items-start gap-1.5 pl-1" : "items-baseline"}`}>
            {isBullet && <span className="text-[#EC4899] font-bold select-none shrink-0">•</span>}
            <p className="leading-snug">
              {parts.map((part, pIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={pIdx} className="font-extrabold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
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
  } catch {}
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
  } catch {}
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

function resolveCurrentUser(user: any) {
  let cached: any = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) cached = JSON.parse(stored);
    } catch {}
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
    "";

  const userEmail = user?.email || cached?.email || "";
  const userName =
    user?.name ||
    user?.displayName ||
    (user as any)?.userName ||
    cached?.name ||
    cached?.displayName ||
    (userEmail ? userEmail.split("@")[0] : "SportsFan");
  const rawAvatar =
    user?.photoURL ||
    user?.avatarUrl ||
    (user as any)?.avatar ||
    cached?.photoURL ||
    cached?.avatarUrl ||
    cached?.avatar ||
    "";
  const userAvatar = typeof rawAvatar === "string" && !rawAvatar.includes("dicebear") ? rawAvatar : "";

  return { activeUserId, userEmail, userName, userAvatar };
}

// ─── Dynamic Points Hook (Synced with Admin Gamification Rules) ─────────────
let cachedPointRules = {
  battle: 2,
  poll: 2,
  quiz: 2,
  prediction: 2,
  meme: 2,
  quizBonus: 10,
  pollBonus: 10,
  predictionBonus: 10,
  create: 2,
};
function useDynamicArenaPoints() {
  const [points, setPoints] = useState(cachedPointRules);
  useEffect(() => {
    axios
      .get("/api/admin/gamification/rules")
      .then((res) => {
        const raw = res.data;
        const rules = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.rules)
            ? raw.rules
            : Array.isArray(raw?.data)
              ? raw.data
              : Array.isArray(raw?.items)
                ? raw.items
                : [];
        if (Array.isArray(rules) && rules.length > 0) {
          const findPts = (ids: string[], fallback: number) => {
            for (const id of ids) {
              const r = rules.find((item: any) =>
                String(item.id || item.actionId || "").toUpperCase() === id.toUpperCase()
              );
              if (r) {
                const rawVal = r.points !== undefined ? r.points : (r.value !== undefined ? r.value : r.amount);
                const parsed = Number(rawVal);
                if (!isNaN(parsed) && parsed > 0) return parsed;
              }
            }
            return fallback;
          };
          const updated = {
            battle: findPts(["ENGAGEMENT_PARTICIPATE_FAN_BATTLE", "ENGAGEMENT_PARTICIPATE_BATTLE"], 2),
            poll: findPts(["ENGAGEMENT_PARTICIPATE_POLL"], 2),
            quiz: findPts(["ENGAGEMENT_PARTICIPATE_QUIZ"], 2),
            prediction: findPts(["ENGAGEMENT_PARTICIPATE_PREDICTION"], 2),
            meme: findPts(["ENGAGEMENT_PARTICIPATE_MEME"], 2),
            quizBonus: findPts(["ENGAGEMENT_ACCURACY_BONUS_QUIZ"], 10),
            pollBonus: findPts(["ENGAGEMENT_ACCURACY_BONUS_POLL", "ENGAGEMENT_WINNING_POLL_BONUS"], 10),
            predictionBonus: findPts(["ENGAGEMENT_ACCURACY_BONUS_PREDICTION", "PREDICTION_ACCURATE"], 10),
            create: findPts(["ENGAGEMENT_CREATE_EVENT", "ENGAGEMENT_CREATE_QUIZ", "ENGAGEMENT_CREATE_POLL"], 2),
          };
          cachedPointRules = updated;
          setPoints(updated);
        }
      })
      .catch(() => {});
  }, []);
  return points;
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

function getEngagementShareUrl(item: EngagementItem): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const itemType = item.type || "quiz";
  const targetId = (item as any)._parentEngagementId || item.id;
  return `${origin}/MainModules/FlipArena?itemId=${encodeURIComponent(targetId)}&type=${encodeURIComponent(itemType)}`;
}

// ─── FlipArena DynamicPollCard Component ─────────────────────────────────────
function DynamicPollCard({
  item,
  userId,
  userName,
  userAvatar,
  userEmail,
  now,
  onToast,
  isHighlighted = false,
  onOpenEngagedModal,
  isEngagedExpanded = false,
  totalEngagedOverride,
  onSyncEngagedCount,
}: {
  item: EngagementItem;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
  now: number;
  onToast: (msg: string) => void;
  isHighlighted?: boolean;
  onOpenEngagedModal?: (item: EngagementItem) => void;
  isEngagedExpanded?: boolean;
  totalEngagedOverride?: number;
  onSyncEngagedCount?: (count: number) => void;
}) {
  const points = useDynamicArenaPoints();
  const pollPts = points.poll;
  const pollBonusPts = points.pollBonus;
  const initialVote = getStoredVote("poll", item.id, userId);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialVote?.selectedId || item.userVote || null
  );
  const [voted, setVoted] = useState<boolean>(Boolean(initialVote || item.userVoted));
  const [loading, setLoading] = useState(false);
  const isVotingRef = useRef(false);

  const bonusClaimKey = `sf_poll_bonus_claimed_${item.id}_${userId || "anon"}`;
  const [bonusAwarded, setBonusAwarded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(bonusClaimKey) === "true";
  });
  const [serverIsCorrect, setServerIsCorrect] = useState<boolean | null>(null);

  const [options, setOptions] = useState<Array<{ id: string; text: string; votes: number }>>(
    item.pollData?.options || []
  );
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [hasShared, setHasShared] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(`sf_shared_${item.id}_${userId || "anon"}`));
  });

  const hasUserParticipated = Boolean(voted || selectedId !== null || item.userVoted || initialVote);
  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined
      ? totalEngagedOverride
      : hasUserParticipated
      ? Math.max(1, Number(item.totalEngaged) || 0)
      : Number(item.totalEngaged) || 0;
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
  const expiresAt = item.pollData?.expiresAt || startTime + durationMins * 60 * 1000;
  const isExpired = now >= expiresAt;
  const timeRemainingMs = Math.max(0, expiresAt - now);

  const totalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0) || 1;
  const correctAnswer = item.pollData?.correctAnswer || item.pollData?.answer || "";

  const checkIsOptionWinner = useCallback(
    (opt: any) => {
      if (!correctAnswer || !opt) return false;
      const ca = correctAnswer.trim().toLowerCase();
      const optId = String(opt.id || "").trim().toLowerCase();
      const optText = String(opt.text || "").trim().toLowerCase();
      return ca === optId || ca === optText;
    },
    [correctAnswer]
  );

  const userWon = useMemo(() => {
    if (!voted || !selectedId || !correctAnswer) return false;
    const selectedOpt = options.find((o) => o.id === selectedId || o.text === selectedId);
    return checkIsOptionWinner(selectedOpt);
  }, [voted, selectedId, correctAnswer, options, checkIsOptionWinner]);

  useEffect(() => {
    if (isExpired && (userWon || serverIsCorrect) && !bonusAwarded && userId) {
      setBonusAwarded(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(bonusClaimKey, "true");
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", {
            detail: { points: pollBonusPts },
          })
        );
      }
      onToast(`🏆 Poll Ended! You won +${pollBonusPts} SXPs bonus for picking the correct answer!`);
    }
  }, [isExpired, userWon, serverIsCorrect, bonusAwarded, bonusClaimKey, onToast, userId, pollBonusPts]);

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
      if (stored.options) setOptions(stored.options);
    }

    if (item.userVoted && item.userVote) {
      setSelectedId(item.userVote);
      setVoted(true);
      setStoredVote("poll", item.id, { selectedId: item.userVote }, userId);
    } else if (userId) {
      engagementService.checkVoteStatus(item.id, userId).then((res) => {
        if (res.hasVoted && res.selectedOptionId) {
          setSelectedId(res.selectedOptionId);
          setVoted(true);
          setStoredVote("poll", item.id, { selectedId: res.selectedOptionId }, userId);
        }
      });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId]);

  useEffect(() => {
    if (item.pollData?.options && item.pollData.options.length > 0) {
      setOptions(item.pollData.options);
    }
  }, [item.pollData?.options]);

  const handleVote = async (optId: string) => {
    if (!userId || String(userId).toLowerCase().startsWith("anon")) {
      onToast("Please sign in to participate and earn SXPs!");
      return;
    }
    if (isScheduled) {
      onToast(`This poll opens in ${formatCountdown(timeToStartMs)}!`);
      return;
    }
    if (isExpired) {
      onToast("This poll has ended!");
      return;
    }
    if (voted || loading || isVotingRef.current || getStoredVote("poll", item.id, userId)) {
      onToast("You have already voted in this poll!");
      return;
    }

    isVotingRef.current = true;
    setSelectedId(optId);
    setVoted(true);
    setLoading(true);
    const nextCount = Math.max(1, totalEngaged + 1);
    setTotalEngaged(nextCount);
    onSyncEngagedCount?.(nextCount);

    const nextOptions = options.map((opt) =>
      opt.id === optId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
    );
    setOptions(nextOptions);
    setStoredVote("poll", item.id, { selectedId: optId, options: nextOptions }, userId);

    try {
      const res: any = await engagementService.voteEngagement(
        item.id,
        optId,
        userId,
        undefined,
        { userName, userAvatar, userEmail }
      );
      if (res?.options && Array.isArray(res.options)) {
        setOptions(res.options);
        setStoredVote("poll", item.id, { selectedId: optId, options: res.options }, userId);
      }
      if (res?.isCorrect !== undefined) {
        setServerIsCorrect(Boolean(res.isCorrect));
      }
      const earned = Number(res?.pointsAwarded ?? res?.participationPointsAwarded ?? pollPts);
      if (typeof window !== "undefined" && earned > 0) {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: earned } })
        );
      }
    } catch (err: any) {
      const prevOption = err?.response?.data?.selectedOptionId || optId;
      setSelectedId(prevOption);
      const reverted = options.map((opt) =>
        opt.id === prevOption ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
      );
      setOptions(reverted);
      setStoredVote("poll", item.id, { selectedId: prevOption, options: reverted }, userId);
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
      const res = await engagementService.toggleLikeEngagement(item.id, userId, {
        userName,
        userAvatar,
        userEmail,
      });
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch {}
  };

  const handleShare = async () => {
    const targetId = (item as any)._parentEngagementId || item.id;
    if (!hasShared) {
      setHasShared(true);
      setSharesCount((prev) => prev + 1);
      if (typeof window !== "undefined") {
        localStorage.setItem(`sf_shared_${targetId}_${userId || "anon"}`, "true");
      }
      engagementService
        .shareEngagement(targetId)
        .then((res: any) => {
          if (res?.sharesCount !== undefined) {
            setSharesCount(Number(res.sharesCount));
          }
        })
        .catch(() => {});
    }

    const shareUrl = getEngagementShareUrl(item);
    const text = `📊 Poll: "${item.title}" — Cast your vote on SportsFan360:`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => {});
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
      className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-emerald-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${
        isHighlighted
          ? "ring-2 ring-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)] scale-[1.01]"
          : ""
      }`}
    >
      {isHighlighted && (
        <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-emerald-400 animate-pulse" />
            <span>SHARED POLL</span>
          </span>
          <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
        </div>
      )}
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400">📊 LIVE POLL</span>
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

      {(() => {
        const pollTitle = item.title?.trim() || "";
        const pollQuestion = (item.pollData?.question || (item as any).question || "").trim();
        const showBoth = pollTitle && pollQuestion && pollTitle.toLowerCase() !== pollQuestion.toLowerCase();

        return showBoth ? (
          <div className="mb-3.5 space-y-1">
            <h4 className="text-[13px] font-extrabold text-white leading-snug">{pollTitle}</h4>
            <p className="text-xs font-semibold text-white/80 leading-relaxed">{pollQuestion}</p>
          </div>
        ) : (
          <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">
            {pollQuestion || pollTitle}
          </p>
        );
      })()}

      {isScheduled ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center my-2 space-y-1">
          <Clock size={20} className="mx-auto text-emerald-400 animate-pulse" />
          <h4 className="text-xs font-black text-white">Poll Scheduled</h4>
          <p className="text-[11px] text-white/60">
            Voting opens in <strong className="text-amber-400 font-mono">{formatCountdown(timeToStartMs)}</strong>
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {options.map((opt) => {
            const pct = Math.round(((opt.votes || 0) / totalVotes) * 100);
            const isSelected = selectedId === opt.id || selectedId === opt.text;
            const isWinner = checkIsOptionWinner(opt);

            let borderStyle = "border-white/[0.06] bg-white/[0.02]";
            if (isExpired && isWinner) {
              borderStyle = "border-emerald-500/70 bg-emerald-500/15";
            } else if (isSelected) {
              borderStyle = "border-emerald-500 bg-emerald-500/10";
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={voted || isExpired || loading}
                className={`w-full rounded-xl p-3 border text-left transition-all cursor-pointer relative overflow-hidden group ${borderStyle} ${
                  voted || isExpired ? "cursor-default" : "hover:bg-white/[0.04] active:scale-[0.99]"
                }`}
              >
                {(voted || isExpired) && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 ${
                      isExpired && isWinner
                        ? "bg-emerald-500/25"
                        : isSelected
                        ? "bg-emerald-500/20"
                        : "bg-white/[0.04]"
                    }`}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isExpired && isWinner
                          ? "text-emerald-300 font-black"
                          : isSelected
                          ? "text-emerald-400 font-black"
                          : "text-white/80"
                      }`}
                    >
                      {opt.text}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check size={11} /> You voted
                      </span>
                    )}
                    {isExpired && isWinner && (
                      <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                        ✓ Correct Option
                      </span>
                    )}
                  </div>
                  {(voted || isExpired) && (
                    <span className="text-xs font-black font-mono text-white/50">{pct}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {voted && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
          {isExpired ? (
            userWon || bonusAwarded || serverIsCorrect ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-xs font-black text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <span className="flex items-center gap-1.5">
                  <span>🎉</span>
                  <span>
                    Correct Option! You earned +{pollBonusPts} SXPs Bonus (+{pollPts + pollBonusPts} SXPs Total)
                  </span>
                </span>
                <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                  +{pollBonusPts} SXPs
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
                <span>
                  Poll ended {correctAnswer ? `· Winner: ` : ""}
                  {correctAnswer && <strong className="text-emerald-400">{correctAnswer}</strong>}
                </span>
                <span className="text-[10px] text-white/40 shrink-0">
                  +{pollPts} SXPs participation
                </span>
              </div>
            )
          ) : (
            <div className="text-[11px] font-black text-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-center gap-1.5">
              <span>🔒</span>
              <span>Vote submitted · +{pollPts} SXPs earned!</span>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${
              liked ? "text-[#FF3D57]" : "hover:text-white"
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
          <span className="group-hover:underline">
            {Math.max(
              hasUserParticipated ? 1 : 0,
              totalEngagedOverride !== undefined ? totalEngagedOverride : totalEngaged
            ).toLocaleString()} engaged
          </span>
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


// ─── Rich Default Data for Fallbacks ─────────────────────────────────────────
const DEFAULT_BRIEF_STORIES: MorningBriefStory[] =[];

const DEFAULT_AGENDA_EVENTS: AgendaEventItem[] = [];

const LEADERBOARD_FRIENDS = [
  { rank: 1, name: "Daksh", role: "Oracle", streak: 14, sxp: 820, avatar: "/images/daksh.png", icon: "🥇" },
  { rank: 2, name: "Chandu", role: "Analyst", streak: 9, sxp: 610, avatar: "/images/chandu.png", icon: "🥈" },
  { rank: 3, name: "You", role: "Scout", streak: 7, sxp: 365, avatar: "/images/dollyavatar.png", isCurrent: true, icon: "🥉" },
  { rank: 4, name: "Tushar", role: "Rookie", streak: 3, sxp: 290, avatar: "/images/tushar.png" },
  { rank: 5, name: "Raghav", role: "Rookie", streak: 1, sxp: 175, avatar: "/images/raghav.png" },
];

const INVITE_FRIENDS_LIST = [
  { name: "Daksh", avatar: "👨‍🎤" },
  { name: "Chandu", avatar: "🧑‍💻" },
  { name: "Tushar", avatar: "🧔" },
  { name: "Raghav", avatar: "👳" },
  { name: "Ayush", avatar: "👱" },
];

interface FlipBoardProps {
  userName?: string;
  actionSubtitle?: string;
  onCardClick?: (card: RadarCardItem) => void;
  onSeeAllClick?: () => void;
  onReadBriefClick?: () => void;
}

export default function FlipBOARD({
  userName: propUserName,
  actionSubtitle: propActionSubtitle,
  onCardClick,
  onSeeAllClick,
  onReadBriefClick,
}: FlipBoardProps) {
  const router = useRouter();

  // ─── Dynamic State from DynamoDB (homeDatabase) ─────────────────────────
  const [radarCards, setRadarCards] = useState<RadarCardItem[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEventItem[]>([]);
  const [briefStories, setBriefStories] = useState<MorningBriefStory[]>([]);
  const [welcomeConfig, setWelcomeConfig] = useState<WelcomeConfig | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);

  // Widget State
  const [activeTab, setActiveTab] = useState<"brief" | "schedule">("brief");
  const [isCheckInDone, setIsCheckInDone] = useState(false);
  const [userStreak, setUserStreak] = useState(6);
  const [userSxp, setUserSxp] = useState(340);
  const [userExp, setUserExp] = useState(240);
  const [maxExp] = useState(500);

  // Modal State
  const [isFullBoardOpen, setIsFullBoardOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<"brief" | "schedule" | "board">("brief");
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "live" | "upcoming" | "finished">("all");
  const [showAllBriefStories, setShowAllBriefStories] = useState(false);
  const [showAllAgendaEvents, setShowAllAgendaEvents] = useState(false);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sf_notified_event_ids");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCardDetail, setSelectedCardDetail] = useState<RadarCardItem | AgendaEventItem | null>(null);

  // Arena Engagement Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialType, setCreateInitialType] = useState<EngagementType>("poll");

  const { user } = useAuth();
  const currentUser = resolveCurrentUser(user);
  const activeUserId = currentUser.activeUserId;

  // Poll State (from FlipArena - Latest Poll only)
  const [latestPoll, setLatestPoll] = useState<EngagementItem | null>(null);
  const [loadingLatestPoll, setLoadingLatestPoll] = useState(true);

  // Points update listener to sync FlipBOARD SXP/EXP
  useEffect(() => {
    const handlePointsUpdate = (e: any) => {
      const pts = Number(e?.detail?.points) || 0;
      if (pts > 0) {
        setUserSxp((prev) => prev + pts);
        setUserExp((prev) => Math.min(maxExp, prev + pts));
      }
    };
    window.addEventListener("sf360:points-updated", handlePointsUpdate);
    return () => {
      window.removeEventListener("sf360:points-updated", handlePointsUpdate);
    };
  }, [maxExp]);

  // Ask Flip AI state
  const [briefQuestion, setBriefQuestion] = useState("");
  const [briefAnswer, setBriefAnswer] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const [scheduleQuestion, setScheduleQuestion] = useState("");
  const [scheduleAnswer, setScheduleAnswer] = useState<string | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Quick Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Open Arena Engagement Creation Modal
  const handleOpenCreate = (type: EngagementType = "poll", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCreateInitialType(type);
    setIsCreateModalOpen(true);
  };

  // FlipLine Create Post Dialog Modal State & Submission Handler
  const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false);

  const handleCreateFlipLinePost = async (
    formData: FormData,
    userId: string,
    userName: string,
    userEmail?: string
  ) => {
    const res = await axios.post("/api/flipline", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (typeof res.data === "string" && res.data.includes("<html")) {
      throw new Error("Server returned an invalid HTML response. Please check backend connection.");
    }
    if (res.data && res.data.success === false) {
      throw new Error(res.data.error || "Failed to create post. Please try again.");
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("flipline-post-created"));
    }
    showToast("🎉 Your FlipLine post was published!");
    return res.data;
  };

  // Lock body scroll when popup modal is open
  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    if (isFullBoardOpen || isCreateModalOpen || !!selectedCardDetail) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mounted, isFullBoardOpen, isCreateModalOpen, selectedCardDetail]);

  // ─── Fetch Dynamic Data from backend DynamoDB (homeDatabase) ───────────
  const loadDynamicHomeData = useCallback(async () => {
    try {
      const data = await welcomeMessageService.getWelcomeData();
      if (data) {
        if (Array.isArray(data.radarCards) && data.radarCards.length > 0) {
          setRadarCards(data.radarCards);
        }
        if (Array.isArray(data.todaysAgenda) && data.todaysAgenda.length > 0) {
          setAgendaEvents(data.todaysAgenda);
        } else {
          setAgendaEvents(DEFAULT_AGENDA_EVENTS);
        }
        if (Array.isArray(data.morningBrief) && data.morningBrief.length > 0) {
          setBriefStories(data.morningBrief);
        } else {
          setBriefStories(DEFAULT_BRIEF_STORIES);
        }
        if (data.config) {
          setWelcomeConfig(data.config);
        }
      } else {
        setAgendaEvents(DEFAULT_AGENDA_EVENTS);
        setBriefStories(DEFAULT_BRIEF_STORIES);
      }
    } catch (err) {
      console.warn("[FlipBOARD] Backend fetch error, using defaults:", err);
      setAgendaEvents(DEFAULT_AGENDA_EVENTS);
      setBriefStories(DEFAULT_BRIEF_STORIES);
    } finally {
      setIsLoadingBackend(false);
    }
  }, []);

  // ─── Fetch Latest Poll from FlipArena (engagementService) ───────────
  const fetchLatestPoll = useCallback(async () => {
    try {
      setLoadingLatestPoll(true);
      let items = await engagementService.getEngagements({
        type: "poll",
        status: "active",
        userId: activeUserId,
      });

      if (!items || items.length === 0) {
        items = await engagementService.getEngagements({
          type: "poll",
          userId: activeUserId,
        });
      }

      if (!items || items.length === 0) {
        const allItems = await engagementService.getEngagements({
          userId: activeUserId,
        });
        items = (allItems || []).filter((it) => it.type === "poll");
      }

      if (items && items.length > 0) {
        // Sort descending by posting time / creation time to get the single latest poll
        const sorted = [...items].sort(
          (a, b) => getEngagementPostingTime(b) - getEngagementPostingTime(a)
        );
        setLatestPoll(sorted[0]);
      } else {
        setLatestPoll(null);
      }
    } catch (err) {
      console.warn("[FlipBOARD] Error fetching latest poll from FlipArena:", err);
      setLatestPoll(null);
    } finally {
      setLoadingLatestPoll(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadDynamicHomeData();
    fetchLatestPoll();

    // Re-sync when window receives focus or an engagement is created so changes are immediately visible
    const handleFocus = () => {
      loadDynamicHomeData();
      fetchLatestPoll();
    };
    const handleCreated = () => {
      fetchLatestPoll();
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("arena-engagement-created", handleCreated);

    // Periodic 30s auto-refresh in background
    const interval = setInterval(() => {
      loadDynamicHomeData();
      fetchLatestPoll();
    }, 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("arena-engagement-created", handleCreated);
      clearInterval(interval);
    };
  }, [loadDynamicHomeData, fetchLatestPoll]);

  // Live 15-second clock ticker to automatically transition event statuses in real time
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically calculate event statuses based on current clock time
  const dynamicAgendaEvents = useMemo(() => {
    const eventsToUse = agendaEvents.length > 0 ? agendaEvents : DEFAULT_AGENDA_EVENTS;
    return resolveDynamicAgendaEvents(eventsToUse, currentTime);
  }, [agendaEvents, currentTime]);

  const effectiveBriefStories = useMemo(() => {
    return briefStories.length > 0 ? briefStories : DEFAULT_BRIEF_STORIES;
  }, [briefStories]);

  // Filtered Schedule Events for Modal
  const filteredScheduleEvents = useMemo(() => {
    if (scheduleFilter === "all") return dynamicAgendaEvents;

    if (scheduleFilter === "live") {
      return dynamicAgendaEvents.filter((e) => {
        const rawStatus = (e.statusType || "").toLowerCase();
        const rawLabel = (e.statusLabel || "").toLowerCase();
        return rawStatus === "live" || rawLabel === "live";
      });
    }

    if (scheduleFilter === "upcoming") {
      // UP NEXT and SCHEDULED events go in UPCOMING
      return dynamicAgendaEvents.filter((e) => {
        const rawStatus = (e.statusType || "").toLowerCase();
        const rawLabel = (e.statusLabel || "").toLowerCase();
        const isLive = rawStatus === "live" || rawLabel === "live";
        const isFinished =
          rawStatus === "completed" ||
          rawLabel === "completed" ||
          rawLabel === "finished";

        if (isLive || isFinished) return false;

        return (
          rawStatus === "up_next" ||
          rawStatus === "scheduled" ||
          rawStatus === "auto" ||
          rawLabel === "up next" ||
          rawLabel === "upcoming" ||
          rawLabel === "scheduled" ||
          true
        );
      });
    }

    if (scheduleFilter === "finished") {
      // COMPLETED events go in FINISHED
      return dynamicAgendaEvents.filter((e) => {
        const rawStatus = (e.statusType || "").toLowerCase();
        const rawLabel = (e.statusLabel || "").toLowerCase();
        return (
          rawStatus === "completed" ||
          rawLabel === "completed" ||
          rawLabel === "finished" ||
          (rawStatus !== "live" && rawStatus !== "up_next" && (rawLabel === "final" || (Boolean(e.subEvent) && e.subEvent.toLowerCase().includes("final") && rawStatus === "completed")))
        );
      });
    }

    return dynamicAgendaEvents;
  }, [dynamicAgendaEvents, scheduleFilter]);

  // Handle Daily Check-in
  const handleDailyCheckIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isCheckInDone) return;
    setIsCheckInDone(true);
    setUserStreak((prev) => prev + 1);
    setUserSxp((prev) => prev + 25);
    setUserExp((prev) => Math.min(maxExp, prev + 25));
    showToast("🎉 +25 SXP earned! Daily streak is now alive! 🔥");
  };

  // Toggle Event Reminder & Schedule Notification for this user
  const toggleReminder = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const targetEvent = dynamicAgendaEvents.find((evt) => evt.id === id);
    const eventTitle = targetEvent ? `${targetEvent.sport} - ${targetEvent.subEvent}` : "Match";

    setNotifiedEvents((prev) => {
      const exists = prev.includes(id);
      let updated: string[];

      if (exists) {
        updated = prev.filter((item) => item !== id);
        showToast(`🔔 Reminder removed for ${eventTitle}`);
        try {
          const remId = `ntf_rem_${id}`;
          const userStorageKey = `sf_reminder_notifications_${activeUserId || currentUser.userEmail || "anon"}`;
          const existing = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
          const filtered = existing.filter((n: any) => n.id !== remId && n.eventId !== id && !String(n.id || "").startsWith(remId));
          localStorage.setItem(userStorageKey, JSON.stringify(filtered));

          const allStorageKey = "sf_reminder_notifications";
          const allExisting = JSON.parse(localStorage.getItem(allStorageKey) || "[]");
          const filteredAll = allExisting.filter((n: any) => n.id !== remId && n.eventId !== id && !String(n.id || "").startsWith(remId));
          localStorage.setItem(allStorageKey, JSON.stringify(filteredAll));
        } catch {}
      } else {
        updated = [...prev, id];
        showToast(`🔔 Reminder set for ${eventTitle}! We'll notify you when it goes LIVE.`);

        // Schedule / Create Notification for this user with deterministic notifId
        const notifId = `ntf_rem_${id}`;
        const newNotif = {
          id: notifId,
          notification_id: notifId,
          title: `🔔 Reminder: ${targetEvent?.sport || "Match"} - ${targetEvent?.subEvent || "Scheduled Event"}`,
          body: `Reminder set! ${targetEvent?.sport || "Event"} (${targetEvent?.subEvent || ""}) scheduled for ${targetEvent?.time || "Today"}${targetEvent?.venue ? ` at ${targetEvent.venue}` : ""}.`,
          message: `Reminder set! ${targetEvent?.sport || "Event"} (${targetEvent?.subEvent || ""}) scheduled for ${targetEvent?.time || "Today"}${targetEvent?.venue ? ` at ${targetEvent.venue}` : ""}.`,
          notification_type: "schedule_reminder",
          category: "schedule",
          priority: "NORMAL",
          isRead: false,
          read: false,
          sent_at: new Date().toISOString(),
          createdAt: Date.now(),
          recipientEmail: currentUser.userEmail || undefined,
          userId: activeUserId || undefined,
          eventId: id,
        };

        // 1. Save to local storage for instant offline & page reflection (strictly deduped)
        try {
          const userStorageKey = `sf_reminder_notifications_${activeUserId || currentUser.userEmail || "anon"}`;
          const existing = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
          const filtered = existing.filter((n: any) => n.id !== notifId && n.eventId !== id && !String(n.id || "").startsWith(notifId));
          filtered.unshift(newNotif);
          localStorage.setItem(userStorageKey, JSON.stringify(filtered.slice(0, 50)));

          const allStorageKey = "sf_reminder_notifications";
          const allExisting = JSON.parse(localStorage.getItem(allStorageKey) || "[]");
          const filteredAll = allExisting.filter((n: any) => n.id !== notifId && n.eventId !== id && !String(n.id || "").startsWith(notifId));
          filteredAll.unshift(newNotif);
          localStorage.setItem(allStorageKey, JSON.stringify(filteredAll.slice(0, 50)));
        } catch {}

        // 2. Post to backend /api/notifications
        try {
          fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newNotif),
          }).catch(() => {});
        } catch {}

        // 3. Dispatch real-time toast event
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("sf360:new-notification", {
              detail: {
                id: notifId,
                title: newNotif.title,
                body: newNotif.body,
              },
            })
          );
        }
      }

      // Persist notified events list
      try {
        localStorage.setItem("sf_notified_event_ids", JSON.stringify(updated));
        if (activeUserId) {
          localStorage.setItem(`sf_notified_event_ids_${activeUserId}`, JSON.stringify(updated));
        }
      } catch {}

      return updated;
    });
  };

  // Watch for reminded events becoming LIVE and trigger Live Notifications
  useEffect(() => {
    if (!dynamicAgendaEvents || dynamicAgendaEvents.length === 0) return;

    dynamicAgendaEvents.forEach((evt) => {
      if (notifiedEvents.includes(evt.id)) {
        const isLive = evt.statusType === "live" || evt.statusLabel?.toLowerCase() === "live";
        if (isLive) {
          const liveNotifiedKey = `sf_live_notified_${evt.id}_${activeUserId || "anon"}`;
          const alreadyNotified = typeof window !== "undefined" ? localStorage.getItem(liveNotifiedKey) : null;

          if (!alreadyNotified) {
            if (typeof window !== "undefined") {
              localStorage.setItem(liveNotifiedKey, "true");
            }

            const liveNotifId = `ntf_live_${evt.id}_${Date.now()}`;
            const liveNotif = {
              id: liveNotifId,
              notification_id: liveNotifId,
              title: `🔴 LIVE NOW: ${evt.sport} - ${evt.subEvent}`,
              body: `${evt.sport} (${evt.subEvent}) is now LIVE! Jump in to watch live scores & join the fan banter!`,
              message: `${evt.sport} (${evt.subEvent}) is now LIVE! Jump in to watch live scores & join the fan banter!`,
              notification_type: "live_match",
              category: "schedule",
              priority: "HIGH",
              isRead: false,
              read: false,
              sent_at: new Date().toISOString(),
              createdAt: Date.now(),
              cta_label: "Watch Live 🔴",
              cta_target: "/MainModules/FlipLine",
              recipientEmail: currentUser.userEmail || undefined,
              userId: activeUserId || undefined,
              eventId: evt.id,
            };

            // Save to localStorage
            try {
              const userStorageKey = `sf_reminder_notifications_${activeUserId || currentUser.userEmail || "anon"}`;
              const existing = JSON.parse(localStorage.getItem(userStorageKey) || "[]");
              existing.unshift(liveNotif);
              localStorage.setItem(userStorageKey, JSON.stringify(existing.slice(0, 50)));

              const allStorageKey = "sf_reminder_notifications";
              const allExisting = JSON.parse(localStorage.getItem(allStorageKey) || "[]");
              allExisting.unshift(liveNotif);
              localStorage.setItem(allStorageKey, JSON.stringify(allExisting.slice(0, 50)));
            } catch {}

            // Post to backend
            try {
              fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(liveNotif),
              }).catch(() => {});
            } catch {}

            // Dispatch popup toast event
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("sf360:new-notification", {
                  detail: {
                    id: liveNotifId,
                    title: liveNotif.title,
                    body: liveNotif.body,
                    ctaTarget: "/MainModules/Notifications",
                  },
                })
              );
            }
          }
        }
      }
    });
  }, [dynamicAgendaEvents, notifiedEvents, activeUserId, currentUser.userEmail]);

  // Open Full Board Modal with specific tab
  const openFullModal = (tab: "brief" | "schedule" | "board" = "brief") => {
    setModalActiveTab(tab);
    setShowAllBriefStories(false);
    setShowAllAgendaEvents(false);
    setIsFullBoardOpen(true);
  };

  // Dynamic suggested prompts derived from live stories (exactly 2 questions)
  const dynamicBriefPrompts = useMemo(() => {
    return [
      "Who are India's medal favourites today?",
      "Can Sindhu win gold in Badminton?",
    ];
  }, []);

  const dynamicSchedulePrompts = useMemo(() => {
    return [
      "What time should I set an alarm for?",
      "Which live event needs my attention right now?",
    ];
  }, []);

  // Brief Ask Flip AI logic
  const handleBriefAskSubmit = async (queryToAsk?: string) => {
    const q = (queryToAsk || briefQuestion).trim();
    if (!q || briefLoading) return;
    setBriefLoading(true);
    setBriefAnswer(null);

    const contextMoment = effectiveBriefStories
      .slice(0, 4)
      .map((s) => `${s.sport}: ${s.title} - ${s.description}`)
      .join("; ");

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Context moment: "${contextMoment}". Question about this moment: "${q}". Answer this question in a short, engaging sports fan format under 200 characters.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiAnswer = data.answer || data.response || data.message;
        if (aiAnswer && typeof aiAnswer === "string" && aiAnswer.trim()) {
          setBriefAnswer(cleanAiResponse(aiAnswer, q));
          setBriefLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Brief Ask AI error, using fallback response:", err);
    }

    // High-accuracy fallback
    let ans = "";
    const lower = q.toLowerCase();
    if (lower.includes("sindhu") || lower.includes("badminton")) {
      ans = `🏸 **P.V. Sindhu** is in prime knockout form! A clinical opening round sets up a massive clash against top Asian seeds today.`;
    } else if (lower.includes("cricket") || lower.includes("women")) {
      ans = `🏏 **India Women's Cricket Team** enters the Gold Medal clash vs Sri Lanka with high batting momentum and lethal spin dominance!`;
    } else if (lower.includes("shooter") || lower.includes("shooting") || lower.includes("medal")) {
      ans = `🎯 Indian shooters in the **10m Air Rifle Mixed Team** & Skeet qualification carry huge podium expectations today!`;
    } else {
      ans = `⚡ Today's Asian Games brief features high-stakes finals in Cricket, Shooting, and key knockout battles in Badminton!`;
    }

    setBriefAnswer(cleanAiResponse(ans, q));
    setBriefLoading(false);
  };

  // Schedule Ask Flip AI logic
  const handleScheduleAskSubmit = async (queryToAsk?: string) => {
    const q = (queryToAsk || scheduleQuestion).trim();
    if (!q || scheduleLoading) return;
    setScheduleLoading(true);
    setScheduleAnswer(null);

    const contextMoment = dynamicAgendaEvents
      .slice(0, 5)
      .map((e) => `${e.time} - ${e.sport}: ${e.subEvent} (${e.statusLabel})`)
      .join("; ");

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Context moment: "${contextMoment}". Question about schedule: "${q}". Answer in a short, crisp sports fan format under 200 characters.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiAnswer = data.answer || data.response || data.message;
        if (aiAnswer && typeof aiAnswer === "string" && aiAnswer.trim()) {
          setScheduleAnswer(cleanAiResponse(aiAnswer, q));
          setScheduleLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Schedule Ask AI error, using fallback:", err);
    }

    let ans = "";
    const lower = q.toLowerCase();
    if (lower.includes("alarm") || lower.includes("time")) {
      ans = `⏰ Set an alarm for **10:30 AM** for the **Women's Cricket T20 Gold Medal Final**, and tune in now for live Badminton & Shooting!`;
    } else if (lower.includes("live") || lower.includes("attention")) {
      ans = `🔥 **Badminton (India vs Japan)** & **Shooting (10m Air Rifle Mixed Team)** are LIVE right now with medal spots on the line!`;
    } else {
      ans = `🏆 The marquee fixture is the **Women's Cricket Final (India vs Sri Lanka)** at 10:30 AM, followed by swimming finals at 12:00 PM!`;
    }

    setScheduleAnswer(cleanAiResponse(ans, q));
    setScheduleLoading(false);
  };

  // Share Brief Action
  const handleShareBrief = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: "FlipBOARD - Daily Sports Briefing",
          text: "Check out today's sports briefing and live schedule on FlipBOARD!",
          url: typeof window !== "undefined" ? window.location.href : "",
        })
        .catch(() => {});
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
        showToast("📋 Link copied to clipboard!");
      }
    }
  };

  return (
    <div className="w-full flex flex-col font-sans text-white select-none">
      {/* Toast Notification Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[999999] px-4 py-2.5 rounded-full bg-[#1e1333] border border-[#EC4899]/70 text-white font-bold text-[13px] shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(236,72,153,0.3)] flex items-center gap-2 pointer-events-none"
          >
            <Sparkles size={16} className="text-[#EC4899] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────────
          MAIN WIDGET CONTAINER (Cards / Brief & Schedule Collapsed View)
      ───────────────────────────────────────────────────────────────────────── */}
      <div
        className="w-full rounded-[24px] p-4 sm:p-5 border border-white/10 relative overflow-hidden transition-all duration-300"
        style={{
          background: "linear-gradient(180deg, #0f121d 0%, #090b14 100%)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(236, 72, 153, 0.08)",
        }}
      >
        {/* Background ambient lighting */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, #EC4899 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full pointer-events-none opacity-15"
          style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)" }}
        />

        {/* ─── 1. Header Bar: FlipBOARD Title & Badges ─── */}
        <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
          {/* Title & Subtitle */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e152d] to-[#120c1d] border border-[#EC4899]/30 flex items-center justify-center shadow-sm shrink-0">
              <ClipboardList size={18} className="text-[#EC4899]" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[19px] sm:text-[21px] font-black tracking-tight leading-none flex items-center gap-0.5">
                <span className="text-white">Flip</span>
                <span className="bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent">
                  BOARD
                </span>
              </h2>
              <span className="text-[9.5px] sm:text-[10px] font-bold text-gray-400 tracking-[0.18em] uppercase mt-0.5 truncate">
                YOUR DAILY SPORTS BRIEFING
              </span>
            </div>
          </div>

          {/* Right SXP Badge */}
          {/* <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#261b0a] border border-[#F59E0B]/40 text-[#F59E0B] text-[11.5px] font-extrabold shadow-sm">
              <Zap size={13} className="text-[#FBBF24] fill-[#FBBF24]" />
              <span>{userSxp} SXP</span>
            </div>
          </div> */}
        </div>

        {/* ─── 2. Daily Check-in Card (Green Card) ─── */}
        {/* <div className="w-full mb-4 rounded-2xl p-3 sm:p-3.5 bg-gradient-to-r from-[#041a12] via-[#062419] to-[#041a12] border border-[#10B981]/35 flex items-center justify-between gap-3 shadow-[0_0_18px_rgba(16,185,129,0.08)] relative z-10">
          <div className="flex flex-col min-w-0">
            <h4 className="text-[13.5px] sm:text-[14px] font-black text-[#10B981] leading-tight">
              Daily Check-in
            </h4>
            <p className="text-[11px] sm:text-[12px] font-medium text-gray-300 leading-tight mt-0.5">
              +25 SXP · keeps your streak alive
            </p>
          </div>

          <button
            type="button"
            onClick={handleDailyCheckIn}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl font-extrabold text-[12px] sm:text-[12.5px] transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer ${
              isCheckInDone
                ? "bg-[#064e3b] text-[#34D399] border border-[#10B981]/40 shadow-none cursor-default"
                : "bg-[#10B981] hover:bg-[#059669] text-black shadow-[0_0_12px_rgba(16,185,129,0.35)] active:scale-95"
            }`}
          >
            <span>{isCheckInDone ? "Checked" : "Check In"}</span>
            <span>✓</span>
          </button>
        </div> */}

        {/* ─── 3. Navigation Tabs: BRIEF vs SCHEDULE ─── */}
        <div className="flex items-center border-b border-white/10 mb-3.5 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab("brief")}
            className={`flex-1 pb-2.5 text-[13px] sm:text-[14px] font-black tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === "brief" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>📰</span>
            <span>BRIEF</span>
            {activeTab === "brief" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`flex-1 pb-2.5 text-[13px] sm:text-[14px] font-black tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === "schedule" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>📅</span>
            <span>SCHEDULE</span>
            {activeTab === "schedule" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
              />
            )}
          </button>
        </div>

        {/* ─── 4. Tab Content View (Shows Top 3 Items) ─── */}
        {activeTab === "brief" ? (
          /* ─── TAB A: BRIEF VIEW (Shows top 3 stories + Today's Poll + Actions) ─── */
          <div className="space-y-3 relative z-10">
            {/* Top 3 Brief Stories */}
            <div className="space-y-2">
              {effectiveBriefStories.slice(0, 3).map((story, idx) => (
                <div
                  key={story.id || idx}
                  onClick={() => openFullModal("brief")}
                  className="rounded-2xl p-3 sm:p-3.5 bg-[#0e1220]/90 border border-white/[0.08] hover:border-[#EC4899]/40 hover:bg-[#13182b] transition-all cursor-pointer flex items-start gap-3 group shadow-sm"
                >
                  <span className="text-[20px] sm:text-[22px] leading-none shrink-0 pt-0.5">
                    {story.icon || "🏆"}
                  </span>
                  <div className="flex-1 min-w-0">
                    {(Boolean(story.date) || Boolean(story.time)) && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                          <Calendar size={10} />
                          <span>{formatEventDisplayDateTime(story.date, story.time, currentTime)}</span>
                        </span>
                      </div>
                    )}
                    <h4 className="text-[13.5px] sm:text-[14.5px] font-extrabold text-white leading-snug group-hover:text-[#F472B6] transition-colors">
                      {story.title}
                    </h4>
                    <p className="text-[11.5px] sm:text-[12px] font-normal text-gray-300/90 leading-relaxed mt-0.5 line-clamp-2">
                      {story.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Today's Poll Card - Exactly matching FlipArena before and after voting */}
            <div className="w-full">
              {loadingLatestPoll ? (
                <div className="w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-emerald-500/50 border-y border-r border-white/[0.06] rounded-2xl p-4 shadow-xl animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-white/10 rounded w-28" />
                    <div className="h-3 bg-white/10 rounded w-16" />
                  </div>
                  <div className="h-4 bg-white/15 rounded w-4/5" />
                  <div className="space-y-2 pt-1">
                    <div className="h-11 bg-white/[0.03] border border-white/5 rounded-xl" />
                    <div className="h-11 bg-white/[0.03] border border-white/5 rounded-xl" />
                    <div className="h-11 bg-white/[0.03] border border-white/5 rounded-xl" />
                  </div>
                </div>
              ) : latestPoll ? (
                <DynamicPollCard
                  item={latestPoll}
                  userId={activeUserId}
                  userName={currentUser.userName}
                  userAvatar={currentUser.userAvatar}
                  userEmail={currentUser.userEmail}
                  now={currentTime.getTime()}
                  onToast={showToast}
                  onOpenEngagedModal={(item) => {
                    router.push(`/MainModules/FlipArena?itemId=${encodeURIComponent(item.id)}&type=poll`);
                  }}
                />
              ) : (
                <div className="w-full max-w-lg mx-auto bg-[#0e111a] border border-white/[0.06] rounded-2xl p-6 text-center shadow-xl space-y-2">
                  <span className="text-2xl opacity-75">📊</span>
                  <h4 className="text-xs font-bold text-white/90">No active poll right now</h4>
                  <p className="text-[11px] text-white/50 max-w-xs mx-auto leading-relaxed">
                    Check back soon or create your own poll in FlipArena!
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => router.push("/MainModules/FlipArena")}
                className="flex-1 py-1.5 px-2 rounded-full border border-[#EC4899]/70 text-[#EC4899] hover:bg-[#EC4899]/15 font-bold text-[11.5px] flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>🥊</span>
                <span>Predict</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/MainModules/FlipLine")}
                className="flex-1 py-1.5 px-2 rounded-full border border-white/15 bg-white/[0.04] text-gray-200 hover:bg-white/10 font-bold text-[11.5px] flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>💬</span>
                <span>Discuss</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleOpenCreate("poll", e)}
                className="flex-1 py-1.5 px-2 rounded-full border border-[#F59E0B]/70 text-[#F59E0B] hover:bg-[#F59E0B]/15 font-bold text-[11.5px] flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>✨</span>
                <span>Create</span>
              </button>
            </div>

            {/* Bottom Bar: Dots & Full board link */}
            <div className="flex items-center justify-end pt-2 border-t border-white/5">
              {/* <div className="flex items-center gap-1.5">
                <span className="w-4 h-1.5 rounded-full bg-[#EC4899] shadow-[0_0_6px_#EC4899]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div> */}

              <button
                type="button"
                onClick={() => openFullModal("brief")}
                className="text-[12.5px] sm:text-[13px] font-black text-[#F59E0B] hover:text-[#FBBF24] transition-colors flex items-center gap-1 cursor-pointer group"
              >
                <span>Full board + earn SXP</span>
                <span className="font-extrabold text-[14px] group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* ─── TAB B: SCHEDULE VIEW (Shows top 3 live/scheduled events) ─── */
          <div className="space-y-3 relative z-10">
            {/* Top 3 Schedule Timeline Items */}
            <div className="relative pl-3 space-y-3">
              {/* Continuous vertical timeline line */}
              <div className="absolute left-[17px] top-3 bottom-3 w-[1.5px] bg-slate-800 pointer-events-none" />

              {dynamicAgendaEvents.slice(0, 3).map((evt, idx) => {
                const isLive = evt.statusType === "live" || evt.statusLabel?.toLowerCase() === "live";
                const isFinal =
                  (evt.subEvent && evt.subEvent.toLowerCase().includes("final")) ||
                  evt.statusLabel === "FINAL";

                let dotColor = "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
                if (isLive) dotColor = "bg-[#10B981] shadow-[0_0_10px_#10B981]";
                else if (isFinal) dotColor = "bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]";
                else if (evt.statusType === "up_next") dotColor = "bg-purple-400 shadow-[0_0_8px_#C084FC]";

                return (
                  <div
                    key={evt.id || idx}
                    onClick={() => {
                      setSelectedCardDetail(evt);
                    }}
                    className="relative flex items-start gap-3.5 group cursor-pointer"
                  >
                    {/* Timeline Dot */}
                    <div className="relative z-10 pt-1.5 shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                    </div>

                    {/* Event Content Row */}
                    <div className="flex-1 flex items-center justify-between min-w-0 pr-1 pb-1">
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[16px] leading-none shrink-0">{evt.icon || "🏆"}</span>
                          <h4 className="text-[13.5px] sm:text-[14px] font-extrabold text-white truncate group-hover:text-[#38BDF8] transition-colors">
                            {evt.sport}
                          </h4>
                        </div>
                        <p className="text-[11px] sm:text-[11.5px] font-medium text-gray-300/85 truncate mt-0.5">
                          {evt.detail ? `${evt.detail} · ${evt.subEvent}` : evt.subEvent}
                        </p>
                        {isLive && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/MainModules/FlipLine");
                            }}
                            className="mt-1.5 px-3 py-1 rounded-full bg-[#052e22] border border-[#10B981]/50 text-[#10B981] text-[11px] font-black w-fit hover:bg-[#074231] transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Watch Live</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>

                      {/* Status / Badge */}
                      <div className="shrink-0">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#04281E] text-[#10B981] border border-[#10B981]/50 uppercase tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                            <span>LIVE</span>
                          </span>
                        ) : isFinal ? (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2a1b08] text-[#F59E0B] border border-[#F59E0B]/50 uppercase tracking-wider">
                            <span>🏆</span>
                            <span>FINAL</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-black text-gray-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 uppercase font-mono">
                            {formatEventDisplayDateTime(evt.date, evt.time || evt.statusLabel || "SCHEDULED", currentTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Full Schedule Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => openFullModal("schedule")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#061826]/90 border border-[#0284C7]/60 hover:border-[#38BDF8] text-[#38BDF8] hover:bg-[#0a263d] font-extrabold text-[12.5px] sm:text-[13px] text-center transition-all cursor-pointer shadow-[0_0_15px_rgba(2,132,199,0.12)] flex items-center justify-center gap-1.5"
              >
                <span>Full Schedule + Set Reminders</span>
                <span className="font-extrabold text-[14px]">→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          FULL FLIPBOARD POPUP MODAL (Brief / Schedule / Board Tabs)
      ───────────────────────────────────────────────────────────────────────── */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isFullBoardOpen && (
              <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
                {/* Backdrop Click */}
                <div className="absolute inset-0" onClick={() => setIsFullBoardOpen(false)} />

                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="relative w-full max-w-lg h-[92dvh] sm:h-[88vh] max-h-[92dvh] sm:max-h-[860px] rounded-t-[28px] sm:rounded-2xl bg-[#090C16] border border-white/10 sm:border-white/15 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.9)] flex flex-col z-10"
                >
                  {/* Drag Handle Bar */}
                  <div className="w-full flex justify-center pt-3 pb-1 shrink-0 bg-[#090C16] select-none">
                    <div className="w-12 h-1 bg-gray-600/70 rounded-full" />
                  </div>

                  {/* ─── Modal Header: Title, Subtitle, Badges & Close Button ─── */}
                  <div className="px-4 sm:px-6 pt-1 pb-2 flex items-center justify-between bg-[#090C16] shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-[#1a0f26] border border-[#EC4899]/40 flex items-center justify-center shrink-0">
                        <ClipboardList size={18} className="text-[#EC4899]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-[17px] sm:text-[19px] font-black leading-tight flex items-center gap-0.5">
                          <span className="text-white">Flip</span>
                          <span className="bg-gradient-to-r from-[#EC4899] to-[#FB7185] bg-clip-text text-transparent">
                            BOARD
                          </span>
                        </h3>
                        <p className="text-[11px] font-semibold text-gray-400 truncate">
                          {welcomeConfig?.agendaDateTitle || "Asian Games 2026 - Today"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* SXP badge */}
                      {/* <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#261b0a] border border-[#F59E0B]/40 text-[#F59E0B] text-[11px] font-black">
                        <Zap size={12} className="fill-[#FBBF24] text-[#FBBF24]" />
                        <span>{userSxp + 25}</span>
                      </div> */}

                      {/* Close button */}
                      <button
                        type="button"
                        aria-label="Close FlipBoard"
                        onClick={() => setIsFullBoardOpen(false)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* ─── Level & Scout Fan EXP Progress Bar ─── */}
                  {/* <div className="px-4 sm:px-6 py-2 bg-[#090C16] shrink-0 border-b border-white/5">
                    <div className="flex items-center justify-between text-[11.5px] font-bold mb-1">
                      <div className="flex items-center gap-1.5 text-white">
                        <span className="text-[14px]">🎖️</span>
                        <span>Scout Fan</span>
                      </div>
                      <div className="text-gray-400 text-[11px]">
                        <span className="text-[#FBBF24] font-black">{userExp}</span> / {maxExp} EXP ·{" "}
                        <span className="text-gray-300">Analyst</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#EC4899] shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        style={{ width: `${(userExp / maxExp) * 100}%` }}
                      />
                    </div>
                  </div> */}

                  {/* ─── Modal 3 Tabs: BRIEF | SCHEDULE | BOARD ─── */}
                  <div className="px-4 sm:px-6 pt-2 pb-0 flex items-center border-b border-white/10 bg-[#090C16] shrink-0">
                    <button
                      type="button"
                      onClick={() => setModalActiveTab("brief")}
                      className={`flex-1 pb-2.5 text-[12.5px] sm:text-[13.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                        modalActiveTab === "brief" ? "text-white" : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <span>📰</span>
                      <span>BRIEF</span>
                      {modalActiveTab === "brief" && (
                        <motion.div
                          layoutId="modalTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalActiveTab("schedule")}
                      className={`flex-1 pb-2.5 text-[12.5px] sm:text-[13.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                        modalActiveTab === "schedule" ? "text-white" : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <span>📅</span>
                      <span>SCHEDULE</span>
                      {modalActiveTab === "schedule" && (
                        <motion.div
                          layoutId="modalTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalActiveTab("board")}
                      className={`flex-1 pb-2.5 text-[12.5px] sm:text-[13.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                        modalActiveTab === "board" ? "text-white" : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <span>🏆</span>
                      <span>BOARD</span>
                      {modalActiveTab === "board" && (
                        <motion.div
                          layoutId="modalTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
                        />
                      )}
                    </button>
                  </div>

                  {/* ─── Scrollable Modal Body ─── */}
                  <div
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4 pb-[calc(env(safe-area-inset-bottom,20px)+24px)]"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255,255,255,0.15) transparent",
                    }}
                  >
                    {/* ─────────────────────────────────────────────────────────────
                        MODAL TAB 1: BRIEF
                    ───────────────────────────────────────────────────────────── */}
                    {modalActiveTab === "brief" && (
                      <div className="space-y-4">
                        {/* Quick Action Chips Row */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                        

                          <button
                            type="button"
                            onClick={() => {
                              setIsFullBoardOpen(false);
                              router.push("/MainModules/WatchAlong");
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-[#06241a] border border-[#10B981]/50 text-[#10B981] font-bold text-[12px] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                          >
                            <span>Watch Live 🔴</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsFullBoardOpen(false);
                              router.push("/MainModules/FlipArena");
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-[#200d2b] border border-[#EC4899]/40 text-[#EC4899] font-bold text-[12px] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                          >
                            <span>Join FlipARENA</span>
                          </button>
                        </div>

                        {/* Stories List (Top 3 default, expandable with View all) */}
                        <div className="space-y-3">
                          {(showAllBriefStories
                            ? effectiveBriefStories
                            : effectiveBriefStories.slice(0, 3)
                          ).map((story, idx) => (
                            <div
                              key={story.id || idx}
                              className="rounded-2xl p-3.5 sm:p-4 bg-[#0e1220]/90 border border-white/10 hover:border-[#EC4899]/40 transition-all space-y-2.5 shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                {/* Number Badge */}
                                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                                  <div className="w-6 h-6 rounded-md bg-[#2a1a09] border border-[#F59E0B]/50 text-[#F59E0B] text-[12px] font-black flex items-center justify-center shadow-sm">
                                    {story.storyNumber || idx + 1}
                                  </div>
                                  <span className="text-[18px] leading-none">{story.icon || "🏆"}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  {(Boolean(story.date) || Boolean(story.time)) && (
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="text-[10.5px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                                        <Calendar size={10} />
                                        <span>{formatEventDisplayDateTime(story.date, story.time, currentTime)}</span>
                                      </span>
                                    </div>
                                  )}
                                  <h4 className="text-[14px] sm:text-[15px] font-extrabold text-white leading-snug">
                                    {story.title}
                                  </h4>
                                  <p className="text-[12px] sm:text-[12.5px] font-normal text-gray-300 leading-relaxed mt-1">
                                    {story.description}
                                  </p>
                                </div>
                              </div>

                              {/* Story Actions Row */}
                              <div className="flex items-center flex-wrap gap-2 pt-1.5 border-t border-white/5 pl-9">
                                {/* 1. Predict CTA (Render ONLY if selected by admin) */}
                                {(Boolean(story.predictId) || Boolean(story.predictUrl)) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsFullBoardOpen(false);
                                      if (story.predictUrl) {
                                        router.push(story.predictUrl);
                                      } else if (story.predictId) {
                                        router.push(`/MainModules/FlipArena?engagementId=${story.predictId}&type=prediction`);
                                      } else {
                                        router.push("/MainModules/FlipArena");
                                      }
                                    }}
                                    className="px-3 py-1 rounded-full border border-[#EC4899]/70 bg-[#EC4899]/10 text-[#EC4899] hover:bg-[#EC4899]/25 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                  >
                                    <span>Predict &gt;</span>
                                  </button>
                                )}

                                {/* 2. Discuss CTA (Render ONLY if selected by admin) */}
                                {(Boolean(story.discussPostId) || Boolean(story.discussUrl)) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsFullBoardOpen(false);
                                      if (story.discussUrl) {
                                        router.push(story.discussUrl);
                                      } else if (story.discussPostId) {
                                        router.push(`/MainModules/FlipLine?postId=${story.discussPostId}`);
                                      } else {
                                        router.push("/MainModules/FlipLine");
                                      }
                                    }}
                                    className="px-3 py-1 rounded-full border border-[#3B82F6]/60 bg-[#3B82F6]/10 text-[#60A5FA] hover:bg-[#3B82F6]/25 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                  >
                                    <span>Discuss</span>
                                  </button>
                                )}

                                {/* 3. Debate CTA (Render ONLY if selected by admin) */}
                                {(Boolean(story.debateRoomId) || Boolean(story.debateUrl)) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsFullBoardOpen(false);
                                      if (story.debateUrl) {
                                        router.push(story.debateUrl);
                                      } else if (story.debateRoomId) {
                                        router.push(`/MainModules/WatchAlong?roomId=${story.debateRoomId}`);
                                      } else {
                                        router.push("/MainModules/WatchAlong");
                                      }
                                    }}
                                    className="px-3 py-1 rounded-full border border-[#10B981]/60 bg-[#10B981]/10 text-[#34D399] hover:bg-[#10B981]/25 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                  >
                                    <span>Debate</span>
                                  </button>
                                )}

                                {/* 4. + Create CTA (ALWAYS renders on frontend) */}
                                <button
                                  type="button"
                                  onClick={() => setIsCreatePostDialogOpen(true)}
                                  className="px-3 py-1 rounded-full border border-[#F59E0B]/70 bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                >
                                  <span>+ Create</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* View all / Show less toggle button for Brief */}
                        {effectiveBriefStories.length > 3 && (
                          <div className="pt-0.5 pb-1">
                            <button
                              type="button"
                              onClick={() => setShowAllBriefStories((prev) => !prev)}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600/15 via-orange-600/15 to-pink-600/15 border border-amber-500/30 hover:border-amber-500/60 text-[#FBBF24] hover:text-white font-bold text-[12.5px] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                            >
                              <span>
                                {showAllBriefStories
                                  ? "Show less"
                                  : `View all (${effectiveBriefStories.length} stories)`}
                              </span>
                              <ChevronRight
                                size={14}
                                className={`transition-transform duration-200 ${
                                  showAllBriefStories ? "-rotate-90" : "rotate-90"
                                }`}
                              />
                            </button>
                          </div>
                        )}

                        {/* Post to FlipLine Card */}
                        <div className="w-full rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-[#0d162d] via-[#091024] to-[#0d162d] border border-[#0284C7]/40 flex items-center justify-between gap-3 shadow-[0_0_18px_rgba(2,132,199,0.1)]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#06233d] border border-[#0284C7]/50 flex items-center justify-center text-[#38BDF8] text-[18px] shrink-0">
                              ⚡
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-[13.5px] font-black uppercase tracking-wide text-[#38BDF8]">
                                POST TO FLIPLINE
                              </h4>
                              <p className="text-[11.5px] text-gray-400 font-medium truncate">
                                Your prediction shows as a card in the timeline
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsFullBoardOpen(false);
                              router.push("/MainModules/FlipLine");
                            }}
                            className="px-4 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-extrabold text-[12px] shrink-0 transition-all cursor-pointer"
                          >
                            Go →
                          </button>
                        </div>

                        {/* FlipArena Banner */}
                        <div className="w-full rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-[#180924] via-[#100619] to-[#180924] border border-[#EC4899]/40 flex items-center justify-between gap-3 shadow-[0_0_18px_rgba(236,72,153,0.12)]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#260e36] border border-[#EC4899]/50 flex items-center justify-center text-[18px] shrink-0">
                              🎟️
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-[13.5px] font-black uppercase tracking-wide text-[#EC4899] flex items-center gap-1.5">
                                <span>FLIPARENA</span>
                                <span className="text-[11px] font-extrabold text-[#FBBF24]">+20 SXP</span>
                              </h4>
                              <p className="text-[11.5px] text-gray-400 font-medium truncate">
                                Polls · Battles · Quizzes · Fan Rankings
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsFullBoardOpen(false);
                              router.push("/MainModules/FlipArena");
                            }}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[12px] shrink-0 shadow-[0_2px_10px_rgba(236,72,153,0.4)] hover:opacity-95 transition-all cursor-pointer"
                          >
                            Jump In →
                          </button>
                        </div>

                        {/* Invite Friends Banner */}
                        <div className="w-full rounded-2xl p-4 bg-[#14101e] border border-[#F59E0B]/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[18px]">🤝</span>
                              <div>
                                <h4 className="text-[13.5px] font-black uppercase text-[#FBBF24]">
                                  INVITE FRIENDS
                                </h4>
                                <p className="text-[11px] text-gray-400 font-medium">
                                  Earn +50 SXP per friend who joins FlipBOARD
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Friends Avatars */}
                          <div className="flex items-center justify-around pt-1">
                            {INVITE_FRIENDS_LIST.map((f, fIdx) => (
                              <div key={fIdx} className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-full bg-[#2a1a09] border border-[#F59E0B]/40 flex items-center justify-center text-[18px] shadow-sm">
                                  {f.avatar}
                                </div>
                                <span className="text-[10px] font-bold text-gray-300">{f.name}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              handleShareBrief();
                              showToast("🤝 +50 SXP referral invite shared!");
                            }}
                            className="w-full py-2.5 rounded-xl bg-[#26180a] border border-[#F59E0B]/60 hover:bg-[#38230f] text-[#FBBF24] font-extrabold text-[12.5px] transition-all cursor-pointer text-center"
                          >
                            Invite All Friends +50 SXP each →
                          </button>
                        </div>

                        {/* Ask Flip AI Section */}
                        <div className="w-full rounded-2xl p-4 bg-gradient-to-b from-[#130B24] to-[#0A0714] border border-[#A855F7]/30 space-y-3 shadow-[0_4px_25px_rgba(124,58,237,0.15)]">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-[1.5px] shadow-sm shrink-0">
                              <div className="w-full h-full rounded-full bg-[#130B24] flex items-center justify-center text-[15px]">
                                🐬
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[14px] font-black uppercase text-white flex items-center gap-1">
                                ASK FLIP 🐬
                              </h4>
                              <p className="text-[11px] text-gray-400 font-medium">
                                Dive deeper into any story from today&apos;s brief
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-gray-400">
                              TRY ASKING:
                            </span>
                            <div className="space-y-1.5">
                              {dynamicBriefPrompts.slice(0, 2).map((prompt, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => {
                                    setBriefQuestion(prompt);
                                    handleBriefAskSubmit(prompt);
                                  }}
                                  className="w-full text-left px-3.5 py-2 rounded-xl text-[12px] font-medium text-gray-300 bg-white/[0.04] border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.07] hover:text-white transition-all cursor-pointer truncate"
                                >
                                  {prompt}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="relative">
                            <textarea
                              rows={2}
                              value={briefQuestion}
                              onChange={(e) => setBriefQuestion(e.target.value)}
                              placeholder="Or type your own question about today's stories..."
                              className="w-full rounded-xl bg-[#090B12] border border-white/10 p-3 text-[12.5px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/70 resize-none transition-colors"
                            />
                          </div>

                          {/* AI Response Display */}
                          <AnimatePresence>
                            {(briefLoading || briefAnswer) && (
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[12.5px] text-gray-200 leading-relaxed"
                              >
                                {briefLoading ? (
                                  <div className="flex items-center gap-2 text-purple-300 font-medium">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Flip is analyzing today&apos;s stories...</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
                                      <Sparkles size={12} />
                                      <span>Flip AI Analysis</span>
                                    </div>
                                    <div className="text-white/95">{formatAiAnswerText(briefAnswer)}</div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button
                            type="button"
                            onClick={() => handleBriefAskSubmit()}
                            disabled={briefLoading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-[0_4px_18px_rgba(236,72,153,0.35)] hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {briefLoading ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <>
                                <span>Ask Flip</span>
                                <span>🐬</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        MODAL TAB 2: SCHEDULE
                    ───────────────────────────────────────────────────────────── */}
                    {modalActiveTab === "schedule" && (
                      <div className="space-y-4">
                        {/* Filter Chips: All | Live | Upcoming | Finals */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                          {[
                            { key: "all", label: "All" },
                            { key: "live", label: "🔴 Live" },
                            { key: "upcoming", label: "📅 Upcoming" },
                            { key: "finished", label: "🏆 Finished" },
                          ].map((f) => (
                            <button
                              key={f.key}
                              type="button"
                              onClick={() => setScheduleFilter(f.key as any)}
                              className={`px-3.5 py-1.5 rounded-full font-extrabold text-[12px] transition-all shrink-0 cursor-pointer ${
                                scheduleFilter === f.key
                                  ? "bg-[#EC4899] text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                                  : "bg-white/[0.05] border border-white/10 text-gray-300 hover:text-white"
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        {/* Schedule Timeline (Top 3 default, expandable with View all) */}
                        <div className="relative pl-3 space-y-4 pt-1">
                          {/* Vertical connecting line */}
                          <div className="absolute left-[17px] top-4 bottom-4 w-[1.5px] bg-slate-800 pointer-events-none" />

                          {(showAllAgendaEvents
                            ? filteredScheduleEvents
                            : filteredScheduleEvents.slice(0, 3)
                          ).map((evt, idx) => {
                            const isLive =
                              evt.statusType === "live" || evt.statusLabel?.toLowerCase() === "live";
                            const isCompleted =
                              evt.statusType === "completed" ||
                              evt.statusLabel?.toLowerCase() === "completed" ||
                              evt.statusLabel?.toLowerCase() === "finished";
                            const isFinal =
                              (evt.subEvent && evt.subEvent.toLowerCase().includes("final")) ||
                              evt.statusLabel === "FINAL";
                            const isNotified = notifiedEvents.includes(evt.id);

                            let dotColor = "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
                            if (isLive) dotColor = "bg-[#10B981] shadow-[0_0_10px_#10B981]";
                            else if (evt.statusType === "up_next")
                              dotColor = "bg-[#FBBF24] shadow-[0_0_8px_#FBBF24]";
                            else if (isCompleted)
                              dotColor = "bg-slate-500 shadow-[0_0_8px_rgba(148,163,184,0.4)]";
                            else if (isFinal) dotColor = "bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]";

                            return (
                              <div
                                key={evt.id || idx}
                                onClick={() => setSelectedCardDetail(evt)}
                                className="relative flex items-start gap-3.5 group cursor-pointer"
                              >
                                {/* Timeline Dot */}
                                <div className="relative z-10 pt-1.5 shrink-0">
                                  <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                                </div>

                                {/* Event Body */}
                                <div className="flex-1 rounded-2xl p-3 sm:p-3.5 bg-[#0e1220]/90 border border-white/10 hover:border-cyan-500/40 transition-all space-y-2.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col min-w-0 pr-1">
                                      <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 font-mono">
                                        <Clock size={11} className="text-gray-400" />
                                        <span>{formatEventDisplayDateTime(evt.date, evt.time, currentTime)}</span>
                                      </span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[18px] leading-none shrink-0">
                                          {evt.icon || "🏆"}
                                        </span>
                                        <h4 className="text-[14px] sm:text-[14.5px] font-extrabold text-white truncate group-hover:text-cyan-400 transition-colors">
                                          {evt.sport}
                                        </h4>
                                      </div>
                                      <p className="text-[11.5px] font-medium text-gray-300 mt-0.5 truncate">
                                        {evt.subEvent}
                                      </p>
                                      {evt.detail && (
                                        <p className="text-[11px] font-normal text-gray-400 truncate">
                                          {evt.detail}
                                        </p>
                                      )}
                                      {evt.venue && (
                                        <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                          <MapPin size={11} className="text-cyan-400 shrink-0" />
                                          <span>{evt.venue}</span>
                                        </p>
                                      )}
                                    </div>

                                    <div className="shrink-0">
                                      {isLive ? (
                                        <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#04281E] text-[#10B981] border border-[#10B981]/50 uppercase tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                                          <span>LIVE</span>
                                        </span>
                                      ) : evt.statusType === "up_next" ? (
                                        <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2a1e08] text-[#FBBF24] border border-[#FBBF24]/50 uppercase tracking-wider">
                                          <span>UP NEXT</span>
                                        </span>
                                      ) : isCompleted ? (
                                        <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#1e293b] text-[#94a3b8] border border-[#475569]/50 uppercase tracking-wider">
                                          <span>✓</span>
                                          <span>FINISHED</span>
                                        </span>
                                      ) : isFinal ? (
                                        <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2a1b08] text-[#F59E0B] border border-[#F59E0B]/50 uppercase tracking-wider">
                                          <span>🏆</span>
                                          <span>FINAL</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-black text-gray-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 uppercase font-mono">
                                          {formatEventDisplayDateTime(evt.date, evt.statusLabel || "UPCOMING", currentTime)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons Row */}
                                  <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-white/5">
                                    {/* 1. Live or Reminder Button */}
                                    {isLive ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsFullBoardOpen(false);
                                          router.push("/MainModules/FlipLine");
                                        }}
                                        className="px-3 py-1 rounded-full bg-[#063023] border border-[#10B981]/60 text-[#10B981] hover:bg-[#094734] font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                      >
                                        <span>Watch Live 🔴</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => toggleReminder(evt.id, e)}
                                        className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm ${
                                          isNotified
                                            ? "bg-[#2b103b] border border-[#EC4899] text-[#EC4899]"
                                            : "bg-white/[0.04] border border-white/15 text-gray-300 hover:bg-white/10"
                                        }`}
                                      >
                                        <Bell size={11} className={isNotified ? "fill-[#EC4899]" : ""} />
                                        <span>{isNotified ? "Reminder Set ✓" : "Set Reminder 🔔"}</span>
                                      </button>
                                    )}

                                    {/* 2. Predict CTA (Render ONLY if selected by admin) */}
                                    {(Boolean(evt.predictId) || Boolean(evt.predictUrl)) && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsFullBoardOpen(false);
                                          if (evt.predictUrl) {
                                            router.push(evt.predictUrl);
                                          } else if (evt.predictId) {
                                            router.push(`/MainModules/FlipArena?engagementId=${evt.predictId}&type=prediction`);
                                          } else {
                                            router.push("/MainModules/FlipArena");
                                          }
                                        }}
                                        className="px-3 py-1 rounded-full border border-[#EC4899]/70 bg-[#EC4899]/10 text-[#EC4899] hover:bg-[#EC4899]/25 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                      >
                                        <span>Predict &gt;</span>
                                      </button>
                                    )}

                                    {/* 3. Discuss CTA (Render ONLY if selected by admin) */}
                                    {(Boolean(evt.discussPostId) || Boolean(evt.discussUrl)) && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsFullBoardOpen(false);
                                          if (evt.discussUrl) {
                                            router.push(evt.discussUrl);
                                          } else if (evt.discussPostId) {
                                            router.push(`/MainModules/FlipLine?postId=${evt.discussPostId}`);
                                          } else {
                                            router.push("/MainModules/FlipLine");
                                          }
                                        }}
                                        className="px-3 py-1 rounded-full border border-[#3B82F6]/60 bg-[#3B82F6]/10 text-[#60A5FA] hover:bg-[#3B82F6]/25 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                      >
                                        <span>Discuss</span>
                                      </button>
                                    )}

                                    {/* 4. Debate CTA (Render ONLY if selected by admin) */}
                                    {(Boolean(evt.debateRoomId) || Boolean(evt.debateUrl)) && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsFullBoardOpen(false);
                                          if (evt.debateUrl) {
                                            router.push(evt.debateUrl);
                                          } else if (evt.debateRoomId) {
                                            router.push(`/MainModules/WatchAlong?roomId=${evt.debateRoomId}`);
                                          } else {
                                            router.push("/MainModules/WatchAlong");
                                          }
                                        }}
                                        className="px-3 py-1 rounded-full border border-[#10B981]/60 bg-[#10B981]/10 text-[#34D399] hover:bg-[#10B981]/25 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                      >
                                        <span>Debate</span>
                                      </button>
                                    )}

                                    {/* 5. + Create CTA (ALWAYS renders on frontend) */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCreatePostDialogOpen(true);
                                      }}
                                      className="px-3 py-1 rounded-full border border-[#F59E0B]/70 bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                    >
                                      <span>+ Create</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* View all / Show less toggle button for Schedule */}
                        {filteredScheduleEvents.length > 3 && (
                          <div className="pt-0.5 pb-1">
                            <button
                              type="button"
                              onClick={() => setShowAllAgendaEvents((prev) => !prev)}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 border border-white/10 hover:border-cyan-500/50 text-[#38BDF8] hover:text-white font-bold text-[12.5px] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                            >
                              <span>
                                {showAllAgendaEvents
                                  ? "Show less"
                                  : `View all (${filteredScheduleEvents.length} events)`}
                              </span>
                              <ChevronRight
                                size={14}
                                className={`transition-transform duration-200 ${
                                  showAllAgendaEvents ? "-rotate-90" : "rotate-90"
                                }`}
                              />
                            </button>
                          </div>
                        )}

                        {/* Ask Flip About Schedule Section */}
                        <div className="w-full rounded-2xl p-4 bg-gradient-to-b from-[#130B24] to-[#0A0714] border border-[#A855F7]/30 space-y-3 shadow-[0_4px_25px_rgba(124,58,237,0.15)] mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-[1.5px] shadow-sm shrink-0">
                              <div className="w-full h-full rounded-full bg-[#130B24] flex items-center justify-center text-[15px]">
                                🐬
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[14px] font-black uppercase text-white flex items-center gap-1">
                                ASK FLIP ABOUT THE SCHEDULE 🐬
                              </h4>
                              <p className="text-[11px] text-gray-400 font-medium">
                                Instant insights on fixtures, match timings, &amp; big clashes
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {dynamicSchedulePrompts.slice(0, 2).map((prompt, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  setScheduleQuestion(prompt);
                                  handleScheduleAskSubmit(prompt);
                                }}
                                className="w-full text-left px-3.5 py-2 rounded-xl text-[12px] font-medium text-gray-300 bg-white/[0.04] border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.07] hover:text-white transition-all cursor-pointer truncate"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>

                          <div className="relative">
                            <textarea
                              rows={2}
                              value={scheduleQuestion}
                              onChange={(e) => setScheduleQuestion(e.target.value)}
                              placeholder="Ask about live events, timing, alarms, key rivalries..."
                              className="w-full rounded-xl bg-[#090B12] border border-white/10 p-3 text-[12.5px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/70 resize-none transition-colors"
                            />
                          </div>

                          {/* AI Response */}
                          <AnimatePresence>
                            {(scheduleLoading || scheduleAnswer) && (
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[12.5px] text-gray-200 leading-relaxed"
                              >
                                {scheduleLoading ? (
                                  <div className="flex items-center gap-2 text-purple-300 font-medium">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Flip is checking the live schedule...</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
                                      <Sparkles size={12} />
                                      <span>Flip Schedule Insight</span>
                                    </div>
                                    <div className="text-white/95">{formatAiAnswerText(scheduleAnswer)}</div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button
                            type="button"
                            onClick={() => handleScheduleAskSubmit()}
                            disabled={scheduleLoading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-[0_4px_18px_rgba(236,72,153,0.35)] hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {scheduleLoading ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <>
                                <span>Ask Flip</span>
                                <span>🐬</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        MODAL TAB 3: BOARD (SXP Hub & Leaderboard)
                    ───────────────────────────────────────────────────────────── */}
                    {modalActiveTab === "board" && (
                      <div className="space-y-4">
                        {/* User Profile Card */}
                        <div className="w-full rounded-2xl p-4 bg-gradient-to-br from-[#1c150b] via-[#120e07] to-[#1c150b] border border-[#F59E0B]/50 flex items-center gap-3.5 shadow-[0_0_20px_rgba(245,158,11,0.12)]">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#EC4899] p-[2px] shrink-0">
                            <div className="w-full h-full rounded-full bg-[#1c150b] flex items-center justify-center text-[20px]">
                              👤
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-[15px] font-black text-white">You</h4>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40 uppercase">
                                Scout
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11.5px] font-bold text-gray-300 mt-1">
                              <span className="text-[#FBBF24] flex items-center gap-1">
                                <Zap size={12} className="fill-[#FBBF24]" />
                                {userSxp + 25} SXP
                              </span>
                              <span>·</span>
                              <span className="text-amber-400 flex items-center gap-1">
                                <Flame size={12} className="fill-amber-400" />
                                {userStreak + 1}-day streak
                              </span>
                              <span>·</span>
                              <span className="text-gray-400">Rank #14</span>
                            </div>
                          </div>
                        </div>

                        {/* EARN MORE SXP TODAY Section */}
                        <div className="space-y-2">
                          <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-400">
                            EARN MORE SXP TODAY
                          </span>

                          <div className="space-y-2">
                            {/* Daily Check-in Item */}
                            <div
                              onClick={handleDailyCheckIn}
                              className="rounded-xl p-3 bg-[#0a1f16] border border-[#10B981]/40 flex items-center justify-between cursor-pointer hover:bg-[#0c291d] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-md bg-[#10B981] flex items-center justify-center text-black text-[11px] font-black">
                                  ✓
                                </div>
                                <span className="text-[12.5px] font-bold text-white">Daily Check-in</span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#10B981]">+25 SXP</span>
                            </div>

                            {/* Vote in poll */}
                            <div
                              onClick={() => setModalActiveTab("brief")}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">📊</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Vote in today&apos;s poll
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#EC4899]">+15</span>
                            </div>

                            {/* Make a prediction */}
                            <div
                              onClick={() => handleOpenCreate("prediction")}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">🔮</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Make a prediction
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#EC4899]">+30</span>
                            </div>

                            {/* Create a Poll or Prediction */}
                            <div
                              onClick={() => handleOpenCreate("poll")}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">✨</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Create a Poll or Prediction
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#FBBF24]">+50</span>
                            </div>

                            {/* Post to FlipLINE */}
                            <div
                              onClick={() => {
                                setIsFullBoardOpen(false);
                                router.push("/MainModules/FlipLine");
                              }}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">⚡</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Post to FlipLINE
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#38BDF8]">+10</span>
                            </div>

                            {/* Invite a friend */}
                            <div
                              onClick={handleShareBrief}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">🤝</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Invite a friend
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#FBBF24]">+50</span>
                            </div>
                          </div>
                        </div>

                        {/* FRIENDS THIS WEEK (Leaderboard) */}
                        <div className="space-y-2 pt-2">
                          <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-400">
                            FRIENDS THIS WEEK
                          </span>

                          <div className="space-y-2">
                            {LEADERBOARD_FRIENDS.map((friend) => (
                              <div
                                key={friend.rank}
                                className={`rounded-xl p-3 flex items-center justify-between transition-all ${
                                  friend.isCurrent
                                    ? "bg-[#1f0d26] border-2 border-[#EC4899] shadow-[0_0_15px_rgba(236,72,153,0.25)]"
                                    : "bg-[#0e1220] border border-white/10 hover:bg-[#14182b]"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-[13px] font-black text-[#FBBF24] w-5">
                                    #{friend.rank}
                                  </span>
                                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[15px]">
                                    {friend.isCurrent ? "👤" : "🧑"}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[13px] font-extrabold text-white">
                                        {friend.name}
                                      </span>
                                      <span className="text-[9px] font-semibold text-gray-400">
                                        {friend.role}
                                      </span>
                                    </div>
                                    <span className="text-[10.5px] font-medium text-amber-400 flex items-center gap-1">
                                      <Flame size={10} className="fill-amber-400" />
                                      {friend.streak}d streak
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 font-black text-[13px] text-[#FBBF24]">
                                  <Zap size={13} className="fill-[#FBBF24]" />
                                  <span>{friend.isCurrent ? userSxp + 25 : friend.sxp}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom CTA Challenge button */}
                        <button
                          type="button"
                          onClick={handleShareBrief}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#EC4899]/20 via-[#F43F5E]/20 to-[#EC4899]/20 border border-[#EC4899] hover:bg-[#EC4899]/30 text-[#EC4899] hover:text-white font-extrabold text-[13px] transition-all cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.2)] flex items-center justify-center gap-2"
                        >
                          <span>🏆</span>
                          <span>Challenge a Friend to Beat Your Score</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ─────────────────────────────────────────────────────────────────────────
          ARENA ENGAGEMENT CREATION MODAL (Polls, Battles, Quizzes, Predictions)
      ───────────────────────────────────────────────────────────────────────── */}
      <ArenaEngagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialType={createInitialType}
        onToast={(msg) => showToast(msg)}
        onSaved={() => {
          showToast("🎉 Created successfully! +50 SXP earned!");
          setUserSxp((prev) => prev + 50);
        }}
      />

      {/* ─────────────────────────────────────────────────────────────────────────
          CARD DETAIL QUICK-VIEW MODAL (When tapping an individual event)
      ───────────────────────────────────────────────────────────────────────── */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedCardDetail && (
              <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
                <div className="absolute inset-0" onClick={() => setSelectedCardDetail(null)} />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="relative w-full max-w-md rounded-2xl bg-[#101423] border border-white/15 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col z-10"
                >
                  {/* Header */}
                  <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#151b2e] flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-[24px] shrink-0">{selectedCardDetail.icon || "🏆"}</span>
                      <div className="min-w-0">
                        <h4 className="text-[15px] font-black text-white truncate">
                          {selectedCardDetail.sport}
                        </h4>
                        <p className="text-[11.5px] text-gray-300 font-medium truncate">
                          {"subEvent" in selectedCardDetail
                            ? selectedCardDetail.subEvent
                            : selectedCardDetail.event}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCardDetail(null)}
                      className="w-8 h-8 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    {selectedCardDetail.venue && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-300">
                        <MapPin size={14} className="text-cyan-400 shrink-0" />
                        <span>{selectedCardDetail.venue}</span>
                      </div>
                    )}
                    {(Boolean(selectedCardDetail.time) || Boolean((selectedCardDetail as any).date)) && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-300 font-mono">
                        <Clock size={14} className="text-amber-400 shrink-0" />
                        <span>Scheduled: {formatEventDisplayDateTime((selectedCardDetail as any).date, selectedCardDetail.time, currentTime)}</span>
                      </div>
                    )}

                    {selectedCardDetail.teams && (
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[13px] font-bold text-white">
                          <span>{selectedCardDetail.teams.teamA}</span>
                          {selectedCardDetail.teams.scoreA && (
                            <span className="text-emerald-400">{selectedCardDetail.teams.scoreA}</span>
                          )}
                        </div>
                        {selectedCardDetail.teams.teamB && (
                          <div className="flex items-center justify-between text-[13px] font-bold text-gray-300">
                            <span>{selectedCardDetail.teams.teamB}</span>
                            {selectedCardDetail.teams.scoreB && (
                              <span className="text-gray-400">{selectedCardDetail.teams.scoreB}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedCardDetail.detail && (
                      <p className="text-[12.5px] text-gray-300/90 leading-relaxed">
                        {selectedCardDetail.detail}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-3.5 border-t border-white/10 bg-[#0c0f1a] flex items-center flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardDetail(null);
                        openFullModal("schedule");
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[12px] text-center cursor-pointer hover:opacity-95 transition-all min-w-[120px]"
                    >
                      View Full Schedule
                    </button>
                    {(Boolean((selectedCardDetail as any).predictId) || Boolean((selectedCardDetail as any).predictUrl)) && (
                      <button
                        type="button"
                        onClick={() => {
                          const url = (selectedCardDetail as any).predictUrl || ((selectedCardDetail as any).predictId ? `/MainModules/FlipArena?engagementId=${(selectedCardDetail as any).predictId}&type=prediction` : "/MainModules/FlipArena");
                          setSelectedCardDetail(null);
                          router.push(url);
                        }}
                        className="px-3 py-2 rounded-xl border border-[#EC4899]/70 bg-[#EC4899]/10 text-[#EC4899] hover:bg-[#EC4899]/25 font-bold text-[11.5px] transition-all cursor-pointer"
                      >
                        Predict &gt;
                      </button>
                    )}
                    {(Boolean((selectedCardDetail as any).discussPostId) || Boolean((selectedCardDetail as any).discussUrl)) && (
                      <button
                        type="button"
                        onClick={() => {
                          const url = (selectedCardDetail as any).discussUrl || ((selectedCardDetail as any).discussPostId ? `/MainModules/FlipLine?postId=${(selectedCardDetail as any).discussPostId}` : "/MainModules/FlipLine");
                          setSelectedCardDetail(null);
                          router.push(url);
                        }}
                        className="px-3 py-2 rounded-xl border border-[#3B82F6]/60 bg-[#3B82F6]/10 text-[#60A5FA] hover:bg-[#3B82F6]/25 font-bold text-[11.5px] transition-all cursor-pointer"
                      >
                        Discuss
                      </button>
                    )}
                    {(Boolean((selectedCardDetail as any).debateRoomId) || Boolean((selectedCardDetail as any).debateUrl)) && (
                      <button
                        type="button"
                        onClick={() => {
                          const url = (selectedCardDetail as any).debateUrl || ((selectedCardDetail as any).debateRoomId ? `/MainModules/WatchAlong?roomId=${(selectedCardDetail as any).debateRoomId}` : "/MainModules/WatchAlong");
                          setSelectedCardDetail(null);
                          router.push(url);
                        }}
                        className="px-3 py-2 rounded-xl border border-[#10B981]/60 bg-[#10B981]/10 text-[#34D399] hover:bg-[#10B981]/25 font-bold text-[11.5px] transition-all cursor-pointer"
                      >
                        Debate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardDetail(null);
                        setIsCreatePostDialogOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-[#F59E0B]/70 bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 font-extrabold text-[12px] transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    >
                      <span>+ Create</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* FlipLine Create Post Dialog Modal */}
      <CreatePostDialog
        isOpen={isCreatePostDialogOpen}
        onClose={() => setIsCreatePostDialogOpen(false)}
        onSubmit={handleCreateFlipLinePost}
      />
    </div>
  );
}

// Export named aliases for backward-compatibility
export { FlipBOARD as WelcomeMessage };