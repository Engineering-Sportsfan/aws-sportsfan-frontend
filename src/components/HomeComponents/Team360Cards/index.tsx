// "use client";

// import { useEffect, useState } from "react";
// import { MoreHorizontal } from "lucide-react";
// import axios from "axios";
// import Link from "next/link";

// interface CatField {
//     label: string;
//     logo: string;
// }

// interface CategoryField {
//     title: string;
//     image: string;
// }

// interface Post {
//     id: string;
//     teamName: string;
//     title: string;
//     category: CategoryField[];
//     likes: number;
//     comments: number;
//     live: number;
//     shares: number;
//     image: string;
//     logo: string;
//     catlogo: CatField[];
//     hasVideo?: boolean;
//     createdAt: number;
// }

// export default function Team360CardsSection() {
//     const [posts, setPosts] = useState<Post[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
//     const [sharePost, setSharePost] = useState<Post | null>(null);
//     const [copied, setCopied] = useState(false);

//     // Add admin base URL
//     const ADMIN_BASE_URL = 'https://sportsfan360.vercel.app';


//     const getFullImageUrl = (path: string) => {
//         if (!path) return "";

//         return path.startsWith("http")
//             ? path
//             : `https://sportsfan360.vercel.app${path}`;
//     };

//     useEffect(() => {
//         const fetchPosts = async () => {
//             try {
//                 const res = await axios.get("/api/team360");
//                 console.log("Fetched posts:", res.data);

//                 // Transform posts to add full URLs for debugging
//                 const transformedPosts = res.data.posts?.map((post: Post) => ({
//                     ...post,
//                     logoFullUrl: getFullImageUrl(post.logo),
//                     imageFullUrl: getFullImageUrl(post.image),
//                     catlogo: post.catlogo?.map(logo => ({
//                         ...logo,
//                         fullUrl: getFullImageUrl(logo.logo)
//                     })),
//                     category: post.category?.map(cat => ({
//                         ...cat,
//                         fullUrl: getFullImageUrl(cat.image)
//                     }))
//                 })) || [];

//                 setPosts(transformedPosts);
//             } catch (error) {
//                 console.error("Failed to fetch team360 posts", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchPosts();
//     }, []);

//     const getISTTimeAgo = (timestamp: number) => {
//         const now = Date.now();
//         const diff = now - timestamp;

//         const minutes = Math.floor(diff / (1000 * 60));
//         const hours = Math.floor(diff / (1000 * 60 * 60));
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));

//         if (minutes < 60) return `${minutes}m ago`;
//         if (hours < 24) return `${hours}h ago`;
//         return `${days}d ago`;
//     };

//     const handleImageError = (id: string, type: string, url: string) => {
//         console.error(`Image failed to load: ${type} - URL: ${url}`);
//         setImageErrors(prev => ({
//             ...prev,
//             [`${id}-${type}`]: true
//         }));
//     };

//     const resolveShareImageUrl = (post: Post) => {
//         if (!post.image) return "/images/share.png";
//         return post.image.startsWith("http") ? post.image : `https://sportsfan360.vercel.app${post.image}`;
//     };

//     const buildShareUrl = (post: Post) => {
//         if (typeof window === "undefined") return "";
//         return `${window.location.origin}/MainModules/Team360/share/${post.id}`;
//     };

//     const buildShareText = (post: Post) => {
//         const previewLink = buildShareUrl(post);

//         return [
//             `${post.teamName} | Team 360 World`,
//             post.title,
//             `View the photo preview and details:`,
//             previewLink,
//         ].join("\n");
//     };

//     const copyToClipboard = async (text: string) => {
//         try {
//             await navigator.clipboard.writeText(text);
//             return true;
//         } catch {
//             try {
//                 const input = document.createElement("textarea");
//                 input.value = text;
//                 input.style.position = "fixed";
//                 input.style.opacity = "0";
//                 document.body.appendChild(input);
//                 input.focus();
//                 input.select();
//                 const ok = document.execCommand("copy");
//                 document.body.removeChild(input);
//                 return ok;
//             } catch {
//                 return false;
//             }
//         }
//     };

