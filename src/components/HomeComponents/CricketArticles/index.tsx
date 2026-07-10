

// chandu's code

// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

// interface Article {
//     id: string;
//     badge: BadgeType;
//     title: string;
//     author: string;
//     description: string[];
//     readTime: string;
//     views: string;
//     image: string;
//     createdAt: number;
//     updatedAt?: number;
//     commentCount?: number; // Add comment count field
// }

// interface ApiResponse {
//     success: boolean;
//     articles: Article[];
//     pagination: {
//         currentPage: number;
//         totalPages: number;
//         totalItems: number;
//         itemsPerPage: number;
//     };
// }

// const BADGE_COLORS: Record<BadgeType, string> = {
//     FEATURE: "bg-pink-600",
//     ANALYSIS: "bg-orange-500",
//     OPINION: "bg-purple-600",
//     NEWS: "bg-blue-600",
// };

// export default function CricketArticles() {
//     const [articles, setArticles] = useState<Article[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [showAll, setShowAll] = useState(false);
//     const router = useRouter();
//     const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
//     const [shareArticle, setShareArticle] = useState<Article | null>(null);
//     const [copied, setCopied] = useState(false);

//     useEffect(() => {
//    const fetchArticles = async () => {
//     try {
//         const res = await axios.get<ApiResponse>("/api/cricket-articles");
//         const articlesData = res.data.articles || [];
        
//         const articlesWithComments = await Promise.all(
//             articlesData.map(async (article) => {
//                 try {
//                     const commentsRes = await axios.get(
//                         `/api/comments?contentId=${article.id}`  // removed count=true
//                     );
//                     const count = commentsRes.data.comments?.length ?? 0;
//                     console.log("comments length",commentsRes.data.comments?.length)
//                     return { ...article, commentCount: count };
//                 } catch (err) {
//                     console.error(`Error fetching comment count for article ${article.id}:`, err);
//                     return { ...article, commentCount: 0 };
//                 }
//             })
//         );
        
//         setArticles(articlesWithComments);
//     } catch (error) {
//         console.error("Failed to fetch cricket articles", error);
//     } finally {
//         setLoading(false);
//     }
// };

//     fetchArticles();
// }, []);
  

//     const handleImageError = (id: string) => {
//         setImageErrors(prev => ({ ...prev, [id]: true }));
//     };

//     const closeShareDialog = () => {
//         setShareArticle(null);
//         setCopied(false);
//     };

//     const buildArticleShareUrl = (article: Article) => {
//         if (typeof window === "undefined") return "";
//         return `${window.location.origin}/MainModules/CricketArticles/${article.id}`;
//     };

//     const buildArticleShareText = (article: Article) => {
//         const shareUrl = buildArticleShareUrl(article);
//         return [
//             `Read ${article.title} on Sportsfan`,
//             article.readTime,
//             article.views,
//             `View article: ${shareUrl}`,
//         ].filter(Boolean).join("\n");
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

//     const handleShareToWhatsApp = () => {
//         if (!shareArticle) return;
//         const shareText = buildArticleShareText(shareArticle);
//         const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
//         const whatsappWebFallbackUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
//         const opened = window.open(whatsappAppUrl, "_self");
//         if (!opened) {
//             window.location.href = whatsappWebFallbackUrl;
//         }
//     };

//     const handleShareToThreads = () => {
//         if (!shareArticle) return;
//         const shareText = buildArticleShareText(shareArticle);
//         window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
//     };

//     const handleShareToInstagram = async () => {
//         if (!shareArticle) return;
//         const shareText = buildArticleShareText(shareArticle);
//         const ok = await copyToClipboard(shareText);
//         if (ok) {
//             setCopied(true);
//             setTimeout(() => setCopied(false), 1600);
//         }
//         window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
//     };

//     const handleShareToLinkedIn = () => {
//         if (!shareArticle) return;
//         const shareUrl = buildArticleShareUrl(shareArticle);
//         window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
//     };

//     const handleShareToX = () => {
//         if (!shareArticle) return;
//         const shareText = buildArticleShareText(shareArticle);
//         window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
//     };

//     const handleCopyLink = async () => {
//         if (!shareArticle) return;
//         const ok = await copyToClipboard(buildArticleShareText(shareArticle));
//         if (!ok) return;
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1600);
//     };

//     const visible = showAll ? articles : articles.slice(0, 4);

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

