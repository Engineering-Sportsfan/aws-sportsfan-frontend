"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface SpotlightItem {
  id: string;
  status: "FINAL" | "LIVE" | "UPCOMING";
  title: string;
  subtitle: string;
  info: string;
  buttonText: string;
  borderColor: string;
  badgeBg: string;
  badgeTextColor: string;
  icon?: string;
  route: string;
}

const SPORT_SPOTLIGHT_ITEMS: Record<string, SpotlightItem[]> = {
  mixed: [
    {
      id: "neeraj-chopra",
      status: "FINAL",
      title: "Neeraj Chopra",
      subtitle: "Javelin Throw",
      info: "91.02m PB · World #2",
      buttonText: "Details",
      borderColor: "rgba(233, 30, 140, 0.4)",
      badgeBg: "rgba(233, 30, 140, 0.15)",
      badgeTextColor: "#FF52B5",
      icon: "🏹",
      route: "/MainModules/AthleteHomePage",
    },
    {
      id: "jyothi-yarraji",
      status: "LIVE",
      title: "Jyothi Yarraji",
      subtitle: "100m Hurdles",
      info: "SF · Heat 2 in progress",
      buttonText: "Watch Live",
      borderColor: "rgba(79, 70, 229, 0.4)",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeTextColor: "#34D399",
      icon: "🏃",
      route: "/MainModules/WatchAlong",
    },
    {
      id: "mens-100m",
      status: "UPCOMING",
      title: "Men's 100m",
      subtitle: "Sprint Final",
      info: "Tonight · 7:30 PM IST",
      buttonText: "Details",
      borderColor: "rgba(245, 158, 11, 0.4)",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeTextColor: "#FBBF24",
      route: "/MainModules/AthleteMatchCenter",
    },
  ],
  athletics: [
    {
      id: "neeraj-chopra",
      status: "FINAL",
      title: "Neeraj Chopra",
      subtitle: "Javelin Throw",
      info: "91.02m PB · World #2",
      buttonText: "Details",
      borderColor: "rgba(233, 30, 140, 0.4)",
      badgeBg: "rgba(233, 30, 140, 0.15)",
      badgeTextColor: "#FF52B5",
      icon: "🏹",
      route: "/MainModules/AthleteHomePage",
    },
    {
      id: "jyothi-yarraji",
      status: "LIVE",
      title: "Jyothi Yarraji",
      subtitle: "100m Hurdles",
      info: "SF · Heat 2 in progress",
      buttonText: "Watch Live",
      borderColor: "rgba(79, 70, 229, 0.4)",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeTextColor: "#34D399",
      icon: "🏃",
      route: "/MainModules/WatchAlong",
    },
    {
      id: "mens-100m",
      status: "UPCOMING",
      title: "Men's 100m",
      subtitle: "Sprint Final",
      info: "Tonight · 7:30 PM IST",
      buttonText: "Details",
      borderColor: "rgba(245, 158, 11, 0.4)",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeTextColor: "#FBBF24",
      route: "/MainModules/AthleteMatchCenter",
    },
  ],
  cricket: [
    {
      id: "virat-kohli",
      status: "FINAL",
      title: "Virat Kohli",
      subtitle: "India vs Sri Lanka Test",
      info: "113* (142) · Day 1",
      buttonText: "Highlights",
      borderColor: "rgba(34, 197, 94, 0.4)",
      badgeBg: "rgba(34, 197, 94, 0.15)",
      badgeTextColor: "#4ADE80",
      icon: "🏏",
      route: "/MainModules/AthleteHomePage",
    },
    {
      id: "rohit-sharma",
      status: "LIVE",
      title: "Rohit Sharma",
      subtitle: "India vs Sri Lanka Test",
      info: "82* (95) · Batting",
      buttonText: "Watch Live",
      borderColor: "rgba(79, 70, 229, 0.4)",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeTextColor: "#34D399",
      icon: "🏏",
      route: "/MainModules/WatchAlong",
    },
    {
      id: "jasprit-bumrah",
      status: "UPCOMING",
      title: "Jasprit Bumrah",
      subtitle: "Bowling Spell",
      info: "Starts in 10 mins",
      buttonText: "Details",
      borderColor: "rgba(245, 158, 11, 0.4)",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeTextColor: "#FBBF24",
      icon: "🏏",
      route: "/MainModules/AthleteMatchCenter",
    },
  ],
  football: [
    {
      id: "cristiano-ronaldo",
      status: "FINAL",
      title: "Cristiano Ronaldo",
      subtitle: "Al Nassr vs Al Hilal",
      info: "2 Goals · Won 2-1",
      buttonText: "Highlights",
      borderColor: "rgba(59, 130, 246, 0.4)",
      badgeBg: "rgba(59, 130, 246, 0.15)",
      badgeTextColor: "#60A5FA",
      icon: "⚽",
      route: "/MainModules/AthleteHomePage",
    },
    {
      id: "lionel-messi",
      status: "LIVE",
      title: "Lionel Messi",
      subtitle: "Inter Miami vs Orlando",
      info: "1 Assist · 65' in progress",
      buttonText: "Watch Live",
      borderColor: "rgba(79, 70, 229, 0.4)",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeTextColor: "#34D399",
      icon: "⚽",
      route: "/MainModules/WatchAlong",
    },
    {
      id: "neymar-jr",
      status: "UPCOMING",
      title: "Neymar Jr",
      subtitle: "Al Hilal return match",
      info: "Tomorrow · 9:00 PM",
      buttonText: "Details",
      borderColor: "rgba(245, 158, 11, 0.4)",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeTextColor: "#FBBF24",
      icon: "⚽",
      route: "/MainModules/AthleteMatchCenter",
    },
  ],
};

