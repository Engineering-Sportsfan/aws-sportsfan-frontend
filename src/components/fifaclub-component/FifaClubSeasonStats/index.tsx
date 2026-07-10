// components/FifaClub-Component/FifaClubSeasonStats/index.tsx
"use client";

import { FifaClub } from "@/types/fifaClub";
import { useState } from "react";

interface Props {
  club: FifaClub;
}

const ACCENT = "#16a34a";

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[3px] h-5 rounded-sm shrink-0" style={{ background: ACCENT }} />
      <span className="text-base md:text-lg font-bold text-white">{text}</span>
    </div>
  );
}

function PrimaryStatBox({
  value, label, color = "green",
}: {
  value: string | number; label: string; color?: "green" | "amber" | "red" | "dark";
}) {
  const bg =
    color === "green" ? "bg-[#16a34a]" :
    color === "amber" ? "bg-[#d97706]" :
    color === "red"   ? "bg-[#dc2626]" :
    "bg-[#242424]";
  const display = (value === 0 || value === "0" || value === "0%" || value == null) ? "—" : value;
  return (
    <div className={`flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl ${bg}`}>
      <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">{display}</span>
      <span className="text-[11px] md:text-xs text-white/70 mt-1 font-medium">{label}</span>
    </div>
  );
}

function SecondaryStatBox({ value, label }: { value: string | number; label: string }) {
  const display = (value === 0 || value === "0" || value == null) ? "—" : value;
  return (
    <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
      <span className="text-[11px] md:text-xs text-[#777777] mb-1">{label}</span>
      <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">{display}</span>
    </div>
  );
}

export default function FifaClubSeasonStats({ club }: Props) {
  const [showMore, setShowMore] = useState(false);

  const winRate = club.matches_played
    ? `${Math.round((club.wins / club.matches_played) * 100)}%`
    : "0%";

  const goalsPerGame = club.matches_played
    ? (club.goals_for / club.matches_played).toFixed(2)
    : "0";

  const gdDisplay = club.goal_difference > 0
    ? `+${club.goal_difference}`
    : String(club.goal_difference);

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pb-4">

      {/* ── Main Campaign Stats ── */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Campaign Performance" />

        {/* Win / Draw / Loss */}
        <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-4 mb-2">
          Match Record
        </p>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <PrimaryStatBox value={club.wins}   label="Wins"   color="green" />
          <PrimaryStatBox value={club.draws}  label="Draws"  color="amber" />
          <PrimaryStatBox value={club.losses} label="Losses" color="red"   />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
          <SecondaryStatBox value={club.matches_played} label="Matches Played" />
          <SecondaryStatBox value={winRate}             label="Win Rate" />
          <SecondaryStatBox value={club.world_cup_apps} label="WC Apps" />
        </div>

        {/* Goals */}
        <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-5 mb-2">
          Goals
        </p>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <PrimaryStatBox value={club.goals_for}     label="Goals For"     color="green" />
          <PrimaryStatBox value={club.goals_against} label="Goals Against" color="dark"  />
          <PrimaryStatBox value={gdDisplay}          label="Goal Diff."    color={club.goal_difference >= 0 ? "green" : "red"} />
        </div>

        {/* Extended stats */}
        {showMore && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
            <SecondaryStatBox value={goalsPerGame}  label="Goals / Game" />
            <SecondaryStatBox value={club.fifa_rank} label="FIFA Rank" />
            {club.wc2026_match_day !== undefined && club.wc2026_match_day > 0 && (
              <SecondaryStatBox value={club.wc2026_match_day} label="WC 2026 Match Day" />
            )}
          </div>
        )}

        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full mt-3 h-11 md:h-12 rounded-full bg-[#242424] text-[#d0d0d0] text-[13px] md:text-sm font-semibold border-0 cursor-pointer hover:bg-[#2e2e2e] transition-colors"
        >
          {showMore ? "View Less Stats" : "View More Stats"}
        </button>
      </div>

      {/* ── 2026 Squad ── */}
      {(club.head_coach_2026 || club.captain_2026) && (
        <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
          <SectionLabel text="2026 Squad" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            {club.head_coach_2026 && (
              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[14px] md:text-[16px] font-extrabold text-white leading-tight">
                  {club.head_coach_2026}
                </span>
                <span className="text-[11px] md:text-xs text-[#777777] mt-1">Head Coach</span>
              </div>
            )}
            {club.captain_2026 && (
              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[14px] md:text-[16px] font-extrabold text-[#fbbf24] leading-tight">
                  {club.captain_2026}
                </span>
                <span className="text-[11px] md:text-xs text-[#777777] mt-1">2026 Captain</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Club Details ── */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Club Details" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[20px] md:text-[24px] font-extrabold text-[#4ade80] leading-tight">
              {club.club_id}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">FIFA Code</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[15px] md:text-[18px] font-extrabold text-white leading-tight capitalize">
              {club.gender}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Category</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[20px] md:text-[24px] font-extrabold text-[#fbbf24] leading-tight">
              #{club.fifa_rank}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">FIFA Ranking</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[14px] md:text-[15px] font-extrabold text-white leading-tight">
              {club.all_time_best_finish ?? "—"}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Best Finish</span>
          </div>
        </div>
      </div>

      {/* ── Coming soon ── */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Historical Insights" />
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-10 h-10 lg:w-16 lg:h-16 mb-4 rounded-full bg-[#242424] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
          </div>
          <h3 className="text-white text-sm lg:text-base font-semibold mb-2">Coming Soon</h3>
          <p className="text-[#888888] text-sm max-w-sm">
            Per-tournament breakdowns, squad history, and head-to-head records coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}