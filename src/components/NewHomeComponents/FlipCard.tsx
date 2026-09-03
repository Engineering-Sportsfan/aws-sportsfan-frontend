// components/NewHomeComponents/FlipCard.tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

interface AthletePreview {
  id: string;
  country: string;
  score: number;
  name: string;
  sport: string;
  highlight?: boolean;
}

const ATHLETES: AthletePreview[] = [
  { id: "india-team",       country: "IN", score: 121, name: "India",      sport: "Team",   highlight: true },
  { id: "sri-lanka-team",   country: "LK", score: 96,  name: "Sri Lanka",  sport: "Team" },
  { id: "kuldeep-yadav",     country: "IN", score: 85, name: "K. Yadav",   sport: "Cricket" },
  { id: "shubman-gill",      country: "IN", score: 87, name: "S. Gill",    sport: "Cricket" },
  { id: "yashasvi-jaiswal",  country: "IN", score: 86, name: "Y. Jaiswal", sport: "Cricket" },
  { id: "rishabh-pant",      country: "IN", score: 88, name: "R. Pant",    sport: "Cricket" },
];

function AthleteCard({ a, onClick }: { a: AthletePreview; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex flex-col gap-0.5 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 min-w-[76px] sm:min-w-[80px] text-left active:scale-95 transition-transform"
      style={{
        background: a.highlight
          ? "linear-gradient(135deg,#0b2f6b,#1d4ed8)"
          : "rgba(255,255,255,0.05)",
        border: a.highlight
          ? "1px solid rgba(59,130,246,0.5)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-baseline gap-1 sm:gap-1.5">
        <span
          className="text-[9px] sm:text-[10px] font-extrabold"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {a.country}
        </span>
        <span
          className="text-[20px] sm:text-[22px] font-black leading-none"
          style={{
            color: a.highlight ? "#93c5fd" : "#3b82f6",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {a.score}
        </span>
      </div>
      <p className="text-[11px] sm:text-[12px] font-extrabold text-white leading-none truncate">
        {a.name}
      </p>
      <p
        className="text-[9px] sm:text-[10px] font-medium leading-none mt-0.5"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {a.sport}
      </p>
    </button>
  );
}

export default function FlipCard() {
  const router = useRouter();

  return (
    <div
      className="w-full max-w-full overflow-hidden mt-4 rounded-2xl p-3.5 sm:p-4"
      style={{
        background: "linear-gradient(135deg,#0a1128 0%,#0f1a2e 100%)",
        border: "1px solid rgba(59,130,246,0.22)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
        >
          <img src="/images/dollyavatar.png" alt="askflip" className="w-full h-full object-cover"/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <p className="text-[14px] sm:text-[15px] font-extrabold text-white leading-none">
              FlipFlex
            </p>
            <Zap size={13} className="text-amber-400" fill="currentColor" />
            <span
              className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(59,130,246,0.35)", color: "#bfdbfe" }}
            >
              AI
            </span>
          </div>
          <p
            className="text-[10px] sm:text-[11px] font-medium mt-0.5"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Build any athlete card in seconds
          </p>
        </div>
      </div>

      {/* Athlete mini-cards row */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide w-full max-w-full">
        {ATHLETES.map((a) => (
          <AthleteCard
            key={a.id}
            a={a}
            onClick={() => router.push(`/MainModules/FlipCards?player=${a.id}`)}
          />
        ))}
      </div>

      {/* CTA */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => router.push("/MainModules/FlipCards/BuildFlip")}
        className="w-full py-3 sm:py-3.5 rounded-full font-extrabold text-white text-[13px] sm:text-[14px]"
        style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
      >
        Build Your FlipCard →
      </motion.button>
    </div>
  );
}