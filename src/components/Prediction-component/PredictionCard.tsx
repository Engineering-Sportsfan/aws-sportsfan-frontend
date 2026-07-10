"use client";

import { useState, useEffect, useCallback } from "react";
import { Poll, PollOption, UserPrediction } from "@/types/Polls";


// ─── helpers ──────────────────────────────────────────────────────────────────

function getStorageKey(pollId: string, userId?: string | null) {
  return userId ? `poll_voted_${pollId}_${userId}` : `poll_voted_${pollId}`;
}

function getPickKey(pollId: string, userId?: string | null) {
  return userId ? `poll_pick_${pollId}_${userId}` : `poll_pick_${pollId}`;
}

function loadUserPick(pollId: string, userId?: string | null): UserPrediction | null {
  try {
    const raw = localStorage.getItem(getPickKey(pollId, userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUserPick(pollId: string, pick: UserPrediction, userId?: string | null) {
  localStorage.setItem(getPickKey(pollId, userId), JSON.stringify(pick));
  localStorage.setItem(getStorageKey(pollId, userId), "true");
}

function hasVoted(pollId: string, userId?: string | null) {
  return localStorage.getItem(getStorageKey(pollId, userId)) === "true";
}

function isPollExpired(endsAt: string) {
  return new Date(endsAt).getTime() <= Date.now();
}

function pct(options: PollOption[], id: string) {
  const total = options.reduce((s, o) => s + (o.votes || 0), 0);
  if (!total) return 0;
  const opt = options.find((o) => o.id === id);
  return Math.round(((opt?.votes ?? 0) / total) * 100);
}

// ─── Option button ─────────────────────────────────────────────────────────────

interface OptionProps {
  option: PollOption;
  state: "idle" | "selected" | "locked-correct" | "locked-wrong" | "locked-other";
  percent: number;
  showBar: boolean;
  index: number;
  showMultiplier?: boolean;
  onClick?: () => void;
}

function OptionButton({ option, state, percent, showBar, index, onClick }: OptionProps) {
  const base =
    "relative w-full rounded-xl text-left transition-all duration-200 select-none overflow-hidden";

  const styles: Record<string, string> = {
    idle: "bg-[#1a1a2e] border border-white/10 hover:border-white/25 hover:bg-[#22223a] cursor-pointer",
    selected:
      "bg-[#1a0a1e] border border-[#c026d3] shadow-[0_0_16px_rgba(192,38,211,0.25)] cursor-default",
    "locked-correct":
      "bg-[#052e16] border border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-default",
    "locked-wrong":
      "bg-[#1c0a0a] border border-red-500/60 cursor-default opacity-70",
    "locked-other":
      "bg-[#111120] border border-white/8 cursor-default opacity-40",
  };

  const icon: Record<string, string> = {
    idle: "",
    selected: "◉",
    "locked-correct": "✓",
    "locked-wrong": "✗",
    "locked-other": "",
  };

  const iconColor: Record<string, string> = {
    idle: "",
    selected: "text-[#e879f9]",
    "locked-correct": "text-emerald-400",
    "locked-wrong": "text-red-400",
    "locked-other": "",
  };

  const barColor = (() => {
    if (state === "locked-correct") return "bg-emerald-500";
    if (state === "locked-wrong") return "bg-red-500";
    
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

  return (
    <button
      className={`${base} ${styles[state]}`}
      onClick={state === "idle" ? onClick : undefined}
      disabled={state !== "idle"}
    >
      {showBar && (
        <span
          className={`absolute inset-y-0 left-0 ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      )}
      <span className="relative flex items-center justify-between px-4 py-3 min-h-[48px]">
        <span className="text-sm font-medium text-white/90">
          {option.label}
        </span>
        <span className="flex items-center gap-2">
          {showBar && (
            <span className="text-sm font-bold text-white/80">{percent}%</span>
          )}
          {icon[state] && (
            <span className={`text-base font-bold flex-shrink-0 ${iconColor[state]}`}>
              {icon[state]}
            </span>
          )}
          {state === "idle" && (
            <span className="w-4 h-4 rounded-full border-2 border-white/20 flex-shrink-0" />
          )}
        </span>
      </span>
    </button>
  );
}

// ─── Single prediction question card 

interface PredictionQuestionProps {
  poll: Poll;
  userId?: string | null;
  onVote?: (pollId: string, optionId: string, userId?: string) => Promise<void>;
}

function PredictionQuestion({ poll, userId, onVote }: PredictionQuestionProps) {
  const [options, setOptions] = useState<PollOption[]>(poll.options);
  const [userPick, setUserPick] = useState<UserPrediction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const expired = isPollExpired(poll.endsAt);
  const isLocked = !poll.active || expired;

  useEffect(() => {
    setOptions(poll.options);
  }, [poll.options]);

  useEffect(() => {
    const pick = loadUserPick(poll.id, userId);
    if (pick) setUserPick(pick);
  }, [poll.id, userId]);

  const handleVote = useCallback(
    async (option: PollOption) => {
      if (userPick || submitting || isLocked) return;
      setSubmitting(true);
      const pick: UserPrediction = {
        pollId: poll.id,
        optionId: option.id,
        optionLabel: option.label,
        submittedAt: new Date().toISOString(),
      };
      saveUserPick(poll.id, pick, userId);
      setUserPick(pick);
      
      setOptions((prev) =>
        prev.map((o) => (o.id === option.id ? { ...o, votes: (o.votes || 0) + 1 } : o))
      );

      try {
        await onVote?.(poll.id, option.id, userId || undefined);
      } catch {
        setUserPick(null);
        localStorage.removeItem(getPickKey(poll.id, userId));
        localStorage.removeItem(getStorageKey(poll.id, userId));
        // rollback
        setOptions(poll.options);
      } finally {
        setSubmitting(false);
      }
    },
    [userPick, submitting, isLocked, poll.id, userId, onVote]
  );

  function getOptionState(option: PollOption): OptionProps["state"] {
    if (!userPick && !isLocked) return "idle";
    if (!userPick && isLocked) return "locked-other";
    const isPicked = userPick && userPick.optionId === option.id;
    // If quiz type and poll is resolved (not active), show correct/wrong
    if (!poll.active && poll.type === "quiz") {
      if (isPicked && option.isCorrect) return "locked-correct";
      if (isPicked && !option.isCorrect) return "locked-wrong";
      if (option.isCorrect) return "locked-correct";
      return "locked-other";
    }
    // Poll type or still active — just show selected
    if (isPicked) return "selected";
    return "locked-other";
  }

  return (
    <div className="space-y-2">
        
      {/* Question header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white/80">{poll.title}</p>
        {poll.points && (
          <span className="text-xs font-bold text-[#e879f9] bg-[#e879f9]/10 border border-[#e879f9]/20 px-2 py-0.5 rounded-full">
            +{poll.points} pts
          </span>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {options.map((opt, index) => (
          <OptionButton
            key={opt.id}
            option={opt}
            state={getOptionState(opt)}
            percent={pct(options, opt.id)}
            showBar={!!userPick || isLocked}
            index={index}
            onClick={() => handleVote(opt)}
          />
        ))}
      </div>

      {/* Lock notice */}
      {poll.locksWhen && !userPick && !isLocked && (
        <p className="text-[11px] text-amber-400/70 flex items-center gap-1 mt-1">
          <span>⏱</span> {poll.locksWhen}
        </p>
      )}

      {/* Voted confirmation */}
      {userPick && !isLocked && (
        <p className="text-[11px] text-[#e879f9]/80 mt-1">
          ✓ Your pick: <span className="font-semibold">{userPick.optionLabel}</span>
        </p>
      )}

      {/* Locked notice */}
      {isLocked && !userPick && (
        <p className="text-[11px] text-white/30 mt-1">This question has locked</p>
      )}
    </div>
  );
}

// ─── Main PredictionCard ───────────────────────────────────────────────────────

export interface PredictionCardProps {
  polls: Poll[];
  matchTitle?: string;
  matchSubtitle?: string;
  isLive?: boolean;
  onVote?: (pollId: string, optionId: string, userId?: string) => Promise<void>;
  userId?: string | null;
  onSave?: () => void;
}

export default function PredictionCard({
  polls,
  matchTitle = "Predictions",
  matchSubtitle,
  isLive,
  onVote,
  userId,
  onSave,
}: PredictionCardProps) {
  const [saved, setSaved] = useState(false);

  const totalPoints = polls.reduce((sum, p) => sum + (p.points ?? 0), 0);

  const handleSave = () => {
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-[#0d0d1a] border border-white/10">
      {/* Match header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-[#0a0a16]">
        <div>
          <h2 className="text-base font-bold text-white">{matchTitle}</h2>
          {matchSubtitle && (
            <p className="text-[11px] text-white/40 mt-0.5">{matchSubtitle}</p>
          )}
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            In Play
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls.map((poll) => (
          <div key={poll.id} className="w-full bg-[#1a1a2e]/50 border border-white/5 rounded-xl p-4">
            <PredictionQuestion poll={poll} userId={userId} onVote={onVote} />
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="px-5 pb-5">
        <button
          onClick={handleSave}
          className={[
            "w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300",
            saved
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-[#e91e8c] to-[#7c3aed] text-white hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]",
          ].join(" ")}
        >
          {saved ? "✓ Predictions Saved!" : `Save Predictions · ${totalPoints} pts possible`}
        </button>
      </div>
    </div>
  );
}