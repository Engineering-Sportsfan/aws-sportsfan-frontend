
// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useSearchParams } from "next/navigation";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";
// import { useScripts } from "@/context/ScriptsContext";
// import CommentsSection from "@/src/components/CommentsSection";
// import PlaylistDialog from "../playlistdialog-component/playlistdialog";
// import { ArrowLeft } from "lucide-react";
// import Link from "next/link";


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

// interface AudioDrop {
//     id?: string;
//     title: string;
//     subtitle?: string;
//     description: string;
//     listens: number;
//     signals: number;
//     duration: string;
//     date?: string;
//     room?: string;
//     engagement: number;
//     audioUrl?: string;
//     sizeFormatted?: string;
//     speaker?: string;
//     team1?: string;
//     team2?: string;
//     durationSeconds?: number;
//     matchInfo?: MatchInfo;
// }

// interface SignalMessage {
//     id: string;
//     audioId: string;
//     userId: string;
//     userName: string;
//     message: string;
//     createdAt: number;
// }

// const parseDurationToSeconds = (duration: string): number => {
//     const parts = duration.split(":");
//     if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
//     if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
//     return 0;
// };

// function audioFileToAudioDrop(audio: AudioFile): AudioDrop {
    
//     // 🚨 FIX: Extract matchInfo from the title if the backend failed to send it!
//     let fallbackMatchInfo = audio.matchInfo;
    
//     if (!fallbackMatchInfo && audio.title && audio.title.toLowerCase().includes("vs")) {
//         const parts = audio.title.split(" ");
//         const vsIndex = parts.findIndex(p => p.toLowerCase() === "vs");
        
//         if (vsIndex > 0 && vsIndex < parts.length - 1) {
//             fallbackMatchInfo = {
//                 team1: parts[vsIndex - 1], // e.g., "RCB"
//                 team2: parts[vsIndex + 1], // e.g., "MI"
//                 type: audio.title.toLowerCase().includes("post match") ? "Post Match" 
//                     : audio.title.toLowerCase().includes("pre match") ? "Pre Match" 
//                     : "Audio Script"
//             };
//         }
//     }

//     return {
//         id: audio.id,
//         title: audio.title,
//         subtitle: fallbackMatchInfo?.type
//             ? `${fallbackMatchInfo.type.replace(/_/g, " ")} — ${fallbackMatchInfo.team1 ?? ""} vs ${fallbackMatchInfo.team2 ?? ""}`
//             : "Audio Drop",
//         description: fallbackMatchInfo
//             ? `${fallbackMatchInfo.team1 ?? ""} vs ${fallbackMatchInfo.team2 ?? ""} — ${fallbackMatchInfo.type?.replace(/_/g, " ") ?? ""}`
//             : audio.title,
//         listens: 0,
//         signals: 0,
//         duration: audio.duration,
//         date: audio.createdAtFormatted,
//         room: fallbackMatchInfo?.team1
//             ? `${fallbackMatchInfo.team1} vs ${fallbackMatchInfo.team2}`
//             : "Audio Room",
//         engagement: 0,
//         audioUrl: audio.url,
//         sizeFormatted: audio.sizeFormatted,
//         speaker: fallbackMatchInfo?.speaker || audio.matchInfo?.speaker,
//         team1: fallbackMatchInfo?.team1,
//         team2: fallbackMatchInfo?.team2,
//         durationSeconds: audio.durationSeconds,
//         matchInfo: fallbackMatchInfo, // 👈 Now passing the recovered data!
//     };
// }

// const buildAudioDropShareUrl = (audioDrop: AudioDrop, urlParam: string | null) => {
//     if (typeof window === "undefined") return "";
//     const targetUrl = new URL(`${window.location.origin}/MainModules/MatchesDropContent/AudioDropScreen`);
//     if (audioDrop.id) {
//         targetUrl.searchParams.set("id", audioDrop.id);
//         return targetUrl.toString();
//     }
//     if (urlParam) {
//         targetUrl.searchParams.set("url", urlParam);
//         return targetUrl.toString();
//     }
//     return targetUrl.toString();
// };

// const buildAudioDropShareText = (audioDrop: AudioDrop, urlParam: string | null) => {
//     const shareUrl = buildAudioDropShareUrl(audioDrop, urlParam);
//     return [
//         `Listen to ${audioDrop.title} on Sportsfan`,
//         audioDrop.subtitle || "Audio Drops",
//         audioDrop.description || "Latest audio drop from Sportsfan.",
//         `View and listen: ${shareUrl}`,
//     ].filter(Boolean).join("\n");
// };

// const copyToClipboard = async (text: string) => {
//     try {
//         await navigator.clipboard.writeText(text);
//         return true;
//     } catch {
//         try {
//             const input = document.createElement("textarea");
//             input.value = text;
//             input.style.position = "fixed";
//             input.style.opacity = "0";
//             document.body.appendChild(input);
//             input.focus();
//             input.select();
//             const ok = document.execCommand("copy");
//             document.body.removeChild(input);
//             return ok;
//         } catch {
//             return false;
//         }
//     }
// };



// // ─── Script Panel 
// function ScriptPanel({ matchInfo }: { matchInfo?: MatchInfo }) {
//     const { findScript, fetchScriptContent } = useScripts();
//     const [scriptHtml, setScriptHtml] = useState<string | null>(null);
//     const [scriptLoading, setScriptLoading] = useState(false);
//     const [scriptError, setScriptError] = useState(false);
//     const [expanded, setExpanded] = useState(false);

//     useEffect(() => {
//         setScriptHtml(null);
//         setScriptError(false);
//         setExpanded(false);

//         if (!matchInfo) return;

//         const script = findScript(matchInfo);
//         if (!script) return;

//         setScriptLoading(true);
//         fetchScriptContent(script.url)
//             .then((html) => { if (html) setScriptHtml(html); else setScriptError(true); })
//             .catch(() => setScriptError(true))
//             .finally(() => setScriptLoading(false));
//     }, [matchInfo, findScript, fetchScriptContent]);

//     // No matchInfo or no script found - Coming Soon
//     if (!matchInfo || (!scriptLoading && !scriptHtml && !scriptError)) {
//         return (
//             <div className="bg-[#1a1a1e] border border-white/5 rounded-2xl p-4 h-[200px] flex-shrink-0 overflow-hidden">
//                 <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                         <ScriptIcon />
//                         <p className="text-white text-[13px] font-medium">Audio Script</p>
//                     </div>
//                     <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9115F]/15 text-[#C9115F] border border-[#C9115F]/30 font-medium tracking-wide">Coming Soon</span>
//                 </div>
//                 <p className="text-[#555] text-[12px] leading-relaxed mb-3">Can&apos;t listen right now? Full audio transcripts will be available here so you can read along at your own pace.</p>
//                 <div className="flex flex-col gap-2">
//                     {[1, 2, 3].map((i) => (
//                         <div key={i} className="h-3 bg-[#222226] rounded-full animate-pulse" style={{ width: `${90 - i * 15}%` }} />
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     // Loading state
//     if (scriptLoading) {
//         return (
//             <div className="bg-[#1a1a1e] border border-white/5 rounded-2xl p-4 h-[200px] flex-shrink-0 overflow-hidden">
//                 <div className="flex items-center gap-2 mb-3">
//                     <ScriptIcon />
//                     <p className="text-white text-[13px] font-medium">Audio Script</p>
//                 </div>
//                 <div className="flex flex-col gap-2">
//                     {[1, 2, 3, 4].map((i) => (
//                         <div key={i} className="h-3 bg-[#222226] rounded-full animate-pulse" style={{ width: `${95 - i * 10}%` }} />
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     // Error state
//     if (scriptError) {
//         return (
//             <div className="bg-[#1a1a1e] border border-white/5 rounded-2xl p-4 h-[200px] flex-shrink-0 overflow-hidden">
//                 <div className="flex items-center gap-2 mb-2">
//                     <ScriptIcon />
//                     <p className="text-white text-[13px] font-medium">Audio Script</p>
//                 </div>
//                 <p className="text-[#555] text-[12px]">Script could not be loaded.</p>
//             </div>
//         );
//     }
// return (
//     <div className="flex-shrink-0 min-w-0">
//         <div
//             className={`bg-[#1a1a1e] border border-white/5 rounded-2xl p-4
//                 ${expanded ? "" : "h-[200px] overflow-y-auto"}`}
//             style={!expanded ? { scrollbarWidth: "thin", scrollbarColor: "#3a3a3e #1a1a1e" } : undefined}
//         >
//             <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center gap-2">
//                     <ScriptIcon />
//                     <p className="text-white text-[13px] font-medium">Audio Script</p>
//                 </div>
//                 <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium tracking-wide">Available</span>
//             </div>
//             {/* <div className="text-[#ccc] text-[12px] leading-relaxed script-content" dangerouslySetInnerHTML={{ __html: scriptHtml! }} /> */}
//             <div 
//     className="text-[#ccc] text-[12px] leading-relaxed script-content overflow-hidden w-full min-w-0" 
//     style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
//     dangerouslySetInnerHTML={{ __html: scriptHtml! }} 
// />
//             <button
//                 onClick={() => setExpanded((v) => !v)}
//                 className="mt-3 flex items-center gap-1.5 text-[#C9115F] text-[12px] font-medium hover:text-[#e0185a] transition sticky bottom-0 bg-[#1a1a1e] py-1"
//             >
//                 {expanded ? (
//                     <>
//                         <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                             <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                         Show less
//                     </>
//                 ) : (
//                     <>
//                         <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                             <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         </svg>
//                         Read full script
//                     </>
//                 )}
//             </button>
//         </div>
//     </div>
// );
   
