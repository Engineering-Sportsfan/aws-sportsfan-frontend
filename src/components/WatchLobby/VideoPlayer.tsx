// // components/watch-along/VideoPlayer.tsx
// "use client";

// import { useState, useEffect } from "react";
// import YouTube from "react-youtube";

// interface VideoPlayerProps {
//     videoUrl: string;
//     videoType: string;
//     isLive?: boolean;
// }

// export default function VideoPlayer({ videoUrl, videoType, isLive }: VideoPlayerProps) {
//     const [player, setPlayer] = useState<any>(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [videoId, setVideoId] = useState<string | null>(null);

//     // Extract YouTube video ID from URL - FIXED to handle all formats
//     const getYouTubeVideoId = (url: string): string | null => {
//         if (!url) return null;

//         // Remove tracking parameters (si=...)
//         const cleanUrl = url.split('?')[0];

//         const patterns = [
//             /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/,
//             /youtube\.com\/embed\/([^?]+)/,
//             /youtube\.com\/v\/([^?]+)/,
//         ];

//         for (const pattern of patterns) {
//             const match = cleanUrl.match(pattern);
//             if (match) {
//                 console.log("Extracted video ID:", match[1]);
//                 return match[1];
//             }
//         }

//         console.log("Could not extract video ID from:", cleanUrl);
//         return null;
//     };

//     // Extract video ID when URL changes
//     useEffect(() => {
//         if (videoUrl && videoType === "youtube") {
//             const id = getYouTubeVideoId(videoUrl);
//             setVideoId(id);
//             console.log("Video URL:", videoUrl);
//             console.log("Extracted ID:", id);
//         }
//     }, [videoUrl, videoType]);

//     // YouTube player options
//     const youtubeOpts = {
//         height: '100%',
//         width: '100%',
//         playerVars: {
//             autoplay: isLive ? 1 : 0,
//             controls: 1,
//             rel: 0,
//             modestbranding: 1,
//             showinfo: 0,
//             origin: typeof window !== 'undefined' ? window.location.origin : '',
//         },
//     };

//     const onReady = (event: any) => {
//         setPlayer(event.target);
//         setDuration(event.target.getDuration());
//         if (isLive) {
//             event.target.playVideo();
//             setIsPlaying(true);
//         }
//     };

//     const onPlay = () => setIsPlaying(true);
//     const onPause = () => setIsPlaying(false);

//     const onStateChange = (event: any) => {
//         // Update current time periodically
//         if (event.data === 1) { // Playing
//             const interval = setInterval(() => {
//                 if (player) {
//                     setCurrentTime(player.getCurrentTime());
//                 }
//             }, 1000);
//             return () => clearInterval(interval);
//         }
//     };

//     const togglePlay = () => {
//         if (!player) return;
//         if (isPlaying) {
//             player.pauseVideo();
//         } else {
//             player.playVideo();
//         }
//     };

//     const formatTime = (seconds: number): string => {
//         if (isNaN(seconds)) return "0:00";
//         const mins = Math.floor(seconds / 60);
//         const secs = Math.floor(seconds % 60);
//         return `${mins}:${secs.toString().padStart(2, '0')}`;
//     };

//     // If no video URL, show placeholder
//     if (!videoUrl) {
//         return (
//             <div className="relative bg-[#1a0a14] w-full aspect-video overflow-hidden">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="text-center">
//                         <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
//                             <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                         </div>
//                         <p className="text-gray-400 text-sm">No video stream available</p>
//                         <p className="text-gray-600 text-xs mt-1">Check back later for live stream</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // Render YouTube player
//     if (videoType === "youtube") {
//         // Show loading while extracting video ID
//         if (!videoId) {
//             return (
//                 <div className="relative bg-[#1a0a14] w-full aspect-video overflow-hidden">
//                     <div className="absolute inset-0 flex items-center justify-center">
//                         <div className="text-center">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-3"></div>
//                             <p className="text-gray-400 text-sm">Loading video...</p>
//                         </div>
//                     </div>
//                 </div>
//             );
//         }

//         return (
//             <div className="relative bg-[#1a0a14] w-full aspect-video overflow-hidden">
//                 <YouTube
//                     videoId={videoId}
//                     opts={youtubeOpts}
//                     onReady={onReady}
//                     onPlay={onPlay}
//                     onPause={onPause}
//                     onStateChange={onStateChange}
//                     className="w-full h-full"
//                     iframeClassName="w-full h-full"
//                 />

//                 {/* Custom overlay controls (optional) */}
//                 {!isLive && duration > 0 && (
//                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
//                         <div className="flex items-center gap-3">
//                             <button
//                                 onClick={togglePlay}
//                                 className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
//                             >
//                                 {isPlaying ? (
//                                     <svg className="w-4 h-4 text-white" fill="white" viewBox="0 0 24 24">
//                                         <rect x="6" y="4" width="4" height="16" />
//                                         <rect x="14" y="4" width="4" height="16" />
//                                     </svg>
//                                 ) : (
//                                     <svg className="w-4 h-4 text-white" fill="white" viewBox="0 0 24 24">
//                                         <polygon points="5 3 19 12 5 21 5 3" />
//                                     </svg>
//                                 )}
//                             </button>
//                             <div className="flex-1">
//                                 <div className="h-1 bg-white/30 rounded-full overflow-hidden">
//                                     <div 
//                                         className="h-full bg-pink-500 rounded-full transition-all"
//                                         style={{ width: `${(currentTime / duration) * 100}%` }}
//                                     />
//                                 </div>
//                             </div>
//                             <span className="text-xs text-white">
//                                 {formatTime(currentTime)} / {formatTime(duration)}
//                             </span>
//                         </div>
//                     </div>
//                 )}

//                 {/* Live badge for live streams */}
//                 {isLive && (
//                     <div className="absolute top-3 left-3">
//                         <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
//                             <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
//                             LIVE
//                         </span>
//                     </div>
//                 )}
//             </div>
//         );
//     }

//     // For other video types (MP4, HLS, etc.)
//     return (
//         <div className="relative bg-[#1a0a14] w-full aspect-video overflow-hidden">
//             <video
//                 controls
//                 autoPlay={isLive}
//                 className="w-full h-full"
//             >
//                 <source src={videoUrl} type={videoType === "mp4" ? "video/mp4" : "application/x-mpegURL"} />
//                 Your browser does not support the video tag.
//             </video>
//             {isLive && (
//                 <div className="absolute top-3 left-3">
//                     <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
//                         <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
//                         LIVE
//                     </span>
//                 </div>
//             )}
//         </div>
//     );
// }







// components/watch-along/VideoPlayer.tsx (iframe version)
"use client";

interface VideoPlayerProps {
  videoUrl: string;
  isLive?: boolean;
}

export default function VideoPlayer({ videoUrl, isLive }: VideoPlayerProps) {
  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = getYouTubeId(videoUrl);

  if (!videoUrl) {
    return (
      <div className="absolute inset-0 bg-[#1a0a14] flex items-center justify-center">
        <p className="text-gray-400">No video stream available</p>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="absolute inset-0 bg-[#1a0a14] flex items-center justify-center">
        <p className="text-red-400">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      
      {/* Live badge */}
      {isLive && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        </div>
      )}
    </div>
  );
}