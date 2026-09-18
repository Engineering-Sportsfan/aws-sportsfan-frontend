

// //src/components/HomeComponents/index.tsx

// "use client";

// import React, { useEffect, useId, useState } from 'react';
// import Link from 'next/link';
// import { Heart, Share2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
// import { NewsArticle } from '../../../../types/news';
// import { useRouter } from 'next/navigation';

// declare const process: {
//   env: Record<string, string | undefined>;
// };

// type CricketApiArticle = {
//   id?: string | number;
//   title?: string;
//   description?: string[];
//   summary?: string;
//   badge?: string;
//   image?: string;
//   cdn_url?: string;
//   createdAt?: number | string;
// };

// type DebugInfo = {
//   status: 'loading' | 'error' | 'empty' | 'ok';
//   newsCount?: number;
//   cricketCount?: number;
//   error?: string;
//   baseUrl?: string;
//   newsStatusCode?: number;
// };

// const stripHtmlTags = (html: string) => {
//   if (!html) return '';
//   return html.replace(/<[^>]*>/g, '').trim();
// };

// const NEWS_LIKES_KEY = 'sportsfan_news_likes';
// const NEWS_USER_LIKES_KEY = 'sportsfan_news_user_likes';
// const CRICKET_USER_LIKES_KEY = 'cricket_user_likes'; // Track which users liked which cricket articles

// const formatDate = (timestamp?: number) => {
//   if (!timestamp) return 'May 11, 2026';
//   const date = new Date(timestamp);
//   const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
//   return date.toLocaleDateString('en-US', options);
// };

// const copyToClipboard = async (text: string) => {
//   try {
//     await navigator.clipboard.writeText(text);
//     return true;
//   } catch {
//     try {
//       const input = document.createElement('textarea');
//       input.value = text;
//       input.style.position = 'fixed';
//       input.style.opacity = '0';
//       document.body.appendChild(input);
//       input.focus();
//       input.select();
//       const ok = document.execCommand('copy');
//       document.body.removeChild(input);
//       return ok;
//     } catch {
//       return false;
//     }
//   }
// };

// const buildNewsShareUrl = (article: NewsArticle) => {
//   if (typeof window === 'undefined') return '';
//   return `${window.location.origin}/MainModules/news-center?rank=${encodeURIComponent(article.rank)}`;
// };

// const buildNewsShareText = (article: NewsArticle) => {
//   const shareUrl = buildNewsShareUrl(article);
//   return [
//     article.title,
//     shareUrl,
//   ].filter(Boolean).join('\n');
// };

// export default function NewsCenter() {
//   const [articles, setArticles] = useState<NewsArticle[]>([]);
//   const [debugInfo, setDebugInfo] = useState<DebugInfo>({ status: 'loading' });
//   const [startIndex, setStartIndex] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);
//   const [sharedArticle, setSharedArticle] = useState<NewsArticle | null>(null);
//   const [showShareDialog, setShowShareDialog] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
//   const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
//   const animationId = useId();

//   const openShareDialog = (article: NewsArticle) => {
//     setSharedArticle(article);
//     setShowShareDialog(true);
//   };

//   const closeShareDialog = () => {
//     setShowShareDialog(false);
//     setSharedArticle(null);
//   };

//   const handleShareToWhatsApp = () => {
//     if (!sharedArticle) return;
//     window.open(`whatsapp://send?text=${encodeURIComponent(buildNewsShareText(sharedArticle))}`, '_blank');
//   };

//   const handleShareToThreads = () => {
//     if (!sharedArticle) return;
//     window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildNewsShareText(sharedArticle))}`, '_blank');
//   };

//   const handleShareToInstagram = async () => {
//     if (!sharedArticle) return;
//     await copyToClipboard(buildNewsShareText(sharedArticle));
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1600);
//     window.open('https://www.instagram.com/', '_blank');
//   };

//   const handleShareToLinkedIn = () => {
//     if (!sharedArticle) return;
//     window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildNewsShareUrl(sharedArticle))}`, '_blank');
//   };

//   const handleShareToX = () => {
//     if (!sharedArticle) return;
//     window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildNewsShareText(sharedArticle))}`, '_blank');
//   };

//   const handleCopyLink = async () => {
//     if (!sharedArticle) return;
//     const ok = await copyToClipboard(buildNewsShareText(sharedArticle));
//     if (ok) {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1600);
//     }
//   };

//   const nextSlide = () => {
//     if (articles.length === 0) return;
//     setStartIndex((current) => (current + 1) % articles.length);
//   };

//   const prevSlide = () => {
//     if (articles.length === 0) return;
//     setStartIndex((current) => (current - 1 + articles.length) % articles.length);
//   };

//   const toggleLike = (article: NewsArticle, currentLikes: number = 0) => {
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

//     if (typeof window !== 'undefined') {
//       window.localStorage.setItem(NEWS_USER_LIKES_KEY, JSON.stringify(Array.from(newUserLikes)));
//       window.localStorage.setItem(NEWS_LIKES_KEY, JSON.stringify(newLikeCounts));

