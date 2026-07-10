// chandus' code

// "use client";  

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";
// import { ArrowLeft, ArrowDown, ArrowUp } from "lucide-react";
// import CommentsSection from "@/src/components/CommentsSection";
// import PlaylistDialog from "@/src/components/playlistdialog-component/playlistdialog";
// import { useAuth } from "@/context/AuthContext";


// type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

// interface ArticleDetail {
//     id: string;
//     badge: BadgeType;
//     title: string;
//     readTime: string;
//     views: string;
//     image: string;
//     createdAt: number;
//     updatedAt?: number;
//     description: string[];
// }

// const BADGE_COLORS: Record<BadgeType, string> = {
//     FEATURE: "bg-pink-600",
//     ANALYSIS: "bg-blue-600",
//     OPINION: "bg-purple-600",
//     NEWS: "bg-orange-500",
// };

// function ShareIcon() {
//     return (
//         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//             <circle cx="18" cy="5" r="3" />
//             <circle cx="6" cy="12" r="3" />
//             <circle cx="18" cy="19" r="3" />
//             <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
//         </svg>
//     );
// }

// function LikeIcon({ filled }: { filled: boolean }) {
//     return (
//         <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#d4537e" : "none"} stroke={filled ? "#d4537e" : "currentColor"} strokeWidth="1.5">
//             <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
//             <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
//         </svg>
//     );
// }

// function CommentIcon() {
//     return (
//         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//             <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
//         </svg>
//     );
// }

// function BookmarkIcon({ filled }: { filled: boolean }) {
//     return (
//         <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
//             <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
//         </svg>
//     );
// }

// export default function CricketArticleDetail() {
//     const { id } = useParams();
//     const router = useRouter();
//     const { user, getUserName } = useAuth();
//     const [article, setArticle] = useState<ArticleDetail | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // UI state
//     const [liked, setLiked] = useState(false);
//     const [bookmarked, setBookmarked] = useState(false);
//     const [activePanel, setActivePanel] = useState<"comments" | "share" | null>(null);
//     const [copied, setCopied] = useState(false);
//     const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
//     // --- NEW SCROLL STATE & LOGIC ---
//     const [isNearTop, setIsNearTop] = useState(true);
//     const [isNearBottom, setIsNearBottom] = useState(false);

//     const scrollToTop = () => {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     const scrollToBottom = () => {
//         window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
//     };

//     useEffect(() => {
//         const handleScroll = () => {
//             const scrollY = window.scrollY;
//             const windowHeight = window.innerHeight;
//             const documentHeight = document.documentElement.scrollHeight;

//             const topThreshold = 500;
//             const bottomThreshold = 500;

//             setIsNearTop(scrollY < topThreshold);
            
//             // FIX: Only show near bottom IF they have actually scrolled down away from the top!
//             setIsNearBottom(
//                 scrollY + windowHeight >= documentHeight - bottomThreshold && scrollY > 200
//             );
//         };

//         window.addEventListener("scroll", handleScroll);
        
//         // FIX: Delay the first check by 100ms so images have time to calculate their height
//         setTimeout(handleScroll, 100); 

//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);
//     // --------------------------------
//     const getUserId = () => user?.userId || null;

//     const buildArticleUrl = (articleId: string) => {
//         if (typeof window === "undefined") return "";
//         return `${window.location.origin}/MainModules/CricketArticles/${articleId}`;
//     };

//     const buildShareText = (target: ArticleDetail) => {
//         const shareUrl = buildArticleUrl(target.id);
//         return [`Read ${target.title} on Sportsfan`, `${target.readTime} • ${target.views}`, `View article: ${shareUrl}`].join("\n");
//     };

//     const copyToClipboard = async (text: string) => {
//         try {
//             await navigator.clipboard.writeText(text);
//             return true;
//         } catch {
//             try {
//                 const ta = document.createElement("textarea");
//                 ta.value = text;
//                 ta.style.position = "fixed";
//                 ta.style.opacity = "0";
//                 document.body.appendChild(ta);
//                 ta.focus();
//                 ta.select();
//                 const ok = document.execCommand("copy");
//                 document.body.removeChild(ta);
//                 return ok;
//             } catch {
//                 return false;
//             }
//         }
//     };

//     const togglePanel = (panel: "comments" | "share") => {
//         setActivePanel((prev) => (prev === panel ? null : panel));
//     };

//     const handleShareToWhatsApp = () => {
//         if (!article) return;
//         const text = encodeURIComponent(buildShareText(article));
//         const appUrl = `whatsapp://send?text=${text}`;
//         const webUrl = `https://wa.me/?text=${text}`;
//         const opened = window.open(appUrl, "_self");
//         if (!opened) window.location.href = webUrl;
//     };

