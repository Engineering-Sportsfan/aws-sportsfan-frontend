// components/wt20-component/WT20ClubSeasonStats/index.tsx
"use client";

import { WT20Club } from "@/types/wt20Club";
import { useState } from "react";

interface Props {
  club: WT20Club;
}

const ACCENT = "#0d9488";

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[3px] h-5 rounded-sm shrink-0" style={{ background: ACCENT }} />
      <span className="text-base md:text-lg font-bold text-white">{text}</span>
    </div>
  );
}

function PrimaryStatBox({
  value, label, color = "teal",
}: {
  value: string | number; label: string; color?: "teal" | "amber" | "red" | "dark";
}) {
  const bgMap = {
    teal:  "bg-[#0f766e]",
    amber: "bg-[#d97706]",
    red:   "bg-[#dc2626]",
    dark:  "bg-[#242424]",
  };
  const display = (value === 0 || value === "0" || value === "0%" || value == null) ? "—" : value;
  return (
    <div className={`flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl ${bgMap[color]}`}>
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

function FormBadge({ form }: { form: string | null }) {
  if (!form) return null;
  const items = form.split("-");
  const colorMap: Record<string, string> = {
    W: "bg-[#166534] text-[#4ade80] border border-[#166534]",
    L: "bg-[#7f1d1d] text-[#f87171] border border-[#7f1d1d]",
    T: "bg-[#78350f] text-[#fbbf24] border border-[#78350f]",
    N: "bg-[#1f2937] text-[#9ca3af] border border-[#374151]",
  };
  return (
    <div className="flex items-center gap-1.5">
      {items.map((r, i) => (
        <span key={i} className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${colorMap[r] ?? colorMap.N}`}>
          {r}
        </span>
      ))}
    </div>
  );
}

export default function WT20ClubSeasonStats({ club }: Props) {
  const [showMore, setShowMore] = useState(false);

  const winPct    = `${Math.round(club.win_pct * 100)}%`;
  const lossPct   = club.matches
    ? `${Math.round((club.lost / club.matches) * 100)}%`
    : "0%";
  const tiedPct   = club.matches
    ? `${Math.round((club.tied_so / club.matches) * 100)}%`
    : "0%";
  const countable = club.matches - club.no_result;
  const winPctCalc = countable > 0 ? Math.round((club.won / countable) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pb-4">

      {/* ── Campaign Stats ── */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Campaign Performance" />

        {/* W / L / T */}
        <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-4 mb-2">
          Match Outcomes
        </p>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <PrimaryStatBox value={club.won}     label="Won"      color="teal"  />
          <PrimaryStatBox value={club.lost}    label="Lost"     color="red"   />
          <PrimaryStatBox value={club.tied_so} label="Tied/SO"  color="amber" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
          <SecondaryStatBox value={club.matches}          label="Matches" />
          <SecondaryStatBox value={club.no_result}        label="No Result" />
          <SecondaryStatBox value={winPct}               label="Win Rate" />
          <SecondaryStatBox value={club.apps}            label="WT20 Apps" />
        </div>

        {/* Rankings */}
        <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-5 mb-2">
          ICC Standing
        </p>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <PrimaryStatBox value={`#${club.icc_ranking}`}  label="ICC Ranking"    color="teal" />
          <PrimaryStatBox value={club.rating_points}      label="Rating Points"  color="dark" />
        </div>

        {/* Extended */}
        {showMore && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
            <SecondaryStatBox value={`${winPctCalc}%`} label="Win % (excl. NR)" />
            {club.recent_form && (
              <div className="flex flex-col justify-center p-3.5 rounded-xl bg-[#242424]">
                <span className="text-[11px] text-[#777777] mb-2">Recent Form</span>
                <FormBadge form={club.recent_form} />
              </div>
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
      {(club.current_captain || club.head_coach || club.featured_player) && (
        <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
          <SectionLabel text="Squad & Staff" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            {club.current_captain && (
              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[14px] md:text-[16px] font-extrabold text-[#fbbf24] leading-tight">
                  {club.current_captain}
                </span>
                <span className="text-[11px] md:text-xs text-[#777777] mt-1">Captain</span>
              </div>
            )}
            {club.head_coach && (
              <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[14px] md:text-[16px] font-extrabold text-white leading-tight">
                  {club.head_coach}
                </span>
                <span className="text-[11px] md:text-xs text-[#777777] mt-1">Head Coach</span>
              </div>
            )}
            {club.featured_player && (
              <div className="col-span-2 flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                <span className="text-[14px] md:text-[15px] font-extrabold text-[#2dd4bf] leading-tight">
                  {club.featured_player}
                </span>
                <span className="text-[11px] md:text-xs text-[#777777] mt-1">Featured Player</span>
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
            <span className="text-[18px] md:text-[20px] font-extrabold text-[#2dd4bf] leading-tight">
              {club.club_id}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">ICC Code</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[15px] md:text-[16px] font-extrabold text-white leading-tight capitalize">
              {club.gender}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Category</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[20px] md:text-[24px] font-extrabold text-[#fbbf24] leading-tight">
              #{club.icc_ranking}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">ICC Ranking</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[13px] md:text-[14px] font-extrabold text-white leading-tight">
              {club.best_tournament_finish ?? "—"}
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