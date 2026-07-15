import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * ScrollToTop — resets scroll position back to the top on every route change.
 *
 * Handles both layout patterns used across the app:
 *  1. Pages that scroll the window/document   (min-h-screen pattern)
 *  2. Pages with an inner overflow container  (flex-col h-screen pattern)
 *
 * Usage: render once inside AppLayout and pass the ref of the scrollable <main>.
 */
export function ScrollToTop({ scrollRef }: { scrollRef: React.RefObject<HTMLElement | null> }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset the shared <main> container (catches inner overflow-y-auto containers)
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    // Also reset window scroll (catches pages that use min-h-screen / document scroll)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, scrollRef]);

  return null;
}

