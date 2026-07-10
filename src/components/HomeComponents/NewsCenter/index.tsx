"use client";

import React, { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { Heart, Share2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../../../../types/news';

declare const process: {
  env: Record<string, string | undefined>;
};

type CricketApiArticle = {
  id?: string | number;
  title?: string;
  description?: string[];
  summary?: string;
  badge?: string;
  image?: string;
  cdn_url?: string;
  createdAt?: number | string;
};

const stripHtmlTags = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

const NEWS_LIKES_KEY = 'sportsfan_news_likes';
const NEWS_USER_LIKES_KEY = 'sportsfan_news_user_likes';
const CRICKET_USER_LIKES_KEY = 'cricket_user_likes'; // Track which users liked which cricket articles

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
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sharedArticle, setSharedArticle] = useState<NewsArticle | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const animationId = useId();

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

  const nextSlide = () => {
    if (articles.length === 0) return;
    setStartIndex((current) => (current + 1) % articles.length);
  };

  const prevSlide = () => {
    if (articles.length === 0) return;
    setStartIndex((current) => (current - 1 + articles.length) % articles.length);
  };

  const toggleLike = (article: NewsArticle, currentLikes: number = 0) => {
    const articleRank = article.rank;
    const newUserLikes = new Set(userLikes);
    let newCount = currentLikes;
    
    if (newUserLikes.has(articleRank)) {
      newUserLikes.delete(articleRank);
      newCount = Math.max(0, currentLikes - 1);
    } else {
      newUserLikes.add(articleRank);
      newCount = currentLikes + 1;
    }
    
    setUserLikes(newUserLikes);
    const newLikeCounts = { ...likeCounts, [articleRank]: newCount };
    setLikeCounts(newLikeCounts);
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(NEWS_USER_LIKES_KEY, JSON.stringify(Array.from(newUserLikes)));
      window.localStorage.setItem(NEWS_LIKES_KEY, JSON.stringify(newLikeCounts));
      
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
          } catch  {
            cricketUserLikes = {};
          }
        }
        
        if (newUserLikes.has(articleRank)) {
          // User liked - track the article ID
          cricketUserLikes[article.id] = true;
        } else {
          // User unliked - remove tracking
          delete cricketUserLikes[article.id];
        }
        
        window.localStorage.setItem(CRICKET_USER_LIKES_KEY, JSON.stringify(cricketUserLikes));
      }
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Append the ?date parameter with your absolute latest date
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const today = new Date()
.toISOString()
.split("T")[0]

