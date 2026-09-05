// // src/app/MainModules/CricketArticles/page.tsx

// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { Heart, Share2, ArrowRight, ArrowLeft } from "lucide-react";

// type CricketApiArticle = {
//   _id?: string | number;
//   id?: string | number;
//   title?: string;
//   description?: string[] | string;
//   summary?: string;
//   badge?: string;
//   image?: string;
//   cdn_url?: string;
//   author?: string;
//   readTime?: string;
//   createdAt?: number | string;
//   updatedAt?: number | string;
// };

// type Article = {
//   id: string;
//   rank: number;
//   title: string;
//   summary: string;
//   source: string;
//   url: string;
//   tag: string;
//   cdn_url: string;
//   author?: string;
//   readTime?: string;
//   createdAt: number;
//   likes?: number;
// };

// const NEWS_LIKES_KEY = "sportsfan_news_likes";
// const NEWS_USER_LIKES_KEY = "sportsfan_news_user_likes";
// const CRICKET_USER_LIKES_KEY = "cricket_user_likes";

// const stripHtmlTags = (html: string) => {
//   if (!html) return "";
//   return html.replace(/<[^>]*>/g, "").trim();
// };

// const formatDate = (timestamp?: number) => {
//   if (!timestamp) return "May 11, 2026";
//   const date = new Date(timestamp);
//   const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
//   return date.toLocaleDateString("en-US", options);
// };

// const copyToClipboard = async (text: string) => {
//   try {
//     await navigator.clipboard.writeText(text);
//     return true;
//   } catch {
//     try {
//       const input = document.createElement("textarea");
//       input.value = text;
//       input.style.position = "fixed";
//       input.style.opacity = "0";
//       document.body.appendChild(input);
//       input.focus();
//       input.select();
//       const ok = document.execCommand("copy");
//       document.body.removeChild(input);
//       return ok;
//     } catch {
//       return false;
//     }
//   }
// };

// export default function AllCricketArticlesPage() {
//   const [articles, setArticles] = useState<Article[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
//   const [userLikes, setUserLikes] = useState<Set<number>>(new Set());

//   const [sharedArticle, setSharedArticle] = useState<Article | null>(null);
//   const [showShareDialog, setShowShareDialog] = useState(false);
//   const [copied, setCopied] = useState(false);

//   const [badgeFilter, setBadgeFilter] = useState<string>("ALL");

//   useEffect(() => {
//     const extractSummary = (art: CricketApiArticle): string => {
//       if (Array.isArray(art.description) && art.description.length > 0) {
//         return String(art.description[0]);
//       }
//       if (typeof art.description === "string" && art.description.trim()) {
//         try {
//           const parsed = JSON.parse(art.description);
//           if (Array.isArray(parsed) && parsed.length > 0) return String(parsed[0]);
//         } catch {}
//         return art.description;
//       }
//       return art.summary || "";
//     };

//     const extractCreatedAt = (art: any): number => {
//       // Direct number (DynamoDB unix ms timestamp or seconds)
//       if (typeof art.createdAt === "number") {
//         return art.createdAt < 10000000000 ? art.createdAt * 1000 : art.createdAt;
//       }
//       if (typeof art.timeMs === "number") return art.timeMs;
//       if (typeof art.timestamp === "number") {
//         return art.timestamp < 10000000000 ? art.timestamp * 1000 : art.timestamp;
//       }

//       // Firestore Timestamp objects (.toMillis(), .seconds, ._seconds)
//       if (art.createdAt && typeof art.createdAt.toMillis === "function") {
//         return art.createdAt.toMillis();
//       }
//       if (art.createdAt && typeof art.createdAt.seconds === "number") {
//         return art.createdAt.seconds * 1000;
//       }
//       if (art.createdAt && typeof art.createdAt._seconds === "number") {
//         return art.createdAt._seconds * 1000;
//       }

//       // ISO Strings / date strings (DynamoDB standard string format)
//       if (typeof art.createdAt === "string" && art.createdAt.trim()) {
//         const parsed = Date.parse(art.createdAt);
//         if (!isNaN(parsed) && parsed > 0) return parsed;
//       }

