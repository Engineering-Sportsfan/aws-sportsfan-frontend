// // src/components/HomeComponents/ContinueListening.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";

// interface VideoProgress {
//     videoId: string;
//     title: string;
//     subtitle: string;
//     elapsed: number;
//     durationSeconds: number;
//     pct: number;
//     url: string;
//     pausedAt: number;
//     _type: "video";
// }

// interface AudioProgress {
//     audioId: string;
//     title: string;
//     subtitle: string;
//     elapsed: number;
//     durationSeconds: number;
//     pct: number;
//     url: string;
//     pausedAt: number;
//     _type: "audio";
// }

// type ProgressItem = VideoProgress | AudioProgress;

// export default function ContinueListening() {
//     const { user } = useAuth();
//     const [inProgress, setInProgress] = useState<ProgressItem[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         if (!user?.userId) {
//             setLoading(false);
//             return;
//         }

//         const fetchProgress = async () => {
//             try {
//                 // Fetch video and audio progress in parallel
//                 const [videoRes, audioRes] = await Promise.allSettled([
//                     axios.get(`/api/video-progress?userId=${user.userId}`),
//                     axios.get(`/api/audio-progress?userId=${user.userId}`),
//                 ]);

//                 const videoItems: VideoProgress[] =
//                     videoRes.status === "fulfilled" && videoRes.value.data.success
//                         ? (videoRes.value.data.progress || []).map((v: Omit<VideoProgress, "_type">) => ({
//                               ...v,
//                               _type: "video" as const,
//                           }))
//                         : [];

//                 const audioItems: AudioProgress[] =
//                     audioRes.status === "fulfilled" && audioRes.value.data.success
//                         ? (audioRes.value.data.progress || []).map((a: Omit<AudioProgress, "_type">) => ({
//                               ...a,
//                               _type: "audio" as const,
//                           }))
//                         : [];

//                 // Merge and sort by most recently paused
//                 const merged: ProgressItem[] = [...videoItems, ...audioItems].sort(
//                     (a, b) => b.pausedAt - a.pausedAt
//                 );

//                 setInProgress(merged);
//             } catch (err) {
//                 console.error("Fetch error:", err);
//                 setError(err instanceof Error ? err.message : "Unknown error");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProgress();
//     }, [user?.userId]);

//     if (loading) {
//         return (
//             <div className="w-full">
//                 <h2 className="text-pink-500 text-lg sm:text-xl font-semibold mb-3">
//                     Continue Watching
//                 </h2>
//                 <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1">
//                     {[1, 2].map((i) => (
//                         <div
//                             key={i}
//                             className="min-w-[280px] sm:min-w-[320px] h-[91px] bg-[#1a1a1e] rounded-xl flex-shrink-0 animate-pulse"
//                         />
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="w-full">
//                 <h2 className="text-pink-500 text-lg sm:text-xl font-semibold mb-3">
//                     Continue Watching
//                 </h2>
//                 <div className="text-red-400 text-sm">Error: {error}</div>
//             </div>
//         );
//     }

//     if (inProgress.length === 0) return null;

//     const formatTime = (secs: number) => {
//         const m = Math.floor(secs / 60);
//         const s = Math.floor(secs % 60);
//         return `${m}:${s.toString().padStart(2, "0")}`;
//     };

//     return (
//         <div className="w-full">
//             <h2 className="text-pink-500 text-lg sm:text-xl font-semibold mb-3">
//                 Continue Watching
//             </h2>

//             <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1">
//                 {inProgress.map((item) => {
//                     const isAudio = item._type === "audio";
//                     const id = isAudio
//                         ? (item as AudioProgress).audioId
//                         : (item as VideoProgress).videoId;
//                     const href = isAudio
//                         ? `/MainModules/MatchesDropContent/AudioDropScreen?id=${encodeURIComponent(id)}&resume=${item.elapsed}`
//                         : `/MainModules/MatchesDropContent/VideoDropScreen?id=${encodeURIComponent(id)}&resume=${item.elapsed}`;
//                     const label = isAudio ? "listened" : "watched";