//     if (error || !articles) {
//         return (
//             <div className="flex justify-center items-center bg-[#0d0d10] w-[30px] h-[30px] rounded-lg mx-auto mt-10">
//                 <div className="text-center">
//                     <p className="text-red-400 mb-4">{error || "Articles not found"}</p>
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
//         <div className="mb-8 lg:px-6 w-[100%] max-w-full overflow-x-hidden pb-10">
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-[24px] font-bold text-white">Cricket Articles</h2>
//                 {articles.length > 4 && (
//                     <button
//                         onClick={() => setShowAll((value) => !value)}
//                         className="text-pink-500 text-sm font-medium hover:opacity-75 transition flex-shrink-0"
//                     >
//                         {showAll ? "Show Less" : "See All"}
//                     </button>
//                 )}
//             </div>

//             {articles.length > 0 ? (
//                 <div className="grid grid-cols-1 gap-3 min-h-[150px] md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 lg:gap-4">
//                     {visible.map((article) => (
//                         <div
//                             key={article.id}
//                             className="relative flex flex-col sm:flex-row bg-[#1a1a1a] rounded-md overflow-visible border border-white/10 cursor-pointer hover:border-white/20 transition"
//                             onClick={() => router.push(`/MainModules/CricketArticles/${article.id}`)}
//                         >
//                             <div className="relative w-full sm:w-[250px] sm:min-w-[250px] lg:w-[300px] lg:min-w-[300px] flex-shrink-0">
//                                 {!imageErrors[article.id] ? (
//                                     <img
//                                         src={article.image}
//                                         alt={article.title}
//                                         className="w-full h-[120px] sm:h-full object-cover"
//                                         onError={() => handleImageError(article.id)}
//                                     />
//                                 ) : (
//                                     <div className="w-full h-[180px] sm:h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
//                                         No image
//                                     </div>
//                                 )}
//                                 <p className="absolute bottom-2 left-2 text-gray-100 text-[11px] bg-black/60 px-2 py-0.5 rounded whitespace-nowrap">
//                                     {article.readTime}
//                                     <span className="mx-1">•</span>
//                                     {article.views}
//                                 </p>
//                             </div>

//                             <div className="relative p-2 sm:p-2.5 flex flex-col justify-center gap-1 flex-1 min-w-0">
//                                 <button
//                                     type="button"
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         setShareArticle(article);
//                                         setCopied(false);
//                                     }}
//                                     className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center hover:bg-[#2a2a2e] transition"
//                                     aria-label={`Share ${article.title}`}
//                                 >
//                                     <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                                         <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                         <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                         <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4" />
//                                         <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
//                                     </svg>
//                                 </button>

//                                 <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md text-white w-fit tracking-wide ${BADGE_COLORS[article.badge] || "bg-gray-600"}`}>
//                                     {article.badge}
//                                 </span>
//                                 <p className="text-white font-bold text-[15px] leading-snug line-clamp-2">
//                                     {article.title}
//                                 </p>
//                                 <p className="text-gray-400 text-[11px] leading-snug">
//                                     Author - {article.author}
//                                 </p>
//                                 <p
//                                     className="text-gray-400 text-[12px] leading-snug line-clamp-2"
//                                     dangerouslySetInnerHTML={{
//                                         __html: article.description?.[0] ?? "No description available",
//                                     }}
//                                 />


                            
//                                 <div className="flex items-center gap-3 mt-1">
//                                     <div className="flex items-center gap-1 text-gray-500">
//                                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                                             <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
//                                         </svg>
//                                         <span className="text-[11px]">{article.commentCount || 0} comments</span>
//                                     </div>
//                                 </div>

//                                 <span className="text-blue-400 text-[13px]">Read more ...</span>
//                             </div>

//                             {shareArticle?.id === article.id && (
//                                 <>
//                                     <button
//                                         type="button"
//                                         aria-label="Close share popup"
//                                         className="fixed inset-0 z-40 bg-black/70 lg:hidden"
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             closeShareDialog();
//                                         }}
//                                     />
//                                     <div
//                                         className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[260px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden"
//                                         onClick={(e) => e.stopPropagation()}
//                                     >
//                                         <div className="flex items-center justify-between mb-2">
//                                             <p className="text-white text-sm font-semibold">Share</p>
//                                             <button onClick={closeShareDialog} className="text-gray-400 hover:text-white transition" aria-label="Close share popup">
//                                                 <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                                                     <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                                                 </svg>
//                                             </button>
//                                         </div>

