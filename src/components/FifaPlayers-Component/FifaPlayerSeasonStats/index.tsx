// components/FifaPlayers-Component/FifaPlayerSeasonStats/index.tsx
"use client";

import { FifaPlayer } from "@/types/fifaPlayer";
import { useState } from "react";

interface Props {
    player: FifaPlayer;
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
    value,
    label,
    color = "green",
}: {
    value: string | number;
    label: string;
    color?: "green" | "amber" | "dark";
}) {
    const bg =
        color === "green" ? "bg-[#16a34a]" :
        color === "amber" ? "bg-[#d97706]" :
        "bg-[#242424]";

    const display = value === 0 || value === "0" || value === "0.00" || value == null ? "—" : value;

    return (
        <div className={`flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl ${bg}`}>
            <span className="text-[20px] md:text-[26px] font-extrabold text-white leading-none">
                {display}
            </span>
            <span className="text-[11px] md:text-xs text-white/70 mt-1 font-medium">{label}</span>
        </div>
    );
}

function SecondaryStatBox({ value, label }: { value: string | number; label: string }) {
    const display = value === 0 || value === "0" || value === "0.00" || value == null ? "—" : value;
    return (
        <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[11px] md:text-xs text-[#777777] mb-1">{label}</span>
            <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                {display}
            </span>
        </div>
    );
}

export default function FifaPlayerSeasonStats({ player }: Props) {
    const [showMore, setShowMore] = useState(false);

    const isGK      = player.position === "GK";
    const isAttacker = player.position === "FW";
    const hasShooting = player.shots > 0 || player.goals > 0;

    return (
        <div className="flex flex-col gap-4 px-4 md:px-6 pb-4">

            {/* ── Main Stats ── */}
            <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
                <SectionLabel text="Tournament Performance" />

                {/* Attacking */}
                {!isGK && (
                    <>
                        <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-4 mb-2">
                            Attacking
                        </p>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                            <PrimaryStatBox value={player.goals}   label="Goals"   color="green" />
                            <PrimaryStatBox value={player.assists} label="Assists"  color="amber" />
                            <PrimaryStatBox value={player.xg.toFixed(2)} label="xG" color="dark" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-2.5">
                            <SecondaryStatBox value={player.shots}            label="Shots" />
                            <SecondaryStatBox value={player.shots_on_target}  label="On Target" />
                            <SecondaryStatBox value={player.shot_conversion_pct > 0 ? `${player.shot_conversion_pct.toFixed(1)}%` : 0} label="Shot Conv." />
                            <SecondaryStatBox value={player.xa.toFixed(2)}    label="xA" />
                        </div>
                    </>
                )}

                {/* Creativity */}
                <p className="text-[11px] md:text-xs text-[#777777] font-semibold uppercase tracking-widest mt-5 mb-2">
                    Creativity
                </p>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <PrimaryStatBox value={player.key_passes}          label="Key Passes"    color="green" />
                    <PrimaryStatBox value={player.chances_created}     label="Chances"       color="amber" />
                    <PrimaryStatBox value={player.big_chances_created} label="Big Chances"   color="dark" />
                </div>

                {/* Dribbling + Minutes */}
                {showMore && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2.5">
                        <SecondaryStatBox value={player.dribbles_completed} label="Dribbles" />
                        <SecondaryStatBox value={player.matches_played}     label="Matches" />
                        <SecondaryStatBox value={player.minutes_played}     label="Minutes" />
                    </div>
                )}

                <button
                    onClick={() => setShowMore(!showMore)}
                    className="w-full mt-3 h-11 md:h-12 rounded-full bg-[#242424] text-[#d0d0d0] text-[13px] md:text-sm font-semibold border-0 cursor-pointer hover:bg-[#2e2e2e] transition-colors"
                >
                    {showMore ? "View Less Stats" : "View More Stats"}
                </button>
            </div>

            {/* ── Player Details ── */}
            <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
                <SectionLabel text="Player Details" />
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                        <span className="text-[20px] md:text-[24px] font-extrabold leading-tight text-[#4ade80]">
                            {player.position}
                        </span>
                        <span className="text-[11px] md:text-xs text-[#777777] mt-1">Position</span>
                    </div>
                    <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                        <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-tight">
                            {player.format}
                        </span>
                        <span className="text-[11px] md:text-xs text-[#777777] mt-1">Format</span>
                    </div>
                    <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                        <span className="text-[15px] md:text-[18px] font-extrabold text-white leading-tight capitalize">
                            {player.gender}
                        </span>
                        <span className="text-[11px] md:text-xs text-[#777777] mt-1">Category</span>
                    </div>
                    <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
                        <span className="text-[20px] md:text-[24px] font-extrabold text-[#fbbf24] leading-tight">
                            {player.season}
                        </span>
                        <span className="text-[11px] md:text-xs text-[#777777] mt-1">Season</span>
                    </div>
                </div>
            </div>

            {/* ── Coming soon ── */}
            <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
                <SectionLabel text="Career Insights" />
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="w-10 h-10 lg:w-16 lg:h-16 mb-4 rounded-full bg-[#242424] flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                        </svg>
                    </div>
                    <h3 className="text-white text-sm lg:text-base font-semibold mb-2">Coming Soon</h3>
                    <p className="text-[#888888] text-sm max-w-sm">
                        Detailed career insights and historical data are coming soon. Stay tuned!
                    </p>
                </div>
            </div>
        </div>
    );
}