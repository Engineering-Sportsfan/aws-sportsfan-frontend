// MainModules\AtheleteMedia\VideoScreen\[slug]\page.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Play, Pause, Volume2, VolumeX, Maximize, ChevronLeft,
  SkipBack, SkipForward, Share2, BookmarkPlus, ThumbsUp,
  ThumbsDown, MessageCircle, MoreVertical, Flag, Link2, EyeOff, X, Clock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoChapter {
  timestamp: string; // e.g. "2:45"
  label: string;
}

interface RelatedVideo {
  title: string;
  duration: string;
  tag: string;
  thumbnail: string; // public-folder path
  path: string;      // navigate-to path e.g. /video/2
}

 export interface VideoData {
  // Player
  videoUrl: string;       // actual video/embed URL
  thumbnail: string;      // poster image (public folder)
  totalDuration: string;  // "MM:SS"

  // Labels
  badgeLabel: string;     // e.g. "VIDEO DROP"
  episode: string;        // e.g. "EP 01"
  category: string;       // e.g. "Athletics"
  title: string;
  metaLine: string;       // e.g. "1.2k views · Commonwealth Games 2026"

  // Body
  description: string;
  chapters: VideoChapter[];

  // Related
  relatedVideos: RelatedVideo[];

  // Stats
  likeCount: number;
  commentCount: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export interface VideoData {
  videoUrl: string;
  thumbnail: string;
  totalDuration: string;
  badgeLabel: string;
  episode: string;
  category: string;
  title: string;
  metaLine: string;
  description: string;
  chapters: Array<{ timestamp: string; label: string }>;
  relatedVideos: Array<{
    title: string;
    duration: string;
    tag: string;
    thumbnail: string;
    path: string;
  }>;
  likeCount: number;
  commentCount: number;
}

export const videosData: Record<string, VideoData> = {

  'neeraj-chopra': {
    videoUrl: 'https://res.cloudinary.com/dflnsufit/video/upload/v1782723819/Neeraj_Chopra_wins_historic_gold_for_India_Tokyo2020_Highlights_-_Olympics_1080p_h264_youtube_kou6we.mp4',
    thumbnail: '/neeraj.png',
    totalDuration: '8:07', // TODO: confirm actual duration of new video
    badgeLabel: 'ATHLETE STORY',
    episode: 'EP 01',
    category: 'Javelin',
    title: 'Gold at Tokyo: The Iconic Throw 🥇',
    metaLine: '5.2k views · Athlete Story',
    description:
      'Relive the iconic moment Neeraj Chopra clinched India\u2019s first-ever Olympic gold in athletics at Tokyo 2020. This historic throw became a defining moment for Indian sport, inspiring a generation of athletes and cementing his legacy as one of the country\u2019s greatest sporting icons.',
    chapters: [
      { timestamp: '0:00', label: 'Early beginnings' },
      { timestamp: '2:08', label: 'Rise on the international stage' },
      { timestamp: '4:52', label: 'Olympic & Commonwealth success' },
      { timestamp: '6:45', label: 'Inspiring the next generation' },
    ],
    relatedVideos: [
      {
        title: '10.09 — India Goes Sub-10.10 ⚡',
        duration: '0:00',
        tag: 'Video',
        thumbnail: '/Gurindervir-Singh-3.png',
        // path: '/video/gurindervir-singh',
        path: '/MainModules/AtheleteMedia/VideoScreen/gurindervir-singh',
      },
      {
        title: '9:13 NR: Parul Flies in Doha 🔥',
        duration: '9:13',
        tag: 'Video',
        thumbnail: '/parul-chaudhary.png',
        // path: '/video/parul-chaudhary',
        path: '/MainModules/AtheleteMedia/VideoScreen/parul-chaudhary',
      },
    ],
    likeCount: 4823,
    commentCount: 318,
  },

  'gurindervir-singh': {
    videoUrl: 'https://res.cloudinary.com/dflnsufit/video/upload/v1782723762/Animesh_Kujur_smashes_the_NR_in_Men_s_200m_with_a_timing_of_20.32s_indianathletics_teamindia_-_The_Bridge_720p_h264_youtube_nqjamt.mp4',
    thumbnail: '/Gurindervir-Singh.webp', // TODO: update thumbnail
    totalDuration: '0:00', // TODO: fill actual duration
    badgeLabel: 'ATHLETE STORY',
    episode: 'EP 02',
    category: 'Sprint',
    title: '10.09 — India Goes Sub-10.10 ⚡',
    metaLine: '0 views · Athlete Story', // TODO: update views
    description:
      'Gurindervir Singh becomes one of the fastest men in Indian history, breaking the sub-10.10 barrier in the 100m and rewriting national records with this electrifying performance.',
    chapters: [
      { timestamp: '0:00', label: 'Build-up to the race' },
    ],
    relatedVideos: [
      {
        title: 'Gold at Tokyo: The Iconic Throw 🥇',
        duration: '8:07',
        tag: 'Video',
        thumbnail: '/neeraj-journey-banner.png',
        // path: '/video/neeraj-chopra',
          path: '/MainModules/AtheleteMedia/VideoScreen/parul-chaudhary',
      },
    ],
    likeCount: 0,
    commentCount: 0,
  },

  'murali-sreeshankar': {
    videoUrl: '', // TODO: video missing for Murali Sreeshankar
    thumbnail: '/Sreeshankar-article.jpeg', // TODO: update thumbnail
    totalDuration: '0:00',
    badgeLabel: 'ATHLETE STORY',
    episode: 'EP 03',
    category: 'Long Jump',
    title: 'Murali Sreeshankar\u2019s Story', // TODO: update title
    metaLine: '0 views · Athlete Story',
    description:
      'Video coming soon — Murali Sreeshankar\u2019s journey as one of India\u2019s top long jumpers.', // TODO
    chapters: [],
    relatedVideos: [],
    likeCount: 0,
    commentCount: 0,
  },

  'parul-chaudhary': {
    videoUrl: 'https://res.cloudinary.com/dflnsufit/video/upload/v1782723763/tweeload_0huh67l9_gzq2dy.mp4',
    thumbnail: '/parul-choudhary.jpg', // TODO: update thumbnail
    totalDuration: '9:13',
    badgeLabel: 'ATHLETE STORY',
    episode: 'EP 04',
    category: 'Distance Running',
    title: '9:13 NR: Parul Flies in Doha 🔥',
    metaLine: '0 views · Athlete Story',
    description:
      'Parul Chaudhary sets a new national record with a stunning 9:13 performance in Doha, showcasing the speed and endurance that have made her one of India\u2019s leading distance runners.',
    chapters: [
      { timestamp: '0:00', label: 'Race build-up' },
    ],
    relatedVideos: [],
    likeCount: 0,
    commentCount: 0,
  },

  'pooja-singh': {
    videoUrl: '', // TODO: video missing for Pooja Singh
    thumbnail: '/Pooja-Singh-article.webp', // TODO: update thumbnail
    totalDuration: '0:00',
    badgeLabel: 'ATHLETE STORY',
    episode: 'EP 05',
    category: 'Athletics', // TODO: update category
    title: 'Pooja Singh\u2019s Story', // TODO: update title
    metaLine: '0 views · Athlete Story',
    description:
      'Video coming soon — Pooja Singh\u2019s journey in Indian athletics.', // TODO
    chapters: [],
    relatedVideos: [],
    likeCount: 0,
    commentCount: 0,
  },

  'tejaswin-shankar': {
    videoUrl: 'https://res.cloudinary.com/dflnsufit/video/upload/v1782723821/Shankar_Tejaswin_Wins_Spectacular_Gold_Asian_Indoor_Athletics_Championships_Trending_Show_-_Republic_World_1080p_h264_youtube_e6klfc.mp4',
    thumbnail: '/tejaswin-article.jpeg', // TODO: update thumbnail
    totalDuration: '0:00', // TODO: fill duration — title suggests "8057" (jump score, not time)
    badgeLabel: 'ATHLETE STORY',
    episode: 'EP 06',
    category: 'High Jump',
    title: '8057: Tejaswin Goes Beyond 8K 🔥',
    metaLine: '0 views · Athlete Story',
    description:
      'Tejaswin Shankar shatters expectations with a historic decathlon score, going beyond the 8000-point mark and claiming gold at the Asian Indoor Athletics Championships.',
    chapters: [
      { timestamp: '0:00', label: 'Path to gold' },
    ],
    relatedVideos: [],
    likeCount: 0,
    commentCount: 0,
  },

  'sarvesh-kushare': {
    videoUrl: 'https://res.cloudinary.com/dflnsufit/video/upload/v1782723777/Sarvesh_Kushare_From_Remote_Indian_Village_to_World_s_High_Jump_Final_-_Kaushik_Roy_Chowdhury_1080p_h264_youtube_x1sjxf.mp4',
    thumbnail: '/Sarvesh-Kushare-article.avif', // TODO: update thumbnail
    totalDuration: '0:00',
    badgeLabel: 'ATHLETE STORY',
    episode: 'EP 07',
    category: 'High Jump',
    title: 'Village Pit to World Final 🏆',
    metaLine: '0 views · Athlete Story',
    description:
      'From a remote Indian village to competing on the world stage — Sarvesh Kushare\u2019s remarkable journey to the high jump World Final showcases grit, determination, and raw talent.',
    chapters: [
      { timestamp: '0:00', label: 'Humble beginnings' },
    ],
    relatedVideos: [],
    likeCount: 0,
    commentCount: 0,
  },

  'priyanka-goswami': {
    videoUrl: 'https://res.cloudinary.com/dflnsufit/video/upload/v1782723833/From_Struggles_to_Triumph_Priyanka_Goswami_s_Racewalking_Story_Sports_Ka_Mahakumbh_-_Radio_City_India_1080p_h264_youtube_a55jkd.mp4',
    thumbnail: '/priyanka-goswami.png', // TODO: update thumbnail
    totalDuration: '0:00',
    badgeLabel: 'ATHLETE STORY',
    episode: 'EP 08',
    category: 'Race Walk',
    title: 'Walk of Triumph: Priyanka\u2019s Story 🚶\u200d♀️',
    metaLine: '0 views · Athlete Story',
    description:
      'Priyanka Goswami\u2019s journey from struggle to triumph in the discipline of racewalking — a story of perseverance that has made her one of India\u2019s standout track and field athletes.',
    chapters: [
      { timestamp: '0:00', label: 'Early struggles' },
    ],
    relatedVideos: [],
    likeCount: 0,
    commentCount: 0,
  },
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDuration(str: string): number {
  const parts = str.split(':').map(Number);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  return 0;
}

function formatTime(secs: number) {
  if (!isFinite(secs) || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoScreen() {
  const router = useRouter();
  const { slug = 'neeraj-chopra' } = useParams<{ slug: string }>();

  // Get video data with fallback
  const video = videosData[slug] ?? videosData['neeraj-chopra'];

  // Handle missing video
  if (!video) {
    return (
      <div className="bg-[#0b0b0f] h-screen w-full flex justify-center items-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-full bg-[#c9115f]/10 border border-[#c9115f]/30 flex items-center justify-center mx-auto mb-4">
            <Play className="w-7 h-7 text-[#c9115f]" />
          </div>
          <p className="text-white font-semibold text-lg">Video Not Found</p>
          <p className="text-gray-400 text-sm mt-1">The video you're looking for doesn't exist</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(102deg, #ff1379 0%, #ff6a3d 100%)' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const TOTAL_DURATION = parseDuration(video.totalDuration);

  // Video element ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [dislikeCount, setDislikeCount] = useState(Math.floor(video.likeCount * 0.03));
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showKebab, setShowKebab] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when video id changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLiked(false);
    setDisliked(false);
    setLikeCount(video.likeCount);
    setDislikeCount(Math.floor(video.likeCount * 0.03));
    setIsLoading(true);
  }, [slug, video.likeCount]);

  // Wire video element events
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onLoaded = () => { setDuration(el.duration); setIsLoading(false); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    el.addEventListener('waiting', onWaiting);
    el.addEventListener('canplay', onCanPlay);
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('waiting', onWaiting);
      el.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  // Sync mute
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const togglePlay = useCallback(async () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) { try { await el.play(); } catch (_) { /* noop */ } }
    else el.pause();
  }, []);

  const handleVideoTap = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    togglePlay();
  }, [togglePlay]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current;
    if (!el || !isFinite(el.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * el.duration;
  }, []);

  const skip = useCallback((delta: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + delta));
  }, []);

  const jumpToChapter = useCallback(async (ts: string) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = parseDuration(ts);
    try { await el.play(); } catch (_) { /* noop */ }
  }, []);

  const effectiveDuration = duration > 0 ? duration : TOTAL_DURATION;
  const progressPct = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="bg-[#0b0b0f] h-screen w-full flex justify-center">
      <div className="relative w-full max-w-6xl h-screen overflow-y-auto no-scrollbar">

        {/* ── Video player ── */}
        <div
          className="relative w-full bg-black overflow-hidden cursor-pointer"
          style={{ height: '220px' }}
          onClick={handleVideoTap}
        >
          {/* Native video element */}
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnail}
            preload="metadata"
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <svg className="animate-spin w-10 h-10" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* Big play button when paused */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[56px] h-[56px] rounded-full bg-[rgba(201,17,95,0.9)] flex items-center justify-center shadow-lg" style={{ boxShadow: '0 8px 32px rgba(201,17,95,0.5)' }}>
                <Play size={24} fill="white" color="white" className="ml-1" />
              </div>
            </div>
          )}

          {/* Top labels — always visible */}

          <div className="absolute top-3 right-3 bg-[rgba(0,0,0,0.5)] rounded-[6px] px-2 py-[2px] pointer-events-none">
            <span className="text-white text-[11px]">{formatTime(effectiveDuration)}</span>
          </div>

          {/* Controls overlay — fades in/out */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300"
            style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }}
          >
            {/* Back button */}
            <button
              onClick={e => { e.stopPropagation(); router.back(); }}
              className="absolute top-3 left-3 w-[32px] h-[32px] rounded-full bg-[rgba(0,0,0,0.4)] flex items-center justify-center"
            >
              <ChevronLeft size={18} color="white" />
            </button>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3" onClick={e => e.stopPropagation()}>
              {/* Seek bar */}
              <div
                className="w-full h-[3px] bg-[rgba(255,255,255,0.3)] rounded-full mb-2 cursor-pointer relative"
                onClick={handleSeek}
              >
                <div className="h-full bg-[#c9115f] rounded-full transition-[width] duration-100" style={{ width: `${progressPct}%` }} />
                <div className="absolute top-[-4px] w-[11px] h-[11px] rounded-full bg-[#c9115f] -translate-x-1/2" style={{ left: `${progressPct}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => skip(-10)}><SkipBack size={18} color="white" /></button>
                  <button
                    onClick={togglePlay}
                    className="w-[32px] h-[32px] rounded-full bg-[#c9115f] flex items-center justify-center"
                  >
                    {isPlaying
                      ? <Pause size={14} fill="white" color="white" />
                      : <Play size={14} fill="white" color="white" className="ml-0.5" />}
                  </button>
                  <button onClick={() => skip(10)}><SkipForward size={18} color="white" /></button>
                  <span className="text-white text-[11px]">{formatTime(currentTime)} / {formatTime(effectiveDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMuted(m => !m)}>
                    {isMuted ? <VolumeX size={16} color="white" /> : <Volume2 size={16} color="white" />}
                  </button>
                  <Maximize size={16} color="white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content below video ── */}
        <div className="px-5 pt-4 pb-24">

          {/* Tags row */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="bg-[rgba(201,17,95,0.15)] border border-[rgba(201,17,95,0.3)] text-[#c9115f] text-[10px] font-bold px-2 py-[3px] rounded-full">VIDEO</span>
            <span className="bg-[rgba(255,255,255,0.05)] text-[#99a1af] text-[10px] px-2 py-[3px] rounded-full">{video.category}</span>
            <span className="text-[#99a1af] text-[10px] px-2 py-[3px]">{video.episode}</span>
          </div>

          {/* Title + meta */}
          <h1 className="text-white font-bold text-[20px] leading-tight tracking-[-0.3px] mb-1">{video.title}</h1>
          <p className="text-[#99a1af] text-[13px] mb-4">{video.metaLine}</p>

          {/* Reactions + actions row */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <button
              onClick={() => { setLiked(l => { setLikeCount(c => l ? c - 1 : c + 1); return !l; }); if (disliked) { setDisliked(false); setDislikeCount(c => c - 1); } }}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95"
              style={{ background: liked ? 'rgba(201,17,95,0.2)' : 'rgba(255,255,255,0.05)', border: liked ? '1px solid rgba(201,17,95,0.5)' : '1px solid rgba(255,255,255,0.1)' }}
            >
              <ThumbsUp size={15} color={liked ? '#c9115f' : '#99a1af'} fill={liked ? '#c9115f' : 'none'} />
              <span className="text-[12px]" style={{ color: liked ? '#c9115f' : '#99a1af' }}>{likeCount.toLocaleString()}</span>
            </button>
            <button
              onClick={() => { setDisliked(d => { setDislikeCount(c => d ? c - 1 : c + 1); return !d; }); if (liked) { setLiked(false); setLikeCount(c => c - 1); } }}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95"
              style={{ background: disliked ? 'rgba(255,89,0,0.15)' : 'rgba(255,255,255,0.05)', border: disliked ? '1px solid rgba(255,89,0,0.4)' : '1px solid rgba(255,255,255,0.1)' }}
            >
              <ThumbsDown size={15} color={disliked ? '#ff5900' : '#99a1af'} fill={disliked ? '#ff5900' : 'none'} />
              <span className="text-[12px]" style={{ color: disliked ? '#ff5900' : '#99a1af' }}>{dislikeCount}</span>
            </button>
            <button className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2">
              <MessageCircle size={15} color="#99a1af" />
              <span className="text-[#99a1af] text-[12px]">{video.commentCount}</span>
            </button>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setIsSaved(s => !s)}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors"
                style={{ background: isSaved ? 'rgba(201,17,95,0.15)' : 'rgba(255,255,255,0.05)', border: isSaved ? '1px solid rgba(201,17,95,0.3)' : '1px solid rgba(255,255,255,0.1)' }}
              >
                <BookmarkPlus size={15} color={isSaved ? '#c9115f' : '#99a1af'} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowKebab(k => !k)}
                  className="flex items-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-2 active:scale-95"
                >
                  <MoreVertical size={15} color="#99a1af" />
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
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-4 mb-5">
            <p className="text-[#99a1af] text-[14px] leading-[22px] tracking-[-0.15px]">{video.description}</p>
          </div>

          {/* Chapters */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-[15px]">Chapters</h2>
              <span className="text-[#99a1af] text-[10px]">{video.chapters.length} chapters</span>
            </div>
            {video.chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => jumpToChapter(ch.timestamp)}
                className="w-full flex items-center gap-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-3 py-3 mb-2 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(201,17,95,0.3)] transition-colors"
              >
                <span className="bg-[rgba(255,89,0,0.2)] text-white text-[10px] font-bold px-2 py-[3px] rounded-[8px] flex-none">{ch.timestamp}</span>
                <span className="text-[#d1d5dc] text-[13px] font-semibold text-left">{ch.label}</span>
              </button>
            ))}
          </div>

          {/* Related Videos */}
          {video.relatedVideos.length > 0 && (
            <>
              <h2 className="text-white font-bold text-[15px] mb-3">More Videos</h2>
              <div className="flex flex-col gap-3">
                {video.relatedVideos.map((v, i) => (
                  <button
                    key={i}
                    // onClick={() => router.push(v.path)}
                     onClick={() => router.push(`/MainModules/AtheleteMedia/VideoScreen/${v.path.split('/').pop()}`)}
                    className="flex gap-3 items-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-3 text-left hover:border-[rgba(201,17,95,0.3)] transition-all active:scale-[0.98]"
                  >
                    {/* Thumbnail */}
                    <div className="flex-none w-[72px] h-[52px] rounded-[10px] overflow-hidden bg-[#111118]">
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#f5f5f7] text-[12px] font-medium leading-tight mb-1 line-clamp-2">{v.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[#c9115f] text-[9px] font-bold">{v.tag}</span>
                        <span className="text-[#6a7282] text-[9px]">·</span>
                        <Clock size={9} color="#6a7282" />
                        <span className="text-[#6a7282] text-[9px]">{v.duration}</span>
                      </div>
                    </div>
                    <div className="flex-none w-[24px] h-[24px] rounded-full bg-[rgba(201,17,95,0.15)] border border-[rgba(201,17,95,0.3)] flex items-center justify-center">
                      <Play size={9} fill="#c9115f" color="#c9115f" className="ml-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
