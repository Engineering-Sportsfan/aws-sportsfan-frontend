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
  statusType?: "completed" | "live" | "up_next" | "scheduled" | "afternoon" | "evening" | string;
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
  active?: boolean;
}

export interface AgendaEventItem {
  id: string;
  time: string;
  sport: string;
  subEvent: string;
  detail: string;
  statusType: "completed" | "live" | "up_next" | "scheduled" | "afternoon" | "evening" | string;
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
 * Dynamically resolves agenda event statuses based on current clock time:
 * - If an event's start time is past and another event has started after it, it becomes "completed".
 * - The current ongoing event (start time <= current time and next has not started) becomes "live".
 * - The very next upcoming event (start time > current time) becomes "up_next".
 * - Subsequent events become "scheduled".
 */
export function resolveDynamicAgendaEvents(events: AgendaEventItem[], now = new Date()): AgendaEventItem[] {
  if (!events || events.length === 0) return [];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Attach parsed time for chronological evaluation
  const eventsWithTime = events.map((evt, idx) => ({
    evt,
    idx,
    minutes: parseTimeToMinutes(evt.time),
  }));

  const validTimes = eventsWithTime.filter((e) => e.minutes >= 0);
  if (validTimes.length === 0) {
    return events.map((evt) => {
      const raw = (evt.statusType || "").toLowerCase();
      const norm =
        raw === "afternoon" || raw === "evening"
          ? "scheduled"
          : (raw as "completed" | "live" | "up_next" | "scheduled") || "live";
      return {
        ...evt,
        statusType: norm,
        statusLabel:
          evt.statusLabel && evt.statusLabel !== "AFTERNOON"
            ? evt.statusLabel
            : norm === "completed"
            ? "COMPLETED"
            : norm === "up_next"
            ? "UP NEXT"
            : norm === "scheduled"
            ? "SCHEDULED"
            : "LIVE",
        nodeColor:
          evt.nodeColor ||
          (norm === "completed"
            ? "gray"
            : norm === "live"
            ? "emerald"
            : norm === "up_next"
            ? "amber"
            : "blue"),
      };
    });
  }

  // Sort chronologically by time
  eventsWithTime.sort((a, b) => {
    if (a.minutes >= 0 && b.minutes >= 0) return a.minutes - b.minutes;
    return (a.evt.order ?? a.idx) - (b.evt.order ?? b.idx);
  });

  // Find index of the latest event that has already started (minutes <= currentMinutes)
  let liveIndex = -1;
  for (let i = 0; i < eventsWithTime.length; i++) {
    const item = eventsWithTime[i];
    if (item.minutes >= 0 && item.minutes <= currentMinutes) {
      liveIndex = i;
    } else if (item.minutes > currentMinutes) {
      break;
    }
  }

  return eventsWithTime.map((item, index) => {
    const orig = item.evt;
    let computedStatusType: "completed" | "live" | "up_next" | "scheduled" = "scheduled";
    let computedLabel = "SCHEDULED";
    let computedNodeColor: "gray" | "emerald" | "amber" | "blue" = "blue";

    if (liveIndex === -1) {
      // All events are in the future today
      if (index === 0) {
        computedStatusType = "up_next";
        computedLabel = "UP NEXT";
        computedNodeColor = "amber";
      } else {
        computedStatusType = "scheduled";
        computedLabel = "SCHEDULED";
        computedNodeColor = "blue";
      }
    } else if (index < liveIndex) {
      // An earlier event whose next event has started -> COMPLETED
      computedStatusType = "completed";
      computedLabel = "COMPLETED";
      computedNodeColor = "gray";
    } else if (index === liveIndex) {
      // Current active event -> LIVE
      computedStatusType = "live";
      computedLabel = "LIVE";
      computedNodeColor = "emerald";
    } else if (index === liveIndex + 1) {
      // Very next event -> UP NEXT
      computedStatusType = "up_next";
      computedLabel = "UP NEXT";
      computedNodeColor = "amber";
    } else {
      // Subsequent events -> SCHEDULED
      computedStatusType = "scheduled";
      computedLabel = "SCHEDULED";
      computedNodeColor = "blue";
    }

    return {
      ...orig,
      statusType: computedStatusType,
      statusLabel: computedLabel,
      nodeColor: computedNodeColor,
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
  order?: number;
  active?: boolean;
}

export interface WelcomeConfig {
  id?: string;
  actionSubtitle?: string;
  agendaDateTitle?: string;
  briefSubtitle?: string;
}

export interface WelcomeMessageDataResponse {
  config: WelcomeConfig;
  morningBrief: MorningBriefStory[];
  todaysAgenda: AgendaEventItem[];
  radarCards: RadarCardItem[];
}

export const welcomeMessageService = {
  async getWelcomeData(): Promise<WelcomeMessageDataResponse | null> {
    try {
      const res = await axios.get("/api/welcomemessage", {
        timeout: 8000,
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
      const res = await axios.get("/api/welcomemessage?type=morning_brief", { timeout: 6000 });
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
      const res = await axios.get("/api/welcomemessage?type=todays_agenda", { timeout: 6000 });
      if (res.data?.success && Array.isArray(res.data?.items)) {
        return res.data.items;
      }
      return [];
    } catch {
      return [];
    }
  },
};
