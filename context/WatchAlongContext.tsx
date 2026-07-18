// contexts/WatchAlongContext.tsx
"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useRef,
} from "react";
import axios from "axios";

/* ================= TYPES ================= */

export interface TeamScore {
    name: string;
    score: string;
    overs: string;
}

export interface Match {
    id: string;
    matchNo: number;
    tournament: string;
    stadium: string;
    team1: TeamScore;
    team2: TeamScore;
    isLive: boolean;
     videoUrl?: string;      
    videoType?: string;
    createdAt?: number;
    updatedAt?: number;
    title?: string;
}

export interface ChatMessage {
    id: string;
    user: string;
    text: string;
    color: string;
    createdAt: number;
}

export interface Prediction {
    id: string;
    question: string;
    options: string[];
    votes: Record<string, number>;
    totalVotes: number;
    closesAt: number | null;
    isOpen: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer?: string; 
    timerSeconds: number;
    points: number;
    isActive: boolean;
    opensAt: number | null;
    closesAt: number | null;
    competing: number;
    createdAt: number;
    updatedAt: number;
}

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    totalPoints: number;
    updatedAt?: number;
}

export interface EmojiReactions {
    [emoji: string]: number;
}

export interface Room {
    id: string;
    name: string;
    role: string;
    badge: string;
    badgeColor: string;
    borderColor: string;
    watching: string;
    engagement: string;
    active: string;
    isLive: boolean;
    liveMatchId: string;
    displayPicture: string;
    hostUserId?: string;   // The Google user ID of the person who created this room
    coHostUserId?: string; // The Google user ID of the co-host if one is designated
    roarRoomId?: string;   // Synced ROAR Room ID
    createdAt?: number;
    updatedAt?: number;
    sport?: string;
}

export interface CreateMatchPayload {
    matchNo: string;
    tournament: string;
    stadium: string;
    team1: TeamScore;
    team2: TeamScore;
    isLive: boolean;
}

export interface CreatePredictionPayload {
    question: string;
    options: string[];
    closesAt?: number;
}

export interface VotePayload {
    predictionId: string;
    option: string;
    userId: string;
}

export interface CreateQuizPayload {
    question: string;
    options: string[];
    correctAnswer: string;
    timerSeconds: number;
    points: number;
}

export interface QuizAnswerPayload {
    questionId: string;
    option: string;
    userId: string;
    displayName?: string;
}

export interface SendEmojiPayload {
    emoji?: string;
    emojis?: string[];
}

/* ================= CONTEXT TYPE ================= */

interface WatchAlongContextType {
    // State
    matches: Match[];
    currentMatch: Match | null;
    chats: ChatMessage[];
    predictions: Prediction[];
    quizQuestions: QuizQuestion[];
    activeQuizQuestion: QuizQuestion | null;
    leaderboard: LeaderboardEntry[];
    emojiReactions: EmojiReactions;
    rooms: Room[];
    currentRoom: Room | null;
    loading: boolean;
    error: string | null;



    // Match methods
    fetchMatches: () => Promise<void>;
    fetchMatchById: (matchId: string) => Promise<void>;
    createMatch: (payload: CreateMatchPayload) => Promise<Match | null>;
    updateMatch: (matchId: string, payload: CreateMatchPayload) => Promise<Match | null>;
    deleteMatch: (matchId: string) => Promise<boolean>;

    // Chat methods
    fetchChats: (matchId: string, limit?: number) => Promise<void>;
    sendChatMessage: (matchId: string, user: string, text: string, color?: string) => Promise<ChatMessage | null>;
    deleteChatMessage: (matchId: string, chatId: string) => Promise<boolean>;

    // Prediction methods
    fetchPredictions: (matchId: string, openOnly?: boolean) => Promise<void>;
    createPrediction: (matchId: string, payload: CreatePredictionPayload) => Promise<Prediction | null>;
    votePrediction: (matchId: string, payload: VotePayload) => Promise<{ success: boolean; prediction?: Prediction; alreadyVoted?: boolean }>;
    togglePredictionStatus: (matchId: string, predictionId: string, isOpen: boolean) => Promise<boolean>;

