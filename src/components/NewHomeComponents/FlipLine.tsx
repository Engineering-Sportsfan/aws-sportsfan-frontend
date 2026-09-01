import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare, Share2, Play, Volume2, Sparkles, Send } from 'lucide-react';
import { fliplineService } from '@/services/flipline.service';
import { useAuth } from "@/context/AuthContext";
import FlipArena from './FlipArena';


type FlipCard = {
  id: number; type: string;
  sport: 'cricket' | 'football' | 'athletics';
  sportEmoji: string; sportLabel: string;
  day: string; time: string; timeMs: number;
  author: string; handle?: string; source: string;
  authorPhoto?: any;
  content: string; emoji?: string; mediaType?: 'audio' | 'video';
  image?: any;
  videoUrl?: string;
  likes: number; isKey: boolean; tags?: string[];
  scoreChip?: ScoreChip;
  fomoMsg: string; fomoCount: number;
  ctaType: 'room' | 'watchalong' | 'drop';
  flipResponse: string;
  sk?: string;
  userId?: string;
  email?: string;
  isVerified?: boolean;
  adminPhoto?: string;
  overLabel?: string;
  runSymbol?: string;
};
/* ─── FlipLine shared data ─────────────────────────────────────────── */
type ScoreChip = {
  score: string;
  status: string;
  statusType: 'live' | 'final' | 'break' | 'upcoming' | 'delay' | 'info';
};



