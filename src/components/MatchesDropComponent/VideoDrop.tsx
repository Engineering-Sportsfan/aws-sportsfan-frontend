// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useSearchParams } from "next/navigation";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";
// import CommentsSection from "@/src/components/CommentsSection";
// import { ArrowLeft } from "lucide-react";
// import Link from "next/link";

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

// interface SignalMessage {
//     id: string;
//     videoId: string;
//     userId: string;
//     userName: string;
//     message: string;
//     createdAt: number;
// }

// const buildVideoShareUrl = (video: VideoFile) => {
//     if (typeof window === "undefined") return "";
//     const url = new URL(`${window.location.origin}/MainModules/MatchesDropContent/VideoDropScreen`);
//     url.searchParams.set("id", video.id);
//     return url.toString();
// };

// const buildVideoShareText = (video: VideoFile) => {
//     const shareUrl = buildVideoShareUrl(video);
//     return [
//         `Watch ${video.title} on Sportsfan`,
//         video.playerInfo?.playerName
//             ? `${video.playerInfo.playerName} · Chapter ${video.playerInfo.chapterNumber}`
//             : "Video Drop",
//         `Watch here: ${shareUrl}`,
//     ].filter(Boolean).join("\n");
// };

// const copyToClipboard = async (text: string) => {
//     try {
//         await navigator.clipboard.writeText(text);
//         return true;
//     } catch {
//         try {
//             const el = document.createElement("textarea");
//             el.value = text;
//             el.style.position = "fixed";
//             el.style.opacity = "0";
//             document.body.appendChild(el);
//             el.focus();
//             el.select();
//             const ok = document.execCommand("copy");
//             document.body.removeChild(el);
//             return ok;
//         } catch { return false; }
//     }
// };

// export default function VideoDropCard() {
//     const { user, getUserName } = useAuth();
//     const searchParams = useSearchParams();
//     const idParam = searchParams.get("id");
//     const resumeAt = parseFloat(searchParams.get("resume") || "0");

//     const [playing, setPlaying] = useState(false);
//     const [elapsed, setElapsed] = useState(0);
//     const [video, setVideo] = useState<VideoFile | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [videoError, setVideoError] = useState(false);

//     const [allVideoFiles, setAllVideoFiles] = useState<VideoFile[]>([]);
//     const [currentIndex, setCurrentIndex] = useState<number>(0);

//     const [playsCount, setPlaysCount] = useState(0);
//     const hasCountedPlay = useRef(false);
//     const videoIdRef = useRef<string | null>(null);

//     const [signalsCount, setSignalsCount] = useState(0);
//     const [recentSignals, setRecentSignals] = useState<SignalMessage[]>([]);
//     const [showSignalDialog, setShowSignalDialog] = useState(false);
//     const [signalMessage, setSignalMessage] = useState("");
//     const [sendingSignal, setSendingSignal] = useState(false);

//     const [showShareDialog, setShowShareDialog] = useState(false);
//     const [copied, setCopied] = useState(false);

//     const videoRef = useRef<HTMLVideoElement>(null);
//     const timerRef = useRef<NodeJS.Timeout | null>(null);
//     const progressSaveRef = useRef<NodeJS.Timeout | null>(null);
//     const elapsedRef = useRef(0);
//     const videoReadyToPlayRef = useRef(false);
//     const allVideoFilesRef = useRef<VideoFile[]>([]);
//     const currentIndexRef = useRef<number>(0);

//     useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
//     useEffect(() => { allVideoFilesRef.current = allVideoFiles; }, [allVideoFiles]);
//     useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

//     const getUserId = () => user?.userId || null;

//     const saveProgressToApi = async (elapsedSecs: number, vid: VideoFile) => {
//         const userId = getUserId();
//         if (!userId) return;
//         const totalSecs = vid.durationSeconds || 0;
//         const pct = totalSecs > 0 ? Math.round((elapsedSecs / totalSecs) * 100) : 0;
//         const subtitle = vid.playerInfo?.playerName
//             ? `${vid.playerInfo.playerName} · Chapter ${vid.playerInfo.chapterNumber}`
//             : "Video Drop";
//         try {
//             await axios.post("/api/video-progress", {
//                 userId,
//                 videoId: vid.id,
//                 title: vid.title,
//                 subtitle,
//                 elapsed: elapsedSecs,
//                 durationSeconds: totalSecs,
//                 pct,
//                 url: vid.url,
//             });
//         } catch (err) {
//             console.error("[progress] save error:", err);
//         }
//     };

//     const startProgressSaving = (vid: VideoFile) => {
//         if (progressSaveRef.current) clearInterval(progressSaveRef.current);
//         progressSaveRef.current = setInterval(() => {
//             saveProgressToApi(elapsedRef.current, vid);
//         }, 5000);
//     };

//     const stopProgressSaving = (vid: VideoFile) => {
//         if (progressSaveRef.current) {
//             clearInterval(progressSaveRef.current);
//             progressSaveRef.current = null;
//         }
//         saveProgressToApi(elapsedRef.current, vid);
//     };

//     useEffect(() => {
//         fetchVideoData();
//         return () => {
//             if (progressSaveRef.current) clearInterval(progressSaveRef.current);
//         };
//     }, [idParam]);

//     const fetchVideoData = async () => {
//         if (!idParam) { setError("No video ID provided"); setLoading(false); return; }
//         try {
//             setLoading(true);
//             videoReadyToPlayRef.current = false;
//             setError(null);
//             setElapsed(0);
//             elapsedRef.current = 0;
//             setPlaying(false);
//             hasCountedPlay.current = false;

//             const res = await axios.get(`/api/cloudinary/video?limit=50`);
//             if (res.data.success) {
//                 const allFiles: VideoFile[] = res.data.videoFiles;
//                 setAllVideoFiles(allFiles);
//                 allVideoFilesRef.current = allFiles;

//                 const foundIndex = allFiles.findIndex((v: VideoFile) => v.id === idParam);
//                 const targetIndex = foundIndex >= 0 ? foundIndex : 0;
//                 const found = allFiles[targetIndex];

//                 setCurrentIndex(targetIndex);
//                 currentIndexRef.current = targetIndex;

//                 if (found) {
//                     setVideo(found);
//                     videoIdRef.current = found.id;
//                     await fetchPlaysCount(found.id);
//                     await fetchSignalsCount(found.id);
//                     await fetchRecentSignals(found.id);

//                     if (resumeAt > 0) {
//                         setElapsed(resumeAt);
//                         elapsedRef.current = resumeAt;
//                         setTimeout(() => {
//                             if (videoRef.current) videoRef.current.currentTime = resumeAt;
//                         }, 500);
//                     }
//                 } else { setError("Video not found"); }
//             } else { setError("Failed to fetch videos"); }
//         } catch (err) {
//             console.error("[VideoDropCard] Error:", err);
//             setError("Failed to load video");
//         } finally {
//             videoReadyToPlayRef.current = true;
//             setLoading(false);
//         }
//     };