    // Quiz methods
    fetchQuizQuestions: (matchId: string, activeOnly?: boolean) => Promise<void>;
    fetchLeaderboard: (matchId: string) => Promise<void>;
    createQuizQuestion: (matchId: string, payload: CreateQuizPayload) => Promise<QuizQuestion | null>;
    submitQuizAnswer: (matchId: string, payload: QuizAnswerPayload) => Promise<{ isCorrect: boolean; pointsEarned: number; correctAnswer: string } | null>;
    toggleQuizQuestion: (matchId: string, questionId: string, isActive: boolean) => Promise<boolean>;

    // Emoji methods
    fetchEmojiReactions: (matchId: string) => Promise<void>;
    sendEmojiReaction: (matchId: string, payload: SendEmojiPayload) => Promise<EmojiReactions | null>;
    resetEmojiReactions: (matchId: string) => Promise<boolean>;

    // Room methods
    fetchRooms: () => Promise<void>;
    fetchRoomById: (roomId: string) => Promise<void>;
    createRoom: (formData: FormData) => Promise<Room | null>;
    updateRoom: (roomId: string, formData: FormData) => Promise<Room | null>;
    deleteRoom: (roomId: string) => Promise<boolean>;
}

/* ================= CONTEXT ================= */

const WatchAlongContext = createContext<WatchAlongContextType | undefined>(undefined);

/* ================= HOOK ================= */

export const useWatchAlong = () => {
    const context = useContext(WatchAlongContext);
    if (!context) {
        throw new Error("useWatchAlong must be used inside WatchAlongProvider");
    }
    return context;
};

/*  PROVIDER  */

