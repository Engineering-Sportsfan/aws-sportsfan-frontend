// components/FifaPlayers-Component/FifaPlayerProfileHeader/index.tsx
"use client";

import { FifaPlayer } from "@/types/fifaPlayer";

interface Props {
    player: FifaPlayer;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const POSITION_LABELS: Record<string, string> = {
    GK: "Goalkeeper",
    DF: "Defender",
    MF: "Midfielder",
    FW: "Forward",
};

const POSITION_COLORS: Record<string, { bg: string; text: string }> = {
    GK: { bg: "#f59e0b", text: "#fff" },
    DF: { bg: "#3b82f6", text: "#fff" },
    MF: { bg: "#10b981", text: "#fff" },
    FW: { bg: "#ef4444", text: "#fff" },
};

// Tournament display label
function tournamentLabel(tournament: string): string {
    if (tournament.includes("wc_2022")) return "FIFA World Cup 2022";
    if (tournament.includes("wc_2026")) return "FIFA World Cup 2026";
    if (tournament.includes("euro"))    return "UEFA Euro";
    if (tournament.includes("copa"))    return "Copa América";
    return tournament.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function avatarInitial(name: string) {
    return name.trim().charAt(0).toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FifaPlayerProfileHeader({ player }: Props) {
    const posCfg  = POSITION_COLORS[player.position] ?? { bg: "#6b7280", text: "#fff" };
    const posLabel = POSITION_LABELS[player.position] ?? player.position;

    return (
        <div className="flex flex-col items-center gap-4 text-center px-4 md:px-6 pt-6 pb-2">

            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1a6b3a] to-[#0d4d29] p-[3px] shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center text-white text-3xl font-bold">
                    <span aria-hidden="true">{avatarInitial(player.player_name)}</span>
                </div>
            </div>

            {/* Name + team */}
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                    {player.player_name}
                </h1>
                <p className="font-semibold text-[#4ade80]">{player.team}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
                {/* Position badge */}
                <span
                    className="rounded-full px-3 py-1 text-sm font-bold"
                    style={{ background: posCfg.bg, color: posCfg.text }}
                >
                    {posLabel}
                </span>

                {/* Tournament badge */}
                <span className="rounded-full bg-[#1a6b3a] px-3 py-1 text-sm font-semibold text-[#4ade80]">
                    {tournamentLabel(player.tournament)}
                </span>

                {/* Season */}
                <span className="rounded-full border border-white/15 px-3 py-1 text-sm text-white">
                    {player.season}
                </span>
            </div>

            {/* About */}
            <div className="w-full rounded-2xl bg-[#1a1a1a] p-4 md:p-5 text-left">
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-4 w-[3px] rounded-sm bg-[#16a34a]" />
                    <h2 className="text-lg font-bold text-white">About</h2>
                </div>
                <p className="text-sm leading-6 text-[#b5b5b5]">
                    {player.player_name} is a{" "}
                    <span className="text-white font-medium">{posLabel}</span> representing{" "}
                    <span className="text-white font-medium">{player.team}</span> at the{" "}
                    <span className="text-[#4ade80] font-medium">{tournamentLabel(player.tournament)}</span>.
                    {player.matches_played > 0 && (
                        <> Played <span className="text-white font-medium">{player.matches_played}</span> match
                        {player.matches_played > 1 ? "es" : ""} and logged{" "}
                        <span className="text-white font-medium">{player.minutes_played}</span> minutes.</>
                    )}
                </p>
            </div>
        </div>
    );
}