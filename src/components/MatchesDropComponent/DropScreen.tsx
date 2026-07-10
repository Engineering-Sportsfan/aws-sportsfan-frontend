// "use client";
// import { useState, useEffect, useRef } from "react";
// import { ArrowLeft, Headphones, Play, Users, Loader2 } from "lucide-react";
// import Link from "next/link";
// import axios from "axios";
// import { useSearchParams } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { useGlobalAudio } from "@/hooks/useGlobalAudio";
// import { PlaysProvider, usePlays } from "@/context/PlaysContext";

// const TEAM_ABBR_MAP: Record<string, string[]> = {
//     "Mumbai Indians": ["MI", "Mumbai"],
//     "Chennai Super Kings": ["CSK", "Chennai"],
//     "Royal Challengers Bengaluru": ["RCB", "Bengaluru", "Bangalore"],
//     "Sunrisers Hyderabad": ["SRH", "Hyderabad"],
//     "Kolkata Knight Riders": ["KKR", "Kolkata"],
//     "Delhi Capitals": ["DC", "Delhi"],
//     "Rajasthan Royals": ["RR", "Rajasthan"],
//     "Punjab Kings": ["PBKS", "Punjab"],
//     "Lucknow Super Giants": ["LSG", "Lucknow"],
//     "Gujarat Titans": ["GT", "Gujarat"],
// };

// function audioMatchesTeam(audioTitle: string, teamName: string): boolean {
//     const abbrs = TEAM_ABBR_MAP[teamName] || [teamName];
//     const title = audioTitle.toUpperCase();
//     return abbrs.some((abbr) => title.includes(abbr.toUpperCase()));
// }

// interface MatchInfo {
//     team1?: string;
//     team2?: string;
//     type?: string;
//     speaker?: string;
//     date?: string;
// }

// interface AudioFile {
//     id: string;
//     title: string;
//     fileName: string;
//     url: string;
//     duration: string;
//     durationSeconds: number;
//     size: number;
//     sizeFormatted: string;
//     format: string;
//     createdAt: string;
//     createdAtFormatted: string;
//     folder: string;
//     matchInfo?: MatchInfo;
// }

// interface VideoFile {
//     id: string;
//     title: string;
//     fileName: string;
//     url: string;
//     duration: string;
//     durationSeconds: number;
//     size: number;
//     sizeFormatted: string;
//     format: string;
//     width: number;
//     height: number;
//     createdAt: string;
//     createdAtFormatted: string;
//     folder: string;
//     playerInfo?: {
//         playerName?: string;
//         chapter?: string;
//         chapterNumber?: number;
//     };
// }

// interface Drop {
//     id: string;
//     title: string;
//     duration: string;
//     plays: string;
//     author: string;
//     badge: "Inner Room" | "Public";
//     type: "audio" | "video";
//     url?: string;
//     createdAt?: string;
// }

// interface DateGroup {
//     label: string;
//     audioDrops: Drop[];
//     videoDrops: Drop[];
// }

// function audioFileToDrop(audio: AudioFile): Drop {
//     return {
//         id: audio.id,
//         title: audio.title,
//         duration: audio.duration,
//         plays: "0",
//         author: audio.matchInfo?.speaker || "Unknown",
//         badge: "Inner Room",
//         type: "audio",
//         url: audio.url,
//         createdAt: audio.createdAt,
//     };
// }

// function videoFileToDrop(video: VideoFile): Drop {
//     return {
//         id: video.id,
//         title: video.title,
//         duration: video.duration,
//         plays: "0",
//         author: video.playerInfo?.playerName || "Unknown",
//         badge: "Inner Room",
//         type: "video",
//         url: video.url,
//         createdAt: video.createdAt,
//     };
// }

// function groupByDate(audioDrops: Drop[], videoDrops: Drop[]): DateGroup[] {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     const groups = new Map<string, { audioDrops: Drop[]; videoDrops: Drop[] }>();

//     const getLabel = (createdAt?: string) => {
//         if (!createdAt) return "Unknown";
//         const date = new Date(createdAt);
//         date.setHours(0, 0, 0, 0);
//         const dateString = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
//         if (date.getTime() === today.getTime()) return `Today (${dateString})`;
//         if (date.getTime() === yesterday.getTime()) return `Yesterday (${dateString})`;
//         return dateString;
//     };

//     const ensureGroup = (label: string) => {
//         if (!groups.has(label)) groups.set(label, { audioDrops: [], videoDrops: [] });
//     };

//     audioDrops.forEach((drop) => {
//         const label = getLabel(drop.createdAt);
//         ensureGroup(label);
//         groups.get(label)!.audioDrops.push(drop);
//     });

//     videoDrops.forEach((drop) => {
//         const label = getLabel(drop.createdAt);
//         ensureGroup(label);
//         groups.get(label)!.videoDrops.push(drop);
//     });

//     return Array.from(groups.entries()).map(([label, { audioDrops, videoDrops }]) => ({
//         label,
//         audioDrops,
//         videoDrops,
//     }));
// }

// function isRecentDrop(createdAt?: string, hoursThreshold = 24): boolean {
//     if (!createdAt) return false;
//     const now = Date.now();
//     const created = new Date(createdAt).getTime();
//     return now - created < hoursThreshold * 60 * 60 * 1000;
// }

// // ── DropRow 
// function DropRow({ drop, seenDropIds = [], onSeen = () => {}, userId }: {
//     drop: Drop;
//     seenDropIds: string[];
//     onSeen: (id: string) => void;
//     userId?: string;
// }) {
//     const isSeen = seenDropIds.includes(drop.id);
//     const isNew = isRecentDrop(drop.createdAt);
//     const [playing, setPlaying] = useState(false);
//     const [duration, setDuration] = useState<string>(drop.duration || "0:00");
//     const audioRef = useRef<HTMLAudioElement | null>(null);
//     const hasCountedPlay = useRef(false);
//     const { audioManager, currentAudio } = useGlobalAudio();

