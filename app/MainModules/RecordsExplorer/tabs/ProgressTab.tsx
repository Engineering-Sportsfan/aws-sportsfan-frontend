import { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import ProgressScreen from '../figma/RecordsExplorer-48-933';

export default function ProgressTab() {
  const [selectedAthlete, setSelectedAthlete] = useState('Neeraj Chopra');
  const [showAthleteDropdown, setShowAthleteDropdown] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('Distance');
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);

  const athletes = [
    'Neeraj Chopra',
    'Avinash Sable',
    'Kishore Jena',
    'Murali Sreeshankar',
    'Tajinderpal Singh Toor',
  ];

  const metrics = ['Distance', 'Speed', 'Consistency', 'Technique Score'];

  return (
    <div className="relative min-h-screen">
      {/* Athlete & Metric Selector */}
      <div className="sticky top-0 z-40 bg-[#050505] border-b border-[rgba(255,255,255,0.05)] px-4 py-3">
        <div className="flex gap-2 mb-2">
          {/* Athlete Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setShowAthleteDropdown(!showAthleteDropdown);
                setShowMetricDropdown(false);
              }}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 flex items-center justify-between hover:border-[rgba(255,122,0,0.2)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-[14px] h-[14px] text-[#FF7A00]" />
                <span className="text-white text-[13px] font-semibold truncate">{selectedAthlete}</span>
              </div>
              <ChevronDown className="w-[14px] h-[14px] text-[#99A1AF] shrink-0" />
            </button>

            {showAthleteDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[12px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50">
                {athletes.map((athlete) => (
                  <button
                    key={athlete}
                    onClick={() => {
                      setSelectedAthlete(athlete);
                      setShowAthleteDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors ${
                      selectedAthlete === athlete
                        ? 'bg-[rgba(255,122,0,0.1)] text-[#FF7A00] font-semibold'
                        : 'text-white hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    {athlete}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metric Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMetricDropdown(!showMetricDropdown);
                setShowAthleteDropdown(false);
              }}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 flex items-center gap-2 hover:border-[rgba(255,122,0,0.2)] transition-colors whitespace-nowrap"
            >
              <span className="text-white text-[13px] font-semibold">{selectedMetric}</span>
              <ChevronDown className="w-[14px] h-[14px] text-[#99A1AF]" />
            </button>

            {showMetricDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-[12px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 min-w-[160px]">
                {metrics.map((metric) => (
                  <button
                    key={metric}
                    onClick={() => {
                      setSelectedMetric(metric);
                      setShowMetricDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors ${
                      selectedMetric === metric
                        ? 'bg-[rgba(255,122,0,0.1)] text-[#FF7A00] font-semibold'
                        : 'text-white hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Bar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(255,122,0,0.05)] border border-[rgba(255,122,0,0.1)] rounded-[12px]">
          <div className="w-[6px] h-[6px] rounded-full bg-[#06FFA5] animate-pulse" />
          <p className="text-[#d1d5dc] text-[11px]">
            Tracking {selectedAthlete}'s {selectedMetric.toLowerCase()} over time
          </p>
        </div>
      </div>

      {/* Progress Screen Content with Animations */}
      <div
        className="relative"
        onClick={() => {
          setShowAthleteDropdown(false);
          setShowMetricDropdown(false);
        }}
      >
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 8px rgba(255, 122, 0, 0.2); }
            50% { box-shadow: 0 0 16px rgba(255, 122, 0, 0.4); }
          }
          @keyframes progress-fill {
            from { width: 0; }
            to { width: 100%; }
          }
          [data-name*="progress"],
          [data-name*="Progress"] {
            overflow: hidden;
          }
          [data-name*="progress"] > div,
          [data-name*="Progress"] > div {
            animation: progress-fill 1.5s ease-out;
          }
          [data-name*="stat"],
          [data-name*="Stat"],
          [data-name*="Card"] {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }
          [data-name*="stat"]:hover,
          [data-name*="Stat"]:hover,
          [data-name*="Card"]:hover {
            transform: translateY(-2px) scale(1.01);
            animation: pulse-glow 2s ease-in-out infinite;
          }
          [data-name*="stat"]:active,
          [data-name*="Stat"]:active,
          [data-name*="Card"]:active {
            transform: translateY(0) scale(0.99);
          }
          svg path,
          svg circle,
          svg line {
            transition: all 0.2s ease;
          }
          svg:hover path,
          svg:hover circle,
          svg:hover line {
            stroke-width: 1.5;
            filter: drop-shadow(0 0 4px rgba(255, 122, 0, 0.5));
          }
        `}</style>
        <ProgressScreen />
      </div>
    </div>
  );
}
