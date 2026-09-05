


// //MainModules/CricketArticles/[id]/page.tsx


// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";
// import { ArrowLeft, ArrowDown, ArrowUp } from "lucide-react";
// import CommentsSection from "@/src/components/CommentsSection";
// import PlaylistDialog from "@/src/components/playlistdialog-component/playlistdialog";
// import { useAuth } from "@/context/AuthContext";


// type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

// interface ArticleDetail {
//     _id?: string | number;
//     id: string;
//     badge: BadgeType;
//     title: string;
//     readTime: string;
//     views: string;
//     likes?: number;
//     viewCount?: number;
//     likeCount?: number;
//     likedBy?: string[];
//     image: string;
//     cdn_url?: string;
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

// const getLikeStorageKey = (articleId: string, actorId: string) => `cricket_article_like_${articleId}_${actorId}`;
// const getViewCountStorageKey = (articleId: string) => `cricket_article_views_${articleId}`;
// const getLikeCountStorageKey = (articleId: string) => `cricket_article_likes_${articleId}`;
// const CRICKET_USER_LIKES_KEY = 'cricket_user_likes'; // Track which articles user liked from news center

// const toViewCount = (viewsText: string | number | undefined) => {
//     if (typeof viewsText === "number") return viewsText;
//     if (!viewsText) return 0;
//     const numeric = String(viewsText).replace(/[^\d]/g, "");
//     return Number.parseInt(numeric, 10) || 0;
// };

// const formatViews = (count: number) => `${count} views`;

// const readStoredCount = (key: string) => {
//     const raw = localStorage.getItem(key);
//     if (!raw) return 0;
//     const parsed = Number.parseInt(raw, 10);
//     return Number.isFinite(parsed) ? parsed : 0;
// };

// const writeStoredCount = (key: string, count: number) => {
//     localStorage.setItem(key, String(Math.max(0, count)));
// };

// const parseTimestamp = (raw: any): number => {
//     if (!raw) return Date.now();
//     if (typeof raw === "number") return raw < 10000000000 ? raw * 1000 : raw;
//     if (typeof raw.toMillis === "function") return raw.toMillis();
//     if (typeof raw.seconds === "number") return raw.seconds * 1000;
//     if (typeof raw._seconds === "number") return raw._seconds * 1000;
//     if (typeof raw === "string") {
//         const parsed = Date.parse(raw);
//         if (!isNaN(parsed) && parsed > 0) return parsed;
//     }
//     return Date.now();
// };

// const normalizeArticleStats = (rawArticle: (Partial<ArticleDetail> & { _id?: string | number; cdn_url?: string; createdAt?: any }) | null | undefined): ArticleDetail | null => {
//     if (!rawArticle || (!rawArticle.id && !rawArticle._id)) return null;

//     const resolvedViewCount =
//         typeof rawArticle.viewCount === "number"
//             ? rawArticle.viewCount
//             : toViewCount(rawArticle.views);

//     const resolvedLikeCount =
//         typeof rawArticle.likes === "number"
//             ? rawArticle.likes
//             : typeof rawArticle.likeCount === "number"
//                 ? rawArticle.likeCount
//                 : 0;

//     return {
//         id: String(rawArticle._id || rawArticle.id || ""),
//         badge: (rawArticle.badge as BadgeType) || "NEWS",
//         title: rawArticle.title || "",
//         readTime: rawArticle.readTime || "",
//         views: rawArticle.views ? String(rawArticle.views) : formatViews(resolvedViewCount),
//         likes: resolvedLikeCount,
//         likeCount: resolvedLikeCount,
//         viewCount: resolvedViewCount,
//         likedBy: Array.isArray(rawArticle.likedBy) ? rawArticle.likedBy : [],
//         image: rawArticle.image || rawArticle.cdn_url || "",
//         createdAt: parseTimestamp(rawArticle.createdAt),
//         updatedAt: typeof rawArticle.updatedAt === "number" ? rawArticle.updatedAt : undefined,
//         description: Array.isArray(rawArticle.description)
//             ? rawArticle.description
//             : typeof rawArticle.description === "string"
//                 ? (() => {
//                     try {
//                         const parsed = JSON.parse(rawArticle.description);
//                         return Array.isArray(parsed) ? parsed : [rawArticle.description];
//                     } catch {
//                         return [rawArticle.description];
//                     }
//                 })()
//             : [],
//     };
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
//     const articleId = Array.isArray(id) ? id[0] : id;
//     const [article, setArticle] = useState<ArticleDetail | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     // Holds whatever raw payload the API returned (success or failure) so we
//     // can show it on screen instead of a bare "Failed to load article."
//     const [debugRaw, setDebugRaw] = useState<any>(null);

//     // UI state
//     const [liked, setLiked] = useState(false);
//     const [likeCount, setLikeCount] = useState(0);
//     const [viewCount, setViewCount] = useState(0);
//     const [likeSubmitting, setLikeSubmitting] = useState(false);
//     const [bookmarked, setBookmarked] = useState(false);
//     const [activePanel, setActivePanel] = useState<"comments" | "share" | null>(null);
//     const [copied, setCopied] = useState(false);
//     const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
//     const viewSyncedForArticle = useRef<string | null>(null);
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
//     const getLikeActorId = () => user?.userId || `guest:${getUserName()}`;

//     const applyStatsFromPayload = (payload: unknown) => {
//         const data = payload as {
//             article?: Partial<ArticleDetail>;
//             views?: number | string;
//             likes?: number;
//             viewCount?: number;
//             likeCount?: number;
//         };

//         setArticle((prev) => {
//             if (!prev) return prev;
//             const next = { ...prev };

//             const responseViewCount =
//                 typeof data.article?.viewCount === "number"
//                     ? data.article.viewCount
//                     : typeof data.viewCount === "number"
//                         ? data.viewCount
//                         : undefined;

//             if (responseViewCount !== undefined) {
//                 const persisted = Math.max(responseViewCount, readStoredCount(getViewCountStorageKey(prev.id)));
//                 writeStoredCount(getViewCountStorageKey(prev.id), persisted);
//                 setViewCount(persisted);
//                 next.viewCount = responseViewCount;
//                 next.views = formatViews(persisted);
//             } else if (data.article?.views !== undefined) {
//                 const parsed = toViewCount(data.article.views);
//                 const persisted = Math.max(parsed, readStoredCount(getViewCountStorageKey(prev.id)));
//                 writeStoredCount(getViewCountStorageKey(prev.id), persisted);
//                 setViewCount(persisted);
//                 next.views = formatViews(persisted);
//                 next.viewCount = persisted;
//             } else if (data.views !== undefined) {
//                 const parsed = toViewCount(data.views);
//                 const persisted = Math.max(parsed, readStoredCount(getViewCountStorageKey(prev.id)));
//                 writeStoredCount(getViewCountStorageKey(prev.id), persisted);
//                 setViewCount(persisted);
//                 next.views = formatViews(persisted);
//                 next.viewCount = persisted;
//             }

//             const responseLikeCount =
//                 typeof data.article?.likes === "number"
//                     ? data.article.likes
//                     : typeof data.article?.likeCount === "number"
//                         ? data.article.likeCount
//                         : typeof data.likes === "number"
//                             ? data.likes
//                             : typeof data.likeCount === "number"
//                                 ? data.likeCount
//                                 : undefined;

//             if (responseLikeCount !== undefined) {
//                 const persisted = Math.max(responseLikeCount, readStoredCount(getLikeCountStorageKey(prev.id)));
//                 writeStoredCount(getLikeCountStorageKey(prev.id), persisted);
//                 next.likes = persisted;
//                 next.likeCount = persisted;
//                 setLikeCount(persisted);
//             }

//             if (Array.isArray(data.article?.likedBy)) {
//                 next.likedBy = data.article.likedBy;
//             }

//             return next;
//         });
//     };

//     const buildArticleUrl = (articleId: string) => {
//         if (typeof window === "undefined") return "";
//         return `${window.location.origin}/MainModules/CricketArticles/${articleId}`;
//     };

//     const buildShareText = (target: ArticleDetail) => {
//         const shareUrl = buildArticleUrl(target.id);
//         return [`Read ${target.title} on Sportsfan`, `${target.readTime} • ${formatViews(viewCount)}`, `View article: ${shareUrl}`].join("\n");
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
//         if (!articleId) return;
//         const fetchArticle = async () => {
//             try {
//                 const res = await axios.get(`/api/cricket-articles/${articleId}`);
//                 console.log('[ArticleDetail] raw response:', res.data);
//                 setDebugRaw(res.data);

