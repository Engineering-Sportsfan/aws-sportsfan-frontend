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
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
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
  // Optional CTA Links
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
  const clean = dateStr.trim().split("T")[0].replace(/\//g, "-");
  return clean === todayIST;
}

/**
 * Formats event date & time for FlipBOARD display:
 * - If start and end are provided: displays range (e.g. "08:00 AM – 11:30 AM" or "09 Oct · 08:00 AM – 11:30 AM").
 * - If only start is provided: shows time if today (e.g. "08:00 AM") or date + time (e.g. "09 Oct · 08:00 AM").
 */
export function formatEventDisplayDateTime(
  dateStr?: string,
  timeStr?: string,
  now: Date = new Date(),
  endDateStr?: string,
  endTimeStr?: string
): string {
  const cleanStartTime = (timeStr || "").trim();
  const cleanStartDate = (dateStr || "").trim();
  const cleanEndTime = (endTimeStr || "").trim();
  const cleanEndDate = (endDateStr || "").trim();

  // Helper to format a single date (e.g. "Today" or "09 Oct")
  const formatDatePart = (dStr: string) => {
    if (!dStr || isTodayInIndia(dStr, now)) return "Today";
    try {
      const normalizedDate = dStr.includes("T") ? dStr.split("T")[0] : dStr;
      const parts = normalizedDate.split(/[-/]/);
      if (parts.length === 3) {
        let year = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10) - 1;
        let day = parseInt(parts[2], 10);
        if (parts[0].length <= 2 && parts[2].length === 4) {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          year = parseInt(parts[2], 10);
        }
        const parsedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
        return new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          month: "short",
          day: "numeric",
        }).format(parsedDate);
      }
    } catch {}
    return dStr;
  };

  const formattedStartDate = formatDatePart(cleanStartDate);
  const isStartToday = formattedStartDate === "Today";

  // Case 1: Has end date and/or end time
  if (cleanEndTime || (cleanEndDate && cleanEndDate !== cleanStartDate)) {
    const formattedEndDate = cleanEndDate ? formatDatePart(cleanEndDate) : formattedStartDate;
    const isMultiDay = cleanEndDate && cleanEndDate !== cleanStartDate && formattedEndDate !== formattedStartDate;

    if (isMultiDay) {
      const startDisplay = cleanStartTime ? `${formattedStartDate}, ${cleanStartTime}` : formattedStartDate;
      const endDisplay = cleanEndTime ? `${formattedEndDate}, ${cleanEndTime}` : formattedEndDate;
      return `${startDisplay} – ${endDisplay}`;
    }

    // Same day start and end
    const timeRange = cleanStartTime && cleanEndTime ? `${cleanStartTime} – ${cleanEndTime}` : (cleanStartTime || cleanEndTime);
    if (isStartToday) {
      return timeRange || "Today";
    }
    return `${formattedStartDate} · ${timeRange}`;
  }

  // Case 2: Only start date/time (default/classic)
  if (isStartToday) {
    return cleanStartTime || "Today";
  }
  return cleanStartTime ? `${formattedStartDate} · ${cleanStartTime}` : formattedStartDate;
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
 * Parses event date & time strings into a unified UTC epoch timestamp (milliseconds).
 * Uses India Standard Time (IST, UTC+5:30) as the reference baseline.
 */
export function parseEventDateTimeToTimestamp(
  dateStr?: string,
  timeStr?: string,
  now: Date = new Date()
): number {
  const nowISTString = getIndiaDateString(now);
  let cleanDate = (dateStr || "").trim();
  if (!cleanDate) {
    cleanDate = nowISTString;
  }

  if (cleanDate.includes("T")) {
    const parsedIso = new Date(cleanDate).getTime();
    if (!isNaN(parsedIso) && parsedIso > 0) {
      return parsedIso;
    }
  }

  let year = 0;
  let month = 0;
  let day = 0;

  const ymdMatch = cleanDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    year = parseInt(ymdMatch[1], 10);
    month = parseInt(ymdMatch[2], 10);
    day = parseInt(ymdMatch[3], 10);
  } else {
    const dmyMatch = cleanDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      day = parseInt(dmyMatch[1], 10);
      month = parseInt(dmyMatch[2], 10);
      year = parseInt(dmyMatch[3], 10);
    } else {
      const todayParts = nowISTString.split("-");
      year = parseInt(todayParts[0], 10);
      month = parseInt(todayParts[1], 10);
      day = parseInt(todayParts[2], 10);
    }
  }

  const timeMinutes = parseTimeToMinutes(timeStr);
  let hours = 0;
  let minutes = 0;
  if (timeMinutes >= 0) {
    hours = Math.floor(timeMinutes / 60);
    minutes = timeMinutes % 60;
  }

  // India Standard Time (IST, UTC+5:30)
  const utcOffsetMs = (5 * 60 + 30) * 60 * 1000;
  return Date.UTC(year, month - 1, day, hours, minutes, 0, 0) - utcOffsetMs;
}

