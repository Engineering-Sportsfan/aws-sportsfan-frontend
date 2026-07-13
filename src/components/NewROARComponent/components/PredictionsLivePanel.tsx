// // components/PredictionsLivePanel.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import { Clock, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";
// import ReactionPicker, { type Reaction } from "./ReactionPicker";
// import InlineSection from "./InlineSection";

// const REACTION_EMOJI: Record<string, string> = {
//   fire: "🔥", heart: "❤️", mindblown: "🤯", goat: "🐐",
//   clap: "👏", nochance: "🙅", laugh: "😂", sad: "😢", thumb: "👍",
// };

// const ACCENT = "#e91e8c";

// interface FlatQuestion {
//   question: string;
//   options: { text: string; emoji?: string }[];
//   postId: string;
//   qIdx: number;
//   globalIdx: number;
//   closesAt: number;
//   userVote?: string | null;
//   agreeCount?: number;
//   disagreeCount?: number;
//   predictionOptionCounts?: Record<string, number>;
// }

// interface PredictionsLivePanelProps {
//   posts: any[];
//   roomId: string;
//   onToast: (m: string) => void;
//   openInlinePostId: string | null;
//   setOpenInlinePostId: (id: string | null) => void;
//   currentAvatarUrl?: string;
//   handleReact: (msgId: string, reaction: Reaction | null) => void;
//   localReactions: Record<string, { reaction: Reaction | null; heartCount: number }>;
//   pendingReactRef: React.MutableRefObject<Record<string, boolean>>;
//   onPostClick?: (post: any) => void;
//   onFanProfile?: (fan: any) => void;
//   setReactionsMsgId: (id: string | null) => void;
//   topReactionsMap: Record<string, string[]>;
//   topReactionsCache: React.MutableRefObject<Record<string, string[]>>;
//   fetchTopReactions: (msgId: string) => void;
// }

// export default function PredictionsLivePanel({
//   posts, roomId, onToast,
//   openInlinePostId, setOpenInlinePostId,
//   currentAvatarUrl, handleReact, localReactions, pendingReactRef,
//   onPostClick, onFanProfile, setReactionsMsgId,
//   topReactionsMap, topReactionsCache, fetchTopReactions,
// }: PredictionsLivePanelProps) {
//   const latestPost = posts[0];
//   const matchTitle: string = latestPost?.matchTitle ?? "LIVE";

//   const flatQuestions: FlatQuestion[] = posts.flatMap((p, _pi) => {
//     const qs: { question: string; options: { text: string; emoji?: string }[] }[] =
//       Array.isArray(p.questions) ? p.questions : [];
//     return qs.map((q, qIdx) => ({
//       question: q.question,
//       options: q.options ?? [],
//       postId: p.id,
//       qIdx,
//       globalIdx: 0,
//       closesAt: p.closesAt ?? 0,
//       userVote: p.userVote ?? null,
//       agreeCount: p.agreeCount ?? 0,
//       disagreeCount: p.disagreeCount ?? 0,
//       predictionOptionCounts: p.predictionOptionCounts ?? {},
//     }));
//   }).map((q, i) => ({ ...q, globalIdx: i }));

//   const totalPolls = flatQuestions.length;

//   const allClosesAt = posts.map(p => p.closesAt).filter((v): v is number => typeof v === 'number' && v > 0);
//   const overallClosesAt = allClosesAt.length > 0 ? Math.min(...allClosesAt) : 0;

//   const [expanded, setExpanded] = useState(true);

//   const [userVotes, setUserVotes] = useState<Record<number, number>>(() => {
//     const saved: Record<number, number> = {};
//     flatQuestions.forEach((fq) => {
//       const srcPost = posts.find(p => p.id === fq.postId);
//       if (srcPost?.userPredictionVotes?.[fq.qIdx] !== undefined) {
//         const v = srcPost.userPredictionVotes[fq.qIdx];
//         const oIdx = typeof v === "number" ? v : parseInt(String(v).replace(/[^0-9]/g, ""));
//         if (!isNaN(oIdx)) saved[fq.globalIdx] = oIdx;
//       } else if (srcPost?.userVote && fq.qIdx === 0) {
//         const v = srcPost.userVote as string;
//         const optIdx = v === "agree" ? 0 : v === "disagree" ? 1 :
//           v.startsWith("option_") ? parseInt(v.replace("option_", "")) : -1;
//         if (optIdx >= 0) saved[fq.globalIdx] = optIdx;
//       }
//     });
//     return saved;
//   });

//   const [hasVotedMap, setHasVotedMap] = useState<Record<number, boolean>>(() => {
//     const saved: Record<number, boolean> = {};
//     flatQuestions.forEach((fq) => {
//       const srcPost = posts.find(p => p.id === fq.postId);
//       if (srcPost?.userPredictionVotes?.[fq.qIdx] !== undefined) {
//         saved[fq.globalIdx] = true;
//       } else if (srcPost?.userVote && fq.qIdx === 0) {
//         saved[fq.globalIdx] = true;
//       }
//     });
//     return saved;
//   });

//   const [votingInProgress, setVotingInProgress] = useState<Record<number, boolean>>({});
//   const [slide, setSlide] = useState(0);
//   const [nowMs, setNowMs] = useState(Date.now());
//   const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   useEffect(() => {
//     const id = setInterval(() => setNowMs(Date.now()), 1000);
//     return () => clearInterval(id);
//   }, []);

//   const isQuestionExpired = (fq: FlatQuestion) =>
//     fq.closesAt > 0 && nowMs > fq.closesAt;

//   const isAllExpired = flatQuestions.length > 0 && flatQuestions.every(isQuestionExpired);

//   const msLeft = Math.max(0, overallClosesAt - nowMs);
//   const hasValidTimer = overallClosesAt > 0;

