"use client";

import React from "react";
import { X } from "lucide-react";

export type SportType = "Cricket" | "Football";
export type ContentType = "live_score" | "sports_update" | "moments";
export type SpeedType = "Normal" | "2x" | "3x";

interface TickerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSports: SportType[];
  onSportsChange: (sports: SportType[]) => void;
  selectedTypes: ContentType[];
  onTypesChange: (types: ContentType[]) => void;
  speed: SpeedType;
  onSpeedChange: (speed: SpeedType) => void;
  totalUpdates: number;
}

const SPORTS_OPTIONS: SportType[] = ["Cricket", "Football"];
const CONTENT_OPTIONS: { label: string; value: ContentType }[] = [
  { label: "Live Scores", value: "live_score" },
  { label: "Sports Update", value: "sports_update" },
  { label: "Moments", value: "moments" },
];
const SPEED_OPTIONS: SpeedType[] = ["Normal", "2x", "3x"];

export default function TickerSettingsModal({
  isOpen,
  onClose,
  selectedSports,
  onSportsChange,
  selectedTypes,
  onTypesChange,
  speed,
  onSpeedChange,
  totalUpdates,
}: TickerSettingsModalProps) {
  if (!isOpen) return null;

  const toggleSport = (sport: SportType) => {
    if (selectedSports.includes(sport)) {
      onSportsChange(selectedSports.filter((s) => s !== sport));
    } else {
      onSportsChange([...selectedSports, sport]);
    }
  };

  const toggleType = (type: ContentType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[420px] bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-white">Ticker Settings</h3>
          <p className="text-xs text-gray-400 mt-1">Personalise your live feed</p>
        </div>

        {/* Speed Controls */}
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Scroll Speed
          </label>
          <div className="flex gap-2">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => onSpeedChange(option)}
                className={`flex-1 py-2 text-xs font-semibold rounded-full border transition-all ${
                  speed === option
                    ? "bg-[#C9115F] border-[#C9115F] text-white shadow-lg shadow-[#C9115F]/20"
                    : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Sports Filters */}
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Sports
          </label>
          <div className="flex gap-2 flex-wrap">
            {SPORTS_OPTIONS.map((sport) => {
              const isSelected = selectedSports.includes(sport);
              return (
                <button
                  key={sport}
                  onClick={() => toggleSport(sport)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    isSelected
                      ? "bg-[#C9115F]/10 border-[#C9115F] text-[#C9115F]"
                      : "bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Type Filters */}
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Content Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {CONTENT_OPTIONS.map(({ label, value }) => {
              const isSelected = selectedTypes.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleType(value)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    isSelected
                      ? "bg-[#C9115F]/10 border-[#C9115F] text-[#C9115F]"
                      : "bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Line */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
          <span>Showing {totalUpdates} updates</span>
          <span>Speed: {speed}</span>
        </div>
      </div>
    </div>
  );
}
