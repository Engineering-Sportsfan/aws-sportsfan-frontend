// ── Athlete Profile Types ──────────────────────────────────────────────────

export interface AthleteMedal {
  title: string;
  year?: string;
  icon?: string;
  color?: string;
  text?: string;
  category?: string;
  medal?: string;
  event?: string;
}

export interface AthleteSeasonStats {
  events?: number | string;
  gold?: number | string;
  silver?: number | string;
  bronze?: number | string;
  seasonBest?: string;
  averageThrow?: string;
  currentStreak?: string;
  year?: string;
}

export interface AthletePerformanceTrend {
  year: string;
  distance?: number;
  Runs?: number;
  Wickets?: number;
  value?: number;
  [key: string]: any;
}

export interface BattingStats {
  matches?: number | string;
  runs?: number | string;
  avg?: number | string;
  average?: number | string;
  sr?: number | string;
  strikeRate?: number | string;
  hs?: number | string;
  highestScore?: number | string;
  hundreds?: number;
  fifties?: number;
  [key: string]: any;
}

export interface BowlingStats {
  matches?: number | string;
  wickets?: number | string;
  avg?: number | string;
  average?: number | string;
  econ?: number | string;
  economy?: number | string;
  bbi?: string;
  bestBowling?: string;
  fiveW?: number;
  fiveWHauls?: number;
  [key: string]: any;
}

export interface AthleteCoreInfo {
  playerId?: string;
  athleteId?: string;
  name?: string;
  country?: string;
  nationality?: string;
  flag?: string;
  role?: string;
  sportId?: string;
  sport?: string;
  discipline?: string;
  club?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  dateOfBirth?: string;
  dob?: string;
  age?: number | string;
  birthPlace?: string;
  birthplace?: string;
  heightCm?: number | string;
  height?: string;
  weightKg?: number | string;
  weight?: string;
  profileImage?: string;
  coverImage?: string;
  isCaptain?: boolean;
  testCaps?: number | string;
  gender?: string;
  coachName?: string;
  coach?: string;
  debutDate?: string;
  jerseyNo?: number | string;
  firstOlympicGames?: string;
  bio?: string;
  about?: string;
  welcomeVideoUrl?: string;
  welcomeMessage?: string;
  format?: string;
  currentClubId?: string;
  captain?: string;
  yearsActiveSince?: string | number;
  hand?: string;
  preferredFoot?: string;
  [key: string]: any;
}

export interface AthleteProfile {
  // Core identity
  entityId?: string;
  sk?: string;
  athleteId?: string;
  playerId?: string;
  name?: string;
  sport?: string;
  sportId?: string;
  country?: string;
  nationality?: string;
  countryCode?: string;
  flag?: string;
  profileImage?: string;
  coverImage?: string;
  isVerified?: boolean;
  worldRank?: number | string;
  fanCount?: string;
  fanImpactScore?: number;
  fanImpactChange?: number;
  format?: string;
  role?: string;
  gender?: string;
  currentClubId?: string;

  // Bio / welcome message / video
  bio?: string;
  about?: string;
  welcomeMessage?: string;
  welcomeVideoUrl?: string;
  welcomeVideoThumbnail?: string;
  welcomeVideoQuote?: string;

  // Quick facts & sports attributes
  age?: number | string;
  dateOfBirth?: string;
  dob?: string;
  height?: string;
  heightCm?: number | string;
  weight?: string;
  weightKg?: number | string;
  birthPlace?: string;
  birthplace?: string;
  coachName?: string;
  coach?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  debutDate?: string;
  jerseyNo?: number | string;
  testCaps?: number | string;
  isCaptain?: boolean;
  firstOlympicGames?: string;
  hand?: string;
  preferredFoot?: string;
  captain?: string;

  // Nested structures
  coreInfo?: AthleteCoreInfo;
  performance?: {
    primaryEvent?: string;
    category?: string;
    stats?: Record<string, any>;
    medalCabinet?: AthleteMedal[];
    [key: string]: any;
  };
  record_highlight?: {
    progressData?: Array<{ year: string; value: number }>;
    benchmarks?: Array<any>;
    [key: string]: any;
  };
  analytics?: {
    sport?: string;
    battingStats?: BattingStats;
    bowlingStats?: BowlingStats;
    stats?: Record<string, any>;
    seasonalData?: Array<{ year: string; value: number }>;
    medalData?: any;
    heroStat?: string;
    afterCoach?: string;
    [key: string]: any;
  };

  // Season & Trends
  season?: AthleteSeasonStats;
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
  [key: string]: any;
}

// ── API Helper ─────────────────────────────────────────────────────────────

/**
 * Fetch a single athlete profile by slug / athleteProfileId.
 */
