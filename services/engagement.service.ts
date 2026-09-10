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
  userId?: string;
}

// In-flight deduplication and short-lived caching to prevent duplicate network calls
const inFlightRequests = new Map<string, Promise<EngagementItem[]>>();
const cachedEngagements = new Map<string, { data: EngagementItem[]; timestamp: number }>();
const CACHE_TTL_MS = 4000; // 4-second cache

export const engagementService = {
  /**
   * Invalidate in-memory cache
   */
  invalidateCache: () => {
    cachedEngagements.clear();
  },

  /**
   * Fetch engagements feed list with optional filters
   */
  getEngagements: async (params: GetEngagementsParams = {}): Promise<EngagementItem[]> => {
    const queryParams = new URLSearchParams();
    if (params.type && params.type !== "all") queryParams.append("type", params.type);
    if (params.sport && params.sport !== "all" && params.sport !== "mixed") queryParams.append("sport", params.sport);
    if (params.status && params.status !== "all") queryParams.append("status", params.status);
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.userId) queryParams.append("userId", params.userId);

    const queryString = queryParams.toString();
    const url = `/api/engagements${queryString ? `?${queryString}` : ""}`;

    // 1. Check in-memory cache
    const cached = cachedEngagements.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // 2. Check if identical request is already in-flight
    const existingPromise = inFlightRequests.get(url);
    if (existingPromise) {
      return existingPromise;
    }

    // 3. Initiate request with deduplication
    const fetchPromise = (async () => {
      try {
        const res = await axios.get<EngagementsListResponse>(url);
        const list = res.data?.engagements || [];
        cachedEngagements.set(url, { data: list, timestamp: Date.now() });
        return list;
      } catch (error) {
        console.error("engagementService.getEngagements error:", error);
        return [];
      } finally {
        inFlightRequests.delete(url);
      }
    })();

    inFlightRequests.set(url, fetchPromise);
    return fetchPromise;
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
    userId?: string,
    questionId?: string
  ): Promise<T> => {
    const res = await axios.post<T>(
      `/api/engagements/${encodeURIComponent(id)}/vote`,
      {
        selectedOptionId,
        userId,
        ...(questionId ? { questionId } : {}),
      }
    );
    cachedEngagements.clear();
    return res.data;
  },

  /**
   * Check if current user has already voted / attempted an engagement
   */
  checkVoteStatus: async (
    id: string,
    userId?: string
  ): Promise<{ hasVoted: boolean; selectedOptionId: string | null; vote?: any }> => {
    try {
      const url = `/api/engagements/${encodeURIComponent(id)}/vote${
        userId ? `?userId=${encodeURIComponent(userId)}` : ""
      }`;
      const res = await axios.get<{ hasVoted: boolean; selectedOptionId: string | null; vote?: any }>(url);
      return {
        hasVoted: Boolean(res.data?.hasVoted),
        selectedOptionId: res.data?.selectedOptionId || null,
        vote: res.data?.vote,
      };
    } catch {
      return { hasVoted: false, selectedOptionId: null };
    }
  },

  /**
   * Toggle like / unlike on an engagement
   */
  toggleLikeEngagement: async (id: string, userId?: string): Promise<LikeResponse> => {
    const res = await axios.post<LikeResponse>(
      `/api/engagements/${encodeURIComponent(id)}/like`,
      { userId }
    );
    cachedEngagements.clear();
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
