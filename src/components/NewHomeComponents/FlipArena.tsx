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
//   ChevronUp,
//   X,
//   RefreshCw,
//   Lock,
//   Flame,
//   MessageCircle,
//   MoreVertical,
//   Info,
//   Users,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import LeaderboardOverlayModal from "@/src/components/NewHomeComponents/LeaderboardOverlayModal";
// import ArenaEngagementModal from "./ArenaEngagementModal";
// import axios from "axios";

// // ─── Standard Points Constants ──────────────────────────────────────────────
// const PARTICIPATION_POINTS = 2; // Every section awards strictly +2 SXPs for participation
// const CORRECT_OPTION_BONUS = 10; // Quiz, Poll, Prediction correct answer awards +10 SXPs bonus

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

// function getEngagementPostingTime(item: EngagementItem): number {
//   const raw =
//     (item as any).postingTime ||
//     (item as any).postedAt ||
//     (item.quizData as any)?.postingTime ||
//     (item.pollData as any)?.postingTime ||
//     (item.predictionData as any)?.postingTime ||
//     (item.fanBattleData as any)?.postingTime ||
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
//     (item.memeData as any)?.createdAt ||
//     item.createdAt ||
//     0;

//   if (typeof raw === "number") return raw;
//   const parsed = new Date(raw).getTime();
//   return isNaN(parsed) || parsed <= 0 ? (Number(item.createdAt) || 0) : parsed;
// }

// function getEngagementStartTime(item: EngagementItem): number {
//   return getEngagementPostingTime(item);
// }

// function formatEngagementPostingTime(item: EngagementItem): string {
//   const ts = getEngagementPostingTime(item) || Number(item.createdAt) || Date.now();
//   const date = new Date(ts);
//   if (isNaN(date.getTime())) return "";

//   const timeStr = date.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   const now = new Date();
//   const isToday =
//     date.getDate() === now.getDate() &&
//     date.getMonth() === now.getMonth() &&
//     date.getFullYear() === now.getFullYear();

//   if (isToday) return timeStr;

//   const yesterday = new Date();
//   yesterday.setDate(now.getDate() - 1);
//   const isYesterday =
//     date.getDate() === yesterday.getDate() &&
//     date.getMonth() === yesterday.getMonth() &&
//     date.getFullYear() === yesterday.getFullYear();

//   if (isYesterday) return `Yesterday, ${timeStr}`;

//   return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
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

// // ─── Quiz Per-Question Answer Key (collision-proof) ──────────────────────────
// function quizAnswerKey(index: number, questionId?: string) {
//   return `quiz_ans_${index}_${questionId ?? ""}`;
// }

// // ─── Global Voter Identity Match Helper ──────────────────────────────────────
// function checkVoterMatch(voter: any, userId?: string, userName?: string, userEmail?: string): boolean {
//   if (!voter) return false;
//   const uid = String(userId || "").trim().toLowerCase();
//   const uname = String(userName || "").trim().toLowerCase();
//   const uemail = String(userEmail || "").trim().toLowerCase();

//   const vUid = String(voter.userId || voter.actualUserId || voter.id || "").trim().toLowerCase();
//   const vName = String(voter.userName || voter.username || voter.name || "").trim().toLowerCase();
//   const vEmail = String((voter as any).userEmail || voter.email || "").trim().toLowerCase();

//   if (uid && vUid && (uid === vUid || vUid.includes(uid) || uid.includes(vUid))) return true;
//   if (uemail && vEmail && uemail === vEmail) return true;
//   if (uname && vName && uname === vName) return true;
//   return false;
// }

// // ─── Direct Engagement Share URL Generator ───────────────────────────────────
// function getEngagementShareUrl(item: EngagementItem): string {
//   if (typeof window === "undefined") return "";
//   const origin = window.location.origin;
//   const itemType = item.type || "quiz";
//   const targetId = (item as any)._parentEngagementId || item.id;
//   return `${origin}/MainModules/FlipArena?itemId=${encodeURIComponent(targetId)}&type=${encodeURIComponent(itemType)}`;
// }

// // ─── Current User Identity Helper (Zero Hardcoding) ──────────────────────────
// function resolveCurrentUser(user: any) {
//   let cached: any = null;
//   if (typeof window !== 'undefined') {
//     try {
//       const stored = localStorage.getItem('auth_user');
//       if (stored) cached = JSON.parse(stored);
//     } catch { }
//   }
//   const activeUserId =
//     user?.userId ||
//     (user as any)?.actualUserId ||
//     user?.uid ||
//     (user as any)?.id ||
//     cached?.userId ||
//     cached?.actualUserId ||
//     cached?.uid ||
//     cached?.id ||
//     user?.email ||
//     cached?.email ||
//     '';

//   const userEmail = user?.email || cached?.email || '';
//   const userName =
//     user?.name ||
//     user?.displayName ||
//     (user as any)?.userName ||
//     cached?.name ||
//     cached?.displayName ||
//     (userEmail ? userEmail.split('@')[0] : 'SportsFan');
//   const rawAvatar =
//     user?.photoURL ||
//     user?.avatarUrl ||
//     (user as any)?.avatar ||
//     cached?.photoURL ||
//     cached?.avatarUrl ||
//     cached?.avatar ||
//     '';
//   const userAvatar = typeof rawAvatar === 'string' && !rawAvatar.includes('dicebear') ? rawAvatar : '';

//   return { activeUserId, userEmail, userName, userAvatar };
// }

// // ─── 1. Fan Battle Card Component (+2 SXPs Participation) ────────────────────
// function DynamicFanBattleCard({
//   item,
//   userId,
//   userName,
//   userAvatar,
//   userEmail,
//   now,
//   onToast,
//   onEdit,
//   isHighlighted = false,
//   onOpenEngagedModal,
//   isEngagedExpanded = false,
//   totalEngagedOverride,
//   onSyncEngagedCount,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   userName?: string;
//   userAvatar?: string;
//   userEmail?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//   isHighlighted?: boolean;
//   onOpenEngagedModal?: (item: EngagementItem) => void;
//   isEngagedExpanded?: boolean;
//   totalEngagedOverride?: number;
//   onSyncEngagedCount?: (count: number) => void;
// }) {
//   const initialStored = getStoredVote("fb", item.id, userId);
//   const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(
//     initialStored?.side || (item.userVote as "left" | "right") || null
//   );
//   const [loading, setLoading] = useState(false);
//   const isVotingRef = useRef(false);
//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
//   const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
//   const [totalEngaged, setTotalEngaged] = useState<number>(() => {
//     const raw = totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || 0);
//     return (selectedSide !== null || initialStored || item.userVoted) ? Math.max(1, raw) : raw;
//   });

//   useEffect(() => {
//     if (totalEngagedOverride !== undefined) {
//       setTotalEngaged((prev) => {
//         const nextVal = (selectedSide !== null || item.userVoted) ? Math.max(1, totalEngagedOverride) : totalEngagedOverride;
//         return Math.max(prev, nextVal);
//       });
//     }
//   }, [totalEngagedOverride, selectedSide, item.userVoted]);

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
//       axios
//         .get(`/api/engagements/${item.id}/voters`)
//         .then((res) => {
//           if (res.data?.options) {
//             for (const opt of res.data.options) {
//               if ((opt.voters || []).some((v: any) => checkVoterMatch(v, userId, userName, userEmail))) {
//                 const side = (opt.id || opt.text) as "left" | "right";
//                 setSelectedSide(side);
//                 setStoredVote("fb", item.id, { side }, userId);
//                 const total = (left.votes || 0) + (right.votes || 0) || 1;
//                 const leftPct = Math.round(((left.votes || 0) / total) * 100);
//                 setResult({
//                   leftPercentage: leftPct,
//                   rightPercentage: 100 - leftPct,
//                   totalVotes: total,
//                 });
//                 break;
//               }
//             }
//           }
//         })
//         .catch(() => { });
//     }
//   }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, userName, userEmail, left.votes, right.votes]);

//   const handleVote = async (side: "left" | "right") => {
//     if (!userId || String(userId).toLowerCase().startsWith("anon")) {
//       onToast("Please sign in to participate and earn SXPs!");
//       return;
//     }
//     if (isScheduled) {
//       onToast(`This battle starts in ${formatCountdown(timeToStartMs)}!`);
//       return;
//     }
//     if (selectedSide || loading || isVotingRef.current || getStoredVote("fb", item.id, userId)) {
//       onToast("You have already voted in this battle!");
//       return;
//     }

//     isVotingRef.current = true;
//     setSelectedSide(side);
//     setLoading(true);
//     setStoredVote("fb", item.id, { side }, userId);
//     const nextCount = Math.max(1, totalEngaged + 1);
//     setTotalEngaged(nextCount);
//     onSyncEngagedCount?.(nextCount);

//     try {
//       const res: any = await engagementService.voteEngagement(item.id, side, userId, undefined, { userName, userAvatar, userEmail });
//       const calculatedResult = {
//         leftPercentage: res?.leftPercentage ?? (side === "left" ? 68 : 32),
//         rightPercentage: res?.rightPercentage ?? (side === "right" ? 68 : 32),
//         totalVotes: res?.totalVotes ?? (left.votes + right.votes + 1),
//       };
//       setResult(calculatedResult);
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
//       isVotingRef.current = false;
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
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

//   const formattedTime = formatEngagementPostingTime(item);

