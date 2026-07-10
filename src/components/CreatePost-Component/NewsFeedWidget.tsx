// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Heart, MessageCircle, Repeat2, Share2, BadgeCheck, MoreHorizontal, ArrowRight } from "lucide-react";

// // ─── Types ────────────────────────────────────────────────────────────────────
// type NewsArticle = {
//   rank: number;
//   title: string;
//   summary: string;
//   source: string;
//   url: string;
//   tag: string;
//   cdn_url: string;
//   likes: number;
//   createdAt?: number;
//   id?: string;
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const stripHtml = (html: string) => html?.replace(/<[^>]*>/g, "").trim() ?? "";

// const timeAgo = (ts?: number): string => {
//   if (!ts) return "just now";
//   const diff = (Date.now() - ts) / 1000;
//   if (diff < 60) return `${Math.floor(diff)}s`;
//   if (diff < 3600) return `${Math.floor(diff / 60)}m`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
//   return `${Math.floor(diff / 86400)}d`;
// };

// const fmtCount = (n: number) =>
//   n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

// // ─── Single News Post Card ─────────────────────────────────────────────────────
// function NewsPostCard({ article }: { article: NewsArticle }) {
//   const [liked, setLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(article.likes || 0);
//   const [retweeted, setRetweeted] = useState(false);
//   const [retweetCount, setRetweetCount] = useState(
//     Math.floor(Math.random() * 30) + 5
//   );
//   const commentCount = Math.floor(Math.random() * 50) + 10;

//   const handleLike = () => {
//     setLiked((p) => !p);
//     setLikeCount((p) => (liked ? p - 1 : p + 1));
//   };

//   const handleRetweet = () => {
//     setRetweeted((p) => !p);
//     setRetweetCount((p) => (retweeted ? p - 1 : p + 1));
//   };

//   const isInternal =
//     article.source === "SportsFan360" ||
//     article.url?.includes("/MainModules/");

//   return (
//     <article className="news-post-card">
//       {/* ── Header ── */}
//       <div className="npc-header">
//         <div className="npc-avatar">
//           <span className="npc-avatar-letter">S</span>
//         </div>
//         <div className="npc-meta">
//           <span className="npc-handle-name">SportsFan360</span>
//           <BadgeCheck size={14} className="npc-verified" />
//           <span className="npc-handle">@sportsfan360</span>
//           <span className="npc-dot">·</span>
//           <span className="npc-time">{timeAgo(article.createdAt)}</span>
//         </div>
//         <button className="npc-more">
//           <MoreHorizontal size={16} />
//         </button>
//       </div>

//       {/* ── Body ── */}
//       <div className="npc-body">
//         {/* Thumbnail */}
//         <div className="npc-thumb">
//           <Image
//             src={article.cdn_url || "/images/News_center_Default.png"}
//             alt={article.title}
//             fill
//             className="npc-thumb-img"
//             onError={(e) => {
//               (e.currentTarget as HTMLImageElement).src =
//                 "/images/News_center_Default.png";
//             }}
//           />
//         </div>

//         {/* Content */}
//         <div className="npc-content">
//           <span className="npc-tag">{article.tag || "ARTICLE"}</span>
//           <h3 className="npc-title">{article.title}</h3>
//           <p className="npc-summary">{stripHtml(article.summary)}</p>
//           {isInternal ? (
//             <Link href={article.url} className="npc-read-more">
//               Read More <ArrowRight size={13} />
//             </Link>
//           ) : (
//             <a
//               href={article.url}
//               target="_blank"
//               rel="noreferrer"
//               className="npc-read-more"
//             >
//               Read More <ArrowRight size={13} />
//             </a>
//           )}
//         </div>
//       </div>

//       {/* ── Actions ── */}
//       <div className="npc-actions">
//         <button
//           className={`npc-action ${liked ? "npc-action--liked" : ""}`}
//           onClick={handleLike}
//         >
//           <Heart
//             size={16}
//             fill={liked ? "currentColor" : "none"}
//             strokeWidth={liked ? 0 : 1.8}
//           />
//           <span>{fmtCount(likeCount)}</span>
//         </button>

//         <button className="npc-action">
//           <MessageCircle size={16} strokeWidth={1.8} />
//           <span>{fmtCount(commentCount)}</span>
//         </button>