//     // ── Pull plays from context 
//     const { playsMap, incrementPlay } = usePlays();
//     const plays = playsMap[drop.id] ?? parseInt(drop.plays || "0");

//     const isCurrentlyPlaying = currentAudio === audioRef.current && playing;

//     useEffect(() => {
//         if (drop.type === "audio" && drop.url) {
//             audioRef.current = new Audio(drop.url);
//             const handleMetadata = () => {
//                 const audio = audioRef.current;
//                 if (audio && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
//                     const m = Math.floor(audio.duration / 60);
//                     const s = Math.floor(audio.duration % 60);
//                     setDuration(`${m}:${s.toString().padStart(2, "0")}`);
//                 }
//             };
//             audioRef.current.addEventListener("loadedmetadata", handleMetadata);
//             return () => {
//                 if (audioRef.current) {
//                     audioRef.current.pause();
//                     audioRef.current.src = "";
//                     audioRef.current.load();
//                     audioRef.current.removeEventListener("loadedmetadata", handleMetadata);
//                     audioRef.current = null;
//                 }
//             };
//         }
//     }, [drop.url, drop.type]);

//     const handleClick = () => {
//         if (!isSeen && userId) {
//             axios.post("/api/cloudinary/drops/seen", { dropId: drop.id, userId })
//                 .catch(err => console.error(`[handleClick] POST failed:`, err?.response?.data || err.message));
//             onSeen(drop.id);
//         }
//     };

//     const togglePlay = () => {
//         const audio = audioRef.current;
//         if (!audio) return;
//         handleClick();
//         if (playing && currentAudio === audio) {
//             audioManager.pause(audio, () => setPlaying(false));
//         } else {
//             audioManager.play(
//                 audio,
//                 () => {
//                     setPlaying(true);
//                     // Use context incrementPlay instead of direct axios call
//                     if (!hasCountedPlay.current) {
//                         hasCountedPlay.current = true;
//                         incrementPlay(drop.id);
//                     }
//                 },
//                 () => setPlaying(false)
//             );
//         }
//     };

//     useEffect(() => {
//         if (currentAudio !== audioRef.current && playing) setPlaying(false);
//     }, [currentAudio]);

//     useEffect(() => {
//         return () => {
//             if (audioRef.current && currentAudio === audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current = null;
//             }
//         };
//     }, []);

//     const dropHref = drop.type === "video"
//         ? `/MainModules/MatchesDropContent/VideoDropScreen?id=${encodeURIComponent(drop.id)}`
//         : `/MainModules/MatchesDropContent/AudioDropScreen?id=${encodeURIComponent(drop.id)}`;

//     return (
//         <div className="flex items-center justify-between px-3 py-3 bg-[#141414] rounded-xl mb-2 gap-3 relative">
//             <Link
//                 href={dropHref}
//                 className="flex items-center gap-3 min-w-0 flex-1"
//                 onClick={handleClick}
//             >
//                 <button
//                     onClick={(e) => {
//                         e.preventDefault();
//                         if (drop.type === "audio") togglePlay();
//                     }}
//                     className="w-10 h-10 rounded-lg bg-[#1e1e1e] flex items-center justify-center flex-shrink-0 border border-white/5 hover:border-[#C9115F]/40 transition-colors"
//                 >
//                     {drop.type === "audio" ? (
//                         isCurrentlyPlaying ? (
//                             <span className="w-3 h-3 flex gap-0.5 items-end">
//                                 <span className="w-1 h-3 bg-[#C9115F] rounded-sm animate-pulse" />
//                                 <span className="w-1 h-2 bg-[#C9115F] rounded-sm animate-pulse delay-75" />
//                                 <span className="w-1 h-3 bg-[#C9115F] rounded-sm animate-pulse delay-150" />
//                             </span>
//                         ) : (
//                             <Headphones size={16} className="text-[#C9115F]" />
//                         )
//                     ) : (
//                         <Play size={16} className="text-[#C9115F]" fill="#C9115F" />
//                     )}
//                 </button>

//                 <div className="min-w-0 flex-1">
//                     <p className="text-white text-sm font-medium leading-snug line-clamp-2">{drop.title}</p>

//                     {/* Duration + plays + video badge */}
//                     <div className="flex items-center gap-2 mt-0.5 flex-wrap">
//                         <span className="text-gray-500 text-xs">{duration}</span>
//                         {/* Plays count */}
//                         {plays > 0 && (
//                             <span className="flex items-center gap-0.5 text-gray-600 text-[10px]">
//                                 <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
//                                     <path d="M1.5 1L7 4L1.5 7V1Z" fill="#666" />
//                                 </svg>
//                                 {plays.toLocaleString()} Plays
//                             </span>
//                         )}
//                         {drop.type === "video" && (
//                             <span className="text-xs text-[#C9115F] bg-[#C9115F]/10 px-1.5 py-0.5 rounded-full">Video</span>
//                         )}
//                     </div>

//                     <div className="flex flex-row items-start gap-1 mt-0.5">
//                         <Users size={10} className="text-gray-600 mt-1" />
//                         <span className="text-gray-500 text-[11px]">by {drop.author}</span>
//                     </div>
//                 </div>
//             </Link>

//             {isNew && !isSeen && (
//                 <span className="absolute top-8 right-5 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]" />
//             )}
//         </div>
//     );
// }

// // ── SectionLabel 
// function SectionLabel({ label }: { label: string }) {
//     const isToday = label.startsWith("Today");
//     return (
//         <div className={`inline-block px-3 py-1 rounded-md mb-4 text-sm font-semibold ${isToday ? "bg-[#b8460a] text-white" : "bg-[#1e1e1e] text-gray-300 border border-white/10"}`}>
//             {label}
//         </div>
//     );
// }


