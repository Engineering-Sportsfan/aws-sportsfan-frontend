// // components/AudioDropCard.tsx
// "use client";
// import Link from "next/link";
// import { useState, useEffect, useRef } from "react";

// type AudioDrop = {
//   title: string;
//   subtitle: string;
//   description: string;
//   listens: number;
//   signals: number;
//   duration: string;
//   date: string;
//   room: string;
//   engagement: number; 
//   audioUrl?: string;
// };

// const data: AudioDrop = {
//   title: "Pre-Match Strategy Discussion",
//   subtitle: "Audio Drops",
//   description: "Strategic discussion with the team before the crucial match. Tactics, player roles, and game plan.",
//   listens: 1876,
//   signals: 543,
//   duration: "15:30",
//   date: "Jan 28, 2026",
//   room: "Inner Room",
//   engagement: 29,
// };

// export default function AudioDropCard({ drop = data }: { drop?: AudioDrop }) {
//   const [playing, setPlaying]     = useState(false);
//   const [elapsed, setElapsed]     = useState(0);
//   const totalSecs                 = 930; // 15:30
//   const timerRef                  = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     if (playing) {
//       timerRef.current = setInterval(() => {
//         setElapsed(e => {
//           if (e >= totalSecs) { setPlaying(false); return totalSecs; }
//           return e + 1;
//         });
//       }, 1000);
//     } else {
//       if (timerRef.current) clearInterval(timerRef.current);
//     }
//     return () => { if (timerRef.current) clearInterval(timerRef.current); };
//   }, [playing]);

//   const mins    = Math.floor(elapsed / 60);
//   const secs    = elapsed % 60;
//   const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
//   const pct     = Math.round((elapsed / totalSecs) * 100);

//   return (
//     <div className="flex justify-center items-start bg-[#0d0d10] min-h-screen p-4 sm:p-6 lg:p-10">
//       <div className="w-full max-w-[360px] sm:max-w-[400px] bg-[#111114] rounded-[28px] overflow-hidden border border-[#2a2a2e]">

//         {/* Topbar */}
//         <div className="flex items-center justify-between px-4 pt-5 pb-3 bg-[#111114]">
//           <div className="flex items-center gap-3">
//             <button onClick={() => window.history.back()}>
//               <div className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer">
//                 <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//                   <path d="M9 2L4 7L9 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </div>
//             </button>
//             <div>
//               <p className="text-white text-[15px] font-medium leading-tight">{drop.title.split(":")[0]}</p>
//               <p className="text-[#888] text-[12px] mt-0.5">{drop.subtitle}</p>
//             </div>
//           </div>
//           <div className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer">
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//               <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4"/>
//               <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4"/>
//               <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4"/>
//               <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round"/>
//             </svg>
//           </div>
//         </div>

//         {/* Player */}
//         <div className="bg-[#1a0a10] mx-3.5 rounded-2xl px-6 pt-7 pb-4 flex flex-col items-center gap-4">
//           <div className="w-[72px] h-[72px] rounded-full bg-[#c0204a] flex items-center justify-center">
//             <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
//               <path d="M5 18v-1C5 10.373 10.373 5 17 5s12 5.373 12 12v1" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
//               <rect x="3" y="17" width="5" height="9" rx="2.5" fill="#fff"/>
//               <rect x="26" y="17" width="5" height="9" rx="2.5" fill="#fff"/>
//             </svg>
//           </div>

//           <button
//             onClick={() => setPlaying(v => !v)}
//             className="w-[52px] h-[52px] rounded-full bg-[#e0185a] hover:bg-[#f01e66] flex items-center justify-center transition border-none"
//           >
//             {playing ? (
//               <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                 <rect x="5" y="4" width="3" height="12" rx="1" fill="#fff"/>
//                 <rect x="12" y="4" width="3" height="12" rx="1" fill="#fff"/>
//               </svg>
//             ) : (
//               <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                 <path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#fff"/>
//               </svg>
//             )}
//           </button>

//           <div className="flex justify-between w-full text-[11px] text-[#666] font-mono px-0.5">
//             <span>{timeStr}</span>
//             <span>{drop.duration}</span>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="px-4 pt-4 pb-5 bg-[#111114]">
//           <h1 className="text-white text-[19px] sm:text-[21px] font-medium leading-snug mb-2">
//             {drop.title}
//           </h1>
//           <p className="text-[#888] text-[13px] leading-relaxed mb-4">
//             {drop.description}
//           </p>

