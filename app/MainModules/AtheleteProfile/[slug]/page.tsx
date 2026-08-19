// MainModules\AtheleteProfile\[slug]\page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, SlidersHorizontal, Trophy, Medal, TrendingUp, ChevronDown, Target, ArrowRight, Zap, Award, Star, TrendingUp as TrendingUpIcon, UserPlus, Bell, Share2, Play, FileText, Headphones, Eye } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Area, AreaChart } from 'recharts';
import { ImageWithFallback } from '@/src/components/CommonComponent/ImageWithFallback';
import { athleteService } from '@/services/athlete.service';


// Map drop type string → Lucide icon component (Firestore can't store React components)
const dropIconMap: Record<string, any> = {
    Video: Play,
    Audio: Headphones,
    Article: FileText,
};

// Resolve icon component for a drop item coming from the API
function resolveDropIcon(drop: any) {
    return dropIconMap[drop.type] ?? FileText;
}

/**
 * Derive chart axis formatters from the athlete's sport string.
 * These are pure frontend concerns — Firestore cannot store functions.
 */
function getChartFormatters(sport: string = '') {
    const s = sport.toLowerCase();

    // Sprints & throws where lower time = better (sprint)
    if (s.includes('sprint') || s.includes('100m') || s.includes('200m') || s.includes('400m')) {
        return {
            yAxisDomain: ['auto', 'auto'] as [any, any],
            yTickFormatter: (v: number) => `${v.toFixed(2)}s`,
        };
    }

    // Steeplechase / long distance in seconds
    if (s.includes('steeplechase') || s.includes('3000') || s.includes('5000') || s.includes('10000')) {
        return {
            yAxisDomain: ['auto', 'auto'] as [any, any],
            yTickFormatter: (v: number) => {
                const m = Math.floor(v / 60);
                const sec = Math.floor(v % 60);
                return `${m}:${String(sec).padStart(2, '0')}`;
            },
        };
    }

    // Field events: javelin, shot put, discus, hammer, long jump, etc. (distance in metres)
    if (
        s.includes('javelin') || s.includes('shot') || s.includes('discus') ||
        s.includes('hammer') || s.includes('long jump') || s.includes('triple') ||
        s.includes('high jump') || s.includes('pole vault')
    ) {
        return {
            yAxisDomain: ['auto', 'auto'] as [any, any],
            yTickFormatter: (v: number) => `${v}m`,
        };
    }

    // Default: plain number
    return {
        yAxisDomain: ['auto', 'auto'] as [any, any],
        yTickFormatter: (v: number) => String(v),
    };
}


