// types/wt20Club.ts

export interface WT20Club {
  club_id: string;            // e.g. "AUS-W"
  country: string;            // e.g. "Australia"
  icc_ranking: number;
  rating_points: number;
  apps: number;               // WT20 WC appearances
  matches: number;
  won: number;
  lost: number;
  tied_so: number;            // Tied / Super Over
  no_result: number;          // NR
  win_pct: number;            // 0–1 decimal
  recent_form: string | null; // "W-W-W-L-W"
  current_captain: string | null;
  head_coach: string | null;
  featured_player: string | null;
  best_tournament_finish: string | null;
  tournament: "ICC Women's T20 World Cup";
  gender: "female";
  format: "international";
  created_at: unknown | null;
  updated_at: unknown | null;
  source_file: string | null;
}