//     const handleShareToThreads = () => {
//         if (!article) return;
//         const text = encodeURIComponent(buildShareText(article));
//         window.open(`https://www.threads.net/intent/post?text=${text}`, "_blank", "noopener,noreferrer");
//     };

//     const handleShareToInstagram = async () => {
//         if (!article) return;
//         await copyToClipboard(buildShareText(article));
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1600);
//         window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
//     };

//     const handleShareToLinkedIn = () => {
//         if (!article) return;
//         const url = encodeURIComponent(buildArticleUrl(article.id));
//         window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
//     };

//     const handleShareToX = () => {
//         if (!article) return;
//         const text = encodeURIComponent(buildShareText(article));
//         window.open(`https://x.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
//     };

//     const handleCopyLink = async () => {
//         if (!article) return;
//         const ok = await copyToClipboard(buildShareText(article));
//         if (ok) {
//             setCopied(true);
//             setTimeout(() => setCopied(false), 1600);
//         }
//     };

//     useEffect(() => {
//         if (!id) return;
//         const fetchArticle = async () => {
//             try {
//                 const res = await axios.get(`/api/cricket-articles/${id}`);
//                 setArticle(res.data.article);
//             } catch {
//                 setError("Failed to load article.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchArticle();
//     }, [id]);

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center min-h-screen bg-[#0d0d10]">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
//             </div>
//         );
//     }

//     if (error || !article) {
//         return (
//             <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d0d10] gap-4">
//                 <p className="text-red-400">{error || "Article not found"}</p>
//                 <button onClick={() => router.back()} className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600">
//                     Go Back
//                 </button>
//             </div>
//         );
//     }

//     const SHARE_BUTTONS = [
//         { label: "WhatsApp", img: "/images/share_whatsapp.png", onClick: handleShareToWhatsApp },
//         { label: "Threads", img: "/images/share_thread.png", onClick: handleShareToThreads },
//         { label: "Instagram", img: "/images/share_insta.png", onClick: handleShareToInstagram },
//         { label: "LinkedIn", img: "/images/Share_linkedin.png", onClick: handleShareToLinkedIn },
//         { label: "X", img: "/images/Share_X.png", onClick: handleShareToX },
//         { label: "Copy link", img: "/images/share_copy_link.png", onClick: handleCopyLink },
//     ];

//     return (
//         <div className="min-h-screen text-white  px-4 py-6 max-w-6xl mx-auto pb-20">
//             {/* --- NEW FLOATING BUTTONS --- */}
            
//             {/* Down Arrow (Shows when near top) - Extra Translucent */}
//             {isNearTop && (
//                 <button
//                     onClick={scrollToBottom}
//                     className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#d4537e]/30 hover:bg-[#d4537e]/70 backdrop-blur-md border border-white/20 text-white p-3 rounded-full shadow-lg transition-all duration-300 animate-bounce"
//                     title="Scroll to bottom"
//                 >
//                     <ArrowDown size={20} />
//                 </button>
//             )}

//             {/* Up Arrow (Shows when near bottom) - Extra Translucent */}
//             {isNearBottom && (
//                 <button
//                     onClick={scrollToTop}
//                     className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#d4537e]/30 hover:bg-[#d4537e]/70 backdrop-blur-md border border-white/20 text-white p-3 rounded-full shadow-lg transition-all duration-300"
//                     title="Scroll to top"
//                 >
//                     <ArrowUp size={20} />
//                 </button>
//             )}
            
//             {/* Back */}
//             <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-5 transition cursor-pointer">
//                 <ArrowLeft size={16} />
//                 <span className="text-sm">Back</span>
//             </button>

//             {/* Badge + Title */}
//             <div className="mb-3">
//                 <span className={`text-[10px] font-bold px-2.5 py-1 rounded text-white ${BADGE_COLORS[article.badge] || "bg-gray-600"}`}>
//                     {article.badge}
//                 </span>
                 
//             </div>
             
//              <div className="flex justify-between">
//              <div>
//             <h1 className="text-xl font-bold leading-snug mb-3">{article.title}</h1>
//      </div>
//                  <div className="flex items-center gap-2">
//                         <button
//                             onClick={() => setShowPlaylistDialog(true)}
//                             className="px-4 py-2 bg-[#111111] rounded-xl border border-white/5 shadow-[0_4px_15px_rgb(0,0,0,0.5)] hover:bg-[#1a1a1a] transition-all duration-300 group active:scale-95 flex items-center justify-center"
//                             title="Add to Playlist"
//                         >
//                             <span className="text-gray-300 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase group-hover:text-white transition-colors">
//                                 Add to Playlist
//                             </span>
//                         </button>
//                         <button onClick={() => togglePanel("share")} className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer hover:bg-[#2a2a2e] transition">
//                             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                                 <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                 <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                 <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                 <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
//                             </svg>
//                         </button>
//                     </div>
//                     </div>
//             {/* Meta */}
//             <div className="flex items-center gap-2 text-gray-400 text-xs mb-4 flex-wrap">
//                 <div className="w-5 h-5 rounded-full bg-blue-900 flex items-center justify-center text-[9px] font-semibold text-blue-300">SF</div>
//                 {/* <span>By SportsFan360 Analysis Desk</span> */}
//                 <span>·</span>
//                 <span>{new Date(article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
//                 <span>·</span>
//                 <span>{article.readTime}</span>
//             </div>

//             {/* Top share icons row */}
//             {/* <div className="flex items-center gap-3 mb-5">
//                 <span className="text-xs text-gray-500">Share:</span>
//                 {[
//                     { label: "Facebook", onClick: () => {}, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg> },
//                     { label: "X", onClick: handleShareToX, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4l6.5 8.5L4 20h2l5.5-6.5L17 20h4l-6.8-8.8L20.5 4h-2l-5 5.8L8 4H4z" /></svg> },
//                     { label: "LinkedIn", onClick: handleShareToLinkedIn, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg> },
//                     { label: "Copy", onClick: handleCopyLink, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg> },
//                 ].map((btn) => (
//                     <button
//                         key={btn.label}
//                         onClick={btn.onClick}
//                         aria-label={`Share on ${btn.label}`}
//                         className="w-7 h-7 rounded-full bg-[#1e1e22] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a2a2e] transition"
//                     >
//                         {btn.icon}
//                     </button>
//                 ))}
              
//             </div> */}
//             {/* ── PlaylistDialog component ── */}
//             <PlaylistDialog
//                 open={showPlaylistDialog}
//                 onClose={() => setShowPlaylistDialog(false)}
//                 itemId={article.id || ""}
//                 itemType="article"
//                 userId={getUserId()}
//             />


//             {/* Hero Image */}
//             <div className="w-full rounded-xl  overflow-hidden mb-2">
//                 <img
//                     src={article.image}
//                     alt={article.title}
//                     className="w-full object-fit"
//                 />
//             </div>
//             <p className="text-center text-[11px] text-gray-500 mb-5">{article.title}</p>

//             {/* Article body */}
//             <div className="flex flex-col gap-4 mb-6">
//                 {article.description.map((para, index) => (
//                     <p
//                         key={index}
//                         className="text-gray-300 leading-relaxed text-[15px]"
//                         dangerouslySetInnerHTML={{ __html: para }}
//                     />
//                 ))}
//             </div>

//             {/* Action Bar */}
//             <div className="flex items-center border-t border-b border-white/10 py-2 mb-4">
//                 {/* Like */}
//                 <button
//                     onClick={() => setLiked((l) => !l)}
//                     className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${liked ? "text-pink-400" : "text-gray-400"}`}
//                 >
//                     <LikeIcon filled={liked} />
//                     <span>Like</span>
//                 </button>

//                 <div className="w-px h-6 bg-white/10" />

//                 {/* Comment */}
//                 <button
//                     onClick={() => togglePanel("comments")}
//                     className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${activePanel === "comments" ? "text-white" : "text-gray-400"}`}
//                 >
//                     <CommentIcon />
//                     <span>Comment</span>
//                 </button>

//                 <div className="w-px h-6 bg-white/10" />

//                 {/* Save */}
//                 {/* <button
//                     onClick={() => setBookmarked((b) => !b)}
//                     className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${bookmarked ? "text-white" : "text-gray-400"}`}
//                 >
//                     <BookmarkIcon filled={bookmarked} />
//                     <span>Save</span>
//                 </button> */}

//                 <div className="w-px h-6 bg-white/10" />

//                 {/* Share */}
//                 <button
//                     onClick={() => togglePanel("share")}
//                     className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${activePanel === "share" ? "text-white" : "text-gray-400"}`}
//                 >
//                     <ShareIcon />
//                     <span>Share</span>
//                 </button>
//             </div>

//             {/* Comments Panel */}
//             {activePanel === "comments" && (
//                 <div className="mb-4">
//                     <CommentsSection
//                         contentId={article.id}
//                         contentType="article"
//                         contentTitle={article.title}
//                         className="mt-2"
//                     />
//                 </div>
//             )}

//             {/* Share Panel */}
//             {activePanel === "share" && (
//                 <div className="mb-4 rounded-2xl border border-white/10 bg-[#1a1a1e] p-4">
//                     <p className="text-sm font-semibold text-white mb-3">Share Article</p>

//                     {/* Preview card */}
//                     <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
//                         <p className="text-sm font-semibold text-white line-clamp-2">{article.title}</p>
//                         <p className="text-[11px] text-white/40 mt-1.5 break-all">{buildArticleUrl(article.id)}</p>
//                     </div>

//                     {/* Share buttons */}
//                     <div className="flex flex-wrap gap-3">
//                         {SHARE_BUTTONS.map((btn) => (
//                             <button
//                                 key={btn.label}
//                                 onClick={btn.onClick}
//                                 aria-label={btn.label}
//                                 className="flex flex-col items-center gap-1.5 group"
//                             >
//                                 <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 group-hover:bg-white/10 transition">
//                                     <img src={btn.img} alt={btn.label} className="w-full h-full object-cover rounded-full" />
//                                 </div>
//                                 <span className="text-[10px] text-gray-400">{btn.label}</span>
//                             </button>
//                         ))}
//                     </div>

//                     {copied && <p className="text-xs text-emerald-400 mt-3">Copied to clipboard</p>}
//                 </div>
//             )}


//         </div>
//     );
// }








"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, ArrowDown, ArrowUp } from "lucide-react";
import CommentsSection from "@/src/components/CommentsSection";
import PlaylistDialog from "@/src/components/playlistdialog-component/playlistdialog";
import { useAuth } from "@/context/AuthContext";


type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

interface ArticleDetail {
    id: string;
    badge: BadgeType;
    title: string;
    readTime: string;
    views: string;
    likes?: number;
    viewCount?: number;
    likeCount?: number;
    likedBy?: string[];
    image: string;
    createdAt: number;
    updatedAt?: number;
    description: string[];
}

const BADGE_COLORS: Record<BadgeType, string> = {
    FEATURE: "bg-pink-600",
    ANALYSIS: "bg-blue-600",
    OPINION: "bg-purple-600",
    NEWS: "bg-orange-500",
};

const getLikeStorageKey = (articleId: string, actorId: string) => `cricket_article_like_${articleId}_${actorId}`;
const getViewCountStorageKey = (articleId: string) => `cricket_article_views_${articleId}`;
const getLikeCountStorageKey = (articleId: string) => `cricket_article_likes_${articleId}`;
const CRICKET_USER_LIKES_KEY = 'cricket_user_likes'; // Track which articles user liked from news center

const toViewCount = (viewsText: string | number | undefined) => {
    if (typeof viewsText === "number") return viewsText;
    if (!viewsText) return 0;
    const numeric = String(viewsText).replace(/[^\d]/g, "");
    return Number.parseInt(numeric, 10) || 0;
};

const formatViews = (count: number) => `${count} views`;

const readStoredCount = (key: string) => {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
};

const writeStoredCount = (key: string, count: number) => {
    localStorage.setItem(key, String(Math.max(0, count)));
};

const normalizeArticleStats = (rawArticle: Partial<ArticleDetail> | null | undefined): ArticleDetail | null => {
    if (!rawArticle || !rawArticle.id) return null;

    const resolvedViewCount =
        typeof rawArticle.viewCount === "number"
            ? rawArticle.viewCount
            : toViewCount(rawArticle.views);

    const resolvedLikeCount =
        typeof rawArticle.likes === "number"
            ? rawArticle.likes
            : typeof rawArticle.likeCount === "number"
                ? rawArticle.likeCount
                : 0;

    return {
        id: rawArticle.id,
        badge: (rawArticle.badge as BadgeType) || "NEWS",
        title: rawArticle.title || "",
        readTime: rawArticle.readTime || "",
        views: rawArticle.views ? String(rawArticle.views) : formatViews(resolvedViewCount),
        likes: resolvedLikeCount,
        likeCount: resolvedLikeCount,
        viewCount: resolvedViewCount,
        likedBy: Array.isArray(rawArticle.likedBy) ? rawArticle.likedBy : [],
        image: rawArticle.image || "",
        createdAt: rawArticle.createdAt || Date.now(),
        updatedAt: rawArticle.updatedAt,
        description: Array.isArray(rawArticle.description) ? rawArticle.description : [],
    };
};

function ShareIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
        </svg>
    );
}

function LikeIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#d4537e" : "none"} stroke={filled ? "#d4537e" : "currentColor"} strokeWidth="1.5">
            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
        </svg>
    );
}

function CommentIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
    );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
    );
}

export default function CricketArticleDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { user, getUserName } = useAuth();
    const articleId = Array.isArray(id) ? id[0] : id;
    const [article, setArticle] = useState<ArticleDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [viewCount, setViewCount] = useState(0);
    const [likeSubmitting, setLikeSubmitting] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [activePanel, setActivePanel] = useState<"comments" | "share" | null>(null);
    const [copied, setCopied] = useState(false);
    const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
    const viewSyncedForArticle = useRef<string | null>(null);
    // --- NEW SCROLL STATE & LOGIC ---
    const [isNearTop, setIsNearTop] = useState(true);
    const [isNearBottom, setIsNearBottom] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            const topThreshold = 500;
            const bottomThreshold = 500;

            setIsNearTop(scrollY < topThreshold);
            
            // FIX: Only show near bottom IF they have actually scrolled down away from the top!
            setIsNearBottom(
                scrollY + windowHeight >= documentHeight - bottomThreshold && scrollY > 200
            );
        };

        window.addEventListener("scroll", handleScroll);
        
        // FIX: Delay the first check by 100ms so images have time to calculate their height
        setTimeout(handleScroll, 100); 

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    // --------------------------------
    const getUserId = () => user?.userId || null;
    const getLikeActorId = () => user?.userId || `guest:${getUserName()}`;

    const applyStatsFromPayload = (payload: unknown) => {
        const data = payload as {
            article?: Partial<ArticleDetail>;
            views?: number | string;
            likes?: number;
            viewCount?: number;
            likeCount?: number;
        };

        setArticle((prev) => {
            if (!prev) return prev;
            const next = { ...prev };

            const responseViewCount =
                typeof data.article?.viewCount === "number"
                    ? data.article.viewCount
                    : typeof data.viewCount === "number"
                        ? data.viewCount
                        : undefined;

            if (responseViewCount !== undefined) {
                const persisted = Math.max(responseViewCount, readStoredCount(getViewCountStorageKey(prev.id)));
                writeStoredCount(getViewCountStorageKey(prev.id), persisted);
                setViewCount(persisted);
                next.viewCount = responseViewCount;
                next.views = formatViews(persisted);
            } else if (data.article?.views !== undefined) {
                const parsed = toViewCount(data.article.views);
                const persisted = Math.max(parsed, readStoredCount(getViewCountStorageKey(prev.id)));
                writeStoredCount(getViewCountStorageKey(prev.id), persisted);
                setViewCount(persisted);
                next.views = formatViews(persisted);
                next.viewCount = persisted;
            } else if (data.views !== undefined) {
                const parsed = toViewCount(data.views);
                const persisted = Math.max(parsed, readStoredCount(getViewCountStorageKey(prev.id)));
                writeStoredCount(getViewCountStorageKey(prev.id), persisted);
                setViewCount(persisted);
                next.views = formatViews(persisted);
                next.viewCount = persisted;
            }

            const responseLikeCount =
                typeof data.article?.likes === "number"
                    ? data.article.likes
                    : typeof data.article?.likeCount === "number"
                        ? data.article.likeCount
                        : typeof data.likes === "number"
                            ? data.likes
                            : typeof data.likeCount === "number"
                                ? data.likeCount
                                : undefined;

            if (responseLikeCount !== undefined) {
                const persisted = Math.max(responseLikeCount, readStoredCount(getLikeCountStorageKey(prev.id)));
                writeStoredCount(getLikeCountStorageKey(prev.id), persisted);
                next.likes = persisted;
                next.likeCount = persisted;
                setLikeCount(persisted);
            }

            if (Array.isArray(data.article?.likedBy)) {
                next.likedBy = data.article.likedBy;
            }

            return next;
        });
    };

    const buildArticleUrl = (articleId: string) => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/MainModules/CricketArticles/${articleId}`;
    };

    const buildShareText = (target: ArticleDetail) => {
        const shareUrl = buildArticleUrl(target.id);
        return [`Read ${target.title} on Sportsfan`, `${target.readTime} • ${formatViews(viewCount)}`, `View article: ${shareUrl}`].join("\n");
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            try {
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                const ok = document.execCommand("copy");
                document.body.removeChild(ta);
                return ok;
            } catch {
                return false;
            }
        }
    };

    const togglePanel = (panel: "comments" | "share") => {
        setActivePanel((prev) => (prev === panel ? null : panel));
    };

    const handleShareToWhatsApp = () => {
        if (!article) return;
        const text = encodeURIComponent(buildShareText(article));
        const appUrl = `whatsapp://send?text=${text}`;
        const webUrl = `https://wa.me/?text=${text}`;
        const opened = window.open(appUrl, "_self");
        if (!opened) window.location.href = webUrl;
    };

    const handleShareToThreads = () => {
        if (!article) return;
        const text = encodeURIComponent(buildShareText(article));
        window.open(`https://www.threads.net/intent/post?text=${text}`, "_blank", "noopener,noreferrer");
    };

    const handleShareToInstagram = async () => {
        if (!article) return;
        await copyToClipboard(buildShareText(article));
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    };

    const handleShareToLinkedIn = () => {
        if (!article) return;
        const url = encodeURIComponent(buildArticleUrl(article.id));
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
    };

    const handleShareToX = () => {
        if (!article) return;
        const text = encodeURIComponent(buildShareText(article));
        window.open(`https://x.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
    };

    const handleCopyLink = async () => {
        if (!article) return;
        const ok = await copyToClipboard(buildShareText(article));
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        }
    };

    useEffect(() => {
        if (!articleId) return;
        const fetchArticle = async () => {
            try {
                const res = await axios.get(`/api/cricket-articles/${articleId}`);
                const normalized = normalizeArticleStats(res.data.article);
                if (!normalized) {
                    setArticle(null);
                    return;
                }
                const persistedViews = Math.max(normalized.viewCount ?? 0, readStoredCount(getViewCountStorageKey(normalized.id)));
                // Sync cricket article likes: both detail page storage and any news center likes
                const persistedLikes = Math.max(
                  normalized.likeCount ?? normalized.likes ?? 0, 
                  readStoredCount(getLikeCountStorageKey(normalized.id))
                );
                writeStoredCount(getViewCountStorageKey(normalized.id), persistedViews);
                writeStoredCount(getLikeCountStorageKey(normalized.id), persistedLikes);
                normalized.viewCount = persistedViews;
                normalized.views = formatViews(persistedViews);
                normalized.likeCount = persistedLikes;
                normalized.likes = persistedLikes;
                setArticle(normalized);
                setViewCount(persistedViews);
                setLikeCount(persistedLikes);
            } catch {
                setError("Failed to load article.");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [articleId]);

    useEffect(() => {
        if (!article?.id) return;
        const actorId = getLikeActorId();
        const storageKey = getLikeStorageKey(article.id, actorId);
        
        // Check if user liked this article from news center
        const cricketUserLikesData = window.localStorage?.getItem(CRICKET_USER_LIKES_KEY);
        let userLikedFromNews = false;
        if (cricketUserLikesData) {
          try {
            const cricketUserLikes = JSON.parse(cricketUserLikesData);
            userLikedFromNews = cricketUserLikes[article.id] === true;
          } catch (e) {
            userLikedFromNews = false;
          }
        }
        
        const alreadyLiked =
            (Array.isArray(article.likedBy) && article.likedBy.includes(actorId)) ||
            localStorage.getItem(storageKey) === "1" ||
            userLikedFromNews;

        setLiked(alreadyLiked);
        const resolvedLikeCount =
            typeof article.likes === "number"
                ? article.likes
                : typeof article.likeCount === "number"
                    ? article.likeCount
                    : 0;
        const persistedLikeCount = Math.max(resolvedLikeCount, readStoredCount(getLikeCountStorageKey(article.id)));
        writeStoredCount(getLikeCountStorageKey(article.id), persistedLikeCount);
        setLikeCount(persistedLikeCount);

        const resolvedViewCount =
            typeof article.viewCount === "number"
                ? article.viewCount
                : toViewCount(article.views);
        const persistedViewCount = Math.max(resolvedViewCount, readStoredCount(getViewCountStorageKey(article.id)));
        writeStoredCount(getViewCountStorageKey(article.id), persistedViewCount);
        setViewCount(persistedViewCount);
    }, [article?.id, article?.likes, article?.likeCount, user?.userId]);

    useEffect(() => {
        if (!article?.id) return;
        if (viewSyncedForArticle.current === article.id) return;

        viewSyncedForArticle.current = article.id;

        const syncView = async () => {
            const optimisticViews = Math.max(viewCount, toViewCount(article.views), article.viewCount || 0) + 1;
            writeStoredCount(getViewCountStorageKey(article.id), optimisticViews);
            setViewCount(optimisticViews);
            setArticle((prev) => (prev && prev.id === article.id
                ? { ...prev, viewCount: optimisticViews, views: formatViews(optimisticViews) }
                : prev));

            const requests = [
                () => axios.post(`/api/cricket-articles/${article.id}/view`),
                () => axios.post(`/api/cricket-articles/${article.id}/views`),
                () => axios.patch(`/api/cricket-articles/${article.id}`, { action: "view" }),
                () => axios.put(`/api/cricket-articles/${article.id}`, { action: "view" }),
            ];

            for (const request of requests) {
                try {
                    const res = await request();
                    applyStatsFromPayload(res.data);
                    return;
                } catch {
                    // Try the next known endpoint shape.
                }
            }
        };

        void syncView();
    }, [article?.id]);

    const handleLikeClick = async () => {
        if (!article || likeSubmitting || liked) return;

        const actorId = getLikeActorId();
        const storageKey = getLikeStorageKey(article.id, actorId);
        setLikeSubmitting(true);
        const optimisticLikes = Math.max(likeCount, article.likes || 0, article.likeCount || 0) + 1;
        writeStoredCount(getLikeCountStorageKey(article.id), optimisticLikes);
        setLikeCount(optimisticLikes);
        setLiked(true);
        setArticle((prev) => (prev && prev.id === article.id
            ? { ...prev, likes: optimisticLikes, likeCount: optimisticLikes }
            : prev));

        const payload = { userId: actorId, action: "like" };
        const requests = [
            () => axios.post(`/api/cricket-articles/${article.id}/like`, payload),
            () => axios.post(`/api/cricket-articles/${article.id}/likes`, payload),
            () => axios.patch(`/api/cricket-articles/${article.id}`, payload),
            () => axios.put(`/api/cricket-articles/${article.id}`, payload),
        ];

        let backendUpdated = false;
        for (const request of requests) {
            try {
                const res = await request();
                applyStatsFromPayload(res.data);
                backendUpdated = true;
                break;
            } catch {
                // Try the next known endpoint shape.
            }
        }

        localStorage.setItem(storageKey, "1");

        // Also track in cricket user likes so news center knows user liked this
        const cricketUserLikesData = window.localStorage?.getItem(CRICKET_USER_LIKES_KEY);
        let cricketUserLikes: Record<string, boolean> = {};
        if (cricketUserLikesData) {
          try {
            cricketUserLikes = JSON.parse(cricketUserLikesData);
          } catch (e) {
            cricketUserLikes = {};
          }
        }
        cricketUserLikes[article.id] = true;
        window.localStorage?.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(cricketUserLikes));

        if (!backendUpdated) {
            // Keep optimistic count shown on UI when backend endpoint is unavailable.
        }

        setLikeSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#0d0d10]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d0d10] gap-4">
                <p className="text-red-400">{error || "Article not found"}</p>
                <button onClick={() => router.back()} className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600">
                    Go Back
                </button>
            </div>
        );
    }

    const SHARE_BUTTONS = [
        { label: "WhatsApp", img: "/images/share_whatsapp.png", onClick: handleShareToWhatsApp },
        { label: "Threads", img: "/images/share_thread.png", onClick: handleShareToThreads },
        { label: "Instagram", img: "/images/share_insta.png", onClick: handleShareToInstagram },
        { label: "LinkedIn", img: "/images/Share_linkedin.png", onClick: handleShareToLinkedIn },
        { label: "X", img: "/images/Share_X.png", onClick: handleShareToX },
        { label: "Copy link", img: "/images/share_copy_link.png", onClick: handleCopyLink },
    ];

    return (
        <div className="min-h-screen text-white  px-4 py-6 max-w-6xl mx-auto pb-20">
            {/* --- NEW FLOATING BUTTONS --- */}
            
            {/* Down Arrow (Shows when near top) - Extra Translucent */}
            {isNearTop && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#d4537e]/30 hover:bg-[#d4537e]/70 backdrop-blur-md border border-white/20 text-white p-3 rounded-full shadow-lg transition-all duration-300 animate-bounce"
                    title="Scroll to bottom"
                >
                    <ArrowDown size={20} />
                </button>
            )}

            {/* Up Arrow (Shows when near bottom) - Extra Translucent */}
            {isNearBottom && (
                <button
                    onClick={scrollToTop}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#d4537e]/30 hover:bg-[#d4537e]/70 backdrop-blur-md border border-white/20 text-white p-3 rounded-full shadow-lg transition-all duration-300"
                    title="Scroll to top"
                >
                    <ArrowUp size={20} />
                </button>
            )}
            
            {/* Back */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-5 transition cursor-pointer">
                <ArrowLeft size={16} />
                <span className="text-sm">Back</span>
            </button>

            {/* Badge + Title */}
            <div className="mb-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded text-white ${BADGE_COLORS[article.badge] || "bg-gray-600"}`}>
                    {article.badge}
                </span>
                 
            </div>
             
             <div className="flex justify-between">
             <div>
            <h1 className="text-xl font-bold leading-snug mb-3">{article.title}</h1>
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
                        <button onClick={() => togglePanel("share")} className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer hover:bg-[#2a2a2e] transition">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4" />
                                <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4" />
                                <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4" />
                                <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    </div>
            {/* Meta */}
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-4 flex-wrap">
                <div className="w-5 h-5 rounded-full bg-blue-900 flex items-center justify-center text-[9px] font-semibold text-blue-300">SF</div>
                {/* <span>By SportsFan360 Analysis Desk</span> */}
                <span>·</span>
                <span>{new Date(article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span>·</span>
                <span>{article.readTime}</span>
                <span>·</span>
                <span>{formatViews(viewCount)}</span>
                <span>·</span>
                <span>{likeCount} likes</span>
            </div>

            {/* Top share icons row */}
            {/* <div className="flex items-center gap-3 mb-5">
                <span className="text-xs text-gray-500">Share:</span>
                {[
                    { label: "Facebook", onClick: () => {}, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg> },
                    { label: "X", onClick: handleShareToX, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4l6.5 8.5L4 20h2l5.5-6.5L17 20h4l-6.8-8.8L20.5 4h-2l-5 5.8L8 4H4z" /></svg> },
                    { label: "LinkedIn", onClick: handleShareToLinkedIn, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg> },
                    { label: "Copy", onClick: handleCopyLink, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg> },
                ].map((btn) => (
                    <button
                        key={btn.label}
                        onClick={btn.onClick}
                        aria-label={`Share on ${btn.label}`}
                        className="w-7 h-7 rounded-full bg-[#1e1e22] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a2a2e] transition"
                    >
                        {btn.icon}
                    </button>
                ))}
              
            </div> */}
            {/* ── PlaylistDialog component ── */}
            <PlaylistDialog
                open={showPlaylistDialog}
                onClose={() => setShowPlaylistDialog(false)}
                itemId={article.id || ""}
                itemType="article"
                userId={getUserId()}
            />


            {/* Hero Image */}
            <div className="w-full rounded-xl  overflow-hidden mb-2">
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full object-fit"
                />
            </div>
            <p className="text-center text-[11px] text-gray-500 mb-5">{article.title}</p>

            {/* Article body */}
            <div className="flex flex-col gap-4 mb-6">
                {article.description.map((para, index) => (
                    <p
                        key={index}
                        className="text-gray-300 leading-relaxed text-[15px]"
                        dangerouslySetInnerHTML={{ __html: para }}
                    />
                ))}
            </div>

            {/* Action Bar */}
            <div className="flex items-center border-t border-b border-white/10 py-2 mb-4">
                {/* Like */}
                <button
                    onClick={handleLikeClick}
                    disabled={liked || likeSubmitting}
                    className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${liked ? "text-pink-400" : "text-gray-400"} ${(liked || likeSubmitting) ? "opacity-80 cursor-not-allowed" : ""}`}
                >
                    <LikeIcon filled={liked} />
                    <span>{liked ? `Liked (${likeCount})` : `Like (${likeCount})`}</span>
                </button>

                <div className="w-px h-6 bg-white/10" />

                {/* Comment */}
                <button
                    onClick={() => togglePanel("comments")}
                    className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${activePanel === "comments" ? "text-white" : "text-gray-400"}`}
                >
                    <CommentIcon />
                    <span>Comment</span>
                </button>

                <div className="w-px h-6 bg-white/10" />

                {/* Save */}
                {/* <button
                    onClick={() => setBookmarked((b) => !b)}
                    className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${bookmarked ? "text-white" : "text-gray-400"}`}
                >
                    <BookmarkIcon filled={bookmarked} />
                    <span>Save</span>
                </button> */}

                <div className="w-px h-6 bg-white/10" />

                {/* Share */}
                <button
                    onClick={() => togglePanel("share")}
                    className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${activePanel === "share" ? "text-white" : "text-gray-400"}`}
                >
                    <ShareIcon />
                    <span>Share</span>
                </button>
            </div>

            {/* Comments Panel */}
            {activePanel === "comments" && (
                <div className="mb-4">
                    <CommentsSection
                        contentId={article.id}
                        contentType="article"
                        contentTitle={article.title}
                        className="mt-2"
                    />
                </div>
            )}

            {/* Share Panel */}
            {activePanel === "share" && (
                <div className="mb-4 rounded-2xl border border-white/10 bg-[#1a1a1e] p-4">
                    <p className="text-sm font-semibold text-white mb-3">Share Article</p>

                    {/* Preview card */}
                    <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                        <p className="text-sm font-semibold text-white line-clamp-2">{article.title}</p>
                        <p className="text-[11px] text-white/40 mt-1.5 break-all">{buildArticleUrl(article.id)}</p>
                    </div>

                    {/* Share buttons */}
                    <div className="flex flex-wrap gap-3">
                        {SHARE_BUTTONS.map((btn) => (
                            <button
                                key={btn.label}
                                onClick={btn.onClick}
                                aria-label={btn.label}
                                className="flex flex-col items-center gap-1.5 group"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 group-hover:bg-white/10 transition">
                                    <img src={btn.img} alt={btn.label} className="w-full h-full object-cover rounded-full" />
                                </div>
                                <span className="text-[10px] text-gray-400">{btn.label}</span>
                            </button>
                        ))}
                    </div>

                    {copied && <p className="text-xs text-emerald-400 mt-3">Copied to clipboard</p>}
                </div>
            )}


        </div>
    );
}
