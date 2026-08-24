
// "use client";

// import { useEffect, useState } from "react";
// import { ChevronRight } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";

// interface MediaItem {
//   id: string;
//   title: string;
//   fileName: string;
//   url: string;
//   thumbnailUrl: string;
//   resourceType: "image" | "video";
//   duration?: string;
//   durationSeconds?: number;
//   format: string;
// }

// interface PlaybookDrop {
//   id: string;
//   type: "AUDIO" | "VIDEO";
//   title: string;
//   duration: string;
//   gradient: string;
//   glowColor: string;
//   badgeBg: string;
//   badgeTextColor: string;
//   mediaUrl: string;
//   thumbnailUrl: string;
// }

// // cycle through a few style presets since real media has no per-item styling
// const STYLE_PRESETS = [
//   {
//     gradient: "linear-gradient(to bottom, #2b0b2e 0%, #0d0614 100%)",
//     glowColor: "rgba(233, 30, 140, 0.4)",
//     badgeBg: "rgba(233, 30, 140, 0.2)",
//     badgeTextColor: "#FF52B5",
//   },
//   {
//     gradient: "linear-gradient(to bottom, #3b1c0b 0%, #120805 100%)",
//     glowColor: "rgba(249, 115, 22, 0.4)",
//     badgeBg: "rgba(249, 115, 22, 0.2)",
//     badgeTextColor: "#FFA07A",
//   },
//   {
//     gradient: "linear-gradient(to bottom, #0b1f3b 0%, #030814 100%)",
//     glowColor: "rgba(6, 182, 212, 0.4)",
//     badgeBg: "rgba(6, 182, 212, 0.2)",
//     badgeTextColor: "#00E5FF",
//   },
// ];

// // Strip Cloudinary's trailing random uniqueness suffix (e.g. "Ind vs SI lvxmu5" -> "Ind vs SI")
// function cleanTitle(title: string): string {
//   return title.replace(/\s[a-z0-9]{5,8}$/i, "");
// }

// function mapMediaToDrop(item: MediaItem, index: number): PlaybookDrop {
//   const preset = STYLE_PRESETS[index % STYLE_PRESETS.length];
//   const isVideo = item.resourceType === "video";

//   return {
//     id: item.id,
//     type: isVideo ? "VIDEO" : "AUDIO",
//     title: item.title,
//     duration: item.duration || "0:00",
//     mediaUrl: item.url,
//     thumbnailUrl: item.thumbnailUrl,
//     ...preset,
//   };
// }

// export default function PlaybookDrops() {
//   const router = useRouter();
//   const [drops, setDrops] = useState<PlaybookDrop[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchMedia() {
//       try {
//         const res = await fetch("/api/cloudinary/cricket-media");
//         const data = await res.json();
//         if (data.success) {
//           setDrops(data.mediaFiles.map(mapMediaToDrop));
//         }
//       } catch (err) {
//         console.error("Failed to load playbook drops:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchMedia();
//   }, []);

//   const handleCardClick = (drop: PlaybookDrop) => {
//     const isAudio = drop.type === "AUDIO";
//     const route = isAudio ? "/MainModules/AudioDrop" : "/MainModules/VideoDrop";
//     router.push(`${route}?url=${encodeURIComponent(drop.mediaUrl)}`);
//   };

//   if (loading) {
//     return (
//       <div className="w-full mt-5">
//         <div className="flex items-center justify-between mb-3">
//           <h3 className="text-[17px] font-extrabold text-white">Playbook Drops</h3>
//         </div>
//         <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4">
//           {[1, 2, 3].map((i) => (
//             <div
//               key={i}
//               className="shrink-0 w-[210px] h-[255px] rounded-[24px] bg-white/5 animate-pulse"
//             />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (drops.length === 0) return null;

