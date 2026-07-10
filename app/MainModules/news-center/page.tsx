"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Bell, Heart, Share2, ArrowRight, Calendar, CheckCircle2, ExternalLink } from 'lucide-react';
// FIX: Using relative path from app/news-center/page.tsx to types/news.ts
import { NewsArticle } from '../../../types/news';
// Type for the external cricket API response (narrowed to avoid `any`)
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

type NewsApiArticle = NewsArticle & {
  createdAt?: number | string;
};

const NEWS_EXTERNAL_BYPASS_KEY = 'sportsfan_news_external_bypass';
const NEWS_LIKES_KEY = 'sportsfan_news_likes';
const NEWS_USER_LIKES_KEY = 'sportsfan_news_user_likes';
const CRICKET_USER_LIKES_KEY = 'cricket_user_likes'; // Track which users liked which cricket articles

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
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  // Change this line:
  const [selectedArchiveDate, setSelectedArchiveDate] = useState('last-3-days');

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
    const savedLikeCounts = window.localStorage.getItem(NEWS_LIKES_KEY);
    if (savedLikeCounts) {
      setLikeCounts(JSON.parse(savedLikeCounts));
    }
    const savedUserLikes = window.localStorage.getItem(NEWS_USER_LIKES_KEY);
    if (savedUserLikes) {
      setUserLikes(new Set(JSON.parse(savedUserLikes)));
    }
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Pass the selected date to your API
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        // ADD THIS: Build the query depending on the selected state
        const dateQuery = selectedArchiveDate === 'last-3-days' 
          ? ARCHIVE_DATES.slice(0, 3).join(',') 
          : selectedArchiveDate;

        // UPDATE THIS: Use the new dateQuery variable
        const newsRes = await fetch(
          `${baseUrl}/api/news-center?date=${dateQuery}`
        );
        const newsData = await newsRes.json();
        const newsArticles = (newsData?.articles || []).map((article: NewsApiArticle) => ({
          ...article,
          createdAt: typeof article.createdAt === 'number' ? article.createdAt : (article.createdAt ? Date.parse(String(article.createdAt)) : undefined)
        })) as NewsArticle[];

        // Try to fetch Cricket Articles from local proxy
        let cricketArticles: CricketApiArticle[] = [];
        try {
          const cricketRes = await fetch('/api/cricket-articles');
          if (cricketRes.ok) {
            const cricketData = await cricketRes.json();
            // Handle different possible response structures
            cricketArticles = cricketData?.articles || cricketData?.data || (Array.isArray(cricketData) ? cricketData : []);
            console.log("Cricket articles fetched:", cricketArticles.length);
          }
        } catch (error) {
          console.warn("Cricket articles fetch failed", error);
        }

        // Transform cricket articles to match NewsArticle structure
        const transformedCricket: NewsArticle[] = (Array.isArray(cricketArticles) ? cricketArticles : [])
          .map((article: CricketApiArticle) => ({
            rank: 0,
            title: article.title || '',
            summary: article.description?.[0] || article.summary || '',
            source: 'SportsFan360',
            url: `/MainModules/CricketArticles/${article.id}`,
            tag: article.badge || 'Cricket',
            cdn_url: article.image || article.cdn_url || '',
            createdAt: typeof article.createdAt === 'number' ? article.createdAt : (article.createdAt ? Date.parse(String(article.createdAt)) : Date.now()),
            likes: 0,
            id: String(article.id) // Add cricket article ID for sync
          }));

        // Merge both arrays
        const mergedArticles = [...newsArticles, ...transformedCricket];

        // Sort by date (latest first)
        mergedArticles.sort((a: NewsArticle, b: NewsArticle) => {
          const dateA = (a.createdAt || 0) as number;
          const dateB = (b.createdAt || 0) as number;
          return dateB - dateA;
        });

        // Reassign ranks based on sorted order
        const rankedArticles = mergedArticles.map((article, index) => ({
          ...article,
          rank: index + 1
        }));

        setArticles(rankedArticles);
      } catch (error) {
        console.error("Error loading news", error);
      }
    };
    fetchNews();
  }, [selectedArchiveDate]);

  // derive displayedArticles from articles + filters
  const displayedArticles = React.useMemo(() => {
    // Filter by categories
    const cats = Object.entries(selectedCategories)
      .filter(([k, v]) => k !== 'All' && v)
      .map(([k]) => k);

    let filtered = articles.filter((a) => {
      if (selectedCategories.All) return true;
      if (cats.length === 0) return true;
      return cats.includes(a.tag) || cats.includes(String(a.tag));
    });

    // Sort according to option
    // NOTE: swapping behavior per request: 'latest' will now show oldest-first and
    // 'oldest' will show latest-first (labels unchanged)
    // Sort according to option
    if (sortOption === 'latest') {
      // Latest first (newest dates at the top)
      filtered = filtered.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sortOption === 'oldest') {
      // Oldest first (older dates at the top)
      filtered = filtered.slice().sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } else if (sortOption === 'most-liked') {
      // Most liked (highest likes at the top)
      filtered = filtered.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    return filtered;
  }, [articles, selectedCategories, sortOption]);

  const openExternalArticle = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleExternalReadClick = (event: React.MouseEvent<HTMLAnchorElement>, article: NewsArticle) => {
    event.preventDefault();

    if (bypassExternalPrompt) {
      openExternalArticle(article.url);
      return;
    }

    setPendingExternal({
      url: article.url,
      source: article.source || 'External Source',
    });
    setShowExternalPrompt(true);
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
          } catch {
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
          {displayedArticles.map((article, index) => (
            <div key={index} className="bg-[#111] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row gap-6">
               <div className="md:w-[120px] md:h-[100px] shrink-0 relative">
                 <Image
                   src={article.source === 'SportsFan360' && article.cdn_url ? article.cdn_url : '/images/News_center_Default.png'}
                   alt={article.title}
                   width={120}
                   height={100}
                   className="w-full h-full object-cover rounded-lg"
                   onError={(e) => {
                     (e.currentTarget as HTMLImageElement).src = '/images/News_center_Default.png';
                   }}
                 />
               </div>

               <div className="flex-1">
                 <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-1 text-[10px] font-bold text-orange-500 border border-orange-500 rounded uppercase tracking-wider">
                      {article.tag}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(article.createdAt)}</span>
                 </div>
                 <h2 className="text-xl font-bold mb-2">{article.title}</h2>
                 <p className="text-sm text-gray-400 mb-4 line-clamp-2">{stripHtmlTags(article.summary)}</p>
                 <p className="text-xs text-gray-500 mb-4">{article.source} • {formatDate(article.createdAt)}</p>

                 <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                  <div className="flex gap-6">
                    <button onClick={() => toggleLike(article, likeCounts[article.rank] || article.likes || 0)} className={`flex items-center gap-1 text-sm transition-colors ${userLikes.has(article.rank) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}>
                      <Heart size={16} fill={userLikes.has(article.rank) ? 'currentColor' : 'none'} /> {(likeCounts[article.rank] ?? article.likes) || 0}
                    </button>
                    <button onClick={() => openShareDialog(article)} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                  {article.source === 'SportsFan360' || article.url?.includes('/MainModules/CricketArticles/') ? (
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
          ))}
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
