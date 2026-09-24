"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  Share2, 
  Bookmark, 
  Check, 
  Bell, 
  ArrowRight,
  Sun,
  Flame,
  Radio,
  ExternalLink,
  Send,
  Loader2,
  Bot
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  welcomeMessageService, 
  RadarCardItem, 
  AgendaEventItem, 
  MorningBriefStory, 
  WelcomeConfig 
} from "@/services/welcomeMessage.service";

export type { RadarCardItem, AgendaEventItem, MorningBriefStory, WelcomeConfig };

interface WelcomeMessageProps {
  userName?: string;
  actionSubtitle?: string;
  onCardClick?: (card: RadarCardItem) => void;
  onSeeAllClick?: () => void;
  onReadBriefClick?: () => void;
}

export default function WelcomeMessage({
  userName: propUserName,
  actionSubtitle: propActionSubtitle,
  onCardClick,
  onSeeAllClick,
  onReadBriefClick,
}: WelcomeMessageProps) {
  const { user, getUserDisplayName, loading: authLoading, authReady } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // ─── Dynamic State from DynamoDB (homeDatabase) ─────────────────────────
  const [radarCards, setRadarCards] = useState<RadarCardItem[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEventItem[]>([]);
  const [briefStories, setBriefStories] = useState<MorningBriefStory[]>([]);
  const [welcomeConfig, setWelcomeConfig] = useState<WelcomeConfig | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [totalDots, setTotalDots] = useState(0);
  
  // Modals state
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [selectedCardDetail, setSelectedCardDetail] = useState<RadarCardItem | null>(null);
  const [notifiedCards, setNotifiedCards] = useState<string[]>([]);
  const [bookmarkedCards, setBookmarkedCards] = useState<string[]>([]);

  // Agenda Ask Flip state
  const [agendaQuestion, setAgendaQuestion] = useState("");
  const [agendaAnswer, setAgendaAnswer] = useState<string | null>(null);
  const [agendaLoading, setAgendaLoading] = useState(false);

  // Brief Ask Flip state
  const [briefQuestion, setBriefQuestion] = useState("");
  const [briefAnswer, setBriefAnswer] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  // Dynamic greeting based on time of day & authenticated user
  const [greeting, setGreeting] = useState("Good morning");
  const [resolvedName, setResolvedName] = useState("");

  // ─── Fetch Dynamic Data from backend DynamoDB (homeDatabase) ───────────
  useEffect(() => {
    let isMounted = true;

    async function loadDynamicHomeData() {
      try {
        setIsLoadingBackend(true);
        const data = await welcomeMessageService.getWelcomeData();
        if (data && isMounted) {
          if (Array.isArray(data.radarCards)) {
            setRadarCards(data.radarCards);
          }
          if (Array.isArray(data.todaysAgenda)) {
            setAgendaEvents(data.todaysAgenda);
          }
          if (Array.isArray(data.morningBrief)) {
            setBriefStories(data.morningBrief);
          }
          if (data.config) {
            setWelcomeConfig(data.config);
          }
        }
      } catch (err) {
        console.warn("[WelcomeMessage] Backend fetch error:", err);
      } finally {
        if (isMounted) setIsLoadingBackend(false);
      }
    }

    loadDynamicHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Time-based greeting & user profile name resolution
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      setGreeting("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }

    if (propUserName && propUserName.trim()) {
      setResolvedName(propUserName.trim());
      return;
    }

    // While authentication is loading, do NOT flash any dummy name
    if (authLoading || (authReady === false)) {
      return;
    }

    if (user?.name) {
      setResolvedName(user.name.split(" ")[0]);
    } else if (typeof getUserDisplayName === "function") {
      const displayName = getUserDisplayName();
      if (
        displayName &&
        !displayName.toLowerCase().startsWith("fan_") &&
        !displayName.toLowerCase().startsWith("guest") &&
        displayName.toLowerCase() !== "fan"
      ) {
        setResolvedName(displayName.split(" ")[0]);
      } else {
        setResolvedName("");
      }
    } else {
      setResolvedName("");
    }
  }, [propUserName, user, getUserDisplayName, authLoading, authReady]);

  // ─── Derive Radar Cards from TODAY'S AGENDA data ────────────────────────
  // Ensures the exact same data from TODAY'S AGENDA is displayed in TODAY ON YOUR RADAR
  const displayedRadarCards = useMemo<RadarCardItem[]>(() => {
    if (agendaEvents.length > 0) {
      return agendaEvents.map((evt, index) => {
        const isLive = evt.statusType === "live" || evt.statusLabel?.toLowerCase() === "live";

        let themeColor: RadarCardItem["themeColor"] = "purple";
        if (evt.themeColor) {
          themeColor = evt.themeColor;
        } else if (isLive || evt.nodeColor === "emerald") {
          themeColor = "emerald";
        } else if (evt.statusType === "up_next" || evt.nodeColor === "amber") {
          themeColor = "amber";
        } else if (evt.nodeColor === "blue" || evt.statusType === "afternoon") {
          themeColor = "cyan";
        } else {
          const colors: RadarCardItem["themeColor"][] = ["purple", "cyan", "rose", "emerald", "amber"];
          themeColor = colors[index % colors.length];
        }

        const displayStatus = isLive ? "LIVE" : (evt.time || evt.statusLabel || "UPCOMING");

        return {
          id: evt.id || `agenda_${index}`,
          sport: evt.sport,
          event: evt.subEvent || evt.sport,
          round: evt.detail || evt.time,
          subEvent: evt.subEvent,
          detail: evt.detail,
          time: evt.time,
          status: displayStatus,
          statusType: evt.statusType,
          statusLabel: evt.statusLabel,
          isLive,
          icon: evt.icon || "🏆",
          themeColor,
          venue: evt.venue,
          teams: evt.teams,
          summary: evt.summary || `${evt.sport} (${evt.subEvent || ""}) - ${evt.detail || ""}${evt.venue ? ` at ${evt.venue}` : ""}. Scheduled time: ${evt.time || "Today"}.`,
          order: evt.order ?? index + 1,
          active: evt.active,
        };
      });
    }
    return radarCards;
  }, [agendaEvents, radarCards]);

  // Dynamically sync dot count with radar cards length
  useEffect(() => {
    if (displayedRadarCards.length <= 1) {
      setTotalDots(displayedRadarCards.length);
    } else if (displayedRadarCards.length <= 3) {
      setTotalDots(displayedRadarCards.length);
    } else {
      setTotalDots(Math.min(5, Math.ceil(displayedRadarCards.length / 2)));
    }
  }, [displayedRadarCards.length]);

  // Handle horizontal scroll & indicator sync
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || totalDots <= 1) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setActivePageIndex(0);
      return;
    }
    const progress = scrollLeft / maxScroll;
    const page = Math.min(totalDots - 1, Math.max(0, Math.round(progress * (totalDots - 1))));
    setActivePageIndex(page);
  }, [totalDots]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Scroll to dot page
  const scrollToDot = (dotIndex: number) => {
    if (!scrollRef.current || totalDots <= 1) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const targetScroll = (dotIndex / (totalDots - 1)) * maxScroll;
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
    setActivePageIndex(dotIndex);
  };

  const toggleNotify = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifiedCards((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedCards((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Dynamic suggested prompts derived from live events
  const dynamicAgendaPrompts = useMemo(() => {
    if (agendaEvents.length > 0) {
      return agendaEvents.slice(0, 4).map((evt) => {
        if (evt.statusType === "live") {
          return `What is the live status of ${evt.sport} (${evt.subEvent})?`;
        }
        return `What time is ${evt.sport} - ${evt.subEvent}?`;
      });
    }
    return [
      "Which live event needs my attention right now?",
      "What are the marquee matches on today's schedule?",
      "What time should I set a reminder for?",
    ];
  }, [agendaEvents]);

  const dynamicBriefPrompts = useMemo(() => {
    if (briefStories.length > 0) {
      return briefStories.slice(0, 4).map((story) => `Tell me more about "${story.title}"`);
    }
    return [
      "Who are the top medal contenders today?",
      "What is the biggest sports headline today?",
      "Give me a quick summary of today's key stories",
    ];
  }, [briefStories]);

  // Agenda Ask Flip AI logic
  const handleAgendaAskSubmit = (queryToAsk?: string) => {
    const q = (queryToAsk || agendaQuestion).trim();
    if (!q) return;
    setAgendaLoading(true);
    setAgendaAnswer(null);

    setTimeout(() => {
      const lower = q.toLowerCase();
      const matchedEvent = agendaEvents.find(
        (e) =>
          lower.includes(e.sport.toLowerCase()) ||
          lower.includes(e.subEvent.toLowerCase()) ||
          (e.detail && lower.includes(e.detail.toLowerCase())) ||
          (e.venue && lower.includes(e.venue.toLowerCase()))
      );

      let ans = "";
      if (matchedEvent) {
        ans = `📌 **${matchedEvent.sport} (${matchedEvent.subEvent}):** Scheduled at **${matchedEvent.time}**${matchedEvent.venue ? ` at ${matchedEvent.venue}` : ""}. Status: **${matchedEvent.statusLabel || matchedEvent.statusType.toUpperCase()}**. Match details: ${matchedEvent.detail}`;
      } else if (lower.includes("alarm") || lower.includes("time") || lower.includes("when")) {
        const upcomingList = agendaEvents.slice(0, 3).map(e => `• **${e.time}** - ${e.sport} (${e.subEvent})`).join("\n");
        ans = `⏰ **Key upcoming times from your agenda:**\n${upcomingList || "Check the agenda timeline above for all scheduled timings."}`;
      } else if (lower.includes("live") || lower.includes("attention") || lower.includes("now")) {
        const liveEvents = agendaEvents.filter(e => e.statusType === "live");
        if (liveEvents.length > 0) {
          ans = `🔥 **Live Right Now:** ${liveEvents.map(e => `${e.sport} (${e.subEvent}) - ${e.detail}`).join(", ")}`;
        } else {
          ans = `⏳ There are no matches currently marked LIVE. Next up on your schedule is **${agendaEvents[0]?.sport || "upcoming events"}** at **${agendaEvents[0]?.time || "today"}**!`;
        }
      } else {
        ans = `💡 **Flip Insight on "${q}":** Today's agenda includes ${agendaEvents.length} scheduled events across ${Array.from(new Set(agendaEvents.map(e => e.sport))).join(", ") || "multiple sports"}. Stay tuned for live updates and results!`;
      }
      setAgendaAnswer(ans);
      setAgendaLoading(false);
    }, 600);
  };

  // Brief Ask Flip AI logic
  const handleBriefAskSubmit = (queryToAsk?: string) => {
    const q = (queryToAsk || briefQuestion).trim();
    if (!q) return;
    setBriefLoading(true);
    setBriefAnswer(null);

    setTimeout(() => {
      const lower = q.toLowerCase();
      const matchedStory = briefStories.find(
        (s) =>
          lower.includes(s.title.toLowerCase()) ||
          lower.includes(s.sport.toLowerCase())
      );

      let ans = "";
      if (matchedStory) {
        ans = `🥇 **${matchedStory.title} (${matchedStory.sport}):** ${matchedStory.description}`;
      } else if (lower.includes("summary") || lower.includes("headline") || lower.includes("top")) {
        ans = `📰 **Today's Top Brief Headlines:**\n${briefStories.slice(0, 3).map((s, idx) => `${idx + 1}. **${s.title}** - ${s.description}`).join("\n")}`;
      } else {
        ans = `💡 **Flip Story Insight on "${q}":** Today's brief covers ${briefStories.length} curated stories covering ${Array.from(new Set(briefStories.map(s => s.sport))).join(", ") || "major sports"}. Tap any story card above for quick highlights!`;
      }
      setBriefAnswer(ans);
      setBriefLoading(false);
    }, 600);
  };

  // Helper for card theme styling
  const getThemeStyles = (theme?: RadarCardItem["themeColor"], isLive?: boolean, isSelected?: boolean) => {
    if (isLive || isSelected) {
      return {
        cardBorder: "border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.18)]",
        badgeBg: "bg-[#062d22] text-[#10B981] border-[#10B981]/50",
        badgeDot: "bg-[#10B981] shadow-[0_0_8px_#10B981]",
        accentColor: "#10B981",
      };
    }
    switch (theme) {
      case "emerald":
        return {
          cardBorder: "border-[#10B981]/40 hover:border-[#10B981]/70",
          badgeBg: "bg-[#062d22] text-[#10B981] border-[#10B981]/40",
          badgeDot: "bg-[#10B981]",
          accentColor: "#10B981",
        };
      case "purple":
        return {
          cardBorder: "border-[#2d2254] hover:border-[#583C87]",
          badgeBg: "bg-[#251846] text-[#B794F4] border-[#583C87]/60",
          badgeDot: "bg-[#B794F4]",
          accentColor: "#B794F4",
        };
      case "amber":
        return {
          cardBorder: "border-[#4e3814] hover:border-[#856417]",
          badgeBg: "bg-[#33230c] text-[#FBBF24] border-[#856417]/60",
          badgeDot: "bg-[#FBBF24]",
          accentColor: "#FBBF24",
        };
      case "cyan":
        return {
          cardBorder: "border-[#143c52] hover:border-[#0284c7]",
          badgeBg: "bg-[#0c2637] text-[#38BDF8] border-[#0284c7]/50",
          badgeDot: "bg-[#38BDF8]",
          accentColor: "#38BDF8",
        };
      case "rose":
      default:
        return {
          cardBorder: "border-[#4c1d29] hover:border-[#be123c]",
          badgeBg: "bg-[#38131d] text-[#FB7185] border-[#be123c]/50",
          badgeDot: "bg-[#FB7185]",
          accentColor: "#FB7185",
        };
    }
  };

  const resolvedSubtitle = propActionSubtitle || welcomeConfig?.actionSubtitle || "Top action today · Asian Games";

  return (
    <div className="w-full flex flex-col gap-3 font-sans text-white select-none">
      {/* ─── 1. Header Greeting Section ─────────────────────────────────── */}
      <div className="flex items-start justify-between w-full pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[20px] sm:text-[23px] font-black tracking-tight text-white leading-tight">
              {greeting}{resolvedName ? `, ${resolvedName}` : ""}
            </h1>
            <span className="text-[20px] sm:text-[22px] inline-block hover:scale-125 transition-transform cursor-default">
              👋
            </span>
          </div>
          <p className="text-[13px] sm:text-[14px] font-medium text-[#67E8F9] tracking-normal mt-0.5 opacity-90">
            {resolvedSubtitle}
          </p>
        </div>

        {/* See all Link */}
        <button
          type="button"
          onClick={() => {
            if (onSeeAllClick) onSeeAllClick();
            else setIsAgendaOpen(true);
          }}
          className="flex items-center gap-1 text-[13px] sm:text-[14px] font-bold text-[#E91E8C] hover:text-[#FF4081] transition-colors pt-0.5 group cursor-pointer"
        >
          <span>See all</span>
          <span className="text-[14px] font-black group-hover:translate-x-0.5 transition-transform">&gt;</span>
        </button>
      </div>

      {/* ─── 2. Section Subtitle ────────────────────────────────────────── */}
      <div className="mt-1">
        <span className="text-[11px] sm:text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#38BDF8] opacity-85">
          TODAY ON YOUR RADAR
        </span>
      </div>

      {/* ─── 3. Horizontal Scrollable Radar Cards ───────────────────────── */}
      <div className="relative w-full">
        {isLoadingBackend ? (
          <div className="flex items-stretch gap-3 overflow-x-hidden pb-1 pt-1 -mx-1 px-1">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="shrink-0 w-[142px] sm:w-[155px] rounded-[18px] p-3 flex flex-col justify-between bg-[#0b101d]/70 border border-white/5 animate-pulse min-h-[136px]"
              >
                <div className="flex justify-between items-center">
                  <div className="w-12 h-3.5 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded bg-white/10" />
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/10 my-2" />
                <div className="space-y-1.5">
                  <div className="w-3/4 h-3.5 rounded bg-white/10" />
                  <div className="w-1/2 h-2.5 rounded bg-white/5" />
                  <div className="w-2/3 h-2.5 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedRadarCards.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex items-stretch gap-3 overflow-x-auto scrollbar-none scroll-smooth pb-1 pt-1 -mx-1 px-1 snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {displayedRadarCards.map((card, index) => {
              const isSelected = activeCardIndex === index;
              const theme = getThemeStyles(card.themeColor, card.isLive, isSelected);
              const isNotified = notifiedCards.includes(card.id);

              return (
                <motion.div
                  key={card.id || index}
                  whileHover={{ y: -3, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveCardIndex(index);
                    if (onCardClick) onCardClick(card);
                    else setSelectedCardDetail(card);
                  }}
                  className={`shrink-0 w-[142px] sm:w-[155px] rounded-[18px] p-3 flex flex-col justify-between transition-all duration-200 snap-start relative overflow-hidden cursor-pointer ${
                    isSelected || card.isLive
                      ? "bg-[#0b101d] border-2 " + theme.cardBorder
                      : "bg-[#0c101d] border " + theme.cardBorder
                  }`}
                  style={{
                    minHeight: "136px",
                    boxShadow:
                      isSelected || card.isLive
                        ? "0 4px 20px rgba(0, 0, 0, 0.45), 0 0 16px rgba(16, 185, 129, 0.12)"
                        : "0 4px 15px rgba(0, 0, 0, 0.35)",
                  }}
                >
                  {/* Top Row: Badge & Status */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}
                    >
                      {card.isLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      )}
                      {card.status}
                    </span>

                    {/* Notify indicator */}
                    {!card.isLive && (
                      <button
                        type="button"
                        aria-label="Notify match"
                        onClick={(e) => toggleNotify(card.id, e)}
                        className={`text-[11px] p-0.5 rounded transition-colors ${
                          isNotified ? "text-amber-400" : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <Bell size={12} className={isNotified ? "fill-amber-400" : ""} />
                      </button>
                    )}
                  </div>

                  {/* Sport Icon */}
                  <div className="my-1 text-[24px] sm:text-[26px] leading-none flex items-center">
                    <span className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                      {card.icon}
                    </span>
                  </div>

                  {/* Card Text Content */}
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight leading-snug truncate">
                      {card.sport}
                    </h4>
                    <p className="text-[11.5px] font-medium text-gray-200 tracking-tight leading-tight mt-0.5 truncate">
                      {card.event}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 tracking-tight leading-tight mt-0.5 truncate">
                      {card.round}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* ─── 4. Pagination Dots / Indicator ─────────────────────────────── */}
      {totalDots > 1 && (
        <div className="flex items-center justify-center gap-1.5 my-1">
          {Array.from({ length: totalDots }).map((_, idx) => {
            const isActive = activePageIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => scrollToDot(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? "w-5 h-1.5 bg-[#E91E8C] shadow-[0_0_8px_rgba(233,30,140,0.6)]"
                    : "w-1.5 h-1.5 bg-[#334155] hover:bg-[#475569]"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* ─── 5. Morning Brief Banner ────────────────────────────────────── */}
      <motion.div
        whileHover={{ scale: 1.006 }}
        whileTap={{ scale: 0.995 }}
        onClick={() => {
          if (onReadBriefClick) onReadBriefClick();
          else setIsBriefOpen(true);
        }}
        className="w-full rounded-[18px] p-3.5 sm:p-4 cursor-pointer transition-all duration-200 relative overflow-hidden group border border-[#854D0E]/60 hover:border-[#D97706]/80"
        style={{
          background:
            "linear-gradient(135deg, rgba(30, 20, 8, 0.95) 0%, rgba(20, 15, 9, 0.98) 50%, rgba(14, 11, 7, 1) 100%)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(217, 119, 6, 0.12)",
        }}
      >
        <div
          className="absolute -top-10 -left-10 w-32 h-32 rounded-full pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
          style={{
            background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)",
          }}
        />

        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#D97706]/10 border border-[#F59E0B]/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <span className="text-[22px] leading-none select-none">
                🌞
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <h3 className="text-[14px] sm:text-[15px] font-black uppercase tracking-wider text-white leading-tight flex items-center gap-1.5">
                MORNING BRIEF
              </h3>
              <p className="text-[12px] sm:text-[13px] font-medium text-[#D1A56A] leading-tight mt-0.5 truncate">
                {welcomeConfig?.briefSubtitle || "Top 5 stories to know today"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[13px] sm:text-[14px] font-bold text-[#F59E0B] group-hover:text-[#FBBF24] transition-colors shrink-0 pl-2">
            <span>Read Brief</span>
            <span className="text-[15px] font-extrabold group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </div>
      </motion.div>

      {/* ─── 6. TODAY'S AGENDA MODAL (Dynamic from DynamoDB) ─────────────── */}
      <AnimatePresence>
        {isAgendaOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md">
            <div 
              className="absolute inset-0"
              onClick={() => setIsAgendaOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="relative w-full max-w-lg h-[92vh] sm:h-[88vh] rounded-t-[28px] sm:rounded-2xl bg-[#090C15] border border-white/10 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.9)] flex flex-col z-10"
            >
              {/* Drag Handle Bar */}
              <div className="w-full flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 bg-gray-600/70 rounded-full" />
              </div>

              {/* Modal Header */}
              <div className="px-5 pt-2 pb-4 flex items-start justify-between border-b border-white/5">
                <div className="flex flex-col">
                  <h2 className="text-[21px] sm:text-[23px] font-black uppercase tracking-tight text-white leading-tight">
                    TODAY&apos;S AGENDA
                  </h2>
                  <p className="text-[13px] font-medium text-gray-400 mt-0.5">
                    {welcomeConfig?.agendaDateTitle || "Today's Schedule"}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close agenda"
                  onClick={() => setIsAgendaOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div 
                className="flex-1 overflow-y-auto px-5 py-4 space-y-6"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.15) transparent",
                }}
              >
                {/* Timeline Events List */}
                <div className="relative pl-1">
                  {isLoadingBackend ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="flex items-start gap-4 animate-pulse">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20 mt-1" />
                          <div className="flex-1 space-y-2">
                            <div className="w-20 h-3 rounded bg-white/10" />
                            <div className="w-40 h-4 rounded bg-white/15" />
                            <div className="w-56 h-3 rounded bg-white/10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : agendaEvents.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-[13px]">
                      No agenda events scheduled for today.
                    </div>
                  ) : (
                    agendaEvents.map((evt, idx) => {
                      const isLast = idx === agendaEvents.length - 1;

                      let nodeStyle = "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
                      let badgeStyle = "bg-[#0b1c33] text-[#60A5FA] border border-[#1E40AF]/60";
                      let badgeGlow = "";

                      if (evt.statusType === "live") {
                        nodeStyle = "bg-emerald-400 shadow-[0_0_10px_#34D399]";
                        badgeStyle = "bg-[#04281E] text-[#10B981] border border-[#10B981]/50";
                        badgeGlow = "shadow-[0_0_10px_rgba(16,185,129,0.25)]";
                      } else if (evt.statusType === "up_next") {
                        nodeStyle = "bg-amber-400 shadow-[0_0_10px_#FBBF24]";
                        badgeStyle = "bg-[#2E1F06] text-[#FBBF24] border border-[#D97706]/60";
                        badgeGlow = "shadow-[0_0_10px_rgba(251,191,36,0.25)]";
                      }

                      return (
                        <div key={evt.id || idx} className="relative flex items-start gap-4 pb-5 group">
                          {!isLast && (
                            <div 
                              className="absolute left-[5px] top-[14px] bottom-0 w-[1px] bg-slate-800"
                            />
                          )}

                          <div className="relative z-10 pt-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${nodeStyle}`} />
                          </div>

                          <div className="flex-1 flex items-start justify-between min-w-0">
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="text-[11px] font-bold text-gray-400 tracking-wider">
                                {evt.time}
                              </span>

                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[20px] leading-none shrink-0 drop-shadow-sm">
                                  {evt.icon}
                                </span>
                                <h4 className="text-[15px] font-extrabold text-white leading-tight truncate">
                                  {evt.sport}
                                </h4>
                              </div>

                              <p className="text-[12px] font-medium text-gray-300 leading-tight mt-1 truncate">
                                {evt.subEvent}
                              </p>

                              <p className="text-[11px] font-normal text-gray-400 leading-tight mt-0.5 truncate">
                                {evt.detail}
                              </p>
                            </div>

                            <div className="shrink-0 pt-0.5">
                              <span
                                className={`inline-flex items-center gap-1 text-[9.5px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${badgeStyle} ${badgeGlow}`}
                              >
                                {evt.statusType === "live" && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                )}
                                {evt.statusLabel || (evt.statusType === "live" ? "LIVE" : evt.statusType === "up_next" ? "UP NEXT" : "AFTERNOON")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Agenda Bottom ASK FLIP Section */}
                <div 
                  className="w-full rounded-2xl p-4 sm:p-5 border border-purple-500/25 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, #130B24 0%, #0A0714 60%, #06050C 100%)",
                    boxShadow: "0 4px 25px rgba(124, 58, 237, 0.15)",
                  }}
                >
                  <div
                    className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none opacity-20"
                    style={{
                      background: "radial-gradient(circle, #A855F7 0%, transparent 70%)",
                    }}
                  />

                  <div className="flex items-center gap-2.5 mb-3.5 relative z-10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#C084FC] to-[#EC4899] p-[1.5px] shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                      <div className="w-full h-full rounded-full bg-[#130B24] flex items-center justify-center text-[18px]">
                        🐬
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[14px] sm:text-[15px] font-black text-white uppercase tracking-wide flex items-center gap-1">
                        ASK FLIP <span className="text-[#38BDF8]">⚡</span>
                      </h3>
                      <p className="text-[11.5px] text-gray-400 font-medium leading-tight">
                        Get insights on any event in your agenda
                      </p>
                    </div>
                  </div>

                  <div className="mb-2 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                      TRY ASKING:
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-3.5 relative z-10">
                    {dynamicAgendaPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAgendaQuestion(prompt);
                          handleAgendaAskSubmit(prompt);
                        }}
                        className="w-full text-left px-3.5 py-2 rounded-xl text-[12px] font-medium text-gray-300 bg-white/[0.04] border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.07] hover:text-white transition-all cursor-pointer truncate"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <div className="relative z-10 mb-3">
                    <textarea
                      rows={2}
                      value={agendaQuestion}
                      onChange={(e) => setAgendaQuestion(e.target.value)}
                      placeholder="Ask about any event, match or athlete on today's schedule..."
                      className="w-full rounded-xl bg-[#090B12] border border-white/10 p-3 text-[12.5px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/70 resize-none transition-colors"
                    />
                  </div>

                  <AnimatePresence>
                    {(agendaLoading || agendaAnswer) && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 mb-3 text-[12.5px] text-gray-200 leading-relaxed relative z-10"
                      >
                        {agendaLoading ? (
                          <div className="flex items-center gap-2 text-purple-300 font-medium">
                            <Loader2 size={14} className="animate-spin" />
                            <span>Flip is analyzing the schedule...</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
                              <Sparkles size={12} />
                              <span>Flip AI Analysis</span>
                            </div>
                            <div className="text-white/95">
                              {agendaAnswer}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() => handleAgendaAskSubmit()}
                    disabled={agendaLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(236,72,153,0.35)] hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer relative z-10 disabled:opacity-50"
                  >
                    {agendaLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span>Ask Flip</span>
                        <span className="text-[#38BDF8]">⚡</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 7. MORNING BRIEF MODAL (Dynamic from DynamoDB) ──────────────── */}
      <AnimatePresence>
        {isBriefOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md">
            <div 
              className="absolute inset-0"
              onClick={() => setIsBriefOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="relative w-full max-w-lg h-[92vh] sm:h-[88vh] rounded-t-[28px] sm:rounded-2xl bg-[#090C15] border border-white/10 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.9)] flex flex-col z-10"
            >
              {/* Drag Handle Bar */}
              <div className="w-full flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 bg-gray-600/70 rounded-full" />
              </div>

              {/* Modal Header: Sun Icon + MORNING BRIEF + Close Button */}
              <div className="px-5 pt-2 pb-4 flex items-start justify-between border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[24px] leading-none select-none">
                    🌞
                  </span>
                  <div className="flex flex-col">
                    <h2 className="text-[20px] sm:text-[22px] font-black uppercase tracking-tight text-white leading-tight">
                      MORNING BRIEF
                    </h2>
                    <p className="text-[13px] font-medium text-gray-400 mt-0.5">
                      {welcomeConfig?.briefSubtitle || "Top 5 stories to know today"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Close brief"
                  onClick={() => setIsBriefOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div 
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.15) transparent",
                }}
              >
                {/* Stories Cards */}
                {isLoadingBackend ? (
                  <div className="space-y-3.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="p-3.5 sm:p-4 rounded-2xl bg-[#0e1320]/70 border border-white/5 flex items-start gap-3.5 animate-pulse"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/10 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="w-1/2 h-4 rounded bg-white/15" />
                          <div className="w-full h-3 rounded bg-white/10" />
                          <div className="w-3/4 h-3 rounded bg-white/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : briefStories.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-[13px]">
                    No morning brief stories available at the moment.
                  </div>
                ) : (
                  briefStories.map((story, idx) => (
                    <div
                      key={story.id || idx}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#0e1320]/90 border border-white/10 hover:border-amber-500/40 transition-all flex items-start gap-3.5 group"
                      style={{
                        boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
                      }}
                    >
                      {/* Number Badge with Icon Below */}
                      <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5">
                        <div className="w-7 h-7 rounded-lg bg-[#261A0C] border border-[#854D0E]/60 text-[#F59E0B] text-[13px] font-black flex items-center justify-center shadow-sm">
                          {story.storyNumber || idx + 1}
                        </div>
                        <span className="text-[18px] leading-none drop-shadow-sm">
                          {story.icon || "🏆"}
                        </span>
                      </div>

                      {/* Story Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14.5px] sm:text-[15px] font-extrabold text-white leading-snug">
                          {story.title}
                        </h4>
                        <p className="text-[12px] sm:text-[12.5px] font-normal text-gray-400 leading-relaxed mt-1">
                          {story.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {/* Bottom ASK FLIP Section for Morning Brief */}
                <div 
                  className="w-full rounded-2xl p-4 sm:p-5 border border-purple-500/25 relative overflow-hidden mt-4"
                  style={{
                    background: "linear-gradient(160deg, #130B24 0%, #0A0714 60%, #06050C 100%)",
                    boxShadow: "0 4px 25px rgba(124, 58, 237, 0.15)",
                  }}
                >
                  <div
                    className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none opacity-20"
                    style={{
                      background: "radial-gradient(circle, #A855F7 0%, transparent 70%)",
                    }}
                  />

                  {/* Header: Mascot Avatar + Text */}
                  <div className="flex items-center gap-2.5 mb-3.5 relative z-10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#C084FC] to-[#EC4899] p-[1.5px] shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                      <div className="w-full h-full rounded-full bg-[#130B24] flex items-center justify-center text-[18px]">
                        🐬
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[14px] sm:text-[15px] font-black text-white uppercase tracking-wide flex items-center gap-1">
                        ASK FLIP <span className="text-[#38BDF8]">⚡</span>
                      </h3>
                      <p className="text-[11.5px] text-gray-400 font-medium leading-tight">
                        Dive deeper into any story from today&apos;s brief
                      </p>
                    </div>
                  </div>

                  {/* TRY ASKING Label */}
                  <div className="mb-2 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                      TRY ASKING:
                    </span>
                  </div>

                  {/* Suggested Question Pills */}
                  <div className="flex flex-col gap-1.5 mb-3.5 relative z-10">
                    {dynamicBriefPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setBriefQuestion(prompt);
                          handleBriefAskSubmit(prompt);
                        }}
                        className="w-full text-left px-3.5 py-2 rounded-xl text-[12px] font-medium text-gray-300 bg-white/[0.04] border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.07] hover:text-white transition-all cursor-pointer truncate"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Input Box */}
                  <div className="relative z-10 mb-3">
                    <textarea
                      rows={2}
                      value={briefQuestion}
                      onChange={(e) => setBriefQuestion(e.target.value)}
                      placeholder="Or type your own question about today's sports stories..."
                      className="w-full rounded-xl bg-[#090B12] border border-white/10 p-3 text-[12.5px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/70 resize-none transition-colors"
                    />
                  </div>

                  {/* AI Response Display if available */}
                  <AnimatePresence>
                    {(briefLoading || briefAnswer) && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 mb-3 text-[12.5px] text-gray-200 leading-relaxed relative z-10"
                      >
                        {briefLoading ? (
                          <div className="flex items-center gap-2 text-purple-300 font-medium">
                            <Loader2 size={14} className="animate-spin" />
                            <span>Flip is finding insights on today&apos;s brief...</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
                              <Sparkles size={12} />
                              <span>Flip AI Analysis</span>
                            </div>
                            <div className="text-white/95">
                              {briefAnswer}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Gradient Ask Button */}
                  <button
                    type="button"
                    onClick={() => handleBriefAskSubmit()}
                    disabled={briefLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(236,72,153,0.35)] hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer relative z-10 disabled:opacity-50"
                  >
                    {briefLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span>Ask Flip</span>
                        <span className="text-[#38BDF8]">⚡</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 8. Card Detail Quick-View Modal ────────────────────────────── */}
      <AnimatePresence>
        {selectedCardDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <div 
              className="absolute inset-0"
              onClick={() => setSelectedCardDetail(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-2xl bg-[#121622] border border-white/15 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 bg-[#171c2b] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-[28px]">{selectedCardDetail.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[16px] font-black text-white">
                        {selectedCardDetail.sport}
                      </h3>
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                          getThemeStyles(selectedCardDetail.themeColor, selectedCardDetail.isLive).badgeBg
                        }`}
                      >
                        {selectedCardDetail.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-300 font-medium">
                      {selectedCardDetail.event} · {selectedCardDetail.round}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close card detail"
                  onClick={() => setSelectedCardDetail(null)}
                  className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Match details content */}
              <div className="p-4 sm:p-5 space-y-3">
                {selectedCardDetail.venue && (
                  <div className="flex items-center gap-2 text-[12px] text-gray-400">
                    <MapPin size={14} className="text-cyan-400 shrink-0" />
                    <span>{selectedCardDetail.venue}</span>
                  </div>
                )}

                {selectedCardDetail.time && (
                  <div className="flex items-center gap-2 text-[12px] text-gray-400">
                    <Clock size={14} className="text-amber-400 shrink-0" />
                    <span>Scheduled: {selectedCardDetail.time}</span>
                  </div>
                )}

                {selectedCardDetail.teams ? (
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[13px] font-bold text-white">
                      <span>{selectedCardDetail.teams.teamA}</span>
                      {selectedCardDetail.teams.scoreA && (
                        <span className="text-emerald-400">{selectedCardDetail.teams.scoreA}</span>
                      )}
                    </div>
                    {selectedCardDetail.teams.teamB && (
                      <div className="flex items-center justify-between text-[13px] font-bold text-gray-300">
                        <span>{selectedCardDetail.teams.teamB}</span>
                        {selectedCardDetail.teams.scoreB && (
                          <span className="text-gray-400">{selectedCardDetail.teams.scoreB}</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                    <div className="text-[13px] font-bold text-white flex items-center justify-between">
                      <span>{selectedCardDetail.event}</span>
                      <span className="text-emerald-400 text-[11px] font-bold">{selectedCardDetail.status}</span>
                    </div>
                    {selectedCardDetail.round && (
                      <p className="text-[12px] text-gray-300">
                        {selectedCardDetail.round}
                      </p>
                    )}
                  </div>
                )}

                {selectedCardDetail.summary && (
                  <p className="text-[12.5px] text-gray-300/90 leading-relaxed">
                    {selectedCardDetail.summary}
                  </p>
                )}
              </div>

              {/* Footer CTA */}
              <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#0d101a] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => toggleBookmark(selectedCardDetail.id, e)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border transition-colors cursor-pointer ${
                    bookmarkedCards.includes(selectedCardDetail.id)
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Bookmark size={14} />
                  <span>{bookmarkedCards.includes(selectedCardDetail.id) ? "Saved" : "Save"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCardDetail(null);
                    setIsAgendaOpen(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#E91E8C] to-[#FF6B35] text-white font-extrabold text-[13px] hover:opacity-95 transition-opacity text-center cursor-pointer"
                >
                  View Full Agenda
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}