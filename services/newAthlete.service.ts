// ── Athlete Profile Types ──────────────────────────────────────────────────

export interface AthleteMedal {
  title: string;
  year: string;
  icon: string;
  color: string;
  text: string;
}

export interface AthleteSeasonStats {
  events: number;
  gold: number;
  silver: number;
  bronze: number;
  seasonBest: string;
  averageThrow: string;
  currentStreak: string;
}

export interface AthletePerformanceTrend {
  year: string;
  distance: number;
}

export interface AthleteProfile {
  // Core identity
  entityId: string;
  sk: string;
  athleteId: string;
  name: string;
  sport: string;
  country: string;
  countryCode?: string;
  profileImage?: string;
  coverImage?: string;
  isVerified?: boolean;
  worldRank?: number;
  fanCount?: string;
  fanImpactScore?: number;
  fanImpactChange?: number;

  // Bio / welcome message
  bio?: string;
  welcomeMessage?: string;
  welcomeVideoUrl?: string;
  welcomeVideoThumbnail?: string;
  welcomeVideoQuote?: string;

  // Quick Facts
  age?: number;
  height?: string;
  weight?: string;
  birthplace?: string;
  hand?: string;
  coach?: string;

  // Season
  season?: AthleteSeasonStats;

  // Performance trend
  performanceTrend?: AthletePerformanceTrend[];

  // Achievements / medals
  achievements?: string[];
  medals?: AthleteMedal[];

  // Athlete Hub counts
  vodCount?: number;
  amsCount?: number;
  bookingCount?: number;
  storeCount?: number;
  auctionCount?: number;
}

// ── API Helper ─────────────────────────────────────────────────────────────

/**
 * Fetch a single athlete profile by slug / athleteProfileId.
 * The frontend next.config.ts rewrites /api/athleteProfile/:id to the backend.
 */
export async function getAthleteProfile(
  athleteProfileId: string
): Promise<AthleteProfile> {
  const url = `/api/athleteProfile/${athleteProfileId}`;
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body?.message ?? `Failed to fetch athlete profile (${res.status})`
    );
  }

  return res.json() as Promise<AthleteProfile>;
}