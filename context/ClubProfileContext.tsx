// contexts/ClubProfileContext.tsx
"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
} from "react";
import axios from "axios";

/* ================= TYPES ================= */

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
    id?: string;
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
    createdAt?: number;
    updatedAt?: number;
}

// API Response types
interface SeasonDoc {
    id: string;
    clubProfileId: string;
    season: SeasonStats;
    createdAt: number;
    updatedAt: number;
}

interface InsightsDoc {
    id: string;
    clubProfileId: string;
    insights: CareerInsight[];
    strengths: string[];
    createdAt: number;
    updatedAt: number;
}

interface MediaDoc {
    id: string;
    clubProfileId: string;
    mediaItems: MediaItem[];
    createdAt: number;
    updatedAt: number;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

// Complete team data response from API
interface CompleteTeamData {
    id?: string;
    name: string;
    team: string;
    battingStyle: string;
    bowlingStyle: string;
    avatar: string;
    about: string;
    stats: PlayerStats;
    overview: PlayerOverview;
    seasons: SeasonStats[];
    insights: CareerInsight[];
    strengths: string[];
    media: MediaItem[];
    createdAt?: number;
    updatedAt?: number;
}

/* ================= CONTEXT TYPE ================= */

interface ClubProfileContextType {
    // State
    profiles: ClubProfile[];
    singleProfile: ClubProfile | null;
    seasons: SeasonStats[];
    insights: CareerInsight[];
    strengths: string[];
    mediaItems: MediaItem[];
    loading: boolean;
    error: string | null;
    pagination: {
        seasons: PaginationInfo | null;
        insights: PaginationInfo | null;
        media: PaginationInfo | null;
    };