//       // Sync cricket article likes if this is a cricket article
//       if (article.id && article.url.includes('/MainModules/CricketArticles/')) {
//         const cricketLikeKey = `cricket_article_likes_${article.id}`;
//         window.localStorage.setItem(cricketLikeKey, String(newCount));

//         // Track that this user liked this cricket article
//         const cricketUserLikesData = window.localStorage.getItem(CRICKET_USER_LIKES_KEY);
//         let cricketUserLikes: Record<string, boolean> = {};
//         if (cricketUserLikesData) {
//           try {
//             cricketUserLikes = JSON.parse(cricketUserLikesData);
//           } catch {
//             cricketUserLikes = {};
//           }
//         }

//         if (newUserLikes.has(articleRank)) {
//           // User liked - track the article ID
//           cricketUserLikes[article.id] = true;
//         } else {
//           // User unliked - remove tracking
//           delete cricketUserLikes[article.id];
//         }

//         window.localStorage.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(cricketUserLikes));
//       }
//     }
//   };

//   useEffect(() => {
//     const fetchNews = async () => {
//       try {
//         const cricketRes = await fetch('/api/cricket-articles');
//         console.log('[NewsCenter] cricket-articles status:', cricketRes.status, cricketRes.ok);

//         if (!cricketRes.ok) {
//           setDebugInfo({
//             status: 'error',
//             error: `cricket-articles returned HTTP ${cricketRes.status}`,
//             newsStatusCode: cricketRes.status,
//           });
//           return;
//         }

//         const cricketData = await cricketRes.json();
//         const cricketArticles: CricketApiArticle[] =
//           cricketData?.articles || cricketData?.data || (Array.isArray(cricketData) ? cricketData : []);
//         console.log('[NewsCenter] cricket articles fetched:', cricketArticles.length);

//         const transformedCricket: NewsArticle[] = (Array.isArray(cricketArticles) ? cricketArticles : []).map(
//           (article: CricketApiArticle) => ({
//             rank: 0,
//             title: article.title || '',
//             summary: article.description?.[0] || article.summary || '',
//             source: 'SportsFan360',
//             url: `/MainModules/CricketArticles/${article.id}`,
//             tag: article.badge || 'Cricket',
//             cdn_url: article.image || article.cdn_url || '',
//             createdAt:
//               typeof article.createdAt === 'number'
//                 ? article.createdAt
//                 : article.createdAt
//                   ? Date.parse(String(article.createdAt))
//                   : Date.now(),
//             id: String(article.id) // Add cricket article ID for sync
//           })
//         );

//         transformedCricket.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

//         const rankedArticles = transformedCricket.map((article, index) => ({
//           ...article,
//           rank: index + 1,
//         }));

//         setArticles(rankedArticles);
//         setDebugInfo({
//           status: rankedArticles.length === 0 ? 'empty' : 'ok',
//           cricketCount: transformedCricket.length,
//           newsStatusCode: cricketRes.status,
//         });
//       } catch (error: any) {
//         console.error('[NewsCenter] Error loading news', error);
//         setDebugInfo({
//           status: 'error',
//           error: error?.message || String(error),
//         });
//       }
//     };

//     fetchNews();
//   }, []);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     const savedLikeCounts = window.localStorage.getItem(NEWS_LIKES_KEY);
//     if (savedLikeCounts) {
//       setLikeCounts(JSON.parse(savedLikeCounts));
//     }
//     const savedUserLikes = window.localStorage.getItem(NEWS_USER_LIKES_KEY);
//     if (savedUserLikes) {
//       setUserLikes(new Set(JSON.parse(savedUserLikes)));
//     }
//   }, []);

//   // Instead of silently returning null (which made it impossible to tell
//   // whether the component was loading, erroring, or genuinely had zero
//   // articles), render a visible debug panel with whatever we know so far.
//   if (articles.length === 0) {
//     return (
//       <div className="w-full p-4 rounded-xl border border-gray-800 bg-[#111111] text-sm">
//         <p className="text-white font-semibold mb-2">
//           News Center — {debugInfo.status === 'loading' ? 'loading…' : 'no articles to show'}
//         </p>
//         <div className="space-y-1 text-gray-400">
//           <p>status: <span className="text-gray-200">{debugInfo.status}</span></p>
//           {debugInfo.baseUrl !== undefined && (
//             <p>NEXT_PUBLIC_BACKEND_URL: <span className="text-gray-200">"{debugInfo.baseUrl}"</span></p>
//           )}
//           {debugInfo.newsStatusCode !== undefined && (
//             <p>news-center HTTP status: <span className="text-gray-200">{debugInfo.newsStatusCode}</span></p>
//           )}
//           {debugInfo.newsCount !== undefined && (
//             <p>news articles fetched: <span className="text-gray-200">{debugInfo.newsCount}</span></p>
//           )}
//           {debugInfo.cricketCount !== undefined && (
//             <p>cricket articles fetched: <span className="text-gray-200">{debugInfo.cricketCount}</span></p>
//           )}
//           {debugInfo.error && (
//             <p className="text-red-400">error: {debugInfo.error}</p>
//           )}
//         </div>
//       </div>
//     );
//   }

