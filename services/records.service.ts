/**
 * Records API service.
 * Calls the NestJS backend /records endpoints.
 */
import { api } from './api';

export interface RecordEntry {
  type: 'National' | 'Olympic' | 'World';
  performance: string;
  athlete: string;
  date: string;
  venue: string;
  championship: string;
  color: string;
  numericValue: number;
}

export interface TrendEntry {
  year: string;
  national: number;
  world: number;
  olympic: number;
}

export interface ProgressEntry {
  year: string;
  gap: number;
  color: string;
}

export interface MilestoneEntry {
  year: string;
  title: string;
  description: string;
  color: string;
}

export interface ProgressData {
  gapData: ProgressEntry[];
  milestones: MilestoneEntry[];
}

export interface RecordInsight {
  diff: number;
  percentage: string;
  formattedDiff: string;
  unit: string;
  gapReductionPercent: string;
  /** Confirmed World Athletics live ranking, or 'N/A' */
  globalRank: string;
  trendDirection: string;
  baselineYear: string;
}

export interface StoryEntry {
  id: string;
  title: string;
  description: string;
  gradient: string;
  publishedDate: string;
  author: string;
  location: string;
  content: string[];
  keyStats: { value: string; label: string; color: string }[];
  quote: string;
  quoteAuthor: string;
}

const recordsService = {
  /** GET /records?event=&category= */
  getRecords: (event: string, category: string) =>
    api.get<RecordEntry[]>(
      `/records?event=${encodeURIComponent(event)}&category=${encodeURIComponent(category)}`,
    ),

  /** GET /records/insight?event=&category= */
  getInsight: (event: string, category: string) =>
    api.get<RecordInsight | null>(
      `/records/insight?event=${encodeURIComponent(event)}&category=${encodeURIComponent(category)}`,
    ),

  /** GET /records/trends?event= */
  getTrends: (event: string) =>
    api.get<TrendEntry[]>(`/records/trends?event=${encodeURIComponent(event)}`),

  /** GET /records/progress?event= */
  getProgress: (event: string) =>
    api.get<ProgressData>(`/records/progress?event=${encodeURIComponent(event)}`),

  /** GET /records/stories */
  getStories: () => api.get<StoryEntry[]>('/records/stories'),
};

export default recordsService;
