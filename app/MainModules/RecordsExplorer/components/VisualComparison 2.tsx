import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Category } from '../page';
import { useRecords } from '../../../../hooks/useRecords';

interface VisualComparisonProps {
  event: string;
  category: Category;
}

export default function VisualComparison({ event, category }: VisualComparisonProps) {
  const { records, loading } = useRecords(event, category);

  const maxValue = records.length > 0 ? Math.max(...records.map((r) => r.numericValue)) : 1;
  const minValue = records.length > 0 ? Math.min(...records.map((r) => r.numericValue)) : 0;

  const getPercentage = (value: number) => {
    if (maxValue === minValue) return 100;
    return ((value - minValue) / (maxValue - minValue)) * 100;
  };

  return (
    <section className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-6" aria-labelledby="performance-comparison-heading">
      <h2 id="performance-comparison-heading" className="font-semibold text-white mb-5 flex items-center gap-2 text-base tracking-[-0.015em]">
        <TrendingUp className="w-5 h-5 text-[#C9115F]" aria-hidden="true" />
        Performance Comparison
      </h2>
      <div className="space-y-5" role="list" aria-label="Performance comparison bars">
        {loading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-3 bg-[#1a1a1a] rounded w-20" />
                  <div className="h-4 bg-[#1a1a1a] rounded w-16" />
                </div>
                <div className="relative h-3 bg-[#0B0B0F] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a1a1a] rounded-full w-1/2" />
                </div>
              </div>
            ))
          : records.map((record) => {
              const percentage = getPercentage(record.numericValue);
              return (
                <div key={record.type} role="listitem">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#99a1af] font-medium flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: record.color }} aria-hidden="true" />
                      {record.type}
                    </span>
                    <span className="text-base font-bold text-white tracking-[-0.02em]">{record.performance}</span>
                  </div>
                  <div className="relative h-3 bg-[#0B0B0F] rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={`${record.type} performance: ${record.performance}`}>
                    <motion.div
                      key={`${event}-${category}-${record.type}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: record.color }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="sr-only">{record.type} record performance is {Math.round(percentage)}% relative to the range</span>
                </div>
              );
            })}
      </div>
    </section>
  );
}