//                     return (
//                         <Link key={`${item._type}-${id}`} href={href}>
//                             <div className="min-w-[280px] sm:min-w-[320px] bg-gradient-to-r from-[#1A2B3A] to-[#0f1a24] rounded-xl flex-shrink-0 hover:brightness-110 transition-all cursor-pointer overflow-hidden">
//                                 {/* Progress bar at top */}
//                                 <div className="h-[3px] bg-[#1e1e22] w-full">
//                                     <div
//                                         className="h-full bg-[#e0185a] transition-all"
//                                         style={{ width: `${item.pct}%` }}
//                                     />
//                                 </div>

//                                 <div className="h-[80px] sm:h-[88px] flex items-center gap-4 px-5">
//                                     {/* Icon — headphones for audio, play for video */}
//                                     <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center shrink-0">
//                                         {isAudio ? (
//                                             <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
//                                                 <path d="M3 10v-1C3 5.686 5.686 3 9 3s6 2.686 6 6v1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
//                                                 <rect x="2" y="9.5" width="3" height="5" rx="1.5" fill="#fff" />
//                                                 <rect x="13" y="9.5" width="3" height="5" rx="1.5" fill="#fff" />
//                                             </svg>
//                                         ) : (
//                                             <span className="text-white text-xs ml-0.5">▶</span>
//                                         )}
//                                     </div>

//                                     {/* Text */}
//                                     <div className="flex-1 min-w-0">
//                                         <p className="text-[#C9115F] font-semibold text-sm sm:text-base truncate">
//                                             {item.title}
//                                         </p>
//                                         <p className="text-gray-400 text-xs sm:text-sm truncate">
//                                             {item.subtitle}
//                                         </p>
//                                         <p className="text-[#555] text-[10px] mt-0.5">
//                                             Resume from {formatTime(item.elapsed)} · {item.pct}% {label}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </Link>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }





// src/components/HomeComponents/ContinueListening.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface VideoProgress {
    videoId: string;
    title: string;
    subtitle: string;
    elapsed: number;
    durationSeconds: number;
    pct: number;
    url: string;
    pausedAt: number;
    _type: "video";
}

interface AudioProgress {
    audioId: string;
    title: string;
    subtitle: string;
    elapsed: number;
    durationSeconds: number;
    pct: number;
    url: string;
    pausedAt: number;
    _type: "audio";
}