//   return (
//     <motion.div
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-[#FF3D57] border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative group transition-all duration-300 ${isHighlighted
//         ? "ring-2 ring-[#FF3D57] shadow-[0_0_35px_rgba(255,61,87,0.35)] scale-[1.01]"
//         : ""
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

//       <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{item.title}</p>

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
//           className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${isScheduled
//             ? "opacity-50 cursor-not-allowed bg-white/[0.01] border-white/[0.05]"
//             : selectedSide === "left"
//               ? "bg-[#FF3D57]/10 border-[#FF3D57] shadow-[0_0_15px_rgba(255,61,87,0.15)]"
//               : selectedSide === "right"
//                 ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
//                 : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] active:scale-[0.98]"
//             }`}
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
//           className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer relative overflow-hidden ${isScheduled
//             ? "opacity-50 cursor-not-allowed bg-white/[0.01] border-white/[0.05]"
//             : selectedSide === "right"
//               ? "bg-[#FF7B02]/10 border-[#FF7B02] shadow-[0_0_15px_rgba(255,123,2,0.15)]"
//               : selectedSide === "left"
//                 ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
//                 : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] active:scale-[0.98]"
//             }`}
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
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
//               }`}
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
//         <button
//           onClick={() => onOpenEngagedModal?.(item)}
//           className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
//         >
//           <span className="group-hover:underline">
//             {Math.max(
//               (selectedSide !== null || initialStored || item.userVoted) ? 1 : 0,
//               totalEngaged,
//               totalEngagedOverride || 0
//             ).toLocaleString()} engaged
//           </span>
//           <ChevronRight
//             size={12}
//             className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
//               }`}
//           />
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// function LiveCountdown({
//   target,
//   render,
// }: {
//   target: number;
//   render: (msLeft: number) => React.ReactNode;
// }) {
//   const [msLeft, setMsLeft] = useState(() => Math.max(0, target - Date.now()));
//   useEffect(() => {
//     const id = setInterval(() => {
//       setMsLeft(Math.max(0, target - Date.now()));
//     }, 1000);
//     return () => clearInterval(id);
//   }, [target]);
//   return <>{render(msLeft)}</>;
// }

// // ─── 2. Quiz Card Component (+2 SXPs Participation, +10 SXPs Correct) ────────
// function DynamicQuizCard({
//   item,
//   userId,
//   userName,
//   userAvatar,
//   userEmail,
//   now,
//   onToast,
//   onEdit,
//   isHighlighted = false,
//   onOpenEngagedModal,
//   isEngagedExpanded = false,
//   onQuestionChange,
//   totalEngagedOverride,
//   onOpenLeaderboard,
//   onSyncEngagedCount,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   userName?: string;
//   userAvatar?: string;
//   userEmail?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//   isHighlighted?: boolean;
//   onOpenEngagedModal?: (item: EngagementItem) => void;
//   isEngagedExpanded?: boolean;
//   onQuestionChange?: (index: number, questionId: string) => void;
//   totalEngagedOverride?: number;
//   onOpenLeaderboard?: () => void;
//   onSyncEngagedCount?: (count: number) => void;
// }) {
//   const rawQuestions = useMemo(() => {
//     if (item.quizData?.questions && Array.isArray(item.quizData.questions) && item.quizData.questions.length > 0) {
//       return item.quizData.questions.map((q: any, idx: number) => {
//         const fallbackId = `q_${idx + 1}`;
//         const normalizedId = q?.id || q?._id || q?.questionId || fallbackId;
//         return {
//           ...q,
//           id: String(normalizedId),
//           question: q.question || q.title || `Question ${idx + 1}`,
//           options: q.options || [
//             { id: "A", text: "Option A" },
//             { id: "B", text: "Option B" },
//             { id: "C", text: "Option C" },
//             { id: "D", text: "Option D" },
//           ],
//           correctOptionId: q.correctOptionId || q.answer || "A",
//           explanation: q.explanation || "SportsFan360 Quiz",
//         };
//       });
//     }
//     return [
//       {
//         id: (item as any)._subQuestionId || "q_1",
//         question: item.quizData?.question || item.title || "Live Cricket Quiz",
//         options: item.quizData?.options || [
//           { id: "A", text: "Option A" },
//           { id: "B", text: "Option B" },
//           { id: "C", text: "Option C" },
//           { id: "D", text: "Option D" },
//         ],
//         correctOptionId: item.quizData?.correctOptionId || (item.quizData as any)?.answer || "A",
//         explanation: item.quizData?.explanation || "SportsFan360 Quiz",
//       },
//     ];
//   }, [item.quizData, item.title, (item as any)._subQuestionId]);

//   const totalQuestions = rawQuestions.length;

//   const checkIsOptionCorrect = useCallback((optId: string, q: any) => {
//     if (!q) return false;
//     const target = String(q.correctOptionId || q.answer || "").trim().toUpperCase();
//     const chosen = q.options?.find((o: any) => o.id === optId || o.text === optId);
//     if (chosen?.isCorrect === true) return true;
//     if (String(optId).trim().toUpperCase() === target) return true;
//     if (chosen && String(chosen.text || "").trim().toUpperCase() === target) return true;
//     return false;
//   }, []);

//   const getStoredQuizAnswer = useCallback((q: any, index: number) => {
//     if (!q) return null;
//     const parentId = (item as any)._parentEngagementId || item.id;
//     const subIdx = (item as any)._subQuestionIndex ?? index;
//     const subId = (item as any)._subQuestionId || q.id;

//     let ans = getStoredVote(quizAnswerKey(index, q.id), item.id, userId);
//     if (!ans && totalQuestions === 1) {
//       ans = getStoredVote(`quiz`, item.id, userId);
//     }

//     if (!ans && (item as any)._parentEngagementId) {
//       ans = getStoredVote(quizAnswerKey(subIdx, subId), parentId, userId);
//     }
//     return ans;
//   }, [item.id, userId, totalQuestions, (item as any)._parentEngagementId, (item as any)._subQuestionIndex, (item as any)._subQuestionId]);

//   // Direct database state map for recovered answers per question index
//   const [dbAnswers, setDbAnswers] = useState<Record<number, { selectedId: string; isCorrect: boolean; earnedPoints?: number }>>({});

//   const getEffectiveAnswer = useCallback((q: any, index: number) => {
//     if (dbAnswers[index]) return dbAnswers[index];
//     return getStoredQuizAnswer(q, index);
//   }, [dbAnswers, getStoredQuizAnswer]);

//   const initialFinish = getStoredVote("quiz_finish", item.id, userId);
//   const [quizFinished, setQuizFinished] = useState<boolean>(Boolean(initialFinish?.finished));
//   const [totalScore, setTotalScore] = useState<number>(() => {
//     if (initialFinish?.score !== undefined) return Number(initialFinish.score);
//     let sum = 0;
//     rawQuestions.forEach((q, idx) => {
//       const ans = getEffectiveAnswer(q, idx);
//       if (ans) {
//         sum += (ans.earnedPoints || (PARTICIPATION_POINTS + (ans.isCorrect ? CORRECT_OPTION_BONUS : 0)));
//       }
//     });
//     return sum;
//   });

//   const [currentQIndex, setCurrentQIndex] = useState(0);
//   const currentQ = rawQuestions[Math.min(currentQIndex, totalQuestions - 1)];

//   useEffect(() => {
//     if (currentQ) {
//       onQuestionChange?.(currentQIndex, currentQ.id || `q_${currentQIndex + 1}`);
//     }
//   }, [currentQIndex, currentQ?.id, onQuestionChange]);

//   const correctOptionId = currentQ?.correctOptionId || (currentQ as any)?.answer || "A";
//   const frequencyMinutes = Number(
//     item.quizData?.frequencyMinutes !== undefined && item.quizData?.frequencyMinutes !== null
//       ? item.quizData.frequencyMinutes
//       : 0
//   );
//   const frequencyMs = frequencyMinutes * 60 * 1000;

//   const initialQ = getEffectiveAnswer(currentQ, currentQIndex);

//   const calculateQuizProgress = useCallback(() => {
//     let answeredQCount = 0;
//     let correctQCount = 0;
//     let earnedSum = 0;

//     rawQuestions.forEach((q, idx) => {
//       const ans = getEffectiveAnswer(q, idx);
//       if (ans) {
//         answeredQCount++;
//         if (ans.isCorrect) {
//           correctQCount++;
//         }
//         earnedSum += (ans.earnedPoints || (PARTICIPATION_POINTS + (ans.isCorrect ? CORRECT_OPTION_BONUS : 0)));
//       }
//     });

//     const maxPossible = totalQuestions * (PARTICIPATION_POINTS + CORRECT_OPTION_BONUS);
//     return {
//       answeredCount: answeredQCount,
//       correctCount: correctQCount,
//       earnedScore: earnedSum,
//       possibleScore: maxPossible,
//       isFullyCompleted: answeredQCount >= totalQuestions,
//     };
//   }, [rawQuestions, totalQuestions, getEffectiveAnswer]);

//   const [selectedId, setSelectedId] = useState<string | null>(
//     initialQ?.selectedId || (totalQuestions === 1 && item.userVoted && item.userVote ? item.userVote : null)
//   );
//   const [answered, setAnswered] = useState<boolean>(Boolean(initialQ || (totalQuestions === 1 && item.userVoted)));
//   const [isCorrect, setIsCorrect] = useState<boolean | null>(
//     initialQ
//       ? initialQ.isCorrect
//       : totalQuestions === 1 && item.userVoted && item.userVote
//         ? checkIsOptionCorrect(item.userVote, currentQ)
//         : null
//   );

//   const isAnsweringRef = useRef(false);
//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
//   const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);

//   const hasAlreadyEngaged = useMemo(() => {
//     if (totalQuestions === 1 && item.userVoted) return true;
//     if (getStoredVote("quiz_engaged", item.id, userId)) return true;
//     if (getStoredVote("quiz_finish", item.id, userId)) return true;
//     return rawQuestions.some((q, idx) => Boolean(getEffectiveAnswer(q, idx)));
//   }, [item.id, item.userVoted, userId, rawQuestions, getEffectiveAnswer, totalQuestions]);

//   const hasEngagedRef = useRef<boolean>(hasAlreadyEngaged);

//   useEffect(() => {
//     if (hasAlreadyEngaged) {
//       hasEngagedRef.current = true;
//     }
//   }, [hasAlreadyEngaged]);

//   const [totalEngaged, setTotalEngaged] = useState<number>(() => {
//     const raw = totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || 0);
//     return (hasAlreadyEngaged || answered || selectedId) ? Math.max(1, raw) : raw;
//   });

//   useEffect(() => {
//     if (totalEngagedOverride !== undefined) {
//       setTotalEngaged((prev) => {
//         const nextVal = (hasAlreadyEngaged || answered || selectedId) ? Math.max(1, totalEngagedOverride) : totalEngagedOverride;
//         return Math.max(prev, nextVal);
//       });
//     }
//   }, [totalEngagedOverride, hasAlreadyEngaged, answered, selectedId]);

//   const startTime = getEngagementStartTime(item);
//   const isScheduled = startTime > now;
//   const timeToStartMs = Math.max(0, startTime - now);

//   const elapsedSinceStart = Math.max(0, now - startTime);
//   const unlockedQuestionCount = isScheduled
//     ? 0
//     : frequencyMinutes <= 0
//       ? totalQuestions
//       : Math.min(totalQuestions, Math.floor(elapsedSinceStart / (frequencyMs || 1)) + 1);
//   const msToNextQuestionSlot =
//     isScheduled || frequencyMinutes <= 0
//       ? 0
//       : Math.max(0, frequencyMs - (elapsedSinceStart % frequencyMs));
//   const isNextQuestionLocked =
//     frequencyMinutes > 0 &&
//     answered &&
//     currentQIndex + 1 >= unlockedQuestionCount &&
//     currentQIndex + 1 < totalQuestions;

//   // Handle timeout / partial expiration notification
//   const isExpired = Boolean(item.expiresAt && Number(item.expiresAt) > 0 && now > Number(item.expiresAt));
//   const partialNotifiedRef = useRef(false);

//   useEffect(() => {
//     if (isExpired && hasAlreadyEngaged && !quizFinished && !partialNotifiedRef.current) {
//       partialNotifiedRef.current = true;
//       const progress = calculateQuizProgress();
//       if (progress.answeredCount > 0) {
//         const partialMsg = `Quiz Time Expired! You answered ${progress.answeredCount}/${totalQuestions} questions and earned +${progress.earnedScore} SXPs. Tap to view your final score.`;
//         if (typeof window !== "undefined") {
//           window.dispatchEvent(
//             new CustomEvent("sf360:new-notification", {
//               detail: {
//                 title: "FlipARENA",
//                 body: partialMsg,
//                 ctaLabel: "View Score",
//                 ctaTarget: `/MainModules/FlipArena?itemId=${item.id}&type=quiz`,
//                 type: "fliparena.quiz_expired_partial",
//               },
//             })
//           );
//         }
//       }
//     }
//   }, [isExpired, hasAlreadyEngaged, quizFinished, calculateQuizProgress, totalQuestions, item.id]);

//   // Initial like & finish sync on mount
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
//   }, [item.id, userId, item.userLiked]);

//   // Database-first voters sync to restore user's actual chosen answers per question
//   useEffect(() => {
//     if (!userId) return;
//     const parentId = (item as any)._parentEngagementId || item.id;
//     let isMounted = true;

//     // Helper to test voter match
//     const checkVoterMatch = (v: any) => {
//       if (!v) return false;
//       const uid = String(userId || "").trim().toLowerCase();
//       const uname = String(userName || "").trim().toLowerCase();
//       const uemail = String(userEmail || "").trim().toLowerCase();

//       const vUid = String(v.userId || v.actualUserId || v.id || "").trim().toLowerCase();
//       const vName = String(v.userName || v.username || v.name || "").trim().toLowerCase();
//       const vEmail = String((v as any).userEmail || v.email || "").trim().toLowerCase();

//       if (uid && vUid && (uid === vUid || vUid.includes(uid) || uid.includes(vUid))) return true;
//       if (uemail && vEmail && uemail === vEmail) return true;
//       if (uname && vName && uname === vName) return true;
//       return false;
//     };

//     // 1. Check local item.quizData.questions if options already contain voters
//     const initialRecovered: Record<number, { selectedId: string; isCorrect: boolean; earnedPoints?: number }> = {};
//     if (item.quizData?.questions && Array.isArray(item.quizData.questions)) {
//       item.quizData.questions.forEach((q: any, idx: number) => {
//         if (q.options && Array.isArray(q.options)) {
//           for (const opt of q.options) {
//             if ((opt.voters || []).some(checkVoterMatch)) {
//               const optId = opt.id || opt.text;
//               const right = checkIsOptionCorrect(optId, rawQuestions[idx] || q);
//               initialRecovered[idx] = {
//                 selectedId: optId,
//                 isCorrect: right,
//                 earnedPoints: PARTICIPATION_POINTS + (right ? CORRECT_OPTION_BONUS : 0),
//               };
//               break;
//             }
//           }
//         }
//       });
//     }

//     if (Object.keys(initialRecovered).length > 0) {
//       setDbAnswers((prev) => ({ ...prev, ...initialRecovered }));
//     }

//     // 2. Fetch latest voters list from backend API
//     axios
//       .get(`/api/engagements/${parentId}/voters`)
//       .then((res) => {
//         if (!isMounted || !res.data?.success) return;
//         const recovered: Record<number, { selectedId: string; isCorrect: boolean; earnedPoints?: number }> = {};
//         const questionsData = res.data.questions || (res.data.options ? [{ options: res.data.options }] : []);

//         rawQuestions.forEach((q, idx) => {
//           const qData = questionsData.find((qd: any) => qd.questionId === q.id || qd.id === q.id) || questionsData[idx];
//           const opts = qData?.options || [];

//           for (const opt of opts) {
//             const matchingVoter = (opt.voters || []).find(checkVoterMatch);
//             if (matchingVoter) {
//               const picked = matchingVoter.selectedOptionId || opt.id || opt.text;
//               const right = checkIsOptionCorrect(picked, q);
//               const points = PARTICIPATION_POINTS + (right ? CORRECT_OPTION_BONUS : 0);
//               recovered[idx] = { selectedId: picked, isCorrect: right, earnedPoints: points };
//               setStoredVote(quizAnswerKey(idx, q.id), parentId, recovered[idx], userId);
//               setStoredVote(quizAnswerKey(idx, q.id), item.id, recovered[idx], userId);
//               break;
//             }
//           }
//         });

//         if (Object.keys(recovered).length > 0) {
//           setDbAnswers((prev) => ({ ...prev, ...recovered }));
//           const totalRecCount = Object.keys(recovered).length;
//           if (totalRecCount >= totalQuestions) {
//             setQuizFinished(true);
//           }
//         }
//       })
//       .catch(() => { });

//     // 3. Check vote status API
//     engagementService
//       .checkVoteStatus(parentId, userId)
//       .then((status) => {
//         if (!isMounted) return;
//         if (status.hasVoted && status.selectedOptionId) {
//           const right: boolean = Boolean(
//             status.isCorrect !== null && status.isCorrect !== undefined
//               ? status.isCorrect
//               : checkIsOptionCorrect(status.selectedOptionId, rawQuestions[0])
//           );
//           const points = PARTICIPATION_POINTS + (right ? CORRECT_OPTION_BONUS : 0);
//           setDbAnswers((prev) => {
//             if (prev[0]) return prev;
//             return {
//               ...prev,
//               0: { selectedId: status.selectedOptionId!, isCorrect: right, earnedPoints: points },
//             };
//           });
//         }
//       })
//       .catch(() => { });

//     return () => {
//       isMounted = false;
//     };
//   }, [item.id, userId, userName, userEmail, rawQuestions, totalQuestions, checkIsOptionCorrect, (item as any)._parentEngagementId, item.quizData]);

//   // Keep total score & quiz finish synced when answers are recovered from DB
//   useEffect(() => {
//     const progress = calculateQuizProgress();
//     if (progress.isFullyCompleted) {
//       setQuizFinished(true);
//     }
//     if (progress.earnedScore > 0) {
//       setTotalScore((prev) => Math.max(prev, progress.earnedScore));
//     }
//   }, [dbAnswers, calculateQuizProgress]);

//   // Active question answer restoration (strictly isolated per question)
//   useEffect(() => {
//     const ans = getEffectiveAnswer(currentQ, currentQIndex);

//     if (ans) {
//       setSelectedId(ans.selectedId);
//       setAnswered(true);
//       setIsCorrect(
//         ans.isCorrect !== undefined
//           ? ans.isCorrect
//           : checkIsOptionCorrect(ans.selectedId, currentQ)
//       );
//     } else if (totalQuestions === 1 && item.userVoted && item.userVote) {
//       setSelectedId(item.userVote);
//       setAnswered(true);
//       const isRight = checkIsOptionCorrect(item.userVote, currentQ);
//       setIsCorrect(isRight);
//       const payload = { selectedId: item.userVote, isCorrect: isRight };
//       setStoredVote(quizAnswerKey(currentQIndex, currentQ?.id), item.id, payload, userId);
//     } else {
//       setSelectedId(null);
//       setAnswered(false);
//       setIsCorrect(null);
//     }
//   }, [currentQIndex, currentQ, item.id, userId, totalQuestions, checkIsOptionCorrect, getEffectiveAnswer, item.userVoted, item.userVote, dbAnswers]);

//   const handleOptionSelect = async (optId: string) => {
//     if (!userId || String(userId).toLowerCase().startsWith("anon")) {
//       onToast("Please sign in to participate and earn SXPs!");
//       return;
//     }
//     if (answered || isScheduled || isAnsweringRef.current) return;
//     isAnsweringRef.current = true;
//     const existing = getEffectiveAnswer(currentQ, currentQIndex);
//     if (existing) {
//       isAnsweringRef.current = false;
//       return;
//     }

//     const isRight = checkIsOptionCorrect(optId, currentQ);
//     const earnedPoints = PARTICIPATION_POINTS + (isRight ? CORRECT_OPTION_BONUS : 0);
//     const answerPayload = { selectedId: optId, isCorrect: isRight, earnedPoints };

//     // Instantly save to state
//     setDbAnswers((prev) => ({ ...prev, [currentQIndex]: answerPayload }));
//     setSelectedId(optId);
//     setAnswered(true);
//     setIsCorrect(isRight);

//     const isFirstQuizEngagement = !hasEngagedRef.current;
//     hasEngagedRef.current = true;
//     setStoredVote("quiz_engaged", item.id, true, userId);
//     const nextCount = isFirstQuizEngagement ? Math.max(1, totalEngaged + 1) : Math.max(1, totalEngaged);
//     setTotalEngaged(nextCount);
//     onSyncEngagedCount?.(nextCount);

//     const nextTotal = totalScore + earnedPoints;
//     setTotalScore(nextTotal);

//     // Save this answer under unique keys so it never collides
//     setStoredVote(quizAnswerKey(currentQIndex, currentQ?.id), item.id, answerPayload, userId);
//     if (totalQuestions === 1) {
//       setStoredVote(`quiz`, item.id, answerPayload, userId);
//     }

//     const parentId = (item as any)._parentEngagementId || item.id;
//     const subIdx = (item as any)._subQuestionIndex ?? currentQIndex;
//     const subId = (item as any)._subQuestionId || currentQ?.id;
//     if ((item as any)._parentEngagementId) {
//       setStoredVote(quizAnswerKey(subIdx, subId), parentId, answerPayload, userId);
//       setStoredVote("quiz_engaged", parentId, true, userId);
//     }

//     const currentAnsweredCount = rawQuestions.filter((q, idx) => {
//       if (idx === currentQIndex) return true;
//       return Boolean(getEffectiveAnswer(q, idx));
//     }).length;

//     const currentCorrectCount = rawQuestions.filter((q, idx) => {
//       if (idx === currentQIndex) return isRight;
//       return Boolean(getEffectiveAnswer(q, idx)?.isCorrect);
//     }).length;

//     const totalPossible = totalQuestions * (PARTICIPATION_POINTS + CORRECT_OPTION_BONUS);

//     if (totalQuestions === 1 || currentAnsweredCount >= totalQuestions) {
//       setQuizFinished(true);
//       setStoredVote("quiz_finish", item.id, {
//         finished: true,
//         score: nextTotal,
//         answeredCount: currentAnsweredCount,
//         correctCount: currentCorrectCount,
//         possibleScore: totalPossible,
//       }, userId);
//       setStoredVote("quiz_engaged", item.id, true, userId);

//       const summaryMsg = `Quiz Completed! You scored ${nextTotal}/${totalPossible} SXPs (${currentCorrectCount}/${totalQuestions} correct). Check your rank on the Leaderboard!`;
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:new-notification", {
//             detail: {
//               title: "FlipARENA",
//               body: summaryMsg,
//               ctaLabel: "View Leaderboard",
//               ctaTarget: `/MainModules/FlipArena?itemId=${parentId}&type=quiz&tab=leaderboard`,
//               type: "fliparena.quiz_completed",
//             },
//           })
//         );
//       }
//     }

//     try {
//       const res: any = await engagementService.voteEngagement(
//         parentId,
//         optId,
//         userId,
//         subId,
//         {
//           isFirstQuizEngagement,
//           questionIndex: subIdx,
//           totalQuestions: (item as any)._parentEngagementId ? 1 : totalQuestions,
//           userName,
//           userAvatar,
//           userEmail,
//         }
//       );
//       const earned = Number(res?.pointsAwarded ?? earnedPoints);
//       if (typeof window !== "undefined" && earned > 0) {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: earned } })
//         );
//       }
//     } catch (err: any) {
//       const prevOpt = err?.response?.data?.selectedOptionId || optId;
//       const right = checkIsOptionCorrect(prevOpt, currentQ);
//       setSelectedId(prevOpt);
//       setIsCorrect(right);
//     } finally {
//       isAnsweringRef.current = false;
//     }
//   };

//   const handleNextQuestion = () => {
//     if (isNextQuestionLocked) {
//       onToast(`Next question unlocks in ${formatCountdown(msToNextQuestionSlot)}!`);
//       return;
//     }
//     if (currentQIndex < totalQuestions - 1) {
//       const nextIdx = currentQIndex + 1;
//       const nextQ = rawQuestions[nextIdx];
//       const ans = getEffectiveAnswer(nextQ, nextIdx);
//       setCurrentQIndex(nextIdx);
//       onQuestionChange?.(nextIdx, nextQ?.id || `q_${nextIdx + 1}`);
//       if (ans) {
//         setSelectedId(ans.selectedId);
//         setAnswered(true);
//         setIsCorrect(ans.isCorrect !== undefined ? ans.isCorrect : checkIsOptionCorrect(ans.selectedId, nextQ));
//       } else {
//         setSelectedId(null);
//         setAnswered(false);
//         setIsCorrect(null);
//       }
//     } else {
//       setQuizFinished(true);
//       const p = calculateQuizProgress();
//       setStoredVote("quiz_finish", item.id, { finished: true, score: totalScore, correctCount: p.correctCount, answeredCount: p.answeredCount }, userId);

//       // Preserve the last question's state so the UI doesn't look unattempted when the summary banner appears
//       const currentAns = getEffectiveAnswer(currentQ, currentQIndex);
//       if (currentAns) {
//         setSelectedId(currentAns.selectedId);
//         setAnswered(true);
//         setIsCorrect(currentAns.isCorrect);
//       }
//     }
//   };

//   const handlePrevQuestion = () => {
//     if (currentQIndex > 0) {
//       const prevIdx = currentQIndex - 1;
//       const prevQ = rawQuestions[prevIdx];
//       const ans = getEffectiveAnswer(prevQ, prevIdx);
//       setCurrentQIndex(prevIdx);
//       onQuestionChange?.(prevIdx, prevQ?.id || `q_${prevIdx + 1}`);
//       if (ans) {
//         setSelectedId(ans.selectedId);
//         setAnswered(true);
//         setIsCorrect(ans.isCorrect !== undefined ? ans.isCorrect : checkIsOptionCorrect(ans.selectedId, prevQ));
//       } else {
//         setSelectedId(null);
//         setAnswered(false);
//         setIsCorrect(null);
//       }
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
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

//   const formattedTime = formatEngagementPostingTime(item);
//   const currentProgress = calculateQuizProgress();

//   return (
//     <motion.div
//       layout={false}
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-purple-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
//         ? "ring-2 ring-purple-500 shadow-[0_0_35px_rgba(168,85,247,0.35)] scale-[1.01]"
//         : ""
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

//       {/* Completion summary banner for multi-question if finished */}
//       {quizFinished && totalQuestions > 1 && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-[#15181D] to-purple-900/40 border border-purple-500/40 text-center space-y-2.5 shadow-xl mb-3"
//         >
//           <div className="flex items-center justify-center gap-2">
//             <span className="text-lg">🏆</span>
//             <h4 className="text-sm font-black text-white">Quiz Completed!</h4>
//           </div>
//           <p className="text-[11.5px] text-purple-200 font-medium leading-snug">
//             You scored <strong className="text-amber-400 font-extrabold">{totalScore}/{currentProgress.possibleScore} SXPs</strong> ({currentProgress.correctCount}/{totalQuestions} correct).</p>
//         </motion.div>
//       )}

//       {totalQuestions > 1 && (
//         <div className="flex items-center justify-between gap-2 mb-2">
//           <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full shrink-0">
//             Q {currentQIndex + 1} of {totalQuestions}
//           </span>
//         </div>
//       )}

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
//             Question #1 unlocks in{" "}
//             <LiveCountdown
//               target={startTime}
//               render={(ms) => <strong className="text-amber-400 font-mono">{formatCountdown(ms)}</strong>}
//             />
//           </p>
//           <span className="text-[10px] text-white/40 block">
//             {frequencyMinutes > 0
//               ? `Questions unlock every ${frequencyMinutes} minutes`
//               : "Questions unlock immediately"}
//           </span>
//         </div>
//       ) : (
//         <>
//           <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{currentQ?.question}</p>

//           <div className="grid grid-cols-2 gap-2.5 mb-3.5">
//             {currentQ?.options?.map((opt: QuizOption) => {
//               const letter = opt.id;
//               const isThisCorrect = checkIsOptionCorrect(letter, currentQ);
//               const isSelected = selectedId === letter || selectedId === opt.text;

//               let cardStyle = "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white/90";
//               if (answered || quizFinished) {
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
//                   disabled={answered || quizFinished}
//                   className={`rounded-xl p-3 border font-bold text-xs text-left transition-all cursor-pointer flex items-center justify-between ${cardStyle}`}
//                 >
//                   <span className="whitespace-normal pr-1">
//                     <span className="text-white/40 mr-1.5 font-bold">{letter}.</span>
//                     {opt.text}
//                   </span>
//                   {(answered || quizFinished) && isThisCorrect && <Check size={14} className="text-emerald-400 shrink-0" />}
//                   {(answered || quizFinished) && isSelected && !isThisCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
//                 </button>
//               );
//             })}
//           </div>

//           {(answered || quizFinished) && (
//             <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-2">
//               <div
//                 className={`text-[11px] font-black text-center p-2 rounded-xl border flex items-center justify-center gap-1.5 ${isCorrect
//                   ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
//                   : "bg-red-500/10 border-red-500/30 text-red-400"
//                   }`}
//               >
//                 <span>{isCorrect ? "🎉" : "💡"}</span>
//                 <span>
//                   {isCorrect
//                     ? `Correct! +${CORRECT_OPTION_BONUS} SXPs Bonus (+${PARTICIPATION_POINTS + CORRECT_OPTION_BONUS} SXP Total)`
//                     : `+${PARTICIPATION_POINTS} SXPs for participating · The correct answer is ${correctOptionId}`}
//                 </span>
//               </div>
//             </motion.div>
//           )}

//           {/* Next & Previous Navigation for Multi-Question Quiz */}
//           {totalQuestions > 1 && (
//             <div className={`grid ${currentQIndex > 0 && currentQIndex < totalQuestions - 1 ? "grid-cols-2" : "grid-cols-1"} gap-2.5 w-full mt-2 mb-1`}>
//               {currentQIndex > 0 && (
//                 <button
//                   onClick={handlePrevQuestion}
//                   className="w-full py-2.5 rounded-xl bg-black text-white hover:bg-white/10 border border-white/20 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
//                 >
//                   <ArrowLeft size={13} />
//                   <span>Previous</span>
//                 </button>
//               )}

//               {currentQIndex < totalQuestions - 1 && (
//                 <>
//                   {isNextQuestionLocked ? (
//                     <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between text-xs font-bold text-white/80">
//                       <span className="flex items-center gap-1.5 text-purple-300">
//                         <Clock size={13} /> Next #{currentQIndex + 2} in:
//                       </span>
//                       <span className="font-mono text-amber-400 font-extrabold text-sm">
//                         {formatCountdown(msToNextQuestionSlot)}
//                       </span>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={handleNextQuestion}
//                       className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 border border-white font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
//                     >
//                       <span>Next</span>
//                       <ChevronRight size={14} />
//                     </button>
//                   )}
//                 </>
//               )}
//             </div>
//           )}
//         </>
//       )}

//       <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
//         <div className="flex gap-4">
//           <button
//             onClick={handleLike}
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
//               }`}
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
//         <button
//           onClick={() => onOpenEngagedModal?.(item)}
//           className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
//         >
//           <span className="group-hover:underline">
//             {Math.max(
//               (hasAlreadyEngaged || answered || selectedId !== null) ? 1 : 0,
//               totalEngaged,
//               totalEngagedOverride || 0
//             ).toLocaleString()} engaged
//           </span>
//           <ChevronRight
//             size={12}
//             className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
//               }`}
//           />
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// // ─── 3. Poll Card Component (+2 SXPs Participation, +10 SXPs Correct Option) ──
// function DynamicPollCard({
//   item,
//   userId,
//   userName,
//   userAvatar,
//   userEmail,
//   now,
//   onToast,
//   onEdit,
//   isHighlighted = false,
//   onOpenEngagedModal,
//   isEngagedExpanded = false,
//   totalEngagedOverride,
//   onSyncEngagedCount,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   userName?: string;
//   userAvatar?: string;
//   userEmail?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//   isHighlighted?: boolean;
//   onOpenEngagedModal?: (item: EngagementItem) => void;
//   isEngagedExpanded?: boolean;
//   totalEngagedOverride?: number;
//   onSyncEngagedCount?: (count: number) => void;
// }) {
//   const initialVote = getStoredVote("poll", item.id, userId);
//   const [selectedId, setSelectedId] = useState<string | null>(
//     initialVote?.selectedId || item.userVote || null
//   );
//   const [voted, setVoted] = useState<boolean>(Boolean(initialVote || item.userVoted));
//   const [loading, setLoading] = useState(false);
//   const isVotingRef = useRef(false);

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
//   const hasUserParticipated = Boolean(voted || selectedId !== null || item.userVoted || initialVote);
//   const [totalEngaged, setTotalEngaged] = useState<number>(() => {
//     const raw = totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || 0);
//     return hasUserParticipated ? Math.max(1, raw) : raw;
//   });

//   useEffect(() => {
//     if (totalEngagedOverride !== undefined) {
//       setTotalEngaged((prev) => {
//         const nextVal = (voted || selectedId !== null || item.userVoted) ? Math.max(1, totalEngagedOverride) : totalEngagedOverride;
//         return Math.max(prev, nextVal);
//       });
//     }
//   }, [totalEngagedOverride, voted, selectedId, item.userVoted]);

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
//       const optId = String(opt.id || "").trim().toLowerCase();
//       const optText = String(opt.text || "").trim().toLowerCase();
//       return ca === optId || ca === optText;
//     },
//     [correctAnswer]
//   );

//   const userWon = useMemo(() => {
//     if (!voted || !selectedId || !correctAnswer) return false;
//     const selectedOpt = options.find((o) => o.id === selectedId || o.text === selectedId);
//     return checkIsOptionWinner(selectedOpt);
//   }, [voted, selectedId, correctAnswer, options, checkIsOptionWinner]);

//   useEffect(() => {
//     if (isExpired && (userWon || serverIsCorrect) && !bonusAwarded && userId) {
//       setBonusAwarded(true);
//       if (typeof window !== "undefined") {
//         localStorage.setItem(bonusClaimKey, "true");
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", {
//             detail: { points: CORRECT_OPTION_BONUS },
//           })
//         );
//       }
//       onToast(`🏆 Poll Ended! You won +${CORRECT_OPTION_BONUS} SXPs bonus for picking the correct answer!`);
//     }
//   }, [isExpired, userWon, serverIsCorrect, bonusAwarded, bonusClaimKey, onToast, userId]);

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
//       if (stored.options) setOptions(stored.options);
//     }

//     if (item.userVoted && item.userVote) {
//       setSelectedId(item.userVote);
//       setVoted(true);
//       setStoredVote("poll", item.id, { selectedId: item.userVote }, userId);
//     } else if (userId) {
//       engagementService.checkVoteStatus(item.id, userId).then((res) => {
//         if (res.hasVoted && res.selectedOptionId) {
//           setSelectedId(res.selectedOptionId);
//           setVoted(true);
//           setStoredVote("poll", item.id, { selectedId: res.selectedOptionId }, userId);
//         }
//       });
//       axios
//         .get(`/api/engagements/${item.id}/voters`)
//         .then((res) => {
//           if (res.data?.options) {
//             for (const opt of res.data.options) {
//               if ((opt.voters || []).some((v: any) => checkVoterMatch(v, userId, userName, userEmail))) {
//                 const optId = opt.id || opt.text;
//                 setSelectedId(optId);
//                 setVoted(true);
//                 setStoredVote("poll", item.id, { selectedId: optId }, userId);
//                 break;
//               }
//             }
//           }
//         })
//         .catch(() => { });
//     }
//   }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, userName, userEmail]);

//   const handleVote = async (optId: string) => {
//     if (!userId || String(userId).toLowerCase().startsWith("anon")) {
//       onToast("Please sign in to participate and earn SXPs!");
//       return;
//     }
//     if (isScheduled) {
//       onToast(`This poll opens in ${formatCountdown(timeToStartMs)}!`);
//       return;
//     }
//     if (isExpired) {
//       onToast("This poll has ended!");
//       return;
//     }
//     if (voted || loading || isVotingRef.current || getStoredVote("poll", item.id, userId)) {
//       onToast("You have already voted in this poll!");
//       return;
//     }

//     isVotingRef.current = true;
//     setSelectedId(optId);
//     setVoted(true);
//     setLoading(true);
//     const nextCount = Math.max(1, totalEngaged + 1);
//     setTotalEngaged(nextCount);
//     onSyncEngagedCount?.(nextCount);

//     const nextOptions = options.map((opt) =>
//       opt.id === optId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
//     );
//     setOptions(nextOptions);
//     setStoredVote("poll", item.id, { selectedId: optId, options: nextOptions }, userId);

//     try {
//       const res: any = await engagementService.voteEngagement(item.id, optId, userId, undefined, { userName, userAvatar, userEmail });
//       if (res?.options && Array.isArray(res.options)) {
//         setOptions(res.options);
//         setStoredVote("poll", item.id, { selectedId: optId, options: res.options }, userId);
//       }
//       if (res?.isCorrect !== undefined) {
//         setServerIsCorrect(Boolean(res.isCorrect));
//       }
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
//         );
//       }
//     } catch (err: any) {
//       const prevOption = err?.response?.data?.selectedOptionId || optId;
//       setSelectedId(prevOption);
//       const reverted = options.map((opt) =>
//         opt.id === prevOption ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
//       );
//       setOptions(reverted);
//       setStoredVote("poll", item.id, { selectedId: prevOption, options: reverted }, userId);
//     } finally {
//       setLoading(false);
//       isVotingRef.current = false;
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
//     engagementService.shareEngagement(item.id).catch(() => { });

//     const shareUrl = getEngagementShareUrl(item);
//     const text = `📊 Poll: "${item.title}" — Cast your vote on SportsFan360:`;
//     if (navigator.share) {
//       navigator.share({ title: item.title, text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
//     } else {
//       await navigator.clipboard.writeText(shareUrl);
//       onToast("Poll link copied to clipboard! 📋");
//     }
//   };

//   const formattedTime = formatEngagementPostingTime(item);

//   return (
//     <motion.div
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-emerald-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
//         ? "ring-2 ring-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)] scale-[1.01]"
//         : ""
//         }`}
//     >
//       {isHighlighted && (
//         <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-300 flex items-center justify-between">
//           <span className="flex items-center gap-1.5">
//             <Sparkles size={11} className="text-emerald-400 animate-pulse" />
//             <span>SHARED POLL</span>
//           </span>
//           <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
//         </div>
//       )}
//       <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 uppercase tracking-wider">
//         <div className="flex items-center gap-1.5">
//           <span className="text-emerald-400">📊 LIVE POLL</span>
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

//       <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{item.title}</p>

//       {isScheduled ? (
//         <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center my-2 space-y-1">
//           <Clock size={20} className="mx-auto text-emerald-400 animate-pulse" />
//           <h4 className="text-xs font-black text-white">Poll Scheduled</h4>
//           <p className="text-[11px] text-white/60">
//             Voting opens in <strong className="text-amber-400 font-mono">{formatCountdown(timeToStartMs)}</strong>
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-2 mb-4">
//           {options.map((opt) => {
//             const pct = Math.round(((opt.votes || 0) / totalVotes) * 100);
//             const isSelected = selectedId === opt.id || selectedId === opt.text;
//             const isWinner = checkIsOptionWinner(opt);

//             let borderStyle = "border-white/[0.06] bg-white/[0.02]";
//             if (isExpired && isWinner) {
//               borderStyle = "border-emerald-500/70 bg-emerald-500/15";
//             } else if (isSelected) {
//               borderStyle = "border-emerald-500 bg-emerald-500/10";
//             }

//             return (
//               <button
//                 key={opt.id}
//                 onClick={() => handleVote(opt.id)}
//                 disabled={voted || isExpired || loading}
//                 className={`w-full rounded-xl p-3 border text-left transition-all cursor-pointer relative overflow-hidden group ${borderStyle} ${voted || isExpired ? "cursor-default" : "hover:bg-white/[0.04] active:scale-[0.99]"
//                   }`}
//               >
//                 {(voted || isExpired) && (
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${pct}%` }}
//                     transition={{ duration: 0.5, ease: "easeOut" }}
//                     className={`absolute inset-y-0 left-0 ${isExpired && isWinner
//                       ? "bg-emerald-500/25"
//                       : isSelected
//                         ? "bg-emerald-500/20"
//                         : "bg-white/[0.04]"
//                       }`}
//                   />
//                 )}

//                 <div className="relative z-10 flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <span
//                       className={`text-xs font-bold ${isExpired && isWinner
//                         ? "text-emerald-300 font-black"
//                         : isSelected
//                           ? "text-emerald-400 font-black"
//                           : "text-white/80"
//                         }`}
//                     >
//                       {opt.text}
//                     </span>
//                     {isSelected && (
//                       <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
//                         <Check size={11} /> You voted
//                       </span>
//                     )}
//                     {isExpired && isWinner && (
//                       <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 rounded">
//                         ✓ Correct Option
//                       </span>
//                     )}
//                   </div>
//                   {(voted || isExpired) && (
//                     <span className="text-xs font-black font-mono text-white/50">{pct}%</span>
//                   )}
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       )}

