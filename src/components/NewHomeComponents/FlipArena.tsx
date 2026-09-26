// "use client";

// import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { Poll } from "@/types/Polls";
// import { EngagementItem, EngagementType, QuizOption, MemeReactionType } from "@/types/engagements";
// import { engagementService } from "@/services/engagement.service";
// import {
//   ArrowLeft,
//   Heart,
//   Share2,
//   Sparkles,
//   Trophy,
//   Check,
//   Zap,
//   CheckCircle2,
//   XCircle,
//   Plus,
//   Pencil,
//   Trash2,
//   Clock,
//   Swords,
//   HelpCircle,
//   BarChart2,
//   Target,
//   ChevronRight,
//   X,
//   RefreshCw,
//   Lock,
//   Flame,
//   MessageCircle,
//   MoreVertical,
//   Info,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import LeaderboardOverlayModal from "@/src/components/NewHomeComponents/LeaderboardOverlayModal";
// import ArenaEngagementModal from "./ArenaEngagementModal";

// // ─── Standard Points Constants ──────────────────────────────────────────────
// const PARTICIPATION_POINTS = 2; // Every section awards +2 PTS for participation
// const CORRECT_OPTION_BONUS = 10; // Quiz, Poll, Prediction correct answer awards +10 PTS bonus

// interface FlipArenaProps {
//   selectedSport: string;
//   activeTab?: "flipline" | "fliparena";
//   setActiveTab?: (tab: "flipline" | "fliparena") => void;
//   isPreview?: boolean;
// }

// // ─── Time Helper Utilities ──────────────────────────────────────────────────
// function formatCountdown(ms: number): string {
//   if (ms <= 0) return "00:00";
//   const totalSecs = Math.floor(ms / 1000);
//   const hours = Math.floor(totalSecs / 3600);
//   const mins = Math.floor((totalSecs % 3600) / 60);
//   const secs = totalSecs % 60;
//   if (hours > 0) {
//     return `${hours}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
//   }
//   return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
// }

// function getEngagementStartTime(item: EngagementItem): number {
//   return Number(
//     item.quizData?.startTime ||
//     item.quizData?.scheduledStartTime ||
//     item.pollData?.startTime ||
//     item.pollData?.scheduledStartTime ||
//     item.predictionData?.startTime ||
//     item.predictionData?.scheduledStartTime ||
//     item.fanBattleData?.startTime ||
//     item.fanBattleData?.scheduledStartTime ||
//     item.startTime ||
//     item.scheduledStartTime ||
//     item.createdAt ||
//     0
//   );
// }

// // ─── Single-Vote Local Persistence Helpers ──────────────────────────────────
// function getStoredVote(type: string, itemId: string, userId?: string): any {
//   if (typeof window === "undefined") return null;
//   try {
//     if (userId) {
//       const u = localStorage.getItem(`sf_${type}_voted_${itemId}_${userId}`);
//       if (u) return JSON.parse(u);
//     }
//     const d = localStorage.getItem(`sf_${type}_voted_${itemId}`);
//     if (d) return JSON.parse(d);
//   } catch { }
//   return null;
// }

// function setStoredVote(type: string, itemId: string, data: any, userId?: string) {
//   if (typeof window === "undefined") return;
//   try {
//     const serialized = JSON.stringify(data);
//     localStorage.setItem(`sf_${type}_voted_${itemId}`, serialized);
//     if (userId) {
//       localStorage.setItem(`sf_${type}_voted_${itemId}_${userId}`, serialized);
//     }
//   } catch { }
// }

// // ─── Direct Engagement Share URL Generator ───────────────────────────────────
// function getEngagementShareUrl(item: EngagementItem): string {
//   if (typeof window === "undefined") return "";
//   const origin = window.location.origin;
//   const itemType = item.type || "quiz";
//   return `${origin}/MainModules/FlipArena?itemId=${encodeURIComponent(item.id)}&type=${encodeURIComponent(itemType)}`;
// }

// // ─── 1. Fan Battle Card Component (+2 PTS Participation) ────────────────────
// function DynamicFanBattleCard({
//   item,
//   userId,
//   now,
//   onToast,
//   onEdit,
//   isHighlighted = false,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//     isHighlighted?: boolean;
// }) {
//   const initialStored = getStoredVote("fb", item.id, userId);
//   const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(
//     initialStored?.side || (item.userVote as "left" | "right") || null
//   );
//   const [loading, setLoading] = useState(false);
//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
//   const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
//   const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);

//   const left = item.fanBattleData?.leftCompetitor || {
//     code: "IN",
//     name: "Virat Kohli",
//     stat: "Avg 58.6 in Tests",
//     votes: 0,
//   };

//   const right = item.fanBattleData?.rightCompetitor || {
//     code: "PK",
//     name: "Babar Azam",
//     stat: "Avg 44.8 in Tests",
//     votes: 0,
//   };

//   const [result, setResult] = useState<{
//     leftPercentage: number;
//     rightPercentage: number;
//     totalVotes: number;
//   } | null>(() => {
//     const s = initialStored?.side || (item.userVote as "left" | "right");
//     if (!s) return null;
//     const lVotes = left.votes || 0;
//     const rVotes = right.votes || 0;
//     const total = lVotes + rVotes + 1;
//     const leftV = lVotes + (s === "left" ? 1 : 0);
//     const leftPct = Math.round((leftV / total) * 100);
//     return {
//       leftPercentage: leftPct,
//       rightPercentage: 100 - leftPct,
//       totalVotes: total,
//     };
//   });

//   const startTime = getEngagementStartTime(item);
//   const isScheduled = startTime > now;
//   const timeToStartMs = Math.max(0, startTime - now);

//   useEffect(() => {
//     if (item.userLiked) {
//       setLiked(true);
//     } else if (userId) {
//       engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
//         if (isLiked) setLiked(true);
//       });
//     }

//     const stored = getStoredVote("fb", item.id, userId);
//     if (stored?.side) {
//       setSelectedSide(stored.side);
//       const total = (left.votes || 0) + (right.votes || 0) || 1;
//       const leftV = (left.votes || 0) + (stored.side === "left" ? 1 : 0);
//       const leftPct = Math.round((leftV / total) * 100);
//       setResult({
//         leftPercentage: leftPct,
//         rightPercentage: 100 - leftPct,
//         totalVotes: total,
//       });
//     }

//     if (item.userVoted && item.userVote) {
//       const side = item.userVote as "left" | "right";
//       setSelectedSide(side);
//       setStoredVote("fb", item.id, { side }, userId);
//       const total = (left.votes || 0) + (right.votes || 0) || 1;
//       const leftPct = Math.round(((left.votes || 0) / total) * 100);
//       setResult({
//         leftPercentage: leftPct,
//         rightPercentage: 100 - leftPct,
//         totalVotes: total,
//       });
//     } else if (userId) {
//       engagementService.checkVoteStatus(item.id, userId).then((res) => {
//         if (res.hasVoted && res.selectedOptionId) {
//           const side = res.selectedOptionId as "left" | "right";
//           setSelectedSide(side);
//           setStoredVote("fb", item.id, { side }, userId);
//           const total = (left.votes || 0) + (right.votes || 0) || 1;
//           const leftPct = Math.round(((left.votes || 0) / total) * 100);
//           setResult({
//             leftPercentage: leftPct,
//             rightPercentage: 100 - leftPct,
//             totalVotes: total,
//           });
//         }
//       });
//     }
//   }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, left.votes, right.votes]);

//   const handleVote = async (side: "left" | "right") => {
//     if (isScheduled) {
//       onToast(`This battle starts in ${formatCountdown(timeToStartMs)}!`);
//       return;
//     }
//     if (selectedSide || loading || getStoredVote("fb", item.id, userId)) {
//       onToast("You have already voted in this battle!");
//       return;
//     }
//     setSelectedSide(side);
//     setLoading(true);
//     setStoredVote("fb", item.id, { side }, userId);
//     setTotalEngaged((prev) => prev + 1);

//     try {
//       const res: any = await engagementService.voteEngagement(item.id, side, userId);
//       const calculatedResult = {
//         leftPercentage: res?.leftPercentage ?? (side === "left" ? 68 : 32),
//         rightPercentage: res?.rightPercentage ?? (side === "right" ? 68 : 32),
//         totalVotes: res?.totalVotes ?? (left.votes + right.votes + 1),
//       };
//       setResult(calculatedResult);
//       onToast(`+${PARTICIPATION_POINTS} PTS earned for voting in Fan Battle! ⚔️`);
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
//         );
//       }
//     } catch (err: any) {
//       const prevOption = (err?.response?.data?.selectedOptionId || side) as "left" | "right";
//       const total = (left.votes || 0) + (right.votes || 0) + 1;
//       const leftV = (left.votes || 0) + (prevOption === "left" ? 1 : 0);
//       const leftPct = Math.round((leftV / total) * 100);
//       setSelectedSide(prevOption);
//       setResult({
//         leftPercentage: leftPct,
//         rightPercentage: 100 - leftPct,
//         totalVotes: total,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, userId);
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
//     setTotalEngaged((prev) => prev + 1);
//     engagementService.shareEngagement(item.id).catch(() => { });

//     const shareUrl = getEngagementShareUrl(item);
//     const text = `⚔️ ${item.title} — ${left.name} vs ${right.name}! Vote now on SportsFan360:`;
//     if (navigator.share) {
//       navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
//     } else {
//       await navigator.clipboard.writeText(shareUrl);
//       onToast("Challenge link copied to clipboard! 📋");
//     }
//   };

