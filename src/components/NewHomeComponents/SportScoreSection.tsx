// components\NewHomeComponents\SportScoreSection.tsx

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Bell, MapPin } from "lucide-react";


export type LiveCard = {
  type: "live";
  id: string;
  status: "LIVE";
  competition: string; // e.g. "ODI · Champions Trophy"
  teamAName: string;
  teamAShort: string;
  teamAScore: string; // "204/32.4"
  teamBName: string;
  teamBShort: string;
  teamBScore?: string; // "—" if not batted yet
  overSummary: { label: string; kind: "wicket" | "dot" | "run" | "four" | "six" }[];
  rrr?: string; // "RRR 7.2"
  oversLabel: string; // "Ov 32.4"
  fanCount: number;
  onJoin: () => void;
};

export type UpcomingCard = {
  type: "upcoming";
  id: string;
  competition: string; // "T20 · Asia Cup"
  teamAName: string;
  teamAShort: string;
  teamBName: string;
  teamBShort: string;
  venue: string;
  time: string; // "7:30 PM IST"
  startsInMs: number; // epoch ms for countdown
  onNotify: () => void;
};

export type VipCard = {
  type: "vip";
  id: string;
  tag: string; // "VIP EXPERIENCE"
  eventTag: string; // "Asian Games · Nagoya"
  scarcityTag?: string; // "FEW LEFT"
  avatarUrl?: string;
  title: string; // "Breakfast with Neeraj Chopra"
  subtitle: string; // "Exclusive 1-on-1 session · ITC Maurya · New Delhi"
  price: string; // "₹12,500"
  priceSuffix?: string; // "/ person"
  onBook: () => void;
};

export type HeroCard = LiveCard | UpcomingCard | VipCard;

const AUTO_ADVANCE_MS = 5000;

function useCountdown(targetMs: number) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setLabel("Starting now");
        return;
      }
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      setLabel(days > 0 ? `${days}d ${hours}h` : `${hours}h`);
    };
    tick();
    const iv = setInterval(tick, 60_000);
    return () => clearInterval(iv);
  }, [targetMs]);
  return label;
}

const OV_DOT_COLOR: Record<LiveCard["overSummary"][number]["kind"], string> = {
  wicket: "#e91e8c",
  dot: "#2a2a32",
  run: "#f59e0b",
  four: "#22c55e",
  six: "#22c55e",
};

function LiveCardView({ card }: { card: LiveCard }) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden p-4"
      style={{ background: "linear-gradient(135deg,#1a0b1e,#12040f)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <span className="text-[10px] font-semibold text-white/50 bg-white/[0.06] px-2 py-1 rounded-full">
            {card.competition}
          </span>
        </div>
        <span className="text-[10px] font-bold text-white/40">{card.oversLabel}</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide mb-0.5">
            {card.teamAName}
          </p>
          <p className="text-2xl font-black text-white leading-none">
            {card.teamAShort}
            <span className="ml-2 text-2xl font-black">{card.teamAScore.split("/")[0]}</span>
            <span className="text-sm font-bold text-white/40">
              /{card.teamAScore.split("/")[1]}
            </span>
          </p>
        </div>

        <span className="text-[11px] font-bold text-white/30 px-2">vs</span>

        <div className="min-w-0 text-right">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide mb-0.5">
            {card.teamBName}
          </p>
          <p className="text-2xl font-black text-white leading-none">
            {card.teamBScore ?? "—"}
            <span className="ml-2">{card.teamBShort}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-white/40 mr-1">OV</span>
          {card.overSummary.map((b, i) => (
            <span
              key={i}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white"
              style={{ background: OV_DOT_COLOR[b.kind] }}
            >
              {b.kind === "wicket" ? "W" : b.label}
            </span>
          ))}
        </div>
        {card.rrr && <span className="text-[10px] font-bold text-white/40">{card.rrr}</span>}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={card.onJoin}
        className="w-full py-3 rounded-full font-extrabold text-white text-[13px] flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
      >
        <Activity size={14} />
        Join Live Room · {card.fanCount >= 1000 ? `${(card.fanCount / 1000).toFixed(1)}K` : card.fanCount} fans
      </motion.button>
    </div>
  );
}