//     const navigateToVideo = (index: number) => {
//         const files = allVideoFilesRef.current;
//         if (index < 0 || index >= files.length) return;
//         const target = files[index];
//         setCurrentIndex(index);
//         currentIndexRef.current = index;
//         setPlaying(false);
//         setElapsed(0);
//         elapsedRef.current = 0;
//         setVideoError(false);
//         hasCountedPlay.current = false;
//         videoIdRef.current = target.id;
//         setVideo(target);
//         fetchPlaysCount(target.id);
//         fetchSignalsCount(target.id);
//         fetchRecentSignals(target.id);
//         const url = new URL(window.location.href);
//         url.searchParams.set("id", target.id);
//         url.searchParams.delete("resume");
//         window.history.pushState({}, "", url.toString());
//     };

//     const fetchPlaysCount = async (videoId: string) => {
//         try {
//             const res = await axios.get("/api/cloudinary/plays");
//             if (res.data.plays) setPlaysCount(res.data.plays[videoId] || 0);
//         } catch (err) { console.error("[plays] fetch error:", err); }
//     };

//     const incrementPlays = async () => {
//         const id = videoIdRef.current;
//         if (hasCountedPlay.current || !id) return;
//         hasCountedPlay.current = true;
//         try {
//             const res = await axios.post("/api/cloudinary/plays", { id });
//             if (res.data.success) setPlaysCount(res.data.plays);
//         } catch (err) { console.error("[plays] increment error:", err); }
//     };

//     const fetchSignalsCount = async (videoId: string) => {
//         try {
//             const res = await axios.get(`/api/video-messages?videoId=${videoId}&count=true`);
//             if (res.data.success) setSignalsCount(res.data.count);
//         } catch (err) { console.error("[signals] count error:", err); }
//     };

//     const fetchRecentSignals = async (videoId: string) => {
//         try {
//             const res = await axios.get(`/api/video-messages?videoId=${videoId}&limit=5`);
//             if (res.data.success) setRecentSignals(res.data.signals);
//         } catch (err) { console.error("[signals] fetch error:", err); }
//     };

//     const handleSendSignal = async () => {
//         if (!signalMessage.trim() || !video?.id) return;
//         setSendingSignal(true);
//         try {
//             const response = await axios.post("/api/video-messages", {
//                 videoId: video.id, videoTitle: video.title,
//                 userId: getUserId() || "anonymous",
//                 userName: getUserName(),
//                 message: signalMessage.trim(),
//             });
//             if (response.data.success) {
//                 setSignalsCount((prev) => prev + 1);
//                 setRecentSignals((prev) => [response.data.signal, ...prev].slice(0, 5));
//                 setShowSignalDialog(false);
//                 setSignalMessage("");
//                 alert("Signal sent successfully!");
//             }
//         } catch (err) {
//             console.error("[signals] send error:", err);
//             alert("Failed to send signal. Please try again.");
//         } finally { setSendingSignal(false); }
//     };

//     const handleShareToWhatsApp = () => { if (!video) return; window.open(`https://wa.me/?text=${encodeURIComponent(buildVideoShareText(video))}`, "_blank"); };
//     const handleShareToThreads = () => { if (!video) return; window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildVideoShareText(video))}`, "_blank"); };
//     const handleShareToInstagram = async () => { if (!video) return; await copyToClipboard(buildVideoShareText(video)); setCopied(true); setTimeout(() => setCopied(false), 1600); window.open("https://www.instagram.com/", "_blank"); };
//     const handleShareToLinkedIn = () => { if (!video) return; window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildVideoShareUrl(video))}`, "_blank"); };
//     const handleShareToX = () => { if (!video) return; window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildVideoShareText(video))}`, "_blank"); };
//     const handleCopyLink = async () => { if (!video) return; const ok = await copyToClipboard(buildVideoShareText(video)); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); } };

//     const handleLoadedMetadata = () => {
//         if (videoRef.current) {
//             const dur = videoRef.current.duration;
//             if (!isNaN(dur) && dur > 0) {
//                 const m = Math.floor(dur / 60);
//                 const s = Math.floor(dur % 60);
//                 setVideo(prev => prev ? { ...prev, duration: `${m}:${s.toString().padStart(2, "0")}`, durationSeconds: dur } : null);
//                 if (resumeAt > 0 && videoRef.current) {
//                     videoRef.current.currentTime = resumeAt;
//                     setElapsed(resumeAt);
//                     elapsedRef.current = resumeAt;
//                 }

//                 const tryPlay = () => {
//                     if (!videoRef.current) return;
//                     videoRef.current.play()
//                         .then(() => {
//                             setPlaying(true);
//                             incrementPlays();
//                             setVideo(prev => {
//                                 if (prev) startProgressSaving(prev);
//                                 return prev;
//                             });
//                         })
//                         .catch(console.error);
//                 };

//                 if (videoReadyToPlayRef.current) {
//                     tryPlay();
//                 } else {
//                     const poll = setInterval(() => {
//                         if (videoReadyToPlayRef.current) {
//                             clearInterval(poll);
//                             tryPlay();
//                         }
//                     }, 100);
//                 }
//             }
//         }
//     };

//     const handleVideoError = () => { setVideoError(true); setPlaying(false); };

//     const handleTimeUpdate = () => {
//         if (videoRef.current) setElapsed(videoRef.current.currentTime);
//     };

//     const handleVideoEnd = () => {
//         setPlaying(false);
//         setElapsed(0);
//         if (videoRef.current) videoRef.current.currentTime = 0;
//         incrementPlays();
//         if (video && getUserId()) {
//             axios.delete(`/api/video-progress?userId=${getUserId()}&videoId=${encodeURIComponent(video.id)}`)
//                 .catch(err => console.error("[progress] clear error:", err));
//         }
//         if (progressSaveRef.current) clearInterval(progressSaveRef.current);
//         // Auto-advance to next video
//         setTimeout(() => {
//             const nextIndex = currentIndexRef.current + 1;
//             if (nextIndex < allVideoFilesRef.current.length) {
//                 navigateToVideo(nextIndex);
//             }
//         }, 1000);
//     };

//     const togglePlay = () => {
//         if (!videoRef.current || !video) return;
//         if (playing) {
//             videoRef.current.pause();
//             setPlaying(false);
//             if (timerRef.current) clearInterval(timerRef.current);
//             stopProgressSaving(video);
//         } else {
//             videoRef.current.play().catch(() => setVideoError(true));
//             setPlaying(true);
//             incrementPlays();
//             startProgressSaving(video);
//         }
//     };

