// "use client";

// import { useState } from "react";

// type Option = {
//   label: string;
// };

// type PredictionQuestion = {
//   id: number;
//   question: string;
//   timeLeft: string;
//   timeColor: string;
//   options: Option[];
//   predictions: string;
// };

// type ComingNext = {
//   label: string;
//   hint: string;
// };

// const questions: PredictionQuestion[] = [
//   {
//     id: 1,
//     question: "Will RCB win this match?",
//     timeLeft: "2:45",
//     timeColor: "text-pink-500",
//     options: [{ label: "Yes" }, { label: "No" }],
//     predictions: "12,554 predictions",
//   },
//   {
//     id: 2,
//     question: "Next wicket in how many overs?",
//     timeLeft: "5:12",
//     timeColor: "text-pink-500",
//     options: [{ label: "0-2 overs" }, { label: "3-5 overs" }, { label: "6+ overs" }],
//     predictions: "7,770 predictions",
//   },
//   {
//     id: 3,
//     question: "Will there be a six in next over?",
//     timeLeft: "0:45",
//     timeColor: "text-orange-400",
//     options: [{ label: "Yes" }, { label: "No" }],
//     predictions: "10,556 predictions",
//   },
// ];

// const comingNext: ComingNext[] = [
//   { label: "Top scorer in next 5 overs?", hint: "Unlocks in 2 overs" },
//   { label: "Will MI chase the target?",    hint: "After innings" },
// ];

// export default function Prediction() {
//   // Map of questionId -> selected option label
//   const [selected, setSelected] = useState<Record<number, string>>({});

//   const handleSelect = (qId: number, option: string) => {
//     setSelected((prev) => ({ ...prev, [qId]: option }));
//   };

//   return (
//     <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-2">
//           <span className="text-pink-500 text-sm">▲</span>
//           <span className="text-sm font-bold">Live Predictions</span>
//         </div>
//         <div className="flex items-center gap-1 text-gray-400 text-xs">
//           <span>👥</span>
//           <span>12.6k</span>
//         </div>
//       </div>

//       {/* Questions */}
//       <div className="flex flex-col gap-5">
//         {questions.map((q) => (
//           <div key={q.id} className="flex flex-col gap-2">
//             {/* Question row */}
//             <div className="flex items-start justify-between gap-2">
//               <span className="text-[13px] font-semibold text-white leading-snug">{q.question}</span>
//               <span className={`text-[11px] font-bold ${q.timeColor} flex items-center gap-1 shrink-0`}>
//                 <span className="text-[9px]">⏱</span>
//                 {q.timeLeft}
//               </span>
//             </div>

//             {/* Options */}
//             <div className="flex flex-col gap-1.5">
//               {q.options.map((opt) => {
//                 const isSelected = selected[q.id] === opt.label;
//                 return (
//                   <button
//                     key={opt.label}
//                     onClick={() => handleSelect(q.id, opt.label)}
//                     className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all border ${
//                       isSelected
//                         ? "bg-pink-600/20 border-pink-500 text-pink-300"
//                         : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:border-[#444] hover:bg-[#222]"
//                     }`}
//                   >
//                     {opt.label}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Prediction count */}
//             <div className="flex items-center gap-1 text-gray-500 text-[11px]">
//               <span>👥</span>
//               <span>{q.predictions}</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Divider */}
//       <div className="my-5 border-t border-[#222]" />

//       {/* Coming Next */}
//       <div className="flex flex-col gap-3">
//         <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Coming Next</span>
//         {comingNext.map((item, i) => (
//           <div
//             key={i}
//             className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-4 py-2.5"
//           >
//             <span className="text-[13px] text-gray-400">{item.label}</span>
//             <span className="text-[11px] text-gray-600 shrink-0 ml-2">{item.hint}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }









// // components/watch-along/Prediction.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useWatchAlong } from "@/context/WatchAlongContext";

// interface ComingNext {
//     label: string;
//     hint: string;
// }

