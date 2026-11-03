
// "use client";

// import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     Heart,
//     Share2,
//     MessageSquare,
//     CheckCircle2,
//     XCircle,
//     Flame,
//     Zap,
//     Trophy,
//     Users,
//     Clock,
//     Sparkles,
//     Coins,
//     ChevronDown,
//     ChevronUp,
// } from "lucide-react";
// import axios from "axios";
// import type { EngagementItem } from "@/types/engagements";
// import { useUserProfile } from "@/context/UserProfileContext";
// import EngagementCommentsThread from "./EngagementCommentsThread";

// export interface EngagementCardProps {
//     item: EngagementItem;
//     onInteraction?: (data?: any) => void;
//     className?: string;
//     compact?: boolean;
//     variant?: "post" | "card";
// }

// function timeAgo(ts?: number | string): string {
//     if (!ts) return "now";
//     const date = typeof ts === "number" ? ts : new Date(ts).getTime();
//     if (isNaN(date)) return "now";
//     const diff = Math.max(0, Date.now() - date);
//     if (diff < 60000) return "now";
//     if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
//     if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
//     return `${Math.floor(diff / 86400000)}d`;
// }

// export function useRunningCountdown(
//     timerMinutes?: number,
//     createdAt?: number | string,
//     expiresAt?: number | null
// ) {
//     const [timeLeft, setTimeLeft] = useState<string>("00:00");

//     useEffect(() => {
//         const calculate = () => {
//             const now = Date.now();
//             let remainingMs = 0;

//             if (expiresAt && Number(expiresAt) > 0) {
//                 const exp = Number(expiresAt) > 1e11 ? Number(expiresAt) : Number(expiresAt) * 1000;
//                 remainingMs = Math.max(0, exp - now);
//             } else if (createdAt) {
//                 const start = typeof createdAt === "number" ? createdAt : new Date(createdAt).getTime();
//                 const durationMs = (timerMinutes || 4) * 60 * 1000;
//                 const end = start + durationMs;
//                 remainingMs = Math.max(0, end - now);
//             } else {
//                 remainingMs = (timerMinutes || 4) * 60 * 1000;
//             }

//             if (remainingMs <= 0) {
//                 setTimeLeft("Expired");
//                 return;
//             }

//             const totalSec = Math.floor(remainingMs / 1000);
//             const m = Math.floor(totalSec / 60);
//             const s = totalSec % 60;
//             setTimeLeft(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
//         };

//         calculate();
//         const interval = setInterval(calculate, 1000);
//         return () => clearInterval(interval);
//     }, [timerMinutes, createdAt, expiresAt]);

//     return timeLeft;
// }

// export default function EngagementCard({
//     item,
//     onInteraction,
//     className = "",
//     compact = false,
//     variant = "post",
// }: EngagementCardProps) {
//     const { userProfile } = useUserProfile();
//     const currentUserId = userProfile?.actualUserId || userProfile?.email || "fan_guest";
//     const currentUserName = userProfile?.username || userProfile?.name || "Fan";
//     const currentUserAvatar = userProfile?.avatarUrl || userProfile?.avatar || "";

//     // ── Local State & Storage Keys ──
//     const voteKey = `sf_vote_${item.id}`;
//     const likeKey = `sf_like_${item.id}`;

//     const [userVoted, setUserVoted] = useState<boolean>(() => {
//         if (item.userVoted) return true;
//         if (typeof window !== "undefined") {
//             try {
//                 return Boolean(localStorage.getItem(voteKey));
//             } catch {
//                 return false;
//             }
//         }
//         return false;
//     });

//     const [selectedOptionId, setSelectedOptionId] = useState<string | null>(() => {
//         if (item.userVote) return item.userVote;
//         if (typeof window !== "undefined") {
//             try {
//                 return localStorage.getItem(voteKey);
//             } catch {
//                 return null;
//             }
//         }
//         return null;
//     });

//     const [isVoting, setIsVoting] = useState(false);

//     // Likes state with localStorage persistence
//     const [likes, setLikes] = useState<number>(Number(item.likes) || 0);
//     const likeLockRef = useRef(0); // timestamp of last local toggle
//     const [isLiked, setIsLiked] = useState<boolean>(() => {
//         if (item.userLiked) return true;
//         if (typeof window !== "undefined") {
//             try { return localStorage.getItem(likeKey) === "true"; } catch { return false; }
//         }
//         return false;
//     });

//     // Shares state
//     const [shares, setShares] = useState<number>(Number(item.shares) || 0);
//     const [shareCopied, setShareCopied] = useState(false);
//     const shareKey = `sf_share_${item.id}_${currentUserId}`;
//     const [hasShared, setHasShared] = useState<boolean>(() => {
//         if (Array.isArray((item as any).sharedUsers) && (item as any).sharedUsers.includes(currentUserId)) return true;
//         if (typeof window !== "undefined") {
//             try { return localStorage.getItem(shareKey) === "true"; } catch { return false; }
//         }
//         return false;
//     });
//     // Comments count state
//     const [showComments, setShowComments] = useState(false);
//     const [commentsCount, setCommentsCount] = useState<number>(() => {
//         return Number(item.commentsCount ?? item.memeData?.commentsCount ?? 0);
//     });

//     // Total Engaged (Participation count) state
//     const [totalEngaged, setTotalEngaged] = useState<number>(() => {
//         return Number(item.totalEngaged) || 0;
//     });

//     // Dynamic Votes calculation cache
//     const [liveVoteData, setLiveVoteData] = useState<any>(null);

//     // Live Running Timer (ticks every second)
//     const runningTimer = useRunningCountdown(item.timerMinutes, item.createdAt, item.expiresAt);

//     // Sync with item prop changes
//     useEffect(() => {
//         const likeLocked = Date.now() - likeLockRef.current < 15000; // ignore stale poll right after a toggle
//         if (!likeLocked) {
//             if (item.likes !== undefined) setLikes(Number(item.likes) || 0);
//             if (item.userLiked) setIsLiked(true);
//         }
//         if (item.shares !== undefined) setShares(Number(item.shares) || 0);
//         if (item.totalEngaged !== undefined) setTotalEngaged(Number(item.totalEngaged) || 0);
//         if (item.commentsCount !== undefined) setCommentsCount(prev => Math.max(prev, Number(item.commentsCount) || 0));
//         if (item.userVote) {
//             setSelectedOptionId(item.userVote);
//             setUserVoted(true);
//         }
//     }, [item.likes, item.shares, item.totalEngaged, item.commentsCount, item.userLiked, item.userVote]);


//     // Hydrate real like state + count from server (source of truth)
//     useEffect(() => {
//         let cancelled = false;
//         axios
//             .get(`/api/engagements/${encodeURIComponent(item.id)}/like`, {
//                 params: { userId: currentUserId, matchId: item.matchId },
//                 timeout: 6000,
//             })
//             .then((res) => {
//                 if (cancelled) return;
//                 if (typeof res.data?.liked === "boolean") {
//                     setIsLiked(res.data.liked);
//                     try { localStorage.setItem(likeKey, String(res.data.liked)); } catch { }
//                 }
//                 if (res.data?.likes !== undefined) setLikes(Number(res.data.likes) || 0);
//             })
//             .catch(() => { });
//         return () => { cancelled = true; };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [item.id, currentUserId]);

//     // Load comment count without opening the thread
//     useEffect(() => {
//         let cancelled = false;
//         axios
//             .get(`/api/engagements/${encodeURIComponent(item.id)}/comments`, {
//                 params: { countOnly: 1, matchId: item.matchId },
//                 timeout: 6000,
//             })
//             .then((res) => {
//                 if (!cancelled && typeof res.data?.commentsCount === "number") {
//                     setCommentsCount(res.data.commentsCount);
//                 }
//             })
//             .catch(() => { });
//         return () => { cancelled = true; };
//     }, [item.id, item.matchId]);

//     // ── Type Theme Info ──
//   const theme = useMemo(() => {
//     switch (item.type) {
//         case "prediction":
//             return { label: "PREDICTION", icon: "🎯", badgeBg: "bg-amber-500/20 text-amber-400 border border-amber-500/40", accent: "#fbbf24" };
//         case "debate":
//             return { label: "DEBATE", icon: "⚖️", badgeBg: "bg-blue-500/20 text-blue-400 border border-blue-500/40", accent: "#60a5fa" };
//         case "poll":
//             return { label: "POLL", icon: "📊", badgeBg: "bg-blue-500/20 text-blue-400 border border-blue-500/40", accent: "#60a5fa" };
//         case "express":
//             return { label: "EXPRESS", icon: "⚡", badgeBg: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40", accent: "#22d3ee" };
//         case "question":
//             return { label: "QUESTION", icon: "❓", badgeBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40", accent: "#22c55e" };
//         case "quiz":
//             return { label: "QUIZ", icon: "🧠", badgeBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40", accent: "#22c55e" };
//         case "fan_battle":
//             return { label: "BATTLE", icon: "⚔️", badgeBg: "bg-rose-500/20 text-rose-400 border border-rose-500/40", accent: "#e91e8c" };
//         default:
//             return { label: "MATCH MOMENT", icon: "🔥", badgeBg: "bg-orange-500/20 text-orange-400 border border-orange-500/40", accent: "#ff6b35" };
//     }
// }, [item.type]);

//     // ── Submit Vote / Participation ──
//     const handleVote = async (optionId: string) => {
//         if (userVoted || isVoting) return;

//         setIsVoting(true);
//         setSelectedOptionId(optionId);
//         setUserVoted(true);
//         setTotalEngaged(prev => prev + 1);

//         try {
//             localStorage.setItem(voteKey, optionId);
//         } catch {
//             // ignore
//         }

//         try {
//             const res = await axios.post(
//                 `/api/engagements/${encodeURIComponent(item.id)}/vote`,
//                 {
//                     selectedOptionId: optionId,
//                     userId: currentUserId,
//                     userName: currentUserName,
//                     userAvatar: currentUserAvatar,
//                     matchId: item.matchId,
//                 },
//                 { timeout: 8000 }
//             );

//             if (res.data) {
//                 setLiveVoteData(res.data);
//                 if (res.data.totalEngaged !== undefined) {
//                     setTotalEngaged(Number(res.data.totalEngaged) || 0);
//                 }
//             }

