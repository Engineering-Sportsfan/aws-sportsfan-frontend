import axios from "axios";

export interface RadarCardItem {
  id: string;
  sport: string;
  event: string;
  round: string;
  status: "LIVE" | string;
  isLive?: boolean;
  icon: string;
  iconBg?: string;
  themeColor?: "emerald" | "purple" | "amber" | "cyan" | "rose";
  venue?: string;
  time?: string;
  subEvent?: string;
  detail?: string;
  statusType?: "auto" | "completed" | "live" | "up_next" | "scheduled" | "afternoon" | "evening" | string;
  statusMode?: "auto" | "manual";
  isManual?: boolean;
  statusLabel?: string;
  nodeColor?: "gray" | "emerald" | "amber" | "blue" | string;
  teams?: {
    teamA: string;
    teamB?: string;
    scoreA?: string;
    scoreB?: string;
  };
  summary?: string;
  order?: number;
  date?: string;
  active?: boolean;
}

export interface AgendaEventItem {
  id: string;
  date?: string;
  time: string;
  sport: string;
  subEvent: string;
  detail: string;
  statusType: "auto" | "completed" | "live" | "up_next" | "scheduled" | "afternoon" | "evening" | string;
  statusMode?: "auto" | "manual";
  isManual?: boolean;
  statusLabel: string;
  icon: string;
  nodeColor?: "gray" | "emerald" | "amber" | "blue" | string;
  themeColor?: "emerald" | "purple" | "amber" | "cyan" | "rose";
  venue?: string;
  teams?: {
    teamA: string;
    teamB?: string;
    scoreA?: string;
    scoreB?: string;
  };
  summary?: string;
  order?: number;
  active?: boolean;
  // Optional Dynamic Action CTAs
  predictId?: string;
  predictTitle?: string;
  predictUrl?: string;
  discussPostId?: string;
  discussTitle?: string;
  discussUrl?: string;
  debateRoomId?: string;
  debateTitle?: string;
  debateUrl?: string;
}

/**
 * Returns current date string in India Standard Time (IST, UTC+5:30) in "YYYY-MM-DD" format.
 */
export function getIndiaDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Returns current time string in India Standard Time (IST, UTC+5:30) in "hh:mm AM/PM" format.
 */
export function getIndiaTimeString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Checks if a given date string (YYYY-MM-DD) matches today's date in India Standard Time.
 */
export function isTodayInIndia(dateStr?: string, now: Date = new Date()): boolean {
  if (!dateStr || !dateStr.trim()) return true;
  const todayIST = getIndiaDateString(now);
  return dateStr.trim() === todayIST;
}

/**
 * Formats event date & time for FlipBOARD display:
 * - If the date is today in IST (or unspecified): shows only time (e.g. "08:00 AM").
 * - If the date is not today: shows date and time (e.g. "09 Oct · 08:00 AM").
 */
export function formatEventDisplayDateTime(
  dateStr?: string,
  timeStr?: string,
  now: Date = new Date()
): string {
  const cleanTime = (timeStr || "").trim();
  const cleanDate = (dateStr || "").trim();

  if (!cleanDate || isTodayInIndia(cleanDate, now)) {
    return cleanTime || "Today";
  }

  try {
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const parsedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "numeric",
      }).format(parsedDate);

      if (cleanTime) {
        return `${formattedDate} · ${cleanTime}`;
      }
      return formattedDate;
    }
  } catch (err) {
    console.warn("Error formatting event date:", err);
  }

  return cleanTime ? `${cleanDate} · ${cleanTime}` : cleanDate;
}

/**
 * Parses a time string like "08:00 AM", "2:30 PM", "14:00" into minutes from midnight (0 to 1439).
 */
