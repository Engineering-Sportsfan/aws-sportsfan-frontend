import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Discipline } from '../page';

interface FilterPanelProps {
  category: Category;
  discipline: Discipline;
  event: string;
  onCategoryChange: (category: Category) => void;
  onDisciplineChange: (discipline: Discipline) => void;
  onEventChange: (event: string) => void;
}

const categories: Category[] = ['Men', 'Women'];
const disciplines: Discipline[] = ['Sprints', 'Middle Distance', 'Throws', 'Jumps', 'Relays'];

/**
 * Maps discipline → list of { label, key } where:
 *   label = display text shown in the dropdown
 *   key   = the event segment used to build the Firestore doc ID (e.g. "100m", "ShotPut")
 *           Full Firestore key: `${key}_${category}` → "100m_Men"
 */
const eventsByDiscipline: Record<Discipline, { label: string; key: string }[]> = {
  Sprints: [
    { label: '100m',          key: '100m'   },
    { label: '200m',          key: '200m'   },
    { label: '400m',          key: '400m'   },
    { label: '400m Hurdles',  key: '400mH'  },
  ],
  'Middle Distance': [
    { label: '800m',   key: '800m'   },
    { label: '1500m',  key: '1500m'  },
    { label: '3000m',  key: '3000m'  },
    { label: '5000m',  key: '5000m'  },
  ],
  Throws: [
    { label: 'Shot Put',     key: 'ShotPut'      },
    { label: 'Discus Throw', key: 'DiscusThrow'  },
    { label: 'Javelin Throw',key: 'JavelinThrow' },
    { label: 'Hammer Throw', key: 'HammerThrow'  },
  ],
  Jumps: [
    { label: 'High Jump',   key: 'HighJump'   },
    { label: 'Long Jump',   key: 'LongJump'   },
    { label: 'Triple Jump', key: 'TripleJump' },
    { label: 'Pole Vault',  key: 'PoleVault'  },
  ],
  Relays: [
    { label: '4×100m', key: '4x100m' },
    { label: '4×400m', key: '4x400m' },
  ],
};

type DropdownType = 'category' | 'discipline' | 'event' | null;

export default function FilterPanel({
  category,
  discipline,
  event,
  onCategoryChange,
  onDisciplineChange,
  onEventChange,
}: FilterPanelProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  const currentEvents = eventsByDiscipline[discipline];
  const currentEventObj = currentEvents.find((e) => e.key === event);
  const eventLabel = currentEventObj?.label ?? event;

  const handleCategorySelect = (cat: Category) => {
    onCategoryChange(cat);
    setOpenDropdown(null);
  };

  const handleDisciplineSelect = (disc: Discipline) => {
    onDisciplineChange(disc);
    // Reset to the first event of the new discipline
    const events = eventsByDiscipline[disc];
    if (events.length > 0) {
      onEventChange(events[0].key);
    }
    setOpenDropdown(null);
  };

  const handleEventSelect = (key: string) => {
    onEventChange(key);
    setOpenDropdown(null);
  };

  const toggleDropdown = (type: DropdownType) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  return (
    <div className="px-4 relative" role="navigation" aria-label="Filter controls">
      <div className="flex gap-2 flex-wrap">

        {/* ── Category Dropdown ─────────────────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('category')}
            aria-expanded={openDropdown === 'category'}
            aria-haspopup="listbox"
            aria-label={`Category: ${category}`}
            className="px-4 py-3 min-h-[44px] bg-[#15151c] border-2 border-[#1a1a1a] rounded-full text-sm text-white flex items-center gap-2 hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#C9115F] focus:ring-offset-2 focus:ring-offset-[#0B0B0F] transition-colors"
          >
            <span className="font-medium">{category}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          <AnimatePresence>
            {openDropdown === 'category' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                role="listbox"
                aria-label="Category options"
                className="absolute top-full mt-2 bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl overflow-hidden shadow-xl z-50 min-w-[120px]"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    role="option"
                    aria-selected={cat === category}
                    className={`w-full px-4 py-3 min-h-[44px] text-left text-sm font-medium hover:bg-[#1a1a1a] focus:outline-none focus:bg-[#1a1a1a] transition-colors ${
                      cat === category ? 'text-[#C9115F] bg-[#C9115F]/10' : 'text-white'
                    }`}
                  >
                    {cat}
                    {cat === category && <span className="ml-2" aria-hidden="true">✓</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Discipline Dropdown ───────────────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('discipline')}
            aria-expanded={openDropdown === 'discipline'}
            aria-haspopup="listbox"
            aria-label={`Discipline: ${discipline}`}
            className="px-4 py-3 min-h-[44px] bg-[#15151c] border-2 border-[#1a1a1a] rounded-full text-sm text-white flex items-center gap-2 hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#C9115F] focus:ring-offset-2 focus:ring-offset-[#0B0B0F] transition-colors"
          >
            <span className="font-medium">{discipline}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${openDropdown === 'discipline' ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          <AnimatePresence>
            {openDropdown === 'discipline' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                role="listbox"
                aria-label="Discipline options"
                className="absolute top-full mt-2 bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl overflow-hidden shadow-xl z-50 min-w-[160px]"
              >
                {disciplines.map((disc) => (
                  <button
                    key={disc}
                    onClick={() => handleDisciplineSelect(disc)}
                    role="option"
                    aria-selected={disc === discipline}
                    className={`w-full px-4 py-3 min-h-[44px] text-left text-sm font-medium hover:bg-[#1a1a1a] focus:outline-none focus:bg-[#1a1a1a] transition-colors ${
                      disc === discipline ? 'text-[#C9115F] bg-[#C9115F]/10' : 'text-white'
                    }`}
                  >
                    {disc}
                    {disc === discipline && <span className="ml-2" aria-hidden="true">✓</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Event Dropdown ────────────────────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('event')}
            aria-expanded={openDropdown === 'event'}
            aria-haspopup="listbox"
            aria-label={`Event: ${eventLabel}`}
            className="px-4 py-3 min-h-[44px] bg-[#15151c] border-2 border-[#1a1a1a] rounded-full text-sm text-white flex items-center gap-2 hover:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#C9115F] focus:ring-offset-2 focus:ring-offset-[#0B0B0F] transition-colors"
          >
            <span className="font-medium">{eventLabel}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${openDropdown === 'event' ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          <AnimatePresence>
            {openDropdown === 'event' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                role="listbox"
                aria-label="Event options"
                className="absolute top-full mt-2 bg-[#15151c] border-2 border-[#1a1a1a] rounded-2xl overflow-hidden shadow-xl z-50 max-h-[280px] overflow-y-auto min-w-[160px]"
              >
                {currentEvents.map(({ label, key }) => (
                  <button
                    key={key}
                    onClick={() => handleEventSelect(key)}
                    role="option"
                    aria-selected={key === event}
                    className={`w-full px-4 py-3 min-h-[44px] text-left text-sm font-medium hover:bg-[#1a1a1a] focus:outline-none focus:bg-[#1a1a1a] transition-colors ${
                      key === event ? 'text-[#C9115F] bg-[#C9115F]/10' : 'text-white'
                    }`}
                  >
                    {label}
                    {key === event && <span className="ml-2" aria-hidden="true">✓</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Backdrop to close dropdowns */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}