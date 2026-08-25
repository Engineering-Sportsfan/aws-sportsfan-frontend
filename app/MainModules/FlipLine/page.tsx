'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlipLineFullScreen } from '@/src/components/NewHomeComponents/FlipLine';
import { fliplineService } from '@/services/flipline.service';
import type { FlipCard } from '@/src/components/CreatePost-Component/CreatePostDialog';

export default function FlipLinePage() {
  const router = useRouter();
  const [cards, setCards] = useState<FlipCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    try {
      const fetched = await fliplineService.fetchFlipCards();
      setCards(fetched);
    } catch (e) {
      console.error("Failed to fetch FlipLine cards:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();

    const handleNewPost = () => {
      fetchCards();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("flipline-post-created", handleNewPost);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("flipline-post-created", handleNewPost);
      }
    };
  }, []);

  return (
    <FlipLineFullScreen
      onBack={() => router.push('/')}
      selectedSport="mixed"
      cards={cards}
      loading={loading}
    />
  );
}