//       // Fallbacks to updatedAt
//       if (typeof art.updatedAt === "number") {
//         return art.updatedAt < 10000000000 ? art.updatedAt * 1000 : art.updatedAt;
//       }
//       if (typeof art.updatedAt === "string" && art.updatedAt.trim()) {
//         const parsed = Date.parse(art.updatedAt);
//         if (!isNaN(parsed) && parsed > 0) return parsed;
//       }

//       return Date.now();
//     };

//     const fetchArticles = async () => {
//       try {
//         const res = await fetch(`/api/cricket-articles?t=${Date.now()}`, {
//           cache: "no-store",
//           headers: { "Cache-Control": "no-cache" },
//         });
//         if (!res.ok) {
//           setError(`Failed to load articles (HTTP ${res.status})`);
//           setLoading(false);
//           return;
//         }
//         const data = await res.json();
//         const rawArticles: CricketApiArticle[] =
//           data?.articles || data?.data || (Array.isArray(data) ? data : []);

//         const transformed: Article[] = (Array.isArray(rawArticles) ? rawArticles : []).map(
//           (article) => {
//             const articleId = String(article._id || article.id || "");
//             return {
//               id: articleId,
//               rank: 0,
//               title: article.title || "",
//               summary: extractSummary(article),
//               source: "SportsFan360",
//               url: `/MainModules/CricketArticles/${articleId}`,
//               tag: article.badge || "Cricket",
//               cdn_url: article.image || article.cdn_url || "",
//               author: article.author,
//               readTime: article.readTime,
//               createdAt: extractCreatedAt(article),
//             };
//           }
//         );

//         transformed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
//         const ranked = transformed.map((a, i) => ({ ...a, rank: i + 1 }));

//         setArticles(ranked);
//       } catch (err: any) {
//         console.error("[AllCricketArticles] Error loading articles", err);
//         setError(err?.message || "Something went wrong while loading articles");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchArticles();

//     const handleArticleCreated = () => {
//       fetchArticles();
//     };
//     window.addEventListener("cricket-article-created", handleArticleCreated);
//     return () => {
//       window.removeEventListener("cricket-article-created", handleArticleCreated);
//     };
//   }, []);

//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     const savedLikeCounts = window.localStorage.getItem(NEWS_LIKES_KEY);
//     if (savedLikeCounts) setLikeCounts(JSON.parse(savedLikeCounts));
//     const savedUserLikes = window.localStorage.getItem(NEWS_USER_LIKES_KEY);
//     if (savedUserLikes) setUserLikes(new Set(JSON.parse(savedUserLikes)));
//   }, []);

//   const toggleLike = (article: Article, currentLikes: number = 0) => {
//     const articleRank = article.rank;
//     const newUserLikes = new Set(userLikes);
//     let newCount = currentLikes;

//     if (newUserLikes.has(articleRank)) {
//       newUserLikes.delete(articleRank);
//       newCount = Math.max(0, currentLikes - 1);
//     } else {
//       newUserLikes.add(articleRank);
//       newCount = currentLikes + 1;
//     }

//     setUserLikes(newUserLikes);
//     const newLikeCounts = { ...likeCounts, [articleRank]: newCount };
//     setLikeCounts(newLikeCounts);

//     if (typeof window !== "undefined") {
//       window.localStorage.setItem(NEWS_USER_LIKES_KEY, JSON.stringify(Array.from(newUserLikes)));
//       window.localStorage.setItem(NEWS_LIKES_KEY, JSON.stringify(newLikeCounts));

//       const cricketLikeKey = `cricket_article_likes_${article.id}`;
//       window.localStorage.setItem(cricketLikeKey, String(newCount));

//       const cricketUserLikesData = window.localStorage.getItem(CRICKET_USER_LIKES_KEY);
//       let cricketUserLikes: Record<string, boolean> = {};
//       if (cricketUserLikesData) {
//         try {
//           cricketUserLikes = JSON.parse(cricketUserLikesData);
//         } catch {
//           cricketUserLikes = {};
//         }
//       }
//       if (newUserLikes.has(articleRank)) {
//         cricketUserLikes[article.id] = true;
//       } else {
//         delete cricketUserLikes[article.id];
//       }
//       window.localStorage.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(cricketUserLikes));
//     }
//   };

