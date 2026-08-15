// "use client";

// import { ChevronRight } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";

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
// }

// const PLAYBOOK_DROPS: PlaybookDrop[] = [
//   {
//     id: "neeraj-chopra-mental-prep",
//     type: "AUDIO",
//     title: "Neeraj Chopra Mental Preparation",
//     duration: "07:12",
//     gradient: "linear-gradient(to bottom, #2b0b2e 0%, #0d0614 100%)",
//     glowColor: "rgba(233, 30, 140, 0.4)",
//     badgeBg: "rgba(233, 30, 140, 0.2)",
//     badgeTextColor: "#FF52B5",
//     mediaUrl: "https://res.cloudinary.com/dflnsufit/video/upload/v1782724872/Neeraj_Chopra_s_gold-winning_throw_Tokyo2020_Highlights_-_Olympics_youtube_u5qn38.mp3",
//   },
//   {
//     id: "coachs-corner-sprint-tech",
//     type: "VIDEO",
//     title: "Coach's Corner Sprint Techniques",
//     duration: "10:45",
//     gradient: "linear-gradient(to bottom, #3b1c0b 0%, #120805 100%)",
//     glowColor: "rgba(249, 115, 22, 0.4)",
//     badgeBg: "rgba(249, 115, 22, 0.2)",
//     badgeTextColor: "#FFA07A",
//     mediaUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
//   },
//   {
//     id: "pv-sindhu-mindset-focus",
//     type: "AUDIO",
//     title: "PV Sindhu Mindset & Focus",
//     duration: "06:30",
//     gradient: "linear-gradient(to bottom, #0b1f3b 0%, #030814 100%)",
//     glowColor: "rgba(6, 182, 212, 0.4)",
//     badgeBg: "rgba(6, 182, 212, 0.2)",
//     badgeTextColor: "#00E5FF",
//     mediaUrl: "https://res.cloudinary.com/dflnsufit/video/upload/v1782724656/126052400194-1779604741591_fdrxga.mp3",
//   },
// ];

// // Custom Athlete SVG Illustrations
// const NeerajChopraSVG = () => (
//   <svg viewBox="0 0 100 100" className="w-16 h-16 text-white/80 filter drop-shadow-[0_0_8px_rgba(233,30,140,0.5)]" fill="currentColor">
//     {/* Stylized Javelin Thrower */}
//     <circle cx="50" cy="20" r="6" />
//     <path d="M48 28c-3 4-8 10-10 16 0 1 1 2 2 1 2-2 7-8 9-11v16c-2 6-4 12-8 19-1 1 0 2 1 2 4-5 7-11 9-17l3 18c0 1 2 1 2 0l1-22V32c2-1 4-3 6-5 2-2 3-5 3-7 0-1-1-1-2 0-2 2-5 5-7 6l-3 2z" />
//     {/* Javelin Spear */}
//     <line x1="20" y1="55" x2="85" y2="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
//     {/* Energy Trail */}
//     <path d="M22 65 Q 40 45 75 22" stroke="rgba(233,30,140,0.6)" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
//   </svg>
// );

// const SprintTechniquesSVG = () => (
//   <svg viewBox="0 0 100 100" className="w-16 h-16 text-white/80 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" fill="currentColor">
//     {/* Stylized Sprinter Silhouette */}
//     <circle cx="62" cy="18" r="6" />
//     <path d="M58 26c-3-1-7-3-11-2-3 1-5 4-5 7 0 1 1 1 2 0 1-2 3-4 6-4 3 0 7 2 9 3l-3 10c-3 5-6 10-9 14-2 3-5 5-7 7-1 1 0 2 1 1 4-3 8-7 11-12l4-8c1 2 2 4 4 6 2 2 5 3 8 3 1 0 1-1 0-2-3-1-5-2-7-4l-3-6 4-6z" />
//     {/* Sprint track lanes grid lines */}
//     <path d="M15 80h70M20 73h60M25 87h50" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
//     {/* Speed lines */}
//     <line x1="15" y1="35" x2="35" y2="35" stroke="currentColor" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
//     <line x1="10" y1="45" x2="25" y2="45" stroke="currentColor" strokeWidth="2.5" opacity="0.8" strokeLinecap="round" />
//     <line x1="18" y1="55" x2="30" y2="55" stroke="currentColor" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
//   </svg>
// );

// const PVSindhuSVG = () => (
//   <svg viewBox="0 0 100 100" className="w-16 h-16 text-white/80 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" fill="currentColor">
//     {/* Stylized Badminton Smash Pose */}
//     <circle cx="48" cy="22" r="6" />
//     <path d="M45 30c-4 2-8 5-11 9 0 1 1 2 2 1 2-2 6-5 9-7v12c-1 5-2 11-4 17 0 1 1 1 2 0 2-4 4-8 5-13l3 15c0 1 2 1 2 0l2-19V34c2-2 4-4 7-6l3-3c1-1 0-2-1-1-2 1-5 3-7 5l-4 3z" />
//     {/* Badminton Racket */}
//     <path d="M60 25l12-12m2-2a3 3 0 114 4l-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//     {/* Shuttlecock */}
//     <path d="M30 45l-8-6m1.5 9l-9-3m8-3l-7-8m15 15c1 1 2.5 1 3.5 0s1-2.5 0-3.5-2.5-1-3.5 0-1 2.5 0 3.5" stroke="currentColor" strokeWidth="1" fill="none" />
//   </svg>
// );

