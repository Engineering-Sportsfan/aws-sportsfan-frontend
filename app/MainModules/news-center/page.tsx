"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Bell, Heart, Share2, ArrowRight, Calendar, CheckCircle2, ExternalLink } from 'lucide-react';
// FIX: Using relative path from app/news-center/page.tsx to types/news.ts
import { NewsArticle } from '../../../types/news';
import { useAuth } from '@/context/AuthContext';

// Type for the external cricket API response (narrowed to avoid `any`)
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

type NewsApiArticle = NewsArticle & {
  createdAt?: number | string;
};

const NEWS_EXTERNAL_BYPASS_KEY = 'sportsfan_news_external_bypass';
const CRICKET_USER_LIKES_KEY = 'cricket_user_likes'; // Track which users liked which cricket articles

const readStoredCount = (key: string) => {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(key);
  if (!raw) return 0;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
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

// Strip HTML tags from text
const stripHtmlTags = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

// Format timestamp to readable date
const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'May 11, 2026';
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Copy to clipboard utility
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

// Build share URL for article
const buildNewsShareUrl = (article: NewsArticle) => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/MainModules/news-center?rank=${encodeURIComponent(article.rank)}`;
};

// Build share text for article
const buildNewsShareText = (article: NewsArticle) => {
  const shareUrl = buildNewsShareUrl(article);
  return [
    stripHtmlTags(article.summary) || 'Latest news from Sportsfan',
    shareUrl,
  ].filter(Boolean).join('\n');
};
const ARCHIVE_DATES = ['2026-06-09','2026-06-05','2026-06-04'];
export default function DetailedNewsCenter() {
  const { user, getUserName } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sortOption, setSortOption] = useState<'latest' | 'oldest' | 'most-liked'>('latest');
  const [showExternalPrompt, setShowExternalPrompt] = useState(false);
  const [bypassExternalPrompt, setBypassExternalPrompt] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);
  const [pendingExternal, setPendingExternal] = useState<{ url: string; source: string } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({
    All: true,
    Narrative: false,
    Record: false,
    Elimination: false,
  });
  const [sharedArticle, setSharedArticle] = useState<NewsArticle | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  // Change this line:
  const [selectedArchiveDate, setSelectedArchiveDate] = useState('last-3-days');

  const getLikeActorId = () => user?.userId || `guest:${getUserName ? getUserName() : 'user'}`;

  const openShareDialog = (article: NewsArticle) => {
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(NEWS_EXTERNAL_BYPASS_KEY);
    if (saved === 'true') {
      setBypassExternalPrompt(true);
      setRememberChoice(true);
    }
  }, []);

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

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const dateQuery = selectedArchiveDate === 'last-3-days' 
          ? ARCHIVE_DATES.slice(0, 3).join(',') 
          : selectedArchiveDate;

        const newsRes = await fetch(
          `${baseUrl}/api/news-center?date=${dateQuery}`
        );
        const newsData = await newsRes.json();
        const newsArticles = (newsData?.articles || []).map((article: NewsApiArticle & { author?: string; tags?: any }) => ({
          ...article,
          author: article.author || (article.source && article.source !== 'SportsFan360' ? article.source : '') || '',
          tags: extractTags(article.tags),
          createdAt: typeof article.createdAt === 'number' ? article.createdAt : (article.createdAt ? Date.parse(String(article.createdAt)) : undefined)
        })) as NewsArticle[];

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
          if (typeof art.createdAt === 'number') {
            return art.createdAt < 10000000000 ? art.createdAt * 1000 : art.createdAt;
          }
          if (typeof art.timeMs === 'number') return art.timeMs;
          if (typeof art.timestamp === 'number') {
            return art.timestamp < 10000000000 ? art.timestamp * 1000 : art.timestamp;
          }
          if (art.createdAt && typeof art.createdAt.toMillis === 'function') {
            return art.createdAt.toMillis();
          }
          if (art.createdAt && typeof art.createdAt.seconds === 'number') {
            return art.createdAt.seconds * 1000;
          }
          if (art.createdAt && typeof art.createdAt._seconds === 'number') {
            return art.createdAt._seconds * 1000;
          }
          if (typeof art.createdAt === 'string' && art.createdAt.trim()) {
            const parsed = Date.parse(art.createdAt);
            if (!isNaN(parsed) && parsed > 0) return parsed;
          }
          if (typeof art.updatedAt === 'number') {
            return art.updatedAt < 10000000000 ? art.updatedAt * 1000 : art.updatedAt;
          }
          if (typeof art.updatedAt === 'string' && art.updatedAt.trim()) {
            const parsed = Date.parse(art.updatedAt);
            if (!isNaN(parsed) && parsed > 0) return parsed;
          }
          return Date.now();
        };

        let cricketArticles: CricketApiArticle[] = [];
        try {
          const cricketRes = await fetch(`/api/cricket-articles?t=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (cricketRes.ok) {
            const cricketData = await cricketRes.json();
            cricketArticles = cricketData?.articles || cricketData?.data || (Array.isArray(cricketData) ? cricketData : []);
          }
        } catch (error) {
          console.warn("Cricket articles fetch failed", error);
        }

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

        const transformedCricket: NewsArticle[] = (Array.isArray(cricketArticles) ? cricketArticles : [])
          .map((article: CricketApiArticle) => {
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
              likes: resolvedCount,
              id: articleId,
            };
          });

        const mergedArticles = [...newsArticles, ...transformedCricket];
        mergedArticles.sort((a: NewsArticle, b: NewsArticle) => {
          const dateA = (a.createdAt || 0) as number;
          const dateB = (b.createdAt || 0) as number;
          return dateB - dateA;
        });

        const rankedArticles = mergedArticles.map((article, index) => ({
          ...article,
          rank: index + 1
        }));

        setArticles(rankedArticles);
        setLikeCounts((prev) => ({ ...initialLikes, ...prev }));
        setUserLikes((prev) => new Set([...Array.from(initialUserLikes), ...Array.from(prev)]));
      } catch (error) {
        console.error("Error loading news", error);
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
  }, [selectedArchiveDate, user?.userId]);

  const displayedArticles = React.useMemo(() => {
    const cats = Object.entries(selectedCategories)
      .filter(([k, v]) => k !== 'All' && v)
      .map(([k]) => k);

    let filtered = articles.filter((a) => {
      if (cats.length === 0) return true;
      return cats.includes(a.tag);
    });

    return [...filtered].sort((a, b) => {
      if (sortOption === 'latest') {
        return ((b.createdAt || 0) as number) - ((a.createdAt || 0) as number);
      }
      if (sortOption === 'oldest') {
        return ((a.createdAt || 0) as number) - ((b.createdAt || 0) as number);
      }
      if (sortOption === 'most-liked') {
        const keyA = a.id || String(a.rank);
        const keyB = b.id || String(b.rank);
        const likesA = (likeCounts[keyA] !== undefined ? likeCounts[keyA] : a.likes) || 0;
        const likesB = (likeCounts[keyB] !== undefined ? likeCounts[keyB] : b.likes) || 0;
        return likesB - likesA;
      }
      return 0;
    });
  }, [articles, selectedCategories, sortOption, likeCounts]);

  const handleExternalReadClick = (event: React.MouseEvent<HTMLAnchorElement>, article: NewsArticle) => {
    if (!article.url) return;

    if (bypassExternalPrompt) {
      return;
    }

    event.preventDefault();
    setPendingExternal({
      url: article.url,
      source: article.source || 'External Source',
    });
    setShowExternalPrompt(true);
  };

  const openExternalArticle = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmExternalOpen = () => {
    if (!pendingExternal) return;

    if (rememberChoice && typeof window !== 'undefined') {
      window.localStorage.setItem(NEWS_EXTERNAL_BYPASS_KEY, 'true');
      setBypassExternalPrompt(true);
    }

    openExternalArticle(pendingExternal.url);
    setShowExternalPrompt(false);
    setPendingExternal(null);
  };

  const handleCancelExternalOpen = () => {
    setShowExternalPrompt(false);
    setPendingExternal(null);
  };

  const toggleLike = async (article: NewsArticle, currentLikes: number = 0) => {
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
        console.warn('LocalStorage like sync error:', e);
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
        console.error('Failed to sync like with backend:', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 py-4 w-full text-white font-sans">
      <Link href="/MainModules/ROAR" className="flex items-center gap-2 text-pink-500 hover:text-pink-400 w-fit self-start">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">News Center</h1>
          <p className="text-gray-400">Your one-stop destination for top stories, match previews & records from around the cricket world.</p>
          <p className="text-sm mt-2 text-gray-500">By <span className="text-pink-500">SportsFan360</span></p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => openShareDialog({ rank: 0, title: 'News Center', summary: 'Your one-stop destination for top stories, match previews & records from around the cricket world.', source: 'SportsFan360', url: '/MainModules/news-center', tag: 'News', cdn_url: '', likes: 0 })} className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg text-sm hover:bg-gray-800">
            <Share2 size={16} /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg text-sm font-semibold">
            Follow News Center <Bell size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-4">
          {displayedArticles.map((article, index) => {
            const articleKey = article.id || String(article.rank);
            const isLiked = userLikes.has(articleKey);
            const currentLikes = (likeCounts[articleKey] !== undefined) ? likeCounts[articleKey] : (article.likes || 0);

            return (
              <div key={index} className="bg-[#111] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                 <div className="md:w-[120px] md:h-[100px] shrink-0 relative">
                   <img
                     src={article.cdn_url || '/images/News_center_Default.png'}
                     alt={article.title}
                     className="w-full h-full object-cover rounded-lg"
                     onError={(e) => {
                       (e.currentTarget as HTMLImageElement).src = '/images/News_center_Default.png';
                     }}
                   />
                 </div>

                 <div className="flex-1 flex flex-col justify-between">
                   <div>
                     <div className="flex items-center gap-2 mb-2">
                       <span className="px-2 py-0.5 text-xs font-semibold text-orange-500 border border-orange-500 rounded uppercase">
                         {article.tag}
                       </span>
                     </div>
                     <h2 className="text-xl font-bold mb-2 hover:text-pink-500 transition-colors cursor-pointer">
                       {article.title}
                     </h2>
                     <p className="text-sm text-gray-400 mb-3">
                       {stripHtmlTags(article.summary)}
                     </p>
                   </div>

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
                        {article.tags.length > 4 && (
                          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
                            +{article.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                   <p className="text-xs text-gray-500 mb-4">
                     {article.author ? `${article.author} · ` : (article.source && article.source !== 'SportsFan360' ? `${article.source} · ` : '')}
                     {formatDate(article.createdAt)}
                   </p>

                   <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                    <div className="flex gap-6">
                      <button onClick={() => toggleLike(article, currentLikes)} className={`flex items-center gap-1 text-sm transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}>
                        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /> {currentLikes}
                      </button>
                      <button onClick={() => openShareDialog(article)} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                    {article.url?.startsWith('/MainModules/') || article.url?.includes('/CricketArticles/') ? (
                      <Link href={article.url} className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-sm font-semibold">
                        Read More <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => handleExternalReadClick(event, article)}
                        className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-sm font-semibold"
                      >
                        Read More <ArrowRight size={16} />
                      </a>
                    )}
                  </div>    
                 </div>
              </div>
            );
          })}
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
             <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
               <Calendar size={16} /> Archive (Date Wise)
             </h3>
            <ul className="space-y-3">
               {/* 👇 ADD THIS NEW LIST ITEM 👇 */}
               <li 
                 onClick={() => setSelectedArchiveDate('last-3-days')}
                 className={`flex justify-between text-sm items-center p-2 rounded cursor-pointer transition-colors ${
                   selectedArchiveDate === 'last-3-days' ? 'bg-pink-500/10 text-pink-500' : 'text-gray-400 hover:bg-gray-800'
                 }`}
               >
                 <span className="flex items-center gap-2 font-semibold">Top Stories (Last 3 Days)</span>
                 {selectedArchiveDate === 'last-3-days' && <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Active</span>}
               </li>

               {/* YOUR EXISTING MAP FUNCTION BELOW */}
               {ARCHIVE_DATES.map((dateString) => {
                 const isSelected = selectedArchiveDate === dateString;
                 const displayDate = new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                 
                 return (
                   <li 
                     key={dateString}
                     onClick={() => setSelectedArchiveDate(dateString)}
                     className={`flex justify-between text-sm items-center p-2 rounded cursor-pointer transition-colors ${
                       isSelected ? 'bg-pink-500/10 text-pink-500' : 'text-gray-400 hover:bg-gray-800'
                     }`}
                   >
                     <span className="flex items-center gap-2"><Calendar size={14}/> {displayDate}</span>
                     {isSelected && <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Active</span>}
                   </li>
                 );
               })}
             </ul>
             <button className="w-full mt-4 py-2 border border-gray-700 text-sm text-gray-400 rounded-lg hover:bg-gray-800">
               View Older Archives ↓
             </button>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Sort By</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  className="accent-pink-500 w-4 h-4"
                  checked={sortOption === 'latest'}
                  onChange={() => setSortOption('latest')}
                /> Latest First
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-500 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  className="accent-pink-500 w-4 h-4"
                  checked={sortOption === 'oldest'}
                  onChange={() => setSortOption('oldest')}
                /> Oldest First
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-500 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  className="accent-pink-500 w-4 h-4"
                  checked={sortOption === 'most-liked'}
                  onChange={() => setSortOption('most-liked')}
                /> Most Liked
              </label>
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Filter By Category</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-pink-500 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-pink-500 w-4 h-4 rounded"
                  checked={selectedCategories.All}
                  onChange={(e) => setSelectedCategories((s) => ({ ...s, All: e.target.checked, Narrative: e.target.checked ? s.Narrative : s.Narrative, Record: e.target.checked ? s.Record : s.Record, Elimination: e.target.checked ? s.Elimination : s.Elimination }))}
                />
                <span className="flex items-center gap-2"><CheckCircle2 size={16}/> All Categories</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-pink-500 w-4 h-4 rounded"
                  checked={selectedCategories.Narrative}
                  onChange={(e) => setSelectedCategories((s) => ({ ...s, Narrative: e.target.checked, All: false }))}
                /> Narrative
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-pink-500 w-4 h-4 rounded"
                  checked={selectedCategories.Record}
                  onChange={(e) => setSelectedCategories((s) => ({ ...s, Record: e.target.checked, All: false }))}
                /> Record
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-pink-500 w-4 h-4 rounded"
                  checked={selectedCategories.Elimination}
                  onChange={(e) => setSelectedCategories((s) => ({ ...s, Elimination: e.target.checked, All: false }))}
                /> Elimination
              </label>
            </div>
            <button className="w-full mt-6 py-2 border border-pink-500/50 text-pink-500 text-sm rounded-lg hover:bg-pink-500/10 transition-colors">
               ←→ Reset Filters
            </button>
          </div>
        </div>
      </div>

      {showExternalPrompt && pendingExternal ? (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-orange-500/80 bg-[#0a0a12] shadow-[0_0_40px_rgba(255,84,0,0.2)] p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full border border-pink-500/50 bg-pink-500/10 flex items-center justify-center text-pink-500">
                <ExternalLink size={26} />
              </div>
            </div>

            <h3 className="text-center text-2xl font-bold">
              Leaving <span className="text-pink-500">SportsFan360</span>
            </h3>
            <p className="text-center text-sm text-gray-300 mt-2 mb-5">
              You&apos;re about to open an external news source.
            </p>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4">
              <p className="text-xs text-gray-400">This article is published by</p>
              <p className="text-lg font-semibold text-white mt-1">{pendingExternal.source}</p>
              <p className="text-xs text-gray-400 mt-2">
                You will leave the SportsFan360 experience and continue on a third-party website.
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-300 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberChoice}
                onChange={(event) => setRememberChoice(event.target.checked)}
                className="h-4 w-4 rounded accent-pink-500"
              />
              Remember this choice for future news articles
            </label>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={handleCancelExternalOpen}
                className="h-11 rounded-xl border border-gray-600 text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExternalOpen}
                className="h-11 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors"
              >
                Continue Reading
              </button>
            </div>

            <p className="text-center text-[11px] text-gray-500">
              SportsFan360 is not responsible for third-party content, privacy policies or external websites.
            </p>
          </div>
        </div>
      ) : null}

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
