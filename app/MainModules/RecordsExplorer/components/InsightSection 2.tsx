import { motion } from 'framer-motion';
import { Info, TrendingDown, TrendingUp, Minus, Award } from 'lucide-react';
import { Category } from '../page';
import { useRecordInsight } from '../../../../hooks/useRecords';

interface InsightSectionProps {
  event: string;
  category: Category;
}

/** Human-readable labels for event keys — same map as FilterPanel */
const eventLabels: Record<string, string> = {
  '100m': '100m', '200m': '200m', '400m': '400m', '400mH': '400m Hurdles',
  '800m': '800m', '1500m': '1500m', '3000m': '3000m', '5000m': '5000m',
  ShotPut: 'Shot Put', DiscusThrow: 'Discus Throw',
  JavelinThrow: 'Javelin Throw', HammerThrow: 'Hammer Throw',
  HighJump: 'High Jump', LongJump: 'Long Jump',
  TripleJump: 'Triple Jump', PoleVault: 'Pole Vault',
  '4x100m': '4×100m', '4x400m': '4×400m',
};

export default function InsightSection({ event, category }: InsightSectionProps) {
  const { insight, loading } = useRecordInsight(event, category);
  const eventLabel = eventLabels[event] ?? event;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-6">
          <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-3" />
          <div className="h-3 bg-[#1a1a1a] rounded w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-5">
            <div className="h-8 bg-[#1a1a1a] rounded mb-2" />
            <div className="h-3 bg-[#1a1a1a] rounded w-2/3" />
          </div>
          <div className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-5">
            <div className="h-8 bg-[#1a1a1a] rounded mb-2" />
            <div className="h-3 bg-[#1a1a1a] rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!insight) return null;

  // ── Gap-reduction display logic ──────────────────────────────────────────
  const gapNum = parseFloat(insight.gapReductionPercent);
  const isNarrowing = gapNum > 0;
  const isWidening = gapNum < 0;
  const isFlat = gapNum === 0;

  const TrendIcon = isNarrowing ? TrendingDown : isWidening ? TrendingUp : Minus;
  const trendColor = isNarrowing ? '#22c55e' : isWidening ? '#ef4444' : '#99a1af';
  const gapDisplay = isWidening
    ? `+${Math.abs(gapNum).toFixed(1)}%` // widening → gap is growing
    : `${Math.abs(gapNum).toFixed(1)}%`;
  const gapLabel = isNarrowing ? 'Reduction' : isWidening ? 'Widening' : 'No Change';

  // ── Global rank display ───────────────────────────────────────────────────
  const hasRank = insight.globalRank !== 'N/A';

  return (
    <motion.section
      key={`${event}-${category}-insight`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
      aria-labelledby="insights-heading"
    >
      <h2 id="insights-heading" className="sr-only">Performance Insights</h2>

      {/* Main Insight — Performance Gap */}
      <div
        className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-6"
        style={{ background: 'linear-gradient(137.15deg, rgba(201, 17, 95, 0.2) 0%, rgba(201, 17, 95, 0.05) 100%)' }}
        role="article"
        aria-labelledby="performance-gap-heading"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(137.15deg, rgba(201, 17, 95, 0.3) 0%, rgba(201, 17, 95, 0.1) 100%)' }}
            aria-hidden="true"
          >
            <Info className="w-6 h-6 text-[#C9115F]" />
          </div>
          <div>
            <h3 id="performance-gap-heading" className="font-bold text-white mb-2 text-base tracking-[-0.015em]">Performance Gap</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              India is <strong className="text-[#C9115F] font-bold text-base">{insight.formattedDiff}</strong>{' '}
              <span className="text-white/70">({insight.percentage}%)</span> behind the world record.
            </p>
            {insight.trendDirection && (
              <p className="text-xs text-[#99a1af] mt-2 leading-relaxed">
                Trend: <span className="font-semibold text-white/80">{insight.trendDirection}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-2 gap-4" role="list" aria-label="Additional statistics">

        {/* Gap Reduction */}
        <div className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-5" role="listitem">
          <div className="flex items-center gap-2 mb-3">
            <TrendIcon className="w-5 h-5" style={{ color: trendColor }} aria-hidden="true" />
            <span className="text-xs text-[#99a1af] font-semibold uppercase tracking-wide">Gap {gapLabel}</span>
          </div>

          {isFlat ? (
            <p className="text-2xl font-bold tracking-[-0.02em]" style={{ color: trendColor }} aria-label="No change">
              —
            </p>
          ) : (
            <p
              className="text-2xl font-bold tracking-[-0.02em]"
              style={{ color: trendColor }}
              aria-label={`${gapDisplay} gap ${gapLabel.toLowerCase()}`}
            >
              {gapDisplay}
            </p>
          )}

          <p className="text-xs text-[#99a1af] mt-2">
            {isFlat
              ? 'No change since ' + insight.baselineYear
              : `Since ${insight.baselineYear}`}
          </p>
        </div>

        {/* Global Rank */}
        <div className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-5" role="listitem">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-[#C9115F]" aria-hidden="true" />
            <span className="text-xs text-[#99a1af] font-semibold uppercase tracking-wide">
              {hasRank ? 'World Rank' : 'Global Rank'}
            </span>
          </div>

          <p
            className="text-2xl font-bold tracking-[-0.02em]"
            style={{ color: hasRank ? '#C9115F' : '#99a1af' }}
            aria-label={hasRank ? `World rank ${insight.globalRank}` : 'Not available'}
          >
            {insight.globalRank}
          </p>

          <p className="text-xs text-[#99a1af] mt-2">
            {hasRank ? `In ${eventLabel}` : 'Not confirmed'}
          </p>
        </div>

      </div>
    </motion.section>
  );
}