//                 // Handle a few possible response shapes so a mismatch between
//                 // what the API actually returns and what this page expects
//                 // doesn't silently produce "Article not found":
//                 //   { article: {...} }        <- what this page originally assumed
//                 //   { articles: [{...}] }      <- same shape as the list endpoint
//                 //   { ...articleFieldsDirectly } <- unwrapped object
//                 const rawArticle =
//                     res.data?.article
//                     ?? (Array.isArray(res.data?.articles) ? res.data.articles[0] : null)
//                     ?? (res.data?.id || res.data?._id ? res.data : null);

//                 const normalized = normalizeArticleStats(rawArticle);
//                 if (!normalized) {
//                     console.warn('[ArticleDetail] normalization failed, raw article was:', rawArticle);
//                     setArticle(null);
//                     return;
//                 }
//                 const persistedViews = Math.max(normalized.viewCount ?? 0, readStoredCount(getViewCountStorageKey(normalized.id)));
//                 // Sync cricket article likes: both detail page storage and any news center likes
//                 const persistedLikes = Math.max(
//                   normalized.likeCount ?? normalized.likes ?? 0,
//                   readStoredCount(getLikeCountStorageKey(normalized.id))
//                 );
//                 writeStoredCount(getViewCountStorageKey(normalized.id), persistedViews);
//                 writeStoredCount(getLikeCountStorageKey(normalized.id), persistedLikes);
//                 normalized.viewCount = persistedViews;
//                 normalized.views = formatViews(persistedViews);
//                 normalized.likeCount = persistedLikes;
//                 normalized.likes = persistedLikes;
//                 setArticle(normalized);
//                 setViewCount(persistedViews);
//                 setLikeCount(persistedLikes);
//             } catch (err: any) {
//                 console.error('[ArticleDetail] fetch failed:', err?.response?.status, err?.response?.data, err?.message);
//                 setError(`Failed to load article.${err?.response?.status ? ` (HTTP ${err.response.status})` : err?.message ? ` (${err.message})` : ''}`);
//                 setDebugRaw(err?.response?.data ?? null);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchArticle();
//     }, [articleId]);

//     useEffect(() => {
//         if (!article?.id) return;
//         const actorId = getLikeActorId();
//         const storageKey = getLikeStorageKey(article.id, actorId);

//         // Check if user liked this article from news center
//         const cricketUserLikesData = window.localStorage?.getItem(CRICKET_USER_LIKES_KEY);
//         let userLikedFromNews = false;
//         if (cricketUserLikesData) {
//           try {
//             const cricketUserLikes = JSON.parse(cricketUserLikesData);
//             userLikedFromNews = cricketUserLikes[article.id] === true;
//           } catch (e) {
//             userLikedFromNews = false;
//           }
//         }

//         const alreadyLiked =
//             (Array.isArray(article.likedBy) && article.likedBy.includes(actorId)) ||
//             localStorage.getItem(storageKey) === "1" ||
//             userLikedFromNews;

//         setLiked(alreadyLiked);
//         const resolvedLikeCount =
//             typeof article.likes === "number"
//                 ? article.likes
//                 : typeof article.likeCount === "number"
//                     ? article.likeCount
//                     : 0;
//         const persistedLikeCount = Math.max(resolvedLikeCount, readStoredCount(getLikeCountStorageKey(article.id)));
//         writeStoredCount(getLikeCountStorageKey(article.id), persistedLikeCount);
//         setLikeCount(persistedLikeCount);

//         const resolvedViewCount =
//             typeof article.viewCount === "number"
//                 ? article.viewCount
//                 : toViewCount(article.views);
//         const persistedViewCount = Math.max(resolvedViewCount, readStoredCount(getViewCountStorageKey(article.id)));
//         writeStoredCount(getViewCountStorageKey(article.id), persistedViewCount);
//         setViewCount(persistedViewCount);
//     }, [article?.id, article?.likes, article?.likeCount, user?.userId]);

//     useEffect(() => {
//         if (!article?.id) return;
//         if (viewSyncedForArticle.current === article.id) return;

//         viewSyncedForArticle.current = article.id;

//         const syncView = async () => {
//             const optimisticViews = Math.max(viewCount, toViewCount(article.views), article.viewCount || 0) + 1;
//             writeStoredCount(getViewCountStorageKey(article.id), optimisticViews);
//             setViewCount(optimisticViews);
//             setArticle((prev) => (prev && prev.id === article.id
//                 ? { ...prev, viewCount: optimisticViews, views: formatViews(optimisticViews) }
//                 : prev));

//             const requests = [
//                 () => axios.post(`/api/cricket-articles/${article.id}/view`),
//                 () => axios.post(`/api/cricket-articles/${article.id}/views`),
//                 () => axios.patch(`/api/cricket-articles/${article.id}`, { action: "view" }),
//                 () => axios.put(`/api/cricket-articles/${article.id}`, { action: "view" }),
//             ];

//             for (const request of requests) {
//                 try {
//                     const res = await request();
//                     applyStatsFromPayload(res.data);
//                     return;
//                 } catch {
//                     // Try the next known endpoint shape.
//                 }
//             }
//         };

//         void syncView();
//     }, [article?.id]);

//     const handleLikeClick = async () => {
//         if (!article || likeSubmitting || liked) return;

//         const actorId = getLikeActorId();
//         const storageKey = getLikeStorageKey(article.id, actorId);
//         setLikeSubmitting(true);
//         const optimisticLikes = Math.max(likeCount, article.likes || 0, article.likeCount || 0) + 1;
//         writeStoredCount(getLikeCountStorageKey(article.id), optimisticLikes);
//         setLikeCount(optimisticLikes);
//         setLiked(true);
//         setArticle((prev) => (prev && prev.id === article.id
//             ? { ...prev, likes: optimisticLikes, likeCount: optimisticLikes }
//             : prev));

//         const payload = { userId: actorId, action: "like" };
//         const requests = [
//             () => axios.post(`/api/cricket-articles/${article.id}/like`, payload),
//             () => axios.post(`/api/cricket-articles/${article.id}/likes`, payload),
//             () => axios.patch(`/api/cricket-articles/${article.id}`, payload),
//             () => axios.put(`/api/cricket-articles/${article.id}`, payload),
//         ];

//         let backendUpdated = false;
//         for (const request of requests) {
//             try {
//                 const res = await request();
//                 applyStatsFromPayload(res.data);
//                 backendUpdated = true;
//                 break;
//             } catch {
//                 // Try the next known endpoint shape.
//             }
//         }

//         localStorage.setItem(storageKey, "1");

//         // Also track in cricket user likes so news center knows user liked this
//         const cricketUserLikesData = window.localStorage?.getItem(CRICKET_USER_LIKES_KEY);
//         let cricketUserLikes: Record<string, boolean> = {};
//         if (cricketUserLikesData) {
//           try {
//             cricketUserLikes = JSON.parse(cricketUserLikesData);
//           } catch (e) {
//             cricketUserLikes = {};
//           }
//         }
//         cricketUserLikes[article.id] = true;
//         window.localStorage?.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(cricketUserLikes));

//         if (!backendUpdated) {
//             // Keep optimistic count shown on UI when backend endpoint is unavailable.
//         }