// }

// function ScriptIcon() {
//     return (
//         <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//             <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="#888" strokeWidth="1.3" />
//             <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="#888" strokeWidth="1.3" strokeLinecap="round" />
//         </svg>
//     );
// }

// // ─── Main Component 

// export default function AudioDropCard() {
//     const { user, getUserName } = useAuth();
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const idParam = searchParams.get("id");
//     const urlParam = searchParams.get("url");
//     const fromPlaylist = searchParams.get("from") === "playlist";
//     const playlistId = searchParams.get("playlistId");
//     const resumeAt = parseFloat(searchParams.get("resume") || "0");

//     const [playing, setPlaying] = useState(false);
//     const [elapsed, setElapsed] = useState(0);
//     const [duration, setDuration] = useState("0:00");
//     const [audioDrop, setAudioDrop] = useState<AudioDrop | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const [allAudioFiles, setAllAudioFiles] = useState<AudioFile[]>([]);
//     const [currentIndex, setCurrentIndex] = useState<number>(0);

//     const [showSignalDialog, setShowSignalDialog] = useState(false);
//     const [signalMessage, setSignalMessage] = useState("");
//     const [sendingSignal, setSendingSignal] = useState(false);
//     const [signalsCount, setSignalsCount] = useState(0);
//     const [recentSignals, setRecentSignals] = useState<SignalMessage[]>([]);
//     const [playsCount, setPlaysCount] = useState(0);

//     const [showShareDialog, setShowShareDialog] = useState(false);
//     const [copied, setCopied] = useState(false);

//     // ── Playlist dialog — just a boolean now 
//     const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);

//     const audioRef = useRef<HTMLAudioElement | null>(null);
//     const timerRef = useRef<NodeJS.Timeout | null>(null);
//     const progressSaveRef = useRef<NodeJS.Timeout | null>(null);
//     const elapsedRef = useRef(0);
//     const audioDropRef = useRef<AudioDrop | null>(null);
//     const audioReadyToPlayRef = useRef(false);

//     useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
//     useEffect(() => { audioDropRef.current = audioDrop; }, [audioDrop]);

//     const hasCountedListen = useRef(false);
//     const audioIdRef = useRef<string | null>(null);
//     const incrementListensRef = useRef<() => void>(() => { });
//     const navigateToAudioRef = useRef<(index: number) => void>(() => { });
//     const currentIndexRef = useRef<number>(0);
//     const allAudioFilesRef = useRef<AudioFile[]>([]);

//     useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
//     useEffect(() => { allAudioFilesRef.current = allAudioFiles; }, [allAudioFiles]);

//     const getUserId = () => user?.userId || null;

//     const handleBack = () => {
//         if (fromPlaylist && playlistId) {
//             router.push(`/MainModules/Playlists?playlistId=${encodeURIComponent(playlistId)}`);
//             return;
//         }
//         router.back();
//     };

//     const saveProgressToApi = async (elapsedSecs: number, drop: AudioDrop) => {
//         const userId = getUserId();
//         if (!userId || !drop.id) return;
//         const totalSecs = drop.durationSeconds || parseDurationToSeconds(duration);
//         const pct = totalSecs > 0 ? Math.round((elapsedSecs / totalSecs) * 100) : 0;
//         try {
//             await axios.post("/api/audio-progress", { userId, audioId: drop.id, title: drop.title, subtitle: drop.subtitle || "Audio Drop", elapsed: elapsedSecs, durationSeconds: totalSecs, pct, url: drop.audioUrl });
//         } catch (err) { console.error("[audio-progress] save error:", err); }
//     };

//     const startProgressSaving = (drop: AudioDrop) => {
//         if (progressSaveRef.current) clearInterval(progressSaveRef.current);
//         progressSaveRef.current = setInterval(() => { saveProgressToApi(elapsedRef.current, drop); }, 5000);
//     };

//     const stopProgressSaving = (drop: AudioDrop) => {
//         if (progressSaveRef.current) { clearInterval(progressSaveRef.current); progressSaveRef.current = null; }
//         saveProgressToApi(elapsedRef.current, drop);
//     };

//     const incrementListens = async () => {
//         const id = audioIdRef.current;
//         if (hasCountedListen.current || !id) return;
//         hasCountedListen.current = true;
//         try {
//             const res = await axios.post("/api/cloudinary/plays", { id });
//             if (res.data.success) {
//                 setPlaysCount(res.data.plays);
//                 setAudioDrop((prev) => prev ? { ...prev, listens: res.data.plays } : prev);
//             }
//         } catch (err) { console.error("[listens] error:", err); }
//     };

//     useEffect(() => { incrementListensRef.current = incrementListens; });

//     const navigateToAudio = (index: number) => {
//         const files = allAudioFilesRef.current;
//         if (index < 0 || index >= files.length) return;
//         if (audioDropRef.current) stopProgressSaving(audioDropRef.current);
//         const target = files[index];
//         setCurrentIndex(index);
//         setPlaying(false);
//         setElapsed(0);
//         elapsedRef.current = 0;
//         setDuration("0:00");
//         hasCountedListen.current = false;
//         audioIdRef.current = target.id;
//         const drop = audioFileToAudioDrop(target);
//         setAudioDrop(drop);
//         fetchSignalsCount(target.id);
//         fetchRecentSignals(target.id);
//         const url = new URL(window.location.href);
//         url.searchParams.set("id", target.id);
//         url.searchParams.delete("resume");
//         window.history.pushState({}, "", url.toString());
//     };

//     useEffect(() => { navigateToAudioRef.current = navigateToAudio; });

//     const handleSendSignal = async () => {
//         if (!signalMessage.trim() || !audioDrop?.id) return;
//         setSendingSignal(true);
//         try {
//             const response = await axios.post("/api/audio-messages", { audioId: audioDrop.id, audioTitle: audioDrop.title, userId: getUserId() || "anonymous", userName: getUserName(), message: signalMessage.trim() });
//             if (response.data.success) {
//                 setSignalsCount((prev) => prev + 1);
//                 setRecentSignals((prev) => [response.data.signal, ...prev].slice(0, 5));
//                 setShowSignalDialog(false);
//                 setSignalMessage("");
//                 alert("Signal sent successfully!");
//             }
//         } catch (error) { console.error("Error sending signal:", error); alert("Failed to send signal. Please try again."); }
//         finally { setSendingSignal(false); }
//     };

//     useEffect(() => {
//         fetchAudioData();
//         return () => { if (progressSaveRef.current) clearInterval(progressSaveRef.current); };
//     }, [idParam, urlParam]);

//     const fetchAudioData = async () => {
//         try {
//             setLoading(true);
//             audioReadyToPlayRef.current = false;
//             setError(null);
//             setDuration("0:00");
//             setElapsed(0);
//             elapsedRef.current = 0;
//             setPlaying(false);
//             setSignalsCount(0);
//             setRecentSignals([]);
//             hasCountedListen.current = false;

//             if (urlParam && !idParam) {
//                 const decodedUrl = decodeURIComponent(urlParam);
//                 audioIdRef.current = null;
//                 setAudioDrop({ title: "Audio Track", subtitle: "Audio Drop", description: "", listens: 0, signals: 0, duration: "0:00", engagement: 0, audioUrl: decodedUrl });
//                 setLoading(false);
//                 return;
//             }

//             const response = await axios.get<{ success: boolean; audioFiles: AudioFile[] }>("/api/cloudinary/audio?limit=100");
//             if (!response.data.success || !response.data.audioFiles.length) { setError("No audio files available."); setLoading(false); return; }

//             const audioFiles = response.data.audioFiles;
//             setAllAudioFiles(audioFiles);
//             allAudioFilesRef.current = audioFiles;