//   const formatTimer = (ms: number) => {
//     if (ms <= 0) return "00:00";
//     const s = Math.floor(ms / 1000);
//     const h = Math.floor(s / 3600);
//     const m = Math.floor((s % 3600) / 60);
//     const rem = s % 60;
//     if (h > 0)
//       return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
//     return `${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
//   };

//   const expiredQuestions = flatQuestions.filter(isQuestionExpired);
//   useEffect(() => {
//     if (!isAllExpired || !expanded || expiredQuestions.length <= 1) {
//       if (autoSlideRef.current) clearInterval(autoSlideRef.current);
//       return;
//     }
//     autoSlideRef.current = setInterval(
//       () => setSlide(s => (s + 1) % expiredQuestions.length),
//       3000
//     );
//     return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
//   }, [isAllExpired, expanded, expiredQuestions.length]);

//   const stopAutoSlide = () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };

//   const handleVote = async (globalIdx: number, fq: FlatQuestion, optIdx: number) => {
//     if (hasVotedMap[globalIdx] || isQuestionExpired(fq) || votingInProgress[globalIdx]) {
//       return;
//     }

//     setHasVotedMap(prev => ({ ...prev, [globalIdx]: true }));
//     setUserVotes(prev => ({ ...prev, [globalIdx]: optIdx }));
//     setVotingInProgress(prev => ({ ...prev, [globalIdx]: true }));

//     const voteValue = optIdx === 0 ? "agree" : optIdx === 1 ? "disagree" : `option_${optIdx}`;
//     try {
//       await axios.post(`/api/roar/rooms/${roomId}/messages/${fq.postId}/vote`, {
//         vote: voteValue,
//         questionIndex: fq.qIdx,
//       });
//       onToast("Vote submitted!");
//     } catch (err: any) {
//       const status = err?.response?.status;
//       if (status !== 409 && status !== 400) {
//         setHasVotedMap(prev => { const n = { ...prev }; delete n[globalIdx]; return n; });
//         setUserVotes(prev => { const n = { ...prev }; delete n[globalIdx]; return n; });
//         onToast("Failed to submit vote");
//       } else {
//         onToast("You've already voted on this question");
//       }
//     } finally {
//       setVotingInProgress(prev => ({ ...prev, [globalIdx]: false }));
//     }
//   };

//   const getCount = (fq: FlatQuestion, optIdx: number): number => {
//     if (optIdx === 0) return fq.agreeCount ?? 0;
//     if (optIdx === 1) return fq.disagreeCount ?? 0;
//     return fq.predictionOptionCounts?.[`option_${optIdx}`] ?? 0;
//   };

//   const getTotal = (fq: FlatQuestion): number =>
//     (fq.options ?? []).reduce((sum, _, i) => sum + getCount(fq, i), 0);

//   const getPct = (fq: FlatQuestion, optIdx: number): number => {
//     const total = getTotal(fq);
//     if (total === 0) return 0;
//     return Math.round((getCount(fq, optIdx) / total) * 100);
//   };

//   const getOptText = (opt: any): string => {
//     if (!opt) return "";
//     if (typeof opt === "string") return opt;
//     return opt.text || opt.label || opt.name || opt.value || "";
//   };

//   const getOptEmoji = (opt: any): string => {
//     if (!opt) return "";
//     return opt.emoji || "";
//   };

//   const hasUserVoted = (globalIdx: number): boolean => {
//     return hasVotedMap[globalIdx] || userVotes[globalIdx] !== undefined;
//   };

//   const lo = localReactions[latestPost?.id];
//   const currentReaction: Reaction | null = lo !== undefined ? lo.reaction : (latestPost?.userReaction ?? null);
//   const heartCount = lo !== undefined ? lo.heartCount : (latestPost?.heartCount ?? 0);
//   const topReactions = topReactionsMap[latestPost?.id] ?? [];
//   if (topReactions.length === 0 && latestPost?.id && !topReactionsCache.current[latestPost.id]) {
//     fetchTopReactions(latestPost.id);
//   }
//   const displayReactions = topReactions.length > 0 ? topReactions : currentReaction ? [currentReaction] : [];
//   const isInlineOpen = openInlinePostId === latestPost?.id;

//   const payload = {
//     id: latestPost?.id, text: `Predictions Live — ${matchTitle}`,
//     fan: latestPost?.fan, timeAgo: latestPost?.timeAgo, createdAt: latestPost?.createdAt,
//     type: "predictions_live", isDbPost: true, roomId,
//   };

//   if (!latestPost || flatQuestions.length === 0) return null;

//   // ── COLLAPSED BANNER ──────────────────────────────────────────────────────
//   if (!expanded) {
//     return (
//       <div onClick={() => setExpanded(true)} style={{
//         padding: "9px 16px", background: isAllExpired ? "rgba(249,115,22,0.07)" : "rgba(14,14,20,0.98)",
//         borderBottom: "1px solid rgba(255,255,255,0.08)",
//         display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
//       }}>
//         <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: isAllExpired ? "#f97316" : "#22c55e", boxShadow: isAllExpired ? "none" : "0 0 6px #22c55e" }} />
//         <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.07em", color: isAllExpired ? "#f97316" : "#22c55e" }}>
//           {isAllExpired ? "⚡ RESULTS" : "PREDICTIONS LIVE"}
//         </span>
//         <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
//           🏏 {matchTitle} · {totalPolls} poll{totalPolls !== 1 ? "s" : ""}
//         </span>
//         {hasValidTimer && (
//           <span style={{
//             marginLeft: "auto",
//             display: "flex",
//             alignItems: "center",
//             gap: 3,
//             fontSize: 10,
//             fontWeight: 800,
//             color: isAllExpired ? "#f97316" : "rgba(255,255,255,0.55)",
//             background: "rgba(255,255,255,0.06)",
//             padding: "2px 7px",
//             borderRadius: 999
//           }}>
//             <Clock size={9} />
//             {isAllExpired ? "Closed" : formatTimer(msLeft)}
//           </span>
//         )}
//         {!hasValidTimer && (
//           <span style={{
//             marginLeft: "auto",
//             display: "flex",
//             alignItems: "center",
//             gap: 3,
//             fontSize: 10,
//             fontWeight: 800,
//             color: "rgba(255,255,255,0.3)",
//             background: "rgba(255,255,255,0.04)",
//             padding: "2px 7px",
//             borderRadius: 999
//           }}>
//             <Clock size={9} /> No timer set
//           </span>
//         )}
//         <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, marginLeft: 4 }} />
//       </div>
//     );
//   }

