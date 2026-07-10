"use client";

import { ClubProfile } from "@/types/ClubProfile";

interface Props {
    club: ClubProfile;
}


function SectionLabel({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
            <span className="text-base md:text-lg font-bold text-white">{text}</span>
        </div>
    );
}

export default function ClubSeasonStats({ club }: Props) {
    const { season, insights } = club;

    return (
        <div className="flex flex-col gap-4 px-4 md:px-6 pb-4">

            {/* ── IPL Season card ── */}
            <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
                <SectionLabel text={`IPL ${season.year} Season`} />

                {/* Top 3 highlight boxes */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 mt-3">
                    <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e91e8c]">
                        <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">{season.wins}</span>
                        <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">Wins</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#e08c00]">
                        <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">{season.losses}</span>
                        <span className="text-[11px] md:text-xs text-white/80 mt-1 font-medium">Losses</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#242424]">
                        <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">{season.position}</span>
                        <span className="text-[11px] md:text-xs text-[#777777] mt-1 font-medium">Position</span>
                    </div>
                </div>

                {/* Secondary 2×2 → 4-col on tablet+ */}

                <div className="grid grid-cols-2 gap-3 mt-2.5">
                    {/* Row 1 */}
                    <div className="flex flex-col justify-center p-4 rounded-xl bg-[#242424]">
                        <span className="text-xs text-[#777777] mb-1">Matches Played</span>
                        <span className="text-[24px] font-extrabold text-white leading-none">{season.matchesPlayed}</span>
                    </div>
                    <div className="flex flex-col justify-center p-4 rounded-xl bg-[#242424]">
                        <span className="text-xs text-[#777777] mb-1">Net Run Rate</span>
                        <span className="text-[24px] font-extrabold text-white leading-none">{season.netRunRate}</span>
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col justify-center p-4 rounded-xl bg-[#242424]">
                        <span className="text-xs text-[#777777] mb-1">Highest Total</span>
                        <span className="text-[24px] font-extrabold text-white leading-none">{season.highestTotal}</span>
                    </div>
                    <div className="flex flex-col justify-center p-4 rounded-xl bg-[#242424]">
                        <span className="text-xs text-[#777777] mb-1">Lowest Total</span>
                        <span className="text-[24px] font-extrabold text-white leading-none">{season.lowestTotal}</span>
                    </div>
                </div>


                {/* Orange Cap award badge */}
                <div className="flex items-center gap-3 mt-2.5 bg-[#e91e8c]/10 border border-[#e91e8c]/30 rounded-2xl px-3.5 py-3 md:px-4 md:py-3.5">
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e91e8c] shrink-0">
                        <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="6" />
                            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[13px] md:text-sm font-bold text-white">🧡 {season.award}</p>
                        <p className="text-[12px] md:text-[13px] text-[#999999] mt-0.5">{season.awardSub}</p>
                    </div>
                </div>

                <button className="w-full mt-3 h-11 md:h-12 rounded-full bg-[#242424] text-[#d0d0d0] text-[13px] md:text-sm font-semibold border-0 cursor-pointer hover:bg-[#2e2e2e] transition-colors">
                    View More Stats
                </button>
            </div>

        </div>
    );
}