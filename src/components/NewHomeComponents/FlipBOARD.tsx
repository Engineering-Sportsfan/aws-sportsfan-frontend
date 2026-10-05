"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Flame,
  Zap,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Share2,
  Bookmark,
  Bell,
  ArrowRight,
  ChevronRight,
  X,
  Sparkles,
  Radio,
  ExternalLink,
  Send,
  Loader2,
  Bot,
  Users,
  MessageSquare,
  HelpCircle,
  Plus,
  Award,
  Swords,
  TrendingUp,
  Volume2,
} from "lucide-react";
import {
  welcomeMessageService,
  RadarCardItem,
  AgendaEventItem,
  MorningBriefStory,
  WelcomeConfig,
  resolveDynamicAgendaEvents,
  cleanAiResponse,
} from "@/services/welcomeMessage.service";
import ArenaEngagementModal from "./ArenaEngagementModal";
import type { EngagementType } from "@/types/engagements";

export type { RadarCardItem, AgendaEventItem, MorningBriefStory, WelcomeConfig };

/**
 * Cleanly renders formatted text, bold highlights, and bullet points from AI answers
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
            {isBullet && <span className="text-[#EC4899] font-bold select-none shrink-0">•</span>}
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

// ─── Rich Default Data for Fallbacks ─────────────────────────────────────────
const DEFAULT_BRIEF_STORIES: MorningBriefStory[] = [
  {
    id: "brief-1",
    storyNumber: 1,
    sport: "Cricket",
    icon: "🏏",
    title: "Women's Cricket Final",
    description: "India face Sri Lanka in the gold medal match — biggest game of the Asian Games for Indian cricket.",
    order: 1,
  },
  {
    id: "brief-2",
    storyNumber: 2,
    sport: "Shooting",
    icon: "🎯",
    title: "Shooting Medal Push",
    description: "Indian shooters target the podium in 10m Air Rifle Mixed Team and Skeet Qualification today.",
    order: 2,
  },
  {
    id: "brief-3",
    storyNumber: 3,
    sport: "Badminton",
    icon: "🏸",
    title: "Badminton Knockouts",
    description: "India's men's and women's teams enter the quarter-finals — both sides aiming for the semis.",
    order: 3,
  },
  {
    id: "brief-4",
    storyNumber: 4,
    sport: "Hockey",
    icon: "🏑",
    title: "Men's Hockey Opener",
    description: "India return to Pool A action looking to build on yesterday's win with a stronger second outing.",
    order: 4,
  },
  {
    id: "brief-5",
    storyNumber: 5,
    sport: "Boxing",
    icon: "🥊",
    title: "Boxing Debut",
    description: "Sakshi Chaudhary begins her campaign in Women's 54kg — a medal hopeful in her first Asian Games.",
    order: 5,
  },
];

const DEFAULT_AGENDA_EVENTS: AgendaEventItem[] = [];

const LEADERBOARD_FRIENDS = [
  { rank: 1, name: "Daksh", role: "Oracle", streak: 14, sxp: 820, avatar: "/images/daksh.png", icon: "🥇" },
  { rank: 2, name: "Chandu", role: "Analyst", streak: 9, sxp: 610, avatar: "/images/chandu.png", icon: "🥈" },
  { rank: 3, name: "You", role: "Scout", streak: 7, sxp: 365, avatar: "/images/dollyavatar.png", isCurrent: true, icon: "🥉" },
  { rank: 4, name: "Tushar", role: "Rookie", streak: 3, sxp: 290, avatar: "/images/tushar.png" },
  { rank: 5, name: "Raghav", role: "Rookie", streak: 1, sxp: 175, avatar: "/images/raghav.png" },
];

const INVITE_FRIENDS_LIST = [
  { name: "Daksh", avatar: "👨‍🎤" },
  { name: "Chandu", avatar: "🧑‍💻" },
  { name: "Tushar", avatar: "🧔" },
  { name: "Raghav", avatar: "👳" },
  { name: "Ayush", avatar: "👱" },
];

interface FlipBoardProps {
  userName?: string;
  actionSubtitle?: string;
  onCardClick?: (card: RadarCardItem) => void;
  onSeeAllClick?: () => void;
  onReadBriefClick?: () => void;
}

export default function FlipBOARD({
  userName: propUserName,
  actionSubtitle: propActionSubtitle,
  onCardClick,
  onSeeAllClick,
  onReadBriefClick,
}: FlipBoardProps) {
  const router = useRouter();

  // ─── Dynamic State from DynamoDB (homeDatabase) ─────────────────────────
  const [radarCards, setRadarCards] = useState<RadarCardItem[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEventItem[]>([]);
  const [briefStories, setBriefStories] = useState<MorningBriefStory[]>([]);
  const [welcomeConfig, setWelcomeConfig] = useState<WelcomeConfig | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);

  // Widget State
  const [activeTab, setActiveTab] = useState<"brief" | "schedule">("brief");
  const [isCheckInDone, setIsCheckInDone] = useState(false);
  const [userStreak, setUserStreak] = useState(6);
  const [userSxp, setUserSxp] = useState(340);
  const [userExp, setUserExp] = useState(240);
  const [maxExp] = useState(500);

  // Modal State
  const [isFullBoardOpen, setIsFullBoardOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<"brief" | "schedule" | "board">("brief");
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "live" | "upcoming" | "finals">("all");
  const [showAllBriefStories, setShowAllBriefStories] = useState(false);
  const [showAllAgendaEvents, setShowAllAgendaEvents] = useState(false);
  const [selectedCardDetail, setSelectedCardDetail] = useState<RadarCardItem | AgendaEventItem | null>(null);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Arena Engagement Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialType, setCreateInitialType] = useState<EngagementType>("poll");

  // Poll State (Brief View)
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [hasVotedPoll, setHasVotedPoll] = useState(false);
  const [pollVotes, setPollVotes] = useState({ 0: 48, 1: 32, 2: 20 });

  // Ask Flip AI state
  const [briefQuestion, setBriefQuestion] = useState("");
  const [briefAnswer, setBriefAnswer] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const [scheduleQuestion, setScheduleQuestion] = useState("");
  const [scheduleAnswer, setScheduleAnswer] = useState<string | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Quick Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Open Arena Engagement Creation Modal
  const handleOpenCreate = (type: EngagementType = "poll", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCreateInitialType(type);
    setIsCreateModalOpen(true);
  };

  // Lock body scroll when popup modal is open
  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    if (isFullBoardOpen || isCreateModalOpen || !!selectedCardDetail) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mounted, isFullBoardOpen, isCreateModalOpen, selectedCardDetail]);

  // ─── Fetch Dynamic Data from backend DynamoDB (homeDatabase) ───────────
  const loadDynamicHomeData = useCallback(async () => {
    try {
      const data = await welcomeMessageService.getWelcomeData();
      if (data) {
        if (Array.isArray(data.radarCards) && data.radarCards.length > 0) {
          setRadarCards(data.radarCards);
        }
        if (Array.isArray(data.todaysAgenda) && data.todaysAgenda.length > 0) {
          setAgendaEvents(data.todaysAgenda);
        } else {
          setAgendaEvents(DEFAULT_AGENDA_EVENTS);
        }
        if (Array.isArray(data.morningBrief) && data.morningBrief.length > 0) {
          setBriefStories(data.morningBrief);
        } else {
          setBriefStories(DEFAULT_BRIEF_STORIES);
        }
        if (data.config) {
          setWelcomeConfig(data.config);
        }
      } else {
        setAgendaEvents(DEFAULT_AGENDA_EVENTS);
        setBriefStories(DEFAULT_BRIEF_STORIES);
      }
    } catch (err) {
      console.warn("[FlipBOARD] Backend fetch error, using defaults:", err);
      setAgendaEvents(DEFAULT_AGENDA_EVENTS);
      setBriefStories(DEFAULT_BRIEF_STORIES);
    } finally {
      setIsLoadingBackend(false);
    }
  }, []);

  useEffect(() => {
    loadDynamicHomeData();

    // Re-sync when window receives focus so any changes made in admin are immediately visible
    const handleFocus = () => {
      loadDynamicHomeData();
    };
    window.addEventListener("focus", handleFocus);

    // Periodic 30s auto-refresh in background
    const interval = setInterval(loadDynamicHomeData, 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [loadDynamicHomeData]);

  // Live 15-second clock ticker to automatically transition event statuses in real time
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically calculate event statuses based on current clock time
  const dynamicAgendaEvents = useMemo(() => {
    const eventsToUse = agendaEvents.length > 0 ? agendaEvents : DEFAULT_AGENDA_EVENTS;
    return resolveDynamicAgendaEvents(eventsToUse, currentTime);
  }, [agendaEvents, currentTime]);

  const effectiveBriefStories = useMemo(() => {
    return briefStories.length > 0 ? briefStories : DEFAULT_BRIEF_STORIES;
  }, [briefStories]);

  // Filtered Schedule Events for Modal
  const filteredScheduleEvents = useMemo(() => {
    if (scheduleFilter === "all") return dynamicAgendaEvents;
    if (scheduleFilter === "live") {
      return dynamicAgendaEvents.filter(
        (e) => e.statusType === "live" || e.statusLabel?.toLowerCase() === "live"
      );
    }
    if (scheduleFilter === "upcoming") {
      return dynamicAgendaEvents.filter(
        (e) =>
          e.statusType === "up_next" ||
          e.statusType === "scheduled" ||
          (e.statusType !== "live" && e.statusType !== "completed")
      );
    }
    if (scheduleFilter === "finals") {
      return dynamicAgendaEvents.filter(
        (e) =>
          (e.subEvent && e.subEvent.toLowerCase().includes("final")) ||
          (e.detail && e.detail.toLowerCase().includes("final")) ||
          (e.statusLabel && e.statusLabel.toLowerCase().includes("final")) ||
          (e.sport && e.sport.toLowerCase().includes("final"))
      );
    }
    return dynamicAgendaEvents;
  }, [dynamicAgendaEvents, scheduleFilter]);

  // Handle Daily Check-in
  const handleDailyCheckIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isCheckInDone) return;
    setIsCheckInDone(true);
    setUserStreak((prev) => prev + 1);
    setUserSxp((prev) => prev + 25);
    setUserExp((prev) => Math.min(maxExp, prev + 25));
    showToast("🎉 +25 SXP earned! Daily streak is now alive! 🔥");
  };

  // Handle Poll Vote
  const handleVotePoll = (optionIdx: number) => {
    if (hasVotedPoll) return;
    setSelectedPollOption(optionIdx);
    setHasVotedPoll(true);
    setUserSxp((prev) => prev + 15);
    setUserExp((prev) => Math.min(maxExp, prev + 15));
    setPollVotes((prev) => {
      const updated = { ...prev };
      if (optionIdx === 0) updated[0] += 5;
      else if (optionIdx === 1) updated[1] += 5;
      else updated[2] += 5;
      return updated;
    });
    showToast("🗳️ +15 SXP earned! Thanks for voting in today's poll!");
  };

  // Toggle Event Reminder
  const toggleReminder = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifiedEvents((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast("🔔 Reminder removed");
        return prev.filter((item) => item !== id);
      } else {
        showToast("🔔 Reminder set! We'll notify you before match starts.");
        return [...prev, id];
      }
    });
  };

  // Open Full Board Modal with specific tab
  const openFullModal = (tab: "brief" | "schedule" | "board" = "brief") => {
    setModalActiveTab(tab);
    setShowAllBriefStories(false);
    setShowAllAgendaEvents(false);
    setIsFullBoardOpen(true);
  };

  // Dynamic suggested prompts derived from live stories (exactly 2 questions)
  const dynamicBriefPrompts = useMemo(() => {
    return [
      "Who are India's medal favourites today?",
      "Can Sindhu win gold in Badminton?",
    ];
  }, []);

  const dynamicSchedulePrompts = useMemo(() => {
    return [
      "What time should I set an alarm for?",
      "Which live event needs my attention right now?",
    ];
  }, []);

  // Brief Ask Flip AI logic
  const handleBriefAskSubmit = async (queryToAsk?: string) => {
    const q = (queryToAsk || briefQuestion).trim();
    if (!q || briefLoading) return;
    setBriefLoading(true);
    setBriefAnswer(null);

    const contextMoment = effectiveBriefStories
      .slice(0, 4)
      .map((s) => `${s.sport}: ${s.title} - ${s.description}`)
      .join("; ");

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

    // High-accuracy fallback
    let ans = "";
    const lower = q.toLowerCase();
    if (lower.includes("sindhu") || lower.includes("badminton")) {
      ans = `🏸 **P.V. Sindhu** is in prime knockout form! A clinical opening round sets up a massive clash against top Asian seeds today.`;
    } else if (lower.includes("cricket") || lower.includes("women")) {
      ans = `🏏 **India Women's Cricket Team** enters the Gold Medal clash vs Sri Lanka with high batting momentum and lethal spin dominance!`;
    } else if (lower.includes("shooter") || lower.includes("shooting") || lower.includes("medal")) {
      ans = `🎯 Indian shooters in the **10m Air Rifle Mixed Team** & Skeet qualification carry huge podium expectations today!`;
    } else {
      ans = `⚡ Today's Asian Games brief features high-stakes finals in Cricket, Shooting, and key knockout battles in Badminton!`;
    }

    setBriefAnswer(cleanAiResponse(ans, q));
    setBriefLoading(false);
  };

  // Schedule Ask Flip AI logic
  const handleScheduleAskSubmit = async (queryToAsk?: string) => {
    const q = (queryToAsk || scheduleQuestion).trim();
    if (!q || scheduleLoading) return;
    setScheduleLoading(true);
    setScheduleAnswer(null);

    const contextMoment = dynamicAgendaEvents
      .slice(0, 5)
      .map((e) => `${e.time} - ${e.sport}: ${e.subEvent} (${e.statusLabel})`)
      .join("; ");

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Context moment: "${contextMoment}". Question about schedule: "${q}". Answer in a short, crisp sports fan format under 200 characters.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiAnswer = data.answer || data.response || data.message;
        if (aiAnswer && typeof aiAnswer === "string" && aiAnswer.trim()) {
          setScheduleAnswer(cleanAiResponse(aiAnswer, q));
          setScheduleLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Schedule Ask AI error, using fallback:", err);
    }

    let ans = "";
    const lower = q.toLowerCase();
    if (lower.includes("alarm") || lower.includes("time")) {
      ans = `⏰ Set an alarm for **10:30 AM** for the **Women's Cricket T20 Gold Medal Final**, and tune in now for live Badminton & Shooting!`;
    } else if (lower.includes("live") || lower.includes("attention")) {
      ans = `🔥 **Badminton (India vs Japan)** & **Shooting (10m Air Rifle Mixed Team)** are LIVE right now with medal spots on the line!`;
    } else {
      ans = `🏆 The marquee fixture is the **Women's Cricket Final (India vs Sri Lanka)** at 10:30 AM, followed by swimming finals at 12:00 PM!`;
    }

    setScheduleAnswer(cleanAiResponse(ans, q));
    setScheduleLoading(false);
  };

  // Share Brief Action
  const handleShareBrief = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: "FlipBOARD - Daily Sports Briefing",
          text: "Check out today's sports briefing and live schedule on FlipBOARD!",
          url: typeof window !== "undefined" ? window.location.href : "",
        })
        .catch(() => {});
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
        showToast("📋 Link copied to clipboard!");
      }
    }
  };

  return (
    <div className="w-full flex flex-col font-sans text-white select-none">
      {/* Toast Notification Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[999999] px-4 py-2.5 rounded-full bg-[#1e1333] border border-[#EC4899]/70 text-white font-bold text-[13px] shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(236,72,153,0.3)] flex items-center gap-2 pointer-events-none"
          >
            <Sparkles size={16} className="text-[#EC4899] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────────
          MAIN WIDGET CONTAINER (Cards / Brief & Schedule Collapsed View)
      ───────────────────────────────────────────────────────────────────────── */}
      <div
        className="w-full rounded-[24px] p-4 sm:p-5 border border-white/10 relative overflow-hidden transition-all duration-300"
        style={{
          background: "linear-gradient(180deg, #0f121d 0%, #090b14 100%)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(236, 72, 153, 0.08)",
        }}
      >
        {/* Background ambient lighting */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, #EC4899 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full pointer-events-none opacity-15"
          style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)" }}
        />

        {/* ─── 1. Header Bar: FlipBOARD Title & Badges ─── */}
        <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
          {/* Title & Subtitle */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e152d] to-[#120c1d] border border-[#EC4899]/30 flex items-center justify-center shadow-sm shrink-0">
              <ClipboardList size={18} className="text-[#EC4899]" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[19px] sm:text-[21px] font-black tracking-tight leading-none flex items-center gap-0.5">
                <span className="text-white">Flip</span>
                <span className="bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent">
                  BOARD
                </span>
              </h2>
              <span className="text-[9.5px] sm:text-[10px] font-bold text-gray-400 tracking-[0.18em] uppercase mt-0.5 truncate">
                YOUR DAILY SPORTS BRIEFING
              </span>
            </div>
          </div>

          {/* Right SXP Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#261b0a] border border-[#F59E0B]/40 text-[#F59E0B] text-[11.5px] font-extrabold shadow-sm">
              <Zap size={13} className="text-[#FBBF24] fill-[#FBBF24]" />
              <span>{userSxp} SXP</span>
            </div>
          </div>
        </div>

        {/* ─── 2. Daily Check-in Card (Green Card) ─── */}
        <div className="w-full mb-4 rounded-2xl p-3 sm:p-3.5 bg-gradient-to-r from-[#041a12] via-[#062419] to-[#041a12] border border-[#10B981]/35 flex items-center justify-between gap-3 shadow-[0_0_18px_rgba(16,185,129,0.08)] relative z-10">
          <div className="flex flex-col min-w-0">
            <h4 className="text-[13.5px] sm:text-[14px] font-black text-[#10B981] leading-tight">
              Daily Check-in
            </h4>
            <p className="text-[11px] sm:text-[12px] font-medium text-gray-300 leading-tight mt-0.5">
              +25 SXP · keeps your streak alive
            </p>
          </div>

          <button
            type="button"
            onClick={handleDailyCheckIn}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl font-extrabold text-[12px] sm:text-[12.5px] transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer ${
              isCheckInDone
                ? "bg-[#064e3b] text-[#34D399] border border-[#10B981]/40 shadow-none cursor-default"
                : "bg-[#10B981] hover:bg-[#059669] text-black shadow-[0_0_12px_rgba(16,185,129,0.35)] active:scale-95"
            }`}
          >
            <span>{isCheckInDone ? "Checked" : "Check In"}</span>
            <span>✓</span>
          </button>
        </div>

        {/* ─── 3. Navigation Tabs: BRIEF vs SCHEDULE ─── */}
        <div className="flex items-center border-b border-white/10 mb-3.5 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab("brief")}
            className={`flex-1 pb-2.5 text-[13px] sm:text-[14px] font-black tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === "brief" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>📰</span>
            <span>BRIEF</span>
            {activeTab === "brief" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`flex-1 pb-2.5 text-[13px] sm:text-[14px] font-black tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === "schedule" ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>📅</span>
            <span>SCHEDULE</span>
            {activeTab === "schedule" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
              />
            )}
          </button>
        </div>

        {/* ─── 4. Tab Content View (Shows Top 3 Items) ─── */}
        {activeTab === "brief" ? (
          /* ─── TAB A: BRIEF VIEW (Shows top 3 stories + Today's Poll + Actions) ─── */
          <div className="space-y-3 relative z-10">
            {/* Top 3 Brief Stories */}
            <div className="space-y-2">
              {effectiveBriefStories.slice(0, 3).map((story, idx) => (
                <div
                  key={story.id || idx}
                  onClick={() => openFullModal("brief")}
                  className="rounded-2xl p-3 sm:p-3.5 bg-[#0e1220]/90 border border-white/[0.08] hover:border-[#EC4899]/40 hover:bg-[#13182b] transition-all cursor-pointer flex items-start gap-3 group shadow-sm"
                >
                  <span className="text-[20px] sm:text-[22px] leading-none shrink-0 pt-0.5">
                    {story.icon || "🏆"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13.5px] sm:text-[14.5px] font-extrabold text-white leading-snug group-hover:text-[#F472B6] transition-colors">
                      {story.title}
                    </h4>
                    <p className="text-[11.5px] sm:text-[12px] font-normal text-gray-300/90 leading-relaxed mt-0.5 line-clamp-2">
                      {story.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Today's Poll Card */}
            <div className="rounded-2xl p-3.5 sm:p-4 bg-[#0e1022]/95 border border-[#7C3AED]/30 shadow-[0_4px_20px_rgba(124,58,237,0.12)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider text-[#EC4899] flex items-center gap-1">
                  📊 TODAY&apos;S POLL · +15 SXP
                </span>
                {hasVotedPoll && (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Voted
                  </span>
                )}
              </div>

              <h4 className="text-[13.5px] sm:text-[14px] font-extrabold text-white leading-snug">
                Who wins Gold in Women&apos;s Badminton today?
              </h4>

              {/* Poll Options */}
              <div className="space-y-1.5">
                {[
                  { label: "P.V. Sindhu", country: "IN" },
                  { label: "Chen Yufei", country: "CN" },
                  { label: "Akane Yamaguchi", country: "JP" },
                ].map((opt, oIdx) => {
                  const isSelected = selectedPollOption === oIdx;
                  const pct = pollVotes[oIdx as keyof typeof pollVotes] || 33;

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleVotePoll(oIdx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-[12px] sm:text-[12.5px] font-bold transition-all relative overflow-hidden flex items-center justify-between ${
                        isSelected
                          ? "bg-[#2b103b] border-[#EC4899] text-white shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                          : hasVotedPoll
                          ? "bg-[#111425] border-white/10 text-gray-300"
                          : "bg-[#111425] border-white/10 hover:border-purple-500/50 hover:bg-[#181c33] text-gray-200 cursor-pointer"
                      }`}
                    >
                      {/* Live Fill Bar if voted */}
                      {hasVotedPoll && (
                        <div
                          className={`absolute left-0 top-0 bottom-0 opacity-25 pointer-events-none transition-all duration-500 ${
                            isSelected ? "bg-[#EC4899]" : "bg-purple-600"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      )}

                      <div className="flex items-center gap-2 relative z-10">
                        <span className="text-[10.5px] font-black px-1.5 py-0.5 rounded bg-white/10 text-gray-300 uppercase">
                          {opt.country}
                        </span>
                        <span>{opt.label}</span>
                      </div>

                      {hasVotedPoll && (
                        <span className="text-[11.5px] font-black text-gray-300 relative z-10">
                          {pct}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => router.push("/MainModules/FlipArena")}
                className="flex-1 py-1.5 px-2 rounded-full border border-[#EC4899]/70 text-[#EC4899] hover:bg-[#EC4899]/15 font-bold text-[11.5px] flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>🥊</span>
                <span>Predict</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/MainModules/FlipLine")}
                className="flex-1 py-1.5 px-2 rounded-full border border-white/15 bg-white/[0.04] text-gray-200 hover:bg-white/10 font-bold text-[11.5px] flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>💬</span>
                <span>Discuss</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleOpenCreate("poll", e)}
                className="flex-1 py-1.5 px-2 rounded-full border border-[#F59E0B]/70 text-[#F59E0B] hover:bg-[#F59E0B]/15 font-bold text-[11.5px] flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>✨</span>
                <span>Create</span>
              </button>
            </div>

            {/* Bottom Bar: Dots & Full board link */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-1.5 rounded-full bg-[#EC4899] shadow-[0_0_6px_#EC4899]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>

              <button
                type="button"
                onClick={() => openFullModal("brief")}
                className="text-[12.5px] sm:text-[13px] font-black text-[#F59E0B] hover:text-[#FBBF24] transition-colors flex items-center gap-1 cursor-pointer group"
              >
                <span>Full board + earn SXP</span>
                <span className="font-extrabold text-[14px] group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* ─── TAB B: SCHEDULE VIEW (Shows top 3 live/scheduled events) ─── */
          <div className="space-y-3 relative z-10">
            {/* Top 3 Schedule Timeline Items */}
            <div className="relative pl-3 space-y-3">
              {/* Continuous vertical timeline line */}
              <div className="absolute left-[17px] top-3 bottom-3 w-[1.5px] bg-slate-800 pointer-events-none" />

              {dynamicAgendaEvents.slice(0, 3).map((evt, idx) => {
                const isLive = evt.statusType === "live" || evt.statusLabel?.toLowerCase() === "live";
                const isFinal =
                  (evt.subEvent && evt.subEvent.toLowerCase().includes("final")) ||
                  evt.statusLabel === "FINAL";

                let dotColor = "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
                if (isLive) dotColor = "bg-[#10B981] shadow-[0_0_10px_#10B981]";
                else if (isFinal) dotColor = "bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]";
                else if (evt.statusType === "up_next") dotColor = "bg-purple-400 shadow-[0_0_8px_#C084FC]";

                return (
                  <div
                    key={evt.id || idx}
                    onClick={() => {
                      setSelectedCardDetail(evt);
                    }}
                    className="relative flex items-start gap-3.5 group cursor-pointer"
                  >
                    {/* Timeline Dot */}
                    <div className="relative z-10 pt-1.5 shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                    </div>

                    {/* Event Content Row */}
                    <div className="flex-1 flex items-center justify-between min-w-0 pr-1 pb-1">
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[16px] leading-none shrink-0">{evt.icon || "🏆"}</span>
                          <h4 className="text-[13.5px] sm:text-[14px] font-extrabold text-white truncate group-hover:text-[#38BDF8] transition-colors">
                            {evt.sport}
                          </h4>
                        </div>
                        <p className="text-[11px] sm:text-[11.5px] font-medium text-gray-300/85 truncate mt-0.5">
                          {evt.detail ? `${evt.detail} · ${evt.subEvent}` : evt.subEvent}
                        </p>
                        {isLive && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/MainModules/FlipLine");
                            }}
                            className="mt-1.5 px-3 py-1 rounded-full bg-[#052e22] border border-[#10B981]/50 text-[#10B981] text-[11px] font-black w-fit hover:bg-[#074231] transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Watch Live</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>

                      {/* Status / Badge */}
                      <div className="shrink-0">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#04281E] text-[#10B981] border border-[#10B981]/50 uppercase tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                            <span>LIVE</span>
                          </span>
                        ) : isFinal ? (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2a1b08] text-[#F59E0B] border border-[#F59E0B]/50 uppercase tracking-wider">
                            <span>🏆</span>
                            <span>FINAL</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-black text-gray-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 uppercase">
                            {evt.time || evt.statusLabel || "SCHEDULED"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Full Schedule Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => openFullModal("schedule")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#061826]/90 border border-[#0284C7]/60 hover:border-[#38BDF8] text-[#38BDF8] hover:bg-[#0a263d] font-extrabold text-[12.5px] sm:text-[13px] text-center transition-all cursor-pointer shadow-[0_0_15px_rgba(2,132,199,0.12)] flex items-center justify-center gap-1.5"
              >
                <span>Full Schedule + Set Reminders</span>
                <span className="font-extrabold text-[14px]">→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          FULL FLIPBOARD POPUP MODAL (Brief / Schedule / Board Tabs)
      ───────────────────────────────────────────────────────────────────────── */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isFullBoardOpen && (
              <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
                {/* Backdrop Click */}
                <div className="absolute inset-0" onClick={() => setIsFullBoardOpen(false)} />

                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="relative w-full max-w-lg h-[92dvh] sm:h-[88vh] max-h-[92dvh] sm:max-h-[860px] rounded-t-[28px] sm:rounded-2xl bg-[#090C16] border border-white/10 sm:border-white/15 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.9)] flex flex-col z-10"
                >
                  {/* Drag Handle Bar */}
                  <div className="w-full flex justify-center pt-3 pb-1 shrink-0 bg-[#090C16] select-none">
                    <div className="w-12 h-1 bg-gray-600/70 rounded-full" />
                  </div>

                  {/* ─── Modal Header: Title, Subtitle, Badges & Close Button ─── */}
                  <div className="px-4 sm:px-6 pt-1 pb-2 flex items-center justify-between bg-[#090C16] shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-[#1a0f26] border border-[#EC4899]/40 flex items-center justify-center shrink-0">
                        <ClipboardList size={18} className="text-[#EC4899]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-[17px] sm:text-[19px] font-black leading-tight flex items-center gap-0.5">
                          <span className="text-white">Flip</span>
                          <span className="bg-gradient-to-r from-[#EC4899] to-[#FB7185] bg-clip-text text-transparent">
                            BOARD
                          </span>
                        </h3>
                        <p className="text-[11px] font-semibold text-gray-400 truncate">
                          {welcomeConfig?.agendaDateTitle || "Asian Games 2026 - Today"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* SXP badge */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#261b0a] border border-[#F59E0B]/40 text-[#F59E0B] text-[11px] font-black">
                        <Zap size={12} className="fill-[#FBBF24] text-[#FBBF24]" />
                        <span>{userSxp + 25}</span>
                      </div>

                      {/* Close button */}
                      <button
                        type="button"
                        aria-label="Close FlipBoard"
                        onClick={() => setIsFullBoardOpen(false)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* ─── Level & Scout Fan EXP Progress Bar ─── */}
                  <div className="px-4 sm:px-6 py-2 bg-[#090C16] shrink-0 border-b border-white/5">
                    <div className="flex items-center justify-between text-[11.5px] font-bold mb-1">
                      <div className="flex items-center gap-1.5 text-white">
                        <span className="text-[14px]">🎖️</span>
                        <span>Scout Fan</span>
                      </div>
                      <div className="text-gray-400 text-[11px]">
                        <span className="text-[#FBBF24] font-black">{userExp}</span> / {maxExp} EXP ·{" "}
                        <span className="text-gray-300">Analyst</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#EC4899] shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        style={{ width: `${(userExp / maxExp) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* ─── Modal 3 Tabs: BRIEF | SCHEDULE | BOARD ─── */}
                  <div className="px-4 sm:px-6 pt-2 pb-0 flex items-center border-b border-white/10 bg-[#090C16] shrink-0">
                    <button
                      type="button"
                      onClick={() => setModalActiveTab("brief")}
                      className={`flex-1 pb-2.5 text-[12.5px] sm:text-[13.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                        modalActiveTab === "brief" ? "text-white" : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <span>📰</span>
                      <span>BRIEF</span>
                      {modalActiveTab === "brief" && (
                        <motion.div
                          layoutId="modalTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalActiveTab("schedule")}
                      className={`flex-1 pb-2.5 text-[12.5px] sm:text-[13.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                        modalActiveTab === "schedule" ? "text-white" : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <span>📅</span>
                      <span>SCHEDULE</span>
                      {modalActiveTab === "schedule" && (
                        <motion.div
                          layoutId="modalTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalActiveTab("board")}
                      className={`flex-1 pb-2.5 text-[12.5px] sm:text-[13.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                        modalActiveTab === "board" ? "text-white" : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <span>🏆</span>
                      <span>BOARD</span>
                      {modalActiveTab === "board" && (
                        <motion.div
                          layoutId="modalTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EC4899] shadow-[0_2px_10px_rgba(236,72,153,0.8)]"
                        />
                      )}
                    </button>
                  </div>

                  {/* ─── Scrollable Modal Body ─── */}
                  <div
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4 pb-[calc(env(safe-area-inset-bottom,20px)+24px)]"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(255,255,255,0.15) transparent",
                    }}
                  >
                    {/* ─────────────────────────────────────────────────────────────
                        MODAL TAB 1: BRIEF
                    ───────────────────────────────────────────────────────────── */}
                    {modalActiveTab === "brief" && (
                      <div className="space-y-4">
                        {/* Quick Action Chips Row */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                          <button
                            type="button"
                            onClick={handleShareBrief}
                            className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 hover:border-[#EC4899]/50 text-gray-200 hover:text-white font-bold text-[12px] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                          >
                            <Share2 size={13} className="text-[#EC4899]" />
                            <span>Share Brief</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsFullBoardOpen(false);
                              router.push("/MainModules/FlipLine");
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-[#06241a] border border-[#10B981]/50 text-[#10B981] font-bold text-[12px] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                          >
                            <span>Watch Live 🔴</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsFullBoardOpen(false);
                              router.push("/MainModules/FlipArena");
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-[#200d2b] border border-[#EC4899]/40 text-[#EC4899] font-bold text-[12px] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                          >
                            <span>Join FlipARENA</span>
                          </button>
                        </div>

                        {/* Stories List (Top 3 default, expandable with View all) */}
                        <div className="space-y-3">
                          {(showAllBriefStories
                            ? effectiveBriefStories
                            : effectiveBriefStories.slice(0, 3)
                          ).map((story, idx) => (
                            <div
                              key={story.id || idx}
                              className="rounded-2xl p-3.5 sm:p-4 bg-[#0e1220]/90 border border-white/10 hover:border-[#EC4899]/40 transition-all space-y-2.5 shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                {/* Number Badge */}
                                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                                  <div className="w-6 h-6 rounded-md bg-[#2a1a09] border border-[#F59E0B]/50 text-[#F59E0B] text-[12px] font-black flex items-center justify-center shadow-sm">
                                    {story.storyNumber || idx + 1}
                                  </div>
                                  <span className="text-[18px] leading-none">{story.icon || "🏆"}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[14px] sm:text-[15px] font-extrabold text-white leading-snug">
                                    {story.title}
                                  </h4>
                                  <p className="text-[12px] sm:text-[12.5px] font-normal text-gray-300 leading-relaxed mt-1">
                                    {story.description}
                                  </p>
                                </div>
                              </div>

                              {/* Story Actions Row */}
                              <div className="flex items-center gap-2 pt-1 border-t border-white/5 pl-9">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsFullBoardOpen(false);
                                    router.push("/MainModules/FlipArena");
                                  }}
                                  className="px-3 py-1 rounded-full border border-[#EC4899]/70 text-[#EC4899] hover:bg-[#EC4899]/15 font-bold text-[11px] transition-all cursor-pointer"
                                >
                                  Predict &gt;
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsFullBoardOpen(false);
                                    router.push("/MainModules/FlipLine");
                                  }}
                                  className="px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] text-gray-300 hover:bg-white/10 font-bold text-[11px] transition-all cursor-pointer"
                                >
                                  Discuss
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenCreate("poll", e)}
                                  className="px-3 py-1 rounded-full border border-[#F59E0B]/70 text-[#F59E0B] hover:bg-[#F59E0B]/15 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span>+ Create</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* View all / Show less toggle button for Brief */}
                        {effectiveBriefStories.length > 3 && (
                          <div className="pt-0.5 pb-1">
                            <button
                              type="button"
                              onClick={() => setShowAllBriefStories((prev) => !prev)}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600/15 via-orange-600/15 to-pink-600/15 border border-amber-500/30 hover:border-amber-500/60 text-[#FBBF24] hover:text-white font-bold text-[12.5px] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                            >
                              <span>
                                {showAllBriefStories
                                  ? "Show less"
                                  : `View all (${effectiveBriefStories.length} stories)`}
                              </span>
                              <ChevronRight
                                size={14}
                                className={`transition-transform duration-200 ${
                                  showAllBriefStories ? "-rotate-90" : "rotate-90"
                                }`}
                              />
                            </button>
                          </div>
                        )}

                        {/* Post to FlipLine Card */}
                        <div className="w-full rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-[#0d162d] via-[#091024] to-[#0d162d] border border-[#0284C7]/40 flex items-center justify-between gap-3 shadow-[0_0_18px_rgba(2,132,199,0.1)]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#06233d] border border-[#0284C7]/50 flex items-center justify-center text-[#38BDF8] text-[18px] shrink-0">
                              ⚡
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-[13.5px] font-black uppercase tracking-wide text-[#38BDF8]">
                                POST TO FLIPLINE
                              </h4>
                              <p className="text-[11.5px] text-gray-400 font-medium truncate">
                                Your prediction shows as a card in the timeline
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsFullBoardOpen(false);
                              router.push("/MainModules/FlipLine");
                            }}
                            className="px-4 py-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white font-extrabold text-[12px] shrink-0 transition-all cursor-pointer"
                          >
                            Go →
                          </button>
                        </div>

                        {/* FlipArena Banner */}
                        <div className="w-full rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-[#180924] via-[#100619] to-[#180924] border border-[#EC4899]/40 flex items-center justify-between gap-3 shadow-[0_0_18px_rgba(236,72,153,0.12)]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#260e36] border border-[#EC4899]/50 flex items-center justify-center text-[18px] shrink-0">
                              🎟️
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-[13.5px] font-black uppercase tracking-wide text-[#EC4899] flex items-center gap-1.5">
                                <span>FLIPARENA</span>
                                <span className="text-[11px] font-extrabold text-[#FBBF24]">+20 SXP</span>
                              </h4>
                              <p className="text-[11.5px] text-gray-400 font-medium truncate">
                                Polls · Battles · Quizzes · Fan Rankings
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsFullBoardOpen(false);
                              router.push("/MainModules/FlipArena");
                            }}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[12px] shrink-0 shadow-[0_2px_10px_rgba(236,72,153,0.4)] hover:opacity-95 transition-all cursor-pointer"
                          >
                            Jump In →
                          </button>
                        </div>

                        {/* Invite Friends Banner */}
                        <div className="w-full rounded-2xl p-4 bg-[#14101e] border border-[#F59E0B]/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[18px]">🤝</span>
                              <div>
                                <h4 className="text-[13.5px] font-black uppercase text-[#FBBF24]">
                                  INVITE FRIENDS
                                </h4>
                                <p className="text-[11px] text-gray-400 font-medium">
                                  Earn +50 SXP per friend who joins FlipBOARD
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Friends Avatars */}
                          <div className="flex items-center justify-around pt-1">
                            {INVITE_FRIENDS_LIST.map((f, fIdx) => (
                              <div key={fIdx} className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-full bg-[#2a1a09] border border-[#F59E0B]/40 flex items-center justify-center text-[18px] shadow-sm">
                                  {f.avatar}
                                </div>
                                <span className="text-[10px] font-bold text-gray-300">{f.name}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              handleShareBrief();
                              showToast("🤝 +50 SXP referral invite shared!");
                            }}
                            className="w-full py-2.5 rounded-xl bg-[#26180a] border border-[#F59E0B]/60 hover:bg-[#38230f] text-[#FBBF24] font-extrabold text-[12.5px] transition-all cursor-pointer text-center"
                          >
                            Invite All Friends +50 SXP each →
                          </button>
                        </div>

                        {/* Ask Flip AI Section */}
                        <div className="w-full rounded-2xl p-4 bg-gradient-to-b from-[#130B24] to-[#0A0714] border border-[#A855F7]/30 space-y-3 shadow-[0_4px_25px_rgba(124,58,237,0.15)]">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-[1.5px] shadow-sm shrink-0">
                              <div className="w-full h-full rounded-full bg-[#130B24] flex items-center justify-center text-[15px]">
                                🐬
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[14px] font-black uppercase text-white flex items-center gap-1">
                                ASK FLIP 🐬
                              </h4>
                              <p className="text-[11px] text-gray-400 font-medium">
                                Dive deeper into any story from today&apos;s brief
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-gray-400">
                              TRY ASKING:
                            </span>
                            <div className="space-y-1.5">
                              {dynamicBriefPrompts.slice(0, 2).map((prompt, pIdx) => (
                                <button
                                  key={pIdx}
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
                          </div>

                          <div className="relative">
                            <textarea
                              rows={2}
                              value={briefQuestion}
                              onChange={(e) => setBriefQuestion(e.target.value)}
                              placeholder="Or type your own question about today's stories..."
                              className="w-full rounded-xl bg-[#090B12] border border-white/10 p-3 text-[12.5px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/70 resize-none transition-colors"
                            />
                          </div>

                          {/* AI Response Display */}
                          <AnimatePresence>
                            {(briefLoading || briefAnswer) && (
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[12.5px] text-gray-200 leading-relaxed"
                              >
                                {briefLoading ? (
                                  <div className="flex items-center gap-2 text-purple-300 font-medium">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Flip is analyzing today&apos;s stories...</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
                                      <Sparkles size={12} />
                                      <span>Flip AI Analysis</span>
                                    </div>
                                    <div className="text-white/95">{formatAiAnswerText(briefAnswer)}</div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button
                            type="button"
                            onClick={() => handleBriefAskSubmit()}
                            disabled={briefLoading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-[0_4px_18px_rgba(236,72,153,0.35)] hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {briefLoading ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <>
                                <span>Ask Flip</span>
                                <span>🐬</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        MODAL TAB 2: SCHEDULE
                    ───────────────────────────────────────────────────────────── */}
                    {modalActiveTab === "schedule" && (
                      <div className="space-y-4">
                        {/* Filter Chips: All | Live | Upcoming | Finals */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                          {[
                            { key: "all", label: "All" },
                            { key: "live", label: "🔴 Live" },
                            { key: "upcoming", label: "📅 Upcoming" },
                            { key: "finals", label: "🏆 Finals" },
                          ].map((f) => (
                            <button
                              key={f.key}
                              type="button"
                              onClick={() => setScheduleFilter(f.key as any)}
                              className={`px-3.5 py-1.5 rounded-full font-extrabold text-[12px] transition-all shrink-0 cursor-pointer ${
                                scheduleFilter === f.key
                                  ? "bg-[#EC4899] text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                                  : "bg-white/[0.05] border border-white/10 text-gray-300 hover:text-white"
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        {/* Schedule Timeline (Top 3 default, expandable with View all) */}
                        <div className="relative pl-3 space-y-4 pt-1">
                          {/* Vertical connecting line */}
                          <div className="absolute left-[17px] top-4 bottom-4 w-[1.5px] bg-slate-800 pointer-events-none" />

                          {(showAllAgendaEvents
                            ? filteredScheduleEvents
                            : filteredScheduleEvents.slice(0, 3)
                          ).map((evt, idx) => {
                            const isLive =
                              evt.statusType === "live" || evt.statusLabel?.toLowerCase() === "live";
                            const isFinal =
                              (evt.subEvent && evt.subEvent.toLowerCase().includes("final")) ||
                              evt.statusLabel === "FINAL";
                            const isNotified = notifiedEvents.includes(evt.id);

                            let dotColor = "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
                            if (isLive) dotColor = "bg-[#10B981] shadow-[0_0_10px_#10B981]";
                            else if (evt.statusType === "up_next")
                              dotColor = "bg-[#FBBF24] shadow-[0_0_8px_#FBBF24]";
                            else if (isFinal) dotColor = "bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]";

                            return (
                              <div
                                key={evt.id || idx}
                                onClick={() => setSelectedCardDetail(evt)}
                                className="relative flex items-start gap-3.5 group cursor-pointer"
                              >
                                {/* Timeline Dot */}
                                <div className="relative z-10 pt-1.5 shrink-0">
                                  <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                                </div>

                                {/* Event Body */}
                                <div className="flex-1 rounded-2xl p-3 sm:p-3.5 bg-[#0e1220]/90 border border-white/10 hover:border-cyan-500/40 transition-all space-y-2.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col min-w-0 pr-1">
                                      <span className="text-[11px] font-bold text-gray-400">
                                        {evt.time}
                                      </span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[18px] leading-none shrink-0">
                                          {evt.icon || "🏆"}
                                        </span>
                                        <h4 className="text-[14px] sm:text-[14.5px] font-extrabold text-white truncate group-hover:text-cyan-400 transition-colors">
                                          {evt.sport}
                                        </h4>
                                      </div>
                                      <p className="text-[11.5px] font-medium text-gray-300 mt-0.5 truncate">
                                        {evt.subEvent}
                                      </p>
                                      {evt.detail && (
                                        <p className="text-[11px] font-normal text-gray-400 truncate">
                                          {evt.detail}
                                        </p>
                                      )}
                                      {evt.venue && (
                                        <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                          <MapPin size={11} className="text-cyan-400 shrink-0" />
                                          <span>{evt.venue}</span>
                                        </p>
                                      )}
                                    </div>

                                    <div className="shrink-0">
                                      {isLive ? (
                                        <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#04281E] text-[#10B981] border border-[#10B981]/50 uppercase tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                                          <span>LIVE</span>
                                        </span>
                                      ) : evt.statusType === "up_next" ? (
                                        <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2a1e08] text-[#FBBF24] border border-[#FBBF24]/50 uppercase tracking-wider">
                                          <span>UP NEXT</span>
                                        </span>
                                      ) : isFinal ? (
                                        <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2a1b08] text-[#F59E0B] border border-[#F59E0B]/50 uppercase tracking-wider">
                                          <span>🏆</span>
                                          <span>FINAL</span>
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-black text-gray-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 uppercase">
                                          {evt.statusLabel || "UPCOMING"}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons Row */}
                                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                                    {isLive ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsFullBoardOpen(false);
                                          router.push("/MainModules/FlipLine");
                                        }}
                                        className="px-3 py-1 rounded-full bg-[#063023] border border-[#10B981]/60 text-[#10B981] hover:bg-[#094734] font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <span>Watch Live 🔴</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => toggleReminder(evt.id, e)}
                                        className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                                          isNotified
                                            ? "bg-[#2b103b] border border-[#EC4899] text-[#EC4899]"
                                            : "bg-white/[0.04] border border-white/15 text-gray-300 hover:bg-white/10"
                                        }`}
                                      >
                                        <Bell size={11} className={isNotified ? "fill-[#EC4899]" : ""} />
                                        <span>{isNotified ? "Reminder Set ✓" : "Set Reminder 🔔"}</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsFullBoardOpen(false);
                                        router.push("/MainModules/FlipArena");
                                      }}
                                      className="px-3 py-1 rounded-full border border-[#EC4899]/70 text-[#EC4899] hover:bg-[#EC4899]/15 font-bold text-[11px] transition-all cursor-pointer"
                                    >
                                      Predict &gt;
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenCreate("prediction", e);
                                      }}
                                      className="px-3 py-1 rounded-full border border-[#F59E0B]/70 text-[#F59E0B] hover:bg-[#F59E0B]/15 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <span>+ Create</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* View all / Show less toggle button for Schedule */}
                        {filteredScheduleEvents.length > 3 && (
                          <div className="pt-0.5 pb-1">
                            <button
                              type="button"
                              onClick={() => setShowAllAgendaEvents((prev) => !prev)}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 border border-white/10 hover:border-cyan-500/50 text-[#38BDF8] hover:text-white font-bold text-[12.5px] flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                            >
                              <span>
                                {showAllAgendaEvents
                                  ? "Show less"
                                  : `View all (${filteredScheduleEvents.length} events)`}
                              </span>
                              <ChevronRight
                                size={14}
                                className={`transition-transform duration-200 ${
                                  showAllAgendaEvents ? "-rotate-90" : "rotate-90"
                                }`}
                              />
                            </button>
                          </div>
                        )}

                        {/* Ask Flip About Schedule Section */}
                        <div className="w-full rounded-2xl p-4 bg-gradient-to-b from-[#130B24] to-[#0A0714] border border-[#A855F7]/30 space-y-3 shadow-[0_4px_25px_rgba(124,58,237,0.15)] mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-[1.5px] shadow-sm shrink-0">
                              <div className="w-full h-full rounded-full bg-[#130B24] flex items-center justify-center text-[15px]">
                                🐬
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[14px] font-black uppercase text-white flex items-center gap-1">
                                ASK FLIP ABOUT THE SCHEDULE 🐬
                              </h4>
                              <p className="text-[11px] text-gray-400 font-medium">
                                Instant insights on fixtures, match timings, &amp; big clashes
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {dynamicSchedulePrompts.slice(0, 2).map((prompt, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  setScheduleQuestion(prompt);
                                  handleScheduleAskSubmit(prompt);
                                }}
                                className="w-full text-left px-3.5 py-2 rounded-xl text-[12px] font-medium text-gray-300 bg-white/[0.04] border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.07] hover:text-white transition-all cursor-pointer truncate"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>

                          <div className="relative">
                            <textarea
                              rows={2}
                              value={scheduleQuestion}
                              onChange={(e) => setScheduleQuestion(e.target.value)}
                              placeholder="Ask about live events, timing, alarms, key rivalries..."
                              className="w-full rounded-xl bg-[#090B12] border border-white/10 p-3 text-[12.5px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/70 resize-none transition-colors"
                            />
                          </div>

                          {/* AI Response */}
                          <AnimatePresence>
                            {(scheduleLoading || scheduleAnswer) && (
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[12.5px] text-gray-200 leading-relaxed"
                              >
                                {scheduleLoading ? (
                                  <div className="flex items-center gap-2 text-purple-300 font-medium">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Flip is checking the live schedule...</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
                                      <Sparkles size={12} />
                                      <span>Flip Schedule Insight</span>
                                    </div>
                                    <div className="text-white/95">{formatAiAnswerText(scheduleAnswer)}</div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <button
                            type="button"
                            onClick={() => handleScheduleAskSubmit()}
                            disabled={scheduleLoading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-[0_4px_18px_rgba(236,72,153,0.35)] hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {scheduleLoading ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <>
                                <span>Ask Flip</span>
                                <span>🐬</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        MODAL TAB 3: BOARD (SXP Hub & Leaderboard)
                    ───────────────────────────────────────────────────────────── */}
                    {modalActiveTab === "board" && (
                      <div className="space-y-4">
                        {/* User Profile Card */}
                        <div className="w-full rounded-2xl p-4 bg-gradient-to-br from-[#1c150b] via-[#120e07] to-[#1c150b] border border-[#F59E0B]/50 flex items-center gap-3.5 shadow-[0_0_20px_rgba(245,158,11,0.12)]">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#EC4899] p-[2px] shrink-0">
                            <div className="w-full h-full rounded-full bg-[#1c150b] flex items-center justify-center text-[20px]">
                              👤
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-[15px] font-black text-white">You</h4>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40 uppercase">
                                Scout
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11.5px] font-bold text-gray-300 mt-1">
                              <span className="text-[#FBBF24] flex items-center gap-1">
                                <Zap size={12} className="fill-[#FBBF24]" />
                                {userSxp + 25} SXP
                              </span>
                              <span>·</span>
                              <span className="text-amber-400 flex items-center gap-1">
                                <Flame size={12} className="fill-amber-400" />
                                {userStreak + 1}-day streak
                              </span>
                              <span>·</span>
                              <span className="text-gray-400">Rank #14</span>
                            </div>
                          </div>
                        </div>

                        {/* EARN MORE SXP TODAY Section */}
                        <div className="space-y-2">
                          <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-400">
                            EARN MORE SXP TODAY
                          </span>

                          <div className="space-y-2">
                            {/* Daily Check-in Item */}
                            <div
                              onClick={handleDailyCheckIn}
                              className="rounded-xl p-3 bg-[#0a1f16] border border-[#10B981]/40 flex items-center justify-between cursor-pointer hover:bg-[#0c291d] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-md bg-[#10B981] flex items-center justify-center text-black text-[11px] font-black">
                                  ✓
                                </div>
                                <span className="text-[12.5px] font-bold text-white">Daily Check-in</span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#10B981]">+25 SXP</span>
                            </div>

                            {/* Vote in poll */}
                            <div
                              onClick={() => setModalActiveTab("brief")}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">📊</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Vote in today&apos;s poll
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#EC4899]">+15</span>
                            </div>

                            {/* Make a prediction */}
                            <div
                              onClick={() => handleOpenCreate("prediction")}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">🔮</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Make a prediction
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#EC4899]">+30</span>
                            </div>

                            {/* Create a Poll or Prediction */}
                            <div
                              onClick={() => handleOpenCreate("poll")}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">✨</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Create a Poll or Prediction
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#FBBF24]">+50</span>
                            </div>

                            {/* Post to FlipLINE */}
                            <div
                              onClick={() => {
                                setIsFullBoardOpen(false);
                                router.push("/MainModules/FlipLine");
                              }}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">⚡</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Post to FlipLINE
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#38BDF8]">+10</span>
                            </div>

                            {/* Invite a friend */}
                            <div
                              onClick={handleShareBrief}
                              className="rounded-xl p-3 bg-[#0e1220] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#151a2e] transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-[15px]">🤝</span>
                                <span className="text-[12.5px] font-bold text-gray-200">
                                  Invite a friend
                                </span>
                              </div>
                              <span className="text-[11.5px] font-black text-[#FBBF24]">+50</span>
                            </div>
                          </div>
                        </div>

                        {/* FRIENDS THIS WEEK (Leaderboard) */}
                        <div className="space-y-2 pt-2">
                          <span className="text-[10.5px] font-black uppercase tracking-wider text-gray-400">
                            FRIENDS THIS WEEK
                          </span>

                          <div className="space-y-2">
                            {LEADERBOARD_FRIENDS.map((friend) => (
                              <div
                                key={friend.rank}
                                className={`rounded-xl p-3 flex items-center justify-between transition-all ${
                                  friend.isCurrent
                                    ? "bg-[#1f0d26] border-2 border-[#EC4899] shadow-[0_0_15px_rgba(236,72,153,0.25)]"
                                    : "bg-[#0e1220] border border-white/10 hover:bg-[#14182b]"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-[13px] font-black text-[#FBBF24] w-5">
                                    #{friend.rank}
                                  </span>
                                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[15px]">
                                    {friend.isCurrent ? "👤" : "🧑"}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[13px] font-extrabold text-white">
                                        {friend.name}
                                      </span>
                                      <span className="text-[9px] font-semibold text-gray-400">
                                        {friend.role}
                                      </span>
                                    </div>
                                    <span className="text-[10.5px] font-medium text-amber-400 flex items-center gap-1">
                                      <Flame size={10} className="fill-amber-400" />
                                      {friend.streak}d streak
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 font-black text-[13px] text-[#FBBF24]">
                                  <Zap size={13} className="fill-[#FBBF24]" />
                                  <span>{friend.isCurrent ? userSxp + 25 : friend.sxp}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom CTA Challenge button */}
                        <button
                          type="button"
                          onClick={handleShareBrief}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#EC4899]/20 via-[#F43F5E]/20 to-[#EC4899]/20 border border-[#EC4899] hover:bg-[#EC4899]/30 text-[#EC4899] hover:text-white font-extrabold text-[13px] transition-all cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.2)] flex items-center justify-center gap-2"
                        >
                          <span>🏆</span>
                          <span>Challenge a Friend to Beat Your Score</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ─────────────────────────────────────────────────────────────────────────
          ARENA ENGAGEMENT CREATION MODAL (Polls, Battles, Quizzes, Predictions)
      ───────────────────────────────────────────────────────────────────────── */}
      <ArenaEngagementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialType={createInitialType}
        onToast={(msg) => showToast(msg)}
        onSaved={() => {
          showToast("🎉 Created successfully! +50 SXP earned!");
          setUserSxp((prev) => prev + 50);
        }}
      />

      {/* ─────────────────────────────────────────────────────────────────────────
          CARD DETAIL QUICK-VIEW MODAL (When tapping an individual event)
      ───────────────────────────────────────────────────────────────────────── */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedCardDetail && (
              <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
                <div className="absolute inset-0" onClick={() => setSelectedCardDetail(null)} />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="relative w-full max-w-md rounded-2xl bg-[#101423] border border-white/15 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col z-10"
                >
                  {/* Header */}
                  <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#151b2e] flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="text-[24px] shrink-0">{selectedCardDetail.icon || "🏆"}</span>
                      <div className="min-w-0">
                        <h4 className="text-[15px] font-black text-white truncate">
                          {selectedCardDetail.sport}
                        </h4>
                        <p className="text-[11.5px] text-gray-300 font-medium truncate">
                          {"subEvent" in selectedCardDetail
                            ? selectedCardDetail.subEvent
                            : selectedCardDetail.event}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCardDetail(null)}
                      className="w-8 h-8 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    {selectedCardDetail.venue && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-300">
                        <MapPin size={14} className="text-cyan-400 shrink-0" />
                        <span>{selectedCardDetail.venue}</span>
                      </div>
                    )}
                    {selectedCardDetail.time && (
                      <div className="flex items-center gap-2 text-[12px] text-gray-300">
                        <Clock size={14} className="text-amber-400 shrink-0" />
                        <span>Scheduled: {selectedCardDetail.time}</span>
                      </div>
                    )}

                    {selectedCardDetail.teams && (
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1.5">
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
                    )}

                    {selectedCardDetail.detail && (
                      <p className="text-[12.5px] text-gray-300/90 leading-relaxed">
                        {selectedCardDetail.detail}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-3.5 border-t border-white/10 bg-[#0c0f1a] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardDetail(null);
                        openFullModal("schedule");
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white font-extrabold text-[12.5px] text-center cursor-pointer hover:opacity-95 transition-all"
                    >
                      View Full Schedule
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        setSelectedCardDetail(null);
                        handleOpenCreate("prediction", e);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-[#F59E0B]/70 text-[#F59E0B] hover:bg-[#F59E0B]/15 font-extrabold text-[12.5px] transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    >
                      <span>✨ Create</span>
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

// Export named aliases for backward-compatibility
export { FlipBOARD as WelcomeMessage };