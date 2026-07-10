"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const banners = [
  {
    id: 1,
    title: "TATA IPL T20 2026",
    subtitle: "Experience cricket's biggest league",
    image: "/images/bannerone.png",
    urlPath: '/MainModules/MatchesDropContent'
  },
  {
    id: 2,
    title: "Fan Zone",
    subtitle: "Exclusive Fan Content",
     image: "/images/fan_zone _banner.png",
    urlPath: '/MainModules/Fanszone'
  },
  {
    id: 3,
    title: "Fantasy Games",
    subtitle: "Pick players, score points & win big",
    image: "/images/fantasy_games_banner.png",
    urlPath: '/MainModules/Fantasy?tab=fantasy'
  },
];

export default function HomeBanners() {
  const router = useRouter();
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMobileScroll = () => {
    const track = mobileTrackRef.current;
    if (!track) return;

    const firstCard = track.firstElementChild as HTMLElement | null;
    if (!firstCard) return;

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const step = firstCard.offsetWidth + gap;
    if (step <= 0) return;

    const nextIndex = Math.round(track.scrollLeft / step);
    const clampedIndex = Math.max(0, Math.min(banners.length - 1, nextIndex));
    setActiveIndex(clampedIndex);
  };

  return (
    <div className="mt-4">
      {/* MOBILE → horizontal scroll */}
      <div
        ref={mobileTrackRef}
        onScroll={handleMobileScroll}
        className="flex gap-4 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory lg:hidden"
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            onClick={() => router.push(banner.urlPath)}
            className="min-w-[280px] h-40 rounded-xl overflow-hidden relative flex-shrink-0 snap-start cursor-pointer"
          >
            <img
              src={banner.image}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent w-full">
              <h2 className="font-semibold text-sm">{banner.title}</h2>
              <p className="text-xs text-gray-300">{banner.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex lg:hidden items-center justify-center gap-2 mt-3" aria-label="Banner pagination">
        {banners.map((banner, index) => (
          <span
            key={banner.id}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* DESKTOP → grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            onClick={() => router.push(banner.urlPath)}
            className="h-48 rounded-xl overflow-hidden relative cursor-pointer"
          >
            <img
              src={banner.image}
              className="w-full h-full object-fit"
            />
            <div className="absolute bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent w-full">
              <h2 className="font-semibold text-lg">{banner.title}</h2>
              <p className="text-sm text-gray-300">{banner.subtitle}</p>
            </div>
          </div>
        ))}
        
       
      </div>
    </div>
  );
}