// export default function FullPlaylist() {
//     const searchParams = useSearchParams();
//     const teamFilter = searchParams.get("team");

//     const { user, getUserName, getUserDisplayName, isAuthenticated, loading: authLoading } = useAuth();
//     const { fetchPlays } = usePlays();

//     const [requestText, setRequestText] = useState("");
//     const [dateGroups, setDateGroups] = useState<DateGroup[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [search, setSearch] = useState("");
//     const [submitting, setSubmitting] = useState(false);
//     const [submitted, setSubmitted] = useState(false);
//     const [submitError, setSubmitError] = useState<string | null>(null);
//     const [displayName, setDisplayName] = useState("");
//     const [seenDropIds, setSeenDropIds] = useState<string[]>([]);
//     const requestPanelRef = useRef<HTMLDivElement>(null);

//     const getUserId = () => {
//         if (user?.userId) return user.userId;
//         let userId = localStorage.getItem("drop_request_user_id");
//         if (!userId) {
//             userId = `user_${Math.random().toString(36).substr(2, 9)}`;
//             localStorage.setItem("drop_request_user_id", userId);
//         }
//         return userId;
//     };

//     const getStableUserId = (): string | null => {
//         if (user?.userId) return user.userId;
//         if (user?.email) return `email_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}`;
//         return null;
//     };

//     useEffect(() => {
//         if (!authLoading) {
//             if (isAuthenticated && user) {
//                 const name = getUserDisplayName();
//                 setDisplayName(name);
//                 localStorage.setItem("drop_request_user_name", name);
//             } else {
//                 let storedName = localStorage.getItem("drop_request_user_name");
//                 if (!storedName) {
//                     storedName = `Fan_${Math.random().toString(36).substr(2, 5)}`;
//                     localStorage.setItem("drop_request_user_name", storedName);
//                 }
//                 setDisplayName(storedName);
//             }
//         }
//     }, [user, isAuthenticated, authLoading, getUserDisplayName]);

//     useEffect(() => {
//         const stableId = getStableUserId();
//         if (!authLoading && stableId) {
//             axios.get(`/api/cloudinary/drops/seen?userId=${stableId}`)
//                 .then(res => {
//                     if (res.data.success) {
//                         setSeenDropIds(Array.isArray(res.data.seenDropIds) ? res.data.seenDropIds : []);
//                     }
//                 })
//                 .catch(err => console.error(`[FullPlaylist] Seen drops error:`, err?.response?.data || err.message));
//         }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [user?.userId, user?.email, authLoading]);

//     const getUserNameForRequest = () => {
//         if (isAuthenticated && user) return getUserName();
//         const stored = localStorage.getItem("drop_request_user_name");
//         if (stored) return stored.toLowerCase().replace(/\s/g, "_");
//         return `fan_${Math.random().toString(36).substr(2, 5)}`;
//     };

//     const scrollToRequestPanel = () => {
//         requestPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//     };

//     const handleSubmitRequest = async () => {
//         if (!requestText.trim()) return;
//         setSubmitting(true);
//         setSubmitError(null);
//         try {
//             const response = await axios.post("/api/request-drop", {
//                 userName: getUserNameForRequest(),
//                 message: requestText.trim(),
//                 audioTitle: null,
//                 userId: getUserId(),
//             });
//             if (response.data.success) {
//                 setSubmitted(true);
//                 setRequestText("");
//                 setTimeout(() => setSubmitted(false), 3000);
//             } else {
//                 setSubmitError(response.data.message || "Failed to submit request");
//                 setTimeout(() => setSubmitError(null), 3000);
//             }
//         } catch {
//             setSubmitError("Something went wrong. Please try again.");
//             setTimeout(() => setSubmitError(null), 3000);
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     useEffect(() => { fetchAll(); }, [teamFilter]);

//     const fetchAll = async (searchTerm?: string) => {
//         setLoading(true);
//         setError(null);

//         try {
//             const params = new URLSearchParams({ limit: "500" });
//             if (searchTerm) params.append("search", searchTerm);

//             const [audioRes, videoRes] = await Promise.all([
//                 axios.get(`/api/cloudinary/audio?${params.toString()}`),
//                 axios.get(`/api/cloudinary/video?limit=50`),
//             ]);

//             // Fetch plays into context (DropRow reads from context automatically)
//             fetchPlays();

//             let audioDrops: Drop[] = [];
//             if (audioRes.data.success) {
//                 audioDrops = audioRes.data.audioFiles.map((audio: AudioFile) => audioFileToDrop(audio));
//                 if (teamFilter) {
//                     audioDrops = audioDrops.filter((d) => audioMatchesTeam(d.title, teamFilter));
//                 }
//             }

//             let videoDrops: Drop[] = [];
//             if (videoRes.data.success) {
//                 videoDrops = videoRes.data.videoFiles.map((video: VideoFile) => videoFileToDrop(video));
//             }

//             setDateGroups(groupByDate(audioDrops, videoDrops));
//         } catch (err) {
//             console.error("[fetchAll] Error:", err);
//             setError("Something went wrong. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const val = e.target.value;
//         setSearch(val);
//         fetchAll(val || undefined);
//     };

//     const handleSeen = (id: string) => {
//         setSeenDropIds(prev => {
//             const safePrev = Array.isArray(prev) ? prev : [];
//             return [...safePrev, id];
//         });
//     };

