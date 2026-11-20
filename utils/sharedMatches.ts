import axios from "axios";

export interface SharedMatchItem {
  id: string;
  match_id?: string;
  team1?: any;
  team2?: any;
  tournament?: string;
  format?: string;
  isLive?: boolean;
  date?: string;
  start_date?: string;
  [key: string]: any;
}

const MATCHES_TTL_MS = 60 * 1000; // 60 seconds memory cache
let matchesCache: { at: number; rows: SharedMatchItem[] } | null = null;
let matchesInflight: Promise<SharedMatchItem[]> | null = null;

/**
 * Returns the matches list with deduplication: concurrent requests share
 * the exact same in-flight Promise, and results are cached for 60 seconds
 * to prevent duplicate full-table queries across mounting components.
 */
export function getSharedMatches(): Promise<SharedMatchItem[]> {
  if (matchesCache && Date.now() - matchesCache.at < MATCHES_TTL_MS) {
    return Promise.resolve(matchesCache.rows);
  }

  if (matchesInflight) {
    return matchesInflight;
  }

  matchesInflight = axios
    .get("/api/matches", { timeout: 15000 })
    .then((res) => {
      const d = res.data;
      const rows: SharedMatchItem[] = d?.data || d?.matches || (Array.isArray(d) ? d : []);
      matchesCache = { at: Date.now(), rows };
      return rows;
    })
    .catch((err) => {
      if (matchesCache) return matchesCache.rows;
      return [];
    })
    .finally(() => {
      matchesInflight = null;
    });

  return matchesInflight;
}