//     const openShare = (post: Post) => {
//         setSharePost(post);
//         setCopied(false);
//     };

//     const closeShare = () => {
//         setSharePost(null);
//         setCopied(false);
//     };

//     const handleShareToWhatsApp = () => {
//         if (!sharePost) return;
//         const shareText = buildShareText(sharePost);
//         const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
//         const whatsappWebFallbackUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

//         const opened = window.open(whatsappAppUrl, "_self");
//         if (!opened) {
//             window.location.href = whatsappWebFallbackUrl;
//         }
//     };

//     const handleShareToThreads = () => {
//         if (!sharePost) return;
//         const shareText = buildShareText(sharePost);
//         window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
//     };

//     const handleShareToInstagram = async () => {
//         if (!sharePost) return;
//         const shareText = buildShareText(sharePost);
//         const ok = await copyToClipboard(shareText);
//         if (ok) {
//             setCopied(true);
//             setTimeout(() => setCopied(false), 1600);
//         }
//         window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
//     };

//     const handleCopyLink = async () => {
//         if (!sharePost) return;
//         const ok = await copyToClipboard(buildShareText(sharePost));
//         if (!ok) return;
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1600);
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
//                     <p className="text-gray-400">Loading posts...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !posts) {
//         return (
//             <div className="flex justify-center items-center bg-[#0d0d10] w-[30px] h-[30px] rounded-lg mx-auto mt-10">
//                 <div className="text-center">
//                     <p className="text-red-400 mb-4">{error || "Posts not found"}</p>
//                     <button
//                         onClick={() => window.history.back()}
//                         className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600"
//                     >
//                         Go Back
//                     </button>
//                 </div>
//             </div>
//         );
//     }
//     return (
//         <div className="w-full py-4">
//             <h1 className="text-[20px] text-white" style={{ fontWeight: 700 }}>
//                 Teams 360 World
//             </h1>

//             <div className="flex gap-4 overflow-x-auto  [scrollbar-width:none] snap-x snap-mandatory mt-4">
//                 {posts.map((post) => (
//                     <div
//                         key={post.id}
//                         className="min-w-[280px] sm:min-w-[320px] max-w-[320px] bg-black rounded-xl shadow-sm border border-gray-800 overflow-hidden snap-start"
//                     >
//                         {/* Header */}
//                         <div className="p-3 flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
//                                     {!imageErrors[`${post.id}-logo`] ? (
//                                         <img
//                                             src={getFullImageUrl(post.logo)}
//                                             alt={post.teamName}
//                                             className="w-full h-full object-cover"
//                                             onError={(e) => {
//                                                 console.log(`Logo error for ${post.teamName}:`, e.currentTarget.src);
//                                                 handleImageError(post.id, 'logo', e.currentTarget.src);
//                                             }}
//                                         />
//                                     ) : (
//                                         <div className="w-full h-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-white text-xs">
//                                             {post.teamName.charAt(0)}
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <h3 className="font-semibold text-white text-sm leading-tight">
//                                         {post.teamName}
//                                     </h3>
//                                     <p className="text-[10px] text-gray-400">
//                                         {getISTTimeAgo(post.createdAt)}
//                                     </p>
//                                 </div>
//                             </div>

//                             <MoreHorizontal size={18} className="text-gray-400" />
//                         </div>

//                         {/* Main Image */}
//                         <div className="relative aspect-video bg-gray-800">
//                             <Link href={`/MainModules/ClubsProfile?teamProfile=${encodeURIComponent(post.teamName)}`} className="absolute inset-0">
//                             {!imageErrors[`${post.id}-main`] ? (
//                                 <img
//                                     src={getFullImageUrl(post.image)}
//                                     alt={post.title}
//                                     className="w-full h-full object-cover"
//                                     onError={(e) => {
//                                         console.log(`Main image error for ${post.title}:`, e.currentTarget.src);
//                                         handleImageError(post.id, 'main', e.currentTarget.src);
//                                     }}
//                                 />
//                             ) : (
//                                 <div className="w-full h-full flex items-center justify-center text-gray-400">
//                                     Image not available
//                                 </div>
//                             )}
//                             </Link>
//                         </div>

