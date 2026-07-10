// "use client";

// import { ArrowLeft, Search, Calendar, RefreshCw, X } from "lucide-react";
// import Link from "next/link";
// import React, { useEffect, useState, useCallback } from "react";

// // ─── Types (mirrors the Cloudinary JSON schema) ────────────────────────────────

// interface PulseMeta {
//   title: string;
//   subtitle: string;
//   summary: string;
// }

// interface MatchTeam {
//   name: string;
//   short: string;
//   score: string;
//   overs: number;
//   result: "won" | "lost";
// }

// interface MatchResult {
//   match_number: number;
//   date: string;
//   venue: string;
//   team1: MatchTeam;
//   team2: MatchTeam;
//   result: string;
//   note: string;
//   player_of_match: string;
// }

// interface Tonight {
//   match_number: number;
//   teams: string;
//   venue: string;
//   time: string;
//   context: string;
//   badge: string;
// }

// interface KPI {
//   value: string;
//   label: string;
//   sub: string;
//   color?: string;
// }

// interface Quote {
//   text: string;
//   speaker: string;
//   role: string;
//   context?: string;
//   sentiment?: string;
//   badge?: string;
//   badgeClass?: string;
// }

// interface PointsRow {
//   rank: number;
//   team: string;
//   played: number;
//   won: number;
//   points: number;
//   form: string[];
//   playoff_zone: boolean;
//   eliminated: boolean;
//   color?: string;
// }

// interface SearchItem {
//   rank: number;
//   query: string;
//   heat: "hot" | "warm" | "normal";
// }

// interface FanTrend {
//   rank: number;
//   trend: string;
//   sentiment?: string;
//   badge?: string;
//   badgeClass?: string;
//   platform?: string[];
// }

// interface Ad {
//   brand: string;
//   product?: string | null;
//   status?: string;
//   tier?: string | null;
//   detail: string;
//   tierClass?: string;
// }

// interface LangConsumption {
//   rank?: number;
//   language: string;
//   share_pct: number;
//   note: string;
//   platform?: string;
//   color?: string;
//   gradientTo?: string;
// }

// interface AdVolume {
//   label: string;
//   pct: number;
//   color: string;
// }

// interface Meme {
//   rank: number;
//   text?: string;
//   description?: string;
//   meta?: string;
//   platform?: string;
//   vibe?: string;
//   verified_source?: string;
// }

// interface MostLiked {
//   rank?: number;
//   text?: string;
//   description?: string;
//   meta?: string;
//   source?: string;
//   platform?: string[];
//   engagement?: string;
//   accent?: string;
// }

// interface Article {
//   rank: number;
//   source: string;
//   tag: string;
//   tagClass?: string;
//   title: string;
//   summary: string;
//   url: string;
//   linkColor?: string;
//   accent?: string;
// }

// interface Signal {
//   num?: string;
//   rank?: number;
//   title: string;
//   description?: string;
//   desc?: string;
//   accent?: string;
//   theme?: string;
//   teams?: string[];
// }

// interface PulseData {
//   report_date: string;
//   meta: PulseMeta;
//   match_result: MatchResult;
//   tonight: Tonight;
//   kpis: KPI[];
//   quotes: Quote[];
//   points_table: PointsRow[];
//   top_searches: SearchItem[];
//   fan_trends: FanTrend[];
//   ads: Ad[];
//   languages?: LangConsumption[];
//   language_consumption?: LangConsumption[];
//   ad_volume?: AdVolume[];
//   memes: Meme[];
//   most_liked?: MostLiked[];
//   most_liked_posts?: MostLiked[];
//   articles: Article[];
//   signals: Signal[];
//   sources: string[];
// }

// interface PulseFileMeta {
//   id: string;
//   fileName: string;
//   url: string;
//   reportDate: string | null;
//   reportDateFormatted: string | null;
// }

// // ─── KPI accent colours (fallback palette when JSON has no .color) ─────────────

// const KPI_COLORS = ["#4a9eff", "#C41E1E", "#FFD84A", "#2bdd8c"];

// // ─── Team brand colours ────────────────────────────────────────────────────────

// const TEAM_COLORS: Record<string, string> = {
//   RCB: "#cc0000", SRH: "#f26522", GT: "#1d4e9b", PBKS: "#dd4444",
//   CSK: "#f9cd05", RR: "#254aa5", DC: "#2561ae", KKR: "#3a225d",
//   MI: "#004c93", LSG: "#a5c8e1",
// };

// // ─── Badge ─────────────────────────────────────────────────────────────────────

// type BadgeClass = "red" | "green" | "gold" | "blue" | "orange" | "neutral";

// const BADGE_STYLES: Record<BadgeClass, string> = {
//   red:     "bg-[rgba(196,30,30,0.12)] text-[#C41E1E] border border-[rgba(196,30,30,0.2)]",
//   green:   "bg-[rgba(43,221,140,0.12)] text-[#2bdd8c] border border-[rgba(43,221,140,0.2)]",
//   gold:    "bg-[rgba(255,216,74,0.12)] text-[#FFD84A] border border-[rgba(255,216,74,0.2)]",
//   blue:    "bg-[rgba(74,158,255,0.12)] text-[#4a9eff] border border-[rgba(74,158,255,0.2)]",
//   orange:  "bg-[rgba(255,107,43,0.12)] text-[#ff6b2b] border border-[rgba(255,107,43,0.2)]",
//   neutral: "bg-[rgba(255,255,255,0.06)] text-[#8888a2] border border-[rgba(255,255,255,0.07)]",
// };

// /** Infer badge class from sentiment / status strings when explicit class is missing */
// function inferBadgeClass(raw?: string): BadgeClass {
//   if (!raw) return "neutral";
//   const s = raw.toLowerCase();
//   if (["hot", "brutal", "blunt", "meme fuel", "record fever", "vindicated"].some(k => s.includes(k))) return "red";
//   if (["positive", "high praise", "composed", "admiration", "campaign", "new favourite"].some(k => s.includes(k))) return "green";
//   if (["gold", "building", "honest", "poised", "tactical", "warn"].some(k => s.includes(k))) return "gold";
//   if (["blue", "ongoing", "digital", "adtech"].some(k => s.includes(k))) return "blue";
//   if (["orange", "viral", "warm"].some(k => s.includes(k))) return "orange";
//   return "neutral";
// }

// function Badge({ label, cls }: { label: string; cls?: BadgeClass | string }) {
//   const resolved = (cls as BadgeClass) in BADGE_STYLES ? (cls as BadgeClass) : inferBadgeClass(cls);
//   return (
//     <span className={`font-mono text-[9px] tracking-[0.07em] uppercase px-2 py-[2px] rounded-[10px] font-medium whitespace-nowrap ${BADGE_STYLES[resolved]}`}>
//       {label}
//     </span>
//   );
// }

// // ─── Layout helpers ────────────────────────────────────────────────────────────

// function SectionHeader({ title, sub }: { title: string; sub?: string }) {
//   return (
//     <div className="flex flex-wrap items-baseline gap-2 md:gap-3 mb-3 mt-5 md:mt-7">
//       <h2 className="font-['Bebas_Neue'] text-lg md:text-xl tracking-[0.05em] whitespace-nowrap text-[#eeedf0]">{title}</h2>
//       <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)] min-w-[30px]" />
//       {sub && <span className="font-mono text-[9px] text-[#50506a] tracking-[0.1em] uppercase whitespace-nowrap">{sub}</span>}
//     </div>
//   );
// }

// function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
//   return (
//     <div className={`bg-[#101016] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 md:p-[18px] relative overflow-hidden ${className}`}>
//       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.13)] to-transparent" />
//       {children}
//     </div>
//   );
// }

// function CardLabel({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] uppercase text-[#50506a] mb-3">
//       {children}
//       <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
//     </div>
//   );
// }

// // ─── Skeleton loader ───────────────────────────────────────────────────────────

// function Skeleton({ className = "" }: { className?: string }) {
//   return <div className={`bg-[rgba(255,255,255,0.05)] rounded animate-pulse ${className}`} />;
// }

// function PulseSkeleton() {
//   return (
//     <div className="flex flex-col gap-4">
//       <Skeleton className="h-24 w-full" />
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//         {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
//       </div>
//       <Skeleton className="h-64 w-full" />
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <Skeleton className="h-80" />
//         <Skeleton className="h-80" />
//       </div>
//     </div>
//   );
// }

// // ─── Filter bar ────────────────────────────────────────────────────────────────

// interface FilterBarProps {
//   searchText: string;
//   onSearchChange: (v: string) => void;
//   selectedDate: string;
//   onDateChange: (v: string) => void;
//   availableDates: PulseFileMeta[];
//   onDateFileSelect: (url: string) => void;
//   onClear: () => void;
//   loading: boolean;
// }

// function FilterBar({
//   searchText, onSearchChange,
//   selectedDate, onDateChange, availableDates, onDateFileSelect,
//   onClear, loading,
// }: FilterBarProps) {
//   return (
//     <div className="flex flex-wrap gap-2 mb-5 md:mb-6">
//       {/* Text search */}
//       <div className="relative flex-1 min-w-[180px]">
//         <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#50506a]" />
//         <input
//           type="text"
//           value={searchText}
//           onChange={(e) => onSearchChange(e.target.value)}
//           placeholder="Search signals, teams, players…"
//           className="w-full bg-[#101016] border border-[rgba(255,255,255,0.09)] rounded-[20px] pl-8 pr-3 py-2 text-xs text-[#eeedf0] placeholder:text-[#50506a] focus:outline-none focus:border-[rgba(255,255,255,0.22)] transition-colors"
//         />
//       </div>