//     return (
//         <div className="min-h-screen bg-[#0d0d10] text-white pb-10">
//             <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d10] z-10">
//                 <Link href="/MainModules/HomePage">
//                     <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
//                         <ArrowLeft size={20} />
//                     </button>
//                 </Link>
//                 <div className="flex-1 min-w-0">
//                     <h1 className="text-base font-bold text-white leading-tight">
//                         {teamFilter ? `${teamFilter}` : "Full Playlist"}
//                     </h1>
//                     <p className="text-xs text-gray-500">
//                         {teamFilter ? "Match Audio Drops" : "All Audio & Video Drops"}
//                     </p>
//                 </div>
//                 {teamFilter && (
//                     <div className="flex items-center gap-2 flex-shrink-0">
//                         <span className="text-[10px] bg-[#C9115F]/20 text-[#C9115F] border border-[#C9115F]/30 px-2 py-1 rounded-full font-bold">
//                             {teamFilter}
//                         </span>
//                         <Link href="/MainModules/MatchesDropContent">
//                             <button className="text-gray-500 hover:text-white text-xs transition-colors">✕</button>
//                         </Link>
//                     </div>
//                 )}
//             </div>

//             {!teamFilter && (
//                 <div className="w-full lg:w-[50%] ml-0 lg:ml-38 px-4 pt-3">
//                     <input
//                         type="text"
//                         value={search}
//                         onChange={handleSearch}
//                         placeholder="Search drops..."
//                         className="w-full bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C9115F]/50"
//                     />
//                 </div>
//             )}

//             <button
//                 onClick={scrollToRequestPanel}
//                 className="lg:hidden block text-[12px] text-white bg-[#C9115F] px-3 py-1 w-fit mt-6 rounded-full ml-4"
//             >
//                 Request Drop
//             </button>

//             <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 px-4 lg:px-8 py-6 max-w-6xl mx-auto">
//                 <div className="flex-1 min-w-0">
//                     {loading ? (
//                         <div className="flex items-center justify-center py-20">
//                             <Loader2 size={28} className="animate-spin text-[#C9115F]" />
//                             <span className="ml-3 text-gray-400 text-sm">Loading drops...</span>
//                         </div>
//                     ) : error ? (
//                         <div className="flex flex-col items-center justify-center py-20 gap-3">
//                             <p className="text-red-400 text-sm">{error}</p>
//                             <button onClick={() => fetchAll()} className="px-4 py-2 bg-[#C9115F] text-white text-xs rounded-lg hover:opacity-90">
//                                 Retry
//                             </button>
//                         </div>
//                     ) : dateGroups.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center py-20 gap-4">
//                             <p className="text-gray-500 text-sm text-center">
//                                 {teamFilter ? `No audio drops found for ${teamFilter} yet.` : search ? `No drops found for "${search}"` : "No drops available."}
//                             </p>
//                             {teamFilter && (
//                                 <Link href="/MainModules/MatchesDropContent">
//                                     <button className="px-4 py-2 bg-[#1e1e1e] text-gray-300 text-xs rounded-lg border border-white/10 hover:bg-[#2a2a2a] transition-colors">
//                                         View All Drops
//                                     </button>
//                                 </Link>
//                             )}
//                         </div>
//                     ) : (
//                         dateGroups.map((group) => (
//                             <div key={group.label} className="mb-8">
//                                 <SectionLabel label={group.label} />
//                                 {group.audioDrops.length > 0 && (
//                                     <div className="mb-5">
//                                         <p className="text-gray-400 text-sm font-medium mb-3">Audio Drops</p>
//                                         {group.audioDrops.map((drop) => (
//                                             <DropRow
//                                                 key={drop.id}
//                                                 drop={drop}
//                                                 seenDropIds={seenDropIds}
//                                                 onSeen={handleSeen}
//                                                 userId={getStableUserId() ?? undefined}
//                                             />
//                                         ))}
//                                     </div>
//                                 )}
//                                 {group.videoDrops.length > 0 && (
//                                     <div>
//                                         <p className="text-gray-400 text-sm font-medium mb-3">Video Drops</p>
//                                         {group.videoDrops.map((drop) => (
//                                             <DropRow
//                                                 key={drop.id}
//                                                 drop={drop}
//                                                 seenDropIds={seenDropIds}
//                                                 onSeen={handleSeen}
//                                                 userId={getStableUserId() ?? undefined}
//                                             />
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         ))
//                     )}
//                 </div>

//                 <div className="w-full lg:w-[340px] flex-shrink-0" ref={requestPanelRef}>
//                     <div className="bg-[#141414] rounded-2xl border border-white/5 p-5 lg:sticky lg:top-24">
//                         <div className="flex items-start gap-3 mb-4">
//                             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9115F] to-[#e85d04] flex items-center justify-center flex-shrink-0">
//                                 <span className="text-white text-sm font-bold">e</span>
//                             </div>
//                             <div>
//                                 <p className="text-white text-sm font-semibold leading-tight">Request a drop</p>
//                                 <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
//                                     {teamFilter ? `Want more ${teamFilter} content? Request a specific topic or moment!` : "Want to hear more from a specific team? Request a topic or moment!"}
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="mb-3 p-2 bg-[#1a1a1a] rounded-lg border border-white/5">
//                             <p className="text-gray-500 text-xs">Requesting as:</p>
//                             <p className="text-[#C9115F] text-sm font-medium">
//                                 {authLoading ? "Loading..." : displayName}
//                                 {isAuthenticated && user && <span className="ml-2 text-xs text-green-400">(Verified)</span>}
//                             </p>
//                         </div>

//                         <textarea
//                             value={requestText}
//                             onChange={(e) => setRequestText(e.target.value)}
//                             placeholder={teamFilter ? `Request a ${teamFilter} drop...` : "What would you like to hear about?"}
//                             rows={4}
//                             className="w-full bg-[#0d0d10] text-white text-sm placeholder-gray-600 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#C9115F]/50 resize-none transition-colors"
//                         />

//                         <div className="flex justify-end mt-1">
//                             <span className="text-gray-600 text-xs">{requestText.length}/500</span>
//                         </div>

//                         {submitted && (
//                             <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
//                                 <p className="text-green-400 text-xs text-center">✓ Request submitted successfully!</p>
//                                 <p className="text-gray-500 text-xs text-center mt-1">We&apos;ll review your request shortly.</p>
//                             </div>
//                         )}

