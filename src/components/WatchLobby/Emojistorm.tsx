// components/watch-along/EmojiStorm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useWatchAlong } from "@/context/WatchAlongContext";

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  key: number;
}

interface EmojiBar {
  emoji: string;
  label: string;
  count: number;
  pct: number;
}

const EMOJI_OPTIONS = ["🔥", "💪", "😱", "🏏", "👏", "🎉", "❤️", "🚀", "😮", "🤩"];

const EMOJI_LABELS: Record<string, string> = {
  "🔥": "Fire",
  "💪": "Power",
  "😱": "Shock",
  "🏏": "Cricket",
  "👏": "Clap",
  "🎉": "Party",
  "❤️": "Love",
  "🚀": "Rocket",
  "😮": "Wow",
  "🤩": "Star",
};

interface EmojiStormProps {
  matchId: string;
}

export default function EmojiStorm({ matchId }: EmojiStormProps) {
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const counterRef = useRef(0);
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});

  const {
    emojiReactions,
    fetchEmojiReactions,
    sendEmojiReaction,
    loading
  } = useWatchAlong();

  // Fetch emoji reactions on mount
  useEffect(() => {
    if (matchId) {
      fetchEmojiReactions(matchId);
    }
  }, [matchId, fetchEmojiReactions]);

  // Poll for new reactions every 15 seconds (optimized from 3s)
  useEffect(() => {
    if (!matchId) return;
    const interval = setInterval(() => {
      fetchEmojiReactions(matchId);
    }, 15000);
    return () => clearInterval(interval);
  }, [matchId, fetchEmojiReactions]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const sendEmoji = async (emoji: string) => {
    if (sending === emoji) return;

    setSending(emoji);
    
    // Add floating animation immediately for feedback
    const id = ++counterRef.current;
    const x = 10 + Math.random() * 80;
    setFloating((prev) => [...prev, { id, emoji, x, key: id }]);
    
    // Update local count for immediate UI feedback
    setLocalCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    
    // Remove floating emoji after animation
    setTimeout(() => {
      setFloating((prev) => prev.filter((f) => f.id !== id));
    }, 2200);

    try {
      const result = await sendEmojiReaction(matchId, { emoji });
      if (result) {
        // Success - will be updated by polling
        setToastMessage({ text: `${emoji} reaction sent!`, type: "success" });
      }
    } catch (error) {
      console.error("Failed to send emoji:", error);
      setToastMessage({ text: "Failed to send reaction", type: "error" });
    } finally {
      setSending(null);
    }
  };

  // Calculate total reactions
  const totalReactions = Object.values(emojiReactions).reduce((a, b) => a + b, 0);
  
  // Create sorted emoji bars for top reactions
  const emojiBars: EmojiBar[] = EMOJI_OPTIONS.map(emoji => {
    const count = emojiReactions[emoji] || 0;
    const pct = totalReactions > 0 ? (count / totalReactions) * 100 : 0;
    return {
      emoji,
      label: EMOJI_LABELS[emoji],
      count,
      pct: Math.min(pct, 100)
    };
  }).sort((a, b) => b.count - a.count);

  if (loading && Object.keys(emojiReactions).length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 pb-25 relative">
      {/* Toast Message */}
      {/* {toastMessage && (
        <div className={`fixed top-24 right-4 z-50 p-3 rounded-lg shadow-lg min-w-[250px] max-w-[350px] animate-slide-in ${
          toastMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="text-sm text-center">{toastMessage.text}</p>
        </div>
      )} */}

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-pink-400 text-sm">🌪️</span>
        <span className="text-sm font-bold">Emoji Storm</span>
        <span className="text-xs text-gray-500 ml-auto">
          {totalReactions.toLocaleString()} total reactions
        </span>
      </div>

      {/* Floating emoji area */}
      <div className="relative h-32 mb-5 overflow-hidden rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
        <span className="absolute inset-0 flex items-center justify-center text-[11px] text-gray-600 select-none">
          Tap an emoji below to send
        </span>
        {floating.map((f) => (
          <span
            key={f.key}
            className="absolute text-2xl animate-float-up pointer-events-none select-none"
            style={{ left: `${f.x}%`, bottom: "0%" }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      {/* Emoji picker */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {EMOJI_OPTIONS.map((emoji) => {
          const reactionCount = emojiReactions[emoji] || 0;
          const localCount = localCounts[emoji] || 0;
          const displayCount = reactionCount + localCount;
          
          return (
            <button
              key={emoji}
              onClick={() => sendEmoji(emoji)}
              disabled={sending === emoji}
              className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-pink-500/50 hover:bg-[#222] active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl leading-none">{emoji}</span>
              {displayCount > 0 ? (
                <span className="text-[9px] text-pink-400 font-bold">
                  +{displayCount.toLocaleString()}
                </span>
              ) : (
                <span className="text-[9px] text-transparent">·</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Top reactions */}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
          Top Reactions
        </span>
        {emojiBars.slice(0, 5).map((bar) => (
          <div key={bar.emoji} className="flex items-center gap-3">
            <span className="text-lg w-6">{bar.emoji}</span>
            <span className="text-xs text-gray-400 w-12">{bar.label}</span>
            <div className="flex-1">
              <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full transition-all duration-500"
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-gray-500 w-16 text-right">
              {bar.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Float-up keyframe via inline style */}
      <style jsx>{`
        @keyframes float-up {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          80%  { transform: translateY(-110px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-130px) scale(0.8); opacity: 0; }
        }
        .animate-float-up { 
          animation: float-up 2s ease-out forwards; 
          animation-duration: 2s;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}