export const WatchAlongProvider = ({ children }: { children: ReactNode }) => {
    // State
    const [matches, setMatches] = useState<Match[]>([]);
    const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
    const [chats, setChats] = useState<ChatMessage[]>([]);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [activeQuizQuestion, setActiveQuizQuestion] = useState<QuizQuestion | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [emojiReactions, setEmojiReactions] = useState<EmojiReactions>({});
    const [rooms, setRooms] = useState<Room[]>([]);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for tracking incremental chats sync
    const lastChatTimestampRef = useRef<number>(0);
    const lastChatMatchIdRef = useRef<string>("");

    /* ================= MATCH APIS ================= */

    const fetchMatches = useCallback(async () => {
        try {
            const res = await axios.get("/api/watch-along/matches");
            if (res.data.success) {
                setMatches(res.data.matches);
            }
        } catch (err) {
            // Non-critical – don't surface as a global error that hides the room
            console.warn("Fetch matches error (non-critical):", err instanceof Error ? err.message : err);
        }
    }, []);

    const fetchMatchById = useCallback(async (matchId: string) => {
        try {
            const res = await axios.get(`/api/watch-along/matches/${matchId}`);
            if (res.data.success) {
                setCurrentMatch(res.data.match);
            }
        } catch (err) {
            // Non-critical – don't surface as a global error that hides the room
            console.warn("Fetch match error (non-critical):", err instanceof Error ? err.message : err);
        }
    }, []);

    const createMatch = useCallback(async (payload: CreateMatchPayload): Promise<Match | null> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.post("/api/watch-along/matches", payload);
            if (res.data.success) {
                setMatches(prev => [res.data.match, ...prev]);
                return res.data.match;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create match");
            console.error("Create match error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMatch = useCallback(async (matchId: string, payload: CreateMatchPayload): Promise<Match | null> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.put(`/api/watch-along/matches/${matchId}`, payload);
            if (res.data.success) {
                setMatches(prev => prev.map(m => m.id === matchId ? res.data.match : m));
                if (currentMatch?.id === matchId) setCurrentMatch(res.data.match);
                return res.data.match;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update match");
            console.error("Update match error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentMatch]);

    const deleteMatch = useCallback(async (matchId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.delete(`/api/watch-along/matches/${matchId}`);
            if (res.data.success) {
                setMatches(prev => prev.filter(m => m.id !== matchId));
                if (currentMatch?.id === matchId) setCurrentMatch(null);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete match");
            console.error("Delete match error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentMatch]);

    /* ================= CHAT APIS ================= */

    const fetchChats = useCallback(async (matchId: string, limit: number = 50) => {
        // DEMO BYPASS: skip API call for mock/demo match IDs
        if (!matchId || matchId === 'm1' || matchId === 'm2') {
            setChats([]);
            return;
        }
        if (lastChatMatchIdRef.current !== matchId) {
            lastChatMatchIdRef.current = matchId;
            lastChatTimestampRef.current = 0;
        }
        const since = lastChatTimestampRef.current;
        try {
            const res = await axios.get(`/api/watch-along/matches/${matchId}/chats?limit=${limit}${since ? `&since=${since}` : ""}`);
            if (res.data.success) {
                if (since === 0) {
                    setChats(res.data.chats);
                    if (res.data.chats.length > 0) {
                        const newest = res.data.chats[res.data.chats.length - 1];
                        lastChatTimestampRef.current = newest.createdAt;
                    }
                } else {
                    if (res.data.chats && res.data.chats.length > 0) {
                        const newest = res.data.chats[res.data.chats.length - 1];
                        lastChatTimestampRef.current = newest.createdAt;
                        setChats(prev => {
                            const existingIds = new Set(prev.map(c => c.id));
                            const newUnique = res.data.chats.filter((c: any) => !existingIds.has(c.id));
                            return [...prev, ...newUnique];
                        });
                    }
                }
            }
        } catch (err) {
            console.warn("Fetch chats error (non-critical):", err);
        }
    }, []);

    const sendChatMessage = useCallback(async (
        matchId: string,
        user: string,
        text: string,
        color: string = "text-pink-400"
    ): Promise<ChatMessage | null> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.post(`/api/watch-along/matches/${matchId}/chats`, { user, text, color });
            if (res.data.success) {
                setChats(prev => [...prev, res.data.chat]);
                return res.data.chat;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send message");
            console.error("Send message error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteChatMessage = useCallback(async (matchId: string, chatId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.delete(`/api/watch-along/matches/${matchId}/chats`, { data: { chatId } });
            if (res.data.success) {
                setChats(prev => prev.filter(c => c.id !== chatId));
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete message");
            console.error("Delete message error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /*  PREDICTION APIS  */

    const fetchPredictions = useCallback(async (matchId: string, openOnly: boolean = false) => {
        // DEMO BYPASS
        if (!matchId || matchId === 'm1' || matchId === 'm2') {
            setPredictions([]);
            return;
        }
        try {
            const url = `/api/watch-along/matches/${matchId}/predictions`;
            const res = await axios.get(url);
            if (res.data.success) {
                setPredictions(res.data.predictions);
            }
        } catch (err) {
            console.warn("Fetch predictions error (non-critical):", err);
        }
    }, []);

    const createPrediction = useCallback(async (matchId: string, payload: CreatePredictionPayload): Promise<Prediction | null> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.post(`/api/watch-along/matches/${matchId}/predictions`, {
                action: "create",
                ...payload,
            });
            if (res.data.success) {
                setPredictions(prev => [res.data.prediction, ...prev]);
                return res.data.prediction;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create prediction");
            console.error("Create prediction error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const votePrediction = useCallback(
        async (matchId: string, payload: VotePayload) => {
            try {
                setLoading(true);

                const res = await axios.post(
                    `/api/watch-along/matches/${matchId}/predictions`,
                    {
                        action: "vote",
                        ...payload,
                    }
                );

                if (res.data.success) {
                    setPredictions((prev) =>
                        prev.map((p) =>
                            p.id === payload.predictionId
                                ? res.data.prediction
                                : p
                        )
                    );

                    return {
                        success: true,
                        prediction: res.data.prediction,
                    };
                }

                return { success: false };
            } catch (err: unknown) {
                const status = (err as { response?: { status?: number } })?.response?.status;

                if (status === 409) {
                    return {
                        success: false,
                        alreadyVoted: true,
                    };
                }

                setError(
                    (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to vote"
                );

                return {
                    success: false,
                };
            } finally {
                setLoading(false);
            }
        },
        []
    );
    const togglePredictionStatus = useCallback(async (matchId: string, predictionId: string, isOpen: boolean): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.patch(`/api/watch-along/matches/${matchId}/predictions`, {
                predictionId,
                isOpen,
            });
            if (res.data.success) {
                setPredictions(prev => prev.map(p => p.id === predictionId ? { ...p, isOpen } : p));
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to toggle prediction");
            console.error("Toggle prediction error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /*  QUIZ APIS  */

    const fetchQuizQuestions = useCallback(async (matchId: string, activeOnly: boolean = false) => {
        // DEMO BYPASS
        if (!matchId || matchId === 'm1' || matchId === 'm2') {
            setQuizQuestions([]);
            return;
        }
        try {
            const url = `/api/watch-along/matches/${matchId}/quiz${activeOnly ? '?active=true' : ''}`;
            const res = await axios.get(url);
            if (res.data.success) {
                setQuizQuestions(res.data.questions);
                const active = res.data.questions.find((q: QuizQuestion) => q.isActive);
                setActiveQuizQuestion(active || null);
            }
        } catch (err) {
            console.warn("Fetch quiz error (non-critical):", err);
        }
    }, []);

    const fetchLeaderboard = useCallback(async (matchId: string) => {
        // DEMO BYPASS
        if (!matchId || matchId === 'm1' || matchId === 'm2') {
            setLeaderboard([]);
            return;
        }
        try {
            const res = await axios.get(`/api/watch-along/matches/${matchId}/quiz?leaderboard=true`);
            if (res.data.success) {
                setLeaderboard(res.data.leaderboard);
            }
        } catch (err) {
            console.warn("Fetch leaderboard error (non-critical):", err);
        }
    }, []);

    const createQuizQuestion = useCallback(async (matchId: string, payload: CreateQuizPayload): Promise<QuizQuestion | null> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.post(`/api/watch-along/matches/${matchId}/quiz`, {
                action: "create",
                ...payload,
            });
            if (res.data.success) {
                setQuizQuestions(prev => [res.data.question, ...prev]);
                return res.data.question;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create quiz question");
            console.error("Create quiz error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);



    const submitQuizAnswer = useCallback(async (matchId: string, payload: QuizAnswerPayload) => {
        try {
            setLoading(true);
            const res = await axios.post(`/api/watch-along/matches/${matchId}/quiz`, {
                action: "answer",
                ...payload,
            });
            if (res.data.success) {
                await fetchLeaderboard(matchId);
                return {
                    isCorrect: res.data.isCorrect,
                    pointsEarned: res.data.pointsEarned,
                    correctAnswer: res.data.correctAnswer,
                };
            }
            return null;
        } catch (err: unknown) {
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchLeaderboard]);

    const toggleQuizQuestion = useCallback(async (matchId: string, questionId: string, isActive: boolean): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.patch(`/api/watch-along/matches/${matchId}/quiz`, {
                questionId,
                isActive,
            });
            if (res.data.success) {
                await fetchQuizQuestions(matchId, true);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to toggle quiz question");
            console.error("Toggle quiz error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchQuizQuestions]);

    /* ================= EMOJI STORM APIS ================= */

    const fetchEmojiReactions = useCallback(async (matchId: string) => {
        // DEMO BYPASS
        if (!matchId || matchId === 'm1' || matchId === 'm2') {
            setEmojiReactions({});
            return;
        }
        try {
            const res = await axios.get(`/api/watch-along/matches/${matchId}/emoji-storm`);
            if (res.data.success) {
                setEmojiReactions(res.data.reactions);
            }
        } catch (err) {
            console.warn("Fetch emoji error (non-critical):", err);
        }
    }, []);

    const sendEmojiReaction = useCallback(async (matchId: string, payload: SendEmojiPayload): Promise<EmojiReactions | null> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.post(`/api/watch-along/matches/${matchId}/emoji-storm`, payload);
            if (res.data.success) {
                setEmojiReactions(res.data.reactions);
                return res.data.reactions;
            }
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send emoji");
            console.error("Send emoji error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const resetEmojiReactions = useCallback(async (matchId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.delete(`/api/watch-along/matches/${matchId}/emoji-storm`);
            if (res.data.success) {
                const emptyReactions: EmojiReactions = {};
                ["🔥", "💪", "😱", "🏏", "👏", "🎉", "❤️", "🚀", "😮", "🤩"].forEach(e => { emptyReactions[e] = 0; });
                setEmojiReactions(emptyReactions);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset emoji reactions");
            console.error("Reset emoji error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    /* ================= ROOM APIS ================= */

    const fetchRooms = useCallback(async () => {
        try {
            const res = await axios.get("/api/watch-along");
            if (res.data.success) {
                setRooms(res.data.rooms);
            }
        } catch (err) {
            // Non-critical – don't surface as a global error
            console.warn("Fetch rooms error (non-critical):", err instanceof Error ? err.message : err);
        }
    }, []);

    const fetchRoomById = useCallback(async (roomId: string) => {
        try {
            setError(null);
            const cleanRoomId = roomId ? roomId.split('?')[0] : "";
            const res = await axios.get(`/api/watch-along/${cleanRoomId}`);
            if (res.data.success) {
                setCurrentRoom(res.data.room);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch room");
            console.error("Fetch room error:", err);
        }
    }, []);


    const createRoom = useCallback(async (formData: FormData): Promise<Room | null> => {
        try {
            setLoading(true);
            const roomName = (formData.get("name") as string) || "My Room";

            // Send all required fields the backend expects
            formData.set("name", roomName);
            if (!formData.get("role")) formData.set("role", "Host");
            if (!formData.get("badge")) formData.set("badge", "Live");
            if (!formData.get("badgeColor")) formData.set("badgeColor", "bg-pink-600");
            if (!formData.get("borderColor")) formData.set("borderColor", "border-pink-500");
            formData.set("isLive", "true");

            const res = await axios.post("/api/watch-along", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success && res.data.room) {
                const newRoom = res.data.room;
                setRooms(prev => [newRoom, ...prev]);
                return newRoom;
            }
            return null;
        } catch (err) {
            console.error("Create room error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateRoom = useCallback(async (roomId: string, formData: FormData): Promise<Room | null> => {
        try {
            setLoading(true);
            const res = await axios.put(`/api/watch-along/${roomId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                setRooms(prev => prev.map(r => r.id === roomId ? res.data.room : r));
                if (currentRoom?.id === roomId) setCurrentRoom(res.data.room);
                return res.data.room;
            }
            return null;
        } catch (err) {
            // Don't crash the room page for update failures (e.g. co-host sync)
            console.warn("Update room error (non-critical):", err instanceof Error ? err.message : err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentRoom]);

    const deleteRoom = useCallback(async (roomId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.delete(`/api/watch-along/${roomId}`);
            if (res.data.success) {
                setRooms(prev => prev.filter(r => r.id !== roomId));
                if (currentRoom?.id === roomId) setCurrentRoom(null);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete room");
            console.error("Delete room error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentRoom]);

    return (
        <WatchAlongContext.Provider
            value={{
                // State
                matches,
                currentMatch,
                chats,
                predictions,
                quizQuestions,
                activeQuizQuestion,
                leaderboard,
                emojiReactions,
                rooms,
                currentRoom,
                loading,
                error,

                // Match methods
                fetchMatches,
                fetchMatchById,
                createMatch,
                updateMatch,
                deleteMatch,

                // Chat methods
                fetchChats,
                sendChatMessage,
                deleteChatMessage,

                // Prediction methods
                fetchPredictions,
                createPrediction,
                votePrediction,
                togglePredictionStatus,

                // Quiz methods
                fetchQuizQuestions,
                fetchLeaderboard,
                createQuizQuestion,
                submitQuizAnswer,
                toggleQuizQuestion,

                // Emoji methods
                fetchEmojiReactions,
                sendEmojiReaction,
                resetEmojiReactions,

                // Room methods
                fetchRooms,
                fetchRoomById,
                createRoom,
                updateRoom,
                deleteRoom,
            }}
        >
            {children}
        </WatchAlongContext.Provider>
    );
};