//       {voted && (
//         <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
//           {isExpired ? (
//             userWon || bonusAwarded || serverIsCorrect ? (
//               <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-xs font-black text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
//                 <span className="flex items-center gap-1.5">
//                   <span>🎉</span>
//                   <span>Correct Option! You earned +10 SXPs Bonus (+12 SXPs Total)</span>
//                 </span>
//                 <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
//                   +10 SXPs
//                 </span>
//               </div>
//             ) : (
//               <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
//                 <span>
//                   Poll ended {correctAnswer ? `· Winner: ` : ""}
//                   {correctAnswer && <strong className="text-emerald-400">{correctAnswer}</strong>}
//                 </span>
//                 <span className="text-[10px] text-white/40 shrink-0">+2 SXPs participation</span>
//               </div>
//             )
//           ) : (
//             <div className="text-[11px] font-black text-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-center gap-1.5">
//               <span>🔒</span>
//               <span>Vote submitted · +2 SXPs earned!</span>
//             </div>
//           )}
//         </motion.div>
//       )}

//       <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
//         <div className="flex gap-4">
//           <button
//             onClick={handleLike}
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
//               }`}
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
//         <button
//           onClick={() => onOpenEngagedModal?.(item)}
//           className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
//         >
//           <span className="group-hover:underline">
//             {Math.max(
//               hasUserParticipated ? 1 : 0,
//               totalEngaged,
//               totalEngagedOverride || 0
//             ).toLocaleString()} engaged
//           </span>
//           <ChevronRight
//             size={12}
//             className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
//               }`}
//           />
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// // ─── 4. Prediction Card Component (+2 SXPs Participation, +10 SXPs Correct) ───
// function DynamicPredictionCard({
//   item,
//   userId,
//   userName,
//   userAvatar,
//   userEmail,
//   now,
//   onToast,
//   onEdit,
//   isHighlighted = false,
//   onOpenEngagedModal,
//   isEngagedExpanded = false,
//   totalEngagedOverride,
//   onSyncEngagedCount,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   userName?: string;
//   userAvatar?: string;
//   userEmail?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//   isHighlighted?: boolean;
//   onOpenEngagedModal?: (item: EngagementItem) => void;
//   isEngagedExpanded?: boolean;
//   totalEngagedOverride?: number;
//   onSyncEngagedCount?: (count: number) => void;
// }) {
//   const pred = item.predictionData || {
//     question: item.title || "Will India score > 350 runs?",
//     category: "cricket",
//     leftChoice: { text: "Yes (> 350)", multiplier: 2.1, votes: 310 },
//     rightChoice: { text: "No (<= 350)", multiplier: 1.8, votes: 450 },
//     coinStake: 25,
//     timerMinutes: 10,
//     startTime: Date.now(),
//     expiresAt: Date.now() + 600000,
//     winningTarget: "",
//   };

//   const initialVote = getStoredVote("pred", item.id, userId);
//   const [selectedChoice, setSelectedChoice] = useState<"left" | "right" | null>(
//     initialVote?.choice || (item.userVote as "left" | "right") || null
//   );
//   const [predicted, setPredicted] = useState<boolean>(Boolean(initialVote || item.userVoted));
//   const [loading, setLoading] = useState(false);
//   const isPredictingRef = useRef(false);

//   const bonusClaimKey = `sf_pred_bonus_claimed_${item.id}_${userId || "anon"}`;
//   const [bonusAwarded, setBonusAwarded] = useState<boolean>(() => {
//     if (typeof window === "undefined") return false;
//     return localStorage.getItem(bonusClaimKey) === "true";
//   });
//   const [serverIsCorrect, setServerIsCorrect] = useState<boolean | null>(null);

//   const [liked, setLiked] = useState(false);
//   const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
//   const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
//   const hasUserParticipated = Boolean(predicted || selectedChoice !== null || item.userVoted || initialVote);
//   const [totalEngaged, setTotalEngaged] = useState<number>(() => {
//     const raw = totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || 0);
//     return hasUserParticipated ? Math.max(1, raw) : raw;
//   });

//   useEffect(() => {
//     if (totalEngagedOverride !== undefined) {
//       setTotalEngaged((prev) => {
//         const nextVal = (predicted || selectedChoice !== null || item.userVoted) ? Math.max(1, totalEngagedOverride) : totalEngagedOverride;
//         return Math.max(prev, nextVal);
//       });
//     }
//   }, [totalEngagedOverride, predicted, selectedChoice, item.userVoted]);

//   const calcPredictionResult = useCallback(
//     (
//       choice: "left" | "right",
//       overrideLeftPct?: number,
//       overrideRightPct?: number
//     ) => {
//       const leftVotes = pred.leftChoice.votes || 0;
//       const rightVotes = pred.rightChoice.votes || 0;
//       const total = leftVotes + rightVotes + 1;
//       const leftPct =
//         overrideLeftPct !== undefined
//           ? Math.round(overrideLeftPct)
//           : Math.round(((leftVotes + (choice === "left" ? 1 : 0)) / total) * 100);
//       const rightPct =
//         overrideRightPct !== undefined ? Math.round(overrideRightPct) : 100 - leftPct;
//       return {
//         coinsLocked: pred.coinStake || 25,
//         leftPercentage: leftPct,
//         rightPercentage: rightPct,
//       };
//     },
//     [pred.coinStake, pred.leftChoice.votes, pred.rightChoice.votes]
//   );

//   const [result, setResult] = useState<{
//     coinsLocked: number;
//     leftPercentage: number;
//     rightPercentage: number;
//   } | null>(() => {
//     const c = initialVote?.choice || (item.userVote as "left" | "right");
//     if (!c) return null;
//     return calcPredictionResult(c, initialVote?.leftPercentage, initialVote?.rightPercentage);
//   });

//   const startTime = getEngagementStartTime(item);
//   const isScheduled = startTime > now;
//   const timeToStartMs = Math.max(0, startTime - now);

//   const durationMins = Number(pred.timerMinutes || 10);
//   const expiresAt = pred.expiresAt || (startTime + durationMins * 60 * 1000);
//   const isExpired = now >= expiresAt;
//   const timeRemainingMs = Math.max(0, expiresAt - now);

//   const winningTarget = (pred as any).winningTarget || (pred as any).correctAnswer || "";

//   const checkIsChoiceWinner = useCallback(
//     (choice: "left" | "right" | null) => {
//       if (!choice || !winningTarget) return false;
//       const wt = winningTarget.trim().toLowerCase();
//       if (wt === "left" && choice === "left") return true;
//       if (wt === "right" && choice === "right") return true;
//       const chosenText =
//         choice === "left"
//           ? pred.leftChoice.text.trim().toLowerCase()
//           : pred.rightChoice.text.trim().toLowerCase();
//       return wt === chosenText;
//     },
//     [winningTarget, pred.leftChoice.text, pred.rightChoice.text]
//   );

//   const userWon = useMemo(() => {
//     return checkIsChoiceWinner(selectedChoice);
//   }, [selectedChoice, checkIsChoiceWinner]);

//   useEffect(() => {
//     if (isExpired && (userWon || serverIsCorrect) && !bonusAwarded && userId) {
//       setBonusAwarded(true);
//       if (typeof window !== "undefined") {
//         localStorage.setItem(bonusClaimKey, "true");
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", {
//             detail: { points: CORRECT_OPTION_BONUS },
//           })
//         );
//       }
//       onToast(`🏆 Prediction Ended! You won +${CORRECT_OPTION_BONUS} SXPs bonus for your correct prediction!`);
//     }
//   }, [isExpired, userWon, serverIsCorrect, bonusAwarded, bonusClaimKey, onToast, userId]);

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
//       setResult(calcPredictionResult(stored.choice, stored.leftPercentage, stored.rightPercentage));
//     }

//     if (item.userVoted && item.userVote) {
//       const choice = item.userVote as "left" | "right";
//       setSelectedChoice(choice);
//       setPredicted(true);
//       setResult(calcPredictionResult(choice));
//       setStoredVote("pred", item.id, { choice }, userId);
//     } else if (userId) {
//       engagementService.checkVoteStatus(item.id, userId).then((res) => {
//         if (res.hasVoted && res.selectedOptionId) {
//           const choice = res.selectedOptionId as "left" | "right";
//           setSelectedChoice(choice);
//           setPredicted(true);
//           setResult(calcPredictionResult(choice));
//           setStoredVote("pred", item.id, { choice }, userId);
//         }
//       });
//       axios
//         .get(`/api/engagements/${item.id}/voters`)
//         .then((res) => {
//           if (res.data?.options) {
//             for (const opt of res.data.options) {
//               if ((opt.voters || []).some((v: any) => checkVoterMatch(v, userId, userName, userEmail))) {
//                 const choice = (opt.id || opt.text) as "left" | "right";
//                 setSelectedChoice(choice);
//                 setPredicted(true);
//                 setResult(calcPredictionResult(choice));
//                 setStoredVote("pred", item.id, { choice }, userId);
//                 break;
//               }
//             }
//           }
//         })
//         .catch(() => { });
//     }
//   }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, userName, userEmail, calcPredictionResult]);

//   const handlePredict = async (choice: "left" | "right") => {
//     if (!userId || String(userId).toLowerCase().startsWith("anon")) {
//       onToast("Please sign in to participate and earn SXPs!");
//       return;
//     }
//     if (isScheduled) {
//       onToast(`This prediction opens in ${formatCountdown(timeToStartMs)}!`);
//       return;
//     }
//     if (isExpired) {
//       onToast("This prediction has ended!");
//       return;
//     }
//     if (predicted || loading || isPredictingRef.current || getStoredVote("pred", item.id, userId)) {
//       onToast("You have already placed your prediction!");
//       return;
//     }

//     isPredictingRef.current = true;
//     setSelectedChoice(choice);
//     setPredicted(true);
//     setLoading(true);
//     setStoredVote("pred", item.id, { choice, coinsLocked: pred.coinStake || 25 }, userId);
//     const nextCount = Math.max(1, totalEngaged + 1);
//     setTotalEngaged(nextCount);
//     onSyncEngagedCount?.(nextCount);

//     try {
//       const res: any = await engagementService.voteEngagement(item.id, choice, userId, undefined, { userName, userAvatar, userEmail });
//       const computedResult = calcPredictionResult(
//         choice,
//         res?.leftPercentage,
//         res?.rightPercentage
//       );
//       if (res?.coinsLocked) {
//         computedResult.coinsLocked = res.coinsLocked;
//       }
//       setResult(computedResult);
//       setStoredVote(
//         "pred",
//         item.id,
//         {
//           choice,
//           coinsLocked: computedResult.coinsLocked,
//           leftPercentage: computedResult.leftPercentage,
//           rightPercentage: computedResult.rightPercentage,
//         },
//         userId
//       );
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
//         );
//       }
//     } catch (err: any) {
//       const prevChoice = (err?.response?.data?.selectedOptionId || choice) as "left" | "right";
//       setSelectedChoice(prevChoice);
//       const fallbackResult = calcPredictionResult(prevChoice);
//       setResult(fallbackResult);
//       setStoredVote(
//         "pred",
//         item.id,
//         {
//           choice: prevChoice,
//           coinsLocked: fallbackResult.coinsLocked,
//           leftPercentage: fallbackResult.leftPercentage,
//           rightPercentage: fallbackResult.rightPercentage,
//         },
//         userId
//       );
//     } finally {
//       setLoading(false);
//       isPredictingRef.current = false;
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
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

//   const formattedTime = formatEngagementPostingTime(item);

//   return (
//     <motion.div
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-amber-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
//         ? "ring-2 ring-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.35)] scale-[1.01]"
//         : ""
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

//       <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{pred.question || item.title}</p>

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
//             className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${selectedChoice === "left"
//               ? "bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-400"
//               : predicted || isExpired
//                 ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
//                 : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white"
//               }`}
//           >
//             <span className="text-xs font-black">{pred.leftChoice.text}</span>
//             <span className="text-[10px] font-black mt-1 text-white/50">
//               {result ? `${result.leftPercentage}%` : null}
//             </span>
//           </button>

//           <button
//             onClick={() => handlePredict("right")}
//             disabled={predicted || isExpired || loading}
//             className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${selectedChoice === "right"
//               ? "bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-amber-400"
//               : predicted || isExpired
//                 ? "opacity-40 border-white/[0.04] bg-white/[0.01]"
//                 : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] text-white"
//               }`}
//           >
//             <span className="text-xs font-black">{pred.rightChoice.text}</span>
//             <span className="text-[10px] font-black mt-1 text-white/50">
//               {result ? `${result.rightPercentage}%` : null}
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
//                   <span>Prediction Won! You earned +10 SXPs Bonus (+12 SXPs Total)</span>
//                 </span>
//                 <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
//                   +10 SXPs
//                 </span>
//               </div>
//             ) : (
//               <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
//                 <span>
//                   Prediction closed
//                 </span>
//                 <span className="text-[10px] text-white/40 shrink-0">+2 SXPs participation</span>
//               </div>
//             )
//           ) : (
//             <div className="text-[11px] font-black text-center text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center justify-center gap-1.5">
//               <span>🔒</span>
//               <span>+2 SXPs earned!</span>
//             </div>
//           )}
//         </motion.div>
//       )}

//       <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
//         <div className="flex gap-4">
//           <button
//             onClick={handleLike}
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
//               }`}
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
//         <button
//           onClick={() => onOpenEngagedModal?.(item)}
//           className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
//         >
//           <span className="group-hover:underline">
//             {Math.max(
//               hasUserParticipated ? 1 : 0,
//               totalEngaged,
//               totalEngagedOverride || 0
//             ).toLocaleString()} engaged
//           </span>
//           <ChevronRight
//             size={12}
//             className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
//               }`}
//           />
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// // ─── 5. Meme Card Component (5 Heat Rating Tiers +2 SXPs Participation) ───────
// function DynamicMemeCard({
//   item,
//   userId,
//   userName,
//   userAvatar,
//   userEmail,
//   now,
//   onToast,
//   onEdit,
//   onDelete,
//   isHighlighted = false,
//   onOpenEngagedModal,
//   isEngagedExpanded = false,
//   totalEngagedOverride,
//   onSyncEngagedCount,
// }: {
//   item: EngagementItem;
//   userId?: string;
//   userName?: string;
//   userAvatar?: string;
//   userEmail?: string;
//   now: number;
//   onToast: (msg: string) => void;
//   onEdit?: (item: EngagementItem) => void;
//   onDelete?: (item: EngagementItem) => void;
//   isHighlighted?: boolean;
//   onOpenEngagedModal?: (item: EngagementItem) => void;
//   isEngagedExpanded?: boolean;
//   totalEngagedOverride?: number;
//   onSyncEngagedCount?: (count: number) => void;
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
//   };

//   const initialStored = getStoredVote("meme", item.id, currentUserId);
//   const [selectedRating, setSelectedRating] = useState<MemeReactionType | null>(
//     initialStored?.reaction || (item.userVote as MemeReactionType) || null
//   );
//   const [hasVoted, setHasVoted] = useState(Boolean(initialStored || item.userVoted));
//   const [loadingVote, setLoadingVote] = useState(false);
//   const [liked, setLiked] = useState(Boolean(item.userLiked));
//   const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
//   const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
//   const hasUserParticipated = Boolean(hasVoted || selectedRating !== null || item.userVoted || initialStored);
//   const [totalEngaged, setTotalEngaged] = useState<number>(() => {
//     const raw = totalEngagedOverride !== undefined ? totalEngagedOverride : (Number(item.totalEngaged) || 0);
//     return hasUserParticipated ? Math.max(1, raw) : raw;
//   });

//   useEffect(() => {
//     if (totalEngagedOverride !== undefined) {
//       setTotalEngaged((prev) => {
//         const nextVal = (hasVoted || selectedRating !== null || item.userVoted) ? Math.max(1, totalEngagedOverride) : totalEngagedOverride;
//         return Math.max(prev, nextVal);
//       });
//     }
//   }, [totalEngagedOverride, hasVoted, selectedRating, item.userVoted]);

//   const [reactions, setReactions] = useState<{
//     mild: number;
//     funny: number;
//     hot: number;
//     fire: number;
//     nuclear: number;
//   }>({
//     mild: Number(meme.reactions?.mild) || 0,
//     funny: Number(meme.reactions?.funny) || 0,
//     hot: Number(meme.reactions?.hot) || 0,
//     fire: Number(meme.reactions?.fire) || 0,
//     nuclear: Number(meme.reactions?.nuclear) || 0,
//   });

//   const totalHeatVotes =
//     reactions.mild + reactions.funny + reactions.hot + reactions.fire + reactions.nuclear;

//   const calculateHeatPct = useCallback(
//     (r: typeof reactions) => {
//       const sum = r.mild + r.funny + r.hot + r.fire + r.nuclear;
//       if (sum === 0) return 0;
//       const score = r.mild * 20 + r.funny * 40 + r.hot * 65 + r.fire * 85 + r.nuclear * 100;
//       return Math.round(score / sum);
//     },
//     []
//   );

//   const [heatPercentage, setHeatPercentage] = useState<number>(
//     meme.heatPercentage || calculateHeatPct(reactions)
//   );

