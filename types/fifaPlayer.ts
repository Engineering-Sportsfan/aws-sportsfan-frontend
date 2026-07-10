// types/fifaPlayer.ts

export interface FifaPlayer {
    id: string;
    player_id: string;
    player_name: string;
    team: string;
    position: "GK" | "DF" | "MF" | "FW";
    matches_played: number;
    minutes_played: number;
    goals: number;
    assists: number;
    shots: number;
    shots_on_target: number;
    shot_conversion_pct: number;
    xg: number;         // expected goals
    xa: number;         // expected assists
    dribbles_completed: number;
    key_passes: number;
    chances_created: number;
    big_chances_created: number;
    tournament: string; // e.g. "mens_fifa_wc_2022"
    gender: string;
    format: string;     // e.g. "international"
    season: number;     // e.g. 2022
    source_file?: string;
    created_at?: { _seconds: number; _nanoseconds: number };
    updated_at?: { _seconds: number; _nanoseconds: number };
}