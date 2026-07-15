import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, Calendar } from 'lucide-react';
import { Category } from '../page';
import { useRecordProgress } from '../../../../hooks/useRecords';

interface ProgressViewProps {
  event: string;
  category: Category;
}

/** Human-readable labels for event keys, matching FilterPanel */
const eventLabels: Record<string, string> = {
  '100m': '100m', '200m': '200m', '400m': '400m', '400mH': '400m Hurdles',
  '800m': '800m', '1500m': '1500m', '3000m': '3000m', '5000m': '5000m',
  ShotPut: 'Shot Put', DiscusThrow: 'Discus Throw',
  JavelinThrow: 'Javelin Throw', HammerThrow: 'Hammer Throw',
  HighJump: 'High Jump', LongJump: 'Long Jump',
  TripleJump: 'Triple Jump', PoleVault: 'Pole Vault',
  '4x100m': '4×100m', '4x400m': '4×400m',
};

export default function ProgressView({ event, category: _category }: ProgressViewProps) {
  const { progress, loading, error } = useRecordProgress(event);
  const { gapData, milestones } = progress;

  const eventLabel = eventLabels[event] ?? event;

  const isTimeEvent =
    event.includes('m') &&
    !event.includes('Jump') &&
    !event.includes('Throw') &&
    !event.includes('Put') &&
    !event.includes('Vault');
  const gapUnit = isTimeEvent ? 's' : 'm';

  const improvementRate =
    gapData.length >= 2
      ? (((gapData[0].gap - gapData[gapData.length - 1].gap) / gapData[0].gap) * 100).toFixed(1)
      : null;

  // ✅ Fix: Properly typed formatter
  const formatTooltip = (value: any) => {
    if (value === undefined || value === null) return ['N/A', 'Gap to World Record'];
    return [`${value}${gapUnit}`, 'Gap to World Record'];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      id="progress-panel"
      role="tabpanel"
      aria-labelledby="progress-tab"
    >
      <section className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-6" aria-labelledby="progress-chart-heading">
        <h2 id="progress-chart-heading" className="font-bold text-white mb-3 text-lg tracking-[-0.015em]">Gap to World Record</h2>
        <p className="text-sm text-[#99a1af] mb-5">
          Showing how India's national record is closing the gap
        </p>

        {loading ? (
          <div className="w-full h-64 bg-[#0B0B0F] rounded-xl animate-pulse" />
        ) : error || gapData.length === 0 ? (
          <div className="w-full h-64 flex items-center justify-center">
            <p className="text-sm text-[#99a1af]">No progress data available for {eventLabel}</p>
          </div>
        ) : (
          <div className="w-full h-64" role="img" aria-label="Bar chart showing the gap to world record demonstrating progress over time">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis
                  dataKey="year"
                  stroke="#99a1af"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#99a1af', fontSize: '12px' }}
                />
                <YAxis
                  stroke="#99a1af"
                  style={{ fontSize: '12px' }}
                  label={{ value: `Gap (${gapUnit})`, angle: -90, position: 'insideLeft', fill: '#99a1af', fontSize: '12px' }}
                />
                <Tooltip
                  labelStyle={{ color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff' }}
                  contentStyle={{
                    backgroundColor: '#15151c',
                    border: '2px solid #1a1a1a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                  formatter={formatTooltip}  // ✅ Use the properly typed function
                />
                <Bar dataKey="gap" radius={[8, 8, 0, 0]}>
                  {gapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Progress Insight */}
      <section
        className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-6"
        style={{ background: 'linear-gradient(137.15deg, rgba(201, 17, 95, 0.2) 0%, rgba(201, 17, 95, 0.05) 100%)' }}
        aria-labelledby="progress-insight-heading"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(137.15deg, rgba(201, 17, 95, 0.3) 0%, rgba(201, 17, 95, 0.1) 100%)' }}
            aria-hidden="true"
          >
            <Target className="w-6 h-6 text-[#C9115F]" />
          </div>
          <div className="flex-1">
            <h3 id="progress-insight-heading" className="font-bold text-white mb-2 text-base tracking-[-0.015em]">Progress Insight</h3>
            {loading ? (
              <div className="h-4 bg-[#1a1a1a]/50 rounded animate-pulse w-3/4" />
            ) : (
              <p className="text-white/90 text-sm leading-relaxed">
                {improvementRate ? (
                  <>Gap reduced by <strong className="text-[#C9115F] font-bold text-base">{improvementRate}%</strong> since {gapData[0]?.year}.</>
                ) : (
                  'Tracking progress over time.'
                )}{' '}
                India is making steady progress in {eventLabel}.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Milestones */}
      {!loading && milestones.length > 0 && (
        <section className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-6" aria-labelledby="milestones-heading">
          <h3 id="milestones-heading" className="font-bold text-white mb-4 flex items-center gap-2 text-base tracking-[-0.015em]">
            <Calendar className="w-5 h-5 text-[#C9115F]" aria-hidden="true" />
            Key Milestones
          </h3>
          <div className="space-y-4" role="list">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-3" role="listitem">
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: milestone.color }} aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-sm text-white/90 font-semibold">{milestone.title}</p>
                  <p className="text-xs text-[#99a1af] mt-1.5 leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}