//                         {/* Content */}
//                         <div className="mb-2 mt-2 ml-2">
//                             <h4 className="font-semibold text-white text-sm">
//                                 {post.title}
//                             </h4>

//                             {post.category && post.category.length > 0 && (
//                                 <div className="flex items-center gap-2 mt-1 flex-wrap">
//                                     {post.category.map((cat, i) => (
//                                         <span
//                                             key={i}
//                                             className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-400 text-xs px-2 py-1 rounded-xl"
//                                         >
//                                             {cat.image && (
//                                                 <img
//                                                     src={getFullImageUrl(cat.image)}
//                                                     alt={cat.title}
//                                                     className="w-3.5 h-3.5 object-cover rounded-sm shrink-0"
//                                                 />
//                                             )}
//                                             {cat.title}
//                                         </span>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Stats */}
//                         <div className="p-3">
//                             <div className="flex items-center gap-2 flex-row mb-3 whitespace-nowrap">
//                                 {post.catlogo && post.catlogo.map((item, i) => (
//                                     <div
//                                         key={i}
//                                         className="flex flex-row gap-2 rounded-2xl px-2 py-1 bg-gray-950 items-center"
//                                     >
//                                         {!imageErrors[`${post.id}-catlogo-${i}`] ? (
//                                             <img
//                                                 src={getFullImageUrl(item.logo)}
//                                                 alt={item.label}
//                                                 className="w-[20px] h-[20px] object-cover"
//                                                 onError={(e) => {
//                                                     console.log(`Catlogo error for ${item.label}:`, e.currentTarget.src);
//                                                     handleImageError(post.id, `catlogo-${i}`, e.currentTarget.src);
//                                                 }}
//                                             />
//                                         ) : (
//                                             <div className="w-[20px] h-[20px] bg-gray-700 rounded-full" />
//                                         )}
//                                         <span className="text-sm text-gray-400">
//                                             {item.label}
//                                         </span>
//                                     </div>

//                                 ))}
//                                 <button
//                                     type="button"
//                                     onClick={() => openShare(post)}
//                                     className="ml-auto w-7 h-7 rounded-full bg-[#1e1e22] flex items-center justify-center hover:bg-[#2a2a2e] transition"
//                                     aria-label={`Share ${post.teamName}`}
//                                 >
//                                     <img src="/images/share.png" alt="Share" className="w-4 h-4 object-contain" />
//                                 </button>
//                             </div>

//                             {/* Buttons */}
//                             <Link href={`/MainModules/DropScreen?teamName=${encodeURIComponent(post.teamName)}&postId=${post.id}`} >
//                                 <button
//                                     className="text-xs bg-[#C9115F] w-full py-2 rounded-xl text-white mb-2 cursor-pointer"
//                                     style={{ fontWeight: 700 }}
//                                 >
//                                     View Full Playlist
//                                 </button>
//                             </Link>

//                             {/* <div className="flex gap-2">
//                                 <button
//                                     className="text-xs bg-[#CD620E] w-full rounded-xl py-2 text-white"
//                                     style={{ fontWeight: 700 }}
//                                 >
//                                     Stats
//                                 </button>

