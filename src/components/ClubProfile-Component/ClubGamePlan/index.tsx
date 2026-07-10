// "use client";

// import { useState } from "react";
// import { ClubProfile } from "@/types/ClubProfile";

// interface Props {
//   club: ClubProfile;
// }


// type Tab = "Drops" | "Videos" | "Live" | "Posts";
// const TABS: Tab[] = ["Drops", "Videos", "Live", "Posts"];

// function SectionLabel({ text }: { text: string }) {
//   return (
//     <div className="flex items-center gap-2">
//       <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
//       <span className="text-base md:text-lg font-bold text-white">{text}</span>
//     </div>
//   );
// }

// function TabIcon({ tab, isActive }: { tab: Tab; isActive: boolean }) {
//   const stroke = isActive ? "#fff" : "#888888";
//   if (tab === "Drops") return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-[#e91e8c]"}`} />;
//   if (tab === "Videos") return (
//     <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
//       <rect x="2" y="7" width="15" height="10" rx="2" /><path d="m17 9 5 3-5 3V9z" />
//     </svg>
//   );
//   if (tab === "Live") return (
//     <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
//       <polygon points="5 3 19 12 5 21 5 3" />
//     </svg>
//   );
//   if (tab === "Posts") return <span className={`text-[14px] leading-none ${isActive ? "text-white" : "text-[#888888]"}`}>#</span>;
//   return null;
// }

// export default function ClubGamePlan({ club }: Props) {
//   const [activeTab, setActiveTab] = useState<Tab>("Drops");
//   const { strengths, media } = club;
//   const strategyTags = [
//   "Aggressive Batting",
//   "Spin-Pace Balance",
//   "Death Bowling",
// ];

//   return (
//     <div className="flex flex-col gap-4 px-4 md:px-6 pb-10">

//       {/* ── Game Plan card ── */}
//       <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
//         <SectionLabel text="Game Plan" />
//         <p className="text-[13px] md:text-sm font-bold text-white mt-3 mb-2.5">Team Strategy</p>

//         {/* 1-col mobile, 2-col tablet+ */}
//         <div className="border border-[#2a2a2a] p-6 bg-[#0d0d0d] rounded-xl">
//           {/* Description */}
//           <p className="text-[#d1d1d1] text-[15px] leading-[1.7] mb-8">
//             RCB employs an aggressive batting approach with a focus on
//             powerplay dominance and explosive finishes. The team relies on a
//             balanced squad with quality spinners for middle overs and pace for
//             death bowling.
//           </p>

//           {/* Pills */}
//           <div className="flex flex-col gap-4">
//             {strategyTags.map((tag, index) => (
//               <div
//                 key={index}
//                 className={`inline-flex w-fit px-6 py-3 rounded-full border text-[12px] font-semibold
//                   ${
//                     index === 1
//                       ? "border-[#ff7a00] text-[#ff7a00]"
//                       : "border-[#ff007f] text-[#ff007f]"
//                   }`}
//               >
//                 {tag}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── Media card ── */}
//       <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">

//         {/* Tab bar */}
//         <div className="flex items-center gap-1 px-3 py-2.5 border-b border-[#2a2a2a]">
//           {TABS.map((tab) => {
//             const isActive = activeTab === tab;
//             return (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`flex items-center gap-1.5 h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[13px] md:text-sm font-bold border-0 cursor-pointer transition-colors duration-200
//                   ${isActive ? "bg-[#e91e8c] text-white" : "bg-transparent text-[#888888] hover:text-[#cccccc]"}`}
//               >
//                 <TabIcon tab={tab} isActive={isActive} />
//                 {tab}
//               </button>
//             );
//           })}
//         </div>

       
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 p-3 md:p-4">
//           {media.map((item, i) => (
//             <div key={i} className="flex flex-col gap-1.5">
//               <div className="relative rounded-xl overflow-hidden aspect-video bg-[#242424]">
//                 <img
//                   src={item.thumbnail}
//                   alt={item.title}
//                   className="w-full h-full object-cover block"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50 flex items-center justify-center">
//                   <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 backdrop-blur-sm">
//                     <svg width="13" height="13" fill="white" viewBox="0 0 24 24">
//                       <polygon points="5 3 19 12 5 21 5 3" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//               <p className="text-[12px] md:text-[13px] font-semibold text-white leading-[1.45]">{item.title}</p>
//               <p className="text-[11px] md:text-xs text-[#777777]">{item.views} views · {item.time}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }









import { useState, useEffect, useRef } from "react";
import { ClubProfile } from "@/types/ClubProfile";
import axios from "axios";
import { Headphones, Play, Loader2, Users, Sparkles } from "lucide-react";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import { usePlays } from "@/context/PlaysContext";
import Link from "next/link";

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

function audioMatchesTeam(audioTitle: string, teamName: string): boolean {
    const abbrs = TEAM_ABBR_MAP[teamName] || [teamName];
    const title = audioTitle.toUpperCase();
    return abbrs.some((abbr) => title.includes(abbr.toUpperCase()));
}

interface AudioDrop {
  id: string;
  title: string;
  url: string;
  duration: string;
  author: string;
  createdAt: string;
  plays?: string;
}

interface Props {
  club: ClubProfile;
}

type Tab = "Drops" | "Videos" | "Live" | "Posts";
const TABS: Tab[] = ["Drops", "Videos", "Live", "Posts"];

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
      <span className="text-base md:text-lg font-bold text-white">{text}</span>
    </div>
  );
}

function TabIcon({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const stroke = isActive ? "#fff" : "#888888";
  if (tab === "Drops") return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-white" : "bg-[#e91e8c]"}`} />;
  if (tab === "Videos") return (
    <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="7" width="15" height="10" rx="2" /><path d="m17 9 5 3-5 3V9z" />
    </svg>
  );
  if (tab === "Live") return (
    <svg width="13" height="13" fill="none" stroke={stroke} strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
  if (tab === "Posts") return <span className={`text-[14px] leading-none ${isActive ? "text-white" : "text-[#888888]"}`}>#</span>;
  return null;
}

function ComingSoon({ tab }: { tab: string }) {
  return (
    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#e91e8c]/5 flex items-center justify-center mb-4 border border-[#e91e8c]/10">
        <Sparkles className="text-[#e91e8c]" size={32} />
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{tab} Coming Soon</h3>
      <p className="text-gray-500 text-sm max-w-[240px]">
        We are working hard to bring you exclusive {tab.toLowerCase()} content for {tab === "Live" ? "your favorite teams" : "this club"}.
      </p>
    </div>
  );
}

function DropRow({ drop }: { drop: AudioDrop }) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<string>(drop.duration || "0:00");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasCountedPlay = useRef(false);
  const { audioManager, currentAudio } = useGlobalAudio();
  const { playsMap, incrementPlay } = usePlays();
  const plays = playsMap[drop.id] ?? parseInt(drop.plays || "0");

  const isCurrentlyPlaying = currentAudio === audioRef.current && playing;

  useEffect(() => {
    if (drop.url) {
      audioRef.current = new Audio(drop.url);
      const handleMetadata = () => {
        const audio = audioRef.current;
        if (audio && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          const m = Math.floor(audio.duration / 60);
          const s = Math.floor(audio.duration % 60);
          setDuration(`${m}:${s.toString().padStart(2, "0")}`);
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
  }, [drop.url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing && currentAudio === audio) {
      audioManager.pause(audio, () => setPlaying(false));
    } else {
      audioManager.play(
        audio,
        () => {
          setPlaying(true);
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
  }, [currentAudio, playing]);

  return (
    <div className="flex items-center justify-between px-3 py-3 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl mb-2 gap-3 group hover:border-[#e91e8c]/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlay();
          }}
          className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-[#e91e8c]/40 transition-colors z-10"
        >
          {isCurrentlyPlaying ? (
            <span className="w-3 h-3 flex gap-0.5 items-end">
              <span className="w-1 h-3 bg-[#e91e8c] rounded-sm animate-pulse" />
              <span className="w-1 h-2 bg-[#e91e8c] rounded-sm animate-pulse delay-75" />
              <span className="w-1 h-3 bg-[#e91e8c] rounded-sm animate-pulse delay-150" />
            </span>
          ) : (
            <Headphones size={16} className="text-[#e91e8c]" />
          )}
        </button>

        <Link 
          href={`/MainModules/MatchesDropContent/AudioDropScreen?id=${encodeURIComponent(drop.id)}`}
          className="min-w-0 flex-1 cursor-pointer"
        >
          <p className="text-white text-sm font-medium leading-snug line-clamp-1">{drop.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-gray-500 text-[10px]">{duration}</span>
            {plays > 0 && (
              <span className="flex items-center gap-0.5 text-gray-600 text-[10px]">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 1L7 4L1.5 7V1Z" fill="#666" />
                </svg>
                {plays.toLocaleString()}
              </span>
            )}
            <span className="text-gray-500 text-[10px] flex items-center gap-1">
              <Users size={8} /> {drop.author}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

interface CloudinaryAudio {
  id: string;
  title: string;
  url: string;
  duration: string;
  createdAt: string;
  matchInfo?: {
    speaker?: string;
  };
}

export default function ClubGamePlan({ club }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Drops");
  const [audioDrops, setAudioDrops] = useState<AudioDrop[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(false);
  const { strengths, insights, name, about } = club;
  const { fetchPlays } = usePlays();

  useEffect(() => {
    async function fetchDrops() {
      setLoadingDrops(true);
      try {
        const res = await axios.get("/api/cloudinary/audio?limit=100");
        if (res.data.success) {
          const allDrops: AudioDrop[] = res.data.audioFiles.map((audio: CloudinaryAudio) => ({
            id: audio.id,
            title: audio.title,
            url: audio.url,
            duration: audio.duration,
            author: audio.matchInfo?.speaker || "SportsFan360",
            createdAt: audio.createdAt,
          }));
          
          // Filter by club name/abbreviation
          const filtered = allDrops.filter((d: AudioDrop) => audioMatchesTeam(d.title, name));
          setAudioDrops(filtered);
          fetchPlays();
        }
      } catch (err) {
        console.error("Error fetching drops:", err);
      } finally {
        setLoadingDrops(false);
      }
    }
    fetchDrops();
  }, [name, fetchPlays]);
  
  // Use dynamic strengths from API or fallback
  const strategyTags = strengths && strengths.length > 0 
    ? strengths 
    : [
        "Aggressive Batting",
        "Spin-Pace Balance", 
        "Death Bowling",
      ];
  
  // Generate team description from insights or use dynamic about text
  const teamDescription = insights && insights.length > 0 && insights[0].description
    ? insights[0].description
    : about || `${name} is a professional Twenty20 cricket team that competes in the Indian Premier League. The team is known for its competitive spirit and passionate fan base.`;

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pb-10">

      {/* ── Game Plan card ── */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Game Plan" />
        <p className="text-[13px] md:text-sm font-bold text-white mt-3 mb-2.5">Team Strategy</p>

        <div className="border border-[#2a2a2a] p-6 bg-[#0d0d0d] rounded-xl">
          {/* Dynamic Description */}
          <p className="text-[#d1d1d1] text-[15px] leading-[1.7] mb-8">
            {teamDescription}
          </p>

          {/* Dynamic Pills based on strengths */}
          <div className="flex flex-col gap-4">
            {strategyTags.map((tag, index) => (
              <div
                key={index}
                className={`inline-flex w-fit px-6 py-3 rounded-full border text-[12px] font-semibold
                  ${
                    index === 1
                      ? "border-[#ff7a00] text-[#ff7a00]"
                      : "border-[#ff007f] text-[#ff007f]"
                  }`}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Media card ── */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-3 py-2.5 border-b border-[#2a2a2a]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[13px] md:text-sm font-bold border-0 cursor-pointer transition-colors duration-200
                  ${isActive ? "bg-[#e91e8c] text-white" : "bg-transparent text-[#888888] hover:text-[#cccccc]"}`}
              >
                <TabIcon tab={tab} isActive={isActive} />
                {tab}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content based on Tab */}
        <div className="p-3 md:p-4">
          {activeTab === "Drops" ? (
            <div className="flex flex-col gap-1">
              {loadingDrops ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 size={24} className="animate-spin text-[#e91e8c]" />
                  <p className="text-gray-500 text-xs">Loading drops...</p>
                </div>
              ) : audioDrops.length > 0 ? (
                audioDrops.map((drop) => (
                  <DropRow key={drop.id} drop={drop} />
                ))
              ) : (
                <div className="text-center py-10">
                  <Headphones size={32} className="text-[#2a2a2a] mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No audio drops for {name} yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              {(activeTab === "Videos" || activeTab === "Live" || activeTab === "Posts") ? (
                <ComingSoon tab={activeTab} />
              ) : club.media && club.media.length > 0 ? (
                club.media.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-[#242424] group cursor-pointer">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 backdrop-blur-sm">
                          <svg width="13" height="13" fill="white" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="text-[12px] md:text-[13px] font-semibold text-white leading-[1.45] line-clamp-2">{item.title}</p>
                    <p className="text-[11px] md:text-xs text-[#777777]">{item.views} views · {item.time}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 lg:col-span-4 text-center py-8 text-gray-400">
                  No {activeTab} content available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}