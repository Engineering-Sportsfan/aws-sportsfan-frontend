"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface PlaylistDialogProps {
    open: boolean;
    onClose: () => void;
    itemId: string;
    itemType: "audio" | "video" | "article" | "teams360" | "players360";
    userId: string | null;
}

interface Playlist {
    id: string;
    name: string;
    audioIds: string[];          
}

export default function PlaylistDialog({ open, onClose, itemId, itemType, userId }: PlaylistDialogProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [creatingPlaylist, setCreatingPlaylist] = useState(false);

    useEffect(() => {
        if (!open) return;
        setPlaylistName("");
        fetchPlaylists();
    }, [open]);

    const fetchPlaylists = async () => {
        if (!userId) return;
        setPlaylistsLoading(true);
        try {
            const res = await axios.get(`/api/playlists?userId=${userId}`);
            setPlaylists(res.data.playlists || []);
        } catch (err) {
            console.error("Error fetching playlists:", err);
            setPlaylists([]);
        } finally {
            setPlaylistsLoading(false);
        }
    };
//need to look at it
    const handleCreatePlaylist = async () => {
        if (!playlistName.trim() || !userId) return;
        setCreatingPlaylist(true);
        try {
            const res = await axios.post("/api/playlists", { userId, name: playlistName.trim() });
            if (res.data.success) {
                setPlaylists((prev) => [...prev, res.data.playlist]);
                setPlaylistName("");
            }
        } catch (err) {
            console.error("Error creating playlist:", err);
        } finally {
            setCreatingPlaylist(false);
        }
    };
//done
    const handleToggleItem = async (playlistId: string, isAdded: boolean) => {
        if (!itemId) return;
        const action = isAdded ? "remove" : "add";

        // Optimistic update
        setPlaylists((prev) =>
            prev.map((p) =>
                p.id === playlistId
                    ? {
                        ...p,
                        audioIds:
                            action === "add"
                                ? [...p.audioIds, itemId]
                                : p.audioIds.filter((id) => id !== itemId),
                    }
                    : p
            )
        );

        try {
            // audioId field name kept as-is to match existing API contract
            await axios.put("/api/playlists", { playlistId, userId, action, audioId: itemId });
        } catch (err) {
            console.error("Error updating playlist:", err);
            // Revert on failure (undo the optimistic update)
            setPlaylists((prev) =>
                prev.map((p) =>
                    p.id === playlistId
                        ? {
                            ...p,
                            audioIds:
                                action === "add"
                                    ? p.audioIds.filter((id) => id !== itemId) // undo add
                                    : [...p.audioIds, itemId],                 // undo remove
                        }
                        : p
                )
            );
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
            <div className="relative w-[300px] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3a0a0a] via-[#1a0505] to-[#0d0d10]" />

                <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#C9115F]/20 text-[#C9115F] border border-[#C9115F]/40 font-medium tracking-wide">
                            {playlists.length > 0 ? "Your Playlists" : "New Playlist"}
                        </span>
                        <button onClick={onClose} className="text-[#555] hover:text-white transition">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {playlistsLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9115F]" />
                        </div>
                    ) : playlists.length > 0 ? (
                        <>
                            <h2 className="text-white text-[16px] font-semibold mb-3">
                                Add {itemType === "video" ? "Video" : itemType === "audio" ? "Audio" : "Article"} to Playlist
                            </h2>

                            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto mb-4 pr-1">
                                {playlists.map((pl) => {
                                    const isAdded = pl.audioIds.includes(itemId);
                                    return (
                                        <div
                                            key={pl.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleToggleItem(pl.id, isAdded)}
                                            onKeyDown={(e) => e.key === "Enter" && handleToggleItem(pl.id, isAdded)}
                                            className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/10 transition select-none"
                                        >
                                            {/* Visual-only checkbox */}
                                            <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isAdded ? "bg-[#C9115F] border-[#C9115F]" : "border-[#555] bg-transparent"}`}>
                                                {isAdded && (
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-white text-[13px] font-medium flex-1 truncate">{pl.name}</span>
                                            <span className="text-[#555] text-[10px] flex-shrink-0">{pl.audioIds.length} drops</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <p className="text-[#888] text-[11px] mb-2 uppercase tracking-wider">New playlist</p>
                                <input
                                    type="text"
                                    value={playlistName}
                                    onChange={(e) => setPlaylistName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                                    placeholder="Playlist name"
                                    className="w-full bg-white/5 text-white text-[13px] rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-[#C9115F]/60 placeholder-[#555] mb-3"
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleCreatePlaylist} disabled={!playlistName.trim() || creatingPlaylist} className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e0185a] text-white text-[13px] font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                                        {creatingPlaylist ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />Creating...</> : "Create"}
                                    </button>
                                    <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-[#2a2a2e] text-[#ccc] text-[13px] font-semibold hover:bg-[#3a3a3e] transition">Done</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-white text-[22px] font-semibold mb-4">Enter playlist name</h2>
                            <input
                                type="text"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                                placeholder="Playlist name"
                                autoFocus
                                className="w-full bg-[#ffffff10] text-white text-[14px] rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-[#C9115F]/60 placeholder-[#555] mb-6"
                            />
                            <div className="flex items-center gap-3">
                                <button onClick={handleCreatePlaylist} disabled={!playlistName.trim() || creatingPlaylist} className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e0185a] text-white text-[14px] font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {creatingPlaylist ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Creating...</> : "Create"}
                                </button>
                                <button onClick={onClose} className="flex-1 py-3 rounded-full bg-[#2a2a2e] text-[#ccc] text-[14px] font-semibold hover:bg-[#3a3a3e] transition">Cancel</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}