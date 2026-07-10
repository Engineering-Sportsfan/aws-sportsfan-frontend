"use client";

import { ClubProfile } from "@/types/ClubProfile";
import PlaylistDialog from "../../playlistdialog-component/playlistdialog";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

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
export default function ClubProfileActions({ club }: Props) {
    const { user } = useAuth();
    const [showPlaylistDialog, setShowPlaylistDialog] = useState(false); 
    const getUserId = () => user?.userId || null;
    
    const careerStatItems = [
        { value: club.stats.runs, label: "RUNS" },
        { value: club.stats.sr, label: "SR" },
        { value: club.stats.avg, label: "AVG" },
    ];

    return (
        <div className="flex flex-col gap-4 px-4 md:px-6 pt-4 pb-4">

            {/* ── Row 1: Follow · Watch Me · Share ── */}
            <div className="flex items-center gap-2 md:gap-3">
                {/* Follow button */}
                <button className="flex flex-1 items-center justify-center gap-2 h-[46px] md:h-[52px] rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff5722] text-white text-[14px] md:text-base font-bold tracking-wide border-0 cursor-pointer hover:opacity-90 transition-opacity">
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    Follow
                </button>

                {/* Playlist button */}
                <button
                    onClick={() => setShowPlaylistDialog(true)}
                    className="w-12 h-12 rounded-full p-2 bg-gradient-to-r from-[#e91e8c] to-[#ff5722] flex items-center justify-center cursor-pointer hover:bg-[#2a2a2e] transition"
                    title="Add to Playlist"
                >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h9M2 8h7M2 12h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                        <circle cx="13" cy="11" r="2.5" stroke="white" strokeWidth="1.3" />
                        <path d="M13 9.5V7l2.5-.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Share icon */}
                <button className="flex items-center justify-center w-[46px] h-[46px] md:w-[52px] md:h-[52px] rounded-full bg-transparent border border-[#e91e8c] text-[#e91e8c] cursor-pointer shrink-0 hover:bg-[#e91e8c]/10 transition-colors">
                    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                </button>
            </div>

            {/* Watch Me – outlined */}
            <button className="flex flex-1 items-center justify-center gap-2 h-[46px] md:h-[52px] p-2 rounded-full bg-transparent border border-[#e91e8c] text-[#e91e8c] text-[14px] md:text-base font-bold cursor-pointer hover:bg-[#e91e8c]/10 transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Watch Me
            </button>

            {/* ── Team Overview ── */}
            <div className="w-full bg-[#111111] border border-[#2a2a2a] rounded-[28px] p-5 md:p-6">
                {/* heading */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-10 bg-[#ff0080] rounded-full" />
                    <h2 className="text-white text-[19px] md:text-lg font-bold">
                        Team Overview
                    </h2>
                </div>

                {/* table card */}
                <div className="overflow-hidden rounded-[22px] bg-[#0f0f0f] border border-[#1f1f1f]">
                    {[
                        { label: "Captain", value: club.overview.captain },
                        { label: "Coach", value: club.overview.coach },
                        { label: "Owner", value: club.overview.owner },
                        { label: "Venue", value: club.overview.venue },
                    ].map((item, index) => (
                        <div
                            key={item.label}
                            className={`flex items-center px-5 py-4 ${index !== 3 ? "border-b border-[#1f1f1f]" : ""}`}
                        >
                            <span className="w-[90px] text-[#9a9a9a] text-[12px] md:text-[15px] tracking-wide">
                                {item.label}
                            </span>

                            <span className="mx-4 text-white text-[18px]">-</span>

                            <span className="text-white text-[12px] md:text-[15px] font-medium">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/*  PlaylistDialog - Render ONCE outside the loop */}
            <PlaylistDialog
                open={showPlaylistDialog}
                onClose={() => setShowPlaylistDialog(false)}
                itemId={club.name || "club_profile"}  // Use club ID or name
                itemType="teams360" 
                userId={getUserId()}
            />
        </div>
    );
}