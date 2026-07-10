"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Playlist {
    id: string;
    name: string;
    audioIds: string[];
    createdAt: number;
    updatedAt: number;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlaylistIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <path d="M3 5h10M3 9h8M3 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16" cy="13" r="3" stroke="currentColor" strokeWidth="1.4" />
            <path d="M16 11.5V9.5l2.5-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4"
                stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronRight() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({ playlist, onConfirm, onCancel, loading }: {
    playlist: Playlist;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onCancel}>
            <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl p-6 w-[280px] shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center mb-4 mx-auto text-red-400">
                    <TrashIcon />
                </div>
                <h3 className="text-white text-[15px] font-semibold text-center mb-1">Delete Playlist</h3>
                <p className="text-[#888] text-[12px] text-center mb-5">
                    &quot;{playlist.name}&quot; will be permanently deleted.
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl bg-[#2a2a2e] text-[#ccc] text-[13px] font-medium hover:bg-[#3a3a3e] transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                        {loading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /> : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Rename Modal ─────────────────────────────────────────────────────────────

function RenameModal({ playlist, onConfirm, onCancel, loading }: {
    playlist: Playlist;
    onConfirm: (name: string) => void;
    onCancel: () => void;
    loading: boolean;
}) {
    const [name, setName] = useState(playlist.name);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onCancel}>
            <div className="relative w-[300px] rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3a0a0a] via-[#1a0505] to-[#0d0d10]" />
                <div className="relative p-6">
                    <div className="flex items-center justify-between mb-5">
                        <span className="text-[11px] px-3 py-1 rounded-full bg-[#C9115F]/20 text-[#C9115F] border border-[#C9115F]/40 font-medium tracking-wide">
                            Rename Playlist
                        </span>
                        <button onClick={onCancel} className="text-[#555] hover:text-white transition">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    <h2 className="text-white text-[18px] font-semibold mb-4">Enter new name</h2>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && name.trim() && onConfirm(name.trim())}
                        placeholder="Playlist name"
                        autoFocus
                        className="w-full bg-[#ffffff10] text-white text-[14px] rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-[#C9115F]/60 placeholder-[#555] mb-5"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={() => name.trim() && onConfirm(name.trim())}
                            disabled={!name.trim() || loading}
                            className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e0185a] text-white text-[13px] font-semibold hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                        >
                            {loading && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />}
                            Save
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-full bg-[#2a2a2e] text-[#ccc] text-[13px] font-semibold hover:bg-[#3a3a3e] transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlaylistsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [renameTarget, setRenameTarget] = useState<Playlist | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);
    const [renameLoading, setRenameLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const getUserId = () => user?.userId || null;

    useEffect(() => {
        const userId = getUserId();
        if (!userId) { setLoading(false); return; }
        fetchPlaylists(userId);
    }, [user]);

    const fetchPlaylists = async (userId: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/playlists?userId=${userId}`);
            setPlaylists(res.data.playlists || []);
        } catch (err) {
            console.error("Error fetching playlists:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRename = async (newName: string) => {
        if (!renameTarget) return;
        setRenameLoading(true);
        try {
            const res = await axios.put("/api/playlists", {
                playlistId: renameTarget.id,
                userId: getUserId(),
                action: "rename",
                name: newName,
            });
            if (res.data.success) {
                const updated = res.data.playlist;
                setPlaylists(prev => prev.map(p => p.id === updated.id ? updated : p));
                setRenameTarget(null);
            }
        } catch (err) {
            console.error("Rename error:", err);
        } finally {
            setRenameLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await axios.delete(`/api/playlists?playlistId=${deleteTarget.id}&userId=${getUserId()}`);
            setPlaylists(prev => prev.filter(p => p.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d10]">
            <div className="max-w-3xl mx-auto px-4 py-6 pb-20">

                <Link
                    href="/MainModules/HomePage"
                    className="inline-flex items-center gap-2 text-[#666] hover:text-white mb-6 transition text-sm"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-white text-[22px] font-semibold">My Playlists</h1>
                        <p className="text-[#666] text-[12px] mt-0.5">
                            {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#1e1e22] flex items-center justify-center text-[#C9115F]">
                        <PlaylistIcon size={18} />
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[72px] bg-[#1a1a1e] rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : playlists.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {playlists.map((pl, idx) => (
                            <div
                                key={pl.id}
                                className="group relative flex items-center gap-4 bg-[#111114] hover:bg-[#16161a] border border-[#1e1e22] hover:border-[#C9115F]/25 rounded-2xl px-4 py-4 transition-all duration-200 cursor-pointer"
                                style={{ animationDelay: `${idx * 40}ms` }}
                                onClick={() => router.push(`/MainModules/Playlists/${pl.id}`)}
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9115F]/30 to-[#3a0a0a] flex items-center justify-center flex-shrink-0 text-[#C9115F]">
                                    <PlaylistIcon size={20} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-[14px] font-medium truncate">{pl.name}</p>
                                    <p className="text-[#555] text-[11px] mt-0.5">
                                        {pl.audioIds.length} drop{pl.audioIds.length !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                        onClick={e => { e.stopPropagation(); setRenameTarget(pl); }}
                                        className="w-7 h-7 rounded-lg bg-[#2a2a2e] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#3a3a3e] transition"
                                        title="Rename"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); setDeleteTarget(pl); }}
                                        className="w-7 h-7 rounded-lg bg-[#2a2a2e] flex items-center justify-center text-red-400 hover:bg-red-500/15 transition"
                                        title="Delete"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>

                                <ChevronRight />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-[#1a1a1e] flex items-center justify-center mb-4 text-[#444]">
                            <PlaylistIcon size={24} />
                        </div>
                        <p className="text-[#666] text-[14px] font-medium">No saved playlists yet</p>
                        <p className="text-[#444] text-[12px] mt-1 max-w-[220px]">
                            Open any Audio, Video, Article, or Club and tap the playlist icon to create one.
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {renameTarget && (
                <RenameModal
                    playlist={renameTarget}
                    onConfirm={handleRename}
                    onCancel={() => setRenameTarget(null)}
                    loading={renameLoading}
                />
            )}
            {deleteTarget && (
                <ConfirmDeleteModal
                    playlist={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
}