//       {/* Date / archive picker */}
//       <div className="relative">
//         <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#50506a]" />
//         <select
//           value={selectedDate}
//           onChange={(e) => {
//             const val = e.target.value;
//             onDateChange(val);
//             const file = availableDates.find(f => f.reportDate === val || f.id === val);
//             if (file) onDateFileSelect(file.url);
//           }}
//           className="appearance-none bg-[#101016] border border-[rgba(255,255,255,0.09)] rounded-[20px] pl-8 pr-6 py-2 text-xs text-[#eeedf0] focus:outline-none focus:border-[rgba(255,255,255,0.22)] transition-colors cursor-pointer"
//         >
//           <option value="">Latest report</option>
//           {availableDates.map(f => (
//             <option key={f.id} value={f.reportDate || f.id}>
//               {f.reportDateFormatted || f.fileName}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Clear */}
//       {(searchText || selectedDate) && (
//         <button
//           onClick={onClear}
//           className="flex items-center gap-1.5 bg-[#101016] border border-[rgba(255,255,255,0.09)] rounded-[20px] px-3 py-2 text-xs text-[#8888a2] hover:text-[#eeedf0] transition-colors"
//         >
//           <X size={12} /> Clear
//         </button>
//       )}

//       {/* Refresh spinner */}
//       {loading && (
//         <div className="flex items-center gap-1.5 text-[#50506a] text-[10px] font-mono ml-auto">
//           <RefreshCw size={12} className="animate-spin" /> Loading…
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Main component ────────────────────────────────────────────────────────────

// export default function IPLPulse() {
//   const [data, setData] = useState<PulseData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [availableDates, setAvailableDates] = useState<PulseFileMeta[]>([]);
//   const [searchText, setSearchText] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");

//   // ── Fetch helpers ────────────────────────────────────────────────────────────

//   const fetchLatest = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/cloudinary/iplpulse?mode=latest");
//       const json = await res.json();
//       if (!json.success) throw new Error(json.error || "Failed to load");
//       setData(json.data as PulseData);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Unknown error");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const fetchByUrl = useCallback(async (url: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Fetch the raw Cloudinary URL directly from the browser
//       const res = await fetch(url);
//       const json = await res.json();
//       setData(json as PulseData);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Unknown error");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const fetchAvailableDates = useCallback(async () => {
//     try {
//       const res = await fetch("/api/cloudinary/iplpulse?mode=list");
//       const json = await res.json();
//       if (json.success) {
//         // Exclude the ipl_pulse_latest.json from the date picker (it has no reportDate)
//         const dated = (json.files as PulseFileMeta[]).filter(f => !!f.reportDate);
//         setAvailableDates(dated);
//       }
//     } catch {
//       // non-critical — silently ignore
//     }
//   }, []);

//   useEffect(() => {
//     fetchLatest();
//     fetchAvailableDates();
//   }, [fetchLatest, fetchAvailableDates]);

//   // ── Clear filters ────────────────────────────────────────────────────────────

//   const handleClear = () => {
//     setSearchText("");
//     setSelectedDate("");
//     fetchLatest();
//   };

//   // ── Derived: filter searches and signals by searchText ───────────────────────

//   const filteredSearches = data
//     ? data.top_searches.filter(s => !searchText || s.query.toLowerCase().includes(searchText.toLowerCase()))
//     : [];

//   const filteredSignals = data
//     ? data.signals.filter(s => !searchText || s.title.toLowerCase().includes(searchText.toLowerCase()) || (s.description || s.desc || "").toLowerCase().includes(searchText.toLowerCase()) || (s.teams || []).some(t => t.toLowerCase().includes(searchText.toLowerCase())))
//     : [];

//   const filteredArticles = data
//     ? data.articles.filter(a => !searchText || a.title.toLowerCase().includes(searchText.toLowerCase()) || a.summary.toLowerCase().includes(searchText.toLowerCase()) || a.source.toLowerCase().includes(searchText.toLowerCase()))
//     : [];

//   // ── Normalise arrays that have two naming conventions in JSON ─────────────────

//   const languages = data?.languages || data?.language_consumption || [];
//   const mostLiked = data?.most_liked || data?.most_liked_posts || [];

//   const LANG_COLORS = [
//     { color: "#4a9eff", gradientTo: "#2277cc" },
//     { color: "#ffd94a", gradientTo: "#cc9900" },
//     { color: "#2bdd8c", gradientTo: "#119960" },
//   ];

//   const AD_VOLUME_COLORS: Record<string, string> = {
//     "Fintech/Ecomm": "#4a9eff",
//     "FMCG/Auto": "#a87eff",
//     "AI brands": "#ff6b2b",
//     Others: "#555",
//   };

//   const SIGNAL_ACCENTS = ["#4a9eff", "#C41E1E", "#FFD84A", "#2bdd8c", "#a87eff"];
//   const ARTICLE_ACCENTS = ["#4a9eff", "#2bdd8c", "#FFD84A", "#ff6b2b", "#a87eff"];
//   const LIKED_ACCENTS = ["#a87eff", "#4a9eff", "#2bdd8c", "#FFD84A", "#C41E1E"];

//   // ── Render ───────────────────────────────────────────────────────────────────

//   return (
//     <div className="bg-[#09090e] min-h-screen mt-10 text-[#eeedf0] font-['DM_Sans',sans-serif] text-sm leading-relaxed">
//       <Link href="/MainModules/HomePage">
//         <button className="flex items-center gap-2 text-gray-400 hover:text-white -mb-4 lg:mb-4 pt-4 ml-4 transition cursor-pointer">
//           <ArrowLeft size={18} />
//           <span className="text-sm">Back</span>
//         </button>
//       </Link>

//       {/* Google Fonts */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');
//         @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
//         .live-pip::before { content:''; display:inline-block; width:6px; height:6px; border-radius:50%; background:#2bdd8c; margin-right:5px; animation:blink 1.8s ease infinite; vertical-align:middle; }
//         .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
//       `}</style>

//       <div className="w-full max-w-[1300px] mx-auto px-3 sm:px-4 md:px-6 pb-12 md:pb-16">

//         {/* ── HEADER ── */}
//         <div className="pt-5 md:pt-7 pb-4 border-b border-[rgba(255,255,255,0.07)] flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 md:mb-6">
//           <div>
//             <div className="font-mono text-[9px] text-[#C41E1E] tracking-[0.16em] uppercase mb-1">SportsFan360 — Intelligence Dashboard</div>
//             <h1 className="font-['Bebas_Neue'] text-[clamp(32px,8vw,52px)] leading-none tracking-[0.02em]">
//               IPL 2026 <span className="text-[#C41E1E]">PULSE</span>
//             </h1>
//             <div className="text-[11px] text-[#8888a2] mt-1 flex flex-wrap gap-1 items-center">
//               {data ? (
//                 <>
//                   <span>{data.meta.subtitle}</span>
//                   <span>·</span>
//                   <span>{new Date(data.report_date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
//                 </>
//               ) : (
//                 <Skeleton className="h-4 w-64" />
//               )}
//             </div>
//           </div>
//           {data && (
//             <div className="flex flex-col sm:items-end gap-2">
//               <span className="live-pip font-mono text-[9px] text-[#2bdd8c] tracking-[0.1em] uppercase">Live Season · Match {data.tonight.match_number} Tonight</span>
//               <div className="bg-[#16161e] border border-[rgba(255,255,255,0.13)] rounded-[20px] px-2.5 py-1.5 text-[11px] text-[#FFD84A] flex flex-wrap items-center gap-1.5">
//                 {data.tonight.teams.split(" vs ")[0]} vs {data.tonight.teams.split(" vs ")[1]}
//                 <span className="text-[#8888a2] text-[10px]">{data.tonight.venue.split(",")[1]?.trim()} · {data.tonight.time}</span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ── FILTER BAR ── */}
//         <FilterBar
//           searchText={searchText}
//           onSearchChange={setSearchText}
//           selectedDate={selectedDate}
//           onDateChange={setSelectedDate}
//           availableDates={availableDates}
//           onDateFileSelect={fetchByUrl}
//           onClear={handleClear}
//           loading={loading}
//         />

//         {/* ── ERROR ── */}
//         {error && (
//           <div className="bg-[rgba(196,30,30,0.1)] border border-[rgba(196,30,30,0.3)] rounded-xl p-4 mb-6 text-sm text-[#C41E1E] flex items-center justify-between">
//             <span>Failed to load pulse data: {error}</span>
//             <button onClick={fetchLatest} className="text-xs underline ml-4">Retry</button>
//           </div>
//         )}

//         {/* ── LOADING SKELETON ── */}
//         {loading && !data && <PulseSkeleton />}

//         {/* ── CONTENT ── */}
//         {data && (
//           <>
//             {/* SEARCH EMPTY STATE */}
//             {searchText && filteredSignals.length === 0 && filteredArticles.length === 0 && (
//               <div className="text-center py-12 text-[#50506a]">
//                 <div className="font-['Bebas_Neue'] text-3xl mb-2">No results</div>
//                 <div className="text-xs">No signals or articles matched &ldquo;{searchText}&rdquo;</div>
//               </div>
//             )}

//             {/* ── YESTERDAY'S MATCH ── */}
//             {!searchText && (
//               <>
//                 <SectionHeader title="Yesterday's Match" sub={`Match ${data.match_result.match_number} · ${data.match_result.date} · ${data.match_result.venue.split(",").slice(-1)[0].trim()}`} />
//                 <div className="bg-[#16161e] border border-[rgba(255,255,255,0.07)] rounded-xl px-3 sm:px-4 py-3.5 relative overflow-hidden mb-3.5">
//                   <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2561ae] to-[#4a9eff]" />
//                   <div className="font-mono text-[8px] text-[#50506a] uppercase tracking-[0.1em] mb-2">
//                     Match {data.match_result.match_number} · {data.match_result.venue} · {data.match_result.date}
//                   </div>
//                   <div className="flex flex-wrap items-center gap-2 mb-2">
//                     <div>
//                       <div className="font-['Bebas_Neue'] text-xl leading-none">{data.match_result.team1.score}</div>
//                       <div className="font-mono text-[9px] text-[#50506a] uppercase">{data.match_result.team1.short} ({data.match_result.team1.overs} ov)</div>
//                     </div>
//                     <div className="text-[10px] text-[#50506a]">{data.match_result.team1.result === "won" ? "beat" : "lost to"}</div>
//                     <div>
//                       <div className="font-['Bebas_Neue'] text-xl leading-none">{data.match_result.team2.score}</div>
//                       <div className="font-mono text-[9px] text-[#50506a] uppercase">{data.match_result.team2.short} ({data.match_result.team2.overs} ov)</div>
//                     </div>
//                     <span className="font-mono text-[9px] px-2 py-[3px] rounded-md text-[#2bdd8c] bg-[rgba(43,221,140,0.1)] border border-[rgba(43,221,140,0.2)]">
//                       {data.match_result.result}
//                     </span>
//                   </div>
//                   <div className="text-[11px] text-[#8888a2] leading-relaxed">{data.match_result.note}</div>
//                   <div className="mt-2 font-mono text-[10px] text-[#FFD84A]">Player of the Match: {data.match_result.player_of_match}</div>
//                 </div>

