

// "use client";

// import { createContext, useContext, useState, useCallback, ReactNode } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// // ── Types ─────────────────────────────────────────────────────────────────────

// interface SearchResult {
//     type: 'player' | 'team' | 'user';
//     id: string;
//     name: string;
//     image?: string;
//     logo?: string;
//     playerProfilesId?: string;
//     jerseyNumber?: number;
//     category?: string[];
//     tournament?: string;
//     allTournaments?: string[];
// }

// interface GlobalSearchContextType {
//     searchQuery: string;
//     setSearchQuery: (query: string) => void;
//     searchResults: SearchResult[];
//     isSearching: boolean;
//     performSearch: (query: string) => Promise<void>;
//     clearSearch: () => void;
//     navigateToResult: (result: SearchResult) => void;
// }

// // ── Tournament routing helpers ─────────────────────────────────────────────────

// const WOMEN_TOURNAMENTS = ["womens_ipl", "womens_t20i"];
// const FIFA_TOURNAMENTS  = ["mens_fifa_wc_2022", "mens_fifa_wc_2026", "womens_fifa_wc"];

// function isWomenCricketPlayer(result: SearchResult): boolean {
//     if (result.type !== "player") return false;
//     const all = result.allTournaments ?? [result.tournament ?? ""];
//     return all.some((t) => WOMEN_TOURNAMENTS.includes(t));
// }

// function isFifaPlayer(result: SearchResult): boolean {
//     if (result.type !== "player") return false;
//     const t = result.tournament ?? "";
//     return FIFA_TOURNAMENTS.some((f) => t.startsWith(f.split("_wc")[0])) ||
//            t.includes("fifa");
// }

// // ── Context ───────────────────────────────────────────────────────────────────

// const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined);

// export function GlobalSearchProvider({ children }: { children: ReactNode }) {
//     const [searchQuery, setSearchQuery] = useState("");
//     const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
//     const [isSearching, setIsSearching] = useState(false);
//     const router = useRouter();

//     // FIX: empty dep array [] makes this function stable across renders.
//     // The Header's debounce useEffect only depends on searchQuery now,
//     // so it won't re-fire just because the context re-rendered.
//     const performSearch = useCallback(async (query: string) => {
//         if (!query.trim()) {
//             setSearchResults([]);
//             return;
//         }

//         setIsSearching(true);
//         try {
//             const [globalRes, playerStatsRes, fifaRes] = await Promise.allSettled([
//                 axios.get(`/api/global-search?q=${encodeURIComponent(query)}`),
//                 axios.get(`/api/player-stats?search=${encodeURIComponent(query)}&limit=10`),
//                 axios.get(`/api/fifa-player-stats?search=${encodeURIComponent(query)}&limit=10`),
//             ]);

//             // ── Global results ─────────────────────────────────────────────────
//             let globalResults: SearchResult[] = [];
//             if (globalRes.status === "fulfilled") {
//                 globalResults = globalRes.value.data.results || [];
//             }

//             // ── WPL / WT20I results ────────────────────────────────────────────
//             let statsResults: SearchResult[] = [];
//             if (playerStatsRes.status === "fulfilled" && playerStatsRes.value.data.success) {
//                 const byPlayerId = new Map<string, { primary: SearchResult; tournaments: string[] }>();

//                 for (const p of playerStatsRes.value.data.data ?? []) {
//                     const t = p.tournament ?? "";
//                     const existing = byPlayerId.get(p.player_id);
//                     if (!existing) {
//                         byPlayerId.set(p.player_id, {
//                             primary: {
//                                 type: "player" as const,
//                                 id: p.player_id,
//                                 name: p.player_name,
//                                 playerProfilesId: p.player_id,
//                                 jerseyNumber: p.jersey_no ?? undefined,
//                                 tournament: t,
//                                 category: [p.format ?? "T20"],
//                             },
//                             tournaments: [t],
//                         });
//                     } else {
//                         if (t === "womens_ipl") existing.primary.tournament = t;
//                         if (!existing.tournaments.includes(t)) existing.tournaments.push(t);
//                     }
//                 }

//                 statsResults = Array.from(byPlayerId.values()).map(({ primary, tournaments }) => ({
//                     ...primary,
//                     allTournaments: tournaments.length > 1 ? tournaments : undefined,
//                 }));
//             }

