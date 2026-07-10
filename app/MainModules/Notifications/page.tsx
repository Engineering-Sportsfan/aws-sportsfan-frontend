
"use client";
import { useRoarNotifications } from "@/context/RoarNotificationsContext";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

type BattleNotification = {
  id: string;
  type: "BATTLE_INVITE" | string;
  senderName: string;
  senderId: string;
  battleId: string;
  battleName: string;
  battleType: "PLAYERS" | "CLUBS";
  message: string;
  isRead: boolean;
  createdAt: number;
};

type AudioNotification = {
  id: string;
  type: "NEW_AUDIO";
  message: string;
  isRead: boolean;
  createdAt: number;
  audioPublicId: string;
  audioTitle: string;
  audioUrl: string;
  audioDuration: string;
  audioDurationSeconds: number;
  audioFormat: string;
  audioUploadedAt: number;
};

type PostNotification = {
  id: string;
  type: "post_reaction" | "post_comment";
  message: string;
  isRead: boolean;
  createdAt: number;
};

type RoarLikeNotification = {
  id: string;
  type: "roar_post_like";
  postId: string;
  postPreview: string;
  likerNames: string[];
  likerCount: number;
  message: string;
  isRead: boolean;
  createdAt: number;
  updatedAt: number;
};

type RoarCommentNotification = {
  id: string;
  type: "roar_post_comment";
  postId: string;
  postPreview: string;
  commenterUsername: string;
  message: string;
  isRead: boolean;
  createdAt: number;
  updatedAt: number;
};

type Notification =
  | BattleNotification
  | AudioNotification
  | PostNotification
  | RoarLikeNotification
  | RoarCommentNotification;

// ─── Icons ────────────────────────────────────────────────────────────────────

const SwordsIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.71 5.63l-2.34-2.34a1 1 0 00-1.41 0l-3.12 3.12-1.41-1.42-1.42 1.42 1.41 1.41-6.6 6.6A2 2 0 005 16v3h3a2 2 0 001.42-.59l6.6-6.6 1.41 1.42 1.42-1.42-1.42-1.41 3.12-3.12a1 1 0 000-1.65zM8 17H7v-1l6.59-6.59 1 1L8 17zm8.35-9.76l-1-1 1.06-1.06 1 1-1.06 1.06z" />
  </svg>
);

const AudioWaveIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a1 1 0 011 1v16a1 1 0 01-2 0V4a1 1 0 011-1zM8 7a1 1 0 011 1v8a1 1 0 01-2 0V8a1 1 0 011-1zm8 0a1 1 0 011 1v8a1 1 0 01-2 0V8a1 1 0 011-1zM4 10a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 011-1zm16 0a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 011-1z" />
  </svg>
);

const PlayIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);

const CheckAllIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
  </svg>
);

const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
  </svg>
);

const HeartIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CommentIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = ({ color = "border-white" }: { color?: string }) => (
  <span
    className={`inline-block h-3.5 w-3.5 rounded-full border-2 border-transparent ${color} border-t-current animate-spin`}
  />
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/8 bg-white/3 p-4 animate-pulse">
    <div className="flex gap-3">
      <div className="h-11 w-11 rounded-xl bg-white/10 shrink-0" />
      <div className="flex-1 space-y-2.5 pt-1">
        <div className="h-3.5 w-4/5 rounded-full bg-white/10" />
        <div className="h-7 w-2/5 rounded-lg bg-white/8" />
        <div className="h-3 w-1/4 rounded-full bg-white/6" />
      </div>
    </div>
    <div className="mt-4 flex gap-2 pl-14">
      <div className="h-7 w-28 rounded-lg bg-white/8" />
      <div className="ml-auto h-7 w-16 rounded-lg bg-white/6" />
    </div>
  </div>
);

// ─── Audio mini-player ────────────────────────────────────────────────────────

