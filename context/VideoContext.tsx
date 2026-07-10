"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

interface PlayerInfo {
    playerName?: string;
    chapter?: string;
    chapterNumber?: number;
}

export interface VideoFile {
    id: string;
    title: string;
    fileName: string;
    url: string;
    duration: string;
    durationSeconds: number;
    size: number;
    sizeFormatted: string;
    format: string;
    width: number;
    height: number;
    createdAt: string;
    createdAtFormatted: string;
    folder: string;
    playerInfo?: PlayerInfo;
}

interface VideoContextType {
    videoFiles: VideoFile[];
    loading: boolean;
    error: string | null;
}

const VideoContext = createContext<VideoContextType>({
    videoFiles: [],
    loading: true,
    error: null,
});

export function VideoProvider({ children }: { children: ReactNode }) {
    const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios
            .get("/api/cloudinary/video?limit=50")
            .then((res) => {
                if (res.data.success) {
                    setVideoFiles(res.data.videoFiles);
                     console.log("Fetched videos:", res.data.videoFiles);
                } else {
                    setError("Failed to load videos.");
                }
            })
          
            .catch(() => setError("Failed to load videos."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <VideoContext.Provider value={{ videoFiles, loading, error }}>
            {children}
        </VideoContext.Provider>
    );
}

export const useVideo = () => useContext(VideoContext);