// components/NewHomeComponents/AskFlip.tsx
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";

const QUICK_PILLS = [
  "Who's playing now?",
  "Medal chances?",
  "Today's schedule",
  "Where to watch?",
  "India's score?",
];

export default function AskFlip() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/MainModules/AskFlip?q=${encodeURIComponent(q)}`);
  };

  const handlePill = (pill: string) => {
    setQuery(pill);
    inputRef.current?.focus();
  };

  return (
    <div
      className="w-full mt-5 rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg,#1a0a2e 0%,#12101c 100%)",
        border: "1px solid rgba(233,30,140,0.18)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xl"
          style={{ background: "linear-gradient(135deg,#7c3aed,#E91E8C)" }}
        >
          🤖
        </div>
        <div>
          <p className="text-[15px] font-extrabold text-white leading-none">
            Ask Flip ✨
          </p>
          <p
            className="text-[11px] font-medium mt-0.5"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Your AI Sports Assistant
          </p>
        </div>
      </div>

      {/* Quick-suggestion pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
        {QUICK_PILLS.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => handlePill(pill)}
            className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
            style={{
              background: "rgba(124,58,237,0.18)",
              border: "1px solid rgba(124,58,237,0.35)",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input row */}
      <motion.div
        animate={{
          boxShadow: focused ? "0 0 0 2px #E91E8C55" : "none",
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ask Flip anything about sports..."
          className="flex-1 bg-transparent text-[13px] font-medium text-white placeholder:text-white/30 outline-none border-none"
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSubmit}
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
          style={{
            background: query.trim()
              ? "linear-gradient(135deg,#E91E8C,#FF6B35)"
              : "rgba(255,255,255,0.1)",
          }}
        >
          <Send size={14} className="text-white" style={{ marginLeft: 1 }} />
        </motion.button>
      </motion.div>
    </div>
  );
}
