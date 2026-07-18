import { api } from "@/services/api";
import type { Match, MatchPrediction, MatchIntelligenceData } from "@/types/match";

/**
 * Match service — live scores, predictions, match intelligence.
 */
export const matchService = {
  /** Get live matches */
  getLive: () => api.get<Match[]>("/matches/live"),

  /** Get upcoming matches */
  getUpcoming: (limit = 10) => api.get<Match[]>(`/matches/upcoming?limit=${limit}`),

  /** Get a single match by ID */
  getById: (id: string) => api.get<Match>(`/matches/${id}`),

  /** Get match intelligence data (stats, formations, heatmaps) */
  getIntelligence: (id: string) => api.get<MatchIntelligenceData>(`/matches/${id}/intelligence`),

  /** Get predictions for a match */
  getPredictions: (id: string) => api.get<MatchPrediction>(`/matches/${id}/predictions`),

  /** Submit a user prediction */
  submitPrediction: (id: string, payload: { winnerId: string; scoreHome: number; scoreAway: number }) =>
    api.post(`/matches/${id}/predictions`, payload),
};