//                         {submitError && (
//                             <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
//                                 <p className="text-red-400 text-xs text-center">{submitError}</p>
//                             </div>
//                         )}

//                         <button
//                             onClick={handleSubmitRequest}
//                             disabled={submitting || !requestText.trim()}
//                             className="w-full mt-4 py-3 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-[#C9115F] to-[#e85d04] hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                         >
//                             {submitting && <Loader2 size={14} className="animate-spin" />}
//                             {submitting ? "Submitting..." : "Submit Request"}
//                         </button>

//                         {!isAuthenticated && !authLoading && (
//                             <p className="text-gray-600 text-xs text-center mt-3">
//                                 Not signed in? Your requests will appear as {displayName}
//                             </p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

















"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Headphones, Play, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import {  usePlays } from "@/context/PlaysContext";

const TEAM_ABBR_MAP: Record<string, string[]> = {
    "Mumbai Indians": ["MI", "Mumbai"],
    "Chennai Super Kings": ["CSK", "Chennai"],
    "Royal Challengers Bengaluru": ["RCB", "Bengaluru", "Bangalore"],
    "Sunrisers Hyderabad": ["SRH", "Hyderabad"],
    "Kolkata Knight Riders": ["KKR", "Kolkata"],
    "Delhi Capitals": ["DC", "Delhi"],
    "Rajasthan Royals": ["RR", "Rajasthan"],
    "Punjab Kings": ["PBKS", "Punjab"],
    "Lucknow Super Giants": ["LSG", "Lucknow"],
    "Gujarat Titans": ["GT", "Gujarat"],
};

function audioMatchesTeam(audio: AudioFile, teamName: string): boolean {
    if (!audio || !teamName) return false;

    const filter = teamName.toLowerCase().trim();
    const folder = audio.folder.toLowerCase().trim();
    const title = audio.title.toLowerCase();

    console.log("FILTER:", filter);
    console.log("FOLDER:", folder);

    // FIFA
    if (filter === "fifa") {
        return folder.includes("fifa");
    }

    // WOMEN T20
    if (
        filter.includes("women") ||
        filter.includes("womens")
    ) {
        return (
            folder.includes("women") ||
            folder.includes("womens_t20")
        );
    }

    // IPL TEAMS
    const abbrs = TEAM_ABBR_MAP[teamName] || [];

    if (title.includes(filter)) return true;

    return abbrs.some((abbr) =>
        title.includes(abbr.toLowerCase())
    );
}

interface MatchInfo {
    team1?: string;
    team2?: string;
    type?: string;
    speaker?: string;
    date?: string;
}

interface AudioFile {
    id: string;
    title: string;
    fileName: string;
    url: string;
    duration: string;
    durationSeconds: number;
    size: number;
    sizeFormatted: string;
    format: string;
    createdAt: string;
    createdAtFormatted: string;
    folder: string;
    matchInfo?: MatchInfo;
}

interface VideoFile {
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
    playerInfo?: {
        playerName?: string;
        chapter?: string;
        chapterNumber?: number;
    };
}

interface Drop {
    id: string;
    title: string;
    duration: string;
    durationSeconds: number;
    plays: string;
    author: string;
    badge: "Inner Room" | "Public";
    type: "audio" | "video";
    url?: string;
    createdAt?: string;
}

interface DateGroup {
    label: string;
    audioDrops: Drop[];
    videoDrops: Drop[];
}

function extractSpeakerFromTitle(title: string): string {
    if (!title) return "Unknown";
    
    // Keywords after which the speaker name appears
    const keywords = ["Pre Match", "Post Match", "Toss Report", "Dispatch"];
    
    // Regex to match the date format like "13 May 2026" or "14 May 2026"
    const dateRegex = /\d{1,2}\s+[A-Z][a-z]+\s+\d{4}/;
    
    let speakerPart = "";
    
    // Try to find the part after the keywords
    for (const keyword of keywords) {
        if (title.includes(keyword)) {
            const index = title.indexOf(keyword) + keyword.length;
            speakerPart = title.substring(index).trim();
            break;
        }
    }
    
    if (speakerPart) {
        // Remove the date part from speakerPart to get just the name
        const dateMatch = speakerPart.match(dateRegex);
        if (dateMatch && dateMatch.index !== undefined) {
            const name = speakerPart.substring(0, dateMatch.index).trim();
            if (name) return name;
        } else {
            // If no date found, return the whole part after the keyword
            return speakerPart;
        }
    }
    
    return "Unknown";
}

function audioFileToDrop(audio: AudioFile): Drop {
    return {
        id: audio.id,
        title: audio.title,
        duration: audio.duration,
        durationSeconds: audio.durationSeconds || 0,
        plays: "0",
        author: audio.matchInfo?.speaker || extractSpeakerFromTitle(audio.title),
        badge: "Inner Room",
        type: "audio",
        url: audio.url,
        createdAt: audio.createdAt,
    };
}

function videoFileToDrop(video: VideoFile): Drop {
    return {
        id: video.id,
        title: video.title,
        duration: video.duration,
        durationSeconds: video.durationSeconds || 0,
        plays: "0",
        author: extractSpeakerFromTitle(video.title),
        badge: "Inner Room",
        type: "video",
        url: video.url,
        createdAt: video.createdAt,
    };
}

