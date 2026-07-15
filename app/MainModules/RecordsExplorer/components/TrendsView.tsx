import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Category } from '../page';
import { useRecordTrends } from '../../../../hooks/useRecords';

interface TrendsViewProps {
  event: string;
  category: Category;
}

export default function TrendsView({ event, category: _category }: TrendsViewProps) {
  const { trends, loading, error } = useRecordTrends(event);

  // Compute summary stats from data
  const firstYear = trends[0];
  const lastYear = trends[trends.length - 1];
  const improvement =
    firstYear && lastYear
      ? (firstYear.national - lastYear.national).toFixed(2)
      : null;
  const bestYear = lastYear?.year ?? '—';
  const yearsTracked = trends.length;

  const isTimeEvent =
    event.includes('m') &&
    !event.includes('Jump') &&
    !event.includes('Throw') &&
    !event.includes('Put');
  const yAxisLabel = isTimeEvent ? 'Time (seconds)' : 'Distance (metres)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      id="trends-panel"
      role="tabpanel"
      aria-labelledby="trends-tab"
    >
      <section className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-6" aria-labelledby="trends-chart-heading">
        <h2 id="trends-chart-heading" className="font-bold text-white mb-3 text-lg tracking-[-0.015em]">Performance Over Time</h2>
        <p className="text-sm text-[#99a1af] mb-5">
          Tracking {event} records from {firstYear?.year ?? '2015'} to {lastYear?.year ?? '2026'}
        </p>

        {loading ? (
          <div className="w-full h-64 bg-[#0B0B0F] rounded-xl animate-pulse" />
        ) : error || trends.length === 0 ? (
          <div className="w-full h-64 flex items-center justify-center">
            <p className="text-sm text-[#99a1af]">No trend data available for {event}</p>
          </div>
        ) : (
          <div className="w-full h-64" role="img" aria-label={`Line chart showing ${event} performance trends comparing National, Olympic, and World records`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} accessibilityLayer>
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
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#99a1af', fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#15151c',
                    border: '2px solid #1a1a1a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#fff', paddingTop: '12px' }} />
                <Line type="monotone" dataKey="national" stroke="#C9115F" strokeWidth={3} dot={{ fill: '#C9115F', r: 5, strokeWidth: 2, stroke: '#0B0B0F' }} activeDot={{ r: 7 }} name="National Record" />
                <Line type="monotone" dataKey="olympic" stroke="#C0C0C0" strokeWidth={3} dot={{ fill: '#C0C0C0', r: 5, strokeWidth: 2, stroke: '#0B0B0F' }} activeDot={{ r: 7 }} name="Olympic Record" />
                <Line type="monotone" dataKey="world" stroke="#CD620E" strokeWidth={3} dot={{ fill: '#CD620E', r: 5, strokeWidth: 2, stroke: '#0B0B0F' }} activeDot={{ r: 7 }} name="World Record" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="grid grid-cols-3 gap-3" role="list" aria-label="Key trend statistics">
        <div className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-5 text-center" role="listitem">
          {loading ? (
            <div className="h-8 bg-[#1a1a1a] rounded animate-pulse mb-2" />
          ) : (
            <div className="text-2xl font-bold text-[#C9115F] tracking-[-0.02em]">
              {improvement ? (isTimeEvent ? `-${improvement}s` : `+${improvement}m`) : '—'}
            </div>
          )}
          <div className="text-xs text-[#99a1af] mt-2 font-medium">Improvement</div>
        </div>
        <div className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-5 text-center" role="listitem">
          {loading ? (
            <div className="h-8 bg-[#1a1a1a] rounded animate-pulse mb-2" />
          ) : (
            <div className="text-2xl font-bold text-white tracking-[-0.02em]">{bestYear}</div>
          )}
          <div className="text-xs text-[#99a1af] mt-2 font-medium">Best Year</div>
        </div>
        <div className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-5 text-center" role="listitem">
          {loading ? (
            <div className="h-8 bg-[#1a1a1a] rounded animate-pulse mb-2" />
          ) : (
            <div className="text-2xl font-bold text-white tracking-[-0.02em]">{yearsTracked}</div>
          )}
          <div className="text-xs text-[#99a1af] mt-2 font-medium">Years Tracked</div>
        </div>
      </div>
    </motion.div>
  );
}