//                 {/* ── TONIGHT ── */}
//                 <div className="bg-gradient-to-br from-[rgba(255,107,43,0.08)] to-[rgba(255,216,74,0.05)] border border-[rgba(255,107,43,0.2)] rounded-xl px-3 sm:px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
//                   <div>
//                     <div className="font-mono text-[8px] text-[#ff6b2b] uppercase tracking-[0.1em] mb-1">Tonight · Match {data.tonight.match_number} · Must Watch</div>
//                     <div className="text-sm sm:text-base font-medium">{data.tonight.teams}</div>
//                     <div className="text-[10px] text-[#8888a2] mt-0.5">{data.tonight.venue} · {data.tonight.time} · {data.tonight.context}</div>
//                   </div>
//                   <div className="font-mono text-[10px] bg-[rgba(255,107,43,0.12)] text-[#ff6b2b] border border-[rgba(255,107,43,0.25)] rounded-lg px-2.5 py-1.5 whitespace-nowrap text-center">
//                     {data.tonight.badge}
//                   </div>
//                 </div>

//                 {/* ── KPIs ── */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//                   {data.kpis.map((k, i) => {
//                     const color = k.color || KPI_COLORS[i % KPI_COLORS.length];
//                     return (
//                       <div key={i} className="bg-[#101016] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 md:p-[18px] relative overflow-hidden hover:border-[rgba(255,255,255,0.13)] transition-colors">
//                         <div className="font-['Bebas_Neue'] text-4xl sm:text-5xl leading-none" style={{ color }}>{k.value}</div>
//                         <div className="text-[11px] text-[#8888a2] leading-snug mt-0.5">{k.label}</div>
//                         <div className="font-mono text-[9px] text-[#50506a] mt-1">{k.sub}</div>
//                         <div className="absolute bottom-[-10px] right-[-10px] w-14 h-14 rounded-full opacity-[0.07]" style={{ background: color }} />
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {/* ── QUOTES + STANDINGS ── */}
//                 <SectionHeader title="Analyst & Player Voice" sub={`Verified · ${data.report_date}`} />
//                 <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3.5 mb-2">

//                   {/* Quotes */}
//                   <Card>
//                     <CardLabel>What they said</CardLabel>
//                     <div className="flex flex-col gap-2.5">
//                       {data.quotes.map((q, i) => {
//                         const badgeCls = q.badgeClass || inferBadgeClass(q.sentiment);
//                         const accentMap: Record<BadgeClass, string> = { red: "#C41E1E", green: "#2bdd8c", gold: "#FFD84A", blue: "#4a9eff", orange: "#ff6b2b", neutral: "#50506a" };
//                         const accent = accentMap[badgeCls as BadgeClass] || "#50506a";
//                         const badgeLabel = q.badge || q.sentiment || "insight";
//                         return (
//                           <div key={i} className="border-l-2 pl-3 py-2 bg-[#16161e] rounded-r-lg" style={{ borderLeftColor: accent }}>
//                             <p className="text-[12px] sm:text-[13px] text-[#eeedf0] leading-relaxed mb-1.5">&apos;{q.text}&apos;</p>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <span className="text-[10px] text-[#50506a] flex-1">{q.speaker}, {q.role}{q.context ? ` · ${q.context}` : ""}</span>
//                               <Badge label={badgeLabel} cls={badgeCls} />
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </Card>

//                   {/* Points Table */}
//                   <Card>
//                     <CardLabel>Points table · {data.report_date}</CardLabel>
//                     <div className="table-container overflow-x-auto">
//                       <table className="w-full border-collapse min-w-[360px]">
//                         <thead>
//                           <tr>
//                             {["Team","M","W","Pts","Form"].map(h => (
//                               <th key={h} className={`font-mono text-[8px] tracking-[0.1em] uppercase text-[#50506a] pb-2 border-b border-[rgba(255,255,255,0.07)] ${h === "Team" ? "text-left pr-2" : "text-center"}`}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {data.points_table.map((row) => {
//                             const color = row.color || TEAM_COLORS[row.team] || "#8888a2";
//                             return (
//                               <tr key={row.rank} className={`hover:bg-[#16161e] ${row.eliminated ? "opacity-40" : ""} ${row.playoff_zone ? "bg-[rgba(196,30,30,0.02)]" : ""}`}>
//                                 <td className="py-2 pr-2 border-b border-[rgba(255,255,255,0.07)]">
//                                   <div className="flex items-center gap-1.5">
//                                     <span className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: color }} />
//                                     <span className={`text-[12px] font-medium ${row.playoff_zone ? "text-[#2bdd8c]" : "text-[#eeedf0]"}`}>{row.team}</span>
//                                   </div>
//                                 </td>
//                                 <td className="py-2 text-center border-b border-[rgba(255,255,255,0.07)] text-[12px] text-[#8888a2]">{row.played}</td>
//                                 <td className="py-2 text-center border-b border-[rgba(255,255,255,0.07)] text-[12px] text-[#8888a2]">{row.won}</td>
//                                 <td className="py-2 text-center border-b border-[rgba(255,255,255,0.07)]">
//                                   <span className={`bg-[#16161e] rounded px-1.5 py-[2px] font-mono text-[10px] font-medium ${row.eliminated ? "text-[#C41E1E]" : row.playoff_zone ? "text-[#2bdd8c]" : "text-[#8888a2]"}`}>{row.points}</span>
//                                 </td>
//                                 <td className="py-2 text-center border-b border-[rgba(255,255,255,0.07)]">
//                                   <div className="flex items-center justify-center gap-[2px]">
//                                     {row.form.map((f, fi) => (
//                                       <span key={fi} className={`inline-block w-2 h-2 rounded-[2px] ${f === "W" ? "bg-[#2bdd8c]" : "bg-[#C41E1E]"}`} />
//                                     ))}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                     <div className="mt-2 text-[9px] text-[#50506a]">🟢 Playoff zone · ❌ Eliminated · Form: last 5</div>
//                     <div className="mt-2 px-2 py-2 bg-[rgba(255,107,43,0.08)] rounded-md border border-[rgba(255,107,43,0.2)] text-[10px] text-[#ff6b2b]">Tonight: {data.tonight.badge}</div>
//                   </Card>
//                 </div>

//                 {/* ── SEARCH + FAN TRENDS ── */}
//                 <SectionHeader title="Search & Fan Trends" />
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-2">

//                   {/* Searches */}
//                   <Card>
//                     <CardLabel>Top {data.top_searches.length} searches · {data.report_date}</CardLabel>
//                     {filteredSearches.length === 0 ? (
//                       <div className="text-[11px] text-[#50506a] py-4 text-center">No searches matched &ldquo;{searchText}&rdquo;</div>
//                     ) : (
//                       <div className="flex flex-wrap gap-1.5">
//                         {filteredSearches.map((s) => {
//                           const numCls = s.heat === "hot"
//                             ? "bg-[rgba(196,30,30,0.2)] text-[#C41E1E]"
//                             : s.heat === "warm"
//                             ? "bg-[rgba(255,216,74,0.15)] text-[#FFD84A]"
//                             : "bg-[#1c1c26] text-[#50506a]";
//                           return (
//                             <span key={s.rank} className="inline-flex items-center gap-1 bg-[#16161e] border border-[rgba(255,255,255,0.07)] rounded-[20px] px-2 sm:px-3 py-1 text-[11px] text-[#eeedf0]">
//                               <span className={`font-mono text-[8px] rounded-full w-[16px] h-[16px] flex items-center justify-center flex-shrink-0 ${numCls}`}>{s.rank}</span>
//                               {s.query}
//                             </span>
//                           );
//                         })}
//                       </div>
//                     )}
//                     <div className="text-[9px] text-[#50506a] mt-2.5">Verified from ESPNcricinfo, Tribune India, Business Standard, CricketAddictor.</div>
//                   </Card>

//                   {/* Fan Trends */}
//                   <Card>
//                     <CardLabel>Leading fan trends</CardLabel>
//                     {data.fan_trends.map((t, i) => {
//                       const label = t.badge || t.sentiment || "trend";
//                       const cls = t.badgeClass || inferBadgeClass(t.sentiment);
//                       return (
//                         <div key={i} className={`flex flex-col sm:flex-row sm:items-center gap-2 py-2.5 ${i < data.fan_trends.length - 1 ? "border-b border-[rgba(255,255,255,0.07)]" : ""}`}>
//                           <div className="flex items-center gap-2.5 w-full sm:w-auto">
//                             <div className="font-mono text-[9px] text-[#50506a] w-5 flex-shrink-0">{String(t.rank).padStart(2, "0")}</div>
//                             <div className="text-[12px] text-[#eeedf0] flex-1 leading-snug">{t.trend}</div>
//                           </div>
//                           <div className="ml-auto sm:ml-0"><Badge label={label} cls={cls} /></div>
//                         </div>
//                       );
//                     })}
//                   </Card>
//                 </div>

//                 {/* ── ADS + LANGUAGE ── */}
//                 <SectionHeader title="Brand Ads & Language Reach" />
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-2">

