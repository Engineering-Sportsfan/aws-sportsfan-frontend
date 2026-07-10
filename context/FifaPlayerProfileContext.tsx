"use client";

import axios from "axios";
import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";
import { FifaPlayer } from "@/types/fifaPlayer";

// ── Types ─────────────────────────────────────────────────────────────────────

type FifaPlayerListData = {
    players: FifaPlayer[];
    hasMore: boolean;
    nextCursor?: string | null;
};

type FifaPlayerListApiResponse = {
    success: boolean;
    data: FifaPlayer[];
    nextCursor?: string | null;
    count?: number;
};

type FifaContextType = {
    player: FifaPlayer | null;
    listData: FifaPlayerListData | null;
    loading: boolean;
    selectPlayer: (playerId: string) => void;
    fetchFifaPlayerList: (reset?: boolean) => Promise<void>;
    fetchFifaPlayerById: (playerId: string, tournament?: string) => Promise<void>;
};

// ── Context ───────────────────────────────────────────────────────────────────

const FifaPlayerProfileContext = createContext<FifaContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function FifaPlayerProfileProvider({ children }: { children: ReactNode }) {
    const [player, setPlayer]     = useState<FifaPlayer | null>(null);
    const [listData, setListData] = useState<FifaPlayerListData | null>(null);
    const [loading, setLoading]   = useState(false);

    // ── Select from already-fetched list ──────────────────────────────────────
    const selectPlayer = (playerId: string) => {
        const found = listData?.players.find((p) => p.player_id === playerId) ?? null;
        setPlayer(found);
    };

    // ── Direct fetch by player_id (global search slow path) ───────────────────
    const fetchFifaPlayerById = async (playerId: string, tournament?: string) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({ player_id: playerId, limit: "1" });
            if (tournament) params.set("tournament", tournament);

            const res = await axios.get<FifaPlayerListApiResponse>(
                `/api/fifa-player-stats?${params.toString()}`
            );

            if (res.data.success && res.data.data?.length > 0) {
                const found = res.data.data[0];
                setPlayer(found);

                // Merge into list cache
                setListData((prev) => {
                    const base = prev ?? { players: [], hasMore: false, nextCursor: null };
                    const already = base.players.some((p) => p.player_id === found.player_id);
                    if (already) return base;
                    return { ...base, players: [...base.players, found] };
                });
            } else {
                setPlayer(null);
            }
        } catch (err) {
            console.error("Failed to fetch FIFA player by id:", err);
            setPlayer(null);
        } finally {
            setLoading(false);
        }
    };

    // ── Paginated list fetch (home cards) ─────────────────────────────────────
    const fetchFifaPlayerList = async (reset = true) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                tournament: "mens_fifa_wc_2022",
                limit: "20",
            });

            if (!reset && listData?.nextCursor) {
                params.set("after", listData.nextCursor);
            }

            const res = await axios.get<FifaPlayerListApiResponse>(
                `/api/fifa-player-stats?${params.toString()}`
            );

            if (res.data.success) {
                const incoming   = res.data.data ?? [];
                const nextCursor = res.data.nextCursor ?? null;
                const hasMore    = Boolean(nextCursor);

                if (reset) {
                    setListData({ players: incoming, hasMore, nextCursor });
                } else {
                    setListData((prev) => ({
                        players: [...(prev?.players ?? []), ...incoming],
                        hasMore,
                        nextCursor,
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch FIFA player list:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FifaPlayerProfileContext.Provider
            value={{
                player,
                listData,
                loading,
                selectPlayer,
                fetchFifaPlayerList,
                fetchFifaPlayerById,
            }}
        >
            {children}
        </FifaPlayerProfileContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useFifaPlayerProfile() {
    const context = useContext(FifaPlayerProfileContext);
    if (!context) {
        throw new Error("useFifaPlayerProfile must be used inside FifaPlayerProfileProvider");
    }
    return context;
}