const newsRes = await fetch(
`${baseUrl}/api/news-center?date=${today}`
);
        const newsData = await newsRes.json();
        const newsArticles = (newsData?.articles || []) as NewsArticle[];

        let cricketArticles: CricketApiArticle[] = [];
        try {
          const cricketRes = await fetch('/api/cricket-articles');
          if (cricketRes.ok) {
            const cricketData = await cricketRes.json();
            cricketArticles = cricketData?.articles || cricketData?.data || (Array.isArray(cricketData) ? cricketData : []);
            console.log('Cricket articles fetched:', cricketArticles.length);
          }
        } catch (error) {
          console.warn('Cricket articles fetch failed', error);
        }

        const transformedCricket: NewsArticle[] = (Array.isArray(cricketArticles) ? cricketArticles : []).map(
          (article: CricketApiArticle) => ({
            rank: 0,
            title: article.title || '',
            summary: article.description?.[0] || article.summary || '',
            source: 'SportsFan360',
            url: `/MainModules/CricketArticles/${article.id}`,
            tag: article.badge || 'Cricket',
            cdn_url: article.image || article.cdn_url || '',
            createdAt:
              typeof article.createdAt === 'number'
                ? article.createdAt
                : article.createdAt
                  ? Date.parse(String(article.createdAt))
                  : Date.now(),
            id: String(article.id) // Add cricket article ID for sync
          })
        );

        const mergedArticles = [...newsArticles, ...transformedCricket];
        mergedArticles.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        const rankedArticles = mergedArticles.map((article, index) => ({
          ...article,
          rank: index + 1,
        }));

        setArticles(rankedArticles);
      } catch (error) {
        console.error('Error loading news', error);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLikeCounts = window.localStorage.getItem(NEWS_LIKES_KEY);
    if (savedLikeCounts) {
      setLikeCounts(JSON.parse(savedLikeCounts));
    }
    const savedUserLikes = window.localStorage.getItem(NEWS_USER_LIKES_KEY);
    if (savedUserLikes) {
      setUserLikes(new Set(JSON.parse(savedUserLikes)));
    }
  }, []);

  if (articles.length === 0) return null;

  const safeAnimationId = `news-scroll-${animationId.replace(/:/g, '')}`;
  const durationSeconds = Math.max(40, articles.length * 8);
  const rotatedArticles = [...articles.slice(startIndex), ...articles.slice(0, startIndex)];
  const duplicated = [...rotatedArticles, ...rotatedArticles];

  return (
    <div className="w-full flex flex-col gap-4 py-4 rounded-xl">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-bold text-white">News Center</h2>
          <p className="text-sm text-gray-400">Top stories, match previews & records from around the cricket world.</p>
        </div>
        <Link href="/news-center" className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-all text-sm">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div
        className="relative flex items-center group w-full bg-[#111111] p-3 rounded-2xl border border-gray-800"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous news articles"
          className="absolute left-2 z-10 p-2 bg-black/50 text-white rounded-full border border-gray-600 hover:bg-black transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="overflow-hidden w-full px-4">
          <style>{`
            @keyframes ${safeAnimationId} {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}</style>
          <div
            className="flex gap-2"
            style={{
              width: 'max-content',
              animationName: safeAnimationId,
              animationDuration: `${durationSeconds}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {duplicated.map((article: NewsArticle, index: number) => (
              <div key={`${article.rank}-${index}`} className="flex-none w-[calc(90vw-3rem)] sm:w-[calc(50vw-3rem)] max-w-[690px] flex flex-col justify-between border-l-2 border-orange-500 pl-3 py-2">
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex items-start gap-3">
                      <img
                        src={article.source === 'SportsFan360' && article.cdn_url ? article.cdn_url : '/images/News_center_Default.png'}
                        alt={article.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/images/News_center_Default.png';
                        }}
                      />
                      <span className="px-2 py-1 text-[10px] font-bold text-orange-500 border border-orange-500 rounded uppercase tracking-wider h-fit">
                        {article.tag}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(article.createdAt)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {stripHtmlTags(article.summary)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-4">{article.source} • {formatDate(article.createdAt)}</p>
                  <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                    <div className="flex gap-4">
                      <button onClick={() => toggleLike(article, likeCounts[article.rank] || article.likes || 0)} className={`flex items-center gap-1 text-sm transition-colors ${userLikes.has(article.rank) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}>
                        <Heart size={16} fill={userLikes.has(article.rank) ? 'currentColor' : 'none'} /> {(likeCounts[article.rank] ?? article.likes) || 0}
                      </button>
                      <button onClick={() => openShareDialog(article)} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                    {article.source === 'SportsFan360' || article.url?.includes('/MainModules/CricketArticles/') ? (
                      <Link href={article.url} className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-sm font-semibold">
                        Read More <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <a href={article.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-pink-500 hover:text-pink-400 text-sm font-semibold">
                        Read More <ArrowRight size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next news articles"
          className="absolute right-2 z-10 p-2 bg-black/50 text-white rounded-full border border-gray-600 hover:bg-black transition-all"
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <span className={`w-4 h-1 rounded-full ${startIndex === 0 ? 'bg-pink-500' : 'bg-gray-600'}`}></span>
          <span className={`w-4 h-1 rounded-full ${startIndex === 1 ? 'bg-pink-500' : 'bg-gray-600'}`}></span>
          <span className={`w-4 h-1 rounded-full ${startIndex === 2 ? 'bg-pink-500' : 'bg-gray-600'}`}></span>
          <span className={`w-4 h-1 rounded-full ${startIndex >= 3 ? 'bg-pink-500' : 'bg-gray-600'}`}></span>
        </div>
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
