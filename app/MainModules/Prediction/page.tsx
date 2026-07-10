"use client";

import { useState, useEffect } from "react";
import { Poll } from "@/types/Polls";
import { useAuth } from "@/context/AuthContext";
import PredictionCard from "@/src/components/Prediction-component/PredictionCard";
import PredictionResult from "@/src/components/Prediction-component/Predictionresult";
import PredictionLeaderboard from "@/src/components/Prediction-component/Predictionleaderboard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// ─── API helpers 

async function fetchPolls(): Promise<Poll[]> {
  const res = await fetch("/api/polls");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

async function castVote(pollId: string, optionId: string, userId?: string): Promise<void> {
  const res = await fetch(`/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionId, userId }),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Vote failed");
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="w-full rounded-2xl bg-[#0d0d1a] border border-white/10 overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-white/8 space-y-2">
        <div className="h-4 w-32 bg-white/8 rounded" />
        <div className="h-3 w-48 bg-white/5 rounded" />
      </div>
      <div className="px-5 py-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-40 bg-white/8 rounded" />
            <div className="h-11 bg-white/5 rounded-xl" />
            <div className="h-11 bg-white/5 rounded-xl" />
            <div className="h-11 bg-white/5 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PredictionsPage() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls()
      .then(setPolls)
      .finally(() => setLoading(false));
  }, []);

  // Split polls: active vs ended
  const activePolls = polls.filter((p) => p.active);
  const endedPolls = polls.filter((p) => !p.active);
  // const now = new Date();
  // const activePolls = polls.filter((p) => p.active && new Date(p.endsAt) > now);
  // const endedPolls = polls.filter((p) => !p.active || new Date(p.endsAt) <= now);

  // Group active polls by matchId (or show all together if no matchId)
  const matchGroups = activePolls.reduce<Record<string, Poll[]>>((acc, poll) => {
    const key = poll.matchId ?? "general";
    if (!acc[key]) acc[key] = [];
    acc[key].push(poll);
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto space-y-6 pb-20">
      <Link href="/MainModules/HomePage" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
        <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition cursor-pointer">
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>
      </Link>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-black text-white">Predictions</h1>
        <p className="text-sm text-white/35 mt-0.5">
          Pick your outcomes · Earn points · Climb the board
        </p>
      </div>

      {loading && (
        <>
          <Skeleton />
          <Skeleton />
        </>
      )}

      {/* Active prediction cards (one per match group) */}
      {!loading &&
        Object.entries(matchGroups).map(([matchId, matchPolls]) => (
          <PredictionCard
            key={matchId}
            polls={matchPolls}
            matchTitle={matchPolls[0]?.matchId ? `Match Predictions` : "Today's Predictions"}
            matchSubtitle={`${matchPolls.length} question${matchPolls.length !== 1 ? "s" : ""}`}
            isLive
            userId={user?.userId}
            onVote={castVote}
          />
        ))}

      {/* No active polls message */}
      {!loading && activePolls.length === 0 && (
        <div className="rounded-2xl bg-[#0d0d1a] border border-white/8 px-5 py-10 text-center">
          <p className="text-2xl mb-2">🏏</p>
          <p className="text-sm font-semibold text-white/50">No active predictions right now</p>
          <p className="text-xs text-white/25 mt-1">Check back when the next match starts</p>
        </div>
      )}

      {/* Prediction results for ended polls */}
      {!loading && endedPolls.length > 0 && (
        <PredictionResult
          polls={endedPolls}
          matchTitle="Prediction Results"
          matchSubtitle={`${endedPolls.length} question${endedPolls.length !== 1 ? "s" : ""} resolved`}
          userId={user?.userId}
        />
      )}

      {/* Leaderboard */}
      {!loading && (
        <PredictionLeaderboard />
      )}
    </div>
  );
}