//     useEffect(() => {
//         return () => {
//             if (timerRef.current) clearInterval(timerRef.current);
//             if (progressSaveRef.current) clearInterval(progressSaveRef.current);
//         };
//     }, []);

//     const totalSecs = video?.durationSeconds || 0;
//     const mins = Math.floor(elapsed / 60);
//     const secs = Math.floor(elapsed % 60);
//     const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
//     const pct = totalSecs > 0 ? Math.round((elapsed / totalSecs) * 100) : 0;
//     const prevVideo = allVideoFiles[currentIndex - 1];
//     const nextVideo = allVideoFiles[currentIndex + 1];

//     if (loading) return (
//         <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
//             <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
//                 <p className="text-gray-400">Loading video...</p>
//             </div>
//         </div>
//     );

//     if (error || !video) return (
//         <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
//             <div className="text-center">
//                 <p className="text-red-400 mb-4">{error || "Video not found"}</p>
//                 <button onClick={() => window.history.back()} className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600">Go Back</button>
//             </div>
//         </div>
//     );

//     const shareButtons = (size: string) => (
//         <>
//             {[
//                 { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
//                 { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
//                 { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
//                 { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
//                 { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
//                 { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
//             ].map(({ handler, src, alt }) => (
//                 <button key={alt} onClick={handler} className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`}>
//                     <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
//                 </button>
//             ))}
//         </>
//     );

//     return (
//         <div className="min-h-screen bg-[#0d0d10]">
//             <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 pb-15">

//                 <Link href="/MainModules/MatchesDropContent" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
//                     <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition cursor-pointer">
//                         <ArrowLeft size={18} />
//                         <span className="text-sm">Back</span>
//                     </button>
//                 </Link>

//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                         <button onClick={() => window.history.back()}>
//                             <div className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer">
//                                 <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                                     <path d="M9 2L4 7L9 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
//                                 </svg>
//                             </div>
//                         </button>
//                         <div>
//                             <p className="text-white text-[15px] font-medium leading-tight">{video.title}</p>
//                             <p className="text-[#888] text-[12px] mt-0.5">
//                                 {video.playerInfo?.playerName ? `${video.playerInfo.playerName} · Chapter ${video.playerInfo.chapterNumber}` : "Video Drop"}
//                             </p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={() => { setShowShareDialog(true); setCopied(false); }}
//                         className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer hover:bg-[#2a2a2e] transition"
//                     >
//                         <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                             <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                             <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                             <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                             <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
//                         </svg>
//                     </button>
//                 </div>

//                 {/* Resume banner */}
//                 {resumeAt > 0 && (
//                     <div className="mb-4 px-4 py-2 bg-[#C9115F]/10 border border-[#C9115F]/30 rounded-xl flex items-center gap-2">
//                         <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                             <path d="M5 3L11 7L5 11V3Z" fill="#C9115F" />
//                         </svg>
//                         <p className="text-[#C9115F] text-[12px]">
//                             Resuming from {Math.floor(resumeAt / 60)}:{String(Math.floor(resumeAt % 60)).padStart(2, "0")}
//                         </p>
//                     </div>
//                 )}

//                 {/* Main layout */}
//                 <div className="flex flex-col lg:flex-row gap-6">

//                     {/* Video Player */}
//                     <div className="w-full lg:w-[400px] flex-shrink-0">
//                         <div className="bg-[#111114] rounded-2xl overflow-hidden border border-[#2a2a2e]">
//                             <div
//                                 className="relative w-full bg-[#0e0e12] flex items-center justify-center cursor-pointer h-[350px] lg:h-[480px]"
//                                 onClick={togglePlay}
//                             >
//                                 <video
//                                     ref={videoRef}
//                                     src={video.url}
//                                     className="absolute inset-0 w-full h-full object-contain"
//                                     onLoadedMetadata={handleLoadedMetadata}
//                                     onTimeUpdate={handleTimeUpdate}
//                                     onEnded={handleVideoEnd}
//                                     onError={handleVideoError}
//                                     playsInline
//                                     preload="metadata"
//                                 />
//                                 {videoError && (
//                                     <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
//                                         <p className="text-white text-sm text-center px-4">Unable to play video.<br />Format may not be supported.</p>
//                                     </div>
//                                 )}
//                                 <button
//                                     onClick={e => { e.stopPropagation(); togglePlay(); }}
//                                     className="relative z-10 w-[52px] h-[52px] rounded-full bg-[#e0185a] hover:bg-[#f01e66] flex items-center justify-center border-none cursor-pointer transition"
//                                 >
//                                     {playing ? (
//                                         <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                                             <rect x="5" y="4" width="3" height="12" rx="1" fill="#fff" />
//                                             <rect x="12" y="4" width="3" height="12" rx="1" fill="#fff" />
//                                         </svg>
//                                     ) : (
//                                         <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                                             <path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#fff" />
//                                         </svg>
//                                     )}
//                                 </button>
//                             </div>

//                             {/* Progress */}
//                             <div className="px-3 pt-2 pb-2">
//                                 <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
//                                     <div className="h-full bg-[#e0185a] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
//                                 </div>
//                                 <div className="flex justify-between text-[11px] text-[#666] font-mono">
//                                     <span>{timeStr}</span>
//                                     <span>{video.duration}</span>
//                                 </div>
//                             </div>

//                             {/* Prev / Next Navigation */}
//                             {allVideoFiles.length > 1 && (
//                                 <div className="flex items-center justify-between gap-2 px-3 pb-3">
//                                     <button
//                                         onClick={() => navigateToVideo(currentIndex - 1)}
//                                         disabled={currentIndex === 0}
//                                         className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a0f1c] border border-[#e0185a]/30 text-[#e0185a] text-[12px] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a1525] transition"
//                                     >
//                                         <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                                             <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
//                                         </svg>
//                                         Prev
//                                     </button>
//                                     <span className="text-[#666] text-[11px]">{currentIndex + 1} / {allVideoFiles.length}</span>
//                                     <button
//                                         onClick={() => navigateToVideo(currentIndex + 1)}
//                                         disabled={currentIndex === allVideoFiles.length - 1}
//                                         className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a0f1c] border border-[#e0185a]/30 text-[#e0185a] text-[12px] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a1525] transition"
//                                     >
//                                         Next
//                                         <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                                             <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
//                                         </svg>
//                                     </button>
//                                 </div>
//                             )}

