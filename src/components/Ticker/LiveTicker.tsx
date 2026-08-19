"use client";

import React, { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import TickerSettingsModal, { SportType, ContentType, SpeedType } from "./TickerSettingsModal";

interface TickerItem {
  id: string;
  type: ContentType;
  sport: "cricket" | "football";
  text: string;
  badge: string;
  status: string;
}

const SPEED_MULTIPLIER_MAP: Record<SpeedType, number> = {
  Normal: 12,
  "2x": 24,
  "3x": 36,
};

export default function LiveTicker() {
  const [selectedSports, setSelectedSports] = useState<SportType[]>(["Cricket", "Football"]);
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([
    "live_score",
    "sports_update",
    "moments",
  ]);
  const [speed, setSpeed] = useState<SpeedType>("Normal");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTickerData = async () => {
    try {
      const sportsParam = selectedSports.map((s) => s.toLowerCase()).join(",");
      const typesParam = selectedTypes.join(",");
      const url = `/api/ticker?sports=${sportsParam}&types=${typesParam}&limit=20`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (e) {
      console.warn("LiveTicker fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchTickerData, 15000); // Poll every 15s

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedSports, selectedTypes]);

  // Combine updates into one long string for marquee text
  const marqueeText = items.length > 0
    ? items.map((item) => `${item.text} · ${item.badge}`).join("     ◆     ")
    : "No live sports events currently scheduled.";

  // Dynamically calculate speed based on content length
  const animDuration = Math.max(25, Math.round(marqueeText.length / SPEED_MULTIPLIER_MAP[speed]));

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="w-full h-9 bg-[#0c0c0e] border-b border-white/5 flex items-center overflow-hidden cursor-pointer select-none relative z-50 hover:bg-white/[0.02] transition-colors"
      >
        {/* LIVE Badge */}
        <div className="h-full bg-[#E63946] text-white text-[10px] font-extrabold tracking-wider px-3.5 flex items-center gap-1.5 shrink-0 z-10 shadow-[4px_0_12px_rgba(0,0,0,0.4)]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </div>

        {/* Marquee Wrapper */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          {loading ? (
            <div className="text-xs text-gray-500 pl-4 animate-pulse">
              Syncing with Sportradar live feeds...
            </div>
          ) : (
            <div
              key={`${speed}-${items.length}`}
              style={{
                animation: `tickerMarquee ${animDuration}s linear infinite`,
                paddingLeft: "100%",
              }}
              className="inline-block whitespace-nowrap text-xs text-gray-300 font-medium tracking-wide uppercase"
            >
              {marqueeText}
            </div>
          )}
        </div>

        {/* Gear Icon trigger */}
        <div className="h-full px-3.5 flex items-center justify-center text-gray-400 hover:text-white transition-colors border-l border-white/5 shrink-0 z-10 bg-[#0c0c0e]">
          <Settings size={14} className="animate-spin-slow" />
        </div>
      </div>

      {/* Settings Dialog Overlay */}
      <TickerSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedSports={selectedSports}
        onSportsChange={setSelectedSports}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        speed={speed}
        onSpeedChange={setSpeed}
        totalUpdates={items.length}
      />

      <style>{`
        @keyframes tickerMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