export default function AthleteProfile() {
    const router = useRouter();
    const { slug: slugParam } = useParams<{ slug: string }>();
    const slug = slugParam || 'neeraj-chopra';

    // ── API state — all data comes exclusively from the backend ──────────────────
    const [athlete, setAthlete] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.all([
            athleteService.getBySlug(slug),
            athleteService.getPosts(slug),
            athleteService.getVideos(slug),
            athleteService.getDrops(slug),
            athleteService.getHighlights(slug),
        ])
            .then(([profile, posts, videos, drops, highlights]) => {
                if (cancelled) return;
                if (!profile) {
                    setError('Athlete not found.');
                    return;
                }

                // Resolve drop icons — Firestore stores type as string, we map to Lucide component
                const resolvedDrops = (drops || []).map((d: any) => ({
                    ...d,
                    icon: resolveDropIcon(d),
                }));

                // Derive chart formatters from the sport string coming from the backend
                const { yAxisDomain, yTickFormatter } = getChartFormatters(profile.sport);

                setAthlete({
                    ...profile,
                    postsContent: posts || [],
                    videosContent: videos || [],
                    dropsContent: resolvedDrops,
                    highlights: highlights || [],
                    // Attach derived chart formatters
                    yAxisDomain,
                    yTickFormatter,
                });
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Failed to load athlete data:', err);
                setError('Failed to load athlete data. Please try again.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [slug]);

    const [currentScreen, setCurrentScreen] = useState<'profile' | 'stats'>('profile');
    const [activeView, setActiveView] = useState(0);
    const [yearFilter, setYearFilter] = useState('All Years');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(2847300);
    const [activeContentTab, setActiveContentTab] = useState<'drops' | 'posts' | 'videos'>('drops');
    const [competitionFilter, setCompetitionFilter] = useState('All Competitions');
    const [timelineYear, setTimelineYear] = useState(2020);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showCompDropdown, setShowCompDropdown] = useState(false);
    const [consistencyMode, setConsistencyMode] = useState('current');
    const scrollRef = useRef<HTMLDivElement>(null);

    const views = ['Seasonal Performance', 'Tournament Performance', 'Medal Analysis', 'Consistency'];

    const getMedalColor = (medal: string | null) => {
        if (!medal) return '#1a1a1a';
        if (medal === 'gold') return '#c9115f';
        if (medal === 'silver') return '#C0C0C0';
        if (medal === 'bronze') return '#cd620e';
        return '#1a1a1a';
    };

    const getMedalGlow = (medal: string | null) => {
        if (!medal) return '';
        if (medal === 'gold') return '0 0 20px rgba(201, 17, 95, 0.5)';
        if (medal === 'silver') return '0 0 15px rgba(192, 192, 192, 0.4)';
        if (medal === 'bronze') return '0 0 15px rgba(205, 98, 14, 0.4)';
        return '';
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const val = payload[0].value;
            const display = athlete.yTickFormatter ? athlete.yTickFormatter(val) : `${val}${athlete.unit}`;
            return (
                <div className="bg-[#1a1a1a] border border-[#2a2a35] rounded-xl px-4 py-3 shadow-xl backdrop-blur-sm">
                    <div className="text-[#c9115f] text-lg font-semibold">{display}</div>
                    <div className="text-gray-400 text-sm mt-1">{payload[0].payload.event}</div>
                    <div className="text-gray-500 text-xs mt-0.5">Rank #{payload[0].payload.rank}</div>
                </div>
            );
        }
        return null;
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const viewWidth = scrollRef.current.offsetWidth;
            setActiveView(Math.round(scrollLeft / viewWidth));
        }
    };

    const scrollToView = (index: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ left: index * scrollRef.current.offsetWidth, behavior: 'smooth' });
            setActiveView(index);
        }
    };

    useEffect(() => {
        const handleClickOutside = () => {
            setShowYearDropdown(false);
            setShowCompDropdown(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const HighlightIcon = ({ icon, color }: { icon: string; color: string }) => {
        const props = { className: `w-12 h-12`, style: { color } };
        if (icon === 'trophy') return <Trophy {...props} />;
        if (icon === 'star') return <Star {...props} />;
        if (icon === 'medal') return <Medal {...props} />;
        return <Award {...props} />;
    };

    const formatFollowers = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toString();
    };

    const handleFollow = () => {
        setIsFollowing(f => !f);
        setFollowerCount(c => isFollowing ? c - 1 : c + 1);
    };

    // ── Loading skeleton ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="h-screen bg-[#0B0B0F] flex justify-center">
                <div className="w-full max-w-6xl bg-[#0B0B0F] h-screen flex flex-col">
                    <div className="bg-[#0B0B0F]/95 backdrop-blur-md border-b border-[#1a1a20] px-4 py-4 flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-[#15151C] animate-pulse" />
                        <div className="w-32 h-5 rounded-full bg-[#15151C] animate-pulse" />
                        <div className="w-10 h-10 rounded-full bg-[#15151C] animate-pulse" />
                    </div>
                    <div className="h-80 bg-[#15151C] animate-pulse" />
                    <div className="flex-1 p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-[#15151C] rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error screen — shown when backend call fails and we have no data at all
    if (!athlete) {
        return (
            <div className="h-screen bg-[#0B0B0F] flex justify-center">
                <div className="w-full max-w-6xl bg-[#0B0B0F] h-screen flex flex-col items-center justify-center gap-4 px-8">
                    <div className="w-16 h-16 rounded-full bg-[#c9115f]/10 border border-[#c9115f]/30 flex items-center justify-center">
                        <Trophy className="w-7 h-7 text-[#c9115f]" />
                    </div>
                    <p className="text-white font-semibold text-center">Could not load athlete</p>
                    <p className="text-gray-500 text-sm text-center">{error ?? 'Athlete not found.'}</p>
                    <button
                        onClick={() => router.push('/MainModules/AtheleteHome')}
                        className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(102deg, #ff1379 0%, #ff6a3d 100%)' }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (currentScreen === 'profile') {
        return (
            <div className="h-screen bg-[#0B0B0F] flex justify-center">
                <div className="w-full max-w-6xl  bg-[#0B0B0F] h-screen flex flex-col">
                    {/* Header */}
                    <div className="bg-[#0B0B0F]/95 backdrop-blur-md border-b border-[#1a1a20] sticky top-0 z-50">
                        <div className="px-4 py-4 flex items-center justify-between">
                            <button
                                onClick={() => router.push('/MainModules/AtheleteHome')}
                                className="w-10 h-10 rounded-full bg-[#15151C] flex items-center justify-center hover:bg-[#1a1a20] transition-all active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <h1 className="text-xl text-white font-semibold">Athlete Profile</h1>
                            <button className="w-10 h-10 rounded-full bg-[#15151C] flex items-center justify-center hover:bg-[#1a1a20] transition-all active:scale-95">
                                <Share2 className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pb-8 ">

                        {/* Hero */}
                        <div className="relative h-80 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0F]/60 to-[#0B0B0F] z-10"></div>
                            <ImageWithFallback src={athlete.image} alt={athlete.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-3xl">{athlete.flag}</span>
                                    <span className="text-xs bg-[#c9115f]/20 text-[#c9115f] px-2 py-1 rounded-full">Athletics</span>
                                </div>
                                <h2 className="text-white font-bold mb-1">{athlete.name}</h2>
                                <p className="text-gray-300 text-sm">{athlete.achievementLabel} • {athlete.sport}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                    <span>Age: {athlete.age}</span>
                                    <span>•</span>
                                    <span>{athlete.country}</span>
                                </div>
                            </div>
                        </div>

                        {/* Error banner (shown when API fails but static fallback is in use) */}
                        {error && (
                            <div className="mx-4 mt-3 px-4 py-2 bg-[#c9115f]/10 border border-[#c9115f]/30 rounded-xl text-xs text-[#c9115f] text-center">
                                {error}
                            </div>
                        )}

                        {/* Follow Bar */}
                        <div className="px-4 py-3 flex items-center gap-3 border-b border-[#1a1a1a]">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <span className="text-white font-bold text-base">{formatFollowers(followerCount)}</span>
                                        <span>Followers</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-white font-bold text-base">248</span>
                                        <span>Following</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-white font-bold text-base">94</span>
                                        <span>Drops</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleFollow}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95"
                                style={isFollowing ? {
                                    background: 'transparent',
                                    border: '1px solid rgba(201,17,95,0.5)',
                                    color: '#c9115f',
                                } : {
                                    background: 'linear-gradient(102deg, #ff1379 0%, #ff6a3d 100%)',
                                    color: 'white',
                                    boxShadow: '0 4px 16px rgba(255,19,121,0.4)',
                                }}
                            >
                                {isFollowing ? (
                                    <>
                                        <Bell className="w-4 h-4" />
                                        Following
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Follow
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Drops / Posts / Videos Tabs */}
                        <div className="px-4 pt-3 pb-1">
                            <div className="flex gap-2">
                                {(['drops', 'posts', 'videos'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveContentTab(tab)}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                                        style={activeContentTab === tab ? {
                                            background: 'linear-gradient(102deg, #ff1379 0%, #ff6a3d 100%)',
                                            color: 'white',
                                        } : {
                                            background: 'rgba(21,21,21,0.6)',
                                            color: '#888',
                                        }}
                                    >
                                        {tab === 'drops' && <Zap className="w-3 h-3" />}
                                        {tab === 'posts' && <FileText className="w-3 h-3" />}
                                        {tab === 'videos' && <Play className="w-3 h-3" />}
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="px-4 py-3">
                            {activeContentTab === 'drops' && (
                                <div className="space-y-3">

                                    {(athlete.dropsContent || []).map((drop: any, i: number) => {
                                        const Icon = drop.icon;
                                        const getDropPath = () => {
                                            // If path starts with /video/ or /audio/, map it correctly
                                            if (drop.path.includes('/video/')) {
                                                const slug = drop.path.split('/video/')[1];
                                                return `/MainModules/AtheleteMedia/VideoScreen/${slug}`;
                                            }
                                            if (drop.path.includes('/audio/')) {
                                                const id = drop.path.split('/audio/')[1];
                                                return `/MainModules/AtheleteMedia/AudioPlayerScreen/${id}`;
                                            }
                                            // Fallback
                                            return drop.path;
                                        };

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => router.push(getDropPath())}
                                                className="flex items-center gap-3 bg-[#15151C] rounded-xl p-3 border border-[#1a1a1a] cursor-pointer hover:brightness-110 transition-all active:scale-[0.98]"
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                    style={{ background: `${drop.color}20` }}
                                                >
                                                    <Icon
                                                        className="w-4 h-4"
                                                        style={{ color: drop.color }}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-[13px] font-semibold truncate">
                                                        {drop.title}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span
                                                            className="text-[10px] px-2 py-[1px] rounded-full font-medium"
                                                            style={{
                                                                color: drop.color,
                                                                background: `${drop.color}20`,
                                                            }}
                                                        >
                                                            {drop.type}
                                                        </span>

                                                        <span className="text-[#888] text-[11px]">
                                                            {drop.meta}
                                                        </span>

                                                        <span className="text-[#888] text-[11px]">·</span>

                                                        <Eye className="w-3 h-3 text-[#888]" />

                                                        <span className="text-[#888] text-[11px]">
                                                            {drop.views}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="text-[#555] text-[11px] shrink-0">
                                                    {drop.date}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeContentTab === 'posts' && (
                                <div className="space-y-3">
                                    {(athlete.postsContent || []).map((post: any, i: number) => (
                                        <div
                                            key={i}
                                            className="bg-[#15151C] rounded-xl p-4 border border-[#1a1a1a] hover:brightness-110 transition-all"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                                                    <ImageWithFallback
                                                        src={athlete.image}
                                                        alt={athlete.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-[13px] font-semibold truncate">
                                                        {athlete.name}
                                                    </p>

                                                    <p className="text-[#888] text-[11px]">
                                                        {post.time}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-[#d1d5dc] text-[13px] leading-relaxed mb-3">
                                                {post.text}
                                            </p>

                                            {post.image && (
                                                <div className="rounded-xl overflow-hidden mb-3">
                                                    <ImageWithFallback
                                                        src={post.image}
                                                        alt={post.text}
                                                        className="w-full h-[180px] object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-[#888] text-[12px]">
                                                <span>❤️ {post.likes}</span>
                                                <span>💬 {post.comments}</span>

                                                {post.shares && (
                                                    <span>🔄 {post.shares}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* {activeContentTab === 'videos' && (
              <div className="grid grid-cols-2 gap-3">
                {videosContent.map((video, i) => (
                  <div key={i} className="bg-[#15151C] rounded-xl overflow-hidden border border-[#1a1a1a] cursor-pointer active:scale-95 transition-all">
                    <div className="relative h-[80px]">
                      <ImageWithFallback src={video.thumb} alt={video.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#c9115f]/90 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-[1px] rounded">{video.duration}</span>
                    </div>
                    <div className="p-2">
                      <p className="text-white text-[11px] font-semibold line-clamp-2 leading-tight">{video.title}</p>
                      <p className="text-[#888] text-[10px] mt-1">{video.views} views</p>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
                        </div>

                        {/* Quick Stats */}
                        <div className="px-4 py-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#15151C] rounded-2xl p-4 border border-[#1a1a1a]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Trophy className="w-4 h-4 text-[#c9115f]" />
                                        <span className="text-xs text-gray-400">Olympic Gold</span>
                                    </div>
                                    <div className="text-white font-bold">{athlete.stats.olympicGold}</div>
                                </div>
                                <div className="bg-[#15151C] rounded-2xl p-4 border border-[#1a1a1a]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-4 h-4 text-[#c9115f]" />
                                        <span className="text-xs text-gray-400">Personal Best</span>
                                    </div>
                                    <div className="text-white font-bold">{athlete.stats.personalBest}</div>
                                </div>
                                <div className="bg-[#15151C] rounded-2xl p-4 border border-[#1a1a1a]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="w-4 h-4 text-[#c9115f]" />
                                        <span className="text-xs text-gray-400">World Rank</span>
                                    </div>
                                    <div className="text-white font-bold">{athlete.stats.worldRank}</div>
                                </div>
                                <div className="bg-[#15151C] rounded-2xl p-4 border border-[#1a1a1a]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-4 h-4 text-[#c9115f]" />
                                        <span className="text-xs text-gray-400">Best Year</span>
                                    </div>
                                    <div className="text-white font-bold">{athlete.stats.bestYear}</div>
                                </div>
                            </div>

                            <div className="bg-[#15151C] rounded-2xl p-4 border border-[#1a1a1a] mt-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Medal className="w-4 h-4 text-[#c9115f]" />
                                    <span className="text-xs text-gray-400">Total Medals</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-[#c9115f]"></div>
                                        <span className="text-white font-semibold text-sm">{athlete.stats.totalGold}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-[#C0C0C0]"></div>
                                        <span className="text-white font-semibold text-sm">{athlete.stats.totalSilver}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-[#cd620e]"></div>
                                        <span className="text-white font-semibold text-sm">{athlete.stats.totalBronze}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Career Highlights */}
                        <div className="px-4 py-2">
                            <h3 className="text-white font-semibold mb-3 text-sm">Career Highlights</h3>
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                                {athlete.highlights.map((h: any, i: number) => (
                                    <div key={i} className="min-w-[140px] bg-[#15151C] rounded-2xl overflow-hidden border border-[#1a1a1a] cursor-pointer hover:scale-105 transition-transform">
                                        <div className="h-32 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${h.color}20, ${h.color}08)` }}>
                                            <HighlightIcon icon={h.icon} color={h.color} />
                                        </div>
                                        <div className="p-3">
                                            <div className="text-white text-xs font-semibold">{h.title}</div>
                                            <div className="text-gray-400 text-xs mt-0.5">{h.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance Snapshot */}
                        <div className="px-4 py-4">
                            <div className="bg-[#15151C] rounded-2xl p-4 border border-[#1a1a1a]">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">Performance Trend</h3>
                                        <p className="text-gray-400 text-xs mt-0.5">Last 8 competitions</p>
                                    </div>
                                    <TrendingUpIcon className="w-5 h-5 text-[#4ade80]" />
                                </div>
                                <div className="h-24 min-h-[96px]">
                                    <ResponsiveContainer width="100%" height={96}>
                                        <AreaChart data={athlete.seasonalData.slice(-8)}>
                                            <defs>
                                                <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#c9115f" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#c9115f" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="value" stroke="#c9115f" strokeWidth={2} fill="url(#profileGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="px-4 pb-6 pt-2">
                            <button
                                onClick={() => setCurrentScreen('stats')}
                                className="w-full bg-gradient-to-r from-[#c9115f] to-[#cd620e] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-[#c9115f]/20"
                            >
                                Explore Performance Insights
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0B0B0F] flex justify-center">

            <div className="w-full max-w-6xl  bg-[#0B0B0F] h-screen flex flex-col">
                {/* Stats Header */}
                <div className="bg-[#0B0B0F]/95 backdrop-blur-md border-b border-[#1a1a1a] sticky top-0 z-50">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentScreen('profile')}
                            className="w-10 h-10 rounded-full bg-[#15151C] flex items-center justify-center hover:bg-[#1a1a20] transition-all active:scale-95"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <h1 className="text-xl text-white font-semibold">{athlete.name}</h1>
                        <button className="w-10 h-10 rounded-full bg-[#15151C] flex items-center justify-center hover:bg-[#1a1a20] transition-all active:scale-95">
                            <SlidersHorizontal className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="px-4 pb-3 flex gap-2">
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowYearDropdown(!showYearDropdown); setShowCompDropdown(false); }}
                                className="bg-[#15151C] px-4 py-2 rounded-full text-sm text-gray-300 flex items-center gap-2 hover:bg-[#1a1a20] transition-all"
                            >
                                {yearFilter}
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {showYearDropdown && (
                                <div className="absolute top-full mt-2 bg-[#15151C] border border-[#2a2a35] rounded-xl shadow-xl overflow-hidden z-50 min-w-[140px]">
                                    {['All Years', '2024', '2023', '2022', '2021', '2020'].map((year) => (
                                        <button
                                            key={year}
                                            onClick={(e) => { e.stopPropagation(); setYearFilter(year); setShowYearDropdown(false); }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#1a1a20] transition-all"
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowCompDropdown(!showCompDropdown); setShowYearDropdown(false); }}
                                className="bg-[#15151C] px-4 py-2 rounded-full text-sm text-gray-300 flex items-center gap-2 hover:bg-[#1a1a20] transition-all"
                            >
                                {competitionFilter}
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {showCompDropdown && (
                                <div className="absolute top-full mt-2 bg-[#15151C] border border-[#2a2a35] rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px]">
                                    {['All Competitions', 'Olympics', 'World Championships', 'Diamond League', 'Asian Games'].map((comp) => (
                                        <button
                                            key={comp}
                                            onClick={(e) => { e.stopPropagation(); setCompetitionFilter(comp); setShowCompDropdown(false); }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#1a1a20] transition-all"
                                        >
                                            {comp}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto pb-8 no-scrollbar">


                    {/* Hero Stat */}
                    <div className="p-4">
                        <div className="bg-gradient-to-br from-[#15151C] via-[#15151C] to-[#1a1a25] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c9115f]/10 to-transparent rounded-full blur-3xl"></div>
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <div className="text-xs text-gray-500 tracking-wider mb-2 uppercase">{athlete.heroLabel}</div>
                                    <div className="text-5xl text-white font-bold tracking-tight mb-1">{athlete.heroStat}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Trophy className="w-4 h-4 text-[#c9115f]" />
                                        <span className="text-xs text-gray-400">{athlete.sport}</span>
                                    </div>
                                </div>
                                <div className="w-28 h-20">
                                    <ResponsiveContainer width="100%" height={80}>
                                        <AreaChart data={athlete.seasonalData.slice(-8)}>
                                            <defs>
                                                <linearGradient id="heroSparkGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#c9115f" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#c9115f" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="value" stroke="#c9115f" strokeWidth={2} fill="url(#heroSparkGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Swipeable Nav */}
                    <div className="px-4 pb-4">
                        <div className="flex gap-3 mb-3 overflow-x-auto scrollbar-hide">
                            {views.map((view, index) => (
                                <button
                                    key={view}
                                    onClick={() => scrollToView(index)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${activeView === index ? 'bg-[#c9115f] text-white' : 'text-gray-400 bg-[#15151C] hover:text-white'}`}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {views.map((_, index) => (
                                <div
                                    key={`ind-${index}`}
                                    className={`h-1 rounded-full transition-all duration-300 ${activeView === index ? 'flex-[2] bg-[#c9115f]' : 'flex-1 bg-[#2a2a35]'}`}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Swipeable Views */}
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {/* View 1: Seasonal */}
                        <div className="min-w-full snap-start px-4">
                            <div className="bg-[#15151C] rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-base text-white font-semibold">Performance Timeline</h3>
                                    <TrendingUp className="w-5 h-5 text-[#c9115f]" />
                                </div>
                                <div className="h-64 min-h-[256px]">
                                    <ResponsiveContainer width="100%" height={256}>
                                        <LineChart data={athlete.seasonalData}>
                                            <defs>
                                                <filter id="seasonalGlow">
                                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                                </filter>
                                            </defs>
                                            <XAxis dataKey="year" stroke="#4a4a55" style={{ fontSize: '12px' }} />
                                            <YAxis domain={athlete.yAxisDomain} stroke="#4a4a55" style={{ fontSize: '12px' }} tickFormatter={athlete.yTickFormatter} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#c9115f"
                                                strokeWidth={3}
                                                dot={(props: any) => {
                                                    const { cx, cy, payload } = props;
                                                    return (
                                                        <circle
                                                            key={`dot-${payload.year}`}
                                                            cx={cx} cy={cy}
                                                            r={payload.glow ? 8 : payload.highlight ? 6 : 4}
                                                            fill={payload.glow ? '#c9115f' : payload.highlight ? '#c9115f' : '#6a6a75'}
                                                            stroke={payload.glow || payload.highlight ? '#000' : 'none'}
                                                            strokeWidth={2}
                                                            filter={payload.glow ? 'url(#seasonalGlow)' : 'none'}
                                                        />
                                                    );
                                                }}
                                                activeDot={{ r: 8, fill: '#c9115f', stroke: '#000', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* View 2: Tournament Heatmap */}
                        <div className="min-w-full snap-start px-4">
                            <div className="bg-[#15151C] rounded-2xl p-5 shadow-xl">
                                <h3 className="text-base text-white font-semibold mb-5">Medal Heatmap</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="w-28 text-xs text-gray-500"></div>
                                        {['2020', '2021', '2022', '2023', '2024', '2025'].map((year) => (
                                            <div key={`year-${year}`} className="flex-1 text-center text-xs text-gray-500">{year}</div>
                                        ))}
                                    </div>
                                    {athlete.heatmapData.map((row: any) => (
                                        <div key={row.tournament} className="flex gap-2 items-center">
                                            <div className="w-28 text-xs text-gray-400">{row.tournament}</div>
                                            {Object.entries(row.years).map(([year, medal]: [string, any]) => (
                                                <div
                                                    key={`${row.tournament}-${year}`}
                                                    className="flex-1 h-10 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                                                    style={{ backgroundColor: getMedalColor(medal), boxShadow: getMedalGlow(medal) }}
                                                ></div>
                                            ))}
                                        </div>
                                    ))}
                                    <div className="flex gap-4 pt-3 text-xs text-gray-500 justify-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#c9115f', boxShadow: '0 0 10px rgba(201,17,95,0.4)' }}></div>
                                            <span>Gold</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#C0C0C0' }}></div>
                                            <span>Silver</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#cd620e' }}></div>
                                            <span>Bronze</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* View 3: Medal Distribution */}
                        <div className="min-w-full snap-start px-4">
                            <div className="bg-[#15151C] rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-base text-white font-semibold">Medal Distribution</h3>
                                    <Medal className="w-5 h-5 text-[#c9115f]" />
                                </div>
                                <div className="h-64 min-h-[256px]">
                                    <ResponsiveContainer width="100%" height={256}>
                                        <BarChart data={athlete.medalData}>
                                            <XAxis dataKey="year" stroke="#4a4a55" style={{ fontSize: '12px' }} />
                                            <YAxis stroke="#4a4a55" style={{ fontSize: '12px' }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a35', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} />
                                            <Bar dataKey="gold" stackId="a" fill="#c9115f" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="silver" stackId="a" fill="#C0C0C0" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="bronze" stackId="a" fill="#cd620e" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* View 4: Consistency */}
                        <div className="min-w-full snap-start px-4">
                            <div className="bg-[#15151C] rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-base text-white font-semibold">Performance Metrics</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setConsistencyMode('current')}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${consistencyMode === 'current' ? 'bg-[#c9115f] text-white' : 'bg-[#1a1a1a] text-gray-400'}`}
                                        >
                                            Current Year
                                        </button>
                                        <button
                                            onClick={() => setConsistencyMode('career')}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${consistencyMode === 'career' ? 'bg-[#c9115f] text-white' : 'bg-[#1a1a1a] text-gray-400'}`}
                                        >
                                            Career
                                        </button>
                                    </div>
                                </div>
                                <div className="h-64 min-h-[256px]">
                                    <ResponsiveContainer width="100%" height={256}>
                                        <RadarChart data={athlete.radarData}>
                                            <PolarGrid stroke="#2a2a35" />
                                            <PolarAngleAxis dataKey="metric" stroke="#6a6a75" style={{ fontSize: '11px' }} />
                                            <Radar name="Performance" dataKey="value" stroke="#c9115f" fill="#c9115f" fillOpacity={0.3} strokeWidth={2} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coach Impact */}
                    <div className="px-4 mt-4">
                        <div className="bg-[#15151C] rounded-2xl p-5 shadow-xl">
                            <h3 className="text-base text-white font-semibold mb-5">Coach Impact Analysis</h3>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-2">Before Coach</div>
                                    <div className="bg-[#1a1a1a] rounded-xl h-16 flex items-center justify-center">
                                        <span className="text-2xl text-white font-semibold">{athlete.beforeCoach}</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9115f] to-[#cd620e] flex items-center justify-center shadow-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-2">After Coach</div>
                                    <div className="bg-gradient-to-r from-[#c9115f]/20 to-[#c9115f]/10 border border-[#c9115f]/30 rounded-xl h-16 flex items-center justify-center">
                                        <span className="text-2xl text-white font-semibold">{athlete.afterCoach}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-32 mb-4 min-h-[128px]">
                                <ResponsiveContainer width="100%" height={128}>
                                    <LineChart data={athlete.coachImpactData}>
                                        <XAxis dataKey="year" stroke="#4a4a55" style={{ fontSize: '10px' }} />
                                        <YAxis stroke="#4a4a55" style={{ fontSize: '10px' }} domain={athlete.yAxisDomain} tickFormatter={athlete.yTickFormatter} />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#c9115f"
                                            strokeWidth={2}
                                            dot={(props: any) => {
                                                const { cx, cy, payload, index } = props;
                                                const color = payload.period === 'before' ? '#6a6a75' : '#c9115f';
                                                return <circle key={`coach-dot-${index}`} cx={cx} cy={cy} r={3} fill={color} />;
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-[#1a1a1a] rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-gray-400">Coach joined: {athlete.coachJoinYear}</span>
                                    <span className="text-sm text-[#c9115f] font-semibold">{athlete.coachImprovement}</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="2017"
                                        max="2024"
                                        value={timelineYear}
                                        onChange={(e) => setTimelineYear(Number(e.target.value))}
                                        className="w-full h-2 bg-[#2a2a35] rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>2017</span>
                                        <span className="text-[#c9115f]">{athlete.coachJoinYear}</span>
                                        <span>2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Range */}
                    <div className="px-4 mt-4 pb-6">
                        <div className="bg-[#15151C] rounded-2xl p-5 shadow-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-base text-white font-semibold">
                                    {athlete.sport === '3000m Steeplechase' ? 'Race Time Range' : 'Throw Consistency Range'}
                                </h3>
                                <Target className="w-5 h-5 text-[#c9115f]" />
                            </div>
                            <p className="text-xs text-gray-400 mb-5">{athlete.consistencyNote}</p>
                            <div className="h-56 min-h-[224px]">
                                <ResponsiveContainer width="100%" height={224}>
                                    <BarChart data={athlete.consistencyData}>
                                        <XAxis dataKey="range" stroke="#4a4a55" style={{ fontSize: '10px' }} />
                                        <YAxis stroke="#4a4a55" style={{ fontSize: '10px' }} />
                                        <Tooltip
                                            content={({ active, payload }: any) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-[#1a1a20] border border-[#2a2a35] rounded-xl px-4 py-3 shadow-xl">
                                                            <div className="text-white font-semibold">{payload[0].payload.range}</div>
                                                            <div className="text-gray-400 text-sm mt-1">{payload[0].payload.throws} {athlete.consistencyBarLabel}</div>
                                                            <div className="text-[#c9115f] text-xs mt-0.5">{payload[0].payload.percentage}% of total</div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                            {athlete.consistencyData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.peak ? '#c9115f' : '#4a4a55'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 bg-gradient-to-r from-[#c9115f]/10 to-transparent border border-[#c9115f]/20 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#c9115f] animate-pulse"></div>
                                <div>
                                    <div className="text-xs text-gray-400">Peak Performance Zone</div>
                                    <div className="text-sm text-white font-medium">{athlete.peakZoneLabel}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
