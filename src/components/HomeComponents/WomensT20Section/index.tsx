"use client";
import React from "react";

import WomensT20PulseCard from "./WomensT20PulseCard";
import TrendingAdsCard from "./TrendingAdsCard";
import FansDiscussingCard from "./FansDiscussingCard";
import SpotlightCard from "./SpotlightCard";

// NEW IMPORTS
import FanPollCard from "./FanPollCard";
import Intelligence360Card from "./Intelligence360Card";
import MetricOfTheDayCard from "./MetricOfTheDayCard";
import LiveSentimentMapCard from "./LiveSentimentMapCard";
const index = () => {
  return (
    <div className="flex flex-col w-full gap-4 mt-2 mb-4">
      <div className="flex items-center justify-between w-full px-1">
        <h2 className="text-2xl font-bold text-white">
          Womens T20 International
        </h2>
      </div>

      {/* Grid Layout: 1 column on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Row 1: First 4 Cards */}
        <WomensT20PulseCard />
        <TrendingAdsCard />
        <FansDiscussingCard />
        <SpotlightCard />

        {/* Row 2: Next 4 Cards (Replaced the duplicates!) */}
        <FanPollCard />
        <Intelligence360Card />
        <MetricOfTheDayCard />
        <LiveSentimentMapCard />
      </div>
    </div>
  );
};

export default index;