//   useEffect(() => {
//     if (item.userLiked) {
//       setLiked(true);
//     } else if (currentUserId) {
//       engagementService.checkLikeStatus(item.id, currentUserId).then((isLiked) => {
//         if (isLiked) setLiked(true);
//       });
//     }

//     const stored = getStoredVote("meme", item.id, currentUserId);
//     if (stored?.reaction) {
//       setSelectedRating(stored.reaction);
//       setHasVoted(true);
//     } else if (item.userVoted && item.userVote) {
//       setSelectedRating(item.userVote as MemeReactionType);
//       setHasVoted(true);
//       setStoredVote("meme", item.id, { reaction: item.userVote }, currentUserId);
//     } else if (currentUserId) {
//       engagementService.checkVoteStatus(item.id, currentUserId).then((res) => {
//         if (res.hasVoted && res.selectedOptionId) {
//           setSelectedRating(res.selectedOptionId as MemeReactionType);
//           setHasVoted(true);
//           setStoredVote("meme", item.id, { reaction: res.selectedOptionId }, currentUserId);
//         }
//       });
//       axios
//         .get(`/api/engagements/${item.id}/voters`)
//         .then((res) => {
//           if (res.data?.options) {
//             for (const opt of res.data.options) {
//               if ((opt.voters || []).some((v: any) => checkVoterMatch(v, currentUserId, currentUserName, currentUserEmail))) {
//                 const reaction = (opt.id || opt.text) as MemeReactionType;
//                 setSelectedRating(reaction);
//                 setHasVoted(true);
//                 setStoredVote("meme", item.id, { reaction }, currentUserId);
//                 break;
//               }
//             }
//           }
//         })
//         .catch(() => { });
//     }
//   }, [item.id, item.userLiked, item.userVoted, item.userVote, currentUserId, currentUserName, currentUserEmail]);

//   const handleSelectRating = (tier: MemeReactionType) => {
//     if (hasVoted) return;
//     setSelectedRating(tier);
//   };

//   const handleSubmitVote = async () => {
//     if (!currentUserId || String(currentUserId).toLowerCase().startsWith("anon")) {
//       onToast("Please sign in to vote and earn SXPs!");
//       return;
//     }
//     if (!selectedRating || hasVoted || loadingVote) return;

//     setLoadingVote(true);
//     setHasVoted(true);
//     setStoredVote("meme", item.id, { reaction: selectedRating }, currentUserId);
//     const nextCount = Math.max(1, totalEngaged + 1);
//     setTotalEngaged(nextCount);
//     onSyncEngagedCount?.(nextCount);

//     const nextReactions = {
//       ...reactions,
//       [selectedRating]: (reactions[selectedRating] || 0) + 1,
//     };
//     setReactions(nextReactions);
//     const nextHeat = calculateHeatPct(nextReactions);
//     setHeatPercentage(nextHeat);

//     try {
//       const res: any = await engagementService.voteEngagement(
//         item.id,
//         selectedRating,
//         currentUserId,
//         undefined,
//         {
//           userName: currentUserName,
//           userAvatar,
//           userEmail: currentUserEmail,
//         }
//       );
//       if (res?.reactions) {
//         setReactions(res.reactions);
//         setHeatPercentage(res.heatPercentage || calculateHeatPct(res.reactions));
//       }
//       if (typeof window !== "undefined") {
//         window.dispatchEvent(
//           new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
//         );
//       }
//     } catch {
//     } finally {
//       setLoadingVote(false);
//     }
//   };

//   const handleLike = async () => {
//     const nextLiked = !liked;
//     const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
//     setLiked(nextLiked);
//     setLikesCount(nextCount);

//     try {
//       const res = await engagementService.toggleLikeEngagement(item.id, currentUserId, {
//         userName: currentUserName,
//         userAvatar,
//         userEmail: currentUserEmail,
//       });
//       if (res?.likesCount !== undefined) {
//         setLikesCount(res.likesCount);
//         setLiked(res.liked);
//       }
//     } catch { }
//   };

//   const handleShare = async () => {
//     setSharesCount((prev) => prev + 1);
//     engagementService.shareEngagement(item.id).catch(() => { });

//     const shareUrl = getEngagementShareUrl(item);
//     const text = `🔥 Meme: "${meme.caption}" — Rate the matchday heat on SportsFan360:`;
//     if (navigator.share) {
//       navigator.share({ title: item.title || "Matchday Meme", text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
//     } else {
//       await navigator.clipboard.writeText(shareUrl);
//       onToast("Meme link copied to clipboard! 📋");
//     }
//   };

//   const formattedTime = formatEngagementPostingTime(item);

//   const RATING_TIERS: Array<{
//     id: MemeReactionType;
//     label: string;
//     flameColor: string;
//     bgHover: string;
//     activeBorder: string;
//   }> = [
//       { id: "mild", label: "Mild", flameColor: "text-slate-400", bgHover: "hover:bg-slate-500/10", activeBorder: "border-slate-400 bg-slate-500/20" },
//       { id: "funny", label: "Funny", flameColor: "text-pink-400", bgHover: "hover:bg-pink-500/10", activeBorder: "border-pink-500 bg-pink-500/20" },
//       { id: "hot", label: "Hot", flameColor: "text-amber-400", bgHover: "hover:bg-amber-500/10", activeBorder: "border-amber-500 bg-amber-500/20" },
//       { id: "fire", label: "Fire", flameColor: "text-orange-500", bgHover: "hover:bg-orange-500/10", activeBorder: "border-orange-500 bg-orange-500/20" },
//       { id: "nuclear", label: "Nuclear", flameColor: "text-fuchsia-400", bgHover: "hover:bg-fuchsia-500/10", activeBorder: "border-fuchsia-500 bg-fuchsia-500/20" },
//     ];

//   return (
//     <motion.div
//       id={`engagement-${item.id}`}
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -12 }}
//       className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-orange-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
//         ? "ring-2 ring-orange-500 shadow-[0_0_35px_rgba(249,115,22,0.35)] scale-[1.01]"
//         : ""
//         }`}
//     >
//       {isHighlighted && (
//         <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-500/40 text-[10px] font-black text-orange-300 flex items-center justify-between">
//           <span className="flex items-center gap-1.5">
//             <Sparkles size={11} className="text-orange-400 animate-pulse" />
//             <span>SHARED MEME</span>
//           </span>
//           <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
//         <div className="flex items-center gap-1.5 uppercase">
//           <span className="text-orange-400 flex items-center gap-1">
//             <Flame size={11} className="text-orange-400" />
//             <span>MEME</span>
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span>{formattedTime}</span>
//         </div>
//       </div>

//       {/* Author Info */}
//       {/* <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2.5">
//           <img
//             src={meme.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
//             alt={meme.authorName || "User"}
//             className="w-8 h-8 rounded-full object-cover border border-white/10"
//             onError={(e: any) => {
//               e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
//             }}
//           />
//           <div>
//             <div className="flex items-center gap-1.5">
//               <span className="text-xs font-bold text-white leading-none">{meme.authorName || "SportsFan"}</span>
//               <CheckCircle2 size={11} className="text-[#FF8A00]" />
//             </div>
//             <span className="text-[10px] text-white/40 font-mono">{meme.authorHandle || "@fan"}</span>
//           </div>
//         </div>
//       </div> */}

//       {/* Caption */}
//       <p className="text-xs font-semibold text-white/90 mb-3 leading-relaxed">
//         {meme.caption}
//       </p>

//       {/* Meme Image */}
//       <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-white/[0.08] mb-3 relative group">
//         <img
//           src={meme.imageUrl}
//           alt={meme.caption || "Meme"}
//           className="w-full h-auto max-h-[360px] object-cover mx-auto"
//           onError={(e: any) => {
//             e.target.src = "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80";
//           }}
//         />
//       </div>

//       {/* Dynamic Heat Gauge Meter */}
//       <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 border border-orange-500/20 mb-3">
//         <div className="flex items-center justify-between text-xs font-bold mb-1.5">
//           <span className="flex items-center gap-1.5 text-orange-400 font-black">
//             <Flame size={14} className="animate-pulse" />
//             <span>Heat Meter</span>
//           </span>
//           <span className="font-mono font-black text-amber-300 text-xs">
//             {heatPercentage}% Heat ({totalHeatVotes} {totalHeatVotes === 1 ? "vote" : "votes"})
//           </span>
//         </div>
//         <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
//           <motion.div
//             initial={{ width: 0 }}
//             animate={{ width: `${heatPercentage}%` }}
//             transition={{ duration: 0.6, ease: "easeOut" }}
//             className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
//           />
//         </div>
//       </div>

//       {/* 5-Flame Rating Selection */}
//       <div className="space-y-2">
//         <div className="flex items-center justify-between text-[10px] font-bold text-white/50 px-1">
//           <span>{hasVoted ? "Your locked rating:" : "Rate how funny/hot this is:"}</span>
//           <span className="text-orange-400 font-mono">+2 SXPs participation</span>
//         </div>

//         <div className="grid grid-cols-5 gap-1.5">
//           {RATING_TIERS.map((tier) => {
//             const isSelected = selectedRating === tier.id;
//             return (
//               <button
//                 key={tier.id}
//                 onClick={() => handleSelectRating(tier.id)}
//                 disabled={hasVoted}
//                 className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${isSelected
//                   ? tier.activeBorder + " shadow-md"
//                   : "border-white/[0.06] bg-white/[0.02] " + tier.bgHover
//                   } ${hasVoted ? "cursor-default opacity-80" : "active:scale-95"}`}
//               >
//                 <Flame size={16} className={`${tier.flameColor} ${isSelected ? "animate-bounce" : ""}`} fill={isSelected ? "currentColor" : "none"} />
//                 <span className="text-[10px] font-black text-white/90 mt-1">{tier.label}</span>
//                 {hasVoted && (
//                   <span className="text-[9px] font-mono text-white/40 mt-0.5">
//                     {reactions[tier.id] || 0}
//                   </span>
//                 )}
//               </button>
//             );
//           })}
//         </div>

//         <button
//           onClick={handleSubmitVote}
//           disabled={!selectedRating || hasVoted || loadingVote}
//           className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${hasVoted
//             ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 cursor-default"
//             : selectedRating
//               ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 active:scale-98 cursor-pointer"
//               : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
//             }`}
//         >
//           {hasVoted ? (
//             <>
//               <Check size={14} />
//               <span>Rating Locked · +2 SXPs Earned</span>
//             </>
//           ) : !selectedRating ? (
//             <span>Select a rating above</span>
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
//             className={`flex items-center gap-1.5 transition-all cursor-pointer active:scale-110 ${liked ? "text-[#FF3D57]" : "hover:text-white"
//               }`}
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
//         <button
//           onClick={() => onOpenEngagedModal?.(item)}
//           className="text-[#FF8A00] hover:text-[#FFA033] transition-colors cursor-pointer flex items-center gap-1.5 font-bold group"
//         >
//           <span className="group-hover:underline">
//             {Math.max(
//               hasUserParticipated ? 1 : 0,
//               totalEngaged,
//               totalEngagedOverride || 0
//             ).toLocaleString()} engaged
//           </span>
//           <ChevronRight
//             size={12}
//             className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
//               }`}
//           />
//         </button>
//       </div>
//     </motion.div>
//   );
// }

// // ─── Engaged Users Dialog Modal ──────────────────────────────────────────────
// interface EngagedOptionData {
//   id: string;
//   text: string;
//   count: number;
//   voters: Array<{
//     userId: string;
//     userName: string;
//     userAvatar?: string | null;
//     selectedOptionId: string;
//     votedAt?: number;
//   }>;
// }

// // Filter helper to strictly exclude unregistered/anonymous IP-based voters
// function isValidRegisteredVoter(voter: any): boolean {
//   if (!voter) return false;
//   const id = String(voter.userId || voter.actualUserId || voter.id || "").trim().toLowerCase();
//   const name = String(voter.userName || voter.username || voter.name || "").trim().toLowerCase();
//   const email = String((voter as any).userEmail || voter.email || "").trim().toLowerCase();

//   // Exclude anonymous / unregistered tokens
//   if (id.startsWith("anon_") || id.startsWith("anon-") || id.startsWith("anon") || id === "anonymous") return false;
//   if (name.startsWith("anon_") || name.startsWith("anon-") || name.startsWith("anon") || name === "anonymous") return false;
//   if (email.startsWith("anon_") || email.startsWith("anon-") || email.startsWith("anon") || email === "anonymous") return false;

//   // Exclude raw IP strings (e.g. IPv6 colons or proxy commas)
//   if (id.includes(":") || name.includes(":") || id.includes(",") || name.includes(",")) return false;

//   return true;
// }

// function EngagedUsersInlineList({
//   item,
//   questionId,
//   questionIndex,
//   onSyncCount,
//   onClose,
// }: {
//   item: EngagementItem | null;
//   questionId?: string;
//   questionIndex?: number;
//   onSyncCount?: (count: number) => void;
//   onClose?: () => void;
// }) {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [options, setOptions] = useState<EngagedOptionData[]>([]);
//   const [totalVoters, setTotalVoters] = useState(0);
//   const [userAvatarMap, setUserAvatarMap] = useState<Map<string, string>>(new Map());
//   const [page, setPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     if (!item) return;

//     setLoading(true);
//     setPage(1); // Reset page on new item or question
//     const parentId = (item as any)._parentEngagementId || item.id;
//     const targetQId = (item as any)._subQuestionId || questionId;
//     const qParam = targetQId ? `?questionId=${encodeURIComponent(targetQId)}` : "";

//     axios
//       .get(`/api/engagements/${parentId}/voters${qParam}`)
//       .then((res) => {
//         if (res.data?.success) {
//           let opts: EngagedOptionData[] = [];
//           if (res.data.questions && Array.isArray(res.data.questions)) {
//             const targetQ = targetQId
//               ? res.data.questions.find((q: any) => q.questionId === targetQId || q.id === targetQId)
//               : res.data.questions[(item as any)._subQuestionIndex ?? questionIndex ?? 0] || res.data.questions[0];
//             opts = targetQ?.options || [];
//           } else if (res.data.options) {
//             if (targetQId && res.data.options.some((o: any) => o.questionId)) {
//               opts = res.data.options.filter((o: any) => o.questionId === targetQId);
//             } else {
//               opts = res.data.options || [];
//             }
//           }

//           // Filter out unregistered/anonymous voters from each option
//           const cleanOpts = opts.map((opt) => {
//             const validVoters = (opt.voters || []).filter((v: any) => isValidRegisteredVoter(v));
//             return {
//               ...opt,
//               voters: validVoters,
//               count: validVoters.length,
//             };
//           });

//           setOptions(cleanOpts);
//           const total = cleanOpts.reduce((acc, o) => acc + (o.voters?.length || 0), 0);
//           setTotalVoters(total);
//         }
//       })
//       .catch((err) => {
//         console.warn("Failed to load voters:", err);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, [item, questionId, questionIndex]);

//   // Fetch fresh user avatars from /api/users
//   useEffect(() => {
//     if (!item) return;

//     const buildMap = (list: any[]) => {
//       const map = new Map<string, string>();
//       const add = (key: any, img: any) => {
//         if (!key || !img || typeof img !== "string") return;
//         const clean = img.trim();
//         if (!clean || clean === "null" || clean === "undefined") return;
//         if (clean.includes("dicebear.com")) return;
//         const k = String(key).trim().toLowerCase();
//         const noPrefix = k.replace(/^user#/i, "");
//         map.set(k, clean);
//         map.set(noPrefix, clean);
//         if (k.includes("@")) map.set(k.replace(/@/g, "_"), clean);
//       };

//       list.forEach((u) => {
//         if (!u) return;
//         const img =
//           u.avatarUrl || u.photoURL || u.picture || u.image ||
//           u.avatar || u.profilePicture || u.userAvatar;
//         if (!img) return;
//         add(u.userId, img);
//         add(u.actualUserId, img);
//         add(u.id, img);
//         add(u.email, img);
//         add(u.userEmail, img);
//         add(u.username, img);
//         add(u.userName, img);
//         add(u.name, img);
//       });
//       return map;
//     };

//     const fetchAvatars = async () => {
//       try {
//         const res = await axios.get("/api/users", { withCredentials: true });
//         const list =
//           res.data?.users ||
//           res.data?.data?.users ||
//           res.data?.data ||
//           res.data?.allUsers ||
//           (Array.isArray(res.data) ? res.data : []);
//         setUserAvatarMap(buildMap(list));
//       } catch {
//         // silent fail
//       }
//     };
//     fetchAvatars();
//   }, [item]);

//   // Check if current user has voted on this item
//   const currentUserVoted = useMemo(() => {
//     if (!user || !item) return false;
//     const uid = user.userId || (user as any)?.actualUserId || user.email;
//     if (!uid || String(uid).toLowerCase().startsWith("anon")) return false;

//     const parentId = (item as any)._parentEngagementId || item.id;
//     const subIdx = (item as any)._subQuestionIndex ?? questionIndex ?? 0;
//     const qId = (item as any)._subQuestionId || questionId || item.quizData?.questions?.[subIdx]?.id || `q_${subIdx + 1}`;

//     if (item.type === "quiz") {
//       return Boolean(
//         getStoredVote(quizAnswerKey(subIdx, qId), item.id, uid) ||
//         getStoredVote(quizAnswerKey(subIdx, qId), parentId, uid) ||
//         getStoredVote("quiz", item.id, uid) ||
//         getStoredVote("quiz_engaged", item.id, uid) ||
//         getStoredVote("quiz_engaged", parentId, uid)
//       );
//     } else if (item.type === "fan_battle") {
//       return Boolean(getStoredVote("fb", item.id, uid));
//     } else if (item.type === "poll") {
//       return Boolean(getStoredVote("poll", item.id, uid));
//     } else if (item.type === "prediction") {
//       return Boolean(getStoredVote("pred", item.id, uid));
//     } else if (item.type === "meme") {
//       return Boolean(getStoredVote("meme", item.id, uid));
//     }
//     return Boolean(item.userVoted);
//   }, [item, user, questionId, questionIndex]);

//   // Combined list of voters strictly filtering out anonymous entries
//   const allVoters = useMemo(() => {
//     const raw = options
//       .flatMap((opt) => (opt.voters || []).map((v) => ({ ...v, optionId: opt.id, optionText: opt.text })))
//       .filter((v) => isValidRegisteredVoter(v));

//     if (currentUserVoted && user) {
//       const uid = String(user.userId || (user as any)?.actualUserId || user.email || "");
//       if (isValidRegisteredVoter({ userId: uid, userName: user.name, userEmail: user.email })) {
//         const alreadyIn = raw.some(
//           (v) =>
//             v.userId === uid ||
//             (user.email && v.userId?.toLowerCase() === user.email.toLowerCase()) ||
//             (user.name && v.userName?.toLowerCase() === user.name.toLowerCase())
//         );

//         if (!alreadyIn && uid) {
//           raw.unshift({
//             userId: uid,
//             userName: user.name || (user as any)?.userName || user.email?.split("@")[0] || "You",
//             userAvatar: (user as any)?.avatarUrl || user.photoURL || (user as any)?.picture || null,
//             selectedOptionId: "",
//             optionId: "",
//             optionText: "",
//             votedAt: Date.now(),
//           });
//         }
//       }
//     }

//     return raw;
//   }, [options, currentUserVoted, user]);

//   const finalVotersCount = allVoters.length;

//   useEffect(() => {
//     if (!loading) {
//       onSyncCount?.(finalVotersCount);
//     }
//   }, [finalVotersCount, loading, onSyncCount]);

//   if (!item) return null;

//   // Resolve the freshest avatar for a voter
//   const resolveAvatar = (voter: EngagedOptionData["voters"][number]): string => {
//     const isMe =
//       user?.userId === voter.userId ||
//       (user as any)?.actualUserId === voter.userId ||
//       (user?.email && voter.userId === user.email);

//     if (isMe && typeof window !== "undefined") {
//       const local = localStorage.getItem("roar_avatar_url");
//       if (local && !local.includes("dicebear.com")) return local;
//     }
//     if (voter.userAvatar) return voter.userAvatar;

//     const candidates = [
//       voter.userId,
//       voter.userName,
//       (voter as any).userEmail,
//     ].filter(Boolean) as string[];

//     for (const c of candidates) {
//       const k = String(c).trim().toLowerCase();
//       const found =
//         userAvatarMap.get(k) ||
//         userAvatarMap.get(k.replace(/^user#/i, "")) ||
//         userAvatarMap.get(k.replace(/@/g, "_"));
//       if (found) return found;
//     }
//     return "";
//   };

//   const displayedVoters = allVoters.slice(0, page * itemsPerPage);
//   const hasMore = displayedVoters.length < allVoters.length;

//   const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
//     const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
//     if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore) {
//       setPage((p) => p + 1);
//     }
//   };

//   const totalQuestions = item.quizData?.questions?.length || 1;

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0, height: 0 }}
//         animate={{ opacity: 1, height: "auto" }}
//         exit={{ opacity: 0, height: 0 }}
//         className="w-full max-w-lg mx-auto bg-gradient-to-b from-[#24131c]/90 to-[#0d111c]/95 rounded-2xl overflow-hidden mt-2 mb-2 border border-white/10 shadow-2xl relative"
//       >
//         {/* Header - Simple Title Without Number & Quick Close */}
//         <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.04]">
//           <h3 className="text-xs font-bold text-white/80 flex items-center gap-1.5">
//             <span>Engaged Fans</span>
//             {item.type === "quiz" && totalQuestions > 1 && (
//               <span className="text-[9px] text-[#FF8A00] font-extrabold bg-[#FF8A00]/15 px-1.5 py-0.5 rounded-full border border-[#FF8A00]/30">
//                 Q{((item as any)._subQuestionIndex ?? questionIndex ?? 0) + 1}/{totalQuestions}
//               </span>
//             )}
//           </h3>
//           {onClose && (
//             <button
//               onClick={onClose}
//               className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-white/50 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/[0.08]"
//               title="Close list"
//             >
//               <X size={12} />
//             </button>
//           )}
//         </div>

