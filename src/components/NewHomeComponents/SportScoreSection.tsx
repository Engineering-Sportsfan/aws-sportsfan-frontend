"use client";
// components\NewHomeComponents\SportScoreSection.tsx

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Bell,
  MapPin,
  Trophy,
  Flag,
  Calendar,
  Award,
  BarChart3,
  Newspaper,
  ChevronRight,
  X,
} from "lucide-react";
import { useRouter } from 'next/navigation';

export type LiveCard = {
  type: "live";
  id: string;
  status: "LIVE";
  competition: string; // e.g. "ODI · Champions Trophy"
  teamAName: string;
  teamAShort: string;
  teamAScore?: string; // "204/32.4"
  teamBName: string;
  teamBShort: string;
  teamBScore?: string; // "—" if not batted yet
  overSummary: { label: string; kind: "wicket" | "dot" | "run" | "four" | "six" }[];
  rrr?: string; // "RRR 7.2"
  oversLabel: string; // "Ov 32.4"
  fanCount: number;
  venue?: string;
  matchLabel?: string; // "Match 22"
  isFootball?: boolean;
  footballScoreA?: number;
  footballScoreB?: number;
  minute?: string; // "85'"
  scorers?: string; // "Evanilson 24', 67' · Di María 52'"
  result?: string; // "INDIA WON by 45 runs"
  manOfMatch?: string; // "Bumrah 4/42"
  ctaLabel?: string;
  bgImageUrl?: string;
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
  tag: string; // "AICHI-NAGOYA, JAPAN · 2026"
  eventTag?: string;
  dateRange?: string; // "19 Sep - 4 Oct"
  title: string; // "ASIAN GAMES 2026"
  subtitle: string; // "India. Passion. Glory."
  bgImageUrl?: string;
  scarcityTag?: string;
  price?: string;
  priceSuffix?: string;
  ctaLabel: string; // "Explore Today's Action"
  onBook: () => void;
};

export type HeroCard = LiveCard | UpcomingCard | VipCard;

export type MedalTally = {
  gold: number;
  silver: number;
  bronze: number;
};

export type IndiaStatsData = {
  eventsToday: number;
  medals: MedalTally;
  countryRank: number;
  flagUrl?: string;
};

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

/* ---------------------------------- VIP / Event hero card (Image 1) ---------------------------------- */

function VipCardView({ card }: { card: VipCard }) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden p-4 min-h-[220px] flex flex-col justify-between"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10,4,20,0.55) 0%, rgba(10,4,20,0.85) 100%), url(${card.bgImageUrl ?? ""
          })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        background: card.bgImageUrl
          ? undefined
          : "linear-gradient(135deg,#1a0b1e,#12040f)",
      }}
    >
      {card.dateRange && (
        <div className="absolute top-4 right-4">
          <span className="text-[11px] font-bold text-white bg-white/10 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {card.dateRange}
          </span>
        </div>
      )}

      <div>
        <p className="text-[11px] font-extrabold tracking-widest text-amber-400 mb-1.5">
          {card.tag}
        </p>
        <h2 className="text-[28px] font-black text-white leading-[1.05] mb-2">
          {card.title}
        </h2>
        <p className="text-[13px] font-medium text-white/70">{card.subtitle}</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={card.onBook}
        className="mt-4 self-start px-5 py-3 rounded-full font-extrabold text-white text-[13px] flex items-center gap-2"
        style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)" }}
      >
        {card.ctaLabel}
        <span>→</span>
      </motion.button>
    </div>
  );
}

/* ---------------------------------- Live football card (Image 2) ---------------------------------- */

// function LiveFootballCardView({ card }: { card: LiveCard }) {
//   return (
//     <div
//       className="relative w-full rounded-2xl overflow-hidden p-4 min-h-[220px]"
//       style={{
//         backgroundImage: `linear-gradient(180deg, rgba(6,6,10,0.55) 0%, rgba(6,6,10,0.9) 100%), url(${card.bgImageUrl ?? ""
//           })`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundColor: "#111318",
//       }}
//     >
//       <div className="flex items-center gap-2 mb-4">
//         <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
//           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//           LIVE
//         </span>
//         <span className="text-[10px] font-semibold text-white/70 bg-white/[0.08] px-2.5 py-1 rounded-full">
//           {card.competition}
//         </span>
//       </div>

//       <p className="text-[10px] font-extrabold tracking-widest text-amber-400 mb-3">
//         {card.matchLabel}
//       </p>

