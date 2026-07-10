"use client";

import { useState, useEffect, useCallback } from "react";
import { Poll, PollOption } from "@/types/Polls";
import { usePostHog } from "posthog-js/react";

// ─── Props 
//__
interface PollCardProps {
  poll: Poll;
  onVote?: (pollId: string, optionId: string, userId?: string) => Promise<void>;
  userId?: string | null;
}

// ─── Countdown hook 
function useCountdown(endsAt: string) {
  const calc = () => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    return `Ends in ${h}H ${m}M`;
  };
  const [label, setLabel] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setLabel(calc()), 30_000);
    return () => clearInterval(id);
  }, [endsAt]);
  return label;
}

// ─── Percent helper 
function pct(options: PollOption[], id: string) {
  const total = options.reduce((s, o) => s + o.votes, 0);
  if (!total) return 0;
  const opt = options.find((o) => o.id === id);
  return Math.round(((opt?.votes ?? 0) / total) * 100);
}

// ─── Single option row 
function OptionRow({
  option,
  percent,
  showBar,
  isSelected,
  isQuiz,
  voted,
  inactive,
  onVote,
  index,
}: {
  option: PollOption;
  percent: number;
  showBar: boolean;
  isSelected: boolean;
  isQuiz: boolean;
  voted: boolean;
  inactive: boolean;
  onVote: (id: string) => void;
  index: number;
}) {
  const barColor = (() => {
    if (isQuiz) {
      if (isSelected && option.isCorrect) return "bg-emerald-500";
      if (isSelected && !option.isCorrect) return "bg-orange-500";
      if (voted && option.isCorrect) return "bg-emerald-500";
    }
    
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-cyan-500",
      "bg-indigo-500"
    ];
    return colors[index % colors.length];
  })();

  const canClick = !voted && !inactive;

  return (
    <button
      disabled={!canClick}
      onClick={() => canClick && onVote(option.id)}
      className={[
        "relative w-full rounded-lg overflow-hidden text-left select-none",
        "transition-all duration-150",
        canClick ? "cursor-pointer hover:brightness-110" : "cursor-default",
      ].join(" ")}
    >
      {showBar && (
        <span
          className={`absolute inset-y-0 left-0 ${barColor} rounded-lg transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      )}
      {!showBar && (
        <span className="absolute inset-0 bg-[#2a2a3e] rounded-lg" />
      )}
      <span className="relative flex items-center justify-between px-3 py-2.5 min-h-[40px]">
        <span className="text-sm font-medium text-white">{option.label}</span>
        {showBar ? (
          <span className="text-sm font-bold text-white ml-2 flex-shrink-0">{percent}%</span>
        ) : (
          <span className="w-[18px] h-[18px] rounded-full border-2 border-gray-500 flex-shrink-0" />
        )}
      </span>
    </button>
  );
}

// ─── Local storage keys (fallback for anonymous)
function getStorageKey(pollId: string, userId?: string | null): string {
  if (userId) return `poll_voted_${pollId}_${userId}`;
  return `poll_voted_${pollId}`;
}

function hasLocalVoted(pollId: string, userId?: string | null): boolean {
  const key = getStorageKey(pollId, userId);
  return localStorage.getItem(key) === "true";
}

function markLocalVoted(pollId: string, userId?: string | null): void {
  const key = getStorageKey(pollId, userId);
  localStorage.setItem(key, "true");
}

// ─── Main PollCard 
export default function PollCard({ poll, onVote, userId }: PollCardProps) {
  const phog = usePostHog();
  const [options, setOptions] = useState<PollOption[]>(poll.options);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const countdown = useCountdown(poll.endsAt);
  const isInactive = !poll.active || !countdown;

  
  // Check local storage on mount
  useEffect(() => {
    const alreadyVoted = hasLocalVoted(poll.id, userId);
    if (alreadyVoted) {
      setVoted(true);
    }
  }, [poll.id, userId]);

  useEffect(() => {
    setOptions(poll.options);
  }, [poll.options]);

  const handleVote = useCallback(
    async (optionId: string) => {
      if (voted || submitting || isInactive) return;
      
      setSelectedId(optionId);
      setVoted(true);
      setSubmitting(true);
      
      // Mark in localStorage immediately
      markLocalVoted(poll.id, userId);
      
      if (phog) { phog.capture("poll_voted", {
        poll_id: poll.id,
        poll_type: poll.type,
        option_id: optionId
      }); }
      
      try {
        await onVote?.(poll.id, optionId, userId || undefined);
        setOptions((prev) =>
          prev.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o))
        );
      } catch (error) {
        // Rollback on error
        setVoted(false);
        setSelectedId(null);
        const key = getStorageKey(poll.id, userId);
        localStorage.removeItem(key);
      } finally {
        setSubmitting(false);
      }
    },
    [voted, submitting, isInactive, onVote, poll.id, userId]
  );

  const showResults = voted || isInactive;
   if (!poll) {
    return null;
  }

  return (
    <div
      className={[
        "w-[260px] rounded-xl overflow-hidden",
        "bg-[#1e1e2e] border",
        isInactive ? "border-white/10" : "border-white/15",
      ].join(" ")}
    >
      <div className="px-4 pt-3 pb-2">
        <p className="text-[11px] text-gray-400 font-medium mb-1">
          {poll.type === "quiz" ? "Quiz" : "Poll"}
        </p>
        <p className="text-[13px] text-white/90 font-medium leading-snug">{poll.title}</p>
      </div>

      <div className="px-3 pb-3 space-y-2">
        {options.map((opt, index) => (
          <OptionRow
            key={opt.id}
            option={opt}
            percent={pct(options, opt.id)}
            showBar={showResults}
            isSelected={selectedId === opt.id}
            isQuiz={poll.type === "quiz"}
            voted={voted}
            inactive={isInactive}
            onVote={handleVote}
            index={index}
          />
        ))}
      </div>

      <div
        className={[
          "text-center text-[11px] font-semibold py-1.5",
          voted
            ? "text-emerald-400 bg-emerald-500/10"
            : isInactive
            ? "text-red-400 bg-red-500/10"
            : "text-emerald-400 bg-emerald-500/10",
        ].join(" ")}
      >
        {voted ? "✓ You've voted" : isInactive ? "The poll has ended" : countdown}
      </div>
    </div>
  );
}