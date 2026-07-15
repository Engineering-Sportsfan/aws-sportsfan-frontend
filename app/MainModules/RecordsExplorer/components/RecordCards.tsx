import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, MapPin, Award } from 'lucide-react';
import { Category } from '../page';
import { useRecords } from '../../../../hooks/useRecords';

interface RecordCardsProps {
  event: string;
  category: Category;
}

function RecordCardSkeleton() {
  return (
    <div className="bg-[#15151c] rounded-2xl overflow-hidden border-2 border-[#1a1a1a] p-4 animate-pulse">
      <div className="w-3 h-3 rounded-full bg-[#1a1a1a] mb-3" />
      <div className="h-6 bg-[#1a1a1a] rounded mb-2 w-3/4" />
      <div className="h-3 bg-[#1a1a1a] rounded w-full" />
    </div>
  );
}

export default function RecordCards({ event, category }: RecordCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { records, loading, error } = useRecords(event, category);

  if (loading) {
    return (
      <section aria-labelledby="record-comparison-heading">
        <h2 id="record-comparison-heading" className="text-sm font-semibold text-[#99a1af] mb-4 px-1 uppercase tracking-wide">Record Comparison</h2>
        <div className="grid grid-cols-3 gap-3">
          <RecordCardSkeleton />
          <RecordCardSkeleton />
          <RecordCardSkeleton />
        </div>
      </section>
    );
  }

  if (error || records.length === 0) {
    return (
      <section aria-labelledby="record-comparison-heading">
        <h2 id="record-comparison-heading" className="text-sm font-semibold text-[#99a1af] mb-4 px-1 uppercase tracking-wide">Record Comparison</h2>
        <div className="bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl p-6 text-center">
          <p className="text-sm text-[#99a1af]">No records found for {event} ({category})</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="record-comparison-heading">
      <h2 id="record-comparison-heading" className="text-sm font-semibold text-[#99a1af] mb-4 px-1 uppercase tracking-wide">Record Comparison</h2>
      <div className="grid grid-cols-3 gap-3">
        {records.map((record) => (
          <motion.div
            key={record.type}
            layout
            className="bg-[#15151c] rounded-2xl overflow-hidden border-2 border-[#1a1a1a]"
          >
            <button
              onClick={() => setExpandedCard(expandedCard === record.type ? null : record.type)}
              aria-expanded={expandedCard === record.type}
              aria-label={`${record.type} record: ${record.performance} by ${record.athlete}. ${expandedCard === record.type ? 'Collapse' : 'Expand'} details`}
              className="w-full p-4 min-h-[44px] text-left hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#C9115F] focus:ring-inset transition-colors"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: record.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-[#99a1af] leading-none font-semibold uppercase tracking-wide">{record.type}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight tracking-[-0.02em]">
                  {record.performance}
                </h3>
                <p className="text-xs text-[#99a1af] leading-tight line-clamp-2 mb-2">{record.athlete}</p>
                <motion.div
                  animate={{ rotate: expandedCard === record.type ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 flex items-center gap-1"
                  aria-hidden="true"
                >
                  <ChevronDown className="w-4 h-4 text-[#99a1af]" />
                  <span className="text-[10px] text-[#99a1af]">{expandedCard === record.type ? 'Less' : 'More'}</span>
                </motion.div>
              </div>
            </button>

            <AnimatePresence>
              {expandedCard === record.type && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                  role="region"
                  aria-label={`${record.type} record details`}
                >
                  <div className="px-4 pb-4 space-y-3 border-t-2 border-[#1a1a1a] pt-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#C9115F] mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="sr-only">Date: </span>
                        <div className="text-xs text-white leading-tight font-medium">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#C9115F] mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="sr-only">Venue: </span>
                        <div className="text-xs text-white leading-tight font-medium">{record.venue}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-[#C9115F] mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="sr-only">Championship: </span>
                        <div className="text-xs text-white leading-tight font-medium">{record.championship}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}