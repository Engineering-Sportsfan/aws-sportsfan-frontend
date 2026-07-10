// types/wplPlayer.ts

export interface WPLPlayer {
  id?: string;
  player_name: string;
  player_id: string;
  tournament: "womens_ipl";
  gender: "female" | string;
  format: string;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  batting_dismissals: number;
  batting_average: number;
  wickets: number;
  runs_conceded: number;
  balls_bowled: number;
  overs: number;
  economy: number;
  bowling_average: number;
  jersey_no: number | null;
  created_at?: { _seconds: number; _nanoseconds: number };
  updated_at?: { _seconds: number; _nanoseconds: number };
}

// ─── API helper ───────────────────────────────────────────────────────────────

const BASE_URL = "/api/player-stats";

export interface WPLPlayerListResponse {
  success: boolean;
  data: WPLPlayer[];
  nextCursor?: string;
  pageSize?: number;
}

/**
 * Fetch WPL (womens_ipl) players with optional pagination.
 */
export async function fetchWPLPlayers(
  cursor?: string,
  pageSize = 20
): Promise<WPLPlayerListResponse> {
  const params = new URLSearchParams({ tournament: "womens_ipl", pageSize: String(pageSize) });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch WPL players: ${res.status}`);
  return res.json() as Promise<WPLPlayerListResponse>;
}

/**
 * Fetch a single WPL player by player_id.
 */
export async function fetchWPLPlayerById(playerId: string): Promise<WPLPlayer | null> {
  const res = await fetch(`${BASE_URL}?tournament=womens_ipl&player_id=${encodeURIComponent(playerId)}`);
  if (!res.ok) return null;
  const json = (await res.json()) as WPLPlayerListResponse;
  return json.data?.[0] ?? null;
}