//   const formattedTime = new Date(item.createdAt || Date.now()).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return (
//     <motion.div
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-[#FF3D57] border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative group transition-all duration-300 ${isHighlighted
//           ? "ring-2 ring-[#FF3D57] shadow-[0_0_35px_rgba(255,61,87,0.35)] scale-[1.01]"
//           : ""
//         }`}
//     >
//       {isHighlighted && (
//         <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-[#FF3D57]/20 to-orange-500/20 border border-[#FF3D57]/40 text-[10px] font-black text-rose-300 flex items-center justify-between">
//           <span className="flex items-center gap-1.5">
//             <Sparkles size={11} className="text-[#FF3D57] animate-pulse" />
//             <span>SHARED BATTLE</span>
//           </span>
//           <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
//         </div>
//       )}
//       <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 uppercase tracking-wider">
//         <div className="flex items-center gap-1.5">
//           <span className="text-[#FF3D57]">⚔️ FAN BATTLE</span>
//           <span>•</span>
//           <span className="text-[#FF7B02] flex items-center gap-0.5">🔥 +2 PTS / VOTE</span>
//           {isScheduled && (
//             <>
//               <span>•</span>
//               <span className="text-amber-400 flex items-center gap-1 font-mono">
//                 <Clock size={10} /> STARTS IN {formatCountdown(timeToStartMs)}
//               </span>
//             </>
//           )}
//         </div>
//         <div className="flex items-center gap-2">
//           <span>{formattedTime}</span>
//         </div>
//       </div>

//       <h3 className="text-sm font-black mb-4">{item.title}</h3>

//       {isScheduled && (
//         <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 text-xs font-black text-amber-300">
//           <Lock size={13} />
//           <span>Event scheduled · Voting opens in {formatCountdown(timeToStartMs)}</span>
//         </div>
//       )}

//       <div className="grid grid-cols-7 items-center gap-3 mb-4">
//         {/* Left Competitor */}
//         <button
//           onClick={() => handleVote("left")}
//           disabled={loading || selectedSide !== null || isScheduled}
//           className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${
//             isScheduled
//               ? "opacity-50 cursor-not-allowed bg-white/[0.01] border-white/[0.05]"
//               : selectedSide === "left"
//               ? "bg-[#FF3D57]/10 border-[#FF3D57] shadow-[0_0_15px_rgba(255,61,87,0.15)]"
//               : selectedSide === "right"
//               ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
//               : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] active:scale-[0.98]"
//           }`}
//         >
//           <span className="text-2xl font-black block">{left.code}</span>
//           <span className="text-xs font-black block mt-2 text-white">{left.name}</span>
//           <span className="text-[9px] text-white/40 block mt-1 font-semibold">{left.stat}</span>
//           {result && (
//             <motion.span
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               className="text-xs font-black block mt-2 text-[#FF3D57]"
//             >
//               {result.leftPercentage}% Voted {selectedSide === "left" && "✓"}
//             </motion.span>
//           )}
//         </button>

//         {/* VS Badge */}
//         <div className="col-span-1 flex items-center justify-center">
//           <span className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] font-black text-white/50 flex items-center justify-center">
//             VS
//           </span>
//         </div>

//         {/* Right Competitor */}
//         <button
//           onClick={() => handleVote("right")}
//           disabled={loading || selectedSide !== null || isScheduled}
//           className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${
//             isScheduled
//               ? "opacity-50 cursor-not-allowed bg-white/[0.01] border-white/[0.05]"
//               : selectedSide === "right"
//               ? "bg-[#FF7B02]/10 border-[#FF7B02] shadow-[0_0_15px_rgba(255,123,2,0.15)]"
//               : selectedSide === "left"
//               ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
//               : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] active:scale-[0.98]"
//           }`}
//         >
//           <span className="text-2xl font-black block">{right.code}</span>
//           <span className="text-xs font-black block mt-2 text-white">{right.name}</span>
//           <span className="text-[9px] text-white/40 block mt-1 font-semibold">{right.stat}</span>
//           {result && (
//             <motion.span
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               className="text-xs font-black block mt-2 text-[#FF7B02]"
//             >
//               {result.rightPercentage}% Voted {selectedSide === "right" && "✓"}
//             </motion.span>
//           )}
//         </button>
//       </div>

//       <button
//         onClick={handleShare}
//         className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] font-black text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer text-white/90"
//       >
//         <span>🫱🏼🫲🏾</span> Challenge a Friend
//       </button>

//       <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
//         <div className="flex gap-4">
//           <button
//             onClick={handleLike}
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${
//               liked ? "text-[#FF3D57]" : "hover:text-white"
//             }`}
//           >
//             <Heart size={13} fill={liked ? "currentColor" : "none"} />
//             <span>{likesCount.toLocaleString()}</span>
//           </button>
//           <button
//             onClick={handleShare}
//             className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
//           >
//             <Share2 size={13} />
//             <span>{sharesCount > 0 ? `(${sharesCount})` : ""}</span>
//           </button>
//         </div>
//         <span>{totalEngaged.toLocaleString()} engaged</span>
//       </div>
//     </motion.div>
//   );
// }

// // ─── 2. Quiz Card Component (+2 PTS Participation, +10 PTS Correct) ────────
// function DynamicQuizCard({
//   item,
//   userId,
//   now,
//   onToast,
//   onEdit,
//   isHighlighted = false,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//     isHighlighted?: boolean;
// }) {
//   const rawQuestions =
//     item.quizData?.questions && item.quizData.questions.length > 0
//       ? item.quizData.questions
//       : [
//           {
//             id: "q_1",
//             question: item.quizData?.question || item.title || "Live Cricket Quiz",
//             options: item.quizData?.options || [
//               { id: "A", text: "Option A" },
//               { id: "B", text: "Option B" },
//               { id: "C", text: "Option C" },
//               { id: "D", text: "Option D" },
//             ],
//             correctOptionId: item.quizData?.correctOptionId || "A",
//             explanation: item.quizData?.explanation || "SportsFan360 Quiz",
//           },
//         ];

//   const totalQuestions = rawQuestions.length;

//   const initialFinish = getStoredVote("quiz_finish", item.id, userId);
//   const [quizFinished, setQuizFinished] = useState<boolean>(Boolean(initialFinish?.finished));
//   const [totalScore, setTotalScore] = useState<number>(Number(initialFinish?.score) || 0);

//   const [currentQIndex, setCurrentQIndex] = useState(0);
//   const currentQ = rawQuestions[Math.min(currentQIndex, totalQuestions - 1)];
//   const correctOptionId = currentQ?.correctOptionId || "A";
//   const frequencyMinutes = Number(item.quizData?.frequencyMinutes || 10);
//   const frequencyMs = frequencyMinutes * 60 * 1000;

//   // Key uniquely per question ID to avoid state leaks
//   const currentQKey = `quiz_q_${currentQ?.id || currentQIndex}`;
//   const initialQ = getStoredVote(currentQKey, item.id, userId);

//   const [selectedId, setSelectedId] = useState<string | null>(
//     initialQ?.selectedId || (item.userVoted && item.userVote ? item.userVote : null)
//   );
//   const [answered, setAnswered] = useState<boolean>(Boolean(initialQ || (totalQuestions === 1 && item.userVoted)));
//   const [isCorrect, setIsCorrect] = useState<boolean | null>(
//     initialQ
//       ? initialQ.isCorrect
//       : item.userVoted && item.userVote
//       ? item.userVote.toUpperCase() === correctOptionId.toUpperCase()
//       : null
//   );

//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
//   const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
//   const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);

//   const startTime = getEngagementStartTime(item);
//   const isScheduled = startTime > now;
//   const timeToStartMs = Math.max(0, startTime - now);

//   const elapsedSinceStart = Math.max(0, now - startTime);
//   const unlockedQuestionCount = isScheduled
//     ? 0
//     : Math.min(totalQuestions, Math.floor(elapsedSinceStart / frequencyMs) + 1);
//   const msToNextQuestionSlot = isScheduled ? 0 : Math.max(0, frequencyMs - (elapsedSinceStart % frequencyMs));
//   const isNextQuestionLocked =
//     answered && currentQIndex + 1 >= unlockedQuestionCount && currentQIndex + 1 < totalQuestions;

//   useEffect(() => {
//     if (item.userLiked) {
//       setLiked(true);
//     } else if (userId) {
//       engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
//         if (isLiked) setLiked(true);
//       });
//     }

//     const finish = getStoredVote("quiz_finish", item.id, userId);
//     if (finish?.finished) {
//       setQuizFinished(true);
//       if (finish.score !== undefined) setTotalScore(Number(finish.score));
//     }

//     const qKey = `quiz_q_${currentQ?.id || currentQIndex}`;
//     const ans = getStoredVote(qKey, item.id, userId);
//     if (ans) {
//       setSelectedId(ans.selectedId);
//       setAnswered(true);
//       setIsCorrect(
//         ans.isCorrect !== undefined
//           ? ans.isCorrect
//           : ans.selectedId?.toUpperCase() === correctOptionId.toUpperCase()
//       );
//     } else if (totalQuestions === 1 && item.userVoted && item.userVote) {
//       setSelectedId(item.userVote);
//       setAnswered(true);
//       const isRight = item.userVote.toUpperCase() === correctOptionId.toUpperCase();
//       setIsCorrect(isRight);
//       setStoredVote(qKey, item.id, { selectedId: item.userVote, isCorrect: isRight }, userId);
//     }
//   }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, correctOptionId, currentQ?.id, currentQIndex, totalQuestions]);

//   const handleOptionSelect = async (optId: string) => {
//     if (answered || isScheduled) return;
//     const qKey = `quiz_q_${currentQ?.id || currentQIndex}`;
//     const existing = getStoredVote(qKey, item.id, userId);
//     if (existing) return;

//     setSelectedId(optId);
//     setAnswered(true);
//     setTotalEngaged((prev) => prev + 1);

//     const isRight = optId.toUpperCase() === correctOptionId.toUpperCase();
//     setIsCorrect(isRight);

//     // Rule: +2 PTS for participation, +10 PTS bonus if correct option is chosen
//     const earnedPoints = isRight ? PARTICIPATION_POINTS + CORRECT_OPTION_BONUS : PARTICIPATION_POINTS;
//     const nextTotal = totalScore + earnedPoints;
//     setTotalScore(nextTotal);

//     setStoredVote(
//       qKey,
//       item.id,
//       { selectedId: optId, isCorrect: isRight, earnedPoints },
//       userId
//     );

//     if (totalQuestions === 1 || currentQIndex === totalQuestions - 1) {
//       setQuizFinished(true);
//       setStoredVote("quiz_finish", item.id, { finished: true, score: nextTotal }, userId);
//     }

//     try {
//       await engagementService.voteEngagement(item.id, optId, userId, currentQ?.id);
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: earnedPoints } })
//         );
//       }
//       if (isRight) {
//         onToast(`🎉 Correct! +${CORRECT_OPTION_BONUS} PTS Bonus (+${earnedPoints} PTS Total)`);
//       } else {
//         onToast(`💡 +${PARTICIPATION_POINTS} PTS for participating!`);
//       }
//     } catch (err: any) {
//       const prevOpt = err?.response?.data?.selectedOptionId || optId;
//       const right = prevOpt.toUpperCase() === correctOptionId.toUpperCase();
//       setSelectedId(prevOpt);
//       setIsCorrect(right);
//     }
//   };

//   const handleNextQuestion = () => {
//     if (isNextQuestionLocked) {
//       onToast(`Next question unlocks in ${formatCountdown(msToNextQuestionSlot)}!`);
//       return;
//     }
//     if (currentQIndex < totalQuestions - 1) {
//       const nextIdx = currentQIndex + 1;
//       setCurrentQIndex(nextIdx);
//       const nextQ = rawQuestions[nextIdx];
//       const ans = getStoredVote(`quiz_q_${nextQ?.id || nextIdx}`, item.id, userId);
//       if (ans) {
//         setSelectedId(ans.selectedId);
//         setAnswered(true);
//         setIsCorrect(ans.isCorrect);
//       } else {
//         setSelectedId(null);
//         setAnswered(false);
//         setIsCorrect(null);
//       }
//     } else {
//       setQuizFinished(true);
//       setStoredVote("quiz_finish", item.id, { finished: true, score: totalScore }, userId);
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, userId);
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
//     setTotalEngaged((prev) => prev + 1);
//     engagementService.shareEngagement(item.id).catch(() => { });

//     const shareUrl = getEngagementShareUrl(item);
//     const text = `🧠 Quiz: "${item.title}" — Can you answer all questions? Play on SportsFan360:`;
//     if (navigator.share) {
//       navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
//     } else {
//       await navigator.clipboard.writeText(shareUrl);
//       onToast("Quiz link copied to clipboard! 📋");
//     }
//   };

//   const formattedTime = new Date(item.createdAt || Date.now()).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return (
//     <motion.div
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-purple-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
//           ? "ring-2 ring-purple-500 shadow-[0_0_35px_rgba(168,85,247,0.35)] scale-[1.01]"
//           : ""
//         }`}
//     >
//       {isHighlighted && (
//         <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 text-[10px] font-black text-purple-300 flex items-center justify-between">
//           <span className="flex items-center gap-1.5">
//             <Sparkles size={11} className="text-purple-400 animate-pulse" />
//             <span>SHARED QUIZ</span>
//           </span>
//           <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
//         </div>
//       )}
//       <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
//         <div className="flex items-center gap-1.5 uppercase">
//           <span className="text-purple-400">🧠 QUIZ</span>
//           <span>•</span>
//           <span className="text-amber-400">⭐ +2 PTS / PLAY • +10 PTS CORRECT</span>
//           {frequencyMinutes && (
//             <>
//               <span>•</span>
//               <span className="text-cyan-400 font-mono">⏱️ {frequencyMinutes}M INTERVAL</span>
//             </>
//           )}
//           {isScheduled && (
//             <>
//               <span>•</span>
//               <span className="text-amber-400 font-mono flex items-center gap-1">
//                 <Clock size={10} /> STARTS IN {formatCountdown(timeToStartMs)}
//               </span>
//             </>
//           )}
//         </div>
//         <div className="flex items-center gap-2">
//           <span>{formattedTime}</span>
//         </div>
//       </div>

//       <div className="flex items-center justify-between gap-2 mb-1.5">
//         <h3 className="text-sm font-black text-white truncate">{item.title}</h3>
//         {totalQuestions > 1 && (
//           <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full shrink-0">
//             Q {currentQIndex + 1}/{totalQuestions}
//           </span>
//         )}
//       </div>

//       {totalQuestions > 1 && (
//         <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mb-3">
//           <div
//             className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
//             style={{ width: `${((currentQIndex + (answered ? 1 : 0)) / totalQuestions) * 100}%` }}
//           />
//         </div>
//       )}

//       {isScheduled ? (
//         <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center my-3 space-y-2">
//           <Clock size={24} className="mx-auto text-purple-400 animate-pulse" />
//           <h4 className="text-sm font-black text-white">Quiz Scheduled</h4>
//           <p className="text-xs text-white/70">
//             Question #1 unlocks in <strong className="text-amber-400 font-mono">{formatCountdown(timeToStartMs)}</strong>
//           </p>
//           <span className="text-[10px] text-white/40 block">Questions unlock every {frequencyMinutes} minutes</span>
//         </div>
//       ) : (
//         <>
//           <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{currentQ?.question}</p>

//           <div className="grid grid-cols-2 gap-2.5 mb-3.5">
//             {currentQ?.options?.map((opt: QuizOption) => {
//               const letter = opt.id;
//               const isThisCorrect = letter.toUpperCase() === correctOptionId.toUpperCase();
//               const isSelected = selectedId === letter;

//               let cardStyle = "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white/90";
//               if (answered) {
//                 if (isThisCorrect) {
//                   cardStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-black";
//                 } else if (isSelected && !isThisCorrect) {
//                   cardStyle = "bg-red-500/15 border-red-500 text-red-400";
//                 } else {
//                   cardStyle = "opacity-35 border-white/[0.04]";
//                 }
//               }

//               return (
//                 <button
//                   key={letter}
//                   onClick={() => handleOptionSelect(letter)}
//                   disabled={answered}
//                   className={`rounded-xl p-3 border font-bold text-xs text-left transition-all cursor-pointer flex items-center justify-between ${cardStyle}`}
//                 >
//                   <span className="truncate pr-1">
//                     <span className="text-white/40 mr-1.5 font-bold">{letter}.</span>
//                     {opt.text}
//                   </span>
//                   {answered && isThisCorrect && <Check size={14} className="text-emerald-400 shrink-0" />}
//                   {answered && isSelected && !isThisCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
//                 </button>
//               );
//             })}
//           </div>

//           {answered && (
//             <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-3">
//               <div
//                 className={`text-[11px] font-black text-center p-2 rounded-xl border flex items-center justify-center gap-1.5 ${
//                   isCorrect
//                     ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
//                     : "bg-red-500/10 border-red-500/30 text-red-400"
//                 }`}
//               >
//                 <span>{isCorrect ? "🎉" : "💡"}</span>
//                 <span>
//                   {isCorrect
//                     ? `Correct! +${CORRECT_OPTION_BONUS} PTS Bonus (+${PARTICIPATION_POINTS + CORRECT_OPTION_BONUS} PTS Total)`
//                     : `+${PARTICIPATION_POINTS} PTS for participating · The correct answer is ${correctOptionId}`}
//                 </span>
//               </div>

//               {totalQuestions > 1 && currentQIndex < totalQuestions - 1 && (
//                 <>
//                   {isNextQuestionLocked ? (
//                     <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between text-xs font-bold text-white/80">
//                       <span className="flex items-center gap-1.5 text-purple-300">
//                         <Clock size={13} /> Next Question #{currentQIndex + 2} in:
//                       </span>
//                       <span className="font-mono text-amber-400 font-extrabold text-sm">
//                         {formatCountdown(msToNextQuestionSlot)}
//                       </span>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={handleNextQuestion}
//                       className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
//                     >
//                       <span>Next Question</span>
//                       <ChevronRight size={14} />
//                     </button>
//                   )}
//                 </>
//               )}
//             </motion.div>
//           )}
//         </>
//       )}