//         <button
//           className={`npc-action ${retweeted ? "npc-action--retweeted" : ""}`}
//           onClick={handleRetweet}
//         >
//           <Repeat2 size={16} strokeWidth={1.8} />
//           <span>{fmtCount(retweetCount)}</span>
//         </button>

//         <button className="npc-action npc-action--share">
//           <Share2 size={16} strokeWidth={1.8} />
//           <span>Share</span>
//         </button>
//       </div>
//     </article>
//   );
// }

// // ─── Main Widget ───────────────────────────────────────────────────────────────
// export default function NewsFeedWidget() {
//   const [articles, setArticles] = useState<NewsArticle[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchLatest = async () => {
//       try {
//         const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
//         // Fetch today's + last-2-days articles, take first 3 latest
//         const ARCHIVE_DATES = ["2026-05-21", "2026-05-20", "2026-05-19"];
//         const dateQuery = ARCHIVE_DATES.join(",");
//         const res = await fetch(`${baseUrl}/api/news-center?date=${dateQuery}`);
//         const data = await res.json();
//         const raw: NewsArticle[] = (data?.articles || []).map(
//           (a: NewsArticle & { createdAt?: number | string }) => ({
//             ...a,
//             createdAt:
//               typeof a.createdAt === "number"
//                 ? a.createdAt
//                 : a.createdAt
//                 ? Date.parse(String(a.createdAt))
//                 : Date.now(),
//           })
//         );
//         // Sort latest first, show top 3
//         raw.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
//         setArticles(raw.slice(0, 3));
//       } catch (e) {
//         console.error("NewsFeedWidget fetch error:", e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLatest();
//   }, []);

//   return (
//     <>
//       {/* ── Scoped styles ── */}
//       <style>{`
//         .nfw-root {
//           font-family: 'Sora', 'DM Sans', system-ui, sans-serif;
//           width: 100%;
//         }

//         /* Section header */
//         .nfw-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 12px;
//           padding: 0 2px;
//         }
//         .nfw-header-left {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }
//         .nfw-pill {
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           background: #f43f5e;
//           box-shadow: 0 0 8px #f43f5e99;
//           animation: nfw-pulse 1.8s ease-in-out infinite;
//         }
//         @keyframes nfw-pulse {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50%       { opacity: 0.5; transform: scale(1.4); }
//         }
//         .nfw-title {
//           font-size: 13px;
//           font-weight: 700;
//           color: #fff;
//           letter-spacing: 0.06em;
//           text-transform: uppercase;
//         }
//         .nfw-view-all {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           font-size: 12px;
//           font-weight: 600;
//           color: #f43f5e;
//           text-decoration: none;
//           padding: 4px 10px;
//           border: 1px solid rgba(244,63,94,0.35);
//           border-radius: 20px;
//           transition: background 0.2s, border-color 0.2s;
//         }
//         .nfw-view-all:hover {
//           background: rgba(244,63,94,0.08);
//           border-color: #f43f5e;
//         }

//         /* Divider */
//         .nfw-divider {
//           height: 1px;
//           background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
//           margin-bottom: 12px;
//         }

//         /* Card list */
//         .nfw-list {
//           display: flex;
//           flex-direction: column;
//           gap: 0;
//         }

//         /* Individual news post card */
//         .news-post-card {
//           padding: 14px 0;
//           border-bottom: 1px solid rgba(255,255,255,0.06);
//           transition: background 0.15s;
//           border-radius: 4px;
//         }
//         .news-post-card:last-child {
//           border-bottom: none;
//         }
//         .news-post-card:hover {
//           background: rgba(255,255,255,0.02);
//         }

//         /* Card header */
//         .npc-header {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 10px;
//           padding: 0 2px;
//         }
//         .npc-avatar {
//           width: 34px;
//           height: 34px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #f43f5e, #fb923c);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//           font-weight: 800;
//           font-size: 14px;
//           color: #fff;
//         }
//         .npc-meta {
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           flex: 1;
//           flex-wrap: wrap;
//           min-width: 0;
//         }
//         .npc-handle-name {
//           font-size: 13px;
//           font-weight: 700;
//           color: #fff;
//         }
//         .npc-verified {
//           color: #f43f5e;
//           flex-shrink: 0;
//         }
//         .npc-handle {
//           font-size: 12px;
//           color: #6b7280;
//         }
//         .npc-dot {
//           color: #374151;
//           font-size: 12px;
//         }
//         .npc-time {
//           font-size: 12px;
//           color: #6b7280;
//         }
//         .npc-more {
//           background: none;
//           border: none;
//           color: #6b7280;
//           cursor: pointer;
//           padding: 4px;
//           border-radius: 6px;
//           transition: color 0.15s, background 0.15s;
//           flex-shrink: 0;
//         }
//         .npc-more:hover {
//           color: #d1d5db;
//           background: rgba(255,255,255,0.05);
//         }