//   // ── EXPANDED PANEL ────────────────────────────────────────────────────────
//   return (
//     <div style={{ background: "#111118", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

//       {/* Header */}
//       <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
//         <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isAllExpired ? "#f97316" : "#22c55e", boxShadow: isAllExpired ? "none" : "0 0 6px #22c55e" }} />
//         <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.05em", color: isAllExpired ? "#f97316" : "#22c55e" }}>
//           {isAllExpired ? "⚡ RESULTS" : "PREDICTIONS LIVE"}
//         </span>
//         <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
//           🏏 {matchTitle} · {totalPolls}
//         </span>
//         <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
//           {hasValidTimer && !isAllExpired && msLeft > 0 && (
//             <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 999 }}>
//               <Clock size={10} /> {formatTimer(msLeft)}
//             </span>
//           )}
//           {hasValidTimer && isAllExpired && (
//             <span style={{ fontSize: 10, fontWeight: 600, color: "#f97316" }}>Closed</span>
//           )}
//           {!hasValidTimer && (
//             <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.2)" }}>No timer</span>
//           )}
//           <button onClick={() => setExpanded(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 2, display: "flex" }}>
//             <ChevronUp size={14} />
//           </button>
//         </div>
//       </div>

//       {/* Body */}
//       {isAllExpired ? (
//         // ── RESULTS VIEW ── (single bar, tight spacing — matches reference)
//         <div style={{ padding: "10px 14px 8px" }}>
//           {expiredQuestions.length > 0 && (() => {
//             const fq = expiredQuestions[slide];
//             if (!fq) return null;

//             const optA = fq.options[0];
//             const optB = fq.options[1];

//             const total = getTotal(fq);
//             const pctA = getPct(fq, 0);
//             const pctB = getPct(fq, 1);

//             const isWinnerA = pctA >= pctB && total > 0;
//             const isWinnerB = pctB >= pctA && total > 0;

//             const userVoteA = userVotes[fq.globalIdx] === 0;
//             const userVoteB = userVotes[fq.globalIdx] === 1;

//             return (
//               <>
//                 {/* Question + your vote badge */}
//                 <div className="flex items-center gap-1.5 mb-1.5">
//                   <p className="m-0 text-[12.5px] font-bold text-white flex-1 min-w-0 leading-tight">
//                     {fq.question}
//                   </p>
//                   {(userVoteA || userVoteB) && (
//                     <span className="flex-shrink-0 text-[10px] font-semibold text-green-500 whitespace-nowrap">
//                       ✓ You: {userVoteA ? getOptText(optA) : getOptText(optB)}
//                     </span>
//                   )}
//                 </div>

//                 {/* Labels row */}
//                 <div className="flex items-center justify-between mb-1">
//                   <span className={`flex items-center gap-1 text-[11px] font-bold ${isWinnerA ? "text-green-500" : "text-white/65"}`}>
//                     {getOptEmoji(optA)} {getOptText(optA)}
//                   </span>
//                   <span className={`flex items-center gap-1 text-[11px] font-bold ${isWinnerB ? "text-green-500" : "text-white/65"}`}>
//                     {getOptText(optB)} {getOptEmoji(optB)}
//                   </span>
//                 </div>

//                 {/* Minimal progress bar */}
//                 <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden flex">
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${pctA}%` }}
//                     transition={{ duration: 0.4, ease: "easeOut" }}
//                     className={`h-full ${isWinnerA ? "bg-green-500" : "bg-white/20"}`}
//                   />
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${pctB}%` }}
//                     transition={{ duration: 0.4, ease: "easeOut" }}
//                     className={`h-full ${isWinnerB ? "bg-green-500" : "bg-white/20"}`}
//                   />
//                 </div>

//                 {/* Vote count centered below bar */}
//                 <p className="m-0 mt-1 text-[9px] font-medium text-white/40 text-center">
//                   {total.toLocaleString()} voted
//                 </p>

//                 {/* Percentages row */}
//                 <div className="flex items-center justify-between mt-0.5">
//                   <span className={`text-[13px] font-extrabold ${isWinnerA ? "text-green-500" : "text-white/40"}`}>
//                     {pctA}%
//                   </span>
//                   <span className={`text-[13px] font-extrabold ${isWinnerB ? "text-green-500" : "text-white/40"}`}>
//                     {pctB}%
//                   </span>
//                 </div>

//                 {/* Navigation */}
//                 {expiredQuestions.length > 1 && (
//                   <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
//                     <button
//                       onClick={() => { stopAutoSlide(); setSlide(s => Math.max(0, s - 1)); }}
//                       disabled={slide === 0}
//                       className={`bg-transparent border-none text-[10px] font-semibold px-2 py-1 rounded-md ${slide === 0 ? "text-white/15 cursor-default" : "text-white/40 cursor-pointer"}`}
//                     >
//                       ‹ Prev
//                     </button>
//                     <span className="text-[9px] font-medium text-white/30">
//                       {slide + 1}/{expiredQuestions.length} · auto-sliding
//                     </span>
//                     <button
//                       onClick={() => { stopAutoSlide(); setSlide(s => Math.min(expiredQuestions.length - 1, s + 1)); }}
//                       disabled={slide === expiredQuestions.length - 1}
//                       className={`bg-transparent border-none text-[10px] font-semibold px-2 py-1 rounded-md ${slide === expiredQuestions.length - 1 ? "text-white/15 cursor-default" : "text-white/40 cursor-pointer"}`}
//                     >
//                       Next ›
//                     </button>
//                   </div>
//                 )}
//               </>
//             );
//           })()}
//         </div>
//       ) : (
//         // ── VOTING VIEW ──
//         <div style={{ maxHeight: 320, overflowY: "auto" }}>
//           {flatQuestions.map((fq) => {
//             const expired = isQuestionExpired(fq);
//             const voted = hasUserVoted(fq.globalIdx);
//             const inProgress = votingInProgress[fq.globalIdx];

