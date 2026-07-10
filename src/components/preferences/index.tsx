// // components/preferences/index.tsx

// "use client";

// import { useState } from 'react';
// import Image from 'next/image';
// import {
//   ChevronLeft,
// } from 'lucide-react';

// const TAGS = ['Cricket', 'Football', 'Athletics', 'Kabaddi', 'Badminton', 'Tennis', 'Arm Wrestling', 'Squash'];

// export default function PreferencesOnboarding() {
//   const [step, setStep] = useState(0);
//   const [started, setStarted] = useState(false);
//   const [purpose, setPurpose] = useState<string | null>('Catch Live action');
//   const [selectedTags, setSelectedTags] = useState<string[]>(['Cricket']);
//   const [sportStyle, setSportStyle] = useState<string>('Short & Fast');
//   const [notif, setNotif] = useState({ live: true, final: true, breaking: true, highlights: true });

//   const total = 5;

//   const finalHero = '/images/dolly3.png';
//   const heroSrc = '/images/Dolly%202.png';
//   const QUESTION_CLASS = "flex flex-col justify-between min-h-[260px]";
//   const IMG_MAP: Record<string, string> = {
//     'Catch Live action': 'catch.png',
//     'Watch highlights & news': 'watch highlights.png',
//     'Follow players & teams': 'follow players.png',
//     'Explore everything': 'explore everything.png',
//     'Short & Fast': 'short.png',
//     'Deep Dives': 'deep.png',
//     'Video First': 'catch.png',
//     'Live Scores': 'Live scores.png',
//     'Live match alerts': 'live match.png',
//     'Final scores': 'final scores.png',
//     'Breaking news': 'breaking news.png',
//     'Highlight drops': 'highlights drops.png',
//     Cricket: 'cricket.png',
//     Football: 'explore.png',
//     Athletics: 'explore.png',
//     Kabaddi: 'battle.png',
//     Badminton: 'feed.png',
//     Tennis: 'playermi.png',
//     'Arm Wrestling': 'battle.png',
//     Squash: 'explore.png',
//   };

//   const getImg = (label: string) => {
//     const f = IMG_MAP[label as keyof typeof IMG_MAP];
//     return f ? `/images/${encodeURIComponent(f)}` : undefined;
//   };

//   const toggleTag = (tag: string) => {
//     setSelectedTags((s) => (s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]));
//   };

//   const onSkip = () => setStep((s) => Math.min(total - 1, s + 1));

//   const onNext = () => setStep((s) => Math.min(total - 1, s + 1));
//   const onBack = () => setStep((s) => Math.max(0, s - 1));

//   const progressPct = Math.round(((step + 1) / total) * 100);
//   const [activeTab, setActiveTab] = useState<'featured' | 'following'>('featured');

//   if (!started) {
//     return (
//       <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start p-4">
//         <div className="w-full max-w-xl mt-4 rounded-2xl border border-white/10 bg-[#111] p-4 flex items-center gap-4">
//           <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
//             <Image src={'/images/dolly%201.png'} alt="dolly" width={80} height={80} className="object-cover" />
//           </div>
//           <div className="flex-1">
//             <p className="text-sm text-gray-300 mb-2">Don&apos;t leave me hanging...</p>
//             <p className="text-base font-semibold mb-4">Complete your profile setup to get the full experience.</p>
//             <div className="flex gap-3">
//               <button onClick={() => setStarted(true)} className="flex-1 rounded-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold">Complete Now</button>
//               <a href="/MainModules/HomePage" className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-white/10 text-sm">Skip</a>
//             </div>
//           </div>
//         </div>
//         <div className="w-full max-w-xl mt-6">
//           <div className="rounded-2xl border border-white/6 p-3 bg-white/3 text-sm text-gray-300">You can always change these preferences later in Settings.</div>
//           <div className="mt-4 flex gap-3">
//             <button
//               onClick={() => setActiveTab('featured')}
//               className={`px-4 py-2 rounded-full ${activeTab === 'featured' ? 'bg-white text-black' : 'border border-white/10 text-white'}`}
//             >
//               Featured
//             </button>
//             <button
//               onClick={() => setActiveTab('following')}
//               className={`px-4 py-2 rounded-full ${activeTab === 'following' ? 'bg-white text-black' : 'border border-white/10 text-white'}`}
//             >
//               Following
//             </button>
//           </div>

