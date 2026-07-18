
"use client";

import { useWatchAlong, Room, Match } from "@/context/WatchAlongContext";
import { ArrowLeft, Share2, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
// import BackButton from "../ReusableComponent/BackButton";

const tabs = ["Live Rooms"/*, "Goal Reactions", "Fan Leaderboard", "Highlights"*/];

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

    const buildRoomUrl = (roomId: string) => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/MainModules/WatchAlong/room/${roomId}`;
    };

    const resolveShareImageUrl = (room: Room) => {
        if (!room.displayPicture) {
            return "/images/share.png";
        }

        if (room.displayPicture.startsWith("http://") || room.displayPicture.startsWith("https://")) {
            return room.displayPicture;
        }

        return room.displayPicture.startsWith("/") ? room.displayPicture : `/${room.displayPicture}`;
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
        if (!opened) {
            window.location.href = whatsappWebFallbackUrl;
        }
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

    return (
        <div className="relative min-h-screen bg-black text-white font-sans flex justify-center w-full">
            
            <div className="w-full max-w-7xl mx-auto pt-8 pb-24 px-4 lg:px-8">
                {/* <BackButton /> */}

        <style>{`
  .watch-along-bar {
    left: 0;
  }
  @media (min-width: 1024px) {
    .watch-along-bar {
      left: var(--sidebar-width, 84px);
    }
  }
`}</style>

{/* Fixed Back + Title bar */}
<div 
    className="watch-along-bar"
    style={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 16px 12px",
        background: "rgba(0,0,0,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        transition: "left 0.3s ease-out",
    }}>
            <Link href="/MainModules/ROAR" style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                color: "white"
            }}>
                <button
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "white",
                        padding: "4px 2px",
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
                </button>
                <h3 style={{
                    color: "white",
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: "0.01em"
                }}>
                    Watch Along
                </h3>
            </Link>
        </div>

        {/* Spacer so content doesn't sit under the fixed bar */}
        <div style={{ height: 56 }} />

                {/* Header Section */}
                <div className="mb-6 flex flex-col items-center">
                    
                    {/* <h1 className="text-3xl font-bold uppercase tracking-wider text-[#e5003d]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                        Watch Along
                    </h1> */}
                    <div
                        style={{
                            height: "2px",
                            width: "24px",
                            borderRadius: "999px",
                            marginTop: "3.5px",
                            background: "#e5003d",
                        }}
                    />
                    <div className="flex items-center gap-2 mt-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#e5003d] animate-pulse" />
                        <span className="text-sm font-semibold text-gray-400">Women's T20 World Cup & FIFA</span>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mb-8 overflow-hidden">
                    <div
                        className="flex justify-center items-center gap-2 overflow-x-auto rounded-2xl border border-white/5 bg-[#1a1a1a]/80 p-1.5 shadow-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        style={{ WebkitOverflowScrolling: "touch" }}
                    >
                        {tabs.map((tab, i) => {
                            const isActive = activeTab === i;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(i)}
                                    className={`relative flex min-w-max items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:px-6 sm:py-3.5 sm:text-sm font-bold tracking-wide transition-all duration-300 text-center whitespace-nowrap shrink-0 group min-h-[44px] cursor-pointer
                                        ${isActive
                                            ? "text-white shadow-lg shadow-pink-500/20"
                                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                        }`}
                                    style={isActive ? { background: "linear-gradient(90deg, #e91e8c, #ff6b35)" } : {}}
                                >
                                    <span className="block leading-tight">{tab}</span>
                                </button>
                            );
                        })}
                    </div>
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
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 px-4 rounded-lg bg-[#333] hover:bg-[#444] text-white font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!newRoomName.trim()) return;
                                        setIsCreating(true);
                                        const formData = new FormData();
                                        formData.append("name", newRoomName);
                                        const currentUserId = authUser?.userId || (session?.user as { userId?: string })?.userId || session?.user?.id;
                                        if (currentUserId) {
                                            formData.append("hostUserId", currentUserId);
                                        }
                                        const hostName = authUser?.name || session?.user?.name;
                                        if (hostName) {
                                            formData.append("role", `Hosted by ${hostName}`);
                                        } else {
                                            formData.append("role", "Fan Host");
                                        }
                                        const newRoom = await createRoom(formData);
                                        if (newRoom) {
                                            onEnterRoom(newRoom.id);
                                        }
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

                {/* ── Scrollable Content ── */}
                <div className="w-full pt-6 pb-24">
                    {(() => {
                        const combinedRooms: Room[] = [
                            ...rooms
                        ];

                        return combinedRooms.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400">No watch along rooms available.</p>
                                <p className="text-sm text-gray-600 mt-2">Check back later for live expert sessions!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                                {combinedRooms.map((room) => (
                                    <ExpertCard
                                        key={room.id}
                                        room={room}
                                        match={getMatchForRoom(room.liveMatchId)}
                                        onEnter={() => onEnterRoom(room.id)}
                                        onShare={() => openShare(room)}
                                    />
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {shareRoom && (
                    <div
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-4"
                        onClick={closeShare}
                    >
                        <div
                            className="w-full max-w-md rounded-3xl border border-white/15 bg-[#3c434f] text-white p-5 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="pr-4">
                                    <p className="text-2xl font-bold leading-tight">Share Expert Room</p>
                                    <p className="text-lg font-semibold mt-2">{shareRoom.name}</p>
                                    <p className="text-white/70 text-sm">{shareRoom.role}</p>
                                </div>
                                <button
                                    onClick={closeShare}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10"
                                    aria-label="Close share dialog"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 shrink-0">
                                    <img
                                        src={shareRoom.displayPicture || "/images/share.png"}
                                        alt={shareRoom.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm">Watch Along preview</p>
                                    <p className="text-xs text-white/70 line-clamp-2">
                                        Join this room, see live match context, and share the link with the room preview image.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleShareToWhatsApp}
                                    className="w-full rounded-2xl px-4 py-3 bg-[#5b6472] hover:bg-[#6a7483] transition-colors flex items-center gap-3 text-left"
                                >
                                    <img src="/images/share_whatsapp.png" alt="WhatsApp" className="w-9 h-9 rounded-full object-cover" />
                                    <span className="font-semibold">Share on WhatsApp</span>
                                </button>

                                <button
                                    onClick={handleShareToThreads}
                                    className="w-full rounded-2xl px-4 py-3 bg-[#5b6472] hover:bg-[#6a7483] transition-colors flex items-center gap-3 text-left"
                                >
                                    <img src="/images/share_thread.png" alt="Threads" className="w-9 h-9 rounded-full object-cover" />
                                    <span className="font-semibold">Share on Threads</span>
                                </button>

                                <button
                                    onClick={handleShareToInstagram}
                                    className="w-full rounded-2xl px-4 py-3 bg-[#5b6472] hover:bg-[#6a7483] transition-colors flex items-center gap-3 text-left"
                                >
                                    <img src="/images/share_insta.png" alt="Instagram" className="w-9 h-9 rounded-full object-cover" />
                                    <span className="font-semibold">Share on Instagram</span>
                                </button>

                                <button
                                    onClick={handleCopyLink}
                                    className="w-full rounded-2xl px-4 py-3 bg-[#5b6472] hover:bg-[#6a7483] transition-colors flex items-center gap-3 text-left"
                                >
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
    onShare
}: {
    room: Room;
    match?: Match;
    onEnter: () => void;
    onShare: () => void;
}) {
    const formatNumber = (num: string): string => {
        if (!num) return "0";

        const value = parseFloat(num);
        if (isNaN(value)) return "0";

        // For Crore (10 million = 1 Crore)
        if (value >= 10000000) {
            return (value / 10000000).toFixed(1) + "Cr";
        }
        // For Lakh (100,000 = 1 Lakh)
        if (value >= 100000) {
            return (value / 100000).toFixed(1) + "L";
        }
        // For Thousand
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + "K";
        }

        return value.toString();
    };

    const hasLiveMatchContent = room.isLive && match;
    const hasLivePlaceholder = room.isLive && !match;

    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col">

            {/* Badge */}
            <span className={`absolute top-3 right-3 ${room.badgeColor} text-white text-[11px] font-semibold px-3 py-1 rounded-full z-10`}>
                {room.badge}
            </span>

            <button
                onClick={onShare}
                className="absolute top-3 right-24 sm:right-28 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center z-10"
                aria-label={`Share ${room.name} room`}
            >
                <Share2 size={17} />
            </button>

            {/* Expert info */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 rounded-full border-2 ${room.borderColor} bg-[#2a2a2a] flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden`}>
                    {room.displayPicture ? (
                        <img src={room.displayPicture} alt={room.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <span className="text-white font-bold text-lg">
                            {room.name.split(" ").map(n => n[0]).join("")}
                        </span>
                    )}
                </div>
                <div className="pr-20 sm:pr-28">
                    <p className="text-base font-bold text-white">{room.name}</p>
                    <p className="text-xs text-gray-400">{room.role}</p>
                    <span
                        className={`inline-flex mt-1 ${room.badgeColor} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}
                    >
                        {room.badge}
                    </span>
                </div>
            </div>

            {/* Live match */}
            {hasLiveMatchContent && (
                <div className="bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-2.5 mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                            LIVE
                        </span>
                        <span className="text-[11px] text-gray-400">
                            Match {match.matchNo} &nbsp; {match.tournament || "Women's T20 World Cup & FIFA"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-pink-500">{match.team1?.name} {match.team1?.score || "0/0"}</span>
                        <span className="text-xs text-gray-500">vs</span>
                        <span className="text-sm font-bold text-blue-400">{match.team2?.name} {match.team2?.score || "0/0"}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 text-center">{match.stadium || "Venue TBD"}</p>
                </div>
            )}

            {/* Placeholder */}
            {hasLivePlaceholder && (
                <div className="bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-2.5 mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                            LIVE
                        </span>
                        <span className="text-[11px] text-gray-400">Match coming soon</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center py-2">Match details will appear here shortly</p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center gap-0.5 border border-gray-700 rounded-lg px-2 py-2">
                    <span className="text-[13px] font-semibold text-white">
                        <img src="/images/watching.png" alt="Watching" className="w-4 h-4 inline-block mr-1" />
                        {formatNumber(room.watching)}
                    </span>
                    <span className="text-[10px] text-gray-500">Watching</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 border border-gray-700 rounded-lg px-2 py-2">
                    <span className="text-[13px] font-semibold text-green-400">
                        <img src="/images/engagement.png" alt="Engagement" className="w-4 h-4 inline-block mr-1" />
                        {formatNumber(room.engagement)}
                    </span>
                    <span className="text-[10px] text-gray-500">Engagement</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 border border-gray-700 rounded-lg px-2 py-2">
                    <span className="text-[13px] font-semibold text-green-400">
                        ● {formatNumber(room.active)}
                    </span>
                    <span className="text-[10px] text-gray-500">Active</span>
                </div>
            </div>

            {/* CTA */}
            <button
                onClick={onEnter}
                className="w-full py-3 rounded-full text-white text-sm font-bold transition-all cursor-pointer active:scale-95 hover:opacity-90"
                style={{ background: "linear-gradient(90deg, #e91e63, #ff5722)" }}
            >
                Enter Watch Room →
            </button>
        </div>
    );
}