//             return (
//               <div key={`${fq.postId}-${fq.qIdx}`} style={{
//                 display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
//                 borderBottom: fq.globalIdx < flatQuestions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
//                 opacity: expired ? 0.4 : 1,
//               }}>
//                 <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#fff", flex: 1, lineHeight: 1.3, minWidth: 0 }}>
//                   {fq.question}
//                   {voted && (
//                     <span style={{ marginLeft: 4, fontSize: 8, color: "#22c55e", fontWeight: 700 }}>✓</span>
//                   )}
//                 </p>
//                 <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
//                   {fq.options.slice(0, 2).map((opt, optIdx) => {
//                     const isActive = userVotes[fq.globalIdx] === optIdx;
//                     const isDisabled = voted || inProgress || expired;
//                     return (
//                       <React.Fragment key={`${fq.globalIdx}-${optIdx}`}>
//                         {optIdx === 1 && (
//                           <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>vs</span>
//                         )}
//                         <motion.button
//                           whileTap={!isDisabled ? { scale: 0.93 } : {}}
//                           onClick={() => !isDisabled && handleVote(fq.globalIdx, fq, optIdx)}
//                           disabled={isDisabled}
//                           style={{
//                             padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
//                             cursor: isDisabled ? "default" : "pointer",
//                             border: isActive ? "1.5px solid #e91e8c" : "1.5px solid rgba(255,255,255,0.1)",
//                             background: isActive ? "rgba(233,30,140,0.15)" : "rgba(255,255,255,0.03)",
//                             color: isActive ? "#fff" : isDisabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
//                             boxShadow: isActive ? "0 0 8px rgba(233,30,140,0.2)" : "none",
//                             transition: "all 0.15s", whiteSpace: "nowrap",
//                             opacity: isDisabled && !isActive ? 0.4 : 1,
//                           }}
//                         >
//                           {isActive ? `✓ ${getOptText(opt)}` : getOptText(opt)}
//                         </motion.button>
//                       </React.Fragment>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//           <p style={{ margin: 0, padding: "6px 14px 8px", fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
//             {flatQuestions.some((fq) => !hasUserVoted(fq.globalIdx)) ? "Vote · results when closed" : "✓ Voted on all"}
//           </p>
//         </div>
//       )}

//       {/* Reactions + Comments */}
//       <div style={{ padding: "6px 14px 10px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
//         <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//           <div onClick={e => e.stopPropagation()}>
//             <ReactionPicker currentReaction={currentReaction} count={heartCount} onReact={r => handleReact(latestPost.id, r)} />
//           </div>
//           <button onClick={e => { e.stopPropagation(); setOpenInlinePostId(isInlineOpen ? null : latestPost.id); }}
//             style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: isInlineOpen ? ACCENT : "#9494ad", fontSize: 12, fontWeight: 600, padding: 0, transition: "color 0.15s" }}>
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//             </svg>
//             <span style={{ fontSize: 11 }}>{latestPost.replyCount ?? 0}</span>
//             {isInlineOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
//           </button>
//           {displayReactions.length > 0 && heartCount > 0 && (
//             <motion.button whileTap={{ scale: 0.93 }}
//               onClick={e => { e.stopPropagation(); setReactionsMsgId(latestPost.id); }}
//               style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", marginLeft: "auto", padding: 0 }}>
//               <div style={{ display: "flex" }}>
//                 {displayReactions.map((type: string, i: number) => (
//                   <div key={type} style={{ width: 18, height: 18, borderRadius: "50%", background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, marginLeft: i === 0 ? 0 : -5, zIndex: displayReactions.length - i, position: "relative" }}>
//                     {REACTION_EMOJI[type] ?? "❤️"}
//                   </div>
//                 ))}
//               </div>
//             </motion.button>
//           )}
//         </div>
//         <AnimatePresence>
//           {isInlineOpen && roomId && (
//             <InlineSection key={`inline-plive-${latestPost.id}`}
//               postId={latestPost.id} roomId={roomId} isOpen={isInlineOpen}
//               onOpenFull={() => { setOpenInlinePostId(null); onPostClick?.(payload); }}
//               accentColor={ACCENT} currentAvatarUrl={currentAvatarUrl}
//               onCommentPosted={() => onToast("Comment posted!")} />
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }




// components/PredictionsLivePanel.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Clock, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";
import ReactionPicker, { type Reaction } from "./ReactionPicker";
import InlineSection from "./InlineSection";

const REACTION_EMOJI: Record<string, string> = {
  fire: "🔥", heart: "❤️", mindblown: "🤯", goat: "🐐",
  clap: "👏", nochance: "🙅", laugh: "😂", sad: "😢", thumb: "👍",
};

const ACCENT = "#e91e8c";

// Backend stores votes as "agree" (option 0), "disagree" (option 1), or
// "option_N" (N >= 2). Convert that back to a flat option index so the UI
// can highlight/disable the right button after a refresh.
function voteValueToOptionIndex(v: string): number {
  if (v === "agree") return 0;
  if (v === "disagree") return 1;
  const match = /^option_(\d+)$/.exec(v);
  return match ? Number(match[1]) : -1;
}

