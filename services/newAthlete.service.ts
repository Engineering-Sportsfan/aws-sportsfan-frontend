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
  headToHeadData?: Array<{
    opponent: string;
    played: number;
    won?: number;
    drawn?: number;
    lost?: number;
    lastResult?: string;
    lastMet?: string;
  }>;
}

// ── API Helper ─────────────────────────────────────────────────────────────

/**
 * Fetch a single athlete profile by slug / athleteProfileId.
 * The frontend next.config.ts rewrites /api/athleteProfile/:id to the backend.
 */
export async function getAthleteProfile(
  athleteProfileId: string,
  isClub?: boolean
): Promise<AthleteProfile> {
  let useTeam = isClub || athleteProfileId.startsWith("CLUB#") || athleteProfileId.toUpperCase() === athleteProfileId;
  
  let url = useTeam 
    ? `/api/ms_teams/${athleteProfileId}` 
    : `/api/ms_players/${athleteProfileId}`;
    
  let res = await fetch(url, { cache: "no-store" });
  
  // Fallback if not found and we didn't initially try team
  if (!res.ok && res.status === 404 && !useTeam) {
    url = `/api/ms_teams/${athleteProfileId}`;
    res = await fetch(url, { cache: "no-store" });
    useTeam = true;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body?.message ?? `Failed to fetch athlete profile (${res.status})`
    );
  }

  const data = await res.json();

  if (useTeam) {
    const team = data.team ?? {};
    const record = data.record_highlight ?? {};
    const analytics = data.analytics ?? {};
    
    return {
      entityId: team.entityId ?? `CLUB#${athleteProfileId}`,
      sk: team.sk ?? "CLUB#META",
      sportId: team.sportId ?? "cricket",
      welcomeVideoUrl: team.welcomeVideoUrl ?? undefined,
      
      coreInfo: {
        name: team.clubName ?? team.shortName ?? "Team",
        country: team.country ?? null,
        flag: team.flag ?? null,
        role: "Club / Team",
        captain: team.captain ?? "–",
        coach: team.headCoach ?? "–",
        birthplace: team.homeGround ?? "–",
        yearsActiveSince: team.founded ?? "–",
        profileImage: team.logoUrl ?? null,
        coverImage: team.teamPhotoUrl ?? null,
        bio: team.bio ?? null,
      },
      
      headToHeadData: team.headToHeadData ?? data.stints?.find((s: any) => s.sk?.endsWith("#STATS"))?.headToHeadData ?? [],
      
      record_highlight: record,
      analytics: analytics,
    } as any;
  }

  return data as AthleteProfile;
}

// ── Athlete List Item (for discovery/home page) ────────────────────────────

/**
 * Lightweight representation of an athlete as returned by GET /api/athleteProfile
 * (full DynamoDB item — nested coreInfo / performance / analytics shape)
 */
export interface AthleteListItem {
  entityId: string;
  sk: string;
  /** Extracted from entityId: ATHLETE#<id> → <id> */
  athleteId: string;
  // Flat top-level fields (some older items may store directly)
  name?: string;
  sport?: string;
  /** DynamoDB top-level sport identifier, e.g. "athletics", "badminton" */
  sportId?: string;
  country?: string;
  gender?: string;
  profileImage?: string;
  worldRank?: number | string;
  dob?: string;
  // Nested DynamoDB shape
  coreInfo?: {
    name?: string;
    country?: string;
    dob?: string;
    gender?: string;
    profileImage?: string;
    countryCode?: string;
  };
  performance?: {
    primaryEvent?: string;
    /** Sub-category within a sport, e.g. "Javelin Throw", "100m Sprint" */
    category?: string;
    stats?: { worldRank?: number | string };
  };
  analytics?: {
    sport?: string;
    stats?: { worldRank?: number | string };
  };
}

/** Shape returned by GET /api/athleteProfile */
interface GetAllAthletesResponse {
  athletes?: AthleteListItem[];
  players?: AthleteListItem[];
  count: number;
}

/**
 * Fetch all athlete profiles.
 * Maps the raw DynamoDB items so each item exposes a stable
 * `athleteId` field derived from its entityId.
 */
export async function getAllAthletes(): Promise<AthleteListItem[]> {
  const url = `/api/ms_players`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body?.message ?? `Failed to fetch athletes (${res.status})`
    );
  }

  const data: GetAllAthletesResponse = await res.json();
  const list = data.players ?? data.athletes ?? [];

  // Derive athleteId from entityId: "ATHLETE#<id>" or "PLAYER#<id>" → "<id>"
  // and map fields to expected format (sportId -> sport, dateOfBirth -> dob)
  return list.map((a) => ({
    ...a,
    athleteId: a.entityId?.replace(/^(ATHLETE|PLAYER)#/, "") ?? a.athleteId ?? (a as any).playerId ?? "",
    sport: a.sport ?? (a.sportId ? a.sportId.charAt(0).toUpperCase() + a.sportId.slice(1) : "") ?? "",
    dob: a.dob ?? (a as any).dateOfBirth ?? "",
  }));
}