// export default function Prediction({ matchId }: { matchId: string }) {
//     const [selected, setSelected] = useState<Record<string, string>>({});
//     const [voting, setVoting] = useState<string | null>(null);
//     const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
//     const [userId] = useState(() => {
//         // Try to get existing user ID from localStorage, or create new one
//         const stored = localStorage.getItem("watchalong_user_id");
//         if (stored) return stored;
//         const newId = `user_${Math.random().toString(36).substr(2, 9)}`;
//         localStorage.setItem("watchalong_user_id", newId);
//         return newId;
//     });

//     const {
//         predictions,
//         fetchPredictions,
//         votePrediction,
//         loading
//     } = useWatchAlong();

//     // Fetch predictions when matchId changes
//     useEffect(() => {
//         if (matchId) {
//             fetchPredictions(matchId, true); // Fetch only open predictions
//         }
//     }, [matchId, fetchPredictions]);

//     // Auto-refresh predictions every 10 seconds
//     useEffect(() => {
//         if (!matchId) return;

//         const interval = setInterval(() => {
//             fetchPredictions(matchId, true);
//         }, 10000);

//         return () => clearInterval(interval);
//     }, [matchId, fetchPredictions]);

//     useEffect(() => {
//         if (toastMessage) {
//             const timer = setTimeout(() => setToastMessage(null), 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [toastMessage]);

//     const handleSelect = async (predictionId: string, option: string) => {
//         if (selected[predictionId]) return;
//         if (voting === predictionId) return;

//         setVoting(predictionId);
//         try {
//             const result = await votePrediction(matchId, { predictionId, option, userId });
//             if (result) {
//                 setSelected((prev) => ({ ...prev, [predictionId]: option }));
//                 setToastMessage({ text: "✓ Vote submitted!", type: "success" });
//                 await fetchPredictions(matchId, true);
//             }
//         } catch (error: any) {
//             console.error("Failed to vote:", error);

//             const status = error?.response?.status;
//             if (status === 409) {
//                 setSelected((prev) => ({ ...prev, [predictionId]: option }));
//                 setToastMessage({ text: "You've already voted on this prediction!", type: "warning" });
//             } else if (status === 400) {
//                 setToastMessage({ text: "Invalid vote. Please try again.", type: "error" });
//             } else if (status === 404) {
//                 setToastMessage({ text: "Prediction not found. It may have closed.", type: "error" });
//             } else {
//                 setToastMessage({ text: "Something went wrong. Please try again.", type: "error" });
//             }
//         } finally {
//             setVoting(null);
//         }
//     };

//     // Format time left from closesAt timestamp
//     const getTimeLeft = (closesAt: number | null): { text: string; color: string } => {
//         if (!closesAt) return { text: "Live", color: "text-pink-500" };

//         const now = Date.now();
//         const diff = closesAt - now;

//         if (diff <= 0) return { text: "Closed", color: "text-gray-500" };

//         const minutes = Math.floor(diff / (1000 * 60));
//         const seconds = Math.floor((diff % (1000 * 60)) / 1000);

//         if (minutes > 0) {
//             const secondsStr = seconds.toString().padStart(2, '0');
//             // Show hours if more than 60 minutes
//             if (minutes >= 60) {
//                 const hours = Math.floor(minutes / 60);
//                 const remainingMinutes = minutes % 60;
//                 return {
//                     text: `${hours}h ${remainingMinutes}m`,
//                     color: "text-yellow-400"
//                 };
//             }
//             return { text: `${minutes}:${secondsStr}`, color: "text-pink-500" };
//         }
//         return { text: `${seconds}s`, color: "text-orange-400" };
//     };

//     // Format prediction count
//     const formatPredictions = (totalVotes: number): string => {
//         if (totalVotes >= 1000000) return `${(totalVotes / 1000000).toFixed(1)}M`;
//         if (totalVotes >= 1000) return `${(totalVotes / 1000).toFixed(1)}K`;
//         return `${totalVotes}`;
//     };

//     // Calculate total active predictions
//     const openPredictions = predictions.filter(p => p.isOpen);
//     const totalActivePredictions = openPredictions.length;

//     // Get total votes across all predictions
//     const totalVotes = predictions.reduce((sum, p) => sum + p.totalVotes, 0);