const getSpotlightItems = (sport: string): SpotlightItem[] => {
  const normalized = sport.toLowerCase();
  if (normalized in SPORT_SPOTLIGHT_ITEMS) {
    return SPORT_SPOTLIGHT_ITEMS[normalized];
  }
  
  // Dynamic generic fallback for other sports
  const capitalized = sport.charAt(0).toUpperCase() + sport.slice(1);
  return [
    {
      id: `${normalized}-champ`,
      status: "FINAL",
      title: `${capitalized} Finals`,
      subtitle: `${capitalized} Championship`,
      info: "Gold Medal Match Highlights",
      buttonText: "Highlights",
      borderColor: "rgba(236, 72, 153, 0.4)",
      badgeBg: "rgba(236, 72, 153, 0.15)",
      badgeTextColor: "#F472B6",
      icon: "🏆",
      route: "/MainModules/AthleteHomePage",
    },
    {
      id: `${normalized}-live`,
      status: "LIVE",
      title: `${capitalized} Live Session`,
      subtitle: "Semi-finals",
      info: "Action in progress",
      buttonText: "Watch Live",
      borderColor: "rgba(79, 70, 229, 0.4)",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeTextColor: "#34D399",
      icon: "⚡",
      route: "/MainModules/WatchAlong",
    },
    {
      id: `${normalized}-upcoming`,
      status: "UPCOMING",
      title: `Next ${capitalized} Match`,
      subtitle: "Opening Rounds",
      info: "Later today",
      buttonText: "Details",
      borderColor: "rgba(245, 158, 11, 0.4)",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeTextColor: "#FBBF24",
      icon: "📅",
      route: "/MainModules/AthleteMatchCenter",
    },
  ];
};

interface HighlightMatch {
  id: string;
  status: "DONE" | "LIVE" | "UPCOMING";
  competition: string;
  sportEmoji: string;
  teamA: {
    flag: string;
    name: string;
    score: string;
  };
  teamB: {
    flag: string;
    name: string;
    score: string;
  };
  summary: string;
}

