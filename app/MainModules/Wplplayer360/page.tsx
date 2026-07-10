// app/wpl/players/page.tsx  (or pages/wpl/players.tsx if using Pages Router)
// Drop this file at whatever route you want: /wpl/players

import { Suspense } from "react";
import { WPLPlayerProfileProvider } from "@/context/Wplplayerprofilecontext";
import WPLPlayerProfileContent from "../WplPlayers/PlayersProfileContent";
import WPLPlayer360CardsSection from "./pagecontent";


/** Thin loading shell shown by Suspense while the client bundle hydrates */
function WPLPlayerLoadingShell() {
    return (
        <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            <p className="text-white/60 text-sm">Loading WPL player…</p>
        </div>
    );
}

export default function WPLPlayerPage() {
    return (
        <WPLPlayer360CardsSection />
    );
}