const AudioPlayer = React.memo(function AudioPlayer({
  url,
  duration,
  isRead,
}: {
  url: string;
  duration: string;
  isRead: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      setProgress((el.currentTime / (el.duration || 1)) * 100);
      const m = Math.floor(el.currentTime / 60);
      const s = Math.floor(el.currentTime % 60);
      setCurrentTime(`${m}:${s.toString().padStart(2, "0")}`);
    };
    const onEnded = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  const trackColor = isRead ? "bg-white/15" : "bg-[#4a9eff]/30";
  const fillColor = isRead ? "bg-white/40" : "bg-[#4a9eff]";
  const btnColor = isRead
    ? "bg-white/8 border-white/12 text-white/50 hover:bg-white/15"
    : "bg-[#4a9eff]/20 border-[#4a9eff]/40 text-[#4a9eff] hover:bg-[#4a9eff]/30";

  return (
    <div className="flex items-center gap-2.5 mt-2.5">
      <audio ref={audioRef} src={url} preload="none" />
      <button
        onClick={toggle}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${btnColor}`}
      >
        {playing ? <PauseIcon size={11} /> : <PlayIcon size={11} />}
      </button>
      <div className={`flex-1 h-1 rounded-full overflow-hidden ${trackColor}`}>
        <div
          className={`h-full rounded-full transition-all duration-100 ${fillColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-white/30 tabular-nums min-w-[36px] text-right">
        {playing ? currentTime : duration}
      </span>
    </div>
  );
});

// ─── Shared action footer ─────────────────────────────────────────────────────

const CardFooter = React.memo(function CardFooter({
  isRead,
  onMarkRead,
  onClear,
  markLoading,
  clearLoading,
}: {
  isRead: boolean;
  onMarkRead: () => void;
  onClear: () => void;
  markLoading: boolean;
  clearLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-2 pl-14">
      {!isRead ? (
        <button
          onClick={onMarkRead}
          disabled={markLoading}
          className="flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-medium text-[#aaa] hover:border-white/25 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
        >
          {markLoading ? <Spinner /> : <CheckIcon />}
          Mark as read
        </button>
      ) : (
        <span className="flex items-center gap-1 text-xs text-[#444]">
          <CheckIcon /> Read
        </span>
      )}
      <button
        onClick={onClear}
        disabled={clearLoading}
        className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-500/15 bg-red-500/6 px-3 py-1.5 text-xs font-medium text-red-500/60 hover:border-red-500/35 hover:bg-red-500/15 hover:text-red-400 transition-all disabled:opacity-40"
      >
        {clearLoading ? <Spinner color="border-red-400" /> : <TrashIcon />}
        Clear
      </button>
    </div>
  );
});

// ─── Battle Notification Card ─────────────────────────────────────────────────

type BattleCardProps = {
  notif: BattleNotification;
  onMarkRead: () => void;
  onClear: () => void;
  onBattleClick: () => void;
  markLoading: boolean;
  clearLoading: boolean;
};

const BattleNotificationCard = React.memo(function BattleNotificationCard({
  notif,
  onMarkRead,
  onClear,
  onBattleClick,
  markLoading,
  clearLoading,
}: BattleCardProps) {
  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 ${
        notif.isRead
          ? "border-white/8 bg-[#111116]"
          : "border-[#d75a2d]/30 bg-gradient-to-br from-[#1a0e1a] to-[#1a1208]"
      }`}
    >
      {!notif.isRead && (
        <span className="absolute right-4 top-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e91e8c] opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e91e8c]" />
        </span>
      )}
      <div className="p-4">
        <div className="flex gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              notif.isRead
                ? "bg-white/6 text-[#666]"
                : "bg-gradient-to-br from-[#e91e8c]/25 to-[#d75a2d]/25 text-[#ff9a6c]"
            }`}
          >
            <SwordsIcon size={20} />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <p className={`text-sm leading-snug mb-1 ${notif.isRead ? "text-[#888]" : "text-white font-medium"}`}>
              <span className={`font-bold ${notif.isRead ? "text-[#aaa]" : "text-[#ff9a6c]"}`}>
                {notif.senderName}
              </span>{" "}
              has invited you to a{" "}
              <span className={notif.isRead ? "text-[#777]" : "text-white"}>Fan Battle!</span>
            </p>
            <button
              onClick={onBattleClick}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                notif.isRead
                  ? "border-white/10 bg-white/5 text-[#666] hover:border-white/20 hover:text-[#aaa]"
                  : "border-[#d75a2d]/35 bg-[#d75a2d]/12 text-[#ff9a6c] hover:border-[#d75a2d]/55 hover:bg-[#d75a2d]/20"
              }`}
            >
              <SwordsIcon size={12} />
              <span className="truncate max-w-[180px]">{notif.battleName}</span>
              <span className="opacity-50 text-[10px]">
                · {notif.battleType === "PLAYERS" ? "Players" : "Clubs"}
              </span>
              <ArrowRightIcon />
            </button>
            <p className="mt-1.5 text-[11px] text-[#444]">{timeAgo(notif.createdAt)}</p>
          </div>
        </div>
        <div className="my-3 border-t border-white/5" />
        <CardFooter
          isRead={notif.isRead}
          onMarkRead={onMarkRead}
          onClear={onClear}
          markLoading={markLoading}
          clearLoading={clearLoading}
        />
      </div>
    </div>
  );
});

// ─── Audio Notification Card ──────────────────────────────────────────────────

type AudioCardProps = {
  notif: AudioNotification;
  onMarkRead: () => void;
  onClear: () => void;
  markLoading: boolean;
  clearLoading: boolean;
};

const AudioNotificationCard = React.memo(function AudioNotificationCard({
  notif,
  onMarkRead,
  onClear,
  markLoading,
  clearLoading,
}: AudioCardProps) {
  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 ${
        notif.isRead
          ? "border-white/8 bg-[#111116]"
          : "border-[#4a9eff]/25 bg-gradient-to-br from-[#0d1520] to-[#0a1018]"
      }`}
    >
      {!notif.isRead && (
        <span className="absolute right-4 top-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4a9eff] opacity-50" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4a9eff]" />
        </span>
      )}
      <div className="p-4">
        <div className="flex gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              notif.isRead
                ? "bg-white/6 text-[#666]"
                : "bg-gradient-to-br from-[#4a9eff]/20 to-[#2277cc]/20 text-[#4a9eff]"
            }`}
          >
            <AudioWaveIcon size={20} />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`font-mono text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border ${
                  notif.isRead
                    ? "border-white/10 bg-white/5 text-[#555]"
                    : "border-[#4a9eff]/30 bg-[#4a9eff]/10 text-[#4a9eff]"
                }`}
              >
                New Audio
              </span>
              <span className="text-[10px] font-mono text-white/20 uppercase">
                {notif.audioFormat?.toUpperCase()}
              </span>
            </div>
            <p className={`text-sm font-medium leading-snug mb-0.5 ${notif.isRead ? "text-[#777]" : "text-white"}`}>
              {notif.audioTitle}
            </p>
            <p className="text-[11px] text-[#444]">
              {notif.audioDuration} · {timeAgo(notif.createdAt)}
            </p>
            <AudioPlayer
              url={notif.audioUrl}
              duration={notif.audioDuration}
              isRead={notif.isRead}
            />
          </div>
        </div>
        <div className="my-3 border-t border-white/5" />
        <CardFooter
          isRead={notif.isRead}
          onMarkRead={onMarkRead}
          onClear={onClear}
          markLoading={markLoading}
          clearLoading={clearLoading}
        />
      </div>
    </div>
  );
});

// ─── Post Notification Card ───────────────────────────────────────────────────

type PostCardProps = {
  notif: PostNotification;
  onMarkRead: () => void;
  onClear: () => void;
  markLoading: boolean;
  clearLoading: boolean;
};

const PostNotificationCard = React.memo(function PostNotificationCard({
  notif,
  onMarkRead,
  onClear,
  markLoading,
  clearLoading,
}: PostCardProps) {
  const isReaction = notif.type === "post_reaction";
  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 ${
        notif.isRead
          ? "border-white/8 bg-[#111116]"
          : isReaction
          ? "border-[#e91e8c]/25 bg-gradient-to-br from-[#1a0812] to-[#110a0f]"
          : "border-[#C9115F]/25 bg-gradient-to-br from-[#150a12] to-[#0f080d]"
      }`}
    >
      {!notif.isRead && (
        <span className="absolute right-4 top-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e91e8c] opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e91e8c]" />
        </span>
      )}
      <div className="p-4">
        <div className="flex gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              notif.isRead
                ? "bg-white/6 text-[#666]"
                : isReaction
                ? "bg-[#e91e8c]/20 text-[#e91e8c]"
                : "bg-[#C9115F]/20 text-[#C9115F]"
            }`}
          >
            {isReaction ? <HeartIcon size={20} /> : <CommentIcon size={20} />}
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <p className={`text-sm leading-snug mb-1 ${notif.isRead ? "text-[#888]" : "text-white font-medium"}`}>
              {notif.message}
            </p>
            <p className="mt-1.5 text-[11px] text-[#444]">{timeAgo(notif.createdAt)}</p>
          </div>
        </div>
        <div className="my-3 border-t border-white/5" />
        <CardFooter
          isRead={notif.isRead}
          onMarkRead={onMarkRead}
          onClear={onClear}
          markLoading={markLoading}
          clearLoading={clearLoading}
        />
      </div>
    </div>
  );
});

// ─── ROAR Like Notification Card ──────────────────────────────────────────────

type RoarLikeCardProps = {
  notif: RoarLikeNotification;
  onMarkRead: () => void;
  onClear: () => void;
  onPostClick: () => void;
  markLoading: boolean;
  clearLoading: boolean;
};

const RoarLikeNotificationCard = React.memo(function RoarLikeNotificationCard({
  notif,
  onMarkRead,
  onClear,
  onPostClick,
  markLoading,
  clearLoading,
}: RoarLikeCardProps) {
  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 ${
        notif.isRead
          ? "border-white/8 bg-[#111116]"
          : "border-[#e91e8c]/25 bg-gradient-to-br from-[#1a0812] to-[#110a0f]"
      }`}
    >
      {!notif.isRead && (
        <span className="absolute right-4 top-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e91e8c] opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e91e8c]" />
        </span>
      )}
      <div className="p-4">
        <div className="flex gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              notif.isRead ? "bg-white/6 text-[#666]" : "bg-[#e91e8c]/20 text-[#e91e8c]"
            }`}
          >
            <HeartIcon size={20} />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <span
              className={`inline-block font-mono text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border mb-1 ${
                notif.isRead
                  ? "border-white/10 bg-white/5 text-[#555]"
                  : "border-[#e91e8c]/30 bg-[#e91e8c]/10 text-[#e91e8c]"
              }`}
            >
              ROAR
            </span>
            <p className={`text-sm leading-snug mb-1.5 ${notif.isRead ? "text-[#888]" : "text-white font-medium"}`}>
              {notif.message}
            </p>
            {notif.postPreview && (
              <p className="text-[11px] text-[#555] italic mb-2 line-clamp-1">
                "{notif.postPreview}"
              </p>
            )}
            <button
              onClick={onPostClick}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                notif.isRead
                  ? "border-white/10 bg-white/5 text-[#666] hover:border-white/20 hover:text-[#aaa]"
                  : "border-[#e91e8c]/35 bg-[#e91e8c]/12 text-[#e91e8c] hover:border-[#e91e8c]/55 hover:bg-[#e91e8c]/20"
              }`}
            >
              View ROAR post <ArrowRightIcon />
            </button>
            <p className="mt-1.5 text-[11px] text-[#444]">
              {timeAgo(notif.updatedAt ?? notif.createdAt)}
            </p>
          </div>
        </div>
        <div className="my-3 border-t border-white/5" />
        <CardFooter
          isRead={notif.isRead}
          onMarkRead={onMarkRead}
          onClear={onClear}
          markLoading={markLoading}
          clearLoading={clearLoading}
        />
      </div>
    </div>
  );
});

