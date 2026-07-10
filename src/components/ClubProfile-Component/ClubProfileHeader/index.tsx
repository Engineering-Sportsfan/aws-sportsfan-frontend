"use client";

import { ClubProfile } from "@/types/ClubProfile";

interface Props {
  club: ClubProfile;
}

export default function ClubProfileHeader({ club }: Props) {
  return (
    <div className="flex flex-col items-center px-4 md:px-6 pt-6 md:pt-8 pb-2 gap-4 md:gap-5">

      {/* Gradient ring avatar */}
      <div className="rounded-full p-[3px] bg-gradient-to-br from-[#e91e8c] to-[#ff5722] w-28 h-28 md:w-36 md:h-36 lg:w-32 lg:h-32 shrink-0">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#111111]">
          <img
            src={club.avatar}
            alt={club.name}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>

      {/* Name + Team */}
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-[28px] md:text-[36px] lg:text-[32px] font-extrabold text-white tracking-tight leading-none text-center">
          {club.name}
        </h1>
        <p className="text-sm md:text-base font-semibold text-[#e91e8c] tracking-wide text-center">
          {club.team}
        </p>
      </div>

      {/* Style pills */}
      <div className="flex items-center gap-3">
        <span className="px-4 md:px-5 py-2 rounded-full bg-[#1c1c1c] border border-[#363636] text-[#d4d4d4] text-[13px] md:text-sm font-medium">
          {club.battingStyle}
        </span>
        <span className="px-4 md:px-5 py-2 rounded-full bg-[#e91e8c] text-white text-[13px] md:text-sm font-semibold">
          {club.bowlingStyle}
        </span>
      </div>

      {/* About card */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5 mt-1">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
          <span className="text-base md:text-lg font-bold text-white">About</span>
        </div>
        <p className="text-[13px] md:text-sm text-[#9a9a9a] leading-[1.75]">
          {club.about}
        </p>
      </div>
    </div>
  );
}