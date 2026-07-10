"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Playlist {
    id: string;
    name: string;
    audioIds: string[];
    createdAt: number;
    updatedAt: number;
}

interface DropItem {
    id: string;
    title: string;
    url: string;
    duration: string;
    type: "audio" | "video" | "article" | "club";
    subtitle: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlayIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 2L10 6L3 10V2Z" fill="currentColor" />
        </svg>
    );
}

function AudioIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 9v-2C3 4.686 5.239 2.5 8 2.5S13 4.686 13 7v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <rect x="2" y="8.5" width="3" height="5" rx="1.5" fill="currentColor" />
            <rect x="11" y="8.5" width="3" height="5" rx="1.5" fill="currentColor" />
        </svg>
    );
}

function VideoIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M11 6l4-2v8l-4-2V6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
    );
}

function ArticleIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1.5" y="1.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3.5 4h5M3.5 6h4M3.5 8h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
    );
}

function ClubIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
            <path d="M17 3.5a4 4 0 0 1 0 7" />
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

function EditIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
    );
}

function PlaylistIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <path d="M3 5h10M3 9h8M3 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16" cy="13" r="3" stroke="currentColor" strokeWidth="1.4" />
            <path d="M16 11.5V9.5l2.5-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Confirm Remove Drop Modal ────────────────────────────────────────────────