//   return (
//     <div className="w-full mt-5">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-[17px] font-extrabold text-white">Playbook Drops</h3>
//         <button
//           type="button"
//           onClick={() => router.push("/MainModules/AtheletePlaybook")}
//           className="flex items-center gap-0.5 text-[12px] font-bold cursor-pointer hover:opacity-80 active:scale-95 transition-all"
//           style={{ color: "#E91E8C" }}
//         >
//           View all
//           <ChevronRight size={14} />
//         </button>
//       </div>

//       <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
//         {drops.map((drop) => (
//           <motion.div
//             key={drop.id}
//             onClick={() => handleCardClick(drop)}
//             whileHover={{ scale: 1.03, y: -4 }}
//             whileTap={{ scale: 0.98 }}
//             className="shrink-0 w-[210px] h-[230px] rounded-[24px] overflow-hidden flex flex-col justify-between snap-start cursor-pointer transition-shadow"
//             style={{
//               border: "1px solid rgba(255, 255, 255, 0.08)",
//               boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
//             }}
//           >
//             <div
//               className="w-full h-[160px] relative flex items-center justify-center overflow-hidden"
//               style={{ background: drop.gradient }}
//             >
//               {drop.thumbnailUrl && (
//                 <img
//                   src={drop.thumbnailUrl}
//                   alt={drop.title}
//                   className="absolute inset-0 w-full h-full object-cover opacity-70"
//                 />
//               )}

//               <span
//                 className="absolute top-4 left-4 z-10 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
//                 style={{ background: drop.badgeBg, color: drop.badgeTextColor }}
//               >
//                 {drop.type}
//               </span>

//               <div className="absolute inset-0 flex items-center justify-center bg-black/20">
//                 <div
//                   className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center"
//                   style={{
//                     backgroundColor: "rgba(255, 255, 255, 0.12)",
//                     backdropFilter: "blur(2px)",
//                     WebkitBackdropFilter: "blur(2px)",
//                   }}
//                 >
//                   <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="text-white fill-white ml-0.5">
//                     <path d="M13 8L1 15V1L13 8Z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             <div className="w-full h-[70px] bg-[#121622] p-4 flex flex-col justify-center items-start gap-1.5">
//               <h4 className="text-[13.5px] font-extrabold text-white leading-[1.3] line-clamp-2 text-left">
//                 {drop.title}
//               </h4>
//               <span className="text-[11px] font-bold text-white/40 leading-none">
//                 {drop.duration}
//               </span>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface MediaItem {
  id: string;
  title: string;
  fileName: string;
  url: string;
  thumbnailUrl: string;
  resourceType: "image" | "video";
  duration?: string;
  durationSeconds?: number;
  format: string;
  createdAt?: string;
}

interface PlaybookDrop {
  id: string;
  type: "AUDIO" | "VIDEO";
  title: string;
  duration: string;
  timestamp: string;
  gradient: string;
  glowColor: string;
  badgeBg: string;
  badgeTextColor: string;
  mediaUrl: string;
  thumbnailUrl: string;
}

// cycle through a few style presets since real media has no per-item styling
const STYLE_PRESETS = [
  {
    gradient: "linear-gradient(to bottom, #2b0b2e 0%, #0d0614 100%)",
    glowColor: "rgba(233, 30, 140, 0.4)",
    badgeBg: "rgba(233, 30, 140, 0.2)",
    badgeTextColor: "#FF52B5",
  },
  {
    gradient: "linear-gradient(to bottom, #3b1c0b 0%, #120805 100%)",
    glowColor: "rgba(249, 115, 22, 0.4)",
    badgeBg: "rgba(249, 115, 22, 0.2)",
    badgeTextColor: "#FFA07A",
  },
  {
    gradient: "linear-gradient(to bottom, #0b1f3b 0%, #030814 100%)",
    glowColor: "rgba(6, 182, 212, 0.4)",
    badgeBg: "rgba(6, 182, 212, 0.2)",
    badgeTextColor: "#00E5FF",
  },
];