function groupByDate(audioDrops: Drop[], videoDrops: Drop[]): DateGroup[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = new Map<string, { audioDrops: Drop[]; videoDrops: Drop[] }>();

    const getLabel = (createdAt?: string) => {
        if (!createdAt) return "Unknown";
        const date = new Date(createdAt);
        date.setHours(0, 0, 0, 0);
        const dateString = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        if (date.getTime() === today.getTime()) return `Today (${dateString})`;
        if (date.getTime() === yesterday.getTime()) return `Yesterday (${dateString})`;
        return dateString;
    };

    const ensureGroup = (label: string) => {
        if (!groups.has(label)) groups.set(label, { audioDrops: [], videoDrops: [] });
    };

    audioDrops.forEach((drop) => {
        const label = getLabel(drop.createdAt);
        ensureGroup(label);
        groups.get(label)!.audioDrops.push(drop);
    });

    videoDrops.forEach((drop) => {
        const label = getLabel(drop.createdAt);
        ensureGroup(label);
        groups.get(label)!.videoDrops.push(drop);
    });

    return Array.from(groups.entries()).map(([label, { audioDrops, videoDrops }]) => ({
        label,
        audioDrops,
        videoDrops,
    }));
}

function isRecentDrop(createdAt?: string, hoursThreshold = 24): boolean {
    if (!createdAt) return false;
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    return now - created < hoursThreshold * 60 * 60 * 1000;
}