//                                 <button
//                                     className="text-xs bg-black w-full rounded-xl py-2 border border-[#CD620E] text-white"
//                                     style={{ fontWeight: 700 }}
//                                 >
//                                     Table
//                                 </button>
//                             </div> */}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {sharePost && (
//                 <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={closeShare}>
//                     <div className="bg-[#1a1a1a] rounded-2xl max-w-md w-full overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
//                             <div>
//                                 <p className="text-white text-lg font-semibold">Share Team 360</p>
//                                 <p className="text-white/50 text-xs mt-1">Use the preview link so the post image shows up</p>
//                             </div>
//                             <button onClick={closeShare} className="text-gray-400 hover:text-white transition" aria-label="Close share dialog">
//                                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                                     <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                                 </svg>
//                             </button>
//                         </div>

//                         <div className="p-5">
//                             <div className="rounded-[24px] overflow-hidden border border-white/10 bg-[#111114] mb-5">
//                                 <div className="relative h-48 bg-gradient-to-br from-pink-600/25 via-[#111114] to-orange-500/20">
//                                     <img src={resolveShareImageUrl(sharePost)} alt={sharePost.teamName} className="absolute inset-0 w-full h-full object-cover opacity-85" />
//                                     <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-[#111114]/20 to-transparent" />
//                                     <div className="absolute bottom-4 left-4 right-4">
//                                         <span className="inline-flex items-center rounded-full bg-pink-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
//                                             Team 360 World
//                                         </span>
//                                         <h3 className="mt-3 text-xl font-bold leading-tight">{sharePost.teamName}</h3>
//                                         <p className="mt-2 text-white/80 text-sm">{sharePost.title}</p>
//                                     </div>
//                                 </div>
//                                 <div className="p-4 text-sm text-white/70">
//                                     <p className="line-clamp-3">
//                                         {sharePost.category?.map((cat) => cat.title).filter(Boolean).join(", ") || "Latest Team 360 post"}
//                                     </p>
//                                     <a
//                                         href={buildShareUrl(sharePost)}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="mt-2 inline-block text-pink-400 break-all underline underline-offset-4 hover:text-pink-300"
//                                     >
//                                         {buildShareUrl(sharePost)}
//                                     </a>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-3 mb-3">
//                                 <button onClick={handleShareToWhatsApp} className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-left">
//                                     <img src="/images/share_whatsapp.png" alt="WhatsApp" className="w-9 h-9 mb-2" />
//                                     <p className="text-sm font-medium">WhatsApp</p>
//                                 </button>
//                                 <button onClick={handleShareToThreads} className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-left">
//                                     <img src="/images/share_thread.png" alt="Threads" className="w-9 h-9 mb-2" />
//                                     <p className="text-sm font-medium">Threads</p>
//                                 </button>
//                                 <button onClick={handleShareToInstagram} className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-left">
//                                     <img src="/images/share_insta.png" alt="Instagram" className="w-9 h-9 mb-2" />
//                                     <p className="text-sm font-medium">Instagram</p>
//                                 </button>
//                                 <button onClick={handleCopyLink} className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 text-left">
//                                     <img src="/images/share_copy_link.png" alt="Copy link" className="w-9 h-9 mb-2" />
//                                     <p className="text-sm font-medium">Copy link</p>
//                                 </button>
//                             </div>

//                             {copied && <p className="text-sm text-emerald-400 mb-3">Copied to clipboard</p>}

//                             <button
//                                 onClick={closeShare}
//                                 className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }






"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Headphones, Plus } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";


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

interface RawAudioFile {
  id: string;
  title: string;
  duration?: string;
  url: string;
}

function audioMatchesTeam(audioTitle: string, teamName: string): boolean {
  const abbrs = TEAM_ABBR_MAP[teamName] || [teamName];
  const title = audioTitle.toUpperCase();
  return abbrs.some((abbr) => title.includes(abbr.toUpperCase()));
}

interface AudioDrop {
  id: string;
  title: string;
  duration: string;
  url: string;
  plays: number;
}

interface CatField { label: string; logo: string; }
interface CategoryField { title: string; image: string; }
interface Post {
  id: string;
  teamName: string;
  title: string;
  category: CategoryField[];
  likes: number; comments: number; live: number; shares: number;
  image: string; logo: string; catlogo: CatField[];
  hasVideo?: boolean; createdAt: number;
}