/**
 * Dynamically resolves agenda event statuses based on current clock time and admin overrides:
 * - Incorporates start date/time and optional end date/time.
 * - When in auto mode:
 *   - Before start: UP NEXT (within 45 mins) or SCHEDULED.
 *   - Between start and end: LIVE.
 *   - After end: COMPLETED.
 * - 24-Hour Expiration Filter:
 *   - If the event has finished and more than 24 hours have passed, it is filtered out and NOT shown on frontend.
 */
export function resolveDynamicAgendaEvents(
  events: AgendaEventItem[],
  now = new Date(),
  filterExpired24h = true
): AgendaEventItem[] {
  if (!events || events.length === 0) return [];

  const nowMs = now.getTime();
  const MATCH_DURATION_MS = 2.5 * 60 * 60 * 1000; // 2.5 hours active live window fallback
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  // Attach parsed start and end timestamps and admin flags
  const parsedEvents = events.map((evt, idx) => {
    const rawStatus = (evt.statusType || "").toLowerCase().trim();
    const rawLabel = (evt.statusLabel || "").toUpperCase().trim();
    const isAutoMode = rawStatus === "auto" || evt.statusMode === "auto" || rawLabel === "AUTO";
    const isExplicitCompleted = rawStatus === "completed" || rawStatus === "finished" || rawLabel === "COMPLETED" || rawLabel === "FINISHED";
    const isExplicitLive = rawStatus === "live" || rawLabel === "LIVE";
    const isExplicitUpNext = rawStatus === "up_next" || rawLabel === "UP NEXT";
    const isExplicitScheduled = rawStatus === "scheduled" || rawLabel === "SCHEDULED";
    
    // Explicit manual override if marked manual OR if explicit status is set without being auto mode
    const isManual = evt.isManual === true || evt.statusMode === "manual" || (!isAutoMode && (isExplicitCompleted || isExplicitLive || isExplicitUpNext));

    const startDateStr = evt.startDate || evt.date;
    const startTimeStr = evt.startTime || evt.time;
    const startTimestamp = parseEventDateTimeToTimestamp(startDateStr, startTimeStr, now);

    // Calculate endTimestamp
    let endTimestamp: number;
    const hasCustomEnd = Boolean(evt.endDate || evt.endTime);
    if (hasCustomEnd) {
      const effectiveEndDate = evt.endDate || startDateStr;
      const effectiveEndTime = evt.endTime || (evt.endDate && evt.endDate !== startDateStr ? "11:59 PM" : startTimeStr);
      let parsedEnd = parseEventDateTimeToTimestamp(effectiveEndDate, effectiveEndTime, now);
      // If end time is earlier than start time on the same date, assume it ends next day
      if (parsedEnd <= startTimestamp && effectiveEndDate === startDateStr) {
        parsedEnd += 24 * 60 * 60 * 1000;
      }
      endTimestamp = parsedEnd;
    } else {
      endTimestamp = startTimestamp + MATCH_DURATION_MS;
    }

    return {
      evt,
      idx,
      startTimestamp,
      endTimestamp,
      order: evt.order ?? idx,
      isAutoMode,
      isExplicitCompleted,
      isExplicitLive,
      isExplicitUpNext,
      isExplicitScheduled,
      isManual,
    };
  });

  // Chronological sort: by start timestamp, then order, then index
  parsedEvents.sort((a, b) => {
    if (a.startTimestamp !== b.startTimestamp) {
      return a.startTimestamp - b.startTimestamp;
    }
    if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
      return a.order - b.order;
    }
    return a.idx - b.idx;
  });

  // Determine dynamic statuses and 24-hour expiration for all items
  const resolved: {
    event: AgendaEventItem;
    isFinished: boolean;
    finishedTimestamp: number;
    isOver24hFinished: boolean;
  }[] = parsedEvents.map((item, index) => {
    const orig = item.evt;

    // 1. Explicit admin "completed" status strictly takes precedence
    if (item.isExplicitCompleted) {
      const isFinished = true;
      const finishedTimestamp = item.endTimestamp <= nowMs ? item.endTimestamp : nowMs;
      const isOver24hFinished = nowMs - finishedTimestamp > TWENTY_FOUR_HOURS_MS;

      return {
        event: {
          ...orig,
          statusType: "completed",
          statusMode: item.isManual ? "manual" : undefined,
          isManual: item.isManual,
          statusLabel: orig.statusLabel && orig.statusLabel.toUpperCase() === "COMPLETED" ? "COMPLETED" : "FINISHED",
          nodeColor: "gray",
        },
        isFinished,
        finishedTimestamp,
        isOver24hFinished,
      };
    }

    // 2. If end date & time has passed, mark as FINISHED on frontend
    if (nowMs >= item.endTimestamp) {
      const isFinished = true;
      const finishedTimestamp = item.endTimestamp;
      const isOver24hFinished = nowMs - finishedTimestamp > TWENTY_FOUR_HOURS_MS;

      return {
        event: {
          ...orig,
          statusType: "completed",
          statusLabel: "FINISHED",
          nodeColor: "gray",
        },
        isFinished,
        finishedTimestamp,
        isOver24hFinished,
      };
    }

    // 3. Explicit admin "live" status strictly takes precedence (when not past end time)
    if (item.isExplicitLive && item.isManual) {
      return {
        event: {
          ...orig,
          statusType: "live",
          statusMode: "manual",
          isManual: true,
          statusLabel: "LIVE",
          nodeColor: "emerald",
        },
        isFinished: false,
        finishedTimestamp: item.endTimestamp,
        isOver24hFinished: false,
      };
    }

    // 4. Explicit admin "up_next"
    if (item.isExplicitUpNext && item.isManual) {
      return {
        event: {
          ...orig,
          statusType: "up_next",
          statusMode: "manual",
          isManual: true,
          statusLabel: "UP NEXT",
          nodeColor: "amber",
        },
        isFinished: false,
        finishedTimestamp: item.endTimestamp,
        isOver24hFinished: false,
      };
    }

    // 5. Explicit admin "scheduled" status in manual mode
    if (item.isExplicitScheduled && item.isManual && !item.isAutoMode) {
      return {
        event: {
          ...orig,
          statusType: "scheduled",
          statusMode: "manual",
          isManual: true,
          statusLabel: orig.statusLabel || orig.time || "SCHEDULED",
          nodeColor: "blue",
        },
        isFinished: false,
        finishedTimestamp: item.endTimestamp,
        isOver24hFinished: false,
      };
    }

    // 6. Dynamic Auto Time Resolution:
    let computedStatusType: "completed" | "live" | "up_next" | "scheduled" = "scheduled";
    let computedLabel = "SCHEDULED";
    let computedNodeColor: "gray" | "emerald" | "amber" | "blue" = "blue";
    let isFinished = false;

    if (nowMs < item.startTimestamp) {
      const timeToStart = item.startTimestamp - nowMs;
      const isUpNext = timeToStart <= 45 * 60 * 1000;
      computedStatusType = isUpNext ? "up_next" : "scheduled";
      computedLabel = isUpNext ? "UP NEXT" : (orig.time || "SCHEDULED");
      computedNodeColor = isUpNext ? "amber" : "blue";
      isFinished = false;
    } else if (nowMs >= item.startTimestamp && nowMs < item.endTimestamp) {
      computedStatusType = "live";
      computedLabel = "LIVE";
      computedNodeColor = "emerald";
      isFinished = false;
    } else {
      computedStatusType = "completed";
      computedLabel = "FINISHED";
      computedNodeColor = "gray";
      isFinished = true;
    }

    const finishedTimestamp = item.endTimestamp;
    const isOver24hFinished = isFinished && (nowMs - finishedTimestamp > TWENTY_FOUR_HOURS_MS);

    return {
      event: {
        ...orig,
        statusType: computedStatusType,
        statusLabel: computedLabel,
        nodeColor: computedNodeColor,
        isManual: false,
        statusMode: item.isAutoMode ? "auto" : undefined,
      },
      isFinished,
      finishedTimestamp,
      isOver24hFinished,
    };
  });

  // Filter out events that finished > 24 hours ago if filterExpired24h is enabled
  const filtered = filterExpired24h
    ? resolved.filter((r) => !r.isOver24hFinished)
    : resolved;

  return filtered.map((r) => r.event);
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
  // Optional dynamic CTA fields
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