//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-2.5 mb-4">
//             {[
//               { label: "Listens",  value: drop.listens.toLocaleString(), color: "#e0185a", icon: "listen"   },
//               { label: "Signals",  value: drop.signals.toLocaleString(), color: "#e0185a", icon: "signal"   },
//               { label: "Duration", value: drop.duration,                 color: "#1a9e6a", icon: "duration" },
//             ].map(s => (
//               <div key={s.label} className="bg-[#1a1a1e] rounded-xl p-2.5 flex flex-col gap-1.5">
//                 <div className="flex items-center gap-1.5" style={{ color: s.color }}>
//                   <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
//                     <circle cx="6.5" cy="6.5" r="5" stroke={s.color} strokeWidth="1.2"/>
//                     {s.icon === "duration"
//                       ? <path d="M6.5 4v2.5l1.5 1.5" stroke={s.color} strokeWidth="1.2" strokeLinecap="round"/>
//                       : <path d="M4.5 6.5h4M6.5 4.5v4" stroke={s.color} strokeWidth="1.2" strokeLinecap="round"/>
//                     }
//                   </svg>
//                   <span className="text-[10px] uppercase tracking-wider" style={{ color: s.color }}>
//                     {s.label}
//                   </span>
//                 </div>
//                 <span className="text-[17px] sm:text-[19px] font-medium" style={{ color: s.color === "#1a9e6a" ? "#1a9e6a" : "#fff" }}>
//                   {s.value}
//                 </span>
//               </div>
//             ))}
//           </div>

//           {/* Meta */}
//           <div className="flex items-center gap-4 text-[12px] text-[#666] mb-3.5">
//             <div className="flex items-center gap-1.5">
//               <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
//                 <rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="#666" strokeWidth="1.2"/>
//                 <path d="M1.5 5.5h10M4.5 1v3M8.5 1v3" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
//               </svg>
//               {drop.date}
//             </div>
//             <div className="flex items-center gap-1.5">
//               <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
//                 <circle cx="6.5" cy="4.5" r="2.5" stroke="#666" strokeWidth="1.2"/>
//                 <path d="M2 11c0-2 2-3 4.5-3s4.5 1 4.5 3" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
//               </svg>
//               {drop.room}
//             </div>
//           </div>

//           {/* Progress bar */}
//           <div className="mb-5">
//             <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
//               <div
//                 className="h-full bg-[#e0185a] rounded-full transition-all duration-300"
//                 style={{ width: `${playing ? pct : drop.engagement}%` }}
//               />
//             </div>
//             <p className="text-right text-[11px] text-[#666]">
//               {playing ? pct : drop.engagement}% engagement
//             </p>
//           </div>

//           {/* Send Signal button */}
//           <button className="w-full bg-[#1e0a12] border border-[#e0185a] rounded-[14px] py-4 flex items-center justify-center gap-2 text-[#e0185a] text-[15px] font-medium hover:bg-[#2a0f1c] transition">
//             <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
//               <path d="M9 2C5.7 2 3 4.5 3 7.5c0 1.5.7 2.9 1.9 3.9L4 15l3.5-1.2c.5.2 1 .2 1.5.2C12.3 14 15 11.5 15 8.5S12.3 2 9 2z" stroke="#e0185a" strokeWidth="1.4" strokeLinejoin="round"/>
//               <path d="M6.5 8.5h5M9 6v5" stroke="#e0185a" strokeWidth="1.4" strokeLinecap="round"/>
//             </svg>
//             Send Signal
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }







// components/AudioDropCard.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

type AudioDrop = {
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
  mediaUrl?: string;
  thumbnail?: string;
};

interface Playlist {
  id: string;
  playerProfilesId: string;
  audioDrops: AudioDrop[];
  videoDrops: unknown[];
  createdAt: number;
  updatedAt: number;
}

