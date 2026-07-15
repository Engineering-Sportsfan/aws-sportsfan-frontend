import { api } from "@/services/api";
import type { Athlete, AthleteStats, AthleteHighlight } from "@/types/athlete";

/**
 * Athlete service — all athlete-related API calls.
 */
export const athleteService = {
  /** Get an athlete by ID */
  getById: (id: string) => api.get<Athlete>(`/athletes/${id}`),

  /** Get athlete profile by slug (used by AthleteProfile page) */
  getBySlug: (slug: string) => api.get<any>(`/athletes/${slug}`),

  /** Get all athletes (with optional search query) */
  getAll: (query?: string) =>
    api.get<Athlete[]>(`/athletes${query ? `?search=${encodeURIComponent(query)}` : ""}`),

  /** Get athlete career stats */
  getStats: (id: string) => api.get<AthleteStats>(`/athletes/${id}/stats`),

  /** Get athlete highlights (career highlight cards) */
  getHighlights: (id: string) => api.get<AthleteHighlight[]>(`/athletes/${id}/highlights`),

  /** Get athlete posts */
  getPosts: (slug: string) => api.get<any[]>(`/athletes/${slug}/posts`),

  /** Get athlete videos */
  getVideos: (slug: string) => api.get<any[]>(`/athletes/${slug}/videos`),

  /** Get athlete drops (exclusive content) */
  getDrops: (slug: string) => api.get<any[]>(`/athletes/${slug}/drops`),

  /** Follow / unfollow an athlete */
  follow: (id: string) => api.post(`/athletes/${id}/follow`),
  unfollow: (id: string) => api.delete(`/athletes/${id}/follow`),
};
