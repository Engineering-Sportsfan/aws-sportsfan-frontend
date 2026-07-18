import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const STORIES = [
  {
    id: 1,
    user: 'AFI Official',
    avatar: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=200&fit=crop',
    items: [
      {
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&fit=crop',
        caption: 'CWG 2026 — India is Ready! 🇮🇳',
        duration: 5000,
      },
      {
        image: 'https://images.unsplash.com/photo-1703182612564-dd42bba0e1bc?w=800&fit=crop',
        caption: 'Neeraj Chopra training update 🎯',
        duration: 5000,
      },
    ],
  },
  {
    id: 2,
    user: 'Neeraj Chopra',
    avatar: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=200&fit=crop',
    items: [
      {
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&fit=crop',
        caption: 'Another day on the track 💪',
        duration: 5000,
      },
    ],
  },
  {
    id: 3,
    user: 'Avinash Sable',
    avatar: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&fit=crop',
    items: [
      {
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&fit=crop',
        caption: 'Asian Record 3000m Steeplechase 🏃‍♂️',
        duration: 5000,
      },
    ],
  },
  {
    id: 4,
    user: 'Team India',
    avatar: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=200&fit=crop',
    items: [
      {
        image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800&fit=crop',
        caption: 'Road to Glasgow 🏆',
        duration: 5000,
      },
      {
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&fit=crop',
        caption: 'Squad goals 💥',
        duration: 5000,
      },
    ],
  },
];

interface StoriesViewerProps {
  initialStoryIndex: number;
  onClose: () => void;
}

export default function StoriesViewer({ initialStoryIndex, onClose }: StoriesViewerProps) {
  const [storyIdx, setStoryIdx] = useState(initialStoryIndex);
  const [itemIdx, setItemIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);

  const story = STORIES[storyIdx];
  const item = story.items[itemIdx];
  const TICK = 50;

  const goNext = () => {
    if (itemIdx < story.items.length - 1) {
      setItemIdx(i => i + 1);
    } else if (storyIdx < STORIES.length - 1) {
      setStoryIdx(s => s + 1);
      setItemIdx(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (itemIdx > 0) {
      setItemIdx(i => i - 1);
    } else if (storyIdx > 0) {
      setStoryIdx(s => s - 1);
      setItemIdx(0);
    }
  };

  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      progressRef.current += (TICK / item.duration) * 100;
      if (progressRef.current >= 100) {
        progressRef.current = 100;
        setProgress(100);
        clearInterval(timerRef.current!);
        goNext();
        return;
      }
      setProgress(progressRef.current);
    }, TICK);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [storyIdx, itemIdx]);

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center">
      <div className="relative w-full max-w-[390px] h-full bg-black overflow-hidden">
        {/* Background image */}
        <ImageWithFallback
          src={item.image}
          alt={story.user}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-3 pt-3">
          {story.items.map((_, i) => (
            <div key={i} className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{ width: i < itemIdx ? '100%' : i === itemIdx ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-30 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="w-[36px] h-[36px] rounded-full overflow-hidden border-2 border-[#c9115f]">
              <ImageWithFallback src={story.avatar} alt={story.user} className="w-full h-full object-cover" />
            </div>
            <span className="text-white text-[13px] font-bold drop-shadow">{story.user}</span>
            <span className="text-white/60 text-[11px]">Just now</span>
          </div>
          <button onClick={onClose} className="w-[32px] h-[32px] flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tap zones */}
        <div className="absolute inset-0 flex z-20">
          <div className="flex-1" onClick={goPrev} />
          <div className="flex-1" onClick={goNext} />
        </div>

        {/* Caption */}
        <div className="absolute bottom-10 left-0 right-0 z-10 px-4">
          <p className="text-white text-[14px] font-semibold drop-shadow text-center">{item.caption}</p>
        </div>

        {/* Story navigation arrows */}
        {storyIdx > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}
        {storyIdx < STORIES.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

export { STORIES };
