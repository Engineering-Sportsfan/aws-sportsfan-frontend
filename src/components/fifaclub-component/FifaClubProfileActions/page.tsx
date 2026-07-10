// components/FifaClub-Component/FifaClubProfileActions/index.tsx
"use client";

import { useState, useEffect } from "react";
import { FifaClub } from "@/types/fifaClub";

interface Props {
  club: FifaClub;
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

export default function FifaClubProfileActions({ club }: Props) {
  const [isFollowing, setIsFollowing]               = useState(false);
  const [isWatching, setIsWatching]                 = useState(false);
  const [toastMessage, setToastMessage]             = useState<string | null>(null);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [showShareDialog, setShowShareDialog]       = useState(false);
  const [copied, setCopied]                         = useState(false);

  const storageKey = `fifa-club-actions:${club.club_id}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { following?: boolean; watching?: boolean };
      setIsFollowing(Boolean(parsed.following));
      setIsWatching(Boolean(parsed.watching));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ following: isFollowing, watching: isWatching }));
  }, [isFollowing, isWatching, storageKey]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 2500);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  const handleFollowClick = () => {
    if (isFollowing) { setShowUnfollowConfirm(true); return; }
    setIsFollowing(true);
    setToastMessage(`Following ${club.country}`);
  };
  const confirmUnfollow = () => {
    setShowUnfollowConfirm(false);
    setIsFollowing(false);
    setToastMessage(`Unfollowed ${club.country}`);
  };
  const toggleWatch = () => {
    setIsWatching((c) => {
      if (!c) setToastMessage(`Watching ${club.country}`);
      return !c;
    });
  };

  const buildShareUrl = () => (typeof window !== "undefined" ? window.location.href : "");
  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
  };
  const handleShareToWhatsApp = () => {
    const text = `Check out ${club.country}'s FIFA profile\n${buildShareUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  const handleShareToX = () => {
    const text = `Check out ${club.country}'s FIFA profile\n${buildShareUrl()}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  const handleCopyLink = async () => {
    const ok = await copyToClipboard(`${club.country}\n${buildShareUrl()}`);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); }
  };

  // Tournament overview stat tiles
  const overviewStats = [
    { value: club.wins,           label: "WINS" },
    { value: club.draws,          label: "DRAWS" },
    { value: club.losses,         label: "LOSSES" },
    { value: club.matches_played, label: "MATCHES" },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 pt-4 pb-4">

      {/* Toast */}
      {toastMessage && (
        <div className="rounded-2xl border border-[#16a34a]/30 bg-[#0a1f12] px-4 py-3 text-sm font-medium text-white">
          {toastMessage}
        </div>
      )}

      {/* Unfollow confirm */}
      {showUnfollowConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowUnfollowConfirm(false)} />
          <div className="relative w-[90%] max-w-md bg-[#111] border border-[#2a2a2a] rounded-xl p-6 z-10">
            <p className="text-white text-lg font-bold">Unfollow {club.country}?</p>
            <p className="text-sm text-[#b5b5b5] mt-2">Are you sure you want to unfollow {club.country}?</p>
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => setShowUnfollowConfirm(false)}
                className="px-4 py-2 rounded-full bg-transparent border border-[#3a3a3a] text-white">
                Cancel
              </button>
              <button onClick={confirmUnfollow}
                className="px-4 py-2 rounded-full bg-[#16a34a] text-white font-bold">
                Unfollow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow / Watch / Share */}
      <div className="flex items-center gap-2 md:gap-3">
        <button onClick={handleFollowClick}
          className="flex flex-1 items-center justify-center gap-2 h-[46px] md:h-[52px] rounded-full text-white text-[14px] md:text-base font-bold border-0 cursor-pointer hover:opacity-90 transition-opacity bg-[#16a34a]">
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            {!isFollowing && <><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></>}
          </svg>
          {isFollowing ? "Following" : "Follow"}
        </button>

        <button onClick={toggleWatch}
          className={`flex flex-1 items-center justify-center gap-2 h-[46px] md:h-[52px] rounded-full text-[14px] md:text-base font-bold cursor-pointer transition-colors ${
            isWatching
              ? "bg-[#16a34a]/15 border border-[#16a34a] text-white"
              : "bg-transparent border border-[#16a34a] text-[#4ade80] hover:bg-[#16a34a]/10"
          }`}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {isWatching ? "Watching" : "Watch"}
        </button>

        <button onClick={() => { setShowShareDialog(true); setCopied(false); }}
          className="flex items-center justify-center w-[46px] h-[46px] md:w-[52px] md:h-[52px] rounded-full bg-transparent border border-[#16a34a] text-[#4ade80] cursor-pointer shrink-0 hover:bg-[#16a34a]/10 transition-colors"
          aria-label="Share club profile">
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      {/* Share dialog */}
      {showShareDialog && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/70" onClick={() => setShowShareDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowShareDialog(false)}>
            <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-semibold">Share FIFA Club Profile</p>
                <button onClick={() => setShowShareDialog(false)} className="text-gray-400 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                <p className="text-white text-sm font-semibold">{club.country} ({club.club_id})</p>
                <p className="text-white/45 text-[11px] mt-1 break-all">{buildShareUrl()}</p>
              </div>
              <div className="flex flex-row gap-2 mb-2">
                {[
                  { handler: handleShareToWhatsApp, label: "WhatsApp", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.112 1.52 5.842L0 24l6.335-1.481A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.82 9.82 0 01-5.007-1.37l-.36-.214-3.724.977.994-3.633-.235-.374A9.818 9.818 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/></svg> },
                  { handler: handleShareToX, label: "X", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { handler: handleCopyLink, label: "Copy", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> },
                ].map(({ handler, label, icon }) => (
                  <button key={label} onClick={handler}
                    className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white"
                    aria-label={`Share on ${label}`}>
                    {icon}
                  </button>
                ))}
              </div>
              {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
            </div>
          </div>
        </>
      )}

      {/* Notify / Alert */}
      <button className="flex w-full items-center justify-center gap-2 h-12 md:h-[52px] rounded-full bg-transparent border border-[#16a34a] text-[#4ade80] text-[13px] md:text-sm font-bold cursor-pointer hover:bg-[#16a34a]/10 transition-colors">
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add to Watchlist
      </button>

      {/* Tournament Stats */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Tournament Stats" />
        <div className="grid grid-cols-4 gap-2 mt-3">
          {overviewStats.map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center py-3.5 md:py-5 rounded-xl bg-[#242424]">
              <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-none">
                {s.value ?? "—"}
              </span>
              <span className="text-[10px] md:text-[11px] text-[#777777] mt-1 tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Club Overview */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5">
        <SectionLabel text="Club Overview" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[20px] md:text-[24px] font-extrabold text-[#4ade80] leading-tight">
              #{club.fifa_rank}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">FIFA Rank</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[18px] md:text-[20px] font-extrabold text-white leading-tight">
              {club.world_cup_apps}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">WC Appearances</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className="text-[20px] md:text-[24px] font-extrabold text-white leading-tight">
              {club.goals_for}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Goals For</span>
          </div>
          <div className="flex flex-col justify-center p-3.5 md:p-4 rounded-xl bg-[#242424]">
            <span className={`text-[20px] md:text-[24px] font-extrabold leading-tight ${club.goal_difference >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
              {club.goal_difference > 0 ? `+${club.goal_difference}` : club.goal_difference}
            </span>
            <span className="text-[11px] md:text-xs text-[#777777] mt-1">Goal Diff.</span>
          </div>
        </div>
      </div>
    </div>
  );
}