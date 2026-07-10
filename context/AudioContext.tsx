"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

interface MatchInfo {
    team1?: string;
    team2?: string;
    type?: string;
    speaker?: string;
    date?: string;
}

export interface AudioFile {
    id: string;
    title: string;
    url: string;
    duration: string;
    createdAt: string;
    matchInfo?: MatchInfo;
}

interface AudioContextType {
    audioFiles: AudioFile[];
    loading: boolean;
    error: string | null;
}

const AudioContext = createContext<AudioContextType>({
    audioFiles: [],
    loading: true,
    error: null,
});

export function AudioProvider({ children }: { children: ReactNode }) {
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios
            .get("/api/cloudinary/audio?limit=50")
            .then((res) => {
                if (res.data.success) setAudioFiles(res.data.audioFiles);
                else setError("Failed to load audio.");
            })
            .catch(() => setError("Failed to load audio."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AudioContext.Provider value={{ audioFiles, loading, error }}>
            {children}
        </AudioContext.Provider>
    );
}

export const useAudio = () => useContext(AudioContext);