//         /* Card body */
//         .npc-body {
//           display: flex;
//           gap: 12px;
//           margin-bottom: 12px;
//           align-items: flex-start;
//         }
//         .npc-thumb {
//           position: relative;
//           width: 110px;
//           height: 80px;
//           flex-shrink: 0;
//           border-radius: 10px;
//           overflow: hidden;
//           background: #1f2937;
//         }
//         .npc-thumb-img {
//           object-fit: cover;
//           transition: transform 0.3s ease;
//         }
//         .news-post-card:hover .npc-thumb-img {
//           transform: scale(1.04);
//         }
//         .npc-content {
//           flex: 1;
//           min-width: 0;
//         }
//         .npc-tag {
//           display: inline-block;
//           font-size: 9px;
//           font-weight: 800;
//           letter-spacing: 0.1em;
//           text-transform: uppercase;
//           color: #f43f5e;
//           border: 1px solid rgba(244,63,94,0.5);
//           border-radius: 4px;
//           padding: 2px 6px;
//           margin-bottom: 5px;
//         }
//         .npc-title {
//           font-size: 13px;
//           font-weight: 700;
//           color: #f9fafb;
//           line-height: 1.4;
//           margin: 0 0 4px;
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//         .npc-summary {
//           font-size: 11.5px;
//           color: #9ca3af;
//           line-height: 1.5;
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//           margin: 0 0 6px;
//         }
//         .npc-read-more {
//           display: inline-flex;
//           align-items: center;
//           gap: 3px;
//           font-size: 12px;
//           font-weight: 600;
//           color: #f43f5e;
//           text-decoration: none;
//           transition: gap 0.15s;
//         }
//         .npc-read-more:hover {
//           gap: 6px;
//         }

//         /* Actions row */
//         .npc-actions {
//           display: flex;
//           align-items: center;
//           gap: 0;
//           justify-content: space-between;
//           padding: 0 2px;
//         }
//         .npc-action {
//           display: flex;
//           align-items: center;
//           gap: 5px;
//           font-size: 12.5px;
//           color: #6b7280;
//           background: none;
//           border: none;
//           cursor: pointer;
//           padding: 5px 8px;
//           border-radius: 20px;
//           transition: color 0.15s, background 0.15s;
//         }
//         .npc-action:hover {
//           color: #d1d5db;
//           background: rgba(255,255,255,0.05);
//         }
//         .npc-action--liked {
//           color: #f43f5e !important;
//         }
//         .npc-action--liked:hover {
//           background: rgba(244,63,94,0.1);
//         }
//         .npc-action--retweeted {
//           color: #34d399 !important;
//         }
//         .npc-action--retweeted:hover {
//           background: rgba(52,211,153,0.08);
//         }
//         .npc-action--share:hover {
//           color: #60a5fa;
//           background: rgba(96,165,250,0.08);
//         }

//         /* Skeleton loading */
//         .nfw-skeleton {
//           display: flex;
//           flex-direction: column;
//           gap: 0;
//         }
//         .nfw-skel-card {
//           padding: 14px 0;
//           border-bottom: 1px solid rgba(255,255,255,0.06);
//         }
//         .nfw-skel-header {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 10px;
//         }
//         .skel {
//           background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
//           background-size: 200% 100%;
//           animation: nfw-shimmer 1.4s ease-in-out infinite;
//           border-radius: 6px;
//         }
//         @keyframes nfw-shimmer {
//           0%   { background-position: 200% 0; }
//           100% { background-position: -200% 0; }
//         }
//         .nfw-skel-body {
//           display: flex;
//           gap: 12px;
//         }
//         .nfw-skel-thumb {
//           width: 110px;
//           height: 80px;
//           border-radius: 10px;
//           flex-shrink: 0;
//         }
//         .nfw-skel-lines {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//           padding-top: 4px;
//         }
//       `}</style>

