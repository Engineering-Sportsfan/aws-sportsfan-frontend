'use client';

import { useState } from 'react';
import { ChevronLeft, Flame, Trophy, Clock, Zap, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ─── Data ──────────────────────────────────────────────────────────────────

const MEDAL_TABLE = [
  { rank: 1, country: 'China', flag: '🇨🇳', code: 'CHN', gold: 125, silver: 105, bronze: 90, total: 320, highlight: false },
  { rank: 2, country: 'Japan', flag: '🇯🇵', code: 'JPN', gold: 52, silver: 60, bronze: 55, total: 167, highlight: false },
  { rank: 3, country: 'India', flag: '🇮🇳', code: 'IND', gold: 32, silver: 40, bronze: 45, total: 117, highlight: true },
  { rank: 4, country: 'South Korea', flag: '🇰🇷', code: 'KOR', gold: 32, silver: 35, bronze: 42, total: 107, highlight: false },
  { rank: 5, country: 'Indonesia', flag: '🇮🇩', code: 'INA', gold: 25, silver: 30, bronze: 25, total: 63, highlight: false },
  { rank: 6, country: 'Kazakhstan', flag: '🇰🇿', code: 'KAZ', gold: 22, silver: 18, bronze: 20, total: 60, highlight: false },
  { rank: 7, country: 'Thailand', flag: '🇹🇭', code: 'THA', gold: 15, silver: 18, bronze: 22, total: 55, highlight: false },
  { rank: 8, country: 'Uzbekistan', flag: '🇺🇿', code: 'UZB', gold: 12, silver: 16, bronze: 20, total: 48, highlight: false },
  { rank: 9, country: 'Philippines', flag: '🇵🇭', code: 'PHI', gold: 10, silver: 14, bronze: 18, total: 42, highlight: false },
  { rank: 10, country: 'Malaysia', flag: '🇲🇾', code: 'MAS', gold: 5, silver: 12, bronze: 16, total: 38, highlight: false },
];

type EventStatus = 'live' | 'upcoming' | 'result';

interface TodayEvent {
  id: string;
  sport: string;
  event: string;
  time: string;
  status: EventStatus;
  venue: string;
  icon: string;
  detail?: string;
}

const INDIA_TODAY: TodayEvent[] = [
  { id: 'e1', sport: 'Shooting', event: '10m Air Rifle Final', time: '11:00 AM', status: 'live', venue: 'Saurabh Chaudhary · 630.86 AR', icon: '🎯' },
  { id: 'e2', sport: 'Badminton', event: "Men's Singles QF", time: '01:30 PM', status: 'upcoming', venue: 'HS Prannoy · 01:30 PM', icon: '🏸' },
  { id: 'e3', sport: 'Hockey', event: 'IND vs KOR Quarter-Final', time: '03:00 PM', status: 'upcoming', venue: 'vs India Men · 03:00 PM', icon: '🏑' },
  { id: 'e4', sport: 'Hockey', event: 'IND vs PAK Semi-Final', time: '06:00 PM', status: 'upcoming', venue: 'vs India Men · 06:00 PM', icon: '🏑' },
  { id: 'e5', sport: 'Kabaddi', event: 'Kabaddi Final · India vs Iran', time: '07:30 PM', status: 'live', venue: 'vs India Men · 07:30 PM', icon: '🤼' },
  { id: 'e6', sport: 'Boxing', event: '57kg Boxing Final', time: '08:00 PM', status: 'upcoming', venue: 'Amit Panghal · 08:00 PM', icon: '🥊' },
  { id: 'e7', sport: 'Wrestling', event: "Women's 53kg Final", time: 'Finished', status: 'result', venue: 'Vinesh Phogat · Finished', icon: '🤼', detail: '🥇' },
  { id: 'e8', sport: 'Athletics', event: '100m Sprint Heat', time: 'Finished', status: 'result', venue: 'Amlan Borgohain · Finished', icon: '🏃', detail: '🏅' },
];

const PREDICTION = {
  question: 'India wins gold in kabaddi?',
  yes: 72,
  no: 28,
  totalVotes: '14.2k',
};

const BEST_SPORT_OPTIONS = [
  { label: 'Shooting', pct: 38 },
  { label: 'Hockey', pct: 52 },
  { label: 'Boxing', pct: 27 },
];

const TRIVIA_QUESTION = {
  question: 'Which sport got India its first Asian Games gold?',
  options: ['Kabaddi', 'Hockey', 'Wrestling', 'Athletics'],
  answer: 'Hockey',
};

// ─── Sub-components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EventStatus }) {
  if (status === 'live') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold bg-[#00C853] text-black px-2 py-0.5 rounded-full uppercase tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
        LIVE
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="text-[10px] font-bold border border-[#FF7A00] text-[#FF7A00] px-2 py-0.5 rounded-full uppercase tracking-wide">
        UPCOMING
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold border border-gray-600 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
      RESULT
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function AsianGamePage() {
  const router = useRouter();
  const [predVote, setPredVote] = useState<'yes' | 'no' | null>(null);
  const [triviaAnswer, setTriviaAnswer] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#08080c] text-white overflow-y-auto pb-24"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif", msOverflowStyle: 'none', scrollbarWidth: 'none' }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-[#0e0e16]/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-white truncate">Asian Games 2026 · Aichi-Nagoya</span>
              <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold bg-[#00C853] text-black px-1.5 py-0.5 rounded uppercase">
                <span className="w-1 h-1 rounded-full bg-black animate-pulse" /> LIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">Aichi-Nagoya, Japan · Aug–Sep 2026</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">

        {/* ── India Medal Card ── */}
        <div className="rounded-2xl overflow-hidden border border-[#FF7A00]/30 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #1c1008 50%, #0f1a0a 100%)' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🇮🇳</span>
                <div>
                  <p className="text-[16px] font-extrabold text-white leading-tight">India</p>
                  <p className="text-[11px] text-gray-400">Medal Base: 291</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 border border-yellow-500/30 px-3 py-1.5 rounded-full"
                style={{ background: 'linear-gradient(90deg, rgba(255,122,0,0.15), rgba(255,215,0,0.15))' }}>
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span className="text-[11px] font-bold text-yellow-400">🏆 Highest in 2026</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Gold', value: 32, color: '#FFD700', border: 'rgba(255,215,0,0.3)', bg: 'rgba(255,200,0,0.12)' },
                { label: 'Silver', value: 40, color: '#CBD5E1', border: 'rgba(203,213,225,0.3)', bg: 'rgba(203,213,225,0.08)' },
                { label: 'Bronze', value: 45, color: '#CD7F32', border: 'rgba(205,127,50,0.3)', bg: 'rgba(205,127,50,0.12)' },
                { label: 'Total', value: 117, color: '#FF7A00', border: 'rgba(255,122,0,0.3)', bg: 'rgba(255,122,0,0.12)' },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-2.5 text-center border"
                  style={{ background: m.bg, borderColor: m.border }}>
                  <p className="text-[24px] font-black leading-none" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="text-[11px] text-gray-400">Hangzhou 2022</span>
            <span className="text-[11px] text-gray-300 font-medium">Rank #4 · 107 medals total</span>
          </div>
        </div>

        {/* ── Medal Table ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-bold text-gray-300 uppercase tracking-wider">Medal Table</h2>
            <span className="text-[10px] text-[#FF7A00] font-semibold">Top 10</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: '#0f0f18' }}>
            {/* Header */}
            <div className="grid px-3 py-2 border-b border-white/8"
              style={{ gridTemplateColumns: '28px 1fr 36px 36px 36px 44px', gap: '4px', background: 'rgba(255,255,255,0.04)' }}>
              <span className="text-[10px] text-gray-500 font-semibold">#</span>
              <span className="text-[10px] text-gray-500 font-semibold">Country</span>
              <span className="text-[10px] text-yellow-400 font-bold text-center">G</span>
              <span className="text-[10px] font-bold text-center" style={{ color: '#CBD5E1' }}>S</span>
              <span className="text-[10px] text-amber-600 font-bold text-center">B</span>
              <span className="text-[10px] text-[#FF7A00] font-bold text-center">Total</span>
            </div>

            {MEDAL_TABLE.map((row, i) => (
              <div key={row.code}
                className="grid items-center px-3 py-2.5 border-b border-white/5 last:border-0"
                style={{
                  gridTemplateColumns: '28px 1fr 36px 36px 36px 44px',
                  gap: '4px',
                  background: row.highlight
                    ? 'linear-gradient(90deg, rgba(255,122,0,0.12) 0%, rgba(255,215,0,0.04) 60%, transparent 100%)'
                    : i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                }}>
                <span className="text-[12px] font-bold" style={{ color: row.highlight ? '#FF7A00' : '#6b7280' }}>{row.rank}</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base leading-none">{row.flag}</span>
                  <span className="text-[12px] font-semibold truncate" style={{ color: row.highlight ? '#fff' : '#d1d5db' }}>
                    {row.country}
                  </span>
                </div>
                <span className="text-[12px] font-bold text-yellow-400 text-center">{row.gold}</span>
                <span className="text-[12px] font-semibold text-center" style={{ color: '#CBD5E1' }}>{row.silver}</span>
                <span className="text-[12px] font-semibold text-amber-600 text-center">{row.bronze}</span>
                <span className="text-[12px] font-bold text-center" style={{ color: row.highlight ? '#FF7A00' : '#d1d5db' }}>{row.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── India Today ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-bold text-gray-300 uppercase tracking-wider">India Today</h2>
            <div className="flex items-center gap-1 text-[#00C853]">
              <Flame className="w-3 h-3" />
              <span className="text-[10px] font-bold">{INDIA_TODAY.filter(e => e.status === 'live').length} Live</span>
            </div>
          </div>

          <div className="space-y-2">
            {INDIA_TODAY.map((ev) => (
              <div key={ev.id}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{
                  background: ev.status === 'live'
                    ? 'linear-gradient(90deg, rgba(0,200,83,0.08) 0%, transparent 100%)'
                    : 'rgba(255,255,255,0.03)',
                  borderColor: ev.status === 'live' ? 'rgba(0,200,83,0.2)' : 'rgba(255,255,255,0.07)',
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: ev.status === 'live' ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.06)' }}>
                  {ev.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: ev.status === 'result' ? '#9ca3af' : '#fff' }}>
                    {ev.event}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">{ev.venue}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ev.detail && <span className="text-base">{ev.detail}</span>}
                  <StatusBadge status={ev.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fan Zone ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[#FF7A00]" />
            <h2 className="text-[13px] font-bold text-gray-300 uppercase tracking-wider">Fan Zone</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Prediction */}
            <div className="rounded-2xl p-3 border border-white/8" style={{ background: 'linear-gradient(160deg, #0f0f20 0%, #08080c 100%)' }}>
              <span className="text-[9px] font-bold text-[#FF7A00] uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,122,0,0.12)' }}>Prediction</span>
              <p className="text-[12px] font-bold text-white mt-2 mb-3 leading-snug">{PREDICTION.question}</p>

              <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${PREDICTION.yes}%`, background: 'linear-gradient(90deg, #00C853, #69F0AE)' }} />
              </div>
              <div className="flex justify-between text-[10px] mb-3">
                <span className="text-[#00C853] font-bold">Yes {PREDICTION.yes}%</span>
                <span className="text-gray-400">No {PREDICTION.no}%</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {(['yes', 'no'] as const).map((v) => (
                  <button key={v} onClick={() => setPredVote(v)}
                    className="py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all"
                    style={{
                      background: predVote === v
                        ? v === 'yes' ? '#00C853' : '#ef4444'
                        : 'rgba(255,255,255,0.08)',
                      color: predVote === v ? (v === 'yes' ? '#000' : '#fff') : '#d1d5db',
                    }}>
                    {v === 'yes' ? '✅' : '❌'} {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-2">{PREDICTION.totalVotes} votes</p>
            </div>

            {/* Best Sport Trivia */}
            <div className="rounded-2xl p-3 border border-white/8" style={{ background: 'linear-gradient(160deg, #0f0f20 0%, #08080c 100%)' }}>
              <span className="text-[9px] font-bold text-[#FF7A00] uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,122,0,0.12)' }}>Revealed</span>
              <p className="text-[12px] font-bold text-white mt-2 mb-3 leading-snug">Best Asian Games sport for India?</p>

              <div className="space-y-2">
                {BEST_SPORT_OPTIONS.map((opt) => (
                  <div key={opt.label}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[11px] font-semibold" style={{ color: opt.label === 'Hockey' ? '#FFD700' : '#9ca3af' }}>{opt.label}</span>
                      <span className="text-[10px] text-gray-500">{opt.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${opt.pct}%`,
                          background: opt.label === 'Hockey'
                            ? 'linear-gradient(90deg, #FFD700, #FF7A00)'
                            : 'rgba(255,255,255,0.25)',
                        }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-1 rounded-lg px-2 py-1.5 border border-yellow-500/20"
                style={{ background: 'rgba(255,215,0,0.08)' }}>
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] font-bold text-yellow-400">Hockey leads!</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trivia Quiz ── */}
        <div className="rounded-2xl p-4 border border-white/8" style={{ background: 'linear-gradient(160deg, #0f0f20 0%, #08080c 100%)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-[#FF7A00] uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,122,0,0.12)' }}>Trivia</span>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Clock className="w-3 h-3" />
              <span>+50 pts</span>
            </div>
          </div>

          <p className="text-[14px] font-bold text-white mt-2 mb-4 leading-snug">{TRIVIA_QUESTION.question}</p>

          <div className="grid grid-cols-2 gap-2">
            {TRIVIA_QUESTION.options.map((opt) => {
              const isCorrect = opt === TRIVIA_QUESTION.answer;
              const isSelected = triviaAnswer === opt;
              const revealed = triviaAnswer !== null;

              let bg = 'rgba(255,255,255,0.06)';
              let border = 'rgba(255,255,255,0.1)';
              let color = '#e5e7eb';

              if (revealed) {
                if (isCorrect) { bg = 'rgba(0,200,83,0.15)'; border = 'rgba(0,200,83,0.4)'; color = '#00C853'; }
                else if (isSelected) { bg = 'rgba(239,68,68,0.15)'; border = 'rgba(239,68,68,0.4)'; color = '#f87171'; }
                else { bg = 'rgba(255,255,255,0.02)'; border = 'rgba(255,255,255,0.05)'; color = '#6b7280'; }
              }

              return (
                <button key={opt}
                  onClick={() => !triviaAnswer && setTriviaAnswer(opt)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-all"
                  style={{ background: bg, borderColor: border, color }}>
                  <span>{opt}</span>
                  {revealed && isCorrect && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {triviaAnswer && (
            <div className="mt-3 px-3 py-2 rounded-lg text-[12px] font-semibold text-center"
              style={{
                background: triviaAnswer === TRIVIA_QUESTION.answer ? 'rgba(0,200,83,0.12)' : 'rgba(239,68,68,0.12)',
                color: triviaAnswer === TRIVIA_QUESTION.answer ? '#00C853' : '#f87171',
              }}>
              {triviaAnswer === TRIVIA_QUESTION.answer
                ? '🎉 Correct! India won its first Asian Games gold in Hockey (1951).'
                : `❌ Incorrect! The answer is ${TRIVIA_QUESTION.answer}.`}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