//   const hasMultiple = articles.length > 1;
//   const safeAnimationId = `news-scroll-${animationId.replace(/:/g, '')}`;
//   const durationSeconds = Math.max(40, articles.length * 8);
//   const rotatedArticles = [...articles.slice(startIndex), ...articles.slice(0, startIndex)];
//   const duplicated = hasMultiple ? [...rotatedArticles, ...rotatedArticles] : rotatedArticles;
//   const router = useRouter();

//   return (
//     <div className="w-full flex flex-col gap-4 py-4 rounded-xl">
//       <div className="flex justify-between items-center px-2">
//         <div>
//           {/* <h2 className="text-2xl font-bold text-white">News Center</h2> */}
         
//           {/* <h2 className="text-[17px] font-bold text-white">Cricket Articles</h2> */}
//            <h3 className="text-[17px] font-extrabold text-white">Cricket Articles</h3>
//           {/* <p className="text-sm text-gray-400">Top stories, match previews & records from around the cricket world.</p> */}
//         </div>
//         {/* <Link href="/MainModules/CricketArticles" className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-all text-sm shrink-0">
//           View All <ArrowRight size={16} />
//         </Link> */}
//         <button
//           type="button"
//           onClick={() => router.push("/MainModules/CricketArticles")}
//           className="flex items-center gap-0.5 text-[12px] font-bold"
//           style={{ color: "#E91E8C" }}
//         >
//           View all
//           <ChevronRight size={14} />
//         </button>
//       </div>

//       <div
//         className="relative flex items-center group w-full bg-[#111111] p-3 rounded-2xl border border-gray-800"
//         onMouseEnter={() => setIsPaused(true)}
//         onMouseLeave={() => setIsPaused(false)}
//         onFocus={() => setIsPaused(true)}
//         onBlur={() => setIsPaused(false)}
//       >
//         {hasMultiple && (
//           <button
//             type="button"
//             onClick={prevSlide}
//             aria-label="Previous news articles"
//             className="absolute left-2 z-10 p-2 bg-black/50 text-white rounded-full border border-gray-600 hover:bg-black transition-all"
//           >
//             <ChevronLeft size={20} />
//           </button>
//         )}

