// components/PlayerProfile-Component/PlayerProfileHeader/index.tsx

"use client";

import { Player } from "@/types/player";

interface Props {
  player: Player;
}

export default function PlayerProfileHeader({ player }: Props) {
  const avatarInitial = player.name.trim().charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#e91e8c] to-[#ff5722] p-[3px] shrink-0">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center text-white text-3xl font-bold">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <span aria-hidden="true">{avatarInitial}</span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{player.name}</h1>
        <p className="text-[#e91e8c] font-semibold">{player.team}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-white/15 px-3 py-1 text-sm text-white">
          {player.battingStyle}
        </span>
        <span className="rounded-full bg-[#e91e8c] px-3 py-1 text-sm font-semibold text-white">
          {player.bowlingStyle}
        </span>
      </div>

      <div className="w-full rounded-2xl bg-[#1a1a1a] p-4 md:p-5 text-left">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-[3px] rounded-sm bg-[#e91e8c]" />
          <h2 className="text-lg font-bold text-white">About</h2>
        </div>
        <p className="text-sm leading-6 text-[#b5b5b5]">{player.about}</p>
      </div>
    </div>
  );
}