function MiniAudioRow({ drop }: { drop: AudioDrop }) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<string>(drop.duration || "");
  const audioRef = useRef<HTMLAudioElement | null>(null);  // ← useRef not useState

  useEffect(() => {
    if (!drop.url) return;

    const audio = new Audio(drop.url);
    audio.preload = "metadata"; // ← only fetch duration, not full file
    audioRef.current = audio;

    const handleMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        const m = Math.floor(audio.duration / 60);
        const s = Math.floor(audio.duration % 60);
        setDuration(`${m}:${s.toString().padStart(2, "0")}`);
      }
    };

    audio.addEventListener("loadedmetadata", handleMetadata);

    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [drop.url]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-[#111] rounded-lg mb-1.5">
      <button
        onClick={toggle}
        className="w-7 h-7 rounded-md bg-[#1e1e1e] flex items-center justify-center flex-shrink-0 border border-white/5 hover:border-[#C9115F]/40 transition-colors"
      >
        {playing ? (
          <span className="w-3 h-3 flex gap-0.5 items-end">
            <span className="w-0.5 h-3 bg-[#C9115F] rounded-sm animate-pulse" />
            <span className="w-0.5 h-2 bg-[#C9115F] rounded-sm animate-pulse delay-75" />
            <span className="w-0.5 h-3 bg-[#C9115F] rounded-sm animate-pulse delay-150" />
          </span>
        ) : (
          <Headphones size={12} className="text-[#C9115F]" />
        )}
      </button>
      <Link
        href={`/MainModules/MatchesDropContent/AudioDropScreen?id=${encodeURIComponent(drop.id)}`}
        className="min-w-0 flex-1"
      >
        <p className="text-white text-xs font-medium truncate">{drop.title}</p>
        <p className="text-gray-500 text-[10px]">
          {duration || "—"} · {drop.plays} plays
        </p>
      </Link>
    </div>
  );
}