//         setLikeSubmitting(false);
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center min-h-screen bg-[#0d0d10]">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
//             </div>
//         );
//     }

//     if (error || !article) {
//         return (
//             <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d0d10] gap-4 p-6 text-center">
//                 <p className="text-red-400">{error || "Article not found"}</p>
//                 <p className="text-gray-500 text-xs">articleId: {String(articleId)}</p>
//                 {debugRaw && (
//                     <pre className="text-left text-[10px] text-gray-400 bg-[#111] p-3 rounded max-w-xl w-full overflow-auto max-h-64">
//                         {JSON.stringify(debugRaw, null, 2)}
//                     </pre>
//                 )}
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
//             {/* {isNearTop && (
//                 <button
//                     onClick={scrollToBottom}
//                     className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#d4537e]/30 hover:bg-[#d4537e]/70 backdrop-blur-md border border-white/20 text-white p-3 rounded-full shadow-lg transition-all duration-300 animate-bounce"
//                     title="Scroll to bottom"
//                 >
//                     <ArrowDown size={20} />
//                 </button>
//             )} */}

//             {/* Up Arrow (Shows when near bottom) - Extra Translucent */}
//             {/* {isNearBottom && (
//                 <button
//                     onClick={scrollToTop}
//                     className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#d4537e]/30 hover:bg-[#d4537e]/70 backdrop-blur-md border border-white/20 text-white p-3 rounded-full shadow-lg transition-all duration-300"
//                     title="Scroll to top"
//                 >
//                     <ArrowUp size={20} />
//                 </button>
//             )} */}

//             {/* Back */}
//             <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-5 transition cursor-pointer">
//                 <ArrowLeft size={16} />
//                 {/* <span className="text-sm">Back</span> */}
//             </button>

//             {/* Badge + Title */}
//             <div className="mb-3">
//                 <span className={`text-[10px] font-bold px-2.5 py-1 rounded text-white ${BADGE_COLORS[article.badge] || "bg-gray-600"}`}>
//                     {article.badge}
//                 </span>

//             </div>

//              <div className="flex justify-between">
//              <div>
//             <h1 className="text-[17px] font-bold leading-snug mb-3">{article.title}</h1>
//      </div>
//                  <div className="flex items-center gap-2">
//                         {/* <button
//                             onClick={() => setShowPlaylistDialog(true)}
//                             className="px-4 py-2 bg-[#111111] rounded-xl border border-white/5 shadow-[0_4px_15px_rgb(0,0,0,0.5)] hover:bg-[#1a1a1a] transition-all duration-300 group active:scale-95 flex items-center justify-center"
//                             title="Add to Playlist"
//                         >
//                             <span className="text-gray-300 text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase group-hover:text-white transition-colors">
//                                 Add to Playlist
//                             </span>
//                         </button> */}
//                         {/* <button onClick={() => togglePanel("share")} className="w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center cursor-pointer hover:bg-[#2a2a2e] transition">
//                             <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                                 <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                 <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                 <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                 <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
//                             </svg>
//                         </button> */}
//                     </div>
//                     </div>
//             {/* Meta */}
//             <div className="flex items-center gap-2 text-gray-400 text-xs mb-4 flex-wrap">
//                 {/* <div className="w-5 h-5 rounded-full bg-blue-900 flex items-center justify-center text-[9px] font-semibold text-blue-300">SF</div> */}
//                 {/* <span>By SportsFan360 Analysis Desk</span> */}
//                 <span>·</span>
//                 <span>{new Date(article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
//                 <span>·</span>
//                 {/* <span>{article.readTime}</span> */}
//                 {/* <span>·</span> */}
//                 <span>{formatViews(viewCount)}</span>
//                 <span>·</span>
//                 <span>{likeCount} likes</span>
//             </div>

//             {/* ── PlaylistDialog component ── */}
//             <PlaylistDialog
//                 open={showPlaylistDialog}
//                 onClose={() => setShowPlaylistDialog(false)}
//                 itemId={article.id || ""}
//                 itemType="article"
//                 userId={getUserId()}
//             />


//             {/* Hero Image */}
//             {article.image && article.image.trim() !== "" && (
//                 <>
//                     <div className="w-full rounded-xl overflow-hidden mb-2 bg-black/40 flex items-center justify-center border border-white/10">
//                         <img
//                             src={article.image}
//                             alt={article.title}
//                             className="w-full h-auto max-h-[150px] object-contain rounded-xl"
//                         />
//                     </div>
//                     <p className="text-center text-[11px] text-gray-500 mb-5">{article.title}</p>
//                 </>
//             )}

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
//                     onClick={handleLikeClick}
//                     disabled={liked || likeSubmitting}
//                     className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${liked ? "text-pink-400" : "text-gray-400"} ${(liked || likeSubmitting) ? "opacity-80 cursor-not-allowed" : ""}`}
//                 >
//                     <LikeIcon filled={liked} />
//                     <span>{liked ? `Liked (${likeCount})` : `Like (${likeCount})`}</span>
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






// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";
// import { ArrowLeft } from "lucide-react";
// import CommentsSection from "@/src/components/CommentsSection";
// import PlaylistDialog from "@/src/components/playlistdialog-component/playlistdialog";
// import { useAuth } from "@/context/AuthContext";

// type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

// interface ArticleDetail {
//   _id?: string | number;
//   id: string;
//   badge: BadgeType;
//   title: string;
//   readTime: string;
//   views: string;
//   likes?: number;
//   viewCount?: number;
//   likeCount?: number;
//   likedBy?: string[];
//   image: string;
//   cdn_url?: string;
//   createdAt: number;
//   updatedAt?: number;
//   description: string[];
// }

// const BADGE_COLORS: Record<BadgeType, string> = {
//   FEATURE: "bg-pink-600",
//   ANALYSIS: "bg-blue-600",
//   OPINION: "bg-purple-600",
//   NEWS: "bg-orange-500",
// };

// const getLikeStorageKey = (articleId: string, actorId: string) => `cricket_article_like_${articleId}_${actorId}`;
// const getViewCountStorageKey = (articleId: string) => `cricket_article_views_${articleId}`;
// const getLikeCountStorageKey = (articleId: string) => `cricket_article_likes_${articleId}`;
// const CRICKET_USER_LIKES_KEY = "cricket_user_likes";

// const toViewCount = (viewsText: string | number | undefined) => {
//   if (typeof viewsText === "number") return viewsText;
//   if (!viewsText) return 0;
//   const numeric = String(viewsText).replace(/[^\d]/g, "");
//   return Number.parseInt(numeric, 10) || 0;
// };

// const formatViews = (count: number) => `${count} views`;

// const readStoredCount = (key: string) => {
//   if (typeof window === "undefined") return 0;
//   const raw = localStorage.getItem(key);
//   if (!raw) return 0;
//   const parsed = Number.parseInt(raw, 10);
//   return Number.isFinite(parsed) ? parsed : 0;
// };

// const writeStoredCount = (key: string, count: number) => {
//   if (typeof window === "undefined") return;
//   localStorage.setItem(key, String(Math.max(0, count)));
// };

// const parseTimestamp = (raw: any): number => {
//   if (!raw) return Date.now();
//   if (typeof raw === "number") return raw < 10000000000 ? raw * 1000 : raw;
//   if (typeof raw.toMillis === "function") return raw.toMillis();
//   if (typeof raw.seconds === "number") return raw.seconds * 1000;
//   if (typeof raw._seconds === "number") return raw._seconds * 1000;
//   if (typeof raw === "string") {
//     const parsed = Date.parse(raw);
//     if (!isNaN(parsed) && parsed > 0) return parsed;
//   }
//   return Date.now();
// };

// const normalizeArticleStats = (
//   rawArticle: (Partial<ArticleDetail> & { _id?: string | number; cdn_url?: string; createdAt?: any }) | null | undefined
// ): ArticleDetail | null => {
//   if (!rawArticle || (!rawArticle.id && !rawArticle._id)) return null;

//   const resolvedViewCount =
//     typeof rawArticle.viewCount === "number"
//       ? rawArticle.viewCount
//       : toViewCount(rawArticle.views);

//   const resolvedLikeCount =
//     typeof rawArticle.likes === "number"
//       ? rawArticle.likes
//       : typeof rawArticle.likeCount === "number"
//       ? rawArticle.likeCount
//       : 0;

//   return {
//     id: String(rawArticle._id || rawArticle.id || ""),
//     badge: (rawArticle.badge as BadgeType) || "NEWS",
//     title: rawArticle.title || "",
//     readTime: rawArticle.readTime || "",
//     views: rawArticle.views ? String(rawArticle.views) : formatViews(resolvedViewCount),
//     likes: resolvedLikeCount,
//     likeCount: resolvedLikeCount,
//     viewCount: resolvedViewCount,
//     likedBy: Array.isArray(rawArticle.likedBy) ? rawArticle.likedBy : [],
//     image: rawArticle.image || rawArticle.cdn_url || "",
//     createdAt: parseTimestamp(rawArticle.createdAt),
//     updatedAt: typeof rawArticle.updatedAt === "number" ? rawArticle.updatedAt : undefined,
//     description: Array.isArray(rawArticle.description)
//       ? rawArticle.description
//       : typeof rawArticle.description === "string"
//       ? (() => {
//           try {
//             const parsed = JSON.parse(rawArticle.description);
//             return Array.isArray(parsed) ? parsed : [rawArticle.description];
//           } catch {
//             return [rawArticle.description];
//           }
//         })()
//       : [],
//   };
// };

// function ShareIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//       <circle cx="18" cy="5" r="3" />
//       <circle cx="6" cy="12" r="3" />
//       <circle cx="18" cy="19" r="3" />
//       <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
//     </svg>
//   );
// }

// function LikeIcon({ filled }: { filled: boolean }) {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill={filled ? "#d4537e" : "none"}
//       stroke={filled ? "#d4537e" : "currentColor"}
//       strokeWidth="1.5"
//     >
//       <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
//       <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
//     </svg>
//   );
// }

// function CommentIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//       <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
//     </svg>
//   );
// }

// export default function CricketArticleDetail() {
//   const { id } = useParams();
//   const router = useRouter();
//   const { user, getUserName } = useAuth();
//   const articleId = Array.isArray(id) ? id[0] : id;

//   const [article, setArticle] = useState<ArticleDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [liked, setLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(0);
//   const [viewCount, setViewCount] = useState(0);
//   const [likeSubmitting, setLikeSubmitting] = useState(false);
//   const [activePanel, setActivePanel] = useState<"comments" | "share" | null>(null);
//   const [copied, setCopied] = useState(false);
//   const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
//   const viewSyncedForArticle = useRef<string | null>(null);

//   const getUserId = () => user?.userId || null;
//   const getLikeActorId = () => user?.userId || `guest:${getUserName ? getUserName() : "user"}`;

//   const buildArticleUrl = (artId: string) => {
//     if (typeof window === "undefined") return "";
//     return `${window.location.origin}/MainModules/CricketArticles/${artId}`;
//   };

//   const buildShareText = (target: ArticleDetail) => {
//     const shareUrl = buildArticleUrl(target.id);
//     return [
//       `Read ${target.title} on Sportsfan`,
//       `${target.readTime ? `${target.readTime} • ` : ""}${formatViews(viewCount)}`,
//       `View article: ${shareUrl}`,
//     ].join("\n");
//   };

//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       return true;
//     } catch {
//       try {
//         const ta = document.createElement("textarea");
//         ta.value = text;
//         ta.style.position = "fixed";
//         ta.style.opacity = "0";
//         document.body.appendChild(ta);
//         ta.focus();
//         ta.select();
//         const ok = document.execCommand("copy");
//         document.body.removeChild(ta);
//         return ok;
//       } catch {
//         return false;
//       }
//     }
//   };

//   const togglePanel = (panel: "comments" | "share") => {
//     setActivePanel((prev) => (prev === panel ? null : panel));
//   };

//   const handleShareToWhatsApp = () => {
//     if (!article) return;
//     const text = encodeURIComponent(buildShareText(article));
//     const appUrl = `whatsapp://send?text=${text}`;
//     const webUrl = `https://wa.me/?text=${text}`;
//     const opened = window.open(appUrl, "_self");
//     if (!opened) window.location.href = webUrl;
//   };

//   const handleShareToThreads = () => {
//     if (!article) return;
//     const text = encodeURIComponent(buildShareText(article));
//     window.open(`https://www.threads.net/intent/post?text=${text}`, "_blank", "noopener,noreferrer");
//   };

//   const handleShareToInstagram = async () => {
//     if (!article) return;
//     await copyToClipboard(buildShareText(article));
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1600);
//     window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
//   };

