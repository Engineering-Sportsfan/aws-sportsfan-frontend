import { useState } from 'react';
import { ChevronDown, ChevronUp, Headphones, Play, FileText, Zap } from 'lucide-react';
import type { PlaybookWeek } from '@/types/playbook';

const typeConfig: Record<'Audio' | 'Video' | 'Article', {
  icon: typeof Headphones | typeof Play | typeof FileText;
  color: string;
  bg: string;
}> = {
  Audio: { icon: Headphones, color: '#c9115f', bg: 'rgba(201,17,95,0.12)' },
  Video: { icon: Play, color: '#ff5900', bg: 'rgba(255,89,0,0.12)' },
  Article: { icon: FileText, color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
};

interface Props {
  playbook: PlaybookWeek[];
  onNavigate: (path: string) => void;
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
}

function isPastOrToday(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d.getTime() <= today.getTime();
}

export default function TimelineView({ playbook, onNavigate }: Props) {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1]));

  const toggleWeek = (week: number) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  return (
    <div className="w-full px-4 py-4 space-y-4">
      {playbook.map((w) => {
        // Only show drops that are on or before today
        const visibleDrops = w.drops.filter((d) => isPastOrToday(d.date));
        const isOpen = openWeeks.has(w.week);

        return (
          <div
            key={w.week}
            className="rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]"
            style={{ background: 'linear-gradient(135deg, #1a1a26 0%, #15151e 100%)' }}
          >
            <button
              className="w-full flex items-center justify-between px-4 py-4 text-left active:opacity-80 transition-opacity"
              onClick={() => toggleWeek(w.week)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isOpen
                      ? 'linear-gradient(135deg, #ff5900, #c9115f)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <span className="text-white font-bold text-[13px]">{w.week}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-[15px] font-['Inter:Semi_Bold',sans-serif]">
                      {w.label}
                    </span>
                    {w.theme ? (
                      <span
                        className="text-[10px] font-semibold px-2 py-[2px] rounded-full"
                        style={{ color: '#ff5900', background: 'rgba(255,89,0,0.15)' }}
                      >
                        {w.theme}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[#99a1af] text-[12px] font-['Inter:Regular',sans-serif]">
                    {w.dateRange}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#99a1af] text-[11px]">
                  {visibleDrops.length} drop{visibleDrops.length !== 1 ? 's' : ''}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#99a1af]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#99a1af]" />
                )}
              </div>
            </button>

            {isOpen && (
              <div
                className="px-4 pb-4 space-y-3 border-t border-[rgba(255,255,255,0.06)]"
                style={{ paddingTop: '12px' }}
              >
                {visibleDrops.length === 0 ? (
                  <p className="text-center text-[#99a1af] text-[12px] py-4">
                    No drops released yet for this week.
                  </p>
                ) : (
                  visibleDrops.map((drop) => {
                    const cfg = typeConfig[drop.type] ?? typeConfig.Article;
                    const Icon = cfg.icon;
                    const todayDrop = isToday(drop.date);

                    return (
                      <button
                        key={drop.id}
                        onClick={() => {
                          if (drop.path) onNavigate(drop.path);
                        }}
                        className="w-full flex items-center gap-3 rounded-xl p-3 text-left active:opacity-70 transition-opacity hover:brightness-110"
                        style={{
                          background: todayDrop
                            ? 'rgba(255,89,0,0.07)'
                            : 'rgba(255,255,255,0.04)',
                          border: todayDrop
                            ? '1px solid rgba(255,89,0,0.25)'
                            : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div
                          className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: cfg.bg }}
                        >
                          <Icon className="w-[18px] h-[18px]" style={{ color: cfg.color }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[13px] font-semibold font-['Inter:Semi_Bold',sans-serif] leading-tight truncate">
                            {drop.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-[10px] px-[6px] py-[2px] rounded-full font-medium"
                              style={{ color: cfg.color, background: cfg.bg }}
                            >
                              {drop.type}
                            </span>
                            <span className="text-[#99a1af] text-[11px]">{drop.meta}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-[#99a1af] text-[11px]">
                            {drop.day ?? drop.date}
                          </span>
                          {todayDrop && (
                            <span
                              className="text-[10px] font-semibold mt-1 px-1.5 py-[1px] rounded-full"
                              style={{ color: '#ff5900', background: 'rgba(255,89,0,0.15)' }}
                            >
                              Today
                            </span>
                          )}
                          {!todayDrop && <Zap className="w-3 h-3 text-[#ff5900] mt-1" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