// ── Client-side safety net ──────────────────────────────────────────────────
// The server is the source of truth (via userPredictionVotes coming back from
// GET /messages), but that requires the backend + DiscussionRoom wiring to be
// deployed. Until then — or on top of it — cache each vote in localStorage the
// moment it's cast, keyed by post+question, so a refresh can never re-enable
// a button the user already voted on, even if the server round-trip for that
// vote hasn't propagated back through props yet.
const VOTE_STORAGE_PREFIX = "plive_vote_";

function getStoredVote(postId: string, qIdx: number): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(`${VOTE_STORAGE_PREFIX}${postId}_${qIdx}`);
  } catch {
    return null;
  }
}

function setStoredVote(postId: string, qIdx: number, vote: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${VOTE_STORAGE_PREFIX}${postId}_${qIdx}`, vote);
  } catch {
    // localStorage unavailable (private mode, quota, etc) — safe to ignore,
    // the server-side check in the vote route still prevents a double count.
  }
}

function clearStoredVote(postId: string, qIdx: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${VOTE_STORAGE_PREFIX}${postId}_${qIdx}`);
  } catch {
    // ignore
  }
}

function computeAllVotedFromPersisted(posts: any[], flatQuestions: FlatQuestion[]): boolean {
  if (flatQuestions.length === 0) return false;
  return flatQuestions.every((fq) => {
    const srcPost = posts.find(p => p.id === fq.postId);
    const serverVote = srcPost?.userPredictionVotes?.[fq.qIdx];
    const localVote = getStoredVote(fq.postId, fq.qIdx);
    return serverVote !== undefined || localVote !== null;
  });
}


interface FlatQuestion {
  question: string;
  options: { text: string; emoji?: string }[];
  postId: string;
  qIdx: number;
  globalIdx: number;
  closesAt: number;
  userVote?: string | null;
  agreeCount?: number;
  disagreeCount?: number;
  predictionOptionCounts?: Record<string, number>;
}

interface PredictionsLivePanelProps {
  posts: any[];
  roomId: string;
  onToast: (m: string) => void;
  openInlinePostId: string | null;
  setOpenInlinePostId: (id: string | null) => void;
  currentAvatarUrl?: string;
  handleReact: (msgId: string, reaction: Reaction | null) => void;
  localReactions: Record<string, { reaction: Reaction | null; heartCount: number }>;
  pendingReactRef: React.MutableRefObject<Record<string, boolean>>;
  onPostClick?: (post: any) => void;
  onFanProfile?: (fan: any) => void;
  setReactionsMsgId: (id: string | null) => void;
  topReactionsMap: Record<string, string[]>;
  topReactionsCache: React.MutableRefObject<Record<string, string[]>>;
  fetchTopReactions: (msgId: string) => void;
}