    // Fetch methods
    fetchAllProfiles: () => Promise<void>;
    fetchProfileById: (id: string) => Promise<void>;
    fetchProfileByTeam: (team: string) => Promise<void>;
    fetchSeasons: (clubProfileId: string, year?: string, page?: number) => Promise<void>;
    fetchInsights: (clubProfileId: string, page?: number) => Promise<void>;
    fetchMedia: (clubProfileId: string, page?: number) => Promise<void>;
    fetchFullProfile: (teamName: string) => Promise<CompleteTeamData | null>;
}

/* ================= CONTEXT ================= */

const ClubProfileContext = createContext<ClubProfileContextType | undefined>(undefined);

/* ================= HOOK ================= */

export const useClubProfile = () => {
    const context = useContext(ClubProfileContext);
    if (!context) {
        throw new Error("useClubProfile must be used inside ClubProfileProvider");
    }
    return context;
};

/* ================= PROVIDER ================= */

export const ClubProfileProvider = ({ children }: { children: ReactNode }) => {
    const [profiles, setProfiles] = useState<ClubProfile[]>([]);
    const [singleProfile, setSingleProfile] = useState<ClubProfile | null>(null);
    const [seasons, setSeasons] = useState<SeasonStats[]>([]);
    const [insights, setInsights] = useState<CareerInsight[]>([]);
    const [strengths, setStrengths] = useState<string[]>([]);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<{
        seasons: PaginationInfo | null;
        insights: PaginationInfo | null;
        media: PaginationInfo | null;
    }>({
        seasons: null,
        insights: null,
        media: null,
    });

    const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "";

    /* ================= PROFILE APIS ================= */

    // Fetch all profiles
    const fetchAllProfiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_BASE_URL}/api/club-profile`);

            if (res.data.success) {
                setProfiles(res.data.profiles || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch profiles");
            console.error("Fetch profiles error:", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    // Fetch profile by ID
    const fetchProfileById = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_BASE_URL}/api/club-profile/${id}`);

            if (res.data.success) {
                setSingleProfile(res.data.profile);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch profile");
            console.error("Fetch profile error:", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    // Fetch profile by team name
    const fetchProfileByTeam = useCallback(async (team: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_BASE_URL}/api/club-profile?team=${encodeURIComponent(team)}`);

            if (res.data.success) {
                setSingleProfile(res.data.profile);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch profile");
            console.error("Fetch profile by team error:", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    /* ================= SEASON APIS ================= */

    const fetchSeasons = useCallback(async (clubProfileId: string, year?: string, page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            let url = `${API_BASE_URL}/api/club-profile/season?clubProfileId=${clubProfileId}&page=${page}&limit=10`;
            if (year) {
                url += `&year=${year}`;
            }

            const res = await axios.get(url);

            if (res.data.success) {
                const seasonsData = res.data.seasons.map((doc: SeasonDoc) => doc.season);
                setSeasons(seasonsData);
                setPagination(prev => ({
                    ...prev,
                    seasons: res.data.pagination,
                }));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch seasons");
            console.error("Fetch seasons error:", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    /* ================= INSIGHTS APIS ================= */

    const fetchInsights = useCallback(async (clubProfileId: string, page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.get(
                `${API_BASE_URL}/api/club-profile/insights?clubProfileId=${clubProfileId}&page=${page}&limit=10`
            );

            if (res.data.success && res.data.insightsDocs.length > 0) {
                const insightsData = res.data.insightsDocs[0];
                setInsights(insightsData.insights || []);
                setStrengths(insightsData.strengths || []);
                setPagination(prev => ({
                    ...prev,
                    insights: res.data.pagination,
                }));
            } else {
                // Reset if no data found
                setInsights([]);
                setStrengths([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch insights");
            console.error("Fetch insights error:", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    /* ================= MEDIA APIS ================= */

    const fetchMedia = useCallback(async (clubProfileId: string, page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.get(
                `${API_BASE_URL}/api/club-profile/media?clubProfileId=${clubProfileId}&page=${page}&limit=12`
            );

            if (res.data.success && res.data.mediaDocs.length > 0) {
                const mediaData = res.data.mediaDocs[0];
                setMediaItems(mediaData.mediaItems || []);
                setPagination(prev => ({
                    ...prev,
                    media: res.data.pagination,
                }));
            } else {
                // Reset if no data found
                setMediaItems([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch media");
            console.error("Fetch media error:", err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    /* ================= FULL PROFILE (All Data Joined) ================= */
// contexts/ClubProfileContext.tsx - Update the fetchFullProfile function

const fetchFullProfile = useCallback(async (teamName: string): Promise<CompleteTeamData | null> => {
    try {
        setLoading(true);
        setError(null);

        // USE RELATIVE URL - Don't use API_BASE_URL
        const res = await axios.get(
            `/api/club-profile/search?teamName=${encodeURIComponent(teamName)}`
        );
        
        console.log("Fetch full profile response:", res.data);
        
        if (res.data.success) {
            const teamData: CompleteTeamData = res.data.data;

            setSingleProfile({
                id: teamData.id,
                name: teamData.name,
                team: teamData.team,
                battingStyle: teamData.battingStyle,
                bowlingStyle: teamData.bowlingStyle,
                avatar: teamData.avatar,
                about: teamData.about,
                stats: teamData.stats,
                overview: teamData.overview,
                season: teamData.seasons?.[0] || {
                    year: "",
                    runs: "0",
                    losses: "0",
                    wins: "0",
                    points: "0",
                    position: "",
                    matchesPlayed: "0",
                    netRunRate: "0",
                    highestTotal: "",
                    lowestTotal: "",
                    strikeRate: "0",
                    average: "0",
                    fifties: 0,
                    hundreds: 0,
                    highestScore: "",
                    fours: 0,
                    sixes: 0,
                    award: "",
                    awardSub: "",
                },
                insights: teamData.insights || [],
                strengths: teamData.strengths || [],
                media: teamData.media || [],
                createdAt: teamData.createdAt,
                updatedAt: teamData.updatedAt,
            });

            setSeasons(teamData.seasons || []);
            setInsights(teamData.insights || []);
            setStrengths(teamData.strengths || []);
            setMediaItems(teamData.media || []);

            return teamData;
        } else {
            setError(res.data.message || "Failed to fetch team data");
            return null;
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch team data";
        setError(errorMessage);
        console.error("Fetch full profile error:", err);
        return null;
    } finally {
        setLoading(false);
    }
}, []); // ← Empty dependency array

    return (
        <ClubProfileContext.Provider
            value={{
                // State
                profiles,
                singleProfile,
                seasons,
                insights,
                strengths,
                mediaItems,
                loading,
                error,
                pagination,

                // Fetch methods
                fetchAllProfiles,
                fetchProfileById,
                fetchProfileByTeam,
                fetchSeasons,
                fetchInsights,
                fetchMedia,
                fetchFullProfile,
            }}
        >
            {children}
        </ClubProfileContext.Provider>
    );
};