//       <div className="nfw-root">
//         {/* Section header */}
//         <div className="nfw-header">
//           <div className="nfw-header-left">
//             <span className="nfw-pill" />
//             <span className="nfw-title">Latest News</span>
//           </div>
//           <Link href="/MainModules/news-center" className="nfw-view-all">
//             View All <ArrowRight size={12} />
//           </Link>
//         </div>

//         <div className="nfw-divider" />

//         {/* Content */}
//         {loading ? (
//           <div className="nfw-skeleton">
//             {[0, 1, 2].map((i) => (
//               <div className="nfw-skel-card" key={i}>
//                 <div className="nfw-skel-header">
//                   <div className="skel" style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0 }} />
//                   <div className="skel" style={{ width: 140, height: 12 }} />
//                 </div>
//                 <div className="nfw-skel-body">
//                   <div className="skel nfw-skel-thumb" />
//                   <div className="nfw-skel-lines">
//                     <div className="skel" style={{ width: "40%", height: 10 }} />
//                     <div className="skel" style={{ width: "90%", height: 13 }} />
//                     <div className="skel" style={{ width: "80%", height: 13 }} />
//                     <div className="skel" style={{ width: "55%", height: 11 }} />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : articles.length === 0 ? (
//           <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", padding: "24px 0" }}>
//             No news available right now.
//           </p>
//         ) : (
//           <div className="nfw-list">
//             {articles.map((article) => (
//               <NewsPostCard key={article.rank} article={article} />
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }






"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  BadgeCheck,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type NewsArticle = {
  rank: number;
  title: string;
  summary: string;
  source: string;
  url: string;
  tag: string;
  cdn_url: string;
  likes: number;
  createdAt?: number;
  id?: string;
};

type CricketArticle = {
  id?: string | number;
  title?: string;
  description?: string[];
  summary?: string;
  badge?: string;
  image?: string;
  cdn_url?: string;
  createdAt?: number | string;
};

// ─── Constants for localStorage ───────────────────────────────────────────────
const NEWS_LIKES_KEY = 'sportsfan_news_likes_widget';
const NEWS_USER_LIKES_KEY = 'sportsfan_news_user_likes_widget';
const CRICKET_USER_LIKES_KEY = 'cricket_user_likes';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const stripHtml = (html: string) => html?.replace(/<[^>]*>/g, "").trim() ?? "";

