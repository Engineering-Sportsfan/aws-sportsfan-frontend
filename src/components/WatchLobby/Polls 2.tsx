// components/watch-along/Polls.tsx
"use client";

import { useState, useEffect } from "react";
import { useWatchAlong } from "@/context/WatchAlongContext";

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

export default function Polls({ matchId }: { matchId: string }) {
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

    // Auto-refresh every 10 seconds
    useEffect(() => {
        if (!matchId) return;
        const interval = setInterval(() => {
            fetchPredictions(matchId, true);
        }, 10000);
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

    // Filter ONLY poll questions (starting with "[Poll] ")
    const openPolls = predictions.filter(p => p.isOpen && p.question.startsWith("[Poll] "));
    const totalActivePolls = openPolls.length;
    const totalVotes = openPolls.reduce((sum, p) => sum + p.totalVotes, 0);

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
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-18 md:py-18 lg:py-5 -mt-12 lg:-mt-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-pink-500 text-sm">📊</span>
                    <span className="text-sm font-bold">Active Host Polls</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <span>👥</span>
                    <span>{totalVotes >= 1000 ? `${(totalVotes / 1000).toFixed(1)}K` : totalVotes} votes</span>
                </div>
            </div>

            {/* Questions */}
            {totalActivePolls === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                    No active polls at the moment.
                    <br />
                    <span className="text-xs text-gray-600">The Host hasn&apos;t launched any polls yet.</span>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {openPolls.map((pred) => {
                        const timeLeft = getTimeLeft(pred.closesAt);
                        const isExpired = pred.closesAt ? Date.now() > pred.closesAt : false;
                        const hasVoted = votedPredictions.has(pred.id) || !!selected[pred.id];
                        const isVoting = voting === pred.id;
                        // Strip "[Poll] " tag
                        const cleanQuestion = pred.question.replace(/^\[Poll\]\s*/i, "");

                        return (
                            <div key={pred.id} className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-xl p-4 shadow-xl">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className="text-[13px] font-bold text-white leading-snug">
                                        {cleanQuestion}
                                    </span>
                                    <span className={`text-[11px] font-bold ${timeLeft.text === "Closed" ? "text-gray-500" : timeLeft.color} flex items-center gap-1 shrink-0`}>
                                        <span className="text-[9px]">⏱</span>
                                        {timeLeft.text}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    {pred.options.map((option) => {
                                        const voteCount = pred.votes[option] || 0;
                                        const percentage = pred.totalVotes > 0 ? (voteCount / pred.totalVotes) * 100 : 0;
                                        const isSelected = selected[pred.id] === option;
                                        const isDisabled = hasVoted || isVoting || !pred.isOpen || isExpired;

                                        return (
                                            <button
                                                key={option}
                                                onClick={() => handleSelect(pred.id, option)}
                                                disabled={isDisabled}
                                                className={`relative w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all overflow-hidden ${
                                                    isSelected
                                                        ? "bg-pink-600/25 border border-pink-500 text-pink-300"
                                                        : "bg-[#161618] border border-[#2b2b2e] text-gray-300 hover:border-[#444] hover:bg-[#222] disabled:cursor-default"
                                                }`}
                                            >
                                                {/* Background percentage bar */}
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

                                <div className="flex items-center justify-between text-gray-500 text-[11px] mt-1">
                                    <div className="flex items-center gap-1">
                                        <span>👥</span>
                                        <span>{formatPredictions(pred.totalVotes)} total votes</span>
                                    </div>
                                    {hasVoted && (
                                        <span className="text-green-500 text-[10px] font-bold">✓ Voted</span>
                                    )}
                                    {isVoting && (
                                        <span className="text-yellow-500 text-[10px] animate-pulse">Voting...</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