//           <div className="mt-4 w-full max-w-xl">
//             {activeTab === 'featured' ? (
//               <div className="space-y-3">
//                 <div className="p-3 rounded-2xl bg-white/3 border border-white/8 flex items-start gap-3">
//                   <div className="w-12 h-12 rounded-full overflow-hidden">
//                     <Image src="/images/dolly%201.png" alt="avatar" width={48} height={48} className="object-cover" />
//                   </div>
//                   <div className="flex-1 text-left">
//                     <div className="font-semibold">Virat Kohli</div>
//                     <div className="text-xs text-gray-400">12m ago</div>
//                     <div className="mt-2 text-sm text-gray-300">Let&apos;s go!!</div>
//                   </div>
//                   <button className="ml-2 px-3 py-1 rounded-full bg-white text-black text-sm">Follow</button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 <div className="p-3 rounded-2xl bg-white/3 border border-white/8 flex items-start gap-3">
//                   <div className="w-12 h-12 rounded-full overflow-hidden">
//                     <Image src="/images/dolly%201.png" alt="avatar" width={48} height={48} className="object-cover" />
//                   </div>
//                   <div className="flex-1 text-left">
//                     <div className="font-semibold">You</div>
//                     <div className="text-xs text-gray-400">Just now</div>
//                     <div className="mt-2 text-sm text-gray-300">Welcome back to your feed.</div>
//                   </div>
//                   <button className="ml-2 px-3 py-1 rounded-full border border-white/10 text-white text-sm">Following</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white flex flex-col">
//       <div className="relative">
//         {step >= 0 && step <= 3 && (
//           <div className="h-[180px] sm:h-[220px] bg-gradient-to-r from-pink-700 via-orange-600 to-rose-700 rounded-b-2xl overflow-hidden relative">
//             <button
//               onClick={() => { if (step > 0) onBack(); }}
//               aria-label="Back"
//               className={`absolute left-4 top-4 w-9 h-9 rounded-full flex items-center justify-center z-30 ${step > 0 ? 'bg-black/40 hover:bg-black/50' : 'bg-black/10 opacity-40 pointer-events-none'}`}
//             >
//               <ChevronLeft className="text-white" />
//             </button>
//             <button onClick={onSkip} aria-label="Skip" className="absolute right-4 top-4 text-sm px-3 py-1 rounded-full bg-black/30 z-20">SKIP</button>
//             <Image src={heroSrc} alt="hero" width={240} height={90} className="object-contain absolute left-1/2 top-[82%] -translate-x-1/2 -translate-y-1/2" />
//           </div>
//         )}

//         <div className="px-4 pt-2">
//           <div className="h-2 rounded-full bg-white/10 overflow-hidden">
//             <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-500 transition-all" style={{ width: `${progressPct}%` }} />
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 px-4 pt-6 pb-8">
//         {step === 0 && (
//           <section className={QUESTION_CLASS}>
//             <h2 className="text-xl font-bold mb-2">What brings you here?</h2>
//             <p className="text-sm text-gray-400 mb-4">Choose what you want to see first on your feed.</p>
//             <div className="space-y-3 mb-6">
//               {['Catch Live action', 'Watch highlights & news', 'Follow players & teams', 'Explore everything'].map((opt) => (
//                 <button
//                   key={opt}
//                   type="button"
//                   onClick={() => setPurpose(opt)}
//                   className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border transition-colors duration-150 ${purpose === opt ? 'border-pink-500 bg-gradient-to-r from-pink-900/30 to-orange-900/20' : 'border-white/10 bg-white/3'}`}
//                   tabIndex={0}
//                   aria-pressed={purpose === opt}
//                 >
//                   <div className="flex items-center gap-3 min-w-0 text-left">
//                     <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
//                       <Image src={getImg(opt) || '/images/feed.png'} alt={opt} width={48} height={48} className="object-cover" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-semibold">{opt}</div>
//                     </div>
//                   </div>
//                   <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${purpose === opt ? 'border-pink-500' : 'border-white/20'} bg-white/5 transition-colors duration-150`}>
//                     {purpose === opt && <span className="block w-3 h-3 rounded-full bg-pink-500" />}
//                   </span>
//                 </button>
//               ))}
//             </div>
//               <button
//                 onClick={onNext}
//                 className="w-full rounded-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg"
//               >
//                 Continue
//               </button>
//           </section>
//         )}