//             let target: AudioFile | undefined;
//             let targetIndex = 0;

//             if (idParam) {
//                 const found = audioFiles.findIndex((a) => a.id === idParam);
//                 targetIndex = found >= 0 ? found : 0;
//                 target = audioFiles[targetIndex];
//             } else if (urlParam) {
//                 const decodedUrl = decodeURIComponent(urlParam);
//                 const found = audioFiles.findIndex((a) => a.url === decodedUrl);
//                 targetIndex = found >= 0 ? found : 0;
//                 target = audioFiles[targetIndex];
//             } else {
//                 target = audioFiles[0];
//                 targetIndex = 0;
//             }

//             setCurrentIndex(targetIndex);
//             currentIndexRef.current = targetIndex;

//             if (target) {
//                 const drop = audioFileToAudioDrop(target);
//                 audioIdRef.current = drop.id ?? null;
//                 setAudioDrop(drop);
//                 const [, playsRes] = await Promise.all([
//                     Promise.all([fetchSignalsCount(drop.id!), fetchRecentSignals(drop.id!)]),
//                     axios.get("/api/cloudinary/plays"),
//                 ]);
//                 if (playsRes.data.plays) setPlaysCount(playsRes.data.plays[drop.id!] ?? 0);
//                 if (resumeAt > 0) { setElapsed(resumeAt); elapsedRef.current = resumeAt; }
//             } else {
//                 setError("Audio drop not found.");
//             }
//         } catch (err) { console.error("Error fetching audio:", err); setError("Failed to load audio."); }
//         finally { audioReadyToPlayRef.current = true; setLoading(false); }
//     };

//     const fetchSignalsCount = async (audioId: string) => {
//         try {
//             const response = await axios.get(`/api/audio-messages?audioId=${audioId}&count=true`);
//             if (response.data.success) setSignalsCount(response.data.count);
//         } catch (error) { console.error("Error fetching signals count:", error); }
//     };

//     const fetchRecentSignals = async (audioId: string) => {
//         try {
//             const response = await axios.get(`/api/audio-messages?audioId=${audioId}&limit=5`);
//             if (response.data.success) setRecentSignals(response.data.signals);
//         } catch (error) { console.error("Error fetching recent signals:", error); }
//     };

//     const openShareDialog = () => { setShowShareDialog(true); setCopied(false); };
//     const closeShareDialog = () => { setShowShareDialog(false); setCopied(false); };

//     const handleShareToWhatsApp = () => { if (!audioDrop) return; window.open(`https://wa.me/?text=${encodeURIComponent(buildAudioDropShareText(audioDrop, urlParam))}`, "_blank"); };
//     const handleShareToThreads = () => { if (!audioDrop) return; window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildAudioDropShareText(audioDrop, urlParam))}`, "_blank"); };
//     const handleShareToInstagram = async () => { if (!audioDrop) return; await copyToClipboard(buildAudioDropShareText(audioDrop, urlParam)); setCopied(true); setTimeout(() => setCopied(false), 1600); window.open("https://www.instagram.com/", "_blank"); };
//     const handleShareToLinkedIn = () => { if (!audioDrop) return; window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildAudioDropShareUrl(audioDrop, urlParam))}`, "_blank"); };
//     const handleShareToX = () => { if (!audioDrop) return; window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildAudioDropShareText(audioDrop, urlParam))}`, "_blank"); };
//     const handleCopyLink = async () => { if (!audioDrop) return; const ok = await copyToClipboard(buildAudioDropShareText(audioDrop, urlParam)); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); } };

//     useEffect(() => {
//         const url = audioDrop?.audioUrl;
//         if (!url) return;
//         hasCountedListen.current = false;
//         audioIdRef.current = audioDrop?.id ?? null;
//         if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
//         const audio = new Audio(url);
//         audioRef.current = audio;
//         audio.addEventListener("play", () => setPlaying(true));
//         audio.addEventListener("pause", () => setPlaying(false));
//         audio.addEventListener("loadedmetadata", () => {
//             const secs = audio.duration;
//             if (secs && !isNaN(secs) && isFinite(secs) && secs > 0) {
//                 const m = Math.floor(secs / 60);
//                 const s = Math.floor(secs % 60);
//                 setDuration(`${m}:${s.toString().padStart(2, "0")}`);
//                 if (resumeAt > 0) { audio.currentTime = resumeAt; setElapsed(resumeAt); elapsedRef.current = resumeAt; }
//                 if (audioReadyToPlayRef.current) { setPlaying(true); }
//                 else { const pollReady = setInterval(() => { if (audioReadyToPlayRef.current) { clearInterval(pollReady); setPlaying(true); } }, 100); }
//             }
//         });
//         audio.addEventListener("ended", () => {
//             setPlaying(false); setElapsed(0); elapsedRef.current = 0;
//             incrementListensRef.current();
//             const userId = getUserId();
//             const drop = audioDropRef.current;
//             if (userId && drop?.id) axios.delete(`/api/audio-progress?userId=${userId}&audioId=${encodeURIComponent(drop.id)}`).catch(err => console.error("[audio-progress] clear error:", err));
//             if (progressSaveRef.current) clearInterval(progressSaveRef.current);
//             setTimeout(() => { const nextIndex = currentIndexRef.current + 1; if (nextIndex < allAudioFilesRef.current.length) navigateToAudioRef.current(nextIndex); }, 1000);
//         });
//         audio.load();
//         return () => { audio.pause(); audio.src = ""; };
//     }, [audioDrop?.audioUrl]);

//     useEffect(() => {
//         const audio = audioRef.current;
//         if (!audio || !audioDrop) return;
//         if (playing) { audio.play().catch(console.error); timerRef.current = setInterval(() => setElapsed(audio.currentTime), 1000); startProgressSaving(audioDrop); }
//         else { audio.pause(); if (timerRef.current) clearInterval(timerRef.current); if (audioDropRef.current) stopProgressSaving(audioDropRef.current); }
//         return () => { if (timerRef.current) clearInterval(timerRef.current); };
//     }, [playing]);

//     useEffect(() => {
//         return () => { if (timerRef.current) clearInterval(timerRef.current); if (progressSaveRef.current) clearInterval(progressSaveRef.current); };
//     }, []);

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
//                     <p className="text-gray-400">Loading audio...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !audioDrop) {
//         return (
//             <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
//                 <div className="text-center">
//                     <p className="text-red-400 mb-4">{error || "Audio not found"}</p>
//                     <button onClick={handleBack} className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600">Go Back</button>
//                                     <button onClick={handleBack} className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600">Go Back</button>
//                 </div>
//             </div>
//         );
//     }

//     const totalSecs = parseDurationToSeconds(duration);
//     const mins = Math.floor(elapsed / 60);
//     const secs = Math.floor(elapsed % 60);
//     const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
//     const pct = totalSecs > 0 ? Math.round((elapsed / totalSecs) * 100) : 0;
//     const prevAudio = allAudioFiles[currentIndex - 1];
//     const nextAudio = allAudioFiles[currentIndex + 1];

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
//         <div className="min-h-screen bg-[#0d0d10] w-full">
//             <div className="max-w-6xl mx-auto p-4 lg:p-10 pb-20">

//                 <Link href="/MainModules/MatchesDropContent" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
//                     <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition cursor-pointer">
//                         <ArrowLeft size={18} />
//                         <span className="text-sm">Back</span>
//                     </button>
//                 </Link>

//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                         <div>
//                             <p className="text-white text-[15px] font-medium leading-tight">{audioDrop.title}</p>
//                             <p className="text-[#888] text-[12px] mt-0.5">{audioDrop.subtitle || "Audio Drop"}</p>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         {/* Playlist button — opens the extracted component */}
//                         <button
//                              onClick={() => setShowPlaylistDialog(true)}
//                              className="px-4 py-2 bg-[#111111] rounded-xl border border-white/5 shadow-[0_4px_15px_rgb(0,0,0,0.5)] hover:bg-[#1a1a1a] transition-all duration-300 group active:scale-95 flex items-center justify-center"
//                              title="Add to Playlist"
//                          >
//                              <span className="text-gray-300 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase group-hover:text-white transition-colors">
//                                  Add to Playlist
//                              </span>
//                          </button>
//                         <button onClick={openShareDialog} className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer hover:bg-[#2a2a2e] transition">
//                             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                                 <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                 <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                 <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                 <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
//                             </svg>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Resume banner */}
//                 {resumeAt > 0 && (
//                     <div className="mb-4 px-4 py-2 bg-[#C9115F]/10 border border-[#C9115F]/30 rounded-xl flex items-center gap-2">
//                         <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L11 7L5 11V3Z" fill="#C9115F" /></svg>
//                         <p className="text-[#C9115F] text-[12px]">Resuming from {Math.floor(resumeAt / 60)}:{String(Math.floor(resumeAt % 60)).padStart(2, "0")}</p>
//                     </div>
//                 )}

