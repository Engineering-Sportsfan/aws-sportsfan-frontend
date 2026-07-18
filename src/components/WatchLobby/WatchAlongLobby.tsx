
"use client";

import { useWatchAlong, Room, Match } from "@/context/WatchAlongContext";
import { Share2, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";

type Props = {
    onEnterRoom: (roomId: string) => void;
};

export default function WatchAlongLobby({ onEnterRoom }: Props) {
    const [activeTab, setActiveTab] = useState(0);
    const [shareRoom, setShareRoom] = useState<Room | null>(null);
    const [copied, setCopied] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const { data: session } = useSession();
    const { user: authUser } = useAuth();

    const {
        rooms,
        createRoom,
        fetchRooms,
        matches,
        fetchMatches,
        loading,
        error
    } = useWatchAlong();

    useEffect(() => {
        fetchRooms();
        fetchMatches();
    }, [fetchRooms, fetchMatches]);

    const getMatchForRoom = (liveMatchId: string) => {
        return matches.find(m => m.id === liveMatchId);
    };

    const buildShareUrl = (roomId: string) => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/MainModules/WatchAlong/share/${roomId}`;
    };

    const buildShareText = (room: Room, match?: Match) => {
        const previewLink = buildShareUrl(room.id);
        const matchText = match ? `Live match: ${match.team1?.name || "Team 1"} vs ${match.team2?.name || "Team 2"}` : "Live match updates and fan chat";
        return [
            `Join ${room.name} in Watch Along - Women's T20 World Cup & FIFA`,
            room.role,
            matchText,
            `View and join: ${previewLink}`,
        ].filter(Boolean).join("\n");
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            try {
                const input = document.createElement("textarea");
                input.value = text;
                input.style.position = "fixed";
                input.style.opacity = "0";
                document.body.appendChild(input);
                input.focus();
                input.select();
                const ok = document.execCommand("copy");
                document.body.removeChild(input);
                return ok;
            } catch {
                return false;
            }
        }
    };

    const openShare = (room: Room) => {
        setShareRoom(room);
        setCopied(false);
    };

    const closeShare = () => {
        setShareRoom(null);
        setCopied(false);
    };

    const handleShareToWhatsApp = () => {
        if (!shareRoom) return;
        const match = getMatchForRoom(shareRoom.liveMatchId);
        const shareText = buildShareText(shareRoom, match);
        const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
        const whatsappWebFallbackUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        const opened = window.open(whatsappAppUrl, "_self");
        if (!opened) window.location.href = whatsappWebFallbackUrl;
    };

    const handleShareToThreads = () => {
        if (!shareRoom) return;
        const shareText = buildShareText(shareRoom, getMatchForRoom(shareRoom.liveMatchId));
        window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
    };

    const handleShareToInstagram = async () => {
        if (!shareRoom) return;
        const shareText = buildShareText(shareRoom, getMatchForRoom(shareRoom.liveMatchId));
        await copyToClipboard(shareText);
        setCopied(true);
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
        setTimeout(() => setCopied(false), 1600);
    };

    const handleCopyLink = async () => {
        if (!shareRoom) return;
        const ok = await copyToClipboard(buildShareText(shareRoom, getMatchForRoom(shareRoom.liveMatchId)));
        if (!ok) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    if (loading && rooms.length === 0) {
        return (
            <div className="min-h-screen bg-[#111] text-white font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading watch along rooms...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#111] text-white font-sans flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => { fetchRooms(); fetchMatches(); }}
                        className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Split rooms
    // Filter rooms by active tab
    const filteredRooms = rooms.filter((room) => {
        const tag = ["ALL", "LIVE", "Cricket", "Football"][activeTab];
        if (tag === "ALL") return true;
        if (tag === "LIVE") return room.isLive;

        const sport = (room.sport || "").toLowerCase();
        const text = `${room.name}`.toLowerCase();
        
        if (tag === "Cricket") {
            return sport === "cricket" || text.includes("cricket") || text.includes("ipl") || text.includes("t20") || text.includes("wc");
        }
        if (tag === "Football") {
            return sport === "football" || text.includes("football") || text.includes("soccer") || text.includes("fifa") || text.includes("isl");
        }
        return true;
    });

    const liveRooms = filteredRooms.filter(r => r.isLive);
    const upcomingRooms = filteredRooms.filter(r => !r.isLive);

    // Sport gradient based on room/match keywords
    const getGradient = (room: Room, match?: Match) => {
        const text = `${room.name} ${match?.tournament || ""}`.toLowerCase();
        if (text.includes("cricket") || text.includes("ipl") || text.includes("t20") || text.includes("ind") || text.includes("pak")) {
            return "linear-gradient(135deg, #e91e8c 0%, #ff6b35 100%)";
        }
        if (text.includes("football") || text.includes("soccer") || text.includes("fifa") || text.includes("isl")) {
            return "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";
        }
        if (text.includes("wc") || text.includes("world cup") || text.includes("final")) {
            return "linear-gradient(135deg, #059669 0%, #0ea5e9 100%)";
        }
        return "linear-gradient(135deg, #e91e8c 0%, #ff6b35 100%)";
    };

    return (
        <div className="relative min-h-screen bg-black text-white font-sans w-full">
            <div className="w-full pb-24 px-4 sm:px-6 lg:px-8">
                <style>{`
  .watch-along-bar { left: 0; }
  @media (min-width: 1024px) {
    .watch-along-bar { left: var(--sidebar-width, 84px); }
  }
`}</style>

                {/* Fixed top bar */}
                <div
                    className="watch-along-bar"
                    style={{
                        position: "fixed", top: 0, right: 0, zIndex: 200,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px 12px",
                        background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        transition: "left 0.3s ease-out",
                    }}
                >
                    <Link href="/MainModules/ROAR" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "white" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: "4px 2px", display: "flex", alignItems: "center" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <div>
                            <h3 style={{ color: "white", margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1.2 }}>
                                📺 Watch Along
                            </h3>
                            <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: 11 }}>Join live rooms with friends</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            background: "linear-gradient(90deg, #e91e8c, #ff6b35)",
                            border: "none", borderRadius: 999, color: "white",
                            fontSize: 13, fontWeight: 700, padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap",
                        }}
                    >
                        + Create
                    </button>
                </div>
                {/* Spacer */}
                <div style={{ height: 68 }} />

                {/* Filter pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-3 mb-5" style={{ scrollbarWidth: "none" }}>
                    {["ALL", "LIVE", "Cricket", "Football"].map((tag, i) => (
                        <button
                            key={tag}
                            onClick={() => setActiveTab(i)}
                            className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer"
                            style={{
                                background: activeTab === i ? (tag === "ALL" ? "linear-gradient(90deg,#e91e8c,#ff6b35)" : "#1e1e1e") : "#1a1a1a",
                                border: activeTab === i && tag !== "ALL" ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                                color: activeTab === i ? "white" : "rgba(255,255,255,0.5)",
                            }}
                        >
                            {tag === "LIVE" ? <span><span style={{ color: "#22c55e", marginRight: 4 }}>●</span>{tag}</span> : tag}
                        </button>
                    ))}
                </div>

                {/* CREATE ROOM MODAL */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-2xl font-bold text-white mb-2">Host a Watchalong</h2>
                            <p className="text-gray-400 text-sm mb-6">Create a room and instantly become the Host.</p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
                                <input
                                    type="text"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="e.g. MS Dhoni Fan Club"
                                    className="w-full bg-[#222] border border-[#444] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 px-4 rounded-lg bg-[#333] hover:bg-[#444] text-white font-medium transition">
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!newRoomName.trim()) return;
                                        setIsCreating(true);
                                        const formData = new FormData();
                                        formData.append("name", newRoomName);
                                        const currentUserId = authUser?.userId || (session?.user as { userId?: string })?.userId || session?.user?.id;
                                        if (currentUserId) formData.append("hostUserId", currentUserId);
                                        const hostName = authUser?.name || session?.user?.name;
                                        formData.append("role", hostName ? `Hosted by ${hostName}` : "Fan Host");
                                        const newRoom = await createRoom(formData);
                                        if (newRoom) onEnterRoom(newRoom.id);
                                        setIsCreating(false);
                                        setShowCreateModal(false);
                                    }}
                                    disabled={isCreating}
                                    className="flex-1 py-3 px-4 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-lg shadow-pink-500/20 transition flex items-center justify-center gap-2"
                                >
                                    {isCreating ? "Creating..." : "Create Room"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LIVE NOW */}
                {liveRooms.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Live Now</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {liveRooms.map(room => (
                                <ExpertCard
                                    key={room.id}
                                    room={room}
                                    match={getMatchForRoom(room.liveMatchId)}
                                    onEnter={() => onEnterRoom(room.id)}
                                    onShare={() => openShare(room)}
                                    gradient={getGradient(room, getMatchForRoom(room.liveMatchId))}
                                    isLive={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* UPCOMING */}
                {upcomingRooms.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[11px]">🗓️</span>
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Upcoming</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {upcomingRooms.map(room => (
                                <ExpertCard
                                    key={room.id}
                                    room={room}
                                    match={getMatchForRoom(room.liveMatchId)}
                                    onEnter={() => onEnterRoom(room.id)}
                                    onShare={() => openShare(room)}
                                    gradient={getGradient(room, getMatchForRoom(room.liveMatchId))}
                                    isLive={false}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {rooms.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No watch along rooms available.</p>
                        <p className="text-sm text-gray-600 mt-2">Check back later for live expert sessions!</p>
                    </div>
                )}

                {/* Share modal */}
                {shareRoom && (
                    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-4" onClick={closeShare}>
                        <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#3c434f] text-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="pr-4">
                                    <p className="text-2xl font-bold leading-tight">Share Expert Room</p>
                                    <p className="text-lg font-semibold mt-2">{shareRoom.name}</p>
                                    <p className="text-white/70 text-sm">{shareRoom.role}</p>
                                </div>
                                <button onClick={closeShare} className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10" aria-label="Close share dialog">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 shrink-0">
                                    <img src={shareRoom.displayPicture || "/images/share.png"} alt={shareRoom.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm">Watch Along preview</p>
                                    <p className="text-xs text-white/70 line-clamp-2">Join this room, see live match context, and share the link with the room preview image.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button onClick={handleShareToWhatsApp} className="w-full rounded-2xl px-4 py-3 bg-[#5b6472] hover:bg-[#6a7483] transition-colors flex items-center gap-3 text-left">
                                    <img src="/images/share_whatsapp.png" alt="WhatsApp" className="w-9 h-9 rounded-full object-cover" />
                                    <span className="font-semibold">Share on WhatsApp</span>
                                </button>
                                <button onClick={handleShareToThreads} className="w-full rounded-2xl px-4 py-3 bg-[#5b6472] hover:bg-[#6a7483] transition-colors flex items-center gap-3 text-left">
                                    <img src="/images/share_thread.png" alt="Threads" className="w-9 h-9 rounded-full object-cover" />
                                    <span className="font-semibold">Share on Threads</span>
                                </button>
                                <button onClick={handleShareToInstagram} className="w-full rounded-2xl px-4 py-3 bg-[#5b6472] hover:bg-[#6a7483] transition-colors flex items-center gap-3 text-left">
                                    <img src="/images/share_insta.png" alt="Instagram" className="w-9 h-9 rounded-full object-cover" />
                                    <span className="font-semibold">Share on Instagram</span>
                                </button>
                                <button onClick={handleCopyLink} className="w-full rounded-2xl px-4 py-3 bg-[#5b6472] hover:bg-[#6a7483] transition-colors flex items-center gap-3 text-left">
                                    <img src="/images/share_copy_link.png" alt="Copy Link" className="w-9 h-9 rounded-full object-cover" />
                                    <span className="font-semibold">{copied ? "Copied" : "Copy Link"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ExpertCard({
    room,
    match,
    onEnter,
    onShare,
    gradient,
    isLive,
}: {
    room: Room;
    match?: Match;
    onEnter: () => void;
    onShare: () => void;
    gradient: string;
    isLive: boolean;
}) {
    const formatNumber = (num: string): string => {
        if (!num) return "0";
        const value = parseFloat(num);
        if (isNaN(value)) return "0";
        if (value >= 10000000) return (value / 10000000).toFixed(1) + "Cr";
        if (value >= 100000) return (value / 100000).toFixed(1) + "L";
        if (value >= 1000) return (value / 1000).toFixed(1) + "K";
        return value.toString();
    };

    // Extract dynamic title & subtitle based on backend match/room info
    let cardTitle = room.name;
    let cardSubtitle = "Join live watch along with commentary & reactions";

    if (match) {
        if (match.team1?.name && match.team2?.name) {
            const tournamentPart = match.tournament ? `${match.tournament} · ` : "";
            cardTitle = `${tournamentPart}${match.team1.name} vs ${match.team2.name}`;
            if (match.team1.score || match.team2.score) {
                cardSubtitle = `Score: ${match.team1.name} (${match.team1.score || "0"}) vs ${match.team2.name} (${match.team2.score || "0"})`;
            } else {
                cardSubtitle = isLive ? "Live watch along with commentary & reactions" : `Upcoming · ${match.tournament || "Match"}`;
            }
        } else if (match.title) {
            cardTitle = match.title;
            cardSubtitle = isLive ? "Live watch along with commentary & reactions" : "Upcoming watch along";
        }
    }

    // Clean Host Name extraction from room.role or room.hostUserId
    let cleanHostName = "Host";
    if (room.role && room.role.toLowerCase() !== "host" && room.role.toLowerCase() !== "co-host") {
        cleanHostName = room.role.replace(/^Hosted by\s+/i, "");
    } else if (room.hostUserId) {
        const emailPrefix = room.hostUserId.split("@")[0];
        cleanHostName = emailPrefix
            .split(/[\._-]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    const tags: string[] = [];
    const sport = (room.sport || "").toLowerCase();
    const t = `${room.name} ${match?.tournament || ""}`.toLowerCase();
    if (sport === "cricket" || t.includes("cricket") || t.includes("t20") || t.includes("ipl")) {
        tags.push("Cricket");
    } else if (sport === "football" || t.includes("football") || t.includes("fifa") || t.includes("isl") || t.includes("soccer")) {
        tags.push("Football");
    }
    if (isLive) tags.push("Live");
    else tags.push(room.badge || "Upcoming");

    // Resolve dynamic event/sport icon for the banner
    let bannerIcon = "📺";
    const lowerTitle = cardTitle.toLowerCase();
    if (sport === "cricket") {
        bannerIcon = "🏏";
    } else if (sport === "football") {
        bannerIcon = "⚽";
    }
    
    if (lowerTitle.includes("ipl") || lowerTitle.includes("champions") || lowerTitle.includes("trophy")) {
        bannerIcon = isLive ? (sport === "cricket" ? "🏏" : "🏆") : "🏆";
    } else if (lowerTitle.includes("wc") || lowerTitle.includes("world cup") || lowerTitle.includes("semi")) {
        bannerIcon = "🌎";
    }

    return (
        <div className="rounded-2xl overflow-hidden bg-[#141414] border border-white/5 flex flex-col">
            {/* Gradient banner */}
            <div className="relative px-4 pt-4 pb-4 flex-1" style={{ background: gradient }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onShare(); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center animate-fade-in"
                    aria-label="Share"
                >
                    <Share2 size={15} className="text-white/80" />
                </button>
                {isLive && (
                    <span className="absolute top-3 left-4 bg-[#22c55e] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wide uppercase">
                        ● LIVE
                    </span>
                )}
                <div className="mt-7 flex items-center gap-3">
                    <span className="text-3xl shrink-0 select-none">{bannerIcon}</span>
                    <div className="min-w-0">
                        <p className="text-white font-black text-[16px] leading-snug pr-10">{cardTitle}</p>
                        <p className="text-white/70 text-[12px] mt-0.5">{cardSubtitle}</p>
                    </div>
                </div>
            </div>

            {/* Host info row */}
            <div className="bg-[#1c1c1c] border-t border-white/5 px-3 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full border border-white/10 bg-[#2a2a2a] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                        {room.displayPicture ? (
                            <img src={room.displayPicture} alt={cleanHostName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span className="text-white font-bold text-sm">
                                {cleanHostName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">HOST</span>
                            <span className="text-white font-bold text-[13px] truncate">{cleanHostName}</span>
                            <span className="text-gray-600 text-[11px]">|</span>
                            <span className="text-[11px] text-gray-400 font-medium">👥 {formatNumber(room.watching)} watching</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-gray-300 border border-white/5">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onEnter}
                    className="shrink-0 px-5 py-2 rounded-full text-white text-[12px] font-black transition-all cursor-pointer active:scale-95 hover:opacity-90 shadow-md"
                    style={isLive
                        ? { background: "linear-gradient(90deg, #e91e8c, #ff6b35)" }
                        : { background: "#222", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }
                    }
                >
                    {isLive ? "📺 Join" : "Notify"}
                </button>
            </div>
        </div>
    );
}