//     // Coming next suggestions (based on match context - can be made dynamic)
//     const comingNext: ComingNext[] = [
//         { label: "Top scorer in next 5 overs?", hint: "Unlocks in 2 overs" },
//         { label: "Will the chasing team win?", hint: "After innings break" },
//     ];

//     if (loading && predictions.length === 0) {
//         return (
//             <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
//                 <div className="flex items-center justify-center py-12">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
//             {/* Header */}
//             <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                     <span className="text-pink-500 text-sm">▲</span>
//                     <span className="text-sm font-bold">Live Predictions</span>
//                 </div>
//                 <div className="flex items-center gap-1 text-gray-400 text-xs">
//                     <span>👥</span>
//                     <span>{totalVotes >= 1000 ? `${(totalVotes / 1000).toFixed(1)}K` : totalVotes}</span>
//                 </div>
//             </div>

//             {/* Questions */}
//             {totalActivePredictions === 0 ? (
//                 <div className="text-center py-8 text-gray-500 text-sm">
//                     No active predictions at the moment.
//                     <br />
//                     <span className="text-xs text-gray-600">Check back soon!</span>
//                 </div>
//             ) : (
//                 <div className="flex flex-col gap-5">
//                     {openPredictions.map((pred) => {
//                         const timeLeft = getTimeLeft(pred.closesAt);
//                         const isSelected = selected[pred.id];
//                         const isVoting = voting === pred.id;

//                         return (
//                             <div key={pred.id} className="flex flex-col gap-2">
//                                 {/* Question row */}
//                                 <div className="flex items-start justify-between gap-2">
//                                     <span className="text-[13px] font-semibold text-white leading-snug">
//                                         {pred.question}
//                                     </span>
//                                     {timeLeft.text !== "Closed" && (
//                                         <span className={`text-[11px] font-bold ${timeLeft.color} flex items-center gap-1 shrink-0`}>
//                                             <span className="text-[9px]">⏱</span>
//                                             {timeLeft.text}
//                                         </span>
//                                     )}
//                                 </div>

//                                 {/* Options */}
//                                 <div className="flex flex-col gap-1.5">
//                                     {pred.options.map((option) => {
//                                         const voteCount = pred.votes[option] || 0;
//                                         const percentage = pred.totalVotes > 0 ? (voteCount / pred.totalVotes) * 100 : 0;
//                                         const isThisSelected = selected[pred.id] === option;
//                                         const isDisabled = !!isSelected || isVoting || !pred.isOpen;

//                                         return (
//                                             <button
//                                                 key={option}
//                                                 onClick={() => handleSelect(pred.id, option)}
//                                                 disabled={isDisabled}
//                                                 className={`relative w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all overflow-hidden ${isThisSelected
//                                                     ? "bg-pink-600/20 border border-pink-500 text-pink-300"
//                                                     : "bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 hover:border-[#444] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed"
//                                                     }`}
//                                             >
//                                                 <span className="relative z-10">{option}</span>
//                                                 {/* Show vote percentage bar for all options after voting */}
//                                                 {(isSelected || isThisSelected) && (
//                                                     <div
//                                                         className="absolute inset-0 bg-pink-600/10 z-0 transition-all duration-300"
//                                                         style={{ width: `${percentage}%` }}
//                                                     />
//                                                 )}
//                                             </button>
//                                         );
//                                     })}
//                                 </div>

//                                 {/* Prediction count */}
//                                 <div className="flex items-center justify-between text-gray-500 text-[11px]">
//                                     <div className="flex items-center gap-1">
//                                         <span>👥</span>
//                                         <span>{formatPredictions(pred.totalVotes)} votes</span>
//                                     </div>
//                                     {isSelected && (
//                                         <span className="text-green-500 text-[10px]">✓ Voted</span>
//                                     )}
//                                     {isVoting && (
//                                         <span className="text-yellow-500 text-[10px] animate-pulse">Submitting...</span>
//                                     )}
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}
//             {toastMessage && (
//                 <div className={`fixed top-24 right-4 z-50 p-3 rounded-lg shadow-lg min-w-[250px] max-w-[350px] animate-slide-in ${toastMessage.type === 'success' ? 'bg-green-600 text-white' :
//                     toastMessage.type === 'warning' ? 'bg-yellow-600 text-white' :
//                         'bg-red-600 text-white'
//                     }`}>
//                     <p className="text-sm text-center">{toastMessage.text}</p>
//                 </div>
//             )}
//             {/* Divider */}
//             <div className="my-5 border-t border-[#222]" />