// ── DropRow ───────────────────────────────────────────────────────────────────
function DropRow({ drop, seenDropIds = [], onSeen = () => {}, userId }: {
    drop: Drop;
    seenDropIds: string[];
    onSeen: (id: string) => void;
    userId?: string;
}) {
    const isSeen = seenDropIds.includes(drop.id);
    const isNew = isRecentDrop(drop.createdAt);
    const [playing, setPlaying] = useState(false);
    // For video, format duration from durationSeconds immediately — no need to load the file
    const formatSecs = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };
    const [duration, setDuration] = useState<string>(
        drop.durationSeconds > 0 ? formatSecs(drop.durationSeconds) : (drop.duration || "0:00")
    );
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasCountedPlay = useRef(false);
    const { audioManager, currentAudio } = useGlobalAudio();

    // ── Pull plays from context ──────────────────────────────────────────────
    const { playsMap, incrementPlay } = usePlays();
    const plays = playsMap[drop.id] ?? parseInt(drop.plays || "0");

    const isCurrentlyPlaying = currentAudio === audioRef.current && playing;

    useEffect(() => {
        if (drop.type === "audio" && drop.url) {
            audioRef.current = new Audio(drop.url);
            const handleMetadata = () => {
                const audio = audioRef.current;
                if (audio && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                    // Only update if we didn't already have a good value from durationSeconds
                    if (!drop.durationSeconds) {
                        const m = Math.floor(audio.duration / 60);
                        const s = Math.floor(audio.duration % 60);
                        setDuration(`${m}:${s.toString().padStart(2, "0")}`);
                    }
                }
            };
            audioRef.current.addEventListener("loadedmetadata", handleMetadata);
            return () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = "";
                    audioRef.current.load();
                    audioRef.current.removeEventListener("loadedmetadata", handleMetadata);
                    audioRef.current = null;
                }
            };
        }
    }, [drop.url, drop.type, drop.durationSeconds]);

    const handleClick = () => {
        if (!isSeen && userId) {
            axios.post("/api/cloudinary/drops/seen", { dropId: drop.id, userId })
                .catch(err => console.error(`[handleClick] POST failed:`, err?.response?.data || err.message));
            onSeen(drop.id);
        }
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        handleClick();
        if (playing && currentAudio === audio) {
            audioManager.pause(audio, () => setPlaying(false));
        } else {
            audioManager.play(
                audio,
                () => {
                    setPlaying(true);
                    // Use context incrementPlay instead of direct axios call
                    if (!hasCountedPlay.current) {
                        hasCountedPlay.current = true;
                        incrementPlay(drop.id);
                    }
                },
                () => setPlaying(false)
            );
        }
    };

    useEffect(() => {
        if (currentAudio !== audioRef.current && playing) setPlaying(false);
    }, [currentAudio]);

    useEffect(() => {
        return () => {
            if (audioRef.current && currentAudio === audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const dropHref = drop.type === "video"
        ? `/MainModules/MatchesDropContent/VideoDropScreen?id=${encodeURIComponent(drop.id)}`
        : `/MainModules/MatchesDropContent/AudioDropScreen?id=${encodeURIComponent(drop.id)}`;

    return (
        <div className="flex items-center justify-between px-3 py-3 bg-[#141414] rounded-xl mb-2 gap-3 relative">
            <Link
                href={dropHref}
                className="flex items-center gap-3 min-w-0 flex-1"
                onClick={handleClick}
            >
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (drop.type === "audio") togglePlay();
                    }}
                    className="w-10 h-10 rounded-lg bg-[#1e1e1e] flex items-center justify-center flex-shrink-0 border border-white/5 hover:border-[#C9115F]/40 transition-colors"
                >
                    {drop.type === "audio" ? (
                        isCurrentlyPlaying ? (
                            <span className="w-3 h-3 flex gap-0.5 items-end">
                                <span className="w-1 h-3 bg-[#C9115F] rounded-sm animate-pulse" />
                                <span className="w-1 h-2 bg-[#C9115F] rounded-sm animate-pulse delay-75" />
                                <span className="w-1 h-3 bg-[#C9115F] rounded-sm animate-pulse delay-150" />
                            </span>
                        ) : (
                            <Headphones size={16} className="text-[#C9115F]" />
                        )
                    ) : (
                        <Play size={16} className="text-[#C9115F]" fill="#C9115F" />
                    )}
                </button>

                <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium leading-snug line-clamp-2">{drop.title}</p>

                    {/* Duration + plays + video badge */}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-gray-500 text-xs">{duration}</span>
                        {/* Plays count */}
                        {plays > 0 && (
                            <span className="flex items-center gap-0.5 text-gray-600 text-[10px]">
                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                    <path d="M1.5 1L7 4L1.5 7V1Z" fill="#666" />
                                </svg>
                                {plays.toLocaleString()}
                            </span>
                        )}
                        {drop.type === "video" && (
                            <span className="text-xs text-[#C9115F] bg-[#C9115F]/10 px-1.5 py-0.5 rounded-full">Video</span>
                        )}
                    </div>

                    <div className="flex flex-row items-start gap-1 mt-0.5">
                        <Users size={10} className="text-gray-600 mt-1" />
                        <span className="text-gray-500 text-[11px]">by {drop.author}</span>
                    </div>
                </div>
            </Link>

            {isNew && !isSeen && (
                <span className="absolute top-8 right-5 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]" />
            )}
        </div>
    );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
    const isToday = label.startsWith("Today");
    return (
        <div className={`inline-block px-3 py-1 rounded-md mb-4 text-sm font-semibold ${isToday ? "bg-[#b8460a] text-white" : "bg-[#1e1e1e] text-gray-300 border border-white/10"}`}>
            {label}
        </div>
    );
}

// ── Inner component (has access to PlaysContext) ───────────────────────────────
export default function FullPlaylist() {
    const searchParams = useSearchParams();
    const teamFilter = searchParams.get("team");

    const { user, getUserName, getUserDisplayName, isAuthenticated, loading: authLoading } = useAuth();
    const { fetchPlays } = usePlays();

    const [requestText, setRequestText] = useState("");
    const [dateGroups, setDateGroups] = useState<DateGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [seenDropIds, setSeenDropIds] = useState<string[]>([]);
    const requestPanelRef = useRef<HTMLDivElement>(null);

    const getUserId = () => {
        if (user?.userId) return user.userId;
        let userId = localStorage.getItem("drop_request_user_id");
        if (!userId) {
            userId = `user_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("drop_request_user_id", userId);
        }
        return userId;
    };

    const getStableUserId = (): string | null => {
        if (user?.userId) return user.userId;
        if (user?.email) return `email_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}`;
        return null;
    };

    useEffect(() => {
        if (!authLoading) {
            if (isAuthenticated && user) {
                const name = getUserDisplayName();
                setDisplayName(name);
                localStorage.setItem("drop_request_user_name", name);
            } else {
                let storedName = localStorage.getItem("drop_request_user_name");
                if (!storedName) {
                    storedName = `Fan_${Math.random().toString(36).substr(2, 5)}`;
                    localStorage.setItem("drop_request_user_name", storedName);
                }
                setDisplayName(storedName);
            }
        }
    }, [user, isAuthenticated, authLoading, getUserDisplayName]);

    useEffect(() => {
        const stableId = getStableUserId();
        if (!authLoading && stableId) {
            axios.get(`/api/cloudinary/drops/seen?userId=${stableId}`)
                .then(res => {
                    if (res.data.success) {
                        setSeenDropIds(Array.isArray(res.data.seenDropIds) ? res.data.seenDropIds : []);
                    }
                })
                .catch(err => console.error(`[FullPlaylist] Seen drops error:`, err?.response?.data || err.message));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId, user?.email, authLoading]);

    const getUserNameForRequest = () => {
        if (isAuthenticated && user) return getUserName();
        const stored = localStorage.getItem("drop_request_user_name");
        if (stored) return stored.toLowerCase().replace(/\s/g, "_");
        return `fan_${Math.random().toString(36).substr(2, 5)}`;
    };

    const scrollToRequestPanel = () => {
        requestPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSubmitRequest = async () => {
        if (!requestText.trim()) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const response = await axios.post("/api/request-drop", {
                userName: getUserNameForRequest(),
                message: requestText.trim(),
                audioTitle: null,
                userId: getUserId(),
            });
            if (response.data.success) {
                setSubmitted(true);
                setRequestText("");
                setTimeout(() => setSubmitted(false), 3000);
            } else {
                setSubmitError(response.data.message || "Failed to submit request");
                setTimeout(() => setSubmitError(null), 3000);
            }
        } catch {
            setSubmitError("Something went wrong. Please try again.");
            setTimeout(() => setSubmitError(null), 3000);
        } finally {
            setSubmitting(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchAll(); }, [teamFilter]);

    const fetchAll = async (searchTerm?: string) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                limit: "500",
            });

            if (teamFilter === "FIFA") {
                params.append("type", "fifa");
            }

            if (
                teamFilter?.includes("Women")
            ) {
                params.append("type", "womens_t20");
            }
            if (searchTerm) params.append("search", searchTerm);

            const [audioRes, videoRes] = await Promise.all([
                axios.get(`/api/cloudinary/audio?${params.toString()}`),
                axios.get(`/api/cloudinary/video?limit=50`),
            ]);

            // Fetch plays into context (DropRow reads from context automatically)
            fetchPlays();

            let audioDrops: Drop[] = [];
            if (audioRes.data.success) {
                audioDrops = audioRes.data.audioFiles.map((audio: AudioFile) => audioFileToDrop(audio));
                if (teamFilter) {
                    audioDrops = audioRes.data.audioFiles
                    .filter((audio: AudioFile) => audioMatchesTeam(audio, teamFilter))
                    .map((audio: AudioFile) => audioFileToDrop(audio));
                }
            }

            let videoDrops: Drop[] = [];
            if (videoRes.data.success) {
                videoDrops = videoRes.data.videoFiles.map((video: VideoFile) => videoFileToDrop(video));
                // 👇 ADD THIS FIX: Filter videos so they don't leak across categories!
                if (teamFilter) {
                    videoDrops = videoRes.data.videoFiles.filter((video: VideoFile) => {
                    const filter = teamFilter.toLowerCase();
                    const folder = video.folder.toLowerCase();

    if (filter === "fifa") {
        return folder.includes("/fifa");
    }

    if (filter.includes("women")) {
        return folder.includes("/womens_t20");
    }

    return true;
}).map((video: VideoFile) => videoFileToDrop(video));
                }
            }

            setDateGroups(groupByDate(audioDrops, videoDrops));
        } catch (err) {
            console.error("[fetchAll] Error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        fetchAll(val || undefined);
    };

    const handleSeen = (id: string) => {
        setSeenDropIds(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            return [...safePrev, id];
        });
    };

    return (
        <div className="min-h-screen bg-[#0d0d10] text-white pb-10">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 sticky top-0 bg-[#0d0d10] z-10">
                <Link href="/MainModules/ROAR">
                    <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-base font-bold text-white leading-tight">
                        {teamFilter ? `${teamFilter}` : "Full Playlist"}
                    </h1>
                    <p className="text-xs text-gray-500">
                        {teamFilter ? "Match Audio Drops" : "All Audio & Video Drops"}
                    </p>
                </div>
                {teamFilter && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] bg-[#C9115F]/20 text-[#C9115F] border border-[#C9115F]/30 px-2 py-1 rounded-full font-bold">
                            {teamFilter}
                        </span>
                        <Link href="/MainModules/MatchesDropContent">
                            <button className="text-gray-500 hover:text-white text-xs transition-colors">✕</button>
                        </Link>
                    </div>
                )}
            </div>

            {!teamFilter && (
                <div className="w-full lg:w-[50%] ml-0 lg:ml-38 px-4 pt-3">
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search drops..."
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C9115F]/50"
                    />
                </div>
            )}

            <button
                onClick={scrollToRequestPanel}
                className="lg:hidden block text-[12px] text-white bg-[#C9115F] px-3 py-1 w-fit mt-6 rounded-full ml-4"
            >
                Request Drop
            </button>

            <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 px-4 lg:px-8 py-6 max-w-6xl mx-auto">
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={28} className="animate-spin text-[#C9115F]" />
                            <span className="ml-3 text-gray-400 text-sm">Loading drops...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <p className="text-red-400 text-sm">{error}</p>
                            <button onClick={() => fetchAll()} className="px-4 py-2 bg-[#C9115F] text-white text-xs rounded-lg hover:opacity-90">
                                Retry
                            </button>
                        </div>
                    ) : dateGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <p className="text-gray-500 text-sm text-center">
                                {teamFilter ? `No audio drops found for ${teamFilter} yet.` : search ? `No drops found for "${search}"` : "No drops available."}
                            </p>
                            {teamFilter && (
                                <Link href="/MainModules/MatchesDropContent">
                                    <button className="px-4 py-2 bg-[#1e1e1e] text-gray-300 text-xs rounded-lg border border-white/10 hover:bg-[#2a2a2a] transition-colors">
                                        View All Drops
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        dateGroups.map((group) => (
                            <div key={group.label} className="mb-8">
                                <SectionLabel label={group.label} />
                                {group.audioDrops.length > 0 && (
                                    <div className="mb-5">
                                        <p className="text-gray-400 text-sm font-medium mb-3">Audio Drops</p>
                                        {group.audioDrops.map((drop) => (
                                            <DropRow
                                                key={drop.id}
                                                drop={drop}
                                                seenDropIds={seenDropIds}
                                                onSeen={handleSeen}
                                                userId={getStableUserId() ?? undefined}
                                            />
                                        ))}
                                    </div>
                                )}
                                {group.videoDrops.length > 0 && (
                                    <div>
                                        <p className="text-gray-400 text-sm font-medium mb-3">Video Drops</p>
                                        {group.videoDrops.map((drop) => (
                                            <DropRow
                                                key={drop.id}
                                                drop={drop}
                                                seenDropIds={seenDropIds}
                                                onSeen={handleSeen}
                                                userId={getStableUserId() ?? undefined}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="w-full lg:w-[340px] flex-shrink-0" ref={requestPanelRef}>
                    <div className="bg-[#141414] rounded-2xl border border-white/5 p-5 lg:sticky lg:top-24">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9115F] to-[#e85d04] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">e</span>
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold leading-tight">Request a drop</p>
                                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                                    {teamFilter ? `Want more ${teamFilter} content? Request a specific topic or moment!` : "Want to hear more from a specific team? Request a topic or moment!"}
                                </p>
                            </div>
                        </div>
                        

                        {/* <div className="mb-3 p-2 bg-[#1a1a1a] rounded-lg border border-white/5">
                            <p className="text-gray-500 text-xs">Requesting as:</p>
                            <p className="text-[#C9115F] text-sm font-medium">
                                {authLoading ? "Loading..." : displayName}
                                {isAuthenticated && user && <span className="ml-2 text-xs text-green-400">(Verified)</span>}
                            </p>
                        </div> */}

                        <textarea
                            value={requestText}
                            onChange={(e) => setRequestText(e.target.value)}
                            placeholder={teamFilter ? `Request a ${teamFilter} drop...` : "What would you like to hear about?"}
                            rows={4}
                            className="w-full bg-[#0d0d10] text-white text-sm placeholder-gray-600 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#C9115F]/50 resize-none transition-colors"
                        />

                        <div className="flex justify-end mt-1">
                            <span className="text-gray-600 text-xs">{requestText.length}/500</span>
                        </div>

                        {submitted && (
                            <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-green-400 text-xs text-center">✓ Request submitted successfully!</p>
                                <p className="text-gray-500 text-xs text-center mt-1">We&apos;ll review your request shortly.</p>
                            </div>
                        )}

                        {submitError && (
                            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-400 text-xs text-center">{submitError}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSubmitRequest}
                            disabled={submitting || !requestText.trim()}
                            className="w-full mt-4 py-3 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-[#C9115F] to-[#e85d04] hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 size={14} className="animate-spin" />}
                            {submitting ? "Submitting..." : "Submit Request"}
                        </button>

                        {!isAuthenticated && !authLoading && (
                            <p className="text-gray-600 text-xs text-center mt-3">
                                Not signed in? Your requests will appear as {displayName}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

