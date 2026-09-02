"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Poll } from "@/types/Polls";
import { EngagementItem } from "@/types/engagements";
import { engagementService } from "@/services/engagement.service";
import PollsSection from "@/src/components/Polls-component/PollsSection";
import PredictionCard from "@/src/components/Prediction-component/PredictionCard";
import ChallengesSection from "@/src/components/FanBattle-Component/Challengessection";
import FanBattleCard from "@/src/components/FanBattle-Component/Fanbattlearena";
import { ArrowLeft, Heart, Share2, Sparkles, Trophy, Check, Zap, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlipArenaProps {
  selectedSport: string;
  activeTab?: "flipline" | "fliparena";
  setActiveTab?: (tab: "flipline" | "fliparena") => void;
  isPreview?: boolean;
}

// ─── Initial Fallback Seed Engagements ──────────────────────────────────────
const FALLBACK_ENGAGEMENTS: EngagementItem[] = [];
// ─── 1. Fan Battle Card Component ───────────────────────────────────────────
function DynamicFanBattleCard({
  item,
  userId,
  onToast,
}: {
  item: EngagementItem;
  userId?: string;
  onToast: (msg: string) => void;
}) {
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);
  const [result, setResult] = useState<{
    leftPercentage: number;
    rightPercentage: number;
    totalVotes: number;
  } | null>(null);

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

  // Check like state and vote status from Database / API
  useEffect(() => {
    // Like status from DB
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    // Vote status from DB
    if (item.userVoted && item.userVote) {
      const side = item.userVote as "left" | "right";
      setSelectedSide(side);
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
    if (selectedSide || loading) return;
    setSelectedSide(side);
    setLoading(true);
    setTotalEngaged((prev) => prev + 1);

    try {
      const res: any = await engagementService.voteEngagement(item.id, side, userId);
      const calculatedResult = {
        leftPercentage: res?.leftPercentage ?? (side === "left" ? 68 : 32),
        rightPercentage: res?.rightPercentage ?? (side === "right" ? 68 : 32),
        totalVotes: res?.totalVotes ?? (left.votes + right.votes + 1),
      };
      setResult(calculatedResult);
    } catch (err: any) {
      // Handle already voted from DB or network fallback
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
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, userId);
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    setTotalEngaged((prev) => prev + 1);
    engagementService.shareEngagement(item.id).catch(() => { });

    const text = `⚔️ ${item.title} — ${left.name} vs ${right.name}! Vote now on SportsFan360.`;
    if (navigator.share) {
      navigator.share({ title: item.title, text, url: window.location.href }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      onToast("Challenge link copied to clipboard! 📋");
    }
  };

  const formattedTime = new Date(item.createdAt || Date.now()).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-lg bg-[#0e111a] border-l-2 border-[#FF3D57] border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl"
    >
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="text-[#FF3D57]">⚔️ FAN BATTLE</span>
          <span>•</span>
          <span className="text-[#FF7B02] flex items-center gap-0.5">🔥 TRENDING</span>
        </div>
        <span>{formattedTime}</span>
      </div>

      <h3 className="text-sm font-black mb-4">{item.title}</h3>

      <div className="grid grid-cols-7 items-center gap-3 mb-4">
        {/* Left Competitor */}
        <button
          onClick={() => handleVote("left")}
          disabled={loading || selectedSide !== null}
          className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${selectedSide === "left"
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
          disabled={loading || selectedSide !== null}
          className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${selectedSide === "right"
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

      {/* Challenge Button */}
      <button
        onClick={handleShare}
        className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] font-black text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer text-white/90"
      >
        <span>🫱🏼‍🫲🏾</span> Challenge a Friend
      </button>

      {/* Footer Counters */}
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
            <span>Share {sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        <span>{totalEngaged.toLocaleString()} engaged</span>
      </div>
    </motion.div>
  );
}

// ─── 2. Quiz Card Component ────────────────────────────────────────────────
function DynamicQuizCard({
  item,
  userId,
  onToast,
}: {
  item: EngagementItem;
  userId?: string;
  onToast: (msg: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctOptionId, setCorrectOptionId] = useState<string>(
    item.quizData?.correctOptionId || "C"
  );
  const [explanation, setExplanation] = useState<string>(
    item.quizData?.explanation || ""
  );
  const [pointsReward, setPointsReward] = useState<number>(
    item.quizData?.pointsReward || 50
  );

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);

  const quiz = item.quizData || {
    question: "How many Test centuries has Virat Kohli scored?",
    options: [
      { id: "A", text: "27" },
      { id: "B", text: "29" },
      { id: "C", text: "30" },
      { id: "D", text: "32" },
    ],
    correctOptionId: "C",
    pointsReward: 50,
    explanation: "Virat Kohli has scored 30 Test centuries.",
  };

  // Check like state and answered status from Database / API
  useEffect(() => {
    // Like status from DB
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    // Answer status check from DB
    if (item.userVoted && item.userVote) {
      setSelectedId(item.userVote);
      setAnswered(true);
      const isRight = item.userVote.toUpperCase() === (item.quizData?.correctOptionId || "C").toUpperCase();
      setIsCorrect(isRight);
    } else if (userId) {
      engagementService.checkVoteStatus(item.id, userId).then((res) => {
        if (res.hasVoted && res.selectedOptionId) {
          setSelectedId(res.selectedOptionId);
          setAnswered(true);
          const isRight = res.selectedOptionId.toUpperCase() === (item.quizData?.correctOptionId || "C").toUpperCase();
          setIsCorrect(isRight);
        }
      });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, item.quizData]);

  const handleOptionSelect = async (optId: string) => {
    if (answered) return;
    setSelectedId(optId);
    setAnswered(true);
    setTotalEngaged((prev) => prev + 1);

    try {
      const res: any = await engagementService.voteEngagement(item.id, optId, userId);
      const isRight = res?.isCorrect !== undefined ? res.isCorrect : (optId.toUpperCase() === quiz.correctOptionId.toUpperCase());
      setIsCorrect(isRight);
      if (res?.correctOptionId) setCorrectOptionId(res.correctOptionId);
      if (res?.explanation) setExplanation(res.explanation);
      if (res?.pointsAwarded) setPointsReward(res.pointsAwarded);
    } catch (err: any) {
      const prevOpt = err?.response?.data?.selectedOptionId || optId;
      const isRight = prevOpt.toUpperCase() === quiz.correctOptionId.toUpperCase();
      setSelectedId(prevOpt);
      setIsCorrect(isRight);
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, userId);
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    setTotalEngaged((prev) => prev + 1);
    engagementService.shareEngagement(item.id).catch(() => { });

    const text = `🧠 Cricket Quiz: "${quiz.question}" — Can you answer? Play on SportsFan360!`;
    if (navigator.share) {
      navigator.share({ title: item.title, text, url: window.location.href }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      onToast("Quiz link copied to clipboard! 📋");
    }
  };

  const formattedTime = new Date(item.createdAt || Date.now()).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-lg bg-[#0e111a] border-l-2 border-purple-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl"
    >
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <div className="flex items-center gap-1.5 uppercase">
          <span className="text-purple-400">🧠 QUIZ</span>
          <span>•</span>
          <span className="text-amber-400">⭐ {pointsReward} PTS</span>
        </div>
        <span>{formattedTime}</span>
      </div>

      <h3 className="text-sm font-black mb-1">{item.title}</h3>
      <p className="text-xs font-semibold text-white/70 mb-4">{quiz.question}</p>

      <div className="grid grid-cols-2 gap-3.5 mb-4">
        {quiz.options.map((opt) => {
          const letter = opt.id;
          const isThisCorrect = letter.toUpperCase() === correctOptionId.toUpperCase();
          const isSelected = selectedId === letter;

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
              <span>
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
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-[11px] font-black text-center p-2.5 rounded-xl border mb-2 flex items-center justify-center gap-2 ${isCorrect
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
        >
          {isCorrect ? (
            <>
              <span>🎉</span>
              <span>Correct! You earned {pointsReward} PTS!</span>
            </>
          ) : (
            <>
              <span>❌</span>
              <span>{explanation || `Incorrect. Correct answer is ${correctOptionId}`}</span>
            </>
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
            <span>Share {sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        <span>{totalEngaged.toLocaleString()} engaged</span>
      </div>
    </motion.div>
  );
}

// ─── 3. Poll Card Component ────────────────────────────────────────────────
function DynamicPollCard({
  item,
  userId,
  onToast,
}: {
  item: EngagementItem;
  userId?: string;
  onToast: (msg: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);

  const totalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0) || 1;

  // Check saved like state and voted status
  // Check like state and voted status from Database / API
  useEffect(() => {
    // Like status from DB
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    // Voted status check from DB
    if (item.userVoted && item.userVote) {
      setSelectedId(item.userVote);
      setVoted(true);
    } else if (userId) {
      engagementService.checkVoteStatus(item.id, userId).then((res) => {
        if (res.hasVoted && res.selectedOptionId) {
          setSelectedId(res.selectedOptionId);
          setVoted(true);
        }
      });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId]);

  const handleVote = async (optId: string) => {
    if (voted || loading) return;
    setSelectedId(optId);
    setVoted(true);
    setLoading(true);
    setTotalEngaged((prev) => prev + 1);

    try {
      const res: any = await engagementService.voteEngagement(item.id, optId, userId);
      if (res?.success && res.options) {
        setOptions(res.options);
      } else {
        setOptions((prev) =>
          prev.map((o) => (o.id === optId ? { ...o, votes: (o.votes || 0) + 1 } : o))
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
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, userId);
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    setTotalEngaged((prev) => prev + 1);
    engagementService.shareEngagement(item.id).catch(() => { });

    const text = `📊 Vote on this poll: "${item.pollData?.question || item.title}" on SportsFan360!`;
    if (navigator.share) {
      navigator.share({ title: item.title, text, url: window.location.href }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      onToast("Poll link copied to clipboard! 📋");
    }
  };

  const formattedTime = new Date(item.createdAt || Date.now()).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-lg bg-[#0e111a] border-l-2 border-blue-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl"
    >
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <span className="text-blue-400 uppercase font-black">📊 POLL</span>
        <span>{formattedTime}</span>
      </div>

      <h3 className="text-sm font-black mb-4">{item.pollData?.question || item.title}</h3>

      <div className="space-y-3 mb-4">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const percentage =
            opt.percentage !== undefined
              ? opt.percentage
              : Math.round(((opt.votes || 0) / totalVotes) * 100);

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={voted}
              className={`w-full relative rounded-xl border overflow-hidden p-3.5 flex items-center justify-between text-xs font-extrabold text-left transition-all cursor-pointer ${isSelected
                ? "border-blue-500/60 bg-blue-500/[0.07]"
                : "border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03]"
                }`}
            >
              {voted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute left-0 top-0 bottom-0 z-0 ${
                    isSelected ? "bg-blue-500/20" : "bg-white/[0.04]"
                    }`}
                />
              )}
              <span className="relative z-10 text-white/90 font-bold">{opt.text}</span>
              {voted && (
                <span
                  className={`relative z-10 text-[11px] font-black ${isSelected ? "text-blue-400" : "text-white/60"
                    }`}
                >
                  {percentage}% {isSelected && "✓"}
                </span>
              )}
            </button>
          );
        })}
      </div>

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
            <span>Share {sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        <span>{totalEngaged.toLocaleString()} engaged</span>
      </div>
    </motion.div>
  );
}

// ─── 4. Prediction Card Component ──────────────────────────────────────────
function DynamicPredictionCard({
  item,
  userId,
  onToast,
}: {
  item: EngagementItem;
  userId?: string;
  onToast: (msg: string) => void;
}) {
  const [selectedChoice, setSelectedChoice] = useState<"left" | "right" | null>(null);
  const [predicted, setPredicted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);
  const [result, setResult] = useState<{
    leftPercentage: number;
    rightPercentage: number;
    coinsLocked: number;
  } | null>(null);

  const pred = item.predictionData || {
    question: "India win the 1st Galle Test?",
    leftChoice: { id: "left", text: "Yes, India win", code: "IN", votes: 640 },
    rightChoice: { id: "right", text: "SL hold / win", code: "LK", votes: 260 },
    coinStake: 25,
    totalVotes: 900,
    status: "open",
  };

  // Check like state and prediction status from Database / API
  useEffect(() => {
    // Like status from DB
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    // Prediction vote check from DB
    if (item.userVoted && item.userVote) {
      const choice = item.userVote as "left" | "right";
      setSelectedChoice(choice);
      setPredicted(true);
      const computedResult = {
        leftPercentage: choice === "left" ? 71 : 29,
        rightPercentage: choice === "right" ? 71 : 29,
        coinsLocked: pred.coinStake || 25,
      };
      setResult(computedResult);
    } else if (userId) {
      engagementService.checkVoteStatus(item.id, userId).then((res) => {
        if (res.hasVoted && res.selectedOptionId) {
          const choice = res.selectedOptionId as "left" | "right";
          setSelectedChoice(choice);
          setPredicted(true);
          const computedResult = {
            leftPercentage: choice === "left" ? 71 : 29,
            rightPercentage: choice === "right" ? 71 : 29,
            coinsLocked: pred.coinStake || 25,
          };
          setResult(computedResult);
        }
      });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, pred.coinStake]);

  const handlePredict = async (choice: "left" | "right") => {
    if (predicted || loading) return;
    setSelectedChoice(choice);
    setPredicted(true);
    setLoading(true);
    setTotalEngaged((prev) => prev + 1);

    try {
      const res: any = await engagementService.voteEngagement(item.id, choice, userId);
      const computedResult = {
        leftPercentage: res?.leftPercentage ?? (choice === "left" ? 71 : 29),
        rightPercentage: res?.rightPercentage ?? (choice === "right" ? 71 : 29),
        coinsLocked: res?.coinsLocked || pred.coinStake || 25,
      };
      setResult(computedResult);
    } catch (err: any) {
      const prevChoice = (err?.response?.data?.selectedOptionId || choice) as "left" | "right";
      setSelectedChoice(prevChoice);
      setResult({
        leftPercentage: prevChoice === "left" ? 71 : 29,
        rightPercentage: prevChoice === "right" ? 71 : 29,
        coinsLocked: pred.coinStake || 25,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, userId);
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    setTotalEngaged((prev) => prev + 1);
    engagementService.shareEngagement(item.id).catch(() => { });

    const text = `🎯 Predict: "${pred.question}" on SportsFan360!`;
    if (navigator.share) {
      navigator.share({ title: item.title, text, url: window.location.href }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      onToast("Prediction link copied to clipboard! 📋");
    }
  };

  const formattedTime = new Date(item.createdAt || Date.now()).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full max-w-lg bg-[#0e111a] border-l-2 border-amber-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl"
    >
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <div className="flex items-center gap-1.5 uppercase">
          <span className="text-amber-400">🎯 PREDICTION</span>
          <span>•</span>
          <span className="text-indigo-400">💎 POINTS</span>
        </div>
        <span>{formattedTime}</span>
      </div>

      <h3 className="text-sm font-black mb-1">{item.title || "Predict the outcome!"}</h3>
      <p className="text-xs font-semibold text-white/70 mb-4">{pred.question}</p>

      <div className="grid grid-cols-2 gap-3.5 mb-4">
        {/* Left Choice */}
        <button
          onClick={() => handlePredict("left")}
          disabled={predicted}
          className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${selectedChoice === "left"
            ? "bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-400"
            : predicted
              ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
              : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white"
            }`}
        >
          <span className="text-xs font-black">{pred.leftChoice.text}</span>
          <span className="text-[10px] font-black mt-1 text-white/50">
            {result ? `${result.leftPercentage}%` : "2X multiplier"}
          </span>
        </button>

        {/* Right Choice */}
        <button
          onClick={() => handlePredict("right")}
          disabled={predicted}
          className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${
            selectedChoice === "right"
              ? "bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-400"
              : predicted
                ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white"
            }`}
        >
          <span className="text-xs font-black">{pred.rightChoice.text}</span>
          <span className="text-[10px] font-black mt-1 text-white/50">
            {result ? `${result.rightPercentage}%` : "5X multiplier"}
          </span>
        </button>
      </div>

      {predicted && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-black text-center text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl mb-2 flex items-center justify-center gap-1.5"
        >
          <span>🔒</span>
          <span>+{result?.coinsLocked || pred.coinStake || 25} FlipCoins locked in · Results after match</span>
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
            <span>Share {sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        <span>{totalEngaged.toLocaleString()} engaged</span>
      </div>
    </motion.div>
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
  const activeUserId = user?.userId || (user as any)?.actualUserId || user?.email;
  const [engagements, setEngagements] = useState<EngagementItem[]>(FALLBACK_ENGAGEMENTS);
  const [loadingEngagements, setLoadingEngagements] = useState(true);
  const [filter, setFilter] = useState<"all" | "quiz" | "poll" | "battle">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Polls & Predictions for bottom active sections
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Fetch live engagements from backend API
  const fetchEngagements = useCallback(async () => {
    setLoadingEngagements(true);
    try {
      const liveItems = await engagementService.getEngagements({
        sport: selectedSport !== "mixed" ? selectedSport : undefined,
        status: "active",
        userId: activeUserId,
      });

      if (liveItems && liveItems.length > 0) {
        setEngagements(liveItems);
      } else {
        // Keep initial fallback seed data if backend has no records yet
        setEngagements(FALLBACK_ENGAGEMENTS);
      }
    } catch (err) {
      console.warn("Could not fetch live engagements, using fallback:", err);
      setEngagements(FALLBACK_ENGAGEMENTS);
    } finally {
      setLoadingEngagements(false);
    }
  }, [selectedSport, activeUserId]);

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  // Fetch legacy polls for bottom active section
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

  const activePolls = (Array.isArray(polls) ? polls : []).filter((p) => p?.active);
  const matchGroups = activePolls.reduce<Record<string, Poll[]>>((acc, poll) => {
    const key = poll.matchId ?? "general";
    if (!acc[key]) acc[key] = [];
    acc[key].push(poll);
    return acc;
  }, {});

  const castVote = async (pollId: string, optionId: string, userId?: string) => {
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId, userId }),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? "Vote failed");
    }
  };

  // Filter engagements based on active filter tab
  const filteredEngagements = engagements.filter((item) => {
    if (filter === "all") return true;
    if (filter === "battle") return item.type === "fan_battle";
    if (filter === "quiz") return item.type === "quiz";
    if (filter === "poll") return item.type === "poll" || item.type === "prediction";
    return true;
  });

  return (
    <div className="w-full bg-[#070b14] min-h-screen text-white flex flex-col font-sans pb-12">
      {/* Toast Notification */}
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

      {/* 1. Header Bar for Full Page */}
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
                <h1 className="text-base font-black tracking-tight">Flip Arena 🏟️</h1>
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

      {/* 2. Main Toggle Button Row for Full Page */}
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
              <span className="text-sm">⚡</span> FlipLine
            </button>
            <button
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer border-none"
              style={{
                background: "linear-gradient(90deg, #FF3D57, #FF7B02)",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(255, 61, 87, 0.25)",
              }}
            >
              <span className="text-sm">🏟️</span> Flip Arena
            </button>
          </div>
        </div>
      )}

      {/* 3. Filter section "Today's Arena" */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05] mt-2">
        <div>
          <h2 className="text-base font-black tracking-tight">Today's Arena</h2>
          <p className="text-[10px] text-white/35 mt-0.5">Official SF360 events · Earn FlipCoins</p>
        </div>
        <div className="flex gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
          {(["all", "quiz", "poll", "battle"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              style={{
                backgroundColor: filter === tab ? "rgba(255,255,255,0.08)" : "transparent",
                color: filter === tab ? "#fff" : "rgba(255,255,255,0.45)",
              }}
            >
              {tab === "all" ? "All" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Engagements Feed */}
      <div className="px-4 space-y-5 mt-2 flex flex-col items-center w-full">
        {loadingEngagements && engagements.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/40 text-xs font-bold">
            <div className="w-6 h-6 border-2 border-[#FF3D57] border-t-transparent rounded-full animate-spin" />
            <span>Loading live arena battles...</span>
          </div>
        ) : filteredEngagements.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-white/40 border border-white/[0.06] rounded-2xl bg-[#0e111a] p-8 w-full max-w-lg">
            No events found for this filter. Check back shortly!
          </div>
        ) : (
              <AnimatePresence mode="popLayout">
                {filteredEngagements.map((item) => {
                  if (item.type === "fan_battle") {
                    return (
                      <DynamicFanBattleCard
                        key={item.id}
                        item={item}
                        userId={activeUserId}
                        onToast={showToast}
                      />
                    );
                  }
                  if (item.type === "quiz") {
                    return (
                      <DynamicQuizCard
                        key={item.id}
                        item={item}
                        userId={activeUserId}
                        onToast={showToast}
                      />
                    );
                  }
                  if (item.type === "poll") {
                    return (
                      <DynamicPollCard
                        key={item.id}
                        item={item}
                        userId={activeUserId}
                        onToast={showToast}
                      />
                    );
                  }
                  if (item.type === "prediction") {
                    return (
                      <DynamicPredictionCard
                        key={item.id}
                        item={item}
                        userId={activeUserId}
                        onToast={showToast}
                      />
                    );
                  }
                  return null;
                })}
          </AnimatePresence>
        )}


        {/* 6. View Full Flip Arena button in Preview mode */}
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
                View Full Flip Arena
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
    </div>
  );
}