//         {/* Voters List Body - Clean Spacing & Avatar/Name Only */}
//         <div
//           className="max-h-[220px] overflow-y-auto px-4 pb-2.5 space-y-0"
//           onScroll={handleScroll}
//         >
//           {loading ? (
//             <div className="py-4 flex flex-col items-center justify-center gap-1.5 text-white/40 text-[11px] font-medium">
//               <div className="w-5 h-5 rounded-full border-2 border-[#FF8A00] border-t-transparent animate-spin" />
//               <span>Loading fans...</span>
//             </div>
//           ) : allVoters.length === 0 ? (
//             <div className="py-4 flex flex-col items-center justify-center text-center text-[11px] font-medium text-white/40 space-y-1">
//               <Users size={18} className="mx-auto text-white/20 mb-1" />
//               <p>No fans opted yet.</p>
//             </div>
//           ) : (
//             <>
//               {displayedVoters.map((voter, idx) => {
//                 const initialLetter = voter.userName ? voter.userName.charAt(0).toUpperCase() : "F";
//                 const avatarUrl = resolveAvatar(voter);
//                 const rawName = voter.userName || "Fan";
//                 const displayName = rawName.includes("_gmail_com")
//                   ? rawName.replace(/_gmail_com/gi, "")
//                   : rawName;

//                 return (
//                   <div
//                     key={`${voter.userId}-${idx}`}
//                     onClick={() => {
//                       window.location.href = `/MainModules/Profile?userId=${encodeURIComponent(
//                         voter.userId
//                       )}`;
//                     }}
//                     className="py-1.5 border-b border-white/[0.04] flex items-center justify-between gap-3 transition-all cursor-pointer group last:border-0"
//                   >
//                     <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
//                       {avatarUrl ? (
//                         <img
//                           src={avatarUrl}
//                           alt={voter.userName}
//                           referrerPolicy="no-referrer"
//                           crossOrigin="anonymous"
//                           className="w-6.5 h-6.5 rounded-full object-cover border border-white/10 shrink-0"
//                           onError={(e: any) => {
//                             e.target.style.display = "none";
//                             e.target.nextSibling.style.display = "flex";
//                           }}
//                         />
//                       ) : null}
//                       <div
//                         style={{ display: avatarUrl ? "none" : "flex" }}
//                         className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 border border-white/10 items-center justify-center text-white font-black text-[10px] shrink-0"
//                       >
//                         {initialLetter}
//                       </div>

//                       <div className="min-w-0 flex-1">
//                         <h4 className="text-[12px] font-semibold text-white/90 group-hover:text-amber-400 transition-colors break-words break-all whitespace-normal leading-tight">
//                           {displayName}
//                         </h4>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}

//               {hasMore && (
//                 <div className="py-2.5 flex flex-col items-center justify-center gap-1 text-white/40 text-[9px] font-bold">
//                   <div className="w-3.5 h-3.5 rounded-full border-2 border-[#FF8A00] border-t-transparent animate-spin" />
//                   <span>Loading more...</span>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Mobile-friendly Close button at the end of the list */}
//         {onClose && (
//           <div className="p-2 border-t border-white/[0.04] bg-white/[0.02] flex items-center justify-center">
//             <button
//               onClick={onClose}
//               className="py-1.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-white/70 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/[0.08] active:scale-95 shadow-sm"
//             >
//               <ChevronUp size={13} className="text-[#FF8A00]" />
//               <span>Close</span>
//             </button>
//           </div>
//         )}
//       </motion.div>
//     </AnimatePresence>
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
//   const currentUser = resolveCurrentUser(user);
//   const activeUserId = currentUser.activeUserId;
//   const [engagements, setEngagements] = useState<EngagementItem[]>([]);
//   const [loadingEngagements, setLoadingEngagements] = useState(true);
//   const [filter, setFilter] = useState<"all" | "quiz" | "poll" | "battle" | "prediction" | "meme">("all");
//   const [toastMessage, setToastMessage] = useState<string | null>(null);
//   const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
//   const [engagedModalItem, setEngagedModalItem] = useState<EngagementItem | null>(null);
//   const [quizActiveQuestion, setQuizActiveQuestion] = useState<Record<string, { index: number; id: string }>>({});
//   const [syncedEngagedCounts, setSyncedEngagedCounts] = useState<Record<string, number>>({});

//   const handleSyncEngagedCount = useCallback((itemId: string, count: number) => {
//     setSyncedEngagedCounts((prev) => {
//       const current = prev[itemId] || 0;
//       const nextVal = Math.max(current, count);
//       if (prev[itemId] === nextVal) return prev;
//       return { ...prev, [itemId]: nextVal };
//     });
//   }, []);

//   const handleQuizQuestionChange = useCallback((itemId: string, index: number, id: string) => {
//     setQuizActiveQuestion((prev) => {
//       if (prev[itemId]?.index === index && prev[itemId]?.id === id) return prev;
//       return {
//         ...prev,
//         [itemId]: { index, id },
//       };
//     });
//   }, []);

//   const handleOpenEngagedModal = (item: EngagementItem) => {
//     if (engagedModalItem?.id === item.id) {
//       setEngagedModalItem(null); // Toggle off if already open
//     } else {
//       setEngagedModalItem(item); // Open new
//     }
//   };

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

//         // Pre-fetch accurate registered voter counts for all loaded items on feed load
//         liveItems.forEach((it) => {
//           axios
//             .get(`/api/engagements/${it.id}/voters`)
//             .then((votersRes) => {
//               if (votersRes.data?.success) {
//                 let opts: any[] = [];
//                 if (votersRes.data.questions && Array.isArray(votersRes.data.questions)) {
//                   opts = votersRes.data.questions[0]?.options || [];
//                 } else if (votersRes.data.options) {
//                   opts = votersRes.data.options;
//                 }

//                 const allRegisteredVoters = opts
//                   .flatMap((o: any) => o.voters || [])
//                   .filter((v: any) => isValidRegisteredVoter(v));

//                 // Deduplicate unique voters
//                 const uniqueVoters = new Set<string>();
//                 allRegisteredVoters.forEach((v: any) => {
//                   const key = String(v.userId || v.actualUserId || v.userName || "").trim().toLowerCase();
//                   if (key) uniqueVoters.add(key);
//                 });

//                 const count = uniqueVoters.size > 0 ? uniqueVoters.size : allRegisteredVoters.length;
//                 if (count > 0) {
//                   handleSyncEngagedCount(it.id, count);
//                 }
//               }
//             })
//             .catch(() => { });
//         });
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
//   }, [selectedSport, activeUserId, handleSyncEngagedCount]);

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
//     const targetId = (item as any)._parentEngagementId || item.id;
//     if (!confirm(`Are you sure you want to delete this ${label} "${item.title || item.subtitle || "Untitled"}"?`)) {
//       return;
//     }
//     try {
//       await engagementService.deleteEngagement(targetId);
//       setEngagements((prev) => prev.filter((it) => it.id !== targetId));
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
//       const typeLabel =
//         savedItem.type === "quiz"
//           ? "Quiz Question"
//           : savedItem.type === "poll"
//             ? "Poll"
//             : savedItem.type === "prediction"
//               ? "Prediction"
//               : savedItem.type === "fan_battle"
//                 ? "Fan Battle"
//                 : "Meme";
//       showToast(`${typeLabel} Created Successfully! +${PARTICIPATION_POINTS} SXPs earned 🚀`);
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
//     const tabParam = urlParams.get("tab");

//     if (tabParam === "leaderboard") {
//       setShowLeaderboardModal(true);
//     }

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

//   // Filter and sort arena engagements
//   const filteredEngagements = useMemo(() => {
//     return engagements
//       .filter((item) => {
//         if (!item || !item.title || !item.type) return false;

//         // Always include the highlighted shared item even if filter differs
//         if (
//           highlightedItemId &&
//           (item.id === highlightedItemId || (item as any)._parentEngagementId === highlightedItemId)
//         ) {
//           return true;
//         }

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
//           if (a.id === highlightedItemId || (a as any)._parentEngagementId === highlightedItemId) return -1;
//           if (b.id === highlightedItemId || (b as any)._parentEngagementId === highlightedItemId) return 1;
//         }

//         return getEngagementPostingTime(b) - getEngagementPostingTime(a);
//       });
//   }, [engagements, filter, highlightedItemId]);

//   return (
//     <div className="w-full bg-[#070b14] min-h-screen text-white flex flex-col font-sans pb-16 relative">
//       <AnimatePresence>
//         {toastMessage && (
//           <motion.div
//             initial={{ opacity: 0, y: -20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -20, scale: 0.95 }}
//             className="fixed top-5 left-1/2 -translate-x-1/2 z-[100005] bg-gradient-to-r from-[#161e2e] via-[#1a2234] to-[#161e2e] border-2 border-emerald-500/50 text-white text-xs font-black px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex items-center gap-2.5 backdrop-blur-xl pointer-events-none"
//           >
//             <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
//               <CheckCircle2 size={14} />
//             </div>
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
//                 <h1 className="text-base font-black tracking-tight">FlipARENA 🏟️</h1>
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
//         <div className="px-3 sm:px-4 mb-3 sm:mb-4 mt-3 sm:mt-4">
//           <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
//             {/* FlipLINE Tab */}
//             <button
//               onClick={() => (window.location.href = "/MainModules/FlipLine")}
//               className="relative py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#111418] border border-[#2A2F36] active:scale-[0.99] overflow-hidden"
//             >
//               <Zap size={18} className="text-[#9AA3AF]" />
//               <span className="text-[13.5px] sm:text-[15px] tracking-wide font-bold text-[#9AA3AF]">
//                 FlipLINE
//               </span>
//             </button>

//             {/* FlipARENA Tab */}
//             <button
//               className="relative py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#111418] border border-[#2A2F36] active:scale-[0.99] overflow-hidden"
//             >
//               <Target size={18} className="text-[#FF2D8A]" />
//               <span className="text-[13.5px] sm:text-[15px] tracking-wide font-black text-[#FFFFFF]">
//                 FlipARENA
//               </span>
//               <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF2D8A]" />
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05] mt-2 gap-2 flex-wrap">
//         <div>
//           <h2 className="text-base font-black tracking-tight">Today's Arena</h2>
//           <p className="text-[10px] text-white/35 mt-0.5">Earn +2 SXPs participation · +10 SXPs for correct answers</p>
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
//           <div className="flex gap-1.5 bg-[#111418] p-1 rounded-xl border border-[#2A2F36] overflow-x-auto">
//             {(["all", "quiz", "poll", "battle", "prediction", "meme"] as const).map((tab) => {
//               const isSelected = filter === tab;
//               return (
//                 <button
//                   key={tab}
//                   onClick={() => setFilter(tab)}
//                   className={`relative px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 overflow-hidden ${isSelected
//                       ? "text-[#FFFFFF] bg-white/[0.06]"
//                       : "text-[#9AA3AF] hover:text-white/80 hover:bg-white/[0.02]"
//                     }`}
//                 >
//                   <span>{tab === "all" ? "All" : tab === "meme" ? "Meme" : tab}</span>
//                   {isSelected && (
//                     <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF2D8A]" />
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       <div className="px-4 space-y-5 mt-2 flex flex-col items-center w-full max-w-lg mx-auto">
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
//                       ? "fan_battle"
//                       : filter === "prediction"
//                         ? "prediction"
//                         : filter === "meme"
//                           ? "meme"
//                           : filter
//                 )
//               }
//               className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-pink-500/20 cursor-pointer"
//             >
//               <Plus size={13} /> Create First {filter === "all" ? "Event" : filter.toUpperCase()} (+2 SXPs)
//             </button>
//           </div>
//         ) : (
//           <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
//             <AnimatePresence mode="popLayout">
//               {filteredEngagements.map((item) => {
//                 const isItemHighlighted = Boolean(highlightedItemId && (item.id === highlightedItemId || (item as any)._parentEngagementId === highlightedItemId));

//                 // Determine the correct Card Component
//                 let CardComponent = null;
//                 if (item.type === "fan_battle") CardComponent = DynamicFanBattleCard;
//                 else if (item.type === "quiz") CardComponent = DynamicQuizCard;
//                 else if (item.type === "poll") CardComponent = DynamicPollCard;
//                 else if (item.type === "prediction") CardComponent = DynamicPredictionCard;
//                 else if (item.type === "meme") CardComponent = DynamicMemeCard;

//                 if (!CardComponent) return null;

//                 return (
//                   <motion.div
//                     layout
//                     key={item.id}
//                     className="w-full max-w-lg mx-auto flex flex-col items-center"
//                   >
//                     <CardComponent
//                       item={item}
//                       userId={activeUserId}
//                       userName={currentUser.userName}
//                       userAvatar={currentUser.userAvatar}
//                       userEmail={currentUser.userEmail}
//                       now={now}
//                       onToast={showToast}
//                       onEdit={handleOpenEdit}
//                       onDelete={item.type === "meme" ? handleDeleteEngagement : undefined}
//                       isHighlighted={isItemHighlighted}
//                       onOpenEngagedModal={handleOpenEngagedModal}
//                       isEngagedExpanded={engagedModalItem?.id === item.id}
//                       totalEngagedOverride={syncedEngagedCounts[item.id] ?? syncedEngagedCounts[(item as any)._parentEngagementId]}
//                       onQuestionChange={item.type === "quiz" ? (index: number, qId: string) => handleQuizQuestionChange(item.id, index, qId) : undefined}
//                       onOpenLeaderboard={() => setShowLeaderboardModal(true)}
//                       onSyncEngagedCount={(count) => {
//                         handleSyncEngagedCount(item.id, count);
//                         if ((item as any)._parentEngagementId) {
//                           handleSyncEngagedCount((item as any)._parentEngagementId, count);
//                         }
//                       }}
//                     />

//                     {/* Inline Engaged Users List */}
//                     {engagedModalItem?.id === item.id && (
//                       <EngagedUsersInlineList
//                         item={engagedModalItem}
//                         questionId={(engagedModalItem as any)._subQuestionId || quizActiveQuestion[item.id]?.id}
//                         questionIndex={(engagedModalItem as any)._subQuestionIndex ?? quizActiveQuestion[item.id]?.index}
//                         onSyncCount={(count) => handleSyncEngagedCount(item.id, count)}
//                         onClose={() => setEngagedModalItem(null)}
//                       />
//                     )}
//                   </motion.div>
//                 );
//               })}
//             </AnimatePresence>
//           </div>
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
//                 View Full FlipARENA
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
  ChevronUp,
  ChevronDown,
  LayoutGrid,
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

// ─── Channel filter chips (matching Figma specs & FlipLine layout) ───────────
const ARENA_FILTER_CHIPS: Array<{
  id: "all" | "quiz" | "poll" | "battle" | "prediction" | "meme";
  label: string;
  emoji: string;
  isHash: boolean;
}> = [
  { id: "all", label: "All", emoji: "", isHash: true },
  { id: "quiz", label: "Quiz", emoji: "🧠", isHash: false },
  { id: "poll", label: "Poll", emoji: "📊", isHash: false },
  { id: "battle", label: "Battle", emoji: "🥊", isHash: false },
  { id: "prediction", label: "Prediction", emoji: "🔮", isHash: false },
  { id: "meme", label: "Meme", emoji: "🎭", isHash: false },
];

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

// ─── Quiz Per-Question Answer Key (collision-proof) ──────────────────────────
function quizAnswerKey(index: number, questionId?: string) {
  return `quiz_ans_${index}_${questionId ?? ""}`;
}

// ─── Global Voter Identity Match Helper ──────────────────────────────────────
// ─── Global Voter Identity & Normalization Helpers ──────────────────────────
export interface NormalizedVoter {
  userId: string;
  userName: string;
  userAvatar: string | null;
  userEmail: string;
  selectedOptionId: string;
  optionId: string;
  optionText: string;
  votedAt: number;
}

function isIpAddress(str: string): boolean {
  if (!str) return false;
  const s = str.trim();
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(s)) return true;
  if (s.includes(",") && s.split(",").every((part) => /^\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(part))) return true;
  if (s.includes(":") && !s.includes("-") && !s.includes("_") && !s.includes("@") && /^[0-9a-fA-F:]+$/.test(s) && (s.match(/:/g) || []).length >= 2) return true;
  return false;
}

function isValidRegisteredVoter(voter: any): boolean {
  if (!voter) return false;
  if (typeof voter === "string") {
    const s = voter.trim();
    if (!s) return false;
    const l = s.toLowerCase();
    if (l.startsWith("anon_") || l.startsWith("anon-") || l.startsWith("anon") || l === "anonymous" || l === "guest") return false;
    if (isIpAddress(s)) return false;
    return true;
  }
  const id = String(voter.userId || voter.uid || voter.actualUserId || voter.id || voter.user_id || "").trim();
  const name = String(voter.userName || voter.username || voter.name || voter.displayName || "").trim();
  const email = String((voter as any).userEmail || voter.email || "").trim();

  const idL = id.toLowerCase();
  const nameL = name.toLowerCase();
  const emailL = email.toLowerCase();

  if (idL.startsWith("anon_") || idL.startsWith("anon-") || idL.startsWith("anon") || idL === "anonymous" || idL === "guest") return false;
  if (nameL.startsWith("anon_") || nameL.startsWith("anon-") || nameL.startsWith("anon") || nameL === "anonymous" || nameL === "guest") return false;
  if (emailL.startsWith("anon_") || emailL.startsWith("anon-") || emailL.startsWith("anon") || emailL === "anonymous") return false;

  if (isIpAddress(id) || isIpAddress(name) || isIpAddress(email)) return false;

  return Boolean(id || name || email);
}