//                   {/* Ads */}
//                   <Card>
//                     <CardLabel>Tech & AI brand advertising · IPL 2026</CardLabel>
//                     <div className="flex flex-col gap-2">
//                       {data.ads.map((ad, i) => {
//                         const tierCls = ad.tierClass
//                           || (ad.status === "confirmed" ? "blue"
//                           : ad.status === "unconfirmed" ? "neutral"
//                           : "red");
//                         const tierLabel = ad.tier || ad.status || "unknown";
//                         return (
//                           <div key={i} className="bg-[#16161e] border border-[rgba(255,255,255,0.07)] rounded-[10px] p-3">
//                             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-1">
//                               <div className="text-[12px] font-medium text-[#eeedf0]">
//                                 {ad.brand}{ad.product ? ` · ${ad.product}` : ""}
//                               </div>
//                               <Badge label={tierLabel} cls={tierCls as BadgeClass} />
//                             </div>
//                             <div className="text-[11px] text-[#8888a2] leading-relaxed">{ad.detail}</div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </Card>

//                   {/* Language + Ad Volume */}
//                   <Card>
//                     <CardLabel>Top {languages.length} consumption languages</CardLabel>
//                     <div className="flex flex-col gap-3.5">
//                       {languages.map((l, i) => {
//                         const { color, gradientTo } = l.color ? { color: l.color, gradientTo: l.gradientTo || l.color } : LANG_COLORS[i % LANG_COLORS.length];
//                         const maxPct = Math.max(...languages.map(x => x.share_pct), 1);
//                         return (
//                           <div key={i}>
//                             <div className="flex justify-between items-baseline mb-1.5">
//                               <span className="text-[12px] font-medium">{l.language}</span>
//                               <span className="font-['Bebas_Neue'] text-xl text-[#8888a2]">~{l.share_pct}%</span>
//                             </div>
//                             <div className="h-1 bg-[#1c1c26] rounded-full overflow-hidden">
//                               <div className="h-full rounded-full" style={{ width: `${(l.share_pct / maxPct) * 100}%`, background: `linear-gradient(90deg,${color},${gradientTo})` }} />
//                             </div>
//                             <div className="text-[10px] text-[#50506a] mt-1">{l.note}</div>
//                           </div>
//                         );
//                       })}
//                     </div>

//                     {data.ad_volume && (
//                       <div className="mt-4">
//                         <CardLabel>Ad volume share</CardLabel>
//                         <div className="flex flex-col gap-1.5">
//                           {data.ad_volume.map((av, i) => {
//                             const maxAv = Math.max(...data.ad_volume!.map(x => x.pct), 1);
//                             return (
//                               <div key={i} className="flex items-center gap-2">
//                                 <div className="text-[11px] text-[#8888a2] w-[90px] flex-shrink-0">{av.label}</div>
//                                 <div className="flex-1 h-[5px] bg-[#1c1c26] rounded-full overflow-hidden">
//                                   <div className="h-full rounded-full" style={{ width: `${(av.pct / maxAv) * 100}%`, background: av.color || AD_VOLUME_COLORS[av.label] || "#555" }} />
//                                 </div>
//                                 <div className="font-mono text-[9px] text-[#8888a2] w-9 text-right">~{av.pct}%</div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     )}
//                   </Card>
//                 </div>

//                 {/* ── MEMES + MOST LIKED ── */}
//                 <SectionHeader title="Memes & Most Liked" />
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-2">

//                   {/* Memes */}
//                   <Card>
//                     <CardLabel>Top {data.memes.length} memes · {data.report_date}</CardLabel>
//                     <div className="flex flex-col gap-2">
//                       {data.memes.map((m, i) => {
//                         const body = m.text || m.description || "";
//                         const meta = m.meta || [m.platform, m.vibe, m.verified_source].filter(Boolean).join(" · ");
//                         return (
//                           <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#16161e] rounded-[10px] border border-[rgba(255,255,255,0.07)]">
//                             <div className="font-['Bebas_Neue'] text-2xl text-[#50506a] leading-none flex-shrink-0 w-[22px] opacity-35">{String(m.rank).padStart(2, "0")}</div>
//                             <div>
//                               <div className="text-[12px] text-[#eeedf0] leading-relaxed mb-1">{body}</div>
//                               <div className="text-[10px] text-[#50506a]">{meta}</div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </Card>

//                   {/* Most Liked */}
//                   <Card>
//                     <CardLabel>Top {mostLiked.length} most liked posts · last 24 hrs</CardLabel>
//                     <div className="flex flex-col gap-2">
//                       {mostLiked.map((l, i) => {
//                         const body = l.text || l.description || "";
//                         const meta = l.meta || [l.source, Array.isArray(l.platform) ? l.platform.join(" / ") : l.platform, l.engagement].filter(Boolean).join(" · ");
//                         const accent = l.accent || LIKED_ACCENTS[i % LIKED_ACCENTS.length];
//                         return (
//                           <div key={i} className="pl-2 sm:pl-3 py-2 bg-[#16161e] rounded-r-[10px] rounded-bl-[10px] border-l-2" style={{ borderLeftColor: accent }}>
//                             <div className="text-[12px] text-[#eeedf0] leading-relaxed mb-1">{body}</div>
//                             <div className="text-[10px] text-[#50506a]">{meta}</div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </Card>
//                 </div>
//               </>
//             )}

//             {/* ── TOP ARTICLES (always shown, filtered) ── */}
//             <SectionHeader title={searchText ? `Articles matching "${searchText}"` : "Top Trending Articles"} sub={`${data.report_date} · Verified links`} />
//             {filteredArticles.length === 0 ? (
//               <div className="text-center py-8 text-[#50506a] text-xs">No articles matched your search.</div>
//             ) : (
//               <div className="flex flex-col gap-2.5 mb-2">
//                 {filteredArticles.map((a, i) => {
//                   const accent = a.accent || ARTICLE_ACCENTS[i % ARTICLE_ACCENTS.length];
//                   const tagCls = a.tagClass || "blue";
//                   const linkColor = a.linkColor || accent;
//                   return (
//                     <div key={i} className="bg-[#101016] border border-[rgba(255,255,255,0.07)] rounded-xl px-3 sm:px-4 py-3 sm:py-4 relative overflow-hidden hover:border-[rgba(255,255,255,0.13)] transition-colors">
//                       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.13)] to-transparent" />
//                       <div className="absolute left-0 top-0 bottom-0 w-[2px] sm:w-[3px]" style={{ background: accent }} />
//                       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1.5 pl-2">
//                         <div className="font-mono text-[8px] text-[#50506a] uppercase tracking-[0.1em]">#{a.rank} · {a.source}</div>
//                         <Badge label={a.tag} cls={tagCls as BadgeClass} />
//                       </div>
//                       <div className="text-xs sm:text-sm font-medium leading-snug mb-1.5 pl-2">{a.title}</div>
//                       <div className="text-[11px] text-[#8888a2] leading-relaxed mb-2.5 pl-2">{a.summary}</div>
//                       <a href={a.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] tracking-[0.06em] pl-2 hover:underline break-all" style={{ color: linkColor }}>
//                         READ FULL ARTICLE → {new URL(a.url).hostname.replace("www.", "")}
//                       </a>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//             {/* ── SIGNALS (always shown, filtered) ── */}
//             <SectionHeader title={searchText ? `Signals matching "${searchText}"` : "Top Signals"} sub="Editorial brief" />
//             {filteredSignals.length === 0 ? (
//               <div className="text-center py-8 text-[#50506a] text-xs">No signals matched your search.</div>
//             ) : (
//               <div className="flex flex-col gap-2.5 mb-2">
//                 {filteredSignals.map((s, i) => {
//                   const accent = s.accent || SIGNAL_ACCENTS[i % SIGNAL_ACCENTS.length];
//                   const num = s.num || String((s.rank ?? i + 1)).padStart(2, "0");
//                   const desc = s.description || s.desc || "";
//                   return (
//                     <div key={i} className="bg-[#101016] border border-[rgba(255,255,255,0.07)] rounded-xl px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3.5 relative overflow-hidden hover:border-[rgba(255,255,255,0.13)] transition-colors">
//                       <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: accent }} />
//                       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.13)] to-transparent" />
//                       <div className="font-['Bebas_Neue'] text-4xl sm:text-[44px] leading-none text-[#50506a] opacity-20 flex-shrink-0">{num}</div>
//                       <div>
//                         <div className="text-xs sm:text-sm font-medium mb-1">{s.title}</div>
//                         <div className="text-[12px] text-[#8888a2] leading-relaxed">{desc}</div>
//                         {s.teams && s.teams.length > 0 && (
//                           <div className="flex gap-1 mt-2 flex-wrap">
//                             {s.teams.map(t => (
//                               <span key={t} className="font-mono text-[8px] px-1.5 py-[2px] rounded bg-[#16161e] border border-[rgba(255,255,255,0.07)] text-[#8888a2]">{t}</span>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//             {/* ── FOOTER ── */}
//             <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.07)] text-[10px] text-[#50506a] flex flex-col sm:flex-row justify-between gap-2">
//               <div>Sources: {data.sources.join(" · ")} — Verified {data.report_date}</div>
//               <div>SportsFan360 Intelligence · Daily Brief</div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }








"use client";

