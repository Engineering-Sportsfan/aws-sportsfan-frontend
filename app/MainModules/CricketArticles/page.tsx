"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  ArrowRight,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Clock,
  User,
  X,
  Flame,
  Check,
} from "lucide-react";
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
  if (!timestamp) return "Recent";
  const date = new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function AllCricketArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authorQuery = searchParams.get("author") || "";

  const { user, getUserName } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  const [sharedArticle, setSharedArticle] = useState<Article | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const [badgeFilter, setBadgeFilter] = useState<string>("ALL");
  const [selectedAuthor, setSelectedAuthor] = useState<string>(authorQuery);
  const [viewMode, setViewMode] = useState<"compact" | "grid">("compact");

  useEffect(() => {
    setSelectedAuthor(authorQuery);
  }, [authorQuery]);

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
        } catch {}
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
        } catch {}
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
          } catch {}
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

            const storedCount =
              typeof window !== "undefined"
                ? Number.parseInt(window.localStorage.getItem(`cricket_article_likes_${articleId}`) || "0", 10) || 0
                : 0;
            const resolvedCount = Math.max(count, storedCount);

            const likedBy = Array.isArray(article.likedBy) ? article.likedBy : [];
            const isUserLiked =
              likedBy.includes(actorId) ||
              localUserLikes[articleId] === true ||
              (typeof window !== "undefined" &&
                window.localStorage?.getItem(`cricket_article_like_${articleId}_${actorId}`) === "1");

            initialLikes[articleId] = resolvedCount;
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
              author: article.author || (article as any).authorName || (article as any).creatorName || (article as any).userName || "",
              readTime: article.readTime || "3 min",
              tags: extractTags(article),
              createdAt: extractCreatedAt(article),
              likes: resolvedCount,
              likedBy: likedBy,
            };
          }
        );

        const deduped = Array.from(new Map(transformed.map((a) => [a.id, a])).values());
        deduped.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const ranked = deduped.map((a, i) => ({ ...a, rank: i + 1 }));

        setArticles(ranked);
        setLikeCounts((prev) => ({ ...initialLikes, ...prev }));
        setUserLikes((prev) => new Set([...Array.from(initialUserLikes), ...Array.from(prev)]));
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
      if (e.key.startsWith("cricket_article_likes_")) {
        const articleId = e.key.replace("cricket_article_likes_", "");
        const count = parseInt(e.newValue || "0", 10);
        if (!isNaN(count)) {
          setLikeCounts((prev) => ({ ...prev, [articleId]: count }));
        }
      } else if (e.key === CRICKET_USER_LIKES_KEY) {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          const likedIds = Object.keys(parsed).filter((id) => parsed[id] === true);
          setUserLikes(new Set(likedIds));
        } catch {}
      }
    };

    window.addEventListener("cricket-article-liked", handleLikeSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("cricket-article-liked", handleLikeSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleLike = async (article: Article, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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

    const actorId = getLikeActorId();

    if (typeof window !== "undefined") {
      try {
        const rawLocal = window.localStorage.getItem(CRICKET_USER_LIKES_KEY);
        let localUserLikes: Record<string, boolean> = rawLocal ? JSON.parse(rawLocal) : {};
        if (newIsLiked) {
          localUserLikes[articleId] = true;
          window.localStorage.setItem(`cricket_article_like_${articleId}_${actorId}`, "1");
        } else {
          delete localUserLikes[articleId];
          window.localStorage.removeItem(`cricket_article_like_${articleId}_${actorId}`);
        }
        window.localStorage.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(localUserLikes));
        window.localStorage.setItem(`cricket_article_likes_${articleId}`, String(newCount));
      } catch (err) {
        console.warn("LocalStorage like sync error:", err);
      }

      window.dispatchEvent(
        new CustomEvent("cricket-article-liked", {
          detail: { articleId, likeCount: newCount, isLiked: newIsLiked },
        })
      );
    }

    try {
      const res = await fetch(`/api/cricket-articles/${articleId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: actorId,
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
        if (typeof window !== "undefined") {
          window.localStorage.setItem(`cricket_article_likes_${articleId}`, String(serverLikeCount));
          window.dispatchEvent(
            new CustomEvent("cricket-article-liked", {
              detail: { articleId, likeCount: serverLikeCount, isLiked: newIsLiked },
            })
          );
        }
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

  const openShareDialog = (article: Article, e?: React.MouseEvent) => {
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

  const badges = useMemo(() => {
    return ["ALL", ...Array.from(new Set(articles.map((a) => (a.tag || "Cricket").toUpperCase())))];
  }, [articles]);

  const visibleArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesBadge = badgeFilter === "ALL" || (a.tag || "").toUpperCase() === badgeFilter;
      const matchesAuthor =
        !selectedAuthor ||
        (a.author && a.author.toLowerCase().trim() === selectedAuthor.toLowerCase().trim());
      if (!matchesBadge || !matchesAuthor) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        (a.author && a.author.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [articles, badgeFilter, selectedAuthor, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07090E] text-white pb-20 selection:bg-rose-500/30">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/MainModules/HomePage"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={15} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  FlipLONG Articles
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-400 border border-rose-500/30">
                  {visibleArticles.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher for tablet/desktop */}
            <div className="hidden sm:flex items-center bg-white/[0.05] p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setViewMode("compact")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "compact" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"
                }`}
                title="Compact Feed"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-white/15 text-white" : "text-white/40 hover:text-white"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 space-y-3">
        {/* Search & Filter Row */}
        <div className="flex flex-col gap-2.5">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cricket stories, authors, or tournaments..."
              className="w-full pl-9 pr-8 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.07] border border-white/10 focus:border-rose-500/50 rounded-xl text-xs font-medium text-white placeholder-white/40 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Badges Bar with Horizontal Scroll */}
          {badges.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
              {badges.map((b) => {
                const isActive = badgeFilter === b;
                return (
                  <button
                    key={b}
                    onClick={() => setBadgeFilter(b)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.09] border border-white/[0.06]"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Author Notice */}
        {selectedAuthor && (
          <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/25 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-white/60">By:</span>
              <span className="font-bold text-rose-300 truncate">{selectedAuthor}</span>
            </div>
            <button
              onClick={() => {
                setSelectedAuthor("");
                router.replace("/MainModules/CricketArticles");
              }}
              className="text-[11px] font-semibold text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 px-2 py-0.5 rounded-md transition-colors cursor-pointer shrink-0"
            >
              Clear ✕
            </button>
          </div>
        )}

        {/* Skeleton Loader */}
        {loading && (
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-[#111624] p-3 flex gap-3 animate-pulse"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-1/4" />
                  <div className="h-4 bg-white/10 rounded w-4/5" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
                <div className="w-20 h-20 rounded-lg bg-white/5 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && visibleArticles.length === 0 && (
          <div className="p-8 rounded-2xl border border-white/[0.06] bg-[#111624] text-center text-white/50 text-xs space-y-2">
            <p className="font-bold text-white text-sm">No articles found</p>
            <p>Try searching for a different keyword or resetting filters.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setBadgeFilter("ALL");
                setSelectedAuthor("");
              }}
              className="mt-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Article Feed: Mobile-Optimized High Density Feed */}
        {!loading && !error && visibleArticles.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
                : "space-y-2.5 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:space-y-0 sm:gap-3.5"
            }
          >
            {visibleArticles.map((article) => {
              const isLiked = userLikes.has(article.id);
              const count = likeCounts[article.id] ?? article.likes ?? 0;

              return (
                <Link
                  key={article.id}
                  href={article.url}
                  className="group block rounded-xl border border-white/[0.07] hover:border-white/20 bg-[#101422] hover:bg-[#13192c] p-2.5 sm:p-3 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex gap-2.5 sm:gap-3 items-stretch">
                    {/* Left: Content Block */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Meta Category Tag & Date */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/25">
                            {article.tag}
                          </span>
                          <span className="text-[10px] text-white/40">•</span>
                          <span className="text-[10.5px] text-white/40 font-medium">
                            {formatDate(article.createdAt)}
                          </span>
                        </div>

                        {/* Title: Clamped to 2 lines for uniform density */}
                        <h2 className="text-xs sm:text-[13px] font-bold text-white leading-snug line-clamp-2 group-hover:text-rose-300 transition-colors">
                          {article.title}
                        </h2>
                      </div>

                      {/* Bottom Sub-info: Author & Action Buttons */}
                      <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-white/[0.04] text-[10.5px] text-white/45">
                        <span className="truncate max-w-[110px] sm:max-w-[140px]">
                          {article.author || "SportsFan"}
                        </span>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Like Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleLike(article, e)}
                            className={`flex items-center gap-1 transition-colors cursor-pointer ${
                              isLiked ? "text-rose-400 font-semibold" : "text-white/40 hover:text-rose-400"
                            }`}
                            title="Like article"
                          >
                            <Heart
                              size={12}
                              className={isLiked ? "fill-current text-rose-500" : ""}
                            />
                            <span>{count > 0 ? count : ""}</span>
                          </button>

                          {/* Share Button */}
                          <button
                            type="button"
                            onClick={(e) => openShareDialog(article, e)}
                            className="text-white/40 hover:text-white transition-colors cursor-pointer"
                            title="Share article"
                          >
                            <Share2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Compact Image Thumbnail */}
                    <div className="w-[84px] h-[84px] sm:w-[92px] sm:h-[92px] rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0 relative">
                      <img
                        src={article.cdn_url || "/images/News_center_Default.png"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/images/News_center_Default.png";
                        }}
                      />
                      {article.readTime && (
                        <span className="absolute bottom-1 right-1 text-[8.5px] font-bold px-1 py-0.5 rounded bg-black/75 text-white/80 leading-none">
                          {article.readTime}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Dialog */}
      {showShareDialog && sharedArticle && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={closeShareDialog}
          />
          <div
            className="fixed bottom-20 sm:bottom-auto sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-1/2 z-50 w-[90%] max-w-[320px] rounded-2xl border border-white/15 bg-[#141926] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-xs font-bold uppercase tracking-wider">Share Article</p>
              <button onClick={closeShareDialog} className="text-white/40 hover:text-white cursor-pointer">
                <X size={15} />
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0c101a] p-2.5 mb-3">
              <p className="text-white text-xs font-bold line-clamp-2">{sharedArticle.title}</p>
              <p className="text-white/40 text-[10px] mt-1 line-clamp-1 break-all">
                {buildShareUrl(sharedArticle)}
              </p>
            </div>

            <div className="flex items-center justify-between gap-1 mb-2">
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
                  className="w-9 h-9 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                >
                  <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
                </button>
              ))}
            </div>

            {copied && (
              <p className="text-center text-[11px] text-emerald-400 font-semibold mt-2 flex items-center justify-center gap-1">
                <Check size={12} /> Copied to clipboard!
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AllCricketArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-[#07090E]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
        </div>
      }
    >
      <AllCricketArticlesContent />
    </Suspense>
  );
}
