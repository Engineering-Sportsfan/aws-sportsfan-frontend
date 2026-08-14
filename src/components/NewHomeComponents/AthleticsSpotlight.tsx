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

const SPOTLIGHT_ITEMS: SpotlightItem[] = [
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
];

export default function AthleticsSpotlight() {
  const router = useRouter();

  return (
    <div className="w-full mt-5">
      {/* Header section matching style of Playbook Drops, Watch Along, etc. */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">Athletics Spotlight</h3>
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

      {/* Horizontal Scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {SPOTLIGHT_ITEMS.map((item) => (
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
    </div>
  );
}
