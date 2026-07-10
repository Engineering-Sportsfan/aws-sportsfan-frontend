// types/fifaClub.ts

export interface FifaClub {
  club_id: string;                 // FIFA 3-letter code e.g. "BRA"
  country: string;                 // Full country name e.g. "Brazil"
  fifa_rank: number;               // Current FIFA world ranking
  world_cup_apps: number;          // Total World Cup appearances
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;               // GF
  goals_against: number;           // GA
  goal_difference: number;         // GD
  head_coach_2026: string | null;
  captain_2026: string | null;
  all_time_best_finish: string | null;
  tournament: "FIFA World Cup" | "FIFA Women's World Cup";
  gender: "male" | "female";
  format: "international";
  // Live tournament fields (populated during WC 2026)
  wc2026_match_day?: number;
  last_ingested_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  source_file?: string | null;
}