export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return -1;
  const clean = timeStr.trim().toUpperCase();

  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!ampmMatch) {
    const looseMatch = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/);
    if (looseMatch) {
      let hours = parseInt(looseMatch[1], 10);
      const minutes = looseMatch[2] ? parseInt(looseMatch[2], 10) : 0;
      const period = looseMatch[3];
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    return -1;
  }

  let hours = parseInt(ampmMatch[1], 10);
  const minutes = parseInt(ampmMatch[2], 10);
  const period = ampmMatch[3];

  if (period === "PM" && hours < 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Dynamically resolves agenda event statuses based on current clock time and admin overrides:
 * - Manual mode / Explicit overrides:
 *   - If admin set "completed": strictly remains COMPLETED (never overwritten by clock auto-update).
 *   - If admin set "live": strictly remains LIVE.
 *   - If admin set "up_next": strictly remains UP NEXT.
 *   - If admin set "scheduled": strictly remains SCHEDULED.
 * - Auto mode (time-based):
 *   - Before event start time: UP NEXT (for first upcoming) or SCHEDULED.
 *   - At start time (time <= now): automatically transitions to LIVE.
 *   - When next event starts: previous event automatically transitions to COMPLETED.
 */
export function resolveDynamicAgendaEvents(events: AgendaEventItem[], now = new Date()): AgendaEventItem[] {
  if (!events || events.length === 0) return [];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Attach parsed time and explicit admin status flags
  const parsedEvents = events.map((evt, idx) => {
    const rawStatus = (evt.statusType || "").toLowerCase().trim();
    const rawLabel = (evt.statusLabel || "").toUpperCase().trim();
    const isAutoMode = rawStatus === "auto" || evt.statusMode === "auto" || rawLabel === "AUTO";
    const isExplicitCompleted = rawStatus === "completed" || rawLabel === "COMPLETED";
    const isExplicitLive = rawStatus === "live" || rawLabel === "LIVE";
    const isExplicitUpNext = rawStatus === "up_next" || rawLabel === "UP NEXT";
    const isExplicitScheduled = rawStatus === "scheduled" || rawLabel === "SCHEDULED";
    
    // Explicit manual override if marked manual OR if explicit status is set without being auto mode
    const isManual = evt.isManual === true || evt.statusMode === "manual" || (!isAutoMode && (isExplicitCompleted || isExplicitLive || isExplicitUpNext));

    return {
      evt,
      idx,
      minutes: parseTimeToMinutes(evt.time),
      order: evt.order ?? idx,
      isAutoMode,
      isExplicitCompleted,
      isExplicitLive,
      isExplicitUpNext,
      isExplicitScheduled,
      isManual,
    };
  });

  // Preserve order or chronological time sort
  parsedEvents.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
      return a.order - b.order;
    }
    if (a.minutes >= 0 && b.minutes >= 0 && a.minutes !== b.minutes) {
      return a.minutes - b.minutes;
    }
    return a.idx - b.idx;
  });

  // Step 1: Check if there's an explicit manual LIVE event set by admin
  let manualLiveIndex = -1;
  for (let i = 0; i < parsedEvents.length; i++) {
    if (parsedEvents[i].isExplicitLive && parsedEvents[i].isManual) {
      manualLiveIndex = i;
      break;
    }
  }

  // Step 2: Find the latest chronological event whose scheduled start time has arrived (minutes <= currentMinutes)
  let lastPastIndex = -1;
  for (let i = 0; i < parsedEvents.length; i++) {
    const item = parsedEvents[i];
    if (item.minutes >= 0 && item.minutes <= currentMinutes) {
      lastPastIndex = i;
    }
  }

  // Step 3: Determine the active live index and upcoming index
  let activeLiveIndex = -1;
  let activeUpcomingIndex = -1;

  if (manualLiveIndex !== -1) {
    // Admin manually forced an event to LIVE
    activeLiveIndex = manualLiveIndex;
    activeUpcomingIndex = manualLiveIndex + 1 < parsedEvents.length ? manualLiveIndex + 1 : -1;
  } else if (lastPastIndex !== -1) {
    // There are events that have reached or passed their start time
    const latestPastItem = parsedEvents[lastPastIndex];
    if (latestPastItem.isExplicitCompleted && latestPastItem.isManual) {
      // The latest past event was manually marked COMPLETED by admin.
      // So no event is currently live from past events.
      activeLiveIndex = -1;
      activeUpcomingIndex = lastPastIndex + 1 < parsedEvents.length ? lastPastIndex + 1 : -1;
    } else {
      // Latest past event is live (auto progression or manual live)
      activeLiveIndex = lastPastIndex;
      activeUpcomingIndex = lastPastIndex + 1 < parsedEvents.length ? lastPastIndex + 1 : -1;
    }
  } else {
    // Current time is BEFORE the first event of the day
    activeLiveIndex = -1;
    activeUpcomingIndex = 0; // First event is UP NEXT
  }

  return parsedEvents.map((item, index) => {
    const orig = item.evt;

    // 1. Explicit admin "completed" status strictly takes precedence (never overwritten by auto)
    if (item.isExplicitCompleted && item.isManual) {
      return {
        ...orig,
        statusType: "completed",
        statusMode: "manual",
        isManual: true,
        statusLabel: orig.statusLabel && orig.statusLabel.toUpperCase() === "COMPLETED" ? orig.statusLabel : "COMPLETED",
        nodeColor: "gray",
      };
    }

    // 2. Explicit admin "live" status strictly takes precedence
    if (item.isExplicitLive && item.isManual) {
      return {
        ...orig,
        statusType: "live",
        statusMode: "manual",
        isManual: true,
        statusLabel: "LIVE",
        nodeColor: "emerald",
      };
    }

    // 3. Explicit admin "up_next" status takes precedence
    if (item.isExplicitUpNext && item.isManual) {
      return {
        ...orig,
        statusType: "up_next",
        statusMode: "manual",
        isManual: true,
        statusLabel: "UP NEXT",
        nodeColor: "amber",
      };
    }

    // 4. Explicit admin "scheduled" status in manual mode
    if (item.isExplicitScheduled && item.isManual && !item.isAutoMode) {
      return {
        ...orig,
        statusType: "scheduled",
        statusMode: "manual",
        isManual: true,
        statusLabel: orig.statusLabel || orig.time || "SCHEDULED",
        nodeColor: "blue",
      };
    }

    // 5. Dynamic Auto Time Resolution:
    let computedStatusType: "completed" | "live" | "up_next" | "scheduled" = "scheduled";
    let computedLabel = "SCHEDULED";
    let computedNodeColor: "gray" | "emerald" | "amber" | "blue" = "blue";

    if (activeLiveIndex !== -1) {
      // There is an ongoing live event
      if (index < activeLiveIndex) {
        computedStatusType = "completed";
        computedLabel = "COMPLETED";
        computedNodeColor = "gray";
      } else if (index === activeLiveIndex) {
        computedStatusType = "live";
        computedLabel = "LIVE";
        computedNodeColor = "emerald";
      } else if (index === activeUpcomingIndex) {
        computedStatusType = "up_next";
        computedLabel = "UP NEXT";
        computedNodeColor = "amber";
      } else {
        computedStatusType = "scheduled";
        computedLabel = orig.time || "SCHEDULED";
        computedNodeColor = "blue";
      }
    } else {
      // No event is currently LIVE
      if (activeUpcomingIndex !== -1 && index === activeUpcomingIndex) {
        computedStatusType = "up_next";
        computedLabel = "UP NEXT";
        computedNodeColor = "amber";
      } else if (activeUpcomingIndex !== -1 && index < activeUpcomingIndex) {
        computedStatusType = "completed";
        computedLabel = "COMPLETED";
        computedNodeColor = "gray";
      } else if (activeUpcomingIndex === -1) {
        // All events have passed and are completed
        computedStatusType = "completed";
        computedLabel = "COMPLETED";
        computedNodeColor = "gray";
      } else {
        computedStatusType = "scheduled";
        computedLabel = orig.time || "SCHEDULED";
        computedNodeColor = "blue";
      }
    }

    return {
      ...orig,
      statusType: computedStatusType,
      statusLabel: computedLabel,
      nodeColor: computedNodeColor,
      isManual: false,
      statusMode: item.isAutoMode ? "auto" : undefined,
    };
  });
}