//                 {/* Main layout */}
//                 <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 w-full min-w-0">

//                     {/* Audio Player */}
//                     {/* <div className="w-full lg:w-[400px] lg:max-w-[400px] flex-shrink-0 lg:self-start">
//                         <div className="bg-[#111114] rounded-2xl border border-[#2a2a2e]">
//                             <div className="bg-[#1a0a10] p-6 flex flex-col items-center gap-4"> */}

//                     <div className="w-full lg:w-[400px] lg:max-w-[400px] flex-shrink-0">
//                         <div className="bg-[#111114] rounded-2xl border border-[#2a2a2e]">
//                             <div className="bg-[#1a0a10] p-6 flex flex-col items-center gap-4">
//                                 <div className="w-[80px] h-[80px] rounded-full bg-[#c0204a] flex items-center justify-center">
//                                     <svg width="20" height="20" viewBox="0 0 34 34" fill="none">
//                                         <path d="M5 18v-1C5 10.373 10.373 5 17 5s12 5.373 12 12v1" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
//                                         <rect x="3" y="17" width="5" height="9" rx="2.5" fill="#fff" />
//                                         <rect x="26" y="17" width="5" height="9" rx="2.5" fill="#fff" />
//                                     </svg>
//                                 </div>

//                                 <button
//                                     onClick={() => setPlaying((v) => !v)}
//                                     className="w-[52px] h-[52px] rounded-full bg-[#e0185a] hover:bg-[#f01e66] flex items-center justify-center transition"
//                                 >
//                                     {playing ? (
//                                         <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                                             <rect x="5" y="4" width="3" height="10" rx="1" fill="#fff" />
//                                             <rect x="12" y="4" width="3" height="10" rx="1" fill="#fff" />
//                                         </svg>
//                                     ) : (
//                                         <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                                             <path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#fff" />
//                                         </svg>
//                                     )}
//                                 </button>

//                                 <div className="w-full">
//                                     <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
//                                         <div className="h-full bg-[#e0185a] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
//                                     </div>
//                                     <div className="flex justify-between text-[11px] text-[#666] font-mono">
//                                         <span>{timeStr}</span>
//                                         <span>{duration}</span>
//                                     </div>
//                                 </div>

//                                 {allAudioFiles.length > 1 && (
//                                     <div className="flex items-center justify-between w-full gap-2">
//                                         <button onClick={() => navigateToAudio(currentIndex - 1)} disabled={currentIndex === 0} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a0f1c] border border-[#e0185a]/30 text-[#e0185a] text-[12px] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a1525] transition">
//                                             <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
//                                             Prev
//                                         </button>
//                                         <span className="text-[#666] text-[11px]">{currentIndex + 1} / {allAudioFiles.length}</span>
//                                         <button onClick={() => navigateToAudio(currentIndex + 1)} disabled={currentIndex === allAudioFiles.length - 1} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a0f1c] border border-[#e0185a]/30 text-[#e0185a] text-[12px] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a1525] transition">
//                                             Next
//                                             <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
//                                         </button>
//                                     </div>
//                                 )}

//                                 {nextAudio && (
//                                     <div onClick={() => navigateToAudio(currentIndex + 1)} className="w-full flex items-center gap-2 bg-[#2a0f1c]/60 border border-[#e0185a]/20 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#2a0f1c] transition">
//                                         <div className="w-7 h-7 rounded-full bg-[#e0185a]/20 flex items-center justify-center flex-shrink-0">
//                                             <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#e0185a" /></svg>
//                                         </div>
//                                         <div className="min-w-0 flex-1">
//                                             <p className="text-[#888] text-[10px] uppercase tracking-wider">Up Next</p>
//                                             <p className="text-white text-[12px] font-medium truncate">{audioFileToAudioDrop(nextAudio).title}</p>
//                                             <p className="text-[#666] text-[10px] truncate">{nextAudio.matchInfo?.speaker?.replace(/^toss report\s*/i, "").replace(/^script\s*/i, "").replace(/^story\s*/i, "").trim() || "Audio Drop"}</p>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {prevAudio && (
//                                     <div onClick={() => navigateToAudio(currentIndex - 1)} className="w-full flex items-center gap-2 bg-[#1a1a2e]/60 border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#1a1a2e] transition">
//                                         <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
//                                             <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M13 4.5L4 10L13 15.5V4.5Z" fill="#aaa" /></svg>
//                                         </div>
//                                         <div className="min-w-0 flex-1">
//                                             <p className="text-[#666] text-[10px] uppercase tracking-wider">Previous</p>
//                                             <p className="text-[#aaa] text-[12px] font-medium truncate">{audioFileToAudioDrop(prevAudio).title}</p>
//                                             <p className="text-[#555] text-[10px] truncate">{prevAudio.matchInfo?.speaker?.replace(/^toss report\s*/i, "").replace(/^script\s*/i, "").replace(/^story\s*/i, "").trim() || "Audio Drop"}</p>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Info Panel */}
//                     <div className="flex-1 min-w-0 min-h-0 bg-[#111114] rounded-2xl border border-[#2a2a2e] p-5 flex flex-col gap-4">
//                         <div>
//                             <h1 className="text-white text-[20px] font-medium leading-snug mb-1">{audioDrop.title}</h1>
//                             {audioDrop.speaker && <p className="text-[#C9115F] text-[12px] mb-1">by {audioDrop.speaker}</p>}
//                             <p className="text-[#888] text-[13px] leading-relaxed">{audioDrop.description}</p>
//                         </div>

//                         <div className="grid grid-cols-3 gap-2.5 w-full">
//                             {[
//                                 { label: "Plays", value: playsCount.toLocaleString() },
//                                 { label: "Signals", value: signalsCount.toLocaleString() },
//                                 { label: "Duration", value: duration },
//                             ].map((s) => (
//                                 <div key={s.label} className="bg-[#1a1a1e] rounded-xl p-2.5 flex flex-col gap-1.5">
//                                     <span className="text-[10px] uppercase tracking-wider text-[#999]">{s.label}</span>
//                                     <span className="text-[17px] font-medium text-white">{s.value}</span>
//                                 </div>
//                             ))}
//                         </div>

//                        {/* Where ScriptPanel is used in the Info Panel */}
// <div className="min-w-0 w-full overflow-hidden">
//     <ScriptPanel matchInfo={audioDrop.matchInfo} />
// </div>

//                         <div className="flex flex-row flex-wrap items-center gap-4 text-[12px] text-[#666]">
//                             <div className="flex items-center gap-1.5">
//                                 <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="#666" strokeWidth="1.2" /><path d="M1.5 5.5h10M4.5 1v3M8.5 1v3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" /></svg>
//                                 {audioDrop.date || "Recent"}
//                             </div>
//                             <div className="flex items-center gap-1.5">
//                                 <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2.5" stroke="#666" strokeWidth="1.2" /><path d="M2 11c0-2 2-3 4.5-3s4.5 1 4.5 3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" /></svg>
//                                 {audioDrop.room || "Audio Room"}
//                             </div>
//                         </div>

//                         <div>
//                             <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
//                                 <div className="h-full bg-[#e0185a] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
//                             </div>
//                             <p className="text-right text-[11px] text-[#666]">{pct}% listened</p>
//                         </div>

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

//                         <CommentsSection contentId={audioDrop.id || ""} contentType="audio" contentTitle={audioDrop.title} className="mt-5" />
//                     </div>
//                 </div>
//             </div>

//             {/* ── PlaylistDialog component ── */}
//             <PlaylistDialog
//                 open={showPlaylistDialog}
//                 onClose={() => setShowPlaylistDialog(false)}
//                 itemId={audioDrop.id || ""}
//                 itemType="audio"
//                 userId={getUserId()}
//             />