//             if (typeof window !== "undefined") {
//                 window.dispatchEvent(new CustomEvent("sf360:points-updated", { detail: { points: 2 } }));
//             }

//             onInteraction?.({
//                 userVoted: true,
//                 userVote: optionId,
//                 totalEngaged: (totalEngaged || 0) + 1,
//                 ...(res.data || {}),
//             });
//         } catch (err) {
//             console.warn("Notice submitting vote:", err);
//             onInteraction?.({
//                 userVoted: true,
//                 userVote: optionId,
//                 totalEngaged: (totalEngaged || 0) + 1,
//             });
//         } finally {
//             setIsVoting(false);
//         }
//     };

//     // ── Toggle Like ──
//     const handleToggleLike = async () => {
//         const prev = { isLiked, likes, totalEngaged };
//         const nextLiked = !isLiked;
//         const delta = nextLiked ? 1 : -1;

//         likeLockRef.current = Date.now();
//         setIsLiked(nextLiked);
//         setLikes(l => Math.max(0, l + delta));
//         setTotalEngaged(t => Math.max(0, t + delta));
//         try { localStorage.setItem(likeKey, String(nextLiked)); } catch { }

//         try {
//             const res = await axios.post(
//                 `/api/engagements/${encodeURIComponent(item.id)}/like`,
//                 { userId: currentUserId, matchId: item.matchId },
//                 { timeout: 8000 }
//             );
//             const L = Number(res.data?.likes);
//             const T = Number(res.data?.totalEngaged);
//             const liked = Boolean(res.data?.liked);
//             likeLockRef.current = Date.now();
//             if (!isNaN(L)) setLikes(L);
//             if (!isNaN(T)) setTotalEngaged(T);
//             setIsLiked(liked);
//             try { localStorage.setItem(likeKey, String(liked)); } catch { }
//             onInteraction?.({
//                 likes: isNaN(L) ? undefined : L,
//                 userLiked: liked,
//                 totalEngaged: isNaN(T) ? undefined : T,
//             });
//         } catch (err) {
//             console.warn("Like failed, reverting:", err);
//             setIsLiked(prev.isLiked);
//             setLikes(prev.likes);
//             setTotalEngaged(prev.totalEngaged);
//             try { localStorage.setItem(likeKey, String(prev.isLiked)); } catch { }
//         }
//     };

//     // ── Share Engagement ──
//     const handleShare = async () => {
//         const shareUrl = typeof window !== "undefined"
//             ? `${window.location.origin}${window.location.pathname}?engagement=${item.id}` : "";
//         const shareTitle = item.title || "Check out this live match moment on SportsFan360!";
//         let didShare = false;

//         if (typeof navigator !== "undefined" && navigator.share) {
//             try {
//                 await navigator.share({ title: shareTitle, text: item.subtitle || shareTitle, url: shareUrl });
//                 didShare = true;
//             } catch { /* user cancelled */ }
//         } else if (typeof navigator !== "undefined" && navigator.clipboard) {
//             try {
//                 await navigator.clipboard.writeText(shareUrl);
//                 didShare = true;
//                 setShareCopied(true);
//                 setTimeout(() => setShareCopied(false), 2200);
//             } catch { /* ignore */ }
//         }

//         // Count only once per user, and only if they actually shared
//         if (!didShare || hasShared) return;

//         setHasShared(true);
//         try { localStorage.setItem(shareKey, "true"); } catch { }
//         setShares(s => s + 1);
//         setTotalEngaged(t => t + 1);

//         try {
//             const res = await axios.post(
//                 `/api/engagements/${encodeURIComponent(item.id)}/share`,
//                 { userId: currentUserId, matchId: item.matchId },
//                 { timeout: 8000 }
//             );
//             const s = Number(res.data?.shares);
//             const t = Number(res.data?.totalEngaged);
//             if (!isNaN(s)) setShares(s);          // server is the source of truth
//             if (!isNaN(t)) setTotalEngaged(t);
//             onInteraction?.({ shares: isNaN(s) ? undefined : s, totalEngaged: isNaN(t) ? undefined : t });
//         } catch (err) {
//             console.warn("Notice logging share:", err);
//         }
//     };

//     // ─────────────────────────────────────────────────────────────
//     // RENDER: Prediction Body
//     // ─────────────────────────────────────────────────────────────
//   const renderPrediction = () => {
//     const pred: any = item.predictionData;

//     const baseOptions: any[] =
//         liveVoteData?.options ||
//         (pred?.options?.length ? pred.options : null) ||
//         (item.options?.length ? item.options : null) ||
//         [
//             pred?.leftChoice || { id: "left", text: "Team A", votes: 0 },
//             pred?.rightChoice || { id: "right", text: "Team B", votes: 0 },
//         ];

//     // Optimistic +1 for the user's pick until the server responds
//     const options = baseOptions.map((opt: any) => {
//         let votes = Number(opt.votes || 0);
//         if (!liveVoteData && selectedOptionId && String(opt.id) === String(selectedOptionId)) votes += 1;
//         return { ...opt, votes };
//     });

//     const total = options.reduce((s: number, o: any) => s + o.votes, 0);
//     const pctOf = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
//     const chosen = options.find((o: any) => String(o.id) === String(selectedOptionId));

//     return (
//         <div className="flex flex-col gap-1.5 mt-1">
//             {!userVoted ? (
//                 <div className="grid grid-cols-2 gap-2 mt-0.5">
//                     {options.map((opt: any) => (
//                         <button
//                             key={opt.id}
//                             type="button"
//                             disabled={isVoting}
//                             onClick={() => handleVote(String(opt.id))}
//                             className="p-2.5 rounded-lg bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/50 transition-all text-left group"
//                         >
//                             <span className="block text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
//                                 {opt.text || opt.label}
//                             </span>
//                             <span className="text-[9px] text-white/50 block mt-0.5">Predict This</span>
//                         </button>
//                     ))}
//                 </div>
//             ) : (
//                 <div className="flex flex-col gap-1.5 mt-0.5">
//                     {options.map((opt: any) => {
//                         const isChosen = String(opt.id) === String(selectedOptionId);
//                         const pct = pctOf(opt.votes);
//                         return (
//                             <div
//                                 key={opt.id}
//                                 className={`relative w-full rounded-lg overflow-hidden p-2 border transition-all ${isChosen ? "border-amber-400/60 bg-amber-500/10" : "border-white/5 bg-white/5"}`}
//                             >
//                                 <motion.div
//                                     initial={{ width: 0 }}
//                                     animate={{ width: `${pct}%` }}
//                                     transition={{ duration: 0.5, ease: "easeOut" }}
//                                     className={`absolute inset-y-0 left-0 ${isChosen ? "bg-amber-500/25" : "bg-white/10"}`}
//                                 />
//                                 <div className="relative flex items-center justify-between text-xs">
//                                     <span className={`font-medium flex items-center gap-1.5 ${isChosen ? "text-amber-300 font-bold" : "text-white"}`}>
//                                         {isChosen && <CheckCircle2 size={12} className="text-amber-400 shrink-0" />}
//                                         {opt.text || opt.label}
//                                     </span>
//                                     <span className="text-[11px] font-bold text-white/80 shrink-0 ml-2">{pct}%</span>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                     <div className="flex justify-between items-center text-[9px] text-white/50">
//                         <span>Your pick: <strong className="text-white">{chosen?.text || chosen?.label}</strong></span>
//                         <span>{total} total predictions</span>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };
//     // ─────────────────────────────────────────────────────────────
//     // RENDER: Poll / Debate / Express Body
//     // ─────────────────────────────────────────────────────────────

//     const renderPoll = () => {
//         const rawOptions =
//             liveVoteData?.options ||
//             item.pollData?.options ||
//             item.debateData?.options ||
//             item.expressData?.options ||
//             item.questionData?.options ||
//             item.options ||
//             [
//                 { id: "opt_1", text: "Option A", votes: 0 },
//                 { id: "opt_2", text: "Option B", votes: 0 },
//             ];

//         // Optimistically calculate votes including user's current pick
//         const displayOptions = rawOptions.map((opt: any) => {
//             let votes = Number(opt.votes || 0);
//             if (!liveVoteData && selectedOptionId && (opt.id === selectedOptionId || opt.text === selectedOptionId)) {
//                 votes += 1;
//             }
//             return { ...opt, votes };
//         });



//         const totalVotes = displayOptions.reduce((sum: number, o: any) => sum + (Number(o.votes) || 0), 0);

//         return (
//             <div className="flex flex-col gap-1.5 mt-1">
//                 <div className="flex flex-col gap-1.5">
//                     {displayOptions.map((opt: any) => {
//                         const optVotes = Number(opt.votes) || 0;
//                         const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
//                         const isChosen = selectedOptionId === opt.id || selectedOptionId === opt.text;

//                         if (!userVoted) {
//                             return (
//                                 <button
//                                     key={opt.id || opt.text}
//                                     type="button"
//                                     disabled={isVoting}
//                                     onClick={() => handleVote(opt.id || opt.text)}
//                                     className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 transition-all text-left flex items-center justify-between group"
//                                 >
//                                     <span className="text-xs text-white group-hover:text-blue-400 font-medium transition-colors">
//                                         {opt.text || opt.label}
//                                     </span>
//                                     <span className="text-[9px] text-white/40 group-hover:text-white/70">Vote</span>
//                                 </button>
//                             );
//                         }

