import { Headphones, Play, FileText, Lock, Calendar } from 'lucide-react';
import type { PlaybookWeek } from '@/types/playbook';

interface Props {
  playbook: PlaybookWeek[];
  onNavigate: (path: string) => void;
}

const typeConfig = {
  Audio: {
    icon: Headphones,
    color: '#c9115f',
    bg: 'rgba(201,17,95,0.12)',
  },
  Video: {
    icon: Play,
    color: '#ff5900',
    bg: 'rgba(255,89,0,0.12)',
  },
  Article: {
    icon: FileText,
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.12)',
  },
};

function getDateStatus(dateStr: string): 'past' | 'today' | 'future' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() < today.getTime()) return 'past';
  if (d.getTime() === today.getTime()) return 'today';
  return 'future';
}

export default function AgendaView({ playbook, onNavigate }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Show today + future drops; hide past
  const drops = playbook
    .flatMap((week) =>
      week.drops.map((drop) => ({
        ...drop,
        week: week.week,
        theme: week.theme,
      })),
    )
    .filter((drop) => {
      const d = new Date(drop.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() >= today.getTime();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="px-4 py-4 space-y-3">
      {drops.map((drop) => {
        const cfg = typeConfig[drop.type] ?? typeConfig.Article;
        const Icon = cfg.icon;
        const status = getDateStatus(drop.date);
        const isToday = status === 'today';
        const isFuture = status === 'future';

        return (
          <button
            key={drop.id}
            disabled={isFuture}
            onClick={() => !isFuture && drop.path && onNavigate(drop.path)}
            className={`w-full rounded-2xl p-4 text-left transition-all ${
              isFuture ? 'cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.98]'
            }`}
            style={{
              background: isToday
                ? 'linear-gradient(135deg, #1e1a26 0%, #1a1520 100%)'
                : isFuture
                ? 'linear-gradient(135deg, #111116 0%, #0e0e12 100%)'
                : 'linear-gradient(135deg, #1a1a26 0%, #15151e 100%)',
              border: isToday
                ? '1px solid rgba(255,89,0,0.35)'
                : isFuture
                ? '1px solid rgba(255,255,255,0.04)'
                : '1px solid rgba(255,255,255,0.08)',
              opacity: isFuture ? 0.55 : 1,
            }}
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: isFuture ? 'rgba(255,255,255,0.04)' : cfg.bg }}
              >
                {isFuture ? (
                  <Lock className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                ) : (
                  <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-[14px] font-semibold truncate"
                  style={{ color: isFuture ? 'rgba(255,255,255,0.35)' : 'white' }}
                >
                  {drop.title}
                </h3>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] px-2 py-1 rounded-full"
                    style={{
                      color: isFuture ? 'rgba(255,255,255,0.25)' : cfg.color,
                      background: isFuture ? 'rgba(255,255,255,0.04)' : cfg.bg,
                    }}
                  >
                    {drop.type}
                  </span>
                  <span className="text-[#99a1af] text-[11px]">{drop.meta}</span>
                </div>

                <div className="flex items-center gap-1 mt-2 text-[11px]" style={{ color: isFuture ? 'rgba(255,255,255,0.2)' : '#99a1af' }}>
                  <Calendar className="w-3 h-3" />
                  <span>{drop.day ? `${drop.day}, ${drop.date}` : drop.date}</span>
                </div>
              </div>

              {/* Right badge */}
              <div className="shrink-0">
                {isToday && (
                  <span
                    className="text-[11px] font-bold px-2 py-1 rounded-full"
                    style={{ color: '#ff5900', background: 'rgba(255,89,0,0.15)' }}
                  >
                    Today
                  </span>
                )}
                {isFuture && (
                  <div className="flex flex-col items-center gap-0.5">
                    <Lock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      Soon
                    </span>
                  </div>
                )}
                {!isToday && !isFuture && (
                  <span className="text-[#22c55e] text-[11px] font-medium">Open</span>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {drops.length === 0 && (
        <div className="text-center py-16 text-[#99a1af]">No upcoming drops.</div>
      )}
    </div>
  );
}