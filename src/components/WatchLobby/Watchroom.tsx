// // components/watch-along/WatchRoom.tsx
// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { createPortal } from "react-dom";
// import dynamic from "next/dynamic";
// import { ArrowLeft } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { useAuth } from "@/context/AuthContext";
// import { useWatchAlong, Room, Match } from "@/context/WatchAlongContext";
// import Prediction from "@/src/components/WatchLobby/Prediction";
// import FlashQuiz from "@/src/components/WatchLobby/Flashquiz";
// import LiveChat from "@/src/components/WatchLobby/LiveChat";
// import EmojiStorm from "@/src/components/WatchLobby/Emojistorm";
// import Polls from "@/src/components/WatchLobby/Polls";
// import VideoPlayer from "./VideoPlayer";
// import ConfettiWrapper from "./ConfettiWrapper";
// import Telestrator, { Stroke } from "./Telestrator";
// // Live camera feed via native getUserMedia API
// import Link from "next/link";
// import { Mic, MicOff, Video, VideoOff, MonitorUp, Maximize2, Minimize2, CircleDot, Plus, BarChart3, Brain, Zap, Pin, Share2, Info, X, Cloud, HardDrive, Crown } from "lucide-react";


// const JitsiMeeting = dynamic(
//     () => import("@jitsi/react-sdk").then((mod) => mod.JitsiMeeting),
//     { ssr: false }
// );

// /* ── Jitsi PiP — Jitsi Meet External API SDK ── */
// function LiveCameraFeed({ 
//     hostName, 
//     roomName, 
//     userRole, 
//     userName,
//     onApiReady,
//     onReactionReceived,
//     onParticipantsChange,
//     activeInterview = null,
//     telestratorActive = false,
//     telestratorStrokes = [],
//     onTelestratorStrokeAdded,
//     onTelestratorUndo,
//     onTelestratorClear,
//     onTelestratorToggleActive
// }: { 
//     hostName: string; 
//     roomName: string; 
//     userRole: string; 
//     userName: string;
//     onApiReady?: (api: any) => void;
//     onReactionReceived?: (reaction: string) => void;
//     onParticipantsChange?: (participants: any[]) => void;
//     activeInterview?: string | null;
//     telestratorActive?: boolean;
//     telestratorStrokes?: Stroke[];
//     onTelestratorStrokeAdded?: (stroke: Stroke) => void;
//     onTelestratorUndo?: () => void;
//     onTelestratorClear?: () => void;
//     onTelestratorToggleActive?: () => void;
// }) {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const apiRef = useRef<any>(null);
//     const [micOn, setMicOn] = useState(true);
//     const [vidOn, setVidOn] = useState(true);
//     const [isExpanded, setIsExpanded] = useState(false);
    
//     // Custom browser-based screen recorder states
//     const [isMounted, setIsMounted] = useState(false);
//     const [customRecordingState, setCustomRecordingState] = useState<'idle' | 'recording' | 'finished'>('idle');
//     const [customRecordingMode, setCustomRecordingMode] = useState<'local' | 'file' | null>(null);
//     const [recordingDuration, setRecordingDuration] = useState(0);
//     const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
//     const [showSaveModal, setShowSaveModal] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState<number | null>(null);
//     const [showRecordingOptions, setShowRecordingOptions] = useState(false);

//     const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//     const streamRef = useRef<MediaStream | null>(null);
//     const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

