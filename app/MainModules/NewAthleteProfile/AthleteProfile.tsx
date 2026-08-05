"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Search,
  Bell,
  Menu,
  Award,
  Share2,
  Users,
  BarChart3,
  Play,
  Heart,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Volume2,
  Video,
  FileText,
  TrendingUp,
  MapPin,
  Calendar,
  User,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Data for performance trend
const trendData = [
  { year: "2021", distance: 87.58 },
  { year: "2022", distance: 88.13 },
  { year: "2023", distance: 88.17 },
  { year: "2024", distance: 89.45 },
  { year: "2025", distance: 90.23 },
  { year: "2026", distance: 88.94 },
];

export default function AthleteProfile() {
  const [activeTab, setActiveTab] = useState<"drops" | "posts">("drops");
  const [isFollowing, setIsFollowing] = useState(false);
  const [cheerCount, setCheerCount] = useState(12400);
  const [isCheered, setIsCheered] = useState(false);

  // Carousel refs
  const hubScrollRef = useRef<HTMLDivElement>(null);
  const medalScrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (!ref.current) return;
    const scrollAmount = 200;
    ref.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const handleCheer = () => {
    if (isCheered) {
      setCheerCount((prev) => prev - 1);
    } else {
      setCheerCount((prev) => prev + 1);
    }
    setIsCheered(!isCheered);
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-white font-sans overflow-y-auto no-scrollbar pb-10">
      {/* Hide scrollbar CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}} />

      {/* Hero Header Area */}
      <div className="relative w-full h-[320px] md:h-[400px] overflow-hidden">
        {/* Cover Javelin Throw Image / Gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(8, 8, 12, 0.4), #08080c), url('/images/stadium-bg.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-black/50" />

        {/* Top Navbar overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 md:px-8">
          <div className="flex flex-col">
            <span className="text-[20px] md:text-[24px] font-black tracking-tight text-white flex items-center gap-1">
              SportsFan<span className="text-[#FF7A00]">360</span>
            </span>
            <span className="text-[10px] text-gray-400 -mt-1 font-medium tracking-wide">
              Where fans play...
            </span>
          </div>
         
        </div>

        {/* Athlete Name & Profile Circle */}
        <div className="absolute bottom-4 left-0 right-0 px-4 md:px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar container */}
            <div className="relative shrink-0">
              <div className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full p-[3px] bg-gradient-to-r from-[#FF7A00] to-[#FF0055] shadow-lg shadow-[#FF7A00]/20">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250"
                    alt="Neeraj Chopra"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center border-2 border-[#08080c]">
                <svg
                  className="w-3.5 h-3.5 text-white fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
              </div>
            </div>

            {/* Athlete Info */}
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-orange-500/40 rounded-full px-2.5 py-0.5 w-max mb-1.5">
                <Award className="w-3 h-3 text-[#FFD700]" />
                <span className="text-[9px] md:text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                  Verified Athlete
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold flex items-center gap-2 tracking-tight">
                Neeraj Chopra
                <span className="w-5 h-5 bg-[#FF0055] rounded-full inline-flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block w-5 h-3.5 bg-amber-600 rounded-sm overflow-hidden relative shadow-sm">
                  {/* Flag Representation (India) */}
                  <div className="h-1/3 bg-[#FF9933]" />
                  <div className="h-1/3 bg-white flex items-center justify-center">
                    <div className="w-1 h-1 bg-[#000080] rounded-full" />
                  </div>
                  <div className="h-1/3 bg-[#138808]" />
                </span>
                <span className="text-xs text-gray-300 font-medium">
                  India • Javelin Throw
                </span>
              </div>

              {/* Achievements Badges */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/5">
                  <span className="text-[10px] text-orange-400 font-semibold">World Rank</span>
                  <span className="text-[11px] text-white font-bold">#2</span>
                </div>
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/5">
                  <span className="text-[10px] text-yellow-400 font-semibold">🏆 Olympic Champion</span>
                </div>
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/5">
                  <span className="text-[10px] text-yellow-400 font-semibold">🏆 World Champion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Stats & Buttons */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="text-left md:text-right">
              <span className="block text-2xl font-black text-white leading-none">4.8M</span>
              <span className="text-[11px] text-gray-400 font-medium">Fans</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-2 rounded-full font-bold text-sm shadow-md transition-all active:scale-95 ${
                  isFollowing
                    ? "bg-gray-800 text-gray-300 border border-gray-700"
                    : "bg-gradient-to-r from-[#FF0055] to-[#FF4500] text-white"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button
                onClick={handleCheer}
                className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1.5 border transition-all active:scale-95 ${
                  isCheered
                    ? "bg-red-500/20 border-red-500 text-red-500"
                    : "border-[#FF0055] text-white hover:bg-[#FF0055]/10"
                }`}
              >
                <span>Cheer</span>
                <Heart className={`w-3.5 h-3.5 fill-current ${isCheered ? "text-red-500" : "text-gray-300"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-4 md:px-8 max-w-[1200px] mx-auto mt-6 space-y-6">
        {/* Interactive Quick Links Menu */}
        <div className="grid grid-cols-5 gap-2 bg-[#12121e]/80 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
          {[
            { label: "Ask Dolly", icon: "🐬", color: "from-[#00F0FF] to-[#0072FF]" },
            { label: "Fan Club", icon: <Users className="w-5 h-5 text-pink-400" />, color: "from-pink-500/20 to-purple-500/20" },
            { label: "Compare", icon: <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 text-sm">VS</span>, color: "from-red-500/20 to-amber-500/20" },
            { label: "Stats", icon: <BarChart3 className="w-5 h-5 text-emerald-400" />, color: "from-emerald-500/20 to-teal-500/20" },
            { label: "Share", icon: <Share2 className="w-5 h-5 text-blue-400" />, color: "from-blue-500/20 to-indigo-500/20" },
          ].map((item, idx) => (
            <button
              key={idx}
              className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-all group active:scale-95"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${item.color} border border-white/10 mb-2 group-hover:scale-110 transition-transform`}>
                {typeof item.icon === "string" ? <span className="text-xl">{item.icon}</span> : item.icon}
              </div>
              <span className="text-[10px] md:text-xs font-semibold text-gray-300 group-hover:text-white transition-colors text-center truncate w-full">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Welcome Message Card */}
        <div className="bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Title / Description */}
            <div className="lg:col-span-4 space-y-3">
              <div className="inline-block px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-pink-400">Welcome Message!</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
                A special video message from Neeraj to his fans!
              </h2>
              <button className="flex items-center gap-2 bg-gradient-to-r from-[#FF0055] to-[#FF4500] px-5 py-2.5 rounded-full font-bold text-xs shadow-lg active:scale-95 transition-all w-max">
                <Play className="w-3.5 h-3.5 fill-current" />
                Watch Now
              </button>
            </div>

            {/* Video Thumbnail */}
            <div className="lg:col-span-8 relative rounded-2xl overflow-hidden aspect-video group cursor-pointer border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600"
                alt="Neeraj Chopra Fan Message"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-xl">
                  <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                </div>
              </div>

              {/* Handwriting Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5">
                <span className="font-semibold italic">"Always believe. Keep aiming higher. Jai Hind!"</span>
                <span className="text-[10px] text-gray-400">- Neeraj</span>
              </div>

              {/* Micro stats */}
              <div className="absolute top-4 right-4 flex items-center gap-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-semibold border border-white/5">
                <span className="flex items-center gap-1">❤️ 12.4K</span>
                <span className="flex items-center gap-1">💬 832</span>
                <span className="flex items-center gap-1">➡️ 523</span>
              </div>
            </div>
          </div>
        </div>

        {/* Neeraj's Corner & Athlete Hub Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Neeraj's Corner */}
          <div className="lg:col-span-6 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Neeraj's Corner</h3>
                <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mb-4 bg-black/40 p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => setActiveTab("drops")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "drops"
                      ? "bg-[#FF0055] text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  🎁 Drops
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "posts"
                      ? "bg-[#FF0055] text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  📝 Posts
                </button>
              </div>

              {/* Corner List */}
              <div className="space-y-3">
                {[
                  {
                    title: "Mental Toughness: Neeraj's Mindset",
                    type: "Audio",
                    duration: "15 min",
                    views: "189K",
                    time: "5d ago",
                    icon: <Volume2 className="w-4 h-4 text-pink-400" />,
                    bg: "bg-pink-500/10",
                  },
                  {
                    title: "Training Breakdown: Neeraj Chopra",
                    type: "Video",
                    duration: "10 min",
                    views: "234K",
                    time: "3d ago",
                    icon: <Video className="w-4 h-4 text-orange-400" />,
                    bg: "bg-orange-500/10",
                  },
                  {
                    title: "Neeraj's Competition Strategy",
                    type: "Document",
                    duration: "8 min read",
                    views: "156K",
                    time: "1w ago",
                    icon: <FileText className="w-4 h-4 text-emerald-400" />,
                    bg: "bg-emerald-500/10",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-black/30 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-[#FF0055] transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-medium">
                        <span>{item.duration}</span>
                        <span>•</span>
                        <span>👁️ {item.views}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] text-gray-500">{item.time}</span>
                      <button className="p-1 hover:bg-white/5 rounded-full">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Athlete Hub */}
          <div className="lg:col-span-6 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Athlete Hub</h3>
                <span className="bg-red-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  New
                </span>
              </div>
            </div>

            {/* Scrollable carousel on mobile, grid on sm+ */}
            <div className="relative">
              {/* Left arrow – mobile only */}
              <button
                onClick={() => scroll(hubScrollRef, "left")}
                className="sm:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Right arrow – mobile only */}
              <button
                onClick={() => scroll(hubScrollRef, "right")}
                className="sm:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div
                ref={hubScrollRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible"
              >
                {[
                  { title: "VOD & Interviews", badge: "128", icon: "📹", color: "from-pink-500/10 to-red-500/10" },
                  { title: "AMS Sessions", badge: "36", icon: "🎙️", color: "from-purple-500/10 to-indigo-500/10" },
                  { title: "Bookings", badge: "24", icon: "📅", color: "from-blue-500/10 to-cyan-500/10" },
                  { title: "Store", badge: "158", icon: "🛍️", color: "from-emerald-500/10 to-teal-500/10" },
                  { title: "Auctions", badge: "82", icon: "🔨", color: "from-amber-500/10 to-orange-500/10" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.color} border border-white/10 p-5 h-[120px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 hover:border-[#FF0055]/40 snap-start min-w-[160px] shrink-0 sm:min-w-0 sm:shrink`}
                  >
                    {/* Background glow */}
                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl group-hover:bg-[#FF0055]/20 transition-all duration-300" />

                    {/* Badge */}
                    <span className="absolute top-3 right-3 min-w-6 h-6 px-2 flex items-center justify-center rounded-full bg-[#FF0055] text-[10px] font-semibold text-white shadow-lg">
                      {item.badge}
                    </span>

                    <div className="relative flex h-full flex-col justify-between">
                      {/* Icon */}
                      <div className="flex mb-4 p-8 h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-3xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>

                      {/* Title */}
                      <div>
                        <h4 className="text-sm font-semibold text-white leading-snug transition-colors duration-300 group-hover:text-[#FF0055]">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Facts & Fan Power */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Facts */}
          <div className="lg:col-span-8 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🏥</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Quick Facts</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Age", val: "28", icon: <User className="w-4 h-4 text-pink-400" /> },
                { label: "Height", val: "1.86 m", icon: <TrendingUp className="w-4 h-4 text-orange-400" /> },
                { label: "Weight", val: "86 kg", icon: <Zap className="w-4 h-4 text-yellow-400" /> },
                { label: "Birthplace", val: "Khandra, Haryana", icon: <MapPin className="w-4 h-4 text-emerald-400" /> },
                { label: "Hand", val: "Right Hand", icon: <Calendar className="w-4 h-4 text-cyan-400" /> },
                { label: "Coach", val: "Jan Železný", icon: <Award className="w-4 h-4 text-[#FFD700]" /> },
              ].map((fact, idx) => (
                <div key={idx} className="bg-black/35 rounded-2xl p-3 border border-white/5 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 shrink-0 mt-0.5">{fact.icon}</div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-gray-500 font-semibold uppercase">{fact.label}</span>
                    <span className="block text-xs font-bold text-white truncate">{fact.val}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Badges Carousel / List */}
            <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/5">
              {["Olympic Champion", "World Champion", "Asian Champion", "CWG Gold", "Diamond League Winner"].map(
                (badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full flex items-center gap-1"
                  >
                    🥇 {badge}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Fan Power Card */}
          <div className="lg:col-span-4 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">😈</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Fan Power</h3>
                </div>
                <span className="w-5.5 h-5.5 rounded-full bg-white/5 inline-flex items-center justify-center text-xs text-gray-400 font-bold hover:bg-white/10 cursor-pointer">
                  i
                </span>
              </div>

              {/* Radial Progress Graphic */}
              <div className="relative flex flex-col items-center justify-center my-6">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="url(#fanPowerGrad)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={376.8}
                    strokeDashoffset={376.8 * (1 - 98 / 100)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="fanPowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF0055" />
                      <stop offset="100%" stopColor="#FF7A00" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Score overlay */}
                <div className="absolute text-center">
                  <span className="block text-3xl font-black text-white leading-none">98</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">/ 100</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <span className="block text-xs font-semibold text-gray-300">Fan Impact Score</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                ▲ 14% <span className="text-gray-400 font-medium text-[10px]">this month</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2026 Season & Performance Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 2026 Season */}
          <div className="lg:col-span-5 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">2026 Season</h3>
                <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main dashboard list */}
              <div className="grid grid-cols-4 gap-2 mb-4 bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
                <div>
                  <span className="block text-[10px] text-gray-400 font-medium">Events</span>
                  <span className="text-lg font-black text-white">8</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-medium">Gold</span>
                  <span className="text-lg font-black text-yellow-400">5</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-medium">Silver</span>
                  <span className="text-lg font-black text-gray-300">2</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-medium">Bronze</span>
                  <span className="text-lg font-black text-amber-600">1</span>
                </div>
              </div>

              {/* Extra season metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs font-semibold text-gray-300">Season Best</span>
                  <span className="text-xs font-bold text-white">88.94 m</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs font-semibold text-gray-300">Average Throw</span>
                  <span className="text-xs font-bold text-white">87.72 m</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs font-semibold text-gray-300">Current Streak</span>
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                    4 Podiums 🔥
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Trend */}
          <div className="lg:col-span-7 bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Performance Trend</h3>
              <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-[180px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0055" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF0055" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    stroke="#4B5563"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[85, 92]}
                    stroke="#4B5563"
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#181829",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#FFF",
                    }}
                    labelStyle={{ fontSize: "11px", fontWeight: "bold" }}
                    itemStyle={{ fontSize: "11px", color: "#FF0055" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="distance"
                    stroke="#FF0055"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDistance)"
                    dot={{ fill: "#FF0055", stroke: "#FFF", strokeWidth: 1.5, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Personal Best Progress (meters)
            </div>
          </div>
        </div>

        {/* Medal Cabinet */}
        <div className="bg-[#12121e]/80 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400">Medal Cabinet</h3>
            <button className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-semibold">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            {/* Left arrow – mobile only */}
            <button
              onClick={() => scroll(medalScrollRef, "left")}
              className="sm:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Right arrow – mobile only */}
            <button
              onClick={() => scroll(medalScrollRef, "right")}
              className="sm:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:bg-[#FF0055]/80 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div
              ref={medalScrollRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 md:grid-cols-6 sm:overflow-visible"
            >
              {[
                { title: "Olympics Gold", year: "2021", icon: "🥇", color: "from-yellow-400/20 to-amber-500/20", text: "text-yellow-400" },
                { title: "Olympics Silver", year: "2024", icon: "🥈", color: "from-slate-300/20 to-zinc-400/20", text: "text-slate-300" },
                { title: "World Champ Gold", year: "2023", icon: "🏆", color: "from-yellow-400/20 to-amber-500/20", text: "text-yellow-400" },
                { title: "Asian Games Gold", year: "2018", icon: "🥇", color: "from-yellow-400/20 to-amber-500/20", text: "text-yellow-400" },
                { title: "CWG Gold", year: "2022", icon: "🥇", color: "from-yellow-400/20 to-amber-500/20", text: "text-yellow-400" },
                { title: "Diamond League Winner", year: "2022", icon: "💎", color: "from-cyan-400/20 to-blue-500/20", text: "text-cyan-400" },
              ].map((medal, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br ${medal.color} border border-white/5 text-center snap-start min-w-[120px] shrink-0 sm:min-w-0 sm:shrink`}
                >
                  <span className="text-2xl mb-1.5">{medal.icon}</span>
                  <span className={`block text-[10px] font-extrabold ${medal.text} leading-tight h-8 flex items-center justify-center`}>
                    {medal.title}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-bold mt-1">{medal.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