//                         return (
//                             <div
//                                 key={opt.id || opt.text}
//                                 className={`relative w-full rounded-lg overflow-hidden p-2 border transition-all ${isChosen ? "border-blue-400/60 bg-blue-500/10" : "border-white/5 bg-white/5"
//                                     }`}
//                             >
//                                 <motion.div
//                                     initial={{ width: 0 }}
//                                     animate={{ width: `${pct}%` }}
//                                     transition={{ duration: 0.5, ease: "easeOut" }}
//                                     className={`absolute inset-y-0 left-0 ${isChosen ? "bg-blue-500/25" : "bg-white/10"
//                                         }`}
//                                 />
//                                 <div className="relative flex items-center justify-between text-xs">
//                                     <span className={`font-medium flex items-center gap-1.5 ${isChosen ? "text-blue-300 font-bold" : "text-white"}`}>
//                                         {isChosen && <CheckCircle2 size={12} className="text-blue-400 shrink-0" />}
//                                         {opt.text || opt.label}
//                                     </span>
//                                     <span className="text-[11px] font-bold text-white/80 shrink-0 ml-2">{pct}%</span>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//                 {userVoted && (
//                     <div className="text-[9px] text-white/40 text-right mt-0.5">
//                         {totalVotes} total votes
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     // ─────────────────────────────────────────────────────────────
//     // RENDER: Quiz / Trivia Body
//     // ─────────────────────────────────────────────────────────────
//     const renderQuiz = () => {
//         const quiz: any = item.quizData || item.questionData;
//     const options: any[] =
//         quiz?.options?.length ? quiz.options :
//         item.options?.length ? item.options :
//         [{ id: "A", text: "Answer Option A" }, { id: "B", text: "Answer Option B" }];
//     const correctId = String(quiz?.correctOptionId ?? options[0]?.id ?? "A");

//         return (
//             <div className="flex flex-col gap-1.5 mt-1">
//                 {/* {quiz?.pointsReward && (
//                     <div className="text-[9px] font-bold text-emerald-400 mb-0.5">
//                         ⭐ +{quiz.pointsReward} SXPs Reward
//                     </div>
//                 )} */}

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
//                     {options.map((opt: any) => {
//                         const isChosen = selectedOptionId === opt.id;
//                         const isCorrectAnswer = opt.id === correctId;

//                         let btnStyle = "bg-white/5 border-white/10 text-white hover:bg-white/10";
//                         if (userVoted) {
//                             if (isCorrectAnswer) {
//                                 btnStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold";
//                             } else if (isChosen) {
//                                 btnStyle = "bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold";
//                             } else {
//                                 btnStyle = "bg-white/5 border-white/5 text-white/40";
//                             }
//                         }

//                         return (
//                             <button
//                                 key={opt.id}
//                                 type="button"
//                                 disabled={userVoted || isVoting}
//                                 onClick={() => handleVote(opt.id)}
//                                 className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
//                             >
//                                 <span>{opt.text}</span>
//                                 {userVoted && isCorrectAnswer && <CheckCircle2 size={13} className="text-emerald-400" />}
//                                 {userVoted && isChosen && !isCorrectAnswer && <XCircle size={13} className="text-rose-400" />}
//                             </button>
//                         );
//                     })}
//                 </div>

//                 {userVoted && quiz?.explanation && (
//                     <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/70 leading-relaxed mt-1">
//                         <strong className="text-emerald-400">Explanation: </strong>
//                         {quiz.explanation}
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     // ─────────────────────────────────────────────────────────────
//     // RENDER: Fan Battle Body
//     // ─────────────────────────────────────────────────────────────
//     const renderFanBattle = () => {
//         const battle = item.fanBattleData;
//         const left = battle?.leftCompetitor || { code: "P1", name: "Player 1", stat: "Form 8.4", votes: 0, imageUrl: "" };
//         const right = battle?.rightCompetitor || { code: "P2", name: "Player 2", stat: "Form 7.9", votes: 0, imageUrl: "" };

//         const rawLeftVotes = Number(liveVoteData?.leftVotes ?? battle?.leftCompetitor?.votes ?? 0);
//         const rawRightVotes = Number(liveVoteData?.rightVotes ?? battle?.rightCompetitor?.votes ?? 0);

//         const leftVotes = rawLeftVotes + (!liveVoteData && selectedOptionId === "left" ? 1 : 0);
//         const rightVotes = rawRightVotes + (!liveVoteData && selectedOptionId === "right" ? 1 : 0);

//         const total = leftVotes + rightVotes;
//         const leftPct =
//             liveVoteData?.leftPercentage !== undefined
//                 ? Math.round(liveVoteData.leftPercentage)
//                 : (total > 0 ? Math.round((leftVotes / total) * 100) : 50);
//         const rightPct = 100 - leftPct;

//         return (
//             <div className="flex flex-col gap-2 mt-1">
//                 <div className="grid grid-cols-2 gap-2 relative">
//                     {/* Left Competitor */}
//                     <div className={`p-2.5 rounded-lg border text-center transition-all ${selectedOptionId === "left" ? "bg-rose-500/15 border-rose-500/60" : "bg-white/5 border-white/10"
//                         }`}>
//                         <div className="w-10 h-10 mx-auto rounded-full overflow-hidden bg-white/10 mb-1 border border-white/20">
//                             {left.imageUrl ? (
//                                 <img src={left.imageUrl} alt={left.name} className="w-full h-full object-cover" />
//                             ) : (
//                                 <div className="w-full h-full flex items-center justify-center font-black text-rose-400 bg-rose-500/10 text-xs">
//                                     {(left?.name || "P1").slice(0, 2).toUpperCase()}
//                                 </div>
//                             )}
//                         </div>
//                         <h4 className="text-[11px] font-bold text-white truncate">{left.name}</h4>
//                         <p className="text-[9px] text-white/50">{left.stat}</p>

//                         {!userVoted ? (
//                             <button
//                                 type="button"
//                                 disabled={isVoting}
//                                 onClick={() => handleVote("left")}
//                                 className="w-full mt-1.5 py-1 px-2 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-[10px] transition-colors"
//                             >
//                                 Back {left.name.split(" ")[0]}
//                             </button>
//                         ) : (
//                             <span className="block mt-1 text-[11px] font-black text-rose-400">{leftPct}%</span>
//                         )}
//                     </div>

//                     {/* VS Badge */}
//                     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-center text-[8px] font-black text-white shadow-lg pointer-events-none z-10">
//                         VS
//                     </div>

//                     {/* Right Competitor */}
//                     <div className={`p-2.5 rounded-lg border text-center transition-all ${selectedOptionId === "right" ? "bg-amber-500/15 border-amber-500/60" : "bg-white/5 border-white/10"
//                         }`}>
//                         <div className="w-10 h-10 mx-auto rounded-full overflow-hidden bg-white/10 mb-1 border border-white/20">
//                             {right.imageUrl ? (
//                                 <img src={right.imageUrl} alt={right.name} className="w-full h-full object-cover" />
//                             ) : (
//                                 <div className="w-full h-full flex items-center justify-center font-black text-amber-400 bg-amber-500/10 text-xs">
//                                     {(right?.name || "P2").slice(0, 2).toUpperCase()}
//                                 </div>
//                             )}
//                         </div>
//                         <h4 className="text-[11px] font-bold text-white truncate">{right.name}</h4>
//                         <p className="text-[9px] text-white/50">{right.stat}</p>

//                         {!userVoted ? (
//                             <button
//                                 type="button"
//                                 disabled={isVoting}
//                                 onClick={() => handleVote("right")}
//                                 className="w-full mt-1.5 py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white font-bold text-xs transition-colors"
//                             >
//                                 Back {right.name.split(" ")[0]}
//                             </button>
//                         ) : (
//                             <span className="block mt-1 text-[11px] font-black text-amber-400">{rightPct}%</span>
//                         )}
//                     </div>
//                 </div>

//                 {userVoted && (
//                     <div className="flex flex-col gap-1">
//                         <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
//                             <motion.div
//                                 initial={{ width: 0 }}
//                                 animate={{ width: `${leftPct}%` }}
//                                 transition={{ duration: 0.5 }}
//                                 className="h-full bg-rose-500"
//                             />
//                             <motion.div
//                                 initial={{ width: 0 }}
//                                 animate={{ width: `${rightPct}%` }}
//                                 transition={{ duration: 0.5 }}
//                                 className="h-full bg-amber-400"
//                             />
//                         </div>
//                         <div className="text-[9px] text-white/40 text-center">{total} votes</div>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     // ─────────────────────────────────────────────────────────────
//     // RENDER: Generic Meme / Drop Body
//     // ─────────────────────────────────────────────────────────────
//     const renderMeme = () => {
//         const meme = item.memeData;
//         return (
//             <div className="flex flex-col gap-1.5 mt-1">
//                 {meme?.imageUrl && (
//                     <div className="rounded-lg overflow-hidden max-h-52 bg-black/40 border border-white/10">
//                         <img src={meme.imageUrl} alt={item.title} className="w-full h-full object-contain" />
//                     </div>
//                 )}
//                 {meme?.caption && (
//                     <p className="text-xs text-white/80 leading-relaxed">{meme.caption}</p>
//                 )}
//             </div>
//         );
//     };

//     // ─────────────────────────────────────────────────────────────
//     // VARIANT: "post" (Matches regular room discussion posts seamlessly)
//     // ─────────────────────────────────────────────────────────────
//     if (variant === "post") {
//         return (
//             <motion.div
//                 initial={{ opacity: 0, y: 8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.2 }}
//                 className={`w-full ${className}`}
//                 style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
//             >
//                 {/* ── Post Header ── */}
//                 <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, minWidth: 0 }}>
//                     <div style={{ flexShrink: 0 }}>
//                         <img
//                             src={item.creatorAvatar || "/images/sportsfan360logo.png"}
//                             alt={item.creatorName || "SportsFan360"}
//                             className="w-6 h-6 rounded-full object-contain border border-white/10 bg-black/40"
//                             onError={(e) => {
//                                 (e.currentTarget as HTMLImageElement).src = "/images/sportsfan360logo.png";
//                             }}
//                         />
//                     </div>

//                     <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
//                         <span style={{ fontWeight: 700, fontSize: 10, color: "#fff", whiteSpace: "nowrap" }}>
//                             {item.creatorName || "SportsFan360"}
//                         </span>
//                         <span style={{ fontSize: 8, color: "rgba(255,255,255,0.48)", whiteSpace: "nowrap" }}>
//                             {timeAgo(item.createdAt)}
//                         </span>
//                         <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded ${theme.badgeBg}`}>
//                             {theme.label}
//                         </span>

//                         {/* Running Timer */}
//                         <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex items-center gap-1 ml-auto">
//                             <Clock size={10} className="text-amber-400" />
//                             <span>{runningTimer} remaining</span>
//                         </span>
//                     </div>
//                 </div>

//                 {/* ── Post Content / Title ── */}
//                 <p className="leading-snug text-white font-medium my-1" style={{ fontSize: 10 }}>
//                     {item.title}
//                 </p>
//                 {item.subtitle && item.subtitle !== item.title && (
//                     <p className="text-[10px] text-white/60 mb-2 leading-relaxed">
//                         {item.subtitle}
//                     </p>
//                 )}

