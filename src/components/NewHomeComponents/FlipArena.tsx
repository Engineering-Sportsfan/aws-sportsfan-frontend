"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Poll } from "@/types/Polls";
import { EngagementItem, EngagementType, QuizOption } from "@/types/engagements";
import { engagementService } from "@/services/engagement.service";
import PollsSection from "@/src/components/Polls-component/PollsSection";
import PredictionCard from "@/src/components/Prediction-component/PredictionCard";
import ChallengesSection from "@/src/components/FanBattle-Component/Challengessection";
import FanBattleCard from "@/src/components/FanBattle-Component/Fanbattlearena";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlipArenaProps {
  selectedSport: string;
  activeTab?: "flipline" | "fliparena";
  setActiveTab?: (tab: "flipline" | "fliparena") => void;
  isPreview?: boolean;
}

interface UserQuizQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOptionId: "A" | "B" | "C" | "D";
  pointsReward: number;
  explanation: string;
}

// ─── Initial Fallback Seed Engagements ──────────────────────────────────────
const FALLBACK_ENGAGEMENTS: EngagementItem[] = [];

// ─── 1. Fan Battle Card Component ───────────────────────────────────────────
function DynamicFanBattleCard({
  item,
  userId,
  onToast,
  onEdit,
}: {
  item: EngagementItem;
  userId?: string;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
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
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

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
      className="w-full max-w-lg bg-[#0e111a] border-l-2 border-[#FF3D57] border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative group"
    >
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="text-[#FF3D57]">⚔️ FAN BATTLE</span>
          <span>•</span>
          <span className="text-[#FF7B02] flex items-center gap-0.5">🔥 TRENDING</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedTime}</span>
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              title="Edit Fan Battle"
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
      </div>

      <h3 className="text-sm font-black mb-4">{item.title}</h3>

      <div className="grid grid-cols-7 items-center gap-3 mb-4">
        {/* Left Competitor */}
        <button
          onClick={() => handleVote("left")}
          disabled={loading || selectedSide !== null}
          className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${
            selectedSide === "left"
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
          className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${
            selectedSide === "right"
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
            <span>Share {sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        <span>{totalEngaged.toLocaleString()} engaged</span>
      </div>
    </motion.div>
  );
}

// ─── 2. Quiz Card Component (Multi-Question & Single-Question Supported) ───────
function DynamicQuizCard({
  item,
  userId,
  onToast,
  onEdit,
}: {
  item: EngagementItem;
  userId?: string;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
}) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);

  // Normalize questions array
  const rawQuestions =
    item.quizData?.questions && item.quizData.questions.length > 0
      ? item.quizData.questions
      : [
          {
            id: "q_1",
            question: item.quizData?.question || item.title || "Quick Live Cricket Quiz",
            options: item.quizData?.options || [
              { id: "A", text: "27" },
              { id: "B", text: "29" },
              { id: "C", text: "30" },
              { id: "D", text: "32" },
            ],
            correctOptionId: item.quizData?.correctOptionId || "C",
            pointsReward: item.quizData?.pointsReward || 50,
            explanation: item.quizData?.explanation || "Test your knowledge on SportsFan360!",
          },
        ];

  const totalQuestions = rawQuestions.length;
  const currentQ = rawQuestions[Math.min(currentQIndex, totalQuestions - 1)];
  const correctOptionId = currentQ?.correctOptionId || "A";
  const pointsReward = currentQ?.pointsReward || 50;
  const explanation = currentQ?.explanation || "";
  const frequencyMinutes = item.quizData?.frequencyMinutes || 10;

  // Check like state and answered status from Database / API
  useEffect(() => {
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    if (item.userVoted && item.userVote) {
      setSelectedId(item.userVote);
      setAnswered(true);
      const isRight = item.userVote.toUpperCase() === correctOptionId.toUpperCase();
      setIsCorrect(isRight);
    } else if (userId) {
      engagementService.checkVoteStatus(item.id, userId).then((res) => {
        if (res.hasVoted && res.selectedOptionId) {
          setSelectedId(res.selectedOptionId);
          setAnswered(true);
          const isRight = res.selectedOptionId.toUpperCase() === correctOptionId.toUpperCase();
          setIsCorrect(isRight);
        }
      });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, correctOptionId]);

  const handleOptionSelect = async (optId: string) => {
    if (answered) return;
    setSelectedId(optId);
    setAnswered(true);
    setTotalEngaged((prev) => prev + 1);

    const isRight = optId.toUpperCase() === correctOptionId.toUpperCase();
    setIsCorrect(isRight);
    if (isRight) {
      setTotalScore((prev) => prev + pointsReward);
    }

    try {
      await engagementService.voteEngagement(item.id, optId, userId, currentQ?.id);
    } catch (err: any) {
      const prevOpt = err?.response?.data?.selectedOptionId || optId;
      const right = prevOpt.toUpperCase() === correctOptionId.toUpperCase();
      setSelectedId(prevOpt);
      setIsCorrect(right);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedId(null);
      setAnswered(false);
      setIsCorrect(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIndex(0);
    setSelectedId(null);
    setAnswered(false);
    setIsCorrect(null);
    setQuizFinished(false);
    setTotalScore(0);
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

    const text = `🧠 Quiz: "${item.title}" — Can you answer all questions? Play on SportsFan360!`;
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
      className="w-full max-w-lg bg-[#0e111a] border-l-2 border-purple-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <div className="flex items-center gap-1.5 uppercase">
          <span className="text-purple-400">🧠 QUIZ</span>
          <span>•</span>
          <span className="text-amber-400">⭐ {pointsReward} PTS/Q</span>
          {frequencyMinutes && (
            <>
              <span>•</span>
              <span className="text-cyan-400">⏱️ {frequencyMinutes}M</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedTime}</span>
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              title="Edit Quiz"
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-black text-white">{item.title}</h3>
        {totalQuestions > 1 && (
          <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full shrink-0">
            Q {currentQIndex + 1}/{totalQuestions}
          </span>
        )}
      </div>

      {/* Multi-Question Progress Bar */}
      {totalQuestions > 1 && (
        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${((currentQIndex + (answered ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
      )}

      {quizFinished ? (
        /* Quiz Finished View */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center my-3"
        >
          <span className="text-2xl block mb-1">🏆</span>
          <h4 className="text-sm font-black text-white mb-1">Quiz Completed!</h4>
          <p className="text-xs text-white/70 mb-3">
            You scored <strong className="text-amber-400">+{totalScore} PTS</strong> across {totalQuestions} questions!
          </p>
          <button
            onClick={handleRestartQuiz}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={13} /> Retake Quiz
          </button>
        </motion.div>
      ) : (
        /* Active Question View */
        <>
          <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{currentQ?.question}</p>

          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            {currentQ?.options?.map((opt: QuizOption) => {
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
                  <span className="truncate pr-1">
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
              className="space-y-2 mb-3"
            >
              <div
                className={`text-[11px] font-black text-center p-2 rounded-xl border flex items-center justify-center gap-1.5 ${
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                <span>{isCorrect ? "🎉" : "💡"}</span>
                <span>{isCorrect ? `Correct! +${pointsReward} PTS` : `Incorrect! The answer is ${correctOptionId}`}</span>
              </div>

              {explanation && (
                <p className="text-[11px] text-white/60 bg-white/[0.02] border border-white/[0.04] p-2 rounded-lg leading-relaxed">
                  ℹ️ {explanation}
                </p>
              )}

              {totalQuestions > 1 && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <span>{currentQIndex < totalQuestions - 1 ? "Next Question" : "Complete Quiz"}</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </motion.div>
          )}
        </>
      )}

      {/* Footer Counters */}
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
  onEdit,
}: {
  item: EngagementItem;
  userId?: string;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
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

  useEffect(() => {
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

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
      className="w-full max-w-lg bg-[#0e111a] border-l-2 border-blue-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative"
    >
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <span className="text-blue-400 uppercase font-black">📊 POLL</span>
        <div className="flex items-center gap-2">
          <span>{formattedTime}</span>
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              title="Edit Poll"
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
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
              className={`w-full relative rounded-xl border overflow-hidden p-3.5 flex items-center justify-between text-xs font-extrabold text-left transition-all cursor-pointer ${
                isSelected
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
                  className={`relative z-10 text-[11px] font-black ${
                    isSelected ? "text-blue-400" : "text-white/60"
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
  onEdit,
}: {
  item: EngagementItem;
  userId?: string;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
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

  useEffect(() => {
    if (item.userLiked) {
      setLiked(true);
    } else if (userId) {
      engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

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
      className="w-full max-w-lg bg-[#0e111a] border-l-2 border-amber-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative"
    >
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <div className="flex items-center gap-1.5 uppercase">
          <span className="text-amber-400">🎯 PREDICTION</span>
          <span>•</span>
          <span className="text-indigo-400">💎 POINTS</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedTime}</span>
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              title="Edit Prediction"
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
      </div>

      <h3 className="text-sm font-black mb-1">{item.title || "Predict the outcome!"}</h3>
      <p className="text-xs font-semibold text-white/70 mb-4">{pred.question}</p>

      <div className="grid grid-cols-2 gap-3.5 mb-4">
        {/* Left Choice */}
        <button
          onClick={() => handlePredict("left")}
          disabled={predicted}
          className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${
            selectedChoice === "left"
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
            <span>Share {sharesCount > 0 ? `(${sharesCount})` : ""}</span>
          </button>
        </div>
        <span>{totalEngaged.toLocaleString()} engaged</span>
      </div>
    </motion.div>
  );
}

// ─── 5. Arena Event Creation & Edit Modal Component ─────────────────────────
function ArenaEngagementModal({
  isOpen,
  onClose,
  initialType = "quiz",
  editingItem = null,
  onSaved,
  onToast,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialType?: EngagementType;
  editingItem?: EngagementItem | null;
  onSaved: (item: EngagementItem, isEdit: boolean) => void;
  onToast: (msg: string) => void;
}) {
  const [activeType, setActiveType] = useState<EngagementType>(initialType);
  const [submitting, setSubmitting] = useState(false);

  // Common Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [sport, setSport] = useState("cricket");

  // Fan Battle Fields
  const [fbLeftCode, setFbLeftCode] = useState("IN");
  const [fbLeftName, setFbLeftName] = useState("");
  const [fbLeftStat, setFbLeftStat] = useState("");
  const [fbRightCode, setFbRightCode] = useState("PK");
  const [fbRightName, setFbRightName] = useState("");
  const [fbRightStat, setFbRightStat] = useState("");

  // Quiz Fields
  const [quizStartTime, setQuizStartTime] = useState("");
  const [quizFrequencyMinutes, setQuizFrequencyMinutes] = useState(10);
  const [quizQuestions, setQuizQuestions] = useState<UserQuizQuestion[]>([
    {
      id: "q_1",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOptionId: "A",
      pointsReward: 50,
      explanation: "",
    },
  ]);

  // Poll Fields
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // Prediction Fields
  const [predQuestion, setPredQuestion] = useState("");
  const [predLeftText, setPredLeftText] = useState("");
  const [predLeftCode, setPredLeftCode] = useState("IN");
  const [predRightText, setPredRightText] = useState("");
  const [predRightCode, setPredRightCode] = useState("PK");
  const [predCoinStake, setPredCoinStake] = useState(25);

  // Initialize or prefill state
  useEffect(() => {
    if (editingItem) {
      setActiveType(editingItem.type);
      setTitle(editingItem.title || "");
      setSubtitle(editingItem.subtitle || "");
      setSport(editingItem.sport || "cricket");

      if (editingItem.type === "fan_battle" && editingItem.fanBattleData) {
        setFbLeftCode(editingItem.fanBattleData.leftCompetitor.code || "IN");
        setFbLeftName(editingItem.fanBattleData.leftCompetitor.name || "");
        setFbLeftStat(editingItem.fanBattleData.leftCompetitor.stat || "");
        setFbRightCode(editingItem.fanBattleData.rightCompetitor.code || "PK");
        setFbRightName(editingItem.fanBattleData.rightCompetitor.name || "");
        setFbRightStat(editingItem.fanBattleData.rightCompetitor.stat || "");
      } else if (editingItem.type === "quiz" && editingItem.quizData) {
        if (editingItem.quizData.startTime || editingItem.quizData.scheduledStartTime) {
          try {
            const d = new Date(Number(editingItem.quizData.startTime || editingItem.quizData.scheduledStartTime));
            const pad = (n: number) => String(n).padStart(2, "0");
            setQuizStartTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
          } catch {
            setQuizStartTime("");
          }
        }
        setQuizFrequencyMinutes(editingItem.quizData.frequencyMinutes || 10);
        if (editingItem.quizData.questions && editingItem.quizData.questions.length > 0) {
          setQuizQuestions(
            editingItem.quizData.questions.map((q, idx) => ({
              id: q.id || `q_${idx + 1}`,
              question: q.question || "",
              optionA: q.options?.[0]?.text || "",
              optionB: q.options?.[1]?.text || "",
              optionC: q.options?.[2]?.text || "",
              optionD: q.options?.[3]?.text || "",
              correctOptionId: (q.correctOptionId as any) || "A",
              pointsReward: q.pointsReward || 50,
              explanation: q.explanation || "",
            }))
          );
        } else {
          setQuizQuestions([
            {
              id: "q_1",
              question: editingItem.quizData.question || editingItem.title || "",
              optionA: editingItem.quizData.options?.[0]?.text || "",
              optionB: editingItem.quizData.options?.[1]?.text || "",
              optionC: editingItem.quizData.options?.[2]?.text || "",
              optionD: editingItem.quizData.options?.[3]?.text || "",
              correctOptionId: (editingItem.quizData.correctOptionId as any) || "A",
              pointsReward: editingItem.quizData.pointsReward || 50,
              explanation: editingItem.quizData.explanation || "",
            },
          ]);
        }
      } else if (editingItem.type === "poll" && editingItem.pollData) {
        setPollQuestion(editingItem.pollData.question || editingItem.title || "");
        setPollOptions(
          editingItem.pollData.options?.length
            ? editingItem.pollData.options.map((o) => o.text)
            : ["", ""]
        );
      } else if (editingItem.type === "prediction" && editingItem.predictionData) {
        setPredQuestion(editingItem.predictionData.question || editingItem.title || "");
        setPredLeftText(editingItem.predictionData.leftChoice?.text || "");
        setPredLeftCode(editingItem.predictionData.leftChoice?.code || "IN");
        setPredRightText(editingItem.predictionData.rightChoice?.text || "");
        setPredRightCode(editingItem.predictionData.rightChoice?.code || "PK");
        setPredCoinStake(editingItem.predictionData.coinStake || 25);
      }
    } else {
      setActiveType(initialType);
      setTitle("");
      setSubtitle("");
      setSport("cricket");
      setFbLeftName("");
      setFbLeftStat("");
      setFbRightName("");
      setFbRightStat("");
      setQuizStartTime("");
      setQuizFrequencyMinutes(10);
      setQuizQuestions([
        {
          id: "q_1",
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOptionId: "A",
          pointsReward: 50,
          explanation: "",
        },
      ]);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setPredQuestion("");
      setPredLeftText("");
      setPredRightText("");
      setPredCoinStake(25);
    }
  }, [editingItem, initialType, isOpen]);

  // Quiz helper functions
  const handleAddQuizQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOptionId: "A",
        pointsReward: 50,
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuizQuestion = (index: number) => {
    if (quizQuestions.length <= 1) {
      onToast("At least one quiz question is required.");
      return;
    }
    setQuizQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuizQuestion = (index: number, field: keyof UserQuizQuestion, val: any) => {
    setQuizQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalTitle = title.trim();
      if (!finalTitle) {
        if (activeType === "quiz") finalTitle = quizQuestions[0]?.question.trim() || "Live Cricket Quiz";
        else if (activeType === "fan_battle") finalTitle = `${fbLeftName || "Player 1"} vs ${fbRightName || "Player 2"} · Vote Now!`;
        else if (activeType === "poll") finalTitle = pollQuestion.trim() || "Live Fan Poll";
        else if (activeType === "prediction") finalTitle = predQuestion.trim() || "Live Match Prediction";
      }

      let payload: any = {
        type: activeType,
        title: finalTitle,
        subtitle: subtitle.trim(),
        sport: sport.toLowerCase(),
        status: "active",
      };

      if (activeType === "fan_battle") {
        if (!fbLeftName.trim() || !fbRightName.trim()) {
          onToast("Please provide names for both competitors.");
          setSubmitting(false);
          return;
        }
        payload.tags = ["⚔️ FAN BATTLE", "🔥 TRENDING"];
        payload.fanBattleData = {
          leftCompetitor: {
            code: fbLeftCode.trim() || "IN",
            name: fbLeftName.trim(),
            stat: fbLeftStat.trim() || "Top Contender",
            votes: editingItem?.fanBattleData?.leftCompetitor?.votes || 0,
          },
          rightCompetitor: {
            code: fbRightCode.trim() || "PK",
            name: fbRightName.trim(),
            stat: fbRightStat.trim() || "Top Contender",
            votes: editingItem?.fanBattleData?.rightCompetitor?.votes || 0,
          },
          totalVotes: editingItem?.fanBattleData?.totalVotes || 0,
        };
      } else if (activeType === "quiz") {
        const validQuestions = quizQuestions.filter((q) => q.question.trim());
        if (validQuestions.length === 0) {
          onToast("Please add at least one question with text.");
          setSubmitting(false);
          return;
        }

        const startMs = quizStartTime ? new Date(quizStartTime).getTime() : Date.now();
        const formattedQuestions = validQuestions.map((q, idx) => ({
          id: q.id || `q_${idx + 1}`,
          question: q.question.trim(),
          options: [
            { id: "A", text: q.optionA.trim() || "Option A" },
            { id: "B", text: q.optionB.trim() || "Option B" },
            { id: "C", text: q.optionC.trim() || "Option C" },
            { id: "D", text: q.optionD.trim() || "Option D" },
          ],
          correctOptionId: q.correctOptionId || "A",
          pointsReward: Number(q.pointsReward) || 50,
          explanation: q.explanation.trim(),
        }));

        payload.tags = [
          "🧠 QUIZ",
          `⭐ ${formattedQuestions[0]?.pointsReward || 50} PTS/Q`,
          `⏱️ ${quizFrequencyMinutes}m`,
        ];

        payload.quizData = {
          startTime: startMs,
          scheduledStartTime: startMs,
          frequencyMinutes: Number(quizFrequencyMinutes) || 10,
          questions: formattedQuestions,
          question: formattedQuestions[0]?.question || finalTitle,
          options: formattedQuestions[0]?.options || [],
          correctOptionId: formattedQuestions[0]?.correctOptionId || "A",
          pointsReward: Number(formattedQuestions[0]?.pointsReward) || 50,
          explanation: formattedQuestions[0]?.explanation || "",
        };
      } else if (activeType === "poll") {
        const validOptions = pollOptions.filter((o) => o.trim());
        if (!pollQuestion.trim()) {
          onToast("Please enter a poll question.");
          setSubmitting(false);
          return;
        }
        if (validOptions.length < 2) {
          onToast("Please provide at least 2 options.");
          setSubmitting(false);
          return;
        }
        payload.tags = ["📊 POLL"];
        payload.pollData = {
          question: pollQuestion.trim(),
          options: validOptions.map((optText, idx) => ({
            id: String(idx + 1),
            text: optText.trim(),
            votes: editingItem?.pollData?.options?.[idx]?.votes || 0,
          })),
          totalVotes: editingItem?.pollData?.totalVotes || 0,
        };
      } else if (activeType === "prediction") {
        if (!predQuestion.trim() || !predLeftText.trim() || !predRightText.trim()) {
          onToast("Please fill in the question and both prediction choices.");
          setSubmitting(false);
          return;
        }
        payload.tags = ["🎯 PREDICTION", "💎 POINTS"];
        payload.predictionData = {
          question: predQuestion.trim(),
          leftChoice: {
            id: "left",
            text: predLeftText.trim(),
            code: predLeftCode.trim() || "IN",
            votes: editingItem?.predictionData?.leftChoice?.votes || 0,
          },
          rightChoice: {
            id: "right",
            text: predRightText.trim(),
            code: predRightCode.trim() || "PK",
            votes: editingItem?.predictionData?.rightChoice?.votes || 0,
          },
          coinStake: Number(predCoinStake) || 25,
          totalVotes: editingItem?.predictionData?.totalVotes || 0,
          status: "open",
        };
      }

      if (editingItem) {
        const res = await engagementService.updateEngagement(editingItem.id, payload);
        onSaved(res.engagement || { ...editingItem, ...payload }, true);
        onToast("Arena Event updated successfully! ✨");
      } else {
        const res = await engagementService.createEngagement(payload);
        onSaved(res.engagement, false);
        onToast("Event published to Flip Arena! 🚀");
      }
      onClose();
    } catch (err: any) {
      onToast(err.message || "Failed to save event. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle =
    "w-full bg-[#121622] border border-white/10 focus:border-purple-500/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition-all";
  const labelStyle = "block text-[11px] font-bold text-white/70 mb-1.5 uppercase tracking-wider";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="w-full max-w-xl bg-[#0d111a] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_10px_50px_rgba(0,0,0,0.85)] max-h-[90vh] flex flex-col text-white"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30">
                {activeType === "quiz" ? (
                  <HelpCircle size={18} />
                ) : activeType === "fan_battle" ? (
                  <Swords size={18} />
                ) : activeType === "poll" ? (
                  <BarChart2 size={18} />
                ) : (
                  <Target size={18} />
                )}
              </span>
              <div>
                <h2 className="text-base font-black tracking-tight">
                  {editingItem ? "Edit Arena Event" : "Create Arena Event"}
                </h2>
                <p className="text-[10px] text-white/40">
                  {editingItem ? "Update quiz questions, battles or polls" : "Engage fans with live quizzes, battles & polls"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Type Selector Tabs (Disabled if editing existing item) */}
          {!editingItem && (
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl mb-4">
              {[
                { type: "quiz", label: "Quiz", icon: "🧠" },
                { type: "fan_battle", label: "Battle", icon: "⚔️" },
                { type: "poll", label: "Poll", icon: "📊" },
                { type: "prediction", label: "Predict", icon: "🎯" },
              ].map((tab) => (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setActiveType(tab.type as EngagementType)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeType === tab.type
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Common Header Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelStyle}>Event Title / Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    activeType === "quiz"
                      ? "e.g. Test Cricket Century Masters"
                      : activeType === "fan_battle"
                      ? "e.g. Virat Kohli vs Babar Azam"
                      : activeType === "poll"
                      ? "e.g. Best Spinner in Galle?"
                      : "e.g. India win the 1st Test?"
                  }
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Sport</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className={`${inputStyle} cursor-pointer`}
                >
                  <option value="cricket" className="bg-[#121622]">🏏 Cricket</option>
                  <option value="football" className="bg-[#121622]">⚽ Football</option>
                  <option value="basketball" className="bg-[#121622]">🏀 Basketball</option>
                  <option value="tennis" className="bg-[#121622]">🎾 Tennis</option>
                  <option value="f1" className="bg-[#121622]">🏎️ Formula 1</option>
                  <option value="athletics" className="bg-[#121622]">🏃 Athletics</option>
                  <option value="general" className="bg-[#121622]">🌐 General</option>
                </select>
              </div>
            </div>

            {/* ─── QUIZ FORM TAB ─── */}
            {activeType === "quiz" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Schedule Start Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={quizStartTime}
                      onChange={(e) => setQuizStartTime(e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Frequency / Interval</label>
                    <select
                      value={quizFrequencyMinutes}
                      onChange={(e) => setQuizFrequencyMinutes(Number(e.target.value))}
                      className={`${inputStyle} cursor-pointer`}
                    >
                      <option value={5} className="bg-[#121622]">⚡ Every 5 mins</option>
                      <option value={10} className="bg-[#121622]">⏱️ Every 10 mins</option>
                      <option value={15} className="bg-[#121622]">🕐 Every 15 mins</option>
                      <option value={30} className="bg-[#121622]">⏳ Every 30 mins</option>
                      <option value={60} className="bg-[#121622]">🕒 Every 1 hour</option>
                    </select>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🧠</span> Quiz Questions ({quizQuestions.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddQuizQuestion}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-300 font-extrabold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus size={11} /> Add Question
                    </button>
                  </div>

                  {quizQuestions.map((q, qIndex) => (
                    <div
                      key={q.id || qIndex}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md">
                          Question #{qIndex + 1}
                        </span>

                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuizQuestion(qIndex)}
                            className="text-red-400/70 hover:text-red-400 p-1 transition-colors cursor-pointer"
                            title="Remove Question"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleUpdateQuizQuestion(qIndex, "question", e.target.value)}
                          placeholder="e.g. Who holds the record for the highest individual score in Test cricket?"
                          className={inputStyle}
                          required
                        />
                      </div>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {(["A", "B", "C", "D"] as const).map((letter) => {
                          const optionKey = `option${letter}` as keyof UserQuizQuestion;
                          const isCorrect = q.correctOptionId === letter;
                          return (
                            <div key={letter} className="relative">
                              <span className="absolute left-2.5 top-2.5 text-[10px] font-black text-white/40">
                                {letter}.
                              </span>
                              <input
                                type="text"
                                value={q[optionKey] as string}
                                onChange={(e) => handleUpdateQuizQuestion(qIndex, optionKey, e.target.value)}
                                placeholder={`Option ${letter}`}
                                className={`${inputStyle} pl-7 pr-8 ${
                                  isCorrect ? "border-emerald-500/80 bg-emerald-500/[0.05]" : ""
                                }`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateQuizQuestion(qIndex, "correctOptionId", letter)}
                                title={`Set ${letter} as correct answer`}
                                className={`absolute right-2 top-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all cursor-pointer ${
                                  isCorrect
                                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/40"
                                    : "bg-white/[0.08] text-white/40 hover:text-white"
                                }`}
                              >
                                {isCorrect ? "✓" : letter}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="col-span-1">
                          <label className="text-[9px] font-bold text-white/50 uppercase block mb-1">
                            Reward Points
                          </label>
                          <input
                            type="number"
                            value={q.pointsReward}
                            onChange={(e) => handleUpdateQuizQuestion(qIndex, "pointsReward", Number(e.target.value))}
                            className={inputStyle}
                            min={10}
                            step={10}
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="text-[9px] font-bold text-white/50 uppercase block mb-1">
                            Explanation / Fun Fact (Optional)
                          </label>
                          <input
                            type="text"
                            value={q.explanation}
                            onChange={(e) => handleUpdateQuizQuestion(qIndex, "explanation", e.target.value)}
                            placeholder="e.g. Brian Lara scored 400* vs England in 2004."
                            className={inputStyle}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── FAN BATTLE FORM TAB ─── */}
            {activeType === "fan_battle" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Left Competitor */}
                  <div className="p-3.5 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20 space-y-2.5">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block">
                      🔴 Competitor 1 (Left)
                    </span>
                    <div>
                      <label className="text-[9px] font-bold text-white/50 block mb-1">Name</label>
                      <input
                        type="text"
                        value={fbLeftName}
                        onChange={(e) => setFbLeftName(e.target.value)}
                        placeholder="e.g. Virat Kohli"
                        className={inputStyle}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[9px] font-bold text-white/50 block mb-1">Code</label>
                        <input
                          type="text"
                          value={fbLeftCode}
                          onChange={(e) => setFbLeftCode(e.target.value.toUpperCase())}
                          placeholder="IN"
                          className={inputStyle}
                          maxLength={5}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-bold text-white/50 block mb-1">Key Stat</label>
                        <input
                          type="text"
                          value={fbLeftStat}
                          onChange={(e) => setFbLeftStat(e.target.value)}
                          placeholder="Avg 58.6 in Tests"
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Competitor */}
                  <div className="p-3.5 rounded-2xl bg-orange-500/[0.03] border border-orange-500/20 space-y-2.5">
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider block">
                      🟠 Competitor 2 (Right)
                    </span>
                    <div>
                      <label className="text-[9px] font-bold text-white/50 block mb-1">Name</label>
                      <input
                        type="text"
                        value={fbRightName}
                        onChange={(e) => setFbRightName(e.target.value)}
                        placeholder="e.g. Babar Azam"
                        className={inputStyle}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[9px] font-bold text-white/50 block mb-1">Code</label>
                        <input
                          type="text"
                          value={fbRightCode}
                          onChange={(e) => setFbRightCode(e.target.value.toUpperCase())}
                          placeholder="PK"
                          className={inputStyle}
                          maxLength={5}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-bold text-white/50 block mb-1">Key Stat</label>
                        <input
                          type="text"
                          value={fbRightStat}
                          onChange={(e) => setFbRightStat(e.target.value)}
                          placeholder="Avg 44.8 in Tests"
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── POLL FORM TAB ─── */}
            {activeType === "poll" && (
              <div className="space-y-3.5">
                <div>
                  <label className={labelStyle}>Poll Question</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="e.g. Which bowler takes the most wickets in this match?"
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={labelStyle}>Poll Options ({pollOptions.length})</label>
                    <button
                      type="button"
                      onClick={() => setPollOptions((prev) => [...prev, ""])}
                      className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={11} /> Add Option
                    </button>
                  </div>

                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white/40 w-4 text-center">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPollOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className={inputStyle}
                        required
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-400/60 hover:text-red-400 p-1.5 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── PREDICTION FORM TAB ─── */}
            {activeType === "prediction" && (
              <div className="space-y-3.5">
                <div>
                  <label className={labelStyle}>Prediction Question</label>
                  <input
                    type="text"
                    value={predQuestion}
                    onChange={(e) => setPredQuestion(e.target.value)}
                    placeholder="e.g. Will India score 350+ in the first innings?"
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-black text-amber-400 block uppercase">
                      Option A (Left Choice)
                    </span>
                    <input
                      type="text"
                      value={predLeftText}
                      onChange={(e) => setPredLeftText(e.target.value)}
                      placeholder="e.g. Yes, India win"
                      className={inputStyle}
                      required
                    />
                    <input
                      type="text"
                      value={predLeftCode}
                      onChange={(e) => setPredLeftCode(e.target.value.toUpperCase())}
                      placeholder="Code (e.g. IN)"
                      className={inputStyle}
                      maxLength={5}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-black text-amber-400 block uppercase">
                      Option B (Right Choice)
                    </span>
                    <input
                      type="text"
                      value={predRightText}
                      onChange={(e) => setPredRightText(e.target.value)}
                      placeholder="e.g. SL hold / win"
                      className={inputStyle}
                      required
                    />
                    <input
                      type="text"
                      value={predRightCode}
                      onChange={(e) => setPredRightCode(e.target.value.toUpperCase())}
                      placeholder="Code (e.g. LK)"
                      className={inputStyle}
                      maxLength={5}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>FlipCoins Stake</label>
                  <div className="flex gap-2">
                    {[10, 25, 50, 100].map((stake) => (
                      <button
                        key={stake}
                        type="button"
                        onClick={() => setPredCoinStake(stake)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          predCoinStake === stake
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        💎 {stake}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit / Cancel Buttons */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white font-extrabold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-[#FF7B02] to-purple-600 hover:opacity-95 text-white font-black text-xs transition-all shadow-lg shadow-pink-500/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>{editingItem ? "Update Event" : "Publish to Arena"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
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
  const activeUserId = user?.userId || (user as any)?.actualUserId || user?.email;
  const [engagements, setEngagements] = useState<EngagementItem[]>(FALLBACK_ENGAGEMENTS);
  const [loadingEngagements, setLoadingEngagements] = useState(true);
  const [filter, setFilter] = useState<"all" | "quiz" | "poll" | "battle">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for user Create / Edit feature
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<EngagementType>("quiz");
  const [editingItem, setEditingItem] = useState<EngagementItem | null>(null);

  // Polls & Predictions for bottom active sections
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const isFetchingEngagementsRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  // Fetch live engagements from backend API
  const fetchEngagements = useCallback(async () => {
    if (isFetchingEngagementsRef.current || Date.now() - lastFetchTimeRef.current < 4000) {
      return;
    }
    isFetchingEngagementsRef.current = true;
    lastFetchTimeRef.current = Date.now();
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
        setEngagements(FALLBACK_ENGAGEMENTS);
      }
    } catch (err) {
      console.warn("Could not fetch live engagements, using fallback:", err);
      setEngagements(FALLBACK_ENGAGEMENTS);
    } finally {
      setLoadingEngagements(false);
      isFetchingEngagementsRef.current = false;
    }
  }, [selectedSport, activeUserId]);

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  // Open Create Modal
  const handleOpenCreate = (type: EngagementType = "quiz") => {
    setEditingItem(null);
    setModalType(type);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: EngagementItem) => {
    setEditingItem(item);
    setModalType(item.type);
    setModalOpen(true);
  };

  // Callback when item is created or updated
  const handleItemSaved = (savedItem: EngagementItem, isEdit: boolean) => {
    setEngagements((prev) => {
      if (isEdit) {
        return prev.map((it) => (it.id === savedItem.id ? savedItem : it));
      }
      return [savedItem, ...prev];
    });
    // Invalidate short-term cache and refetch
    engagementService.invalidateCache();
    fetchEngagements();
  };

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

  // Filter and sort engagements chronologically (latest on top)
  const filteredEngagements = [...engagements]
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "battle") return item.type === "fan_battle";
      if (filter === "quiz") return item.type === "quiz";
      if (filter === "poll") return item.type === "poll" || item.type === "prediction";
      return true;
    })
    .sort((a, b) => {
      const timeA = typeof a.createdAt === "number" ? a.createdAt : new Date(a.createdAt || 0).getTime();
      const timeB = typeof b.createdAt === "number" ? b.createdAt : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

  return (
    <div className="w-full bg-[#070b14] min-h-screen text-white flex flex-col font-sans pb-16 relative">
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

          {/* Header Action Button to Add/Create Engagement */}
          <button
            onClick={() => handleOpenCreate("quiz")}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-pink-500/20 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.6} />
            <span>Create Event</span>
          </button>
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

      {/* 3. Filter section "Today's Arena" + Create Button */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05] mt-2 gap-2 flex-wrap">
        <div>
          <h2 className="text-base font-black tracking-tight">Today's Arena</h2>
          <p className="text-[10px] text-white/35 mt-0.5">Official SF360 events · Earn FlipCoins</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
            {(["all", "quiz", "poll", "battle"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                style={{
                  backgroundColor: filter === tab ? "rgba(255,255,255,0.08)" : "transparent",
                  color: filter === tab ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              >
                {tab === "all" ? "All" : tab}
              </button>
            ))}
          </div>

          {/* Quick Create Event Icon Button */}
          <button
            onClick={() => handleOpenCreate("quiz")}
            title="Create Quiz, Battle or Poll"
            className="p-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 text-pink-300 flex items-center gap-1 font-extrabold text-[11px] transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus size={13} strokeWidth={2.8} />
            <span className="hidden sm:inline">Add</span>
          </button>
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
          <div className="py-12 text-center text-xs font-bold text-white/40 border border-white/[0.06] rounded-2xl bg-[#0e111a] p-8 w-full max-w-lg space-y-3">
            <p>No events found for this filter.</p>
            <button
              onClick={() => handleOpenCreate(filter === "all" ? "quiz" : filter === "battle" ? "fan_battle" : filter)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-pink-500/20 cursor-pointer"
            >
              <Plus size={13} /> Create First {filter === "all" ? "Event" : filter.toUpperCase()}
            </button>
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
                    onEdit={handleOpenEdit}
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
                    onEdit={handleOpenEdit}
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
                    onEdit={handleOpenEdit}
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
                    onEdit={handleOpenEdit}
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

      {/* Floating Action Button (FAB) for Creating Events */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => handleOpenCreate("quiz")}
        title="Create Arena Event"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#FF3D57] via-[#FF7B02] to-[#8957e5] text-white p-3.5 rounded-full shadow-[0_4px_25px_rgba(255,61,87,0.5)] border border-white/20 flex items-center justify-center gap-2 cursor-pointer font-black text-xs"
      >
        <Plus size={18} strokeWidth={2.8} />
        <span className="hidden sm:inline font-black tracking-wide pr-1">Create Event</span>
      </motion.button>

      {/* Creation & Edit Modal */}
      <ArenaEngagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={modalType}
        editingItem={editingItem}
        onSaved={handleItemSaved}
        onToast={showToast}
      />
    </div>
  );
}
