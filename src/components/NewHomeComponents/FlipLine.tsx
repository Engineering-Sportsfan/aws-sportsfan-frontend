import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Heart,
  MessageSquare,
  Share2,
  Play,
  Volume2,
  Sparkles,
  Send,
  Trash2,
  CornerDownRight,
  X,
  Loader2,
  Flag,
  CheckCircle2,
} from 'lucide-react';
import { fliplineService, FlipLineComment, FlipLineReply, FlipCard } from '@/services/flipline.service';
import { useAuth } from '@/context/AuthContext';
import FlipArena from './FlipArena';

export type { FlipLineComment, FlipLineReply, FlipCard };

/* ─── FlipLine shared data ─────────────────────────────────────────── */
export type ScoreChip = {
  score: string;
  status: string;
  statusType: 'live' | 'final' | 'break' | 'upcoming' | 'delay' | 'info';
};

function getGuestId(): string {
  if (typeof window === 'undefined') return 'guest_fan';
  const stored = localStorage.getItem('guest_display_name');
  if (stored) return stored.toLowerCase().replace(/\s+/g, '_');
  const name = `fan_${Math.random().toString(36).substring(2, 7)}`;
  return name;
}

function formatCommentTimestamp(createdAt?: number | string, fallbackTime?: string): string {
  if (!createdAt && !fallbackTime) return 'Just now';
  if (!createdAt) return fallbackTime || 'Just now';

  const timestamp = typeof createdAt === 'string' ? Number(createdAt) || Date.parse(createdAt) : createdAt;
  if (!timestamp || isNaN(timestamp)) return fallbackTime || 'Just now';

  const diffMs = Date.now() - timestamp;
  if (diffMs < 60000) return 'Just now';

  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function renderFormattedContent(content: string) {
  if (!content) return null;
  const parts = content.split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span
          key={index}
          className="text-pink-500 font-bold hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    if (part.startsWith('@')) {
      return (
        <span
          key={index}
          className="text-sky-400 font-bold hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function FlipLineSection({
  selectedSport,
  onViewFull,
  cards,
  loading,
  onCardUpdate,
}: {
  selectedSport: string;
  onViewFull: () => void;
  cards: FlipCard[];
  loading: boolean;
  onCardUpdate?: (updatedCard: FlipCard) => void;
}) {
  const [density, setDensity] = useState<'full' | 'key'>('full');
  const [askOpen, setAskOpen] = useState<number | string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700 }}>
          Loading moments... ⚡
        </span>
      </div>
    );
  }

  const safeCards = Array.isArray(cards) ? cards : [];
  let displayCards = density === 'key' ? safeCards.filter((c) => c?.isKey) : safeCards;

  // Apply hashtag filter chips
  if (activeFilter === 'cricket') {
    displayCards = displayCards.filter((c) => (c.sport || '').toLowerCase() === 'cricket');
  } else if (activeFilter === 'football') {
    displayCards = displayCards.filter((c) => (c.sport || '').toLowerCase() === 'football');
  } else if (activeFilter === 'athletics') {
    displayCards = displayCards.filter((c) => (c.sport || '').toLowerCase() === 'athletics');
  } else if (activeFilter === 'analysts') {
    const filtered = displayCards.filter(
      (c) =>
        c.type === 'expert' ||
        c.type === 'analyst' ||
        c.type === 'bot' ||
        c.author?.toLowerCase().includes('analyst') ||
        c.source?.toLowerCase().includes('analyst') ||
        c.tags?.some((t) => t.toLowerCase().includes('analyst'))
    );
    if (filtered.length > 0) displayCards = filtered;
  }
  // else if (activeFilter === 'sf360-live') {
  //   const filtered = displayCards.filter(
  //     (c) =>
  //       c.source?.toLowerCase().includes('live') ||
  //       c.source?.toLowerCase().includes('roanuz') ||
  //       c.type === 'bot' ||
  //       c.isKey ||
  //       c.tags?.some((t) => t.toLowerCase().includes('live'))
  //   );
  //   if (filtered.length > 0) displayCards = filtered;
  // } else if (activeFilter === 'fan-roar') {
  //   const filtered = displayCards.filter(
  //     (c) =>
  //       c.type === 'fan' ||
  //       c.ctaType === 'room' ||
  //       c.source?.toLowerCase().includes('roar') ||
  //       c.tags?.some((t) => t.toLowerCase().includes('roar'))
  //   );
  //   if (filtered.length > 0) displayCards = filtered;
  // }
  else if (selectedSport && selectedSport !== 'mixed') {
    displayCards = displayCards.filter((c) => (c.sport || '').toLowerCase() === selectedSport.toLowerCase());
  }

  return (
    <div className="mb-5">
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

          // { id: 'sf360-live', label: '#sf360-live', emoji: '📡' },
          // { id: 'fan-roar', label: '#fan-roar', emoji: '🔥' },
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
      <FlipTimeline
        cards={displayCards}
        previewLimit={4}
        askOpen={askOpen}
        setAskOpen={setAskOpen}
        onCardUpdate={onCardUpdate}
      />

      {/* View Full button */}
      <div style={{ paddingLeft: 14, paddingRight: 14, marginTop: 6 }}>
        <button
          onClick={onViewFull}
          className="w-full py-[11px] rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(255,255,255,0.55)' }}>
            View Full FlipLine
          </span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─── FlipLine full-page screen ─────────────────────────────────────── */
export function FlipLineFullScreen({
  onBack,
  selectedSport = 'mixed',
  cards,
  loading,
  onCardUpdate,
}: {
  onBack: () => void;
  selectedSport?: string;
  cards: FlipCard[];
  loading: boolean;
  onCardUpdate?: (updatedCard: FlipCard) => void;
}) {
  const [density, setDensity] = useState<'full' | 'key'>('full');
  const [askOpen, setAskOpen] = useState<number | string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (loading) {
    return (
      <div
        style={{
          height: '100dvh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgb(7,11,20)',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 700 }}>
          Loading moments... ⚡
        </span>
      </div>
    );
  }

  const safeCards = Array.isArray(cards) ? cards : [];
  let displayCards = density === 'key' ? safeCards.filter((c) => c?.isKey) : safeCards;

  // Apply hashtag filter chips
  if (activeFilter === 'cricket') {
    displayCards = displayCards.filter((c) => (c.sport || '').toLowerCase() === 'cricket');
  } else if (activeFilter === 'football') {
    displayCards = displayCards.filter((c) => (c.sport || '').toLowerCase() === 'football');
  } else if (activeFilter === 'athletics') {
    displayCards = displayCards.filter((c) => (c.sport || '').toLowerCase() === 'athletics');
  } else if (activeFilter === 'analysts') {
    const filtered = displayCards.filter(
      (c) =>
        c.type === 'expert' ||
        c.type === 'analyst' ||
        c.type === 'bot' ||
        c.author?.toLowerCase().includes('analyst') ||
        c.source?.toLowerCase().includes('analyst') ||
        c.tags?.some((t) => t.toLowerCase().includes('analyst'))
    );
    if (filtered.length > 0) displayCards = filtered;
  }
  // else if (activeFilter === 'sf360-live') {
  //   const filtered = displayCards.filter(
  //     (c) =>
  //       c.source?.toLowerCase().includes('live') ||
  //       c.source?.toLowerCase().includes('roanuz') ||
  //       c.type === 'bot' ||
  //       c.isKey ||
  //       c.tags?.some((t) => t.toLowerCase().includes('live'))
  //   );
  //   if (filtered.length > 0) displayCards = filtered;
  // } else if (activeFilter === 'fan-roar') {
  //   const filtered = displayCards.filter(
  //     (c) =>
  //       c.type === 'fan' ||
  //       c.ctaType === 'room' ||
  //       c.source?.toLowerCase().includes('roar') ||
  //       c.tags?.some((t) => t.toLowerCase().includes('roar'))
  //   );
  //   if (filtered.length > 0) displayCards = filtered;
  // }
  else if (selectedSport && selectedSport !== 'mixed') {
    displayCards = displayCards.filter((c) => (c.sport || '').toLowerCase() === selectedSport.toLowerCase());
  }

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgb(7,11,20)',
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '13px 16px 11px',
          background: 'rgba(7,11,20,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={onBack}
          className="p-1 text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: -0.5 }}>
              FlipLine
            </span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                background: 'linear-gradient(90deg,rgb(255,45,85),rgb(255,122,0))',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 99,
                letterSpacing: 0.5,
              }}
            >
              LIVE
            </span>
          </div>
          <div
            style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.35)',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>🏏 Cricket</span>
            <span>⚽ Football</span>
            <span>🏃 Athletics</span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            borderRadius: 99,
            padding: 2,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          {(['full', 'key'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              style={{
                padding: '3px 11px',
                borderRadius: 99,
                fontSize: 9.5,
                fontWeight: 800,
                background: density === d ? 'rgba(168,85,247,0.85)' : 'transparent',
                color: density === d ? 'white' : 'rgba(255,255,255,0.38)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
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
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          gap: 14,
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          alignItems: 'center',
        }}
      >
        {(
          [
            { c: 'rgb(168,85,247)', l: 'Analyst' },
            { c: 'rgb(233,30,140)', l: 'Fan ROAR' },
            { c: 'rgb(255,107,53)', l: 'SF360 Drop' },
          ] as const
        ).map(({ c, l }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: c,
                boxShadow: `0 0 6px ${c}aa`,
              }}
            />
            <span style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
              {l}
            </span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.22)', fontWeight: 600 }}>
          Newest first
        </span>
      </div>

      {/* Scrollable timeline */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 16, paddingBottom: 32 }}>
        <FlipTimeline
          cards={displayCards}
          askOpen={askOpen}
          setAskOpen={setAskOpen}
          onCardUpdate={onCardUpdate}
        />
        {/* Start-of-coverage marker */}
        <div style={{ paddingLeft: 14, paddingTop: 8, display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 44,
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            />
          </div>
          <span
            style={{
              paddingLeft: 10,
              fontSize: 10,
              color: 'rgba(255,255,255,0.28)',
              fontWeight: 700,
            }}
          >
            Start of coverage · Day 1 · 10:30 AM
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── FlipTimeline detailed timeline view ───────────────────────────── */
interface FlipTimelineProps {
  cards: FlipCard[];
  previewLimit?: number;
  askOpen: number | string | null;
  setAskOpen: (id: number | string | null) => void;
  onCardUpdate?: (updatedCard: FlipCard) => void;
}

const DolphinIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-cyan-400 shrink-0 mr-1"
  >
    <path d="M21.9 8.2c-.4-.8-1.1-1.4-1.9-1.8-1.1-.5-2.3-.6-3.5-.5-1.2.1-2.4.5-3.5 1.1-1.6.9-2.9 2.2-3.8 3.8-.5.9-.9 1.9-1.1 3-.1.5-.1 1 0 1.5.1.5.3 1 .6 1.4.3.4.8.7 1.3.8.5.1 1 0 1.5-.1.9-.3 1.7-.8 2.4-1.4.8-.7 1.4-1.5 1.9-2.4.9-1.6 1.3-3.4 1.3-5.2 0-.2 0-.4-.1-.6l1.2-1.2c.4-.4.9-.7 1.5-.8.6-.1 1.2 0 1.7.3.5.3 1 .8 1.2 1.4.2.6.2 1.2 0 1.8-.2.6-.6 1.1-1.1 1.5z" />
  </svg>
);

export function FlipCardItem({
  card,
  index,
  totalCards,
  askOpen,
  setAskOpen,
  typeColorMap,
  typeLabelMap,
  router,
  handleCtaClick,
  onCardUpdate,
}: {
  card: FlipCard;
  index: number;
  totalCards: number;
    askOpen: number | string | null;
    setAskOpen: (id: number | string | null) => void;
  typeColorMap: Record<string, string>;
  typeLabelMap: Record<string, string>;
  router: any;
    handleCtaClick: (ctaType: 'room' | 'watchalong' | 'drop' | string) => void;
    onCardUpdate?: (updatedCard: FlipCard) => void;
}) {
  const { user, getUserName, getUserDisplayName } = useAuth();
  const currentUserId =
    user?.userId || user?.actualUserId || user?.email || getGuestId();
  const currentUserName = user?.name || getUserDisplayName?.() || 'Fan';
  const currentUserHandle = user?.name
    ? `@${user.name.toLowerCase().replace(/\s+/g, '')}`
    : '@fan';
  const currentUserAdminPhoto = user?.addfliplineAdminPhoto || undefined;
  const currentUserAuthorPhoto = user?.avatar || user?.photoURL || undefined;
  const currentUserAvatar = currentUserAdminPhoto || currentUserAuthorPhoto || undefined;

  const currentUserEmail = user?.email;
  const isCurrentUser =
    (currentUserEmail && card.email && currentUserEmail.toLowerCase() === card.email.toLowerCase()) ||
    (card.userId && currentUserId && card.userId === currentUserId);
  const rawAuthor = isCurrentUser ? 'You' : card.author === 'You' ? 'Fan' : card.author;
  const displayAuthor = rawAuthor
    ? rawAuthor
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    : '';
  const displayHandle = isCurrentUser ? '@you' : card.handle === '@you' ? '@fan' : card.handle;
  const displayPhoto = card.adminPhoto || card.authorPhoto || (isCurrentUser ? (currentUserAdminPhoto || currentUserAuthorPhoto) : undefined);

  // Card like state
  const [likesCount, setLikesCount] = useState<number>(Number(card.likes) || 0);
  const [likedByList, setLikedByList] = useState<string[]>(Array.isArray(card.likedBy) ? card.likedBy : []);
  const isLiked = currentUserId ? likedByList.includes(currentUserId) : false;
  const [isLikingCard, setIsLikingCard] = useState(false);

  // Sync like state if card prop changes
  useEffect(() => {
    setLikesCount(Number(card.likes) || 0);
    setLikedByList(Array.isArray(card.likedBy) ? card.likedBy : []);
  }, [card.likes, card.likedBy]);

  // AI query states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(card.flipResponse || '');
  const [loadingAi, setLoadingAi] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Comments and Replies states
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<FlipLineComment[]>(
    Array.isArray(card.comments) ? card.comments : []
  );
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Active reply state
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Report state (UI only)
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedReportTag, setSelectedReportTag] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Sync comments list if card prop changes
  useEffect(() => {
    if (Array.isArray(card.comments)) {
      setCommentsList(card.comments);
    }
  }, [card.comments]);

  const cardSk = card.sk || `CARD#${card.timeMs}#${card.id}`;

  // ── 1. Card Like / Unlike Handler ──────────────────────────────────────────
  const handleLikeCard = async () => {
    if (isLikingCard) return;
    setIsLikingCard(true);

    const action = isLiked ? 'unlike' : 'like';
    const nextLiked = !isLiked;
    const nextLikes = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    const nextLikedBy = nextLiked
      ? [...likedByList, currentUserId]
      : likedByList.filter((id) => id !== currentUserId);

    // Optimistic UI update
    setLikesCount(nextLikes);
    setLikedByList(nextLikedBy);

    const updatedCard: FlipCard = {
      ...card,
      likes: nextLikes,
      likedBy: nextLikedBy,
    };
    onCardUpdate?.(updatedCard);

    try {
      const res = await fliplineService.likeFlipCard(cardSk, action, currentUserId);
      if (res && typeof res.likes === 'number') {
        setLikesCount(res.likes);
        if (Array.isArray(res.likedBy)) {
          setLikedByList(res.likedBy);
          onCardUpdate?.({
            ...updatedCard,
            likes: res.likes,
            likedBy: res.likedBy,
          });
        }
      }
    } catch (e) {
      console.error('Failed to update card like in backend:', e);
      // Revert on error
      setLikesCount(likesCount);
      setLikedByList(likedByList);
      onCardUpdate?.(card);
    } finally {
      setIsLikingCard(false);
    }
  };

  // ── 2. Add Top-Level Comment ───────────────────────────────────────────────
  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text || isSubmittingComment) return;

    setIsSubmittingComment(true);
    setCommentText('');

    const optimisticComment: FlipLineComment = {
      id: `c_temp_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      userHandle: currentUserHandle,
      adminPhoto: currentUserAdminPhoto,
      authorPhoto: currentUserAuthorPhoto,
      userAvatar: currentUserAvatar,
      content: text,
      time: 'Just now',
      createdAt: Date.now(),
      likes: 0,
      likedBy: [],
      replies: [],
    };

    const nextComments = [...commentsList, optimisticComment];
    setCommentsList(nextComments);

    try {
      const res = await fliplineService.addComment(cardSk, {
        content: text,
        userId: currentUserId,
        userName: currentUserName,
        userHandle: currentUserHandle,
        adminPhoto: currentUserAdminPhoto,
        authorPhoto: currentUserAuthorPhoto,
        userAvatar: currentUserAvatar,
      });

      if (res?.success && Array.isArray(res.comments)) {
        setCommentsList(res.comments);
        onCardUpdate?.({
          ...card,
          comments: res.comments,
        });
      }
    } catch (e) {
      console.error('Failed to add comment to backend:', e);
      // Revert optimistic addition on error
      setCommentsList(commentsList);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // ── 3. Delete Top-Level Comment ────────────────────────────────────────────
  const handleDeleteComment = async (commentId: string) => {
    const nextComments = commentsList.filter((c) => c.id !== commentId);
    setCommentsList(nextComments);

    try {
      const res = await fliplineService.deleteComment(cardSk, commentId);
      if (res?.success && Array.isArray(res.comments)) {
        setCommentsList(res.comments);
        onCardUpdate?.({
          ...card,
          comments: res.comments,
        });
      }
    } catch (e) {
      console.error('Failed to delete comment from backend:', e);
      setCommentsList(commentsList);
    }
  };

  // ── 4. Like / Unlike Comment ───────────────────────────────────────────────
  const handleLikeComment = async (comment: FlipLineComment) => {
    const commentLiked = (comment.likedBy || []).includes(currentUserId);
    const action = commentLiked ? 'unlike_comment' : 'like_comment';

    const nextLikedBy = commentLiked
      ? (comment.likedBy || []).filter((u) => u !== currentUserId)
      : [...(comment.likedBy || []), currentUserId];
    const nextLikes = commentLiked ? Math.max(0, (comment.likes || 1) - 1) : (comment.likes || 0) + 1;

    const nextComments = commentsList.map((c) =>
      c.id === comment.id
        ? {
          ...c,
          likes: nextLikes,
          likedBy: nextLikedBy,
        }
        : c
    );
    setCommentsList(nextComments);

    try {
      const res = await fliplineService.likeComment(cardSk, comment.id, action, currentUserId);
      if (res?.success && Array.isArray(res.comments)) {
        setCommentsList(res.comments);
        onCardUpdate?.({
          ...card,
          comments: res.comments,
        });
      }
    } catch (e) {
      console.error('Failed to like/unlike comment in backend:', e);
      setCommentsList(commentsList);
    }
  };

  // ── 5. Add Nested Reply ───────────────────────────────────────────────────
  const handleAddReply = async (targetComment: FlipLineComment) => {
    const text = replyText.trim();
    if (!text || isSubmittingReply) return;

    setIsSubmittingReply(true);
    setReplyText('');
    setReplyingToCommentId(null);

    const optimisticReply: FlipLineReply = {
      id: `r_temp_${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      userHandle: currentUserHandle,
      adminPhoto: currentUserAdminPhoto,
      authorPhoto: currentUserAuthorPhoto,
      userAvatar: currentUserAvatar,
      content: text,
      replyTo: targetComment.userHandle || targetComment.userName,
      time: 'Just now',
      createdAt: Date.now(),
      likes: 0,
      likedBy: [],
    };

    const nextComments = commentsList.map((c) =>
      c.id === targetComment.id
        ? {
          ...c,
          replies: [...(c.replies || []), optimisticReply],
        }
        : c
    );
    setCommentsList(nextComments);

    try {
      const res = await fliplineService.addReply(cardSk, {
        commentId: targetComment.id,
        content: text,
        replyTo: targetComment.userHandle || targetComment.userName,
        userId: currentUserId,
        userName: currentUserName,
        userHandle: currentUserHandle,
        adminPhoto: currentUserAdminPhoto,
        authorPhoto: currentUserAuthorPhoto,
        userAvatar: currentUserAvatar,
      });

      if (res?.success && Array.isArray(res.comments)) {
        setCommentsList(res.comments);
        onCardUpdate?.({
          ...card,
          comments: res.comments,
        });
      }
    } catch (e) {
      console.error('Failed to add reply in backend:', e);
      setCommentsList(commentsList);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // ── 6. Delete Nested Reply ─────────────────────────────────────────────────
  const handleDeleteReply = async (commentId: string, replyId: string) => {
    const nextComments = commentsList.map((c) =>
      c.id === commentId
        ? {
          ...c,
          replies: (c.replies || []).filter((r) => r.id !== replyId),
        }
        : c
    );
    setCommentsList(nextComments);

    try {
      const res = await fliplineService.deleteReply(cardSk, commentId, replyId);
      if (res?.success && Array.isArray(res.comments)) {
        setCommentsList(res.comments);
        onCardUpdate?.({
          ...card,
          comments: res.comments,
        });
      }
    } catch (e) {
      console.error('Failed to delete reply in backend:', e);
      setCommentsList(commentsList);
    }
  };

  // ── 7. Like / Unlike Nested Reply ──────────────────────────────────────────
  const handleLikeReply = async (commentId: string, reply: FlipLineReply) => {
    const replyLiked = (reply.likedBy || []).includes(currentUserId);
    const action = replyLiked ? 'unlike_reply' : 'like_reply';

    const nextLikedBy = replyLiked
      ? (reply.likedBy || []).filter((u) => u !== currentUserId)
      : [...(reply.likedBy || []), currentUserId];
    const nextLikes = replyLiked ? Math.max(0, (reply.likes || 1) - 1) : (reply.likes || 0) + 1;

    const nextComments = commentsList.map((c) =>
      c.id === commentId
        ? {
          ...c,
          replies: (c.replies || []).map((r) =>
            r.id === reply.id
              ? {
                ...r,
                likes: nextLikes,
                likedBy: nextLikedBy,
              }
              : r
          ),
        }
        : c
    );
    setCommentsList(nextComments);

    try {
      const res = await fliplineService.likeReply(cardSk, commentId, reply.id, action, currentUserId);
      if (res?.success && Array.isArray(res.comments)) {
        setCommentsList(res.comments);
        onCardUpdate?.({
          ...card,
          comments: res.comments,
        });
      }
    } catch (e) {
      console.error('Failed to like/unlike reply in backend:', e);
      setCommentsList(commentsList);
    }
  };

  // ── 8. AI Ask Flip Handler ─────────────────────────────────────────────────
  const handleAskFlip = async () => {
    if (!question.trim() || loadingAi) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Context moment: "${card.content}". Question about this moment: "${question}". Answer this question in a short, engaging sports fan format under 180 characters.`,
        }),
      });
      if (!res.ok) throw new Error('API call failed');
      const data = await res.json();
      setAnswer(data.answer || 'No response received.');
      setQuestion('');
    } catch (e) {
      console.error('Failed to ask Flip:', e);
      setAnswer('Something went wrong — please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleShare = (c: FlipCard) => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `FlipLine from ${c.author}`,
          text: c.content,
          url: window.location.href,
        })
        .catch((err) => console.log(err));
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`"${c.content}" - ${c.author} on Sportsfan360`);
      alert('Link copied to clipboard!');
    }
  };

  // ── 9. Report Post Handler (UI Only) ────────────────────────────────────────
  const handleSendReport = () => {
    if (!reportReason.trim() && !selectedReportTag) return;
    setIsSubmittingReport(true);
    setTimeout(() => {
      setIsSubmittingReport(false);
      setReportSubmitted(true);
      setReportReason('');
      setSelectedReportTag(null);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportOpen(false);
      }, 2500);
    }, 600);
  };

  // ── 10. Open User Profile Navigation ─────────────────────────────────────────
  const handleOpenAuthorProfile = () => {
    if (card.type === 'bot') {
      const botName = card.author === 'Flip' ? 'Dolly' : card.author;
      router.push(`/MainModules/ROAR?profileUserId=${encodeURIComponent(botName)}`);
      return;
    }

    const targetUser =
      card.userId ||
      card.email ||
      (card.handle && card.handle !== '@fan' && card.handle !== '@you' ? card.handle.replace(/^@/, '') : null) ||
      (card.author && card.author !== 'Fan' && card.author !== 'You' ? card.author : null) ||
      (isCurrentUser ? (currentUserEmail || currentUserId) : null);

    if (targetUser) {
      router.push(`/MainModules/ROAR?profileUserId=${encodeURIComponent(targetUser)}`);
    } else {
      router.push('/MainModules/ROAR');
    }
  };

  const handleOpenUserProfile = (targetUserId?: string, targetHandle?: string, targetName?: string) => {
    const targetUser =
      targetUserId ||
      (targetHandle && targetHandle !== '@fan' && targetHandle !== '@you' ? targetHandle.replace(/^@/, '') : null) ||
      (targetName && targetName !== 'Fan' && targetName !== 'You' ? targetName : null) ||
      (currentUserEmail || currentUserId);

    if (targetUser) {
      router.push(`/MainModules/ROAR?profileUserId=${encodeURIComponent(targetUser)}`);
    } else {
      router.push('/MainModules/ROAR');
    }
  };

  // Total comment count = sum of comments + sum of replies
  const totalCommentsCount = commentsList.reduce(
    (acc, c) => acc + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
    0
  );

  const isExpanded = askOpen === card.id;
  const themeColor = typeColorMap[card.type] || '#3b82f6';
  const themeLabel = typeLabelMap[card.type] || card.type;

  return (
    <div className="flex w-full relative mb-8">
      {/* Left timeline axis */}
      <div className="w-[70px] shrink-0 flex flex-col items-center pt-1 relative">
        {(() => {
          const parts = (card.time || '').split(' ');
          if (parts.length >= 2) {
            return (
              <>
                <span className="text-[15px] font-black text-white leading-none">{parts[0]}</span>
                <span className="text-[9px] font-bold text-white/40 leading-none mt-1 uppercase tracking-wider">
                  {parts.slice(1).join(' ')}
                </span>
              </>
            );
          }
          return (
            <span className="text-[12px] font-extrabold text-white leading-tight text-center break-words max-w-[60px]">
              {card.time || 'Live'}
            </span>
          );
        })()}

        {/* Dot */}
        <div
          className="w-3 h-3 rounded-full bg-white border border-white/20 relative z-10 mt-3"
          style={{
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
          }}
        />

        {/* Vertical Line */}
        {index < totalCards - 1 && (
          <div
            className="absolute w-[1px] bg-white/10"
            style={{
              top: '52px',
              bottom: '-32px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        )}
      </div>

      {/* Right card container */}
      <div className="flex-1 pr-4 pb-2 min-w-0">
        <div className="transition-all duration-300 relative flex flex-col gap-3.5 w-full bg-[#161b22]/50 border border-[#21262d] rounded-2xl p-4 shadow-md backdrop-blur-sm">
          {/* Row 1: Author info */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              {card.type === 'bot' ? (
                <img
                  src="/images/dolly.png"
                  alt="Flip BOT"
                  onClick={handleOpenAuthorProfile}
                  className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0 bg-blue-500/10 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                  title="View Profile"
                />
              ) : displayPhoto ? (
                <img
                  src={typeof displayPhoto === 'object' ? displayPhoto.src : displayPhoto}
                  alt={displayAuthor}
                  onClick={handleOpenAuthorProfile}
                  className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                  title="View Profile"
                />
              ) : (
                <div
                  onClick={handleOpenAuthorProfile}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-[12px] shrink-0 uppercase tracking-wider cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}, #0f172a)`,
                  }}
                  title="View Profile"
                >
                  {displayAuthor
                    ? displayAuthor
                      .trim()
                      .split(/\s+/)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                    : 'F'}
                </div>
              )}

              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={handleOpenAuthorProfile}
                    className="font-extrabold text-[13.5px] text-white leading-tight truncate cursor-pointer hover:text-sky-400 hover:underline transition-colors"
                  >
                    {card.type === 'bot' ? 'Flip' : displayAuthor}
                  </span>
                  {card.type === 'bot' ? (
                    <span className="inline-flex items-center justify-center bg-blue-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0">
                      BOT
                    </span>
                  ) : (
                    card.isVerified && (
                      <span
                        className="inline-flex items-center justify-center bg-[#1d9bf0] text-white rounded-full shrink-0"
                        style={{ width: 14, height: 14 }}
                        title="Verified Admin"
                      >
                        <svg
                          className="w-2.5 h-2.5 fill-none stroke-current"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )
                  )}
                  {card.type !== 'bot' && displayHandle && (
                    <span
                      onClick={handleOpenAuthorProfile}
                      className="text-[11px] text-white/40 truncate cursor-pointer hover:text-white/70 transition-colors"
                    >
                      {displayHandle}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase"
                    style={{
                      background:
                        card.type === 'bot'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : `${themeColor}1f`,
                      color: card.type === 'bot' ? 'rgb(96, 165, 250)' : themeColor,
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
                  background:
                    card.runSymbol === '4'
                      ? 'radial-gradient(circle, #2563eb, #1d4ed8)'
                      : card.runSymbol === '6'
                        ? 'radial-gradient(circle, #16a34a, #15803d)'
                        : card.runSymbol === 'W'
                          ? 'radial-gradient(circle, #dc2626, #b91c1c)'
                          : 'radial-gradient(circle, #ea580c, #c2410c)',
                  boxShadow:
                    card.runSymbol === '4'
                      ? '0 0 8px rgba(37, 99, 235, 0.6)'
                      : card.runSymbol === '6'
                        ? '0 0 8px rgba(22, 163, 74, 0.6)'
                        : card.runSymbol === 'W'
                          ? '0 0 8px rgba(220, 38, 38, 0.6)'
                          : '0 0 8px rgba(234, 88, 12, 0.6)',
                }}
              >
                {card.runSymbol}
              </div>
            )}
          </div>

          {/* Row 2: Card Content */}
          <p className="text-[14px] font-medium text-white/90 leading-relaxed break-words whitespace-pre-line">
            {renderFormattedContent(card.content)}
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullscreen(true);
                    }}
                    className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/85 transition-all duration-200 active:scale-90 cursor-pointer opacity-0 group-hover:opacity-100"
                    title="View Fullscreen"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </>
              ) : card.mediaType === 'audio' && !card.image ? (
                <div className="w-full h-[64px] bg-gradient-to-r from-purple-950/50 via-slate-900 to-purple-950/50 relative flex items-center px-4 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                      <Volume2 size={15} />
                    </div>
                    <div className="flex-1 flex items-center gap-[2.5px] h-4">
                        {[30, 80, 45, 90, 60, 35, 75, 40, 65, 80, 50, 70, 45, 85, 30, 60, 45, 90, 55, 35].map(
                          (h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-white/30 rounded-full"
                              style={{ height: `${h}%` }}
                            />
                          )
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                      {card.image && (
                        <img
                          src={typeof card.image === 'object' ? card.image.src : card.image}
                          alt="Moment media"
                          className="w-full h-full object-cover max-h-[220px] cursor-zoom-in"
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

                      {(card.image || card.mediaType === 'video') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFullscreen(true);
                          }}
                          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/85 transition-all duration-200 active:scale-90 cursor-pointer opacity-0 group-hover:opacity-100"
                          title="View Fullscreen"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="15 3 21 3 21 9" />
                            <polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" />
                            <line x1="3" y1="21" x2="10" y2="14" />
                          </svg>
                        </button>
                      )}
                </>
              )}
            </div>
          )}

          {/* Row 3: Tags (only if not already in post content) */}
          {(() => {
            const extraTags = (card.tags || []).filter(
              (t) => !card.content || !card.content.toLowerCase().includes(t.toLowerCase())
            );
            if (extraTags.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-2 mt-0.5">
                {extraTags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-bold text-pink-500 hover:underline cursor-pointer"
                  >
                    {t}
                  </span>
                ))}
              </div>
            );
          })()}

          {/* Row 4: FOMO Banner */}
          {/* {card.fomoMsg && (
            <div
              className="flex items-center justify-between gap-3 rounded-2xl p-3 bg-[#0d0a14] border border-pink-500/15"
              style={{
                borderColor: `${themeColor}2a`,
                background: `linear-gradient(135deg, rgba(7, 11, 20, 0.98), rgba(15, 10, 25, 0.6))`,
              }}
            >
              <p className="text-[12px] font-semibold text-white/85 leading-snug">🔥 {card.fomoMsg}</p>
              <button
                onClick={() => handleCtaClick(card.ctaType || 'room')}
                className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-extrabold text-white transition-all active:scale-95 cursor-pointer"
                style={{
                  background:
                    card.ctaType === 'room'
                      ? 'linear-gradient(135deg, #E91E8C, #FF6B35)'
                      : card.ctaType === 'watchalong'
                        ? 'linear-gradient(135deg, #7c3aed, #E91E8C)'
                        : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                }}
              >
                {card.ctaType === 'room' && 'Join Room →'}
                {card.ctaType === 'watchalong' && 'Watch Along →'}
                {card.ctaType === 'drop' && 'Claim Drop →'}
                {!['room', 'watchalong', 'drop'].includes(card.ctaType || '') && 'Explore →'}
              </button>
            </div>
          )} */}

          {/* Row 5: Action buttons (Like, Comment, Share, Flip) */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4">
              {/* Card Like Button */}
              <button
                onClick={handleLikeCard}
                className={`flex items-center gap-2 transition-colors cursor-pointer ${isLiked ? 'text-rose-500' : 'text-white/40 hover:text-rose-500'
                  }`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  size={16}
                  fill={isLiked ? 'rgb(244, 63, 94)' : 'none'}
                  className={`transition-all duration-200 ${isLiked ? 'text-rose-500 scale-110' : ''}`}
                />
                <span className="text-[12.5px] font-extrabold leading-none">{likesCount}</span>
              </button>

              {/* Comment Toggle Button */}
              <button
                onClick={() => setCommentOpen((prev) => !prev)}
                className={`flex items-center gap-2 transition-all cursor-pointer ${
                  commentOpen ? 'text-sky-400 font-black' : 'text-white/40 hover:text-sky-400'
                }`}
                title="Comments"
              >
                <MessageSquare
                  size={15}
                  fill={commentOpen ? 'rgba(56, 189, 248, 0.2)' : 'none'}
                  className={`transition-all duration-200 ${commentOpen ? 'scale-110' : ''}`}
                />
                <span className="text-[12.5px] font-extrabold leading-none">{totalCommentsCount}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={() => handleShare(card)}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                title="Share"
              >
                <Share2 size={15} />
                {/* <span className="text-[12.5px] font-extrabold leading-none">Share</span> */}
              </button>

              {/* Report Button */}
              <button
                onClick={() => {
                  setReportOpen((prev) => !prev);
                  if (!reportOpen && commentOpen) setCommentOpen(false);
                }}
                className={`flex items-center gap-2 transition-all cursor-pointer ${reportOpen ? 'text-amber-400 font-black' : 'text-white/40 hover:text-amber-400'
                  }`}
                title="Report Post"
              >
                <Flag
                  size={14}
                  fill={reportOpen ? 'rgba(251, 191, 36, 0.2)' : 'none'}
                  className={`transition-all duration-200 ${reportOpen ? 'scale-110' : ''}`}
                />
              </button>
            </div>

            {/* AI Dolphin button */}
            <button
              onClick={() => setAskOpen(isExpanded ? null : card.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all duration-300 cursor-pointer"
              style={{
                background: isExpanded ? `${themeColor}22` : 'rgba(255, 255, 255, 0.03)',
                borderColor: isExpanded ? themeColor : 'rgba(255, 255, 255, 0.1)',
                color: isExpanded ? themeColor : '#fff',
                boxShadow: isExpanded ? `0 0 10px ${themeColor}33` : 'none',
              }}
            >
              <DolphinIcon />
              <span>{isExpanded ? 'Flipped' : 'Ask Flip'}</span>
            </button>
          </div>

          {/* ── Expanded Report Section ───────────────────────────────────── */}
          <AnimatePresence>
            {reportOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Flag size={13} className="text-amber-400" />
                      <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest">
                        Report Post
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setReportOpen(false);
                        setReportSubmitted(false);
                      }}
                      className="text-white/30 hover:text-white transition-colors cursor-pointer p-0.5"
                      title="Close"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {reportSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[12px] font-semibold flex items-center gap-2"
                    >
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>Report submitted. Thank you for keeping our community safe!</span>
                    </motion.div>
                  ) : (
                    <>
                      {/* Quick reason chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {['Spam', 'Harassment', 'Hate Speech', 'Misinformation', 'Other'].map((tag) => {
                          const isSel = selectedReportTag === tag;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setSelectedReportTag(isSel ? null : tag)}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${isSel
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                                  : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:text-white/80 hover:bg-white/[0.08]'
                                }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                      {/* Report Input Field */}
                      <div className="flex items-center gap-2 w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 pl-3 focus-within:border-amber-500/50 transition-all">
                        <input
                          type="text"
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          placeholder="Write reason to report..."
                          className="flex-1 bg-transparent text-[12.5px] text-white placeholder:text-white/35 outline-none font-medium"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReport();
                            }
                          }}
                        />
                        <button
                          onClick={handleSendReport}
                          disabled={(!reportReason.trim() && !selectedReportTag) || isSubmittingReport}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[11.5px] font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
                          title="Send report"
                        >
                          {isSubmittingReport ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <>
                              <span>Send</span>
                              <Send size={12} className="ml-0.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Expanded Comment & Reply Section ──────────────────────────── */}
          <AnimatePresence>
            {commentOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-sky-400" />
                      <span className="text-[11px] font-black text-sky-300 uppercase tracking-widest">
                        Comments {totalCommentsCount > 0 ? `(${totalCommentsCount})` : ''}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30 font-semibold">
                      Join the discussion
                    </span>
                  </div>

                  {/* Top-level Comment Input */}
                  <div className="flex items-center gap-2 w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 pl-3 focus-within:border-sky-500/50 transition-all">
                    {currentUserAvatar ? (
                      <img
                        src={
                          typeof currentUserAvatar === 'object' && currentUserAvatar
                            ? (currentUserAvatar as any).src
                            : currentUserAvatar
                        }
                        alt="You"
                        onClick={() => handleOpenUserProfile()}
                        className="w-6 h-6 rounded-full object-cover border border-sky-400/30 shrink-0 cursor-pointer hover:opacity-80 transition-all"
                        title="Your Profile"
                      />
                    ) : (
                      <div
                        onClick={() => handleOpenUserProfile()}
                        className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 uppercase cursor-pointer hover:opacity-80 transition-all"
                        title="Your Profile"
                      >
                        {currentUserName ? currentUserName.trim().charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-transparent text-[12.5px] text-white placeholder:text-white/35 outline-none font-medium"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="w-8 h-8 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0 shadow-[0_2px_8px_rgba(56,189,248,0.25)]"
                      title="Send comment"
                    >
                      {isSubmittingComment ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                          <Send size={13} className="ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Comments List */}
                  {commentsList.length > 0 ? (
                    <div className="flex flex-col gap-2.5 mt-1">
                      {commentsList.map((comm) => {
                        const isCommentAuthor =
                          (comm.userId && currentUserId && comm.userId === currentUserId) ||
                          comm.userName === currentUserName;
                        const commPhoto =
                          comm.adminPhoto ||
                          comm.authorPhoto ||
                          comm.userAvatar ||
                          (isCommentAuthor ? currentUserAvatar : undefined);
                        const commLiked = (comm.likedBy || []).includes(currentUserId);
                        const isReplying = replyingToCommentId === comm.id;
                        const replies = Array.isArray(comm.replies) ? comm.replies : [];

                        return (
                          <div
                            key={comm.id}
                            className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3 flex flex-col gap-2 transition-all hover:border-white/[0.09]"
                          >
                            {/* Comment Header */}
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2 min-w-0">
                                {commPhoto ? (
                                  <img
                                    src={typeof commPhoto === 'object' && commPhoto ? (commPhoto as any).src : commPhoto}
                                    alt={comm.userName}
                                    onClick={() => handleOpenUserProfile(comm.userId, comm.userHandle, comm.userName)}
                                    className="w-5 h-5 rounded-full object-cover border border-white/10 shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                                    title="View Profile"
                                  />
                                ) : (
                                  <div
                                    onClick={() => handleOpenUserProfile(comm.userId, comm.userHandle, comm.userName)}
                                    className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-[9px] font-black shrink-0 uppercase cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                                    title="View Profile"
                                  >
                                    {comm.userName ? comm.userName.trim().charAt(0).toUpperCase() : 'U'}
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 truncate">
                                  <span
                                    onClick={() => handleOpenUserProfile(comm.userId, comm.userHandle, comm.userName)}
                                    className="font-bold text-white/90 truncate cursor-pointer hover:text-sky-300 transition-colors"
                                  >
                                    {isCommentAuthor ? `${comm.userName} (You)` : comm.userName}
                                  </span>
                                  <span className="text-[10px] text-white/35 font-medium truncate">
                                    · {formatCommentTimestamp(comm.createdAt, comm.time)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isCommentAuthor && (
                                  <button
                                    onClick={() => handleDeleteComment(comm.id)}
                                    className="text-white/25 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                                    title="Delete comment"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Comment Text */}
                            <p className="text-[12.5px] text-white/85 font-medium leading-relaxed pl-1 break-words">
                              {comm.content}
                            </p>

                            {/* Comment Action Footer (Like & Reply buttons) */}
                            <div className="flex items-center gap-4 pl-1 pt-0.5 text-[11px]">
                              <button
                                onClick={() => handleLikeComment(comm)}
                                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${commLiked
                                  ? 'text-rose-500 font-bold'
                                  : 'text-white/40 hover:text-rose-400'
                                  }`}
                              >
                                <Heart
                                  size={12}
                                  fill={commLiked ? 'rgb(244, 63, 94)' : 'none'}
                                  className={commLiked ? 'scale-110' : ''}
                                />
                                <span>{comm.likes || 0}</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (isReplying) {
                                    setReplyingToCommentId(null);
                                    setReplyText('');
                                  } else {
                                    setReplyingToCommentId(comm.id);
                                    setReplyText('');
                                  }
                                }}
                                className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${isReplying
                                  ? 'text-sky-400 font-bold'
                                  : 'text-white/40 hover:text-sky-300'
                                  }`}
                              >
                                <CornerDownRight size={11} />
                                <span>{isReplying ? 'Cancel' : 'Reply'}</span>
                              </button>
                            </div>

                            {/* Inline Reply Input Field */}
                            {isReplying && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 pl-3 flex items-center gap-2"
                              >
                                <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-sky-500/30 rounded-xl p-1 pl-2.5">
                                  <span className="text-[10.5px] text-sky-400 font-bold shrink-0">
                                    @{comm.userName}:
                                  </span>
                                  <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="flex-1 bg-transparent text-[11.5px] text-white placeholder:text-white/30 outline-none font-medium"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddReply(comm);
                                      }
                                    }}
                                  />
                                </div>
                                <button
                                  onClick={() => handleAddReply(comm)}
                                  disabled={!replyText.trim() || isSubmittingReply}
                                  className="px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                                >
                                  {isSubmittingReply ? (
                                    <Loader2 size={11} className="animate-spin" />
                                  ) : (
                                    <span>Reply</span>
                                  )}
                                </button>
                              </motion.div>
                            )}

                            {/* Nested Replies List */}
                            {replies.length > 0 && (
                              <div className="mt-1 pl-3.5 border-l-2 border-sky-500/20 flex flex-col gap-2 ml-1">
                                {replies.map((rep) => {
                                  const isReplyAuthor =
                                    (rep.userId && currentUserId && rep.userId === currentUserId) ||
                                    rep.userName === currentUserName;
                                  const repPhoto =
                                    rep.adminPhoto ||
                                    rep.authorPhoto ||
                                    rep.userAvatar ||
                                    (isReplyAuthor ? currentUserAvatar : undefined);
                                  const repLiked = (rep.likedBy || []).includes(currentUserId);

                                  return (
                                    <div
                                      key={rep.id}
                                      className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 flex flex-col gap-1"
                                    >
                                      {/* Reply Header */}
                                      <div className="flex items-center justify-between text-[10.5px]">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          {repPhoto ? (
                                            <img
                                              src={typeof repPhoto === 'object' && repPhoto ? (repPhoto as any).src : repPhoto}
                                              alt={rep.userName}
                                              onClick={() => handleOpenUserProfile(rep.userId, rep.userHandle, rep.userName)}
                                              className="w-4 h-4 rounded-full object-cover border border-white/10 shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                                              title="View Profile"
                                            />
                                          ) : (
                                            <div
                                              onClick={() => handleOpenUserProfile(rep.userId, rep.userHandle, rep.userName)}
                                              className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center text-[8px] font-black shrink-0 uppercase cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                                              title="View Profile"
                                            >
                                              {rep.userName ? rep.userName.trim().charAt(0).toUpperCase() : 'U'}
                                            </div>
                                          )}
                                          <span
                                            onClick={() => handleOpenUserProfile(rep.userId, rep.userHandle, rep.userName)}
                                            className="font-bold text-white/90 truncate cursor-pointer hover:text-sky-300 transition-colors"
                                          >
                                            {isReplyAuthor ? `${rep.userName} (You)` : rep.userName}
                                          </span>
                                          {rep.replyTo && (
                                            <span className="text-[9.5px] text-sky-400/80 font-semibold truncate">
                                              @{rep.replyTo.replace(/^@/, '')}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="text-[9px] text-white/30">{formatCommentTimestamp(rep.createdAt, rep.time)}</span>
                                          {isReplyAuthor && (
                                            <button
                                              onClick={() => handleDeleteReply(comm.id, rep.id)}
                                              className="text-white/20 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                                              title="Delete reply"
                                            >
                                              <Trash2 size={10} />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Reply Content */}
                                      <p className="text-[11.5px] text-white/80 font-medium leading-relaxed pl-1 break-words">
                                        {rep.content}
                                      </p>

                                      {/* Reply Like Action */}
                                      <div className="flex items-center gap-3 pl-1 pt-0.5 text-[10px]">
                                        <button
                                          onClick={() => handleLikeReply(comm.id, rep)}
                                          className={`flex items-center gap-1 transition-colors cursor-pointer ${repLiked
                                            ? 'text-rose-500 font-bold'
                                            : 'text-white/35 hover:text-rose-400'
                                            }`}
                                        >
                                          <Heart
                                            size={11}
                                            fill={repLiked ? 'rgb(244, 63, 94)' : 'none'}
                                            className={repLiked ? 'scale-110' : ''}
                                          />
                                          <span>{rep.likes || 0}</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
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

          {/* ── Expanded AI response ──────────────────────────────────────── */}
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
                    <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[10px]">
                      🤖
                    </div>
                    <span className="text-[11px] font-black text-violet-300 uppercase tracking-widest">
                      Ask Flip about this moment
                    </span>
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
                      disabled={!question.trim() || loadingAi}
                      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-[12px] px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      {loadingAi ? 'Thinking...' : 'Ask Flip'}
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
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
          >
            <X size={20} />
          </button>

          <div
            className="relative w-full max-w-4xl max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
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

          <div className="mt-6 text-center max-w-2xl px-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-[14.5px] font-medium text-white/95 leading-relaxed break-words whitespace-pre-line">
              {renderFormattedContent(card.content)}
            </p>
            <p className="text-[11px] text-white/40 mt-2">
              Posted by{' '}
              <span
                onClick={() => {
                  setIsFullscreen(false);
                  handleOpenAuthorProfile();
                }}
                className="text-white/80 hover:text-sky-300 cursor-pointer font-bold transition-colors"
              >
                {displayAuthor} {displayHandle ? displayHandle : ''}
              </span>{' '}
              · {card.time} · via {card.source || 'FlipLine'}
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
  askOpen,
  setAskOpen,
  onCardUpdate,
}: FlipTimelineProps) {
  const router = useRouter();

  const handleCtaClick = (ctaType: 'room' | 'watchalong' | 'drop' | string) => {
    if (ctaType === 'room') {
      router.push('/MainModules/ROAR');
    } else if (ctaType === 'watchalong') {
      router.push('/MainModules/WatchAlong');
    } else if (ctaType === 'drop') {
      router.push('/MainModules/FlipCards');
    }
  };

  // Sort chronologically by timeMs / createdAt descending so newest is at the top
  const displayList = [...cards].sort((a, b) => {
    const timeA = Number(a.timeMs) || Number(a.createdAt) || 0;
    const timeB = Number(b.timeMs) || Number(b.createdAt) || 0;
    return timeB - timeA;
  });
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
    const date = card.day || 'Today';
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
          {/* Centered Date Header */}
          <div className="flex justify-center mb-6 mt-2">
            <span className="px-4 py-1.5 rounded-full text-xs font-black text-white bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg uppercase tracking-wider">
              {group.date}
            </span>
          </div>

          {/* Group's cards list */}
          <div className="flex flex-col w-full relative">
            {group.cards.map((card, index) => (
              <FlipCardItem
                key={card.id}
                card={card}
                index={index}
                totalCards={group.cards.length}
                askOpen={askOpen}
                setAskOpen={setAskOpen}
                typeColorMap={typeColorMap}
                typeLabelMap={typeLabelMap}
                router={router}
                handleCtaClick={handleCtaClick}
                onCardUpdate={onCardUpdate}
              />
            ))}
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
      const res = await fetch('/api/ticker?sports=cricket&types=ball_by_ball&limit=30');
      const data = await res.json();
      if (data.success && data.items) {
        const filtered = data.items.filter(
          (item: any) => item.type === 'ball_by_ball' && (item.is_four || item.is_six || item.is_wicket)
        );

        const mapped: FlipCard[] = filtered.map((item: any, index: number) => {
          let hash = 0;
          for (let i = 0; i < item.id.length; i++) {
            hash = (hash << 5) - hash + item.id.charCodeAt(i);
            hash |= 0;
          }
          const numericId = Math.abs(hash);

          const parts = item.id.split('_');
          const overNum = parts[parts.length - 1];
          const overLabel = overNum && overNum.includes('.') ? `Over ${overNum}` : 'Live';

          let cleanComment = item.text || '';
          cleanComment = cleanComment.replace(/^[🏏🔴🔵💥💥\s]*(WICKET!|FOUR!|SIX!)\s*/i, '').trim();

          let formattedContent = '';
          let runSymbol = '';
          if (item.is_four) {
            formattedContent = `Hye! It's a FOUR! 🎉\n${cleanComment}`;
            runSymbol = '4';
          } else if (item.is_six) {
            formattedContent = `That's a SIX! 💥\n${cleanComment}`;
            runSymbol = '6';
          } else if (item.is_wicket) {
            formattedContent = `WICKET! 🏏\n${cleanComment}`;
            runSymbol = 'W';
          } else {
            formattedContent = cleanComment;
          }

          let itemTimeMs = new Date(data.fetched_at || Date.now()).getTime() - index * 1000;
          let timeStr = new Date(data.fetched_at || Date.now()).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

          if (item.id === 'demo_bbb_1_20.5') {
            timeStr = '11:03 AM';
            itemTimeMs = Date.now() - 1000 * 60 * 5;
          } else if (item.id === 'demo_bbb_2_20.2') {
            timeStr = '11:00 AM';
            itemTimeMs = Date.now() - 1000 * 60 * 10;
          } else if (item.id === 'demo_bbb_3_19.6') {
            timeStr = '10:57 AM';
            itemTimeMs = Date.now() - 1000 * 60 * 15;
          } else if (item.id === 'demo_bbb_5_19.1') {
            timeStr = '10:49 AM';
            itemTimeMs = Date.now() - 1000 * 60 * 20;
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
            likedBy: [],
            comments: [],
            isKey: true,
            fomoMsg: '',
            fomoCount: 0,
            ctaType: 'room',
            flipResponse: '',
            isVerified: true,
            overLabel,
            runSymbol,
          } as FlipCard;
        });

        return mapped;
      }
    } catch (err) {
      console.warn('Failed to fetch live updates for FlipLine:', err);
    }
    return [];
  };

  const fetchCards = async () => {
    try {
      const fetched = await fliplineService.fetchFlipCards();
      setDbCards(Array.isArray(fetched) ? fetched : []);
    } catch (e) {
      console.error('Failed to fetch FlipLine cards:', e);
      setDbCards([]);
    } finally {
      setLoading(false);
    }
  };

  const updateLiveUpdates = async () => {
    try {
      const live = await fetchLiveTickerUpdates();
      setLiveCards(Array.isArray(live) ? live : []);
    } catch (e) {
      console.warn('Failed to fetch live updates:', e);
      setLiveCards([]);
    }
  };

  const handleCardUpdate = useCallback((updatedCard: FlipCard) => {
    setDbCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id || (c.sk && c.sk === updatedCard.sk) ? updatedCard : c))
    );
  }, []);

  useEffect(() => {
    fetchCards();
    updateLiveUpdates();

    const interval = setInterval(updateLiveUpdates, 15000);

    const handleNewPost = () => {
      fetchCards();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('flipline-post-created', handleNewPost);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('flipline-post-created', handleNewPost);
      }
    };
  }, []);

  const combinedCards = React.useMemo(() => {
    const seenIds = new Set<string | number>();
    const safeLive = Array.isArray(liveCards) ? liveCards : [];
    const safeDb = Array.isArray(dbCards) ? dbCards : [];
    const all = [...safeLive, ...safeDb];
    return all.filter((c) => {
      if (!c || seenIds.has(c.id)) return false;
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
            onClick={() => setActiveTab('flipline')}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer"
            style={{
              background:
                activeTab === 'flipline'
                  ? 'linear-gradient(90deg, #FF3D57, #FF7B02)'
                  : 'transparent',
              color: activeTab === 'flipline' ? '#fff' : 'rgba(255,255,255,0.4)',
              boxShadow:
                activeTab === 'flipline' ? '0 4px 15px rgba(255, 61, 87, 0.25)' : 'none',
              border: 'none',
            }}
          >
            <span className="text-sm">⚡</span> FlipLine
          </button>
          <button
            onClick={() => setActiveTab('fliparena')}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer"
            style={{
              background:
                activeTab === 'fliparena'
                  ? 'linear-gradient(90deg, #FF3D57, #FF7B02)'
                  : 'transparent',
              color: activeTab === 'fliparena' ? '#fff' : 'rgba(255,255,255,0.4)',
              boxShadow:
                activeTab === 'fliparena' ? '0 4px 15px rgba(255, 61, 87, 0.25)' : 'none',
              border: 'none',
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
            onCardUpdate={handleCardUpdate}
          />
      )}
    </div>
  );
}