function FlipLineSection({ selectedSport, onViewFull, cards, loading }: { selectedSport: string; onViewFull: () => void; cards: FlipCard[]; loading: boolean }) {
  const [density, setDensity] = useState<'full' | 'key'>('full');
  const [likedCards, setLikedCards] = useState<Set<number>>(new Set());
  const [askOpen, setAskOpen] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sf360_liked_fliplines');
      if (stored) {
        try {
          setLikedCards(new Set(JSON.parse(stored)));
        } catch (e) {
          console.error('Failed to parse liked fliplines:', e);
        }
      }
    }
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700 }}>Loading moments... ⚡</span>
      </div>
    );
  }

  let displayCards = density === 'key' ? cards.filter(c => c.isKey) : cards;

  // Apply hashtag filter chips
  if (activeFilter === 'cricket') {
    displayCards = displayCards.filter(c => c.sport === 'cricket');
  } else if (activeFilter === 'football') {
    displayCards = displayCards.filter(c => c.sport === 'football');
  } else if (activeFilter === 'athletics') {
    displayCards = displayCards.filter(c => c.sport === 'athletics');
  } else if (activeFilter === 'analysts') {
    const filtered = displayCards.filter(
      c =>
        c.type === 'expert' ||
        c.type === 'analyst' ||
        c.type === 'bot' ||
        c.author?.toLowerCase().includes('analyst') ||
        c.source?.toLowerCase().includes('analyst') ||
        c.tags?.some(t => t.toLowerCase().includes('analyst'))
    );
    if (filtered.length > 0) displayCards = filtered;
  } else if (activeFilter === 'sf360-live') {
    const filtered = displayCards.filter(
      c =>
        c.source?.toLowerCase().includes('live') ||
        c.source?.toLowerCase().includes('roanuz') ||
        c.type === 'bot' ||
        c.isKey ||
        c.tags?.some(t => t.toLowerCase().includes('live'))
    );
    if (filtered.length > 0) displayCards = filtered;
  } else if (activeFilter === 'fan-roar') {
    const filtered = displayCards.filter(
      c =>
        c.type === 'fan' ||
        c.ctaType === 'room' ||
        c.source?.toLowerCase().includes('roar') ||
        c.tags?.some(t => t.toLowerCase().includes('roar'))
    );
    if (filtered.length > 0) displayCards = filtered;
  } else if (selectedSport && selectedSport !== 'mixed') {
    displayCards = displayCards.filter(c => c.sport === selectedSport);
  }

  return (
    <div className="mb-5">
      {/* Header */}
      <div className="flex items-center justify-end px-4 mb-3">
        {/* <div className="flex items-center rounded-full p-[2px]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
          {(['full', 'key'] as const).map(d => (
            <button key={d} onClick={() => setDensity(d)} className="px-[10px] py-[3px] rounded-full transition-all cursor-pointer"
              style={{ fontSize: 9.5, fontWeight: 800, background: density === d ? 'rgba(168,85,247,0.85)' : 'transparent', color: density === d ? 'white' : 'rgba(255,255,255,0.38)', border: 'none' }}>
              {d === 'full' ? 'Full' : 'Key Moments'}
            </button>
          ))}
        </div> */}
      </div>
      {/* Multi-sport & Tag Filter Chips (Horizontally Scrollable) */}
      <div
        className="flex items-center gap-2 px-4 mb-4 overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {[
          { id: 'all', label: '#all', emoji: '⚡' },
          { id: 'cricket', label: '#cricket', emoji: '🏏' },
          { id: 'football', label: '#football', emoji: '⚽' },
          { id: 'athletics', label: '#athletics', emoji: '🏃' },
          { id: 'analysts', label: '#analysts', emoji: '🎙' },
          { id: 'sf360-live', label: '#sf360-live', emoji: '📡' },
          { id: 'fan-roar', label: '#fan-roar', emoji: '🔥' },
        ].map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              style={{
                background: isActive
                  ? 'linear-gradient(90deg, #FF3D57, #FF7B02)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: isActive
                  ? '1px solid rgba(255, 61, 87, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                boxShadow: isActive ? '0 3px 12px rgba(255, 61, 87, 0.3)' : 'none',
              }}
            >
              <span className="text-xs">{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
      {/* Timeline — show latest 4 moments on home */}
      <FlipTimeline cards={displayCards} previewLimit={4} likedCards={likedCards} setLikedCards={setLikedCards} askOpen={askOpen} setAskOpen={setAskOpen} />
      {/* View Full button */}
      <div style={{ paddingLeft: 14, paddingRight: 14, marginTop: 6 }}>
        <button onClick={onViewFull}
          className="w-full py-[11px] rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(255,255,255,0.55)' }}>View Full FlipLine</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ─── FlipLine full-page screen ─────────────────────────────────────── */
export function FlipLineFullScreen({ onBack, selectedSport = 'mixed', cards, loading }: { onBack: () => void; selectedSport?: string; cards: FlipCard[]; loading: boolean }) {
  const [density, setDensity] = useState<'full' | 'key'>('full');
  const [likedCards, setLikedCards] = useState<Set<number>>(new Set());
  const [askOpen, setAskOpen] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sf360_liked_fliplines');
      if (stored) {
        try {
          setLikedCards(new Set(JSON.parse(stored)));
        } catch (e) {
          console.error('Failed to parse liked fliplines:', e);
        }
      }
    }
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgb(7,11,20)' }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 700 }}>Loading moments... ⚡</span>
      </div>
    );
  }

  let displayCards = density === 'key' ? cards.filter(c => c.isKey) : cards;

  // Apply hashtag filter chips
  if (activeFilter === 'cricket') {
    displayCards = displayCards.filter(c => c.sport === 'cricket');
  } else if (activeFilter === 'football') {
    displayCards = displayCards.filter(c => c.sport === 'football');
  } else if (activeFilter === 'athletics') {
    displayCards = displayCards.filter(c => c.sport === 'athletics');
  } else if (activeFilter === 'analysts') {
    const filtered = displayCards.filter(
      c =>
        c.type === 'expert' ||
        c.type === 'analyst' ||
        c.type === 'bot' ||
        c.author?.toLowerCase().includes('analyst') ||
        c.source?.toLowerCase().includes('analyst') ||
        c.tags?.some(t => t.toLowerCase().includes('analyst'))
    );
    if (filtered.length > 0) displayCards = filtered;
  } else if (activeFilter === 'sf360-live') {
    const filtered = displayCards.filter(
      c =>
        c.source?.toLowerCase().includes('live') ||
        c.source?.toLowerCase().includes('roanuz') ||
        c.type === 'bot' ||
        c.isKey ||
        c.tags?.some(t => t.toLowerCase().includes('live'))
    );
    if (filtered.length > 0) displayCards = filtered;
  } else if (activeFilter === 'fan-roar') {
    const filtered = displayCards.filter(
      c =>
        c.type === 'fan' ||
        c.ctaType === 'room' ||
        c.source?.toLowerCase().includes('roar') ||
        c.tags?.some(t => t.toLowerCase().includes('roar'))
    );
    if (filtered.length > 0) displayCards = filtered;
  } else if (selectedSport && selectedSport !== 'mixed') {
    displayCards = displayCards.filter(c => c.sport === selectedSport);
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'rgb(7,11,20)' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px 11px', background: 'rgba(7,11,20,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <a href="/MainModules/HomePage">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </a>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: -0.5 }}>FlipLine</span>
            <span style={{ fontSize: 8, fontWeight: 900, background: 'linear-gradient(90deg,rgb(255,45,85),rgb(255,122,0))', color: 'white', padding: '2px 8px', borderRadius: 99, letterSpacing: 0.5 }}>LIVE</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏏 Cricket</span><span>⚽ Football</span><span>🏃 Athletics</span>
          </div>
        </div>
        <div style={{ display: 'flex', borderRadius: 99, padding: 2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
          {(['full', 'key'] as const).map(d => (
            <button key={d} onClick={() => setDensity(d)}
              style={{ padding: '3px 11px', borderRadius: 99, fontSize: 9.5, fontWeight: 800, background: density === d ? 'rgba(168,85,247,0.85)' : 'transparent', color: density === d ? 'white' : 'rgba(255,255,255,0.38)', border: 'none', cursor: 'pointer' }}>
              {d === 'full' ? 'Full' : 'Key'}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-sport & Tag Filter Chips (Horizontally Scrollable) */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar border-b border-white/[0.06]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {[
          { id: 'all', label: '#all', emoji: '⚡' },
          { id: 'cricket', label: '#cricket', emoji: '🏏' },
          { id: 'football', label: '#football', emoji: '⚽' },
          { id: 'athletics', label: '#athletics', emoji: '🏃' },
          { id: 'analysts', label: '#analysts', emoji: '🎙' },
          { id: 'sf360-live', label: '#sf360-live', emoji: '📡' },
          { id: 'fan-roar', label: '#fan-roar', emoji: '🔥' },
        ].map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              style={{
                background: isActive
                  ? 'linear-gradient(90deg, #FF3D57, #FF7B02)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: isActive
                  ? '1px solid rgba(255, 61, 87, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                boxShadow: isActive ? '0 3px 12px rgba(255, 61, 87, 0.3)' : 'none',
              }}
            >
              <span className="text-xs">{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Legend strip */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 14, padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
        {([{c:'rgb(168,85,247)',l:'Analyst'},{c:'rgb(233,30,140)',l:'Fan ROAR'},{c:'rgb(255,107,53)',l:'SF360 Drop'}] as const).map(({c,l}) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}aa` }} />
            <span style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{l}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.22)', fontWeight: 600 }}>Newest first</span>
      </div>

      {/* Scrollable timeline */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 16, paddingBottom: 32 }}>
        <FlipTimeline cards={displayCards} likedCards={likedCards} setLikedCards={setLikedCards} askOpen={askOpen} setAskOpen={setAskOpen} />
        {/* Start-of-coverage marker */}
        <div style={{ paddingLeft: 14, paddingTop: 8, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 44, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)' }} />
          </div>
          <span style={{ paddingLeft: 10, fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 700 }}>Start of coverage · Day 1 · 10:30 AM</span>
        </div>
      </div>
    </div>
  );
}

/* ─── FlipTimeline detailed timeline view ───────────────────────────── */
interface FlipTimelineProps {
  cards: FlipCard[];
  previewLimit?: number;
  likedCards: Set<number>;
  setLikedCards: React.Dispatch<React.SetStateAction<Set<number>>>;
  askOpen: number | null;
  setAskOpen: (id: number | null) => void;
}

const DolphinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400 shrink-0 mr-1">
    <path d="M21.9 8.2c-.4-.8-1.1-1.4-1.9-1.8-1.1-.5-2.3-.6-3.5-.5-1.2.1-2.4.5-3.5 1.1-1.6.9-2.9 2.2-3.8 3.8-.5.9-.9 1.9-1.1 3-.1.5-.1 1 0 1.5.1.5.3 1 .6 1.4.3.4.8.7 1.3.8.5.1 1 0 1.5-.1.9-.3 1.7-.8 2.4-1.4.8-.7 1.4-1.5 1.9-2.4.9-1.6 1.3-3.4 1.3-5.2 0-.2 0-.4-.1-.6l1.2-1.2c.4-.4.9-.7 1.5-.8.6-.1 1.2 0 1.7.3.5.3 1 .8 1.2 1.4.2.6.2 1.2 0 1.8-.2.6-.6 1.1-1.1 1.5z" />
  </svg>
);

export function FlipCardItem({
  card,
  index,
  totalCards,
  isLiked,
  likedCards,
  setLikedCards,
  askOpen,
  setAskOpen,
  typeColorMap,
  typeLabelMap,
  router,
  handleLike,
  handleShare,
  handleCtaClick,
}: {
  card: FlipCard;
  index: number;
  totalCards: number;
  isLiked: boolean;
  likedCards: Set<number>;
  setLikedCards: React.Dispatch<React.SetStateAction<Set<number>>>;
  askOpen: number | null;
  setAskOpen: (id: number | null) => void;
  typeColorMap: Record<string, string>;
  typeLabelMap: Record<string, string>;
  router: any;
  handleLike: (card: FlipCard) => void;
  handleShare: (card: FlipCard) => void;
  handleCtaClick: (ctaType: 'room' | 'watchalong' | 'drop') => void;
}) {
  const { user, getUserName } = useAuth();
  const currentUserId = user?.actualUserId || user?.userId || getUserName();
  const currentUserEmail = user?.email;
  const isCurrentUser = (currentUserEmail && card.email && currentUserEmail.toLowerCase() === card.email.toLowerCase()) ||
                         (card.userId && currentUserId && card.userId === currentUserId);
  const rawAuthor = isCurrentUser ? "You" : (card.author === "You" ? "Fan" : card.author);
  const displayAuthor = rawAuthor 
    ? rawAuthor.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
    : '';
  const displayHandle = isCurrentUser ? "@you" : (card.handle === "@you" ? "@fan" : card.handle);
  const displayPhoto = card.adminPhoto || card.authorPhoto || (isCurrentUser ? user?.avatar : undefined);

  // console.log("FlipCardItem DEBUG:", {
  //   cardId: card.id,
  //   content: card.content?.substring(0, 20),
  //   cardUserId: card.userId,
  //   currentUserId,
  //   isCurrentUser,
  //   cardAuthor: card.author,
  //   displayAuthor,
  //   displayHandle
  // });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(card.flipResponse || "");
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wasInitiallyLiked, setWasInitiallyLiked] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState<
    Array<{ id: string; author: string; handle?: string; text: string; time: string; avatar?: string }>
  >([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sf360_liked_fliplines');
      if (stored) {
        try {
          const likedSet = new Set<number>(JSON.parse(stored));
          if (likedSet.has(card.id)) {
            setWasInitiallyLiked(true);
          }
        } catch (e) {
          console.error('Failed to parse liked fliplines:', e);
        }
      }
    }
  }, [card.id]);

  const handleAskFlip = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Context moment: "${card.content}". Question about this moment: "${question}". Answer this question in a short, engaging sports fan format under 180 characters.`
        }),
      });
      if (!res.ok) throw new Error("API call failed");
      const data = await res.json();
      setAnswer(data.answer || "No response received.");
      setQuestion("");
    } catch (e) {
      console.error("Failed to ask Flip:", e);
      setAnswer("Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isExpanded = askOpen === card.id;
  const themeColor = typeColorMap[card.type] || '#3b82f6';
  const themeLabel = typeLabelMap[card.type] || card.type;

  return (
    <div className="flex w-full relative mb-8">
      {/* Left timeline axis */}
      <div className="w-[70px] shrink-0 flex flex-col items-center pt-1 relative">
        {(() => {
          const parts = card.time.split(' ');
          if (parts.length >= 2) {
            return (
              <>
                <span className="text-[15px] font-black text-white leading-none">{parts[0]}</span>
                <span className="text-[9px] font-bold text-white/40 leading-none mt-1 uppercase tracking-wider">{parts.slice(1).join(' ')}</span>
              </>
            );
          }
          return (
            <span className="text-[12px] font-extrabold text-white leading-tight text-center break-words max-w-[60px]">
              {card.time}
            </span>
          );
        })()}
        
        {/* Dot */}
        <div 
          className="w-3 h-3 rounded-full bg-white border border-white/20 relative z-10 mt-3"
          style={{
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
          }}
        />

        {/* Vertical Line */}
        {index < totalCards - 1 && (
          <div 
            className="absolute w-[1px] bg-white/10"
            style={{
              top: '52px', // starts below the dot
              bottom: '-32px', // extends to the next card's top
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
        )}
      </div>

      {/* Right card container */}
      <div className="flex-1 pr-4 pb-2 min-w-0">
        <div className="transition-all duration-300 relative flex flex-col gap-3.5 w-full bg-[#161b22]/40 border border-[#21262d] rounded-2xl p-4 shadow-md">

          {/* Row 1: Score & Sport Tag */}
          {/* {card.scoreChip && (
            <div className="flex items-center justify-between w-full min-h-[24px]">
              <div className="flex items-center gap-2">
                <div
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#10b981] bg-[#10b981]/12 border border-[#10b981]/20"
                >
                  {card.scoreChip.score}
                </div>
                <span
                  className="text-[11px] font-extrabold text-[#10b981]"
                >
                  {card.scoreChip.status}
                </span>
              </div>
            </div>
          )} */}

          {/* Row 2: Author info */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              {card.type === 'bot' ? (
                <img 
                  src="/images/dolly.png" 
                  alt="Flip BOT" 
                  className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0 bg-blue-500/10" 
                />
              ) : displayPhoto ? (
                <img 
                  src={typeof displayPhoto === 'object' ? displayPhoto.src : displayPhoto} 
                  alt={displayAuthor} 
                  className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" 
                />
              ) : (
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-[12px] shrink-0 uppercase tracking-wider"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}, #0f172a)`
                  }}
                >
                  {displayAuthor 
                    ? displayAuthor.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase()
                    : ''}
                </div>
              )}
              
              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[13.5px] text-white leading-tight truncate">
                    {card.type === 'bot' ? 'Flip' : displayAuthor}
                  </span>
                  {card.type === 'bot' ? (
                    <span className="inline-flex items-center justify-center bg-blue-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0">
                      BOT
                    </span>
                  ) : (
                    card.isVerified && (
                      <span className="inline-flex items-center justify-center bg-[#1d9bf0] text-white rounded-full shrink-0" style={{ width: 14, height: 14 }} title="Verified Admin">
                        <svg className="w-2.5 h-2.5 fill-none stroke-current" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )
                  )}
                  {card.type !== 'bot' && displayHandle && (
                    <span className="text-[11px] text-white/40 truncate">{displayHandle}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    className="text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase"
                    style={{ 
                      background: card.type === 'bot' ? 'rgba(59, 130, 246, 0.15)' : `${themeColor}1f`, 
                      color: card.type === 'bot' ? 'rgb(96, 165, 250)' : themeColor 
                    }}
                  >
                    {card.type === 'bot' ? 'Live Updates' : themeLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Run / Wicket badge circle on the right */}
            {card.runSymbol && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-[14px] shrink-0 shadow-lg"
                style={{
                  background: card.runSymbol === '4' 
                    ? 'radial-gradient(circle, #2563eb, #1d4ed8)' // Blue for 4
                    : card.runSymbol === '6'
                    ? 'radial-gradient(circle, #16a34a, #15803d)' // Green for 6
                    : card.runSymbol === 'W'
                    ? 'radial-gradient(circle, #dc2626, #b91c1c)' // Red for W
                    : 'radial-gradient(circle, #ea580c, #c2410c)', // Orange for runs like 2
                  boxShadow: card.runSymbol === '4'
                    ? '0 0 8px rgba(37, 99, 235, 0.6)'
                    : card.runSymbol === '6'
                    ? '0 0 8px rgba(22, 163, 74, 0.6)'
                    : card.runSymbol === 'W'
                    ? '0 0 8px rgba(220, 38, 38, 0.6)'
                    : '0 0 8px rgba(234, 88, 12, 0.6)'
                }}
              >
                {card.runSymbol}
              </div>
            )}
          </div>

          {/* Row 3: Card Content */}
          <p className="text-[14px] font-medium text-white/90 leading-relaxed break-words whitespace-pre-line">
            {card.content}
          </p>

          {/* If the card is a bot live update, render the over and time footer */}
          {card.type === 'bot' && card.overLabel && (
            <p className="text-[11px] font-bold text-white/35 mt-0.5">
              {card.overLabel} · {card.time}
            </p>
          )}

          {/* Inline Image or Video/Audio media */}
          {(card.image || card.videoUrl || card.mediaType === 'audio') && (
            <div className="relative group rounded-xl overflow-hidden mt-1 max-h-[220px]">
              {card.mediaType === 'video' && card.videoUrl ? (
                <>
                  <video
                    src={card.videoUrl}
                    controls
                    preload="metadata"
                    className="w-full max-h-[220px] object-cover"
                  />
                  {/* Floating Expand button for native videos */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullscreen(true);
                    }}
                    className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/85 transition-all duration-200 active:scale-90 cursor-pointer opacity-0 group-hover:opacity-100"
                    title="View Fullscreen (Actual Aspect Ratio)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </>
              ) : card.mediaType === 'audio' && !card.image ? (
                /* Audio-only layout */
                <div className="w-full h-[64px] bg-gradient-to-r from-purple-950/50 via-slate-900 to-purple-950/50 relative flex items-center px-4 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                      <Volume2 size={15} />
                    </div>
                    <div className="flex-1 flex items-center gap-[2.5px] h-4">
                      {[30, 80, 45, 90, 60, 35, 75, 40, 65, 80, 50, 70, 45, 85, 30, 60, 45, 90, 55, 35].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-white/30 rounded-full"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                      {card.image && (
                        <img
                          src={typeof card.image === 'object' ? card.image.src : card.image}
                          alt="Moment media" 
                          className="w-full h-full object-fill cursor-zoom-in"
                          onClick={() => setIsFullscreen(true)}
                        />
                      )}

                      {card.mediaType === 'video' && (
                        <div
                          onClick={() => setIsFullscreen(true)}
                          className="absolute inset-0 bg-black/35 flex items-center justify-center cursor-pointer"
                        >
                          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-transform hover:scale-105">
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Floating Expand button for image/legacy video */}
                      {(card.image || card.mediaType === 'video') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFullscreen(true);
                          }}
                          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/85 transition-all duration-200 active:scale-90 cursor-pointer opacity-0 group-hover:opacity-100"
                          title="View Fullscreen (Actual Aspect Ratio)"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9" />
                            <polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" />
                            <line x1="3" y1="21" x2="10" y2="14" />
                          </svg>
                        </button>
                      )}

                      {card.mediaType === 'audio' && (
                        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 p-2 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer">
                            <Volume2 size={13} />
                          </div>
                          <div className="flex-1 flex items-center gap-[2px] h-3 px-1">
                            {[30, 80, 45, 90, 60, 35, 75, 40, 65, 80, 50, 70, 45, 85].map((h, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-white/40 rounded-full"
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                </>
              )}
            </div>
          )}

          {/* Row 4: Tags (if present) */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-0.5">
              {card.tags.map(t => (
                <span key={t} className="text-[11px] font-bold text-pink-500 hover:underline cursor-pointer">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Row 5: FOMO Banner */}
          {card.fomoMsg && (
            <div 
              className="flex items-center justify-between gap-3 rounded-2xl p-3 bg-[#0d0a14] border border-pink-500/15"
              style={{
                borderColor: `${themeColor}2a`,
                background: `linear-gradient(135deg, rgba(7, 11, 20, 0.98), rgba(15, 10, 25, 0.6))`
              }}
            >
              <p className="text-[12px] font-semibold text-white/85 leading-snug">
                🔥 {card.fomoMsg}
              </p>
              <button
                onClick={() => handleCtaClick(card.ctaType)}
                className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-extrabold text-white transition-all active:scale-95 cursor-pointer"
                style={{
                  background: card.ctaType === 'room'
                    ? 'linear-gradient(135deg, #E91E8C, #FF6B35)'
                    : card.ctaType === 'watchalong'
                    ? 'linear-gradient(135deg, #7c3aed, #E91E8C)'
                    : 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                }}
              >
                {card.ctaType === 'room' && 'Join Room →'}
                {card.ctaType === 'watchalong' && 'Watch Along →'}
                {card.ctaType === 'drop' && 'Claim Drop →'}
              </button>
            </div>
          )}

          {/* Row 6: Action buttons (Like, Share, Flip) */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleLike(card)}
                className="flex items-center gap-2 text-white/40 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Heart 
                  size={16} 
                  fill={isLiked ? 'rgb(244, 63, 94)' : 'none'} 
                  className={`transition-all duration-200 ${isLiked ? 'text-rose-500 scale-110' : ''}`} 
                />
                <span className="text-[12.5px] font-extrabold leading-none">
                  {wasInitiallyLiked 
                    ? card.likes + (isLiked ? 0 : -1) 
                    : card.likes + (isLiked ? 1 : 0)}
                </span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => setCommentOpen((prev) => !prev)}
                className={`flex items-center gap-2 transition-all cursor-pointer ${
                  commentOpen
                    ? "text-sky-400 font-black"
                    : "text-white/40 hover:text-sky-400"
                }`}
                title="Comments"
              >
                <MessageSquare
                  size={15}
                  fill={commentOpen ? "rgba(56, 189, 248, 0.2)" : "none"}
                  className={`transition-all duration-200 ${
                    commentOpen ? "scale-110" : ""
                  }`}
                />
                <span className="text-[12.5px] font-extrabold leading-none">
                  {(card.commentsCount || 0) + commentsList.length}
                </span>
              </button>
              
              <button 
                onClick={() => handleShare(card)}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 size={15} />
                <span className="text-[12.5px] font-extrabold leading-none">Share</span>
              </button>
            </div>


            <button 
              onClick={() => setAskOpen(isExpanded ? null : card.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all duration-300 cursor-pointer"
              style={{
                background: isExpanded 
                  ? `${themeColor}22` 
                  : 'rgba(255, 255, 255, 0.03)',
                borderColor: isExpanded ? themeColor : 'rgba(255, 255, 255, 0.1)',
                color: isExpanded ? themeColor : '#fff',
                boxShadow: isExpanded ? `0 0 10px ${themeColor}33` : 'none'
              }}
            >
              <DolphinIcon />
              <span>{isExpanded ? 'Flipped' : 'Ask Flip'}</span>
            </button>
          </div>

          {/* Expanded Comment Box UI */}
          <AnimatePresence>
            {commentOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-sky-400" />
                      <span className="text-[11px] font-black text-sky-300 uppercase tracking-widest">
                        Comments{" "}
                        {commentsList.length > 0 || (card.commentsCount || 0) > 0
                          ? `(${commentsList.length + (card.commentsCount || 0)})`
                          : ""}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30 font-semibold">
                      Join the discussion
                    </span>
                  </div>

                  {/* Comment Input Field */}
                  <div className="flex items-center gap-2 w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 pl-3 focus-within:border-sky-500/50 transition-all">
                    <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "💬"}
                    </div>
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-transparent text-[12.5px] text-white placeholder:text-white/35 outline-none font-medium"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (commentText.trim()) {
                            const newComment = {
                              id: `c_${Date.now()}`,
                              author: user?.name || getUserName() || "Fan",
                              handle: user?.name
                                ? `@${user.name.toLowerCase().replace(/\s+/g, "")}`
                                : "@fan",
                              text: commentText.trim(),
                              time: "Just now",
                              avatar: user?.avatar,
                            };
                            setCommentsList((prev) => [newComment, ...prev]);
                            setCommentText("");
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (commentText.trim()) {
                          const newComment = {
                            id: `c_${Date.now()}`,
                            author: user?.name || getUserName() || "Fan",
                            handle: user?.name
                              ? `@${user.name.toLowerCase().replace(/\s+/g, "")}`
                              : "@fan",
                            text: commentText.trim(),
                            time: "Just now",
                            avatar: user?.avatar,
                          };
                          setCommentsList((prev) => [newComment, ...prev]);
                          setCommentText("");
                        }
                      }}
                      disabled={!commentText.trim()}
                      className="w-8 h-8 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 shadow-[0_2px_8px_rgba(56,189,248,0.25)]"
                      title="Send comment"
                    >
                      <Send size={13} className="ml-0.5" />
                    </button>
                  </div>

                  {/* List of comments */}
                  {commentsList.length > 0 ? (
                    <div className="flex flex-col gap-2 mt-1">
                      {commentsList.map((comm) => (
                        <div
                          key={comm.id}
                          className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-2.5 flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white/90">
                                {comm.author}
                              </span>
                              <span className="text-[10px] text-white/35 font-medium">
                                {comm.handle}
                              </span>
                            </div>
                            <span className="text-[9.5px] text-white/30">
                              {comm.time}
                            </span>
                          </div>
                          <p className="text-[12px] text-white/80 font-medium leading-snug pl-0.5">
                            {comm.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-2 text-center text-[11px] text-white/30 font-medium italic">
                      Be the first to comment on this moment! 💬
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded AI response */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-3 border-t border-white/[0.08] flex flex-col gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[10px]">🤖</div>
                    <span className="text-[11px] font-black text-violet-300 uppercase tracking-widest">Ask Flip about this moment</span>
                  </div>
                  
                  {/* Query Input field */}
                  <div className="flex gap-2 w-full mt-1">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask Flip anything about this moment..."
                      className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 text-[12.5px] text-white placeholder:text-white/30 outline-none focus:border-violet-500 transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleAskFlip()}
                    />
                    <button
                      onClick={handleAskFlip}
                      disabled={!question.trim() || loading}
                      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-[12px] px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      {loading ? 'Thinking...' : 'Ask Flip'}
                    </button>
                  </div>

                  {answer && (
                    <p className="text-[13px] text-white/90 leading-relaxed italic bg-violet-950/20 border border-violet-900/30 rounded-xl p-3">
                      {answer}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen Lightbox Overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Media container */}
          <div
            className="relative w-full max-w-4xl max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking media itself
          >
            {card.mediaType === 'video' && card.videoUrl ? (
              <video
                src={card.videoUrl}
                controls
                autoPlay
                preload="metadata"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            ) : card.image ? (
              <img
                src={typeof card.image === 'object' ? card.image.src : card.image}
                alt="Fullscreen media"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            ) : null}
          </div>

          {/* Details text at the bottom */}
          <div className="mt-6 text-center max-w-2xl px-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-[14.5px] font-medium text-white/95 leading-relaxed">
              {card.content}
            </p>
            <p className="text-[11px] text-white/40 mt-2">
              Posted by {displayAuthor} {displayHandle ? displayHandle : ''} · {card.time} · via {card.source}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function FlipTimeline({
  cards,
  previewLimit,
  likedCards,
  setLikedCards,
  askOpen,
  setAskOpen,
}: FlipTimelineProps) {
  const router = useRouter();

  const handleLike = async (card: FlipCard) => {
    const isLiked = likedCards.has(card.id);
    const action = isLiked ? 'unlike' : 'like';

    setLikedCards(prev => {
      const next = new Set(prev);
      if (next.has(card.id)) {
        next.delete(card.id);
      } else {
        next.add(card.id);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('sf360_liked_fliplines', JSON.stringify(Array.from(next)));
      }
      return next;
    });

    try {
      const cardSk = card.sk || `CARD#${card.timeMs}#${card.id}`;
      await fliplineService.likeFlipCard(cardSk, action);
    } catch (e) {
      console.error("Failed to update like in backend:", e);
      setLikedCards(prev => {
        const next = new Set(prev);
        if (next.has(card.id)) {
          next.delete(card.id);
        } else {
          next.add(card.id);
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('sf360_liked_fliplines', JSON.stringify(Array.from(next)));
        }
        return next;
      });
    }
  };

  const handleShare = (card: FlipCard) => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: `FlipLine from ${card.author}`,
        text: card.content,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`"${card.content}" - ${card.author} on Sportsfan360`);
      alert('Link copied to clipboard!');
    }
  };

  const handleCtaClick = (ctaType: 'room' | 'watchalong' | 'drop') => {
    if (ctaType === 'room') {
      router.push('/MainModules/ROAR');
    } else if (ctaType === 'watchalong') {
      router.push('/MainModules/WatchAlong');
    } else if (ctaType === 'drop') {
      router.push('/MainModules/FlipCards');
    }
  };

  // Sort chronologically by timeMs descending so newest is at the top
  const displayList = [...cards].sort((a, b) => b.timeMs - a.timeMs);
  const finalCards = previewLimit ? displayList.slice(0, previewLimit) : displayList;

  const typeColorMap = {
    analyst: 'rgb(168, 85, 247)',
    fan: 'rgb(233, 30, 140)',
    official: 'rgb(255, 107, 53)',
  };

  const typeLabelMap = {
    analyst: 'Analyst',
    fan: 'Fan ROAR',
    official: 'SF360 Drop',
  };

  // Group cards by day (date) preserving chronological order
  const dateGroups: { date: string; cards: FlipCard[] }[] = [];
  finalCards.forEach((card) => {
    const date = card.day || "Today";
    let group = dateGroups.find((g) => g.date === date);
    if (!group) {
      group = { date, cards: [] };
      dateGroups.push(group);
    }
    group.cards.push(card);
  });

  return (
    <div className="flex flex-col w-full relative">
      {dateGroups.map((group) => (
        <div key={group.date} className="w-full flex flex-col mb-6">
          {/* Centered Date Header at the top of the group */}
          <div className="flex justify-center mb-6 mt-2">
            <span className="px-4 py-1.5 rounded-full text-xs font-black text-white bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg uppercase tracking-wider">
              {group.date}
            </span>
          </div>

          {/* Group's cards list */}
          <div className="flex flex-col w-full relative">
            {group.cards.map((card, index) => {
              const isLiked = likedCards.has(card.id);
              return (
                <FlipCardItem
                  key={card.id}
                  card={card}
                  index={index}
                  totalCards={group.cards.length}
                  isLiked={isLiked}
                  likedCards={likedCards}
                  setLikedCards={setLikedCards}
                  askOpen={askOpen}
                  setAskOpen={setAskOpen}
                  typeColorMap={typeColorMap}
                  typeLabelMap={typeLabelMap}
                  router={router}
                  handleLike={handleLike}
                  handleShare={handleShare}
                  handleCtaClick={handleCtaClick}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FlipLine({ selectedSport = 'mixed' }: { selectedSport?: string }) {
  const router = useRouter();
  const [dbCards, setDbCards] = useState<FlipCard[]>([]);
  const [liveCards, setLiveCards] = useState<FlipCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'flipline' | 'fliparena'>('flipline');

  const fetchLiveTickerUpdates = async (): Promise<FlipCard[]> => {
    try {
      const res = await fetch("/api/ticker?sports=cricket&types=ball_by_ball&limit=30");
      const data = await res.json();
      if (data.success && data.items) {
        // Filter: keep only ball_by_ball updates where is_four, is_six, or is_wicket is true
        const filtered = data.items.filter((item: any) => 
          item.type === "ball_by_ball" && (item.is_four || item.is_six || item.is_wicket)
        );

        // Map filtered ball-by-ball commentary to Flip BOT FlipCard objects
        const mapped: FlipCard[] = filtered.map((item: any, index: number) => {
          let hash = 0;
          for (let i = 0; i < item.id.length; i++) {
            hash = (hash << 5) - hash + item.id.charCodeAt(i);
            hash |= 0;
          }
          const numericId = Math.abs(hash);

          // Extract over number
          const parts = item.id.split('_');
          const overNum = parts[parts.length - 1];
          const overLabel = overNum && overNum.includes('.') ? `Over ${overNum}` : 'Live';

          // Clean commentary text
          let cleanComment = item.text || "";
          cleanComment = cleanComment.replace(/^[🏏🔴🔵💥💥\s]*(WICKET!|FOUR!|SIX!)\s*/i, '').trim();

          let formattedContent = "";
          let runSymbol = "";
          if (item.is_four) {
            formattedContent = `Hye! It's a FOUR! 🎉\n${cleanComment}`;
            runSymbol = "4";
          } else if (item.is_six) {
            formattedContent = `That's a SIX! 💥\n${cleanComment}`;
            runSymbol = "6";
          } else if (item.is_wicket) {
            formattedContent = `WICKET! 🏏\n${cleanComment}`;
            runSymbol = "W";
          } else {
            formattedContent = cleanComment;
          }

          // Use mock timestamps for demo items to match design timeline exactly
          let itemTimeMs = new Date(data.fetched_at || Date.now()).getTime() - index * 1000;
          let timeStr = new Date(data.fetched_at || Date.now()).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
          });

          // Override for demo cards so they line up with the screenshots' timestamps
          if (item.id === "demo_bbb_1_20.5") {
            timeStr = "11:03 AM";
            itemTimeMs = 1793310000000; // specific mock timestamp
          } else if (item.id === "demo_bbb_2_20.2") {
            timeStr = "11:00 AM";
            itemTimeMs = 1793309820000;
          } else if (item.id === "demo_bbb_3_19.6") {
            timeStr = "10:57 AM";
            itemTimeMs = 1793309640000;
          } else if (item.id === "demo_bbb_5_19.1") {
            timeStr = "10:49 AM";
            itemTimeMs = 1793309160000;
          }

          return {
            id: numericId,
            type: 'bot',
            sport: 'cricket',
            sportEmoji: '🏏',
            sportLabel: 'Cricket',
            day: 'Today',
            time: timeStr,
            timeMs: itemTimeMs,
            author: 'Flip',
            handle: '@flip_bot',
            source: 'Roanuz Live Feed',
            content: formattedContent,
            likes: 0,
            isKey: true,
            fomoMsg: '',
            fomoCount: 0,
            ctaType: 'room',
            flipResponse: '',
            isVerified: true,
            overLabel,
            runSymbol
          } as FlipCard;
        });

        return mapped;
      }
    } catch (err) {
      console.warn("Failed to fetch live updates for FlipLine:", err);
    }
    return [];
  };

  const fetchCards = async () => {
    try {
      const fetched = await fliplineService.fetchFlipCards();
      setDbCards(fetched);
    } catch (e) {
      console.error("Failed to fetch FlipLine cards:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateLiveUpdates = async () => {
    const live = await fetchLiveTickerUpdates();
    setLiveCards(live);
  };

  useEffect(() => {
    fetchCards();
    updateLiveUpdates();

    const interval = setInterval(updateLiveUpdates, 15000);

    const handleNewPost = () => {
      fetchCards();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("flipline-post-created", handleNewPost);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("flipline-post-created", handleNewPost);
      }
    };
  }, []);

  const combinedCards = React.useMemo(() => {
    const seenIds = new Set<string | number>();
    const all = [...liveCards, ...dbCards];
    return all.filter(c => {
      if (seenIds.has(c.id)) return false;
      seenIds.add(c.id);
      return true;
    });
  }, [dbCards, liveCards]);

  return (
    <div className="w-full">
      {/* Main Toggle Button Row */}
      <div className="px-4 mb-4">
        <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner">
          <button
            onClick={() => setActiveTab("flipline")}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer"
            style={{
              background: activeTab === "flipline" ? "linear-gradient(90deg, #FF3D57, #FF7B02)" : "transparent",
              color: activeTab === "flipline" ? "#fff" : "rgba(255,255,255,0.4)",
              boxShadow: activeTab === "flipline" ? "0 4px 15px rgba(255, 61, 87, 0.25)" : "none",
              border: "none",
            }}
          >
            <span className="text-sm">⚡</span> FlipLine
          </button>
          <button
            onClick={() => setActiveTab("fliparena")}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer"
            style={{
              background: activeTab === "fliparena" ? "linear-gradient(90deg, #FF3D57, #FF7B02)" : "transparent",
              color: activeTab === "fliparena" ? "#fff" : "rgba(255,255,255,0.4)",
              boxShadow: activeTab === "fliparena" ? "0 4px 15px rgba(255, 61, 87, 0.25)" : "none",
              border: "none",
            }}
          >
            <span className="text-sm">🏟️</span> Flip Arena
          </button>
        </div>
      </div>

      {activeTab === 'fliparena' ? (
        <FlipArena
          selectedSport={selectedSport}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
          <FlipLineSection
            selectedSport={selectedSport}
            onViewFull={() => router.push('/MainModules/FlipLine')}
            cards={combinedCards}
            loading={loading}
          />
      )}
    </div>
  );
}