function ConfirmRemoveModal({ item, onConfirm, onCancel, loading }: {
    item: DropItem;
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
                <h3 className="text-white text-[15px] font-semibold text-center mb-1">Remove from Playlist</h3>
                <p className="text-[#888] text-[12px] text-center mb-5">
                    Remove &quot;{item.title}&quot; from this playlist?
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
                        {loading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /> : "Remove"}
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

// ─── Drop Card ────────────────────────────────────────────────────────────────

function DropCard({ item, playlistId, onRemove }: {
    item: DropItem;
    playlistId: string;
    onRemove: () => void;
}) {
    const router = useRouter();

    const getRoute = () => {
        const playlistQuery = `&from=playlist&playlistId=${encodeURIComponent(playlistId)}`;
        if (item.type === "video") return `/MainModules/MatchesDropContent/VideoDropScreen?id=${item.id}${playlistQuery}`;
        if (item.type === "audio") return `/MainModules/MatchesDropContent/AudioDropScreen?id=${item.id}${playlistQuery}`;
        if (item.type === "article") return `/MainModules/CricketArticles/${item.id}`;
        return `/MainModules/ClubProfileScreen/${item.id}`;
    };

    const typeBadgeClass = {
        audio: "bg-[#C9115F]/15 text-[#C9115F]",
        video: "bg-blue-500/15 text-blue-400",
        article: "bg-green-500/15 text-green-400",
        club: "bg-purple-500/15 text-purple-400",
    }[item.type];

    const typeLabel = {
        audio: "Audio",
        video: "Video",
        article: "Article",
        club: "Club",
    }[item.type];

    const TypeIcon = () => {
        if (item.type === "video") return <VideoIcon />;
        if (item.type === "audio") return <AudioIcon />;
        if (item.type === "article") return <ArticleIcon />;
        return <ClubIcon />;
    };

    return (
        <div className="group flex items-center gap-3 bg-[#1a1a1e] hover:bg-[#202026] border border-white/5 hover:border-[#C9115F]/20 rounded-xl px-3 py-3 transition-all duration-200">
            <button
                onClick={() => router.push(getRoute())}
                className="w-9 h-9 rounded-full bg-[#C9115F]/20 hover:bg-[#C9115F] flex items-center justify-center flex-shrink-0 text-[#C9115F] hover:text-white transition-all duration-200"
            >
                {item.type === "article" ? <ArticleIcon /> : item.type === "club" ? <ClubIcon /> : <PlayIcon />}
            </button>

            <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => router.push(getRoute())}
            >
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md ${typeBadgeClass}`}>
                        <TypeIcon />
                        {typeLabel}
                    </span>
                </div>
                <p className="text-white text-[13px] font-medium truncate leading-tight">{item.title}</p>
                <p className="text-[#666] text-[11px] truncate mt-0.5">{item.subtitle}</p>
            </div>

            <span className="text-[#555] text-[11px] font-mono flex-shrink-0">{item.duration}</span>

            <button
                onClick={onRemove}
                className="w-7 h-7 rounded-lg bg-transparent hover:bg-red-500/15 flex items-center justify-center text-[#555] hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                title="Remove from playlist"
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    );
}

// ─── Main Page 
export default function PlaylistDetailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname(); // Use usePathname instead of useParams
    
    // Extract playlist ID from the URL path
    const playlistId = pathname.split("/").pop(); // Gets the last part of the URL
    
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [dropItems, setDropItems] = useState<DropItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [mediaLoading, setMediaLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [renameTarget, setRenameTarget] = useState<Playlist | null>(null);
    const [removeTarget, setRemoveTarget] = useState<DropItem | null>(null);
    const [renameLoading, setRenameLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);

    const getUserId = () => user?.userId || null;

    // Debug logs
    console.log("🔍 Pathname:", pathname);
    console.log("🔍 Extracted Playlist ID:", playlistId);

    // ── Fetch single playlist directly using playlistId parameter ────────────────
    useEffect(() => {
        const userId = getUserId();
        console.log("🔍 PlaylistDetailPage - User ID:", userId);
        console.log("🔍 PlaylistDetailPage - Playlist ID:", playlistId);
        
        if (!userId || !playlistId) { 
            console.log("❌ Missing userId or playlistId");
            setLoading(false); 
            return; 
        }

        const fetchPlaylist = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `/api/playlists?userId=${userId}&playlistId=${playlistId}`;
                console.log("Fetching playlist from URL:", url);
                
                const res = await axios.get(url);
                console.log("API Response:", res.data);
                
                if (res.data.success && res.data.playlist) {
                    console.log(" Playlist found:", res.data.playlist);
                    setPlaylist(res.data.playlist);
                } else {
                    console.log(" Playlist not found in response");
                    setError("Playlist not found");
                    setPlaylist(null);
                }
            } catch (err: unknown) {
                console.error(" Error fetching playlist:", err instanceof Error ? err.message : "Unknown error");
                setError("Failed to load playlist");
                setPlaylist(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, [user, playlistId]);

    // ── Fetch all media and resolve drops ─────────────────────────────────────
 // ── Fetch all media and resolve drops ─────────────────────────────────────
useEffect(() => {
    if (!playlist) {
        console.log("⏭️ Skipping media fetch - no playlist");
        return;
    }

    console.log("🎬 Fetching media for playlist:", playlist.name);
    console.log("📋 Audio IDs in playlist:", playlist.audioIds);

    const fetchAllMedia = async () => {
        setMediaLoading(true);
        try {
            console.log("📡 Fetching audio, video, articles, clubs...");
            
            // Use Promise.allSettled instead of Promise.all to handle individual failures
            const results = await Promise.allSettled([
                axios.get("/api/cloudinary/audio?limit=200"),
                axios.get("/api/cloudinary/video?limit=200"),
                axios.get("/api/cricket-articles?limit=200"),
                axios.get("/api/club-profiles?limit=200"),
            ]);

            const map = new Map<string, DropItem>();

            // Process audio files (index 0)
            if (results[0].status === "fulfilled" && results[0].value.data.success) {
                for (const a of results[0].value.data.audioFiles) {
                    const subtitle = a.matchInfo?.type
                        ? `${a.matchInfo.type.replace(/_/g, " ")} — ${a.matchInfo.team1 ?? ""} vs ${a.matchInfo.team2 ?? ""}`
                        : "Audio Drop";
                    map.set(a.id, { id: a.id, title: a.title, url: a.url, duration: a.duration, type: "audio", subtitle });
                }
                console.log("✅ Audio files count:", results[0].value.data.audioFiles?.length || 0);
            } else {
                console.warn("⚠️ Audio files fetch failed:", results[0].status === "rejected" ? results[0].reason : "No data");
            }

            // Process video files (index 1)
            if (results[1].status === "fulfilled" && results[1].value.data.success) {
                for (const v of results[1].value.data.videoFiles) {
                    const subtitle = v.playerInfo?.playerName
                        ? `${v.playerInfo.playerName} · Chapter ${v.playerInfo.chapterNumber}`
                        : "Video Drop";
                    map.set(v.id, { id: v.id, title: v.title, url: v.url, duration: v.duration, type: "video", subtitle });
                }
                console.log("✅ Video files count:", results[1].value.data.videoFiles?.length || 0);
            } else {
                console.warn("⚠️ Video files fetch failed");
            }

            // Process articles (index 2)
            if (results[2].status === "fulfilled" && results[2].value.data.success && results[2].value.data.articles) {
                for (const a of results[2].value.data.articles) {
                    map.set(a.id, {
                        id: a.id, title: a.title,
                        url: `/MainModules/CricketArticles/${a.id}`,
                        duration: a.readTime || "5 min",
                        type: "article",
                        subtitle: `${a.badge || "Article"} • ${a.views || "0"} views`,
                    });
                }
                console.log("✅ Articles count:", results[2].value.data.articles?.length || 0);
            } else {
                console.warn("⚠️ Articles fetch failed");
            }

            // Process club profiles (index 3) - skip if fails
            if (results[3].status === "fulfilled" && results[3].value.data.success && results[3].value.data.clubs) {
                for (const c of results[3].value.data.clubs) {
                    map.set(c.id, {
                        id: c.id, title: c.name,
                        url: `/MainModules/ClubProfileScreen/${c.id}`,
                        duration: "Club",
                        type: "club",
                        subtitle: `${c.league || "Cricket"} • ${c.stats?.points || "0"} pts`,
                    });
                }
                console.log("✅ Clubs count:", results[3].value.data.clubs?.length || 0);
            } else {
                console.warn("⚠️ Clubs fetch failed (404 expected if no club profiles)");
            }

            console.log("🗺️ Total items in map:", map.size);
            console.log("🔍 Looking up playlist items...");

            const resolved = playlist.audioIds
                .map(id => {
                    const item = map.get(id);
                    if (!item) {
                        console.log(`⚠️ Item not found in map: ${id}`);
                    }
                    return item;
                })
                .filter(Boolean) as DropItem[];

            console.log(`✅ Resolved ${resolved.length} out of ${playlist.audioIds.length} items`);
            setDropItems(resolved);
        } catch (err) {
            console.error("❌ Error fetching media:", err);
        } finally {
            setMediaLoading(false);
        }
    };

    fetchAllMedia();
}, [playlist]);

    // ── Rename ────────────────────────────────────────────────────────────────
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
                setPlaylist(res.data.playlist);
                setRenameTarget(null);
            }
        } catch (err) {
            console.error("Rename error:", err);
        } finally {
            setRenameLoading(false);
        }
    };

    // ── Remove drop ───────────────────────────────────────────────────────────
    const handleRemoveDrop = async (itemId: string) => {
        if (!playlist) return;
        setRemoveLoading(true);
        try {
            const res = await axios.put("/api/playlists", {
                playlistId: playlist.id,
                userId: getUserId(),
                action: "remove",
                audioId: itemId,
            });
            if (res.data.success) {
                setPlaylist(res.data.playlist);
                setDropItems(prev => prev.filter(d => d.id !== itemId));
                setRemoveTarget(null);
            }
        } catch (err) {
            console.error("Remove drop error:", err);
        } finally {
            setRemoveLoading(false);
        }
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C9115F]" />
            </div>
        );
    }

    // ── Error / Not found state ───────────────────────────────────────────────
    if (error || !playlist) {
        return (
            <div className="min-h-screen bg-[#0d0d10] flex flex-col items-center justify-center gap-4 p-4">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1e] flex items-center justify-center text-[#444]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <circle cx="12" cy="16" r="0.5" fill="currentColor" />
                    </svg>
                </div>
                <p className="text-[#666] text-[14px]">{error || "Playlist not found."}</p>
                <button
                    onClick={() => router.push("/MainModules/Playlists")}
                    className="px-4 py-2 rounded-xl bg-[#C9115F] text-white text-[13px] font-medium hover:bg-[#e0185a] transition"
                >
                    Back to Playlists
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d10]">
            <div className="max-w-3xl mx-auto px-4 py-6 pb-20">

                <Link
                    href="/MainModules/Playlists"
                    className="inline-flex items-center gap-2 text-[#666] hover:text-white mb-6 transition text-sm"
                >
                    <ArrowLeft size={16} />
                    My Playlists
                </Link>

                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9115F]/30 to-[#3a0a0a] flex items-center justify-center flex-shrink-0 text-[#C9115F]">
                            <PlaylistIcon size={20} />
                        </div>
                        <div>
                            <h1 className="text-white text-[20px] font-semibold leading-tight">{playlist.name}</h1>
                            <p className="text-[#666] text-[12px] mt-0.5">
                                {playlist.audioIds.length} drop{playlist.audioIds.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setRenameTarget(playlist)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1e22] text-[#aaa] hover:text-white hover:bg-[#2a2a2e] text-[12px] font-medium transition"
                    >
                        <EditIcon />
                        Rename
                    </button>
                </div>

                {mediaLoading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[60px] bg-[#1a1a1e] rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : dropItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#1a1a1e] flex items-center justify-center mb-4 text-[#444]">
                            <PlaylistIcon size={22} />
                        </div>
                        <p className="text-[#555] text-[13px]">No drops in this playlist yet.</p>
                        <p className="text-[#444] text-[11px] mt-1">
                            Open any Audio, Video, Article, or Club and tap the playlist icon to add it.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {dropItems.map(item => (
                            <div
                                key={item.id}
                                className={removeTarget?.id === item.id ? "opacity-40 pointer-events-none" : ""}
                            >
                                <DropCard
                                    item={item}
                                    playlistId={playlist.id}
                                    onRemove={() => setRemoveTarget(item)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {renameTarget && (
                <RenameModal
                    playlist={renameTarget}
                    onConfirm={handleRename}
                    onCancel={() => setRenameTarget(null)}
                    loading={renameLoading}
                />
            )}
            {removeTarget && (
                <ConfirmRemoveModal
                    item={removeTarget}
                    onConfirm={() => handleRemoveDrop(removeTarget.id)}
                    onCancel={() => setRemoveTarget(null)}
                    loading={removeLoading}
                />
            )}
        </div>
    );
}