//   const buildShareUrl = (article: Article) => {
//     if (typeof window === "undefined") return "";
//     return `${window.location.origin}${article.url}`;
//   };

//   const buildShareText = (article: Article) => {
//     return [article.title, buildShareUrl(article)].filter(Boolean).join("\n");
//   };

//   const openShareDialog = (article: Article) => {
//     setSharedArticle(article);
//     setShowShareDialog(true);
//   };
//   const closeShareDialog = () => {
//     setShowShareDialog(false);
//     setSharedArticle(null);
//   };
//   const handleShareToWhatsApp = () => {
//     if (!sharedArticle) return;
//     window.open(`whatsapp://send?text=${encodeURIComponent(buildShareText(sharedArticle))}`, "_blank");
//   };
//   const handleShareToThreads = () => {
//     if (!sharedArticle) return;
//     window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildShareText(sharedArticle))}`, "_blank");
//   };
//   const handleShareToInstagram = async () => {
//     if (!sharedArticle) return;
//     await copyToClipboard(buildShareText(sharedArticle));
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1600);
//     window.open("https://www.instagram.com/", "_blank");
//   };
//   const handleShareToLinkedIn = () => {
//     if (!sharedArticle) return;
//     window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildShareUrl(sharedArticle))}`, "_blank");
//   };
//   const handleShareToX = () => {
//     if (!sharedArticle) return;
//     window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildShareText(sharedArticle))}`, "_blank");
//   };
//   const handleCopyLink = async () => {
//     if (!sharedArticle) return;
//     const ok = await copyToClipboard(buildShareText(sharedArticle));
//     if (ok) {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1600);
//     }
//   };

//   const badges = ["ALL", ...Array.from(new Set(articles.map((a) => a.tag.toUpperCase())))];
//   const visibleArticles =
//     badgeFilter === "ALL" ? articles : articles.filter((a) => a.tag.toUpperCase() === badgeFilter);

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] text-white">
//       <div className="max-w-[1200px] mx-auto px-4 py-6">
//         {/* Header */}
//         <div className="flex items-center gap-3 mb-2">
//           <Link
//             href="/MainModules/HomePage"
//             className="flex items-center justify-center w-9 h-9 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
//             aria-label="Back"
//           >
//             <ArrowLeft size={16} />
//           </Link>
//           <div>
//             <h1 className="text-[18px] font-bold">Articles</h1>
//             {/* <p className="text-sm text-gray-400">
//               All stories, match previews & records from around the cricket world.
//             </p> */}
//           </div>
//         </div>

//         {/* Badge filter */}
//         {badges.length > 1 && (
//           <div className="flex flex-wrap gap-2 mt-5 mb-6">
//             {badges.map((b) => (
//               <button
//                 key={b}
//                 onClick={() => setBadgeFilter(b)}
//                 className={
//                   badgeFilter === b
//                     ? "px-4 py-1.5 rounded-full text-xs font-bold border border-orange-500 text-orange-500 bg-orange-500/10"
//                     : "px-4 py-1.5 rounded-full text-xs font-medium border border-gray-700 text-gray-400 hover:border-gray-500"
//                 }
//               >
//                 {b}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Loading state */}
//         {loading && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-56 rounded-2xl border border-gray-800 bg-[#111111] animate-pulse"
//               />
//             ))}
//           </div>
//         )}

//         {/* Error state */}
//         {!loading && error && (
//           <div className="p-4 rounded-xl border border-gray-800 bg-[#111111] text-sm text-red-400">
//             {error}
//           </div>
//         )}

//         {/* Empty state */}
//         {!loading && !error && visibleArticles.length === 0 && (
//           <div className="p-8 rounded-xl border border-gray-800 bg-[#111111] text-center text-gray-400 text-sm">
//             No articles to show yet.
//           </div>
//         )}

