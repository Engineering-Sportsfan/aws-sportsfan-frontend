// Main Frontend: context/AudioContext.tsx
"use client";

import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

interface AudioMessage {
    id: string;
    audioId: string;
    audioTitle: string;
    userId: string;
    userName: string;
    message: string;
    rating: number | null;
    createdAt: number;
}

interface AudioContextType {
    sendMessage: (audioId: string, audioTitle: string, message: string, rating?: number) => Promise<boolean>;
    getMessages: (audioId: string) => Promise<AudioMessage[]>;
    loading: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error("useAudio must be used within AudioProvider");
    return context;
};

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(false);

    // Get userId from localStorage or create new
    const getUserId = () => {
        let userId = localStorage.getItem("audio_user_id");
        if (!userId) {
            userId = `user_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("audio_user_id", userId);
        }
        return userId;
    };

    const getUserName = () => {
        let userName = localStorage.getItem("audio_user_name");
        if (!userName) {
            userName = `Fan_${Math.random().toString(36).substr(2, 5)}`;
            localStorage.setItem("audio_user_name", userName);
        }
        return userName;
    };

    const sendMessage = useCallback(async (audioId: string, audioTitle: string, message: string, rating?: number) => {
        setLoading(true);
        try {
            // Call admin panel API directly
            const response = await axios.post("api/audio-messages", {
                audioId,
                audioTitle,
                userId: getUserId(),
                userName: getUserName(),
                message,
                rating
            });
            
            return response.data.success;
        } catch (error) {
            console.error("Error sending message:", error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getMessages = useCallback(async (audioId: string) => {
        setLoading(true);
        try {
            // Call admin panel API directly
            const response = await axios.get(`api/audio-messages?audioId=${audioId}`);
            return response.data.messages || [];
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AudioContext.Provider value={{ sendMessage, getMessages, loading }}>
            {children}
        </AudioContext.Provider>
    );
};