export default function Team360CardsSection() {
  const { user } = useAuth();
  const getUserId = () => user?.userId || null;
  const [playlistPost, setPlaylistPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [audioDropsMap, setAudioDropsMap] = useState<Record<string, AudioDrop[]>>({});
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [copied, setCopied] = useState(false);

  const getFullImageUrl = (path: string) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `https://sportsfan360.vercel.app${path}`;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postsRes, audioRes, playsRes] = await Promise.all([
          axios.get("/api/team360"),
          axios.get("/api/cloudinary/audio?limit=100"),
          axios.get("/api/cloudinary/plays"),
        ]);

        const fetchedPosts: Post[] = postsRes.data.posts || [];
        setPosts(fetchedPosts);

        if (audioRes.data.success) {
          const playsMap: Record<string, number> = playsRes.data.plays || {};
          const map: Record<string, AudioDrop[]> = {};
          for (const post of fetchedPosts) {
           const matches = (audioRes.data.audioFiles as RawAudioFile[])
  .filter((a) => audioMatchesTeam(a.title, post.teamName))
  .slice(0, 3)
  .map((a) => ({
    id: a.id,
    title: a.title,
    duration: a.duration || "0:00",
    url: a.url,
    plays: playsMap[a.id] || 0,
  }));
            map[post.teamName] = matches;
          }
          setAudioDropsMap(map);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getISTTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  const handleImageError = (id: string, type: string) =>
    setImageErrors((prev) => ({ ...prev, [`${id}-${type}`]: true }));

  const buildShareUrl = (post: Post) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/MainModules/Team360/share/${post.id}`
      : "";

  const buildShareText = (post: Post) =>
    `${post.teamName} | Team 360 World\n${post.title}\n${buildShareUrl(post)}`;

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { return false; }
  };

  const openShareDialog = (post: Post) => {
    setSharePost(post);
    setCopied(false);
  };

  const closeShareDialog = () => {
    setSharePost(null);
    setCopied(false);
  };

  const handleShareToWhatsApp = () => {
    if (!sharePost) return;
    const shareText = buildShareText(sharePost);
    const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    const whatsappWebFallbackUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    const opened = window.open(whatsappAppUrl, "_self");
    if (!opened) window.location.href = whatsappWebFallbackUrl;
  };

  const handleShareToThreads = () => {
    if (!sharePost) return;
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildShareText(sharePost))}`, "_blank", "noopener,noreferrer");
  };

  const handleShareToInstagram = async () => {
    if (!sharePost) return;
    const ok = await copyToClipboard(buildShareText(sharePost));
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const handleShareToLinkedIn = () => {
    if (!sharePost) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildShareUrl(sharePost))}`, "_blank", "noopener,noreferrer");
  };

  const handleShareToX = () => {
    if (!sharePost) return;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildShareText(sharePost))}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    if (!sharePost) return;
    const ok = await copyToClipboard(buildShareText(sharePost));
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <h1 className="text-[20px] text-white font-bold">Teams 360 World</h1>

      <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory mt-4">
        {posts.map((post) => {
          const teamAudio = audioDropsMap[post.teamName] || [];

          return (
            <div
              key={post.id}
              className="relative min-w-[280px] sm:min-w-[320px] max-w-[320px] h-full bg-black rounded-xl shadow-sm border border-gray-800 overflow-hidden snap-start"
             >
              {/* Header */}
              <div className="p-3 flex items-center justify-between">
                <Link 
                  href={`/MainModules/ClubsProfile?teamProfile=${encodeURIComponent(post.teamName)}`}
                  className="flex items-center gap-2"
                >    
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                    {!imageErrors[`${post.id}-logo`] ? (
                      <img
                        src={getFullImageUrl(post.logo)}
                        alt={post.teamName}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(post.id, "logo")}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-white text-xs">
                        {post.teamName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm leading-tight">{post.teamName}</h3>
                    <p className="text-[10px] text-gray-400">{getISTTimeAgo(post.createdAt)}</p>
                  </div>
                </Link>
                
                {/* NEW ACTION ICONS CONTAINER */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPlaylistPost(post);
                    }}
                    className="text-gray-400 hover:text-white transition p-1 hover:bg-gray-800 rounded-full"
                    title="Add to Playlist"
                  >
                    <Plus size={18} />
                  </button>
                  <MoreHorizontal size={18} className="text-gray-400" />
                </div>
              </div>

              {/* Main Image */}
              <div className="relative aspect-video bg-gray-800">
                <Link href={`/MainModules/ClubsProfile?teamProfile=${encodeURIComponent(post.teamName)}`} className="absolute inset-0">
                  {!imageErrors[`${post.id}-main`] ? (
                    <img
                      src={getFullImageUrl(post.image)}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(post.id, "main")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Image not available
                    </div>
                  )}
                </Link>
              </div>

              {/* Content */}
              <div className="mb-2 mt-2 ml-2 mr-2">
                <h4 className="font-semibold text-white text-sm">{post.title}</h4>
                {post.category?.length > 0 && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {post.category.map((cat, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-400 text-xs px-2 py-1 rounded-xl">
                        {cat.image && (
                          <img src={getFullImageUrl(cat.image)} alt={cat.title} className="w-3.5 h-3.5 object-cover rounded-sm shrink-0" />
                        )}
                        {cat.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Audio Drops Section — only shown if team has matching drops */}
              {teamAudio.length > 0 && (
                <div className="px-3 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-400 text-xs font-semibold tracking-wide flex items-center gap-1">
                      <Headphones size={11} className="text-[#C9115F]" /> MATCH DROPS
                    </p>
                    {/* <Link
                      href={`/MainModules/FullPlaylist?team=${encodeURIComponent(post.teamName)}`}
                      className="text-[#C9115F] text-[10px] font-bold hover:underline"
                    >
                      See all →
                    </Link> */}
                  </div>
                  {teamAudio.map((drop) => (
                    <MiniAudioRow key={drop.id} drop={drop} />
                  ))}
                </div>
              )}

              {/* Stats / catlogos */}
              <div className="p-3">
                <div className="flex items-center gap-2 flex-row mb-3 whitespace-nowrap">
                  {post.catlogo?.map((item, i) => (
                    <div key={i} className="flex flex-row gap-2 rounded-2xl px-2 py-1 bg-gray-950 items-center">
                      {!imageErrors[`${post.id}-catlogo-${i}`] ? (
                        <img
                          src={getFullImageUrl(item.logo)}
                          alt={item.label}
                          className="w-[20px] h-[20px] object-cover"
                          onError={() => handleImageError(post.id, `catlogo-${i}`)}
                        />
                      ) : (
                        <div className="w-[20px] h-[20px] bg-gray-700 rounded-full" />
                      )}
                      <span className="text-sm text-gray-400">{item.label}</span>
                    </div>
                  ))}
                  <div className="relative ml-auto">
                    <button
                      type="button"
                      onClick={() => openShareDialog(post)}
                      className="w-7 h-7 rounded-full bg-[#1e1e22] flex items-center justify-center hover:bg-[#2a2a2e] transition"
                    >
                      <img src="/images/share.png" alt="Share" className="w-4 h-4 object-contain" />
                    </button>

                    {sharePost?.id === post.id && (
                      <div
                        className="absolute bottom-full right-0 z-50 mb-2 w-[260px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white text-sm font-semibold">Share Team 360</p>
                          <button onClick={closeShareDialog} className="text-gray-400 hover:text-white transition" aria-label="Close share popup">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-2">
                          <p className="text-white text-sm font-semibold line-clamp-2">{sharePost.teamName}</p>
                          <p className="text-white/65 text-xs mt-1 line-clamp-2">{sharePost.title}</p>
                          <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildShareUrl(sharePost)}</p>
                        </div>

                        <div className="flex flex-row flex-nowrap items-center justify-between gap-1 mb-2">
                          <button onClick={handleShareToWhatsApp} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on WhatsApp">
                            <img src="/images/share_whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover rounded-full" />
                          </button>
                          <button onClick={handleShareToThreads} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on Threads">
                            <img src="/images/share_thread.png" alt="Threads" className="w-full h-full object-cover rounded-full" />
                          </button>
                          <button onClick={handleShareToInstagram} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on Instagram">
                            <img src="/images/share_insta.png" alt="Instagram" className="w-full h-full object-cover rounded-full" />
                          </button>
                          <button onClick={handleShareToLinkedIn} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on LinkedIn">
                            <img src="/images/Share_linkedin.png" alt="LinkedIn" className="w-full h-full object-cover rounded-full" />
                          </button>
                          <button onClick={handleShareToX} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on X">
                            <img src="/images/Share_X.png" alt="X" className="w-full h-full object-cover rounded-full" />
                          </button>
                          <button onClick={handleCopyLink} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Copy share link">
                            <img src="/images/share_copy_link.png" alt="Copy link" className="w-full h-full object-cover rounded-full" />
                          </button>
                        </div>
                        {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* View Full Playlist button — only shown if team has drops */}
                {teamAudio.length > 0 && (
                  <Link href={`/MainModules/MatchesDropContent?team=${encodeURIComponent(post.teamName)}`}>
                    <button className="text-xs bg-[#C9115F] w-full py-2 rounded-xl text-white mb-2 font-bold cursor-pointer">
                      View Full Playlist
                    </button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Playlist Dialog */}
      {/* {playlistPost && (
        <PlaylistDialog
          open={!!playlistPost}
          onClose={() => setPlaylistPost(null)}
          itemId={playlistPost.id}
          itemType="team360" // Adjust this if your backend expects a different string
          userId={getUserId()}
        />
      )} */}

    </div>
  );
}
