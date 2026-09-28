"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
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
import Greetings from "./Greetings";
import { 
  welcomeMessageService, 
  RadarCardItem, 
  AgendaEventItem, 
  MorningBriefStory, 
  WelcomeConfig,
  resolveDynamicAgendaEvents,
  cleanAiResponse
} from "@/services/welcomeMessage.service";

export type { RadarCardItem, AgendaEventItem, MorningBriefStory, WelcomeConfig };

/**
 * Cleanly renders formatted text, bold highlights and bullet points from AI answers
 */
function formatAiAnswerText(text: string | null) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-[12.5px] leading-relaxed">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1" />;
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*");
        const cleanLine = isBullet ? trimmed.replace(/^[•\-*]\s*/, "") : trimmed;
        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

        return (
          <div key={lIdx} className={`flex ${isBullet ? "items-start gap-1.5 pl-1" : "items-baseline"}`}>
            {isBullet && <span className="text-purple-400 font-bold select-none shrink-0">•</span>}
            <p className="leading-snug">
              {parts.map((part, pIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={pIdx} className="font-extrabold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

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
  const router = useRouter();
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
  const [showAllAgendaEvents, setShowAllAgendaEvents] = useState(false);
  const [showAllBriefStories, setShowAllBriefStories] = useState(false);
  const [selectedCardDetail, setSelectedCardDetail] = useState<RadarCardItem | null>(null);
  const [notifiedCards, setNotifiedCards] = useState<string[]>([]);
  const [bookmarkedCards, setBookmarkedCards] = useState<string[]>([]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when any modal is open on mobile / desktop
  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    if (isAgendaOpen || isBriefOpen || !!selectedCardDetail) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mounted, isAgendaOpen, isBriefOpen, selectedCardDetail]);

  // Agenda Ask Flip state
  const [agendaQuestion, setAgendaQuestion] = useState("");
  const [agendaAnswer, setAgendaAnswer] = useState<string | null>(null);
  const [agendaLoading, setAgendaLoading] = useState(false);

  // Brief Ask Flip state
  const [briefQuestion, setBriefQuestion] = useState("");
  const [briefAnswer, setBriefAnswer] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);


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


  // Live 15-second clock ticker to automatically transition event statuses in real time
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically calculate event statuses (completed, live, up_next, scheduled) based on current clock time
  const dynamicAgendaEvents = useMemo(() => {
    return resolveDynamicAgendaEvents(agendaEvents, currentTime);
  }, [agendaEvents, currentTime]);

  // ─── Derive Radar Cards from TODAY'S AGENDA data ────────────────────────
  // Ensures the exact same data from TODAY'S AGENDA is displayed in TODAY ON YOUR RADAR
  const displayedRadarCards = useMemo<RadarCardItem[]>(() => {
    if (dynamicAgendaEvents.length > 0) {
      return dynamicAgendaEvents.map((evt, index) => {
        const isLive = evt.statusType === "live" || evt.statusLabel?.toLowerCase() === "live";

        let themeColor: RadarCardItem["themeColor"] = "purple";
        if (evt.themeColor) {
          themeColor = evt.themeColor;
        } else if (isLive || evt.nodeColor === "emerald") {
          themeColor = "emerald";
        } else if (evt.statusType === "up_next" || evt.nodeColor === "amber") {
          themeColor = "amber";
        } else if (evt.statusType === "completed" || evt.nodeColor === "gray") {
          themeColor = "cyan";
        } else if (evt.nodeColor === "blue" || evt.statusType === "scheduled" || evt.statusType === "afternoon") {
          themeColor = "purple";
        } else {
          const colors: RadarCardItem["themeColor"][] = ["purple", "cyan", "rose", "emerald", "amber"];
          themeColor = colors[index % colors.length];
        }

        const displayStatus = isLive
          ? "LIVE"
          : evt.statusType === "completed"
          ? "COMPLETED"
          : evt.statusType === "up_next"
          ? "UP NEXT"
          : evt.time || evt.statusLabel || "SCHEDULED";

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
          summary:
            evt.summary ||
            `${evt.sport} (${evt.subEvent || ""}) - ${evt.detail || ""}${
              evt.venue ? ` at ${evt.venue}` : ""
            }. Scheduled time: ${evt.time || "Today"}.`,
          order: evt.order ?? index + 1,
          active: evt.active,
        };
      });
    }

    if (radarCards.length > 0) {
      return radarCards.map((rc, idx) => {
        const isLive = rc.statusType === "live" || rc.status?.toLowerCase() === "live" || Boolean(rc.isLive);
        return {
          ...rc,
          isLive,
          status: rc.status || (isLive ? "LIVE" : rc.statusType === "completed" ? "COMPLETED" : rc.time || "SCHEDULED"),
        };
      });
    }

    return [];
  }, [dynamicAgendaEvents, radarCards]);

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

  // Dynamic suggested prompts derived from live updates (Analytical & Tactical, no time/venue questions)
  const dynamicAgendaPrompts = useMemo(() => {
    if (agendaEvents && agendaEvents.length > 0) {
      const prompts: string[] = [];

      agendaEvents.forEach((evt) => {
        if (prompts.length >= 4) return;

        const sport = evt.sport || "Match";
        const subEvent = evt.subEvent || "";
        const detail = evt.detail || "";
        const teams = evt.teams;

        // 1. If teams or head-to-head match
        if (teams && teams.teamA && teams.teamB) {
          prompts.push(`Who has the tactical edge in ${teams.teamA} vs ${teams.teamB}?`);
          return;
        }

        // 2. If it's a live match
        if (evt.statusType === "live" || evt.statusLabel?.toLowerCase() === "live") {
          prompts.push(`What are the key turning points in ${sport} ${subEvent ? `(${subEvent})` : ""} right now?`);
          return;
        }

        // 3. If it's a medal or final match
        if (subEvent.toLowerCase().includes("final") || detail.toLowerCase().includes("gold") || detail.toLowerCase().includes("medal")) {
          prompts.push(`Who are the top contenders favored for Gold in ${sport} ${subEvent ? `(${subEvent})` : ""}?`);
          return;
        }

        // 4. If it's a semi-final or knockout clash
        if (subEvent.toLowerCase().includes("semi") || detail.toLowerCase().includes("semi")) {
          prompts.push(`What are the key rivalry stats in ${sport} - ${subEvent || detail}?`);
          return;
        }

        // 5. Tactical question based on sport & subEvent
        if (subEvent) {
          prompts.push(`What strategy will decide the winner in ${sport} (${subEvent})?`);
          return;
        }

        prompts.push(`What key player battles will determine the outcome in ${sport}?`);
      });

      if (prompts.length > 0) {
        return prompts.slice(0, 4);
      }
    }

    return [
      "Which match has the highest upset potential today?",
      "Who are the top favorites favored to win in today's games?",
      "What key tactical battles will decide today's marquee events?",
      "Which breakout athlete is turning heads in today's action?",
    ];
  }, [agendaEvents]);

  // Dynamic suggested prompts derived from morning brief stories (Milestones & Medal implications)
  const dynamicBriefPrompts = useMemo(() => {
    if (briefStories && briefStories.length > 0) {
      const prompts: string[] = [];

      briefStories.forEach((story, idx) => {
        if (prompts.length >= 4) return;

        const title = story.title || "";
        const sport = story.sport || "Sports";
        const shortTitle = title.length > 40 ? title.slice(0, 40).trim() + "..." : title;

        if (idx === 0) {
          prompts.push(`What makes "${shortTitle}" such a historic milestone?`);
        } else if (idx === 1) {
          prompts.push(`How does this result impact the standings in ${sport}?`);
        } else if (idx === 2) {
          prompts.push(`What were the decisive moments in ${sport}?`);
        } else {
          prompts.push(`Who are the top rival challengers in ${sport} after today's story?`);
        }
      });

      if (prompts.length > 0) {
        return prompts.slice(0, 4);
      }
    }

    return [
      "What is the most impactful sports headline from today's brief?",
      "Which athlete delivered the biggest breakthrough performance today?",
      "How do today's results impact the overall championship picture?",
      "What are the tactical takeaways from today's top stories?",
    ];
  }, [briefStories]);

  // Agenda Ask Flip AI logic (Exact FlipLine /api/ask-ai integration)
  const handleAgendaAskSubmit = async (queryToAsk?: string) => {
    const q = (queryToAsk || agendaQuestion).trim();
    if (!q || agendaLoading) return;
    setAgendaLoading(true);
    setAgendaAnswer(null);

    // Build focused context moment from today's agenda updates
    const lower = q.toLowerCase();
    const matchedEvent = agendaEvents.find(
      (e) =>
        lower.includes(e.sport.toLowerCase()) ||
        lower.includes((e.subEvent || "").toLowerCase()) ||
        (e.teams && (lower.includes(e.teams.teamA.toLowerCase()) || (e.teams.teamB && lower.includes(e.teams.teamB.toLowerCase())))) ||
        (e.detail && lower.includes(e.detail.toLowerCase()))
    );

    let contextMoment = "";
    if (matchedEvent) {
      contextMoment = `${matchedEvent.sport} - ${matchedEvent.subEvent || matchedEvent.sport} (${matchedEvent.detail || ""}${matchedEvent.teams ? `, ${matchedEvent.teams.teamA} vs ${matchedEvent.teams.teamB || ""}` : ""}, Status: ${matchedEvent.statusLabel || matchedEvent.statusType})`;
    } else {
      contextMoment = agendaEvents
        .slice(0, 4)
        .map((e) => `${e.sport}: ${e.subEvent || e.sport} (${e.statusLabel || e.statusType} - ${e.detail || ""})`)
        .join("; ");
    }

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Context moment: "${contextMoment}". Question about this moment: "${q}". Answer this question in a short, engaging sports fan format under 200 characters.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiAnswer = data.answer || data.response || data.message;
        if (aiAnswer && typeof aiAnswer === "string" && aiAnswer.trim()) {
          setAgendaAnswer(cleanAiResponse(aiAnswer, q));
          setAgendaLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Agenda Ask AI error, using fallback response:", err);
    }

    // High-accuracy expert sports fallback if API is unavailable
    let ans = "";
    if (matchedEvent) {
      if (matchedEvent.statusType === "live") {
        ans = `🔥 **${matchedEvent.sport} (${matchedEvent.subEvent || matchedEvent.sport})** is in an intense live phase! ${matchedEvent.detail || "Momentum is shifting rapidly with high tactical intensity."}`;
      } else if (matchedEvent.teams) {
        ans = `⚡ In **${matchedEvent.teams.teamA} vs ${matchedEvent.teams.teamB || "opponents"}**, the tactical battle hinges on early pressure and converting key scoring opportunities.`;
      } else {
        ans = `🏆 In **${matchedEvent.sport} (${matchedEvent.subEvent || matchedEvent.sport})**, expect a fierce battle with high stakes on the line: ${matchedEvent.detail || "contenders looking to peak at the right moment"}.`;
      }
    } else if (lower.includes("strategy") || lower.includes("tactical") || lower.includes("edge")) {
      ans = `⚡ Today's matchups favor aggressive opening play, strong transition defense, and capitalizing on unforced errors across key events.`;
    } else if (lower.includes("contender") || lower.includes("favorite") || lower.includes("gold") || lower.includes("winner")) {
      const topEvt = agendaEvents[0];
      ans = `🥇 Top contenders in today's spotlight include ${topEvt ? `${topEvt.sport} (${topEvt.subEvent || ""})` : "top seeded athletes"} boasting strong recent form and tournament momentum.`;
    } else {
      ans = `🔥 Today's schedule features ${agendaEvents.length} high-octane fixtures. Key matchups are set to deliver dramatic finishes and clutch performances!`;
    }

    setAgendaAnswer(cleanAiResponse(ans, q));
    setAgendaLoading(false);
  };

  // Brief Ask Flip AI logic (Exact FlipLine /api/ask-ai integration)
  const handleBriefAskSubmit = async (queryToAsk?: string) => {
    const q = (queryToAsk || briefQuestion).trim();
    if (!q || briefLoading) return;
    setBriefLoading(true);
    setBriefAnswer(null);

    // Build focused context moment from brief stories
    const lower = q.toLowerCase();
    const matchedStory = briefStories.find(
      (s) =>
        lower.includes(s.title.toLowerCase()) ||
        lower.includes(s.sport.toLowerCase()) ||
        s.description.toLowerCase().split(/\s+/).some(word => word.length > 4 && lower.includes(word))
    );

    let contextMoment = "";
    if (matchedStory) {
      contextMoment = `${matchedStory.title} (${matchedStory.sport}): ${matchedStory.description}`;
    } else {
      contextMoment = briefStories
        .slice(0, 3)
        .map((s) => `${s.sport}: ${s.title} - ${s.description}`)
        .join("; ");
    }

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Context moment: "${contextMoment}". Question about this moment: "${q}". Answer this question in a short, engaging sports fan format under 200 characters.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiAnswer = data.answer || data.response || data.message;
        if (aiAnswer && typeof aiAnswer === "string" && aiAnswer.trim()) {
          setBriefAnswer(cleanAiResponse(aiAnswer, q));
          setBriefLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Brief Ask AI error, using fallback response:", err);
    }

    // High-accuracy expert sports fallback if API is unavailable
    let ans = "";
    if (matchedStory) {
      ans = `🏆 **${matchedStory.title}** (${matchedStory.sport}): ${matchedStory.description}`;
    } else if (lower.includes("significance") || lower.includes("historic") || lower.includes("milestone")) {
      const top = briefStories[0];
      ans = `🌟 ${top ? `**${top.title}** marks a defining milestone, resetting tournament benchmarks and boosting national standing.` : "Today's victories set new performance benchmarks across tournaments."}`;
    } else if (lower.includes("headline") || lower.includes("takeaway") || lower.includes("summary")) {
      ans = `📰 Key takeaway: ${briefStories.slice(0, 2).map((s) => `**${s.title}** (${s.sport})`).join(" & ")} dominate today's headlines with standout execution.`;
    } else {
      ans = `⚡ Today's Daily Huddle highlights ${briefStories.length} top stories featuring incredible grit, clutch breakthroughs, and record performances!`;
    }

    setBriefAnswer(cleanAiResponse(ans, q));
    setBriefLoading(false);
  };

  // ─── FlipArena Banner Component for Modals ──────────────────────────────
  const renderFlipArenaBanner = () => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => router.push("/MainModules/FlipArena")}
      className="w-full rounded-[20px] p-3.5 sm:p-4 border border-[#EC4899]/35 hover:border-[#EC4899]/65 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.45),0_0_18px_rgba(236,72,153,0.14)]"
      style={{
        background: "linear-gradient(135deg, #130A1F 0%, #0D0715 60%, #08040E 100%)",
      }}
    >
      {/* Background Subtle Pink Glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity"
        style={{
          background: "radial-gradient(circle, #EC4899 0%, transparent 70%)",
        }}
      />

      {/* Left: Stadium Icon & Text */}
      <div className="flex items-center gap-3 relative z-10 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#220E2E] border border-[#EC4899]/35 flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(236,72,153,0.25)] text-[22px] sm:text-[24px]">
          🏟️
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-[14px] sm:text-[15px] font-black uppercase tracking-wider text-[#EC4899] leading-tight flex items-center gap-1.5">
            FLIPARENA
          </h3>
          <p className="text-[11.5px] sm:text-[12.5px] font-semibold text-gray-400 leading-tight mt-0.5 truncate">
            Polls · Battles · Quizzes
          </p>
        </div>
      </div>

      {/* Right: Jump In Gradient Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          router.push("/MainModules/FlipArena");
        }}
        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#F97316] text-white font-extrabold text-[12.5px] sm:text-[13.5px] shadow-[0_4px_16px_rgba(236,72,153,0.45)] hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer relative z-10"
      >
        <span>Jump In</span>
        <span className="text-[14px] font-black">→</span>
      </button>
    </motion.div>
  );

  // Helper for card theme styling based on status and theme
  const getThemeStyles = (
    statusType?: string,
    theme?: RadarCardItem["themeColor"],
    isLive?: boolean,
    isSelected?: boolean
  ) => {
    const isCompleted = statusType === "completed";
    const isUpNext = statusType === "up_next";

    if (isLive) {
      return {
        cardBorder: isSelected
          ? "border-[#10B981] ring-1 ring-[#10B981] shadow-[0_0_18px_rgba(16,185,129,0.3)]"
          : "border-[#10B981]/70 shadow-[0_0_12px_rgba(16,185,129,0.18)]",
        badgeBg: "bg-[#062d22] text-[#10B981] border-[#10B981]/60",
        badgeDot: "bg-[#10B981] shadow-[0_0_8px_#10B981]",
        accentColor: "#10B981",
      };
    }

    if (isCompleted) {
      return {
        cardBorder: isSelected
          ? "border-[#38BDF8]/60 ring-1 ring-[#38BDF8]/40 shadow-[0_0_12px_rgba(56,189,248,0.15)]"
          : "border-[#1e293b] hover:border-[#475569]/80",
        badgeBg: "bg-[#1e293b] text-[#94a3b8] border-[#475569]/60",
        badgeDot: "bg-[#94a3b8]",
        accentColor: "#94a3b8",
      };
    }

    if (isUpNext) {
      return {
        cardBorder: isSelected
          ? "border-[#FBBF24] ring-1 ring-[#FBBF24] shadow-[0_0_14px_rgba(251,191,36,0.25)]"
          : "border-[#4e3814] hover:border-[#856417]",
        badgeBg: "bg-[#33230c] text-[#FBBF24] border-[#856417]/60",
        badgeDot: "bg-[#FBBF24]",
        accentColor: "#FBBF24",
      };
    }

    switch (theme) {
      case "emerald":
        return {
          cardBorder: isSelected ? "border-[#10B981] ring-1 ring-[#10B981]" : "border-[#10B981]/40 hover:border-[#10B981]/70",
          badgeBg: "bg-[#062d22] text-[#10B981] border-[#10B981]/40",
          badgeDot: "bg-[#10B981]",
          accentColor: "#10B981",
        };
      case "amber":
        return {
          cardBorder: isSelected ? "border-[#FBBF24] ring-1 ring-[#FBBF24]" : "border-[#4e3814] hover:border-[#856417]",
          badgeBg: "bg-[#33230c] text-[#FBBF24] border-[#856417]/60",
          badgeDot: "bg-[#FBBF24]",
          accentColor: "#FBBF24",
        };
      case "cyan":
        return {
          cardBorder: isSelected ? "border-[#38BDF8] ring-1 ring-[#38BDF8]" : "border-[#143c52] hover:border-[#0284c7]",
          badgeBg: "bg-[#0c2637] text-[#38BDF8] border-[#0284c7]/50",
          badgeDot: "bg-[#38BDF8]",
          accentColor: "#38BDF8",
        };
      case "purple":
      default:
        return {
          cardBorder: isSelected ? "border-[#A855F7] ring-1 ring-[#A855F7]" : "border-[#2d2254] hover:border-[#583C87]",
          badgeBg: "bg-[#251846] text-[#B794F4] border-[#583C87]/60",
          badgeDot: "bg-[#B794F4]",
          accentColor: "#B794F4",
        };
    }
  };

  const resolvedSubtitle = propActionSubtitle || welcomeConfig?.actionSubtitle || "Top action today";

  return (
    <div className="w-full flex flex-col gap-3 font-sans text-white select-none">
      {/* ─── 1. Header Greeting Section ─────────────────────────────────── */}

      {/* ─── 2. Section Subtitle ────────────────────────────────────────── */}
      <div className="mt-1">
        <h3 className="text-[14px] sm:text-[15px] font-black uppercase tracking-wider text-white leading-tight flex items-center gap-1.5">
          {resolvedSubtitle}
        </h3>
        <div className="flex flex-row justify-between items-center min-w-0 w-full">
          <p className="text-[12px] sm:text-[13px] font-medium text-[#D1A56A] leading-tight truncate">
            Today on your radar
          </p> 
          <button
            type="button" 
            onClick={() => {
              if (onSeeAllClick) {
                onSeeAllClick();
              } else {
                setShowAllAgendaEvents(false);
                setIsAgendaOpen(true);
              }
            }}
            className="flex items-center gap-1 text-[13px] sm:text-[14px] font-bold text-[#E91E8C] hover:text-[#FF4081] transition-colors group cursor-pointer whitespace-nowrap"
          > 
            <div> 
              <span>See all</span>
              <span className="text-[14px] font-black group-hover:translate-x-0.5 transition-transform">&gt;</span> 
            </div> 
          </button>
        </div>

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
              const theme = getThemeStyles(card.statusType, card.themeColor, card.isLive, isSelected);
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
                    card.isLive
                      ? "bg-[#0b101d] border-2 " + theme.cardBorder
                    : isSelected
                      ? "bg-[#0c101d] border-2 " + theme.cardBorder
                      : "bg-[#0c101d] border " + theme.cardBorder
                  }`}
                  style={{
                    minHeight: "136px",
                    boxShadow:
                      card.isLive
                        ? "0 4px 20px rgba(0, 0, 0, 0.45), 0 0 16px rgba(16, 185, 129, 0.15)"
                        : isSelected
                          ? "0 4px 18px rgba(0, 0, 0, 0.45)"
                        : "0 4px 15px rgba(0, 0, 0, 0.35)",
                  }}
                >
                  {/* Top Row: Badge & Status */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${theme.badgeBg}`}
                    >
                      {card.isLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      )}
                      {card.statusType === "completed" && (
                        <span className="text-[9px] font-black">✓</span>
                      )}
                      <span>{card.status}</span>
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
                        {/* <Bell size={12} className={isNotified ? "fill-amber-400" : ""} /> */}
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
          else {
            setShowAllBriefStories(false);
            setIsBriefOpen(true);
          }
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
                {welcomeConfig?.briefTitle || "Daily Huddle"}
              </h3>
              <p className="text-[12px] sm:text-[13px] font-medium text-[#D1A56A] leading-tight mt-0.5 truncate">
                {welcomeConfig?.briefSubtitle || "Top stories to know today"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[13px] sm:text-[14px] font-bold text-[#F59E0B] group-hover:text-[#FBBF24] transition-colors shrink-0 pl-2">
            <span>Read</span>
            <span className="text-[15px] font-extrabold group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </div>
      </motion.div>

      {/* ─── 6. TODAY'S AGENDA MODAL (Dynamic from DynamoDB) ─────────────── */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isAgendaOpen && (
            <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
              <div 
                className="absolute inset-0"
                onClick={() => setIsAgendaOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full max-w-lg h-[90dvh] sm:h-[86vh] max-h-[90dvh] sm:max-h-[850px] rounded-t-[28px] sm:rounded-2xl bg-[#090C15] border border-white/10 sm:border-white/15 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.9)] flex flex-col z-10"
              >
                {/* Drag Handle Bar */}
                <div className="w-full flex justify-center pt-3 pb-1.5 shrink-0 bg-[#090C15] select-none">
                  <div className="w-12 h-1 bg-gray-600/70 rounded-full" />
                </div>

                {/* Modal Header */}
                <div className="px-4 sm:px-6 pt-1 pb-3 sm:pb-4 flex items-center justify-between border-b border-white/10 bg-[#090C15] shrink-0 sticky top-0 z-20">
                  <div className="flex flex-col min-w-0 pr-3">
                    <h2 className="text-[17px] sm:text-[21px] font-black uppercase tracking-tight text-white leading-snug truncate">
                      {resolvedSubtitle}
                    </h2>
                    <p className="text-[11.5px] sm:text-[13px] font-medium text-gray-400 mt-0.5 truncate">
                      {welcomeConfig?.agendaDateTitle || "Today's Schedule"}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Close agenda"
                    onClick={() => setIsAgendaOpen(false)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable Content Container */}
                <div 
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-5 pb-[calc(env(safe-area-inset-bottom,20px)+24px)]"
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
                    ) : dynamicAgendaEvents.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-[13px]">
                        No agenda events scheduled for today.
                      </div>
                    ) : (
                          (showAllAgendaEvents ? dynamicAgendaEvents : dynamicAgendaEvents.slice(0, 3)).map((evt, idx) => {
                            const isLast = idx === (showAllAgendaEvents ? dynamicAgendaEvents.length : Math.min(3, dynamicAgendaEvents.length)) - 1;

                        let nodeStyle = "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
                        let badgeStyle = "bg-[#0b1c33] text-[#60A5FA] border border-[#1E40AF]/60";
                        let badgeGlow = "";

                        if (evt.statusType === "completed") {
                          nodeStyle = "bg-gray-400 shadow-[0_0_6px_rgba(156,163,175,0.4)]";
                          badgeStyle = "bg-[#1e293b] text-[#94a3b8] border border-[#475569]/50";
                        } else if (evt.statusType === "live") {
                          nodeStyle = "bg-emerald-400 shadow-[0_0_10px_#34D399]";
                          badgeStyle = "bg-[#04281E] text-[#10B981] border border-[#10B981]/50";
                          badgeGlow = "shadow-[0_0_10px_rgba(16,185,129,0.25)]";
                        } else if (evt.statusType === "up_next") {
                          nodeStyle = "bg-amber-400 shadow-[0_0_10px_#FBBF24]";
                          badgeStyle = "bg-[#2E1F06] text-[#FBBF24] border border-[#D97706]/60";
                          badgeGlow = "shadow-[0_0_10px_rgba(251,191,36,0.25)]";
                        } else {
                          nodeStyle = "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
                          badgeStyle = "bg-[#0b1c33] text-[#60A5FA] border border-[#1E40AF]/60";
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
                                  <h4 className="text-[14.5px] sm:text-[15px] font-extrabold text-white leading-tight truncate">
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
                                  {evt.statusType === "completed" && (
                                    <span className="text-[10px]">✓</span>
                                  )}
                                  {evt.statusLabel ||
                                    (evt.statusType === "completed"
                                      ? "COMPLETED"
                                      : evt.statusType === "live"
                                      ? "LIVE"
                                      : evt.statusType === "up_next"
                                      ? "UP NEXT"
                                      : "SCHEDULED")}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* View all / Show less toggle for Top Action Today / Agenda Updates */}
                  {dynamicAgendaEvents.length > 3 && (
                    <div className="pt-0.5 pb-1">
                      <button
                        type="button"
                        onClick={() => setShowAllAgendaEvents((prev) => !prev)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 border border-white/10 hover:border-pink-500/50 text-white font-bold text-[12.5px] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                      >
                        <span>
                          {showAllAgendaEvents
                            ? "Show less"
                            : `View all (${dynamicAgendaEvents.length} updates)`}
                        </span>
                        <ChevronRight
                          size={14}
                          className={`transition-transform duration-200 ${showAllAgendaEvents ? "-rotate-90" : "rotate-90"}`}
                        />
                      </button>
                    </div>
                  )}

                  {/* FlipArena Engagement Banner */}
                  {renderFlipArenaBanner()}

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
                        <img src="/images/dollyavatar.png" alt="" className="w-full h-full object-cover" />

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
                        placeholder="Ask about tactics, key players, rivalry history, or winning edge..."
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
                                  {formatAiAnswerText(agendaAnswer)}
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
        </AnimatePresence>,
        document.body
      )}

      {/* ─── 7. MORNING BRIEF MODAL (Dynamic from DynamoDB) ──────────────── */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isBriefOpen && (
            <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
              <div 
                className="absolute inset-0"
                onClick={() => setIsBriefOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full max-w-lg h-[90dvh] sm:h-[86vh] max-h-[90dvh] sm:max-h-[850px] rounded-t-[28px] sm:rounded-2xl bg-[#090C15] border border-white/10 sm:border-white/15 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.9)] flex flex-col z-10"
              >
                {/* Drag Handle Bar */}
                <div className="w-full flex justify-center pt-3 pb-1.5 shrink-0 bg-[#090C15] select-none">
                  <div className="w-12 h-1 bg-gray-600/70 rounded-full" />
                </div>

                {/* Modal Header: Sun Icon + MORNING BRIEF + Close Button */}
                <div className="px-4 sm:px-6 pt-1 pb-3 sm:pb-4 flex items-center justify-between border-b border-white/10 bg-[#090C15] shrink-0 sticky top-0 z-20">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-3">
                    <span className="text-[22px] sm:text-[26px] leading-none select-none shrink-0">
                      🌞
                    </span>
                    <div className="flex flex-col min-w-0">
                      <h2 className="text-[17px] sm:text-[21px] font-black uppercase tracking-tight text-white leading-snug truncate">
                        {welcomeConfig?.briefTitle || "Daily Huddle"}
                      </h2>
                      <p className="text-[11.5px] sm:text-[13px] font-medium text-gray-400 mt-0.5 truncate">
                        {welcomeConfig?.briefSubtitle || "Top stories to know today"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Close brief"
                    onClick={() => setIsBriefOpen(false)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable Content Container */}
                <div 
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-3.5 pb-[calc(env(safe-area-inset-bottom,20px)+24px)]"
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
                        (showAllBriefStories ? briefStories : briefStories.slice(0, 3)).map((story, idx) => (
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

                  {/* View all / Show less toggle for Daily Huddle stories */}
                  {briefStories.length > 3 && (
                    <div className="pt-0.5 pb-1">
                      <button
                        type="button"
                        onClick={() => setShowAllBriefStories((prev) => !prev)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600/15 via-orange-600/15 to-pink-600/15 border border-amber-500/30 hover:border-amber-500/60 text-[#FBBF24] hover:text-white font-bold text-[12.5px] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                      >
                        <span>
                          {showAllBriefStories
                            ? "Show less"
                            : `View all (${briefStories.length} updates)`}
                        </span>
                        <ChevronRight
                          size={14}
                          className={`transition-transform duration-200 ${showAllBriefStories ? "-rotate-90" : "rotate-90"}`}
                        />
                      </button>
                    </div>
                  )}

                  {/* FlipArena Engagement Banner */}
                  {renderFlipArenaBanner()}

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
                        <img src="/images/dollyavatar.png" alt="" className="w-full h-full object-cover" />

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
                        placeholder="Ask about milestones, medal impact, breakthrough performances..."
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
                                  {formatAiAnswerText(briefAnswer)}
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
        </AnimatePresence>,
        document.body
      )}

      {/* ─── 8. Card Detail Quick-View Modal ────────────────────────────── */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedCardDetail && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
              <div 
                className="absolute inset-0"
                onClick={() => setSelectedCardDetail(null)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md max-h-[90dvh] rounded-2xl bg-[#121622] border border-white/15 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col z-10"
              >
                {/* Header */}
                <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#171c2b] flex items-center justify-between shrink-0 sticky top-0 z-20">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                    <div className="text-[24px] sm:text-[28px] shrink-0">{selectedCardDetail.icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] sm:text-[16px] font-black text-white truncate">
                          {selectedCardDetail.sport}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] sm:text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${getThemeStyles(
                            selectedCardDetail.statusType,
                            selectedCardDetail.themeColor,
                            selectedCardDetail.isLive
                          ).badgeBg
                          }`}
                        >
                          {selectedCardDetail.isLive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                          )}
                          {selectedCardDetail.statusType === "completed" && (
                            <span className="text-[9px] font-black">✓</span>
                          )}
                          <span>{selectedCardDetail.status}</span>
                        </span>
                      </div>
                      <p className="text-[11.5px] sm:text-[12px] text-gray-300 font-medium truncate">
                        {selectedCardDetail.event} · {selectedCardDetail.round}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close card detail"
                    onClick={() => setSelectedCardDetail(null)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Match details content */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 min-h-0 overflow-y-auto overscroll-contain">
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
                <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#0d101a] flex items-center justify-between gap-2 shrink-0 pb-[calc(env(safe-area-inset-bottom,0px)+14px)]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCardDetail(null);
                      setShowAllAgendaEvents(false);
                      setIsAgendaOpen(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E91E8C] to-[#FF6B35] text-white font-extrabold text-[13px] hover:opacity-95 transition-opacity text-center cursor-pointer"
                  >
                    View Full Agenda
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}