//         {/* Articles grid */}
//         {!loading && !error && visibleArticles.length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-10 gap-4">
//             {visibleArticles.map((article) => (
//               <div
//                 key={article.id}
//                 className="flex flex-col justify-between rounded-2xl border border-gray-800 bg-[#111111] p-4 hover:border-gray-700 transition-colors"
//               >
//                 <div>
//                   <div className="flex items-start justify-between gap-2 mb-3">
//                     <img
//                       src={article.cdn_url || "/images/News_center_Default.png"}
//                       alt={article.title}
//                       className="w-16 h-16 object-cover rounded-lg"
//                       onError={(e) => {
//                         e.currentTarget.src = "/images/News_center_Default.png";
//                       }}
//                     />
//                     <span className="px-2 py-1 text-[10px] font-bold text-orange-500 border border-orange-500 rounded uppercase tracking-wider h-fit">
//                       {article.tag}
//                     </span>
//                   </div>

//                   <h3 className="text-base font-bold text-white leading-snug mb-2 line-clamp-2">
//                     {article.title}
//                   </h3>

//                   <p className="text-sm text-gray-400 line-clamp-3 mb-4">
//                     {stripHtmlTags(article.summary)}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500 mb-4">
//                     {article.author ? `${article.author} · ` : ""}
//                     {formatDate(article.createdAt)}
//                     {/* {article.readTime ? ` · ${article.readTime}` : ""} */}
//                   </p>
//                   <div className="flex items-center justify-between border-t border-gray-800 pt-3">
//                     <div className="flex gap-4">
//                       <button
//                         onClick={() =>
//                           toggleLike(article, likeCounts[article.rank] || article.likes || 0)
//                         }
//                         className={`flex items-center gap-1 text-sm transition-colors ${
//                           userLikes.has(article.rank)
//                             ? "text-pink-500"
//                             : "text-gray-400 hover:text-pink-400"
//                         }`}
//                       >
//                         <Heart
//                           size={16}
//                           fill={userLikes.has(article.rank) ? "currentColor" : "none"}
//                         />{" "}
//                         {(likeCounts[article.rank] ?? article.likes) || 0}
//                       </button>
//                       <button
//                         onClick={() => openShareDialog(article)}
//                         className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"
//                       >
//                         <Share2 size={16} /> 
//                       </button>
//                     </div>
//                     <Link
//                       href={article.url}
//                       className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-sm font-semibold"
//                     >
//                       Read More <ArrowRight size={14} />
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Share Dialog */}
//       {showShareDialog && sharedArticle && (
//         <>
//           <button
//             type="button"
//             className="fixed inset-0 z-40 bg-black/70 lg:hidden"
//             onClick={closeShareDialog}
//           />
//           <div
//             className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-white text-sm font-semibold">Share</p>
//               <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
//                 <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                   <path
//                     d="M15 5L5 15M5 5L15 15"
//                     stroke="currentColor"
//                     strokeWidth="1.5"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </button>
//             </div>
//             <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">
//               {[
//                 { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
//                 { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
//                 { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
//                 { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
//                 { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
//                 { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
//               ].map(({ handler, src, alt }) => (
//                 <button
//                   key={alt}
//                   onClick={handler}
//                   className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
//                 >
//                   <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
//                 </button>
//               ))}
//             </div>
//             {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//           </div>
//           <div
//             className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60"
//             onClick={closeShareDialog}
//           >
//             <div
//               className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center justify-between mb-3">
//                 <p className="text-white text-sm font-semibold">Share Article</p>
//                 <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
//                   <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                     <path
//                       d="M15 5L5 15M5 5L15 15"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                 </button>
//               </div>
//               <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
//                 <p className="text-white text-sm font-semibold line-clamp-2">
//                   {sharedArticle.title}
//                 </p>
//                 <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">
//                   {buildShareUrl(sharedArticle)}
//                 </p>
//               </div>
//               <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">
//                 {[
//                   { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
//                   { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
//                   { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
//                   { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
//                   { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
//                   { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
//                 ].map(({ handler, src, alt }) => (
//                   <button
//                     key={alt}
//                     onClick={handler}
//                     className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
//                   >
//                     <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
//                   </button>
//                 ))}
//               </div>
//               {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }






"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Share2, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type CricketApiArticle = {
  _id?: string | number;
  id?: string | number;
  title?: string;
  description?: string[] | string;
  summary?: string;
  badge?: string;
  image?: string;
  cdn_url?: string;
  author?: string;
  readTime?: string;
  tags?: string[] | string;
  likes?: number;
  likeCount?: number;
  likedBy?: string[];
  views?: number | string;
  viewCount?: number;
  commentCount?: number;
  createdAt?: number | string;
  updatedAt?: number | string;
};