const timeAgo = (ts?: number): string => {
  if (!ts) return "just now";
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const fmtCount = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

// ─── Single News Post Card (with dynamic likes) ───────────────────────────────
function NewsPostCard({
  article,
  liked,
  likeCount,
  onLike
}: {
  article: NewsArticle;
  liked: boolean;
  likeCount: number;
  onLike: () => void;
}) {
  const [retweeted, setRetweeted] = useState(false);
  const [retweetCount, setRetweetCount] = useState(
    Math.floor(Math.random() * 30) + 5
  );
  const commentCount = Math.floor(Math.random() * 50) + 10;

  const handleRetweet = () => {
    setRetweeted((p) => !p);
    setRetweetCount((p) => (retweeted ? p - 1 : p + 1));
  };

  const isInternal =
    article.source === "SportsFan360" ||
    article.url?.includes("/MainModules/");

  // Determine image source
  const isSportsArticle = article.source === "SportsFan360";
  const imageSrc = isSportsArticle && article.cdn_url
    ? article.cdn_url
    : article.cdn_url || "/images/News_center_Default.png";

  return (
    <article className="py-3.5 border-b border-white/[0.06] last:border-b-0 rounded hover:bg-white/[0.02] transition-colors duration-150">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-2.5 px-0.5">
        <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center shrink-0 font-extrabold text-sm text-white">
          S
        </div>
        <div className="flex items-center gap-1 flex-1 flex-wrap min-w-0">
          <span className="text-[13px] font-bold text-white">SportsFan360</span>
          <BadgeCheck size={14} className="text-rose-500 shrink-0" />
          <span className="text-[12px] text-gray-500">@sportsfan360</span>
          <span className="text-gray-700 text-[12px]">·</span>
          <span className="text-[12px] text-gray-500">{timeAgo(article.createdAt)}</span>
        </div>
        <button className="bg-transparent border-none text-gray-500 cursor-pointer p-1 rounded-md hover:text-gray-300 hover:bg-white/5 transition-colors duration-150 shrink-0">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex gap-3 mb-3 items-start">
        {/* Thumbnail */}
        <div className="relative w-[150px] lg:w-[500px] h-40 lg:h-60 shrink-0 rounded-[10px] overflow-hidden bg-gray-800 group">
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/News_center_Default.png";
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[9px] font-extrabold tracking-widest uppercase text-rose-500 border border-rose-500/50 rounded px-1.5 py-0.5 mb-1.5">
            {article.tag || "ARTICLE"}
          </span>
          <h3 className="text-[13px] font-bold text-gray-50 leading-snug m-0 mb-1 line-clamp-2">
            {article.title}
          </h3>
          <p className="text-[11.5px] text-gray-400 leading-relaxed line-clamp-2 m-0 mb-1.5">
            {stripHtml(article.summary)}
          </p>
          {isInternal ? (
            <Link
              href={article.url}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-500 no-underline hover:gap-1.5 transition-all duration-150"
            >
              Read More <ArrowRight size={13} />
            </Link>
          ) : (
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-500 no-underline hover:gap-1.5 transition-all duration-150"
            >
              Read More <ArrowRight size={13} />
            </a>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between px-0.5">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 text-[12.5px] bg-transparent border-none cursor-pointer px-2 py-1.5 rounded-full transition-colors duration-150 ${liked
              ? "text-rose-500 hover:bg-rose-500/10"
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
        >
          <Heart
            size={16}
            fill={liked ? "currentColor" : "none"}
            strokeWidth={liked ? 0 : 1.8}
          />
          <span>{fmtCount(likeCount)}</span>
        </button>

        <button className="flex items-center gap-1.5 text-[12.5px] text-gray-500 bg-transparent border-none cursor-pointer px-2 py-1.5 rounded-full hover:text-gray-300 hover:bg-white/5 transition-colors duration-150">
          <MessageCircle size={16} strokeWidth={1.8} />
          <span>{fmtCount(commentCount)}</span>
        </button>

        <button
          onClick={handleRetweet}
          className={`flex items-center gap-1.5 text-[12.5px] bg-transparent border-none cursor-pointer px-2 py-1.5 rounded-full transition-colors duration-150 ${retweeted
              ? "text-emerald-400 hover:bg-emerald-400/8"
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
        >
          <Repeat2 size={16} strokeWidth={1.8} />
          <span>{fmtCount(retweetCount)}</span>
        </button>

        <button className="flex items-center gap-1.5 text-[12.5px] text-gray-500 bg-transparent border-none cursor-pointer px-2 py-1.5 rounded-full hover:text-blue-400 hover:bg-blue-400/8 transition-colors duration-150">
          <Share2 size={16} strokeWidth={1.8} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="py-3.5 border-b border-white/[0.06]">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-pulse" />
        <div className="h-3 w-36 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="w-[110px] h-20 shrink-0 rounded-[10px] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-pulse" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="h-2.5 w-2/5 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-pulse" />
          <div className="h-3 w-11/12 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-pulse" />
          <div className="h-2.5 w-3/5 rounded bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Widget ───────────────────────────────────────────────────────────────
export default function NewsFeedWidget() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());

  // Load saved likes from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLikeCounts = window.localStorage.getItem(NEWS_LIKES_KEY);
    if (savedLikeCounts) {
      try {
        setLikeCounts(JSON.parse(savedLikeCounts));
      } catch (e) {
        console.error("Error parsing saved likes:", e);
      }
    }

    const savedUserLikes = window.localStorage.getItem(NEWS_USER_LIKES_KEY);
    if (savedUserLikes) {
      try {
        setUserLikes(new Set(JSON.parse(savedUserLikes)));
      } catch (e) {
        console.error("Error parsing user likes:", e);
      }
    }
  }, []);

  // Fetch articles
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const ARCHIVE_DATES = ["2026-05-21", "2026-05-20", "2026-05-19"];
        const dateQuery = ARCHIVE_DATES.join(",");
        const res = await fetch(`${baseUrl}/api/news-center?date=${dateQuery}`);
        const data = await res.json();

        // Fetch cricket articles
        let cricketArticles: CricketArticle[] = [];
        try {
          const cricketRes = await fetch('/api/cricket-articles');
          if (cricketRes.ok) {
            const cricketData = await cricketRes.json();
            cricketArticles = (cricketData?.articles || cricketData?.data || []) as CricketArticle[];
          }
        } catch (error) {
          console.warn('Cricket articles fetch failed', error);
        }

        // Transform cricket articles
        const transformedCricket: NewsArticle[] = cricketArticles.map((article: CricketArticle) => ({
          rank: 0,
          title: article.title || '',
          summary: article.description?.[0] || article.summary || '',
          source: 'SportsFan360',
          url: `/MainModules/CricketArticles/${article.id}`,
          tag: article.badge || 'Cricket',
          cdn_url: article.image || article.cdn_url || '',
          likes: 0,
          createdAt: typeof article.createdAt === 'number'
            ? article.createdAt
            : article.createdAt
              ? Date.parse(String(article.createdAt))
              : Date.now(),
          id: String(article.id)
        }));

        // Merge and sort articles
        const raw: NewsArticle[] = [...(data?.articles || []), ...transformedCricket].map(
          (a: NewsArticle & { createdAt?: number | string }) => ({
            ...a,
            createdAt: typeof a.createdAt === "number"
              ? a.createdAt
              : a.createdAt
                ? Date.parse(String(a.createdAt))
                : Date.now(),
          })
        );

        raw.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // Add ranks
        const rankedArticles = raw.slice(0, 3).map((article, index) => ({
          ...article,
          rank: index + 1,
        }));

        setArticles(rankedArticles);
      } catch (e) {
        console.error("NewsFeedWidget fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  // Toggle like handler
  const toggleLike = (article: NewsArticle) => {
    const articleRank = article.rank;
    const currentCount = likeCounts[articleRank] ?? article.likes ?? 0;
    const isLiked = userLikes.has(articleRank);

    let newCount = currentCount;
    const newUserLikes = new Set(userLikes);

    if (isLiked) {
      newUserLikes.delete(articleRank);
      newCount = Math.max(0, currentCount - 1);
    } else {
      newUserLikes.add(articleRank);
      newCount = currentCount + 1;
    }

    setUserLikes(newUserLikes);
    setLikeCounts({ ...likeCounts, [articleRank]: newCount });

    // Save to localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(NEWS_USER_LIKES_KEY, JSON.stringify(Array.from(newUserLikes)));
      window.localStorage.setItem(NEWS_LIKES_KEY, JSON.stringify({ ...likeCounts, [articleRank]: newCount }));

      // Sync cricket article likes if this is a cricket article
      if (article.id && article.url.includes('/MainModules/CricketArticles/')) {
        const cricketLikeKey = `cricket_article_likes_${article.id}`;
        window.localStorage.setItem(cricketLikeKey, String(newCount));

        // Track that this user liked this cricket article
        const cricketUserLikesData = window.localStorage.getItem(CRICKET_USER_LIKES_KEY);
        let cricketUserLikes: Record<string, boolean> = {};
        if (cricketUserLikesData) {
          try {
            cricketUserLikes = JSON.parse(cricketUserLikesData);
          } catch {
            cricketUserLikes = {};
          }
        }

        if (!isLiked) {
          cricketUserLikes[article.id] = true;
        } else {
          delete cricketUserLikes[article.id];
        }

        window.localStorage.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(cricketUserLikes));
      }
    }
  };

  return (
    <div className="font-sans w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
          <span className="text-[13px] font-bold text-white tracking-widest uppercase">
            Latest News
          </span>
        </div>
        <Link
          href="/MainModules/news-center"
          className="flex items-center gap-1 text-[12px] font-semibold text-rose-500 no-underline px-2.5 py-1 border border-rose-500/35 rounded-full hover:bg-rose-500/8 hover:border-rose-500 transition-colors duration-200"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/7 to-transparent mb-3" />

      {/* Content */}
      {loading ? (
        <div className="flex flex-col">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-[13px] text-gray-500 text-center py-6">
          No news available right now.
        </p>
      ) : (
        <div className="flex flex-col">
          {articles.map((article) => (
            <NewsPostCard
              key={article.rank}
              article={article}
              liked={userLikes.has(article.rank)}
              likeCount={likeCounts[article.rank] ?? article.likes ?? 0}
              onLike={() => toggleLike(article)}
            />
          ))}
        </div>
      )}
    </div>
  );
}