//                                         <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto -ml-1">
//                                             <button onClick={handleShareToWhatsApp} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on WhatsApp">
//                                                 <img src="/images/share_whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleShareToThreads} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on Threads">
//                                                 <img src="/images/share_thread.png" alt="Threads" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleShareToInstagram} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on Instagram">
//                                                 <img src="/images/share_insta.png" alt="Instagram" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleShareToLinkedIn} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on LinkedIn">
//                                                 <img src="/images/Share_linkedin.png" alt="LinkedIn" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleShareToX} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on X">
//                                                 <img src="/images/Share_X.png" alt="X" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleCopyLink} className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Copy share link">
//                                                 <img src="/images/share_copy_link.png" alt="Copy link" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                         </div>

//                                         {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//                                     </div>

//                                     <div
//                                         className="hidden lg:block absolute right-2 top-12 z-50 w-[260px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl"
//                                         onClick={(e) => e.stopPropagation()}
//                                     >
//                                         <div className="flex items-center justify-between mb-2">
//                                             <p className="text-white text-sm font-semibold">Share Article</p>
//                                             <button
//                                                 type="button"
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     closeShareDialog();
//                                                 }}
//                                                 className="text-gray-400 hover:text-white transition"
//                                                 aria-label="Close share panel"
//                                             >
//                                                 <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                                                     <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                                                 </svg>
//                                             </button>
//                                         </div>

//                                         <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-2">
//                                             <p className="text-white text-sm font-semibold line-clamp-2">{article.title}</p>
//                                             <p className="text-white/65 text-xs mt-1 line-clamp-2">{article.badge}</p>
//                                             <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildArticleShareUrl(article)}</p>
//                                         </div>

//                                         <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 -ml-1">
//                                             <button onClick={handleShareToWhatsApp} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on WhatsApp">
//                                                 <img src="/images/share_whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleShareToThreads} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on Threads">
//                                                 <img src="/images/share_thread.png" alt="Threads" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleShareToInstagram} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on Instagram">
//                                                 <img src="/images/share_insta.png" alt="Instagram" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleShareToLinkedIn} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on LinkedIn">
//                                                 <img src="/images/Share_linkedin.png" alt="LinkedIn" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleShareToX} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on X">
//                                                 <img src="/images/Share_X.png" alt="X" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                             <button onClick={handleCopyLink} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Copy share link">
//                                                 <img src="/images/share_copy_link.png" alt="Copy link" className="w-full h-full object-cover rounded-full" />
//                                             </button>
//                                         </div>

//                                         {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <div className="text-center py-10">
//                     <p className="text-gray-400">No articles available</p>
//                 </div>
//             )}
//         </div>
//     );
// }











"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type BadgeType = "FEATURE" | "ANALYSIS" | "OPINION" | "NEWS";

interface Article {
    id: string;
    badge: BadgeType;
    title: string;
    author: string;
    description: string[];
    readTime: string;
    views: string;
    viewCount?: number;
    likes?: number;
    likeCount?: number;
    likedBy?: string[];
    image: string;
    createdAt: number;
    updatedAt?: number;
    commentCount?: number; // Add comment count field
}

interface CommentItem {
    id: string;
    userId: string;
    userName: string;
    commentText: string;
    isFlagged?: boolean;
    flaggedByAdmin?: boolean;
    flaggedBy?: string;
    flagReason?: string;
    flaggedAt?: number;
}

interface ApiResponse {
    success: boolean;
    articles: Article[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

const BADGE_COLORS: Record<BadgeType, string> = {
    FEATURE: "bg-pink-600",
    ANALYSIS: "bg-orange-500",
    OPINION: "bg-purple-600",
    NEWS: "bg-blue-600",
};

const getViewCountStorageKey = (articleId: string) => `cricket_article_views_${articleId}`;

const toViewCount = (viewsText: string | number | undefined) => {
    if (typeof viewsText === "number") return viewsText;
    if (!viewsText) return 0;
    const numeric = String(viewsText).replace(/[^\d]/g, "");
    return Number.parseInt(numeric, 10) || 0;
};

const formatViews = (count: number) => `${count} views`;

const readStoredCount = (key: string) => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
};

const writeStoredCount = (key: string, count: number) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, String(Math.max(0, count)));
};

const normalizeArticle = (article: Article): Article => {
    const persistedViews = Math.max(
        article.viewCount ?? toViewCount(article.views),
        readStoredCount(getViewCountStorageKey(article.id))
    );

    writeStoredCount(getViewCountStorageKey(article.id), persistedViews);

    return {
        ...article,
        viewCount: persistedViews,
        views: formatViews(persistedViews),
    };
};

