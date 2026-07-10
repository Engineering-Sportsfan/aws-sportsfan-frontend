export interface PlayerStats {
  runs: string;
  sr: string;
  avg: string;
}

export interface PlayerOverview {
  captain: string;
  coach: string;
  owner: string;
  venue: string;
}

export interface SeasonStats {
  year: string;
  runs: string;
  losses: string;
  wins: string;
  points: string;
  position: string;
  matchesPlayed: string;
  netRunRate: string;
  highestTotal: string;
  lowestTotal: string;
  strikeRate: string;
  average: string;
  fifties: number;
  hundreds: number;
  highestScore: string;
  fours: number;
  sixes: number;
  award: string;
  awardSub: string;
}

export interface CareerInsight {
  title: string;
  description: string;
}

export interface MediaItem {
  title: string;
  views: string;
  time: string;
  thumbnail: string;
}

export interface ClubProfile {
  name: string;
  team: string;
  battingStyle: string;
  bowlingStyle: string;
  avatar: string;
  about: string;
  stats: PlayerStats;
  overview: PlayerOverview;
  season: SeasonStats;
  insights: CareerInsight[];
  strengths: string[];
  media: MediaItem[];
}