//                 {/* ── Interactive Options ── */}
//                 <div className="my-1.5">
//                     {item.type === "prediction" && renderPrediction()}
//                     {(item.type === "debate" || item.type === "poll" || item.type === "express") && renderPoll()}
//                     {(item.type === "quiz" || item.type === "question") && renderQuiz()}
//                     {item.type === "fan_battle" && renderFanBattle()}
//                     {item.type === "meme" && renderMeme()}
//                 </div>

//                 {/* ── Action Bar (Comments, Likes, Shares, Fans Engaged) ── */}
//                 <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 5, alignItems: "center" }}>
//                     {/* Live Like */}
//                     <button
//                         type="button"
//                         onClick={handleToggleLike}
//                         className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${isLiked ? "text-[#e91e8c]" : "text-[#9494ad] hover:text-white"
//                             }`}
//                         title="Like this moment"
//                     >
//                         <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
//                         <span style={{ fontSize: 10 }}>{likes}</span>
//                     </button>

//                     {/* Comments Toggle Button */}
//                     <button
//                         type="button"
//                         onClick={() => setShowComments(prev => !prev)}
//                         className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${showComments ? "text-[#e91e8c]" : "text-[#9494ad] hover:text-white"
//                             }`}
//                         title="View comments"
//                     >
//                         <MessageSquare size={12} />
//                         <span style={{ fontSize: 10 }}>Comments ({commentsCount})</span>
//                         {showComments ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
//                     </button>

//                     {/* Native Share */}
//                     <button
//                         type="button"
//                         onClick={handleShare}
//                         className="flex items-center gap-1 text-[11px] text-[#9494ad] hover:text-white transition-colors relative"
//                         title="Share"
//                     >
//                         <Share2 size={12} />
//                         <span style={{ fontSize: 10 }}>{shares}</span>
//                         {shareCopied && (
//                             <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[9px] text-white whitespace-nowrap shadow-md pointer-events-none">
//                                 Copied!
//                             </span>
//                         )}
//                     </button>

//                     {/* Fans Engaged indicator */}
//                     {/* <div className="ml-auto flex items-center gap-1 text-[9px] text-white/40">
//                         <Users size={10} />
//                         <span>{totalEngaged} fans</span>
//                     </div> */}
//                 </div>

//                 {/* ── Inline Comments Thread ── */}
//                 <AnimatePresence>
//                     {showComments && (
//                         <motion.div
//                             initial={{ opacity: 0, height: 0 }}
//                             animate={{ opacity: 1, height: "auto" }}
//                             exit={{ opacity: 0, height: 0 }}
//                             transition={{ duration: 0.2 }}
//                             className="overflow-hidden"
//                         >
//                             <EngagementCommentsThread
//                                 engagementId={item.id}
//                                 matchId={item.matchId}
//                                 accentColor={theme.accent}
//                                 onCommentCountChange={(cnt: number) => {
//                                     setCommentsCount(cnt);
//                                     onInteraction?.({ commentsCount: cnt });
//                                 }}
//                             />
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//             </motion.div>
//         );
//     }

//     // ─────────────────────────────────────────────────────────────
//     // VARIANT: "card" (Used in top Hero Loop Banner)
//     // ─────────────────────────────────────────────────────────────
//     return (
//         <div
//             className={`rounded-2xl bg-gradient-to-b from-[#181822]/95 to-[#101016]/98 border border-white/10 p-3 shadow-xl hover:border-white/20 transition-all ${className}`}
//         >
//             {/* ── CARD HEADER ── */}
//             <div className="flex items-center justify-between gap-2">
//                 <div className="flex items-center gap-1.5 flex-wrap">
//                     <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
//                         {theme.icon} {theme.label}
//                     </span>
//                     <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
//                         <Clock size={10} className="text-amber-400" />
//                         <span>{runningTimer} remaining</span>
//                     </span>
//                 </div>
//                 {item.sport && (
//                     <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
//                         {item.sport}
//                     </span>
//                 )}
//             </div>

//             {/* ── TITLE ── */}
//             <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
//                 {item.title}
//             </h3>
//             {item.subtitle && item.subtitle !== item.title && (
//                 <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{item.subtitle}</p>
//             )}

//             {/* ── INTERACTIVE BODY ── */}
//             {item.type === "prediction" && renderPrediction()}
//             {(item.type === "debate" || item.type === "poll" || item.type === "express") && renderPoll()}
//             {(item.type === "quiz" || item.type === "question") && renderQuiz()}
//             {item.type === "fan_battle" && renderFanBattle()}
//             {item.type === "meme" && renderMeme()}

//             {/* ── CARD FOOTER ACTIONS ── */}
//             <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/5 text-xs text-white/60">
//                 <div className="flex items-center gap-3">
//                     {/* Live Like Button */}
//                     <button
//                         type="button"
//                         onClick={handleToggleLike}
//                         className={`flex items-center gap-1 transition-all ${isLiked ? "text-[#e91e8c] font-bold scale-105" : "hover:text-white"
//                             }`}
//                         title="Like this moment"
//                     >
//                         <Heart size={13} fill={isLiked ? "currentColor" : "none"} />
//                         <span>{likes}</span>
//                     </button>

//                     {/* Comments Button */}
//                     <button
//                         type="button"
//                         onClick={() => setShowComments(prev => !prev)}
//                         className={`flex items-center gap-1 transition-colors ${showComments ? "text-[#e91e8c] font-bold" : "hover:text-white"
//                             }`}
//                         title="View comments"
//                     >
//                         <MessageSquare size={13} />
//                         <span>Comments ({commentsCount})</span>
//                         {showComments ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
//                     </button>

//                     {/* Native Share Button */}
//                     <button
//                         type="button"
//                         onClick={handleShare}
//                         className="flex items-center gap-1 hover:text-white transition-colors relative"
//                         title="Share with friends"
//                     >
//                         <Share2 size={13} />
//                         <span>{shares}</span>
//                         {shareCopied && (
//                             <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[9px] text-white whitespace-nowrap shadow-md pointer-events-none">
//                                 Copied!
//                             </span>
//                         )}
//                     </button>
//                 </div>

//                 {/* Total Engaged indicator */}
//                 {/* <div className="flex items-center gap-1 text-[10px] text-white/40">
//                     <Users size={11} />
//                     <span>{totalEngaged} fans</span>
//                 </div> */}
//             </div>

//             {/* ── INLINE COMMENTS SECTION ── */}
//             <AnimatePresence>
//                 {showComments && (
//                     <motion.div
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: "auto" }}
//                         exit={{ opacity: 0, height: 0 }}
//                         transition={{ duration: 0.2 }}
//                         className="overflow-hidden"
//                     >
//                         <EngagementCommentsThread
//                             engagementId={item.id}
//                             matchId={item.matchId}
//                             accentColor={theme.accent}
//                             onCommentCountChange={(cnt: number) => {
//                                 setCommentsCount(cnt);
//                                 onInteraction?.({ commentsCount: cnt });
//                             }}
//                         />
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// }


"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    Share2,
    MessageSquare,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    Lock,
    Pencil,
} from "lucide-react";
import axios from "axios";
import type { EngagementItem } from "@/types/engagements";
import { useUserProfile } from "@/context/UserProfileContext";
import EngagementCommentsThread from "./EngagementCommentsThread";

export interface EngagementCardProps {
    item: EngagementItem;
    onInteraction?: (data?: any) => void;
    className?: string;
    compact?: boolean;
    variant?: "post" | "card";
    onShowLikers?: (id: string) => void;
}

function timeAgo(ts?: number | string): string {
    if (!ts) return "now";
    const date = typeof ts === "number" ? ts : new Date(ts).getTime();
    if (isNaN(date)) return "now";
    const diff = Math.max(0, Date.now() - date);
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
}