// ─── ROAR Comment Notification Card ──────────────────────────────────────────

type RoarCommentCardProps = {
  notif: RoarCommentNotification;
  onMarkRead: () => void;
  onClear: () => void;
  onPostClick: () => void;
  markLoading: boolean;
  clearLoading: boolean;
};

const RoarCommentNotificationCard = React.memo(function RoarCommentNotificationCard({
  notif,
  onMarkRead,
  onClear,
  onPostClick,
  markLoading,
  clearLoading,
}: RoarCommentCardProps) {
  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 ${
        notif.isRead
          ? "border-white/8 bg-[#111116]"
          : "border-[#9333ea]/25 bg-gradient-to-br from-[#120a1a] to-[#0d0912]"
      }`}
    >
      {!notif.isRead && (
        <span className="absolute right-4 top-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9333ea] opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9333ea]" />
        </span>
      )}
      <div className="p-4">
        <div className="flex gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              notif.isRead ? "bg-white/6 text-[#666]" : "bg-[#9333ea]/20 text-[#9333ea]"
            }`}
          >
            <CommentIcon size={20} />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <span
              className={`inline-block font-mono text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border mb-1 ${
                notif.isRead
                  ? "border-white/10 bg-white/5 text-[#555]"
                  : "border-[#9333ea]/30 bg-[#9333ea]/10 text-[#9333ea]"
              }`}
            >
              ROAR
            </span>
            <p className={`text-sm leading-snug mb-1.5 ${notif.isRead ? "text-[#888]" : "text-white font-medium"}`}>
              {notif.message}
            </p>
            {notif.postPreview && (
              <p className="text-[11px] text-[#555] italic mb-2 line-clamp-1">
                "{notif.postPreview}"
              </p>
            )}
            <button
              onClick={onPostClick}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                notif.isRead
                  ? "border-white/10 bg-white/5 text-[#666] hover:border-white/20 hover:text-[#aaa]"
                  : "border-[#9333ea]/35 bg-[#9333ea]/12 text-[#9333ea] hover:border-[#9333ea]/55 hover:bg-[#9333ea]/20"
              }`}
            >
              View ROAR post <ArrowRightIcon />
            </button>
            <p className="mt-1.5 text-[11px] text-[#444]">
              {timeAgo(notif.createdAt)}
            </p>
          </div>
        </div>
        <div className="my-3 border-t border-white/5" />
        <CardFooter
          isRead={notif.isRead}
          onMarkRead={onMarkRead}
          onClear={onClear}
          markLoading={markLoading}
          clearLoading={clearLoading}
        />
      </div>
    </div>
  );
});

// ─── Unified dispatcher ───────────────────────────────────────────────────────

type CardProps = {
  notif: Notification;
  onMarkRead: () => void;
  onClear: () => void;
  onBattleClick: () => void;
  onRoarPostClick: (postId: string) => void;
  markLoading: boolean;
  clearLoading: boolean;
};

const NotificationCard = React.memo(function NotificationCard(props: CardProps) {
  const { notif, onMarkRead, onClear, markLoading, clearLoading } = props;

  if (notif.type === "NEW_AUDIO") {
    return (
      <AudioNotificationCard
        notif={notif as AudioNotification}
        onMarkRead={onMarkRead}
        onClear={onClear}
        markLoading={markLoading}
        clearLoading={clearLoading}
      />
    );
  }

  if (notif.type === "post_reaction" || notif.type === "post_comment") {
    return (
      <PostNotificationCard
        notif={notif as PostNotification}
        onMarkRead={onMarkRead}
        onClear={onClear}
        markLoading={markLoading}
        clearLoading={clearLoading}
      />
    );
  }

  if (notif.type === "roar_post_like") {
    const n = notif as RoarLikeNotification;
    return (
      <RoarLikeNotificationCard
        notif={n}
        onMarkRead={onMarkRead}
        onClear={onClear}
        onPostClick={() => props.onRoarPostClick(n.postId)}
        markLoading={markLoading}
        clearLoading={clearLoading}
      />
    );
  }

  if (notif.type === "roar_post_comment") {
    const n = notif as RoarCommentNotification;
    return (
      <RoarCommentNotificationCard
        notif={n}
        onMarkRead={onMarkRead}
        onClear={onClear}
        onPostClick={() => props.onRoarPostClick(n.postId)}
        markLoading={markLoading}
        clearLoading={clearLoading}
      />
    );
  }

  return (
    <BattleNotificationCard
      notif={notif as BattleNotification}
      onMarkRead={onMarkRead}
      onClear={onClear}
      onBattleClick={props.onBattleClick}
      markLoading={markLoading}
      clearLoading={clearLoading}
    />
  );
});

// ─── ROAR Alert Item ──────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  PREDICTION_OK: "#22c55e",
  PREDICTION_FAIL: "#ef4444",
  CHALLENGE: "#e91e8c",
  BADGE: "#eab308",
  RIVAL: "#e91e8c",
  FAN_OF_WEEK: "#eab308",
  WEEKLY: "#9333ea",
};

type RoarAlertItemProps = {
  n: {
    id: string;
    type: string;
    read: boolean;
    title: string;
    subtitle?: string | null;
    cta?: string | null;
    time: string;
  };
  onMarkRead: (id: string) => void;
};

const RoarAlertItem = React.memo(function RoarAlertItem({ n, onMarkRead }: RoarAlertItemProps) {
  const color = TYPE_COLORS[n.type] || "#e91e8c";
  return (
    <div
      onClick={() => onMarkRead(n.id)}
      className="relative cursor-pointer rounded-2xl border transition-all duration-300"
      style={{
        borderColor: n.read ? "rgba(255,255,255,0.08)" : `${color}40`,
        background: n.read
          ? "#111116"
          : `linear-gradient(135deg, ${color}0d 0%, #0a0a12 100%)`,
        borderLeft: `3px solid ${n.read ? "rgba(255,255,255,0.08)" : color}`,
        padding: "14px 16px",
      }}
    >
      {!n.read && (
        <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: color }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ background: color }}
          />
        </span>
      )}
      <span
        className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
        style={{ color, background: `${color}20` }}
      >
        {n.type.replace(/_/g, " ")}
      </span>
      <p className="mt-2 text-sm font-semibold text-white leading-snug">{n.title}</p>
      <p className="mt-0.5 text-xs text-[#888] leading-snug">{n.subtitle}</p>
      {n.cta && (
        <p className="mt-1.5 text-xs font-bold" style={{ color }}>
          {n.cta} →
        </p>
      )}
      <p className="mt-1 text-[10px] text-[#444]">{n.time}</p>
    </div>
  );
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { roarNotifications, markRoarRead, markAllRoarRead, roarUnreadCount } =
    useRoarNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "audio">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── FIX 1: Stable primitives prevent unnecessary re-fetches ───────────────
  const userEmail = user?.email ?? null;
  const userUid = user?.uid ?? null;

  // ── FIX 2: useCallback now depends on stable primitives ───────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userEmail && !userUid) return;
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (userEmail) params.email = userEmail;
      if (userUid) params.uid = userUid;

      const res = await axios.get<{
        success: boolean;
        notifications: Notification[];
      }>("/api/notifications", { params });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userEmail, userUid]);

  // ── FIX 3: useEffect was missing — this was the main cause of never loading
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const markRead = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      await axios.patch("/api/notifications", { id, action: "markRead" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark read:", err);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userEmail && !userUid) return;
    setActionLoading("__all__");
    try {
      await axios.patch("/api/notifications", {
        email: userEmail,
        uid: userUid,
        action: "markAllRead",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    } finally {
      setActionLoading(null);
    }
  }, [userEmail, userUid]);

  const clearOne = useCallback(async (id: string) => {
    setActionLoading(id + "__clear");
    try {
      await axios.delete("/api/notifications", { data: { id } });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to clear notification:", err);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const clearAll = useCallback(async () => {
    if (!userEmail) return;
    setActionLoading("__clear_all__");
    try {
      await axios.delete("/api/notifications", {
        data: { email: userEmail, all: true },
      });
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear all:", err);
    } finally {
      setActionLoading(null);
    }
  }, [userEmail]);

  const handleRoarPostClick = useCallback((postId: string) => {
    router.push(`/MainModules/ROAR?postId=${postId}`);
  }, [router]);

  // ── FIX 4: Memoized derived state — no recomputing on every render ─────────
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const audioCount = useMemo(
    () => notifications.filter((n) => n.type === "NEW_AUDIO").length,
    [notifications],
  );

  const unreadAudioCount = useMemo(
    () => notifications.filter((n) => n.type === "NEW_AUDIO" && !n.isRead).length,
    [notifications],
  );

  // ── FIX 5: displayed list memoized ────────────────────────────────────────
  const displayed = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    if (filter === "audio") return notifications.filter((n) => n.type === "NEW_AUDIO");
    return notifications;
  }, [filter, notifications]);

  const isBulkLoading =
    actionLoading === "__all__" || actionLoading === "__clear_all__";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#07070f] text-white pb-10">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 border-b border-white/8 bg-[#07070f]/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4">
          {/* Top bar */}
          <div className="flex items-center gap-3 py-4">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#aaa] hover:bg-white/10 hover:text-white transition-all"
            >
              <BackIcon />
            </button>

            <div className="flex items-center gap-2.5 flex-1">
              <div>
                <h1 className="text-base font-bold leading-tight tracking-tight">
                  Notifications
                </h1>
                <p className="text-[11px] text-[#555]">
                  {loading
                    ? "Loading…"
                    : unreadCount > 0
                      ? `${unreadCount} unread`
                      : "All caught up"}
                </p>
              </div>
            </div>

            {!loading && notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    disabled={isBulkLoading}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#aaa] hover:border-white/20 hover:text-white transition-all disabled:opacity-40"
                    title="Mark all as read"
                  >
                    {actionLoading === "__all__" ? <Spinner /> : <CheckAllIcon />}
                    <span className="hidden sm:inline">All read</span>
                  </button>
                )}
                <button
                  onClick={clearAll}
                  disabled={isBulkLoading}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-1.5 text-xs font-medium text-red-400/70 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-400 transition-all disabled:opacity-40"
                  title="Clear all notifications"
                >
                  {actionLoading === "__clear_all__" ? (
                    <Spinner color="border-red-400" />
                  ) : (
                    <TrashIcon />
                  )}
                  <span className="hidden sm:inline">Clear all</span>
                </button>
              </div>
            )}
          </div>

          {/* Filter tabs */}
          {!loading && notifications.length > 0 && (
            <div className="flex gap-1 pb-3">
              {(
                [
                  { key: "all", label: "All", count: null },
                  { key: "unread", label: "Unread", count: unreadCount },
                  { key: "audio", label: "Audio", count: unreadAudioCount },
                ] as const
              ).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-sm font-medium transition-all ${
                    filter === key
                      ? key === "audio"
                        ? "bg-gradient-to-r from-[#4a9eff]/15 to-[#2277cc]/15 border border-[#4a9eff]/35 text-[#4a9eff]"
                        : "bg-gradient-to-r from-[#e91e8c]/15 to-[#d75a2d]/15 border border-[#d75a2d]/35 text-[#ff9a6c]"
                      : "text-[#555] hover:text-[#888]"
                  }`}
                >
                  {label}
                  {count != null && count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white leading-none min-w-[18px] text-center ${
                        key === "audio" ? "bg-[#4a9eff]" : "bg-[#e91e8c]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                  {key === "audio" && (
                    <span className="text-[9px] text-white/20 font-mono hidden sm:inline">
                      ({audioCount})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-6xl px-4 pt-4 space-y-3">
        {/* ROAR contextual alerts */}
        {roarNotifications.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#e91e8c]">
                  ROAR Alerts
                </span>
                {roarUnreadCount > 0 && (
                  <span className="rounded-full bg-[#e91e8c] px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                    {roarUnreadCount} new
                  </span>
                )}
              </div>
              {roarUnreadCount > 0 && (
                <button
                  onClick={markAllRoarRead}
                  className="text-xs text-[#555] hover:text-[#aaa] transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="space-y-2">
              {roarNotifications
                .filter((n) => n.type !== "MATCH_LIVE" && n.type !== "HEATING_UP")
                .map((n) => (
                  <RoarAlertItem key={n.id} n={n} onMarkRead={markRoarRead} />
                ))}
            </div>
            <div className="my-5 border-t border-white/8" />
          </div>
        )}

        {/* Main notification list */}
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center select-none">
            <p className="text-base font-semibold text-white/25">
              {filter === "unread"
                ? "No unread notifications"
                : filter === "audio"
                  ? "No audio notifications yet"
                  : "No notifications yet"}
            </p>
            <p className="mt-1.5 text-sm text-white/15 max-w-xs">
              {filter === "unread"
                ? "You're all caught up! Switch to all to see past notifications."
                : filter === "audio"
                  ? "New IPL audio clips will show up here when they're uploaded."
                  : "When someone invites you to a Fan Battle, new audio drops, or someone reacts to your ROAR, it'll appear here."}
            </p>
            {filter !== "all" && notifications.length > 0 && (
              <button
                onClick={() => setFilter("all")}
                className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#aaa] hover:text-white transition-colors"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          displayed.map((notif) => (
            <NotificationCard
              key={notif.id}
              notif={notif}
              onMarkRead={() => markRead(notif.id)}
              onClear={() => clearOne(notif.id)}
              onBattleClick={() =>
                router.push(`/battles/${(notif as BattleNotification).battleId}`)
              }
              onRoarPostClick={handleRoarPostClick}
              markLoading={actionLoading === notif.id}
              clearLoading={actionLoading === notif.id + "__clear"}
            />
          ))
        )}
      </div>
    </div>
  );
}