export async function getAthleteProfile(
  athleteProfileId: string,
  isClub?: boolean
): Promise<AthleteProfile> {
  const cleanId = athleteProfileId.replace(/^(PLAYER|ATHLETE|CLUB)#/, "");
  let useTeam =
    isClub ||
    athleteProfileId.startsWith("CLUB#") ||
    athleteProfileId.toUpperCase() === athleteProfileId;

  let url = useTeam
    ? `/api/ms_teams/${cleanId}`
    : `/api/athleteProfile/${cleanId}`;

  let res = await fetch(url, { cache: "no-store" });

  // Fallback 1: if not found, try ms_players endpoint for players
  if (!res.ok && res.status === 404 && !useTeam) {
    url = `/api/ms_players/${cleanId}`;
    res = await fetch(url, { cache: "no-store" });
  }

  // Fallback 2: if still not found, try ms_teams
  if (!res.ok && res.status === 404 && !useTeam) {
    url = `/api/ms_teams/${cleanId}`;
    res = await fetch(url, { cache: "no-store" });
    if (res.ok) useTeam = true;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body?.message ?? `Failed to fetch athlete profile (${res.status})`
    );
  }

  const data = await res.json();

  if (useTeam) {
    const team = data.team ?? data ?? {};
    const record = data.record_highlight ?? {};
    const analytics = data.analytics ?? {};

    return {
      entityId: team.entityId ?? `CLUB#${cleanId}`,
      sk: team.sk ?? "CLUB#META",
      athleteId: cleanId,
      name: team.clubName ?? team.shortName ?? "Team",
      sport: team.sportId ?? team.sport ?? "cricket",
      sportId: team.sportId ?? "cricket",
      welcomeVideoUrl: team.welcomeVideoUrl ?? undefined,
      profileImage: team.logoUrl ?? null,
      coverImage: team.teamPhotoUrl ?? null,
      bio: team.bio ?? null,

      coreInfo: {
        name: team.clubName ?? team.shortName ?? "Team",
        country: team.country ?? null,
        flag: team.flag ?? null,
        role: "Club / Team",
        captain: team.captain ?? "–",
        coach: team.headCoach ?? "–",
        coachName: team.headCoach ?? "–",
        birthplace: team.homeGround ?? "–",
        birthPlace: team.homeGround ?? "–",
        yearsActiveSince: team.founded ?? "–",
        profileImage: team.logoUrl ?? null,
        coverImage: team.teamPhotoUrl ?? null,
        bio: team.bio ?? null,
      },

      headToHeadData:
        team.headToHeadData ??
        data.stints?.find((s: any) => s.sk?.endsWith("#STATS"))?.headToHeadData ??
        [],

      record_highlight: record,
      analytics: analytics,
    } as any;
  }

  const safeJson = (val: any, fallback: any = null) => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === "object") return val;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return fallback !== null ? fallback : val;
      }
    }
    return val;
  };

  if (data && typeof data === "object") {
    if (data.medalData) data.medalData = safeJson(data.medalData, data.medalData);
    if (data.stats) data.stats = safeJson(data.stats, data.stats);
    if (data.seasonalData) data.seasonalData = safeJson(data.seasonalData, data.seasonalData);
    if (data.consistencyData) data.consistencyData = safeJson(data.consistencyData, data.consistencyData);
    if (data.currentSeason) data.currentSeason = safeJson(data.currentSeason, data.currentSeason);
    if (data.analytics && typeof data.analytics === "object") {
      if (data.analytics.medalData) data.analytics.medalData = safeJson(data.analytics.medalData, data.analytics.medalData);
      if (data.analytics.stats) data.analytics.stats = safeJson(data.analytics.stats, data.analytics.stats);
      if (data.analytics.seasonalData) data.analytics.seasonalData = safeJson(data.analytics.seasonalData, data.analytics.seasonalData);
      if (data.analytics.consistencyData) data.analytics.consistencyData = safeJson(data.analytics.consistencyData, data.analytics.consistencyData);
    }
    if (data.performance && typeof data.performance === "object") {
      if (data.performance.medalData) data.performance.medalData = safeJson(data.performance.medalData, data.performance.medalData);
      if (data.performance.stats) data.performance.stats = safeJson(data.performance.stats, data.performance.stats);
      if (data.performance.currentSeason) data.performance.currentSeason = safeJson(data.performance.currentSeason, data.performance.currentSeason);
    }

    const rawMedal =
      data.medalData ??
      data.analytics?.medalData ??
      (data.analytics?.consistencyData && !Array.isArray(data.analytics.consistencyData) ? (data.analytics.consistencyData as any).medalData : null) ??
      (data.consistencyData && !Array.isArray(data.consistencyData) ? (data.consistencyData as any).medalData : null) ??
      data.performance?.medalData;

    if (rawMedal) {
      const parsed = safeJson(rawMedal, rawMedal);
      data.medalData = parsed;
      if (data.analytics && typeof data.analytics === "object") {
        data.analytics.medalData = parsed;
      }
    }
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