//         {step === 1 && (
//           <section className={QUESTION_CLASS}>
//             <div>
//               <h2 className="text-xl font-bold mb-2">Pick what you love</h2>
//               <p className="text-sm text-gray-400 mb-4">Select one or more sports to personalize your feed.</p>
//               <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
//                 <div className="flex flex-wrap gap-3">
//                   {TAGS.map((tag) => {
//                     const active = selectedTags.includes(tag);
//                     return (
//                       <button
//                         key={tag}
//                         onClick={() => toggleTag(tag)}
//                         className={`px-4 py-2 rounded-full border ${active ? 'bg-black border-pink-500 text-pink-300' : 'bg-white/5 border-white/10 text-gray-300'}`}
//                       >
//                         {tag}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={onNext}
//               className="w-full rounded-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg"
//             >
//               Continue
//             </button>
//           </section>
//         )}

//           {step === 2 && (
//             <section className={QUESTION_CLASS}>
//             <h2 className="text-xl font-bold mb-2">How do you like your sports?</h2>
//             <p className="text-sm text-gray-400 mb-4">Pick a primary content style.</p>
//             <div className="space-y-3 mb-6">
//               {['Short & Fast', 'Deep Dives', 'Video First', 'Live Scores'].map((s) => (
//                 <button
//                   key={s}
//                   type="button"
//                   onClick={() => setSportStyle(s)}
//                   className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border transition-colors duration-150 ${sportStyle === s ? 'border-pink-500 bg-gradient-to-r from-pink-900/30 to-orange-900/20' : 'border-white/10 bg-white/3'}`}
//                   tabIndex={0}
//                   aria-pressed={sportStyle === s}
//                 >
//                   <div className="flex items-center gap-3 min-w-0 text-left">
//                     <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
//                       <Image src={getImg(s) || '/images/short.png'} alt={s} width={48} height={48} className="object-cover" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-semibold">{s}</div>
//                       <div className="text-xs text-gray-400">{s === 'Short & Fast' ? 'Scores and quick clips' : s === 'Deep Dives' ? 'Long reads and analysis' : s === 'Video First' ? 'Reels and highlight clips' : 'Scorecards and ball-by-ball updates'}</div>
//                     </div>
//                   </div>
//                   <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${sportStyle === s ? 'border-pink-500' : 'border-white/20'} bg-white/5 transition-colors duration-150`}>
//                     {sportStyle === s && <span className="block w-3 h-3 rounded-full bg-pink-500" />}
//                   </span>
//                 </button>
//               ))}
//             </div>
//             <button
//               onClick={onNext}
//               className="w-full rounded-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg"
//             >
//               Continue
//             </button>
//           </section>
//         )}

//           {step === 3 && (
//             <section className={QUESTION_CLASS}>
//             <h2 className="text-xl font-bold mb-2">Enable notifications & Stay in the loop!</h2>
//             <p className="text-sm text-gray-400 mb-4">Turn on the updates you want to receive.</p>
//             <div className="space-y-3 mb-6">
//               {[
//                 { key: 'live', label: 'Live match alerts' },
//                 { key: 'final', label: 'Final scores' },
//                 { key: 'breaking', label: 'Breaking news' },
//                 { key: 'highlights', label: 'Highlight drops' },
//               ].map((it) => (
//                 <button
//                   key={it.key}
//                   type="button"
//                   onClick={() => setNotif((n) => { const k = it.key as keyof typeof n; return { ...n, [k]: !n[k] }; })}
//                   className="w-full flex items-center justify-between p-4 rounded-2xl border bg-white/3 border-white/10 text-left"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
//                       <Image src={getImg(it.label) || '/images/notification.png'} alt={it.label} width={40} height={40} className="object-cover" />
//                     </div>
//                     <div>{it.label}</div>
//                   </div>
//                   <div className={`h-6 w-11 rounded-full p-0.5 ${notif[it.key as keyof typeof notif] ? 'bg-pink-500' : 'bg-white/10'}`} aria-hidden>
//                     <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${notif[it.key as keyof typeof notif] ? 'translate-x-4' : 'translate-x-0'}`} />
//                   </div>
//                 </button>
//               ))}
//             </div>
//             <button
//               onClick={onNext}
//               className="w-full rounded-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg"
//             >
//               Continue
//             </button>
//           </section>
//         )}