export default function PredictionsLivePanel({
  posts, roomId, onToast,
  openInlinePostId, setOpenInlinePostId,
  currentAvatarUrl, handleReact, localReactions, pendingReactRef,
  onPostClick, onFanProfile, setReactionsMsgId,
  topReactionsMap, topReactionsCache, fetchTopReactions,
}: PredictionsLivePanelProps) {
  const latestPost = posts[0];
  const matchTitle: string = latestPost?.matchTitle ?? "LIVE";
  const matchStartAt: number | null = latestPost?.matchStartAt ?? null;


  const flatQuestions: FlatQuestion[] = posts.flatMap((p, _pi) => {
    const qs: { question: string; options: { text: string; emoji?: string }[] }[] =
      Array.isArray(p.questions) ? p.questions : [];
    return qs.map((q, qIdx) => ({
      question: q.question,
      options: q.options ?? [],
      postId: p.id,
      qIdx,
      globalIdx: 0,
      closesAt: p.closesAt ?? 0,
      userVote: p.userVote ?? null,
      agreeCount: p.agreeCount ?? 0,
      disagreeCount: p.disagreeCount ?? 0,
      predictionOptionCounts: p.predictionOptionCounts ?? {},
    }));
  }).map((q, i) => ({ ...q, globalIdx: i }));

  const totalPolls = flatQuestions.length;

  const allClosesAt = posts.map(p => p.closesAt).filter((v): v is number => typeof v === 'number' && v > 0);
  const overallClosesAt = allClosesAt.length > 0 ? Math.min(...allClosesAt) : 0;

  // const [expanded, setExpanded] = useState(true);
  const userToggledRef = useRef(false);
const nowMsRef = useRef(Date.now());

const [expanded, setExpanded] = useState<boolean>(() =>{
  // matchStartAt ? Date.now() < matchStartAt : true
if (computeAllVotedFromPersisted(posts, flatQuestions)) return false;
  return matchStartAt ? Date.now() < matchStartAt : true;
});

  const [userVotes, setUserVotes] = useState<Record<number, number>>(() => {
    const saved: Record<number, number> = {};
    flatQuestions.forEach((fq) => {
      const srcPost = posts.find(p => p.id === fq.postId);
      const serverVote = srcPost?.userPredictionVotes?.[fq.qIdx];
      const localVote = getStoredVote(fq.postId, fq.qIdx);
      const savedVote = serverVote ?? localVote ?? undefined;
      if (savedVote !== undefined) {
        const optIdx = voteValueToOptionIndex(savedVote);
        if (optIdx >= 0) saved[fq.globalIdx] = optIdx;
      }
    });
    return saved;
  });

  const [hasVotedMap, setHasVotedMap] = useState<Record<number, boolean>>(() => {
    const saved: Record<number, boolean> = {};
    flatQuestions.forEach((fq) => {
      const srcPost = posts.find(p => p.id === fq.postId);
      const serverVote = srcPost?.userPredictionVotes?.[fq.qIdx];
      const localVote = getStoredVote(fq.postId, fq.qIdx);
      if (serverVote !== undefined || localVote !== null) {
        saved[fq.globalIdx] = true;
      }
    });
    return saved;
  });

  const [votingInProgress, setVotingInProgress] = useState<Record<number, boolean>>({});
  const [slide, setSlide] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // useEffect(() => {
  //   const id = setInterval(() => setNowMs(Date.now()), 1000);
  //   return () => clearInterval(id);
  // }, []);


  const isQuestionExpired = (fq: FlatQuestion) =>
    fq.closesAt > 0 && nowMs > fq.closesAt;

  const isAllExpired = flatQuestions.length > 0 && flatQuestions.every(isQuestionExpired);

  const msLeft = Math.max(0, overallClosesAt - nowMs);
  const hasValidTimer = overallClosesAt > 0;

  const formatTimer = (ms: number) => {
    if (ms <= 0) return "00:00";
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rem = s % 60;
    if (h > 0)
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  const expiredQuestions = flatQuestions.filter(isQuestionExpired);
  useEffect(() => {
    if (!isAllExpired || !expanded || expiredQuestions.length <= 1) {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
      return;
    }
    autoSlideRef.current = setInterval(
      () => setSlide(s => (s + 1) % expiredQuestions.length),
      3000
    );
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };
  }, [isAllExpired, expanded, expiredQuestions.length]);

  const stopAutoSlide = () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current); };

  const autoCollapsedRef = useRef(false);

  const allVoted = flatQuestions.length > 0 && flatQuestions.every(fq => hasVotedMap[fq.globalIdx] || userVotes[fq.globalIdx] !== undefined);

  useEffect(() => {
    if (allVoted) {
      if (!autoCollapsedRef.current) {
        const timer = setTimeout(() => {
          setExpanded(false);
          autoCollapsedRef.current = true;
        }, 2200);
        return () => clearTimeout(timer);
      }
    } else {
      autoCollapsedRef.current = false;
    }
  }, [allVoted]);


 useEffect(() => {
  const id = setInterval(() => {
    const now = Date.now();
    setNowMs(now);
    nowMsRef.current = now;

    // Voting completion always wins — never force this panel open, whether
    // pre-match or post-match, once the fan has answered everything.
    if (allVoted) return;

    if (!userToggledRef.current && matchStartAt) {
      const shouldBeExpanded = now < matchStartAt;
      setExpanded(prev => (prev !== shouldBeExpanded ? shouldBeExpanded : prev));
    }
  }, 1000);
  return () => clearInterval(id);
}, [matchStartAt, allVoted]);

  // If server-side userPredictionVotes arrives/updates after the initial
  // render (e.g. the backend fix propagates via a later poll), fold it in —
  // without overwriting anything we already know locally.
  useEffect(() => {
    setHasVotedMap(prev => {
      let changed = false;
      const next = { ...prev };
      flatQuestions.forEach((fq) => {
        if (next[fq.globalIdx]) return;
        const srcPost = posts.find(p => p.id === fq.postId);
        const serverVote = srcPost?.userPredictionVotes?.[fq.qIdx];
        const localVote = getStoredVote(fq.postId, fq.qIdx);
        if (serverVote !== undefined || localVote !== null) {
          next[fq.globalIdx] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    setUserVotes(prev => {
      let changed = false;
      const next = { ...prev };
      flatQuestions.forEach((fq) => {
        if (next[fq.globalIdx] !== undefined) return;
        const srcPost = posts.find(p => p.id === fq.postId);
        const serverVote = srcPost?.userPredictionVotes?.[fq.qIdx];
        const localVote = getStoredVote(fq.postId, fq.qIdx);
        const savedVote = serverVote ?? localVote ?? undefined;
        if (savedVote !== undefined) {
          const optIdx = voteValueToOptionIndex(savedVote);
          if (optIdx >= 0) { next[fq.globalIdx] = optIdx; changed = true; }
        }
      });
      return changed ? next : prev;
    });
    // Re-sync whenever the underlying posts (and therefore flatQuestions) change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const handleVote = async (globalIdx: number, fq: FlatQuestion, optIdx: number) => {
    if (hasVotedMap[globalIdx] || isQuestionExpired(fq) || votingInProgress[globalIdx]) {
      return;
    }

    setHasVotedMap(prev => ({ ...prev, [globalIdx]: true }));
    setUserVotes(prev => ({ ...prev, [globalIdx]: optIdx }));
    setVotingInProgress(prev => ({ ...prev, [globalIdx]: true }));

    const voteValue = optIdx === 0 ? "agree" : optIdx === 1 ? "disagree" : `option_${optIdx}`;
    // Cache immediately — don't wait on the network round-trip — so a refresh
    // right after clicking still sees this question as answered.
    setStoredVote(fq.postId, fq.qIdx, voteValue);
    try {
      await axios.post(`/api/roar/rooms/${roomId}/messages/${fq.postId}/vote`, {
        vote: voteValue,
        questionIndex: fq.qIdx,
      });
      onToast("Vote submitted!");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 409 && status !== 400) {
        setHasVotedMap(prev => { const n = { ...prev }; delete n[globalIdx]; return n; });
        setUserVotes(prev => { const n = { ...prev }; delete n[globalIdx]; return n; });
        clearStoredVote(fq.postId, fq.qIdx);
        onToast("Failed to submit vote");
      } else {
        onToast("You've already voted on this question");
      }
    } finally {
      setVotingInProgress(prev => ({ ...prev, [globalIdx]: false }));
    }
  };

  const getCount = (fq: FlatQuestion, optIdx: number): number => {
    const voteValue = optIdx === 0 ? "agree" : optIdx === 1 ? "disagree" : `option_${optIdx}`;
    return fq.predictionOptionCounts?.[`q${fq.qIdx}_${voteValue}`] ?? 0;
  };

  const getTotal = (fq: FlatQuestion): number =>
    (fq.options ?? []).reduce((sum, _, i) => sum + getCount(fq, i), 0);

  const getPct = (fq: FlatQuestion, optIdx: number): number => {
    const total = getTotal(fq);
    if (total === 0) return 0;
    return Math.round((getCount(fq, optIdx) / total) * 100);
  };

  const getOptText = (opt: any): string => {
    if (!opt) return "";
    if (typeof opt === "string") return opt;
    return opt.text || opt.label || opt.name || opt.value || "";
  };

  const getOptEmoji = (opt: any): string => {
    if (!opt) return "";
    return opt.emoji || "";
  };

  const hasUserVoted = (globalIdx: number): boolean => {
    return hasVotedMap[globalIdx] || userVotes[globalIdx] !== undefined;
  };

  const lo = localReactions[latestPost?.id];
  const currentReaction: Reaction | null = lo !== undefined ? lo.reaction : (latestPost?.userReaction ?? null);
  const heartCount = lo !== undefined ? lo.heartCount : (latestPost?.heartCount ?? 0);
  const topReactions = topReactionsMap[latestPost?.id] ?? [];
  if (topReactions.length === 0 && latestPost?.id && !topReactionsCache.current[latestPost.id]) {
    fetchTopReactions(latestPost.id);
  }
  const displayReactions = topReactions.length > 0 ? topReactions : currentReaction ? [currentReaction] : [];
  const isInlineOpen = openInlinePostId === latestPost?.id;

  const payload = {
    id: latestPost?.id, text: `Predictions Live — ${matchTitle}`,
    fan: latestPost?.fan, timeAgo: latestPost?.timeAgo, createdAt: latestPost?.createdAt,
    type: "predictions_live", isDbPost: true, roomId,
  };

  if (!latestPost || flatQuestions.length === 0) return null;

  // ── COLLAPSED BANNER ──────────────────────────────────────────────────────
  if (!expanded) {
    return (
     <button onClick={() => { userToggledRef.current = true; setExpanded(true); }} style={{
        padding: "9px 16px", background: isAllExpired ? "rgba(249,115,22,0.07)" : "rgba(14,14,20,0.98)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
       }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: isAllExpired ? "#f97316" : "#22c55e", boxShadow: isAllExpired ? "none" : "0 0 6px #22c55e" }} />
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.07em", color: isAllExpired ? "#f97316" : "#22c55e" }}>
          {isAllExpired ? "RESULTS" : "PREDICTIONS LIVE"}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
           {totalPolls} poll{totalPolls !== 1 ? "s" : ""}
        </span>
        {hasValidTimer && (
          <span style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 10,
            fontWeight: 800,
            color: isAllExpired ? "#f97316" : "rgba(255,255,255,0.55)",
            background: "rgba(255,255,255,0.06)",
            padding: "2px 7px",
            borderRadius: 999
          }}>
            <Clock size={9} />
            {isAllExpired ? "Closed" : formatTimer(msLeft)}
          </span>
        )}
        {!hasValidTimer && (
          <span style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 10,
            fontWeight: 800,
            color: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.04)",
            padding: "2px 7px",
            borderRadius: 999
          }}>
            <Clock size={9} /> No timer set
          </span>
        )}
        <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, marginLeft: 4 }} />
      </button>
    );
  }

  // ── EXPANDED PANEL ────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#111118", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

      {/* Header */}
      <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isAllExpired ? "#f97316" : "#22c55e", boxShadow: isAllExpired ? "none" : "0 0 6px #22c55e" }} />
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.05em", color: isAllExpired ? "#f97316" : "#22c55e" }}>
          {isAllExpired ? "RESULTS" : "PREDICTIONS LIVE"}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
          {totalPolls} polls
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {hasValidTimer && !isAllExpired && msLeft > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 999 }}>
              <Clock size={10} /> {formatTimer(msLeft)}
            </span>
          )}
          {hasValidTimer && isAllExpired && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "#f97316" }}>Closed</span>
          )}
          {!hasValidTimer && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.2)" }}>No timer</span>
          )}
          <button onClick={() => { userToggledRef.current = true; setExpanded(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 2, display: "flex" }}>
            <ChevronUp size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      {isAllExpired ? (
        // ── RESULTS VIEW ── (single bar, tight spacing — matches reference)
        <div style={{ padding: "6px 14px 4px" }}>
          {expiredQuestions.length > 0 && (() => {
            const fq = expiredQuestions[slide];
            if (!fq) return null;

            const optA = fq.options[0];
            const optB = fq.options[1];

            const total = getTotal(fq);
            const pctA = getPct(fq, 0);
            const pctB = getPct(fq, 1);

            const isWinnerA = pctA >= pctB && total > 0;
            const isWinnerB = pctB >= pctA && total > 0;

            const userVoteA = userVotes[fq.globalIdx] === 0;
            const userVoteB = userVotes[fq.globalIdx] === 1;

            return (
              <>
                {/* Question + your vote badge */}
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="m-0 text-[12.5px] font-bold text-white flex-1 min-w-0 leading-tight">
                    {fq.question}
                  </p>
                  {(userVoteA || userVoteB) && (
                    <span className="flex-shrink-0 text-[10px] font-semibold text-green-500 whitespace-nowrap">
                      ✓ You: {userVoteA ? getOptText(optA) : getOptText(optB)}
                    </span>
                  )}
                </div>

                {/* Labels row */}
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${isWinnerA ? "text-green-500" : "text-white/65"}`}>
                    {getOptEmoji(optA)} {getOptText(optA)}
                  </span>
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${isWinnerB ? "text-green-500" : "text-white/65"}`}>
                    {getOptText(optB)} {getOptEmoji(optB)}
                  </span>
                </div>

                {/* Minimal progress bar */}
                <div className="relative h-0.5 rounded-full bg-white/10 overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pctA}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`h-full ${isWinnerA ? "bg-green-500" : "bg-white/20"}`}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pctB}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`h-full ${isWinnerB ? "bg-green-500" : "bg-white/20"}`}
                  />
                </div>

                {/* Vote count centered below bar */}
                <p className="m-0 mt-0.5 text-[9px] font-medium text-white/40 text-center leading-tight">
                  {total.toLocaleString()} voted
                </p>

                {/* Percentages row */}
                <div className="flex items-center justify-between -mt-2">
                  <span className={`text-[10px] font-extrabold ${isWinnerA ? "text-green-500" : "text-white/40"}`}>
                    {pctA}%
                  </span>
                  <span className={`text-[10px] font-extrabold ${isWinnerB ? "text-green-500" : "text-white/40"}`}>
                    {pctB}%
                  </span>
                </div>

                {/* Navigation */}
                {expiredQuestions.length > 1 && (
                  <div className="flex items-center justify-between mt-0.5 pt-0.5 border-t border-white/5">
                    <button
                      onClick={() => { stopAutoSlide(); setSlide(s => Math.max(0, s - 1)); }}
                      disabled={slide === 0}
                      className={`bg-transparent border-none text-[10px] font-semibold px-2 py-0 rounded-md ${slide === 0 ? "text-white/15 cursor-default" : "text-white/40 cursor-pointer"}`}
                    >
                      ‹ Prev
                    </button>
                    <span className="text-[9px] font-medium text-white/30">
                      {slide + 1}/{expiredQuestions.length} · auto-sliding
                    </span>
                    <button
                      onClick={() => { stopAutoSlide(); setSlide(s => Math.min(expiredQuestions.length - 1, s + 1)); }}
                      disabled={slide === expiredQuestions.length - 1}
                      className={`bg-transparent border-none text-[10px] font-semibold px-2 py-0 rounded-md ${slide === expiredQuestions.length - 1 ? "text-white/15 cursor-default" : "text-white/40 cursor-pointer"}`}
                    >
                      Next ›
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        // ── VOTING VIEW ──
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {flatQuestions.map((fq) => {
            const expired = isQuestionExpired(fq);
            const voted = hasUserVoted(fq.globalIdx);
            const inProgress = votingInProgress[fq.globalIdx];

            return (
              <div key={`${fq.postId}-${fq.qIdx}`} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3" style={{
                padding: "9px 14px",
                borderBottom: fq.globalIdx < flatQuestions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                opacity: expired ? 0.4 : 1,
              }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#fff", flex: 1, lineHeight: 1.3, minWidth: 0 }}>
                  {fq.question}
                  {voted && (
                    <span style={{ marginLeft: 4, fontSize: 8, color: "#22c55e", fontWeight: 700 }}>✓</span>
                  )}
                </p>
                <div className="flex items-center flex-wrap gap-1 shrink-0 self-start sm:self-auto" style={{ gap: 4 }}>
                  {fq.options.slice(0, 2).map((opt, optIdx) => {
                    const isActive = userVotes[fq.globalIdx] === optIdx;
                    const isDisabled = voted || inProgress || expired;
                    return (
                      <React.Fragment key={`${fq.globalIdx}-${optIdx}`}>
                        {optIdx === 1 && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>vs</span>
                        )}
                        <motion.button
                          whileTap={!isDisabled ? { scale: 0.93 } : {}}
                          onClick={() => !isDisabled && handleVote(fq.globalIdx, fq, optIdx)}
                          disabled={isDisabled}
                          style={{
                            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                            cursor: isDisabled ? "default" : "pointer",
                            border: isActive ? "1.5px solid #e91e8c" : "1.5px solid rgba(255,255,255,0.1)",
                            background: isActive ? "rgba(233,30,140,0.15)" : "rgba(255,255,255,0.03)",
                            color: isActive ? "#fff" : isDisabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
                            boxShadow: isActive ? "0 0 8px rgba(233,30,140,0.2)" : "none",
                            transition: "all 0.15s", whiteSpace: "nowrap",
                            opacity: isDisabled && !isActive ? 0.4 : 1,
                          }}
                        >
                          {isActive ? `✓ ${getOptText(opt)}` : getOptText(opt)}
                        </motion.button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p style={{ margin: 0, padding: "6px 14px 8px", fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            {flatQuestions.some((fq) => !hasUserVoted(fq.globalIdx)) ? "Vote · results when closed" : "✓ Voted on all"}
          </p>
        </div>
      )}

      {/* Reactions + Comments */}
      <div style={{ padding: isAllExpired ? "5px 14px 8px" : "6px 14px 10px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div onClick={e => e.stopPropagation()}>
            <ReactionPicker currentReaction={currentReaction} count={heartCount} onReact={r => handleReact(latestPost.id, r)} />
          </div>
          <button onClick={e => { e.stopPropagation(); setOpenInlinePostId(isInlineOpen ? null : latestPost.id); }}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: isInlineOpen ? ACCENT : "#9494ad", fontSize: 12, fontWeight: 600, padding: 0, transition: "color 0.15s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontSize: 11 }}>{latestPost.replyCount ?? 0}</span>
            {isInlineOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {displayReactions.length > 0 && heartCount > 0 && (
            <motion.button whileTap={{ scale: 0.93 }}
              onClick={e => { e.stopPropagation(); setReactionsMsgId(latestPost.id); }}
              style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", marginLeft: "auto", padding: 0 }}>
              <div style={{ display: "flex" }}>
                {displayReactions.map((type: string, i: number) => (
                  <div key={type} style={{ width: 18, height: 18, borderRadius: "50%", background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, marginLeft: i === 0 ? 0 : -5, zIndex: displayReactions.length - i, position: "relative" }}>
                    {REACTION_EMOJI[type] ?? "❤️"}
                  </div>
                ))}
              </div>
            </motion.button>
          )}
        </div>
        <AnimatePresence>
          {isInlineOpen && roomId && (
            <InlineSection key={`inline-plive-${latestPost.id}`}
              postId={latestPost.id} roomId={roomId} isOpen={isInlineOpen}
              onOpenFull={() => { setOpenInlinePostId(null); onPostClick?.(payload); }}
              accentColor={ACCENT} currentAvatarUrl={currentAvatarUrl}
              onCommentPosted={() => onToast("Comment posted!")} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}