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
  themeColor: "emerald" | "purple" | "amber" | "cyan" | "rose";
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

export interface AgendaEventItem {
  id: string;
  time: string;
  sport: string;
  subEvent: string;
  detail: string;
  statusType: "live" | "up_next" | "afternoon" | "evening";
  statusLabel: string;
  icon: string;
  nodeColor: "emerald" | "amber" | "blue";
  venue?: string;
  order?: number;
  active?: boolean;
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