//                             {/* Up Next Preview */}
//                             {nextVideo && (
//                                 <div
//                                     onClick={() => navigateToVideo(currentIndex + 1)}
//                                     className="mx-3 mb-3 flex items-center gap-2 bg-[#2a0f1c]/60 border border-[#e0185a]/20 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#2a0f1c] transition"
//                                 >
//                                     <div className="w-7 h-7 rounded-full bg-[#e0185a]/20 flex items-center justify-center flex-shrink-0">
//                                         <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
//                                             <path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#e0185a" />
//                                         </svg>
//                                     </div>
//                                     <div className="min-w-0 flex-1">
//                                         <p className="text-[#888] text-[10px] uppercase tracking-wider">Up Next</p>
//                                         <p className="text-white text-[12px] font-medium truncate">{nextVideo.title}</p>
//                                         <p className="text-[#666] text-[10px] truncate">
//                                             {nextVideo.playerInfo?.playerName || "Video Drop"}
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Previous Video Preview */}
//                             {prevVideo && (
//                                 <div
//                                     onClick={() => navigateToVideo(currentIndex - 1)}
//                                     className="mx-3 mb-3 flex items-center gap-2 bg-[#1a1a2e]/60 border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#1a1a2e] transition"
//                                 >
//                                     <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
//                                         <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
//                                             <path d="M13 4.5L4 10L13 15.5V4.5Z" fill="#aaa" />
//                                         </svg>
//                                     </div>
//                                     <div className="min-w-0 flex-1">
//                                         <p className="text-[#666] text-[10px] uppercase tracking-wider">Previous</p>
//                                         <p className="text-[#aaa] text-[12px] font-medium truncate">{prevVideo.title}</p>
//                                         <p className="text-[#555] text-[10px] truncate">
//                                             {prevVideo.playerInfo?.playerName || "Video Drop"}
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Info Panel */}
//                     <div className="flex-1 bg-[#111114] rounded-2xl border border-[#2a2a2e] p-5 flex flex-col gap-4">
//                         <div>
//                             <h1 className="text-white text-[20px] font-medium leading-snug mb-1">{video.title}</h1>
//                             {video.playerInfo?.playerName && (
//                                 <p className="text-[#C9115F] text-[12px] mb-1">by Arjun Mehta</p>
//                             )}
//                             <p className="text-[#888] text-[13px] leading-relaxed">
//                                 {video.playerInfo?.playerName
//                                     ? `${video.playerInfo.playerName.charAt(0).toUpperCase() + video.playerInfo.playerName.slice(1)} — Chapter ${video.playerInfo.chapterNumber} of the player video series.`
//                                     : "Player video drop from SportsFan360."}
//                             </p>
//                         </div>

//                         {/* Stats */}
//                         <div className="grid grid-cols-3 gap-2.5">
//                             {[
//                                 { label: "Plays", value: playsCount.toLocaleString() },
//                                 { label: "Signals", value: signalsCount.toLocaleString() },
//                                 { label: "Duration", value: video.duration },
//                             ].map((s) => (
//                                 <div key={s.label} className="bg-[#1a1a1e] rounded-xl p-2.5 flex flex-col gap-1.5">
//                                     <span className="text-[10px] uppercase tracking-wider text-[#999]">{s.label}</span>
//                                     <span className="text-[17px] font-medium text-white">{s.value}</span>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Script — Coming Soon */}
//                         <div className="bg-[#1a1a1e] border border-white/5 rounded-2xl p-4">
//                             <div className="flex items-center justify-between mb-3">
//                                 <div className="flex items-center gap-2">
//                                     <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                                         <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="#888" strokeWidth="1.3" />
//                                         <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="#888" strokeWidth="1.3" strokeLinecap="round" />
//                                     </svg>
//                                     <p className="text-white text-[13px] font-medium">Video Script</p>
//                                 </div>
//                                 <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9115F]/15 text-[#C9115F] border border-[#C9115F]/30 font-medium tracking-wide">
//                                     Coming Soon
//                                 </span>
//                             </div>
//                             <p className="text-[#555] text-[12px] leading-relaxed mb-3">
//                                 Can&apos;t watch right now? Full video transcripts will be available here so you can read along at your own pace.
//                             </p>
//                             <div className="flex flex-col gap-2">
//                                 {[1, 2, 3].map((i) => (
//                                     <div key={i} className="h-3 bg-[#222226] rounded-full animate-pulse" style={{ width: `${90 - i * 15}%` }} />
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Meta */}
//                         <div className="flex items-center gap-4 text-[12px] text-[#666]">
//                             <div className="flex items-center gap-1.5">
//                                 <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
//                                     <rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="#666" strokeWidth="1.2" />
//                                     <path d="M1.5 5.5h10M4.5 1v3M8.5 1v3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" />
//                                 </svg>
//                                 {video.createdAtFormatted}
//                             </div>
//                         </div>

//                         {/* Watch progress bar */}
//                         <div>
//                             <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
//                                 <div className="h-full bg-[#e0185a] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
//                             </div>
//                             <p className="text-right text-[11px] text-[#666]">{pct}% watched</p>
//                         </div>

//                         {/* Send Signal */}
//                         <button
//                             onClick={() => setShowSignalDialog(true)}
//                             className="w-full bg-[#1e0a12] border border-[#e0185a] rounded-[14px] py-4 flex items-center justify-center gap-2 text-[#e0185a] text-[15px] font-medium hover:bg-[#2a0f1c] transition mt-auto"
//                         >
//                             <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
//                                 <path d="M9 2C5.7 2 3 4.5 3 7.5c0 1.5.7 2.9 1.9 3.9L4 15l3.5-1.2c.5.2 1 .2 1.5.2C12.3 14 15 11.5 15 8.5S12.3 2 9 2z" stroke="#e0185a" strokeWidth="1.4" strokeLinejoin="round" />
//                                 <path d="M6.5 8.5h5M9 6v5" stroke="#e0185a" strokeWidth="1.4" strokeLinecap="round" />
//                             </svg>
//                             Send Signal
//                         </button>

//                         <CommentsSection
//                             contentId={video?.id || ""}
//                             contentType="video"
//                             contentTitle={video?.title}
//                             className="mt-5"
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Share Dialog — mobile */}
//             {showShareDialog && video && (
//                 <>
//                     <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setShowShareDialog(false)} />
//                     <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-2">
//                             <p className="text-white text-sm font-semibold">Share</p>
//                             <button onClick={() => setShowShareDialog(false)} className="text-gray-400 hover:text-white">
//                                 <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
//                             </button>
//                         </div>
//                         <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
//                         {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//                     </div>
//                     <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={() => setShowShareDialog(false)}>
//                         <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
//                             <div className="flex items-center justify-between mb-3">
//                                 <p className="text-white text-sm font-semibold">Share Video Drop</p>
//                                 <button onClick={() => setShowShareDialog(false)} className="text-gray-400 hover:text-white">
//                                     <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
//                                 </button>
//                             </div>
//                             <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
//                                 <p className="text-white text-sm font-semibold line-clamp-2">{video.title}</p>
//                                 <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildVideoShareUrl(video)}</p>
//                             </div>
//                             <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">{shareButtons("w-9 h-9")}</div>
//                             {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//                         </div>
//                     </div>
//                 </>
//             )}