//             {/* Coming Next */}
//             <div className="flex flex-col gap-3">
//                 <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
//                     Coming Next
//                 </span>
//                 {comingNext.map((item, i) => (
//                     <div
//                         key={i}
//                         className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-4 py-2.5"
//                     >
//                         <span className="text-[13px] text-gray-400">{item.label}</span>
//                         <span className="text-[11px] text-gray-600 shrink-0 ml-2">{item.hint}</span>
//                     </div>
//                 ))}
//             </div>
//             <style jsx>{`
//   @keyframes slideIn {
//     from { transform: translateX(100%); opacity: 0; }
//     to { transform: translateX(0); opacity: 1; }
//   }
//   .animate-slide-in { animation: slideIn 0.3s ease-out; }
// `}</style>
//         </div>

//     );
// }









// components/watch-along/Prediction.tsx
"use client";

import { useState, useEffect } from "react";
import { useWatchAlong } from "@/context/WatchAlongContext";

interface ComingNext {
    label: string;
    hint: string;
}

interface VoteResult {
    success: boolean;
    alreadyVoted?: boolean;
    prediction?: {
        id: string;
        question: string;
        options: string[];
        votes: Record<string, number>;
        totalVotes: number;
        isOpen: boolean;
        closesAt: number | null;
    };
}

