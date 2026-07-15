import { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import TrendsScreen from '../figma/RecordsExplorer-48-925';

export default function TrendsTab() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 12 Months');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [hoveredGraph, setHoveredGraph] = useState<string | null>(null);

  const timeframes = ['Last 3 Months', 'Last 6 Months', 'Last 12 Months', 'Last 2 Years', 'All Time'];

  return (
    <div className="relative min-h-screen">
      {/* Timeframe Selector */}
      <div className="sticky top-0 z-40 bg-[#050505] border-b border-[rgba(255,255,255,0.05)] px-4 py-3">
        <div className="relative">
          <button
            onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 flex items-center justify-between hover:border-[rgba(255,122,0,0.2)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-[14px] h-[14px] text-[#FF7A00]" />
              <span className="text-white text-[13px] font-semibold">{selectedTimeframe}</span>
            </div>
            <ChevronDown className="w-[14px] h-[14px] text-[#99A1AF]" />
          </button>

          {showTimeframeDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[12px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => {
                    setSelectedTimeframe(timeframe);
                    setShowTimeframeDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors ${
                    selectedTimeframe === timeframe
                      ? 'bg-[rgba(255,122,0,0.1)] text-[#FF7A00] font-semibold'
                      : 'text-white hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trends Screen Content with Micro Interactions */}
      <div
        className="relative"
        onClick={() => setShowTimeframeDropdown(false)}
        onMouseMove={(e) => {
          const target = e.target as HTMLElement;
          const graphElement = target.closest('[data-name*="Graph"]') ||
                              target.closest('[data-name*="Chart"]') ||
                              target.closest('svg');
          if (graphElement) {
            setHoveredGraph('graph-element');
          } else {
            setHoveredGraph(null);
          }
        }}
      >
        <style>{`
          svg path,
          svg rect,
          svg circle {
            transition: all 0.2s ease;
          }
          svg:hover path,
          svg:hover rect,
          svg:hover circle {
            filter: brightness(1.15);
          }
          [data-name*="Graph"],
          [data-name*="Chart"],
          [data-name*="stat"] {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }
          [data-name*="Graph"]:hover,
          [data-name*="Chart"]:hover,
          [data-name*="stat"]:hover {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
          [data-name*="Graph"]:active,
          [data-name*="Chart"]:active,
          [data-name*="stat"]:active {
            transform: scale(0.98);
          }
          [data-name*="Card"] {
            transition: all 0.3s ease;
          }
          [data-name*="Card"]:hover {
            box-shadow: 0 8px 32px rgba(255, 122, 0, 0.2);
          }
        `}</style>
        <TrendsScreen />
      </div>

      {/* Hover Tooltip */}
      {hoveredGraph && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#111111] border border-[rgba(255,122,0,0.3)] rounded-[12px] px-4 py-2 shadow-[0_0_20px_rgba(255,122,0,0.2)] z-50 pointer-events-none">
          <p className="text-white text-[12px] font-semibold">Tap to view details</p>
        </div>
      )}
    </div>
  );
}