const CRICKET_HIGHLIGHTS: HighlightMatch[] = [
  {
    id: "cricket-hl-1",
    status: "DONE",
    competition: "ICC Champions Trophy",
    sportEmoji: "🏏",
    teamA: { flag: "IN", name: "India", score: "287/4" },
    teamB: { flag: "PK", name: "Pakistan", score: "242/8" },
    summary: "India won by 45 runs · Bumrah 4/42",
  },
  {
    id: "cricket-hl-2",
    status: "LIVE",
    competition: "Test Series",
    sportEmoji: "🏏",
    teamA: { flag: "AU", name: "Australia", score: "312/6" },
    teamB: { flag: "ENG", name: "England", score: "289/9" },
    summary: "ENG need 24 off 18 balls",
  },
];

const FOOTBALL_HIGHLIGHTS: HighlightMatch[] = [
  {
    id: "football-hl-1",
    status: "DONE",
    competition: "Liga Portugal",
    sportEmoji: "⚽",
    teamA: { flag: "POR", name: "FC Porto", score: "2" },
    teamB: { flag: "SLB", name: "Benfica", score: "1" },
    summary: "Evanilson 24', 67' · Di María 52'",
  },
  {
    id: "football-hl-2",
    status: "LIVE",
    competition: "Champions League",
    sportEmoji: "⚽",
    teamA: { flag: "RMA", name: "Real Madrid", score: "3" },
    teamB: { flag: "MCI", name: "Man City", score: "3" },
    summary: "Tense final minutes at Bernabéu",
  },
];

const getGenericMatchHighlights = (sport: string): HighlightMatch[] => {
  const normalized = sport.toLowerCase();
  const capitalized = sport.charAt(0).toUpperCase() + sport.slice(1);
  const emoji = normalized === "badminton" ? "🏸" : normalized === "hockey" ? "🏑" : "🏆";
  
  return [
    {
      id: `${normalized}-hl-1`,
      status: "DONE",
      competition: `${capitalized} Open`,
      sportEmoji: emoji,
      teamA: { flag: "IND", name: "India", score: "2" },
      teamB: { flag: "MAS", name: "Malaysia", score: "1" },
      summary: "India won final match in straight sets",
    },
    {
      id: `${normalized}-hl-2`,
      status: "LIVE",
      competition: `Asian Games`,
      sportEmoji: emoji,
      teamA: { flag: "IND", name: "India", score: "3" },
      teamB: { flag: "KOR", name: "Korea", score: "2" },
      summary: "Q4 · Tense finish in progress",
    },
  ];
};

