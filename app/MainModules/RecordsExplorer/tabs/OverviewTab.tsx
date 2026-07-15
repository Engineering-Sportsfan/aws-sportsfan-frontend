import { useState } from 'react';
import { Trophy, TrendingUp, Award, Star } from 'lucide-react';
import OverviewScreen from '@/pages/Overview/OverviewScreen';

export default function OverviewTab() {
  const [activeStatCard, setActiveStatCard] = useState<string | null>(null);

  const stats = [
    { id: 'total-records', label: 'Total Records', value: '156', icon: Trophy, color: '#FF7A00' },
    { id: 'active-athletes', label: 'Active Athletes', value: '240+', icon: Star, color: '#FF4DA6' },
    { id: 'medals-2024', label: 'Medals 2024', value: '12', icon: Award, color: '#FFD700' },
    { id: 'improvement', label: 'Avg Improvement', value: '+7.2%', icon: TrendingUp, color: '#06FFA5' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Quick Stats */}
      <div className="sticky top-0 z-40 bg-[#050505] border-b border-[rgba(255,255,255,0.05)] px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isActive = activeStatCard === stat.id;
            return (
              <button
                key={stat.id}
                onClick={() => setActiveStatCard(isActive ? null : stat.id)}
                className={`bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[12px] p-3 text-left transition-all ${
                  isActive
                    ? 'border-[rgba(255,122,0,0.3)] bg-[rgba(255,122,0,0.05)] scale-[1.02]'
                    : 'hover:border-[rgba(255,122,0,0.2)] active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-[28px] h-[28px] rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${stat.color}20`,
                      border: `1px solid ${stat.color}40`
                    }}
                  >
                    <Icon
                      className="w-[14px] h-[14px]"
                      style={{ color: stat.color }}
                    />
                  </div>
                </div>
                <p
                  className="text-[20px] font-bold font-['Inter:Bold',sans-serif] mb-1"
                  style={{ color: isActive ? stat.color : 'white' }}
                >
                  {stat.value}
                </p>
                <p className="text-[#99A1AF] text-[11px]">{stat.label}</p>
              </button>
            );
          })}
        </div>

        {/* Active Stat Details */}
        {activeStatCard && (
          <div className="mt-3 bg-[rgba(255,122,0,0.05)] border border-[rgba(255,122,0,0.1)] rounded-[12px] p-3 animate-[fadeIn_0.3s_ease]">
            <p className="text-white text-[12px] font-semibold mb-1">
              {stats.find(s => s.id === activeStatCard)?.label}
            </p>
            <p className="text-[#d1d5dc] text-[11px] leading-relaxed">
              Detailed insights and trends for this metric. Track performance over time with real-time updates.
            </p>
          </div>
        )}
      </div>

      {/* Overview Screen Content with Interactive Elements */}
      <div className="relative">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          [data-name*="Card"],
          [data-name*="Container"] > div[class*="rounded"] {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }
          [data-name*="Card"]:hover,
          [data-name*="Container"] > div[class*="rounded"]:hover {
            transform: translateY(-4px) scale(1.01);
            box-shadow: 0 8px 32px rgba(255, 122, 0, 0.2);
          }
          [data-name*="Card"]:active,
          [data-name*="Container"] > div[class*="rounded"]:active {
            transform: translateY(-2px) scale(0.99);
          }
          [data-name*="badge"],
          [data-name*="Badge"],
          [data-name*="tag"],
          [data-name*="Tag"] {
            background: linear-gradient(90deg,
              rgba(255,122,0,0.1) 0%,
              rgba(255,77,166,0.1) 50%,
              rgba(255,122,0,0.1) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 3s ease-in-out infinite;
          }
          [data-name*="Icon"],
          [data-name*="icon"] {
            animation: float 3s ease-in-out infinite;
          }
          svg {
            transition: all 0.2s ease;
          }
          svg:hover {
            filter: drop-shadow(0 0 8px rgba(255, 122, 0, 0.4));
          }
        `}</style>
        <OverviewScreen />
      </div>
    </div>
  );
}