// Strip Cloudinary's trailing random uniqueness suffix (e.g. "Ind vs SI lvxmu5" -> "Ind vs SI")
function cleanTitle(title: string): string {
  return title.replace(/\s[a-z0-9]{5,8}$/i, "");
}

// Format an ISO date into a short relative label (e.g. "2d ago", "5h ago")
function formatTimestamp(isoDate?: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function mapMediaToDrop(item: MediaItem, index: number): PlaybookDrop {
  const preset = STYLE_PRESETS[index % STYLE_PRESETS.length];
  const isVideo = item.resourceType === "video";

  return {
    id: item.id,
    type: isVideo ? "VIDEO" : "AUDIO",
    title: cleanTitle(item.title),
    duration: item.duration || "0:00",
    timestamp: formatTimestamp(item.createdAt),
    mediaUrl: item.url,
    thumbnailUrl: item.thumbnailUrl,
    ...preset,
  };
}

export default function PlaybookDrops() {
  const router = useRouter();
  const [drops, setDrops] = useState<PlaybookDrop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await fetch("/api/cloudinary/cricket-media");
        const data = await res.json();
        if (data.success) {
          setDrops(data.mediaFiles.map(mapMediaToDrop));
        }
      } catch (err) {
        console.error("Failed to load playbook drops:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, []);

  const handleCardClick = (drop: PlaybookDrop) => {
    const isAudio = drop.type === "AUDIO";
    const route = isAudio ? "/MainModules/AudioDrop" : "/MainModules/VideoDrop";
    router.push(`${route}?url=${encodeURIComponent(drop.mediaUrl)}`);
  };

  if (loading) {
    return (
      <div className="w-full mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[17px] font-extrabold text-white">Playbook Drops</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="shrink-0 w-[210px] rounded-[24px] bg-white/5 overflow-hidden"
              style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <div className="w-full h-[160px] bg-white/[0.06] animate-pulse" />
              <div className="w-full min-h-[62px] p-4 flex flex-col justify-center gap-2 bg-[#121622]">
                <div className="h-3 w-4/5 rounded bg-white/10 animate-pulse" />
                <div className="h-2.5 w-1/3 rounded bg-white/[0.06] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (drops.length === 0) return null;

  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">Playbook Drops</h3>
        <button
          type="button"
          onClick={() => router.push("/MainModules/AtheletePlaybook")}
          className="flex items-center gap-0.5 text-[12px] font-bold cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          style={{ color: "#E91E8C" }}
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            onClick={() => handleCardClick(drop)}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 w-[210px] rounded-[24px] overflow-hidden flex flex-col snap-start cursor-pointer transition-shadow"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              className="w-full h-[160px] relative flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: drop.gradient }}
            >
              {drop.thumbnailUrl && (
                <img
                  src={drop.thumbnailUrl}
                  alt={drop.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
              )}

              <span
                className="absolute top-4 left-4 z-10 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ background: drop.badgeBg, color: drop.badgeTextColor }}
              >
                {drop.type}
              </span>

              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div
                  className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                  }}
                >
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="text-white fill-white ml-0.5">
                    <path d="M13 8L1 15V1L13 8Z" />
                  </svg>
                </div>
              </div>

              {/* Duration badge, bottom-right of the thumbnail */}
              <span
                className="absolute bottom-2.5 right-2.5 z-10 text-[10px] font-bold text-white px-2 py-0.5 rounded-md leading-none"
                style={{ background: "rgba(0, 0, 0, 0.6)" }}
              >
                {drop.duration}
              </span>
            </div>

            <div className="w-full min-h-[62px] bg-[#121622] p-4 flex flex-col justify-start gap-1.5">
              <h4 className="text-[10.5px] font-bold text-white leading-[1.3] text-left">
                {drop.title}
              </h4>

              {drop.timestamp && (
                <div className="w-full flex justify-start">
                  <span className="text-[10.5px] font-semibold text-white/30 leading-none">
                    {drop.timestamp}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}