export default function AthleticsSpotlight({ sport = "mixed" }: { sport?: string }) {
  const router = useRouter();

  const isMixed = sport === "mixed" || sport === "athletics";
  const title = isMixed ? "Athletics Spotlight" : `${sport.charAt(0).toUpperCase() + sport.slice(1)} Highlights`;

  // Custom theme variables for match scorecards
  const isCricket = sport.toLowerCase() === "cricket";
  const isFootball = sport.toLowerCase() === "football";

  let cardBgStyle = "linear-gradient(160deg,#12213f,#0a1226)";
  let borderStrokeColor = "rgba(255,255,255,0.06)";
  if (isCricket) {
    cardBgStyle = "linear-gradient(160deg,#041a0f,#020d08)";
    borderStrokeColor = "rgba(16, 185, 129, 0.15)";
  } else if (isFootball) {
    cardBgStyle = "linear-gradient(160deg,#061b2c,#030d16)";
    borderStrokeColor = "rgba(59, 130, 246, 0.15)";
  } else if (!isMixed) {
    cardBgStyle = "linear-gradient(160deg,#170a2b,#0c0517)";
    borderStrokeColor = "rgba(139, 92, 246, 0.15)";
  }

  // Get highlights data
  let matchHighlights: HighlightMatch[] = [];
  if (!isMixed) {
    if (isCricket) {
      matchHighlights = CRICKET_HIGHLIGHTS;
    } else if (isFootball) {
      matchHighlights = FOOTBALL_HIGHLIGHTS;
    } else {
      matchHighlights = getGenericMatchHighlights(sport);
    }
  }

  const items = getSpotlightItems(sport);

  return (
    <div className="w-full mt-5">
      {/* Header section matching style of Playbook Drops, Watch Along, etc. */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">{title}</h3>
        <button
          type="button"
          onClick={() => router.push("/MainModules/AthleteHomePage")}
          className="flex items-center gap-0.5 text-[12px] font-bold cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          style={{ color: "#E91E8C" }}
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      {isMixed ? (
        /* Original horizontal scroll of athletes */
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {items.map((item) => (
            <motion.div
              key={item.id}
              onClick={() => router.push(item.route)}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="shrink-0 w-[210px] h-[225px] rounded-[24px] overflow-hidden flex flex-col justify-between snap-start cursor-pointer p-5 transition-shadow"
              style={{
                background: "linear-gradient(135deg, #11081c 0%, #07030c 100%)",
                border: `1px solid ${item.borderColor}`,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* Top row of card */}
              <div className="flex justify-between items-start w-full">
                {/* Status Badge */}
                <span
                  className="text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background: item.badgeBg,
                    color: item.badgeTextColor,
                  }}
                >
                  {item.status}
                </span>

                {/* Icon at top right if present */}
                {item.icon && (
                  <span className="text-xl leading-none select-none filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                    {item.icon}
                  </span>
                )}
              </div>

              {/* Middle Section: Title, Subtitle, Info */}
              <div className="flex flex-col gap-1 w-full my-auto">
                <h4 className="text-[17px] font-extrabold text-white leading-tight">
                  {item.title}
                </h4>
                <p className="text-[12px] font-bold text-white/40 leading-none">
                  {item.subtitle}
                </p>
                <p className="text-[12px] font-extrabold text-white/80 leading-none mt-2">
                  {item.info}
                </p>
              </div>

              {/* Bottom Section: Action Button */}
              <div className="w-full">
                <div
                  className="w-full py-2.5 rounded-2xl font-extrabold text-white text-[13px] text-center shadow-lg transition-transform"
                  style={{
                    background: "linear-gradient(90deg, #a855f7 0%, #ec4899 100%)",
                  }}
                >
                  {item.buttonText}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* The new match scorecards grid layout (matching screenshot) */
        <div className="grid grid-cols-2 gap-3">
          {matchHighlights.map((match) => {
            const isDone = match.status === "DONE";
            const isLive = match.status === "LIVE";
            
            // Badge style classes
            let badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            if (isDone) {
              badgeClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
            } else if (match.status === "UPCOMING") {
              badgeClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
            }

            return (
              <div
                key={match.id}
                onClick={() => router.push("/MainModules/AthleteHomePage")}
                className={`rounded-[24px] hover:cursor-pointer p-4 min-h-[160px] flex flex-col justify-between transition-all duration-200 border border-white/[0.06]`}
                style={{
                  background: cardBgStyle,
                  borderColor: borderStrokeColor,
                }}
              >
                {/* Top Row: Badge & Competition */}
                <div className="flex justify-between items-center w-full mb-3">
                  <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md tracking-wider leading-none uppercase ${badgeClass}`}>
                    {match.status}
                  </span>
                  <span className="text-[11px] text-white/50 font-bold flex items-center gap-1">
                    <span>{match.sportEmoji}</span>
                    {match.competition}
                  </span>
                </div>

                {/* Middle Row: Team Scores */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-white/40 w-5">{match.teamA.flag}</span>
                      <span className={`text-[14px] font-extrabold text-white`}>{match.teamA.name}</span>
                    </div>
                    <span className="text-[15px] font-black text-white">{match.teamA.score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-white/40 w-5">{match.teamB.flag}</span>
                      <span className={`text-[14px] font-semibold text-white/60`}>{match.teamB.name}</span>
                    </div>
                    <span className="text-[15px] font-black text-white/60">{match.teamB.score}</span>
                  </div>
                </div>

                {/* Bottom Summary */}
                <div className="border-t border-white/[0.06] pt-2.5 mt-2">
                  <p className="text-[11px] text-white/40 font-medium truncate leading-tight">
                    {match.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