//         {step === 4 && (
//           <section className={`${QUESTION_CLASS} items-center px-6 text-center`}>
//             <div className="w-full max-w-md mx-auto">
//               <Image src={finalHero} alt="celebrate" width={520} height={520} className="object-contain" />
//             </div>
//             <div className="pt-6 w-full">
//               <h2 className="text-2xl font-bold mb-2">Let&apos;s go.</h2>
//               <p className="text-sm text-gray-400 max-w-lg mx-auto mb-6">Your feed is alive. Built for you, by you.</p>
//               <button
//                 onClick={() => window.location.assign('/MainModules/HomePage')}
//                 className="w-full rounded-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg mt-2"
//               >
//                 Continue
//               </button>
//             </div>
//           </section>
//         )}
//       </div>

//       {/* ...existing code... */}
//       {/* ...existing code... */}
//     </div>
//   );
// }








"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Settings2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type PurposeType =
  | "CATCH_LIVE_ACTION"
  | "WATCH_HIGHLIGHTS"
  | "FOLLOW_PLAYERS_TEAMS"
  | "EXPLORE_EVERYTHING";

type ContentStyleType =
  | "SHORT_AND_FAST"
  | "DEEP_DIVES"
  | "VIDEO_FIRST"
  | "LIVE_SCORES";

type NotifKey = "liveMatchAlerts" | "finalScores" | "breakingNews" | "highlightDrops";

// ─── Mappers ──────────────────────────────────────────────────────────────────

const PURPOSE_MAP: Record<string, PurposeType> = {
  "Catch Live action": "CATCH_LIVE_ACTION",
  "Watch highlights & news": "WATCH_HIGHLIGHTS",
  "Follow players & teams": "FOLLOW_PLAYERS_TEAMS",
  "Explore everything": "EXPLORE_EVERYTHING",
};

// Reverse map: API enum → UI label
const PURPOSE_REVERSE: Record<PurposeType, string> = Object.fromEntries(
  Object.entries(PURPOSE_MAP).map(([k, v]) => [v, k])
) as Record<PurposeType, string>;

const CONTENT_STYLE_MAP: Record<string, ContentStyleType> = {
  "Short & Fast": "SHORT_AND_FAST",
  "Deep Dives": "DEEP_DIVES",
  "Video First": "VIDEO_FIRST",
  "Live Scores": "LIVE_SCORES",
};

const CONTENT_STYLE_REVERSE: Record<ContentStyleType, string> = Object.fromEntries(
  Object.entries(CONTENT_STYLE_MAP).map(([k, v]) => [v, k])
) as Record<ContentStyleType, string>;

// ─── Constants ────────────────────────────────────────────────────────────────

const SPORTS_TAGS = [
  "Cricket", "Football", "Athletics", "Kabaddi",
  "Badminton", "Tennis", "Arm Wrestling", "Squash",
];

const IMG_MAP: Record<string, string> = {
  "Catch Live action": "catch.png",
  "Watch highlights & news": "watch highlights.png",
  "Follow players & teams": "follow players.png",
  "Explore everything": "explore everything.png",
  "Short & Fast": "short.png",
  "Deep Dives": "deep.png",
  "Video First": "catch.png",
  "Live Scores": "Live scores.png",
  "Live match alerts": "live match.png",
  "Final scores": "final scores.png",
  "Breaking news": "breaking news.png",
  "Highlight drops": "highlights drops.png",
};

const CONTENT_STYLE_DESC: Record<string, string> = {
  "Short & Fast": "Scores and quick clips",
  "Deep Dives": "Long reads and analysis",
  "Video First": "Reels and highlight clips",
  "Live Scores": "Scorecards and ball-by-ball updates",
};

const NOTIFICATION_ITEMS = [
  { key: "liveMatchAlerts" as NotifKey, label: "Live match alerts" },
  { key: "finalScores" as NotifKey, label: "Final scores" },
  { key: "breakingNews" as NotifKey, label: "Breaking news" },
  { key: "highlightDrops" as NotifKey, label: "Highlight drops" },
];