type ProgressItem = VideoProgress | AudioProgress;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function ContinueListening() {
    const { user } = useAuth();
    const [inProgress, setInProgress] = useState<ProgressItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasVideo, setHasVideo] = useState(false);
    const [hasAudio, setHasAudio] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user?.userId) {
            setLoading(false);
            return;
        }

        const fetchProgress = async () => {
            try {
                const [videoRes, audioRes] = await Promise.allSettled([
                    axios.get(`/api/video-progress?userId=${user.userId}`),
                    axios.get(`/api/audio-progress?userId=${user.userId}`),
                ]);

                const now = Date.now();
                const threshold = now - THIRTY_DAYS_MS;

                const videoItems: VideoProgress[] =
                    videoRes.status === "fulfilled" && videoRes.value.data.success
                        ? (videoRes.value.data.progress || [])
                              .map((v: Omit<VideoProgress, "_type">) => ({
                                  ...v,
                                  _type: "video" as const,
                              }))
                              .filter((v: VideoProgress) => v.pausedAt > threshold)
                        : [];

                const audioItems: AudioProgress[] =
                    audioRes.status === "fulfilled" && audioRes.value.data.success
                        ? (audioRes.value.data.progress || [])
                              .map((a: Omit<AudioProgress, "_type">) => ({
                                  ...a,
                                  _type: "audio" as const,
                              }))
                              .filter((a: AudioProgress) => a.pausedAt > threshold)
                        : [];

                setHasVideo(videoItems.length > 0);
                setHasAudio(audioItems.length > 0);

                const merged: ProgressItem[] = [...videoItems, ...audioItems].sort(
                    (a, b) => b.pausedAt - a.pausedAt
                );

                setInProgress(merged);
            } catch (err) {
                console.error("[ContinueListening] fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [user?.userId]);

    // Track which card is most visible in the scroll container
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onScroll = () => {
            const cardWidth = el.scrollWidth / inProgress.length;
            const index = Math.round(el.scrollLeft / cardWidth);
            setActiveIndex(Math.max(0, Math.min(index, inProgress.length - 1)));
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [inProgress.length]);

    if (loading) {
        return (
            <div className="w-full">
                <h2 className="text-pink-500 text-lg sm:text-xl font-semibold mb-3">
                    Continue Watching
                </h2>
                <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="min-w-[280px] sm:min-w-[320px] h-[91px] bg-[#1a1a1e] rounded-xl flex-shrink-0 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (inProgress.length === 0) return null;

    const heading =
        hasVideo && hasAudio
            ? "Continue Watching & Listening"
            : hasAudio
            ? "Continue Listening"
            : "Continue Watching";

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-3 gap-1">
                <h2 className="text-pink-500 text-lg sm:text-xl font-semibold">
                    {heading}
                </h2>
                <span className="text-gray-500 text-[10px] sm:text-xs">
                    Paused content will be cleared after 30 days
                </span>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1"
            >
                {inProgress.map((item) => {
                    const isAudio = item._type === "audio";
                    const id = isAudio
                        ? (item as AudioProgress).audioId
                        : (item as VideoProgress).videoId;
                    const href = isAudio
                        ? `/MainModules/MatchesDropContent/AudioDropScreen?id=${encodeURIComponent(id)}&resume=${item.elapsed}`
                        : `/MainModules/MatchesDropContent/VideoDropScreen?id=${encodeURIComponent(id)}&resume=${item.elapsed}`;
                    const label = isAudio ? "listened" : "watched";

                    return (
                        <Link key={`${item._type}-${id}`} href={href}>
                            <div className="min-w-[280px] sm:min-w-[320px] bg-gradient-to-r from-[#1A2B3A] to-[#0f1a24] rounded-xl flex-shrink-0 hover:brightness-110 transition-all cursor-pointer overflow-hidden">
                                <div className="h-[3px] bg-[#1e1e22] w-full">
                                    <div
                                        className="h-full bg-[#e0185a] transition-all"
                                        style={{ width: `${item.pct}%` }}
                                    />
                                </div>

                                <div className="h-[80px] sm:h-[88px] flex items-center gap-4 px-5">
                                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center shrink-0">
                                        {isAudio ? (
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                <path
                                                    d="M3 10v-1C3 5.686 5.686 3 9 3s6 2.686 6 6v1"
                                                    stroke="#fff"
                                                    strokeWidth="1.6"
                                                    strokeLinecap="round"
                                                />
                                                <rect x="2" y="9.5" width="3" height="5" rx="1.5" fill="#fff" />
                                                <rect x="13" y="9.5" width="3" height="5" rx="1.5" fill="#fff" />
                                            </svg>
                                        ) : (
                                            <span className="text-white text-xs ml-0.5">▶</span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <span
                                            className={`inline-block text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded mb-0.5 ${
                                                isAudio
                                                    ? "bg-[#e0185a]/15 text-[#e0185a]"
                                                    : "bg-blue-500/15 text-blue-400"
                                            }`}
                                        >
                                            {isAudio ? "Audio" : "Video"}
                                        </span>
                                        <p className="text-[#C9115F] font-semibold text-sm sm:text-base truncate leading-tight">
                                            {item.title}
                                        </p>
                                        <p className="text-gray-400 text-xs sm:text-sm truncate">
                                            {item.subtitle}
                                        </p>
                                        <p className="text-[#555] text-[10px] mt-0.5">
                                            Resume from {formatTime(item.elapsed)} · {item.pct}% {label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Dot indicators — only on mobile, only when more than 1 card */}
            {inProgress.length > 1 && (
                <div className="flex sm:hidden justify-center gap-1.5 mt-2.5">
                    {inProgress.map((_, i) => (
                        <button
                            key={i}
                            aria-label={`Go to item ${i + 1}`}
                            onClick={() => {
                                const el = scrollRef.current;
                                if (!el) return;
                                const cardWidth = el.scrollWidth / inProgress.length;
                                el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
                                setActiveIndex(i);
                            }}
                            className={`rounded-full transition-all duration-300 ${
                                i === activeIndex
                                    ? "w-4 h-1.5 bg-[#e0185a]"
                                    : "w-1.5 h-1.5 bg-[#3a3a3e]"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