interface ApiResponse {
  success: boolean;
  playlists: Playlist[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Helper to parse duration string (e.g., "4:32") to seconds
const parseDurationToSeconds = (duration: string): number => {
  const parts = duration.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  return 0;
};

// Helper to format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper to find audio drop by URL from all playlists
const findAudioDropByUrl = (playlists: Playlist[], url: string): { drop: AudioDrop | null, playlist: Playlist | null, index: number } => {
  for (const playlist of playlists) {
    const index = playlist.audioDrops.findIndex(drop => drop.mediaUrl === url);
    if (index !== -1) {
      return { drop: playlist.audioDrops[index], playlist, index };
    }
  }
  return { drop: null, playlist: null, index: -1 };
};

export default function AudioDropCard() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url");
  const playlistId = searchParams.get("playlistId");
  const audioIndex = parseInt(searchParams.get("audioIndex") || "0");
  
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioDrop, setAudioDrop] = useState<AudioDrop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAudioData();
  }, [playlistId, audioIndex, urlParam]);

  const fetchAudioData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all playlists
      const response = await axios.get<ApiResponse>("/api/playersprofile-playlist");
      
      if (!response.data.success || response.data.playlists.length === 0) {
        setError("No playlists available");
        setLoading(false);
        return;
      }

      const playlists = response.data.playlists;
      
      // Case 1: URL parameter provided - find the audio drop by URL
      if (urlParam) {
        const decodedUrl = decodeURIComponent(urlParam);
        const { drop, playlist, index } = findAudioDropByUrl(playlists, decodedUrl);
        
        if (drop && playlist) {
          setAudioDrop({
            ...drop,
            audioUrl: drop.mediaUrl,
            subtitle: "Audio Drops",
            date: formatDate(playlist.createdAt),
            room: "Audio Room"
          });
        } else {
          // If not found in playlists, still show with basic info
          setAudioDrop({
            title: "Audio Track",
            description: "",
            listens: 0,
            signals: 0,
            duration: "0:00",
            engagement: 0,
            mediaUrl: decodedUrl,
            audioUrl: decodedUrl
          });
        }
        setLoading(false);
        return;
      }
      
      // Case 2: Playlist ID and index provided
      let targetPlaylist: Playlist | undefined;
      
      if (playlistId) {
        targetPlaylist = playlists.find(p => p.id === playlistId);
      } else {
        targetPlaylist = playlists[0];
      }
      
      if (targetPlaylist && targetPlaylist.audioDrops[audioIndex]) {
        const drop = targetPlaylist.audioDrops[audioIndex];
        setAudioDrop({
          ...drop,
          audioUrl: drop.mediaUrl,
          subtitle: "Audio Drops",
          date: formatDate(targetPlaylist.createdAt),
          room: "Audio Room"
        });
      } else {
        setError("Audio drop not found");
      }
      
    } catch (err) {
      console.error("Error fetching audio:", err);
      setError("Failed to load audio");
    } finally {
      setLoading(false);
    }
  };

  // Initialize audio element when audioDrop is available
  useEffect(() => {
    if (audioDrop?.audioUrl) {
      const audio = new Audio(audioDrop.audioUrl);
      setAudioElement(audio);
      
      // Get actual duration from audio file if not provided
      audio.addEventListener('loadedmetadata', () => {
        if (audioDrop.duration === "0:00" && !isNaN(audio.duration)) {
          const minutes = Math.floor(audio.duration / 60);
          const seconds = Math.floor(audio.duration % 60);
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          setAudioDrop(prev => prev ? { ...prev, duration: formattedDuration } : null);
        }
      });
      
      audio.addEventListener('ended', () => {
        setPlaying(false);
        setElapsed(0);
      });
      
      return () => {
        audio.pause();
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('ended', () => {});
      };
    }
  }, [audioDrop?.audioUrl]);

  // Handle play/pause
  useEffect(() => {
    if (audioElement) {
      if (playing) {
        audioElement.play();
        timerRef.current = setInterval(() => {
          setElapsed(audioElement.currentTime);
        }, 1000);
      } else {
        audioElement.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, audioElement]);

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
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
          <button 
            onClick={() => window.history.back()}
            className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalSecs = parseDurationToSeconds(audioDrop.duration);
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
  const pct = totalSecs > 0 ? Math.round((elapsed / totalSecs) * 100) : 0;
  const engPct = playing ? pct : audioDrop.engagement;

  return (
    <div className="flex justify-center items-start bg-[#0d0d10] min-h-screen p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-[360px] sm:max-w-[400px] bg-[#111114] rounded-[28px] overflow-hidden border border-[#2a2a2e]">

        {/* Topbar */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 bg-[#111114]">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()}>
              <div className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7L9 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
            <div>
              <p className="text-white text-[15px] font-medium leading-tight">{audioDrop.title.split(":")[0]}</p>
              <p className="text-[#888] text-[12px] mt-0.5">{audioDrop.subtitle || "Audio Drops"}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4"/>
              <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4"/>
              <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4"/>
              <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Player */}
        <div className="bg-[#1a0a10] mx-3.5 rounded-2xl px-6 pt-7 pb-4 flex flex-col items-center gap-4">
          <div className="w-[72px] h-[72px] rounded-full bg-[#c0204a] flex items-center justify-center">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <path d="M5 18v-1C5 10.373 10.373 5 17 5s12 5.373 12 12v1" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              <rect x="3" y="17" width="5" height="9" rx="2.5" fill="#fff"/>
              <rect x="26" y="17" width="5" height="9" rx="2.5" fill="#fff"/>
            </svg>
          </div>

          <button
            onClick={() => setPlaying(v => !v)}
            className="w-[52px] h-[52px] rounded-full bg-[#e0185a] hover:bg-[#f01e66] flex items-center justify-center transition border-none"
          >
            {playing ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="5" y="4" width="3" height="12" rx="1" fill="#fff"/>
                <rect x="12" y="4" width="3" height="12" rx="1" fill="#fff"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4.5L16 10L7 15.5V4.5Z" fill="#fff"/>
              </svg>
            )}
          </button>

          <div className="flex justify-between w-full text-[11px] text-[#666] font-mono px-0.5">
            <span>{timeStr}</span>
            <span>{audioDrop.duration}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pt-4 pb-5 bg-[#111114]">
          <h1 className="text-white text-[19px] sm:text-[21px] font-medium leading-snug mb-2">
            {audioDrop.title}
          </h1>
          <p className="text-[#888] text-[13px] leading-relaxed mb-4">
            {audioDrop.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { label: "Listens", value: audioDrop.listens.toLocaleString(), color: "#999999" },
              { label: "Signals", value: audioDrop.signals.toLocaleString(), color: "#999999" },
              { label: "Duration", value: audioDrop.duration, color: "#999999" },
            ].map(s => (
              <div key={s.label} className="bg-[#1a1a1e] rounded-xl p-2.5 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5" style={{ color: s.color }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="5" stroke={s.color} strokeWidth="1.2"/>
                    {s.label === "Duration" 
                      ? <path d="M6.5 4v2.5l1.5 1.5" stroke={s.color} strokeWidth="1.2" strokeLinecap="round"/>
                      : <path d="M4.5 6.5h4M6.5 4.5v4" stroke={s.color} strokeWidth="1.2" strokeLinecap="round"/>
                    }
                  </svg>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: s.color }}>
                    {s.label}
                  </span>
                </div>
                <span className="text-[17px] sm:text-[19px] font-medium" style={{ color: s.color === "#1a9e6a" ? "#1a9e6a" : "#fff" }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-[12px] text-[#666] mb-3.5">
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1.5" y="2.5" width="10" height="9" rx="1.5" stroke="#666" strokeWidth="1.2"/>
                <path d="M1.5 5.5h10M4.5 1v3M8.5 1v3" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {audioDrop.date || "Recent"}
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="4.5" r="2.5" stroke="#666" strokeWidth="1.2"/>
                <path d="M2 11c0-2 2-3 4.5-3s4.5 1 4.5 3" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {audioDrop.room || "Audio Room"}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="h-1 bg-[#2a2a2e] rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-[#e0185a] rounded-full transition-all duration-300"
                style={{ width: `${engPct}%` }}
              />
            </div>
            <p className="text-right text-[11px] text-[#666]">
              {engPct}% engagement
            </p>
          </div>

          {/* Send Signal button */}
          <button className="w-full bg-[#1e0a12] border border-[#e0185a] rounded-[14px] py-4 flex items-center justify-center gap-2 text-[#e0185a] text-[15px] font-medium hover:bg-[#2a0f1c] transition">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2C5.7 2 3 4.5 3 7.5c0 1.5.7 2.9 1.9 3.9L4 15l3.5-1.2c.5.2 1 .2 1.5.2C12.3 14 15 11.5 15 8.5S12.3 2 9 2z" stroke="#e0185a" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M6.5 8.5h5M9 6v5" stroke="#e0185a" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Send Signal
          </button>
        </div>
      </div>
    </div>
  );
}