type Article = {
  id: string;
  rank: number;
  title: string;
  summary: string;
  source: string;
  url: string;
  tag: string;
  cdn_url: string;
  author?: string;
  readTime?: string;
  tags?: string[];
  createdAt: number;
  likes: number;
  likedBy: string[];
};

const CRICKET_USER_LIKES_KEY = "cricket_user_likes";

const stripHtmlTags = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "May 11, 2026";
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
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

export default function AllCricketArticlesPage() {
  const { user, getUserName } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  const [sharedArticle, setSharedArticle] = useState<Article | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const [badgeFilter, setBadgeFilter] = useState<string>("ALL");

  const getLikeActorId = () => user?.userId || `guest:${getUserName ? getUserName() : "user"}`;

  useEffect(() => {
    const extractSummary = (art: CricketApiArticle): string => {
      if (Array.isArray(art.description) && art.description.length > 0) {
        return String(art.description[0]);
      }
      if (typeof art.description === "string" && art.description.trim()) {
        try {
          const parsed = JSON.parse(art.description);
          if (Array.isArray(parsed) && parsed.length > 0) return String(parsed[0]);
        } catch { }
        return art.description;
      }
      return art.summary || "";
    };

    const extractTags = (art: CricketApiArticle): string[] => {
      if (Array.isArray(art.tags)) {
        return art.tags.map((t) => String(t).trim()).filter(Boolean);
      }
      if (typeof art.tags === "string" && art.tags.trim()) {
        try {
          const parsed = JSON.parse(art.tags);
          if (Array.isArray(parsed)) {
            return parsed.map((t) => String(t).trim()).filter(Boolean);
          }
        } catch { }
        return art.tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
      return [];
    };

    const extractCreatedAt = (art: any): number => {
      if (typeof art.createdAt === "number") {
        return art.createdAt < 10000000000 ? art.createdAt * 1000 : art.createdAt;
      }
      if (typeof art.timeMs === "number") return art.timeMs;
      if (typeof art.timestamp === "number") {
        return art.timestamp < 10000000000 ? art.timestamp * 1000 : art.timestamp;
      }
      if (art.createdAt && typeof art.createdAt.toMillis === "function") {
        return art.createdAt.toMillis();
      }
      if (art.createdAt && typeof art.createdAt.seconds === "number") {
        return art.createdAt.seconds * 1000;
      }
      if (art.createdAt && typeof art.createdAt._seconds === "number") {
        return art.createdAt._seconds * 1000;
      }
      if (typeof art.createdAt === "string" && art.createdAt.trim()) {
        const parsed = Date.parse(art.createdAt);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      if (typeof art.updatedAt === "number") {
        return art.updatedAt < 10000000000 ? art.updatedAt * 1000 : art.updatedAt;
      }
      if (typeof art.updatedAt === "string" && art.updatedAt.trim()) {
        const parsed = Date.parse(art.updatedAt);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return Date.now();
    };

    const fetchArticles = async () => {
      try {
        const res = await fetch(`/api/cricket-articles?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) {
          setError(`Failed to load articles (HTTP ${res.status})`);
          setLoading(false);
          return;
        }
        const data = await res.json();
        const rawArticles: CricketApiArticle[] =
          data?.articles || data?.data || (Array.isArray(data) ? data : []);

        const actorId = getLikeActorId();
        const initialLikes: Record<string, number> = {};
        const initialUserLikes = new Set<string>();

        let localUserLikes: Record<string, boolean> = {};
        if (typeof window !== "undefined") {
          try {
            const raw = window.localStorage.getItem(CRICKET_USER_LIKES_KEY);
            if (raw) localUserLikes = JSON.parse(raw);
          } catch { }
        }

        const transformed: Article[] = (Array.isArray(rawArticles) ? rawArticles : []).map(
          (article) => {
            const articleId = String(article._id || article.id || "");
            const count =
              typeof article.likeCount === "number"
                ? article.likeCount
                : typeof article.likes === "number"
                  ? article.likes
                  : 0;

            const likedBy = Array.isArray(article.likedBy) ? article.likedBy : [];
            const isUserLiked = likedBy.includes(actorId) || localUserLikes[articleId] === true;

            initialLikes[articleId] = count;
            if (isUserLiked) initialUserLikes.add(articleId);

            return {
              id: articleId,
              rank: 0,
              title: article.title || "",
              summary: extractSummary(article),
              source: "SportsFan360",
              url: `/MainModules/CricketArticles/${articleId}`,
              tag: article.badge || "Cricket",
              cdn_url: article.image || article.cdn_url || "",
              author: article.author,
              readTime: article.readTime,
              tags: extractTags(article),
              createdAt: extractCreatedAt(article),
              likes: count,
              likedBy: likedBy,
            };
          }
        );

        // transformed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        // const ranked = transformed.map((a, i) => ({ ...a, rank: i + 1 }));

        // setArticles(ranked);
        const deduped = Array.from(new Map(transformed.map((a) => [a.id, a])).values());
        deduped.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const ranked = deduped.map((a, i) => ({ ...a, rank: i + 1 }));

        setArticles(ranked);
        setLikeCounts(initialLikes);
        setUserLikes(initialUserLikes);
      } catch (err: any) {
        console.error("[AllCricketArticles] Error loading articles", err);
        setError(err?.message || "Something went wrong while loading articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();

    const handleArticleCreated = () => {
      fetchArticles();
    };
    window.addEventListener("cricket-article-created", handleArticleCreated);
    return () => {
      window.removeEventListener("cricket-article-created", handleArticleCreated);
    };
  }, [user?.userId]);

  const toggleLike = async (article: Article) => {
    const articleId = article.id;
    const isCurrentlyLiked = userLikes.has(articleId);
    const currentCount = likeCounts[articleId] ?? article.likes ?? 0;

    const newIsLiked = !isCurrentlyLiked;
    const newCount = newIsLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    const nextUserLikes = new Set(userLikes);
    if (newIsLiked) {
      nextUserLikes.add(articleId);
    } else {
      nextUserLikes.delete(articleId);
    }
    setUserLikes(nextUserLikes);
    setLikeCounts((prev) => ({ ...prev, [articleId]: newCount }));

    if (typeof window !== "undefined") {
      try {
        const rawLocal = window.localStorage.getItem(CRICKET_USER_LIKES_KEY);
        let localUserLikes: Record<string, boolean> = rawLocal ? JSON.parse(rawLocal) : {};
        if (newIsLiked) {
          localUserLikes[articleId] = true;
        } else {
          delete localUserLikes[articleId];
        }
        window.localStorage.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(localUserLikes));
        window.localStorage.setItem(`cricket_article_likes_${articleId}`, String(newCount));
      } catch (e) {
        console.warn("LocalStorage like sync error:", e);
      }
    }

    try {
      const res = await fetch(`/api/cricket-articles/${articleId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getLikeActorId(),
          action: newIsLiked ? "like" : "unlike",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const serverLikeCount =
          typeof data?.likeCount === "number"
            ? data.likeCount
            : typeof data?.likes === "number"
              ? data.likes
              : newCount;

        setLikeCounts((prev) => ({ ...prev, [articleId]: serverLikeCount }));
      }
    } catch (err) {
      console.error("Failed to sync like with backend:", err);
    }
  };

  const buildShareUrl = (article: Article) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${article.url}`;
  };

  const buildShareText = (article: Article) => {
    return [article.title, buildShareUrl(article)].filter(Boolean).join("\n");
  };

  const openShareDialog = (article: Article) => {
    setSharedArticle(article);
    setShowShareDialog(true);
  };
  const closeShareDialog = () => {
    setShowShareDialog(false);
    setSharedArticle(null);
  };
  const handleShareToWhatsApp = () => {
    if (!sharedArticle) return;
    window.open(`whatsapp://send?text=${encodeURIComponent(buildShareText(sharedArticle))}`, "_blank");
  };
  const handleShareToThreads = () => {
    if (!sharedArticle) return;
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildShareText(sharedArticle))}`, "_blank");
  };
  const handleShareToInstagram = async () => {
    if (!sharedArticle) return;
    await copyToClipboard(buildShareText(sharedArticle));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    window.open("https://www.instagram.com/", "_blank");
  };
  const handleShareToLinkedIn = () => {
    if (!sharedArticle) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildShareUrl(sharedArticle))}`, "_blank");
  };
  const handleShareToX = () => {
    if (!sharedArticle) return;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildShareText(sharedArticle))}`, "_blank");
  };
  const handleCopyLink = async () => {
    if (!sharedArticle) return;
    const ok = await copyToClipboard(buildShareText(sharedArticle));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const badges = ["ALL", ...Array.from(new Set(articles.map((a) => a.tag.toUpperCase())))];
  const visibleArticles =
    badgeFilter === "ALL" ? articles : articles.filter((a) => a.tag.toUpperCase() === badgeFilter);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/MainModules/HomePage"
            className="flex items-center justify-center w-9 h-9 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-[18px] font-bold">Articles</h1>
          </div>
        </div>

        {badges.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-5 mb-6">
            {badges.map((b) => (
              <button
                key={b}
                onClick={() => setBadgeFilter(b)}
                className={
                  badgeFilter === b
                    ? "px-4 py-1.5 rounded-full text-xs font-bold border border-orange-500 text-orange-500 bg-orange-500/10"
                    : "px-4 py-1.5 rounded-full text-xs font-medium border border-gray-700 text-gray-400 hover:border-gray-500"
                }
              >
                {b}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-2xl border border-gray-800 bg-[#111111] animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-xl border border-gray-800 bg-[#111111] text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && visibleArticles.length === 0 && (
          <div className="p-8 rounded-xl border border-gray-800 bg-[#111111] text-center text-gray-400 text-sm">
            No articles to show yet.
          </div>
        )}

        {!loading && !error && visibleArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-10 gap-4">
            {visibleArticles.map((article) => {
              const isLiked = userLikes.has(article.id);
              const count = likeCounts[article.id] ?? article.likes ?? 0;

              return (
                <div
                  key={article.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-800 bg-[#111111] p-4 hover:border-gray-700 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <img
                        src={article.cdn_url || "/images/News_center_Default.png"}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/images/News_center_Default.png";
                        }}
                      />
                      <span className="px-2 py-1 text-[10px] font-bold text-orange-500 border border-orange-500 rounded uppercase tracking-wider h-fit">
                        {article.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug mb-2 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                      {stripHtmlTags(article.summary)}
                    </p>

                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {article.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-4">
                      {article.author ? `${article.author} · ` : ""}
                      {formatDate(article.createdAt)}
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                      <div className="flex gap-4">
                        <button
                          onClick={() => toggleLike(article)}
                          className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked
                              ? "text-pink-500"
                              : "text-gray-400 hover:text-pink-400"
                            }`}
                        >
                          <Heart
                            size={16}
                            fill={isLiked ? "currentColor" : "none"}
                          />{" "}
                          {count}
                        </button>
                        <button
                          onClick={() => openShareDialog(article)}
                          className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                      <Link
                        href={article.url}
                        className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-sm font-semibold"
                      >
                        Read More <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showShareDialog && sharedArticle && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            onClick={closeShareDialog}
          />
          <div
            className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-semibold">Share</p>
              <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">
              {[
                { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
                { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
                { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
                { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
                { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
                { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
              ].map(({ handler, src, alt }) => (
                <button
                  key={alt}
                  onClick={handler}
                  className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
                >
                  <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
                </button>
              ))}
            </div>
            {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
          </div>
          <div
            className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60"
            onClick={closeShareDialog}
          >
            <div
              className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-semibold">Share Article</p>
                <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M15 5L5 15M5 5L15 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                <p className="text-white text-sm font-semibold line-clamp-2">
                  {sharedArticle.title}
                </p>
                <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">
                  {buildShareUrl(sharedArticle)}
                </p>
              </div>
              <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">
                {[
                  { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
                  { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
                  { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
                  { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
                  { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
                  { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
                ].map(({ handler, src, alt }) => (
                  <button
                    key={alt}
                    onClick={handler}
                    className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
                  >
                    <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
                  </button>
                ))}
              </div>
              {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
