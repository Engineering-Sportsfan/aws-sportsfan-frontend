export interface PlayerStats {
  runs: string;
  sr: string;
  avg: string;
}

export interface PlayerOverview {
  debut: string;
  specialization: string;
  dob: string;
  matches: string;
}

export interface SeasonStats {
  year: string;
  runs: string;
  strikeRate: string;
  average: string;
  highestScore: string;
  fours: number;
  sixes: number;
  award: string;
  awardSub: string;
  wickets: number;
  bowlingAvg: string;
  economy: string;
  bowlingSR: string;
  bestBowling: string;
  threeW_fiveW_Hauls: number;
  fiftiesAndHundreds: string;
  foursConceded: number;
  sixesConceded: number;
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

export interface Player {
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