import { ArrowLeft, Search, Calendar, RefreshCw, X, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PulseMeta {
  season?: number;
  total_matches_played?: number;
  report_type?: string;
  title?: string;
  subtitle?: string;
  summary?: string;
}

interface MatchTeam {
  name: string;
  short: string;
  score: string;
  overs: number;
  result: "won" | "lost";
}

interface MatchResult {
  match_number: number;
  last_match?: string;
  date: string;
  venue: string;
  team1: MatchTeam;
  team2: MatchTeam;
  result: string;
  note: string;
  player_of_match: string;
}

interface Tonight {
  scheduled: boolean;
  match_number?: number;
  teams: string;
  venue: string;
  time: string;
  context: string;
  badge: string;
}

interface KPI {
  value: string;
  label: string;
  sub: string;
  color?: string;
}

interface Quote {
  text: string;
  speaker: string;
  role?: string;
  match?: string;
  context?: string;
  sentiment?: string;
  badge?: string;
  badgeClass?: string;
}

interface PointsRow {
  rank: number;
  team: string;
  played: number;
  won: number;
  points: number;
  nrr?: number;
  form: string[];
  playoff_zone: boolean;
  eliminated: boolean;
  color?: string;
}

interface SearchItem {
  rank: number;
  query: string;
  heat: "hot" | "warm" | "normal";
}

interface FanTrend {
  rank: number;
  trend: string;
  sentiment?: string;
  badge: string;
  badgeClass: string;
  platforms?: string[];
}

interface Ad {
  brand: string;
  product: string;
  status: string;
  tier: string;
  detail: string;
  tierClass: string;
}

interface LangConsumption {
  rank: number;
  language: string;
  share_pct: number;
  note: string;
  platform?: string;
  color?: string;
  gradientTo?: string;
}

interface Meme {
  rank: number;
  text: string;
  meta: string;
}

interface MostLiked {
  rank: number;
  text: string;
  description: string;
  meta: string;
  accent?: string;
}

interface Article {
  rank: number;
  source: string;
  tag: string;
  tagClass?: string;
  title: string;
  summary: string;
  url: string;
  linkColor?: string;
  accent?: string;
}

interface Signal {
  num: string;
  title: string;
  description: string;
  teams: string[];
  accent?: string;
}

interface PulseData {
  report_date: string;
  meta: PulseMeta;
  match_result: MatchResult;
  tonight: Tonight;
  kpis: KPI[];
  quotes: Quote[];
  points_table: PointsRow[];
  top_searches: SearchItem[];
  fan_trends: FanTrend[];
  ads: Ad[];
  language_consumption: LangConsumption[];
  most_liked_posts: MostLiked[];
  memes: Meme[];
  articles: Article[];
  signals: Signal[];
  sources: string[];
}

interface PulseFileMeta {
  id: string;
  fileName: string;
  url: string;
  reportDate: string | null;
  reportDateFormatted: string | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const KPI_COLORS = ["#4a9eff", "#C41E1E", "#FFD84A", "#2bdd8c"];
const TEAM_COLORS: Record<string, string> = {
  RCB: "#cc0000",
  SRH: "#f26522",
  GT: "#1d4e9b",
  PBKS: "#dd4444",
  CSK: "#f9cd05",
  RR: "#254aa5",
  DC: "#2561ae",
  KKR: "#3a225d",
  MI: "#004c93",
  LSG: "#a5c8e1",
};
const LANG_COLORS = [
  { color: "#4a9eff", gradientTo: "#2277cc" },
  { color: "#ffd94a", gradientTo: "#cc9900" },
  { color: "#2bdd8c", gradientTo: "#119960" },
];
const SIGNAL_ACCENTS = ["#4a9eff", "#C41E1E", "#FFD84A", "#2bdd8c", "#a87eff"];
const ARTICLE_ACCENTS = ["#4a9eff", "#2bdd8c", "#FFD84A", "#ff6b2b", "#a87eff"];
const LIKED_ACCENTS = ["#a87eff", "#4a9eff", "#2bdd8c", "#FFD84A", "#C41E1E"];

// ─── Badge ─────────────────────────────────────────────────────────────────────

type BadgeClass = "red" | "green" | "gold" | "blue" | "orange" | "neutral";

const BADGE_STYLES: Record<BadgeClass, string> = {
  red: "bg-[rgba(196,30,30,0.12)] text-[#C41E1E] border border-[rgba(196,30,30,0.2)]",
  green: "bg-[rgba(43,221,140,0.12)] text-[#2bdd8c] border border-[rgba(43,221,140,0.2)]",
  gold: "bg-[rgba(255,216,74,0.12)] text-[#FFD84A] border border-[rgba(255,216,74,0.2)]",
  blue: "bg-[rgba(74,158,255,0.12)] text-[#4a9eff] border border-[rgba(74,158,255,0.2)]",
  orange: "bg-[rgba(255,107,43,0.12)] text-[#ff6b2b] border border-[rgba(255,107,43,0.2)]",
  neutral: "bg-[rgba(255,255,255,0.06)] text-[#8888a2] border border-[rgba(255,255,255,0.07)]",
};

function inferBadgeClass(raw?: string): BadgeClass {
  if (!raw) return "neutral";
  const s = raw.toLowerCase();
  if (["hot", "brutal", "blunt", "meme fuel", "record fever", "vindicated", "furious", "negative", "red", "critical"].some((k) => s.includes(k))) return "red";
  if (["positive", "high praise", "composed", "admiration", "campaign", "new favourite", "determined", "gracious", "confident"].some((k) => s.includes(k))) return "green";
  if (["gold", "building", "honest", "poised", "tactical", "warn", "match awareness", "mixed", "divided"].some((k) => s.includes(k))) return "gold";
  if (["blue", "ongoing", "digital", "adtech", "confirmed", "aware"].some((k) => s.includes(k))) return "blue";
  if (["orange", "viral", "warm", "emotional", "stress", "trending"].some((k) => s.includes(k))) return "orange";
  return "neutral";
}

function Badge({ label, cls }: { label: string; cls?: BadgeClass | string }) {
  const resolved: BadgeClass =
    (cls as BadgeClass) in BADGE_STYLES ? (cls as BadgeClass) : inferBadgeClass(cls);
  return (
    <span
      className={`font-mono text-[9px] tracking-[0.07em] uppercase px-2 py-[2px] rounded-[10px] font-medium whitespace-nowrap ${BADGE_STYLES[resolved]}`}
    >
      {label}
    </span>
  );
}

// ─── Layout helpers ────────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2 md:gap-3 mb-3 mt-5 md:mt-7">
      <h2 className="font-['Bebas_Neue'] text-lg md:text-xl tracking-[0.05em] whitespace-nowrap text-[#eeedf0]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)] min-w-[30px]" />
      {sub && (
        <span className="font-mono text-[9px] text-[#50506a] tracking-[0.1em] uppercase whitespace-wrap">
          {sub}
        </span>
      )}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-[#101016] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 md:p-[18px] relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.13)] to-transparent" />
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] uppercase text-[#50506a] mb-3">
      {children}
      <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[rgba(255,255,255,0.05)] rounded animate-pulse ${className}`} />;
}

function PulseSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

// ─── Filter bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  searchText: string;
  onSearchChange: (v: string) => void;
  selectedDate: string;
  onDateChange: (v: string) => void;
  availableDates: PulseFileMeta[];
  onDateFileSelect: (url: string) => void;
  onClear: () => void;
  loading: boolean;
}

function FilterBar({
  searchText,
  onSearchChange,
  selectedDate,
  onDateChange,
  availableDates,
  onDateFileSelect,
  onClear,
  loading,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-5 md:mb-6">
      {/* FIX: flex-[1_1_120px] ensures it shrinks gracefully on narrow screens */}
      <div className="relative flex-[1_1_120px] min-w-0">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#50506a]" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search signals, teams…"
          className="w-full bg-[#101016] border border-[rgba(255,255,255,0.09)] rounded-[20px] pl-8 pr-3 py-2 text-xs text-[#eeedf0] placeholder:text-[#50506a] focus:outline-none focus:border-[rgba(255,255,255,0.22)] transition-colors"
        />
      </div>

      {availableDates.length > 0 && (
        /* FIX: max-w constrains the select so it never pushes past viewport */
        <div className="relative max-w-[150px] sm:max-w-none">
          <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#50506a] z-10" />
          <select
            value={selectedDate}
            onChange={(e) => {
              const val = e.target.value;
              onDateChange(val);
              if (!val) {
                onClear();
                return;
              }
              const file = availableDates.find((f) => f.reportDate === val || f.id === val);
              if (file) onDateFileSelect(file.url);
            }}
            className="appearance-none w-full bg-[#101016] border border-[rgba(255,255,255,0.09)] rounded-[20px] pl-8 pr-6 py-2 text-xs text-[#eeedf0] focus:outline-none focus:border-[rgba(255,255,255,0.22)] transition-colors cursor-pointer truncate"
          >
            <option value="">Latest</option>
            {availableDates.map((f) => (
              <option key={f.id} value={f.reportDate ?? f.id}>
                {f.reportDateFormatted ?? f.fileName}
              </option>
            ))}
          </select>
        </div>
      )}

      {(searchText || selectedDate) && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 bg-[#101016] border border-[rgba(255,255,255,0.09)] rounded-[20px] px-3 py-2 text-xs text-[#8888a2] hover:text-[#eeedf0] transition-colors whitespace-nowrap"
        >
          <X size={12} /> Clear
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-1.5 text-[#50506a] text-[10px] font-mono ml-auto">
          <RefreshCw size={12} className="animate-spin" /> Loading…
        </div>
      )}
    </div>
  );
}

// ─── Raw Data Types for Transformation ─────────────────────────────────────────

interface RawMeme {
  rank: number;
  description: string;
  platform: string;
  vibe: string;
  verified_source: string;
}

interface RawMostLiked {
  rank: number;
  description: string;
  source: string;
  platform: string[];
  engagement: string;
}

interface RawFanTrend {
  rank: number;
  trend: string;
  sentiment: string;
  badgeClass: string;
  platform: string[];
}

interface RawAd {
  brand: string;
  product: string | null;
  status: string;
  tier: string | null;
  detail: string;
  tierClass: string;
}

interface RawSignal {
  rank: number;
  title: string;
  description: string;
  theme: string;
  teams: string[];
}

interface RawPulseData {
  report_date: string;
  generated_at?: string;
  version?: string;
  source?: string;
  meta: {
    title: string;
    subtitle: string;
    summary: string;
  };
  match_result: MatchResult;
  tonight: {
    match_number: number;
    teams: string;
    venue: string;
    time: string;
    context: string;
    badge: string;
  };
  kpis: KPI[];
  quotes: Quote[];
  points_table: PointsRow[];
  top_searches: SearchItem[];
  fan_trends: RawFanTrend[];
  ads: RawAd[];
  language_consumption: LangConsumption[];
  most_liked_posts: RawMostLiked[];
  memes: RawMeme[];
  articles: Article[];
  signals: RawSignal[];
  sources: string[];
}

// ─── Data transformation ───────────────────────────────────────────────────────

function transformRawData(raw: RawPulseData): PulseData {
  const transformedMemes = (raw.memes || []).map((m: RawMeme, idx: number) => ({
    rank: m.rank || idx + 1,
    text: m.description || "",
    meta: [m.platform, m.vibe, m.verified_source].filter(Boolean).join(" · ") || "",
  }));

  const transformedMostLiked = (raw.most_liked_posts || []).map((p: RawMostLiked, idx: number) => ({
    rank: p.rank || idx + 1,
    text: p.description?.split(":")[1]?.trim() || p.description || "",
    description: p.description || "",
    meta: [p.source, Array.isArray(p.platform) ? p.platform.join(" / ") : p.platform, p.engagement]
      .filter(Boolean)
      .join(" · "),
    accent: LIKED_ACCENTS[idx % LIKED_ACCENTS.length],
  }));

  const transformedFanTrends = (raw.fan_trends || []).map((t: RawFanTrend, idx: number) => ({
    rank: t.rank || idx + 1,
    trend: t.trend,
    sentiment: t.sentiment,
    badge: "",
    badgeClass: t.badgeClass || inferBadgeClass(t.sentiment),
    platforms: t.platform,
  }));

  const transformedAds = (raw.ads || []).map((ad: RawAd) => ({
    brand: ad.brand,
    product: ad.product || "",
    status: ad.status || "confirmed",
    tier: ad.tier || "Standard",
    detail: ad.detail || "",
    tierClass: ad.tierClass || "blue",
  }));

  const transformedSignals = (raw.signals || []).map((s: RawSignal, idx: number) => ({
    num: String(idx + 1).padStart(2, "0"),
    title: s.title || "",
    description: s.description || "",
    teams: s.teams || [],
    accent: SIGNAL_ACCENTS[idx % SIGNAL_ACCENTS.length],
  }));

  return {
    report_date: raw.report_date,
    meta: {
      title: raw.meta?.title || "",
      subtitle: raw.meta?.subtitle || "",
      summary: raw.meta?.summary || "",
    },
    match_result: raw.match_result,
    tonight: {
      scheduled: true,
      match_number: raw.tonight?.match_number,
      teams: raw.tonight?.teams || "",
      venue: raw.tonight?.venue || "",
      time: raw.tonight?.time || "",
      context: raw.tonight?.context || "",
      badge: raw.tonight?.badge || "",
    },
    kpis: raw.kpis || [],
    quotes: raw.quotes || [],
    points_table: raw.points_table || [],
    top_searches: raw.top_searches || [],
    fan_trends: transformedFanTrends,
    ads: transformedAds,
    language_consumption: raw.language_consumption || [],
    most_liked_posts: transformedMostLiked,
    memes: transformedMemes,
    articles: (raw.articles || []).map((a: Article, i: number) => ({
      ...a,
      accent: ARTICLE_ACCENTS[i % ARTICLE_ACCENTS.length],
    })),
    signals: transformedSignals,
    sources: raw.sources || [],
  };
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function IPLPulse() {
  const [data, setData] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<PulseFileMeta[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const latestUrlRef = React.useRef<string | null>(null);

  const fetchByUrl = useCallback(async (url: string) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      setData(transformRawData(raw as RawPulseData));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/cloudinary/iplpulse?mode=list");
        if (!res.ok) throw new Error(`List fetch failed: HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "List API error");

        const files = (json.files as PulseFileMeta[]) || [];
        setAvailableDates(files);

        const latest = files[0];
        if (!latest?.url) throw new Error("No reports found");

        latestUrlRef.current = latest.url;

        const dataRes = await fetch(latest.url);
        if (!dataRes.ok) throw new Error(`Report fetch failed: HTTP ${dataRes.status}`);
        const raw = await dataRes.json();
        setData(transformRawData(raw as RawPulseData));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleClear = useCallback(async () => {
    setSearchText("");
    setSelectedDate("");
    setError(null);
    if (latestUrlRef.current) {
      await fetchByUrl(latestUrlRef.current);
    }
  }, [fetchByUrl]);

  const q = searchText.toLowerCase();

  const filteredSearches =
    data?.top_searches.filter((s) => !q || s.query.toLowerCase().includes(q)) ?? [];

  const filteredSignals =
    data?.signals.filter(
      (s) =>
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.teams.some((t) => t.toLowerCase().includes(q))
    ) ?? [];

  const filteredArticles =
    data?.articles.filter(
      (a) =>
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
    ) ?? [];

  const languages = data?.language_consumption ?? [];
  const mostLiked = data?.most_liked_posts ?? [];

  const matchHeaderLabel = (mr: MatchResult) =>
    [mr.match_number ? `Match ${mr.match_number}` : null, mr.date, mr.venue]
      .filter(Boolean)
      .join(" · ");

  return (
    /*
     * FIX 1: overflow-x-hidden prevents any child from blowing out the viewport width.
     * FIX 2: pt-[104px] clears the 104px fixed mobile header; md:pt-0 resets on tablet+.
     * FIX 3: pb-[72px] clears the fixed bottom nav; md:pb-0 resets on tablet+.
     * FIX 4: Removed bg-[#09090e], min-h-screen, and mt-10 — the layout shell owns those.
     */
    <div className="text-[#eeedf0] font-['DM_Sans',sans-serif] text-sm leading-relaxed overflow-x-hidden pt-[104px] pb-[72px] md:pt-0 md:pb-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .live-pip::before {
          content:'';display:inline-block;width:6px;height:6px;border-radius:50%;
          background:#2bdd8c;margin-right:5px;animation:blink 1.8s ease infinite;vertical-align:middle;
        }
        .table-container { overflow-x:auto;-webkit-overflow-scrolling:touch; }
      `}</style>

      {/* FIX 5: Removed pb-4 from inner wrapper — outer pb-[72px] already handles bottom space */}
      <div className="max-w-[1300px] mx-auto px-3 sm:px-4 md:px-6">

        {/* ── BACK BUTTON ── */}
        <Link href="/MainModules/HomePage">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white pt-2 mb-2 transition cursor-pointer">
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
        </Link>

        {/* ── HEADER ── */}
        <div className="pt-2 pb-4 border-b border-[rgba(255,255,255,0.07)] flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 md:mb-6">
          <div className="min-w-0">
            <div className="font-mono text-[9px] text-[#C41E1E] tracking-[0.16em] uppercase mb-1">
              SportsFan360 — Intelligence Dashboard
            </div>
            <h1 className="font-['Bebas_Neue'] text-[clamp(32px,8vw,52px)] leading-none tracking-[0.02em]">
              IPL 2026 <span className="text-[#C41E1E]">PULSE</span>
            </h1>
            <div className="text-[11px] text-[#8888a2] mt-1 flex flex-wrap gap-1 items-center">
              {data ? (
                <>
                  <span>{data.meta.subtitle}</span>
                  <span>·</span>
                  <span>
                    {new Date(data.report_date + "T00:00:00").toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {selectedDate && (
                    <>
                      <span>·</span>
                      <span className="text-[#ff6b2b] font-mono text-[9px] uppercase tracking-[0.1em]">
                        Archive
                      </span>
                    </>
                  )}
                </>
              ) : (
                <Skeleton className="h-4 w-64" />
              )}
            </div>
          </div>

          {data?.tonight?.scheduled !== false && data?.tonight?.teams && (
            // FIX 6: min-w-0 + overflow-hidden on this flex child prevents it from
            // pushing the header wider than the viewport on narrow screens
            <div className="flex flex-col sm:items-end gap-2 min-w-0 sm:flex-shrink-0">
              <span className="live-pip font-mono text-[9px] text-[#2bdd8c] tracking-[0.1em] uppercase">
                Live Season ·{" "}
                {data.tonight.match_number ? `Match ${data.tonight.match_number} Tonight` : "Match Tonight"}
              </span>
              <div className="bg-[#16161e] border border-[rgba(255,255,255,0.13)] rounded-[20px] px-2.5 py-1.5 text-[11px] text-[#FFD84A] flex flex-wrap items-center gap-1.5 min-w-0">
                <span className="truncate">{data.tonight.teams}</span>
                {(data.tonight.venue || data.tonight.time) && (
                  // FIX 7: truncate long venue strings so they don't blow out the pill width
                  <span className="text-[#8888a2] text-[10px]  max-w-[160px] sm:max-w-none">
                    {[data.tonight.venue, data.tonight.time].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── FILTER BAR ── */}
        <FilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          availableDates={availableDates}
          onDateFileSelect={fetchByUrl}
          onClear={handleClear}
          loading={loading}
        />

        {/* ── ERROR ── */}
        {error && (
          <div className="bg-[rgba(196,30,30,0.1)] border border-[rgba(196,30,30,0.3)] rounded-xl p-4 mb-6 text-sm text-[#C41E1E] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={handleClear} className="text-xs underline ml-4 flex-shrink-0">
              Retry
            </button>
          </div>
        )}

        {/* ── SKELETON ── */}
        {loading && !data && <PulseSkeleton />}

        {/* ── CONTENT ── */}
        {data && (
          <>
            {searchText && filteredSignals.length === 0 && filteredArticles.length === 0 && (
              <div className="text-center py-12 text-[#50506a]">
                <div className="font-['Bebas_Neue'] text-3xl mb-2">No results</div>
                <div className="text-xs">
                  No signals or articles matched &ldquo;{searchText}&rdquo;
                </div>
              </div>
            )}

            {!searchText && (
              <>
                {/* ── YESTERDAY'S MATCH ── */}
                {data.match_result?.team1?.name && data.match_result?.team2?.name && (
                  <>
                    <SectionHeader
                      title="Yesterday's Match"
                      sub={matchHeaderLabel(data.match_result)}
                    />
                    <div className="bg-[#16161e] border border-[rgba(255,255,255,0.07)] rounded-xl px-3 sm:px-4 py-3.5 relative overflow-hidden mb-3.5">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2561ae] to-[#4a9eff]" />

                      {/* <div className="font-mono text-[8px] text-[#50506a] uppercase tracking-[0.1em] mb-3 truncate">
                        {matchHeaderLabel(data.match_result)}
                      </div> */}

                      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3">
                        <div className="flex-1 text-left min-w-0">
                          <div
                            className="font-['Bebas_Neue'] text-[clamp(1.2rem,5vw,2.5rem)] leading-none "
                            style={{
                              color:
                                TEAM_COLORS[data.match_result.team1.short] ||
                                TEAM_COLORS[data.match_result.team1.name] ||
                                "#eeedf0",
                            }}
                          >
                            {data.match_result.team1.name}
                          </div>
                          {data.match_result.team1.score && (
                            <div className="font-['Bebas_Neue'] text-lg sm:text-xl text-[#eeedf0] mt-1">
                              {data.match_result.team1.score}
                              {data.match_result.team1.overs > 0 && (
                                <span className="font-mono text-[10px] sm:text-[11px] text-[#50506a] ml-1">
                                  ({data.match_result.team1.overs} ov)
                                </span>
                              )}
                            </div>
                          )}
                          {data.match_result.team1.result === "won" && (
                            <div className="font-mono text-[8px] sm:text-[9px] text-[#2bdd8c] mt-1 uppercase tracking-wide">
                              🏆 Winner
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex flex-col items-center px-1">
                          <div className="text-[10px] sm:text-[11px] text-[#50506a] mb-1 font-mono">VS</div>
                          {/* {data.match_result.result && (
                            <span className="font-mono text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md text-[#2bdd8c] bg-[rgba(43,221,140,0.1)] border border-[rgba(43,221,140,0.2)] text-center leading-tight max-w-[80px] sm:max-w-[120px]">
                              {data.match_result.result.split(" ").slice(0, 3).join(" ")}
                            </span>
                          )} */}
                        </div>

                        <div className="flex-1 text-right min-w-0">
                          <div
                            className="font-['Bebas_Neue'] text-[clamp(1.2rem,5vw,2.5rem)] leading-none "
                            style={{
                              color:
                                TEAM_COLORS[data.match_result.team2.short] ||
                                TEAM_COLORS[data.match_result.team2.name] ||
                                "#eeedf0",
                            }}
                          >
                            {data.match_result.team2.name}
                          </div>
                          {data.match_result.team2.score && (
                            <div className="font-['Bebas_Neue'] text-lg sm:text-xl text-[#eeedf0] mt-1">
                              {data.match_result.team2.score}
                              {data.match_result.team2.overs > 0 && (
                                <span className="font-mono text-[10px] sm:text-[11px] text-[#50506a] ml-1">
                                  ({data.match_result.team2.overs} ov)
                                </span>
                              )}
                            </div>
                          )}
                          {data.match_result.team2.result === "won" && (
                            <div className="font-mono text-[8px] sm:text-[9px] text-[#2bdd8c] mt-1 uppercase tracking-wide text-right">
                              🏆 Winner
                            </div>
                          )}
                        </div>
                      </div>

                      {data.match_result.result && (
                        <div className="text-[12px] text-[#FFD84A] leading-relaxed text-center sm:text-left mt-2 pt-2 border-t border-[rgba(255,255,255,0.07)]">
                          {data.match_result.result}
                        </div>
                      )}

                      {data.match_result.note && data.match_result.note !== data.match_result.result && (
                        <div className="mt-2 text-[11px] text-[#8888a2] leading-relaxed border-t border-[rgba(255,255,255,0.05)] pt-2">
                          {data.match_result.note}
                        </div>
                      )}

                      {data.match_result.player_of_match && (
                        <div className="mt-2 font-mono text-[10px] text-[#8888a2] text-center sm:text-left">
                          🏏 Player of the Match:{" "}
                          <span className="text-[#eeedf0]">{data.match_result.player_of_match}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── TONIGHT ── */}
                {data.tonight?.scheduled !== false && data.tonight?.teams && (
                  <div className="bg-gradient-to-br from-[rgba(255,107,43,0.08)] to-[rgba(255,216,74,0.05)] border border-[rgba(255,107,43,0.2)] rounded-xl px-3 sm:px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="min-w-0">
                      <div className="font-mono text-[8px] text-[#ff6b2b] uppercase tracking-[0.1em] mb-1">
                        Tonight ·{" "}
                        {data.tonight.match_number ? `Match ${data.tonight.match_number}` : "Schedule"}{" "}
                        · Must Watch
                      </div>
                      <div className="text-sm sm:text-base font-medium truncate">{data.tonight.teams}</div>
                      {/* FIX 8: break-words prevents long venue strings from overflowing */}
                      <div className="text-[10px] text-[#8888a2] mt-0.5 break-words">
                        {[data.tonight.venue, data.tonight.time, data.tonight.context]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    {data.tonight.badge && (
                      <div className="font-mono text-[10px] bg-[rgba(255,107,43,0.12)] text-[#ff6b2b] border border-[rgba(255,107,43,0.25)] rounded-lg px-2.5 py-1.5 whitespace-nowrap text-center self-start sm:self-auto flex-shrink-0">
                        {data.tonight.badge}
                      </div>
                    )}
                  </div>
                )}

                {/* ── KPIs ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {data.kpis.map((k, i) => {
                    const color = k.color ?? KPI_COLORS[i % KPI_COLORS.length];
                    return (
                      <div
                        key={i}
                        className="bg-[#101016] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 md:p-[18px] relative overflow-hidden hover:border-[rgba(255,255,255,0.13)] transition-colors"
                      >
                        <div
                          className="font-['Bebas_Neue'] text-4xl sm:text-5xl leading-none"
                          style={{ color }}
                        >
                          {k.value}
                        </div>
                        <div className="text-[11px] text-[#8888a2] leading-snug mt-0.5">{k.label}</div>
                        <div className="font-mono text-[9px] text-[#50506a] mt-1">{k.sub}</div>
                        <div
                          className="absolute bottom-[-10px] right-[-10px] w-14 h-14 rounded-full opacity-[0.07]"
                          style={{ background: color }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* ── QUOTES + STANDINGS ── */}
                <SectionHeader title="Analyst & Player Voice" sub={`Verified · ${data.report_date}`} />
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3.5 mb-2">
                  <Card>
                    <CardLabel>What they said</CardLabel>
                    <div className="flex flex-col gap-2.5">
                      {data.quotes.map((qt, i) => {
                        const badgeCls = (qt.badgeClass as BadgeClass) ?? inferBadgeClass(qt.sentiment);
                        const accentMap: Record<BadgeClass, string> = {
                          red: "#C41E1E",
                          green: "#2bdd8c",
                          gold: "#FFD84A",
                          blue: "#4a9eff",
                          orange: "#ff6b2b",
                          neutral: "#50506a",
                        };
                        return (
                          <div
                            key={i}
                            className="border-l-2 pl-3 py-2 bg-[#16161e] rounded-r-lg"
                            style={{ borderLeftColor: accentMap[badgeCls] ?? "#50506a" }}
                          >
                            <p className="text-[12px] sm:text-[13px] text-[#eeedf0] leading-relaxed mb-1.5">
                              &lsquo;{qt.text}&rsquo;
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] text-[#50506a] flex-1 min-w-0">
                                {[qt.speaker, qt.role, qt.context ?? qt.match]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                              <Badge label={qt.badge ?? qt.sentiment ?? "insight"} cls={badgeCls} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Points Table */}
                  <Card>
                    <CardLabel>Points table · {data.report_date}</CardLabel>
                    {/*
                     * FIX 9: -mx-4 px-4 (or -mx-[18px] px-[18px] on md) lets the table
                     * scroll within the card without the scrollbar pushing outer layout.
                     * The negative margin + matching padding keeps visual alignment.
                     */}
                    <div className="table-container -mx-4 md:-mx-[18px] px-4 md:px-[18px]">
                      <table className="w-full border-collapse min-w-[300px]">
                        <thead>
                          <tr>
                            {["Team", "M", "W", "Pts", "NRR", "Form"].map((h) => (
                              <th
                                key={h}
                                className={`font-mono text-[8px] tracking-[0.1em] uppercase text-[#50506a] pb-2 border-b border-[rgba(255,255,255,0.07)] ${h === "Team" ? "text-left pr-2" : "text-center"}`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.points_table.map((row) => {
                            const color = row.color ?? TEAM_COLORS[row.team] ?? "#8888a2";
                            return (
                              <tr
                                key={row.rank}
                                className={`hover:bg-[#16161e] ${row.eliminated ? "opacity-40" : ""} ${row.playoff_zone ? "bg-[rgba(196,30,30,0.02)]" : ""}`}
                              >
                                <td className="py-2 pr-2 border-b border-[rgba(255,255,255,0.07)]">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0"
                                      style={{ background: color }}
                                    />
                                    <span
                                      className={`text-[12px] font-medium ${row.playoff_zone ? "text-[#2bdd8c]" : "text-[#eeedf0]"}`}
                                    >
                                      {row.team}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2 text-center border-b border-[rgba(255,255,255,0.07)] text-[12px] text-[#8888a2]">
                                  {row.played}
                                </td>
                                <td className="py-2 text-center border-b border-[rgba(255,255,255,0.07)] text-[12px] text-[#8888a2]">
                                  {row.won}
                                </td>
                                <td className="py-2 text-center border-b border-[rgba(255,255,255,0.07)]">
                                  <span
                                    className={`bg-[#16161e] rounded px-1.5 py-[2px] font-mono text-[10px] font-medium ${row.eliminated ? "text-[#C41E1E]" : row.playoff_zone ? "text-[#2bdd8c]" : "text-[#8888a2]"}`}
                                  >
                                    {row.points}
                                  </span>
                                </td>
                                <td className="py-2 text-center border-b border-[rgba(255,255,255,0.07)] text-[10px] font-mono text-[#8888a2]">
                                  {row.nrr != null
                                    ? `${row.nrr >= 0 ? "+" : ""}${row.nrr.toFixed(3)}`
                                    : "—"}
                                </td>
                                <td className="py-2 text-center border-b border-[rgba(255,255,255,0.07)]">
                                  <div className="flex items-center justify-center gap-[2px]">
                                    {row.form.map((f, fi) => (
                                      <span
                                        key={fi}
                                        className={`inline-block w-2 h-2 rounded-[2px] ${f === "W" ? "bg-[#2bdd8c]" : "bg-[#C41E1E]"}`}
                                      />
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 text-[9px] text-[#50506a]">
                      🟢 Playoff zone · ❌ Eliminated · Form: last 5
                    </div>
                  </Card>
                </div>

                {/* ── SEARCH + FAN TRENDS ── */}
                <SectionHeader title="Search & Fan Trends" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-2">
                  <Card>
                    <CardLabel>
                      <TrendingUp size={10} /> Top {data.top_searches.length} searches ·{" "}
                      {data.report_date}
                    </CardLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {data.top_searches.map((s) => {
                        const numCls =
                          s.heat === "hot"
                            ? "bg-[rgba(196,30,30,0.2)] text-[#C41E1E]"
                            : s.heat === "warm"
                              ? "bg-[rgba(255,216,74,0.15)] text-[#FFD84A]"
                              : "bg-[#1c1c26] text-[#50506a]";
                        return (
                          <span
                            key={s.rank}
                            className="inline-flex items-center gap-1 bg-[#16161e] border border-[rgba(255,255,255,0.07)] rounded-[20px] px-2 sm:px-3 py-1 text-[11px] text-[#eeedf0]"
                          >
                            <span
                              className={`font-mono text-[8px] rounded-full w-[16px] h-[16px] flex items-center justify-center flex-shrink-0 ${numCls}`}
                            >
                              {s.rank}
                            </span>
                            {s.query}
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-[9px] text-[#50506a] mt-2.5">
                      Verified from ESPNcricinfo, Tribune India, Business Standard, CricketAddictor.
                    </div>
                  </Card>

                  <Card>
                    <CardLabel>
                      <Zap size={10} /> Leading fan trends
                    </CardLabel>
                    {data.fan_trends.map((t, i) => (
                      <div
                        key={i}
                        className={`flex flex-col sm:flex-row sm:items-start gap-2 py-2.5 ${i < data.fan_trends.length - 1 ? "border-b border-[rgba(255,255,255,0.07)]" : ""}`}
                      >
                        <div className="flex items-start gap-2.5 w-full min-w-0">
                          <div className="font-mono text-[9px] text-[#50506a] w-5 flex-shrink-0 mt-0.5">
                            {String(t.rank).padStart(2, "0")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] text-[#eeedf0] leading-snug mb-1.5 break-words">
                              {t.trend}
                            </div>
                            {t.platforms && t.platforms.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {t.platforms.map((p) => (
                                  <span
                                    key={p}
                                    className="font-mono text-[8px] px-1.5 py-[2px] rounded bg-[#1c1c26] border border-[rgba(255,255,255,0.06)] text-[#50506a]"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <Badge label={t.badge} cls={t.badgeClass} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>

                {/* ── ADS + LANGUAGE ── */}
                <SectionHeader title="Brand Ads & Language Reach" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-2">
                  <Card>
                    <CardLabel>Tech & AI brand advertising · IPL 2026</CardLabel>
                    <div className="flex flex-col gap-2">
                      {data.ads.map((ad, i) => (
                        <div
                          key={i}
                          className="bg-[#16161e] border border-[rgba(255,255,255,0.07)] rounded-[10px] p-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 gap-1">
                            <div className="text-[12px] font-medium text-[#eeedf0] min-w-0 truncate">
                              {ad.brand}
                              {ad.product ? ` · ${ad.product}` : ""}
                            </div>
                            <Badge label={ad.tier || ad.status} cls={ad.tierClass as BadgeClass} />
                          </div>
                          <div className="text-[11px] text-[#8888a2] leading-relaxed break-words">{ad.detail}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <CardLabel>Top {languages.length} consumption languages</CardLabel>
                    <div className="flex flex-col gap-3.5">
                      {languages.map((l, i) => {
                        const fallback = LANG_COLORS[i % LANG_COLORS.length];
                        const color = l.color ?? fallback.color;
                        const gradientTo = l.gradientTo ?? fallback.gradientTo;
                        const maxPct = Math.max(...languages.map((x) => x.share_pct), 1);
                        return (
                          <div key={i}>
                            <div className="flex justify-between items-baseline mb-1.5">
                              <span className="text-[12px] font-medium">{l.language}</span>
                              <span className="font-['Bebas_Neue'] text-xl text-[#8888a2]">
                                ~{l.share_pct}%
                              </span>
                            </div>
                            <div className="h-1 bg-[#1c1c26] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(l.share_pct / maxPct) * 100}%`,
                                  background: `linear-gradient(90deg,${color},${gradientTo})`,
                                }}
                              />
                            </div>
                            <div className="text-[10px] text-[#50506a] mt-1">{l.note}</div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>

                {/* ── MEMES + MOST LIKED ── */}
                <SectionHeader title="Memes & Most Liked" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-2">
                  <Card>
                    <CardLabel>Top {data.memes.length} memes · {data.report_date}</CardLabel>
                    <div className="flex flex-col gap-2">
                      {data.memes.map((m) => (
                        <div
                          key={m.rank}
                          className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#16161e] rounded-[10px] border border-[rgba(255,255,255,0.07)]"
                        >
                          <div className="font-['Bebas_Neue'] text-2xl text-[#50506a] leading-none flex-shrink-0 w-[22px] opacity-35">
                            {String(m.rank).padStart(2, "0")}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12px] text-[#eeedf0] leading-relaxed mb-1 break-words">
                              {m.text}
                            </div>
                            {m.meta && (
                              <div className="text-[10px] text-[#50506a] break-words">{m.meta}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <CardLabel>
                      Top {mostLiked.length} most liked posts · last 24 hrs
                    </CardLabel>
                    <div className="flex flex-col gap-2">
                      {mostLiked.map((p) => (
                        <div
                          key={p.rank}
                          className="pl-2 sm:pl-3 py-2 bg-[#16161e] rounded-r-[10px] rounded-bl-[10px] border-l-2"
                          style={{ borderLeftColor: p.accent ?? LIKED_ACCENTS[(p.rank - 1) % LIKED_ACCENTS.length] }}
                        >
                          <div className="text-[12px] text-[#eeedf0] leading-relaxed mb-1 break-words">{p.text}</div>
                          {p.description && (
                            <div className="text-[10px] text-[#8888a2] mb-0.5 break-words">{p.description}</div>
                          )}
                          {p.meta && (
                            <div className="text-[10px] text-[#50506a] break-words">{p.meta}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* ── ARTICLES ── */}
            <SectionHeader
              title={searchText ? `Articles matching "${searchText}"` : "Top Trending Articles"}
              sub={`${data.report_date} · Verified links`}
            />
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 text-[#50506a] text-xs">
                No articles matched your search.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 mb-2">
                {filteredArticles.map((a, i) => {
                  const accent = a.accent ?? ARTICLE_ACCENTS[i % ARTICLE_ACCENTS.length];
                  let hostname = a.url;
                  try { hostname = new URL(a.url).hostname.replace("www.", ""); } catch { }
                  return (
                    <div
                      key={i}
                      className="bg-[#101016] border border-[rgba(255,255,255,0.07)] rounded-xl px-3 sm:px-4 py-3 sm:py-4 relative overflow-hidden hover:border-[rgba(255,255,255,0.13)] transition-colors"
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.13)] to-transparent" />
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[2px] sm:w-[3px]"
                        style={{ background: accent }}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1.5 pl-2">
                        <div className="font-mono text-[8px] text-[#50506a] uppercase tracking-[0.1em]">
                          #{a.rank} · {a.source}
                        </div>
                        <Badge label={a.tag} cls={(a.tagClass ?? "blue") as BadgeClass} />
                      </div>
                      <div className="text-xs sm:text-sm font-medium leading-snug mb-1.5 pl-2 break-words">
                        {a.title}
                      </div>
                      <div className="text-[11px] text-[#8888a2] leading-relaxed mb-2.5 pl-2 break-words">
                        {a.summary}
                      </div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[9px] tracking-[0.06em] pl-2 hover:underline break-all"
                        style={{ color: a.linkColor ?? accent }}
                      >
                        READ FULL ARTICLE → {hostname}
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── SIGNALS ── */}
            <SectionHeader
              title={searchText ? `Signals matching "${searchText}"` : "Top Signals"}
              sub="Editorial brief"
            />
            {filteredSignals.length === 0 ? (
              <div className="text-center py-8 text-[#50506a] text-xs">
                No signals matched your search.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 mb-2">
                {filteredSignals.map((s, i) => {
                  const accent = s.accent ?? SIGNAL_ACCENTS[i % SIGNAL_ACCENTS.length];
                  return (
                    <div
                      key={i}
                      className="bg-[#101016] border border-[rgba(255,255,255,0.07)] rounded-xl px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3.5 relative overflow-hidden hover:border-[rgba(255,255,255,0.13)] transition-colors"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[2px]"
                        style={{ background: accent }}
                      />
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.13)] to-transparent" />
                      <div className="font-['Bebas_Neue'] text-4xl sm:text-[44px] leading-none text-[#50506a] opacity-20 flex-shrink-0">
                        {s.num}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium mb-1 break-words">{s.title}</div>
                        <div className="text-[12px] text-[#8888a2] leading-relaxed break-words">{s.description}</div>
                        {s.teams.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {s.teams.map((t) => (
                              <span
                                key={t}
                                className="font-mono text-[8px] px-1.5 py-[2px] rounded bg-[#16161e] border border-[rgba(255,255,255,0.07)] text-[#8888a2]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── FOOTER ── */}
            <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.07)] text-[10px] text-[#50506a] flex flex-col sm:flex-row justify-between gap-2 pb-4">
              <div className="break-words">{data.sources.join(" · ")} — Verified {data.report_date}</div>
              <div className="flex-shrink-0">SportsFan360 Intelligence · Daily Brief</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}