//       <div className="bg-black/40 rounded-xl p-3.5 mb-3">
//         <div className="flex items-center justify-between">
//           <div className="min-w-0">
//             <p className="text-[13px] font-extrabold text-white mb-0.5">{card.teamAName}</p>
//             <p className="text-[11px] text-white/50">Home · {card.venue}</p>
//           </div>
//           <p className="text-3xl font-black text-white px-2">{card.footballScoreA}</p>
//         </div>

//         <div className="flex items-center gap-2 my-1.5">
//           <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
//             {card.minute}
//           </span>
//           <div className="h-px flex-1 bg-white/10" />
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="min-w-0">
//             <p className="text-[13px] font-extrabold text-white mb-0.5">{card.teamBName}</p>
//             <p className="text-[11px] text-white/50">Away</p>
//           </div>
//           <p className="text-3xl font-black text-white px-2">{card.footballScoreB}</p>
//         </div>
//       </div>

//       {card.scorers && (
//         <p className="text-[11px] text-white/50 mb-4 truncate">{card.scorers}</p>
//       )}

//       <motion.button
//         whileTap={{ scale: 0.97 }}
//         onClick={card.onJoin}
//         className="w-full py-3 rounded-full font-extrabold text-white text-[13px] flex items-center justify-center gap-2"
//         style={{ background: "linear-gradient(135deg,#4f46e5,#3b82f6)" }}
//       >
//         {card.ctaLabel ?? "Watch Live"}
//         <span>→</span>
//       </motion.button>
//     </div>
//   );
// }

/* ---------------------------------- Live cricket card (Image 3) ---------------------------------- */

function LiveCricketCardView({ card }: { card: LiveCard }) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden p-4 min-h-[220px]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10,4,20,0.55) 0%, rgba(10,4,20,0.92) 100%), url(${card.bgImageUrl ?? ""
          })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#1a0b1e",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </span>
        <span className="text-[10px] font-semibold text-white/70 bg-white/[0.08] px-2.5 py-1 rounded-full">
          {card.competition}
        </span>
      </div>

      <p className="text-[10px] font-extrabold tracking-widest text-amber-400 mb-3">
        {card.matchLabel}
      </p>

      <div className="space-y-2.5 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-white">{card.teamAName}</span>
          <span className="text-xl font-black text-white">
            {/* {card.teamAScore.split("/")[0]}
            <span className="text-white/40">/{card.teamAScore.split("/")[1]}</span> */}
            {(card.teamAScore ?? "0/0").split("/")[0]}
            <span className="text-white/40">/{(card.teamAScore ?? "0/0").split("/")[1]}</span>
            <span className="text-[11px] font-semibold text-white/40 ml-1">
              ({card.oversLabel})
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-white">{card.teamBName}</span>
          <span className="text-xl font-black text-white">{card.teamBScore ?? "—"}</span>
        </div>
      </div>

      {/* {card.result && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full">
            {card.result}
          </span>
          {card.manOfMatch && (
            <span className="text-[11px] text-white/50">{card.manOfMatch}</span>
          )}
        </div>
      )} */}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={card.onJoin}
        className="w-full py-3 rounded-full font-extrabold text-white text-[13px] flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
      >
        {card.ctaLabel ?? "Wtch Along"}
        <span>→</span>
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

/* ---------------------------------- Carousel (images 1-3): 5s autoplay + dots ---------------------------------- */