//   const handleShareToLinkedIn = () => {
//     if (!article) return;
//     const url = encodeURIComponent(buildArticleUrl(article.id));
//     window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
//   };

//   const handleShareToX = () => {
//     if (!article) return;
//     const text = encodeURIComponent(buildShareText(article));
//     window.open(`https://x.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
//   };

//   const handleCopyLink = async () => {
//     if (!article) return;
//     const ok = await copyToClipboard(buildShareText(article));
//     if (ok) {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1600);
//     }
//   };

//   useEffect(() => {
//     if (!articleId) return;
//     const fetchArticle = async () => {
//       try {
//         const res = await axios.get(`/api/cricket-articles/${articleId}`);
//         const rawArticle =
//           res.data?.article ??
//           (Array.isArray(res.data?.articles) ? res.data.articles[0] : null) ??
//           (res.data?.id || res.data?._id ? res.data : null);

//         const normalized = normalizeArticleStats(rawArticle);
//         if (!normalized) {
//           setArticle(null);
//           return;
//         }

//         const actorId = getLikeActorId();
//         const storageKey = getLikeStorageKey(normalized.id, actorId);

//         let userLikedFromNews = false;
//         try {
//           const rawLocal = window.localStorage?.getItem(CRICKET_USER_LIKES_KEY);
//           if (rawLocal) {
//             const parsed = JSON.parse(rawLocal);
//             userLikedFromNews = parsed[normalized.id] === true;
//           }
//         } catch {}

//         const isUserLiked =
//           (Array.isArray(normalized.likedBy) && normalized.likedBy.includes(actorId)) ||
//           localStorage.getItem(storageKey) === "1" ||
//           userLikedFromNews;

//         const persistedViews = Math.max(
//           normalized.viewCount ?? 0,
//           readStoredCount(getViewCountStorageKey(normalized.id))
//         );
//         const persistedLikes = Math.max(
//           normalized.likeCount ?? normalized.likes ?? 0,
//           readStoredCount(getLikeCountStorageKey(normalized.id))
//         );

//         writeStoredCount(getViewCountStorageKey(normalized.id), persistedViews);
//         writeStoredCount(getLikeCountStorageKey(normalized.id), persistedLikes);

//         normalized.viewCount = persistedViews;
//         normalized.views = formatViews(persistedViews);
//         normalized.likeCount = persistedLikes;
//         normalized.likes = persistedLikes;

//         setArticle(normalized);
//         setViewCount(persistedViews);
//         setLikeCount(persistedLikes);
//         setLiked(isUserLiked);
//       } catch (err: any) {
//         console.error("[ArticleDetail] fetch failed:", err);
//         setError(
//           `Failed to load article.${err?.response?.status ? ` (HTTP ${err.response.status})` : ""}`
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchArticle();
//   }, [articleId, user?.userId]);

//   useEffect(() => {
//     if (!article?.id) return;
//     if (viewSyncedForArticle.current === article.id) return;
//     viewSyncedForArticle.current = article.id;

//     const syncView = async () => {
//       const optimisticViews =
//         Math.max(viewCount, toViewCount(article.views), article.viewCount || 0) + 1;
//       writeStoredCount(getViewCountStorageKey(article.id), optimisticViews);
//       setViewCount(optimisticViews);

//       try {
//         const res = await axios.post(`/api/cricket-articles/${article.id}/view`);
//         if (res.data?.viewCount) {
//           const sCount = Number(res.data.viewCount);
//           writeStoredCount(getViewCountStorageKey(article.id), sCount);
//           setViewCount(sCount);
//         }
//       } catch (e) {
//         console.warn("View counter background sync notice:", e);
//       }
//     };

//     void syncView();
//   }, [article?.id]);

//   const handleLikeClick = async () => {
//     if (!article || likeSubmitting) return;

//     const actorId = getLikeActorId();
//     const storageKey = getLikeStorageKey(article.id, actorId);
//     const nextLiked = !liked;
//     const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

//     setLikeSubmitting(true);
//     setLiked(nextLiked);
//     setLikeCount(nextCount);
//     writeStoredCount(getLikeCountStorageKey(article.id), nextCount);

//     if (nextLiked) {
//       localStorage.setItem(storageKey, "1");
//     } else {
//       localStorage.removeItem(storageKey);
//     }

//     try {
//       const rawLocal = window.localStorage?.getItem(CRICKET_USER_LIKES_KEY);
//       let cricketUserLikes: Record<string, boolean> = rawLocal ? JSON.parse(rawLocal) : {};
//       if (nextLiked) {
//         cricketUserLikes[article.id] = true;
//       } else {
//         delete cricketUserLikes[article.id];
//       }
//       window.localStorage?.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(cricketUserLikes));
//     } catch {}

//     try {
//       const res = await axios.post(`/api/cricket-articles/${article.id}/like`, {
//         userId: actorId,
//         action: nextLiked ? "like" : "unlike",
//       });

//       if (res.data) {
//         const serverLikes =
//           typeof res.data.likeCount === "number"
//             ? res.data.likeCount
//             : typeof res.data.likes === "number"
//             ? res.data.likes
//             : nextCount;

