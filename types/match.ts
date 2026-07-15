export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  sport: string;
  league: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: "upcoming" | "live" | "completed";
  startTime: string;
  venue: string;
  sport: string;
  league: string;
}

export interface MatchPrediction {
  matchId: string;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  predictedScore: { home: number; away: number };
  keyInsights: string[];
}

export interface MatchIntelligenceData {
  matchId: string;
  formations: {
    home: string;
    away: string;
  };
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  keyPlayers: Array<{ athleteId: string; name: string; rating: number }>;
}