// export default function PlaybookDrops() {
//   const router = useRouter();

//   const handleCardClick = (drop: PlaybookDrop) => {
//     const isAudio = drop.type === "AUDIO";
//     const route = isAudio ? "/MainModules/AudioDrop" : "/MainModules/VideoDrop";
//     router.push(`${route}?url=${encodeURIComponent(drop.mediaUrl)}`);
//   };

//   const getSVGForDrop = (id: string) => {
//     switch (id) {
//       case "neeraj-chopra-mental-prep":
//         return <NeerajChopraSVG />;
//       case "coachs-corner-sprint-tech":
//         return <SprintTechniquesSVG />;
//       case "pv-sindhu-mindset-focus":
//         return <PVSindhuSVG />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="w-full mt-5">
//       {/* Header section matching style of India Hub, Watch Along, etc. */}
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

//       {/* Horizontal Scroll container */}
//       <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
//         {PLAYBOOK_DROPS.map((drop) => (
//           <motion.div
//             key={drop.id}
//             onClick={() => handleCardClick(drop)}
//             whileHover={{ scale: 1.03, y: -4 }}
//             whileTap={{ scale: 0.98 }}
//             className="shrink-0 w-[210px] h-[255px] rounded-[24px] overflow-hidden flex flex-col justify-between snap-start cursor-pointer transition-shadow"
//             style={{
//               border: "1px solid rgba(255, 255, 255, 0.08)",
//               boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
//             }}
//           >
//             {/* Top Half of Card (Image / Gradient container) */}
//             <div
//               className="w-full h-[160px] relative flex items-center justify-center"
//               style={{ background: drop.gradient }}
//             >
//               {/* Audio/Video badge tag in the top-left */}
//               <span
//                 className="absolute top-4 left-4 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
//                 style={{
//                   background: drop.badgeBg,
//                   color: drop.badgeTextColor,
//                 }}
//               >
//                 {drop.type}
//               </span>

//               {/* Glowing aura graphic circle in center */}
//               <div
//                 className="w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden"
//                 style={{
//                   background: `radial-gradient(circle, ${drop.glowColor} 0%, rgba(0,0,0,0) 70%)`,
//                 }}
//               >
//                 {getSVGForDrop(drop.id)}
//               </div>

//               {/* Centered Glassmorphic Play button overlay */}
//               <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
//                 <div
//                   className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-115 group-hover:border-white/40"
//                   style={{
//                     backgroundColor: "rgba(255, 255, 255, 0.12)",
//                     backdropFilter: "blur(2px)",
//                     WebkitBackdropFilter: "blur(2px)",
//                   }}
//                 >
//                   {/* Play icon (white triangle) */}
//                   <svg
//                     width="14"
//                     height="16"
//                     viewBox="0 0 14 16"
//                     fill="none"
//                     className="text-white fill-white ml-0.5"
//                   >
//                     <path d="M13 8L1 15V1L13 8Z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Bottom Half of Card (Details container) */}
//             <div className="w-full h-[95px] bg-[#121622] p-4 flex flex-col justify-between">
//               <h4 className="text-[13.5px] font-extrabold text-white leading-[1.3] line-clamp-2">
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
}

interface PlaybookDrop {
  id: string;
  type: "AUDIO" | "VIDEO";
  title: string;
  duration: string;
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

function mapMediaToDrop(item: MediaItem, index: number): PlaybookDrop {
  const preset = STYLE_PRESETS[index % STYLE_PRESETS.length];
  const isVideo = item.resourceType === "video";

  return {
    id: item.id,
    type: isVideo ? "VIDEO" : "AUDIO",
    title: cleanTitle(item.title),
    duration: item.duration || "0:00",
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
              className="shrink-0 w-[210px] h-[255px] rounded-[24px] bg-white/5 animate-pulse"
            />
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
            className="shrink-0 w-[210px] h-[230px] rounded-[24px] overflow-hidden flex flex-col justify-between snap-start cursor-pointer transition-shadow"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              className="w-full h-[160px] relative flex items-center justify-center overflow-hidden"
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
            </div>

            <div className="w-full h-[70px] bg-[#121622] p-4 flex flex-col justify-center items-start gap-1.5">
              <h4 className="text-[13.5px] font-extrabold text-white leading-[1.3] line-clamp-2 text-left">
                {drop.title}
              </h4>
              <span className="text-[11px] font-bold text-white/40 leading-none">
                {drop.duration}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}