function UpcomingCardView({ card }: { card: UpcomingCard }) {
  const countdown = useCountdown(card.startsInMs);
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden p-4"
      style={{ background: "linear-gradient(135deg,#0b1330,#050814)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-blue-300 bg-blue-400/10 px-2 py-1 rounded-full">
            UPCOMING
          </span>
          <span className="text-[10px] font-semibold text-white/50 bg-white/[0.06] px-2 py-1 rounded-full">
            {card.competition}
          </span>
        </div>
        <span className="text-[10px] font-bold text-amber-300">⏱ {countdown}</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide mb-0.5">
            {card.teamAName}
          </p>
          <p className="text-2xl font-black text-white leading-none">{card.teamAShort}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-200">
          VS
        </div>
        <div className="min-w-0 text-right">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide mb-0.5">
            {card.teamBName}
          </p>
          <p className="text-2xl font-black text-white leading-none">{card.teamBShort}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 bg-white/[0.05] rounded-xl px-3 py-2.5">
        <MapPin size={13} className="text-white/40 shrink-0" />
        <span className="text-[11px] text-white/60 font-medium truncate">{card.venue}</span>
        <span className="ml-auto text-[11px] text-white/60 font-bold shrink-0">{card.time}</span>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={card.onNotify}
        className="w-full py-3 rounded-full font-extrabold text-white text-[13px] flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#4f46e5,#3b82f6)" }}
      >
        <Bell size={14} />
        Set Reminder · Notify Me
      </motion.button>
    </div>
  );
}

function VipCardView({ card }: { card: VipCard }) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden p-4"
      style={{ background: "linear-gradient(135deg,#241005,#150701)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-amber-300 bg-amber-400/10 px-2 py-1 rounded-full">
            {card.tag}
          </span>
          <span className="text-[10px] font-semibold text-white/50 bg-white/[0.06] px-2 py-1 rounded-full">
            {card.eventTag}
          </span>
        </div>
        {card.scarcityTag && (
          <span className="text-[10px] font-extrabold text-rose-300 bg-rose-500/15 px-2 py-1 rounded-full">
            {card.scarcityTag}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
          {card.avatarUrl ? (
            <img src={card.avatarUrl} alt={card.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">🥇</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-extrabold text-white leading-tight truncate">{card.title}</p>
          <p className="text-[11px] text-white/50 truncate">{card.subtitle}</p>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-xl font-black text-amber-300">{card.price}</span>
        {card.priceSuffix && (
          <span className="text-[11px] font-semibold text-white/40">{card.priceSuffix}</span>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={card.onBook}
        className="w-full py-3 rounded-full font-extrabold text-white text-[13px]"
        style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)" }}
      >
        Book Experience · Limited Slots
      </motion.button>
    </div>
  );
}

export default function HeroCarousel({ cards }: { cards: HeroCard[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (cards.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % cards.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cards.length]);

  if (cards.length === 0) return null;
  const active = cards[index];

  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % cards.length);
    }, AUTO_ADVANCE_MS);
  };

  return (
    <div className="w-full pt-3">
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {active.type === "live" && <LiveCardView card={active} />}
            {active.type === "upcoming" && <UpcomingCardView card={active} />}
            {active.type === "vip" && <VipCardView card={active} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {cards.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {cards.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setIndex(i);
                restartTimer();
              }}
              className="h-1.5 rounded-full border-none cursor-pointer transition-all duration-200"
              style={{
                width: i === index ? 18 : 6,
                background: i === index ? "linear-gradient(90deg,#E91E8C,#FF6B35)" : "rgba(255,255,255,0.2)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}