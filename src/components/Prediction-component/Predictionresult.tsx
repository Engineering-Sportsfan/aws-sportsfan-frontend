"use client";

import { useState, useEffect } from "react";
import { Poll, UserPrediction } from "@/types/Polls";

function loadUserPick(pollId: string, userId?: string | null): UserPrediction | null {
  try {
    const key = userId ? `poll_pick_${pollId}_${userId}` : `poll_pick_${pollId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getCorrectOption(poll: Poll) {
  return poll.options.find((o) => o.isCorrect);
}

function getUserPickLabel(poll: Poll, pick: UserPrediction | null): string {
  if (!pick) return "No pick";
  const opt = poll.options.find((o) => o.id === pick.optionId);
  return opt?.label ?? pick.optionLabel ?? "Unknown";
}

// PredictionResult.tsx  (replace ResultRow + its caller)

function ResultRow({ poll, userId }: { poll: Poll; userId?: string | null }) {
  const [mounted, setMounted] = useState(false);
  const [pick, setPick] = useState<UserPrediction | null>(null);

  useEffect(() => {
    setMounted(true);
    setPick(loadUserPick(poll.id, userId));
  }, [poll.id, userId]);

  if (!mounted) return null;

  const correctOption = getCorrectOption(poll);
  const total = poll.options.reduce((s, o) => s + (o.votes || 0), 0);

  let isCorrect = false;
  let pointsEarned = 0;

  if (poll.type === "quiz" && pick && correctOption) {
    isCorrect = pick.optionId === correctOption.id;
    pointsEarned = isCorrect ? (poll.points ?? 10) : 0;
  } else if (poll.type === "poll" && pick) {
    pointsEarned = poll.points ?? 5;
    isCorrect = true;
  }

  const noPick = !pick;

  return (
    <div className="py-4 border-b border-white/6 last:border-0">
      {/* Header row */}
      <div className="flex items-start gap-4 mb-3">
        <div
          className={[
            "mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
            noPick
              ? "bg-white/10 text-white/30"
              : isCorrect
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30",
          ].join(" ")}
        >
          {noPick ? "–" : isCorrect ? "✓" : "✗"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-white/40 font-medium mb-0.5">
            {poll.type === "quiz" ? "Quiz" : "Poll"}
          </p>
          <p className="text-[13px] text-white/90">{poll.title}</p>
        </div>

        <div className="flex-shrink-0 text-right">
          <span
            className={[
              "text-sm font-bold",
              noPick
                ? "text-white/20"
                : pointsEarned > 0
                ? "text-emerald-400"
                : "text-white/30",
            ].join(" ")}
          >
            {noPick ? "+0" : pointsEarned > 0 ? `+${pointsEarned}` : "+0"}
          </span>
        </div>
      </div>

      {/* Options with progress bars */}
      <div className="ml-11 space-y-2">
        {poll.options.map((opt) => {
          const isUserPick = pick?.optionId === opt.id;
          const isCorrectOpt = poll.type === "quiz" && opt.isCorrect;
          const pctVal = total > 0 ? Math.round(((opt.votes || 0) / total) * 100) : 0;

          const barColor = isCorrectOpt
            ? "bg-emerald-500"
            : isUserPick && !isCorrectOpt && poll.type === "quiz"
            ? "bg-red-500/60"
            : "bg-white/15";

          const borderClass = isUserPick
            ? isCorrectOpt || poll.type === "poll"
              ? "border-emerald-500/60"
              : "border-red-500/50"
            : "border-white/8";

          return (
            <div key={opt.id} className={`relative rounded-lg border overflow-hidden ${borderClass}`}>
              {/* Progress bar background */}
              <div
                className={`absolute inset-y-0 left-0 ${barColor} transition-all duration-700`}
                style={{ width: `${pctVal}%` }}
              />
              <div className="relative flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/80">{opt.label}</span>
                  {isUserPick && (
                    <span className="text-[10px] font-semibold text-[#e879f9] bg-[#e879f9]/10 border border-[#e879f9]/20 px-1.5 py-0.5 rounded-full">
                      your pick
                    </span>
                  )}
                  {isCorrectOpt && (
                    <span className="text-[10px] font-semibold text-emerald-400">✓ correct</span>
                  )}
                </div>
                <span className="text-xs font-bold text-white/60">{pctVal}%</span>
              </div>
            </div>
          );
        })}

        {noPick && (
          <p className="text-[11px] text-white/30">No prediction made</p>
        )}
      </div>
    </div>
  );
}

export interface PredictionResultProps {
  polls: Poll[];
  matchTitle?: string;
  matchSubtitle?: string;
  userId?: string | null;
}

export default function PredictionResult({
  polls,
  matchTitle = "Prediction Results",
  matchSubtitle,
  userId,
}: PredictionResultProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!polls || polls.length === 0) {
    return null;
  }

  let totalEarned = 0;
  let correctCount = 0;

  polls.forEach((poll) => {
    const pick = loadUserPick(poll.id, userId);
    if (!pick) return;

    if (poll.type === "quiz") {
      const correct = getCorrectOption(poll);
      if (correct && pick.optionId === correct.id) {
        totalEarned += poll.points ?? 10;
        correctCount++;
      }
    } else {
      // Plain poll — award points for participating
      totalEarned += poll.points ?? 5;
      correctCount++;
    }
  });

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-[#0d0d1a] border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-[#0a0a16]">
        <div>
          <h2 className="text-base font-bold text-white">{matchTitle}</h2>
          {matchSubtitle && (
            <p className="text-[11px] text-white/40 mt-0.5">{matchSubtitle}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-[#e879f9]">+{totalEarned} pts</p>
          <p className="text-[10px] text-white/30">
            {correctCount}/{polls.length} correct
          </p>
        </div>
      </div>

      {/* Rows */}
      <div className="px-5">
        {polls.map((poll) => (
          <ResultRow key={poll.id} poll={poll} userId={userId} />
        ))}
      </div>
    </div>
  );
}