//         setLikeCount(serverLikes);
//         writeStoredCount(getLikeCountStorageKey(article.id), serverLikes);
//       }
//     } catch (err) {
//       console.error("Failed to update like state on backend:", err);
//     } finally {
//       setLikeSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-[#0d0d10]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
//       </div>
//     );
//   }

//   if (error || !article) {
//     return (
//       <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d0d10] gap-4 p-6 text-center">
//         <p className="text-red-400">{error || "Article not found"}</p>
//         <button
//           onClick={() => router.back()}
//           className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600 transition"
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   const SHARE_BUTTONS = [
//     { label: "WhatsApp", img: "/images/share_whatsapp.png", onClick: handleShareToWhatsApp },
//     { label: "Threads", img: "/images/share_thread.png", onClick: handleShareToThreads },
//     { label: "Instagram", img: "/images/share_insta.png", onClick: handleShareToInstagram },
//     { label: "LinkedIn", img: "/images/Share_linkedin.png", onClick: handleShareToLinkedIn },
//     { label: "X", img: "/images/Share_X.png", onClick: handleShareToX },
//     { label: "Copy link", img: "/images/share_copy_link.png", onClick: handleCopyLink },
//   ];

//   return (
//     <div className="min-h-screen text-white px-4 py-6 max-w-6xl mx-auto pb-20">
//       <button
//         onClick={() => router.back()}
//         className="flex items-center gap-2 text-gray-400 hover:text-white mb-5 transition cursor-pointer"
//       >
//         <ArrowLeft size={16} />
//       </button>

//       <div className="mb-3">
//         <span
//           className={`text-[10px] font-bold px-2.5 py-1 rounded text-white ${
//             BADGE_COLORS[article.badge] || "bg-gray-600"
//           }`}
//         >
//           {article.badge}
//         </span>
//       </div>

//       <div className="flex justify-between items-start">
//         <h1 className="text-[17px] font-bold leading-snug mb-3">{article.title}</h1>
//       </div>

//       <div className="flex items-center gap-2 text-gray-400 text-xs mb-4 flex-wrap">
//         <span>
//           {new Date(article.createdAt).toLocaleDateString("en-IN", {
//             day: "numeric",
//             month: "short",
//             year: "numeric",
//           })}
//         </span>
//         <span>·</span>
//         <span>{formatViews(viewCount)}</span>
//         <span>·</span>
//         <span>{likeCount} likes</span>
//       </div>

//       <PlaylistDialog
//         open={showPlaylistDialog}
//         onClose={() => setShowPlaylistDialog(false)}
//         itemId={article.id || ""}
//         itemType="article"
//         userId={getUserId()}
//       />

//       {article.image && article.image.trim() !== "" && (
//         <>
//           <div className="w-full rounded-xl overflow-hidden mb-2 bg-black/40 flex items-center justify-center border border-white/10">
//             <img
//               src={article.image}
//               alt={article.title}
//               className="w-full h-auto max-h-[250px] object-contain rounded-xl"
//             />
//           </div>
//           <p className="text-center text-[11px] text-gray-500 mb-5">{article.title}</p>
//         </>
//       )}

//       <div className="flex flex-col gap-4 mb-6">
//         {article.description.map((para, index) => (
//           <p
//             key={index}
//             className="text-gray-300 leading-relaxed text-[15px]"
//             dangerouslySetInnerHTML={{ __html: para }}
//           />
//         ))}
//       </div>

//       <div className="flex items-center border-t border-b border-white/10 py-2 mb-4">
//         <button
//           onClick={handleLikeClick}
//           disabled={likeSubmitting}
//           className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${
//             liked ? "text-pink-400" : "text-gray-400"
//           } ${likeSubmitting ? "opacity-70" : ""}`}
//         >
//           <LikeIcon filled={liked} />
//           <span>{liked ? `Liked (${likeCount})` : `Like (${likeCount})`}</span>
//         </button>

//         <div className="w-px h-6 bg-white/10" />

//         <button
//           onClick={() => togglePanel("comments")}
//           className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${
//             activePanel === "comments" ? "text-white" : "text-gray-400"
//           }`}
//         >
//           <CommentIcon />
//           <span>Comment</span>
//         </button>

//         <div className="w-px h-6 bg-white/10" />

//         <button
//           onClick={() => togglePanel("share")}
//           className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${
//             activePanel === "share" ? "text-white" : "text-gray-400"
//           }`}
//         >
//           <ShareIcon />
//           <span>Share</span>
//         </button>
//       </div>

//       {activePanel === "comments" && (
//         <div className="mb-4">
//           <CommentsSection
//             contentId={article.id}
//             contentType="article"
//             contentTitle={article.title}
//             className="mt-2"
//           />
//         </div>
//       )}

//       {activePanel === "share" && (
//         <div className="mb-4 rounded-2xl border border-white/10 bg-[#1a1a1e] p-4">
//           <p className="text-sm font-semibold text-white mb-3">Share Article</p>

//           <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
//             <p className="text-sm font-semibold text-white line-clamp-2">{article.title}</p>
//             <p className="text-[11px] text-white/40 mt-1.5 break-all">{buildArticleUrl(article.id)}</p>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             {SHARE_BUTTONS.map((btn) => (
//               <button
//                 key={btn.label}
//                 onClick={btn.onClick}
//                 aria-label={btn.label}
//                 className="flex flex-col items-center gap-1.5 group"
//               >
//                 <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 group-hover:bg-white/10 transition">
//                   <img src={btn.img} alt={btn.label} className="w-full h-full object-cover rounded-full" />
//                 </div>
//                 <span className="text-[10px] text-gray-400">{btn.label}</span>
//               </button>
//             ))}
//           </div>

//           {copied && <p className="text-xs text-emerald-400 mt-3">Copied to clipboard</p>}
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Heart, Reply, Trash2, ChevronDown, ChevronUp, Send, Loader2, Smile } from "lucide-react";
import PlaylistDialog from "@/src/components/playlistdialog-component/playlistdialog";
import { useAuth } from "@/context/AuthContext";

type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

interface ArticleDetail {
  _id?: string | number;
  id: string;
  badge: BadgeType;
  title: string;
  readTime: string;
  views: string;
  likes?: number;
  viewCount?: number;
  likeCount?: number;
  likedBy?: string[];
  commentCount?: number;
  commentsCount?: number;
  image: string;
  cdn_url?: string;
  tags?: string[];
  createdAt: number;
  updatedAt?: number;
  description: string[];
}

interface Comment {
  id: string;
  commentId?: string;
  commentText: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userEmail?: string;
  parentCommentId?: string;
  likes: number;
  likedBy: string[];
  replyCount?: number;
  createdAt: number;
  updatedAt: number;
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
const CRICKET_USER_LIKES_KEY = "cricket_user_likes";

const toViewCount = (viewsText: string | number | undefined) => {
  if (typeof viewsText === "number") return viewsText;
  if (!viewsText) return 0;
  const numeric = String(viewsText).replace(/[^\d]/g, "");
  return Number.parseInt(numeric, 10) || 0;
};

const formatViews = (count: number) => `${count} views`;

const readStoredCount = (key: string) => {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(key);
  if (!raw) return 0;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const writeStoredCount = (key: string, count: number) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, String(Math.max(0, count)));
};

const parseTimestamp = (raw: any): number => {
  if (!raw) return Date.now();
  if (typeof raw === "number") return raw < 10000000000 ? raw * 1000 : raw;
  if (typeof raw.toMillis === "function") return raw.toMillis();
  if (typeof raw.seconds === "number") return raw.seconds * 1000;
  if (typeof raw._seconds === "number") return raw._seconds * 1000;
  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return Date.now();
};