//       <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
//         <div className="flex gap-4">
//           <button
//             onClick={handleLike}
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${
//               liked ? "text-[#FF3D57]" : "hover:text-white"
//             }`}
//           >
//             <Heart size={13} fill={liked ? "currentColor" : "none"} />
//             <span>{likesCount.toLocaleString()}</span>
//           </button>
//           <button
//             onClick={handleShare}
//             className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
//           >
//             <Share2 size={13} />
//             <span>{sharesCount > 0 ? `(${sharesCount})` : ""}</span>
//           </button>
//         </div>
//         <span>{totalEngaged.toLocaleString()} engaged</span>
//       </div>
//     </motion.div>
//   );
// }

// // ─── 3. Poll Card Component (+2 PTS Participation, +10 PTS Correct Option) ──
// function DynamicPollCard({
//   item,
//   userId,
//   now,
//   onToast,
//   onEdit,
//   isHighlighted = false,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//     isHighlighted?: boolean;
// }) {
//   const initialVote = getStoredVote("poll", item.id, userId);
//   const [selectedId, setSelectedId] = useState<string | null>(
//     initialVote?.selectedId || item.userVote || null
//   );
//   const [voted, setVoted] = useState<boolean>(Boolean(initialVote || item.userVoted));
//   const [loading, setLoading] = useState(false);

//   // Bonus awarded state backed by localStorage to prevent multiple dispatches
//   const bonusClaimKey = `sf_poll_bonus_claimed_${item.id}_${userId || "anon"}`;
//   const [bonusAwarded, setBonusAwarded] = useState<boolean>(() => {
//     if (typeof window === "undefined") return false;
//     return localStorage.getItem(bonusClaimKey) === "true";
//   });
//   const [serverIsCorrect, setServerIsCorrect] = useState<boolean | null>(null);

//   const [options, setOptions] = useState(
//     item.pollData?.options || [
//       { id: "1", text: "Jasprit Bumrah 🏏", votes: 420 },
//       { id: "2", text: "Maheesh Theekshana 🌀", votes: 195 },
//       { id: "3", text: "Ravindra Jadeja 🍌", votes: 240 },
//     ]
//   );
//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
//   const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
//   const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);

//   const startTime = getEngagementStartTime(item);
//   const isScheduled = startTime > now;
//   const timeToStartMs = Math.max(0, startTime - now);

//   const durationMins = Number(item.pollData?.durationMinutes || item.pollData?.timerMinutes || 10);
//   const expiresAt = item.pollData?.expiresAt || (startTime + durationMins * 60 * 1000);
//   const isExpired = now >= expiresAt;
//   const timeRemainingMs = Math.max(0, expiresAt - now);

//   const totalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0) || 1;
//   const correctAnswer = item.pollData?.correctAnswer || item.pollData?.answer || "";

//   const checkIsOptionWinner = useCallback(
//     (opt: any) => {
//       if (!correctAnswer || !opt) return false;
//       const ca = correctAnswer.trim().toLowerCase();
//       const optText = String(opt.text || opt.label || "").trim().toLowerCase();
//       const optId = String(opt.id || "").trim().toLowerCase();
//       return (
//         optText === ca ||
//         optId === ca ||
//         (optText && ca && (optText.includes(ca) || ca.includes(optText))) ||
//         opt.isCorrect === true
//       );
//     },
//     [correctAnswer]
//   );

//   const chosenOpt = options.find((o) => o.id === selectedId || o.text === selectedId);
//   const userWon = Boolean(chosenOpt && checkIsOptionWinner(chosenOpt));

//   // Sync vote status on mount
//   useEffect(() => {
//     if (item.userLiked) {
//       setLiked(true);
//     } else if (userId) {
//       engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
//         if (isLiked) setLiked(true);
//       });
//     }

//     const stored = getStoredVote("poll", item.id, userId);
//     if (stored?.selectedId) {
//       setSelectedId(stored.selectedId);
//       setVoted(true);
//     }

//     if (item.userVoted && item.userVote) {
//       setSelectedId(item.userVote);
//       setVoted(true);
//       setStoredVote("poll", item.id, { selectedId: item.userVote }, userId);
//     }

//     if (userId) {
//       engagementService
//         .checkVoteStatus(item.id, userId)
//         .then((res) => {
//           if (res.hasVoted && res.selectedOptionId) {
//             setSelectedId(res.selectedOptionId);
//             setVoted(true);
//             setStoredVote("poll", item.id, { selectedId: res.selectedOptionId }, userId);
//           }
//           if (res.accuracyBonusAwarded || res.wonBonusPoints === 10) {
//             setServerIsCorrect(true);
//             const alreadyClaimed = localStorage.getItem(bonusClaimKey) === "true";
//             if (!alreadyClaimed) {
//               setBonusAwarded(true);
//               localStorage.setItem(bonusClaimKey, "true");
//               onToast(`🏆 Correct Answer! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🎉`);
//               if (typeof window !== "undefined") {
//                 window.dispatchEvent(
//                   new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
//                 );
//               }
//             }
//           } else if (res.isCorrect !== undefined) {
//             setServerIsCorrect(res.isCorrect);
//           }
//         })
//         .catch(() => { });
//     }
//   }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, bonusClaimKey, onToast]);

//   // Evaluate & Claim +10 Bonus after Timer Ends (strictly once per item/user)
//   const bonusClaimTriggeredRef = useRef(false);
//   useEffect(() => {
//     if (!isExpired || !voted || bonusAwarded || bonusClaimTriggeredRef.current) return;
//     if (localStorage.getItem(bonusClaimKey) === "true") {
//       setBonusAwarded(true);
//       return;
//     }

//     if (userId) {
//       bonusClaimTriggeredRef.current = true;
//       engagementService
//         .checkVoteStatus(item.id, userId)
//         .then((res) => {
//           if (res?.accuracyBonusAwarded || res?.wonBonusPoints === 10) {
//             setBonusAwarded(true);
//             setServerIsCorrect(true);
//             localStorage.setItem(bonusClaimKey, "true");
//             onToast(`🏆 Correct Answer! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🎉`);
//             if (typeof window !== "undefined") {
//               window.dispatchEvent(
//                 new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
//               );
//             }
//           } else if (res?.isCorrect && !res?.accuracyBonusAwarded) {
//             fetch(`/api/engagements/${item.id}/vote`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 action: "claim_bonus",
//                 userId,
//                 selectedOptionId: selectedId,
//               }),
//             })
//               .then((r) => r.json())
//               .then((claimRes) => {
//                 if (claimRes?.accuracyBonusAwarded || claimRes?.wonBonusPoints === 10) {
//                   setBonusAwarded(true);
//                   setServerIsCorrect(true);
//                   localStorage.setItem(bonusClaimKey, "true");
//                   onToast(`🏆 Correct Answer! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🎉`);
//                   if (typeof window !== "undefined") {
//                     window.dispatchEvent(
//                       new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
//                     );
//                   }
//                 }
//               })
//               .catch(() => { });
//           }
//         })
//         .catch(() => { });
//     }
//   }, [isExpired, voted, bonusAwarded, item.id, userId, selectedId, bonusClaimKey, onToast]);

//   const handleVote = async (optId: string) => {
//     if (isScheduled) {
//       onToast(`Poll unlocks in ${formatCountdown(timeToStartMs)}!`);
//       return;
//     }
//     if (isExpired) {
//       onToast("This poll has ended!");
//       return;
//     }
//     if (voted || loading || getStoredVote("poll", item.id, userId)) {
//       onToast("You have already voted on this poll!");
//       return;
//     }
//     setSelectedId(optId);
//     setVoted(true);
//     setLoading(true);
//     setStoredVote("poll", item.id, { selectedId: optId }, userId);
//     setTotalEngaged((prev) => prev + 1);

//     try {
//       const res: any = await engagementService.voteEngagement(item.id, optId, userId);
//       if (res?.success && res.options) {
//         setOptions(res.options);
//       } else {
//         setOptions((prev) =>
//           prev.map((o) => (o.id === optId ? { ...o, votes: (o.votes || 0) + 1 } : o))
//         );
//       }
//       onToast(`+${PARTICIPATION_POINTS} PTS earned for voting! 📊`);
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
//         );
//       }
//     } catch (err: any) {
//       const prevOpt = err?.response?.data?.selectedOptionId || optId;
//       setSelectedId(prevOpt);
//       setOptions((prev) =>
//         prev.map((o) => (o.id === prevOpt ? { ...o, votes: (o.votes || 0) + 1 } : o))
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, userId);
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
//     setTotalEngaged((prev) => prev + 1);
//     engagementService.shareEngagement(item.id).catch(() => { });

//     const shareUrl = getEngagementShareUrl(item);
//     const text = `📊 Vote on this poll: "${item.pollData?.question || item.title}" on SportsFan360:`;
//     if (navigator.share) {
//       navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
//     } else {
//       await navigator.clipboard.writeText(shareUrl);
//       onToast("Poll link copied to clipboard! 📋");
//     }
//   };

//   const formattedTime = new Date(item.createdAt || Date.now()).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return (
//     <motion.div
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-blue-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
//           ? "ring-2 ring-blue-500 shadow-[0_0_35px_rgba(59,130,246,0.35)] scale-[1.01]"
//           : ""
//         }`}
//     >
//       {isHighlighted && (
//         <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 text-[10px] font-black text-blue-300 flex items-center justify-between">
//           <span className="flex items-center gap-1.5">
//             <Sparkles size={11} className="text-blue-400 animate-pulse" />
//             <span>SHARED POLL</span>
//           </span>
//           <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
//         </div>
//       )}
//       <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
//         <div className="flex items-center gap-1.5 uppercase">
//           <span className="text-blue-400 font-black">📊 POLL • +2 PTS / VOTE • +10 PTS WINNER</span>
//           {isScheduled ? (
//             <>
//               <span>•</span>
//               <span className="text-amber-400 font-mono flex items-center gap-1">
//                 <Clock size={10} /> OPENS IN {formatCountdown(timeToStartMs)}
//               </span>
//             </>
//           ) : isExpired ? (
//             <>
//               <span>•</span>
//               <span className="text-rose-400 font-mono">🔒 CLOSED</span>
//             </>
//           ) : (
//             <>
//               <span>•</span>
//               <span className="text-emerald-400 font-mono flex items-center gap-1">
//                 <Clock size={10} /> CLOSES IN {formatCountdown(timeRemainingMs)}
//               </span>
//             </>
//           )}
//         </div>
//         <div className="flex items-center gap-2">
//           <span>{formattedTime}</span>
//         </div>
//       </div>

//       <h3 className="text-sm font-black mb-3">{item.pollData?.question || item.title}</h3>

//       {isScheduled ? (
//         <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center my-2 space-y-1">
//           <Clock size={20} className="mx-auto text-blue-400 animate-pulse" />
//           <h4 className="text-xs font-black text-white">Poll Scheduled</h4>
//           <p className="text-[11px] text-white/60">
//             Voting opens in <strong className="text-amber-400 font-mono">{formatCountdown(timeToStartMs)}</strong>
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-3 mb-4">
//           {/* Winner Celebration Status Banner */}
//           {isExpired && voted && (
//             <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
//               {userWon || bonusAwarded || serverIsCorrect ? (
//                 <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-xs font-black text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
//                   <span className="flex items-center gap-1.5">
//                     <span>🎉</span>
//                     <span>Correct Answer! You earned +10 PTS Bonus (+12 PTS Total)</span>
//                   </span>
//                   <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
//                     +10 PTS
//                   </span>
//                 </div>
//               ) : correctAnswer ? (
//                 <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
//                   <span>
//                     Poll closed · Winning answer: <strong className="text-emerald-400">{correctAnswer}</strong>
//                   </span>
//                   <span className="text-[10px] text-white/40 shrink-0">+2 PTS participation</span>
//                 </div>
//               ) : null}
//             </motion.div>
//           )}

//           {/* Active Poll Participation Notice */}
//           {voted && !isExpired && (
//             <motion.div
//               initial={{ opacity: 0, y: 6 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-[11px] font-black text-center text-blue-400 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl mb-3 flex items-center justify-center gap-1.5"
//             >
//               <span>🔒</span>
//               <span>+2 PTS earned! · Closes in {formatCountdown(timeRemainingMs)} · Pick the winning answer to earn +10 PTS bonus!</span>
//             </motion.div>
//           )}

//           {options.map((opt) => {
//             const isSelected = selectedId === opt.id || selectedId === opt.text;
//             const percentage =
//               opt.percentage !== undefined
//                 ? opt.percentage
//                 : Math.round(((opt.votes || 0) / totalVotes) * 100);

//             const isWinner = checkIsOptionWinner(opt);

