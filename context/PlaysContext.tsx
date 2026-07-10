// context/PlaysContext.tsx
"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import axios from "axios";

type PlaysMap = Record<string, number>;

interface PlaysContextValue {
    playsMap: PlaysMap;
    fetchPlays: () => Promise<void>;
    incrementPlay: (id: string) => Promise<number>;
}

const PlaysContext = createContext<PlaysContextValue>({
    playsMap: {},
    fetchPlays: async () => {},
    incrementPlay: async () => 0,
});

export function PlaysProvider({ children }: { children: ReactNode }) {
    const [playsMap, setPlaysMap] = useState<PlaysMap>({});

    const fetchPlays = useCallback(async () => {
        try {
            const res = await axios.get("/api/cloudinary/plays");
            if (res.data.plays) setPlaysMap(res.data.plays);
        } catch (err) {
            console.error("[PlaysContext] fetchPlays error:", err);
        }
    }, []);

    const incrementPlay = useCallback(async (id: string): Promise<number> => {
        try {
            const res = await axios.post("/api/cloudinary/plays", { id });
            if (res.data.success) {
                setPlaysMap((prev) => ({ ...prev, [id]: res.data.plays }));
                return res.data.plays as number;
            }
        } catch (err) {
            console.error("[PlaysContext] incrementPlay error:", err);
        }
        return 0;
    }, []);

    return (
        <PlaysContext.Provider value={{ playsMap, fetchPlays, incrementPlay }}>
            {children}
        </PlaysContext.Provider>
    );
}

export function usePlays() {
    return useContext(PlaysContext);
}