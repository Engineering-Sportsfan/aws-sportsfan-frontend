import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award, Zap, LucideIcon } from 'lucide-react';
import { useRecordStories } from '../../../../hooks/useRecords';
import { StoryEntry } from '../../../../services/records.service';

interface StorySectionProps {
  onStorySelect: (story: StoryEntry) => void;
  event: string;
}

// Map story IDs to icons (icons cannot be stored in Firestore)
const iconMap: Record<string, LucideIcon> = {
  fastest: Trophy,
  evolution: TrendingUp,
  milestones: Award,
  rising: Zap,
};

function getIcon(id: string): LucideIcon {
  return iconMap[id] ?? Trophy;
}

export default function StorySection({ onStorySelect, event: _event }: StorySectionProps) {
  const { stories, loading } = useRecordStories();

  if (loading) {
    return (
      <section className="pt-4" aria-labelledby="stories-heading">
        <h2 id="stories-heading" className="text-sm font-semibold text-[#99a1af] mb-4 px-1 uppercase tracking-wide">Featured Stories</h2>
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[260px] rounded-2xl p-6 min-h-[140px] bg-[#15151c] border-2 border-[#1a1a1a] animate-pulse">
              <div className="w-7 h-7 bg-[#1a1a1a] rounded mb-4" />
              <div className="h-4 bg-[#1a1a1a] rounded mb-2 w-3/4" />
              <div className="h-3 bg-[#1a1a1a] rounded w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="pt-4" aria-labelledby="stories-heading">
      <h2 id="stories-heading" className="text-sm font-semibold text-[#99a1af] mb-4 px-1 uppercase tracking-wide">Featured Stories</h2>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide -mx-4 px-4" role="list" aria-label="Story cards">
        {stories.map((story, index) => {
          const Icon = getIcon(story.id);
          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStorySelect(story)}
              aria-label={`Read story: ${story.title}. ${story.description}`}
              role="listitem"
              className="flex-shrink-0 w-[260px] rounded-2xl p-6 min-h-[140px] snap-start text-left hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C9115F] focus:ring-offset-2 focus:ring-offset-[#0B0B0F] transition-all border-2 border-[#1a1a1a]"
              style={{ background: story.gradient }}
            >
              <Icon className="w-7 h-7 text-[#C9115F] mb-4" aria-hidden="true" />
              <h3 className="font-bold text-white mb-2 text-base tracking-[-0.02em]">{story.title}</h3>
              <p className="text-sm text-[#99a1af] leading-relaxed">{story.description}</p>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}