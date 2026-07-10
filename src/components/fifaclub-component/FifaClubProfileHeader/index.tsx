// components/FifaClub-Component/FifaClubProfileHeader/index.tsx
"use client";

import { FifaClub } from "@/types/fifaClub";

interface Props {
  club: FifaClub;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tournamentLabel(t: string): string {
  if (t === "FIFA World Cup")          return "FIFA World Cup 2026";
  if (t === "FIFA Women's World Cup")  return "FIFA Women's World Cup 2026";
  return t;
}

function winRate(club: FifaClub): string {
  if (!club.matches_played) return "0%";
  return `${Math.round((club.wins / club.matches_played) * 100)}%`;
}

function gdLabel(gd: number): string {
  return gd > 0 ? `+${gd}` : String(gd);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FifaClubProfileHeader({ club }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 text-center px-4 md:px-6 pt-6 pb-2">

      {/* Crest avatar */}
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1a6b3a] to-[#0d4d29] p-[3px] shrink-0">
        <div className="w-full h-full rounded-full bg-[#0a1a0f] flex items-center justify-center">
          <span className="text-white text-3xl font-extrabold tracking-tight">{club.club_id}</span>
        </div>
      </div>

      {/* Country + rank */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{club.country}</h1>
        <p className="font-semibold text-[#4ade80]">#{club.fifa_rank} in FIFA Rankings</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-[#1a6b3a] px-3 py-1 text-sm font-semibold text-[#4ade80]">
          {tournamentLabel(club.tournament)}
        </span>
        <span className="rounded-full border border-white/15 px-3 py-1 text-sm text-white">
          {club.world_cup_apps} World Cup Apps
        </span>
        {club.all_time_best_finish && (
          <span className="rounded-full bg-[#78350f]/40 border border-yellow-500/30 px-3 py-1 text-sm font-semibold text-yellow-300">
            {club.all_time_best_finish}
          </span>
        )}
      </div>

      {/* About */}
      <div className="w-full rounded-2xl bg-[#1a1a1a] p-4 md:p-5 text-left">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-[3px] rounded-sm bg-[#16a34a]" />
          <h2 className="text-lg font-bold text-white">About</h2>
        </div>
        <p className="text-sm leading-6 text-[#b5b5b5]">
          <span className="text-white font-medium">{club.country}</span> ({club.club_id}) have competed in the{" "}
          <span className="text-[#4ade80] font-medium">{tournamentLabel(club.tournament)}</span>{" "}
          <span className="text-white font-medium">{club.world_cup_apps}</span> times, playing{" "}
          <span className="text-white font-medium">{club.matches_played}</span> matches with a win rate of{" "}
          <span className="text-white font-medium">{winRate(club)}</span>.
          {club.goal_difference !== 0 && (
            <> Their all-time goal difference stands at{" "}
            <span className="text-white font-medium">{gdLabel(club.goal_difference)}</span>.</>
          )}
          {club.all_time_best_finish && (
            <> Best tournament finish:{" "}
            <span className="text-[#fbbf24] font-medium">{club.all_time_best_finish}</span>.</>
          )}
        </p>
      </div>
    </div>
  );
}