export default function CricketArticles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const { user } = useAuth();
    const [flaggedCommentsByArticle, setFlaggedCommentsByArticle] = useState<Record<string, CommentItem | null>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);
    const router = useRouter();
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [shareArticle, setShareArticle] = useState<Article | null>(null);
    const [copied, setCopied] = useState(false);
    const [currentFlagged, setCurrentFlagged] = useState<{ articleId: string; comment: CommentItem } | null>(null);

    const ackKey = (userId: string, commentId: string) => `flag_ack_${userId}_${commentId}`;

    const isFlagAcked = (commentId: string) => {
        try {
            if (!user?.userId || typeof window === "undefined") return false;
            return window.localStorage.getItem(ackKey(user.userId, commentId)) === "1";
        } catch {
            return false;
        }
    };

    const ackFlag = (commentId: string) => {
        try {
            if (!user?.userId || typeof window === "undefined") return;
            window.localStorage.setItem(ackKey(user.userId, commentId), "1");
        } catch (e) {
            console.error("Failed to acknowledge flagged comment", e);
        }
    };

    const ackAndClose = (commentId: string) => {
        // persist ack
        ackFlag(commentId);

        // remove acknowledged from map
        setFlaggedCommentsByArticle((prev) => {
            const next = { ...prev };
            for (const k of Object.keys(next)) {
                if (next[k]?.id === commentId) {
                    delete next[k];
                }
            }
            return next;
        });

        // find next unacknowledged flagged comment and show it
        setTimeout(() => {
            setFlaggedCommentsByArticle((latest) => {
                const ids = Object.keys(latest || {});
                const unacked = ids.filter((id) => !!(latest[id] && !isFlagAcked(latest[id]!.id)));
                if (unacked.length > 0) {
                    const nextComment = latest[unacked[0]];
                    if (nextComment) {
                        setCurrentFlagged({ articleId: unacked[0], comment: nextComment });
                    } else {
                        setCurrentFlagged(null);
                    }
                } else {
                    setCurrentFlagged(null);
                }
                return latest;
            });
        }, 0);
    };

    useEffect(() => {
   const fetchArticles = async () => {
    try {
        const res = await axios.get<ApiResponse>("/api/cricket-articles");
        const articlesData = res.data.articles || [];
        const flaggedMap: Record<string, CommentItem> = {};
        const articlesWithComments = await Promise.all(
            articlesData.map(async (article) => {
                try {
                    const commentsRes = await axios.get(
                        `/api/comments?contentId=${article.id}`
                    );
                    const count = commentsRes.data.comments?.length ?? 0;
                    console.log("comments length", commentsRes.data.comments?.length);

                    const commentsList: CommentItem[] = commentsRes.data.comments || [];
                    const flaggedForUser = user?.userId
                        ? commentsList.find((c) => (c.userId === user.userId) && (c.isFlagged || c.flaggedByAdmin)) || null
                        : null;
                    if (flaggedForUser) {
                        flaggedMap[article.id] = flaggedForUser;
                    }

                    return normalizeArticle({ ...article, commentCount: count });
                } catch (err) {
                    console.error(`Error fetching comment count for article ${article.id}:`, err);
                    return normalizeArticle({ ...article, commentCount: 0 });
                }
            })
        );

        // publish flagged map and open dialog for first unacknowledged flagged comment (homepage-only)
        setFlaggedCommentsByArticle(flaggedMap);
        if (user?.userId && Object.keys(flaggedMap).length > 0) {
            const unacked = Object.keys(flaggedMap).filter((id) => !isFlagAcked(flaggedMap[id].id));
            if (unacked.length > 0) {
                const firstId = unacked[0];
                setCurrentFlagged({ articleId: firstId, comment: flaggedMap[firstId] });
            }
        }

        setArticles(articlesWithComments);
    } catch (error) {
        console.error("Failed to fetch cricket articles", error);
    } finally {
        setLoading(false);
    }
};

    fetchArticles();
}, [user?.userId]);
  

    const handleImageError = (id: string) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    const closeShareDialog = () => {
        setShareArticle(null);
        setCopied(false);
    };

    const buildArticleShareUrl = (article: Article) => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/MainModules/CricketArticles/${article.id}`;
    };

    const buildArticleShareText = (article: Article) => {
        const shareUrl = buildArticleShareUrl(article);
        return [
            `Read ${article.title} on Sportsfan`,
            article.readTime,
            article.views,
            `View article: ${shareUrl}`,
        ].filter(Boolean).join("\n");
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

    const handleShareToWhatsApp = () => {
        if (!shareArticle) return;
        const shareText = buildArticleShareText(shareArticle);
        const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
        const whatsappWebFallbackUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        const opened = window.open(whatsappAppUrl, "_self");
        if (!opened) {
            window.location.href = whatsappWebFallbackUrl;
        }
    };

    const handleShareToThreads = () => {
        if (!shareArticle) return;
        const shareText = buildArticleShareText(shareArticle);
        window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
    };

    const handleShareToInstagram = async () => {
        if (!shareArticle) return;
        const shareText = buildArticleShareText(shareArticle);
        const ok = await copyToClipboard(shareText);
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        }
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    };

    const handleShareToLinkedIn = () => {
        if (!shareArticle) return;
        const shareUrl = buildArticleShareUrl(shareArticle);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
    };

    const handleShareToX = () => {
        if (!shareArticle) return;
        const shareText = buildArticleShareText(shareArticle);
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
    };

    const handleCopyLink = async () => {
        if (!shareArticle) return;
        const ok = await copyToClipboard(buildArticleShareText(shareArticle));
        if (!ok) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const visible = showAll ? articles : articles.slice(0, 4);

    if (loading) {
        return (
            <div className="flex justify-center items-center bg-[#0d0d10] min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading posts...</p>
                </div>
            </div>
        );
    }

    if (error || !articles) {
        return (
            <div className="flex justify-center items-center bg-[#0d0d10] w-[30px] h-[30px] rounded-lg mx-auto mt-10">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Articles not found"}</p>
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

    return (
        <div className="mb-8 lg:px-6 w-[100%] max-w-full overflow-x-hidden pb-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[24px] font-bold text-white">Cricket Articles</h2>
                {articles.length > 4 && (
                    <button
                        onClick={() => setShowAll((value) => !value)}
                        className="text-pink-500 text-sm font-medium hover:opacity-75 transition flex-shrink-0"
                    >
                        {showAll ? "Show Less" : "See All"}
                    </button>
                )}
            </div>

            {articles.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 min-h-[150px] md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 lg:gap-4">
                    {visible.map((article) => (
                        <div
                            key={article.id}
                            className="relative flex flex-col sm:flex-row bg-[#1a1a1a] rounded-md overflow-visible border border-white/10 cursor-pointer hover:border-white/20 transition"
                            onClick={() => router.push(`/MainModules/CricketArticles/${article.id}`)}
                        >
                            <div className="relative w-full sm:w-[250px] sm:min-w-[250px] lg:w-[300px] lg:min-w-[300px] flex-shrink-0">
                                {!imageErrors[article.id] ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-[120px] sm:h-full object-cover"
                                        onError={() => handleImageError(article.id)}
                                    />
                                ) : (
                                    <div className="w-full h-[180px] sm:h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                                        No image
                                    </div>
                                )}
                                <p className="absolute bottom-2 left-2 text-gray-100 text-[11px] bg-black/60 px-2 py-0.5 rounded whitespace-nowrap">
                                    {article.readTime}
                                    <span className="mx-1">•</span>
                                    {article.views}
                                </p>
                            </div>

                            <div className="relative p-2 sm:p-2.5 flex flex-col justify-center gap-1 flex-1 min-w-0">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShareArticle(article);
                                        setCopied(false);
                                    }}
                                    className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-[#1e1e22] flex items-center justify-center hover:bg-[#2a2a2e] transition"
                                    aria-label={`Share ${article.title}`}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <circle cx="12" cy="3" r="1.8" stroke="#aaa" strokeWidth="1.4" />
                                        <circle cx="12" cy="13" r="1.8" stroke="#aaa" strokeWidth="1.4" />
                                        <circle cx="4" cy="8" r="1.8" stroke="#aaa" strokeWidth="1.4" />
                                        <path d="M10.3 3.9L5.7 7.1M10.3 12.1L5.7 8.9" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
                                    </svg>
                                </button>

                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md text-white w-fit tracking-wide ${BADGE_COLORS[article.badge] || "bg-gray-600"}`}>
                                    {article.badge}
                                </span>
                                <p className="text-white font-bold text-[15px] leading-snug line-clamp-2">
                                    {article.title}
                                </p>
                                <p className="text-gray-400 text-[11px] leading-snug">
                                    Author - {article.author}
                                </p>
                                <p
                                    className="text-gray-400 text-[12px] leading-snug line-clamp-2"
                                    dangerouslySetInnerHTML={{
                                        __html: article.description?.[0] ?? "No description available",
                                    }}
                                />


                            
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                        </svg>
                                        <span className="text-[11px]">{article.commentCount || 0} comments</span>
                                    </div>
                                    {/* Homepage dialog will surface flagged comment details; remove per-card badge */}
                                </div>

                                <span className="text-blue-400 text-[13px]">Read more ...</span>
                            </div>

                            {shareArticle?.id === article.id && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Close share popup"
                                        className="fixed inset-0 z-40 bg-black/70 lg:hidden"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeShareDialog();
                                        }}
                                    />
                                    <div
                                        className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[260px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-white text-sm font-semibold">Share</p>
                                            <button onClick={closeShareDialog} className="text-gray-400 hover:text-white transition" aria-label="Close share popup">
                                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto -ml-1">
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

                                    <div
                                        className="hidden lg:block absolute right-2 top-12 z-50 w-[260px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-white text-sm font-semibold">Share Article</p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    closeShareDialog();
                                                }}
                                                className="text-gray-400 hover:text-white transition"
                                                aria-label="Close share panel"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-2">
                                            <p className="text-white text-sm font-semibold line-clamp-2">{article.title}</p>
                                            <p className="text-white/65 text-xs mt-1 line-clamp-2">{article.badge}</p>
                                            <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildArticleShareUrl(article)}</p>
                                        </div>

                                        <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 -ml-1">
                                            <button onClick={handleShareToWhatsApp} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on WhatsApp">
                                                <img src="/images/share_whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover rounded-full" />
                                            </button>
                                            <button onClick={handleShareToThreads} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on Threads">
                                                <img src="/images/share_thread.png" alt="Threads" className="w-full h-full object-cover rounded-full" />
                                            </button>
                                            <button onClick={handleShareToInstagram} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on Instagram">
                                                <img src="/images/share_insta.png" alt="Instagram" className="w-full h-full object-cover rounded-full" />
                                            </button>
                                            <button onClick={handleShareToLinkedIn} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on LinkedIn">
                                                <img src="/images/Share_linkedin.png" alt="LinkedIn" className="w-full h-full object-cover rounded-full" />
                                            </button>
                                            <button onClick={handleShareToX} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Share on X">
                                                <img src="/images/Share_X.png" alt="X" className="w-full h-full object-cover rounded-full" />
                                            </button>
                                            <button onClick={handleCopyLink} className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center" aria-label="Copy share link">
                                                <img src="/images/share_copy_link.png" alt="Copy link" className="w-full h-full object-cover rounded-full" />
                                            </button>
                                        </div>

                                        {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-400">No articles available</p>
                </div>
            )}
            {/* Homepage-only flagged comment modal */}
            {currentFlagged && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6" onClick={() => setCurrentFlagged(null)}>
                    <div
                        className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#141417] p-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-amber-300 text-sm font-semibold uppercase tracking-wide">Warning</p>
                                <h3 className="mt-1 text-white text-lg font-semibold">Flagged comment</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => currentFlagged && ackAndClose(currentFlagged.comment.id)}
                                className="text-gray-400 hover:text-white transition"
                                aria-label="Close warning dialog"
                            >
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
                            <div>
                                <p className="text-xs text-gray-400">Comment by</p>
                                <p className="text-sm text-white font-medium">{currentFlagged.comment.userName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Comment</p>
                                <p className="text-sm text-white/90 leading-snug break-words">{currentFlagged.comment.commentText}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-400">Flagged by</p>
                                    <p className="text-sm text-amber-300">{currentFlagged.comment.flaggedBy || (currentFlagged.comment.flaggedByAdmin ? 'Admin' : 'Moderator')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Flagged status</p>
                                    <p className="text-sm text-amber-300">{currentFlagged.comment.isFlagged || currentFlagged.comment.flaggedByAdmin ? 'Needs review' : 'Flagged'}</p>
                                </div>
                            </div>
                            {currentFlagged.comment.flagReason && (
                                <div>
                                    <p className="text-xs text-gray-400">Reason</p>
                                    <p className="text-sm text-white/90 break-words">{currentFlagged.comment.flagReason}</p>
                                </div>
                            )}
                            {currentFlagged.comment.flaggedAt && (
                                <div>
                                    <p className="text-xs text-gray-400">Flagged at</p>
                                    <p className="text-sm text-white/90">{new Date(currentFlagged.comment.flaggedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => currentFlagged && ackAndClose(currentFlagged.comment.id)}
                                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Flagged comment modal (homepage)
// placed outside the component's return to avoid nesting issues when applying patch