//             {/* Signal Dialog */}
//             {showSignalDialog && (
//                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowSignalDialog(false)}>
//                     <div className="bg-[#1a1a1e] rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="text-white text-lg font-semibold">Send a Signal</h3>
//                             <button onClick={() => setShowSignalDialog(false)} className="text-gray-400 hover:text-white">
//                                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
//                             </button>
//                         </div>
//                         <p className="text-gray-400 text-sm mb-4">Share your thoughts about &apos;{video.title}&apos;</p>
//                         <textarea
//                             value={signalMessage}
//                             onChange={e => setSignalMessage(e.target.value)}
//                             placeholder="Type your message here..."
//                             className="w-full bg-[#111114] text-white text-sm rounded-xl px-4 py-3 border border-[#2a2a2e] focus:outline-none focus:border-[#e0185a] resize-none"
//                             rows={4} maxLength={500} autoFocus
//                         />
//                         <div className="flex justify-end gap-3 mt-4">
//                             <button onClick={() => setShowSignalDialog(false)} className="px-4 py-2 rounded-lg bg-[#2a2a2e] text-gray-300 text-sm font-medium hover:bg-[#3a3a3e] transition">Cancel</button>
//                             <button
//                                 onClick={handleSendSignal}
//                                 disabled={!signalMessage.trim() || sendingSignal}
//                                 className="px-4 py-2 rounded-lg bg-[#e0185a] text-white text-sm font-medium hover:bg-[#f01e66] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                             >
//                                 {sendingSignal ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Sending...</> : "Send Signal"}
//                             </button>
//                         </div>
//                         <p className="text-gray-600 text-xs mt-3 text-center">{500 - signalMessage.length} characters remaining</p>
//                         {recentSignals.length > 0 && (
//                             <div className="mt-4 border-t border-[#2a2a2e] pt-4">
//                                 <p className="text-gray-500 text-xs mb-2">Recent signals</p>
//                                 {recentSignals.map(s => (
//                                     <div key={s.id} className="mb-2 bg-[#111114] rounded-lg px-3 py-2">
//                                         <p className="text-[#C9115F] text-xs font-medium">{s.userName}</p>
//                                         <p className="text-gray-300 text-xs mt-0.5">{s.message}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }















"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import CommentsSection from "@/src/components/CommentsSection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PlaylistDialog from "../playlistdialog-component/playlistdialog";

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

interface SignalMessage {
    id: string;
    videoId: string;
    userId: string;
    userName: string;
    message: string;
    createdAt: number;
}

const buildVideoShareUrl = (video: VideoFile) => {
    if (typeof window === "undefined") return "";
    const url = new URL(`${window.location.origin}/MainModules/MatchesDropContent/VideoDropScreen`);
    url.searchParams.set("id", video.id);
    return url.toString();
};

const buildVideoShareText = (video: VideoFile) => {
    const shareUrl = buildVideoShareUrl(video);
    return [
        `Watch ${video.title} on Sportsfan`,
        video.playerInfo?.playerName
            ? `${video.playerInfo.playerName} · Chapter ${video.playerInfo.chapterNumber}`
            : "Video Drop",
        `Watch here: ${shareUrl}`,
    ].filter(Boolean).join("\n");
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const el = document.createElement("textarea");
            el.value = text;
            el.style.position = "fixed";
            el.style.opacity = "0";
            document.body.appendChild(el);
            el.focus();
            el.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(el);
            return ok;
        } catch { return false; }
    }
};