const normalizeArticleStats = (
  rawArticle: (Partial<ArticleDetail> & { _id?: string | number; cdn_url?: string; createdAt?: any; tags?: any }) | null | undefined
): ArticleDetail | null => {
  if (!rawArticle || (!rawArticle.id && !rawArticle._id)) return null;

  const resolvedViewCount =
    typeof rawArticle.viewCount === "number" ? rawArticle.viewCount : toViewCount(rawArticle.views);

  const resolvedLikeCount =
    typeof rawArticle.likes === "number"
      ? rawArticle.likes
      : typeof rawArticle.likeCount === "number"
      ? rawArticle.likeCount
      : 0;

  const resolvedCommentCount =
    typeof rawArticle.commentCount === "number"
      ? rawArticle.commentCount
      : typeof rawArticle.commentsCount === "number"
      ? rawArticle.commentsCount
      : 0;

  return {
    id: String(rawArticle._id || rawArticle.id || ""),
    badge: (rawArticle.badge as BadgeType) || "NEWS",
    title: rawArticle.title || "",
    readTime: rawArticle.readTime || "",
    views: rawArticle.views ? String(rawArticle.views) : formatViews(resolvedViewCount),
    likes: resolvedLikeCount,
    likeCount: resolvedLikeCount,
    viewCount: resolvedViewCount,
    commentCount: resolvedCommentCount,
    commentsCount: resolvedCommentCount,
    likedBy: Array.isArray(rawArticle.likedBy) ? rawArticle.likedBy : [],
    image: rawArticle.image || rawArticle.cdn_url || "",
    tags: Array.isArray(rawArticle.tags)
      ? rawArticle.tags.map((t: any) => String(t).trim()).filter(Boolean)
      : typeof rawArticle.tags === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(rawArticle.tags);
            return Array.isArray(parsed)
              ? parsed.map((t: any) => String(t).trim()).filter(Boolean)
              : rawArticle.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
          } catch {
            return rawArticle.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
          }
        })()
      : [],
    createdAt: parseTimestamp(rawArticle.createdAt),
    updatedAt: typeof rawArticle.updatedAt === "number" ? rawArticle.updatedAt : undefined,
    description: Array.isArray(rawArticle.description)
      ? rawArticle.description
      : typeof rawArticle.description === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(rawArticle.description);
            return Array.isArray(parsed) ? parsed : [rawArticle.description];
          } catch {
            return [rawArticle.description];
          }
        })()
      : [],
  };
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}

// ─── Icons ─────────────────────────────────────────────────────────────────
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

// ─── Comment sub-UI (inlined, same visuals as the old CommentsSection) ─────
const EMOJI_CATEGORIES = [
  { label: "😊 Smileys", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😋","😜","🤪","😝","🤔","😌","😢","😭","😡","😎"] },
  { label: "👋 Gestures", emojis: ["👋","🤚","✋","👌","✌","🤞","🤘","👈","👉","👆","👇","☝","👍","👎","✊","👊","👏","🙌","🙏"] },
  { label: "❤️ Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","💕","💞","💓","💗","💖"] },
  { label: "🎉 Celebration", emojis: ["🎉","🎊","🎈","🎁","🏆","🥇","🥈","🥉","🏅","🎯","🔥","✨"] },
  { label: "⚽ Sports", emojis: ["⚽","🏀","🏈","⚾","🎾","🏐","🏏","🏆","🥅","⛳","🏹"] },
] as const;

function Avatar({
  name,
  avatar,
  src,
  size = 32,
  ring = false,
}: {
  name: string;
  avatar?: string;
  src?: string;
  size?: number;
  ring?: boolean;
}) {
  const imageSrc = avatar || src;
  const initial = (name || "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-pink-500 to-orange-500 ${
        ring ? "ring-2 ring-pink-500/40" : ""
      } flex items-center justify-center`}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name || "User"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-bold uppercase select-none"
          style={{ fontSize: Math.max(10, size * 0.4) }}
        >
          {initial}
        </div>
      )}
    </div>
  );
}

function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 z-50 w-72 rounded-2xl border border-white/10 shadow-2xl overflow-hidden" style={{ background: "rgba(20,20,24,0.98)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center gap-0.5 px-2 pt-2 pb-1 border-b border-white/8 overflow-x-auto">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button key={i} onClick={() => setActiveCategory(i)} title={cat.label} className={`flex-shrink-0 text-base px-1.5 py-1 rounded-lg transition-colors ${activeCategory === i ? "bg-[#C9115F]/20 text-white" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
            {cat.emojis[0]}
          </button>
        ))}
      </div>
      <div className="px-3 pt-2 pb-1">
        <span className="text-white/30 text-xs font-medium">{EMOJI_CATEGORIES[activeCategory].label}</span>
      </div>
      <div className="grid grid-cols-8 gap-0.5 px-2 pb-2 max-h-48 overflow-y-auto">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
          <button key={i} onClick={() => onSelect(emoji)} className="flex items-center justify-center w-8 h-8 text-xl rounded-lg hover:bg-white/10 transition-colors active:scale-90" title={emoji}>
            {emoji}
          </button>
        ))}
      </div>
      <div className="absolute left-6 -bottom-1.5 w-3 h-3 rotate-45 border-r border-b border-white/10" style={{ background: "rgba(20,20,24,0.98)" }} />
    </div>
  );
}

