// components/NewHomeComponents/FlipCard.tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

interface AthletePreview {
  country: string;
  score: number;
  name: string;
  sport: string;
  highlight?: boolean;
}

const ATHLETES: AthletePreview[] = [
  { country: "IN", score: 94, name: "V. Kohli",    sport: "Cricket"   },
  { country: "IN", score: 96, name: "N. Chopra",   sport: "Athletics" },
  { country: "IN", score: 91, name: "P.V. Sindhu", sport: "Badminton", highlight: true },
  { country: "IN", score: 93, name: "R. Sharma",   sport: "Cricket"   },
];

function AthleteCard({ a }: { a: AthletePreview }) {
  return (
    <div
      className="shrink-0 flex flex-col gap-0.5 rounded-xl px-3 py-2.5 min-w-[80px]"
      style={{
        background: a.highlight
          ? "linear-gradient(135deg,#1e1040,#2d1060)"
          : "rgba(255,255,255,0.05)",
        border: a.highlight
          ? "1px solid rgba(124,58,237,0.5)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[10px] font-extrabold"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {a.country}
        </span>
        <span
          className="text-[22px] font-black leading-none"
          style={{
            color: a.highlight ? "#a855f7" : "#E91E8C",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {a.score}
        </span>
      </div>
      <p className="text-[12px] font-extrabold text-white leading-none truncate">
        {a.name}
      </p>
      <p
        className="text-[10px] font-medium leading-none mt-0.5"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {a.sport}
      </p>
    </div>
  );
}

export default function FlipCard() {
  const router = useRouter();

  return (
    <div
      className="w-full mt-4 rounded-2xl p-4"
      style={{
        background: "linear-gradient(135deg,#0f0a1e 0%,#12101c 100%)",
        border: "1px solid rgba(124,58,237,0.22)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xl"
          style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
        >
          🃏
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-extrabold text-white leading-none">
              FlipCard
            </p>
            <Zap size={13} className="text-amber-400" fill="currentColor" />
            <span
              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(99,102,241,0.35)", color: "#a5b4fc" }}
            >
              AI
            </span>
          </div>
          <p
            className="text-[11px] font-medium mt-0.5"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Build any athlete card in seconds
          </p>
        </div>
      </div>

      {/* Athlete mini-cards row */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {ATHLETES.map((a) => (
          <AthleteCard key={a.name} a={a} />
        ))}
      </div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => router.push("/MainModules/FlipCard")}
        className="w-full py-3.5 rounded-full font-extrabold text-white text-[14px]"
        style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
      >
        Build Your FlipCard →
      </motion.button>
    </div>
  );
}