//             // ── FIFA results ───────────────────────────────────────────────────
//             let fifaResults: SearchResult[] = [];
//             if (fifaRes.status === "fulfilled" && fifaRes.value.data.success) {
//                 fifaResults = (fifaRes.value.data.data ?? []).map(
//                     (p: {
//                         player_id: string;
//                         player_name: string;
//                         position?: string;
//                         team?: string;
//                         tournament?: string;
//                         season?: number;
//                     }) => ({
//                         type: "player" as const,
//                         id: p.player_id,
//                         name: p.player_name,
//                         playerProfilesId: p.player_id,
//                         tournament: p.tournament ?? "",
//                         category: [p.position ?? "Player", p.team ?? ""],
//                     })
//                 );
//             }

//             // ── Merge: deduplicate by player_id ────────────────────────────────
//             const seenIds = new Set<string>(
//                 globalResults.map((r) => r.playerProfilesId ?? r.id)
//             );

//             const newFromStats = statsResults.filter(
//                 (r) => !seenIds.has(r.playerProfilesId ?? r.id)
//             );
//             newFromStats.forEach((r) => seenIds.add(r.playerProfilesId ?? r.id));

//             const newFromFifa = fifaResults.filter(
//                 (r) => !seenIds.has(r.playerProfilesId ?? r.id)
//             );

//             const merged: SearchResult[] = [...globalResults, ...newFromStats, ...newFromFifa];

//             // ── Sort: Players → Users → Teams; IPL → Women → FIFA ─────────────
//             const typeOrder: Record<string, number> = { player: 1, user: 2, team: 3 };
//             merged.sort((a, b) => {
//                 const ta = typeOrder[a.type] ?? 4;
//                 const tb = typeOrder[b.type] ?? 4;
//                 if (ta !== tb) return ta - tb;
//                 const sportRank = (r: SearchResult) => {
//                     if (isFifaPlayer(r))         return 2;
//                     if (isWomenCricketPlayer(r)) return 1;
//                     return 0;
//                 };
//                 return sportRank(a) - sportRank(b);
//             });

//             setSearchResults(merged);
//         } catch (error) {
//             console.error("Search failed:", error);
//             setSearchResults([]);
//         } finally {
//             setIsSearching(false);
//         }
//     }, []); // ← stable: no deps that change on every render

//     const clearSearch = useCallback(() => {
//         setSearchQuery("");
//         setSearchResults([]);
//     }, []);

//     const navigateToResult = useCallback((result: SearchResult) => {
//         const profileId = result.playerProfilesId || result.id;

//         if (result.type === "user") {
//             router.push(`/MainModules/Profile?userId=${encodeURIComponent(profileId)}`);
//         } else if (isFifaPlayer(result)) {
//             router.push(
//                 `/MainModules/FifaPlayersProfile?id=${encodeURIComponent(profileId)}&tournament=${encodeURIComponent(result.tournament ?? "")}`
//             );
//         } else if (isWomenCricketPlayer(result)) {
//             router.push(
//                 `/MainModules/WplPlayers?id=${encodeURIComponent(profileId)}&tournament=${encodeURIComponent(result.tournament ?? "womens_ipl")}`
//             );
//         } else if (result.type === "player" || result.type === "team") {
//             router.push(
//                 `/MainModules/PlayersProfile?id=${encodeURIComponent(profileId)}&tab=highlights`
//             );
//         }

//         setTimeout(() => clearSearch(), 150);
//     }, [clearSearch, router]);

//     return (
//         <GlobalSearchContext.Provider value={{
//             searchQuery,
//             setSearchQuery,
//             searchResults,
//             isSearching,
//             performSearch,
//             clearSearch,
//             navigateToResult,
//         }}>
//             {children}
//         </GlobalSearchContext.Provider>
//     );
// }

// export function useGlobalSearch() {
//     const context = useContext(GlobalSearchContext);
//     if (!context) {
//         throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
//     }
//     return context;
// }







"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SearchResult {
    type: 'player' | 'team' | 'user' | 'wt20_club';
    id: string;
    name: string;
    image?: string;
    logo?: string;
    playerProfilesId?: string;
    jerseyNumber?: number;
    category?: string[];
    tournament?: string;
    allTournaments?: string[];
    // wt20_club extras
    icc_ranking?: number;
    club_id?: string;
}

interface GlobalSearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResults: SearchResult[];
    isSearching: boolean;
    performSearch: (query: string) => Promise<void>;
    clearSearch: () => void;
    navigateToResult: (result: SearchResult) => void;
}