function CommentRow({
  comment, currentUserId, onLike, onDelete, onReply, isReply = false, parentCommentId,
}: {
  comment: Comment;
  currentUserId: string;
  onLike: (commentId: string, isReply: boolean, parentCommentId?: string) => void;
  onDelete: (commentId: string, parentCommentId?: string) => void;
  onReply: (commentId: string, userName: string) => void;
  isReply?: boolean;
  parentCommentId?: string;
}) {
  const isLiked = comment.likedBy?.includes(currentUserId);
  const isOwner = comment.userId === currentUserId;

  return (
    <div className={`flex gap-3 ${isReply ? "pl-10" : ""}`}>
      <Avatar name={comment.userName} avatar={comment.userAvatar} size={isReply ? 24 : 32} />
      <div className="flex-1 min-w-0">
        <div className="bg-white/5 rounded-2xl px-3 py-2.5">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white text-sm font-semibold leading-tight truncate">{comment.userName}</span>
            <span className="text-white/30 text-xs flex-shrink-0">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed break-words">{comment.commentText}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-1">
          <button onClick={() => onLike(comment.id, isReply, parentCommentId)} className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? "text-[#C9115F]" : "text-white/40 hover:text-white/70"}`}>
            <Heart className="w-3.5 h-3.5" fill={isLiked ? "currentColor" : "none"} />
            {comment.likes > 0 && <span>{comment.likes}</span>}
          </button>
          {!isReply && (
            <button onClick={() => onReply(comment.id, comment.userName)} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
          {isOwner && (
            <button onClick={() => onDelete(comment.id, parentCommentId)} className="flex items-center gap-1 text-xs text-white/25 hover:text-red-400 transition-colors ml-auto">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentThread({
  comment, currentUserId, replies, onLike, onDelete, onReply, onLoadReplies,
}: {
  comment: Comment;
  currentUserId: string;
  replies: Comment[];
  onLike: (commentId: string, isReply: boolean, parentCommentId?: string) => void;
  onDelete: (commentId: string, parentCommentId?: string) => void;
  onReply: (commentId: string, userName: string) => void;
  onLoadReplies: (commentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasReplies = (comment.replyCount || 0) > 0;

  const handleToggleReplies = () => {
    if (!expanded && replies.length === 0) onLoadReplies(comment.id);
    setExpanded((v) => !v);
  };

  return (
    <div className="flex flex-col gap-2">
      <CommentRow comment={comment} currentUserId={currentUserId} onLike={onLike} onDelete={onDelete} onReply={onReply} />
      {hasReplies && (
        <button onClick={handleToggleReplies} className="flex items-center gap-1.5 ml-9 text-xs text-[#C9115F] hover:text-[#e8185a] transition-colors w-fit">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? "Hide" : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
        </button>
      )}
      {expanded && replies.length > 0 && (
        <div className="flex flex-col gap-3 mt-1">
          {replies.map((reply) => (
            <CommentRow key={reply.id} comment={reply} currentUserId={currentUserId} onLike={onLike} onDelete={onDelete} onReply={onReply} isReply parentCommentId={comment.id} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function CricketArticleDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, getUserName, getUserDisplayName } = useAuth();
  const articleId = Array.isArray(id) ? id[0] : id;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [likeSubmitting, setLikeSubmitting] = useState(false);
  const [activePanel, setActivePanel] = useState<"comments" | "share" | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const viewSyncedForArticle = useRef<string | null>(null);

  // ── Comments state (inlined) ──────────────────────────────────────────────
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ commentId: string; userName: string } | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsLoadedForArticle = useRef<string | null>(null);

  const [localAvatar, setLocalAvatar] = useState<string>("");

  useEffect(() => {
    const updateAvatar = () => {
      try {
        const stored = localStorage.getItem("roar_avatar_url") || localStorage.getItem("user_avatar");
        if (stored) setLocalAvatar(stored);
      } catch {}
    };
    updateAvatar();
    const onAvatarUpdate = () => updateAvatar();
    window.addEventListener("roar-profile-updated", onAvatarUpdate);
    window.addEventListener("storage", onAvatarUpdate);
    return () => {
      window.removeEventListener("roar-profile-updated", onAvatarUpdate);
      window.removeEventListener("storage", onAvatarUpdate);
    };
  }, []);

  const currentUserAvatar = useMemo(() => {
    if (localAvatar) return localAvatar;
    if (user?.avatar) return user.avatar;
    if (user?.photoURL) return user.photoURL;
    if (user?.addfliplineAdminPhoto) return user.addfliplineAdminPhoto;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("roar_avatar_url") || localStorage.getItem("user_avatar");
      if (stored) return stored;
    }
    return "";
  }, [localAvatar, user]);

  const totalCommentsCount = useMemo(() => {
    const directCount = comments.reduce((sum, c) => {
      const repCount = typeof c.replyCount === "number" ? c.replyCount : (replies[c.id]?.length || 0);
      return sum + 1 + repCount;
    }, 0);
    return Math.max(article?.commentCount || article?.commentsCount || 0, directCount);
  }, [article?.commentCount, article?.commentsCount, comments, replies]);

  const getUserId = () => user?.userId || null;
  const getLikeActorId = () => user?.userId || `guest:${getUserName ? getUserName() : "user"}`;
  const currentUserId = user?.userId || user?.email || "";
  const displayName = user ? getUserDisplayName() : "Guest";

  const buildArticleUrl = (artId: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/MainModules/CricketArticles/${artId}`;
  };

  const buildShareText = (target: ArticleDetail) => {
    const shareUrl = buildArticleUrl(target.id);
    return [
      `Read ${target.title} on Sportsfan`,
      `${target.readTime ? `${target.readTime} • ` : ""}${formatViews(viewCount)}`,
      `View article: ${shareUrl}`,
    ].join("\n");
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
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildShareText(article))}`, "_blank", "noopener,noreferrer");
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
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildArticleUrl(article.id))}`, "_blank", "noopener,noreferrer");
  };
  const handleShareToX = () => {
    if (!article) return;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildShareText(article))}`, "_blank", "noopener,noreferrer");
  };
  const handleCopyLink = async () => {
    if (!article) return;
    const ok = await copyToClipboard(buildShareText(article));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  // ── Fetch article ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!articleId) return;
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`/api/cricket-articles/${articleId}`);
        const rawArticle =
          res.data?.article ??
          (Array.isArray(res.data?.articles) ? res.data.articles[0] : null) ??
          (res.data?.id || res.data?._id ? res.data : null);

        const normalized = normalizeArticleStats(rawArticle);
        if (!normalized) {
          setArticle(null);
          return;
        }

        const actorId = getLikeActorId();
        const storageKey = getLikeStorageKey(normalized.id, actorId);

        let userLikedFromNews = false;
        try {
          const rawLocal = window.localStorage?.getItem(CRICKET_USER_LIKES_KEY);
          if (rawLocal) {
            const parsed = JSON.parse(rawLocal);
            userLikedFromNews = parsed[normalized.id] === true;
          }
        } catch {}

        const isUserLiked =
          (Array.isArray(normalized.likedBy) && normalized.likedBy.includes(actorId)) ||
          localStorage.getItem(storageKey) === "1" ||
          userLikedFromNews;

        const persistedViews = Math.max(normalized.viewCount ?? 0, readStoredCount(getViewCountStorageKey(normalized.id)));
        const persistedLikes = Math.max(normalized.likeCount ?? normalized.likes ?? 0, readStoredCount(getLikeCountStorageKey(normalized.id)));

        writeStoredCount(getViewCountStorageKey(normalized.id), persistedViews);
        writeStoredCount(getLikeCountStorageKey(normalized.id), persistedLikes);

        normalized.viewCount = persistedViews;
        normalized.views = formatViews(persistedViews);
        normalized.likeCount = persistedLikes;
        normalized.likes = persistedLikes;

        setArticle(normalized);
        setViewCount(persistedViews);
        setLikeCount(persistedLikes);
        setLiked(isUserLiked);
      } catch (err: any) {
        console.error("[ArticleDetail] fetch failed:", err);
        setError(`Failed to load article.${err?.response?.status ? ` (HTTP ${err.response.status})` : ""}`);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, user?.userId]);

  useEffect(() => {
    if (!article?.id) return;
    if (viewSyncedForArticle.current === article.id) return;
    viewSyncedForArticle.current = article.id;

    const syncView = async () => {
      const optimisticViews = Math.max(viewCount, toViewCount(article.views), article.viewCount || 0) + 1;
      writeStoredCount(getViewCountStorageKey(article.id), optimisticViews);
      setViewCount(optimisticViews);

      try {
        const res = await axios.post(`/api/cricket-articles/${article.id}/view`);
        if (res.data?.viewCount) {
          const sCount = Number(res.data.viewCount);
          writeStoredCount(getViewCountStorageKey(article.id), sCount);
          setViewCount(sCount);
        }
      } catch (e) {
        console.warn("View counter background sync notice:", e);
      }
    };

    void syncView();
  }, [article?.id]);

  const handleLikeClick = async () => {
    if (!article || likeSubmitting) return;

    const actorId = getLikeActorId();
    const storageKey = getLikeStorageKey(article.id, actorId);
    const nextLiked = !liked;
    const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

    setLikeSubmitting(true);
    setLiked(nextLiked);
    setLikeCount(nextCount);
    writeStoredCount(getLikeCountStorageKey(article.id), nextCount);

    if (nextLiked) localStorage.setItem(storageKey, "1");
    else localStorage.removeItem(storageKey);

    try {
      const rawLocal = window.localStorage?.getItem(CRICKET_USER_LIKES_KEY);
      let cricketUserLikes: Record<string, boolean> = rawLocal ? JSON.parse(rawLocal) : {};
      if (nextLiked) cricketUserLikes[article.id] = true;
      else delete cricketUserLikes[article.id];
      window.localStorage?.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(cricketUserLikes));
    } catch {}

    try {
      const res = await axios.post(`/api/cricket-articles/${article.id}/like`, {
        userId: actorId,
        action: nextLiked ? "like" : "unlike",
      });
      if (res.data) {
        const serverLikes =
          typeof res.data.likeCount === "number" ? res.data.likeCount : typeof res.data.likes === "number" ? res.data.likes : nextCount;
        setLikeCount(serverLikes);
        writeStoredCount(getLikeCountStorageKey(article.id), serverLikes);
      }
    } catch (err) {
      console.error("Failed to update like state on backend:", err);
    } finally {
      setLikeSubmitting(false);
    }
  };

  // ── Comments logic (inlined, wired to /api/cricket-articles/[id]/comments) ─
  const fetchComments = useCallback(async () => {
    if (!article?.id) return;
    setCommentsLoading(true);
    try {
      const res = await axios.get(`/api/cricket-articles/${article.id}/comments?limit=20`);
      if (res.data?.success) {
        setComments(res.data.comments ?? []);
      }
    } catch (err) {
      console.error("[Comments] fetch failed:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [article?.id]);

  useEffect(() => {
    if (!article?.id) return;
    if (commentsLoadedForArticle.current === article.id) return;
    commentsLoadedForArticle.current = article.id;
    fetchComments();
  }, [article?.id, fetchComments]);

  const fetchReplies = useCallback(async (commentId: string) => {
    try {
      const res = await axios.get(`/api/cricket-articles/${article?.id}/comments?parentCommentId=${commentId}&limit=20`);
      if (res.data?.success) {
        setReplies((prev) => ({ ...prev, [commentId]: res.data.comments ?? [] }));
      }
    } catch (err) {
      console.error("[Comments] fetch replies failed:", err);
    }
  }, [article?.id]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    const input = commentInputRef.current;
    if (!input) {
      setCommentText((prev) => prev + emoji);
      setShowEmojiPicker(false);
      return;
    }
    const start = input.selectionStart ?? commentText.length;
    const end = input.selectionEnd ?? commentText.length;
    const newText = commentText.slice(0, start) + emoji + commentText.slice(end);
    setCommentText(newText);
    setShowEmojiPicker(false);
    requestAnimationFrame(() => {
      input.focus();
      const newPos = start + emoji.length;
      input.setSelectionRange(newPos, newPos);
    });
  }, [commentText]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !user || !article?.id) return;
    setCommentSubmitting(true);
    try {
      const res = await axios.post(`/api/cricket-articles/${article.id}/comments`, {
        commentText: commentText.trim(),
        userId: user.userId || user.email,
        userName: getUserDisplayName(),
        userAvatar: currentUserAvatar,
        userEmail: user.email,
        parentCommentId: replyTo?.commentId,
      });

      if (res.data?.success) {
        const newComment: Comment = {
          ...res.data.comment,
          userAvatar: res.data.comment?.userAvatar || currentUserAvatar,
        };
        if (replyTo?.commentId) {
          setReplies((prev) => ({
            ...prev,
            [replyTo.commentId]: [...(prev[replyTo.commentId] || []), newComment],
          }));
          setComments((prev) =>
            prev.map((c) => (c.id === replyTo.commentId ? { ...c, replyCount: (c.replyCount || 0) + 1 } : c))
          );
        } else {
          setComments((prev) => [newComment, ...prev]);
        }
      }
      setCommentText("");
      setReplyTo(null);
    } catch (err) {
      console.error("[Comments] submit failed:", err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleCommentLike = async (commentId: string, isReply: boolean, parentCommentId?: string) => {
    if (!user || !article?.id) return;
    const userId = user.userId || user.email;

    // Determine current liked state for a correct toggle direction
    const target = isReply && parentCommentId
      ? replies[parentCommentId]?.find((c) => c.id === commentId)
      : comments.find((c) => c.id === commentId);
    const isLiked = target?.likedBy?.includes(userId);

    try {
      const res = await axios.put(`/api/cricket-articles/${article.id}/comments`, {
        commentId,
        userId,
        action: isLiked ? "unlike" : "like",
      });
      if (res.data?.success) {
        const updated = res.data.comment;
        if (isReply && parentCommentId) {
          setReplies((prev) => ({
            ...prev,
            [parentCommentId]: prev[parentCommentId]?.map((c) => (c.id === commentId ? { ...c, ...updated } : c)) || [],
          }));
        } else {
          setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c)));
        }
      }
    } catch (err) {
      console.error("[Comments] like failed:", err);
    }
  };

  const handleCommentDelete = async (commentId: string, parentCommentId?: string) => {
    if (!user || !article?.id) return;
    try {
      const res = await axios.delete(`/api/cricket-articles/${article.id}/comments?commentId=${commentId}`);
      if (res.data?.success) {
        if (parentCommentId) {
          setReplies((prev) => ({
            ...prev,
            [parentCommentId]: prev[parentCommentId]?.filter((c) => c.id !== commentId) || [],
          }));
          setComments((prev) =>
            prev.map((c) => (c.id === parentCommentId ? { ...c, replyCount: Math.max(0, (c.replyCount || 0) - 1) } : c))
          );
        } else {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
      }
    } catch (err) {
      console.error("[Comments] delete failed:", err);
    }
  };

  const handleReplyClick = (commentId: string, userName: string) => {
    setReplyTo({ commentId, userName });
    setCommentText(`@${userName} `);
    commentInputRef.current?.focus();
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#0d0d10] gap-4 p-6 text-center">
        <p className="text-red-400">{error || "Article not found"}</p>
        <button onClick={() => router.back()} className="bg-pink-500 px-4 py-2 rounded text-white hover:bg-pink-600 transition">
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
    <div className="min-h-screen text-white px-4 py-6 max-w-6xl mx-auto pb-20">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-5 transition cursor-pointer">
        <ArrowLeft size={16} />
      </button>

      <div className="mb-3">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded text-white ${BADGE_COLORS[article.badge] || "bg-gray-600"}`}>
          {article.badge}
        </span>
      </div>

      <div className="flex justify-between items-start">
        <h1 className="text-[17px] font-bold leading-snug mb-3">{article.title}</h1>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-xs mb-4 flex-wrap">
        <span>{new Date(article.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        <span>·</span>
        <span>{formatViews(viewCount)}</span>
        <span>·</span>
        <span>{likeCount} likes</span>
        <span>·</span>
        <span>{totalCommentsCount} {totalCommentsCount === 1 ? "comment" : "comments"}</span>
      </div>

      <PlaylistDialog open={showPlaylistDialog} onClose={() => setShowPlaylistDialog(false)} itemId={article.id || ""} itemType="article" userId={getUserId()} />

      {article.image && article.image.trim() !== "" && (
        <>
          <div className="w-full rounded-xl overflow-hidden mb-2 bg-black/40 flex items-center justify-center border border-white/10">
            <img src={article.image} alt={article.title} className="w-full h-auto max-h-[250px] object-contain rounded-xl" />
          </div>
          <p className="text-center text-[11px] text-gray-500 mb-5">{article.title}</p>
        </>
      )}

      <div className="flex flex-col gap-4 mb-6">
        {article.description.map((para, index) => (
          <p key={index} className="text-gray-300 leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: para }} />
        ))}
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center border-t border-b border-white/10 py-2 mb-4">
        <button
          onClick={handleLikeClick}
          disabled={likeSubmitting}
          className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${liked ? "text-pink-400" : "text-gray-400"} ${likeSubmitting ? "opacity-70" : ""}`}
        >
          <LikeIcon filled={liked} />
          <span>{liked ? `Liked (${likeCount})` : `Like (${likeCount})`}</span>
        </button>

        <div className="w-px h-6 bg-white/10" />

        <button
          onClick={() => togglePanel("comments")}
          className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${activePanel === "comments" ? "text-white" : "text-gray-400"}`}
        >
          <CommentIcon />
          <span>Comment{totalCommentsCount > 0 ? ` (${totalCommentsCount})` : ""}</span>
        </button>

        <div className="w-px h-6 bg-white/10" />

        <button
          onClick={() => togglePanel("share")}
          className={`flex flex-1 items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition hover:bg-white/5 ${activePanel === "share" ? "text-white" : "text-gray-400"}`}
        >
          <ShareIcon />
          <span>Share</span>
        </button>
      </div>

      {/* ── Comments Panel (inlined) ─────────────────────────────────────── */}
      {activePanel === "comments" && (
        <div className="mb-4 flex w-full max-w-full flex-col gap-4 overflow-visible mt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Comments
              <span className="text-xs font-normal text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                {totalCommentsCount}
              </span>
            </h3>
          </div>

          <div className="flex items-start gap-2 w-full min-w-0">
            <Avatar name={displayName} avatar={currentUserAvatar} size={32} ring />
            <div className="flex-1 min-w-0 relative">
              {replyTo && (
                <div className="flex items-center gap-1 mb-1 text-xs text-[#C9115F]">
                  <Reply className="w-3 h-3" />
                  Replying to @{replyTo.userName}
                  <button onClick={() => { setReplyTo(null); setCommentText(""); }} className="ml-1 text-white/30 hover:text-white/60">
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1 bg-white/8 rounded-2xl border border-white/10 focus-within:border-[#C9115F]/50 transition-colors overflow-visible pr-1 w-full min-w-0">
                <input
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                    if (e.key === "Escape") setShowEmojiPicker(false);
                  }}
                  placeholder={user ? "Add a comment…" : "Sign in to comment"}
                  disabled={!user || commentSubmitting}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  disabled={!user}
                  className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${showEmojiPicker ? "bg-[#C9115F]/20 text-[#C9115F]" : "hover:bg-white/10 text-white/30 hover:text-white/60"}`}
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || !user || commentSubmitting}
                  className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 enabled:hover:bg-[#C9115F]/20 enabled:text-[#C9115F] text-white/30"
                >
                  {commentSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {showEmojiPicker && <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
            </div>
          </div>

          {commentsLoading && comments.length === 0 ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-white/30" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-white/25 text-sm text-center py-2">No comments yet. Be the first!</p>
          ) : (
            <div className="flex flex-col gap-4 w-full max-w-full overflow-visible">
              {comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  replies={replies[comment.id] || []}
                  onLike={handleCommentLike}
                  onDelete={handleCommentDelete}
                  onReply={handleReplyClick}
                  onLoadReplies={fetchReplies}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Share Panel ──────────────────────────────────────────────────── */}
      {activePanel === "share" && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-[#1a1a1e] p-4">
          <p className="text-sm font-semibold text-white mb-3">Share Article</p>

          <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
            <p className="text-sm font-semibold text-white line-clamp-2">{article.title}</p>
            <p className="text-[11px] text-white/40 mt-1.5 break-all">{buildArticleUrl(article.id)}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {SHARE_BUTTONS.map((btn) => (
              <button key={btn.label} onClick={btn.onClick} aria-label={btn.label} className="flex flex-col items-center gap-1.5 group">
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