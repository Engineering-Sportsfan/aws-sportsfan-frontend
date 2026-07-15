'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterPanel from './components/FilterPanel';
import RecordCards from './components/RecordCards';
import VisualComparison from './components/VisualComparison';
import InsightSection from './components/InsightSection';
import ModeSwitch from './components/ModeSwitch';
import TrendsView from './components/TrendsView';
import ProgressView from './components/ProgressView';
import StorySection from './components/StorySection';
import StoryBottomSheet from './components/StoryBottomSheet';
import { StoryEntry } from '../../../services/records.service';
import { useRouter } from 'next/navigation';

export type Category = 'Men' | 'Women';
export type Discipline = 'Sprints' | 'Middle Distance' | 'Throws' | 'Jumps' | 'Relays';
export type ViewMode = 'Records' | 'Trends' | 'Progress';

export interface RecordData {
  type: 'National' | 'Olympic' | 'World';
  performance: string;
  athlete: string;
  date: string;
  venue: string;
  championship: string;
  color: string;
  numericValue: number;
}

export default function RecordsExplorer() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('Men');
  const [discipline, setDiscipline] = useState<Discipline>('Sprints');
  const [event, setEvent] = useState<string>('100m');
  const [viewMode, setViewMode] = useState<ViewMode>('Records');
  const [selectedStory, setSelectedStory] = useState<StoryEntry | null>(null);

  return (
    <div
      className="bg-[#0B0B0F] w-full flex justify-center h-screen"
      role="main"
    >
      <div className="w-full max-w-6xl bg-[#0B0B0F] relative flex flex-col h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0B0B0F]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
          {/* Top bar with back button */}
          <div className="h-[56px] flex items-center gap-3 px-4">
            <button
              onClick={() => router.push("/MainModules/AtheleteHome")}
              aria-label="Go back"
              className="w-[36px] h-[36px] rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] active:scale-95 transition-all"
            >
              <ChevronLeft className="w-[18px] h-[18px] text-white" />
            </button>
            <h1 className="text-[18px] font-bold text-white tracking-[-0.02em] font-['Inter:Bold',sans-serif]">
              Records Explorer
            </h1>
          </div>

          {/* Subtitle */}
          <div className="px-4 pb-3">
            <p className="text-sm text-[#99a1af]">
              National vs Olympic vs World Records
            </p>
          </div>

          <FilterPanel
            category={category}
            discipline={discipline}
            event={event}
            onCategoryChange={setCategory}
            onDisciplineChange={setDiscipline}
            onEventChange={setEvent}
          />

          {/* Spacer below filter */}
          <div className="h-3" />
        </header>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar"
          role="region"
          aria-label="Record data content"
        >
          <div className="p-4 space-y-4 pb-24">
            {/* Mode Switch */}
            <ModeSwitch viewMode={viewMode} onModeChange={setViewMode} />

            {/* Dynamic Content Based on Mode */}
            <AnimatePresence mode="wait">
              {viewMode === 'Records' && (
                <motion.div
                  key="records"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <RecordCards event={event} category={category} />
                  <VisualComparison event={event} category={category} />
                  <InsightSection event={event} category={category} />
                </motion.div>
              )}

              {viewMode === 'Trends' && (
                <motion.div
                  key="trends"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendsView event={event} category={category} />
                </motion.div>
              )}

              {viewMode === 'Progress' && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProgressView event={event} category={category} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Story Section - Always visible */}
            <StorySection onStorySelect={setSelectedStory} event={event} />
          </div>
        </div>

        {/* Story Bottom Sheet */}
        <StoryBottomSheet
          isOpen={!!selectedStory}
          onClose={() => setSelectedStory(null)}
          story={selectedStory}
        />
      </div>
    </div>
  );
}