import { trackMeaningfulInteraction } from '@/lib/analytics';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { trackAdvocacy } from '@/lib/analytics';
import { getBotCanonicalName } from '@/src/constants/bots';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreVertical,
  Play,
  Volume2,
  Send,
  Trash2,
  CornerDownRight,
  X,
  Loader2,
  Flag,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import { fliplineService, FlipLineComment, FlipLineReply, FlipCard } from '@/services/flipline.service';
import { useAuth } from '@/context/AuthContext';
import FlipArena from './FlipArena';
import { handleGoBack } from '@/utils/backButton';

export type { FlipLineComment, FlipLineReply, FlipCard };

/* ─── FlipLine shared data ─────────────────────────────────────────── */
export type ScoreChip = {
  score: string;
  status: string;
  statusType: 'live' | 'final' | 'break' | 'upcoming' | 'delay' | 'info';
};

/* ─── SVG Icons matching Figma ─────────────────────────────────────── */
const ZapIcon = ({ color = '#FF2D8A', size = 18 }: { color?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    stroke={color}
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const StadiumIcon = ({ color = '#9AA3AF', size = 18 }: { color?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className="shrink-0"
  >
    <path d="M4 8h2v2H4V8zm7 0h2v2h-2V8zm7 0h2v2h-2V8zM3 11h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9zm3 3v4h2v-4H6zm5 0v4h2v-4h-2zm5 0v4h2v-4h-2zM5 5l2-3 2 3H5zm9 0l2-3 2 3h-4z" />
  </svg>
);

function formatCount(num: number): string {
  if (!num || isNaN(num) || num <= 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
}

function getGuestId(): string {
  if (typeof window === 'undefined') return 'guest_fan';
  const stored = localStorage.getItem('guest_display_name');
  if (stored) return stored.toLowerCase().replace(/\s+/g, '_');
  const name = `fan_${Math.random().toString(36).substring(2, 7)}`;
  return name;
}

function formatCardDate(day?: string, timeMs?: number, createdAt?: number | string): string {
  const cleanDay = (day || '').trim();
  if (
    cleanDay &&
    cleanDay.toLowerCase() !== 'just now' &&
    cleanDay.toLowerCase() !== 'justnow' &&
    cleanDay.toLowerCase() !== 'today'
  ) {
    if (cleanDay.toLowerCase().startsWith('day ') || isNaN(Date.parse(cleanDay))) {
      return cleanDay;
    }
    const parsed = new Date(cleanDay);
    if (!isNaN(parsed.getTime())) {
      const isToday = new Date().toDateString() === parsed.toDateString();
      if (isToday) {
        return 'TODAY';
      }
      return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  if (cleanDay.toLowerCase() === 'today') {
    return 'TODAY';
  }

  const ts =
    Number(timeMs) ||
    (typeof createdAt === 'number' && !isNaN(createdAt) && createdAt > 0 ? createdAt : undefined) ||
    (typeof createdAt === 'string' ? Number(createdAt) || Date.parse(createdAt) : undefined) ||
    Date.now();

  const d = new Date(ts);
  if (isNaN(d.getTime())) {
    return 'TODAY';
  }

  const isToday = new Date().toDateString() === d.toDateString();
  if (isToday) {
    return 'TODAY';
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCardTime(card: FlipCard): string {
  const explicitTs =
    Number((card as any).postingTime) ||
    Number(card.timeMs) ||
    Number(card.scheduledTimeMs) ||
    Number(card.scheduledAt) ||
    (typeof (card as any).updatedAt === 'number' && !isNaN((card as any).updatedAt) && (card as any).updatedAt > 0
      ? (card as any).updatedAt
      : typeof (card as any).updatedAt === 'string'
        ? Number((card as any).updatedAt) || Date.parse((card as any).updatedAt)
        : undefined);

  if (explicitTs && !isNaN(explicitTs) && explicitTs > 0) {
    const d = new Date(explicitTs);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  }

  let timeStr = (card.time || '').trim();
  if (!timeStr || timeStr.toLowerCase().includes('just now') || timeStr.toLowerCase() === 'live') {
    const ts =
      (typeof card.createdAt === 'number' && !isNaN(card.createdAt) && card.createdAt > 0
        ? card.createdAt
        : undefined) ||
      (typeof card.createdAt === 'string' ? Number(card.createdAt) || Date.parse(card.createdAt) : undefined) ||
      Date.now();

    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return timeStr;
}

function formatCommentTimestamp(createdAt?: number | string, fallbackTime?: string): string {
  const cleanFallback =
    fallbackTime && fallbackTime.trim().toLowerCase() !== 'just now' ? fallbackTime.trim() : undefined;

  let timestamp: number | undefined;
  if (typeof createdAt === 'number' && !isNaN(createdAt) && createdAt > 0) {
    timestamp = createdAt;
  } else if (typeof createdAt === 'string') {
    const num = Number(createdAt);
    timestamp = !isNaN(num) && num > 0 ? num : Date.parse(createdAt);
    if (isNaN(timestamp)) timestamp = undefined;
  }

  if (!timestamp) {
    if (cleanFallback) return cleanFallback;
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const d = new Date(timestamp);
  if (isNaN(d.getTime())) {
    if (cleanFallback) return cleanFallback;
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const isToday = new Date().toDateString() === d.toDateString();
  if (isToday) {
    return timeStr;
  }

  return `${dateStr}, ${timeStr}`;
}

function renderFormattedContent(content: string) {
  if (!content) return null;
  const parts = content.split(/(https?:\/\/[^\s]+|#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[#FF8A00] hover:underline underline-offset-2 break-all hover:opacity-90 transition-opacity cursor-pointer font-medium"
        >
          {part}
        </a>
      );
    }
    if (part.startsWith('#')) {
      return (
        <span
          key={index}
          className="text-[#FF2D8A] font-bold hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    if (part.startsWith('@')) {
      return (
        <span
          key={index}
          className="text-[#FF8A00] font-bold hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function matchesSportFilter(card: FlipCard, target: string): boolean {
  const t = target.toLowerCase();
  const cardSport = (card.sport || '').toLowerCase();
  const cardChannel = ((card as any).channel || '').toLowerCase();
  const cardChannels = Array.isArray((card as any).channels)
    ? (card as any).channels.map((ch: any) => String(ch).toLowerCase())
    : typeof (card as any).channels === 'string'
      ? (card as any).channels.split(',').map((ch: string) => ch.trim().toLowerCase())
      : [];
  const cardAllChannels = Array.isArray((card as any).allChannels)
    ? (card as any).allChannels.map((ch: any) => String(ch).toLowerCase())
    : typeof (card as any).allChannels === 'string'
      ? (card as any).allChannels.split(',').map((ch: string) => ch.trim().toLowerCase())
      : [];

  return (
    cardSport === t ||
    cardChannel === t ||
    cardChannels.includes(t) ||
    cardAllChannels.includes(t)
  );
}

/* ─── Channel filter chips (matching Figma specs) ─── */
const FILTER_CHIPS = [
  { id: 'all', label: 'All', emoji: '', isHash: true },
  { id: 'cricket', label: 'Cricket', emoji: '🏏', isHash: false },
  { id: 'football', label: 'Football', emoji: '⚽', isHash: false },
  { id: 'athletics', label: 'Athletics', emoji: '🏃', isHash: false },
  { id: 'expert', label: 'Expert', emoji: '🎯', isHash: false },
  { id: 'analysts', label: 'Analysts', emoji: '🎙', isHash: false },
];

function getCardChannels(card: FlipCard): string[] {
  const c = card as any;
  const toList = (v: any): string[] =>
    Array.isArray(v) ? v.map((x) => String(x)) : typeof v === 'string' ? v.split(',') : [];

  return [c.sport, c.channel, ...toList(c.channels), ...toList(c.allChannels), ...toList(c.tags)]
    .map((x) => String(x || '').trim().toLowerCase().replace(/^#/, ''))
    .filter(Boolean);
}

function isExpertCard(card: FlipCard): boolean {
  const ch = getCardChannels(card);
  return (
    String(card.type || '').toLowerCase() === 'expert' ||
    ch.includes('expert') ||
    ch.includes('experts')
  );
}

function isAnalystCard(card: FlipCard): boolean {
  const ch = getCardChannels(card);
  return (
    String(card.type || '').toLowerCase() === 'analyst' ||
    ch.includes('analyst') ||
    ch.includes('analysts')
  );
}

function matchesChannelFilter(card: FlipCard, filterId: string): boolean {
  switch (filterId) {
    case 'all':
      return true;
    case 'expert':
      return isExpertCard(card);
    case 'analysts':
      return isAnalystCard(card);
    default:
      return matchesSportFilter(card, filterId);
  }
}

function applyChannelFilter(cards: FlipCard[], activeFilter: string, selectedSport?: string): FlipCard[] {
  if (activeFilter !== 'all') {
    return cards.filter((c) => matchesChannelFilter(c, activeFilter));
  }
  if (selectedSport && selectedSport !== 'mixed') {
    return cards.filter((c) => matchesSportFilter(c, selectedSport));
  }
  return cards;
}

/* ─── FlipLine Home Section ─────────────────────────────────────────── */
function FlipLineSection({
  selectedSport,
  onViewFull,
  cards,
  loading,
  onCardUpdate,
  highlightedCardId,
}: {
  selectedSport: string;
  onViewFull: () => void;
  cards: FlipCard[];
  loading: boolean;
  onCardUpdate?: (updatedCard: FlipCard) => void;
  highlightedCardId?: string | null;
}) {
  const [density, setDensity] = useState<'full' | 'key'>('full');
  const [askOpen, setAskOpen] = useState<number | string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const toggleMoreMenu = () => {
    if (!showMoreMenu && moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      const left = Math.max(12, Math.min(window.innerWidth - 170, rect.left));
      setDropdownPos({
        top: rect.bottom + 6,
        left,
      });
      setShowMoreMenu(true);
    } else {
      setShowMoreMenu(false);
    }
  };

  useEffect(() => {
    if (!showMoreMenu) return;
    const handleReposition = () => {
      if (moreButtonRef.current) {
        const rect = moreButtonRef.current.getBoundingClientRect();
        const left = Math.max(12, Math.min(window.innerWidth - 170, rect.left));
        setDropdownPos({
          top: rect.bottom + 6,
          left,
        });
      }
    };
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [showMoreMenu]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[160px]">
        <div className="flex items-center gap-2 text-[#9AA3AF] text-[13px] font-bold">
          <Loader2 size={16} className="animate-spin text-[#FF2D8A]" />
          <span>Loading moments...</span>
        </div>
      </div>
    );
  }

  const safeCards = Array.isArray(cards) ? cards : [];
  const baseCards = density === 'key' ? safeCards.filter((c) => c?.isKey) : safeCards;
  const displayCards = applyChannelFilter(baseCards, activeFilter, selectedSport);

  const mainChips = FILTER_CHIPS.slice(0, 4);
  const extraChips = FILTER_CHIPS.slice(4);

  return (
    <div className="w-full mb-3 sm:mb-5 relative">
      {/* SPORT Section Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 mb-2.5">
        <span className="text-[12px] sm:text-[13px] font-black uppercase tracking-wider text-[#9AA3AF]">
          SPORT
        </span>

      </div>

      {/* Sport Filter Chips (Figma Styled) */}
      <div
        className="flex items-center gap-2 px-3 sm:px-4 mb-3 sm:mb-4 overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mainChips.map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className="relative px-3.5 py-2 rounded-lg bg-[#111418] border border-[#2A2F36] flex items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shrink-0 overflow-hidden"
              style={{
                borderColor: isActive ? '#2A2F36' : '#2A2F36',
              }}
            >
              {chip.isHash ? (
                <span className="text-[#FF2D8A] font-black text-sm">#</span>
              ) : (
                  <span className="text-xs">{chip.emoji}</span>
              )}
              <span
                className="transition-colors"
                style={{
                  color: isActive ? '#FFFFFF' : '#E4E8EE',
                  fontWeight: isActive ? 800 : 600,
                }}
              >
                {chip.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF2D8A]" />
              )}
            </button>
          );
        })}

        {/* More Dropdown / Extra Chips Button */}
        <div className="relative shrink-0">
          <button
            ref={moreButtonRef}
            onClick={toggleMoreMenu}
            className="relative px-3.5 py-2 rounded-lg bg-[#111418] border border-[#2A2F36] flex items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer overflow-hidden"
            style={{
              borderColor: extraChips.some((c) => c.id === activeFilter) ? '#2A2F36' : '#2A2F36',
            }}
          >
            <LayoutGrid size={13} className="text-[#9AA3AF]" />
            <span
              style={{
                color: extraChips.some((c) => c.id === activeFilter) ? '#FFFFFF' : '#E4E8EE',
                fontWeight: extraChips.some((c) => c.id === activeFilter) ? 800 : 600,
              }}
            >
              {extraChips.find((c) => c.id === activeFilter)?.label || 'More'}
            </span>
            <ChevronDown
              size={13}
              className={`text-[#9AA3AF] transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`}
            />
            {extraChips.some((c) => c.id === activeFilter) && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF2D8A]" />
            )}
          </button>
        </div>
      </div>

      {/* Fixed Dropdown Menu for More Options (Rendered outside scroll container to prevent clipping) */}
      <AnimatePresence>
        {showMoreMenu && dropdownPos && (
          <>
            {/* Backdrop to close when clicking outside */}
            <div
              className="fixed inset-0 z-[99998] bg-transparent"
              onClick={() => setShowMoreMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: `${dropdownPos.top}px`,
                left: `${dropdownPos.left}px`,
                zIndex: 99999,
              }}
              className="min-w-[155px] p-1.5 rounded-xl bg-[#15181D] border border-[#2A2F36] shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex flex-col gap-1 backdrop-blur-xl"
            >
              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#9AA3AF]">
                More Channels
              </div>
              {extraChips.map((chip) => {
                const isSelected = activeFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setActiveFilter(chip.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${isSelected
                        ? 'bg-[#111418] text-white border border-[#FF2D8A]/50 shadow-sm'
                        : 'text-[#E4E8EE] hover:bg-[#111418] hover:text-white'
                      }`}
                  >
                    <span className="text-sm">{chip.emoji}</span>
                    <span className="flex-1">{chip.label}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D8A]" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Timeline Moments (Show latest 4 on Home) */}
      <FlipTimeline
        cards={displayCards}
        previewLimit={4}
        askOpen={askOpen}
        setAskOpen={setAskOpen}
        onCardUpdate={onCardUpdate}
        highlightedCardId={highlightedCardId}
      />

      {/* View Full FlipLINE Button (Figma Spec) */}
      <div className="px-3 sm:px-4 mt-3 sm:mt-4">
        <button
          onClick={onViewFull}
          className="w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] cursor-pointer bg-[#111418] border border-[#2A2F36] hover:border-[#FF2D8A]/40 group"
        >
          <span className="text-[13px] sm:text-[14px] font-extrabold text-[#FFFFFF] tracking-wide">
            View Full FlipLINE
          </span>
          <ChevronRight size={16} className="text-[#FF8A00] stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

/* ─── FlipLine Full-Page Screen ─────────────────────────────────────── */
export function FlipLineFullScreen({
  onBack,
  selectedSport = 'mixed',
  cards,
  loading,
  onCardUpdate,
  targetCardId,
}: {
  onBack: () => void;
  selectedSport?: string;
  cards: FlipCard[];
  loading: boolean;
  onCardUpdate?: (updatedCard: FlipCard) => void;
  targetCardId?: string | number | null;
}) {
  const [density, setDensity] = useState<'full' | 'key'>('full');
  const [askOpen, setAskOpen] = useState<number | string | null>(null);
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(targetCardId ? String(targetCardId) : null);
  const scrolledRef = useRef(false);

  useEffect(() => {
    if (targetCardId) {
      setTargetId(String(targetCardId));
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCardId = params.get('cardId') || params.get('postId') || params.get('id');
      if (urlCardId) {
        setTargetId(urlCardId);
      } else if (window.location.hash) {
        const hashId = window.location.hash.replace(/^#(flipline-card-|card-)?/, '');
        if (hashId) setTargetId(hashId);
      }
    }
  }, [targetCardId]);

  useEffect(() => {
    if (!targetId || loading || !Array.isArray(cards) || cards.length === 0 || scrolledRef.current) return;

    const cleanTargetId = targetId.trim();
    const foundCard = cards.find(
      (c) =>
        String(c.id) === cleanTargetId ||
        (c.sk && String(c.sk) === cleanTargetId) ||
        (c.sk && encodeURIComponent(String(c.sk)) === cleanTargetId)
    );

    if (foundCard) {
      if (activeFilter !== 'all' && !matchesChannelFilter(foundCard, activeFilter)) {
        setActiveFilter('all');
      }

      setHighlightedCardId(String(foundCard.id));
      scrolledRef.current = true;

      const scrollToElement = () => {
        const el =
          document.getElementById(`flipline-card-${foundCard.id}`) ||
          document.querySelector(`[data-card-id="${foundCard.id}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };

      const timer1 = setTimeout(scrollToElement, 250);
      const timer2 = setTimeout(scrollToElement, 600);
      const timer3 = setTimeout(scrollToElement, 1200);

      const clearHighlightTimer = setTimeout(() => {
        setHighlightedCardId(null);
      }, 7000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(clearHighlightTimer);
      };
    }
  }, [targetId, loading, cards, activeFilter]);

  if (loading) {
    return (
      <div className="h-[100dvh] flex justify-center items-center bg-[#0B0E12]">
        <div className="flex items-center gap-2 text-[#9AA3AF] text-sm font-bold">
          <Loader2 size={18} className="animate-spin text-[#FF2D8A]" />
          <span>Loading moments...</span>
        </div>
      </div>
    );
  }

  const safeCards = Array.isArray(cards) ? cards : [];
  const baseCards = density === 'key' ? safeCards.filter((c) => c?.isKey) : safeCards;
  const displayCards = applyChannelFilter(baseCards, activeFilter, selectedSport);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0B0E12]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-[#111418]/95 border-b border-[#2A2F36] backdrop-blur-md">
        <button
          onClick={() => handleGoBack(router)}
          className="p-1 text-[#9AA3AF] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg
            width="18"
            height="18"
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
        <div className="flex-1 flex items-center gap-2.5">
          <span className="text-[17px] font-black text-white tracking-tight">
            FlipLINE
          </span>
          <span className="text-[9px] font-black bg-gradient-to-r from-[#FF2D8A] to-[#FF8A00] text-white px-2 py-0.5 rounded-full tracking-wider uppercase">
            LIVE
          </span>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar border-b border-[#2A2F36] bg-[#111418]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {FILTER_CHIPS.map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className="relative px-3.5 py-1.5 rounded-lg bg-[#15181D] border border-[#2A2F36] flex items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shrink-0 overflow-hidden"
            >
              {chip.isHash ? (
                <span className="text-[#FF2D8A] font-black text-xs">#</span>
              ) : (
                <span className="text-xs">{chip.emoji}</span>
              )}
              <span
                style={{
                  color: isActive ? '#FFFFFF' : '#E4E8EE',
                  fontWeight: isActive ? 800 : 600,
                }}
              >
                {chip.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF2D8A]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable Timeline */}
      <div className="flex-1 overflow-y-auto pt-2 pb-8 px-2 sm:px-4">
        <div className="max-w-[680px] w-full mx-auto">
          <FlipTimeline
            cards={displayCards}
            askOpen={askOpen}
            setAskOpen={setAskOpen}
            onCardUpdate={onCardUpdate}
            highlightedCardId={highlightedCardId}
          />
          {/* Start-of-coverage marker */}
          <div className="pl-4 pt-4 flex items-center">
            <div className="w-[50px] shrink-0 flex justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#15181D] border-2 border-[#2A2F36]" />
            </div>
            <span className="pl-2.5 text-[11px] text-[#9AA3AF] font-bold tracking-wide">
              Start of coverage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FlipTimelineProps {
  cards: FlipCard[];
  previewLimit?: number;
  askOpen: number | string | null;
  setAskOpen: (id: number | string | null) => void;
  onCardUpdate?: (updatedCard: FlipCard) => void;
  highlightedCardId?: string | null;
}

/* ─── FlipCardItem Component ────────────────────────────────────────── */
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
  isHighlighted = false,
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
  isHighlighted?: boolean;
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
    : 'SportsFan360';
  const displayHandle = isCurrentUser ? '@you' : card.handle === '@you' ? '@fan' : (card.handle || '@sportsfan360');
  const displayPhoto = card.adminPhoto || card.authorPhoto || (isCurrentUser ? (currentUserAdminPhoto || currentUserAuthorPhoto) : undefined);

  // Card like state
  const [likesCount, setLikesCount] = useState<number>(Number(card.likes) || 0);
  const [likedByList, setLikedByList] = useState<string[]>(Array.isArray(card.likedBy) ? card.likedBy : []);
  const isLiked = currentUserId ? likedByList.includes(currentUserId) : false;
  const [isLikingCard, setIsLikingCard] = useState(false);

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
  const [isBookmarked, setIsBookmarked] = useState(false);

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

    const now = Date.now();
    const currentTimeStr = new Date(now).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const optimisticComment: FlipLineComment = {
      id: `c_temp_${now}`,
      userId: currentUserId,
      userName: currentUserName,
      userHandle: currentUserHandle,
      adminPhoto: currentUserAdminPhoto,
      authorPhoto: currentUserAuthorPhoto,
      userAvatar: currentUserAvatar,
      content: text,
      time: currentTimeStr,
      createdAt: now,
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

    const now = Date.now();
    const currentTimeStr = new Date(now).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const optimisticReply: FlipLineReply = {
      id: `r_temp_${now}`,
      userId: currentUserId,
      userName: currentUserName,
      userHandle: currentUserHandle,
      adminPhoto: currentUserAdminPhoto,
      authorPhoto: currentUserAuthorPhoto,
      userAvatar: currentUserAvatar,
      content: text,
      replyTo: targetComment.userHandle || targetComment.userName,
      time: currentTimeStr,
      createdAt: now,
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

  // ── 8. AI ASKFlip Handler ─────────────────────────────────────────────────
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
      console.error('Failed to ASKFlip:', e);
      setAnswer('Something went wrong — please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  const [copiedState, setCopiedState] = useState(false);

  const handleShare = async (c: FlipCard) => {
    if (typeof window === 'undefined') return;

    try {
      trackAdvocacy('content_shared', { card_id: c.id, author: c.author, sport: c.sport });
      posthog.capture('advocacy_action', {
        action_type: 'content_shared',
        card_id: c.id,
      });
    } catch (err) {}

    const cardIdParam = c.id !== undefined && c.id !== null ? String(c.id) : (c.sk || '');
    const shareUrl = `${window.location.origin}/MainModules/FlipLine?cardId=${encodeURIComponent(cardIdParam)}`;
    const shareTitle = `FlipLine from ${c.author || 'Fan'}`;
    const cleanContent = c.content ? c.content.replace(/\n+/g, ' ').slice(0, 120) : '';
    const shareText = `"${cleanContent}${c.content && c.content.length > 120 ? '...' : ''}" - ${c.author || 'Fan'} on Sportsfan360`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2500);
    } catch (e) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2500);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  // ── 9. Report Post Handler ────────────────────────────────────────────────
  const handleSendReport = async () => {
    if ((!reportReason.trim() && !selectedReportTag) || isSubmittingReport) return;
    setIsSubmittingReport(true);

    try {
      await fliplineService.submitReport({
        cardId: card.id,
        cardSk: cardSk,
        cardContent: card.content,
        cardAuthor: card.author,
        cardAuthorId: card.userId,
        cardSport: card.sport,
        reason: reportReason.trim(),
        tag: selectedReportTag || 'Other',
        reporterId: currentUserId,
        reporterName: currentUserName,
        reporterHandle: currentUserHandle,
        reporterEmail: currentUserEmail,
        reporterAvatar: typeof currentUserAvatar === 'string' ? currentUserAvatar : undefined,
      });

      setReportSubmitted(true);
      setReportReason('');
      setSelectedReportTag(null);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportOpen(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to submit report to backend:', err);
      setReportSubmitted(true);
      setReportReason('');
      setSelectedReportTag(null);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportOpen(false);
      }, 2500);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // ── 10. Open User Profile Navigation ───────────────────────────────────────
  const handleOpenUserProfile = (targetUserId?: string, targetHandle?: string, targetName?: string) => {
    const botCanon = getBotCanonicalName(targetName) || getBotCanonicalName(targetUserId);
    if (botCanon) {
      router.push(`/MainModules/ROAR?profileUserId=${encodeURIComponent(botCanon)}`);
      return;
    }

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

  // ── 11. Open Author Profile Navigation ─────────────────────────────────────
  const handleOpenAuthorProfile = () => {
    const botCanon = card.type === 'bot'
      ? (getBotCanonicalName(card.author) || 'Dolly')
      : getBotCanonicalName(card.author);

    if (botCanon) {
      router.push(`/MainModules/ROAR?profileUserId=${encodeURIComponent(botCanon)}`);
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

  const totalCommentsCount = commentsList.reduce(
    (acc, c) => acc + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
    0
  );

  const isExpanded = askOpen === card.id;
  const themeColor = typeColorMap[card.type] || '#FF2D8A';
  const themeLabel = typeLabelMap[card.type] || card.type;

  return (
    <div
      id={`flipline-card-${card.id}`}
      data-card-id={String(card.id)}
      className="flex w-full relative mb-3 sm:mb-4 scroll-mt-24 transition-all duration-300"
    >
      {/* Left timeline axis (Figma image 3 glow node & gradient line) */}
      <div className="w-[54px] sm:w-[62px] shrink-0 flex flex-col items-center pt-1.5 relative">
        {(() => {
          const displayTime = getCardTime(card);
          const parts = displayTime.split(' ');
          if (parts.length >= 2) {
            return (
              <div className="flex flex-col items-center">
                <span className="text-[13px] sm:text-[14px] font-black text-white leading-none">
                  {parts[0]}
                </span>
                <span className="text-[9px] font-bold text-[#9AA3AF] leading-none mt-1 uppercase tracking-wider">
                  {parts.slice(1).join(' ')}
                </span>
              </div>
            );
          }
          return (
            <span className="text-[12px] font-extrabold text-white leading-tight text-center break-words max-w-[44px]">
              {displayTime}
            </span>
          );
        })()}

        {/* Glowing Node Dot (Figma spec with orange/pink glow) */}
        <div className="relative z-10 mt-2.5 flex items-center justify-center">
          <div
            className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#FF8A00]"
            style={{
              boxShadow: isHighlighted
                ? '0 0 14px rgba(255, 45, 138, 1), 0 0 6px rgba(255, 138, 0, 1)'
                : '0 0 10px rgba(255, 138, 0, 0.85), 0 0 4px rgba(255, 45, 138, 0.7)',
            }}
          />
        </div>

        {/* Vertical Timeline Gradient Line */}
        {index < totalCards - 1 && (
          <div
            className="absolute w-[1.5px]"
            style={{
              top: '52px',
              bottom: '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(180deg, #FF8A00 0%, #FF2D8A 35%, rgba(42, 47, 54, 0.6) 100%)',
            }}
          />
        )}
      </div>

      {/* Right Post Card (Figma Main Surface #111418, Border #2A2F36) */}
      <div className="flex-1 pr-2 sm:pr-3 min-w-0">
        <div
          className={`transition-all duration-300 relative flex flex-col gap-3 w-full rounded-2xl p-4 sm:p-5 shadow-lg ${
            isHighlighted
            ? 'border-2 border-[#FF2D8A] ring-4 ring-[#FF2D8A]/25 shadow-[0_0_24px_rgba(255,45,138,0.35)] bg-[#111418]'
            : 'bg-[#111418] border border-[#2A2F36]'
          }`}
        >
          {isHighlighted && (
            <div className="absolute -top-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF2D8A] to-[#FF8A00] text-white font-black text-[10px] uppercase tracking-wider shadow-lg animate-bounce">
              <Share2 size={11} className="shrink-0" />
              <span>Shared Moment</span>
            </div>
          )}

          {/* Row 1: Author info & Verified Badge */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              {card.type === 'bot' ? (
                <img
                  src="/images/dolly.png"
                  alt="Flip BOT"
                  onClick={handleOpenAuthorProfile}
                  className="w-10 h-10 rounded-full object-cover border border-[#2A2F36] shrink-0 bg-blue-500/10 cursor-pointer hover:opacity-85 active:scale-95 transition-all"
                  title="View Profile"
                />
              ) : displayPhoto ? (
                <img
                  src={typeof displayPhoto === 'object' ? displayPhoto.src : displayPhoto}
                  alt={displayAuthor}
                  onClick={handleOpenAuthorProfile}
                    className="w-10 h-10 rounded-full object-cover border border-[#2A2F36] shrink-0 cursor-pointer hover:opacity-85 active:scale-95 transition-all"
                  title="View Profile"
                />
              ) : (
                <div
                  onClick={handleOpenAuthorProfile}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-[13px] shrink-0 uppercase tracking-wider cursor-pointer hover:opacity-85 active:scale-95 transition-all bg-gradient-to-tr from-[#FF2D8A] to-[#FF8A00] border border-[#2A2F36]"
                  title="View Profile"
                >
                  {displayAuthor
                    ? displayAuthor
                      .trim()
                      .split(/\s+/)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                        : 'S'}
                </div>
              )}

              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={handleOpenAuthorProfile}
                    className="font-extrabold text-[14px] text-white leading-tight truncate cursor-pointer hover:text-[#FF8A00] transition-colors"
                  >
                    {card.type === 'bot' ? 'Flip' : displayAuthor}
                  </span>

                  {/* Verified checkmark badge */}
                  {(card.isVerified === true || String(card.isVerified) === 'true' || card.type === 'bot' || !card.author) && (
                    <span
                      className="inline-flex items-center justify-center bg-[#1D9BF0] text-white rounded-full shrink-0"
                      style={{ width: 14, height: 14 }}
                      title="Verified"
                    >
                      <svg
                        className="w-2.5 h-2.5 fill-none stroke-current"
                        strokeWidth="3.5"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    onClick={handleOpenAuthorProfile}
                    className="text-[11.5px] text-[#9AA3AF] truncate cursor-pointer hover:text-white/80 transition-colors"
                  >
                    {displayHandle}
                  </span>
                  {card.type && card.type !== 'bot' && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#15181D] border border-[#2A2F36] text-[#9AA3AF]">
                      {themeLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right: Run / Wicket badge or 3-Dots Menu */}
            <div className="flex items-center gap-2">
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
                  }}
                >
                  {card.runSymbol}
                </div>
              )}
              <button
                onClick={() => setReportOpen((prev) => !prev)}
                className="text-[#9AA3AF] hover:text-white transition-colors p-1 bg-transparent border-none cursor-pointer"
                title="Options"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Row 2: Card Content */}
          <div className="text-[14px] font-normal text-[#E4E8EE] leading-relaxed break-words whitespace-pre-line">
            {renderFormattedContent(card.content)}
          </div>

          {/* Bot Live update footer */}
          {card.type === 'bot' && card.overLabel && (
            <p className="text-[11px] font-bold text-[#9AA3AF] mt-0.5">
              {card.overLabel} · {getCardTime(card)}
            </p>
          )}

          {/* Media / Image / Video Container */}
          {(card.image || card.videoUrl || card.mediaType === 'audio') && (
            <div className="relative group rounded-xl overflow-hidden mt-1 bg-[#0A0C0E] border border-[#2A2F36] flex items-center justify-center w-full max-h-[500px] sm:max-h-[560px]">
              {card.mediaType === 'video' && card.videoUrl ? (
                <div className="relative w-full aspect-video max-h-[500px] sm:max-h-[560px] bg-black flex items-center justify-center">
                  <video
                    src={card.videoUrl}
                    controls
                    preload="metadata"
                    className="w-full h-full max-h-[500px] sm:max-h-[560px] object-contain mx-auto bg-black"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullscreen(true);
                    }}
                    className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-lg"
                    title="View Fullscreen"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </div>
              ) : card.mediaType === 'audio' && !card.image ? (
                  <div className="w-full h-[64px] bg-gradient-to-r from-[#15181D] via-[#1A1E24] to-[#15181D] relative flex items-center px-4 border border-[#2A2F36] rounded-xl">
                  <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-[#FF2D8A]/10 border border-[#FF2D8A]/20 flex items-center justify-center text-[#FF2D8A] shrink-0">
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
                <div
                  className="relative w-full max-h-[500px] sm:max-h-[560px] flex items-center justify-center overflow-hidden cursor-pointer bg-black/40"
                  onClick={() => setIsFullscreen(true)}
                    >
                  {card.image && (
                    <img
                      src={typeof card.image === 'object' ? card.image.src : card.image}
                      alt=""
                      aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-125 pointer-events-none select-none"
                    />
                      )}
                  {card.image && (
                    <img
                      src={typeof card.image === 'object' ? card.image.src : card.image}
                      alt="Moment media"
                      className="relative z-10 w-auto max-w-full h-auto max-h-[500px] sm:max-h-[560px] object-contain mx-auto block cursor-zoom-in rounded-xl transition-all duration-300"
                    />
                      )}
                  {card.mediaType === 'video' && (
                        <div className="absolute inset-0 z-20 bg-black/30 hover:bg-black/20 flex items-center justify-center cursor-pointer transition-colors">
                      <div className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-transform hover:scale-110 shadow-2xl">
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                      )}
                </div>
              )}
            </div>
          )}

          {/* Row 3: Tags pills */}
          {(() => {
            const extraTags = (card.tags || []).filter(
              (t) => !card.content || !card.content.toLowerCase().includes(t.toLowerCase())
            );
            if (extraTags.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {extraTags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-[#15181D] border border-[#2A2F36] text-[11px] font-semibold text-[#9AA3AF] hover:text-[#E4E8EE] hover:border-[#FF2D8A]/40 transition-colors cursor-pointer"
                  >
                    #{t.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            );
          })()}

          {/* Row 4: Action Bar (Figma Image 3) */}
          <div className="flex items-center justify-between pt-1 border-t border-[#2A2F36]/60 mt-0.5">
            {/* Left Icons: Heart, Comment, Share, Bookmark */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Heart (Like) Button */}
              <button
                onClick={handleLikeCard}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0 ${isLiked ? 'text-[#FF2D8A]' : 'text-[#9AA3AF] hover:text-[#FF2D8A]'
                  }`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  size={16}
                  fill={isLiked ? '#FF2D8A' : 'none'}
                  className={`transition-all duration-200 ${isLiked ? 'text-[#FF2D8A] scale-110' : ''}`}
                />
                <span className="text-[12px] font-bold leading-none">{formatCount(likesCount)}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => setCommentOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0 ${commentOpen ? 'text-[#FF8A00]' : 'text-[#9AA3AF] hover:text-[#FF8A00]'
                  }`}
                title="Comments"
              >
                <MessageSquare
                  size={15}
                  fill={commentOpen ? 'rgba(255, 138, 0, 0.2)' : 'none'}
                  className={`transition-all duration-200 ${commentOpen ? 'scale-110' : ''}`}
                />
                <span className="text-[12px] font-bold leading-none">{formatCount(totalCommentsCount)}</span>
              </button>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => handleShare(card)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0 ${copiedState ? 'text-emerald-400' : 'text-[#9AA3AF] hover:text-white'
                  }`}
                  title={copiedState ? 'Link Copied!' : 'Share Post'}
                >
                  {copiedState ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Share2 size={15} />}
                  <span className="text-[12px] font-bold leading-none">
                    {copiedState ? 'Copied!' : formatCount(Number(card.fomoCount) || 124)}
                  </span>
                </button>

                {/* Floating Share Toast */}
                <AnimatePresence>
                  {copiedState && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: -6, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.9 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2D8A] to-[#FF8A00] text-white font-extrabold text-[11px] whitespace-nowrap shadow-xl z-30 flex items-center gap-1.5 pointer-events-none"
                    >
                      <span>Link copied! 📋</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bookmark Button */}
              <button
                onClick={() => setIsBookmarked((prev) => !prev)}
                className={`transition-colors cursor-pointer bg-transparent border-none p-0 ${isBookmarked ? 'text-[#FF8A00]' : 'text-[#9AA3AF] hover:text-white'
                  }`}
                title={isBookmarked ? 'Bookmarked' : 'Save / Bookmark'}
              >
                <Bookmark size={15} fill={isBookmarked ? '#FF8A00' : 'none'} />
              </button>
            </div>

            {/* Right Action: ASKFlip Button (Figma Spec) */}
            <button
              onClick={() => {
                setAskOpen(isExpanded ? null : card.id);
                if (!isExpanded) {
                  try {
                    trackMeaningfulInteraction('flipline_card_flip', { card_id: card.id, room_name: 'FlipLine' });
                  } catch (e) { }
                }
              }}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden border shadow-sm group active:scale-95"
              style={{
                background: isExpanded ? 'rgba(255, 45, 138, 0.15)' : '#15181D',
                borderColor: isExpanded ? '#FF2D8A' : '#2A2F36',
                boxShadow: isExpanded ? '0 0 12px rgba(255, 45, 138, 0.25)' : 'none',
              }}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-[#111418] border border-white/10 shrink-0 flex items-center justify-center">
                <img
                  src="/images/dollyavatar.png"
                  alt="dolphin"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[12px] font-extrabold text-[#FFFFFF] tracking-wide">
                {isExpanded ? 'Flipped' : 'ASKFlip'}
              </span>
              <ChevronRight size={14} className="text-[#FF8A00] stroke-[2.5]" />
            </button>
          </div>

          {/* ── Expanded Report Section ── */}
          <AnimatePresence>
            {reportOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-3 border-t border-[#2A2F36] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Flag size={13} className="text-[#FF8A00]" />
                      <span className="text-[11px] font-black text-[#FF8A00] uppercase tracking-widest">
                        Report Post
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setReportOpen(false);
                        setReportSubmitted(false);
                      }}
                      className="text-[#9AA3AF] hover:text-white transition-colors cursor-pointer p-0.5 bg-transparent border-none"
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
                      <div className="flex flex-wrap gap-1.5">
                        {['Spam', 'Harassment', 'Hate Speech', 'Misinformation', 'Other'].map((tag) => {
                          const isSel = selectedReportTag === tag;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setSelectedReportTag(isSel ? null : tag)}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${isSel
                                ? 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40 shadow-[0_0_8px_rgba(255,138,0,0.2)]'
                                : 'bg-[#15181D] text-[#9AA3AF] border border-[#2A2F36] hover:text-white hover:bg-[#1A1E24]'
                                }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                        <div className="flex items-center gap-2 w-full bg-[#15181D] border border-[#2A2F36] rounded-xl p-1.5 pl-3 focus-within:border-[#FF8A00]/60 transition-all">
                        <input
                          type="text"
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          placeholder="Write reason to report..."
                            className="flex-1 bg-transparent text-[12.5px] text-white placeholder:text-[#9AA3AF] outline-none font-medium"
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
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF2D8A] to-[#FF8A00] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[11.5px] font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
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

          {/* ── Expanded Comment & Reply Section ── */}
          <AnimatePresence>
            {commentOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-3 border-t border-[#2A2F36] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-[#FF8A00]" />
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">
                        Comments {totalCommentsCount > 0 ? `(${totalCommentsCount})` : ''}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#9AA3AF] font-semibold">
                      Join the discussion
                    </span>
                  </div>

                  {/* Comment Input */}
                  <div className="flex items-center gap-2 w-full bg-[#15181D] border border-[#2A2F36] rounded-xl p-1.5 pl-3 focus-within:border-[#FF2D8A]/60 transition-all">
                    {currentUserAvatar ? (
                      <img
                        src={
                          typeof currentUserAvatar === 'object' && currentUserAvatar
                            ? (currentUserAvatar as any).src
                            : currentUserAvatar
                        }
                        alt="You"
                        onClick={() => handleOpenUserProfile()}
                        className="w-6 h-6 rounded-full object-cover border border-[#2A2F36] shrink-0 cursor-pointer hover:opacity-80 transition-all"
                        title="Your Profile"
                      />
                    ) : (
                      <div
                        onClick={() => handleOpenUserProfile()}
                          className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF2D8A] to-[#FF8A00] text-white flex items-center justify-center text-[10px] font-black shrink-0 uppercase cursor-pointer hover:opacity-80 transition-all"
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
                      className="flex-1 bg-transparent text-[12.5px] text-white placeholder:text-[#9AA3AF] outline-none font-medium"
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
                      className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FF2D8A] to-[#FF8A00] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
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
                            className="bg-[#15181D] border border-[#2A2F36] rounded-xl p-3 flex flex-col gap-2 transition-all hover:border-[#2A2F36]/80"
                          >
                            {/* Comment Header */}
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2 min-w-0">
                                {commPhoto ? (
                                  <img
                                    src={typeof commPhoto === 'object' && commPhoto ? (commPhoto as any).src : commPhoto}
                                    alt={comm.userName}
                                    onClick={() => handleOpenUserProfile(comm.userId, comm.userHandle, comm.userName)}
                                    className="w-5 h-5 rounded-full object-cover border border-[#2A2F36] shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                                    title="View Profile"
                                  />
                                ) : (
                                  <div
                                    onClick={() => handleOpenUserProfile(comm.userId, comm.userHandle, comm.userName)}
                                      className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF2D8A] to-[#FF8A00] text-white flex items-center justify-center text-[9px] font-black shrink-0 uppercase cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                                    title="View Profile"
                                  >
                                    {comm.userName ? comm.userName.trim().charAt(0).toUpperCase() : 'U'}
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 truncate">
                                  <span
                                    onClick={() => handleOpenUserProfile(comm.userId, comm.userHandle, comm.userName)}
                                    className="font-bold text-white truncate cursor-pointer hover:text-[#FF8A00] transition-colors"
                                  >
                                    {isCommentAuthor ? `${comm.userName} (You)` : comm.userName}
                                  </span>
                                  <span className="text-[10px] text-[#9AA3AF] font-medium truncate">
                                    · {formatCommentTimestamp(comm.createdAt, comm.time)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isCommentAuthor && (
                                  <button
                                    onClick={() => handleDeleteComment(comm.id)}
                                    className="text-[#9AA3AF] hover:text-rose-400 transition-colors p-0.5 cursor-pointer bg-transparent border-none"
                                    title="Delete comment"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Comment Text */}
                            <div className="text-[12.5px] text-[#E4E8EE] font-normal leading-relaxed pl-1 break-words">
                              {renderFormattedContent(comm.content)}
                            </div>

                            {/* Comment Actions */}
                            <div className="flex items-center gap-4 pl-1 pt-0.5 text-[11px]">
                              <button
                                onClick={() => handleLikeComment(comm)}
                                className={`flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0 ${commLiked ? 'text-[#FF2D8A] font-bold' : 'text-[#9AA3AF] hover:text-[#FF2D8A]'
                                  }`}
                              >
                                <Heart
                                  size={12}
                                  fill={commLiked ? '#FF2D8A' : 'none'}
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
                                className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer bg-transparent border-none p-0 ${isReplying ? 'text-[#FF8A00] font-bold' : 'text-[#9AA3AF] hover:text-[#FF8A00]'
                                  }`}
                              >
                                <CornerDownRight size={11} />
                                <span>{isReplying ? 'Cancel' : 'Reply'}</span>
                              </button>
                            </div>

                            {/* Inline Reply Input */}
                            {isReplying && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 pl-3 flex items-center gap-2"
                              >
                                <div className="flex-1 flex items-center gap-2 bg-[#111418] border border-[#2A2F36] rounded-xl p-1 pl-2.5">
                                  <span className="text-[10.5px] text-[#FF8A00] font-bold shrink-0">
                                    @{comm.userName}:
                                  </span>
                                  <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="flex-1 bg-transparent text-[11.5px] text-white placeholder:text-[#9AA3AF] outline-none font-medium"
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
                                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF2D8A] to-[#FF8A00] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
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
                              <div className="mt-1 pl-3.5 border-l-2 border-[#FF8A00]/30 flex flex-col gap-2 ml-1">
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
                                      className="bg-[#111418] border border-[#2A2F36] rounded-lg p-2 flex flex-col gap-1"
                                    >
                                      <div className="flex items-center justify-between text-[10.5px]">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          {repPhoto ? (
                                            <img
                                              src={typeof repPhoto === 'object' && repPhoto ? (repPhoto as any).src : repPhoto}
                                              alt={rep.userName}
                                              onClick={() => handleOpenUserProfile(rep.userId, rep.userHandle, rep.userName)}
                                              className="w-4 h-4 rounded-full object-cover border border-[#2A2F36] shrink-0 cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                                              title="View Profile"
                                            />
                                          ) : (
                                            <div
                                              onClick={() => handleOpenUserProfile(rep.userId, rep.userHandle, rep.userName)}
                                                className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#FF2D8A] to-[#FF8A00] text-white flex items-center justify-center text-[8px] font-black shrink-0 uppercase cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                                              title="View Profile"
                                            >
                                              {rep.userName ? rep.userName.trim().charAt(0).toUpperCase() : 'U'}
                                            </div>
                                          )}
                                          <span
                                            onClick={() => handleOpenUserProfile(rep.userId, rep.userHandle, rep.userName)}
                                            className="font-bold text-white truncate cursor-pointer hover:text-[#FF8A00] transition-colors"
                                          >
                                            {isReplyAuthor ? `${rep.userName} (You)` : rep.userName}
                                          </span>
                                          {rep.replyTo && (
                                            <span className="text-[9.5px] text-[#FF8A00] font-semibold truncate">
                                              @{rep.replyTo.replace(/^@/, '')}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="text-[9px] text-[#9AA3AF]">
                                            {formatCommentTimestamp(rep.createdAt, rep.time)}
                                          </span>
                                          {isReplyAuthor && (
                                            <button
                                              onClick={() => handleDeleteReply(comm.id, rep.id)}
                                              className="text-[#9AA3AF] hover:text-rose-400 transition-colors p-0.5 cursor-pointer bg-transparent border-none"
                                              title="Delete reply"
                                            >
                                              <Trash2 size={10} />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      <div className="text-[11.5px] text-[#E4E8EE] font-normal leading-relaxed pl-1 break-words">
                                        {renderFormattedContent(rep.content)}
                                      </div>

                                      <div className="flex items-center gap-3 pl-1 pt-0.5 text-[10px]">
                                        <button
                                          onClick={() => handleLikeReply(comm.id, rep)}
                                          className={`flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0 ${repLiked ? 'text-[#FF2D8A] font-bold' : 'text-[#9AA3AF] hover:text-[#FF2D8A]'
                                            }`}
                                        >
                                          <Heart
                                            size={11}
                                            fill={repLiked ? '#FF2D8A' : 'none'}
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
                      <div className="py-2 text-center text-[11px] text-[#9AA3AF] font-medium italic">
                      Be the first to comment on this moment! 💬
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Expanded AI ASKFlip Section ── */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-3 border-t border-[#2A2F36] flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-[#15181D] border border-white/10 shrink-0 flex items-center justify-center">
                      <img src="/images/dollyavatar.png" alt="dolphin" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">
                      ASKFlip about this moment
                    </span>
                  </div>

                  {/* Input field */}
                  <div className="flex gap-2 w-full mt-1">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="ASKFlip anything about this moment..."
                      className="flex-1 bg-[#15181D] border border-[#2A2F36] rounded-xl px-3 py-2 text-[12.5px] text-white placeholder:text-[#9AA3AF] outline-none focus:border-[#FF2D8A]/60 transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleAskFlip()}
                    />
                    <button
                      onClick={handleAskFlip}
                      disabled={!question.trim() || loadingAi}
                      className="bg-gradient-to-r from-[#FF2D8A] to-[#FF8A00] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-[12px] px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      {loadingAi ? 'Thinking...' : 'ASKFlip'}
                    </button>
                  </div>

                  {answer && (
                    <div className="text-[13px] text-[#E4E8EE] leading-relaxed bg-[#15181D] border border-[#2A2F36] rounded-xl p-3">
                      {answer}
                    </div>
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
            <div className="text-[14.5px] font-medium text-white/95 leading-relaxed break-words whitespace-pre-line">
              {renderFormattedContent(card.content)}
            </div>
            <p className="text-[11px] text-[#9AA3AF] mt-2">
              Posted by{' '}
              <span
                onClick={() => {
                  setIsFullscreen(false);
                  handleOpenAuthorProfile();
                }}
                className="text-white hover:text-[#FF8A00] cursor-pointer font-bold transition-colors"
              >
                {displayAuthor} {displayHandle ? displayHandle : ''}
              </span>{' '}
              · {getCardTime(card)} · via {card.source || 'FlipLine'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── FlipTimeline (Timeline List + Date Separators) ────────────────── */
export function FlipTimeline({
  cards,
  previewLimit,
  askOpen,
  setAskOpen,
  onCardUpdate,
  highlightedCardId,
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

  const now = Date.now();
  const visibleCards = cards.filter((c) => {
    const scheduledTime = Number(c.scheduledAt) || Number(c.scheduledTimeMs);
    if ((c.isScheduled || (scheduledTime && scheduledTime > 0)) && scheduledTime > now) {
      return false;
    }
    return true;
  });

  const displayList = [...visibleCards].sort((a, b) => {
    const timeA =
      Number((a as any).postingTime) ||
      Number(a.timeMs) ||
      Number(a.scheduledTimeMs) ||
      Number(a.scheduledAt) ||
      Number((a as any).updatedAt) ||
      Number(a.createdAt) ||
      0;
    const timeB =
      Number((b as any).postingTime) ||
      Number(b.timeMs) ||
      Number(b.scheduledTimeMs) ||
      Number(b.scheduledAt) ||
      Number((b as any).updatedAt) ||
      Number(b.createdAt) ||
      0;
    return timeB - timeA;
  });
  const finalCards = previewLimit ? displayList.slice(0, previewLimit) : displayList;

  const typeColorMap = {
    analyst: '#A855F7',
    fan: '#FF2D8A',
    official: '#FF8A00',
  };

  const typeLabelMap = {
    analyst: 'Analyst',
    fan: 'Fan ROAR',
    official: 'SF360 Drop',
  };

  // Group cards by day (date) preserving chronological order
  const dateGroups: { date: string; cards: FlipCard[] }[] = [];
  finalCards.forEach((card) => {
    const date = formatCardDate(card.day, card.timeMs, card.createdAt);
    let group = dateGroups.find((g) => g.date === date);
    if (!group) {
      group = { date, cards: [] };
      dateGroups.push(group);
    }
    group.cards.push(card);
  });

  return (
    <div className="flex flex-col w-full max-w-[680px] mx-auto relative">
      {dateGroups.map((group) => (
        <div key={group.date} className="w-full flex flex-col mb-2 sm:mb-4">
          {/* Centered Date Header with Left Pink & Right Orange Accent Lines (Figma Spec) */}
          <div className="flex items-center justify-center my-3 sm:my-4 w-full px-4">
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent to-[#FF2D8A]" />
            <span className="mx-3 px-5 py-1.5 rounded-full text-[11px] sm:text-xs font-black text-[#FFFFFF] bg-[#15181D] border border-[#2A2F36] shadow-sm uppercase tracking-wider shrink-0">
              {group.date}
            </span>
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-[#FF8A00] to-transparent" />
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
                isHighlighted={
                  Boolean(
                    highlightedCardId &&
                      (String(card.id) === String(highlightedCardId) ||
                        (card.sk && String(card.sk) === String(highlightedCardId)))
                  )
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Exported FlipLine Component ───────────────────────────────── */
export default function FlipLine({
  selectedSport = 'mixed',
  targetCardId,
}: {
  selectedSport?: string;
  targetCardId?: string | number | null;
}) {
  const router = useRouter();
  const [dbCards, setDbCards] = useState<FlipCard[]>([]);
  const [liveCards, setLiveCards] = useState<FlipCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'flipline' | 'fliparena'>('flipline');
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlCardId = targetCardId || params.get('cardId') || params.get('postId') || params.get('id');
      if (urlCardId) {
        setHighlightedCardId(String(urlCardId));
      }
      const urlItemId = params.get('itemId') || params.get('engagementId') || params.get('quizId');
      const urlTab = params.get('tab');
      if (urlItemId || urlTab === 'fliparena') {
        setActiveTab('fliparena');
      }
    }
  }, [targetCardId]);

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
            day: formatCardDate(undefined, itemTimeMs),
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

    const interval = setInterval(() => {
      updateLiveUpdates();
      fetchCards();
    }, 15000);

    const handleNewPost = () => {
      fetchCards();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('flipline-post-created', handleNewPost);
      window.addEventListener('flipline-post-updated', handleNewPost);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('flipline-post-created', handleNewPost);
        window.removeEventListener('flipline-post-updated', handleNewPost);
      }
    };
  }, []);

  const combinedCards = React.useMemo(() => {
    const seenIds = new Set<string | number>();
    const safeLive = Array.isArray(liveCards) ? liveCards : [];
    const safeDb = Array.isArray(dbCards) ? dbCards : [];
    const all = [...safeLive, ...safeDb];
    return all
      .filter((c) => {
        if (!c || seenIds.has(c.id)) return false;
        seenIds.add(c.id);
        return true;
      })
      .sort((a, b) => {
        const timeA =
          Number((a as any).postingTime) ||
          Number(a.timeMs) ||
          Number(a.scheduledTimeMs) ||
          Number(a.scheduledAt) ||
          Number((a as any).updatedAt) ||
          Number(a.createdAt) ||
          0;
        const timeB =
          Number((b as any).postingTime) ||
          Number(b.timeMs) ||
          Number(b.scheduledTimeMs) ||
          Number(b.scheduledAt) ||
          Number((b as any).updatedAt) ||
          Number(b.createdAt) ||
          0;
        return timeB - timeA;
      });
  }, [dbCards, liveCards]);

  return (
    <div className="w-full">
      {/* Top Tabs Row (Figma: FlipLINE active with pink lightning & bottom indicator vs FlipARENA inactive) */}
      <div className="px-3 sm:px-4 mb-3 sm:mb-4">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {/* FlipLINE Tab */}
          <button
            onClick={() => setActiveTab('flipline')}
            className="relative py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#111418] border border-[#2A2F36] active:scale-[0.99] overflow-hidden"
          >
            <ZapIcon color={activeTab === 'flipline' ? '#FF2D8A' : '#9AA3AF'} size={18} />
            <span
              className={`text-[13.5px] sm:text-[15px] tracking-wide transition-colors ${
                activeTab === 'flipline'
                  ? 'font-black text-[#FFFFFF]'
                  : 'font-bold text-[#9AA3AF]'
                }`}
            >
              FlipLINE
            </span>
            {activeTab === 'flipline' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF2D8A]" />
            )}
          </button>

          {/* FlipARENA Tab */}
          <button
            onClick={() => setActiveTab('fliparena')}
            className="relative py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#111418] border border-[#2A2F36] active:scale-[0.99] overflow-hidden"
          >
            <StadiumIcon color={activeTab === 'fliparena' ? '#FF2D8A' : '#9AA3AF'} size={18} />
            <span
              className={`text-[13.5px] sm:text-[15px] tracking-wide transition-colors ${
                activeTab === 'fliparena'
                  ? 'font-black text-[#FFFFFF]'
                  : 'font-bold text-[#9AA3AF]'
                }`}
            >
              FlipARENA
            </span>
            {activeTab === 'fliparena' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF2D8A]" />
            )}
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
          highlightedCardId={highlightedCardId}
        />
      )}
    </div>
  );
}