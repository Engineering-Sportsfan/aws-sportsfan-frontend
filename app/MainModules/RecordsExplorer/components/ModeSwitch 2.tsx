import { motion } from 'framer-motion';
import { Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { ViewMode } from '../page';

interface ModeSwitchProps {
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const modes: { value: ViewMode; label: string; icon: typeof Trophy }[] = [
  { value: 'Records', label: 'Records', icon: Trophy },
  { value: 'Trends', label: 'Trends', icon: TrendingUp },
  { value: 'Progress', label: 'Progress', icon: BarChart3 },
];

export default function ModeSwitch({ viewMode, onModeChange }: ModeSwitchProps) {
  return (
    <div
      className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-1.5 flex gap-1"
      role="tablist"
      aria-label="View mode selection"
    >
      {modes.map((mode) => {
        const isActive = viewMode === mode.value;
        const Icon = mode.icon;

        return (
          <button
            key={mode.value}
            onClick={() => onModeChange(mode.value)}
            role="tab"
            aria-selected={isActive}
            aria-label={`${mode.label} view`}
            aria-controls={`${mode.value.toLowerCase()}-panel`}
            className="flex-1 relative py-3 min-h-[44px] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9115F] focus:ring-offset-2 focus:ring-offset-[#15151c]"
          >
            {isActive && (
              <motion.div
                layoutId="mode-background"
                className="absolute inset-0 rounded-xl"
                style={{ background: 'linear-gradient(137.15deg, rgba(201, 17, 95, 0.2) 0%, rgba(201, 17, 95, 0.05) 100%)' }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                aria-hidden="true"
              />
            )}
            <div className="relative flex items-center justify-center gap-2">
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-[#C9115F]' : 'text-[#99a1af]'
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-sm font-medium transition-colors tracking-[-0.015em] ${
                  isActive ? 'text-white' : 'text-[#99a1af]'
                }`}
              >
                {mode.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}