export default function VideoDropCard() {
    const { user, getUserName } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const fromPlaylist = searchParams.get("from") === "playlist";
    const playlistId = searchParams.get("playlistId");
    const resumeAt = parseFloat(searchParams.get("resume") || "0");

    const [playing, setPlaying] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [video, setVideo] = useState<VideoFile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videoError, setVideoError] = useState(false);

    const [allVideoFiles, setAllVideoFiles] = useState<VideoFile[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const [playsCount, setPlaysCount] = useState(0);
    const hasCountedPlay = useRef(false);
    const videoIdRef = useRef<string | null>(null);

    const [signalsCount, setSignalsCount] = useState(0);
    const [recentSignals, setRecentSignals] = useState<SignalMessage[]>([]);
    const [showSignalDialog, setShowSignalDialog] = useState(false);
    const [signalMessage, setSignalMessage] = useState("");
    const [sendingSignal, setSendingSignal] = useState(false);

    const [showShareDialog, setShowShareDialog] = useState(false);
    const [copied, setCopied] = useState(false);

    const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);  // ← ADD 2: state

    const videoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressSaveRef = useRef<NodeJS.Timeout | null>(null);
    const elapsedRef = useRef(0);
    const videoReadyToPlayRef = useRef(false);
    const allVideoFilesRef = useRef<VideoFile[]>([]);
    const currentIndexRef = useRef<number>(0);

    useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
    useEffect(() => { allVideoFilesRef.current = allVideoFiles; }, [allVideoFiles]);
    useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

    const getUserId = () => user?.userId || null;

    const handleBack = () => {
        if (fromPlaylist && playlistId) {
            router.push(`/MainModules/Playlists?playlistId=${encodeURIComponent(playlistId)}`);
            return;
        }
        router.back();
    };

    const saveProgressToApi = async (elapsedSecs: number, vid: VideoFile) => {
        const userId = getUserId();
        if (!userId) return;
        const totalSecs = vid.durationSeconds || 0;
        const pct = totalSecs > 0 ? Math.round((elapsedSecs / totalSecs) * 100) : 0;
        const subtitle = vid.playerInfo?.playerName
            ? `${vid.playerInfo.playerName} · Chapter ${vid.playerInfo.chapterNumber}`
            : "Video Drop";
        try {
            await axios.post("/api/video-progress", { userId, videoId: vid.id, title: vid.title, subtitle, elapsed: elapsedSecs, durationSeconds: totalSecs, pct, url: vid.url });
        } catch (err) { console.error("[progress] save error:", err); }
    };

    const startProgressSaving = (vid: VideoFile) => {
        if (progressSaveRef.current) clearInterval(progressSaveRef.current);
        progressSaveRef.current = setInterval(() => { saveProgressToApi(elapsedRef.current, vid); }, 5000);
    };

    const stopProgressSaving = (vid: VideoFile) => {
        if (progressSaveRef.current) { clearInterval(progressSaveRef.current); progressSaveRef.current = null; }
        saveProgressToApi(elapsedRef.current, vid);
    };

    useEffect(() => {
        fetchVideoData();
        return () => { if (progressSaveRef.current) clearInterval(progressSaveRef.current); };
    }, [idParam]);

    const fetchVideoData = async () => {
        if (!idParam) { setError("No video ID provided"); setLoading(false); return; }
        try {
            setLoading(true);
            videoReadyToPlayRef.current = false;
            setError(null);
            setElapsed(0);
            elapsedRef.current = 0;
            setPlaying(false);
            hasCountedPlay.current = false;

            const res = await axios.get(`/api/cloudinary/video?limit=50`);
            if (res.data.success) {
                const allFiles: VideoFile[] = res.data.videoFiles;
                setAllVideoFiles(allFiles);
                allVideoFilesRef.current = allFiles;

                const foundIndex = allFiles.findIndex((v: VideoFile) => v.id === idParam);
                const targetIndex = foundIndex >= 0 ? foundIndex : 0;
                const found = allFiles[targetIndex];

                setCurrentIndex(targetIndex);
                currentIndexRef.current = targetIndex;

                if (found) {
                    setVideo(found);
                    videoIdRef.current = found.id;
                    await fetchPlaysCount(found.id);
                    await fetchSignalsCount(found.id);
                    await fetchRecentSignals(found.id);
                    if (resumeAt > 0) {
                        setElapsed(resumeAt);
                        elapsedRef.current = resumeAt;
                        setTimeout(() => { if (videoRef.current) videoRef.current.currentTime = resumeAt; }, 500);
                    }
                } else { setError("Video not found"); }
            } else { setError("Failed to fetch videos"); }
        } catch (err) {
            console.error("[VideoDropCard] Error:", err);
            setError("Failed to load video");
        } finally {
            videoReadyToPlayRef.current = true;
            setLoading(false);
        }
    };

    const navigateToVideo = (index: number) => {
        const files = allVideoFilesRef.current;
        if (index < 0 || index >= files.length) return;
        const target = files[index];
        setCurrentIndex(index);
        currentIndexRef.current = index;
        setPlaying(false);
        setElapsed(0);
        elapsedRef.current = 0;
        setVideoError(false);
        hasCountedPlay.current = false;
        videoIdRef.current = target.id;
        setVideo(target);
        fetchPlaysCount(target.id);
        fetchSignalsCount(target.id);
        fetchRecentSignals(target.id);
        const url = new URL(window.location.href);
        url.searchParams.set("id", target.id);
        url.searchParams.delete("resume");
        window.history.pushState({}, "", url.toString());
    };

    const fetchPlaysCount = async (videoId: string) => {
        try {
            const res = await axios.get("/api/cloudinary/plays");
            if (res.data.plays) setPlaysCount(res.data.plays[videoId] || 0);
        } catch (err) { console.error("[plays] fetch error:", err); }
    };

    const incrementPlays = async () => {
        const id = videoIdRef.current;
        if (hasCountedPlay.current || !id) return;
        hasCountedPlay.current = true;
        try {
            const res = await axios.post("/api/cloudinary/plays", { id });
            if (res.data.success) setPlaysCount(res.data.plays);
        } catch (err) { console.error("[plays] increment error:", err); }
    };

    const fetchSignalsCount = async (videoId: string) => {
        try {
            const res = await axios.get(`/api/video-messages?videoId=${videoId}&count=true`);
            if (res.data.success) setSignalsCount(res.data.count);
        } catch (err) { console.error("[signals] count error:", err); }
    };

    const fetchRecentSignals = async (videoId: string) => {
        try {
            const res = await axios.get(`/api/video-messages?videoId=${videoId}&limit=5`);
            if (res.data.success) setRecentSignals(res.data.signals);
        } catch (err) { console.error("[signals] fetch error:", err); }
    };

    const handleSendSignal = async () => {
        if (!signalMessage.trim() || !video?.id) return;
        setSendingSignal(true);
        try {
            const response = await axios.post("/api/video-messages", { videoId: video.id, videoTitle: video.title, userId: getUserId() || "anonymous", userName: getUserName(), message: signalMessage.trim() });
            if (response.data.success) {
                setSignalsCount((prev) => prev + 1);
                setRecentSignals((prev) => [response.data.signal, ...prev].slice(0, 5));
                setShowSignalDialog(false);
                setSignalMessage("");
                alert("Signal sent successfully!");
            }
        } catch (err) {
            console.error("[signals] send error:", err);
            alert("Failed to send signal. Please try again.");
        } finally { setSendingSignal(false); }
    };

    const handleShareToWhatsApp = () => { if (!video) return; window.open(`https://wa.me/?text=${encodeURIComponent(buildVideoShareText(video))}`, "_blank"); };
    const handleShareToThreads = () => { if (!video) return; window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildVideoShareText(video))}`, "_blank"); };
    const handleShareToInstagram = async () => { if (!video) return; await copyToClipboard(buildVideoShareText(video)); setCopied(true); setTimeout(() => setCopied(false), 1600); window.open("https://www.instagram.com/", "_blank"); };
    const handleShareToLinkedIn = () => { if (!video) return; window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildVideoShareUrl(video))}`, "_blank"); };
    const handleShareToX = () => { if (!video) return; window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildVideoShareText(video))}`, "_blank"); };
    const handleCopyLink = async () => { if (!video) return; const ok = await copyToClipboard(buildVideoShareText(video)); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); } };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            if (!isNaN(dur) && dur > 0) {
                const m = Math.floor(dur / 60);
                const s = Math.floor(dur % 60);
                setVideo(prev => prev ? { ...prev, duration: `${m}:${s.toString().padStart(2, "0")}`, durationSeconds: dur } : null);
                if (resumeAt > 0 && videoRef.current) {
                    videoRef.current.currentTime = resumeAt;
                    setElapsed(resumeAt);
                    elapsedRef.current = resumeAt;
                }
                const tryPlay = () => {
                    if (!videoRef.current) return;
                    videoRef.current.play()
                        .then(() => {
                            setPlaying(true);
                            incrementPlays();
                            setVideo(prev => { if (prev) startProgressSaving(prev); return prev; });
                        })
                        .catch(console.error);
                };
                if (videoReadyToPlayRef.current) { tryPlay(); }
                else {
                    const poll = setInterval(() => {
                        if (videoReadyToPlayRef.current) { clearInterval(poll); tryPlay(); }
                    }, 100);
                }
            }
        }
    };

    const handleVideoError = () => { setVideoError(true); setPlaying(false); };
    const handleTimeUpdate = () => { if (videoRef.current) setElapsed(videoRef.current.currentTime); };

    const handleVideoEnd = () => {
        setPlaying(false);
        setElapsed(0);
        if (videoRef.current) videoRef.current.currentTime = 0;
        incrementPlays();
        if (video && getUserId()) {
            axios.delete(`/api/video-progress?userId=${getUserId()}&videoId=${encodeURIComponent(video.id)}`)
                .catch(err => console.error("[progress] clear error:", err));
        }
        if (progressSaveRef.current) clearInterval(progressSaveRef.current);
        setTimeout(() => {
            const nextIndex = currentIndexRef.current + 1;
            if (nextIndex < allVideoFilesRef.current.length) navigateToVideo(nextIndex);
        }, 1000);
    };

    const togglePlay = () => {
        if (!videoRef.current || !video) return;
        if (playing) {
            videoRef.current.pause();
            setPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            stopProgressSaving(video);
        } else {
            videoRef.current.play().catch(() => setVideoError(true));
            setPlaying(true);
            incrementPlays();
            startProgressSaving(video);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (progressSaveRef.current) clearInterval(progressSaveRef.current);
        };
    }, []);

    const totalSecs = video?.durationSeconds || 0;
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
    const pct = totalSecs > 0 ? Math.round((elapsed / totalSecs) * 100) : 0;
    const prevVideo = allVideoFiles[currentIndex - 1];
    const nextVideo = allVideoFiles[currentIndex + 1];

    if (loading) return (
        <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
                <p className="text-gray-400">Loading video...</p>
            </div>
        </div>
    );

    if (error || !video) return (
        <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
            <div className="text-center">
                <p className="text-red-400 mb-4">{error || "Video not found"}</p>
                <button onClick={handleBack} className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600">Go Back</button>
            </div>
        </div>
    );

    const shareButtons = (size: string) => (
        <>
            {[
                { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
                { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
                { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
                { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
                { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
                { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
            ].map(({ handler, src, alt }) => (
                <button key={alt} onClick={handler} className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`}>
                    <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
                </button>
            ))}
        </>
    );

    return (
        <div className="min-h-screen bg-[#0d0d10]">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 pb-15">

                <Link href="/MainModules/MatchesDropContent" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition cursor-pointer">
                        <ArrowLeft size={18} />
                        <span className="text-sm">Back</span>
                    </button>
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={handleBack}>
                            <div className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M9 2L4 7L9 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </button>
                        <div>
                            <p className="text-white text-[15px] font-medium leading-tight">{video.title}</p>
                            <p className="text-[#888] text-[12px] mt-0.5">
                                {video.playerInfo?.playerName ? `${video.playerInfo.playerName} · Chapter ${video.playerInfo.chapterNumber}` : "Video Drop"}
                            </p>
                        </div>
                    </div>

                    {/* ← MODIFY: replace single share button with a flex row of two buttons */}
                    <div className="flex items-center gap-2">
                        {/* ADD 3: Playlist button */}
                        <button
                            onClick={() => setShowPlaylistDialog(true)}
                            className="px-4 py-2 bg-[#111111] rounded-xl border border-white/5 shadow-[0_4px_15px_rgb(0,0,0,0.5)] hover:bg-[#1a1a1a] transition-all duration-300 group active:scale-95 flex items-center justify-center"
                            title="Add to Playlist"
                        >
                            <span className="text-gray-300 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase group-hover:text-white transition-colors">
                                Add to Playlist
                            </span>
                        </button>

                        {/* Existing share button — unchanged */}
                        <button
                            onClick={() => { setShowShareDialog(true); setCopied(false); }}
                            className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer hover:bg-[#2a2a2e] transition"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4" />
                                <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4" />
                                <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4" />
                                <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Resume banner */}
                {resumeAt > 0 && (
                    <div className="mb-4 px-4 py-2 bg-[#C9115F]/10 border border-[#C9115F]/30 rounded-xl flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5 3L11 7L5 11V3Z" fill="#C9115F" />
                        </svg>
                        <p className="text-[#C9115F] text-[12px]">
                            Resuming from {Math.floor(resumeAt / 60)}:{String(Math.floor(resumeAt % 60)).padStart(2, "0")}
                        </p>
                    </div>
                )}

                {/* Main layout */}
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Video Player */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <div className="bg-[#111114] rounded-2xl overflow-hidden border border-[#2a2a2e]">
                            <div
                                className="relative w-full bg-[#0e0e12] flex items-center justify-center cursor-pointer h-[350px] lg:h-[480px]"
                                onClick={togglePlay}
                            >
                                <video
                                    ref={videoRef}
                                    src={video.url}
                                    className="absolute inset-0 w-full h-full object-contain"
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleVideoEnd}
                                    onError={handleVideoError}
                                    playsInline
                                    preload="metadata"
                                />
                                {videoError && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                                        <p className="text-white text-sm text-center px-4">Unable to play video.<br />Format may not be supported.</p>
                                    </div>
                                )}
                                <button
                                    onClick={e => { e.stopPropagation(); togglePlay(); }}
                                    className="relative z-10 w-[52px] h-[52px] rounded-full bg-[#e0185a] hover:bg-[#f01e66] flex items-center justify-center border-none cursor-pointer transition"
                                >
                                    {playing ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <rect x="5" y="4" width="3" height="12" rx="1" fill="#fff" />
                                            <rect x="12" y="4" width="3" height="12" rx="1" fill="#fff" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#fff" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Progress */}
                            <div className="px-3 pt-2 pb-2">
                                <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
                                    <div className="h-full bg-[#e0185a] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="flex justify-between text-[11px] text-[#666] font-mono">
                                    <span>{timeStr}</span>
                                    <span>{video.duration}</span>
                                </div>
                            </div>

                            {/* Prev / Next */}
                            {allVideoFiles.length > 1 && (
                                <div className="flex items-center justify-between gap-2 px-3 pb-3">
                                    <button onClick={() => navigateToVideo(currentIndex - 1)} disabled={currentIndex === 0} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a0f1c] border border-[#e0185a]/30 text-[#e0185a] text-[12px] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a1525] transition">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        Prev
                                    </button>
                                    <span className="text-[#666] text-[11px]">{currentIndex + 1} / {allVideoFiles.length}</span>
                                    <button onClick={() => navigateToVideo(currentIndex + 1)} disabled={currentIndex === allVideoFiles.length - 1} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a0f1c] border border-[#e0185a]/30 text-[#e0185a] text-[12px] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a1525] transition">
                                        Next
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>
                                </div>
                            )}

                            {/* Up Next */}
                            {nextVideo && (
                                <div onClick={() => navigateToVideo(currentIndex + 1)} className="mx-3 mb-3 flex items-center gap-2 bg-[#2a0f1c]/60 border border-[#e0185a]/20 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#2a0f1c] transition">
                                    <div className="w-7 h-7 rounded-full bg-[#e0185a]/20 flex items-center justify-center flex-shrink-0">
                                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#e0185a" /></svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[#888] text-[10px] uppercase tracking-wider">Up Next</p>
                                        <p className="text-white text-[12px] font-medium truncate">{nextVideo.title}</p>
                                        <p className="text-[#666] text-[10px] truncate">{nextVideo.playerInfo?.playerName || "Video Drop"}</p>
                                    </div>
                                </div>
                            )}

                            {/* Previous */}
                            {prevVideo && (
                                <div onClick={() => navigateToVideo(currentIndex - 1)} className="mx-3 mb-3 flex items-center gap-2 bg-[#1a1a2e]/60 border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#1a1a2e] transition">
                                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M13 4.5L4 10L13 15.5V4.5Z" fill="#aaa" /></svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[#666] text-[10px] uppercase tracking-wider">Previous</p>
                                        <p className="text-[#aaa] text-[12px] font-medium truncate">{prevVideo.title}</p>
                                        <p className="text-[#555] text-[10px] truncate">{prevVideo.playerInfo?.playerName || "Video Drop"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="flex-1 bg-[#111114] rounded-2xl border border-[#2a2a2e] p-5 flex flex-col gap-4">
                        <div>
                            <h1 className="text-white text-[20px] font-medium leading-snug mb-1">{video.title}</h1>
                            {video.playerInfo?.playerName && (
                                <p className="text-[#C9115F] text-[12px] mb-1">by Arjun Mehta</p>
                            )}
                            <p className="text-[#888] text-[13px] leading-relaxed">
                                {video.playerInfo?.playerName
                                    ? `${video.playerInfo.playerName.charAt(0).toUpperCase() + video.playerInfo.playerName.slice(1)} — Chapter ${video.playerInfo.chapterNumber} of the player video series.`
                                    : "Player video drop from SportsFan360."}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { label: "Plays", value: playsCount.toLocaleString() },
                                { label: "Signals", value: signalsCount.toLocaleString() },
                                { label: "Duration", value: video.duration },
                            ].map((s) => (
                                <div key={s.label} className="bg-[#1a1a1e] rounded-xl p-2.5 flex flex-col gap-1.5">
                                    <span className="text-[10px] uppercase tracking-wider text-[#999]">{s.label}</span>
                                    <span className="text-[17px] font-medium text-white">{s.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Script — Coming Soon */}
                        <div className="bg-[#1a1a1e] border border-white/5 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="#888" strokeWidth="1.3" />
                                        <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="#888" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                    <p className="text-white text-[13px] font-medium">Video Script</p>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9115F]/15 text-[#C9115F] border border-[#C9115F]/30 font-medium tracking-wide">Coming Soon</span>
                            </div>
                            <p className="text-[#555] text-[12px] leading-relaxed mb-3">Can&apos;t watch right now? Full video transcripts will be available here so you can read along at your own pace.</p>
                            <div className="flex flex-col gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-3 bg-[#222226] rounded-full animate-pulse" style={{ width: `${90 - i * 15}%` }} />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-[12px] text-[#666]">
                            <div className="flex items-center gap-1.5">
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="#666" strokeWidth="1.2" />
                                    <path d="M1.5 5.5h10M4.5 1v3M8.5 1v3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                                {video.createdAtFormatted}
                            </div>
                        </div>

                        <div>
                            <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
                                <div className="h-full bg-[#e0185a] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-right text-[11px] text-[#666]">{pct}% watched</p>
                        </div>

                        <button
                            onClick={() => setShowSignalDialog(true)}
                            className="w-full bg-[#1e0a12] border border-[#e0185a] rounded-[14px] py-4 flex items-center justify-center gap-2 text-[#e0185a] text-[15px] font-medium hover:bg-[#2a0f1c] transition mt-auto"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M9 2C5.7 2 3 4.5 3 7.5c0 1.5.7 2.9 1.9 3.9L4 15l3.5-1.2c.5.2 1 .2 1.5.2C12.3 14 15 11.5 15 8.5S12.3 2 9 2z" stroke="#e0185a" strokeWidth="1.4" strokeLinejoin="round" />
                                <path d="M6.5 8.5h5M9 6v5" stroke="#e0185a" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                            Send Signal
                        </button>

                        <CommentsSection contentId={video?.id || ""} contentType="video" contentTitle={video?.title} className="mt-5" />
                    </div>
                </div>
            </div>

           
            <PlaylistDialog
                open={showPlaylistDialog}
                onClose={() => setShowPlaylistDialog(false)}
                itemId={video.id}
                itemType="video" 
                userId={getUserId()}
            />

            {/* Share Dialog — mobile */}
            {showShareDialog && video && (
                <>
                    <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setShowShareDialog(false)} />
                    <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white text-sm font-semibold">Share</p>
                            <button onClick={() => setShowShareDialog(false)} className="text-gray-400 hover:text-white">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                        <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
                        {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
                    </div>
                    <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={() => setShowShareDialog(false)}>
                        <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-white text-sm font-semibold">Share Video Drop</p>
                                <button onClick={() => setShowShareDialog(false)} className="text-gray-400 hover:text-white">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                </button>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                                <p className="text-white text-sm font-semibold line-clamp-2">{video.title}</p>
                                <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildVideoShareUrl(video)}</p>
                            </div>
                            <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">{shareButtons("w-9 h-9")}</div>
                            {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
                        </div>
                    </div>
                </>
            )}

            {/* Signal Dialog */}
            {showSignalDialog && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowSignalDialog(false)}>
                    <div className="bg-[#1a1a1e] rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white text-lg font-semibold">Send a Signal</h3>
                            <button onClick={() => setShowSignalDialog(false)} className="text-gray-400 hover:text-white">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">Share your thoughts about &apos;{video.title}&apos;</p>
                        <textarea value={signalMessage} onChange={e => setSignalMessage(e.target.value)} placeholder="Type your message here..." className="w-full bg-[#111114] text-white text-sm rounded-xl px-4 py-3 border border-[#2a2a2e] focus:outline-none focus:border-[#e0185a] resize-none" rows={4} maxLength={500} autoFocus />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowSignalDialog(false)} className="px-4 py-2 rounded-lg bg-[#2a2a2e] text-gray-300 text-sm font-medium hover:bg-[#3a3a3e] transition">Cancel</button>
                            <button onClick={handleSendSignal} disabled={!signalMessage.trim() || sendingSignal} className="px-4 py-2 rounded-lg bg-[#e0185a] text-white text-sm font-medium hover:bg-[#f01e66] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {sendingSignal ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Sending...</> : "Send Signal"}
                            </button>
                        </div>
                        <p className="text-gray-600 text-xs mt-3 text-center">{500 - signalMessage.length} characters remaining</p>
                        {recentSignals.length > 0 && (
                            <div className="mt-4 border-t border-[#2a2a2e] pt-4">
                                <p className="text-gray-500 text-xs mb-2">Recent signals</p>
                                {recentSignals.map(s => (
                                    <div key={s.id} className="mb-2 bg-[#111114] rounded-lg px-3 py-2">
                                        <p className="text-[#C9115F] text-xs font-medium">{s.userName}</p>
                                        <p className="text-gray-300 text-xs mt-0.5">{s.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