//             {/* Share Dialog */}
//             {showShareDialog && audioDrop && (
//                 <>
//                     <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
//                     <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-2">
//                             <p className="text-white text-sm font-semibold">Share</p>
//                             <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
//                                 <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
//                             </button>
//                         </div>
//                         <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
//                         {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//                     </div>
//                     <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
//                         <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
//                             <div className="flex items-center justify-between mb-3">
//                                 <p className="text-white text-sm font-semibold">Share Audio Drop</p>
//                                 <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
//                                     <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
//                                 </button>
//                             </div>
//                             <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
//                                 <p className="text-white text-sm font-semibold line-clamp-2">{audioDrop.title}</p>
//                                 <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildAudioDropShareUrl(audioDrop, urlParam)}</p>
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
//                         <p className="text-gray-400 text-sm mb-4">Share your thoughts about &apos;{audioDrop.title}&apos;</p>
//                         <textarea value={signalMessage} onChange={e => setSignalMessage(e.target.value)} placeholder="Type your message here..." className="w-full bg-[#111114] text-white text-sm rounded-xl px-4 py-3 border border-[#2a2a2e] focus:outline-none focus:border-[#e0185a] resize-none" rows={4} maxLength={500} autoFocus />
//                         <div className="flex justify-end gap-3 mt-4">
//                             <button onClick={() => setShowSignalDialog(false)} className="px-4 py-2 rounded-lg bg-[#2a2a2e] text-gray-300 text-sm font-medium hover:bg-[#3a3a3e] transition">Cancel</button>
//                             <button onClick={handleSendSignal} disabled={!signalMessage.trim() || sendingSignal} className="px-4 py-2 rounded-lg bg-[#e0185a] text-white text-sm font-medium hover:bg-[#f01e66] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
import { useActivity } from "@/context/ActivityContext";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { useScripts } from "@/context/ScriptsContext";
import CommentsSection from "@/src/components/CommentsSection";
import PlaylistDialog from "../playlistdialog-component/playlistdialog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


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

interface AudioDrop {
    id?: string;
    title: string;
    subtitle?: string;
    description: string;
    listens: number;
    signals: number;
    duration: string;
    date?: string;
    room?: string;
    engagement: number;
    audioUrl?: string;
    sizeFormatted?: string;
    speaker?: string;
    team1?: string;
    team2?: string;
    durationSeconds?: number;
    matchInfo?: MatchInfo;
}

interface SignalMessage {
    id: string;
    audioId: string;
    userId: string;
    userName: string;
    message: string;
    createdAt: number;
}

const parseDurationToSeconds = (duration: string): number => {
    const parts = duration.split(":");
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    return 0;
};

function audioFileToAudioDrop(audio: AudioFile): AudioDrop {
    let fallbackMatchInfo = audio.matchInfo;

    if (!fallbackMatchInfo && audio.title && audio.title.toLowerCase().includes("vs")) {
        const parts = audio.title.split(" ");
        const vsIndex = parts.findIndex(p => p.toLowerCase() === "vs");

        if (vsIndex > 0 && vsIndex < parts.length - 1) {
            fallbackMatchInfo = {
                team1: parts[vsIndex - 1],
                team2: parts[vsIndex + 1],
                type: audio.title.toLowerCase().includes("post match") ? "Post Match"
                    : audio.title.toLowerCase().includes("pre match") ? "Pre Match"
                    : "Audio Script"
            };
        }
    }

    return {
        id: audio.id,
        title: audio.title,
        subtitle: fallbackMatchInfo?.type
            ? `${fallbackMatchInfo.type.replace(/_/g, " ")} — ${fallbackMatchInfo.team1 ?? ""} vs ${fallbackMatchInfo.team2 ?? ""}`
            : "Audio Drop",
        description: fallbackMatchInfo
            ? `${fallbackMatchInfo.team1 ?? ""} vs ${fallbackMatchInfo.team2 ?? ""} — ${fallbackMatchInfo.type?.replace(/_/g, " ") ?? ""}`
            : audio.title,
        listens: 0,
        signals: 0,
        duration: audio.duration,
        date: audio.createdAtFormatted,
        room: fallbackMatchInfo?.team1
            ? `${fallbackMatchInfo.team1} vs ${fallbackMatchInfo.team2}`
            : "Audio Room",
        engagement: 0,
        audioUrl: audio.url,
        sizeFormatted: audio.sizeFormatted,
        speaker: fallbackMatchInfo?.speaker || audio.matchInfo?.speaker,
        team1: fallbackMatchInfo?.team1,
        team2: fallbackMatchInfo?.team2,
        durationSeconds: audio.durationSeconds,
        matchInfo: fallbackMatchInfo,
    };
}

const buildAudioDropShareUrl = (audioDrop: AudioDrop, urlParam: string | null) => {
    if (typeof window === "undefined") return "";
    const targetUrl = new URL(`${window.location.origin}/MainModules/MatchesDropContent/AudioDropScreen`);
    if (audioDrop.id) {
        targetUrl.searchParams.set("id", audioDrop.id);
        return targetUrl.toString();
    }
    if (urlParam) {
        targetUrl.searchParams.set("url", urlParam);
        return targetUrl.toString();
    }
    return targetUrl.toString();
};