const getImg = (label: string) => {
  const f = IMG_MAP[label];
  return f ? `/images/${encodeURIComponent(f)}` : "/images/feed.png";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function RadioOption({
  label, selected, onSelect, subtitle,
}: {
  label: string; selected: boolean; onSelect: () => void; subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border transition-colors duration-150 ${
        selected
          ? "border-pink-500 bg-gradient-to-r from-pink-900/30 to-orange-900/20"
          : "border-white/10 bg-white/3 hover:bg-white/6"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 text-left">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={getImg(label)} alt={label} width={48} height={48} className="object-cover" />
        </div>
        <div>
          <div className="text-sm font-semibold">{label}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 ${selected ? "border-pink-500" : "border-white/20"} bg-white/5`}>
        {selected && <span className="block w-3 h-3 rounded-full bg-pink-500" />}
      </span>
    </button>
  );
}

function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className="w-full flex items-center justify-between p-4 rounded-2xl border bg-white/3 border-white/10 text-left hover:bg-white/6 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={getImg(label)} alt={label} width={40} height={40} className="object-cover" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-200 ${enabled ? "bg-pink-500" : "bg-white/10"}`} aria-hidden>
        <span className={`block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
      </div>
    </button>
  );
}

function ContinueButton({ onClick, disabled, loading, label = "Continue" }: {
  onClick: () => void; disabled?: boolean; loading?: boolean; label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full rounded-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Saving...
        </span>
      ) : label}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse" />
      <div className="h-4 w-40 rounded-full bg-white/5 animate-pulse" />
      <div className="h-3 w-28 rounded-full bg-white/5 animate-pulse" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PreferencesOnboarding() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // "checking"  → fetching existing prefs from API (show skeleton)
  // "new"       → no prefs found → show onboarding splash first
  // "returning" → prefs found → jump straight into edit flow
  const [initState, setInitState] = useState<"checking" | "new" | "returning">("checking");

  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"featured" | "following">("featured");
  const [started, setStarted] = useState(false); // splash "Complete Now" gate for new users

  // ── Preference state ──
  const [purpose, setPurpose] = useState<string>("Catch Live action");
  const [selectedSports, setSelectedSports] = useState<string[]>(["Cricket"]);
  const [contentStyle, setContentStyle] = useState<string>("Short & Fast");
  const [notifications, setNotifications] = useState<Record<NotifKey, boolean>>({
    liveMatchAlerts: true,
    finalScores: true,
    breakingNews: true,
    highlightDrops: true,
  });
// done
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── On mount: check if the user already has saved preferences ──────────────
  useEffect(() => {
    if (authLoading) return;

    if (!user?.userId) {
      setInitState("new");
      return;
    }

    const checkExisting = async () => {
      try {
        const res = await fetch(`/api/preferences?userId=${user.userId}`);

        if (res.status === 404) {
          setInitState("new");
          return;
        }

        if (!res.ok) {
          // Server error — don't block, fall through to new flow
          setInitState("new");
          return;
        }

        const { preferences: prefs } = await res.json();

        // Pre-fill form with stored values
        if (prefs.purpose && PURPOSE_REVERSE[prefs.purpose as PurposeType]) {
          setPurpose(PURPOSE_REVERSE[prefs.purpose as PurposeType]);
        }
        if (Array.isArray(prefs.sports) && prefs.sports.length > 0) {
          setSelectedSports(prefs.sports);
        }
        if (prefs.contentStyle && CONTENT_STYLE_REVERSE[prefs.contentStyle as ContentStyleType]) {
          setContentStyle(CONTENT_STYLE_REVERSE[prefs.contentStyle as ContentStyleType]);
        }
        if (prefs.notifications) {
          setNotifications((prev) => ({ ...prev, ...prefs.notifications }));
        }

        setInitState("returning");
      } catch {
        setInitState("new"); // network failure — treat as new
      }
    };

    checkExisting();
  }, [authLoading, user?.userId]);

  const TOTAL_STEPS = 5;
  const progressPct = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  const toggleSport = useCallback((tag: string) => {
    setSelectedSports((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const toggleNotif = useCallback((key: NotifKey) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const onSkip = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const onBack = () => setStep((s) => Math.max(0, s - 1));

  // ── Submit ────────────────────────────────────────────────────────────────
  const submitPreferences = useCallback(async () => {
    if (!user?.userId) {
      setApiError("You must be logged in to save preferences.");
      return;
    }

    setSubmitting(true);
    setApiError(null);

    const payload = {
      userId: user.userId,
      purpose: PURPOSE_MAP[purpose],
      sports: selectedSports,
      contentStyle: CONTENT_STYLE_MAP[contentStyle],
      notifications,
    };

    try {
      if (initState === "returning") {
        // Always PUT for returning users
        const res = await fetch("/api/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Failed to update preferences");
        }
      } else {
        // POST first, fallback to PUT on 409
        const postRes = await fetch("/api/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (postRes.status === 409) {
          const putRes = await fetch("/api/preferences", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!putRes.ok) {
            const d = await putRes.json();
            throw new Error(d.error || "Failed to update preferences");
          }
        } else if (!postRes.ok) {
          const d = await postRes.json();
          throw new Error(d.error || "Failed to save preferences");
        }
      }

      setStep(4);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }, [user, purpose, selectedSports, contentStyle, notifications, initState]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (authLoading || initState === "checking") return <LoadingSkeleton />;

  // New user — show splash before starting
  if (initState === "new" && !started) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-xl mt-4 rounded-2xl border border-white/10 bg-[#111] p-4 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/images/dolly%201.png" alt="dolly" width={80} height={80} className="object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-300 mb-2">Don&apos;t leave me hanging...</p>
            <p className="text-base font-semibold mb-4">Complete your profile setup to get the full experience.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setStarted(true)}
                className="flex-1 rounded-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold text-sm"
              >
                Complete Now
              </button>
              <a href="/MainModules/HomePage" className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-white/10 text-sm">
                Skip
              </a>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xl mt-6">
          <div className="rounded-2xl border border-white/6 p-3 bg-white/3 text-sm text-gray-300">
            You can always change these preferences later in Settings.
          </div>
          <div className="mt-4 flex gap-3">
            {(["featured", "following"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full capitalize ${activeTab === tab ? "bg-white text-black" : "border border-white/10 text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <div className="p-3 rounded-2xl bg-white/3 border border-white/8 flex items-start gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image src="/images/dolly%201.png" alt="avatar" width={48} height={48} className="object-cover" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">{activeTab === "featured" ? "Virat Kohli" : "You"}</div>
                <div className="text-xs text-gray-400">{activeTab === "featured" ? "12m ago" : "Just now"}</div>
                <div className="mt-2 text-sm text-gray-300">{activeTab === "featured" ? "Let's go!!" : "Welcome back to your feed."}</div>
              </div>
              <button className={`ml-2 px-3 py-1 rounded-full text-sm ${activeTab === "featured" ? "bg-white text-black" : "border border-white/10 text-white"}`}>
                {activeTab === "featured" ? "Follow" : "Following"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Shared step UI ────────────────────────────────────────────────────────
  const CARD_CLASS = "flex flex-col justify-between min-h-[260px]";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Returning user: compact "Edit Preferences" header */}
      {initState === "returning" && step <= 3 && (
        <div className="flex items-center gap-3 px-4 pt-6 pb-2">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-pink-400" />
            <h1 className="text-base font-semibold">Edit Preferences</h1>
          </div>
        </div>
      )}

      {/* New user: full onboarding hero + progress bar */}
      {initState === "new" && step <= 3 && (
        <div className="relative">
          <div className="h-[180px] sm:h-[220px] bg-gradient-to-r from-pink-700 via-orange-600 to-rose-700 rounded-b-2xl overflow-hidden relative">
            <button
              onClick={() => step > 0 && onBack()}
              aria-label="Back"
              className={`absolute left-4 top-4 w-9 h-9 rounded-full flex items-center justify-center z-30 ${step > 0 ? "bg-black/40 hover:bg-black/50" : "bg-black/10 opacity-40 pointer-events-none"}`}
            >
              <ChevronLeft className="text-white" />
            </button>
            <button onClick={onSkip} aria-label="Skip" className="absolute right-4 top-4 text-sm px-3 py-1 rounded-full bg-black/30 z-20">
              SKIP
            </button>
            <Image src="/images/Dolly%202.png" alt="hero" width={240} height={90} className="object-contain absolute left-1/2 top-[82%] -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="px-4 pt-2">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Returning user: step tab pills for quick jumping */}
      {initState === "returning" && step <= 3 && (
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
          {["Purpose", "Sports", "Style", "Notifications"].map((label, i) => (
            <button
              key={label}
              onClick={() => setStep(i)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                step === i
                  ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 px-4 pt-4 pb-8">

        {/* Step 0: Purpose */}
        {step === 0 && (
          <section className={CARD_CLASS}>
            <div>
              <h2 className="text-xl font-bold mb-1">What brings you here?</h2>
              <p className="text-sm text-gray-400 mb-4">Choose what you want to see first on your feed.</p>
              <div className="space-y-3 mb-6">
                {Object.keys(PURPOSE_MAP).map((opt) => (
                  <RadioOption key={opt} label={opt} selected={purpose === opt} onSelect={() => setPurpose(opt)} />
                ))}
              </div>
            </div>
            <ContinueButton onClick={() => setStep(1)} />
          </section>
        )}

        {/* Step 1: Sports */}
        {step === 1 && (
          <section className={CARD_CLASS}>
            <div>
              <h2 className="text-xl font-bold mb-1">Pick what you love</h2>
              <p className="text-sm text-gray-400 mb-4">Select one or more sports to personalise your feed.</p>
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                <div className="flex flex-wrap gap-3">
                  {SPORTS_TAGS.map((tag) => {
                    const active = selectedSports.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleSport(tag)}
                        className={`px-4 py-2 rounded-full border text-sm transition-colors ${active ? "bg-black border-pink-500 text-pink-300" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <ContinueButton onClick={() => setStep(2)} disabled={selectedSports.length === 0} />
          </section>
        )}

        {/* Step 2: Content style */}
        {step === 2 && (
          <section className={CARD_CLASS}>
            <div>
              <h2 className="text-xl font-bold mb-1">How do you like your sports?</h2>
              <p className="text-sm text-gray-400 mb-4">Pick a primary content style.</p>
              <div className="space-y-3 mb-6">
                {Object.keys(CONTENT_STYLE_MAP).map((s) => (
                  <RadioOption key={s} label={s} subtitle={CONTENT_STYLE_DESC[s]} selected={contentStyle === s} onSelect={() => setContentStyle(s)} />
                ))}
              </div>
            </div>
            <ContinueButton onClick={() => setStep(3)} />
          </section>
        )}

        {/* Step 3: Notifications + submit */}
        {step === 3 && (
          <section className={CARD_CLASS}>
            <div>
              <h2 className="text-xl font-bold mb-1">Enable notifications & Stay in the loop!</h2>
              <p className="text-sm text-gray-400 mb-4">Turn on the updates you want to receive.</p>
              <div className="space-y-3 mb-6">
                {NOTIFICATION_ITEMS.map((it) => (
                  <Toggle key={it.key} label={it.label} enabled={notifications[it.key]} onToggle={() => toggleNotif(it.key)} />
                ))}
              </div>
              {apiError && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                  {apiError}
                </div>
              )}
            </div>
            <ContinueButton
              onClick={submitPreferences}
              loading={submitting}
              disabled={submitting}
              label={initState === "returning" ? "Save Changes" : "Continue"}
            />
          </section>
        )}

        {/* Step 4: Celebration / confirmation */}
        {step === 4 && (
          <section className="flex flex-col items-center text-center px-6">
            <div className="w-full max-w-md mx-auto">
              <Image src="/images/dolly3.png" alt="celebrate" width={520} height={520} className="object-contain" />
            </div>
            <div className="pt-6 w-full">
              <h2 className="text-2xl font-bold mb-2">
                {initState === "returning" ? "All updated!" : "Let's go."}
              </h2>
              <p className="text-sm text-gray-400 max-w-lg mx-auto mb-6">
                {initState === "returning"
                  ? "Your preferences have been saved. Your feed will reflect the changes."
                  : "Your feed is alive. Built for you, by you."}
              </p>
              <button
                onClick={() => router.push("/MainModules/HomePage")}
                className="w-full rounded-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold shadow-lg"
              >
                {initState === "returning" ? "Back to Feed" : "Continue"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}