function HeroCarousel({ cards }: { cards: HeroCard[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

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
            {active.type === "vip" && <VipCardView card={active} />}
            {/* {active.type === "live" && active.isFootball && (
              <LiveFootballCardView card={active} />
            )} */}
            {active.type === "live" && !active.isFootball && (
              <LiveCricketCardView card={active} />
            )}
            {active.type === "upcoming" && <UpcomingCardView card={active} />}
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
                background:
                  i === index
                    ? "linear-gradient(90deg,#E91E8C,#FF6B35)"
                    : "rgba(255,255,255,0.2)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- India stats bar (Image 4) ---------------------------------- */

function IndiaStatsBar({
  data,
  onAllSportsClick,
}: {
  data: IndiaStatsData;
  onAllSportsClick?: () => void;
}) {
  const navItems = [
    { label: "All Sports", icon: Trophy },
    { label: "India", icon: Flag },
    { label: "Schedule", icon: Calendar },
    { label: "Medal Tally", icon: Award },
    { label: "Record Explore", icon: BarChart3 },
    { label: "News", icon: Newspaper },
  ];

  return (
    <div className="w-full mt-3 rounded-2xl overflow-hidden bg-[#0e0a16] border border-white/[0.06]">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          {data.flagUrl ? (
            <img src={data.flagUrl} alt="India" className="w-9 h-6 rounded object-fit" />
          ) : (
            <div className="w-9 h-6 rounded overflow-hidden flex flex-col shrink-0">
              <div className="flex-1 bg-orange-500" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-green-600" />
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide">
              India Today
            </p>
            <p className="text-[15px] font-extrabold text-white">{data.eventsToday} Events</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-lg">🥇</span>
            <p className="text-lg font-black text-amber-400 leading-none mt-0.5">
              {data.medals.gold}
            </p>
          </div>
          <div className="text-center">
            <span className="text-lg">🥈</span>
            <p className="text-lg font-black text-slate-300 leading-none mt-0.5">
              {data.medals.silver}
            </p>
          </div>
          <div className="text-center">
            <span className="text-lg">🥉</span>
            <p className="text-lg font-black text-orange-400 leading-none mt-0.5">
              {data.medals.bronze}
            </p>
          </div>
          <div className="text-right pl-1">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide">
              India Rank
            </p>
            <p className="text-2xl font-black text-emerald-400 leading-none">
              #{data.countryRank}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 border-t border-white/[0.06]">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (label === "All Sports" && onAllSportsClick) {
                onAllSportsClick();
              }
            }}
            className="flex flex-col items-center justify-center gap-1.5 py-3 hover:bg-white/[0.04] transition-colors"
          >
            <Icon size={16} className="text-white/70" />
            <span className="text-[9px] font-semibold text-white/60 text-center leading-tight px-0.5">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- Live & Upcoming Matches strip ---------------------------------- */

export type MiniMatchCard = {
  id: string;
  status: "LIVE" | "UPCOMING" | "DONE";
  sportEmoji: string;
  sport: string; // "Badminton"
  subtitle: string; // "Lakshya Sen (IND)"
  scoreLine?: string; // "22 - 21"
  metaLine?: string; // "Round of 16"
  countdownLabel?: string; // "Starts in"
  countdown?: string; // "18m 45s"
  scheduleLine?: string; // "Today, 7:30 PM"
  medalEmoji?: string; // "🥇"
  medalLabel?: string; // "Gold"
  resultCountry?: string; // "India"
  ctaLabel: string;
  ctaGradient: string;
  onAction: () => void;
};

const STATUS_STYLES: Record<
  MiniMatchCard["status"],
  { badgeBg: string; badgeText: string; dot?: boolean }
> = {
  LIVE: { badgeBg: "bg-emerald-400/10", badgeText: "text-emerald-400", dot: true },
  UPCOMING: { badgeBg: "bg-violet-400/10", badgeText: "text-violet-300", dot: false },
  DONE: { badgeBg: "bg-amber-400/10", badgeText: "text-amber-300", dot: false },
};

function MiniMatchCardView({ card }: { card: MiniMatchCard }) {
  const statusStyle = STATUS_STYLES[card.status];

  return (
    <div className="shrink-0 w-[190px] rounded-2xl bg-[#12101c] border border-white/[0.06] p-3.5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-1 rounded-full ${statusStyle.badgeBg} ${statusStyle.badgeText}`}
        >
          {statusStyle.dot && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          {card.status}
        </span>
        <span className="text-base leading-none">{card.sportEmoji}</span>
      </div>

      <p className="text-[14px] font-extrabold text-white mb-0.5">{card.sport}</p>
      <p className="text-[11px] text-white/50 mb-3 truncate">{card.subtitle}</p>

      <div className="flex-1 mb-3">
        {card.status !== "UPCOMING" && card.scoreLine && (
          <>
            <p className="text-2xl font-black text-white leading-none">{card.scoreLine}</p>
            {card.metaLine && (
              <p className="text-[10px] text-white/40 mt-1">{card.metaLine}</p>
            )}
          </>
        )}

        {card.status === "UPCOMING" && (
          <>
            <p className="text-[11px] font-semibold text-white/50">{card.countdownLabel}</p>
            <p className="text-lg font-black text-white leading-tight">{card.countdown}</p>
            {card.scheduleLine && (
              <p className="text-[10px] text-white/40 mt-1">{card.scheduleLine}</p>
            )}
          </>
        )}

        {card.status === "DONE" && card.medalEmoji && (
          <>
            <p className="text-lg font-extrabold text-amber-400 flex items-center gap-1.5">
              <span>{card.medalEmoji}</span>
              {card.medalLabel}
            </p>
            {card.resultCountry && (
              <p className="text-[10px] text-white/40 mt-1">{card.resultCountry}</p>
            )}
          </>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={card.onAction}
        className="w-full py-2.5 rounded-full font-extrabold text-white text-[11px]"
        style={{ background: card.ctaGradient }}
      >
        {card.ctaLabel}
      </motion.button>
    </div>
  );
}

function MatchesStrip({ cards }: { cards: MiniMatchCard[] }) {
  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">Live &amp; Upcoming Matches</h3>
        <button
          type="button"
          className="flex items-center gap-0.5 text-[12px] font-bold"
          style={{ color: "#E91E8C" }}
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {cards.map((c) => (
          <div key={c.id} className="snap-start">
            <MiniMatchCardView card={c} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- Mock data (static - no router needed) ---------------------------------- */

const MOCK_INDIA_STATS: IndiaStatsData = {
  eventsToday: 18,
  medals: { gold: 7, silver: 5, bronze: 11 },
  countryRank: 3,
};

const MOCK_MINI_MATCHES: MiniMatchCard[] = [
  {
    id: "badminton-lakshya",
    status: "LIVE",
    sportEmoji: "🏸",
    sport: "Badminton",
    subtitle: "Lakshya Sen (IND)",
    scoreLine: "22 - 21",
    metaLine: "Round of 16",
    ctaLabel: "Watch Live",
    ctaGradient: "linear-gradient(135deg,#E91E8C,#FF6B35)",
    onAction: () => console.log("Navigate to Badminton live room"),
  },
  {
    id: "athletics-100m",
    status: "UPCOMING",
    sportEmoji: "🏃",
    sport: "Athletics",
    subtitle: "Men's 100m Final",
    countdownLabel: "Starts in",
    countdown: "18m 45s",
    scheduleLine: "Today, 7:30 PM",
    ctaLabel: "Set Reminder",
    ctaGradient: "linear-gradient(135deg,#7c3aed,#a855f7)",
    onAction: () => console.log("Set reminder for Athletics 100m final"),
  },
  {
    id: "hockey-ind-kor",
    status: "LIVE",
    sportEmoji: "🏑",
    sport: "Hockey",
    subtitle: "India vs Korea",
    scoreLine: "2 - 1",
    metaLine: "Q3 · 45:12",
    ctaLabel: "Match Center",
    ctaGradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
    onAction: () => console.log("Navigate to Hockey match center"),
  },
  {
    id: "shooting-10m-air-rifle",
    status: "DONE",
    sportEmoji: "🎯",
    sport: "Shooting",
    subtitle: "10m Air Rifle Mixed",
    medalEmoji: "🥇",
    medalLabel: "Gold",
    resultCountry: "India",
    ctaLabel: "Results",
    ctaGradient: "linear-gradient(135deg,#334155,#1e293b)",
    onAction: () => console.log("Navigate to Shooting results"),
  },
];

const SPORTS_LIST = [
  { id: "mixed", label: "Mixed", emoji: "🏆" },
  { id: "athletics", label: "Athletics", emoji: "🏃" },
  { id: "cricket", label: "Cricket", emoji: "🏏" },
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "badminton", label: "Badminton", emoji: "🏸" },
  { id: "kabaddi", label: "Kabaddi", emoji: "🤼" },
  { id: "lawn tennis", label: "Lawn Tennis", emoji: "🎾" },
  { id: "hockey", label: "Hockey", emoji: "🏑" },
  { id: "wrestling", label: "Wrestling", emoji: "🤼" },
  { id: "shooting", label: "Shooting", emoji: "🎯" },
  { id: "boxing", label: "Boxing", emoji: "🥊" },
  { id: "swimming", label: "Swimming", emoji: "🏊" },
  { id: "weightlifting", label: "Weightlifting", emoji: "🏋️" },
];

export default function SportScoreSection({
  selectedSport: externalSelectedSport,
  onSelectSport,
}: {
  selectedSport?: string;
  onSelectSport?: (sport: string) => void;
}) {
  const router = useRouter();
  const [localSelectedSport, setLocalSelectedSport] = useState("mixed");
  const [isAllSportsOpen, setIsAllSportsOpen] = useState(false);

  const selectedSport = externalSelectedSport ?? localSelectedSport;
  const setSelectedSport = onSelectSport ?? setLocalSelectedSport;

  const MOCK_HERO_CARDS: HeroCard[] = [
    {
      type: "vip",
      id: "asian-games-2026",
      tag: "AICHI-NAGOYA, JAPAN · 2026",
      dateRange: "19 Sep – 4 Oct",
      title: "ASIAN GAMES 2026",
      subtitle: "India. Passion. Glory.",
      bgImageUrl: "/images/asiangames.jpeg",
      ctaLabel: "Explore Today's Action",
      onBook: () => router.push('/MainModules/AsianGame'),
    },
    // {
    //   type: "live",
    //   id: "porto-benfica",
    //   status: "LIVE",
    //   isFootball: true,
    //   competition: "Liga Portugal",
    //   matchLabel: "Football · O Clássico",
    //   teamAName: "FC PORTO",
    //   teamAShort: "POR",
    //   teamBName: "S.L. BENFICA",
    //   teamBShort: "SLB",
    //   footballScoreA: 2,
    //   footballScoreB: 1,
    //   minute: "85'",
    //   venue: "Estádio do Dragão",
    //   scorers: "Evanilson 24', 67' · Di María 52'",
    //   bgImageUrl: "/images/footballground.jpg",
    //   overSummary: [],
    //   oversLabel: "",
    //   fanCount: 0,
    //   ctaLabel: "Watch Live",
    //   onJoin: () => console.log("Navigate to Porto vs Benfica room"),
    // },
    {
      type: "live",
      id: "ind-sl-test2026",
      status: "LIVE",
      isFootball: false,
      competition: "India tour of Sri Lanka 2026",
      matchLabel: "Test · Day 4",
      teamAName: "India",
      teamAShort: "IND",
      teamAScore: "200/4",
      teamBName: "Sri Lanka",
      teamBShort: "SL",
      teamBScore: "284",
      oversLabel: "79.4",
      overSummary: [],
      result: "INDIA WON by 45 runs",
      manOfMatch: "Bumrah 4/42",
      bgImageUrl: "/images/ind_srl_homepage.png",
      fanCount: 0,
      ctaLabel: "Watch Along",
      onJoin: () => router.push("/MainModules/WatchAlong/room/acc569cd-831b-4f3c-ab7d-cf862b11be6a"),
    },
  ];

  const filteredMatches = MOCK_MINI_MATCHES.filter((match) => {
    if (selectedSport === "mixed") return true;
    return match.sport.toLowerCase() === selectedSport;
  });

  return (
    <div className="w-full relative">
      <HeroCarousel cards={MOCK_HERO_CARDS} />
      <IndiaStatsBar data={MOCK_INDIA_STATS} onAllSportsClick={() => setIsAllSportsOpen(true)} />
      {/* <MatchesStrip cards={filteredMatches} /> */}

      <AnimatePresence>
        {isAllSportsOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAllSportsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[420px] bg-[#0c0914] border border-white/[0.08] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl z-10"
            >
              {/* Drag handle style */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3" />
              
              <div className="flex items-start justify-between px-6 pt-1 pb-4">
                <div>
                  <h2 className="text-[22px] font-black text-white leading-tight">All Sports</h2>
                  <p className="text-[11px] text-white/50 mt-1">Select a sport to filter your feed</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAllSportsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 pb-8 grid grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {SPORTS_LIST.map((sport) => {
                  const isSelected = selectedSport === sport.id;
                  return (
                    <div key={sport.id} className="relative pb-3.5 flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSport(sport.id);
                          setIsAllSportsOpen(false);
                        }}
                        className={`w-full aspect-square rounded-2xl border flex flex-col items-center justify-center p-2 transition-all duration-200 ${
                          isSelected
                            ? "border-[#E91E8C] bg-[#E91E8C]/10 shadow-[0_0_15px_rgba(233,30,140,0.15)]"
                            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="text-2xl mb-1">{sport.emoji}</span>
                        <span
                          className={`text-[10px] font-bold text-center leading-tight transition-colors ${
                            isSelected ? "text-[#E91E8C]" : "text-white/60"
                          }`}
                        >
                          {sport.label}
                        </span>
                      </button>
                      {isSelected && (
                        <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#E91E8C]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}