const buildAudioDropShareText = (audioDrop: AudioDrop, urlParam: string | null) => {
    const shareUrl = buildAudioDropShareUrl(audioDrop, urlParam);
    return [
        `Listen to ${audioDrop.title} on Sportsfan`,
        audioDrop.subtitle || "Audio Drops",
        audioDrop.description || "Latest audio drop from Sportsfan.",
        `View and listen: ${shareUrl}`,
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

// ─── Points Toast ─────────────────────────────────────────────────────────────
function PointsToast({ onDone }: { onDone: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div
            className="fixed top-6 left-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold tracking-wide shadow-2xl"
            style={{
                transform: "translateX(-50%)",
                background: "rgba(74,222,128,0.15)",
                border: "1px solid #4ade80",
                color: "#4ade80",
                backdropFilter: "blur(12px)",
                animation: "pointsToastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                whiteSpace: "nowrap",
            }}
        >
            🎧 +2 SXP - thanks for listening!
            <style>{`
                @keyframes pointsToastIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-14px) scale(0.9); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);   }
                }
            `}</style>
        </div>
    );
}

// ─── Script Panel ─────────────────────────────────────────────────────────────
function ScriptPanel({ matchInfo }: { matchInfo?: MatchInfo }) {
    const { findScript, fetchScriptContent } = useScripts();
    const [scriptHtml, setScriptHtml] = useState<string | null>(null);
    const [scriptLoading, setScriptLoading] = useState(false);
    const [scriptError, setScriptError] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setScriptHtml(null);
        setScriptError(false);
        setExpanded(false);

        if (!matchInfo) return;

        const script = findScript(matchInfo);
        if (!script) return;

        setScriptLoading(true);
        fetchScriptContent(script.url)
            .then((html) => { if (html) setScriptHtml(html); else setScriptError(true); })
            .catch(() => setScriptError(true))
            .finally(() => setScriptLoading(false));
    }, [matchInfo, findScript, fetchScriptContent]);

    if (!matchInfo || (!scriptLoading && !scriptHtml && !scriptError)) {
        return (
            <div className="bg-[#1a1a1e] border border-white/5 rounded-2xl p-4 h-[200px] flex-shrink-0 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <ScriptIcon />
                        <p className="text-white text-[13px] font-medium">Audio Script</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9115F]/15 text-[#C9115F] border border-[#C9115F]/30 font-medium tracking-wide">Coming Soon</span>
                </div>
                <p className="text-[#555] text-[12px] leading-relaxed mb-3">Can&apos;t listen right now? Full audio transcripts will be available here so you can read along at your own pace.</p>
                <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-3 bg-[#222226] rounded-full animate-pulse" style={{ width: `${90 - i * 15}%` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (scriptLoading) {
        return (
            <div className="bg-[#1a1a1e] border border-white/5 rounded-2xl p-4 h-[200px] flex-shrink-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                    <ScriptIcon />
                    <p className="text-white text-[13px] font-medium">Audio Script</p>
                </div>
                <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-3 bg-[#222226] rounded-full animate-pulse" style={{ width: `${95 - i * 10}%` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (scriptError) {
        return (
            <div className="bg-[#1a1a1e] border border-white/5 rounded-2xl p-4 h-[200px] flex-shrink-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                    <ScriptIcon />
                    <p className="text-white text-[13px] font-medium">Audio Script</p>
                </div>
                <p className="text-[#555] text-[12px]">Script could not be loaded.</p>
            </div>
        );
    }

    return (
        <div className="flex-shrink-0 min-w-0">
            <div
                className={`bg-[#1a1a1e] border border-white/5 rounded-2xl p-4 ${expanded ? "" : "h-[200px] overflow-y-auto"}`}
                style={!expanded ? { scrollbarWidth: "thin", scrollbarColor: "#3a3a3e #1a1a1e" } : undefined}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <ScriptIcon />
                        <p className="text-white text-[13px] font-medium">Audio Script</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium tracking-wide">Available</span>
                </div>
                <div
                    className="text-[#ccc] text-[12px] leading-relaxed script-content overflow-hidden w-full min-w-0"
                    style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
                    dangerouslySetInnerHTML={{ __html: scriptHtml! }}
                />
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-3 flex items-center gap-1.5 text-[#C9115F] text-[12px] font-medium hover:text-[#e0185a] transition sticky bottom-0 bg-[#1a1a1e] py-1"
                >
                    {expanded ? (
                        <>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Show less
                        </>
                    ) : (
                        <>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Read full script
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function ScriptIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="#888" strokeWidth="1.3" />
            <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="#888" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AudioDropCard() {
    const { user, getUserName } = useAuth();
    const { refreshActivities, addLocalActivity } = useActivity();
    const { addLocalPoints } = useLeaderboard();
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const urlParam = searchParams.get("url");
    const fromPlaylist = searchParams.get("from") === "playlist";
    const playlistId = searchParams.get("playlistId");
    const resumeAt = parseFloat(searchParams.get("resume") || "0");

    const [playing, setPlaying] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [duration, setDuration] = useState("0:00");
    const [audioDrop, setAudioDrop] = useState<AudioDrop | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [allAudioFiles, setAllAudioFiles] = useState<AudioFile[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const [showSignalDialog, setShowSignalDialog] = useState(false);
    const [signalMessage, setSignalMessage] = useState("");
    const [sendingSignal, setSendingSignal] = useState(false);
    const [signalsCount, setSignalsCount] = useState(0);
    const [recentSignals, setRecentSignals] = useState<SignalMessage[]>([]);
    const [playsCount, setPlaysCount] = useState(0);

    const [showShareDialog, setShowShareDialog] = useState(false);
    const [copied, setCopied] = useState(false);

    const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);

    // ── Points toast state ────────────────────────────────────────────────────
    const [showPointsToast, setShowPointsToast] = useState(false);
    // Tracks whether +2 pts have already been awarded for the current track
    // in this browser session (server is the source of truth via transactionId,
    // but this prevents firing the toast more than once per track load).
    const hasAwardedPointsRef = useRef(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressSaveRef = useRef<NodeJS.Timeout | null>(null);
    const elapsedRef = useRef(0);
    const audioDropRef = useRef<AudioDrop | null>(null);
    const audioReadyToPlayRef = useRef(false);
    const requestedPointsRef = useRef(false);

    useEffect(() => { elapsedRef.current = elapsed; }, [elapsed]);
    useEffect(() => { audioDropRef.current = audioDrop; }, [audioDrop]);

    const hasCountedListen = useRef(false);
    const audioIdRef = useRef<string | null>(null);
    const incrementListensRef = useRef<() => void>(() => { });
    const navigateToAudioRef = useRef<(index: number) => void>(() => { });
    const currentIndexRef = useRef<number>(0);
    const allAudioFilesRef = useRef<AudioFile[]>([]);

    useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
    useEffect(() => { allAudioFilesRef.current = allAudioFiles; }, [allAudioFiles]);

    const getUserId = () => user?.userId || user?.uid || user?.email || null;

    const handleBack = () => {
        if (fromPlaylist && playlistId) {
            router.push(`/MainModules/Playlists?playlistId=${encodeURIComponent(playlistId)}`);
            return;
        }
        router.back();
    };

    // ── Save progress + trigger points award at 90% ───────────────────────────
    const applyPersistedAudioPoints = async (drop: AudioDrop, pointsAwarded: number) => {
        const userId = getUserId();
        if (!userId || !drop.id || pointsAwarded <= 0 || hasAwardedPointsRef.current) return;

        const transactionId = `${userId}_${encodeURIComponent(drop.id)}_LISTEN_COMPLETE`;
        hasAwardedPointsRef.current = true;
        addLocalPoints(pointsAwarded);
        addLocalActivity({
            id: transactionId,
            type: "LISTEN_AUDIO_DROP",
            points: pointsAwarded,
            label: "Listen Audio Drops",
            metadata: {
                audioId: drop.id,
                audioTitle: drop.title,
                title: drop.title,
                subtitle: drop.subtitle || "Audio Drop",
                url: drop.audioUrl || "",
                transactionId,
            },
            createdAt: Date.now(),
        });
        setShowPointsToast(true);
        await refreshActivities();
    };

    const saveProgressToApi = async (elapsedSecs: number, drop: AudioDrop) => {
        const userId = getUserId();
        if (!userId || !drop.id) return;

        const totalSecs = drop.durationSeconds || parseDurationToSeconds(duration);
        const pct = totalSecs > 0 ? Math.round((elapsedSecs / totalSecs) * 100) : 0;
        if (pct >= 90 && requestedPointsRef.current) return;
        if (pct >= 90) requestedPointsRef.current = true;

        try {
            const res = await axios.post("/api/audio-progress", {
                userId,
                audioId: drop.id,
                title: drop.title,
                subtitle: drop.subtitle || "Audio Drop",
                elapsed: elapsedSecs,
                durationSeconds: totalSecs,
                pct,
                url: drop.audioUrl,
                // Pass user info so the backend can resolve the correct name/email
                userName: getUserName() || user?.name || user?.email || "User",
                userEmail: user?.email || "",
            });

            const pointsAwarded = Number(res.data?.pointsAwarded) || 0;
            if (pointsAwarded > 0) {
                await applyPersistedAudioPoints(drop, pointsAwarded);
            }
        } catch (err) {
            console.error("[audio-progress] save error:", err);
            if (pct >= 90) requestedPointsRef.current = false;
        }
    };

    const startProgressSaving = (drop: AudioDrop) => {
        if (progressSaveRef.current) clearInterval(progressSaveRef.current);
        progressSaveRef.current = setInterval(() => {
            saveProgressToApi(elapsedRef.current, drop);
        }, 5000);
    };

    const stopProgressSaving = (drop: AudioDrop) => {
        if (progressSaveRef.current) {
            clearInterval(progressSaveRef.current);
            progressSaveRef.current = null;
        }
        saveProgressToApi(elapsedRef.current, drop);
    };

    const incrementListens = async () => {
        const id = audioIdRef.current;
        if (hasCountedListen.current || !id) return;
        hasCountedListen.current = true;
        try {
            const res = await axios.post("/api/cloudinary/plays", { id });
            if (res.data.success) {
                setPlaysCount(res.data.plays);
                setAudioDrop((prev) => prev ? { ...prev, listens: res.data.plays } : prev);
            }
        } catch (err) { console.error("[listens] error:", err); }
        hasCountedListen.current = false;
        hasAwardedPointsRef.current = false;
    };

    useEffect(() => { incrementListensRef.current = incrementListens; });

    const navigateToAudio = (index: number) => {
        const files = allAudioFilesRef.current;
        if (index < 0 || index >= files.length) return;
        if (audioDropRef.current) stopProgressSaving(audioDropRef.current);

        const target = files[index];
        setCurrentIndex(index);
        setPlaying(false);
        setElapsed(0);
        elapsedRef.current = 0;
        setDuration("0:00");
        hasCountedListen.current = false;

        // Reset the points-awarded guard for the new track
        hasAwardedPointsRef.current = false;
        requestedPointsRef.current = false;

        audioIdRef.current = target.id;
        const drop = audioFileToAudioDrop(target);
        setAudioDrop(drop);
        fetchSignalsCount(target.id);
        fetchRecentSignals(target.id);

        const url = new URL(window.location.href);
        url.searchParams.set("id", target.id);
        url.searchParams.delete("resume");
        window.history.pushState({}, "", url.toString());
    };

    useEffect(() => { navigateToAudioRef.current = navigateToAudio; });

    const handleSendSignal = async () => {
        if (!signalMessage.trim() || !audioDrop?.id) return;
        setSendingSignal(true);
        try {
            const response = await axios.post("/api/audio-messages", {
                audioId: audioDrop.id,
                audioTitle: audioDrop.title,
                userId: getUserId() || "anonymous",
                userName: getUserName(),
                message: signalMessage.trim(),
            });
            if (response.data.success) {
                setSignalsCount((prev) => prev + 1);
                setRecentSignals((prev) => [response.data.signal, ...prev].slice(0, 5));
                setShowSignalDialog(false);
                setSignalMessage("");
                alert("Signal sent successfully!");
            }
        } catch (error) {
            console.error("Error sending signal:", error);
            alert("Failed to send signal. Please try again.");
        } finally {
            setSendingSignal(false);
        }
    };

    useEffect(() => {
        fetchAudioData();
        return () => { if (progressSaveRef.current) clearInterval(progressSaveRef.current); };
    }, [idParam, urlParam]);

    const fetchAudioData = async () => {
        try {
            setLoading(true);
            audioReadyToPlayRef.current = false;
            setError(null);
            setDuration("0:00");
            setElapsed(0);
            elapsedRef.current = 0;
            setPlaying(false);
            setSignalsCount(0);
            setRecentSignals([]);
            hasCountedListen.current = false;
            // Reset points guard on new fetch
            hasAwardedPointsRef.current = false;
            requestedPointsRef.current = false;

            if (urlParam && !idParam) {
                const decodedUrl = decodeURIComponent(urlParam);
                audioIdRef.current = null;
                setAudioDrop({
                    title: "Audio Track",
                    subtitle: "Audio Drop",
                    description: "",
                    listens: 0,
                    signals: 0,
                    duration: "0:00",
                    engagement: 0,
                    audioUrl: decodedUrl,
                });
                setLoading(false);
                return;
            }

            const response = await axios.get<{ success: boolean; audioFiles: AudioFile[] }>(
                "/api/cloudinary/audio?limit=100"
            );
            if (!response.data.success || !response.data.audioFiles.length) {
                setError("No audio files available.");
                setLoading(false);
                return;
            }

            const audioFiles = response.data.audioFiles;
            setAllAudioFiles(audioFiles);
            allAudioFilesRef.current = audioFiles;

            let target: AudioFile | undefined;
            let targetIndex = 0;

            if (idParam) {
                const found = audioFiles.findIndex((a) => a.id === idParam);
                targetIndex = found >= 0 ? found : 0;
                target = audioFiles[targetIndex];
            } else if (urlParam) {
                const decodedUrl = decodeURIComponent(urlParam);
                const found = audioFiles.findIndex((a) => a.url === decodedUrl);
                targetIndex = found >= 0 ? found : 0;
                target = audioFiles[targetIndex];
            } else {
                target = audioFiles[0];
                targetIndex = 0;
            }

            setCurrentIndex(targetIndex);
            currentIndexRef.current = targetIndex;

            if (target) {
                const drop = audioFileToAudioDrop(target);
                audioIdRef.current = drop.id ?? null;
                setAudioDrop(drop);

                const [, playsRes] = await Promise.all([
                    Promise.all([fetchSignalsCount(drop.id!), fetchRecentSignals(drop.id!)]),
                    axios.get("/api/cloudinary/plays"),
                ]);
                if (playsRes.data.plays) setPlaysCount(playsRes.data.plays[drop.id!] ?? 0);
                if (resumeAt > 0) { setElapsed(resumeAt); elapsedRef.current = resumeAt; }
            } else {
                setError("Audio drop not found.");
            }
        } catch (err) {
            console.error("Error fetching audio:", err);
            setError("Failed to load audio.");
        } finally {
            audioReadyToPlayRef.current = true;
            setLoading(false);
        }
    };

    const fetchSignalsCount = async (audioId: string) => {
        try {
            const response = await axios.get(`/api/audio-messages?audioId=${audioId}&count=true`);
            if (response.data.success) setSignalsCount(response.data.count);
        } catch (error) { console.error("Error fetching signals count:", error); }
    };

    const fetchRecentSignals = async (audioId: string) => {
        try {
            const response = await axios.get(`/api/audio-messages?audioId=${audioId}&limit=5`);
            if (response.data.success) setRecentSignals(response.data.signals);
        } catch (error) { console.error("Error fetching recent signals:", error); }
    };

    const openShareDialog = () => { setShowShareDialog(true); setCopied(false); };
    const closeShareDialog = () => { setShowShareDialog(false); setCopied(false); };

    const handleShareToWhatsApp = () => { if (!audioDrop) return; window.open(`https://wa.me/?text=${encodeURIComponent(buildAudioDropShareText(audioDrop, urlParam))}`, "_blank"); };
    const handleShareToThreads = () => { if (!audioDrop) return; window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildAudioDropShareText(audioDrop, urlParam))}`, "_blank"); };
    const handleShareToInstagram = async () => { if (!audioDrop) return; await copyToClipboard(buildAudioDropShareText(audioDrop, urlParam)); setCopied(true); setTimeout(() => setCopied(false), 1600); window.open("https://www.instagram.com/", "_blank"); };
    const handleShareToLinkedIn = () => { if (!audioDrop) return; window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildAudioDropShareUrl(audioDrop, urlParam))}`, "_blank"); };
    const handleShareToX = () => { if (!audioDrop) return; window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildAudioDropShareText(audioDrop, urlParam))}`, "_blank"); };
    const handleCopyLink = async () => { if (!audioDrop) return; const ok = await copyToClipboard(buildAudioDropShareText(audioDrop, urlParam)); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); } };

    useEffect(() => {
        const url = audioDrop?.audioUrl;
        if (!url) return;
        hasCountedListen.current = false;
        audioIdRef.current = audioDrop?.id ?? null;
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.addEventListener("play", () => {
            setPlaying(true);
        });
        audio.addEventListener("pause", () => setPlaying(false));
        audio.addEventListener("loadedmetadata", () => {
            const secs = audio.duration;
            if (secs && !isNaN(secs) && isFinite(secs) && secs > 0) {
                const m = Math.floor(secs / 60);
                const s = Math.floor(secs % 60);
                setDuration(`${m}:${s.toString().padStart(2, "0")}`);
                if (resumeAt > 0) { audio.currentTime = resumeAt; setElapsed(resumeAt); elapsedRef.current = resumeAt; }
                if (audioReadyToPlayRef.current) { setPlaying(true); }
                else {
                    const pollReady = setInterval(() => {
                        if (audioReadyToPlayRef.current) { clearInterval(pollReady); setPlaying(true); }
                    }, 100);
                }
            }
        });
        audio.addEventListener("ended", () => {
            setPlaying(false);
            setElapsed(0);
            elapsedRef.current = 0;
            incrementListensRef.current();
            const userId = getUserId();
            const drop = audioDropRef.current;
            if (userId && drop?.id) {
                axios.delete(`/api/audio-progress?userId=${userId}&audioId=${encodeURIComponent(drop.id)}`)
                    .catch(err => console.error("[audio-progress] clear error:", err));
            }
            if (progressSaveRef.current) clearInterval(progressSaveRef.current);
            setTimeout(() => {
                const nextIndex = currentIndexRef.current + 1;
                if (nextIndex < allAudioFilesRef.current.length) navigateToAudioRef.current(nextIndex);
            }, 1000);
        });
        audio.load();
        return () => { audio.pause(); audio.src = ""; };
    }, [audioDrop?.audioUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioDrop) return;
        if (playing) {
            audio.play().catch(console.error);
            timerRef.current = setInterval(() => {
                const currentTime = audio.currentTime;
                setElapsed(currentTime);
                const totalSecs = audio.duration || audioDrop.durationSeconds || parseDurationToSeconds(duration);
                const currentPct = totalSecs > 0 ? Math.round((currentTime / totalSecs) * 100) : 0;
                if (currentPct >= 90 && !requestedPointsRef.current) {
                    saveProgressToApi(currentTime, audioDrop);
                }
            }, 1000);
            startProgressSaving(audioDrop);
        } else {
            audio.pause();
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioDropRef.current) stopProgressSaving(audioDropRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [playing]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (progressSaveRef.current) clearInterval(progressSaveRef.current);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading audio...</p>
                </div>
            </div>
        );
    }

    if (error || !audioDrop) {
        return (
            <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Audio not found"}</p>
                    <button onClick={handleBack} className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600">Go Back</button>
                </div>
            </div>
        );
    }

    const totalSecs = parseDurationToSeconds(duration);
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
    const pct = totalSecs > 0 ? Math.round((elapsed / totalSecs) * 100) : 0;
    const prevAudio = allAudioFiles[currentIndex - 1];
    const nextAudio = allAudioFiles[currentIndex + 1];

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
                <button key={alt} onClick={handler}
                    className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`}>
                    <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
                </button>
            ))}
        </>
    );

    return (
        <div className="min-h-screen bg-[#0d0d10] w-full">
            {/* Points toast */}
            {showPointsToast && <PointsToast onDone={() => setShowPointsToast(false)} />}

            <div className="max-w-6xl mx-auto p-4 lg:p-10 pb-20">

                <Link href="/MainModules/MatchesDropContent" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition cursor-pointer">
                        <ArrowLeft size={18} />
                        <span className="text-sm">Back</span>
                    </button>
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-white text-[15px] font-medium leading-tight">{audioDrop.title}</p>
                            <p className="text-[#888] text-[12px] mt-0.5">{audioDrop.subtitle || "Audio Drop"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPlaylistDialog(true)}
                            className="px-4 py-2 bg-[#111111] rounded-xl border border-white/5 shadow-[0_4px_15px_rgb(0,0,0,0.5)] hover:bg-[#1a1a1a] transition-all duration-300 group active:scale-95 flex items-center justify-center"
                            title="Add to Playlist"
                        >
                            <span className="text-gray-300 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase group-hover:text-white transition-colors">
                                Add to Playlist
                            </span>
                        </button>
                        <button onClick={openShareDialog} className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer hover:bg-[#2a2a2e] transition">
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
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L11 7L5 11V3Z" fill="#C9115F" /></svg>
                        <p className="text-[#C9115F] text-[12px]">Resuming from {Math.floor(resumeAt / 60)}:{String(Math.floor(resumeAt % 60)).padStart(2, "0")}</p>
                    </div>
                )}

                {/* Main layout */}
                <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 w-full min-w-0">

                    {/* Audio Player */}
                    <div className="w-full lg:w-[400px] lg:max-w-[400px] flex-shrink-0">
                        <div className="bg-[#111114] rounded-2xl border border-[#2a2a2e]">
                            <div className="bg-[#1a0a10] p-6 flex flex-col items-center gap-4">
                                <div className="w-[80px] h-[80px] rounded-full bg-[#c0204a] flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 34 34" fill="none">
                                        <path d="M5 18v-1C5 10.373 10.373 5 17 5s12 5.373 12 12v1" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                                        <rect x="3" y="17" width="5" height="9" rx="2.5" fill="#fff" />
                                        <rect x="26" y="17" width="5" height="9" rx="2.5" fill="#fff" />
                                    </svg>
                                </div>

                                <button
                                    onClick={() => setPlaying((v) => !v)}
                                    className="w-[52px] h-[52px] rounded-full bg-[#e0185a] hover:bg-[#f01e66] flex items-center justify-center transition"
                                >
                                    {playing ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <rect x="5" y="4" width="3" height="10" rx="1" fill="#fff" />
                                            <rect x="12" y="4" width="3" height="10" rx="1" fill="#fff" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#fff" />
                                        </svg>
                                    )}
                                </button>

                                <div className="w-full">
                                    <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
                                        <div
                                            className="h-full bg-[#e0185a] rounded-full transition-all duration-300"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[11px] text-[#666] font-mono">
                                        <span>{timeStr}</span>
                                        <span>{duration}</span>
                                    </div>
                                </div>

                                {allAudioFiles.length > 1 && (
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <button
                                            onClick={() => navigateToAudio(currentIndex - 1)}
                                            disabled={currentIndex === 0}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a0f1c] border border-[#e0185a]/30 text-[#e0185a] text-[12px] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a1525] transition"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            Prev
                                        </button>
                                        <span className="text-[#666] text-[11px]">{currentIndex + 1} / {allAudioFiles.length}</span>
                                        <button
                                            onClick={() => navigateToAudio(currentIndex + 1)}
                                            disabled={currentIndex === allAudioFiles.length - 1}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2a0f1c] border border-[#e0185a]/30 text-[#e0185a] text-[12px] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3a1525] transition"
                                        >
                                            Next
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </button>
                                    </div>
                                )}

                                {nextAudio && (
                                    <div
                                        onClick={() => navigateToAudio(currentIndex + 1)}
                                        className="w-full flex items-center gap-2 bg-[#2a0f1c]/60 border border-[#e0185a]/20 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#2a0f1c] transition"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-[#e0185a]/20 flex items-center justify-center flex-shrink-0">
                                            <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#e0185a" /></svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[#888] text-[10px] uppercase tracking-wider">Up Next</p>
                                            <p className="text-white text-[12px] font-medium truncate">{audioFileToAudioDrop(nextAudio).title}</p>
                                            <p className="text-[#666] text-[10px] truncate">
                                                {nextAudio.matchInfo?.speaker?.replace(/^toss report\s*/i, "").replace(/^script\s*/i, "").replace(/^story\s*/i, "").trim() || "Audio Drop"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {prevAudio && (
                                    <div
                                        onClick={() => navigateToAudio(currentIndex - 1)}
                                        className="w-full flex items-center gap-2 bg-[#1a1a2e]/60 border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#1a1a2e] transition"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M13 4.5L4 10L13 15.5V4.5Z" fill="#aaa" /></svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[#666] text-[10px] uppercase tracking-wider">Previous</p>
                                            <p className="text-[#aaa] text-[12px] font-medium truncate">{audioFileToAudioDrop(prevAudio).title}</p>
                                            <p className="text-[#555] text-[10px] truncate">
                                                {prevAudio.matchInfo?.speaker?.replace(/^toss report\s*/i, "").replace(/^script\s*/i, "").replace(/^story\s*/i, "").trim() || "Audio Drop"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="flex-1 min-w-0 min-h-0 bg-[#111114] rounded-2xl border border-[#2a2a2e] p-5 flex flex-col gap-4">
                        <div>
                            <h1 className="text-white text-[20px] font-medium leading-snug mb-1">{audioDrop.title}</h1>
                            {audioDrop.speaker && <p className="text-[#C9115F] text-[12px] mb-1">by {audioDrop.speaker}</p>}
                            <p className="text-[#888] text-[13px] leading-relaxed">{audioDrop.description}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 w-full">
                            {[
                                { label: "Plays", value: playsCount.toLocaleString() },
                                { label: "Signals", value: signalsCount.toLocaleString() },
                                { label: "Duration", value: duration },
                            ].map((s) => (
                                <div key={s.label} className="bg-[#1a1a1e] rounded-xl p-2.5 flex flex-col gap-1.5">
                                    <span className="text-[10px] uppercase tracking-wider text-[#999]">{s.label}</span>
                                    <span className="text-[17px] font-medium text-white">{s.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="min-w-0 w-full overflow-hidden">
                            <ScriptPanel matchInfo={audioDrop.matchInfo} />
                        </div>

                        <div className="flex flex-row flex-wrap items-center gap-4 text-[12px] text-[#666]">
                            <div className="flex items-center gap-1.5">
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="#666" strokeWidth="1.2" /><path d="M1.5 5.5h10M4.5 1v3M8.5 1v3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" /></svg>
                                {audioDrop.date || "Recent"}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2.5" stroke="#666" strokeWidth="1.2" /><path d="M2 11c0-2 2-3 4.5-3s4.5 1 4.5 3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" /></svg>
                                {audioDrop.room || "Audio Room"}
                            </div>
                        </div>

                        <div>
                            <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
                                <div
                                    className="h-full bg-[#e0185a] rounded-full transition-all duration-300"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-right text-[11px] text-[#666] flex-1">{pct}% listened</p>
                                {/* Inline reward hint — only shown before the threshold */}
                                {pct < 90 && user?.userId && (
                                    <p className="text-[10px] text-[#555] ml-3 shrink-0">
                                        +2 pts at 90%
                                    </p>
                                )}
                            </div>
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

                        <CommentsSection contentId={audioDrop.id || ""} contentType="audio" contentTitle={audioDrop.title} className="mt-5" />
                    </div>
                </div>
            </div>

            {/* Playlist Dialog */}
            <PlaylistDialog
                open={showPlaylistDialog}
                onClose={() => setShowPlaylistDialog(false)}
                itemId={audioDrop.id || ""}
                itemType="audio"
                userId={getUserId()}
            />

            {/* Share Dialog */}
            {showShareDialog && audioDrop && (
                <>
                    <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
                    <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white text-sm font-semibold">Share</p>
                            <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                        <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
                        {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
                    </div>
                    <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
                        <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-white text-sm font-semibold">Share Audio Drop</p>
                                <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                </button>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                                <p className="text-white text-sm font-semibold line-clamp-2">{audioDrop.title}</p>
                                <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildAudioDropShareUrl(audioDrop, urlParam)}</p>
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
                        <p className="text-gray-400 text-sm mb-4">Share your thoughts about &apos;{audioDrop.title}&apos;</p>
                        <textarea
                            value={signalMessage}
                            onChange={e => setSignalMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full bg-[#111114] text-white text-sm rounded-xl px-4 py-3 border border-[#2a2a2e] focus:outline-none focus:border-[#e0185a] resize-none"
                            rows={4}
                            maxLength={500}
                            autoFocus
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowSignalDialog(false)} className="px-4 py-2 rounded-lg bg-[#2a2a2e] text-gray-300 text-sm font-medium hover:bg-[#3a3a3e] transition">Cancel</button>
                            <button
                                onClick={handleSendSignal}
                                disabled={!signalMessage.trim() || sendingSignal}
                                className="px-4 py-2 rounded-lg bg-[#e0185a] text-white text-sm font-medium hover:bg-[#f01e66] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {sendingSignal ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Sending...</>
                                ) : "Send Signal"}
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
