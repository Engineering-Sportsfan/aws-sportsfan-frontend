// components/wt20-component/WT20ClubProfileHeader/index.tsx
"use client";

import { WT20Club } from "@/types/wt20Club";

interface Props {
  club: WT20Club;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function winPctLabel(club: WT20Club): string {
  return `${Math.round(club.win_pct * 100)}%`;
}

function formDots(form: string | null): { result: "W" | "L" | "T" | "N"; label: string }[] {
  if (!form) return [];
  return form.split("-").map((r) => ({
    result: r as "W" | "L" | "T" | "N",
    label: r === "W" ? "Win" : r === "L" ? "Loss" : r === "T" ? "Tied" : "NR",
  }));
}

function formDotColor(r: string): string {
  if (r === "W") return "#4ade80";
  if (r === "L") return "#f87171";
  if (r === "T") return "#fbbf24";
  return "#6b7280";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WT20ClubProfileHeader({ club }: Props) {
  const countryCode = club.club_id.replace("-W", "");
  const formItems   = formDots(club.recent_form);

  return (
    <div className="flex flex-col items-center gap-4 text-center px-4 md:px-6 pt-6 pb-2">

      {/* Crest avatar — cricket-themed teal/emerald */}
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0f766e] to-[#134e4a] p-[3px] shrink-0">
        <div className="w-full h-full rounded-full bg-[#042f2e] flex flex-col items-center justify-center gap-0.5">
          <span className="text-white text-xl font-extrabold tracking-tight leading-none">{countryCode}</span>
          <span className="text-[#5eead4] text-[10px] font-bold tracking-widest leading-none">WT20</span>
        </div>
      </div>

      {/* Country + ranking */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{club.country}</h1>
        <p className="font-semibold text-[#2dd4bf]">
          #{club.icc_ranking} ICC Women's T20I Ranking
        </p>
        <p className="text-sm text-[#6b7280]">{club.rating_points} rating points</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-[#134e4a] px-3 py-1 text-sm font-semibold text-[#2dd4bf]">
          ICC Women's T20 World Cup
        </span>
        <span className="rounded-full border border-white/15 px-3 py-1 text-sm text-white">
          {club.apps} WT20 WC Apps
        </span>
        {club.best_tournament_finish && (
          <span className="rounded-full bg-[#78350f]/40 border border-yellow-500/30 px-3 py-1 text-sm font-semibold text-yellow-300">
            {club.best_tournament_finish}
          </span>
        )}
      </div>

      {/* Recent form dots */}
      {formItems.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] text-[#6b7280] font-semibold uppercase tracking-widest">Recent Form</p>
          <div className="flex items-center gap-2">
            {formItems.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-black"
                  style={{ background: formDotColor(f.result) }}
                >
                  {f.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      <div className="w-full rounded-2xl bg-[#1a1a1a] p-4 md:p-5 text-left">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-[3px] rounded-sm bg-[#0d9488]" />
          <h2 className="text-lg font-bold text-white">About</h2>
        </div>
        <p className="text-sm leading-6 text-[#b5b5b5]">
          <span className="text-white font-medium">{club.country}</span> ({club.club_id}) have competed in the{" "}
          <span className="text-[#2dd4bf] font-medium">ICC Women's T20 World Cup</span>{" "}
          <span className="text-white font-medium">{club.apps}</span> times, playing{" "}
          <span className="text-white font-medium">{club.matches}</span> matches with a win rate of{" "}
          <span className="text-white font-medium">{winPctLabel(club)}</span>.{" "}
          They have won{" "}
          <span className="text-[#4ade80] font-medium">{club.won}</span>,{" "}
          lost <span className="text-[#f87171] font-medium">{club.lost}</span>
          {club.tied_so > 0 && (
            <>, tied/SO <span className="text-[#fbbf24] font-medium">{club.tied_so}</span></>
          )}
          {club.no_result > 0 && (
            <>, and had <span className="text-[#6b7280] font-medium">{club.no_result}</span> NR</>
          )}.
          {club.best_tournament_finish && (
            <> Best finish:{" "}
            <span className="text-[#fbbf24] font-medium">{club.best_tournament_finish}</span>.</>
          )}
        </p>
      </div>
    </div>
  );
}