//     const isModerator = userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator';

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const handleApiReady = (api: any) => {
//         apiRef.current = api;
//         if (onApiReady) {
//             onApiReady(api);
//         }
        
//         // Listen to Jitsi's internal mute status changes and synchronize state
//         api.addListener("audioMuteStatusChanged", (data: { muted: boolean }) => {
//             setMicOn(!data.muted);
//         });
//         api.addListener("videoMuteStatusChanged", (data: { muted: boolean }) => {
//             setVidOn(!data.muted);
//         });
//         api.addListener("recordingStatusChanged", (data: { on: boolean; mode?: string }) => {
//             setCustomRecordingState(data.on ? 'recording' : 'idle');
//             setCustomRecordingMode((data.mode || 'local') as 'local' | 'file');
//         });

//         // Listen for custom Jitsi endpoint text messages (used for real-time reactions)
//         api.addListener("endpointTextMessageReceived", (event: any) => {
//             try {
//                 const text = event.eventData?.text || event.data?.text || event.text || (typeof event === 'string' ? event : null);
//                 if (text && text.startsWith("REACTION:")) {
//                     const reaction = text.replace("REACTION:", "");
//                     if (onReactionReceived) {
//                         onReactionReceived(reaction);
//                     }
//                 }
//             } catch (err) {
//                 console.error("Error receiving endpoint text message:", err);
//             }
//         });

//         // Setup real-time participant tracking
//         const updateParticipants = () => {
//             if (onParticipantsChange) {
//                 const list = api.getParticipantsInfo() || [];
//                 onParticipantsChange(list);
//             }
//         };

//         api.addListener("participantJoined", updateParticipants);
//         api.addListener("participantLeft", updateParticipants);
//         api.addListener("displayNameChange", updateParticipants);
//         api.addListener("participantRoleChanged", updateParticipants);
//         api.addListener("videoConferenceJoined", updateParticipants);

//         // Run staggered initial syncs to ensure slower connecting participants resolve correctly
//         setTimeout(updateParticipants, 1000);
//         setTimeout(updateParticipants, 3000);
//         setTimeout(updateParticipants, 5000);
//         setTimeout(updateParticipants, 10000);
//     };

//     const toggleMic = useCallback(() => {
//         if (apiRef.current) {
//             apiRef.current.executeCommand('toggleAudio');
//         }
//     }, []);

//     const toggleVid = useCallback(() => {
//         if (apiRef.current) {
//             apiRef.current.executeCommand('toggleVideo');
//         }
//     }, []);

//     const toggleScreenShare = useCallback(() => {
//         if (apiRef.current) {
//             apiRef.current.executeCommand('toggleShareScreen');
//         }
//     }, []);

//     const formatDuration = useCallback((secs: number) => {
//         const m = Math.floor(secs / 60).toString().padStart(2, '0');
//         const s = (secs % 60).toString().padStart(2, '0');
//         return `${m}:${s}`;
//     }, []);

//     const startCustomRecording = useCallback(async (mode: 'local' | 'file') => {
//         try {
//             // Request display media for tab/window capture
//             const stream = await navigator.mediaDevices.getDisplayMedia({
//                 video: {
//                     displaySurface: "browser",
//                 },
//                 audio: true
//             });

//             streamRef.current = stream;
            
//             const options = { mimeType: 'video/webm;codecs=vp9,opus' };
//             let recorder: MediaRecorder;
//             try {
//                 recorder = new MediaRecorder(stream, options);
//             } catch (e) {
//                 recorder = new MediaRecorder(stream);
//             }

//             const chunks: Blob[] = [];
//             recorder.ondataavailable = (e) => {
//                 if (e.data && e.data.size > 0) {
//                     chunks.push(e.data);
//                 }
//             };

//             recorder.onstop = () => {
//                 const blob = new Blob(chunks, { type: 'video/webm' });
//                 setRecordedBlob(blob);
//                 setCustomRecordingState('finished');
//                 setShowSaveModal(true);
                
//                 if (streamRef.current) {
//                     streamRef.current.getTracks().forEach(track => track.stop());
//                 }
//             };

//             mediaRecorderRef.current = recorder;
//             recorder.start();

//             setCustomRecordingState('recording');
//             setCustomRecordingMode(mode);
//             setRecordingDuration(0);
//             setShowRecordingOptions(false);

//             if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
//             timerIntervalRef.current = setInterval(() => {
//                 setRecordingDuration(prev => prev + 1);
//             }, 1000);

//         } catch (err) {
//             console.error("Failed to start custom screen recording:", err);
//         }
//     }, []);

//     const stopCustomRecording = useCallback(() => {
//         if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//             mediaRecorderRef.current.stop();
//         }
//         if (timerIntervalRef.current) {
//             clearInterval(timerIntervalRef.current);
//         }
//     }, []);

//     const toggleRecording = useCallback(() => {
//         if (customRecordingState === 'recording') {
//             stopCustomRecording();
//         } else {
//             setShowRecordingOptions(prev => !prev);
//         }
//     }, [customRecordingState, stopCustomRecording]);

//     const downloadRecordingLocally = useCallback(() => {
//         if (recordedBlob) {
//             const url = URL.createObjectURL(recordedBlob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = `sportsfan-watchalong-${Date.now()}.webm`;
//             document.body.appendChild(a);
//             a.click();
//             document.body.removeChild(a);
//             URL.revokeObjectURL(url);
            
//             setShowSaveModal(false);
//             setRecordedBlob(null);
//             setCustomRecordingState('idle');
//         }
//     }, [recordedBlob]);

//     const uploadRecordingToServer = useCallback(() => {
//         if (recordedBlob) {
//             setUploadProgress(0);
//             let progress = 0;
//             const interval = setInterval(() => {
//                 progress += 10;
//                 setUploadProgress(progress);
//                 if (progress >= 100) {
//                     clearInterval(interval);
//                 }
//             }, 150);
//         }
//     }, [recordedBlob]);

//     useEffect(() => {
//         setIsMounted(true);
//         return () => {
//             if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
//         };
//     }, []);

//     const toggleExpand = useCallback(() => {
//         setIsExpanded(prev => !prev);
//     }, []);

//     return (
//         <div className={`absolute transition-all overflow-hidden bg-[#000] shadow-2xl z-20 
//             ${isExpanded 
//                 ? 'inset-0 w-full h-full rounded-none z-45' 
//                 : 'bottom-2.5 right-3 w-[140px] h-[95px] lg:w-[240px] lg:h-[160px] rounded-xl border border-white/20 hover:scale-105'
//             }`}>
            
//             <div className="flex w-full h-full">
//                 {/* Jitsi meeting frame */}
//                 <div className="h-full relative w-full">
//                     {/* Jitsi SDK React component */}
//                     <JitsiMeeting
//                         domain="meet.uxexpert.in"
//                         roomName={roomName}
//                         configOverwrite={{
//                             prejoinPageEnabled: false,
//                             prejoinConfig: {
//                                 enabled: false,
//                             },
//                             welcomePage: {
//                                 disabled: true,
//                             },
//                             startWithAudioMuted: !isModerator,
//                             startWithVideoMuted: !isModerator,
//                             startSilent: false, // Fully connect viewers so WebRTC data channels and participants list synchronize correctly
//                             disableDeepLinking: true,
//                             enableWelcomePage: false,
//                             hideConferenceSubject: true,
//                             hideConferenceTimer: true,
//                             disableThirdPartyRequests: true,
//                             p2p: { enabled: false },
//                             defaultLogoUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
//                             logoImageUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
//                             logoClickUrl: '',
//                         }}
//                         interfaceConfigOverwrite={{
//                             SHOW_JITSI_WATERMARK: false,
//                             SHOW_BRAND_WATERMARK: false,
//                             SHOW_POWERED_BY: false,
//                             DEFAULT_LOGO_URL: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
//                             DEFAULT_WELCOME_PAGE_LOGO_URL: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
//                             BRAND_WATERMARK_LINK: '',
//                             JITSI_WATERMARK_LINK: '',
//                             TOOLBAR_BUTTONS: isModerator 
//                                 ? ['microphone', 'camera', 'desktop', 'fullscreen', 'hangup', 'chat', 'settings', 'raisehand', 'videoquality', 'participants-pane', 'recording', 'localrecording', 'select-background'] 
//                                 : [],
//                             FILM_STRIP_MAX_HEIGHT: isModerator ? undefined : 0,
//                             DISABLE_VIDEO_BACKGROUND: true,
//                         }}
//                         userInfo={{
//                             displayName: userName || "Anonymous Viewer",
//                             email: `${(userName || "viewer").toLowerCase().replace(/\s+/g, '')}@sportsfan360.com`,
//                         }}
//                         onApiReady={handleApiReady}
//                         getIFrameRef={(wrapperDiv: HTMLDivElement) => {
//                             wrapperDiv.style.width = '100%';
//                             wrapperDiv.style.height = '100%';
//                             wrapperDiv.style.border = 'none';

//                             const iframe = wrapperDiv.querySelector('iframe');
//                             if (iframe) {
//                                 iframe.style.width = '100%';
//                                 iframe.style.height = '100%';
//                                 iframe.style.border = 'none';
//                             }
//                         }}
//                     />

//                     {/* Telestrator Drawing Board Overlay */}
//                     <Telestrator 
//                         isActive={telestratorActive}
//                         isModerator={isModerator}
//                         strokes={telestratorStrokes}
//                         onStrokeAdded={onTelestratorStrokeAdded}
//                         onUndo={onTelestratorUndo}
//                         onClear={onTelestratorClear}
//                         onToggleActive={onTelestratorToggleActive}
//                     />

//                     {/* LIVE badge & custom overlays */}
//                     {!isExpanded ? (
//                         <>
//                             {/* LIVE badge for minimized view */}
//                             <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-[9999] bg-[#111]/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10">
//                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//                                 <span className="text-[9px] text-green-400 font-bold">LIVE</span>
//                             </div>

//                             {/* Expand toggle button for minimized view */}
//                             <button
//                                 type="button"
//                                 onClick={toggleExpand}
//                                 className="absolute top-1.5 left-8 w-6 h-6 rounded-md flex items-center justify-center bg-[#111]/80 backdrop-blur-md border border-white/10 hover:bg-white/20 text-white transition-all z-[9999]"
//                                 title="Expand"
//                             >
//                                 <Maximize2 size={12} />
//                             </button>
//                         </>
//                     ) : (
//                         <>
//                             {/* Minimize button in the top-right corner when expanded */}
//                             <button
//                                 type="button"
//                                 onClick={toggleExpand}
//                                 className="absolute top-[10px] right-[10px] w-8 h-8 rounded-xl flex items-center justify-center bg-[#111]/90 backdrop-blur-md border border-white/10 hover:bg-white/20 text-white transition-all z-[9999] shadow-2xl"
//                                 title="Minimize"
//                             >
//                                 <Minimize2 size={14} />
//                             </button>
//                         </>
//                     )}

//                     {/* Flashing REC badge for Host */}
//                     {isModerator && customRecordingState === 'recording' && (
//                         <div className="absolute top-1.5 left-14 flex items-center gap-1 z-[9999] bg-red-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-black text-white border border-red-500/30 animate-pulse">
//                             <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
//                             <span>REC {formatDuration(recordingDuration)}</span>
//                         </div>
//                     )}



//                     {/* Mic, Video, Screen Share & Record buttons (Host/Mods ONLY) */}
//                     {isModerator && (
//                         <div className="absolute top-1.5 right-1.5 flex items-center gap-1.5 z-30 bg-[#111]/80 backdrop-blur-md px-1.5 py-1 rounded-lg border border-white/10">
//                             <button
//                                 type="button"
//                                 onClick={toggleMic}
//                                 className={`w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 ${micOn ? "bg-white/20 text-white" : "bg-red-600 text-white"}`}
//                                 title="Toggle Microphone"
//                             >
//                                 {micOn ? <Mic size={12} /> : <MicOff size={12} />}
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={toggleVid}
//                                 className={`w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 ${vidOn ? "bg-white/20 text-white" : "bg-red-600 text-white"}`}
//                                 title="Toggle Camera"
//                             >
//                                 {vidOn ? <Video size={12} /> : <VideoOff size={12} />}
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={toggleRecording}
//                                 className={`w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 ${
//                                     customRecordingState === 'recording' 
//                                         ? "bg-red-600 text-white animate-pulse" 
//                                         : "bg-white/20 text-white hover:bg-white/30"
//                                 }`}
//                                 title={customRecordingState === 'recording' ? "Stop Recording" : "Start Recording Options"}
//                             >
//                                 <CircleDot size={12} className={customRecordingState === 'recording' ? "text-white" : "text-red-500"} />
//                             </button>
//                         </div>
//                     )}

//                     {/* Premium Glassmorphic Recording Selector Popover */}
//                     {isModerator && showRecordingOptions && customRecordingState === 'idle' && (
//                         <div className="absolute top-[40px] right-1.5 w-[160px] bg-[#111]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-2.5 z-40 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
//                             <div className="flex items-center justify-between text-[9px] text-white/50 font-bold uppercase tracking-wider px-1 pb-1 border-b border-white/5">
//                                 <span>Record Session</span>
//                                 <button 
//                                     onClick={() => setShowRecordingOptions(false)}
//                                     className="text-white/40 hover:text-white transition-colors"
//                                 >
//                                     <X size={10} />
//                                 </button>
//                             </div>
//                             <button
//                                 type="button"
//                                 onClick={() => startCustomRecording('local')}
//                                 className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 active:scale-95 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-md shadow-pink-500/20 group"
//                             >
//                                 <CircleDot size={11} className="text-white animate-pulse" />
//                                 Start Recording
//                             </button>
//                         </div>
//                     )}

//                     {/* Post-Recording Saver Choice Modal */}
//                     {isModerator && showSaveModal && recordedBlob && isMounted && typeof window !== "undefined" && document.body && createPortal(
//                         <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
//                             <div className="bg-[#111] border border-white/10 rounded-2xl p-5 w-full max-w-[240px] shadow-2xl flex flex-col gap-3.5">
//                                 <div className="flex flex-col items-center text-center gap-1">
//                                     <div className="w-10 h-10 rounded-full bg-pink-600/20 flex items-center justify-center text-pink-500 mb-1 animate-bounce">
//                                         <CircleDot size={20} className="animate-pulse" />
//                                     </div>
//                                     <h3 className="text-white text-xs font-black uppercase tracking-wider">Recording Saved!</h3>
//                                     <p className="text-[9px] text-white/60 font-bold uppercase tracking-wider">Duration: {formatDuration(recordingDuration)}</p>
//                                 </div>

//                                 {uploadProgress === null ? (
//                                     <div className="flex flex-col gap-2">
//                                         <button
//                                             type="button"
//                                             onClick={downloadRecordingLocally}
//                                             className="flex items-center justify-center gap-2 w-full py-2 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-pink-500/20"
//                                         >
//                                             <HardDrive size={11} />
//                                             Save Locally
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={uploadRecordingToServer}
//                                             className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-white/10"
//                                         >
//                                             <Cloud size={11} />
//                                             Save to Server
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={() => {
//                                                 setShowSaveModal(false);
//                                                 setRecordedBlob(null);
//                                                 setCustomRecordingState('idle');
//                                             }}
//                                             className="w-full text-center text-[9px] text-white/40 hover:text-white transition-colors mt-1 font-bold uppercase tracking-wider"
//                                         >
//                                             Dismiss
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <div className="flex flex-col gap-2 py-1">
//                                         <div className="flex justify-between items-center text-[9px] font-black text-white/80 uppercase tracking-wider">
//                                             <span>{uploadProgress < 100 ? "Uploading..." : "Success!"}</span>
//                                             <span>{uploadProgress}%</span>
//                                         </div>
//                                         <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
//                                             <div 
//                                                 className="h-full bg-pink-500 rounded-full transition-all duration-300"
//                                                 style={{ width: `${uploadProgress}%` }}
//                                             />
//                                         </div>
//                                         {uploadProgress === 100 && (
//                                             <button
//                                                 type="button"
//                                                 onClick={() => {
//                                                     setShowSaveModal(false);
//                                                     setRecordedBlob(null);
//                                                     setCustomRecordingState('idle');
//                                                     setUploadProgress(null);
//                                                 }}
//                                                 className="w-full py-1.5 bg-green-600 hover:bg-green-500 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all text-center mt-2 shadow-lg shadow-green-500/20"
//                                             >
//                                                 Okay
//                                             </button>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>,
//                         document.body
//                     )}

//                     {/* Host name overlay with SportsFan Logo */}
//                     <div className="absolute bottom-2 left-2 bg-[#111]/80 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-bold text-white border border-white/10 z-[9999] flex items-center gap-1.5">
//                         <img src="/images/Logo.png" alt="SportsFan Logo" className="w-3 h-3.5 shrink-0 object-contain" />
//                         <span>{hostName}</span>
//                     </div>
//                 </div>
//             </div>
            
//             <style jsx>{`
//                 @keyframes scanLine {
//                     0% { transform: translateY(0); }
//                     50% { transform: translateY(160px); }
//                     100% { transform: translateY(0); }
//                 }
//                 .animate-scan-line {
//                     animation: scanLine 4s linear infinite;
//                 }
//             `}</style>
//         </div>
//     );
// }

// const actionTabs: { id: 'prediction' | 'flashQuiz' | 'liveChat' | 'emojiStorm' | 'participants'; label: string }[] = [
//     { id: 'prediction', label: 'Prediction' },
//     { id: 'flashQuiz', label: 'Flash Quiz' },
//     { id: 'liveChat', label: 'Live Chat' },
//     { id: 'emojiStorm', label: 'Emoji Storm' },
//     { id: 'participants', label: 'Participants' }
// ];

// type Props = {
//     room: Room;
//     onBack: () => void;
// };

// function TabContent({
//     activeTab,
//     matchId,
//     userName,
//     userRole,
//     room,
//     jitsiParticipants = [],
//     jitsiApi = null,
//     chats = [],
//     qnaList = [],
//     setQnaList,
//     answeringQuestion,
//     setAnsweringQuestion,
//     qnaInput = "",
//     setQnaInput,
//     sendChatMessage
// }: {
//     activeTab: string;
//     matchId: string | undefined;
//     userName: string | null;
//     userRole: string;
//     room: Room;
//     jitsiParticipants?: any[];
//     jitsiApi?: any;
//     chats?: any[];
//     qnaList?: any[];
//     setQnaList?: any;
//     answeringQuestion?: any;
//     setAnsweringQuestion?: any;
//     qnaInput?: string;
//     setQnaInput?: any;
//     sendChatMessage?: any;
// }) {
//     const { updateRoom } = useWatchAlong();

//     // Don't render if matchId is not available
//     if (!matchId && activeTab !== 'participants' && activeTab !== 'qna') {
//         return (
//             <div className="w-full px-4 sm:px-6 py-3">
//                 <div className="flex items-center justify-center py-12">
//                     <p className="text-gray-500 text-sm">Waiting for match data...</p>
//                 </div>
//             </div>
//         );
//     }

//     switch (activeTab) {
//         case 'prediction': return <Prediction matchId={matchId!} />;
//         case 'polls': return <Polls matchId={matchId!} />;
//         case 'flashQuiz': return <FlashQuiz matchId={matchId!} />;
//         case 'liveChat': return <LiveChat matchId={matchId!} userRole={userRole} />;
//         case 'emojiStorm': return <EmojiStorm matchId={matchId!} />;
//         case 'qna': {
//             const handleAskQ = () => {
//                 if (!qnaInput.trim() || !userName) return;
//                 const newQ = {
//                     id: `q_${Date.now()}`,
//                     user: userName,
//                     text: qnaInput,
//                     answered: false,
//                     timestamp: Date.now()
//                 };
//                 if (setQnaList) {
//                     setQnaList((prev: any) => [...prev, newQ]);
//                 }
//                 if (setQnaInput) {
//                     setQnaInput("");
//                 }
//                 if (sendChatMessage && room?.liveMatchId) {
//                     sendChatMessage(room.liveMatchId, userName, `[QNA_ASK]: ${qnaInput}`, "text-pink-400");
//                 }
//             };

//             const isHost = userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator';

//             return (
//                 <div className="w-full h-full flex flex-col p-4 overflow-y-auto">
//                     <h2 className="text-white font-black text-lg mb-1 flex items-center gap-2">
//                         <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse"></span>
//                         Q&A Forum
//                     </h2>
//                     <p className="text-[11px] text-gray-500 mb-4 font-bold uppercase tracking-wider">
//                         {isHost ? "Answer fan questions live on stream!" : "Ask the expert a question!"}
//                     </p>

//                     {/* Viewer Ask Box */}
//                     {!isHost && (
//                         <div className="flex gap-2 mb-6">
//                             <input
//                                 type="text"
//                                 value={qnaInput}
//                                 onChange={(e) => setQnaInput(e.target.value)}
//                                 placeholder="Ask MS Dhoni something..."
//                                 className="flex-1 bg-[#18181b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-all placeholder:text-gray-600 font-semibold"
//                                 onKeyDown={(e) => { if (e.key === 'Enter') handleAskQ(); }}
//                             />
//                             <button
//                                 onClick={handleAskQ}
//                                 className="bg-pink-600 hover:bg-pink-500 text-white font-black px-5 py-3 text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-pink-500/20"
//                             >
//                                 Ask
//                             </button>
//                         </div>
//                     )}

//                     {/* Questions List */}
//                     <div className="flex flex-col gap-3">
//                         {qnaList.length === 0 ? (
//                             <div className="text-center py-12 text-gray-600 text-sm font-semibold">
//                                 💬 No questions yet. Be the first to ask!
//                             </div>
//                         ) : (
//                             qnaList.map((q) => {
//                                 const isBeingAnswered = answeringQuestion?.text === q.text;
//                                 return (
//                                     <div 
//                                         key={q.id} 
//                                         className={`p-4 rounded-2xl border transition-all ${
//                                             isBeingAnswered 
//                                                 ? 'bg-pink-950/20 border-pink-500/50 shadow-[0_4px_15px_rgba(219,39,119,0.2)]' 
//                                                 : q.answered 
//                                                     ? 'bg-black/40 border-white/5 opacity-50' 
//                                                     : 'bg-[#18181b] border-white/5 hover:border-white/10'
//                                         }`}
//                                     >
//                                         <div className="flex items-center justify-between gap-2 mb-2.5">
//                                             <span className="text-xs font-black text-pink-400">@{q.user}</span>
//                                             {isBeingAnswered ? (
//                                                 <span className="text-[9px] font-black uppercase bg-pink-600 text-white px-2 py-0.5 rounded animate-pulse tracking-wider">Answering Live</span>
//                                             ) : q.answered ? (
//                                                 <span className="text-[9px] font-bold uppercase bg-gray-800 text-gray-400 px-2 py-0.5 rounded tracking-wide">Answered</span>
//                                             ) : (
//                                                 <span className="text-[9px] font-bold uppercase bg-white/5 text-gray-500 px-2 py-0.5 rounded tracking-wide">Pending</span>
//                                             )}
//                                         </div>
//                                         <p className="text-sm text-gray-100 font-extrabold leading-relaxed">{q.text}</p>
                                        
//                                         {/* Host controls */}
//                                         {isHost && (
//                                             <div className="flex gap-2.5 mt-4 pt-3 border-t border-white/5">
//                                                 <button
//                                                     onClick={() => {
//                                                         if (isBeingAnswered) {
//                                                             if (setAnsweringQuestion) setAnsweringQuestion(null);
//                                                             if (sendChatMessage && room?.liveMatchId) {
//                                                                 sendChatMessage(room.liveMatchId, "System", "[SYSTEM_REACTION]:QNA_STOP", "text-gray-500");
//                                                             }
//                                                         } else {
//                                                             if (setAnsweringQuestion) setAnsweringQuestion({ user: q.user, text: q.text });
//                                                             if (sendChatMessage && room?.liveMatchId) {
//                                                                 sendChatMessage(room.liveMatchId, "System", `[SYSTEM_REACTION]:QNA_ANSWER:${q.user}:${q.text}`, "text-gray-500");
//                                                             }
//                                                         }
//                                                     }}
//                                                     className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
//                                                         isBeingAnswered 
//                                                             ? 'bg-gray-700 hover:bg-gray-600 text-white' 
//                                                             : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-500/20'
//                                                     }`}
//                                                 >
//                                                     {isBeingAnswered ? "Stop Answering" : "🎙️ Answer Live"}
//                                                 </button>
//                                                 {!q.answered && (
//                                                     <button
//                                                         onClick={() => {
//                                                             if (setQnaList) {
//                                                                 setQnaList((prev: any) => prev.map((item: any) => item.id === q.id ? { ...item, answered: true } : item));
//                                                             }
//                                                             if (isBeingAnswered && setAnsweringQuestion) {
//                                                                 setAnsweringQuestion(null);
//                                                                 if (sendChatMessage && room?.liveMatchId) {
//                                                                     sendChatMessage(room.liveMatchId, "System", "[SYSTEM_REACTION]:QNA_STOP", "text-gray-500");
//                                                                 }
//                                                             }
//                                                         }}
//                                                         className="px-3 py-1.5 bg-[#202023] hover:bg-[#28282b] text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
//                                                     >
//                                                         Done
//                                                     </button>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>
//                                 );
//                             })
//                         )}
//                     </div>
//                 </div>
//             );
//         }
//         case 'participants': {
//             // Build real participant list:
//             // 1. Jitsi participants (people actually in the video call)
//             // 2. Anyone who has sent a chat message (backend-synced)
//             const chatUsers = Array.from(
//                 new Set(
//                     chats
//                         .filter((m: any) => m.user && m.user !== 'System' && !m.text?.startsWith('[SYSTEM_REACTION]'))
//                         .map((m: any) => m.user as string)
//                 )
//             ).filter((u) => u !== userName); // exclude current user (shown separately)

//             // Merge jitsi names + chat users, deduplicate by display name
//             const jitsiNames = new Set((jitsiParticipants || []).map((p: any) => (p.displayName || p.formattedDisplayName || '').toLowerCase()));
//             const chatOnlyUsers = chatUsers.filter(u => !jitsiNames.has(u.toLowerCase()));

//             const totalCount = 1 + (jitsiParticipants?.length || 0) + chatOnlyUsers.length;

//             return (
//                 <div className="w-full h-full flex flex-col p-4 overflow-y-auto">
//                     <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
//                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//                         Live Participants ({totalCount})
//                     </h2>
//                     <div className="flex flex-col gap-3">
//                         {/* Current User (You) */}
//                         <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-xl border border-pink-500/30">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center font-bold text-white text-xs">
//                                     {userName?.charAt(0).toUpperCase() || 'U'}
//                                 </div>
//                                 <div>
//                                     <p className="text-white text-sm font-bold">{userName} <span className="text-gray-500 font-normal">(You)</span></p>
//                                     <p className="text-xs text-pink-400 uppercase tracking-wide">{userRole}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Real Jitsi Participants (in video call) */}
//                         {jitsiParticipants && jitsiParticipants.map((p: any) => {
//                             const displayName = p.displayName || p.formattedDisplayName || 'Viewer';
//                             const initial = displayName.charAt(0).toUpperCase() || '?';
//                             const isHostUser = displayName.toLowerCase().includes('host') || displayName.toLowerCase() === room?.name?.split(' ')[0]?.toLowerCase();
//                             const role = isHostUser ? 'Host' : 'Viewer';
//                             return (
//                                 <div key={p.id || p.displayName || Math.random()} className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
//                                     <div className="flex items-center gap-3">
//                                         <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xs">
//                                             {initial}
//                                         </div>
//                                         <div>
//                                             <p className="text-white text-sm font-bold">{displayName}</p>
//                                             <p className="text-xs text-blue-400 uppercase tracking-wide">{role}</p>
//                                         </div>
//                                     </div>
//                                     {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
//                                         <button
//                                             onClick={() => { if (jitsiApi) { try { jitsiApi.executeCommand('kickParticipant', p.id); } catch (err) { console.error('Kick failed:', err); } } }}
//                                             className="px-3 py-1 bg-[#222] hover:bg-red-600 text-white text-xs font-semibold rounded-full border border-[#444] transition-all"
//                                         >
//                                             Kick
//                                         </button>
//                                     )}
//                                 </div>
//                             );
//                         })}

//                         {/* Chat-derived participants (joined but not in Jitsi video) */}
//                         {chatOnlyUsers.map((name: string) => (
//                             <div key={name} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
//                                 <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center font-bold text-white text-xs">
//                                     {name.charAt(0).toUpperCase()}
//                                 </div>
//                                 <div>
//                                     <p className="text-white text-sm font-bold">{name}</p>
//                                     <p className="text-xs text-green-400 uppercase tracking-wide">Viewer</p>
//                                 </div>
//                             </div>
//                         ))}

//                         {/* Empty state — only shown if truly alone */}
//                         {jitsiParticipants.length === 0 && chatOnlyUsers.length === 0 && (
//                             <div className="flex flex-col items-center justify-center py-8 text-center">
//                                 <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
//                                     <span className="text-2xl">👥</span>
//                                 </div>
//                                 <p className="text-gray-400 text-sm font-medium">Waiting for others to join...</p>
//                                 <p className="text-gray-600 text-xs mt-1">Share the room link to invite people</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             );
//         }
//         default: return null;
//     }
// }

// export default function WatchRoom({ room, onBack }: Props) {
//     const { 
//         fetchMatchById, 
//         currentMatch, 
//         createPrediction, 
//         createQuizQuestion, 
//         predictions, 
//         quizQuestions,
//         chats,
//         fetchChats,
//         fetchPredictions,
//         fetchQuizQuestions,
//         sendChatMessage
//     } = useWatchAlong();
//     const [liveMatch, setLiveMatch] = useState<Match | null>(null);
//     const [isLoadingMatch, setIsLoadingMatch] = useState(false);
//     const [isMounted, setIsMounted] = useState(false);
//     const [activeTab, setActiveTab] = useState<'prediction' | 'polls' | 'flashQuiz' | 'liveChat' | 'emojiStorm' | 'participants' | 'qna'>('liveChat');
    
//     // Real-time Jitsi states
//     const [jitsiParticipants, setJitsiParticipants] = useState<any[]>([]);
//     const jitsiApiRef = useRef<any>(null);

//     // Creation Modals Visibility
//     const [showPredictionModal, setShowPredictionModal] = useState(false);
//     const [showPollModal, setShowPollModal] = useState(false);
//     const [showQuizModal, setShowQuizModal] = useState(false);
//     const [showPinModal, setShowPinModal] = useState(false);

//     // Pinned Message state
//     const [pinnedMessage, setPinnedMessage] = useState<string | null>("Welcome to the Live Watchroom! Stay tuned for host polls and flash quizzes.");

//     // Creation Inputs
//     const [predQ, setPredQ] = useState("");
//     const [predA, setPredA] = useState("");
//     const [predB, setPredB] = useState("");

//     const [pollQ, setPollQ] = useState("");
//     const [pollA, setPollA] = useState("");
//     const [pollB, setPollB] = useState("");
//     const [pollC, setPollC] = useState("");
//     const [pollD, setPollD] = useState("");

//     const [quizQ, setQuizQ] = useState("");
//     const [quizA, setQuizA] = useState("");
//     const [quizB, setQuizB] = useState("");
//     const [quizC, setQuizC] = useState("");
//     const [quizD, setQuizD] = useState("");
//     const [quizAns, setQuizAns] = useState("A");
//     const [quizTime, setQuizTime] = useState(15);
//     const [quizPts, setQuizPts] = useState(100);

//     const [pinText, setPinText] = useState("");
//     const [submittingModal, setSubmittingModal] = useState(false);

//     const { data: session, status } = useSession();
//     const { user: authUser } = useAuth();
    
//     // Auth and Roles
//     const [userName, setUserName] = useState<string | null>(null);
//     const [userRole, setUserRole] = useState<string>("Viewer");

//     // New Expert/Sportscaster Experience States
//     const [activeInterview, setActiveInterview] = useState<string | null>(null);
//     const [activeDataDrop, setActiveDataDrop] = useState<string | null>(null);
//     const [activeTacticalDrop, setActiveTacticalDrop] = useState<{ title: string; text: string } | null>(null);
//     const [activeQnaSession, setActiveQnaSession] = useState<boolean>(true); // Active by default for the demo
//     const [qnaList, setQnaList] = useState<Array<{ id: string; user: string; text: string; answered: boolean; timestamp: number }>>([
//         { id: "q1", user: "Rohan K", text: "Do you think Rohit should bowl spinner from this end?", answered: false, timestamp: Date.now() - 30000 },
//         { id: "q2", user: "Tushar S", text: "Virat's strike rate vs Bumrah seems low. Is he playing safe?", answered: false, timestamp: Date.now() - 15000 },
//         { id: "q3", user: "Ananya M", text: "Strategic timeout: Will they aim for 180 or 200+ here?", answered: false, timestamp: Date.now() - 5000 }
//     ]);
//     const [answeringQuestion, setAnsweringQuestion] = useState<{ user: string; text: string } | null>(null);
    
//     // Menu toggles
//     const [showPredictTemplates, setShowPredictTemplates] = useState(false);
//     const [showDropsMenu, setShowDropsMenu] = useState(false);
//     const [showInterviewMenu, setShowInterviewMenu] = useState(false);
//     const [showTacticalModal, setShowTacticalModal] = useState(false);
//     const [tacticalTitle, setTacticalTitle] = useState("Analyze Captain's Move");
//     const [tacticalText, setTacticalText] = useState("");
//     const [qnaInput, setQnaInput] = useState("");

//     // Confetti State
//     const [confettiTrigger, setConfettiTrigger] = useState(0);
//     const [confettiText, setConfettiText] = useState("");

//     // Floating emoji overlays for smaller reactions (Fire, Clap, Heart)
//     const [floatingReactions, setFloatingReactions] = useState<{id: number; emoji: string; x: number}[]>([]);
//     const floatCounter = useRef(0);

//     // Telestrator states
//     const [isTelestratorActive, setIsTelestratorActive] = useState(false);
//     const [telestratorStrokes, setTelestratorStrokes] = useState<Stroke[]>([]);

//     const spawnFloatingEmoji = (emoji: string) => {
//         const id = ++floatCounter.current;
//         const x = 20 + Math.random() * 60;
//         setFloatingReactions(prev => [...prev, { id, emoji, x }]);
//         setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2500);
//     };

//     // Timed, full-screen collective reaction event (Emoji Storm)
//     const [stormState, setStormState] = useState<'idle' | 'countdown' | 'active' | 'summary'>('idle');
//     const [stormDuration, setStormDuration] = useState<number>(6); // Default 6 seconds
//     const [stormTimeLeft, setStormTimeLeft] = useState<number>(6);
//     const [stormCountdownVal, setStormCountdownVal] = useState<number>(3);
//     const [stormFloating, setStormFloating] = useState<{ id: number; emoji: string; x: number; rot: number; speed: number; scale: number; opacity: number }[]>([]);
//     const [stormLocalTaps, setStormLocalTaps] = useState<number>(0);
//     const [stormTotalTaps, setStormTotalTaps] = useState<number>(0);
//     const [stormLeaderboard, setStormLeaderboard] = useState<{ name: string; count: number }[]>([]);
//     const [showEmojiStormHostModal, setShowEmojiStormHostModal] = useState(false);

//     const stormStateRef = useRef(stormState);
//     useEffect(() => {
//         stormStateRef.current = stormState;
//     }, [stormState]);

//     // Countdown timer effect
//     useEffect(() => {
//         if (stormState !== 'countdown') return;

//         setStormCountdownVal(3);
//         const timer = setInterval(() => {
//             setStormCountdownVal(prev => {
//                 if (prev <= 1) {
//                     clearInterval(timer);
//                     setStormState('active');
//                     setStormTimeLeft(stormDuration);
//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);

//         return () => clearInterval(timer);
//     }, [stormState, stormDuration]);

//     // Active storm timer effect
//     useEffect(() => {
//         if (stormState !== 'active') return;

//         const timer = setInterval(() => {
//             setStormTimeLeft(prev => {
//                 if (prev <= 1) {
//                     clearInterval(timer);
//                     setStormState('summary');
//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);

//         return () => clearInterval(timer);
//     }, [stormState]);

//     // Simulated background emojis during active storm
//     useEffect(() => {
//         if (stormState !== 'active') return;

//         const emojis = ["🔥", "💪", "😱", "🏏", "👏", "🎉", "❤️", "🚀"];
//         const interval = setInterval(() => {
//             const count = 1 + Math.floor(Math.random() * 3);
//             for (let i = 0; i < count; i++) {
//                 const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
//                 const id = Math.random() + Date.now();
//                 const x = 5 + Math.random() * 90;
//                 const rot = -30 + Math.random() * 60;
//                 const speed = 1.5 + Math.random() * 2;
//                 const scale = 0.8 + Math.random() * 0.6;
//                 const opacity = 0.6 + Math.random() * 0.4;
                
//                 setStormFloating(prev => [...prev, { id, emoji: randomEmoji, x, rot, speed, scale, opacity }]);
//                 setTimeout(() => {
//                     setStormFloating(prev => prev.filter(f => f.id !== id));
//                 }, 3000);
//             }
//             setStormTotalTaps(prev => prev + count);
//         }, 250);

//         return () => clearInterval(interval);
//     }, [stormState]);

//     // Summary screen effect (leaderboard)
//     useEffect(() => {
//         if (stormState !== 'summary') return;

//         // Generate leaderboard based on local taps and participant info
//         const list = [
//             { name: userName || "You", count: stormLocalTaps },
//             { name: jitsiParticipants[0]?.displayName || "Chandu", count: Math.floor(stormLocalTaps * 0.7) + 5 },
//             { name: jitsiParticipants[1]?.displayName || "Rohan", count: Math.floor(stormLocalTaps * 0.5) + 3 }
//         ].sort((a, b) => b.count - a.count);

//         list.forEach((item, index) => {
//             if (item.count === 0) {
//                 item.count = [42, 28, 15][index];
//             }
//         });

//         setStormLeaderboard(list);

//         const timer = setTimeout(() => {
//             setStormState('idle');
//             setStormFloating([]);
//             setStormLocalTaps(0);
//             setStormTotalTaps(0);
//         }, 5000);

//         return () => clearTimeout(timer);
//     }, [stormState, stormLocalTaps, jitsiParticipants, userName]);

//     const handleStormTap = (emoji: string) => {
//         setStormLocalTaps(prev => prev + 1);
        
//         // Spawn emoji locally
//         const id = Math.random() + Date.now();
//         const x = 10 + Math.random() * 80;
//         const rot = -20 + Math.random() * 40;
//         const speed = 2 + Math.random() * 1.5;
//         const scale = 1.2 + Math.random() * 0.4;
//         const opacity = 1;
        
//         setStormFloating(prev => [...prev, { id, emoji, x, rot, speed, scale, opacity }]);
//         setTimeout(() => {
//             setStormFloating(prev => prev.filter(f => f.id !== id));
//         }, 3000);

//         // Broadcast to other participants
//         if (jitsiApiRef.current) {
//             try {
//                 jitsiApiRef.current.executeCommand('sendEndpointTextMessage', '', `REACTION:STORM_TAP:${emoji}`);
//             } catch (err) {
//                 console.error("Failed to broadcast storm tap:", err);
//             }
//         }
//     };

//     const startEmojiStorm = (duration: number) => {
//         setShowEmojiStormHostModal(false);
//         triggerMoment(`STORM_START:${duration}`, true);
//     };

//     // Big moments that deserve full confetti — smaller reactions show floating emoji
//     const CONFETTI_MOMENTS = new Set(['WICKET', 'SIX', 'GOAL', 'FOUR']);
//     // Emoji map for float-up reactions
//     const FLOAT_EMOJI_MAP: Record<string, string> = { FIRE: '🔥', CLAP: '👏', HEART: '❤️' };
//     const EMOJI_OPTIONS = ["🔥", "👏", "❤️"];

//     const triggerMoment = (momentType: string, broadcast = true) => {
//         if (momentType.startsWith("STORM_START:")) {
//             const duration = parseInt(momentType.replace("STORM_START:", "")) || 10;
//             setStormDuration(duration);
//             setStormState('countdown');
//         } else if (momentType.startsWith("STORM_TAP:")) {
//             const emoji = momentType.replace("STORM_TAP:", "");
//             if (stormStateRef.current === 'active') {
//                 const id = Math.random() + Date.now();
//                 const x = 5 + Math.random() * 90;
//                 const rot = -30 + Math.random() * 60;
//                 const speed = 1.6 + Math.random() * 1.8;
//                 const scale = 0.9 + Math.random() * 0.5;
//                 const opacity = 0.8;
//                 setStormFloating(prev => [...prev, { id, emoji, x, rot, speed, scale, opacity }]);
//                 setTimeout(() => {
//                     setStormFloating(prev => prev.filter(f => f.id !== id));
//                 }, 3000);
//                 setStormTotalTaps(prev => prev + 1);
//             }
//         } else if (momentType.startsWith("QNA_ANSWER:")) {
//             const parts = momentType.replace("QNA_ANSWER:", "").split(":");
//             const user = parts[0];
//             const text = parts.slice(1).join(":");
//             setAnsweringQuestion({ user, text });
//         } else if (momentType === "QNA_STOP") {
//             setAnsweringQuestion(null);
//         } else if (momentType.startsWith("TACTICAL_DROP:")) {
//             const parts = momentType.replace("TACTICAL_DROP:", "").split(":");
//             const title = parts[0];
//             const text = parts.slice(1).join(":");
//             setActiveTacticalDrop({ title, text });
//         } else if (momentType === "TACTICAL_CLEAR") {
//             setActiveTacticalDrop(null);
//         } else if (momentType.startsWith("INTERVIEW_START:")) {
//             const guest = momentType.replace("INTERVIEW_START:", "");
//             setActiveInterview(guest);
//         } else if (momentType === "INTERVIEW_STOP") {
//             setActiveInterview(null);
//         } else if (momentType.startsWith("DATA_DROP:")) {
//             const drop = momentType.replace("DATA_DROP:", "");
//             setActiveDataDrop(drop);
//         } else if (momentType === "DATA_CLEAR") {
//             setActiveDataDrop(null);
//         } else if (momentType.startsWith("TEL_DRAW:")) {
//             try {
//                 const stroke = JSON.parse(momentType.replace("TEL_DRAW:", ""));
//                 setTelestratorStrokes(prev => [...prev, stroke]);
//             } catch (err) {
//                 console.error("Failed to parse telestrator draw stroke:", err);
//             }
//         } else if (momentType === "TEL_UNDO") {
//             setTelestratorStrokes(prev => prev.slice(0, -1));
//         } else if (momentType === "TEL_CLEAR") {
//             setTelestratorStrokes([]);
//         } else if (momentType.startsWith("TEL_TOGGLE:")) {
//             const active = momentType.replace("TEL_TOGGLE:", "") === "true";
//             setIsTelestratorActive(active);
//             if (!active) setTelestratorStrokes([]);
//         } else if (CONFETTI_MOMENTS.has(momentType)) {
//             setConfettiText(momentType);
//             setConfettiTrigger(prev => prev + 1);
//         } else if (FLOAT_EMOJI_MAP[momentType]) {
//             spawnFloatingEmoji(FLOAT_EMOJI_MAP[momentType]);
//         }
//         if (broadcast) {
//             // 1. Send via Jitsi WebRTC endpoint messages for participants who are fully connected
//             if (jitsiApiRef.current) {
//                 try {
//                     jitsiApiRef.current.executeCommand('sendEndpointTextMessage', '', `REACTION:${momentType}`);
//                     const participants = jitsiApiRef.current.getParticipantsInfo() || [];
//                     participants.forEach((p: any) => {
//                         if (p.id) {
//                             jitsiApiRef.current.executeCommand('sendEndpointTextMessage', p.id, `REACTION:${momentType}`);
//                         }
//                     });
//                 } catch (err) {
//                     console.error("Failed to broadcast reaction via Jitsi:", err);
//                 }
//             }
            
//             // 2. Send as a robust backend-synced system reaction message so all spectators see it instantly
//             if (room?.liveMatchId) {
//                 try {
//                     sendChatMessage(room.liveMatchId, "System", `[SYSTEM_REACTION]:${momentType}`, "text-gray-500");
//                 } catch (err) {
//                     console.error("Failed to send system reaction chat message:", err);
//                 }
//             }
//         }
//     };

//     const handleCreatePrediction = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!predQ || !predA || !predB) return;
//         setSubmittingModal(true);
//         try {
//             await createPrediction(room.liveMatchId, {
//                 question: predQ,
//                 options: [predA, predB],
//                 closesAt: Date.now() + 120000 // 2 minutes
//             });
//             setShowPredictionModal(false);
//             setPredQ("");
//             setPredA("");
//             setPredB("");
//             setActiveTab("prediction");
//         } catch (error) {
//             console.error("Create prediction error:", error);
//         } finally {
//             setSubmittingModal(false);
//         }
//     };

//     const handleQuickPrediction = async (question: string, options: string[]) => {
//         try {
//             await createPrediction(room.liveMatchId, {
//                 question,
//                 options: options.filter(Boolean),
//                 closesAt: Date.now() + 300000 // 5 minutes closesAt timer
//             });
//             if (sendChatMessage && room?.liveMatchId) {
//                 sendChatMessage(room.liveMatchId, "System", `🔮 Prediction live: "${question}"! Tap the Predictions tab to answer.`, "text-pink-400 font-extrabold");
//             }
//             triggerMoment("FIRE"); // Fire flurry!
//             setActiveTab("prediction");
//             setShowPredictTemplates(false);
//         } catch (err) {
//             console.error("Quick prediction failed:", err);
//         }
//     };

//     const handleCreatePoll = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!pollQ || !pollA || !pollB) return;
//         setSubmittingModal(true);
//         try {
//             await createPrediction(room.liveMatchId, {
//                 question: `[Poll] ${pollQ}`,
//                 options: [pollA, pollB, ...(pollC ? [pollC] : []), ...(pollD ? [pollD] : [])],
//                 closesAt: Date.now() + 180000 // 3 minutes
//             });
//             setShowPollModal(false);
//             setPollQ("");
//             setPollA("");
//             setPollB("");
//             setPollC("");
//             setPollD("");
//             setActiveTab("polls");
//         } catch (error) {
//             console.error("Create poll error:", error);
//         } finally {
//             setSubmittingModal(false);
//         }
//     };

//     const handleCreateQuiz = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!quizQ || !quizA || !quizB || !quizC || !quizD) return;
//         setSubmittingModal(true);
//         let correctText = quizA;
//         if (quizAns === "B") correctText = quizB;
//         else if (quizAns === "C") correctText = quizC;
//         else if (quizAns === "D") correctText = quizD;

//         try {
//             await createQuizQuestion(room.liveMatchId, {
//                 question: quizQ,
//                 options: [quizA, quizB, quizC, quizD],
//                 correctAnswer: correctText,
//                 timerSeconds: quizTime,
//                 points: quizPts
//             });
//             setShowQuizModal(false);
//             setQuizQ("");
//             setQuizA("");
//             setQuizB("");
//             setQuizC("");
//             setQuizD("");
//             setQuizAns("A");
//             setQuizTime(15);
//             setQuizPts(100);
//             setActiveTab("flashQuiz");
//         } catch (error) {
//             console.error("Create quiz error:", error);
//         } finally {
//             setSubmittingModal(false);
//         }
//     };

//     const handlePinMessage = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!pinText) return;
//         setPinnedMessage(pinText);
//         setShowPinModal(false);
//         setPinText("");
//     };

//     const handleShare = () => {
//         if (typeof window !== "undefined") {
//             navigator.clipboard.writeText(window.location.href);
//             triggerMoment("LINK COPIED");
//             alert("Link Copied Successfully!")
//         }
//     };

//     const handleEmojiStorm = () => {
//         startEmojiStorm(6);
//     };

//     // Scroll to top on mount to prevent Jitsi iframe autofocus from jumping page
//     useEffect(() => {
//         if (typeof window === "undefined") return;
//         // Just scroll to top once on mount — do NOT lock or intercept further scrolls
//         window.scrollTo(0, 0);
//     }, []);

//     // Parent-level polling for chats, predictions, and quiz questions to sync spectator tabs in real-time
//     useEffect(() => {
//         if (!room?.liveMatchId) return;

//         // Fetch immediately on mount
//         fetchChats(room.liveMatchId, 100);
//         fetchPredictions(room.liveMatchId, false);
//         fetchQuizQuestions(room.liveMatchId, false);

//         const interval = setInterval(() => {
//             fetchChats(room.liveMatchId, 100);
//             fetchPredictions(room.liveMatchId, false);
//             fetchQuizQuestions(room.liveMatchId, false);
//         }, 5000);

//         return () => clearInterval(interval);
//     }, [room?.liveMatchId, fetchChats, fetchPredictions, fetchQuizQuestions]);

//     // System-wide reactions sync via hidden chat events
//     const processedChatReactions = useRef<Set<string>>(new Set());
//     const mountTime = useRef<number>(Date.now());

//     useEffect(() => {
//         if (!chats || chats.length === 0) return;

//         // For subsequent updates, check for any new system reactions
//         chats.forEach((msg: any) => {
//             if (msg.text?.startsWith('[SYSTEM_REACTION]:') && !processedChatReactions.current.has(msg.id)) {
//                 processedChatReactions.current.add(msg.id);
//                 // Only trigger if reaction was created after mount (with a 2-second buffer for clock skew)
//                 if (msg.createdAt >= mountTime.current - 2000) {
//                     const reactionType = msg.text.replace('[SYSTEM_REACTION]:', '');
//                     // Play reaction animation locally without re-broadcasting
//                     triggerMoment(reactionType, false);
//                 }
//             }
//         });
//     }, [chats]);

//     // No body overflow lock — let the page scroll naturally.
//     // The watchroom uses flex layout so internal panels handle their own scroll.

//     useEffect(() => {
//         setIsMounted(true);
        
//         const isUserLoggedIn = status === "authenticated" || !!authUser;
//         const actualName = authUser?.name || session?.user?.name;

//         if (isUserLoggedIn && actualName) {
//             setUserName(actualName);
            
//             // ROLE LOGIC — Priority order:
//             // 1. Real backend: check if session user ID matches room.hostUserId or coHostUserId
//             // 2. Fallback: static demo room IDs
//             const currentUserId = authUser?.userId || (session?.user as { userId?: string })?.userId || session?.user?.id;
//             if (room.hostUserId && currentUserId) {
//                 if (currentUserId === room.hostUserId) {
//                     setUserRole("Host");
//                 } else if (room.coHostUserId && currentUserId === room.coHostUserId) {
//                     setUserRole("Co-Host");
//                 } else {
//                     setUserRole("Viewer");
//                 }
//             } else {
//                 const matchName = room.name ? room.name.split(" ")[0].toLowerCase() : "";
//                 setUserRole((matchName && actualName.toLowerCase() === matchName) ? "Host" : "Viewer");
//             }

//             // Global Points System: Award points on join
//             console.log(`[Global Points System] 🏆 50 points awarded to ${actualName} for joining!`);
//         } else {
//             // Guest/Viewer fallback so they actually join the Jitsi room and show up in participants list
//             const stored = typeof window !== "undefined" ? localStorage.getItem("watchalong_user_name") : null;
//             const guestName = stored || `Viewer_${Math.floor(100 + Math.random() * 900)}`;
//             if (typeof window !== "undefined" && !stored) {
//                 localStorage.setItem("watchalong_user_name", guestName);
//             }
//             setUserName(guestName);
//             setUserRole("Viewer");
//         }

//         // Demo Role Override
//         const demoRoleOverride = typeof window !== 'undefined' ? sessionStorage.getItem("demo_user_role") : null;
//         if (demoRoleOverride) {
//             setUserRole(demoRoleOverride);
//         }
//     }, [status, session, authUser, room.id, room.hostUserId, room.coHostUserId, room.name]);

//     // Evaluate Role based on Room Data
//     useEffect(() => {
//         if (!room.hostUserId && userName && room?.name) {
//             // Placeholder Logic: If their name matches the room name, they are the Host
//             // In a real DB, you'd check if `userId === room.hostId`
//             const hostFirstName = room.name ? room.name.split(" ")[0].toLowerCase() : "";
//             if (hostFirstName && userName.toLowerCase().includes(hostFirstName)) {
//                 setUserRole("Host");
//             }
//         }

//         // Demo Role Override
//         const demoRoleOverride = typeof window !== 'undefined' ? sessionStorage.getItem("demo_user_role") : null;
//         if (demoRoleOverride) {
//             setUserRole(demoRoleOverride);
//         }
//     }, [userName, room?.name, room.hostUserId]);


//     // Fetch match details when room has liveMatchId
//     useEffect(() => {
//         const loadMatch = async () => {
//             if (room?.liveMatchId && !liveMatch) {
//                 setIsLoadingMatch(true);
//                 try {
//                     await fetchMatchById(room.liveMatchId);
//                 } catch (error) {
//                     console.error("Failed to fetch match:", error);
//                 } finally {
//                     setIsLoadingMatch(false);
//                 }
//             }
//         };

//         loadMatch();
//     }, [room?.liveMatchId, fetchMatchById, liveMatch]);

//     // Update local match state when currentMatch changes
//     useEffect(() => {
//         if (currentMatch?.id === room?.liveMatchId) {
//             setLiveMatch(currentMatch);
//         }
//     }, [currentMatch, room?.liveMatchId]);

//     // Get user initials for avatar
//     const getUserInitials = (name: string) => {
//         if (!name) return "??";
//         return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
//     };

//     // Format overs display
//     const formatOvers = (overs: string) => {
//         if (!overs) return "0.0 ov";
//         return overs;
//     };

//     // Access Denied logic has been moved to PreJoinLobby.tsx

//     // Tab calculations
//     const activePredictionsCount = predictions?.filter(p => p.isOpen && !p.question.startsWith("[Poll] ")).length || 0;
//     const activePollsCount = predictions?.filter(p => p.isOpen && p.question.startsWith("[Poll] ")).length || 0;
//     const activeQuizCount = quizQuestions?.filter(q => q.isActive).length || 0;

//     const totalPredictionsCount = predictions?.filter(p => !p.question.startsWith("[Poll] ")).length || 0;
//     const totalPollsCount = predictions?.filter(p => p.question.startsWith("[Poll] ")).length || 0;
//     const totalQuizCount = quizQuestions?.length || 0;

//     const sidebarTabs = [
//         { id: 'liveChat', label: 'Live Chat' },
//         // Only show these tabs when the host has actually created content
//         ...(totalPredictionsCount > 0 ? [{ id: 'prediction', label: activePredictionsCount > 0 ? `Prediction (${activePredictionsCount})` : 'Prediction' }] : []),
//         ...(totalPollsCount > 0 ? [{ id: 'polls', label: activePollsCount > 0 ? `Polls (${activePollsCount})` : 'Polls' }] : []),
//         ...(totalQuizCount > 0 ? [{ id: 'flashQuiz', label: activeQuizCount > 0 ? `Quiz (${activeQuizCount})` : 'Quiz' }] : []),
//         ...(activeQnaSession ? [{ id: 'qna', label: 'Q&A' }] : []),
//         { id: 'participants', label: 'Participants' }
//     ];

//     // Tab safety: fallback if activeTab is not in sidebarTabs list (e.g. if deleted or hidden)
//     useEffect(() => {
//         const isTabAvailable = sidebarTabs.some(tab => tab.id === activeTab);
//         if (!isTabAvailable) {
//             setActiveTab('liveChat');
//         }
//     }, [predictions, quizQuestions, activeTab]);

//     // Show loading state while room is being loaded
//     if (!room) {
//         return (
//             <div className="min-h-screen bg-[#111] flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="h-screen bg-[#111] text-white font-sans flex flex-col overflow-auto lg:overflow-hidden">
//             <ConfettiWrapper trigger={confettiTrigger} text={confettiText} />

//             {/* Floating emoji overlay for small reactions */}
//             <div className="fixed inset-0 pointer-events-none z-[90]">
//                 {floatingReactions.map(r => (
//                     <span
//                         key={r.id}
//                         className="absolute text-4xl animate-float-up select-none"
//                         style={{ left: `${r.x}%`, bottom: '30%' }}
//                     >
//                         {r.emoji}
//                     </span>
//                 ))}
//             </div>
//             <style>{`
//                 @keyframes float-up {
//                     0%   { transform: translateY(0) scale(1); opacity: 1; }
//                     80%  { transform: translateY(-180px) scale(1.3); opacity: 0.8; }
//                     100% { transform: translateY(-220px) scale(0.8); opacity: 0; }
//                 }
//                 .animate-float-up { animation: float-up 2.5s ease-out forwards; }

//                 @keyframes storm-float {
//                     0% {
//                         transform: translateY(100vh) rotate(0deg) scale(0.6);
//                         opacity: 0;
//                     }
//                     10% {
//                         opacity: 1;
//                     }
//                     90% {
//                         opacity: 1;
//                     }
//                     100% {
//                         transform: translateY(-20vh) rotate(var(--rot)) scale(var(--scale));
//                         opacity: 0;
//                     }
//                 }
//                 .animate-storm-float {
//                     animation: storm-float 3s linear forwards;
//                 }

//                 @keyframes pulse-countdown {
//                     0% { transform: scale(0.6); opacity: 0; }
//                     50% { transform: scale(1.3); opacity: 1; }
//                     100% { transform: scale(1); opacity: 0; }
//                 }
//                 .animate-pulse-countdown {
//                     animation: pulse-countdown 1s ease-in-out infinite;
//                 }
//             `}</style>

//             {/* ── Shared header ── */}
//             <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b border-[#222]">
//                 <Link href="/MainModules/WatchAlong">
//                     <button
//                         className="text-white hover:text-pink-500 transition cursor-pointer"
//                     >
//                         <ArrowLeft size={20} />
//                     </button>
//                 </Link>
//                 <div className="flex items-center gap-2">
//                     {room.isLive && (
//                         <span className="bg-pink-600 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
//                             <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
//                             LIVE
//                         </span>
//                     )}
//                     <span className="text-sm font-bold">{room.name || "Watch Room"}</span>
//                 </div>
//                 <button className="text-gray-400 hover:text-white text-lg transition-colors">⊕</button>
//             </div>

//             {/* ── Score bar ── */}
//             <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 border-b border-[#222]">
//                 {isLoadingMatch ? (
//                     <>
//                         <span className="text-sm text-gray-400">Loading match...</span>
//                         <span className="text-[11px] text-gray-500">-</span>
//                         <span className="text-[11px] text-gray-500">-</span>
//                         <span className="text-sm text-gray-400">...</span>
//                     </>
//                 ) : liveMatch ? (
//                     <>
//                         <span className="text-sm font-bold text-pink-500">
//                             {liveMatch.team1?.name || "TBD"}&nbsp;{liveMatch.team1?.score || "0/0"}
//                         </span>
//                         <span className="text-[11px] text-gray-500">
//                             {formatOvers(liveMatch.team1?.overs)}
//                         </span>
//                         <span className="text-[11px] text-gray-500">
//                             {formatOvers(liveMatch.team2?.overs)}
//                         </span>
//                         <span className="text-sm font-bold text-blue-500">
//                             {liveMatch.team2?.score || "0/0"}&nbsp;{liveMatch.team2?.name || "TBD"}
//                         </span>
//                     </>
//                 ) : (
//                     <>
//                         <span className="text-sm font-bold text-pink-500">Waiting for match data...</span>
//                         <span className="text-[11px] text-gray-500">-</span>
//                         <span className="text-[11px] text-gray-500">-</span>
//                         <span className="text-sm font-bold text-blue-400">...</span>
//                     </>
//                 )}
//             </div>

//             {/* ── Top Host CTA Panel ── */}
//             {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
//                 <div className="bg-[#161618] border-b border-[#222] px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide z-30 pointer-events-auto">
                    
//                     {/* Create Prediction Button */}
//                     <button 
//                         onClick={() => setShowPredictionModal(true)}
//                         className="flex-shrink-0 flex items-center gap-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_12px_rgba(239,68,68,0.25)]"
//                     >
//                         <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
//                             <Plus size={18} />
//                         </div>
//                         <div className="text-left">
//                             <p className="text-xs font-black tracking-wide uppercase">Create Prediction</p>
//                             <p className="text-[10px] text-white/80 font-medium">Predict & compete</p>
//                         </div>
//                     </button>

//                     {/* Create Poll Button */}
//                     <button 
//                         onClick={() => setShowPollModal(true)}
//                         className="flex-shrink-0 flex items-center gap-3 bg-[#202023] hover:bg-[#28282b] border border-white/5 rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
//                     >
//                         <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/20">
//                             <BarChart3 size={16} />
//                         </div>
//                         <div className="text-left">
//                             <p className="text-xs font-black tracking-wide uppercase text-white">Create Poll</p>
//                             <p className="text-[10px] text-gray-400 font-medium">Vote & see results</p>
//                         </div>
//                     </button>

//                     {/* Flash Quiz Button */}
//                     <button 
//                         onClick={() => setShowQuizModal(true)}
//                         className="flex-shrink-0 flex items-center gap-3 bg-[#202023] hover:bg-[#28282b] border border-white/5 rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
//                     >
//                         <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-lg border border-pink-500/20">
//                             <Brain size={16} />
//                         </div>
//                         <div className="text-left">
//                             <p className="text-xs font-black tracking-wide uppercase text-white">Flash Quiz</p>
//                             <p className="text-[10px] text-gray-400 font-medium">Test your knowledge</p>
//                         </div>
//                     </button>

//                     {/* Predict With Me Templates Button */}
//                     <button 
//                         onClick={() => {
//                             setShowPredictTemplates(true);
//                             setShowDropsMenu(false);
//                             setShowInterviewMenu(false);
//                         }}
//                         className="flex-shrink-0 flex items-center gap-3 bg-[#202023] hover:bg-[#28282b] border border-white/5 rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
//                     >
//                         <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-lg border border-orange-500/20">
//                             🎯
//                         </div>
//                         <div className="text-left">
//                             <p className="text-xs font-black tracking-wide uppercase text-white">Predict Templates</p>
//                             <p className="text-[10px] text-gray-400 font-medium">Fan predictions</p>
//                         </div>
//                     </button>



//                     {/* Chalkboard Analysis Button */}
//                     <button 
//                         onClick={() => {
//                             setShowTacticalModal(true);
//                             setShowDropsMenu(false);
//                             setShowInterviewMenu(false);
//                             setShowPredictTemplates(false);
//                         }}
//                         className="flex-shrink-0 flex items-center gap-3 bg-[#202023] hover:bg-[#28282b] border border-white/5 rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
//                     >
//                         <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/20">
//                             🧠
//                         </div>
//                         <div className="text-left">
//                             <p className="text-xs font-black tracking-wide uppercase text-white">Chalkboard</p>
//                             <p className="text-[10px] text-gray-400 font-medium">Match strategic analysis</p>
//                         </div>
//                     </button>

//                     {/* Emoji Storm Button */}
//                     <button 
//                         onClick={handleEmojiStorm}
//                         className="flex-shrink-0 flex items-center gap-3 bg-[#202023] hover:bg-[#28282b] border border-white/5 rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
//                     >
//                         <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-lg border border-orange-500/20">
//                             <Zap size={16} />
//                         </div>
//                         <div className="text-left">
//                             <p className="text-xs font-black tracking-wide uppercase text-white">Emoji Storm</p>
//                             <p className="text-[10px] text-gray-400 font-medium">Trigger 6s Storm</p>
//                         </div>
//                     </button>

//                     {/* Pin Message Button */}
//                     <button 
//                         onClick={() => setShowPinModal(true)}
//                         className="flex-shrink-0 flex items-center gap-3 bg-[#202023] hover:bg-[#28282b] border border-white/5 rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
//                     >
//                         <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-lg border border-red-500/20">
//                             <Pin size={16} />
//                         </div>
//                         <div className="text-left">
//                             <p className="text-xs font-black tracking-wide uppercase text-white">Pin Message</p>
//                             <p className="text-[10px] text-gray-400 font-medium">Highlight your message</p>
//                         </div>
//                     </button>

//                     {/* Share Button */}
//                     <button 
//                         onClick={handleShare}
//                         className="flex-shrink-0 flex items-center gap-3 bg-[#202023] hover:bg-[#28282b] border border-white/5 rounded-xl px-4 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
//                     >
//                         <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/20">
//                             <Share2 size={16} />
//                         </div>
//                         <div className="text-left">
//                             <p className="text-xs font-black tracking-wide uppercase text-white">Share</p>
//                             <p className="text-[10px] text-gray-400 font-medium">Invite & share</p>
//                         </div>
//                     </button>

//                 </div>
//             )}

//             <div className="flex flex-col lg:flex-row flex-1 min-h-0">

//                 {/* ── LEFT: video + action tabs ── */}
//                 <div className="flex flex-col lg:flex-1 lg:min-w-0 overflow-y-auto">

//                     {/* Video player */}
//                     <div className="relative w-full aspect-video bg-[#1a0a14] overflow-hidden">
//                         {liveMatch?.videoUrl ? (
//                             <>
//                                 <VideoPlayer
//                                     key={liveMatch.videoUrl}
//                                     videoUrl={liveMatch.videoUrl}
//                                     isLive={liveMatch.isLive}
//                                 />
//                                 {/* Q&A Spotlight Banner */}
//                                 {answeringQuestion && (
//                                     <div className="absolute top-4 left-4 right-4 bg-gradient-to-r from-pink-600/90 to-rose-600/90 backdrop-blur-md border border-pink-400/40 rounded-2xl p-4 z-30 shadow-[0_10px_35px_rgba(219,39,119,0.45)] animate-in slide-in-from-top duration-300">
//                                         <div className="flex items-center gap-2 mb-2">
//                                             <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
//                                             <span className="text-[10px] font-black uppercase tracking-wider text-pink-100 bg-white/20 px-2 py-0.5 rounded">🎙️ answering live</span>
//                                         </div>
//                                         <p className="text-xs text-white/80 font-black">@{answeringQuestion.user} asks:</p>
//                                         <p className="text-sm font-black text-white mt-1 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
//                                             &ldquo;{answeringQuestion.text}&rdquo;
//                                         </p>
//                                     </div>
//                                 )}
//                                 {/* Tactical Chalkboard Overlay */}
//                                 {activeTacticalDrop && (
//                                     <div className="absolute inset-x-4 bottom-4 bg-[#0a0f18]/95 border border-blue-500/40 rounded-2xl p-4 z-30 shadow-[0_12px_40px_rgba(59,130,246,0.3)] animate-in slide-in-from-bottom duration-300 pointer-events-auto">
//                                         <div className="flex items-center justify-between border-b border-blue-500/20 pb-2 mb-3">
//                                             <div className="flex items-center gap-2">
//                                                 <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
//                                                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">🧠 Match Intelligence</span>
//                                             </div>
//                                             <button 
//                                                 type="button"
//                                                 onClick={() => setActiveTacticalDrop(null)}
//                                                 className="text-gray-400 hover:text-white transition-colors"
//                                             >
//                                                 <X size={14} />
//                                             </button>
//                                         </div>
//                                         <h4 className="text-sm font-black text-white uppercase tracking-wider">{activeTacticalDrop.title}</h4>
//                                         <p className="text-xs text-gray-200 mt-1.5 leading-relaxed font-bold border-l-2 border-blue-500 pl-3">
//                                             &ldquo;{activeTacticalDrop.text}&rdquo;
//                                         </p>
//                                     </div>
//                                 )}

//                             </>
//                         ) : (
//                             <div className="absolute inset-0 flex items-center justify-center">
//                                 <div className="text-center">
//                                     <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
//                                         <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                     </div>
//                                     <p className="text-gray-400 text-sm">No video stream available</p>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Team 1 label */}
//                         {liveMatch && (
//                             <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-700 rounded-lg px-3 py-1.5 text-xs font-bold opacity-90 z-20">
//                                 {liveMatch.team1?.name || "Team 1"}
//                             </div>
//                         )}

//                         {/* Team 2 label */}
//                         {liveMatch && (
//                             <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
//                                 <div className={`rounded-lg border-2 ${room.borderColor || "border-pink-500"} bg-[#111] px-2 py-1.5 flex items-center justify-center text-xs font-bold text-blue-400`}>
//                                     {liveMatch.team2?.name?.slice(0, 3) || "T2"}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Live Camera Feed PiP */}
//                         {userName && (
//                             <LiveCameraFeed 
//                                 hostName={room.name?.split(" ")[0] || "Expert"} 
//                                 roomName={room.id ? `Watch-${room.id}` : 'Sportsfan-Watchalong'} 
//                                 userRole={userRole}
//                                 userName={userName}
//                                 activeInterview={activeInterview}
//                                 telestratorActive={isTelestratorActive}
//                                 telestratorStrokes={telestratorStrokes}
//                                 onTelestratorStrokeAdded={(stroke) => triggerMoment("TEL_DRAW:" + JSON.stringify(stroke))}
//                                 onTelestratorUndo={() => triggerMoment("TEL_UNDO")}
//                                 onTelestratorClear={() => triggerMoment("TEL_CLEAR")}
//                                 onTelestratorToggleActive={() => triggerMoment("TEL_TOGGLE:" + (!isTelestratorActive).toString())}
//                                 onApiReady={(api) => {
//                                     jitsiApiRef.current = api;
//                                 }}
//                                 onReactionReceived={(reaction) => {
//                                     triggerMoment(reaction, false);
//                                 }}
//                                 onParticipantsChange={(list) => {
//                                     setJitsiParticipants(list);
//                                 }}
//                             />
//                         )}
//                     </div>

//                     {/* Zoom-style Host Reactions */}
//                     {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
//                         <div className="flex flex-col gap-2.5 bg-[#141416] border border-white/5 rounded-xl p-3.5 mt-3 mx-4 sm:mx-6">
//                             <div className="flex items-center gap-1.5 text-gray-400 text-xs">
//                                 <span className="font-extrabold uppercase tracking-widest text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white">Host Reactions</span>
//                                 <span className="opacity-60 cursor-help flex items-center justify-center animate-pulse" title="Click to trigger animated reaction effects for everyone!">
//                                     <Info size={12} />
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1">
                                
//                                 {/* WICKET */}
//                                 <button 
//                                     onClick={() => triggerMoment("WICKET")}
//                                     className="flex-shrink-0 flex items-center gap-2 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-3.5 py-1.5 transition-all hover:scale-105 active:scale-95 text-xs font-semibold text-gray-200"
//                                 >
//                                     <div className="w-5 h-5 rounded-full bg-pink-600 flex items-center justify-center text-[10px] text-white">🏏</div>
//                                     <span>Wicket</span>
//                                 </button>

//                                 {/* SIX */}
//                                 <button 
//                                     onClick={() => triggerMoment("SIX")}
//                                     className="flex-shrink-0 flex items-center gap-2 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-3.5 py-1.5 transition-all hover:scale-105 active:scale-95 text-xs font-semibold text-gray-200"
//                                 >
//                                     <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black text-white">6</div>
//                                     <span>Six</span>
//                                 </button>

//                                 {/* FOUR */}
//                                 <button 
//                                     onClick={() => triggerMoment("FOUR")}
//                                     className="flex-shrink-0 flex items-center gap-2 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-3.5 py-1.5 transition-all hover:scale-105 active:scale-95 text-xs font-semibold text-gray-200"
//                                 >
//                                     <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">4</div>
//                                     <span>Four</span>
//                                 </button>

//                                 {/* TELESTRATOR / CHALKBOARD DRAW */}
//                                 <button 
//                                     onClick={() => triggerMoment("TEL_TOGGLE:" + (!isTelestratorActive).toString())}
//                                     className={`flex-shrink-0 flex items-center gap-2 border rounded-full px-3.5 py-1.5 transition-all hover:scale-105 active:scale-95 text-xs font-semibold ${
//                                         isTelestratorActive 
//                                             ? 'bg-green-600/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse' 
//                                             : 'bg-[#202023] hover:bg-[#2a2a2e] border-white/5 text-gray-200'
//                                     }`}
//                                 >
//                                     <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white">✏️</div>
//                                     <span>{isTelestratorActive ? 'Drawing Live...' : 'Draw Live'}</span>
//                                 </button>

//                                 {/* GOAL */}
//                                 <button 
//                                     onClick={() => triggerMoment("GOAL")}
//                                     className="flex-shrink-0 flex items-center gap-2 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-3.5 py-1.5 transition-all hover:scale-105 active:scale-95 text-xs font-semibold text-gray-200"
//                                 >
//                                     <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white">⚽</div>
//                                     <span>Goal</span>
//                                 </button>

//                                 {/* FIRE */}
//                                 <button 
//                                     onClick={() => triggerMoment("FIRE")}
//                                     className="flex-shrink-0 flex items-center gap-2 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-3.5 py-1.5 transition-all hover:scale-105 active:scale-95 text-xs font-semibold text-gray-200"
//                                 >
//                                     <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white">🔥</div>
//                                     <span>Fire</span>
//                                 </button>

//                                 {/* CLAP */}
//                                 <button 
//                                     onClick={() => triggerMoment("CLAP")}
//                                     className="flex-shrink-0 flex items-center gap-2 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-3.5 py-1.5 transition-all hover:scale-105 active:scale-95 text-xs font-semibold text-gray-200"
//                                 >
//                                     <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] text-white">👏</div>
//                                     <span>Clap</span>
//                                 </button>

//                                 {/* HEART */}
//                                 <button 
//                                     onClick={() => triggerMoment("HEART")}
//                                     className="flex-shrink-0 flex items-center gap-2 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-3.5 py-1.5 transition-all hover:scale-105 active:scale-95 text-xs font-semibold text-gray-200"
//                                 >
//                                     <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white">❤️</div>
//                                     <span>Heart</span>
//                                 </button>

//                             </div>
//                         </div>
//                     )}

//                     {/* Mobile/tablet: tab content inline below tabs */}
//                     <div className="relative z-20 flex flex-col gap-2 px-4 sm:px-6 py-3 border-b border-[#222] lg:hidden">
//                         <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
//                             {sidebarTabs.map((tab) => (
//                                 <button
//                                     key={tab.id}
//                                     onClick={() => setActiveTab(tab.id as any)}
//                                     className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all ${
//                                         activeTab === tab.id
//                                             ? "bg-pink-600 text-white shadow-lg"
//                                             : "bg-[#202023] text-gray-400 hover:bg-[#2a2a2e]"
//                                     }`}
//                                 >
//                                     {tab.label}
//                                 </button>
//                             ))}
//                         </div>
//                         {pinnedMessage && (
//                             <div className="bg-pink-600/10 border border-pink-500/25 px-3 py-2 flex items-center justify-between gap-3 text-xs rounded-xl mt-1">
//                                 <div className="flex items-center gap-2 text-pink-400 overflow-hidden">
//                                     <Pin size={12} className="shrink-0 animate-bounce" />
//                                     <span className="font-extrabold uppercase tracking-wider text-[8px] bg-pink-500/15 px-1 py-0.5 rounded shrink-0">Pinned</span>
//                                     <p className="text-gray-200 truncate font-semibold">{pinnedMessage}</p>
//                                 </div>
//                                 {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
//                                     <button onClick={() => setPinnedMessage(null)} className="text-gray-400 hover:text-white transition-colors shrink-0">
//                                         <X size={12} />
//                                     </button>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                     <div className="flex-1 flex flex-col min-h-0 lg:hidden relative">
//                         <TabContent activeTab={activeTab} matchId={room.liveMatchId} userName={userName} userRole={userRole} room={room} jitsiParticipants={jitsiParticipants} jitsiApi={jitsiApiRef.current} chats={chats} qnaList={qnaList} setQnaList={setQnaList} answeringQuestion={answeringQuestion} setAnsweringQuestion={setAnsweringQuestion} qnaInput={qnaInput} setQnaInput={setQnaInput} sendChatMessage={sendChatMessage} />
//                     </div>
//                 </div>

//                 {/* ── RIGHT: tab content sidebar — desktop only ── */}
//                 <div className="hidden lg:flex lg:flex-col lg:w-[360px] xl:w-[400px] border-l border-[#222] min-h-0 bg-[#0e0e10]">
//                     {/* Tab Header row */}
//                     <div className="flex border-b border-[#222] px-2 py-1.5 gap-1 overflow-x-auto scrollbar-hide bg-[#121214]">
//                         {sidebarTabs.map((tab) => (
//                             <button
//                                 key={tab.id}
//                                 onClick={() => setActiveTab(tab.id as any)}
//                                 className={`flex-shrink-0 text-[11px] xl:text-xs px-2.5 py-1.5 rounded-lg font-bold tracking-wide transition-all ${
//                                     activeTab === tab.id
//                                         ? "bg-pink-600/10 text-pink-400 border border-pink-500/20"
//                                         : "text-gray-400 hover:text-white hover:bg-white/5"
//                                 }`}
//                             >
//                                 {tab.label}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Pinned Message Ribbon inside sidebar */}
//                     {pinnedMessage && (
//                         <div className="bg-pink-600/10 border-b border-pink-500/25 px-4 py-2 flex items-center justify-between gap-3 text-xs">
//                             <div className="flex items-center gap-2 text-pink-400 overflow-hidden">
//                                 <Pin size={12} className="shrink-0 animate-bounce" />
//                                 <span className="font-extrabold uppercase tracking-wider text-[8px] bg-pink-500/15 px-1 py-0.5 rounded shrink-0">Pinned</span>
//                                 <p className="text-gray-200 truncate font-semibold">{pinnedMessage}</p>
//                             </div>
//                             {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
//                                 <button onClick={() => setPinnedMessage(null)} className="text-gray-400 hover:text-white transition-colors shrink-0">
//                                     <X size={12} />
//                                 </button>
//                             )}
//                         </div>
//                     )}

//                     <div className="flex-1 flex flex-col min-h-0 relative">
//                         <TabContent activeTab={activeTab} matchId={room.liveMatchId} userName={userName} userRole={userRole} room={room} jitsiParticipants={jitsiParticipants} jitsiApi={jitsiApiRef.current} chats={chats} qnaList={qnaList} setQnaList={setQnaList} answeringQuestion={answeringQuestion} setAnsweringQuestion={setAnsweringQuestion} qnaInput={qnaInput} setQnaInput={setQnaInput} sendChatMessage={sendChatMessage} />
//                     </div>
//                 </div>

//             </div>

//             {/* Create Prediction Modal */}
//             {showPredictionModal && (
//                 <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
//                     <form onSubmit={handleCreatePrediction} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-[450px] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
//                         <div className="flex items-center justify-between border-b border-white/5 pb-3">
//                             <div className="flex items-center gap-2 text-red-500">
//                                 <Plus size={18} />
//                                 <h3 className="font-black text-sm uppercase tracking-wider text-white">Create Prediction</h3>
//                             </div>
//                             <button type="button" onClick={() => setShowPredictionModal(false)} className="text-gray-400 hover:text-white">
//                                 <X size={18} />
//                             </button>
//                         </div>
//                         <div className="flex flex-col gap-3">
//                             <label className="text-xs font-bold text-gray-400 uppercase">Question</label>
//                             <input 
//                                 type="text"
//                                 value={predQ}
//                                 onChange={(e) => setPredQ(e.target.value)}
//                                 placeholder="e.g. Will India win in next 10 overs?"
//                                 className="bg-[#0c0c0e] border border-white/10 focus:border-red-500 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-all text-white placeholder:text-gray-600"
//                                 required
//                             />
//                         </div>
//                         <div className="grid grid-cols-2 gap-3">
//                             <div className="flex flex-col gap-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase">Option A</label>
//                                 <input 
//                                     type="text"
//                                     value={predA}
//                                     onChange={(e) => setPredA(e.target.value)}
//                                     placeholder="Yes"
//                                     className="bg-[#0c0c0e] border border-white/10 focus:border-red-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
//                                     required
//                                 />
//                             </div>
//                             <div className="flex flex-col gap-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase">Option B</label>
//                                 <input 
//                                     type="text"
//                                     value={predB}
//                                     onChange={(e) => setPredB(e.target.value)}
//                                     placeholder="No"
//                                     className="bg-[#0c0c0e] border border-white/10 focus:border-red-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
//                                     required
//                                 />
//                             </div>
//                         </div>
//                         <button 
//                             type="submit"
//                             disabled={submittingModal}
//                             className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-2.5 rounded-lg text-sm transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50"
//                         >
//                             {submittingModal ? "Creating..." : "Launch Prediction"}
//                         </button>
//                     </form>
//                 </div>
//             )}

//             {/* Create Poll Modal */}
//             {showPollModal && (
//                 <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
//                     <form onSubmit={handleCreatePoll} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-[450px] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
//                         <div className="flex items-center justify-between border-b border-white/5 pb-3">
//                             <div className="flex items-center gap-2 text-blue-400">
//                                 <BarChart3 size={18} />
//                                 <h3 className="font-black text-sm uppercase tracking-wider text-white">Create Live Poll</h3>
//                             </div>
//                             <button type="button" onClick={() => setShowPollModal(false)} className="text-gray-400 hover:text-white">
//                                 <X size={18} />
//                             </button>
//                         </div>
//                         <div className="flex flex-col gap-3">
//                             <label className="text-xs font-bold text-gray-400 uppercase">Poll Question</label>
//                             <input 
//                                 type="text"
//                                 value={pollQ}
//                                 onChange={(e) => setPollQ(e.target.value)}
//                                 placeholder="e.g. Who is the player of the match so far?"
//                                 className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-all text-white placeholder:text-gray-600"
//                                 required
//                             />
//                         </div>
//                         <div className="grid grid-cols-2 gap-3">
//                             <div className="flex flex-col gap-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase">Option A</label>
//                                 <input 
//                                     type="text"
//                                     value={pollA}
//                                     onChange={(e) => setPollA(e.target.value)}
//                                     placeholder="Option A"
//                                     className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
//                                     required
//                                 />
//                             </div>
//                             <div className="flex flex-col gap-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase">Option B</label>
//                                 <input 
//                                     type="text"
//                                     value={pollB}
//                                     onChange={(e) => setPollB(e.target.value)}
//                                     placeholder="Option B"
//                                     className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
//                                     required
//                                 />
//                             </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-3">
//                             <div className="flex flex-col gap-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase">Option C (Optional)</label>
//                                 <input 
//                                     type="text"
//                                     value={pollC}
//                                     onChange={(e) => setPollC(e.target.value)}
//                                     placeholder="Option C"
//                                     className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
//                                 />
//                             </div>
//                             <div className="flex flex-col gap-2">
//                                 <label className="text-xs font-bold text-gray-400 uppercase">Option D (Optional)</label>
//                                 <input 
//                                     type="text"
//                                     value={pollD}
//                                     onChange={(e) => setPollD(e.target.value)}
//                                     placeholder="Option D"
//                                     className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
//                                 />
//                             </div>
//                         </div>
//                         <button 
//                             type="submit"
//                             disabled={submittingModal}
//                             className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50"
//                         >
//                             {submittingModal ? "Launching..." : "Launch Live Poll"}
//                         </button>
//                     </form>
//                 </div>
//             )}

//             {/* Create Quiz Modal */}
//             {showQuizModal && (
//                 <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
//                     <form onSubmit={handleCreateQuiz} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-[480px] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
//                         <div className="flex items-center justify-between border-b border-white/5 pb-3">
//                             <div className="flex items-center gap-2 text-pink-400">
//                                 <Brain size={18} />
//                                 <h3 className="font-black text-sm uppercase tracking-wider text-white">Create Flash Quiz</h3>
//                             </div>
//                             <button type="button" onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-white">
//                                 <X size={18} />
//                             </button>
//                         </div>
//                         <div className="flex flex-col gap-3">
//                             <label className="text-xs font-bold text-gray-400 uppercase">Quiz Question</label>
//                             <input 
//                                 type="text"
//                                 value={quizQ}
//                                 onChange={(e) => setQuizQ(e.target.value)}
//                                 placeholder="e.g. Which team scored the highest in powerplay?"
//                                 className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-all text-white placeholder:text-gray-600"
//                                 required
//                             />
//                         </div>
//                         <div className="grid grid-cols-2 gap-3">
//                             <input type="text" value={quizA} onChange={(e) => setQuizA(e.target.value)} placeholder="Option A" className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white" required />
//                             <input type="text" value={quizB} onChange={(e) => setQuizB(e.target.value)} placeholder="Option B" className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white" required />
//                             <input type="text" value={quizC} onChange={(e) => setQuizC(e.target.value)} placeholder="Option C" className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white" required />
//                             <input type="text" value={quizD} onChange={(e) => setQuizD(e.target.value)} placeholder="Option D" className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white" required />
//                         </div>
//                         <div className="grid grid-cols-3 gap-3">
//                             <div className="flex flex-col gap-2">
//                                 <label className="text-[10px] font-bold text-gray-400 uppercase">Correct Option</label>
//                                 <select 
//                                     value={quizAns}
//                                     onChange={(e) => setQuizAns(e.target.value)}
//                                     className="bg-[#0c0c0e] border border-white/10 outline-none rounded-lg px-3 py-2 text-sm text-white"
//                                 >
//                                     <option value="A">A</option>
//                                     <option value="B">B</option>
//                                     <option value="C">C</option>
//                                     <option value="D">D</option>
//                                 </select>
//                             </div>
//                             <div className="flex flex-col gap-2">
//                                 <label className="text-[10px] font-bold text-gray-400 uppercase">Timer (Sec)</label>
//                                 <input 
//                                     type="number" 
//                                     value={quizTime} 
//                                     onChange={(e) => setQuizTime(parseInt(e.target.value))} 
//                                     className="bg-[#0c0c0e] border border-white/10 outline-none rounded-lg px-3 py-2 text-sm text-white" 
//                                     min={5}
//                                     max={60}
//                                     required 
//                                 />
//                             </div>
//                             <div className="flex flex-col gap-2">
//                                 <label className="text-[10px] font-bold text-gray-400 uppercase">Points</label>
//                                 <input 
//                                     type="number" 
//                                     value={quizPts} 
//                                     onChange={(e) => setQuizPts(parseInt(e.target.value))} 
//                                     className="bg-[#0c0c0e] border border-white/10 outline-none rounded-lg px-3 py-2 text-sm text-white" 
//                                     min={10}
//                                     required 
//                                 />
//                             </div>
//                         </div>
//                         <button 
//                             type="submit"
//                             disabled={submittingModal}
//                             className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 rounded-lg text-sm transition-all hover:shadow-[0_0_15px_rgba(219,39,119,0.4)] disabled:opacity-50"
//                         >
//                             {submittingModal ? "Launching..." : "Launch Flash Quiz"}
//                         </button>
//                     </form>
//                 </div>
//             )}

//             {/* Pin Message Modal */}
//             {showPinModal && (
//                 <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
//                     <form onSubmit={handlePinMessage} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-[450px] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
//                         <div className="flex items-center justify-between border-b border-white/5 pb-3">
//                             <div className="flex items-center gap-2 text-red-400">
//                                 <Pin size={18} />
//                                 <h3 className="font-black text-sm uppercase tracking-wider text-white">Pin Message to Top</h3>
//                             </div>
//                             <button type="button" onClick={() => setShowPinModal(false)} className="text-gray-400 hover:text-white">
//                                 <X size={18} />
//                             </button>
//                         </div>
//                         <div className="flex flex-col gap-3">
//                             <label className="text-xs font-bold text-gray-400 uppercase">Message</label>
//                             <input 
//                                 type="text"
//                                 value={pinText}
//                                 onChange={(e) => setPinText(e.target.value)}
//                                 placeholder="Type a message to highlight..."
//                                 className="bg-[#0c0c0e] border border-white/10 focus:border-red-500 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-all text-white placeholder:text-gray-600"
//                                 required
//                             />
//                         </div>
//                         <button 
//                             type="submit"
//                             className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
//                         >
//                             Pin Highlight
//                         </button>
//                     </form>
//                 </div>
//             )}

//             {/* TACTICAL CHALKBOARD ENTRY MODAL */}
//             {showTacticalModal && (
//                 <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
//                     <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
//                         <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
//                             <h3 className="text-sm font-black uppercase tracking-wider text-white">🧠 Chalkboard Match Analysis</h3>
//                             <button onClick={() => setShowTacticalModal(false)} className="text-gray-400 hover:text-white transition-colors">
//                                 <X size={18} />
//                             </button>
//                         </div>
//                         <form onSubmit={(e) => {
//                             e.preventDefault();
//                             if (tacticalText.trim()) {
//                                 triggerMoment(`TACTICAL_DROP:${tacticalTitle}:${tacticalText}`);
//                                 setShowTacticalModal(false);
//                             }
//                         }} className="p-6 space-y-4">
//                             <div>
//                                 <label className="block text-[10px] uppercase font-black tracking-wider text-gray-400 mb-1.5">Analysis Title</label>
//                                 <select 
//                                     value={tacticalTitle}
//                                     onChange={(e) => setTacticalTitle(e.target.value)}
//                                     className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
//                                 >
//                                     <option value="Analyze Captain's Move">Analyze Captain&apos;s Move</option>
//                                     <option value="Match Situation Interpretation">Match Situation Interpretation</option>
//                                     <option value="Strategic Bowling Change">Strategic Bowling Change</option>
//                                     <option value="Powerplay Strategy">Powerplay Strategy</option>
//                                     <option value="Death Overs Blueprint">Death Overs Blueprint</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-[10px] uppercase font-black tracking-wider text-gray-400 mb-1.5">Strategic Commentary</label>
//                                 <textarea 
//                                     value={tacticalText}
//                                     onChange={(e) => setTacticalText(e.target.value)}
//                                     placeholder="Type match commentary, strategy shifts, or captain critiques..."
//                                     rows={4}
//                                     className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 font-bold"
//                                     required
//                                 />
//                             </div>
//                             <div className="flex gap-3 pt-2">
//                                 <button 
//                                     type="button" 
//                                     onClick={() => {
//                                         triggerMoment("TACTICAL_CLEAR");
//                                         setShowTacticalModal(false);
//                                     }}
//                                     className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black py-3.5 rounded-xl text-xs transition-all border border-red-500/20 animate-pulse"
//                                 >
//                                     Clear Overlay
//                                 </button>
//                                 <button 
//                                     type="submit"
//                                     className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black py-3.5 rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(219,39,119,0.3)] hover:scale-105 active:scale-95"
//                                 >
//                                     Broadcast Live
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* QUICK PREDICT TEMPLATES MODAL */}
//             {showPredictTemplates && (
//                 <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
//                     <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
//                         <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
//                             <h3 className="text-sm font-black uppercase tracking-wider text-white">🎯 Quick Predict Templates</h3>
//                             <button onClick={() => setShowPredictTemplates(false)} className="text-gray-400 hover:text-white transition-colors">
//                                 <X size={18} />
//                             </button>
//                         </div>
//                         <div className="p-6 space-y-3">
//                             <p className="text-xs text-gray-400 font-medium mb-4">
//                                 Select a micro-stage cricket prediction template to broadcast instantly to all fans in the watchroom.
//                             </p>
//                             <button 
//                                 onClick={() => {
//                                     handleQuickPrediction("How many runs will India score in the next 2 overs?", ["Under 12 Runs", "12 to 18 Runs", "Over 18 Runs"]);
//                                     setShowPredictTemplates(false);
//                                 }}
//                                 className="w-full flex items-center justify-between bg-[#1c1c1f] hover:bg-[#252529] border border-white/5 hover:border-pink-500/30 px-4 py-3.5 rounded-xl transition-all group"
//                             >
//                                 <div className="flex items-center gap-3">
//                                     <span className="text-xl">🏏</span>
//                                     <div className="text-left">
//                                         <p className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">Runs next 2 overs</p>
//                                         <p className="text-[10px] text-gray-400 font-medium">Under 12, 12 to 18, Over 18</p>
//                                     </div>
//                                 </div>
//                                 <span className="text-xs text-pink-500 font-black tracking-wider uppercase bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">Launch</span>
//                             </button>
//                             <button 
//                                 onClick={() => {
//                                     handleQuickPrediction("Will the next ball be a boundary?", ["Yes, Boundary", "No, Single/Dot", "Wicket!"]);
//                                     setShowPredictTemplates(false);
//                                 }}
//                                 className="w-full flex items-center justify-between bg-[#1c1c1f] hover:bg-[#252529] border border-white/5 hover:border-pink-500/30 px-4 py-3.5 rounded-xl transition-all group"
//                             >
//                                 <div className="flex items-center gap-3">
//                                     <span className="text-xl">💥</span>
//                                     <div className="text-left">
//                                         <p className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">Next ball boundary</p>
//                                         <p className="text-[10px] text-gray-400 font-medium">Boundary, Single/Dot, Wicket</p>
//                                     </div>
//                                 </div>
//                                 <span className="text-xs text-pink-500 font-black tracking-wider uppercase bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">Launch</span>
//                             </button>
//                             <button 
//                                 onClick={() => {
//                                     handleQuickPrediction("Will India take a DRS review in the next 3 overs?", ["Yes, DRS Review", "No Review"]);
//                                     setShowPredictTemplates(false);
//                                 }}
//                                 className="w-full flex items-center justify-between bg-[#1c1c1f] hover:bg-[#252529] border border-white/5 hover:border-pink-500/30 px-4 py-3.5 rounded-xl transition-all group"
//                             >
//                                 <div className="flex items-center gap-3">
//                                     <span className="text-xl">⚖️</span>
//                                     <div className="text-left">
//                                         <p className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">DRS Decision</p>
//                                         <p className="text-[10px] text-gray-400 font-medium">Yes DRS Review, No Review</p>
//                                     </div>
//                                 </div>
//                                 <span className="text-xs text-pink-500 font-black tracking-wider uppercase bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">Launch</span>
//                             </button>
//                             <button 
//                                 onClick={() => {
//                                     handleQuickPrediction("Will the captain bring back Bumrah to bowl the next over?", ["Yes, Bumrah bowls", "No, other bowler"]);
//                                     setShowPredictTemplates(false);
//                                 }}
//                                 className="w-full flex items-center justify-between bg-[#1c1c1f] hover:bg-[#252529] border border-white/5 hover:border-pink-500/30 px-4 py-3.5 rounded-xl transition-all group"
//                             >
//                                 <div className="flex items-center gap-3">
//                                     <span className="text-xl">🧢</span>
//                                     <div className="text-left">
//                                         <p className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">Captain&apos;s Bowling Move</p>
//                                         <p className="text-[10px] text-gray-400 font-medium">Bumrah bowls, Other bowler</p>
//                                     </div>
//                                 </div>
//                                 <span className="text-xs text-pink-500 font-black tracking-wider uppercase bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">Launch</span>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* TIMED FULL-SCREEN EMOJI STORM OVERLAY */}
//             {stormState !== 'idle' && (
//                 <div className={`fixed inset-0 z-[9999] flex flex-col justify-between ${
//                     stormState === 'countdown' ? 'bg-black/95 backdrop-blur-xl pointer-events-auto' : 
//                     stormState === 'active' ? 'bg-black/60 pointer-events-none' : 
//                     'bg-black/95 backdrop-blur-2xl pointer-events-auto'
//                 } transition-all duration-500`}>
                    
//                     {/* Countdown Screen */}
//                     {stormState === 'countdown' && (
//                         <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300 pointer-events-auto">
//                             <div className="w-20 h-20 rounded-3xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6 border border-pink-500/20 animate-pulse">
//                                 <Zap size={40} />
//                             </div>
//                             <h2 className="text-sm font-black tracking-widest text-pink-500 uppercase mb-2 animate-bounce">EMOJI STORM INCOMING</h2>
//                             <p className="text-xs text-gray-400 max-w-[280px] mb-8 font-medium">Get ready to tap as fast as you can! Speed is everything!</p>
//                             <div className="w-40 h-40 flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
//                                 <span key={stormCountdownVal} className="text-7xl font-black text-white animate-pulse-countdown filter drop-shadow-[0_0_20px_rgba(236,72,153,0.6)]">
//                                     {stormCountdownVal}
//                                 </span>
//                             </div>
//                         </div>
//                     )}

//                     {/* Active Storm Screen */}
//                     {stormState === 'active' && (
//                         <>
//                             {/* Floating Storm Emojis */}
//                             <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
//                                 {stormFloating.map((f) => (
//                                     <span
//                                         key={f.id}
//                                         className="absolute text-5xl select-none animate-storm-float"
//                                         style={{
//                                             left: `${f.x}%`,
//                                             bottom: '-10vh',
//                                             '--rot': `${f.rot}deg`,
//                                             '--scale': f.scale,
//                                             opacity: f.opacity,
//                                             animationDuration: `${3 / f.speed}s`
//                                         } as any}
//                                     >
//                                         {f.emoji}
//                                     </span>
//                                 ))}
//                             </div>

//                             {/* Top Stats Banner */}
//                             <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-white/10 rounded-full px-6 py-2.5 flex items-center gap-4 z-[9999] shadow-2xl animate-in slide-in-from-top duration-300 pointer-events-auto">
//                                 <div className="flex items-center gap-2">
//                                     <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
//                                     <span className="text-xs font-black tracking-widest text-white uppercase">STORM ACTIVE</span>
//                                 </div>
//                                 <div className="h-4 w-px bg-white/15"></div>
//                                 <div className="text-xs font-bold text-gray-300">
//                                     ⏱️ <span className="text-pink-400 font-black text-sm">{stormTimeLeft}s</span> left
//                                 </div>
//                                 <div className="h-4 w-px bg-white/15"></div>
//                                 <div className="text-xs font-bold text-gray-300">
//                                     🔥 Intensity: <span className="text-pink-400 font-black text-sm">{(stormTotalTaps + stormLocalTaps).toLocaleString()}</span>
//                                 </div>
//                             </div>

//                             {/* Floating Tap Grid */}
//                             <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-[9999] w-[92%] max-w-[560px] pointer-events-auto animate-in slide-in-from-bottom duration-300">
//                                 <div className="text-center mb-3">
//                                     <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 animate-pulse">⚡ TAP REPEATEDLY AS FAST AS YOU CAN! ⚡</p>
//                                     <p className="text-[9px] text-gray-400 font-medium">Unleash the ultimate collective energy!</p>
//                                 </div>
//                                 <div className="grid grid-cols-4 gap-3">
//                                     {EMOJI_OPTIONS.map((emoji) => (
//                                         <button
//                                             key={emoji}
//                                             type="button"
//                                             onClick={() => handleStormTap(emoji)}
//                                             className="flex flex-col items-center justify-center py-4 bg-white/5 hover:bg-white/10 active:scale-75 hover:border-pink-500/50 border border-white/5 rounded-2xl transition-all duration-100 transform select-none"
//                                         >
//                                             <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transform hover:scale-110 active:scale-95 transition-transform">{emoji}</span>
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                         </>
//                     )}

//                     {/* Summary Screen */}
//                     {stormState === 'summary' && (
//                         <div className="flex-1 flex flex-col items-center justify-center text-center p-4 pointer-events-auto">
//                             <div className="max-w-md w-full animate-in zoom-in duration-300">
                                
//                                 {/* Storm Intensity Card */}
//                                 <div className="bg-gradient-to-br from-orange-600 to-pink-600 rounded-3xl p-8 shadow-[0_15px_50px_rgba(236,72,153,0.3)] border border-pink-500/20 mb-6 transform hover:scale-102 transition-transform">
//                                     <p className="text-[10px] font-black uppercase tracking-widest text-orange-200 mb-1">Storm Status: Ended</p>
//                                     <h2 className="text-3xl font-black text-white mb-4 animate-bounce">🔥 {Math.min(99, 85 + Math.floor(Math.random() * 14))}% Intensity</h2>
//                                     <p className="text-white/90 text-sm font-semibold tracking-wide">
//                                         {((stormTotalTaps + stormLocalTaps) * 153 + 1205).toLocaleString()} emojis sent!
//                                     </p>
//                                 </div>

//                                 {/* Mini Leaderboard */}
//                                 <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-2xl">
//                                     <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-center gap-2">
//                                         <span>🏆</span> Top Senders Leaderboard <span>🏆</span>
//                                     </h3>
//                                     <div className="flex flex-col gap-3">
//                                         {stormLeaderboard.map((item, index) => {
//                                             const medals = ["🥇", "🥈", "🥉"];
//                                             const colors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
//                                             const bgColors = ["bg-yellow-400/10 border-yellow-400/20", "bg-gray-300/10 border-gray-300/20", "bg-amber-600/10 border-amber-600/20"];
//                                             return (
//                                                 <div key={item.name + '-' + index} className={`flex items-center justify-between p-3.5 rounded-xl border ${bgColors[index] || "border-white/5 bg-[#202023]"}`}>
//                                                     <div className="flex items-center gap-3">
//                                                         <span className="text-xl">{medals[index]}</span>
//                                                         <span className="text-sm font-black text-white">{item.name}</span>
//                                                     </div>
//                                                     <span className={`text-xs font-black ${colors[index]}`}>{(item.count * 153 + 24).toLocaleString()} taps</span>
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 </div>

//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}



//         </div>
//     );
// }






// components/watch-along/WatchRoom.tsx
"use client";
import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useWatchAlong, Room, Match } from "@/context/WatchAlongContext";
import Prediction from "@/src/components/WatchLobby/Prediction";
import FlashQuiz from "@/src/components/WatchLobby/Flashquiz";
import LiveChat from "@/src/components/WatchLobby/LiveChat";
import DiscussionRoom from "@/src/components/NewROARComponent/screens/DiscussionRoom";
import ComposeModal from "@/src/components/NewROARComponent/components/ComposeModal";
import EmojiStorm from "@/src/components/WatchLobby/Emojistorm";
import Polls from "@/src/components/WatchLobby/Polls";
import VideoPlayer from "./VideoPlayer";
import ConfettiWrapper from "./ConfettiWrapper";
import Telestrator, { Stroke } from "./Telestrator";
// Live camera feed via native getUserMedia API
import Link from "next/link";
import { Mic, MicOff, Video, VideoOff, MonitorUp, Maximize2, Minimize2, CircleDot, Plus, BarChart3, Brain, Zap, Pin, Share2, Info, X, Cloud, HardDrive, Crown, TrendingUp, Flame, MoreHorizontal } from "lucide-react";


const JitsiMeeting = dynamic(
    () => import("@jitsi/react-sdk").then((mod) => mod.JitsiMeeting),
    { ssr: false }
);

/* ── Jitsi PiP — Jitsi Meet External API SDK ── */
function LiveCameraFeed({ 
    hostName, 
    roomName, 
    userRole, 
    userName,
    userEmail,
    onApiReady,
    onReactionReceived,
    onParticipantsChange,
    activeInterview = null,
    telestratorActive = false,
    telestratorStrokes = [],
    onTelestratorStrokeAdded,
    onTelestratorUndo,
    onTelestratorClear,
    onTelestratorToggleActive
}: { 
    hostName: string; 
    roomName: string; 
    userRole: string; 
    userName: string;
    userEmail?: string;
    onApiReady?: (api: any) => void;
    onReactionReceived?: (reaction: string) => void;
    onParticipantsChange?: (participants: any[]) => void;
    activeInterview?: string | null;
    telestratorActive?: boolean;
    telestratorStrokes?: Stroke[];
    onTelestratorStrokeAdded?: (stroke: Stroke) => void;
    onTelestratorUndo?: () => void;
    onTelestratorClear?: () => void;
    onTelestratorToggleActive?: () => void;
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiRef = useRef<any>(null);
    const [micOn, setMicOn] = useState(true);
    const [vidOn, setVidOn] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Custom browser-based screen recorder states
    const [isMounted, setIsMounted] = useState(false);
    const [customRecordingState, setCustomRecordingState] = useState<'idle' | 'recording' | 'finished'>('idle');
    const [customRecordingMode, setCustomRecordingMode] = useState<'local' | 'file' | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [showRecordingOptions, setShowRecordingOptions] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const isModerator = userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleApiReady = async (api: any) => {
        apiRef.current = api;
        if (onApiReady) {
            onApiReady(api);
        }
        
        // Sync initial state
        try {
            const audioMuted = await api.isAudioMuted();
            setMicOn(!audioMuted);
        } catch (err) {}
        try {
            const videoMuted = await api.isVideoMuted();
            setVidOn(!videoMuted);
        } catch (err) {}
        
        // Listen to Jitsi's internal mute status changes and synchronize state
        api.addListener("audioMuteStatusChanged", (data: { muted: boolean }) => {
            setMicOn(!data.muted);
        });
        api.addListener("videoMuteStatusChanged", (data: { muted: boolean }) => {
            setVidOn(!data.muted);
        });
        api.addListener("recordingStatusChanged", (data: { on: boolean; mode?: string }) => {
            setCustomRecordingState(data.on ? 'recording' : 'idle');
            setCustomRecordingMode((data.mode || 'local') as 'local' | 'file');
        });

        // Listen for custom Jitsi endpoint text messages (used for real-time reactions)
        api.addListener("endpointTextMessageReceived", (event: any) => {
            try {
                const text = event.eventData?.text || event.data?.text || event.text || (typeof event === 'string' ? event : null);
                if (text && text.startsWith("REACTION:")) {
                    const reaction = text.replace("REACTION:", "");
                    if (onReactionReceived) {
                        onReactionReceived(reaction);
                    }
                }
            } catch (err) {
                console.error("Error receiving endpoint text message:", err);
            }
        });

        // Setup real-time participant tracking
        const updateParticipants = () => {
            if (onParticipantsChange) {
                const list = api.getParticipantsInfo() || [];
                onParticipantsChange(list);
            }
        };

        api.addListener("participantJoined", updateParticipants);
        api.addListener("participantLeft", updateParticipants);
        api.addListener("displayNameChange", updateParticipants);
        api.addListener("participantRoleChanged", updateParticipants);
        api.addListener("videoConferenceJoined", updateParticipants);

        // Run staggered initial syncs to ensure slower connecting participants resolve correctly
        setTimeout(updateParticipants, 1000);
        setTimeout(updateParticipants, 3000);
        setTimeout(updateParticipants, 5000);
        setTimeout(updateParticipants, 10000);
    };

    const toggleMic = useCallback(() => {
        if (apiRef.current) {
            apiRef.current.executeCommand('toggleAudio');
        }
    }, []);

    const toggleVid = useCallback(() => {
        if (apiRef.current) {
            apiRef.current.executeCommand('toggleVideo');
        }
    }, []);

    const toggleScreenShare = useCallback(() => {
        if (apiRef.current) {
            apiRef.current.executeCommand('toggleShareScreen');
        }
    }, []);

    const formatDuration = useCallback((secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }, []);

    const startCustomRecording = useCallback(async (mode: 'local' | 'file') => {
        try {
            // Request display media for tab/window capture
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                },
                audio: true
            });

            streamRef.current = stream;
            
            const options = { mimeType: 'video/webm;codecs=vp9,opus' };
            let recorder: MediaRecorder;
            try {
                recorder = new MediaRecorder(stream, options);
            } catch (e) {
                recorder = new MediaRecorder(stream);
            }

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setRecordedBlob(blob);
                setCustomRecordingState('finished');
                setShowSaveModal(true);
                
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorderRef.current = recorder;
            recorder.start();

            setCustomRecordingState('recording');
            setCustomRecordingMode(mode);
            setRecordingDuration(0);
            setShowRecordingOptions(false);

            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Failed to start custom screen recording:", err);
        }
    }, []);

    const stopCustomRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    }, []);

    const toggleRecording = useCallback(() => {
        if (customRecordingState === 'recording') {
            stopCustomRecording();
        } else {
            setShowRecordingOptions(prev => !prev);
        }
    }, [customRecordingState, stopCustomRecording]);

    const downloadRecordingLocally = useCallback(() => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sportsfan-watchalong-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setShowSaveModal(false);
            setRecordedBlob(null);
            setCustomRecordingState('idle');
        }
    }, [recordedBlob]);

    const uploadRecordingToServer = useCallback(() => {
        if (recordedBlob) {
            setUploadProgress(0);
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 150);
        }
    }, [recordedBlob]);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    const toggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    return (
        <div className={`absolute transition-all overflow-hidden bg-[#000] shadow-2xl z-20 
            ${isExpanded 
                ? 'inset-0 w-full h-full rounded-none z-45' 
                : 'bottom-2.5 right-3 w-[140px] h-[95px] lg:w-[240px] lg:h-[160px] rounded-xl border border-white/20 hover:scale-105'
            }`}>
            
            <div className="flex w-full h-full">
                {/* Jitsi meeting frame */}
                <div className="h-full relative w-full">
                    {/* Jitsi SDK React component */}
                    <JitsiMeeting
                        key={isModerator ? 'moderator' : 'viewer'}
                        domain="meet.uxexpert.in"
                        roomName={roomName}

                        configOverwrite={{
                            prejoinPageEnabled: false,
                            prejoinConfig: {
                                enabled: false,
                            },
                            welcomePage: {
                                disabled: true,
                            },
                            startWithAudioMuted: !isModerator,
                            startWithVideoMuted: !isModerator,
                            startSilent: false, // Fully connect viewers so WebRTC data channels and participants list synchronize correctly
                            disableDeepLinking: true,
                            enableWelcomePage: false,
                            hideConferenceSubject: true,
                            hideConferenceTimer: true,
                            disableThirdPartyRequests: true,
                            p2p: { enabled: false },
                            defaultLogoUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                            logoImageUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                            logoClickUrl: '',
                            disableUnsupportedBrowserPage: true,
                        }}
                        interfaceConfigOverwrite={{
                            SHOW_JITSI_WATERMARK: false,
                            SHOW_BRAND_WATERMARK: false,
                            SHOW_POWERED_BY: false,
                            DEFAULT_LOGO_URL: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                            DEFAULT_WELCOME_PAGE_LOGO_URL: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                            BRAND_WATERMARK_LINK: '',
                            JITSI_WATERMARK_LINK: '',
                            TOOLBAR_BUTTONS: isModerator 
                                ? ['microphone', 'camera', 'desktop', 'fullscreen', 'hangup', 'settings', 'raisehand', 'videoquality', 'participants-pane', 'recording', 'localrecording', 'select-background']
                                : ['microphone', 'hangup'],
                            FILM_STRIP_MAX_HEIGHT: isModerator ? undefined : 0,
                            DISABLE_VIDEO_BACKGROUND: true,
                        }}
                        userInfo={{
                            displayName: userName || "Anonymous Viewer",
                            email: userEmail || `${(userName || "viewer").toLowerCase().replace(/\s+/g, '')}@sportsfan360.com`,
                        }}
                        onApiReady={handleApiReady}
                        getIFrameRef={(wrapperDiv: HTMLDivElement) => {
                            wrapperDiv.style.width = '100%';
                            wrapperDiv.style.height = '100%';
                            wrapperDiv.style.border = 'none';

                            const iframe = wrapperDiv.querySelector('iframe');
                            if (iframe) {
                                iframe.style.width = '100%';
                                iframe.style.height = '100%';
                                iframe.style.border = 'none';
                                iframe.setAttribute('allow', 'camera; microphone; display-capture; autoplay; clipboard-write');
                            }
                        }}
                    />

                    {/* Telestrator Drawing Board Overlay */}
                    <Telestrator 
                        isActive={telestratorActive}
                        isModerator={isModerator}
                        strokes={telestratorStrokes}
                        onStrokeAdded={onTelestratorStrokeAdded}
                        onUndo={onTelestratorUndo}
                        onClear={onTelestratorClear}
                        onToggleActive={onTelestratorToggleActive}
                    />

                    {/* LIVE badge & custom overlays */}
                    {!isExpanded ? (
                        <>
                            {/* LIVE badge for minimized view */}
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-[9999] bg-[#111]/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] text-green-400 font-bold">LIVE</span>
                            </div>

                            {/* Expand toggle button for minimized view */}
                            <button
                                type="button"
                                onClick={toggleExpand}
                                className="absolute top-1.5 left-8 w-6 h-6 rounded-md flex items-center justify-center bg-[#111]/80 backdrop-blur-md border border-white/10 hover:bg-white/20 text-white transition-all z-[9999]"
                                title="Expand"
                            >
                                <Maximize2 size={12} />
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Minimize button in the top-right corner when expanded */}
                            <button
                                type="button"
                                onClick={toggleExpand}
                                className="absolute top-[10px] right-[10px] w-8 h-8 rounded-xl flex items-center justify-center bg-[#111]/90 backdrop-blur-md border border-white/10 hover:bg-white/20 text-white transition-all z-[9999] shadow-2xl"
                                title="Minimize"
                            >
                                <Minimize2 size={14} />
                            </button>
                        </>
                    )}

                    {/* Flashing REC badge for Host */}
                    {isModerator && customRecordingState === 'recording' && (
                        <div className="absolute top-1.5 left-14 flex items-center gap-1 z-[9999] bg-red-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-black text-white border border-red-500/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            <span>REC {formatDuration(recordingDuration)}</span>
                        </div>
                    )}



                    {/* Record button (Host/Mods ONLY) */}
                    {isModerator && (
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1.5 z-[9999] bg-[#111]/80 backdrop-blur-md px-1.5 py-1 rounded-lg border border-white/10">
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 ${
                                    customRecordingState === 'recording' 
                                        ? "bg-red-600 text-white animate-pulse" 
                                        : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                                title={customRecordingState === 'recording' ? "Stop Recording" : "Start Recording Options"}
                            >
                                <span className={`w-2.5 h-2.5 rounded-full ${customRecordingState === 'recording' ? "bg-white" : "bg-red-500"}`} />
                            </button>
                        </div>
                    )}



                    {/* Premium Glassmorphic Recording Selector Popover */}
                    {isModerator && showRecordingOptions && customRecordingState === 'idle' && (
                        <div className="absolute top-[40px] right-1.5 w-[160px] bg-[#111]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-2.5 z-[9999] flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between text-[9px] text-white/50 font-bold uppercase tracking-wider px-1 pb-1 border-b border-white/5">
                                <span>Record Session</span>
                                <button 
                                    onClick={() => setShowRecordingOptions(false)}
                                    className="text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => startCustomRecording('local')}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 active:scale-95 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-md shadow-pink-500/20 group"
                            >
                                <CircleDot size={11} className="text-white animate-pulse" />
                                Start Recording
                            </button>
                        </div>
                    )}

                    {/* Post-Recording Saver Choice Modal */}
                    {isModerator && showSaveModal && recordedBlob && isMounted && typeof window !== "undefined" && document.body && createPortal(
                        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
                            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 w-full max-w-[240px] shadow-2xl flex flex-col gap-3.5">
                                <div className="flex flex-col items-center text-center gap-1">
                                    <div className="w-10 h-10 rounded-full bg-pink-600/20 flex items-center justify-center text-pink-500 mb-1 animate-bounce">
                                        <CircleDot size={20} className="animate-pulse" />
                                    </div>
                                    <h3 className="text-white text-xs font-black uppercase tracking-wider">Recording Saved!</h3>
                                    <p className="text-[9px] text-white/60 font-bold uppercase tracking-wider">Duration: {formatDuration(recordingDuration)}</p>
                                </div>

                                {uploadProgress === null ? (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={downloadRecordingLocally}
                                            className="flex items-center justify-center gap-2 w-full py-2 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-pink-500/20"
                                        >
                                            <HardDrive size={11} />
                                            Save Locally
                                        </button>
                                        <button
                                            type="button"
                                            onClick={uploadRecordingToServer}
                                            className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-white/10"
                                        >
                                            <Cloud size={11} />
                                            Save to Server
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSaveModal(false);
                                                setRecordedBlob(null);
                                                setCustomRecordingState('idle');
                                            }}
                                            className="w-full text-center text-[9px] text-white/40 hover:text-white transition-colors mt-1 font-bold uppercase tracking-wider"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 py-1">
                                        <div className="flex justify-between items-center text-[9px] font-black text-white/80 uppercase tracking-wider">
                                            <span>{uploadProgress < 100 ? "Uploading..." : "Success!"}</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-pink-500 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        {uploadProgress === 100 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowSaveModal(false);
                                                    setRecordedBlob(null);
                                                    setCustomRecordingState('idle');
                                                    setUploadProgress(null);
                                                }}
                                                className="w-full py-1.5 bg-green-600 hover:bg-green-500 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all text-center mt-2 shadow-lg shadow-green-500/20"
                                            >
                                                Okay
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>,
                        document.body
                    )}

                    {/* Host name overlay with SportsFan Logo */}
                    <div className="absolute bottom-2 left-2 bg-[#111]/80 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-bold text-white border border-white/10 z-[9999] flex items-center gap-1.5">
                        <img src="/images/Logo.png" alt="SportsFan Logo" className="w-3 h-3.5 shrink-0 object-contain" />
                        <span>{hostName}</span>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes scanLine {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(160px); }
                    100% { transform: translateY(0); }
                }
                .animate-scan-line {
                    animation: scanLine 4s linear infinite;
                }
            `}</style>
        </div>
    );
}

const actionTabs: { id: 'prediction' | 'flashQuiz' | 'liveChat' | 'emojiStorm' | 'participants'; label: string }[] = [
    { id: 'prediction', label: 'Prediction' },
    { id: 'flashQuiz', label: 'Flash Quiz' },
    { id: 'liveChat', label: 'Live Chat' },
    { id: 'emojiStorm', label: 'Emoji Storm' },
    { id: 'participants', label: 'Participants' }
];

type Props = {
    room: Room;
    onBack: () => void;
};

function TabContent({
    activeTab,
    matchId,
    userName,
    userRole,
    room,
    jitsiParticipants = [],
    jitsiApi = null,
    chats = [],
    qnaList = [],
    setQnaList,
    answeringQuestion,
    setAnsweringQuestion,
    qnaInput = "",
    setQnaInput,
    sendChatMessage,
    isMobile = false,
    composeOpen,
    setComposeOpen,
    composeType,
    setComposeType,
    handleComposePost
}: {
    activeTab: string;
    matchId: string | undefined;
    userName: string | null;
    userRole: string;
    room: Room;
    jitsiParticipants?: any[];
    jitsiApi?: any;
    chats?: any[];
    qnaList?: any[];
    setQnaList?: any;
    answeringQuestion?: any;
    setAnsweringQuestion?: any;
    qnaInput?: string;
    setQnaInput?: any;
    sendChatMessage?: any;
    isMobile?: boolean;
    composeOpen: boolean;
    setComposeOpen: (open: boolean) => void;
    composeType: string | null;
    setComposeType: (type: string | null) => void;
    handleComposePost: (payload: any) => Promise<void>;
}) {
    const { updateRoom, fetchRoomById } = useWatchAlong();

    // Don't render if matchId is not available
    if (!matchId && activeTab !== 'participants' && activeTab !== 'qna') {
        return (
            <div className="w-full px-4 sm:px-6 py-3">
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500 text-sm">Waiting for match data...</p>
                </div>
            </div>
        );
    }

    switch (activeTab) {
        case 'prediction': return <Prediction matchId={matchId!} />;
        case 'polls': return <Polls matchId={matchId!} />;
        case 'flashQuiz': return <FlashQuiz matchId={matchId!} />;
        case 'liveChat': return (
            <div className="h-full w-full overflow-hidden relative">
                <DiscussionRoom 
                    roomId={room.id || room.liveMatchId} 
                    onBack={() => {}} 
                    onToast={(m: string) => console.log(m)} 
                    roomName={room.name}
                    roomSports={(room as any).sport || (room.name?.toLowerCase().includes("football") || room.name?.toLowerCase().includes("soccer") ? "football" : "cricket")}
                    watchAlongRoomId={room.id}
                    onCompose={(type) => { setComposeType(type); setComposeOpen(true); }}
                />
                <ComposeModal 
                    open={composeOpen} 
                    onClose={() => { setComposeOpen(false); setComposeType(null); }} 
                    onPost={handleComposePost} 
                    initialType={composeType} 
                    constrainedToParent={!isMobile}
                />
            </div>
        );
        case 'emojiStorm': return <EmojiStorm matchId={matchId!} />;
        case 'qna': {
            const handleAskQ = () => {
                if (!qnaInput.trim() || !userName) return;
                const newQ = {
                    id: `q_${Date.now()}`,
                    user: userName,
                    text: qnaInput,
                    answered: false,
                    timestamp: Date.now()
                };
                if (setQnaList) {
                    setQnaList((prev: any) => [...prev, newQ]);
                }
                if (setQnaInput) {
                    setQnaInput("");
                }
                if (sendChatMessage && room?.liveMatchId) {
                    sendChatMessage(room.liveMatchId, userName, `[QNA_ASK]: ${qnaInput}`, "text-pink-400");
                }
            };

            const isHost = userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator';

            return (
                <div className="w-full h-full flex flex-col p-4 overflow-y-auto">
                    <h2 className="text-white font-black text-lg mb-1 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse"></span>
                        Q&A Forum
                    </h2>
                    <p className="text-[11px] text-gray-500 mb-4 font-bold uppercase tracking-wider">
                        {isHost ? "Answer fan questions live on stream!" : "Ask the expert a question!"}
                    </p>

                    {/* Viewer Ask Box */}
                    {!isHost && (
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={qnaInput}
                                onChange={(e) => setQnaInput(e.target.value)}
                                placeholder="Ask MS Dhoni something..."
                                className="flex-1 bg-[#18181b] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-all placeholder:text-gray-600 font-semibold"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAskQ(); }}
                            />
                            <button
                                onClick={handleAskQ}
                                className="bg-pink-600 hover:bg-pink-500 text-white font-black px-5 py-3 text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-pink-500/20"
                            >
                                Ask
                            </button>
                        </div>
                    )}

                    {/* Questions List */}
                    <div className="flex flex-col gap-3">
                        {qnaList.length === 0 ? (
                            <div className="text-center py-12 text-gray-600 text-sm font-semibold">
                                💬 No questions yet. Be the first to ask!
                            </div>
                        ) : (
                            qnaList.map((q) => {
                                const isBeingAnswered = answeringQuestion?.text === q.text;
                                return (
                                    <div 
                                        key={q.id} 
                                        className={`p-4 rounded-2xl border transition-all ${
                                            isBeingAnswered 
                                                ? 'bg-pink-950/20 border-pink-500/50 shadow-[0_4px_15px_rgba(219,39,119,0.2)]' 
                                                : q.answered 
                                                    ? 'bg-black/40 border-white/5 opacity-50' 
                                                    : 'bg-[#18181b] border-white/5 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            <span className="text-xs font-black text-pink-400">@{q.user}</span>
                                            {isBeingAnswered ? (
                                                <span className="text-[9px] font-black uppercase bg-pink-600 text-white px-2 py-0.5 rounded animate-pulse tracking-wider">Answering Live</span>
                                            ) : q.answered ? (
                                                <span className="text-[9px] font-bold uppercase bg-gray-800 text-gray-400 px-2 py-0.5 rounded tracking-wide">Answered</span>
                                            ) : (
                                                <span className="text-[9px] font-bold uppercase bg-white/5 text-gray-500 px-2 py-0.5 rounded tracking-wide">Pending</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-100 font-extrabold leading-relaxed">{q.text}</p>
                                        
                                        {/* Host controls */}
                                        {isHost && (
                                            <div className="flex gap-2.5 mt-4 pt-3 border-t border-white/5">
                                                <button
                                                    onClick={() => {
                                                        if (isBeingAnswered) {
                                                            if (setAnsweringQuestion) setAnsweringQuestion(null);
                                                            if (sendChatMessage && room?.liveMatchId) {
                                                                sendChatMessage(room.liveMatchId, "System", "[SYSTEM_REACTION]:QNA_STOP", "text-gray-500");
                                                            }
                                                        } else {
                                                            if (setAnsweringQuestion) setAnsweringQuestion({ user: q.user, text: q.text });
                                                            if (sendChatMessage && room?.liveMatchId) {
                                                                sendChatMessage(room.liveMatchId, "System", `[SYSTEM_REACTION]:QNA_ANSWER:${q.user}:${q.text}`, "text-gray-500");
                                                            }
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        isBeingAnswered 
                                                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                                            : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-500/20'
                                                    }`}
                                                >
                                                    {isBeingAnswered ? "Stop Answering" : "🎙️ Answer Live"}
                                                </button>
                                                {!q.answered && (
                                                    <button
                                                        onClick={() => {
                                                            if (setQnaList) {
                                                                setQnaList((prev: any) => prev.map((item: any) => item.id === q.id ? { ...item, answered: true } : item));
                                                            }
                                                            if (isBeingAnswered && setAnsweringQuestion) {
                                                                setAnsweringQuestion(null);
                                                                if (sendChatMessage && room?.liveMatchId) {
                                                                    sendChatMessage(room.liveMatchId, "System", "[SYSTEM_REACTION]:QNA_STOP", "text-gray-500");
                                                                }
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-[#202023] hover:bg-[#28282b] text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                                                    >
                                                        Done
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            );
        }
        case 'participants': {
            // Build real participant list:
            // 1. Jitsi participants (people actually in the video call)
            // 2. Anyone who has sent a chat message (backend-synced)
            const chatUsers = Array.from(
                new Set(
                    chats
                        .filter((m: any) => m.user && m.user !== 'System' && !m.text?.startsWith('[SYSTEM_REACTION]'))
                        .map((m: any) => m.user as string)
                )
            ).filter((u) => u !== userName); // exclude current user (shown separately)

            // Merge jitsi names + chat users, deduplicate by display name
            const jitsiNames = new Set((jitsiParticipants || []).map((p: any) => (p.displayName || p.formattedDisplayName || '').toLowerCase()));
            const chatOnlyUsers = chatUsers.filter(u => !jitsiNames.has(u.toLowerCase()));

            const totalCount = 1 + (jitsiParticipants?.length || 0) + chatOnlyUsers.length;

            return (
                <div className="w-full h-full flex flex-col p-4 overflow-y-auto">
                    <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Live Participants ({totalCount})
                    </h2>
                    <div className="flex flex-col gap-3">
                        {/* Current User (You) */}
                        <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-xl border border-pink-500/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center font-bold text-white text-xs">
                                    {userName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold">{userName} <span className="text-gray-500 font-normal">(You)</span></p>
                                    <p className="text-xs text-pink-400 uppercase tracking-wide">{userRole}</p>
                                </div>
                            </div>
                        </div>

                        {/* Real Jitsi Participants (in video call) */}
                        {jitsiParticipants && jitsiParticipants.map((p: any) => {
                            const displayName = p.displayName || p.formattedDisplayName || 'Viewer';
                            const initial = displayName.charAt(0).toUpperCase() || '?';
                            const isHostUser = displayName.toLowerCase().includes('host') || 
                                               (room?.hostUserId && (
                                                   displayName.toLowerCase() === room.hostUserId.toLowerCase() ||
                                                   p.email?.toLowerCase() === room.hostUserId.toLowerCase()
                                               )) || 
                                               displayName.toLowerCase() === room?.name?.split(' ')[0]?.toLowerCase();
                            
                            const coHostsList = room?.coHostUserId
                                ? room.coHostUserId.split(",").map((id: string) => id.trim().toLowerCase())
                                : [];
                            const isCoHostUser = coHostsList.some(
                                (id: string) =>
                                    displayName.toLowerCase() === id ||
                                    p.email?.toLowerCase() === id
                            );
                            const role = isHostUser ? 'Host' : (isCoHostUser ? 'Co-Host' : 'Viewer');
                            return (
                                <div key={p.id || p.displayName || Math.random()} className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xs">
                                            {initial}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-bold">{displayName}</p>
                                            <p className="text-xs text-blue-400 uppercase tracking-wide">{role}</p>
                                        </div>
                                    </div>
                                    {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
                                        <div className="flex gap-1.5">
                                            {(userRole === 'Host' || userRole === 'Co-Host') && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const fd = new FormData();
                                                            const currentCoHosts = room.coHostUserId
                                                                ? room.coHostUserId.split(",").map((id: string) => id.trim())
                                                                : [];
                                                            const userKey = (p.email && !p.email.toLowerCase().endsWith('@sportsfan360.com')) ? p.email : displayName;
                                                            
                                                            const isAlreadyCoHost = currentCoHosts.some(
                                                                (id: string) => id.toLowerCase() === userKey.toLowerCase()
                                                            );
                                                            
                                                            let newCoHosts: string[];
                                                            if (isAlreadyCoHost) {
                                                                newCoHosts = currentCoHosts.filter(
                                                                    (id: string) => id.toLowerCase() !== userKey.toLowerCase()
                                                                );
                                                            } else {
                                                                newCoHosts = [...currentCoHosts, userKey];
                                                            }
                                                            
                                                            const targetValue = newCoHosts.join(",");
                                                            fd.set('coHostUserId', targetValue);
                                                            const res = await fetch(`/api/watch-along/${room.id}`, {
                                                                method: 'PUT',
                                                                body: fd
                                                             });
                                                             if (res.ok) {
                                                                 alert(isAlreadyCoHost ? `${displayName} is no longer Co-Host!` : `${displayName} is now Co-Host!`);
                                                                 if (room.id) await fetchRoomById(room.id);
                                                             }
                                                        } catch (err) { console.error('Toggle Co-Host failed:', err); }
                                                    }}
                                                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all flex items-center gap-1 ${
                                                        isCoHostUser
                                                            ? 'bg-yellow-600 border-yellow-500 text-white'
                                                            : 'bg-[#222] hover:bg-yellow-600 border-[#444] text-white'
                                                    }`}
                                                    title={isCoHostUser ? "Remove Co-Host" : "Make Co-Host"}
                                                >
                                                    <Crown size={10} /> {isCoHostUser ? "Co-Host" : "Make Co-Host"}
                                                </button>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    if (jitsiApi) {
                                                        try {
                                                            jitsiApi.executeCommand('kickParticipant', p.id);
                                                        } catch (err) {
                                                            console.error('Jitsi kick failed:', err);
                                                        }
                                                    }
                                                    if (sendChatMessage && room?.liveMatchId) {
                                                        try {
                                                            await sendChatMessage(room.liveMatchId, "System", `[SYSTEM_REACTION]:KICK:${displayName}`, "text-red-500");
                                                        } catch (err) {
                                                            console.error('Broadcast kick failed:', err);
                                                        }
                                                    }
                                                }}
                                                className="px-3 py-1 bg-[#222] hover:bg-red-600 text-white text-xs font-semibold rounded-full border border-[#444] transition-all"
                                            >
                                                Kick
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Chat-derived participants (joined but not in Jitsi video) */}
                        {chatOnlyUsers.map((name: string) => (
                            <div key={name} className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                                <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center font-bold text-white text-xs">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold">{name}</p>
                                    <p className="text-xs text-green-400 uppercase tracking-wide">Viewer</p>
                                </div>
                            </div>
                        ))}

                        {/* Empty state — only shown if truly alone */}
                        {jitsiParticipants.length === 0 && chatOnlyUsers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <p className="text-gray-400 text-sm font-medium">Waiting for others to join...</p>
                                <p className="text-gray-600 text-xs mt-1">Share the room link to invite people</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        default: return null;
    }
}

export default function WatchRoom({ room, onBack }: Props) {
    const { 
        fetchMatchById, 
        currentMatch, 
        createPrediction, 
        createQuizQuestion, 
        predictions, 
        quizQuestions,
        chats,
        fetchChats,
        fetchPredictions,
        fetchQuizQuestions,
        sendChatMessage,
        fetchRoomById
    } = useWatchAlong();
    const [liveMatch, setLiveMatch] = useState<Match | null>(null);
    const [isLoadingMatch, setIsLoadingMatch] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'prediction' | 'polls' | 'flashQuiz' | 'liveChat' | 'emojiStorm' | 'participants' | 'qna'>('liveChat');
    
    // Real-time Jitsi states
    const [jitsiParticipants, setJitsiParticipants] = useState<any[]>([]);
    const jitsiApiRef = useRef<any>(null);
    const [jitsiApi, setJitsiApi] = useState<any>(null);
    const [micOn, setMicOn] = useState(true);
    const [vidOn, setVidOn] = useState(true);

    const toggleMic = () => {
        const api = jitsiApiRef.current || jitsiApi;
        if (api) {
            api.executeCommand('toggleAudio');
        } else {
            console.warn("toggleMic: Jitsi API not ready");
        }
    };

    const toggleVid = () => {
        const api = jitsiApiRef.current || jitsiApi;
        if (api) {
            api.executeCommand('toggleVideo');
        } else {
            console.warn("toggleVid: Jitsi API not ready");
        }
    };

    // Creation Modals Visibility
    const [showPredictionModal, setShowPredictionModal] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);

    // Dynamic draggable Resizable sidebar width states
    const [sidebarWidth, setSidebarWidth] = useState(400);
    const [isResizing, setIsResizing] = useState(false);

    const [composeOpen, setComposeOpen] = useState(false);
    const [composeType, setComposeType] = useState<string | null>(null);

    const handleComposePost = async (payload: any) => {
        try {
            const msgTypeMap: Record<string, string> = { prediction: "prediction", hot_take: "hottake", hottake: "hottake", debate: "debate", raw_reactions: "raw_reactions", post: "post", chat: "chat" };
            let mediaUrls: string[] = [];
            if (payload.mediaFiles?.length > 0) {
                mediaUrls = await Promise.all(payload.mediaFiles.map(async (file: File) => {
                    const fd = new FormData(); fd.append("file", file);
                    const r = await axios.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
                    return r.data.url;
                }));
            }
            const mappedType = msgTypeMap[payload.type] || "post";
            await axios.post(`/api/roar/rooms/${room.id || room.liveMatchId}/messages`, {
                text: payload.text, type: mappedType,
                mediaUrls: mediaUrls.length ? mediaUrls : undefined, sideA: payload.sideA, sideB: payload.sideB,
                predictionOptions: payload.predictionOptions,
                memGifUrl: payload.gifUrl ?? undefined, memTag: payload.sf360Tag ?? undefined,
                ...(payload.type === "prediction" && { closesAt: payload.closesAt, closeAfterMinutes: payload.closeAfterMinutes }),
            });
            setComposeOpen(false);
            setComposeType(null);
        } catch (e) {
            console.error(e);
        }
    };

    const startResize = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        if (!isResizing) return;
        const doResize = (e: MouseEvent) => {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 280 && newWidth <= 750) {
                setSidebarWidth(newWidth);
            }
        };
        const stopResize = () => {
            setIsResizing(false);
        };
        window.addEventListener("mousemove", doResize);
        window.addEventListener("mouseup", stopResize);
        return () => {
            window.removeEventListener("mousemove", doResize);
            window.removeEventListener("mouseup", stopResize);
        };
    }, [isResizing]);

    // Pinned Message state
    const [pinnedMessage, setPinnedMessage] = useState<string | null>("Welcome to the Live Watchroom! Stay tuned for host polls and flash quizzes.");

    // Creation Inputs
    const [predQ, setPredQ] = useState("");
    const [predA, setPredA] = useState("");
    const [predB, setPredB] = useState("");

    const [pollQ, setPollQ] = useState("");
    const [pollA, setPollA] = useState("");
    const [pollB, setPollB] = useState("");
    const [pollC, setPollC] = useState("");
    const [pollD, setPollD] = useState("");

    const [quizQ, setQuizQ] = useState("");
    const [quizA, setQuizA] = useState("");
    const [quizB, setQuizB] = useState("");
    const [quizC, setQuizC] = useState("");
    const [quizD, setQuizD] = useState("");
    const [quizAns, setQuizAns] = useState("A");
    const [quizTime, setQuizTime] = useState(15);
    const [quizPts, setQuizPts] = useState(100);

    const [pinText, setPinText] = useState("");
    const [submittingModal, setSubmittingModal] = useState(false);

    const { data: session, status } = useSession();
    const { user: authUser } = useAuth();
    
    // Auth and Roles
    const [userName, setUserName] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string>("Viewer");

    // New Expert/Sportscaster Experience States
    const [activeInterview, setActiveInterview] = useState<string | null>(null);
    const [activeDataDrop, setActiveDataDrop] = useState<string | null>(null);
    const [activeTacticalDrop, setActiveTacticalDrop] = useState<{ title: string; text: string } | null>(null);
    const [activeQnaSession, setActiveQnaSession] = useState<boolean>(true); // Active by default for the demo
    const [qnaList, setQnaList] = useState<Array<{ id: string; user: string; text: string; answered: boolean; timestamp: number }>>([
        { id: "q1", user: "Rohan K", text: "Do you think Rohit should bowl spinner from this end?", answered: false, timestamp: Date.now() - 30000 },
        { id: "q2", user: "Tushar S", text: "Virat's strike rate vs Bumrah seems low. Is he playing safe?", answered: false, timestamp: Date.now() - 15000 },
        { id: "q3", user: "Ananya M", text: "Strategic timeout: Will they aim for 180 or 200+ here?", answered: false, timestamp: Date.now() - 5000 }
    ]);
    const [answeringQuestion, setAnsweringQuestion] = useState<{ user: string; text: string } | null>(null);
    
    // Menu toggles
    const [showPredictTemplates, setShowPredictTemplates] = useState(false);
    const [showDropsMenu, setShowDropsMenu] = useState(false);
    const [showInterviewMenu, setShowInterviewMenu] = useState(false);
    const [showTacticalModal, setShowTacticalModal] = useState(false);
    const [tacticalTitle, setTacticalTitle] = useState("Analyze Captain's Move");
    const [tacticalText, setTacticalText] = useState("");
    const [qnaInput, setQnaInput] = useState("");

    // Confetti State
    const [confettiTrigger, setConfettiTrigger] = useState(0);
    const [confettiText, setConfettiText] = useState("");

    // Floating emoji overlays for smaller reactions (Fire, Clap, Heart)
    const [floatingReactions, setFloatingReactions] = useState<{id: number; emoji: string; x: number}[]>([]);
    const floatCounter = useRef(0);

    // Telestrator states
    const [isTelestratorActive, setIsTelestratorActive] = useState(false);
    const [telestratorStrokes, setTelestratorStrokes] = useState<Stroke[]>([]);

    const spawnFloatingEmoji = (emoji: string) => {
        const id = ++floatCounter.current;
        const x = 20 + Math.random() * 60;
        setFloatingReactions(prev => [...prev, { id, emoji, x }]);
        setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2500);
    };

    // Timed, full-screen collective reaction event (Emoji Storm)
    const [stormState, setStormState] = useState<'idle' | 'countdown' | 'active' | 'summary'>('idle');
    const [stormDuration, setStormDuration] = useState<number>(6); // Default 6 seconds
    const [stormTimeLeft, setStormTimeLeft] = useState<number>(6);
    const [stormCountdownVal, setStormCountdownVal] = useState<number>(3);
    const [stormFloating, setStormFloating] = useState<{ id: number; emoji: string; x: number; rot: number; speed: number; scale: number; opacity: number }[]>([]);
    const [stormLocalTaps, setStormLocalTaps] = useState<number>(0);
    const [stormTotalTaps, setStormTotalTaps] = useState<number>(0);
    const [stormLeaderboard, setStormLeaderboard] = useState<{ name: string; count: number }[]>([]);
    const [showEmojiStormHostModal, setShowEmojiStormHostModal] = useState(false);

    const stormStateRef = useRef(stormState);
    useEffect(() => {
        stormStateRef.current = stormState;
    }, [stormState]);

    // Countdown timer effect
    useEffect(() => {
        if (stormState !== 'countdown') return;

        setStormCountdownVal(3);
        const timer = setInterval(() => {
            setStormCountdownVal(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStormState('active');
                    setStormTimeLeft(stormDuration);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [stormState, stormDuration]);

    // Active storm timer effect
    useEffect(() => {
        if (stormState !== 'active') return;

        const timer = setInterval(() => {
            setStormTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setStormState('summary');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [stormState]);

    // Simulated background emojis during active storm
    useEffect(() => {
        if (stormState !== 'active') return;

        const emojis = ["🔥", "💪", "😱", "🏏", "👏", "🎉", "❤️", "🚀"];
        const interval = setInterval(() => {
            const count = 1 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                const id = Math.random() + Date.now();
                const x = 5 + Math.random() * 90;
                const rot = -30 + Math.random() * 60;
                const speed = 1.5 + Math.random() * 2;
                const scale = 0.8 + Math.random() * 0.6;
                const opacity = 0.6 + Math.random() * 0.4;
                
                setStormFloating(prev => [...prev, { id, emoji: randomEmoji, x, rot, speed, scale, opacity }]);
                setTimeout(() => {
                    setStormFloating(prev => prev.filter(f => f.id !== id));
                }, 3000);
            }
            setStormTotalTaps(prev => prev + count);
        }, 250);

        return () => clearInterval(interval);
    }, [stormState]);

    // Summary screen effect (leaderboard)
    useEffect(() => {
        if (stormState !== 'summary') return;

        // Generate leaderboard based on local taps and participant info
        const list = [
            { name: userName || "You", count: stormLocalTaps },
            { name: jitsiParticipants[0]?.displayName || "Chandu", count: Math.floor(stormLocalTaps * 0.7) + 5 },
            { name: jitsiParticipants[1]?.displayName || "Rohan", count: Math.floor(stormLocalTaps * 0.5) + 3 }
        ].sort((a, b) => b.count - a.count);

        list.forEach((item, index) => {
            if (item.count === 0) {
                item.count = [42, 28, 15][index];
            }
        });

        setStormLeaderboard(list);

        const timer = setTimeout(() => {
            setStormState('idle');
            setStormFloating([]);
            setStormLocalTaps(0);
            setStormTotalTaps(0);
        }, 5000);

        return () => clearTimeout(timer);
    }, [stormState, stormLocalTaps, jitsiParticipants, userName]);

    const handleStormTap = (emoji: string) => {
        setStormLocalTaps(prev => prev + 1);
        
        // Spawn emoji locally
        const id = Math.random() + Date.now();
        const x = 10 + Math.random() * 80;
        const rot = -20 + Math.random() * 40;
        const speed = 2 + Math.random() * 1.5;
        const scale = 1.2 + Math.random() * 0.4;
        const opacity = 1;
        
        setStormFloating(prev => [...prev, { id, emoji, x, rot, speed, scale, opacity }]);
        setTimeout(() => {
            setStormFloating(prev => prev.filter(f => f.id !== id));
        }, 3000);

        // Broadcast to other participants
        if (jitsiApiRef.current) {
            try {
                jitsiApiRef.current.executeCommand('sendEndpointTextMessage', '', `REACTION:STORM_TAP:${emoji}`);
            } catch (err) {
                console.error("Failed to broadcast storm tap:", err);
            }
        }
    };

    const startEmojiStorm = (duration: number) => {
        setShowEmojiStormHostModal(false);
        triggerMoment(`STORM_START:${duration}`, true);
    };

    // Big moments that deserve full confetti — smaller reactions show floating emoji
    const CONFETTI_MOMENTS = new Set(['WICKET', 'SIX', 'GOAL', 'FOUR', 'DRUMROLL']);
    // Emoji map for float-up reactions
    const FLOAT_EMOJI_MAP: Record<string, string> = { FIRE: '🔥', CLAP: '👏', HEART: '❤️' };
    const EMOJI_OPTIONS = ["🔥", "👏", "❤️"];

    const triggerMoment = (momentType: string, broadcast = true) => {
        if (momentType.startsWith("STORM_START:")) {
            const duration = parseInt(momentType.replace("STORM_START:", "")) || 10;
            setStormDuration(duration);
            setStormState('countdown');
        } else if (momentType.startsWith("STORM_TAP:")) {
            const emoji = momentType.replace("STORM_TAP:", "");
            if (stormStateRef.current === 'active') {
                const id = Math.random() + Date.now();
                const x = 5 + Math.random() * 90;
                const rot = -30 + Math.random() * 60;
                const speed = 1.6 + Math.random() * 1.8;
                const scale = 0.9 + Math.random() * 0.5;
                const opacity = 0.8;
                setStormFloating(prev => [...prev, { id, emoji, x, rot, speed, scale, opacity }]);
                setTimeout(() => {
                    setStormFloating(prev => prev.filter(f => f.id !== id));
                }, 3000);
                setStormTotalTaps(prev => prev + 1);
            }
        } else if (momentType.startsWith("QNA_ANSWER:")) {
            const parts = momentType.replace("QNA_ANSWER:", "").split(":");
            const user = parts[0];
            const text = parts.slice(1).join(":");
            setAnsweringQuestion({ user, text });
        } else if (momentType === "QNA_STOP") {
            setAnsweringQuestion(null);
        } else if (momentType.startsWith("TACTICAL_DROP:")) {
            const parts = momentType.replace("TACTICAL_DROP:", "").split(":");
            const title = parts[0];
            const text = parts.slice(1).join(":");
            setActiveTacticalDrop({ title, text });
        } else if (momentType === "TACTICAL_CLEAR") {
            setActiveTacticalDrop(null);
        } else if (momentType.startsWith("INTERVIEW_START:")) {
            const guest = momentType.replace("INTERVIEW_START:", "");
            setActiveInterview(guest);
        } else if (momentType === "INTERVIEW_STOP") {
            setActiveInterview(null);
        } else if (momentType.startsWith("DATA_DROP:")) {
            const drop = momentType.replace("DATA_DROP:", "");
            setActiveDataDrop(drop);
        } else if (momentType === "DATA_CLEAR") {
            setActiveDataDrop(null);
        } else if (momentType.startsWith("TEL_DRAW:")) {
            try {
                const stroke = JSON.parse(momentType.replace("TEL_DRAW:", ""));
                setTelestratorStrokes(prev => [...prev, stroke]);
            } catch (err) {
                console.error("Failed to parse telestrator draw stroke:", err);
            }
        } else if (momentType === "TEL_UNDO") {
            setTelestratorStrokes(prev => prev.slice(0, -1));
        } else if (momentType === "TEL_CLEAR") {
            setTelestratorStrokes([]);
        } else if (momentType.startsWith("TEL_TOGGLE:")) {
            const active = momentType.replace("TEL_TOGGLE:", "") === "true";
            setIsTelestratorActive(active);
            if (!active) setTelestratorStrokes([]);
        } else if (CONFETTI_MOMENTS.has(momentType)) {
            setConfettiText(momentType);
            setConfettiTrigger(prev => prev + 1);
            if (momentType === "DRUMROLL") {
                const audio = new Audio('/sounds/drumroll.mp3');
                audio.play().catch((err) => console.log("Audio play blocked by browser:", err));
                // Snappy fade out after 1.2 seconds to keep it perfectly balanced
                setTimeout(() => {
                    const fadeInterval = setInterval(() => {
                        if (audio.volume > 0.1) {
                            audio.volume = Math.max(0, audio.volume - 0.2);
                        } else {
                            clearInterval(fadeInterval);
                            audio.pause();
                            audio.currentTime = 0;
                        }
                    }, 40);
                }, 1200);
            }
        } else if (FLOAT_EMOJI_MAP[momentType]) {
            spawnFloatingEmoji(FLOAT_EMOJI_MAP[momentType]);
        }
        if (broadcast) {
            // 1. Send via Jitsi WebRTC endpoint messages for participants who are fully connected
            if (jitsiApiRef.current) {
                try {
                    jitsiApiRef.current.executeCommand('sendEndpointTextMessage', '', `REACTION:${momentType}`);
                    const participants = jitsiApiRef.current.getParticipantsInfo() || [];
                    participants.forEach((p: any) => {
                        if (p.id) {
                            jitsiApiRef.current.executeCommand('sendEndpointTextMessage', p.id, `REACTION:${momentType}`);
                        }
                    });
                } catch (err) {
                    console.error("Failed to broadcast reaction via Jitsi:", err);
                }
            }
            
            // 2. Send as a robust backend-synced system reaction message so all spectators see it instantly
            if (room?.liveMatchId) {
                try {
                    sendChatMessage(room.liveMatchId, "System", `[SYSTEM_REACTION]:${momentType}`, "text-gray-500");
                } catch (err) {
                    console.error("Failed to send system reaction chat message:", err);
                }
            }
        }
    };

    const handleCreatePrediction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!predQ || !predA || !predB) return;
        setSubmittingModal(true);
        try {
            await createPrediction(room.liveMatchId, {
                question: predQ,
                options: [predA, predB],
                closesAt: Date.now() + 120000 // 2 minutes
            });
            setShowPredictionModal(false);
            setPredQ("");
            setPredA("");
            setPredB("");
            setActiveTab("prediction");
        } catch (error) {
            console.error("Create prediction error:", error);
        } finally {
            setSubmittingModal(false);
        }
    };

    const handleQuickPrediction = async (question: string, options: string[]) => {
        try {
            await createPrediction(room.liveMatchId, {
                question,
                options: options.filter(Boolean),
                closesAt: Date.now() + 300000 // 5 minutes closesAt timer
            });
            if (sendChatMessage && room?.liveMatchId) {
                sendChatMessage(room.liveMatchId, "System", `🔮 Prediction live: "${question}"! Tap the Predictions tab to answer.`, "text-pink-400 font-extrabold");
            }
            triggerMoment("FIRE"); // Fire flurry!
            setActiveTab("prediction");
            setShowPredictTemplates(false);
        } catch (err) {
            console.error("Quick prediction failed:", err);
        }
    };

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pollQ || !pollA || !pollB) return;
        setSubmittingModal(true);
        try {
            await createPrediction(room.liveMatchId, {
                question: `[Poll] ${pollQ}`,
                options: [pollA, pollB, ...(pollC ? [pollC] : []), ...(pollD ? [pollD] : [])],
                closesAt: Date.now() + 180000 // 3 minutes
            });
            setShowPollModal(false);
            setPollQ("");
            setPollA("");
            setPollB("");
            setPollC("");
            setPollD("");
            setActiveTab("polls");
        } catch (error) {
            console.error("Create poll error:", error);
        } finally {
            setSubmittingModal(false);
        }
    };

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quizQ || !quizA || !quizB || !quizC || !quizD) return;
        setSubmittingModal(true);
        let correctText = quizA;
        if (quizAns === "B") correctText = quizB;
        else if (quizAns === "C") correctText = quizC;
        else if (quizAns === "D") correctText = quizD;

        try {
            await createQuizQuestion(room.liveMatchId, {
                question: quizQ,
                options: [quizA, quizB, quizC, quizD],
                correctAnswer: correctText,
                timerSeconds: quizTime,
                points: quizPts
            });
            setShowQuizModal(false);
            setQuizQ("");
            setQuizA("");
            setQuizB("");
            setQuizC("");
            setQuizD("");
            setQuizAns("A");
            setQuizTime(15);
            setQuizPts(100);
            setActiveTab("flashQuiz");
        } catch (error) {
            console.error("Create quiz error:", error);
        } finally {
            setSubmittingModal(false);
        }
    };

    const handlePinMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pinText) return;
        setPinnedMessage(pinText);
        setShowPinModal(false);
        setPinText("");
    };

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            triggerMoment("LINK COPIED");
            alert("Link Copied Successfully!")
        }
    };

    const handleEmojiStorm = () => {
        startEmojiStorm(6);
    };

    // Scroll to top on mount to prevent Jitsi iframe autofocus from jumping page
    useEffect(() => {
        if (typeof window === "undefined") return;
        // Just scroll to top once on mount — do NOT lock or intercept further scrolls
        window.scrollTo(0, 0);
    }, []);

    // Parent-level polling for chats, predictions, and quiz questions to sync spectator tabs in real-time
    useEffect(() => {
        if (!room?.liveMatchId) return;

        // Fetch immediately on mount
        fetchChats(room.liveMatchId, 100);
        fetchPredictions(room.liveMatchId, false);
        fetchQuizQuestions(room.liveMatchId, false);
        if (room.id) fetchRoomById(room.id);

        // Parent-level sync every 2 seconds for flawless, real-time spectator synchronization
        const interval = setInterval(() => {
            fetchChats(room.liveMatchId, 100);
            fetchPredictions(room.liveMatchId, false);
            fetchQuizQuestions(room.liveMatchId, false);
            if (room.id) fetchRoomById(room.id);
        }, 2000);

        return () => clearInterval(interval);
    }, [room?.liveMatchId, room?.id, fetchChats, fetchPredictions, fetchQuizQuestions, fetchRoomById]);

    // System-wide reactions sync via hidden chat events
    const processedChatReactions = useRef<Set<string>>(new Set());
    const hasLoadedInitialChats = useRef(false);
    const mountTime = useRef<number>(Date.now());

    useEffect(() => {
        if (!chats || chats.length === 0) return;

        // If we haven't marked the initial chats yet, add all existing IDs to the set
        if (!hasLoadedInitialChats.current) {
            chats.forEach((msg: any) => {
                processedChatReactions.current.add(msg.id);
            });
            hasLoadedInitialChats.current = true;
            return;
        }

        // For subsequent updates, check for any new system reactions
        chats.forEach((msg: any) => {
            if (msg.text?.startsWith('[SYSTEM_REACTION]:') && !processedChatReactions.current.has(msg.id)) {
                processedChatReactions.current.add(msg.id);
                
                // Only process reactions that were sent AFTER the room was mounted
                const msgTime = msg.createdAt 
                    ? (typeof msg.createdAt === 'number' 
                        ? msg.createdAt 
                        : (msg.createdAt.seconds 
                            ? msg.createdAt.seconds * 1000 
                            : new Date(msg.createdAt).getTime()))
                    : Date.now();
                if (msgTime < mountTime.current - 3000) {
                    return;
                }

                const reactionType = msg.text.replace('[SYSTEM_REACTION]:', '');
                
                if (reactionType.startsWith('KICK:')) {
                    const kickedName = reactionType.replace('KICK:', '').trim().toLowerCase();
                    const currentLowerName = userName?.trim().toLowerCase();
                    if (currentLowerName && kickedName === currentLowerName) {
                        alert("You have been removed from the watchroom by the host.");
                        onBack();
                    }
                } else {
                    // Play reaction animation locally without re-broadcasting
                    triggerMoment(reactionType, false);
                }
            }
        });
    }, [chats, userName, onBack]);

    // Request camera/mic permissions at the parent level on mount to ensure iOS Safari 
    // authorizes the domain before loading the Jitsi cross-origin iframe.
    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                .then(stream => {
                    // Immediately stop the tracks to release the hardware devices
                    stream.getTracks().forEach(track => track.stop());
                })
                .catch(err => {
                    console.warn("Parent-level media permission request was declined or failed:", err);
                });
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);
        
        const isUserLoggedIn = status === "authenticated" || !!authUser;
        const actualName = authUser?.name || session?.user?.name;
        
        let resolvedName = "Anonymous";
        let resolvedUserId = "";
        let resolvedEmail = "";

        if (isUserLoggedIn && actualName) {
            resolvedName = actualName;
            resolvedUserId = authUser?.userId || (session?.user as { userId?: string })?.userId || session?.user?.id || "";
            resolvedEmail = authUser?.email || session?.user?.email || "";
            setUserName(actualName);
        } else {
            const stored = typeof window !== "undefined" ? localStorage.getItem("watchalong_user_name") : null;
            const guestName = stored || `Viewer_${Math.floor(100 + Math.random() * 900)}`;
            if (typeof window !== "undefined" && !stored) {
                localStorage.setItem("watchalong_user_name", guestName);
            }
            resolvedName = guestName;
            setUserName(guestName);
        }

        // Resolve user's role based on unified case-insensitive matching
        let isHost = false;
        let isCoHost = false;

        const normalizedCoHostId = room.coHostUserId?.toLowerCase()?.trim() || "";
        const normalizedHostId = room.hostUserId?.toLowerCase()?.trim() || "";

        const myName = resolvedName.toLowerCase().trim();
        const myUserId = resolvedUserId.toLowerCase().trim();
        const myEmail = resolvedEmail.toLowerCase().trim();

        // 1. Host check
        if (normalizedHostId) {
            if (myUserId === normalizedHostId || myName === normalizedHostId || myEmail === normalizedHostId) {
                isHost = true;
            }
        } else {
            const matchName = room.name ? room.name.split(" ")[0].toLowerCase().trim() : "";
            if (matchName && myName.includes(matchName)) {
                isHost = true;
            }
        }

        // 2. Co-Host check
        if (normalizedCoHostId) {
            const coHostsList = normalizedCoHostId.split(",").map(item => item.trim());
            if (coHostsList.includes(myUserId) || coHostsList.includes(myName) || coHostsList.includes(myEmail)) {
                isCoHost = true;
            }
        }

        // Assign resolved role
        if (isHost) {
            setUserRole("Host");
        } else if (isCoHost) {
            setUserRole("Co-Host");
        } else {
            setUserRole("Viewer");
        }

        // Demo Role Override (only apply if the user is not actively promoted to Co-Host in real-time)
        const demoRoleOverride = typeof window !== 'undefined' ? sessionStorage.getItem("demo_user_role") : null;
        if (demoRoleOverride && !isCoHost) {
            setUserRole(demoRoleOverride);
        }
    }, [status, session, authUser, room.id, room.hostUserId, room.coHostUserId, room.name]);


    // Fetch match details when room has liveMatchId
    useEffect(() => {
        const loadMatch = async () => {
            if (room?.liveMatchId && !liveMatch) {
                setIsLoadingMatch(true);
                try {
                    await fetchMatchById(room.liveMatchId);
                } catch (error) {
                    console.error("Failed to fetch match:", error);
                } finally {
                    setIsLoadingMatch(false);
                }
            }
        };

        loadMatch();
    }, [room?.liveMatchId, fetchMatchById, liveMatch]);

    // Update local match state when currentMatch changes
    useEffect(() => {
        if (currentMatch?.id === room?.liveMatchId) {
            setLiveMatch(currentMatch);
        }
    }, [currentMatch, room?.liveMatchId]);

    // Get user initials for avatar
    const getUserInitials = (name: string) => {
        if (!name) return "??";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    // Format overs display
    const formatOvers = (overs: string) => {
        if (!overs) return "0.0 ov";
        return overs;
    };

    // Access Denied logic has been moved to PreJoinLobby.tsx

    // Tab calculations
    const activePredictionsCount = predictions?.filter(p => p.isOpen && !p.question.startsWith("[Poll] ")).length || 0;
    const activePollsCount = predictions?.filter(p => p.isOpen && p.question.startsWith("[Poll] ")).length || 0;
    const activeQuizCount = quizQuestions?.filter(q => q.isActive).length || 0;

    const totalPredictionsCount = predictions?.filter(p => !p.question.startsWith("[Poll] ")).length || 0;
    const totalPollsCount = predictions?.filter(p => p.question.startsWith("[Poll] ")).length || 0;
    const totalQuizCount = quizQuestions?.length || 0;

    // Merge jitsi names + chat users to calculate total participant count dynamically
    const jitsiNames = new Set((jitsiParticipants || []).map((p: any) => (p.displayName || p.formattedDisplayName || '').toLowerCase()));
    const chatUsersList = Array.from(
        new Set(
            (chats || [])
                .filter((c) => c.user && c.user.trim() !== "")
                .map((c) => c.user)
        )
    ).filter((u) => u !== userName);
    const chatOnlyUsers = chatUsersList.filter(u => !jitsiNames.has(u.toLowerCase()));
    const dynamicParticipantsCount = 1 + (jitsiParticipants?.length || 0) + chatOnlyUsers.length;

    const sidebarTabs = [
        { id: 'liveChat', label: 'Live Chat' },
        // Only show these tabs when the host has actually created content
        ...(totalPredictionsCount > 0 ? [{ id: 'prediction', label: activePredictionsCount > 0 ? `Prediction (${activePredictionsCount})` : 'Prediction' }] : []),
        ...(totalPollsCount > 0 ? [{ id: 'polls', label: activePollsCount > 0 ? `Polls (${activePollsCount})` : 'Polls' }] : []),
        ...(totalQuizCount > 0 ? [{ id: 'flashQuiz', label: activeQuizCount > 0 ? `Quiz (${activeQuizCount})` : 'Quiz' }] : []),
        { id: 'participants', label: `Participants (${dynamicParticipantsCount})` }
    ];

    // Tab safety: fallback if activeTab is not in sidebarTabs list (e.g. if deleted or hidden)
    useEffect(() => {
        const isTabAvailable = sidebarTabs.some(tab => tab.id === activeTab);
        if (!isTabAvailable) {
            setActiveTab('liveChat');
        }
    }, [predictions, quizQuestions, activeTab, jitsiParticipants, chats]);

    // Show loading state while room is being loaded
    if (!room) {
        return (
            <div className="min-h-screen bg-[#111] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] lg:h-screen bg-[#111] text-white font-sans flex flex-col overflow-hidden lg:overflow-hidden">
            <ConfettiWrapper trigger={confettiTrigger} text={confettiText} />

            {/* Floating emoji overlay for small reactions */}
            <div className="fixed inset-0 pointer-events-none z-[90]">
                {floatingReactions.map(r => (
                    <span
                        key={r.id}
                        className="absolute text-4xl animate-float-up select-none"
                        style={{ left: `${r.x}%`, bottom: '30%' }}
                    >
                        {r.emoji}
                    </span>
                ))}
            </div>
            <style>{`
                @keyframes float-up {
                    0%   { transform: translateY(0) scale(1); opacity: 1; }
                    80%  { transform: translateY(-180px) scale(1.3); opacity: 0.8; }
                    100% { transform: translateY(-220px) scale(0.8); opacity: 0; }
                }
                .animate-float-up { animation: float-up 2.5s ease-out forwards; }

                @keyframes storm-float {
                    0% {
                        transform: translateY(100vh) rotate(0deg) scale(0.6);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-20vh) rotate(var(--rot)) scale(var(--scale));
                        opacity: 0;
                    }
                }
                .animate-storm-float {
                    animation: storm-float 3s linear forwards;
                }

                @keyframes pulse-countdown {
                    0% { transform: scale(0.6); opacity: 0; }
                    50% { transform: scale(1.3); opacity: 1; }
                    100% { transform: scale(1); opacity: 0; }
                }
                .animate-pulse-countdown {
                    animation: pulse-countdown 1s ease-in-out infinite;
                }
            `}</style>

            {/* ── Shared header ── */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b border-[#222]">
                <Link href="/MainModules/WatchAlong">
                    <button
                        className="text-white hover:text-pink-500 transition cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </Link>
                <div className="flex flex-1 items-center gap-2 mx-4 min-w-0 justify-center">
                    {room.isLive && (
                        <span className="bg-pink-600 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                            LIVE
                        </span>
                    )}
                    <span className="text-sm font-bold truncate">{room.name || "Watch Room"}</span>
                </div>
                <div className="flex items-center gap-2">

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600/10 border border-pink-500/30 hover:bg-pink-600/20 active:scale-95 text-pink-400 hover:text-pink-300 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.15)] hover:shadow-[0_0_20px_rgba(236,72,153,0.25)] cursor-pointer"
                        title="Copy Invite Link"
                    >
                        <Share2 size={13} className="animate-pulse" />
                        <span>Share</span>
                    </button>
                </div>

            </div>

            {/* ── Score bar ── */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 border-b border-[#222]">
                {isLoadingMatch ? (
                    <>
                        <span className="text-sm text-gray-400">Loading match...</span>
                        <span className="text-[11px] text-gray-500">-</span>
                        <span className="text-[11px] text-gray-500">-</span>
                        <span className="text-sm text-gray-400">...</span>
                    </>
                ) : liveMatch ? (
                    <>
                        <span className="text-sm font-bold text-pink-500">
                            {liveMatch.team1?.name || "TBD"}&nbsp;{liveMatch.team1?.score || "0/0"}
                        </span>
                        <span className="text-[11px] text-gray-500">
                            {formatOvers(liveMatch.team1?.overs)}
                        </span>
                        <span className="text-[11px] text-gray-500">
                            {formatOvers(liveMatch.team2?.overs)}
                        </span>
                        <span className="text-sm font-bold text-blue-500">
                            {liveMatch.team2?.score || "0/0"}&nbsp;{liveMatch.team2?.name || "TBD"}
                        </span>
                    </>
                ) : (
                    <>
                        <span className="text-sm font-bold text-pink-500">Waiting for match data...</span>
                        <span className="text-[11px] text-gray-500">-</span>
                        <span className="text-[11px] text-gray-500">-</span>
                        <span className="text-sm font-bold text-blue-400">...</span>
                    </>
                )}
            </div>

            {/* ── Top Host CTA Panel ── */}
            {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
                <div className="bg-[#0c0c0e] shrink-0 border-b border-[#222]">

                    {/* ── MOBILE: compact scrollable icon+label cards (like SS2) ── */}
                    <div className="lg:hidden px-2 py-1.5">
                        <div className="flex items-center gap-1 text-[8px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5 px-0.5">
                            <span>🛡️ Host Actions</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                            <button onClick={() => setShowPredictionModal(true)} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a22] border border-white/8 text-pink-400 flex items-center justify-center group-active:scale-90 transition-all">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 group-active:text-white whitespace-nowrap">Prediction</span>
                            </button>
                            <button onClick={() => { setComposeType('debate'); setComposeOpen(true); }} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a22] border border-white/8 text-red-400 flex items-center justify-center group-active:scale-90 transition-all">
                                    <Flame className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 group-active:text-white whitespace-nowrap">Debate</span>
                            </button>
                            <button onClick={() => setShowPollModal(true)} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a22] border border-white/8 text-blue-400 flex items-center justify-center group-active:scale-90 transition-all">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 group-active:text-white whitespace-nowrap">Poll</span>
                            </button>
                            <button onClick={() => setShowQuizModal(true)} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a22] border border-white/8 text-purple-400 flex items-center justify-center group-active:scale-90 transition-all">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 group-active:text-white whitespace-nowrap">Flash Quiz</span>
                            </button>
                            <button onClick={() => { setShowPredictTemplates(true); setShowDropsMenu(false); setShowInterviewMenu(false); }} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a22] border border-white/8 text-orange-400 flex items-center justify-center group-active:scale-90 transition-all">
                                    <span className="text-lg">🎯</span>
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 group-active:text-white whitespace-nowrap">Templates</span>
                            </button>
                            <button onClick={handleEmojiStorm} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a22] border border-white/8 text-yellow-400 flex items-center justify-center group-active:scale-90 transition-all">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 group-active:text-white whitespace-nowrap">Emoji Storm</span>
                            </button>
                            <button onClick={() => setShowPinModal(true)} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a22] border border-white/8 text-red-400 flex items-center justify-center group-active:scale-90 transition-all">
                                    <Pin className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 group-active:text-white whitespace-nowrap">Pin Message</span>
                            </button>
                            <button onClick={handleShare} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a22] border border-white/8 text-gray-400 flex items-center justify-center group-active:scale-90 transition-all">
                                    <MoreHorizontal className="w-5 h-5" />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 group-active:text-white whitespace-nowrap">More</span>
                            </button>
                        </div>
                    </div>

                    {/* ── DESKTOP: full-width horizontal strip (unchanged) ── */}
                    <div className="hidden lg:flex items-center justify-between w-full gap-2 px-3 py-1.5">
                        <button onClick={() => setShowPredictionModal(true)} className="flex flex-1 items-center justify-center gap-2 px-2 py-2 rounded-xl bg-pink-600/10 border border-pink-500/20 text-pink-400 hover:bg-pink-600/20 hover:border-pink-500/40 active:scale-95 transition-all cursor-pointer group">
                            <TrendingUp className="w-4 h-4 shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wide whitespace-nowrap">Create Prediction</span>
                        </button>
                        <button onClick={() => setShowPollModal(true)} className="flex flex-1 items-center justify-center gap-2 px-2 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/40 active:scale-95 transition-all cursor-pointer group">
                            <BarChart3 className="w-4 h-4 shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wide whitespace-nowrap">Create Poll</span>
                        </button>
                        <button onClick={() => setShowQuizModal(true)} className="flex flex-1 items-center justify-center gap-2 px-2 py-2 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600/20 hover:border-purple-500/40 active:scale-95 transition-all cursor-pointer group">
                            <Brain className="w-4 h-4 shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wide whitespace-nowrap">Flash Quiz</span>
                        </button>
                        <button onClick={() => { setShowPredictTemplates(true); setShowDropsMenu(false); setShowInterviewMenu(false); }} className="flex flex-1 items-center justify-center gap-2 px-2 py-2 rounded-xl bg-orange-600/10 border border-orange-500/20 text-orange-400 hover:bg-orange-600/20 hover:border-orange-500/40 active:scale-95 transition-all cursor-pointer group">
                            <span className="text-[14px] leading-none">🎯</span>
                            <span className="text-[10px] font-black uppercase tracking-wide whitespace-nowrap">Predict Templates</span>
                        </button>
                        <button onClick={handleEmojiStorm} className="flex flex-1 items-center justify-center gap-2 px-2 py-2 rounded-xl bg-yellow-600/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-600/20 hover:border-yellow-500/40 active:scale-95 transition-all cursor-pointer group">
                            <Zap className="w-4 h-4 shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wide whitespace-nowrap">Emoji Storm</span>
                        </button>
                        <button onClick={() => setShowPinModal(true)} className="flex flex-1 items-center justify-center gap-2 px-2 py-2 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 hover:border-red-500/40 active:scale-95 transition-all cursor-pointer group">
                            <Pin className="w-4 h-4 shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wide whitespace-nowrap">Pin Message</span>
                        </button>
                        <button onClick={handleShare} className="flex flex-1 items-center justify-center gap-2 px-2 py-2 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600/20 hover:border-purple-500/40 active:scale-95 transition-all cursor-pointer group">
                            <Share2 className="w-4 h-4 shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wide whitespace-nowrap">Share</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row flex-1 min-h-0">

                {/* ── LEFT: video + action tabs ── */}
                <div className="flex flex-col flex-1 lg:min-w-0 overflow-y-auto">

                    {/* Video player */}
                    <div className="relative w-full aspect-video bg-[#1a0a14] overflow-hidden shrink-0">
                        {liveMatch?.videoUrl ? (
                            <>
                                <VideoPlayer
                                    key={liveMatch.videoUrl}
                                    videoUrl={liveMatch.videoUrl}
                                    isLive={liveMatch.isLive}
                                />
                                {/* Q&A Spotlight Banner */}
                                {answeringQuestion && (
                                    <div className="absolute top-4 left-4 right-4 bg-gradient-to-r from-pink-600/90 to-rose-600/90 backdrop-blur-md border border-pink-400/40 rounded-2xl p-4 z-30 shadow-[0_10px_35px_rgba(219,39,119,0.45)] animate-in slide-in-from-top duration-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-pink-100 bg-white/20 px-2 py-0.5 rounded">🎙️ answering live</span>
                                        </div>
                                        <p className="text-xs text-white/80 font-black">@{answeringQuestion.user} asks:</p>
                                        <p className="text-sm font-black text-white mt-1 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                                            &ldquo;{answeringQuestion.text}&rdquo;
                                        </p>
                                    </div>
                                )}
                                {/* Tactical Chalkboard Overlay */}
                                {activeTacticalDrop && (
                                    <div className="absolute inset-x-4 bottom-4 bg-[#0a0f18]/95 border border-blue-500/40 rounded-2xl p-4 z-30 shadow-[0_12px_40px_rgba(59,130,246,0.3)] animate-in slide-in-from-bottom duration-300 pointer-events-auto">
                                        <div className="flex items-center justify-between border-b border-blue-500/20 pb-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">🧠 Match Intelligence</span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setActiveTacticalDrop(null)}
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-wider">{activeTacticalDrop.title}</h4>
                                        <p className="text-xs text-gray-200 mt-1.5 leading-relaxed font-bold border-l-2 border-blue-500 pl-3">
                                            &ldquo;{activeTacticalDrop.text}&rdquo;
                                        </p>
                                    </div>
                                )}

                            </>
                        ) : (
                            <div className="absolute inset-0 w-full h-full">
                                <img
                                    src="/images/watchalong_welcome.jpg"
                                    alt="Welcome to Watchalong!"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Team 1 label */}
                        {liveMatch && (
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-700 rounded-lg px-3 py-1.5 text-xs font-bold opacity-90 z-20">
                                {liveMatch.team1?.name || "Team 1"}
                            </div>
                        )}

                        {/* Team 2 label */}
                        {liveMatch && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                                <div className={`rounded-lg border-2 ${room.borderColor || "border-pink-500"} bg-[#111] px-2 py-1.5 flex items-center justify-center text-xs font-bold text-blue-400`}>
                                    {liveMatch.team2?.name?.slice(0, 3) || "T2"}
                                </div>
                            </div>
                        )}

                        {/* Live Camera Feed PiP */}
                        {userName && (
                            <LiveCameraFeed 
                                hostName={room.name?.split(" ")[0] || "Expert"} 
                                roomName={room.id ? `Watch-${room.id}` : 'Sportsfan-Watchalong'} 
                                userRole={userRole}
                                userName={userName}
                                userEmail={authUser?.email || session?.user?.email || ""}
                                activeInterview={activeInterview}
                                telestratorActive={isTelestratorActive}
                                telestratorStrokes={telestratorStrokes}
                                onTelestratorStrokeAdded={(stroke) => triggerMoment("TEL_DRAW:" + JSON.stringify(stroke))}
                                onApiReady={async (api) => {
                                    jitsiApiRef.current = api;
                                    setJitsiApi(api);
                                    
                                    // Query initial mute states to synchronize HTML Control Panel on mount
                                    try {
                                        const audioMuted = await api.isAudioMuted();
                                        setMicOn(!audioMuted);
                                    } catch (err) {
                                        console.warn("Failed to get initial audio mute status:", err);
                                    }
                                    try {
                                        const videoMuted = await api.isVideoMuted();
                                        setVidOn(!videoMuted);
                                    } catch (err) {
                                        console.warn("Failed to get initial video mute status:", err);
                                    }

                                    api.addListener("audioMuteStatusChanged", (data: { muted: boolean }) => {
                                        setMicOn(!data.muted);
                                    });
                                    api.addListener("videoMuteStatusChanged", (data: { muted: boolean }) => {
                                        setVidOn(!data.muted);
                                    });
                                }}
                                onReactionReceived={(reaction) => {
                                    triggerMoment(reaction, false);
                                }}
                                onParticipantsChange={(list) => {
                                    setJitsiParticipants(list);
                                }}
                            />
                        )}
                        {/* SportsFan 360 Watermark — placed in the top-right corner of the video player for broadcast stream feel, preventing chat overlaps */}
                        <div className="absolute top-4 right-4 z-[40] pointer-events-none select-none flex items-center gap-2 px-3 py-1.5 rounded-lg animate-fade-in" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-[8px] font-black text-white leading-none">SF</div>
                            <span className="text-white/80 text-xs font-bold tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>SportsFan 360</span>
                        </div>
                    </div>

                    {/* HTML Audio/Video Control Panel (100% click-reliable on all devices, no overlap) */}
                    {userName && (
                        <div className="flex flex-row items-center justify-between gap-3 bg-[#141416] border border-white/5 rounded-xl p-2 lg:p-3 mt-1.5 lg:mt-3 mx-2 sm:mx-4 lg:mx-6 shadow-2xl">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${micOn ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-300">
                                    {micOn ? "Mic Active" : "Mic Muted"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={toggleMic}
                                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${
                                        micOn 
                                            ? "bg-green-600/10 border-green-500/30 text-green-400 hover:bg-green-600/20" 
                                            : "bg-red-600 border-red-500 text-white hover:bg-red-700"
                                    }`}
                                >
                                    {micOn ? <Mic size={12} /> : <MicOff size={12} />}
                                    <span>{micOn ? "Mute" : "Unmute"}</span>
                                </button>

                                {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
                                    <button
                                        type="button"
                                        onClick={toggleVid}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${
                                            vidOn 
                                                ? "bg-green-600/10 border-green-500/30 text-green-400 hover:bg-green-600/20" 
                                                : "bg-red-600 border-red-500 text-white hover:bg-red-700"
                                        }`}
                                    >
                                        {vidOn ? <Video size={12} /> : <VideoOff size={12} />}
                                        <span>{vidOn ? "Stop Cam" : "Start Cam"}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Zoom-style Host Reactions */}
                    {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
                        <div className="flex flex-col gap-1.5 lg:gap-2.5 bg-[#141416] border border-white/5 rounded-xl p-1.5 lg:p-3.5 mt-1 lg:mt-3 mx-2 sm:mx-4 lg:mx-6">
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                <span className="font-extrabold uppercase tracking-widest text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white">Host Reactions</span>
                                <span className="opacity-60 cursor-help flex items-center justify-center animate-pulse" title="Click to trigger animated reaction effects for everyone!">
                                    <Info size={12} />
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1">
                                
                                {/* WICKET */}
                                <button 
                                    onClick={() => triggerMoment("WICKET")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-pink-600 flex items-center justify-center text-[10px] text-white">🏏</div>
                                    <span>Wicket</span>
                                </button>

                                {/* SIX */}
                                <button 
                                    onClick={() => triggerMoment("SIX")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black text-white">6</div>
                                    <span>Six</span>
                                </button>

                                {/* FOUR */}
                                <button 
                                    onClick={() => triggerMoment("FOUR")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">4</div>
                                    <span>Four</span>
                                </button>

                                {/* TELESTRATOR / CHALKBOARD DRAW */}
                                <button 
                                    onClick={() => triggerMoment("TEL_TOGGLE:" + (!isTelestratorActive).toString())}
                                    className={`flex-shrink-0 flex items-center gap-1.5 border rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold ${
                                        isTelestratorActive 
                                            ? 'bg-green-600/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse' 
                                            : 'bg-[#202023] hover:bg-[#2a2a2e] border-white/5 text-gray-200'
                                    }`}
                                >
                                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white">✏️</div>
                                    <span>{isTelestratorActive ? 'Drawing Live...' : 'Draw Live'}</span>
                                </button>

                                {/* GOAL */}
                                <button 
                                    onClick={() => triggerMoment("GOAL")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white">⚽</div>
                                    <span>Goal</span>
                                </button>

                                {/* FIRE */}
                                <button 
                                    onClick={() => triggerMoment("FIRE")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white">🔥</div>
                                    <span>Fire</span>
                                </button>

                                {/* CLAP */}
                                <button 
                                    onClick={() => triggerMoment("CLAP")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] text-white">👏</div>
                                    <span>Clap</span>
                                </button>

                                {/* HEART */}
                                <button 
                                    onClick={() => triggerMoment("HEART")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white">❤️</div>
                                    <span>Heart</span>
                                </button>

                                {/* DRUMROLL */}
                                <button 
                                    onClick={() => triggerMoment("DRUMROLL")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-yellow-600 flex items-center justify-center text-[10px] text-white">🥁</div>
                                    <span>Drumroll</span>
                                </button>

                            </div>
                        </div>
                    )}

                    {/* Zoom-style Viewer Reactions */}
                    {!(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
                        <div className="flex flex-col gap-1.5 lg:gap-2.5 bg-[#141416] border border-white/5 rounded-xl p-1.5 lg:p-3.5 mt-1 lg:mt-3 mx-2 sm:mx-4 lg:mx-6">
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                <span className="font-extrabold uppercase tracking-widest text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white">Viewer Reactions</span>
                                <span className="opacity-60 cursor-help flex items-center justify-center animate-pulse" title="Click to trigger animated reaction effects for everyone!">
                                    <Info size={12} />
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1">
                                {/* FIRE */}
                                <button 
                                    onClick={() => triggerMoment("FIRE")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white">🔥</div>
                                    <span>Fire</span>
                                </button>

                                {/* CLAP */}
                                <button 
                                    onClick={() => triggerMoment("CLAP")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] text-white">👏</div>
                                    <span>Clap</span>
                                </button>

                                {/* HEART */}
                                <button 
                                    onClick={() => triggerMoment("HEART")}
                                    className="flex-shrink-0 flex items-center gap-1.5 bg-[#202023] hover:bg-[#2a2a2e] border border-white/5 rounded-full px-2.5 py-1 lg:px-3.5 lg:py-1.5 transition-all hover:scale-105 active:scale-95 text-[10px] lg:text-xs font-semibold text-gray-200"
                                >
                                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white">❤️</div>
                                    <span>Heart</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile/tablet: tab content inline below tabs */}
                    <div className="relative z-20 flex flex-col gap-1.5 px-2 sm:px-6 py-1.5 border-b border-[#222] lg:hidden">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                            {sidebarTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all ${
                                        activeTab === tab.id
                                            ? "bg-pink-600 text-white shadow-lg"
                                            : "bg-[#202023] text-gray-400 hover:bg-[#2a2a2e]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {pinnedMessage && (
                            <div className="bg-pink-600/10 border border-pink-500/25 px-3 py-2 flex items-center justify-between gap-3 text-xs rounded-xl mt-1">
                                <div className="flex items-center gap-2 text-pink-400 overflow-hidden">
                                    <Pin size={12} className="shrink-0 animate-bounce" />
                                    <span className="font-extrabold uppercase tracking-wider text-[8px] bg-pink-500/15 px-1 py-0.5 rounded shrink-0">Pinned</span>
                                    <p className="text-gray-200 truncate font-semibold">{pinnedMessage}</p>
                                </div>
                                {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
                                    <button onClick={() => setPinnedMessage(null)} className="text-gray-400 hover:text-white transition-colors shrink-0">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col min-h-[300px] lg:min-h-0 lg:hidden relative">
                        <TabContent isMobile={true} activeTab={activeTab} matchId={room.liveMatchId} userName={userName} userRole={userRole} room={room} jitsiParticipants={jitsiParticipants} jitsiApi={jitsiApi} chats={chats} qnaList={qnaList} setQnaList={setQnaList} answeringQuestion={answeringQuestion} setAnsweringQuestion={setAnsweringQuestion} qnaInput={qnaInput} setQnaInput={setQnaInput} sendChatMessage={sendChatMessage} composeOpen={composeOpen} setComposeOpen={setComposeOpen} composeType={composeType} setComposeType={setComposeType} handleComposePost={handleComposePost} />
                    </div>
                </div>

                {/* ── RIGHT: tab content sidebar — desktop only ── */}
                <div 
                    onMouseDown={startResize}
                    className={`hidden lg:block w-1.5 hover:w-2 bg-[#1a1a1c] hover:bg-pink-500/80 cursor-col-resize select-none transition-all duration-150 relative group ${isResizing ? 'bg-pink-500 w-2' : ''}`}
                    style={{ height: '100%', zIndex: 30 }}
                >
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/10 group-hover:bg-white/30 transition-colors pointer-events-none" />
                </div>

                <div 
                    className="hidden lg:flex lg:flex-col border-l border-[#222] min-h-0 bg-[#0e0e10]"
                    style={{ width: `${sidebarWidth}px` }}
                >
                    {/* Tab Header row */}
                    <div className="flex border-b border-[#222] px-2 py-1.5 gap-1 overflow-x-auto scrollbar-hide bg-[#121214]">
                        {sidebarTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-shrink-0 text-[11px] xl:text-xs px-2.5 py-1.5 rounded-lg font-bold tracking-wide transition-all ${
                                    activeTab === tab.id
                                        ? "bg-pink-600/10 text-pink-400 border border-pink-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Pinned Message Ribbon inside sidebar */}
                    {pinnedMessage && (
                        <div className="bg-pink-600/10 border-b border-pink-500/25 px-4 py-2 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-pink-400 overflow-hidden">
                                <Pin size={12} className="shrink-0 animate-bounce" />
                                <span className="font-extrabold uppercase tracking-wider text-[8px] bg-pink-500/15 px-1 py-0.5 rounded shrink-0">Pinned</span>
                                <p className="text-gray-200 truncate font-semibold">{pinnedMessage}</p>
                            </div>
                            {(userRole === 'Host' || userRole === 'Co-Host' || userRole === 'Moderator') && (
                                <button onClick={() => setPinnedMessage(null)} className="text-gray-400 hover:text-white transition-colors shrink-0">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex-1 flex flex-col min-h-0 relative">
                        <TabContent isMobile={false} activeTab={activeTab} matchId={room.liveMatchId} userName={userName} userRole={userRole} room={room} jitsiParticipants={jitsiParticipants} jitsiApi={jitsiApi} chats={chats} qnaList={qnaList} setQnaList={setQnaList} answeringQuestion={answeringQuestion} setAnsweringQuestion={setAnsweringQuestion} qnaInput={qnaInput} setQnaInput={setQnaInput} sendChatMessage={sendChatMessage} composeOpen={composeOpen} setComposeOpen={setComposeOpen} composeType={composeType} setComposeType={setComposeType} handleComposePost={handleComposePost} />
                    </div>
                </div>

            </div>

            {isResizing && (
                <div className="fixed inset-0 z-[100] cursor-col-resize select-none bg-transparent" />
            )}

            {/* Create Prediction Modal */}
            {showPredictionModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreatePrediction} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-[450px] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 text-red-500">
                                <Plus size={18} />
                                <h3 className="font-black text-sm uppercase tracking-wider text-white">Create Prediction</h3>
                            </div>
                            <button type="button" onClick={() => setShowPredictionModal(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-400 uppercase">Question</label>
                            <input 
                                type="text"
                                value={predQ}
                                onChange={(e) => setPredQ(e.target.value)}
                                placeholder="e.g. Will India win in next 10 overs?"
                                className="bg-[#0c0c0e] border border-white/10 focus:border-red-500 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-all text-white placeholder:text-gray-600"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Option A</label>
                                <input 
                                    type="text"
                                    value={predA}
                                    onChange={(e) => setPredA(e.target.value)}
                                    placeholder="Yes"
                                    className="bg-[#0c0c0e] border border-white/10 focus:border-red-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Option B</label>
                                <input 
                                    type="text"
                                    value={predB}
                                    onChange={(e) => setPredB(e.target.value)}
                                    placeholder="No"
                                    className="bg-[#0c0c0e] border border-white/10 focus:border-red-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={submittingModal}
                            className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-2.5 rounded-lg text-sm transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50"
                        >
                            {submittingModal ? "Creating..." : "Launch Prediction"}
                        </button>
                    </form>
                </div>
            )}

            {/* Create Poll Modal */}
            {showPollModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreatePoll} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-[450px] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 text-blue-400">
                                <BarChart3 size={18} />
                                <h3 className="font-black text-sm uppercase tracking-wider text-white">Create Live Poll</h3>
                            </div>
                            <button type="button" onClick={() => setShowPollModal(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-400 uppercase">Poll Question</label>
                            <input 
                                type="text"
                                value={pollQ}
                                onChange={(e) => setPollQ(e.target.value)}
                                placeholder="e.g. Who is the player of the match so far?"
                                className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-all text-white placeholder:text-gray-600"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Option A</label>
                                <input 
                                    type="text"
                                    value={pollA}
                                    onChange={(e) => setPollA(e.target.value)}
                                    placeholder="Option A"
                                    className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Option B</label>
                                <input 
                                    type="text"
                                    value={pollB}
                                    onChange={(e) => setPollB(e.target.value)}
                                    placeholder="Option B"
                                    className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Option C (Optional)</label>
                                <input 
                                    type="text"
                                    value={pollC}
                                    onChange={(e) => setPollC(e.target.value)}
                                    placeholder="Option C"
                                    className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Option D (Optional)</label>
                                <input 
                                    type="text"
                                    value={pollD}
                                    onChange={(e) => setPollD(e.target.value)}
                                    placeholder="Option D"
                                    className="bg-[#0c0c0e] border border-white/10 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-sm transition-all text-white placeholder:text-gray-600"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={submittingModal}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50"
                        >
                            {submittingModal ? "Launching..." : "Launch Live Poll"}
                        </button>
                    </form>
                </div>
            )}

            {/* Create Quiz Modal */}
            {showQuizModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCreateQuiz} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-[480px] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 text-pink-400">
                                <Brain size={18} />
                                <h3 className="font-black text-sm uppercase tracking-wider text-white">Create Flash Quiz</h3>
                            </div>
                            <button type="button" onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-400 uppercase">Quiz Question</label>
                            <input 
                                type="text"
                                value={quizQ}
                                onChange={(e) => setQuizQ(e.target.value)}
                                placeholder="e.g. Which team scored the highest in powerplay?"
                                className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-all text-white placeholder:text-gray-600"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" value={quizA} onChange={(e) => setQuizA(e.target.value)} placeholder="Option A" className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white" required />
                            <input type="text" value={quizB} onChange={(e) => setQuizB(e.target.value)} placeholder="Option B" className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white" required />
                            <input type="text" value={quizC} onChange={(e) => setQuizC(e.target.value)} placeholder="Option C" className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white" required />
                            <input type="text" value={quizD} onChange={(e) => setQuizD(e.target.value)} placeholder="Option D" className="bg-[#0c0c0e] border border-white/10 focus:border-pink-500 outline-none rounded-lg px-3 py-2 text-sm text-white" required />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Correct Option</label>
                                <select 
                                    value={quizAns}
                                    onChange={(e) => setQuizAns(e.target.value)}
                                    className="bg-[#0c0c0e] border border-white/10 outline-none rounded-lg px-3 py-2 text-sm text-white"
                                >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Timer (Sec)</label>
                                <input 
                                    type="number" 
                                    value={quizTime} 
                                    onChange={(e) => setQuizTime(parseInt(e.target.value))} 
                                    className="bg-[#0c0c0e] border border-white/10 outline-none rounded-lg px-3 py-2 text-sm text-white" 
                                    min={5}
                                    max={60}
                                    required 
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Points</label>
                                <input 
                                    type="number" 
                                    value={quizPts} 
                                    onChange={(e) => setQuizPts(parseInt(e.target.value))} 
                                    className="bg-[#0c0c0e] border border-white/10 outline-none rounded-lg px-3 py-2 text-sm text-white" 
                                    min={10}
                                    required 
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={submittingModal}
                            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 rounded-lg text-sm transition-all hover:shadow-[0_0_15px_rgba(219,39,119,0.4)] disabled:opacity-50"
                        >
                            {submittingModal ? "Launching..." : "Launch Flash Quiz"}
                        </button>
                    </form>
                </div>
            )}

            {/* Pin Message Modal */}
            {showPinModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <form onSubmit={handlePinMessage} className="bg-[#18181b] border border-white/10 rounded-2xl p-6 w-full max-w-[450px] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2 text-red-400">
                                <Pin size={18} />
                                <h3 className="font-black text-sm uppercase tracking-wider text-white">Pin Message to Top</h3>
                            </div>
                            <button type="button" onClick={() => setShowPinModal(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-gray-400 uppercase">Message</label>
                            <input 
                                type="text"
                                value={pinText}
                                onChange={(e) => setPinText(e.target.value)}
                                placeholder="Type a message to highlight..."
                                className="bg-[#0c0c0e] border border-white/10 focus:border-red-500 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-all text-white placeholder:text-gray-600"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                        >
                            Pin Highlight
                        </button>
                    </form>
                </div>
            )}

            {/* TACTICAL CHALKBOARD ENTRY MODAL */}
            {showTacticalModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">🧠 Chalkboard Match Analysis</h3>
                            <button onClick={() => setShowTacticalModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (tacticalText.trim()) {
                                triggerMoment(`TACTICAL_DROP:${tacticalTitle}:${tacticalText}`);
                                setShowTacticalModal(false);
                            }
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-wider text-gray-400 mb-1.5">Analysis Title</label>
                                <select 
                                    value={tacticalTitle}
                                    onChange={(e) => setTacticalTitle(e.target.value)}
                                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                                >
                                    <option value="Analyze Captain's Move">Analyze Captain&apos;s Move</option>
                                    <option value="Match Situation Interpretation">Match Situation Interpretation</option>
                                    <option value="Strategic Bowling Change">Strategic Bowling Change</option>
                                    <option value="Powerplay Strategy">Powerplay Strategy</option>
                                    <option value="Death Overs Blueprint">Death Overs Blueprint</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-wider text-gray-400 mb-1.5">Strategic Commentary</label>
                                <textarea 
                                    value={tacticalText}
                                    onChange={(e) => setTacticalText(e.target.value)}
                                    placeholder="Type match commentary, strategy shifts, or captain critiques..."
                                    rows={4}
                                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 font-bold"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        triggerMoment("TACTICAL_CLEAR");
                                        setShowTacticalModal(false);
                                    }}
                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black py-3.5 rounded-xl text-xs transition-all border border-red-500/20 animate-pulse"
                                >
                                    Clear Overlay
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black py-3.5 rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(219,39,119,0.3)] hover:scale-105 active:scale-95"
                                >
                                    Broadcast Live
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QUICK PREDICT TEMPLATES MODAL */}
            {showPredictTemplates && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">🎯 Quick Predict Templates</h3>
                            <button onClick={() => setShowPredictTemplates(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-xs text-gray-400 font-medium mb-4">
                                Select a micro-stage cricket prediction template to broadcast instantly to all fans in the watchroom.
                            </p>
                            <button 
                                onClick={() => {
                                    handleQuickPrediction("How many runs will India score in the next 2 overs?", ["Under 12 Runs", "12 to 18 Runs", "Over 18 Runs"]);
                                    setShowPredictTemplates(false);
                                }}
                                className="w-full flex items-center justify-between bg-[#1c1c1f] hover:bg-[#252529] border border-white/5 hover:border-pink-500/30 px-4 py-3.5 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🏏</span>
                                    <div className="text-left">
                                        <p className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">Runs next 2 overs</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Under 12, 12 to 18, Over 18</p>
                                    </div>
                                </div>
                                <span className="text-xs text-pink-500 font-black tracking-wider uppercase bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">Launch</span>
                            </button>
                            <button 
                                onClick={() => {
                                    handleQuickPrediction("Will the next ball be a boundary?", ["Yes, Boundary", "No, Single/Dot", "Wicket!"]);
                                    setShowPredictTemplates(false);
                                }}
                                className="w-full flex items-center justify-between bg-[#1c1c1f] hover:bg-[#252529] border border-white/5 hover:border-pink-500/30 px-4 py-3.5 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">💥</span>
                                    <div className="text-left">
                                        <p className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">Next ball boundary</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Boundary, Single/Dot, Wicket</p>
                                    </div>
                                </div>
                                <span className="text-xs text-pink-500 font-black tracking-wider uppercase bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">Launch</span>
                            </button>
                            <button 
                                onClick={() => {
                                    handleQuickPrediction("Will India take a DRS review in the next 3 overs?", ["Yes, DRS Review", "No Review"]);
                                    setShowPredictTemplates(false);
                                }}
                                className="w-full flex items-center justify-between bg-[#1c1c1f] hover:bg-[#252529] border border-white/5 hover:border-pink-500/30 px-4 py-3.5 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⚖️</span>
                                    <div className="text-left">
                                        <p className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">DRS Decision</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Yes DRS Review, No Review</p>
                                    </div>
                                </div>
                                <span className="text-xs text-pink-500 font-black tracking-wider uppercase bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">Launch</span>
                            </button>
                            <button 
                                onClick={() => {
                                    handleQuickPrediction("Will the captain bring back Bumrah to bowl the next over?", ["Yes, Bumrah bowls", "No, other bowler"]);
                                    setShowPredictTemplates(false);
                                }}
                                className="w-full flex items-center justify-between bg-[#1c1c1f] hover:bg-[#252529] border border-white/5 hover:border-pink-500/30 px-4 py-3.5 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">🧢</span>
                                    <div className="text-left">
                                        <p className="text-xs font-black text-white group-hover:text-pink-400 transition-colors">Captain&apos;s Bowling Move</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Bumrah bowls, Other bowler</p>
                                    </div>
                                </div>
                                <span className="text-xs text-pink-500 font-black tracking-wider uppercase bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">Launch</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TIMED FULL-SCREEN EMOJI STORM OVERLAY */}
            {stormState !== 'idle' && (
                <div className={`fixed inset-0 z-[9999] flex flex-col justify-between ${
                    stormState === 'countdown' ? 'bg-black/95 backdrop-blur-xl pointer-events-auto' : 
                    stormState === 'active' ? 'bg-black/60 pointer-events-none' : 
                    'bg-black/95 backdrop-blur-2xl pointer-events-auto'
                } transition-all duration-500`}>
                    
                    {/* Countdown Screen */}
                    {stormState === 'countdown' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300 pointer-events-auto">
                            <div className="w-20 h-20 rounded-3xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6 border border-pink-500/20 animate-pulse">
                                <Zap size={40} />
                            </div>
                            <h2 className="text-sm font-black tracking-widest text-pink-500 uppercase mb-2 animate-bounce">EMOJI STORM INCOMING</h2>
                            <p className="text-xs text-gray-400 max-w-[280px] mb-8 font-medium">Get ready to tap as fast as you can! Speed is everything!</p>
                            <div className="w-40 h-40 flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                <span key={stormCountdownVal} className="text-7xl font-black text-white animate-pulse-countdown filter drop-shadow-[0_0_20px_rgba(236,72,153,0.6)]">
                                    {stormCountdownVal}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Active Storm Screen */}
                    {stormState === 'active' && (
                        <>
                            {/* Floating Storm Emojis */}
                            <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
                                {stormFloating.map((f) => (
                                    <span
                                        key={f.id}
                                        className="absolute text-5xl select-none animate-storm-float"
                                        style={{
                                            left: `${f.x}%`,
                                            bottom: '-10vh',
                                            '--rot': `${f.rot}deg`,
                                            '--scale': f.scale,
                                            opacity: f.opacity,
                                            animationDuration: `${3 / f.speed}s`
                                        } as any}
                                    >
                                        {f.emoji}
                                    </span>
                                ))}
                            </div>

                            {/* Top Stats Banner */}
                            <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-white/10 rounded-full px-6 py-2.5 flex items-center gap-4 z-[9999] shadow-2xl animate-in slide-in-from-top duration-300 pointer-events-auto">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                                    <span className="text-xs font-black tracking-widest text-white uppercase">STORM ACTIVE</span>
                                </div>
                                <div className="h-4 w-px bg-white/15"></div>
                                <div className="text-xs font-bold text-gray-300">
                                    ⏱️ <span className="text-pink-400 font-black text-sm">{stormTimeLeft}s</span> left
                                </div>
                                <div className="h-4 w-px bg-white/15"></div>
                                <div className="text-xs font-bold text-gray-300">
                                    🔥 Intensity: <span className="text-pink-400 font-black text-sm">{(stormTotalTaps + stormLocalTaps).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Floating Tap Grid */}
                            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-[9999] w-[92%] max-w-[560px] pointer-events-auto animate-in slide-in-from-bottom duration-300">
                                <div className="text-center mb-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 animate-pulse">⚡ TAP REPEATEDLY AS FAST AS YOU CAN! ⚡</p>
                                    <p className="text-[9px] text-gray-400 font-medium">Unleash the ultimate collective energy!</p>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => handleStormTap(emoji)}
                                            className="flex flex-col items-center justify-center py-4 bg-white/5 hover:bg-white/10 active:scale-75 hover:border-pink-500/50 border border-white/5 rounded-2xl transition-all duration-100 transform select-none"
                                        >
                                            <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transform hover:scale-110 active:scale-95 transition-transform">{emoji}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Summary Screen */}
                    {stormState === 'summary' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 pointer-events-auto">
                            <div className="max-w-md w-full animate-in zoom-in duration-300">
                                
                                {/* Storm Intensity Card */}
                                <div className="bg-gradient-to-br from-orange-600 to-pink-600 rounded-3xl p-8 shadow-[0_15px_50px_rgba(236,72,153,0.3)] border border-pink-500/20 mb-6 transform hover:scale-102 transition-transform">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-200 mb-1">Storm Status: Ended</p>
                                    <h2 className="text-3xl font-black text-white mb-4 animate-bounce">🔥 {Math.min(99, 85 + Math.floor(Math.random() * 14))}% Intensity</h2>
                                    <p className="text-white/90 text-sm font-semibold tracking-wide">
                                        {((stormTotalTaps + stormLocalTaps) * 153 + 1205).toLocaleString()} emojis sent!
                                    </p>
                                </div>

                                {/* Mini Leaderboard */}
                                <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-2xl">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-center gap-2">
                                        <span>🏆</span> Top Senders Leaderboard <span>🏆</span>
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {stormLeaderboard.map((item, index) => {
                                            const medals = ["🥇", "🥈", "🥉"];
                                            const colors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
                                            const bgColors = ["bg-yellow-400/10 border-yellow-400/20", "bg-gray-300/10 border-gray-300/20", "bg-amber-600/10 border-amber-600/20"];
                                            return (
                                                <div key={item.name + '-' + index} className={`flex items-center justify-between p-3.5 rounded-xl border ${bgColors[index] || "border-white/5 bg-[#202023]"}`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{medals[index]}</span>
                                                        <span className="text-sm font-black text-white">{item.name}</span>
                                                    </div>
                                                    <span className={`text-xs font-black ${colors[index]}`}>{(item.count * 153 + 24).toLocaleString()} taps</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            )}



        </div>
    );
}