function normalizeVoter(voter: any, defaultOptionId = "", defaultOptionText = ""): NormalizedVoter | null {
  if (!voter) return null;
  if (!isValidRegisteredVoter(voter)) return null;

  if (typeof voter === "string") {
    const str = voter.trim();
    const isEmail = str.includes("@");
    return {
      userId: str,
      userName: isEmail ? str.split("@")[0] : str,
      userAvatar: null,
      userEmail: isEmail ? str : "",
      selectedOptionId: defaultOptionId,
      optionId: defaultOptionId,
      optionText: defaultOptionText,
      votedAt: Date.now(),
    };
  }

  const rawId = String(voter.userId || voter.uid || voter.actualUserId || voter.id || voter.user_id || "").trim();
  const rawName = String(voter.userName || voter.username || voter.name || voter.displayName || "").trim();
  const rawEmail = String((voter as any).userEmail || voter.email || "").trim();
  const rawAvatar = voter.userAvatar || voter.avatarUrl || voter.avatar || voter.photoURL || voter.image || voter.picture || null;

  const resolvedId = rawId || rawEmail || rawName;
  if (!resolvedId) return null;

  const rawDisplay = rawName || (rawEmail ? rawEmail.split("@")[0] : "") || (rawId ? rawId.replace(/^user#/i, "") : "Fan");
  const cleanDisplayName = rawDisplay.includes("_gmail_com")
    ? rawDisplay.replace(/_gmail_com/gi, "")
    : rawDisplay.includes("@")
      ? rawDisplay.split("@")[0]
      : rawDisplay;

  return {
    userId: rawId || resolvedId,
    userName: cleanDisplayName,
    userAvatar: typeof rawAvatar === "string" && rawAvatar.trim() && !rawAvatar.includes("dicebear.com") ? rawAvatar.trim() : null,
    userEmail: rawEmail,
    selectedOptionId: String(voter.selectedOptionId || voter.optionId || voter.side || voter.choice || defaultOptionId || "").trim(),
    optionId: String(voter.optionId || defaultOptionId || "").trim(),
    optionText: String(voter.optionText || defaultOptionText || "").trim(),
    votedAt: Number(voter.votedAt) || Date.now(),
  };
}

function checkVoterMatch(voter: any, userId?: string, userName?: string, userEmail?: string): boolean {
  if (!voter) return false;
  const uid = String(userId || "").trim().toLowerCase();
  const uname = String(userName || "").trim().toLowerCase();
  const uemail = String(userEmail || "").trim().toLowerCase();

  if (typeof voter === "string") {
    const vStr = voter.trim().toLowerCase();
    if (uid && (vStr === uid || vStr.includes(uid) || uid.includes(vStr))) return true;
    if (uemail && vStr === uemail) return true;
    if (uname && vStr === uname) return true;
    return false;
  }

  const vUid = String(voter.userId || voter.uid || voter.actualUserId || voter.id || voter.user_id || "").trim().toLowerCase();
  const vName = String(voter.userName || voter.username || voter.name || voter.displayName || "").trim().toLowerCase();
  const vEmail = String((voter as any).userEmail || voter.email || "").trim().toLowerCase();

  if (uid && vUid && (uid === vUid || vUid.includes(uid) || uid.includes(vUid))) return true;
  if (uemail && vEmail && uemail === vEmail) return true;
  if (uemail && vUid && (uemail === vUid || vUid.includes(uemail))) return true;
  if (uname && vName && uname === vName) return true;
  return false;
}

function extractVotersFromResponse(
  resData: any,
  targetQId?: string,
  questionIndex?: number
): { allVoters: NormalizedVoter[]; questionVoters: Record<string, NormalizedVoter[]> } {
  const result: { allVoters: NormalizedVoter[]; questionVoters: Record<string, NormalizedVoter[]> } = {
    allVoters: [],
    questionVoters: {},
  };
  if (!resData) return result;

  const data = resData.data && typeof resData.data === "object" ? { ...resData, ...resData.data } : resData;
  const uniqueOverallMap = new Map<string, NormalizedVoter>();

  const addVoter = (v: any, optId = "", optText = "", qKey?: string) => {
    const norm = normalizeVoter(v, optId, optText);
    if (!norm) return;
    const key = (norm.userId || norm.userEmail || norm.userName).toLowerCase().replace(/^user#/i, "").trim();
    if (!key) return;

    if (!uniqueOverallMap.has(key)) {
      uniqueOverallMap.set(key, norm);
    }
    if (qKey) {
      if (!result.questionVoters[qKey]) {
        result.questionVoters[qKey] = [];
      }
      if (!result.questionVoters[qKey].some((existing) =>
        (existing.userId || existing.userEmail || existing.userName).toLowerCase().replace(/^user#/i, "").trim() === key
      )) {
        result.questionVoters[qKey].push(norm);
      }
    }
  };

  if (Array.isArray(data.questions)) {
    data.questions.forEach((q: any, idx: number) => {
      const qKey = String(q.questionId || q.id || `q_${idx + 1}`).trim();
      const qAltKey = String(q.id || q.questionId || `q_${idx + 1}`).trim();

      if (Array.isArray(q.options)) {
        q.options.forEach((opt: any) => {
          const optId = String(opt.id || opt.text || "").trim();
          const optText = String(opt.text || opt.id || "").trim();
          if (Array.isArray(opt.voters)) {
            opt.voters.forEach((v: any) => {
              addVoter(v, optId, optText, qKey);
              if (qAltKey !== qKey) addVoter(v, optId, optText, qAltKey);
            });
          }
        });
      }
      if (Array.isArray(q.voters)) {
        q.voters.forEach((v: any) => {
          addVoter(v, "", "", qKey);
          if (qAltKey !== qKey) addVoter(v, "", "", qAltKey);
        });
      }
    });
  }

  if (Array.isArray(data.options)) {
    data.options.forEach((opt: any) => {
      const optId = String(opt.id || opt.text || "").trim();
      const optText = String(opt.text || opt.id || "").trim();
      const qKey = opt.questionId ? String(opt.questionId).trim() : undefined;
      if (Array.isArray(opt.voters)) {
        opt.voters.forEach((v: any) => addVoter(v, optId, optText, qKey));
      }
    });
  }

  if (Array.isArray(data.voters)) {
    data.voters.forEach((v: any) => addVoter(v));
  } else if (data.voters && typeof data.voters === "object") {
    Object.entries(data.voters).forEach(([optKey, vList]) => {
      if (Array.isArray(vList)) {
        vList.forEach((v: any) => addVoter(v, optKey, optKey));
      }
    });
  }

  if (Array.isArray(data.users)) {
    data.users.forEach((v: any) => addVoter(v));
  }

  result.allVoters = Array.from(uniqueOverallMap.values());
  return result;
}


// ─── Direct Engagement Share URL Generator ───────────────────────────────────
function getEngagementShareUrl(item: EngagementItem): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const itemType = item.type || "quiz";
  const targetId = (item as any)._parentEngagementId || item.id;
  return `${origin}/MainModules/FlipArena?itemId=${encodeURIComponent(targetId)}&type=${encodeURIComponent(itemType)}`;
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
  onEdit?: (item: EngagementItem) => void;
  isHighlighted?: boolean;
  onOpenEngagedModal?: (item: EngagementItem) => void;
  isEngagedExpanded?: boolean;
  totalEngagedOverride?: number;
  onSyncEngagedCount?: (count: number) => void;
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
  const [hasShared, setHasShared] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(`sf_shared_${item.id}_${userId || "anon"}`));
  });

  const hasUserParticipated = Boolean(selectedSide !== null || initialStored || item.userVoted);
  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined
      ? totalEngagedOverride
      : (hasUserParticipated ? Math.max(1, Number(item.totalEngaged) || 0) : (Number(item.totalEngaged) || 0));
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
    const nextCount = Math.max(1, totalEngaged + 1);
    setTotalEngaged(nextCount);
    onSyncEngagedCount?.(nextCount);

    try {
      const res: any = await engagementService.voteEngagement(item.id, side, userId, undefined, { userName, userAvatar, userEmail });
      const calculatedResult = {
        leftPercentage: res?.leftPercentage ?? (side === "left" ? 68 : 32),
        rightPercentage: res?.rightPercentage ?? (side === "right" ? 68 : 32),
        totalVotes: res?.totalVotes ?? (left.votes + right.votes + 1),
      };
      setResult(calculatedResult);
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
    const targetId = (item as any)._parentEngagementId || item.id;
    if (!hasShared) {
      setHasShared(true);
      setSharesCount((prev) => prev + 1);
      if (typeof window !== "undefined") {
        localStorage.setItem(`sf_shared_${targetId}_${userId || "anon"}`, "true");
      }
      engagementService.shareEngagement(targetId)
        .then((res: any) => {
          if (res?.sharesCount !== undefined) {
            setSharesCount(Number(res.sharesCount));
          }
        })
        .catch(() => { });
    }

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
            className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
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
  onSyncEngagedCount,
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
  onSyncEngagedCount?: (count: number) => void;
}) {
  // ── BUG FIX B: hold onSyncEngagedCount in a ref so the per-question
  // fetch effect doesn't re-run when the parent re-renders.
  const onSyncEngagedCountRef = useRef(onSyncEngagedCount);
  useEffect(() => {
    onSyncEngagedCountRef.current = onSyncEngagedCount;
  }, [onSyncEngagedCount]);

  const rawQuestions = useMemo(() => {
    if (item.quizData?.questions && Array.isArray(item.quizData.questions) && item.quizData.questions.length > 0) {
      return item.quizData.questions.map((q: any, idx: number) => {
        const fallbackId = `q_${idx + 1}`;
        const normalizedId = q?.id || q?._id || q?.questionId || fallbackId;
        return {
          ...q,
          id: String(normalizedId),
          question: q.question || q.title || `Question ${idx + 1}`,
          options: q.options || [
            { id: "A", text: "Option A" },
            { id: "B", text: "Option B" },
            { id: "C", text: "Option C" },
            { id: "D", text: "Option D" },
          ],
          correctOptionId: q.correctOptionId || q.answer || "A",
          explanation: q.explanation || "SportsFan360 Quiz",
        };
      });
    }
    return [
      {
        id: (item as any)._subQuestionId || "q_1",
        question: item.quizData?.question || item.title || "Live Cricket Quiz",
        options: item.quizData?.options || [
          { id: "A", text: "Option A" },
          { id: "B", text: "Option B" },
          { id: "C", text: "Option C" },
          { id: "D", text: "Option D" },
        ],
        correctOptionId: item.quizData?.correctOptionId || (item.quizData as any)?.answer || "A",
        explanation: item.quizData?.explanation || "SportsFan360 Quiz",
      },
    ];
  }, [item.quizData, item.title, (item as any)._subQuestionId]);

  const totalQuestions = rawQuestions.length;

  const checkIsOptionCorrect = useCallback((optId: string, q: any) => {
    if (!q) return false;
    const target = String(q.correctOptionId || q.answer || "").trim().toUpperCase();
    const chosen = q.options?.find((o: any) => o.id === optId || o.text === optId);
    if (chosen?.isCorrect === true) return true;
    if (String(optId).trim().toUpperCase() === target) return true;
    if (chosen && String(chosen.text || "").trim().toUpperCase() === target) return true;
    return false;
  }, []);

  const getStoredQuizAnswer = useCallback((q: any, index: number) => {
    if (!q) return null;
    const parentId = (item as any)._parentEngagementId || item.id;
    const subIdx = (item as any)._subQuestionIndex ?? index;
    const subId = (item as any)._subQuestionId || q.id;

    const candidates: Array<[string, string]> = [
      [quizAnswerKey(index, q.id), item.id],
      [quizAnswerKey(index, q.id), parentId],
      [quizAnswerKey(subIdx, subId), item.id],
      [quizAnswerKey(subIdx, subId), parentId],
    ];
    if (totalQuestions === 1) {
      candidates.push([`quiz`, item.id]);
      candidates.push([`quiz`, parentId]);
    }

    for (const [key, id] of candidates) {
      const v = getStoredVote(key, id, userId);
      if (v) return v;
    }
    return null;
  }, [item.id, userId, totalQuestions, (item as any)._parentEngagementId, (item as any)._subQuestionIndex, (item as any)._subQuestionId]);

  const [dbAnswers, setDbAnswers] = useState<Record<number, { selectedId: string; isCorrect: boolean; earnedPoints?: number }>>({});

  const getEffectiveAnswer = useCallback((q: any, index: number) => {
    if (dbAnswers[index]) return dbAnswers[index];
    return getStoredQuizAnswer(q, index);
  }, [dbAnswers, getStoredQuizAnswer]);

  const initialFinish = getStoredVote("quiz_finish", item.id, userId);
  const [quizFinished, setQuizFinished] = useState<boolean>(Boolean(initialFinish?.finished));
  const [totalScore, setTotalScore] = useState<number>(() => {
    if (initialFinish?.score !== undefined) return Number(initialFinish.score);
    let sum = 0;
    rawQuestions.forEach((q, idx) => {
      const ans = getEffectiveAnswer(q, idx);
      if (ans) {
        sum += (ans.earnedPoints || (PARTICIPATION_POINTS + (ans.isCorrect ? CORRECT_OPTION_BONUS : 0)));
      }
    });
    return sum;
  });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const currentQ = rawQuestions[Math.min(currentQIndex, totalQuestions - 1)];

  // ── BUG FIX C: key questionVotersCount by question id (not index)
  const [questionVotersCount, setQuestionVotersCount] = useState<Record<string, number>>({});


  useEffect(() => {
    if (currentQ) {
      const qId = currentQ.id || `q_${currentQIndex + 1}`;
      onQuestionChange?.(currentQIndex, qId);
    }
  }, [currentQIndex, currentQ?.id, onQuestionChange]);

  const correctOptionId = currentQ?.correctOptionId || (currentQ as any)?.answer || "A";
  const frequencyMinutes = Number(
    item.quizData?.frequencyMinutes !== undefined && item.quizData?.frequencyMinutes !== null
      ? item.quizData.frequencyMinutes
      : 0
  );
  const frequencyMs = frequencyMinutes * 60 * 1000;

  const initialQ = getEffectiveAnswer(currentQ, currentQIndex);

  const calculateQuizProgress = useCallback(() => {
    let answeredQCount = 0;
    let correctQCount = 0;
    let earnedSum = 0;

    rawQuestions.forEach((q, idx) => {
      const ans = getEffectiveAnswer(q, idx);
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
  }, [rawQuestions, totalQuestions, getEffectiveAnswer]);

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
  const [hasShared, setHasShared] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(`sf_shared_${item.id}_${userId || "anon"}`));
  });

  const hasAlreadyEngaged = useMemo(() => {
    if (totalQuestions === 1 && item.userVoted) return true;
    if (getStoredVote("quiz_engaged", item.id, userId)) return true;
    if (getStoredVote("quiz_finish", item.id, userId)) return true;
    return rawQuestions.some((q, idx) => Boolean(getEffectiveAnswer(q, idx)));
  }, [item.id, item.userVoted, userId, rawQuestions, getEffectiveAnswer, totalQuestions]);

  const hasEngagedRef = useRef<boolean>(hasAlreadyEngaged);

  useEffect(() => {
    if (hasAlreadyEngaged) {
      hasEngagedRef.current = true;
    }
  }, [hasAlreadyEngaged]);

  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined
      ? totalEngagedOverride
      : (hasAlreadyEngaged || answered || selectedId ? Math.max(1, Number(item.totalEngaged) || 0) : (Number(item.totalEngaged) || 0));
  });

  useEffect(() => {
    if (totalEngagedOverride !== undefined) {
      setTotalEngaged(totalEngagedOverride);
    }
  }, [totalEngagedOverride]);

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

  // Initial like & finish sync on mount
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
  }, [item.id, userId, item.userLiked]);

  // ── BUG FIX B: per-question voter count fetch — use ref, drop onSyncEngagedCount from deps
  useEffect(() => {
    if (totalQuestions <= 1 || !currentQ?.id) return;
    const parentId = (item as any)._parentEngagementId || item.id;
    let cancelled = false;

    axios
      .get(`/api/engagements/${parentId}/voters?questionId=${encodeURIComponent(currentQ.id)}`)
      .then((res) => {
        if (cancelled || !res.data?.success) return;
        const { questionVoters } = extractVotersFromResponse(res.data, currentQ.id, currentQIndex);
        const count = (questionVoters[currentQ.id] || questionVoters[`q_${currentQIndex + 1}`] || []).length;
        setQuestionVotersCount((prev) => ({ ...prev, [currentQ.id]: count }));
      })
      .catch(() => { });

    return () => { cancelled = true; };
  }, [currentQ?.id, currentQIndex, item.id, (item as any)._parentEngagementId, totalQuestions]);

  // ── BUG FIX A: hydratingAnswers flag actually set/cleared
  const [hydratingAnswers, setHydratingAnswers] = useState(false);

  // Database-first voters sync to restore user's actual chosen answers per question
  useEffect(() => {
    if (!userId) return;
    const parentId = (item as any)._parentEngagementId || item.id;
    let isMounted = true;
    setHydratingAnswers(true);

    const hydrate = async () => {
      // 1. Check local item.quizData.questions if options already contain voters
      const initialRecovered: Record<number, { selectedId: string; isCorrect: boolean; earnedPoints?: number }> = {};
      if (item.quizData?.questions && Array.isArray(item.quizData.questions)) {
        item.quizData.questions.forEach((q: any, idx: number) => {
          if (q.options && Array.isArray(q.options)) {
            for (const opt of q.options) {
              if ((opt.voters || []).some((v: any) => checkVoterMatch(v, userId, userName, userEmail))) {
                const optId = opt.id || opt.text;
                const right = checkIsOptionCorrect(optId, rawQuestions[idx] || q);
                initialRecovered[idx] = {
                  selectedId: optId,
                  isCorrect: right,
                  earnedPoints: PARTICIPATION_POINTS + (right ? CORRECT_OPTION_BONUS : 0),
                };
                break;
              }
            }
          }
        });
      }

      if (isMounted && Object.keys(initialRecovered).length > 0) {
        setDbAnswers((prev) => ({ ...prev, ...initialRecovered }));
      }

      // 2. Fetch latest voters list from backend API
      try {
        const res = await axios.get(`/api/engagements/${parentId}/voters`);
        if (!isMounted || !res.data?.success) return;

        const recovered: Record<number, { selectedId: string; isCorrect: boolean; earnedPoints?: number }> = {};
        const questionsData = res.data.questions || (res.data.options ? [{ options: res.data.options }] : []);

        rawQuestions.forEach((q, idx) => {
          const qData = questionsData.find((qd: any) => qd.questionId === q.id || qd.id === q.id) || questionsData[idx];
          const opts = qData?.options || [];

          for (const opt of opts) {
            const matchingVoter = (opt.voters || []).find((v: any) => checkVoterMatch(v, userId, userName, userEmail));
            if (matchingVoter) {
              const picked = matchingVoter.selectedOptionId || opt.id || opt.text;
              const right = checkIsOptionCorrect(picked, q);
              const points = PARTICIPATION_POINTS + (right ? CORRECT_OPTION_BONUS : 0);
              recovered[idx] = { selectedId: picked, isCorrect: right, earnedPoints: points };
              setStoredVote(quizAnswerKey(idx, q.id), parentId, recovered[idx], userId);
              setStoredVote(quizAnswerKey(idx, q.id), item.id, recovered[idx], userId);
              break;
            }
          }
        });

        // ── Populate per-question voter counts for all questions unconditionally ──
        const { questionVoters, allVoters: allQuizVoters } = extractVotersFromResponse(res.data);
        const counts: Record<string, number> = {};
        rawQuestions.forEach((q, idx) => {
          const qId = q.id || `q_${idx + 1}`;
          const qVoters = questionVoters[qId] || questionVoters[q.id] || [];
          counts[q.id] = qVoters.length;
        });
        if (Object.keys(counts).length > 0) {
          setQuestionVotersCount((prev) => ({ ...prev, ...counts }));
        }

        if (Object.keys(recovered).length > 0) {
          setDbAnswers((prev) => ({ ...prev, ...recovered }));

          // Mark this user as engaged locally so subsequent votes don't double-count
          hasEngagedRef.current = true;
          setStoredVote("quiz_engaged", item.id, true, userId);
          setStoredVote("quiz_engaged", parentId, true, userId);

          const totalRecCount = Object.keys(recovered).length;
          if (totalRecCount >= totalQuestions) {
            setQuizFinished(true);
          }
        }
      } catch { }

      // 3. Check vote status API
      if (totalQuestions === 1) {
        try {
          const status = await engagementService.checkVoteStatus(parentId, userId);
          if (!isMounted) return;
          if (status.hasVoted && status.selectedOptionId) {
            const right: boolean = Boolean(
              status.isCorrect !== null && status.isCorrect !== undefined
                ? status.isCorrect
                : checkIsOptionCorrect(status.selectedOptionId, rawQuestions[0])
            );
            const points = PARTICIPATION_POINTS + (right ? CORRECT_OPTION_BONUS : 0);
            setDbAnswers((prev) => {
              if (prev[0]) return prev;
              return {
                ...prev,
                0: { selectedId: status.selectedOptionId!, isCorrect: right, earnedPoints: points },
              };
            });
          }

        } catch { }
      }
    };

    hydrate().finally(() => {
      if (isMounted) setHydratingAnswers(false);
    });

    return () => {
      isMounted = false;
    };
  }, [item.id, userId, userName, userEmail, rawQuestions, totalQuestions, checkIsOptionCorrect, (item as any)._parentEngagementId, item.quizData]);

  // Keep total score & quiz finish synced when answers are recovered from DB
  useEffect(() => {
    const progress = calculateQuizProgress();
    if (progress.isFullyCompleted) {
      setQuizFinished(true);
    }
    if (progress.earnedScore > 0) {
      setTotalScore((prev) => Math.max(prev, progress.earnedScore));
    }
  }, [dbAnswers, calculateQuizProgress]);

  useEffect(() => {
    const ans = getEffectiveAnswer(currentQ, currentQIndex);

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
      const payload = { selectedId: item.userVote, isCorrect: isRight };
      setStoredVote(quizAnswerKey(currentQIndex, currentQ?.id), item.id, payload, userId);
    } else if (!hydratingAnswers) {
      // Only clear when the async voter fetch has finished and truly nothing was found
      setSelectedId(null);
      setAnswered(false);
      setIsCorrect(null);
    }
  }, [currentQIndex, currentQ, item.id, userId, totalQuestions, checkIsOptionCorrect, getEffectiveAnswer, item.userVoted, item.userVote, dbAnswers, hydratingAnswers]);

  const handleOptionSelect = async (optId: string) => {
    if (!userId || String(userId).toLowerCase().startsWith("anon")) {
      onToast("Please sign in to participate and earn SXPs!");
      return;
    }
    if (answered || isScheduled || isAnsweringRef.current) return;
    isAnsweringRef.current = true;
    const existing = getEffectiveAnswer(currentQ, currentQIndex);
    if (existing) {
      isAnsweringRef.current = false;
      return;
    }

    const isRight = checkIsOptionCorrect(optId, currentQ);
    const earnedPoints = PARTICIPATION_POINTS + (isRight ? CORRECT_OPTION_BONUS : 0);
    const answerPayload = { selectedId: optId, isCorrect: isRight, earnedPoints };

    setDbAnswers((prev) => ({ ...prev, [currentQIndex]: answerPayload }));
    setSelectedId(optId);
    setQuestionVotersCount((prev) => ({
      ...prev,
      [currentQ.id]: Math.max(1, (prev[currentQ.id] || 0) + 1),
    }));

    setAnswered(true);
    setIsCorrect(isRight);

    const isFirstQuizEngagement = !hasEngagedRef.current;
    hasEngagedRef.current = true;
    setStoredVote("quiz_engaged", item.id, true, userId);
    const nextCount = isFirstQuizEngagement ? totalEngaged + 1 : totalEngaged;
    setTotalEngaged(nextCount);
    if (totalQuestions === 1) onSyncEngagedCountRef.current?.(nextCount);

    const nextTotal = totalScore + earnedPoints;
    setTotalScore(nextTotal);

    setStoredVote(quizAnswerKey(currentQIndex, currentQ?.id), item.id, answerPayload, userId);
    if (totalQuestions === 1) {
      setStoredVote(`quiz`, item.id, answerPayload, userId);
    }

    const parentId = (item as any)._parentEngagementId || item.id;
    const subIdx = (item as any)._subQuestionIndex ?? currentQIndex;
    const subId = (item as any)._subQuestionId || currentQ?.id;
    if ((item as any)._parentEngagementId) {
      setStoredVote(quizAnswerKey(subIdx, subId), parentId, answerPayload, userId);
      setStoredVote("quiz_engaged", parentId, true, userId);
    }

    const currentAnsweredCount = rawQuestions.filter((q, idx) => {
      if (idx === currentQIndex) return true;
      return Boolean(getEffectiveAnswer(q, idx));
    }).length;

    const currentCorrectCount = rawQuestions.filter((q, idx) => {
      if (idx === currentQIndex) return isRight;
      return Boolean(getEffectiveAnswer(q, idx)?.isCorrect);
    }).length;

    const totalPossible = totalQuestions * (PARTICIPATION_POINTS + CORRECT_OPTION_BONUS);

    if (totalQuestions === 1 || currentAnsweredCount >= totalQuestions) {
      setQuizFinished(true);
      setStoredVote("quiz_finish", item.id, {
        finished: true,
        score: nextTotal,
        answeredCount: currentAnsweredCount,
        correctCount: currentCorrectCount,
        possibleScore: totalPossible,
      }, userId);
      setStoredVote("quiz_engaged", item.id, true, userId);

      const summaryMsg = `Quiz Completed! You scored ${nextTotal}/${totalPossible} SXPs (${currentCorrectCount}/${totalQuestions} correct). Check your rank on the Leaderboard!`;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf360:new-notification", {
            detail: {
              title: "FlipARENA",
              body: summaryMsg,
              ctaLabel: "View Leaderboard",
              ctaTarget: `/MainModules/FlipArena?itemId=${parentId}&type=quiz&tab=leaderboard`,
              type: "fliparena.quiz_completed",
            },
          })
        );
      }
    }

    try {
      const res: any = await engagementService.voteEngagement(
        parentId,
        optId,
        userId,
        subId,
        {
          isFirstQuizEngagement,
          questionIndex: subIdx,
          totalQuestions: (item as any)._parentEngagementId ? 1 : totalQuestions,
          userName,
          userAvatar,
          userEmail,
        }
      );
      const earned = Number(res?.pointsAwarded ?? earnedPoints);
      if (typeof window !== "undefined" && earned > 0) {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: earned } })
        );
      }
      if (totalQuestions === 1 && typeof res?.totalEngaged === "number") {
        setTotalEngaged(res.totalEngaged);
        onSyncEngagedCountRef.current?.(res.totalEngaged);
      }

      // ── BUG FIX D: after vote, re-fetch per-question voter count authoritatively
      axios
        .get(`/api/engagements/${parentId}/voters?questionId=${encodeURIComponent(currentQ.id)}`)
        .then((r) => {
          if (!r.data?.success) return;
          const { allVoters, questionVoters } = extractVotersFromResponse(r.data, currentQ.id, currentQIndex);

          if (totalQuestions === 1) {
            // single quiz: footer uses the parent count (registered voters only)
            if (allVoters.length > 0) onSyncEngagedCountRef.current?.(allVoters.length);
            return;
          }

          const n = (questionVoters[currentQ.id] || questionVoters[`q_${currentQIndex + 1}`] || []).length;
          setQuestionVotersCount((prev) => ({ ...prev, [currentQ.id]: Math.max(1, n) }));
        })
        .catch(() => { });
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
      const nextQ = rawQuestions[nextIdx];
      const ans = getEffectiveAnswer(nextQ, nextIdx);

      // Reset transient answered state BEFORE the index change so the
      // footer engaged count doesn't inherit the previous question's state.
      setSelectedId(ans?.selectedId ?? null);
      setAnswered(Boolean(ans));
      setIsCorrect(ans ? (ans.isCorrect ?? checkIsOptionCorrect(ans.selectedId, nextQ)) : null);

      setCurrentQIndex(nextIdx);
      const nextQId = nextQ?.id || `q_${nextIdx + 1}`;
      onQuestionChange?.(nextIdx, nextQId);
    } else {
      setQuizFinished(true);
      const p = calculateQuizProgress();
      setStoredVote("quiz_finish", item.id, { finished: true, score: totalScore, correctCount: p.correctCount, answeredCount: p.answeredCount }, userId);

      const currentAns = getEffectiveAnswer(currentQ, currentQIndex);
      if (currentAns) {
        setSelectedId(currentAns.selectedId);
        setAnswered(true);
        setIsCorrect(currentAns.isCorrect);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      const prevQ = rawQuestions[prevIdx];
      const ans = getEffectiveAnswer(prevQ, prevIdx);

      setSelectedId(ans?.selectedId ?? null);
      setAnswered(Boolean(ans));
      setIsCorrect(ans ? (ans.isCorrect !== undefined ? ans.isCorrect : checkIsOptionCorrect(ans.selectedId, prevQ)) : null);

      setCurrentQIndex(prevIdx);
      const prevQId = prevQ?.id || `q_${prevIdx + 1}`;
      onQuestionChange?.(prevIdx, prevQId);
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
    const targetId = (item as any)._parentEngagementId || item.id;
    if (!hasShared) {
      setHasShared(true);
      setSharesCount((prev) => prev + 1);
      if (typeof window !== "undefined") {
        localStorage.setItem(`sf_shared_${targetId}_${userId || "anon"}`, "true");
      }
      engagementService.shareEngagement(targetId)
        .then((res: any) => {
          if (res?.sharesCount !== undefined) {
            setSharesCount(Number(res.sharesCount));
          }
        })
        .catch(() => { });

    }

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

  const isMultiQuiz = totalQuestions > 1;
  const engagedDisplay = isMultiQuiz
    ? Math.max(answered ? 1 : 0, questionVotersCount[currentQ?.id] ?? 0, totalEngagedOverride ?? 0)
    : Math.max(
      hasAlreadyEngaged || answered || selectedId !== null ? 1 : 0,
      totalEngagedOverride !== undefined ? totalEngagedOverride : totalEngaged
    );

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

      {quizFinished && totalQuestions > 1 && (
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
            You scored <strong className="text-amber-400 font-extrabold">{totalScore}/{currentProgress.possibleScore} SXPs</strong> ({currentProgress.correctCount}/{totalQuestions} correct).</p>
        </motion.div>
      )}

      {totalQuestions > 1 && (
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full shrink-0">
            Q {currentQIndex + 1} of {totalQuestions}
          </span>
        </div>
      )}

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
              if (answered || quizFinished) {
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
                  disabled={answered || quizFinished}
                  className={`rounded-xl p-3 border font-bold text-xs text-left transition-all cursor-pointer flex items-center justify-between ${cardStyle}`}
                >
                  <span className="whitespace-normal pr-1">
                    <span className="text-white/40 mr-1.5 font-bold">{letter}.</span>
                    {opt.text}
                  </span>
                  {(answered || quizFinished) && isThisCorrect && <Check size={14} className="text-emerald-400 shrink-0" />}
                  {(answered || quizFinished) && isSelected && !isThisCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {(answered || quizFinished) && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-2">
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
            </motion.div>
          )}

          {/* Next & Previous Navigation for Multi-Question Quiz */}
          {totalQuestions > 1 && (
            <div className={`grid ${currentQIndex > 0 && currentQIndex < totalQuestions - 1 ? "grid-cols-2" : "grid-cols-1"} gap-2.5 w-full mt-2 mb-1`}>
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
          <span className="group-hover:underline">{engagedDisplay.toLocaleString()} engaged</span>
          <ChevronRight
            size={12}
            className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
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
  onSyncEngagedCount,
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
  onSyncEngagedCount?: (count: number) => void;
}) {
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
  const [hasShared, setHasShared] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(`sf_shared_${item.id}_${userId || "anon"}`));
  });

  const hasUserParticipated = Boolean(voted || selectedId !== null || item.userVoted || initialVote);
  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined
      ? totalEngagedOverride
      : (hasUserParticipated ? Math.max(1, Number(item.totalEngaged) || 0) : (Number(item.totalEngaged) || 0));
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
            detail: { points: CORRECT_OPTION_BONUS },
          })
        );
      }
      onToast(`🏆 Poll Ended! You won +${CORRECT_OPTION_BONUS} SXPs bonus for picking the correct answer!`);
    }
  }, [isExpired, userWon, serverIsCorrect, bonusAwarded, bonusClaimKey, onToast, userId]);

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
      const res: any = await engagementService.voteEngagement(item.id, optId, userId, undefined, { userName, userAvatar, userEmail });
      if (res?.options && Array.isArray(res.options)) {
        setOptions(res.options);
        setStoredVote("poll", item.id, { selectedId: optId, options: res.options }, userId);
      }
      if (res?.isCorrect !== undefined) {
        setServerIsCorrect(Boolean(res.isCorrect));
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
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
      const res = await engagementService.toggleLikeEngagement(item.id, userId, { userName, userAvatar, userEmail });
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    const targetId = (item as any)._parentEngagementId || item.id;
    if (!hasShared) {
      setHasShared(true);
      setSharesCount((prev) => prev + 1);
      if (typeof window !== "undefined") {
        localStorage.setItem(`sf_shared_${targetId}_${userId || "anon"}`, "true");
      }
      engagementService.shareEngagement(targetId)
        .then((res: any) => {
          if (res?.sharesCount !== undefined) {
            setSharesCount(Number(res.sharesCount));
          }
        })
        .catch(() => { });
    }

    const shareUrl = getEngagementShareUrl(item);
    const text = `📊 Poll: "${item.title}" — Cast your vote on SportsFan360:`;
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
      className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-emerald-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
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

      <p className="text-xs font-semibold text-white/80 mb-3.5 leading-relaxed">{item.title}</p>

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
                className={`w-full rounded-xl p-3 border text-left transition-all cursor-pointer relative overflow-hidden group ${borderStyle} ${voted || isExpired ? "cursor-default" : "hover:bg-white/[0.04] active:scale-[0.99]"
                  }`}
              >
                {(voted || isExpired) && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 ${isExpired && isWinner
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
                      className={`text-xs font-bold ${isExpired && isWinner
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
                  <span>Correct Option! You earned +10 SXPs Bonus (+12 SXPs Total)</span>
                </span>
                <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                  +10 SXPs
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-white/60">
                <span>
                  Poll ended {correctAnswer ? `· Winner: ` : ""}
                  {correctAnswer && <strong className="text-emerald-400">{correctAnswer}</strong>}
                </span>
                <span className="text-[10px] text-white/40 shrink-0">+2 SXPs participation</span>
              </div>
            )
          ) : (
            <div className="text-[11px] font-black text-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-center gap-1.5">
              <span>🔒</span>
              <span>Vote submitted · +2 SXPs earned!</span>
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
            className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
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
  onSyncEngagedCount,
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
  onSyncEngagedCount?: (count: number) => void;
}) {
  const pred = item.predictionData || {
    question: item.title || "Will India score > 350 runs?",
    category: "cricket",
    leftChoice: { text: "Yes (> 350)", multiplier: 2.1, votes: 310 },
    rightChoice: { text: "No (<= 350)", multiplier: 1.8, votes: 450 },
    coinStake: 25,
    timerMinutes: 10,
    startTime: Date.now(),
    expiresAt: Date.now() + 600000,
    winningTarget: "",
  };

  const initialVote = getStoredVote("pred", item.id, userId);
  const [selectedChoice, setSelectedChoice] = useState<"left" | "right" | null>(
    initialVote?.choice || (item.userVote as "left" | "right") || null
  );
  const [predicted, setPredicted] = useState<boolean>(Boolean(initialVote || item.userVoted));
  const [loading, setLoading] = useState(false);
  const isPredictingRef = useRef(false);

  const bonusClaimKey = `sf_pred_bonus_claimed_${item.id}_${userId || "anon"}`;
  const [bonusAwarded, setBonusAwarded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(bonusClaimKey) === "true";
  });
  const [serverIsCorrect, setServerIsCorrect] = useState<boolean | null>(null);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [hasShared, setHasShared] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(`sf_shared_${item.id}_${userId || "anon"}`));
  });

  const hasUserParticipated = Boolean(predicted || selectedChoice !== null || item.userVoted || initialVote);
  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined
      ? totalEngagedOverride
      : (hasUserParticipated ? Math.max(1, Number(item.totalEngaged) || 0) : (Number(item.totalEngaged) || 0));
  });

  useEffect(() => {
    if (totalEngagedOverride !== undefined) {
      setTotalEngaged(totalEngagedOverride);
    }
  }, [totalEngagedOverride]);

  const calcPredictionResult = useCallback(
    (
      choice: "left" | "right",
      overrideLeftPct?: number,
      overrideRightPct?: number
    ) => {
      const leftVotes = pred.leftChoice.votes || 0;
      const rightVotes = pred.rightChoice.votes || 0;
      const total = leftVotes + rightVotes + 1;
      const leftPct =
        overrideLeftPct !== undefined
          ? Math.round(overrideLeftPct)
          : Math.round(((leftVotes + (choice === "left" ? 1 : 0)) / total) * 100);
      const rightPct =
        overrideRightPct !== undefined ? Math.round(overrideRightPct) : 100 - leftPct;
      return {
        coinsLocked: pred.coinStake || 25,
        leftPercentage: leftPct,
        rightPercentage: rightPct,
      };
    },
    [pred.coinStake, pred.leftChoice.votes, pred.rightChoice.votes]
  );

  const [result, setResult] = useState<{
    coinsLocked: number;
    leftPercentage: number;
    rightPercentage: number;
  } | null>(() => {
    const c = initialVote?.choice || (item.userVote as "left" | "right");
    if (!c) return null;
    return calcPredictionResult(c, initialVote?.leftPercentage, initialVote?.rightPercentage);
  });

  const startTime = getEngagementStartTime(item);
  const isScheduled = startTime > now;
  const timeToStartMs = Math.max(0, startTime - now);

  const durationMins = Number(pred.timerMinutes || 10);
  const expiresAt = pred.expiresAt || (startTime + durationMins * 60 * 1000);
  const isExpired = now >= expiresAt;
  const timeRemainingMs = Math.max(0, expiresAt - now);

  const winningTarget = (pred as any).winningTarget || (pred as any).correctAnswer || "";

  const checkIsChoiceWinner = useCallback(
    (choice: "left" | "right" | null) => {
      if (!choice || !winningTarget) return false;
      const wt = winningTarget.trim().toLowerCase();
      if (wt === "left" && choice === "left") return true;
      if (wt === "right" && choice === "right") return true;
      const chosenText =
        choice === "left"
          ? pred.leftChoice.text.trim().toLowerCase()
          : pred.rightChoice.text.trim().toLowerCase();
      return wt === chosenText;
    },
    [winningTarget, pred.leftChoice.text, pred.rightChoice.text]
  );

  const userWon = useMemo(() => {
    return checkIsChoiceWinner(selectedChoice);
  }, [selectedChoice, checkIsChoiceWinner]);

  useEffect(() => {
    if (isExpired && (userWon || serverIsCorrect) && !bonusAwarded && userId) {
      setBonusAwarded(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(bonusClaimKey, "true");
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", {
            detail: { points: CORRECT_OPTION_BONUS },
          })
        );
      }
      onToast(`🏆 Prediction Ended! You won +${CORRECT_OPTION_BONUS} SXPs bonus for your correct prediction!`);
    }
  }, [isExpired, userWon, serverIsCorrect, bonusAwarded, bonusClaimKey, onToast, userId]);

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
      setResult(calcPredictionResult(stored.choice, stored.leftPercentage, stored.rightPercentage));
    }

    if (item.userVoted && item.userVote) {
      const choice = item.userVote as "left" | "right";
      setSelectedChoice(choice);
      setPredicted(true);
      setResult(calcPredictionResult(choice));
      setStoredVote("pred", item.id, { choice }, userId);
    } else if (userId) {
      engagementService.checkVoteStatus(item.id, userId).then((res) => {
        if (res.hasVoted && res.selectedOptionId) {
          const choice = res.selectedOptionId as "left" | "right";
          setSelectedChoice(choice);
          setPredicted(true);
          setResult(calcPredictionResult(choice));
          setStoredVote("pred", item.id, { choice }, userId);
        }
      });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, userId, calcPredictionResult]);

  const handlePredict = async (choice: "left" | "right") => {
    if (!userId || String(userId).toLowerCase().startsWith("anon")) {
      onToast("Please sign in to participate and earn SXPs!");
      return;
    }
    if (isScheduled) {
      onToast(`This prediction opens in ${formatCountdown(timeToStartMs)}!`);
      return;
    }
    if (isExpired) {
      onToast("This prediction has ended!");
      return;
    }
    if (predicted || loading || isPredictingRef.current || getStoredVote("pred", item.id, userId)) {
      onToast("You have already placed your prediction!");
      return;
    }

    isPredictingRef.current = true;
    setSelectedChoice(choice);
    setPredicted(true);
    setLoading(true);
    setStoredVote("pred", item.id, { choice, coinsLocked: pred.coinStake || 25 }, userId);
    const nextCount = Math.max(1, totalEngaged + 1);
    setTotalEngaged(nextCount);
    onSyncEngagedCount?.(nextCount);

    try {
      const res: any = await engagementService.voteEngagement(item.id, choice, userId, undefined, { userName, userAvatar, userEmail });
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
    const targetId = (item as any)._parentEngagementId || item.id;
    if (!hasShared) {
      setHasShared(true);
      setSharesCount((prev) => prev + 1);
      if (typeof window !== "undefined") {
        localStorage.setItem(`sf_shared_${targetId}_${userId || "anon"}`, "true");
      }
      engagementService.shareEngagement(targetId)
        .then((res: any) => {
          if (res?.sharesCount !== undefined) {
            setSharesCount(Number(res.sharesCount));
          }
        })
        .catch(() => { });
    }

    const shareUrl = getEngagementShareUrl(item);
    const text = `🎯 Prediction: "${pred.question || item.title}" — Make your pick on SportsFan360:`;
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
            className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
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
  onSyncEngagedCount,
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
  onSyncEngagedCount?: (count: number) => void;
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
  };

  const initialStored = getStoredVote("meme", item.id, currentUserId);
  const [selectedRating, setSelectedRating] = useState<MemeReactionType | null>(
    initialStored?.reaction || (item.userVote as MemeReactionType) || null
  );
  const [hasVoted, setHasVoted] = useState(Boolean(initialStored || item.userVoted));
  const [loadingVote, setLoadingVote] = useState(false);
  const [liked, setLiked] = useState(Boolean(item.userLiked));
  const [likesCount, setLikesCount] = useState<number>(Number(item.likes) || 0);
  const [sharesCount, setSharesCount] = useState<number>(Number(item.shares) || 0);
  const [hasShared, setHasShared] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(`sf_shared_${item.id}_${currentUserId || "anon"}`));
  });

  const hasUserParticipated = Boolean(hasVoted || selectedRating !== null || item.userVoted || initialStored);
  const [totalEngaged, setTotalEngaged] = useState<number>(() => {
    return totalEngagedOverride !== undefined
      ? totalEngagedOverride
      : (hasUserParticipated ? Math.max(1, Number(item.totalEngaged) || 0) : (Number(item.totalEngaged) || 0));
  });

  useEffect(() => {
    if (totalEngagedOverride !== undefined) {
      setTotalEngaged(totalEngagedOverride);
    }
  }, [totalEngagedOverride]);

  const [reactions, setReactions] = useState<{
    mild: number;
    funny: number;
    hot: number;
    fire: number;
    nuclear: number;
  }>({
    mild: Number(meme.reactions?.mild) || 0,
    funny: Number(meme.reactions?.funny) || 0,
    hot: Number(meme.reactions?.hot) || 0,
    fire: Number(meme.reactions?.fire) || 0,
    nuclear: Number(meme.reactions?.nuclear) || 0,
  });

  const totalHeatVotes =
    reactions.mild + reactions.funny + reactions.hot + reactions.fire + reactions.nuclear;

  const calculateHeatPct = useCallback(
    (r: typeof reactions) => {
      const sum = r.mild + r.funny + r.hot + r.fire + r.nuclear;
      if (sum === 0) return 0;
      const score = r.mild * 20 + r.funny * 40 + r.hot * 65 + r.fire * 85 + r.nuclear * 100;
      return Math.round(score / sum);
    },
    []
  );

  const [heatPercentage, setHeatPercentage] = useState<number>(
    meme.heatPercentage || calculateHeatPct(reactions)
  );

  useEffect(() => {
    if (item.userLiked) {
      setLiked(true);
    } else if (currentUserId) {
      engagementService.checkLikeStatus(item.id, currentUserId).then((isLiked) => {
        if (isLiked) setLiked(true);
      });
    }

    const stored = getStoredVote("meme", item.id, currentUserId);
    if (stored?.reaction) {
      setSelectedRating(stored.reaction);
      setHasVoted(true);
    } else if (item.userVoted && item.userVote) {
      setSelectedRating(item.userVote as MemeReactionType);
      setHasVoted(true);
      setStoredVote("meme", item.id, { reaction: item.userVote }, currentUserId);
    } else if (currentUserId) {
      engagementService.checkVoteStatus(item.id, currentUserId).then((res) => {
        if (res.hasVoted && res.selectedOptionId) {
          setSelectedRating(res.selectedOptionId as MemeReactionType);
          setHasVoted(true);
          setStoredVote("meme", item.id, { reaction: res.selectedOptionId }, currentUserId);
        }
      });
    }
  }, [item.id, item.userLiked, item.userVoted, item.userVote, currentUserId]);

  const handleSelectRating = (tier: MemeReactionType) => {
    if (hasVoted) return;
    setSelectedRating(tier);
  };

  const handleSubmitVote = async () => {
    if (!currentUserId || String(currentUserId).toLowerCase().startsWith("anon")) {
      onToast("Please sign in to vote and earn SXPs!");
      return;
    }
    if (!selectedRating || hasVoted || loadingVote) return;

    setLoadingVote(true);
    setHasVoted(true);
    setStoredVote("meme", item.id, { reaction: selectedRating }, currentUserId);
    const nextCount = Math.max(1, totalEngaged + 1);
    setTotalEngaged(nextCount);
    onSyncEngagedCount?.(nextCount);

    const nextReactions = {
      ...reactions,
      [selectedRating]: (reactions[selectedRating] || 0) + 1,
    };
    setReactions(nextReactions);
    const nextHeat = calculateHeatPct(nextReactions);
    setHeatPercentage(nextHeat);

    try {
      const res: any = await engagementService.voteEngagement(
        item.id,
        selectedRating,
        currentUserId,
        undefined,
        {
          userName: currentUserName,
          userAvatar,
          userEmail: currentUserEmail,
        }
      );
      if (res?.reactions) {
        setReactions(res.reactions);
        setHeatPercentage(res.heatPercentage || calculateHeatPct(res.reactions));
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sf360:points-updated", { detail: { points: PARTICIPATION_POINTS } })
        );
      }
    } catch {
    } finally {
      setLoadingVote(false);
    }
  };

  const handleLike = async () => {
    const nextLiked = !liked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await engagementService.toggleLikeEngagement(item.id, currentUserId, {
        userName: currentUserName,
        userAvatar,
        userEmail: currentUserEmail,
      });
      if (res?.likesCount !== undefined) {
        setLikesCount(res.likesCount);
        setLiked(res.liked);
      }
    } catch { }
  };

  const handleShare = async () => {
    const targetId = (item as any)._parentEngagementId || item.id;
    if (!hasShared) {
      setHasShared(true);
      setSharesCount((prev) => prev + 1);
      if (typeof window !== "undefined") {
        localStorage.setItem(`sf_shared_${targetId}_${currentUserId || "anon"}`, "true");
      }
      engagementService.shareEngagement(targetId)
        .then((res: any) => {
          if (res?.sharesCount !== undefined) {
            setSharesCount(Number(res.sharesCount));
          }
        })
        .catch(() => { });
    }

    const shareUrl = getEngagementShareUrl(item);
    const text = `🔥 Meme: "${meme.caption}" — Rate the matchday heat on SportsFan360:`;
    if (navigator.share) {
      navigator.share({ title: item.title || "Matchday Meme", text: `${text} ${shareUrl}`, url: shareUrl }).catch(() => { });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      onToast("Meme link copied to clipboard! 📋");
    }
  };


  const formattedTime = formatEngagementPostingTime(item);

  const RATING_TIERS: Array<{
    id: MemeReactionType;
    label: string;
    flameColor: string;
    bgHover: string;
    activeBorder: string;
  }> = [
      { id: "mild", label: "Mild", flameColor: "text-slate-400", bgHover: "hover:bg-slate-500/10", activeBorder: "border-slate-400 bg-slate-500/20" },
      { id: "funny", label: "Funny", flameColor: "text-pink-400", bgHover: "hover:bg-pink-500/10", activeBorder: "border-pink-500 bg-pink-500/20" },
      { id: "hot", label: "Hot", flameColor: "text-amber-400", bgHover: "hover:bg-amber-500/10", activeBorder: "border-amber-500 bg-amber-500/20" },
      { id: "fire", label: "Fire", flameColor: "text-orange-500", bgHover: "hover:bg-orange-500/10", activeBorder: "border-orange-500 bg-orange-500/20" },
      { id: "nuclear", label: "Nuclear", flameColor: "text-fuchsia-400", bgHover: "hover:bg-fuchsia-500/10", activeBorder: "border-fuchsia-500 bg-fuchsia-500/20" },
    ];

  return (
    <motion.div
      id={`engagement-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`w-full max-w-lg mx-auto bg-[#0e111a] border-l-2 border-orange-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl relative transition-all duration-300 ${isHighlighted
        ? "ring-2 ring-orange-500 shadow-[0_0_35px_rgba(249,115,22,0.35)] scale-[1.01]"
        : ""
        }`}
    >
      {isHighlighted && (
        <div className="mb-3 -mt-1 py-1 px-2.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-500/40 text-[10px] font-black text-orange-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-orange-400 animate-pulse" />
            <span>SHARED MEME</span>
          </span>
          <span className="text-[9px] text-white/50 font-mono">Opened via link</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
        <div className="flex items-center gap-1.5 uppercase">
          <span className="text-orange-400 flex items-center gap-1">
            <Flame size={11} className="text-orange-400" />
            <span>MEME</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Caption */}
      <p className="text-xs font-semibold text-white/90 mb-3 leading-relaxed">
        {meme.caption}
      </p>

      {/* Meme Image */}
      <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-white/[0.08] mb-3 relative group">
        <img
          src={meme.imageUrl}
          alt={meme.caption || "Meme"}
          className="w-full h-auto max-h-[360px] object-cover mx-auto"
          onError={(e: any) => {
            e.target.src = "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80";
          }}
        />
      </div>

      {/* Dynamic Heat Gauge Meter */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-purple-500/10 border border-orange-500/20 mb-3">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="flex items-center gap-1.5 text-orange-400 font-black">
            <Flame size={14} className="animate-pulse" />
            <span>Heat Meter</span>
          </span>
          <span className="font-mono font-black text-amber-300 text-xs">
            {heatPercentage}% Heat ({totalHeatVotes} {totalHeatVotes === 1 ? "vote" : "votes"})
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${heatPercentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
          />
        </div>
      </div>

      {/* 5-Flame Rating Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-white/50 px-1">
          <span>{hasVoted ? "Your locked rating:" : "Rate how funny/hot this is:"}</span>
          <span className="text-orange-400 font-mono">+2 SXPs participation</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {RATING_TIERS.map((tier) => {
            const isSelected = selectedRating === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => handleSelectRating(tier.id)}
                disabled={hasVoted}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${isSelected
                  ? tier.activeBorder + " shadow-md"
                  : "border-white/[0.06] bg-white/[0.02] " + tier.bgHover
                  } ${hasVoted ? "cursor-default opacity-80" : "active:scale-95"}`}
              >
                <Flame size={16} className={`${tier.flameColor} ${isSelected ? "animate-bounce" : ""}`} fill={isSelected ? "currentColor" : "none"} />
                <span className="text-[10px] font-black text-white/90 mt-1">{tier.label}</span>
                {hasVoted && (
                  <span className="text-[9px] font-mono text-white/40 mt-0.5">
                    {reactions[tier.id] || 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubmitVote}
          disabled={!selectedRating || hasVoted || loadingVote}
          className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${hasVoted
            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 cursor-default"
            : selectedRating
              ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 active:scale-98 cursor-pointer"
              : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
            }`}
        >
          {hasVoted ? (
            <>
              <Check size={14} />
              <span>Rating Locked · +2 SXPs Earned</span>
            </>
          ) : !selectedRating ? (
            <span>Select a rating above</span>
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
            className={`text-[#FF8A00] transition-transform duration-200 ${isEngagedExpanded ? "rotate-90 opacity-100" : "opacity-75 group-hover:opacity-100"
              }`}
          />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Engaged Users Dialog Modal ──────────────────────────────────────────────
function EngagedUsersInlineList({
  item,
  questionId,
  questionIndex,
  onSyncCount,
  onClose,
}: {
  item: EngagementItem | null;
  questionId?: string;
  questionIndex?: number;
  onSyncCount?: (count: number) => void;
  onClose?: () => void;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [votersList, setVotersList] = useState<NormalizedVoter[]>([]);
  const [userAvatarMap, setUserAvatarMap] = useState<Map<string, string>>(new Map());
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!item) return;

    setLoading(true);
    setPage(1);
    const parentId = (item as any)._parentEngagementId || item.id;
    const targetQId = (item as any)._subQuestionId || questionId;
    const qParam = targetQId ? `?questionId=${encodeURIComponent(targetQId)}` : "";

    axios
      .get(`/api/engagements/${parentId}/voters${qParam}`)
      .then((res) => {
        if (res.data?.success) {
          const { allVoters: extractedOverall, questionVoters } = extractVotersFromResponse(res.data, targetQId, questionIndex);
          const isMulti = (item.quizData?.questions?.length || 1) > 1;

          let targetList = extractedOverall;
          if (item.type === "quiz" && isMulti) {
            const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
            const matchedKey = targetQId
              ? Object.keys(questionVoters).find((k) => norm(k) === norm(targetQId))
              : undefined;
            targetList = matchedKey ? questionVoters[matchedKey] : [];
          }
          setVotersList(targetList);
        }
      })
      .catch((err) => {
        console.warn("Failed to load voters:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [item?.id, (item as any)?._parentEngagementId, questionId, questionIndex]);

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
        add(u.uid, img);
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
  }, [item?.id]);

  // Check if current user has voted on this item
  const currentUserVoted = useMemo(() => {
    if (!user || !item) return false;
    const uid = user.userId || (user as any)?.actualUserId || user.email;
    if (!uid || String(uid).toLowerCase().startsWith("anon")) return false;

    const parentId = (item as any)._parentEngagementId || item.id;
    const subIdx = (item as any)._subQuestionIndex ?? questionIndex ?? 0;
    const qId = (item as any)._subQuestionId || questionId || item.quizData?.questions?.[subIdx]?.id || `q_${subIdx + 1}`;

    const totalQuestions = item.quizData?.questions?.length || 1;

    if (item.type === "quiz") {
      if (totalQuestions > 1) {
        return Boolean(
          getStoredVote(quizAnswerKey(subIdx, qId), item.id, uid) ||
          getStoredVote(quizAnswerKey(subIdx, qId), parentId, uid)
        );
      }
      return Boolean(
        getStoredVote(quizAnswerKey(subIdx, qId), item.id, uid) ||
        getStoredVote("quiz", item.id, uid) ||
        getStoredVote("quiz_engaged", item.id, uid)
      );
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

  // Combined deduplicated list of registered voters
  const allVoters = useMemo(() => {
    const uniqueMap = new Map<string, NormalizedVoter>();
    votersList.forEach((v) => {
      const key = (v.userId || v.userEmail || v.userName).toLowerCase().replace(/^user#/i, "").trim();
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, v);
      }
    });

    if (currentUserVoted && user) {
      const uid = String(user.userId || (user as any)?.actualUserId || user.email || "").trim().toLowerCase().replace(/^user#/i, "");
      const uemail = String(user.email || (user as any)?.userEmail || "").trim().toLowerCase();
      const uname = String(user.name || (user as any)?.userName || "").trim().toLowerCase();

      let alreadyIn = false;
      if (uid && uniqueMap.has(uid)) alreadyIn = true;
      if (!alreadyIn && uemail && uniqueMap.has(uemail)) alreadyIn = true;
      if (!alreadyIn && uname && uniqueMap.has(uname)) alreadyIn = true;
      if (!alreadyIn) {
        for (const existing of uniqueMap.values()) {
          const eId = (existing.userId || "").toLowerCase().replace(/^user#/i, "");
          const eEmail = (existing.userEmail || "").toLowerCase();
          const eName = (existing.userName || "").toLowerCase();
          if ((uid && eId === uid) || (uemail && eEmail === uemail) || (uemail && eId === uemail) || (uname && eName === uname)) {
            alreadyIn = true;
            break;
          }
        }
      }

      if (!alreadyIn && (uid || uemail)) {
        const myName = user.name || (user as any)?.userName || (user.email ? user.email.split("@")[0] : "You");
        const myAvatar = (user as any)?.avatarUrl || user.photoURL || (user as any)?.picture || (user as any)?.avatar || null;
        uniqueMap.set(uid || uemail, {
          userId: user.userId || (user as any)?.actualUserId || uid || uemail,
          userName: myName,
          userAvatar: myAvatar,
          userEmail: user.email || "",
          selectedOptionId: "",
          optionId: "",
          optionText: "",
          votedAt: Date.now(),
        });
      }
    }

    return Array.from(uniqueMap.values());
  }, [votersList, currentUserVoted, user]);

  const finalVotersCount = allVoters.length;

  const onSyncCountRef = useRef(onSyncCount);
  useEffect(() => {
    onSyncCountRef.current = onSyncCount;
  }, [onSyncCount]);

  useEffect(() => {
    if (!loading) {
      onSyncCountRef.current?.(finalVotersCount);
    }
  }, [finalVotersCount, loading]);

  if (!item) return null;

  // Resolve the freshest avatar for a voter
  const resolveAvatar = (voter: NormalizedVoter): string => {
    const vId = String(voter.userId || "").toLowerCase().replace(/^user#/i, "");
    const vEmail = String(voter.userEmail || "").toLowerCase();
    const isMe =
      (user?.userId && vId === String(user.userId).toLowerCase().replace(/^user#/i, "")) ||
      ((user as any)?.actualUserId && vId === String((user as any).actualUserId).toLowerCase().replace(/^user#/i, "")) ||
      (user?.email && (vId === user.email.toLowerCase() || vEmail === user.email.toLowerCase()));

    if (isMe && typeof window !== "undefined") {
      const local = localStorage.getItem("roar_avatar_url");
      if (local && !local.includes("dicebear.com")) return local;
    }
    if (voter.userAvatar && !voter.userAvatar.includes("dicebear.com")) return voter.userAvatar;

    const candidates = [
      voter.userId,
      vId,
      voter.userName,
      voter.userEmail,
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

  const totalQuestions = item.quizData?.questions?.length || 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full max-w-lg mx-auto bg-gradient-to-b from-[#24131c]/90 to-[#0d111c]/95 rounded-2xl overflow-hidden mt-2 mb-2 border border-white/10 shadow-2xl relative"
      >
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/[0.04]">
          <h3 className="text-xs font-bold text-white/80 flex items-center gap-1.5">
            <span>Engaged Fans</span>
            {item.type === "quiz" && totalQuestions > 1 && (
              <span className="text-[9px] text-[#FF8A00] font-extrabold bg-[#FF8A00]/15 px-1.5 py-0.5 rounded-full border border-[#FF8A00]/30">
                Q{((item as any)._subQuestionIndex ?? questionIndex ?? 0) + 1}/{totalQuestions}
              </span>
            )}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-white/50 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/[0.08]"
              title="Close list"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Voters List Body */}
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
                const rawName = voter.userName || (voter.userEmail ? voter.userEmail.split("@")[0] : "Fan");
                const displayName = rawName.includes("_gmail_com")
                  ? rawName.replace(/_gmail_com/gi, "")
                  : rawName.includes("@")
                    ? rawName.split("@")[0]
                    : rawName;

                return (
                  <div
                    key={`${voter.userId}-${idx}`}
                    onClick={() => {
                      if (voter.userId) {
                        window.location.href = `/MainModules/Profile?userId=${encodeURIComponent(
                          voter.userId
                        )}`;
                      }
                    }}
                    className="py-1.5 border-b border-white/[0.04] flex items-center justify-between gap-3 transition-all cursor-pointer group last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
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

                      <div className="min-w-0 flex-1 flex items-center gap-2 overflow-hidden">
                        <h4 className="text-[12px] font-semibold text-white/90 group-hover:text-amber-400 transition-colors truncate leading-tight">
                          {displayName}
                        </h4>
                      </div>
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

        {onClose && (
          <div className="p-2 border-t border-white/[0.04] bg-white/[0.02] flex items-center justify-center">
            <button
              onClick={onClose}
              className="py-1.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-white/70 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/[0.08] active:scale-95 shadow-sm"
            >
              <ChevronUp size={13} className="text-[#FF8A00]" />
              <span>Close</span>
            </button>
          </div>
        )}
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const toggleMoreMenu = () => {
    if (!showMoreMenu && moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      const left = Math.max(12, Math.min(window.innerWidth - 170, rect.left));
      setDropdownPos({
        top: rect.bottom + 6,
        left,
      });
      setShowMoreMenu(true);
    } else {
      setShowMoreMenu(false);
    }
  };

  useEffect(() => {
    if (!showMoreMenu) return;
    const handleReposition = () => {
      if (moreButtonRef.current) {
        const rect = moreButtonRef.current.getBoundingClientRect();
        const left = Math.max(12, Math.min(window.innerWidth - 170, rect.left));
        setDropdownPos({
          top: rect.bottom + 6,
          left,
        });
      }
    };
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [showMoreMenu]);

  const arenaPrimaryChips = ARENA_FILTER_CHIPS.slice(0, 3); // All, Quiz, Poll
  const arenaExtraChips = ARENA_FILTER_CHIPS.slice(3); // Battle, Prediction, Meme

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

        // Pre-fetch accurate registered voter counts for all loaded items on feed load
        liveItems.forEach((it) => {
          axios
            .get(`/api/engagements/${it.id}/voters`)
            .then((votersRes) => {
              if (votersRes.data?.success) {
                const { allVoters: extractedVoters, questionVoters } = extractVotersFromResponse(votersRes.data);

                // Sync each question count if multi-question quiz
                Object.entries(questionVoters).forEach(([qKey, qVoters]) => {
                  handleSyncEngagedCount(`${it.id}_${qKey}`, qVoters.length);
                });

                // Overall count: use extracted unique voters if > 0, otherwise maintain existing totalEngaged

                handleSyncEngagedCount(it.id, extractedVoters.length);
              }
            })
            .catch(() => { });
        });
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
  }, [selectedSport, activeUserId, handleSyncEngagedCount]);

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
    const targetId = (item as any)._parentEngagementId || item.id;
    if (!confirm(`Are you sure you want to delete this ${label} "${item.title || item.subtitle || "Untitled"}"?`)) {
      return;
    }
    try {
      await engagementService.deleteEngagement(targetId);
      setEngagements((prev) => prev.filter((it) => it.id !== targetId));
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
      const typeLabel =
        savedItem.type === "quiz"
          ? "Quiz Question"
          : savedItem.type === "poll"
            ? "Poll"
            : savedItem.type === "prediction"
              ? "Prediction"
              : savedItem.type === "fan_battle"
                ? "Fan Battle"
                : "Meme";
      showToast(`${typeLabel} Created Successfully! +${PARTICIPATION_POINTS} SXPs earned 🚀`);
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

  // Filter and sort arena engagements
  const filteredEngagements = useMemo(() => {
    return engagements
      .filter((item) => {
        if (!item || !item.title || !item.type) return false;

        // Always include the highlighted shared item even if filter differs
        if (
          highlightedItemId &&
          (item.id === highlightedItemId || (item as any)._parentEngagementId === highlightedItemId)
        ) {
          return true;
        }

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
          if (a.id === highlightedItemId || (a as any)._parentEngagementId === highlightedItemId) return -1;
          if (b.id === highlightedItemId || (b as any)._parentEngagementId === highlightedItemId) return 1;
        }

        return getEngagementPostingTime(b) - getEngagementPostingTime(a);
      });
  }, [engagements, filter, highlightedItemId]);

  return (
    <div className="w-full bg-[#070b14] min-h-screen text-white flex flex-col font-sans pb-16 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100005] bg-gradient-to-r from-[#161e2e] via-[#1a2234] to-[#161e2e] border-2 border-emerald-500/50 text-white text-xs font-black px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex items-center gap-2.5 backdrop-blur-xl pointer-events-none"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 size={14} />
            </div>
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
        <div className="px-3 sm:px-4 mb-3 sm:mb-4 mt-3 sm:mt-4">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* FlipLINE Tab */}
            <button
              onClick={() => (window.location.href = "/MainModules/FlipLine")}
              className="relative py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#111418] border border-[#2A2F36] active:scale-[0.99] overflow-hidden"
            >
              <Zap size={18} className="text-[#9AA3AF]" />
              <span className="text-[13.5px] sm:text-[15px] tracking-wide font-bold text-[#9AA3AF]">
                FlipLINE
              </span>
            </button>

            {/* FlipARENA Tab */}
            <button
              className="relative py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#111418] border border-[#2A2F36] active:scale-[0.99] overflow-hidden"
            >
              <Target size={18} className="text-[#FF2D8A]" />
              <span className="text-[13.5px] sm:text-[15px] tracking-wide font-black text-[#FFFFFF]">
                FlipARENA
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF2D8A]" />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between border-t border-white/[0.05] mt-2 gap-3 md:gap-2">
        <div className="flex items-center justify-between gap-2 w-full md:w-auto">
          <div>
            <h2 className="text-base font-black tracking-tight">Today's Arena</h2>
            <p className="text-[10px] text-white/35 mt-0.5">Earn +2 SXPs participation · +10 SXPs for correct answers</p>
          </div>

          {/* Mobile Leaderboard Button (opposite title) */}
          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-400 hover:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            title="Open Leaderboards"
          >
            <Trophy size={13} className="text-amber-400" />
            <span>Leaderboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          {/* Desktop Leaderboard Button */}
          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-400 hover:text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            title="Open Leaderboards"
          >
            <Trophy size={13} className="text-amber-400" />
            <span>Leaderboard</span>
          </button>
          <div
            className="flex items-center gap-1.5 bg-[#111418] p-1 rounded-xl border border-[#2A2F36] overflow-x-auto no-scrollbar w-full md:w-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Mobile & Desktop: Primary Chips (All, Quiz, Poll) */}
            {arenaPrimaryChips.map((chip) => {
              const isSelected = filter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilter(chip.id)}
                  className="relative px-3 py-1.5 rounded-lg bg-[#111418] border border-[#2A2F36] flex items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shrink-0 overflow-hidden"
                  style={{
                    borderColor: isSelected ? "#2A2F36" : "#2A2F36",
                  }}
                >
                  {chip.isHash ? (
                    <span className="text-[#FF2D8A] font-black text-sm">#</span>
                  ) : (
                    <span className="text-xs">{chip.emoji}</span>
                  )}
                  <span
                    className="transition-colors"
                    style={{
                      color: isSelected ? "#FFFFFF" : "#E4E8EE",
                      fontWeight: isSelected ? 800 : 600,
                    }}
                  >
                    {chip.label}
                  </span>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF2D8A]" />
                  )}
                </button>
              );
            })}

            {/* Desktop Only: Remaining chips (Battle, Prediction, Meme) */}
            {arenaExtraChips.map((chip) => {
              const isSelected = filter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilter(chip.id)}
                  className="hidden md:flex relative px-3 py-1.5 rounded-lg bg-[#111418] border border-[#2A2F36] items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shrink-0 overflow-hidden"
                  style={{
                    borderColor: isSelected ? "#2A2F36" : "#2A2F36",
                  }}
                >
                  <span className="text-xs">{chip.emoji}</span>
                  <span
                    className="transition-colors"
                    style={{
                      color: isSelected ? "#FFFFFF" : "#E4E8EE",
                      fontWeight: isSelected ? 800 : 600,
                    }}
                  >
                    {chip.label}
                  </span>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF2D8A]" />
                  )}
                </button>
              );
            })}

            {/* Mobile Only: More Dropdown Button */}
            <div className="flex md:hidden relative shrink-0">
              <button
                ref={moreButtonRef}
                onClick={toggleMoreMenu}
                className="relative px-3 py-1.5 rounded-lg bg-[#111418] border border-[#2A2F36] flex items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer overflow-hidden"
                style={{
                  borderColor: arenaExtraChips.some((c) => c.id === filter) ? "#2A2F36" : "#2A2F36",
                }}
              >
                <LayoutGrid size={13} className="text-[#9AA3AF]" />
                <span
                  style={{
                    color: arenaExtraChips.some((c) => c.id === filter) ? "#FFFFFF" : "#E4E8EE",
                    fontWeight: arenaExtraChips.some((c) => c.id === filter) ? 800 : 600,
                  }}
                >
                  {arenaExtraChips.find((c) => c.id === filter)?.label || "More"}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-[#9AA3AF] transition-transform duration-200 ${showMoreMenu ? "rotate-180" : ""}`}
                />
                {arenaExtraChips.some((c) => c.id === filter) && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF2D8A]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Dropdown Menu for More Options (Rendered outside scroll container to prevent clipping) */}
      <AnimatePresence>
        {showMoreMenu && dropdownPos && (
          <>
            {/* Backdrop to close when clicking outside */}
            <div
              className="fixed inset-0 z-[99998] bg-transparent"
              onClick={() => setShowMoreMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "fixed",
                top: `${dropdownPos.top}px`,
                left: `${dropdownPos.left}px`,
                zIndex: 99999,
              }}
              className="min-w-[155px] p-1.5 rounded-xl bg-[#15181D] border border-[#2A2F36] shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex flex-col gap-1 backdrop-blur-xl"
            >
              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#9AA3AF]">
                More Formats
              </div>
              {arenaExtraChips.map((chip) => {
                const isSelected = filter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setFilter(chip.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-[#111418] text-white border border-[#FF2D8A]/50 shadow-sm"
                        : "text-[#E4E8EE] hover:bg-[#111418] hover:text-white"
                    }`}
                  >
                    <span className="text-sm">{chip.emoji}</span>
                    <span className="flex-1">{chip.label}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D8A]" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                const isItemHighlighted = Boolean(highlightedItemId && (item.id === highlightedItemId || (item as any)._parentEngagementId === highlightedItemId));
                const isMultiQuiz = item.type === "quiz" && (item.quizData?.questions?.length || 1) > 1;


                // Determine the correct Card Component
                let CardComponent: React.ComponentType<any> | null = null;
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
                      totalEngagedOverride={
                        isMultiQuiz
                          ? (quizActiveQuestion[item.id]?.id
                            ? syncedEngagedCounts[`${item.id}_${quizActiveQuestion[item.id].id}`]
                            : undefined)
                          : syncedEngagedCounts[item.id]
                      }
                      onQuestionChange={item.type === "quiz" ? (index: number, qId: string) => handleQuizQuestionChange(item.id, index, qId) : undefined}
                      onOpenLeaderboard={() => setShowLeaderboardModal(true)}
                      onSyncEngagedCount={isMultiQuiz ? undefined : (count: number) => {
                        const activeQId = quizActiveQuestion[item.id]?.id;
                        if (item.type === "quiz" && activeQId) {
                          handleSyncEngagedCount(`${item.id}_${activeQId}`, count);
                        } else {
                          handleSyncEngagedCount(item.id, count);
                        }
                        if ((item as any)._parentEngagementId) {
                          handleSyncEngagedCount((item as any)._parentEngagementId, count);
                        }
                      }}
                    />

                    {/* Inline Engaged Users List */}
                    {engagedModalItem?.id === item.id && (
                      <EngagedUsersInlineList
                        item={engagedModalItem}
                        questionId={(engagedModalItem as any)._subQuestionId || quizActiveQuestion[item.id]?.id}
                        questionIndex={(engagedModalItem as any)._subQuestionIndex ?? quizActiveQuestion[item.id]?.index}
                        onSyncCount={isMultiQuiz ? undefined : (count: number) => {
                          const activeQId = (engagedModalItem as any)._subQuestionId || quizActiveQuestion[item.id]?.id;
                          if (engagedModalItem?.type === "quiz" && activeQId) {
                            handleSyncEngagedCount(`${item.id}_${activeQId}`, count);
                          } else {
                            handleSyncEngagedCount(item.id, count);
                          }
                        }}
                        onClose={() => setEngagedModalItem(null)}
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
    </div>
  );
}