export interface MorningBriefStory {
  id: string | number;
  storyNumber?: number;
  title: string;
  description: string;
  sport: string;
  icon: string;
  date?: string;
  time?: string;
  order?: number;
  active?: boolean;
  // Dynamic Action CTAs (Admin configured)
  predictId?: string;
  predictTitle?: string;
  predictUrl?: string;
  discussPostId?: string;
  discussTitle?: string;
  discussUrl?: string;
  debateRoomId?: string;
  debateTitle?: string;
  debateUrl?: string;
}

export interface WelcomeConfig {
  id?: string;
  actionSubtitle?: string;
  agendaDateTitle?: string;
  briefTitle?: string;
  briefSubtitle?: string;
}

export interface WelcomeMessageDataResponse {
  config: WelcomeConfig;
  morningBrief: MorningBriefStory[];
  todaysAgenda: AgendaEventItem[];
  radarCards: RadarCardItem[];
}

/**
 * Cleans AI responses to ensure prompt templates, echoed questions, or headers are stripped
 */
export function cleanAiResponse(rawAnswer: string, question?: string): string {
  if (!rawAnswer) return "";
  let clean = rawAnswer.trim();

  // Strip echoed prompt framing (Context / Question / Answer blocks)
  clean = clean.replace(/^(?:Information Context|Context moment|Sports Data Context|Context|Sports Schedule)[:\s\S]*?(?:User Question|Question about this moment|Fan Question|Question)[:\s\S]*?(?:Direct Answer|Answer|Insight)[:\s-]*/i, "");
  clean = clean.replace(/^(?:User Question|Fan Question|Question|Q)[:\s\S]*?(?:Direct Answer|Answer|A|Response)[:\s-]*/i, "");

  // Strip leading question labels
  clean = clean.replace(/^(?:\*{1,3})?(?:Question|Fan Question|Q)[:\s*#]+[^\n]+\n+/i, "");

  // Strip leading headers like "Answer:", "Direct Answer:", "Response:", "Flip Insight:", etc.
  clean = clean.replace(/^(?:\*{1,3})?(?:Direct Answer|Answer|Response|Flip Insight|AI Insight|Flip Story Insight|Flip Analysis|Summary)[:\s*#]+/i, "");

  // Strip echoed question at the beginning of the answer if present
  if (question) {
    const trimmedQ = question.trim().replace(/[?!.,]+$/, "");
    if (trimmedQ.length > 2) {
      const escapedQ = trimmedQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const qRegex = new RegExp(`^(?:(?:Regarding|About|On|For|In response to)?\\s*["'“‘]?${escapedQ}[?!.,"'”’]*\\s*[-–—:]*\\s*)`, "i");
      clean = clean.replace(qRegex, "");
    }

    // Strip generic "Flip Insight on "..." :" patterns
    clean = clean.replace(/^💡?\s*\*{0,2}Flip (?:Story )?Insight (?:on|for) ["'“‘]?[^"'\n]+["'”’]?:?\*{0,2}\s*/i, "");
  }

  // Strip filler phrases like "Based on today's schedule," or "According to the sports brief,"
  clean = clean.replace(/^(?:Based on (?:today's|the provided|the) (?:schedule|brief|data|stories|context),?\s*)/i, "");
  clean = clean.replace(/^(?:According to (?:today's|the provided|the) (?:schedule|brief|data|stories|context),?\s*)/i, "");

  // Final trim of leading punctuation / colons / dashes
  clean = clean.replace(/^[:\-–—\s*]+/, "").trim();

  return clean;
}

export const welcomeMessageService = {
  async getWelcomeData(): Promise<WelcomeMessageDataResponse | null> {
    try {
      const res = await axios.get(`/api/welcomemessage?_t=${Date.now()}`, {
        timeout: 8000,
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });

      if (res.data?.success && res.data?.data) {
        return res.data.data as WelcomeMessageDataResponse;
      }
      return null;
    } catch (error) {
      console.warn("[welcomeMessageService] Error fetching welcome message data:", error);
      return null;
    }
  },

  async getMorningBriefStories(): Promise<MorningBriefStory[]> {
    try {
      const res = await axios.get(`/api/welcomemessage?type=morning_brief&_t=${Date.now()}`, {
        timeout: 6000,
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (res.data?.success && Array.isArray(res.data?.items)) {
        return res.data.items;
      }
      return [];
    } catch {
      return [];
    }
  },

  async getTodaysAgendaEvents(): Promise<AgendaEventItem[]> {
    try {
      const res = await axios.get(`/api/welcomemessage?type=todays_agenda&_t=${Date.now()}`, {
        timeout: 6000,
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (res.data?.success && Array.isArray(res.data?.items)) {
        return res.data.items;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Ask Flip AI for WelcomeMessage Agenda or Morning Brief
   * Matches the FlipLine AI querying mechanism using /api/ask-ai
   */
  async askFlipAI(question: string, context?: string): Promise<string> {
    try {
      const cleanQ = question.trim();
      const promptQuery = context
        ? `Context moment: "${context}". Question about this moment: "${cleanQ}". Answer this question in a short, engaging sports fan format under 200 characters.`
        : `Question: "${cleanQ}". Answer this question in a short, engaging sports fan format under 200 characters.`;

      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: promptQuery,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const ans = data.answer || data.response || data.message;
        if (ans && typeof ans === "string") {
          return cleanAiResponse(ans, cleanQ);
        }
      }
      return "";
    } catch (err) {
      console.warn("[welcomeMessageService] Ask Flip AI API error:", err);
      return "";
    }
  },
};