// ── Tournament routing helpers ─────────────────────────────────────────────────

const WOMEN_TOURNAMENTS = ["womens_ipl", "womens_t20i"];
const FIFA_TOURNAMENTS  = ["mens_fifa_wc_2022", "mens_fifa_wc_2026", "womens_fifa_wc"];

function isWomenCricketPlayer(result: SearchResult): boolean {
    if (result.type !== "player") return false;
    const all = result.allTournaments ?? [result.tournament ?? ""];
    return all.some((t) => WOMEN_TOURNAMENTS.includes(t));
}

function isFifaPlayer(result: SearchResult): boolean {
    if (result.type !== "player") return false;
    const t = result.tournament ?? "";
    return FIFA_TOURNAMENTS.some((f) => t.startsWith(f.split("_wc")[0])) ||
           t.includes("fifa");
}

// Only fire the wt20 club search when the query is plausibly a country name:
// at least 2 chars, not purely numeric, not a jersey number like "#7".
function shouldSearchWT20Clubs(query: string): boolean {
    const q = query.trim();
    return q.length >= 2 && !/^\d+$/.test(q) && !q.startsWith("#");
}

// ── Context ───────────────────────────────────────────────────────────────────

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined);

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // ── Fire requests in parallel ──────────────────────────────────
            // wt20Clubs only fires when the query looks like a country name,
            // saving a Firestore read on every jersey-number or short search.
            const requests: Promise<unknown>[] = [
                axios.get(`/api/global-search?q=${encodeURIComponent(query)}`),
                axios.get(`/api/player-stats?search=${encodeURIComponent(query)}&limit=10`),
                axios.get(`/api/fifa-player-stats?search=${encodeURIComponent(query)}&limit=10`),
            ];

            const wt20ClubsIndex = shouldSearchWT20Clubs(query) ? requests.length : -1;
            if (wt20ClubsIndex !== -1) {
                requests.push(
                    axios.get(`/api/wt20-clubs?search=${encodeURIComponent(query)}&limit=10`)
                );
            }

            const settled = await Promise.allSettled(requests);
            const [globalRes, playerStatsRes, fifaRes] = settled;
            const wt20ClubsRes = wt20ClubsIndex !== -1 ? settled[wt20ClubsIndex] : null;

            // ── Global results ─────────────────────────────────────────────
            let globalResults: SearchResult[] = [];
            if (globalRes.status === "fulfilled") {
                globalResults = (globalRes.value as { data: { results?: SearchResult[] } }).data.results || [];
            }

            // ── WPL / WT20I results ────────────────────────────────────────
            let statsResults: SearchResult[] = [];
            if (playerStatsRes.status === "fulfilled" && (playerStatsRes.value as { data: { success: boolean } }).data.success) {
                const byPlayerId = new Map<string, { primary: SearchResult; tournaments: string[] }>();

                for (const p of (playerStatsRes.value as { data: { data?: Record<string, unknown>[] } }).data.data ?? []) {
                    const t = (p.tournament ?? "") as string;
                    const existing = byPlayerId.get(p.player_id as string);
                    if (!existing) {
                        byPlayerId.set(p.player_id as string, {
                            primary: {
                                type: "player" as const,
                                id: p.player_id as string,
                                name: p.player_name as string,
                                playerProfilesId: p.player_id as string,
                                jerseyNumber: (p.jersey_no ?? undefined) as number | undefined,
                                tournament: t,
                                category: [p.format as string ?? "T20"],
                            },
                            tournaments: [t],
                        });
                    } else {
                        if (t === "womens_ipl") existing.primary.tournament = t;
                        if (!existing.tournaments.includes(t)) existing.tournaments.push(t);
                    }
                }

                statsResults = Array.from(byPlayerId.values()).map(({ primary, tournaments }) => ({
                    ...primary,
                    allTournaments: tournaments.length > 1 ? tournaments : undefined,
                }));
            }

            // ── FIFA results ───────────────────────────────────────────────
            let fifaResults: SearchResult[] = [];
            if (fifaRes.status === "fulfilled" && (fifaRes.value as { data: { success: boolean } }).data.success) {
                fifaResults = ((fifaRes.value as { data: { data?: Record<string, unknown>[] } }).data.data ?? []).map((p) => ({
                    type: "player" as const,
                    id: p.player_id as string,
                    name: p.player_name as string,
                    playerProfilesId: p.player_id as string,
                    tournament: (p.tournament ?? "") as string,
                    category: [(p.position ?? "Player") as string, (p.team ?? "") as string],
                }));
            }

            // ── WT20 Club results ──────────────────────────────────────────
            let wt20ClubResults: SearchResult[] = [];
            if (
                wt20ClubsRes &&
                wt20ClubsRes.status === "fulfilled" &&
                (wt20ClubsRes.value as { data: { success: boolean } }).data.success
            ) {
                wt20ClubResults = ((wt20ClubsRes.value as { data: { data?: Record<string, unknown>[] } }).data.data ?? []).map((c) => ({
                    type: "wt20_club" as const,
                    id: c.club_id as string,
                    club_id: c.club_id as string,
                    name: c.country as string,
                    icc_ranking: c.icc_ranking as number,
                    tournament: "ICC Women's T20 World Cup",
                    category: [`Rank #${c.icc_ranking}`, c.current_captain as string ?? ""],
                }));
            }

            // ── Merge: deduplicate by id ───────────────────────────────────
            const seenIds = new Set<string>(
                globalResults.map((r) => r.playerProfilesId ?? r.id)
            );

            const newFromStats = statsResults.filter(
                (r) => !seenIds.has(r.playerProfilesId ?? r.id)
            );
            newFromStats.forEach((r) => seenIds.add(r.playerProfilesId ?? r.id));

            const newFromFifa = fifaResults.filter(
                (r) => !seenIds.has(r.playerProfilesId ?? r.id)
            );
            newFromFifa.forEach((r) => seenIds.add(r.playerProfilesId ?? r.id));

            const newFromWT20Clubs = wt20ClubResults.filter(
                (r) => !seenIds.has(r.id)
            );

            const merged: SearchResult[] = [
                ...globalResults,
                ...newFromStats,
                ...newFromFifa,
                ...newFromWT20Clubs,
            ];

            // ── Sort: Players → Users → Teams → WT20 Clubs ────────────────
            const typeOrder: Record<string, number> = {
                player: 1,
                user: 2,
                team: 3,
                wt20_club: 4,
            };
            merged.sort((a, b) => {
                const ta = typeOrder[a.type] ?? 5;
                const tb = typeOrder[b.type] ?? 5;
                if (ta !== tb) return ta - tb;
                // Within wt20_club, sort by ICC ranking
                if (a.type === "wt20_club" && b.type === "wt20_club") {
                    return (a.icc_ranking ?? 99) - (b.icc_ranking ?? 99);
                }
                const sportRank = (r: SearchResult) => {
                    if (isFifaPlayer(r))         return 2;
                    if (isWomenCricketPlayer(r)) return 1;
                    return 0;
                };
                return sportRank(a) - sportRank(b);
            });

            setSearchResults(merged);
        } catch (error) {
            console.error("Search failed:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setSearchResults([]);
    }, []);

    const navigateToResult = useCallback((result: SearchResult) => {
        const profileId = result.playerProfilesId || result.id;

        if (result.type === "wt20_club") {
            router.push(
                `/MainModules/WT20ClubProfile?id=${encodeURIComponent(result.club_id ?? result.id)}`
            );
        } else if (result.type === "user") {
            router.push(`/MainModules/Profile?userId=${encodeURIComponent(profileId)}`);
        } else if (isFifaPlayer(result)) {
            router.push(
                `/MainModules/FifaPlayersProfile?id=${encodeURIComponent(profileId)}&tournament=${encodeURIComponent(result.tournament ?? "")}`
            );
        } else if (isWomenCricketPlayer(result)) {
            router.push(
                `/MainModules/WplPlayers?id=${encodeURIComponent(profileId)}&tournament=${encodeURIComponent(result.tournament ?? "womens_ipl")}`
            );
        } else if (result.type === "player" || result.type === "team") {
            router.push(
                `/MainModules/PlayersProfile?id=${encodeURIComponent(profileId)}&tab=highlights`
            );
        }

        setTimeout(() => clearSearch(), 150);
    }, [clearSearch, router]);

    return (
        <GlobalSearchContext.Provider value={{
            searchQuery,
            setSearchQuery,
            searchResults,
            isSearching,
            performSearch,
            clearSearch,
            navigateToResult,
        }}>
            {children}
        </GlobalSearchContext.Provider>
    );
}

export function useGlobalSearch() {
    const context = useContext(GlobalSearchContext);
    if (!context) {
        throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
    }
    return context;
}