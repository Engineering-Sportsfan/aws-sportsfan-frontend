import axios from "axios";
import {
  EngagementItem,
  EngagementsListResponse,
  VoteResponse,
  LikeResponse,
  ShareResponse,
  EngagementType,
} from "@/types/engagements";

export interface GetEngagementsParams {
  type?: EngagementType | "all" | string;
  sport?: string;
  status?: string;
  limit?: number;
}

export const engagementService = {
  /**
   * Fetch engagements feed list with optional filters
   */
  getEngagements: async (params: GetEngagementsParams = {}): Promise<EngagementItem[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.type && params.type !== "all") queryParams.append("type", params.type);
      if (params.sport && params.sport !== "all" && params.sport !== "mixed") queryParams.append("sport", params.sport);
      if (params.status && params.status !== "all") queryParams.append("status", params.status);
      if (params.limit) queryParams.append("limit", String(params.limit));

      const queryString = queryParams.toString();
      const url = `/api/engagements${queryString ? `?${queryString}` : ""}`;
      
      const res = await axios.get<EngagementsListResponse>(url);
      return res.data?.engagements || [];
    } catch (error) {
      console.error("engagementService.getEngagements error:", error);
      return [];
    }
  },

  /**
   * Fetch single engagement item by ID
   */
  getEngagementById: async (id: string): Promise<EngagementItem | null> => {
    try {
      const res = await axios.get<{ success: boolean; engagement?: EngagementItem }>(
        `/api/engagements/${encodeURIComponent(id)}`
      );
      return res.data?.engagement || null;
    } catch (error) {
      console.error(`engagementService.getEngagementById (${id}) error:`, error);
      return null;
    }
  },

  /**
   * Submit vote, quiz answer, or prediction stake for an engagement item
   */
  voteEngagement: async <T = VoteResponse>(
    id: string,
    selectedOptionId: string,
    userId?: string
  ): Promise<T> => {
    const res = await axios.post<T>(
      `/api/engagements/${encodeURIComponent(id)}/vote`,
      {
        selectedOptionId,
        userId,
      }
    );
    return res.data;
  },

  /**
   * Toggle like / unlike on an engagement
   */
  toggleLikeEngagement: async (id: string, userId?: string): Promise<LikeResponse> => {
    const res = await axios.post<LikeResponse>(
      `/api/engagements/${encodeURIComponent(id)}/like`,
      { userId }
    );
    return res.data;
  },

  /**
   * Check if current user has liked an engagement
   */
  checkLikeStatus: async (id: string, userId?: string): Promise<boolean> => {
    try {
      const url = `/api/engagements/${encodeURIComponent(id)}/like${
        userId ? `?userId=${encodeURIComponent(userId)}` : ""
      }`;
      const res = await axios.get<{ liked: boolean }>(url);
      return Boolean(res.data?.liked);
    } catch {
      return false;
    }
  },

  /**
   * Increment share count on an engagement
   */
  shareEngagement: async (id: string): Promise<ShareResponse> => {
    const res = await axios.post<ShareResponse>(
      `/api/engagements/${encodeURIComponent(id)}/share`
    );
    return res.data;
  },
};
