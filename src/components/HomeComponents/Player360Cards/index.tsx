"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { MoreHorizontal, Search, Headphones, Play, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { usePlayerProfile360 } from "@/context/PlayerProfile360Context";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import PlaylistDialog from "@/src/components/playlistdialog-component/playlistdialog";

interface CatField {
    label: string;
    logo: string;
}

interface CategoryField {
    title: string;
    image: string;
}

interface AudioDrop {
    title: string;
    duration: string;
    description?: string;
    mediaUrl: string;
    thumbnail?: string;
    listens: number;
    signals: number;
    engagement: number;
}

interface VideoDrop {
    title: string;
    duration: string;
    description?: string;
    mediaUrl: string;
    thumbnail?: string;
    listens: number;
    signals: number;
    engagement: number;
}

interface Post {
    id: string;
    playerName: string;
    title: string;
    category: CategoryField[];
    likes: number;
    comments: number;
    live: number;
    shares: number;
    image: string;
    logo: string;
    catlogo: CatField[];
    hasVideo?: boolean;
    createdAt: number;
    updatedAt?: number;
    playerProfilesId?: string;
}

interface PlaylistData {
    audioDrops: AudioDrop[];
    videoDrops: VideoDrop[];
}

export default function Player360CardsSection() {
    const { homeData, loading, fetchPlayerHome } = usePlayerProfile360();
    const { user } = useAuth();
    const getUserId = () => user?.userId || null;
    const [playlistPost, setPlaylistPost] = useState<Post | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [hasMore, setHasMore] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [playlistData, setPlaylistData] = useState<Record<string, PlaylistData>>({});
    const [loadingPlaylists, setLoadingPlaylists] = useState<Record<string, boolean>>({});
    const [sharePost, setSharePost] = useState<Post | null>(null);
    const [copied, setCopied] = useState(false);
    const hasFetched = useRef(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Initial fetch
    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            setIsInitialLoading(true);
            fetchPlayerHome(undefined, true)
                .catch(err => {
                    console.error("Failed to fetch:", err);
                    setError("Failed to load posts");
                })
                .finally(() => {
                    setIsInitialLoading(false);
                });
        }
    }, [fetchPlayerHome]);

    // Update posts when homeData changes
    useEffect(() => {
        if (homeData?.home) {
            setPosts(homeData.home);
            setHasMore(homeData.hasMore || false);
            setError(null);

            // Fetch playlists for each post that has playerProfilesId
            homeData.home.forEach((post: Post) => {
                if (post.playerProfilesId) {
                    fetchPlaylistForPlayer(post.playerProfilesId, post.id);
                }
            });
        }
    }, [homeData]);

    // Fetch playlist for a specific player
    const fetchPlaylistForPlayer = async (playerProfilesId: string, postId: string) => {
        if (playlistData[postId]) return; // Already fetched

        setLoadingPlaylists(prev => ({ ...prev, [postId]: true }));

        try {
            const response = await axios.get(`/api/playersprofile-playlist`);

            if (response.data.success) {
                // Find playlist for this player
                const playerPlaylist = response.data.playlists.find(
                    (playlist: { playerProfilesId: string; audioDrops: AudioDrop[]; videoDrops: VideoDrop[] }) =>
                        playlist.playerProfilesId === playerProfilesId
                );

                if (playerPlaylist) {
                    setPlaylistData(prev => ({
                        ...prev,
                        [postId]: {
                            audioDrops: playerPlaylist.audioDrops || [],
                            videoDrops: playerPlaylist.videoDrops || []
                        }
                    }));
                } else {
                    // Set empty data to prevent re-fetching
                    setPlaylistData(prev => ({
                        ...prev,
                        [postId]: {
                            audioDrops: [],
                            videoDrops: []
                        }
                    }));
                }
            }
        } catch (error) {
            console.error(`Failed to fetch playlist for player ${playerProfilesId}:`, error);
        } finally {
            setLoadingPlaylists(prev => ({ ...prev, [postId]: false }));
        }
    };

    // Debounced search
    const performSearch = useCallback((searchValue: string) => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            setIsSearching(true);
            fetchPlayerHome(searchValue || undefined, true)
                .finally(() => {
                    setIsSearching(false);
                });
        }, 500);
    }, [fetchPlayerHome]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        performSearch(value);
    };

    const getISTTimeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const handleImageError = (id: string, type: string) => {
        setImageErrors(prev => ({
            ...prev,
            [`${id}-${type}`]: true
        }));
    };

    const resolveShareImageUrl = (post: Post) => {
        if (!post.image) return "/images/share.png";
        return post.image.startsWith("http") ? post.image : `https://api.sportsfan360.com${post.image}`;
    };

    const buildShareUrl = (post: Post) => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/MainModules/PlayersProfile/share/${post.id}`;
    };

    const buildShareText = (post: Post) => {
        const previewLink = buildShareUrl(post);

        return [
            `${post.playerName} | Player 360 World`,
            post.title,
            "Open the preview link below to see the photo and details:",
            previewLink,
        ].join("\n");
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

    const openShare = (post: Post) => {
        setSharePost(post);
        setCopied(false);
    };

    const closeShare = () => {
        setSharePost(null);
        setCopied(false);
    };

    const handleShareToWhatsApp = () => {
        if (!sharePost) return;
        const shareText = buildShareText(sharePost);
        const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
        const whatsappWebFallbackUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

        const opened = window.open(whatsappAppUrl, "_self");
        if (!opened) {
            window.location.href = whatsappWebFallbackUrl;
        }
    };

    const handleShareToThreads = () => {
        if (!sharePost) return;
        const shareText = buildShareText(sharePost);
        window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
    };

    const handleShareToInstagram = async () => {
        if (!sharePost) return;
        const shareText = buildShareText(sharePost);
        const ok = await copyToClipboard(shareText);
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        }
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    };

    const handleCopyLink = async () => {
        if (!sharePost) return;
        const ok = await copyToClipboard(buildShareText(sharePost));
        if (!ok) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    // Render preview of drops (max 2 items)
    const renderDropPreview = (postId: string) => {
        const data = playlistData[postId];
        const isLoading = loadingPlaylists[postId];

        if (isLoading) {
            return (
                <div className="mt-3 p-2 bg-gray-900/50 rounded-lg">
                    <div className="animate-pulse flex gap-2">
                        <div className="h-8 bg-gray-700 rounded flex-1"></div>
                        <div className="h-8 bg-gray-700 rounded flex-1"></div>
                    </div>
                </div>
            );
        }

        if (!data || (!data.audioDrops?.length && !data.videoDrops?.length)) {
            return null;
        }

        const previewDrops = [];

        // Take first 2 drops (mix of audio and video)
        if (data.audioDrops?.length) {
            previewDrops.push({ ...data.audioDrops[0], type: 'audio' });
        }
        if (data.videoDrops?.length && previewDrops.length < 2) {
            previewDrops.push({ ...data.videoDrops[0], type: 'video' });
        }

        return (
            <div className="space-y-2">
                {/* <p className="text-xs text-gray-400 flex items-center gap-1 ml-2">
                    <Headphones size={10} /> Latest Drops
                </p> */}
                {/* <div className="space-y-1.5">
                    {previewDrops.map((drop, idx) => (
                        <div key={idx} className="bg-gray-900/50 rounded-lg p-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {drop.type === 'audio' ? (
                                        <Headphones size={12} className="text-pink-500 flex-shrink-0" />
                                    ) : (
                                        <Play size={12} className="text-orange-500 flex-shrink-0" />
                                    )}
                                    <p className="text-xs text-white truncate flex-1">
                                        {drop.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                                    <Clock size={8} />
                                    <span>{drop.duration}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div> */}
                {(data.audioDrops?.length + data.videoDrops?.length) > 2 && (
                    <p className="text-[10px] text-pink-500 text-center">
                        +{data.audioDrops.length + data.videoDrops.length - 2} more drops
                    </p>
                )}
            </div>
        );
    };

    // Only show full page loader on initial load
    if (isInitialLoading) {
        return (
            <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading posts...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex justify-center items-center bg-[#0d0d10] min-h-[200px]">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            hasFetched.current = false;
                            setIsInitialLoading(true);
                            fetchPlayerHome(undefined, true)
                                .finally(() => setIsInitialLoading(false));
                        }}
                        className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-4">
            {/* Header with Search - Always visible */}
            <div className="flex items-center justify-between lg:justify-start lg:gap-4 gap-3 mb-4">
                <h1 className="text-[18px] sm:text-[20px] font-semibold text-white whitespace-nowrap">
                    Players 360 World
                </h1>

                <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-1.5 w-[160px] sm:w-[200px] md:w-[240px] focus-within:border-pink-500 transition">
                    <Search className="text-gray-400 shrink-0" size={16} />
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-transparent outline-none text-xs sm:text-sm text-white placeholder:text-gray-500 w-full ml-2"
                    />
                </div>
            </div>

            {/* Cards Section - Shows loading indicator inside during search */}
            <div className="relative">
                {/* Search Loading Overlay inside cards section */}
                {isSearching && (
                    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-xl">
                        <div className="px-6 py-4 flex items-center gap-3 shadow-xl">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
                            <p className="text-white text-sm">Searching...</p>
                        </div>
                    </div>
                )}

                {/* Horizontal Scroll Container */}
                <div className={`flex gap-4 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory pb-4 transition-opacity duration-200 ${isSearching ? 'opacity-50' : 'opacity-100'}`}>
                    {posts.length > 0 ? (
                        posts.map((post) => {
                            const hasDropContent = playlistData[post.id] &&
                                (playlistData[post.id].audioDrops?.length > 0 ||
                                    playlistData[post.id].videoDrops?.length > 0);

                            return (
                                <div
                                    key={post.id}
                                    className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-black rounded-xl shadow-sm border border-gray-800 overflow-hidden snap-start flex flex-col h-full"
                                >
                                    {/* Header */}
                                    <Link href={`/MainModules/PlayersProfile?id=${post.playerProfilesId || post.id}&tab=highlights`}>
                                        <div className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                                                    {!imageErrors[`${post.id}-logo`] ? (
                                                        <img
                                                            src={post.logo}
                                                            alt={post.playerName}
                                                            className="w-full h-full object-cover rounded-full"
                                                            onError={() => handleImageError(post.id, 'logo')}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                                                            {post.playerName?.charAt(0) || 'P'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white text-sm leading-tight">
                                                        {post.playerName}
                                                    </h3>
                                                    <p className="text-[10px] text-gray-400">
                                                        {getISTTimeAgo(post.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* NEW ACTION ICONS CONTAINER */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setPlaylistPost(post);
                                                    }}
                                                    className="text-gray-400 hover:text-white transition p-1 hover:bg-gray-800 rounded-full cursor-pointer"
                                                    title="Add to Playlist"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                                <MoreHorizontal size={18} className="text-gray-400" />
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Image */}
                                    <Link href={`/MainModules/PlayersProfile?id=${post.playerProfilesId || post.id}&tab=highlights`}>
                                        <div className="relative aspect-video bg-orange-800">
                                            {!imageErrors[`${post.id}-main`] ? (
                                                <Image
                                                    src={post.image}
                                                    alt={post.title}
                                                    fill
                                                    className="object-contain"
                                                    onError={() => handleImageError(post.id, 'main')}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 100 100"
                                                        className="w-20 h-20 opacity-40"
                                                        fill="none"
                                                    >
                                                        <circle cx="50" cy="28" r="12" fill="#9ca3af" />
                                                        <rect x="36" y="42" width="28" height="26" rx="4" fill="#9ca3af" />
                                                        <rect x="36" y="66" width="11" height="18" rx="3" fill="#9ca3af" />
                                                        <rect x="53" y="66" width="11" height="18" rx="3" fill="#9ca3af" />
                                                        <rect x="64" y="44" width="7" height="28" rx="3" fill="#9ca3af" transform="rotate(20 64 44)" />
                                                        <rect x="70" y="56" width="6" height="18" rx="2" fill="#6b7280" transform="rotate(20 70 56)" />
                                                        <circle cx="22" cy="62" r="6" fill="#6b7280" />
                                                        <path d="M19 59 Q22 62 19 65" stroke="#9ca3af" strokeWidth="1" />
                                                        <path d="M25 59 Q22 62 25 65" stroke="#9ca3af" strokeWidth="1" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="mb-2 mt-2 ml-2">
                                        <h4 className="font-semibold text-white text-sm">
                                            {post.title}
                                        </h4>
                                        {post.category && post.category.length > 0 && (
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {post.category.map((cat, i) => (
                                                    <span
                                                        key={i}
                                                        className="border border-gray-200 text-gray-400 text-xs px-2 py-1 rounded-xl"
                                                    >
                                                        {cat.title}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Drop Preview Section - Only show if has content */}
                                    {hasDropContent && renderDropPreview(post.id)}

                                    {/* Stats Section */}
                                    {/* <div className="p-3 mt-auto">
                                        <div className="flex items-center gap-2 flex-nowrap mb-3">
                                            {post.catlogo && post.catlogo.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="flex flex-row gap-2 rounded-2xl px-2 py-1 bg-gray-950 items-center"
                                                >
                                                    {!imageErrors[`${post.id}-catlogo-${i}`] ? (
                                                        <img
                                                            src={item.logo}
                                                            alt={item.label}
                                                            className="w-[20px] h-[20px] object-cover"
                                                            onError={() => handleImageError(post.id, `catlogo-${i}`)}
                                                        />
                                                    ) : (
                                                        <div className="w-[20px] h-[20px] bg-gray-700 rounded-full" />
                                                    )}
                                                    <span className="text-sm text-gray-400">
                                                        {item.label}
                                                    </span>
                                                </div>
                                            ))}

                                           
                                            <span className="rounded-2xl px-2 py-1 flex flex-row gap-2 bg-gray-950 items-center">
                                                <img
                                                    src='/images/profile.png'
                                                    alt="comments"
                                                    className="w-5 h-5 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/fallback-share.png';
                                                    }}
                                                />
                                                <span className="text-sm text-gray-400">{post.comments || 0}</span>
                                            </span>

                                         
                                            <span className="rounded-2xl px-2 py-1 flex flex-row gap-2 bg-gray-950 items-center">
                                                <img
                                                    src='/images/like.png'
                                                    alt="likes"
                                                    className="w-5 h-5 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/fallback-share.png';
                                                    }}
                                                />
                                                <span className="text-sm text-gray-400">{post.likes || 0}</span>
                                            </span>

                                            
                                            <span className="rounded-2xl px-2 py-1 flex flex-row gap-2 bg-gray-950 items-center">
                                                <img
                                                    src='/images/live.png'
                                                    alt="live"
                                                    className="w-5 h-5 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/fallback-share.png';
                                                    }}
                                                />
                                                <span className="text-sm text-gray-400 font-medium">{post.live || 0}</span>
                                            </span>

                                           
                                            <button
                                                type="button"
                                                onClick={() => openShare(post)}
                                                className="rounded-2xl px-2 py-1 flex flex-row gap-2 bg-gray-950 items-center hover:bg-gray-800 transition"
                                                aria-label={`Share ${post.playerName}`}
                                            >
                                                <img
                                                    src='/images/share.png'
                                                    alt="share"
                                                    className="w-5 h-5 object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/fallback-share.png';
                                                    }}
                                                />
                                            </button>
                                        </div>


                                        <Link href={`/MainModules/PlayersProfileDrop/DropScreen?id=${post.playerProfilesId || post.id}&playerName=${encodeURIComponent(post.playerName)}`}>
                                            <button
                                                className="text-xs bg-[#C9115F] w-full py-2 rounded-xl text-white mb-2"
                                                style={{ fontWeight: 700 }}
                                            >
                                                View Full Playlist
                                            </button>
                                        </Link>
                                    </div> */}
                                </div>
                            );
                        })
                    ) : (
                        <div className="w-full text-center py-10">
                            <p className="text-gray-400">
                                {searchTerm ? `No players found matching '${searchTerm}'.` : 'No posts available.'}
                            </p>
                        </div>
                    )}
                </div>

                {sharePost && (
                    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={closeShare}>
                        <div className="bg-[#1a1a1a] rounded-2xl max-w-md w-full overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                                <div>
                                    <p className="text-white text-lg font-semibold">Share Player 360</p>
                                    <p className="text-white/50 text-xs mt-1">Use the preview link so the player image shows up</p>
                                </div>
                                <button onClick={closeShare} className="text-gray-400 hover:text-white transition" aria-label="Close share dialog">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-5">
                                <div className="rounded-[24px] overflow-hidden border border-white/10 bg-[#111114] mb-5">
                                    <div className="relative h-48 bg-gradient-to-br from-pink-600/25 via-[#111114] to-orange-500/20">
                                        <img src={resolveShareImageUrl(sharePost)} alt={sharePost.playerName} className="absolute inset-0 w-full h-full object-cover opacity-85" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-[#111114]/20 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <span className="inline-flex items-center rounded-full bg-pink-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                                Player 360 World
                                            </span>
                                            <h3 className="mt-3 text-xl font-bold leading-tight">{sharePost.playerName}</h3>
                                            <p className="mt-2 text-white/80 text-sm">{sharePost.title}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 text-sm text-white/70">
                                        <p className="line-clamp-3">
                                            {sharePost.category?.map((cat) => cat.title).filter(Boolean).join(", ") || "Latest Player 360 post"}
                                        </p>
                                        <a
                                            href={buildShareUrl(sharePost)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-block text-pink-400 break-all underline underline-offset-4 hover:text-pink-300"
                                        >
                                            {buildShareUrl(sharePost)}
                                        </a>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <button onClick={handleShareToWhatsApp} className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-left">
                                        <img src="/images/share_whatsapp.png" alt="WhatsApp" className="w-9 h-9 mb-2" />
                                        <p className="text-sm font-medium">WhatsApp</p>
                                    </button>
                                    <button onClick={handleShareToThreads} className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-left">
                                        <img src="/images/share_thread.png" alt="Threads" className="w-9 h-9 mb-2" />
                                        <p className="text-sm font-medium">Threads</p>
                                    </button>
                                    <button onClick={handleShareToInstagram} className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-left">
                                        <img src="/images/share_insta.png" alt="Instagram" className="w-9 h-9 mb-2" />
                                        <p className="text-sm font-medium">Instagram</p>
                                    </button>
                                    <button onClick={handleCopyLink} className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-left">
                                        <img src="/images/share_copy_link.png" alt="Copy link" className="w-9 h-9 mb-2" />
                                        <p className="text-sm font-medium">Copy link</p>
                                    </button>
                                </div>

                                {copied && <p className="text-sm text-emerald-400 mb-3">Copied to clipboard</p>}

                                <button
                                    onClick={closeShare}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Playlist Dialog */}
            {playlistPost && (
                <PlaylistDialog
                    open={!!playlistPost}
                    onClose={() => setPlaylistPost(null)}
                    itemId={playlistPost.id}
                    itemType="players360" // Adjust this if your backend expects a different string
                    userId={getUserId()}
                />
            )}

        </div>
    );
}
