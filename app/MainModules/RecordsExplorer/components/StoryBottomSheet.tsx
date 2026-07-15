import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, MapPin } from 'lucide-react';
import { StoryEntry } from '../../../../services/records.service';

interface StoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryEntry | null;
}

export default function StoryBottomSheet({ isOpen, onClose, story }: StoryBottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && story && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-sheet-title"
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[390px] bg-[#15151c] border-t-2 border-[#1a1a1a] rounded-t-3xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center py-4" aria-hidden="true">
              <div className="w-12 h-1.5 bg-[#99a1af]/40 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b-2 border-[#1a1a1a] flex items-start justify-between">
              <h2 id="story-sheet-title" className="text-xl font-bold text-white pr-8 tracking-[-0.02em]">{story.title}</h2>
              <button
                onClick={onClose}
                aria-label="Close story"
                className="p-3 min-h-[44px] min-w-[44px] hover:bg-[#1a1a1a] rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9115F] transition-colors"
              >
                <X className="w-5 h-5 text-[#99a1af]" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <article className="space-y-5">
                {/* Featured Image Placeholder */}
                <div
                  className="w-full h-48 rounded-2xl flex items-center justify-center border-2 border-[#1a1a1a]"
                  style={{ background: story.gradient }}
                  role="img"
                  aria-label="Featured story image"
                >
                  <div className="text-6xl" aria-hidden="true">🏃‍♂️</div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4" role="list" aria-label="Story metadata">
                  <div className="flex items-center gap-2 text-sm text-[#99a1af]" role="listitem">
                    <Calendar className="w-4 h-4 text-[#C9115F]" aria-hidden="true" />
                    <span>
                      <span className="sr-only">Published: </span>
                      {new Date(story.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#99a1af]" role="listitem">
                    <User className="w-4 h-4 text-[#C9115F]" aria-hidden="true" />
                    <span><span className="sr-only">Author: </span>{story.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#99a1af]" role="listitem">
                    <MapPin className="w-4 h-4 text-[#C9115F]" aria-hidden="true" />
                    <span><span className="sr-only">Location: </span>{story.location}</span>
                  </div>
                </div>

                {/* Story Content */}
                <div className="space-y-4 text-white/90 text-sm leading-relaxed">
                  {story.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Key Statistics */}
                {story.keyStats && story.keyStats.length > 0 && (
                  <section className="bg-[#0B0B0F] border-2 border-[#1a1a1a] rounded-2xl p-5 space-y-4" aria-labelledby="stats-heading">
                    <h3 id="stats-heading" className="font-bold text-white mb-4 text-base tracking-[-0.015em]">Key Statistics</h3>
                    <div className="grid grid-cols-2 gap-4" role="list">
                      {story.keyStats.map((stat, idx) => (
                        <div key={idx} role="listitem">
                          <div className="text-2xl font-bold tracking-[-0.02em]" style={{ color: stat.color }}>{stat.value}</div>
                          <div className="text-xs text-[#99a1af] mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Quote */}
                {story.quote && (
                  <blockquote
                    className="rounded-2xl p-6 border-l-4 border-[#C9115F]"
                    style={{ background: 'linear-gradient(137.15deg, rgba(201, 17, 95, 0.2) 0%, rgba(201, 17, 95, 0.05) 100%)' }}
                  >
                    <p className="text-white/90 italic mb-3 text-sm leading-relaxed">"{story.quote}"</p>
                    <footer className="text-xs text-[#99a1af]">— {story.quoteAuthor}</footer>
                  </blockquote>
                )}
              </article>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}