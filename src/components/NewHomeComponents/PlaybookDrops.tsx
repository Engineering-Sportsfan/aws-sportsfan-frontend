// components\NewHomeComponents\StoreAndExperiences.tsx

import { Mic, Coffee, Video, Sparkles, ShoppingBag, ChevronRight } from "lucide-react";

type StoreItem = {
  id: string;
  icon: typeof Mic;
  label: string; // multi-line label, use \n for line breaks
};

const STORE_ITEMS: StoreItem[] = [
  { id: "ama-sessions", icon: Mic, label: "AMA Sessions\nAsk Champions" },
  { id: "breakfast", icon: Coffee, label: "Breakfast\nWith Players" },
  { id: "virtual-meets", icon: Video, label: "Virtual Meets\n& Greets" },
  { id: "digital-cards", icon: Sparkles, label: "Digital Cards\n& Collectibles" },
  { id: "merchandise", icon: ShoppingBag, label: "Merchandise\n& More" },
];

export default function StoreAndExperiences() {
  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">Store &amp; Experiences</h3>
        <button
          type="button"
          className="flex items-center gap-0.5 text-[12px] font-bold"
          style={{ color: "#E91E8C" }}
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {STORE_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            className="shrink-0 w-[84px] flex flex-col items-center gap-2.5 snap-start"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(160deg,#2a1245,#170a2b)" }}
            >
              <Icon size={24} className="text-white/85" />
            </div>
            <p className="text-[11px] font-semibold text-white/60 text-center leading-tight whitespace-pre-line">
              {label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}