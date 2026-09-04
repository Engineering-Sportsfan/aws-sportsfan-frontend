'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlipLineFullScreen } from '@/src/components/NewHomeComponents/FlipLine';
import { fliplineService, FlipCard } from '@/services/flipline.service';

export default function FlipLinePage() {
  const router = useRouter();
  const [dbCards, setDbCards] = useState<FlipCard[]>([]);
  const [liveCards, setLiveCards] = useState<FlipCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveTickerUpdates = async (): Promise<FlipCard[]> => {
    try {
      const res = await fetch("/api/ticker?sports=cricket&types=ball_by_ball&limit=30");
      const data = await res.json();
      if (data.success && data.items) {
        // Filter: keep only ball_by_ball updates where is_four, is_six, or is_wicket is true
        const filtered = data.items.filter((item: any) => 
          item.type === "ball_by_ball" && (item.is_four || item.is_six || item.is_wicket)
        );

        // Map filtered ball-by-ball commentary to Flip BOT FlipCard objects
        const mapped: FlipCard[] = filtered.map((item: any, index: number) => {
          let hash = 0;
          for (let i = 0; i < item.id.length; i++) {
            hash = (hash << 5) - hash + item.id.charCodeAt(i);
            hash |= 0;
          }
          const numericId = Math.abs(hash);

          // Extract over number
          const parts = item.id.split('_');
          const overNum = parts[parts.length - 1];
          const overLabel = overNum && overNum.includes('.') ? `Over ${overNum}` : 'Live';

          // Clean commentary text
          let cleanComment = item.text || "";
          cleanComment = cleanComment.replace(/^[🏏🔴🔵💥💥\s]*(WICKET!|FOUR!|SIX!)\s*/i, '').trim();

          let formattedContent = "";
          let runSymbol = "";
          if (item.is_four) {
            formattedContent = `Hye! It's a FOUR! 🎉\n${cleanComment}`;
            runSymbol = "4";
          } else if (item.is_six) {
            formattedContent = `That's a SIX! 💥\n${cleanComment}`;
            runSymbol = "6";
          } else if (item.is_wicket) {
            formattedContent = `WICKET! 🏏\n${cleanComment}`;
            runSymbol = "W";
          } else {
            formattedContent = cleanComment;
          }

          // Use mock timestamps for demo items to match design timeline exactly
          let itemTimeMs = new Date(data.fetched_at || Date.now()).getTime() - index * 1000;
          let timeStr = new Date(data.fetched_at || Date.now()).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
          });

          // Override for demo cards so they line up with the screenshots' timestamps
          if (item.id === "demo_bbb_1_20.5") {
            timeStr = "11:03 AM";
            itemTimeMs = Date.now() - 1000 * 60 * 5;
          } else if (item.id === "demo_bbb_2_20.2") {
            timeStr = "11:00 AM";
            itemTimeMs = Date.now() - 1000 * 60 * 10;
          } else if (item.id === "demo_bbb_3_19.6") {
            timeStr = "10:57 AM";
            itemTimeMs = Date.now() - 1000 * 60 * 15;
          } else if (item.id === "demo_bbb_5_19.1") {
            timeStr = "10:49 AM";
            itemTimeMs = Date.now() - 1000 * 60 * 20;
          }

          return {
            id: numericId,
            type: 'bot',
            sport: 'cricket',
            sportEmoji: '🏏',
            sportLabel: 'Cricket',
            day: new Date(itemTimeMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: timeStr,
            timeMs: itemTimeMs,
            author: 'Flip',
            handle: '@flip_bot',
            source: 'Roanuz Live Feed',
            content: formattedContent,
            likes: 0,
            isKey: true,
            fomoMsg: '',
            fomoCount: 0,
            ctaType: 'room',
            flipResponse: '',
            isVerified: true,
            overLabel,
            runSymbol
          } as FlipCard;
        });

        return mapped;
      }
    } catch (err) {
      console.warn("Failed to fetch live updates for FlipLine page:", err);
    }
    return [];
  };

  const fetchCards = async () => {
    try {
      const fetched = await fliplineService.fetchFlipCards();
      setDbCards(Array.isArray(fetched) ? fetched : []);
    } catch (e) {
      console.error("Failed to fetch FlipLine cards:", e);
      setDbCards([]);
    } finally {
      setLoading(false);
    }
  };

  const updateLiveUpdates = async () => {
    try {
      const live = await fetchLiveTickerUpdates();
      setLiveCards(Array.isArray(live) ? live : []);
    } catch (e) {
      console.warn("Failed to fetch live updates:", e);
      setLiveCards([]);
    }
  };

  useEffect(() => {
    fetchCards();
    updateLiveUpdates();

    const interval = setInterval(updateLiveUpdates, 15000);

    const handleNewPost = () => {
      fetchCards();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("flipline-post-created", handleNewPost);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("flipline-post-created", handleNewPost);
      }
    };
  }, []);

  const combinedCards = React.useMemo(() => {
    const seenIds = new Set<string | number>();
    const safeLive = Array.isArray(liveCards) ? liveCards : [];
    const safeDb = Array.isArray(dbCards) ? dbCards : [];
    const all = [...safeLive, ...safeDb];
    return all.filter(c => {
      if (!c || seenIds.has(c.id)) return false;
      seenIds.add(c.id);
      return true;
    });
  }, [dbCards, liveCards]);

  const handleCardUpdate = React.useCallback((updatedCard: FlipCard) => {
    setDbCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id || (c.sk && c.sk === updatedCard.sk) ? updatedCard : c))
    );
  }, []);

  return (
    <FlipLineFullScreen
      onBack={() => router.push('/')}
      selectedSport="mixed"
      cards={combinedCards}
      loading={loading}
      onCardUpdate={handleCardUpdate}
    />
  );
}