export default function Prediction({ matchId }: { matchId: string }) {
    const [selected, setSelected] = useState<Record<string, string>>({});
    const [votedPredictions, setVotedPredictions] = useState<Set<string>>(new Set());
    const [voting, setVoting] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("watchalong_user_id");
            if (stored) {
                setUserId(stored);
            } else {
                const newId = `user_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem("watchalong_user_id", newId);
                setUserId(newId);
            }
        }
    }, []);

    const {
        predictions,
        fetchPredictions,
        votePrediction,
        loading
    } = useWatchAlong();

    // Fetch predictions when matchId changes
    useEffect(() => {
        if (matchId) {
            fetchPredictions(matchId, true);
        }
    }, [matchId, fetchPredictions]);

    // Auto-refresh predictions every 30 seconds (optimized from 10s)
    useEffect(() => {
        if (!matchId) return;
        const interval = setInterval(() => {
            fetchPredictions(matchId, true);
        }, 30000);
        return () => clearInterval(interval);
    }, [matchId, fetchPredictions]);


    
    const handleSelect = async (predictionId: string, option: string) => {
        if (selected[predictionId]) return;
        if (voting === predictionId) return;

        setVoting(predictionId);

        try {
            const result = await votePrediction(matchId, {
                predictionId,
                option,
                userId,
            }) as unknown as VoteResult;

            if (result?.success) {
                setSelected((prev) => ({
                    ...prev,
                    [predictionId]: option,
                }));
                setVotedPredictions((prev) => new Set([...prev, predictionId]));
                await fetchPredictions(matchId, true);
            } else if (result?.alreadyVoted) {
                setVotedPredictions((prev) => new Set([...prev, predictionId]));
            }
        } catch (error) {
            console.error("Vote error:", error);
        } finally {
            setVoting(null);
        }
    };

    const getTimeLeft = (closesAt: number | null): { text: string; color: string } => {
        if (!closesAt) return { text: "Live", color: "text-pink-500" };
        const now = Date.now();
        const diff = closesAt - now;
        if (diff <= 0) return { text: "Closed", color: "text-gray-500" };
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        if (minutes > 0) {
            const secondsStr = seconds.toString().padStart(2, '0');
            if (minutes >= 60) {
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                return { text: `${hours}h ${remainingMinutes}m`, color: "text-yellow-400" };
            }
            return { text: `${minutes}:${secondsStr}`, color: "text-pink-500" };
        }
        return { text: `${seconds}s`, color: "text-orange-400" };
    };

    const formatPredictions = (totalVotes: number): string => {
        if (totalVotes >= 1000000) return `${(totalVotes / 1000000).toFixed(1)}M`;
        if (totalVotes >= 1000) return `${(totalVotes / 1000).toFixed(1)}K`;
        return `${totalVotes}`;
    };

    const openPredictions = predictions.filter(p => p.isOpen && !p.question.startsWith("[Poll] "));
    const totalActivePredictions = openPredictions.length;
    const totalVotes = predictions.filter(p => !p.question.startsWith("[Poll] ")).reduce((sum, p) => sum + p.totalVotes, 0);

    const comingNext: ComingNext[] = [
        { label: "Top scorer in next 5 overs?", hint: "Unlocks in 2 overs" },
        { label: "Will the chasing team win?", hint: "After innings break" },
    ];

    if (loading && predictions.length === 0) {
        return (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 lg:py-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-pink-500 text-sm">▲</span>
                    <span className="text-sm font-bold">Live Predictions</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <span>👥</span>
                    <span>{totalVotes >= 1000 ? `${(totalVotes / 1000).toFixed(1)}K` : totalVotes}</span>
                </div>
            </div>



            {/* Questions */}
            {totalActivePredictions === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                    No active predictions at the moment.
                    <br />
                    <span className="text-xs text-gray-600">Check back soon!</span>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {openPredictions.map((pred) => {
                        const timeLeft = getTimeLeft(pred.closesAt);
                        const isExpired = pred.closesAt ? Date.now() > pred.closesAt : false;
                        const hasVoted = votedPredictions.has(pred.id) || !!selected[pred.id];
                        const isVoting = voting === pred.id;

                        return (
                            <div key={pred.id} className="flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-[13px] font-semibold text-white leading-snug">
                                        {pred.question}
                                    </span>
                                    <span className={`text-[11px] font-bold ${timeLeft.text === "Closed" ? "text-gray-500" : timeLeft.color} flex items-center gap-1 shrink-0`}>
                                        <span className="text-[9px]">⏱</span>
                                        {timeLeft.text}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    {pred.options.map((option, idx) => {
                                        const voteCount = pred.votes[option] || 0;
                                        const percentage = pred.totalVotes > 0 ? (voteCount / pred.totalVotes) * 100 : 0;
                                        const isSelected = selected[pred.id] === option;
                                        const isDisabled = hasVoted || isVoting || !pred.isOpen || isExpired;

                                        return (
                                            <button
                                                key={option + '-' + idx}
                                                onClick={() => handleSelect(pred.id, option)}
                                                disabled={isDisabled}
                                                className={`relative w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all overflow-hidden ${
                                                    isSelected
                                                        ? "bg-pink-600/20 border border-pink-500 text-pink-300"
                                                        : "bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 hover:border-[#444] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed"
                                                }`}
                                            >
                                                {/* Background percentage bar — always visible */}
                                                <div
                                                    className={`absolute inset-0 z-0 transition-all duration-500 ${
                                                        isSelected ? "bg-pink-600/20" : "bg-white/5"
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                                {/* Option label + votes + percentage */}
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <span>{option}</span>
                                                    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                                                        isSelected ? "text-pink-300" : "text-gray-400"
                                                    }`}>
                                                        <span>{formatPredictions(voteCount)} votes</span>
                                                        <span className="opacity-40">·</span>
                                                        <span className="text-[12px] font-bold">{Math.round(percentage)}%</span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                                    <div className="flex items-center gap-1">
                                        <span>👥</span>
                                        <span>{formatPredictions(pred.totalVotes)} votes</span>
                                    </div>
                                    {hasVoted && (
                                        <span className="text-green-500 text-[10px]">✓ Voted</span>
                                    )}
                                    {isVoting && (
                                        <span className="text-yellow-500 text-[10px] animate-pulse">Submitting...</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Divider */}
            <div className="my-5 border-t border-[#222]" />

            {/* Coming Next */}
            <div className="flex flex-col gap-3">
                <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                    Coming Next
                </span>
                {comingNext.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-4 py-2.5">
                        <span className="text-[13px] text-gray-400">{item.label}</span>
                        <span className="text-[11px] text-gray-600 shrink-0 ml-2">{item.hint}</span>
                    </div>
                ))}
            </div>


        </div>
    );
}