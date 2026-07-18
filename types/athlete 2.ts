export interface Athlete {
  id: string;
  name: string;
  sport: string;
  team: string;
  nationality: string;
  position: string;
  age: number;
  imageUrl: string;
  bio: string;
  isFollowed?: boolean;
}

export interface AthleteStats {
  athleteId: string;
  season: string;
  matches: number;
  goals?: number;
  assists?: number;
  rating: number;
  // Add sport-specific fields as needed
  [key: string]: unknown;
}

export interface AthleteHighlight {
  id: string;
  athleteId: string;
  type: "video" | "article" | "audio";
  title: string;
  thumbnailUrl: string;
  url: string;
  publishedAt: string;
}
