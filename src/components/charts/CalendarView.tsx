import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Headphones, Play, FileText, X, Clock } from 'lucide-react';
import type { PlaybookDrop, PlaybookWeek } from '@/types/playbook';

const typeConfig = {
  Audio: { icon: Headphones, color: '#c9115f', bg: 'rgba(201,17,95,0.12)' },
  Video: { icon: Play, color: '#ff5900', bg: 'rgba(255,89,0,0.12)' },
  Article: { icon: FileText, color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
} as const;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const MONTH_MAP: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};
// Maps each dateKey → the drops scheduled on that exact date
function buildContentByDate(
  playbook: PlaybookWeek[],
): Record<string, PlaybookDrop[]> {
  const map: Record<string, PlaybookDrop[]> = {};

  playbook.forEach((week) => {
    week.drops.forEach((drop) => {
      if (!map[drop.date]) {
        map[drop.date] = [];
      }

      map[drop.date].push(drop);
    });
  });

  return map;
}



function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface Props {
  playbook: PlaybookWeek[];
  onNavigate: (path: string) => void;
}

function isFuture(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d > today;
}

export default function CalendarView({
  playbook,
  onNavigate,
}: Props) {
  const _now = new Date();
  const [year, setYear] = useState(_now.getFullYear());
  const [month, setMonth] = useState(_now.getMonth()); // 0-indexed, defaults to current month
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // dateKey → drops on that exact date
  const contentByDate = useMemo(() => buildContentByDate(playbook), [playbook]);
  console.log(contentByDate);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  // Only drops whose date === selected calendar date
  const selectedContent: PlaybookDrop[] = selectedDate ? (contentByDate[selectedDate] ?? []) : [];
  const isFutureDate = selectedDate ? isFuture(selectedDate) : false;
  const selectedDay = selectedDate ? parseInt(selectedDate.split('-')[2]) : null;

  return (
    <div className="w-full px-4 py-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <h3 className="text-white font-bold text-[16px] font-['Inter:Bold',sans-serif]">
          {MONTHS[month]} {year}
        </h3>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[#99a1af] text-[11px] font-semibold py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: totalCells }).map((_, i) => {
          const dayNum = i - firstDay + 1;
          const isValid = dayNum >= 1 && dayNum <= daysInMonth;
          const key = isValid ? dateKey(year, month, dayNum) : null;
          const hasContent = key ? !!(contentByDate[key]?.length) : false;
          const isSelected = key === selectedDate;
          const count = key && contentByDate[key] ? contentByDate[key].length : 0;
          const cellFuture = key ? isFuture(key) : false;

          return (
            <div key={i} className="flex flex-col items-center py-1">
              {isValid ? (
                <button
                  onClick={() => setSelectedDate(isSelected ? null : key!)}
                  className="w-[38px] h-[38px] rounded-full flex flex-col items-center justify-center relative transition-all active:scale-95"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, #ff5900, #c9115f)'
                      : hasContent
                        ? cellFuture ? 'rgba(99,102,241,0.12)' : 'rgba(255,89,0,0.12)'
                      : 'transparent',
                    border: isSelected
                      ? 'none'
                      : hasContent
                        ? cellFuture ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,89,0,0.3)'
                        : '1px solid transparent',
                  }}
                >
                  <span
                    className="text-[13px] font-medium leading-none"
                    style={{ color: isSelected ? 'white' : hasContent ? (cellFuture ? '#818cf8' : '#ff5900') : '#d1d5dc' }}
                  >
                    {dayNum}
                  </span>
                  {hasContent && !isSelected && (
                    <div className="flex gap-[2px] mt-[2px]">
                      {Array.from({ length: Math.min(count, 3) }).map((_, di) => (
                        <div key={di} className="w-[4px] h-[4px] rounded-full" style={{ background: cellFuture ? '#818cf8' : '#ff5900' }} />
                      ))}
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-[38px] h-[38px]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected date content panel */}
      {selectedDate && (
        <div
          className="mt-5 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a1a26 0%, #15151e 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">
            <div>
              <p className="text-white font-semibold text-[14px] font-['Inter:Semi_Bold',sans-serif]">
                {MONTHS[month]} {selectedDay}, {year}
              </p>
              <p className="text-[#99a1af] text-[12px] mt-[1px]">
                {selectedContent.length === 0
                  ? 'No drops scheduled'
                  : isFutureDate
                    ? `${selectedContent.length} drop${selectedContent.length > 1 ? 's' : ''} scheduled`
                    : `${selectedContent.length} drop${selectedContent.length > 1 ? 's' : ''} available`}
              </p>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <X className="w-3 h-3 text-[#99a1af]" />
            </button>
          </div>

          {/* Future date notice banner */}
          {isFutureDate && selectedContent.length > 0 && (
            <div
              className="mx-4 mt-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: '#818cf8' }} />
              <p className="text-[11px]" style={{ color: '#818cf8' }}>
                These drops are not yet available. Check back on the scheduled date.
              </p>
            </div>
          )}

          {/* Content items */}
          {selectedContent.length > 0 ? (
            <div className="p-4 space-y-3">
              {selectedContent.map((item, idx) => {
                const cfg = typeConfig[item.type] ?? typeConfig.Article;
                const Icon = cfg.icon;

                return (
                  <button
                    key={idx}
                    disabled={isFutureDate}
                    onClick={() => {
                      if (!isFutureDate && item.path) {
                        onNavigate(item.path);
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all ${isFutureDate ? 'opacity-60 cursor-not-allowed' : 'active:opacity-70'
                      }`}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: isFutureDate ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: isFutureDate ? 'rgba(99,102,241,0.12)' : cfg.bg }}
                    >
                      {isFutureDate
                        ? <Clock className="w-[18px] h-[18px]" style={{ color: '#818cf8' }} />
                        : <Icon className="w-[18px] h-[18px]" style={{ color: cfg.color }} />
                      }
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-semibold font-['Inter:Semi_Bold',sans-serif] leading-tight truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[10px] px-[6px] py-[2px] rounded-full font-medium"
                          style={{
                            color: isFutureDate ? '#818cf8' : cfg.color,
                            background: isFutureDate ? 'rgba(99,102,241,0.12)' : cfg.bg,
                          }}
                        >
                          {item.type}
                        </span>
                        <span className="text-[#99a1af] text-[11px] truncate">
                          {isFutureDate ? `Scheduled · ${item.date}` : (item.meta ?? item.date)}
                        </span>
                      </div>
                    </div>

                    {/* Right indicator */}
                    {!isFutureDate && (
                      <div className="shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M5 3L9 7L5 11" stroke="#99a1af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    {isFutureDate && (
                      <div className="shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="3" y="4.5" width="8" height="7" rx="1.5" stroke="#818cf8" strokeWidth="1.3" />
                          <path d="M4.5 4.5V3.5a2.5 2.5 0 0 1 5 0v1" stroke="#818cf8" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <FileText className="w-5 h-5 text-[#99a1af]" />
              </div>
              <p className="text-[#99a1af] text-[13px] text-center">No content scheduled for this date.</p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-3 justify-center flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-[6px] h-[6px] rounded-full" style={{ background: '#ff5900' }} />
          <span className="text-[#99a1af] text-[11px]">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[6px] h-[6px] rounded-full" style={{ background: '#818cf8' }} />
          <span className="text-[#99a1af] text-[11px]">Scheduled (future)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[6px] h-[6px] rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <span className="text-[#99a1af] text-[11px]">No content</span>
        </div>
      </div>
    </div>
  );
}
