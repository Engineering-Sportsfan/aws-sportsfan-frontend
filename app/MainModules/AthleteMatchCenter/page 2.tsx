'use client';

import { useState, useRef } from 'react';
import {
  ChevronLeft, Search, Bell, Play, Trophy, Zap, Star, TrendingUp, Filter,
  ChevronDown, ChevronRight, Award, Target, Activity, Clock, MapPin,
  BarChart2, Flame, BookmarkPlus, Share2, ArrowUp, X, Globe
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { useRouter } from 'next/navigation';

type Screen = 'home' | 'sport-records' | 'record-detail' | 'athlete-detail' | 'video-highlights' | 'medal-tally' | 'athlete-rankings' | 'event-schedule';

const SPORTS = ['All Events', 'Sprints', 'Hurdles', 'Throws', 'Jumps', 'Distance', 'Relay'];

const INDIA_MEDAL_TALLY = {
  gold: 22, silver: 16, bronze: 23, total: 61,
  rank: 3,
  byDiscipline: [
    { sport: 'Athletics', gold: 6, silver: 4, bronze: 5, icon: '🏃' },
    { sport: 'Wrestling', gold: 5, silver: 3, bronze: 4, icon: '🤼' },
    { sport: 'Boxing', gold: 4, silver: 3, bronze: 3, icon: '🥊' },
    { sport: 'Weightlifting', gold: 3, silver: 2, bronze: 4, icon: '🏋️' },
    { sport: 'Shooting', gold: 2, silver: 2, bronze: 3, icon: '🎯' },
    { sport: 'Badminton', gold: 1, silver: 1, bronze: 2, icon: '🏸' },
    { sport: 'Table Tennis', gold: 1, silver: 1, bronze: 1, icon: '🏓' },
    { sport: 'Lawn Bowls', gold: 0, silver: 0, bronze: 1, icon: '🎳' },
  ],
};

const ATHLETE_RANKINGS = [
  { rank: 1, name: 'Neeraj Chopra', sport: "Javelin Throw", country: 'India', flag: '🇮🇳', best: '88.13m', medal: '🥇', trend: 'up', image: 'https://images.unsplash.com/photo-1780642207268-44f94bccf510?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { rank: 2, name: 'Ferdinand Omanyala', sport: "100m Sprint", country: 'Kenya', flag: '🇰🇪', best: '9.85s', medal: '🥇', trend: 'up', image: 'https://images.unsplash.com/photo-1728060560980-e39712526b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { rank: 3, name: 'Karsten Warholm', sport: "400m Hurdles", country: 'Norway', flag: '🇳🇴', best: '46.92s', medal: '🥇', trend: 'stable', image: 'https://images.unsplash.com/photo-1763639700615-225fe7fdffff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { rank: 4, name: 'Ese Brume', sport: "Long Jump", country: 'Nigeria', flag: '🇳🇬', best: '7.17m', medal: '🥇', trend: 'up', image: 'https://images.unsplash.com/photo-1772475625553-038d9d7e600c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { rank: 5, name: 'Jake Wightman', sport: "1500m", country: 'Great Britain', flag: '🇬🇧', best: '3:29.23', medal: '🥇', trend: 'up', image: 'https://images.unsplash.com/photo-1758506971667-fbaa8942258a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { rank: 6, name: 'Tobi Amusan', sport: "100m Hurdles", country: 'Nigeria', flag: '🇳🇬', best: '12.40s', medal: '🥈', trend: 'stable', image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { rank: 7, name: 'Niklas Kaul', sport: "Decathlon", country: 'Germany', flag: '🇩🇪', best: '8691 pts', medal: '🥈', trend: 'down', image: 'https://images.unsplash.com/photo-1474546652694-a33dd8161d66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
  { rank: 8, name: 'Rohit Yadav', sport: "Javelin Throw", country: 'India', flag: '🇮🇳', best: '82.54m', medal: '🥉', trend: 'up', image: 'https://images.unsplash.com/photo-1780319679838-c705a32fc756?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200' },
];

const EVENT_SCHEDULE = [
  { id: 'e1', time: '09:00 AM', event: "Men's 100m Heats", venue: 'Hampden Park Stadium', sport: 'Sprints', status: 'live', athletes: ['Ferdinand Omanyala', 'Yupun Abeykoon', 'Ackeem Blake'], day: 'Today' },
  { id: 'e2', time: '10:30 AM', event: "Women's 400m Hurdles Final", venue: 'Hampden Park Stadium', sport: 'Hurdles', status: 'upcoming', athletes: ['Tobi Amusan', 'Femke Bol', 'Sydney McLaughlin'], day: 'Today' },
  { id: 'e3', time: '12:00 PM', event: "Men's Shot Put Final", venue: 'Hampden Park Stadium', sport: 'Throws', status: 'upcoming', athletes: ['Ryan Crouser', 'Joe Kovacs', 'Tom Walsh'], day: 'Today' },
  { id: 'e4', time: '02:00 PM', event: "Women's 1500m Final", venue: 'Hampden Park Stadium', sport: 'Distance', status: 'upcoming', athletes: ['Faith Kipyegon', 'Laura Muir', 'Freweyni Hailu'], day: 'Today' },
  { id: 'e5', time: '03:30 PM', event: "Men's High Jump Final", venue: 'Hampden Park Stadium', sport: 'Jumps', status: 'upcoming', athletes: ['Gianmarco Tamberi', 'Mutaz Essa Barshim', 'JuVaughn Harrison'], day: 'Today' },
  { id: 'e6', time: '05:00 PM', event: "Men's Javelin Throw Final", venue: 'Hampden Park Stadium', sport: 'Throws', status: 'upcoming', athletes: ['Neeraj Chopra', 'Anderson Peters', 'Julian Weber'], day: 'Today' },
  { id: 'e7', time: '07:00 PM', event: "Men's 4×400m Relay Final", venue: 'Hampden Park Stadium', sport: 'Relay', status: 'upcoming', athletes: ['Team USA', 'Team Jamaica', 'Team India'], day: 'Today' },
  { id: 'e8', time: '09:00 AM', event: "Women's 200m Heats", venue: 'Hampden Park Stadium', sport: 'Sprints', status: 'scheduled', athletes: ['Shericka Jackson', 'Dina Asher-Smith', 'Marie-Josée Ta Lou'], day: 'Tomorrow' },
  { id: 'e9', time: '11:00 AM', event: "Men's Triple Jump Final", venue: 'Hampden Park Stadium', sport: 'Jumps', status: 'scheduled', athletes: ['Pedro Pichardo', 'Hugues Fabrice Zango', 'Andy Diaz'], day: 'Tomorrow' },
  { id: 'e10', time: '04:00 PM', event: "Women's 4×100m Relay Final", venue: 'Hampden Park Stadium', sport: 'Relay', status: 'scheduled', athletes: ['Team Jamaica', 'Team Great Britain', 'Team Nigeria'], day: 'Tomorrow' },
];

const RECORDS_DATA = [
  {
    id: 'mjt',
    event: "Men's Javelin Throw",
    athlete: 'Neeraj Chopra',
    country: 'India',
    flag: '🇮🇳',
    result: '88.13m',
    type: 'GR',
    typeFull: 'Games Record',
    phase: 'Final',
    sport: 'Throws',
    date: 'Aug 7, 2026',
    city: 'Glasgow',
    image: 'https://images.unsplash.com/photo-1780642207268-44f94bccf510?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    prevRecord: '85.60m',
    prevHolder: 'Julius Yego (KEN)',
    improvement: '+2.53m',
    aiInsight: "Chopra's 88.13m obliterated the previous Games Record by 2.53m — a throw that ranks among the top 5 javelin performances globally. A defining moment for Indian athletics on the world stage.",
    progressData: [
      { year: '2018', value: 82.8 }, { year: '2019', value: 84.2 }, { year: '2020', value: 86.5 },
      { year: '2021', value: 87.0 }, { year: '2022', value: 88.13 }, { year: '2023', value: 88.17 },
    ],
  },
  {
    id: 'm100f',
    event: "Men's 100m Final",
    athlete: 'Ferdinand Omanyala',
    country: 'Kenya',
    flag: '🇰🇪',
    result: '9.85s',
    type: 'GR',
    typeFull: 'Games Record',
    phase: 'Final',
    sport: 'Sprints',
    date: 'Jul 29, 2026',
    city: 'Glasgow',
    image: 'https://images.unsplash.com/photo-1728060560980-e39712526b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    prevRecord: '9.93s',
    prevHolder: 'Mike Rodgers (USA)',
    improvement: '-0.08s',
    aiInsight: "Omanyala's 9.85s is the fastest 100m in Commonwealth Games history — a dominant wire-to-wire performance that rewrote the record books by a remarkable 0.08 seconds.",
    progressData: [
      { year: '2019', value: 10.0 }, { year: '2020', value: 9.97 }, { year: '2021', value: 9.91 },
      { year: '2022', value: 9.85 }, { year: '2023', value: 9.84 }, { year: '2024', value: 9.86 },
    ],
  },
  {
    id: 'm400h',
    event: "Men's 400m Hurdles",
    athlete: 'Karsten Warholm',
    country: 'Norway',
    flag: '🇳🇴',
    result: '46.92s',
    type: 'NR',
    typeFull: 'National Record',
    phase: 'Semifinal',
    sport: 'Hurdles',
    date: 'Aug 6, 2026',
    city: 'Glasgow',
    image: 'https://images.unsplash.com/photo-1763639700615-225fe7fdffff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    prevRecord: '47.01s',
    prevHolder: 'Karsten Warholm (NOR)',
    improvement: '-0.09s',
    aiInsight: "Warholm broke his own Norwegian record in the semis while running conservatively — a signal of peak form. His hurdling technique remained textbook-perfect from barrier one to ten.",
    progressData: [
      { year: '2019', value: 47.1 }, { year: '2020', value: 46.87 }, { year: '2021', value: 45.94 },
      { year: '2022', value: 46.92 }, { year: '2023', value: 46.77 }, { year: '2024', value: 47.05 },
    ],
  },
  {
    id: 'wlj',
    event: "Women's Long Jump",
    athlete: 'Ese Brume',
    country: 'Nigeria',
    flag: '🇳🇬',
    result: '7.17m',
    type: 'GR',
    typeFull: 'Games Record',
    phase: 'Final',
    sport: 'Jumps',
    date: 'Aug 5, 2026',
    city: 'Glasgow',
    image: 'https://images.unsplash.com/photo-1772475625553-038d9d7e600c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    prevRecord: '7.07m',
    prevHolder: 'Blessing Okagbare (NGR)',
    improvement: '+0.10m',
    aiInsight: "Brume's 7.17m broke a record that had stood for 16 years. Her third-round jump — aided by a legal tailwind — was technically flawless, with near-perfect take-off angle and board contact.",
    progressData: [
      { year: '2019', value: 6.90 }, { year: '2020', value: 7.00 }, { year: '2021', value: 7.05 },
      { year: '2022', value: 7.10 }, { year: '2023', value: 7.17 }, { year: '2024', value: 7.14 },
    ],
  },
  {
    id: 'm1500',
    event: "Men's 1500m Final",
    athlete: 'Jake Wightman',
    country: 'Great Britain',
    flag: '🇬🇧',
    result: '3:29.23',
    type: 'GR',
    typeFull: 'Games Record',
    phase: 'Final',
    sport: 'Distance',
    date: 'Aug 9, 2026',
    city: 'Glasgow',
    image: 'https://images.unsplash.com/photo-1758506971667-fbaa8942258a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    prevRecord: '3:30.11',
    prevHolder: 'Bernard Lagat (USA)',
    improvement: '-0.88s',
    aiInsight: "Wightman's front-running tactics paid dividends — his final 400m split of 53.4s broke the field completely. This Games Record reaffirms him as the premier 1500m runner of his generation.",
    progressData: [
      { year: '2019', value: 212.5 }, { year: '2020', value: 211.8 }, { year: '2021', value: 210.6 },
      { year: '2022', value: 209.8 }, { year: '2023', value: 209.23 }, { year: '2024', value: 209.50 },
    ],
  },
  {
    id: 'mrelay',
    event: "Men's 4×100m Relay",
    athlete: 'Team Jamaica',
    country: 'Jamaica',
    flag: '🇯🇲',
    result: '37.47s',
    type: 'GR',
    typeFull: 'Games Record',
    phase: 'Final',
    sport: 'Relay',
    date: 'Aug 10, 2026',
    city: 'Glasgow',
    image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    prevRecord: '37.58s',
    prevHolder: 'Team Jamaica (JAM)',
    improvement: '-0.11s',
    aiInsight: "Flawless baton exchanges at all three transitions were the difference — each handoff estimated at sub-0.2s. Jamaica's relay unit has now set or tied the Games Record in four consecutive editions.",
    progressData: [
      { year: '2018', value: 37.9 }, { year: '2019', value: 37.7 }, { year: '2021', value: 37.6 },
      { year: '2022', value: 37.58 }, { year: '2024', value: 37.55 }, { year: '2026', value: 37.47 },
    ],
  },
  {
    id: 'w200wr',
    event: "Women's 200m Final",
    athlete: 'Shericka Jackson',
    country: 'Jamaica',
    flag: '🇯🇲',
    result: '21.41s',
    type: 'WR',
    typeFull: 'World Record',
    phase: 'Final',
    sport: 'Sprints',
    date: 'Aug 8, 2026',
    city: 'Glasgow',
    image: 'https://images.unsplash.com/photo-1728060560980-e39712526b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    prevRecord: '21.45s',
    prevHolder: 'Florence Griffith-Joyner (USA)',
    improvement: '-0.04s',
    aiInsight: "A historic moment — Jackson shattered the 37-year-old world record set by Florence Griffith-Joyner in 1988. Running into a slight headwind, her 21.41s is a testament to a near-perfect race executed at the biggest stage.",
    progressData: [
      { year: '2019', value: 22.0 }, { year: '2020', value: 21.8 }, { year: '2021', value: 21.55 },
      { year: '2022', value: 21.45 }, { year: '2023', value: 21.41 }, { year: '2024', value: 21.43 },
    ],
  },
  {
    id: 'm110hwr',
    event: "Men's 110m Hurdles",
    athlete: 'Grant Holloway',
    country: 'USA',
    flag: '🇺🇸',
    result: '12.81s',
    type: 'WR',
    typeFull: 'World Record',
    phase: 'Final',
    sport: 'Hurdles',
    date: 'Aug 5, 2026',
    city: 'Glasgow',
    image: 'https://images.unsplash.com/photo-1763639700615-225fe7fdffff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    prevRecord: '12.80s',
    prevHolder: 'Aries Merritt (USA)',
    improvement: '-0.01s',
    aiInsight: "Holloway edged the world record with flawless hurdle clearance — his lead leg was razor-precise at every barrier. A performance that cements his legacy as the greatest hurdler of his generation.",
    progressData: [
      { year: '2019', value: 13.0 }, { year: '2020', value: 12.98 }, { year: '2021', value: 12.81 },
      { year: '2022', value: 12.84 }, { year: '2023', value: 12.82 }, { year: '2024', value: 12.81 },
    ],
  },
];

const VIDEO_HIGHLIGHTS = [
  { title: "Neeraj Chopra — Record Javelin Throw", duration: '3:42', views: '8.4M', tag: 'Throws', thumb: 'https://images.unsplash.com/photo-1780319679838-c705a32fc756?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { title: "Men's 100m — Race of the Year", duration: '4:10', views: '10.3M', tag: 'Sprints', thumb: 'https://images.unsplash.com/photo-1474546652694-a33dd8161d66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { title: "Warholm's 400m Hurdles Semifinal", duration: '2:58', views: '3.7M', tag: 'Hurdles', thumb: 'https://images.unsplash.com/photo-1763639700615-225fe7fdffff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { title: "Ese Brume — Long Jump Games Record", duration: '5:05', views: '2.1M', tag: 'Jumps', thumb: 'https://images.unsplash.com/photo-1772475625553-038d9d7e600c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  { title: "Jamaica 4×100m Relay — Pure Speed", duration: '3:20', views: '6.8M', tag: 'Relay', thumb: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
];

const QUICK_STATS = [
  { label: 'Medal Tally', value: '61', icon: Trophy, color: '#c9115f', sub: 'India Total' },
  { label: 'World Records', value: '2', icon: Globe, color: '#ff5900', sub: 'CWG 2026' },
  { label: 'CW Records', value: '4', icon: Star, color: '#FFD700', sub: 'Games Records' },
  { label: 'Athlete Rankings', value: '#3', icon: TrendingUp, color: '#4ade80', sub: 'India Rank' },
  { label: 'Event Schedules', value: '10', icon: Clock, color: '#60a5fa', sub: 'Events Today' },
  { label: 'Highlights', value: '1.2K', icon: Play, color: '#a78bfa', sub: 'Videos' },
];

const FILTERS = ['All', 'Men', 'Women', 'Finals', 'World Records', 'Games Records'];
const SORTS = ['Latest', 'Fastest', 'Most Popular', 'Recently Broken'];

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    WR: { bg: 'rgba(255,215,0,0.15)', text: '#FFD700', border: 'rgba(255,215,0,0.4)' },
    GR: { bg: 'rgba(201,17,95,0.15)', text: '#c9115f', border: 'rgba(201,17,95,0.4)' },
    NR: { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa', border: 'rgba(96,165,250,0.4)' },
  };
  const c = colors[type] || colors.GR;
  return (
    <span className="px-2 py-[2px] rounded-full text-[10px] font-bold border" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {type}
    </span>
  );
}

export default function MatchCentre() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('home');
  const [activeSport, setActiveSport] = useState('All Events');
  const [selectedRecord, setSelectedRecord] = useState(RECORDS_DATA[1]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Latest');
  const [showSort, setShowSort] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedRecords, setSavedRecords] = useState<Set<string>>(new Set());
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState<{title: string; text: string}>({title: '', text: ''});
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const sportsScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);

  const navigateTo = (newScreen: Screen) => {
    setScreenHistory(prev => [...prev, screen]);
    setScreen(newScreen);
  };

  const filteredRecords = RECORDS_DATA.filter(r => {
    if (activeSport !== 'All Events' && r.sport !== activeSport) return false;
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Men') return r.event.startsWith("Men's");
    if (activeFilter === 'Women') return r.event.startsWith("Women's");
    if (activeFilter === 'Finals') return r.phase === 'Final';
    if (activeFilter === 'World Records') return r.type === 'WR';
    if (activeFilter === 'Games Records') return r.type === 'GR';
    return true;
  }).filter(r =>
    searchQuery === '' ||
    r.athlete.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory(h => h.slice(0, -1));
      setScreen(prev);
    } else {
      router.push("/MainModules/AtheleteHome")
    }
  };

  const handleShare = (title: string, text: string) => {
    setShareContent({ title, text });
    setShowShareModal(true);
    // If Web Share API is available, use it
    if (navigator.share) {
      navigator.share({ title, text, url: window.location.href })
        .then(() => setShowShareModal(false))
        .catch(() => {
          // Keep modal open if user cancels or error occurs
        });
    }
  };

  const handleSearch = () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // ── SCREEN: HOME ─────────────────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <div className="h-screen bg-[#050505] flex justify-center">
        <div className="w-full max-w-6xl bg-[#050505] min-h-screen overflow-y-auto pb-6">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-4 py-3 flex items-center gap-3">
            <button
             onClick={() => {router.push("/MainModules/AtheleteHome")}}
              className="w-9 h-9 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-bold text-[17px] leading-tight">Match Centre</h1>
              <p className="text-[#888] text-[11px]">Commonwealth Games 2026</p>
            </div>
            <button
              onClick={handleSearch}
              className="w-9 h-9 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-95 transition-all"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setShowNotifications(true)}
              className="relative w-9 h-9 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-95 transition-all"
            >
              <Bell className="w-4 h-4 text-white" />
              <div className="absolute -top-[2px] -right-[2px] w-3.5 h-3.5 bg-[#c9115f] rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">2</span>
              </div>
            </button>
          </div>

          {/* Sport tabs */}
          <div className="mt-3 px-4">
            <div ref={sportsScrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
              {SPORTS.map(sport => (
                <button
                  key={sport}
                  onClick={() => { setActiveSport(sport); navigateTo('sport-records'); }}
                  className="flex-none px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all active:scale-95 whitespace-nowrap"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#aaa',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Card */}
          <div className="mx-4 mt-4 rounded-2xl overflow-hidden relative" style={{ height: '220px' }}>
            <img src="https://images.unsplash.com/photo-1780642207268-44f94bccf510?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #050505 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.1) 100%)' }} />
            <div className="absolute top-3 left-3">
              <span className="flex items-center gap-1.5 bg-[#c9115f] px-3 py-1 rounded-full text-white text-[11px] font-bold">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE RECORDS
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[#aaa] text-[12px] mb-1">Glasgow 2026 · Athletics</p>
              <h2 className="text-white font-bold text-[20px] leading-tight mb-2">Track & Field Records Broken</h2>
              <button
                onClick={() => { setActiveSport('All Events'); navigateTo('sport-records'); }}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-[13px] font-semibold active:scale-95 transition-all"
                style={{ background: 'linear-gradient(102deg, #ff5900 0%, #c9115f 100%)', boxShadow: '0 4px 14px rgba(201,17,95,0.4)' }}
              >
                Explore Stats
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick access grid */}
          <div className="px-4 mt-5">
            <h3 className="text-white font-bold text-[15px] mb-3">Quick Access</h3>
            <div className="grid grid-cols-3 gap-3">
              {QUICK_STATS.map((stat, i) => {
                const Icon = stat.icon;
                const handleClick = () => {
                  if (stat.label === 'Medal Tally') {
                    navigateTo('medal-tally');
                  } else if (stat.label === 'World Records') {
                    setActiveSport('All Events');
                    setActiveFilter('World Records');
                    navigateTo('sport-records');
                  } else if (stat.label === 'CW Records') {
                    setActiveSport('All Events');
                    setActiveFilter('Games Records');
                    navigateTo('sport-records');
                  } else if (stat.label === 'Athlete Rankings') {
                    navigateTo('athlete-rankings');
                  } else if (stat.label === 'Event Schedules') {
                    navigateTo('event-schedule');
                  } else if (stat.label === 'Highlights') {
                    navigateTo('video-highlights');
                  } else {
                    navigateTo('sport-records');
                  }
                };
                return (
                  <button
                    key={i}
                    onClick={handleClick}
                    className="bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)] flex flex-col items-start gap-2 active:scale-95 transition-all hover:border-[rgba(255,255,255,0.15)]"
                    style={{ boxShadow: `0 0 0 0 ${stat.color}` }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-[16px]">{stat.value}</p>
                      <p className="text-[#888] text-[10px]">{stat.sub}</p>
                    </div>
                    <p className="text-[#aaa] text-[11px] font-medium">{stat.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Records preview */}
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-[15px]">Top Records</h3>
              <button onClick={() => navigateTo('sport-records')} className="text-[#c9115f] text-[13px] font-semibold flex items-center gap-1">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {RECORDS_DATA.slice(0, 3).map(record => (
                <button
                  key={record.id}
                  onClick={() => { setSelectedRecord(record); navigateTo('record-detail'); }}
                  className="w-full bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)] flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <img src={record.image} alt={record.athlete} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-semibold truncate">{record.event}</p>
                    <p className="text-[#888] text-[12px] mt-0.5">{record.flag} {record.athlete}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-[15px]">{record.result}</p>
                    <TypeBadge type={record.type} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Video Highlights Preview */}
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-[15px]">Highlights</h3>
              <button onClick={() => navigateTo('video-highlights')} className="text-[#c9115f] text-[13px] font-semibold flex items-center gap-1">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {VIDEO_HIGHLIGHTS.slice(0, 3).map((v, i) => (
                <button
                  key={i}
                  onClick={() => navigateTo('video-highlights')}
                  className="flex-none w-[160px] bg-[#111] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.07)] active:scale-95 transition-all"
                >
                  <div className="relative h-[90px]">
                    <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[rgba(201,17,95,0.9)] flex items-center justify-center">
                        <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-[1px] rounded">{v.duration}</span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-white text-[11px] font-semibold line-clamp-2 leading-tight">{v.title}</p>
                    <p className="text-[#888] text-[10px] mt-1">{v.views} views</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Overlay */}
          {showSearch && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col animate-in fade-in duration-200">
              <div className="w-full max-w-[390px] mx-auto h-full bg-[#050505] flex flex-col">
                {/* Search header */}
                <div className="px-4 py-4 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setShowSearch(false); setHomeSearchQuery(''); }}
                      className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search events, athletes, records..."
                        value={homeSearchQuery}
                        onChange={e => setHomeSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-full pl-10 pr-4 py-2.5 text-white text-[14px] placeholder:text-[#555] focus:outline-none focus:border-[rgba(201,17,95,0.4)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Search results */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {homeSearchQuery === '' ? (
                    <div className="text-center py-16">
                      <Search className="w-12 h-12 mx-auto mb-3 text-[#333]" />
                      <p className="text-[#666] text-[14px]">Search for events, athletes, or records</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[#888] text-[12px] mb-2">Results for "{homeSearchQuery}"</p>
                      {RECORDS_DATA.filter(r =>
                        r.athlete.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
                        r.event.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
                        r.sport.toLowerCase().includes(homeSearchQuery.toLowerCase())
                      ).map(record => (
                        <button
                          key={record.id}
                          onClick={() => { setSelectedRecord(record); navigateTo('record-detail'); setShowSearch(false); setHomeSearchQuery(''); }}
                          className="w-full bg-[#111] rounded-2xl p-3 border border-[rgba(255,255,255,0.07)] flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                            <img src={record.image} alt={record.athlete} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[13px] font-semibold truncate">{record.event}</p>
                            <p className="text-[#888] text-[11px] mt-0.5">{record.flag} {record.athlete}</p>
                          </div>
                          <TypeBadge type={record.type} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col animate-in fade-in duration-200">
              <div className="w-full max-w-6xl mx-auto h-full bg-[#050505] flex flex-col">
                {/* Notifications header */}
                <div className="px-4 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <h2 className="text-white font-bold text-[17px] flex-1">Notifications</h2>
                  <button className="text-[#c9115f] text-[13px] font-semibold">Mark all read</button>
                </div>

                {/* Notifications list */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {[
                    { icon: Trophy, color: '#c9115f', title: 'New Record Alert', body: 'Neeraj Chopra just broke the Commonwealth Games record!', time: '5m ago', unread: true },
                    { icon: Star, color: '#FFD700', title: 'Medal Update', body: 'India moves to #3 in medal tally with 78 total medals', time: '1h ago', unread: true },
                    { icon: Play, color: '#a78bfa', title: 'New Highlights', body: 'Watch the best moments from Day 7', time: '2h ago', unread: false },
                    { icon: TrendingUp, color: '#4ade80', title: 'Stats Update', body: '12 World Records broken so far at CWG 2026', time: '5h ago', unread: false },
                  ].map((notif, i) => {
                    const Icon = notif.icon;
                    return (
                      <button
                        key={i}
                        className="w-full bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)] flex gap-3 active:scale-[0.98] transition-all text-left relative overflow-hidden"
                      >
                        {notif.unread && (
                          <div className="absolute top-3 right-3 w-2 h-2 bg-[#c9115f] rounded-full" />
                        )}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${notif.color}20` }}>
                          <Icon className="w-4 h-4" style={{ color: notif.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[13px] font-semibold">{notif.title}</p>
                          <p className="text-[#888] text-[12px] mt-1 leading-relaxed">{notif.body}</p>
                          <p className="text-[#555] text-[11px] mt-1.5">{notif.time}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center animate-in fade-in duration-200" onClick={() => setShowShareModal(false)}>
              <div className="w-full max-w-6xl bg-[#0b0b0f] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1 bg-[#333] rounded-full mx-auto mb-4" />
                <h3 className="text-white font-bold text-[17px] mb-2">Share</h3>
                <p className="text-[#888] text-[13px] mb-4">{shareContent.title}</p>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: '📱', label: 'Copy Link', action: () => { navigator.clipboard.writeText(window.location.href); setShowShareModal(false); } },
                    { icon: '🐦', label: 'Twitter', action: () => setShowShareModal(false) },
                    { icon: '📘', label: 'Facebook', action: () => setShowShareModal(false) },
                    { icon: '💬', label: 'WhatsApp', action: () => setShowShareModal(false) },
                  ].map((option, i) => (
                    <button
                      key={i}
                      onClick={option.action}
                      className="flex flex-col items-center gap-2 active:scale-95 transition-all"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-2xl">
                        {option.icon}
                      </div>
                      <span className="text-[#aaa] text-[11px]">{option.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 rounded-2xl bg-[#111] border border-[rgba(255,255,255,0.1)] text-white font-semibold text-[14px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SCREEN: SPORT RECORDS LIST ────────────────────────────────────────────
  if (screen === 'sport-records') {
    return (
      <div className="h-screen bg-[#050505] flex justify-center">
        <div className="w-full max-w-6xl bg-[#050505] min-h-screen flex flex-col">
          {/* Sticky header */}
          <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
            <div className="px-4 py-3 flex items-center gap-3">
              <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-95">
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <h1 className="text-white font-bold text-[17px] flex-1">{activeSport} Records</h1>
              <div className="relative">
                <button
                  onClick={() => setShowSort(s => !s)}
                  className="flex items-center gap-1.5 bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1.5 text-[#aaa] text-[12px]"
                >
                  <Filter className="w-3 h-3" />
                  {activeSort}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-2 bg-[#1a1a22] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl z-50 w-[180px] overflow-hidden">
                    {SORTS.map(s => (
                      <button key={s} onClick={() => { setActiveSort(s); setShowSort(false); }}
                        className="w-full px-4 py-3 text-left text-[13px] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                        style={{ color: activeSort === s ? '#c9115f' : '#aaa' }}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search athletes, events, records..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-full pl-10 pr-4 py-2 text-white text-[13px] placeholder:text-[#555] focus:outline-none focus:border-[rgba(201,17,95,0.4)]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-[#666]" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="flex-none px-4 py-1 rounded-full text-[12px] font-semibold transition-all"
                  style={activeFilter === f ? {
                    background: 'linear-gradient(102deg, #ff5900 0%, #c9115f 100%)',
                    color: 'white',
                  } : {
                    background: 'rgba(255,255,255,0.06)',
                    color: '#888',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Sport tab bar */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-[rgba(255,255,255,0.06)]">
            {SPORTS.map(sport => (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                className="flex-none px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap"
                style={activeSport === sport ? {
                  background: 'linear-gradient(102deg, #ff5900 0%, #c9115f 100%)',
                  color: 'white',
                } : { background: 'rgba(255,255,255,0.06)', color: '#888' }}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Records list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-8">
            {filteredRecords.length === 0 ? (
              <div className="text-center text-[#555] py-16">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-[14px]">No records found</p>
              </div>
            ) : filteredRecords.map(record => (
              <div key={record.id}>
                <button
                  onClick={() => {
                    if (expandedRecord === record.id) setExpandedRecord(null);
                    else setExpandedRecord(record.id);
                  }}
                  className="w-full bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)] text-left active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
                      <img src={record.image} alt={record.athlete} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-semibold leading-tight">{record.event}</p>
                      <p className="text-[#888] text-[12px] mt-0.5">{record.flag} {record.athlete} · {record.country}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <TypeBadge type={record.type} />
                        <span className="text-[#555] text-[10px]">{record.phase}</span>
                        <span className="text-[#555] text-[10px]">·</span>
                        <span className="text-[#555] text-[10px]">{record.sport}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-bold text-[18px]">{record.result}</p>
                      <button
                        onClick={e => { e.stopPropagation(); setSavedRecords(s => { const n = new Set(s); n.has(record.id) ? n.delete(record.id) : n.add(record.id); return n; }); }}
                        className="mt-1"
                      >
                        <BookmarkPlus className="w-4 h-4" style={{ color: savedRecords.has(record.id) ? '#c9115f' : '#555' }} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedRecord === record.id && (
                    <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.07)]">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3">
                          <p className="text-[#888] text-[10px]">Previous Record</p>
                          <p className="text-white font-bold text-[14px] mt-0.5">{record.prevRecord}</p>
                          <p className="text-[#555] text-[10px]">{record.prevHolder}</p>
                        </div>
                        <div className="bg-[rgba(201,17,95,0.08)] border border-[rgba(201,17,95,0.2)] rounded-xl p-3">
                          <p className="text-[#888] text-[10px]">Improvement</p>
                          <p className="text-[#c9115f] font-bold text-[14px] mt-0.5">{record.improvement}</p>
                          <p className="text-[#555] text-[10px]">{record.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedRecord(record); navigateTo('record-detail'); }}
                          className="flex-1 py-2 rounded-xl text-white text-[13px] font-semibold"
                          style={{ background: 'linear-gradient(102deg, #ff5900 0%, #c9115f 100%)' }}
                        >
                          Full Details
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleShare(`${record.athlete} Record`, `${record.athlete} set a ${record.typeFull} in ${record.event} with ${record.result}!`); }}
                          className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] active:scale-95 transition-all"
                        >
                          <Share2 className="w-4 h-4 text-[#888]" />
                        </button>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center animate-in fade-in duration-200" onClick={() => setShowShareModal(false)}>
              <div className="w-full max-w-6xl bg-[#0b0b0f] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1 bg-[#333] rounded-full mx-auto mb-4" />
                <h3 className="text-white font-bold text-[17px] mb-2">Share</h3>
                <p className="text-[#888] text-[13px] mb-4">{shareContent.title}</p>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: '📱', label: 'Copy Link', action: () => { navigator.clipboard.writeText(window.location.href); setShowShareModal(false); } },
                    { icon: '🐦', label: 'Twitter', action: () => setShowShareModal(false) },
                    { icon: '📘', label: 'Facebook', action: () => setShowShareModal(false) },
                    { icon: '💬', label: 'WhatsApp', action: () => setShowShareModal(false) },
                  ].map((option, i) => (
                    <button
                      key={i}
                      onClick={option.action}
                      className="flex flex-col items-center gap-2 active:scale-95 transition-all"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-2xl">
                        {option.icon}
                      </div>
                      <span className="text-[#aaa] text-[11px]">{option.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 rounded-2xl bg-[#111] border border-[rgba(255,255,255,0.1)] text-white font-semibold text-[14px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SCREEN: RECORD DETAIL ─────────────────────────────────────────────────
  if (screen === 'record-detail') {
    const rec = selectedRecord;
    return (
      <div className="h-screen bg-[#050505] flex justify-center">
        <div className="w-full max-w-6xl bg-[#050505] min-h-screen overflow-y-auto pb-8">
          {/* Hero */}
          <div className="relative h-[280px]">
            <img src={rec.image} alt={rec.athlete} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #050505 0%, rgba(5,5,5,0.5) 60%, transparent 100%)' }} />
            <div className="absolute top-0 left-0 right-0 flex items-center gap-3 px-4 py-4">
              <button onClick={goBack} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:scale-95">
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <div className="flex-1" />
              <button
                onClick={() => handleShare(`${rec.athlete} Record`, `${rec.athlete} set a ${rec.typeFull} in ${rec.event} with ${rec.result}!`)}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setSavedRecords(s => { const n = new Set(s); n.has(rec.id) ? n.delete(rec.id) : n.add(rec.id); return n; })}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <BookmarkPlus className="w-4 h-4" style={{ color: savedRecords.has(rec.id) ? '#c9115f' : 'white' }} />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{rec.flag}</span>
                <TypeBadge type={rec.type} />
                <span className="text-[#aaa] text-[12px]">{rec.phase}</span>
              </div>
              <h1 className="text-white font-bold text-[22px] leading-tight">{rec.event}</h1>
              <p className="text-[#aaa] text-[13px] mt-1">{rec.athlete} · {rec.country}</p>
            </div>
          </div>

          {/* Key stat */}
          <div className="mx-4 mt-4">
            <div className="bg-[#111] rounded-2xl p-5 border border-[rgba(255,255,255,0.07)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl" style={{ background: 'rgba(201,17,95,0.1)' }} />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[#888] text-[11px] uppercase tracking-wider mb-1">Record Result</p>
                  <p className="text-white font-bold text-[42px] leading-none">{rec.result}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.3)] px-2 py-0.5 rounded-full">
                      <ArrowUp className="w-3 h-3 text-[#4ade80]" />
                      <span className="text-[#4ade80] text-[11px] font-bold">{rec.improvement}</span>
                    </div>
                    <span className="text-[#555] text-[11px]">vs {rec.prevRecord}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <MapPin className="w-3 h-3 text-[#888]" />
                    <span className="text-[#888] text-[12px]">{rec.city}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3 text-[#888]" />
                    <span className="text-[#888] text-[12px]">{rec.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance chart */}
          <div className="mx-4 mt-4">
            <div className="bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-semibold text-[14px]">Performance Progression</p>
                  <p className="text-[#888] text-[11px]">Career trajectory</p>
                </div>
                <Activity className="w-5 h-5 text-[#c9115f]" />
              </div>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={rec.progressData}>
                    <defs>
                      <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c9115f" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c9115f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#333" tick={{ fontSize: 11, fill: '#666' }} />
                    <YAxis stroke="#333" tick={{ fontSize: 10, fill: '#666' }} width={40} />
                    <Tooltip contentStyle={{ background: '#1a1a22', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="value" stroke="#c9115f" strokeWidth={2} fill="url(#recGrad)" dot={{ fill: '#c9115f', r: 3 }} activeDot={{ r: 6, fill: '#c9115f' }} />
                    <ReferenceLine y={rec.progressData[rec.progressData.length - 1].value} stroke="rgba(201,17,95,0.3)" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="mx-4 mt-4">
            <div className="bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]">
              <p className="text-white font-semibold text-[14px] mb-4">Record Comparison</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-[rgba(255,255,255,0.04)] rounded-xl p-3">
                  <p className="text-[#888] text-[10px] mb-1">Previous Record</p>
                  <p className="text-white font-bold text-[16px]">{rec.prevRecord}</p>
                  <p className="text-[#555] text-[10px] mt-0.5">{rec.prevHolder}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff5900] to-[#c9115f] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 bg-[rgba(201,17,95,0.1)] border border-[rgba(201,17,95,0.25)] rounded-xl p-3">
                  <p className="text-[#888] text-[10px] mb-1">New Record</p>
                  <p className="text-white font-bold text-[16px]">{rec.result}</p>
                  <p className="text-[#c9115f] text-[10px] mt-0.5 font-semibold">{rec.improvement}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="mx-4 mt-4">
            <div className="rounded-2xl p-4 border border-[rgba(255,255,255,0.07)] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(201,17,95,0.12) 0%, rgba(255,89,0,0.08) 100%)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff5900] to-[#c9115f] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <p className="text-white font-semibold text-[13px]">AI Analysis</p>
                <span className="px-2 py-0.5 bg-[rgba(255,255,255,0.08)] rounded-full text-[10px] text-[#aaa]">Powered by SportsFan360 AI</span>
              </div>
              <p className="text-[#d1d5dc] text-[13px] leading-relaxed">{rec.aiInsight}</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="mx-4 mt-4 flex gap-3">

            <button
              onClick={() => navigateTo('video-highlights')}
              className="flex-1 py-3 rounded-2xl text-white font-semibold text-[14px] bg-[#111] border border-[rgba(255,255,255,0.1)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Highlights
            </button>
          </div>

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center animate-in fade-in duration-200" onClick={() => setShowShareModal(false)}>
              <div className="w-full max-w-6xl bg-[#0b0b0f] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1 bg-[#333] rounded-full mx-auto mb-4" />
                <h3 className="text-white font-bold text-[17px] mb-2">Share</h3>
                <p className="text-[#888] text-[13px] mb-4">{shareContent.title}</p>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: '📱', label: 'Copy Link', action: () => { navigator.clipboard.writeText(window.location.href); setShowShareModal(false); } },
                    { icon: '🐦', label: 'Twitter', action: () => setShowShareModal(false) },
                    { icon: '📘', label: 'Facebook', action: () => setShowShareModal(false) },
                    { icon: '💬', label: 'WhatsApp', action: () => setShowShareModal(false) },
                  ].map((option, i) => (
                    <button
                      key={i}
                      onClick={option.action}
                      className="flex flex-col items-center gap-2 active:scale-95 transition-all"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-2xl">
                        {option.icon}
                      </div>
                      <span className="text-[#aaa] text-[11px]">{option.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 rounded-2xl bg-[#111] border border-[rgba(255,255,255,0.1)] text-white font-semibold text-[14px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SCREEN: ATHLETE DETAIL ────────────────────────────────────────────────
  if (screen === 'athlete-detail') {
    const rec = selectedRecord;
    const achievementData = [
      { year: '2018', medal: '🥉', event: 'Asian Games', result: rec.result },
      { year: '2020', medal: '🥇', event: 'World Cup', result: rec.result },
      { year: '2022', medal: '🥇', event: 'CWG Birmingham', result: rec.result },
      { year: '2024', medal: '🥈', event: 'Paris Olympics', result: rec.result },
    ];
    return (
      <div className="h-screen bg-[#050505] flex justify-center">
        <div className="w-full max-w-6xl bg-[#050505] min-h-screen overflow-y-auto pb-8">
          {/* Hero */}
          <div className="relative h-[300px]">
            <img src={rec.image} alt={rec.athlete} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #050505 0%, rgba(5,5,5,0.4) 60%, transparent 100%)' }} />
            <div className="absolute top-4 left-4 right-4 flex items-center">
              <button onClick={goBack} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{rec.flag}</span>
                <span className="text-[#aaa] text-[12px] bg-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded-full">{rec.sport}</span>
                <TypeBadge type={rec.type} />
              </div>
              <h1 className="text-white font-bold text-[24px]">{rec.athlete}</h1>
              <p className="text-[#aaa] text-[13px]">{rec.country}</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mx-4 mt-4 bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Personal Best', value: rec.result },
                { label: 'Record Type', value: rec.typeFull.split(' ')[0] },
                { label: 'Sport', value: rec.sport },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-white font-bold text-[14px]">{stat.value}</p>
                  <p className="text-[#888] text-[10px] mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance trend */}
          <div className="mx-4 mt-4 bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-semibold text-[14px]">Performance Trend</p>
              <BarChart2 className="w-5 h-5 text-[#c9115f]" />
            </div>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={rec.progressData}>
                  <XAxis dataKey="year" stroke="#333" tick={{ fontSize: 10, fill: '#666' }} />
                  <YAxis stroke="#333" tick={{ fontSize: 10, fill: '#666' }} width={36} />
                  <Tooltip contentStyle={{ background: '#1a1a22', border: '1px solid #333', borderRadius: '10px', color: '#fff' }} />
                  <Line type="monotone" dataKey="value" stroke="#c9115f" strokeWidth={2.5} dot={{ fill: '#c9115f', r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Achievement timeline */}
          <div className="mx-4 mt-4">
            <p className="text-white font-semibold text-[14px] mb-3">Career Achievements</p>
            <div className="space-y-3">
              {achievementData.map((a, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#111] rounded-xl p-3 border border-[rgba(255,255,255,0.07)]">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(201,17,95,0.1)] flex items-center justify-center text-xl shrink-0">
                    {a.medal}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-[13px] font-semibold">{a.event}</p>
                    <p className="text-[#888] text-[11px]">{a.year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-[14px]">{a.result}</p>
                    <TypeBadge type={rec.type} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mx-4 mt-4 flex gap-3">
            <button
              onClick={() => navigateTo('video-highlights')}
              className="flex-1 py-3 rounded-2xl text-white font-semibold text-[14px] active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(102deg, #ff5900 0%, #c9115f 100%)' }}
            >
              <Play className="w-4 h-4" />
              Watch Highlights
            </button>
            <button
              onClick={() => handleShare(`${rec.athlete} Profile`, `Check out ${rec.athlete}'s amazing career achievements!`)}
              className="px-5 py-3 rounded-2xl text-white font-semibold text-[14px] bg-[#111] border border-[rgba(255,255,255,0.1)] active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center animate-in fade-in duration-200" onClick={() => setShowShareModal(false)}>
              <div className="w-full max-w-6xl bg-[#0b0b0f] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1 bg-[#333] rounded-full mx-auto mb-4" />
                <h3 className="text-white font-bold text-[17px] mb-2">Share</h3>
                <p className="text-[#888] text-[13px] mb-4">{shareContent.title}</p>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: '📱', label: 'Copy Link', action: () => { navigator.clipboard.writeText(window.location.href); setShowShareModal(false); } },
                    { icon: '🐦', label: 'Twitter', action: () => setShowShareModal(false) },
                    { icon: '📘', label: 'Facebook', action: () => setShowShareModal(false) },
                    { icon: '💬', label: 'WhatsApp', action: () => setShowShareModal(false) },
                  ].map((option, i) => (
                    <button
                      key={i}
                      onClick={option.action}
                      className="flex flex-col items-center gap-2 active:scale-95 transition-all"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-2xl">
                        {option.icon}
                      </div>
                      <span className="text-[#aaa] text-[11px]">{option.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 rounded-2xl bg-[#111] border border-[rgba(255,255,255,0.1)] text-white font-semibold text-[14px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SCREEN: MEDAL TALLY ───────────────────────────────────────────────────
  if (screen === 'medal-tally') {
    const t = INDIA_MEDAL_TALLY;
    return (
      <div className="h-screen bg-[#050505] flex justify-center">
        <div className="w-full max-w-6xl bg-[#050505] min-h-screen flex flex-col">
          <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-4 py-3 flex items-center gap-3">
            <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-95">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-bold text-[17px]">India Medal Tally</h1>
              <p className="text-[#888] text-[11px]">Commonwealth Games 2026 · Glasgow</p>
            </div>
            <span className="text-[28px]">🇮🇳</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-4">
            {/* Total medals hero */}
            <div className="rounded-2xl p-5 border border-[rgba(201,17,95,0.3)] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(201,17,95,0.15) 0%, rgba(255,89,0,0.08) 100%)' }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(201,17,95,0.12)' }} />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                  <p className="text-[#aaa] text-[12px] uppercase tracking-wider mb-1">Overall Rank</p>
                  <p className="text-white font-bold text-[42px] leading-none">#{t.rank}</p>
                  <p className="text-[#888] text-[12px] mt-1">out of 72 nations</p>
                </div>
                <div className="text-right">
                  <p className="text-[#aaa] text-[12px] uppercase tracking-wider mb-1">Total Medals</p>
                  <p className="text-white font-bold text-[42px] leading-none">{t.total}</p>
                  <p className="text-[#c9115f] text-[12px] font-semibold mt-1">Best ever at CWG</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 relative z-10">
                {[
                  { label: 'Gold', value: t.gold, color: '#FFD700', bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.3)', icon: '🥇' },
                  { label: 'Silver', value: t.silver, color: '#C0C0C0', bg: 'rgba(192,192,192,0.12)', border: 'rgba(192,192,192,0.3)', icon: '🥈' },
                  { label: 'Bronze', value: t.bronze, color: '#CD7F32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)', icon: '🥉' },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-3 border text-center" style={{ background: m.bg, borderColor: m.border }}>
                    <p className="text-2xl mb-1">{m.icon}</p>
                    <p className="font-bold text-[22px]" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-[#888] text-[11px]">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]">
              <p className="text-white font-semibold text-[14px] mb-3">Medal Distribution</p>
              <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                <div className="bg-[#FFD700] rounded-l-full transition-all" style={{ width: `${(t.gold / t.total) * 100}%` }} />
                <div className="bg-[#C0C0C0] transition-all" style={{ width: `${(t.silver / t.total) * 100}%` }} />
                <div className="bg-[#CD7F32] rounded-r-full transition-all" style={{ width: `${(t.bronze / t.total) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[#FFD700] text-[11px]">Gold {Math.round((t.gold / t.total) * 100)}%</span>
                <span className="text-[#C0C0C0] text-[11px]">Silver {Math.round((t.silver / t.total) * 100)}%</span>
                <span className="text-[#CD7F32] text-[11px]">Bronze {Math.round((t.bronze / t.total) * 100)}%</span>
              </div>
            </div>

            {/* By discipline */}
            <div className="bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]">
              <p className="text-white font-semibold text-[14px] mb-3">By Discipline</p>
              <div className="space-y-2.5">
                {t.byDiscipline.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[18px] shrink-0">{d.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-semibold">{d.sport}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[#FFD700] text-[11px] font-bold">{d.gold}🥇</span>
                        <span className="text-[#C0C0C0] text-[11px] font-bold ml-1">{d.silver}🥈</span>
                        <span className="text-[#CD7F32] text-[11px] font-bold ml-1">{d.bronze}🥉</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-bold text-[16px]">{d.gold + d.silver + d.bronze}</p>
                      <p className="text-[#888] text-[10px]">total</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN: ATHLETE RANKINGS ──────────────────────────────────────────────
  if (screen === 'athlete-rankings') {
    return (
      <div className="h-screen bg-[#050505] flex justify-center">
        <div className="w-full max-w-6xl bg-[#050505] min-h-screen flex flex-col">
          <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-4 py-3 flex items-center gap-3">
            <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-95">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-bold text-[17px]">Athlete Rankings</h1>
              <p className="text-[#888] text-[11px]">Commonwealth Games 2026 · Top Performers</p>
            </div>
            <Trophy className="w-5 h-5 text-[#FFD700]" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-3">
            {/* India highlight */}
            <div className="rounded-2xl p-4 border border-[rgba(201,17,95,0.3)] flex items-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(201,17,95,0.12) 0%, rgba(255,89,0,0.06) 100%)' }}>
              <span className="text-3xl">🇮🇳</span>
              <div className="flex-1">
                <p className="text-white font-bold text-[14px]">India</p>
                <p className="text-[#aaa] text-[12px]">Overall Nation Rank</p>
              </div>
              <div className="text-right">
                <p className="text-[#c9115f] font-bold text-[28px]">#3</p>
                <p className="text-[#888] text-[11px]">of 72 nations</p>
              </div>
            </div>

            {/* Rankings list */}
            {ATHLETE_RANKINGS.map((a, i) => (
              <div key={i} className="bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)] flex items-center gap-3 active:scale-[0.99] transition-all">
                <div className="w-9 text-center shrink-0">
                  {a.rank <= 3 ? (
                    <span className="text-[22px]">{a.rank === 1 ? '🥇' : a.rank === 2 ? '🥈' : '🥉'}</span>
                  ) : (
                    <p className="text-[#555] font-bold text-[16px]">#{a.rank}</p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                  <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white text-[13px] font-semibold truncate">{a.name}</p>
                    {a.country === 'India' && <span className="px-1.5 py-[1px] bg-[rgba(201,17,95,0.2)] border border-[rgba(201,17,95,0.4)] rounded text-[9px] text-[#c9115f] font-bold">IND</span>}
                  </div>
                  <p className="text-[#888] text-[11px] mt-0.5">{a.flag} {a.sport}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-[15px]">{a.best}</p>
                  <p className="text-[#aaa] text-[11px] mt-0.5">{a.medal} {a.medal === '🥇' ? 'Gold' : a.medal === '🥈' ? 'Silver' : 'Bronze'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN: EVENT SCHEDULE ────────────────────────────────────────────────
  if (screen === 'event-schedule') {
    const todayEvents = EVENT_SCHEDULE.filter(e => e.day === 'Today');
    const tomorrowEvents = EVENT_SCHEDULE.filter(e => e.day === 'Tomorrow');
    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
      live: { bg: 'rgba(201,17,95,0.2)', text: '#c9115f', label: 'LIVE' },
      upcoming: { bg: 'rgba(255,89,0,0.15)', text: '#ff5900', label: 'Soon' },
      scheduled: { bg: 'rgba(255,255,255,0.08)', text: '#888', label: 'Scheduled' },
    };
    const sportColors: Record<string, string> = { Sprints: '#ff5900', Hurdles: '#FFD700', Throws: '#c9115f', Jumps: '#4ade80', Distance: '#60a5fa', Relay: '#a78bfa' };

    const EventCard = ({ ev }: { ev: typeof EVENT_SCHEDULE[0] }) => {
      const s = statusColors[ev.status];
      const sportColor = sportColors[ev.sport] || '#888';
      return (
        <div className="bg-[#111] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13px] font-semibold leading-tight">{ev.event}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-[#666]" />
                <p className="text-[#888] text-[11px]">{ev.venue}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="flex items-center gap-1.5 justify-end mb-1">
                {ev.status === 'live' && <div className="w-1.5 h-1.5 bg-[#c9115f] rounded-full animate-pulse" />}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>{s.label}</span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-[#555]" />
                <p className="text-[#aaa] text-[12px] font-semibold">{ev.time}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${sportColor}20`, color: sportColor }}>{ev.sport}</span>
            <span className="text-[#555] text-[10px]">·</span>
            <span className="text-[#666] text-[10px] truncate">{ev.athletes.slice(0, 2).join(' · ')}{ev.athletes.length > 2 ? ` +${ev.athletes.length - 2}` : ''}</span>
          </div>
        </div>
      );
    };

    return (
      <div className="h-screen bg-[#050505] flex justify-center">
        <div className="w-full max-w-6xl bg-[#050505] min-h-screen flex flex-col">
          <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-4 py-3 flex items-center gap-3">
            <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-95">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-bold text-[17px]">Event Schedule</h1>
              <p className="text-[#888] text-[11px]">Commonwealth Games 2026 · Glasgow</p>
            </div>
            <Clock className="w-5 h-5 text-[#60a5fa]" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-4">
            {/* Today */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-[#c9115f] rounded-full animate-pulse" />
                <p className="text-white font-bold text-[15px]">Today</p>
                <span className="px-2 py-0.5 bg-[rgba(201,17,95,0.15)] border border-[rgba(201,17,95,0.3)] rounded-full text-[#c9115f] text-[10px] font-bold">{todayEvents.length} events</span>
              </div>
              <div className="space-y-3">
                {todayEvents.map(ev => <EventCard key={ev.id} ev={ev} />)}
              </div>
            </div>

            {/* Tomorrow */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-[#60a5fa] rounded-full" />
                <p className="text-white font-bold text-[15px]">Tomorrow</p>
                <span className="px-2 py-0.5 bg-[rgba(96,165,250,0.1)] border border-[rgba(96,165,250,0.2)] rounded-full text-[#60a5fa] text-[10px] font-bold">{tomorrowEvents.length} events</span>
              </div>
              <div className="space-y-3">
                {tomorrowEvents.map(ev => <EventCard key={ev.id} ev={ev} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN: VIDEO HIGHLIGHTS ──────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#050505] flex justify-center">
      <div className="w-full max-w-6xl bg-[#050505] min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] px-4 py-3 flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-95">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-white font-bold text-[17px] flex-1">Highlights & Historic Moments</h1>
          <button
            onClick={() => handleShare('Match Centre Highlights', 'Check out these amazing moments from the Commonwealth Games!')}
            className="w-9 h-9 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center active:scale-95"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Featured video */}
        <button
          onClick={() => handleShare(VIDEO_HIGHLIGHTS[0].title, `Watch this amazing moment: ${VIDEO_HIGHLIGHTS[0].title}`)}
          className="mx-4 mt-4 rounded-2xl overflow-hidden relative active:scale-[0.98] transition-all"
          style={{ height: '200px' }}
        >
          <img src={VIDEO_HIGHLIGHTS[0].thumb} alt="Featured" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(201,17,95,0.9)] flex items-center justify-center shadow-2xl" style={{ boxShadow: '0 0 40px rgba(201,17,95,0.6)' }}>
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <span className="bg-[#c9115f] px-2 py-0.5 rounded-full text-white text-[10px] font-bold">{VIDEO_HIGHLIGHTS[0].tag}</span>
            <p className="text-white font-bold text-[15px] mt-1">{VIDEO_HIGHLIGHTS[0].title}</p>
            <p className="text-[#aaa] text-[11px] mt-0.5">{VIDEO_HIGHLIGHTS[0].views} views · {VIDEO_HIGHLIGHTS[0].duration}</p>
          </div>
        </button>

        {/* Floating mini-player hint */}
        <div className="mx-4 mt-3 bg-[rgba(201,17,95,0.1)] border border-[rgba(201,17,95,0.25)] rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-[#c9115f] rounded-full animate-pulse" />
          <span className="text-[#c9115f] text-[12px] font-medium">Tap any video to launch mini-player</span>
          <Flame className="w-4 h-4 text-[#ff5900] ml-auto" />
        </div>

        {/* All videos grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
          <p className="text-white font-semibold text-[14px] mb-3">All Highlights</p>
          <div className="space-y-3">
            {VIDEO_HIGHLIGHTS.map((v, i) => (
              <button
                key={i}
                onClick={() => handleShare(v.title, `Watch this amazing moment: ${v.title}`)}
                className="w-full flex gap-3 bg-[#111] rounded-2xl p-3 border border-[rgba(255,255,255,0.07)] active:scale-[0.99] transition-all text-left"
              >
                <div className="relative w-[100px] h-[68px] rounded-xl overflow-hidden shrink-0">
                  <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[rgba(201,17,95,0.9)] flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-[1px] rounded">{v.duration}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[13px] font-semibold leading-tight line-clamp-2">{v.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-[1px] rounded-full text-[10px] font-bold" style={{ background: 'rgba(201,17,95,0.15)', color: '#c9115f' }}>{v.tag}</span>
                  </div>
                  <p className="text-[#888] text-[11px] mt-1">{v.views} views</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center animate-in fade-in duration-200" onClick={() => setShowShareModal(false)}>
            <div className="w-full max-w-6xl bg-[#0b0b0f] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1 bg-[#333] rounded-full mx-auto mb-4" />
              <h3 className="text-white font-bold text-[17px] mb-2">Share</h3>
              <p className="text-[#888] text-[13px] mb-4">{shareContent.title}</p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { icon: '📱', label: 'Copy Link', action: () => { navigator.clipboard.writeText(window.location.href); setShowShareModal(false); } },
                  { icon: '🐦', label: 'Twitter', action: () => setShowShareModal(false) },
                  { icon: '📘', label: 'Facebook', action: () => setShowShareModal(false) },
                  { icon: '💬', label: 'WhatsApp', action: () => setShowShareModal(false) },
                ].map((option, i) => (
                  <button
                    key={i}
                    onClick={option.action}
                    className="flex flex-col items-center gap-2 active:scale-95 transition-all"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-2xl">
                      {option.icon}
                    </div>
                    <span className="text-[#aaa] text-[11px]">{option.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-3 rounded-2xl bg-[#111] border border-[rgba(255,255,255,0.1)] text-white font-semibold text-[14px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