//         <div className="overflow-hidden w-full px-4">
//           {hasMultiple && (
//             <style>{`
//               @keyframes ${safeAnimationId} {
//                 from { transform: translateX(0); }
//                 to { transform: translateX(-50%); }
//               }
//             `}</style>
//           )}
//           <div
//             className="flex gap-2"
//             style={
//               hasMultiple
//                 ? {
//                     width: 'max-content',
//                     animationName: safeAnimationId,
//                     animationDuration: `${durationSeconds}s`,
//                     animationTimingFunction: 'linear',
//                     animationIterationCount: 'infinite',
//                     animationPlayState: isPaused ? 'paused' : 'running',
//                   }
//                 : { width: '100%' }
//             }
//           >
//             {duplicated.map((article: NewsArticle, index: number) => (
//               <div key={`${article.rank}-${index}`} className={hasMultiple ? "flex-none w-[calc(90vw-3rem)] sm:w-[calc(50vw-3rem)] max-w-[690px] flex flex-col justify-between border-l-2 border-orange-500 pl-3 py-2" : "w-full flex flex-col justify-between border-l-2 border-orange-500 pl-3 py-2"}>
//                 <div>
//                   <div className="flex justify-between items-start mb-3 gap-2">
//                     <div className="flex items-start gap-3">
//                       <img
//                         src={article.source === 'SportsFan360' && article.cdn_url ? article.cdn_url : '/images/News_center_Default.png'}
//                         alt={article.title}
//                         className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
//                         onError={(e) => {
//                           e.currentTarget.src = '/images/News_center_Default.png';
//                         }}
//                       />
//                       <span className="px-2 py-1 text-[10px] font-bold text-orange-500 border border-orange-500 rounded uppercase tracking-wider h-fit">
//                         {article.tag}
//                       </span>
//                     </div>
//                     {/* <span className="text-xs text-gray-400">{formatDate(article.createdAt)}</span> */}
//                   </div>
//                   {/* <h3 className="text-lg font-bold text-white leading-tight mb-3 line-clamp-2">
//                     {article.title}
//                   </h3> */}
//                   <p className="text-sm text-gray-400 line-clamp-2 mb-4">
//                     {stripHtmlTags(article.summary)}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500 mb-4">{article.source} • {formatDate(article.createdAt)}</p>
//                   <div className="flex items-center justify-between border-t border-gray-800 pt-3">
//                     <div className="flex gap-4">
//                       <button onClick={() => toggleLike(article, likeCounts[article.rank] || article.likes || 0)} className={`flex items-center gap-1 text-sm transition-colors ${userLikes.has(article.rank) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}>
//                         <Heart size={16} fill={userLikes.has(article.rank) ? 'currentColor' : 'none'} /> {(likeCounts[article.rank] ?? article.likes) || 0}
//                       </button>
//                       <button onClick={() => openShareDialog(article)} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
//                         <Share2 size={16} /> Share
//                       </button>
//                     </div>
//                     {article.source === 'SportsFan360' || article.url?.includes('/MainModules/CricketArticles/') ? (
//                       <Link href={article.url} className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-sm font-semibold">
//                         Read More <ArrowRight size={14} />
//                       </Link>
//                     ) : (
//                       <a href={article.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-sm font-semibold">
//                         Read More <ArrowRight size={14} />
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {hasMultiple && (
//           <button
//             type="button"
//             onClick={nextSlide}
//             aria-label="Next news articles"
//             className="absolute right-2 z-10 p-2 bg-black/50 text-white rounded-full border border-gray-600 hover:bg-black transition-all"
//           >
//             <ChevronRight size={20} />
//           </button>
//         )}

//         {hasMultiple && (
//           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
//             <span className={`w-4 h-1 rounded-full ${startIndex === 0 ? 'bg-pink-500' : 'bg-gray-600'}`}></span>
//             <span className={`w-4 h-1 rounded-full ${startIndex === 1 ? 'bg-pink-500' : 'bg-gray-600'}`}></span>
//             <span className={`w-4 h-1 rounded-full ${startIndex === 2 ? 'bg-pink-500' : 'bg-gray-600'}`}></span>
//             <span className={`w-4 h-1 rounded-full ${startIndex >= 3 ? 'bg-pink-500' : 'bg-gray-600'}`}></span>
//           </div>
//         )}
//       </div>

//       {/* Share Dialog */}
//       {showShareDialog && sharedArticle && (
//         <>
//           <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
//           <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-white text-sm font-semibold">Share</p>
//               <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
//                 <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
//               </button>
//             </div>
//             <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">
//               {[
//                 { handler: handleShareToWhatsApp, src: '/images/share_whatsapp.png', alt: 'WhatsApp' },
//                 { handler: handleShareToThreads, src: '/images/share_thread.png', alt: 'Threads' },
//                 { handler: handleShareToInstagram, src: '/images/share_insta.png', alt: 'Instagram' },
//                 { handler: handleShareToLinkedIn, src: '/images/Share_linkedin.png', alt: 'LinkedIn' },
//                 { handler: handleShareToX, src: '/images/Share_X.png', alt: 'X' },
//                 { handler: handleCopyLink, src: '/images/share_copy_link.png', alt: 'Copy' },
//               ].map(({ handler, src, alt }) => (
//                 <button key={alt} onClick={handler} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
//                   <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
//                 </button>
//               ))}
//             </div>
//             {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//           </div>
//           <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
//             <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
//               <div className="flex items-center justify-between mb-3">
//                 <p className="text-white text-sm font-semibold">Share Article</p>
//                 <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
//                   <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
//                 </button>
//               </div>
//               <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
//                 <p className="text-white text-sm font-semibold line-clamp-2">{sharedArticle.title}</p>
//                 <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildNewsShareUrl(sharedArticle)}</p>
//               </div>
//               <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">
//                 {[
//                   { handler: handleShareToWhatsApp, src: '/images/share_whatsapp.png', alt: 'WhatsApp' },
//                   { handler: handleShareToThreads, src: '/images/share_thread.png', alt: 'Threads' },
//                   { handler: handleShareToInstagram, src: '/images/share_insta.png', alt: 'Instagram' },
//                   { handler: handleShareToLinkedIn, src: '/images/Share_linkedin.png', alt: 'LinkedIn' },
//                   { handler: handleShareToX, src: '/images/Share_X.png', alt: 'X' },
//                   { handler: handleCopyLink, src: '/images/share_copy_link.png', alt: 'Copy' },
//                 ].map(({ handler, src, alt }) => (
//                   <button key={alt} onClick={handler} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
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





//src/components/HomeComponents/NewsCenter/index.tsx

"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Share2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../../../../types/news';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

declare const process: {
  env: Record<string, string | undefined>;
};

type CricketApiArticle = {
  _id?: string | number;
  id?: string | number;
  title?: string;
  author?: string;
  tags?: string[] | string;
  description?: string[] | string;
  summary?: string;
  badge?: string;
  image?: string;
  cdn_url?: string;
  createdAt?: number | string;
  updatedAt?: number | string;
  likes?: number;
  likeCount?: number;
  likedBy?: string[];
};

type DebugInfo = {
  status: 'loading' | 'error' | 'empty' | 'ok';
  newsCount?: number;
  cricketCount?: number;
  error?: string;
  baseUrl?: string;
  newsStatusCode?: number;
};

// Extract tags array safely
const extractTags = (rawTags: any): string[] => {
  if (Array.isArray(rawTags)) {
    return rawTags.map((t: any) => String(t).trim()).filter(Boolean);
  }
  if (typeof rawTags === 'string' && rawTags.trim()) {
    try {
      const parsed = JSON.parse(rawTags);
      if (Array.isArray(parsed)) {
        return parsed.map((t: any) => String(t).trim()).filter(Boolean);
      }
    } catch {}
    return rawTags.split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  return [];
};

const stripHtmlTags = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

const CRICKET_USER_LIKES_KEY = 'cricket_user_likes'; // Track which users liked which cricket articles

const readStoredCount = (key: string) => {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(key);
  if (!raw) return 0;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'May 11, 2026';
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const input = document.createElement('textarea');
      input.value = text;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.focus();
      input.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(input);
      return ok;
    } catch {
      return false;
    }
  }
};

const buildNewsShareUrl = (article: NewsArticle) => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/MainModules/news-center?rank=${encodeURIComponent(article.rank)}`;
};

const buildNewsShareText = (article: NewsArticle) => {
  const shareUrl = buildNewsShareUrl(article);
  return [
    article.title,
    shareUrl,
  ].filter(Boolean).join('\n');
};

export default function NewsCenter() {
  const { user, getUserName } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({ status: 'loading' });
  const [sharedArticle, setSharedArticle] = useState<NewsArticle | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollToIndex = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: idx * width,
      behavior: 'smooth',
    });
    setActiveIndex(idx);
  };

  const getLikeActorId = () => user?.userId || `guest:${getUserName ? getUserName() : 'user'}`;

  const openShareDialog = (article: NewsArticle, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSharedArticle(article);
    setShowShareDialog(true);
  };

  const closeShareDialog = () => {
    setShowShareDialog(false);
    setSharedArticle(null);
  };

  const handleShareToWhatsApp = () => {
    if (!sharedArticle) return;
    window.open(`whatsapp://send?text=${encodeURIComponent(buildNewsShareText(sharedArticle))}`, '_blank');
  };

  const handleShareToThreads = () => {
    if (!sharedArticle) return;
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildNewsShareText(sharedArticle))}`, '_blank');
  };

  const handleShareToInstagram = async () => {
    if (!sharedArticle) return;
    await copyToClipboard(buildNewsShareText(sharedArticle));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    window.open('https://www.instagram.com/', '_blank');
  };

  const handleShareToLinkedIn = () => {
    if (!sharedArticle) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildNewsShareUrl(sharedArticle))}`, '_blank');
  };

  const handleShareToX = () => {
    if (!sharedArticle) return;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildNewsShareText(sharedArticle))}`, '_blank');
  };

  const handleCopyLink = async () => {
    if (!sharedArticle) return;
    const ok = await copyToClipboard(buildNewsShareText(sharedArticle));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const toggleLike = async (article: NewsArticle, currentLikes: number = 0, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const articleId = article.id || String(article.rank);
    const isCurrentlyLiked = userLikes.has(articleId);
    const count = (likeCounts[articleId] !== undefined) ? likeCounts[articleId] : (article.likes || currentLikes || 0);

    const newIsLiked = !isCurrentlyLiked;
    const newCount = newIsLiked ? count + 1 : Math.max(0, count - 1);

    const nextUserLikes = new Set(userLikes);
    if (newIsLiked) {
      nextUserLikes.add(articleId);
    } else {
      nextUserLikes.delete(articleId);
    }

    setUserLikes(nextUserLikes);
    setLikeCounts((prev) => ({ ...prev, [articleId]: newCount }));

    const actorId = getLikeActorId();

    if (typeof window !== 'undefined') {
      try {
        const rawLocal = window.localStorage.getItem(CRICKET_USER_LIKES_KEY);
        let localUserLikes: Record<string, boolean> = rawLocal ? JSON.parse(rawLocal) : {};
        if (newIsLiked) {
          localUserLikes[articleId] = true;
          window.localStorage.setItem(`cricket_article_like_${articleId}_${actorId}`, '1');
        } else {
          delete localUserLikes[articleId];
          window.localStorage.removeItem(`cricket_article_like_${articleId}_${actorId}`);
        }
        window.localStorage.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(localUserLikes));
        window.localStorage.setItem(`cricket_article_likes_${articleId}`, String(newCount));
      } catch (e) {
        console.warn('LocalStorage like sync error in NewsCenter:', e);
      }

      window.dispatchEvent(
        new CustomEvent('cricket-article-liked', {
          detail: { articleId, likeCount: newCount, isLiked: newIsLiked },
        })
      );
    }

    if (article.id) {
      try {
        const res = await fetch(`/api/cricket-articles/${article.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: actorId,
            action: newIsLiked ? 'like' : 'unlike',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const serverLikeCount =
            typeof data?.likeCount === 'number'
              ? data.likeCount
              : typeof data?.likes === 'number'
                ? data.likes
                : newCount;

          setLikeCounts((prev) => ({ ...prev, [articleId]: serverLikeCount }));
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(`cricket_article_likes_${articleId}`, String(serverLikeCount));
            window.dispatchEvent(
              new CustomEvent('cricket-article-liked', {
                detail: { articleId, likeCount: serverLikeCount, isLiked: newIsLiked },
              })
            );
          }
        }
      } catch (err) {
        console.error('[NewsCenter] Failed to sync like with backend:', err);
      }
    }
  };

  useEffect(() => {
    const extractSummary = (art: CricketApiArticle): string => {
      if (Array.isArray(art.description) && art.description.length > 0) {
        return String(art.description[0]);
      }
      if (typeof art.description === 'string' && art.description.trim()) {
        try {
          const parsed = JSON.parse(art.description);
          if (Array.isArray(parsed) && parsed.length > 0) return String(parsed[0]);
        } catch {}
        return art.description;
      }
      return art.summary || '';
    };

    const extractCreatedAt = (art: any): number => {
      // Direct number (DynamoDB unix ms timestamp or seconds)
      if (typeof art.createdAt === 'number') {
        return art.createdAt < 10000000000 ? art.createdAt * 1000 : art.createdAt;
      }
      if (typeof art.timeMs === 'number') return art.timeMs;
      if (typeof art.timestamp === 'number') {
        return art.timestamp < 10000000000 ? art.timestamp * 1000 : art.timestamp;
      }

      // Firestore Timestamp objects (.toMillis(), .seconds, ._seconds)
      if (art.createdAt && typeof art.createdAt.toMillis === 'function') {
        return art.createdAt.toMillis();
      }
      if (art.createdAt && typeof art.createdAt.seconds === 'number') {
        return art.createdAt.seconds * 1000;
      }
      if (art.createdAt && typeof art.createdAt._seconds === 'number') {
        return art.createdAt._seconds * 1000;
      }

      // ISO Strings / date strings (DynamoDB standard string format)
      if (typeof art.createdAt === 'string' && art.createdAt.trim()) {
        const parsed = Date.parse(art.createdAt);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }

      // Fallbacks to updatedAt
      if (typeof art.updatedAt === 'number') {
        return art.updatedAt < 10000000000 ? art.updatedAt * 1000 : art.updatedAt;
      }
      if (typeof art.updatedAt === 'string' && art.updatedAt.trim()) {
        const parsed = Date.parse(art.updatedAt);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }

      return Date.now();
    };

    const fetchNews = async () => {
      try {
        const cricketRes = await fetch(`/api/cricket-articles?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Accept': 'application/json' },
        });

        let cricketData: any = null;
        try {
          const text = await cricketRes.text();
          if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
            cricketData = JSON.parse(text);
          }
        } catch (parseErr) {
          console.warn('[NewsCenter] cricket-articles non-JSON response:', parseErr);
        }

        if (!cricketRes.ok && !cricketData) {
          setDebugInfo({
            status: 'error',
            error: `cricket-articles returned HTTP ${cricketRes.status}`,
            newsStatusCode: cricketRes.status,
          });
          setLoading(false);
          return;
        }

        const cricketArticles: CricketApiArticle[] =
          cricketData?.articles || cricketData?.data || (Array.isArray(cricketData) ? cricketData : []);
        console.log('[NewsCenter] cricket articles fetched:', cricketArticles.length);

        const actorId = getLikeActorId();
        const initialLikes: Record<string, number> = {};
        const initialUserLikes = new Set<string>();

        let localUserLikes: Record<string, boolean> = {};
        if (typeof window !== 'undefined') {
          try {
            const raw = window.localStorage.getItem(CRICKET_USER_LIKES_KEY);
            if (raw) localUserLikes = JSON.parse(raw);
          } catch {}
        }

        const transformedCricket: NewsArticle[] = (Array.isArray(cricketArticles) ? cricketArticles : []).map(
          (article: CricketApiArticle) => {
            const articleId = String(article._id || article.id || '');
            const author = article.author || '';
            const count =
              typeof article.likeCount === 'number'
                ? article.likeCount
                : typeof article.likes === 'number'
                  ? article.likes
                  : 0;

            const storedCount = readStoredCount(`cricket_article_likes_${articleId}`);
            const resolvedCount = Math.max(count, storedCount);
            initialLikes[articleId] = resolvedCount;

            const likedBy = Array.isArray(article.likedBy) ? article.likedBy : [];
            const isUserLiked =
              likedBy.includes(actorId) ||
              localUserLikes[articleId] === true ||
              (typeof window !== 'undefined' &&
                window.localStorage?.getItem(`cricket_article_like_${articleId}_${actorId}`) === '1');

            if (isUserLiked) initialUserLikes.add(articleId);

            return {
              rank: 0,
              title: article.title || '',
              summary: extractSummary(article),
              source: author || 'SportsFan360',
              author: author,
              url: `/MainModules/CricketArticles/${articleId}`,
              tag: article.badge || 'Cricket',
              tags: extractTags(article.tags),
              cdn_url: article.image || article.cdn_url || '',
              createdAt: extractCreatedAt(article),
              id: articleId,
              likes: resolvedCount,
            };
          }
        );

        transformedCricket.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        const rankedArticles = transformedCricket.map((article, index) => ({
          ...article,
          rank: index + 1,
        }));

        setArticles(rankedArticles);
        setLikeCounts((prev) => ({ ...initialLikes, ...prev }));
        setUserLikes((prev) => new Set([...Array.from(initialUserLikes), ...Array.from(prev)]));

        setDebugInfo({
          status: rankedArticles.length === 0 ? 'empty' : 'ok',
          cricketCount: transformedCricket.length,
          newsStatusCode: cricketRes.status,
        });
        setLoading(false);
      } catch (error: any) {
        console.error('[NewsCenter] Error loading news', error);
        setDebugInfo({
          status: 'error',
          error: error?.message || String(error),
        });
        setLoading(false);
      }
    };

    fetchNews();

    const handleArticleCreated = () => {
      fetchNews();
    };
    window.addEventListener('cricket-article-created', handleArticleCreated);
    return () => {
      window.removeEventListener('cricket-article-created', handleArticleCreated);
    };
  }, [user?.userId]);

  useEffect(() => {
    const handleLikeSync = (e: any) => {
      const detail = e.detail;
      if (detail && detail.articleId) {
        setLikeCounts((prev) => ({ ...prev, [detail.articleId]: detail.likeCount }));
        setUserLikes((prev) => {
          const next = new Set(prev);
          if (detail.isLiked) next.add(detail.articleId);
          else next.delete(detail.articleId);
          return next;
        });
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith('cricket_article_likes_')) {
        const articleId = e.key.replace('cricket_article_likes_', '');
        const count = parseInt(e.newValue || '0', 10);
        if (!isNaN(count)) {
          setLikeCounts((prev) => ({ ...prev, [articleId]: count }));
        }
      } else if (e.key === CRICKET_USER_LIKES_KEY) {
        try {
          const parsed = JSON.parse(e.newValue || '{}');
          const likedIds = Object.keys(parsed).filter((id) => parsed[id] === true);
          setUserLikes(new Set(likedIds));
        } catch {}
      }
    };

    window.addEventListener('cricket-article-liked', handleLikeSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('cricket-article-liked', handleLikeSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-4 py-4 rounded-xl">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-extrabold text-white">FlipLONG Articles</h3>
          </div>
          <div className="w-16 h-6 rounded-full bg-white/10 animate-pulse" />
        </div>

        <div className="relative group w-full bg-[#111111] p-3 sm:p-4 rounded-2xl border border-gray-800">
          <div className="w-full flex flex-col justify-between border-l-2 border-orange-500/40 pl-3 sm:pl-4 py-1 sm:py-2">
            <div>
              <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-white/[0.06] animate-pulse shrink-0" />
                  <div className="w-14 h-5 rounded bg-orange-500/20 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 mb-3 sm:mb-4">
                <div className="h-3.5 w-4/5 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-3/5 rounded bg-white/[0.06] animate-pulse" />
              </div>
            </div>

            <div>
              <div className="h-2.5 w-1/3 rounded bg-white/[0.06] animate-pulse mb-2 sm:mb-4" />
              <div className="flex items-center justify-between border-t border-gray-800 pt-2 sm:pt-3">
                <div className="flex gap-2.5 sm:gap-4">
                  <div className="h-4 w-10 rounded bg-white/10 animate-pulse" />
                  <div className="h-4 w-12 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="h-4 w-16 rounded bg-pink-500/20 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-1.5 mt-2.5">
            <div className="w-4 h-1.5 rounded-full bg-white/20 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Once loading has settled (empty or error) and there's still nothing to
  // show, keep it simple: just say there are no articles available.
  if (articles.length === 0) {
    return (
      <div className="w-full flex flex-col gap-2 py-4 rounded-xl">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[17px] font-extrabold text-white">FlipLONG Articles</h3>
        </div>
        <div className="w-full p-6 rounded-2xl border border-gray-800 bg-[#111111] text-center">
          <p className="text-gray-400 text-sm">No articles available</p>
        </div>
      </div>
    );
  }

  const displayArticles = articles.slice(0, 2);

  return (
    <div className="w-full flex flex-col gap-4 py-4 rounded-xl">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-extrabold text-white">FlipLONG Articles</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-400 border border-rose-500/30">
            {articles.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/MainModules/CricketArticles")}
          className="flex items-center gap-0.5 text-[12px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: "#E91E8C" }}
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="relative group w-full bg-[#111111] p-3 sm:p-4 rounded-2xl border border-gray-800">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayArticles.map((article: NewsArticle, index: number) => {
            const articleKey = article.id || String(article.rank);
            const isLiked = userLikes.has(articleKey);
            const currentLikes = (likeCounts[articleKey] !== undefined) ? likeCounts[articleKey] : (article.likes || 0);
            const isInternal = Boolean(
              article.source === 'SportsFan360' ||
              article.url?.startsWith('/MainModules/') ||
              article.url?.includes('/CricketArticles/')
            );

            const cardHeaderAndBody = (
              <div className="cursor-pointer group/card">
                <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <img
                      src={article.source === 'SportsFan360' && article.cdn_url ? article.cdn_url : (article.cdn_url || '/images/News_center_Default.png')}
                      alt={article.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shrink-0 group-hover/card:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.currentTarget.src = '/images/News_center_Default.png';
                      }}
                    />
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold text-orange-500 border border-orange-500 rounded uppercase tracking-wider h-fit">
                      {article.tag}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 group-hover/card:text-gray-200 line-clamp-2 mb-3 sm:mb-4 transition-colors">
                  {stripHtmlTags(article.summary)}
                </p>
              </div>
            );

            return (
              <div
                key={`${articleKey}-${index}`}
                className="w-full min-w-full flex-shrink-0 snap-center flex flex-col justify-between border-l-2 border-orange-500 pl-3 sm:pl-4 py-1 sm:py-2"
              >
                {isInternal && article.url ? (
                  <Link href={article.url} className="block">
                    {cardHeaderAndBody}
                  </Link>
                ) : article.url ? (
                  <a href={article.url} target="_blank" rel="noreferrer" className="block">
                    {cardHeaderAndBody}
                  </a>
                ) : (
                  cardHeaderAndBody
                )}

                <div>
                  <p className="text-[11px] sm:text-xs text-gray-500 mb-2 sm:mb-4 truncate">
                    {article.source || 'SportsFan360'} • {formatDate(article.createdAt)}
                  </p>
                  <div className="flex items-center justify-between border-t border-gray-800 pt-2 sm:pt-3">
                    <div className="flex gap-2.5 sm:gap-4">
                      <button
                        type="button"
                        onClick={(e) => toggleLike(article, currentLikes, e)}
                        className={`flex items-center gap-1 text-xs sm:text-sm transition-colors cursor-pointer ${
                          isLiked ? 'text-pink-500 font-semibold' : 'text-gray-400 hover:text-pink-400'
                        }`}
                      >
                        <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                        <span>{currentLikes || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => openShareDialog(article, e)}
                        className="flex items-center gap-1 text-gray-400 hover:text-white text-xs sm:text-sm cursor-pointer"
                      >
                        <Share2 size={15} />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>
                    {isInternal && article.url ? (
                      <Link
                        href={article.url}
                        className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-xs sm:text-sm font-semibold"
                      >
                        Read More <ArrowRight size={13} />
                      </Link>
                    ) : article.url ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-xs sm:text-sm font-semibold"
                      >
                        Read More <ArrowRight size={13} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Swipe dot indicators */}
        {displayArticles.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-2.5">
            {displayArticles.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`Go to article ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === idx
                    ? "w-4 h-1.5 bg-gradient-to-r from-rose-500 to-orange-500"
                    : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share Dialog */}
      {showShareDialog && sharedArticle && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
          <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-semibold">Share</p>
              <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">
              {[
                { handler: handleShareToWhatsApp, src: '/images/share_whatsapp.png', alt: 'WhatsApp' },
                { handler: handleShareToThreads, src: '/images/share_thread.png', alt: 'Threads' },
                { handler: handleShareToInstagram, src: '/images/share_insta.png', alt: 'Instagram' },
                { handler: handleShareToLinkedIn, src: '/images/Share_linkedin.png', alt: 'LinkedIn' },
                { handler: handleShareToX, src: '/images/Share_X.png', alt: 'X' },
                { handler: handleCopyLink, src: '/images/share_copy_link.png', alt: 'Copy' },
              ].map(({ handler, src, alt }) => (
                <button key={alt} onClick={handler} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
                  <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
                </button>
              ))}
            </div>
            {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
          </div>
          <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
            <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-semibold">Share Article</p>
                <button onClick={closeShareDialog} className="text-gray-400 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                <p className="text-white text-sm font-semibold line-clamp-2">{sharedArticle.title}</p>
                <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildNewsShareUrl(sharedArticle)}</p>
              </div>
              <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">
                {[
                  { handler: handleShareToWhatsApp, src: '/images/share_whatsapp.png', alt: 'WhatsApp' },
                  { handler: handleShareToThreads, src: '/images/share_thread.png', alt: 'Threads' },
                  { handler: handleShareToInstagram, src: '/images/share_insta.png', alt: 'Instagram' },
                  { handler: handleShareToLinkedIn, src: '/images/Share_linkedin.png', alt: 'LinkedIn' },
                  { handler: handleShareToX, src: '/images/Share_X.png', alt: 'X' },
                  { handler: handleCopyLink, src: '/images/share_copy_link.png', alt: 'Copy' },
                ].map(({ handler, src, alt }) => (
                  <button key={alt} onClick={handler} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center">
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