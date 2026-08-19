// MainModules\AtheleteMedia\AudioPlayerScreen\[id]\page.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AudioDrop, { audioDropsData } from '@/src/components/CommonComponent/AudioDrop/AudioDrop';
import { ThumbsUp, ThumbsDown, MessageCircle, MoreVertical, Flag, Share2, Link2, EyeOff, X } from 'lucide-react';

function formatTime(secs: number) {
  if (!isFinite(secs) || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Parse a "MM:SS" string to total seconds. */
function parseDuration(str: string): number {
  const [m, s] = str.split(':').map(Number);
  return (m ?? 0) * 60 + (s ?? 0);
}

export default function AudioPlayerScreen() {
  const router = useRouter();
  const { id = '1' } = useParams<{ id: string }>();

  const audioData = audioDropsData[id] ?? audioDropsData['1'];

  // ── Audio element ref ──────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(3241);
  const [dislikeCount, setDislikeCount] = useState(98);
  const [showKebab, setShowKebab] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ── Wire audio element events ──────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onLoadedMetadata = () => { setDuration(audio.duration); setIsLoading(false); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  // Sync volume changes to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Reset when track changes (id changes)
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setIsLoading(true);
  }, [id]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); } catch (_) { /* user gesture required */ }
    } else {
      audio.pause();
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  }, []);

  const jumpToMoment = useCallback(async (timestampStr: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = parseDuration(timestampStr);
    try { await audio.play(); } catch (_) { /* noop */ }
  }, []);

  const skip = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
  }, []);

  const effectiveDuration = duration > 0 ? duration : parseDuration(audioData.totalDuration);
  const progressPct = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="bg-black min-h-screen w-full flex justify-center">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={audioData.audioUrl}
        preload="metadata"
        style={{ display: 'none' }}
      />

      <div className="relative w-full max-w-[390px] min-h-screen">
        {/* Scrollable AudioDrop visual layer */}
        <div className="overflow-y-auto" style={{ height: '100vh' }}>
          <div className="relative" style={{ height: '1650px' }}>
            <style>{`
              .audio-drop-layer [data-name="Button"] { pointer-events: none; }
              .audio-drop-layer [data-name="MuiSliderRail"],
              .audio-drop-layer [data-name="MuiSliderTrack"],
              .audio-drop-layer [data-name="MuiSliderThumb"] { pointer-events: none; }
            `}</style>
            <div className="audio-drop-layer w-full">
              <AudioDrop data={audioData} />
            </div>

            {/* === INTERACTIVE OVERLAY LAYER === */}

            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="absolute z-20 flex items-center justify-center rounded-full"
              style={{ left: 20, top: 24, width: 44, height: 44, background: 'transparent' }}
              aria-label="Go back"
            />

            {/* Progress bar */}
            <div
              className="absolute z-20 cursor-pointer"
              style={{ left: 20, top: 645, width: 350, height: 20 }}
              onClick={handleSeek}
            >
              <div className="absolute top-[8px] left-0 w-full h-[4px] rounded-full bg-[rgba(255,255,255,0.15)]" />
              <div
                className="absolute top-[8px] left-0 h-[4px] rounded-full bg-[#c9115f] transition-[width] duration-100"
                style={{ width: `${progressPct}%` }}
              />
              <div
                className="absolute top-[4px] w-[12px] h-[12px] rounded-full bg-[#c9115f] shadow-md -translate-x-1/2 transition-[left] duration-100"
                style={{ left: `${progressPct}%` }}
              />
            </div>

            {/* Time display */}
            <div className="absolute z-20 flex justify-between pointer-events-none" style={{ left: 20, top: 664, width: 350 }}>
              <span className="text-[#99a1af] text-[12px]">{formatTime(currentTime)}</span>
              <span className="text-[#99a1af] text-[12px]">{formatTime(effectiveDuration)}</span>
            </div>

            {/* Rewind 15s */}
            <button
              onClick={() => skip(-15)}
              className="absolute z-20 rounded-full hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              style={{ left: 87, top: 684, width: 48, height: 48, background: 'transparent' }}
              aria-label="Rewind 15s"
            />

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="absolute z-20 flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform"
              style={{
                left: 167, top: 680, width: 56, height: 56,
                background: '#c9115f',
                boxShadow: '0px 18.75px 9.375px rgba(231,0,11,0.4)',
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                /* Loading spinner */
                <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
              ) : isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 28 28" fill="white">
                  <rect x="5" y="4" width="7" height="20" rx="1.5" />
                  <rect x="16" y="4" width="7" height="20" rx="1.5" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 28 28" fill="white">
                  <path d="M9.33333 5.83333V22.1667L22.1667 14L9.33333 5.83333Z" />
                </svg>
              )}
            </button>

            {/* Skip 15s */}
            <button
              onClick={() => skip(15)}
              className="absolute z-20 rounded-full hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              style={{ left: 255, top: 684, width: 48, height: 48, background: 'transparent' }}
              aria-label="Skip 15s"
            />

            {/* Volume button */}
            <button
              onClick={() => setShowVolumePanel(v => !v)}
              className="absolute z-20 rounded-[14px] hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              style={{ left: 34, top: 763, width: 102, height: 57, background: 'transparent' }}
              aria-label="Volume"
            />

            {/* Volume panel */}
            {showVolumePanel && (
              <div
                className="absolute z-30 bg-[#1a1a26] border border-[rgba(255,255,255,0.15)] rounded-[16px] p-4 shadow-2xl"
                style={{ left: 20, top: 828, width: 220 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 7.5V12.5H5.83333L10 16.6667V3.33333L5.83333 7.5H2.5ZM13.75 10C13.75 8.525 12.9 7.25833 11.6667 6.64167V13.35C12.9 12.7417 13.75 11.475 13.75 10Z" fill="#99a1af" />
                  </svg>
                  <span className="text-white text-[13px]">Volume</span>
                  <span className="text-[#99a1af] text-[12px] ml-auto">{volume}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-full accent-[#c9115f]"
                />
              </div>
            )}

            {/* Kebab menu */}
            <div className="absolute z-30" style={{ right: 20, top: 24 }}>
              <button
                onClick={() => setShowKebab(k => !k)}
                className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] active:scale-95 transition-all"
              >
                <MoreVertical size={18} color="white" />
              </button>
              {showKebab && (
                <div className="absolute right-0 top-full mt-2 bg-[#1a1a22] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl z-50 w-[200px] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.07)]">
                    <span className="text-white text-[13px] font-semibold">Options</span>
                    <button onClick={() => setShowKebab(false)}><X size={14} color="#888" /></button>
                  </div>
                  {[
                    { icon: <Flag size={15} color="#ff4444" />, label: 'Report', color: '#ff4444' },
                    { icon: <Share2 size={15} color="#99a1af" />, label: 'Share', color: '#99a1af' },
                    { icon: <Link2 size={15} color="#99a1af" />, label: 'Copy link', color: '#99a1af' },
                    { icon: <EyeOff size={15} color="#99a1af" />, label: 'Not interested', color: '#99a1af' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setShowKebab(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left"
                    >
                      {item.icon}
                      <span className="text-[13px]" style={{ color: item.color }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reactions bar */}
            <div className="absolute z-20 flex items-center gap-2" style={{ left: 20, top: 830, width: 350 }}>
              <button
                onClick={() => {
                  setLiked(l => { setLikeCount(c => l ? c - 1 : c + 1); return !l; });
                  if (disliked) { setDisliked(false); setDislikeCount(c => c - 1); }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95"
                style={{ background: liked ? 'rgba(201,17,95,0.2)' : 'rgba(255,255,255,0.08)', border: liked ? '1px solid rgba(201,17,95,0.5)' : '1px solid rgba(255,255,255,0.1)' }}
              >
                <ThumbsUp size={14} color={liked ? '#c9115f' : '#99a1af'} fill={liked ? '#c9115f' : 'none'} />
                <span className="text-[12px]" style={{ color: liked ? '#c9115f' : '#99a1af' }}>{likeCount.toLocaleString()}</span>
              </button>
              <button
                onClick={() => {
                  setDisliked(d => { setDislikeCount(c => d ? c - 1 : c + 1); return !d; });
                  if (liked) { setLiked(false); setLikeCount(c => c - 1); }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95"
                style={{ background: disliked ? 'rgba(255,89,0,0.15)' : 'rgba(255,255,255,0.08)', border: disliked ? '1px solid rgba(255,89,0,0.4)' : '1px solid rgba(255,255,255,0.1)' }}
              >
                <ThumbsDown size={14} color={disliked ? '#ff5900' : '#99a1af'} fill={disliked ? '#ff5900' : 'none'} />
                <span className="text-[12px]" style={{ color: disliked ? '#ff5900' : '#99a1af' }}>{dislikeCount}</span>
              </button>
              <button className="flex items-center gap-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2">
                <MessageCircle size={14} color="#99a1af" />
                <span className="text-[#99a1af] text-[12px]">247</span>
              </button>
            </div>

            {/* Key Moments overlays — clickable hit targets over the rendered buttons */}
            {/* Layout: Container92 starts at y=856, Container98 top=317 → 856+317=1173, rows at top=40 inside Container100 top=40 → 1173+40+40=1253 */}
            {audioData.keyMoments.map((moment, i) => (
              <button
                key={moment.timestamp}
                onClick={() => jumpToMoment(moment.timestamp)}
                className="absolute z-20 rounded-[14px] hover:bg-[rgba(201,17,95,0.15)] transition-colors"
                style={{ left: 20, top: 1253 + i * 61, width: 350, height: 53, background: 'transparent' }}
                aria-label={`Jump to ${moment.label} at ${moment.timestamp}`}
              />
            ))}
          </div>
        </div>

        {/* Now-playing bar (shows when playing) */}
        {isPlaying && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[390px]">
            <div
              className="mx-4 mb-4 bg-[#c9115f] rounded-full px-4 py-2 flex items-center gap-3 shadow-xl"
              style={{ boxShadow: '0 4px 24px rgba(201,17,95,0.5)' }}
            >
              <div className="flex gap-[2px] items-end h-4">
                {[3, 5, 7, 4, 6, 3, 5].map((h, i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-full bg-white animate-pulse"
                    style={{ height: `${h * 2}px`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
              <span className="text-white text-[12px] flex-1 truncate">{audioData.title}</span>
              <span className="text-white/70 text-[11px]">{formatTime(currentTime)}</span>
              <button onClick={togglePlay} className="text-white/80 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 28 28" fill="currentColor">
                  <rect x="5" y="4" width="7" height="20" rx="1.5" />
                  <rect x="16" y="4" width="7" height="20" rx="1.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