//             return (
//               <button
//                 key={opt.id}
//                 onClick={() => handleVote(opt.id)}
//                 disabled={voted || isExpired || loading}
//                 className={`w-full relative rounded-xl border overflow-hidden p-3.5 flex items-center justify-between text-xs font-extrabold text-left transition-all cursor-pointer ${
//                   isWinner && isExpired
//                     ? "border-emerald-500/80 bg-emerald-500/[0.1] shadow-[0_0_12px_rgba(16,185,129,0.15)]"
//                     : isSelected
//                     ? "border-blue-500/60 bg-blue-500/[0.07]"
//                     : isExpired
//                     ? "opacity-60 border-white/[0.05] bg-white/[0.01]"
//                     : "border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03]"
//                 }`}
//               >
//                 {(voted || isExpired) && (
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${percentage}%` }}
//                     transition={{ duration: 0.6, ease: "easeOut" }}
//                     className={`absolute left-0 top-0 bottom-0 z-0 ${
//                       isWinner && isExpired ? "bg-emerald-500/20" : isSelected ? "bg-blue-500/20" : "bg-white/[0.04]"
//                     }`}
//                   />
//                 )}
//                 <span className="relative z-10 text-white/90 font-bold flex items-center gap-1.5">
//                   {opt.text}
//                   {isWinner && isExpired && (
//                     <span className="text-emerald-400 text-[10px] font-black">🏆 Correct Answer</span>
//                   )}
//                 </span>
//                 {(voted || isExpired) && (
//                   <span
//                     className={`relative z-10 text-[11px] font-black ${
//                       isWinner && isExpired ? "text-emerald-400" : isSelected ? "text-blue-400" : "text-white/60"
//                     }`}
//                   >
//                     {percentage}% {isSelected && "✓"}
//                   </span>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       )}

//       <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
//         <div className="flex gap-4">
//           <button
//             onClick={handleLike}
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${
//               liked ? "text-[#FF3D57]" : "hover:text-white"
//             }`}
//           >
//             <Heart size={13} fill={liked ? "currentColor" : "none"} />
//             <span>{likesCount.toLocaleString()}</span>
//           </button>
//           <button
//             onClick={handleShare}
//             className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
//           >
//             <Share2 size={13} />
//             <span>{sharesCount > 0 ? `(${sharesCount})` : ""}</span>
//           </button>
//         </div>
//         <span>{totalEngaged.toLocaleString()} engaged</span>
//       </div>
//     </motion.div>
//   );
// }

// // ─── 4. Prediction Card Component (+2 PTS Participation, +10 PTS Correct) ───
// function DynamicPredictionCard({
//   item,
//   userId,
//   now,
//   onToast,
//   onEdit,
//   isHighlighted = false,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//     isHighlighted?: boolean;
// }) {
//   const pred = item.predictionData || {
//     question: "India win the 1st Galle Test?",
//     leftChoice: { id: "left", text: "Yes, India win", code: "IN", votes: 640 },
//     rightChoice: { id: "right", text: "SL hold / win", code: "LK", votes: 260 },
//     coinStake: 25,
//     totalVotes: 900,
//     status: "open",
//   };

//   const initialVote = getStoredVote("pred", item.id, userId);
//   const [selectedChoice, setSelectedChoice] = useState<"left" | "right" | null>(
//     initialVote?.choice || (item.userVote as "left" | "right") || null
//   );
//   const [predicted, setPredicted] = useState<boolean>(Boolean(initialVote || item.userVoted));
//   const [loading, setLoading] = useState(false);

//   // Bonus awarded state backed by localStorage to prevent multiple dispatches
//   const bonusClaimKey = `sf_pred_bonus_claimed_${item.id}_${userId || "anon"}`;
//   const [bonusAwarded, setBonusAwarded] = useState<boolean>(() => {
//     if (typeof window === "undefined") return false;
//     return localStorage.getItem(bonusClaimKey) === "true";
//   });
//   const [serverIsCorrect, setServerIsCorrect] = useState<boolean | null>(null);

//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
//   const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
//   const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);
//   const [result, setResult] = useState<{
//     leftPercentage: number;
//     rightPercentage: number;
//     coinsLocked: number;
//   } | null>(() => {
//     const c = initialVote?.choice || (item.userVote as "left" | "right");
//     if (!c) return null;
//     return {
//       leftPercentage: c === "left" ? 71 : 29,
//       rightPercentage: c === "right" ? 71 : 29,
//       coinsLocked: initialVote?.coinsLocked || pred.coinStake || 25,
//     };
//   });

//   const startTime = getEngagementStartTime(item);
//   const isScheduled = startTime > now;
//   const timeToStartMs = Math.max(0, startTime - now);

//   const durationMins = Number(item.predictionData?.durationMinutes || item.predictionData?.timerMinutes || 30);
//   const expiresAt = item.predictionData?.expiresAt || (startTime + durationMins * 60 * 1000);
//   const isExpired = now >= expiresAt;
//   const timeRemainingMs = Math.max(0, expiresAt - now);

//   const winningTarget =
//     pred.winningChoiceId ||
//     pred.correctAnswer ||
//     pred.answer ||
//     item.predictionData?.correctAnswer ||
//     item.predictionData?.winningChoiceId ||
//     "";

//   const checkIsChoiceWinner = useCallback(
//     (choice: "left" | "right" | string | null): boolean => {
//       if (!choice || !winningTarget) return false;
//       const target = winningTarget.trim().toLowerCase();
//       const c = String(choice).trim().toLowerCase();
//       const leftText = String(pred.leftChoice?.text || "").trim().toLowerCase();
//       const leftCode = String(pred.leftChoice?.code || "").trim().toLowerCase();
//       const rightText = String(pred.rightChoice?.text || "").trim().toLowerCase();
//       const rightCode = String(pred.rightChoice?.code || "").trim().toLowerCase();

//       const isTargetLeft =
//         target === "left" ||
//         (!!leftText && target === leftText) ||
//         (!!leftCode && target === leftCode) ||
//         (!!leftText && leftText.includes(target) && target.length > 2);

//       const isTargetRight =
//         target === "right" ||
//         (!!rightText && target === rightText) ||
//         (!!rightCode && target === rightCode) ||
//         (!!rightText && rightText.includes(target) && target.length > 2);

//       const isUserLeft =
//         c === "left" ||
//         (!!leftText && c === leftText) ||
//         (!!leftCode && c === leftCode);

//       const isUserRight =
//         c === "right" ||
//         (!!rightText && c === rightText) ||
//         (!!rightCode && c === rightCode);

//       if (isTargetLeft && isUserLeft) return true;
//       if (isTargetRight && isUserRight) return true;
//       return c === target;
//     },
//     [winningTarget, pred.leftChoice?.text, pred.leftChoice?.code, pred.rightChoice?.text, pred.rightChoice?.code]
//   );

//   const userWon = Boolean(predicted && checkIsChoiceWinner(selectedChoice));

//   // Sync vote status on mount
//   useEffect(() => {
//     if (item.userLiked) {
//       setLiked(true);
//     } else if (userId) {
//       engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
//         if (isLiked) setLiked(true);
//       });
//     }

//     const stored = getStoredVote("pred", item.id, userId);
//     if (stored?.choice) {
//       setSelectedChoice(stored.choice);
//       setPredicted(true);
//       setResult({
//         leftPercentage: stored.choice === "left" ? 71 : 29,
//         rightPercentage: stored.choice === "right" ? 71 : 29,
//         coinsLocked: stored.coinsLocked || pred.coinStake || 25,
//       });
//     }

//     if (item.userVoted && item.userVote) {
//       const choice = item.userVote as "left" | "right";
//       setSelectedChoice(choice);
//       setPredicted(true);
//       setStoredVote("pred", item.id, { choice, coinsLocked: pred.coinStake || 25 }, userId);
//       setResult({
//         leftPercentage: choice === "left" ? 71 : 29,
//         rightPercentage: choice === "right" ? 71 : 29,
//         coinsLocked: pred.coinStake || 25,
//       });
//     }

//     if (userId) {
//       engagementService
//         .checkVoteStatus(item.id, userId)
//         .then((res) => {
//           if (res.hasVoted && res.selectedOptionId) {
//             const choice = res.selectedOptionId as "left" | "right";
//             setSelectedChoice(choice);
//             setPredicted(true);
//             setStoredVote("pred", item.id, { choice, coinsLocked: pred.coinStake || 25 }, userId);
//             setResult({
//               leftPercentage: choice === "left" ? 71 : 29,
//               rightPercentage: choice === "right" ? 71 : 29,
//               coinsLocked: pred.coinStake || 25,
//             });
//           }
//           if (res.accuracyBonusAwarded || res.wonBonusPoints === 10) {
//             setServerIsCorrect(true);
//             const alreadyClaimed = localStorage.getItem(bonusClaimKey) === "true";
//             if (!alreadyClaimed) {
//               setBonusAwarded(true);
//               localStorage.setItem(bonusClaimKey, "true");
//               onToast(`🎯 Prediction Won! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🏆`);
//               if (typeof window !== "undefined") {
//                 window.dispatchEvent(
//                   new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
//                 );
//               }
//             }
//           } else if (res.isCorrect !== undefined) {
//             setServerIsCorrect(res.isCorrect);
//           }
//         })
//         .catch(() => { });
//     }
//   }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, pred.coinStake, bonusClaimKey, onToast]);

//   // Evaluate & Claim +10 Bonus after Timer Ends (strictly once per item/user)
//   const predBonusClaimTriggeredRef = useRef(false);
//   useEffect(() => {
//     if (!isExpired || !predicted || bonusAwarded || predBonusClaimTriggeredRef.current) return;
//     if (localStorage.getItem(bonusClaimKey) === "true") {
//       setBonusAwarded(true);
//       return;
//     }

//     if (userId) {
//       predBonusClaimTriggeredRef.current = true;
//       engagementService
//         .checkVoteStatus(item.id, userId)
//         .then((res) => {
//           if (res?.accuracyBonusAwarded || res?.wonBonusPoints === 10) {
//             setBonusAwarded(true);
//             setServerIsCorrect(true);
//             localStorage.setItem(bonusClaimKey, "true");
//             onToast(`🎯 Prediction Won! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🏆`);
//             if (typeof window !== "undefined") {
//               window.dispatchEvent(
//                 new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
//               );
//             }
//           } else if (res?.isCorrect && !res?.accuracyBonusAwarded) {
//             fetch(`/api/engagements/${item.id}/vote`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 action: "claim_bonus",
//                 userId,
//                 selectedOptionId: selectedChoice,
//               }),
//             })
//               .then((r) => r.json())
//               .then((claimRes) => {
//                 if (claimRes?.accuracyBonusAwarded || claimRes?.wonBonusPoints === 10) {
//                   setBonusAwarded(true);
//                   setServerIsCorrect(true);
//                   localStorage.setItem(bonusClaimKey, "true");
//                   onToast(`🎯 Prediction Won! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🏆`);
//                   if (typeof window !== "undefined") {
//                     window.dispatchEvent(
//                       new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
//                     );
//                   }
//                 }
//               })
//               .catch(() => { });
//           }
//         })
//         .catch(() => { });
//     }
//   }, [isExpired, predicted, bonusAwarded, item.id, userId, selectedChoice, bonusClaimKey, onToast]);

//   const handlePredict = async (choice: "left" | "right") => {
//     if (isScheduled) {
//       onToast(`Prediction unlocks in ${formatCountdown(timeToStartMs)}!`);
//       return;
//     }
//     if (isExpired) {
//       onToast("This prediction has closed!");
//       return;
//     }
//     if (predicted || loading || getStoredVote("pred", item.id, userId)) {
//       onToast("You have already made your prediction!");
//       return;
//     }
//     setSelectedChoice(choice);
//     setPredicted(true);
//     setLoading(true);
//     setStoredVote("pred", item.id, { choice, coinsLocked: pred.coinStake || 25 }, userId);
//     setTotalEngaged((prev) => prev + 1);

//     try {
//       const res: any = await engagementService.voteEngagement(item.id, choice, userId);
//       const computedResult = {
//         leftPercentage: res?.leftPercentage ?? (choice === "left" ? 71 : 29),
//         rightPercentage: res?.rightPercentage ?? (choice === "right" ? 71 : 29),
//         coinsLocked: res?.coinsLocked || pred.coinStake || 25,
//       };
//       setResult(computedResult);
//       onToast(`+${PARTICIPATION_POINTS} PTS earned for prediction! 🎯`);
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
//         );
//       }
//     } catch (err: any) {
//       const prevChoice = (err?.response?.data?.selectedOptionId || choice) as "left" | "right";
//       setSelectedChoice(prevChoice);
//       setResult({
//         leftPercentage: prevChoice === "left" ? 71 : 29,
//         rightPercentage: prevChoice === "right" ? 71 : 29,
//         coinsLocked: pred.coinStake || 25,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, userId);
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
//     setTotalEngaged((prev) => prev + 1);
//     engagementService.shareEngagement(item.id).catch(() => { });

//     const shareUrl = getEngagementShareUrl(item);
//     const text = `🎯 Predict: "${pred.question || item.title}" on SportsFan360:`;
//     if (navigator.share) {
//       navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
//     } else {
//       await navigator.clipboard.writeText(shareUrl);
//       onToast("Prediction link copied to clipboard! 📋");
//     }
//   };

//   const formattedTime = new Date(item.createdAt || Date.now()).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return (
//     <motion.div
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-amber-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
//           ? "ring-2 ring-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.35)] scale-[1.01]"
//           : ""
//         }`}
//     >
//       {isHighlighted && (
//         <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-[10px] font-black text-amber-300 flex items-center justify-between">
//           <span className="flex items-center gap-1.5">
//             <Sparkles size={11} className="text-amber-400 animate-pulse" />
//             <span>SHARED PREDICTION</span>
//           </span>
//           <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
//         </div>
//       )}
//       <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
//         <div className="flex items-center gap-1.5 uppercase">
//           <span className="text-amber-400">🎯 PREDICTION</span>
//           <span>•</span>
//           <span className="text-amber-300">⚡ +2 PTS / VOTE • +10 PTS WINNER</span>
//           {isScheduled ? (
//             <>
//               <span>•</span>
//               <span className="text-amber-400 font-mono flex items-center gap-1">
//                 <Clock size={10} /> OPENS IN {formatCountdown(timeToStartMs)}
//               </span>
//             </>
//           ) : isExpired ? (
//             <>
//               <span>•</span>
//               <span className="text-rose-400 font-mono">🔒 CLOSED</span>
//             </>
//           ) : (
//             <>
//               <span>•</span>
//               <span className="text-emerald-400 font-mono flex items-center gap-1">
//                 <Clock size={10} /> CLOSES IN {formatCountdown(timeRemainingMs)}
//               </span>
//             </>
//           )}
//         </div>
//         <div className="flex items-center gap-2">
//           <span>{formattedTime}</span>
//         </div>
//       </div>

//       <p className="text-xs font-semibold text-white/70 mb-4">{pred.question}</p>

//       {isScheduled ? (
//         <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center my-2 space-y-1">
//           <Clock size={20} className="mx-auto text-amber-400 animate-pulse" />
//           <h4 className="text-xs font-black text-white">Prediction Scheduled</h4>
//           <p className="text-[11px] text-white/60">
//             Predictions open in <strong className="text-amber-400 font-mono">{formatCountdown(timeToStartMs)}</strong>
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 gap-3.5 mb-4">
//           <button
//             onClick={() => handlePredict("left")}
//             disabled={predicted || isExpired || loading}
//             className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${
//               selectedChoice === "left"
//                 ? "bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-400"
//                 : predicted || isExpired
//                 ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
//                 : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white"
//             }`}
//           >
//             <span className="text-xs font-black">{pred.leftChoice.text}</span>
//             <span className="text-[10px] font-black mt-1 text-white/50">
//               {result ? `${result.leftPercentage}%` : "2X multiplier"}
//             </span>
//           </button>

//           <button
//             onClick={() => handlePredict("right")}
//             disabled={predicted || isExpired || loading}
//             className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${
//               selectedChoice === "right"
//                 ? "bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-400"
//                 : predicted || isExpired
//                 ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
//                 : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white"
//             }`}
//           >
//             <span className="text-xs font-black">{pred.rightChoice.text}</span>
//             <span className="text-[10px] font-black mt-1 text-white/50">
//               {result ? `${result.rightPercentage}%` : "5X multiplier"}
//             </span>
//           </button>
//         </div>
//       )}

//       {predicted && (
//         <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
//           {isExpired ? (
//             userWon || bonusAwarded || serverIsCorrect ? (
//               <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-xs font-black text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
//                 <span className="flex items-center gap-1.5">
//                   <span>🎉</span>
//                   <span>Prediction Won! You earned +10 PTS Bonus (+12 PTS Total)</span>
//                 </span>
//                 <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
//                   +10 PTS
//                 </span>
//               </div>
//             ) : (
//               <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
//                 <span>
//                   Prediction closed · Winning outcome:{" "}
//                   <strong className="text-amber-400">{winningTarget || "Ended"}</strong>
//                 </span>
//                 <span className="text-[10px] text-white/40 shrink-0">+2 PTS participation</span>
//               </div>
//             )
//           ) : (
//             <div className="text-[11px] font-black text-center text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-center gap-1.5">
//               <span>🔒</span>
//               <span>+2 PTS earned! · Closes in {formatCountdown(timeRemainingMs)} · Pick the winning outcome to earn +10 PTS bonus!</span>
//             </div>
//           )}
//         </motion.div>
//       )}

//       <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
//         <div className="flex gap-4">
//           <button
//             onClick={handleLike}
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${
//               liked ? "text-[#FF3D57]" : "hover:text-white"
//             }`}
//           >
//             <Heart size={13} fill={liked ? "currentColor" : "none"} />
//             <span>{likesCount.toLocaleString()}</span>
//           </button>
//           <button
//             onClick={handleShare}
//             className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
//           >
//             <Share2 size={13} />
//             <span>{sharesCount > 0 ? `(${sharesCount})` : ""}</span>
//           </button>
//         </div>
//         <span>{totalEngaged.toLocaleString()} engaged</span>
//       </div>
//     </motion.div>
//   );
// }

// // ─── 5. Meme Card Component (5 Heat Rating Tiers +2 PTS Participation) ───────
// function DynamicMemeCard({
//   item,
//   userId,
//   onToast,
//   onEdit,
//   onDelete,
//   isHighlighted = false,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//   onDelete?: (item: EngagementItem) => void;
//   isHighlighted?: boolean;
// }) {
//   const { user } = useAuth();
//   const currentUserId = userId || user?.userId || (user as any)?.actualUserId || user?.email;
//   const currentUserEmail = user?.email || (user as any)?.userEmail || "";
//   const currentUserName = user?.name || (user as any)?.userName || (user as any)?.displayName || "";

//   const meme = item.memeData || {
//     imageUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80",
//     caption: item.subtitle || item.title || "Matchday meme energy!",
//     authorName: "SportsFan",
//     authorHandle: "@SportsFan",
//     authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
//     heatPercentage: 0,
//     totalVotes: 0,
//     reactions: { mild: 0, funny: 0, hot: 0, fire: 0, nuclear: 0 },
//     commentsCount: 0,
//     sharesCount: 0,
//   };

//   // Dynamic Author Resolution
//   const authorName =
//     item.creatorName ||
//     (item as any).userName ||
//     meme.authorName ||
//     (item.creatorEmail ? item.creatorEmail.split("@")[0] : "") ||
//     ((item as any).userEmail ? (item as any).userEmail.split("@")[0] : "") ||
//     "SportsFan";

//   const authorHandle =
//     meme.authorHandle ||
//     (item.creatorEmail
//       ? `@${item.creatorEmail.split("@")[0]}`
//       : `@${authorName.replace(/\s+/g, "")}`);

//   const authorAvatar =
//     meme.authorAvatar ||
//     (item as any).creatorAvatar ||
//     (item as any).userAvatar ||
//     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";

//   // Check if current user is the author who posted this meme
//   const isAuthor = Boolean(
//     (currentUserId && (
//       item.creatorId === currentUserId ||
//       (item as any).userId === currentUserId ||
//       (item as any).creatorId === currentUserId
//     )) ||
//     (currentUserEmail && (
//       (item.creatorEmail && item.creatorEmail.toLowerCase() === currentUserEmail.toLowerCase()) ||
//       ((item as any).userEmail && (item as any).userEmail.toLowerCase() === currentUserEmail.toLowerCase()) ||
//       ((item as any).creatorEmail && (item as any).creatorEmail.toLowerCase() === currentUserEmail.toLowerCase())
//     )) ||
//     (currentUserName && (
//       (item.creatorName && item.creatorName.toLowerCase() === currentUserName.toLowerCase()) ||
//       (meme.authorName && meme.authorName.toLowerCase() === currentUserName.toLowerCase())
//     )) ||
//     (user as any)?.role === "admin"
//   );

//   const getTimeAgo = (timestamp?: number | string) => {
//     if (!timestamp) return "Just now";
//     const ts = typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();
//     if (isNaN(ts) || ts <= 0) return "Just now";
//     const diff = Math.max(0, Date.now() - ts);
//     const mins = Math.floor(diff / 60000);
//     if (mins < 1) return "Just now";
//     if (mins < 60) return `${mins}m ago`;
//     const hours = Math.floor(mins / 60);
//     if (hours < 24) return `${hours}h ago`;
//     const days = Math.floor(hours / 24);
//     return `${days}d ago`;
//   };

//   const initialStored = getStoredVote("meme", item.id, userId);
//   const [selectedRating, setSelectedRating] = useState<MemeReactionType>(
//     (initialStored?.reaction as MemeReactionType) || (item.userVote as MemeReactionType) || "hot"
//   );
//   const [voted, setVoted] = useState<boolean>(Boolean(initialStored || item.userVoted));
//   const [loading, setLoading] = useState(false);
//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
//   const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || Number(meme.sharesCount) || 0);
//   const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || Number(meme.totalVotes) || 0);
//   const [heatPct, setHeatPct] = useState<number>(meme.heatPercentage !== undefined ? Number(meme.heatPercentage) : (Number(item.memeData?.heatPercentage) || 0));
//   const [totalMemeVotes, setTotalMemeVotes] = useState<number>(meme.totalVotes !== undefined ? Number(meme.totalVotes) : (Number(item.memeData?.totalVotes) || 0));
//   const [reactions, setReactions] = useState(meme.reactions || { mild: 0, funny: 0, hot: 0, fire: 0, nuclear: 0 });
//   const [menuOpen, setMenuOpen] = useState(false);

//   useEffect(() => {
//     if (item.userLiked) {
//       setLiked(true);
//     } else if (userId) {
//       engagementService.checkLikeStatus(item.id, userId).then((isLiked) => {
//         if (isLiked) setLiked(true);
//       });
//     }

//     const stored = getStoredVote("meme", item.id, userId);
//     if (stored?.reaction) {
//       setSelectedRating(stored.reaction);
//       setVoted(true);
//     }

//     if (item.userVoted && item.userVote) {
//       setSelectedRating(item.userVote as MemeReactionType);
//       setVoted(true);
//       setStoredVote("meme", item.id, { reaction: item.userVote }, userId);
//     }

//     if (userId) {
//       engagementService
//         .checkVoteStatus(item.id, userId)
//         .then((res) => {
//           if (res.hasVoted && res.selectedOptionId) {
//             setSelectedRating(res.selectedOptionId as MemeReactionType);
//             setVoted(true);
//             setStoredVote("meme", item.id, { reaction: res.selectedOptionId }, userId);
//           }
//         })
//         .catch(() => { });
//     }
//   }, [item.id, item.userLiked, item.userVoted, item.userVote, userId]);

//   useEffect(() => {
//     if (item.memeData?.reactions) {
//       setReactions(item.memeData.reactions);
//     }
//     if (item.memeData?.heatPercentage !== undefined) {
//       setHeatPct(Number(item.memeData.heatPercentage));
//     }
//     if (item.memeData?.totalVotes !== undefined) {
//       setTotalMemeVotes(Number(item.memeData.totalVotes));
//     }
//   }, [item.memeData]);

//   const handleRateMeme = async (ratingToSubmit?: MemeReactionType) => {
//     const finalRating = ratingToSubmit || selectedRating || "hot";
//     if (voted || loading || getStoredVote("meme", item.id, userId)) {
//       onToast("You already voted on this meme!");
//       return;
//     }

//     setSelectedRating(finalRating);
//     setVoted(true);
//     setLoading(true);
//     setStoredVote("meme", item.id, { reaction: finalRating }, userId);
//     setTotalMemeVotes((prev) => prev + 1);
//     setTotalEngaged((prev) => prev + 1);

//     setReactions((prev) => {
//       const updated = { ...prev, [finalRating]: (prev[finalRating] || 0) + 1 };
//       const sum = Object.values(updated).reduce((a, b) => a + b, 0);
//       const score = updated.mild * 20 + updated.funny * 40 + updated.hot * 60 + updated.fire * 80 + updated.nuclear * 100;
//       if (sum > 0) setHeatPct(Math.min(100, Math.max(10, Math.round(score / sum))));
//       return updated;
//     });

//     try {
//       const res: any = await engagementService.voteEngagement(item.id, finalRating, userId);
//       if (res?.heatPercentage !== undefined) setHeatPct(res.heatPercentage);
//       if (res?.totalVotes !== undefined) setTotalMemeVotes(res.totalVotes);
//       if (res?.reactions) setReactions(res.reactions);

//       onToast(`🔥 Voted ${finalRating.toUpperCase()}! +${PARTICIPATION_POINTS} PTS earned!`);
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
//         );
//       }
//     } catch (err: any) {
//       const prevOption = err?.response?.data?.selectedOptionId || finalRating;
//       setSelectedRating(prevOption as MemeReactionType);
//       onToast(`🔥 Voted ${prevOption.toUpperCase()}! +2 PTS earned!`);
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, userId);
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
//     setTotalEngaged((prev) => prev + 1);
//     engagementService.shareEngagement(item.id).catch(() => { });

//     const shareUrl = getEngagementShareUrl(item);
//     const text = `🔥 Check out this meme: "${item.title}" on SportsFan360 Meme Arena:`;
//     if (navigator.share) {
//       navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
//     } else {
//       await navigator.clipboard.writeText(shareUrl);
//       onToast("Meme link copied to clipboard! 📋");
//     }
//   };

//   const ratingTiers: {
//     id: MemeReactionType;
//     label: string;
//     flameColor: string;
//     bgSelected: string;
//     borderSelected: string;
//   }[] = [
//     {
//       id: "mild",
//       label: "Mild",
//       flameColor: "text-slate-400",
//       bgSelected: "bg-slate-500/20",
//       borderSelected: "border-slate-400",
//     },
//     {
//       id: "funny",
//       label: "Funny",
//       flameColor: "text-pink-400",
//       bgSelected: "bg-pink-500/25",
//       borderSelected: "border-pink-500",
//     },
//     {
//       id: "hot",
//       label: "Hot",
//       flameColor: "text-amber-400",
//       bgSelected: "bg-amber-500/25",
//       borderSelected: "border-amber-500",
//     },
//     {
//       id: "fire",
//       label: "Fire",
//       flameColor: "text-orange-500",
//       bgSelected: "bg-gradient-to-b from-orange-500/30 to-red-500/20",
//       borderSelected: "border-orange-500",
//     },
//     {
//       id: "nuclear",
//       label: "Nuclear",
//       flameColor: "text-fuchsia-400",
//       bgSelected: "bg-gradient-to-b from-fuchsia-500/35 to-pink-500/25",
//       borderSelected: "border-fuchsia-500",
//     },
//   ];

//   return (
//     <motion.div
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-orange-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-3.5 sm:p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
//           ? "ring-2 ring-orange-500 shadow-[0_0_35px_rgba(249,115,22,0.35)] scale-[1.01]"
//           : ""
//         }`}
//     >
//       {isHighlighted && (
//         <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 text-[10px] font-black text-orange-300 flex items-center justify-between">
//           <span className="flex items-center gap-1.5">
//             <Sparkles size={11} className="text-orange-400 animate-pulse" />
//             <span>SHARED MEME</span>
//           </span>
//           <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
//         </div>
//       )}
//       {/* Author Header Row */}
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2.5 min-w-0">
//           <img
//             src={authorAvatar}
//             alt={authorName}
//             className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
//             onError={(e: any) => {
//               e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
//             }}
//           />
//           <div className="min-w-0">
//             <h4 className="text-xs font-black text-white truncate flex items-center gap-1.5">
//               <span>Meme by {authorName}</span>
//               <span className="text-white/40 text-[10px] font-semibold font-mono truncate">{authorHandle}</span>
//             </h4>
//             <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40">
//               <span>{getTimeAgo(item.createdAt || (meme as any).createdAt)}</span>
//               <span>•</span>
//               <span className="text-orange-400 font-extrabold uppercase">🔥 MEME ARENA</span>
//             </div>
//           </div>
//         </div>

//         {/* Only the author who posted (or admin) can edit */}
//         {isAuthor && (onEdit || onDelete) && (
//           <div className="relative">
//             <button
//               onClick={() => setMenuOpen(!menuOpen)}
//               className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
//               title="Meme options"
//             >
//               <MoreVertical size={15} />
//             </button>
//             {menuOpen && (
//               <div className="absolute right-0 top-8 w-36 bg-[#161a26] border border-white/10 rounded-xl py-1 shadow-2xl z-30 text-xs">
//                 {onEdit && (
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       onEdit(item);
//                     }}
//                     className="w-full px-3 py-1.5 text-left text-white/80 hover:bg-white/10 hover:text-white flex items-center gap-2 font-bold cursor-pointer"
//                   >
//                     <Pencil size={12} /> Edit Meme
//                   </button>
//                 )}
//                 {onDelete && (
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       onDelete(item);
//                     }}
//                     className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 flex items-center gap-2 font-bold cursor-pointer"
//                   >
//                     <Trash2 size={12} /> Delete Meme
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Meme Title / Headline */}
//       {item.title && (
//         <h3 className="text-sm font-black text-white mb-2 tracking-tight leading-snug">
//           {item.title}
//         </h3>
//       )}

//       {/* Meme Visual Image Frame */}
//       <div className="relative w-full rounded-xl overflow-hidden border border-white/[0.08] mb-3.5 bg-black/60 shadow-inner group">
//         <img
//           src={meme.imageUrl}
//           alt={item.title || "Sports meme"}
//           className="w-full max-h-[380px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
//           onError={(e: any) => {
//             e.target.src = "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80";
//           }}
//         />
//         {meme.caption && meme.caption !== item.title && (
//           <div className="p-2.5 bg-[#0a0d16]/95 border-t border-white/[0.06] text-[11px] font-bold text-white/80 text-center">
//             {meme.caption}
//           </div>
//         )}
//       </div>

//       {/* "How Hot Is This Meme?" Section */}
//       <div className="mb-3.5">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-xs font-black text-white flex items-center gap-1.5">
//             <span>How Hot Is This Meme?</span>
//           </span>
//           {voted && (
//             <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
//               <Check size={10} /> Vote Recorded
//             </span>
//           )}
//         </div>

//         {/* 5-Tier Flame Reaction Selector */}
//         <div className="grid grid-cols-5 gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-black/40 border border-white/[0.06] rounded-xl w-full">
//           {ratingTiers.map((tier) => {
//             const isSelected = selectedRating === tier.id;
//             const tierVotes = Number(reactions?.[tier.id] || 0);
//             const tierPct = totalMemeVotes > 0 ? Math.round((tierVotes / totalMemeVotes) * 100) : 0;

//             return (
//               <button
//                 key={tier.id}
//                 type="button"
//                 disabled={voted || loading}
//                 onClick={() => {
//                   if (voted || loading) return;
//                   setSelectedRating(tier.id);
//                 }}
//                 className={`py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all border min-w-0 w-full relative overflow-hidden ${voted ? "cursor-default" : "cursor-pointer hover:bg-white/[0.05]"
//                   } ${
//                   isSelected
//                   ? `${tier.bgSelected} ${tier.borderSelected} shadow-md scale-[1.02] sm:scale-[1.03]`
//                   : "bg-white/[0.02] border-transparent text-white/50"
//                 }`}
//               >
//                 <Flame
//                   size={16}
//                   className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${tier.flameColor} transition-transform duration-200 ${isSelected ? "scale-110 sm:scale-125 animate-bounce" : "opacity-60"
//                   }`}
//                   fill={isSelected ? "currentColor" : "none"}
//                 />
//                 <span
//                   className={`text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-black tracking-tight text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-0.5 ${isSelected ? tier.flameColor : "text-white/70"
//                     }`}
//                   title={tier.label}
//                 >
//                   {tier.label}
//                 </span>

//                 {/* Vote Count & Percentage Badge after voting */}
//                 {voted && (
//                   <div className="flex flex-col items-center w-full mt-0.5">
//                     <span
//                       className={`text-[8px] xs:text-[8.5px] sm:text-[9px] font-black px-1 leading-none text-center truncate max-w-full ${isSelected ? "text-white font-extrabold" : "text-white/60"
//                         }`}
//                     >
//                       {tierVotes.toLocaleString()}
//                     </span>
//                     <span className={`text-[7px] xs:text-[7.5px] sm:text-[8px] font-bold leading-none mt-0.5 ${isSelected ? tier.flameColor : "text-white/40"}`}>
//                       {tierPct}%
//                     </span>
//                     {/* Visual mini vote share indicator */}
//                     <div className="w-full bg-white/[0.08] h-1 rounded-full overflow-hidden mt-1 px-0.5">
//                       <div
//                         className={`h-full rounded-full transition-all duration-500 ${isSelected ? "bg-orange-500" : "bg-white/30"
//                           }`}
//                         style={{ width: `${tierPct}%` }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Heat Stats & Social Row */}
//       <div className="flex items-center justify-between text-[11px] font-bold text-white/60 mb-3 px-1">
//         <div className="flex items-center gap-2">
//           <span className="flex items-center gap-1 text-orange-400 font-black">
//             <BarChart2 size={13} className="text-orange-400" />
//             <span>{heatPct}% Heat</span>
//           </span>
//           <span className="text-white/20">•</span>
//           <span className="text-white/50">{totalMemeVotes.toLocaleString()} votes</span>
//         </div>
//       </div>

//       {/* Action Buttons Row — Skip button hidden after voting */}
//       <div className={voted ? "w-full" : "grid grid-cols-3 gap-2"}>
//         <button
//           onClick={() => handleRateMeme(selectedRating)}
//           disabled={voted || loading}
//           className={`${voted ? "w-full" : "col-span-2"} py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95 ${
//             voted
//               ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
//               : "bg-gradient-to-r from-[#FF3D57] to-[#FF7B02] hover:opacity-95 text-white shadow-orange-500/20"
//           }`}
//         >
//           {voted ? (
//             <>
//               <Check size={14} className="text-emerald-400" />
//               <span>Voted {selectedRating.toUpperCase()} (+2 PTS)</span>
//             </>
//           ) : (
//             <>
//               <Flame size={14} className="animate-pulse" />
//               <span>Vote {selectedRating.charAt(0).toUpperCase() + selectedRating.slice(1)}</span>
//             </>
//           )}
//         </button>


//       </div>

//       {/* Engagement Footer */}
//       <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
//         <div className="flex gap-4">
//           <button
//             onClick={handleLike}
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${
//               liked ? "text-[#FF3D57]" : "hover:text-white"
//             }`}
//           >
//             <Heart size={13} fill={liked ? "currentColor" : "none"} />
//             <span>{likesCount.toLocaleString()}</span>
//           </button>
//           <button
//             onClick={handleShare}
//             className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
//           >
//             <Share2 size={13} />
//           </button>
//         </div>
//         <span>{totalEngaged.toLocaleString()} engaged</span>
//       </div>
//     </motion.div>
//   );
// }

// // ─── Main FlipArena Component ───────────────────────────────────────────────
// export default function FlipArena({
//   selectedSport,
//   activeTab = "fliparena",
//   setActiveTab,
//   isPreview = true,
// }: FlipArenaProps) {
//   const { user } = useAuth();
//   const activeUserId = user?.userId || (user as any)?.actualUserId || user?.email;
//   const [engagements, setEngagements] = useState<EngagementItem[]>([]);
//   const [loadingEngagements, setLoadingEngagements] = useState(true);
//   const [filter, setFilter] = useState<"all" | "quiz" | "poll" | "battle" | "prediction" | "meme">("all");
//   const [toastMessage, setToastMessage] = useState<string | null>(null);
//   const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

//   // 1-second live clock for all countdowns and frequency unlocks
//   const [now, setNow] = useState<number>(Date.now());
//   useEffect(() => {
//     const timer = setInterval(() => setNow(Date.now()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalType, setModalType] = useState<EngagementType>("quiz");
//   const [editingItem, setEditingItem] = useState<EngagementItem | null>(null);

//   const [polls, setPolls] = useState<Poll[]>([]);
//   const [loadingPolls, setLoadingPolls] = useState(true);

//   const showToast = useCallback((msg: string) => {
//     setToastMessage(msg);
//     setTimeout(() => setToastMessage(null), 3000);
//   }, []);

//   const isFetchingEngagementsRef = useRef(false);
//   const lastFetchTimeRef = useRef(0);

//   const fetchEngagements = useCallback(async () => {
//     if (isFetchingEngagementsRef.current || Date.now() - lastFetchTimeRef.current < 2000) {
//       return;
//     }
//     isFetchingEngagementsRef.current = true;
//     lastFetchTimeRef.current = Date.now();
//     setLoadingEngagements(true);
//     try {
//       let liveItems = await engagementService.getEngagements({
//         sport: selectedSport && selectedSport !== "mixed" && selectedSport !== "all" ? selectedSport : undefined,
//         status: "active",
//         userId: activeUserId,
//       });

//       // Fallback 1: If sport-filtered query returned 0 items, fetch across all sports
//       if ((!liveItems || liveItems.length === 0) && selectedSport && selectedSport !== "mixed" && selectedSport !== "all") {
//         liveItems = await engagementService.getEngagements({
//           status: "active",
//           userId: activeUserId,
//         });
//       }

//       // Fallback 2: If status="active" was too restrictive, fetch without status constraint
//       if (!liveItems || liveItems.length === 0) {
//         liveItems = await engagementService.getEngagements({
//           userId: activeUserId,
//         });
//       }

//       if (liveItems && liveItems.length > 0) {
//         setEngagements(liveItems);
//       } else {
//         setEngagements([]);
//       }
//     } catch (err) {
//       console.warn("Could not fetch live engagements:", err);
//       setEngagements([]);
//     } finally {
//       setLoadingEngagements(false);
//       isFetchingEngagementsRef.current = false;
//     }
//   }, [selectedSport, activeUserId]);

//   useEffect(() => {
//     fetchEngagements();
//   }, [fetchEngagements]);

//   useEffect(() => {
//     const handleGlobalCreated = () => {
//       lastFetchTimeRef.current = 0;
//       engagementService.invalidateCache();
//       fetchEngagements();
//     };
//     window.addEventListener("arena-engagement-created", handleGlobalCreated);
//     return () => window.removeEventListener("arena-engagement-created", handleGlobalCreated);
//   }, [fetchEngagements]);

//   const handleOpenCreate = (type: EngagementType = "quiz") => {
//     setEditingItem(null);
//     setModalType(type);
//     setModalOpen(true);
//   };

//   const handleOpenEdit = (item: EngagementItem) => {
//     setEditingItem(item);
//     setModalType(item.type);
//     setModalOpen(true);
//   };

//   const handleDeleteEngagement = async (item: EngagementItem) => {
//     const isMeme = item.type === "meme";
//     const label = isMeme ? "meme" : "event";
//     if (!confirm(`Are you sure you want to delete this ${label} "${item.title || item.subtitle || "Untitled"}"?`)) {
//       return;
//     }
//     try {
//       await engagementService.deleteEngagement(item.id);
//       setEngagements((prev) => prev.filter((it) => it.id !== item.id));
//       showToast(`${isMeme ? "Meme" : "Event"} deleted successfully! 🗑️`);
//       engagementService.invalidateCache();
//     } catch (err) {
//       console.error("Failed to delete engagement item:", err);
//       showToast("Failed to delete item. Please try again.");
//     }
//   };

//   const handleItemSaved = (savedItem: EngagementItem, isEdit: boolean) => {
//     setEngagements((prev) => {
//       if (isEdit) {
//         return prev.map((it) => (it.id === savedItem.id ? savedItem : it));
//       }
//       return [savedItem, ...prev];
//     });

//     engagementService.invalidateCache();
//     fetchEngagements();

//     if (typeof window !== "undefined") {
//       window.dispatchEvent(
//         new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
//       );
//       window.dispatchEvent(new CustomEvent("arena-engagement-created", { detail: savedItem }));
//     }

//     if (!isEdit) {
//       showToast(
//         savedItem.type === "meme"
//           ? `Meme dropped into the Arena! 🔥 +${PARTICIPATION_POINTS} PTS earned`
//           : `Event published! +${PARTICIPATION_POINTS} PTS earned 🚀`
//       );
//     } else {
//       showToast("Event updated successfully!");
//     }
//   };

//   useEffect(() => {
//     fetch("/api/polls")
//       .then((res) => res.json())
//       .then((json) => {
//         setPolls(Array.isArray(json?.data) ? json.data : []);
//         setLoadingPolls(false);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch polls in FlipArena:", err);
//         setPolls([]);
//         setLoadingPolls(false);
//       });
//   }, []);

//   const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

//   // Auto-detect and open shared item from URL (e.g. ?itemId=quiz_123 or ?quizId=... or ?engagementId=... or #quiz_123)
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const urlParams = new URLSearchParams(window.location.search);
//     const sharedId =
//       urlParams.get("itemId") ||
//       urlParams.get("quizId") ||
//       urlParams.get("engagementId") ||
//       urlParams.get("cardId") ||
//       urlParams.get("id") ||
//       (window.location.hash ? window.location.hash.replace("#", "").replace(/^engagement-/, "") : null);
//     const sharedType = urlParams.get("type");

//     if (sharedId) {
//       setHighlightedItemId(sharedId);

//       // Auto-set matching tab filter if type parameter is provided
//       if (sharedType) {
//         const typeClean = sharedType.toLowerCase().trim();
//         if (typeClean === "quiz") setFilter("quiz");
//         else if (typeClean === "poll") setFilter("poll");
//         else if (typeClean === "fan_battle" || typeClean === "battle") setFilter("battle");
//         else if (typeClean === "prediction") setFilter("prediction");
//         else if (typeClean === "meme") setFilter("meme");
//         else setFilter("all");
//       }

//       // If item is not in local engagements list yet, fetch it individually
//       engagementService.getEngagementById(sharedId).then((singleItem) => {
//         if (singleItem) {
//           setEngagements((prev) => {
//             if (prev.some((x) => x.id === singleItem.id)) return prev;
//             return [singleItem, ...prev];
//           });

//           // If no type was specified in URL, align filter to the fetched item's type
//           if (!sharedType && singleItem.type) {
//             const t = singleItem.type.toLowerCase().trim();
//             if (t === "quiz") setFilter("quiz");
//             else if (t === "poll") setFilter("poll");
//             else if (t === "fan_battle") setFilter("battle");
//             else if (t === "prediction") setFilter("prediction");
//             else if (t === "meme") setFilter("meme");
//           }

//           showToast(`🎯 Opened shared ${singleItem.type ? singleItem.type.toUpperCase() : "item"}: "${singleItem.title || 'Event'}"`);
//         }
//       }).catch((err) => {
//         console.warn("Could not fetch shared engagement item:", err);
//       });
//     }
//   }, [showToast]);

//   // Smoothly scroll and center the spotlighted card once rendered in the DOM
//   useEffect(() => {
//     if (!highlightedItemId) return;
//     let attempts = 0;
//     const interval = setInterval(() => {
//       attempts++;
//       const targetEl = document.getElementById(`engagement-${highlightedItemId}`);
//       if (targetEl) {
//         targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
//         clearInterval(interval);
//       } else if (attempts > 25) {
//         clearInterval(interval);
//       }
//     }, 150);

//     return () => clearInterval(interval);
//   }, [highlightedItemId, engagements]);

//   const filteredEngagements = useMemo(() => {
//     return engagements
//       .filter((item) => {
//         if (!item || !item.title || !item.type) return false;

//         // Always include the highlighted shared item even if filter differs
//         if (highlightedItemId && item.id === highlightedItemId) return true;

//         const itemType = (item.type || "").toLowerCase().trim();
//         if (filter === "all") return true;
//         if (filter === "battle") return itemType === "fan_battle";
//         if (filter === "quiz") return itemType === "quiz";
//         if (filter === "poll") return itemType === "poll";
//         if (filter === "prediction") return itemType === "prediction";
//         if (filter === "meme") return itemType === "meme";

//         return true;
//       })
//       .sort((a, b) => {
//         // Highlighted shared item always sorted to the very top
//         if (highlightedItemId) {
//           if (a.id === highlightedItemId) return -1;
//           if (b.id === highlightedItemId) return 1;
//         }

//         const getTime = (val: any) => {
//           if (typeof val === "number") return val;
//           const time = new Date(val || 0).getTime();
//           return isNaN(time) ? 0 : time;
//         };

//         return getTime(b.createdAt) - getTime(a.createdAt);
//       });
//   }, [engagements, filter, highlightedItemId]);

//   return (
//     <div className="w-full bg-[#070b14] min-h-screen text-white flex flex-col font-sans pb-16 relative">
//       <AnimatePresence>
//         {toastMessage && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#161e2e] border border-white/20 text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-lg"
//           >
//             <Zap size={14} className="text-amber-400" />
//             <span>{toastMessage}</span>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {!isPreview && (
//         <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => (window.location.href = "/MainModules/HomePage")}
//               className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
//             >
//               <ArrowLeft size={16} />
//             </button>
//             <div>
//               <div className="flex items-center gap-2">
//                 <h1 className="text-base font-black tracking-tight">Flip Arena 🏟️</h1>
//                 <span className="text-[9px] font-black bg-gradient-to-r from-pink-500 to-orange-500 text-white px-2 py-0.5 rounded-full tracking-wider animate-pulse">
//                   LIVE
//                 </span>
//               </div>
//               <div className="flex items-center gap-2 mt-0.5">
//                 <span className="text-[9px] font-bold text-white/40">🏏 Cricket</span>
//                 <span className="text-[9px] font-bold text-white/40">⚽ Football</span>
//                 <span className="text-[9px] font-bold text-white/40">🏃 Athletics</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {!isPreview && (
//         <div className="px-4 mb-4 mt-4">
//           <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner">
//             <button
//               onClick={() => (window.location.href = "/MainModules/FlipLine")}
//               className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer border-none"
//               style={{
//                 background: "transparent",
//                 color: "rgba(255,255,255,0.4)",
//               }}
//             >
//               <span className="text-sm">⚡</span> FlipLine
//             </button>
//             <button
//               className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer border-none"
//               style={{
//                 background: "linear-gradient(90deg, #FF3D57, #FF7B02)",
//                 color: "#fff",
//                 boxShadow: "0 4px 15px rgba(255, 61, 87, 0.25)",
//               }}
//             >
//               <span className="text-sm">🏟️</span> Flip Arena
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05] mt-2 gap-2 flex-wrap">
//         <div>
//           <h2 className="text-base font-black tracking-tight">Today's Arena</h2>
//           <p className="text-[10px] text-white/35 mt-0.5">Official SF360 events · Earn +2 PTS participation · +10 PTS for correct answers</p>
//         </div>

//         <div className="flex items-center gap-2 flex-wrap">
//           <button
//             onClick={() => setShowLeaderboardModal(true)}
//             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-400 hover:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
//             title="Open Leaderboards"
//           >
//             <Trophy size={13} className="text-amber-400" />
//             <span>Leaderboard</span>
//           </button>
//           <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05] overflow-x-auto">
//             {(["all", "quiz", "poll", "battle", "prediction", "meme"] as const).map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setFilter(tab)}
//                 className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0"
//                 style={{
//                   backgroundColor: filter === tab ? "rgba(255,255,255,0.08)" : "transparent",
//                   color: filter === tab ? "#fff" : "rgba(255,255,255,0.45)",
//                 }}
//               >
//                 {tab === "all" ? "All" : tab === "meme" ? "🔥 Meme" : tab}
//               </button>
//             ))}
//           </div>

//           <button
//             onClick={() => handleOpenCreate("meme")}
//             title="Add Sports Meme (+2 PTS)"
//             className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 hover:from-orange-500/30 hover:to-purple-500/30 border border-orange-500/40 text-orange-300 flex items-center gap-1.5 font-extrabold text-[10.5px] transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
//           >
//             <Flame size={13} className="text-orange-400 animate-pulse" />
//             <span>Add Meme</span>
//           </button>

//           <button
//             onClick={() => handleOpenCreate("quiz")}
//             title="Create Quiz, Battle or Poll (+2 PTS)"
//             className="p-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 text-pink-300 flex items-center gap-1 font-extrabold text-[11px] transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
//           >
//             <Plus size={13} strokeWidth={2.8} />
//             <span className="hidden sm:inline">Add</span>
//           </button>
//         </div>
//       </div>

//       <div className="px-4 space-y-5 mt-2 flex flex-col items-center w-full">
//         {/* Dedicated Meme Arena Header Banner */}
//         {filter === "meme" && (
//           <div className="w-full max-w-lg bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 border border-orange-500/25 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-sm">
//             <div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-black text-white flex items-center gap-1.5">
//                   <Flame size={16} className="text-orange-400 animate-pulse" />
//                   <span>Meme Arena</span>
//                 </span>
//                 <span className="flex items-center gap-1 text-[9px] font-black bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
//                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//                   Live Now
//                 </span>
//               </div>
//               <p className="text-[10px] text-white/50 mt-0.5">Funniest memes. Hottest takes. Only on SportsFan360.</p>
//             </div>
//             <button
//               onClick={() => handleOpenCreate("meme")}
//               className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-lg shadow-orange-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
//             >
//               <Plus size={13} /> Add Meme
//             </button>
//           </div>
//         )}

//         {loadingEngagements && engagements.length === 0 ? (
//           <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/40 text-xs font-bold">
//             <div className="w-6 h-6 border-2 border-[#FF3D57] border-t-transparent rounded-full animate-spin" />
//             <span>Loading live arena battles...</span>
//           </div>
//         ) : filteredEngagements.length === 0 ? (
//           <div className="py-12 text-center text-xs font-bold text-white/40 border border-white/[0.06] rounded-2xl bg-[#0e111a] p-8 w-full max-w-lg space-y-3">
//             <p>No events found for this filter.</p>
//             <button
//               onClick={() =>
//                 handleOpenCreate(
//                   filter === "all"
//                     ? "quiz"
//                     : filter === "battle"
//                     ? "fan_battle"
//                     : filter === "prediction"
//                     ? "prediction"
//                     : filter === "meme"
//                     ? "meme"
//                     : filter
//                 )
//               }
//               className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-pink-500/20 cursor-pointer"
//             >
//               <Plus size={13} /> Create First {filter === "all" ? "Event" : filter.toUpperCase()} (+2 PTS)
//             </button>
//           </div>
//         ) : (
//           <AnimatePresence mode="popLayout">
//             {filteredEngagements.map((item) => {
//               const isItemHighlighted = highlightedItemId === item.id;
//               if (item.type === "fan_battle") {
//                 return (
//                   <DynamicFanBattleCard
//                     key={item.id}
//                     item={item}
//                     userId={activeUserId}
//                     now={now}
//                     onToast={showToast}
//                     onEdit={handleOpenEdit}
//                     isHighlighted={isItemHighlighted}
//                   />
//                 );
//               }
//               if (item.type === "quiz") {
//                 return (
//                   <DynamicQuizCard
//                     key={item.id}
//                     item={item}
//                     userId={activeUserId}
//                     now={now}
//                     onToast={showToast}
//                     onEdit={handleOpenEdit}
//                     isHighlighted={isItemHighlighted}
//                   />
//                 );
//               }
//               if (item.type === "poll") {
//                 return (
//                   <DynamicPollCard
//                     key={item.id}
//                     item={item}
//                     userId={activeUserId}
//                     now={now}
//                     onToast={showToast}
//                     onEdit={handleOpenEdit}
//                     isHighlighted={isItemHighlighted}
//                   />
//                 );
//               }
//               if (item.type === "prediction") {
//                 return (
//                   <DynamicPredictionCard
//                     key={item.id}
//                     item={item}
//                     userId={activeUserId}
//                     now={now}
//                     onToast={showToast}
//                     onEdit={handleOpenEdit}
//                     isHighlighted={isItemHighlighted}
//                   />
//                 );
//               }
//               if (item.type === "meme") {
//                 return (
//                   <DynamicMemeCard
//                     key={item.id}
//                     item={item}
//                     userId={activeUserId}
//                     now={now}
//                     onToast={showToast}
//                     onEdit={handleOpenEdit}
//                     onDelete={handleDeleteEngagement}
//                     isHighlighted={isItemHighlighted}
//                   />
//                 );
//               }
//               return null;
//             })}
//           </AnimatePresence>
//         )}

//         {isPreview && (
//           <div className="w-full max-w-lg mt-4 px-2">
//             <button
//               onClick={() => (window.location.href = "/MainModules/FlipArena")}
//               className="w-full py-[11px] rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
//               style={{
//                 background: "rgba(255,255,255,0.045)",
//                 border: "1px solid rgba(255,255,255,0.1)",
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: 11.5,
//                   fontWeight: 800,
//                   color: "rgba(255,255,255,0.55)",
//                 }}
//               >
//                 View Full Flip Arena
//               </span>
//               <svg
//                 width="11"
//                 height="11"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="rgba(255,255,255,0.4)"
//                 strokeWidth="2.5"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M9 18l6-6-6-6" />
//               </svg>
//             </button>
//           </div>
//         )}
//       </div>

//       <LeaderboardOverlayModal
//         isOpen={showLeaderboardModal}
//         onClose={() => setShowLeaderboardModal(false)}
//       />

//       <ArenaEngagementModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         initialType={modalType}
//         editingItem={editingItem}
//         onSaved={handleItemSaved}
//         onToast={showToast}
//       />
//     </div>
//   );
// }




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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LeaderboardOverlayModal from "@/src/components/NewHomeComponents/LeaderboardOverlayModal";
import ArenaEngagementModal from "./ArenaEngagementModal";

// ─── Standard Points Constants ──────────────────────────────────────────────
const PARTICIPATION_POINTS = 2; // Every section awards strictly +2 PTS for participation
const CORRECT_OPTION_BONUS = 10; // Quiz, Poll, Prediction correct answer awards +10 PTS bonus

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

// ─── 1. Fan Battle Card Component (+2 PTS Participation) ────────────────────
function DynamicFanBattleCard({
  item,
  userId,
  now,
  onToast,
  onEdit,
  isHighlighted = false,
}: {
  item: EngagementItem;
  userId?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
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
  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);

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
      const res: any = await engagementService.voteEngagement(item.id, side, userId);
      const calculatedResult = {
        leftPercentage: res?.leftPercentage ?? (side === "left" ? 68 : 32),
        rightPercentage: res?.rightPercentage ?? (side === "right" ? 68 : 32),
        totalVotes: res?.totalVotes ?? (left.votes + right.votes + 1),
      };
      setResult(calculatedResult);
      onToast(`+${PARTICIPATION_POINTS} PTS earned for voting in Fan Battle! ⚔️`);
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
      className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-[#FF3D57] border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative group transition-all duration-300 ${isHighlighted
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
          {/* <span className="text-[#FF7B02] flex items-center gap-0.5">🔥 +2 PTS / VOTE</span> */}
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

      <h3 className="text-sm font-black mb-4">{item.title}</h3>

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
        <span>{totalEngaged.toLocaleString()} engaged</span>
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

// ─── 2. Quiz Card Component (+2 PTS Participation, +10 PTS Correct) ────────
function DynamicQuizCard({
  item,
  userId,
  now,
  onToast,
  onEdit,
  isHighlighted = false,
}: {
  item: EngagementItem;
  userId?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
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
  const [totalScore, setTotalScore] = useState<number>(Number(initialFinish?.score) || 0);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const currentQ = rawQuestions[Math.min(currentQIndex, totalQuestions - 1)];
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

  const [selectedId, setSelectedId] = useState<string | null>(
    initialQ?.selectedId || (item.userVoted && item.userVote ? item.userVote : null)
  );
  const [answered, setAnswered] = useState<boolean>(Boolean(initialQ || (totalQuestions === 1 && item.userVoted)));
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    initialQ
      ? initialQ.isCorrect
      : item.userVoted && item.userVote
        ? checkIsOptionCorrect(item.userVote, currentQ)
        : null
  );

  const isAnsweringRef = useRef(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  // Track whether the current user has already engaged with any question in this quiz
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

  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);

  useEffect(() => {
    if (item.totalEngaged !== undefined) {
      setTotalEngaged((prev) => Math.max(prev, Number(item.totalEngaged) || 0));
    }
  }, [item.totalEngaged]);

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
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, checkIsOptionCorrect, currentQ, currentQIndex, totalQuestions]);

  const handleOptionSelect = async (optId: string) => {
    if (answered || isScheduled || isAnsweringRef.current) return;
     isAnsweringRef.current = true;   
    const qKey = `quiz_q_${currentQ?.id || currentQIndex}`;
    const existing = getStoredVote(qKey, item.id, userId);
    // if (existing) return;
     if (existing) {
    isAnsweringRef.current = false;       // ← reset if we're bailing out
    return;
  }

    isAnsweringRef.current = true;
    setSelectedId(optId);
    setAnswered(true);

    // CRITICAL FIX: Only increment totalEngaged ONCE per quiz set, not on each question!
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

    if (totalQuestions === 1 || currentQIndex === totalQuestions - 1) {
      setQuizFinished(true);
      setStoredVote("quiz_finish", item.id, { finished: true, score: nextTotal }, userId);
      setStoredVote("quiz_engaged", item.id, true, userId);
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
          ? `🎉 Correct! +${earned} PTS (+${PARTICIPATION_POINTS} played, +${CORRECT_OPTION_BONUS} bonus)`
          : `💡 +${earned} PTS for participating!`
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
      setStoredVote("quiz_finish", item.id, { finished: true, score: totalScore }, userId);
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

  return (
    <motion.div
    layout={false}
      id={`engagement-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-purple-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
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
          {/* <span>•</span> */}
          {/* <span className="text-amber-400">⭐ +2 PTS / PLAY • +10 PTS CORRECT</span> */}
          {/* {frequencyMinutes && (
            <>
              <span>•</span>
              <span className="text-cyan-400 font-mono">⏱️ {frequencyMinutes}M INTERVAL</span>
            </>
          )} */}
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

      <div className="flex items-center justify-between gap-2 mb-1.5">
        {/* <h3 className="text-sm font-black text-white truncate">{item.title}</h3> */}
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
          {/* <p className="text-xs text-white/70">
            Question #1 unlocks in <strong className="text-amber-400 font-mono">{formatCountdown(timeToStartMs)}</strong>
          </p> */}
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
                    ? `Correct! +${CORRECT_OPTION_BONUS} PTS Bonus (+${PARTICIPATION_POINTS + CORRECT_OPTION_BONUS} PTS Total)`
                    : `+${PARTICIPATION_POINTS} PTS for participating · The correct answer is ${correctOptionId}`}
                </span>
              </div>

              {totalQuestions > 1 && currentQIndex < totalQuestions - 1 && (
                <>
                  {isNextQuestionLocked ? (
                    <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between text-xs font-bold text-white/80">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Clock size={13} /> Next Question #{currentQIndex + 2} in:
                      </span>
                      <span className="font-mono text-amber-400 font-extrabold text-sm">
                        {formatCountdown(msToNextQuestionSlot)}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                    >
                      <span>Next Question</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </>
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
        <span>{totalEngaged.toLocaleString()} engaged</span>
      </div>
    </motion.div>
  );
}

// ─── 3. Poll Card Component (+2 PTS Participation, +10 PTS Correct Option) ──
function DynamicPollCard({
  item,
  userId,
  now,
  onToast,
  onEdit,
  isHighlighted = false,
}: {
  item: EngagementItem;
  userId?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
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
  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);

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
            onToast(`🏆 Correct Answer! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🎉`);
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
              onToast(`🏆 Correct Answer! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🎉`);
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
                    onToast(`🏆 Correct Answer! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🎉`);
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
      const res: any = await engagementService.voteEngagement(item.id, optId, userId);
      if (res?.success && res.options) {
        setOptions(res.options);
      } else {
        setOptions((prev) =>
          prev.map((o) => (o.id === optId ? { ...o, votes: (o.votes || 0) + 1 } : o))
        );
      }
      onToast(`+${PARTICIPATION_POINTS} PTS earned for voting! 📊`);
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
      className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-blue-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
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

      <h3 className="text-sm font-black mb-3">{item.pollData?.question || item.title}</h3>

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
                    <span>Correct Answer! You earned +10 PTS Bonus (+12 PTS Total)</span>
                  </span>
                  <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                    +10 PTS
                  </span>
                </div>
              ) : correctAnswer ? (
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
                  <span>
                    Poll closed
                    {/* Winning answer: <strong className="text-emerald-400">{correctAnswer}</strong> */}
                  </span>
                  <span className="text-[10px] text-white/40 shrink-0">+2 PTS participation</span>
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
              <span>+2 PTS earned!</span>
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
        <span>{totalEngaged.toLocaleString()} engaged</span>
      </div>
    </motion.div>
  );
}

// ─── 4. Prediction Card Component (+2 PTS Participation, +10 PTS Correct) ───
function DynamicPredictionCard({
  item,
  userId,
  now,
  onToast,
  onEdit,
  isHighlighted = false,
}: {
  item: EngagementItem;
  userId?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
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
  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || 0);
  const [result, setResult] = useState<{
    leftPercentage: number;
    rightPercentage: number;
    coinsLocked: number;
  } | null>(() => {
    const c = initialVote?.choice || (item.userVote as "left" | "right");
    if (!c) return null;
    return {
      leftPercentage: c === "left" ? 71 : 29,
      rightPercentage: c === "right" ? 71 : 29,
      coinsLocked: initialVote?.coinsLocked || pred.coinStake || 25,
    };
  });

  const startTime = getEngagementStartTime(item);
  const isScheduled = startTime > now;
  const timeToStartMs = Math.max(0, startTime - now);

  const durationMins = Number(item.predictionData?.durationMinutes || item.predictionData?.timerMinutes || 30);
  const expiresAt = item.predictionData?.expiresAt || (startTime + durationMins * 60 * 1000);
  const isExpired = now >= expiresAt;
  const timeRemainingMs = Math.max(0, expiresAt - now);

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
      setResult({
        leftPercentage: stored.choice === "left" ? 71 : 29,
        rightPercentage: stored.choice === "right" ? 71 : 29,
        coinsLocked: stored.coinsLocked || pred.coinStake || 25,
      });
    }

    if (item.userVoted && item.userVote) {
      const choice = item.userVote as "left" | "right";
      setSelectedChoice(choice);
      setPredicted(true);
      setStoredVote("pred", item.id, { choice, coinsLocked: pred.coinStake || 25 }, userId);
      setResult({
        leftPercentage: choice === "left" ? 71 : 29,
        rightPercentage: choice === "right" ? 71 : 29,
        coinsLocked: pred.coinStake || 25,
      });
    }

    if (userId) {
      engagementService
        .checkVoteStatus(item.id, userId)
        .then((res) => {
          if (res.hasVoted && res.selectedOptionId) {
            const choice = res.selectedOptionId as "left" | "right";
            setSelectedChoice(choice);
            setPredicted(true);
            setStoredVote("pred", item.id, { choice, coinsLocked: pred.coinStake || 25 }, userId);
            setResult({
              leftPercentage: choice === "left" ? 71 : 29,
              rightPercentage: choice === "right" ? 71 : 29,
              coinsLocked: pred.coinStake || 25,
            });
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
            onToast(`🎯 Prediction Won! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🏆`);
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("sf360:points-updated", { detail: { points: CORRECT_OPTION_BONUS } })
              );
            }
          }
        })
        .catch(() => { });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, pred.coinStake, bonusClaimKey, onToast]);

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
              onToast(`🎯 Prediction Won! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🏆`);
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
                    onToast(`🎯 Prediction Won! +${CORRECT_OPTION_BONUS} PTS Accuracy Bonus Awarded! 🏆`);
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
      const computedResult = {
        leftPercentage: res?.leftPercentage ?? (choice === "left" ? 71 : 29),
        rightPercentage: res?.rightPercentage ?? (choice === "right" ? 71 : 29),
        coinsLocked: res?.coinsLocked || pred.coinStake || 25,
      };
      setResult(computedResult);
      onToast(`+${PARTICIPATION_POINTS} PTS earned for prediction! 🎯`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
        );
      }
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
      isPredictingRef.current = false;
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
      className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-amber-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
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

      <p className="text-xs font-semibold text-white/70 mb-4">{pred.question}</p>

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
                  <span>Prediction Won! You earned +10 PTS Bonus (+12 PTS Total)</span>
                </span>
                <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                  +10 PTS
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
                <span>
                  Prediction closed 
                  {/* <strong className="text-amber-400">{winningTarget || "Ended"}</strong> */}
                </span>
                <span className="text-[10px] text-white/40 shrink-0">+2 PTS participation</span>
              </div>
            )
          ) : (
            <div className="text-[11px] font-black text-center text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-center gap-1.5">
              <span>🔒</span>
              <span>+2 PTS earned!</span>
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
        <span>{totalEngaged.toLocaleString()} engaged</span>
      </div>
    </motion.div>
  );
}

// ─── 5. Meme Card Component (5 Heat Rating Tiers +2 PTS Participation) ───────
function DynamicMemeCard({
  item,
  userId,
  onToast,
  onEdit,
  onDelete,
  isHighlighted = false,
}: {
  item: EngagementItem;
  userId?: string;
  now: number;
  onToast: (msg: string) => void;
  onEdit?: (item: EngagementItem) => void;
  onDelete?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
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

  // Dynamic Author Resolution
  const authorName =
    item.creatorName ||
    (item as any).userName ||
    meme.authorName ||
    (item.creatorEmail ? item.creatorEmail.split("@")[0] : "") ||
    ((item as any).userEmail ? (item as any).userEmail.split("@")[0] : "") ||
    "SportsFan";

  const authorHandle =
    meme.authorHandle ||
    (item.creatorEmail
      ? `@${item.creatorEmail.split("@")[0]}`
      : `@${authorName.replace(/\s+/g, "")}`);

  const authorAvatar =
    meme.authorAvatar ||
    (item as any).creatorAvatar ||
    (item as any).userAvatar ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";

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

  const getTimeAgo = (timestamp?: number | string) => {
    if (!timestamp) return "Just now";
    const ts = typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();
    if (isNaN(ts) || ts <= 0) return "Just now";
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

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
  const [totalEngaged, setTotalEngaged] = useState<number>(Number(item.totalEngaged) || Number(meme.totalVotes) || 0);
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
      const res: any = await engagementService.voteEngagement(item.id, finalRating, userId);
      if (res?.heatPercentage !== undefined) setHeatPct(res.heatPercentage);
      if (res?.totalVotes !== undefined) setTotalMemeVotes(res.totalVotes);
      if (res?.reactions) setReactions(res.reactions);

      onToast(`🔥 Voted ${finalRating.toUpperCase()}! +${PARTICIPATION_POINTS} PTS earned!`);
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
      className={`w-full max-w-lg bg-[#0e111a] border-l-2 border-orange-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-3.5 sm:p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
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
      {/* Author Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
            onError={(e: any) => {
              e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
            }}
          />
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white truncate flex items-center gap-1.5">
              <span>Meme by {authorName}</span>
              <span className="text-white/40 text-[10px] font-semibold font-mono truncate">{authorHandle}</span>
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40">
              <span>{getTimeAgo(getEngagementPostingTime(item))}</span>
              <span>•</span>
              <span className="text-orange-400 font-extrabold uppercase">🔥 MEME ARENA</span>
            </div>
          </div>
        </div>

        {/* Only the author who posted (or admin) can edit */}
        {isAuthor && (onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              title="Meme options"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-36 bg-[#161a26] border border-white/10 rounded-xl py-1 shadow-2xl z-30 text-xs">
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

      {/* Meme Title / Headline */}
      {item.title && (
        <h3 className="text-sm font-black text-white mb-2 tracking-tight leading-snug">
          {item.title}
        </h3>
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
              <span>Voted {selectedRating.toUpperCase()} (+2 PTS)</span>
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
  const [engagements, setEngagements] = useState<EngagementItem[]>([]);
  const [loadingEngagements, setLoadingEngagements] = useState(true);
  const [filter, setFilter] = useState<"all" | "quiz" | "poll" | "battle" | "prediction" | "meme">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

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
          ? `Meme dropped into the Arena! 🔥 +${PARTICIPATION_POINTS} PTS earned`
          : `Event published! +${PARTICIPATION_POINTS} PTS earned 🚀`
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

      <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05] mt-2 gap-2 flex-wrap">
        <div>
          <h2 className="text-base font-black tracking-tight">Today's Arena</h2>
          <p className="text-[10px] text-white/35 mt-0.5">Official SF360 events · Earn +2 PTS participation · +10 PTS for correct answers</p>
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
                {tab === "all" ? "All" : tab === "meme" ? "🔥 Meme" : tab}
              </button>
            ))}
          </div>


        </div>
      </div>

      <div className="px-4 space-y-5 mt-2 flex flex-col items-center w-full">
        {/* Dedicated Meme Arena Header Banner */}
        {filter === "meme" && (
          <div className="w-full max-w-lg bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 border border-orange-500/25 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white flex items-center gap-1.5">
                  <Flame size={16} className="text-orange-400 animate-pulse" />
                  <span>Meme Arena</span>
                </span>
                <span className="flex items-center gap-1 text-[9px] font-black bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Now
                </span>
              </div>
              <p className="text-[10px] text-white/50 mt-0.5">Funniest memes. Hottest takes. Only on SportsFan360.</p>
            </div>
            <button
              onClick={() => handleOpenCreate("meme")}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-lg shadow-orange-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus size={13} /> Add Meme
            </button>
          </div>
        )}

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
              <Plus size={13} /> Create First {filter === "all" ? "Event" : filter.toUpperCase()} (+2 PTS)
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredEngagements.map((item) => {
              const isItemHighlighted = highlightedItemId === item.id;
              if (item.type === "fan_battle") {
                return (
                  <DynamicFanBattleCard
                    key={item.id}
                    item={item}
                    userId={activeUserId}
                    now={now}
                    onToast={showToast}
                    onEdit={handleOpenEdit}
                    isHighlighted={isItemHighlighted}
                  />
                );
              }
              if (item.type === "quiz") {
                return (
                  <DynamicQuizCard
                    key={item.id}
                    item={item}
                    userId={activeUserId}
                    now={now}
                    onToast={showToast}
                    onEdit={handleOpenEdit}
                    isHighlighted={isItemHighlighted}
                  />
                );
              }
              if (item.type === "poll") {
                return (
                  <DynamicPollCard
                    key={item.id}
                    item={item}
                    userId={activeUserId}
                    now={now}
                    onToast={showToast}
                    onEdit={handleOpenEdit}
                    isHighlighted={isItemHighlighted}
                  />
                );
              }
              if (item.type === "prediction") {
                return (
                  <DynamicPredictionCard
                    key={item.id}
                    item={item}
                    userId={activeUserId}
                    now={now}
                    onToast={showToast}
                    onEdit={handleOpenEdit}
                    isHighlighted={isItemHighlighted}
                  />
                );
              }
              if (item.type === "meme") {
                return (
                  <DynamicMemeCard
                    key={item.id}
                    item={item}
                    userId={activeUserId}
                    now={now}
                    onToast={showToast}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteEngagement}
                    isHighlighted={isItemHighlighted}
                  />
                );
              }
              return null;
            })}
          </AnimatePresence>
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
    </div>
  );
}