export function useRunningCountdown(
    timerMinutes?: number,
    createdAt?: number | string,
    expiresAt?: number | null
) {
    // Only a clock tick is kept in state. The remaining time is derived from the props on every render,
    // so a changed expiresAt (e.g. the admin edits the timer from 4m to 2m) takes effect immediately.
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        setNow(Date.now());
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    let endMs: number | null = null;
    const exp = Number(expiresAt);
    if (exp > 0) {
        endMs = exp > 1e11 ? exp : exp * 1000;
    } else if (createdAt && timerMinutes) {
        // Fallback only when expiresAt is missing
        const start = typeof createdAt === "number" ? createdAt : new Date(createdAt).getTime();
        if (Number.isFinite(start)) endMs = start + timerMinutes * 60 * 1000;
    }

    // No end time known: show the full timer length without counting down
    const remainingMs = endMs === null ? (timerMinutes || 4) * 60 * 1000 : endMs - now;
    if (endMs !== null && remainingMs <= 0) return "Expired";

    const totalSec = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Look for a saved vote under the per-user key first, then the old shared key and the guest key
// (used before the profile finished loading), so votes saved earlier are not lost.
function readSavedVote(itemId: string, voteKey: string): string | null {
    if (typeof window === "undefined") return null;
    const keys = [voteKey, `sf_vote_${itemId}`, `sf_vote_${itemId}_fan_guest`];
    for (const key of keys) {
        try {
            const stored = localStorage.getItem(key);
            if (stored) return stored;
        } catch { /* ignore */ }
    }
    return null;
}

export default function EngagementCard({
    item,
    onInteraction,
    className = "",
    compact = false,
    variant = "post",
    onShowLikers,
}: EngagementCardProps) {
    const { userProfile } = useUserProfile();
    const currentUserId = userProfile?.actualUserId || userProfile?.email || "fan_guest";
    const currentUserName = userProfile?.username || userProfile?.name || "Fan";
    const currentUserAvatar = userProfile?.avatarUrl || userProfile?.avatar || "";

    // ── Local State & Storage Keys (PER USER, so several accounts in one browser don't share state) ──
    const voteKey = `sf_vote_${item.id}_${currentUserId}`;
    const likeKey = `sf_like_${item.id}_${currentUserId}`;

    const [userVoted, setUserVoted] = useState<boolean>(() => {
        // Check localStorage FIRST — persists optimistic vote across remounts even before server hydration
        if (readSavedVote(item.id, voteKey)) return true;
        return Boolean(item.userVoted);
    });

    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(() => {
        // Check localStorage FIRST so optimistic vote survives remount before server hydration
        const stored = readSavedVote(item.id, voteKey);
        if (stored) return stored;
        return item.userVote ?? null;
    });

    const [isVoting, setIsVoting] = useState(false);
    // true only while the vote request is in flight; drives the optimistic +1
    const [pendingVote, setPendingVote] = useState(false);
    // "Edit vote": the user re-opens the options to change a pick while the timer is still running
    const [isEditingVote, setIsEditingVote] = useState(false);
    // the in-flight request is a change of an existing vote (no optimistic +1)
    const [pendingChange, setPendingChange] = useState(false);
    const [voteError, setVoteError] = useState<string | null>(null);
    // when this browser last cast a vote (0 = not in this session); limits the optimistic +1
    const votedAtRef = useRef(0);

    // Likes state
    const [likes, setLikes] = useState<number>(Number(item.likes) || 0);
    const likeLockRef = useRef(0); // timestamp of last local toggle
    const likeConfirmedRef = useRef(false); // true once the like endpoint confirmed this browser's like
    const [isLiked, setIsLiked] = useState<boolean>(() => {
        if (item.userLiked) return true;
        if (typeof window !== "undefined") {
            try { return localStorage.getItem(likeKey) === "true"; } catch { return false; }
        }
        return false;
    });

    // Shares state
    const [shares, setShares] = useState<number>(Number(item.shares) || 0);
    const [shareCopied, setShareCopied] = useState(false);
    const shareKey = `sf_share_${item.id}_${currentUserId}`;
    const [hasShared, setHasShared] = useState<boolean>(() => {
        if (Array.isArray((item as any).sharedUsers) && (item as any).sharedUsers.includes(currentUserId)) return true;
        if (typeof window !== "undefined") {
            try { return localStorage.getItem(shareKey) === "true"; } catch { return false; }
        }
        return false;
    });

    // Comments count state
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState<number>(() => {
        return Number(item.commentsCount ?? item.memeData?.commentsCount ?? 0);
    });

    // Total Engaged (Participation count) state
    const [totalEngaged, setTotalEngaged] = useState<number>(() => {
        return Number(item.totalEngaged) || 0;
    });

    // Dynamic Votes calculation cache (server response after voting)
    const [liveVoteData, setLiveVoteData] = useState<any>(null);

    // Live Running Timer (ticks every second)
    const runningTimer = useRunningCountdown(item.timerMinutes, item.createdAt, item.expiresAt);
    // Outcome set by the admin (prediction / debate): the post is resolved and has a winning option.
    const anyItem = item as any;
    const winningOptionId = String(
        anyItem.winningChoiceId ??
        anyItem.outcomeWinningChoiceId ??
        anyItem.predictionData?.winningChoiceId ??
        anyItem.debateData?.winningChoiceId ??
        anyItem.debateData?.verdict ??
        ""
    ).trim();
    const isResolved =
        (item.type === "prediction" || item.type === "debate") &&
        (["settled", "resolved"].includes(String(anyItem.status || "").toLowerCase()) || winningOptionId !== "");
    const isWinnerOption = (opt: any) =>
        isResolved && (opt?.isWinner === true || (winningOptionId !== "" && String(opt?.id) === winningOptionId));
    // Voting closes when the countdown ends or the outcome is resolved; the vote route also rejects votes after expiry.
    const isTimerExpired = runningTimer === "Expired" || isResolved;
    const timerLabel = isResolved ? "Resolved" : runningTimer === "Expired" ? "Expired" : `${runningTimer} remaining`;
    // Resolved posts show the result bars even to users who did not vote.
    // While editing, the options are shown again so the user can pick a different one.
    // (if the timer ends mid-edit, fall back to the results)
    const showResults = (userVoted || isResolved) && (!isEditingVote || isTimerExpired);
    // Only prediction / poll / debate / express can be edited, and only until the timer ends.
    const canEditVote = userVoted && !isTimerExpired && !isEditingVote &&
        ["prediction", "poll", "debate", "express"].includes(String(item.type));
    // The admin's post-lock note is revealed once the timer has ended (or the outcome is resolved).
    const postLockText = isTimerExpired ? String((item as any).postLock ?? "").trim() : "";

    // Add +1 to the user's pick only when no fresher count includes it: the vote request is in flight,
    // or it succeeded but the server sent no option counts and the list item doesn't know about the vote yet.
    // A changed vote never gets a +1 (it would double count against the old pick).
    // The +1 only covers the first seconds after voting: if the list still doesn't count the vote after that,
    // showing +1 forever would make the total wrong (the server count is the truth).
    const needsLocalBump = !pendingChange && (pendingVote || (
        userVoted && !item.userVoted && !liveVoteData?.options && Date.now() - votedAtRef.current < 8000
    ));

    // The profile (and so currentUserId / voteKey) can resolve after first render. The lazy useState
    // initialisers above only run once, so re-read the saved vote whenever the key changes.
    useEffect(() => {
        const stored = readSavedVote(item.id, voteKey);
        if (stored) {
            setSelectedOptionId(stored);
            setUserVoted(true);
            // move it onto the current per-user key
            try { localStorage.setItem(voteKey, stored); } catch { /* ignore */ }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [voteKey]);

    // The list API computes real counts + per-user state, so mirror it into local state on every refresh.
    useEffect(() => {
        if (item.totalEngaged !== undefined) setTotalEngaged(Number(item.totalEngaged) || 0);
        if (item.commentsCount !== undefined) setCommentsCount(Number(item.commentsCount) || 0);
    }, [item.totalEngaged, item.commentsCount]);

    useEffect(() => {
        // ignore a list refresh right after the user toggled, so it can't flash a stale value
        const likeLocked = Date.now() - likeLockRef.current < 15000;
        if (!likeLocked) {
            let savedLike = false;
            try { savedLike = localStorage.getItem(likeKey) === "true"; } catch { }
            if (item.likes !== undefined) {
                const sLikes = Number(item.likes) || 0;
                setLikes(prev => ((isLiked || savedLike) && sLikes === 0 ? Math.max(prev, 1) : sLikes));
            }
            // A list saying "not liked" must not undo a like this browser made and the server confirmed
            // (the list may have been computed for another user id). Only a "liked" answer, or this
            // browser never having liked it, is applied.
            if (item.userLiked !== undefined && (item.userLiked || !savedLike || !likeConfirmedRef.current)) {
                setIsLiked(Boolean(item.userLiked));
                try { localStorage.setItem(likeKey, String(Boolean(item.userLiked))); } catch { }
            }
        }
        if (item.shares !== undefined) setShares(Number(item.shares) || 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.likes, item.userLiked, item.shares, isLiked]);

    // Live Sync: Poll like state and comments count every 3s so multi-user updates reflect live
    useEffect(() => {
        if (!item.id) return;
        let cancelled = false;
        const syncSocial = async () => {
            if (Date.now() - likeLockRef.current < 15000) return;
            try {
                const res = await axios.get(`/api/engagements/${encodeURIComponent(item.id)}/like`, {
                    params: { userId: currentUserId, matchId: item.matchId, _t: Date.now() },
                    timeout: 6000,
                });
                if (cancelled) return;
                if (typeof res.data?.likes === "number") {
                    setLikes(prev => (isLiked && res.data.likes === 0 ? Math.max(prev, 1) : res.data.likes));
                }
                if (typeof res.data?.liked === "boolean") {
                    if (res.data.liked) {
                        setIsLiked(true);
                        try { localStorage.setItem(likeKey, "true"); } catch {}
                    }
                }
            } catch {}
            try {
                const cRes = await axios.get(`/api/engagements/${encodeURIComponent(item.id)}/comments`, {
                    params: { countOnly: "1", matchId: item.matchId, _t: Date.now() },
                    timeout: 6000,
                });
                if (cancelled) return;
                if (typeof cRes.data?.commentsCount === "number") setCommentsCount(cRes.data.commentsCount);
            } catch {}
        };

        const interval = setInterval(() => {
            if (!cancelled && !document.hidden) syncSocial();
        }, 3000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [item.id, currentUserId, item.matchId, likeKey, isLiked]);

    // Server vote state wins once it arrives (localStorage stays as the optimistic fallback).
    useEffect(() => {
        if (pendingVote) return;
        if (item.userVoted && item.userVote) {
            setSelectedOptionId(String(item.userVote));
            setUserVoted(true);
            try { localStorage.setItem(voteKey, String(item.userVote)); } catch { }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.userVoted, item.userVote, voteKey]);

    // Fresh list data carries recounted options: drop the vote-response snapshot so other users' votes show.
    useEffect(() => {
        if (pendingVote) return;
        setLiveVoteData(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.updatedAt, item.totalVotes]);

    // Fallback only: hydrate like state + count from the server when the list item doesn't carry them
    useEffect(() => {
        if (item.likes !== undefined && item.userLiked !== undefined) return;
        let cancelled = false;
        axios
            .get(`/api/engagements/${encodeURIComponent(item.id)}/like`, {
                params: { userId: currentUserId, matchId: item.matchId },
                timeout: 6000,
            })
            .then((res) => {
                if (cancelled) return;
                if (Date.now() - likeLockRef.current < 15000) return; // user just toggled; don't clobber
                if (typeof res.data?.liked === "boolean") {
                    setIsLiked(res.data.liked);
                    try { localStorage.setItem(likeKey, String(res.data.liked)); } catch { }
                }
                if (res.data?.likes !== undefined) setLikes(Number(res.data.likes) || 0);
            })
            .catch(() => { });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id, currentUserId]);

    // Fallback only: hydrate share state + count when the list item doesn't carry them
    useEffect(() => {
        if (item.shares !== undefined) return;
        let cancelled = false;
        axios
            .get(`/api/engagements/${encodeURIComponent(item.id)}/share`, {
                params: { userId: currentUserId, matchId: item.matchId },
                timeout: 6000,
            })
            .then((res) => {
                if (cancelled) return;
                if (typeof res.data?.shared === "boolean") {
                    setHasShared(res.data.shared);
                    try { localStorage.setItem(shareKey, String(res.data.shared)); } catch { }
                }
                if (res.data?.shares !== undefined) setShares(Number(res.data.shares) || 0);
            })
            .catch(() => { });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id, currentUserId]);

    // Fallback only: load comment count when the list item doesn't carry it
    useEffect(() => {
        if (item.commentsCount !== undefined) return;
        let cancelled = false;
        axios
            .get(`/api/engagements/${encodeURIComponent(item.id)}/comments`, {
                params: { countOnly: 1, matchId: item.matchId },
                timeout: 6000,
            })
            .then((res) => {
                if (!cancelled && typeof res.data?.commentsCount === "number") {
                    setCommentsCount(res.data.commentsCount);
                }
            })
            .catch(() => { });
        return () => { cancelled = true; };
    }, [item.id, item.matchId]);

    // ── Type Theme Info ──
    const theme = useMemo(() => {
        switch (item.type) {
            case "prediction":
                return { label: "PREDICTION", icon: "🎯", badgeBg: "bg-amber-500/20 text-amber-400 border border-amber-500/40", accent: "#fbbf24" };
            case "debate":
                return { label: "DEBATE", icon: "⚖️", badgeBg: "bg-blue-500/20 text-blue-400 border border-blue-500/40", accent: "#60a5fa" };
            case "poll":
                return { label: "POLL", icon: "📊", badgeBg: "bg-blue-500/20 text-blue-400 border border-blue-500/40", accent: "#60a5fa" };
            case "express":
                return { label: "EXPRESS", icon: "⚡", badgeBg: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40", accent: "#22d3ee" };
            case "question":
                return { label: "QUESTION", icon: "❓", badgeBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40", accent: "#22c55e" };
            case "quiz":
                return { label: "QUIZ", icon: "🧠", badgeBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40", accent: "#22c55e" };
            case "fan_battle":
                return { label: "BATTLE", icon: "⚔️", badgeBg: "bg-rose-500/20 text-rose-400 border border-rose-500/40", accent: "#e91e8c" };
            default:
                return { label: "MATCH MOMENT", icon: "🔥", badgeBg: "bg-orange-500/20 text-orange-400 border border-orange-500/40", accent: "#ff6b35" };
        }
    }, [item.type]);

    // ── Submit Vote / Participation ──
    const handleVote = async (optionId: string) => {
        if ((userVoted && !isEditingVote) || isVoting || isTimerExpired) return;

        const isChange = userVoted && isEditingVote;
        const previousOptionId = selectedOptionId;
        setVoteError(null);
        // picking the same option again just closes the editor
        if (isChange && previousOptionId !== null && String(previousOptionId) === String(optionId)) {
            setIsEditingVote(false);
            return;
        }

        votedAtRef.current = Date.now();
        setIsVoting(true);
        setSelectedOptionId(optionId);
        setUserVoted(true);
        setPendingVote(true);
        setPendingChange(isChange);
        setIsEditingVote(false);
        // Persist immediately so a refresh mid-request still shows the result view
        try { localStorage.setItem(voteKey, optionId); } catch { }

        try {
            const res = await axios.post(
                `/api/engagements/${encodeURIComponent(item.id)}/vote`,
                {
                    selectedOptionId: optionId,
                    userId: currentUserId,
                    userName: currentUserName,
                    userAvatar: currentUserAvatar,
                    matchId: item.matchId,
                    ...(isChange ? { changeVote: true, previousOptionId } : {}),
                },
                { timeout: 8000 }
            );

            setLiveVoteData(res.data);
            if (res.data?.totalEngaged !== undefined) {
                setTotalEngaged(Number(res.data.totalEngaged) || 0);
            }
            try { localStorage.setItem(voteKey, optionId); } catch { }

            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("sf360:points-updated", { detail: { points: 2 } }));
            }

            // Don't forward options/totalVotes: liveVoteData holds them until the next list refresh
            // brings recounted data (forwarding would clear it against stale pollData options).
            onInteraction?.({
                userVoted: true,
                userVote: optionId,
                totalEngaged: res.data?.totalEngaged,
            });
        } catch (err: any) {
            if (isChange && (err?.response?.data?.alreadyVoted || (err?.response && err.response.status < 500))) {
                // Change refused (server may not support it yet, or the timer just ended): go back to the old pick
                const msg = err?.response?.data?.error || err?.response?.data?.message || "Could not change your vote.";
                console.warn("Vote change rejected:", err?.response?.status, err?.response?.data);
                setVoteError(String(msg));
                setSelectedOptionId(previousOptionId);
                try { if (previousOptionId) localStorage.setItem(voteKey, String(previousOptionId)); } catch { }
            } else if (err?.response?.data?.alreadyVoted) {
                // Server says this user already voted: show their real pick
                setSelectedOptionId(err.response.data.selectedOptionId ?? optionId);
                try { localStorage.setItem(voteKey, String(err.response.data.selectedOptionId ?? optionId)); } catch { }
            } else if (!err?.response || err.response.status >= 500) {
                // Timeout / network drop / server error: the vote record is written before the later
                // steps (recount, leaderboard) that can fail, so it was most likely saved. Keep the vote;
                // the next list refresh (item.userVoted) confirms or corrects it.
                console.warn("Vote response not received or server error, keeping vote:", err?.response?.status, err?.response?.data ?? err);
            } else {
                // Server rejected the vote (4xx): undo, so the UI never shows a vote that wasn't saved
                console.warn("Vote rejected:", err.response.status, err.response.data);
                setUserVoted(false);
                setSelectedOptionId(null);
                try { localStorage.removeItem(voteKey); } catch { }
            }
        } finally {
            setPendingVote(false);
            setPendingChange(false);
            setIsVoting(false);
        }
    };

    // Edit-vote button, vote error and the admin's "post lock" note, shown under the options.
    const renderVoteExtras = () => (
        <>
            {postLockText && (
                <div className="flex items-start gap-1.5 mt-1.5 px-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-400/30 text-[10px] text-purple-200">
                    <Lock size={11} className="shrink-0 mt-0.5 text-purple-300" />
                    <span className="break-words min-w-0">{postLockText}</span>
                </div>
            )}
            {voteError && <div className="mt-1 text-[10px] text-rose-400">{voteError}</div>}
            {canEditVote && (
                <button
                    type="button"
                    disabled={isVoting}
                    onClick={() => { setVoteError(null); setIsEditingVote(true); }}
                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-white/60 hover:text-white transition-colors disabled:opacity-50"
                >
                    <Pencil size={10} /> Edit vote
                </button>
            )}
            {isEditingVote && (
                <button
                    type="button"
                    onClick={() => setIsEditingVote(false)}
                    className="mt-1.5 text-[10px] font-bold text-white/50 hover:text-white transition-colors"
                >
                    Cancel
                </button>
            )}
        </>
    );

    // ── Toggle Like ──
    const handleToggleLike = async () => {
        const prev = { isLiked, likes, totalEngaged };
        const nextLiked = !isLiked;
        const delta = nextLiked ? 1 : -1;

        likeLockRef.current = Date.now();
        setIsLiked(nextLiked);
        setLikes(l => Math.max(0, l + delta));
        setTotalEngaged(t => Math.max(0, t + delta));
        try { localStorage.setItem(likeKey, String(nextLiked)); } catch { }

        try {
            const res = await axios.post(
                `/api/engagements/${encodeURIComponent(item.id)}/like`,
                { userId: currentUserId, matchId: item.matchId },
                { timeout: 8000 }
            );
            const L = Number(res.data?.likes);
            const T = Number(res.data?.totalEngaged);
            const liked = Boolean(res.data?.liked);
            likeLockRef.current = Date.now();
            if (!isNaN(L)) setLikes(L);
            if (!isNaN(T)) setTotalEngaged(T);
            setIsLiked(liked);
            likeConfirmedRef.current = liked;
            try { localStorage.setItem(likeKey, String(liked)); } catch { }
            onInteraction?.({
                likes: isNaN(L) ? undefined : L,
                userLiked: liked,
                totalEngaged: isNaN(T) ? undefined : T,
            });
        } catch (err) {
            console.warn("Like failed, reverting:", err);
            setIsLiked(prev.isLiked);
            setLikes(prev.likes);
            setTotalEngaged(prev.totalEngaged);
            try { localStorage.setItem(likeKey, String(prev.isLiked)); } catch { }
        }
    };

    // ── Share Engagement (counted once per user) ──
    const handleShare = async () => {
        const shareUrl = typeof window !== "undefined"
            ? `${window.location.origin}${window.location.pathname}?engagement=${item.id}` : "";
        const shareTitle = item.title || "Check out this live match moment on SportsFan360!";
        let didShare = false;

        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({ title: shareTitle, text: item.subtitle || shareTitle, url: shareUrl });
                didShare = true;
            } catch (err: any) {
                if (err?.name === "AbortError") return; // user cancelled: don't count
            }
        }

        if (!didShare) {
            try {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                    await navigator.clipboard.writeText(shareUrl);
                } else {
                    // fallback for non-secure origins (e.g. http on a LAN IP)
                    const ta = document.createElement("textarea");
                    ta.value = shareUrl;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                }
                didShare = true;
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2200);
            } catch { /* ignore */ }
        }

        // Count only once per user, and only if they actually shared
        if (!didShare || hasShared) return;

        setHasShared(true);
        setShares(s => s + 1);
        try { localStorage.setItem(shareKey, "true"); } catch { }

        try {
            const res = await axios.post(
                `/api/engagements/${encodeURIComponent(item.id)}/share`,
                { userId: currentUserId, matchId: item.matchId },
                { timeout: 8000 }
            );
            const s = Number(res.data?.shares);
            const t = Number(res.data?.totalEngaged);
            if (!isNaN(s)) setShares(s); // server is the source of truth
            if (!isNaN(t) && t > 0) setTotalEngaged(t);
            onInteraction?.({ shares: isNaN(s) ? undefined : s, totalEngaged: isNaN(t) ? undefined : t });
        } catch (err) {
            console.warn("Share failed, reverting:", err);
            setHasShared(false);
            setShares(s => Math.max(0, s - 1));
            try { localStorage.removeItem(shareKey); } catch { }
        }
    };

    // ─────────────────────────────────────────────────────────────
    // RENDER: Prediction Body
    // ─────────────────────────────────────────────────────────────
    const renderPrediction = () => {
        const pred: any = item.predictionData;

        const baseOptions: any[] =
            liveVoteData?.options ||
            (pred?.options?.length ? pred.options : null) ||
            (item.options?.length ? item.options : null) ||
            [
                { ...pred?.leftChoice, id: pred?.leftChoice?.id ?? "left", text: pred?.leftChoice?.text ?? "Team A", votes: pred?.leftChoice?.votes ?? 0 },
                { ...pred?.rightChoice, id: pred?.rightChoice?.id ?? "right", text: pred?.rightChoice?.text ?? "Team B", votes: pred?.rightChoice?.votes ?? 0 },
            ];

        // Optimistic +1 for the user's pick ONLY while the request is in flight
        const options = baseOptions.map((opt: any) => {
            let votes = Number(opt.votes || 0);
            if (needsLocalBump && selectedOptionId && String(opt.id) === String(selectedOptionId)) votes += 1;
            return { ...opt, votes };
        });

        const total = options.reduce((s: number, o: any) => s + o.votes, 0);
        const pctOf = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
        const chosen = options.find((o: any) => String(o.id) === String(selectedOptionId));

        return (
            <div className="flex flex-col gap-1.5 mt-1">
                {!showResults ? (
                    <div className="grid grid-cols-2 gap-2 mt-0.5">
                        {options.map((opt: any) => (
                            <button
                                key={opt.id}
                                type="button"
                                disabled={isVoting || isTimerExpired}
                                onClick={() => handleVote(String(opt.id))}
                                className="p-2.5 rounded-lg bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-400/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="block text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                                    {opt.text || opt.label}
                                </span>
                                <span className="text-[9px] text-white/50 block mt-0.5">Predict This</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5 mt-0.5">
                        {options.map((opt: any) => {
                            const isChosen = String(opt.id) === String(selectedOptionId);
                            const isWinner = isWinnerOption(opt);
                            const pct = pctOf(opt.votes);
                            return (
                                <div
                                    key={opt.id}
                                    className={`relative w-full rounded-lg overflow-hidden p-2 border transition-all ${isWinner ? "border-emerald-400/70 bg-emerald-500/15" : isChosen ? "border-amber-400/60 bg-amber-500/10" : "border-white/5 bg-white/5"}`}
                                >
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`absolute inset-y-0 left-0 ${isWinner ? "bg-emerald-500/30" : isChosen ? "bg-amber-500/25" : "bg-white/10"}`}
                                    />
                                    <div className="relative flex items-center justify-between text-xs">
                                        <span className={`font-medium flex items-center gap-1.5 ${isWinner ? "text-emerald-300 font-bold" : isChosen ? "text-amber-300 font-bold" : "text-white"}`}>
                                            {(isWinner || isChosen) && <CheckCircle2 size={12} className={`${isWinner ? "text-emerald-400" : "text-amber-400"} shrink-0`} />}
                                            {opt.text || opt.label}
                                            {isWinner && <span className="text-[8px] font-extrabold uppercase tracking-wide text-emerald-300 bg-emerald-500/20 px-1 py-0.5 rounded">Winner</span>}
                                        </span>
                                        <span className="text-[11px] font-bold text-white/80 shrink-0 ml-2">{pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="flex justify-between items-center text-[9px] text-white/50">
                            <span>{chosen ? <>Your pick: <strong className="text-white">{chosen.text || chosen.label}</strong></> : "No pick"}</span>
                            <span>{total} total predictions</span>
                        </div>
                    </div>
                )}
                {renderVoteExtras()}
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────
    // RENDER: Poll / Debate / Express Body
    // ─────────────────────────────────────────────────────────────
    const renderPoll = () => {
        const rawOptions =
            liveVoteData?.options ||
            item.pollData?.options ||
            item.debateData?.options ||
            item.expressData?.options ||
            item.questionData?.options ||
            item.options ||
            [
                { id: "opt_1", text: "Option A", votes: 0 },
                { id: "opt_2", text: "Option B", votes: 0 },
            ];

        // Optimistic +1 only while the request is in flight
        const displayOptions = rawOptions.map((opt: any) => {
            let votes = Number(opt.votes || 0);
            if (needsLocalBump && selectedOptionId && (opt.id === selectedOptionId || opt.text === selectedOptionId)) {
                votes += 1;
            }
            return { ...opt, votes };
        });

        const totalVotes = displayOptions.reduce((sum: number, o: any) => sum + (Number(o.votes) || 0), 0);

        return (
            <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex flex-col gap-1.5">
                    {displayOptions.map((opt: any) => {
                        const optVotes = Number(opt.votes) || 0;
                        const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                        const isChosen = selectedOptionId === opt.id || selectedOptionId === opt.text;
                        const isWinner = isWinnerOption(opt);

                        if (!showResults) {
                            return (
                                <button
                                    key={opt.id || opt.text}
                                    type="button"
                                    disabled={isVoting || isTimerExpired}
                                    onClick={() => handleVote(opt.id || opt.text)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-xs text-white group-hover:text-blue-400 font-medium transition-colors">
                                        {opt.text || opt.label}
                                    </span>
                                    <span className="text-[9px] text-white/40 group-hover:text-white/70">Vote</span>
                                </button>
                            );
                        }

                        return (
                            <div
                                key={opt.id || opt.text}
                                className={`relative w-full rounded-lg overflow-hidden p-2 border transition-all ${isWinner ? "border-emerald-400/70 bg-emerald-500/15" : isChosen ? "border-blue-400/60 bg-blue-500/10" : "border-white/5 bg-white/5"
                                    }`}
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className={`absolute inset-y-0 left-0 ${isWinner ? "bg-emerald-500/30" : isChosen ? "bg-blue-500/25" : "bg-white/10"
                                        }`}
                                />
                                <div className="relative flex items-center justify-between text-xs">
                                    <span className={`font-medium flex items-center gap-1.5 ${isWinner ? "text-emerald-300 font-bold" : isChosen ? "text-blue-300 font-bold" : "text-white"}`}>
                                        {(isWinner || isChosen) && <CheckCircle2 size={12} className={`${isWinner ? "text-emerald-400" : "text-blue-400"} shrink-0`} />}
                                        {opt.text || opt.label}
                                        {isWinner && <span className="text-[8px] font-extrabold uppercase tracking-wide text-emerald-300 bg-emerald-500/20 px-1 py-0.5 rounded">Winner</span>}
                                    </span>
                                    <span className="text-[11px] font-bold text-white/80 shrink-0 ml-2">{pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {showResults && (
                    <div className="text-[9px] text-white/40 text-right mt-0.5">
                        {totalVotes} total votes
                    </div>
                )}
                {renderVoteExtras()}
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────
    // RENDER: Quiz / Trivia Body
    // ─────────────────────────────────────────────────────────────
    const renderQuiz = () => {
        const quiz: any = item.quizData || item.questionData;
        const options: any[] =
            quiz?.options?.length ? quiz.options :
                item.options?.length ? item.options :
                    [{ id: "A", text: "Answer Option A" }, { id: "B", text: "Answer Option B" }];
        const correctId = String(quiz?.correctOptionId ?? options[0]?.id ?? "A");

        return (
            <div className="flex flex-col gap-1.5 mt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {options.map((opt: any) => {
                        const isChosen = selectedOptionId === opt.id;
                        const isCorrectAnswer = opt.id === correctId;

                        let btnStyle = "bg-white/5 border-white/10 text-white hover:bg-white/10";
                        if (userVoted) {
                            if (isCorrectAnswer) {
                                btnStyle = "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold";
                            } else if (isChosen) {
                                btnStyle = "bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold";
                            } else {
                                btnStyle = "bg-white/5 border-white/5 text-white/40";
                            }
                        }

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                disabled={userVoted || isVoting || isTimerExpired}
                                onClick={() => handleVote(opt.id)}
                                className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                                <span>{opt.text}</span>
                                {userVoted && isCorrectAnswer && <CheckCircle2 size={13} className="text-emerald-400" />}
                                {userVoted && isChosen && !isCorrectAnswer && <XCircle size={13} className="text-rose-400" />}
                            </button>
                        );
                    })}
                </div>

                {userVoted && quiz?.explanation && (
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/70 leading-relaxed mt-1">
                        <strong className="text-emerald-400">Explanation: </strong>
                        {quiz.explanation}
                    </div>
                )}
                {renderVoteExtras()}
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────
    // RENDER: Fan Battle Body
    // ─────────────────────────────────────────────────────────────
    const renderFanBattle = () => {
        const battle = item.fanBattleData;
        const left = battle?.leftCompetitor || { code: "P1", name: "Player 1", stat: "Form 8.4", votes: 0, imageUrl: "" };
        const right = battle?.rightCompetitor || { code: "P2", name: "Player 2", stat: "Form 7.9", votes: 0, imageUrl: "" };

        const rawLeftVotes = Number(liveVoteData?.leftVotes ?? battle?.leftCompetitor?.votes ?? 0);
        const rawRightVotes = Number(liveVoteData?.rightVotes ?? battle?.rightCompetitor?.votes ?? 0);

        const bump = needsLocalBump && liveVoteData?.leftVotes === undefined;
        const leftVotes = rawLeftVotes + (bump && selectedOptionId === "left" ? 1 : 0);
        const rightVotes = rawRightVotes + (bump && selectedOptionId === "right" ? 1 : 0);

        const total = leftVotes + rightVotes;
        const leftPct =
            liveVoteData?.leftPercentage !== undefined
                ? Math.round(liveVoteData.leftPercentage)
                : (total > 0 ? Math.round((leftVotes / total) * 100) : 50);
        const rightPct = 100 - leftPct;

        return (
            <div className="flex flex-col gap-2 mt-1">
                <div className="grid grid-cols-2 gap-2 relative">
                    {/* Left Competitor */}
                    <div className={`p-2.5 rounded-lg border text-center transition-all ${selectedOptionId === "left" ? "bg-rose-500/15 border-rose-500/60" : "bg-white/5 border-white/10"
                        }`}>
                        <div className="w-10 h-10 mx-auto rounded-full overflow-hidden bg-white/10 mb-1 border border-white/20">
                            {left.imageUrl ? (
                                <img src={left.imageUrl} alt={left.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-rose-400 bg-rose-500/10 text-xs">
                                    {(left?.name || "P1").slice(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h4 className="text-[11px] font-bold text-white truncate">{left.name}</h4>
                        <p className="text-[9px] text-white/50">{left.stat}</p>

                        {!userVoted ? (
                            <button
                                type="button"
                                disabled={isVoting || isTimerExpired}
                                onClick={() => handleVote("left")}
                                className="w-full mt-1.5 py-1 px-2 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back {left.name.split(" ")[0]}
                            </button>
                        ) : (
                            <span className="block mt-1 text-[11px] font-black text-rose-400">{leftPct}%</span>
                        )}
                    </div>

                    {/* VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-center text-[8px] font-black text-white shadow-lg pointer-events-none z-10">
                        VS
                    </div>

                    {/* Right Competitor */}
                    <div className={`p-2.5 rounded-lg border text-center transition-all ${selectedOptionId === "right" ? "bg-amber-500/15 border-amber-500/60" : "bg-white/5 border-white/10"
                        }`}>
                        <div className="w-10 h-10 mx-auto rounded-full overflow-hidden bg-white/10 mb-1 border border-white/20">
                            {right.imageUrl ? (
                                <img src={right.imageUrl} alt={right.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-amber-400 bg-amber-500/10 text-xs">
                                    {(right?.name || "P2").slice(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h4 className="text-[11px] font-bold text-white truncate">{right.name}</h4>
                        <p className="text-[9px] text-white/50">{right.stat}</p>

                        {!userVoted ? (
                            <button
                                type="button"
                                disabled={isVoting || isTimerExpired}
                                onClick={() => handleVote("right")}
                                className="w-full mt-1.5 py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Back {right.name.split(" ")[0]}
                            </button>
                        ) : (
                            <span className="block mt-1 text-[11px] font-black text-amber-400">{rightPct}%</span>
                        )}
                    </div>
                </div>

                {userVoted && (
                    <div className="flex flex-col gap-1">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${leftPct}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-rose-500"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${rightPct}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-amber-400"
                            />
                        </div>
                        <div className="text-[9px] text-white/40 text-center">{total} votes</div>
                    </div>
                )}
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────
    // RENDER: Generic Meme / Drop Body
    // ─────────────────────────────────────────────────────────────
    const renderMeme = () => {
        const meme = item.memeData;
        return (
            <div className="flex flex-col gap-1.5 mt-1">
                {meme?.imageUrl && (
                    <div className="rounded-lg overflow-hidden max-h-52 bg-black/40 border border-white/10">
                        <img src={meme.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                )}
                {meme?.caption && (
                    <p className="text-xs text-white/80 leading-relaxed">{meme.caption}</p>
                )}
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────
    // VARIANT: "post" (Matches regular room discussion posts seamlessly)
    // ─────────────────────────────────────────────────────────────
    if (variant === "post") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`w-full ${className}`}
                style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
                {/* ── Post Header ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, minWidth: 0 }}>
                    <div style={{ flexShrink: 0 }}>
                        <img
                            src={item.creatorAvatar || "/images/sportsfan360logo.png"}
                            alt={item.creatorName || "SportsFan360"}
                            className="w-6 h-6 rounded-full object-contain border border-white/10 bg-black/40"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/images/sportsfan360logo.png";
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 10, color: "#fff", whiteSpace: "nowrap" }}>
                            {item.creatorName || "SportsFan360"}
                        </span>
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.48)", whiteSpace: "nowrap" }}>
                            {timeAgo(item.createdAt)}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded ${theme.badgeBg}`}>
                            {theme.label}
                        </span>

                        {/* Running Timer */}
                        <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex items-center gap-1 ml-auto">
                            <Clock size={10} className="text-amber-400" />
                            <span>{timerLabel}</span>
                        </span>
                    </div>
                </div>

                {/* ── Post Content / Title ── */}
                <p className="leading-snug text-white font-medium my-1" style={{ fontSize: 10 }}>
                    {item.title}
                </p>
                {item.subtitle && item.subtitle !== item.title && (
                    <p className="text-[10px] text-white/60 mb-2 leading-relaxed">
                        {item.subtitle}
                    </p>
                )}

                {/* ── Interactive Options ── */}
                <div className="my-1.5">
                    {item.type === "prediction" && renderPrediction()}
                    {(item.type === "debate" || item.type === "poll" || item.type === "express") && renderPoll()}
                    {(item.type === "quiz" || item.type === "question") && renderQuiz()}
                    {item.type === "fan_battle" && renderFanBattle()}
                    {item.type === "meme" && renderMeme()}
                </div>

                {/* ── Action Bar (Comments, Likes, Shares) ── */}
                <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 5, alignItems: "center" }}>
                    {/* Live Like */}
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <button
                            type="button"
                            onClick={handleToggleLike}
                            className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${isLiked ? "text-[#e91e8c]" : "text-[#9494ad] hover:text-white"}`}
                            title={isLiked ? "Unlike" : "Like this moment"}
                        >
                            <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (likes > 0) onShowLikers?.(item.id);
                                else handleToggleLike();
                            }}
                            className={`text-[10px] transition-colors ${likes > 0 ? "hover:underline cursor-pointer hover:text-white" : ""} ${isLiked ? "text-[#e91e8c] font-bold" : "text-[#9494ad]"}`}
                            title={likes > 0 ? "See who liked this" : "Like this moment"}
                        >
                            {likes}
                        </button>
                    </div>

                    {/* Comments Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowComments(prev => !prev)}
                        className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${showComments ? "text-[#e91e8c]" : "text-[#9494ad] hover:text-white"
                            }`}
                        title="View comments"
                    >
                        <MessageSquare size={12} />
                        <span style={{ fontSize: 10 }}>Comments ({commentsCount})</span>
                        {showComments ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>

                    {/* Native Share */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className={`flex items-center gap-1 text-[11px] transition-colors relative ${hasShared ? "text-[#e91e8c]" : "text-[#9494ad] hover:text-white"}`}
                        title="Share"
                    >
                        <Share2 size={12} />
                        <span style={{ fontSize: 10 }}>{shares}</span>
                        {shareCopied && (
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[9px] text-white whitespace-nowrap shadow-md pointer-events-none">
                                Copied!
                            </span>
                        )}
                    </button>

                    {/* Rightmost Heart Pill to see who reacted */}
                    {likes > 0 && (
                        <motion.button
                            whileTap={{ scale: 0.93 }}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowLikers?.(item.id);
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                marginLeft: "auto",
                                padding: 0,
                            }}
                            title="See who reacted"
                        >
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, position: "relative" }}>
                                ❤️
                            </div>
                        </motion.button>
                    )}
                </div>

                {/* ── Inline Comments Thread ── */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <EngagementCommentsThread
                                engagementId={item.id}
                                matchId={item.matchId}
                                accentColor={theme.accent}
                                onCommentCountChange={(cnt: number) => {
                                    setCommentsCount(cnt);
                                    onInteraction?.({ commentsCount: cnt });
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // VARIANT: "card" (Used in top Hero Loop Banner)
    // ─────────────────────────────────────────────────────────────
    return (
        <div
            className={`rounded-2xl bg-gradient-to-b from-[#181822]/95 to-[#101016]/98 border border-white/10 p-3 shadow-xl hover:border-white/20 transition-all ${className}`}
        >
            {/* ── CARD HEADER ── */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                        {theme.icon} {theme.label}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
                        <Clock size={10} className="text-amber-400" />
                        <span>{timerLabel}</span>
                    </span>
                </div>
                {item.sport && (
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                        {item.sport}
                    </span>
                )}
            </div>

            {/* ── TITLE ── */}
            <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                {item.title}
            </h3>
            {item.subtitle && item.subtitle !== item.title && (
                <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{item.subtitle}</p>
            )}

            {/* ── INTERACTIVE BODY ── */}
            {item.type === "prediction" && renderPrediction()}
            {(item.type === "debate" || item.type === "poll" || item.type === "express") && renderPoll()}
            {(item.type === "quiz" || item.type === "question") && renderQuiz()}
            {item.type === "fan_battle" && renderFanBattle()}
            {item.type === "meme" && renderMeme()}

            {/* ── CARD FOOTER ACTIONS ── */}
            <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/5 text-xs text-white/60">
                <div className="flex items-center gap-3">
                    {/* Live Like Button */}
                    <button
                        type="button"
                        onClick={handleToggleLike}
                        className={`flex items-center gap-1 transition-all ${isLiked ? "text-[#e91e8c] font-bold scale-105" : "hover:text-white"
                            }`}
                        title="Like this moment"
                    >
                        <Heart size={13} fill={isLiked ? "currentColor" : "none"} />
                        <span>{likes}</span>
                    </button>

                    {/* Comments Button */}
                    <button
                        type="button"
                        onClick={() => setShowComments(prev => !prev)}
                        className={`flex items-center gap-1 transition-colors ${showComments ? "text-[#e91e8c] font-bold" : "hover:text-white"
                            }`}
                        title="View comments"
                    >
                        <MessageSquare size={13} />
                        <span>Comments ({commentsCount})</span>
                        {showComments ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>

                    {/* Native Share Button */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className={`flex items-center gap-1 transition-colors relative ${hasShared ? "text-[#e91e8c]" : "hover:text-white"}`}
                        title="Share with friends"
                    >
                        <Share2 size={13} />
                        <span>{shares}</span>
                        {shareCopied && (
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[9px] text-white whitespace-nowrap shadow-md pointer-events-none">
                                Copied!
                            </span>
                        )}
                    </button>

                    {/* Rightmost Heart Pill to see who reacted */}
                    {likes > 0 && (
                        <motion.button
                            whileTap={{ scale: 0.93 }}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowLikers?.(item.id);
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                marginLeft: "auto",
                                padding: 0,
                            }}
                            title="See who reacted"
                        >
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, position: "relative" }}>
                                ❤️
                            </div>
                        </motion.button>
                    )}
                </div>
            </div>

            {/* ── INLINE COMMENTS SECTION ── */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <EngagementCommentsThread
                            engagementId={item.id}
                            matchId={item.matchId}
                            accentColor={theme.accent}
                            onCommentCountChange={(cnt: number) => {
                                setCommentsCount(cnt);
                                onInteraction?.({ commentsCount: cnt });
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}